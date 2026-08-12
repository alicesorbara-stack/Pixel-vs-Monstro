* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #050508;
    color: #ffffff;
    font-family: 'Segoe UI', Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
}

.gradient-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(45deg, #ff007f, #7928ca, #00dfd8, #ff007f);
    background-size: 400% 400%;
    animation: moveBg 12s ease infinite;
    z-index: -1;
    opacity: 0.25;
}

@keyframes moveBg {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.main-container {
    background: rgba(18, 18, 28, 0.9);
    backdrop-filter: blur(20px);
    border: 2px solid #7928ca;
    box-shadow: 0 0 40px rgba(121, 40, 202, 0.6);
    border-radius: 24px;
    padding: 40px;
    width: 100%;
    max-width: 580px;
    text-align: center;
}

h1 {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 2px;
    color: #00dfd8;
    text-shadow: 0 0 10px #00dfd8;
    margin-bottom: 5px;
}

h1 span {
    color: #ff007f;
    text-shadow: 0 0 10px #ff007f;
}

.subtitle {
    font-size: 13px;
    color: #a0aec0;
    margin-bottom: 30px;
}

.game-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 45px;
}

.game-section h2 {
    font-size: 15px;
    letter-spacing: 1px;
    margin-bottom: 25px;
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 12px;
}

.scoreboard {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    font-size: 14px;
    margin-bottom: 25px;
}

#score, #snake-score { color: #00dfd8; text-shadow: 0 0 5px #00dfd8; }
#level, #snake-high { color: #ff007f; text-shadow: 0 0 5px #ff007f; }

#dungeon {
    display: grid;
    grid-template-columns: repeat(10, 34px);
    grid-template-rows: repeat(10, 34px);
    gap: 3px;
    background: #090914;
    padding: 6px;
    border-radius: 12px;
    border: 2px solid #00dfd8;
    box-shadow: 0 0 15px rgba(0, 223, 216, 0.3);
    margin: 0 auto 25px auto;
    width: max-content;
}

.cell {
    width: 34px;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    border-radius: 4px;
}

