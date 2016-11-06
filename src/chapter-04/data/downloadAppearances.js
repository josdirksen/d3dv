var https = require('https');
var cheerio = require('cheerio');
var idl = require('image-downloader');

// This is a simple script which downloads images from the simpsonwiki. It assumes
// that the first gallery contains all the images. By setting the path to the
// episode for which we want to download the images, everything is downloaded.
//
// Note that the names used here, and the names used by the groupSimpsons.js will
// differ in some parts. To circumvent this, the following translation table is used
// to correct this behavior. If you download new seasons or episodes, this will
// probably be need to corrected.
var mapping = {
    "waylon smithers, jr.": "waylon smithers",
    "charles montgomery burns" : "c. montgomery burns",
    "abraham simpson" : "grampa simpson",
    "irving zitsofsky" : "doctor zitsofsky"
}

var options = {
    host: 'simpsonswiki.com',
    path: '/wiki/Simpsons_Roasting_on_an_Open_Fire/Appearances'
}
var request = https.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        // at this point we've got an array of data. From this data we need to
        // get the character urls. We just get the URL for this episode
        var loaded = cheerio.load(data);

        // parse the incoming data and get all the names and image urls
        var allNames = loaded('ul.gallery.mw-gallery-traditional').first().find('div.gallerytext a').map(function(i, d) {return loaded(d).text()}).toArray();
        var allImageUrls = loaded('ul.gallery.mw-gallery-traditional').first().find('img').map(function(i, d) {return loaded(d).attr("src")}).toArray();

        allNames.forEach(function (d, i) {

            var name = mapping[d.toLowerCase()] ? mapping[d.toLowerCase()] : d.toLowerCase();

            var options = {
                url: allImageUrls[i],
                dest: './images/' + name + ".png",
                done: function(e, filename, image) {
                    if (e) {
                        console.log("Error while downloading ' "+ filename +" ': "  + e.message);
                    }
                    console.log('File saved to', filename);
                },
            };
            idl(options);
        });
    });
});

request.on('error', function (e) {
    console.log("Error while getting wikisimpsons data: " + e.message);
});
request.end();