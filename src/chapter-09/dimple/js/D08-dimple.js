function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // create the standard chart
    var svg1 = addContainer();
    var data = [
        { "country":"The Netherlands", "value":5000 },
        { "country":"Germany", "value":3000 },
        { "country":"Spain", "value":4000 },
        { "country":"Belgium", "value":2000 },
        { "country":"France", "value":4500 }
    ];
    var chart = new dimple.chart(svg1, data);
    chart.setBounds(80, 0, width, height);
    chart.addCategoryAxis("y", "country");
    chart.addMeasureAxis("x", "value");
    chart.addSeries(null, dimple.plot.bar);
    chart.draw();

    // create a stacked chart
    var svg2 = addContainer();
    var stackedData = [
        { "i" : 1, "country":"Netherlands", "value":2000, "Depth": 100 },
        { "i" : 1, "country":"Belgium", "value":3000, "Depth": 200 },
        { "i" : 1, "country":"Germany", "value":3000, "Depth": 200 },
        { "i" : 2, "country":"Netherlands", "value":1000, "Depth": 300 },
        { "i" : 2, "country":"Belgium", "value":3000, "Depth": 200 },
        { "i" : 2, "country":"Germany", "value":2500, "Depth": 100 },
        { "i" : 3, "country":"Netherlands", "value":1000, "Depth": 100 },
        { "i" : 3, "country":"Belgium", "value":4000, "Depth": 400 },
        { "i" : 3, "country":"Germany", "value":4000, "Depth": 400 },
        { "i" : 4, "country":"Netherlands", "value":2000, "Depth": 200 },
        { "i" : 4, "country":"Belgium", "value":1000, "Depth": 700 },
        { "i" : 4, "country":"Germany", "value":5000, "Depth": 700 },
    ];
    var stackedChart = new dimple.chart(svg2, stackedData);
    stackedChart.setBounds(0, 50, width, height-50);
    stackedChart.addCategoryAxis("x", "i");
    stackedChart.addMeasureAxis("y", "value");
    // stackedChart.addSeries("country", dimple.plot.bar);
    stackedChart.addMeasureAxis("z", "Depth");
    stackedChart.addSeries("country", dimple.plot.bubble);

    stackedChart.addLegend(60, 10, width - 30, 20, "right");
    stackedChart.draw();

    function addContainer() {
        return d3.select("body").append("svg") .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    }
}


