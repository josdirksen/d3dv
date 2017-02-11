function show() {

    'use strict';

    // Generic setup
    var margin = {top: 50, bottom: 20, right: 20, left: 20},
        width = 900 - margin.left - margin.right,
        height = 1750 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height/2 + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var text = svg.append("g")
        .append("text")
        .attr("class", "title")
        .attr("transform", "translate(" + (width/2)  + ")")
        .attr("text-anchor", "middle")
        .text("Presidential Elections 2016")

    d3.select("button").on("click", exportAsPng);

    // setup the projection
    var projection = d3.geoAlbersUsa();
    var path = d3.geoPath()
        .projection(projection);

    // add the scales
    var scale = d3.scaleLinear().domain([-0.8, 0, 0, 0.8]).range(["blue", "#A6D8F0", "#FFB3A6" ,"red"]);

    // load the data
    d3.queue()
        .defer(d3.json, "./data/cb_2015_us_county_500k.simplified.topojson")
        .defer(d3.csv, "./data/2016_US_County_Level_Presidential_Results.csv")
        .await(function (error, topo, data) {
            process(topo, data)
        });

    // display the data
    function process (topo, data) {

        // make the ids the same in both files, by converting them to numeric values
        topo.objects['cb_2015_us_county_500k']
            .geometries.forEach(function(d) { d.id = +d.id; });
        data.forEach(function(d) {
            d['combined_fips'] = +d['combined_fips'];
            d['per_gop'] = +d['per_gop'];
            d['per_dem'] = +d['per_dem'];
        });
        // data.sort(function(a, b) {return (a["per_gop"] - a["per_dem"]) - (b["per_gop"] - b["per_dem"])} )
        var dataKV = data.reduce(function(res, el) { res[el.combined_fips] = el; return res; }, {});

        // first display all the counties.
        svg.append("g").attr("class","map").selectAll(".county")
            .data(topojson.feature(topo, topo.objects['cb_2015_us_county_500k']).features)
            .enter()
            .append("path")
            .attr("class","county")
            .attr("id",function(d) {return "cid-" + d.id})
            .attr("fill", function(d) {
                var electionData = dataKV[d.id];
                return electionData
                    ? scale(electionData["per_gop"] - electionData["per_dem"])
                    : "#ccc"
            })
            .attr("debug", function(d) {return d.id})
            .attr("d", path)

        // based on the loaded data create a scaleband
        // we want 200 elements per row
        var gridBand = d3.scaleBand().domain(d3.range(0,100)).range([0, width]);
        var grid = svg.append("g")
            .attr("class","grid")
            .attr("transform", "translate(0 " + 550 + ")")
            .selectAll("rect").data(data).enter()
            .append("rect")
            .attr('fill',function(d) {return scale(d["per_gop"] - d["per_dem"])})
            .attr("x", function(d, i) { return gridBand(i % 100) })
            .attr("y", function(d, i) { return Math.floor( i / 100) * gridBand.bandwidth() })
            .attr("width", function(d) { return gridBand.bandwidth() })
            .attr("height", function(d) { return gridBand.bandwidth() })
            .attr("data-state", function(d) {return d['state_abbr']})
            .on("mouseover", function(d) {
                d3.select(this).attr("class","selected")

                svg.select('#cid-'+d['combined_fips'])
                    .attr("class", "selected");

                svg.selectAll('rect').attr("style","opacity: 0.3")
                var sel = svg.selectAll('rect[data-state="' + d['state_abbr'] + '"]');
                sel.attr("style","opacity: 1")

                svg.select("g.text  text").text(d['state_abbr']
                    + ": "
                    + d['county_name']
                    + " (Dem: " + (parseFloat(d['per_dem']).toFixed(2))
                    + " Gop: " + (parseFloat(d['per_gop']).toFixed(2)) + ")");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("class","")
                svg.selectAll('rect').attr("style","opacity: 1")
                svg.select('#cid-'+d['combined_fips'])
                    .attr("class", "county");
            })

        var text = svg.append("g")
            .attr("class", "text").append("text")
            .attr("transform", "translate(" + (width/2) + " " + 530 + ")")
            .attr("text-anchor", "middle")
            .text("")
    };

    /**
     * Export as PNG file.
     */
    function exportAsPng() {

        // first load the external css which will be applied to the image. For
        // instance we can set the color to black instead of white.
        d3.text('./css/D08-03-export.css', function(externalStyles) {
            // first convert the SVG node to a string.
            var svgString = nodeToSVGString(d3.select('svg').node(), externalStyles);

            // next save
            svgString2Image(svgString, width * 2, height, function(datablob) {
                saveAs(datablob,'elections.png'); // FileSaver.js function
            });
        });
    }

    /**
     * Convert the node to an XML/SVG string with applied custom styling
     */
    function nodeToSVGString( svgNode, cssText ) {
        appendCSS( cssText, svgNode )
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
     * Conver an SVG string to an image.
     */
    function svgString2Image( svgString, width, height, callback ) {

        // create a dataURL object
        var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        var imgsrc = window.URL.createObjectURL(blob);

        saveAs(blob, "out.svg");

        // create a canvas to load the image to.
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        // create the image, and define callback
        var image = new Image;
        image.onload = function() {

            // when loaded, draw the image, export it to a blob
            // and call the specified callback.
            context.clearRect ( 0, 0, width, height );
            context.drawImage(image, 0, 0, width, height);
            canvas.toBlob( function(blob) {
                var filesize = Math.round( blob.length/1024 ) + ' KB';
                if ( callback ) callback( blob, filesize );
            });
        };
        // set the dataurl as image source.
        image.src = imgsrc;
    }
}



