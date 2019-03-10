function init() {
  // Get receipt contents from parent
  var receipt = window.opener.receipt;
  document.getElementById("receipt").innerHTML = "receipt: " + receipt;

  // Print and close
  // To avoid any dialogues, can enable Chrome's --kiosk-printing mode
  window.print();
  window.close();
}
