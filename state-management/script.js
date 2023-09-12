import Player from './player.js'; // requires {} if it's a named export
import InputHandler from './input.js';
import drawStatusText from './utils.js';

// main script
window.addEventListener("load", function() {
    const loading = document.getElementById("loading");
    loading.style.display = "none";
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;

    const player = new Player(canvas.width, canvas.height); 
    const input = new InputHandler();
    
    let lastTime = 0;

    function animate(timestamp) {
        const deltatime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.update(input.lastKey, deltatime);
        player.draw(ctx);
        drawStatusText(ctx, input, player);
        requestAnimationFrame(animate);
    }

    animate(0);
})