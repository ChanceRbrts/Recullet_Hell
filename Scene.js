class Scene{
  constructor(layer, playerdeath){
    this.player = new Player(120, 300, playerdeath);
    this.canDie = playerdeath;
    this.died = false;
    this.enemies = [];
    this.waves = getWave(layer);
    this.currentWave = 0;
    this.bullets = [];
    this.wid = 240;
    this.hei = 440;
    this.started = 1.5;
    this.score = 0;
    this.paused = false;
    this.layer = layer;
    this.img = createGraphics(this.wid, this.hei);
    this.graphics = createGraphics(640, 480);
    this.finished = false;
    this.afterWave = undefined;
    this.hasDrawn = false;
    this.layerProg = new LayerProgress();
  }

  addToWave(deltaTime){
    // Wait a second and a half before starting the next wave.
    if (this.started > 0){
      this.started -= deltaTime;
      if (this.started < 0){
        this.started = 0;
      } else return;
    }
    // Handle ending the wave.
    if (this.currentWave >= this.waves.length){
      return;
    }
    // Iterate through the pre-planned waves of ships.
    this.waves[this.currentWave].iterateThroughWave(deltaTime, this.enemies);
    if (this.waves[this.currentWave].finished){
      this.currentWave += 1;
    }
  }
  
  update(deltaTime, keys, keysPressed){
    if (this.died) return;
    if (keysPressed[pause]){
      this.paused = !this.paused;
    }
    if (this.paused) return;
    this.addToWave(deltaTime);
    if (this.finished){
      this.postWave(deltaTime);
    }
    // The progress is based off of how much of the wave is done.
    let progress = 0.95*this.currentWave/this.waves.length;
    if (this.finished || (this.enemies.length == 0 && this.currentWave >= this.waves.length)){
      progress = 1;
    }
    if (this.layer == 7){
      if ((this.waves.length > 0 && this.waves[0].transitionTime < 1.5) 
          || (this.enemies.length > 0 && !this.enemies[0].isShip)){
        progress = 1;
      } else if (this.enemies.length > 0) {
        progress = 0.95-0.95*(this.enemies[0].hp/this.enemies[0].maxHP);
      }
    }
    this.layerProg.update(deltaTime, progress, this.layer);
    if (this.layerProg.moveToNextLayer >= 1.5){
      this.finished = true;
    }
    let toAdd = [];
    // Update the player
    this.player.update(deltaTime, keys, keysPressed, this.player);
    if (this.player.addToBullets.length > 0){
      this.bullets = this.bullets.concat(this.player.addToBullets);
      this.player.addToBullets = [];
    }
    // Update the player's bullets.
    for (let i = 0; i < this.bullets.length; i++){
      this.bullets[i].update(deltaTime, keys, keysPressed, this.player);
    }
    // Update the enemies and their bullets.
    for (let i = 0; i < this.enemies.length; i++){
      this.enemies[i].update(deltaTime, keys, keysPressed, this.player);
    }
    // Do collisions with bullets.
    // First, let's do collisions with bullets and the player.
    for (let i = 0; i < this.enemies.length; i++){
      this.player.collideWithBullet(deltaTime, this.enemies[i]);
    }
    // Now, let's do collisions with the bullets and the enemies!
    for (let i = 0; i < this.enemies.length; i++){
      let enemy = this.enemies[i];
      if (!enemy.collCheck) continue;
      for (let j = 0; j < this.bullets.length; j++){
        enemy.collideWithBullet(deltaTime, this.bullets[j]);
      }
    }
    // Finally, finish updating the current scene!
    this.player.finishUpdate(deltaTime, this.wid, this.hei);
    if (this.player.grazeCounter == 0){
      this.score += Math.floor(this.layer*this.player.graze);
      this.player.graze = 0;
    }
    for (let i = 0; i < this.bullets.length; i++){
      this.bullets[i].finishUpdate(deltaTime, this.wid, this.hei);
      if (this.bullets[i].remove){
        this.bullets.splice(i, 1);
        i -= 1;
      }
    }
    // Finish updating the enemies and their bullets.
    for (let i = 0; i < this.enemies.length; i++){
      this.enemies[i].finishUpdate(deltaTime, this.wid, this.hei);
      // Add bullets if necessary.
      if (this.enemies[i].addToBullets.length > 0){
        toAdd = toAdd.concat(this.enemies[i].addToBullets);
        this.enemies[i].addToBullets = [];
      }
      // Remove from the list if need be.
      if (this.enemies[i].remove){
        if (this.enemies[i].hp <= 0) this.score += this.layer*this.enemies[i].score;
        this.enemies.splice(i, 1);
        i -= 1;
      }
    }
    this.enemies = this.enemies.concat(toAdd);
  }

  resetDraw(){
    this.hasDrawn = false;
  }
  
  draw(){
    this.img.background(150);
    if (!this.player.remove){
      this.player.draw(this.img);
    }
    for (let i = 0; i < this.bullets.length; i++){
      this.bullets[i].draw(this.img);
    }
    for (let i = 0; i < this.enemies.length; i++){
      this.enemies[i].draw(this.img);
    }
    this.graphics.background(100);
    this.graphics.noStroke();
    this.layerProg.drawBackdrop(this.graphics);
    this.graphics.image(this.img, 20, 20);
    this.graphics.fill(255, 255, 255);
    // Load the Text on the Side of the Screen
    this.graphics.textAlign(LEFT, TOP);
    this.graphics.fill(0);
    this.graphics.textFont(roboto);
    this.graphics.textSize(24);
    this.graphics.text(`Layer ${this.layer}`, 320, 100);
    this.graphics.text(`Graze: ${Math.floor(this.layer*this.player.graze)}`, 320, 140);
    if (this.canDie){
      this.graphics.text(`Player HP: ${this.player.hp}`, 320, 180);
    } else {
      this.graphics.text(`Times Hit: ${-this.player.hp}`, 320, 180);
    }
    this.graphics.text(`L${this.layer} Score: ${this.score}`, 320, 220);
    if (this.died){
      this.drawDead();
    }
  }

  drawDead(){
    this.graphics.fill(255, 0, 0, 100);
    this.graphics.rect(0, 0, 640, 480);
    this.graphics.fill(255);
    this.graphics.textFont(roboto);
    this.graphics.textSize(64);
    this.graphics.textAlign(CENTER, CENTER);
    this.graphics.text("OH NO!", 320, 40);
    this.graphics.textSize(48);
    this.graphics.text(`Layer ${this.layer} has fallen. :(`, 320, 150);
    this.graphics.textSize(32);
    this.graphics.text("Press Enter to Start the Layer Again!", 320, 400);
  }

  drawFull(scenes, layer, recursed){
    if (recursed > 3){
      stroke(0);
      strokeWeight(8*pow(0.25, recursed+1));
      fill(150);
      rect(-300, -220, 240, 440);
      return;
    }
    if (recursed > 0){
      stroke(0);
      strokeWeight(8*pow(0.25, recursed+1));
      noFill();
      rect(-320, -240, 640, 480);
    } else noStroke();
    if (!this.hasDrawn){
      this.hasDrawn = true;
      this.draw();
    }
    image(this.graphics, -320, -240);
    // Previous Bit
    if (layer > 0){
      fill(0);
      textAlign(LEFT, TOP);
      textFont(roboto);
      textSize(16);
      text("Prev: (Z)", -40, 50);
      push();
      translate(40, 140);
      scale(0.25);
      scenes[layer-1].drawFull(scenes, layer-1, recursed+1);
      pop();
    }
    // Next Bit
    if (layer < scenes.length-1){
      fill(0);
      textAlign(LEFT, TOP);
      textFont(roboto);
      textSize(16);
      text("Next: (X)", 140, 50);
      push();
      translate(220, 140);
      scale(0.25);
      scenes[layer+1].drawFull(scenes, layer+1, recursed+1);
      pop();
    }
    // Draw the next layer transition
    this.layerProg.drawNextLayer();
    // Pause Screen
    if (this.paused){
      fill(255, 255, 255, 100);
      rect(-320, -240, 640, 480);
      fill(0, 200);
      textAlign(CENTER, CENTER);
      textSize(64);
      textFont(roboto);
      text(`LAYER ${this.layer} PAUSED`, 0, 0);
    }
  }

  postWave(deltaTime){
    if (this.afterWave != undefined && !this.afterWave.finished){
      this.afterWave.iterateThroughWave(deltaTime, this.enemies);
      return;
    } 
    if (this.layer < 3){
      // Layer 1 and 2's Post Wave just has random Enemy Type Ones.
      let amountOfEs = 3*Math.random()+(this.layer == 2 ? 2*Math.random() : 0);
      let wave = [];
      for (let i = 0; i < amountOfEs; i++){
        wave.push(new EnemyTypeOneSlow(208*Math.random(), 50+100*Math.random(), 20+20*Math.random(), 2, 0.2));
      }
      this.afterWave = new Wave(wave, amountOfEs);
    } else if (this.layer < 5){
      let amountOfEs = 3*Math.random()+(this.layer == 4 ? 2*Math.random() : 0);
      let wave = [];
      let enemy2Chance = this.layer == 4 ? 0.2 : 0.1;
      for (let i = 0; i < amountOfEs; i++){
        if (Math.random() > enemy2Chance){
          wave.push(new EnemyTypeOneSlow(208*Math.random(), 50+100*Math.random(), 20+20*Math.random(), 2, 0.2));
        } else {
          wave.push(new EnemyTypeTwoSlow(50+175*Math.random(), 0.2));
        }
      }
      this.afterWave = new Wave(wave, amountOfEs);
    } else if (this.layer < 7) {
      let amountOfEs = 3*Math.random()+(this.layer == 6 ? 2*Math.random() : 0);
      let wave = [];
      let enemy2Chance = this.layer == 6 ? 0.2 : 0.1;
      let enemy3Chance = this.layer == 6 ? 0.2 : 0.1;
      for (let i = 0; i < amountOfEs; i++){
        if (Math.random() > enemy2Chance){
          wave.push(new EnemyTypeOneSlow(208*Math.random(), 50+100*Math.random(), 20+20*Math.random(), 2, 0.2));
        } else if (Math.random() > enemy3Chance+enemy2Chance){
          wave.push(new EnemyTypeThree(208*Math.random(), 25+50*Math.random(), 360+40*Math.random(), 10));
        } else {
          wave.push(new EnemyTypeTwoSlow(50+175*Math.random(), 0.2));
        }
      }
      this.afterWave = new Wave(wave, amountOfEs);
    }
  }
}

