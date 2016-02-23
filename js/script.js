// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.841156, -73.883678], 12);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);


// add in a legend to make sense of it all
// create a container for the legend and set the location

var legend = L.control({position: 'bottomright'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'legend'),

        conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Dead', 'Stump', 'Unknown'];

        div.innerHTML += '<p><strong> Tree Health </strong></p>';

        for (var i = 0; i < conditions.length; i++) {
            div.innerHTML +=
                '<i style="background:' + fillColorCondition(conditions[i]) + '"></i> ' +
                conditions[i] + (conditions[i + 1] ? '<br />' : '<br />');
        }

    return div;
};


// add the legend to the map
legend.addTo(map);


// lets add data from the API now
// set a global variable to use in the D3 scale below
// use jQuery geoJSON to grab data from API
// select all Quercus rubra in the bronx
$.getJSON( "https://data.cityofnewyork.us/resource/kyad-zm4j.json?$$app_token=rQIMJbYqnCnhVM9XNPHE9tj0g&borough=Bronx&species=QURU"
, function( data ) {
    var dataset = data;
    // draw the dataset on the map
    plotAPIData(dataset);

});

// create a leaflet layer group to add your API dots to so we can add these to the map
var apiLayerGroup = L.layerGroup();

// since these data are not geoJson, we have to build our dots from the data by hand
function plotAPIData(dataset) {
    // set up D3 ordinal scle for coloring the dots just once
    var radiusScale = setUpD3Scale(dataset);
    //console.log(ordinalScale("Noise, Barking Dog (NR5)"));


    // loop through each object in the dataset and create a circle marker for each one using a jQuery for each loop
    $.each(dataset, function( index, value ) {

        // check to see if lat or lon is undefined or null
        // console.log(value.latitude, value.longitude)
        if ((typeof value.latitude !== "undefined" || typeof value.longitude !== "undefined") || (value.latitude && value.longitude)) {
            // create a leaflet lat lon object to use in L.circleMarker
            var latlng = L.latLng(value.latitude, value.longitude);
     
            var apiMarker = L.circleMarker(latlng, {
                stroke: false,
                fillColor: fillColorCondition(value.condition),
                fillOpacity: fillOpacityCondition(value.condition),
                radius: radiusScale(value.diameter) * 2
            });

            // var popupContent = "<strong>Species:</strong> " + calc[1] + "<br /><strong>Population Moved to US in Last Year:</strong> " + calc[0] + "<br /><strong>Percentage Moved to US in Last Year:</strong> " + calc[2] + "%";
            //         popup.setLatLng(bounds.getCenter());


            var condtion_text = "<font color=" + fillColorCondition(value.condition) + ">" + value.condition + "</font>"

            // bind a simple popup so we know what the noise complaint is
            apiMarker.bindPopup("<strong>Species: </strong>" + value.spc_latin + 
                "<br /><strong>Diameter: </strong>" + value.diameter + " in" +
                "<br /><strong>Condition: </strong>" + condtion_text);

            // add dots to the layer group
            apiLayerGroup.addLayer(apiMarker);

        }

    });



    apiLayerGroup.addTo(map);

}

function setUpD3Scale(dataset) {
    //console.log(dataset);
    // create unique list of descriptors
    // first we need to create an array of descriptors
    var diameters = [];

    // loop through descriptors and add to descriptor array
    $.each(dataset, function( index, value ) {
        diameters.push(value.diameter);
    });

    // use underscore to create a unique array
    var diametersUnique = _.uniq(diameters);

    // create a D3 ordinal scale based on that unique array as a domain
    var linearScale = d3.scale.quantile()
        .domain(diametersUnique)
        .range([1, 2, 3, 4]);

    console.log(diametersUnique)
    console.log(linearScale)
    return linearScale;

}

function fillColorCondition(d) {
    health_colors = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641']
    return d == 'Excellent' ? health_colors[4] :
           d == 'Good'      ? health_colors[3] :
           d == 'Fair'      ? health_colors[2] :
           d == 'Poor'      ? health_colors[1] :
           d == 'Dead'      ? health_colors[0] :
           d == 'Stump'     ? health_colors[0] :
                              '#80cdc1';
}



function fillOpacityCondition(d) {
    return d == 'Unknown' ? 0.25 :
                    0.75;
}


