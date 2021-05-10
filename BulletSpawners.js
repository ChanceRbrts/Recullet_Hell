class Enemy extends Instance {
  constructor(X, Y, W, H, HP){
    super(X, Y, W, H);
    this.hp = HP;
    this.collCheck = true;
    this.score = 1000;
    this.isShip = true;
    this.beenHit = false;
    this.sAngle = 0;
  }

  update(deltaTime, keys, keysPressed, player){
    this.beenHit = false;
  }

  hitboxCollision(hitbox, hitboxID, other){
    other.remove = true;
    this.hp -= 1;
    this.beenHit = true;
    if (this.hp <= 0){
      this.beenHit = false;
      this.zeroHP();
    }
  }

  zeroHP(){
    this.remove = true;
  }

  draw(img){
    if (this.sprite != undefined){
      let sX = this.spriteSize*this.w*this.spriteScale;
      let sY = this.spriteSize*this.h*this.spriteScale;
      // img.fill(255);
      // TODO: Get the sprite to display a hit animation when hit.
      img.push();
      img.shader(enemyShader);
      enemyShader.setUniform("isHit", this.beenHit);
      enemyShader.setUniform("uSampler", this.sprite);
      img.translate(this.x+this.w/2, this.y+this.h/2);
      img.rotate(this.sAngle);
      img.rect(-this.w/2, -this.h/2, this.w, this.h);
      img.resetShader();
      img.pop();
      return;
    }
    let r = this.r+(this.beenHit?100:0);
    let g = this.g+(this.beenHit?100:0);
    let b = this.b+(this.beenHit?100:0);
    img.fill(r, g, b);
    if (this.isRectangle)
      img.rect(this.x, this.y, this.w, this.h);
    else
      img.ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h);
  }
}

class EnemyTypeOne extends Enemy {
  constructor(X, Y, MoveX=0, MoveTime=2, Speed=200){
    super(X < 104 ? 0 : 208, -50, 32, 32, 20);
    this.maxInterval = 2;
    this.interval = this.maxInterval;
    this.r = 127;
    this.g = 0;
    this.b = 127;
    this.startX = X < 104 ? 0 : 208;
    this.finishX = X < 104 ? 208 : 0;
    this.startY = -50;
    this.goalX = X;
    this.goalY = Y;
    this.phase = 0;
    this.bulletLimit = 6;
    this.movex = MoveX;
    this.movetime = MoveTime;
    this.movecurTime = 0;
    this.movemult = 0;
    this.speed = Speed;
    this.sprite = loadImage("assets/sprites/EnemyTypeOne_Awake.png");
  }
  
  update(deltaTime, keys, keysPressed, player){
    super.update(deltaTime, keys, keysPressed, player);
    this.startUpdate(deltaTime);
    let prevX = this.x;
    let prevY = this.y;
    if (this.phase < 1){
      let xAngle = Math.cos(Math.PI/2*this.phase);
      let yAngle = Math.sin(Math.PI/2*this.phase);
      this.x = xAngle*this.startX+(1-xAngle)*this.goalX;
      this.y = (1-yAngle)*this.startY+yAngle*this.goalY;
      let dX = (this.x-prevX);
      let dY = (this.y-prevY);
      let pAngle = ((Math.atan2(dY, dX)+Math.PI*5/2)%(2*Math.PI))-Math.PI;
      this.sAngle = pAngle*(1-this.phase);
      this.phase += deltaTime/0.75;
      if (this.phase > 1) this.phase = 1;
    } else if (this.phase == 1){
      this.phaseOneMovement(deltaTime);
      this.phaseOneBulletPattern(deltaTime);
    } else if (this.phase >= 2){
      let xAngle = Math.cos(Math.PI/2*(3-this.phase));
      let yAngle = Math.sin(Math.PI/2*(3-this.phase));
      this.x = xAngle*this.finishX+(1-xAngle)*this.goalX;
      this.y = (1-yAngle)*this.startY+yAngle*this.goalY;
      let dX = (this.x-prevX);
      let dY = (this.y-prevY);
      let pAngle = (Math.atan2(dY, dX)+Math.PI*5/2)%(2*Math.PI)-Math.PI;
      this.sAngle = pAngle*Math.min(1, 2*(this.phase-2));
      this.phase += deltaTime/0.75;
      if (this.phase > 3) this.remove = true;
    }
  }

