function init() {
  // Get receipt contents from parent
  var receipt = window.opener.receipt;
  document.getElementById("receipt").innerHTML = "receipt: " + receipt;
  window.print();
  window.close();
}
