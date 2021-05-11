class Wave {
    constructor(waveset, capacity, minSAT = 0.05, maxSAT = 0.2){
        this.wavevalue = waveset
        this.shipcapacity = capacity;
        this.currentShip = 0;
        this.minShipAddTime = minSAT;
        this.maxShipAddTime = maxSAT;
        this.curShipAddTime = 0;
        this.transitionTime = 1.5;
        this.addShip = false;
        this.finished = false;
    }

    iterateThroughWave(deltaTime, enemies){
        if (!this.addShip){
            let enemyCount = 0;
            for (let i = 0; i < enemies.length; i++){
                if (enemies[i].isShip) enemyCount += 1;
            }
            if (enemyCount < this.shipcapacity && this.currentShip < this.wavevalue.length){
                this.addShip = true;
                this.curShipAddTime = this.minShipAddTime+Math.random()*(this.maxShipAddTime-this.minShipAddTime);
            } else if (enemyCount == 0 && this.currentShip == this.wavevalue.length){
                this.transitionTime -= deltaTime;
                if (this.transitionTime <= 0) this.finished = true;
            }
            return;
        }
        this.curShipAddTime -= deltaTime;
        if (this.curShipAddTime <= 0){
            this.curShipAddTime = 0;
            enemies.push(this.wavevalue[this.currentShip]);
            this.addShip = false;
            this.currentShip += 1;
        }
    }
}

function getWave(layer){
    if (layer == 1){
        return [ // Layer 1
            new Wave([
                new EnemyTypeOne(104, 100, 20)
            ], 1),
            new Wave([
                new EnemyTypeOne(70, 100, 35),
                new EnemyTypeOne(139, 100, 35)
            ], 2),
            new Wave([
                new EnemyTypeOne(108, 100, 35),
                new EnemyTypeOne(44, 60, 35),
                new EnemyTypeOne(164, 60, 35),
                new EnemyTypeOne(44, 100, 45),
                new EnemyTypeOne(164, 100, 45),
                new EnemyTypeOne(108, 60, 50)
            ], 3),
            new Wave([
                new EnemyTypeOne(70, 100, 35),
                new EnemyTypeOne(139, 100, 35),
                new EnemyTypeTwo(150)
            ], 2)
        ];
    }
    if (layer == 2){
        return [ // Layer 2 
            new Wave([
                new EnemyTypeOne(104, 100, 20)
            ], 1),
            new Wave([
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeOne(164, 125, 35),
                new EnemyTypeOne(44, 125, 35),
                new EnemyTypeOne(104, 100, 35),
                new EnemyTypeTwo(100),
                new EnemyTypeTwo(60)
            ], 2),
            new Wave([
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
            ], 4, 0.5, 0.6),
            new Wave([
                new EnemyTypeThree(104, 50, 392, 200)
            ], 1)
        ];
    }
    if (layer == 3){
        return [ // Layer 3
            new Wave([
                new EnemyTypeOne(44, 100, 35),
                new EnemyTypeOne(164, 100, 35),
            ], 2),
            new Wave([
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeOne(104, 100, 45),
                new EnemyTypeOne(44, 80, 45),
                new EnemyTypeOne(164, 80, 45),
                new EnemyTypeThree(104, 50, 392, 200),
                new EnemyTypeThree(104, 60, 392, 200),
                new EnemyTypeThree(104, 70, 392, 200)
            ], 5, 0.2, 0.25),
            new Wave([
                new EnemyTypeFour(104, 80, 3)
            ], 1)
        ];
    }
    if (layer == 4){
        return [ // Layer 4
            new Wave([
                new EnemyTypeOne(44, 40, 35),
                new EnemyTypeOne(104, 40, 35),
                new EnemyTypeOne(164, 40, 35),
                new EnemyTypeOne(44, 100, 35),
                new EnemyTypeOne(104, 100, 35),
                new EnemyTypeOne(164, 100, 35),
                new EnemyTypeOne(44, 160, 35),
                new EnemyTypeOne(104, 160, 35),
                new EnemyTypeOne(164, 160, 35),
                new EnemyTypeTwo(20),
                new EnemyTypeTwo(20)
            ], 9),
            new Wave([
                new EnemyTypeThree(104, 50, 250, 200),
                new EnemyTypeThree(50, 100, 392, 100),
                new EnemyTypeThree(158, 75, 310, 150)
            ], 2),
            new Wave([
                new EnemyTypeFour(104, 80, 4)
            ], 1)
        ];
    }
    if (layer == 5){
        return [ // Layer 5
            new Wave([
                new EnemyTypeOneThree(44, 40, 35),
                new EnemyTypeOneThree(104, 40, 35),
                new EnemyTypeOneThree(164, 40, 35),
                new EnemyTypeOneThree(44, 100, 35),
                new EnemyTypeOneThree(104, 100, 35),
                new EnemyTypeOneThree(164, 100, 35),
                new EnemyTypeOneThree(44, 160, 35),
                new EnemyTypeOneThree(104, 160, 35),
                new EnemyTypeOneThree(164, 160, 35),
            ], 9),
            new Wave([
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeTwo(140),
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeTwo(140),
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(100),
                new EnemyTypeTwo(140),
            ], 9, 0.4, 0.5),
            new Wave([
                new EnemyTypeFour(104, 80, 5)
            ], 1)
        ];
    }
    if (layer == 6){
        return [ // Layer 6
            new Wave([
                new EnemyTypeOne(44, 100, 35),
                new EnemyTypeOne(164, 100, 35),
            ], 2),
            new Wave([
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(60),
                new EnemyTypeTwo(60),
                new EnemyTypeOne(44, 100, 45),
                new EnemyTypeOne(104, 100, 45),
                new EnemyTypeOne(164, 100, 45),
                new EnemyTypeThree(164, 30, 380, 125),
                new EnemyTypeThree(104, 30, 380, 112),
                new EnemyTypeThree(44, 30, 380, 100)
            ], 9, 0.5, 0.6),
            new Wave([
                new EnemyTypeFour(104, 80, 6)
            ], 1)
        ];
    }
    if (layer == 7){
        return [ // Layer 7
            new Wave([
                new FinalBoss()
            ], 1)
        ];
    }
    return [];
}
