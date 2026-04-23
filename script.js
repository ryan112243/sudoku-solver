document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');
    const demoBtn = document.getElementById('demo-btn');
    const messageElement = document.getElementById('message');
    
    const SIZE = 9;
    const cells = [];

    // 初始化 9x9 網格
    function initGrid() {
        for (let i = 0; i < SIZE * SIZE; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 1;
            input.max = 9;
            input.className = 'cell';
            input.dataset.index = i;
            
            // 限制只能輸入 1-9 的單個數字
            input.addEventListener('input', function(e) {
                if (this.value.length > 1) {
                    this.value = this.value.slice(0, 1);
                }
                if (this.value < 1 || this.value > 9) {
                    this.value = '';
                }
                
                // 移除樣式
                this.classList.remove('solved', 'initial');
                showMessage('');
            });

            gridElement.appendChild(input);
            cells.push(input);
        }
    }

    // 取得當前網格的二維陣列表示
    function getBoard() {
        const board = [];
        for (let r = 0; r < SIZE; r++) {
            const row = [];
            for (let c = 0; c < SIZE; c++) {
                const val = cells[r * SIZE + c].value;
                row.push(val === '' ? 0 : parseInt(val, 10));
            }
            board.push(row);
        }
        return board;
    }

    // 將二維陣列寫回網格
    function setBoard(board, originalBoard) {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const index = r * SIZE + c;
                const cell = cells[index];
                
                if (originalBoard[r][c] !== 0) {
                    cell.value = originalBoard[r][c];
                    cell.classList.add('initial');
                    cell.classList.remove('solved');
                } else {
                    cell.value = board[r][c];
                    cell.classList.add('solved');
                    cell.classList.remove('initial');
                }
            }
        }
    }

    // 顯示訊息
    function showMessage(msg, type = '') {
        messageElement.textContent = msg;
        messageElement.className = 'message ' + type;
    }

    // 清除網格
    function clearGrid() {
        cells.forEach(cell => {
            cell.value = '';
            cell.classList.remove('solved', 'initial');
        });
        showMessage('');
    }

    // 載入測試範例
    function loadDemo() {
        clearGrid();
        // 一個簡單的數獨範例
        const demo = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
        
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (demo[r][c] !== 0) {
                    const cell = cells[r * SIZE + c];
                    cell.value = demo[r][c];
                    cell.classList.add('initial');
                }
            }
        }
        showMessage('已載入測試範例', 'success');
    }

    // 驗證放置數字是否合法
    function isValid(board, row, col, num) {
        // 檢查行和列
        for (let i = 0; i < SIZE; i++) {
            if (board[row][i] === num && i !== col) return false;
            if (board[i][col] === num && i !== row) return false;
        }

        // 檢查 3x3 宮格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
                    return false;
                }
            }
        }
        return true;
    }

    // 檢查初始盤面是否合法
    function isInitialBoardValid(board) {
        let hasNumber = false;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] !== 0) {
                    hasNumber = true;
                    if (!isValid(board, r, c, board[r][c])) {
                        return false;
                    }
                }
            }
        }
        return hasNumber ? true : "empty";
    }

    // 回溯法解題
    function solve(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            
                            if (solve(board)) {
                                return true;
                            }
                            
                            board[row][col] = 0; // 回溯
                        }
                    }
                    return false; // 無法填入任何數字
                }
            }
        }
        return true; // 已經填滿
    }

    // 解題按鈕事件
    solveBtn.addEventListener('click', () => {
        const originalBoard = getBoard();
        
        // 深拷貝一份用來解題
        const board = JSON.parse(JSON.stringify(originalBoard));
        
        const validity = isInitialBoardValid(board);
        if (validity === "empty") {
            showMessage('請先輸入一些數字！', 'error');
            return;
        }
        if (!validity) {
            showMessage('當前盤面不合法，請檢查輸入是否有衝突！', 'error');
            return;
        }

        showMessage('解題中...', '');
        
        // 使用 setTimeout 讓 UI 有機會更新
        setTimeout(() => {
            if (solve(board)) {
                setBoard(board, originalBoard);
                showMessage('解題成功！', 'success');
            } else {
                showMessage('此數獨無解！', 'error');
            }
        }, 10);
    });

    clearBtn.addEventListener('click', clearGrid);
    demoBtn.addEventListener('click', loadDemo);

    // 初始化
    initGrid();
});