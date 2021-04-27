// This is a harder version of Enemy Type 4.
class FinalBoss extends Enemy{
    constructor(){
        super(88, -80, 64, 64, 880);
        this.phase = 0;
        this.downTime = 4;
        this.trueY = 80;
        this.bottomY = 360;
        this.maxHP = this.hp;
        this.r = 200;
        this.g = 60;
        this.b = 20;
        // this.maxInterval = 0.3;
        this.interval = 0.3;
        this.maxPOT = 40;
        this.phaseOneTime = this.maxPOT;
        this.maxPTT = 40;
        this.phaseTwoTime = this.maxPTT;
        this.angleOffset = 0;
        this.maxPTHT = 90;
        this.phaseThreeTime = this.maxPTHT;
        this.period = 1.5;
        this.curPeriod = 0;
        this.lastPeriod = 0;
        this.firstInPhase3 = true;
        this.phase3Bit = 0;
        this.bitTimers = [0.25, 1, 0.5, 1, 0.5];
        this.maxWalkTimer = 2;
        this.walkTimer = this.maxWalkTimer;
        this.destroyTimer = 5;
        this.bit0X = 0;
        this.onTop = true;
        this.timer = this.bit0Timer;
        this.lastY = 0;
        this.firstWalk = true;
        this.enemies = [undefined, undefined, undefined, undefined];
        this.score = 10000;
    }

    update(deltaTime, keys, keysPressed, player){
        super.update(deltaTime, keys, keysPressed, player);
        if (this.phase < 1) this.moveDown(deltaTime);
        else if (this.hp > this.maxHP*5/8 && this.phaseOneTime > 0) this.phaseOne(deltaTime);
        else if (this.hp > this.maxHP*2/8 && this.phaseTwoTime > 0) this.phaseTwo(deltaTime);
        else if (this.hp > 0 && this.phaseThreeTime > 0) this.phaseThree(deltaTime, player);
        else if (this.hp > 0) this.walkAway(deltaTime);
        else this.destroy(deltaTime);
    }

    moveDown(deltaTime){
        this.phase += deltaTime/this.downTime;
        if (this.phase > 1) this.phase = 1;
        this.y = (this.trueY+80)*this.phase-80;
    }

    phaseOne(deltaTime){
        this.phaseOneTime -= deltaTime;
        if (this.phaseOneTime < 0){
            this.hp = this.maxHP*5/8;
        }
        this.interval -= deltaTime;
        if (this.interval > 0) return;
        // Determines how far in the phase there was.
        let rBit = (this.hp-this.maxHP*5/8)*5/(this.maxHP*3/8);
        let tBit = this.phaseOneTime*5/this.maxPOT;
        let xBit = Math.min(rBit, tBit);
        this.interval = 0.05+0.05*xBit;
        let cX = this.x+this.w/2;
        let cY = this.y+this.h/2;
        // Slowly shoot more bullets.
        for (let i = 0; i < 6; i++){
            let angle = Math.PI/3*i;
            let randVel = 200+(5-xBit)*(40*Math.random()-20);
            let randAngle = angle+Math.PI*(5-xBit)/40*Math.random();
            let bDY = randVel*Math.sin(randAngle+this.angleOffset);
            let bDX = randVel*Math.cos(randAngle+this.angleOffset);
            let sz = 8+(16*(5-xBit)/5)*Math.random();
            let r = 100+25*Math.random();
            let g = 50+15*Math.random();
            let b = 200+50*Math.random();
            this.addToBullets.push(new Bullet(cX, cY, sz, sz, bDX, bDY, r, g, b, false));
        }
        this.angleOffset += Math.PI*7/36;
    }

