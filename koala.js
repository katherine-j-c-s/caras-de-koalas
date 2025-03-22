document.addEventListener('DOMContentLoaded', function() {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    document.querySelector('.koala-container').appendChild(controlsContainer);
    
    // Create action buttons container
    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.className = 'action-buttons-container';
    document.querySelector('.koala-container').appendChild(actionButtonsContainer);
    
    // Get all koala elements
    const koala = document.querySelector('.koala');
    const head = document.querySelector('.cabeza');
    const leftEar = document.querySelector('.oreja-izquierdo');
    const rightEar = document.querySelector('.oreja-derecha');
    const leftEarInner = leftEar.querySelector('.oreja-interna');
    const rightEarInner = rightEar.querySelector('.oreja-interna');
    const leftEye = document.querySelector('.ojo-izquierdo');
    const rightEye = document.querySelector('.ojo-derecho');
    const leftPupil = leftEye.querySelector('.pupila');
    const rightPupil = rightEye.querySelector('.pupila');
    const nose = document.querySelector('.nariz');
    
    // Selected element for editing
    let selectedElement = null;
    let isDragging = false;
    let currentMode = null;
    let deletedElements = [];
    
    // Koala original properties for reset
    const originalProperties = saveOriginalProperties();
    
    // Add click event to koala parts
    document.querySelectorAll('.koala > div, .koala .cabeza > div, .oreja-interna').forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!isDragging) {
                selectElement(this);
            }
        });
    });
    
    // Function to select an element
    function selectElement(element) {
        // Remove highlight from previously selected element
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        
        // Highlight new selected element
        selectedElement = element;
        selectedElement.classList.add('selected');
        
        // Reset mode
        currentMode = null;
        
        // Update action buttons
        updateActionButtons();
    }
    
    // Function to update action buttons
    function updateActionButtons() {
        // Clear previous buttons
        actionButtonsContainer.innerHTML = '';
        
        if (!selectedElement) return;
        
        const buttonData = [
            { id: 'mover', text: 'Mover', icon: '↔️' },
            { id: 'tamaño', text: 'Tamaño', icon: '🔍' },
            { id: 'color', text: 'Color', icon: '🎨' },
            { id: 'largo', text: 'Largo', icon: '⬆️' },
            { id: 'ancho', text: 'Ancho', icon: '⬅️' },
            { id: 'girar', text: 'Girar', icon: '🔄' },
            { id: 'eliminar', text: 'Eliminar', icon: '🗑️' }
        ];
        
        // Create buttons
        buttonData.forEach(data => {
            const button = document.createElement('button');
            button.className = 'action-button';
            button.id = data.id + '-button';
            button.innerHTML = `${data.icon} ${data.text}`;
            
            button.addEventListener('click', function() {
                handleActionButton(data.id);
            });
            
            actionButtonsContainer.appendChild(button);
        });
        
        // Add "Agregar" button regardless of selection
        const addButton = document.createElement('button');
        addButton.className = 'action-button';
        addButton.id = 'agregar-button';
        addButton.innerHTML = '➕ Agregar';
        
        addButton.addEventListener('click', function() {
            handleActionButton('agregar');
        });
        
        actionButtonsContainer.appendChild(addButton);
        
        // Add "Reset" button
        const resetButton = document.createElement('button');
        resetButton.className = 'action-button';
        resetButton.id = 'reset-button';
        resetButton.innerHTML = '↩️ Reset';
        
        resetButton.addEventListener('click', function() {
            handleActionButton('reset');
        });
        
        actionButtonsContainer.appendChild(resetButton);
        
        // Add "Terminado" button
        const doneButton = document.createElement('button');
        doneButton.className = 'action-button done-button';
        doneButton.id = 'terminado-button';
        doneButton.innerHTML = '✅ TERMINADO';
        
        doneButton.addEventListener('click', function() {
            handleActionButton('terminado');
        });
        
        actionButtonsContainer.appendChild(doneButton);
    }
    
    // Function to handle button actions
    function handleActionButton(action) {
        // Reset controls container before showing new controls
        controlsContainer.innerHTML = '';
        
        // Reset any previous mode
        if (currentMode !== action) {
            cleanupCurrentMode();
        }
        
        currentMode = action;
        
        switch (action) {
            case 'mover':
                enableDragMode();
                break;
            case 'tamaño':
                showSizeControl();
                break;
            case 'color':
                showColorControl();
                break;
            case 'largo':
                showHeightControl();
                break;
            case 'ancho':
                showWidthControl();
                break;
            case 'girar':
                showRotateControl();
                break;
            case 'eliminar':
                deleteElement();
                break;
            case 'agregar':
                showAddOptions();
                break;
            case 'reset':
                resetKoala();
                break;
            case 'terminado':
                finishEditing();
                break;
        }
    }
    
    // Function to enable drag mode
    function enableDragMode() {
        if (!selectedElement) return;
        
        const statusMsg = document.createElement('div');
        statusMsg.className = 'status-message';
        statusMsg.textContent = 'Modo mover: Arrastra el elemento a la posición deseada.';
        controlsContainer.appendChild(statusMsg);
        
        // Add continue button
        addContinueButton();
        
        // Store original position
        let startX, startY;
        let originalLeft = selectedElement.style.left ? parseInt(selectedElement.style.left) : null;
        let originalTop = selectedElement.style.top ? parseInt(selectedElement.style.top) : null;
        
        // If position isn't set in style, get it from computed style
        if (originalLeft === null || originalTop === null) {
            const computedStyle = window.getComputedStyle(selectedElement);
            originalLeft = parseFloat(computedStyle.left) / koala.offsetWidth * 100;
            originalTop = parseFloat(computedStyle.top) / koala.offsetHeight * 100;
        }
        
        let originalPosition = { left: originalLeft, top: originalTop };
        
        // Make element draggable
        selectedElement.classList.add('draggable');
        
        // Add mousemove and mouseup listeners
        const mouseDownHandler = function(e) {
            if (!selectedElement.classList.contains('draggable')) return;
            
            e.preventDefault();
            
            // Get the current mouse position
            startX = e.clientX;
            startY = e.clientY;
            
            isDragging = true;
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };
        
        const mouseMoveHandler = function(e) {
            if (!isDragging) return;
            
            // Calculate the new position
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // Convert pixel difference to percentage
            const dxPercent = (dx / koala.offsetWidth) * 100;
            const dyPercent = (dy / koala.offsetHeight) * 100;
            
            // Update position
            const newLeft = originalPosition.left + dxPercent;
            const newTop = originalPosition.top + dyPercent;
            
            selectedElement.style.left = `${newLeft}%`;
            selectedElement.style.top = `${newTop}%`;
        };
        
        const mouseUpHandler = function() {
            isDragging = false;
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        selectedElement.addEventListener('mousedown', mouseDownHandler);
        
        // Store cleanup function
        currentModeCleanup = function() {
            selectedElement.classList.remove('draggable');
            selectedElement.removeEventListener('mousedown', mouseDownHandler);
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }
    
    // Function to show size control
    function showSizeControl() {
        if (!selectedElement) return;
        
        const sizeControl = document.createElement('div');
        sizeControl.className = 'control-group';
        
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Tamaño: ';
        
        const sizeSlider = document.createElement('input');
        sizeSlider.type = 'range';
        sizeSlider.min = '50';
        sizeSlider.max = '150';
        sizeSlider.value = '100';
        
        sizeSlider.addEventListener('input', function() {
            const scale = this.value / 100;
            selectedElement.style.transform = `scale(${scale}) ${selectedElement.style.transform ? selectedElement.style.transform.replace(/scale\([^)]*\)/, '') : ''}`;
        });
        
        sizeControl.appendChild(sizeLabel);
        sizeControl.appendChild(sizeSlider);
        controlsContainer.appendChild(sizeControl);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to show color control
    function showColorControl() {
        if (!selectedElement) return;
        
        const colorControl = document.createElement('div');
        colorControl.className = 'control-group';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color: ';
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = rgbToHex(selectedElement.style.backgroundColor || 
                            getComputedStyle(selectedElement).backgroundColor);
        
        colorPicker.addEventListener('input', function() {
            selectedElement.style.backgroundColor = this.value;
        });
        
        colorControl.appendChild(colorLabel);
        colorControl.appendChild(colorPicker);
        controlsContainer.appendChild(colorControl);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to show height control
    function showHeightControl() {
        if (!selectedElement) return;
        
        const heightControl = document.createElement('div');
        heightControl.className = 'control-group';
        
        const heightLabel = document.createElement('label');
        heightLabel.textContent = 'Largo: ';
        
        const heightSlider = document.createElement('input');
        heightSlider.type = 'range';
        heightSlider.min = '50';
        heightSlider.max = '150';
        heightSlider.value = '100';
        
        // Get current height
        const computedStyle = window.getComputedStyle(selectedElement);
        const currentHeight = parseFloat(computedStyle.height);
        
        heightSlider.addEventListener('input', function() {
            const percentage = this.value / 100;
            const newHeight = (currentHeight * percentage / koala.offsetHeight * 100);
            selectedElement.style.height = `${newHeight}%`;
        });
        
        heightControl.appendChild(heightLabel);
        heightControl.appendChild(heightSlider);
        controlsContainer.appendChild(heightControl);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to show width control
    function showWidthControl() {
        if (!selectedElement) return;
        
        const widthControl = document.createElement('div');
        widthControl.className = 'control-group';
        
        const widthLabel = document.createElement('label');
        widthLabel.textContent = 'Ancho: ';
        
        const widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.min = '50';
        widthSlider.max = '150';
        widthSlider.value = '100';
        
        // Get current width
        const computedStyle = window.getComputedStyle(selectedElement);
        const currentWidth = parseFloat(computedStyle.width);
        
        widthSlider.addEventListener('input', function() {
            const percentage = this.value / 100;
            const newWidth = (currentWidth * percentage / koala.offsetWidth * 100);
            selectedElement.style.width = `${newWidth}%`;
        });
        
        widthControl.appendChild(widthLabel);
        widthControl.appendChild(widthSlider);
        controlsContainer.appendChild(widthControl);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to show rotate control
    function showRotateControl() {
        if (!selectedElement) return;
        
        const rotateControl = document.createElement('div');
        rotateControl.className = 'control-group';
        
        const rotateLabel = document.createElement('label');
        rotateLabel.textContent = 'Girar: ';
        
        const rotateSlider = document.createElement('input');
        rotateSlider.type = 'range';
        rotateSlider.min = '0';
        rotateSlider.max = '360';
        rotateSlider.value = '0';
        
        // Get current rotation if any
        let currentRotation = 0;
        const transform = selectedElement.style.transform;
        if (transform) {
            const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
            if (rotateMatch) {
                currentRotation = parseInt(rotateMatch[1]);
            }
        }
        
        rotateSlider.value = currentRotation;
        
        rotateSlider.addEventListener('input', function() {
            const angle = this.value;
            
            // Preserve other transformations like scale
            let newTransform = selectedElement.style.transform || '';
            if (newTransform.includes('rotate')) {
                newTransform = newTransform.replace(/rotate\([^)]+\)/, `rotate(${angle}deg)`);
            } else {
                newTransform += ` rotate(${angle}deg)`;
            }
            
            selectedElement.style.transform = newTransform.trim();
        });
        
        rotateControl.appendChild(rotateLabel);
        rotateControl.appendChild(rotateSlider);
        controlsContainer.appendChild(rotateControl);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to delete element
    function deleteElement() {
        if (!selectedElement) return;
        
        // Check if it's a required element
        const isEssential = selectedElement.classList.contains('cabeza') || 
                           (selectedElement.classList.contains('koala'));
        
        if (isEssential) {
            alert('¡No puedes eliminar esta parte del koala!');
            return;
        }
        
        // Store element info for possible restoration
        const elementInfo = {
            element: selectedElement,
            parent: selectedElement.parentNode,
            nextSibling: selectedElement.nextSibling,
            className: selectedElement.className
        };
        
        deletedElements.push(elementInfo);
        
        // Remove the element
        selectedElement.remove();
        
        // Reset selected element
        selectedElement = null;
        
        // Update action buttons
        updateActionButtons();
    }
    
    // Function to show add options
    function showAddOptions() {
        controlsContainer.innerHTML = '';
        
        const addContainer = document.createElement('div');
        addContainer.className = 'add-options';
        
        // Add elements that can be added
        const addOptions = [
            { id: 'cejas', text: 'Cejas', handler: addEyebrows },
            { id: 'boca', text: 'Boca', handler: addMouth }
        ];
        
        // Add deleted elements that can be restored
        if (deletedElements.length > 0) {
            addOptions.push({ id: 'restaurar', text: 'Restaurar elementos eliminados', handler: showRestoreOptions });
        }
        
        addOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'add-option-button';
            button.textContent = option.text;
            button.addEventListener('click', option.handler);
            addContainer.appendChild(button);
        });
        
        controlsContainer.appendChild(addContainer);
        
        // Add continue button
        addContinueButton();
    }
    
    // Function to show restore options
    function showRestoreOptions() {
        controlsContainer.innerHTML = '';
        
        const restoreContainer = document.createElement('div');
        restoreContainer.className = 'restore-options';
        
        const restoreLabel = document.createElement('h3');
        restoreLabel.textContent = 'Restaurar elementos eliminados:';
        restoreContainer.appendChild(restoreLabel);
        
        deletedElements.forEach((elementInfo, index) => {
            const button = document.createElement('button');
            button.className = 'restore-button';
            button.textContent = `Restaurar ${getElementName(elementInfo.className)}`;
            
            button.addEventListener('click', function() {
                restoreElement(index);
            });
            
            restoreContainer.appendChild(button);
        });
        
        controlsContainer.appendChild(restoreContainer);
        
        // Add go back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = '← Volver a opciones de agregar';
        
        backButton.addEventListener('click', function() {
            showAddOptions();
        });
        
        controlsContainer.appendChild(backButton);
    }
    
    // Function to get friendly element name
    function getElementName(className) {
        const nameMap = {
            'oreja-derecha': 'Oreja derecha',
            'oreja-izquierdo': 'Oreja izquierda',
            'oreja-interna': 'Interior de oreja',
            'ojo-derecho': 'Ojo derecho',
            'ojo-izquierdo': 'Ojo izquierdo',
            'pupila': 'Pupila',
            'nariz': 'Nariz',
            'boca': 'Boca',
            'ceja-derecha': 'Ceja derecha',
            'ceja-izquierda': 'Ceja izquierda'
        };
        
        return nameMap[className] || className;
    }
    
    // Function to restore an element
    function restoreElement(index) {
        if (index >= 0 && index < deletedElements.length) {
            const elementInfo = deletedElements[index];
            
            if (elementInfo.parent) {
                if (elementInfo.nextSibling) {
                    elementInfo.parent.insertBefore(elementInfo.element, elementInfo.nextSibling);
                } else {
                    elementInfo.parent.appendChild(elementInfo.element);
                }
                
                // Re-add event listeners
                elementInfo.element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!isDragging) {
                        selectElement(this);
                    }
                });
                
                // Select the restored element
                selectElement(elementInfo.element);
                
                // Remove from deleted elements
                deletedElements.splice(index, 1);
                
                // Update action buttons
                updateActionButtons();
            }
        }
    }
    
    // Function to add eyebrows
    function addEyebrows() {
        // Check if eyebrows already exist
        const leftEyebrow = document.querySelector('.ceja-izquierda');
        const rightEyebrow = document.querySelector('.ceja-derecha');
        
        if (!leftEyebrow && !rightEyebrow) {
            const head = document.querySelector('.cabeza');
            
            const leftEyebrow = document.createElement('div');
            leftEyebrow.className = 'ceja-izquierda';
            head.appendChild(leftEyebrow);
            
            const rightEyebrow = document.createElement('div');
            rightEyebrow.className = 'ceja-derecha';
            head.appendChild(rightEyebrow);
            
            // Make eyebrows clickable
            leftEyebrow.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!isDragging) {
                    selectElement(this);
                }
            });
            
            rightEyebrow.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!isDragging) {
                    selectElement(this);
                }
            });
            
            // Select the left eyebrow
            selectElement(leftEyebrow);
        } else {
            alert('¡Las cejas ya existen!');
        }
    }
    
    // Function to add mouth
    function addMouth() {
        // Check if mouth already exists
        const mouth = document.querySelector('.boca');
        
        if (!mouth) {
            const head = document.querySelector('.cabeza');
            
            const mouth = document.createElement('div');
            mouth.className = 'boca';
            head.appendChild(mouth);
            
            // Make mouth clickable
            mouth.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!isDragging) {
                    selectElement(this);
                }
            });
            
            // Select the mouth
            selectElement(mouth);
        } else {
            alert('¡La boca ya existe!');
        }
    }
    
    // Function to reset koala
    function resetKoala() {
        // Confirm reset
        if (confirm('¿Estás seguro de que quieres reiniciar el koala?')) {
            applyOriginalProperties();
            
            // Remove any added elements
            const eyebrows = document.querySelectorAll('.ceja-izquierda, .ceja-derecha');
            eyebrows.forEach(el => el.remove());
            
            const mouth = document.querySelector('.boca');
            if (mouth) mouth.remove();
            
            // Clear deleted elements
            deletedElements = [];
            
            // Reset selected element
            selectedElement = null;
            
            // Update action buttons
            updateActionButtons();
        }
    }
    
    // Function to save original properties
    function saveOriginalProperties() {
        const elements = document.querySelectorAll('.koala > div, .koala .cabeza > div, .oreja-interna');
        const properties = {};
        
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const className = element.className;
            
            properties[className] = {
                top: style.top,
                left: style.left,
                width: style.width,
                height: style.height,
                backgroundColor: style.backgroundColor,
                borderRadius: style.borderRadius,
                transform: element.style.transform || 'none'
            };
        });
        
        return properties;
    }
    
    // Function to apply original properties
    function applyOriginalProperties() {
        for (const [className, props] of Object.entries(originalProperties)) {
            const elements = document.getElementsByClassName(className);
            
            for (let element of elements) {
                element.style.top = props.top;
                element.style.left = props.left;
                element.style.width = props.width;
                element.style.height = props.height;
                element.style.backgroundColor = props.backgroundColor;
                element.style.borderRadius = props.borderRadius;
                element.style.transform = props.transform;
            }
        }
    }
    
    // Function to finish editing
    function finishEditing() {
        // Remove controls
        controlsContainer.innerHTML = '';
        actionButtonsContainer.innerHTML = '';
        
        // Remove instructions
        document.querySelector('.instructions').style.display = 'none';
        document.querySelector('.description').style.display = 'none';
        
        // Make koala bigger
        koala.classList.add('koala-finished');
        
        // Create finish container
        const finishContainer = document.createElement('div');
        finishContainer.className = 'finish-container';
        
        // Add congratulations message
        const congratsMsg = document.createElement('h2');
        congratsMsg.textContent = '¡Felicidades! Tu koala está listo.';
        finishContainer.appendChild(congratsMsg);
        
        // Add download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.innerHTML = '💾 Descargar Koala';
        
        downloadButton.addEventListener('click', function() {
            // Alert for download functionality
            alert('¡Funcionalidad de descarga simulada! En una aplicación real, esto descargaría una imagen de tu koala.');
        });
        
        finishContainer.appendChild(downloadButton);
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.className = 'restart-button';
        restartButton.innerHTML = '🔄 Volver a empezar';
        
        restartButton.addEventListener('click', function() {
            window.location.reload();
        });
        
        finishContainer.appendChild(restartButton);
        
        // Add to page
        document.querySelector('.koala-container').appendChild(finishContainer);
    }
    
    // Function to add continue button
    function addContinueButton() {
        const continueButton = document.createElement('button');
        continueButton.className = 'continue-button';
        continueButton.textContent = 'Continuar';
        
        continueButton.addEventListener('click', function() {
            cleanupCurrentMode();
            currentMode = null;
            controlsContainer.innerHTML = '';
            updateActionButtons();
        });
        
        controlsContainer.appendChild(continueButton);
    }
    
    // Cleanup function for current mode
    let currentModeCleanup = null;
    
    function cleanupCurrentMode() {
        if (currentModeCleanup) {
            currentModeCleanup();
            currentModeCleanup = null;
        }
        
        // Additional cleanups
        document.querySelectorAll('.draggable').forEach(el => {
            el.classList.remove('draggable');
        });
    }
    
    // Function to convert RGB to Hex
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
            return '#000000';
        }
        
        // Extract RGB values
        const rgbMatch = rgb.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (rgbMatch) {
            return "#" + 
                ("0" + parseInt(rgbMatch[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgbMatch[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(rgbMatch[3], 10).toString(16)).slice(-2);
        }
        
        return '#000000';
    }
    
    // Initialize by selecting the head
    selectElement(head);
});