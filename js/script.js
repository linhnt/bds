var map;
var selectedArea;//rectangle or polygon
var pointArray = new Array();//selected points
var areaArray = new Array();//array of rectangle or polygon
var countArea = 0;
//No need markers anymore
var selectHandler = false;

$(document).ready(function() {
	initializeMap();
	enableSelectHandler();

	$(document).on('click', '.remove', function(){
		//remove list
		var _thisClosedTr = $(this).closest('tr');
		if (_thisClosedTr.hasClass('saved')){
			areaArray[_thisClosedTr.data('cid')].setMap(null);
			areaArray[_thisClosedTr.data('cid')] = undefined;
		} else{
			selectedArea.setMap(null);
		}
		_thisClosedTr.remove();
		// countArea--;
		resetSelect();
		enableSelectHandler();
		console.log(areaArray);
	})

	$(document).on('click', '.add', function(){
		$('.loader').show();
		var _thisClosedTr = $(this).closest('tr');

		//Popup open
		//...

		//Then (stimulate) Ajax call
		var _this = $(this);
		window.setTimeout(function(){
			$('.loader').hide();
			_this.remove();
			areaArray[countArea] = selectedArea;
			resetSelect();
			_thisClosedTr.addClass('saved');
			enableSelectHandler();
			console.log(areaArray);
		}, 1000);
	})
});

function resetSelect() {
	//remove polygon
	pointArray.length = 0;
	selectedArea = false;
}

function initializeMap() {
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(21.033333, 105.85),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	// Create our "tiny" marker icon
	// markerIcon = new google.maps.MarkerImage(
	// 	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NUlH5v9rF5f+ZoCAwHaig8B8oPhOmKC1NU/P//7Q0DByrqgpSGAtSdOCAry9WRXt9fECK9oIUPXwYFYVV0e2ICJCi20SbFAuyG5uiECUlkKIQmOPng3y30d0d7Lt1bm4w301jQAOgcNoIDad1yOEEAFm9fSv/VqtJAAAAAElFTkSuQmCC",
	// 	new google.maps.Size(9, 9),
	// 	new google.maps.Point(0, 0),
	// 	new google.maps.Point(4, 5)
	// );
}

function enableSelectHandler() {
	selectHandler = google.maps.event.addListener(map, 'click', function(event) {
		var isAuto = $('input[name="auto-select"]').is(':checked');
		if (pointArray.length == 1 || isAuto) {
			// insert new area
			countArea++;
			var orderNumber = $('.list-area tr').length;
			var html = [
			'<tr id="row-' + countArea + '" data-cid="' + countArea + '">',
				'<td>' + orderNumber + '</td>', 
				'<td id="pos-' + countArea + '">Vùng chọn ' + orderNumber + '</td>',
				'<td>',
					'<a class="btn btn-primary add" href="javascript:void(0)">thêm</button>',
					'<a class="btn btn-danger remove" href="javascript:void(0)">xóa</a>',
				'</td>',
			'</tr>'];
			$(' .list-area').append(html.join(''));
		}

		if (isAuto) {
			//select rectangle
			var size = prompt("Enter size of overlay:", "20, 20");
			if (size){
				// addToList(event.latLng);
				addRectangle(event.latLng, size);
				console.log('disabled');
				disableSelectHandler();
			}
		} else {
			//manual select
			addToList(event.latLng);
			addPolygon(pointArray);
		}
	});
	return true;
}

function disableSelectHandler() {
	google.maps.event.removeListener(selectHandler);
	return false;
}

function addRectangle(pos, size) {
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
		// rectangleArray.push(rectangle);
		selectedArea = rectangle;
		addToList(new google.maps.LatLng(pos.lat() - size[0]/2000, pos.lng() - size[1]/2000));
		addToList(new google.maps.LatLng(pos.lat() - size[0]/2000, pos.lng() + size[1]/2000));
		addToList(new google.maps.LatLng(pos.lat() + size[0]/2000, pos.lng() - size[1]/2000));
		addToList(new google.maps.LatLng(pos.lat() + size[0]/2000, pos.lng() + size[1]/2000));
}

function addPolygon(posArray) {
	if (!selectedArea){
		selectedArea = new google.maps.Polygon({
			paths: posArray,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 3,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map
		});
	} else{
		selectedArea.setPaths(posArray);
	}
}

function addToList(pos) {
	var posValue = Math.round(pos.lat() * 1000000)/1000000 + ',' + Math.round(pos.lng() * 1000000)/1000000;
	$('#pos-' + countArea).append($('<input type="hidden" name="area-latlon[]" value="' + posValue + '"/>'));
	pointArray.push(pos);
}

// function addMarker(location){
// 	var marker = new google.maps.Marker({
// 			position: location,
// 			map: map,
// 			title: 'marker ' + (countMarker + 1),
// 			icon: markerIcon
// 	});
// 	markerArray.push(marker);
// 	pointArray.push(new google.maps.LatLng(location.lat(), location.lng()));
// 	countMarker++;
// 	return true;
// }

// function removeMarker(location){
// 	var marker = new google.maps.Marker({
// 			position: location,
// 			map: map,
// 			title: 'marker ' + (countMarker + 1),
// 			icon: markerIcon
// 	});
// 	markerArray.push(marker);
// 	pointArray.push(new google.maps.LatLng(location.lat(), location.lng()));
// 	countMarker++;
// 	return true;
// }

// function removeMarkers() {
// 	for (i in markerArray) {
// 		if (markerArray[i] != null) {
// 			markerArray[i].setMap(null)
// 		}
// 	}
// 	markerArray.length = 0;
// 	pointArray.length = 0;
// 	countMarker = 0;
// 	removeRectangles();
// 	addPolygon(pointArray);
// 	return false;
// }

// function removeRectangles() {
// 	for (i in rectangleArray){
// 		if (rectangleArray[i] != null){
// 			rectangleArray[i].setMap(null)
// 		}
// 	}
// 	rectangleArray.length = 0;
// }

// function removeMarker(iMarker) {
// 	if (markerArray.length != 0){
// 		markerArray[iMarker - 1].setMap(null);
// 		markerArray[iMarker - 1] = null;
// 		updatePosArray();
// 		$('.marker-' + iMarker).remove();

// 		if (curTab == '#func1'){
// 			rectangleArray[iMarker - 1].setMap(null);
// 			rectangleArray[iMarker - 1] = null;
// 		} else{
// 			addPolygon(pointArray);
// 		}
// 		return true
// 	}
// 	return false
// }

function updatePosArray() {
	pointArray.length = 0;
	for (i in markerArray){
		if (markerArray[i] != null){
			pointArray.push(new google.maps.LatLng(markerArray[i].getPosition().lat(), markerArray[i].getPosition().lng()));
		}
	}
}