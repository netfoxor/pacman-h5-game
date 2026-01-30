# Pacman H5 Game

A classic Pacman game implemented using HTML5 Canvas, CSS3, and JavaScript.

## Features

- Classic Pacman gameplay with maze navigation
- Multiple ghosts with simple AI
- Dot collection mechanics
- Score tracking
- Lives system
- Win/lose conditions
- Responsive design

## How to Play

1. Use the arrow keys to navigate Pacman around the maze
2. Eat all the dots to win the game
3. Avoid the ghosts - they will take away one of your lives
4. If you run out of lives, the game ends

## Project Structure

```
pacman-game/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── game.js             # Game logic
├── test/
│   └── game.test.js    # Unit tests
├── README.md           # This file
└── package.json        # Project dependencies
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Or simply open `index.html` in your browser

## Running Tests

Execute the unit tests with:
```bash
npm test
```

## Controls

- Up Arrow: Move up
- Down Arrow: Move down
- Left Arrow: Move left
- Right Arrow: Move right

## Technologies Used

- HTML5 Canvas for rendering
- CSS3 for styling
- JavaScript for game logic
- Jest for testing

## Game Elements

- **Pacman**: Yellow character controlled by the player
- **Dots**: Small yellow dots to collect for points
- **Ghosts**: Enemies that chase Pacman (Red, Pink, Cyan, Orange)
- **Walls**: Blue barriers that block movement

## Scoring

- Each dot collected: 10 points

## License

This project is licensed under the MIT License.