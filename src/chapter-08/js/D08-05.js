function show() {

    'use strict';
    // Generic setup
    var margin = {top: 150, bottom: 20, right: 20, left: 230},
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.xml('data/tiger.svg', loaded);

    function loaded(err, tiger) {
        var tigerSVG = d3.select(tiger.documentElement.querySelector("g")).attr("transform", null).node();
        svg.append("g").node().appendChild(tigerSVG);
    }
};


