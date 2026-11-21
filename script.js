// 1. Initialize the Map centered between Labugama & Kalatuwawa
var map = L.map('map', {
    center: [6.845, 80.195],
    zoom: 13,
    zoomControl: true
});

// 2. Basemaps
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
}).addTo(map);

var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
});

// 3. Helper function to extract Reservoir Name & Area safely
function getFeatureDetails(props, fallbackYear) {
    var rawName = (props.Reservoir || props.name || props.Name || "").toString().toLowerCase();
    var resName = "Reservoir";
    if (rawName.includes("kalatuwawa")) {
        resName = "Kalatuwawa Reservoir";
    } else if (rawName.includes("labugama")) {
        resName = "Labugama Reservoir";
    }

    var areaVal = props.Area || props.area || props.km2 || props.Shape_Area;
    var areaText = areaVal ? Number(areaVal).toFixed(2) + " km²" : (
        resName.includes("Kalatuwawa") 
            ? (fallbackYear === "2019" ? "1.33 km²" : "0.98 km²")
            : (fallbackYear === "2019" ? "0.66 km²" : "0.62 km²")
    );

    return { name: resName, area: areaText };
}

// 4. GeoJSON Layers (2019, 2026, and Dissolved Water Loss)
var layer2019 = L.geoJSON(data2019, {
    style: {
        color: '#d35400',
        fillColor: '#f39c12',
        fillOpacity: 0.55,
        weight: 2
    },
    onEachFeature: function (feature, layer) {
        var info = getFeatureDetails(feature.properties || {}, "2019");
        layer.bindTooltip(info.name + " (2019)", { sticky: true });
        layer.bindPopup(
            "<h3>" + info.name + "</h3>" +
            "<p><b>Observation Date:</b> January 3, 2019</p>" +
            "<p><b>Surface Water Area:</b> " + info.area + "</p>" +
            "<p><b>Sensor:</b> Landsat 8 OLI (NDWI &gt; -0.1)</p>"
        );
    }
}).addTo(map);

var layer2026 = L.geoJSON(data2026, {
    style: {
        color: '#1b4f72',
        fillColor: '#2980b9',
        fillOpacity: 0.70,
        weight: 2
    },
    onEachFeature: function (feature, layer) {
        var info = getFeatureDetails(feature.properties || {}, "2026");
        var changeText = info.name.includes("Kalatuwawa") ? "-0.35 km² (-26.17%)" : "-0.04 km² (-6.60%)";
        layer.bindTooltip(info.name + " (2026)", { sticky: true });
        layer.bindPopup(
            "<h3>" + info.name + "</h3>" +
            "<p><b>Observation Date:</b> September 12, 2026</p>" +
            "<p><b>Surface Water Area:</b> " + info.area + "</p>" +
            "<p><b>Net Change (2019–2026):</b> <span class='badge-dec'>" + changeText + "</span></p>"
        );
    }
}).addTo(map);

var layerLoss = L.geoJSON(dataLoss, {
    style: {
        color: '#922b21',
        fillColor: '#e74c3c',
        fillOpacity: 0.85,
        weight: 1.5
    },
    onEachFeature: function (feature, layer) {
        var props = feature.properties || {};
        var resName = props.Reservoir || "Reservoir";
        var lossVal = props.SUM_km2 ? Number(props.SUM_km2).toFixed(4) : (resName === "Kalatuwawa" ? "0.3522" : "0.0418");
        var pctText = (resName === "Kalatuwawa") ? "-26.17% net change" : "-6.60% net change";

        layer.bindTooltip(resName + " Water Loss (-" + Number(lossVal).toFixed(2) + " km²)", { sticky: true });
        layer.bindPopup(
            "<h3>" + resName + " — Dissolved Water Loss</h3>" +
            "<p><b>Exposed Shoreline Area:</b> <span class='badge-dec'>-" + lossVal + " km² (" + pctText + ")</span></p>" +
            "<p><b>GIS Method:</b> ArcGIS Pro Erase (2019 − 2026), Sliver Removal (&lt; 0.0009 km²), &amp; Dissolve.</p>" +
            "<p><i>Priority zone for shoreline protection and reforestation.</i></p>"
        );
    }
}).addTo(map);

// 5. Top-Right: North Arrow (1st) & Map Legend (2nd)
var topRightControls = L.control({ position: 'topright' });
topRightControls.onAdd = function () {
    var div = L.DomUtil.create('div');
    div.innerHTML = `
        <div class="north-arrow">
            <b style="font-size:14px; color:#1e3c72;">▲<br>N</b>
        </div>
        <div class="legend" style="margin-bottom: 6px;">
            <h4>Map Legend</h4>
            <div class="legend-item"><i style="background: #f39c12; border: 1px solid #d35400;"></i> 2019 Water Extent</div>
            <div class="legend-item"><i style="background: #2980b9; border: 1px solid #1b4f72;"></i> 2026 Water Extent</div>
            <div class="legend-item"><i style="background: #e74c3c; border: 1px solid #922b21;"></i> Water Loss (2019–2026)</div>
        </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
};
topRightControls.addTo(map);

// 6. Layer Control (Auto-collapses on mobile screens <= 650px, stays expanded on laptop/desktop)
var baseMaps = {
    "🛰️ Esri Satellite Imagery": satellite,
    "🗺️ OpenStreetMap Streets": streets,
    "⛰️ Topographic Map": topo
};

var overlayMaps = {
    "🟠 Water Extent (Jan 2019)": layer2019,
    "🔵 Water Extent (Sep 2026)": layer2026,
    "🔴 Water Loss (2019–2026)": layerLoss
};

var isMobile = window.innerWidth <= 650;
L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: isMobile }).addTo(map);

// 7. Quick Zoom Buttons & Opacity Slider (Top-Left)
var customControls = L.control({ position: 'topleft' });
customControls.onAdd = function () {
    var div = L.DomUtil.create('div');
    div.innerHTML = `
        <div class="zoom-bar">
            <button class="zoom-btn" onclick="zoomToArea('all')">Overview</button>
            <button class="zoom-btn" onclick="zoomToArea('kalatuwawa')">Kalatuwawa</button>
            <button class="zoom-btn" onclick="zoomToArea('labugama')">Labugama</button>
        </div>
        <div class="opacity-box">
            <label for="opacitySlider">2026 Layer Opacity: <span id="opVal">70%</span></label><br>
            <input type="range" id="opacitySlider" min="0" max="1" step="0.05" value="0.70">
        </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
};
customControls.addTo(map);

function zoomToArea(target) {
    if (target === 'kalatuwawa') {
        map.flyTo([6.842, 80.205], 14);
    } else if (target === 'labugama') {
        map.flyTo([6.848, 80.175], 14);
    } else {
        map.flyTo([6.845, 80.195], 13);
    }
}

document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'opacitySlider') {
        var val = parseFloat(e.target.value);
        document.getElementById('opVal').innerText = Math.round(val * 100) + "%";
        layer2026.setStyle({ fillOpacity: val });
    }
});

// 8. Metric & Imperial Scale Bar (Bottom-Left)
L.control.scale({ position: 'bottomleft', imperial: true, metric: true }).addTo(map);
