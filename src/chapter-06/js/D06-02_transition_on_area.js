// Implement this:http://jsfiddle.net/f5JSR/2/
function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var totalDatapoints = 15; // number of points used to draw the streamgraph
    var numberSeries = 8;     // number of series to show

    var stack = d3.stack().offset(d3.stackOffsetWiggle)
        .keys(d3.range(numberSeries).map(function(d) {return d}));

    var x = d3.scaleLinear()
        .domain([0, totalDatapoints-1])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([-2, 8])
        .range([height, 0]);

    var color = d3.scaleLinear()
        .range(["red", "orange"]);

    var area = d3.area()
        .curve(d3.curveNatural)
        .x(function(d,i) { return x(i); })
        .y0(function(d) { return y(d[1]); })
        .y1(function(d) {  return y(d[0]); });

    // initialize an empty array, which will be filled with
    // the information received over the websocket.
    var data = initArray(totalDatapoints, numberSeries);

    console.log(data)

    // connect
    var connection = new WebSocket('ws://localhost:8081');

    // Log errors
    connection.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = function (received) {
        // var stacked = stack(getRandomData(totalDatapoints, numberSeries))
        var frame = JSON.parse(received.data);
        data.push(frame);
        render(stack(data));
        data.shift();
        // process(JSON.parse(e.data));

    };

    // Need to redraw the complete graph and slide into view, which won't
    // work, since it is possible they are translated on the y axis as well.
    function render(stacked) {
        var existingEls = svg.selectAll("path")
            .datum(stacked)

        var newEls = existingEls.enter().append("path")
            .style("fill", function() { return color(Math.random()); });

        var all = existingEls.merge(newEls)
            .attr("transform", null)
            .transition().duration(500)
            .attr("d", area)
            .attr("transform", "translate(" + x(-1) + ")");
    }

    function initArray(totalDatapoints, numberSeries) {
        return d3.range(totalDatapoints).map(function(nc) {
            return d3.range(numberSeries).reduce(function(res, mc) {
                // res[mc] = 0;
                res[mc] = Math.random();
                return res;
            }, {id: nc});
        })
    }

    // // setup the scales. The domain is the x-axis, containing 400 points
    // // the y axis is based on the min and max values of the data
    // var x = d3.scaleLinear().domain([0, n - 1]).range([100, width]);
    // var yEcg = d3.scaleLinear().domain([15800, 26000]).range([height/2, 0]);
    // var yResp = d3.scaleLinear().domain([14800, 24000]).range([height/2 + height/2, 0]);
    // var sEcg = d3.scaleLog().domain([15800, 26000]).range([1, 0]);
    // var sResp = d3.scaleLinear().domain([14800, 24000]).range([1, 0]);
    //
    // // we use a line generator, based on the index and the data
    // var lineEcg = d3.line()
    //     .x(function(d, i) { return x(i); })
    //     .y(function(d) { return yEcg(+d.ecg); });
    //
    // var lineResp = d3.line()
    //     .x(function(d, i) { return x(i); })
    //     .y(function(d) { return yResp(+d.resp); });
    //
    //
    // svg.append("g").append("path").datum(data)
    //     .attr("class", "ecg")
    //     .attr("d", lineEcg);
    //
    // svg.append("g").append("path").datum(data)
    //     .attr("class", "resp")
    //     .attr("d", lineResp);
    //
    //
    // d3.queue()
    //     .defer(d3.xml, 'data/heart.svg')
    //     .defer(d3.xml, 'data/lungs.svg')
    //     .await(start)
    //
    // function start(err, heart, lungs) {
    //
    //     var addedHeart = svg.append("g").attr("class","heartContainer").node().appendChild(heart.documentElement.querySelector("g"))
    //     d3.select(addedHeart)
    //         .attr("class","heart")
    //         .attr("transform", "translate(0 " + (yEcg(ecgAvg)-30) + " ) scale(0.1 0.1)")
    //
    //
    //     var addedLungs = svg.append("g").attr("class", "lungContainer").node().appendChild(lungs.documentElement.querySelector("g"))
    //     d3.select(addedLungs)
    //         .attr("class","lungs")
    //         .attr("transform", "translate( 0 " + (yResp(respAvg)-30)  + " ) scale(2 2)");
    //
    //     // connect
    //     var connection = new WebSocket('ws://localhost:8081');
    //
    //     // Log errors
    //     connection.onerror = function (error) {
    //         console.log('WebSocket Error ' + error);
    //     };
    //
    //     // Log messages from the server
    //     connection.onmessage = function (e) {
    //         process(JSON.parse(e.data));
    //     };
    //
    //
    //
    //     // display the data
    //     function process(received) {
    //         // Push a new data point onto the back.
    //         data.push(received);
    //
    //         d3.select(".ecg").attr("d", lineEcg);
    //         d3.select(".resp").attr("d", lineResp);
    //         d3.select(".heartContainer").attr("opacity", sEcg(+received.ecg))
    //         d3.select(".lungContainer").attr("opacity", sResp(+received.resp))
    //
    //         data.shift();
    //     }
    // }

}