class LayerProgress {
  constructor(){
    this.progress = 0;
    this.progressRate = 0.5;
    this.moveToNextLayer = 0;
    this.layer = 0;
  }

  update(deltaTime, curProgress, layer){
    if (curProgress > this.progress){
      this.progress += this.progressRate*deltaTime;
    }
    if (this.progress > curProgress) this.progress = curProgress;
    if (layer < 7 && this.progress >= 1){
      this.moveToNextLayer += deltaTime;
      if (this.moveToNextLayer > 2){
        this.moveToNextLayer = 2;
      }
    } else if (this.progress >= 1){
      this.moveToNextLayer = 1.5;
    }
    this.layer = layer;
  }

  drawBackdrop(graphics){
    graphics.fill(50);
    graphics.rect(10, 10, 260, 460);
    let fillUp = 460*this.progress;
    let g = this.progress > 0.5 ? 255*2*(1-this.progress) : 255;
    let r = this.progress > 0.5 ? 255 : 255*4*(this.progress-0.25);
    graphics.fill(r, g, 0);
    graphics.rect(10, 10+460-fillUp, 260, fillUp);
  }

  drawNextLayer(){
    if (this.layer == 7) return;
    noStroke();
    let mtnl = this.moveToNextLayer;
    let createNext = mtnl > 1.3;
    let afterCreate = mtnl > 1.5;
    let gb = afterCreate ? 255 : (createNext ? 255*(mtnl-1.3)/0.2 : 0);
    let a = 255*(mtnl > 0.25 && mtnl < 1.5 ? 1 : (mtnl < 0.25 ? (mtnl-0.25)*4 : (2-mtnl)*2));
    if (mtnl >= 1.5) console.log(mtnl);
    fill(255, gb, gb, a);
    // Find the dimensions of the rectangle.
    // Get the start and end positions.
    let x = mtnl < 0.25 ? -310 : 140;
    let y = mtnl < 0.25 ? -230 : 40;
    let w = mtnl < 0.25 ? 260 : 160;
    let h = mtnl < 0.25 ? 460 : 160;
    // Interpolate linearly
    if (mtnl > 0.25 && mtnl < 1.5){
      let pos = (mtnl-0.25)/(1.5-0.25);
      x = 140*pos-310*(1-pos);
      y = 40*pos-230*(1-pos);
      w = 160*pos+260*(1-pos);
      h = 160*pos+460*(1-pos);
    }
    rect(x, y, w, h);
  }
}
