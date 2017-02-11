function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var symbols = [
        {name: 'Cross', symbol: d3.symbolCross},
        {name: 'Circle', symbol: d3.symbolCircle},
        {name: 'Diamond', symbol: d3.symbolDiamond},
        {name: 'Square', symbol: d3.symbolSquare},
        {name: 'Star', symbol: d3.symbolStar},
        {name: 'Triangle', symbol: d3.symbolTriangle},
        {name: 'Wye', symbol: d3.symbolWye}
    ];

    var data = d3.range(0, 200).map(function (d) {
        return {
            n: d,
            x: Math.random() * width,
            y: Math.random() * height,
            item: symbols[d%7]
        }
    });


    var color = d3.scaleOrdinal()
        .domain(symbols.map(function (s) {return s.name}))
        .range(d3.schemeCategory10);

    // add 200 elements
    svg.selectAll("symbol")
        .data(data).enter()
        .append("g")
            .attr("transform", function(d) {return "translate(" + d.x + " " + d.y + " )"})
            .attr("class", "symbol")
        .append("path")
            .attr("d", function(d) {return d3.symbol().type(d.item.symbol)()})
            .attr("fill", function(d) { return color(d.item.name)});

    var brush = d3.brush()
        .on("brush", brushed)

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushed() {
        var extent = d3.event.selection;
            var x0 = extent[0][0],
                y0 = extent[0][1],
                x1 = extent[1][0],
                y1 = extent[1][1];

            data.forEach(function (d, i) {
                if (x0 <= d.x && d.x <= x1 && y0 <= d.y && d.y <= y1) {
                    d3.selectAll(".symbol:nth-child(" + (i+1) +")")
                        .select("path")
                        .attr("stroke", "black")
                        .attr("stroke-width", "2");
                } else {
                    d3.selectAll(".symbol:nth-child(" + (i+1) +")")
                        .select("path")
                        .attr("stroke", null)
                        .attr("stroke-width", null);

                }
            });
    }
}


