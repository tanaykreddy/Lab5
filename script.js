// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.querySelector('#user-image');
const context = canvas.getContext('2d');
const imgInput = document.querySelector('#image-input');
const generateButton = document.querySelector("[type='submit']");
const clearButton = document.querySelector("[type='reset']");
const readButton = document.querySelector("[type='button']");
const textTop = document.querySelector('#text-top');
const textBottom = document.querySelector('#text-bottom');
const form = document.querySelector('#generate-meme');
const volumeIcon = document.querySelector('#volume-group').children[0];
const volumeSlider = document.querySelector("[type='range']");
const voiceSelect = document.querySelector('#voice-selection');
const synth = window.speechSynthesis;
var voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // clear the canvas context
  context.clearRect(0, 0, canvas.width, canvas.height);
  // toggle the relevant buttons (submit, clear, and read text buttons) by disabling or enabling them as needed
  textTop.value = '';
  textBottom.value = '';
  generateButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;
  textTop.disabled = false;
  textBottom.disabled = false;
  voiceSelect.disabled = true;
  // fill the canvas context with black to add borders on non-square images
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  // draw the uploaded image onto the canvas with the correct width, height, leftmost coordinate (startX), and topmost coordinate (startY) using generated dimensions from the given function getDimensions
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
});

imgInput.addEventListener('change', () => {
  // load in the selected image into the Image object (img) src attribute
  let file = imgInput.files[0]
  img.src = URL.createObjectURL(file);
  // set the image alt attribute by extracting the image file name from the file path
  img.alt = file.name;
});

form.addEventListener('submit', (e) => {
  // on submit, generate your meme by grabbing the text in the two inputs with ids text-top and text-bottom, and adding the relevant text to the canvas (note: you should still be able to add text to the canvas without an image uploaded)
  e.preventDefault();
  context.fillStyle = 'white';
  context.font = '50px Impact';
  context.textAlign = 'center';
  context.fillText(textTop.value, canvas.width * 0.5, canvas.height * 0.14);
  context.fillText(textBottom.value, canvas.width * 0.5, canvas.height * 0.95);
  // toggle relevant buttons
  generateButton.disabled = true;
  clearButton.disabled = false;
  readButton.disabled = false;
  textTop.disabled = true;
  textBottom.disabled = true;
  voiceSelect.disabled = false;
  // populate voice list
  populateVoiceList();
});

clearButton.addEventListener('click', () => {
  // on click, clear the image and/or text present
  context.clearRect(0, 0, canvas.width, canvas.height);
  // toggle relevant buttons
  textTop.value = '';
  textBottom.value = '';
  generateButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;
  textTop.disabled = false;
  textBottom.disabled = false;
  voiceSelect.disabled = true;
});

readButton.addEventListener('click', () => {
  // on click, have the browser speak the text in the two inputs with ids text-top and text-bottom out loud using the selected voice type in the voice-selection dropdown
  let utterTop = new SpeechSynthesisUtterance(textTop.value);
  let utterBottom = new SpeechSynthesisUtterance(textBottom.value);
  let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterTop.voice = voices[i];
      utterBottom.voice = voices[i];
    }
  }
  // update the volume value to increase or decrease the volume at which the text is read if the read text button is clicked
  utterTop.volume = volumeSlider.value / 100;
  utterBottom.volume = volumeSlider.value / 100;
  synth.speak(utterTop);
  synth.speak(utterBottom);
});

function populateVoiceList() {
  voices = synth.getVoices();

  for (var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

volumeSlider.addEventListener('input', () => {
  // change the volume icons depending on the following volume ranges: (note: you can find these icons in the icons directory)
  if (volumeSlider.value == 0) {
    volumeIcon.src = 'icons/volume-level-0.svg';
    volumeIcon.alt = 'Volume Level 0';
  }
  else if (volumeSlider.value <= 33) {
    volumeIcon.src = 'icons/volume-level-1.svg';
    volumeIcon.alt = 'Volume Level 1';
  }
  else if (volumeSlider.value <= 66) {
    volumeIcon.src = 'icons/volume-level-2.svg';
    volumeIcon.alt = 'Volume Level 2';
  }
  else {
    volumeIcon.src = 'icons/volume-level-3.svg';
    volumeIcon.alt = 'Volume Level 3';
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
