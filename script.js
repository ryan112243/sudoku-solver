document.addEventListener('DOMContentLoaded', () => {
    // 檢查 OpenCV.js 是否載入完成
    window.isOpenCvReady = false;
    window.onOpenCvReady = function() {
        window.isOpenCvReady = true;
        console.log('OpenCV.js ready');
    };

    const gridElement = document.getElementById('sudoku-grid');
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');
    const demoBtn = document.getElementById('demo-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadInput = document.getElementById('upload-input');
    const loadingElement = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
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

    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.isOpenCvReady) {
            showMessage('圖像處理引擎仍在載入中，請稍候幾秒再試一次！', 'error');
            uploadInput.value = '';
            return;
        }

        loadingElement.style.display = 'flex';
        loadingText.textContent = '正在分析並擷取數獨網格...';
        showMessage('');

        try {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.src = url;
            await new Promise(r => img.onload = r);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // --- OpenCV 處理 ---
            let src = cv.imread(img);
            let gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            let blurred = new cv.Mat();
            cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            let thresh = new cv.Mat();
            cv.adaptiveThreshold(blurred, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
            
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            
            let maxArea = 0;
            let maxContourIndex = -1;
            let bestApprox = new cv.Mat();
            
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let area = cv.contourArea(cnt);
                if (area > maxArea) {
                    let peri = cv.arcLength(cnt, true);
                    let approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
                    if (approx.rows === 4) {
                        maxArea = area;
                        maxContourIndex = i;
                        approx.copyTo(bestApprox);
                    }
                    approx.delete();
                }
            }
            
            if (maxContourIndex !== -1 && maxArea > 5000) { 
                // 找到網格，進行透視變換
                let pts = [];
                for (let i = 0; i < 4; i++) {
                    pts.push({x: bestApprox.data32S[i*2], y: bestApprox.data32S[i*2+1]});
                }
                
                // 排序 4 個頂點: TL, TR, BR, BL
                let rect = new Array(4);
                let s = pts.map(p => p.x + p.y);
                rect[0] = pts[s.indexOf(Math.min(...s))]; // TL
                rect[2] = pts[s.indexOf(Math.max(...s))]; // BR
                let diff = pts.map(p => p.y - p.x);
                rect[1] = pts[diff.indexOf(Math.min(...diff))]; // TR
                rect[3] = pts[diff.indexOf(Math.max(...diff))]; // BL
                
                let dSize = 900; // 統一轉換成 900x900 的正方形
                let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    rect[0].x, rect[0].y, 
                    rect[1].x, rect[1].y, 
                    rect[2].x, rect[2].y, 
                    rect[3].x, rect[3].y
                ]);
                let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, dSize, 0, dSize, dSize, 0, dSize]);
                
                let M = cv.getPerspectiveTransform(srcTri, dstTri);
                let warped = new cv.Mat();
                let dsize = new cv.Size(dSize, dSize);
                cv.warpPerspective(src, warped, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
                
                // 準備裁切後的 canvas
                canvas.width = dSize;
                canvas.height = dSize;
                cv.imshow(canvas, warped);
                
                M.delete(); warped.delete(); srcTri.delete(); dstTri.delete();
            } else {
                // 找不到明顯網格，直接使用原圖
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            }
            
            src.delete(); gray.delete(); blurred.delete(); thresh.delete(); contours.delete(); hierarchy.delete(); bestApprox.delete();
            // --- OpenCV 處理結束 ---

            loadingText.textContent = '正在初始化圖像辨識模型...';
            const cellWidth = canvas.width / SIZE;
            const cellHeight = canvas.height / SIZE;

            const worker = await Tesseract.createWorker('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '123456789',
            });

            let recognizedBoard = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
            let completed = 0;

            loadingText.textContent = '正在分析圖片數字 (0/81)...';

            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    // 擷取每個宮格的中心 60% 區域，避開可能的網格線
                    const rect = {
                        left: Math.floor(c * cellWidth + cellWidth * 0.20),
                        top: Math.floor(r * cellHeight + cellHeight * 0.20),
                        width: Math.floor(cellWidth * 0.6),
                        height: Math.floor(cellHeight * 0.6)
                    };

                    const cellData = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);
                    if (!isCellEmpty(cellData)) {
                        const { data: { text } } = await worker.recognize(canvas, { rectangle: rect });
                        const num = parseInt(text.trim(), 10);
                        if (!isNaN(num) && num >= 1 && num <= 9) {
                            recognizedBoard[r][c] = num;
                        }
                    }
                    
                    completed++;
                    loadingText.textContent = `正在分析圖片數字 (${completed}/81)...`;
                }
            }
            await worker.terminate();

            clearGrid();
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (recognizedBoard[r][c] !== 0) {
                        const cell = cells[r * SIZE + c];
                        cell.value = recognizedBoard[r][c];
                        cell.classList.add('initial');
                    }
                }
            }
            showMessage('圖片辨識完成！請檢查是否有誤判。', 'success');
        } catch (err) {
            console.error(err);
            showMessage('辨識失敗，請確認圖片是否清晰。', 'error');
        } finally {
            loadingElement.style.display = 'none';
            uploadInput.value = '';
        }
    });

    function isCellEmpty(imageData) {
        const data = imageData.data;
        let darkPixels = 0;
        // 計算深色像素的數量 (轉換為灰階)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray < 150) darkPixels++;
        }
        // 如果深色像素少於 1.5%，視為空白格
        return darkPixels < (data.length / 4) * 0.015;
    }

    // 初始化
    initGrid();
});