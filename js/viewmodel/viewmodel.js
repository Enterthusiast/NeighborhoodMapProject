// My Controller (KO ViewModel cannot be use as a standard controller, it can only be used for KO stuff)
var Controller = (function() {
	var self = this;

	// Create the map, show every markers, start Knockout
	this.Init = function() {
		// Initialize the map
		Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 48.846, lng: 2.337},
			zoom: 15
		});

		// Initialize the places service
		Model.googlemaps.service = new google.maps.places.PlacesService(Model.googlemaps.map);

		self.map.AddAllMarkers(GetMarkersInfo());
		self.map.AddAllWindows(GetWindowsInfo());

		// KO Init
		ko.applyBindings(new ViewModel);
	};

	// Return the source list of markers
	this.GetMarkersInfo = function() {
		return Model.googlemaps.markers;
	};

	// Return the source list of infowindows
	this.GetWindowsInfo = function() {
		return Model.googlemaps.infowindows;
	};

	this.map = {
		// Add One Marker to the map
		AddOneMarker : function(markerInfo) {
			// TODO: add marker icons based on type of shop ?
			var marker = new google.maps.Marker({
			    position : markerInfo.position,
			    title : markerInfo.title,
			    animation: google.maps.Animation.DROP
			});

			// Set the marker on the map
			marker.setMap(Model.googlemaps.map);

			// Add a bhavior on click
			marker.addListener('click', self.map.MarkerClicked);

			// Store the marker
			self.map.markers.push(marker);
		},

		// Add all marker to the map
		AddAllMarkers : function(markers) {
			var delayMultiplier = 0;
			markers.forEach(function(markerInfo) {
      			self.map.AddOneMarker(markerInfo);
			});
		},

		FilterMarkers : function(filter) {
			// Using a regular expression for a more permissive & flexible filter
			var re = new RegExp(filter, "i");

			// Store a filter Array to be send back to the ViewModel
			var filteredMarkerArray = [];

			// Looking for a match
			self.map.markers.forEach(function(marker) {
				if (re.test(marker.title)) {
					// Display the marker on the map only if not already there (prevent blinking markers)
					if(marker.map === null) {
						marker.setMap(Model.googlemaps.map);
					}
					// Store the result for the ViewModel
					filteredMarkerArray.push(marker);
				}
				else {
					// Remove the marker on the map only if not already removed
					if(marker.map !== null) {
						marker.setMap(null);
					}
				}
			});

			return filteredMarkerArray;
		},

		// Animate a marker
		HighlightMarker : function(markerData) {
			// Stop any other animation
			self.map.markers.forEach(function(marker) {
				// We only stop ongoing animation and we won't stop the clicked marker animation (if any)
				if(marker.animating === true && marker !== markerData) {
					marker.setAnimation(null);
				}
				marker.setIcon(null);
			});

			// Animate the desired marker (only if not animating)
			if(markerData.animation === false || !markerData.animation) {
				markerData.setAnimation(google.maps.Animation.BOUNCE);
				markerData.setIcon('https://mt.google.com/vt/icon?psize=34&font=fonts/Roboto-Regular.ttf&color=ff343434&name=icons/spotlight/spotlight-waypoint-a.png&ax=44&ay=48&scale=1&text=%E2%80%A2');

				// Stop anymation after a short time
				setTimeout(function() {
						markerData.setAnimation(null);
					}, 1400);
			}

			// Open the marker infowindow
			self.map.OpenInfoWindow(markerData);
		},

		MarkerClicked : function(event) {
			// Used to get infoWindows[index], to get the infowindow related to the marker
			var index = 0;

			self.map.markers.forEach(function(marker) {
				// Looking for the clicked marker by its position (Latitude & Longitude)
				if(marker.position === event.latLng) {
					self.map.HighlightMarker(marker);
				}
				index = index + 1;
			});
		},

		AddOneInfoWindow : function(infowindowInfo, arrayIndex) {
			// TODO: webworkers ?
			// TODO: Add Yelp info ?
			Model.googlemaps.service.getDetails({ placeId: infowindowInfo.placeId }, function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {

					var validContent = View.LayoutInfoWindow(place);

					var infowindow = new google.maps.InfoWindow({
						content: validContent
  					});

  					// Store the infowindow
					self.map.infoWindows[arrayIndex] = infowindow;
				} else {
					console.log(status);
				}
			});
		},

		// Add all infowindow
		AddAllWindows : function(infowindows) {
			// Memorize position in array
			var index = 0;

			infowindows.forEach(function(infowindowInfo) {
				self.map.AddOneInfoWindow(infowindowInfo, index);
				index = index +1;
			});
		},

		// Open an infowindow
		OpenInfoWindow : function(markerData) {
			// Close any other infowindow
			self.map.infoWindows.forEach(function(infoWindow) {
				infoWindow.close();
			});

			// Used to store the marker array index
			var index = 0;

			self.map.markers.forEach(function(marker) {
				// Looking for the clicked marker by its position (Latitude & Longitude)
				if(marker.position === markerData.position) {
					// Open the desired infowindow on this Marker
					self.map.infoWindows[index].open(Model.googlemaps.map, markerData);
				}
				index = index + 1;
			});
		},

		// Store the markers
		markers : [],

		// Store the infoWindows
		infoWindows : []
	};

	return this;
})();

// Knockout ViewModel
var ViewModel = function() {
	var self = this;

	// Using an observable for the filter input, so we cna change the results displayed in real time
	this.filter = ko.observable("");

	// Menu icon
	this.icon = ko.observable("☰");

	// Filter the places list
	this.filteredMarkerArray = ko.computed(function() {
		return Controller.map.FilterMarkers(self.filter().trim());
	});

	this.ToggleMenu = function() {
		var menuOpen = document.getElementsByClassName('menu-open')[0];
		var menu = document.getElementsByClassName('menu')[0];
		if(menuOpen) {
			menuOpen.className = menuOpen.className.replace('menu-open','');
			self.icon("☰");
		} else if (menu) {
			menu.className = menu.className + ' menu-open';
			self.icon("✕");
		}
	};

	this.CloseMenu = function() {
		var menuOpen = document.getElementsByClassName('menu-open')[0];
		if(menuOpen) {
			menuOpen.className = menuOpen.className.replace('menu-open','');
			self.icon("☰");
		}
	};

	this.HighlightMarker = function(markerData) {
		Controller.map.HighlightMarker(markerData);
	};
};
