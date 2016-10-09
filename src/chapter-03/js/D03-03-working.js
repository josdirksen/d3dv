function show() {

    // TODO: - Add animation from 0 to this
    //       - Add animation when changing measurement value
    //              - The data array stays the same. We just
    //              - need to resort and animate to new position

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1600 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("display", "none");

    d3.text('./data/countries.csv', function(raw) {
        var data = d3.dsvFormat(";").parse(raw)

        // convert population to a number
        data = data.map(function(el) {
            el.Population = +el.Population;
            return el;
        });

        // group entries using nest and create hierarchy
        var entries = d3.nest()
            .key(function (d) {return d.Continent; })
            .entries(data);

        // we now have a tree, where the children are stored in values. We add
        // a root node, for the 'world' data, and create a hierarchy.
        var root = d3.hierarchy({values: entries}, function(d) { return d.values; })
            .sum(function(data) { return data.Population; })
            .sort(function(a, b) { return b.value - a.value; });

        // setup the tree generator
        var tree = d3.treemap()
            .size([width, height])
            .padding(2)
            .tile(d3.treemapSquarify.ratio(1));

        // create a colorScale which maps the continent
        // name to a color from the specified interpolator
        var colorScale = d3.scaleOrdinal()
            .domain(entries.map(function(el) {return el.key}))
            .range(d3.range(0,entries.length + 1)
                .map(function(i) { return d3.interpolateRainbow(i/entries.length);}))

        // convert it to a tree
        tree(root);
        
        // we only print out the leaves, leaves are the nodes
        // without children.
        var groups = chart.selectAll(".node").data(root.leaves())
            .enter()
            .append("g")
                .attr("transform", function(d) {return "translate(" + d.x0 + " " + d.y0 + ")"})
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

        // create a rectangle, whose color is based on th ecolor assigned to the continent
        groups.append("rect")
            .attr("width", function(d) {return d.x1 - d.x0})
            .attr("height", function(d) {return d.y1 - d.y0})
            .style("fill", function(d) {return colorScale(d.parent.data.key)})
            .style("stroke", "black");

        //
        groups.append("foreignObject")
                .attr("transform", function(d) {return "translate(0 0)"})
                .attr("width", function(d) {return d.x1 - d.x0})
                .attr("height", function(d) {return d.y1 - d.y0})
                .append("xhtml:body")
                    .style("margin-left", 0)
                    .html(function(d) {return '<div style="height: ' + (d.y1 - d.y0) + '" class="node-name"><p>' + d.data['Country (en)'] + '</p></div>'})

        function mouseover(d) {
            div.style("display", "inline");
            div.html("<ul>" +
                "<li><strong>Name:</strong> " + d.data['Country (en)'] + " </li>" +
                "<li><strong>Population:</strong> " + d.data['Population'] + " </li>" +
                "<li><strong>Area:</strong> " + d.data['Area'] + " </li>" +
                "</ul>")
        }

        function mousemove(d) {
            div
                // .text(d3.event.pageX + ", " + d3.event.pageY)
                .style("left", (d3.event.pageX - 34) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
        }

        function mouseout() {
            div.style("display", "none");
        }
    });
}


