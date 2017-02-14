export default function annotation(node, obj, rendered) {

  const annoData = obj.annotations;

  if (annoData.highlight && annoData.highlight.length) {
    highlight(node, obj, rendered);
  }

  if (annoData.text && annoData.text.length) {
    text(node, obj, rendered);
  }

  if (annoData.range && annoData.range.length) {
    range(node, obj, rendered);
  }

}

function highlight(node, obj, rendered) {

  // one more check that it is a single series
  // apply local bar or column color change here!
  debugger;
}

function text(node, obj, rendered) {

}

function range(node, obj, rendered) {

}
