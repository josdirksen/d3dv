// rewrite http://bl.ocks.org/mbostock/7881887
// http://bl.ocks.org/shancarter/f621ac5d93498aa1223d8d20e5d3a0f4
function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 45},
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    d3.select(".chart").append("defs").append("clipPath")
        .attr("id","clip-1")
        .append("circle")
        .attr("r", 40)
        .attr("width","20")
        .attr("height",100);

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");



    d3.csv("./data/words_filtered.csv", function(row) {
        row.count = +row.count;
        return row;
    }, function(error, words) {


        // Only show top 20 words per character
        var groups = _.groupBy(words,"character");
        var res = Object.keys(groups).map(function(key) {
            return _.sortBy(groups[key], "count").reverse().slice(0, 20)
        });

        // and add them to a single array
        var mostUsed = _.flatten(res);

        // group them together
        var groupMax = {};
        res.forEach(function(d) {
            var max =  _.maxBy(d, "count");
            groupMax[max.character] = max;
        });

        // setup scale.
        var max = d3.max(mostUsed, function(d) {return d.count});
        var min = d3.min(mostUsed, function(d) {return d.count});
        var scaleRadius = d3.scaleLog().base(2).domain([min, max]).range([5, 30]);

        var color = d3.scaleOrdinal().domain(Object.keys(groups)).range(d3.schemeCategory20);
        var scalePoint = d3.scalePoint().domain(Object.keys(groups)).range([0, width]).padding([5]);

        mostUsed.forEach(function(d) {
           d.r = scaleRadius(d.count);
        });

        d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
            var logoAndText = svg.append("g")
                .attr("class", "title")
            logoAndText.node().appendChild(xml.documentElement);
            logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")


            logoAndText.append("text").text("Most Used words")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width/2) + ", 40)")
        });

        var ForceConfig = function() {
            this.charge = -13;
            this.forceX = 0.02;
            this.forceY = 0.03;

            // Define render logic ...
            this.simulate = function(){
                simulation
                    .velocityDecay(0.07)
                    .alphaDecay(0.01)
                    // .force("charge", d3.forceManyBody().strength(-4))
                    .force("charge", d3.forceManyBody().strength(config.charge))
                    .force("x", d3.forceX(width/2).strength(config.forceX))
                    .force("y", d3.forceY(height/2).strength(config.forceY))
                    .force("collide", d3.forceCollide(function(d) {return d.r}))
                    .force("center", d3.forceCenter(width / 2, height / 2))
                    .force("cluster", clusteringForce)

                simulation.alpha(1).alphaTarget(0.6).alphaMin(0.6).restart();
            }
        };
        var config = new ForceConfig();
        setupGUI();


        var simulation = d3.forceSimulation()
            .velocityDecay(0.07)
            .alphaDecay(0.012)
            // .force("charge", d3.forceManyBody().strength(-4))
            .force("charge", d3.forceManyBody().strength(-13))
            .force("x", d3.forceX(width/2).strength(0.010))
            .force("y", d3.forceY(height/2).strength(0.02))
            .force("collide", d3.forceCollide(function(d) {return scaleRadius(d.count) + 2}))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("cluster", clusteringForce);

        var node = svg.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(0 -60)")
            .selectAll("circle")
            .data(mostUsed)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", function(d) {return scaleRadius(d.count)})
            .attr("fill", function(d) { return color(d.character); })
            .attr("stroke", function(d) { return d3.rgb(color(d.character)).darker(0.2); })
            .on("mouseover", function(d) {
                d3.select(this).attr("stroke", "black")
                d3.select(this).attr("stroke-width", "4")

                d3.select(".legend-" + d.character).attr("stroke", "black")
                d3.select(".legend-" + d.character).attr("stroke-width", "8")


                var toShow = d.word.charAt(0).toUpperCase() + d.word.slice(1);
                d3.select(".output-text text").text( "~ " +  toShow +  " ~")

            })
            .on("mouseout", function(d) {
                d3.select(this).attr("stroke", "")
                d3.select(".legend-" + d.character).attr("stroke", "")
                d3.select(".output-text text").text("")
            })

        var svgGroup = svg.append("g").attr("class","output-text")
            .attr("transform", function(d, i) { return "translate( " + (width/2) +  " " + (height-80) + ")"})

        svgGroup.append("text")
            .attr("text-anchor", "middle")
            .text();

        var legendGroups = svg.append("g").attr("class","legend")
            .selectAll("g").data(res)
            .enter().append("g")
            .attr("clip-path","url(#clip-1)")
            .attr("transform", function(d, i) { return "translate(" +  scalePoint(d[0].character) + " " + (height-30) + ")"})

        legendGroups.append("circle")
            .attr("fill", function (d,i) {return (color(d[0].character))})
            .attr("class", function(d,i) {return "legend-" + d[0].character})
            .attr("r", 40)
            .attr("p", function(d) {console.log(d)});

        legendGroups.append("svg:image")
            .attr("xlink:href",  function(d) { return "./data/images/" + d[0].characterName.toLowerCase() + ".png";})
            .attr("height", 90)
            .attr("width", 70)
            .attr("transform", "translate(-30 -30)");

        simulation
            .nodes(mostUsed)
            .on("tick", ticked);

        function ticked() {
            node.select("circle")
                .attr("transform", (function(d) {return "translate(" + d.x + " " + d.y + ")"}))
        }


        function clusteringForce(alpha) {
            mostUsed.forEach(function(d) {
                var cluster = groupMax[d.character];
                if (cluster === d) return;

                // determine the distance between this node and the
                // cluster node
                var x = d.x - cluster.x;
                var y = d.y - cluster.y;
                var l = Math.sqrt(x * x + y * y);

                // we need to take into account the nodes radii to avoid
                // overlapping. Note that this only avoid overlapping with
                // the main node, doesn't avoid running over other nodes.
                var r = d.r + cluster.r ;

                // as long as we're still not touching
                if (l > (r)) {

                    // move the satellite nodes towards the main node
                    l = (l - r) / l * (alpha);

                    d.vx -=(x*l)/40;
                    d.vy -=(y*l)/40;
                }
            });
        }

        function dragstarted(d) {
            if (!d3.event.active) {
                simulation.alpha(1).alphaTarget(0).alphaMin(0).restart();
            }
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

        function setupGUI() {
            var gui = new dat.GUI();
            gui.add(config, 'charge', -100, 0, 1);
            gui.add(config, 'forceX', 0, 0.2, 0.001);
            gui.add(config, 'forceY', 0, 0.2, 0.001);

            gui.add(config, 'simulate');
        }
    });




}


