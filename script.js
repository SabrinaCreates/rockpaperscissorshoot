let classifier;
const imageModelURL = "https://teachablemachine.withgoogle.com/models/QV_CtTl_G/";

let video;
let label = "Waiting...";
let confidence = 0;
let modelLoaded = false;
let isClassifying = false;

// UI Elements
const startBtn = document.getElementById("startBtn");
const beginSetupBtn = document.getElementById("beginSetupBtn");
const rulesBtn = document.getElementById("rulesBtn");
const closeRules = document.getElementById("closeRules");
const startModal = document.getElementById("startModal");
const rulesModal = document.getElementById("rulesModal");
const modelStatus = document.getElementById("modelStatus");
const confidenceValue = document.getElementById("confidenceValue");
const confidenceFill = document.getElementById("confidenceFill");
const gestureName = document.getElementById("gestureName");
const gestureIcon = document.getElementById("gestureIcon");
const playerChoiceText = document.getElementById("playerChoice");
const computerChoiceText = document.getElementById("computerChoice");
const winnerText = document.getElementById("winnerText");
const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");
const roundCountText = document.getElementById("roundCount");
const playRoundBtn = document.getElementById("playRoundBtn");
const resetBtn = document.getElementById("resetBtn");
const webcamContainer = document.getElementById("webcam-container");

// Setup Event Listeners
if (startBtn) startBtn.addEventListener("click", startExperience);
if (beginSetupBtn) beginSetupBtn.addEventListener("click", startExperience);

function startExperience() {
  if (startModal) startModal.classList.remove("show");
  
  modelStatus.textContent = "Starting p5...";
  // We use instance mode to avoid conflicts with global variables
  new p5(sketch);
}

const sketch = (p) => {
  p.setup = function () {
    webcamContainer.innerHTML = "";
    
    // Create the wrap div using p5 DOM
    const wrap = p.createDiv("");
    wrap.class("live-video-wrap");
    wrap.parent(webcamContainer);

    // Create Canvas and parent it to the wrap
    const canvas = p.createCanvas(320, 240);
    canvas.parent(wrap);

    // CRITICAL: Request video explicitly
    video = p.createCapture(p.VIDEO, (stream) => {
      console.log("Webcam Stream acquired");
      modelStatus.textContent = "Camera On. Loading Model...";
    });
    
    video.size(320, 240);
    video.hide();

    // Load Classifier
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', video, () => {
      console.log("Model Loaded!");
      modelLoaded = true;
      modelStatus.textContent = "Model Ready!";
      isClassifying = true;
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

  // Move classify function inside or outside, but call it correctly
  function classifyVideo() {
    classifier.classify(gotResult);
  }

  function gotResult(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    if (results && results[0]) {
      label = results[0].label;
      confidence = results[0].confidence;
      updateUI(label, confidence);
    }
    classifier.classify(gotResult); // Loop
  }
};

function updateUI(rawLabel, conf) {
  const cleanLabel = rawLabel.toLowerCase();
  let choice = "Waiting...";
  let icon = "❔";

  if (cleanLabel.includes("rock")) { choice = "Rock"; icon = "✊"; }
  else if (cleanLabel.includes("paper")) { choice = "Paper"; icon = "✋"; }
  else if (cleanLabel.includes("scissor")) { choice = "Scissors"; icon = "✌️"; }

  currentPlayerChoice = choice;
  gestureName.textContent = choice;
  gestureIcon.textContent = icon;

  const percent = Math.round(conf * 100);
  confidenceValue.textContent = percent + "%";
  confidenceFill.style.width = percent + "%";
}

// Keep your existing Play Round and Reset logic below...
