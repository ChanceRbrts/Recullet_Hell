class GenericScreen { 
    constructor(){
        this.nextScreen = undefined;
        this.endScreen = false;
    }
}

class Game extends GenericScreen {
    constructor(difficulty){
        super();
        this.difficulty = difficulty;
        this.layers = [];
        this.currentScene = 0;
        this.finishScreen = undefined;
        this.maxLength = 7;
    }

    startGame(){
        this.layers = [];
        this.currentScene = 0;
        this.layers.push(new Scene(1, this.difficulty > 0));
        this.finishScreen = undefined;
    }

    update(deltaTime, keys, keysPressed, falseKeys){
        if (keysPressed[esc]){
            this.endScreen = true;
            return;
        }
        if (this.finishScreen != undefined){
            this.finishScreen.update(deltaTime);
            if (keysPressed[pause]){
                this.startGame();
            }
            return;
        }
        // Moving back and forth between layers.
        if (keysPressed[back] && this.currentScene > 0){
            this.currentScene -= 1;
        } else if (keysPressed[forward] && this.currentScene < this.layers.length-1 && !this.layers[this.currentScene].paused){
            this.currentScene += 1;
        }
        // Restart a Layer if it's dead.
        if (this.layers[this.currentScene].died && keysPressed[pause]){
            this.layers[this.currentScene] = new Scene(this.currentScene+1, this.difficulty > 0);
            keysPressed[pause] = false;
        }
        // Updating all the layers at once.
        for (let i = 0; i < this.layers.length; i++){
            if (i == this.currentScene){
                this.layers[i].update(deltaTime, keys, keysPressed);
            } else {
                this.layers[i].update(deltaTime, falseKeys, falseKeys);
            }
            if (this.layers[i].player.remove){
                if (this.difficulty == 2){
                    this.gameOver(i+1);
                    return;
                } else if (!this.layers[i].died){
                    this.layers.splice(i+1);
                    if (this.currentScene > i) this.currentScene = i;
                    this.layers[i].died = true;
                }
            }
            if (this.layers[i].paused) break;
        }
        if (this.layers.length > 6 && this.layers[6].finished){
            let score = 0;
            let hits = 0;
            for (let i = 0; i < this.layers.length; i++){
                score += this.layers[i].score;
                hits -= this.layers[i].player.hp;
            }
            this.finishScreen = new FinishScreen(score, hits, this.difficulty);
        }
        // Add new layers if the last layer is finished.
        let finalLayer = this.layers[this.layers.length-1];
        if (!finalLayer.died && finalLayer.finished && this.layers.length < this.maxLength){
            this.layers.push(new Scene(this.layers.length+1, this.difficulty > 0));
        }
    }

    gameOver(deadLayer){
        let score = 0;
        let maxLayer = this.layers.length;
        let finalBossHP = 1;
        for (let i = 0; i < this.layers.length; i++){
            let layer = this.layers[i];
            if (i == 6){
                let enemyThere = layer.enemies.length > 0 && layer.enemies[0].isShip;
                finalBossHP = enemyThere ? layer.enemies[0].hp/layer.enemies[0].maxHP : 0;
            }
            score += layer.score;
        }
        this.finishScreen = new GameOverScreen(score, deadLayer, maxLayer, finalBossHP);
    }

    draw(){
        this.layers[this.currentScene].drawFull(this.layers, this.currentScene, 0);
        for (let i = 0; i < this.layers.length; i++){
            this.layers[i].resetDraw();
        }
        if (this.finishScreen != undefined){
            this.finishScreen.draw();
        }
    }
}

class FinishScreen{
    constructor(score, hits, diff){
        this.fadeIn = 0;
        this.maxFadeIn = 2;
        this.score = score;
        this.hits = hits;
        this.difficulty = diff;
    }

    update(deltaTime){
        this.fadeIn += deltaTime;
        if (this.fadeIn > this.maxFadeIn){
            this.fadeIn = this.maxFadeIn;
        }
    }

    draw(){
        fill(255, 200*this.fadeIn/this.maxFadeIn);
        rect(-320, -240, 640, 480);
        fill(0, 255*this.fadeIn/this.maxFadeIn);
        textFont(roboto);
        textSize(64);
        textAlign(CENTER, CENTER);
        text("Congratulations!", 0, -200);
        textSize(48);
        text(`Beaten on ${difficultyNames[this.difficulty]}!`, 0, -90);
        textSize(32);
        text(`Total Score: ${this.score}`, 0, 20);
        if (this.difficulty == 2){
            text("What. The. Hell.", 0, 90);
        } else if (this.difficulty == 0){
            text(`Number of Hits: ${this.hits}`, 0, 90);
        }
        text("Press Enter to Start Again!", 0, 160);
    }
}

