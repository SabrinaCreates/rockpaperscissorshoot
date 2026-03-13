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
const modelStatus = document.getElementById("modelStatus");
const webcamContainer = document.getElementById("webcam-container");

// Setup Event Listeners
if (startBtn) startBtn.addEventListener("click", requestCameraAccess);
if (beginSetupBtn) beginSetupBtn.addEventListener("click", requestCameraAccess);

/**
 * STEP 1: Manually request camera permission from the browser.
 * This satisfies the "User Gesture" requirement for GitHub Pages.
 */
async function requestCameraAccess() {
  modelStatus.textContent = "Requesting browser permission...";
  
  try {
    // This line triggers the official browser popup
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    
    // If successful, stop this temporary stream so p5 can take over the camera
    stream.getTracks().forEach(track => track.stop());
    
    startExperience();
  } catch (err) {
    console.error("Camera access denied or not found:", err);
    modelStatus.textContent = "Error: Camera access denied. Check browser settings.";
    alert("Please allow camera access in your browser settings and refresh the page.");
  }
}

/**
 * STEP 2: Start the actual p5 and AI experience.
 */
function startExperience() {
  const startModal = document.getElementById("startModal");
  if (startModal) startModal.classList.remove("show");
  
  modelStatus.textContent = "Initializing AI Vision...";
  new p5(sketch);
}

const sketch = (p) => {
  p.setup = function () {
    webcamContainer.innerHTML = "";
    const wrap = p.createDiv("");
    wrap.class("live-video-wrap");
    wrap.parent(webcamContainer);

    const canvas = p.createCanvas(320, 240);
    canvas.parent(wrap);

    // Now that permission is granted, p5 can safely capture the video
    video = p.createCapture(p.VIDEO, () => {
      modelStatus.textContent = "Camera On. Loading AI...";
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
      updateUI(label, confidence);
    }
    classifier.classify(gotResult);
  }
};

// ... (Rest of your UI update and game logic functions)
