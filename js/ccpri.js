/*
 * CCPRI Lite
 */

var version = "0.1";

/*
 * Constants
 */

// Types of the fields on the main screen
var types = {
    "type"        : "type"
  , "nationality" : "nationality"
  , "nights"      : "int"
  , "adults"      : "int"
  , "children"    : "int"
  , "electricity" : "bool"
  }

// Standard field values (for fields supporting freeform input)
var standardValues = {
    "nationality" : ["01-IE", "02-NI", "03-UK", "04-D", "05-NL", "06-F", "07-SP", "08-I", "09-B", "10-A"]
  , "nights"      : ["000" , "001" , "002" , "003" , "004" , "005" , "006" , "007" , "008" , "009"]
  }

/*
 * Global variables
 */

// Currently selected values
var selected = {
    "type"        : "5-caravan"
  , "nationality" : "01-IE"
  , "nights"      : "000"
  , "adults"      : "000"
  , "children"    : "000"
  , "electricity" : "false"
  }

// Selected date (set in `init`)
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
 * Check if `value` is a standard value for the given field
 *
 * `false` if the user entered freeform text
 */
function isStandardValue(field, value) {
  if(standardValues[field] == null) {
    // This field does not support freeform input
    return true;
  } else {
    return standardValues[field].includes(value);
  }
}

/*
 * Mark selected elements based on the current value of `selected`
 */
function markSelectedFields() {
  for (var field in selected) {
    setFieldState(field, selected[field], "selected");
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
 * Get UI element corresponding to a value of a field
 *
 * This only applies to standard values.
 */
function getFieldButton(field, value) {
  return document.getElementById(field + "-" + value);
}

/*
 * Get UI element corresponding to the freeform value of a field
 */
function getFreeformButton(field) {
  return document.getElementById(field + "-freeform-select");
}

/*
 * Get image corresponding to the given value
 *
 * `state` should be "selected" or "unselected"
 * This only applies to standard values.
 */
function getImageForValue(field, value, state) {
  var type = types[field];
  return "img/buttons/" + state + "/" + type + "/" + value + ".jpg";
}

/*
 * Change button state for the specified field
 *
 * `oldValue` may be null
 */
function setFieldState(field, value, state) {
  if(isStandardValue(field, value)) {
    var elem = getFieldButton(field, value);
    elem.src = getImageForValue(field, value, state);
  } else {
    var elem = getFreeformButton(field);
    elem.src = "img/buttons/" + state + "/arrows/right.jpg";
  }
}

/*
 * Update UI in response to a value change
 */
function updateFieldState(field, oldValue, newValue) {
  setFieldState(field, oldValue, "unselected");
  setFieldState(field, newValue, "selected");
}

/*
 * Update `selected` in response to user selection
 */
function select(field, newValue) {
  updateFieldState(field, selected[field], newValue);
  selected[field] = newValue;
}

/*
 * Select freeform value of a field
 */
function freeformSelect(field) {
  var newValue = document.getElementById(field + "-freeform").value;
  updateFieldState(field, selected[field], newValue);
  selected[field] = newValue;
}

/*
 * Focus the freeform field and use it's value
 */
function freeformFocus(field) {
  var elem = document.getElementById(field + "-freeform")
  elem.focus();
  freeformSelect(field);
}

/*
 * Change the date
 *
 * `delta` should be +1 (next day) or -1 (previous day)
 */
function moveDate(delta) {
  selectedDate.setDate(selectedDate.getDate() + delta);
  updateDateField();
}
