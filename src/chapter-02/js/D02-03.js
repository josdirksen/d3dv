function show() {

    'use strict';

    d3.csv('./data/populationFiltered.csv',rowToNumbers, function(data) {
        // Generic setup
        var margin = {top: 20, bottom: 20, right: 35, left: 35},
            width = 750 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var chart = d3.select(".chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ","
                + margin.top + ")");

        // setup axis
        var scaleX = d3.scaleLinear().domain([0, data.length-1]).range([0, width]);
        var scaleY = d3.scaleLinear().domain([0, 100]).range([height, 0]);
        var scaleC = function(i) {return d3.interpolateWarm(i/9)};

        // define the area generator
        var area = d3.area()
            .x(function(d, i) { return scaleX(i); })
            .y0(function(d) { return scaleY(asPercentage(d,d[0])); })
            .y1(function(d) { return scaleY(asPercentage(d,d[1])); });

        // we've got 10 year groups, right value is not inclusive
        var stack = d3.stack().keys(d3.range(0,10));
        var series = stack(data);

        // add each area
        var serieG = chart.selectAll("g").data(series).enter().append("g");
        serieG.append("path")
            .style("fill", function(d) { console.log(d) ; return scaleC(d.key); })
            .attr("d", area);

        // add bottom axis
        var bottomAxis = d3.axisBottom().scale(scaleX).ticks(20,"r");
        var bottomAxisChart = chart.append("g")
            .attr('transform', 'translate( 0 ' + scaleY(0) +  ')')
            .call(bottomAxis);
        bottomAxisChart.selectAll('.tick text')
            .text(function(d) {return 2014 + d})

        // add left axis
        var leftAxis = d3.axisLeft().scale(scaleY).ticks(10, "r");
        var leftAxis = chart.append("g")
            .call(leftAxis);

        // add right axis
        var rightAxis = d3.axisRight().scale(scaleY).ticks(10, "r")
        var rightAxis = chart.append("g")
            .attr('transform', 'translate(' + width  +  ')')
            .call(rightAxis);
    });

    function asPercentage(row, value) {
        return (value/row.data.total * 100);
    }

    function rowToNumbers(row) {
        for (var property in row) {
            if (row.hasOwnProperty(property)) {
                row[property] = +row[property];
            }
        }
        return row;
    }
}


