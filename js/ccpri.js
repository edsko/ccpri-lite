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

/* Selected date (set in `init`) */
var selectedDate = null;

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

  selectedDate = new Date();

  markSelectedFields();
  updateDateField();
}

/*
 * Mark selected elements based on the current value of `selected`
 */
function markSelectedFields() {
  for (var field in selected) {
    setFieldState(field, "selected");
  }
}

/*
 * Update the UI to reflect the value of `selectedDate`
 */
function updateDateField() {
  var elem  = document.getElementById("selectedDate");
  var day   = selectedDate.getDate()
  var month = selectedDate.getMonth() + 1;
  var year  = selectedDate.getFullYear();
  elem.innerHTML = day + "-" + month + "-" + year;
}

/*
 * Change button state for the specified field
 *
 * `state` should be "selected" or "unselected"
 */
function setFieldState(field, state) {
 var value = selected[field];
 var type  = types[field];
 var elem  = document.getElementById(field + "-" + value);
 elem.src = "img/buttons/" + state + "/" + type + "/" + value + ".jpg";
}

/*
 * Update `selected` in response to user selection
 */
function select(field, value) {
  setFieldState(field, "unselected");
  selected[field] = value;
  setFieldState(field, "selected");
}