class GameOverScreen{
    constructor(score, layerfallen, maxLayer, finalBossHP){
        this.score = score;
        this.maxLayer = maxLayer;
        this.finalBossHP = finalBossHP;
        this.layerFallen = layerfallen;
    }

    update(){}

    draw(){
        fill(255, 0, 0, 100);
        rect(-320, -240, 640, 480);
        fill(255);
        textFont(roboto);
        textSize(64);
        textAlign(CENTER, CENTER);
        text("GAME OVER", 0, -200);
        textSize(48);
        text(`Layer ${this.layerFallen} has fallen. :(`, 0, -90);
        let layerUncoveredText = `Layers Uncovered: ${this.maxLayer}`;
        let yPos = 30;
        let fontsize = 32;
        textSize(fontsize);
        if (this.maxLayer == 7 && this.finalBossHP < 2/8){
            layerUncoveredText = this.finalBossHP == 0 ? "RIGHT AT THE END!!!" : "SO CLOSE!!!";
            yPos = -10;
            fontsize = 64;
        } else if (this.maxLayer == 7 && this.finalBossHP < 5/8){
            layerUncoveredText = "You got really close!";
        } 
        text(layerUncoveredText, 0, yPos)
        textSize(32);
        text(`Total Score: ${this.score}`, 0, 80);
        text("Press Enter to Start Again!", 0, 160);
    }
}


class TitleScreen extends GenericScreen {
    constructor(){
        super();
        this.textBlink = 0;
        this.maxTextBlink = 1.5;
    }

    update(deltaTime, keys, keysPressed, falseKeys){
        this.textBlink = (this.textBlink+deltaTime)%this.maxTextBlink;
        if (keysPressed[pause] || keysPressed[shoot]){
            // Go to difficulty selector.
            this.nextScreen = new DifficultySelector();
        }
    }

    draw(){
        fill(0);
        rect(-320, -240, 640, 480);
        fill(255);
        textSize(96);
        textFont(roboto);
        textAlign(CENTER, CENTER);
        text("Recullet Hell", -5, -100);
        if (this.textBlink/this.maxTextBlink > 0.5){
            textSize(48);
            text("Press Enter/Space to Begin", -2, 64);
        }
    }
}

class DifficultySelector extends GenericScreen {
    constructor(){
        super();
        this.curDifficulty = 0;
        this.descriptions = [
            "The ships have no HP! Just avoid the bullets!",
            "The ships have 15 HP; Dying resets the layer that's dead.",
            "The ships have 15 HP; DYING FORCES YOU TO RESET THE GAME."
        ];
    }

    update(deltaTime, keys, keysPressed, falseKeys){
        if (keysPressed[esc]){
            this.endScreen = true;
            return;
        }
        if (keysPressed[left] && this.curDifficulty > 0){
            this.curDifficulty -= 1;
        } else if (keysPressed[right] && this.curDifficulty < 2){
            this.curDifficulty += 1;
        }
        if (keysPressed[pause] || keysPressed[shoot]){
            this.nextScreen = new Game(this.curDifficulty);
            this.nextScreen.startGame();
        }
    }

    draw(){
        fill(50);
        rect(-320, -240, 640, 480);
        stroke(0);
        strokeWeight(2);
        fill(100);
        rect(-150, -125, 300, 64);
        rect(-200, 45, 400, 115);
        fill(25);
        rect(-250, -50, 500, 25);
        fill(150, 150, 0);
        if (this.curDifficulty > 0)
            triangle(-175, -125, -175, -61, -207, -93);
        if (this.curDifficulty < 2)
            triangle(175, -125, 175, -61, 207, -93);
        fill(255);
        textSize(64);
        textAlign(CENTER, CENTER);
        text("Difficulty", 0, -200);
        textSize(48);
        text(difficultyNames[this.curDifficulty], 0, -100);
        textSize(16);
        text(`(${this.descriptions[this.curDifficulty]})`, 0, -40);
        textSize(32);
        text("CONTROLS", 0, 20);
        textSize(32);
        text("Press Enter/Space to Play!", 0, 200);
        textAlign(LEFT, CENTER);
        textSize(16);
        text("Arrow Keys: Move", -175, 60);
        text("Space: Shoot", -175, 80);
        text("Z/X: Jump Through Layers", -175, 100);
        text("Enter: Pause", -175, 120);
        text("Escape: Go Back to Difficulty Selector/Title Screen", -175, 140);
    }
}