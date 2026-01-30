// Game constants
const CELL_SIZE = 30;
const PACMAN_SPEED = 2;
const GHOST_SPEED = 0.5;  // Further reduced speed to make ghosts slower
const DOT_SIZE = 4;

// Key states for continuous movement
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

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
    dotsRemaining: 0,
    invulnerable: false,  // Whether Pacman is currently invulnerable
    invulnerabilityTimer: 0  // Timer for invulnerability period
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
            } 
        }
    }
    
    // Set initial Pacman position (find an empty space in the maze)
    gameState.pacman.x = 9 * CELL_SIZE + CELL_SIZE / 2;
    gameState.pacman.y = 15 * CELL_SIZE + CELL_SIZE / 2;
    gameState.pacman.direction = 'right';
    gameState.pacman.nextDirection = 'right';
    
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
    // Draw all walls first to ensure proper layering
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (mazeLayout[row][col] === 1) { // Wall
                ctx.fillStyle = '#2233AA';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Then draw borders to ensure connection between adjacent walls
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (mazeLayout[row][col] === 1) { // Wall
                // Draw border on all sides
                ctx.strokeStyle = '#4466FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Draw additional connecting lines to adjacent walls to ensure visual continuity
                ctx.strokeStyle = '#5577CC';
                ctx.lineWidth = 1;
                
                // Check adjacent cells and draw connecting lines if they are also walls
                if (col > 0 && mazeLayout[row][col-1] === 1) { // Left neighbor is wall
                    // Already connected by left wall's right edge
                } else {
                    // Draw left edge if no left neighbor wall
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + CELL_SIZE);
                    ctx.stroke();
                }
                
                if (col < mazeLayout[row].length - 1 && mazeLayout[row][col+1] === 1) { // Right neighbor is wall
                    // Connected by right neighbor's left edge, so don't redraw
                } else {
                    // Draw right edge if no right neighbor wall
                    ctx.beginPath();
                    ctx.moveTo(x + CELL_SIZE, y);
                    ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
                    ctx.stroke();
                }
                
                if (row > 0 && mazeLayout[row-1][col] === 1) { // Top neighbor is wall
                    // Already connected by top wall's bottom edge
                } else {
                    // Draw top edge if no top neighbor wall
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + CELL_SIZE, y);
                    ctx.stroke();
                }
                
                if (row < mazeLayout.length - 1 && mazeLayout[row+1][col] === 1) { // Bottom neighbor is wall
                    // Connected by bottom neighbor's top edge, so don't redraw
                } else {
                    // Draw bottom edge if no bottom neighbor wall
                    ctx.beginPath();
                    ctx.moveTo(x, y + CELL_SIZE);
                    ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
                    ctx.stroke();
                }
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
    
    // Determine if Pacman should be visible during invulnerability (blink effect)
    if (gameState.invulnerable) {
        // Blink every 10 frames
        const blinkPhase = Math.floor(gameState.invulnerabilityTimer / 10) % 2;
        if (blinkPhase === 0) {
            // Skip drawing Pacman during this frame
            return;
        }
    }
    
    ctx.fillStyle = '#FFFF00'; // Yellow
    ctx.beginPath();
    
    let startAngle, endAngle;
    
    // Calculate mouth openness based on animation state
    const mouthOpenAmount = (gameState.mouthOpen > 1 ? 0.2 : 0.4) * Math.PI;
    
    switch(gameState.pacman.direction) {
        case 'right':
            startAngle = mouthOpenAmount;
            endAngle = 2 * Math.PI - mouthOpenAmount;
            break;
        case 'down':
            startAngle = 0.5 * Math.PI + mouthOpenAmount;
            endAngle = 0.5 * Math.PI - mouthOpenAmount;
            break;
        case 'left':
            startAngle = Math.PI + mouthOpenAmount;
            endAngle = Math.PI - mouthOpenAmount;
            break;
        case 'up':
            startAngle = 1.5 * Math.PI + mouthOpenAmount;
            endAngle = 1.5 * Math.PI - mouthOpenAmount;
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
    
    // Update direction based on pressed keys
    if (keys.ArrowUp) {
        gameState.pacman.nextDirection = 'up';
    } else if (keys.ArrowDown) {
        gameState.pacman.nextDirection = 'down';
    } else if (keys.ArrowLeft) {
        gameState.pacman.nextDirection = 'left';
    } else if (keys.ArrowRight) {
        gameState.pacman.nextDirection = 'right';
    }
    
    // Only move if a key is pressed
    if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
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
                newY -= PACMAN_SPEED;  // Moving up means decreasing Y coordinate
                break;
            case 'down':
                newY += PACMAN_SPEED;  // Moving down means increasing Y coordinate
                break;
        }
        
        // Check collision with walls - make sure we're checking the right grid positions
        const currentGridX = Math.floor(gameState.pacman.x / CELL_SIZE);
        const currentGridY = Math.floor(gameState.pacman.y / CELL_SIZE);
        const newGridX = Math.floor(newX / CELL_SIZE);
        const newGridY = Math.floor(newY / CELL_SIZE);
        
        // Only allow movement if the destination is not a wall
        if (newGridX >= 0 && newGridX < mazeLayout[0].length && 
            newGridY >= 0 && newGridY < mazeLayout.length) {
            if (mazeLayout[newGridY][newGridX] !== 1) { // Not a wall
                gameState.pacman.x = newX;
                gameState.pacman.y = newY;
            } else {
                // If trying to move into a wall, revert to original direction but keep nextDirection
                gameState.pacman.direction = originalDirection;
            }
        } else {
            // If out of bounds, revert to original direction
            gameState.pacman.direction = originalDirection;
        }
    }
    
    // Collect dots
    collectDots();
}

