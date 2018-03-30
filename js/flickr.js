var FLICKR_TAGS_DEFAULT = "New Orleans, LA";
var FLICKR_KEY = '586914c940f69c636ef1e2046271336e';
var FLICKR_SECRET = '9059e6903b239fb0';

function getFlickrPhotos(pin){
  var url = 'https://api.flickr.com/services/rest/'
            +'?method=flickr.photos.search&format=json&api_key='
            +FLICKR_KEY+'&text='+pin.title+'&per_page=20&jsoncallback=?'
  pin.flickrPhotos = [];
  $.getJSON(url,
    function(data)
        {
          $.each(data.photos.photo, function(i, item) {
            //Read in the title of each photo
                var photoTitle = item.title;

                //Get the url for the image.
                var photoURL = 'https://farm' +
                    item.farm + '.static.flickr.com/' +
                    item.server + '/' +
                    item.id + '_' +
                    item.secret + '_m.jpg';

                var newPhoto = {
                  htmlImageString: '<img src="' + photoURL + '" alt="' + photoTitle + '" />',
                  photoTitle: item.title,
                  imgLink: '<a class="flickr-link" href="'+photoURL+'" target="_blank">View on Flickr</a>',
                }

                pin.flickrPhotos.push(newPhoto);
          })
        }
  );
}
