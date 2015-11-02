/**
 * Tips handling module.
 * @module charts/components/tips
 */

function bisector(data, keyVal) {
  var bisect = d3.bisector(function(d) { return d.key; }).left;
  return bisect(data, keyVal);
}

function cursorPos(overlay) {
  return {
    x: d3.mouse(overlay.node())[0],
    y: d3.mouse(overlay.node())[1]
  };
}

function getTipData(obj, cursor) {

  var xScale = obj.rendered.plot.xScaleObj.scale,
      yScale = obj.rendered.plot.xScaleObj.scale,
      xVal = xScale.invert(cursor.x);

  var i = bisector(obj.data.data, xVal),
      d0 = obj.data.data[i - 1],
      d1 = obj.data.data[i],
      d = xVal - d0.key > d1.key - xVal ? d1 : d0;

  return d;

}

function showTips(tipNodes, obj) {
  tipNodes.xLine
    .classed(obj.prefix + "active", true);
  tipNodes.tipBox
    .classed(obj.prefix + "active", true);
  tipNodes.tipPathCircles
    .classed(obj.prefix + "active", true);
}

function hideTips(tipNodes, obj) {
  tipNodes.xLine
    .classed(obj.prefix + "active", false);
  tipNodes.tipBox
    .classed(obj.prefix + "active", false);
  tipNodes.tipPathCircles
    .classed(obj.prefix + "active", false);
}

function mouseIdle(tipNodes, obj, timeout) {
  return setTimeout(function() {
    hideTips(tipNodes, obj);
  }, obj.tipTimeout);
}

function tipsManager(node, obj) {

  var tipNodes = appendTipElements(node, obj);

  var fns = {
    line: LineChartTips,
    area: obj.options.stacked ? StackedAreaChartTips : AreaChartTips,
    column: obj.options.stacked ? StackedColumnChartTips : ColumnChartTips,
    stream: StreamgraphTips
  };

  tipNodes.overlay
    .on("mouseover", function() { showTips(tipNodes, obj); })
    .on("mouseout", function() { hideTips(tipNodes, obj); })
    .on("mousemove", function() {
      showTips(tipNodes, obj);
      var timeout;
      clearTimeout(timeout);
      timeout = mouseIdle(tipNodes, obj, timeout);
      return fns[obj.options.type](tipNodes, obj);
    });

}

