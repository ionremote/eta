//map.js

//Set up some of our variables.
var map = ""; //Will contain map object.
var marker = false; ////Has the user plotted their location marker? 
var UserLocationsName;  // array for location label;
var UserLocationsGPS;  // array for lat,lng
var UserTimeETA;
var UserTimeREF;
var UserAPIKey;
var UserOrigin;
var UserFontSize = 20;
var UserClickGPS;
var JSON_Locations = "";
const MAX_BUTTONS = 6;

//Function called to initialize / create the map.
//This is called when the page has loaded.
function initMap() {
    // get current position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            UserOrigin =  pos;
            console.log("Current Location: " + JSON.stringify(UserOrigin));
            getETA(0);
            
        }, function() {
            console.log("handleLocationError");
        });
    } else {
        // Browser doesn't support Geolocation
        console.log("handleLocationError");
    }
} // initMap

function createMap(){
    if (map!="") return;
    
    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(52.357971, -6.516758);

    //Map options.
    var options = {
        center: centerOfMap, //Set center.
        zoom: 13 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);

    // zoom in to current position
    infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(UserOrigin);
    infoWindow.setContent('You are here.');
    infoWindow.open(map);
    map.setCenter(UserOrigin);

    //getTimeToDestinations(UserOrigin,UserLocationsGPS);    // Try HTML5 geolocation.

    //Listen for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        //Get the location that the user clicked.
        var clickedLocation = event.latLng;
        //If the marker hasn't been added.
        if (marker === false) {
            //Create the marker.
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                clickableIcons: false,
                draggable: true //make it draggable
            });
            //Listen for drag events!
            google.maps.event.addListener(marker, 'dragend', function(event) {
                markerLocation();
            });
        } else {
            //Marker has already been added, so just change its location.
            marker.setPosition(clickedLocation);
        }
        //Get the marker's location.
        markerLocation();
    });
} // createMap

//This function will get the marker's current location and then add the lat/long
//values to our textfields so that we can save the location.
function markerLocation() {
    //Get location.
    var currentLocation = marker.getPosition();
    //Add lat and lng values to a field that we can save.
    UserClickGPS = currentLocation.lat()+","+currentLocation.lng();
}

// ------------------------- START OF SCRIPT -----------------------------
function onClickButton(destination) {
    var url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + destination;
    console.log(url);
    window.open(url,'_top');
} //onClickButton

function onClickSave() {
    //var newLocation = document.getElementById("lat").value + "," + document.getElementById("lng").value;
    //console.log("New Location: " + newLocation);
    UserAPIKey = document.getElementById("key").value;
    saveNewLocation(document.getElementById('label').value, UserClickGPS);
    saveLocalStorageData();
} //onClickSave

function createButtons(jsonLocations) {
    console.log("createButtons");
    
    const arrLocations = jsonLocations; //JSON.parse(jsonLocations);
    var buttonContainer = document.getElementById('divButtons');
    buttonContainer.innerHTML = "";
    
    for (const [key, value] of Object.entries(arrLocations)) {
        console.log(key + "=" + value);
        var newbutton = document.createElement('button');
        newbutton.className = 'button';
        newbutton.innerHTML = '<b>' + value + '</b>';
        newbutton.id = "idLocation" + key;
        newbutton.setAttribute('data-long-press-delay', 1000);
        newbutton.style.fontSize = parseInt(UserFontSize) + "px";
        //MUST USE LET for local scope
        let coord = UserLocationsGPS[key];
        newbutton.onclick = function() {
            onClickButton(coord.lat + "," + coord.lng);
            console.log(coord.lat + "," + coord.lng);
        }
        newbutton.addEventListener('long-press', function(e) {
            // do something
            onLongPress(key);
        });
        buttonContainer.appendChild(newbutton);
    }

    // show the Add New Location Button 
    /*if (arrLocations.length<MAX_BUTTONS){
        var newbutton = document.createElement('button');
        newbutton.className = 'button';        
        newbutton.innerHTML = '<b>Add New Location</b>';
        newbutton.onclick = function() {
            selectLocation();
        }
        buttonContainer.appendChild(newbutton);
    }*/
} //createLocationButtons

function onLongPress(itemIndex){
    console.log("onLongPress " + itemIndex);
    removeLocation(itemIndex);
} // onLongPress

function saveAPIKey(){
    UserAPIKey = document.getElementById("key").value;
    localStorage.setItem("eta.googlemapkey", UserAPIKey);
    alert("API Key Saved");
}

function saveLocalStorageData() {
    localStorage.setItem("eta.locations", JSON.stringify(JSON_Locations));
    localStorage.setItem("eta.fontSize", UserFontSize);
    //console.log("Save KEY " + UserAPIKey);
} //saveLocalStorageData

function readLocalStorageData() {
    UserAPIKey = localStorage.getItem("eta.googlemapkey");
    if (UserAPIKey != null){
        document.getElementById('key').value = UserAPIKey;
    }
    //console.log('READ KEY ' + UserAPIKey);
    UserLocationsName = [];
    UserLocationsGPS = [];
    UserTimeETA = [];

    UserFontSize = localStorage.getItem("eta.fontSize");
    if (UserFontSize === null){
        UserFontSize = 18;
    }

    JSON_Locations = JSON.parse(localStorage.getItem("eta.locations"));

    if (JSON_Locations!=null){
        var localData = JSON_Locations;
        for (const [key, value] of Object.entries(localData)) {
            UserLocationsName.push(key);
            var coord={
                lat:parseFloat(value.split(',')[0]),
                lng:parseFloat(value.split(',')[1])
            }
            UserLocationsGPS.push(coord);

            console.log(key + "=" + value);
        }
    }
    else{
        console.log("NO SAVE LOCATIONS");
    }
    
} // readLocalStorageData

