function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1600 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var totalDatapoints = 30; // number of points used to draw the streamgraph
    var numberSeries = 12;     // number of series to show
    var interval = 1000;      // interval at which to rerender

    var x = d3.scaleLinear()
        .domain([0, totalDatapoints-4])
        .range([0, width]);

    var y = d3.scaleLinear().domain([-2, 12]).range([height, 0]);
    var color = d3.scaleLinear().domain([0, numberSeries]).range(["red", "orange"]);

    var area = d3.area().curve(d3.curveNatural)
        .x(function(d,i) { return x(i-1); })
        .y0(function(d)  { return y(d[1]); })
        .y1(function(d)  { return y(d[0]); });

    // setup the mask
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", x(totalDatapoints-4))
        .attr("height", height + margin.bottom + margin.top);
    var g = svg.append("g").attr("clip-path", "url(#clip)");

    // initialize an empty array, which will be filled with
    // the information received over the websocket.
    var data = initEmpty(totalDatapoints, numberSeries);

    var stack = d3.stack().offset(d3.stackOffsetWiggle)
        .keys(d3.range(numberSeries).map(function(d) {return d}));


    // Log messages from the server
    var receivedData = {};

    var isRunning = false;
    var connection = new WebSocket('ws://localhost:8081');
    connection.onmessage = function (received) {
        var frame = JSON.parse(received.data);

        Object.keys(frame).forEach(function(key) {
            if (!receivedData[key]) {
                receivedData[key] = 0;
            }
            receivedData[key] += +frame[key];
        })

        // kick off processing.
        if (!isRunning) { isRunning = true; render(); }
    };



    function render() {
        data.push(receivedData);
        var stacked = stack(data)

        var existingEls = g.selectAll("path").data(stacked)
        var newEls = existingEls.enter().append("path")
            .style("fill", function(d,i) { return color(i); });

        receivedData = {}

        var all = existingEls.merge(newEls)
            .attr("transform", null)
            .transition().duration(interval).ease(d3.easeLinear)
            .attrTween("d", function(d, i) {
                var oldData = this._old ? this._old : d3.range(totalDatapoints + 1).map(function() {return {'0': 0, '1': 0}});
                var currentData = d;
                var interpolator = d3.interpolate(oldData, currentData)
                return function(t) {
                    return area(interpolator(t))
                }

            })
            .attr("transform", "translate(" + x(-1) + ")")

        all.on("end", function(d, i) {
            // end is called for each of the transactions. We only need to trigger a new loop when this transaction is finished.
            d.shift();
            this._old = d;
            if (d.key === numberSeries-1) { render() }
        });

        data.shift();
    }

    // create an empty initial array
    function initEmpty(totalDatapoints, numberSeries) {
        return d3.range(totalDatapoints).map(function(nc) {
            return d3.range(numberSeries).reduce(function(res, mc) {
                res[mc] = 0.7; return res;
            }, {id: nc});
        })
    }
}


