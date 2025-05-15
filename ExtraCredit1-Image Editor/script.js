const imageUpload = document.getElementById('image-upload');
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const cropBtn = document.getElementById('crop-btn');
const cancelCropBtn = document.getElementById('cancel-crop-btn');
const cropOverlay = document.getElementById('crop-overlay');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const hueSlider = document.getElementById('hue');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

let originalImage = null;
let currentImage = null;
let isCropping = false;
let isSelecting = false;
let cropStartX, cropStartY, cropEndX, cropEndY;

imageUpload.addEventListener('change', handleImageUpload);

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      drawImageToCanvas(img);
      originalImage = img;
      currentImage = img;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function drawImageToCanvas(img) {
  const maxWidth = 800;
  const maxHeight = 600;
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
}

cropBtn.addEventListener('click', toggleCropMode);
cancelCropBtn.addEventListener('click', resetCropMode);
document.addEventListener('keydown', handleKeyDown);

function toggleCropMode() {
  if (!isCropping) {
    isCropping = true;
    cropBtn.classList.add('active');
    cancelCropBtn.classList.remove('hidden');
  } else {
    if (cropStartX && cropEndX) {
      applyCrop();
    }
    resetCropMode();
  }
}

canvas.addEventListener('mousedown', startCropSelection);
canvas.addEventListener('mousemove', updateCropSelection);
canvas.addEventListener('mouseup', endCropSelection);

function startCropSelection(e) {
  if (!isCropping) return;

  const rect = canvas.getBoundingClientRect();
  cropStartX = cropEndX = e.clientX - rect.left;
  cropStartY = cropEndY = e.clientY - rect.top;
  isSelecting = true;

  cropOverlay.classList.remove('hidden');
  updateCropOverlay();
}

function updateCropSelection(e) {
  if (!isCropping || !isSelecting) return;

  const rect = canvas.getBoundingClientRect();
  cropEndX = e.clientX - rect.left;
  cropEndY = e.clientY - rect.top;

  updateCropOverlay();
}

function endCropSelection() {
  isSelecting = false;
}

function updateCropOverlay() {
  const width = cropEndX - cropStartX;
  const height = cropEndY - cropStartY;

  cropOverlay.style.left = `${Math.min(cropStartX, cropEndX)}px`;
  cropOverlay.style.top = `${Math.min(cropStartY, cropEndY)}px`;
  cropOverlay.style.width = `${Math.abs(width)}px`;
  cropOverlay.style.height = `${Math.abs(height)}px`;
}

function applyCrop() {
  const x = Math.min(cropStartX, cropEndX);
  const y = Math.min(cropStartY, cropEndY);
  const width = Math.abs(cropEndX - cropStartX);
  const height = Math.abs(cropEndY - cropStartY);

  if (width < 10 || height < 10) {
    alert("Selection too small. Please select a larger area.");
    return;
  }

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = width;
  tempCanvas.height = height;

  tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(tempCanvas, 0, 0);

  currentImage = new Image();
  currentImage.src = canvas.toDataURL();
}

function resetCropMode() {
  isCropping = false;
  isSelecting = false;
  cropBtn.classList.remove('active');
  cancelCropBtn.classList.add('hidden');
  cropOverlay.classList.add('hidden');
  cropStartX = cropStartY = cropEndX = cropEndY = null;
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && isCropping) {
    resetCropMode();
  }
}

[brightnessSlider, contrastSlider, saturationSlider, hueSlider].forEach(slider => {
  slider.addEventListener('input', applyFilters);
});

function applyFilters() {
  if (!currentImage) return;

  ctx.filter = `
    brightness(${100 + parseInt(brightnessSlider.value)}%)
    contrast(${100 + parseInt(contrastSlider.value)}%)
    saturate(${100 + parseInt(saturationSlider.value)}%)
    hue-rotate(${hueSlider.value}deg)
  `;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
}

resetBtn.addEventListener('click', () => {
  brightnessSlider.value = 0;
  contrastSlider.value = 0;
  saturationSlider.value = 0;
  hueSlider.value = 0;
  applyFilters();
});

downloadBtn.addEventListener('click', () => {
  if (!currentImage) {
    alert("Please upload an image first.");
    return;
  }

  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});