.wall { background-color: #7928ca; border: 1px solid #9d4edd; }
.floor { background-color: #030307; }

#snakeCanvas {
    background-color: #030307;
    border: 2px solid #ff007f;
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(255, 0, 127, 0.3);
    margin-bottom: 25px;
}

#game-log, #snake-log {
    background: rgba(0, 0, 0, 0.5);
    border-left: 4px solid #ff007f;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #cbd5e0;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

#snake-log { border-left-color: #00dfd8; }

.game-btn {
    background: linear-gradient(90deg, #ff007f, #7928ca);
    color: #fff;
    border: none;
    padding: 12px 28px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 6px;
    transition: transform 0.1s, opacity 0.2s;
}

.snake-btn { background: linear-gradient(90deg, #00dfd8, #7928ca); }
.game-btn:hover { opacity: 0.9; transform: scale(1.03); }

/* Estilo do Curtir */
.like-section { margin-top: 45px; border: 1px solid rgba(255, 0, 127, 0.2); }
#like-btn { background: linear-gradient(90deg, #ff007f, #7928ca); box-shadow: 0 4px 15px rgba(255, 0, 127, 0.4); font-size: 14px; padding: 14px 32px; border-radius: 50px; transition: all 0.2s ease; }
#like-btn.liked { background: #ff007f; box-shadow: 0 0 20px #ff007f; }
@keyframes heartBeat { 0% { transform: scale(1); } 30% { transform: scale(1.15); } 60% { transform: scale(0.95); } 100% { transform: scale(1); } }
.pulse { animation: heartBeat 0.4s ease-in-out; }
// =========================================================================
// VARIÁVEIS E COMPONENTES - JOGO 2: SNAKE NEON
// =========================================================================
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const snakeScoreElement = document.getElementById("snake-score");
const snakeHighElement = document.getElementById("snake-high");
const snakeLog = document.getElementById("snake-log");

const box = 15;
let snake = [];
let food = { x: 0, y: 0 };
let snakeDirection = "RIGHT";
let snakeScore = 0;
let snakeHighScore = 0;
let snakeGameInterval;
let isSnakeGameOver = false;

function resetSnakeGame() {
    clearInterval(snakeGameInterval);
    isSnakeGameOver = false;
    snakeScore = 0;
    snakeScoreElement.innerText = `PONTOS: ${snakeScore}`;
    snakeDirection = "RIGHT";
    snakeLog.innerText = "Guie a cobra pixelada e ganhe energia!";
    snake = [];
    snake.push({ x: 10 * box, y: 10 * box });
    generateSnakeFood();
    snakeGameInterval = setInterval(drawSnakeGame, 130);
}

function generateSnakeFood() {
    food.x = Math.floor(Math.random() * 19) * box;
    food.y = Math.floor(Math.random() * 19) * box;
}

function drawSnakeGame() {
    if (isSnakeGameOver) return;
    ctx.fillStyle = "#030307";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#00dfd8" : "#7928ca";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#ff007f";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (snakeDirection === "LEFT") snakeX -= box;
    if (snakeDirection === "UP") snakeY -= box;
    if (snakeDirection === "RIGHT") snakeX += box;
    if (snakeDirection === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        snakeScore += 10;
        snakeScoreElement.innerText = `PONTOS: ${snakeScore}`;
        sound.playCoin();
        generateSnakeFood();
        snakeLog.innerText = "⚡ Energia absorvida! A cobra cresceu.";
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collisionWithSelf(newHead, snake)) {
        isSnakeGameOver = true;
        sound.playOver();
        clearInterval(snakeGameInterval);
        snakeLog.innerText = "💥 BATEU! Fim de jogo para a cobrinha.";
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            snakeHighElement.innerText = `RECORDE: ${snakeHighScore}`;
        }
        return;
    }
    snake.unshift(newHead);
}

function collisionWithSelf(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}

window.addEventListener('keydown', (e) => {
    if (!gameOver) {
        let nextRow = player.row;
        let nextCol = player.col;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nextRow--;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nextRow++;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nextCol--;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextCol++;

        if (currentMap[nextRow] && currentMap[nextRow][nextCol] !== 1) {
            player.row = nextRow;
            player.col = nextCol;
            sound.playStep();
            moveEnemy();
            checkCollisions();
            drawMap();
        }
    }

    if (!isSnakeGameOver) {
        if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && snakeDirection !== "RIGHT") snakeDirection = "LEFT";
        if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && snakeDirection !== "DOWN") snakeDirection = "UP";
        if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && snakeDirection !== "LEFT") snakeDirection = "RIGHT";
        if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && snakeDirection !== "UP") snakeDirection = "DOWN";
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

// =========================================================================
// SINTETIZADOR DE ÁUDIO
// =========================================================================
const sound = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    playStep() {
        this.init(); if (!this.ctx) return;
        let osc = this.ctx.createOscillator(); let gain = this.ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.04);
    },
    playCoin() {
        this.init(); if (!this.ctx) return;
        let osc = this.ctx.createOscillator(); let gain = this.ctx.createGain();
        osc.type = 'square'; osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.15);
    },
    playLevel() {
        this.init(); if (!this.ctx) return;
        let osc = this.ctx.createOscillator(); let gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.25);
    },
    playOver() {
        this.init(); if (!this.ctx) return;
        let osc = this.ctx.createOscillator(); let gain = this.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.4);
    }
};

// =========================================================================
// SISTEMA INTERATIVO DE CURTIDAS (LOCALSTORAGE)
// =========================================================================
let totalLikes = 124;
const likeBtn = document.getElementById('like-btn');
const likeIcon = document.getElementById('like-icon');
const likeText = document.getElementById('like-text');
const likeCountElement = document.getElementById('like-count');

function checkPastLikes() {
    if (localStorage.getItem('projetoCurtido') === 'true') {
        totalLikes += 1;
        likeBtn.classList.add('liked');
        likeIcon.innerText = '❤️';
        likeText.innerText = 'Projeto Curtido!';
    }
    likeCountElement.innerText = totalLikes;
}

function triggerLike() {
    if (sound && typeof sound.init === 'function') sound.init();

    if (localStorage.getItem('projetoCurtido') === 'true') {
        localStorage.removeItem('projetoCurtido');
        totalLikes--;
        likeBtn.classList.remove('liked');
        likeIcon.innerText = '🤍';
        likeText.innerText = 'Curtir Projeto';
        if (sound && typeof sound.playStep === 'function') sound.playStep();
    } else {
        localStorage.setItem('projetoCurtido', 'true');
        totalLikes++;
        likeBtn.classList.add('liked');
        likeIcon.innerText = '❤️';
        likeText.innerText = 'Projeto Curtido!';
        if (sound && typeof sound.playCoin === 'function') sound.playCoin();
    }

    likeCountElement.innerText = totalLikes;
    likeBtn.classList.add('pulse');
    setTimeout(() => likeBtn.classList.remove('pulse'), 400);
}

initGame();
resetSnakeGame();
checkPastLikes();
