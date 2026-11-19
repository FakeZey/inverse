function generateMatrix() {
    const size = parseInt(document.getElementById('size').value, 10);
    const grid = document.getElementById('matrixGrid');
    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    grid.style.gap = '3px';

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = `m1r${row}c${col}`;
            input.value = '';
            grid.appendChild(input);
        }
    }
}

const mc = {
    getSize() {
        return parseInt(document.getElementById('size').value, 10);
    },

    readMatrix() {
        const size = this.getSize();
        const matrix = [];
        for (let row = 0; row < size; row++) {
            const rowValues = [];
            for (let col = 0; col < size; col++) {
                const val = parseFloat(document.querySelector(`.m1r${row}c${col}`).value);
                rowValues.push(isNaN(val) ? 0 : val);
            }
            matrix.push(rowValues);
        }
        return matrix;
    },

    writeResult(text) {
        document.getElementById('console').value = text;
    },

    clear() {
        const size = this.getSize();
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                document.querySelector(`.m1r${row}c${col}`).value = '';
            }
        }
        this.writeResult('Result: ');
    },

    round(v) {
        const r = Math.round(v * 10000) / 10000;
        return Object.is(r, -0) ? 0 : r;
    },

    // Shows [A | I] with a divider between the two halves
    formatAug(aug, size) {
        const rounded = aug.map(row => row.map(v => this.round(v)));
        const widths = [];
        for (let c = 0; c < rounded[0].length; c++) {
            widths[c] = Math.max(...rounded.map(row => String(row[c]).length));
        }
        return rounded.map(row => {
            const left = row.slice(0, size).map((v, c) => String(v).padStart(widths[c])).join('  ');
            const right = row.slice(size).map((v, c) => String(v).padStart(widths[c + size])).join('  ');
            return '[ ' + left + '  |  ' + right + ' ]';
        }).join('\n');
    },

    // Gauss-Jordan elimination
    inverse() {
        const size = this.getSize();
        const A = this.readMatrix();
        const steps = [];
        let stepNo = 1;

        const aug = A.map((row, i) => {
            const identityRow = new Array(size).fill(0);
            identityRow[i] = 1;
            return [...row, ...identityRow];
        });

        const log = (title) => {
            steps.push(`Step ${stepNo++}: ${title}\n${this.formatAug(aug, size)}`);
        };

        steps.push('Original matrix A:\n' + this.formatMatrix(A));
        log('Augment A with the identity matrix [A | I]');

        for (let col = 0; col < size; col++) {
            let pivotRow = col;
            let maxVal = Math.abs(aug[col][col]);
            for (let row = col + 1; row < size; row++) {
                if (Math.abs(aug[row][col]) > maxVal) {
                    maxVal = Math.abs(aug[row][col]);
                    pivotRow = row;
                }
            }

            if (maxVal < 1e-10) {
                steps.push(`No usable pivot in column ${col + 1}.`);
                steps.push('Result: This matrix is singular (not invertible).');
                this.writeResult(steps.join('\n\n'));
                return;
            }

            if (pivotRow !== col) {
                [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
                log(`Swap R${col + 1} ↔ R${pivotRow + 1} (larger pivot in column ${col + 1})`);
            }

            const pivotVal = aug[col][col];
            if (Math.abs(pivotVal - 1) > 1e-12) {
                for (let k = 0; k < 2 * size; k++) {
                    aug[col][k] /= pivotVal;
                }
                log(`R${col + 1} → R${col + 1} / ${this.round(pivotVal)}`);
            }

            for (let row = 0; row < size; row++) {
                if (row === col) continue;
                const factor = aug[row][col];
                if (Math.abs(factor) < 1e-12) continue;
                for (let k = 0; k < 2 * size; k++) {
                    aug[row][k] -= factor * aug[col][k];
                }
                const f = this.round(factor);
                const op = f >= 0 ? '−' : '+';
                log(`R${row + 1} → R${row + 1} ${op} ${Math.abs(f)} × R${col + 1}`);
            }
        }

        const inv = aug.map(row => row.slice(size));
        steps.push('The left side is now the identity, so the right side is A⁻¹.');
        steps.push('Result (A⁻¹):\n' + this.formatMatrix(inv));
        this.writeResult(steps.join('\n\n'));
    },

    formatMatrix(matrix) {
        const rounded = matrix.map(row => row.map(v => this.round(v)));
        const widths = [];
        for (let col = 0; col < rounded[0].length; col++) {
            widths[col] = Math.max(...rounded.map(row => String(row[col]).length));
        }
        return rounded
            .map(row => '[ ' + row.map((v, c) => String(v).padStart(widths[c])).join('  ') + ' ]')
            .join('\n');
    }

};

window.onload = generateMatrix;