    phaseTwo(deltaTime){
        this.phaseTwoTime -= deltaTime;
        if (this.phaseTwoTime < 0){
            this.hp = this.maxHP*1/4;
        }
        // Determine the current progress in this phase.
        let rBit = (this.hp-this.maxHP*2/8)/(this.maxHP*3/8);
        let tBit = this.phaseTwoTime/this.maxPTT;
        let xBit = Math.min(rBit, tBit);
        // Handle Enemies Here
        if (this.enemies[0] == undefined || this.enemies[0].remove){
            this.enemies[0] = new EnemyTypeTwo(this.y-48);
            this.addToBullets.push(this.enemies[0]);
        }
        if (xBit < 2/3){
            // More Enemies Are Added at the 2/3 mark...
            if (this.enemies[1] == undefined || this.enemies[1].remove){
                this.enemies[1] = new EnemyTypeOne(38, this.y+96);
                this.addToBullets.push(this.enemies[1]);
            }
            if (this.enemies[2] == undefined || this.enemies[2].remove){
                this.enemies[2] = new EnemyTypeOne(171, this.y+96);
                this.addToBullets.push(this.enemies[2]);
            }
        }
        if (xBit < 1/3){
            // And one more at the 1/3 mark!
            if (this.enemies[3] == undefined || this.enemies[3].remove){
                this.enemies[3] = new EnemyTypeTwo(this.y+70);
                this.addToBullets.push(this.enemies[3]);
            }
        }
        // The Final Boss will also be moving back and forth.
        this.lastPeriod = this.curPeriod;
        this.curPeriod = (this.curPeriod+deltaTime)%(this.period*2);
        this.x = 88+72*Math.sin(Math.PI*this.curPeriod/this.period);
        let cX = this.x+this.w/2;
        let cY = this.y+this.h/2;
        // The movement will also include boomerangs and bullets, of course.
        // The amount of boomerangs depends on the point in the phase.
        let boomAmount = 6*(1-xBit);
        if (this.curPeriod > this.period/2 && this.lastPeriod <= this.period/2){
            for (let i = 0; i < boomAmount; i++){
                this.addToBullets.push(new Boomerang(cX, cY, -20-60*Math.random(), 300+130*Math.random()));
            }
        } else if (this.curPeriod > this.period*3/2 && this.lastPeriod <= this.period*3/2){
            for (let i = 0; i < boomAmount; i++){
                this.addToBullets.push(new Boomerang(cX, cY, 20+60*Math.random(), 300+130*Math.random()));
            }
        }
        // Like it's counterpart, once the phase is about to end, more bullets will be added.
        if (xBit < 0.5 && (this.curPeriod < this.period/16 || this.curPeriod > this.period*31/16 || 
            (this.curPeriod > this.period*15/16 && this.curPeriod < this.period*17/16))){
            let bI = 16+32*(1-xBit);
            if (Math.floor(this.lastPeriod*bI) != Math.floor(this.curPeriod*bI)){
                let tX = 300*Math.sin(Math.PI*this.curPeriod/this.period);
                let tY = Math.abs(300*Math.cos(Math.PI*this.curPeriod/this.period));
                this.addToBullets.push(new Bullet(cX, cY, 8, 8, tX, tY, 0, 255, 0, false));
            }
        }
    }

    phaseThree(deltaTime, player){
        // First, send our friends off.
        if (this.firstInPhase3){
            this.firstInPhase3 = false;
            for (let i = 0; i < this.enemies.length; i++){
                if (this.enemies[i] == undefined || this.enemies[i].phase > 1) continue;
                this.enemies[i].phase = 2;
            }
            this.timer = this.bitTimers[0];
            this.bit0X = this.x;
        }
        this.phaseThreeTime -= deltaTime;
        if (this.phaseThreeTime < 0){
            this.phaseThreeTime = 0;
        }
        // Now, for hellish stuff.
        // First of all, how far are we in the phase?
        let rBit = (this.hp/(this.maxHP*2/8));
        let tBit = (this.phaseThreeTime/this.maxPTHT);
        let xBit = Math.min(rBit, tBit);
        // Now, this phase acts in bits.
        this.timer -= deltaTime;
        if (this.timer < 0){
            this.timer = 0;
        }
        if (this.phase3Bit == 0){
            this.x = this.bit0X*(1-Math.cos(Math.PI/2*(this.timer/this.bitTimers[0])));
            // Bit 0: Moving to the left of the screen.
        } else if (this.phase3Bit == 1){
            // Bit 1: Moving to the right of the screen, shooting bullets.
            let prevX = this.x+this.w/2;
            this.x = 88+88*Math.sin(Math.PI/2-Math.PI*(this.timer/this.bitTimers[1]));
            let cX = this.x+this.w/2;
            let cY = this.y+this.h/2;
            // Shoot bullets sparingly at first, getting more and more hectic as time goes on.
            let bAmount = Math.floor(4+16*(1-xBit));
            if (Math.floor(prevX*bAmount/240) != Math.floor(cX*bAmount/240)){
                let angle = Math.atan2(player.y+player.h/2-cY, player.x+player.w/2-cX);
                let dX = (200+150*(1-xBit))*cos(angle);
                let dY = (200+150*(1-xBit))*sin(angle);
                let r = 200+50*Math.random();
                let g = 200+50*Math.random();
                let b = 200+50*Math.random();
                this.addToBullets.push(new Bullet(cX, cY, 8, 8, dX, dY, r, g, b, false));
                if (xBit < 0.5){
                    for (let i = -1; i < 2; i+=(xBit<0.25?0.5:1)){
                        dX = (150+100*(1-xBit))*cos(angle+Math.PI/4*i);
                        dY = (150+100*(1-xBit))*sin(angle+Math.PI/4*i);
                        r = 200+10*Math.random();
                        g = 200+10*Math.random();
                        b = 200+10*Math.random();
                        this.addToBullets.push(new Bullet(cX, cY, 8, 8, dX, dY, r, g, b, false));
                    }
                }
            }
        } else if (this.phase3Bit == 2){
            // Bit 2: Move to the player's x position.
            let targetX = player.x+player.w/2-this.w/2;
            let prog = 0.5+0.5*Math.sin(Math.PI/2-Math.PI*(this.timer/this.bitTimers[2]));
            this.x = targetX*prog+176*(1-prog);
        } else if (this.phase3Bit == 3){
            // Bit 3: Move up slightly to charge.
            let prog = 0.5+0.5*Math.sin(Math.PI/2-Math.PI*(this.timer/this.bitTimers[3]));
            let addY = 16*prog*(this.onTop?-1:1);
            let curY = this.onTop?this.trueY:this.bottomY;
            this.y = curY+addY;
        } else if (this.phase3Bit == 4){
            // Bit 4: CHARGE!
            let prog = 0.5+0.5*Math.sin(Math.PI/2-Math.PI*(this.timer/this.bitTimers[4]));
            let targetY = this.onTop?this.bottomY:this.trueY;
            let startY = this.onTop?this.trueY-16:this.bottomY+16;
            this.y = startY*(1-prog)+targetY*prog;
            this.bit0X = this.x;
        }
        // State Change on Timer.
        if (this.timer == 0){
            this.phase3Bit = (this.phase3Bit+1)%(this.bitTimers.length);
            this.timer = this.bitTimers[this.phase3Bit];
            if (this.phase3Bit == 0) this.onTop = !this.onTop;
        }
        this.interval = 1;
    }

