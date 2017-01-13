
function show() {
    'use strict';

    // setup the dimensions we'll be working with
    var margin = { top: 30, bottom: 20, right: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Create the main <g> element to which we add stuff
    var chart = d3.select('.chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ','
                                        + margin.top + ')');


    // chart configuration
    var namesToShow = 10;
    // we could also use the d3.scaleBand() for this
    var barWidth = 20;
    var barMargin = 5;

    // First we're going to load the data
    d3.csv('data/yob2015.txt', function (d) { return { name: d.name, sex: d.sex, amount: +d.amount }; }, function (data) {
        // at this point we've got a big array containing all the male
        // and female names. Since we don't need all of the names
        // lets say we're only interested in the top 10 names.

        // group the data and get the top 10 females, and the top males
        // we also, at the same moment, convert the amount to a number
        var grouped = _.groupBy(data, 'sex');
        var top10F = grouped['F'].slice(0, namesToShow);
        var top10M = grouped['M'].slice(0, namesToShow);

        var both = top10F.concat(top10M.reverse());

        // We create new groups to make it easier to add additional
        // stuff, besides just the rectangles. So we create groups.
        // Since we won't be adding or removing elements, we
        // only write the enter function. Where we position the
        // <g>
        var bars = chart.selectAll("g").data(both)
            .enter()
            .append('g')
            .attr('transform', function (d, i) {
                var yPos = ((barWidth + barMargin) * i);
                return 'translate( 0 ' + yPos +  ')';
            });

        // setup a scale that handles the width of the bars
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(both, function (d) { return d.amount; })])
            .range([0, width]);

        // now add a rectangle to each group and set width relative to
        // the # the name is given
        bars.append('rect')
            .attr("height", barWidth)
            .attr("width", function (d) { return yScale(d.amount); })
            .attr("class", function (d) { return d.sex === 'F' ? 'female' : 'male'; });

        // lets also add a name so that we now which name is popular
        bars.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return yScale(d.amount) - 5 ; })
            .attr("y", barWidth / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        // without a legend it is difficult to see what the scores mean
        // so lets add that as well. We create an axis definition
        var bottomAxis = d3.axisBottom().scale(yScale).ticks(20, "s");
        var topAxis = d3.axisTop().scale(yScale).ticks(20, "s");

        // and add them to the chart
        chart.append("g")
            .attr('transform', 'translate( 0 ' + both.length * (barWidth + barMargin) +  ')')
            .call(bottomAxis);

        chart.append("g")
            .attr('transform', 'translate( 0 ' + -barMargin + ' )')
            .call(topAxis);
    });

}

