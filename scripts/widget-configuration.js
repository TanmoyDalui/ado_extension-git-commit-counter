var backgroundColor;
var $userId;
var $password;
var durationDropdown;
var statDuration = "During last 1 day(s)";

VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require("TFS/Dashboards/WidgetHelpers", 
    function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("GitCommitCounterWidget.Configuration", function () {  

            $backgroundColor = $("#backgroundColor");
            $userId = $("#user-id");
            $password = $("#password");
            $durationDropdown = $("#duration-dropdown");

            return {
                load: function (widgetSettings, widgetConfigurationContext) {
                    var settings = JSON.parse(widgetSettings.customSettings.data);
                    
                    // Load stored settings data
                    if (settings) {
                        //console.log("inside if condition: " + settings.allCollection);
                        if (settings.backgroundColor){
                            $backgroundColor.val(settings.backgroundColor);
                        }
                        if (settings.userId){
                            $userId.val(settings.userId);
                        }
                        if (settings.password){
                            $password.val(settings.password);
                        }
                        if (settings.duration){
                            $durationDropdown.val(settings.duration);
                        }
                    }

                    $backgroundColor.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $userId.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $password.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    $durationDropdown.on("change", function (){ 
                        fieldChangedEvent(WidgetHelpers, widgetConfigurationContext);
                    });

                    return WidgetHelpers.WidgetStatusHelper.Success();
                },
                onSave: function() {
                    var customSettings = {data: JSON.stringify({
                        backgroundColor: $backgroundColor.val(),
                        userId: $userId.val(),
                        password: $password.val(),
                        duration: $durationDropdown.val(),
                        statDuration: statDuration
                    })};
                    return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings); 
                }
            }
        });
        VSS.notifyLoadSucceeded();
});



// Event fired for each of the field change and then refresh
function fieldChangedEvent(WidgetHelpers, widgetConfigurationContext){

    statDuration = "During last " + $durationDropdown.val() + " day(s)";
    var customSettings = {data: JSON.stringify({
        backgroundColor: $backgroundColor.val(),
        userId: $userId.val(),
        password: $password.val(),
        duration: $durationDropdown.val(),
        statDuration: statDuration
    })};


    if( $userId.val() && $password.val() ){
        notifyConfiguration(WidgetHelpers, widgetConfigurationContext, customSettings);
    }
}


function notifyConfiguration(WidgetHelpers, widgetConfigurationContext, customSettings){
    var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
    var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
    widgetConfigurationContext.notify(eventName, eventArgs);
}