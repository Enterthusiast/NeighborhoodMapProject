var View = {
	LayoutInfoWindow : function(place) {
		// Store the InforWindow layout
		var layoutContent = "";

		// Check that every required field as data, then build an HTML code aroudn it
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
			layoutContent = layoutContent + '<a class="infwin-website" href="' + place.website + '">Website</a>';
		}
		return layoutContent;
	}
}