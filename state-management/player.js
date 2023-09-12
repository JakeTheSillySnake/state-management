import {StandingLeft, StandingRight, SittingLeft, SittingRight, RunningLeft, RunningRight, JumpingLeft, JumpingRight, FallingLeft, FallingRight} from "./state.js"; // import multiple classes

export default class Player { // handles player
    constructor(gameWidth, gameHeight) {
        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
        this.states = [new StandingLeft(this), new StandingRight(this), new SittingLeft(this), new SittingRight(this), new RunningLeft(this), new RunningRight(this), new JumpingLeft(this), new JumpingRight(this), new FallingLeft(this), new FallingRight(this)]; // pass in player class
        this.currentState = this.states[1];
        this.image = document.getElementById("dog");
        this.width = 200;
        this.height = 181.83;
        this.x = this.gameWidth/2 - this.width/2;
        this.y = this.gameHeight - this.height;
        this.frameX = 0;
        this.maxFrame = 5;
        this.frameY = 0;
        this.speed = 0;
        this.maxSpeed = 10;
        this.vy = 0;
        this.weight = 1;
        this.fps = 20;
        this.frameInterval = 1000/this.fps;
        this.timeSinceFrame = 0;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
    }

    update(input, deltatime) { 
        this.currentState.handleInput(input); // call method of currently active class

        // vertical movement
        this.y += this.vy;
        if (!this.onGround()) {
            this.vy += this.weight
        } else this.vy = 0;
        if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;

        // horizontal movement
        this.x += this.speed;
        if (this.x < 0) this.x = 0;
        else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

        // sprite animation
        if (this.timeSinceFrame > this.frameInterval) {
            if (this.frameX > this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.timeSinceFrame = 0;
        } else this.timeSinceFrame += deltatime;
        
    }

    setState(state) {
        this.currentState = this.states[state]; // update state
        this.currentState.enter(); // change corresponding frames for active class
    }
    onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}