var map, infowindow;

// Initialize the Map
function initMap() {

  var nawlins = new google.maps.LatLng(29.951066, -90.071532);

  var map = new google.maps.Map(document.getElementById('map'), {
    center: nawlins,
    zoom: 13,
    mapTypeControl: false
  });


  ko.applyBindings(new viewModel(map));
};   //end of initMap

//Constructor Class for locations
var Location = function (id, title, lat, lng, marker){
  this.id = id;
  this.title = title;
  this.lat = lat;
  this.lng = lng;
  this.marker = marker;
  this.isFavourite = false;
  this.flickrPhotos = [];
}; //end of Location constructor

// Initialize Firebase
var config = {
  apiKey: "AIzaSyC_aKs-5e3hXL1jupJpfjFocogAMsXI0mI",
  authDomain: "neighborhood-app-29991.firebaseapp.com",
  databaseURL: "https://neighborhood-app-29991.firebaseio.com",
  projectId: "neighborhood-app-29991",
  storageBucket: "",
  messagingSenderId: "1082791730015"
};
firebase.initializeApp(config);
var database = firebase.database();

for (var i=0; i < locationsArray.length; i++){
  writeLocationData(locationsArray[i][0],locationsArray[i][1],locationsArray[i][2],locationsArray[i][3])
}

function writeLocationData(id, title, lat, lng, marker) {
  firebase.database().ref('locations/' + id).set({
    id : id,
    title : title,
    lat : lat,
    lng : lng
  });
}

