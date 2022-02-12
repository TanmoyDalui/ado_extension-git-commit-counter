VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "Charts/Services"], 
    function (WidgetHelpers, ChartServices) {
        WidgetHelpers.IncludeWidgetStyles();

        VSS.register("GitCommitCounterWidget", function () {    
             
            var backgroundColor;
            var userId;
            var password;
            var duration = 1;
            var topRepo = 5;
            var statDuration;
            
            var getCount = function (widgetSettings) {
                
                // Load the settings
                var settings = JSON.parse(widgetSettings.customSettings.data);

                if(settings) {
                    backgroundColor = settings.backgroundColor;
                    $("#widgetBody").css("background", backgroundColor);

                    // assign user id from settings
                    userId = settings.userId;
                    // assign password from settings
                    password = settings.password;

                    duration = settings.duration;

                    topRepo = settings.topRepo;

                    statDuration = settings.statDuration;
                    $("#statDuration").text(statDuration);
                }

                getCommitCount(ChartServices, userId, password, duration, topRepo);
                
                return WidgetHelpers.WidgetStatusHelper.Success();
                
            }

            return {
                load: function (widgetSettings) {
                    // Set widget title
                    var $title = $("#innerTitle");
                    $title.text(widgetSettings.name);
                    
                    //showLoading();
                    if(JSON.parse(widgetSettings.customSettings.data))
                        return getCount(widgetSettings);
                    else
                        return WidgetHelpers.WidgetStatusHelper.Success();
                },
                reload: function (widgetSettings) {
                    // Set widget title
                    var $title = $("#innerTitle");
                    $title.text(widgetSettings.name);

                    //showLoading();
                    if(JSON.parse(widgetSettings.customSettings.data))
                        return getCount(widgetSettings);
                    else
                        return WidgetHelpers.WidgetStatusHelper.Success();
                }
            }
        });
        VSS.notifyLoadSucceeded();
});


function getColumnColors(topCommits, commitMap){
    var customColors = [];
    for(i=0; i<topCommits.length; i++){
        var d = 256/topCommits.length;
        var customColor = {};
        customColor["value"] = commitMap.get(topCommits[i]);
        customColor["backgroundColor"] = "rgb(36, " + ((15 + i*d)%256) + "," + ((255 - i*d)%256) + ")";
        customColors.push(customColor);
    }
    return customColors;
}


function getLabels(topCommits, commitMap){
    var lables = [];
    for(i=0; i<topCommits.length; i++){
        lables.push(commitMap.get(topCommits[i]));
    }
    return lables;
}


function displayChart(ChartServices, topCommits, commitMap, topRepo){
    //console.log("Inside displayChart()");
    $("#chart-title").text("Top " + topRepo + " active repositories");
    // Create the chart
    ChartServices.ChartsService.getService().then(function(chartService){
        var $container = $('#Chart-Container');
        var chartOptions = { 
            "title": "Top 5 active repositories",
            "hostOptions": { 
                "height": "160", 
                "width": "300"
            },
            "colorCustomizationOptions": {
                "customColors": getColumnColors(topCommits, commitMap) /*[
                    {backgroundColor: "#047BFB", value: commitMap.get(topCommits[0])},
                    {backgroundColor: "#049CFB", value: commitMap.get(topCommits[1])},
                    {backgroundColor: "#04BDFB", value: commitMap.get(topCommits[2])},
                    {backgroundColor: "#04DEFB", value: commitMap.get(topCommits[3])},
                    {backgroundColor: "#04FFFB", value: commitMap.get(topCommits[4])}
                ]*/
            },
            "chartType": "column",
            "series": [{
                "data": topCommits
            }],
            "xAxis": { 
                "labelsEnabled": false,
                "max" : topCommits[0],
                "labelValues": getLabels(topCommits, commitMap) //[commitMap.get(topCommits[0]), commitMap.get(topCommits[1]), commitMap.get(topCommits[2]), commitMap.get(topCommits[3]), commitMap.get(topCommits[4])] 
            },
            "specializedOptions": {
                "showLabels": "true",
                "size": 220
            } 
        };
        $container.html("");
        chartService.createChart($container, chartOptions);
    });
}


function showLoading(){
    var $container = $('#gitCommitCount');
    $container.html('<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"><img src="img/loading-2.gif" width="75" height="75" /></div>');
}
