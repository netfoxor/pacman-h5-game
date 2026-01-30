// Game constants
const CELL_SIZE = 30;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 1;
const DOT_SIZE = 4;

// Game state
let gameState = {
    score: 0,
    lives: 3,
    dots: [],
    ghosts: [],
    pacman: {
        x: 0,
        y: 0,
        direction: 'right',
        nextDirection: 'right',
        mouthOpen: 0,
        mouthChange: 0
    },
    gameOver: false,
    gameWon: false,
    dotsRemaining: 0
};

// Maze layout (1 = wall, 0 = dot, 2 = empty, 3 = power pellet - simplified version)
const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 0, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 2, 0, 2, 2, 1, 0, 0, 0, 1, 2, 2, 0, 2, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize game objects
function initGame() {
    // Reset game state
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.dots = [];
    gameState.ghosts = [];
    
    // Calculate initial positions based on maze
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const cellType = mazeLayout[row][col];
            
            if (cellType === 0) { // Dot
                gameState.dots.push({
                    x: col * CELL_SIZE + CELL_SIZE / 2,
                    y: row * CELL_SIZE + CELL_SIZE / 2,
                    eaten: false
                });
            } else if (cellType === 2) { // Empty space (possible spawn point)
                // Only use certain empty spaces for ghost/pacman spawning
                if ((row === 9 && col === 9)) { // Center of the map
                    gameState.pacman.x = col * CELL_SIZE + CELL_SIZE / 2;
                    gameState.pacman.y = row * CELL_SIZE + CELL_SIZE / 2;
                }
            }
        }
    }
    
    gameState.dotsRemaining = gameState.dots.filter(dot => !dot.eaten).length;
    
    // Create ghosts
    gameState.ghosts = [
        { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2, direction: 'up', color: '#FF0000' }, // Red
        { x: 10 * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2, direction: 'down', color: '#FFB8FF' }, // Pink
        { x: 9 * CELL_SIZE + CELL_SIZE / 2, y: 9 * CELL_SIZE + CELL_SIZE / 2, direction: 'left', color: '#00FFFF' }, // Cyan
        { x: 9 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2, direction: 'right', color: '#FFB852' } // Orange
    ];
    
    // Update UI
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
}

