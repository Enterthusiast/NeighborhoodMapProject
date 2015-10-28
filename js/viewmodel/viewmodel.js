// Knockout ViewModel
var ViewModel = function() {
	var self = this;

	// Using an observable for the filter input, so we cna change the results displayed in real time
	this.filter = ko.observable("");

	// Menu icon
	this.icon = ko.observable("☰");

	// Create the a ko.observableArray to store all the marker datas in an observable way
	this.MarkerArray = ko.observableArray([]);

	// Create the filteredArray
	this.filteredMarkerArray = ko.observableArray([]);

	// Data import from model
	this.markers = [];
	this.infoWindows = [];

	this.Init = function() {
		// Initialize the map
		Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 48.846, lng: 2.337},
			zoom: 15
		});

		// Initialize the places service
		Model.googlemaps.service = new google.maps.places.PlacesService(Model.googlemaps.map);

		// Get data from Model and compute it
		self.AddAllMarkers(self.GetMarkersInfo());
		self.AddAllWindows(self.GetWindowsInfo());

		// Store it in observable variables
		setTimeout(self.CreateMarkerObservableArray, 1000);
	};

	// Return the source list of markers from Model
	this.GetMarkersInfo = function() {
		return Model.googlemaps.markers;
	};

	// Return the source list of infowindows from Model
	this.GetWindowsInfo = function() {
		return Model.googlemaps.infowindows;
	};

	// Add One Marker to the map
	this.AddOneMarker = function(markerInfo) {
		// TODO: add marker icons based on type of shop ?
		var marker = new google.maps.Marker({
		    position : markerInfo.position,
		    title : markerInfo.title,
		    animation: google.maps.Animation.DROP
		});

		// Set the marker on the map
		marker.setMap(Model.googlemaps.map);

		// Add a bhavior on click
		marker.addListener('click', self.MarkerClicked);

		// Store the marker
		self.markers.push(marker);
	};

	// Add all marker to the map
	this.AddAllMarkers = function(markers) {
		var delayMultiplier = 0;
		markers.forEach(function(markerInfo) {
  			self.AddOneMarker(markerInfo);
		});
	};

	// Add one infowindow
	this.AddOneInfoWindow = function(infowindowInfo, arrayIndex) {
		// TODO: Add Yelp info ?
		Model.googlemaps.service.getDetails({ placeId: infowindowInfo.placeId }, function(place, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {

				var validContent = View.LayoutInfoWindow(place);

				var infowindow = new google.maps.InfoWindow({
					content: validContent
					});

				// Store the infowindow
				self.infoWindows[arrayIndex] = infowindow;
			} else {
				console.log(status);
			}
		});
	};

	// Add all infowindow
	this.AddAllWindows = function(infowindows) {
		// Memorize position in array
		var index = 0;

		infowindows.forEach(function(infowindowInfo) {
			self.AddOneInfoWindow(infowindowInfo, index);
			index = index +1;
		});
	};

	this.MarkerClicked = function(event) {
		self.MarkerArray().forEach(function(data) {
			// Looking for the clicked marker by its position (Latitude & Longitude)
			if(data.marker().position === event.latLng) {
				self.HighlightMarker(data);
			}
		});
	};

	this.CreateMarkerObservableArray = function() {
		var index = 0;
		self.markers.forEach(function(marker) {
			var marker = ko.observable(marker);
			var infoWindow = ko.observable(self.infoWindows[index]);
			var checkbox = ko.observable(true);
			self.MarkerArray.push({marker: marker, infoWindow: infoWindow, checkbox: checkbox});
			index = index + 1;
		});
	};

	this.FilterMarkers = function(filter) {
		// Close all infoWindow
		self.CloseAllInfoWindow();

		// Using a regular expression for a more permissive & flexible filter
		var re = new RegExp(filter, "i");

		// result Array
		var resultMarkerArray = [];

		// Looking for a match
		self.MarkerArray().forEach(function(data) {
			if (re.test(data.marker().title)) {
				// Display the marker on the map only if not already there (prevent blinking markers)
				if(data.marker().map === null) {
					data.marker().setMap(Model.googlemaps.map);
				}
				// Store the result
				resultMarkerArray.push(data);
			}
			else {
				// Remove the marker on the map only if not already removed
				if(data.marker().map !== null) {
					data.marker().setMap(null);
				}
			}
		});

		// Store previous results size
		var filteredArrayLength = self.filteredMarkerArray().length;
		// Store the results in filteredMarkersArray
		resultMarkerArray.forEach(function(data) {
			var marker = ko.observable(data.marker());
			var infoWindow = ko.observable(data.infoWindow());
			var checkbox = ko.observable(data.checkbox());
			self.filteredMarkerArray.push({marker: marker, infoWindow: infoWindow, checkbox: checkbox});
		});
		// Remove previous results
		self.filteredMarkerArray.splice(0, filteredArrayLength);

		return true;
	};

	// Open an infowindow
	this.OpenInfoWindow = function(clickedData) {
		// Close all infoWindow
		self.CloseAllInfoWindow();
		// Open the chosen infoWindow
		clickedData.infoWindow().open(Model.googlemaps.map, clickedData.marker());
	},

	// Close all infoWindow
	this.CloseAllInfoWindow = function(clickedData) {
		// Close all infowindow stored in MarkerArray
		self.MarkerArray().forEach(function(data) {
			data.infoWindow().close();
		});
	};

	// Animate a marker
	this.HighlightMarker = function(clickedData) {
		// Stop any other animation
		self.MarkerArray().forEach(function(data) {
			// We only stop ongoing animation and we won't stop the clicked marker animation (if any)
			if(data.marker().animating === true && data.marker() !== clickedData.marker()) {
				data.marker().setAnimation(null);
			}
			data.marker().setIcon(null);
		});

		// Animate the desired marker (only if not animating)
		if(clickedData.marker().animation === false || !clickedData.marker().animation) {
			clickedData.marker().setAnimation(google.maps.Animation.BOUNCE);
			clickedData.marker().setIcon('https://mt.google.com/vt/icon?psize=34&font=fonts/Roboto-Regular.ttf&color=ff343434&name=icons/spotlight/spotlight-waypoint-a.png&ax=44&ay=48&scale=1&text=%E2%80%A2');

			// Stop anymation after a short time
			setTimeout(function() {
					clickedData.marker().setAnimation(null);
				}, 1400);
		}

		// Open the marker infowindow
		self.OpenInfoWindow(clickedData);

		// Close the menu on mobile to get a quick view of the selected place.
		self.CloseMenu();
	},

	// Open or close mobile menu
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

	// Close the mobile menu
	this.CloseMenu = function() {
		var menuOpen = document.getElementsByClassName('menu-open')[0];
		if(menuOpen) {
			menuOpen.className = menuOpen.className.replace('menu-open','');
			self.icon("☰");
		}
	};

	// Filter the places list when the filter change
	this.triggerFilter = ko.computed(function() {
				return self.FilterMarkers(self.filter().trim());
			});

};

// Create the map, start Knockout
var AppInit = function() {
	// KO Init
	ko.applyBindings(new ViewModel);
	var data = ko.dataFor(document.body);
	data.Init();
};
