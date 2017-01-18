function show() {

    'use strict';
    // Generic setup
    var margin = {top: 20, bottom: 50, right: 10, left: 10},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;

    // create the standard chart
    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var circleSize=3;

    svg.append("defs").append("clipPath")
        .attr("id","clip")
        .append("circle").attr("r", 15);

    var mapGroup = svg.append("g");


    // setup the projection, and the path generator
    // var projection = d3.geoNaturalEarth();
    var projection = d3.geoGringortenQuincuncial()
    var path = d3.geoPath().projection(projection);

    // load the data
    d3.json("data/world-110m.v1.json", function(loadedTopo) {
        var countries  = topojson.feature(loadedTopo, loadedTopo.objects.countries).features;
        var f = {type: "Sphere"};
        projection.fitSize([width, height], f)
        mapGroup.selectAll('.country').data(countries).enter()
            .append("path")
            .classed('country', true)
            .attr("d", path);

        mapGroup.append("text")
            .attr("x", (width/2))
            .attr("y", (height-50));
    });


    var connection = new WebSocket('ws://stream.meetup.com/2/rsvps');
    connection.onmessage = function (received) {
        var frame = JSON.parse(received.data);
        // check if we've got venue coordinates, if not get the group coordinates
        if (frame.venue && frame.venue.lon) {
            showSubscription(frame.venue.lat, frame.venue.lon, frame.response, frame.member.photo, frame.group.group_name)
        } else if (frame.group && frame.group.group_lon) {
            showSubscription(frame.group.group_lat, frame.group.group_lon, frame.response, frame.member.photo, frame.group.group_name)
        } else {
            // ignore this frame, since we can't show it
        }
    };

    function showSubscription(lat, lon, rsvp, image, name) {

        // add a simple circle, at the position of the meetup
        var position = projection([lon, lat]);
        mapGroup.append("g")
            .append("circle")
            .attr("cx",position[0])
            .attr("cy",position[1])
            .attr("class", "rsvp-" + rsvp)
            .transition().duration(1500).attr("r",circleSize*3)
            .transition().duration(1000).attr("r",circleSize)
            .transition().duration(1500).delay(60000)
                .attr("r",0)
                .on("end", function() {
                    d3.select(this).remove()
                })


        mapGroup.select("text")
            .text(name.length < 35 ? name : name.substring(0, 30) + "..." )
            .attr("text-anchor", "middle")

        if (image) {
            var imageContainer = mapGroup.append("g")
                .attr("transform", "translate(" + position[0]  + " " + position[1] +") scale(0)")

            imageContainer.append("image")
                .attr('class','memberImage')
                .attr("x", -15)
                .attr("y", -15)
                .attr('width', 30)
                .attr('xlink:href', image)
                .attr("clip-path", "url(#clip)")

            imageContainer.append("circle")
                .attr("class", "image-" + rsvp)
                .attr("r", 15);

            imageContainer.transition().duration(1500).attr("opacity",1)
                .attr("transform", "translate(" + position[0]  + " " + position[1] +") scale(1)")
                .transition().duration(1500)
                .attr("opacity",0)
                .attr("transform", "translate(" + position[0]  + " " + position[1] +") scale(0)")
                .on("end", function() {
                    d3.select(this).remove()
                })
        }
    }
}


