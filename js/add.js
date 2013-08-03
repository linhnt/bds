var map, markerIcon, selectedArea;
var pointArray = new Array();//selected points
var markerArray = new Array();
var countMarker = 0;
//No need markers anymore
var selectHandler = false;

$(document).ready(function() {
	initializeMap();
	displayArea();//Vẽ lại area trong trường hợp Edit
	addSelectHandler();

	$(document).on('click', '.remove-area', function(){
		removeAllMarkers();
		removeArea();
		$('.point-list ol').empty();
		enableAutoSelectable();
		if (!selectHandler) addSelectHandler();
	})
});

function enableAutoSelectable(){
	$('input[name="auto-select"]').attr('disabled', false);
}
function disableAutoSelectable(){
	$('input[name="auto-select"]').attr('disabled', 'disabled');
}

function initializeMap() {
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

function addSelectHandler() {
	selectHandler = google.maps.event.addListener(map, 'click', function(event) {
		var isAuto = $('input[name="auto-select"]').is(':checked');
		if (pointArray.length == 0 || isAuto) {
			disableAutoSelectable();
		}

		if (isAuto) {
			//select rectangle
			var size = prompt("Enter size of overlay:", "20, 20");
			if (size){
				addRectangle(event.latLng, size);
				removeSelectHandler();
			} else{
				alert('Xin hãy chọn kích thước');
			}
		} else {
			//manual select
			addMarker(event.latLng);
			drawArea();
		}
	});
	return true;
}

function removeSelectHandler() {
	google.maps.event.removeListener(selectHandler);
	selectHandler = false;
}

function addMarker(location){
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		title: 'marker ' + (countMarker + 1),
		icon: markerIcon
	});
	markerArray.push(marker);
	pointArray.push(new google.maps.LatLng(location.lat(), location.lng()));
	countMarker++;
	addToList(location);
}

function removeMarker(iMarker){
	if (markerArray.length != 0){
		markerArray[iMarker - 1].setMap(null);
		markerArray[iMarker - 1] = null;
		updatePointArray();
		$('.marker-' + iMarker).remove();
		if (markerArray.length == 0) enableAutoSelectable();
	}
}

function removeAllMarkers() {
	for (i in markerArray) {
		if (markerArray[i] != null) {
			markerArray[i].setMap(null)
		}
	}
	markerArray.length = 0;
	pointArray.length = 0;
	countMarker = 0;
}

function addToList(pos){
	var listContainer = $('.point-list ol');
	var html = [
		'<li class="marker-' + countMarker + '">',
			'Điểm ' + countMarker,
			'<input type="hidden" name="point[]" value="' + pos.lat() + ',' + pos.lng() + '"/>',
			'<a href="javascript:void(0)" class="remove-marker" onclick="return removeMarker(' + countMarker + ')">remove</a>',
		'</li>'
	];
	listContainer.append(html.join(''));
}

function addRectangle(pos, size) {
	var size = size.split(",") || size.split(" ");
	if (isNaN(parseInt(size[0]))) size[0] = 20;
	if (isNaN(parseInt(size[1]))) size[1] = 20;
		
	addMarker(new google.maps.LatLng(pos.lat() - size[0]/2000, pos.lng() - size[1]/2000));
	addMarker(new google.maps.LatLng(pos.lat() - size[0]/2000, pos.lng() + size[1]/2000));
	addMarker(new google.maps.LatLng(pos.lat() + size[0]/2000, pos.lng() + size[1]/2000));
	addMarker(new google.maps.LatLng(pos.lat() + size[0]/2000, pos.lng() - size[1]/2000));
	drawArea();
}

function drawArea() {
	if (!selectedArea){
		selectedArea = new google.maps.Polygon({
			paths: pointArray,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 3,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map
		});
	} else{
		selectedArea.setPaths(pointArray);
	}
}

function removeArea() {
	drawArea();
}

function displayArea() {
	var bounds = new google.maps.LatLngBounds();
	$('.point-list ol li').each(function(){
		var pos = $(this).find('input').val().split(",");
		pointArray.push(new google.maps.LatLng(pos[0], pos[1]));
		bounds.extend(new google.maps.LatLng(pos[0], pos[1]));
	});
	drawArea();
	map.fitBounds(bounds);
}

function updatePointArray() {
	pointArray.length = 0;
	for (i in markerArray){
		if (markerArray[i] != null){
			pointArray.push(new google.maps.LatLng(markerArray[i].getPosition().lat(), markerArray[i].getPosition().lng()));
		}
	}
	drawArea();
}