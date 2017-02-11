function show() {

    'use strict';

    // Generic setup
    var margin = {top: 20, bottom: 20, right: 120, left: 100},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width/2 + 100) + "," + height/2 + ")");

    // generic functions
    var tree = d3.tree()
        .size([360, 300])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var stratify = d3.stratify();
    var colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([0,12]);

    var root;        // initial set of loaded data
    var currentRoot; // the currentData being shown

    d3.select("button").on("click", exportAsSVG);

    // load the data
    d3.csv('./data/cats.csv', function(loaded) {
        // convert the loaded data to a nested structure, and convert
        // it to a tree with the specific settings.
        root = stratify(loaded);
        tree(root);

        // assign a group to the descendants of level 2, which we use for coloring
        var colorGroups = root.descendants().filter(function(node) {return node.depth === 2});
        colorGroups.forEach(function(group, i) {
            group.descendants().forEach(function(node) {node.data.group = i;})
        });

        // the root and rootKV, are here merely for reference, to make sure we
        // have the correct number of records at any time. Lets clone the root
        // element, so we have a working copy.
        // currentRoot =_.cloneDeep(root);
        currentRoot =_.cloneDeep(root);

        // render the graph based on the currentRoot
        update();
    });

    // draw or update the
    function update() {

        // calculate the x,y coordinates of the currentRoot
        tree(currentRoot);

        // create KV for simple access
        var currentRootKV = currentRoot.descendants().reduce(function(kv, el) {kv[el.data.id] = el; return kv},{});

        // the currentRoot contains the correct XY positions for all the nodes
        // minus the ones that need to be hidden. We don't want to limit the
        // number of nodes for our data elements, since that causes text and lines to
        // `jump` around. So we need to make sure we have the same amount of elements
        // and hide rendering the hidden ones.
        var toRender = root.descendants().map(function(el) {
            if (currentRootKV[el.data.id]) {
                var newNode = currentRootKV[el.data.id];
                return newNode;
            } else {
                // if the child is not in the KV map, it is hidden. We
                // now need to set its position to the calculated position of
                // the first visible parent. In other words, the first one
                // which is in the currentRootKV map.
                var fromRoot = _.cloneDeep(el);
                var parent = fromRoot.parent;
                while (!currentRootKV[parent.data.id]) {
                    parent = parent.parent;
                }
                var newParent = currentRootKV[parent.data.id];

                fromRoot.hidden = true;
                fromRoot.x = newParent.x;
                fromRoot.y = newParent.y;

                // we also set the parents x,y since the lines need to
                // be drawn from this position.
                fromRoot.parent.x = newParent.x;
                fromRoot.parent.y = newParent.y;

                return fromRoot;
            }
        });

        // now that we have to correct data, create the links
        var links = chart.selectAll(".link")
            .data(toRender.slice(1));

        var linksEnter = links.enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal({x:0, y:0, parent: {x:0, y:0}}))
            .style("stroke", function(d) {return colorScale(d.data.group)});

        links.merge(linksEnter)
            .transition().duration(2000).attr("d", diagonal);

        // create the groups that hold the circle and the text elements
        var nodes = chart.selectAll(".node").data(toRender);

        var nodesEnter = nodes.enter().append("g")
                .attr("class", "node")
                .on("click", click)

        nodesEnter.append("circle")
            .attr("r", 2.5)
            .style("fill", function(d) {return colorScale(d.data.group)});

        nodesEnter.append("text")
            .attr("dy", ".31em")

        // combine the updated and new nodes
        var nodesUpdate = nodes.merge(nodesEnter);

        // transition the nodes (circles & text)
        nodesUpdate.transition().duration(2000)
            .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; })
            .style("opacity", function(d) { return !d.hidden ? 1 : 0} )
            .on("end", function(d) {d.hidden ? d3.select(this).attr("display", "none"): ""})
            .on("start", function(d) {!d.hidden ? d3.select(this).attr("display", ""): ""});

        nodesUpdate.select("text")
            .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
            .text(function(d) {return d.data.name; })
            // we could also tween the anchor see chapter 2
            .style("text-anchor", function(d) {
                // for the right side
                if (d.x < 180 && d.children) return "end"
                else if (d.x < 180 && !d.children) return "start"
                // for the left side
                else if (d.x >= 180 && !d.children) return "end"
                else if (d.x >= 180 && d.children) return "start"
            })
            .transition().duration(2000)
                .attr("transform", function(d) {
                    // called once to determine the target value, and tween the values
                    return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
                })
    }

    // on click hide the children, and color the specific node
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;

            // highlight the selected circle
            d3.select(this).select("circle").style("stroke", "red");
            d3.select(this).select("circle").style("stroke-width", "2");
        } else {
            d.children = d._children;
            d._children = null;

            // reset the highlight
            d3.select(this).select("circle").style("r", 2.5);
            d3.select(this).select("circle").style("stroke", "");
        }
        update();
    }

    // draw a curve line between d and it's parent
    function diagonal(d) {
        return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
    }

    // convert the x,y to a position on the circle
    function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    /**
     * Export as PNG file.
     */
    function exportAsSVG() {

        // first load the external css which will be applied to the image. For
        // instance we can set the color to black instead of white.
        d3.text('./css/D08-04.css', function(externalStyles) {
            // first convert the SVG node to a string.
            var svgString = nodeToSVGString(d3.select('svg').node(), externalStyles);
            // to make inline css work with inkscape
            var stripped = svgString.replace('xmlns="http:\/\/www.w3.org\/1999\/xhtml"','');
            svgString2SVG(stripped);
        });
    }

    /**
     * Convert the node to an XML/SVG string with applied custom styling
     */
    function nodeToSVGString( svgNode, cssText ) {
        appendCSS( cssText, svgNode )
        console.log(svgNode);
        return new XMLSerializer().serializeToString(svgNode);

        /**
         * Append the external css to the element, so it is correctly exported
         */
        function appendCSS( cssText, element ) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type","text/css");
            styleElement.innerHTML = cssText;

            (element.hasChildNodes() && element.children)
                ? element.insertBefore( styleElement, element.children[0])
                : element.insertBefore( styleElement, null );
        }
    }

    /**
     * Conver an SVG string to a file.
     */
    function svgString2SVG( svgString, width, height, callback ) {

        // create a dataURL object
        var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        saveAs(blob, "radial-tree.svg");
    }
}
