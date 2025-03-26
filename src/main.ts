enum BlockType {
  I = 0,
  J = 1,
  L = 2,
  O = 3,
  S = 4,
  Z = 5
}

class Tetris {
  private readonly COLS: number = 10;
  private readonly ROWS: number = 20;
  private readonly BLOCK_COLORS: number = 6;
  private readonly TETROMINOS: number[][][][] = [
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

  private board: number[][];
  private tetrisBoard: HTMLElement;
  private nextPieceElement: HTMLElement;
  private scoreElement: HTMLElement;
  private levelElement: HTMLElement;
  private startButton: HTMLElement;
  private pauseButton: HTMLElement;
  
  private currentPiece: { type: BlockType, rotation: number, x: number, y: number };
  private nextPiece: BlockType;
  private score: number;
  private level: number;
  private gameInterval: number | null = null;
  private isPaused: boolean;
  private isGameOver: boolean;
  private speedDelay: number;

  constructor() {
    this.tetrisBoard = document.getElementById('tetris-board')!;
    this.nextPieceElement = document.getElementById('next-piece')!;
    this.scoreElement = document.getElementById('score')!;
    this.levelElement = document.getElementById('level')!;
    this.startButton = document.getElementById('start-button')!;
    this.pauseButton = document.getElementById('pause-button')!;

    this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
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

  private initBoard(): void {
    this.tetrisBoard.innerHTML = '';
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const cell = document.createElement('div');
        cell.className = 'tetris-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        this.tetrisBoard.appendChild(cell);
      }
    }
  }

