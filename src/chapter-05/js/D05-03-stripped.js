function show() {

    'use strict';

    // Generic setup, map is standard 960×500
    var margin = {top: 40, bottom: 10, right: 40, left: 10},
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    // Canvas on which we draw the globe
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // scale that returns the colors
    var colorScale = d3.scaleLinear().domain([0, 100]).range([0, 1]);
    // var color = function (i) { return d3.interpolateOranges(colorScale(i)) };
    var color = function (i) { return d3.interpolateBlues(colorScale(i)) };

    // setup the projection, and the path generator
    var projection = d3.geoNaturalEarth();

    var path = d3.geoPath().projection(projection);
    var color = d3.scaleSequential(d3.interpolateGreens).domain([0,100])

    console.log(color(20))
    // the topografies we'll render
    // var f = {type: "Sphere"};
    // make the complete map fit into the designated width and height
    // projection.fitSize([width, height], f)

    // Now load the data and when done call process to combine the data
    // and render it for the first time.
    var countries;

    d3.json("./data/world-110m-inet.json", function(loadedTopo) {
        // make the data available to the callbacks
        countries  = topojson.feature(loadedTopo, loadedTopo.objects.countries).features;

        // draw the map and the legend
        redrawWorld(countries);
    });

    function redrawWorld(countryToShow) {
        svg.selectAll('.country_raw').data(countryToShow).enter()
            .append("path")
            .classed('country_raw', true)
            .attr("d", path)
            .attr("fill", function(d) {return d.properties.value ? color(+d.properties.value) : '#ccc'});
    }
}
