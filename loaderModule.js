// 1 ---------------------------------------------------------------------------
function onAllLoad(){
  loadBasicHTMLContent();
  startTimer();
};

// 2 ---------------------------------------------------------------------------
function loadBasicHTMLContent(){
  document.title = videoJSON["videoMetadata"]["title"];
}

// 3 ---------------------------------------------------------------------------
function startTimer(){timerLive = true; runVideo();}
