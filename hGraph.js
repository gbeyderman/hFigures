/**
 * Created by andres on 4/23/15.
 */


/**
 *
 * @param measurement
 * @param angle
 * @param r0
 * @param r1
 * @param r
 * @constructor
 */
function HealthMeasurement(measurement, angle, r0, r1, r){

    this.label = measurement.label;
    this.r = r; // this is the radius of the svg circle element
    this.units = measurement.units;
    this.angle = angle;
    // recommended minimum and maximum (mandatory)
    this.min = measurement.min;
    this.max = measurement.max;

    // the array of samples
    this.samples = measurement.samples;

    // the selected sample
    // this.sample = this.samples.length - 1;
    this.sample = 0;

    // the hGraph minimum and maximum radii
    this.r0 = r0; // inner radius
    this.r1 = r1; // outer radius

    // by default we have no additional ranges
    this.additionalRanges = false;

    // compute the scale
    this.scale = d3.scale.linear()
        .domain([measurement.min, measurement.max])
        .range([r0, r1]);


    // initially the radius of the circle, as well as the x and y points are set to zero
    this.x = this.y = this.radius = 0;

    // the color by default is white
    this.color = "white";

    // check for yellow and red ranges
    var ranges = HealthMeasurement.additionalRanges; // shorthand

    // add additional ranges when needed
    for(var i = 0; i < ranges.length; i++){
        if (typeof measurement[ranges[i]] != 'undefined'){
            this.additionalRanges = true;
            this[ranges[i]] = measurement[ranges[i]];
        }
    }

    // compute the position and color
    // that is the radius, x and y values
    this.calculatePosition();
}
/**
 * Computes the position and sets the x, y and radius based on the selected sample.
 */
HealthMeasurement.prototype.calculatePosition = function () {
    var sample; // the selected sample
    var value; // the value of the selected sample

    sample = this.samples[this.sample];
    value = sample.value;

    this.radius = this.scale(value);
    this.x = Math.cos(this.angle) * this.radius;
    this.y = Math.sin(this.angle) * this.radius * -1;

    this.color = this.additionalRanges ? "#73D651": "white";

    if(this["yellow_max"] && value >= this.max){
        this.color = "gold";
    }
    if(this["red_max"] && value >= this["red_max"]){
        this.color = "tomato";
    }

    if(this["yellow_min"] && value <= this.min){
        this.color = "gold";
    }
    if(this["red_min"] && value <= this["red_min"]){
        this.color = "tomato";
    }

};

/**
 * The types of ranges
 * @type {string[]}
 */
HealthMeasurement.additionalRanges = ["yellow_min", "yellow_max", "red_min", "red_max"];


/**
 *
 * @param groupedMeasurements
 * @param w
 * @param h
 * @param className
 * @constructor
 */
