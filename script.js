let classifier;
// Ensure your URL ends with the final slash /
const imageModelURL = "https://teachablemachine.withgoogle.com/models/QV_CtTl_G/";

let video;
let label = "Waiting...";
let confidence = 0;
let modelLoaded = false;
let isClassifying = false;

let playerScore = 0;
let computerScore = 0;
let roundCount = 0;
let currentPlayerChoice = "";

// UI Elements
const startBtn = document.getElementById("startBtn");
const beginSetupBtn = document.getElementById("beginSetupBtn");
const modelStatus = document.getElementById("modelStatus");
const webcamContainer = document.getElementById("webcam-container");
const playerChoiceText = document.getElementById("playerChoice");
const computerChoiceText = document.getElementById("computerChoice");
const winnerText = document.getElementById("winnerText");
const playRoundBtn = document.getElementById("playRoundBtn");
const resetBtn = document.getElementById("resetBtn");

// Event Listeners
if (startBtn) startBtn.addEventListener("click", requestCameraAccess);
if (beginSetupBtn) beginSetupBtn.addEventListener("click", requestCameraAccess);

/**
 * STEP 1: Secure Camera Access
 */
async function requestCameraAccess() {
  modelStatus.textContent = "Requesting browser permission...";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => track.stop());
    startExperience();
  } catch (err) {
    console.error("Camera access denied:", err);
    modelStatus.textContent = "Error: Camera access denied.";
    alert("Please allow camera access in your browser settings to play!");
  }
}

function startExperience() {
  const startModal = document.getElementById("startModal");
  if (startModal) startModal.classList.remove("show");
  modelStatus.textContent = "Initializing AI Vision...";
  new p5(sketch);
}

/**
 * STEP 2: p5.js and AI Setup
 */
const sketch = (p) => {
  p.setup = function () {
    webcamContainer.innerHTML = "";
    const wrap = p.createDiv("");
    wrap.class("live-video-wrap");
    wrap.parent(webcamContainer);

    const canvas = p.createCanvas(320, 240);
    canvas.parent(wrap);

    video = p.createCapture(p.VIDEO, () => {
      console.log("Camera successfully captured");
      modelStatus.textContent = "Camera active. Loading AI Model...";
    });
    video.size(320, 240);
    video.hide();

    // Load Model with a timeout/error check
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', video, (err) => {
      if (err) {
        console.error("Model failed to load:", err);
        modelStatus.textContent = "Error: Model failed to load.";
        return;
      }
      console.log("Model loaded successfully!");
      modelLoaded = true;
      modelStatus.textContent = "System Ready!";
      classifyVideo();
    });
  };

  p.draw = function () {
    p.background(0);
    if (video) {
      p.push();
      p.translate(p.width, 0);
      p.scale(-1, 1);
      p.image(video, 0, 0, 320, 240);
      p.pop();
    }
  };

  function classifyVideo() {
    if (modelLoaded) {
      classifier.classify(gotResult);
    }
  }

  function gotResult(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    if (results && results[0]) {
      label = results[0].label;
      confidence = results[0].confidence;
      updateDetectionUI(label, confidence);
    }
    classifier.classify(gotResult); // Recursive loop for live detection
  }
};

/**
 * STEP 3: Detection & Game UI Updates
 */
function updateDetectionUI(rawLabel, conf) {
  const cleanLabel = rawLabel.toLowerCase();
  let choice = "Waiting...";
  let icon = "❔";

  if (cleanLabel.includes("rock")) { choice = "Rock"; icon = "✊"; }
  else if (cleanLabel.includes("paper")) { choice = "Paper"; icon = "✋"; }
  else if (cleanLabel.includes("scissor")) { choice = "Scissors"; icon = "✌️"; }

  currentPlayerChoice = choice;
  document.getElementById("gestureName").textContent = choice;
  document.getElementById("gestureIcon").textContent = icon;
  
  const percent = Math.round(conf * 100);
  document.getElementById("confidenceValue").textContent = percent + "%";
  document.getElementById("confidenceFill").style.width = percent + "%";
}

// Turn-Based Battle Logic with 3-2-1 Countdown
if (playRoundBtn) {
  playRoundBtn.addEventListener("click", function () {
    if (!modelLoaded || playRoundBtn.disabled) return;

    playRoundBtn.disabled = true;
    winnerText.classList.add("active");
    let count = 3;

    const countdownInterval = setInterval(() => {
      if (count > 0) {
        winnerText.textContent = count + "...";
        count--;
      } else {
        clearInterval(countdownInterval);
        executeBattle();
      }
    }, 600);
  });
}

function executeBattle() {
  winnerText.textContent = "SHOOT!";
  
  const finalPlayerChoice = currentPlayerChoice;
  const choices = ["Rock", "Paper", "Scissors"];
  const finalComputerChoice = choices[Math.floor(Math.random() * 3)];

  if (finalPlayerChoice === "Waiting...") {
    winnerText.textContent = "No hand detected!";
    setTimeout(() => {
        playRoundBtn.disabled = false;
        winnerText.classList.remove("active");
    }, 1000);
    return;
  }

  let result = "";
  if (finalPlayerChoice === finalComputerChoice) {
    result = "It's a Tie!";
  } else if (
    (finalPlayerChoice === "Rock" && finalComputerChoice === "Scissors") ||
    (finalPlayerChoice === "Paper" && finalComputerChoice === "Rock") ||
    (finalPlayerChoice === "Scissors" && finalComputerChoice === "Paper")
  ) {
    result = "You Win!";
    playerScore++;
  } else {
    result = "Computer Wins!";
    computerScore++;
  }

  roundCount++;
  document.getElementById("roundCount").textContent = roundCount;
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("computerScore").textContent = computerScore;
  
  playerChoiceText.textContent = finalPlayerChoice;
  computerChoiceText.textContent = finalComputerChoice;
  winnerText.textContent = result;
  
  setTimeout(() => {
    playRoundBtn.disabled = false;
    winnerText.classList.remove("active");
  }, 1500);
}

// Reset Score Logic
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      playerScore = 0;
      computerScore = 0;
      roundCount = 0;
      document.getElementById("playerScore").textContent = "0";
      document.getElementById("computerScore").textContent = "0";
      document.getElementById("roundCount").textContent = "0";
      playerChoiceText.textContent = "—";
      computerChoiceText.textContent = "—";
      winnerText.textContent = "No round played yet";
    });
}
