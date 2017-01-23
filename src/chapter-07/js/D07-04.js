var margin = {top: 60, right: 0, bottom: 100, left: 40},
    width = 700 - margin.left - margin.right,
    height = 330 - margin.top - margin.bottom;

// configuration for the heatmap
var elementsPerLine = 20,
    gridSize = Math.floor(width / elementsPerLine),
    legendElementWidth = gridSize * 2,
    buckets = 10,
    secondsPerElement = 30;

// write out the heatmap
var addDiagram = function (tsvFile, title) {

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    // will contain the heatmap
    var chartGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // contains the title
    var textGroup = svg.append("g");

    d3.csv(tsvFile,
        function (d) {
            var minute = +d.minute;
            var column = minute % elementsPerLine;
            return {
                column: column,
                value: +d.count,
                row: Math.floor(minute / elementsPerLine)
            };
        },
        function (error, data) {

            // set the total height of the svg based on the number of rows
            var totalHeight = (Math.ceil(data.length / elementsPerLine)) * (gridSize) + margin.top + margin.bottom;
            svg.attr('height', totalHeight);

            // calculate the maximum value, and create a colorscale
            var maxValue = d3.max(data, function(d) {return d.value});

            // create a set of buckets for the colors
            var colorScale = d3.scaleQuantize()
                .range(d3.range(0, buckets ).map(function(i) {
                    return d3.interpolateSpectral((i+1)/buckets);
                }))
                .domain([0, maxValue]);

            // draw all the individual rectangles
            chartGroup.selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("x", function (d) { return (d.column) * gridSize; })
                .attr("y", function (d) { return (d.row - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "column bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", function(d) {return(colorScale(d.value))});

            chartGroup.selectAll("text")
                .data(d3.range(0, Math.ceil(data.length / elementsPerLine)))
                .enter().append("text")
                .text(function(d, i) {return Math.round(i * elementsPerLine * secondsPerElement / 60) + "m."})
                .attr("class", "mono")
                .attr("text-anchor", "end")
                .attr("y", function(d, i) {return i * gridSize})
                .attr("dx", -5)
                .attr("dy", -5)


            // quantile returns the threshold values
            var legendPos = ((Math.floor(data.length / elementsPerLine) + 1) * (gridSize));

            var legend = chartGroup.selectAll(".legend")
                .data(d3.range(0, buckets))

            var newLegends = legend.enter().append("g")
                .attr("class", "legend")

            // append a rectangle for each element
            newLegends.append("rect")
                .attr("x", function (d, i) { return legendElementWidth * i; })
                .attr("y", legendPos)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function (d, i) { return colorScale.range()[i]; })

            // add text to the legend
            newLegends.append("text")
                .attr("class", "mono")
                .text(function (d, i) { return "≥ " + Math.round(maxValue / (buckets) * i); })
                .attr("x", function (d, i) { return legendElementWidth * i; })
                .attr("y", legendPos + gridSize);

            // finally write the text at the top of the chart
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", 20)
                .attr("class", "title")
                .text(title);

        });
};

function show() {
    // addDiagram("data/TheBigLebowski.csv", "The Big Lebowski");
    // addDiagram("data/Straight.Outta.Compton.csv", "Straight Outta Compton");
    addDiagram("data/swearnet.csv", "Swearnet");
}
