// Elementos da Interface
const dungeonElement = document.getElementById('dungeon');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

// Variáveis do Jogo
const MAP_SIZE = 10;
let score = 0;
let level = 1;
let gameOver = false;

// Coordenadas dos Personagens (Linha, Coluna)
let player = { row: 1, col: 1 };
let exit = { row: 8, col: 8 };
let enemy = { row: 5, col: 5 };
let coin = { row: 3, col: 6 };

// MAPA CORRIGIDO (Matriz 10x10 onde 1 = Parede, 0 = Chão de passagem)
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

// ==========================================
// 🎵 SINTETIZADOR DE EFEITOS SONOROS (8-BIT)
// ==========================================
const sound = {
    ctx: null,

    // Inicializa o sistema de áudio (o navegador exige um clique do usuário antes)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    // Som de Passo (Curto e grave)
    playStep() {
        this.init();
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    },

    // Som de Moeda (Agudo e esticado, estilo Mario)
    playCoin() {
        this.init();
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // Nota Ré
        osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // Nota Lá
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    },

    // Som de Próximo Nível (Escala musical ascendente)
    playLevelUp() {
        this.init();
        let notes = [261.63, 329.63, 392.00, 523.25]; // Dó, Mi, Sol, Dó alto
        notes.forEach((freq, index) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + index * 0.08);
            osc.stop(this.ctx.currentTime + index * 0.08 + 0.1);
        });
    },

    // Som de Game Over (Escala descendente e distorcida)
    playGameOver() {
        this.init();
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }
};

// ==========================================
// LÓGICA DO JOGO
// ==========================================

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
                
                if (r === player.row && c === player.col) {
                    cell.innerText = '⚔️';
                } else if (r === enemy.row && c === enemy.col) {
                    cell.innerText = '👾';
                } else if (r === coin.row && c === coin.col) {
                    cell.innerText = '🪙';
                } else if (r === exit.row && c === exit.col) {
                    cell.innerText = '🚪';
                }
            }
            dungeonElement.appendChild(cell);
        }
    }
}

// Movimentação
window.addEventListener('keydown', (e) => {
    if (gameOver) return;

    let nextRow = player.row;
    let nextCol = player.col;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nextRow--;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nextRow++;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nextCol--;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextCol++;

    // Se andou para um espaço vazio
    if (currentMap[nextRow][nextCol] !== 1) {
        player.row = nextRow;
        player.col = nextCol;
        
        // 🎵 Toca o som de passo a cada movimento válido
        sound.playStep();
        
        moveEnemy();
        checkCollisions();
    }
    
    drawMap();
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
    // 🪙 Pegou a moeda
    if (player.row === coin.row && player.col === coin.col) {
        score += 10;
        scoreElement.innerText = `Moedas: ${score}`;
        coin.row = -1; 
        coin.col = -1;
        sound.playCoin(); // 🎵 Som de moeda
    }

    // 💥 O monstro pegou
    if (player.row === enemy.row && player.col === enemy.col) {
        sound.playGameOver(); // 🎵 Som de derrota
        setTimeout(() => alert('💥 O monstro te pegou! Fim de jogo.'), 50);
        gameOver = true;
    }

    // 🚪 Passou de andar
    if (player.row === exit.row && player.col === exit.col) {
        level++;
        levelElement.innerText = `Andar: ${level}`;
        sound.playLevelUp(); // 🎵 Som de vitória/avanço
        setTimeout(() => {
            alert(`🎉 Você avançou para o Andar ${level}!`);
            initGame();
        }, 50);
    }
}

function resetGame() {
    score = 0;
    level = 1;
    scoreElement.innerText = `Moedas: ${score}`;
    levelElement.innerText = `Andar: ${level}`;
    initGame();
}

// Animação numérica do topo
function animateStats(id, start, end, duration) {
    let obj = document.getElementById(id);
    let current = start;
    let range = end - start;
    let increment = end > start ? 1 : -1;
    let step = function() {
        current += increment;
        obj.innerText = current + (id === 'stat-lines' ? '+' : '');
        if (current != end) {
            setTimeout(step, duration / range);
        }
    };
    setTimeout(step, 100);
}

// Execuções ao iniciar
initGame();
animateStats('stat-games', 0, 14, 1500);
animateStats('stat-lines', 0, 450, 1500);
animateStats('stat-coffee', 0, 82, 1500);
