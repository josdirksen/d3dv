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

    var ecgAvg =  16800;
    var respAvg = 16000;

    var n = 800;
    var data = d3.range(n).map(function(d) {return {
        "ecg": ecgAvg,
        "resp": respAvg
    }});

    // setup the scales. The domain is the x-axis, containing 400 points
    // the y axis is based on the min and max values of the data
    var x = d3.scaleLinear().domain([0, n - 1]).range([100, width]);
    var yEcg = d3.scaleLinear().domain([15800, 26000]).range([height/2, 0]);
    var yResp = d3.scaleLinear().domain([14800, 24000]).range([height/2 + height/2, 0]);
    var sEcg = d3.scaleLog().domain([15800, 26000]).range([1, 0]);
    var sResp = d3.scaleLinear().domain([14800, 24000]).range([1, 0]);

    // we use a line generator, based on the index and the data
    var lineEcg = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d) { return yEcg(+d.ecg); });

    var lineResp = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d) { return yResp(+d.resp); });


    svg.append("g").append("path").datum(data)
        .attr("class", "ecg")
        .attr("d", lineEcg);

    svg.append("g").append("path").datum(data)
        .attr("class", "resp")
        .attr("d", lineResp);


    d3.queue()
        .defer(d3.xml, 'data/heart.svg')
        .defer(d3.xml, 'data/lungs.svg')
        .await(start)

    function start(err, heart, lungs) {

        var addedHeart = svg.append("g").attr("class","heartContainer").node().appendChild(heart.documentElement.querySelector("g"))
        d3.select(addedHeart)
            .attr("class","heart")
            .attr("transform", "translate(0 " + (yEcg(ecgAvg)-30) + " ) scale(0.1 0.1)")


        var addedLungs = svg.append("g").attr("class", "lungContainer").node().appendChild(lungs.documentElement.querySelector("g"))
        d3.select(addedLungs)
            .attr("class","lungs")
            .attr("transform", "translate( 0 " + (yResp(respAvg)-30)  + " ) scale(2 2)");

        // connect
        var connection = new WebSocket('ws://localhost:8081');

        // Log errors
        connection.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        // Log messages from the server
        connection.onmessage = function (e) {
            process(JSON.parse(e.data));
        };



        // display the data
        function process(received) {
            // Push a new data point onto the back.
            data.push(received);

            d3.select(".ecg").attr("d", lineEcg);
            d3.select(".resp").attr("d", lineResp);
            d3.select(".heartContainer").attr("opacity", sEcg(+received.ecg))
            d3.select(".lungContainer").attr("opacity", sResp(+received.resp))

            data.shift();
        }
    }

}


