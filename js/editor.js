class LabelEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.elements = [];
        this.history = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.dragOffset = { x: 0, y: 0 };
        this.bgColor = '#ffffff';
        this._elCounter = 0;
        this.canvas.width = 600;
        this.canvas.height = 300;

        this.initEvents();
        this.render();
        this.saveState();
        this.updateLayers();

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        if (projectId) this.loadProject(projectId);
    }

    loadProject(id) {
        const designs = window.App.Data.getDesigns();
        const project = designs.find(d => d.id == id);
        if (project && project.state) {
            // Restore state
            this.bgColor = project.state.bgColor;
            this.elements = [];
            
            // Rehydrate elements (especially images)
            project.state.elements.forEach(el => {
                if (el.type === 'image') {
                    // Images need to re-load their source
                    const img = new Image();
                    img.src = el.src; // We need to ensure we save src
                    img.onload = () => {
                        el.instance = img;
                        this.elements.push(el);
                        this.render();
                    };
                } else {
                    this.elements.push(el);
                }
            });
            
            this.render();
            window.App.showToast('Project loaded successfully', 'success');
        }
    }

    // Updated saveState to include src for images
    saveState() {
        const state = {
            elements: this.elements.map(el => {
                // Determine src for image persistence
                if (el.type === 'image' && !el.src) {
                     // Try to recover src if not explicit (this is tricky for dataURLs, usually we keep src prop)
                     el.src = el.instance.src; 
                }
                const copy = {...el};
                delete copy.instance; // Don't save DOM objects
                return copy;
            }),
            bgColor: this.bgColor
        };
        // ... history logic same ...
        if (this.history.length > 0) {
            const last = JSON.stringify(this.history[this.history.length - 1]);
            const curr = JSON.stringify(state);
            if (last === curr) return; 
        }
        this.history.push(state);
        if(this.history.length > 20) this.history.shift();
    }

    undo() {
        if (this.history.length <= 1) return;
        this.history.pop(); // Remove current state
        const prevState = this.history[this.history.length - 1];
        
        // Restore
        // Restore
        this.bgColor = prevState.bgColor;
        
        this.elements = prevState.elements.map(el => {
            const copy = {...el};
            if (copy.type === 'image') {
                const img = new Image();
                img.src = copy.src;
                copy.instance = img;
                img.onload = () => this.render();
            }
            return copy;
        }); 
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
        this._elCounter++;
        this.elements.push({
            type: 'text',
            name: `Text ${this._elCounter}`,
            content: text,
            color: color,
            size: parseInt(size),
            font: font || 'Outfit, sans-serif',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        });
        this.render();
        this.saveState();
        this.updateLayers();
        window.App.showToast('Text added', 'success');
    }

    addImage(imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            const aspect = img.width / img.height;
            let w = 150;
            let h = 150 / aspect;
            this._elCounter++;
            this.elements.push({
                type: 'image',
                name: `Image ${this._elCounter}`,
                instance: img,
                src: imgSrc,
                x: (this.canvas.width - w) / 2,
                y: (this.canvas.height - h) / 2,
                width: w,
                height: h
            });
            this.render();
            this.saveState();
            this.updateLayers();
            window.App.showToast('Image uploaded', 'success');
        };
    }

    addShape(type) {
        this._elCounter++;
        const el = {
            type: type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${this._elCounter}`,
            color: '#6366f1',
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height / 2 - 50,
            width: 100,
            height: 100
        };
        this.elements.push(el);
        this.render();
        this.saveState();
        this.updateLayers();
        window.App.showToast(`${el.name} added`, 'success');
    }

    moveLayer(direction) {
        if (!this.selectedElement) return;
        
        const idx = this.elements.indexOf(this.selectedElement);
        if (idx === -1) return;

        if (direction === 'up' && idx < this.elements.length - 1) {
            [this.elements[idx], this.elements[idx+1]] = [this.elements[idx+1], this.elements[idx]];
        } else if (direction === 'down' && idx > 0) {
            [this.elements[idx], this.elements[idx-1]] = [this.elements[idx-1], this.elements[idx]];
        }
        
        this.render();
        this.saveState();
    }

    deleteSelected() {
        if (!this.selectedElement) return;
        this.elements = this.elements.filter(el => el !== this.selectedElement);
        this.selectedElement = null;
        this.render();
        this.saveState();
        this.updateUI();
        this.updateLayers();
        window.App.showToast('Element deleted', 'info');
    }

    clear() {
        if (confirm('Clear entire design?')) {
            this.elements = [];
            this.bgColor = '#ffffff';
            this._elCounter = 0;
            this.selectedElement = null;
            this.render();
            this.saveState();
            this.updateUI();
            this.updateLayers();
            window.App.showToast('Canvas cleared', 'info');
        }
    }

    /* ── Layers Panel ── */
    updateLayers() {
        const list = document.getElementById('layers-list');
        const empty = document.getElementById('layers-empty');
        if (!list) return;

        // Clear all layer items (keep empty msg reference)
        Array.from(list.querySelectorAll('.layer-item')).forEach(n => n.remove());

        if (this.elements.length === 0) {
            if (empty) empty.style.display = '';
            return;
        }
        if (empty) empty.style.display = 'none';

        // Render in reverse order (top layer first)
        [...this.elements].reverse().forEach((el, i) => {
            const icon = el.type === 'text' ? '✍️' : el.type === 'image' ? '🖼️' : el.type === 'circle' ? '⚪' : '⬜';
            const item = document.createElement('div');
            item.className = 'layer-item' + (el === this.selectedElement ? ' active' : '');
            item.innerHTML = `
                <span class="layer-icon">${icon}</span>
                <span class="layer-name" title="${el.name || el.type}">${el.name || el.type}</span>
                <button class="layer-del" title="Delete" data-idx="${i}">✕</button>
            `;
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('layer-del')) return;
                this.selectedElement = el;
                // bring to front
                const idx = this.elements.indexOf(el);
                if (idx !== -1) {
                    this.elements.splice(idx, 1);
                    this.elements.push(el);
                }
                this.render();
                this.updateUI();
                this.updateLayers();
            });
            item.querySelector('.layer-del').addEventListener('click', () => {
                this.selectedElement = el;
                this.deleteSelected();
            });
            list.insertBefore(item, list.querySelector('.layer-item') ? list.querySelector('.layer-item') : null);
            list.appendChild(item);
        });
    }

    updateUI() {
        const tools = document.getElementById('selection-tools');
        const propPanel = document.getElementById('properties-panel');
        if (!tools || !propPanel) return;

        if (this.selectedElement) {
            tools.style.display = 'block';
            propPanel.style.display = 'block';

            const el = this.selectedElement;
            const propContent = document.getElementById('prop-content');

            if (el.type === 'text') {
                propContent.innerHTML = `
                    <div style="margin-bottom:0.6rem;">
                        <label style="display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--text-muted)">CONTENT</label>
                        <input type="text" id="prop-text" value="${el.content.replace(/"/g,'&quot;')}" />
                    </div>
                    <div style="margin-bottom:0.6rem;display:flex;gap:0.5rem;align-items:center;">
                        <div style="flex:1;">
                            <label style="display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--text-muted)">COLOR</label>
                            <input type="color" id="prop-color" value="${el.color}" style="width:100%;height:32px;border:1.5px solid var(--border);border-radius:6px;cursor:pointer;" />
                        </div>
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--text-muted)">SIZE: <span id="size-val">${el.size}px</span></label>
                        <input type="range" id="prop-size" value="${el.size}" min="8" max="200" style="width:100%;" />
                    </div>
                `;
                document.getElementById('prop-text').addEventListener('input', (e) => { el.content = e.target.value; this.render(); this.saveState(); });
                document.getElementById('prop-color').addEventListener('input', (e) => { el.color = e.target.value; this.render(); });
                document.getElementById('prop-size').addEventListener('input', (e) => { el.size = parseInt(e.target.value); document.getElementById('size-val').textContent = e.target.value + 'px'; this.render(); });

            } else if (el.type === 'rect' || el.type === 'circle') {
                propContent.innerHTML = `
                    <div>
                        <label style="display:block;margin-bottom:0.3rem;font-size:0.78rem;font-weight:600;color:var(--text-muted)">FILL COLOR</label>
                        <input type="color" id="prop-color" value="${el.color}" style="width:100%;height:36px;border:1.5px solid var(--border);border-radius:6px;cursor:pointer;" />
                    </div>
                `;
                document.getElementById('prop-color').addEventListener('input', (e) => { el.color = e.target.value; this.render(); this.saveState(); });
            } else {
                propContent.innerHTML = '<p style="font-size:0.82rem;color:var(--text-muted);">Select image to adjust position via drag.</p>';
            }
        } else {
            tools.style.display = 'none';
            propPanel.style.display = 'none';
        }
    }

    // Event Handling
    initEvents() {
        // Mouse Down
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e);
            
            // Check Resize Handles first
            if (this.selectedElement && this.isResizingHit(pos)) {
                this.isResizing = true;
                this.saveState(); // Save before resize starts
                return;
            }

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
            this.updateLayers();
        });

        // Mouse Move
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e);
            
            // Handle Cursor Style
            if (this.selectedElement) {
                const handle = this.getHandleHit(pos);
                if (handle) {
                    this.canvas.style.cursor = (handle === 'nw' || handle === 'se') ? 'nwse-resize' : 'nesw-resize';
                } else if (this.isHit(pos, this.selectedElement)) {
                    this.canvas.style.cursor = 'move';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            } else {
                this.canvas.style.cursor = 'default';
            }

            if (this.isResizing && this.selectedElement) {
                this.handleResize(pos);
                this.render();
            } else if (this.isDragging && this.selectedElement) {
                this.selectedElement.x = pos.x - this.dragOffset.x;
                this.selectedElement.y = pos.y - this.dragOffset.y;
                this.render();
            }
        });

        // Mouse Up
        this.canvas.addEventListener('mouseup', () => {
            if (this.isDragging || this.isResizing) {
                this.isDragging = false;
                this.isResizing = false;
                this.resizeHandle = null;
                this.saveState();
                this.updateLayers();
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

        // External Drop Support
        const container = document.querySelector('.canvas-area');
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.background = '#cbd5e1';
        });
        container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            container.style.background = '#e2e8f0';
        });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.background = '#e2e8f0';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => this.addImage(event.target.result);
                reader.readAsDataURL(file);
            }
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
        // ... existing isHit ...
        if (el.type === 'text') {
            this.ctx.font = `${el.size}px ${el.font}`;
            // Improve hit detection for text
            const metrics = this.ctx.measureText(el.content);
            const w = metrics.width;
            const h = el.size; 
             return (
                pos.x >= el.x - w/2 &&
                pos.x <= el.x + w/2 &&
                pos.y >= el.y - h &&
                pos.y <= el.y + h * 0.2
            );
        } else if (el.type === 'image' || el.type === 'rect' || el.type === 'circle') {
             return (
                pos.x >= el.x &&
                pos.x <= el.x + el.width &&
                pos.y >= el.y &&
                pos.y <= el.y + el.height
            );
        }
        return false;
    }

    // Resize Logic Helpers
    getElRect(el) {
        if (el.type === 'text') {
            this.ctx.font = `${el.size}px ${el.font}`;
            const m = this.ctx.measureText(el.content);
            return { x: el.x - m.width/2, y: el.y - el.size, w: m.width, h: el.size };
        } else {
            return { x: el.x, y: el.y, w: el.width, h: el.height };
        }
    }

    isResizingHit(pos) {
        this.resizeHandle = this.getHandleHit(pos);
        return !!this.resizeHandle;
    }

    getHandleHit(pos) {
        if (!this.selectedElement) return null;
        const rect = this.getElRect(this.selectedElement);
        const handleSize = 10;
        
        // Check corners
        if (this.checkPoint(pos, rect.x - handleSize/2, rect.y - handleSize/2, handleSize)) return 'nw';
        if (this.checkPoint(pos, rect.x + rect.w - handleSize/2, rect.y - handleSize/2, handleSize)) return 'ne';
        if (this.checkPoint(pos, rect.x - handleSize/2, rect.y + rect.h - handleSize/2, handleSize)) return 'sw';
        if (this.checkPoint(pos, rect.x + rect.w - handleSize/2, rect.y + rect.h - handleSize/2, handleSize)) return 'se';
        return null;
    }

    checkPoint(pos, x, y, s) {
        return pos.x >= x && pos.x <= x + s && pos.y >= y && pos.y <= y + s;
    }

    handleResize(pos) {
        const el = this.selectedElement;
        const rect = this.getElRect(el);
        // Simple resizing logic - just adjusting dimensions based on drag
        // This is complex for centering text, but for rect/img it's standard
        
        let newW = el.width;
        let newH = el.height;
        let newX = el.x;
        let newY = el.y;
        
        // For text, we just scale size based on vertical drag
        if (el.type === 'text') {
            const dy = pos.y - rect.y; // distance from top
           // el.size = Math.max(10, Math.abs(dy)); // Simplification
           // Better text scaling: drag SE corner
           if (this.resizeHandle === 'se' || this.resizeHandle === 'sw') {
               const newSize = Math.abs(pos.y - el.y) + 10; // Approx
               el.size = Math.max(10, newSize);
           }
           return;
        }

        // For shapes/images
        if (this.resizeHandle === 'se') {
            newW = pos.x - el.x;
            newH = pos.y - el.y;
        } else if (this.resizeHandle === 'sw') {
            newW = el.x + el.width - pos.x;
            newH = pos.y - el.y;
            newX = pos.x;
        } else if (this.resizeHandle === 'ne') {
            newW = pos.x - el.x;
            newH = el.y + el.height - pos.y;
            newY = pos.y;
        } else if (this.resizeHandle === 'nw') {
            newW = el.x + el.width - pos.x;
            newH = el.y + el.height - pos.y;
            newX = pos.x;
            newY = pos.y;
        }
        
        // Min size constraint
        if(newW > 10 && newH > 10) {
            el.width = newW;
            el.height = newH;
            el.x = newX;
            el.y = newY;
        }
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
                 
                 let rx, ry, rw, rh;
                 
                 // Calculate bounding box for render
                 if (el.type === 'text') {
                     this.ctx.font = `${el.size}px ${el.font}`;
                     const m = this.ctx.measureText(el.content);
                     rx = el.x - m.width/2 - 5;
                     ry = el.y - el.size - 5;
                     rw = m.width + 10;
                     rh = el.size + 15;
                 } else {
                     rx = el.x - 2;
                     ry = el.y - 2;
                     rw = el.width + 4;
                     rh = el.height + 4;
                 }
                 
                 this.ctx.strokeRect(rx, ry, rw, rh);
                 
                 // Draw Handles
                 this.ctx.fillStyle = '#ffffff';
                 this.ctx.strokeStyle = '#2563eb';
                 this.ctx.lineWidth = 1;
                 const hSize = 8;
                 
                 const drawHandle = (x, y) => {
                     this.ctx.fillRect(x - hSize/2, y - hSize/2, hSize, hSize);
                     this.ctx.strokeRect(x - hSize/2, y - hSize/2, hSize, hSize);
                 };
                 
                 drawHandle(rx, ry); // NW
                 drawHandle(rx + rw, ry); // NE
                 drawHandle(rx, ry + rh); // SW
                 drawHandle(rx + rw, ry + rh); // SE
            }

            if (el.type === 'text') {
                this.ctx.font = `${el.size}px ${el.font}`;
                this.ctx.fillStyle = el.color;
                this.ctx.textAlign = 'center'; 
                this.ctx.fillText(el.content, el.x, el.y);
            } else if (el.type === 'image') {
                this.ctx.drawImage(el.instance, el.x, el.y, el.width, el.height);
            } else if (el.type === 'rect') {
                this.ctx.fillStyle = el.color;
                this.ctx.fillRect(el.x, el.y, el.width, el.height);
            } else if (el.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.fillStyle = el.color;
                // Draw circle fitting the bounding box
                this.ctx.ellipse(el.x + el.width/2, el.y + el.height/2, el.width/2, el.height/2, 0, 0, 2 * Math.PI);
                this.ctx.fill();
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
document.getElementById('add-rect-btn').addEventListener('click', () => editor.addShape('rect'));
document.getElementById('add-circle-btn').addEventListener('click', () => editor.addShape('circle'));

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

// Save Logic 
const saveProject = (previewUrl) => {
   // Get current state
   const state = {
       elements: editor.elements.map(el => {
           const copy = {...el}; 
           if(el.type==='image') copy.src = el.src || el.instance.src; 
           delete copy.instance; 
           return copy;
       }),
       bgColor: editor.bgColor
   };

   // Check if we are updating existing or new
   const urlParams = new URLSearchParams(window.location.search);
   const existingId = urlParams.get('project');
   const id = existingId ? parseInt(existingId) : Date.now();
   
   // Save to Data
    const design = {
        id: id,
        name: existingId ? "Updated Design" : "My Design " + new Date().toLocaleTimeString(),
        date: new Date().toISOString().split('T')[0],
        preview: previewUrl,
        state: state // THE MAGIC SAUCE
    };
    
    // In a real app we'd update, here we just push new one or replace
    if (existingId) {
        window.App.Data.deleteDesign(id); // Remove old
    }
    window.App.Data.addDesign(design);
    
    // Update URL if new
    if (!existingId) {
         window.history.replaceState({}, document.title, window.location.pathname + '?project=' + id);
    }
};

document.getElementById('export-btn').addEventListener('click', () => {
    const dataUrl = editor.exportImage();
    const link = document.createElement('a');
    link.download = `my-label-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    saveProject(dataUrl);
    window.App.showToast('Project saved & exported!', 'success');
});

// "Save" button specifically
document.getElementById('save-project-btn').addEventListener('click', () => {
    const dataUrl = editor.exportImage();
    saveProject(dataUrl);
    window.App.showToast('Project Saved!', 'success');
});

// Check for Template in URL
document.addEventListener('DOMContentLoaded', () => {
    // ... template logic ...
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId) {
        const designs = window.App.Data.getCommunityDesigns();
        const template = designs.find(d => d.id == templateId);
        if (template) {
            editor.addImage(template.preview);
            window.App.showToast(`Loaded template: ${template.designer}`, 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});

// Preview Modal Logic
document.getElementById('preview-btn').addEventListener('click', () => {
    const dataUrl = editor.exportImage();
    const modal = document.getElementById('preview-modal');
    const labelView = document.getElementById('bottle-label');
    
    labelView.style.backgroundImage = `url(${dataUrl})`;
    modal.style.display = 'flex';
});
