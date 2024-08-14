document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const restartButton = document.getElementById('restart-button');
    const scoreDisplay = document.createElement('div');
    document.getElementById('game-container').appendChild(scoreDisplay);

    const canvasSize = 400;
    const tileCount = 8;
    const tileSize = canvasSize / tileCount;
    let score = 0;

    let board = [];
    let selectedTiles = [];

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    function initializeBoard() {
        board = [];
        score = 0;
        updateScore();
        for (let i = 0; i < tileCount; i++) {
            board[i] = [];
            for (let j = 0; j < tileCount; j++) {
                board[i][j] = getRandomTileValue();
            }
        }
        drawBoard();
    }

    function getRandomTileValue() {
        const values = [2, 4, 8, 16, 32];
        return values[Math.floor(Math.random() * values.length)];
    }

    function drawBoard() {
        context.clearRect(0, 0, canvasSize, canvasSize);
        for (let i = 0; i < tileCount; i++) {
            for (let j = 0; j < tileCount; j++) {
                drawTile(i, j, board[i][j]);
            }
        }
    }

    function drawTile(x, y, value) {
        context.fillStyle = '#eee4da';
        context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

        context.fillStyle = '#776e65';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(value, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);

        if (selectedTiles.some(tile => tile.x === x && tile.y === y)) {
            context.fillStyle = 'rgba(255, 0, 0, 0.5)';
            context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            context.strokeStyle = '#ff0000';
            context.lineWidth = 3;
            context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    function selectTile(x, y) {
        if (!selectedTiles.some(tile => tile.x === x && tile.y === y)) {
            if (selectedTiles.length === 0 || (isAdjacent({ x, y }, selectedTiles[selectedTiles.length - 1]) && isValidSelection(x, y))) {
                selectedTiles.push({ x, y });
                drawBoard();
            } else if (selectedTiles.length > 0) {
                mergeSelectedTiles();
                drawBoard();
            }
        } else if (selectedTiles.length > 0) {
            mergeSelectedTiles();
            drawBoard();
        }
    }

    function isAdjacent(tile1, tile2) {
        return (Math.abs(tile1.x - tile2.x) <= 1 && Math.abs(tile1.y - tile2.y) <= 1);
    }

    function isValidSelection(x, y) {
        if (selectedTiles.length < 2) return true;

        let prevTileValue = board[selectedTiles[selectedTiles.length - 1].x][selectedTiles[selectedTiles.length - 1].y];
        let currTileValue = board[x][y];

        if (selectedTiles.length === 1 && prevTileValue === currTileValue) {
            return true;
        }
        
        if (selectedTiles.length > 1) {
            let firstTileValue = board[selectedTiles[0].x][selectedTiles[0].y];
            return currTileValue === firstTileValue;
        }

        return false;
    }

    function mergeSelectedTiles() {
        if (selectedTiles.length > 1) {
            const totalValue = selectedTiles.reduce((sum, tile) => sum + board[tile.x][tile.y], 0);

            // Check if the total value is a valid power of 2 or meets the special merging condition
            if ((totalValue & (totalValue - 1)) === 0 || meetsSpecialMergeCondition(selectedTiles)) {
                const lastTile = selectedTiles[selectedTiles.length - 1];

                selectedTiles.forEach(tile => {
                    board[tile.x][tile.y] = getRandomTileValue(); // Replace the tiles being merged with a random value
                });

                board[lastTile.x][lastTile.y] = totalValue;
                score += totalValue;
                updateScore();

                if (checkGameOver()) {
                    alert('Game Over! Final Score: ' + score);
                }
            }
        }
        selectedTiles = [];
    }

    function meetsSpecialMergeCondition(selectedTiles) {
        if (selectedTiles.length === 3) {
            const values = selectedTiles.map(tile => board[tile.x][tile.y]);
            values.sort((a, b) => a - b); // Sort values in ascending order

            // Check if the values are 32, 32, and 64
            return values[0] === 32 && values[1] === 32 && values[2] === 64;
        }
        return false;
    }

    function checkGameOver() {
        for (let i = 0; i < tileCount; i++) {
            for (let j = 0; j < tileCount; j++) {
                if (board[i][j] === 0) return false;
                if (i < tileCount - 1 && board[i][j] === board[i + 1][j]) return false;
                if (j < tileCount - 1 && board[i][j] === board[i][j + 1]) return false;
            }
        }
        return true;
    }

    function updateScore() {
        scoreDisplay.textContent = 'Score: ' + score;
    }

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / tileSize);
        const y = Math.floor((event.clientY - rect.top) / tileSize);
        selectTile(x, y);
    });

    restartButton.addEventListener('click', initializeBoard);

    initializeBoard();
});
