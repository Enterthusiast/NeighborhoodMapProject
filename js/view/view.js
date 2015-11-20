var View = {
	LayoutInfoWindow : function(place) {
		// Store the InforWindow layout
		var layoutContent = '';

		// Check that every required field as data, then build an HTML code around it
		if (place.geometry.location.lat() && place.geometry.location.lng()) {
			layoutContent = layoutContent + '<div class="infwin-img"><img src="https://maps.googleapis.com/maps/api/streetview?size=200x200&location=' + place.geometry.location.lat() + ',' + place.geometry.location.lng() + '&key=AIzaSyC9V681P6SnJXI-5glxGhYipuRb9QiDtHM"/></div></br>';
		}
		if (place.name) {
			layoutContent = layoutContent + '<span class="infwin-name">' + place.name + '</span></br>';
		}
		if (place.formatted_address) {
			layoutContent = layoutContent + '<span class="infwin-adress">' + place.formatted_address + '</span></br>';
		}
		if (place.formatted_phone_number) {
			layoutContent = layoutContent + '<a class="infwin-phone" href="tel:' + place.formatted_phone_number.replace(" ","") + '">' + place.formatted_phone_number + '</a></br>';
		}
		if (place.rating) {
			layoutContent = layoutContent + '<span class="infwin-rating">Rating: ' + place.rating + '/5</span></br>';
		}
		if (place.website) {
			layoutContent = layoutContent + '<a class="infwin-website" href="' + place.website + '">Website</a></br>';
		}
		return layoutContent;
	},

	LayoutInfoWindowYelp : function(place) {
		// Store the InforWindow layout (with mandatory Yelp logo)
		var layoutContent = '';

		// Check that every required field as data, then build an HTML code around it
		if (place.url) {
			layoutContent = layoutContent + '<a class="infwin-website" href="' + place.url + '"><img src="https://s3-media2.fl.yelpcdn.com/assets/srv0/developer_pages/14f29ad24935/assets/img/yelp_logo_40x20.png"/></a>';
		}
		if (place.rating && place.rating_img_url_small) {
			place.rating_img_url_small = place.rating_img_url_small.replace('http://', 'https://');
			layoutContent = layoutContent + '<span class="infwin-yelp-rating"><img src="' + place.rating_img_url_small + '"/> ' + place.rating + '/5</span></br>';
		}
		return layoutContent;
	}
}