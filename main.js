//board
let tileSize = 32;
let rows = 16;
let collums = 16;

let board;
let boardWidth = tileSize * collums;
let boardHeight = tileSize * rows;
let context;

//player
let playerWidth = tileSize * 2;
let playerHeight = tileSize * 2;
let playerX = tileSize * collums/2 - tileSize;
let playerY = tileSize * rows - tileSize*3;

let player = {
    x : playerX,
    y : playerY,
    width : playerWidth,
    height : playerHeight
}
let playerImage;
let playerVelocityX = tileSize;//player moves 1 tile over

//monkey
let monkeyArray = [];
let monkeyWidth = tileSize*2;
let monkeyHeight = tileSize*2;
let monkeyX = tileSize;
let monkeyY = tileSize;
let monkeyImg;

let monkeyRows = 2;
let monkeyCollums = 3;
let monkeyCount = 0;//number of monkeys to defeat
let monkeyVelocityX = 1;//monkey moving speed

//hit monkey
let bulletArray = [];
let bulletVelocityY = -10;//moving speed is negative because we are going up

//points
let points = 0;
let game_over = false;



window.onload = function(){
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    //draw player
    playerImage = new Image();
    playerImage.src="./assets/player.png";
    playerImage.onload = function(){
        context.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }
    monkeyImg = new Image();
    monkeyImg.src = "./assets/monkey2.png";
    createMonkeys();

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", shootMonkey);
}
function update(){
    if(game_over){
        return;
    }
    //player is being drawn over and over again
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(playerImage, player.x, player.y, player.width, player.height);

    //monkey
    for(let i = 0; i < monkeyArray.length; i++){
        let monkey = monkeyArray[i];
        if(monkey.alive){
            monkey.x += monkeyVelocityX

            //if monkey touches the board
            if(monkey.x + monkey.width >= board.width || monkey.x <= 0){
                monkeyVelocityX *= -1;
                monkey.x += monkeyVelocityX*2;
                //move monkey down by 1 row
                for(let j = 0; j < monkeyArray.length; j++){
                    monkeyArray[j].y += monkeyHeight;
                }
            }
            context.drawImage(monkeyImg, monkey.x, monkey.y, monkey.width, monkey.height);

            if(monkey.y >= player.y){
                game_over = true;
                window.alert(["Game is over! Refresh the page to play again"]);
            }
        }
    }

    //bullet
    for(let i = 0; i < bulletArray.length; i++){
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision to monkey
        for(let j = 0; j < monkeyArray.length; j++){
            let monkey = monkeyArray[j];
            if(!bullet.used && monkey.alive && detectCollision(bullet, monkey)){
                bullet.used = true;
                monkey.alive = false;
                monkeyCount--;
                points += 14;
            }
        }
    }
    //clear used bullets
    //basically if bullet goes past the canvas its being cleared
    while(bulletArray.length > 0 && bulletArray[0].used || bulletArray[0].y < 0){
        bulletArray.shift();//removes first element of array
    }
    //create harder level
    if(monkeyCount == 0){
        //make more monkeys in rows and cols by 1
        monkeyCollums = Math.min(monkeyCollums + 1, collums/2 - 2);//dont overadd a lot of monkeys so they dont overflow
        monkeyRows = Math.min(monkeyRows + 1, rows-5);// 16- 5 = 11
        monkeyVelocityX += 0.2;//monkey move faster
        monkeyArray = [];
        bulletArray = [];
        createMonkeys();
    }

    //paint points
    context.fillStyle="white";
    context.font="16px bold courier";
    context.fillText(points, 5, 20);
}
function movePlayer(e){
    //player cant move if game is over
    if(game_over){
        return;
    }
    if(e.code == "ArrowLeft" && player.x - playerVelocityX >= 0){
        player.x -= playerVelocityX;//move left
    }
    else if(e.code == "ArrowRight" && player.x + playerVelocityX + player.width <= board.width){
        player.x += playerVelocityX;//move right
    }
}
function createMonkeys(){
    for(let c = 0; c < monkeyCollums; c++){
        for(let r = 0; r < monkeyRows; r++){
            let monkey = {
                img : monkeyImg,
                x : monkeyX + c*monkeyWidth,
                y : monkeyY + r*monkeyHeight,
                width : monkeyWidth,
                height : monkeyHeight,
                alive : true   
            }
            monkeyArray.push(monkey);
        }
    }
    monkeyCount = monkeyArray.length;
}
function shootMonkey(e){
    if(game_over){
        return;
    }
    if(e.code == "Space"){
        let bullet = {
            x : player.x + playerWidth*15/32,
            y : player.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false//bool triggers if it touches a monkey
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b){
    return a.x < b.x + b.width && //a top left corner doesnt reach b top right
           a.x + a.width > b.x && //a top right corner passes b top left
           a.y < b.y + b.height && //a top left corner doesnt reach b bottom left
           a.y + a.height > b.y; // a bottom left corner passes b top leftcorner
}