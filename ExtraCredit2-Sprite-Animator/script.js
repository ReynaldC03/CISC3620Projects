class SpriteAnimator {
    constructor() {
      this.canvas = document.getElementById('animation-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.spriteUpload = document.getElementById('sprite-upload');
      this.playBtn = document.getElementById('play-btn');
      this.pauseBtn = document.getElementById('pause-btn');
      this.stopBtn = document.getElementById('stop-btn');
      this.prevFrameBtn = document.getElementById('prev-frame-btn');
      this.nextFrameBtn = document.getElementById('next-frame-btn');
      this.currentFrameDisplay = document.getElementById('current-frame');
      this.totalFramesDisplay = document.getElementById('total-frames');
      this.animationsList = document.getElementById('animations-list');
      this.addAnimationBtn = document.getElementById('add-animation-btn');
      this.animationName = document.getElementById('animation-name');
      this.startFrame = document.getElementById('start-frame');
      this.endFrame = document.getElementById('end-frame');
      this.frameRate = document.getElementById('frame-rate');
      this.loopAnimation = document.getElementById('loop-animation');
      this.saveAnimationBtn = document.getElementById('save-animation-btn');
      this.frameWidthInput = document.getElementById('frame-width');
      this.frameHeightInput = document.getElementById('frame-height');
      this.spriteScale = document.getElementById('sprite-scale');
      this.sheetCanvas = document.getElementById('sheet-canvas');
      this.sheetCtx = this.sheetCanvas.getContext('2d');
      this.showSheetBtn = document.getElementById('show-sheet-btn');
      this.closeSheetBtn = document.getElementById('close-sheet-btn');
      this.sheetContainer = document.getElementById('sheet-container');
  
      this.spriteSheet = null;
      this.animations = {
        idle: { start: 0, end: 3, fps: 12, loop: true, frameWidth: 64, frameHeight: 64 },
        run: { start: 4, end: 7, fps: 24, loop: true, frameWidth: 64, frameHeight: 64 },
        jump: { start: 8, end: 11, fps: 10, loop: false, frameWidth: 64, frameHeight: 64 }
      };
      this.currentAnimation = 'idle';
      this.currentFrameIndex = 0;
      this.animationInterval = null;
      this.scale = 2;
      this.isSelecting = false;
      this.selectionStart = { x: 0, y: 0 };
      this.selectionEnd = { x: 0, y: 0 };
      this.editingFrameIndex = 0;
  
      this.initEventListeners();
      this.updateUI();
      this.setCurrentAnimation('idle');
    }
  
    initEventListeners() {
      this.spriteUpload.addEventListener('change', (e) => this.loadSpriteSheet(e));
      this.playBtn.addEventListener('click', () => this.play());
      this.pauseBtn.addEventListener('click', () => this.pause());
      this.stopBtn.addEventListener('click', () => this.stop());
      this.prevFrameBtn.addEventListener('click', () => this.prevFrame());
      this.nextFrameBtn.addEventListener('click', () => this.nextFrame());
      this.saveAnimationBtn.addEventListener('click', () => this.saveAnimation());
      this.addAnimationBtn.addEventListener('click', () => this.addAnimation());
      this.animationsList.addEventListener('click', (e) => this.selectAnimation(e));
      this.frameWidthInput.addEventListener('input', () => this.updateFrameSize());
      this.frameHeightInput.addEventListener('input', () => this.updateFrameSize());
      this.spriteScale.addEventListener('input', () => this.updateScale());
      this.showSheetBtn.addEventListener('click', () => this.showSpriteSheet());
      this.closeSheetBtn.addEventListener('click', () => this.hideSpriteSheet());
      this.sheetCanvas.addEventListener('mousedown', (e) => this.startSheetSelection(e));
      this.sheetCanvas.addEventListener('mousemove', (e) => this.updateSheetSelection(e));
      this.sheetCanvas.addEventListener('mouseup', () => this.endSheetSelection());
    }
  
    loadSpriteSheet(e) {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.spriteSheet = img;
          this.updateCanvasSize();
          this.drawFrame();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    updateCanvasSize() {
      const anim = this.animations[this.currentAnimation];
      this.canvas.width = anim.frameWidth * this.scale;
      this.canvas.height = anim.frameHeight * this.scale;
    }
  
    drawFrame() {
      if (!this.spriteSheet) return;
      
      const anim = this.animations[this.currentAnimation];
      const frameX = anim.start * anim.frameWidth + (this.currentFrameIndex * anim.frameWidth);
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(
        this.spriteSheet,
        frameX, 0,
        anim.frameWidth, anim.frameHeight,
        0, 0,
        anim.frameWidth * this.scale, anim.frameHeight * this.scale
      );
      
      this.updateFrameDisplay();
    }
  
    updateFrameDisplay() {
      const anim = this.animations[this.currentAnimation];
      this.currentFrameDisplay.textContent = this.currentFrameIndex + 1;
      this.totalFramesDisplay.textContent = anim.end - anim.start + 1;
    }
  
    play() {
      if (this.animationInterval || !this.spriteSheet) return;
      
      const anim = this.animations[this.currentAnimation];
      const frameCount = anim.end - anim.start + 1;
      const delay = 1000 / anim.fps;
      
      this.animationInterval = setInterval(() => {
        this.currentFrameIndex = (this.currentFrameIndex + 1) % frameCount;
        if (!anim.loop && this.currentFrameIndex === frameCount - 1) {
          this.stop();
          return;
        }
        this.drawFrame();
      }, delay);
      
      this.playBtn.classList.add('hidden');
      this.pauseBtn.classList.remove('hidden');
    }
  
    pause() {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
      this.playBtn.classList.remove('hidden');
      this.pauseBtn.classList.add('hidden');
    }
  
    stop() {
      this.pause();
      this.currentFrameIndex = 0;
      this.drawFrame();
    }
  
    prevFrame() {
      const anim = this.animations[this.currentAnimation];
      const frameCount = anim.end - anim.start + 1;
      this.currentFrameIndex = (this.currentFrameIndex - 1 + frameCount) % frameCount;
      this.drawFrame();
    }
  
    nextFrame() {
      const anim = this.animations[this.currentAnimation];
      const frameCount = anim.end - anim.start + 1;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % frameCount;
      this.drawFrame();
    }
  
    showSpriteSheet() {
      if (!this.spriteSheet) return;
      
      this.sheetCanvas.width = this.spriteSheet.width;
      this.sheetCanvas.height = this.spriteSheet.height;
      this.sheetCtx.drawImage(this.spriteSheet, 0, 0);
      this.sheetContainer.classList.remove('hidden');
      
      const anim = this.animations[this.currentAnimation];
      const frameX = anim.start * anim.frameWidth + (this.currentFrameIndex * anim.frameWidth);
      
      this.sheetCtx.strokeStyle = '#7a5af5';
      this.sheetCtx.lineWidth = 2;
      this.sheetCtx.strokeRect(
        frameX, 0,
        anim.frameWidth, anim.frameHeight
      );
    }
  
    hideSpriteSheet() {
      this.sheetContainer.classList.add('hidden');
    }
  
    startSheetSelection(e) {
      const rect = this.sheetCanvas.getBoundingClientRect();
      this.selectionStart = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.isSelecting = true;
    }
  
    updateSheetSelection(e) {
      if (!this.isSelecting) return;
      
      const rect = this.sheetCanvas.getBoundingClientRect();
      this.selectionEnd = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      this.sheetCtx.clearRect(0, 0, this.sheetCanvas.width, this.sheetCanvas.height);
      this.sheetCtx.drawImage(this.spriteSheet, 0, 0);
      this.drawSheetSelection();
    }
  
    drawSheetSelection() {
      this.sheetCtx.strokeStyle = '#7a5af5';
      this.sheetCtx.lineWidth = 2;
      this.sheetCtx.strokeRect(
        this.selectionStart.x,
        this.selectionStart.y,
        this.selectionEnd.x - this.selectionStart.x,
        this.selectionEnd.y - this.selectionStart.y
      );
    }
  
    endSheetSelection() {
      if (!this.isSelecting) return;
      this.isSelecting = false;
      
      const anim = this.animations[this.currentAnimation];
      anim.frameWidth = Math.abs(this.selectionEnd.x - this.selectionStart.x);
      anim.frameHeight = Math.abs(this.selectionEnd.y - this.selectionStart.y);
      
      this.frameWidthInput.value = anim.frameWidth;
      this.frameHeightInput.value = anim.frameHeight;
      
      this.updateCanvasSize();
      this.drawFrame();
      this.hideSpriteSheet();
    }
  
    selectAnimation(e) {
      if (e.target.tagName === 'LI') {
        const animationName = e.target.dataset.animation;
        this.setCurrentAnimation(animationName);
      }
    }
  
    setCurrentAnimation(name) {
      this.currentAnimation = name;
      this.currentFrameIndex = 0;
      
      document.querySelectorAll('#animations-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.animation === name);
      });
  
      const anim = this.animations[name];
      this.animationName.value = name;
      this.startFrame.value = anim.start;
      this.endFrame.value = anim.end;
      this.frameRate.value = anim.fps;
      this.loopAnimation.checked = anim.loop;
      this.frameWidthInput.value = anim.frameWidth;
      this.frameHeightInput.value = anim.frameHeight;
      
      this.updateCanvasSize();
      this.drawFrame();
    }
  
    saveAnimation() {
      const name = this.animationName.value.trim();
      if (!name) return;
  
      const animData = {
        start: parseInt(this.startFrame.value) || 0,
        end: parseInt(this.endFrame.value) || 0,
        fps: parseInt(this.frameRate.value) || 12,
        loop: this.loopAnimation.checked,
        frameWidth: parseInt(this.frameWidthInput.value) || 64,
        frameHeight: parseInt(this.frameHeightInput.value) || 64
      };
  
      this.animations[name] = animData;
      this.updateAnimationsList();
      this.setCurrentAnimation(name);
    }
  
    addAnimation() {
      const newName = `animation_${Object.keys(this.animations).length + 1}`;
      this.animations[newName] = { 
        start: 0, 
        end: 3, 
        fps: 12, 
        loop: true,
        frameWidth: 64,
        frameHeight: 64
      };
      this.updateAnimationsList();
      this.setCurrentAnimation(newName);
    }
  
    updateAnimationsList() {
      this.animationsList.innerHTML = '';
      Object.keys(this.animations).forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.dataset.animation = name;
        if (name === this.currentAnimation) {
          li.classList.add('active');
        }
        this.animationsList.appendChild(li);
      });
    }
  
    updateFrameSize() {
      const anim = this.animations[this.currentAnimation];
      anim.frameWidth = parseInt(this.frameWidthInput.value) || 64;
      anim.frameHeight = parseInt(this.frameHeightInput.value) || 64;
      this.updateCanvasSize();
      this.drawFrame();
    }
  
    updateScale() {
      this.scale = parseInt(this.spriteScale.value) || 2;
      this.updateCanvasSize();
      this.drawFrame();
    }
  
    updateUI() {
      this.updateAnimationsList();
      this.updateFrameDisplay();
      this.playBtn.classList.remove('hidden');
      this.pauseBtn.classList.add('hidden');
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new SpriteAnimator();
  });