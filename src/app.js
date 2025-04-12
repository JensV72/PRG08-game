import {
    HandLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18";

const enableWebcamButton = document.getElementById("webcamButton")
const startButton = document.getElementById("startButton")
const video = document.getElementById("webcam")
const canvasElement = document.getElementById("output_canvas")
const canvasCtx = canvasElement.getContext("2d")
const scoreDisplay = document.getElementById("scoreDisplay");
const lives = document.getElementById("lives");
const restart = document.getElementById("restart");


const drawUtils = new DrawingUtils(canvasCtx)
let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;
let results = undefined;

let objectsBlue = [];
let objectsRed = [];
let score = 0;
let livesCount = 5;
let currentPrediction = "";
let currentPrediction1 = "";
let gameStarted = false;
let spawnInterval;
let spawnIntervalBad;




ml5.setBackend("webgl");
const nn = ml5.neuralNetwork({task: 'classification', debug: true})
const modelDetails = {
    model: './models/model.json',
    metadata: './models/model_meta.json',
    weights: './models/model.weights.bin'
}

async function loadModel() {
    nn.load(modelDetails, () => {
        console.log("The model is loaded!");
    });
}

function spawnObject() {
    const radius = 20;
    const x = Math.random() * (canvasElement.width - radius * 2) + radius;
    const y = -radius;

    const object = {x: x, y: y, radius: radius, caught: false};
    objectsBlue.push(object);
}

function spawnBadObject(){
    const radius = 20;
    const x = Math.random() * (canvasElement.width - radius * 2) + radius;
    const y = -radius;

    const object = {x: x, y: y, radius: radius, caught: false};
    objectsRed.push(object);
}



/********************************************************************
 // CREATE THE POSE DETECTOR
 ********************************************************************/
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
    console.log("model loaded, you can start webcam")

    if (hasGetUserMedia()) {
        enableWebcamButton.addEventListener("click", (e) => enableCam(e))
        restart.addEventListener("click", (e) => again(e))
            startButton.addEventListener("click", () => {
                if (!gameStarted&&webcamRunning) {
                    gameStarted = true;
                    startButton.disabled = true;
                    startButton.innerText = "Spel start binnenkort...";

                    setTimeout(() => {
                        startButton.innerText = "Spel bezig!";
                        spawnInterval = setInterval(spawnObject, 1000);
                        spawnIntervalBad = setInterval(spawnBadObject, 1490);
                        predictWebcam();
                    }, 2000); // 2 seconden delay
                }
            });
    }
}
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

/********************************************************************
 // START THE WEBCAM
 ********************************************************************/

function enableCam() {
    webcamRunning = true;
    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
        video.srcObject = stream
        video.addEventListener("loadeddata", () => {
            canvasElement.style.width = video.videoWidth
            canvasElement.style.height = video.videoHeight
            canvasElement.width = video.videoWidth
            canvasElement.height = video.videoHeight
            document.querySelector(".videoView").style.height = video.videoHeight + "px"
        })
    })
}

