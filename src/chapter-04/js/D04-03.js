// rewrite http://bl.ocks.org/mbostock/7881887
// http://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 45},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var outerRadius = (Math.min(width, height) * 0.5) - 140,
        innerRadius = outerRadius - 30;


    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");

    d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
        var logoAndText = svg.append("g")
            .attr("class", "title")
        logoAndText.node().appendChild(xml.documentElement);
        logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")


        logoAndText.append("text").text("~ Appearances together in season 22 ~")
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .attr("transform", "translate(" + (width/2) + " " + (height-20) +")");
    });

    d3.queue()
        .defer(d3.csv, "./data/appear_together.csv")
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

        console.log(matrix);

        var color = d3.scaleOrdinal()
            .domain(d3.range(uniqueIds.length))
            .range(d3.range(uniqueIds.length)
                .map(function(i) { return d3.interpolateRainbow(i/uniqueIds.length);}));


        var chord = d3.chord()
            .padAngle(0.03)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var ribbon = d3.ribbon()
            .radius(innerRadius);

        var g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .datum(chord(matrix));

        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); })

        var group = g.append("g")
            .attr("class", "groups")
            .selectAll("g")
            .data(function(chords) { return chords.groups; })
            .enter().append("g");


        var paths = group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return color(d.index); })
            .attr("d", arc)
            .on("mouseover", function(d) {
                var index  = d.index;

                var invalidInces = [];
                d3.selectAll(".ribbons path")
                    .filter(function(dRibbon) {
                        var isValid = (dRibbon.source.index == index ||
                        dRibbon.target.index == index);
                        if (isValid) {
                            invalidInces.push(dRibbon.source.index);
                            invalidInces.push(dRibbon.target.index);
                        };
                        return !isValid;
                    })
                    .style("opacity", "0.1");

                d3.selectAll(".groups path")
                    .filter(function(dPath) { return !_.includes(invalidInces, dPath.index); })
                    .style("opacity", "0.1");

                d3.selectAll(".groups text").filter(function(dPath) { return !_.includes(invalidInces, dPath.index); })
                    .style("opacity", "0.1");

            })
            .on("mouseout", function(d) {
                d3.selectAll(".ribbons path").style("opacity", "1");
                d3.selectAll(".groups path").style("opacity", "1");
                d3.selectAll(".groups text").style("opacity", "1");
            });



        group.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dx", function(d) {return arc.centroid(d)[0] > 0 ? "1em" : "-1em"})
            .attr("dy", "0.3em")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 26) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d, i) { return characterKV[uniqueIds[i]].name});


    }
}