function HealthGraph(groupedMeasurements, w, h, className){

    /**
     *
     * @param label
     * @param text
     * @param fontSize
     * @param angle
     * @param r0
     * @param r1
     * @param r
     * @param lineColor
     * @param lineWidth
     * @param className
     * @constructor
     */
    function LabelText(label, text, fontSize, angle, r0, r1, r, lineColor, lineWidth, className){
        this.label = label;
        this.text = text;
        this.fontSize = fontSize;
        this.angle = angle;
        this.r0 = r0;
        this.r1 = r1;
        this.r = r;
        this.frameBox = null;
        this.className = "";
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
        this.className = className;
    }



    /**
     *
     * @param measurements
     * @param startAngle
     * @param padAngle
     * @param endAngle
     * @param innerRadius
     * @param outerRadius
     * @param measurementCircleRadius
     * @returns {Array}
     */
    function buildMeasurements(measurements, startAngle, padAngle, endAngle, innerRadius, outerRadius, measurementCircleRadius) {
        var angleDelta = getAngleDelta(startAngle, padAngle, endAngle, measurements.length);
        var angle, dataM;
        var hGraphMs = [];
        var hGraphM = null;
        for(var i = 0; i < measurements.length; i ++){
            dataM = measurements[i];
            angle = startAngle + (i * angleDelta) + (angleDelta / 2);
            // move the result so it goes clockwise
            angle = Math.PI / 2 - angle;
            hGraphM = new HealthMeasurement(dataM, angle, innerRadius, outerRadius, measurementCircleRadius);
            hGraphMs.push(hGraphM);
        }
        // return the points in the whole section as an array
        return hGraphMs;
    }


    /**
     *
     * @param startAngle
     * @param endAngle
     * @param padAngle
     * @returns {number}
     */
    function getAngleCenter(startAngle, endAngle, padAngle){
        var start = startAngle + padAngle/2;
        var end = endAngle - padAngle/2;
        var space = end - start;
        var result = startAngle + (space / 2);
        // move the result so it goes clockwise
        return Math.PI / 2 - result;
    }

    /*
     function angle(startAngle, endAngle) {
     var centroidAngle = (startAngle + endAngle)/2;
     // Math.PI (rad) = 180 (deg)
     // centroidAngle (rad) = x (deg)
     // return a > 90 ? a - 180 : a;
     return (centroidAngle * 180) / Math.PI;
     }
     */

    /**
     *
     * @param startAngle
     * @param padAngle
     * @param endAngle
     * @param n
     * @returns {number}
     */
    function getAngleDelta(startAngle, padAngle, endAngle, n) {
        var start = startAngle;
        var end = endAngle;

        var space = end - start;
        return space / n ;
    }


    // each circle has
    // name of the measurement
    // angle
    // optimal range
    // yellow ?
    // red ?
    // array of samples
    // selected sample
    // given a timestamp
    // each circle computes: radius, x, y, color
    // functions: first, last, next, previous, goto(timestamp)


    // Here we begin to build the hGraph instance
    // all the functions used are inside this scope.

    // TODO: adjust depending on the number of measurements along with the zoom and font size

    // Other options
    var outerRadius = w * 0.4; // check a scale function from d3
    var innerRadius = w * 0.3;
    var labelRadius = w * 0.45;

    var groupLabelFontSize = 12;
    var measurementLabelFontSize = 8;
    var measurementCircleRadius = 4;

    var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var inGroup = []; // how many measurements in each group
    for(var i = 0; i < groupedMeasurements.length; i ++)
        inGroup.push(groupedMeasurements[i].measurements.length);

    var pie = d3.layout.pie()
        .value(function (d) { return d; })
        .sort(null); // no ordering to preserve the order from the data source

    pie.padAngle(Math.PI / 256); // TODO: adjust as well depending on the number of measurements

    this.svg = d3.select("body")
        .append("div")
        .attr("class", className)
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var pieObjects = pie(inGroup); // build the pie chart using the number of measurements in each group
    var hGraphWrapper = this.svg.append("g") // needed for custom pan zoom library
        .attr("class", "hGraph-wrapper");
    var hGraphD3Group = hGraphWrapper.append("g").attr("class", "hGraph");
    var arcsG = hGraphD3Group.append("g").attr("class", "arcs");
    var arcs = arcsG.selectAll("g.arc")
        .data(pieObjects)
        .enter()
        .append("g")
        .attr("class", "arc");
    var labelData = [];
    var hGraphMs = []; // hGraph measurements
    var pieAngleData = []; // an array to save the start, pad and end angles of each section

    arcs.append("path")
        .attr({
            "fill": "#74c476",
            //"stroke": "#74c476",
            "stroke": "none",
            "opacity": 0.3,
            "d": arc
        })
        .each(function (d) {
            pieAngleData.push({
                startAngle: d.startAngle,
                padAngle: d.padAngle,
                endAngle: d.endAngle
            })
        });

    /**
     * Creating the view models
     */
    var groupHealthMeasurementLabel;
    for(var i = 0; i < groupedMeasurements.length; i ++){
        var group = groupedMeasurements[i];
        var ms = group.measurements;
        var pieData = pieAngleData[i];
        var angleCenter = getAngleCenter(pieData.startAngle, pieData.endAngle, pieData.padAngle);

        /**
         * Labels for the groups of measurements
         * @type {{label: *, text: *, fontSize: number, angle: number, r0: number, r1: number, r: number, lineColor: string, lineWidth: number, className: string}}
         */
        groupHealthMeasurementLabel = {
            "label": group.label,
            "text": group.label,
            "fontSize": groupLabelFontSize,
            "angle": angleCenter,
            "r0": outerRadius,
            "r1": labelRadius,
            "r": 0,
            "lineColor": "#74c476",
            "lineWidth": 3,
            "className": "groupLabel"
        };

        // push it to the array of health measurement labels
        labelData.push(groupHealthMeasurementLabel);

        /**
         * Health measurements
         * @type {Array.<T>}
         */
        hGraphMs = hGraphMs.concat(
            buildMeasurements(
                ms, pieData.startAngle, pieData.padAngle, pieData.endAngle, innerRadius, outerRadius, measurementCircleRadius
            )
        );
    }


    // assign the values of the instance
    this.hGraphWrapper = hGraphWrapper;
    this.measurements = hGraphMs;
    // now the labels
    var healthMeasurementLabel;

    for(var i = 0; i < hGraphMs.length; i ++){
        var m = hGraphMs[i],
            text = m.label + ": " + m.samples[m.sample].value + " " + m.units,
            r1 = Math.max(m.radius + 20, labelRadius);

        healthMeasurementLabel = {
            "label": m.label,
            "text": text,
            "fontSize": measurementLabelFontSize,
            "angle": m.angle,
            "r0": m.radius,
            "r1": r1,
            "r": measurementCircleRadius,
            "lineColor": "#5b5b5b",
            "lineWidth": 1,
            "className": "measurementLabel"
        };

        // push it to the array of health measurement labels
        labelData.push(healthMeasurementLabel);
    }
    // an svg group containing all the labels
    this.labelGroupContainer = hGraphD3Group.append("g").attr("class", "labels");
    // append a group for each label containing the label, the frame and the line to the circle
    // call the function that build all the labels and adjusts for any collision
    this.labelData = labelData;
    var self = this;
    this.mouseHighlight(self.plotLabels(labelData));
    this.labelRadius = labelRadius;

    hGraphD3Group.append("g").attr("class", "graphs"); // a group to hold all the graphs
    // render the polygon and the circles
    this.graphs = this.hGraphWrapper.select("g.hGraph").select("g.graphs");

    var graph = this.renderPolygonAndCircles(hGraphMs);

    this.graphs.node().appendChild(graph.node());
    var hCircles = graph.selectAll("circle");
    this.mouseHighlight(hCircles);

    // flip the y axis
    // var scale = "scale(1, -1)";
    // rotate
    // var rotate = "rotate(90)";
    // all the transformations
    // var transformations = [scale, rotate];
    // apply
    // arcs.attr("transform", transformations.join(" "));
    // pointsGroup.attr("transform", scale + " " + rotate);
    // polygon.attr("transform", scale + " " + rotate);
    // move the hGraph
    var translate = "translate(" + (w * 0.5) + ", " + (h * 0.5) + ")";
    hGraphD3Group.attr("transform", translate);

}

