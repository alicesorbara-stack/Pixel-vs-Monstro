const dungeonElement = document.getElementById('dungeon');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

const MAP_SIZE = 10;
let score = 0;
let level = 1;
let gameOver = false;

// Posições iniciais (Linha, Coluna)
let player = { row: 1, col: 1 };
let exit = { row: 8, col: 8 };
let enemy = { row: 5, col: 5 };
let coin = { row: 3, col: 6 };

// Mapa base estático para começar (0 = Chão, 1 = Parede)
const mapTemplate = [,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
];

let currentMap = [];

function initGame() {
    gameOver = false;
    currentMap = JSON.parse(JSON.stringify(mapTemplate)); // Copia o mapa
    player = { row: 1, col: 1 };
    exit = { row: 8, col: 8 };
    
    // Reposiciona o monstro e a moeda aleatoriamente em locais vazios (0)
    spawnItem(enemy);
    spawnItem(coin);
    
    drawMap();
}

function spawnItem(item) {
    let r, c;
    do {
        r = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        c = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
    } while (mapTemplate[r][c] === 1 || (r === player.row && c === player.col));
    item.row = r;
    item.col = c;
}

function drawMap() {
    dungeonElement.innerHTML = ''; // Limpa a tela
    
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            if (currentMap[r][c] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('floor');
                
                // Desenha os personagens e itens por cima do chão
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

// Controla a movimentação
window.addEventListener('keydown', (e) => {
    if (gameOver) return;

    let nextRow = player.row;
    let nextCol = player.col;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nextRow--;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nextRow++;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nextCol--;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nextCol++;

    // Verifica se a próxima célula não é uma parede
    if (currentMap[nextRow][nextCol] !== 1) {
        player.row = nextRow;
        player.col = nextCol;
        
        // O monstro se mexe a cada passo do jogador
        moveEnemy();
        
        // Verifica as interações
        checkCollisions();
    }
    
    drawMap();
});

function moveEnemy() {
    // Inteligência artificial ultra-simples: o monstro tenta andar na direção do jogador
    let nextRow = enemy.row;
    let nextCol = enemy.col;

    if (enemy.row < player.row) nextRow++;
    else if (enemy.row > player.row) nextRow--;

    if (enemy.col < player.col) nextCol++;
    else if (enemy.col > player.col) nextCol--;

    // Só move se não bater em uma parede nem na saída
    if (currentMap[nextRow][nextCol] !== 1 && !(nextRow === exit.row && nextCol === exit.col)) {
        enemy.row = nextRow;
        enemy.col = nextCol;
    }
}

function checkCollisions() {
    // Pegou a moeda
    if (player.row === coin.row && player.col === coin.col) {
        score += 10;
        scoreElement.innerText = `Moedas: ${score}`;
        coin.row = -1; // Some com a moeda do mapa
    }

    // Encontrou o monstro (Game Over)
    if (player.row === enemy.row && player.col === enemy.col) {
        alert('O monstro te pegou! Fim de jogo.');
        gameOver = true;
    }

    // Chegou na saída (Avança de Andar)
    if (player.row === exit.row && player.col === exit.col) {
        level++;
        levelElement.innerText = `Andar: ${level}`;
        alert(`Você desceu para o Andar ${level}! A masmorra resetou.`);
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

// Inicia o jogo na primeira execução
initGame();
