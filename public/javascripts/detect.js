// public/js/detect.js
const MODEL_URL = '/models/plant-model/'; // path to your teachable machine folder
let model, maxPredictions;
let plantInfo = {}; // loaded from plants.json

async function loadPlantInfo() {
  try {
    const res = await fetch('/data/plants.json');
    plantInfo = await res.json();
  } catch (e) {
    console.warn('Could not load plants.json', e);
  }
}

async function init() {
  // load model
  const modelURL = MODEL_URL + 'model.json';
  const metadataURL = MODEL_URL + 'metadata.json';
  document.getElementById('status').innerText = 'Loading model...';
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  document.getElementById('status').innerText = 'Model loaded';
  await loadPlantInfo();
}

function readImage(file) {
  const preview = document.getElementById('preview');
  const reader = new FileReader();
  reader.onload = function(e) {
    preview.src = e.target.result;
  }
  reader.readAsDataURL(file);
}

async function predict() {
  const preview = document.getElementById('preview');
  if (!preview || !preview.src) {
    alert('Please choose an image first.');
    return;
  }
  document.getElementById('status').innerText = 'Predicting...';
  // tmImage.predict expects an image element
  const prediction = await model.predict(preview, false);
  // sort by probability desc
  prediction.sort((a,b)=>b.probability - a.probability);
  const top = prediction[0];
  const name = top.className;
  const prob = top.probability;

  showResult(name, prob);
  document.getElementById('status').innerText = 'Ready';
}

function showResult(name, prob) {
  const resultCard = document.getElementById('resultCard');
  const plantName = document.getElementById('plantName');
  const plantConfidence = document.getElementById('plantConfidence');
  const plantDesc = document.getElementById('plantDesc');
  const plantUses = document.getElementById('plantUses');
  const sketchfabDiv = document.getElementById('sketchfabEmbed');

  resultCard.classList.remove('hidden');
  plantName.innerText = name;
  plantConfidence.innerText = `Confidence: ${(prob*100).toFixed(2)}%`;

  const info = plantInfo[name];
  if (info) {
    plantDesc.innerText = info.description || '';
    plantUses.innerHTML = '';
    (info.uses || []).forEach(u => {
      const li = document.createElement('li');
      li.innerText = u;
      plantUses.appendChild(li);
    });

    // Sketchfab embed if provided
    if (info.sketchfab) {
      sketchfabDiv.innerHTML = `<iframe width="100%" height="480" src="${info.sketchfab}" frameborder="0" allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>`
    } else {
      sketchfabDiv.innerHTML = '';
    }
  } else {
    plantDesc.innerText = 'No extra information found for this class. Create public/data/plants.json mapping class -> info.';
    plantUses.innerHTML = '';
    sketchfabDiv.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  const imageInput = document.getElementById('imageInput');
  const detectBtn = document.getElementById('detectBtn');
  const clearBtn = document.getElementById('clearBtn');

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) readImage(file);
  });

  detectBtn.addEventListener('click', predict);
  clearBtn.addEventListener('click', ()=> {
    document.getElementById('preview').src = '';
    document.getElementById('resultCard').classList.add('hidden');
  });
});
