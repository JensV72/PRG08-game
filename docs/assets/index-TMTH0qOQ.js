import{DrawingUtils as T,FilesetResolver as H,HandLandmarker as E}from"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function l(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=l(e);fetch(e.href,t)}})();const F=document.getElementById("webcamButton"),g=document.getElementById("startButton"),c=document.getElementById("webcam"),o=document.getElementById("output_canvas"),a=o.getContext("2d"),B=document.getElementById("scoreDisplay"),O=document.getElementById("lives"),A=document.getElementById("restart"),j=new T(a);let L,b=!1,u,x=[],k=[],y=0,h=5,p="",w="",I=!1,M,D;ml5.setBackend("webgl");const P=ml5.neuralNetwork({task:"classification",debug:!0}),N={model:"./models/model.json",metadata:"./models/model_meta.json",weights:"./models/model.weights.bin"};async function W(){P.load(N,()=>{console.log("The model is loaded!")})}function U(){const s={x:Math.random()*(o.width-40)+20,y:-20,radius:20,caught:!1};x.push(s)}function _(){const s={x:Math.random()*(o.width-40)+20,y:-20,radius:20,caught:!1};k.push(s)}const q=async()=>{const n=await H.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");L=await E.createFromOptions(n,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",delegate:"GPU"},runningMode:"VIDEO",numHands:2}),console.log("model loaded, you can start webcam"),G()&&(F.addEventListener("click",i=>R()),A.addEventListener("click",i=>z()),g.addEventListener("click",()=>{!I&&b&&(I=!0,g.disabled=!0,g.innerText="Spel start binnenkort...",setTimeout(()=>{g.innerText="Spel bezig!",M=setInterval(U,1e3),D=setInterval(_,1490),C()},2e3))}))},G=()=>{var n;return!!((n=navigator.mediaDevices)!=null&&n.getUserMedia)};function R(){b=!0,navigator.mediaDevices.getUserMedia({video:!0,audio:!1}).then(n=>{c.srcObject=n,c.addEventListener("loadeddata",()=>{o.style.width=c.videoWidth,o.style.height=c.videoHeight,o.width=c.videoWidth,o.height=c.videoHeight,document.querySelector(".videoView").style.height=c.videoHeight+"px"})})}function V(n,i,l,s){for(let e of x)if(!e.caught){e.y+=3;const t=(r,d,v)=>{if(r!==0&&d!==0&&v==="Open"){const f=e.x-r,m=e.y-d;return Math.sqrt(f*f+m*m)<e.radius+30}return!1};(t(n,i,p)||t(l,s,w))&&(e.caught=!0,y++,B.innerText=`Score: ${y}`),e.y>o.height&&(e.caught=!0,h--,O.innerText=`Lives: ${h}`)}for(let e of k)if(!e.caught){e.y+=3;const t=(r,d,v)=>{if(r!==0&&d!==0&&v==="Close"){const f=e.x-r,m=e.y-d;return Math.sqrt(f*f+m*m)<e.radius+30}return!1};(t(n,i,p)||t(l,s,w))&&(e.caught=!0,y++,B.innerText=`Score: ${y}`),e.y>o.height&&(e.caught=!0,h--,O.innerText=`Lives: ${h}`)}for(let e of x)e.caught||(a.beginPath(),a.arc(e.x,e.y,e.radius,0,Math.PI*2),a.fillStyle="blue",a.fill(),a.closePath());for(let e of k)e.caught||(a.beginPath(),a.arc(e.x,e.y,e.radius,0,Math.PI*2),a.fillStyle="red",a.fill(),a.closePath());h<=0&&$()}function $(){I=!1,b=!1,clearInterval(M),clearInterval(D),g.innerText="Game Over"}function z(){location.reload()}async function C(){u=await L.detectForVideo(c,performance.now());let n=0,i=0,l=0,s=0;if(u.landmarks.length>0){const e=u.landmarks[0];K(e,u.landmarks[1]);const t=e[9];n=t.x*o.width,i=t.y*o.height}if(u.landmarks.length>1){const t=u.landmarks[1][9];l=t.x*o.width,s=t.y*o.height}a.clearRect(0,0,o.width,o.height),V(n,i,l,s);for(let e of u.landmarks){j.drawConnectors(e,E.HAND_CONNECTIONS,{color:"#BADDFF",lineWidth:5}),j.drawLandmarks(e,{radius:4,color:"#496580",lineWidth:2});const t=e[9],r=t.x*o.width,d=t.y*o.height;a.beginPath(),a.lineWidth=5,a.arc(r,d,40,0,Math.PI*2),a.strokeStyle="#BADDFF",a.stroke(),a.closePath()}b&&window.requestAnimationFrame(C)}async function K(n,i){if(!n)return;const l=n.flatMap(e=>[e.x,e.y,e.z]),s=await P.classify(l);if(s&&s.length>0&&(p=s[0].label,console.log("Predicted label:",p)),i){const e=i.flatMap(r=>[r.x,r.y,r.z]),t=await P.classify(e);t&&s.length>0&&(w=t[0].label,console.log("Predicted label1:",w))}}(async()=>(await W(),await q()))();