function updateObjects(handX, handY, hand1X, hand1Y) {
    for (let obj of objectsBlue) {
        if (!obj.caught) {
            obj.y += 3;

            const checkHandCollision = (x, y, prediction) => {
                if (x !== 0 && y !== 0 && prediction === "Open") {
                    const dx = obj.x - x;
                    const dy = obj.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < obj.radius + 30;
                }
                return false;
            }

            if (checkHandCollision(handX, handY, currentPrediction) ||
                checkHandCollision(hand1X, hand1Y, currentPrediction1)) {
                obj.caught = true;
                score++;
                scoreDisplay.innerText = `Score: ${score}`;
            }

            if (obj.y > canvasElement.height) {
                obj.caught = true;
                livesCount--;
                lives.innerText = `Lives: ${livesCount}`;
            }
        }
    }

    for (let obj of objectsRed) {
        if (!obj.caught) {
            obj.y += 3;

            const checkHandCollision = (x, y, prediction) => {
                if (x !== 0 && y !== 0 && prediction === "Close") {
                    const dx = obj.x - x;
                    const dy = obj.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < obj.radius + 30;
                }
                return false;
            }

            if (checkHandCollision(handX, handY, currentPrediction) ||
                checkHandCollision(hand1X, hand1Y, currentPrediction1)) {
                obj.caught = true;
                score++;
                scoreDisplay.innerText = `Score: ${score}`;
            }

            if (obj.y > canvasElement.height) {
                obj.caught = true;
                livesCount--;
                lives.innerText = `Lives: ${livesCount}`;
            }
        }
    }


    // Teken objecten
    for (let obj of objectsBlue) {
        if (!obj.caught) {
            canvasCtx.beginPath();
            canvasCtx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            canvasCtx.fillStyle = "blue";
            canvasCtx.fill();
            canvasCtx.closePath();
        }
    }

    for (let obj of objectsRed) {
        if (!obj.caught) {
            canvasCtx.beginPath();
            canvasCtx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            canvasCtx.fillStyle = "red";
            canvasCtx.fill();
            canvasCtx.closePath();
        }
    }
    if (livesCount <= 0) {
        endGame();
    }
}


function endGame() {
    gameStarted = false;
    webcamRunning = false;
    clearInterval(spawnInterval);
    clearInterval(spawnIntervalBad);
    startButton.innerText = "Game Over";

}

function again(){
    location.reload();
}

/********************************************************************
 // START PREDICTIONS
 ********************************************************************/
async function predictWebcam() {
    results = await handLandmarker.detectForVideo(video, performance.now())

    let handX = 0, handY = 0;
    let hand1X = 0, hand1Y = 0;

    if (results.landmarks.length > 0) {
        const hand = results.landmarks[0];
        classifyCurrentHand(hand, results.landmarks[1]);

        const palm = hand[9];
        handX = palm.x * canvasElement.width;
        handY = palm.y * canvasElement.height;
    }

    if (results.landmarks.length > 1) {
        const hand1 = results.landmarks[1];
        const palm1 = hand1[9];
        hand1X = palm1.x * canvasElement.width;
        hand1Y = palm1.y * canvasElement.height;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    updateObjects(handX, handY, hand1X, hand1Y);

    for (let hand of results.landmarks) {
        drawUtils.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#BADDFF", lineWidth: 5 });
        drawUtils.drawLandmarks(hand, { radius: 4, color: "#496580", lineWidth: 2 });

        const palm = hand[9];
        const drawX = palm.x * canvasElement.width;
        const drawY = palm.y * canvasElement.height;



        canvasCtx.beginPath();
        canvasCtx.lineWidth = 5;
        canvasCtx.arc(drawX, drawY, 40, 0, Math.PI * 2);
        canvasCtx.strokeStyle = "#BADDFF";
        canvasCtx.stroke();
        canvasCtx.closePath();
    }

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}



async function classifyCurrentHand(hand,hand1) {
    if (!hand) return;

    const flatArray = hand.flatMap(point => [point.x, point.y, point.z]);
    const results = await nn.classify(flatArray)
    if (results && results.length > 0) {
        currentPrediction = results[0].label; // Neem de eerste voorspelling (deze is meestal de meest waarschijnlijke)
        console.log("Predicted label:", currentPrediction);
    }

    if(hand1){
    const flatArray1 = hand1.flatMap(point => [point.x, point.y, point.z]);
    const results1 = await nn.classify(flatArray1)
        if (results1 && results.length >0){
            currentPrediction1 = results1[0].label; // Neem de eerste voorspelling (deze is meestal de meest waarschijnlijke)
            console.log("Predicted label1:", currentPrediction1);
        }
    }
}

(async () => {
    await loadModel();
    await createHandLandmarker();
})();