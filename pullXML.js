loadJSON("9999.json", function(text){
  videoJSON = JSON.parse(text);
  scriptsList = []
  timeInstancesList = []
  for (i=0; i<videoJSON["videoData"].length; i++){
    timeInstancesList.push(videoJSON["videoData"][i]["timeInstance"]) // Creates time instances list
    if (scriptsList.indexOf(videoJSON["videoData"][i]["baseMapTypeJS"]) === -1) scriptsList.push(videoJSON["videoData"][i]["baseMapTypeJS"]); // Creates list of scripts needed
    if (scriptsList.indexOf(videoJSON["videoData"][i]["baseMapTypeCSS"]) === -1) scriptsList.push(videoJSON["videoData"][i]["baseMapTypeCSS"]); // Creates list of stylesheets needed
  }
  for (i=0; i<scriptsList.length; i++){
    // Loading scripts required for this video
    if (scriptsList[i] == "/v0.39.1/mapbox-gl.js"){
      $.loadScript('https://api.tiles.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.js', function(){});
    } else if (scriptsList[i] == "/v0.39.1/mapbox-gl.css"){
      $.loadStyleSheet('https://api.tiles.mapbox.com/mapbox-gl-js/v0.39.1/mapbox-gl.css', function(){});
    }
  }
});
