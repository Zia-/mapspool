// 1 ---------------------------------------------------------------------------
function loadJSON(file, callback) {
  // Load JSON file from local drive
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

// 2 ---------------------------------------------------------------------------
jQuery.loadScript = function (url, callback) {
  // Load JS scripts from JS
  jQuery.ajax({
    url: url,
    dataType: 'script',
    success: callback,
    async: true
  });
}

// 3 ---------------------------------------------------------------------------
jQuery.loadStyleSheet = function (url, callback) {
  // Load StyleSheet from JS
  jQuery.ajax({
    url: url,
    dataType: 'stylesheet',
    success: callback,
    async: true
  });
}

// 4 ---------------------------------------------------------------------------
function stopTimer(){timerLive = false;}

// 5 ---------------------------------------------------------------------------
var timerLive = true;
var loopingTimeCounter = 0;
function runVideo() {
  loopingTimeCounter++;
  // This will change the state of the map
  mapInstance(loopingTimeCounter);
  // Kill looping after the video duration is over
  if (loopingTimeCounter == videoJSON["videoMetadata"]["duration"]){stopTimer();}
  // This will keep looping every 1 sec for ever.
  if (timerLive){setTimeout(runVideo, 1000);}
}

// 6 ---------------------------------------------------------------------------
function mapInstance(timeLapsed){
  if ($.inArray(timeLapsed, timeInstancesList) != -1){
    createInstance(timeLapsed);
  }
}

// 7 ---------------------------------------------------------------------------
function createInstance(timeLapsed){
  // Change state of the map here
  for (i=0; i<videoJSON["videoData"].length; i++){
    if (timeLapsed == videoJSON["videoData"][i]["timeInstance"]){
      baseMapType = videoJSON["videoData"][i]["baseMapType"];
      baseMapStyle = videoJSON["videoData"][i]["baseMapStyle"];
      baseMapCenterX = videoJSON["videoData"][i]["baseMapCenterX"];
      baseMapCenterY = videoJSON["videoData"][i]["baseMapCenterY"];
      baseMapZoom = videoJSON["videoData"][i]["baseMapZoom"];
      geojsonInstance = videoJSON["videoData"][i]["geojsonInstance"];
      if (baseMapType == "mapbox"){
        instanceMapbox(baseMapStyle, baseMapCenterX, baseMapCenterY, baseMapZoom, geojsonInstance)
      } else if (baseMapType == "google"){
        console.log("baseMapType = google");
      } else if (baseMapType == "bing"){
        console.log("baseMapType = bing");
      }
    }
  }
}

// 8 ---------------------------------------------------------------------------
var mapboxMap, popup;
var mapboxLayersList = []
function instanceMapbox(baseMapStyle, baseMapCenterX, baseMapCenterY, baseMapZoom, geojsonInstance){
  mapboxgl.accessToken = 'pk.eyJ1IjoiemlhLW0iLCJhIjoiQjM5aVpfTSJ9.s_U7YxQCK-Zq5SaJemH5bA';
  if (mapboxMap == null){
    mapboxMap = new mapboxgl.Map({
      container: 'map',
      style: baseMapStyle,
      center: [baseMapCenterX, baseMapCenterY],
      zoom: baseMapZoom
    });
    popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    mapboxMap.on('load', function (){
      mapboxMapAddLayer(geojsonInstance)
    });
  } else {
    mapboxMapAddLayer(geojsonInstance);
    mapboxMap.flyTo({
          center: [baseMapCenterX, baseMapCenterY],
          zoom: baseMapZoom,
          speed: 0.2,
          curve: 1,
      });
  }
}

// 9 ---------------------------------------------------------------------------
function mapboxMapAddLayer(geojsonData){
  if (mapboxLayersList.length > 0){
    // Remove any old layer in mapboxMap, source, and it's style.
    for (j=0; j<mapboxLayersList.length; j++){
      mapboxMap.removeLayer(mapboxLayersList[j])
      mapboxMap.removeSource(mapboxLayersList[j])
      for (k=0; k<mapboxMap.getStyle().layers.length; k++){
        if (mapboxMap.getStyle().layers[k]["id"] == mapboxLayersList[k]){
          mapboxMap.getStyle().layers.splice(k,1);
        }
      }
    }
    mapboxLayersList = []
  }
  counterLayerID = 0;
  for (l=0; l<geojsonData["features"].length; l++){
    // Add new layers for each time instance
    counterLayerID++;
    mapboxLayersList.push(counterLayerID.toString());
    if (geojsonData["features"][l]["properties"]["visibility"] == "off"){
      mapboxMap.addLayer({
        "id": counterLayerID.toString(),
        "type": "circle",
        "source": {"type": "geojson", "data": geojsonData["features"][l]},
        "paint": {"circle-radius": 0, "circle-color": "#FFFFFF"}
      })
    } else if (geojsonData["features"][l]["geometry"]["type"] == "Point"){
      mapboxMap.addLayer({
        "id": counterLayerID.toString(),
        "type": "circle",
        "source": {"type": "geojson", "data": geojsonData["features"][l]},
        "paint": {"circle-radius": 3, "circle-color": "#B40404"}
      });
      mapboxMap.on('mouseenter', counterLayerID.toString(), function(e) {
        mapboxMap.getCanvas().style.cursor = 'pointer';
        if (typeof e.features[0].properties.description === "undefined"){
          var description = "unknown data-point"
        } else {
          var description = e.features[0].properties.description
        }
        popup.setLngLat(e.features[0].geometry.coordinates)
            .setHTML(description)
            .addTo(mapboxMap);
      });
      mapboxMap.on('mouseleave', counterLayerID.toString(), function() {
          mapboxMap.getCanvas().style.cursor = '';
          popup.remove();
      });
    } else if (geojsonData["features"][l]["geometry"]["type"] == "LineString"){
      mapboxMap.addLayer({
        "id": counterLayerID.toString(),
        "type": "line",
        "source": {"type": "geojson", "data": geojsonData["features"][l]},
        "paint": {"line-color": "#888", "line-width": 8}
      });
      mapboxMap.on('mouseenter', counterLayerID.toString(), function(e) {
        mapboxMap.getCanvas().style.cursor = 'pointer';
        if (typeof e.features[0].properties.description === "undefined"){
          var description = "unknown data-point"
        } else {
          var description = e.features[0].properties.description
        }
        popup.setLngLat(e.features[0].geometry.coordinates[0][0])
            .setHTML(description)
            .addTo(mapboxMap);
      });
      mapboxMap.on('mouseleave', counterLayerID.toString(), function() {
          mapboxMap.getCanvas().style.cursor = '';
          popup.remove();
      });
    } else if (geojsonData["features"][l]["geometry"]["type"] == "Polygon"){
      mapboxMap.addLayer({
        "id": counterLayerID.toString(),
        "type": "fill",
        "source": {"type": "geojson", "data": geojsonData["features"][l]},
        "paint": {"fill-color": "#FF8000", "fill-opacity": 0.5}
      });
      mapboxMap.on('mouseenter', counterLayerID.toString(), function(e) {
        mapboxMap.getCanvas().style.cursor = 'pointer';
        if (typeof e.features[0].properties.description === "undefined"){
          var description = "unknown data-point"
        } else {
          var description = e.features[0].properties.description
        }
        popup.setLngLat(e.features[0].geometry.coordinates[0][0])
            .setHTML(description)
            .addTo(mapboxMap);
      });
      mapboxMap.on('mouseleave', counterLayerID.toString(), function() {
          mapboxMap.getCanvas().style.cursor = '';
          popup.remove();
      });
    } else if (geojsonData["features"][l]["geometry"]["type"] == "MultiLineString"){
      mapboxMap.addLayer({
        "id": counterLayerID.toString(),
        "type": "line",
        "source": {"type": "geojson", "data": geojsonData["features"][l]},
        "paint": {"line-color": "#888", "line-width": 8}
      });
      mapboxMap.on('mouseenter', counterLayerID.toString(), function(e) {
        mapboxMap.getCanvas().style.cursor = 'pointer';
        if (typeof e.features[0].properties.description === "undefined"){
          var description = "unknown data-line"
        } else {
          var description = e.features[0].properties.description
        }
        //var popupLocation = Math.ceil(e.features[0].geometry.coordinates.length/2);
        popup.setLngLat(e.features[0].geometry.coordinates[0][0])
            .setHTML(description)
            .addTo(mapboxMap);
      });
      mapboxMap.on('mouseleave', counterLayerID.toString(), function() {
          mapboxMap.getCanvas().style.cursor = '';
          popup.remove();
      });
    }
  }
}










//