/**
 *
 * @param labelData
 * @returns {D3._Selection<U>}
 */
HealthGraph.prototype.plotLabels = function(labelData){

    /**
     *
     * @param labels {D3._Selection}
     */
    function collisionFix(labels){

        /**
         *
         * @param margin
         * @param border
         * @constructor
         */
        function LabelFixer(margin, border){
            this.margin = margin;
            this.border = border;
        }

        /**
         * Adjusts the y coordinate to avoid overlapping for a set of measurements in a quadrant.
         * @param i
         * @param angle
         * @param y
         * @param height
         * @param yOffset
         * @returns {number|*}
         */
        LabelFixer.prototype.adjustLabel = function (i, angle, y, height, yOffset){
            var delta = i === 0 ? this.margin: 0,
                upper = Math.sin(angle) >= 0;

            var collision = upper ?
            y + height + this.margin >= this.border :
            y <= this.border;

            if(collision && i > 0)
                delta = upper ?
                this.border - y - height - this.margin : // negative to move it up
                this.border - y; // positive to move it down

            yOffset += delta;

            this.border = upper ?
            y + delta :
            y + height + this.margin + delta; // add the height and the margin plus possible delta

            return yOffset;
        };


        /**
         *
         * @param a
         * @param b
         * @returns {number}
         */
        function ascending(a, b){
            return a.angle - b.angle;
        }

        /**
         *
         * @param a
         * @param b
         * @returns {number}
         */
        function descending(a, b){
            return b.angle - a.angle;
        }

        /**
         *
         * @param x
         * @param min
         * @param max
         * @returns {boolean}
         */
        function between(x, min, max) {
            return x >= min && x <= max;
        }

        /**
         * Uses the angle to give the selection a class for later filtering.
         * @param angle
         * @returns {*}
         */
        function getQuadrant(angle){
            if(between(angle, 0, Math.PI/2))
                return "q1";
            if(between(angle, Math.PI/2, Math.PI))
                return "q4";
            if(between(angle, Math.PI, 3/2*Math.PI))
                return "q3";
            return "q4";
        }

        var angle = 0;
        var lf = new LabelFixer(5, 0); // fix label overlapping

        var groupRoot = d3.select(".labels");

        labels.attr("class", function(d){
            // since we shift the angles as a clock
            // 12 o'clock we begin
            // from there it is clockwise
            // so 1st quadrant begins from 12 o'clock
            // then quadrant 4rd, 3rd and we end in the 2nd.
            angle = Math.PI / 2 - d.angle;
            return getQuadrant(angle);
        });

        // collisions
        groupRoot.selectAll("g.q1")
            .sort(ascending)
            .each(function (d, i) {
                d.offset.y = lf.adjustLabel(i, d.angle, d.frameBox.y, d.frameBox.height, d.offset.y);
            });
        lf.border = 0;

        groupRoot.selectAll("g.q3")
            .sort(ascending)
            .each(function (d, i) {
                d.offset.y = lf.adjustLabel(i, d.angle, d.frameBox.y, d.frameBox.height, d.offset.y);
            });
        lf.border = 0;

        groupRoot.selectAll("g.q2")
            .sort(descending)
            .each(function (d, i) {
                d.offset.y = lf.adjustLabel(i, d.angle, d.frameBox.y, d.frameBox.height, d.offset.y);
            });
        lf.border = 0;

        groupRoot.selectAll("g.q4")
            .sort(descending)
            .each(function (d, i) {
                d.offset.y = lf.adjustLabel(i, d.angle, d.frameBox.y, d.frameBox.height, d.offset.y);
            });
        lf.border = 0;

        // restore the class of the selection
        labels.attr("class", function(d){ return d.className; }); // reset the style
    }

    /**
     *
     * @param box
     * @param angle
     * @returns {{x: number, y: number}}
     */
    function labelCentroid(box, angle){
        var w = box.width;
        var h = box.height;

        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        w *= cos > 0 ? 1: -1;
        h *= sin > 0 ? -1: 1;

        return {
            x: w/2,
            y: h/2
        };
    }


    /**
     *
     * @param labels
     * @returns {D3._Selection<T>}
     */
    function addLabelText(labels){
        var textElements = labels.append("text")
            .text(function(d) {return d.text;})
            .attr("text-anchor", "middle")
            .attr("x", function(d){
                return Math.cos(d.angle) * d.r1;
            })
            .attr("y", function(d){
                return (Math.sin(d.angle) * d.r1 * -1);
            })
            .attr("font-size", function(d){
                return d.fontSize;
            });
        textElements.each(function(d){
                var box = this.getBBox();
                d.frameBox = {
                    x: box.x - 10,
                    y: box.y - 2,
                    width: box.width + 20,
                    height: box.height + 4
                };
            })
            .each(function(d){
                var center = labelCentroid(d.frameBox, d.angle);
                // add the offsets
                d.offset = {
                    x: center.x,
                    y: 0
                };
            });
        return textElements;
    }

    /**
     *
     * @param labels
     * @returns {D3._Selection<T>}
     */
    function addFrameBox(labels){
        return labels.append("rect")
            .attr("x", function(d){
                return d.frameBox.x;
            })
            .attr("y", function (d) {
                return d.frameBox.y;
            })
            .attr("height", function (d) {
                return d.frameBox.height;
            })
            .attr("width", function (d) {
                return d.frameBox.width;
            })
            .attr({
                "vector-effect": "non-scaling-stroke",
                "rx": 0.5,
                "ry": 0.5,
                // "fill": "#d5f5d5",
                "fill": "white"
            })
            .attr("stroke", function(d){
                return d.lineColor;
            })
            .attr("stroke-width", 1);
    }

    /**
     *
     * @param labels
     * @returns {D3._Selection<T>}
     */
    function addLabelLines(labels){
        var lines;
        var groupLines;
        var measurementLines;

        lines = labels.append("line");

        lines.attr({
            "vector-effect": "non-scaling-stroke",
            "stroke-width": 1,
            "stroke-dasharray": "10, 5"
            })
            .attr("stroke", function(d){
                return d.lineColor;
            })
            .attr("x1", function (d) {
                d.x1 = Math.cos(d.angle) > 0 ? d.frameBox.x: d.frameBox.x + d.frameBox.width;
                return d.x1;
            })
            .attr("y1", function (d) {

                d.y1 = d.frameBox.y + d.frameBox.height/2;

                if(d.angle > Math.PI / 2 - 1/3 * Math.PI || d.angle < Math.PI / 2 - Math.PI - 2/3 * Math.PI)
                    d.y1 = d.frameBox.y + d.frameBox.height;

                if(d.angle < Math.PI / 2 - 2/3 * Math.PI && d.angle > Math.PI / 2 - Math.PI - 1/3 * Math.PI)
                    d.y1 = d.frameBox.y;

                return d.y1;
            })
            .attr("x2", function (d) {
                return d.x1;
            })
            .attr("y2", function (d) {
                return d.y1;
            });

        groupLines = lines.filter(function (d) {
            return d.className == "groupLabel";
        });

        groupLines
            .attr("x2", function (d) {
                return Math.cos(d.angle) * (d.r0 + d.r) - d.offset.x;
            })
            .attr("y2", function (d) {
                return (Math.sin(d.angle) * (d.r0 + d.r) * - 1) - d.offset.y;
            })
            .attr("stroke-width", 2)
            .attr("opacity", 0.3);

        measurementLines = lines.filter(function (d) {
            return d.className == "measurementLabel";
        });

        measurementLines.transition()
            .attr("x2", function (d) {
                return Math.cos(d.angle) * (d.r0 + d.r) - d.offset.x;
            })
            .attr("y2", function (d) {
                return (Math.sin(d.angle) * (d.r0 + d.r) * - 1) - d.offset.y;
            });

        return lines;
    }

    var labelGroups = this.labelGroupContainer.selectAll("g")
        .data(labelData)
        .enter()
        .append("g");

    // add the text
    var labelsText = addLabelText(labelGroups);

    // add the frame around
    var labelsFrame = addFrameBox(labelGroups);

    // fix the collisions
    collisionFix(labelGroups);

    // move the labels
    labelGroups.attr("transform", function(d){
        return "translate(" + d.offset.x + ", " + d.offset.y + ")";
    });

    // append the line
    var lines = addLabelLines(labelGroups);

    // move to lines to the front
    lines.each(function(){
        this.parentNode.appendChild(d3.select(this).node());
    });

    // then move to frames to the front
    labelsFrame.each(function(){
        this.parentNode.appendChild(d3.select(this).node());
    });

    // finally move the text to the front
    labelsText.each(function(){
        this.parentNode.appendChild(d3.select(this).node());
    });

    return labelGroups;
};

