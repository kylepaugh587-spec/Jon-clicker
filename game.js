const SAVE_KEY = "jonClickerUltimateDesktopPlusSave";

let jons = 0;
let souls = 0;
let baseClickPower = 1;
let baseAutoPower = 0;
let multiplier = 1;
let totalClicks = 0;
let totalRebirths = 0;
let prestigeBonus = 1;
let offlineLastGain = 0;
let lastSeen = Date.now();

const costScale = 1.1;
const soulCostScale = 1.1;

const tiers = [
  { name: "Starter", need: 0 },
  { name: "Bronze", need: 1e4 },
  { name: "Silver", need: 1e6 },
  { name: "Gold", need: 1e8 },
  { name: "Platinum", need: 1e10 },
  { name: "Mythic", need: 1e12 },
  { name: "Cosmic", need: 1e15 }
];

const upgradeDefaults = [
  { name: "Finger Training", type: "click", amount: 1, cost: 10, tier: 0 },
  { name: "Jon Factory", type: "auto", amount: 1, cost: 100, tier: 0 },
  { name: "Jon Empire", type: "click", amount: 5, cost: 1000, tier: 0 },
  { name: "Jon Reactor", type: "auto", amount: 25, cost: 10000, tier: 1 },
  { name: "Ultra Jon Core", type: "click", amount: 100, cost: 100000, tier: 1 },
  { name: "Jon Mine", type: "auto", amount: 200, cost: 500000, tier: 2 },
  { name: "Jon Cannon", type: "click", amount: 750, cost: 2500000, tier: 2 },
  { name: "Jon Lab", type: "auto", amount: 2500, cost: 15000000, tier: 3 },
  { name: "Jon Dimension", type: "click", amount: 10000, cost: 100000000, tier: 3 },
  { name: "Jon Galaxy", type: "auto", amount: 50000, cost: 750000000, tier: 4 },
  { name: "Jon Singularity", type: "click", amount: 250000, cost: 5000000000, tier: 4 },
  { name: "Jon Infinity Forge", type: "auto", amount: 1000000, cost: 50000000000, tier: 5 },
  { name: "Jon Nova Engine", type: "click", amount: 5000000, cost: 300000000000, tier: 5 },
  { name: "Jon Void Plant", type: "auto", amount: 20000000, cost: 2500000000000, tier: 6 },
  { name: "Jon Crown of Time", type: "click", amount: 100000000, cost: 20000000000000, tier: 6 }
];

let upgrades = upgradeDefaults.map(u => ({...u, owned: 0}));

const soulUpgradeDefaults = [
  { name: "Soul Strength", add: 0.5, cost: 5 },
  { name: "Soul Surge", add: 1, cost: 25 },
  { name: "Soul Engine", add: 2, cost: 100 },
  { name: "Soul Flame", add: 5, cost: 500 },
  { name: "Soul Storm", add: 10, cost: 2500 },
  { name: "Soul Crown", add: 25, cost: 10000 },
  { name: "Soul Void", add: 100, cost: 100000 },
  { name: "Soul Eternity", add: 500, cost: 1000000 }
];

let soulUpgrades = soulUpgradeDefaults.map(u => ({...u, owned: 0}));

const skillDefaults = [
  { id: "rebirthBoost", name: "Rebirth Wisdom", desc: "+25% souls gained on rebirth.", cost: 10, tier: 0, bought: false },
  { id: "autoBoost", name: "Automation Mastery", desc: "+50% auto Jon/s.", cost: 25, tier: 0, bought: false },
  { id: "clickBoost", name: "Finger of Destiny", desc: "+50% click power.", cost: 25, tier: 0, bought: false },
  { id: "offlineBoost", name: "Sleeping Riches", desc: "Offline gain works at 50% efficiency.", cost: 50, tier: 1, bought: false },
  { id: "bossBoost", name: "Boss Hunter", desc: "Boss rewards doubled.", cost: 100, tier: 1, bought: false },
  { id: "prestige", name: "Ancient Prestige", desc: "Permanent +25% power every rebirth.", cost: 250, tier: 2, bought: false },
  { id: "megaRebirth", name: "Soul Overflow", desc: "+100% rebirth soul gain.", cost: 500, tier: 2, bought: false }
];

