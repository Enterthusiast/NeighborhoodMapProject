var Model = {

	// Hardcoded location data used for the API requests
	mapdata : {
		map : null,
		service : null,
		// Data used to build the infowindows
		// Using Google Place and Yelp APIs
		infowindows : [
			{
				googlePlaceId: "ChIJe2jeNttx5kcRi_mJsGHdkQc",
				yelpPlaceId: "jardin-du-luxembourg-paris"
			},
			{
				googlePlaceId: "ChIJMxtaOMxx5kcR28SQEfSygUc",
				yelpPlaceId: "cinéma-gaumont-parnasse-paris-3"
			},
			{
				googlePlaceId: "ChIJOzl9Icxx5kcRWcga16oXZEw",
				yelpPlaceId: "le-falstaff-paris"
			},
			{
				googlePlaceId: "ChIJxy57Nudx5kcRbGtimYdLcrk",
				yelpPlaceId: "album-paris-7"
			},
			{
				googlePlaceId: "ChIJxy57Nudx5kcRcfSt_e_iADU",
				yelpPlaceId: "album-paris-6"
			},
			{
				googlePlaceId: "ChIJkYSjLedx5kcRaNJBiMaJRfk",
				yelpPlaceId: "pulps-paris"
			},
			{
				googlePlaceId: "ChIJKZtiueZx5kcRl9zQESU6I9A",
				yelpPlaceId: "marché-maubert-paris-2"
			},
			{
				googlePlaceId: "ChIJ6_YgoOZx5kcRx_kUrl7wU7g",
				yelpPlaceId: "boucherie-parisienne-debray-paris"
			},
			{
				googlePlaceId: "ChIJ4fRivuZx5kcR_nMndA0Lv24",
				yelpPlaceId: "laurent-dubois-paris-3"
			}
		],
		// Data used to build the marker
		markers : [
			{
				position: {lat: 48.84620, lng: 2.33715},
				title: "Jardin du Luxembourg"
			},
			{
				position: {lat: 48.84303, lng: 2.32448},
				title: "Gaumont Parnasse"
			},
			{
				position: {lat: 48.84281, lng: 2.32605},
				title: "Falstaff - Bar à bière"
			},
			{
				position: {lat: 48.85101, lng: 2.34538},
				title: "Librairie Album - Manga & BD"
			},
			{
				position: {lat: 48.85064, lng: 2.34563},
				title: "Librairie Album - Comics & Figurine"
			},
			{
				position: {lat: 48.85084, lng: 2.34612},
				title: "Pulp Comics - Boutique Star Wars"
			},
			{
				position: {lat: 48.84988, lng: 2.34851},
				title: "Marché Maubert - Jeudi & Samedi"
			},
			{
				position: {lat: 48.84980, lng: 2.34856},
				title: "Boucherie"
			},
			{
				position: {lat: 48.84983, lng: 2.34841},
				title: "Fromagerie"
			}
		]
	}

};