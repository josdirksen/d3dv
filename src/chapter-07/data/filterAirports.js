const d3 = require('d3');
const fs = require('fs');

d3.csv("file:airports.csv", process);

function process(data) {

    var filtered = data
        .filter(function(row) {return row.type === "medium_airport" || row.type === "large_airport"})
        .map(function(row) {return {
            name: row.name,
            lon: row.longitude_deg,
            lat: row.latitude_deg,
        }})

    fs.writeFile('./ml_airports.csv',d3.csvFormat(filtered));
};

