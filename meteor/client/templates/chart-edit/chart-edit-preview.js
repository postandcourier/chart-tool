var Rect = new ReactiveVar({
  width: 0,
  height: 0,
  radius: 4,
  anchor: "",
  coords: {
    x: 0,
    y: 0
  }
});

var annotationsBg,
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

function createHandle(selection, className) {

  var dragFn, xVal, yVal;

  var rect = Rect.get(),
      radius = rect.radius,
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
      "left": Math.round(xVal - radius) + rect.coords.x + "px",
      "top": Math.round(yVal - radius) + rect.coords.y + "px",
      "width": Math.round(radius * 2) + "px",
      "height": Math.round(radius * 2) + "px"
    })
    .attr("class", className)
    .classed("anno-handle", true)
    .call(dragFn);
}

function repositionHandle(name) {

  var rect = Rect.get(),
      width = rect.width,
      height = rect.height,
      radius = rect.radius;

  var xVal, yVal;

  switch(name) {
    case "anno-top-left":
      xVal = 0;
      yVal = 0;
      break;
    case "anno-top-middle":
      xVal = width / 2;
      yVal = 0;
      break;
    case "anno-top-right":
      xVal = width;
      yVal = 0;
      break;
    case "anno-middle-left":
      xVal = 0;
      yVal = height / 2;
      break;
    case "anno-middle-right":
      xVal = width;
      yVal = height / 2;
      break;
    case "anno-bottom-left":
      xVal = 0;
      yVal = height;
      break;
    case "anno-bottom-middle":
      xVal = width / 2;
      yVal = height;
      break;
    case "anno-bottom-right":
      xVal = width;
      yVal = height;
      break;
  }

  d3.select("." + name)
    .style({
      "left": Math.round(xVal - radius) + rect.coords.x + "px",
      "top": Math.round(yVal - radius) + rect.coords.y + "px",
    });
}

function createAnnotationGroup(container) {

  var radius = 4;

  var rect = Rect.get(),
      w = rect.width,
      h = rect.height,
      x = rect.coords.x,
      y = rect.coords.y;

  annotationsBg.call(drag);

  var annotationsContainer = d3.select(annotationsBg.node().parentNode);

  topLeftHandle = createHandle(annotationsContainer, "anno-top-left", radius);
  topMiddleHandle = createHandle(annotationsContainer, "anno-top-middle", radius);
  topRightHandle = createHandle(annotationsContainer, "anno-top-right", radius);
  middleLeftHandle = createHandle(annotationsContainer, "anno-middle-left", radius);
  middleRightHandle = createHandle(annotationsContainer, "anno-middle-right", radius);
  bottomLeftHandle = createHandle(annotationsContainer, "anno-bottom-left", radius);
  bottomMiddleHandle = createHandle(annotationsContainer, "anno-bottom-middle", radius);
  bottomRightHandle = createHandle(annotationsContainer, "anno-bottom-right", radius);

  return annotationsBg;

}

function dragMove() {

  var rect = Rect.get(),
      w = rect.width,
      h = rect.height,
      x = rect.coords.x,
      y = rect.coords.y;

  annotationsBg.style({
    "top": y + d3.event.dy + "px",
    "left": x + d3.event.dx + "px"
  });

  rect.coords.x = x + d3.event.dx;
  rect.coords.y = y + d3.event.dy;

  Rect.set(rect);

  var handles = ["anno-top-left", "anno-top-middle", "anno-top-right", "anno-middle-left", "anno-middle-right", "anno-bottom-left", "anno-bottom-middle", "anno-bottom-right"];

  handles.forEach(function(name) {
    repositionHandle(name);
  });

}

function middleRightDragResize() {
  var rect = Rect.get(),
      w = rect.width;
  annotationsBg.style({ "width": w + d3.event.dx + "px" });
  rect.width = w + d3.event.dx;
  Rect.set(rect);
  repositionHandle("anno-top-right");
  repositionHandle("anno-middle-right");
  repositionHandle("anno-bottom-right");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-bottom-middle");
}

function bottomMiddleDragResize() {
  var rect = Rect.get(),
      h = rect.height;
  annotationsBg.style({ "height": h + d3.event.dy + "px" });
  rect.height = h + d3.event.dy;
  Rect.set(rect);
  repositionHandle("anno-bottom-left");
  repositionHandle("anno-bottom-middle");
  repositionHandle("anno-bottom-right");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
}

function middleLeftDragResize() {
  var rect = Rect.get(),
      w = rect.width,
      x = rect.coords.x;
  annotationsBg.style({
    "width": w - d3.event.dx + "px",
    "left": x + d3.event.dx + "px"
  });
  rect.width = w - d3.event.dx;
  rect.coords.x = x + d3.event.dx;
  Rect.set(rect);
  repositionHandle("anno-top-left");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-bottom-left");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-bottom-middle");
}

