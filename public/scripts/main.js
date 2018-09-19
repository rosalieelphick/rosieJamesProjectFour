(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var app = {};

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

app.dbChanges = function () {
    var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "empty";

    if (result != "empty") {
        app.dbRef.on("value", function (snapshot) {
            var doesExist = false;
            var safeAreas = snapshot.val();

            for (var area in safeAreas) {
                if (safeAreas[area].address === result.address.formattedAddress) {
                    doesExist = true;
                }
            }
            if (doesExist === false) {
                var id = app.dbRef.push().key;
                var itemReference = firebase.database().ref("project4SafeAreas/" + id);

                itemReference.set({
                    address: result.address.formattedAddress,
                    safe: true,
                    lat: result.location.latitude,
                    long: result.location.longitude,
                    key: id
                });
            }
        });
    } else {}
};

app.determineResults = function (addressData, results) {

    var resultString = "";

    var resultButtons = $("<div class=\"resultButtons\"><button class=\"findSafe\">Find Safer Area</button><button class=\"anotherQuery\">Test Another Address</button></div>");

    var resultMonth = (results / 12).toFixed(2);

    if (results > 450) {
        resultString = $("<h3 id=\"resultNumber\">Severe</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 350) {
        resultString = $("<h3 id=\"resultNumber\">Extremely high</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 250) {
        resultString = $("<h3 id=\"resultNumber\">High</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 150) {
        resultString = $("<h3 id=\"resultNumber\">Moderate</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else if (results > 50) {
        resultString = $("<h3 id=\"resultNumber\">Low</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else if (results >= 0) {
        resultString = $("<h3 id=\"resultNumber\">Negligible</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else {
        resultString = $("No results Found, Try Again");
    }

    $(".textResults").empty().append(resultString, resultButtons);

    if (results <= 150) {
        $(".resultButtons .findSafe").addClass("noNearbySafe");
    }

    $(".anotherQuery").on("click", function () {

        $(".textResults").empty();
        $("#resultMap").removeClass("resultMapDisplay").addClass("resultMapHidden");
        $(".resultButtons").empty();
        $("footer").removeClass("footerDisplay");

        $(".line").removeClass("lineDisplay");
        $(".separatingLine").removeClass("separatingLineDisplay");
        $(".textResults").removeClass("textResultsHeight");

        $(".results").removeClass("resultsDisplay");
        $("#directions").empty();

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        app.map.entities.remove(app.pin);
    });
};

app.findSafeArea = function (unsafeAddress) {
    // console.log(app.dbRef);

    var curLat = unsafeAddress.location.latitude;
    var curLon = unsafeAddress.location.longitude;

    // console.log(curLat, curLon);

    var rangeVal = 0.02;

    app.dbRef.once("value", function (snapshot) {
        var isNear = false;
        var safeList = snapshot.val();
        var closeAreas = [];

        for (var area in safeList) {
            if (curLat - rangeVal < safeList[area].lat && safeList[area].lat < curLat + rangeVal && curLon - rangeVal < safeList[area].long && safeList[area].long < curLon + rangeVal) {
                isNear = true;
                closeAreas.push(safeList[area]);
            }
        }
        if (isNear === true) {
            // console.log(closeAreas);

            var ranSpot = Math.floor(Math.random() * closeAreas.length);
            console.log(closeAreas[ranSpot]);

            $(".resultButtons .findSafe").removeClass("noNearbySafe");
            $(".textResults").on("click", ".findSafe", function () {
                app.getDirections(unsafeAddress, closeAreas[ranSpot]);
            });
        } else {
            $(".resultButtons .findSafe").addClass("noNearbySafe");
        }
    });
};
app.getDirections = function (unsafe, safe) {
    var unsafeString = unsafe.address.formattedAddress;
    var safeString = safe.address;
    var safeLat = safe.lat;
    var safeLong = safe.long;

    Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function () {
        //Create an instance of the directions manager.
        app.directionsManager = new Microsoft.Maps.Directions.DirectionsManager(app.map);

        //Create waypoints to route between.
        var currentPoint = new Microsoft.Maps.Directions.Waypoint({
            address: unsafeString
        });

        app.directionsManager.addWaypoint(currentPoint);

        var safePoint = new Microsoft.Maps.Directions.Waypoint({
            address: safeString
        });

        app.directionsManager.addWaypoint(safePoint);

        //Specify the element in which the itinerary will be rendered.
        app.directionsManager.setRenderOptions({ itineraryContainer: '#directions' });
        app.map.entities.remove(app.pin);
        //Calculate directions.
        app.directionsManager.calculateDirections();

        $("#directions").append("<div class='backToResults'><button class='backButton'>Back To Results</button>");
        $(".backButton").on("click", function () {
            $('html, body').animate({
                scrollTop: 650
            }, 1000);
        });
    });
};
app.getMap = function (query) {
    var navigationBarMode = Microsoft.Maps.NavigationBarMode;
    app.map = new Microsoft.Maps.Map("#resultMap", {
        credentials: app.apiKey,
        center: new Microsoft.Maps.Location(43.6482, -79.39782),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        navigationBarMode: navigationBarMode.minified,
        zoom: 12
    });

    // defining points of polygon here: boundaries of Toronto
    app.points = [new Microsoft.Maps.Location(43.584721, -79.541365), new Microsoft.Maps.Location(43.610629, -79.567029), new Microsoft.Maps.Location(43.627276, -79.563436), new Microsoft.Maps.Location(43.625848, -79.575361), new Microsoft.Maps.Location(43.629626, -79.585825), new Microsoft.Maps.Location(43.644599, -79.591420), new Microsoft.Maps.Location(43.667592, -79.589045), new Microsoft.Maps.Location(43.743851, -79.648292), new Microsoft.Maps.Location(43.832546, -79.267848), new Microsoft.Maps.Location(43.798602, -79.132959), new Microsoft.Maps.Location(43.789980, -79.121711), new Microsoft.Maps.Location(43.667366, -79.103675), new Microsoft.Maps.Location(43.552493, -79.500425), new Microsoft.Maps.Location(43.584721, -79.541365)];

    var polygon = new Microsoft.Maps.Polygon(app.points).setOptions({ fillColor: 'transparent' });

    // pushing the polygon into the map
    app.map.entities.push(polygon);
};

// function to check if the point is acutally in the polygon
app.pointInPolygon = function (pin) {
    var lon = pin.geometry.x;
    var lat = pin.geometry.y;

    var j = app.points.length - 1;
    var inPoly = false;

    for (var i = 0; i < app.points.length; i = i + 1) {
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
        alert("This location is outside the boundaries for this data set");
    }
};

app.geocodeQuery = function (query) {

    query = query.toLowerCase().split(" ").map(function (s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }).join(" ");

    // if the search manager isn't defined yet, create an instance of the search manager class
    if (!app.searchManager) {
        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function () {
            app.searchManager = new Microsoft.Maps.Search.SearchManager(app.map);
            app.geocodeQuery(query);
        });
    } else {
        var searchRequest = {
            where: query,
            callback: function callback(r) {
                // get the results from the geocoding function 
                if (r && r.results && r.results.length > 0) {

                    var firstResult = r.results[0];

                    app.pin = new Microsoft.Maps.Pushpin(firstResult.location, {
                        color: "red",
                        title: query
                    });
                    // make the database call here
                    app.getCrimeData(firstResult);

                    // make the call to check if within polygon here
                    app.pointInPolygon(app.pin);

                    app.map.setView({ center: firstResult.location });
                }
            },
            errorCallback: function errorCallback() {
                alert("no results found");
            }
        };

        app.searchManager.geocode(searchRequest);
    } // else statement ends
}; // geocode query ends


app.getCrimeData = function (addressData) {

    var url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts/FeatureServer/0/query?";

    var locationX = addressData.location.longitude;
    var locationY = addressData.location.latitude;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: {
            geometry: locationX + "," + locationY,
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
    }).then(function (res) {

        var results = res.features.length;
        app.determineResults(addressData, results);
    });
};

app.submitQuery = function () {
    $(".addressQuery").on("submit", function (e) {
        e.preventDefault();
        var addressString = $(".queryText").val().trim();
        app.geocodeQuery("" + addressString + app.cityAndCountry);

        $(".queryText").val("");

        $("#resultMap").removeClass("resultMapHidden").addClass("resultMapDisplay");

        $("footer").addClass("footerDisplay");

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        $(".line").addClass("lineDisplay");
        $(".separatingLine").addClass("separatingLineDisplay");

        $(".textResults").addClass("textResultsHeight");

        $(".results").addClass("resultsDisplay");
    });
};

app.infoBox = function () {
    $(".info").on("click", function () {
        $(".infoBox").css("display", "block");
        $(this).css("display", "none");
    });

    $(".close").on("click", function () {
        $(".infoBox").css("display", "none");
        $(".info").css("display", "block");
    });
};

app.init = function () {
    app.getMap();
    app.submitQuery();
    app.dbChanges();
    app.infoBox();
};

$(function () {
    app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFNLE1BQU0sRUFBWjs7QUFFQSxJQUFJLE1BQUosR0FBYSxrRUFBYjtBQUNBLElBQUksY0FBSixHQUFxQixtQkFBckI7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLGFBQUo7QUFDQSxJQUFJLGlCQUFKO0FBQ0EsSUFBSSxNQUFKOztBQUVBO0FBQ0EsSUFBSSxNQUFKLEdBQWE7QUFDVCxZQUFRLHlDQURDO0FBRVQsZ0JBQVksdUNBRkg7QUFHVCxpQkFBYSw4Q0FISjtBQUlULGVBQVcsdUJBSkY7QUFLVCxtQkFBZSxtQ0FMTjtBQU1ULHVCQUFtQjtBQU5WLENBQWI7O0FBU0EsU0FBUyxhQUFULENBQXVCLElBQUksTUFBM0I7O0FBRUEsSUFBSSxLQUFKLEdBQVksU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLG1CQUF4QixDQUFaOztBQUVBLElBQUksU0FBSixHQUFnQixZQUEwQjtBQUFBLFFBQWpCLE1BQWlCLHVFQUFSLE9BQVE7O0FBQ3RDLFFBQUcsVUFBVSxPQUFiLEVBQXFCO0FBQ2pCLFlBQUksS0FBSixDQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLFVBQVMsUUFBVCxFQUFrQjtBQUNwQyxnQkFBSSxZQUFZLEtBQWhCO0FBQ0EsZ0JBQUksWUFBWSxTQUFTLEdBQVQsRUFBaEI7O0FBRUEsaUJBQUksSUFBSSxJQUFSLElBQWdCLFNBQWhCLEVBQTBCO0FBQ3RCLG9CQUFHLFVBQVUsSUFBVixFQUFnQixPQUFoQixLQUE0QixPQUFPLE9BQVAsQ0FBZSxnQkFBOUMsRUFBK0Q7QUFDM0QsZ0NBQVksSUFBWjtBQUNIO0FBQ0o7QUFDRCxnQkFBRyxjQUFjLEtBQWpCLEVBQXVCO0FBQ25CLG9CQUFNLEtBQUssSUFBSSxLQUFKLENBQVUsSUFBVixHQUFpQixHQUE1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QUVHLElBRkg7O0FBSUEsVUFBRSxPQUFGLEVBQVcsUUFBWCxDQUFvQixhQUFwQjtBQUNBLFVBQUUsaUJBQUYsRUFBcUIsUUFBckIsQ0FBOEIsdUJBQTlCOztBQUVBLFVBQUUsY0FBRixFQUFrQixRQUFsQixDQUEyQixtQkFBM0I7O0FBRUEsVUFBRSxVQUFGLEVBQWMsUUFBZCxDQUF1QixnQkFBdkI7QUFFSCxLQXRCRDtBQXVCSCxDQXhCRDs7QUEwQkEsSUFBSSxPQUFKLEdBQWMsWUFBVztBQUNyQixNQUFFLE9BQUYsRUFBVyxFQUFYLENBQWMsT0FBZCxFQUF1QixZQUFXO0FBQzlCLFVBQUUsVUFBRixFQUFjLEdBQWQsQ0FBa0IsU0FBbEIsRUFBNkIsT0FBN0I7QUFDQSxVQUFFLElBQUYsRUFBUSxHQUFSLENBQVksU0FBWixFQUF1QixNQUF2QjtBQUNILEtBSEQ7O0FBS0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUMvQixVQUFFLFVBQUYsRUFBYyxHQUFkLENBQWtCLFNBQWxCLEVBQTZCLE1BQTdCO0FBQ0EsVUFBRSxPQUFGLEVBQVcsR0FBWCxDQUFlLFNBQWYsRUFBMEIsT0FBMUI7QUFDSCxLQUhEO0FBSUgsQ0FWRDs7QUFhQSxJQUFJLElBQUosR0FBVyxZQUFXO0FBQ2xCLFFBQUksTUFBSjtBQUNBLFFBQUksV0FBSjtBQUNBLFFBQUksU0FBSjtBQUNBLFFBQUksT0FBSjtBQUVILENBTkQ7O0FBUUEsRUFBRSxZQUFVO0FBQ1IsUUFBSSxJQUFKO0FBQ0gsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuY29uc3QgYXBwID0ge307XG5cbmFwcC5hcGlLZXkgPSBcIkFwczlSdTRJMlZFMTZTVlQtVXFhMW0wX2RuRVYzQUkxNXRxNnlPQ01iY3RVNm1rSkZ0Y3M0Q1FpaWV0MmJKdlhcIjtcbmFwcC5jaXR5QW5kQ291bnRyeSA9IFwiLCBUb3JvbnRvLCBDYW5hZGFcIjtcbmFwcC5tYXA7XG5hcHAucGluO1xuYXBwLnNlYXJjaE1hbmFnZXI7XG5hcHAuZGlyZWN0aW9uc01hbmFnZXI7XG5hcHAucG9pbnRzO1xuXG4vLyBJbml0aWFsaXplIEZpcmViYXNlXG5hcHAuY29uZmlnID0ge1xuICAgIGFwaUtleTogXCJBSXphU3lES19vell0ZHhNYkFFaFo2VDNnNzlPNUstZUhmQ0JLWndcIixcbiAgICBhdXRoRG9tYWluOiBcInJvc2llamFtZXNwcm9qZWN0Zm91ci5maXJlYmFzZWFwcC5jb21cIixcbiAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Jvc2llamFtZXNwcm9qZWN0Zm91ci5maXJlYmFzZWlvLmNvbVwiLFxuICAgIHByb2plY3RJZDogXCJyb3NpZWphbWVzcHJvamVjdGZvdXJcIixcbiAgICBzdG9yYWdlQnVja2V0OiBcInJvc2llamFtZXNwcm9qZWN0Zm91ci5hcHBzcG90LmNvbVwiLFxuICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjM2MDc4NTEwMDEwNVwiXG59O1xuXG5maXJlYmFzZS5pbml0aWFsaXplQXBwKGFwcC5jb25maWcpO1xuXG5hcHAuZGJSZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihcInByb2plY3Q0U2FmZUFyZWFzXCIpO1xuXG5hcHAuZGJDaGFuZ2VzID0gZnVuY3Rpb24ocmVzdWx0ID0gXCJlbXB0eVwiKXtcbiAgICBpZihyZXN1bHQgIT0gXCJlbXB0eVwiKXtcbiAgICAgICAgYXBwLmRiUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3Qpe1xuICAgICAgICAgICAgbGV0IGRvZXNFeGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHNhZmVBcmVhcyA9IHNuYXBzaG90LnZhbCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IobGV0IGFyZWEgaW4gc2FmZUFyZWFzKXtcbiAgICAgICAgICAgICAgICBpZihzYWZlQXJlYXNbYXJlYV0uYWRkcmVzcyA9PT0gcmVzdWx0LmFkZHJlc3MuZm9ybWF0dGVkQWRkcmVzcyl7XG4gICAgICAgICAgICAgICAgICAgIGRvZXNFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZG9lc0V4aXN0ID09PSBmYWxzZSl7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBhcHAuZGJSZWYucHVzaCgpLmtleTtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtUmVmZXJlbmNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoYHByb2plY3Q0U2FmZUFyZWFzLyR7aWR9YCk7XG5cbiAgICAgICAgICAgICAgICBpdGVtUmVmZXJlbmNlLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IHJlc3VsdC5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIHNhZmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxhdDogcmVzdWx0LmxvY2F0aW9uLmxhdGl0dWRlLFxuICAgICAgICAgICAgICAgICAgICBsb25nOiByZXN1bHQubG9jYXRpb24ubG9uZ2l0dWRlLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBcbiAgICB9XG59XG5cbmFwcC5kZXRlcm1pbmVSZXN1bHRzID0gKGFkZHJlc3NEYXRhLCByZXN1bHRzKSA9PiB7XG4gICAgXG4gICAgbGV0IHJlc3VsdFN0cmluZyA9IFwiXCI7XG5cbiAgICBsZXQgcmVzdWx0QnV0dG9ucyA9ICQoYDxkaXYgY2xhc3M9XCJyZXN1bHRCdXR0b25zXCI+PGJ1dHRvbiBjbGFzcz1cImZpbmRTYWZlXCI+RmluZCBTYWZlciBBcmVhPC9idXR0b24+PGJ1dHRvbiBjbGFzcz1cImFub3RoZXJRdWVyeVwiPlRlc3QgQW5vdGhlciBBZGRyZXNzPC9idXR0b24+PC9kaXY+YClcblxuICAgIGxldCByZXN1bHRNb250aCA9IChyZXN1bHRzLzEyKS50b0ZpeGVkKDIpO1xuXG4gICAgaWYgKHJlc3VsdHMgPiA0NTApIHtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+U2V2ZXJlPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmZpbmRTYWZlQXJlYShhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDM1MCl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPkV4dHJlbWVseSBoaWdoPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmZpbmRTYWZlQXJlYShhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDI1MCl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPkhpZ2g8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xuICAgICAgICBhcHAuZmluZFNhZmVBcmVhKGFkZHJlc3NEYXRhKTtcbiAgICB9XG4gICAgZWxzZSBpZihyZXN1bHRzID4gMTUwKXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+TW9kZXJhdGU8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xuICAgICAgICBhcHAuZGJDaGFuZ2VzKGFkZHJlc3NEYXRhKTtcbiAgICB9XG4gICAgZWxzZSBpZihyZXN1bHRzID4gNTApe1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5Mb3c8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xuICAgICAgICBhcHAuZGJDaGFuZ2VzKGFkZHJlc3NEYXRhKTtcbiAgICB9XG4gICAgZWxzZSBpZihyZXN1bHRzID49IDAgKXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+TmVnbGlnaWJsZTwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XG4gICAgICAgIGFwcC5kYkNoYW5nZXMoYWRkcmVzc0RhdGEpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGBObyByZXN1bHRzIEZvdW5kLCBUcnkgQWdhaW5gKTtcbiAgICB9XG4gICAgXG4gICAgJChcIi50ZXh0UmVzdWx0c1wiKS5lbXB0eSgpLmFwcGVuZChyZXN1bHRTdHJpbmcsIHJlc3VsdEJ1dHRvbnMpO1xuICAgIFxuICAgIGlmIChyZXN1bHRzIDw9IDE1MCkge1xuICAgICAgICAkKFwiLnJlc3VsdEJ1dHRvbnMgLmZpbmRTYWZlXCIpLmFkZENsYXNzKFwibm9OZWFyYnlTYWZlXCIpO1xuICAgIH1cbiAgICBcbiAgICAkKFwiLmFub3RoZXJRdWVyeVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAkKFwiLnRleHRSZXN1bHRzXCIpLmVtcHR5KCk7XG4gICAgICAgICQoXCIjcmVzdWx0TWFwXCIpLnJlbW92ZUNsYXNzKFwicmVzdWx0TWFwRGlzcGxheVwiKS5hZGRDbGFzcyhcInJlc3VsdE1hcEhpZGRlblwiKTtcbiAgICAgICAgJChcIi5yZXN1bHRCdXR0b25zXCIpLmVtcHR5KCk7XG4gICAgICAgICQoXCJmb290ZXJcIikucmVtb3ZlQ2xhc3MoXCJmb290ZXJEaXNwbGF5XCIpXG5cbiAgICAgICAgJChcIi5saW5lXCIpLnJlbW92ZUNsYXNzKFwibGluZURpc3BsYXlcIik7XG4gICAgICAgICQoXCIuc2VwYXJhdGluZ0xpbmVcIikucmVtb3ZlQ2xhc3MoXCJzZXBhcmF0aW5nTGluZURpc3BsYXlcIilcbiAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5yZW1vdmVDbGFzcyhcInRleHRSZXN1bHRzSGVpZ2h0XCIpXG5cbiAgICAgICAgJChcIi5yZXN1bHRzXCIpLnJlbW92ZUNsYXNzKFwicmVzdWx0c0Rpc3BsYXlcIilcbiAgICAgICAgJChcIiNkaXJlY3Rpb25zXCIpLmVtcHR5KCk7XG5cbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5yZW1vdmUoYXBwLnBpbik7XG4gICAgfSk7XG5cbn1cblxuYXBwLmZpbmRTYWZlQXJlYSA9IGZ1bmN0aW9uKHVuc2FmZUFkZHJlc3MpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAuZGJSZWYpO1xuXG4gICAgbGV0IGN1ckxhdCA9IHVuc2FmZUFkZHJlc3MubG9jYXRpb24ubGF0aXR1ZGU7XG4gICAgbGV0IGN1ckxvbiA9IHVuc2FmZUFkZHJlc3MubG9jYXRpb24ubG9uZ2l0dWRlO1xuXG4gICAgLy8gY29uc29sZS5sb2coY3VyTGF0LCBjdXJMb24pO1xuICAgIFxuICAgIGxldCByYW5nZVZhbCA9IDAuMDI7XG5cbiAgICBhcHAuZGJSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgbGV0IGlzTmVhciA9IGZhbHNlO1xuICAgICAgICBsZXQgc2FmZUxpc3QgPSBzbmFwc2hvdC52YWwoKTtcbiAgICAgICAgbGV0IGNsb3NlQXJlYXMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBhcmVhIGluIHNhZmVMaXN0KXtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAoKGN1ckxhdCAtIHJhbmdlVmFsKSA8IHNhZmVMaXN0W2FyZWFdLmxhdCAmJiBzYWZlTGlzdFthcmVhXS5sYXQgPCAoY3VyTGF0ICsgcmFuZ2VWYWwpKVxuICAgICAgICAgICAgICAgICYmXG4gICAgICAgICAgICAgICAgKChjdXJMb24gLSByYW5nZVZhbCkgPCBzYWZlTGlzdFthcmVhXS5sb25nICYmIHNhZmVMaXN0W2FyZWFdLmxvbmcgPCAoY3VyTG9uICsgcmFuZ2VWYWwpKVxuICAgICAgICAgICAgKXtcbiAgICAgICAgICAgICAgICBpc05lYXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNsb3NlQXJlYXMucHVzaChzYWZlTGlzdFthcmVhXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoaXNOZWFyID09PSB0cnVlKXtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNsb3NlQXJlYXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgcmFuU3BvdCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNsb3NlQXJlYXMubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNsb3NlQXJlYXNbcmFuU3BvdF0pO1xuXG4gICAgICAgICAgICAkKFwiLnJlc3VsdEJ1dHRvbnMgLmZpbmRTYWZlXCIpLnJlbW92ZUNsYXNzKFwibm9OZWFyYnlTYWZlXCIpO1xuICAgICAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5vbihcImNsaWNrXCIsIFwiLmZpbmRTYWZlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgYXBwLmdldERpcmVjdGlvbnModW5zYWZlQWRkcmVzcywgY2xvc2VBcmVhc1tyYW5TcG90XSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZXsgICAgICAgICAgICBcbiAgICAgICAgICAgICQoXCIucmVzdWx0QnV0dG9ucyAuZmluZFNhZmVcIikuYWRkQ2xhc3MoXCJub05lYXJieVNhZmVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmFwcC5nZXREaXJlY3Rpb25zID0gZnVuY3Rpb24odW5zYWZlLCBzYWZlKXtcbiAgICBsZXQgdW5zYWZlU3RyaW5nID0gdW5zYWZlLmFkZHJlc3MuZm9ybWF0dGVkQWRkcmVzcztcbiAgICBsZXQgc2FmZVN0cmluZyA9IHNhZmUuYWRkcmVzcztcbiAgICBsZXQgc2FmZUxhdCA9IHNhZmUubGF0O1xuICAgIGxldCBzYWZlTG9uZyA9IHNhZmUubG9uZ1xuICAgIFxuICAgIE1pY3Jvc29mdC5NYXBzLmxvYWRNb2R1bGUoXCJNaWNyb3NvZnQuTWFwcy5EaXJlY3Rpb25zXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBkaXJlY3Rpb25zIG1hbmFnZXIuXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlciA9IG5ldyBNaWNyb3NvZnQuTWFwcy5EaXJlY3Rpb25zLkRpcmVjdGlvbnNNYW5hZ2VyKGFwcC5tYXApO1xuICAgICAgICBcbiAgICAgICAgLy9DcmVhdGUgd2F5cG9pbnRzIHRvIHJvdXRlIGJldHdlZW4uXG4gICAgICAgIGxldCBjdXJyZW50UG9pbnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5XYXlwb2ludCh7IFxuICAgICAgICAgICAgYWRkcmVzczogdW5zYWZlU3RyaW5nIFxuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuYWRkV2F5cG9pbnQoY3VycmVudFBvaW50KTtcbiAgICAgICAgXG4gICAgICAgIGxldCBzYWZlUG9pbnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5XYXlwb2ludCh7XG4gICAgICAgICAgICBhZGRyZXNzOiBzYWZlU3RyaW5nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlci5hZGRXYXlwb2ludChzYWZlUG9pbnQpO1xuXG4gICAgICAgIC8vU3BlY2lmeSB0aGUgZWxlbWVudCBpbiB3aGljaCB0aGUgaXRpbmVyYXJ5IHdpbGwgYmUgcmVuZGVyZWQuXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlci5zZXRSZW5kZXJPcHRpb25zKHsgaXRpbmVyYXJ5Q29udGFpbmVyOiAnI2RpcmVjdGlvbnMnIH0pO1xuICAgICAgICBhcHAubWFwLmVudGl0aWVzLnJlbW92ZShhcHAucGluKTtcbiAgICAgICAgLy9DYWxjdWxhdGUgZGlyZWN0aW9ucy5cbiAgICAgICAgYXBwLmRpcmVjdGlvbnNNYW5hZ2VyLmNhbGN1bGF0ZURpcmVjdGlvbnMoKTtcblxuICAgICAgICAkKFwiI2RpcmVjdGlvbnNcIikuYXBwZW5kKFwiPGRpdiBjbGFzcz0nYmFja1RvUmVzdWx0cyc+PGJ1dHRvbiBjbGFzcz0nYmFja0J1dHRvbic+QmFjayBUbyBSZXN1bHRzPC9idXR0b24+XCIpXG4gICAgICAgICQoXCIuYmFja0J1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuYXBwLmdldE1hcCA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgbGV0IG5hdmlnYXRpb25CYXJNb2RlID0gTWljcm9zb2Z0Lk1hcHMuTmF2aWdhdGlvbkJhck1vZGU7XG4gICAgYXBwLm1hcCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5NYXAoXCIjcmVzdWx0TWFwXCIsIHtcbiAgICAgICAgY3JlZGVudGlhbHM6IGFwcC5hcGlLZXksXG4gICAgICAgIGNlbnRlcjogbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY0ODIsIC03OS4zOTc4MiksXG4gICAgICAgIG1hcFR5cGVJZDogTWljcm9zb2Z0Lk1hcHMuTWFwVHlwZUlkLnJvYWQsXG4gICAgICAgIG5hdmlnYXRpb25CYXJNb2RlOiBuYXZpZ2F0aW9uQmFyTW9kZS5taW5pZmllZCxcbiAgICAgICAgem9vbTogMTJcbiAgICB9KTtcblxuICAgIC8vIGRlZmluaW5nIHBvaW50cyBvZiBwb2x5Z29uIGhlcmU6IGJvdW5kYXJpZXMgb2YgVG9yb250b1xuICAgIGFwcC5wb2ludHMgPSBbXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My41ODQ3MjEsIC03OS41NDEzNjUpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjEwNjI5LCAtNzkuNTY3MDI5KSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjYyNzI3NiwgLTc5LjU2MzQzNiksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42MjU4NDgsIC03OS41NzUzNjEpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI5NjI2LCAtNzkuNTg1ODI1KSxcblxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjQ0NTk5LCAtNzkuNTkxNDIwKSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY2NzU5MiwgLTc5LjU4OTA0NSksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My43NDM4NTEsIC03OS42NDgyOTIpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuODMyNTQ2LCAtNzkuMjY3ODQ4KSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjc5ODYwMiwgLTc5LjEzMjk1OSksXG5cbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjc4OTk4MCwgLTc5LjEyMTcxMSksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42NjczNjYsIC03OS4xMDM2NzUpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNTUyNDkzLCAtNzkuNTAwNDI1KSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjU4NDcyMSwgLTc5LjU0MTM2NSlcbiAgICBdXG5cblxuICAgIGxldCBwb2x5Z29uID0gbmV3IE1pY3Jvc29mdC5NYXBzLlBvbHlnb24oYXBwLnBvaW50cykuc2V0T3B0aW9ucyh7IGZpbGxDb2xvcjogJ3RyYW5zcGFyZW50J30pO1xuXG4gICAgLy8gcHVzaGluZyB0aGUgcG9seWdvbiBpbnRvIHRoZSBtYXBcbiAgICBhcHAubWFwLmVudGl0aWVzLnB1c2gocG9seWdvbik7XG59XG5cbi8vIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBwb2ludCBpcyBhY3V0YWxseSBpbiB0aGUgcG9seWdvblxuYXBwLnBvaW50SW5Qb2x5Z29uID0gZnVuY3Rpb24gKHBpbikge1xuICAgIGxldCBsb24gPSBwaW4uZ2VvbWV0cnkueDtcbiAgICBsZXQgbGF0ID0gcGluLmdlb21ldHJ5Lnk7XG5cbiAgICBsZXQgaiA9IGFwcC5wb2ludHMubGVuZ3RoIC0gMTtcbiAgICBsZXQgaW5Qb2x5ID0gZmFsc2U7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFwcC5wb2ludHMubGVuZ3RoOyBpID0gaSArIDEpIHtcbiAgICAgICAgaWYgKGFwcC5wb2ludHNbaV0ubG9uZ2l0dWRlIDwgbG9uICYmIGFwcC5wb2ludHNbal0ubG9uZ2l0dWRlID49IGxvbiB8fCBhcHAucG9pbnRzW2pdLmxvbmdpdHVkZSA8IGxvbiAmJiBhcHAucG9pbnRzW2ldLmxvbmdpdHVkZSA+PSBsb24pIHtcbiAgICAgICAgICAgIGlmIChhcHAucG9pbnRzW2ldLmxhdGl0dWRlICsgKGxvbiAtIGFwcC5wb2ludHNbaV0ubG9uZ2l0dWRlKSAvIChhcHAucG9pbnRzW2pdLmxvbmdpdHVkZSAtIGFwcC5wb2ludHNbaV0ubG9uZ2l0dWRlKSAqIChhcHAucG9pbnRzW2pdLmxhdGl0dWRlIC0gYXBwLnBvaW50c1tpXS5sYXRpdHVkZSkgPCBsYXQpIHtcbiAgICAgICAgICAgICAgICBpblBvbHkgPSAhaW5Qb2x5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGogPSBpO1xuICAgIH1cblxuICAgIGlmIChpblBvbHkpIHtcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5wdXNoKHBpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoXCJUaGlzIGxvY2F0aW9uIGlzIG91dHNpZGUgdGhlIGJvdW5kYXJpZXMgZm9yIHRoaXMgZGF0YSBzZXRcIilcbiAgICB9XG59XG5cbmFwcC5nZW9jb2RlUXVlcnkgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgIFxuICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgLnNwbGl0KFwiIFwiKVxuICAgICAgICAgICAgLm1hcCgocykgPT4gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuXG4gICAgICAgICAgICBcbiAgICAvLyBpZiB0aGUgc2VhcmNoIG1hbmFnZXIgaXNuJ3QgZGVmaW5lZCB5ZXQsIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgc2VhcmNoIG1hbmFnZXIgY2xhc3NcbiAgICBpZiAoIWFwcC5zZWFyY2hNYW5hZ2VyKSB7XG4gICAgICAgIE1pY3Jvc29mdC5NYXBzLmxvYWRNb2R1bGUoXCJNaWNyb3NvZnQuTWFwcy5TZWFyY2hcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAuc2VhcmNoTWFuYWdlciA9IG5ldyBNaWNyb3NvZnQuTWFwcy5TZWFyY2guU2VhcmNoTWFuYWdlcihhcHAubWFwKTtcbiAgICAgICAgICAgIGFwcC5nZW9jb2RlUXVlcnkocXVlcnkpO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBzZWFyY2hSZXF1ZXN0ID0ge1xuICAgICAgICAgICAgd2hlcmU6IHF1ZXJ5LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZ2VvY29kaW5nIGZ1bmN0aW9uIFxuICAgICAgICAgICAgICAgIGlmIChyICYmIHIucmVzdWx0cyAmJiByLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0UmVzdWx0ID0gci5yZXN1bHRzWzBdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhcHAucGluID0gbmV3IE1pY3Jvc29mdC5NYXBzLlB1c2hwaW4oZmlyc3RSZXN1bHQubG9jYXRpb24se1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGFiYXNlIGNhbGwgaGVyZVxuICAgICAgICAgICAgICAgICAgICBhcHAuZ2V0Q3JpbWVEYXRhKGZpcnN0UmVzdWx0KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBjYWxsIHRvIGNoZWNrIGlmIHdpdGhpbiBwb2x5Z29uIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBvaW50SW5Qb2x5Z29uKGFwcC5waW4pO1xuICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICBhcHAubWFwLnNldFZpZXcoe2NlbnRlcjpmaXJzdFJlc3VsdC5sb2NhdGlvbn0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvckNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIm5vIHJlc3VsdHMgZm91bmRcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFwcC5zZWFyY2hNYW5hZ2VyLmdlb2NvZGUoc2VhcmNoUmVxdWVzdCk7XG5cbiAgICB9IC8vIGVsc2Ugc3RhdGVtZW50IGVuZHNcbn0gLy8gZ2VvY29kZSBxdWVyeSBlbmRzXG5cblxuYXBwLmdldENyaW1lRGF0YSA9IGZ1bmN0aW9uKGFkZHJlc3NEYXRhKSB7XG5cbiAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vc2VydmljZXMuYXJjZ2lzLmNvbS9TOXRoMGpBSjdicWdJUmp3L2FyY2dpcy9yZXN0L3NlcnZpY2VzL0JpY3ljbGVfVGhlZnRzL0ZlYXR1cmVTZXJ2ZXIvMC9xdWVyeT9cIjtcblxuICAgIGxldCBsb2NhdGlvblggPSBhZGRyZXNzRGF0YS5sb2NhdGlvbi5sb25naXR1ZGU7XG4gICAgbGV0IGxvY2F0aW9uWSA9IGFkZHJlc3NEYXRhLmxvY2F0aW9uLmxhdGl0dWRlO1xuXG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICBkYXRhOntcbiAgICAgICAgICAgIGdlb21ldHJ5OiBgJHtsb2NhdGlvblh9LCR7bG9jYXRpb25ZfWAsXG4gICAgICAgICAgICBnZW9tZXRyeVR5cGU6IFwiZXNyaUdlb21ldHJ5UG9pbnRcIixcbiAgICAgICAgICAgIGluU1I6IDQzMjYsXG4gICAgICAgICAgICBzcGF0aWFsUmVsOiBcImVzcmlTcGF0aWFsUmVsSW50ZXJzZWN0c1wiLFxuICAgICAgICAgICAgZGlzdGFuY2U6IDEwMDAsXG4gICAgICAgICAgICB1bml0czogXCJlc3JpU1JVbml0X01ldGVyXCIsXG4gICAgICAgICAgICBmOiBcImpzb25cIixcbiAgICAgICAgICAgIG91dFNSOiA0MzI2LFxuICAgICAgICAgICAgb3V0RmllbGRzOiBcIipcIixcbiAgICAgICAgICAgIHdoZXJlOiBcIk9jY3VycmVuY2VfWWVhciA+IDIwMTZcIlxuICAgICAgICB9XG4gICAgfSkudGhlbigocmVzKT0+e1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlc3VsdHMgPSByZXMuZmVhdHVyZXMubGVuZ3RoO1xuICAgICAgICBhcHAuZGV0ZXJtaW5lUmVzdWx0cyhhZGRyZXNzRGF0YSwgcmVzdWx0cyk7XG4gICAgfSk7XG5cbn1cblxuXG5hcHAuc3VibWl0UXVlcnkgPSBmdW5jdGlvbigpIHtcbiAgICAkKFwiLmFkZHJlc3NRdWVyeVwiKS5vbihcInN1Ym1pdFwiLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgYWRkcmVzc1N0cmluZyA9ICQoXCIucXVlcnlUZXh0XCIpLnZhbCgpLnRyaW0oKTtcbiAgICAgICAgYXBwLmdlb2NvZGVRdWVyeShgJHthZGRyZXNzU3RyaW5nfSR7YXBwLmNpdHlBbmRDb3VudHJ5fWApO1xuXG4gICAgICAgICQoXCIucXVlcnlUZXh0XCIpLnZhbChcIlwiKTtcblxuICAgICAgICAkKFwiI3Jlc3VsdE1hcFwiKS5yZW1vdmVDbGFzcyhcInJlc3VsdE1hcEhpZGRlblwiKS5hZGRDbGFzcyhcInJlc3VsdE1hcERpc3BsYXlcIik7XG5cbiAgICAgICAgJChcImZvb3RlclwiKS5hZGRDbGFzcyhcImZvb3RlckRpc3BsYXlcIik7XG5cbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgJChcIi5saW5lXCIpLmFkZENsYXNzKFwibGluZURpc3BsYXlcIilcbiAgICAgICAgJChcIi5zZXBhcmF0aW5nTGluZVwiKS5hZGRDbGFzcyhcInNlcGFyYXRpbmdMaW5lRGlzcGxheVwiKVxuXG4gICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikuYWRkQ2xhc3MoXCJ0ZXh0UmVzdWx0c0hlaWdodFwiKVxuXG4gICAgICAgICQoXCIucmVzdWx0c1wiKS5hZGRDbGFzcyhcInJlc3VsdHNEaXNwbGF5XCIpXG5cbiAgICB9KTtcbn1cblxuYXBwLmluZm9Cb3ggPSBmdW5jdGlvbigpIHtcbiAgICAkKFwiLmluZm9cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5pbmZvQm94XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKVxuICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgfSlcblxuICAgICQoXCIuY2xvc2VcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5pbmZvQm94XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgICAgICQoXCIuaW5mb1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIilcbiAgICB9KVxufVxuXG5cbmFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgYXBwLmdldE1hcCgpO1xuICAgIGFwcC5zdWJtaXRRdWVyeSgpO1xuICAgIGFwcC5kYkNoYW5nZXMoKTtcbiAgICBhcHAuaW5mb0JveCgpO1xuICAgIFxufVxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgYXBwLmluaXQoKTtcbn0pIl19