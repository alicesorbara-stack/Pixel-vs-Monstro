// =========================================================================
// VARIÁVEIS E COMPONENTES - JOGO 1: LABIRINTO
// =========================================================================
const dungeonElement = document.getElementById('dungeon');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameLog = document.getElementById('game-log');

const MAP_SIZE = 10;
let score = 0;
let level = 1;
let gameOver = false;

let player = { row: 1, col: 1 };
let exit = { row: 8, col: 8 };
let enemy = { row: 5, col: 5 };
let coin = { row: 3, col: 6 };
let currentMap = [];

function buildPerfectMap() {
    let map = [];
    for (let r = 0; r < MAP_SIZE; r++) {
        let row = [];
        for (let c = 0; c < MAP_SIZE; c++) {
            if (r === 0 || r === MAP_SIZE - 1 || c === 0 || c === MAP_SIZE - 1) row.push(1);
            else if ((r === 3 && c < 7) || (r === 6 && c > 2) || (c === 5 && r > 1 && r < 5)) row.push(1);
            else row.push(0);
        }
        map.push(row);
    }
    return map;
}

function initGame() {
    gameOver = false;
    currentMap = buildPerfectMap();
    player = { row: 1, col: 1 };
    exit = { row: 8, col: 8 };
    spawnItem(enemy);
    spawnItem(coin);
    drawMap();
}

function spawnItem(item) {
    let r, c;
    do {
        r = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        c = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    } while (currentMap[r][c] === 1 || (r === player.row && c === player.col) || (r === exit.row && c === exit.col));
    item.row = r;
    item.col = c;
}

function drawMap() {
    dungeonElement.innerHTML = '';
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (currentMap[r][c] === 1) cell.classList.add('wall');
            else {
                cell.classList.add('floor');
                if (r === player.row && c === player.col) cell.innerText = '⚔️';
                else if (r === enemy.row && c === enemy.col) cell.innerText = '👾';
                else if (r === coin.row && c === coin.col) cell.innerText = '🪙';
                else if (r === exit.row && c === exit.col) cell.innerText = '🚪';
            }
            dungeonElement.appendChild(cell);
        }
    }
}

function moveEnemy() {
    let nextRow = enemy.row;
    let nextCol = enemy.col;
    if (enemy.row < player.row) nextRow++; else if (enemy.row > player.row) nextRow--;
    if (enemy.col < player.col) nextCol++; else if (enemy.col > player.col) nextCol--;
    if (currentMap[nextRow] && currentMap[nextRow][nextCol] !== 1 && !(nextRow === exit.row && nextCol === exit.col)) {
        enemy.row = nextRow;
        enemy.col = nextCol;
    }
}

function checkCollisions() {
    if (player.row === coin.row && player.col === coin.col) {
        score += 10;
        scoreElement.innerText = `MOEDAS: ${score}`;
        coin.row = -1; coin.col = -1;
        sound.playCoin();
        gameLog.innerText = '🪙 Coletou +10 moedas de neon!';
    }
    if (player.row === enemy.row && player.col === enemy.col) {
        sound.playOver();
        gameOver = true;
        gameLog.innerText = '💥 FIM DE JOGO! O monstro te pegou.';
    }
    if (player.row === exit.row && player.col === exit.col) {
        level++;
        levelElement.innerText = `ANDAR: ${level}`;
        sound.playLevel();
        gameLog.innerText = `🚪 Avançou para o Andar ${level}!`;
        initGame();
    }
}

function resetGame() {
    score = 0; level = 1;
    scoreElement.innerText = `MOEDAS: ${score}`;
    levelElement.innerText = `ANDAR: ${level}`;
    gameLog.innerText = 'Labirinto reiniciado!';
    initGame();
}
// =========================================================================
// VARIÁVEIS E COMPONENTES - JOGO 2: SNAKE NEON (TELA CINZA RESOLVIDA)
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
    
    // RESOLVIDO: Inicialização perfeita em formato de lista indexada
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box };
    
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

    // RESOLVIDO: Coordenadas da cabeça lidas da forma correta
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

// Escutador de Teclado Único
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

// Sintetizador de Som
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

initGame();
resetSnakeGame();
