const d3 = require('d3');
const fs = require('fs');
const _ = require('lodash');


d3.queue()
    .defer(d3.csv, "file:simpsons-s18e01.csv")
    .defer(d3.csv, "file:locations.csv")
    .defer(d3.csv, "file:characters.csv")
    .await(function (error, season, locations, characters) {
        process(season, locations, characters)
    });

/**
 * Simple function which parses the input files and outputs
 * data that can be easily read by D3.js. For this output we've
 * got two types of nodes. We've got locations, and we've got
 * characters. A character is always linked to  >= 1 locations.
 *
 * character -> location -> value (number of times in this location)
 *
 * We'll output a json file which looks like this:
 * {
 *   nodes: [{
 *      id: <generated_id>,
 *      type: character|location,
 *      name: <name>,*
 *   }].
 *   links: [{
 *      source: <id_char>,
 *      target: <id_loc>,
 *      value: <number of times in location>
 *   }
 *   ]
 * }
 */
function process(rows, locations, characters) {

    // The data gathered can sometimes contain names or locations
    // which are the same, but are slightly differently spelled.
    // the following settings, add an additional grouping of these
    // locations and characters
    var sanitizeLocations = {
        "21": "20",
        "23": "20",
        "18": "17",
        "11": "10"
    };

    // their are also characters which don't appear, or aren't
    // really characters. We remove these explicitly
    var removeCharacters = [
        "7", "12", "13", "20", "24", "27", "34", "35",
        "36", "37", "33", "21", "28", "32", "4", "19", "23"];

    var rows = rows.filter(function(d) {return !_.includes(removeCharacters, d.character_id)});

    // first group the characters at the location
    var locationGroups = {};
    rows.forEach(function(d) {
        // we check if we need to replace the key
        var checkId = sanitizeLocations[d.location_id] ? sanitizeLocations[d.location_id] : d.location_id;

        if (!locationGroups[checkId]) {
            var location = {
                id: checkId,
                name: d.raw_location_text,
                persons: []
            };
            locationGroups[checkId] = location;
        }
        locationGroups[checkId].persons.push(d.character_id);
    });

    // when we have the locations we can generate our links
    var links = Object.keys(locationGroups).map(function(groupKey) {
        var data = locationGroups[groupKey];
        var counts = _.countBy(data.persons);

        return Object.keys(counts).map(function(key) {
            return {
                source: "c_" + key,
                target: "l_" + data.id,
                value: counts[key]
            }
        });
    });

    // flatten, since we've got an array of arrays
    var finalLinks = _.flatten(links);

    // based on these links, we can filter the characters and the locations
    var uniqCharacters = _.uniqBy(finalLinks, 'source')
            .map(function(el) {return el.source});
    var filteredCharacters = characters.filter(function(loc) {
        return _.includes(uniqCharacters, "c_" + loc.id);
    }).map(function(el) {
        el.id = "c_" + el.id;
        el.type = "character";
        return el;
    });


    // finally remove the links that have only a single record
    var counted = _.countBy(finalLinks, function(d) {console.log(d); return d.target});
    var locationsToRemove = _.filter(Object.keys(counted), function(d) {return counted[d] === 1});

    var filteredFinalLinks = _.filter(finalLinks, function(d) {
        return !_.includes(locationsToRemove, d.target);
    })

    // create reference to the locations that are in the array
    var uniqLocations = _.uniqBy(filteredFinalLinks, 'target')
        .map(function(el) {return el.target});
    var filteredLocations = locations.filter(function(loc) {
        return _.includes(uniqLocations, "l_" + loc.id);
    }).map(function(el) {
        el.id = "l_" + el.id;
        el.type = "location";
        return el;
    });


    var output = {
        links: filteredFinalLinks,
        characters: filteredCharacters,
        locations: filteredLocations
    };

    console.log("Number of links: " + filteredFinalLinks.length);
    console.log("Number of unique characters: " + filteredCharacters.length);
    console.log("Number of unique locations: " + filteredLocations.length);

    fs.writeFile('./graph.json', JSON.stringify(output));
};

