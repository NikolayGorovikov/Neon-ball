// спасибо катя
function mainStart() {
    const gameMode = "test";
    window.themes = {
        "main": {
            colors: {
                airColor: "rgba(165, 115, 41, 0.5)",
                ballColor: "rgb(254, 254, 254)",
                ballColor2: "254, 254, 254",
                ballShadowColor: "rgb(254, 254, 254)",
                endBackColor:"60, 30, 40",
                endDrColor:"60, 30, 40",
                finishColor:"252, 243, 211",
                finishShadowColor:"175, 125, 46",
                fixedBallColor:"250, 223, 160",
                lineColor:"rgb(252, 243, 211)",
                lineShadowColor:"rgb(175, 125, 46)",
                mainBallColor:"rgb(37, 90, 181)",
                mainBallColorShadowColor:"rgb(37, 90, 181)",
                startBackColor:"21, 10, 13",
                startDrColor:"100, 50, 57"
            }
        },
        "2": {
            colors: {
                airColor: "rgba(165, 115, 41, 0.5)",
                ballColor: "rgb(254, 254, 254)",
                ballColor2: "254, 254, 254",
                ballShadowColor: "rgb(254, 254, 254)",
                endBackColor:"20, 1, 41",
                endDrColor:"31,2,67",
                finishColor:"247,212,243",
                finishShadowColor:"170,52,124",
                fixedBallColor:"250, 223, 160",
                lineColor:"rgb(247,212,243)",
                lineShadowColor:"rgb(170,52,124)",
                mainBallColor:"rgb(255,235,156)",
                mainBallColorShadowColor:"rgb(190, 149, 64)",
                startBackColor:"21, 1, 53",
                startDrColor:"31, 2, 67"
            }
        },
    }
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    const aspectRatio = 6 / 5;

    class Circle {
        #x;
        #y;
        nearBalls = new Set();
        #vector = [0.00000001, 0.00000001];
        #fixedBeforeTouch = false;

        constructor(obj, pitch) {
            this.parentElement = pitch;
            this.fixed = Boolean(Number(obj.fixed));
            this.angles = [Number(obj.angle1), Number(obj.angle2)];
            this.radius = Number(obj.radius);
            this.x = obj.x;
            this.y = obj.y;
            this.vector = [obj.vx, obj.vy];
            this.ax = obj.ax;
            this.ay = obj.ay;
            this.mass = Number(obj.m);
            this.elos = Boolean(Number(obj.elos));
            if (Number(obj.elos) === 2) {
                this.elosBall = true;
                this.elos = false;
            }
            this.gravity = Boolean(Number(obj.gravity)) ? this : false;
            ({dragSpotMin: this.dragSpotMin, dragSpotMax: this.dragSpotMax, dragTime: this.dragTime, dragMinRadius: this.dragMinRadius, dragVMax: this.dragVMax, dragRadius: this.dragRadius} = obj);
            this.fixedBeforeTouch = Boolean(Number(obj.fixedBeforeTouch));
            if (this.fixedBeforeTouch) {
                this.angles = [0, 0];
                this.time = Math.random()*2000;
            }
            this.touchRemove = Boolean(Number(obj.touchRemove));
            this.main = Boolean(Number(obj.main));

            this.handler = this;

            if (this.touchRemove || this.fixedBeforeTouch) {
                this.parentElement.clickable.add(this);
                this.parentElement.launchingAmount += 1;
            }

            if (obj.id) {
                this.id = obj.id;
                this.parentElement.addIdElement(this);
            }
            this.parentElement.addToGravitySystem(this);
        }

        remove() {
            if (this.main) this.parentElement.main = null;
            for (let i of this.nearBalls) i.nearBalls.delete(this);
            if (this.gravity) this.parentElement.removeGravitySpot(this.gravity);
            this.parentElement.removeFromSystem(this.numElem);
            this.parentElement.clickable.delete(this);
        }

        get x() {
            return this.#x + this.radius;
        }

        set x(x) {
            x -= this.radius;
            this.#x = x;
        }

        get width() {
            return this.radius * 2;
        }

        set y(y) {
            y -= this.width / 2;
            this.#y = y;
        }

        get y() {
            return this.#y + this.width / 2;
        }

        move(time, arr, a) {
            if (this.fixed) return;
            this.x = this.x + this.vector[0] * time;
            this.y = this.y + this.vector[1] * time;
            if (arr) {
                const [ax, ay] = arr
                this.ax = this.ax + ax;
                this.ay = this.ay + ay;
            }
            if (this.main && this.parentElement.finish && a) {
                const f = this.parentElement.finish.actualSize;
                let goal;
                if (this.getL(this.x, this.y, f.x1, f.y1) <= this.radius+lineWidth/2 || this.getL(this.x, this.y, f.x2, f.y1) <= this.radius+lineWidth/2 || this.getL(this.x, this.y, f.x1, f.y2) <= this.radius+lineWidth/2 || this.getL(this.x, this.y, f.x2, f.y2) <= this.radius+lineWidth/2 || (this.x >= f.x1-this.radius-lineWidth/2 && this.x <= f.x2+this.radius+lineWidth/2 && this.y >= f.y1-this.radius-lineWidth/2 && this.y <= f.y2+this.radius+lineWidth/2)) goal = true;
                if (goal) this.parentElement.win(this);
            }
        }

        getL(x1, y1, x2, y2) {
            return Math.sqrt((x1-x2)**2+(y1-y2)**2);
        }

        get vector() {
            if (this.fixed) return [0, 0];
            else return this.#vector;
        }

        set vector(vector) {
            if (this.fixed) return;
            this.#vector = vector.map(i => (Number(i)));
            if (isNaN(this.vector[0])) {
                this.vector[0] = 0.00000001;
            }
            if (isNaN(this.vector[1])) {
                this.vector[1] = 0.00000001;
            }
            if (this.vector[0] === 0) this.vector[0] = 0.00000001;
            if (this.vector[1] === 0) this.vector[1] = 0.00000001;
        }

        renderCanvas(con, can, time) {
            con.beginPath();
            let col;
            col = con.strokeStyle = con.fillStyle = this.main ? mainBallColor : this.fixedBeforeTouch ? ballColor : this.fixed ? lineColor : ballColor;
            con.lineWidth = lineWidth;
            con.shadowBlur = blur;
            con.lineCap = 'round';
            con.shadowColor = this.main ? mainBallColorShadowColor : this.fixedBeforeTouch ? ballShadowColor : this.fixed ? lineShadowColor : ballShadowColor;
            if (this.fixedBeforeTouch && time && !this.onDragging) {
                // const kf = Math.abs(Math.sin(2 * (this.time + time)));
                this.time += time;
                // const color = `rgb(${Math.round(this.fl0 + (this.bl0 - this.fl0) * kf)}, ${Math.round(this.fl1 + (this.bl1 - this.fl1) * kf)}, ${Math.round(this.fl2 + (this.bl2 - this.fl2) * kf)})`;
                // con.strokeStyle = color;
                // con.shadowColor = color;
                // con.lineWidth *= (1 + (1 - kf) / 5);
                const arr = col.split(")");
                arr[0] = arr[0].replace("rgb", "rgba");
                arr[1] = ","+(Math.cos(this.time*3-3)/2+0.5);
                arr[2] = ")"
                con.fillStyle = arr.join("");

            }
            if (this.onDragging) {
                this.time = 0;
                const spots = [];
                let cords = [this.x, this.y];
                let speed = this.draggingVector.concat([]);
                {
                    let done = false;
                    for (let i = 0; i < 13; i++) {
                        let time3 = 0.001666;
                        for (var a = time3; a <= this.dragTime/13/1000; a+=time3) {
                            cords = [cords[0]+speed[0]*time3, cords[1]+speed[1]*time3];
                            let ax = 0;
                            let ay = 0;
                            if (this.parentElement.gravitySpots.size) {
                                for (const k of this.parentElement.gravitySpots) {
                                    if (this.gravity === k) continue;
                                    const b = this.parentElement.getGravity(k, {x: cords[0], y: cords[1], mass: this.mass, radius: this.radius});
                                    ax += b[0];
                                    ay += b[1];
                                }
                            }
                            for (let k of this.parentElement.airLines) {
                                const a = k.countF({x: cords[0], y: cords[1], mass: this.mass, radius: this.radius}, time, true);
                                ax+=a[0];
                                ay+=a[1];
                            }
                            speed = [speed[0]+(this.ax+ax)*time3, speed[1]+(this.ay+ay+this.parentElement.g)*time3];
                        }
                        time3 = this.dragTime/13/1000 - a;
                        cords = [cords[0]+speed[0]*time3/1000, cords[1]+speed[1]*time3/1000];
                        let ax = 0;
                        let ay = 0;
                        if (this.parentElement.gravitySpots.size) {
                            for (const k of this.parentElement.gravitySpots) {
                                if (this.gravity === k) continue;
                                const b = this.parentElement.getGravity(k, {x: cords[0], y: cords[1], mass: this.mass, radius: this.radius});
                                ax += b[0];
                                ay += b[1];
                            }
                        }
                        for (let k of this.parentElement.airLines) {
                            const a = k.countF({x: cords[0], y: cords[1], mass: this.mass, radius: this.radius}, time, true);
                            ax+=a[0];
                            ay+=a[1];
                        }
                        speed = [speed[0]+(this.ax+ax)*time3/1000, speed[1]+(this.ay+ay+this.parentElement.g)*time3/1000];
                        if (Math.sqrt(Math.pow(cords[0]-this.x, 2)+Math.pow(cords[1]-this.y, 2)) > this.radius+lineWidth || done) {
                            spots.push(cords.concat([]));
                            done = true;
                        }
                    }
                    let counter = 0;
                    let length = spots.length;
                    const shc = con.shadowColor;
                    con.shadowColor = "transparent";
                    for (let i of spots) {
                        con.closePath();
                        con.beginPath();
                        con.arc(i[0], i[1], this.dragSpotMax-counter*(this.dragSpotMax-this.dragSpotMin)/length, 0, Math.PI*2);
                        counter++;
                        con.fill();
                    }
                    con.closePath();
                    con.beginPath();
                    con.shadowColor = shc;
                }
            }
            if (this.fixed && (this.angles[0] !== this.angles[1])) con.arc(this.#x + this.radius, this.#y + this.radius, this.radius, -this.angles[1], -this.angles[0]);
            else con.arc(this.#x + this.radius, this.#y + this.radius, this.radius, 0, Math.PI * 2);
            this.boombastick || (this.fixedBeforeTouch && !this.onDragging) ? con.fill() : 0;
            con.stroke();
            con.closePath();
        }

        set fixedBeforeTouch(a) {
            this.#fixedBeforeTouch = a;
            if (a) {
                this.fixed = true;
            }
        }

        get fixedBeforeTouch() {
            return this.#fixedBeforeTouch;
        }
    }

    class Finish {
        amount = 45;
        speed = 5;

        get actualSize() {
            return {
                x1: this.x1,
                y1: this.y1,
                x2: this.x1+this.a*this.xAmount,
                y2: this.y1+this.a*this.yAmount
            };
        }

        main() {
            const x1 = this.xx1 = Math.min(this.x1, this.x2);
            const y1 = this.yy1 = Math.min(this.y1, this.y2);
            const min = this.min = Math.min(Math.abs(this.x1 - this.x2), Math.abs(this.y1 - this.y2));
            const a = this.a = Math.min(min, Math.sqrt(Math.abs(this.x1 - this.x2) * Math.abs(this.y1 - this.y2) / this.amount));
            const xAmount = this.xAmount = Math.trunc(Math.abs(this.x1 - this.x2) / a);
            const yAmount = this.yAmount = Math.trunc(Math.abs(this.y1 - this.y2) / a);
            const xm = this.xm = (Math.abs(this.x1 - this.x2) / a - xAmount) / 2;
            const ym = this.ym = (Math.abs(this.y1 - this.y2) / a - yAmount) / 2;
            this.levels = xAmount + yAmount - 2;
        }

        constructor(obj, pitch) {
            this.pitch = pitch;
            this.x1 = Math.min(obj.x1, obj.x2);
            this.x2 = Math.max(obj.x1, obj.x2);
            this.y1 = Math.min(obj.y1, obj.y2);
            this.y2 = Math.max(obj.y1, obj.y2);
            this.main();
        }

        remove() {
            this.pitch.finish = null;
        }

        fn(x) {
            return 1 / (1 + Math.E ** (-x));
        }

        renderSquare(con, x, y, a, pos) {
            con.beginPath();
            const lightness = (this.fn(2 - Math.abs(pos - this.p1)) + this.fn(2 - Math.abs(pos - this.p2))) * 1.5;
            con.fillStyle = `rgba(${finishColor},${lightness})`;
            con.shadowColor = `rgba(${finishShadowColor},${lightness})`;
            con.shadowBlur = blur;
            con.moveTo(x, y);
            con.lineTo(x + a, y);
            con.lineTo(x + a, y + a);
            con.lineTo(x, y + a);
            con.fill();
            con.closePath();
        }

        renderCanvas(con, time) {
            if (!this.isRendering && time) {
                this.isRendering = true;
                this.p1 = -5;
                this.p2 = this.levels / 2;
            } else if (!time) {
                this.isRendering = false;
            } else if (this.isRendering && time) {
                this.p1 += time * this.speed;
                if (this.p1 > this.levels + 5) this.p1 = -5;
                this.p2 += time * this.speed;
                if (this.p2 > this.levels + 5) this.p2 = -5;
            }

            for (let i = 0; i < this.xAmount; i++) {
                for (let j = 0; j < this.yAmount; j++) {
                    if ((i % 2) === (j % 2)) this.renderSquare(con, this.xx1 + this.xm + this.a * i, this.yy1 + this.ym + this.a * j, this.a, (this.levels - (this.yAmount - 1 - j)) - i);
                }
            }
        }

    }

    class Shoot {
        constructor(time, type, target, data) {
            this.t = time;
            this.type = type;
            this.tar = target;
            if (data) this.data = data;
        }
    }

    class flexLine {
        constructor(pitch, obj) {
            this.pitch = pitch;
            this.lines = obj.lines;
            this.spots = obj.spots;
            this.x1 = obj.x1;
            this.x2 = obj.x2;
            this.y1 = obj.y1;
            this.y2 = obj.y2;
        }

        remove() {
            this.removeFromSystem(this.pitch);
        }

        removeFromSystem() {
            this.pitch.removeFromFlexLinesSystem(this);
        }

        renderCanvas(con) {
            con.moveTo(this.spots[0][0], this.spots[0][1]);
            for (let i = 1; i < this.spots.length; i++) con.lineTo(this.spots[i][0], this.spots[i][1]);
            // con.moveTo(this.lines[0].x1, this.lines[1].y1);
            // for (let i = 0; i < this.lines.length; i++) con.lineTo(this.lines[i].x2, this.lines[i].y2);
        }

    }

    function normalize(num) {
        return Math.floor(num * 100000000) / 100000000;
    }

    class Line {
        constructor({x1, x2, y1, y2}) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.main();
        }

        renderCanvas(con) {
            con.moveTo(this.x1, this.y1);
            con.lineTo(this.x2, this.y2);
        }

        remove() {
            this.parentElement.removeFromLinesSystem(this.num);
        }

        isInRange(x) {
            return this.x1 > this.x2 ? (x > this.x2 && this.x1 > x) : (x > this.x1 && this.x2 > x);
        }

        main() {
            if (this.x1 === this.x2) this.x1 -= 0.0000001;
            if (this.y1 === this.y2) this.y1 -= 0.0000001;
            this.k = (this.y1 - this.y2) / (this.x1 - this.x2);
            this.b = this.y1 - this.k * this.x1;
        }
    }

    class drawObj {
        constructor(spots, color, pitch, zIndex) {
            this.color = color;
            this.spots = spots;
            this.zIndex = zIndex;

            const spotsX = [];
            const spotsY = [];
            spots.forEach(i => {
                spotsX.push(i[0]);
                spotsY.push(i[1])
            });
            this.x1 = Math.min(...spotsX);
            this.x2 = Math.max(...spotsX);
            this.y1 = Math.min(...spotsY);
            this.y2 = Math.max(...spotsY);

            this.pitch = pitch;
        }

        remove() {
            this.pitch.drawings.all.delete(this);
            this.pitch.drawings[this.color].delete(this.spots);
        }
    }

    let start, stop, pitch, blur;

    document.addEventListener("pointermove", (e) =>{
        if (pitch) pitch.dragChange(e.pointerId, e.pageX, e.pageY);
    });

    document.addEventListener("pointerup", (e)=>{
        if (pitch) pitch.dragShoot(e.pointerId, e.pageX, e.pageY);
    })

    class Physics {
        #elemsInSystem = [];
        #linesInSystem = [];
        #flexLinesInSystem = new Set();
        #gravitySpots = new Set();
        #airLines = new Set();
        #realFPS = 60;
        #speed = 1;
        #fps = this.#realFPS;
        #movie;
        #g = 1000;
        boomkf = 10000000;
        #G = 1;
        clickable = new Set();
        drawings = {background: new Set(), rocks: new Set(), contour: new Set(), linefill: new Set(), linefillShadow: new Set(), all: new Set(), backgroundZ: {}, rocksZ: {}, contourZ: {}, linefillZ: {}, linefillShadowZ: {}};
        drags = new Map();
        launchingAmount = 0;
        timeSinceStart = 0;
        timeBeforeRestartConditionsCheck = 0;
        idElements = new Map();

        addIdElement(el) {
            this.idElements.set(el.id, el);
        }

        startDragging(elem, x, y, id) {
            if ([...this.drags.entries()].map(i=>i[1]).includes(elem)) return;
            if (!this.play) return;
            this.drags.set(id, elem);
            elem.onDragging = true;
            this.dragChange(id, x, y);
        }

        dragChange(id, x, y){
            const elem = this.drags.get(id);
            if (!elem) return;
            x -= this.elem.getBoundingClientRect().left;
            y -= this.elem.getBoundingClientRect().top;
            const length = Math.sqrt(Math.pow(elem.x - x, 2) + Math.pow(elem.y - y, 2));
            if (length > elem.dragMinRadius) {
                elem.onDragging = true;
                const v = Math.min(elem.dragVMax, (length-elem.dragMinRadius)/(elem.dragRadius - elem.dragMinRadius)*elem.dragVMax);
                const tan = Math.abs((y - elem.y)/(x - elem.x));
                const xsing = -(x - elem.x)/Math.abs(x - elem.x);
                const ysing = -(y - elem.y)/Math.abs(y - elem.y);
                let vx = v/Math.sqrt(tan**2+1)*xsing;
                let vy = Math.sqrt(v**2-vx**2)*ysing;
                if (Math.abs(vx/vy) > 250) vy = 0;
                else if (Math.abs(vy/vx) > 250) vx = 0;
                elem.draggingVector = [vx, vy];
            }
            else elem.onDragging = false;
        }

        dragShoot(id, x, y) {
            const elem = this.drags.get(id);
            if (!elem) return;
            x -= this.elem.getBoundingClientRect().left;
            y -= this.elem.getBoundingClientRect().top;
            const length = Math.sqrt(Math.pow(elem.x - x, 2) + Math.pow(elem.y - y, 2));
            if (length > elem.dragMinRadius) {
                elem.fixed = false;
                elem.fixedBeforeTouch = false;
                elem.vector = elem.draggingVector.concat([]);
                elem.parentElement.clickable.delete(elem);
                this.dragCancel(id);
                this.launchingAmount--;
                if (this.launchingAmount === 0) {
                    this.allLaunched = true;
                    this.timeSinceAllLaunched = 0;
                }
            }
            else this.dragCancel(id);
        }

        dragCancel(id, elem = this.drags.get(id)) {
            elem.draggingVector = [0,0];
            elem.onDragging = false;
            this.drags.delete(id);
        }

        addDraw(spots, color, zIndex) {
            this.drawings[color].add(spots);
            spots.zIndex = zIndex;
            this.drawings.all.add(new drawObj(spots, color, this, zIndex));
        }

        ziNormalize(){
            const numbers = new Set();
            this.drawings.contourZ = {};
            this.drawings.backgroundZ = {};
            this.drawings.linefillZ = {};
            this.drawings.linefillShadowZ = {};
            this.drawings.rocksZ = {};

            for (const i of this.drawings.contour) {
                if (i.zIndex > 1) {
                    if (!this.drawings.contourZ[i.zIndex]) this.drawings.contourZ[i.zIndex] = [];
                    this.drawings.contourZ[i.zIndex].push(i);
                    numbers.add(i.zIndex);
                }
            }
            for (const i of this.drawings.linefill) {
                    if (!this.drawings.linefillZ[i.zIndex]) this.drawings.linefillZ[i.zIndex] = [];
                    this.drawings.linefillZ[i.zIndex].push(i);
                    numbers.add(i.zIndex);
            }
            for (const i of this.drawings.rocks) {
                if (i.zIndex > 1) {
                    if (!this.drawings.rocksZ[i.zIndex]) this.drawings.rocksZ[i.zIndex] = [];
                    this.drawings.rocksZ[i.zIndex].push(i);
                    numbers.add(i.zIndex);
                }
            }
            for (const i of this.drawings.background) {
                if (i.zIndex > 1) {
                    if (!this.drawings.backgroundZ[i.zIndex]) this.drawings.backgroundZ[i.zIndex] = [];
                    this.drawings.backgroundZ[i.zIndex].push(i);
                    numbers.add(i.zIndex);
                }
            }
            for (const i of this.drawings.linefillShadow) {
                    if (!this.drawings.linefillShadowZ[i.zIndex]) this.drawings.linefillShadowZ[i.zIndex] = [];
                    this.drawings.linefillShadowZ[i.zIndex].push(i);
                    numbers.add(i.zIndex);
            }

            this.drawings.zi = [...numbers].sort();
        }

        drawBySpots(spots, con) {
            con.moveTo(spots[0][0], spots[0][1]);
            spots.forEach(i => con.lineTo(i[0], i[1]));
        }

        addAirLine(line) {
            this.#airLines.add(line);
        }

        win() {
            if (this.cleared) return;
            this.cleared = true;
            this.timeBeforeRestartConditionsCheck = Infinity;
            if (!isNaN(Number(actualLevel))) window.availableLevels.push(String(Number(actualLevel)+1));
            passedLevels.push(String(actualLevel));
            window.availableLevels = [...(new Set(window.availableLevels))];
            window.passedLevels = [...(new Set(window.passedLevels))];
            if (!window.playerInfo.levelsData[actualLevel].completeAttempt) setLevelsData(actualLevel, "completeAttempt", window.playerInfo.levelsData[actualLevel].attempt);
            if (window.gameSettings.saveProgress) {
                localStorage.setItem("passedLevels", passedLevels.join(","));
                localStorage.setItem("availableLevels", availableLevels.join(","));
            }
            pages.lvlCleared.open(actualLevel);
        }

        removeFromFlexLinesSystem(el) {
            this.#flexLinesInSystem.delete(el);
        }

        addToFlexLinesSystem(el) {
            this.#flexLinesInSystem.add(el);
        }

        removeAirLine(line) {
            this.#airLines.delete(line);
        }

        get linesInSystem() {
            return this.#linesInSystem;
        }

        get flexLinesInSystem() {
            return this.#flexLinesInSystem;
        }

        createGradient(con) {
            con.fillStyle = this.backgroundGr;
            con.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        renderCanvas(time) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i of this.#airLines) i.renderCanvas(this.context);
            if (this.finish) this.finish.renderCanvas(this.context, time);
            for (let i of this.#elemsInSystem) i.renderCanvas(this.context, this.canvas, time);
        }

        renderPassiveCanvas() {
            this.contextPassive.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.createGradient(this.contextPassive);

            this.contextPassive.beginPath();
            this.contextPassive.fillStyle = this.rocksGr;
            this.contextPassive.shadowBlur = 0;
            for (const i of this.drawings.rocks) if (i.zIndex===1)this.drawBySpots(i, this.contextPassive);
            this.contextPassive.fill();
            this.contextPassive.closePath();

            this.contextPassive.beginPath();
            this.contextPassive.fillStyle = this.backgroundGr;
            this.contextPassive.shadowBlur = 0;
            for (const i of this.drawings.background) if (i.zIndex===1)this.drawBySpots(i, this.contextPassive);
            this.contextPassive.fill();
            this.contextPassive.closePath();

            this.contextPassive.beginPath();
            this.contextPassive.fillStyle = this.contextPassive.strokeStyle = lineColor;
            this.contextPassive.lineWidth = lineWidth;
            this.contextPassive.shadowColor = lineShadowColor;
            this.contextPassive.shadowBlur = blur;
            this.contextPassive.lineCap = "round";



            for (let i of this.#linesInSystem) i.renderCanvas(this.contextPassive, this.canvas);
            for (let i of this.#flexLinesInSystem) i.renderCanvas(this.contextPassive, this.canvasPassive);
            for (const i of this.drawings.contour) if (i.zIndex === 1) this.drawBySpots(i, this.contextPassive);

            this.contextPassive.stroke();


            this.contextPassive.closePath();

            for (const j of this.drawings.zi) {
                this.contextPassive.beginPath();
                this.contextPassive.fillStyle = this.rocksGr;
                this.contextPassive.shadowBlur = 0;
                if (this.drawings.rocksZ[j]) for (const i of this.drawings.rocksZ[j]) this.drawBySpots(i, this.contextPassive);
                this.contextPassive.fill();
                this.contextPassive.closePath();

                this.contextPassive.beginPath();
                this.contextPassive.fillStyle = this.backgroundGr;
                this.contextPassive.shadowBlur = 0;
                if (this.drawings.backgroundZ[j]) for (const i of this.drawings.backgroundZ[j]) this.drawBySpots(i, this.contextPassive);
                this.contextPassive.fill();
                this.contextPassive.closePath();

                this.contextPassive.beginPath();
                this.contextPassive.fillStyle = this.contextPassive.strokeStyle = lineColor;
                this.contextPassive.lineWidth = lineWidth;
                this.contextPassive.shadowColor = lineShadowColor;
                this.contextPassive.shadowBlur = blur;
                this.contextPassive.lineCap = "round";
                if (this.drawings.contourZ[j]) for (const i of this.drawings.contourZ[j]) this.drawBySpots(i, this.contextPassive);

                this.contextPassive.stroke();

                this.contextPassive.closePath();


                this.contextPassive.beginPath();
                if (this.drawings.linefillZ[j]) for (const i of this.drawings.linefillZ[j]) this.drawBySpots(i, this.contextPassive);

                this.contextPassive.shadowBlur = 0;
                this.contextPassive.fill();

                this.contextPassive.closePath();
                this.contextPassive.beginPath();
                this.contextPassive.shadowBlur = blur;

                if (this.drawings.linefillShadowZ[j]) for (const i of this.drawings.linefillShadowZ[j]) this.drawBySpots(i, this.contextPassive);
                this.contextPassive.fill();


                this.contextPassive.closePath();
            }
        }

        resize(w, h) {
            if (this.fullScreenScale) {
                w = document.body.getBoundingClientRect().width;
                h = document.body.getBoundingClientRect().height;
            }
            else {
                h = w * aspectRatio;
            }

            let scalex, scaley, scale;
            scalex = w / this.width;
            scaley = h / this.height;
            scale = Math.sqrt(scalex*scaley);

            this.width = w;
            this.height = h;
            this.canvas.width = w;
            this.canvasPassive.width = w;
            this.canvas.height = h;
            this.canvasPassive.height = h;
            this.g *= scale;
            this.G *= scale;
            this.boomkf*=scale;
            window.elosLimit = Number(window.elosLimit) * scale;
            window.lineWidth *= scale;
            blur = blur * scale;
            for (const i of this.linesInSystem) {
                i.x1 *= scalex;
                i.x2 *= scalex;
                i.y1 *= scaley;
                i.y2 *= scaley;
                i.main();
            }

            for (const i of this.elemsInSystem) {
                const [x, y] = [i.x, i.y];
                i.radius *= scale;
                i.x = x * scalex;
                i.y = y * scaley;
                i.vector = [i.vector[0] * scalex, i.vector[1] * scaley];
                i.ax *= scalex;
                i.ay *= scaley;
                i.m *= scale;
                i.rboom *= scale;
                i.f *= scale;
                i.dragSpotMin *= scale;
                i.dragSpotMax *= scale;
                i.dragMinRadius *= scale;
                i.dragVMax *= scale;
                i.dragRadius *= scale;
            }

            for (const i of this.#airLines) {
                i.x1 *= scalex;
                i.x2 *= scalex;
                i.y1 *= scaley;
                i.y2 *= scaley;
                i.length *= scale;
                i.f *= scale;
                i.main();
            }

            for (const i of this.flexLinesInSystem) {
                i.x1 *= scalex;
                i.x2 *= scalex;
                i.y1 *= scaley;
                i.y2 *= scaley;
                i.lines.forEach((line) => {
                    line.x1 *= scalex;
                    line.x2 *= scalex;
                    line.y1 *= scaley;
                    line.y2 *= scaley;
                });
                i.spots.forEach(spot => {
                    spot[0] *= scalex;
                    spot[1] *= scaley;
                });
            }

            for (const i of this.drawings.all) {
                i.spots.forEach(spot => {
                    spot[0] *= scalex;
                    spot[1] *= scaley;
                });
            }

            if (this.finish) {
                this.finish.x1 *= scalex;
                this.finish.x2 *= scalex;
                this.finish.y1 *= scaley;
                this.finish.y2 *= scaley;
                this.finish.main();
            }

            if (this.areRestartConditions) {
                if (this.restartConditions.inZone instanceof Array) for (const i of this.restartConditions.inZone) {
                    i.x1 *= scalex;
                    i.x2 *= scalex;
                    i.y1 *= scaley;
                    i.y2 *= scaley;
                }
                else {
                    const i = this.restartConditions.inZone;
                    i.x1 *= scalex;
                    i.x2 *= scalex;
                    i.y1 *= scaley;
                    i.y2 *= scaley;
                }
                if (this.restartConditions.outOfZone instanceof Array) for (const i of this.restartConditions.outOfZone) {
                    i.x1 *= scalex;
                    i.x2 *= scalex;
                    i.y1 *= scaley;
                    i.y2 *= scaley;
                }
                else {
                    const i = this.restartConditions.outOfZone;
                    i.x1 *= scalex;
                    i.x2 *= scalex;
                    i.y1 *= scaley;
                    i.y2 *= scaley;
                }
            }
            this.renderCanvas(0);
            this.renderPassiveCanvas();
        }

        constructor(obj, bol) {
            pitch = this;
            start = () => {
                this.start();
            };
            stop = () => {
                this.stop();
            }
            setLevelsData(obj.__levelId, "attempt", window.playerInfo.levelsData[obj.__levelId]?.attempt ? Number(window.playerInfo.levelsData[obj.__levelId]?.attempt)+1 : 1);
            this.elem = document.createElement("div");
            this.elem.classList.add("canvasHolder");
            this.elem.physics = this;
            this.fullScreenScale = Boolean(Number(obj.fullScreenScale));
            if (this.fullScreenScale) this.elem.classList.add("fullScreen");
            window.requestAnimationFrame(() => {
                canvases.add(this);
                this.canvas = document.createElement("canvas");
                this.context = this.canvas.getContext("2d");
                this.width = this.elem.getBoundingClientRect().width;
                this.height = this.elem.getBoundingClientRect().height;
                this.canvas.width = this.elem.getBoundingClientRect().width;
                this.canvas.height = this.elem.getBoundingClientRect().height;

                this.canvasPassive = document.createElement("canvas");
                this.contextPassive = this.canvasPassive.getContext("2d");
                this.canvasPassive.width = this.canvas.width;
                this.canvasPassive.height = this.canvas.height;

                this.canvas.style.position = this.canvasPassive.style.position = "absolute";
                this.canvas.style.top = this.canvasPassive.style.top = this.canvasPassive.style.left = this.canvas.style.left = "0px";


                this.elem.append(this.canvasPassive);
                this.elem.append(this.canvas);
                {
                    let scalex, scaley, scale;
                    scalex = this.elem.getBoundingClientRect().width / obj.width;
                    scaley = this.elem.getBoundingClientRect().height / obj.height;
                    scale = Math.sqrt(scalex*scaley);

                    for (const i in obj.inPitch) this[i] = Number(obj.inPitch[i]);
                    for (const i in obj.pitchParams) window[i] = obj.pitchParams[i];
                    if (obj.pitchParams.theme) {
                        for (const i in window.themes[obj.pitchParams.theme].colors) window[i] = window.themes[obj.pitchParams.theme].colors[i];
                    }
                    else for (const i in window.themes.main.colors) window[i] = window.themes.main.colors[i];

                    this.g *= scale;
                    this.G *= scale;
                    this.boomkf*=scale;
                    window.elosLimit = Number(window.elosLimit) * scale;
                    window.lineWidth *= scale;
                    blur = obj.blur * scale;
                    for (const i of obj.lines) {
                        i.x1 *= scalex;
                        i.x2 *= scalex;
                        i.y1 *= scaley;
                        i.y2 *= scaley;
                        this.addedToLinesSystem(new Line(i));
                    }

                    for (const i of obj.balls) {
                        i.x *= scalex;
                        i.y *= scaley;
                        i.radius *= scale;
                        i.vx *= scalex;
                        i.vy *= scaley;
                        i.ax *= scalex;
                        i.ax *= scaley;
                        i.m *= scale;
                        i.dragSpotMin *= scale;
                        i.dragSpotMax *= scale;
                        i.dragMinRadius *= scale;
                        i.dragVMax *= scale;
                        i.dragRadius *= scale;
                        this.addedToSystem(new Circle(i, this));
                    }

                    for (const i of obj.airLines) {
                        i.x1 *= scalex;
                        i.x2 *= scalex;
                        i.y1 *= scaley;
                        i.y2 *= scaley;
                        i.length *= scale;
                        i.f *= scale;
                        this.addAirLine(new airLine(i));
                    }

                    for (const i of obj.tntBalls) {
                        i.x *= scalex;
                        i.y *= scaley;
                        i.radius *= scale;
                        i.vx *= scalex;
                        i.vy *= scaley;
                        i.ax *= scalex;
                        i.ax *= scaley;
                        i.rboom *= scale;
                        i.f *= scale;
                        i.m *= scale;
                        i.dragSpotMin *= scale;
                        i.dragSpotMax *= scale;
                        i.dragMinRadius *= scale;
                        i.dragVMax *= scale;
                        i.dragRadius *= scale;
                        this.addedToSystem(new tnt(i, this));
                    }

                    for (const i of obj.flexLines) {
                        i.x1 *= scalex;
                        i.x2 *= scalex;
                        i.y1 *= scaley;
                        i.y2 *= scaley;
                        i.lines = i.lines.map((line) => {
                            line.x1 *= scalex;
                            line.x2 *= scalex;
                            line.y1 *= scaley;
                            line.y2 *= scaley;
                            return new Line(line);
                        });
                        i.spots = i.spots.map(spot => {
                            spot[0] *= scalex;
                            spot[1] *= scaley;
                            return spot;
                        });

                        this.addToFlexLinesSystem(new flexLine(this, i));
                    }

                    for (const i of obj.drawings) {
                        i.spots.forEach(spot => {
                            spot[0] *= scalex;
                            spot[1] *= scaley;
                        });
                        this.addDraw(i.spots, i.color, i.zIndex ? Number(i.zIndex): 1);
                    }

                    if (obj.finish) {
                        obj.finish.x1 *= scalex;
                        obj.finish.x2 *= scalex;
                        obj.finish.y1 *= scaley;
                        obj.finish.y2 *= scaley;
                        this.finish = new Finish(obj.finish, this);
                    }

                    this.areRestartConditions = Boolean(obj.restartConditions)
                    this.restartConditions = obj.restartConditions;

                    if (this.areRestartConditions) {
                        if (this.restartConditions.inZone && this.restartConditions.inZone instanceof Array)
                            for (const i of this.restartConditions.inZone) {
                                if (i.x1 === "i") i.x1 = Infinity;
                                if (i.x2 === "i") i.x2 = Infinity;
                                if (i.y1 === "i") i.y1 = Infinity;
                                if (i.y2 === "i") i.y2 = Infinity;
                                if (i.x1 === "-i") i.x1 = -Infinity;
                                if (i.x2 === "-i") i.x2 = -Infinity;
                                if (i.y1 === "-i") i.y1 = -Infinity;
                                if (i.y2 === "-i") i.y2 = -Infinity;
                                i.allLaunched = Boolean(Number(i.allLaunched));
                                i.sinceStart = Boolean(Number(i.sinceStart));

                                i.x1*=scalex;
                                i.x2*=scalex;
                                i.y1*=scaley;
                                i.y2*=scaley;
                            }
                        else if (this.restartConditions.inZone && this.restartConditions.inZone instanceof Object) {
                            const i = this.restartConditions.inZone;
                            if (i.x1 === "i") i.x1 = Infinity;
                            if (i.x2 === "i") i.x2 = Infinity;
                            if (i.y1 === "i") i.y1 = Infinity;
                            if (i.y2 === "i") i.y2 = Infinity;
                            if (i.x1 === "-i") i.x1 = -Infinity;
                            if (i.x2 === "-i") i.x2 = -Infinity;
                            if (i.y1 === "-i") i.y1 = -Infinity;
                            if (i.y2 === "-i") i.y2 = -Infinity;
                            i.allLaunched = Boolean(Number(i.allLaunched));
                            i.sinceStart = Boolean(Number(i.sinceStart));

                            i.x1*=scalex;
                            i.x2*=scalex;
                            i.y1*=scaley;
                            i.y2*=scaley;
                        }
                        else this.restartConditions.inZone = [];
                        if (this.restartConditions.outOfZone && this.restartConditions.outOfZone instanceof Array)
                            for (const i of this.restartConditions.outOfZone) {
                                if (i.x1 === "i") i.x1 = Infinity;
                                if (i.x2 === "i") i.x2 = Infinity;
                                if (i.y1 === "i") i.y1 = Infinity;
                                if (i.y2 === "i") i.y2 = Infinity;
                                if (i.x1 === "-i") i.x1 = -Infinity;
                                if (i.x2 === "-i") i.x2 = -Infinity;
                                if (i.y1 === "-i") i.y1 = -Infinity;
                                if (i.y2 === "-i") i.y2 = -Infinity;
                                i.allLaunched = Boolean(Number(i.allLaunched));
                                i.sinceStart = Boolean(Number(i.sinceStart));

                                i.x1*=scalex;
                                i.x2*=scalex;
                                i.y1*=scaley;
                                i.y2*=scaley;
                            }
                        else if (this.restartConditions.outOfZone && this.restartConditions.outOfZone instanceof Object) {
                            const i = this.restartConditions.outOfZone;
                            if (i.x1 === "i") i.x1 = Infinity;
                            if (i.x2 === "i") i.x2 = Infinity;
                            if (i.y1 === "i") i.y1 = Infinity;
                            if (i.y2 === "i") i.y2 = Infinity;
                            if (i.x1 === "-i") i.x1 = -Infinity;
                            if (i.x2 === "-i") i.x2 = -Infinity;
                            if (i.y1 === "-i") i.y1 = -Infinity;
                            if (i.y2 === "-i") i.y2 = -Infinity;
                            i.allLaunched = Boolean(Number(i.allLaunched));
                            i.sinceStart = Boolean(Number(i.sinceStart));

                            i.x1*=scalex;
                            i.x2*=scalex;
                            i.y1*=scaley;
                            i.y2*=scaley;
                        }
                        else this.restartConditions.outOfZone = [];
                    }
                }
                let gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, `rgb(${endBackColor})`);
                gradient.addColorStop(0.2, `rgb(${endBackColor})`);
                gradient.addColorStop(1, `rgb(${startBackColor})`);
                this.backgroundGr = gradient;
                gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, `rgb(${startDrColor})`);
                gradient.addColorStop(0.5, `rgb(${endDrColor})`);
                gradient.addColorStop(1, `rgb(${startDrColor})`);
                this.rocksGr = gradient;

                this.ziNormalize();
                this.renderPassiveCanvas();
                this.renderCanvas(1);
                if (!bol) start();
            });
        }

        checkRestartConditions(){
            if (!this.areRestartConditions) return false;
            if (this.timeSinceStart > this.restartConditions.timeSinceStart) return true;
            if (this.allLaunched && this.timeSinceAllLaunched > this.restartConditions.timeSinceAllLaunched) return true;
            if (this.restartConditions.inZone instanceof Array) for (const i of this.restartConditions.inZone) {
                if ((i.allLaunched && !this.allLaunched) || (i.allLaunched && this.allLaunched && (this.timeSinceAllLaunched <= i.time)) || (i.sinceStart && i.time >= this.timeSinceStart)) continue;
                const target = i.id ? this.idElements.get(i.id) : this.mainBall;
                if (target.x > i.x1 && target.x < i.x2 && target.y > i.y1 && target.y < i.y2) return true;
                else if (i.once) i.time = Infinity;
            }
            else {
                const i = this.restartConditions.inZone;
                const target = i.id ? this.idElements.get(i.id) : this.mainBall;
                if (!((i.allLaunched && !this.allLaunched) || (i.allLaunched && this.allLaunched && this.timeSinceAllLaunched <= i.time) || (i.sinceStart && i.time >= this.timeSinceStart))) {
                    if ((target.x > i.x1 && target.x < i.x2 && target.y > i.y1 && target.y < i.y2)) return true;
                    else if (i.once) i.time = Infinity;
                }
            }
            if (this.restartConditions.outOfZone instanceof Array) for (const i of this.restartConditions.outOfZone) {
                if ((i.allLaunched && !this.allLaunched) || (i.allLaunched && this.allLaunched && this.timeSinceAllLaunched <= i.time) || (i.sinceStart && i.time >= this.timeSinceStart)) continue;
                const target = i.id ? this.idElements.get(i.id) : this.mainBall;
                if (!(target.x > i.x1 && target.x < i.x2 && target.y > i.y1 && target.y < i.y2)) return true;
                else if (i.once) i.time = Infinity;
            }
            else {
                const i = this.restartConditions.outOfZone;
                const target = i.id ? this.idElements.get(i.id) : this.mainBall;
                if (!((i.allLaunched && !this.allLaunched) || (i.allLaunched && this.allLaunched && this.timeSinceAllLaunched <= i.time) || (i.sinceStart && i.time >= this.timeSinceStart))) {
                    if (!(target.x > i.x1 && target.x < i.x2 && target.y > i.y1 && target.y < i.y2)) return true;
                    else if (i.once) {
                        i.time = Infinity;
                    }
                }
            }
        }

        get g() {
            return this.#g;
        }

        set g(g) {
            this.#g = g;
        }

        get G() {
            return this.#G;
        }

        set G(G) {
            this.#G = G;
        }

        removeGravitySpot(a) {
            this.#gravitySpots.delete(a);
        }

        removeFromSystem(num) {
            this.#elemsInSystem = this.#elemsInSystem.slice(0, num).concat(this.#elemsInSystem.slice(num + 1, this.#elemsInSystem.length));
            for (let i = num; i < this.#elemsInSystem.length; i++) this.#elemsInSystem[i].numElem = i;
            this.renderCanvas();
        }

        get speed() {
            return this.#speed;
        }

        set speed(a) {
            this.#speed = a;
            this.#fps = this.#realFPS / this.#speed;
        }

        get fps() {
            return this.#realFPS;
        }

        get elemsInSystem() {
            return this.#elemsInSystem;
        }

        set fps(a) {
            this.#realFPS = a;
            this.#fps = this.#realFPS / this.#speed;
        }

        main(time , fullTime) {
            let chvTime = fullTime / 10;
            const normalized = normalize(chvTime);
            let chva = 0;
            time = normalize(time);
            main: while (time > 0) {
                let timeIn = this.findSmallestTime(fullTime- time, 0.003, fullTime);
                if (timeIn.type === true && timeIn.t === 0) break;
                while (timeIn.t === 0) {
                    if (timeIn.type === true && timeIn.t === 0) break main;
                    timeIn = this.findSmallestTime(fullTime - time, 0.003, fullTime);
                }
                let time2 = timeIn.t;
                if (time2 >= normalized) {
                    this.drawFrame(normalized);
                    this.changeVectors(normalized);
                    time = normalize(time - normalized);
                    chva++;
                    continue;
                }
                chvTime = normalize(chvTime - time2);
                if (chvTime <= 0) {
                    this.drawFrame(chvTime + time2);
                    this.changeVectors(normalized);
                    time = normalize(time - (chvTime + time2));
                    chvTime = normalized;
                    chva++;
                    continue;
                }
                this.drawFrame(time2);
                if (timeIn.type === "b") {
                    this.createCircleVector(timeIn.data.main, timeIn.data.nomain);
                } else if (timeIn.type === "bl") {
                    this.createLineCircleVector(timeIn.data.cr, timeIn.data.ln);
                } else if (timeIn.type === "bp") {
                    this.createBallPointVector(timeIn.data.cr, timeIn.data.sp);
                }
                time = normalize(time - time2);
            }
            this.renderCanvas(fullTime);
            if (chva === 9) this.changeVectors(normalized);
        }

        start() {
            this.play = true;
            this.inMain(true);
        }

        inMain(first) {
            if (first) this.time = performance.now();
            if (!this.play) return;
            this.#movie = window.requestAnimationFrame((time) => {
                let timed = time-this.time;
                if (timed > 100) {
                    this.time = time;
                    timed = 0;
                }
                this.main((timed)/1000, (timed)/1000);
                this.inMain();
                this.actualFPS = 1000/(timed);
                this.time = time;
                if (window.gameSettings.autoRestart) {
                    this.timeBeforeRestartConditionsCheck -= timed;
                    if (this.allLaunched) this.timeSinceAllLaunched += timed;
                    this.timeSinceStart += timed;
                    if (this.timeBeforeRestartConditionsCheck < 0) {
                        this.timeBeforeRestartConditionsCheck = 200;
                        const result = this.checkRestartConditions();
                        if (result) {
                            this.timeBeforeRestartConditionsCheck = Infinity;
                            restartLvl(true);
                            generateRetryPic();
                            setTimeout(()=>start(), 800);
                        }
                    }
                }
            });
        }

        stop() {
            window.cancelAnimationFrame(this.#movie);
            this.play = false;
            for (const [i] of this.drags) this.dragCancel(i);
        }

        addedToSystem(elem) {
            this.#elemsInSystem.push(elem);
            elem.numElem = this.#elemsInSystem.length - 1;
            if (elem.main) this.mainBall = elem;
            this.renderCanvas();
        }

        addToGravitySystem(elem) {
            if (elem.gravity) {
                this.#gravitySpots.add(elem.gravity);
            }
        }

        addedToLinesSystem(line) {
            this.#linesInSystem.push(line);
            line.num = this.#linesInSystem.length - 1;
            this.renderCanvas();
        }

        removeFromLinesSystem(num) {
            this.#linesInSystem = this.#linesInSystem.slice(0, num).concat(this.#linesInSystem.slice(num + 1, this.#linesInSystem.length));
            for (let i = num; i < this.#linesInSystem.length; i++) this.#linesInSystem[i].num = i;
            this.renderCanvas();
        }

        drawFrame(time = 1 / this.#fps) {
            for (const i of this.#elemsInSystem) {
                i.move(time, 0, 1);
            }
        }

        getGravity(sp, cr, fuck) {
            const x1 = sp.handler.x;
            const x2 = cr.x;
            const y1 = sp.handler.y;
            const y2 = cr.y;
            const r = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
            if (cr.radius + sp.handler.radius > r) return [0, 0];
            const G = fuck ? this.boomkf : this.#G;
            const m = sp.handler.mass;
            const f = G * (m * cr.mass) / (r ** 2) / cr.mass;
            const tg = Math.abs((y1 - y2) / (x1 - x2));
            let ax = f / Math.sqrt(tg ** 2 + 1);
            let ay = ax * tg;
            if (x2 > x1) ax = -ax;
            if (y2 > y1) ay = -ay;
            return [ax, ay];
        }

        createLineCircleVector(main, line) {
            const alpha = Math.atan(main.vector[1] / main.vector[0]);
            const linesK = -1 / line.k;
            if (!isFinite(linesK)) {
                main.vector[1] = -main.vector[1] * main.elos;
                return;
            }
            const newAlpha = Math.tan(alpha - Math.atan(linesK));
            let fullAngle = ((main.vector[0] >= 0) && (main.vector[1] >= 0) ? alpha * 180 / Math.PI : (main.vector[0] <= 0) && (main.vector[1] >= 0) ? (alpha + Math.PI) * 180 / Math.PI : (main.vector[0] <= 0) && (main.vector[1] <= 0) ? (alpha + Math.PI) * 180 / Math.PI : (alpha + Math.PI * 2) * 180 / Math.PI) % 360;
            const angleK = -(Math.atan(linesK) * 180 / Math.PI);
            const kfx1 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle + angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle + angleK + 360) % 360) % 180 <= 90))) ? (-1) : 1;
            const kfy1 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle + angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle + angleK + 360) % 360) % 180 >= 90))) ? (-1) : 1;
            const v1 = Math.sqrt(Math.pow(main.vector[0], 2) + Math.pow(main.vector[1], 2));
            let x1 = -v1 / Math.sqrt(1 + Math.pow(newAlpha, 2)) * (kfx1) * main.vector[0] / Math.abs(main.vector[0]); //
            let y1 = Math.sqrt(Math.pow(v1, 2) - Math.pow(x1, 2)) * (kfy1) * main.vector[1] / Math.abs(main.vector[1]);
            if (isNaN(y1)) {
                y1 = 0.0000000001 * (kfy1) * main.vector[1] / Math.abs(main.vector[1]);

            }
            const elos1 = Math.pow(elosLimit / (Math.max(Math.abs(x1), elosLimit)), 1 / 3);
            x1 = x1 * (main.elos ? elos1 : 1);
            const newYK = 1 / linesK * (-1);
            const xv1x = x1 / Math.sqrt(1 + Math.pow(linesK, 2));
            const xv1y = xv1x * linesK;
            const yv1y = y1 / Math.sqrt(1 + Math.pow(1 / newYK, 2));
            const yv1x = yv1y / newYK;
            main.vector = [(xv1x + yv1x), (xv1y + yv1y)];
        }

        createCircleVector(main, nomain) {
            if (main.radius === nomain.radius) {
                main.nearBalls.add(nomain);
                nomain.nearBalls.add(main);
            }
            if (main.fixed) {
                this.createBallPointVector(nomain, main, main.radius);
                return;
            } else if (nomain.fixed) {
                this.createBallPointVector(main, nomain, nomain.radius);
                return;
            }
            const alpha = Math.atan(main.vector[1] / main.vector[0]);
            const linesK = (main.y - nomain.y) / (main.x - nomain.x);

            if (!isFinite(linesK)) {
                const a = main.vector[1];
                main.vector[1] = nomain.vector[1] * main.elos;
                nomain.vector[1] = a * main.elos;
                return;
            }

            const newAlpha = Math.tan(alpha - Math.atan(linesK));
            let fullAngle = ((main.vector[0] >= 0) && (main.vector[1] >= 0) ? alpha * 180 / Math.PI : (main.vector[0] <= 0) && (main.vector[1] >= 0) ? (alpha + Math.PI) * 180 / Math.PI : (main.vector[0] <= 0) && (main.vector[1] <= 0) ? (alpha + Math.PI) * 180 / Math.PI : (alpha + Math.PI * 2) * 180 / Math.PI) % 360;
            const angleK = -(Math.atan(linesK) * 180 / Math.PI);
            const kfx1 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle + angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle + angleK + 360) % 360) % 180 <= 90))) ? (-1) : 1;
            const kfy1 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle + angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle + angleK + 360) % 360) % 180 >= 90))) ? (-1) : 1;
            const v1 = Math.sqrt(Math.pow(main.vector[0], 2) + Math.pow(main.vector[1], 2));
            let x1 = v1 / Math.sqrt(1 + Math.pow(newAlpha, 2)) * (kfx1) * main.vector[0] / Math.abs(main.vector[0]); //
            let y1 = Math.sqrt(Math.pow(v1, 2) - Math.pow(x1, 2)) * (kfy1) * main.vector[1] / Math.abs(main.vector[1]); //
            const alpha2 = Math.atan(nomain.vector[1] / nomain.vector[0]);
            fullAngle = ((nomain.vector[0] >= 0) && (nomain.vector[1] >= 0) ? alpha2 * 180 / Math.PI : (nomain.vector[0] <= 0) && (nomain.vector[1] >= 0) ? (alpha2 + Math.PI) * 180 / Math.PI : (nomain.vector[0] <= 0) && (nomain.vector[1] <= 0) ? (alpha2 + Math.PI) * 180 / Math.PI : (alpha2 + Math.PI * 2) * 180 / Math.PI) % 360;
            const kfx2 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle + angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle + angleK + 360) % 360) % 180 <= 90))) ? (-1) : 1;
            const kfy2 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle + angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle + angleK + 360) % 360) % 180 >= 90))) ? (-1) : 1;
            const newAlpha2 = Math.tan(alpha2 - Math.atan(linesK));

            const v2 = Math.sqrt(Math.pow(nomain.vector[0], 2) + Math.pow(nomain.vector[1], 2));
            let x2 = v2 / Math.sqrt(1 + Math.pow(newAlpha2, 2)) * (kfx2) * nomain.vector[0] / Math.abs(nomain.vector[0]); //

            let y2 = Math.sqrt(Math.pow(v2, 2) - Math.pow(x2, 2)) * (kfy2) * nomain.vector[1] / Math.abs(nomain.vector[1]); //
            const elos1 = Math.pow(elosLimit / (Math.max(Math.abs(x1 - x2), elosLimit)), 1 / 3);
            let a = x1;
            let b = x2;
            if (main.fixed) {
                x2 = -x2;

                x2 = x2 * (nomain.elos ? elos1 : 1);
            } else if (nomain.fixed) {
                x1 = -x1;

                x1 = x1 * (main.elos ? elos1 : 1);
            } else {
                x1 = ((main.mass - nomain.mass) * x1 + 2 * nomain.mass * x2) / (main.mass + nomain.mass);

                x2 = (2 * main.mass * a + (nomain.mass - main.mass) * x2) / (main.mass + nomain.mass);
                const diff1 = x1 - a;
                const diff2 = x2 - b;

                x1 = a + diff1 * ((main.elos || main.elosBall) ? elos1 : 1);
                x2 = b + diff2 * ((nomain.elos || nomain.elosBall) ? elos1 : 1);
            }
            const newYK = 1 / linesK * (-1);
            const xv1x = x1 / Math.sqrt(1 + Math.pow(linesK, 2));
            const xv1y = xv1x * linesK;
            const yv1y = y1 / Math.sqrt(1 + Math.pow(1 / newYK, 2));
            const yv1x = yv1y / newYK;
            const xv2x = x2 / Math.sqrt(1 + Math.pow(linesK, 2));
            const xv2y = xv2x * linesK;
            const yv2y = y2 / Math.sqrt(1 + Math.pow(1 / newYK, 2));
            const yv2x = yv2y / newYK;
            const resultMain = [(xv1x + yv1x), xv1y + yv1y];
            const resultNotMain = [(xv2x + yv2x), (xv2y + yv2y)];
            main.vector = resultMain;
            nomain.vector = resultNotMain;
        }

        changeVectors(time) {
            for (let i = 0, j = this.#elemsInSystem[i]; i < this.#elemsInSystem.length; i++, j = this.#elemsInSystem[i]) {
                if (j.fixed || !j.gravity) {
                    continue;
                }
                let ax = 0;
                let ay = 0;
                if (this.#gravitySpots.size) {
                    for (const k of this.#gravitySpots) {
                        if (j.gravity === k) continue;
                        const a = this.getGravity(k, j);
                        ax += a[0];
                        ay += a[1];
                    }
                }
                j.vector = [j.vector[0] + (j.ax + ax) * time, j.vector[1] + this.#g * time + (j.ay + ay) * time];

            }
            for (let k of this.#airLines) {
                for (let i = 0, j = this.#elemsInSystem[i]; i < this.#elemsInSystem.length; i++, j = this.#elemsInSystem[i]) {
                    k.countF(j, time);
                }
            }
        }

        findSmallestTime(part = 0, smallest, fullTime) {
            let reverse = false;
            let time;
            time = new Shoot(fullTime - part, true);
            main: for (let i = 0, j = this.#elemsInSystem[i]; i < this.#elemsInSystem.length; i++, j = this.#elemsInSystem[i]) {
                let amount = 0;
                for (let k of j.nearBalls) {
                    let time2 = this.findSmallestCircleTime(j, k);
                    if (time2.t < smallest && !reverse) {
                        time = new Shoot(0, "o");
                        const cords = [[j.x, j.y], [k.x, k.y]];
                        j.move(time2.t);
                        k.move(time2.t);
                        if (time2.type === "b") this.createCircleVector(j, k);
                        else if (time2.type === "bp") {
                            this.createBallPointVector(time2.data.cr, time2.data.sp);
                        }
                        j.x = cords[0][0];
                        j.y = cords[0][1];
                        k.x = cords[1][0];
                        k.y = cords[1][1];
                    }
                    if (time2.data.l < 2.1 * k.radius && time2.type === "b") amount++;
                    else setTimeout(() => {
                        j.nearBalls.delete(k);
                        k.nearBalls.delete(j)
                    });
                    {
                        time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                    }
                }
                if (amount === 6) {
                    continue;
                }
                for (let n = i + 1, k = this.#elemsInSystem[n]; n < this.#elemsInSystem.length; n++, k = this.#elemsInSystem[n]) {
                    if (j.nearBalls.has(k)) continue;
                    let time2 = this.findSmallestCircleTime(j, k);
                    if (time2.t < smallest && !reverse) {
                        time = new Shoot(0, "o");
                        const cords = [[j.x, j.y], [k.x, k.y]];
                        j.move(time2.t);
                        k.move(time2.t);
                        if (time2.type === "b") {
                            this.createCircleVector(j, k);
                        }
                        else if (time2.type === "bp") {
                            this.createBallPointVector(time2.data.cr, time2.data.sp);
                        }
                        j.x = cords[0][0];
                        j.y = cords[0][1];
                        k.x = cords[1][0];
                        k.y = cords[1][1];

                        if (time2.data.l < 2.1 * k.radius) {
                            amount++
                            if (amount === 6) {
                                continue main;
                            }
                        }
                    }
                    {
                        time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                    }
                }

                if (j.fixed) continue;

                for (let n = 0, k = this.#linesInSystem[n]; n < this.#linesInSystem.length; n++, k = this.#linesInSystem[n]) {

                    let time2 = this.findSmallestLineCircleTime(j, k);
                    if (time2.t < smallest && !reverse) {
                        time = new Shoot(0, "o");
                        const cords = [j.x, j.y];
                        j.move(time2.t);
                        if (time2.type === "bl") {
                            this.createLineCircleVector(j, k);
                        } else this.createBallPointVector(j, time2.data.sp);
                        [j.x, j.y] = cords;
                    }


                    time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                }

                for (let r of this.#flexLinesInSystem) {

                    let time3 = this.findSmallestFlexLinesCircleTime(j, r);

                    if (time3 <= time.t) {
                        for (let n = 0, k = r.lines[n]; n < r.lines.length; n++, k = r.lines[n]) {

                            let time2 = this.findSmallestLineCircleTime(j, k);
                            if (time2.t < smallest) {
                                time = new Shoot(0, "o");
                                const cords = [j.x, j.y];
                                j.move(time2.t);
                                if (time2.type === "bl") {
                                    this.createLineCircleVector(j, k);
                                } else this.createBallPointVector(j, time2.data.sp);
                                [j.x, j.y] = cords;
                            }
                            time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                        }
                    }
                }
            }
            time.t = normalize(time.t);
            return time;
        }

        findSmallestFlexLinesCircleTime(ball, fl) {
            const x1 = fl.x1 - ball.radius - lineWidth / 2;
            const x2 = fl.x2 + ball.radius + lineWidth / 2;
            const y1 = fl.y1 - ball.radius - lineWidth / 2;
            const y2 = fl.y2 + ball.radius + lineWidth / 2;
            if (ball.x > x1 && ball.y > y1 && ball.x < x2 && ball.y < y2) return -Infinity;
            else {
                let tx1 = Math.max((x1 - ball.x) / ball.vector[0], 0);
                let tx2 = Math.max((x2 - ball.x) / ball.vector[0], 0);
                let ty1 = Math.max((y1 - ball.y) / ball.vector[1], 0);
                let ty2 = Math.max((y2 - ball.y) / ball.vector[1], 0);

                if (tx1 < tx2) {
                    const a = tx2;
                    tx2 = tx1;
                    tx1 = a;
                }
                if (ty1 < ty2) {
                    const a = ty2;
                    ty2 = ty1;
                    ty1 = a;
                }
                if (tx1 >= ty1 && tx1 < ty2) return tx1;
                if (ty1 >= tx1 && ty1 < tx2) return ty1;
            }

            return Infinity;
        }

        findSpot(fixed, main, time) {
            const cords = [main.x, main.y];
            main.move(time);
            const result = Math.atan(-(main.y - fixed.y) / (main.x - fixed.x)) + (main.x - fixed.x > 0 ? 0 : Math.PI);
            main.x = cords[0];
            main.y = cords[1];
            return result < 0 ? result + 2 * Math.PI : result;
        }

        findSmallestCircleTime(main, nomain, time) {
            if (main.fixed && nomain.fixed) return new Shoot(Infinity, "b", null, {main, nomain});
            const v1 = main.vector;
            const v2 = nomain.vector;
            const x1 = main.x;
            const x2 = nomain.x;
            const y1 = main.y;
            const y2 = nomain.y;
            const a = Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2);
            const b = 2 * ((x1 - x2) * (v1[0] - v2[0]) + (y1 - y2) * (v1[1] - v2[1]));
            let l = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            let t = Infinity;
            if (l > main.radius + nomain.radius) {
                l = l - lineWidth;
                var c = l * l - Math.pow((main.width + nomain.width) / 2, 2);
                var d = Math.pow(b, 2) - 4 * a * c;
                if (d > 0) {
                    const t1 = (-b + Math.sqrt(d)) / 2 / a;
                    const t2 = (-b - Math.sqrt(d)) / 2 / a;
                    if (t1 * t2 < 0) {
                        t = Infinity;
                    }
                    if (t1 >= 0 && t2 >= 0) {
                        t = Math.min(t1, t2);
                        if (main.fixed && main.angles) {
                            const a = this.findSpot(main, nomain, t);
                            if (!((a > main.angles[0] && a < main.angles[1] && main.angles[0] < main.angles[1]) || (main.angles[0] >= main.angles[1] && (a > main.angles[0] || a < main.angles[1])))) t = Infinity;
                        } else if (nomain.fixed && nomain.angles) {
                            const a = this.findSpot(nomain, main, t);
                            if (!((a > nomain.angles[0] && a < nomain.angles[1] && nomain.angles[0] < nomain.angles[1]) || (nomain.angles[0] >= nomain.angles[1] && (a > nomain.angles[0] || a < nomain.angles[1])))) t = Infinity;
                        }
                    }
                }
            } else if (l < Math.abs((main.width - nomain.width) / 2)) {
                c = l*l-Math.pow(Math.abs((main.width - nomain.width)/2)-lineWidth, 2);
                d = Math.pow(b, 2) - 4 * a * c;
                if (d > 0) {
                    const t1 = (-b + Math.sqrt(d)) / 2 / a;
                    const t2 = (-b - Math.sqrt(d)) / 2 / a;

                    if (t1 * t2 > 0) {
                        t = Infinity;
                    } else if ((t1 >= 0 && t2 < 0) || (t1 < 0 && t2 >= 0)) {
                        t = Math.min(Math.max(t1, t2), t);
                        if (main.fixed && main.angles) {
                            const a = this.findSpot(main, nomain, t);

                            if (!((a > main.angles[0] && a < main.angles[1] && main.angles[0] < main.angles[1]) || (main.angles[0] >= main.angles[1] && (a > main.angles[0] || a < main.angles[1])))) t = Infinity;
                        } else if (nomain.fixed && nomain.angles) {
                            const a = this.findSpot(nomain, main, t);
                            if (!((a > nomain.angles[0] && a < nomain.angles[1] && nomain.angles[0] < nomain.angles[1]) || (nomain.angles[0] >= nomain.angles[1] && (a > nomain.angles[0] || a < nomain.angles[1])))) t = Infinity;
                        }
                    }
                }
            }

            if (main.fixed && main.angles) {
                const sp1 = {
                    x: Math.cos(main.angles[0]) * main.radius + main.x,
                    y: -Math.sin(main.angles[0]) * main.radius + main.y
                };
                const sp2 = {
                    x: Math.cos(main.angles[1]) * main.radius + main.x,
                    y: -Math.sin(main.angles[1]) * main.radius + main.y
                };

                const t3 = this.findSmallestCircleSpotTime(nomain, sp1);
                const t4 = this.findSmallestCircleSpotTime(nomain, sp2);
                const t5 = t3.t < t4.t ? t3 : t4;
                if (t5.t < t) {

                    return t5;
                }
            } else if (nomain.fixed && nomain.angles) {
                const sp1 = {
                    x: Math.cos(nomain.angles[0]) * nomain.radius + nomain.x,
                    y: -Math.sin(nomain.angles[0]) * nomain.radius + nomain.y
                };
                const sp2 = {
                    x: Math.cos(nomain.angles[1]) * nomain.radius + nomain.x,
                    y: -Math.sin(nomain.angles[1]) * nomain.radius + nomain.y
                };

                const t3 = this.findSmallestCircleSpotTime(main, sp1);
                const t4 = this.findSmallestCircleSpotTime(main, sp2);
                const t5 = t3.t < t4.t ? t3 : t4;
                if (t5.t < t) return t5;
            }

            return new Shoot(t, "b", null, {main, nomain, l});
        }

        findSmallestLineCircleTime(cr, ln) {
            const k = ln.k;
            let b = ln.b;
            let x1 = cr.x;
            const y1 = cr.y;
            const vx = cr.vector[0];
            const vy = cr.vector[1];
            const r = cr.radius+lineWidth;
            const a = (vx*k-vy)/(k+1/k);
            const c = (vy/k-vx)/(k+1/k);
            const d = (y1/k-x1-b/k)/(k+1/k);
            b = (k*x1-y1+b)/(k+1/k);
            const time1 = (-2*a*b-2*c*d-Math.sqrt(Math.pow(-2*a*b-2*c*d, 2)-4*(a*a+c*c)*(b*b+d*d-r*r)))/(2*(a*a+c*c));
            const time2 = (-2*a*b-2*c*d+Math.sqrt(Math.pow(-2*a*b-2*c*d, 2)-4*(a*a+c*c)*(b*b+d*d-r*r)))/(2*(a*a+c*c));
            if (time1 >= 0 && time2 >= 0) {
                const t = normalize(Math.min(time1, time2));
                b = ln.b;
                let x3 = x1+vx*t;
                let y3 = y1+vy*t;
                let k2 = -1/k;
                let b2 = y3-k2*x3;
                let x = (b-b2)/(k2-k);
                if (ln.isInRange(x)) return new Shoot(t, "bl", null, {cr, ln});
                {
                    const time1 = this.findSmallestCircleSpotTime(cr, {x: ln.x1, y: ln.y1});
                    const time2 = this.findSmallestCircleSpotTime(cr, {x: ln.x2, y: ln.y2});

                    return time1.t < time2.t ? time1 : time2;
                }
            }
            else {
                const time1 = this.findSmallestCircleSpotTime(cr, {x: ln.x1, y: ln.y1});
                const time2 = this.findSmallestCircleSpotTime(cr, {x: ln.x2, y: ln.y2});

                return time1.t < time2.t ? time1 : time2;
            }
            return new Shoot(Infinity, "bl", null, {cr, ln});
        }

        findSmallestCircleSpotTime(cr, sp, r2 = lineWidth / 2) {
            const x1 = cr.x;
            const y1 = cr.y;
            const x2 = sp.x;
            const y2 = sp.y;
            const vx = cr.vector[0];
            const vy = cr.vector[1];
            const r = cr.radius;
            const a = vy * vy + vx * vx;
            const b = 2 * ((x1 - x2) * vx + (y1 - y2) * vy);
            const l = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) - lineWidth;
            const c = l * l - Math.pow((cr.width) / 2, 2);
            const [time1, time2] = qdr(a, b, c);
            if (time1 >= 0 && time2 >= 0) return new Shoot(normalize(Math.min(time1, time2)), "bp", null, {cr, sp});
            else return new Shoot(Infinity, "bp", null, {cr, sp});
        }

        createBallPointVector(cr, sp) {
            const x1 = cr.x;
            const x2 = sp.x;
            const y1 = cr.y;
            const y2 = sp.y;
            const k1 = (y1 - y2) / (x1 - x2);
            const k2 = -1 / k1;
            this.createLineCircleVector(cr, {k: k2});
        }

        get airLines() {
            return this.#airLines;
        }

        get gravitySpots() {
            return this.#gravitySpots;
        }
    }

    class tnt extends Circle {
        #f = 1;
        #rboom = 50;
        boombastick = true;
        exploded = false;
        #explodeTime;

        constructor(obj, pitch) {
            super(obj, pitch);
            this.f = obj.f;
            this.rboom = obj.rboom;
            this.parentElement.clickable.add(this);
        }

        remove() {
            super.remove();
            this.parentElement.clickable.delete(this);
        }

        get explodeTime() {
            return this.#explodeTime;
        }

        set explodeTime(a) {
            this.#explodeTime = a;
        }

        set f(a) {
            this.#f = a;
        }

        get f() {
            return this.#f;
        }

        set rboom(s) {
            this.#rboom = s;
        }

        get rboom() {
            return this.#rboom;
        }

        explodeStart() {
            if (!isNaN(Number(this.explodeTime))) return;
            this.explodeTime = 3;
        }

        explode() {
            if (this.exploded) return;
            const e = this.parentElement.elemsInSystem;
            const m = this.mass;
            const getGravity = this.parentElement.getGravity.bind(this.parentElement);
            this.remove();
            this.mass = -this.#f * 10000000;
            this.exploded = true;
            const gr = {
                handler: this,
            }
            for (let i = 0, j = e[i]; i < e.length; i++, j = e[i]) {
                if (j === this) continue;
                if (j.boombastick && Math.sqrt(Math.pow(gr.handler.x - j.x, 2) + Math.pow(gr.handler.y - j.y, 2)) - gr.handler.radius - j.radius < j.rboom) {
                    j.explodeStart();

                }
                {
                    const a = getGravity(gr, j);
                    j.vector = [j.vector[0] + a[0], j.vector[1] + a[1]];
                }
            }
            this.mass = m;
        }

        renderCanvas(con, a, time = 0) {
            if (!this.explodeTime) super.renderCanvas(con);
            else {
                this.boombastick = false;
                super.renderCanvas(con);
                this.boombastick = true;
                this.explodeTime = this.explodeTime - time;

                con.beginPath();
                con.strokeStyle = con.fillStyle = this.main ? mainBallColor : ballColor;
                con.lineWidth = lineWidth;
                con.shadowBlur = blur;
                con.shadowColor = this.main ? mainBallColorShadowColor : ballShadowColor;
                con.arc(this.x, this.y, this.radius - lineWidth, -Math.PI / 2, Math.PI * 2 * (this.explodeTime / 3) - Math.PI / 2);
                con.lineTo(this.x, this.y);
                con.fill();
                con.closePath();
                if (this.explodeTime <= 0) this.explode();
            }
        }
    }

    class airLine {
        linesIn = [];

        fn1(x1, y1, l, k2, b2) {
            const a = k2 ** 2 + 1;
            const b = -2 * x1 + 2 * k2 * b2 - 2 * k2 * y1;
            const c = y1 ** 2 - 2 * b2 * y1 - l ** 2 + b2 ** 2 + x1 ** 2;
            const arr = qdr(a, b, c);
            const x2 = this.y1 <= this.y2 ? arr[0] : arr[1];
            const y2 = k2 * x2 + b2;
            return [x2, y2];
        }

        set lines(a) {
            this.linesIn = a;
        }

        get lines() {
            return this.linesIn;
        }

        remove() {
            this.parentElement.removeAirLine(this);
        }

        main() {
            Line.prototype.main.call(this);
            if (this.x1 === this.x2 || this.y1 === this.y2) return;
            const k = -1 / this.k;
            {
                const x1 = this.x1;
                const y1 = this.y1;
                const b = y1 - k * x1;
                {
                    [this.x3, this.y3] = this.fn1(x1, y1, this.length, k, b);
                    [this.fakeX1, this.fakeY1] = this.fn1(x1, y1, lineWidth / 2, k, b);
                    if (Math.abs(Math.round(Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2))) - Math.round(this.length)) > 1) {
                        if (Math.round(this.k) === 0) {
                            if (this.x1 < this.x2) {
                                this.y3 = this.y1 - this.length;
                                this.x3 = this.x1;
                            } else {
                                this.y3 = this.y1 + this.length;
                                this.x3 = this.x1;
                            }
                        } else {
                            if (this.y1 > this.y2) {
                                this.y3 = this.y1;
                                this.x3 = this.x1 + this.length;
                            } else {
                                this.y3 = this.y1;
                                this.x3 = this.x1 - this.length;
                            }
                        }
                    }
                }
            }
            {
                const x1 = this.x2;
                const y1 = this.y2;
                const b = y1 - k * x1;
                {
                    [this.x4, this.y4] = this.fn1(x1, y1, this.length, k, b);
                    [this.fakeX2, this.fakeY2] = this.fn1(x1, y1, lineWidth / 2, k, b);
                    if (Math.abs(Math.round(Math.sqrt(Math.pow(this.x2 - this.x4, 2) + Math.pow(this.y2 - this.y4, 2))) - Math.round(this.length)) > 1) {
                        if (Math.round(this.k) === 0) {
                            if (this.x1 < this.x2) {
                                this.y4 = this.y2 - this.length;
                                this.x4 = this.x2;
                            } else {
                                this.y4 = this.y2 + this.length;
                                this.x4 = this.x2;
                            }
                        } else {
                            if (this.y1 > this.y2) {
                                this.y4 = this.y2;
                                this.x4 = this.x2 + this.length;
                            } else {
                                this.y4 = this.y2;
                                this.x4 = this.x2 - this.length;
                            }
                        }
                    }
                }
            }


            this.lines[0] = this.countKB(this.x1, this.y1, this.x3, this.y3);
            this.lines[1] = this.countKB(this.x2, this.y2, this.x4, this.y4);
            this.lines[2] = this.countKB(this.x4, this.y4, this.x3, this.y3);
            this.lines[3] = {k: this.k, b: this.b};


        }

        constructor({x1, x2, y1, y2, length, f}) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.lines = [];
            this.length = length;
            this.f = f;
            this.main();
        }

        countF(ball, time, bol) {
            const {x, y} = ball;
            const [{k: k1, b: b1}, {k: k2, b: b2}, {k: k3, b: b3}, {k: k4, b: b4}] = this.lines;
            if ((k1 * x + b1 - y) * (k2 * x + b2 - y) <= 0 && (k3 * x + b3 - y) * (k4 * x + b4 - y) <= 0) {
                const k = k1;
                const b = y - k * x;
                const x2 = (b4 - b) / (k - k4);
                const y2 = k * x2 + b;
                const r = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
                const sp = {
                    handler:
                        {
                            x: x2,
                            y: y2,
                            mass: -1 * this.f,
                            radius: -Infinity,
                        }
                };
                const gr = Physics.prototype.getGravity(sp, ball, true);
                if (!bol) ball.vector = [ball.vector[0] + gr[0]/ball.mass*time, ball.vector[1] +gr[1]/ball.mass*time];
                return [gr[0]/ball.mass, gr[1]/ball.mass];

            }
            return [0,0];

        }

        countKB(x1, y1, x2, y2) {
            const k = (y1 - y2) / (x1 - x2);
            const b = y1 - k * x1;
            return {k, b};
        }

        renderCanvas(con) {
            con.beginPath();
            con.strokeStyle = lineColor;
            con.lineWidth = lineWidth;
            con.shadowBlur = blur;
            con.shadowColor = lineShadowColor;
            con.lineCap = "round";
            Line.prototype.renderCanvas.call(this, con);
            con.stroke();
            con.closePath();
            con.beginPath();
            con.fillStyle = airColor;
            con.shadowColor = "transparent";
            con.moveTo(this.fakeX1, this.fakeY1);
            con.lineTo(this.fakeX2, this.fakeY2);
            con.lineTo(this.x4, this.y4);
            con.lineTo(this.x3, this.y3);
            con.fill();
            con.closePath();
        }

    }


    function qdr(a, b, c) {
        const d = b * b - 4 * a * c;
        return d > 0 ? [(-b + Math.sqrt(d)) / (2 * a), (-b - Math.sqrt(d)) / (2 * a)] : d === 0 ? [-b / (2 * a), -b / (2 * a)] : [NaN];
    }

    function setSettings(prop, val) {
        window.gameSettings[prop] = val;
        // document.cookie = "gameSettings = "+decodeURIComponent(JSON.stringify(window.gameSettings));
        localStorage.setItem("gameSettings", decodeURIComponent(JSON.stringify(window.gameSettings)));
    }

    function createFromJson(json) {
        const obj = JSON.parse(json);
        const pitch = new Physics(obj);
        pitchIn.innerHTML = '';
        if (pitch) {
            pitch.elem.remove();
            pitch.stop();
        }
        document.getElementById("pitchIn").append(pitch.elem);
        start();
    }

    async function main(event) {
        const text = await navigator.clipboard.readText();
        createFromJson(text);
    }

    function generateRetryPic() {
        const canvasRetry = document.createElement("canvas");
        canvasRetry.resize = () => {
            canvasRetry.width = pitchIn.getBoundingClientRect().width * 0.5;
            canvasRetry.height = canvasRetry.width;
            const con = canvasRetry.getContext("2d");
            con.beginPath();
            con.strokeStyle = con.fillStyle = lineColor;
            con.lineWidth = canvasRetry.width/10;
            con.shadowColor = lineShadowColor;
            con.shadowBlur = blur;
            con.lineCap = "round";
            con.arc(canvasRetry.width / 2, canvasRetry.height / 2, canvasRetry.width / 4, 90 / 180 * Math.PI, 20 / 180 * Math.PI);
            con.stroke();
            con.closePath();
            con.beginPath();
            con.strokeStyle = con.fillStyle = lineColor;
            con.lineWidth = lineWidth * 1.4;
            con.shadowColor = lineShadowColor;
            con.shadowBlur = 0;
            con.lineCap = "square";
            let l = canvasRetry.width / 8;
            const xm = l * Math.cos(-20 / 180 * Math.PI);
            const ym = -l * Math.sin(-20 / 180 * Math.PI);
            con.moveTo(canvasRetry.width / 2 + xm, canvasRetry.width / 2 + ym);
            con.lineTo(canvasRetry.width / 2 + 3 * xm, canvasRetry.width / 2 + 3 * ym);
            con.lineTo(canvasRetry.width / 2 + 2 * xm - l * Math.sin(20 / 180 * Math.PI), canvasRetry.width / 2 + 2 * ym + l * Math.cos(20 / 180 * Math.PI));
            con.fill();
            con.closePath();
        }
        canvasRetry.resize();
        canvasRetry.classList.add("restartAnimation");
        const dark = document.createElement("div");
        dark.classList.add("dark");
        pitchIn.append(canvasRetry);
        pitchIn.append(dark);
        dark.style.animationName = "makeDarker";
        dark.style.animationTimingFunction = "ease-out";
        switchFns.inStart = true;
        setTimeout(()=>{
            dark.style.animationTimingFunction = "";
            removeDark();
        }, 500);
        setTimeout(()=>{
            switchFns.inStart = false;
            canvasRetry.remove();
        }, 900);
    }



    const pitchIn = document.getElementById("pitchIn");
    pitchIn.addEventListener("pointerdown", (event) => {
        if (!pitch) {
            pitch = document.querySelector(".canvasHolder")?.physics;
        }
        if (!pitch) return;
        const x1 = event.pageX - pitch.elem.getBoundingClientRect().left;
        const y1 = event.pageY - pitch.elem.getBoundingClientRect().top;
        let closest = [undefined, Infinity];
        for (const i of pitch.clickable) {
            const ln = Math.sqrt(Math.pow(i.x - x1, 2) + Math.pow(i.y - y1, 2))
            if (closest[1] > ln) closest = [i, ln];
            if (ln <= i.radius+2*lineWidth) {
                if (i.touchRemove) i.remove();
                else if (i.fixedBeforeTouch) {
                    pitch.startDragging(i, event.pageX, event.pageY, event.pointerId);
                }
                else if (i.boombastick) i.explodeStart();
                return;
            }
        }
        if (closest[0] && (closest[1] < Math.sqrt(pitch.width*pitch.height/200) || closest[1] < closest[0].radius*1.25)) {
            const i = closest[0];
            if (i.touchRemove) i.remove();
            else if (i.fixedBeforeTouch) {
                pitch.startDragging(i, event.pageX, event.pageY, event.pointerId);
            }
            else if (i.boombastick) i.explodeStart();
        }

    });

    function removeDark() {
        document.querySelector(".dark").style.animationName = "removeCan";
        setTimeout(() => document.querySelector(".dark").remove(), 500);
    }

    function restartLvl(bol){
        pages.canvasClose(true);
        window.requestAnimationFrame(()=>pages.openLevel(levels[actualLevel], bol));
    }

    const switchFns = {
        level(lvl) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            if ((!(new Set(availableLevels)).has(String(lvl)) && gameMode !== "test") || !levels[lvl]) return;
            this.lvlStatus = "main";
            actualLevel = lvl;
            pages.lvls.close(true);
            pages.openLevel(levels[lvl]);
            removeDark();
        },
        bonusLevel(lvl) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            if (!levels[lvl]) return;
            this.lvlStatus = "bonus";
            actualLevel = lvl;
            pages.info.close(true);
            setTimeout(()=> {
                pages.home.canvases.forEach(i => canvases.delete(i));
                pages.canvasClose(true);
                window.requestAnimationFrame(()=>{
                    pages.openLevel(levels[lvl]);
                    removeDark();
                });
            }, 500);
        },
        menu(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            pages.lvlCleared.close();
            pages.canvasClose();
            if (this.lvlStatus === "main") setTimeout(() => pages.lvls.open(), 500);
            else if (this.lvlStatus === "bonus") setTimeout(()=>{
                window.requestAnimationFrame(()=>{
                    pages.home.open();
                    pages.info.open(true);
                });
            }, 500);
        },
        retry(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            el.firstElementChild.style.transform = "rotate(0deg)";
            el.firstElementChild.style.transition = "transform 0.4s ease 0s";
            el.firstElementChild.style.transform = "rotate(360deg)";
            pages.lvlCleared.close();
            restartLvl();
            removeDark();

        },
        next(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            pages.lvlCleared.close();
            pages.canvasClose(true);
            window.requestAnimationFrame(()=>{pages.openLevel(levels[String(Number(actualLevel) + 1)]); actualLevel = String(Number(actualLevel) + 1);});
            removeDark();
        },
        start(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            if (document.getElementById("secretStyle")) document.getElementById("secretStyle").remove();
            pages.home.close();
            setTimeout(() => {
                pages.lvls.open();
            }, 500);
        },
        info(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            if (document.getElementById("secretStyle")) document.getElementById("secretStyle").remove();
            pages.info.open();
        },
        closeInfo() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            pages.info.close();
        },
        closeLvls() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            pages.lvls.close();
            setTimeout(() => {
                pages.home.open();
                document.getElementById("home").style.animationDelay = "0.5s";
            }, 0);
            setTimeout(()=>{
                document.getElementById("home").style.animationDelay = "";
            }, 1000);
        },
        pause() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 0);
            if (pitch?.cleared) return;
            stop();
            pages.lvlPause.open(String(actualLevel));
        },
        continue() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 500);
            setTimeout(() => start(), 500);
            pages.lvlPause.close();
        },
        settings() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.lvls.close(false, true);
            setTimeout(()=>{
                pages.settings.open();
            }, 500);
        },
        closeSettings() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.settings.close();
            setTimeout(()=>{
                pages.lvls.open(true);
            }, 500);
        },
        refreshProgress(){
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.settings.close();
            setTimeout(()=>{
                pages.refreshConfirmation.open();
            }, 500);
        },
        refreshConfirmationYes(el) {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 5900);
            window.passedLevels = [...window._all.passedLevels];
            window.availableLevels = [...window._all.alwaysAvailable];
            window.playerInfo.levelsData = {};
            localStorage.setItem("levelsData", "");
            localStorage.setItem("passedLevels", passedLevels.join(","));
            localStorage.setItem("availableLevels", availableLevels.join(","));
            setTimeout(()=>{
                const amount = el.children.length;
                const arr1 = [];
                for (let i = 1; i < amount+1; i++) arr1.push(i);
                const arr2 = [];
                for (let i = 1; i < amount+1; i++) arr2.push(i);
                const slots = [new Set(arr1), new Set(arr2)];
                const interval = setInterval(function fn(){
                    let num = randomInteger(-1, 1);
                    if (slots[0].size === 0) num = 1;
                    else if (slots[1].size === 0) num = 0;
                    if (slots[0].size + slots[1].size === 0) {
                        clearInterval(interval);
                        return;
                    }
                    const num2 = randomInteger(-1, slots[num].size-1);
                    el.querySelector(`span:nth-of-type(${[...slots[num]][num2]})`).innerHTML = (Math.round(Math.random()*10000))%2;
                    slots[num].delete([...slots[num]][num2]);
                }, 1500/(amount+1));
            }, 700);
            setTimeout(()=>{
                pages.refreshConfirmation.close();
                setTimeout(()=>{
                    pages.settings.open();
                }, 500);
            }, 5000);
        },
        refreshConfirmationClose() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.refreshConfirmation.close();
            setTimeout(()=>{
                pages.settings.open();
            }, 500);
        },
        autoRestartSet(el) {
            el.classList.remove("active"+window.gameSettings.autoRestart);
            setSettings("autoRestart", (window.gameSettings.autoRestart+1)%2);
            el.classList.add("active"+window.gameSettings.autoRestart);
        },
        autoContinueSet(el) {
            el.classList.remove("active"+window.gameSettings.autoContinue);
            setSettings("autoContinue", (window.gameSettings.autoContinue+1)%2);
            el.classList.add("active"+window.gameSettings.autoContinue);
        },
        progressSaveSet(el) {
            el.classList.remove("active"+window.gameSettings.saveProgress);
            setSettings("saveProgress", (window.gameSettings.saveProgress+1)%2);
            el.classList.add("active"+window.gameSettings.saveProgress);
            if (window.gameSettings.saveProgress) {
                // document.cookie = "passedLevels = " + passedLevels.join(",");
                // document.cookie = "availableLevels = " + availableLevels.join(",");
                localStorage.setItem("passedLevels", passedLevels.join(","));
                localStorage.setItem("availableLevels", availableLevels.join(","));
            }
        },
        languageChose(){
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.settings.close();
            setTimeout(()=>{
                pages.languageChose.open();
            }, 500);
        },
        languageChoseBack() {
            if (this.inStart) return;
            this.inStart = true;
            setTimeout(()=>this.inStart = false, 900);
            pages.languageChose.close();
            setTimeout(()=>{
                pages.settings.open();
            }, 500);
        },
        lan(ln, el) {
            document.querySelectorAll(`.languages [data-link]:not(.closeBar)`).forEach(i=> {
                i.classList.remove("active1");
                i.classList.add("active0");
            });
            el.classList.add("active1");
            el.classList.remove("active0");
            setSettings("language", ln);
            document.querySelector(".languages .levelsTxtTop").innerHTML = trl("languageChosing");
        },
        slideTo(num, el, time){
            if (this.inStart || num == this.slide || this.isDragging) return;
            this.inStart = true;
            this.stopDragging();
            num = Number(num);
            const time2 = 400 + (Math.abs(this.slide - num) - 1)*230;

            createAnimation(num*100, time2);

            setTimeout(()=>{
                document.querySelector(".activePoint")?.classList?.remove("activePoint");
                el.classList.add("activePoint");
                el.style.transform = "";
            }, time);
            this.basis = this.slider.getBoundingClientRect().width/2+this.slider.getBoundingClientRect().x;
            this.width = this.slider.getBoundingClientRect().width;
            this.slide = this.actualButton = num;
        },
        stopDragging(){}
    }

    const shape2 = [[1, Math.PI/3], [1, Math.PI*2/3], [1, Math.PI*4/3], [1, Math.PI*5/3]];
    const shape1 = [[0.6655493770658406,2.452136742742777],[0.6756598841523511,2.6080414134220327],[0.6879663879970662,2.710722755012397],[0.70134931489481,2.8115577404430345],[0.7253248929942102,2.923949072990644],[0.7468203406980214,3.013747768324013],[0.7652298843540765,3.083155867851689],[0.7809776015361931,3.1368729458846727],[0.7989773577978109,3.1933944442585886],[0.8176269137927761,3.2506383140331314],[0.8297479481117622,3.290782591008438],[0.8581080475697972,3.380063388708961],[0.8695214042517633,3.431075501542053],[0.8819687930650846,3.4794478539680607],[0.8885343941837511,3.525227254596597],[0.8949121042056984,3.563731962955895],[0.8996882808557335,3.631578388621959],[0.8998525302439029,3.689431975447129],[0.8962498964513996,3.763342900826688],[0.8878654471951025,3.8280910006266207],[0.8788275854882374,3.8785336073787797],[0.8674417872265309,3.93062665931649],[0.8507702415313688,3.984492864083691],[0.837542351551072,4.022375704266802],[0.8132810049014358,4.086015053687526],[0.7811415642041988,4.1509244141769726],[0.7607979903280501,4.194821663622664],[0.7365132805859833,4.239700508259465],[0.7104619048618084,4.280404498276765],[0.6818660658825272,4.327004626707283],[0.6544267052464918,4.365286675844213],[0.6188216212199783,4.413923788584296],[0.5682872910272668,4.471487238880858],[0.5270255995016428,4.520791462996806],[0.4906045663543382,4.568257925465531],[0.45629773590303957,4.615338647708614],[0.4255853492133578,4.655944963593999],[0.4034373328770499,4.689416125705275],[0.3854700575244294,4.711757910678751],[0.40468055028567146,-1.538506364828794],[0.43286289836952363,-1.497226028015148],[0.4600124215969676,-1.4601976818051945],[0.4882533923957831,-1.4204878544749306],[0.520170474783194,-1.3882867107673549],[0.5491372387535938,-1.3459629239909976],[0.5711691272146463,-1.3221503707233815],[0.6103926972805916,-1.2724419803215044],[0.6363078579943277,-1.2401164850653903],[0.6580085097870102,-1.20883603532391],[0.6757949154417315,-1.1846741489405597],[0.7024136094392114,-1.1443378496878034],[0.729992058923475,-1.1002758465833797],[0.7546046474799554,-1.0573398300445929],[0.7747934436981451,-1.0221439476488177],[0.7978491663736335,-0.9756480658614056],[0.8214566954259575,-0.9228102227836553],[0.8380939822518371,-0.877215238011685],[0.8516613221461103,-0.8377662654427309],[0.861625852069629,-0.8000698206699304],[0.8734717285736368,-0.7543214690695624],[0.8813599271774861,-0.7143001284490302],[0.8905399782813802,-0.6725743932830452],[0.8952081664985829,-0.640283799824146],[0.8984678603934663,-0.6088074002179089],[0.8994965002014473,-0.5782638487342828],[0.9008456340814611,-0.5384852654608409],[0.9002087271023438,-0.5058240346316417],[0.8973115922650232,-0.46764749071750306],[0.8964159552862732,-0.4316974158705416],[0.8926867310045584,-0.40063338663663145],[0.8857615552825379,-0.3623922466355828],[0.8805561704734054,-0.3314286618532248],[0.8711597300686537,-0.29468531006315696],[0.8609736015796405,-0.2613250463909625],[0.8485540905767628,-0.21391754570750676],[0.8315444574649018,-0.15585602195495168],[0.8149102909408927,-0.10356027621648531],[0.7994171753858064,-0.05963394376706681],[0.7781955741020986,0.01722106838952935],[0.7619418810879273,0.07412614572062207],[0.7443418724112741,0.13351628136842403],[0.7288107890412064,0.19817351598169528],[0.7092146693192312,0.3021288976920775],[0.6888232646924843,0.41374680396798097],[0.6648682210386287,0.6521504885206038],[1,1.5678124779000964]];
    const shape3 = [[0.9877575319503975,-1.5591034859607507],[0.7280700207907034,0.008812932819662047],[1,1.5688146093363025],[0.7059111681050281,3.072929883547948]];
    const shape4 = [[1,3.4405955455326303],[0.37373504505725386,4.048446103283137],[0.9560265143368478,4.705311164253148],[0.37260830467190537,-0.9209925450552533],[0.9982620117420731,-0.3008637000337348],[0.3771786834855133,0.28399508468207424],[0.9738515140366668,0.9112762098201636],[0.36202946813066694,1.5722546092199479],[0.9732426021128109,2.221386886341876],[0.38429532524439575,2.8132280386658657]];
    let shape5 = [[0.27305140593168326,2.607863805759686],[0.48620039959657724,2.6133054523391914],[0.6445594139579122,2.2803655151181084],[0.7138196315286349,2.3852032385264668],[0.5965159044805657,2.6186077709185405],[0.6961299057327716,2.6152496132649037],[0.7746075769891443,2.4623307008335553],[0.8581590984171386,2.5334612612981666],[0.809740964562815,2.6195302294155467],[0.9964533251515117,2.6163977909113876],[1,2.7170175330105417],[0.8138387455070217,2.735714245713245],[0.8707688961338935,2.810464849621813],[0.7961580819155146,2.894632878192024],[0.7025527183410398,2.7548651217575877],[0.6058218817466788,2.7723090739073104],[0.7443689370766811,2.973366888746079],[0.6816311654313122,3.087487002270392],[0.4946549682477228,2.81197646976792],[0.2934508656513883,2.937390000717923],[0.4517133294406553,3.0063779573268996],[0.4496641576778786,3.2313924496938067],[0.28596465735356424,3.275247089146417],[0.4918348066871086,3.427152483566675],[0.6806238460482411,3.165286280913453],[0.7404546936035377,3.2825604475524606],[0.5996032181122308,3.474045115927417],[0.6969872936055536,3.4955593361875876],[0.7913647164570827,3.359865275657361],[0.8644213411956279,3.4499854942045083],[0.8078717326726655,3.5251709727161855],[0.9920786916419304,3.5448710262460863],[0.9847837875238179,3.646852223292389],[0.7980895020630838,3.6417901428881994],[0.8455024287613555,3.7292098927955504],[0.7613464926832939,3.7999888435715468],[0.6856756129656091,3.6387376477166646],[0.5881100269226718,3.6346170530213957],[0.6977702285205704,3.8754141221560476],[0.6277780556398953,3.9823973429610215],[0.4741022437986583,3.627827078552702],[0.2636859265921316,3.5941586346203023],[0.41051439209053475,3.8090873493607926],[0.38152419727319564,4.058626044608204],[0.22239903557807397,3.9473772349457947],[0.40366313985608665,4.313180159679619],[0.6212771812904104,4.06439147092293],[0.6627817972583689,4.207905070107981],[0.5073177825132954,4.403730980907291],[0.6022034514583665,4.44765533921516],[0.709214360718479,4.30364652769839],[0.7737873738849218,4.413792534390606],[0.7080179511469932,4.492793336334223],[0.8937547849678493,4.536156717776144],[0.8804976718817145,4.645399539950723],[0.693962289566953,4.627233991562455],[0.7347047042082326,-1.5531517169547644],[0.6541727793531322,-1.4754390883846695],[0.5849324357866564,4.6091496617209256],[0.4866892563774858,4.589441066618821],[0.5873106636148424,-1.3915020919879986],[0.515358769827939,-1.2628345192120705],[0.37521779237113856,4.549264976560464],[0.17632090399247463,4.362521859047684],[0.307000773744447,-1.5144863473456311],[0.27370014092789,-1.1891016535543704],[0.11786792706101197,-1.394091043161587],[0.3019510182191002,-0.8365595817261452],[0.5075914796104674,-1.1606271168741777],[0.5569434022071279,-0.9960027055552814],[0.40928689895347925,-0.7427751295078417],[0.5060801795862606,-0.7024011736043975],[0.6069814965598728,-0.882297978578473],[0.6749581321851814,-0.7662985254054071],[0.6157541560048977,-0.6650314011130476],[0.805023404447871,-0.6355245962391263],[0.796356721301137,-0.5067548427020228],[0.609053539306519,-0.5138226865281272],[0.6578818986727718,-0.40275518657138615],[0.581051127650217,-0.30196325021535886],[0.49848276672651576,-0.5122265217789348],[0.4003434006869885,-0.5066290496462869],[0.5241671763768578,-0.19124949978190453],[0.4622217533707842,-0.030439931223299934],[0.28645144253207633,-0.5075943947988788],[0.07702253931628722,-0.4844432039649037],[0.2326305789498343,-0.16466377967107979],[0.23680575075389387,0.26743606292561606],[0.09001561541328468,0.7532104949488214],[0.3022886395388377,0.5705103592169103],[0.46532408530230396,0.08758037232169093],[0.5317273872209478,0.24423762691446643],[0.41151909498301564,0.5640455612842228],[0.509851782491719,0.5474331281968073],[0.5888710494362125,0.34103336406819795],[0.6699125728578719,0.4344054080154313],[0.6201748468723126,0.5472217709715416],[0.8077963039247963,0.5357460655512716],[0.8169522880936709,0.6616255275347227],[0.629184369307433,0.6997785363985104],[0.6885707469790061,0.789228427309431],[0.6225984959185066,0.903855828598868],[0.519958912044191,0.7341531357100253],[0.42268914610331665,0.7856685558915166],[0.5747513249067865,1.0167850208014246],[0.5291402933183794,1.18735474327907],[0.31780569368118805,0.8856479323156372],[0.14149083893396616,1.45002501109805],[0.29900557540229816,1.211201598572725],[0.32900287929544864,1.5261638150211243],[0.19203800287561473,1.905248251542774],[0.39979483975577723,1.7231032780027933],[0.5380914457793423,1.280092946518254],[0.6098665076596979,1.4026630896976389],[0.5087520461279048,1.696949646338605],[0.6076325618161948,1.6686489958532391],[0.676206569875834,1.4809615549798214],[0.7639700335005118,1.5591792697157352],[0.720194868331258,1.659476899513399],[0.9042485353607034,1.6367546421614472],[0.9162131391312462,1.748314174209371],[0.7301930168515568,1.7873593209473615],[0.792506469101243,1.8654577171851243],[0.7270959254014009,1.9644317516868426],[0.6237296385993353,1.8288352438060773],[0.530240793936678,1.8710585749269748],[0.6816483925483486,2.0606713942766346],[0.6332638742796257,2.2004384037545406],[0.42630324316710916,1.9521262689406969],[0.23866961240235357,2.2792955521312797],[0.40023466700815963,2.191612734625362],[0.4234297308238301,2.4324863966130663],[0.2741209710149196,2.6045586915405363],[0.19768833541633365,2.850510414706396],[0.1519916654588405,2.377327674357036],[0.06601433547305738,1.9885369902221226],[0.04396919417131415,4.1250210965034215],[0.13799331381774424,3.808118646968853],[0.19506573853056858,3.323210504993876],[0.19536565529337416,2.8695330631566374],[0.2773982614614611,2.5968607276829774]];
    const shapes = [shape1, shape2, shape3, shape4];
    const shape6 = [[0.7560398219881603,1.5012682289019328],[0.8256288613736055,1.5443481830615178],[0.8734772015321681,1.5990166971917028],[0.9269371890812281,1.6754515297623134],[0.9555312278438525,1.7507176042868438],[0.9772484138660255,1.8394428086770374],[0.9981916476678769,1.9340340957521762],[1,1.9988412844519756],[0.9904281300525959,2.0470694957636577],[0.9732168521462777,2.1008852611600872],[0.9383446633278032,2.148492902313074],[0.8814470557912019,2.2023289975961493],[0.8149570356636006,2.2546047375103635],[0.7623245649026722,2.279553359831442],[0.6807951994210033,2.2850354074237136],[0.5965537545715266,2.2654568991986155],[0.5312092096877973,2.1834764790389523],[0.4940261919243182,2.0817056714967883],[0.4566608029170952,2.0475626769270137],[0.40526626896888457,2.0587244383357097],[0.32561891384060915,2.142169778406079],[0.25573218373670886,2.330318276676052],[0.20106603267202813,2.6378574255436282],[0.1762670373701115,3.1863200388996256],[0.23554010385015922,3.8677636852454995],[0.2770067640431196,3.99087300163593],[0.29739537470423794,3.924474599280789],[0.31077954675082553,3.8823674084949893],[0.35168989066001166,3.8885697470593614],[0.4052478658856251,4.002674439630753],[0.4762653764670056,4.138950500923121],[0.528908804343157,4.246763367511465],[0.5852690210402467,4.34950262571822],[0.6142636246160442,4.453906838255057],[0.6440824886217261,4.567159318189741],[0.6546126917090878,4.642988059198014],[0.6563254879095982,-1.5680806717403188],[0.6465679284750286,-1.4804367082671037],[0.627927934031741,-1.3849171068414203],[0.6105098089378298,-1.3183275399778667],[0.5684063125846348,-1.2204095452337909],[0.5294459994011773,-1.1173582059083482],[0.47689587429882996,-1.0276727770307708],[0.4208326254646077,-0.9132123877558026],[0.3818442032905611,-0.8111869145223158],[0.34302272964086433,-0.743822502706102],[0.32343431575676485,-0.7436187111912249],[0.30220771404051205,-0.7928266726537884],[0.2893272453857888,-0.8595182056288053],[0.26477076692408386,-0.8331652254655869],[0.2234506495319052,-0.5780471802437225],[0.19732305861174163,-0.3225539104676818],[0.18564102197932003,0.04877474268068588],[0.20576532066048075,0.46951885683188693],[0.3025337816628392,0.912013770918793],[0.37975993642312417,1.0645668051887993],[0.42097385037124707,1.1003440890930687],[0.4491443782922821,1.0806639273222298],[0.4691003104545163,1.0237384944537182],[0.4896545966794525,0.9940253064704447],[0.5134274177255593,0.91130404584551],[0.5385933955841097,0.8601285773179681],[0.5809686646924437,0.8205214148891147],[0.6171074394533407,0.7947162495863687],[0.6826791241268998,0.7718979450806073],[0.7249996319974478,0.7743701973746525],[0.7836906599109471,0.7797695164371868],[0.8375256419424496,0.8163927040308784],[0.8985882727624566,0.8513657336490965],[0.9419657215696992,0.9032861101867226],[0.9739101808195647,0.9579198381622973],[0.9867845341606873,1.0328162238384961],[0.9836797024016327,1.0933729032885033],[0.9642361456905794,1.1590705538034802],[0.9226125437490629,1.3139427459771444],[0.8819355644402821,1.4042459994649712],[0.8355339969323853,1.4452754846838682],[0.8038924073445195,1.4635439664064855],[0.7557770100243965,1.482318254313921]];
    const atime = 1500;
    const opacityTime = 1000;
    const topTime = 700;
    const gettingKf = 1.1;
    const xPeriod = 1000;
    const aPeriod = 1000;
    const startOpacity = 0.65;
    const noMoveTime = 800;

    function xOfT(k1, k2,k3, k4, k5, k6, k7, k8, t) {
        if (t <= topTime) return -Math.pow(t**2*k1+t*k2, 1/3);
        else if (t >= topTime && t <= k6) return t**2*k3+t*k4+k5;
        else return k7*t+k8;
    }

    class winterConfetti extends HTMLElement {
        snowflakes = new Set();
        occupancy = 4;
        speed = 0.1;
        rAmp = Math.PI/2;
        appearanceTime = 600;

        constructor() {
            super();
            setTimeout(()=>{
                this.id = Math.random();
                this.can = document.createElement("canvas");
                this.con = this.can.getContext("2d");
                this.append(this.can);
                this.style.width = "100vw";
                this.style.height = "100vh";
                this.style.position = "absolute";
                this.style.display = "block";
                this.w = this.can.width = window.innerWidth;
                this.h = this.can.height = window.innerHeight;
                this.amountOfSnowflakes = 80+Math.sqrt(this.w*this.h)/40;
                this.pw = Math.ceil(this.w/Math.sqrt((this.w*this.h/this.amountOfSnowflakes)));
                this.rmax = this.w/this.pw/this.occupancy;
                this.rmin = this.rmax/2;
                this.xAmp = this.w/this.pw/4;
                this.slots = [];
                const color = window.themes.main.colors.lineColor.replaceAll("rgb(", "").replaceAll(")", "").split(",");
                this.col1 = color[0];
                this.col2 = color[1];
                this.col3 = color[2];
                for (let i = 1; i <= this.pw; i++) this.slots[i] = Math.random()*this.w/this.pw/this.speed;
                this.startAnimation();
                canvases.add(this);
                this.rendered = true;
            });
        }

        disconnectedCallback() {
            this.stopAnimation();
        }

        connectedCallback() {
            if (this.rendered) this.resize();
        }

        startAnimation() {
            this.startedTime = performance.now();
            this.fn();
        }

        resize() {
            this.replaceWith(document.createElement("snow-el"));
            canvases.delete(this);
            this.stopAnimation();
            this.snowflakes.clear();
        }

        fn(){
            this.time = performance.now();
            this.animation = window.requestAnimationFrame((t)=>{
                for (let i = 1; i <= this.pw; i++) {
                    this.slots[i] -= (t-this.time);
                    if (this.slots[i] < 0) {
                        this.createSnowflake(i);
                        this.slots[i] = Math.random()*this.w/this.pw/this.speed/4+this.w/this.pw/this.speed*0.8;
                    }
                }
                this.time = performance.now();
                this.render(t);
                this.fn();
            });
        }

        render(t) {
            this.con.clearRect(0,0,this.w, this.h);
            for (const i of this.snowflakes) this.drawSnowflake(t, i);
        }

        drawSnowflake(t, sf) {
            const lifeCycleTime = t - sf.bornTime;
            sf.y = sf.startY + lifeCycleTime*this.speed;
            sf.x = sf.startX + sf.xAmp*Math.sin(lifeCycleTime*Math.PI/sf.xt/2);
            sf.angle = sf.rAmp*Math.sin(lifeCycleTime*Math.PI/sf.rt/2);
            const c = this.con;
            c.beginPath();
            c.fillStyle = `rgba(${this.col1}, ${this.col2}, ${this.col3}, ${Math.min(1, lifeCycleTime/this.appearanceTime)})`;
            c.moveTo(sf.x+shape5[0][0]*Math.cos(shape5[0][1]+sf.angle)*sf.size, sf.y+shape5[0][0]*Math.sin(shape5[0][1]+sf.angle)*sf.size);
            for (let k = 1, i = shape5[k]; k < shape5.length; k++, i = shape5[k]) c.lineTo(sf.x+i[0]*Math.cos(i[1]+sf.angle)*sf.size, sf.y+i[0]*Math.sin(i[1]+sf.angle)*sf.size);
            c.fill();
            c.closePath();
            if (sf.y > this.h+sf.size*2) this.snowflakes.delete(sf);
        }

        stopAnimation() {
            window.cancelAnimationFrame(this.animation);
        }

        createSnowflake(n) {
            const size = this.rmin+(this.rmax-this.rmin)*Math.random();
            const xAmp = this.xAmp/2*Math.random()+this.xAmp/2;
            const rAmp = this.rAmp/2+this.rAmp*Math.random();
            const xm = Math.random()*this.w/this.pw;
            const x = (n-1)*this.w/this.pw+xm;
            const y = this.w/this.pw*Math.random();
            const xt = xAmp/this.speed*5;
            const rt = rAmp/this.speed*100;
            const snowflake = new Snowflake(size, xAmp, rAmp, x, y, xt, rt);
            this.snowflakes.add(snowflake);
        }

    }

    customElements.define("snow-el", winterConfetti);

    class Snowflake{
        constructor(size, xAmp, rAmp, x, y, xt, rt) {
            this.size = size;
            this.xAmp = xAmp;
            this.rAmp = rAmp;
            this.x = x;
            this.y = y;
            this.startX = x;
            this.startY = y;
            this.xt = xt;
            this.rt = rt;
            this.bornTime = performance.now();
        }
    }

    class Confetti extends HTMLElement {
        createInner() {
                this.can = document.createElement("canvas");
                this.con = this.can.getContext("2d");
                this.can.width = window.innerWidth;
                this.can.height = window.innerHeight;
                this.append(this.can);
        }

        resize() {
            this.remove();
        }

        drawShape(shape, x, y, r, t, xm, h) {
            const c = this.con;
            h = -h;
            let yy;
            if (t > topTime) x = shape.toX-shape.x;
            else x = y/h*(shape.toX-shape.x);
            if (t < topTime) yy = shape.y+y/h*(shape.toY-shape.y);
            else yy = shape.toY-(h-y);
            if (t < noMoveTime) t = t/10;
            else t = 11*t/10-noMoveTime;
            const sx = Math.sin((t)*2*Math.PI/xPeriod+shape.st)*xm;
            const ass = Math.sin((t)*2*Math.PI/aPeriod+shape.st)*shape.am;
            c.beginPath();
            c.fillStyle = lineColor;
            c.moveTo(sx+shape.x+x+shapes[shape.t][0][0]*Math.cos(shapes[shape.t][0][1]+ass)*r, yy+shapes[shape.t][0][0]*Math.sin(shapes[shape.t][0][1]+ass)*r);
            for (const i of shapes[shape.t]) c.lineTo(sx+shape.x+x+i[0]*Math.cos(i[1]+ass)*r, yy+i[0]*Math.sin(i[1]+ass)*r);
            c.fill();
            c.closePath();
        }

        startAnimation() {
            this.createShapes();
            const h = pitchIn.getBoundingClientRect().height/2;
            const radius = pitchIn.getBoundingClientRect().height/10;
            const k3 = h/(topTime*(1 - gettingKf*2)*topTime*(1 - gettingKf*2));
            const k4 = -2/((1 - gettingKf*2)*topTime*(1 - gettingKf*2))*h;
            const k5 = gettingKf*2*(2 - gettingKf*2)*h/((1 - gettingKf*2)**2);
            const ms = pitchIn.getBoundingClientRect().height/2500;
            const x0 = (ms-k4)/k3/2;
            this.xOfT = xOfT.bind(null, -(h**3/topTime**2), 2*h**3/topTime, k3, k4, k5, x0, 2*k3*x0+k4, k5-k3*x0*x0);
            const time = performance.now();
            const main = (t2) => {
                const t = t2 - time;
                if (t > atime) {
                    this.remove();
                    return;
                }
                else if (t > opacityTime) {
                    this.style.opacity = `${(1-(t-opacityTime)/(atime-opacityTime))*0.6}`;
                }
                const y = this.xOfT(t);
                this.con.clearRect(0, 0, this.can.width, this.can.height);
                for (const i of this.shapes) this.drawShape(i, 0, y, i.r, t, i.xm, h);
                this.animation = window.requestAnimationFrame(main);
            }
            this.animation = window.requestAnimationFrame(main);
        }

        createShapes() {
            this.shapes = [];
            const geometric = Math.sqrt(pitchIn.getBoundingClientRect().height*pitchIn.getBoundingClientRect().width);
            const maxR = geometric/45;
            const minR = geometric/70;
            const minA = Math.PI/16;
            const maxA = Math.PI/6;
            const minXm = geometric/110;
            const maxXm = geometric/70;
            const width = window.innerWidth*4;
            const height = window.innerHeight*4;
            const area = maxR*4;
            const elRect = document.querySelector(`[data-link="next"]`).getBoundingClientRect();
            const startRadius = elRect.width;
            const startFocus1 = {
                x: elRect.width/2+elRect.x,
                y: elRect.height+elRect.y*1.5+pitchIn.getBoundingClientRect().height/5
            };


            const startFocus2 = {
                x: pitchIn.getBoundingClientRect().x-pitchIn.getBoundingClientRect().width/2,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height/6*5-pitchIn.getBoundingClientRect().height/7+pitchIn.getBoundingClientRect().height/5
            };

            const startFocus3 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width/2*3,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height/6*5+pitchIn.getBoundingClientRect().height/5
            };

            const startFocus4 = {
                x: pitchIn.getBoundingClientRect().x-pitchIn.getBoundingClientRect().width/2,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height/4
            };

            const startFocus5 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width/5*8,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height/4+pitchIn.getBoundingClientRect().height/9
            };

            const endArea1 = {
                x: window.innerWidth/2+pitchIn.getBoundingClientRect().height/13,
                y: pitchIn.getBoundingClientRect().top+pitchIn.getBoundingClientRect().height/5+pitchIn.getBoundingClientRect().height/5,
                r: pitchIn.getBoundingClientRect().width*0.35
            };

            const endArea2 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width/5,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height*2/3-pitchIn.getBoundingClientRect().height/7+pitchIn.getBoundingClientRect().height/5,
                r: pitchIn.getBoundingClientRect().width*0.27
            };

            const endArea3 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width/5*4,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height*2/3+pitchIn.getBoundingClientRect().height/5,
                r: pitchIn.getBoundingClientRect().width*0.27
            };

            const endArea4 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width/6,
                y: pitchIn.getBoundingClientRect().y+pitchIn.getBoundingClientRect().height/9,
                r: pitchIn.getBoundingClientRect().width*0.27
            };

            const endArea5 = {
                x: pitchIn.getBoundingClientRect().x+pitchIn.getBoundingClientRect().width*8/9,
                y: pitchIn.getBoundingClientRect().y,
                r: pitchIn.getBoundingClientRect().width*0.27
            };

            for (let i = -area/2-width/4; i <= width+area; i+=area) {
                for (let j = -area/2-height/4; j <= height+area; j+=area) {
                    const inX = endArea1.x-endArea1.r+i;
                    const inY = endArea1.y-endArea1.r+j;
                    if (Math.sqrt( Math.pow(inX-endArea1.x, 2) + Math.pow(inY-endArea1.y, 2) ) <= endArea1.r) {
                        const alpha = Math.random()*2*Math.PI;
                        const shape = {x: startFocus1.x+Math.random()*startRadius*Math.cos(alpha), y: startFocus1.y+Math.random()*startRadius*Math.sin(alpha), t: randomInteger(-1, shapes.length-1), st: Math.random()*1000, am: minA+Math.random()*(maxA-minA), r: minR+Math.random()*(maxR-minR), xm: minXm+Math.random()*(maxXm-minXm)};
                        shape.toX = inX+(0.5-Math.random())*2*maxR*2;
                        shape.toY = inY+(0.5-Math.random())*2*maxR*2;
                        this.shapes.push(shape);
                    }
                }
            }

            for (let i = -area/2-width/4; i <= width+area; i+=area) {
                for (let j = -area/2-height/4; j <= height+area; j+=area) {
                    const inX = endArea2.x-endArea2.r+i;
                    const inY = endArea2.y-endArea2.r+j;
                    if (Math.sqrt( Math.pow(inX-endArea2.x, 2) + Math.pow(inY-endArea2.y, 2) ) <= endArea2.r) {
                        const alpha = Math.random()*2*Math.PI;
                        const shape = {x: startFocus2.x+Math.random()*startRadius*Math.cos(alpha), y: startFocus2.y+Math.random()*startRadius*Math.sin(alpha), t: randomInteger(-1, shapes.length-1), st: Math.random()*1000, am: minA+Math.random()*(maxA-minA), r: minR+Math.random()*(maxR-minR), xm: minXm+Math.random()*(maxXm-minXm)};
                        shape.toX = inX+(0.5-Math.random())*2*maxR*2;
                        shape.toY = inY+(0.5-Math.random())*2*maxR*2;
                        this.shapes.push(shape);
                    }
                }
            }

            for (let i = -area/2-width/4; i <= width+area; i+=area) {
                for (let j = -area/2-height/4; j <= height+area; j+=area) {
                    const inX = endArea3.x-endArea3.r+i;
                    const inY = endArea3.y-endArea3.r+j;
                    if (Math.sqrt( Math.pow(inX-endArea3.x, 2) + Math.pow(inY-endArea3.y, 2) ) <= endArea3.r) {
                        const alpha = Math.random()*2*Math.PI;
                        const shape = {x: startFocus3.x+Math.random()*startRadius*Math.cos(alpha), y: startFocus3.y+Math.random()*startRadius*Math.sin(alpha), t: randomInteger(-1, shapes.length-1), st: Math.random()*1000, am: minA+Math.random()*(maxA-minA), r: minR+Math.random()*(maxR-minR), xm: minXm+Math.random()*(maxXm-minXm)};
                        shape.toX = inX+(0.5-Math.random())*2*maxR*2;
                        shape.toY = inY+(0.5-Math.random())*2*maxR*2;
                        this.shapes.push(shape);
                    }
                }
            }

            for (let i = -area/2-width/4; i <= width+area; i+=area) {
                for (let j = -area/2-height/4; j <= height+area; j+=area) {
                    const inX = endArea4.x-endArea4.r+i;
                    const inY = endArea4.y-endArea4.r+j;
                    if (Math.sqrt( Math.pow(inX-endArea4.x, 2) + Math.pow(inY-endArea4.y, 2) ) <= endArea4.r) {
                        const alpha = Math.random()*2*Math.PI;
                        const shape = {x: startFocus4.x+Math.random()*startRadius*Math.cos(alpha), y: startFocus4.y+Math.random()*startRadius*Math.sin(alpha), t: randomInteger(-1, shapes.length-1), st: Math.random()*1000, am: minA+Math.random()*(maxA-minA), r: minR+Math.random()*(maxR-minR), xm: minXm+Math.random()*(maxXm-minXm)};
                        shape.toX = inX+(0.5-Math.random())*2*maxR*2;
                        shape.toY = inY+(0.5-Math.random())*2*maxR*2;
                        this.shapes.push(shape);
                    }
                }
            }

            for (let i = -area/2-width/4; i <= width+area; i+=area) {
                for (let j = -area/2-height/4; j <= height+area; j+=area) {
                    const inX = endArea5.x-endArea5.r+i;
                    const inY = endArea5.y-endArea5.r+j;
                    if (Math.sqrt( Math.pow(inX-endArea5.x, 2) + Math.pow(inY-endArea5.y, 2) ) <= endArea5.r) {
                        const alpha = Math.random()*2*Math.PI;
                        const shape = {x: startFocus5.x+Math.random()*startRadius*Math.cos(alpha), y: startFocus5.y+Math.random()*startRadius*Math.sin(alpha), t: randomInteger(-1, shapes.length-1), st: Math.random()*1000, am: minA+Math.random()*(maxA-minA), r: minR+Math.random()*(maxR-minR), xm: minXm+Math.random()*(maxXm-minXm)};
                        shape.toX = inX+(0.5-Math.random())*2*maxR*2;
                        shape.toY = inY+(0.5-Math.random())*2*maxR*2;
                        this.shapes.push(shape);
                    }
                }
            }

        }


        constructor() {
            super();
        }

        stopAnimation() {
            window.cancelAnimationFrame(this.animation);
        }

        connectedCallback() {
            this.createInner();
            this.startAnimation();
        }

        disconnectedCallback() {
            this.stopAnimation();
        }
    }

    customElements.define("confetti-element", Confetti);

    function ease(pr) {
        return Math.pow(Math.sin(Math.acos(1-pr)), 2-pr);
    }

    function easeOut(pr) {
        return 1 - Math.pow(Math.sin(Math.acos(1-pr)), 2-pr);
    }

    function createAnimation(to, time) {
        const elems = switchFns.slider.firstElementChild.children;
        const time3 = performance.now();
        let animation = window.requestAnimationFrame(function main(time2){
            const progress = (time2 - time3)/time;
            switchFns.slider.firstElementChild.style.transform = `translateX(${translate+(-to-translate)*ease(progress)}%)`;
            setOpacityAndScaleToAll(elems);
            animation = window.requestAnimationFrame(main);
        });

        switchFns.stopSliding = ()=> {
            switchFns.inStart = false;
            window.cancelAnimationFrame(animation);
            clearTimeout(timeout);
        };

        let timeout = setTimeout(()=>{
            switchFns.stopSliding();
            switchFns.slider.firstElementChild.style.transform = `translateX(-${to}%)`;
        }, time);

        const translate = -(switchFns.slider.getBoundingClientRect().x-switchFns.slider.firstElementChild.getBoundingClientRect().x)/switchFns.width*100;
    }

    function createSlideAnimation(speed, position) {
        position++;
        const left = Math.floor(position);
        const right = Math.ceil(position);
        speed = Math.round(speed/switchFns.width*50);
        if (speed > 0 && right <= switchFns.amount) {
            const border = switchFns.width*right;
            const diff = Math.abs(switchFns.width*right-position*switchFns.width);
            const time = Math.max(diff/switchFns.width*400, 200);
            createAnimation((right-1)*100, time);
            setTimeout(()=>{
                setButton(right);
            }, 0);
            switchFns.basis = switchFns.slider.getBoundingClientRect().width/2+switchFns.slider.getBoundingClientRect().x;
            switchFns.width = switchFns.slider.getBoundingClientRect().width;
            switchFns.slide = switchFns.actualButton = right-1;
        }
        else if (speed < 0 && left > 0){
            const border = switchFns.width*left;
            const diff = Math.abs(switchFns.width*left-position*switchFns.width);
            const time = Math.max(diff/switchFns.width*400, 200);
            createAnimation((left-1)*100, time);
            setTimeout(()=>{
                setButton(left);
            }, 0);
            switchFns.basis = switchFns.slider.getBoundingClientRect().width/2+switchFns.slider.getBoundingClientRect().x;
            switchFns.width = switchFns.slider.getBoundingClientRect().width;
            switchFns.slide = switchFns.actualButton = left-1;
        }
        else if (speed === 0){
            const closest = Math.round(position);
            const border = switchFns.width*closest;
            const diff = Math.abs(switchFns.width*closest-position*switchFns.width);
            const time = Math.max(diff/switchFns.width*700, 250);

            createAnimation((closest-1)*100, time);
            setTimeout(()=>{
                setButton(closest);
            }, 0);
            switchFns.basis = switchFns.slider.getBoundingClientRect().width/2+switchFns.slider.getBoundingClientRect().x;
            switchFns.width = switchFns.slider.getBoundingClientRect().width;
            switchFns.slide = switchFns.actualButton = closest-1;
        }
        else if (right > switchFns.amount) {
            const time = Math.max(230*((-1)/(22*Math.abs(speed)/switchFns.width+1)+1), 80);
            const length = ((-1)/(22*Math.abs(speed)/switchFns.width+1)+1)*(40-(position-Math.floor(position))*100);
            const time2 = Math.max((length/100+(position-Math.floor(position)))*400, 200);

            const elems = switchFns.slider.firstElementChild.children;
            let time3 = performance.now();
            let animation = window.requestAnimationFrame(function main(time4){
                const progress = (time4 - time3)/time;
                switchFns.slider.firstElementChild.style.transform = `translateX(${translate+(-(position-1)*100-length-translate)*ease(progress)}%)`;
                setOpacityAndScaleToAll(elems);
                animation = window.requestAnimationFrame(main);
            });

            switchFns.stopSliding = ()=> {
                switchFns.inStart = false;
                window.cancelAnimationFrame(animation);
                clearTimeout(timeout1);
                clearTimeout(timeout2);
            };
            let timeout2;
            let timeout1 = setTimeout(()=>{
                switchFns.stopSliding();
                switchFns.slider.firstElementChild.style.transform = `translateX(-${(position-1)*100+length}%)`;
                setOpacityAndScaleToAll(elems);
                time3 = performance.now();
                animation = window.requestAnimationFrame(function main23(time4) {
                    const progress = (time4 - time3)/time2;
                    switchFns.slider.firstElementChild.style.transform = `translateX(${-(position-1)*100-length+(-(switchFns.amount-1)*100+(position-1)*100+length)*ease(progress)}%)`;
                    setOpacityAndScaleToAll(elems);
                    animation = window.requestAnimationFrame(main23);
                });
                timeout2 = setTimeout(()=>{
                    switchFns.slider.firstElementChild.style.transform = `translateX(-${(switchFns.amount-1)*100}%)`;
                    switchFns.stopSliding();
                    setOpacityAndScaleToAll(elems);
                }, time2);
            }, time);

            const translate = -(switchFns.slider.getBoundingClientRect().x-switchFns.slider.firstElementChild.getBoundingClientRect().x)/switchFns.width*100;
            //
        }
        else if (left === 0) {
            const time = Math.max(230*((-1)/(22*Math.abs(speed)/switchFns.width+1)+1), 80);
            const length = ((-1)/(22*Math.abs(speed)/switchFns.width+1)+1)*(40+(position-1)*100);
            const time2 = Math.max((length/100-(position-1))*400, 200);

            const elems = switchFns.slider.firstElementChild.children;
            let time3 = performance.now();
            let animation = window.requestAnimationFrame(function main(time4){
                const progress = (time4 - time3)/time;
                switchFns.slider.firstElementChild.style.transform = `translateX(${translate+(-(position-1)*100+length-translate)*ease(progress)}%)`;
                setOpacityAndScaleToAll(elems);
                animation = window.requestAnimationFrame(main);
            });

            switchFns.stopSliding = ()=> {
                switchFns.inStart = false;
                window.cancelAnimationFrame(animation);
                clearTimeout(timeout1);
                clearTimeout(timeout2);
            };
            let timeout2;
            let timeout1 = setTimeout(()=>{
                switchFns.stopSliding();
                switchFns.slider.firstElementChild.style.transform = `translateX(-${(position-1)*100+length}%)`;
                setOpacityAndScaleToAll(elems);
                time3 = performance.now();
                animation = window.requestAnimationFrame(function main23(time4) {
                    const progress = (time4 - time3)/time2;
                    switchFns.slider.firstElementChild.style.transform = `translateX(${-((position-1)*100+length)*easeOut(progress)}%)`;
                    setOpacityAndScaleToAll(elems);
                    animation = window.requestAnimationFrame(main23);
                });
                timeout2 = setTimeout(()=>{
                    switchFns.stopSliding();
                    setOpacityAndScaleToAll(elems);
                }, time2);
            }, time);

            const translate = -(switchFns.slider.getBoundingClientRect().x-switchFns.slider.firstElementChild.getBoundingClientRect().x)/switchFns.width*100;
            //

        }
    }

    function setButton(n) {
        const el = document.getElementById(`slideBt${n}`);
        document.querySelector(".activePoint")?.classList?.remove("activePoint");
        if (el) el?.classList?.add("activePoint");
        if (el) el.style.transform = "";
    }

    const scalePath = 0.92, startScale = 0.5, maxOver = 0.4;

    function progressFn(x) {
        return x;
    }

    function setOpacityAndScaleToAll(iterable) {
        const x = switchFns.slider.firstElementChild.getBoundingClientRect().x;
        const arr = new Array(...iterable);
        const localWidth = switchFns.slider.getBoundingClientRect().width;
        for (let j = 0 ,i = arr[j]; j < arr.length; j++, i = arr[j]) {
            const obj = getOpacityAndScale(j, switchFns.basis, localWidth, switchFns.basis-localWidth/2-x);
            i.style.opacity = obj.opacity;
            i.style.transform = `scale(${obj.scale})`;
        }
    }

    function getOpacityAndScale(num, basis, width, left) {
        const elx = basis+width*num-left;
        const length = Math.abs(basis-elx);
        if (length >= width*scalePath) return {
            opacity: 0,
            scale: 0,
        };
        else{
            const progress = 1 - length/(width*scalePath);
            const progressIn = progressFn(progress);
            return {
                opacity: progressIn,
                scale: startScale+(1-startScale)*progressIn
            };
        }
    }

    function randomInteger(from, to) {
        return from+Math.floor(Math.random()*(to-from))+1;
    }

    function trl(key) {
        const a = window._all.translations[key];
        if (!a) return "";
        return a[window.gameSettings.language] ? a[window.gameSettings.language] : "("+window.gameSettings.language+") " + a.en;
    }

    function drawStar(con, x, y, r){
        const r2 = r*0.374;
        con.beginPath();
        con.fillStyle = window.themes.main.colors.lineColor;
        con.moveTo(x, y+r);
        con.lineTo(x+r*Math.cos(-90/180*Math.PI), y+r*Math.sin(-90/180*Math.PI));
        con.lineTo(x+r2*Math.cos(-54/180*Math.PI), y+r2*Math.sin(-54/180*Math.PI));
        con.lineTo(x+r*Math.cos(-18/180*Math.PI), y+r*Math.sin(-18/180*Math.PI));
        con.lineTo(x+r2*Math.cos(18/180*Math.PI), y+r2*Math.sin(18/180*Math.PI));
        con.lineTo(x+r*Math.cos(54/180*Math.PI), y+r*Math.sin(54/180*Math.PI));
        con.lineTo(x+r2*Math.cos(90/180*Math.PI), y+r2*Math.sin(90/180*Math.PI));
        con.lineTo(x+r*Math.cos(126/180*Math.PI), y+r*Math.sin(126/180*Math.PI));
        con.lineTo(x+r2*Math.cos(162/180*Math.PI), y+r2*Math.sin(162/180*Math.PI));
        con.lineTo(x+r*Math.cos(198/180*Math.PI), y+r*Math.sin(198/180*Math.PI));
        con.lineTo(x+r2*Math.cos(234/180*Math.PI), y+r2*Math.sin(234/180*Math.PI));
        con.lineTo(x+r*Math.cos(270/180*Math.PI), y+r*Math.sin(270/180*Math.PI));
        con.fill();
        con.closePath();
    }

    function drawQuestion(con, x, y, r) {
        con.beginPath();
        con.lineWidth = r/3;
        con.strokeStyle = window.themes.main.colors.lineColor;
        con.lineCap = "round";

        con.arc(x, y-r/2,r/2, Math.PI, Math.PI/3);
        con.arc(x+r/2, y-r/2+Math.sqrt(3)*r/2, r/2,-Math.PI*2/3, -Math.PI, true);
        con.lineTo(x, y+r/2);

        con.stroke();
        con.closePath();
        con.beginPath();
        con.fillStyle = window.themes.main.colors.lineColor;
        con.arc(x, y+r, r/3/Math.sqrt(3), 0, 2*Math.PI);
        con.fill();
        con.closePath();
    }

    function createArrow() {
        const can = document.createElement("canvas");
        can.resize = () => {
            const con = can.getContext("2d");
            can.width = pitchIn.getBoundingClientRect().width * 0.1;
            can.height = can.width;
            con.beginPath();
            con.lineCap = "round";
            con.strokeStyle = window.themes.main.colors.lineColor;
            con.shadowColor = window.themes.main.colors.lineShadowColor;
            con.shadowBlur = blur / 3;
            con.lineWidth = can.width / 10;
            con.moveTo(can.height * 0.4, can.height * 0.8);
            con.lineTo(can.height * 0.1, can.height * 0.5);
            con.lineTo(can.height * 0.4, can.height * 0.2);
            con.stroke();
            con.moveTo(can.height * 0.1, can.height * 0.5);
            con.lineTo(can.height * 0.9, can.height * 0.5);
            con.stroke();
            con.closePath();
        }
        can.resize();
        return can;
    }

    const pages = {
        refreshConfirmation: {
            open() {
                const can = createArrow();
                canvases.add(can);
                this.canvases = new Set([can]);
                const fraze = decodeURIComponent(trl("anyway"));
                let str = "";
                for (const i of fraze) {
                    if (i !== " ") str+="<span>"+i+"</span>";
                    else str+="<span>"+"&nbsp"+"</span>";
                }
                const inner = `
            <div class="settings settingsInner">
                <div class="closeBar" data-link="refreshConfirmationClose"></div>
                <div class="levelsTxtTop">${trl("refreshing")}</div>
                <div class="levelsTxt">${trl("attention")}!</div>
                <div class="infoTextIn">${trl("sureness")}</div>
                <div class="levelsTxt" data-link="refreshConfirmationYes">${str}</div>
            </div>
                `;
                pitchIn.insertAdjacentHTML("beforeend", inner);
                document.querySelector(".closeBar").append(can);
                document.querySelector(".settings").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link]`);
                    if (el) makeButton(el);
                });
            },
            close() {
                pages.settings.close();
            }
        },
        languageChose: {
            open() {
                const can = createArrow();
                canvases.add(can);
                this.canvases = new Set([can]);
                let inner2 = "";
                for (let i of window._all.languages) {
                    inner2 += `<div class="levelsTxt active0" data-link="lan.${i}">${window._all.languagesNames[i]}</div>`;
                }
                const inner = `
            <div class="settings languages">
                <div class="closeBar" data-link="languageChoseBack"></div>
                <div class="levelsTxtTop">${trl("languageChosing")}</div>
                ${inner2}
            </div>
                `;
                pitchIn.insertAdjacentHTML("beforeend", inner);
                document.querySelector(`[data-link="lan.${window.gameSettings.language}"]`).classList.add("active1");
                document.querySelector(`[data-link="lan.${window.gameSettings.language}"]`).classList.remove("active0");
                document.querySelector(".closeBar").append(can);
                document.querySelector(".settings").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link]`);
                    if (el) makeButton(el);
                });
            },
            close() {
                pages.settings.close();
            }
        },
        openLevel(json, bol) {
            if (!json) return;
            const obj = JSON.parse(json);
            const pt = new Physics(obj, bol);
            document.getElementById("pitchIn").append(pt.elem);
            const pause = `<div class="closeBar" data-link="pause"></div>`;
            const can = document.createElement("canvas");
            can.resize = () => {
                can.width = pitchIn.getBoundingClientRect().width * 0.1;
                can.height = can.width;
                const con = can.getContext("2d");
                con.beginPath();
                con.lineCap = "round";
                con.fillStyle = lineColor;
                con.shadowColor = lineShadowColor;
                con.shadowBlur = blur / 3;
                con.moveTo(can.width * 0.1, can.width * 0.1);
                con.lineTo(can.width * 0.4, can.width * 0.1);
                con.lineTo(can.width * 0.4, can.width * 0.9);
                con.lineTo(can.width * 0.1, can.width * 0.9);
                con.fill();
                con.moveTo(can.width * 0.6, can.width * 0.1);
                con.lineTo(can.width * 0.9, can.width * 0.1);
                con.lineTo(can.width * 0.9, can.width * 0.9);
                con.lineTo(can.width * 0.6, can.width * 0.9);
                con.fill();
                con.closePath();
            }
            can.resize();
            setTimeout(()=>window.requestAnimationFrame(()=>can.resize()));
            this.canvases = new Set([can]);
            canvases.add(can);
            pitch.elem.insertAdjacentHTML("beforeend", pause);
            pitch.elem.lastElementChild.append(can);
            pitch.elem.addEventListener("pointerdown", (event) => {
                const el = event.target.closest(`[data-link="pause"]`);
                if (el) makeButton(el);
            });

        },
        lvlPause: {
            open(name) {
                pages.lvlCleared.open(name, true);
            },
            close() {
                pages.lvlCleared.close();
                setTimeout(removeDark, 100);
            }
        },
        lvlCleared: {
            open(name = "1", pause) {
                const actualName = name;
                if (Number(name)) name = (Number(name)-1)%30+1;
                const canvasMenu = document.createElement("canvas");
                canvasMenu.resize = () => {
                    canvasMenu.width = pitchIn.getBoundingClientRect().width * 0.16 - 2*Math.min(window.innerWidth*0.0085, window.innerHeight*0.0085);
                    canvasMenu.height = canvasMenu.width;
                    const con = canvasMenu.getContext("2d");
                    con.beginPath();
                    con.strokeStyle = lineColor;
                    con.lineWidth = canvasMenu.width/10;
                    con.shadowColor = lineShadowColor;
                    con.shadowBlur = blur;
                    con.lineCap = "round";
                    con.moveTo(canvasMenu.width / 5, canvasMenu.height / 6 * 2);
                    con.lineTo(canvasMenu.width / 5 * 4, canvasMenu.height / 6 * 2);
                    con.moveTo(canvasMenu.width / 5, canvasMenu.height / 6 * 3);
                    con.lineTo(canvasMenu.width / 5 * 4, canvasMenu.height / 6 * 3);
                    con.moveTo(canvasMenu.width / 5, canvasMenu.height / 6 * 4);
                    con.lineTo(canvasMenu.width / 5 * 4, canvasMenu.height / 6 * 4);
                    con.stroke();
                    con.closePath();
                }
                canvasMenu.resize();
                const canvasRetry = document.createElement("canvas");
                canvasRetry.resize = () => {
                    canvasRetry.width = pitchIn.getBoundingClientRect().width * 0.16 - 2*Math.min(window.innerWidth*0.0085, window.innerHeight*0.0085);
                    canvasRetry.height = canvasRetry.width;
                    const con = canvasRetry.getContext("2d");
                    con.beginPath();
                    con.strokeStyle = con.fillStyle = lineColor;
                    con.lineWidth = canvasRetry.width/10;
                    con.shadowColor = lineShadowColor;
                    con.shadowBlur = blur;
                    con.lineCap = "round";
                    con.arc(canvasRetry.width / 2, canvasRetry.height / 2, canvasRetry.width / 4, 90 / 180 * Math.PI, 20 / 180 * Math.PI);
                    con.stroke();
                    con.closePath();
                    con.beginPath();
                    con.strokeStyle = con.fillStyle = lineColor;
                    con.lineWidth = lineWidth * 1.4;
                    con.shadowColor = lineShadowColor;
                    con.shadowBlur = 0;
                    con.lineCap = "square";
                    let l = canvasRetry.width / 8;
                    const xm = l * Math.cos(-20 / 180 * Math.PI);
                    const ym = -l * Math.sin(-20 / 180 * Math.PI);
                    con.moveTo(canvasRetry.width / 2 + xm, canvasRetry.width / 2 + ym);
                    con.lineTo(canvasRetry.width / 2 + 3 * xm, canvasRetry.width / 2 + 3 * ym);
                    con.lineTo(canvasRetry.width / 2 + 2 * xm - l * Math.sin(20 / 180 * Math.PI), canvasRetry.width / 2 + 2 * ym + l * Math.cos(20 / 180 * Math.PI));
                    con.fill();
                    con.closePath();
                }
                canvasRetry.resize();
                const canvasNext = document.createElement("canvas");
                canvasNext.resize = () => {
                    canvasNext.width = pitchIn.getBoundingClientRect().width * 0.20 -2*Math.min(window.innerWidth*0.0085, window.innerHeight*0.0085);
                    canvasNext.height = canvasNext.width;
                    const con = canvasNext.getContext("2d");
                    con.beginPath();
                    con.fillStyle = lineColor;
                    con.lineWidth = lineWidth * 1.4;
                    con.shadowColor = lineShadowColor;
                    con.shadowBlur = blur;
                    con.lineCap = "square";
                    if (pause) {
                        con.moveTo(canvasNext.width * 0.25, canvasNext.width * 0.15);
                        con.lineTo(canvasNext.width * 0.25, canvasNext.width * 0.85);
                        con.lineTo(canvasNext.width * 0.85, canvasNext.width / 2);
                    } else {
                        const spots = [[0, 0], [canvasNext.width / 6 + canvasNext.width / 24, canvasNext.width / 6 * 2], [canvasNext.width / 6 * 2.5 + canvasNext.width / 24, canvasNext.width / 6 + canvasNext.width / 4], [canvasNext.width / 6 * 2.5 + canvasNext.width / 24, canvasNext.width / 6 * 2], [canvasNext.width / 6 * 5 + canvasNext.width / 24, canvasNext.width / 2], [canvasNext.width, 0], [canvasNext.width / 6 * 5 + canvasNext.width / 24, canvasNext.width / 2], [canvasNext.width, canvasNext.width], [canvasNext.width / 6 * 5 + canvasNext.width / 24, canvasNext.width / 2], [canvasNext.width / 6 * 2.5 + canvasNext.width / 24, canvasNext.width / 6 * 4], [canvasNext.width / 6 * 2.5 + canvasNext.width / 24, canvasNext.width / 2 + canvasNext.width / 12], [canvasNext.width / 6 + canvasNext.width / 24, canvasNext.width / 6 * 4], [0, canvasNext.width], [canvasNext.width / 6 + canvasNext.width / 24, canvasNext.width / 6 * 4], [canvasNext.width / 6 + canvasNext.width / 24, canvasNext.width / 6 * 2], [0, 0]];
                        con.moveTo(spots[0][0], spots[0][1]);
                        for (let i = 1; i < spots.length; i++) con.lineTo(spots[i][0], spots[i][1]);
                    }

                    con.fill();
                    con.closePath();
                }
                canvasNext.resize();
                this.canvases = new Set([canvasNext, canvasMenu, canvasRetry]);
                this.canvases.forEach(i => canvases.add(i));
                const lvl = `
    <div class="dark"></div>
    <div class="confettiHolder"></div>
    <div class="lvlCleared" color="${window.endDrColor}">
        
        <div class="levelText">
            <div class="levelName">${trl("level")} ${name}</div>
            <div class="levelDoneText">${pause ? trl("pause") : trl("completed")}</div>
        </div>

        <div class="subMenu">
            <div data-link="menu"></div>
            ${pause ? `<div data-link="continue"></div>` : levels[String(Number(actualName)+1)] ? `<div data-link="next"></div>` : `<div data-link="next" style="opacity: 0.5;"></div>`}
            <div data-link="retry"></div>
            <div class="attempt">${!String(name).includes("bonus") ? (window.playerInfo.levelsData[actualLevel].completeAttempt ? trl("completeAttempt") + " "+window.playerInfo.levelsData[actualLevel].completeAttempt : trl("attempt") + " "+window.playerInfo.levelsData[actualLevel].attempt) : ""}</div>
        </div>
        
        
        
        
    </div>
    `;
                pitchIn.insertAdjacentHTML("beforeend", lvl);
                if (!pause) {
                    const canvas = document.createElement("confetti-element");
                    canvases.add(canvas);
                    this.canvases.add(canvas);
                    document.querySelector(".confettiHolder").append(canvas);
                }
                document.querySelector(`[data-link="menu"]`).append(canvasMenu);
                document.querySelector(`[data-link="retry"]`).append(canvasRetry);
                document.querySelector(`[data-link=${pause ? "continue" : "next"}]`).append(canvasNext);
                if (window.gameSettings.autoContinue && !pause && levels[String(Number(actualName)+1)]) {
                    const el = document.querySelector(`[data-link="next"]`);
                    el.append(document.createElement("div"));
                    setTimeout(()=>{
                        if (document.body.contains(el) && !switchFns.inStart) {
                            el.dispatchEvent(new Event("pointerdown", {bubbles: true}));
                            el.dispatchEvent(new Event("pointerup", {bubbles: true}));
                        }
                    }, 3000);
                }
                document.querySelector(".subMenu").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link="menu"], [data-link="retry"] ${pause ? `,[data-link="continue"]` : levels[String(Number(actualName)+1)] ? `,[data-link="next"]` : ""}`);
                    if (el) makeButton(el);
                })
            },
            close() {
                this.canvases.forEach(i => canvases.delete(i));
                document.querySelector(".lvlCleared").style.animationName = "remove";
                document.querySelector(".confettiHolder").style.animationName = "confettiRemove";
                setTimeout(() => {
                    document.querySelector(".lvlCleared").remove();
                    document.querySelector(".confettiHolder").remove();
                }, 500);
            }
        },
        home: {
            open() {
                const ph = new Physics(JSON.parse(levels.home));
                const fr = document.createElement("div");
                const startCanvas = document.createElement("canvas");

                startCanvas.resize = () => {
                    startCanvas.width = pitchIn.getBoundingClientRect().width * 0.25 - 2*Math.min(window.innerWidth*0.0085, window.innerHeight*0.0085);
                    startCanvas.height = startCanvas.width;

                    const con = startCanvas.getContext("2d");
                    con.beginPath();
                    con.fillStyle = "rgb(252, 243, 211)";
                    con.shadowColor = "rgb(175, 125, 46)";
                    con.shadowBlur = 15;
                    con.moveTo(startCanvas.width * 0.3, startCanvas.width * 0.2);
                    con.lineTo(startCanvas.width * 0.3, startCanvas.width * 0.8);
                    con.lineTo(startCanvas.width * 0.8, startCanvas.width / 2);
                    con.fill();
                    con.closePath();
                }
                startCanvas.resize();
                this.canvases = new Set([startCanvas]);
                canvases.add(startCanvas);

                const eltxt = `
            ${document.querySelector(".dark") ? "" : `<div class="dark"></div>`}
           
            <div id="home">
<!--                snow-el was here, winter is ended, sad, no snow anymore-->
                <div class="welcome">
                    <div class="welcomeTo">welcome to</div>
                    <div class="welcomeName"><span id="lt1">N</span>e<span id="lt2">o</span><span id="lt3">n</span> Ball</div>
                </div>
                <div class="start">
                    <div class="startBt" data-link="start"></div>
                    <div class="info" data-link="info">i</div>   
                </div>
            </div>
            `;
                pitchIn.insertAdjacentHTML("beforeend", eltxt);
                pitchIn.append(ph.elem);
                pitch = ph;
                pitch.start();
                pitch.specialInterval = setInterval(() => {
                    if (pitch.clickable.size > 0) {
                        Array.from(pitch.clickable.values())[0].explodeStart();
                        pitch.clickable.delete(Array.from(pitch.clickable.values())[0]);
                    }
                }, 15000);

                document.querySelector(".startBt").append(startCanvas);

                document.querySelector(".start").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link="info"], [data-link="start"]`)
                    if (el) makeButton(el);
                });

            },
            close() {
                this.canvases.forEach(i => canvases.delete(i));
                document.getElementById("home").style.animationName = "remove";
                setTimeout(() => {
                    document.getElementById("home").remove();
                    pages.canvasClose();
                }, 500)
            },
        },
        canvasClose(bol) {
            pages.canvases?.forEach(i => canvases.delete(i));
            if (bol) {
                stop();
                const can = document.querySelector(".canvasHolder");
                window.requestAnimationFrame(()=>{
                    canvases.delete(pitch);
                    pitch = null;
                    start = null;
                    stop = null;
                    can.style.animationName = "removeCan";
                });
                setTimeout(() => {
                    can.remove();
                }, 500);
            } else setTimeout(() => {
                stop();
                window.requestAnimationFrame(()=>{
                    document.querySelector(".canvasHolder").remove();
                    canvases.delete(pitch);
                    pitch = null;
                    start = null;
                    stop = null;
                });
            }, 500);
        },
        lvls: {
            open(bol) {
                if (!bol) document.body.insertAdjacentHTML("beforeend", lvlsBack);
                const can = createArrow();
                canvases.add(can);
                this.canvases = new Set([can]);

                const nums = [];
                const nums2 = new Map();
                const soonCans = [];
                const questionCanvases = [];
                function isStarAvailable({x, y, r}, arr) {
                    for (const i of arr) {
                        if (Math.sqrt((i.x-x)**2+(i.y-y)**2) < (i.r+r)*0.8) return false;
                    }
                    return true;
                }
                function isStarAvailableQuestion({x, y, r}, arr, w, h) {
                    for (const i of arr) {
                        if (Math.sqrt((i.x-x)**2+(i.y-y)**2) < (i.r+r)*1.2) return false;
                    }
                    if (Math.sqrt((w/2-x)**2+(h*3/7-y)**2) < w/4.7) return false;
                    return true;
                }
                function createCords(w = 100, h = 100, minR = 9, maxR = 19, inside = false) {
                    if (inside) {
                        const r = Math.random()*(maxR-minR)+minR;
                        const x = r*1.1+Math.random()*(w-2.2*r);
                        const y = r*1.1+Math.random()*(h-2.2*r);
                        return {
                            r,x,y
                        };
                    }
                    else return {
                        x: Math.random()*w,
                        y: Math.random()*h,
                        r: Math.random()*(maxR-minR)+minR
                    }
                }
                let j = 0;
                let innerLevels = "";
                for (let i of window.seasons) {
                    if (i.state === "soon") {
                        const can = document.createElement("canvas");
                        can.resize = () => {
                            const con = can.getContext("2d");
                            can.width = pitchIn.getBoundingClientRect().width/3;
                            can.height = can.width;
                            const w = can.width;
                            con.beginPath();
                            con.lineCap = "round";
                            con.fillStyle = window.themes.main.colors.lineColor;
                            con.shadowColor = window.themes.main.colors.lineShadowColor;
                            con.shadowBlur = can.width/10;
                            con.moveTo(w*0.13, w*0.55);
                            con.lineTo(w*0.13,w*0.78);
                            con.arc(0.26*w, w*0.78, 0.13*w,-Math.PI,-3/2*Math.PI, true);
                            con.lineTo(w*0.74,w*0.91);
                            con.arc(0.74*w, w*0.78, 0.13*w,-3/2*Math.PI, 0, true);
                            con.lineTo(w*0.87, w*0.55);
                            con.arc(0.74*w, w*0.55, 0.13*w,0, -1/2*Math.PI, true);
                            con.lineTo(0.72*w, w*0.42);
                            con.arc(0.5*w, w*0.31, 0.22*w, 0, Math.PI, true);
                            con.lineTo(0.28*w, w*0.42);
                            con.lineTo(0.37*w, w*0.42);
                            con.arc(0.5*w, w*0.31, 0.13*w, Math.PI, 0);
                            con.lineTo(0.63*w, w*0.42);
                            con.lineTo(w*0.26, w*0.42);
                            con.arc(0.26*w, w*0.55, 0.13*w,-1/2*Math.PI, Math.PI, true);
                            con.arc(0.5*w, 0.59*w, 0.09*w, 2/3*Math.PI, 1/3*Math.PI);
                            con.arc(0.5*w, 0.75*w, 0.09*w/2, 0, Math.PI);
                            con.lineTo(0.5*w-0.09*w/2, 0.59*w+0.09*w/2*Math.sqrt(3));
                            con.fill();
                            con.closePath();
                        }

                        can.resize();
                        canvases.add(can);
                        this.canvases.add(can);
                        soonCans.push(can);

                        innerLevels += `<div class="levelsInnerHolder" id="levelsHolder${j + 1}">
                        <div class="levelsTxt">${trl(window.seasons[j].name)}</div>
                        <div class="levelsHolder soonHolder" style="flex-direction: column; justify-content: center; margin: auto;">
                        <div class="soonLock levelBt" data-link="level.null" style="border: none; width: auto; height: auto; box-shadow: none; margin: 0;"></div>
                        <div class="soon levelsTxtTop" style="position: static;">${trl("soon")}</div>
                        <div class="question"></div>
                      
</div>
                    </div>`;
                        {
                            const can = document.createElement("canvas");
                            can.resize = () => {
                                const con = can.getContext("2d");
                                can.width = pitchIn.getBoundingClientRect().width*0.8;
                                can.height = pitchIn.getBoundingClientRect().width*0.8*5/6;
                                const w = can.width;
                                if (!can.ownArr) {
                                    const num = randomInteger(-1, window._all.questions.length-1)
                                    const spots = window._all.questions[num];
                                    const width = pitchIn.getBoundingClientRect().width;
                                    for (const i of spots) {
                                        drawQuestion(con,i.x*width/684, i.y*width/684, i.r*width/684);
                                    }
                                    can.ownArr = spots;
                                }
                                else {
                                    const width = pitchIn.getBoundingClientRect().width;
                                    for (const i of can.ownArr) {
                                        drawQuestion(con,i.x*width/684, i.y*width/684, i.r*width/684);
                                    }
                                }
                            }

                            setTimeout(()=>can.resize(), 0);
                            canvases.add(can);
                            this.canvases.add(can);
                            questionCanvases.push(can);
                        }
                        j++;
                        continue;
                    }
                    let levelsIn = "";
                    for (let k = 1; k < 31; k++) {
                        let i = k+j*30;
                        if ((new Set(availableLevels)).has(String(i)) || gameMode === "test") {
                            if ((new Set(passedLevels)).has(String(i))) {
                                const can = document.createElement("canvas");
                                can.classList.add("starCanvas");
                                can.resize = () => {
                                    setTimeout(()=>{
                                        if (can.hasStars) return;
                                        can.width = can.height = 100;
                                        const con = can.getContext("2d");
                                        const arr = [];
                                        for (let i = 0; i < 20; i++) {
                                            let cords = createCords();
                                            while (!isStarAvailable(cords, arr)) cords = createCords();
                                            arr.push(cords);
                                            drawStar(con, cords.x, cords.y, cords.r);
                                        }
                                        can.hasStars = true;
                                    })
                                };
                                can.resize();
                                canvases.add(can);
                                this.canvases.add(can);
                                nums.push(i);
                                nums2.set(i, can);
                            }
                            levelsIn += `<div class="levelBt" data-link="level.${i}" id="levelBtNumber${i}"><span>${(i-1) % 30+1}</span></div>`;
                        }
                        else {
                            const can = document.createElement("canvas");
                            can.resize = () => {
                                const con = can.getContext("2d");
                                can.width = pitchIn.getBoundingClientRect().width * (0.11-0.02833) - 0.011 * Math.min(window.innerHeight, window.innerWidth);
                                can.height = can.width;
                                const w = can.width;
                                con.beginPath();
                                con.lineCap = "round";
                                con.fillStyle = window.themes.main.colors.lineColor;
                                con.shadowColor = window.themes.main.colors.lineShadowColor;
                                con.moveTo(w*0.13, w*0.55);
                                con.lineTo(w*0.13,w*0.78);
                                con.arc(0.26*w, w*0.78, 0.13*w,-Math.PI,-3/2*Math.PI, true);
                                con.lineTo(w*0.74,w*0.91);
                                con.arc(0.74*w, w*0.78, 0.13*w,-3/2*Math.PI, 0, true);
                                con.lineTo(w*0.87, w*0.55);
                                con.arc(0.74*w, w*0.55, 0.13*w,0, -1/2*Math.PI, true);
                                con.lineTo(0.72*w, w*0.42);
                                con.arc(0.5*w, w*0.31, 0.22*w, 0, Math.PI, true);
                                con.lineTo(0.28*w, w*0.42);
                                con.lineTo(0.37*w, w*0.42);
                                con.arc(0.5*w, w*0.31, 0.13*w, Math.PI, 0);
                                con.lineTo(0.63*w, w*0.42);
                                con.lineTo(w*0.26, w*0.42);
                                con.arc(0.26*w, w*0.55, 0.13*w,-1/2*Math.PI, Math.PI, true);
                                con.arc(0.5*w, 0.59*w, 0.09*w, 2/3*Math.PI, 1/3*Math.PI);
                                con.arc(0.5*w, 0.75*w, 0.09*w/2, 0, Math.PI);
                                con.lineTo(0.5*w-0.09*w/2, 0.59*w+0.09*w/2*Math.sqrt(3));
                                con.fill();
                                con.closePath();
                            }

                            can.resize();
                            canvases.add(can);
                            this.canvases.add(can);
                            levelsIn += `<div class="levelBt" id="levelBtNumber${i}" data-link="level.null"></div>`;
                            nums.push(i);
                            nums2.set(i, can);
                        }

                    }
                    innerLevels += `<div class="levelsInnerHolder" id="levelsHolder${j+1}">
                        <div class="levelsTxt">${trl(window.seasons[j].name)}</div>
                        <div class="levelsHolder">${levelsIn}</div>
                    </div>`;
                    j++;
                }

                switchFns.amount = j;
                let buttons = "";
                for (let i = 0; i < window.seasons.length; i++) buttons += `<div data-link="slideTo.${i}" class="dontScaleBack" id="slideBt${i+1}"><div></div></div>`;

                const levels = `
            <div class="levels">
                <div class="closeBar" data-link="closeLvls"></div>
                <div class="closeBar" data-link="settings" ><svg class="settingSing" width="100%" height="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M.974 8.504l1.728-.825a.94.94 0 00.323-1.439l-1.21-1.498a7.009 7.009 0 011.494-1.895l1.727.847a.931.931 0 001.32-.642l.407-1.88a6.96 6.96 0 012.412.001L9.6 3.057a.934.934 0 001.323.637l1.721-.847a7.053 7.053 0 011.511 1.894L12.957 6.24a.942.942 0 00.33 1.437l1.74.826a7.086 7.086 0 01-.529 2.362l-1.914-.012a.935.935 0 00-.912 1.155l.446 1.874a7.002 7.002 0 01-2.17 1.05l-1.194-1.514a.93.93 0 00-1.466.002l-1.18 1.512a7.09 7.09 0 01-2.178-1.05l.43-1.878a.94.94 0 00-.917-1.15l-1.92.011a7.095 7.095 0 01-.06-.149 7.102 7.102 0 01-.488-2.212zM9.96 7.409a2.11 2.11 0 01-1.18 2.74 2.11 2.11 0 01-2.733-1.195 2.11 2.11 0 011.179-2.741A2.11 2.11 0 019.96 7.409z" fill="rgb(252, 243, 211)"></path></svg>
                </div>
                <div class="levelsTxtTop">${trl("levels")}</div>
                <div class="slider" id="slider">
                    <div>
                        ${innerLevels}
                    </div> 
                </div>
                <div class="switcher">${buttons}</div>
            </div>
            `;
                pitchIn.insertAdjacentHTML("beforeend", levels);
                let available = false;
                setTimeout(()=>available = true, 400);
                switchFns.slider = document.getElementById("slider");
                if (!switchFns.actualButton) switchFns.actualButton = 0;
                if (!switchFns.basis) {
                    switchFns.basis = switchFns.slider.getBoundingClientRect().width/2+switchFns.slider.getBoundingClientRect().x;
                    switchFns.width = pitchIn.getBoundingClientRect().width*0.8;
                }
                switchFns.slide = switchFns.actualButton;
                switchFns.slider.firstElementChild.style.transform = `translateX(-${switchFns.width*switchFns.slide}px)`;
                document.getElementById("slideBt"+(switchFns.slide+1)).classList.add("activePoint");

                setOpacityAndScaleToAll(switchFns.slider.firstElementChild.children);

                switchFns.inMoving = 0;
                let x;
                switchFns.slider.addEventListener("pointerdown", (event)=>{
                    if (switchFns.isDragging ||!available) return;
                    switchFns.isDragging = true;
                    switchFns.inMoving = 0;
                    switchFns.actualId = event.pointerId;
                    switchFns.slider.firstElementChild.style.animationPlayState = "paused";
                    switchFns.stopDragging = () => {
                        switchFns.slide = switchFns.actualButton;
                        document.addEventListener("pointermove", main);
                        document.addEventListener("pointerup", main2, {once: true});
                    }
                    const length = switchFns.basis-switchFns.width*switchFns.slide-switchFns.slider.firstElementChild.getBoundingClientRect().x-switchFns.width/2;
                    if (switchFns.stopSliding instanceof Function) switchFns.stopSliding();
                    switchFns.slider.firstElementChild.style.animationPlayState = "";
                    x = event.pageX+length;
                    switchFns.slider.firstElementChild.style.transform = `translateX(${-length-switchFns.width*switchFns.slide}px)`;
                    setOpacityAndScaleToAll(switchFns.slider.firstElementChild.children);
                    let time = Date.now();
                    let prevX = 0;
                    let speed = 0;
                    let diff = -length;
                    setButton(Math.round((Math.max(-(diff-switchFns.width*switchFns.slide),0))/switchFns.width)+1);
                    function main(event){
                        if (event.pointerId !== switchFns.actualId) return;
                        switchFns.inMoving += 1;
                        time = Date.now();
                        diff = event.pageX - x;
                        if (diff-switchFns.width*switchFns.slide > 0) diff = (-1/((diff-switchFns.width*switchFns.slide)/switchFns.width*3+1)+1)*maxOver*switchFns.width+switchFns.width*switchFns.slide;
                        else if (-(diff-switchFns.width*switchFns.slide) > switchFns.width*switchFns.amount-switchFns.width) diff = -(-1/((Math.abs((-(diff-switchFns.width*switchFns.slide))-(switchFns.width*switchFns.amount-switchFns.width)))/switchFns.width*3+1)+1)*maxOver*switchFns.width-(switchFns.amount-switchFns.slide-1)*switchFns.width;
                        switchFns.slider.firstElementChild.style.transform = `translateX(${diff-switchFns.width*switchFns.slide}px)`;
                        speed = prevX - diff;
                        prevX = diff;
                        setOpacityAndScaleToAll(switchFns.slider.firstElementChild.children);
                        const num2 = Math.round((Math.max(-(diff-switchFns.width*switchFns.slide),0))/switchFns.width)+1
                        if (num2 !== switchFns.actualButton) {
                            setButton(num2);
                            switchFns.actualButton = num2;
                        }
                    }
                    function main2(event) {
                        if (event.pointerId !== switchFns.actualId) return;
                        switchFns.inMoving = 0;
                        document.removeEventListener("pointermove", main);
                        document.removeEventListener("pointerup", main2);
                        const time2 = Date.now() - time;
                        if (time2 > 60) speed = 0;
                        const position = -(diff-switchFns.width*switchFns.slide)/switchFns.width
                        createSlideAnimation(speed, position);
                        switchFns.isDragging = false;
                        switchFns.stopDragging = () => {};

                    }
                    document.addEventListener("pointermove", main);
                    document.addEventListener("pointerup", main2);
                });

                document.querySelector(`[data-link="closeLvls"]`).append(can);
                nums.forEach(i=>{
                    document.getElementById("levelBtNumber"+i).append(nums2.get(i));
                });
                document.querySelectorAll(".soonHolder").forEach((el, n)=>{
                    el.querySelector(".soonLock").append(soonCans[n]);
                    el.querySelector(".question").append(questionCanvases[n]);
                })
                document.querySelector(".levels").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link]`);
                    if (el) makeButton(el);
                });
            },
            close(bol, bol2) {
                canvases.forEach(i => canvases.delete(i));
                document.querySelector(".levels").style.animationName = "remove";
                if (!bol2) {
                    document.querySelectorAll(".rolling0, .rolling1").forEach(i=>i.style.animationPlayState = "paused");
                    if (bol) {
                        document.querySelector(".video").style.animationName = "removeCan";
                        setTimeout(() => document.querySelector(".video").remove(), 500)
                    } else {
                        document.querySelector(".video").style.animationDuration = "1s";
                        document.querySelector(".video").style.animationName = "removeCan";
                        setTimeout(() => {
                            setTimeout(() => document.querySelector(".video").remove(), 500);
                        }, 1000);
                    }
                }
                setTimeout(() => {
                    document.querySelector(".levels").remove();
                }, 500);
            }
        },
        settings: {
            open() {
                const can = createArrow();
                canvases.add(can);
                this.canvases = new Set([can]);


                const settings = `
                <div class="settings">
                    <div data-link="closeSettings" class="closeBar"></div>
                    <div class="levelsTxtTop">${trl("settings")}</div>
                    <div class="levelsTxt sbt" data-link="languageChose"><span>${trl("language")}</span></div>
                    <div class="levelsTxt sbt" data-link="refreshProgress"><span>${trl("refresh")}</span></div>
                    <div class="levelsTxt active${window.gameSettings.autoRestart}" data-link="autoRestartSet">${trl("restart")}</div>
                    <div class="levelsTxt active${window.gameSettings.autoContinue}" data-link="autoContinueSet">${trl("autoContinue")}</div>
                    <div class="levelsTxt active${window.gameSettings.saveProgress}" data-link="progressSaveSet">${trl("save")}</div>
                   
                </div>
                `;
                pitchIn.insertAdjacentHTML("afterbegin", settings);
                document.querySelector('[data-link="closeSettings"]').append(can);

                document.querySelector(".settings").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link]`);
                    if (el) makeButton(el);
                });
            },
            close() {
                canvases.forEach(i => canvases.delete(i));
                document.querySelector(".settings").style.animationName = "remove";
                setTimeout(() => {
                    document.querySelector(".settings").remove();
                }, 500);
            }
        },
        info: {
            open(bol) {
                document.getElementById("home").style.animationName = "remove";
                const fn = () => {
                    this.home = document.getElementById("home");
                    this.home.remove();
                    const el = `
            <div class="infoText">
                <div class="closeBar" data-link="closeInfo"></div>
                <div class="levelsTxtTop">${trl("about")}</div>
                <div class="infoTextIn">${trl("author")}</div>
                <div class="infoTextIn">${trl("version")} - ${version}</div>
                <div class="infoTextIn">${trl("gratitudes")}</div>
                <div class="infoTextIn mail" >${trl("contact")} - gorovikov.work@gmail.com</div>
                <div class="infoTextIn"><div data-link="bonusLevel.bonus 3" id="video"><img id="img"></div></div>
                <div class="infoTextIn">#PureJsNoLibraries</div>
                <div class="infoTextIn">&copy${trl("copy")}</div>
                
            </div>
            `;
                    pitchIn.insertAdjacentHTML("beforeend", el);
                    const img = document.getElementById("img");
                    const fn2 = (time) => {
                        const iterations = Math.trunc(time/34.324)%37+1;
                        img.src = "fish/00" + String(iterations).padStart(2, "0") + ".jpg";
                        if (document.body.contains(img)) requestAnimationFrame(fn2);
                    }
                    window.requestAnimationFrame(fn2);

                    {
                        const can = document.createElement("canvas");
                        can.resize = () => {
                            can.width = pitchIn.getBoundingClientRect().width * 0.1;
                            can.height = can.width;
                            const con = can.getContext("2d");
                            con.beginPath();
                            con.lineCap = "round";
                            con.strokeStyle = window.themes.main.colors.lineColor;
                            con.shadowColor = window.themes.main.colors.lineShadowColor;
                            con.shadowBlur = blur / 3;
                            con.lineWidth = can.width / 10;
                            con.moveTo(can.width / 10, can.width / 10);
                            con.lineTo(can.width / 2, can.width / 2);
                            con.lineTo(can.width / 10 * 9, can.width / 10);
                            con.stroke();
                            con.moveTo(can.width / 2, can.width / 2);
                            con.lineTo(can.width / 10 * 9, can.width / 10 * 9);
                            con.stroke();
                            con.moveTo(can.width / 2, can.width / 2);
                            con.lineTo(can.width / 10, can.width / 10 * 9);
                            con.stroke();
                            con.closePath();
                        }
                        can.resize();
                        this.canvases = new Set([can]);
                        canvases.add(can);
                        document.querySelector(`[data-link="closeInfo"]`).append(can);
                    }
                    document.querySelector(".infoText").addEventListener("pointerdown", (event) => {
                        const el = event.target.closest(`[data-link]`);
                        if (el) makeButton(el);
                    });
                };
                if (bol) fn();
                else setTimeout(fn, 500);
            },
            close(bol) {
                this.canvases.forEach(i => canvases.delete(i));
                document.querySelector(".infoText").style.animationName = "remove";
                setTimeout(() => {
                    document.querySelector(".infoText").remove();
                    this.home.style.animationName = "";
                    if (!bol) pitchIn.append(this.home);
                }, 500)
            }
        }
    }

    function makeButton(el) {
        if (!el.classList.contains("dontScaleBack")){
            el.style.transform = "scale(0.8)";
            el.classList.add("pressStart");
        }
        else {
            el.firstElementChild.style.transform = "scale(0.8)";
            el.firstElementChild.classList.add("pressStart");
        }
        let time = Date.now();
        const fn = (event) => {
            const element =document.elementFromPoint(event.pageX, event.pageY);
            if (!(el.contains(element) || element === el)) {
                if (!el.classList.contains("dontScaleBack")) el.style.transform = "scale(1)";
                else el.firstElementChild.style.transform = "";
                document.removeEventListener("pointermove", fn);
                el.removeEventListener("pointerup", fn2);
            }
        }
        const fn2 = () => {
            const timeIn = Date.now() - time > 200 ? 0 : 200 - (Date.now() - time);
            setTimeout(() => {
                if (!el.classList.contains("dontScaleBack")) {
                    el.style.transform = "scale(1.13)";
                    el.classList.remove("pressStart");
                    el.classList.add("pressEnd");
                    setTimeout(() => {el.style.transform = 'scale(1)'; setTimeout(()=>el.classList.remove("pressEnd"), 200)}, 200);
                }
                else el.firstElementChild.style.transform = "";
            }, timeIn);
            document.removeEventListener("pointermove", fn);
            el.removeEventListener("pointerup", fn2);
                if (isNaN(Number(switchFns.inMoving)) || switchFns.inMoving < 4) {
                    if (el.dataset.link.indexOf(".") !== -1) {
                        switchFns[el.dataset.link.split(".")[0]](el.dataset.link.split(".")[1], el, timeIn);
                    } else switchFns[el.dataset.link](el);
                }
            clearInterval(pitch?.specialInterval);
        }
        document.addEventListener("pointermove", fn);
        el.addEventListener("pointerup", fn2);
    }


    document.head.insertAdjacentHTML("beforeend", `<style id="secretStyle">#lt1{
    animation: 0.2s linear 0.8s 1 bl1, 0.5s linear 1.1s 1 bl2, 0.2s linear 1.8s 2 bl1, 0.5s linear 2.8s 1 bl2, 0.2s linear 3.5s 1 bl1;
}
#lt2{
    animation: 0.2s linear 0.6s 2 bl1, 0.5s linear 1.05s 1 bl2,0.2s linear 1.7s 2 bl1, 0.5s linear 2.8s 1 bl2, 0.2s linear 3.7s 1 bl1;
}
#lt3{
    animation: 0.2s linear 0.4s 2 bl1 ,0.2s linear 1s 1 bl1,0.2s linear 2s 2 bl1, 0.5s linear 2.8s 1 bl2, 0.2s linear 3.5s 2 bl1;
}</style>`);
    let result = "";
    for (let i = 0; i < 25; i++) {
        let inner = "";
        for (let j = 0; j < 6; j++) {
            inner += "<div class='rollingInner'></div>"
        }
        result = result + `<div class="rolling${i % 2}">${inner}</div>`;
    }

    const lvlsBack = `
    <div class="video"><div class="videoIn">${result}</div>
</div>
`;

    const canvases = new Set();

    window.onresize = () => {
        if (switchFns.slider) {
            switchFns.basis = switchFns.slider.getBoundingClientRect().width/2+switchFns.slider.getBoundingClientRect().x;
            switchFns.width = pitchIn.getBoundingClientRect().width*0.8;
        }
        canvases.forEach(i => i.resize(pitchIn.getBoundingClientRect().width));
    }

    pages.home.open();
    window.addEventListener("touchend", (e)=>e.preventDefault(), true);
    function setLevelsData(level, prop, value) {
        if (window.playerInfo.levelsData[level]) window.playerInfo.levelsData[level][prop] = value;
        else {
            window.playerInfo.levelsData[level] = {};
            window.playerInfo.levelsData[level][prop] = value;
        }
        if (window.gameSettings.saveProgress) localStorage.setItem("levelsData", decodeURIComponent(JSON.stringify(window.playerInfo.levelsData)));
    }

}