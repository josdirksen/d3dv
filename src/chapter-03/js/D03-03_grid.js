function show(chartName, tiling) {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1500 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var chart = d3.select("." + chartName)
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

        // convert population and arrea to a number
        data = data.map(function(el) {
            el.Population = +el.Population;
            el.Area = +el.Area;
            el.Density = el.Population / el.Area;

            if (el.Density === Infinity) el.Density = 0;
            return el;
        });

        // group entries using nest and create hierarchy per continent
        var entries = d3.nest()
            .key(function (d) {return d.Continent; })
            .entries(data);

        // setup the tree generator
        var tree = d3.treemap()
            .size([width, height])
            .padding(2)
            .tile(tiling);
            // we can change how the treemap is rendered
            // .tile(d3.treemapSquarify.ratio(3));
            // .tile(d3.treemapSquarify.ratio(1));
            // .tile(d3.treemapResquarify);

        // create a colorScale which maps the continent
        // name to a color from the specified interpolator
        var colorScale = d3.scaleOrdinal()
            .domain(entries.map(function(el) {return el.key}))
            .range(d3.range(0,entries.length + 1)
                .map(function(i) { return d3.interpolateWarm(i/entries.length);}))

        // use the color scale to add a legend
        var legend = chart.append("g")
            .attr("class","legend")
            .attr("transform", "translate(0 " + height + ")" )


        legend.selectAll("rect")
            .data(colorScale.domain())
            .enter()
                .append("rect")
                .attr("x", function(d,i) {return i * 100})
                .attr("fill", colorScale)
                .attr("width", 100)
                .attr("height", 20)

        legend.selectAll("text")
            .data(colorScale.domain())
            .enter()
            .append("text")
            .attr("x", function(d,i) {return i * 100})
            .attr("dy", 15)
            .attr("dx", 2)
            .text(function(d) {return d})


        // generate a population oriented tree.
        var properties = ['Population', 'Area', 'Density'];

        // trigger the first property
        onclick();

        function withProperty(property) {
            // we now have a tree, where the children are stored in values. We add
            // a root node, for the 'world' data, and create a hierarchy.
            var root = d3.hierarchy({values: entries}, function(d) { return d.values; })
                .sum(function(data) { return data[property]; })
                .sort(function(a, b) { return b.value - a.value; });

            // convert it to a tree
            tree(root);
            update(root);
        }


        function update(root) {

            console.log(chart)
            // add a header
            // var header = d3.select("h1").text("Showing " + properties[2]);

            // we only print out the leaves, leaves are the nodes
            // without children.
            // Object consistency: https://bost.ocks.org/mike/constancy/
            var groups = chart.selectAll(".node").data(root.leaves(), function(d) {return d.data['Country code']})

            // for the newgroups we add a g, and set some behavior.
            var newGroups = groups
                .enter()
                .append("g")
                .attr("class","node")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout)
                .on("click", onclick);

            // for the newgroups we also add a rectangle, which is filled.
            // with the color of the continent, and has a simple black border.
            newGroups.append("rect")
                .style("fill", function(d) {return colorScale(d.parent.data.key)})
                .style("stroke", "black")
                .attr("width", function(d, i) {return d.x1 - d.x0})
                .attr("height", function(d, i) {return d.y1 - d.y0});


            // and we append the foreignObject, with a nested body for the text
            newGroups.append("foreignObject")
                .append("xhtml:body")
                .style("margin-left", 0);

            // TODO: http://stackoverflow.com/questions/18831949/d3js-make-new-parent-data-descend-into-child-nodes
            // Do a cutout about data propogation

            // we position the new and updated groups based on the calculated d.x0 and d.y0
            var allGroups = groups.merge(newGroups)

             allGroups.transition().duration(20)
                .attr("transform", function(d) {return "translate(" + d.x0 + " " + d.y0 + ")"})

            // When we update it could mean changing the size of the rectangle
            allGroups.select("rect")
                .transition().duration(20)
                .attr("width", function(d, i) {return d.x1 - d.x0})
                .attr("height", function(d, i) {return d.y1 - d.y0})

            // When updating we should change the size of the foreign object
            allGroups.select("foreignObject")
                .transition().duration(20)
                .attr("width", function(d) {return d.x1 - d.x0})
                .attr("height", function(d) {return d.y1 - d.y0})

            allGroups.select("foreignObject").select("body")
                .style("margin-left", 0)
                .transition().duration(20)
                .tween("custom", function(d, i) {

                    // need to get the current height. We get this from the element
                    // itself, since the bound data can be changed.
                    var oldHeight = 0;

                    // this can be undefined for the first run
                    var currentDiv = d3.select(this).select("div").node();
                    if (currentDiv) {
                        var height = currentDiv.getAttribute("data-height");
                        oldHeight = height ? height : 0;
                    }

                    // calculate the new height and setup a interpolator
                    var newHeight = (d.y1 - d.y0);
                    var interpolator = d3.interpolateNumber(oldHeight, newHeight);

                    // assign to variable, so we can access it in the custom tween
                    var node = this;
                    return function(t) {
                        d3.select(node).html(function(d) {
                            var newHeight = interpolator(t);
                            return '<div data-height="' + newHeight + '"  style="height: ' + newHeight + '" class="node-name"><p>' + d.data['Country (en)'] + '</p></div>'
                        })
                    }
                });
        }

      // simple listeners which show an overlay div at an absolute location


        function onclick(d) {
            var currentProp = properties.shift();
            properties.push(currentProp);
            withProperty(currentProp);
            mouseout()
        }

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
                .style("left", (d3.event.pageX ) + "px")
                .style("top", (d3.event.pageY + 20) + "px");
        }

        function mouseout() {
            div.style("display", "none");
        }
    });
}


