// CustomAlert class definition
function CustomAlert() {
  this.alert = function (message, title) {
    document.body.innerHTML = document.body.innerHTML + '<div id="dialogoverlay"></div><div id="dialogbox" class="slit-in-vertical"><div><div id="dialogboxhead"></div><div id="dialogboxbody"></div><div id="dialogboxfoot"></div></div></div>';

    let dialogoverlay = document.getElementById("dialogoverlay");
    let dialogbox = document.getElementById("dialogbox");

    let winH = window.innerHeight;
    dialogoverlay.style.height = winH + "px";

    dialogbox.style.top = "100px";

    dialogoverlay.style.display = "block";
    dialogbox.style.display = "block";

    document.getElementById("dialogboxhead").style.display = "block";

    if (typeof title === "undefined") {
      document.getElementById("dialogboxhead").style.display = "none";
    } else {
      document.getElementById("dialogboxhead").innerHTML = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + title;
    }
    document.getElementById("dialogboxbody").innerHTML = message;
    document.getElementById("dialogboxfoot").innerHTML = '<button class="pure-material-button-contained" id="closed" onclick="ok()">OK</button>';
  };
}

// Global instance
const customAlert = new CustomAlert();

function errorMessage(message) {
  customAlert.alert(message, "Error!");
}

window.addEventListener("DOMContentLoaded", function () {
  function checker() {
    if (navigator.onLine) {
      console.log("User terhubung dengan koneksi internet");
    } else {
      customAlert.alert("Tolong cek koneksi internet anda, beberapa fitur mungkin tidak akan berfungsi.", "Peringatan!");
      console.log("Anda offline");
    }
  }

  function once(fn, context) {
    let result;
    return function () {
      if (fn) {
        result = fn.apply(context || this, arguments);
        fn = null;
      }
      return result;
    };
  }

  let one = once(checker);
  one();
});

function yes() {
  document.getElementById("dialogbox").style.display = "none";
  document.getElementById("dialogoverlay").style.display = "none";
}

export { yes, errorMessage };