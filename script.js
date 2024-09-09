//jzggshwundlslsjsbbss'shhabbshsbjsjwhsikaoasgjsosjhsbsjkdkxkfkckckkckzKKjznzbnzjzjzjnznzjzj

class Game{
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.ai = new AI(this);
        
        //button
        this.keys = new Set();
        
        this.buttons = document.querySelectorAll('button');
        this.buttons.forEach(button=>{
            button.addEventListener('touchstart', (e)=>{
                this.keys.add(e.target.id);
            });
            button.addEventListener('touchend', (e)=>{
                this.keys.clear();
            }) 
        })
        //take score
        this.scoreRecorded = false;
        this.restartCountdown = 4;
        this.isRestarting = false;
        //audio
        this.audio = new AudioControl();
        
        //to start game
        this.gameStarted = false;
        startButton.addEventListener('click', ()=>{
            this.gameStarted = true;
            start.style.display = 'none';
            this.audio.play(this.audio.background);
        })
    }
    
    render(ctx){
        
        this.paddle.draw(ctx);
        this.ai.draw(ctx);
        this.drawStatusText(ctx);
 
        this.ball.draw(ctx);
    }
    
    checkCollision(ball, paddle){
        return (
            ball.x + ball.radius > paddle.x &&
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height
            )
    }
    
    drawStatusText(ctx){
        //score
        ctx.fillStyle = 'white';
        ctx.font = '25px Serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('player ' + this.paddle.score + ' ' + this.ai.score +' com', this.width * 0.5, 20);
        //restarting
        ctx.font = '30px Arial'
        if(this.isRestarting) ctx.fillText( Math.floor(this.restartCountdown-= 0.001*16) , this.width* 0.5, this.height*0.5 )

    }
    update(ctx){
        if(this.gameStarted){
            this.paddle.update();
            this.ai.update();
            this.ball.update();
            this.countScore(ctx);
        } 
    }
    countScore(ctx){
        //increase player score
        if (this.ball.y < 0 && !this.scoreRecorded) {
            this.paddle.score++;
            this.audio.play(this.audio.win)
            this.scoreRecorded = true;
            this.restart(ctx);
        }
        //increase computer score
        else if(this.ball.y > this.height &&  !this.scoreRecorded){
            this.ai.score++;
            this.audio.play(this.audio.lose)
            this.scoreRecorded = true;
            this.restart(ctx);
        }
        
    }
    
    restart(ctx){
        this.isRestarting = true;
        setTimeout(()=>{
            this.ai.restart();
            this.paddle.restart();
            this.ball.restart();
            this.scoreRecorded = false;
            this.isRestarting = false;
            this.restartCountdown = 4; 
        }, 3000)
    }
}

class Paddle {
    constructor(game) {
        this.game = game;
        this.width = 96;
        this.height = 19;
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = this.game.height - this.height;
        this.speedY = 0;
        this.speedX = 0
        this.color = 'white'
        this.image = document.getElementById('paddleImage');
        this.score = 0
    }
    draw(ctx) {
        /*  ctx.fillStyle = this.color
          ctx.fillRect(this.x, this.y, this.width, this.height)
         */
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        //move paddle only if game is currently not restarting
        if (!this.game.isRestarting) {
            if (this.game.keys.has('left')) {
                this.speedX = -5;
            }
            else if (this.game.keys.has('right')) {
                this.speedX = 6;
            }
            else this.speedX = 0;
        }

        //wall
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }

    restart() {
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = this.game.height - this.height;
    }
}

class Ball{
    constructor(game){
        this.game = game;
        this.radius = 8;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5 - this.radius;
        this.width = this.height = 16
        this.image = document.getElementById('ballImage');
        this.speedY = 2;
        this.speedX = 2
        this.color = 'gold'
    }
    draw(ctx){
       /* ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        ctx.closePath();
        ctx.fill();
        */
        ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.width, this.height)
    }
    
    update(){
        this.x+= this.speedX;
        this.y+= this.speedY;
        
        //wall
        if(this.x < 4*this.radius || this.x + 4*this.radius > this.game.width){
            this.speedX*= -1;
            if(this.y < 0 || this.y > this.game.height) return;
            this.game.audio.play(this.game.audio.metalHit)
        }
        
        this.bounceOffPaddle()
    }
    
    bounceOffPaddle(){
        //player paddle
        if (this.game.checkCollision(this, this.game.paddle)) {
            this.speedY *= -1
            this.game.audio.play(this.game.audio.ballBounce)
        //disable entering paddle
        if(this.x + this.radius == this.game.paddle.x || this.x - this.radius == this.game.paddle.x + this.game.paddle.width){
            this.speedX *= -1
        }
        
            if(this.x < this.game.paddle.x + this.game.paddle.width * 0.1){
                this.speedX = -4;
            }
            else if(this.x < this.game.paddle.x + this.game.paddle.width * 0.2){
                this.speedX = -3;
            } 
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.3) {
                this.speedX = -2;
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.4) {
                this.speedX = -1;
                this.speedY = -4
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.5) {
                this.speedX = 0;
                this.speedY = -4;
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.6) {
                this.speedX = 1;
                this.speedY = -4
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.7) {
                this.speedX = 2;
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.8) {
                this.speedX = 3;
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 0.9) {
                this.speedX = 4;
            }
            else if (this.x < this.game.paddle.x + this.game.paddle.width * 1.0) {
                this.speedX = 5;
            }
        }
        //AI paddle
        if (this.game.checkCollision(this, this.game.ai)) {
            this.speedY *= -1;
            if(!this.game.isRestarting) this.game.audio.play(this.game.audio.ballBounce)

            //disable entering paddle
            if (this.x + this.radius == this.game.paddle.x || this.x - this.radius == this.game.paddle.x + this.game.paddle.width) {
                this.speedX *= -1
            }
        }
    }
    
    restart(){
        this.x = this.game.paddle.x + this.game.paddle.width * 0.5;
        this.y = this.game.height - this.radius - this.game.paddle.height;
        this.width = this.height = 15
        
        this.speedY = 2;
        this.speedX = 2;
    }
}

class AI {
    constructor(game) {
        this.game = game;
        this.width = 96;
        this.height = 19;
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = 0;
        this.speedY = 0;
        this.speedX = 0
        this.color = 'red'
        this.image = document.getElementById('paddleImage');
        this.score = 0;
    }
    draw(ctx) {
       /* ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
       */
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        //ARTIFICIAL INTELLIGENCE
        //move AI only if game is currently not restarting
        if(! this.game.isRestarting){
            if(this.game.ball.x < this.x){
                this.speedX = -4
            }
            else if(this.game.ball.x >= this.x + this.width){
                this.speedX = 4
            }
            else this.speedX = 0
        } 
        //wall
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }
    
    restart(){
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = 0;
    }
}

class AudioControl{
    constructor(){
        this.background = new Audio('Let_the_Games_Begin_01.ogg')
        this.metalHit = new Audio('MetalHit_01.wav');
        this.ballBounce = new Audio('BallBounce_01.wav');
        this.lose = new Audio('lose.mp3');
        this.win = new Audio('conference_clapping.wav');
    }
    
    play(audio){
        audio.currentTime = 0;
        audio.play();
    }
}

window.addEventListener('load', ()=>{
    const canvas = document.querySelector('#canvas');
canvas.width = 640;
canvas.height = 480;
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'white'
ctx.strokeStyle = 'white'
const game = new Game (canvas)
function loop(timestamp){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    
    game.render(ctx);
    
    game.update(ctx);
    
    requestAnimationFrame(loop)
} 
loop(0)
})
