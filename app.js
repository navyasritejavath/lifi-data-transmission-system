
const messageInput = document.getElementById("message");
const transmitBtn = document.getElementById("transmitBtn");

const statusText = document.getElementById("status");
const dataSize = document.getElementById("dataSize");
const bitCount = document.getElementById("bitCount");
const transferCount = document.getElementById("transferCount");

const charCount = document.getElementById("charCount");
const led = document.getElementById("led");
const ledTitle = document.getElementById("ledTitle");
const ledDescription = document.getElementById("ledDescription");

const lightBeam = document.getElementById("lightBeam");
const particle = document.getElementById("particle");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const binaryOutput = document.getElementById("binaryOutput");
const binaryInfo = document.getElementById("binaryInfo");

const receiverStatus = document.getElementById("receiverStatus");
const receivedMessage = document.getElementById("receivedMessage");
const resultBadge = document.getElementById("resultBadge");

let successfulTransfers = 0;
let isTransmitting = false;

// Convert text into an array of bytes.
function textToBinary(text) {
  const bytes = new TextEncoder().encode(text);

  return {
    bytes,
    binary: Array.from(bytes, byte =>
      byte.toString(2).padStart(8, "0")
    ).join("")
  };
}

// Convert binary data back into text.
function binaryToText(binary) {
  const bytes = [];

  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    bytes.push(parseInt(byte, 2));
  }

  return new TextDecoder("utf-8", { fatal: true })
    .decode(new Uint8Array(bytes));
}

// Small delay used during the animation.
function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Update the LED and simulated light channel.
function showLightSignal(bit) {
  if (bit === "1") {
    led.classList.add("on");
    lightBeam.style.width = "100%";
  } else {
    led.classList.remove("on");
    lightBeam.style.width = "0%";
  }
}

// Reset the dashboard before a new transmission.
function resetDashboard() {
  progressBar.style.width = "0%";
  progressText.textContent = "0%";

  led.classList.remove("on");
  lightBeam.style.width = "0%";
  particle.classList.remove("moving");

  binaryOutput.textContent = "Preparing binary data...";
  binaryInfo.textContent = "Encoding";
  receivedMessage.textContent =
    "Your decoded message will appear here.";
  receiverStatus.textContent = "Waiting for transmission...";
  resultBadge.textContent = "TRANSMITTING";
  resultBadge.className = "result-badge";
}

// Main transmission function.
async function transmitData() {
  if (isTransmitting) return;

  const message = messageInput.value;

  if (!message.trim()) {
    statusText.textContent = "Enter a message";
    receiverStatus.textContent =
      "No data received. Enter a message first.";
    return;
  }

  isTransmitting = true;
  transmitBtn.disabled = true;

  try {
    resetDashboard();

    // Step 1: Encode the message.
    const encoded = textToBinary(message);
    const bytes = encoded.bytes;
    const binary = encoded.binary;

    dataSize.textContent = `${bytes.length} bytes`;
    bitCount.textContent = `${binary.length} bits`;

    // Group binary digits into 8-bit bytes.
    binaryOutput.textContent =
      binary.match(/.{1,8}/g).join(" ");

    binaryInfo.textContent = `${binary.length} bits`;
    statusText.textContent = "Transmitting";
    ledTitle.textContent = "LED Active";
    ledDescription.textContent =
      "Flashing to represent binary data";

    particle.classList.add("moving");

    // Step 2: Simulate the light transmission.
    // The dashboard animation is shortened for demonstration.
    const totalSteps = Math.min(binary.length, 50);

    for (let step = 0; step < totalSteps; step++) {
      const bitIndex = Math.floor(
        (step / totalSteps) * binary.length
      );

      const bit = binary[bitIndex];
      showLightSignal(bit);

      const progress = Math.round(
        ((step + 1) / totalSteps) * 100
      );

      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;

      await wait(45);
    }

    // Step 3: Decode the original binary data.
    led.classList.remove("on");
    lightBeam.style.width = "0%";
    particle.classList.remove("moving");

    const decodedMessage = binaryToText(binary);

    // Step 4: Show the received message.
    receivedMessage.textContent = decodedMessage;
    receiverStatus.textContent = "Data received successfully";

    if (decodedMessage === message) {
      successfulTransfers++;
      transferCount.textContent = successfulTransfers;
      statusText.textContent = "Completed";
      resultBadge.textContent = "SUCCESS";
      resultBadge.className = "result-badge success";
      binaryInfo.textContent = "Transmission complete";
      ledTitle.textContent = "Transmission Complete";
      ledDescription.textContent =
        "The simulated light signal has finished";
    } else {
      statusText.textContent = "Verification failed";
      resultBadge.textContent = "ERROR";
      resultBadge.className = "result-badge error";
    }
  } catch (error) {
    statusText.textContent = "Error";
    receiverStatus.textContent = "Unable to decode data";
    resultBadge.textContent = "ERROR";
    resultBadge.className = "result-badge error";
    ledDescription.textContent = "Please try again.";
    console.error(error);
  } finally {
    isTransmitting = false;
    transmitBtn.disabled = false;
  }
}

// Update the character counter while typing.
function updateCharacterCount() {
  charCount.textContent =
    `${messageInput.value.length} / 250`;
}

messageInput.addEventListener("input", updateCharacterCount);
transmitBtn.addEventListener("click", transmitData);

// Set initial dashboard values.
updateCharacterCount();
transferCount.textContent = successfulTransfers;
