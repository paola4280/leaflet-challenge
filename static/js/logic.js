let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the GeoJSON data
fetch(earthquakeURL)
    .then(response => response.json())
    .then(data => createFeatures(data.features));

    function markerStyle(feature) {
        return {
            radius: feature.properties.mag * 4, // Magnitude determines size
            fillColor: getColor(feature.geometry.coordinates[2]), // Depth determines color
            color: "#000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        };
    }
    
    function getColor(depth) {
        return depth > 90 ? "#ff5f65" :
               depth > 70 ? "#fca35d" :
               depth > 50 ? "#fdb72a" :
               depth > 30 ? "#f7db11" :
               depth > 10 ? "#dcf400" :
                            "#a3f600";
    }
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3>
                         <hr><p>Magnitude: ${feature.properties.mag}</p>
                         <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                         <p>${new Date(feature.properties.time)}</p>`);
    }

    function createFeatures(earthquakeData) {
        let earthquakes = L.geoJSON(earthquakeData, {
            pointToLayer: (feature, latlng) => L.circleMarker(latlng, markerStyle(feature)),
            onEachFeature: onEachFeature
        });
    
        createMap(earthquakes);
    }

    function createMap(earthquakes) {
        let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
    
        let baseMaps = {
            "Street Map": streetMap
        };
    
        let overlayMaps = {
            "Earthquakes": earthquakes
        };
    
        let map = L.map("map", {
            center: [37.09, -95.71], // Center over the US
            zoom: 5,
            layers: [streetMap, earthquakes]
        });
    
        // Add a legend
        let legend = L.control({ position: "bottomright" });
        legend.onAdd = function () {
            let div = L.DomUtil.create("div", "info legend");
            let depths = [-10, 10, 30, 50, 70, 90];
            let colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];
    
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    `<i style="background:${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
            }
            return div;
        };
        legend.addTo(map);
    
        L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
    }
    