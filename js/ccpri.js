/*
 * CCPRI Lite
 */

var version = "March 10, 2019";

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
var allScreens = ["main", "receipt", "leaving"];

// Header buttons required per screen
var headerButtons = {
    "main"    : ["Ok", "Leaving"]
  , "receipt" : ["Cancel", "Print"]
  , "leaving" : ["Ok"]
  };

// Debugging only: show all screens at once
var showAllScreens = false;

// Default selected (for initial screen and after taking a booking)
var defaultSelected = {
    "type"        : "5-caravan"
  , "nationality" : "01-IE"
  , "nights"      : "000"
  , "adults"      : "000"
  , "children"    : "000"
  , "electricity" : "false"
  }

/*
 * Global variables
 */

// Currently selected values (set in `init`)
var selected = null;

// Selected date (set in `init`)
var selectedDate = null;

// Current booking in progress (set in 'recomputeTotals')
var booking = null;

// IndexedDB (set in 'init')
var db = null;

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
 * Util
 */

function formatCurrency(value) {
  return value.toFixed(2);
}

function formatDate(date) {
  var day   = date.getDate()
  var month = date.getMonth() + 1;
  var year  = date.getFullYear();
  return day + "-" + month + "-" + year;
}

function advanceDate(date, delta) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate() + delta);
  return newDate;
}

/*
 * Switch screens
 */

function selectScreen(newScreen) {
  for(const oldScreen of allScreens) {
    if(!showAllScreens) {
      getScreen(oldScreen).style.display = "none";
    } else {
      getScreen(oldScreen).style.display = "block";
    }
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
  document.getElementById("version").innerHTML = version;

  openDB();

  selectedDate = new Date();

  resetMainScreen();
  updateDateField();
  showPrices();
  recomputeTotals();

  selectScreen("main");
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
 * Reset the main booking screen
 */
function resetMainScreen() {
  document.getElementById("identification").value = "";

  if(selected) {
    for (var field in selected) {
      setFieldState(field, selected[field], "unselected");
    }
  }

  selected = {};
  for (var field in defaultSelected) {
    selected[field] = defaultSelected[field];
    setFieldState(field, selected[field], "selected");
  }

  recomputeTotals();
}

/*
 * Update the UI to reflect the value of `selectedDate`
 */
function updateDateField() {
  var elem = document.getElementById("selectedDate");
  elem.innerHTML = formatDate(selectedDate);
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
  selectedDate = advanceDate(selectedDate, delta);
  updateDateField();
  recomputeTotals();
}

/*
 * Respond to a header button
 */
function clickedHeaderButton(curScreen, button) {
  switch(curScreen) {
    case "main":
      switch(button) {
        case "Ok": selectScreen("receipt"); break;
        case "Leaving": showLeaving(); break;
      }
      break;
    case "receipt":
      switch(button) {
        case "Cancel": selectScreen("main"); break;
        case "Print": confirmBooking(); break;
      }
      break;
    case "leaving":
      switch(button) {
        case "Ok": selectScreen("main"); break;
      }
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

  var totals = computeTotals(converted);
  for(var field in totals) {
    var value = totals[field];
    var elem  = document.getElementById("total-" + field);
    elem.innerHTML = formatCurrency(value);
  }

  // update the global booking
  // we format the dates here because we don't want time info
  booking = {
      "id"          : document.getElementById("identification").value
    , "type"        : selected["type"]
    , "nationality" : selected["nationality"]
    , "selected"    : converted
    , "arrival"     : formatDate(selectedDate)
    , "departure"   : formatDate(advanceDate(selectedDate, converted["nights"]))
    , "totals"      : totals
    };

  document.getElementById("arrival").innerHTML   = booking["arrival"];
  document.getElementById("departure").innerHTML = booking["departure"];
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
    elem.innerHTML = formatCurrency(price);
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
    changeElem.innerHTML = formatCurrency(change);
  } else {
    changeElem.innerHTML = "<span style=\"color: maroon;'\">" + formatCurrency(change) + "</span>";
  }
}

/*
 * Confirm a booking
 *
 * Add it to the application state, print receipt, back to home screen
 */
function confirmBooking() {
  var tx = db.transaction(["bookings"], "readwrite");
  tx.oncomplete = function(event) {
    resetMainScreen();
    selectScreen('main');
  }
  tx.onerror = function(event) {
    alert("Failed to write booking to the DB");
  }
  var objectStore = tx.objectStore("bookings");
  objectStore.add(booking);
}

/*
 * Open the indexedDB
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 */
function openDB() {
  if(!window.indexedDB) {
    alert("ERROR: No IndexedDB support");
    return;
  }

  var version = 1;
  var request = window.indexedDB.open("ApplicationState", version);
  request.onerror = function(event) {
    alert("Unable to open the DB. Perhaps permission problem?");
  };
  request.onsuccess = function(event) {
    console.log("DB initialized");
    db = event.target.result;
  };
  request.onupgradeneeded = function(event) {
    console.log("Upgrading database");
    var db       = event.target.result;
    var objStore = db.createObjectStore("bookings", { autoIncrement: true });
    objStore.createIndex("departure", "departure", { unique: false });
  }
}

/*
 * Update and then switch to the leaving screen
 */
function showLeaving() {
  var elemNumLeaving        = document.getElementById("numLeaving");
  var elemLeavingDate       = document.getElementById("leavingDate");
  var elemNumRegKnown       = document.getElementById("numRegKnown");
  var elemNumRegUnknown     = document.getElementById("numRegUnknown");
  var elemLeavingRegKnown   = document.getElementById("leavingRegKnown");
  var elemLeavingRegUnknown = document.getElementById("leavingRegUnknown");

  var departure = formatDate(selectedDate);
  elemLeavingDate.innerHTML = departure;

  var objStore = db.transaction("bookings").objectStore("bookings");
  var index    = objStore.index("departure");

  var numRegKnown       = 0;
  var numRegUnknown     = 0;
  var leavingRegKnown   = "";
  var leavingRegUnknown = "";

  index.openCursor(IDBKeyRange.only(departure)).onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      var entry = cursor.value;
      if(entry["id"] == "") {
        numRegUnknown++;
        leavingRegUnknown += "<li>" + formatBooking(entry) + "</li>";
      } else {
        numRegKnown++;
        leavingRegKnown += "<li>" + formatBooking(entry) + "</li>";
      }
      cursor.continue();
    } else {
      // Processed all elements
      elemNumLeaving.innerHTML        = numRegKnown + numRegUnknown;
      elemNumRegKnown.innerHTML       = numRegKnown;
      elemNumRegUnknown.innerHTML     = numRegUnknown;
      elemLeavingRegKnown.innerHTML   = leavingRegKnown;
      elemLeavingRegUnknown.innerHTML = leavingRegUnknown;
      selectScreen('leaving');
    }
  }
}

/*
 * Format a booking for an entry in the leaving list
 */
function formatBooking(entry) {
  var selected = entry["selected"];

  return entry["type"].substring(2) + " "
       + selected["adults"] + "+"
       + selected["children"]
       + (selected["electricity"] > 0 ? "+E" : "") + " "
       + "(" + selected["nights"] + ")"
       ;
}
