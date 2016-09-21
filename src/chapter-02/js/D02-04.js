function show() {

    'use strict';

    d3.csv('./data/populationFiltered.csv',rowToNumbers, function(data) {
        // Generic setup
        var margin = {top: 20, bottom: 50, right: 20, left: 45},
            width = 750 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var chart = d3.select(".chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ","
                + margin.top + ")");

        // setup axis
        var scaleX = d3.scaleBand()
            .domain(data.map(function(d) {return d.year}))
            .range([0, width])
            .padding(0.15)
            .align(0.2);

        var scaleY = d3.scaleLinear().domain([0, d3.max(data, function(d) {return d.total})]).range([height, 0]);
        var scaleC = function(i) {return d3.interpolateCool(i/10)};

        // The keys of our stack map to the 1 to 7 properties in our data
        var stack = d3.stack().keys(d3.range(0,10));
        var series = stack(data);

        // append a g element for all the years.
        var serieG = chart.selectAll("g").data(series)
            .enter().append("g")
            .attr("fill", function(d) { return scaleC(d.key); })
            .selectAll("rect")
            .data(function(d) {return d})
            .enter().append("rect")
            .attr("x", function(d) { return scaleX(d.data.year); })
            .attr("y", function(d) { return scaleY(d[1]); })
            .attr("height", function(d) { return scaleY(d[0]) - scaleY(d[1]); })
            .attr("width", scaleX.bandwidth());

        // add bottom axis
        var bottomAxis = d3.axisBottom().scale(scaleX);
        var bottomAxisChart = chart.append("g")
            .attr('transform', 'translate( 0 ' + scaleY(0) +  ')')
            .call(bottomAxis);

        // and rotate the years
        bottomAxisChart.selectAll('.tick text')
            .attr("transform", "rotate(90) translate(20, -13)")

        // add left axis
        var leftAxis = d3.axisLeft().scale(scaleY).ticks(15, "s");
        var leftAxis = chart.append("g")
            .call(leftAxis);
    });

    function rowToNumbers(row) {
        for (var property in row) {
            if (row.hasOwnProperty(property)) {
                row[property] = +row[property];
            }
        }
        return row;
    }
}


