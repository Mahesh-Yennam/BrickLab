/**
 * ============================================================================
 * BrickLab - Kinetic DOM Manipulation, Audio Synthesis & Physics Sandbox
 * Pure Vanilla JavaScript (ES6+), Web Audio API, Canvas Particles
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // Color Themes Configuration
  // ==========================================================================
  const THEMES = {
    cyber: [
      'linear-gradient(135deg, #00f0ff, #0072ff)',
      'linear-gradient(135deg, #00f59b, #00aa66)',
      'linear-gradient(135deg, #ff0077, #990044)',
      'linear-gradient(135deg, #ffb703, #fb8500)',
      'linear-gradient(135deg, #7928ca, #431180)'
    ],
    synthwave: [
      'linear-gradient(135deg, #ff007f, #b30059)',
      'linear-gradient(135deg, #7928ca, #4a00e0)',
      'linear-gradient(135deg, #ff8800, #e52e71)',
      'linear-gradient(135deg, #00f0ff, #0083b0)',
      'linear-gradient(135deg, #ffe600, #ff5e36)'
    ],
    emerald: [
      'linear-gradient(135deg, #00f59b, #059669)',
      'linear-gradient(135deg, #00d2be, #0284c7)',
      'linear-gradient(135deg, #b8ff00, #65a30d)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #34d399, #0d9488)'
    ],
    obsidian: [
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #e0b064, #92400e)',
      'linear-gradient(135deg, #fef08a, #ca8a04)',
      'linear-gradient(135deg, #d97706, #78350f)',
      'linear-gradient(135deg, #fbbf24, #d97706)'
    ]
  };

  // Pentatonic Scale Frequencies (Harmonious Musical Frequencies in Hz)
  const PENTATONIC_SCALE = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50 // C6
  ];

  // ==========================================================================
  // Web Audio Synthesizer Engine
  // ==========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.masterGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.2, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    playChime(index = 0, type = 'sine') {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const freq = PENTATONIC_SCALE[index % PENTATONIC_SCALE.length];
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
    }

    playShatter() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // High-pitched descending FM sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    playFanfare() {
      if (this.isMuted) return;
      this.init();
      const chord = [0, 2, 4, 7];
      chord.forEach((noteIdx, i) => {
        setTimeout(() => this.playChime(noteIdx + 4, 'triangle'), i * 85);
      });
    }

    playError() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // ==========================================================================
  // Canvas Particle Physics Engine
  // ==========================================================================
  class ParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.isLooping = false;
      this.init();
    }

    init() {
      if (!this.canvas) return;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createBurst(x, y, colorStr, count = 30) {
      if (!this.ctx) return;
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: Math.random() * 7 + 4,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.015,
          color: colorStr || '#00f0ff',
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.22
        });
      }

      if (!this.isLooping) {
        this.isLooping = true;
        this.render();
      }
    }

    render() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.render());
      } else {
        this.isLooping = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // ==========================================================================
  // Main Brick Matrix Controller
  // ==========================================================================
  class BrickMatrixApp {
    constructor() {
      this.sound = new SoundEngine();
      this.particles = new ParticleEngine('particle-canvas');

      // State Management
      this.gridSize = 3;
      this.activeMode = 'wave'; // 'wave' | 'cascade' | 'shatter' | 'memory'
      this.activeTheme = 'cyber';
      this.score = 0;
      this.combo = 1;
      this.comboTimeout = null;
      this.interactions = 0;

      // Memory Game State
      this.memorySequence = [];
      this.playerStep = 0;
      this.memoryLevel = 1;
      this.isMemoryTurn = false;
      this.isSequencePlaying = false;

      // DOM Elements
      this.stage = document.getElementById('matrix-stage');
      this.scoreEl = document.getElementById('stat-score');
      this.comboEl = document.getElementById('stat-combo');
      this.clicksEl = document.getElementById('stat-clicks');
      this.gameBanner = document.getElementById('game-banner');
      this.gameBannerText = document.getElementById('game-banner-text');
      this.btnStartGame = document.getElementById('btn-start-game');
      this.btnSound = document.getElementById('btn-sound');
      this.soundIcon = document.getElementById('sound-icon');

      this.init();
    }

    init() {
      this.renderMatrix();
      this.bindEvents();
      this.bindKeyboard();
    }

    // ========================================================================
    // Matrix Generation & Theme Styling
    // ========================================================================
    renderMatrix() {
      this.stage.innerHTML = '';
      const palette = THEMES[this.activeTheme] || THEMES.cyber;
      let brickNumber = 1;

      for (let r = 0; r < this.gridSize; r++) {
        const row = document.createElement('div');
        row.className = 'outer-row';
        row.dataset.row = r;

        for (let c = 0; c < this.gridSize; c++) {
          const brick = document.createElement('div');
          brick.className = 'brick';
          brick.dataset.row = r;
          brick.dataset.col = c;
          brick.dataset.index = brickNumber;
          
          // Color based on column index
          const colorGradient = palette[c % palette.length];
          brick.style.background = colorGradient;

          const label = document.createElement('span');
          label.className = 'brick-label';
          label.textContent = `#${brickNumber}`;
          brick.appendChild(label);

          row.appendChild(brick);
          brickNumber++;
        }

        this.stage.appendChild(row);
      }
    }

    // ========================================================================
    // Mode Interaction Handlers
    // ========================================================================

    // 1. Fluid Wave Mode (Enhanced dynamic accordion spring physics)
    handleWaveHover(brick) {
      if (this.activeMode !== 'wave') return;
      const row = brick.parentElement;
      const siblings = row.querySelectorAll('.brick');
      const rowIdx = parseInt(brick.dataset.row, 10);
      const colIdx = parseInt(brick.dataset.col, 10);

      // Expand hovered brick, compress siblings gracefully
      siblings.forEach(b => {
        b.style.flexGrow = (b === brick) ? '3.5' : '0.45';
      });

      // Melodic chime on hover
      this.sound.playChime(rowIdx * this.gridSize + colIdx);
      this.registerInteraction(5);
    }

    handleWaveLeave(brick) {
      if (this.activeMode !== 'wave') return;
      const row = brick.parentElement;
      const siblings = row.querySelectorAll('.brick');
      siblings.forEach(b => {
        b.style.flexGrow = '1';
      });
    }

    // 2. Color Cascade Mode (Manhattan distance ripple wave)
    triggerCascadeRipple(targetRow, targetCol) {
      const allBricks = this.stage.querySelectorAll('.brick:not(.shattered)');
      
      allBricks.forEach(brick => {
        const r = parseInt(brick.dataset.row, 10);
        const c = parseInt(brick.dataset.col, 10);
        const distance = Math.abs(r - targetRow) + Math.abs(c - targetCol);

        setTimeout(() => {
          brick.classList.add('ripple-anim');
          this.sound.playChime(distance + 2, 'sine');
          setTimeout(() => brick.classList.remove('ripple-anim'), 450);
        }, distance * 80);
      });

      this.registerInteraction(25);
    }

    // 3. Zen Shatter Mode (Canvas Particle Physics Burst)
    handleShatter(brick) {
      if (brick.classList.contains('shattered')) return;

      const rect = brick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const computedBg = window.getComputedStyle(brick).backgroundImage;
      
      // Determine accent color for particles
      const themeColors = {
        cyber: '#00f0ff',
        synthwave: '#ff007f',
        emerald: '#00f59b',
        obsidian: '#f59e0b'
      };
      const particleColor = themeColors[this.activeTheme] || '#00f0ff';

      this.particles.createBurst(centerX, centerY, particleColor, 38);
      this.sound.playShatter();
      brick.classList.add('shattered');

      this.registerInteraction(100);

      // Check if all shattered -> celebration!
      const remaining = this.stage.querySelectorAll('.brick:not(.shattered)');
      if (remaining.length === 0) {
        setTimeout(() => {
          this.sound.playFanfare();
          this.particles.createBurst(window.innerWidth / 2, window.innerHeight / 2, '#ffffff', 80);
          this.rebuildMatrix();
        }, 600);
      }
    }

    // 4. Memory Rush Mode (Simon Says Pattern Challenge)
    startMemoryRound() {
      this.isSequencePlaying = true;
      this.isMemoryTurn = false;
      this.playerStep = 0;
      this.gameBannerText.textContent = `Round ${this.memoryLevel}: Watch carefully...`;
      this.btnStartGame.style.display = 'none';

      // Pick a random brick index for this step
      const totalBricks = this.gridSize * this.gridSize;
      const nextIndex = Math.floor(Math.random() * totalBricks);
      this.memorySequence.push(nextIndex);

      // Play back sequence
      this.memorySequence.forEach((brickIdx, step) => {
        setTimeout(() => {
          this.flashMemoryBrick(brickIdx);
          if (step === this.memorySequence.length - 1) {
            setTimeout(() => {
              this.isSequencePlaying = false;
              this.isMemoryTurn = true;
              this.gameBannerText.textContent = `Your Turn! Repeat the ${this.memorySequence.length} step pattern`;
            }, 600);
          }
        }, (step + 1) * 650);
      });
    }

    flashMemoryBrick(flatIndex) {
      const allBricks = this.stage.querySelectorAll('.brick');
      const target = allBricks[flatIndex];
      if (!target) return;

      target.classList.add('flash-active');
      this.sound.playChime(flatIndex, 'triangle');
      setTimeout(() => target.classList.remove('flash-active'), 400);
    }

    handleMemoryClick(brick) {
      if (!this.isMemoryTurn || this.isSequencePlaying) return;

      const allBricks = Array.from(this.stage.querySelectorAll('.brick'));
      const clickedIdx = allBricks.indexOf(brick);
      const expectedIdx = this.memorySequence[this.playerStep];

      if (clickedIdx === expectedIdx) {
        // Correct step
        this.flashMemoryBrick(clickedIdx);
        this.playerStep++;
        this.registerInteraction(50);

        if (this.playerStep === this.memorySequence.length) {
          // Round Complete!
          this.isMemoryTurn = false;
          this.memoryLevel++;
          this.gameBannerText.textContent = `✨ Perfect! Level ${this.memoryLevel} Unlocked!`;
          this.sound.playFanfare();
          this.registerInteraction(250);

          setTimeout(() => {
            this.startMemoryRound();
          }, 1200);
        }
      } else {
        // Wrong step!
        this.sound.playError();
        this.stage.classList.add('shake');
        setTimeout(() => this.stage.classList.remove('shake'), 450);
        this.gameBannerText.textContent = `❌ Pattern Broken! Final Score: ${this.score}`;
        this.isMemoryTurn = false;
        this.memorySequence = [];
        this.memoryLevel = 1;
        this.btnStartGame.style.display = 'inline-block';
        this.btnStartGame.textContent = 'Try Again';
      }
    }

    // ========================================================================
    // Score & HUD Updates
    // ========================================================================
    registerInteraction(basePoints = 10) {
      this.interactions++;
      this.score += basePoints * this.combo;
      
      // Update combo counter
      this.combo = Math.min(this.combo + 1, 10);
      clearTimeout(this.comboTimeout);
      this.comboTimeout = setTimeout(() => {
        this.combo = 1;
        this.comboEl.textContent = '1x';
      }, 1800);

      this.scoreEl.textContent = this.score.toLocaleString();
      this.comboEl.textContent = `${this.combo}x`;
      this.clicksEl.textContent = this.interactions.toLocaleString();
    }

    rebuildMatrix() {
      const allBricks = this.stage.querySelectorAll('.brick');
      allBricks.forEach(b => {
        b.classList.remove('shattered', 'flash-active', 'ripple-anim');
        b.style.flexGrow = '1';
      });
      this.sound.playFanfare();
    }

    shufflePalette() {
      const allBricks = this.stage.querySelectorAll('.brick');
      const palette = THEMES[this.activeTheme] || THEMES.cyber;
      
      allBricks.forEach((brick, idx) => {
        const randomColor = palette[Math.floor(Math.random() * palette.length)];
        brick.style.background = randomColor;
        setTimeout(() => {
          brick.classList.add('ripple-anim');
          setTimeout(() => brick.classList.remove('ripple-anim'), 400);
        }, idx * 30);
      });

      this.sound.playChime(4, 'triangle');
    }

    // ========================================================================
    // Event Listeners & UI Binding
    // ========================================================================
    bindEvents() {
      // 1. Stage Event Delegation
      this.stage.addEventListener('mouseover', (e) => {
        const brick = e.target.closest('.brick');
        if (brick) this.handleWaveHover(brick);
      });

      this.stage.addEventListener('mouseout', (e) => {
        const brick = e.target.closest('.brick');
        if (brick && (!e.relatedTarget || !brick.contains(e.relatedTarget))) {
          this.handleWaveLeave(brick);
        }
      });

      this.stage.addEventListener('click', (e) => {
        const brick = e.target.closest('.brick');
        if (!brick) return;

        const r = parseInt(brick.dataset.row, 10);
        const c = parseInt(brick.dataset.col, 10);

        switch (this.activeMode) {
          case 'wave':
            // In wave mode, clicking gives a punchy chime & micro pulse
            this.sound.playChime(r * this.gridSize + c, 'triangle');
            brick.classList.add('ripple-anim');
            setTimeout(() => brick.classList.remove('ripple-anim'), 400);
            this.registerInteraction(15);
            break;

          case 'cascade':
            this.triggerCascadeRipple(r, c);
            break;

          case 'shatter':
            this.handleShatter(brick);
            break;

          case 'memory':
            this.handleMemoryClick(brick);
            break;
        }
      });

      // 2. Mode Selector Buttons
      const modeButtons = document.querySelectorAll('#mode-group .pill-btn');
      modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          modeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeMode = btn.dataset.mode;

          // Reset any custom flex grow
          this.stage.querySelectorAll('.brick').forEach(b => b.style.flexGrow = '1');

          // Toggle Memory HUD banner
          if (this.activeMode === 'memory') {
            this.gameBanner.classList.add('visible');
            this.gameBannerText.textContent = 'Press "Start Sequence" to begin the memory test!';
            this.btnStartGame.style.display = 'inline-block';
            this.btnStartGame.textContent = 'Start Sequence';
            this.memorySequence = [];
            this.memoryLevel = 1;
          } else {
            this.gameBanner.classList.remove('visible');
          }

          // Restore any shattered bricks when switching away from shatter
          if (this.activeMode !== 'shatter') {
            this.stage.querySelectorAll('.brick.shattered').forEach(b => b.classList.remove('shattered'));
          }

          this.sound.playChime(2, 'sine');
        });
      });

      // 3. Grid Selector Buttons
      const gridButtons = document.querySelectorAll('#grid-group .pill-btn');
      gridButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          gridButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.gridSize = parseInt(btn.dataset.grid, 10);
          this.renderMatrix();
          this.sound.playChime(3, 'sine');
        });
      });

      // 4. Theme Selector Buttons
      const themeButtons = document.querySelectorAll('#theme-group .pill-btn');
      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          themeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTheme = btn.dataset.theme;
          document.body.dataset.theme = this.activeTheme;
          this.renderMatrix();
          this.sound.playChime(4, 'triangle');
        });
      });

      // 5. Actions: Rebuild, Shuffle, Audio, Start Game
      document.getElementById('btn-rebuild').addEventListener('click', () => this.rebuildMatrix());
      document.getElementById('btn-shuffle').addEventListener('click', () => this.shufflePalette());
      
      this.btnSound.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        this.btnSound.title = isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)';
      });

      this.btnStartGame.addEventListener('click', () => {
        this.sound.init();
        this.startMemoryRound();
      });
    }

    // ========================================================================
    // Keyboard Hotkeys Discovery
    // ========================================================================
    bindKeyboard() {
      window.addEventListener('keydown', (e) => {
        // Prevent hotkeys during text selection/inputs if any
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
          case '1':
          case '2':
          case '3':
          case '4': {
            const modeIndex = parseInt(e.key, 10) - 1;
            const modeBtns = document.querySelectorAll('#mode-group .pill-btn');
            if (modeBtns[modeIndex]) modeBtns[modeIndex].click();
            break;
          }
          case ' ': // Spacebar -> trigger wave or shuffle
            e.preventDefault();
            this.shufflePalette();
            break;

          case 'r':
          case 'R':
            this.rebuildMatrix();
            break;

          case 'm':
          case 'M':
            this.btnSound.click();
            break;
        }
      });
    }
  }

  // ==========================================================================
  // Launch Application on DOM Ready
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    window.brickLab = window.brickApp = new BrickMatrixApp();
  });

})();
