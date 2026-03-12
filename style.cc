body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(to bottom, #0c0c0c, #181818, #101010);
  color: white;
  min-width: 1400px;
}

.container {
  width: 1400px;
  margin: 0 auto;
  padding: 20px 24px 40px;
}

h1 {
  text-align: center;
  margin-bottom: 18px;
  font-size: 42px;
}

.topStats {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.statCard {
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 0 10px rgba(0,0,0,0.25);
  text-align: center;
}

.label {
  font-size: 13px;
  opacity: 0.8;
}

.mainRow {
  display: grid;
  grid-template-columns: 360px 1fr 320px;
  gap: 20px;
  align-items: start;
}

.panel {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 0 14px rgba(0,0,0,0.28);
  margin-bottom: 18px;
}

.panel h2, .panel h3, .panel p {
  text-align: center;
}

.buttonWrap {
  position: relative;
  display: inline-block;
  margin: 6px auto 18px;
  width: 100%;
  text-align: center;
}

#jonButton {
  width: 320px;
  cursor: pointer;
  transition: transform 0.08s ease;
  user-select: none;
  border-radius: 18px;
  box-shadow: 0 0 20px rgba(255,255,255,0.12);
}

#jonButton:active {
  transform: scale(0.95);
}

#clickEffects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.floatText {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 24px;
  animation: floatUp 0.8s ease-out forwards;
  text-shadow: 0 0 8px rgba(255,255,255,0.45);
}

@keyframes floatUp {
  0% { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, -135px); }
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}

button {
  width: 100%;
  margin: 8px 0;
  padding: 12px;
  font-size: 15px;
  border: none;
  border-radius: 10px;
  background: #f0f0f0;
  cursor: pointer;
  transition: 0.15s ease;
}

button:hover {
  transform: scale(1.015);
  background: #ffffff;
}

.upgradeBtn.locked, .skillBtn.locked {
  opacity: 0.6;
}

.upgradeDesc {
  font-size: 13px;
  line-height: 1.35;
}

.achievement, .tierItem {
  margin: 8px 0;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  font-size: 14px;
}

.achievement.done, .tierItem.done {
  background: rgba(80, 220, 120, 0.2);
  border: 1px solid rgba(80, 220, 120, 0.35);
}

#bossBarWrap {
  width: 100%;
  height: 20px;
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
  overflow: hidden;
  margin: 10px 0 12px;
}

#bossBar {
  height: 100%;
  width: 0%;
  background: linear-gradient(to right, #70ff9c, #d6ff70);
}

#bossButton:disabled {
  opacity: 0.5;
  cursor: default;
}
