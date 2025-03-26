"use strict";
var BlockType;
(function (BlockType) {
    BlockType[BlockType["I"] = 0] = "I";
    BlockType[BlockType["J"] = 1] = "J";
    BlockType[BlockType["L"] = 2] = "L";
    BlockType[BlockType["O"] = 3] = "O";
    BlockType[BlockType["S"] = 4] = "S";
    BlockType[BlockType["Z"] = 5] = "Z";
})(BlockType || (BlockType = {}));
var Tetris = /** @class */ (function () {
    function Tetris() {
        var _this = this;
        this.COLS = 10;
        this.ROWS = 15;
        this.BLOCK_COLORS = 6;
        this.TETROMINOS = [
            // I
            [
                [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
                [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
                [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
            ],
            // J
            [
                [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
                [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
                [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
            ],
            // L
            [
                [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
                [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
                [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
                [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
            ],
            // O
            [
                [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
                [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
                [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
                [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]
            ],
            // S
            [
                [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
                [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
                [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
            ],
            // Z
            [
                [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
                [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
                [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
                [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
            ]
        ];
        this.gameInterval = null;
        this.tetrisBoard = document.getElementById('tetris-board');
        this.nextPieceElement = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.startButton = document.getElementById('start-button');
        this.pauseButton = document.getElementById('pause-button');
        this.board = Array(this.ROWS).fill(null).map(function () { return Array(_this.COLS).fill(0); });
        this.score = 0;
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.speedDelay = 1000;
        this.nextPiece = this.getRandomPiece();
        this.currentPiece = this.createNewPiece();
        this.initBoard();
        this.initNextPieceBoard();
        this.bindEvents();
    }
    Tetris.prototype.initBoard = function () {
        this.tetrisBoard.innerHTML = '';
        for (var row = 0; row < this.ROWS; row++) {
            for (var col = 0; col < this.COLS; col++) {
                var cell = document.createElement('div');
                cell.className = 'tetris-cell';
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                this.tetrisBoard.appendChild(cell);
            }
        }
    };
    Tetris.prototype.initNextPieceBoard = function () {
        this.nextPieceElement.innerHTML = '';
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
                var cell = document.createElement('div');
                cell.className = 'next-piece-cell';
                this.nextPieceElement.appendChild(cell);
            }
        }
    };
    Tetris.prototype.bindEvents = function () {
        var _this = this;
        this.startButton.addEventListener('click', function () { return _this.startGame(); });
        this.pauseButton.addEventListener('click', function () { return _this.togglePause(); });
        document.addEventListener('keydown', function (e) {
            if (_this.isPaused || _this.isGameOver)
                return;
            switch (e.key) {
                case 'ArrowLeft':
                    _this.moveLeft();
                    break;
                case 'ArrowRight':
                    _this.moveRight();
                    break;
                case 'ArrowDown':
                    _this.moveDown();
                    break;
                case 'ArrowUp':
                    _this.rotate();
                    break;
                case ' ':
                    _this.dropDown();
                    break;
            }
        });
        // 터치 이벤트 처리
        var touchStartX = 0;
        var touchStartY = 0;
        var touchEndX = 0;
        var touchEndY = 0;
        this.tetrisBoard.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        this.tetrisBoard.addEventListener('touchmove', function (e) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });
        this.tetrisBoard.addEventListener('touchend', function (e) {
            if (_this.isPaused || _this.isGameOver)
                return;
            var deltaX = touchEndX - touchStartX;
            var deltaY = touchEndY - touchStartY;
            // 최소 스와이프 거리 설정
            var minSwipeDistance = 30;
            // 수평 스와이프
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        _this.moveRight();
                    }
                    else {
                        _this.moveLeft();
                    }
                }
            }
            // 수직 스와이프
            else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        _this.moveDown();
                    }
                    else {
                        _this.rotate();
                    }
                }
            }
        }, { passive: true });
        // 더블 탭으로 즉시 떨어뜨리기
        var lastTap = 0;
        this.tetrisBoard.addEventListener('touchend', function (e) {
            var currentTime = new Date().getTime();
            var tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                _this.dropDown();
            }
            lastTap = currentTime;
        }, { passive: true });
    };
    Tetris.prototype.getRandomPiece = function () {
        return Math.floor(Math.random() * Object.keys(BlockType).length / 2);
    };
    Tetris.prototype.createNewPiece = function () {
        var type = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        return {
            type: type,
            rotation: 0,
            x: Math.floor((this.COLS - this.TETROMINOS[type][0][0].length) / 2),
            y: 0
        };
    };
    Tetris.prototype.drawBoard = function () {
        var cells = this.tetrisBoard.querySelectorAll('.tetris-cell');
        // 보드 초기화
        cells.forEach(function (cell) {
            cell.className = 'tetris-cell';
        });
        // 고정된 블록 그리기
        for (var row = 0; row < this.ROWS; row++) {
            for (var col = 0; col < this.COLS; col++) {
                if (this.board[row][col] > 0) {
                    var cellIndex = row * this.COLS + col;
                    cells[cellIndex].classList.add("block-color-".concat(this.board[row][col]));
                }
            }
        }
        // 현재 움직이는 블록 그리기
        if (this.currentPiece) {
            var piece = this.TETROMINOS[this.currentPiece.type][this.currentPiece.rotation];
            var pieceSize = piece.length;
            for (var row = 0; row < pieceSize; row++) {
                for (var col = 0; col < piece[row].length; col++) {
                    if (piece[row][col]) {
                        var boardRow = this.currentPiece.y + row;
                        var boardCol = this.currentPiece.x + col;
                        if (boardRow >= 0 && boardRow < this.ROWS && boardCol >= 0 && boardCol < this.COLS) {
                            var cellIndex = boardRow * this.COLS + boardCol;
                            cells[cellIndex].classList.add("block-color-".concat(this.currentPiece.type + 1));
                        }
                    }
                }
            }
        }
    };
    Tetris.prototype.drawNextPiece = function () {
        var cells = this.nextPieceElement.querySelectorAll('.next-piece-cell');
        // 다음 블록 보드 초기화
        cells.forEach(function (cell) {
            cell.className = 'next-piece-cell';
        });
        var piece = this.TETROMINOS[this.nextPiece][0];
        var pieceSize = piece.length;
        for (var row = 0; row < pieceSize; row++) {
            for (var col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    var cellIndex = row * 4 + col;
                    cells[cellIndex].classList.add("block-color-".concat(this.nextPiece + 1));
                }
            }
        }
    };
    Tetris.prototype.isCollision = function (x, y, rotation) {
        var piece = this.TETROMINOS[this.currentPiece.type][rotation];
        var pieceSize = piece.length;
        for (var row = 0; row < pieceSize; row++) {
            for (var col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    var boardRow = y + row;
                    var boardCol = x + col;
                    // 벽이나 바닥과 충돌
                    if (boardCol < 0 ||
                        boardCol >= this.COLS ||
                        boardRow >= this.ROWS ||
                        (boardRow >= 0 && this.board[boardRow][boardCol])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    Tetris.prototype.moveLeft = function () {
        if (!this.isCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation)) {
            this.currentPiece.x--;
            this.drawBoard();
        }
    };
    Tetris.prototype.moveRight = function () {
        if (!this.isCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation)) {
            this.currentPiece.x++;
            this.drawBoard();
        }
    };
    Tetris.prototype.moveDown = function () {
        if (!this.isCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
            this.currentPiece.y++;
            this.drawBoard();
            return true;
        }
        else {
            this.lockPiece();
            return false;
        }
    };
    Tetris.prototype.rotate = function () {
        var nextRotation = (this.currentPiece.rotation + 1) % 4;
        if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, nextRotation)) {
            this.currentPiece.rotation = nextRotation;
            this.drawBoard();
        }
    };
    Tetris.prototype.dropDown = function () {
        var result = true;
        while (result) {
            result = this.moveDown();
        }
    };
    Tetris.prototype.lockPiece = function () {
        var piece = this.TETROMINOS[this.currentPiece.type][this.currentPiece.rotation];
        var pieceSize = piece.length;
        for (var row = 0; row < pieceSize; row++) {
            for (var col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    var boardRow = this.currentPiece.y + row;
                    var boardCol = this.currentPiece.x + col;
                    if (boardRow >= 0 && boardRow < this.ROWS && boardCol >= 0 && boardCol < this.COLS) {
                        this.board[boardRow][boardCol] = this.currentPiece.type + 1;
                    }
                }
            }
        }
        this.clearRows();
        this.currentPiece = this.createNewPiece();
        this.drawNextPiece();
        if (this.isCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.rotation)) {
            this.gameOver();
        }
    };
    Tetris.prototype.clearRows = function () {
        var rowsCleared = 0;
        for (var row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(function (cell) { return cell !== 0; })) {
                // 행 제거
                this.board.splice(row, 1);
                // 맨 위에 새 행 추가
                this.board.unshift(Array(this.COLS).fill(0));
                rowsCleared++;
                row++; // 내려온 행을 다시 검사
            }
        }
        if (rowsCleared > 0) {
            this.updateScore(rowsCleared);
        }
    };
    Tetris.prototype.updateScore = function (rowsCleared) {
        var _this = this;
        var points = [0, 40, 100, 300, 1200];
        this.score += points[rowsCleared] * this.level;
        this.scoreElement.textContent = this.score.toString();
        // 레벨 업
        var newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.levelElement.textContent = this.level.toString();
            this.speedDelay = Math.max(100, 1000 - (this.level - 1) * 100);
            // 게임 속도 조정
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
                this.gameInterval = window.setInterval(function () { return _this.gameLoop(); }, this.speedDelay);
            }
        }
    };
    Tetris.prototype.gameLoop = function () {
        // console.log("this.gameInterval :", this.gameInterval);
        if (!this.isPaused && !this.isGameOver) {
            this.moveDown();
        }
    };
    Tetris.prototype.startGame = function () {
        var _this = this;
        console.log("Start button clicked");
        console.log("gameInterval :", this.gameInterval);
        console.log("this.speedDelay :", this.speedDelay);
        if (this.isGameOver) {
            this.resetGame();
        }
        if (!this.gameInterval) {
            console.log("gameInterval is null");
            console.log("this.speedDelay :", this.speedDelay);
            this.gameInterval = window.setInterval(function () { return _this.gameLoop(); }, this.speedDelay);
            this.startButton.textContent = '재시작';
        }
        else {
            this.resetGame();
        }
    };
    Tetris.prototype.resetGame = function () {
        var _this = this;
        this.board = Array(this.ROWS).fill(null).map(function () { return Array(_this.COLS).fill(0); });
        this.score = 0;
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.speedDelay = 1000;
        this.scoreElement.textContent = '0';
        this.levelElement.textContent = '1';
        this.nextPiece = this.getRandomPiece();
        this.currentPiece = this.createNewPiece();
        // 게임 오버 메시지 제거
        var gameOverMessage = document.querySelector('.game-over');
        if (gameOverMessage) {
            gameOverMessage.remove();
        }
        this.drawBoard();
        this.drawNextPiece();
    };
    Tetris.prototype.togglePause = function () {
        this.isPaused = !this.isPaused;
        this.pauseButton.textContent = this.isPaused ? '계속하기' : '일시정지';
    };
    Tetris.prototype.gameOver = function () {
        var _a;
        this.isGameOver = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        var gameOverMessage = document.createElement('div');
        gameOverMessage.className = 'game-over';
        gameOverMessage.textContent = '게임 오버!';
        (_a = this.tetrisBoard.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(gameOverMessage);
        this.startButton.textContent = '새 게임';
    };
    return Tetris;
}());
// 페이지 로드 시 테트리스 게임 초기화
document.addEventListener('DOMContentLoaded', function () {
    new Tetris();
});
