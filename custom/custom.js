/**
 * Custom code function that can be invoked to modify chart elements after chart drawing has occurred.
 * @param  {Object} node         The main container group for the chart.
 * @param  {Object} chartRecipe  Object that contains settings for the chart.
 * @param  {Object} rendered     An object containing references to all rendered chart elements, including axes, scales, paths, nodes, and so forth.
 * @return {Object}              Optional.
 */
export function custom(node, chartRecipe, rendered) {

  // With this function, you can access all elements of a chart and modify
  // them at will. For instance: you might want to play with colour
  // interpolation for a multi-series line chart, or modify the width and position
  // of the x- and y-axis ticks. With this function, you can do all that!

  // If you can, it's good Chart Tool practice to return references to newly
  // created nodes and d3 objects so they be accessed later — by a dispatcher
  // event, for instance.

  // d3.select(`.${chartRecipe.prefix}bg`)
  //   .attr('transform', `translate(0, 0)`)
  //   .attr('height', `${chartRecipe.dimensions.height()}`);

  // console.log(chartRecipe);
  // console.log(rendered);

  function moveToBack( nodeToMove ) {
    // get the actual DOM node for the container selection
    const theContainer = rendered.container.node();

    theContainer.removeChild(nodeToMove);
    theContainer.insertBefore(nodeToMove, theContainer.firstChild);
  }

  if (rendered.plot.xAxisObj) {
    moveToBack(rendered.plot.xAxisObj.node.node());
  }


  if ( chartRecipe.options.type === 'area' ) {
    console.log("custom.js | Area chart detected!");

    // send the series behind the axes for an area chart
    moveToBack( rendered.plot.seriesGroup.node() );
  }


  if ( rendered.plot.xAxisObj ) {
    const xAxis = rendered.plot.xAxisObj.node;

    node.selectAll('.ct-x-axis .tick line').attr('y1', chartRecipe.dimensions.yAxisHeight() * -1 );
  }

  //rendered.plot.xAxisObj.axis.tickSizeInner(-300);
  //rendered.plot.xAxisObj.axis.tickSizeInner(0);

  return;

}
