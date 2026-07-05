// ================== ELEMENTS ==================
const board = document.getElementById("gameBoard");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const popup = document.getElementById("winPopup");
const starsEl = document.getElementById("stars");
const bestScoreEl = document.getElementById("bestScore");
const leaderboardEl = document.getElementById("leaderboard");
const difficultySelect = document.getElementById("difficulty");


const emojis = ["🍎","🍌","🍇","🍉","🍒","🥝","🍍","🥥"];

let cards = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let time = 0;
let timer;

let soundOn = true;

const flipSound = new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3");
const matchSound = new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3");
const winSound = new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");

function playSound(sound) {
  if (soundOn) sound.play();
}


function getEmojisByDifficulty() {
  let selected = difficultySelect.value;

  if (selected === "easy") return emojis.slice(0, 4);
  if (selected === "medium") return emojis.slice(0, 8);
  if (selected === "hard") return [...emojis, "🍓","🍑","🥭","🍈"];
}


function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}


function startTimer() {
  timer = setInterval(() => {
    time++;
    timerEl.innerText = time;
  }, 1000);
}


function updateStars() {
  if (moves <= 10) starsEl.innerText = "⭐⭐⭐";
  else if (moves <= 20) starsEl.innerText = "⭐⭐";
  else starsEl.innerText = "⭐";
}


function createBoard() {
  board.innerHTML = "";

  let selectedEmojis = getEmojisByDifficulty();
  cards = [...selectedEmojis, ...selectedEmojis];

  shuffle(cards);

  // Dynamic grid
  let size = Math.sqrt(cards.length);
  board.style.gridTemplateColumns = `repeat(${size}, 100px)`;

  cards.forEach((emoji) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = emoji;

    // 3D flip structure
    card.innerHTML = `
      <div class="card-inner">
        <div class="front">?</div>
        <div class="back">${emoji}</div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}


function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;

  if (time === 0) startTimer();

  playSound(flipSound);

  this.classList.add("flipped");
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.innerText = moves;
    updateStars();
    checkMatch();
  }
}


function checkMatch() {
  let [card1, card2] = flippedCards;

  if (card1.dataset.value === card2.dataset.value) {
    playSound(matchSound);
    matchedPairs++;
    flippedCards = [];

    if (matchedPairs === cards.length / 2) {
      clearInterval(timer);
      playSound(winSound);
      showWin();
    }

  } else {
    lockBoard = true;

    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
      lockBoard = false;
    }, 700);
  }
}


function showWin() {
  document.getElementById("finalTime").innerText = time;
  document.getElementById("finalMoves").innerText = moves;
  document.getElementById("finalStars").innerText = starsEl.innerText;

  saveBestScore();
  updateLeaderboard();

  popup.style.display = "flex";
}


function saveBestScore() {
  let best = localStorage.getItem("bestScore");

  if (!best || time < JSON.parse(best).time) {
    let data = { time, moves };
    localStorage.setItem("bestScore", JSON.stringify(data));
  }

  showBestScore();
}

function showBestScore() {
  let best = JSON.parse(localStorage.getItem("bestScore"));

  if (best) {
    bestScoreEl.innerText = `${best.time}s | ${best.moves} moves`;
  }
}


function updateLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];

  scores.push({ time, moves });

  scores.sort((a, b) => a.time - b.time);
  scores = scores.slice(0, 5);

  localStorage.setItem("leaderboard", JSON.stringify(scores));

  leaderboardEl.innerHTML = "";

  scores.forEach((s) => {
    let li = document.createElement("li");
    li.innerText = `${s.time}s - ${s.moves} moves`;
    leaderboardEl.appendChild(li);
  });
}


function restartGame() {
  flippedCards = [];
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  time = 0;

  movesEl.innerText = 0;
  timerEl.innerText = 0;
  starsEl.innerText = "⭐⭐⭐";

  clearInterval(timer);
  popup.style.display = "none";

  createBoard();
}


document.getElementById("startBtn").addEventListener("click", restartGame);


createBoard();
showBestScore();
updateLeaderboard();