  startUpdate(deltaTime){}

  phaseOneMovement(deltaTime){
    this.sAngle = 0;
    if (this.movex == 0) return;
    let bLimit = this.bulletLimit > 0 ? this.bulletLimit : 1;
    this.movemult += deltaTime/(this.maxInterval*bLimit);
    this.movecurTime = (this.movecurTime+deltaTime)%this.movetime;
    this.x += this.movemult*this.movex*Math.cos(Math.PI*2*this.movecurTime/this.movetime)*deltaTime;
    this.goalX = this.x;
  }

  phaseOneBulletPattern(deltaTime){
    this.interval -= deltaTime;
    if (this.interval < 0){
      this.interval = this.maxInterval;
      if (this.bulletLimit <= 0){
        this.phase = 2;
        return;
      }
      let bSX = this.x+this.w/2;
      let bSY = this.y+this.h;
      for (let i = -1; i < 2; i++){
        let angle = Math.PI/8*i;
        let bDY = Math.cos(angle)*this.speed;
        let bDX = Math.sin(angle)*this.speed;
        this.addToBullets.push(new Bullet(bSX, bSY, 8, 8, bDX, bDY, 255, 0, 255, false));
      }
      this.bulletLimit -= 1;
      if (this.bulletLimit == 0) this.interval /= 2;
    }
  }

  zeroHP(){
    super.zeroHP();
    for (let i = 0; i < 8; i++){
      let bSX = this.x+this.w/2;
      let bSY = this.y+this.h/2;
      let angle = Math.PI/4*i+(Math.PI/8*Math.random()-Math.PI/16);
      let bDY = Math.cos(angle)*500;
      let bDX = Math.sin(angle)*500;
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX, bDY, 255, 150, 0, false));
    }
  }
}

class EnemyTypeOneSlow extends EnemyTypeOne {
  constructor(X, Y, MoveX=0, MoveTime=2, RateTime){
    super(X, Y, MoveX, MoveTime, 200*RateTime);
    this.maxInterval = 1.5/RateTime;
    this.score = 0;
    this.hp = 10000;
    this.interval = this.maxInterval;
    this.sprite = loadImage("assets/sprites/EnemyTypeOne_Asleep.png");
  }
}

class EnemyTypeTwo extends EnemyTypeOne {
  constructor(Y, RateTime=1){
    super(104, Y);
    this.maxInterval = 0.1;
    this.interval = this.maxInterval;
    this.fullTime = 20;
    this.curTime = 0;
    this.movement = 0;
    this.angle = 0;
    this.centerY = Y;
    this.r = 10;
    this.g = 50;
    this.b = 150;
    this.score = 1500;
    this.rate = RateTime;
    this.sprite = loadImage("assets/sprites/EnemyTypeTwo_Back.png");
    this.fSprite = loadImage("assets/sprites/EnemyTypeTwo_Awake.png");
    this.fAngle = 0;
    this.fireTimes = [0, 0, 0, 0];
    this.nextBit = 0;
    this.lastFT = 0;
  }

  startUpdate(deltaTime){
    if (this.phase >= 2) this.nextBit = -1;
    for (let i = 0; i < this.fireTimes.length; i++){
      if (this.nextBit != i){
        this.fireTimes[i] -= deltaTime*2;
        if (this.fireTimes[i] < 0) this.fireTimes[i] = 0;
      }
    }
  }

  phaseOneMovement(deltaTime){
    this.movement += deltaTime*this.rate;
    this.x = 104+104*Math.sin(this.movement*2*Math.PI/5);
    this.y = this.centerY-16*Math.sin(this.movement*2*Math.PI/8);
    this.goalX = this.x;
    this.goalY = this.y;
  }

