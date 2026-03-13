let classifier;
const imageModelURL = "https://teachablemachine.withgoogle.com/models/QV_CtTl_G/";

let video;
let label = "Waiting...";
let confidence = 0;
let modelLoaded = false;
let currentPlayerChoice = "";

let playerScore = 0;
let computerScore = 0;
let roundCount = 0;

// UI Elements
const modelStatus = document.getElementById("modelStatus");
const webcamContainer = document.getElementById("webcam-container");
const playerChoiceText = document.getElementById("playerChoice");
const computerChoiceText = document.getElementById("computerChoice");
const winnerText = document.getElementById("winnerText");
const playRoundBtn = document.getElementById("playRoundBtn");
const gestureName = document.getElementById("gestureName");
const gestureIcon = document.getElementById("gestureIcon");

// Button Listeners
document.getElementById("startBtn").addEventListener("click", requestCameraAccess);
document.getElementById("beginSetupBtn").addEventListener("click", requestCameraAccess);

/** * Mandatory Browser Permission Trigger 
 */
async function requestCameraAccess() {
  modelStatus.textContent = "Requesting permission...";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    document.getElementById("startModal").classList.remove("show");
    new p5(sketch);
  } catch (err) {
    alert("Camera access is required for this game!");
  }
}

const sketch = (p) => {
  p.setup = function () {
    webcamContainer.innerHTML = "";
    const canvas = p.createCanvas(320, 240);
    canvas.parent(p.createDiv("").class("live-video-wrap").parent(webcamContainer));

    video = p.createCapture(p.VIDEO, () => {
      modelStatus.textContent = "Loading AI Model...";
    });
    video.size(320, 240);
    video.hide();

    classifier = ml5.imageClassifier(imageModelURL + 'model.json', video, () => {
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
    classifier.classify(gotResult);
  }

  function gotResult(error, results) {
    if (error) return;
    if (results && results[0]) {
      label = results[0].label;
      confidence = results[0].confidence;
      updateDetectionUI(label, confidence);
    }
    classifier.classify(gotResult);
  }
};

function updateDetectionUI(rawLabel, conf) {
  const cleanLabel = rawLabel.toLowerCase().trim();
  let choice = "Waiting...";
  let icon = "❔";

  if (cleanLabel === "rock") { choice = "Rock"; icon = "✊"; }
  else if (cleanLabel === "paper") { choice = "Paper"; icon = "✋"; }
  else if (cleanLabel === "scissors" || cleanLabel === "scissor") { choice = "Scissors"; icon = "✌️"; }

  currentPlayerChoice = choice;
  gestureName.textContent = choice;
  gestureIcon.textContent = icon;
  
  const percent = Math.round(conf * 100);
  document.getElementById("confidenceValue").textContent = percent + "%";
  document.getElementById("confidenceFill").style.width = percent + "%";
}

// Battle Logic
if (playRoundBtn) {
  playRoundBtn.addEventListener("click", function () {
    if (!modelLoaded || playRoundBtn.disabled) return;

    playRoundBtn.disabled = true;
    winnerText.classList.add("active");
    let count = 3;

    const countdown = setInterval(() => {
      if (count > 0) {
        winnerText.textContent = count + "...";
        count--;
      } else {
        clearInterval(countdown);
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
    winnerText.textContent = "Hold your hand up!";
    setTimeout(() => { playRoundBtn.disabled = false; winnerText.classList.remove("active"); }, 1500);
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
  }, 2000);
}

document.getElementById("resetBtn").addEventListener("click", () => {
  playerScore = 0; computerScore = 0; roundCount = 0;
  document.querySelectorAll(".stat-card h3").forEach(el => el.textContent = "0");
  playerChoiceText.textContent = "—"; computerChoiceText.textContent = "—";
  winnerText.textContent = "Ready!";
});
