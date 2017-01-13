function show() {

    'use strict';

    // Generic setup, map is standard 960×500
    var margin = {top: 100, bottom: 10, right: 70, left: 50},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // contains data when loaded
    var quakes = [];
    var topo = {};
    var currentYear = 1850;

    // containers for the map and the circles on top
    var map = svg.append("g").attr("class","map");
    var circles = svg.append("g");
    circles.attr("clip-path","url(#clip-1)");

    // setup and connect the slider
    d3.select(".year-select")
        .attr("width", width + margin.left + margin.right);
    d3.select("#slider").on("change", function() {
        currentYear = +this.value;
        updateYear(currentYear, quakes)
    });

    // setup the projection, and the path generator
    var projection = d3.geoAiry();
    var path = d3.geoPath().projection(projection);

    // select and connect the dropdown
    d3.select("#geoSelection").on("change", function() {
        projection = d3[this.value]();
        path = d3.geoPath().projection(projection);

        updateYear(currentYear, quakes);
        process(topo);
    });

    // setup the title
    var text = svg.append("g")
        .attr("transform", "translate(" + (width/2) + " -60)")
    text.append("text").attr("class", "title").attr("text-anchor", "middle")
        .text("World Earthquake data");
    text.append("text").attr("class", "year").attr("transform", "translate(" + 0 + " 40)")
        .attr("text-anchor", "middle");


    // setup scales
    var radiusScale = d3.scaleLinear().domain([5, 10]).range([0.2, 4]);
    var colScale = d3.scaleLinear().domain([5, 10]).range([0,1]);
    var color = function(m) { return d3.interpolateBlues((colScale(m)));};

    // load the data, and pass it on to the updateYear function.
    d3.queue()
        .defer(d3.json, "./data/world-110m.v1.json")
        .defer(d3.tsv, "./data/earthquakes.tsv")
        .await(function (error, topoData, quakesData) {
            topo = topoData;
            quakes = quakesData;

            process(topo);
            quakes.forEach(function (d) {
                d.LATITUDE = +d.LATITUDE;
                d.LONGITUDE = +d.LONGITUDE;
                d.EQ_PRIMARY = +d.EQ_PRIMARY;
                d.YEAR = +d.YEAR;
            })

            updateYear(1850, quakes)
        });

    // update the earthquake circles
    function updateYear(year, quakes) {
        d3.select("text.year").text(year);
        var toShow = quakes.filter(function(d) {return d.YEAR === year});
        var circle = d3.geoCircle()
        var paths = circles.selectAll("path")
            .data(toShow);

        var bpaths = paths.enter()
            .append("path")
            .merge(paths);

        bpaths.attr("d", function(d) {
            return path(circle.center([d.LONGITUDE, d.LATITUDE]).radius(radiusScale(d.EQ_PRIMARY))())
        }).attr("style", function(d) {return "fill: " +  color(d.EQ_PRIMARY)});

        paths.exit().remove();
    }

    // display the map
    function process (topo) {

        // first remove everything, cause we might have switched projection
        map.selectAll("path").remove();
        d3.selectAll("defs").remove();

        // define a custom feature, which creates the outline of the map
        var f = {type: "Sphere"}
        // make the complete map fit into the designated width and height
        projection.fitSize([width, height], f)

        // create a path and draw it.
        var outline = path(f);
        map.append("path").attr("class", "sphere").attr("d", outline);
        // create and add a clippath to hide some artifacts

        d3.select(".chart").append("defs").append("clipPath")
            .attr("id","clip-1")
            .append("path").attr("d", outline);

        map.attr("clip-path","url(#clip-1)");

        // first display all the counties.
        map.selectAll(".country")
            .data(topojson.feature(topo, topo.objects.countries).features)
            .enter()
            .append("path")
            .attr("class","country")
            .attr("d", path)

        // add lines
        map.append("path").datum(d3.geoGraticule()()).attr("class","graticule").attr("d", path);

        // add the legend at the bottom
        var legend = svg.append("g").attr("class","legend")
            .attr("transform" ,"translate(" + (width+20) + " 70)")

        legend.append("rect").attr('x', 0)
            .attr('width', 20)
            .attr('height', 500)
            .style("fill", "url(#Gradient)");

        legend.append("text")
            .attr('x', 25)
            .attr('y', 10)
            .text("5");

        legend.append("text")
            .attr('x', 25)
            .attr('y', 500)
            .text("10");

        legend.append("text")
            .attr('x', 250)
            .attr("text-anchor", "middle")
            .attr('y', -30)
            .attr('transform', 'rotate(90)')
            .text("magnitude");

        var defs = svg.append('defs');
        var lg = defs.append('linearGradient')
            .attr('id', 'Gradient')
            .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
        lg.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color(5));
        lg.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color(10));


    };

}


