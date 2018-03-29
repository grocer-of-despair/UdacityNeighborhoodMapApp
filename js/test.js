innerHTML += '<br><br><ul data-bind="foreach: flickrPhotoArray"><li><span data-bind="text: photoTitle">'
              + '<div class="pop_up_image_box_text"><a data-bind="text: $data.photoTitle"></a><br>' +
                  '<img data-bind="attr: {src: photoURL, alt: photTitle}"/><br>' +
                  '<a data-bind="attr: {href: photoURL}" target="_blank">View on Flickr</a>' + '</div>';
                  
