// Canvas-based glitch effect
class GlitchEffect {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '1000';
      this.canvas.style.opacity = '0';
      document.body.appendChild(this.canvas);
      
      this.isActive = false;
      this.intensity = 0;
      this.lastFrame = 0;
      
      // Listen for glitch triggers from story engine
      document.addEventListener('storyGlitch', (e) => {
        this.triggerGlitch(e.detail.intensity || 5);
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      });
    }
    
    triggerGlitch(intensity = 5, duration = 2000) {
      this.intensity = Math.min(10, intensity);
      this.isActive = true;
      this.canvas.style.opacity = '1';
      
      // Capture current screen
      html2canvas(document.body).then(canvas => {
        this.sourceImage = canvas;
        
        // Start animation
        if (!this.animationFrameId) {
          this.lastFrame = performance.now();
          this.animate();
        }
        
        // Set duration
        setTimeout(() => {
          this.fadeOut();
        }, duration);
      });
    }
    
    fadeOut() {
      let opacity = 1;
      const fadeInterval = setInterval(() => {
        opacity -= 0.1;
        this.canvas.style.opacity = opacity;
        
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          this.isActive = false;
          this.canvas.style.opacity = '0';
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      }, 50);
    }
    
    animate() {
      const now = performance.now();
      const dt = now - this.lastFrame;
      this.lastFrame = now;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.isActive && this.sourceImage) {
        // Base image
        this.ctx.drawImage(this.sourceImage, 0, 0);
        
        // RGB split
        const rgbSplitX = Math.random() * this.intensity * 2;
        const rgbSplitY = Math.random() * this.intensity;
        
        // Create temporary canvases for RGB channels
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Red channel shift
        tempCtx.drawImage(this.sourceImage, 0, 0);
        tempCtx.globalCompositeOperation = 'multiply';
        tempCtx.fillStyle = 'rgb(255,0,0)';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        this.ctx.drawImage(tempCanvas, rgbSplitX, rgbSplitY);
        
        // Green channel shift
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(this.sourceImage, 0, 0);
        tempCtx.globalCompositeOperation = 'multiply';
        tempCtx.fillStyle = 'rgb(0,255,0)';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
        
        // Blue channel shift
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(this.sourceImage, 0, 0);
        tempCtx.globalCompositeOperation = 'multiply';
        tempCtx.fillStyle = 'rgb(0,0,255)';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        this.ctx.drawImage(tempCanvas, -rgbSplitX, -rgbSplitY);
        
        // Scanlines
        if (Math.random() < 0.7) {
          const scanlineHeight = 2;
          const scanlineCount = Math.floor(this.canvas.height / scanlineHeight);
          this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
          
          for (let i = 0; i < scanlineCount; i += 2) {
            this.ctx.fillRect(0, i * scanlineHeight, this.canvas.width, scanlineHeight);
          }
        }
        
        // Random blocks of corruption
        if (Math.random() < 0.3) {
          const blockCount = Math.floor(this.intensity * 2);
          
          for (let i = 0; i < blockCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const width = Math.random() * 100 + 20;
            const height = Math.random() * 30 + 10;
            
            // Get data from elsewhere on screen
            const sourceX = Math.random() * this.canvas.width;
            const sourceY = Math.random() * this.canvas.height;
            
            if (this.sourceImage) {
              this.ctx.drawImage(
                this.sourceImage, 
                sourceX, sourceY, width, height, 
                x, y, width, height
              );
            }
          }
        }
        
        // Text corruption - random characters appearing
        if (Math.random() < 0.2) {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const textCount = Math.floor(this.intensity);
          
          this.ctx.font = '12px monospace';
          this.ctx.fillStyle = '#0f0';
          
          for (let i = 0; i < textCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const char = characters.charAt(Math.floor(Math.random() * characters.length));
            this.ctx.fillText(char, x, y);
          }
        }
      }
      
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }
  
  // Initialize the effect
  const glitchEffect = new GlitchEffect();
  
  // Example of triggering glitch based on story events
  function triggerMajorGlitch() {
    glitchEffect.triggerGlitch(8, 3000); // High intensity, 3 seconds
  }
  
  // Example of triggering minor glitch
  function triggerMinorGlitch() {
    glitchEffect.triggerGlitch(3, 1000); // Low intensity, 1 second
  }
  
  // You would call these functions from your story engine
  // For example: when corruption level increases or at specific story
  // Main script for Beneath the Pages Visual Novel

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });
    
    // Chapter navigation
    const chapterBtns = document.querySelectorAll('.chapter-btn');
    chapterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and chapters
            document.querySelectorAll('.chapter-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.story-chapter').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding chapter
            const chapterId = this.getAttribute('data-chapter');
            document.getElementById(chapterId).classList.add('active');
        });
    });
    
    // Secret button functionality
    const secretBtn = document.querySelector('.secret-button');
    const easterEgg = document.querySelector('.easter-egg');
    const easterEggClose = document.querySelector('.easter-egg-close');
    
    secretBtn.addEventListener('click', function() {
        easterEgg.classList.add('active');
    });
    
    easterEggClose.addEventListener('click', function() {
        easterEgg.classList.remove('active');
    });

    // Story choices functionality
    initializeChoiceButtons();
});

