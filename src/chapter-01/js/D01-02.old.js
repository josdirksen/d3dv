function show() {

    var margin = {top: 20, right: 30, bottom: 130, left: 40},
        width = 1860 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var formatDate = d3.timeFormat("%b %Y");

    d3.csv("data/sample.csv", function(data) {
        // we check for the existence of an svg element

        console.log(width)

        var x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(function(d) { return d.date}));

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(el) { return +el.price})])
            .range([height, 0])

        // now add groups for all the elements
        var bars = chart.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(" + x(d.date) + ",0)"; });

        // for each element in the selection append a rectangle
        bars.append("rect")
            .attr("y", function(d) { return y(+d.price)})
            .attr("height", function(d) { return height - y(+d.price)})
            .attr("width", x.bandwidth() - 1);

        // and for each element we add a label
        var bottomAxix = d3.axisBottom().scale(x);
        console.log(bottomAxix)

        var axisX = chart.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(bottomAxix);


        var sub = axisX.selectAll(".tick text");
        sub.attr("dominant-baseline","center")
        sub.attr("transform", "translate(19,25)rotate(70)")
        console.log(sub);

        var leftAxis = d3.axisLeft().scale(y).ticks(20, "s");
        var axisY = chart.append("g").attr("class", "y-axis").call(leftAxis);

        axisY.selectAll(".tick text")
            .attr("transform", "translate(-10,0)");




    });
}