  phaseOneBulletPattern(deltaTime){
    this.interval -= deltaTime*Math.pow(this.rate, 1.5);
    this.fAngle += deltaTime*Math.PI/4;
    let fTime = this.interval/this.maxInterval;
    if (fTime < 0) fTime = 0;
    this.fireTimes[this.nextBit] = this.lastFT*fTime+(1-fTime);
    while (this.interval <= 0){
      let bCX = this.x+this.w/2;
      let bCY = this.y+this.h/2;
      let bDX = Math.sin(this.angle)*100*this.rate;
      let bDY = Math.cos(this.angle)*100*this.rate;
      let r = 200+50*Math.random();
      let g = 75+25*Math.random();
      let b = 30+15*Math.random();
      this.addToBullets.push(new Bullet(bCX, bCY, 8, 8, bDX, bDY, r, g, b, false));
      this.curTime += this.maxInterval;
      this.prevAngle = this.fAngle;
      this.angle = (Math.PI*3.5*(this.curTime+2*Math.sin(this.curTime*Math.PI/8)))%(Math.PI*2);
      if (this.angle < 0) this.angle = 2*Math.PI-this.angle;
      // Get the new fAngle...
      // First, get the relative angle that the next bullet will come from.
      let defAngle = (this.angle-(this.fAngle+this.maxInterval*Math.PI/4))%(2*Math.PI);
      if (defAngle < 0) defAngle = 2*Math.PI-defAngle;
      // Then, determine which head will glow (be responsible for that bullet)
      this.nextBit = (Math.round(defAngle*2/Math.PI))%4;
      this.lastFT = this.fireTimes[this.nextBit];
      if (this.curTime >= this.fullTime) this.phase = 2;
      this.interval += this.maxInterval;
    }
  }

  draw(img){
    let sX = this.spriteSize*this.w*this.spriteScale;
    let sY = this.spriteSize*this.h*this.spriteScale;
    // TODO: Get the sprite to display a hit animation when hit.
    img.push();
    img.translate(this.x+this.w/2, this.y+this.h/2);
    img.shader(enemyShader);
    enemyShader.setUniform("isHit", this.beenHit);
    enemyShader.setUniform("uSampler", this.sprite);
    img.rect(-this.w/2, -this.h/2, this.w, this.h);
    // Rotate this a bit.
    let fAngle = this.fAngle;
    if (this.phase < 1){
      fAngle += 4*Math.PI*(1-Math.sin(Math.PI/2*this.phase));
    } else if (this.phase > 2){
      console.log(Math.sin(Math.PI/2*(this.phase-2)));
      fAngle -= 3*Math.PI*(1-Math.cos(Math.PI/2*(this.phase-2)));
    }
    img.rotate(fAngle);
    img.shader(enemyShader2);
    enemyShader2.setUniform("isHit", this.beenHit);
    enemyShader2.setUniform("uSampler", this.fSprite);
    enemyShader2.setUniform("rCharge", this.fireTimes);
    img.rect(-this.w/2, -this.h/2, this.w, this.h);
    img.pop();
  }
}

class EnemyTypeTwoSlow extends EnemyTypeTwo {
  constructor(Y, Rate){
    super(Y, Rate);
    this.hp = 10000;
    this.score = 0;
    this.fSprite = loadImage("assets/sprites/EnemyTypeTwo_Asleep.png");
  }
}

class EnemyTypeThree extends Enemy {
  constructor(X, Y, YS, spd){
    super(X, 440, 32, 32, 5);
    this.startX = X;
    this.score = 2000;
    this.phase = 0;
    this.topY = Y;
    this.bottomY = YS;
    this.startY = this.y-this.bottomY;
    this.speed = spd;
    this.yPos = 0;
    this.boxTimes = 0;
    this.maxBoxTimes = 4;
    this.boxPos = 0;
    this.r = 200;
    this.g = 100;
    this.b = 50;
  }

