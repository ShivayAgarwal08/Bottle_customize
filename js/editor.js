class LabelEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.elements = []; 
        this.history = []; // Undo stack
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.bgColor = '#ffffff';
        this.canvas.width = 600;
        this.canvas.height = 300;

        this.initEvents();
        this.render();
        this.saveState();
    }

    saveState() {
        // Deep clone simple objects, assume images are references (ok for now, or use src)
        const state = {
            elements: this.elements.map(el => ({...el})),
            bgColor: this.bgColor
        };
        // Simple optimization: don't save if same as last
        if (this.history.length > 0) {
            const last = JSON.stringify(this.history[this.history.length - 1]);
            const curr = JSON.stringify(state);
            if (last === curr) return; 
        }
        
        this.history.push(state);
        // Limit history
        if(this.history.length > 20) this.history.shift();
    }

    undo() {
        if (this.history.length <= 1) return;
        this.history.pop(); // Remove current state
        const prevState = this.history[this.history.length - 1];
        
        // Restore
        this.bgColor = prevState.bgColor;
        // We need to carefully restore elements. For images, we already have instance refs in memory so it's fine for this session.
        // If we were reloading page, we'd need to re-create Image objects.
        this.elements = prevState.elements.map(el => ({...el})); 
        this.selectedElement = null;
        this.render();
        this.updateUI();
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.render();
        this.saveState();
    }

    setBackgroundColor(color) {
        this.bgColor = color;
        this.render();
        this.saveState();
    }

    addText(text, color, size, font) {
        if (!text) return;
        this.elements.push({
            type: 'text',
            content: text,
            color: color,
            size: parseInt(size),
            font: font || 'Inter, sans-serif',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        });
        this.render();
        this.saveState();
        window.App.showToast('Text added', 'success');
    }

    addImage(imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
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
            this.saveState();
            window.App.showToast('Image uploaded', 'success');
        };
    }

    deleteSelected() {
        if (!this.selectedElement) return;
        this.elements = this.elements.filter(el => el !== this.selectedElement);
        this.selectedElement = null;
        this.render();
        this.saveState();
        this.updateUI();
        window.App.showToast('Element deleted', 'info');
    }

    clear() {
        if(confirm('Clear entire design?')) {
            this.elements = [];
            this.bgColor = '#ffffff';
            this.render();
            this.saveState();
            window.App.showToast('Canvas cleared', 'info');
        }
    }

    updateUI() {
        const delBtn = document.getElementById('delete-el-btn');
        if (this.selectedElement) {
            delBtn.style.display = 'block';
        } else {
            delBtn.style.display = 'none';
        }
    }

    // Event Handling
    initEvents() {
        // Mouse Down
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            const clickedIndex = this.elements.slice().reverse().findIndex(el => this.isHit(pos, el));
            
            if (clickedIndex !== -1) {
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
            this.updateUI();
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
            if(this.isDragging) {
                this.isDragging = false;
                this.saveState(); // Save state after drag finishes
            }
        });
        
        // Mobile Touch Support
        const touchHandler = (type, e) => {
             const touch = e.touches[0] || e.changedTouches[0];
             const mouseEvent = new MouseEvent(type, {
                 clientX: touch.clientX,
                 clientY: touch.clientY
             });
             this.canvas.dispatchEvent(mouseEvent);
        };
        this.canvas.addEventListener('touchstart', (e) => touchHandler('mousedown', e));
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); touchHandler('mousemove', e); });
        this.canvas.addEventListener('touchend', (e) => touchHandler('mouseup', e));
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
            // Improve hit detection for text
            const metrics = this.ctx.measureText(el.content);
            const w = metrics.width;
            const h = el.size; 
            // Text is drawn centered at x, and baseline is roughly y
            // Approximating bounding box for centered text:
             return (
                pos.x >= el.x - w/2 &&
                pos.x <= el.x + w/2 &&
                pos.y >= el.y - h &&
                pos.y <= el.y + h * 0.2 // slack for descenders
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.elements.forEach(el => {
            this.ctx.save();
            
            // Highlight selection
            if (el === this.selectedElement) {
                 this.ctx.strokeStyle = '#2563eb';
                 this.ctx.lineWidth = 2;
                 
                 // Draw bounding box based on type
                 if (el.type === 'text') {
                     this.ctx.font = `${el.size}px ${el.font}`;
                     const m = this.ctx.measureText(el.content);
                     this.ctx.strokeRect(el.x - m.width/2 - 5, el.y - el.size - 5, m.width + 10, el.size + 15);
                 } else {
                     this.ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4);
                 }
            }

            if (el.type === 'text') {
                this.ctx.font = `${el.size}px ${el.font}`;
                this.ctx.fillStyle = el.color;
                this.ctx.textAlign = 'center'; 
                this.ctx.fillText(el.content, el.x, el.y);
            } else if (el.type === 'image') {
                this.ctx.drawImage(el.instance, el.x, el.y, el.width, el.height);
            }
            this.ctx.restore();
        });
    }
    
    exportImage() {
        // Deselect before export to remove border
        const prevSel = this.selectedElement;
        this.selectedElement = null;
        this.render();
        const data = this.canvas.toDataURL('image/png');
        // Restore
        this.selectedElement = prevSel;
        this.render();
        return data;
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
    const font = document.getElementById('font-family').value;
    if(text) editor.addText(text, color, size, font);
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

// Controls
document.getElementById('undo-btn').addEventListener('click', () => editor.undo());
document.getElementById('delete-el-btn').addEventListener('click', () => editor.deleteSelected());
document.getElementById('clear-btn').addEventListener('click', () => editor.clear());

// Key listener for delete
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedElement) {
        // Don't delete if editing an input
        if (document.activeElement.tagName !== 'INPUT') {
            editor.deleteSelected();
        }
    }
    // Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        editor.undo();
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
    window.App.showToast('Design exported and saved!', 'success');
});
