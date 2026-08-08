<script>
// ========== GAME VARIABLES ==========
let bike = { x: 150, y: 300, speed: 0, maxSpeed: 25 };
let roadOffset = 0;
let coins = [];
let cars = [];
let police = null;
let score = 0;
let distance = 0;
let level = 1;
let lives = 3;
let gameRunning = true;
let keys = { left: false, right: false, up: false, down: false, nitro: false };

// DOM Elements
const speedEl = document.getElementById('speed');
const coinsEl = document.getElementById('coins');
const distanceEl = document.getElementById('distance');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const roadTable = document.querySelector('td[bgcolor="#555555"]');

// ========== BUTTON CONTROLS ==========
function setupControls() {
  const buttons = document.querySelectorAll('input[type="button"]');

  buttons[0].onmousedown = () => keys.left = true; // LEFT
  buttons[0].onmouseup = () => keys.left = false;
  buttons[1].onmousedown = () => keys.right = true; // RIGHT
  buttons[1].onmouseup = () => keys.right = false;
  buttons[2].onmousedown = () => keys.up = true; // ACCEL
  buttons[2].onmouseup = () => keys.up = false;
  buttons[3].onmousedown = () => keys.down = true; // BRAKE
  buttons[3].onmouseup = () => keys.down = false;
  buttons[4].onmousedown = () => keys.nitro = true; // NITRO
  buttons[4].onmouseup = () => keys.nitro = false;

  // Mobile touch
  buttons.forEach(btn => {
    btn.ontouchstart = (e) => {
      e.preventDefault();
      if(btn.value.includes("LEFT")) keys.left = true;
      if(btn.value.includes("RIGHT")) keys.right = true;
      if(btn.value.includes("ACCEL")) keys.up = true;
      if(btn.value.includes("BRAKE")) keys.down = true;
      if(btn.value.includes("NITRO")) keys.nitro = true;
    }
    btn.ontouchend = () => {
      keys.left = keys.right = keys.up = keys.down = keys.nitro = false;
    }
  });
}

// ========== KEYBOARD CONTROLS ==========
document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowLeft') keys.left = true;
  if(e.key === 'ArrowRight') keys.right = true;
  if(e.key === 'ArrowUp') keys.up = true;
  if(e.key === 'ArrowDown') keys.down = true;
  if(e.key === 'n' || e.key === 'N') keys.nitro = true;
});

document.addEventListener('keyup', (e) => {
  if(e.key === 'ArrowLeft') keys.left = false;
  if(e.key === 'ArrowRight') keys.right = false;
  if(e.key === 'ArrowUp') keys.up = false;
  if(e.key === 'ArrowDown') keys.down = false;
  if(e.key === 'n' || e.key === 'N') keys.nitro = false;
});

// ========== SPAWN COINS ==========
function spawnCoin() {
  coins.push({
    x: Math.random() * 200 + 50,
    y: -50,
    collected: false
  });
}

