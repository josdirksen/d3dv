function show() {

    var formatDate = d3.timeFormat("%b %Y");

    d3.csv("data/sample.csv", function(data) {
        var output = d3.select("#output");

        // we check for the existence of an svg element


        var width = 400;
        var barHeight = 20;

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function(el) { return +el.price})])
            .range([0, width]);

        var svg = output.selectAll("svg")
            .data([data]);

        // if it doesn't exist we add an svg
        // this works since we pass in an the data as [data]
        var g = svg.enter()
            .append("svg")
            .attr("width", width)
            .attr("height", barHeight * data.length)

        // now add groups for all the elements
        var bars = g.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

        // for each element in the selection append a rectangle
        bars.append("rect")
            .attr("width", function(d) { return x(+d.price)})
            .attr("height", barHeight - 1);

        // and for each element we add a label
        bars.append("text")
            .attr("x", function(d) { return x(+d.price) - 3; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d.date; });
    });
}