let skills = skillDefaults.map(s => ({...s}));

const achievements = [
  { id: "click1", name: "First Jon", desc: "Reach 1 total click.", check: () => totalClicks >= 1, earned: false },
  { id: "click100", name: "Click Machine", desc: "Reach 100 total clicks.", check: () => totalClicks >= 100, earned: false },
  { id: "click1000", name: "Click Legend", desc: "Reach 1,000 total clicks.", check: () => totalClicks >= 1000, earned: false },
  { id: "jons1k", name: "Jon Rookie", desc: "Get 1,000 Jon's.", check: () => jons >= 1e3, earned: false },
  { id: "jons1m", name: "Jon Tycoon", desc: "Get 1,000,000 Jon's.", check: () => jons >= 1e6, earned: false },
  { id: "jons1b", name: "Jon Billionaire", desc: "Get 1,000,000,000 Jon's.", check: () => jons >= 1e9, earned: false },
  { id: "jons1t", name: "Jon Trillionaire", desc: "Get 1,000,000,000,000 Jon's.", check: () => jons >= 1e12, earned: false },
  { id: "rebirth1", name: "Soul Awakening", desc: "Rebirth 1 time.", check: () => totalRebirths >= 1, earned: false },
  { id: "rebirth5", name: "Soul Master", desc: "Rebirth 5 times.", check: () => totalRebirths >= 5, earned: false },
  { id: "rebirth25", name: "Soul King", desc: "Rebirth 25 times.", check: () => totalRebirths >= 25, earned: false },
  { id: "souls100", name: "Soul Collector", desc: "Own 100 Souls.", check: () => souls >= 100, earned: false },
  { id: "souls10k", name: "Soul Overlord", desc: "Own 10,000 Souls.", check: () => souls >= 10000, earned: false }
];

let boss = { active: false, hp: 0, maxHp: 0, rewardJons: 0, rewardSouls: 0, endTime: 0 };

function hasSkill(id) {
  const s = skills.find(x => x.id === id);
  return !!(s && s.bought);
}

function currentTierIndex() {
  let index = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (jons >= tiers[i].need) index = i;
  }
  return index;
}

function getClickPower() {
  let value = baseClickPower * multiplier * prestigeBonus;
  if (hasSkill("clickBoost")) value *= 1.5;
  return value;
}

function getAutoPower() {
  let value = baseAutoPower * multiplier * prestigeBonus;
  if (hasSkill("autoBoost")) value *= 1.5;
  return value;
}

function calculateMultiplier() {
  multiplier = 1;
  soulUpgrades.forEach(u => multiplier += u.owned * u.add);
}

function clickJon() {
  const gain = getClickPower();
  jons += gain;
  totalClicks++;
  showClickEffect("+" + formatNumber(gain));
  checkAchievements();
  update();
}
document.getElementById("jonButton").onclick = clickJon;

function buyUpgrade(index) {
  const u = upgrades[index];
  if (currentTierIndex() < u.tier) return;
  if (jons >= u.cost) {
    jons -= u.cost;
    u.owned++;
    u.cost = Math.floor(u.cost * costScale);
    if (u.type === "click") baseClickPower += u.amount;
    if (u.type === "auto") baseAutoPower += u.amount;
    checkAchievements();
    update();
  }
}

function buySoulUpgrade(index) {
  const u = soulUpgrades[index];
  if (souls >= u.cost) {
    souls -= u.cost;
    u.owned++;
    u.cost = Math.floor(u.cost * soulCostScale);
    calculateMultiplier();
    checkAchievements();
    update();
  }
}

function buySkill(index) {
  const s = skills[index];
  if (s.bought || totalRebirths < s.tier || souls < s.cost) return;
  souls -= s.cost;
  s.bought = true;
  if (s.id === "prestige") prestigeBonus += totalRebirths * 0.25;
  calculateMultiplier();
  update();
}