function topMiddleDragResize() {
  var rect = Rect.get(),
      y = rect.coords.y,
      h = rect.height;
  annotationsBg.style({
    "height": h - d3.event.dy + "px",
    "top": y + d3.event.dy + "px"
  });
  rect.height = h - d3.event.dy;
  rect.coords.y = y + d3.event.dy;
  Rect.set(rect);
  repositionHandle("anno-top-left");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-top-right");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
}

function bottomLeftDragResize() {
  var rect = Rect.get(),
      x = rect.coords.x,
      w = rect.width,
      h = rect.height;
  annotationsBg.style({
    "width": w - d3.event.dx + "px",
    "height": h + d3.event.dy + "px",
    "left": x + d3.event.dx + "px"
  });
  rect.width = w - d3.event.dx;
  rect.height = h + d3.event.dy;
  rect.coords.x = x + d3.event.dx;
  Rect.set(rect);
  repositionHandle("anno-top-left");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
  repositionHandle("anno-bottom-left");
  repositionHandle("anno-bottom-middle");
  repositionHandle("anno-bottom-right");
}

function bottomRightDragResize() {
  var rect = Rect.get(),
      w = rect.width,
      h = rect.height;
  annotationsBg.style({
    "width": w + d3.event.dx + "px",
    "height": h + d3.event.dy + "px",
  });
  rect.width = w + d3.event.dx;
  rect.height = h + d3.event.dy;
  Rect.set(rect);
  repositionHandle("anno-top-right");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
  repositionHandle("anno-bottom-left");
  repositionHandle("anno-bottom-middle");
  repositionHandle("anno-bottom-right");
}

function topLeftDragResize() {
  var rect = Rect.get(),
      x = rect.coords.x,
      y = rect.coords.y,
      w = rect.width,
      h = rect.height;
  annotationsBg.style({
    "width": w - d3.event.dx + "px",
    "height": h - d3.event.dy + "px",
    "top": y + d3.event.dy + "px",
    "left": x + d3.event.dx + "px"
  });
  rect.width = w - d3.event.dx;
  rect.height = h - d3.event.dy;
  rect.coords.x = x + d3.event.dx;
  rect.coords.y = y + d3.event.dy;
  Rect.set(rect);
  repositionHandle("anno-top-left");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-top-right");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
  repositionHandle("anno-bottom-left");
  repositionHandle("anno-bottom-middle");
}

function topRightDragResize() {
  var rect = Rect.get(),
      y = rect.coords.y,
      w = rect.width,
      h = rect.height;
  annotationsBg.style({
    "width": w + d3.event.dx + "px",
    "height": h - d3.event.dy + "px",
    "top": y + d3.event.dy + "px",
  });
  rect.width = w + d3.event.dx;
  rect.height = h - d3.event.dy;
  rect.coords.y = y + d3.event.dy;
  Rect.set(rect);
  repositionHandle("anno-top-left");
  repositionHandle("anno-top-middle");
  repositionHandle("anno-top-right");
  repositionHandle("anno-middle-left");
  repositionHandle("anno-middle-right");
  repositionHandle("anno-bottom-middle");
  repositionHandle("anno-bottom-right");
}

// TODO:
// - being able to add/delete individual annotation units, hover over for remove prompt?
//   perhaps it's treated in a list instead?
// - field for adding text to annotation
// - setting box anchors and recalculating positions with those anchors
// - checks to ensure that you can't make the width or height less than something like 10px
// - text alignment?
// - options for adding other types of annotations (arrows, ranges, etc.)

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

    if (event.drag.type === "dragstart") {

      d3.select(".annotations-container").remove();

      var rect = Rect.get();

      var svgClientRect = event.currentTarget.getBoundingClientRect();

      var header = d3.select("." + prefix + "chart_title");

      if (header.text() === "") {
        var headerHeight = 0;
      } else {
        var headerHeight = header.node().getBoundingClientRect().height;
      }

      rect.coords = {
        x: event.clientX - svgClientRect.left,
        y: event.clientY - svgClientRect.top + headerHeight
      };

      rect.width = 0;
      rect.height = 0;

      // create element
      annotationsBg = d3.select(event.currentTarget.parentNode)
        .append("div")
        .attr("class", "annotations-container")
        .append("div")
        .attr("class", "annotations-background")
        .style({
          "top": rect.coords.y + "px",
          "left": rect.coords.x + "px",
          "width": rect.width,
          "height": rect.height
        });

      Rect.set(rect);

    }

    if (event.drag.type === 'dragging' || event.drag.type === 'dragend') {
      // update width and height
      // update element
      var rect = Rect.get();

      rect.width += event.drag.dx;
      rect.height += event.drag.dy;

      annotationsBg.style({
        "width": rect.width + "px",
        "height": rect.height + "px"
      });

      Rect.set(rect);

      if (event.drag.type === 'dragend') {
        createAnnotationGroup();
      }

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