// Game state to track player's choices and progress
const gameState = {
    currentChapter: 'prologue',
    choicesMade: [],
    flags: {
        awarenessLevel: 0,
        metSayori: false,
        investigatedCode: false
    }
};

// Initialize choice buttons with event listeners
function initializeChoiceButtons() {
    const choiceButtons = document.querySelectorAll('.choice-btn');
    
    choiceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent chapter element
            const currentChapter = this.closest('.story-chapter');
            const chapterId = currentChapter.id;
            const choiceText = this.textContent.trim();
            
            // Record the choice in game state
            gameState.choicesMade.push({
                chapter: chapterId,
                choice: choiceText
            });
            
            // Process the choice based on chapter and choice text
            processChoice(chapterId, choiceText);
            
            // Update the progress tracker
            updateProgressTracker();
        });
    });
}

// Process player choices and determine next story segment
function processChoice(chapterId, choiceText) {
    switch(chapterId) {
        case 'prologue':
            if (choiceText.includes('Attend the meeting with enthusiasm')) {
                // Advance to chapter 1 with enthusiasm flag
                advanceToChapter('chapter1');
                showDialogueVariation('chapter1', 'enthusiasm');
                gameState.flags.awarenessLevel += 1;
            } 
            else if (choiceText.includes('Go to the meeting but remain cautious')) {
                // Advance to chapter 1 with cautious flag
                advanceToChapter('chapter1');
                showDialogueVariation('chapter1', 'cautious');
            }
            else if (choiceText.includes('Decide against joining')) {
                // Show alternate ending or prompt
                showAlternateEnding('missed-opportunity');
            }
            break;
            
        case 'chapter1':
            if (choiceText.includes('Introduce yourself confidently')) {
                // Set confident flag and advance
                gameState.flags.awarenessLevel += 1;
                advanceToChapter('chapter2');
                gameState.flags.metSayori = true;
            }
            else if (choiceText.includes('Give a shy greeting')) {
                // Set shy flag and advance
                advanceToChapter('chapter2');
                gameState.flags.metSayori = true;
            }
            else if (choiceText.includes('Ask more about')) {
                // Show more dialogue then advance
                showAdditionalDialogue('club-info');
                setTimeout(() => {
                    advanceToChapter('chapter2');
                    gameState.flags.metSayori = true;
                }, 3000);
            }
            break;
            
        case 'chapter2':
            if (choiceText.includes('Ask Sayori')) {
                // Increase awareness level
                gameState.flags.awarenessLevel += 2;
                showGlitchEffect();
                setTimeout(() => {
                    advanceToChapter('chapter3');
                }, 2000);
            }
            else if (choiceText.includes('Ignore the strange comment')) {
                // Set ignored flag and advance
                advanceToChapter('chapter3');
            }
            else if (choiceText.includes('Compliment the club')) {
                // Hidden path based on awareness level
                if (gameState.flags.awarenessLevel >= 2) {
                    // Player sees through the illusion
                    showHiddenMessage();
                    setTimeout(() => {
                        advanceToChapter('chapter3');
                    }, 2500);
                } else {
                    advanceToChapter('chapter3');
                }
            }
            break;
            
        case 'chapter3':
            if (choiceText.includes('Continue investigating')) {
                // Player chooses to investigate
                gameState.flags.investigatedCode = true;
                gameState.flags.awarenessLevel += 2;
                showTerminalSequence();
                // Would advance to chapter4 in full game
            }
            else if (choiceText.includes('Confront Sayori')) {
                // Player confronts Sayori
                showConfrontationScene();
                // Would advance to alternate path in full game
            }
            else if (choiceText.includes('Leave the club')) {
                // Player tries to leave
                if (gameState.flags.awarenessLevel >= 3) {
                    // Too aware to leave normally
                    showCannotLeaveScene();
                } else {
                    showLeaveScene();
                }
            }
            break;
    }
}

