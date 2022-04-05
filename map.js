//map.js

//Set up some of our variables.
var map; //Will contain map object.
var marker = false; ////Has the user plotted their location marker? 
var UserDestinationsLabel;  // array for location label;
var UserDestinationsCoord;  // array for lat,lng
var UserTimeETA;
var UserTimeREF;
var UserAPIKey;
var UserOrigin;
var NewCoord;
var SAVED_LOCATIONS = "";
const MAX_BUTTONS = 6;

var myclickevent;
//Function called to initialize / create the map.
//This is called when the page has loaded.
function initMap() {

    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(52.357971, -6.516758);

    //Map options.
    var options = {
        center: centerOfMap, //Set center.
        zoom: 13 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);

    infoWindow = new google.maps.InfoWindow;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            UserOrigin =  pos;

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here.');
            infoWindow.open(map);
            map.setCenter(pos);

            //document.getElementById('lat').value = position.coords.latitude; //latitude
            //document.getElementById('lng').value = position.coords.longitude; //longitude

            getTimeToDestinations(UserOrigin,UserDestinationsCoord)
        }, function() {
            console.log("handleLocationError");
        });
    } else {
        // Browser doesn't support Geolocation
        console.log("handleLocationError");
    }

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
}

//This function will get the marker's current location and then add the lat/long
//values to our textfields so that we can save the location.
function markerLocation() {
    //Get location.
    var currentLocation = marker.getPosition();
    //Add lat and lng values to a field that we can save.
    //document.getElementById('lat').value = currentLocation.lat(); //latitude
    //document.getElementById('lng').value = currentLocation.lng(); //longitude
    NewCoord = currentLocation.lat()+","+currentLocation.lng();
}

// ------------------------- START OF SCRIPT -----------------------------
function onClickButton(destination) {
    var url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + destination;
    console.log(url);
    window.open(url);
} //onClickButton

function onClickTest() {
    readLocalStorageData();
    //var timeToDestinations = ['10m', '20m', '30m', '40m'];
    createLocationButtons(UserDestinationsLabel, UserTimeETA);
    //getTimeToDestinations(UserOrigin,UserDestinationsCoord);
}

function onClickSave() {
    //var newLocation = document.getElementById("lat").value + "," + document.getElementById("lng").value;
    //console.log("New Location: " + newLocation);
    UserAPIKey = document.getElementById("key").value;
    saveNewLocation(document.getElementById('label').value, NewCoord);
    saveLocalStorageData();
}

