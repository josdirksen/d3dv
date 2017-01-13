function show() {

    'use strict';

    // load the data
    var loadedData;
    d3.csv('./data/businessFiltered.csv',
        function(row) {
            switch (row.yearsInBusiness) {
                case "001" : row.yearsInBusinessLabel = "All"; break;
                case "311" : row.yearsInBusinessLabel = "less then 2 years"; break;
                case "318" : row.yearsInBusinessLabel = "2 to 3 years "; break;
                case "319" : row.yearsInBusinessLabel = "4 to 5 years"; break;
                case "321" : row.yearsInBusinessLabel = "6 to 10 years"; break;
                case "322" : row.yearsInBusinessLabel = "11 to 15 years"; break;
                case "323" : row.yearsInBusinessLabel = "more then 16 years"; break;
            }

            return row;
        },
        function (data) {
            loadedData = data;
            updateCircle();
        });

    // and bind the update function to the change function
    var select = d3.select('select').on('change', update);


    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 45},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");

    // http://bl.ocks.org/cpbotha/5200394
    // filters go in defs element
    var defs = chart.append("defs");

    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 5)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 2)
        .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    // container, which holds the pie
    var pieContainer = chart.append('g').attr("transform", "translate(" + width / 2 + " " + height / 2 + ")")

    // use some standard colors
    var colors = function(i) {
        return d3.interpolateReds(i/6);
    }

    // define the radius of an arc element
    // this returns a function we can use to create arc elements
    var arc = d3.arc()
        .outerRadius(height/2 * 0.6)
        .innerRadius(height/2 * 0.3);

    var popupArc = d3.arc()
        .outerRadius(height/2 * 0.65)
        .innerRadius(height/2 * 0.3);

    var labelsArc = d3.arc()
        .outerRadius(height/2 * 0.7)
        .innerRadius(height/2 * 0.7);

    // add a grey background arc
    pieContainer.append('path')
        .attr("class", 'backgroundArc')
        .attr("d", arc({startAngle: 0, endAngle: 2 * Math.PI}));

    function update() {
        var show = select.property('selectedOptions')[0].value;
        updateCircle(show);
    }

    // update the circle
    function updateCircle(toShow) {
        // keep track of current data after an update, so
        // we can make some nice animations

        // get the data for all the Firms
        var filtered = loadedData.filter(filterData(toShow));
        var totalFirms = filtered.reduce(function (total, el) {return total + +el.count}, 0);

        // based on the data, calculate the individual arc
        // parts. This returns configuration which we can pass
        // into an arc function.
        var pie = d3.pie()
            .sort(null)
            .padAngle(0.04)
            .value(function (d) {
                return +d.count;
            });

        // create the arcs segments
        // the data property of the arcs[i] represents data.
        var arcs = pie(filtered);

        // select the arcs already there, for these we
        // only bind the data, the arc itself is updated
        // after a merge.
        var arcElements = pieContainer.selectAll(".arc").data(arcs);

        // handle the elements
        arcElements.enter()
            .append("path")
                .attr("class", "arc")
                .style("fill", function (d, i) { return colors(i) })
            .merge(arcElements)
            // .style("filter", "url(#drop-shadow)")
            .on("mouseover", function(d) {
                d3.select(this).attr("d", function(d) {
                    return popupArc(d);
                });
                var centerText = pieContainer.selectAll('.center').data([d]);
                centerText.enter()
                    .append('text')
                    .attr("class","center")
                    .style("text-anchor","middle")
                    .merge(centerText)
                        .text( function(d) { return Math.round(+d.data.count / totalFirms * 100) + "%"});
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("d", function(d) {
                    return arc(d);
                });
                // remove the center text
                pieContainer.selectAll('.center').text("");
            })
            .transition()
                .ease(d3.easeCircle)
                .duration(2000)
                .attrTween("d", tweenArcs);


        // add labels at the position of the
        var textElements = pieContainer.selectAll(".labels").data(arcs);
        textElements.enter()
            .append("text")
                .attr("class", "labels")
            .merge(textElements)
                .text( function(d) { return d.data.yearsInBusinessLabel + " (" + d.data.count + ")" })
                .attr("dy", "0.35em" )
                .transition()
                    .ease(d3.easeCircle)
                    .duration(2000)
                    .attrTween("transform", tweenLabels)
                    .styleTween("text-anchor", tweenAnchor);


        // add the lines which point to the labels
        var lineElements = pieContainer.selectAll(".lines").data(arcs);
        lineElements.enter()
            .append("path")
                .attr("class", "lines")
            .merge(lineElements)
                .transition()
                .ease(d3.easeCircle)
                .duration(2000)
                .attrTween("d", tweenLines)
    }

    function tweenLines(d) {
        var interpolator = getArcInterpolator(this, d);
        var lineGen = d3.line();
        return function (t) {
            var dInt = interpolator(t);
            var start = arc.centroid(dInt);
            var xy = labelsArc.centroid(dInt);
            var textXy = [xy[0],xy[1]];
            // Change the final line a little bit to
            // make sure we can tween nicely, and we have
            // a little bit of extra space
            textXy[0]= textXy[0] * 1.15
            return lineGen([start,xy,textXy]);
        }

    }

    function tweenAnchor(d) {
        var interpolator = getArcInterpolator(this, d);
        return function (t) {
            var x = labelsArc.centroid(interpolator(t))[0];
            return (x > 0) ? "start" : "end";
        };
    }

    function tweenLabels(d) {
        var interpolator = getArcInterpolator(this, d);
        return function (t) {
            var p = labelsArc.centroid(interpolator(t));
            var xy = p
            xy[0]= xy[0] * 1.2
            // xy[0] = (xy[0] < 0 ? xy[0] -20 : xy[0] + 20);
            return "translate(" + xy + ")";
        };
    }


    function tweenArcs(d) {
        var interpolator = getArcInterpolator(this, d);
        return function (t) {
            return arc(interpolator(t));
        };
    }

    function getArcInterpolator(el, d) {
        // when we're interpolating, we need to interpolate
        // from the old value to the new one. We can keep track
        // of the old value in a global var, or bind it to the
        // element we're working on
        var oldValue = el._oldValue;
        var interpolator = d3.interpolate({
            startAngle: oldValue ? oldValue.startAngle : 0,
            endAngle: oldValue ? oldValue.endAngle : 0
        }, d);
        // get the start value of the interpolator and bind that.
        // so we can use it for the next interpolator.
        el._oldValue = interpolator(0);

        return interpolator;
    }

    function filterData(toShow) {
        switch (toShow) {
            case "Female":
                return allFemalefilter;
            case "Male":
                return allMalefilter;
            case "All":
                return allFirmsFilter;
            case "AfricanAmerican":
                return africanAmericanFilter;
            case "White":
                return whiteFilter;
            default:
                return allFirmsFilter;
        }
    }

    function allFemalefilter(el) {
        return el.vetGroup === '001' &&
            el.ethnicGroup === '001' &&
            el.raceGroup === '00' &&
            el.sex === '002' &&
            el.yearsInBusiness !== '001';
    }

    function allMalefilter(el) {
        return el.vetGroup === '001' &&
            el.ethnicGroup === '001' &&
            el.raceGroup === '00' &&
            el.sex === '003' &&
            el.yearsInBusiness !== '001';
    }

    function allFirmsFilter(el) {
        return el.vetGroup === '001' &&
            el.ethnicGroup === '001' &&
            el.raceGroup === '00' &&
            el.sex === '001' &&
            el.yearsInBusiness !== '001';
    }

    function whiteFilter(el) {
        return el.vetGroup === '001' &&
            el.ethnicGroup === '001' &&
            el.raceGroup === '30' &&
            el.sex === '001' &&
            el.yearsInBusiness !== '001';
    }

    function africanAmericanFilter(el) {
        return el.vetGroup === '001' &&
            el.ethnicGroup === '001' &&
            el.raceGroup === '40' &&
            el.sex === '001' &&
            el.yearsInBusiness !== '001';
    }
}


