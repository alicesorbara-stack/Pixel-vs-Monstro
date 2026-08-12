// Elementos HTML
const dungeonElement = document.getElementById('dungeon');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameLog = document.getElementById('game-log');

// Configurações Globais
const MAP_SIZE = 10;
let score = 0;
let level = 1;
let gameOver = false;

let player = { row: 1, col: 1 };
let exit = { row: 8, col: 8 };
let enemy = { row: 5, col: 5 };
let coin = { row: 3, col: 6 };

// MATRIZ COMPLETA E CORRIGIDA SEM ERROS DE SINTAXE (1 = Parede, 0 = Caminho)
const mapTemplate = [,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let currentMap = [];

// Gerador de Áudio Web Audio API (Sons de 8-bits puros)
const sound = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playStep() {
        this.init();
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    },
    playCoin() {
        this.init();
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // Nota Dó
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.08); // Nota Sol
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    },
    playLevel() {
        this.init();
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    playOver() {
        this.init();
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
};

function initGame() {
    gameOver = false;
    currentMap = JSON.parse(JSON.stringify(mapTemplate));
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
    } while (mapTemplate[r][c] === 1 || (r === player.row && c === player.col) || (r === exit.row && c === exit.col));
    item.row = r;
    item.col = c;
}

function drawMap() {
    dungeonElement.innerHTML = '';
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            if (currentMap[r][c] === 1) {
                cell.classList.add('wall');
            } else {
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

// Evento de clique no teclado
window.addEventListener('keydown', (e) => {
    if (gameOver) return;

    let nextRow = player.row;
    let nextCol = player.col;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Impede a tela de rolar
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nextRow--;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nextRow++;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nextCol--;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextCol++;

    // Só anda se não for parede
    if (currentMap[nextRow][nextCol] !== 1) {
        player.row = nextRow;
        player.col = nextCol;
        
        sound.playStep(); // Toca som de passo
        moveEnemy();
        checkCollisions();
        drawMap();
    }
});

function moveEnemy() {
    let nextRow = enemy.row;
    let nextCol = enemy.col;

    if (enemy.row < player.row) nextRow++;
    else if (enemy.row > player.row) nextRow--;

    if (enemy.col < player.col) nextCol++;
    else if (enemy.col > player.col) nextCol--;

    if (currentMap[nextRow][nextCol] !== 1 && !(nextRow === exit.row && nextCol === exit.col)) {
        enemy.row = nextRow;
        enemy.col = nextCol;
    }
}

function checkCollisions() {
    // Coleta Moeda
    if (player.row === coin.row && player.col === coin.col) {
        score += 10;
        scoreElement.innerText = `MOEDAS: ${score}`;
        coin.row = -1;
        coin.col = -1;
        sound.playCoin();
        gameLog.innerText = '🪙 Boa! Você coletou +10 moedas de neon.';
        gameLog.style.borderLeftColor = '#00dfd8';
    }

    // Colisão com o Monstro
    if (player.row === enemy.row && player.col === enemy.col) {
        sound.playOver();
        gameOver = true;
        gameLog.innerText = `💥 GAME OVER! O monstro te pegou no Andar ${level}. Clique abaixo para reiniciar.`;
        gameLog.style.borderLeftColor = '#ff007f';
    }

    // Chegou no Portal
    if (player.row === exit.row && player.col === exit.col) {
        level++;
        levelElement.innerText = `ANDAR: ${level}`;
        sound.playLevel();
        gameLog.innerText = `🚪 Portal Ativado! Você desceu com segurança para o Andar ${level}!`;
        gameLog.style.borderLeftColor = '#00dfd8';
        initGame();
    }
}

function resetGame() {
    score = 0;
    level = 1;
    scoreElement.innerText = `MOEDAS: ${score}`;
    levelElement.innerText = `ANDAR: ${level}`;
    gameLog.innerText = 'Labirinto reiniciado! Encontre a saída 🚪.';
    gameLog.style.borderLeftColor = '#ff007f';
    initGame();
}

// Inicia o Jogo Corretamente
initGame();