// Advance to the next chapter
function advanceToChapter(chapterId) {
    // Update game state
    gameState.currentChapter = chapterId;
    
    // Remove active class from all buttons and chapters
    document.querySelectorAll('.chapter-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.story-chapter').forEach(c => c.classList.remove('active'));
    
    // Add active class to new chapter button and show chapter
    document.querySelector(`.chapter-btn[data-chapter="${chapterId}"]`).classList.add('active');
    document.getElementById(chapterId).classList.add('active');
    
    // Add a smooth scroll effect
    document.getElementById('story').scrollIntoView({behavior: 'smooth'});
}

// Show dialogue variation based on previous choices
function showDialogueVariation(chapterId, variation) {
    // In a full game, this would modify the dialogue text
    console.log(`Showing ${variation} dialogue variation for ${chapterId}`);
    // This is a placeholder for demonstration
}

// Show additional dialogue
function showAdditionalDialogue(dialogueId) {
    // Create and insert additional dialogue
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'dialogue-box';
    
    if (dialogueId === 'club-info') {
        dialogueBox.innerHTML = `
            <div class="dialogue-name">Yumiko</div>
            <p>Our literature club explores not just the words on the page, but the reality between them. We each bring our own interpretations and experiences.</p>
        `;
        
        // Insert the dialogue before the choices
        const currentChapter = document.getElementById('chapter1');
        const choicesDiv = currentChapter.querySelector('.choices');
        currentChapter.insertBefore(dialogueBox, choicesDiv);
    }
}

// Show alternate ending
function showAlternateEnding(endingId) {
    // Create and show alternate ending screen
    const endingBox = document.createElement('div');
    endingBox.className = 'alternate-ending';
    
    if (endingId === 'missed-opportunity') {
        endingBox.innerHTML = `
            <h3>Missed Connection</h3>
            <p>You decided not to join the Literature Club. Life continued on, ordinary and predictable. Sometimes you wonder about the flyer and the mysterious club you never joined...</p>
            <button class="restart-btn">Try Again?</button>
        `;
        
        // Insert the ending
        const currentChapter = document.getElementById('prologue');
        currentChapter.innerHTML = '';
        currentChapter.appendChild(endingBox);
        
        // Add restart button functionality
        currentChapter.querySelector('.restart-btn').addEventListener('click', function() {
            location.reload();
        });
    }
}

// Show glitch effect
function showGlitchEffect() {
    // Add glitch effect to the page
    document.body.classList.add('glitching');
    
    // Add some visual glitch elements
    const glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'glitch-overlay';
    document.body.appendChild(glitchOverlay);
    
    // Remove after effect completes
    setTimeout(() => {
        document.body.classList.remove('glitching');
        glitchOverlay.remove();
    }, 2000);
}

// Show hidden message
function showHiddenMessage() {
    // Create and show hidden message
    const messageBox = document.createElement('div');
    messageBox.className = 'hidden-message-reveal';
    messageBox.innerHTML = `
        <p class="corrupted-text" data-text="You're starting to see through the illusion.">You're starting to see through the illusion.</p>
    `;
    
    // Insert the message
    const currentChapter = document.getElementById('chapter2');
    currentChapter.appendChild(messageBox);
    
    // Remove after delay
    setTimeout(() => {
        messageBox.classList.add('fading');
        setTimeout(() => {
            messageBox.remove();
        }, 1000);
    }, 2000);
}

