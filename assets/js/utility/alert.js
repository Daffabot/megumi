// CustomAlert class definition
function CustomAlert() {
  this.messageQueue = [];
  this.isShowing = false;

  this.alert = function (message, title) {
    // Add message to queue
    this.messageQueue.push({ message, title });
    
    // If not currently showing an alert, show the next one
    if (!this.isShowing) {
      this.showNext();
    }
  };

  this.showNext = function() {
    if (this.messageQueue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const { message, title } = this.messageQueue[0];

    // Hapus dialog lama jika ada
    const oldOverlay = document.getElementById("dialogoverlay");
    const oldBox = document.getElementById("dialogbox");
    if (oldOverlay) oldOverlay.remove();
    if (oldBox) oldBox.remove();

    // Buat overlay dan dialogbox tanpa menghapus isi body
    const overlay = document.createElement("div");
    overlay.id = "dialogoverlay";
    const dialogbox = document.createElement("div");
    dialogbox.id = "dialogbox";
    dialogbox.className = "slit-in-vertical";
    dialogbox.innerHTML = `
      <div>
        <div id="dialogboxhead"></div>
        <div id="dialogboxbody"></div>
        <div id="dialogboxfoot"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(dialogbox);

    let winH = window.innerHeight;
    overlay.style.height = winH + "px";
    dialogbox.style.top = "100px";

    overlay.style.display = "block";
    dialogbox.style.display = "block";

    const head = dialogbox.querySelector("#dialogboxhead");
    if (typeof title === "undefined") {
      head.style.display = "none";
    } else {
      head.style.display = "block";
      head.innerHTML = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + title;
    }
    dialogbox.querySelector("#dialogboxbody").innerHTML = message;
    dialogbox.querySelector("#dialogboxfoot").innerHTML = '<button class="pure-material-button-contained" id="closed" onclick="window.yes()">OK</button>';
  };

  this.close = function() {
    document.getElementById("dialogbox").style.display = "none";
    document.getElementById("dialogoverlay").style.display = "none";
    
    // Remove the shown message from queue
    this.messageQueue.shift();
    
    // Show next message if any
    setTimeout(() => this.showNext(), 300);
  };
}

// Global instance
const customAlert = new CustomAlert();

function errorMessage(message) {
  customAlert.alert(message, "Error!");
}

function warningMessage(message) {
  customAlert.alert(message, "Peringatan!");
}

window.addEventListener("DOMContentLoaded", function () {
  function checker() {
    if (navigator.onLine) {
      console.log("User terhubung dengan koneksi internet");
    } else {
      warningMessage("Tolong cek koneksi internet anda, beberapa fitur mungkin tidak akan berfungsi.");
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

// Make yes function globally available
function yes() {
  customAlert.close();
}

// Add to window object
window.yes = yes;

// Export without yes since we made it global
export { errorMessage, warningMessage };