function getRebirthGain() {
  if (jons < 1e6) return 0;
  let gained = Math.floor(Math.sqrt(jons / 100000));
  if (hasSkill("rebirthBoost")) gained = Math.floor(gained * 1.25);
  if (hasSkill("megaRebirth")) gained = Math.floor(gained * 2);
  return Math.max(gained, 1);
}

function rebirth() {
  const gained = getRebirthGain();
  if (gained <= 0) return;
  souls += gained;
  totalRebirths++;
  if (hasSkill("prestige")) prestigeBonus += 0.25;
  jons = 0;
  baseClickPower = 1;
  baseAutoPower = 0;
  upgrades = upgradeDefaults.map(u => ({...u, owned: 0}));
  calculateMultiplier();
  checkAchievements();
  update();
}

function spawnBoss() {
  if (boss.active) return;
  boss.active = true;
  const tier = currentTierIndex() + 1;
  boss.maxHp = Math.max(100, Math.floor(getClickPower() * 30 * tier));
  boss.hp = boss.maxHp;
  boss.rewardJons = Math.floor(getAutoPower() * 120 + getClickPower() * 50 + tier * 5000);
  boss.rewardSouls = Math.max(1, Math.floor(tier * 2));
  if (hasSkill("bossBoost")) {
    boss.rewardJons *= 2;
    boss.rewardSouls *= 2;
  }
  boss.endTime = Date.now() + 30000;
  updateBossUI();
}

function hitBoss() {
  if (!boss.active) return;
  const damage = getClickPower() * 3;
  boss.hp -= damage;
  showClickEffect("-" + formatNumber(damage));
  if (boss.hp <= 0) {
    jons += boss.rewardJons;
    souls += boss.rewardSouls;
    boss.active = false;
    boss.hp = 0;
    updateBossUI("Boss defeated! +" + formatNumber(boss.rewardJons) + " Jon's, +" + formatNumber(boss.rewardSouls) + " Souls");
    checkAchievements();
    update();
    return;
  }
  updateBossUI();
}

function tickBoss() {
  if (!boss.active) return;
  if (Date.now() >= boss.endTime) {
    boss.active = false;
    boss.hp = 0;
    updateBossUI("Boss escaped.");
  } else updateBossUI();
}

function updateBossUI(customText) {
  const text = document.getElementById("bossText");
  const bar = document.getElementById("bossBar");
  const btn = document.getElementById("bossButton");
  if (!boss.active) {
    text.textContent = customText || "No boss active.";
    bar.style.width = "0%";
    btn.disabled = true;
    return;
  }
  const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
  text.textContent = customText || ("Boss HP: " + formatNumber(boss.hp) + " / " + formatNumber(boss.maxHp) + " | Reward: " + formatNumber(boss.rewardJons) + " Jon's + " + formatNumber(boss.rewardSouls) + " Souls");
  bar.style.width = pct + "%";
  btn.disabled = false;
}

function showClickEffect(text) {
  const effects = document.getElementById("clickEffects");
  const div = document.createElement("div");
  div.className = "floatText";
  div.textContent = text;
  div.style.left = (35 + Math.random() * 180) + "px";
  div.style.top = (80 + Math.random() * 50) + "px";
  effects.appendChild(div);
  setTimeout(() => div.remove(), 800);
}

