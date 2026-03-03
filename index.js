const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;
let snake, dir, food, obstacles, score, running, loopId;

function reset() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  obstacles = [];
  placeFood();
  score = 0;
  running = true;
  updateScore();
  if (loopId) clearInterval(loopId);
  loopId = setInterval(tick, 100);
}
function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}
function placeObstacles() {
  const count = Math.min(score, 5);
  obstacles = [];
  for (let i = 0; i < count; i++) {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (
      snake.some(s => s.x === pos.x && s.y === pos.y) ||
      (food.x === pos.x && food.y === pos.y) ||
      obstacles.some(o => o.x === pos.x && o.y === pos.y)
    );
    obstacles.push(pos);
  }
}
function tick() {
  if (!running) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // wall collision = game over
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
  // obstacle collision
  if (obstacles.some(o => o.x === head.x && o.y === head.y)) return gameOver();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateScore();
    placeFood();
    placeObstacles();
  } else {
    snake.pop();
  }
  draw();
}
function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // draw food
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(food.x * TILE, food.y * TILE, TILE, TILE);
  // draw obstacles
  ctx.fillStyle = '#e67e22';
  for (const o of obstacles) {
    ctx.fillRect(o.x * TILE, o.y * TILE, TILE, TILE);
  }
  // draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#8ef' : '#0f8';
    ctx.fillRect(snake[i].x * TILE, snake[i].y * TILE, TILE-1, TILE-1);
  }
}
function updateScore() {
  scoreEl.textContent = 'Score: ' + score;
}
function gameOver() {
  running = false;
  clearInterval(loopId);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
  ctx.font = '14px sans-serif';
  ctx.fillText('Press Restart or R', canvas.width/2, canvas.height/2 + 18);
}
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const mapping = {
    'arrowup': {x:0,y:-1}, 'w': {x:0,y:-1},
    'arrowdown': {x:0,y:1}, 's': {x:0,y:1},
    'arrowleft': {x:-1,y:0}, 'a': {x:-1,y:0},
    'arrowright': {x:1,y:0}, 'd': {x:1,y:0},
  };
  if (key === 'r') { reset(); return; }
  const nd = mapping[e.key.toLowerCase()] || mapping[e.key];
  if (!nd) return;
  // prevent reversing
  if (snake.length > 1 && nd.x === -dir.x && nd.y === -dir.y) return;
  dir = nd;
});
restartBtn.addEventListener('click', reset);

reset();