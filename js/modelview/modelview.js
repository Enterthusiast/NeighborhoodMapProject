// My Controller (KO ViewModel cannot be use as a standard controller, it can only be used for KO stuff)
var Controller = (function() {
	var self = this;

	// Create the map, show every markers, start Knockout
	this.Init = function() {
		Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 48.846, lng: 2.337},
			zoom: 15
		});

		self.map.AddAllMarkers(GetMarkersData());

		// KO Init
		ko.applyBindings(new ViewModel);
	};

	this.map = {
		// Add One Marker to the map
		AddOneMarker : function(markerData) {
			var marker = new google.maps.Marker({
			    position: markerData.position,
			    title: markerData.title
			});

			// Store the marker
			self.map.markers.push(marker);

			// Set the marker on the map
			marker.setMap(Model.googlemaps.map)
		},

		// Add all marker to the map
		AddAllMarkers : function(markers) {
			markers.forEach(function(markerData) {
				self.map.AddOneMarker(markerData);
			});
		},

		// Remove all marker from the map
		RemoveAllMarkers : function() {
			self.map.markers.forEach(function(marker) {
				marker.setMap(null);
			});
			self.map.markers = [];
		},

		markers : []
	};

	// Return the source list of markers
	this.GetMarkersData = function() {
		return Model.googlemaps.markers;
	};

	return this;
})();

// Knockout ViewModel
var ViewModel = function() {
	var self = this;

	// Storing the markers data in an observableArray this way we can use KO features
	this.markerDataArray = ko.observableArray(Controller.GetMarkersData());
	// Using an observable for the filter input, so we cna change the results displayed in real time
	this.filter = ko.observable("");

	this.filteredMarkerArray = ko.computed(function() {
		// Store the filtered results
		var filteredMarkerArray = [];
		var removeMarkerArray = [];

		// Using a regular expression for a more permissive & flexible filter
		var re = new RegExp(self.filter().trim(), "i");

		// Looking for a match
		self.markerDataArray().forEach(function(marker) {
			if (re.test(marker.title)) {
				filteredMarkerArray.push(marker);
			}
			else {
				removeMarkerArray.push(marker);
			}
		});

		// Update map displayed markers
		// Remove unwanted markers
		Controller.map.RemoveAllMarkers();
		// Add new markers
		Controller.map.AddAllMarkers(filteredMarkerArray);

		return filteredMarkerArray;
	});
};
