const STORAGE_KEY = "jonway-serfers-save";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const coinsEl = document.getElementById("coins");
const distanceEl = document.getElementById("distance");
const bestEl = document.getElementById("best");
const speedLevelEl = document.getElementById("speedLevel");
const magnetLevelEl = document.getElementById("magnetLevel");
const shieldLevelEl = document.getElementById("shieldLevel");

const speedCostEl = document.getElementById("speedCost");
const magnetCostEl = document.getElementById("magnetCost");
const shieldCostEl = document.getElementById("shieldCost");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const restartBtn = document.getElementById("restartBtn");

const lanes = [105, 210, 315];
const player = { lane: 1, y: 540, w: 44, h: 60, color: "#56e39f" };
const chaser = { lane: 1, y: 610, w: 44, h: 60, color: "#ff5f56" };

const state = {
  coins: 0,
  runCoins: 0,
  distance: 0,
  bestDistance: 0,
  speedLevel: 0,
  magnetLevel: 0,
  shieldLevel: 0,
  shields: 0,
  playing: true,
  elapsed: 0,
  obstacles: [],
  coinDrops: [],
};

function speedCost() {
  return 15 + state.speedLevel * 15;
}

function magnetCost() {
  return 20 + state.magnetLevel * 20;
}

function shieldCost() {
  return 25 + state.shieldLevel * 25;
}

function saveGame() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      coins: state.coins,
      bestDistance: state.bestDistance,
      speedLevel: state.speedLevel,
      magnetLevel: state.magnetLevel,
      shieldLevel: state.shieldLevel,
    })
  );
}

function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.coins = data.coins || 0;
    state.bestDistance = data.bestDistance || 0;
    state.speedLevel = data.speedLevel || 0;
    state.magnetLevel = data.magnetLevel || 0;
    state.shieldLevel = data.shieldLevel || 0;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetRun() {
  state.runCoins = 0;
  state.distance = 0;
  state.elapsed = 0;
  state.obstacles = [];
  state.coinDrops = [];
  state.playing = true;
  state.shields = state.shieldLevel;
  player.lane = 1;
  chaser.lane = 1;
  chaser.y = 610;
  overlay.classList.add("hidden");
}

function updateHUD() {
  coinsEl.textContent = state.coins;
  distanceEl.textContent = Math.floor(state.distance);
  bestEl.textContent = Math.floor(state.bestDistance);
  speedLevelEl.textContent = state.speedLevel;
  magnetLevelEl.textContent = state.magnetLevel;
  shieldLevelEl.textContent = state.shieldLevel;
  speedCostEl.textContent = speedCost();
  magnetCostEl.textContent = magnetCost();
  shieldCostEl.textContent = shieldCost();
}

function spawnObstacle() {
  state.obstacles.push({ lane: Math.floor(Math.random() * 3), y: -50, w: 50, h: 50 });
}

function spawnCoin() {
  state.coinDrops.push({ lane: Math.floor(Math.random() * 3), y: -20, r: 12 });
}

function rectHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gameOver() {
  state.playing = false;
  state.coins += state.runCoins;
  if (state.distance > state.bestDistance) state.bestDistance = state.distance;
  saveGame();
  updateHUD();
  overlayTitle.textContent = "Caught by Jon!";
  overlayText.textContent = `Run coins: ${state.runCoins} • Distance: ${Math.floor(state.distance)}m`;
  overlay.classList.remove("hidden");
}

function tryBuy(kind) {
  if (kind === "speed") {
    const cost = speedCost();
    if (state.coins < cost) return;
    state.coins -= cost;
    state.speedLevel += 1;
  }
  if (kind === "magnet") {
    const cost = magnetCost();
    if (state.coins < cost) return;
    state.coins -= cost;
    state.magnetLevel += 1;
  }
  if (kind === "shield") {
    const cost = shieldCost();
    if (state.coins < cost) return;
    state.coins -= cost;
    state.shieldLevel += 1;
  }
  saveGame();
  updateHUD();
}

