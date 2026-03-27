const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

const TILE = 20;
const GAME_TICK_MS = 100;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;
const PALETTE = {
  boardA: '#081508',
  boardB: '#0c1b0c',
  food: '#ff5f5f',
  foodCore: '#ffd3d3',
  snakeHead: '#b6ff5f',
  snakeBody: '#4fd66f',
  snakeOutline: '#1f5e30',
};

let snake, dir, food, score, running, loopId;

function stopGameLoop() {
  if (loopId) {
    clearInterval(loopId);
    loopId = null;
  }
}

function startGameLoop() {
  stopGameLoop();
  loopId = setInterval(tick, GAME_TICK_MS);
}

function reset() {
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x: 1, y: 0};
  placeFood();
  score = 0;
  running = true;
  updateScore();
  draw();
  startGameLoop();
}
function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}
function tick() {
  if (!running) return;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // wall collision = game over
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}
function draw() {
  drawBoard();
  drawFood();
  for (let i = 0; i < snake.length; i++) {
    drawSnakeSegment(snake[i], i === 0);
  }
}

function drawBoard() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.boardA : PALETTE.boardB;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
}

function drawFood() {
  const x = food.x * TILE;
  const y = food.y * TILE;

  ctx.fillStyle = PALETTE.food;
  ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);

  ctx.fillStyle = PALETTE.foodCore;
  ctx.fillRect(x + 7, y + 7, TILE - 14, TILE - 14);
}

function drawSnakeSegment(segment, isHead) {
  const x = segment.x * TILE;
  const y = segment.y * TILE;
  const inset = isHead ? 2 : 3;

  ctx.fillStyle = PALETTE.snakeOutline;
  ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);

  ctx.fillStyle = isHead ? PALETTE.snakeHead : PALETTE.snakeBody;
  ctx.fillRect(x + inset, y + inset, TILE - (inset * 2), TILE - (inset * 2));
}
function updateScore() {
  scoreEl.textContent = 'Score: ' + score;
}
function gameOver() {
  running = false;
  stopGameLoop();
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