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

// Accurate Reservoir Area Metrics Reference Data (Verified 2026)
var metrics = {
    "Kalatuwawa": { area2019: "1.33 km²", area2026: "0.98 km²", change: "-0.35 km² (-26.17%)" },
    "Labugama": { area2019: "0.66 km²", area2026: "0.62 km²", change: "-0.04 km² (-6.60%)" }
};

function getReservoirInfo(lat) {
    return (lat > 6.845) ? { name: "Kalatuwawa Reservoir", data: metrics["Kalatuwawa"] } 
                         : { name: "Labugama Reservoir", data: metrics["Labugama"] };
}

// 3. Render 2019 Layer (Orange)
var layer2019 = L.geoJSON(data2019, {
    style: { color: '#d35400', fillColor: '#e67e22', fillOpacity: 0.65, weight: 2 },
    onEachFeature: function (feature, layer) {
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        var res = getReservoirInfo(center.lat);

        layer.bindTooltip(res.name + " (2019)", { permanent: false, direction: 'top' });
        layer.bindPopup(
            "<h3>" + res.name + " (2019)</h3>" +
            "<p><b>Baseline Water Extent:</b> " + res.data.area2019 + "</p>" +
            "<p><b>Data Source:</b> Landsat NDWI</p>"
        );
    }
}).addTo(map);

// 4. Render 2026 Layer (Blue)
var layer2026 = L.geoJSON(data2026, {
    style: { color: '#1b4f72', fillColor: '#3498db', fillOpacity: 0.75, weight: 2 },
    onEachFeature: function (feature, layer) {
        var bounds = layer.getBounds();
        var center = bounds.getCenter();
        var res = getReservoirInfo(center.lat);

        layer.bindTooltip(res.name + " (2026)", { permanent: false, direction: 'top' });
        layer.bindPopup(
            "<h3>" + res.name + " (2026)</h3>" +
            "<p><b>2026 Water Extent:</b> " + res.data.area2026 + "</p>" +
            "<p><b>2019 Water Extent:</b> " + res.data.area2019 + "</p>" +
            "<p><b>Net Area Change:</b> <span class='badge-dec'>" + res.data.change + "</span></p>" +
            "<p><b>Data Source:</b> Landsat NDWI</p>"
        );
    }
}).addTo(map);

if (layer2026.getBounds().isValid()) {
    map.fitBounds(layer2026.getBounds());
}

// 5. Scale Control (Metric Scale Bar)
L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

// 6. Layer Control
var baseMaps = { "Esri Topo Map": osm, "Satellite Imagery": satellite };
var overlayMaps = { "Water Extent 2019": layer2019, "Water Extent 2026": layer2026 };
L.control.layers(baseMaps, overlayMaps, { collapsed: false, position: 'topright' }).addTo(map);

// 7. Quick Zoom Control Buttons
var zoomControl = L.control({ position: 'topleft' });
zoomControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'zoom-bar');
    div.innerHTML = '<button class="zoom-btn" onclick="map.flyTo([6.852, 80.19], 14)">🔍 Kalatuwawa</button>' +
                    '<button class="zoom-btn" onclick="map.flyTo([6.837, 80.178], 14)">🔍 Labugama</button>';
    return div;
};
zoomControl.addTo(map);

// 8. Dynamic Opacity Control Slider
var opacityControl = L.control({ position: 'topright' });
opacityControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'opacity-box');
    div.innerHTML = '<div>2026 Layer Opacity</div>' +
                    '<input type="range" id="opacitySlider" min="0" max="1" step="0.1" value="0.75" oninput="changeOpacity(this.value)">';
    return div;
};
opacityControl.addTo(map);

function changeOpacity(val) {
    layer2026.setStyle({ fillOpacity: val });
}

// 9. Legend
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h4>Map Legend</h4>';
    div.innerHTML += '<div class="legend-item"><i style="background: #e67e22; border: 1px solid #d35400;"></i> Water Extent 2019</div>';
    div.innerHTML += '<div class="legend-item"><i style="background: #3498db; border: 1px solid #1b4f72;"></i> Water Extent 2026</div>';
    return div;
};
legend.addTo(map);

// 10. Custom North Arrow Control
var northArrow = L.control({ position: 'bottomleft' });
northArrow.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'north-arrow');
    div.innerHTML = '<div style="font-size: 20px; font-weight: bold; color: #1e3c72; line-height: 1;">⬆ N</div>';
    return div;
};
northArrow.addTo(map);