/**
 * Update the labels by changing the data value and then removing them from the plot
 * in order to plot them again
 */
HealthGraph.prototype.updateLabelPosition = function () {

    var measurements = this.measurements;

    function getLabelDatum(label){
        var datum;
        for(var i = 0; i < labelData.length; i++){
            datum = labelData[i];
            if(datum.label === label){
                return datum;
            }
        }
        return null;
    }

    var labelRadius = this.labelRadius;
    // save opacity properties for labels
    var measurementLabelsOpacity = this.labelGroupContainer.selectAll("g.measurementLabel").attr("opacity");
    var groupLabelsOpacity = this.labelGroupContainer.selectAll("g.groupLabel").attr("opacity");

    this.labelGroupContainer.selectAll("g").remove();
    var labelData = this.labelData;

    var measurement, datum;
    var circles;
    var maxRadiusForGroupLabels = 0;

    for(var i = 0; i < measurements.length; i ++){
        measurement = measurements[i];
        datum = getLabelDatum(measurement.label);

        datum.text = measurement.label + ": " + measurement.samples[measurement.sample].value + " " + measurement.units;

        // get all the radii from the circles associated to this measurement
        circles = this.getCircleMeasurement(measurement.label);

        circles.each(function (d) {

            // console.log(d.radius);

            datum.r1 = Math.max(d.radius + 30, labelRadius);

            maxRadiusForGroupLabels = Math.max(datum.r1, maxRadiusForGroupLabels);

        });


        // datum.r1 = Math.max(measurement.radius + 20, labelRadius); // TODO: extend this to the label creation
        // datum.r0 = measurement.radius;
    }

    // adjust group labels as well
    this.labelGroupContainer
        .selectAll("g.groupLabel")
        .each(function (d) {

            // TODO: Find why the hell I am not getting the max radius

            d.r1 = maxRadiusForGroupLabels + 20;

        });

    var self = this;
    this.mouseHighlight(self.plotLabels(labelData));
    // set the opacity to the previous value
    this.labelGroupContainer.selectAll("g.measurementLabel").attr("opacity", measurementLabelsOpacity);
    this.labelGroupContainer.selectAll("g.groupLabel").attr("opacity", groupLabelsOpacity);

};