function appendTipElements(node, obj) {

  var chartNode = d3.select(node.node().parentNode.parentNode),
      svgNode = d3.select(node.node().parentNode);

  var tip = svgNode.append("g")
    .attr("class", obj.prefix + "tip");

  var xTipLine = tip.append("g")
    .attr("class", obj.prefix + "tip_line-x")
    .classed(obj.prefix + "active", false);

  xTipLine.append("line");

  var tipBox = tip.append("g")
    .attr({
      "class": obj.prefix + "tip_box",
      "transform": "translate(" + (obj.dimensions.computedWidth() - obj.dimensions.tickWidth()) + ",0)"
    });

  var tipRect = tipBox.append("rect")
    .attr({
      "class": obj.prefix + "tip_rect",
      "transform": "translate(0,0)",
      "width": 1,
      "height": 1
    });

  var tipGroup = tipBox.append("g")
    .attr("class", obj.prefix + "tip_group");

  var tipTextGroups = tipGroup
    .selectAll("g")
    .data(obj.data.data[0].series)
    .enter()
    .append("g")
    .attr("class", function(d, i) {
      return obj.prefix + "tip_text-group " + obj.prefix + "tip_text-group-" + (i);
    });

  var tipTextDate = tipGroup
    .insert("g", ":first-child")
    .attr("class", obj.prefix + "tip_text-date-group")
    .append("text")
    .attr({
      "class": obj.prefix + "tip_text-date",
      "x": 0,
      "y": 0,
      "dy": "1em"
    });

  var legendIcon = chartNode.select("." + obj.prefix + "legend_item_icon").node();

  if (legendIcon) {
    var radius = legendIcon.getBoundingClientRect().width / 2;
  } else {
    var radius = 0;
  }

  tipTextGroups
    .append("circle")
    .attr({
      "class": function(d, i) {
        return (obj.prefix + "tip_circle " + obj.prefix + "tip_circle-" + (i));
      },
      "r": function(d, i) { return radius; },
      "cx": function() { return radius; },
      "cy": function(d, i) {
        return ( (i + 1) * parseInt(d3.select(this).style("font-size")) * 1.13 + 9);
      }
    });

  tipTextGroups.append("text")
    .text(function(d) { return d.val; })
    .attr({
      "class": function(d, i) {
        return (obj.prefix + "tip_text " + obj.prefix + "tip_text-" + (i));
      },
      "data-series": function(d, i) { return d.key; },
      "x": function() {
        return (radius * 2) + (radius / 1.5);
      },
      "y": function(d, i) {
        return ( (i + 1) * ( parseInt(d3.select(this).style("font-size")) + 2) );
      },
      "dy": "1em"
    });

  var overlay = tip.append("rect")
    .attr({
      "class": obj.prefix + "tip_overlay",
      "transform": "translate(" + (obj.dimensions.computedWidth() - obj.dimensions.tickWidth()) + ",0)",
      "width": obj.dimensions.tickWidth(),
      "height": obj.dimensions.computedHeight()
    });

  var tipPathCircles = tip.append("g")
    .attr("class", obj.prefix + "tip_path-circle-group");

  tipPathCircles
    .selectAll("circle")
    .data(obj.data.data[0].series)
    .enter()
    .append("circle")
    .attr({
      "class": function(d, i) {
        return (obj.prefix + "tip_path-circle " + obj.prefix + "tip_path-circle-" + (i));
      },
      "r": 2.5
    });

  return {
    chart: chartNode,
    svg: svgNode,
    tip: tip,
    overlay: overlay,
    xLine: xTipLine,
    tipBox: tipBox,
    tipGroup: tipGroup,
    tipRect: tipRect,
    tipTextGroups: tipTextGroups,
    tipTextDate: tipTextDate,
    tipPathCircles: tipPathCircles
  };

}

