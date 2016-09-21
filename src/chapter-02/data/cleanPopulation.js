const d3 = require('d3');
const fs = require('fs');

fs.readFile('./NP2014_D1.csv', function (err, fileData) {
    var rows = d3.csvParse(fileData.toString());

    var allPopulation = rows.filter(function (row) {
        return row['origin'] === '0'
            && row['race'] === '0'
            && row['sex'] === '0';
    });


    var mapped = allPopulation.map(function(row) {
        var populationGrouped = {};
        for (var i = 0 ; i < 10 ; i++) {
            var sum = 0;
            for (var j = 0 ; j < 10 ; j++) {
                var indexName = i * 10 + j;
                sum += +row['pop_' + indexName]
            }
            // for the last row we explicitly need to add the `pop_100`
            if (i == 9) sum += +row['pop_100'];
            populationGrouped[i] = sum;
        }
        populationGrouped.year = row.year;
        populationGrouped.total = row.total_pop;
        return populationGrouped;
    });

    fs.writeFile('./populationFiltered.csv',d3.csvFormat(mapped));
});

