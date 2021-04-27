// Found from https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);


function preload(){
  // Roboto is under the Apache License 2.0 (Included in Asset File)
  roboto = loadFont('assets/fonts/Roboto-Medium.ttf');
}

function setup(){
  canvas = createCanvas(640, 480, WEBGL);
  canvas.parent("sketch");
  canvas.style("display", "block");
  // createElement("")
  // createCanvas(640, 480);
  keys = [false, false, false, false, false, false, false, false];
  keysPressed = [false, false, false, false, false, false, false, false];
  keyCodes = [37, 39, 38, 40, 32, 90, 88, 13, 27];
  left = 0;
  right = 1;
  up = 2;
  down = 3;
  shoot = 4;
  back = 5;
  forward = 6;
  pause = 7;
  esc = 8;
  screens = [new TitleScreen()];
  difficulty = 1;
  curTime = 0;
  difficultyNames = ["Basic", "Benevolent", "Brutal"];
}

function draw(){
  background(30);
  newTime = millis()/1000;
  deltaTime = newTime-curTime;
  if (deltaTime > 0.5) deltaTime = 0;
  curTime = newTime;
  falseKeys = [false, false, false, false, false, false, false, false];
  let screen = screens[screens.length-1];
  screen.update(deltaTime, keys, keysPressed, falseKeys);
  // Reset the key presses here.
  for (let i = 0; i < 9; i++){
    keysPressed[i] = false;
  }
  screen.draw();
  if (screen.nextScreen != undefined){
    screens.push(screen.nextScreen);
  } else if (screen.endScreen){
    screens[screens.length-2].nextScreen = undefined;
    screens.splice(screens.length-1);
  }
}

function keyPressed(){
  for (let i = 0; i < 9; i++){
    if (keyCodes[i] == keyCode && !keys[i]){
      keys[i] = true;
      keysPressed[i] = true;
    } 
  }
}

function keyReleased(){
  for (let i = 0; i < 9; i++){
    if (keyCodes[i] == keyCode){
      keys[i] = false;
    }
  }
}
