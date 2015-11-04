// TODO: Yelp API
// TODO: Manage Pottential Error (like no data, no google, etc.)
// TODO: localStorage
// TODO: Better Comment
// TODO: Grunt minify
// TODO: Loading?

var yelpCallback = function(data) {
	console.log(data);
	return true;
};

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
	this.markers = ko.observableArray([]);
	this.infoWindows = ko.observableArray([]);

	this.Init = function() {
		// Initialize the map
		Model.googlemaps.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 48.846, lng: 2.337},
			zoom: 15
		});

		// Initialize the places service
		Model.googlemaps.service = new google.maps.places.PlacesService(Model.googlemaps.map);

		// Subscribe to the markers and infoWindows array
		// This way we can check that information has been correctly retrieved from APIs
		self.markers.subscribe(function(data) {
			self.APICallCheck(data, 'markers');
		});
		self.infoWindows.subscribe(function(data) {
			self.APICallCheck(data, 'infoWindows');
		});


		// Get data from Model and compute it
		self.AddAllMarkers(self.GetMarkersInfo());
		self.AddAllWindows(self.GetWindowsInfo());

		// Store it in observable variables
		//setTimeout(self.CreateMarkerObservableArray, 5000);
	};

	// Test data retrieved from API
	this.APICallCheck = function(data, type) {
		// console.log('Subscribed' + type);
		// console.log(data);
		// if(data[0] && data[0].API && data[0].API.googlePlaces && data[0].API.yelp) {
		// 	console.log(data[0].API.googlePlaces + ' ' + data[0].API.yelp);
		// }
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

	// Yelp toolbox
	// Yelp Callback
	this.YelpCallback = function(data) {
		//Useless phantom function required for the API to work
		console.log ('jsonpCallback');
	};
	// Yelp request counter (used prevent too many requests at the same time)
	this.ajaxCall = [];
	this.ajaxCallIndex = 0;
	// Call the Yelp Ajax  request one by one
	this.ajaxCalling = function(index) {
		console.log('ajaxCalling', index, self.ajaxCall[index]);
		if (self.ajaxCall[index]) {
			self.ajaxCall[index]();
			console.log('ajaxCalling Executed');
		} else if(index === self.ajaxCall.length) {
			// When all calls has been done we store the data in the Marker Array, starting the app in the same process
			console.log('Let\'s get the party started');
			self.CreateMarkerObservableArray();
		}
	};
	// Yelp request builder
	this.YelpRequest = function(yelpPlaceId, arrayIndex) {
		// Building the Auth Message
		var auth = {
			//
			// Update with your auth tokens.
			//
			consumerKey : "DX5Z4PU6s7UB_9XFqxJCJQ",
			consumerSecret : "-aWkSkpIwe98jMqm0AzYxqHK75Y",
			accessToken : "YYM4HrPNz87jzDvqLYLtkejCiEhc-Vx2",
			// This example is a proof of concept, for how to use the Yelp v2 API with javascript.
			// You wouldn't actually want to expose your access token secret like this in a real application.
			accessTokenSecret : "B9VeVifctkamXHVW6idiOD_RCQM",
			serviceProvider : {
				signatureMethod : "HMAC-SHA1"
			}
		};

		var accessor = {
			consumerSecret : auth.consumerSecret,
			tokenSecret : auth.accessTokenSecret
		};

		// Store the callback function (prevent error in the URL)
		var yelpCallback = self.YelpCallback;

		parameters = [];
		parameters.push(['callback', 'yelpCallback']);
		parameters.push(['oauth_consumer_key', auth.consumerKey]);
		parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
		parameters.push(['oauth_token', auth.accessToken]);
		parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

		var message = {
			'action' : 'http://api.yelp.com/v2/business/' + yelpPlaceId,
			'method' : 'GET',
			'parameters' : parameters
		};

		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		var parameterMap = OAuth.getParameterMap(message.parameters);
		parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

		// Making the call!
		self.ajaxCall.push(
			(function(messageAction, parameterMap, arrayIndex, yelpPlaceId) {
				return function() {
					$.jsonp({
						'url' : messageAction,
						'data' : parameterMap,
						'cache' : true,
						'dataType' : 'jsonp',
						//'jsonpCallback' : 'yelpCallback',
						'callback' : 'yelpCallback',
						'success' : function(data, textStats, XMLHttpRequest) {
							console.log('Success ', arrayIndex, yelpPlaceId, messageAction, data);
							// This is where we add the Yelp data to the infoWindows array
							// Get the formated data
							var validContent = View.LayoutInfoWindowYelp(data);
							// Store and modify the data
							var updatedInfoWindow = self.infoWindows()[arrayIndex];
							updatedInfoWindow.content = updatedInfoWindow.content + validContent;
							// Add a variable to store the status of the Yelp API request
							updatedInfoWindow.API.yelp = 'success';
							// Add the data in a way that trigger Knockout Observable
							self.infoWindows.splice(arrayIndex, 1, updatedInfoWindow);
						},
						'error' : function(XMLHttpRequest, textStats, errorThrown) {
							// This is where we add the Yelp data to the infoWindows array
							// var updatedInfoWindow = self.infoWindows()[arrayIndex];
							// Add a variable to store the status of the Yelp API request
							// updatedInfoWindow.API.yelp = 'error';
							// Add the data in a way that trigger Knockout Observable
							// var debug_result = self.infoWindows.splice(arrayIndex, 1, updatedInfoWindow);
							// console.log('Error ', arrayIndex, yelpPlaceId);
							// console.log('Inserted ', updatedInfoWindow);
							// console.log('Spliced ', debug_result);
							// console.log ('errorAjax ', updatedInfoWindow.API.yelp, updatedInfoWindow.content);
						},
						'complete' : function(xOptions, textStats) {
							// Call the next Ajax request
							console.log('Complete', textStats);
							self.ajaxCallIndex = self.ajaxCallIndex + 1;
							self.ajaxCalling(self.ajaxCallIndex);
						},
					});
				};
			})(message.action, parameterMap, arrayIndex, yelpPlaceId)
		);

		console.log ('length', self.ajaxCall.length, self.infoWindows().length);
		if (self.ajaxCall.length === self.infoWindows().length) {
			self.ajaxCalling(self.ajaxCallIndex);
		}

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

		// Asking Google Place API & Google Street View (in the View) for information
		Model.googlemaps.service.getDetails({ placeId: infowindowInfo.googlePlaceId }, function(place, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {

				var validContent = View.LayoutInfoWindow(place);

				var infowindow = new google.maps.InfoWindow({
					content: validContent
					});

				// Add a variable to store the status of the google place API status
				infowindow.API = {googlePlaces: 'success'};
				// Store the infowindow in the right order & in a way that trigger Knockout Observable
				self.infoWindows.splice(arrayIndex, 1, infowindow);

				// Call the additional Yelp API (With a timeout to prevent being blocked as spam)
				var yelpPlaceId = infowindowInfo.yelpPlaceId;
				//console.log('AddOneG ' + arrayIndex + ' ', infowindow.content);
				setTimeout((function(index){
					return function() {
						//console.log('AddOneY ' + index + ' ' + yelpPlaceId);
						self.YelpRequest(yelpPlaceId, index);
					};
				})(arrayIndex));

			} else {
				// Create an empty infowindow
				var infowindow = new google.maps.InfoWindow({
					content: 'Google Places didn\'t load</br>'
				});
				// Add a variable to store the status of the google place API status
				infowindow.API = {googlePlaces: 'error'};
				// Store the infowindow in the right order & in a way that trigger Knockout Observable
				self.infoWindows.splice(arrayIndex, 1, infowindow);

				// Call the additional Yelp API anyway (With a timeout to prevent being blocked as spam)
				setTimeout((function(index){
					return function() {
						//console.log('AddOneY ' + index + ' ' + yelpPlaceId);
						self.YelpRequest(yelpPlaceId, index);
					};
				})(arrayIndex));
			}
		});
	};

	// Add all infowindow
	this.AddAllWindows = function(infowindows) {
		// Memorize position in array
		var index = 0;

		// "Allocate" the self.infoWindows array
		infowindows.forEach(function(infowindowInfo) {
			self.infoWindows.push({});
		});

		infowindows.forEach(function(infowindowInfo, index) {
			// Create the Ajax call required to get the data & store the infowindow data in self.infoWindows
			self.AddOneInfoWindow(infowindowInfo, index);
			index = index + 1;
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
		self.markers().forEach(function(marker) {
			var marker = ko.observable(marker);
			var infoWindow = ko.observable(self.infoWindows()[index]);
			var checkbox = ko.observable(false);
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


		// Looking for "Pinned" location in the filteredMarkerArray
		self.filteredMarkerArray().forEach(function(data) {
			if (data.checkbox()) {
				// Store the "Pinned" location as a valid result
				resultMarkerArray.push(data);
			}
		});

		// Looking for a match with the filter
		self.MarkerArray().forEach(function(data) {
			// Check if this Marker Array data is "Pinned" (already stored just above)
			var isPinned = false;
			resultMarkerArray.forEach(function(testData) {
				if(testData.marker().title === data.marker().title) {
					// Data found, let's bypass the filter
					isPinned = true;
				}
			});

			if (re.test(data.marker().title)) {
				// Display the marker on the map only if not already there (prevent blinking markers)
				if(data.marker().map === null) {
					data.marker().setMap(Model.googlemaps.map);
				}
				if (!isPinned) {
					resultMarkerArray.push(data);
				}
			}
			else {
				// Remove the marker on the map only if not already removed (or Pinned)
				if(!isPinned && data.marker().map !== null) {
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
			var newData = {marker: marker, infoWindow: infoWindow, checkbox: checkbox};
			self.filteredMarkerArray.push(newData);
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
	};

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