function createLocationButtons(jsonLocations, timeETA) {
    console.log("createLocationButtons");
    
    const arrLocations = jsonLocations; //JSON.parse(jsonLocations);
    var buttonContainer = document.getElementById('divButtons');
    buttonContainer.innerHTML = "";
    
    for (const [key, value] of Object.entries(arrLocations)) {
        console.log(key + "=" + value);
        var newbutton = document.createElement('button');
        var t = "";
        newbutton.className = 'button';
        if (timeETA[key]===null || timeETA[key]===undefined) {
            timeETA[key]='';
            UserTimeREF = [];
        }
        else{
            t = timeETA[key]+"m "
        }
        newbutton.innerHTML = '<b>' + t + value + '</b>';
        newbutton.id = "idLocation" + key;
        newbutton.setAttribute('data-long-press-delay', 1000);
        // Set Color of Button Text
        if (timeETA[key] < UserTimeREF[key]*0.9){
            newbutton.className += " trafficGood";
        }
        else if (timeETA[key] > UserTimeREF[key]*1.1){
            // Jam
            newbutton.className += " trafficBad";
        }
        else{
            // Normal
            newbutton.className += " trafficNormal";
        }
        //MUST USE LET for local scope
        let coord = UserDestinationsCoord[key];
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

    if (arrLocations.length<MAX_BUTTONS){
        var newbutton = document.createElement('button');
        newbutton.className = 'button';        
        newbutton.innerHTML = 'Add New Location';
        newbutton.onclick = function() {
            selectLocation();
        }
        buttonContainer.appendChild(newbutton);
    }

    //SAVED_LOCATIONS = arrLocations;
} //createLocationButtons

function onLongPress(itemIndex){
    console.log("onLongPress " + itemIndex);
    removeLocation(itemIndex);
} // onLongPress

function saveLocalStorageData() {
    localStorage.setItem("eta.locations", JSON.stringify(SAVED_LOCATIONS));
    localStorage.setItem("eta.googlemapkey", UserAPIKey);
    console.log("Save KEY " + UserAPIKey);
}

var dataRead;

function readLocalStorageData() {
    UserAPIKey = localStorage.getItem("eta.googlemapkey");
    document.getElementById('key').value = UserAPIKey;
    console.log('READ KEY ' + UserAPIKey);
    UserDestinationsLabel = [];
    UserDestinationsCoord = [];
    UserTimeETA = [];

    SAVED_LOCATIONS = JSON.parse(localStorage.getItem("eta.locations"));

    if (SAVED_LOCATIONS!=null){
    var localData = SAVED_LOCATIONS;
    for (const [key, value] of Object.entries(localData)) {
        UserDestinationsLabel.push(key);
        var coord={
            lat:parseFloat(value.split(',')[0]),
            lng:parseFloat(value.split(',')[1])
        }
        UserDestinationsCoord.push(coord);

        console.log(key + "=" + value);
    }
    }
    else{
        console.log("NO SAVE LOCATIONS");
    }
    
} // readLocalStorageData

function saveNewLocation(label, latlng) {
    if (label!=null && label.length>1){
        if (SAVED_LOCATIONS === null){
            SAVED_LOCATIONS={"A":"B"};
        }
        else{
            //SAVED_LOCATIONS[`${label}`] = latlng;
            
        }
        SAVED_LOCATIONS[label] = latlng;
        delete SAVED_LOCATIONS["A"];
        console.log(label + "=" + latlng);
        saveLocalStorageData();
    }
    showButtons();
}

function removeLocation(index){
    delete SAVED_LOCATIONS[UserDestinationsLabel[index]];
    saveLocalStorageData();
    readLocalStorageData();
    getTimeToDestinations(UserOrigin,UserDestinationsCoord);
}

function selectLocation(){
    document.getElementById('divButtons').className = "divHide";
    document.getElementById('divLocation').className = "divShow";
}

function showButtons(){
    document.getElementById('divButtons').className = "divShow";
    document.getElementById('divLocation').className = "divHide";
    readLocalStorageData();
    getTimeToDestinations(UserOrigin,UserDestinationsCoord);
}
var apiResponse;

function getTimeToDestinations(userOrigin, userDestinations) {
    UserTimeETA = [];
    // initialize services
    const service = new google.maps.DistanceMatrixService();
    
    // build request
    const request = {
        origins: [userOrigin],
        destinations: userDestinations,
        drivingOptions: {
            departureTime: new Date()
            //trafficModel: 'best_guess'
        },
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    };

    if (UserAPIKey===null || UserAPIKey===undefined || UserAPIKey.length<10){
        createLocationButtons(UserDestinationsLabel,UserTimeETA);
        return;
    }

    service.getDistanceMatrix(request).then((response) => {
        // put response
        apiResponse = response; //JSON.stringify(response,null,2);
        //console.log(Math.ceil(jsonResponse['rows'][0].elements[0].duration.value/60)+'m');
        //console.log(Math.ceil(jsonResponse['rows'][0].elements[1].duration.value/60)+'m');
        const rows = response['rows'][0].elements;
        
        for (var i = 0; i < rows.length; i++) {
            console.log(rows[i].duration.value);
            let timeETA = Math.ceil(rows[i].duration_in_traffic.value / 60);
            UserTimeETA.push(timeETA);
            let timeRef = Math.ceil(rows[i].duration.value / 60);
            UserTimeREF.push(timeRef)
            //Math.ceil(jsonResponse['rows'][0].elements[1].duration.value/60)+'m';

            // append to the buttons
        }
        createLocationButtons(UserDestinationsLabel, UserTimeETA);
    });
} // getTimeToDestinations

function pollTravelTime(id){
    setTimeout(() => { }, 5000);
}

function gm_authFailure() {
 console.log("gm_authFailure");// Perform action(s) 
}

//Load the map when the page has finished loading.
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelectorAll('#map').length > 0) {
        readLocalStorageData();
        createLocationButtons(UserDestinationsLabel, []);

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