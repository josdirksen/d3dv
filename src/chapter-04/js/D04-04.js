// rewrite http://bl.ocks.org/mbostock/7881887
// http://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
function show() {

    'use strict';

    // Generic setup
    var margin = {top: 200, bottom: 120, right: 50, left: 200},
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    // add the chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");

    // add the logo and the text
    d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
        var logoAndText = svg.append("g")
            .attr("transform", "translate(-180 -200)")
            .attr("class", "title")
        logoAndText.node().appendChild(xml.documentElement);
        logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")

        svg.append("text").text("~ Appearances together in all seasons ~")
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .attr("transform", "translate(" + (width/2) + " " + -160 +")");
    });

    // load the rquired information sources
    d3.queue()
        .defer(d3.csv, "./data/appear_together_all.csv")
        .defer(d3.csv, "./data/characters.csv")
        .await(function (error, words, characters) {
            process(words, characters)
        });

    // first thing to do is setup the matrix
    function process(data, characters) {

        // create a KV for lookups
        var characterKV = characters.reduce(function (res, el) {
            res[el.id] = el;
            return res;
        }, {});

        // to we need to get the from, to, put them in an array and use
        // that for the dimensions size.
        var toIds = data.map(function (d) { return d.from });
        var fromIds = data.map(function (d) { return d.to });
        var uniqueIds = _.uniq(toIds.concat(fromIds));

        // count the max, which we use to set up the color scale
        var max = d3.max(data, function (d) { return +d.value });
        var cv = d3.scaleLog().base(10).domain([1, max]).range([0, 1]);
        var color = function (v) {
            return v == 0 ? d3.rgb(255, 255, 255) : d3.interpolateBlues(cv(v));
        };
        // use a scaleBand to draw the individual records
        var x = d3.scaleBand().range([0, width]).domain(d3.range(0, uniqueIds.length)).paddingInner([0.05]);

        // Setup the values we'll be sorting on
        var uniqueCounts = determineTotalValue(uniqueIds, data);
        var uniqueTargets = determineTotalCount(uniqueIds, data);

        // zip up everything in a single object
        var idsEnriched = uniqueIds.map(function (d, i) {
            return { id: d, total: uniqueCounts[i], counts: uniqueTargets[i]}
        });

        // now that we've got the values to sort on, lets define two sort methods
        var sorts = [sortTotal, sortCounts];

        // based on the raw data, the enriched ids and a sort function
        // we create the matrix to show
        var toShow = prepareData(data, idsEnriched, sorts[0]);

        // and show the matrix.
        show(toShow);

        /**
         * Prepare the matrix
         */
        function prepareData(data, idsEnriched, sort) {
            // determine the sort order
            var idsEnriched = sort(idsEnriched);
            // the target matrix.
            var matrix = [];
            // initialize the array with zero values
            uniqueIds.forEach(function (id, i) {
                matrix[i] = Array.apply(null, Array(uniqueIds.length)).map(Number.prototype.valueOf, 0);
            });

            // now walk through the rows, and fill the specific rows
            data.forEach(function (d) {
                var n = _.findIndex(idsEnriched, {id: d.from});
                var m = _.findIndex(idsEnriched, {id: d.to});
                matrix[n][m] = +d.value;
                matrix[m][n] = +d.value;
            });

            // we want to keep track of which data belongs where so add an id.
            var mappedData = idsEnriched.map(function (d, i) {
                return {id: d.id, row: matrix[i]}
            });

            return mappedData;
        }

        /**
         * Draw the matrix diagram
         */
        function show(toShow) {

            // we first select all the rows and map the data based on id
            var row = svg.selectAll(".row")
                .data(toShow, function (d) { return d.id });

            // for the newly added rows, we add a group to contain the name and the rectangles
            var newRows = row.enter()
                .append("g")
                .attr("class", "row")
                .on("click", function (d) {
                    // change the sort order, and reshow everything.
                    sorts.reverse();
                    show(prepareData(data, idsEnriched, sorts[0]));
                })

            // merge with the rows that are updated and set the properties.
            newRows.merge(row)
                // determine the position of the row
                .transition().duration(2000)
                    .attr("transform", function (d, i) {
                        return "translate(0," + x(i) + ")";
                    })
                // we want to process each data element separately. So we do an each.
                .each(function (d, i) {
                    // select all the existing rectangles in this row. And bind a single
                    // data row.
                    var rectangles = d3.select(this).selectAll("rect").data(d.row)

                    // for the new rectangles, just create a new rect
                    rectangles.enter().append("rect")
                        .merge(rectangles)
                        // set the position and size of each rectangle.
                        .attr("x", function (d, j) { return x(j)})
                        .attr("height", x.bandwidth())
                        .attr("width", x.bandwidth())
                        // add the row and column as data property for easy reference in the
                        // mouse listeners
                        .attr("data-r", function(e, j) {return i})
                        .attr("data-c", function(e, j) {return j})
                        // register mouse lsiteners to highlight the rows/columns currently selected
                        .on("mouseover", mouseOver)
                        .on("mouseout", mouseOut)
                        // colors can change so we transition those.
                        .transition().duration(2000)
                            .attr("fill", function (e, j) {
                                return i == j ? d3.rgb(200, 200, 200) : color(e);
                            });
                });


            // also bind the data to the text at the top of the matrix
            var topText = svg.selectAll(".top").data(toShow, function (d) { return d.id })

            // set the standard values when creating new elements
            topText.enter()
                .append("text")
                .attr("class", "top")
                .attr("dx", "0.5em")
                .text(function (e, j) { return characterKV[toShow[j].id].name})
                .attr("text-anchor", "begin")
                .merge(topText)
                // set the position on new and updated elements using a transition
                .transition().duration(2000)
                    .attr("transform", function (d, j) {
                        return "translate(" + (x(j) + (x.bandwidth())) + " 0) rotate(-90)"
                    });


            // set the text on the left
            newRows.append("text")
                .attr("dy", "0.8em")
                .attr("dx", "-0.3em")
                .attr("fill", "black")
                .attr("class", "left")
                .attr("text-anchor", "end")
                .text((function (d, i) {
                    return characterKV[d.id].name
                }));

            // finally add the legend at the bottom
            svg.append("text")
                .attr("class","legend")
                .attr("transform", "translate(" + (width/2) + " " + (height+100) + ")")
                .text("")
        }

        /**
         * On mouse over color the columns and row
         */
        function mouseOver(d) {
            var r = +d3.select(this).attr("data-r");
            var c = +d3.select(this).attr("data-c");

            d3.selectAll("rect").filter(function(e) {return +d3.select(this).attr("data-c") === c})
                .filter(function(e) {return +d3.select(this).attr("data-r") < r})
                .attr("opacity","0.3")
            d3.selectAll("rect").filter(function(e) {return +d3.select(this).attr("data-r") === r})
                .filter(function(e) {return +d3.select(this).attr("data-c") < c}).attr("opacity","0.3")
            d3.selectAll(".legend").text("~ " + d + " ~")
        }

        /**
         * On mouse out reset
         */
        function mouseOut(d) {
            d3.selectAll("rect").attr("opacity", "1")
        }

        /**
         * Count the values
         */
        function determineTotalValue(uniqueIds, data) {
            var uniqueCounts = uniqueIds.map(function (d) {
                var toCount = _.filter(data, {to: d}).reduce(function (initial, d) {
                    return initial + +d.value
                }, 0);
                var fromCount = _.filter(data, {from: d}).reduce(function (initial, d) {
                    return initial + +d.value
                }, 0);

                return toCount + fromCount;
            });

            return uniqueCounts;
        }

        /**
         * Count number of unqiue connections
         */
        function determineTotalCount(uniqueIds, data) {
            var uniqueTargets = uniqueIds.map(function (d) {
                var toCount = _.filter(data, {to: d}).length
                var fromCount = _.filter(data, {from: d}).length

                return toCount + fromCount;
            });

            return uniqueTargets;
        }

        /**
         * Sort by count
         */
        function sortCounts(data) {
            return _.sortBy(data, ["counts"]).reverse()
        }

        /**
         * Sort by total
         */
        function sortTotal(data) {
            return _.sortBy(data, ["total"]).reverse()
        }
    };
};

