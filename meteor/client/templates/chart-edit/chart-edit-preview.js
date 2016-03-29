var Rect = new ReactiveVar({
  width: 0,
  height: 0,
  anchor: "",
  coords: {
    x: 0,
    y: 0
  }
});

var tempAnnotation,
  annoGroup,
  annoRect,
  topLeftHandle,
  topMiddleHandle,
  topRightHandle,
  middleLeftHandle,
  middleRightHandle,
  bottomLeftHandle,
  bottomMiddleHandle,
  bottomRightHandle;

var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragMove),

  dragresizeright = d3.behavior.drag()
    .origin(Object)
    .on("drag", middleRightDragResize),

  dragresizeleft = d3.behavior.drag()
    .origin(Object)
    .on("drag", middleLeftDragResize),

  dragresizetop = d3.behavior.drag()
    .origin(Object)
    .on("drag", topMiddleDragResize),

  dragresizebottom = d3.behavior.drag()
    .origin(Object)
    .on("drag", bottomMiddleDragResize),

  dragresizebottomleft = d3.behavior.drag()
    .origin(Object)
    .on("drag", bottomLeftDragResize),

  dragresizebottomright = d3.behavior.drag()
    .origin(Object)
    .on("drag", bottomRightDragResize),

  dragresizetopleft = d3.behavior.drag()
    .origin(Object)
    .on("drag", topLeftDragResize),

  dragresizetopright = d3.behavior.drag()
    .origin(Object)
    .on("drag", topRightDragResize);

function createHandle(selection, className, radius) {

  var dragFn, xVal, yVal;

  var rect = Rect.get(),
      width = rect.width,
      height = rect.height;

  // would rather use arguments.callee.name but some browsers might complain
  switch(className) {
    case "anno-top-left":
      dragFn = dragresizetopleft;
      xVal = 0;
      yVal = 0;
      break;
    case "anno-top-middle":
      dragFn = dragresizetop;
      xVal = width / 2;
      yVal = 0;
      break;
    case "anno-top-right":
      dragFn = dragresizetopright;
      xVal = width;
      yVal = 0;
      break;
    case "anno-middle-left":
      dragFn = dragresizeleft;
      xVal = 0;
      yVal = height / 2;
      break;
    case "anno-middle-right":
      dragFn = dragresizeright;
      xVal = width;
      yVal = height / 2;
      break;
    case "anno-bottom-left":
      dragFn = dragresizebottomleft;
      xVal = 0;
      yVal = height;
      break;
    case "anno-bottom-middle":
      dragFn = dragresizebottom;
      xVal = width / 2;
      yVal = height;
      break;
    case "anno-bottom-right":
      dragFn = dragresizebottomright;
      xVal = width;
      yVal = height;
      break;
  }

  return selection.append("div")
    .style({
      "left": (xVal - radius) + "px",
      "top": (yVal - radius) + "px",
      "width": radius * 2 + "px",
      "height": radius * 2 + "px"
    })
    .attr("class", className)
    .classed("anno-handle", true)
    .call(dragFn);
}

function createAnnotationGroup(container) {

  var radius = 3;

  var rect = Rect.get(),
      w = rect.width,
      h = rect.height,
      x = rect.coords.x,
      y = rect.coords.y;

  annoGroup = d3.select(container);

  annoRect = annoGroup.append("div")
    .attr("class", "annotations-background")
    .call(drag);

  topLeftHandle = createHandle(annoGroup, "anno-top-left", radius);
  topMiddleHandle = createHandle(annoGroup, "anno-top-middle", radius);
  topRightHandle = createHandle(annoGroup, "anno-top-right", radius);
  middleLeftHandle = createHandle(annoGroup, "anno-middle-left", radius);
  middleRightHandle = createHandle(annoGroup, "anno-middle-right", radius);
  bottomLeftHandle = createHandle(annoGroup, "anno-bottom-left", radius);
  bottomMiddleHandle = createHandle(annoGroup, "anno-bottom-middle", radius);
  bottomRightHandle = createHandle(annoGroup, "anno-bottom-right", radius);

}