/**
 * Select a sample to plot
 * @param index
 */
HealthGraph.prototype.plotSamplesAt = function(index){

    var graph = this.graphs.select("g.graph");
    this.selectSample(index);
    this.updatePolygonAndCircles(graph);
    this.updateLabelPosition();
    var graphContainerDOM = this.graphs.node();
    graphContainerDOM.parentNode.appendChild(graphContainerDOM);
};

/**
 * Plot an additional sample in the background
 * @param index
 * @returns {D3._Selection}
 */
HealthGraph.prototype.interpolateSamplesAt = function(index){
    // var originalSample;
    var hGraphMeasurements;
    var graphs;
    var d3Selection;
    var recentlyAddedGraph;
    var hCircles;

    // originalSample = this.measurements[0].sample;
    hGraphMeasurements = this.selectSample(index);

    graphs = this.graphs;
    d3Selection = graphs.selectAll("g.graph");

    recentlyAddedGraph = this.renderPolygonAndCircles(hGraphMeasurements);

    graphs.node().appendChild(recentlyAddedGraph.node());
    // move the previously existing graphs to the front
    d3Selection.each(function (d) {
        this.parentNode.appendChild(d3.select(this).node());
    });

    hCircles = recentlyAddedGraph.selectAll("circle");

    this.mouseHighlight(hCircles);

    this.updateLabelPosition();

    // restore the original sample
    // this.selectSample(originalSample);

    return recentlyAddedGraph;
};



