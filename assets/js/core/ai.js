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
      //sementara
      errorMessage("maaf AI sedang sibuk");
    });
}
  // const base = document.getElementById("char");
  const inner = document.getElementsByClassName("active-mic");
  const outter = document.getElementsByClassName("active-outter-mic");
  
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = "id-ID";
    
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
  } else {
    alert("Browser tidak mendukung SpeechRecognition");
    console.warn("Browser tidak mendukung SpeechRecognition");
    // Bisa tampilkan pesan fallback atau sembunyikan tombol mic
    document.querySelector(".mic").style.display = "none";
  }
  
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

  function tapMotion() {
    model.motion('speak');
  }
  // Menambahkan fungsi tapMotion ke ticker
  let tapMotionTickerFunction = () => app.ticker.add(tapMotion);

  // Menghapus fungsi tapMotion dari ticker
  let removeTapMotion = () => app.ticker.remove(tapMotion);

  async function speak(text) {
    const API_URL = "https://toneva-tts.up.railway.app/tts/stream";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          speaker: 1,
          outputFormat: "wav"
        })
      });

      if (response.status === 429) {
        warningMessage("TTS rate limit, silakan coba beberapa saat lagi.");
        return;
      }
      if (!response.ok) {
        warningMessage("TTS gagal: " + response.statusText);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

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

      try {
        await audio.play();
      } catch (err) {
        warningMessage("Klik di mana saja untuk memutar suara.");
        const resumeAudio = () => {
          audio.play().catch(() => {
            warningMessage("Audio gagal diputar di browser Anda.");
          });
          window.removeEventListener("click", resumeAudio);
          window.removeEventListener("touchstart", resumeAudio);
        };
        window.addEventListener("click", resumeAudio);
        window.addEventListener("touchstart", resumeAudio);
      }
    } catch (error) {
      if (error.message && error.message.includes('429')) {
        warningMessage("TTS rate limit, silakan coba beberapa saat lagi.");
      }
      console.error('TTS error:', error);
      warningMessage("Gagal memproses TTS: " + error.message);
      removeTapMotion();
      go.forEach((goes) => {
        goes.disabled = false;
      });
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