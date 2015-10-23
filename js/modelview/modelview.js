// My Controller (KO ViewModel cannot be use as a standard controller, it can only be used for KO stuff)
var Controller = (function() {
	var self = this;

	// Create the map, show every markers, start Knockout
	this.Init = function() {
		Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 48.846, lng: 2.337},
			zoom: 15
		});

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
			var marker = new google.maps.Marker({
			    position : markerInfo.position,
			    title : markerInfo.title,
			    // Add a label: ?
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
		AnimateMarker : function(markerData) {
			// Stop any other animation
			self.map.markers.forEach(function(marker) {
				marker.setAnimation(null);
			});
			// Animate the desired marker
			markerData.setAnimation(google.maps.Animation.BOUNCE);
			// Stop anymation after a short time
			setTimeout(function() {
				markerData.setAnimation(null);
			}, 1400);
		},

		MarkerClicked : function(event) {
			// Used to get infoWindows[count], to get the infowindow related to the marker
			var count = 0;

			self.map.markers.forEach(function(marker) {
				// Looking for the clicked marker by its position (Latitude & Longitude)
				if(marker.position === event.latLng) {
					self.map.AnimateMarker(marker);
					self.map.OpenInfoWindow(self.map.infoWindows[count], marker);
				}
				count = count + 1;
			});
		},

		AddOneInfoWindow : function(infowindowInfo) {
			var infowindow = new google.maps.InfoWindow({
    			content: infowindowInfo.content
  			});

  			// Store the infowindow
			self.map.infoWindows.push(infowindow);
		},

		// Add all infowindow
		AddAllWindows : function(infowindows) {
			infowindows.forEach(function(infowindowInfo) {
				self.map.AddOneInfoWindow(infowindowInfo);
			});
		},

		// Open an infowindow
		OpenInfoWindow : function(infowindowData, markerData) {
			// Close any other infowindow
			self.map.infoWindows.forEach(function(infoWindow) {
				infoWindow.close();
			});
			// Open the desired infowindow on its Marker
			infowindowData.open(Model.googlemaps.map, markerData);
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

	this.filteredMarkerArray = ko.computed(function() {
		return Controller.map.FilterMarkers(self.filter().trim());
	});

	this.animAndOpenMarker = function(markerData) {
		Controller.map.AnimateMarker(markerData);
	};
};
