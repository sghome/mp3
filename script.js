// Importar la biblioteca MIDI
import { Midi } from "@tonejs/midi";

var Midi = require("@tonejs/midi").Midi;

// Variables para audio
var audio, audioContext, audioSrc;
var analyser, analyserBufferLength;

// Variables para la visualización
var w, h;
var center2D;
var btStart;
var canvas;
var context;
var imageData;
var data;
var mouseActive = false;
var mouseDown = false;
var mousePos = { x: 0, y: 0 };
var fov = 250;
var speed = 0.25;
var particles = [];
var particlesSky = [];
var particleDistanceTop = 10;

// Función principal de inicialización
async function init() {
  canvas = document.createElement("canvas");
  canvas.addEventListener("mousedown", mouseDownHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);
  canvas.addEventListener("mouseenter", mouseEnterHandler, false);
  canvas.addEventListener("mouseleave", mouseLeaveHandler, false);

  document.body.appendChild(canvas);

  context = canvas.getContext("2d");

  window.addEventListener("resize", onResize);

  onResize();

  addParticles(particles, 1);
  addParticles(particlesSky, -1);

  render();
  render();

  context.putImageData(imageData, 0, 0);

  btStart = document.getElementById("btStartAudioVisualization");
  btStart.addEventListener("mousedown", userStart, false);

  // Cargar y procesar el archivo MIDI y el MP3 al mismo tiempo
  await Promise.all([
    loadAndProcessMidi("https://sghome.github.io/mp3/go.mid"),
    audioSetup(
      "https://sghome.github.io/mp3/go.mp3"
    ),
  ]);

  animate();
}

// Función para cargar y procesar el archivo MIDI
async function loadAndProcessMidi(midiFilePath) {
  const response = await fetch(midiFilePath);
  const midiData = await response.arrayBuffer();
  const midi = new Midi(midiData);

  // Acceder a la información del MIDI, por ejemplo, obtener la lista de acordes
  const chords = midi.tracks[0].notes.map((note) => note.name);

  // Modificar la visualización según la información del MIDI
  for (let i = 0, l = particles.length; i < l; i++) {
    const particlesRow = particles[i];

    for (let j = 0, k = particlesRow.length; j < k; j++) {
      const particle = particlesRow[j];

      const chordIndex = (i * particlesRow.length + j) % chords.length;
      const chord = chords[chordIndex];

      // Cambiar el color de la línea según el acorde
      const color = chordToColor(chord);

      // Resto de la lógica de renderizado...
      // Por ejemplo, puedes usar color.r, color.g, color.b, color.a
    }
  }
}

// Función para convertir el acorde en un color
function chordToColor(chord) {
  switch (chord) {
    case "Cmaj":
      return { r: 255, g: 0, b: 0, a: 255 }; // Rojo para acorde mayor
    case "Amin":
      return { r: 0, g: 255, b: 0, a: 255 }; // Verde para acorde menor
    case "G7":
      return { r: 0, g: 0, b: 255, a: 255 }; // Azul para acorde séptimo
    default:
      return { r: 255, g: 255, b: 255, a: 255 }; // Color predeterminado
  }
}

// Función para cargar el archivo MP3 y configurar el audio
function audioSetup(mp3FilePath) {
  return new Promise((resolve) => {
    audio = new Audio();
    audio.src = mp3FilePath;
    audio.controls = false;
    audio.loop = true;
    audio.autoplay = true;
    audio.crossOrigin = "anonymous";

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioContext.createAnalyser();
    analyser.connect(audioContext.destination);
    analyser.smoothingTimeConstant = 0.75;
    analyser.fftSize = 512 * 32;
    analyserBufferLength = analyser.frequencyBinCount;

    audioSrc = audioContext.createMediaElementSource(audio);
    audioSrc.connect(analyser);

    // Resolver la promesa después de cargar el audio
    audio.addEventListener("canplaythrough", () => {
      resolve();
    });
  });
}

// Función para limpiar la imagen
function clearImageData() {
  for (let i = 0, l = data.length; i < l; i += 4) {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 255;
  }
}

// Función para establecer un píxel en la imagen
function setPixel(x, y, r, g, b, a) {
  const i = (x + y * imageData.width) * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

// Resto del código...
