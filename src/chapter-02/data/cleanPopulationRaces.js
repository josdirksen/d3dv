const d3 = require('d3');
const fs = require('fs');

fs.readFile('./NP2014_D1.csv', function (err, fileData) {
    var rows = d3.csvParse(fileData.toString());

    // races are identified as 1, 2, 3, 4, 5, and 6
    // returns an object with the rows for the individual races
    var racesPopulation = {};
    for (var i = 1 ; i <= 6 ; i++ ) {
        var is = i + "";
        var racePopulation = rows.filter(function (row) {
            return row['origin'] === '0'
                && row['race'] === i + ""
                && row['sex'] === '0';
        });
        racesPopulation[is] = racePopulation
    }


    var resultArray = [];
    for (var i = 0 ; i < racesPopulation["1"].length ; i++) {
        var total = 0;
        var result = {
            year: racesPopulation["1"][i].year
        }
        for (j = 1 ; j <= 6 ; j++ ) {
            result[j] = racesPopulation[j + ""][i].total_pop;
            total += +racesPopulation[j + ""][i].total_pop;
        }

        result.total = total;
        resultArray.push(result);
    }



    fs.writeFile('./populationFilteredRaces.csv',d3.csvFormat(resultArray));
});

