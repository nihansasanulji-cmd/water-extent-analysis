// 1. Initialize Map
var map = L.map('map').setView([6.84, 80.18], 13);

// 2. Base Layers
var osm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
}).addTo(map);

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
});

function getReservoirName(lat) {
    return (lat > 6.845) ? "Kalatuwawa Reservoir" : "Labugama Reservoir";
}

// 3. Render 2019 Layer
var layer2019 = L.geoJSON(data2019, {
    style: { color: '#d35400', fillColor: '#e67e22', fillOpacity: 0.6, weight: 2 },
    onEachFeature: function (feature, layer) {
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        var name = getReservoirName(center.lat);
        layer.bindTooltip(name + " (2019)", { permanent: false, direction: 'top' });
        layer.bindPopup("<h3>" + name + "</h3><p><b>Analysis Year:</b> 2019</p><p><b>Data Source:</b> Landsat NDWI</p>");
    }
}).addTo(map);

// 4. Render 2026 Layer
var layer2026 = L.geoJSON(data2026, {
    style: { color: '#1b4f72', fillColor: '#3498db', fillOpacity: 0.75, weight: 2 },
    onEachFeature: function (feature, layer) {
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        var name = getReservoirName(center.lat);
        layer.bindTooltip(name + " (2026)", { permanent: false, direction: 'top' });
        layer.bindPopup("<h3>" + name + "</h3><p><b>Analysis Year:</b> 2026</p><p><b>Data Source:</b> Landsat NDWI</p>");
    }
}).addTo(map);

// 5. Fit Bounds
if (layer2026.getBounds().isValid()) {
    map.fitBounds(layer2026.getBounds());
}

// 6. Add Scale Control
L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

// 7. Layer Switcher
var baseMaps = { "Esri Topo Map": osm, "Satellite Imagery": satellite };
var overlayMaps = { "Water Extent 2019": layer2019, "Water Extent 2026": layer2026 };
L.control.layers(baseMaps, overlayMaps, { collapsed: false, position: 'topright' }).addTo(map);

// 8. Legend
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h4>Map Legend</h4>';
    div.innerHTML += '<div class="legend-item"><i style="background: #e67e22; border: 1px solid #d35400;"></i> Water Extent 2019</div>';
    div.innerHTML += '<div class="legend-item"><i style="background: #3498db; border: 1px solid #1b4f72;"></i> Water Extent 2026</div>';
    return div;
};
legend.addTo(map);