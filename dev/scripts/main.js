const app = {};

app.apiKey = "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX";
app.cityAndCountry = ", Toronto, Canada";
app.map;
app.pin;
app.searchManager;
app.directionsManager;
app.points;

// Initialize Firebase
app.config = {
    apiKey: "AIzaSyDK_ozYtdxMbAEhZ6T3g79O5K-eHfCBKZw",
    authDomain: "rosiejamesprojectfour.firebaseapp.com",
    databaseURL: "https://rosiejamesprojectfour.firebaseio.com",
    projectId: "rosiejamesprojectfour",
    storageBucket: "rosiejamesprojectfour.appspot.com",
    messagingSenderId: "360785100105"
};

firebase.initializeApp(app.config);

app.dbRef = firebase.database().ref("project4SafeAreas");

app.dbChanges = function(result = "empty"){
    if(result != "empty"){
        app.dbRef.on("value", function(snapshot){
            let doesExist = false;
            let safeAreas = snapshot.val();
            
            for(let area in safeAreas){
                if(safeAreas[area].address === result.address.formattedAddress){
                    doesExist = true;
                }
            }
            if(doesExist === false){
                const id = app.dbRef.push().key;
                const itemReference = firebase.database().ref(`project4SafeAreas/${id}`);

                itemReference.set({
                    address: result.address.formattedAddress,
                    safe: true,
                    lat: result.location.latitude,
                    long: result.location.longitude,
                    key: id
                });
            }
        });
    }
    else{
        
    }
}

