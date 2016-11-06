const d3 = require('d3');
const fs = require('fs');
const _ = require('lodash');

d3.csv("file:seasons_all.csv", process);

/**
 * This time we're not really interested in the location, but we're interested
 * in whether persons appear together in a scene. If they do we increment their
 * link count.
 */
function process(data) {

    // first filtering. Only characters that have this many links
    const MIN_TOTAL = 180;

    // map the ids to numbers, to make sorting easier
    var characters = data.map(function(d) {
        d.character_id = +d.character_id;
        d.location_id = +d.location_id;

        return d;
    });

    // final result
    var links = {};

    // keep track of where we are
    var currentlocation;
    var currentpersons = [];

    characters.forEach(function(el) {
        if (el.location_id === currentlocation) {
            // we're still in the same location, just add the new character
            currentpersons.push(el.character_id);
        } else {
            // we're in a new location, store any character links
            var uniquePersons = _.sortBy(_.uniq(currentpersons));
            addPersonsToLinks(uniquePersons, links);

            // register the new location and current person
            currentpersons = [];
            currentlocation = el.location_id;
            currentpersons.push(el.character_id);
        }
    });

    // remove the links that are below threshold
   Object.keys(links).forEach(function(d) {
       var values = links[d];
       var res =  Object.keys(links[d]).reduce(function(initial, d) {return initial + values[d]}, 0);
       if (res < MIN_TOTAL) {
           delete links[d];
       }
   });

    // convert to rows
    var rows = Object.keys(links).map(function(key) {
        return Object.keys(links[key]).map(function(subKey) {
            return {"from": key, "to": subKey, "value": links[key][subKey]};
        })
    });

    // remove the elements with a low number of connections
    var filtered = _.flatten(rows)
        // .filter(function(el) {
        // return _.includes(Object.keys(rows), el.to) && _.includes(Object.keys(rows), el.from)
    // }).filter(function(el) {return el.value >= MIN_CON});

    // at this point we can still have links pointing to single or very low frequency characters.
    // we should count the unique ids in the to field, and check whether they appear enough.
    var groupedTo = (_.groupBy(filtered,"to"));
    var toBeRemoved = [];
    Object.keys(groupedTo).forEach(function(d) {
        var toCount = groupedTo[d].reduce(function(initial, d) {return initial + d.value}, 0);
        if (toCount < MIN_TOTAL) toBeRemoved.push(d);
    });

    filtered = filtered.filter(function(d) {return !_.includes(toBeRemoved,d.to)});

    // and flatten them before writing
    fs.writeFile('./appear_together_all.csv',d3.csvFormat(filtered));

    // We only write the links from lowest char to highest char. This
    // avoids having duplicate links. This function recursive walks through
    // the provided (unique) array.
    function addPersonsToLinks(persons, links) {

        var head = _.head(persons);
        var tail = _.tail(persons);

        if (head && tail.length > 0) {
            links[head] ? links[head] : links[head] = {};
            var addTo = links[head];
            tail.forEach(function(p) {
                addTo[p] ? addTo[p]++ : addTo[p] = 1;
            });
            addPersonsToLinks(tail, links);
        }
    }

};