function LineChartTips(tipNodes, obj) {

  var cursor = cursorPos(tipNodes.overlay),
      tipData = getTipData(obj, cursor);

  var isUndefined = 0;

  for (var i = 0; i < tipData.series.length; i++) {
    if (tipData.series[i].val === "__undefined__") {
      isUndefined++;
    }
  }

  if (!isUndefined) {

    var yFormatter = require("./axis").setTickFormatY,
        timeDiff = require("../../utils/utils").timeDiff;
        domain = obj.rendered.plot.xScaleObj.scale.domain(),
        ctx = timeDiff(domain[0], domain[1], 6);

    var tipGroup = tipNodes.tipGroup;

    tipGroup.selectAll("." + obj.prefix + "tip_text-group text")
      .data(tipData.series)
      .text(function(d, i) {
        if (!obj.yAxis.prefix) { obj.yAxis.prefix = ""; }
        if (!obj.yAxis.suffix) { obj.yAxis.suffix = ""; }
        if (d.val) {
          return obj.yAxis.prefix + yFormatter(obj.yAxis.format, d.val) + obj.yAxis.suffix;
        } else {
          return "n/a";
        }
      });

    tipNodes.tipTextDate
      .text(function() {
        var d = tipData.key;
        var dStr;
        switch (ctx) {
          case "years":
            dStr = d.getFullYear();
            break;
          case "months":
            dMonth = obj.monthsAbr[d.getMonth()];
            dDate = d.getDate();
            dYear = d.getFullYear();
            dStr = dMonth + ". " + dDate + ", " + dYear;
            break;
          case "weeks":
          case "days":
            dMonth = obj.monthsAbr[d.getMonth()];
            dDate = d.getDate();
            dYear = d.getFullYear();
            dStr = dMonth + ". " + dDate;
            break;
          case "hours":

            dDate = d.getDate();
            dHour = d.getHours();
            dMinute = d.getMinutes();

            var dHourStr,
                dMinuteStr;

            // Convert from 24h time
            var suffix = (dHour >= 12) ? 'p.m.' : 'a.m.';

            if (dHour === 0){
              dHourStr = 12;
            } else if (dHour > 12) {
              dHourStr = dHour - 12;
            } else {
              dHourStr = dHour;
            }

            // Make minutes follow Globe style
            if (dMinute === 0) {
              dMinuteStr = '';
            } else if(dMinute < 10) {
              dMinuteStr = ':0' + dMinute;
            } else {
              dMinuteStr = ':' + dMinute;
            }

            dStr = dHourStr + dMinuteStr + ' ' + suffix;

            break;
          default:
            dStr = d;
            break;
        }

        return dStr;
      });

    tipGroup
      .selectAll("." + obj.prefix + "tip_text-group")
      .data(tipData.series)
      .classed(obj.prefix + "active", function(d, i) {
        return d.val ? true : false;
      });

    tipGroup
      .attr({
        "transform": function() {
          if (cursor.x > obj.dimensions.tickWidth() / 2) {
            // tipbox pointing left
            var x = obj.dimensions.tipPadding.left;
          } else {
            // tipbox pointing right
            var x = obj.dimensions.tipPadding.left;
          }
          var y = obj.dimensions.tipPadding.top;
          return "translate(" + x + "," + y + ")";
        }
      });

    tipNodes.tip
      .selectAll("." + obj.prefix + "tip_path-circle")
        .data(tipData.series)
        .classed(obj.prefix + "active", function(d) { return d.val ? true : false; })
        .attr({
          "cx": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
          "cy": function(d) {
            if (d.val) { return obj.rendered.plot.yScaleObj.scale(d.val); }
          }
        });


    tipNodes.tipRect
      .attr({
        "width": tipGroup.node().getBoundingClientRect().width + obj.dimensions.tipPadding.left +  + obj.dimensions.tipPadding.right,
        "height": tipGroup.node().getBoundingClientRect().height + obj.dimensions.tipPadding.top +  + obj.dimensions.tipPadding.bottom
      });

    tipNodes.xLine.select("line")
      .attr({
        "x1": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
        "x2": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
        "y1": 0,
        "y2": obj.dimensions.yAxisHeight()
      });

    var getTranslate = require("../../utils/utils").getTranslateXY;

    var tipBoxTranslate = getTranslate(tipNodes.tipBox.node());

    tipNodes.tipBox
      .attr({
        "transform": function() {
          if (cursor.x > obj.dimensions.tickWidth() / 2) {
            // tipbox pointing left
            var x = obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight - d3.select(this).node().getBoundingClientRect().width - obj.dimensions.tipOffset.horizontal;
          } else {
            // tipbox pointing right
            var x = obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight + obj.dimensions.tipOffset.horizontal;
          }
          return "translate(" + x + "," + obj.dimensions.tipOffset.vertical + ")";
        }
      });

  }

}

