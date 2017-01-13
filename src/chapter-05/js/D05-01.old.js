function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1100 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa();
    var path = d3.geoPath()
        .projection(projection);

    var scale = d3.scaleLinear().domain([-80, 0, 0, 80]).range(["blue", "#A6D8F0", "#FFB3A6" ,"red"]);

    d3.json("./data/small.geojson", function (error, data) {

        var features = data.features;

        svg.selectAll(".district")
            .data(features)
            .enter()
            .append("path")
            .attr("class","district")
            .attr("fill", function(d) {return scale(d.properties["PCT_ROM"] - d.properties["PCT_OBM"])})
            .attr("d", path)
    });
}