// Draw the maze
function drawMaze() {
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (mazeLayout[row][col] === 1) { // Wall
                ctx.fillStyle = '#2233AA';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Add some detail to walls
                ctx.strokeStyle = '#4466FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Draw dots
function drawDots() {
    ctx.fillStyle = '#FFFF00'; // Yellow
    
    gameState.dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Draw Pacman
function drawPacman() {
    const { x, y } = gameState.pacman;
    
    // Animate mouth opening/closing
    gameState.mouthChange++;
    if (gameState.mouthChange > 5) {
        gameState.mouthOpen = (gameState.mouthOpen + 1) % 4;
        gameState.mouthChange = 0;
    }
    
    ctx.fillStyle = '#FFFF00'; // Yellow
    ctx.beginPath();
    
    let startAngle, endAngle;
    
    switch(gameState.pacman.direction) {
        case 'right':
            startAngle = 0.2 * Math.PI + (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            endAngle = 1.8 * Math.PI - (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            break;
        case 'down':
            startAngle = 0.7 * Math.PI + (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            endAngle = 1.3 * Math.PI - (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            break;
        case 'left':
            startAngle = 1.2 * Math.PI + (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            endAngle = 0.8 * Math.PI - (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            break;
        case 'up':
            startAngle = 1.7 * Math.PI + (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            endAngle = 0.3 * Math.PI - (gameState.mouthOpen > 1 ? 0.1 * Math.PI : 0);
            break;
    }
    
    ctx.moveTo(x, y);
    ctx.arc(x, y, CELL_SIZE / 2 - 2, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
}

// Draw ghosts
function drawGhosts() {
    gameState.ghosts.forEach(ghost => {
        // Draw ghost body
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, CELL_SIZE / 2 - 2, Math.PI, 0, false); // Top half circle
        ctx.lineTo(ghost.x + CELL_SIZE / 2 - 2, ghost.y + CELL_SIZE / 4);
        
        // Draw wavy bottom
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(ghost.x + CELL_SIZE / 2 - 2 - (i + 1) * (CELL_SIZE / 3), ghost.y + CELL_SIZE / 4 + (i % 2 === 0 ? CELL_SIZE / 4 : 0));
        }
        
        ctx.lineTo(ghost.x - CELL_SIZE / 2 + 2, ghost.y + CELL_SIZE / 4);
        ctx.arc(ghost.x, ghost.y, CELL_SIZE / 2 - 2, 0, Math.PI, true); // Bottom half circle
        ctx.closePath();
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ghost.x - 5, ghost.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(ghost.x + 5, ghost.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(ghost.x - (ghost.direction === 'left' ? 6 : 4), ghost.y - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(ghost.x + (ghost.direction === 'right' ? 6 : 4), ghost.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Move Pacman
function movePacman() {
    if (gameState.gameOver || gameState.gameWon) return;
    
    // Attempt to change direction if requested
    const originalDirection = gameState.pacman.direction;
    gameState.pacman.direction = gameState.pacman.nextDirection;
    
    // Check if the next move is valid (not a wall)
    let newX = gameState.pacman.x;
    let newY = gameState.pacman.y;
    
    switch (gameState.pacman.direction) {
        case 'right':
            newX += PACMAN_SPEED;
            break;
        case 'left':
            newX -= PACMAN_SPEED;
            break;
        case 'up':
            newY -= PACMAN_SPEED;
            break;
        case 'down':
            newY += PACMAN_SPEED;
            break;
    }
    
    // Check collision with walls
    const gridX = Math.floor(newX / CELL_SIZE);
    const gridY = Math.floor(newY / CELL_SIZE);
    
    if (gridX >= 0 && gridX < mazeLayout[0].length && gridY >= 0 && gridY < mazeLayout.length) {
        if (mazeLayout[gridY][gridX] !== 1) { // Not a wall
            gameState.pacman.x = newX;
            gameState.pacman.y = newY;
        } else {
            // Revert direction if invalid
            gameState.pacman.direction = originalDirection;
        }
    }
    
    // Collect dots
    collectDots();
}

// Collect dots
function collectDots() {
    gameState.dots.forEach(dot => {
        if (!dot.eaten) {
            const distance = Math.sqrt(
                Math.pow(gameState.pacman.x - dot.x, 2) + 
                Math.pow(gameState.pacman.y - dot.y, 2)
            );
            
            if (distance < CELL_SIZE / 2) {
                dot.eaten = true;
                gameState.score += 10;
                document.getElementById('score').textContent = gameState.score;
                gameState.dotsRemaining--;
                
                // Check win condition
                if (gameState.dotsRemaining <= 0) {
                    winGame();
                }
            }
        }
    });
}

// Move ghosts
function moveGhosts() {
    if (gameState.gameOver || gameState.gameWon) return;
    
    gameState.ghosts.forEach(ghost => {
        // Simple AI: occasionally change direction randomly
        if (Math.random() < 0.02) {
            const directions = ['up', 'down', 'left', 'right'];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        // Calculate next position based on direction
        let newX = ghost.x;
        let newY = ghost.y;
        
        switch (ghost.direction) {
            case 'right':
                newX += GHOST_SPEED;
                break;
            case 'left':
                newX -= GHOST_SPEED;
                break;
            case 'up':
                newY -= GHOST_SPEED;
                break;
            case 'down':
                newY += GHOST_SPEED;
                break;
        }
        
        // Check if the move is valid (not a wall)
        const gridX = Math.floor(newX / CELL_SIZE);
        const gridY = Math.floor(newY / CELL_SIZE);
        
        if (gridX >= 0 && gridX < mazeLayout[0].length && gridY >= 0 && gridY < mazeLayout.length) {
            if (mazeLayout[gridY][gridX] !== 1) { // Not a wall
                ghost.x = newX;
                ghost.y = newY;
            } else {
                // Change direction if hitting a wall
                const directions = ['up', 'down', 'left', 'right'];
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        } else {
            // Change direction if going out of bounds
            const directions = ['up', 'down', 'left', 'right'];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    });
    
    // Check collision with ghosts
    checkGhostCollision();
}

// Check collision with ghosts
function checkGhostCollision() {
    gameState.ghosts.forEach(ghost => {
        const distance = Math.sqrt(
            Math.pow(gameState.pacman.x - ghost.x, 2) + 
            Math.pow(gameState.pacman.y - ghost.y, 2)
        );
        
        if (distance < CELL_SIZE / 2) {
            loseLife();
        }
    });
}

// Lose a life
function loseLife() {
    gameState.lives--;
    document.getElementById('lives').textContent = gameState.lives;
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        resetPositions();
    }
}

// Reset positions after losing a life
function resetPositions() {
    // Find initial positions again
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const cellType = mazeLayout[row][col];
            
            if (cellType === 2) { // Empty space (possible spawn point)
                if ((row === 9 && col === 9)) { // Center of the map
                    gameState.pacman.x = col * CELL_SIZE + CELL_SIZE / 2;
                    gameState.pacman.y = row * CELL_SIZE + CELL_SIZE / 2;
                }
            }
        }
    }
    
    // Reset ghost positions
    gameState.ghosts[0].x = 8 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[0].y = 8 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[1].x = 10 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[1].y = 8 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[2].x = 9 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[2].y = 9 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[3].x = 9 * CELL_SIZE + CELL_SIZE / 2;
    gameState.ghosts[3].y = 7 * CELL_SIZE + CELL_SIZE / 2;
}

// Game over
function gameOver() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Win game
function winGame() {
    gameState.gameWon = true;
    document.getElementById('winScore').textContent = gameState.score;
    document.getElementById('winScreen').classList.remove('hidden');
}

// Handle keyboard input
function handleKeyDown(e) {
    if (gameState.gameOver || gameState.gameWon) return;
    
    switch(e.key) {
        case 'ArrowUp':
            gameState.pacman.nextDirection = 'up';
            e.preventDefault();
            break;
        case 'ArrowDown':
            gameState.pacman.nextDirection = 'down';
            e.preventDefault();
            break;
        case 'ArrowLeft':
            gameState.pacman.nextDirection = 'left';
            e.preventDefault();
            break;
        case 'ArrowRight':
            gameState.pacman.nextDirection = 'right';
            e.preventDefault();
            break;
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawMaze();
    drawDots();
    drawGhosts();
    drawPacman();
    
    // Update game state
    movePacman();
    moveGhosts();
    
    // Continue game loop
    if (!gameState.gameOver && !gameState.gameWon) {
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners
document.addEventListener('keydown', handleKeyDown);

document.getElementById('restartButton').addEventListener('click', () => {
    initGame();
    gameLoop();
});

document.getElementById('playAgainButton').addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Start the game
window.onload = () => {
    initGame();
    gameLoop();
};