VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers"], 
    function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();

        VSS.register("GitCommitCounterWidget", function () {    
             
            var backgroundColor;
            var userId;
            var password;
            var duration = 1;
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

                    statDuration = settings.statDuration;
                    $("#statDuration").text(statDuration);
                }

                getCommitCount(userId, password, duration);
                
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

function showLoading(){
    var $container = $('#gitCommitCount');
    $container.html('<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"><img src="img/loading-2.gif" width="75" height="75" /></div>');
}
