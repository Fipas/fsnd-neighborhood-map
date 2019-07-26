var markers = [];
var map;
var infowindow;

function getContentString(title, description) {
	return '<div id="content">'+
			'<div id="siteNotice">'+
			'</div>'+
			`<h3 id="firstHeading" class="firstHeading">${title}</h3>`+
			'<div id="bodyContent">'+
			`<p>${description}</p>`+
			'</div>'+
			'</div>';
}


function initMap() {

	var styles = [
		{
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#e9e9e9"
				},
				{
					"lightness": 17
				}
			]
		},
		{
			"featureType": "landscape",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#f5f5f5"
				},
				{
					"lightness": 20
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#ffffff"
				},
				{
					"lightness": 17
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"color": "#ffffff"
				},
				{
					"lightness": 29
				},
				{
					"weight": 0.2
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#ffffff"
				},
				{
					"lightness": 18
				}
			]
		},
		{
			"featureType": "road.local",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#ffffff"
				},
				{
					"lightness": 16
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#f5f5f5"
				},
				{
					"lightness": 21
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#dedede"
				},
				{
					"lightness": 21
				}
			]
		},
		{
			"elementType": "labels.text.stroke",
			"stylers": [
				{
					"visibility": "on"
				},
				{
					"color": "#ffffff"
				},
				{
					"lightness": 16
				}
			]
		},
		{
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"saturation": 36
				},
				{
					"color": "#333333"
				},
				{
					"lightness": 40
				}
			]
		},
		{
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "transit",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#f2f2f2"
				},
				{
					"lightness": 19
				}
			]
		},
		{
			"featureType": "administrative",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#fefefe"
				},
				{
					"lightness": 20
				}
			]
		},
		{
			"featureType": "administrative",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"color": "#fefefe"
				},
				{
					"lightness": 17
				},
				{
					"weight": 1.2
				}
			]
		}
	];

	map = new google.maps.Map(document.getElementById('map'), {
		styles: styles,
		mapTypeControl: false
	});

	var bounds = new google.maps.LatLngBounds();

	for (var location of data) {
		var marker = new google.maps.Marker({
			title: location.name,
			position: {lat: location.lat, lng: location.lng},
			map: map,
			icon: {
				url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
			},
			animation: google.maps.Animation.DROP
		});

		marker.addListener('click', onMarkerClick);
		markers.push(marker);
		bounds.extend(marker.position);
	}

	map.fitBounds(bounds);
	map.setZoom(9);
	infowindow = new google.maps.InfoWindow({
		content: ""
	});

	ko.applyBindings(new AppViewModel());
}


function onMarkerClick() {
	this.setAnimation(null);
	this.setAnimation(google.maps.Animation.BOUNCE);
	var marker = this;
	setTimeout(function() {
		marker.setAnimation(null);
	}, 3000);

	var content = ""
	var contentTitle = this.title;

	$.getJSON("https://en.wikipedia.org/api/rest_v1/page/summary/" + contentTitle, function(data) {
		content = getContentString(contentTitle, data.extract);

		infowindow.close();
		infowindow.setContent(content);
		infowindow.open(map, marker);
	});
}


function AppViewModel() {
	var self = this;

	self.search = ko.observable("");
	self.markers = ko.computed(function() {
		var filtered_markers = [];

		markers.map(marker => marker.setMap(null));

		if (self.search() === "") {
			filtered_markers = markers;
		} else {
			filtered_markers = markers.filter(marker => marker.title.toLowerCase().includes(self.search().toLowerCase()));
		}

		filtered_markers.map(marker => marker.setMap(map));
		return filtered_markers;
	});

	self.showLocationInfo = function(marker) {
		google.maps.event.trigger(marker, 'click');
	};
}