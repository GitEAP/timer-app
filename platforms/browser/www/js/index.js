var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        // app.receivedEvent('deviceready');

        var platform = device.platform; //device platform
        var model = device.model; // device nam
        var versionType = device.version;//android os version
        var myDevice = model +" "+ platform +" "+ versionType;

        var currentTimer = {
            name: "",
            minutes: 0,
            seconds: 0,
            device: myDevice
        };

// ------------------------------------------------------------------------------------------
// Database
// ------------------------------------------------------------------------------------------
            // $( "#timersList" ).on( "pagebeforeshow", "#viewPage", function() { 
                 // $('#timersList').listview('refresh');
            // connect to DB and display items
            // timerDB.open(refreshTimers);
                 // } );

            timerDB.open(refreshTimers);
          
            // $('#viewPage').bind('pageinit', function() {
            //   timerDB.open(refreshTimers);
            //   // $('#timersList').listview('refresh');
            // });
         

        // Update the list of items.
        function refreshTimers() {  
          timerDB.fetchItems(function(timers) {
            $("#timersList").empty();
    
            if (timers.length == 0) {
                var h3 = $('<h3 />').text("You do not have any timers saved.");
                $("#timersList").append(h3);
            } else {
                var liHeader = $('<li />').attr("data-role", "list-divider").text("All Timers");
                $("#timersList").append(liHeader);
            }

            for(var i = 0; i < timers.length; i++) {
              // Read the items backwards (most recent first).
              var timerItem = timers[(timers.length - 1 - i)];

                var mySeconds = timerItem.seconds;
                if (mySeconds == 0){mySeconds="00"}

                // Create elements and display on DOM
                var li = $('<li />').attr("data-id",timerItem.timestamp);
                var h2 = $('<h2 />').text(timerItem.name);
                var p = $("<p />").html("<strong>Time of timer:</strong>");
                var p2 = $("<p />").attr({"data-minutes" : timerItem.minutes, "data-seconds": timerItem.seconds}).html(timerItem.minutes + ":" + mySeconds);
                var p3 = $("<p />", {class: "ui-li-aside"}).attr("data-device", timerItem.device).text("Saved on " + timerItem.device);
                var btn1 = $("<button />",{class: "ui-btn ui-btn-inline ui-mini rightBtn deleteBtn"}).text("Delete");
                var btn2 = $("<button />",{class: "ui-btn ui-btn-inline ui-mini rightBtn"}).text("Use");
                

                li.append(h2).append(p).append(p2).append(p3).append(btn1).append(btn2);
                $('#timersList').append(li);
                // refresh list
                $("#timersList").listview("refresh");


                //event listener for buttons
                li.on("tap", "button", function(event){
                    event.stopPropagation();
                    
                    // check which button was clicked
                    switch($(this).text().toLowerCase()) {
                        case "Use":
                        case "use":
                            currentTimer.name = $(this).parent().find("h2").text();
                            currentTimer.minutes = $(this).parent().find("[data-minutes]").attr("data-minutes");
                            currentTimer.seconds = $(this).parent().find("[data-seconds]").attr("data-seconds");
                            currentTimer.device = $(this).parent().find("[data-device]").attr("data-device");
                            currentTimer.timestamp = $(this).parent().attr("data-id");
                            // go to timer page
                            $(':mobile-pagecontainer').pagecontainer('change', '#timerPage');
                            displayResults();
                        break;

                        case "Delete":
                        case "delete":
                            console.log("clicked delete");
                            var id = $(this).parent().attr("data-id");
                            $("#popupDelete").popup("open");
                            timerDB.deleteTimer(id, refreshTimers);
                        break;
                    }
                });//end of event listener
            }//end of for loop
          });//end of fetch items
        }//end of function