app.determineResults = (addressData, results) => {
    
    let resultString = "";

    let resultButtons = $(`<div class="resultButtons"><button class="findSafe">Find Safer Area</button><button class="anotherQuery" onClick="window.location.href=window.location.href">Test Another Address</button></div>`)

    let resultMonth = (results/12).toFixed(2);

    if (results > 450) {
        resultString = $(`<h3 id="resultNumber">Severe</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.findSafeArea(addressData);
    }
    else if(results > 350){
        resultString = $(`<h3 id="resultNumber">Extremely high</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.findSafeArea(addressData);
    }
    else if(results > 250){
        resultString = $(`<h3 id="resultNumber">High</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.findSafeArea(addressData);
    }
    else if(results > 150){
        resultString = $(`<h3 id="resultNumber">Moderate</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.dbChanges(addressData);
    }
    else if(results > 50){
        resultString = $(`<h3 id="resultNumber">Low</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.dbChanges(addressData);
    }
    else if(results >= 0 ){
        resultString = $(`<h3 id="resultNumber">Negligible</h3><p class="resultNumber">${results}</p> <p>reported bike thefts within a 1km radius of ${addressData.address.addressLine} in 2017.</p> <p>That is an average of approximately <span class="highlightMonthly">${resultMonth} </span>thefts a month.</p>`);
        app.dbChanges(addressData);
    }
    else{
        resultString = $(`No results Found, Try Again`);
    }
    
    $(".textResults").empty().append(resultString, resultButtons);
    
    if (results <= 150) {
        $(".resultButtons .findSafe").addClass("noNearbySafe");
    }
    
    $(".anotherQuery").on("click", function () {

        $(".textResults").empty();
        $("#resultMap").removeClass("resultMapDisplay").addClass("resultMapHidden");
        $(".resultButtons").empty();
        $("footer").removeClass("footerDisplay")

        $(".line").removeClass("lineDisplay");
        $(".separatingLine").removeClass("separatingLineDisplay")
        $(".textResults").removeClass("textResultsHeight")

        $(".results").removeClass("resultsDisplay")
        $("#directions").empty();

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        console.log(app.map)

        // let navigationBarMode = Microsoft.Maps.NavigationBarMode;

        // app.map = new Microsoft.Maps.Map("#resultMap", {
        //     credentials: app.apiKey,
        //     center: new Microsoft.Maps.Location(43.6482, -79.39782),
        //     mapTypeId: Microsoft.Maps.MapTypeId.road,
        //     navigationBarMode: navigationBarMode.minified,
        //     zoom: 12
        // });

        app.map.entities.remove(app.pin);
    });

}

app.findSafeArea = function(unsafeAddress) {
    // console.log(app.dbRef);

    let curLat = unsafeAddress.location.latitude;
    let curLon = unsafeAddress.location.longitude;

    // console.log(curLat, curLon);
    
    let rangeVal = 0.02;

    app.dbRef.once("value", function(snapshot){
        let isNear = false;
        let safeList = snapshot.val();
        let closeAreas = [];

        for (let area in safeList){
            if (
                ((curLat - rangeVal) < safeList[area].lat && safeList[area].lat < (curLat + rangeVal))
                &&
                ((curLon - rangeVal) < safeList[area].long && safeList[area].long < (curLon + rangeVal))
            ){
                isNear = true;
                closeAreas.push(safeList[area]);
            }
        }
        if(isNear === true){
            // console.log(closeAreas);
            
            let ranSpot = Math.floor(Math.random() * closeAreas.length);
            console.log(closeAreas[ranSpot]);

            $(".resultButtons .findSafe").removeClass("noNearbySafe");
            $(".textResults").on("click", ".findSafe", function(){
                app.getDirections(unsafeAddress, closeAreas[ranSpot]);
            })
            
        }
        else{            
            $(".resultButtons .findSafe").addClass("noNearbySafe");
        }
    });
}
app.getDirections = function(unsafe, safe){

    let unsafeString = unsafe.address.formattedAddress;
    let safeString = safe.address;
    let safeLat = safe.lat;
    let safeLong = safe.long
    
    Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function(){
        //Create an instance of the directions manager.
        app.directionsManager = new Microsoft.Maps.Directions.DirectionsManager(app.map);
        
        //Create waypoints to route between.
        let currentPoint = new Microsoft.Maps.Directions.Waypoint({ 
            address: unsafeString 
        });

        app.directionsManager.addWaypoint(currentPoint);
        
        let safePoint = new Microsoft.Maps.Directions.Waypoint({
            address: safeString
        });

        app.directionsManager.addWaypoint(safePoint);

        //Specify the element in which the itinerary will be rendered.
        app.directionsManager.setRenderOptions({ itineraryContainer: '#directions' });
        console.log(app.map)
        app.map.entities.remove(app.pin);
        //Calculate directions.
        app.directionsManager.calculateDirections();

        $("#directions").append("<div class='backToResults'><button class='backButton'>Back To Results</button>")
        $(".backButton").on("click", function(){
            $('html, body').animate({
                scrollTop: 650
            }, 1000);
        })
    });
}

// function to check if the point is acutally in the polygon
app.pointInPolygon = function (pin) {
    console.log("polygon")
    let lon = pin.geometry.x;
    let lat = pin.geometry.y;

    let j = app.points.length - 1;
    let inPoly = false;

    for (let i = 0; i < app.points.length; i = i + 1) {
        if (app.points[i].longitude < lon && app.points[j].longitude >= lon || app.points[j].longitude < lon && app.points[i].longitude >= lon) {
            if (app.points[i].latitude + (lon - app.points[i].longitude) / (app.points[j].longitude - app.points[i].longitude) * (app.points[j].latitude - app.points[i].latitude) < lat) {
                inPoly = !inPoly;
            }
        }
        j = i;
    }

    if (inPoly) {
        app.map.entities.push(pin);
    } else {
        alert("This location is outside the boundaries for this data set")
    }
}

app.geocodeQuery = function(query) {
    
    query = query.toLowerCase()
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ");

            
    // if the search manager isn't defined yet, create an instance of the search manager class
    if (!app.searchManager) {
        console.log("if")

        let navigationBarMode = Microsoft.Maps.NavigationBarMode;

        app.map = new Microsoft.Maps.Map("#resultMap", {
            credentials: "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX",
            center: new Microsoft.Maps.Location(43.6482, -79.39782),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            navigationBarMode: navigationBarMode.minified,
            zoom: 12
        });

        app.points = [
            new Microsoft.Maps.Location(43.584721, -79.541365),
            new Microsoft.Maps.Location(43.610629, -79.567029),
            new Microsoft.Maps.Location(43.627276, -79.563436),
            new Microsoft.Maps.Location(43.625848, -79.575361),
            new Microsoft.Maps.Location(43.629626, -79.585825),

            new Microsoft.Maps.Location(43.644599, -79.591420),
            new Microsoft.Maps.Location(43.667592, -79.589045),
            new Microsoft.Maps.Location(43.743851, -79.648292),
            new Microsoft.Maps.Location(43.832546, -79.267848),
            new Microsoft.Maps.Location(43.798602, -79.132959),

            new Microsoft.Maps.Location(43.789980, -79.121711),
            new Microsoft.Maps.Location(43.667366, -79.103675),
            new Microsoft.Maps.Location(43.552493, -79.500425),
            new Microsoft.Maps.Location(43.584721, -79.541365)
        ]


        let polygon = new Microsoft.Maps.Polygon(app.points).setOptions({ fillColor: 'transparent' });

        // pushing the polygon into the map
        app.map.entities.push(polygon);

        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function() {
            app.searchManager = new Microsoft.Maps.Search.SearchManager(app.map);
            app.geocodeQuery(query);
        })
    } else {
        console.log("else")
        let searchRequest = {
            where: query,
            callback: function(r) {
                console.log(r)
                // get the results from the geocoding function 
                if (r && r.results && r.results.length > 0) {
                    
                    let firstResult = r.results[0]
                    
                    app.pin = new Microsoft.Maps.Pushpin(firstResult.location,{
                        color: "red",
                        title: query
                    });
                    // make the database call here
                    app.getCrimeData(firstResult);

                    // make the call to check if within polygon here
                    app.pointInPolygon(app.pin);
                    

                    app.map.setView({center:firstResult.location});
                }
            },
            errorCallback: function() {
                alert("no results found")
            }
        }


        app.searchManager.geocode(searchRequest);

    } // else statement ends
} // geocode query ends


app.getCrimeData = function(addressData) {

    const url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts/FeatureServer/0/query?";

    let locationX = addressData.location.longitude;
    let locationY = addressData.location.latitude;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data:{
            geometry: `${locationX},${locationY}`,
            geometryType: "esriGeometryPoint",
            inSR: 4326,
            spatialRel: "esriSpatialRelIntersects",
            distance: 1000,
            units: "esriSRUnit_Meter",
            f: "json",
            outSR: 4326,
            outFields: "*",
            where: "Occurrence_Year > 2016"
        }
    }).then((res)=>{
        
        let results = res.features.length;
        app.determineResults(addressData, results);
    });

}


app.submitQuery = function() {
    $(".addressQuery").on("submit", function(e){
        
        e.preventDefault();
        let addressString = $(".queryText").val().trim();
        app.geocodeQuery(`${addressString}${app.cityAndCountry}`);

        $(".queryText").val("");

        $("#resultMap").removeClass("resultMapHidden").addClass("resultMapDisplay");

        $("footer").addClass("footerDisplay");

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        $(".line").addClass("lineDisplay")
        $(".separatingLine").addClass("separatingLineDisplay")

        $(".textResults").addClass("textResultsHeight")

        $(".results").addClass("resultsDisplay")

    });
}

app.infoBox = function() {
    $(".info").on("click", function() {
        $(".infoBox").css("display", "block")
        $(this).css("display", "none")
    })

    $(".close").on("click", function() {
        $(".infoBox").css("display", "none")
        $(".info").css("display", "block")
    })
}


app.init = function() {
    // app.getMap();
    app.submitQuery();
    app.dbChanges();
    app.infoBox();
    
}

$(function(){
    app.init();
})