/*
*   ViewModel that contains all the observables and functionsthat interact with the map
*/
var viewModel = function(map){
  var self = this;

  self.query = ko.observable('');
  self.newMarker = ko.observable('');
  self.locationsArray = ko.observable([]);
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  //Create the InfoWindow that will display information about a location when Marker is clicked
  infowindow = new google.maps.InfoWindow({
			 content: '',
			 maxWidth: '200'
		 });
   // Load the markers for the default points of interest
  loadMarkers();

  /*
  *   This function creates a Knockout Computed function that that takes the
  *   input from the search box as a query, and filters all locations containing
  *   the query.
  *   It also changes the visibility of Markers so that only the filtered originAddresses]
  *   are visible
  */
  self.filterPins = ko.pureComputed(function () {
      var search = self.query().toLowerCase();
      return ko.utils.arrayFilter(self.locationsArray(), function (pin) {
        if (pin.title.toLowerCase().indexOf(search) >= 0){
          pin.marker.setVisible(true);
          return true;
        } else {
          pin.marker.setVisible(false);
        }
      });


  }, this);
  //Create a new Marker from each element in the Locations Array, adding the
  //relevant Listeners
  function loadMarkers(){
    self.locationsArray().forEach(function(pin){

      var latlng = new google.maps.LatLng(pin.lat,pin.lng);
      console.log("hello")
      pin.marker = new google.maps.Marker({
        position: latlng,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        title : pin.title,
      });
      getFlickrPhotos(pin)
      pin.marker.setMap(map);


      pin.marker.addListener('click', function() {
        console.log(pin)
        populateInfoWindow(pin);

      });

      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      pin.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      pin.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });

  });
  }




  //  This function opens the Side Navigation Menu when the Burger is clicked
  self.openNav = function(data, event) {
      var target = document.getElementById('burger');

      if ($('.container').hasClass('change')){
        target.classList.toggle("change");
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("nav").style.marginLeft = "0";
      } else {
        target.classList.toggle("change");
        document.getElementById("mySidenav").style.width = "30%";
        document.getElementById("nav").style.marginLeft = "30%";
      }
  }

  // animates the marker and shows its infowindow upon click in the list
	self.locationClicked = function(location) {
		populateInfoWindow(location);
	};
  self.toggleFavourite = function(location) {
    console.log(location.isFavourite)
    if (location.isFavourite == false) {
      location.isFavourite = true;
      var id = '#'+location.id;
      $(id).removeClass("glyphicon-star-empty" ).addClass( "glyphicon-star" );
    } else {
      location.isFavourite = false;
      var id = '#'+location.id;
      $(id).removeClass("glyphicon-star").addClass("glyphicon-star-empty");
    }

    console.log(location.isFavourite)
	};

  // Add a new marker to the map
  self.addMarker = function(data, event) {

    var toAdd = self.newMarker().replace(' ', '+');
    console.log(toAdd);
    searchPlaces(toAdd);

  }

  function searchPlaces(query) {
    console.log("searchPointsOfInterest");

    var newQuery = query + "+new+orleans";

    var request = {
        query: newQuery,
    };

    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, placeSearchCallback);
  }

  function placeSearchCallback(results, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            var placeId = place.place_id,
                index = -1,
                testArray = self.locationsArray();
              for(var i = 0, len = testArray.length; i < len; i++) {
                  if (testArray[i].id === placeId) {
                      index = i;
                      break;
                  }
              }
            console.log(index);
            if (index === -1) {
              var marker = createMarker(place);
              updateLocationsArray(place, marker, index);
            } else {
                alert("The point of interest you are searching is already on the list!");
            }

        }

    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert("We didn't find any matchs for your search!");
    } else {

        alert("Oppps! Something went wrong. You may try check your connection and reload the page to see if it works!");

    }
  }

  function updateLocationsArray(place, marker, index){


    var newLocation = new Location(
        	place.place_id,
          place.name,
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          marker,
      );
      marker.addListener('click', function() {
        populateInfoWindow(newLocation);
      });

      getFlickrPhotos(newLocation)

      self.locationsArray().push(newLocation);
      self.query(' ')
      self.query('')
      self.newMarker('')

  }
  // When a new location is added this creates a new pin
  function createMarker(pin){
    //var latlng = new google.maps.LatLng(pin.lat,pin.lng);

    pin.marker = new google.maps.Marker({
      position: pin.geometry.location,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      title : pin.name
    });

    pin.marker.setMap(map);

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    pin.marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    pin.marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
    return pin.marker
  }

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(pin) {
    // If an InfoWindow is already open, stop it's animation
    if (infowindow.marker){
      infowindow.marker.setAnimation(null);
    }
    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    console.log(pin)
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
      placeId: pin.id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Set the marker property on this infowindow so it isn't created again.

        infowindow.marker = pin.marker;
        var innerHTML = '<div class="info-window">';
        if (place.name) {
          innerHTML += '<strong>' + place.name + '</strong>';
        }
        if (place.formatted_address) {
          innerHTML += '<br>' + place.formatted_address;
        }
        if (place.formatted_phone_number) {
          innerHTML += '<br>' + place.formatted_phone_number;
        }
        if (place.opening_hours) {
          innerHTML += '<br><br><strong>Hours:</strong><br>' +
              place.opening_hours.weekday_text[0] + '<br>' +
              place.opening_hours.weekday_text[1] + '<br>' +
              place.opening_hours.weekday_text[2] + '<br>' +
              place.opening_hours.weekday_text[3] + '<br>' +
              place.opening_hours.weekday_text[4] + '<br>' +
              place.opening_hours.weekday_text[5] + '<br>' +
              place.opening_hours.weekday_text[6];
        }
        innerHTML += '<br><br><strong>Flickr Feed</strong><div id="carouselExampleControls" class="carousel slide" data-ride="carousel">'
                      +  '<div class="carousel-inner">';

        innerHTML += '<div class="carousel-item active">'
                      +pin.flickrPhotos[0].htmlImageString
                      + '<div class="carousel-caption d-none d-md-block">'
                      +   pin.flickrPhotos[0].imgLink
                      + '</div>'
                    +'</div>'
        for (var j = 1;j < pin.flickrPhotos.length; j++){
          innerHTML += '<div class="carousel-item">'
                        + pin.flickrPhotos[j].htmlImageString
                        + '<div class="carousel-caption d-none d-md-block">'
                        +   pin.flickrPhotos[j].imgLink
                        + '</div>'
                      +'</div>'
        }

        innerHTML +=  '<a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">'
                      +    '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'
                      +    '<span class="sr-only">Previous</span></a>'
                      +  '<a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">'
                      +    '<span class="carousel-control-next-icon" aria-hidden="true"></span>'
                      +    '<span class="sr-only">Next</span>'
                      +  '</a>'
                      + '</div><br>'


        innerHTML += '</div>';
        infowindow.setContent(innerHTML);
        infowindow.open(map, pin.marker);
        infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          if (infowindow.marker){
            infowindow.marker.setAnimation(null);
          }
          infowindow.marker = null;

        });
      }
    });
  }
}
ko.bindingHandlers.enterKey = {
  init: function (element, valueAccessor, allBindings, data, context) {
    var wrapper = function (data, event) {
      if (event.keyCode === 13) {
        valueAccessor().call(this, data, event);
      }
    };
    ko.applyBindingsToNode(element, { event: { keyup: wrapper } }, context);
  }
};
