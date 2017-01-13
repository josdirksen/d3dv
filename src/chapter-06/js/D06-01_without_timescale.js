function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var nPoints = 20;

    // setup the scales. The domain is the x-axis, containing 400 points
    // the y axis is based on the min and max values of the data
    // var x = d3.scaleLinear().domain([0, n - 1]).range([0, width]);
    var x = d3.scaleLinear().domain([0, nPoints - 1]).range([0, width]);
    var y = d3.scaleLinear().domain([0, 500]).range([height, 0]);

    // we use a line generator, based on the index and the data
    var lineMx = d3.line()
        .curve(d3.curveBasis)
        .x(function(d, i) { return x(i); })
        .y(function(d) { return y(d.x); });

    var lineMy = d3.line()
        .curve(d3.curveBasis)
        .x(function(d, i) { return x(i); })
        .y(function(d) { return y(d.y); });

    // we keep track of the total movement, and whenever we draw
    // add a new point we get the current value, and reset the old
    // ones.
    var previousEvent;
    var totalX = 0;
    var totalY = 0;
    d3.select("body").on("mousemove", function() {
        if (previousEvent) {
            totalX += Math.abs(previousEvent.x - d3.event.x)
            totalY += Math.abs(previousEvent.y - d3.event.y)
        }
        previousEvent = { x: d3.event.x, y: d3.event.y };
    });

    d3.interval(function() {
        totalX = 0;
        totalY = 0;
    }, 1000, 1000);

    var data = d3.range(0, nPoints-1).map(function() {return  {x:0, y:0}});

    var group = svg.append("g").attr("class", "group")
        group.append("path").datum(data).attr("class", "lineX line")
        group.append("path").datum(data).attr("class", "lineY line")

    // kick of the animation
    renderX()

    function renderX() {
        data.push({x: totalX, y: totalY})
        totalX = 0; totalY = 0;

        // redraw the lines
        d3.select(".lineX").attr("d", lineMy)
        d3.select(".lineY").attr("d", lineMx)

        // setup the transition
        d3.select(".group").attr("transform", "")
            .transition().ease(d3.easeLinear).duration(1000).on("end", renderX)
            .attr("transform", "translate(" + x(-1) + ",0)")

        data.shift();
    }

    // svg.append("g").append("path").datum(data)
    //     .attr("class", "ecg")
    //     .attr("d", lineMy);

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


