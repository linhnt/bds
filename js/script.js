var map;
var poly;
var markerArray = new Array();
var markerPosArray = new Array();
var countMarker = 0;

$(document).ready(function(){
  initialize();
  enableSelectable();
  $('#myTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
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
}

function enableSelectable(){
  google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
    addToList(event.latLng, countMarker);
    showPolygon(markerPosArray);
  });
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
  $('.list-markers').append(html);
}

function addMarker(location){
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      title: 'marker ' + (countMarker + 1)
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
  showPolygon(markerPosArray);
  return false;
}

function removeMarker(iMarker){
  if (markerArray.length != 0){
    markerArray[iMarker - 1].setMap(null);
    markerArray[iMarker - 1] = null;
    updatePosArray();
    $('.marker-' + iMarker).remove();
    showPolygon(markerPosArray);
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