/*
 * CCPRI Lite
 */

var version = "0.1";

/*
 * Constants
 */

// Prices
var prices = {
    "adult": 10.0
  , "child": 5.0
  , "electricity": 5
  }

// Types of the fields on the main screen
var types = {
    "type"        : "type"
  , "nationality" : "nationality"
  , "nights"      : "int"
  , "adults"      : "int"
  , "children"    : "int"
  , "electricity" : "bool"
  };

// Standard field values (for fields supporting freeform input)
var standardValues = {
    "nationality" : ["01-IE", "02-NI", "03-UK", "04-D", "05-NL", "06-F", "07-SP", "08-I", "09-B", "10-A"]
  , "nights"      : ["000" , "001" , "002" , "003" , "004" , "005" , "006" , "007" , "008" , "009"]
  };

// All available screens
var allScreens = ["main", "receipt"];

// Header buttons required per screen
var headerButtons = {
    "main"    : ["Ok"]
  , "receipt" : ["Cancel", "Print"]
  };

// Debugging only: show all screens at once
var showAllScreens = true;

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

// Current totals (set in 'recomputeTotals')
var totals = null;

/*
 * Get UI elements
 */

// Get UI element corresponding to a (standard) value of a field
function getFieldButton(field, value) {
  return document.getElementById(field + "-" + value);
}

// Get UI element corresponding to the freeform value of a field
function getFreeformButton(field) {
  return document.getElementById(field + "-freeform-select");
}

// Get screen
function getScreen(name) {
  return document.getElementById("screen" + "-" + name);
}

/*
 * Switch screens
 */

function selectScreen(newScreen) {
  for(const oldScreen of allScreens) {
    getScreen(oldScreen).style.display = "none";
  }

  getScreen(newScreen).style.display = "block";
  var headerButtonsDiv = document.getElementById("headerButtons");
  headerButtonsDiv.innerHTML = "";
  for(const button of headerButtons[newScreen]) {
    headerButtonsDiv.innerHTML += "<button type=\"button\" onClick=\"clickedHeaderButton('" + newScreen + "', '" + button + "');\">" + button + "<\/button>";
  }
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

  selectedDate = new Date();

  markSelectedFields();
  updateDateField();
  showPrices();
  recomputeTotals();

  if(!showAllScreens) {
    selectScreen("receipt");
  } else {
    for(const screenName of allScreens) {
      getScreen(screenName).style.display = "block";
    }
  }
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
  recomputeTotals();
}

/*
 * Select freeform value of a field
 */
function freeformSelect(field) {
  var newValue = document.getElementById(field + "-freeform").value;
  updateFieldState(field, selected[field], newValue);
  selected[field] = newValue;
  recomputeTotals();
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

/*
 * Respond to a header button
 */
function clickedHeaderButton(curScreen, button) {
  switch(curScreen) {
    case "main":
      switch(button) {
        case "Ok":
          selectScreen("receipt");
          break;
      }
      break;
    case "receipt":
      switch(button) {
        case "Cancel":
          selectScreen("main");
      }
      break;
  }
}

/*
 * Convert selected values to integers
 */
function convertSelected() {
  return {
      "nights"      : parseInt(selected["nights"])
    , "adults"      : parseFloat(selected["adults"])
    , "children"    : parseFloat(selected["children"])
    , "electricity" : selected["electricity"] == 'true' ? 1 : 0
    };
}

/*
 * Compute prices, given converted selected values (see `convertSelected`)
 */
function computeTotals(converted) {
   var perNightAdult       = converted["adults"]      * prices["adult"]
   var perNightChild       = converted["children"]    * prices["child"]
   var perNightElectricity = converted["electricity"] * prices["electricity"]
   var perNight            = perNightAdult + perNightChild + perNightElectricity;
   var total               = converted["nights"]      * perNight;

   return {
      "per-night-adult"       : perNightAdult
    , "per-night-child"       : perNightChild
    , "per-night-electricity" : perNightElectricity
    , "per-night"             : perNight
    , "overall"               : total
    };
}

/*
 * Recompute totals and update the UI
 */
function recomputeTotals() {
  var converted = convertSelected();
  for(var field in converted) {
    var value = converted[field];
    var elem  = document.getElementById("selected-" + field);
    elem.innerHTML = value;
  }

  // totals is a global var
  totals = computeTotals(converted);
  for(var field in totals) {
    var value = totals[field];
    var elem  = document.getElementById("total-" + field);
    elem.innerHTML = value.toFixed(2);
  }
}

/*
 * Update UI with prices
 *
 * Prices cannot be fixed in the UI itself, so doing this once suffices
 */
function showPrices () {
  for(var category in prices) {
    let price = prices[category];
    let elem  = document.getElementById("price-" + category);
    elem.innerHTML = price.toFixed(2);
  }
}

/*
 * Respond to calculator buttons
 */
function calculatorPress(button) {
  var receivedElem = document.getElementById("received");
  var received     = receivedElem.value;

  // Avoid unnecessary initial 0 ("01")
  if(received == "0") {
    received = "";
  }

  switch(button) {
    // Most buttons modify the value
    case "000": received += "0"; break;
    case "001": received += "1"; break;
    case "002": received += "2"; break;
    case "003": received += "3"; break;
    case "004": received += "4"; break;
    case "005": received += "5"; break;
    case "006": received += "6"; break;
    case "007": received += "7"; break;
    case "008": received += "8"; break;
    case "009": received += "9"; break;
    case "dot": received += "."; break;

    // The other buttons reset the value
    case "cross": received =   "0"; break;
    case "010":   received =  "10"; break;
    case "020":   received =  "20"; break;
    case "050":   received =  "50"; break;
    case "100":   received = "100"; break;
  }

  receivedElem.value = received;

  // Update change
  var change     = parseFloat(received) - totals["overall"];
  var changeElem = document.getElementById("change");

  if(change >= 0) {
    changeElem.innerHTML = change.toFixed(2);
  } else {
    changeElem.innerHTML = "<span style=\"color: maroon;'\">" + change.toFixed(2) + "</span>";
  }
}