function formatNumber(num) {
  if (num < 1000) return Math.floor(num).toLocaleString();
  const names = [
    { value: 1e63, symbol: "Vg" }, { value: 1e60, symbol: "Nd" }, { value: 1e57, symbol: "Od" },
    { value: 1e54, symbol: "Spd" }, { value: 1e51, symbol: "Sxd" }, { value: 1e48, symbol: "Qid" },
    { value: 1e45, symbol: "Qad" }, { value: 1e42, symbol: "Td" }, { value: 1e39, symbol: "Dd" },
    { value: 1e36, symbol: "Ud" }, { value: 1e33, symbol: "Dc" }, { value: 1e30, symbol: "No" },
    { value: 1e27, symbol: "Oc" }, { value: 1e24, symbol: "Sp" }, { value: 1e21, symbol: "Sx" },
    { value: 1e18, symbol: "Qi" }, { value: 1e15, symbol: "Qa" }, { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" }, { value: 1e6, symbol: "M" }, { value: 1e3, symbol: "K" }
  ];
  for (const item of names) if (num >= item.value) return (num / item.value).toFixed(2) + " " + item.symbol;
  return Math.floor(num).toLocaleString();
}

function renderUpgradeButtons() {
  const box = document.getElementById("upgradeList");
  box.innerHTML = "";
  const tierIndex = currentTierIndex();
  upgrades.forEach((u, i) => {
    const btn = document.createElement("button");
    btn.className = "upgradeBtn" + (tierIndex < u.tier ? " locked" : "");
    btn.onclick = () => buyUpgrade(i);
    const kind = u.type === "click" ? "Click Power" : "Auto Jon/s";
    btn.innerHTML = "<strong>" + u.name + "</strong><br><span class='upgradeDesc'>+" + formatNumber(u.amount) + " " + kind + "<br>Owned: " + u.owned + "<br>Cost: " + formatNumber(u.cost) + " Jon's<br>Unlock Tier: " + tiers[u.tier].name + "</span>";
    box.appendChild(btn);
  });
}

function renderSoulUpgradeButtons() {
  const box = document.getElementById("soulUpgradeList");
  box.innerHTML = "";
  soulUpgrades.forEach((u, i) => {
    const btn = document.createElement("button");
    btn.onclick = () => buySoulUpgrade(i);
    btn.innerHTML = "<strong>" + u.name + "</strong><br><span class='upgradeDesc'>+" + u.add.toFixed(2) + "x Multiplier<br>Owned: " + u.owned + "<br>Cost: " + formatNumber(u.cost) + " Souls</span>";
    box.appendChild(btn);
  });
}

function renderSkills() {
  const box = document.getElementById("skillTree");
  box.innerHTML = "";
  skills.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.className = "skillBtn" + ((totalRebirths < s.tier || s.bought) ? " locked" : "");
    btn.onclick = () => buySkill(i);
    btn.innerHTML = "<strong>" + s.name + "</strong><br><span class='upgradeDesc'>" + s.desc + "<br>Cost: " + formatNumber(s.cost) + " Souls<br>Unlock: " + s.tier + " rebirths<br>Status: " + (s.bought ? "Owned" : "Not owned") + "</span>";
    box.appendChild(btn);
  });
}

function updateAchievementDisplay() {
  const box = document.getElementById("achievementList");
  box.innerHTML = "";
  achievements.forEach(a => {
    const div = document.createElement("div");
    div.className = "achievement" + (a.earned ? " done" : "");
    div.innerHTML = "<strong>" + a.name + "</strong><br>" + a.desc + (a.earned ? "<br>Unlocked!" : "");
    box.appendChild(div);
  });
}

function updateTierDisplay() {
  const box = document.getElementById("tierList");
  box.innerHTML = "";
  const current = currentTierIndex();
  tiers.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "tierItem" + (current >= i ? " done" : "");
    div.innerHTML = "<strong>" + t.name + "</strong><br>Need " + formatNumber(t.need) + " Jon's";
    box.appendChild(div);
  });
  document.getElementById("currentTier").textContent = tiers[current].name;
}

function checkAchievements() {
  achievements.forEach(a => { if (!a.earned && a.check()) a.earned = true; });
  updateAchievementDisplay();
}

function applyOfflineGain() {
  const now = Date.now();
  const secondsAway = Math.floor((now - lastSeen) / 1000);
  let gain = 0;
  if (secondsAway > 5 && hasSkill("offlineBoost")) {
    const capped = Math.min(secondsAway, 8 * 60 * 60);
    gain = Math.floor(getAutoPower() * capped * 0.5);
    jons += gain;
  }
  offlineLastGain = gain;
  lastSeen = now;
}