/**
 * Sets all the measurements to the selected index or the last one if not found.
 * @param index
 * @returns {Array}
 */
HealthGraph.prototype.selectSample = function (index) {
    var hGraphMeasurement;
    var samples;
    var hGraphMeasurements = [];

    for(var i = 0; i < this.measurements.length; i ++){
        hGraphMeasurement = this.measurements[i];
        samples = hGraphMeasurement.samples;
        hGraphMeasurement.sample = index < samples.length? index: samples.length - 1;
        hGraphMeasurement.calculatePosition();
        hGraphMeasurements.push(hGraphMeasurement);
    }

    return hGraphMeasurements;
};


/**
 * Builds a distance string for svg elements.
 * @param measurements [HealthMeasurement]
 * @returns {*[]}
 */
HealthGraph.prototype.toDistanceString = function(measurements){
    var arr = [];
    for(var i = 0; i < measurements.length; i ++){
        arr.push([measurements[i].x, measurements[i].y]);
    }
    return [arr];
};

/**
 *
 * @param label {string}
 * @returns {D3._UpdateSelection}
 */
HealthGraph.prototype.getLabelGroup = function(label){
    return this.hGraphWrapper
        .select("g.hGraph")
        .select("g.labels")
        .selectAll("g.measurementLabel")
        .filter(function (d) {
            return d.label == label;
        });
};

