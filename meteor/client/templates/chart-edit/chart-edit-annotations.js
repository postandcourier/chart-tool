Template.chartEditAnnotations.helpers({
  displayHighlight: function() {
    if (this && this.data) {
      var ChartToolParser = ChartTool.parse,
        cleanCSV = dataParse(this.data),
        dataObj = ChartToolParser(cleanCSV, app_settings.chart.date_format, this.index);
      if (this.options.type === 'bar' || this.options.type === 'column') {
        return dataObj.seriesAmount === 1;
      } else {
        return false;
      }
    }
  },
  highlightColors: function() {
    if (app_settings) { return app_settings.highlightOptions; }
  },
  currentHighlights: function() {
    var annoData = Session.get('annotationData');
    return annoData.highlight;
  }
});

Template.chartEditAnnotations.events({
  'click .highlight-mode': function(event) {
    var annoData = Session.get('annotationData');
    annoData.type = (annoData.type === 'highlight') ? null : 'highlight';
    Session.set('annotationData', annoData);
  },
  'click .highlight-color': function(event) {
    var annoData = Session.get('annotationData'),
      color = event.currentTarget.getAttribute('data-color');
    annoData.type = 'highlight';
    annoData[annoData.type].push({ key: '__current__', color: color });
    Session.set('annotationData', annoData);
  },
  'click .edit-box.edit-annotations h3': function(event) {
    var el = d3.select(event.target).node().nextElementSibling,
      annoMode = Session.get('annotationMode');
    Session.set('annotationMode', !annoMode);
  }
});

// HIGHLIGHTING
// No highlighting on multiseries of any sort
//
// RANGES
// Should include a field where you can type the minimum and maximum value
// How do I handle ordinal-time data?

// BARS OR COLUMNS
// key, like 'Canada'
// aka rows
//
// LINE OR AREA
// column headings
//
// annotations = {
//   highlight: [
//     {
//       key: 'Canada',
//       color: '#HEX'
//     }
//   ],
//   range: [
//     {
//       mode: 'xAxis',
//       x1: 'DATE',
//       x2: 'DATE' // optional
//     },
//     {
//       mode: 'yAxis',
//       y1: 'DATE',
//       y2: 'DATE' // optional
//     }
//   ],
//   text: [
//     {
//       type: 'point',
//       x: '12%',
//       y: '14%',
//       alignment: 'tl'
//     },
//     {
//       type: 'area',
//       x1: '12%',
//       y1: 'derp',
//       x2: 'derp',
//       y2: 'derp',
//       alignment: 'tl'
//     }
//   ]
// };
