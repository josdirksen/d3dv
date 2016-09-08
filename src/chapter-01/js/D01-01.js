
function show() {
    'use strict';

    var margin = { top: 20, bottom: 20, right: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
                                        + margin.top + ")");

    function update() {

        var rectangleWidth = 100,
            data = [],
            numberOfRectangles = Math.ceil(Math.random() * 7);

        for (var i = 0 ; i < numberOfRectangles ; i++) {
            data.push((Math.random() * rectangleWidth / 2)
                                     + rectangleWidth / 2);
        }

        // Assign the data to the rectangles (should there be any)
        var rectangles = chart.selectAll("rect").data(data);

        // Set a style on the existing rectangles so we can see them
        rectangles.attr("class", "update")
            .attr("width", function(d) {return d})
            .attr("height", function(d) {return d});

        rectangles.enter()
            .append("rect")
            .attr("class", "enter")
            .attr("x", function(d, i) { return i * (rectangleWidth + 5) })
            .attr("y", 50)
            .attr("width", function(d) {return d})
            .attr("height", function(d) {return d});
            // .merge(rectangles)
            // .attr("width", function(d) {return d})
            // .attr("height", function(d) {return d});

        // Handle rectangles which are left over
        // rectangles.exit().remove();

        // we could also change the ones to be remove
        rectangles
            .exit()
            .attr("class", "remove");
    }

    // set initial value
    update();
    // and update every 3 seconds
    d3.interval(function() { update(); }, 3000);
}

