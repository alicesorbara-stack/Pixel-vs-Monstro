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
const mapTemplate = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let currentMap = [];

// Função de Inicialização Corrigida
function initGame() {
    gameOver = false;
    currentMap = JSON.parse(JSON.stringify(mapTemplate)); 
    player = { row: 1, col: 1 };
    exit = { row: 8, col: 8 };
    
    // Sorteia posições livres para o monstro e a moeda
    spawnItem(enemy);
    spawnItem(coin);
    
    drawMap();
}

// Sorteia itens apenas onde o valor da matriz é 0 (Chão)
function spawnItem(item) {
    let r, c;
    do {
        r = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        c = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    } while (mapTemplate[r][c] === 1 || (r === player.row && c === player.col) || (r === exit.row && c === exit.col));
    item.row = r;
    item.col = c;
}

// Renderiza a matriz na tela criando elementos HTML dinamicamente
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
                
                // Sobreposição de camadas visuais
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

// Escuta a movimentação (Setas e WASD)
window.addEventListener('keydown', (e) => {
    if (gameOver) return;

    let nextRow = player.row;
    let nextCol = player.col;

    // Impede o scroll da página ao usar as setas
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nextRow--;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nextRow++;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nextCol--;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextCol++;

    // Verifica barreiras de parede física
    if (currentMap[nextRow][nextCol] !== 1) {
        player.row = nextRow;
        player.col = nextCol;
        
        moveEnemy();
        checkCollisions();
    }
    
    drawMap();
});

// IA Perseguidora Básica do Inimigo
function moveEnemy() {
    let nextRow = enemy.row;
    let nextCol = enemy.col;

    if (enemy.row < player.row) nextRow++;
    else if (enemy.row > player.row) nextRow--;

    if (enemy.col < player.col) nextCol++;
    else if (enemy.col > player.col) nextCol--;

    // O monstro não atravessa paredes e nem a porta de saída
    if (currentMap[nextRow][nextCol] !== 1 && !(nextRow === exit.row && nextCol === exit.col)) {
        enemy.row = nextRow;
        enemy.col = nextCol;
    }
}

// Processa conquistas e derrotas
function checkCollisions() {
    if (player.row === coin.row && player.col === coin.col) {
        score += 10;
        scoreElement.innerText = `Moedas: ${score}`;
        coin.row = -1; 
        coin.col = -1;
    }

    if (player.row === enemy.row && player.col === enemy.col) {
        alert('💥 O monstro te pegou! Fim de jogo.');
        gameOver = true;
    }

    if (player.row === exit.row && player.col === exit.col) {
        level++;
        levelElement.innerText = `Andar: ${level}`;
        alert(`🎉 Você avançou para o Andar ${level}!`);
        initGame();
    }
}

function resetGame() {
    score = 0;
    level = 1;
    scoreElement.innerText = `Moedas: ${score}`;
    levelElement.innerText = `Andar: ${level}`;
    initGame();
}

// ANIMAÇÃO DE NÚMEROS DO TOPO (Interatividade Profissional)
function animateStats(id, start, end, duration) {
    let obj = document.getElementById(id);
    let current = start;
    let range = end - start;
    let increment = end > start ? 1 : -1;
    let step() {
        current += increment;
        obj.innerText = current + (id === 'stat-lines' ? '+' : '');
        if (current != end) {
            setTimeout(step, duration / range);
        }
    };
    setTimeout(step, 100);
}

// Inicializações simultâneas
initGame();
animateStats('stat-games', 0, 14, 1500);
animateStats('stat-lines', 0, 450, 1500);
animateStats('stat-coffee', 0, 82, 1500);
