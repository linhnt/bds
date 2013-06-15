var map;
var poly;
var markerArray = new Array();
var markerPosArray = new Array();
var rectangleArray = new Array();
var countMarker = 0;
var curTab = '#func1';
var markerImage;

$(document).ready(function(){
  initialize();
  enableSelectable();

  $('#myTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');

    curTab = $(this).attr('href');

    if (map) {
      removeMarkers();
      $('.list-markers').empty();
    }
  })
})

function initialize(){
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(21.033333, 105.85),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Create our "tiny" marker icon
  markerIcon = new google.maps.MarkerImage(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NUlH5v9rF5f+ZoCAwHaig8B8oPhOmKC1NU/P//7Q0DByrqgpSGAtSdOCAry9WRXt9fECK9oIUPXwYFYVV0e2ICJCi20SbFAuyG5uiECUlkKIQmOPng3y30d0d7Lt1bm4w301jQAOgcNoIDad1yOEEAFm9fSv/VqtJAAAAAElFTkSuQmCC",
    new google.maps.Size(9, 9),
    new google.maps.Point(0, 0),
    new google.maps.Point(4, 5)
  );
}

function enableSelectable(){
  google.maps.event.addListener(map, 'click', function(event) {
    switch (curTab){
    case '#func1':
      var size = prompt("Enter size of overlay:", "20, 20");
      if (size){
        addMarker(event.latLng);
        addToList(event.latLng, countMarker);
        addRectangle(event.latLng, size);
      }
      break;
    case '#func2':
      addMarker(event.latLng);
      addToList(event.latLng, countMarker);
      showPolygon(markerPosArray);
      break;
    }
  });
}

function addRectangle(pos, size){
  var size = size.split(",");
  if (isNaN(parseInt(size[0]))) size[0] = 20;
  if (isNaN(parseInt(size[1]))) size[1] = 20;
  var rectangle = new google.maps.Rectangle();
  var rectOptions = {
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map,
      // editable: true,
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(pos.lat() - size[0]/2000, pos.lng() - size[1]/2000),
        new google.maps.LatLng(pos.lat() + size[0]/2000, pos.lng() + size[1]/2000)
      )
    };
    rectangle.setOptions(rectOptions);
    rectangleArray.push(rectangle);
}

function showPolygon(posArray){
  if (!poly){
    poly = new google.maps.Polygon({
      paths: posArray,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map
    });
  } else{
    poly.setPaths(posArray);
  }
}

function addToList(pos, count){
  var html = '<li class="marker-' + countMarker + '">' + countMarker + '.  ' + Math.round(pos.lat() * 1000000)/1000000 + ',' + Math.round(pos.lng() * 1000000)/1000000 + ' <a href="javascript:void(0)" onclick="return removeMarker(' + count + ')">remove</a></li>';
  $(curTab + ' .list-markers').append(html);
}

function addMarker(location){
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      title: 'marker ' + (countMarker + 1),
      icon: markerIcon
  });
  markerArray.push(marker);
  markerPosArray.push(new google.maps.LatLng(location.lat(), location.lng()));
  countMarker++;
  return true;
}

function removeMarkers(){
  for (i in markerArray){
    if (markerArray[i] != null){
      markerArray[i].setMap(null)
    }
  }
  markerArray.length = 0;
  markerPosArray.length = 0;
  countMarker = 0;
  removeRectangles();
  showPolygon(markerPosArray);
  return false;
}

function removeRectangles(){
  for (i in rectangleArray){
    if (rectangleArray[i] != null){
      rectangleArray[i].setMap(null)
    }
  }
  rectangleArray.length = 0;
}

function removeMarker(iMarker){
  if (markerArray.length != 0){
    markerArray[iMarker - 1].setMap(null);
    markerArray[iMarker - 1] = null;
    updatePosArray();
    $('.marker-' + iMarker).remove();

    if (curTab == '#func1'){
      rectangleArray[iMarker - 1].setMap(null);
      rectangleArray[iMarker - 1] = null;
    } else{
      showPolygon(markerPosArray);
    }
    return true
  }
  return false
}

function updatePosArray(){
  markerPosArray.length = 0;
  for (i in markerArray){
    if (markerArray[i] != null){
      markerPosArray.push(new google.maps.LatLng(markerArray[i].getPosition().lat(), markerArray[i].getPosition().lng()));
    }
  }
}