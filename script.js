// Global variables
        let array = [];
        let originalArray = [];
        let sorting = false;
        let paused = false;
        let speed = 50;
        let comparisons = 0;
        let swaps = 0;
        let accesses = 0;
        let startTime = 0;
        let showValues = false;

        // Algorithm information
        const algorithmInfo = {
            bubble: {
                name: "Bubble Sort",
                description: "Compares adjacent elements and swaps them if they're in the wrong order. Repeats until sorted.",
                timeComplexity: "O(n²)",
                spaceComplexity: "O(1)"
            },
            selection: {
                name: "Selection Sort",
                description: "Finds the minimum element and places it at the beginning. Repeats for remaining elements.",
                timeComplexity: "O(n²)",
                spaceComplexity: "O(1)"
            },
            insertion: {
                name: "Insertion Sort",
                description: "Builds the final sorted array one item at a time by inserting each element into its correct position.",
                timeComplexity: "O(n²)",
                spaceComplexity: "O(1)"
            },
            merge: {
                name: "Merge Sort",
                description: "Divides the array into halves, sorts them recursively, then merges the sorted halves.",
                timeComplexity: "O(n log n)",
                spaceComplexity: "O(n)"
            },
            quick: {
                name: "Quick Sort",
                description: "Picks a pivot element and partitions the array around it, then recursively sorts the partitions.",
                timeComplexity: "O(n log n) average",
                spaceComplexity: "O(log n)"
            },
            heap: {
                name: "Heap Sort",
                description: "Builds a max heap from the array, then repeatedly extracts the maximum element.",
                timeComplexity: "O(n log n)",
                spaceComplexity: "O(1)"
            },
            counting: {
                name: "Counting Sort",
                description: "Counts the occurrences of each element and uses arithmetic to determine positions.",
                timeComplexity: "O(n + k)",
                spaceComplexity: "O(k)"
            },
            radix: {
                name: "Radix Sort",
                description: "Sorts numbers digit by digit, starting from the least significant digit.",
                timeComplexity: "O(d × (n + k))",
                spaceComplexity: "O(n + k)"
            },
            shell: {
                name: "Shell Sort",
                description: "Variation of insertion sort that allows exchange of far apart elements.",
                timeComplexity: "O(n log n) to O(n²)",
                spaceComplexity: "O(1)"
            },
            cocktail: {
                name: "Cocktail Sort",
                description: "Bidirectional bubble sort that sorts in both directions alternately.",
                timeComplexity: "O(n²)",
                spaceComplexity: "O(1)"
            }
        };

        // Initialize
        function init() {
            generateArray();
            setupEventListeners();
            updateAlgorithmInfo();
        }

        // Setup event listeners
        function setupEventListeners() {
            document.getElementById('generateArray').addEventListener('click', generateArray);
            document.getElementById('startSort').addEventListener('click', startSorting);
            document.getElementById('pauseSort').addEventListener('click', pauseSorting);
            document.getElementById('resetArray').addEventListener('click', resetArray);
            document.getElementById('stepSort').addEventListener('click', stepSort);
            document.getElementById('toggleValues').addEventListener('click', toggleValues);
            
            document.getElementById('arraySize').addEventListener('input', (e) => {
                document.getElementById('sizeValue').textContent = e.target.value;
                generateArray();
            });
            
            document.getElementById('speed').addEventListener('input', (e) => {
                speed = parseInt(e.target.value);
                document.getElementById('speedValue').textContent = e.target.value;
            });
            
            document.getElementById('algorithm').addEventListener('change', updateAlgorithmInfo);
            document.getElementById('arrayType').addEventListener('change', generateArray);
        }

        // Generate array based on type
        function generateArray() {
            const size = parseInt(document.getElementById('arraySize').value);
            const type = document.getElementById('arrayType').value;
            
            array = [];
            
            switch(type) {
                case 'random':
                    for (let i = 0; i < size; i++) {
                        array.push(Math.floor(Math.random() * 100) + 1);
                    }
                    break;
                case 'nearly-sorted':
                    for (let i = 0; i < size; i++) {
                        array.push(i + 1);
                    }
                    // Swap a few random elements
                    for (let i = 0; i < size / 10; i++) {
                        let idx1 = Math.floor(Math.random() * size);
                        let idx2 = Math.floor(Math.random() * size);
                        [array[idx1], array[idx2]] = [array[idx2], array[idx1]];
                    }
                    break;
                case 'reversed':
                    for (let i = size; i > 0; i--) {
                        array.push(i);
                    }
                    break;
                case 'few-unique':
                    const uniqueValues = [10, 30, 50, 70, 90];
                    for (let i = 0; i < size; i++) {
                        array.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
                    }
                    break;
            }
            
            originalArray = [...array];
            resetStats();
            renderBars();
        }

        // Render bars
        function renderBars() {
            const container = document.getElementById('visualization');
            container.innerHTML = '';
            container.className = showValues ? 'visualization-container show-values' : 'visualization-container';
            
            const maxValue = Math.max(...array);
            const containerWidth = container.clientWidth;
            const barWidth = Math.max(1, Math.floor((containerWidth - array.length * 2) / array.length));
            
            array.forEach((value, index) => {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.height = `${(value / maxValue) * 350}px`;
                bar.style.width = `${barWidth}px`;
                bar.dataset.index = index;
                
                const valueLabel = document.createElement('span');
                valueLabel.className = 'bar-value';
                valueLabel.textContent = value;
                bar.appendChild(valueLabel);
                
                container.appendChild(bar);
            });
        }

        // Update bars
        function updateBars(indices = [], classNames = []) {
            const bars = document.querySelectorAll('.bar');
            
            // Clear all special classes
            bars.forEach(bar => {
                bar.classList.remove('comparing', 'sorted', 'pivot', 'minimum');
            });
            
            // Apply new classes
            indices.forEach((index, i) => {
                if (bars[index]) {
                    bars[index].classList.add(classNames[i] || classNames[0]);
                }
            });
            
            // Update heights
            const maxValue = Math.max(...array);
            array.forEach((value, index) => {
                if (bars[index]) {
                    bars[index].style.height = `${(value / maxValue) * 350}px`;
                    bars[index].querySelector('.bar-value').textContent = value;
                }
            });
        }

        // Sleep function for delays
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Start sorting
        async function startSorting() {
            if (sorting) return;
            
            sorting = true;
            paused = false;
            startTime = Date.now();
            resetStats();
            
            const algorithm = document.getElementById('algorithm').value;
            
            disableControls(true);
            
            switch(algorithm) {
                case 'bubble':
                    await bubbleSort();
                    break;
                case 'selection':
                    await selectionSort();
                    break;
                case 'insertion':
                    await insertionSort();
                    break;
                case 'merge':
                    await mergeSort(0, array.length - 1);
                    break;
                case 'quick':
                    await quickSort(0, array.length - 1);
                    break;
                case 'heap':
                    await heapSort();
                    break;
                case 'counting':
                    await countingSort();
                    break;
                case 'radix':
                    await radixSort();
                    break;
                case 'shell':
                    await shellSort();
                    break;
                case 'cocktail':
                    await cocktailSort();
                    break;
            }
            
            // Mark all as sorted
            updateBars(array.map((_, i) => i), ['sorted']);
            
            sorting = false;
            disableControls(false);
        }

        // Sorting algorithms
        async function bubbleSort() {
            for (let i = 0; i < array.length - 1; i++) {
                for (let j = 0; j < array.length - i - 1; j++) {
                    if (paused) await waitForUnpause();
                    
                    updateBars([j, j + 1], ['comparing', 'comparing']);
                    comparisons++;
                    accesses += 2;
                    updateStats();
                    
                    await sleep(speed);
                    
                    if (array[j] > array[j + 1]) {
                        [array[j], array[j + 1]] = [array[j + 1], array[j]];
                        swaps++;
                        updateStats();
                    }
                    
                    updateBars();
                }
                updateBars([array.length - i - 1], ['sorted']);
            }
        }

        async function selectionSort() {
            for (let i = 0; i < array.length - 1; i++) {
                let minIdx = i;
                updateBars([i], ['minimum']);
                
                for (let j = i + 1; j < array.length; j++) {
                    if (paused) await waitForUnpause();
                    
                    updateBars([minIdx, j], ['minimum', 'comparing']);
                    comparisons++;
                    accesses += 2;
                    updateStats();
                    
                    await sleep(speed);
                    
                    if (array[j] < array[minIdx]) {
                        minIdx = j;
                        updateBars([minIdx], ['minimum']);
                    }
                }
                
                if (minIdx !== i) {
                    [array[i], array[minIdx]] = [array[minIdx], array[i]];
                    swaps++;
                    updateStats();
                }
                
                updateBars([i], ['sorted']);
            }
        }

        async function insertionSort() {
            for (let i = 1; i < array.length; i++) {
                let key = array[i];
                let j = i - 1;
                
                updateBars([i], ['comparing']);
                
                while (j >= 0 && array[j] > key) {
                    if (paused) await waitForUnpause();
                    
                    updateBars([j, j + 1], ['comparing', 'comparing']);
                    comparisons++;
                    accesses += 2;
                    updateStats();
                    
                    await sleep(speed);
                    
                    array[j + 1] = array[j];
                    swaps++;
                    updateStats();
                    
                    j--;
                }
                
                array[j + 1] = key;
                updateBars();
            }
        }

        async function mergeSort(left, right) {
            if (left >= right) return;
            
            const mid = Math.floor((left + right) / 2);
            
            await mergeSort(left, mid);
            await mergeSort(mid + 1, right);
            await merge(left, mid, right);
        }

        async function merge(left, mid, right) {
            const leftArr = array.slice(left, mid + 1);
            const rightArr = array.slice(mid + 1, right + 1);
            
            let i = 0, j = 0, k = left;
            
            while (i < leftArr.length && j < rightArr.length) {
                if (paused) await waitForUnpause();
                
                updateBars([k], ['comparing']);
                comparisons++;
                accesses += 2;
                updateStats();
                
                await sleep(speed);
                
                if (leftArr[i] <= rightArr[j]) {
                    array[k] = leftArr[i];
                    i++;
                } else {
                    array[k] = rightArr[j];
                    j++;
                }
                k++;
                updateBars();
            }
            
            while (i < leftArr.length) {
                array[k] = leftArr[i];
                i++;
                k++;
                updateBars();
                await sleep(speed);
            }
            
            while (j < rightArr.length) {
                array[k] = rightArr[j];
                j++;
                k++;
                updateBars();
                await sleep(speed);
            }
        }

        async function quickSort(low, high) {
            if (low < high) {
                const pi = await partition(low, high);
                await quickSort(low, pi - 1);
                await quickSort(pi + 1, high);
            }
        }

        async function partition(low, high) {
            const pivot = array[high];
            let i = low - 1;
            
            updateBars([high], ['pivot']);
            
            for (let j = low; j < high; j++) {
                if (paused) await waitForUnpause();
                
                updateBars([high, j], ['pivot', 'comparing']);
                comparisons++;
                accesses += 2;
                updateStats();
                
                await sleep(speed);
                
                if (array[j] < pivot) {
                    i++;
                    [array[i], array[j]] = [array[j], array[i]];
                    swaps++;
                    updateStats();
                    updateBars();
                }
            }
            
            [array[i + 1], array[high]] = [array[high], array[i + 1]];
            swaps++;
            updateStats();
            updateBars();
            
            return i + 1;
        }

        async function heapSort() {
            // Build heap
            for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
                await heapify(array.length, i);
            }
            
            // Extract elements from heap
            for (let i = array.length - 1; i > 0; i--) {
                [array[0], array[i]] = [array[i], array[0]];
                swaps++;
                updateStats();
                updateBars([i], ['sorted']);
                await sleep(speed);
                
                await heapify(i, 0);
            }
        }

        async function heapify(n, i) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            
            if (left < n && array[left] > array[largest]) {
                largest = left;
            }
            
            if (right < n && array[right] > array[largest]) {
                largest = right;
            }
            
            if (largest !== i) {
                if (paused) await waitForUnpause();
                
                updateBars([i, largest], ['comparing', 'comparing']);
                comparisons++;
                accesses += 2;
                updateStats();
                
                await sleep(speed);
                
                [array[i], array[largest]] = [array[largest], array[i]];
                swaps++;
                updateStats();
                updateBars();
                
                await heapify(n, largest);
            }
        }

        async function countingSort() {
            const max = Math.max(...array);
            const min = Math.min(...array);
            const range = max - min + 1;
            const count = new Array(range).fill(0);
            const output = new Array(array.length);
            
            // Count occurrences
            for (let i = 0; i < array.length; i++) {
                if (paused) await waitForUnpause();
                
                updateBars([i], ['comparing']);
                accesses++;
                updateStats();
                await sleep(speed);
                
                count[array[i] - min]++;
            }
            
            // Calculate cumulative count
            for (let i = 1; i < count.length; i++) {
                count[i] += count[i - 1];
            }
            
            // Build output array
            for (let i = array.length - 1; i >= 0; i--) {
                if (paused) await waitForUnpause();
                
                updateBars([i], ['comparing']);
                accesses++;
                updateStats();
                await sleep(speed);
                
                output[count[array[i] - min] - 1] = array[i];
                count[array[i] - min]--;
            }
            
            // Copy output to original array
            for (let i = 0; i < array.length; i++) {
                array[i] = output[i];
                updateBars();
                await sleep(speed);
            }
        }

        async function radixSort() {
            const max = Math.max(...array);
            
            for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
                await countingSortByDigit(exp);
            }
        }

        async function countingSortByDigit(exp) {
            const output = new Array(array.length);
            const count = new Array(10).fill(0);
            
            for (let i = 0; i < array.length; i++) {
                const digit = Math.floor(array[i] / exp) % 10;
                count[digit]++;
            }
            
            for (let i = 1; i < 10; i++) {
                count[i] += count[i - 1];
            }
            
            for (let i = array.length - 1; i >= 0; i--) {
                if (paused) await waitForUnpause();
                
                updateBars([i], ['comparing']);
                accesses++;
                updateStats();
                await sleep(speed);
                
                const digit = Math.floor(array[i] / exp) % 10;
                output[count[digit] - 1] = array[i];
                count[digit]--;
            }
            
            for (let i = 0; i < array.length; i++) {
                array[i] = output[i];
                updateBars();
                await sleep(speed);
            }
        }

        async function shellSort() {
            for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
                for (let i = gap; i < array.length; i++) {
                    const temp = array[i];
                    let j;
                    
                    for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
                        if (paused) await waitForUnpause();
                        
                        updateBars([j, j - gap], ['comparing', 'comparing']);
                        comparisons++;
                        accesses += 2;
                        updateStats();
                        
                        await sleep(speed);
                        
                        array[j] = array[j - gap];
                        swaps++;
                        updateStats();
                        updateBars();
                    }
                    
                    array[j] = temp;
                    updateBars();
                }
            }
        }

        async function cocktailSort() {
            let swapped = true;
            let start = 0;
            let end = array.length - 1;
            
            while (swapped) {
                swapped = false;
                
                // Forward pass
                for (let i = start; i < end; i++) {
                    if (paused) await waitForUnpause();
                    
                    updateBars([i, i + 1], ['comparing', 'comparing']);
                    comparisons++;
                    accesses += 2;
                    updateStats();
                    
                    await sleep(speed);
                    
                    if (array[i] > array[i + 1]) {
                        [array[i], array[i + 1]] = [array[i + 1], array[i]];
                        swaps++;
                        updateStats();
                        swapped = true;
                    }
                    updateBars();
                }
                
                if (!swapped) break;
                
                swapped = false;
                end--;
                
                // Backward pass
                for (let i = end; i > start; i--) {
                    if (paused) await waitForUnpause();
                    
                    updateBars([i, i - 1], ['comparing', 'comparing']);
                    comparisons++;
                    accesses += 2;
                    updateStats();
                    
                    await sleep(speed);
                    
                    if (array[i] < array[i - 1]) {
                        [array[i], array[i - 1]] = [array[i - 1], array[i]];
                        swaps++;
                        updateStats();
                        swapped = true;
                    }
                    updateBars();
                }
                
                start++;
            }
        }

        // Pause/Resume functionality
        function pauseSorting() {
            paused = !paused;
            document.getElementById('pauseSort').textContent = paused ? 'Resume' : 'Pause';
        }

        async function waitForUnpause() {
            while (paused) {
                await sleep(100);
            }
        }

        // Step functionality
        async function stepSort() {
            // This would require more complex implementation
            // For now, it acts as a slow single step
            speed = 1000;
            document.getElementById('speed').value = 1000;
            document.getElementById('speedValue').textContent = '1000';
        }

        // Reset array
        function resetArray() {
            array = [...originalArray];
            resetStats();
            renderBars();
            sorting = false;
            paused = false;
            disableControls(false);
        }

        // Toggle values display
        function toggleValues() {
            showValues = !showValues;
            document.getElementById('toggleValues').textContent = showValues ? 'Hide Values' : 'Show Values';
            renderBars();
        }

        // Update statistics
        function updateStats() {
            document.getElementById('comparisons').textContent = comparisons;
            document.getElementById('swaps').textContent = swaps;
            document.getElementById('accesses').textContent = accesses;
            
            if (startTime > 0) {
                const elapsed = Date.now() - startTime;
                document.getElementById('timeElapsed').textContent = `${elapsed}ms`;
            }
        }

        // Reset statistics
        function resetStats() {
            comparisons = 0;
            swaps = 0;
            accesses = 0;
            startTime = 0;
            updateStats();
        }

        // Disable/Enable controls
        function disableControls(disable) {
            document.getElementById('generateArray').disabled = disable;
            document.getElementById('startSort').disabled = disable;
            document.getElementById('resetArray').disabled = false;
            document.getElementById('pauseSort').disabled = !disable;
            document.getElementById('stepSort').disabled = disable;
            document.getElementById('algorithm').disabled = disable;
            document.getElementById('arraySize').disabled = disable;
            document.getElementById('arrayType').disabled = disable;
        }

        // Update algorithm information
        function updateAlgorithmInfo() {
            const algorithm = document.getElementById('algorithm').value;
            const info = algorithmInfo[algorithm];
            
            if (info) {
                document.getElementById('algorithmInfo').innerHTML = `
                    <h3>${info.name}</h3>
                    <p>${info.description}</p>
                    <p><strong>Time Complexity:</strong> ${info.timeComplexity}</p>
                    <p><strong>Space Complexity:</strong> ${info.spaceComplexity}</p>
                `;
            }
        }

        // Initialize on load
        window.addEventListener('load', init);