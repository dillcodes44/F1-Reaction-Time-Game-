// ========== GAME STATE VARIABLES ==========
// These variables keep track of what's happening in the game

let gameState = "idle";       // Tracks the current phase: "idle", "waiting", "go", "result"
let startTime = null;         // Stores the exact moment the screen turned green
let waitTimer = null;         // Stores the random delay timer so we can cancel it if needed
let bestScore = null;         // Stores the best reaction time (null means no score yet)
let totalTries = 0;           // Counts how many times the player has played


// ========== FEATURE 1: START GAME ==========
// This function runs when the player clicks the START RACE button
// It lights up the F1 lights one by one, then waits a random time before going green

function startGame() {

  // If a round is already happening, don't start another one
  if (gameState === "waiting" || gameState === "go") return;

  // Set the game state to waiting - the player needs to wait for green
  gameState = "waiting";

  // Hide the result box from the last round (if it was showing)
  document.getElementById("result-box").classList.add("hidden");

  // Reset the game box back to red
  let gameBox = document.getElementById("game-box");
  gameBox.style.backgroundColor = "#e10600";    // F1 red
  gameBox.classList.remove("go");

  // Update the text in the middle of the screen
  document.getElementById("status-text").textContent = "GET READY...";
  document.getElementById("sub-text").textContent = "Lights are coming on";

  // Hide the start button while the game is running
  document.getElementById("start-btn").style.display = "none";

  // Turn off all 5 lights to start fresh
  turnOffAllLights();

  // Light up each light one at a time with a delay between each
  // setTimeout(function, delay) runs a function after a number of milliseconds
  setTimeout(() => turnOnLight(1), 500);
  setTimeout(() => turnOnLight(2), 1000);
  setTimeout(() => turnOnLight(3), 1500);
  setTimeout(() => turnOnLight(4), 2000);
  setTimeout(() => turnOnLight(5), 2500);

  // After all 5 lights are on, wait a random extra time then go green
  // Math.random() gives a number between 0 and 1
  // Multiplying by 3000 gives a random number between 0 and 3000 milliseconds
  let randomDelay = 2500 + Math.random() * 3000;

  // Save this timer in waitTimer so we can cancel it if the player clicks too early
  waitTimer = setTimeout(() => {
    goGreen();
  }, randomDelay);
}


// ========== LIGHT HELPERS ==========
// These small functions turn individual lights on and off

// Turns on one light by its number (1 through 5)
function turnOnLight(number) {
  let light = document.getElementById("light-" + number);  // Gets the light element
  light.classList.add("on");                                 // Adds the "on" class from CSS
}

// Turns off all 5 lights by removing the "on" class from each
function turnOffAllLights() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById("light-" + i).classList.remove("on");
  }
}


// ========== GO GREEN ==========
// This runs when it's time for the player to click
// Turns the screen green just like real F1 lights going out

function goGreen() {
  gameState = "go";   // Update the state so handleClick knows we're ready

  let gameBox = document.getElementById("game-box");
  gameBox.style.backgroundColor = "#00d800";   // Switch to green
  gameBox.classList.add("go");                  // Adds the "go" class (hides the lights in CSS)

  // Update the text
  document.getElementById("status-text").textContent = "GO! GO! GO!";
  document.getElementById("sub-text").textContent = "CLICK NOW!";

  // Record the exact time the screen turned green
  // Date.now() returns the current time in milliseconds
  startTime = Date.now();
}


// ========== FEATURE 2: HANDLE CLICK + SCORE TRACKER ==========
// This runs every time the player clicks anywhere on the game box
// It checks the game state and reacts differently depending on when they click

