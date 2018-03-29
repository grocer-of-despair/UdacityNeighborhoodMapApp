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
};

/*
*   ViewModel that contains all the observables and functionsthat interact with the map
*/
var viewModel = function(map){
  var self = this;

  //Declare the array of locations, creating a new Object for each one
  self.locationsArray = [
    new Location('ChIJHc6A2namIIYRaibte9NvWoU', 'The National WWII Museum', 29.942656, -90.070389),
    new Location('ChIJQ0s1xLyoIIYRMLQP0iQsf2s', 'Old New Orleans Rum Distillery', 29.986506, -90.059135),
    new Location('ChIJaS5FoBGmIIYRj77fFz8J_94', 'Jackson Square', 29.957444, -90.062935),
    new Location('ChIJjXYFWwumIIYR6OUFIQPlkzw', 'French Quarter', 29.958443, -90.064411),
    new Location('ChIJNwyZ61yvIIYR4YZghqiDU60', 'New Orleans Museum of Art', 29.986480, -90.093439),
    new Location('ChIJ5fSNHgmmIIYRS1n2gaa7fGU', 'St Louis Cemetary', 29.960843, -90.075407),
    new Location('ChIJoc0hTBCmIIYRz--TsYDlBno', 'Historic Voodoo Museum', 29.959904, -90.063851),
    new Location('ChIJw6x_5RCmIIYRa5ffymRQaoQ', 'French Quarter Phantoms', 29.960693, -90.067975),
    new Location('ChIJv33qrxCmIIYRfLKnlwPcNMw', 'Lalaurie Mansion', 29.961859, -90.061141)
  ],


  self.query = ko.observable('');
  self.newMarker = ko.observable('');

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

  //Create a new Marker from each element in the Locations Array, adding the
  //relevant Listeners
  self.locationsArray.forEach(function(pin){

      var latlng = new google.maps.LatLng(pin.lat,pin.lng);
      console.log("hello")
      pin.marker = new google.maps.Marker({
        position: latlng,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        title : pin.title
      });
      pin.marker.setMap(map);

      pin.marker.addListener('click', function() {
        populateInfoWindow(pin.marker, pin.id);
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
  self.modelLocations = ko.observableArray('')
  /*
  *   This function creates a Knockout Computed function that that takes the
  *   input from the search box as a query, and filters all locations containing
  *   the query.
  *   It also changes the visibility of Markers so that only the filtered originAddresses]
  *   are visible
  */
  var search = self.query().toLowerCase();

  self.filterPins = self.modelLocations.filterByLocation("title", search);
  ko.observableArray.fn.filterByLocation = function(propName, search) {
      return ko.pureComputed(function() {
          var allItems = self.modelLocations(), matchingLocations = [];
          for (var i = 0; i < allItems.length; i++) {
              var current = allItems[i];
              if (ko.unwrap(current[propName]) === matchValue)
                  matchingLocations.push(current);
          }
          return matchingLocations;
      }, this);
  }
  /*
  self.filterPins = ko.pureComputed(function () {
      var search = self.query().toLowerCase();
      return ko.utils.arrayFilter(self.modelLocations(), function (pin) {
        if (pin.title.toLowerCase().indexOf(search) >= 0){
          pin.marker.setVisible(true);
          return true;
        } else {
          pin.marker.setVisible(false);
        }
      });
  }, this);
  */
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
		populateInfoWindow(location.marker, location.id);
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
    console.log(request);
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, placeSearchCallback);

  }

  function placeSearchCallback(results, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            var marker = createMarker(place);
            updateLocationsArray(place, marker);
            console.log(marker)
            self.filterPins();
        }

    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert("We didn't find any matchs for your search!");
    } else {

        alert("Oppps! Something went wrong. You may try check your connection and reload the page to see if it works!");

    }
  }
  function updateLocationsArray(place, marker){
    var placeId = place.place_id;

    var result = self.locationsArray.indexOf(placeId);
    if (result === -1) {
      var newLocation = new Location(
          	placeId,
            place.name,
            place.geometry.location.lat(),
            place.geometry.location.lng(),
            marker,
        );
        console.log(newLocation)
        self.locationsArray.push(newLocation);
        console.log(self.locationsArray)
        self.filterPins();
    } else {
        alert("The point of interest you are searching is already on the list!");
    }
  }
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

    pin.marker.addListener('click', function() {
      populateInfoWindow(pin.marker, pin.id);
    });

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
  function populateInfoWindow(marker, id) {
    console.log(self.locationsArray)
    // If an InfoWindow is already open, stop it's animation
    if (infowindow.marker){
      infowindow.marker.setAnimation(null);
    }

    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
      placeId: id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Set the marker property on this infowindow so it isn't created again.
        infowindow.marker = marker;
        var innerHTML = '<div>';
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
        if (place.photos) {
          innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
              {maxHeight: 100, maxWidth: 200}) + '">';
        }
        innerHTML += '</div>';
        infowindow.setContent(innerHTML);
        infowindow.open(map, marker);
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
