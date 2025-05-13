import { app, model } from "./live2d.js";
import { errorMessage, warningMessage } from "../utility/alert.js";

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
      warningMessage("Maaf AI sedang error");
    });
}

// Improved speech recognition check
function checkSpeechRecognitionSupport() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition);
}

const inner = document.getElementsByClassName("active-mic");
const outter = document.getElementsByClassName("active-outter-mic");

let recognition = null;

// Check support before trying to initialize
if (checkSpeechRecognitionSupport()) {
  try {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    recognition = new SpeechRecognitionAPI();
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
  } catch (error) {
    console.warn('Speech recognition error:', error);
  }
} else {
  console.warn('Speech recognition not supported in this browser');
}

// Handle UI for unsupported speech recognition
if (!recognition) {
  const micButton = document.querySelector('.mic');
  if (micButton) {
    micButton.style.display = 'none';
  }
  if (typeof errorMessage === 'function') {
    errorMessage('Browser/Device anda tidak mendukung fitur Voice Recognition');
  }
}

// Modify button click handler to check if recognition exists
const buttons = document.querySelectorAll(".mic, .send");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.className === "mic" && recognition) {
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

function tapMotion() {
  model.motion('speak');
}
// Menambahkan fungsi tapMotion ke ticker
let tapMotionTickerFunction = () => app.ticker.add(tapMotion);

// Menghapus fungsi tapMotion dari ticker
let removeTapMotion = () => app.ticker.remove(tapMotion);

async function speak(text) {
  try {
    // TTS API endpoint
    const url = "https://toneva-tts.up.railway.app/tts/stream";

    // Request body, bisa diubah sesuai kebutuhan
    const body = {
      text: text,
      speaker: 1,
      outputFormat: "wav",
      pitch: 0,
      intonationScale: 1.0,
      speed: 1.0
    };

    // Fetch audio from TTS API
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("TTS API error");
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(blob);

    // Play audio
    const audio = new Audio(audioUrl);
    audio.play();

    // Optional: handle UI state during playback
    audio.addEventListener("play", () => {
      tapMotionTickerFunction();
      go.forEach((goes) => {
        goes.disabled = true;
      });
    });
    audio.addEventListener("ended", () => {
      removeTapMotion();
      go.forEach((goes) => {
        goes.disabled = false;
      });
      chatbotDiv.id = "chatbot" + count;
      userDiv.id = "user" + count;
      inputan.value = "";
    });

  } catch (err) {
    console.error("TTS error:", err);
    warningMessage("Gagal memutar suara TTS.");
  }
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