// Collect dots
function collectDots() {
    // Don't collect dots when invulnerable
    if (gameState.invulnerable) return;
    
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
        // Only move ghosts on grid centers to ensure proper movement
        const currentGridX = Math.floor(ghost.x / CELL_SIZE);
        const currentGridY = Math.floor(ghost.y / CELL_SIZE);
        const centerX = currentGridX * CELL_SIZE + CELL_SIZE / 2;
        const centerY = currentGridY * CELL_SIZE + CELL_SIZE / 2;
        
        // Align ghost to grid center if not already aligned
        if (Math.abs(ghost.x - centerX) > 1 || Math.abs(ghost.y - centerY) > 1) {
            ghost.x = centerX;
            ghost.y = centerY;
            return; // Wait until aligned to grid before continuing movement
        }
        
        // Simple AI: occasionally change direction randomly
        if (Math.random() < 0.05) { // Increased chance to change direction
            const directions = ['up', 'down', 'left', 'right'];
            const validDirections = [];
            
            // Check which directions are valid
            for (const dir of directions) {
                let testX = currentGridX;
                let testY = currentGridY;
                
                switch (dir) {
                    case 'right': testX++; break;
                    case 'left': testX--; break;
                    case 'down': testY++; break;
                    case 'up': testY--; break;
                }
                
                if (testX >= 0 && testX < mazeLayout[0].length && 
                    testY >= 0 && testY < mazeLayout.length && 
                    mazeLayout[testY][testX] !== 1) {
                    validDirections.push(dir);
                }
            }
            
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
        
        // Calculate next position based on direction
        let newGridX = currentGridX;
        let newGridY = currentGridY;
        
        switch (ghost.direction) {
            case 'right':
                newGridX++;
                break;
            case 'left':
                newGridX--;
                break;
            case 'up':
                newGridY--;
                break;
            case 'down':
                newGridY++;
                break;
        }
        
        // Check if the move is valid (not a wall)
        if (newGridX >= 0 && newGridX < mazeLayout[0].length && 
            newGridY >= 0 && newGridY < mazeLayout.length && 
            mazeLayout[newGridY][newGridX] !== 1) {
            // Move ghost to new grid center
            ghost.x = newGridX * CELL_SIZE + CELL_SIZE / 2;
            ghost.y = newGridY * CELL_SIZE + CELL_SIZE / 2;
        } else {
            // Change direction if hitting a wall
            const directions = ['up', 'down', 'left', 'right'];
            const validDirections = [];
            
            // Check which directions are valid
            for (const dir of directions) {
                let testX = currentGridX;
                let testY = currentGridY;
                
                switch (dir) {
                    case 'right': testX++; break;
                    case 'left': testX--; break;
                    case 'down': testY++; break;
                    case 'up': testY--; break;
                }
                
                if (testX >= 0 && testX < mazeLayout[0].length && 
                    testY >= 0 && testY < mazeLayout.length && 
                    mazeLayout[testY][testX] !== 1) {
                    validDirections.push(dir);
                }
            }
            
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
    });
    
    // Check collision with ghosts
    checkGhostCollision();
}

// Check collision with ghosts
function checkGhostCollision() {
    // Only check collision if Pacman is not invulnerable
    if (gameState.invulnerable) return;
    
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
    // Only allow losing life if not already invulnerable
    if (gameState.invulnerable) return;
    
    gameState.lives--;
    document.getElementById('lives').textContent = gameState.lives;
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Make Pacman invulnerable for 3 seconds (180 frames at 60fps)
        gameState.invulnerable = true;
        gameState.invulnerabilityTimer = 180; // 3 seconds at 60fps
        
        // Reset positions
        resetPositions();
    }
}

// Reset positions after losing a life
function resetPositions() {
    // Reset Pacman position
    gameState.pacman.x = 9 * CELL_SIZE + CELL_SIZE / 2;
    gameState.pacman.y = 15 * CELL_SIZE + CELL_SIZE / 2;
    gameState.pacman.direction = 'right';
    gameState.pacman.nextDirection = 'right';
    
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

// Handle keyboard input for continuous movement
function handleKeyDown(e) {
    if (gameState.gameOver || gameState.gameWon) return;
    
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (gameState.gameOver || gameState.gameWon) return;
    
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
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
    
    // Update invulnerability timer
    if (gameState.invulnerable) {
        gameState.invulnerabilityTimer--;
        if (gameState.invulnerabilityTimer <= 0) {
            gameState.invulnerable = false;
        }
    }
    
    // Continue game loop
    if (!gameState.gameOver && !gameState.gameWon) {
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

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