function getSaveData() {
  return {
    jons, souls, baseClickPower, baseAutoPower, multiplier, totalClicks, totalRebirths,
    prestigeBonus, offlineLastGain, lastSeen,
    upgrades: upgrades.map(u => ({ cost: u.cost, owned: u.owned })),
    soulUpgrades: soulUpgrades.map(u => ({ cost: u.cost, owned: u.owned })),
    skills: skills.map(s => ({ id: s.id, bought: s.bought })),
    achievements: achievements.map(a => ({ id: a.id, earned: a.earned })),
    boss
  };
}

function applySaveData(data) {
  jons = data.jons ?? 0;
  souls = data.souls ?? 0;
  baseClickPower = data.baseClickPower ?? 1;
  baseAutoPower = data.baseAutoPower ?? 0;
  totalClicks = data.totalClicks ?? 0;
  totalRebirths = data.totalRebirths ?? 0;
  prestigeBonus = data.prestigeBonus ?? 1;
  offlineLastGain = 0;
  lastSeen = data.lastSeen ?? Date.now();

  if (Array.isArray(data.upgrades)) {
    data.upgrades.forEach((saved, i) => {
      if (upgrades[i]) {
        upgrades[i].cost = saved.cost ?? upgrades[i].cost;
        upgrades[i].owned = saved.owned ?? 0;
      }
    });
  }
  if (Array.isArray(data.soulUpgrades)) {
    data.soulUpgrades.forEach((saved, i) => {
      if (soulUpgrades[i]) {
        soulUpgrades[i].cost = saved.cost ?? soulUpgrades[i].cost;
        soulUpgrades[i].owned = saved.owned ?? 0;
      }
    });
  }
  if (Array.isArray(data.skills)) {
    data.skills.forEach(saved => {
      const found = skills.find(s => s.id === saved.id);
      if (found) found.bought = !!saved.bought;
    });
  }
  if (Array.isArray(data.achievements)) {
    data.achievements.forEach(saved => {
      const found = achievements.find(a => a.id === saved.id);
      if (found) found.earned = !!saved.earned;
    });
  }
  if (data.boss) boss = data.boss;

  calculateMultiplier();
  applyOfflineGain();
  checkAchievements();
  update();
}

function saveGame() {
  lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveData()));
  alert("Game saved.");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try { applySaveData(JSON.parse(raw)); } catch (e) { alert("Save could not be loaded."); }
}

function exportSave() {
  lastSeen = Date.now();
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(getSaveData()))));
  prompt("Copy your save code:", code);
}

function importSave() {
  const code = prompt("Paste your save code:");
  if (!code) return;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code))));
    applySaveData(data);
    saveGame();
  } catch (e) {
    alert("Invalid save code.");
  }
}

function wipeSave() {
  if (!confirm("Delete your save?")) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

function update() {
  document.getElementById("jons").textContent = formatNumber(jons);
  document.getElementById("souls").textContent = formatNumber(souls);
  document.getElementById("clickPower").textContent = formatNumber(getClickPower());
  document.getElementById("autoPower").textContent = formatNumber(getAutoPower());
  document.getElementById("multiplier").textContent = multiplier.toFixed(2);
  document.getElementById("rebirthGain").textContent = formatNumber(getRebirthGain());
  document.getElementById("totalRebirths").textContent = formatNumber(totalRebirths);
  document.getElementById("offlineInfo").textContent = formatNumber(offlineLastGain);
  renderUpgradeButtons();
  renderSoulUpgradeButtons();
  renderSkills();
  updateTierDisplay();
  updateAchievementDisplay();
  updateBossUI();
}

setInterval(() => {
  jons += getAutoPower();
  tickBoss();
  checkAchievements();
  update();
}, 1000);

setInterval(() => { if (!boss.active) spawnBoss(); }, 90000);

setInterval(() => {
  lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveData()));
}, 10000);

loadGame();
update();
updateBossUI();
