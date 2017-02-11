function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 600 - margin.left - margin.right,
        height = 950 - margin.top - margin.bottom;

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

    var color = d3.scaleOrdinal()
        .domain(symbols.map(function(s) {return s.name}))
        .range(d3.schemeCategory10);

    var xBand = d3.scaleBand()
        .domain(symbols.map(function(s) {return s.name}))
        .range([0, width])
        .paddingInner(0.1);

    redraw();

    function redraw() {

        // select currently drawn symbols
        var symbolGroups = svg.selectAll(".symbol").data(symbols);

        // for newly added elements add the symbol and
        var newSymbols = symbolGroups.enter()
            .append("g")
            .attr("class","symbol")
            .attr("transform", function(d) {
                return "translate(" + xBand(d.name)  + " 40) rotate(0)"
            });

        // add the symbol to the group
        newSymbols.append("path")
            .attr("fill", function(d) {return color(d.name)})
            .attr("d", function(d) {
                return d3.symbol()
                    .size(2400) // specifies area
                    .type(d.symbol)();
            })

        // merge with existing ones, and set up a transition.
        symbolGroups.merge(newSymbols)
            .transition()
            .on('end', function(d) {
                if (d.name === 'Wye' ) redraw(); // only redraw once
            })
            .duration(2000)
            .ease(d3.easeLinear)
            .attrTween("transform", function(d, i) {
                var interpolate = d3.interpolate(0, 360);
                return function(t) {
                    return "translate(" + xBand(d.name)  + " 40) rotate(" + interpolate(t) + ")";
                };
            })
    }

}


