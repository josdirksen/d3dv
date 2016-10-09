function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 120, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width/2 + 100) + "," + height/2 + ")");

    var tree = d3.tree()
        .size([360, 400])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var stratify = d3.stratify();


    var root;
    d3.csv('./data/cats.csv', function(loaded) {
        root = stratify(loaded);
        // convert the loaded data to a nested structure, and convert
        // it to a tree with the specific settings.
        tree(root);

        update();
    });

    function update() {

        tree(root);
        console.log(root);

        // we'll group color all nodes below level 2. We do this by
        // adding a property to the data propertie of the individual descendants
        var colorGroups = root.descendants().filter(function(node) {return node.depth === 2});
        // var colorScale = d3.scaleOrdinal().range()
        colorGroups.forEach(function(group, i) {
            group.descendants().forEach(function(node) {node.data.group = i;})
        });
        var c = d3.scaleSequential(d3.interpolateSpectral).domain([0,12]);

        console.log(root.descendants().length);

        // generate all the lines between the nodes, excluding the first
        // node we encounter.
        var link = chart.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", function(d) {return c(d.data.group)})
            .attr("d", diagonal);

        // create the groups that hold the circle and the text elements
        var nodeRoot = chart.selectAll(".node")
            .data(root.descendants());

        // new nodes
        var nodep = nodeRoot.enter().append("g")
            .on("click", click)
        nodep.append("circle").attr("r", 2.5).style("fill", function(d) {return c(d.data.group)});
        nodep.append("text")
            .attr("dy", ".31em")
            .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
            .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
            .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
            .text(function(d) { return d.data.name; });


        // update nodes
        var node = nodeRoot.merge(nodep).attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) {
                return "translate(" + project(d.x, d.y) + ")"; })

        nodeRoot.exit().attr("sdf", function(d) {console.log(d)}).remove();

        // add a simple circle
        // node.append("circle").attr("r", 2.5).style("fill", function(d) {return c(d.data.group)});

        // add the text
    }

    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }

        update();
    }

    function diagonal(d) {

        // use a bezier curve to draw a nice line
        // alternatively we could use d3.line() to
        // define the lines.
        return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
    }

    function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }
}


