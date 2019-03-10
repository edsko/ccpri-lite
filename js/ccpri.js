/*
 * CCPRI Lite
 */

var version = "0.1";

function init() {
  console.log("CCPRI Lite " + version);

  if(typeof(Storage) !== undefined) {
    console.log("Web Storage supported");
  } else {
    console.log("ERROR: Web Storage unsupported");
  }
}
