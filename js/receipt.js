function init() {
  // Get receipt contents from parent
  var receipt = window.opener.receipt;
  for(var field in receipt) {
    var value = receipt[field];
    var elem  = document.getElementById(field);
    elem.innerHTML = value;
  }

  // Print and close
  // To avoid any dialogues, can enable Chrome's --kiosk-printing mode
  window.print();
  window.close();
}
