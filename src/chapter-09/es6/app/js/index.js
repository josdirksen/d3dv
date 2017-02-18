import * as d3 from "d3";
import {scaleOrdinal} from "d3-scale";
import {scaleBand} from "d3-scale";
import {select} from "d3-selection";

function show() {

    'use strict';
    // Generic setup
    const margin = {top: 20, bottom: 20, right: 20, left: 30};
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // create the standard chart
    let svg = select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let symbols = [
        {name: 'Cross', symbol: d3.symbolCross},
        {name: 'Circle', symbol: d3.symbolCircle},
        {name: 'Diamond', symbol: d3.symbolDiamond},
        {name: 'Square', symbol: d3.symbolSquare},
        {name: 'Star', symbol: d3.symbolStar},
        {name: 'Triangle', symbol: d3.symbolTriangle},
        {name: 'Wye', symbol: d3.symbolWye}
    ];

    var color = scaleOrdinal()
        .domain(symbols.map(s => s.name))
        .range(d3.schemeCategory10);

    var xBand = scaleBand()
        .domain(symbols.map(s => s.name))
        .range([0, width])
        .paddingInner(0.1);

    var symbolGroups = svg.selectAll(".symbol").data(symbols)
        .enter()
        .append("g")
        .attr("class", "symbol")
        .attr("transform", d => `translate(${xBand(d.name)} 40)`)

    symbolGroups.append("path")
        .attr("fill", d => color(d.name))
        .attr("attr1", d => { console.log(this); return "attr1"})
        .attr("attr2", function(d) { console.log(this); return "attr2" })
        .attr("d", d => {
            return d3.symbol()
                .size(2400)
                .type(d.symbol)()
        });

    varTest()

    function varTest() {
        for (i = 10 ; i < 20 ; i++) {
            console.log(i)
        }

        if (i < 10) {
            var i;
        }
    }

    var obj = {
        doSomething(name = 'd3') {
        },

        doSomethingElse(count = 100) {
        }
    }

}

window.onload = show();


