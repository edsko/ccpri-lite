/*
 * CCPRI Lite
 */

var version = "0.1";

/*
 * Setup
 */

/* Types of the fields on the main screen */
var types = {
    "type":        "type"
  , "nationality": "nationality"
  , "nights":      "int"
  , "adults":      "int"
  , "children":    "int"
  , "electricity": "bool"
  }

/*
 * Global variables
 */

/* Currently selected values */
var selected = {
    "type":        "5-caravan"
  , "nationality": "01-IE"
  , "nights":      "000"
  , "adults":      "000"
  , "children":    "000"
  , "electricity": "false"
  }

/*
 * Initialize
 */
function init() {
  console.log("CCPRI Lite " + version);

  if(typeof(Storage) !== undefined) {
    console.log("Web Storage supported");
  } else {
    console.log("ERROR: Web Storage unsupported");
  }

  markSelected();
}

/*
 * Mark selected elements based on the current value of `selected`
 */
function markSelected() {
  for (var field in selected) {
    let value = selected[field];
    let type  = types[field];
    let elem  = document.getElementById(field + "-" + value);
    elem.src = "img/buttons/selected/" + type + "/" + value + ".jpg";
  }
}

/*
 * Deselect old value
 */
function unmarkSelectedField(field) {
  var value = selected[field];
  var type  = types[field];
  var elem  = document.getElementById(field + "-" + value);
  elem.src = "img/buttons/unselected/" + type + "/" + value + ".jpg";
}

/*
 * Update `selected` in response to user selection
 */
function select(field, value) {
  unmarkSelectedField(field);
  selected[field] = value;
  markSelected();
}