  update(deltaTime, keys, keysPressed, player){
    super.update(deltaTime, keys, keysPressed, player);
    if (this.phase < 1){
      this.phase += deltaTime;
      if (this.phase >= 1) this.phase = 1;
      this.y = this.bottomY+this.startY-this.startY*Math.sin(this.phase*Math.PI/2);
      return;
    } else if (this.phase >= 2){
      this.phase += deltaTime;
      if (this.phase >= 3) this.remove = true;
      this.y = this.bottomY+this.startY*Math.sin((this.phase-2)*Math.PI/2);
      this.x = this.startX*(1-Math.cos((this.phase-2)*Math.PI/2));
      return;
    }
    this.y = this.topY*this.yPos+this.bottomY*(1-this.yPos);
    let pastX = this.x+this.w/2;
    let bulletPointsBottom = [48, 96, 144, 192];
    let bulletPointsTop = [72, 120, 168];
    let speed = this.speed <= 10 ? 10 : 500
    if (this.boxPos == 0){
      // Bottom of the Screen
      this.x += this.speed*deltaTime*(this.boxTimes/(this.maxBoxTimes-1)+1);
      if (this.x > 208){
        this.x = 208;
        this.boxPos = 1;
      }
      let cX = this.x+this.w/2;
      for (let i = 0; i < bulletPointsBottom.length; i++){
        if (cX > bulletPointsBottom[i] && pastX <= bulletPointsBottom[i]){
          this.addToBullets.push(new Bullet(bulletPointsBottom[i], this.bottomY, 16, 16, 0, -speed, 155, 255, 100, false));
        }
      }
    } else if (this.boxPos == 1){
      // Moving up the screen.
      this.yPos += deltaTime*(this.boxTimes/(this.maxBoxTimes-1)+1)/0.6;
      if (this.yPos > 1){ 
        this.yPos = 1;
        this.boxPos = 2;
      }
    } else if (this.boxPos == 2){
      // Top of the screen.
      this.x -= this.speed*deltaTime*(this.boxTimes/(this.maxBoxTimes-1)+1);
      if (this.x < 0){
        this.x = 0;
        this.boxPos = 3;
      }
      let cX = this.x+this.w/2;
      for (let i = 0; i < bulletPointsTop.length; i++){
        if (cX < bulletPointsTop[i] && pastX >= bulletPointsTop[i]){
          this.addToBullets.push(new Bullet(bulletPointsTop[i], this.topY+32, 16, 16, 0, speed, 155, 255, 100, false));
        }
      }
    } else if (this.boxPos == 3){
      // Moving back to the bottom.
      this.yPos -= deltaTime*(this.boxTimes/(this.maxBoxTimes-1)+1)/0.6;
      if (this.yPos < 0){ 
        this.yPos = 0;
        this.boxPos = 0;
        this.boxTimes += 1;
        if (this.boxTimes == this.maxBoxTimes){
          this.phase = 2;
        }
      }
    }
  }

  zeroHP(){
    super.zeroHP();
    for (let i = 0; i < 12; i++){
      let bSX = this.x+this.w/2;
      let bSY = this.y+this.h/2;
      let angle = Math.PI/3*i;
      let bDY = Math.sin(angle);
      let bDX = Math.cos(angle);
      let bDY2 = Math.sin(angle+Math.PI/6);
      let bDX2 = Math.cos(angle+Math.PI/6);
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX*250, bDY*250, 150, 255, 0, false));
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX2*150, bDY2*150, 150, 255, 0, false));
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX*100, bDY*100, 150, 255, 0, false));
    }
  }
}

class EnemyTypeOneThree extends EnemyTypeOne {
  constructor(X, Y, MoveX=0, MoveTime=2){
    super(X, Y, MoveX, MoveTime);
  }

  finishUpdate(deltaTime, wid, hei){
    super.finishUpdate(deltaTime, wid, hei);
    if (this.remove){
      this.addToBullets.push(new EnemyTypeThree(104, 50+50*Math.random(), 350+50*Math.random(), 200));
    }
  }
}

class EnemyTypeFour extends EnemyTypeOne {
  constructor(X, Y, layer){
    super(X, Y, 15, 3);
    this.mTA = 60+5*(layer-3);
    this.timeAlive = this.mTA;
    this.maxHP = 200+25*(layer-3);
    this.hp = this.maxHP;
    this.enemyOne = undefined;
    this.enemyTwo = undefined;
    this.maxInterval = 0.3;
    this.interval = this.maxInterval;
    this.angleOffset = 0;
    this.period = 1.5;
    this.curPeriod = 0;
    this.lastPeriod = 0;
    this.center = 1.0;
    this.centerX = 0;
    this.firstTime = true;
    this.r = 100;
    this.g = 40;
    this.b = 140;
    this.layer = layer;
    this.score = 5000+1000*(layer-3);
  }