// ========== SPAWN CARS ==========
function spawnCar() {
  const colors = ['orange', 'purple', 'green', 'brown'];
  cars.push({
    x: Math.random() * 200 + 50,
    y: -100,
    speed: 3 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

// ========== SPAWN POLICE ==========
function spawnPolice() {
  if(!police && distance > 500) {
    police = { x: 150, y: -150, speed: 6 };
    alert("🚓 POLICE CHASE STARTED! 🚓");
  }
}

// ========== UPDATE BIKE MOVEMENT ==========
function updateBike() {
  // Movement
  if(keys.left && bike.x > 60) bike.x -= 5;
  if(keys.right && bike.x < 240) bike.x += 5;
  if(keys.up) bike.speed += 0.4;
  if(keys.down) bike.speed -= 0.8;
  if(keys.nitro) bike.speed += 0.9;

  // Friction
  bike.speed *= 0.97;
  if(bike.speed < 0) bike.speed = 0;
  if(bike.speed > bike.maxSpeed) bike.speed = bike.maxSpeed;

  // Road scroll effect
  roadOffset += bike.speed * 2;
  if(roadOffset > 40) roadOffset = 0;

  // Distance
  distance += bike.speed / 10;

  // Level up
  if(Math.floor(distance / 1000) + 1 > level) {
    level++;
    bike.maxSpeed += 2;
    alert("🎉 LEVEL UP! Level " + level + " 🎉");
  }
}

// ========== UPDATE COINS ==========
function updateCoins() {
  coins.forEach((coin, i) => {
    coin.y += 5 + bike.speed;

    // Collision with bike
    if(!coin.collected && Math.abs(bike.x - coin.x) < 30 && Math.abs(bike.y - coin.y) < 40) {
      coin.collected = true;
      score += 10;
      flashScreen('gold');
    }

    if(coin.y > 400) coins.splice(i, 1);
  });

  if(Math.random() < 0.03) spawnCoin();
}

// ========== UPDATE CARS ==========
function updateCars() {
  cars.forEach((car, i) => {
    car.y += car.speed + bike.speed / 3;

    // Collision with bike = Game Over
    if(Math.abs(bike.x - car.x) < 40 && Math.abs(bike.y - car.y - 50) < 60) {
      crash();
    }

    if(car.y > 400) cars.splice(i, 1);
  });

  if(Math.random() < 0.04) spawnCar();
}

// ========== UPDATE POLICE ==========
function updatePolice() {
  if(police) {
    police.y += police.speed + bike.speed / 4;
    police.x += (bike.x - police.x) * 0.02; // Follow bike

    // Collision
    if(Math.abs(bike.x - police.x) < 40 && Math.abs(bike.y - police.y - 50) < 60) {
      gameOver("🚓 POLICE NE PAKAR LIYA! 🚓");
    }

    if(police.y > 400) police = null;
  }

  if(distance > 500 && Math.random() < 0.0005) spawnPolice();
}

// ========== CRASH FUNCTION ==========
function crash() {
  lives--;
  flashScreen('red');
  bike.speed = 0;

  if(lives <= 0) {
    gameOver("💥 CRASH! GAME OVER 💥");
  } else {
    alert("💥 CRASH! Lives bachi: " + lives);
  }
}

// ========== GAME OVER ==========
function gameOver(reason) {
  gameRunning = false;
  alert(reason + "\n\nFinal Score: " + score + "\nDistance: " + Math.floor(distance) + "M");
  if(confirm("Phir se khelna hai?")) {
    location.reload();
  }
}

// ========== FLASH EFFECT ==========
function flashScreen(color) {
  document.body.style.backgroundColor = color;
  setTimeout(() => {
    document.body.style.backgroundColor = '';
  }, 100);
}

// ========== UPDATE UI ==========
function updateUI() {
  speedEl.innerText = Math.floor(bike.speed * 10);
  coinsEl.innerText = score;
  distanceEl.innerText = Math.floor(distance);
  levelEl.innerText = level;
  livesEl.innerText = lives;
}

// ========== DRAW EVERYTHING ==========
function draw() {
  // Move road lines
  const roadLines = roadTable.querySelectorAll('font[color="white"]');
  roadLines.forEach(line => {
    line.parentElement.style.transform = `translateY(${roadOffset}px)`;
  });

  // Move bike emoji
  const bikeEmoji = roadTable.querySelector('font[color="red"]');
  if(bikeEmoji) {
    bikeEmoji.parentElement.style.textAlign = 'center';
    bikeEmoji.style.marginLeft = (bike.x - 150) + 'px';
  }
}

// ========== MAIN GAME LOOP ==========
function gameLoop() {
  if(gameRunning) {
    updateBike();
    updateCoins();
    updateCars();
    updatePolice();
    updateUI();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// ========== START GAME ==========
window.onload = function() {
  setupControls();
  gameLoop();
  alert("🏍️ GAME START! 🏍️\n\nControls:\nArrow Keys ya Buttons use karo\nN dabao Nitro ke liye");
}
</script>
<script>
// ========== GAME STATE ==========
let gameState = {
  bike: { x: 175, y: 350, speed: 0, maxSpeed: 25, fuel: 100 },
  score: 0, coins: 0, distance: 0, level: 1, lives: 3,
  nitro: 3, time: 0, weather: 'sunny', isNight: false,
  wheelie: false, drifting: false, gameRunning: true,
  ownedBikes: [true,false,false],
  selectedBike: 0
};

let keys = { left: false, right: false, up: false, down: false, nitro: false, wheelie: false, drift: false };
let coins = [], cars = [], police = null, roadOffset = 0;

// Bike Stats
const bikes = [
  {name: "Splendor", speed: 80, price: 0},
  {name: "Bullet", speed: 120, price: 5000},
  {name: "R15", speed: 150, price: 15000},
  {name: "Hayabusa", speed: 300, price: 50000},
  {name: "KTM", speed: 200, price: 25000},
  {name: "Ninja", speed: 280, price: 45000}
];

// ========== CONTROLS SETUP ==========
function setupControls() {
  const btns = document.querySelectorAll('input[type="button"]');
  const actions = ['left','right','up','down','nitro','wheelie','drift'];

  btns.forEach((btn, i) => {
    btn.onmousedown = btn.ontouchstart = () => keys[actions[i]] = true;
    btn.onmouseup = btn.ontouchend = () => keys[actions[i]] = false;
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft') keys.left = true;
    if(e.key === 'ArrowRight') keys.right = true;
    if(e.key === 'ArrowUp') keys.up = true;
    if(e.key === 'ArrowDown') keys.down = true;
    if(e.key === 'n') keys.nitro = true;
    if(e.key === 'w') keys.wheelie = true;
    if(e.key === 'd') keys.drift = true;
  });
  document.addEventListener('keyup', e => {
    if(e.key === 'ArrowLeft') keys.left = false;
    if(e.key === 'ArrowRight') keys.right = false;
    if(e.key === 'ArrowUp') keys.up = false;
    if(e.key === 'ArrowDown') keys.down = false;
    if(e.key === 'n') keys.nitro = false;
    if(e.key === 'w') keys.wheelie = false;
    if(e.key === 'd') keys.drift = false;
  });
}

// ========== BIKE SELECTION ==========
document.querySelectorAll('input[name="bike"]').forEach((radio, i) => {
  radio.onchange = () => {
    if(gameState.ownedBikes[i]) {
      gameState.selectedBike = i;
      gameState.bike.maxSpeed = bikes[i].speed / 10;
      alert("🏍️ " + bikes[i].name + " Selected!");
    } else {
      alert("💎 Is bike ko kharidne ke liye " + bikes[i].price + " coins chahiye!");
      radio.checked = false;
    }
  }
});

// ========== SPAWN FUNCTIONS ==========
function spawnCoin() {
  coins.push({x: Math.random()*250+50, y: -50, type: Math.random() > 0.8? 'diamond' : 'gold', value: Math.random() > 0.8? 50 : 10});
}

function spawnCar() {
  const types = ['car','bus','truck','auto'];
  cars.push({
    x: Math.random()*250+50,
    y: -100,
    speed: 3 + Math.random()*5,
    type: types[Math.floor(Math.random()*4)]
  });
}

function spawnPolice() {
  if(!police && gameState.distance > 500) {
    police = {x: 175, y: -150, speed: 6 + gameState.level, level: Math.min(3, Math.floor(gameState.level/5)+1)};
    showAlert("🚓 LEVEL " + police.level + " POLICE CHASE! 🚓");
  }
}

// ========== UPDATE FUNCTIONS ==========
function updateBike() {
  // Movement
  if(keys.left && gameState.bike.x > 60) gameState.bike.x -= 6;
  if(keys.right && gameState.bike.x < 290) gameState.bike.x += 6;
  if(keys.up) gameState.bike.speed += 0.5;
  if(keys.down) gameState.bike.speed -= 1;
  if(keys.nitro && gameState.nitro > 0) {
    gameState.bike.speed += 2;
    gameState.nitro -= 0.02;
  }

  // Wheelie
  if(keys.wheelie && gameState.bike.speed > 10) {
    gameState.wheelie = true;
    gameState.score += 1;
  } else gameState.wheelie = false;

  // Drift
  if(keys.drift && (keys.left || keys.right)) {
    gameState.drifting = true;
    gameState.score += 2;
  } else gameState.drifting = false;

  // Physics
  gameState.bike.speed *= 0.96;
  if(gameState.bike.speed < 0) gameState.bike.speed = 0;
  if(gameState.bike.speed > gameState.bike.maxSpeed) gameState.bike.speed = gameState.bike.maxSpeed;

  // Fuel
  gameState.bike.fuel -= gameState.bike.speed * 0.01;
  if(gameState.bike.fuel <= 0) crash("⛽ FUEL KHATAM! ⛽");

  roadOffset += gameState.bike.speed * 3;
  gameState.distance += gameState.bike.speed / 10;
  gameState.time += 1/60;

  // Level Up
  if(Math.floor(gameState.distance / 1000) + 1 > gameState.level) {
    gameState.level++;
    gameState.nitro = 3;
    showAlert("🎉 LEVEL " + gameState.level + " UNLOCKED! 🎉");
  }
}

function updateCoins() {
  coins.forEach((coin, i) => {
    coin.y += 5 + gameState.bike.speed;
    if(Math.abs(gameState.bike.x - coin.x) < 35 && Math.abs(gameState.bike.y - coin.y) < 45) {
      gameState.coins += coin.value;
      gameState.score += coin.value;
      coins.splice(i,1);
      flashScreen('gold');
    }
    if(coin.y > 450) coins.splice(i,1);
  });
  if(Math.random() < 0.04) spawnCoin();
}

function updateCars() {
  cars.forEach((car, i) => {
    car.y += car.speed + gameState.bike.speed / 2.5;
    if(Math.abs(gameState.bike.x - car.x) < 40 && Math.abs(gameState.bike.y - car.y - 50) < 60) {
      crash("💥 ACCIDENT! 💥");
    }
    if(car.y > 450) cars.splice(i,1);
  });
  if(Math.random() < 0.05) spawnCar();
}

function updatePolice() {
  if(police) {
    police.y += police.speed + gameState.bike.speed / 3;
    police.x += (gameState.bike.x - police.x) * 0.03; // AI chase

    if(Math.abs(gameState.bike.x - police.x) < 40 && Math.abs(gameState.bike.y - police.y - 50) < 60) {
      gameOver("🚓 POLICE NE PAKAR LIYA! 🚓");
    }
    if(police.y > 450) police = null;
  }
  if(gameState.distance > 500 && Math.random() < 0.001) spawnPolice();
}

// ========== WEATHER SYSTEM ==========
function updateWeather() {
  if(gameState.time % 300 < 1) {
    const weathers = ['sunny','rain','fog','night'];
    gameState.weather = weathers[Math.floor(Math.random()*4)];
    gameState.isNight = gameState.weather === 'night';
    document.body.style.filter = gameState.isNight? 'brightness(0.4)' : 'brightness(1)';
  }
}

// ========== CRASH & GAME OVER ==========
function crash(reason) {
  gameState.lives--;
  flashScreen('red');
  gameState.bike.speed = 0;
  gameState.bike.fuel = 100; // Refill on crash

  if(gameState.lives <= 0) gameOver(reason);
  else showAlert(reason + "\nLives bachi: " + gameState.lives);
}

function gameOver(reason) {
  gameState.gameRunning = false;
  saveGame();
  if(confirm(reason + "\n\nFinal Score: " + gameState.score + "\nCoins: " + gameState.coins + "\n\nRestart?")) {
    location.reload();
  }
}

// ========== UI UPDATE ==========
function updateUI() {
  document.getElementById('speed').innerText = Math.floor(gameState.bike.speed * 10);
  document.getElementById('coins').innerText = gameState.coins;
  document.getElementById('distance').innerText = Math.floor(gameState.distance);
  document.getElementById('level').innerText = gameState.level;
  document.getElementById('lives').innerText = gameState.lives;
  document.getElementById('fuel').innerText = Math.floor(gameState.bike.fuel) + '%';
  document.getElementById('time').innerText = formatTime(gameState.time);
}

function formatTime(s) {
  let m = Math.floor(s/60), sec = Math.floor(s%60);
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

// ========== EFFECTS ==========
function flashScreen(color) {
  document.body.style.backgroundColor = color;
  setTimeout(() => document.body.style.backgroundColor = '', 150);
}

function showAlert(msg) {
  alert(msg);
}

// ========== SAVE & LOAD ==========
function saveGame() {
  localStorage.setItem('bikeGameSave', JSON.stringify(gameState));
}

function loadGame() {
  let save = localStorage.getItem('bikeGameSave');
  if(save) {
    gameState = JSON.parse(save);
    alert("💾 Game Loaded!");
  }
}

// ========== MAIN LOOP ==========
function gameLoop() {
  if(gameState.gameRunning) {
    updateBike();
    updateCoins();
    updateCars();
    updatePolice();
    updateWeather();
    updateUI();
  }
  requestAnimationFrame(gameLoop);
}

// ========== START GAME ==========
window.onload = function() {
  loadGame();
  setupControls();
  gameLoop();
  alert("🏍️ WELCOME TO INDIAN BIKES DRIVING 3D 🏍️\n\nControls:\nArrows = Move\nN = Nitro\nW = Wheelie\nD = Drift");
}
</script>
