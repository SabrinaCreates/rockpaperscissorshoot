let classifier;
const imageModelURL = "https://teachablemachine.withgoogle.com/models/QV_CtTl_G/";

let video;
let label = "Waiting...";
let confidence = 0;
let modelStarted = false;
let modelLoaded = false;
let isClassifying = false;

let playerScore = 0;
let computerScore = 0;
let roundCount = 0;
let currentPlayerChoice = "";

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

// Event Listeners
if (startBtn) startBtn.addEventListener("click", startExperience);
if (beginSetupBtn) beginSetupBtn.addEventListener("click", startExperience);

if (rulesBtn) rulesBtn.addEventListener("click", () => rulesModal.classList.add("show"));
if (closeRules) closeRules.addEventListener("click", () => rulesModal.classList.remove("show"));

window.addEventListener("click", (event) => {
  if (event.target === rulesModal) rulesModal.classList.remove("show");
  if (event.target === startModal) startModal.classList.remove("show");
});

function startExperience() {
  if (startModal) startModal.classList.remove("show");
  if (modelStarted) return;

  modelStarted = true;
  modelStatus.textContent = "Requesting Camera...";
  
  // Initialize p5 in Instance Mode
  new p5(sketch);
}

const sketch = (p) => {
  p.setup = function () {
    // Clear placeholder UI
    webcamContainer.innerHTML = "";
    
    // Create a container for the video using p5 DOM
    const wrap = p.createDiv("");
    wrap.class("live-video-wrap");
    wrap.parent(webcamContainer);

    // Create Canvas
    const canvas = p.createCanvas(320, 240);
    canvas.parent(wrap);

    // Initialize Video Capture
    video = p.createCapture(p.VIDEO, function() {
      console.log("Camera stream active");
      modelStatus.textContent = "Camera active. Loading Model...";
    });
    
    video.size(320, 240);
    video.hide(); // Hide duplicate video element

    // Load Teachable Machine Model
    classifier = ml5.imageClassifier(imageModelURL + "model.json", function () {
      console.log("Model loaded successfully");
      modelLoaded = true;
      modelStatus.textContent = "Ready to Play";
      startClassificationLoop();
    });
  };

  p.draw = function () {
    p.background(0);
    if (video) {
      p.push();
      // Mirror the feed
      p.translate(p.width, 0);
      p.scale(-1, 1);
      p.image(video, 0, 0, 320, 240);
      p.pop();
    }
  };
};

function startClassificationLoop() {
  if (isClassifying) return;
  isClassifying = true;

  const classify = () => {
    if (!video || !classifier || !modelLoaded) {
      requestAnimationFrame(classify);
      return;
    }

    classifier.classify(video, function (error, results) {
      if (error) {
        console.error(error);
        return;
      }

      if (results && results[0]) {
        label = results[0].label;
        confidence = results[0].confidence || 0;
        currentPlayerChoice = cleanLabel(label);
        updateDetectionUI(currentPlayerChoice, confidence);
      }
      
      // Control detection speed to save CPU
      setTimeout(classify, 150);
    });
  };

  classify();
}

function cleanLabel(rawLabel) {
  const lower = rawLabel.toLowerCase().trim();
  if (lower.includes("rock")) return "Rock";
  if (lower.includes("paper")) return "Paper";
  if (lower.includes("scissor")) return "Scissors";
  return "Waiting...";
}

function updateDetectionUI(choice, confidenceScore) {
  gestureName.textContent = choice;
  
  const icons = { "Rock": "✊", "Paper": "✋", "Scissors": "✌️" };
  gestureIcon.textContent = icons[choice] || "❔";

  const percent = Math.round(confidenceScore * 100);
  confidenceValue.textContent = percent + "%";
  confidenceFill.style.width = percent + "%";
}

// Game Logic
function determineWinner(player, computer) {
  if (player === computer) return "Tie";
  if (
    (player === "Rock" && computer === "Scissors") ||
    (player === "Paper" && computer === "Rock") ||
    (player === "Scissors" && computer === "Paper")
  ) return "Player";
  return "Computer";
}

if (playRoundBtn) {
  playRoundBtn.addEventListener("click", function () {
    const validChoices = ["Rock", "Paper", "Scissors"];
    if (!validChoices.includes(currentPlayerChoice)) {
      winnerText.textContent = "Hold up a clear gesture!";
      return;
    }

    const computerChoice = validChoices[Math.floor(Math.random() * 3)];
    const winner = determineWinner(currentPlayerChoice, computerChoice);

    playerChoiceText.textContent = currentPlayerChoice;
    computerChoiceText.textContent = computerChoice;
    roundCount++;
    roundCountText.textContent = roundCount;

    if (winner === "Player") {
      playerScore++;
      playerScoreText.textContent = playerScore;
      winnerText.textContent = "You win!";
    } else if (winner === "Computer") {
      computerScore++;
      computerScoreText.textContent = computerScore;
      winnerText.textContent = "Computer wins!";
    } else {
      winnerText.textContent = "It's a tie!";
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    playerScore = 0;
    computerScore = 0;
    roundCount = 0;
    playerScoreText.textContent = "0";
    computerScoreText.textContent = "0";
    roundCountText.textContent = "0";
    playerChoiceText.textContent = "—";
    computerChoiceText.textContent = "—";
    winnerText.textContent = "Scores reset";
  });
}