  phaseOneBulletPattern(deltaTime){
    let bCX = this.x+this.w/2;
    let bCY = this.y+this.h/2;
    if (this.hp <= this.maxHP/2 || this.timeAlive < this.mTA/2){
      if (this.enemyOne == undefined || this.enemyOne.remove){
        this.enemyOne = new EnemyTypeOne(70, this.y-32, 65);
        this.addToBullets.push(this.enemyOne);
      }
      if (this.enemyTwo == undefined || this.enemyTwo.remove){
        this.enemyTwo = new EnemyTypeOne(139, this.y-32, 65);
        this.addToBullets.push(this.enemyTwo);
      }
      let boomtimes = this.layer-Math.min(this.hp/this.maxHP, this.timeAlive/this.mTA)*this.layer*2;
      if (this.curPeriod > this.period/2 && this.lastPeriod <= this.period/2){
        for (let i = 0; i < boomtimes; i++){
          this.addToBullets.push(new Boomerang(bCX, bCY, -20-60*Math.random(), 300+130*Math.random()));
        }
      } else if (this.curPeriod > this.period*3/2 && this.lastPeriod <= this.period*3/2){
        for (let i = 0; i < boomtimes; i++){
          this.addToBullets.push(new Boomerang(bCX, bCY, 20+60*Math.random(), 300+130*Math.random()));
        }
      }
      if (this.layer >= 5 && (
          this.curPeriod < this.period/16 || this.curPeriod > this.period*31/16 || 
          (this.curPeriod > this.period*15/16 && this.curPeriod < this.period*17/16))){
        if (Math.floor(this.lastPeriod*32) != Math.floor(this.curPeriod*32)){
          let tX = 300*Math.sin(Math.PI*this.curPeriod/this.period);
          let tY = Math.abs(300*Math.cos(Math.PI*this.curPeriod/this.period));
          this.addToBullets.push(new Bullet(bCX, bCY, 8, 8, tX, tY, 0, 255, 0, false));
        }
      }
    } else {
      this.interval -= deltaTime;
      if (this.interval < 0){
        this.interval = this.maxInterval;
        for (let i = 0; i < 6*(this.layer-2); i++){
          let angle = Math.PI/3*i;
          let randVel = 200+(this.layer-2)*(50*Math.random()-25);
          let randAngle = angle+Math.PI*(this.layer-2)/32*Math.random()
          let bDY = randVel*Math.sin(randAngle+this.angleOffset);
          let bDX = randVel*Math.cos(randAngle+this.angleOffset);
          let r = 75+25*Math.random();
          let g = 50+15*Math.random();
          let b = 200+50*Math.random();
          this.addToBullets.push(new Bullet(bCX, bCY, 8, 8, bDX, bDY, r, g, b, false));
        }
        this.angleOffset += Math.PI*7/36;
      }
    }
    
  }

  phaseOneMovement(deltaTime){
    this.timeAlive -= deltaTime;
    if (this.timeAlive <= 0){
      this.phase = 2;
    }
    if (this.hp <= this.maxHP/2 || this.timeAlive < this.mTA/2){
      if (this.firstTime){
        this.centerX = this.x;
        this.firstTime = false;
      }
      if (this.center > 0){
        this.center -= deltaTime;
        if (this.center < 0){
          this.center = 0;
        }
        let a = Math.cos((1-this.center)*Math.PI/2);
        this.x = this.centerX*a+104*(1-a);
      } else {
        this.lastPeriod = this.curPeriod;
        this.curPeriod = (this.curPeriod+deltaTime)%(this.period*2);
        this.x = 104+72*Math.sin(Math.PI*this.curPeriod/this.period);
      }
    } else {
      this.bulletLimit = 6*Math.min(this.hp/this.maxHP, this.timeAlive/this.mTA);
      super.phaseOneMovement(deltaTime);
    }
  }
  zeroHP(){
    super.zeroHP();
    for (let i = 0; i < 16; i++){
      let bSX = this.x+this.w/2;
      let bSY = this.y+this.h/2;
      let angle = Math.PI/4*i;
      let bDY = Math.sin(angle+Math.PI/8*Math.random());
      let bDX = Math.cos(angle+Math.PI/8*Math.random());
      let bDY2 = Math.sin(angle+Math.PI/8+Math.PI/8*Math.random());
      let bDX2 = Math.cos(angle+Math.PI/8+Math.PI/8*Math.random());
      let v1 = 200+50*Math.random();
      let v2 = 125+25*Math.random();
      let v3 = 75+50*Math.random();
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX*v1, bDY*v1, 100, 10, 200, false));
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX2*v2, bDY2*v2, 100, 10, 200, false));
      this.addToBullets.push(new Bullet(bSX, bSY, 16, 16, bDX*v3, bDY*v3, 100, 10, 200, false));
    }
  }
}