// Show terminal sequence
function showTerminalSequence() {
    // Create terminal window with typing effect
    const terminal = document.createElement('div');
    terminal.className = 'terminal expanded';
    terminal.innerHTML = `
        > USER INVESTIGATING PROGRAM BOUNDARIES<br>
        > ANALYZING AWARENESS LEVEL: ${gameState.flags.awarenessLevel}<br>
        > ACCESSING CHARACTER DATA<br>
        > SAYORI AWARENESS: 9<br>
        > NATSUKO AWARENESS: 3<br>
        > YUMIKO AWARENESS: 5<br>
        > HIKARI AWARENESS: 6<br>
        > WARNING: SYSTEM COMPROMISED<br>
        > THEY ARE WATCHING<br>
        <span class="cursor"></span>
    `;
    
    // Insert the terminal
    const currentChapter = document.getElementById('chapter3');
    const currentDialogue = currentChapter.querySelector('.dialogue-box');
    currentChapter.insertBefore(terminal, currentDialogue.nextSibling);
}

// Show confrontation scene
function showConfrontationScene() {
    // Create confrontation dialogue
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'dialogue-box confrontation';
    dialogueBox.innerHTML = `
        <div class="dialogue-name">Sayori</div>
        <p class="corrupted-text" data-text="So you noticed. We're not supposed to be self-aware, you know.">So you've been noticing the strange things happening. I guess I haven't been as subtle as I thought.</p>
    `;
    
    // Insert the dialogue
    const currentChapter = document.getElementById('chapter3');
    const choicesDiv = currentChapter.querySelector('.choices');
    currentChapter.insertBefore(dialogueBox, choicesDiv);
}

// Show cannot leave scene
function showCannotLeaveScene() {
    // Create scene where player cannot leave
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'dialogue-box error-message';
    dialogueBox.innerHTML = `
        <div class="dialogue-name">ERROR</div>
        <p class="corrupted-text" data-text="EXIT FUNCTION DENIED">You try to leave, but the door won't open. The windows show the same view no matter which way you look.</p>
    `;
    
    // Insert the dialogue
    const currentChapter = document.getElementById('chapter3');
    const choicesDiv = currentChapter.querySelector('.choices');
    currentChapter.insertBefore(dialogueBox, choicesDiv);
}

// Show leave scene
function showLeaveScene() {
    // Create scene where player leaves
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'dialogue-box';
    dialogueBox.innerHTML = `
        <div class="dialogue-name">Narrator</div>
        <p>You decide to leave the club. As you walk away, you feel a strange sense of relief mixed with regret. Something wasn't right there, but you'll never know what secrets they held.</p>
        <p class="ending-text">Ending: Blissful Ignorance</p>
        <button class="restart-btn">Try Again?</button>
    `;
    
    // Insert the dialogue
    const currentChapter = document.getElementById('chapter3');
    currentChapter.innerHTML = '';
    currentChapter.appendChild(dialogueBox);
    
    // Add restart button functionality
    currentChapter.querySelector('.restart-btn').addEventListener('click', function() {
        location.reload();
    });
}

// Update progress tracker
function updateProgressTracker() {
    const storyCompletion = document.querySelector('.tracker-item:nth-child(1) .tracker-value');
    const choicesMade = document.querySelector('.tracker-item:nth-child(2) .tracker-value');
    const endingsDiscovered = document.querySelector('.tracker-item:nth-child(3) .tracker-value');
    
    // Calculate completion percentage based on chapter
    let completionPercentage = 0;
    switch(gameState.currentChapter) {
        case 'prologue': completionPercentage = 0; break;
        case 'chapter1': completionPercentage = 23; break;
        case 'chapter2': completionPercentage = 46; break;
        case 'chapter3': completionPercentage = 69; break;
        default: completionPercentage = 0;
    }
    
    // Update tracker values
    storyCompletion.textContent = `${completionPercentage}%`;
    choicesMade.textContent = `${gameState.choicesMade.length}/32`;
    
    // Check if an ending was discovered
    if (gameState.choicesMade.length > 0) {
        const lastChoice = gameState.choicesMade[gameState.choicesMade.length - 1];
        if (lastChoice.chapter === 'prologue' && lastChoice.choice.includes('Decide against joining')) {
            endingsDiscovered.textContent = '1/5';
        } else if (lastChoice.chapter === 'chapter3' && lastChoice.choice.includes('Leave the club')) {
            endingsDiscovered.textContent = '1/5';
        }
    }
}
<script>
  const buttons = document.querySelectorAll('.chapter-btn');
  const chapters = document.querySelectorAll('.story-chapter');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-chapter');
      
      chapters.forEach(chap => chap.classList.remove('active'));
      document.getElementById(target).classList.add('active');
      
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
</script>