function saveNewLocation(label, latlng) {
    if (label!=null && label.length>1){
        if (JSON_Locations === null){
            JSON_Locations={"__":"__"}; //dummy
        }
        
        JSON_Locations[label] = latlng;
        delete JSON_Locations["__"];
        console.log(label + "=" + latlng);
        saveLocalStorageData();
        readLocalStorageData();
        createButtons(UserLocationsName);
        getETA(0);
    }
    showButtons();
} // saveNewLocation

function removeLocation(index){
    if (confirm("Delete " + UserLocationsName[index] + " ?") == true) {
        delete JSON_Locations[UserLocationsName[index]];
        saveLocalStorageData();
        readLocalStorageData();
        createButtons(UserLocationsName);
        getETA(0);
    }
} // removeLocation

function selectLocation(){
    createMap();
    document.getElementById('divLocation').className = "divShow";
    document.getElementById('divButtons').className = "divHide";
    document.getElementById('divHelp').className = "divHide";
} // selectLocation

function showButtons(){
    document.getElementById('divButtons').className = "divShow";
    document.getElementById('divLocation').className = "divHide";
    document.getElementById('divHelp').className = "divHide";
    readLocalStorageData();
    //getTimeToDestinations(UserOrigin,UserLocationsGPS);
} // showButtons

function showHelp(){
    document.getElementById('divHelp').className = "divShow";
    document.getElementById('divButtons').className = "divHide";
    document.getElementById('divLocation').className = "divHide";
}
var responseDirectionService;
var statusDirectionService;

function getLatLngString(jsonLocation){
    return(jsonLocation.lat + "," + jsonLocation.lng);
}
function getETA(indexLocation){
    if (indexLocation >= UserLocationsName.length){
        return;
    }
    
    const directionsService = new google.maps.DirectionsService();

    // build request
    const request = {
        origin: getLatLngString(UserOrigin),
        destination: getLatLngString(UserLocationsGPS[indexLocation]),
        provideRouteAlternatives: true,
        drivingOptions: {
            departureTime: new Date()
            //trafficModel: 'best_guess'
        },
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    };

    directionsService.route((request),(response, status) => {
        responseDirectionService = response;
        statusDirectionService = status;
        //console.log(response);
        //console.log(status);
        let infoETA = processDirections(response, status);
        let idButton = 'idLocation' + indexLocation;
        updateETAInfo(infoETA, idButton);

        getETA(indexLocation+1);    // recursive call
    });
}

function processDirections(response, status){
    if (status!='OK') console.log("processDirections: ERROR IN STATUS");

    let routes = response.routes;
    let etaText = "";
    for (var i=0; i<routes.length; i++){
        let roadName = routes[i].summary.replace(/and/g,"&#10132;");
        let timeRef = routes[i].legs[0].duration.value;
        let timeETA = routes[i].legs[0].duration_in_traffic.value;
        let distance = routes[i].legs[0].distance.text;
        let timeMinutes  = Math.ceil(timeETA/60) + 'm';
        let textColor = "";
        
        // Set Color of Button Text
        if (timeETA < timeRef){ // smooth
            textColor = '<span class="trafficGood">';
        }
        else if (timeETA > timeRef*1.15){ // Jam
            textColor = '<span class="trafficBad">';
        }
        else{ // Normal
            textColor = '<span class="trafficNormal">';
        }
        etaText += '<div style="margin-left:20px;">' + textColor 
            + distance + "&nbsp;&nbsp;<b>" + timeMinutes + "</b>&nbsp;&nbsp;" + roadName
            + '</span></div>';
    }

    //console.log(etaText);
    return etaText;
} // processDirections

function fontChange(changeSize){
    console.log("fontChange " + changeSize);
    UserFontSize = parseInt(UserFontSize) + parseInt(changeSize);
    for (let i = 0; i < Object.keys(UserLocationsName).length; i++) {
        document.getElementById('idLocation'+i).style.fontSize = UserFontSize + "px";
    }
    saveLocalStorageData();
} // fontIncrease

function updateETAInfo(textButton, idButton){
    console.log("updateETAInfo " + idButton);
    let button = document.getElementById(idButton);
    button.innerHTML += textButton;
} //updateETAInfo

function gm_authFailure() {
 console.log("gm_authFailure");// Perform action(s) 
}

//Load the map when the page has finished loading.
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelectorAll('#map').length > 0) {
        readLocalStorageData();
        createButtons(UserLocationsName);

        var apikey = "";
        if (UserAPIKey!=null && UserAPIKey.length>10){
            var apikey = 'key='+UserAPIKey;
        }
        var js_file = document.createElement('script');
        js_file.type = 'text/javascript';
        js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&' + apikey;
        document.getElementsByTagName('head')[0].appendChild(js_file);
    }
});

// ------------------------- END OF SCRIPT -----------------------------