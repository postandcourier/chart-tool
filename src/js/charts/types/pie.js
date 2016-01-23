function PieChart(node, obj) {

  var isFloat = require("../../helpers/helpers").isFloat;

  var radius = Math.min(obj.dimensions.computedWidth(), obj.dimensions.computedHeight()) / 2,
    labelRadius = radius;

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.series[0].val;
    });

  var arc = d3.svg.arc()
    .outerRadius(radius * 0.85)
    .innerRadius(0);

  var labelArc = d3.svg.arc()
    .outerRadius(radius * 0.80)
    .innerRadius(radius * 0.70);

  var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  var seriesGroup = node.append("g")
    .attr({
      "class": obj.prefix + "series_group",
      "transform": "translate(" + obj.dimensions.computedWidth() / 2 + "," + obj.dimensions.computedHeight() / 2 + ")"
    });

  var arcGroup = seriesGroup.selectAll("." + obj.prefix + "arc-group")
    .data(pie(obj.data.data))
    .enter().append("g")
    .attr({
      "class": function(d, i) {
        return obj.prefix + "arc-group " + obj.prefix + "arc-group-" + i;
      },
      "data-key": function(d) { return d.key }
    })
    .attr("class", obj.prefix + "arc");

  arcGroup.append("path")
    .attr({
      "d": arc,
      "class": function(d, i) {
        return obj.prefix + "arc " + obj.prefix + "arc-" + i;
      }
    });

  var arcText = arcGroup.append("text")
    .attr({
      "dy": ".35em",
      "class": obj.prefix + "arc-text"
    });

  arcText.append("tspan")
    .attr({
      "class": obj.prefix + "arc-text-key",
      "x": 0,
      "dy": "0.32em"
    })
    .text(function(d) { return d.data.key; });

  arcText.append("tspan")
    .attr({
      "class": obj.prefix + "arc-text-value",
      "x": 0,
      "dy": "1.32em"
    })
    .text(function(d) {
      var datum = d.data.series[0].val;
      var currentFormat = isFloat(datum) ? d3.format(",.2f") : d3.format(",g");
      return currentFormat(datum) + "%";
    });

  arcGroup.append("rect")
    .attr({
      "class": obj.prefix + "arc-rect",
      "width": 10,
      "height": 10,
      "x": function(d) { return labelArc.centroid(d)[0] - 5; },
      "y": function(d) { return labelArc.centroid(d)[1] - 5; }
  })

  arcText
    .attr({
      "transform": function(d) {
        var pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return "translate("+ pos +")";
      }
    })
    .style("text-anchor", function(d) {
      return midAngle(d) < Math.PI ? "end" : "start";
    });

  relax(arcText);

  var polyline = arcGroup.append("polyline")
    .attr({
      "class": obj.prefix + "arc-polyline",
      "points": function(d) {
        var pos = outerArc.centroid(d);
        var lineOffset = 8;
        var textWidth = d3.select(this.parentNode).select("text").node().getBBox().width;
        var widthFactor = midAngle(d) < Math.PI ? -(textWidth) - lineOffset: textWidth + lineOffset;
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1) + widthFactor;
        return [labelArc.centroid(d), outerArc.centroid(d), pos];
      }
    });

  return {
    radius: radius,
    pie: pie,
    arc: arc,
    seriesGroup: seriesGroup,
    arcGroup: arcGroup,
    arcText: arcText
  };

}

function midAngle(d){
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

function relax(selection) {

  var getTranslate = require("../../utils/utils").getTranslateXY,
      setTranslate = require("../../utils/utils").translate;

  alpha = 3;
  spacing = 12;
  again = false;
  selection.each(function(d, i) {
    var a = this;
    var da = d3.select(a);

    var x1 = getTranslate(a)[0],
        y1 = getTranslate(a)[1];

    var aHeight = a.getBBox().height;

    console.log(d.data.key);

    selection.each(function() {
      var b = this;

      if (a == b) return;

      var db = d3.select(b);

      var bHeight = b.getBBox().height;

      if (da.style("text-anchor") != db.style("text-anchor")) return;

      x1 = getTranslate(a)[0];
      y1 = getTranslate(a)[1];

      var x2 = getTranslate(b)[0];
      var y2 = getTranslate(b)[1];

      var deltaY = Math.abs(Math.abs(y1) - Math.abs(y2));

      if (deltaY > spacing + aHeight) return;

      again = true;

      var newY1 = y1 > 0 ? y1 + alpha : y1 - alpha;
      var newY2 = y2 > 0 ? y2 - alpha : y2 + alpha;

      da.attr("transform", setTranslate(x1, newY1));
      db.attr("transform", setTranslate(x2, newY2));

      debugger;

    });
  });

  if (again) { relax(selection); }
}

module.exports = PieChart;