function dragMove(d) {

  // annoRect.attr({
  //   "x": d.x = Math.max(0, Math.min(w - width, d3.event.x)),
  //   "y": d.y = Math.max(0, Math.min(h - height, d3.event.y))
  // });

  // dragPointCenterLeft
  // dragPointCenterRight
  // dragPointTopCenter
  // dragPointBottomCenter


  //     dragbarleft
  //         .attr("x", function(d) { return d.x - (dragbarw/2); })
  //     dragbarright
  //         .attr("x", function(d) { return d.x + width - (dragbarw/2); })
  //     dragbartop
  //         .attr("x", function(d) { return d.x + (dragbarw/2); })
  //     dragbarbottom
  //         .attr("x", function(d) { return d.x + (dragbarw/2); }

  //     dragbarleft
  //         .attr("y", function(d) { return d.y + (dragbarw/2); });
  //     dragbarright
  //         .attr("y", function(d) { return d.y + (dragbarw/2); });
  //     dragbartop
  //         .attr("y", function(d) { return d.y - (dragbarw/2); });
  //     dragbarbottom
  //         .attr("y", function(d) { return d.y + height - (dragbarw/2); });
}

function middleRightDragResize(d) {}
function middleLeftDragResize(d) {}
function topMiddleDragResize(d) {}
function bottomMiddleDragResize(d) {}
function bottomLeftDragResize(d) {}
function bottomRightDragResize(d) {}
function topLeftDragResize(d) {}
function topRightDragResize(d) {}

Template.chartEditPreview.events({
  "blur .editable-chart_title": function(event) {
    var input = event.target.innerText;
    var text = removeNbsp(input).trim();
    updateAndSave("updateHed", this, text);
  },
  "blur .editable-chart_qualifier": function(event) {
    var input = event.target.innerText;
    var text = removeNbsp(input).trim();
    updateAndSave("updateQual", this, text);
  },
  "click .editable-chart_source": function(event) {
    var currText = event.target.textContent.trim();
    if (currText === app_settings.chart.source || currText === "") {
      event.target.textContent = app_settings.chart.source + app_settings.source_suffix;
    }
    cursorManager.setEndOfContenteditable(event.target);
  },
  "blur .editable-chart_source": function(event) {
    var currText = event.target.textContent;
    if (currText === app_settings.chart.source + app_settings.source_suffix || currText === "") {
      event.target.textContent = app_settings.chart.source;
      updateAndSave("updateSource", this, app_settings.chart.source);
    } else {
      var text = removeNbsp(currText).trim();
      updateAndSave("updateSource", this, text);
    }
  },
  "drag .preview-container > svg": function(event) {

    // determine x and y coords from svg 0,0
    // determine width and height
    // call createAnnotationGroup(svg)

    if (event.drag.type === "dragstart") {

      d3.select(".annotations-container").remove();

      var rect = Rect.get();

      var svgClientRect = event.currentTarget.getBoundingClientRect();

      rect.coords = {
        x: event.clientX - svgClientRect.left,
        y: event.clientY - svgClientRect.top
      };

      rect.width = 0;
      rect.height = 0;

      // create temporary element
      tempAnnotation = d3.select(event.currentTarget.parentNode)
        .append("div")
        .attr("class", "annotations-container")
        .style({
          "top": rect.coords.y + "px",
          "left": rect.coords.x + "px",
          "width": rect.width,
          "height": rect.height
        });

      Rect.set(rect);

    }

    if (event.drag.type === 'dragging') {
      // update width and height
      // update temporary element
      var rect = Rect.get();

      rect.width += event.drag.dx;
      rect.height += event.drag.dy;

      tempAnnotation.style({
        "width": rect.width + "px",
        "height": rect.height + "px"
      });

      Rect.set(rect);
    }

    if (event.drag.type === 'dragend') {
      // update width and height one final time
      var rect = Rect.get();

      rect.width += event.drag.dx;
      rect.height += event.drag.dy;

      tempAnnotation.style({
        "width": rect.width + "px",
        "height": rect.height + "px"
      });

      Rect.set(rect);

      createAnnotationGroup(".annotations-container");

      // need to remember to take header height into account, too
      // and whether it's empty or not, since that'll affect the
      // final computed height of the annotation…

    }

  }
});

Template.chartEditPreview.rendered = function() {
  Tracker.autorun(function(comp) {
    var routeName = Router.current().route.getName();

    if (routeName !== "chart.edit") {
      comp.stop();
      return;
    }

    var data = Router.current() && Router.current().data();

    if (data) {
      data.editable = true;
      data.options.tips = false;
      drawPreviews(data);
    }

  });

}