function handleClick() {

  // If they click before starting, do nothing
  if (gameState === "idle") return;

  // If they click too early (before the screen is green)
  if (gameState === "waiting") {
    // Cancel the green light timer so it doesn't fire after the early click
    clearTimeout(waitTimer);

    // Penalize the player
    gameState = "result";
    document.getElementById("game-box").style.backgroundColor = "#e10600"; // Back to red
    document.getElementById("status-text").textContent = "TOO EARLY!";
    document.getElementById("sub-text").textContent = "Jump start! Wait for the green light.";

    // Count this as a try even though they jumped the start
    totalTries++;
    updateStatsDisplay();

    // Turn off the lights
    turnOffAllLights();

    // Show the start button again so they can try again
    document.getElementById("start-btn").style.display = "inline-block";
    return;
  }

  // If the screen is green and they clicked at the right time
  if (gameState === "go") {
    // Calculate how long it took them to click after the screen turned green
    // Date.now() is the current time, startTime is when it turned green
    // Subtracting gives the reaction time in milliseconds
    let reactionTime = Date.now() - startTime;

    // Update the game state
    gameState = "result";

    // Count this as a completed race
    totalTries++;

    // Check if this is a new best score
    // bestScore is null if they've never scored before
    if (bestScore === null || reactionTime < bestScore) {
      bestScore = reactionTime;   // Save the new best
    }

    // Update the stats display with the new numbers
    updateStatsDisplay();

    // Show the result box with the reaction time
    let resultBox = document.getElementById("result-box");
    let resultText = document.getElementById("result-text");

    // Give a different message depending on how fast they were
    let message = "";
    if (reactionTime < 200) {
      message = "⚡ ALIEN REACTION! " + reactionTime + "ms";
    } else if (reactionTime < 300) {
      message = "🏆 WORLD CLASS! " + reactionTime + "ms";
    } else if (reactionTime < 400) {
      message = "🏎️ RACE DRIVER! " + reactionTime + "ms";
    } else if (reactionTime < 600) {
      message = "👍 SOLID LAP! " + reactionTime + "ms";
    } else {
      message = "💤 NEED MORE PRACTICE! " + reactionTime + "ms";
    }

    resultText.textContent = message;
    resultBox.classList.remove("hidden");   // Makes the result box visible

    // Reset the game box back to dark so it looks ready for another round
    document.getElementById("game-box").style.backgroundColor = "#0a0a0a";
    document.getElementById("status-text").textContent = "RACE COMPLETE";
    document.getElementById("sub-text").textContent = "";

    // Show the start button again
    document.getElementById("start-btn").style.display = "inline-block";
  }
}


// ========== UPDATE STATS DISPLAY ==========
// This updates the numbers shown on the Stats page
// It runs every time a race finishes

function updateStatsDisplay() {
  // Update the total tries number
  document.getElementById("total-tries").textContent = totalTries;

  // Update the best score - show "--" if no score yet, otherwise show the number
  if (bestScore !== null) {
    document.getElementById("best-score").textContent = bestScore;
  } else {
    document.getElementById("best-score").textContent = "--";
  }
}


// ========== SHOW SECTION ==========
// This switches between the RACE and PIT LANE STATS sections
// It hides one section and shows the other

function showSection(sectionName) {

  // Get both sections from the HTML
  let gameSection = document.getElementById("game-section");
  let statsSection = document.getElementById("stats-section");

  // Get both nav buttons
  let navGame = document.getElementById("nav-game");
  let navStats = document.getElementById("nav-stats");

  // Hide both sections first, then show only the one we want
  if (sectionName === "game") {
    gameSection.classList.remove("hidden");
    gameSection.classList.add("active");
    statsSection.classList.add("hidden");
    statsSection.classList.remove("active");

    // Update which nav button looks active
    navGame.classList.add("active");
    navStats.classList.remove("active");

  } else if (sectionName === "stats") {
    statsSection.classList.remove("hidden");
    statsSection.classList.add("active");
    gameSection.classList.add("hidden");
    gameSection.classList.remove("active");

    // Update which nav button looks active
    navStats.classList.add("active");
    navGame.classList.remove("active");
  }
}
