Template.chartDesktopPreview.rendered = function() {
  this.data.editable = true;
  drawChart(".desktop-preview-container", this.data);
}

// Template.chartMobilePreview.rendered = function() {
//   this.data.editable = true;
//   drawChart(".mobile-preview-container", this.data);
// }