  private initNextPieceBoard(): void {
    this.nextPieceElement.innerHTML = '';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = document.createElement('div');
        cell.className = 'next-piece-cell';
        this.nextPieceElement.appendChild(cell);
      }
    }
  }

  private bindEvents(): void {
    this.startButton.addEventListener('click', () => this.startGame());
    this.pauseButton.addEventListener('click', () => this.togglePause());
    
    document.addEventListener('keydown', (e) => {
      if (this.isPaused || this.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          this.moveLeft();
          break;
        case 'ArrowRight':
          this.moveRight();
          break;
        case 'ArrowDown':
          this.moveDown();
          break;
        case 'ArrowUp':
          this.rotate();
          break;
        case ' ':
          this.dropDown();
          break;
      }
    });

    // 터치 이벤트 처리
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    this.tetrisBoard.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.tetrisBoard.addEventListener('touchmove', (e) => {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    this.tetrisBoard.addEventListener('touchend', (e) => {
      if (this.isPaused || this.isGameOver) return;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // 최소 스와이프 거리 설정
      const minSwipeDistance = 30;

      // 수평 스와이프
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            this.moveRight();
          } else {
            this.moveLeft();
          }
        }
      }
      // 수직 스와이프
      else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            this.moveDown();
          } else {
            this.rotate();
          }
        }
      }
    }, { passive: true });

    // 더블 탭으로 즉시 떨어뜨리기
    let lastTap = 0;
    this.tetrisBoard.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        this.dropDown();
      }
      lastTap = currentTime;
    }, { passive: true });
  }

  private getRandomPiece(): BlockType {
    return Math.floor(Math.random() * Object.keys(BlockType).length / 2) as BlockType;
  }

  private createNewPiece(): { type: BlockType, rotation: number, x: number, y: number } {
    const type = this.nextPiece;
    this.nextPiece = this.getRandomPiece();
    
    return {
      type,
      rotation: 0,
      x: Math.floor((this.COLS - this.TETROMINOS[type][0][0].length) / 2),
      y: 0
    };
  }

  private drawBoard(): void {
    const cells = this.tetrisBoard.querySelectorAll('.tetris-cell');
    
    // 보드 초기화
    cells.forEach(cell => {
      cell.className = 'tetris-cell';
    });
    
    // 고정된 블록 그리기
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (this.board[row][col] > 0) {
          const cellIndex = row * this.COLS + col;
          cells[cellIndex].classList.add(`block-color-${this.board[row][col]}`);
        }
      }
    }
    
    // 현재 움직이는 블록 그리기
    if (this.currentPiece) {
      const piece = this.TETROMINOS[this.currentPiece.type][this.currentPiece.rotation];
      const pieceSize = piece.length;
      
      for (let row = 0; row < pieceSize; row++) {
        for (let col = 0; col < piece[row].length; col++) {
          if (piece[row][col]) {
            const boardRow = this.currentPiece.y + row;
            const boardCol = this.currentPiece.x + col;
            
            if (boardRow >= 0 && boardRow < this.ROWS && boardCol >= 0 && boardCol < this.COLS) {
              const cellIndex = boardRow * this.COLS + boardCol;
              cells[cellIndex].classList.add(`block-color-${this.currentPiece.type + 1}`);
            }
          }
        }
      }
    }
  }

  private drawNextPiece(): void {
    const cells = this.nextPieceElement.querySelectorAll('.next-piece-cell');
    
    // 다음 블록 보드 초기화
    cells.forEach(cell => {
      cell.className = 'next-piece-cell';
    });
    
    const piece = this.TETROMINOS[this.nextPiece][0];
    const pieceSize = piece.length;
    
    for (let row = 0; row < pieceSize; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const cellIndex = row * 4 + col;
          cells[cellIndex].classList.add(`block-color-${this.nextPiece + 1}`);
        }
      }
    }
  }

  private isCollision(x: number, y: number, rotation: number): boolean {
    const piece = this.TETROMINOS[this.currentPiece.type][rotation];
    const pieceSize = piece.length;
    
    for (let row = 0; row < pieceSize; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const boardRow = y + row;
          const boardCol = x + col;
          
          // 벽이나 바닥과 충돌
          if (
            boardCol < 0 || 
            boardCol >= this.COLS || 
            boardRow >= this.ROWS || 
            (boardRow >= 0 && this.board[boardRow][boardCol])
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  private moveLeft(): void {
    if (!this.isCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation)) {
      this.currentPiece.x--;
      this.drawBoard();
    }
  }

  private moveRight(): void {
    if (!this.isCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation)) {
      this.currentPiece.x++;
      this.drawBoard();
    }
  }

  private moveDown(): boolean {
    if (!this.isCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.currentPiece.y++;
      this.drawBoard();
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  private rotate(): void {
    const nextRotation = (this.currentPiece.rotation + 1) % 4;
    if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, nextRotation)) {
      this.currentPiece.rotation = nextRotation;
      this.drawBoard();
    }
  }

  private dropDown(): void {
    let result = true;
    while(result) {
      result = this.moveDown();
    }
  }

  private lockPiece(): void {
    const piece = this.TETROMINOS[this.currentPiece.type][this.currentPiece.rotation];
    const pieceSize = piece.length;
    
    for (let row = 0; row < pieceSize; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const boardRow = this.currentPiece.y + row;
          const boardCol = this.currentPiece.x + col;
          
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
  }

  private clearRows(): void {
    let rowsCleared = 0;
    
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
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
  }

  private updateScore(rowsCleared: number): void {
    const points = [0, 40, 100, 300, 1200];
    this.score += points[rowsCleared] * this.level;
    this.scoreElement.textContent = this.score.toString();
    
    // 레벨 업
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.levelElement.textContent = this.level.toString();
      this.speedDelay = Math.max(100, 1000 - (this.level - 1) * 100);
      
      // 게임 속도 조정
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = window.setInterval(() => this.gameLoop(), this.speedDelay);
      }
    }
  }

  private gameLoop(): void {
    if (!this.isPaused && !this.isGameOver) {
      this.moveDown();
    }
  }

  private startGame(): void {
    if (this.isGameOver) {
      this.resetGame();
    }
    
    if (!this.gameInterval) {
      this.gameInterval = window.setInterval(() => this.gameLoop(), this.speedDelay);
      this.startButton.textContent = '재시작';
    }
  }

  private resetGame(): void {
    this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
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
    const gameOverMessage = document.querySelector('.game-over');
    if (gameOverMessage) {
      gameOverMessage.remove();
    }
    
    this.drawBoard();
    this.drawNextPiece();
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pauseButton.textContent = this.isPaused ? '계속하기' : '일시정지';
  }

  private gameOver(): void {
    this.isGameOver = true;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    
    const gameOverMessage = document.createElement('div');
    gameOverMessage.className = 'game-over';
    gameOverMessage.textContent = '게임 오버!';
    this.tetrisBoard.parentElement?.appendChild(gameOverMessage);
    
    this.startButton.textContent = '새 게임';
  }
}

// 페이지 로드 시 테트리스 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
  new Tetris();
});
