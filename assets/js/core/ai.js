import { app, model } from "./live2d.js";

let inputan = document.getElementById("input");
let go = document.querySelectorAll("#input, .mic, .send");

function fetchAI(strg) {
  console.log("string fetch: ", strg);
  // Ganti spasi dengan %20
  const prompt = encodeURIComponent(strg);
  console.log("prompt: ", prompt);
  
  // Buat URL dengan prompt yang sudah diubah
  const url = `https://api.nyxs.pw/ai/gemini-advance?text=${prompt}`;

  // Menggunakan fetch API
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.status) {
        let results = data.result;
        speak(results);
        document.getElementById("chatbot").innerHTML = '<div class="label">Megumi</div><div class="sub">' + results + '</div>';
        down();
        // Output result to console
        console.log('Result:', results);
      } else {
        console.error('Response status is false');
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      //sementara
      alert("maaf AI sedang error");
    });
}

// Add helper function to check speech recognition support
function checkSpeechRecognitionSupport() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

try {
  const inner = document.getElementsByClassName("active-mic");
  const outter = document.getElementsByClassName("active-outter-mic");
  
  if (!checkSpeechRecognitionSupport()) {
    throw new Error('Speech recognition not supported');
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'id-ID';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
  
    inputan.value = transcript;
    console.log(transcript);
  });
  recognition.addEventListener("start", (e) => {
    inner[0].classList.remove("none");
    outter[0].classList.remove("none");
  });
  recognition.addEventListener("end", (e) => {
    addChatbot();
    document.getElementById("user").innerHTML = '<div class="label">User</div><div class="sub">' + inputan.value + '</div>';
    down();
    fetchAI(inputan.value);
    inner[0].classList.add("none");
    outter[0].classList.add("none");
  });
  
  const buttons = document.querySelectorAll(".mic, .send");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.className === "mic") {
          recognition.start();
          go.forEach((goes) => {
            goes.disabled = true;
          });
      } else if (button.className === "send" && inputan.value.trim() !== '') {
          addChatbot();
          fetchAI(inputan.value);
          document.getElementById("user").innerHTML = '<div class="label">User</div><div class="sub">' + inputan.value + '</div>';
          down();
          setTimeout(() => {
            inputan.value = "";
            go.forEach((goes) => {
              goes.disabled = true;
            });
          }, 100);
      }
    });
  });
  console.log("input luaran: ", inputan.value);
  document.querySelector("#input").addEventListener("keypress", function (e) {
    let key = e.which || e.keyCode;
    if (key === 13 && inputan.value.trim() !== '') {
      //Enter button
      addChatbot();
      console.log("input dalam: ", inputan.value);
      fetchAI(inputan.value);
      document.getElementById("user").innerHTML = '<div class="label">User</div><div class="sub">' + inputan.value + '</div>';
      down();
      setTimeout(() => {
        inputan.value = "";
        go.forEach((goes) => {
          goes.disabled = true;
        });
      }, 100);
    }
  });
} catch (error) {
  console.error('Speech recognition error:', error);
  // Hide mic button if speech recognition is not supported
  const micButton = document.querySelector('.mic');
  if (micButton) {
    micButton.style.display = 'none';
  }
}

function tapMotion() {
  model.motion('speak');
}
// Menambahkan fungsi tapMotion ke ticker
let tapMotionTickerFunction = () => app.ticker.add(tapMotion);

// Menghapus fungsi tapMotion dari ticker
let removeTapMotion = () => app.ticker.remove(tapMotion);

function speak(string) {
  console.log("string luarin: ", string);
  let voiceGetter = setInterval(function () {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length !== 0) {
      console.log("string dalami: ", string);
      let utterance = new SpeechSynthesisUtterance();
      window.speechSynthesis.cancel();
      utterance.text = string;
      utterance.lang = "id-ID";
      utterance.volume = 1; //0-1 interval
      utterance.rate = 0.8;
      utterance.pitch = 1; //0-2 interval
      utterance.voice = voices[182];
      let voiceName = new RegExp("gadis", "i");
  
      for (let i = 0; i < window.speechSynthesis.getVoices().length; i++) {
        if (window.speechSynthesis.getVoices()[i].voiceURI.search(voiceName) != -1) {
          utterance.voice = window.speechSynthesis.getVoices()[i];
        }
      }
  
      speechSynthesis.speak(utterance);
      let r = setInterval(() => {
        console.log(speechSynthesis.speaking);
        if (!speechSynthesis.speaking) {
          clearInterval(r);
        } else {
          speechSynthesis.resume();
        }
      }, 14000);
      utterance.addEventListener("start", (e) => {
        tapMotionTickerFunction();
        console.log("start speaking");
        go.forEach((goes) => {
          goes.disabled = true;
        });
      });
      utterance.addEventListener("end", (e) => {
        removeTapMotion();
        go.forEach((goes) => {
          goes.disabled = false;
        });
        chatbotDiv.id = "chatbot" + count;
        userDiv.id = "user" + count;
        console.log("Utterance has finished being spoken after " + e.elapsedTime + " milliseconds.");
        inputan.value = "";
      });
      clearInterval(voiceGetter);
    }
  }, 200);
}

//Menambahkan bubble text
const mainDiv = document.getElementById("chat-box");
let count = 0;
let chatbotDiv;
let userDiv;

function addChatbot() {
  count++;
  userDiv = document.createElement("div");
  userDiv.id = "user";
  userDiv.className = "user";
  mainDiv.appendChild(userDiv);

  chatbotDiv = document.createElement("div");
  chatbotDiv.id = "chatbot";
  chatbotDiv.className = "chatbot";
  mainDiv.appendChild(chatbotDiv);
}

function down() {
  let elem = document.getElementById('chat-box');
  elem.scrollTop = elem.scrollHeight;
}
