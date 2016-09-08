const d3 = require('d3');
const fs = require('fs');

// read the data
fs.readFile('./ASE_2014_00CSA02.csv', function (err, fileData) {
    var rows = d3.csvParse(fileData.toString());

    // filter out the sector specific stuff
    var allSectors = rows.filter(function (row) {
        return row['NAICS.id'] === '00'
    });
    
    // remove unused columns, and make nice headers
    var mapped = allSectors.map( function(el) {
       return {
           sex: el['SEX.id'], 
           sexLabel: el['SEX.display-label'],
           ethnicGroup: el['ETH_GROUP.id'],
           ethnicGroupLabel: el['ETH_GROUP.display-label'],
           raceGroup: el['RACE_GROUP.id'],
           raceGroupLabel: el['RACE_GROUP.display-label'],
           vetGroup: el['VET_GROUP.id'],
           vetGroupLabel: el['VET_GROUP.display-label'],
           yearsInBusiness:  el['YIBSZFI.id'],
           yearsInBusinessLabel:  el['YIBSZFI.display-label'],
           count: el['FIRMPDEMP']
       }
    });

    fs.writeFile('./businessFiltered.csv',d3.csvFormat(mapped));
});

