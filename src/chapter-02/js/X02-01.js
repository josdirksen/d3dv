
function show() {
    'use strict';

    var margin = { top: 20, bottom: 20, right: 20, left: 45 },
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
                                        + margin.top + ")");


    var numberOfSteps = 100;
    var data = _.range(1, numberOfSteps);

    // Assign the data to the rectangles (should there be any)
    var points = chart.selectAll("circle").data(data);

    var xScale = d3.scaleLinear()
        .domain([0, numberOfSteps - 1])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, numberOfSteps - 1])
        .range([height, 0]);

    var yPowScale = d3.scaleLog()
        .base(2)
        .domain([1, numberOfSteps - 1])
        .range([height, 0]);

    console.log(yPowScale(0.1));

    points.enter()
        .append("circle")
        .attr("class", "enter")
        .attr("cx", xScale)
        .attr("cy", yPowScale)
        .attr("fill", 'red')
        .attr("r", 2);

    var bottomAxis = d3.axisBottom().scale(xScale).ticks(10, "s");
    var leftAxis = d3.axisLeft().scale(yPowScale).ticks(5, "g");

    // and add them to the chart
    chart.append("g")
        .attr('transform', 'translate( 0 ' + height +  ')')
        .call(bottomAxis);

    chart.append("g")
        .call(leftAxis);

}


