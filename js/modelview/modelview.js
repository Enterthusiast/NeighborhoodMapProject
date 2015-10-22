// My Controller (KO ViewModel cannot be use as a standard controller, it can only be used for KO stuff)
var Controller = (function() {
	this.map = {
		// Create the map, show every markers
		Init : function() {
			Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 48.846, lng: 2.337},
				zoom: 15
			});

			this.AddAllMarkers();
		},

		// Add One Marker to the map
		AddOneMarker : function(markerData) {
			var marker = new google.maps.Marker({
			    position: markerData.position,
			    title: markerData.title
			});
			marker.setMap(Model.googlemaps.map);
		},

		// Remove One Marker from the map
		RemoveOneMarker : function() {

		},

		// Add all marker to the map
		AddAllMarkers : function() {
			var markers = Model.googlemaps.markers;

			markers.forEach(function(markerData) {
				this.map.AddOneMarker(markerData);
			});

		},

		// Remove all marker from the map
		RemoveAllMarkers : function() {

		}
	};

	// Return the required markers (filter applies)
	this.GetMarkers = function(filter) {
		if (filter === "all") {
			return markers = Model.googlemaps.markers;
		}
	};

	return this;
})();

// Knockout ViewModel
var ViewModel = function() {
	var self = this;

	// Storing the markers data in an observableArray this way we can use KO features
	this.markerArray = Controller.GetMarkers("all");
};

// KO Init
ko.applyBindings(new ViewModel);

// My Controller Init
