function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1200 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set up some control points
    var duration = 5000
    var now = new Date(Date.now() - duration);
    var nPoints = 200;

    // setup the scales. The domain is the x-axis, containing 400 points
    // the y axis is based on the min and max values of the data
    // var x = d3.scaleLinear().domain([0, n - 1]).range([0, width]);
    var x = d3.scaleLinear().domain([0, nPoints - 2]).range([0, width]);
    var y = d3.scaleLinear().domain([0, 500]).range([height, 0]);

    // scale to use for rendering the time axis
    var xTime = d3.scaleTime()
        .domain([now - ((nPoints - 2) * duration), now - duration])
        .range([0, width]);

    // we need a clippath to hide the elements coming into view.
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", xTime(now - duration*2))
        .attr("height", height + margin.bottom + margin.top);

    svg.append("text")
        .attr("class", "xText")
        .attr("transform", "translate(0 20)")
        .attr("stroke", "steelblue").text("X-Movement: ")

    svg.append("text")
        .attr("class", "yText")
        .attr("transform", "translate(0 40)")
        .attr("stroke", "red").text("Y-Movement: ")

    // we use a line generator, based on the index and the data
    var lineMx = d3.line()
        .curve(d3.curveBasis)
        // .curve(d3.curveBasis)
        .x(function(d, i) { return x(i) })
        .y(function(d) { return y(d.x); });

    var lineMy = d3.line()
        .curve(d3.curveBasis)
        // .curve(d3.curveBasis)
        .x(function(d, i) { return x(i) })
        .y(function(d) { return y(d.y); });

    // we keep track of the total movement, and whenever we draw
    // add a new point we get the current value, and reset the old
    // ones.
    var previousEvent;
    var totalX = 0;
    var totalY = 0;
    d3.select("body").on("mousemove", function() {
        if (previousEvent) {
            totalX += Math.abs(previousEvent.x - d3.event.screenX)
            totalY += Math.abs(previousEvent.y - d3.event.screenY)

            d3.select(".xText").transition().text("X-Movement:" + totalX)
            d3.select(".yText").transition().text("Y-Movement:" + totalY)
        }
        previousEvent = { x: d3.event.screenX, y: d3.event.screenY };
    });

    var data = d3.range(0, nPoints-1).map(function() {return  {x:0, y:0}});
    var axis = d3.axisBottom(xTime)

    svg.attr("clip-path", "url(#clip)")

    var group = svg.append("g").attr("class", "group")

    group.append("path").datum(data).attr("class", "lineX line")
    group.append("path").datum(data).attr("class", "lineY line")
    var a = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0 " + (height) + ")")
        .call(axis)

    group.transition().on("start", renderX).ease(d3.easeLinear).duration(duration)
    // kick of the animation
    // renderX()

    function renderX() {

        d3.select(".xText").text("X-Movement:" + 0)
        d3.select(".yText").text("Y-Movement:" + 0)

        data.push({x: totalX, y: totalY})
        totalX = 0; totalY = 0;

        d3.select(this).attr("transform", "")

        // redraw the lines and the axis
        d3.select(".lineX").attr("d", lineMy)
        d3.select(".lineY").attr("d", lineMx)

        var now = new Date(Date.now() - duration);
        xTime.domain([now - (nPoints - 2) * duration, now]);

        a.transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .call(axis);

        d3.active(this).transition().on("start", renderX)
            .attr("transform", "translate(" +  x(-1) + ",0)")

        data.shift();
    }
}


