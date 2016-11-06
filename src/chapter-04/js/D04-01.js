function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1100 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    var CHAR_SIZE = 25;
    var LOC_SIZE = 5;

    // setup the clip path to use, to nicely clip the images to the circle
    d3.select(".chart").append("defs").append("clipPath")
        .attr("id","clip-1")
        .append("circle")
        .attr("r", CHAR_SIZE)

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // setup the propeties of the simulation
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(function(d) {
            return d.type === "location" ? -40 : -40;
        }))
        .force("collide", d3.forceCollide(function(d) {return d.type === 'character' ? 50 : 50; }).iterations(16))
        .force("y", d3.forceY(height/2).strength(0.2))
        .force("x", d3.forceX(height/2).strength(0))
        .force("center", d3.forceCenter(width / 2, height / 2))

    // Load the simpsons logo as svg
    d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
        var logoAndText = svg.append("g")
            .attr("class", "title")
        logoAndText.node().appendChild(xml.documentElement);
        logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")

        // also append some text
        logoAndText.append("text").text("Characters & Locations")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width/2) + ", 50)")
    });

    var ForceConfig = function() {
        this.collideCharacters = 50;
        this.collideLocations = 50;
        this.chargeCharacters = -40;
        this.chargeLocations = -40;
        this.forceX = 0;
        this.forceY = 0.2;

        // Define render logic ...
        this.simulate = function(){
            simulation.force("collide", d3.forceCollide(function(d) {return d.type === 'character' ? config.collideCharacters : config.collideLocations; }).iterations(16))
                      .force("charge", d3.forceManyBody().strength(function(d) { return d.type === "location" ? config.chargeLocations : config.chargeCharacters; }))
                      .force("y", d3.forceY(height/2).strength(config.forceY))
                      .force("x", d3.forceY(height/2).strength(config.forceX));

            simulation.alpha(1).alphaTarget(0.6).alphaMin(0.6).restart();
        }
    };
    var config = new ForceConfig();

    d3.json("./data/graph.json", function(error, graph) {

        setupGUI()

        // we need to do some additional grouping to support highlighting the correct nodes
        // for this we need a map between the character id and the connection ids.
        var groupedCharacterLinks = _.groupBy(graph.links, "source");
        var groupedLocationLinks = _.groupBy(graph.links, "target");

        // we create one big array of the characters and the locations
        graph.nodes = graph.characters.concat(graph.locations);

        // draw the links in two steps, the inner line
        var link = svg.append("g")
            .attr("class", "links")
            .selectAll(".links")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "links");

        // and the outer line
        var link2 = svg.append("g")
            .attr("class", "links2")
            .selectAll(".links2")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "links2");

        // draw the nodes and add listeners
        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")
                .attr("clip-path","url(#clip-1)")
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

        // draw the circle
        node.append("circle")
            .attr("r", function(d) { return d.type === 'character' ? CHAR_SIZE : LOC_SIZE; })
            .attr("class", function(d) {return d.type})
            .attr("stroke", "black");

        // for the characters add an image
        node.filter(function(d) {return d.type === 'character' })
            .append("image")
            .attr("xlink:href",  function(d) { return "./data/images/" + d.name.toLowerCase() + ".png";})
            .attr("height", 50)
            .attr("width", 50)
            .attr("transform", "translate(-25 -15)")

        // add the text at the bottom
        var svgGroup = svg.append("g").attr("class","output-text")
            .attr("transform", function(d, i) { return "translate( " + (width/2) +  " " + (height-50) + ")"})
            .append("text").attr("text-anchor", "middle").text("");

        // run the simulation
        simulation.nodes(graph.nodes).on("tick", ticked);
        simulation.force("link").links(graph.links);
        simulation.alphaDecay(0.02);

        // on each tick set the postion of the nodes and the lines
        function ticked() {
            link.attr("d", linkArc)
            link2.attr("d", linkArc)
            node.attr("transform", function(d) {return "translate("+ d.x +" " + d.y + ")"})
        }


        // handle mouseOut of node
        function mouseOut(d) {
            // remove the text
            d3.select(this).select("circle").attr("stroke-width","0");
            d3.select('.output-text text').text("");
            // reset highlighting styles
            d3.selectAll("path.links2").style("stroke","white");
            d3.selectAll(".nodes circle")
                .attr("stroke", "black")
                .attr("stroke-width", 2);
        }

        // handle mouseOver of node
        function mouseOver(d) {
            // when you hover over a node, draw a circle and set some text
            d3.select(this).select("circle").attr("stroke-width","8");
            d3.select('.output-text text').text("~ " + d.name + " ~");

            if ((d.id[0]) === 'c') { // for a character
                // select the lines that leave from this node and set the style.
                var links = groupedCharacterLinks[d.id].map(function (el) { return el.target.id });
                var selected = d3.selectAll("path.links2").filter(function (pp) {
                    return _.includes(links, pp.target.id) && pp.source.id === d.id
                }).style("stroke","blue")
            } else { // for a location
                // select the lines that leave from this node and set the style.
                var links = groupedLocationLinks[d.id].map(function (el) { return el.source.id });
                var selected = d3.selectAll("path.links2").filter(function (pp) {
                    return _.includes(links, pp.source.id) && pp.target.id === d.id
                }).style("stroke","green")

                // also highlight the relevant characters
                d3.selectAll(".nodes circle").filter(function (pp) {
                    return _.includes(links, pp.id)
                }).attr("stroke-width", "8")
                    .attr("stroke", "red");
            }
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.8).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);

            if (!d3.event.sourceEvent.shiftKey) {
                d.fx = null;
                d.fy = null;
            }
        }

        function linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        }

        // function linkArc(d) {
        //     // determine the control point. The x of the control point is in the
        //     // center between source and target
        //     var cX = (d.source.x + d.target.x) / 2;
        //     var cY = d.target.y;
        //     return "M" + d.source.x + "," + d.source.y + "Q" + cX + "," + cY  + "," + d.target.x + "," + d.target.y;
        // }


        // <path d="M10 80 Q 95 10 180 80" stroke="black" fill="transparent"/>

        function setupGUI() {
            var gui = new dat.GUI();
            gui.add(config, 'collideCharacters', 0, 200);
            gui.add(config, 'collideLocations', 0, 200);
            gui.add(config, 'chargeCharacters', -500, 500, 20);
            gui.add(config, 'chargeLocations', -500, 500, 20);
            gui.add(config, 'forceX', 0, 2, 0.01);
            gui.add(config, 'forceY', 0, 2, 0.01);

            gui.add(config, 'simulate');
        }
    });
}


