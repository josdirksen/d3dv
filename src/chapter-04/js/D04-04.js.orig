// rewrite http://bl.ocks.org/mbostock/7881887
// http://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
function show() {

    'use strict';

    // Generic setup
    var margin = {top: 200, bottom: 20, right: 20, left: 200},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var outerRadius = (Math.min(width, height) * 0.5) - 140,
        innerRadius = outerRadius - 30;


    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");


    d3.queue()
        .defer(d3.csv, "./data/appear_together_all.csv")
        .defer(d3.csv, "./data/characters.csv")
        .await(function (error, words, characters) {
            process(words, characters)
        });

    // first thing to do is setup the matrix
    function process(data, characters) {

        var characterKV = characters.reduce(function(res, el) {
            res[el.id] = el;
            return res;
        }, {});

        // the target matrix.
        var matrix = [];

        // to we need to get the from, to, put them in an array and use that for the dimensions size.
        var toIds = data.map(function(d) {return d.from});
        var fromIds = data.map(function(d) {return d.to});

        // these are the unique ids and define the dimensions of the matrix.
        // there is no sorting here.
        var uniqueIds = _.uniq(toIds.concat(fromIds));

        // initialize the array with zero values
        uniqueIds.forEach(function(id, i) {
            // initialize an empty matrix with zeros
            matrix[i] = Array.apply(null, Array(uniqueIds.length)).map(Number.prototype.valueOf,0);
        });


        // now walk through the rows, and fill the specific rows
        data.forEach(function(d) {
            var n = uniqueIds.indexOf(d.from);
            var m = uniqueIds.indexOf(d.to);

            matrix[n][m] = +d.value;
            // do we need to way back?
            matrix[m][n] = +d.value;
        });

        var mappedData = uniqueIds.map(function(d,i) {
            return {
                id: d,
                row: matrix[i]
            }
        });

        var sortedMappedArray = mappedData.sort(function(a,b) {

            var aCount = a.row.reduce(function(initial, d) {return initial + d}, 0);
            var bCount = b.row.reduce(function(initial, d) {return initial + d}, 0);

            if (aCount < bCount) { return 1} else
            if (aCount > bCount) { return -1} else return 0;
        });

        var max = d3.max(data, function(d) {return +d.value});
        var cv = d3.scaleLog().base(10)
            .domain([1,max])
            // .range([0,1000])
            .range([0,1])

        var color = function(v) {
            cv(v)
            if (v == 0) {
                return d3.rgb(255,255,255)
            }
            return d3.interpolateBlues(cv(v));
        };


        var x = d3.scaleBand().range([0, width]).domain(d3.range(0,uniqueIds.length)).paddingInner([0.05])

        var row = svg.selectAll(".row")
            .data(sortedMappedArray)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
            .each(function(d,i) {

                // for the first row also set the headers at the top
                if (i == 0) {
                    d3.select(this).selectAll("text").data(d.row).enter()
                        .append("text")
                        .attr("dx", "0.5em")
                        .attr("transform", function(d,j) {return "translate(" + (x(j) + (x.bandwidth())) + " 0) rotate(-90)"})
                        .text(function(e,j) {return characterKV[sortedMappedArray[j].id].name}).attr("text-anchor","begin");
                }

                d3.select(this).selectAll("rect")
                    .data(d.row)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, j) {return x(j)})
                    .attr("height", x.bandwidth())
                    .attr("width", x.bandwidth())
                    .attr("fill", function(d, j) {
                        if (i == j) {
                            return d3.rgb(200,200,200)
                        } else {
                            return color(d)
                        }
                    });
            });

        row.append("text").text((function(d,i) {return characterKV[d.id].name}))
            .attr("dy", "0.8em")
            .attr("dx", "-0.3em")
            .attr("fill","black")
            .attr("text-anchor","end")


    };
};

