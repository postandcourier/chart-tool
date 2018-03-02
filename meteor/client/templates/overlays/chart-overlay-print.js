Template.chartOverlayPrint.helpers({
  isChecked: function(val) {
    if (this.print.columns === val) {
      return "checked";
    }
  },
  print_data: function() {
    return Charts.findOne(this._id);
  },
  printDefaults: function() {
    if (app_settings) {
      return app_settings.print;
    }
  },
  modeIsActive: function(type) {
    if (this.print) {
      if (this.print.mode) {
        return type === this.print.mode;
      } else {
        return type === 'columns';
      }
    }
  },
  activeMode: function(type) {
    if (this.print) {
      if (this.print.mode) {
        return type === this.print.mode ? 'active' : '';
      } else {
        return type === 'columns' ? 'active' : '';
      }
    }
  },
  defaultMM: function(type) {
    if (this.print.mode === 'millimetres') {
      if (!this.print[type]) {
        return app_settings.print.column_width;
      } else {
        return this.print[type];
      }
    }
  },

});

Template.chartOverlayPrint.events({
  "change .input-radio": function(event) {
    var size = event.target.value;
    updateAndSave("updatePrintCols", this, size);
  },
  "change .input-lines": function(event) {
    var input = event.target.value;

    if (isNumber(input) && input > 0) {
      // making sure people won't put in fractions or something crazy. only integers, pls
      var lines = Math.round(input);
      updateAndSave("updatePrintLines", this, lines);
    } else {
      sweetAlert({
        title: "Bad line depth value.",
        text: "Line depth must be positive and an integer.",
        type: "error",
        confirmButtonColor: "#fff"
      });
    }
  },
  "click .print-export-button_jpg": function(event) {
    downloadJpg(this);
  },
  "click .print-export-button_pdf": function(event) {
    event.target.parentElement.submit();
  },
  "click .print-export-mode-button": function(event) {
    updateAndSave("updatePrintMode", this, event.target.textContent.toLowerCase());
  },
  "change .input-width": function(event) {
    updateAndSave("updatePrintMMWidth", this, Number(event.target.value));
  },
  "change .input-height": function(event) {
    updateAndSave("updatePrintMMHeight", this, Number(event.target.value));
  }
});

Template.chartOverlayPrint.rendered = function() {
  Tracker.autorun(function(comp) {
    var data = Router.current() && Router.current().data();
    var routeName = Router.current().route.getName();

    if (!data && (routeName !== "chart.edit")) {
      comp.stop();
      return;
    }

    if (data) {

      var width, height;

      var magicW = app_settings.print.magic.width,
          magicH = app_settings.print.magic.height;

      if (data.print.mode === 'millimetres') {
        width = data.print.width * magicW;
        height = data.print.height * magicH;
      } else {
        width = determineWidth(data.print.columns) * magicW;
        height = determineHeight(data.print.lines, width) * magicH;
      }

      data.exportable = {
        width: width,
        height: height,
        dynamicHeight: true,
        x_axis: app_settings.print.x_axis,
        y_axis: app_settings.print.y_axis,
        margin: app_settings.print.margin,
        type: "pdf",
        barLabelOffset: app_settings.print.barLabelOffset
      };

      data.prefix = prefix;

      Tracker.autorun(function(drawComp) {
        var containerExists = d3.select(".print-export-preview-chart").node();
        if (!containerExists) {
          drawComp.stop();
          return;
        }

        d3.select(".print-export-preview-chart")
          .style("width", width + "px");

        // silly hack to make sure chart isn't drawn when overlay is still display: none;
        if (Session.get("overlay-visible")) {
          setTimeout(function() {
            drawChart(".print-export-preview-chart", data);
          }, 100);
        }

      });

    }

  });
}
