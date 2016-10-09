const d3 = require('d3');
const fs = require('fs');
const _ = require('lodash');

// read the data
fs.readFile('./felidae.csv', function (err, fileData) {

    var FILTER_NAMES = ['Animalia','Bilateria','Deuterostomia','Chordata','Vertebrata','Gnathostomata','Tetrapoda','Mammalia','Theria','Eutheria','Feliformia','Carnivora'];

    // use parseRows since we don't have an header
    var rows = d3.dsvFormat('|').parseRows(fileData.toString());

    // do some initial filtering
    var catsTree = rows.filter(function(row) { return row[0] === '[TU]' && row[11] === 'valid' });
    var catsDescriptions = rows.filter(function(row) { return row[0] === '[VR]' && row[5] === 'English' });

    // first map the catsDescriptions to an KV map for easy reference, not all have
    // a reference.
    var descriptionMap = catsDescriptions.reduce( function(kvs, row) { kvs[row[4]] = row[3]; return kvs; }, {});

    // Map the data from the row to an object array
    var strat = catsTree.map(function(row) {
        var id = row[1];
        var parent = row[18];

        var name = '';
        if (row[9].length > 0) { name = row[9]; }
        else if (row[7].length > 0) { name = row[7]; }
        else if (row[5].length > 0) { name = row[5]; }
        else if (row[3].length > 0) { name = row[3]; }

        var description = descriptionMap[id] ? descriptionMap[id] : '';

        // parent 552304 is our root, so ignore this one and set to ''
        if (parent === '552304') parent = '';

        return {
            id: id,
            parentId: parent,
            name: name,
            description: description
        }
    });

    var filtered = strat.filter(function(row) {return FILTER_NAMES.indexOf(row.name) === -1});
    fs.writeFile('./cats.csv',d3.csvFormat(filtered));
});

