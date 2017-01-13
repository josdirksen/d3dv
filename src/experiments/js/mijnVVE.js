function show() {

    'use strict';

    var data1 = [
        {key: 'jan', v1: 100, v2: 300, v3: 500},
        {key: 'feb', v1: 200, v2: 340, v3: 500},
        {key: 'mar', v1: 150, v2: 310, v3: 500},
        {key: 'apr', v1: 120, v2: 304, v3: 500}
    ];

    // Generic setup
    var margin = {top: 50, bottom: 20, right: 20, left: 20},
        width = 300 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height+ margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var max = d3.max(data1, function(d) {
        return Object.keys(d).slice(1).reduce(function(res, el) {return res + d[el]}, 0)
    })
    var stack = d3.stack().keys(Object.keys(data1[0]).slice(1));
    var series = stack(data1);

    // render the first set of elements
    var band = d3.scaleBand()
            .domain(data1.map(function(d) {return d.key}))
        .padding([0.1])
            .range([0, width]);

    console.log(band('jan'))
    var z = d3.scaleOrdinal()
        .domain(data1.map(function(d) {return d.key}))
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    var yScale = d3.scaleLinear().domain([0, max]).range([height, 0])

    svg.selectAll(".serie")
        .data(series)
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return band(d.data.key); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
        .attr("width", band.bandwidth());
}