    walkAway(deltaTime){
        if (this.firstWalk){
            this.firstWalk = false;
            this.lastY = this.y;
        }
        this.walkTimer -= deltaTime;
        if (this.walkTimer < 0){
            this.remove = true;
        }
        // Move off screen.
        let prog = 0.5+0.5*Math.sin(Math.PI/2-Math.PI*(this.walkTimer/this.maxWalkTimer));
        this.y = this.lastY*(1-prog)-80*prog;
    }

    destroy(deltaTime){
        this.destroyTimer -= deltaTime;
        if (this.destroyTimer < 0){
            // Destroy the object!
            this.remove = true;
            // Enemy Type Four Explosion
            for (let i = 0; i < 16; i++){
                let bSX = this.x+this.w/2;
                let bSY = this.y+this.h/2;
                let bSZ = 8+32*Math.random();
                let angle = Math.PI/4*i;
                let bDY = Math.sin(angle+Math.PI/8*Math.random());
                let bDX = Math.cos(angle+Math.PI/8*Math.random());
                let bDY2 = Math.sin(angle+Math.PI/8+Math.PI/8*Math.random());
                let bDX2 = Math.cos(angle+Math.PI/8+Math.PI/8*Math.random());
                let v1 = 200+50*Math.random();
                let v2 = 125+25*Math.random();
                let v3 = 75+50*Math.random();
                this.addToBullets.push(new Bullet(bSX, bSY, bSZ, bSZ, bDX*v1, bDY*v1, 100, 10, 200, false));
                this.addToBullets.push(new Bullet(bSX, bSY, bSZ, bSZ, bDX2*v2, bDY2*v2, 100, 10, 200, false));
                this.addToBullets.push(new Bullet(bSX, bSY, bSZ, bSZ, bDX*v3, bDY*v3, 100, 10, 200, false));
            }
        }
        this.interval -= deltaTime;
        if (this.interval < 0){
            this.interval = 0.4*(this.destroyTimer/5)+0.1;
            for (let i = 0; i < 6; i++){
                let bSX = this.x+this.w/2;
                let bSY = this.y+this.h/2;
                let bSZ = (2+4*Math.random())*(1+3*(1-this.destroyTimer/5));
                let angle = Math.PI/3*i;
                let bDY = Math.sin(angle+Math.PI/8*Math.random());
                let bDX = Math.cos(angle+Math.PI/8*Math.random());
                let v = 50+200*Math.random();
                this.addToBullets.push(new Bullet(bSX, bSY, bSZ, bSZ, bDX*v, bDY*v, 100, 10, 200, false));
            }
        }
    }

    draw(img){
        super.draw(img);
        if (this.phase < 1){
            img.fill(255, 0, 0, 150*Math.sin(Math.PI*2*this.phase*this.downTime));
            img.rect(0, 0, 240, 440);
            // TODO: Warning Text
        }
    }

    zeroHP(){}
}
