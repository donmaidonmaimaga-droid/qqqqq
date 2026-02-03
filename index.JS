const game = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const successText = document.getElementById("success");
const missText = document.getElementById("miss");
const timeText = document.getElementById("time");
const message = document.getElementById("message");

let eye, pupil;
let success, miss, time, gameOver;
let timer, pupilTimer, blinkTimeout;
let isClosed = false;

// 目を作る
function createEye() {
  eye = document.createElement("div");
  eye.className = "eye";
  eye.style.left = "100px";
  eye.style.top = "100px";

  pupil = document.createElement("div");
  pupil.className = "pupil";

  eye.appendChild(pupil);
  game.appendChild(eye);
}

// 黒目ランダム移動
function movePupil() {
  if (isClosed) return;
  const x = Math.random() * 80;
  const y = Math.random() * 20;
  pupil.style.left = 40 + x + "px";
  pupil.style.top = 20 + y + "px";
}

// ランダム瞬き
function blink() {
  if (gameOver) return;

  isClosed = true;
  eye.classList.add("closed");
  pupil.style.display = "none";

  setTimeout(() => {
    isClosed = false;
    eye.classList.remove("closed");
    pupil.style.display = "block";
    scheduleBlink();
  }, 350);
}

function scheduleBlink() {
  const interval = 700 + Math.random() * 900;
  blinkTimeout = setTimeout(blink, interval);
}

// ゲーム開始
function startGame() {
  game.innerHTML = "";
  createEye();

  success = 0;
  miss = 0;
  time = 20;
  gameOver = false;

  successText.textContent = success;
  missText.textContent = miss;
  timeText.textContent = time;
  message.textContent = "";

  game.style.display = "block";
  startBtn.style.display = "none";
  restartBtn.style.display = "none";

  movePupil();
  pupilTimer = setInterval(movePupil, 700);
  scheduleBlink();

  timer = setInterval(() => {
    if (gameOver) return;
    time--;
    timeText.textContent = time;
    if (time === 0) endGame("⏰ タイムアップ");
  }, 1000);
}

// クリック → 目薬生成
game.addEventListener("click", (e) => {
  if (gameOver) return;

  const rect = game.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const drop = document.createElement("div");
  drop.className = "drop";
  drop.style.left = x - 7 + "px";
  drop.style.top = "-20px";
  game.appendChild(drop);

  // 落下アニメーション中の判定
  let dropY = 0;
  const fallSpeed = 4; // 1フレームあたり落下量
  let successHit = false;

  const fallInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(fallInterval);
      drop.remove();
      return;
    }

    dropY += fallSpeed;
    drop.style.top = dropY + "px";

    const dropRect = drop.getBoundingClientRect();
    const eyeRect = eye.getBoundingClientRect();

    // 目が開いていて当たったら成功
    if (!isClosed &&
        dropRect.left < eyeRect.right &&
        dropRect.right > eyeRect.left &&
        dropRect.top < eyeRect.bottom &&
        dropRect.bottom > eyeRect.top) {
      success++;
      successText.textContent = success;
      eye.classList.remove("red");
      successHit = true;
      drop.remove();
      clearInterval(fallInterval);
      if (success === 3) endGame("🎉 クリア！");
    }

    // 画面下まで到達したら失敗（当たってなければ）
    if (dropY > game.clientHeight && !successHit) {
      miss++;
      missText.textContent = miss;
      eye.classList.add("red");
      drop.remove();
      clearInterval(fallInterval);
      if (miss === 3) endGame("💀 ゲームオーバー");
    }
  }, 16); // 約60FPS
});

// 終了
function endGame(text) {
  gameOver = true;
  message.textContent = text;
  clearInterval(timer);
  clearInterval(pupilTimer);
  clearTimeout(blinkTimeout);
  restartBtn.style.display = "inline-block";
}

// ボタン
startBtn.onclick = startGame;
restartBtn.onclick = startGame;
