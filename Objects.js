class Instance {
  constructor(X, Y, W, H){
    this.x = X;
    this.y = Y;
    this.w = W;
    this.h = H;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.dX = 0;
    this.dY = 0;
    this.remove = false;
    this.isRectangle = true;
    this.addToBullets = [];
    this.hitboxes = [[0,0,W,H]];
    this.collCheck = true;
    this.score = 0;
    this.isShip = false;
    this.sprite = undefined;
    this.spriteX = 0;
    this.spriteY = 0;
    this.spriteScale = 1;
  }
  
  update(deltaTime, keys, keysPressed, player){
  }
  
  finishUpdate(deltaTime, wid, hei){
    this.x += this.dX*deltaTime;
    this.y += this.dY*deltaTime;
  }
  
  draw(img){
    if (this.sprite != undefined){
      let sX = this.spriteSize*this.w*this.spriteScale;
      let sY = this.spriteSize*this.h*this.spriteScale;
      image(this.sprite, this.x, this.y, this.w, this.h, sX, sY, this.w, this.h);
      return;
    }
    img.fill(this.r, this.g, this.b);
    if (this.isRectangle)
      img.rect(this.x, this.y, this.w, this.h);
    else
      img.ellipse(this.x+this.w/2, this.y+this.h/2, this.w, this.h);
  }

  collideWithBullet(deltaTime, bullet){
    for (let i = 0; i < this.hitboxes.length; i++){
      let hitbox = this.hitboxes[i];
      if (bullet.isRectangle){
        // Just some simple bounds checking here!
        let curX = this.x+this.dX*deltaTime+hitbox[0];
        let curY = this.y+this.dY*deltaTime+hitbox[1];
        let oX = bullet.x+bullet.dX*deltaTime;
        let oY = bullet.y+bullet.dY*deltaTime;
        if (curX < oX+bullet.w && curX+hitbox[2] > oX 
            && curY < oY+bullet.h && curY+hitbox[3] > oY){
          this.hitboxCollision(hitbox, i, bullet);
        }
      } else {
        // This only works as the player's hitbox is the only thing being checked.
        // As well as this, they're small, so the corners not being checked aren't a big deal.
        let centerX = hitbox[0]+hitbox[2]/2+this.x+this.dX*deltaTime;
        let centerY = hitbox[1]+hitbox[3]/2+this.y+this.dY*deltaTime;
        // Only the player has to worry about this, so the radius can just be the width;
        // The player's hitboxes are all squares, so w=h.
        let radius = hitbox[2]/2;
        let oCenterX = bullet.x+bullet.w/2+bullet.dX*deltaTime;
        let oCenterY = bullet.y+bullet.h/2+bullet.dY*deltaTime;
        let oRadius = bullet.w/2;
        // Bullets are either rectangles or circles; No ellispes here.
        // As such, I can just do distance checking.
        let dist = Math.sqrt(Math.pow(centerX-oCenterX, 2)+Math.pow(centerY-oCenterY, 2));
        if (dist < radius+oRadius){
          this.hitboxCollision(hitbox, i, bullet);
        }
      }
    }
  }

  hitboxCollision(hitbox, hitboxID, other){
  }
}

class Player extends Instance {
  constructor(X, Y, CanDie){
    super(X-16, Y-16, 32, 32);
    this.hitboxes.push([15, 15, 2, 2]);
    this.hp = CanDie ? 15 : 0;
    this.maxInvinicbleTime = 3;
    this.invincibleTime = 0;
    this.graze = 0;
    this.grazeCount = 0;
    this.grazeCounter = 0;
    this.maxGrazeCounter = 2;
    this.shootCounter = 0.05;
    this.maxShootCounter = 0.05;
    this.canDie = CanDie;
  }
  
