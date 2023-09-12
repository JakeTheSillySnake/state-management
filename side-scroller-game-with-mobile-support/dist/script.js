window.addEventListener("load", function() {
  
  const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 1400; 
canvas.height = 720;
  let enemies = [];
  let score = 0;
  let lives = 3;
  let record = 0;
 
  class InputHandler { // handle all keys being pressed
    
    constructor() {
      this.touchY = ""; // initial y for touch
      this.touchTreshold = 30; // min length of swipe
      this.keys = [];
      window.addEventListener("keydown", e => { // add specific pressed keys to array
        if ((e.key === "ArrowDown"
            || e.key === "ArrowUp"
            || e.key === "ArrowLeft"
            || e.key === "ArrowRight") 
            && this.keys.indexOf(e.key) === -1) {
          this.keys.push(e.key);
        } else if (e.key === "Enter" && lives === 0) restartGame();
      })
      
      window.addEventListener("keyup", e => { // remove released keys from array
        if (e.key === "ArrowDown"
            || e.key === "ArrowUp"
            || e.key === "ArrowLeft"
            || e.key === "ArrowRight") 
        {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }       
      })
      
      window.addEventListener("fullscreenchange", e => {
        if (!document.fullscreenElement) canvas.style.border = "5px solid white";
      })
      
     // mobile touch support
      window.addEventListener("touchstart", e => {
        this.touchY = e.changedTouches[0].pageY // register starting y of touch
      })
      window.addEventListener("touchmove", e => {
        const swipteDistance = e.changedTouches[0].pageY - this.touchY; // swipe distance
        if (swipeDistance < -this.touchTreshold && this.keys.indexOf("swipe up") === -1) this.keys.push("swipe up");
         if (swipeDistance > this.touchTreshold && this.keys.indexOf("swipe down") === -1) this.keys.push("swipe down");
        if (lives === 0 && this.keys.indexOf("swipe down") > -1) restartGame();
      })
      window.addEventListener("touchend", e => {
        this.keys.splice(this.keys.indexOf("swipe up"), 1); this.keys.splice(this.keys.indexOf("swipe down"), 1);
      })
      
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") canvas.style.border = "5px solid white";
  })
    }
    
  }
  
  class Player { // handle player
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("player");
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 0;
      this.vy = 0;
      this.weight = 1; // gravity
      this.maxFrame = 8;
      this.fps = 20;
      this.timeSinceFrame = 0;
      this.frameInterval = 1000/this.fps;
    }
    
    update(input, deltatime, enemies) {
      // collision detection between circles
      enemies.forEach(obj => {
        const dx = (obj.x + obj.width/2 - 20) - (this.x + this.width/2);
        const dy = (obj.y + obj.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy); // distance between enemy/player circle centers]
        
        if (distance < this.width/3 + obj.width/3) {
          if (!obj.collided) lives--;
          obj.collided = true;
        }
      })
      
      // controls
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if(input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if((input.keys.indexOf("ArrowUp") > -1
    || input.keys.indexOf("swipe up") > -1) && this.onGround()) { // single jump when on ground
        this.vy = -30;
      } else {
        this.speed = 0;
      } // move only when key is pressed
      
      // horizontal movement
      this.x += this.speed;
       if (this.x < 0) this.x = 0; 
      else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width // set borders
      
      // vertical movement
      this.y += this.vy;
      if (!this.onGround()) {
        this.vy += this.weight; // reverse vy when player jumps
        this.frameY = 1;
        this.maxFrame = 5;
      } else {
        this.frameY = 0;
        this.maxFrame = 8;
      }
      if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
      
      // sprite animation
      if (this.timeSinceFrame > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.timeSinceFrame = 0;
      } else this.timeSinceFrame += deltatime;
    
    }
    
    draw(ctx) {
      ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }
    
    onGround() {
      return this.y >= this.gameHeight - this.height; // check if player is on ground
    }
    
    restart() {
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.frameX = 8;
      this.frameY = 0;
    }
  }
  
  class Background { // handle bg
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 2400;
      this.height = 720;
      this.image = document.getElementById("background");
      this.speed = 7;
      this.x = 0;
      this.y = 0;
    }
    
    update() {
      this.x -= this.speed;
      this.x2 -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
    
    draw(ctx) {
     ctx.drawImage(this.image,  this.x, this.y, this.width, this.height);
      ctx.drawImage(this.image,  this.x + this.width - 1, this.y, this.width, this.height)
    }
    
    restart() {
      this.x = 0;
    }
  }
  
  class Enemy { // handle all enemies
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById("enemy");
      this.frame = 0;
      this.x = this.gameWidth;
      this. y = this.gameHeight - this.height;
      this.speed = 5;
      this.maxFrame = 5;
      this.fps = 20;
      this.timeSinceFrame = 0;
      this.frameInterval = 1000/this.fps; // animation handling
      this.markedToDelete = false;
      this.collided = false;
    }
    
    update(deltatime) {
      this.x -= this.speed;
      if (this.x < -this.width) {
        if (!this.markedToDelete) score++
        this.markedToDelete = true;
      }
      
      if (this.timeSinceFrame > this.frameInterval) {
        if (this.frame >= this.maxFrame) this.frame = 0;
        else this.frame++;
        this.timeSinceFrame = 0;
      } else this.timeSinceFrame += deltatime;
    }
    
    draw(ctx) {
      ctx.drawImage(this.image, this.frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
    }
  }
  
  let enemyInterval = Math.random() * 1000 + 500;
  let timeSinceEnemy = 0;
  
  function handleEnemies(deltatime) { // enemies reaction to player actions
    if (timeSinceEnemy > enemyInterval + 1500) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      timeSinceEnemy = 0;
      enemyInterval = Math.random() * 1000 + 500; 
      enemies = enemies.filter(obj => !obj.markedToDelete); // filter old enemies
    } else timeSinceEnemy += deltatime;
    enemies.forEach(obj => {
      obj.draw(ctx);
      obj.update(deltatime);
    })
  }
  
  function displayStateText(ctx) { // status display
    ctx.textAlign = "left";
    ctx.font = "40px Georgia";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 22, 52);
    ctx.fillText("Lives: " + lives, 20, 100);
    ctx.fillText("Lives: " + lives, 21, 100);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 20, 50);   
  }
  
  
    const fullscreenButton = document.getElementById("fullscreen");
  fullscreenButton.addEventListener("click", () => {
     if (!document.fullscreenElement) {           // built-in fullscreen method that returns a promise 
canvas.requestFullscreen().catch(err => {
        alert(`Error, cannot enable full-screen: ${err.message}`);
  
    }); 
      canvas.style.border = "none";
    } else {
      document.exitFullscreen();
    } // exit fullscreen if currently in fullscreen
  })
  
  
  const input = new InputHandler();
  const player = new Player (canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);
  
  let lastTime = 0;
  
  function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     const deltatime = timestamp - lastTime;
  lastTime = timestamp;
    background.update();
    background.draw(ctx);
    player.draw(ctx);
    player.update(input, deltatime, enemies);
    handleEnemies(deltatime);
    displayStateText(ctx);
    if (lives > 0) requestAnimationFrame(animate);
    else gameOver();
  }
  
  animate(0);
  
  function gameOver() {
  ctx.font = "120px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("GAME OVER", canvas.width/2 + 5, canvas.height/2 + 5);
  ctx.fillStyle = "white";
  ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
    
  ctx.font = "40px Georgia";
  ctx.fillStyle = "black";
  ctx.fillText("Press Enter or swipe down", canvas.width/2 + 2, 52);
  ctx.fillStyle = "white";
  ctx.fillText("Press Enter or swipe down", canvas.width/2, 50);
    
  if (score > record) {
    record = score;
  ctx.font = "40px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("New Record: " + record, canvas.width/2, canvas.height/2 - 120);
  ctx.fillStyle = "red";
  ctx.fillText("New Record: " + record, canvas.width/2 - 2, canvas.height/2 - 122);
  }
  
  if (lives === 0) {
    const button = document.createElement("button");
button.innerText = "Restart";
  button.id = "button1";
  button.addEventListener("click", () => {
    restartGame();
  });

document.body.appendChild(button);
  }
}
  
function restartGame() {
  player.restart();
  background.restart();
  enemies = [];
  score = 0;
  lives = 3;
  animate(0); document.getElementById("button1").remove()
}
})