function AreaChartTips(tipNodes, obj) {

  var cursor = cursorPos(tipNodes.overlay),
      tipData = getTipData(obj, cursor);

  var isUndefined = 0;

  for (var i = 0; i < tipData.series.length; i++) {
    if (tipData.series[i].val === "__undefined__") {
      isUndefined++;
    }
  }

  if (!isUndefined) {

    var tipGroup = tipNodes.tipGroup;

    var yFormatter = require("./axis").setTickFormatY,
        timeDiff = require("../../utils/utils").timeDiff;
        domain = obj.rendered.plot.xScaleObj.scale.domain(),
        ctx = timeDiff(domain[0], domain[1], 6);

    tipGroup.selectAll("." + obj.prefix + "tip_text-group text")
      .data(tipData.series)
      .text(function(d, i) {
        if (!obj.yAxis.prefix) { obj.yAxis.prefix = ""; }
        if (!obj.yAxis.suffix) { obj.yAxis.suffix = ""; }
        if (d.val) {
          return obj.yAxis.prefix + yFormatter(obj.yAxis.format, d.val) + obj.yAxis.suffix;
        } else {
          return "n/a";
        }
      });

    tipNodes.tipTextDate
      .text(function() {
        var d = tipData.key;
        var dStr;
        switch (ctx) {
          case "years":
            dStr = d.getFullYear();
            break;
          case "months":
            dMonth = obj.monthsAbr[d.getMonth()];
            dDate = d.getDate();
            dYear = d.getFullYear();
            dStr = dMonth + ". " + dDate + ", " + dYear;
            break;
          case "weeks":
          case "days":
            dMonth = obj.monthsAbr[d.getMonth()];
            dDate = d.getDate();
            dYear = d.getFullYear();
            dStr = dMonth + ". " + dDate;
            break;
          case "hours":

            dDate = d.getDate();
            dHour = d.getHours();
            dMinute = d.getMinutes();

            var dHourStr,
                dMinuteStr;

            // Convert from 24h time
            var suffix = (dHour >= 12) ? 'p.m.' : 'a.m.';

            if (dHour === 0){
              dHourStr = 12;
            } else if (dHour > 12) {
              dHourStr = dHour - 12;
            } else {
              dHourStr = dHour;
            }

            // Make minutes follow Globe style
            if (dMinute === 0) {
              dMinuteStr = '';
            } else if(dMinute < 10) {
              dMinuteStr = ':0' + dMinute;
            } else {
              dMinuteStr = ':' + dMinute;
            }

            dStr = dHourStr + dMinuteStr + ' ' + suffix;

            break;
          default:
            dStr = d;
            break;
        }

        return dStr;
      });

    tipGroup
      .selectAll("." + obj.prefix + "tip_text-group")
      .data(tipData.series)
      .classed(obj.prefix + "active", function(d, i) {
        return d.val ? true : false;
      });

    tipGroup
      .attr({
        "transform": function() {
          if (cursor.x > obj.dimensions.tickWidth() / 2) {
            // tipbox pointing left
            var x = obj.dimensions.tipPadding.left;
          } else {
            // tipbox pointing right
            var x = obj.dimensions.tipPadding.left;
          }
          var y = obj.dimensions.tipPadding.top;
          return "translate(" + x + "," + y + ")";
        }
      });

    tipNodes.tip
      .selectAll("." + obj.prefix + "tip_path-circle")
        .data(tipData.series)
        .classed(obj.prefix + "active", function(d) { return d.val ? true : false; })
        .attr({
          "cx": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
          "cy": function(d) {
            if (d.val) { return obj.rendered.plot.yScaleObj.scale(d.val); }
          }
        });

    tipNodes.tipRect
      .attr({
        "width": tipGroup.node().getBoundingClientRect().width + obj.dimensions.tipPadding.left +  + obj.dimensions.tipPadding.right,
        "height": tipGroup.node().getBoundingClientRect().height + obj.dimensions.tipPadding.top +  + obj.dimensions.tipPadding.bottom
      });

    tipNodes.xLine.select("line")
      .attr({
        "x1": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
        "x2": obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight,
        "y1": 0,
        "y2": obj.dimensions.yAxisHeight()
      });

    var getTranslate = require("../../utils/utils").getTranslateXY;

    var tipBoxTranslate = getTranslate(tipNodes.tipBox.node());

    tipNodes.tipBox
      .attr({
        "transform": function() {
          if (cursor.x > obj.dimensions.tickWidth() / 2) {
            // tipbox pointing left
            var x = obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight - d3.select(this).node().getBoundingClientRect().width - obj.dimensions.tipOffset.horizontal;
          } else {
            // tipbox pointing right
            var x = obj.rendered.plot.xScaleObj.scale(tipData.key) + obj.dimensions.labelWidth + obj.dimensions.yAxisPaddingRight + obj.dimensions.tipOffset.horizontal;
          }
          return "translate(" + x + "," + obj.dimensions.tipOffset.vertical + ")";
        }
      });

  }

}

function StackedAreaChartTips(tipNodes, obj) {

}

function ColumnChartTips(tipNodes, obj) {

  var cursor = cursorPos(overlay),
      data = getTipData(obj, cursor);

}

function StackedColumnChartTips(tipNodes, obj) {

}

function StreamgraphTips(tipNodes, obj) {

}

module.exports = tipsManager;