  update(deltaTime, keys, keysPressed, player){
    // Horizontal Movement
    if (keys[left] && !keys[right]){
      this.dX = -200;
    } else if (keys[right] && !keys[left]){
      this.dX = 200;
    } else {
      this.dX = 0;
    }
    // Vertical Movement
    if (keys[up] && !keys[down]){
      this.dY = -200;
    } else if (keys[down] && !keys[up]){
      this.dY = 200;
    } else {
      this.dY = 0;
    }
    // Shooting at a constant interval (or faster if you can mash the space button at inhuman speeds)
    if (this.shootCounter < this.maxShootCounter){
      this.shootCounter += deltaTime;
    }
    if (keysPressed[shoot] || (keys[shoot] && this.shootCounter >= this.maxShootCounter)){
      this.addToBullets.push(new Bullet(this.x+this.w/2, this.y, 4, 8, 0, -600, 255, 255, 255, true));
      this.shootCounter = 0;
    }
    // Handle invinicibility here.
    if (this.invincibleTime > 0){
      this.invincibleTime -= deltaTime;
      if (this.invincibleTime < 0){
        this.invincibleTime = 0;
      }
    }
    if (this.grazeCounter > 0){
      this.grazeCounter -= deltaTime;
      if (this.grazeCounter < 0) this.grazeCounter = 0;
    }
  }
  
  finishUpdate(deltaTime, wid, hei){
    super.finishUpdate(deltaTime, wid, hei);
    if (this.grazeCount > 0){
      this.graze += 100*deltaTime;
      this.grazeCounter = this.maxGrazeCounter;
    }
    this.grazeCount = 0;
    if (this.x < 0){ this.x = 0; }
    if (this.x > wid-this.w){ this.x = wid-this.w; }
    if (this.y < 0){ this.y = 0; }
    if (this.y > hei-this.h){ this.y = hei-this.h; }
  }
  
  draw(img){
    let nonInv = 1-(this.invincibleTime/this.maxInvinicbleTime);
    img.noStroke();
    img.fill(255, 100+155*nonInv, 100+155*nonInv, 100+155*nonInv);
    img.rect(this.x, this.y, this.w, this.h);
    if (this.invincibleTime == 0){
      img.fill(0);
    } else {
      img.fill(50, 100+155*nonInv);
    }
    img.rect(this.x+15, this.y+15, 2, 2);
  }

  hitboxCollision(hitbox, hitboxID, other){
    if (this.invincibleTime > 0) return;
    if (hitboxID == 0){
      this.grazeCount += 1;
    } else if (hitboxID == 1){
      this.hp -= 1;
      this.graze = 0;
      // Kill the player if HP = 0 and they can die.
      if (this.hp <= 0 && this.canDie){
        this.remove = true;
      }
      this.invincibleTime = this.maxInvinicbleTime;
    }
  }
}

class Bullet extends Instance {
  constructor(X, Y, W, H, DX, DY, R, G, B, rect=false){
    super(X-W/2, Y-H/2, W, H);
    this.dX = DX;
    this.dY = DY;
    this.r = R;
    this.g = G;
    this.b = B;
    this.isRectangle = rect || W != H;
    this.collCheck = false;
  }
  
  finishUpdate(deltaTime, wid, hei){
    super.finishUpdate(deltaTime, wid, hei);
    if (this.x+this.w < 0 || this.x > wid ||
        this.y+this.h < 0 || this.y > hei){
      this.remove = true;
    }
  }
}

class Boomerang extends Bullet {
  constructor(X, Y, DX=0, YMax=416){
    super(X, Y, 24, 8, 0, 0, 75, 255, 75, true);
    this.downTime = 1;
    this.startY = Y;
    this.curTime = 0;
    this.upTime = 1.5;
    this.ymax = YMax;
    this.dX = DX;
  }

  update(deltaTime, keys, keysPressed, player){
    this.curTime += deltaTime;
    if (this.curTime < this.downTime){
      let prog = Math.sin(Math.PI/2*this.curTime/this.downTime);
      this.y = this.startY*(1-prog)+this.ymax*prog;
    } else if (this.curTime < this.downTime+this.upTime){
      let prog = Math.sin(Math.PI/2*(1-(this.curTime-this.downTime)/this.upTime));
      this.y = -24*(1-prog)+this.ymax*prog;
    } else {
      this.remove = true;
    }
  }
}
