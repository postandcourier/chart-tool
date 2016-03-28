// var Positioning = new ReactiveVar({
//   start: {
//     x: "",
//     y: ""
//   },
//   finish: {
//     x: "",
//     y: ""
//   }
// });

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
  "drag .desktop-preview": function(event) {

    // d3.select(".drag-container").remove();

    var cont = d3.select(".desktop-preview")
      .append("div")
      .attr("class", "drag-container")
      .style({
        "background-color": "red",
        "width": 0,
        "height": 0
      });

    if (event.drag.type === 'dragstart') {


    } else if (event.drag.type === 'dragend') {


    } else if (event.drag.type === 'dragging') {

      // drag.x = drag.x + event.drag.dx;
      // drag.y = drag.y + event.drag.dx;

      // console.log(drag.x);

      cont.style({
        "width": function() {
          return d3.select(this).style("width") + event.drag.dx;
        },
        "height": function() {
          return d3.select(this).style("height") + event.drag.dy;
        }
      });



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
      drawPreviews(data);
    }

  });
}
