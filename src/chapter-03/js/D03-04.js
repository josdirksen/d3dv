function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 100, right: 20, left: 20},
        width = 1200 - margin.left - margin.right,
        height = 2000 - margin.top - margin.bottom;

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

        // convert population and arrea to a number
        data = data.map(function(el) {
            el.Population = +el.Population;
            el.Area = +el.Area;
            el.Density = el.Population / el.Area;
            el.key = el['Country code']

            if (el.Density === Infinity) el.Density = 0;
            return el;
        });

        // group entries using nest and create hierarchy per continent
        var entries = d3.nest()
            .key(function (d) {return d.Continent; })
            .entries(data);

        console.log(entries);
        // setup the tree generator
        var tree = d3.partition()
            .size([height, width])
            .padding(0)

        // create a colorScale which maps the continent
        // name to a color from the specified interpolator
        var domain = entries.map(function(el) {return el.key}).concat("world");
        var colorScale = d3.scaleOrdinal()
            .domain(domain)
            .range(d3.range(0,entries.length + 2)
                .map(function(i) { return d3.interpolateRainbow(i/domain.length);}))

        // use the color scale to add a legend
        var legend = chart.append("g")
            .attr("class","legend")
            .attr("transform", "translate(0 " + (height + 20) + ")" )

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
            var root = d3.hierarchy({values: entries, key: "world"}, function(d) { return d.values; })
                .sum(function(data) { return data[property]; })
                .sort(function(a, b) { return b.value - a.value; });

            // convert it to a tree
            tree(root);
            update(root);
        }


        function update(root) {

            // add a header
            var header = d3.select("h1").text("Showing " + properties[2]);

            // we only print out the leaves, leaves are the nodes
            // without children.
            // Object consistency: https://bost.ocks.org/mike/constancy/
            var groups = chart.selectAll(".node").data(root.descendants(), function(d) {return d.data.key })

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
                .style("fill", function(d) {return colorScale(d.data.Area ? d.parent.data.key : d.data.key )})
                .style("stroke", "white")
                .attr("height", function(d, i) {return d.x1 - d.x0})
                .attr("width", function(d, i) {return d.y1 - d.y0});


            // and we append the foreignObject, with a nested body for the text
            newGroups.append("foreignObject")
                .append("xhtml:body")
                .style("margin-left", 0);

            // TODO: http://stackoverflow.com/questions/18831949/d3js-make-new-parent-data-descend-into-child-nodes
            // Do a cutout about data propogation

            // we position the new and updated groups based on the calculated d.x0 and d.y0
            var allGroups = groups.merge(newGroups)

             allGroups.transition().duration(2000)
                .attr("transform", function(d) {return "translate(" + d.y0 + " " + d.x0 + ")"})

            // When we update it could mean changing the size of the rectangle
            allGroups.select("rect")
                .transition().duration(2000)
                .attr("height", function(d, i) {return d.x1 - d.x0})
                .attr("width", function(d, i) {return d.y1 - d.y0})

            // When updating we should change the size of the foreign object
            allGroups.select("foreignObject")
                .transition().duration(2000)
                .attr("height", function(d) {return d.x1 - d.x0})
                .attr("width", function(d) {return d.y1 - d.y0})

            allGroups.select("foreignObject").select("body")
                .style("margin-left", 0)
                .transition().duration(2000)
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
                    var newHeight = (d.x1 - d.x0);
                    var interpolator = d3.interpolateNumber(oldHeight, newHeight);

                    // assign to variable, so we can access it in the custom tween
                    var node = this;
                    return function(t) {
                        d3.select(node).html(function(d) {
                            var newHeight = interpolator(t);
                            return '<div data-height="' + newHeight + '"  style="height: ' + newHeight + '" class="node-name"><p>' + (d.data['Country (en)'] ?  d.data['Country (en)'] : d.data.key) + '</p></div>'
                        })
                    }
                });
        }

        function onclick(d) {
            var currentProp = properties.shift();
            properties.push(currentProp);
            withProperty(currentProp);
            mouseout()
        }

        function mouseover(d) {

            if (d.data['Population']) {
                div.style("display", "inline");
                div.html("<ul>" +
                    "<li><strong>Name:</strong> " + d.data['Country (en)'] + " </li>" +
                    "<li><strong>Population:</strong> " + d.data['Population'] + " </li>" +
                    "<li><strong>Area:</strong> " + d.data['Area'] + " </li>" +
                    "</ul>")
            }

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


