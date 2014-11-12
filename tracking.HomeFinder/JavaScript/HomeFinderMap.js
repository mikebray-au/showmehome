var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var markerArray = [];
var address;

function loadPage() {
    checkCookie();

    var addressField = $("#address");

    addressField.keyup(function(e) {
        if (e.keyCode == 13) {
            updateCookie();
        }
    });

    $('#mode').ddslick(
    {
        onSelected: initialize
    });
}

function initialize() {


    checkCookie();

    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService();

    var styles = [
         {
             featureType: "all",
             stylers: [
               { saturation: -80 }
             ]
         }, {
             featureType: "road.arterial",
             elementType: "geometry",
             stylers: [
               { hue: "#00ffee" },
               { saturation: 50 }
             ]
         }, {
             featureType: "poi.business",
             elementType: "labels",
             stylers: [
               { visibility: "off" }
             ]
         }
    ];

    var mapOptions =
        {
            zoom: 16,
            zoomControl: false,
            panControl: false,
            streetViewControl: false,
            mapTypeControl: false
        };

    // Create a map and center.
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition
            (
                function (position)
                {
                    pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    //var infowindow = new google.maps.InfoWindow({
                    //    map: map,
                    //    position: pos,
                    //    content: 'Current'
                    //});

                    map.setCenter(pos);

                    calcRoute(pos, address);
                },
                function ()
                {
                    handleNoGeolocation(true);
                }
            );
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    map.setOptions({ styles: styles });

    // Instantiate an info window to hold step text.
    stepDisplay = new google.maps.InfoWindow();

    // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: map
    }

    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

    // Instantiate an info window to hold step text.
    stepDisplay = new google.maps.InfoWindow();

    
}


function calcRoute(pos, address) {
    var start = pos;
    var end = address;

    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }

    // Now, clear the array itself.
    markerArray = [];

    var selectedMode = $('#mode').data('ddslick');

    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[selectedMode.selectedData.value]
    };

    // Route the directions and pass the response to a
    // function to create markers for each step.
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var warnings = document.getElementById('warnings_panel');
            warnings.innerHTML = '<b>' + response.routes[0].warnings + '</b>';
            directionsDisplay.setDirections(response);
            showSteps(response);
        }
    });
}

function showSteps(directionResult) {
    // For each step, place a marker, and add the text to the marker's
    // info window. Also attach the marker to an array so we
    // can keep track of it and remove it when calculating new
    // routes.
    var myRoute = directionResult.routes[0].legs[0];

    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = new google.maps.Marker({
            position: myRoute.steps[i].start_location,
            map: map
        });
        attachInstructionText(marker, myRoute.steps[i].instructions);
        markerArray[i] = marker;
    }
}

function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function () {
        // Open an info window when the marker is clicked on,
        // containing the text of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

function updateCookie() {
    var address = document.getElementById("address").value;

    setCookie("HomeFinder", address, 365);

    initialize();
}

function showSettings() {
    //alert("showing settings");
    $("#map_canvas").hide();
    $("#user_info").show();
    $("#address").focus();
}

function toggleSettings() {
    $("#map_canvas").toggle("swing");
    $("#user_info").toggle("swing");
    $("#address").focus();
}

function hideSettings() {
    //alert("hiding settings");
    $("#map_canvas").show();
    $("#user_info").hide();
}
function checkCookie() {
    var homeFinderCookie = getCookie("HomeFinder");

    if (homeFinderCookie != "") {
        address = homeFinderCookie;
        hideSettings();
    }
    else {
        showSettings();
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function () { loadPage(); })