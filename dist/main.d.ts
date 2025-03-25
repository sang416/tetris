declare enum BlockType {
    I = 0,
    J = 1,
    L = 2,
    O = 3,
    S = 4,
    Z = 5
}
declare class Tetris {
    private readonly COLS;
    private readonly ROWS;
    private readonly BLOCK_COLORS;
    private readonly TETROMINOS;
    private board;
    private tetrisBoard;
    private nextPieceElement;
    private scoreElement;
    private levelElement;
    private startButton;
    private pauseButton;
    private currentPiece;
    private nextPiece;
    private score;
    private level;
    private gameInterval;
    private isPaused;
    private isGameOver;
    private speedDelay;
    constructor();
    private initBoard;
    private initNextPieceBoard;
    private bindEvents;
    private getRandomPiece;
    private createNewPiece;
    private drawBoard;
    private drawNextPiece;
    private isCollision;
    private moveLeft;
    private moveRight;
    private moveDown;
    private rotate;
    private dropDown;
    private lockPiece;
    private clearRows;
    private updateScore;
    private gameLoop;
    private startGame;
    private resetGame;
    private togglePause;
    private gameOver;
}
