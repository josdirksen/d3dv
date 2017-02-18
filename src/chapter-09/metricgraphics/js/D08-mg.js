function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // create the standard chart
    addContainer("id-1")


    d3.json("./data/annual.json", function (data) {

        MG.data_graphic({
            title: "Annual temperature mean",
            description: "Annual temperature mean",
            data: data.filter(function(el) {return el.Source === "GCAG"}),
            width: width,
            height: height,
            target: "#id-1",
            x_accessor: "Year",
            y_accessor: "Mean",
            min_y: -1,
            area: false,
            chart_type: 'line',
            baselines: [{value:0, label: 'mean'}],
            interpolate: d3.curveLinear,
        })
    });


    function addContainer(id) {
        return d3.select("body").append("svg").attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("id", id)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    }
}