// ------------------------------------------------------------------------------------------
// Timer
// ------------------------------------------------------------------------------------------
        $(".tab-timer").hide();
        $("#timerStopBtn").hide();
        $("#timerResetBtn").hide();

        /*
        * function creates timer when submit form
        */
        var totalSeconds = parseInt(0);

        $("#submitTimerForm").click(function(e){
            e.preventDefault();
            // get values
            currentTimer.name = $('#timerName').val();
            currentTimer.minutes = parseInt($('#minuteSlider').val());
            currentTimer.seconds = parseInt($('#secondsSlider').val()); 
            totalSeconds = parseInt((currentTimer.minutes * 60) + currentTimer.seconds);

            displayResults();
        });

        function displayResults() {
            //show timer
            $(".tab-timer").show();
            //hide form
            $('.tab-timerForm').hide();

            //display results
            $('#timeResult').html(getTimeLabel(currentTimer.minutes, currentTimer.seconds));
            $(".tab-timer h2").html(currentTimer.name);
            //show save button
            $("#timerSaveBtn").show();
        }

        /*
        * function starts timer when start button clicked
        */
        var x;
        $("#timerStartBtn").click(function(e){
            //hide start button and show stop button
            $(this).hide();
            $("#timerStopBtn").show();

            x = setInterval(function(){
                if (totalSeconds <= 0) {
                    //stop
                    clearInterval(x);
                    navigator.vibrate([500,500,1000]);
                    navigator.notification.beep(2);
                } else {
                    totalSeconds--;
                    currentTimer.minutes = parseInt(totalSeconds / 60);
                    currentTimer.seconds = parseInt(totalSeconds % 60);
                }
                //display results
                $('#timeResult').html(getTimeLabel(currentTimer.minutes, currentTimer.seconds));
            }, 1000);
        });

        /*
        * function stops timer when stop button clicked
        */
        $("#timerStopBtn").click(function(){
            //show start button
            $("#timerStartBtn").show();
            $("#timerResetBtn").show();
            //hide stop button
            $(this).hide();
            // stop timer
            clearInterval(x);
        });

        /*
        * function stops timer when reset button clicked and returns to form
        */
        $("#timerResetBtn").click(function(){
            // go back to form
            $(".tab-timerForm").show();
            // reset input fields
            $("#timerName").val("");
            $('#minuteSlider').val(1).slider('refresh');
            $('#secondsSlider').val(30).slider('refresh');
            // hide timer
            $(".tab-timer").hide();
            $(this).hide();
        });

        /*
        * saves current timer when save button is clicked
        */
        $("#timerSaveBtn").click(function(){
            // addTimeToDB(currentTimer.name, currentTimer.minutes, currentTimer.seconds, "iPhone XS");
            // save item to DB
            timerDB.createTimer(currentTimer.name, currentTimer.minutes, currentTimer.seconds, currentTimer.device, function(timers) {
              refreshTimers();
            });
            // give feedback to user
            $("#popupSave").popup("open");
            navigator.vibrate(1000);
            $(this).hide();
        });


// ------------------------------------------------------------------------------------------
// Stop Watch
// ------------------------------------------------------------------------------------------
        var y;
        var swTotalSeconds = parseInt(0);
        var swMinutes = parseInt(0);
        var swSeconds = parseInt(0);

        $("#sw-PauseBtn").hide();
        $("#sw-ResetBtn").hide();

        // start stop watch
        $("#sw-StartBtn").click(function(){
            $(this).hide();
            $("#sw-PauseBtn").show();
            $("#sw-ResetBtn").hide();

            swTotalSeconds = parseInt(0);
            swMinutes = parseInt(0);
            swSeconds = parseInt(0);

            y = setInterval(function(){
                swTotalSeconds++;
                swMinutes = parseInt(swTotalSeconds / 60);
                swSeconds = parseInt(swTotalSeconds % 60);
           
                //display results
                 $('#sw-timeResult').html(getTimeLabel(swMinutes, swSeconds));

            }, 1000);
        });

        $("#sw-PauseBtn").click(function(){
            $("#sw-StartBtn").show();
            $("#sw-ResetBtn").show();
            $(this).hide();
            clearInterval(y);
            navigator.vibrate([1000,1000,1000]);
            navigator.notification.beep(2);
        });

        $("#sw-ResetBtn").click(function(){
            $(this).hide();
            $("#sw-PauseBtn").hide();
            swTotalSeconds = parseInt(0);
            swMinutes = parseInt(0);
            swSeconds = parseInt(0);
            $('#sw-timeResult').html(getTimeLabel(swMinutes, swSeconds));
        });

    },//end of on device ready

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        // console.log('Received Event: ' + id);
    },
};


function getTimeLabel(minutes, seconds) {
    var resultString = "";

    if (minutes.toString().length == 1) {
        resultString = "0" + minutes;
    }
    else {
        resultString = minutes;
    }    

    if (seconds.toString().length == 1) {
        resultString = resultString + ":0" + seconds;
    }
    else {
        resultString = resultString + ":" + seconds;
    }



    return resultString
}


