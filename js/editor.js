class LabelEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.elements = []; // Array to store {type, x, y, width, height, content, color, size, instance (for images)}
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.bgColor = '#ffffff';
        this.canvas.width = 600;
        this.canvas.height = 300;

        this.initEvents();
        this.render();
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.render();
    }

    setBackgroundColor(color) {
        this.bgColor = color;
        this.render();
    }

    addText(text, color, size) {
        if (!text) return;
        this.elements.push({
            type: 'text',
            content: text,
            color: color,
            size: parseInt(size),
            font: 'Inter, sans-serif',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        });
        this.render();
    }

    addImage(imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            // Sane default size max 150px
            const aspect = img.width / img.height;
            let w = 150;
            let h = 150 / aspect;
            
            this.elements.push({
                type: 'image',
                instance: img,
                x: (this.canvas.width - w) / 2,
                y: (this.canvas.height - h) / 2,
                width: w,
                height: h
            });
            this.render();
        };
    }

    clear() {
        this.elements = [];
        this.bgColor = '#ffffff';
        this.render();
    }

    // Event Handling
    initEvents() {
        // Mouse Down
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            // Check selection in reverse order (topmost first)
            const clickedIndex = this.elements.slice().reverse().findIndex(el => this.isHit(pos, el));
            
            if (clickedIndex !== -1) {
                // Correct index because we searched reversed
                const actualIndex = this.elements.length - 1 - clickedIndex;
                this.selectedElement = this.elements[actualIndex];
                
                // Bring to front
                this.elements.splice(actualIndex, 1);
                this.elements.push(this.selectedElement);

                this.isDragging = true;
                this.dragOffset.x = pos.x - this.selectedElement.x;
                this.dragOffset.y = pos.y - this.selectedElement.y;
            } else {
                this.selectedElement = null;
            }
            this.render();
        });

        // Mouse Move
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.selectedElement) {
                const pos = this.getMousePos(e);
                this.selectedElement.x = pos.x - this.dragOffset.x;
                this.selectedElement.y = pos.y - this.dragOffset.y;
                this.render();
            }
        });

        // Mouse Up
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => {
             const touch = e.touches[0];
             const mouseEvent = new MouseEvent('mousedown', {
                 clientX: touch.clientX,
                 clientY: touch.clientY
             });
             this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
             const touch = e.touches[0];
             const mouseEvent = new MouseEvent('mousemove', {
                 clientX: touch.clientX,
                 clientY: touch.clientY
             });
             this.canvas.dispatchEvent(mouseEvent);
        });

         this.canvas.addEventListener('touchend', (e) => {
             const mouseEvent = new MouseEvent('mouseup', {});
             this.canvas.dispatchEvent(mouseEvent);
        });
    }

    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    isHit(pos, el) {
        if (el.type === 'text') {
            this.ctx.font = `${el.size}px ${el.font}`;
            const metrics = this.ctx.measureText(el.content);
            const w = metrics.width;
            const h = el.size; // approximate height
            // Text coordinates are usually bottom-left or alphabetical baseline
            // Let's assume centered for easier dragging or adjust
             return (
                pos.x >= el.x - w/2 &&
                pos.x <= el.x + w/2 &&
                pos.y >= el.y - h &&
                pos.y <= el.y
            );
        } else if (el.type === 'image') {
            return (
                pos.x >= el.x &&
                pos.x <= el.x + el.width &&
                pos.y >= el.y &&
                pos.y <= el.y + el.height
            );
        }
        return false;
    }

    render() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Elements
        this.elements.forEach(el => {
            this.ctx.save();
            if (el === this.selectedElement) {
                 this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                 this.ctx.shadowBlur = 10;
            }

            if (el.type === 'text') {
                this.ctx.font = `${el.size}px ${el.font}`;
                this.ctx.fillStyle = el.color;
                this.ctx.textAlign = 'center'; // Center alignment makes drag math easier
                this.ctx.fillText(el.content, el.x, el.y);
            } else if (el.type === 'image') {
                this.ctx.drawImage(el.instance, el.x, el.y, el.width, el.height);
            }
            this.ctx.restore();
        });
    }
    
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// Initialize Logic
const editor = new LabelEditor('editor-canvas');

// Color Picker Logic
const colors = ['#ffffff', '#f8fafc', '#f1f5f9', '#fee2e2', '#fef9c3', '#dcfce7', '#dbeafe', '#f3e8ff'];
const colorContainer = document.getElementById('bg-colors');

colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-swatch';
    div.style.backgroundColor = color;
    div.onclick = () => editor.setBackgroundColor(color);
    colorContainer.appendChild(div);
});

document.getElementById('custom-bg-color').addEventListener('input', (e) => {
    editor.setBackgroundColor(e.target.value);
});

// Text Logic
document.getElementById('add-text-btn').addEventListener('click', () => {
    const text = document.getElementById('text-input').value;
    const color = document.getElementById('text-color').value;
    const size = document.getElementById('text-size').value;
    if(text) editor.addText(text, color, size);
});

// Image Upload Logic
document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            editor.addImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Export Logic
document.getElementById('export-btn').addEventListener('click', () => {
    const dataUrl = editor.exportImage();
    const link = document.createElement('a');
    link.download = `my-label-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    // Also save to mock Data
    window.App.Data.addDesign({
        id: Date.now(),
        name: "New Design",
        date: new Date().toISOString().split('T')[0],
        preview: dataUrl
    });
    alert("Label downloaded and saved to 'My Designs'!");
});

// Clear
document.getElementById('clear-btn').addEventListener('click', () => editor.clear());