function drawRoad(scroll) {
  ctx.fillStyle = "#243867";
  ctx.fillRect(60, 0, 300, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 4;
  for (let i = -80; i < canvas.height + 80; i += 80) {
    const y = (i + scroll) % (canvas.height + 80) - 80;
    ctx.beginPath();
    ctx.moveTo(160, y);
    ctx.lineTo(160, y + 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(260, y);
    ctx.lineTo(260, y + 40);
    ctx.stroke();
  }
}

function drawRunner(entity, label) {
  const x = lanes[entity.lane] - entity.w / 2;
  ctx.fillStyle = entity.color;
  ctx.fillRect(x, entity.y - entity.h, entity.w, entity.h);
  ctx.fillStyle = "#fff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, lanes[entity.lane], entity.y - entity.h - 6);
}

function loop(ts) {
  const dt = Math.min(0.033, (ts - (loop.last || ts)) / 1000);
  loop.last = ts;

  const speed = 220 + state.speedLevel * 16;
  state.elapsed += dt;

  if (state.playing) {
    state.distance += dt * (speed / 10);

    if (Math.random() < dt * 1.65) spawnObstacle();
    if (Math.random() < dt * 1.5) spawnCoin();

    for (const obstacle of state.obstacles) obstacle.y += speed * dt;
    for (const coin of state.coinDrops) coin.y += speed * dt;

    const playerRect = {
      x: lanes[player.lane] - player.w / 2,
      y: player.y - player.h,
      w: player.w,
      h: player.h,
    };

    for (const obstacle of state.obstacles) {
      const obstacleRect = {
        x: lanes[obstacle.lane] - obstacle.w / 2,
        y: obstacle.y - obstacle.h,
        w: obstacle.w,
        h: obstacle.h,
      };
      if (rectHit(playerRect, obstacleRect)) {
        if (state.shields > 0) {
          state.shields -= 1;
          obstacle.y = canvas.height + 100;
        } else {
          gameOver();
          break;
        }
      }
    }

    for (const coin of state.coinDrops) {
      const dx = lanes[player.lane] - lanes[coin.lane];
      const magnetRange = 20 + state.magnetLevel * 24;
      if (Math.abs(dx) <= magnetRange && coin.y > 380) {
        coin.lane = player.lane;
      }

      const distY = Math.abs((player.y - player.h / 2) - coin.y);
      if (coin.lane === player.lane && distY < 36) {
        state.runCoins += 1;
        coin.y = canvas.height + 100;
      }
    }

    state.obstacles = state.obstacles.filter((o) => o.y < canvas.height + 100);
    state.coinDrops = state.coinDrops.filter((c) => c.y < canvas.height + 50);

    const pressure = 0.6 + state.distance / 1300;
    chaser.y -= (speed * 0.55 - pressure * 20) * dt;
    if (chaser.y < player.y + 25) gameOver();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad((state.elapsed * speed * 0.65) % (canvas.height + 80));

  ctx.fillStyle = "#ffb703";
  for (const coin of state.coinDrops) {
    ctx.beginPath();
    ctx.arc(lanes[coin.lane], coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#8d99ae";
  for (const obstacle of state.obstacles) {
    ctx.fillRect(lanes[obstacle.lane] - obstacle.w / 2, obstacle.y - obstacle.h, obstacle.w, obstacle.h);
  }

  drawRunner(player, "YOU");
  drawRunner(chaser, "JON");

  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Run coins: ${state.runCoins}`, 12, 24);
  ctx.fillText(`Shields: ${state.shields}`, 12, 44);

  distanceEl.textContent = Math.floor(state.distance);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    player.lane = Math.max(0, player.lane - 1);
  }
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    player.lane = Math.min(2, player.lane + 1);
  }
});

document.getElementById("buySpeed").addEventListener("click", () => tryBuy("speed"));
document.getElementById("buyMagnet").addEventListener("click", () => tryBuy("magnet"));
document.getElementById("buyShield").addEventListener("click", () => tryBuy("shield"));
restartBtn.addEventListener("click", resetRun);

loadGame();
updateHUD();
resetRun();
requestAnimationFrame(loop);