/**
 *
 * @param label
 * @returns {D3._UpdateSelection}
 */
HealthGraph.prototype.getCircleMeasurement = function(label){
    return this.graphs
        .selectAll("g.hGraphMeasurements circle")
        .filter(function (d) {
            if(d) return d.label == label;
            return false;
        });
};


/**
 * Render the polygon and the circles representing the measurements.
 * @param measurementDataModels
 * @returns {D3._Selection<T>|*}
 */
HealthGraph.prototype.renderPolygonAndCircles = function(measurementDataModels){
    var graph;
    var distanceString;


    graph = this.svg.append("g")
        .attr("class", "graph");

    // add the polygon in a group
    distanceString = this.toDistanceString(measurementDataModels);

    // create group and add polygon
    graph.append("g")
        .attr("class", "polygon")
        .selectAll("polygon")
        .data(function () {
            return [distanceString];
        })
        .enter()
        .append("polygon")
        .attr("points", function(d) {
            // compute the coordinates
            return d.join(" ");
        }).attr({
            "stroke": "#5b5b5b",
            "stroke-width": 1,
            "fill": "none",
            // "fill-opacity": 0.15,
            "vector-effect": "non-scaling-stroke"
        });

    // add all the circles representing the measurements in a group
    graph.append("g")
        .attr("class", "hGraphMeasurements")
        .selectAll("circle")
        .data(measurementDataModels)
        .enter()
        .append("circle")
        .attr("r", function(d){
            return d.r;
        })
        .attr("cx", function(d){
            return d.x;
        })
        .attr("cy", function(d){
            return d.y;
        })
        .attr("fill", function(d){
            return d.color;
        })
        .attr({
            "stroke": "#5b5b5b",
            "stroke-width": 1,
            "vector-effect": "non-scaling-stroke"
        });

    // return the graph group containing the circles and the polygon
    return graph;
};
/**
 *
 * @param graph
 * @returns {*}
 */
HealthGraph.prototype.updatePolygonAndCircles = function(graph){

    var distanceString;
    var measurements;


    distanceString = this.toDistanceString(this.measurements);
    measurements = this.measurements;

    graph.selectAll("polygon")
        .data(function () {
            return [distanceString];
        })
        .transition()
        .attr("points", function(d) {
            // compute the coordinates
            return d.join(" ");
        });


    graph.selectAll("circle")
        .data(measurements)
        .transition()
        .attr("r", function(d){
            return d.r;
        })
        .attr("cx", function(d){
            return d.x;
        })
        .attr("cy", function(d){
            return d.y;
        })
        .attr("fill", function(d){
            return d.color;
        })
        .attr({
            "stroke": "#5b5b5b",
            "stroke-width": 1,
            "vector-effect": "non-scaling-stroke"
        });

    return graph;
};

/**
 *
 * @param {D3._Selection<U>} d3Selection
 */
HealthGraph.prototype.mouseHighlight = function (d3Selection) {
    var self = this;
    d3Selection.on("mouseover", function(d) {



        // d3.select(this).attr("stroke-width", 4); // redundant since now we are selecting all circles
        var g = self.getLabelGroup(d.label);
        g.select("line").attr("stroke-width", 3);
        g.select("rect").attr("stroke-width", 3);

        // console.log(d3.select(this).selectAll("text"));

        // g.select("text").attr("font-size", 8.5);

        d3.select(this).selectAll("text")

        var c = self.getCircleMeasurement(d.label);
        c.attr("stroke-width", 3);
        c.attr("r", 6);

    }).on("mouseout", function(d) {

        // d3.select(this).attr("stroke-width", 1);
        var g = self.getLabelGroup(d.label);
        g.select("line").attr("stroke-width", 1);
        g.select("rect").attr("stroke-width", 1);
        g.select("rect").attr("r", 4);
        // g.select("text").attr("font-size", 8);


        var c = self.getCircleMeasurement(d.label);
        c.attr("stroke-width", 1);
        c.attr("r", 4);

    });
};