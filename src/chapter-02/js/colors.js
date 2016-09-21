function show() {

    'use strict';

    var width = 600;
    var height = 40;


    d3.select("body").append("h2").text("Standard color interpolators");

    addColorScale(d3.interpolateViridis, "d3.interpolateViridis");
    addColorScale(d3.interpolateInferno, "d3.interpolateInferno");
    addColorScale(d3.interpolateMagma, "d3.interpolateMagma");
    addColorScale(d3.interpolatePlasma, "d3.interpolatePlasma");
    addColorScale(d3.interpolateWarm, "d3.interpolateWarm");
    addColorScale(d3.interpolateCool, "d3.interpolateCool");
    addColorScale(d3.interpolateRainbow, "d3.interpolateRainbow");
    addColorScale(d3.interpolateCubehelixDefault, "d3.interpolateCubehelixDefault");

    d3.select("body").append("h2").text("d3-scale-chromatic interpolators");

    d3.select("body").append("h3").text("Diverging");

    addColorScale(d3.interpolateBrBG, "d3.interpolateBrBG");
    addColorScale(d3.interpolatePRGn, "d3.interpolatePRGn");
    addColorScale(d3.interpolatePiYG, "d3.interpolatePiYG");
    addColorScale(d3.interpolatePuOr, "d3.interpolatePuOr");
    addColorScale(d3.interpolateRdBu, "d3.interpolateRdBu");
    addColorScale(d3.interpolateRdGy, "d3.interpolateRdGy");
    addColorScale(d3.interpolateRdYlBu, "d3.interpolateRdYlBu");
    addColorScale(d3.interpolateRdYlGn, "d3.interpolateRdYlGn");
    addColorScale(d3.interpolateSpectral, "d3.interpolateSpectral");

    d3.select("body").append("h3").text("Sequential (Single Hue)");

    addColorScale(d3.interpolateBlues, "d3.interpolateBlues");
    addColorScale(d3.interpolateGreens, "d3.interpolateGreens");
    addColorScale(d3.interpolateGreys, "d3.interpolateGreys");
    addColorScale(d3.interpolateOranges, "d3.interpolateOranges");
    addColorScale(d3.interpolatePurples, "d3.interpolatePurples");
    addColorScale(d3.interpolateReds, "d3.interpolateReds");


    d3.select("body").append("h3").text("Sequential (Multi Hue)");

    addColorScale(d3.interpolateBuGn, "d3.interpolateBuGn");
    addColorScale(d3.interpolateBuPu, "d3.interpolateBuPu");
    addColorScale(d3.interpolateGnBu, "d3.interpolateGnBu");
    addColorScale(d3.interpolateOrRd, "d3.interpolateOrRd");
    addColorScale(d3.interpolatePuBuGn, "d3.interpolatePuBuGn");
    addColorScale(d3.interpolatePuBu, "d3.interpolatePuBu");
    addColorScale(d3.interpolatePuRd, "d3.interpolatePuRd");
    addColorScale(d3.interpolateRdPu, "d3.interpolateRdPu");
    addColorScale(d3.interpolateYlGnBu, "d3.interpolateYlGnBu");
    addColorScale(d3.interpolateYlGn, "d3.interpolateYlGn");
    addColorScale(d3.interpolateYlOrBr, "d3.interpolateYlOrBr");
    addColorScale(d3.interpolateYlOrRd, "d3.interpolateYlOrRd");

    d3.select("body").append("h3").text("Categorical");

    addColorScheme(d3.schemeAccent, "d3.schemeAccent");
    addColorScheme(d3.schemeDark2, "d3.schemeDark2");
    addColorScheme(d3.schemePaired, "d3.schemePaired");
    addColorScheme(d3.schemePastel1, "d3.schemePastel1");
    addColorScheme(d3.schemePastel2, "d3.schemePastel2");
    addColorScheme(d3.schemeSet1, "d3.schemeSet1");
    addColorScheme(d3.schemeSet2, "d3.schemeSet2");
    addColorScheme(d3.schemeSet3, "d3.schemeSet3");

    function addColorScale(interpolator, title) {
        var scale = d3.scaleSequential(interpolator).domain([0, width]);

        d3.select("body").append("p").text(title);
        var canvas = d3.select("body").append("canvas").attr("width", width).attr("height", height).node();

        var context = canvas.getContext('2d');
        for (var i = 0 ; i < width ; i++) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.lineWidth = 1;
            context.strokeStyle = scale(i);
            context.stroke();
        }
    }

    function addColorScheme(scheme, title) {
        var scale = d3.scaleQuantize().domain([0, width]).range(scheme);

        d3.select("body").append("p").text(title);
        var canvas = d3.select("body").append("canvas").attr("width", width).attr("height", height).node();

        var context = canvas.getContext('2d');
        for (var i = 0 ; i < width ; i++) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.lineWidth = 1;
            context.strokeStyle = scale(i);
            context.stroke();
        }
    }
}


