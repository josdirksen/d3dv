const d3 = require('d3');
const fs = require('fs');

d3.queue()
    .defer(d3.json, "file:world-110m.v1.json")
    .defer(d3.csv, "file:worldbank_popular_2014.csv")
    .defer(d3.csv, "file:iso-mapping.csv")
    .await(function (error, topoData, worldbank, mapping) {

        // get the mapping between the numeric and alpha one.
        var isoKV = mapping.reduce(function (res, el) {
            res[el[' ISO 3166-1 A3']] = el[' ISO 3166-1 N3'];
            return res;
        }, {});

        // convert to array with country and the correct code
        var inetData = worldbank
            .filter(function (d) {
                return d["Series Code"] === 'IT.NET.USER.P2'
            })
            .map(function (d) {
                return {
                    countryA: d['Country Code'],
                    countryN: isoKV[d['Country Code']],
                    value: d['2014 [YR2014]'],
                    name: d['Country Name']
                }
            });

        // create a kv map so we can lookup the value when processing
        // the topojson.
        var inetDataKV = inetData.reduce(function (res, el) {
            res[el.countryN] = el;
            return res;
        }, {});

        // add to topoJSON, is undefined if not found.
        topoData.objects.countries.geometries.forEach(function (d) {
            var data = inetDataKV[d.id]
            if (data) {
                d.properties = {
                    value: data.value,
                    countryA: data.countryA,
                    name: data.name
                }
            }
        });

        fs.writeFile('./world-110m-inet.json', JSON.stringify(topoData))
    });
