function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 1800 - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the startingpoint
    var startingPoint = {x: 300, y: 200};

    // generate and draw the curve
    var curve = generateCurve(startingPoint);
    var drawnPath = drawPath(curve);

    // draw a circle, which will be moved
    var circle = svg.append("circle");
    circle.attr("r", 7)
        .attr("fill", "steelblue")
        .attr("transform", "translate(" + startingPoint.x + " " + startingPoint.y + ")");

    // kickoff the animation
    move();

    function move() {
        circle.transition()
            .duration(17500)
            .ease(d3.easeLinear)
            .attrTween("transform", animateOnPath(drawnPath.node()))
            .on("end", move);// infinite loop
    }

    function drawPath(curve) {
        return svg.append("path")
            .attr("class","line")
            .attr("d", function(d) {return curve})
            .attr("stroke", "black")
            .attr("fill", "none");
    };

    function animateOnPath(path) {
        var l = path.getTotalLength();
        return function(i) {
            return function(t) {
                var p = path.getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + ")";//Move marker
            }
        }
    }

    function generateCurve(startingPoint) {
        var path = d3.path();
        var center = startingPoint;
        var curve = {w: 300, h: 300}

        path.moveTo(center.x, center.y);
        path.bezierCurveTo(center.x + curve.w, center.y - curve.h, center.x + curve.w, center.y + curve.h, center.x, center.y);
        path.bezierCurveTo(center.x - curve.w, center.y - curve.h, center.x - curve.w, center.y + curve.h, center.x, center.y);
        path.closePath();

        return path.toString();
    }

    function generateCurve2() {
        return "m 517.14287,869.50506 c -1.00225,-13.59928 17.83708,-8.0604 22.60289,-1.66579 12.91505,17.32901 -2.16993,40.00665" +
            " -19.27131,46.87158 -30.59035,12.27973 -62.60032,-10.80568 -71.14026,-40.20841 -12.5327,-43.14969 19.45854,-85.5868" +
            " 61.14551,-95.40895 55.56217,-13.09138 108.72402,28.10436 119.67763,82.08261 13.78399,67.92611 -36.74363,131.93589" +
            " -103.01971,143.9463 -80.26921,14.5463 -155.19027,-45.37855 -168.215,-123.95679 -15.34919,-92.60174 54.01069,-178.47132" +
            " 144.89391,-192.48368 104.92826,-16.17783 201.77014,62.64095 216.75237,165.831 17.02375,117.25109 -71.26994,225.08147" +
            " -186.76811,241.02107 -129.57148,17.8819 -248.40176,-79.898 -265.28974,-207.70522 -18.74885,-141.89021 88.52541,-271.72892" +
            " 228.6423,-289.55842 28.47882,-3.62386 57.50273,-2.69691 85.70377,2.66327 L 691.77257,422.56624 c 4.12213,-24.108 5.931,-48.60947" +
            " 5.37006,-73.06141 C 692.61443,152.11613 527.60598,-15.806595 327.61882,-10.256617 147.48098,-5.2574913 -5.6494653,145.81837" +
            " 0.47638431,328.5529 5.9368843,491.43984 143.09075,629.79066 308.57162,623.07633 454.20762,617.16719 577.79612,493.92098" +
            " 570.47604,345.69538 564.13578,217.31036 454.77706,108.45957 323.80938,116.40997 212.6753,123.15638 118.52562,218.65721" +
            " 127.14298,332.36234 c 7.11512,93.8832 88.80431,173.38975 185.23808,164.0474 76.63217,-7.42401 141.5956,-75.3803 131.42839,-154.5238" +
            " -7.62821,-59.37946 -62.00441,-109.99468 -123.80951,-98.80938 -42.11475,7.62181 -78.84004,48.78849 -66.19037,93.09522 7.07173,24.76945" +
            " 36.42015,49.02194 62.38093,33.57137 9.57984,-5.70145 20.00495,-31.09365 0.95236,-31.66665 z"
    }


}




