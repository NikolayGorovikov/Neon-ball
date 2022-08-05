// спасибо катя
function mainStart() {
    var lastTime = 0;
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
            this.gravity = Boolean(Number(obj.gravity)) ? this : false;
            this.fixedBeforeTouch = Boolean(Number(obj.fixedBeforeTouch));
            if (this.fixedBeforeTouch) {
                this.angles = [0, 0];
                this.time = 0;
                this.fl0 = Number(fixedBallColor.split(",")[0]);
                this.fl1 = Number(fixedBallColor.split(",")[1]);
                this.fl2 = Number(fixedBallColor.split(",")[2]);
                this.bl0 = Number(ballColor2.split(",")[0]);
                this.bl1 = Number(ballColor2.split(",")[1]);
                this.bl2 = Number(ballColor2.split(",")[2]);
            }
            this.touchRemove = Boolean(Number(obj.touchRemove));
            this.main = Boolean(Number(obj.main));

            this.handler = this;

            if (this.touchRemove || this.fixedBeforeTouch) this.parentElement.clickable.add(this);

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

        move(time, arr) {
            if (this.fixed) return;
            this.x = this.x + this.vector[0] * time;
            this.y = this.y + this.vector[1] * time;
            if (arr) {
                const [ax, ay] = arr
                this.ax = this.ax + ax;
                this.ay = this.ay + ay;
            }
            if (this.main && this.parentElement.finish) {
                const goal = this.parentElement.findSmallestFlexLinesCircleTime(this, this.parentElement.finish);
                if (goal === -Infinity) this.parentElement.win(this);
            }
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
            con.strokeStyle = con.fillStyle = this.main ? mainBallColor : this.fixedBeforeTouch ? ballColor : this.fixed ? lineColor : ballColor;
            con.lineWidth = lineWidth;
            con.shadowBlur = blur;
            con.shadowColor = this.main ? mainBallColorShadowColor : this.fixedBeforeTouch ? ballShadowColor : this.fixed ? lineShadowColor : ballShadowColor;
            if (this.fixedBeforeTouch && time) {
                const kf = Math.abs(Math.sin(2 * (this.time + time)));
                this.time += time;
                const color = `rgb(${Math.round(this.fl0 + (this.bl0 - this.fl0) * kf)}, ${Math.round(this.fl1 + (this.bl1 - this.fl1) * kf)}, ${Math.round(this.fl2 + (this.bl2 - this.fl2) * kf)})`;
                con.strokeStyle = color;
                con.shadowColor = color;
                con.lineWidth *= (1 + (1 - kf) / 5);

            }
            if (this.fixed && (this.angles[0] !== this.angles[1])) con.arc(this.#x + this.radius, this.#y + this.radius, this.radius, -this.angles[1], -this.angles[0]);
            else con.arc(this.#x + this.radius, this.#y + this.radius, this.radius, 0, Math.PI * 2);
            this.boombastick ? con.fill() : 0;
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
            pitch.finish = this;
            this.x1 = obj.x1;
            this.x2 = obj.x2;
            this.y1 = obj.y1;
            this.y2 = obj.y2;
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
        constructor(spots, color, pitch) {
            this.color = color;
            this.spots = spots;

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
        #G = 1;
        clickable = new Set();
        drawings = {background: new Set(), rocks: new Set(), contour: new Set(), all: new Set()};

        addDraw(spots, color) {
            this.drawings[color].add(spots);
            this.drawings.all.add(new drawObj(spots, color, this));
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
            // stop();();
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
            for (const i of this.drawings.rocks) this.drawBySpots(i, this.contextPassive);
            this.contextPassive.fill();
            this.contextPassive.closePath();

            this.contextPassive.beginPath();
            this.contextPassive.fillStyle = this.backgroundGr;
            this.contextPassive.shadowBlur = 0;
            for (const i of this.drawings.background) this.drawBySpots(i, this.contextPassive);
            this.contextPassive.fill();
            this.contextPassive.closePath();

            this.contextPassive.beginPath();
            this.contextPassive.strokeStyle = lineColor;
            this.contextPassive.lineWidth = lineWidth;
            this.contextPassive.shadowBlur = blur;
            this.contextPassive.shadowColor = lineShadowColor;
            this.contextPassive.lineCap = "round";

            for (let i of this.#linesInSystem) i.renderCanvas(this.contextPassive, this.canvas);
            for (let i of this.#flexLinesInSystem) i.renderCanvas(this.contextPassive, this.canvasPassive);
            for (const i of this.drawings.contour) this.drawBySpots(i, this.contextPassive);

            this.contextPassive.stroke();
            this.contextPassive.closePath();
        }

        resize(w) {
            const scale = w / this.width;
            this.width = w;
            this.canvas.width = w;
            this.canvasPassive.width = w;
            this.canvas.height = w * aspectRatio;
            this.canvasPassive.height = w * aspectRatio;
            this.g *= scale ** 2;
            this.G *= scale ** 2;
            window.elosLimit = Number(window.elosLimit) * scale;
            window.lineWidth *= scale;
            blur = blur * scale;
            for (const i of this.linesInSystem) {
                i.x1 *= scale;
                i.x2 *= scale;
                i.y1 *= scale;
                i.y2 *= scale;
                i.main();
            }

            for (const i of this.elemsInSystem) {
                const [x, y] = [i.x, i.y];
                i.radius *= scale;
                i.x = x * scale;
                i.y = y * scale;
                i.vector = [i.vector[0] * scale, i.vector[1] * scale];
                i.ax *= scale;
                i.ax *= scale;
                i.m *= scale;
                i.rboom *= scale;
                i.f *= scale;
            }

            for (const i of this.#airLines) {
                i.x1 *= scale;
                i.x2 *= scale;
                i.y1 *= scale;
                i.y2 *= scale;
                i.length *= scale;
                i.f *= scale;
                i.main();
            }

            for (const i of this.flexLinesInSystem) {
                i.x1 *= scale;
                i.x2 *= scale;
                i.y1 *= scale;
                i.y2 *= scale;
                i.lines.forEach((line) => {
                    line.x1 *= scale;
                    line.x2 *= scale;
                    line.y1 *= scale;
                    line.y2 *= scale;
                });
                i.spots.forEach(spot => {
                    spot[0] *= scale;
                    spot[1] *= scale;
                });
            }

            for (const i of this.drawings.all) {
                i.spots.forEach(spot => {
                    spot[0] *= scale;
                    spot[1] *= scale;
                });
            }

            if (this.finish) {
                this.finish.x1 *= scale;
                this.finish.x2 *= scale;
                this.finish.y1 *= scale;
                this.finish.y2 *= scale;
                this.finish.main();
            }
            this.renderCanvas();
            this.renderPassiveCanvas();
        }

        constructor(obj) {
            window.requestAnimationFrame(() => {
                canvases.add(this);
                this.canvas = document.createElement("canvas");
                this.context = this.canvas.getContext("2d");
                this.width = this.elem.getBoundingClientRect().width;
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
                    for (const i in obj.inPitch) this[i] = Number(obj.inPitch[i]);
                    for (const i in obj.pitchParams) window[i] = obj.pitchParams[i];

                    const scale = this.canvas.width / obj.width;
                    this.g *= scale ** 2;
                    this.G *= scale ** 2;
                    window.elosLimit = Number(window.elosLimit) * scale;
                    window.lineWidth *= scale;
                    blur = obj.blur * scale;
                    for (const i of obj.lines) {
                        i.x1 *= scale;
                        i.x2 *= scale;
                        i.y1 *= scale;
                        i.y2 *= scale;
                        this.addedToLinesSystem(new Line(i));
                    }

                    for (const i of obj.balls) {
                        i.x *= scale;
                        i.y *= scale;
                        i.radius *= scale;
                        i.vx *= scale;
                        i.vy *= scale;
                        i.ax *= scale;
                        i.ax *= scale;
                        i.m *= scale;
                        this.addedToSystem(new Circle(i, this));
                    }

                    for (const i of obj.airLines) {
                        i.x1 *= scale;
                        i.x2 *= scale;
                        i.y1 *= scale;
                        i.y2 *= scale;
                        i.length *= scale;
                        i.f *= scale;
                        this.addAirLine(new airLine(i));
                    }

                    for (const i of obj.tntBalls) {
                        i.x *= scale;
                        i.y *= scale;
                        i.radius *= scale;
                        i.vx *= scale;
                        i.vy *= scale;
                        i.ax *= scale;
                        i.ax *= scale;
                        i.rboom *= scale;
                        i.f *= scale;
                        i.m *= scale;
                        this.addedToSystem(new tnt(i, this));
                    }

                    for (const i of obj.flexLines) {
                        i.x1 *= scale;
                        i.x2 *= scale;
                        i.y1 *= scale;
                        i.y2 *= scale;
                        i.lines = i.lines.map((line) => {
                            line.x1 *= scale;
                            line.x2 *= scale;
                            line.y1 *= scale;
                            line.y2 *= scale;
                            return new Line(line);
                        });
                        i.spots = i.spots.map(spot => {
                            spot[0] *= scale;
                            spot[1] *= scale;
                            return spot;
                        });

                        this.addToFlexLinesSystem(new flexLine(this, i));
                    }

                    for (const i of obj.drawings) {
                        i.spots.forEach(spot => {
                            spot[0] *= scale;
                            spot[1] *= scale;
                        });
                        this.addDraw(i.spots, i.color);
                    }

                    if (obj.finish) {
                        obj.finish.x1 *= scale;
                        obj.finish.x2 *= scale;
                        obj.finish.y1 *= scale;
                        obj.finish.y2 *= scale;
                        this.finish = new Finish(obj.finish, this);
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
                this.renderCanvas();
                this.renderPassiveCanvas();

            });
            pitch = this;
            start = () => {
                this.start();
            };
            stop = () => {
                this.stop();
            }

            this.elem = document.createElement("div");
            this.elem.classList.add("canvasHolder");
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

        main(time , fps ) {
            let chvTime = 1 / fps / 10;
            time = normalize(time);
            while (time > 0) {
                let timeIn = this.findSmallestTime(1 / fps - time, 0.003, fps);
                while (timeIn.t === 0) {
                    timeIn = this.findSmallestTime(1 / fps - time, 0.003, fps);
                }
                const time2 = timeIn.t;
                if (time2 > 1 / fps / 10) {
                    this.drawFrame(1 / fps / 10);
                    this.changeVectors(1 / fps / 10);
                    time = normalize(time - 1 / fps / 10);
                    continue;
                }
                chvTime = normalize(chvTime - time2);
                if (chvTime <= 0) {
                    this.drawFrame(chvTime + time2);
                    this.changeVectors(1 / fps / 10);
                    time = normalize(time - (chvTime + time2));
                    chvTime = 1 / fps / 10;
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
            this.renderCanvas(1 / fps);
        }

        start() {
            this.inMain(true);
            this.play = true;
        }

        inMain(first) {
            if (first) {
                window.requestAnimationFrame((time) => {
                    this.time = time;
                });
            }
            this.#movie = window.requestAnimationFrame((time) => {
                if (time-this.time > 100) {
                    this.time = time - 17;
                }
                this.main(normalize((time-this.time)/1000), normalize(1000/(time-this.time)));
                this.inMain();
                this.time = time;
            });
        }

        stop() {
            window.cancelAnimationFrame(this.#movie);
            this.play = false;
        }

        addedToSystem(elem) {
            this.#elemsInSystem.push(elem);
            elem.numElem = this.#elemsInSystem.length - 1;
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
                i.move(time);
            }
        }

        getGravity(sp, cr, fuck) {
            const x1 = sp.handler.x;
            const x2 = cr.x;
            const y1 = sp.handler.y;
            const y2 = cr.y;
            const r = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
            if (cr.radius + sp.handler.radius > r) return [0, 0];
            const G = fuck ? 10000000 : this.#G;
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

                x1 = a + diff1 * (main.elos ? elos1 : 1);
                x2 = b + diff2 * (nomain.elos ? elos1 : 1);
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

        findSmallestTime(part = 0, smallest, fps, reverse) {
            let time;
            if (reverse) time = new Shoot(smallest, true);
            else time = new Shoot(1 / fps - part, true);
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
                    if (time2.data.l < 2.1 * k.radius) amount++;
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
                        if (time2.type === "b") this.createCircleVector(j, k);
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

        findSmallestCircleTime(main, nomain) {
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
                l = l + lineWidth;
                c = l * l - Math.pow((main.width - nomain.width) / 2, 2);
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
            const r = cr.radius + lineWidth;
            const a = (vx * k - vy) / (k + 1 / k);
            const c = (vy / k - vx) / (k + 1 / k);
            const d = (y1 / k - x1 - b / k) / (k + 1 / k);
            b = (k * x1 - y1 + b) / (k + 1 / k);
            const time1 = (-2 * a * b - 2 * c * d - Math.sqrt(Math.pow(-2 * a * b - 2 * c * d, 2) - 4 * (a * a + c * c) * (b * b + d * d - r * r))) / (2 * (a * a + c * c));
            const time2 = (-2 * a * b - 2 * c * d + Math.sqrt(Math.pow(-2 * a * b - 2 * c * d, 2) - 4 * (a * a + c * c) * (b * b + d * d - r * r))) / (2 * (a * a + c * c));
            if (time1 >= 0 && time2 >= 0) {
                const t = normalize(Math.min(time1, time2));
                b = ln.b;
                let x3 = x1 + vx * t;
                let y3 = y1 + vy * t;
                let k2 = -1 / k;
                let b2 = y3 - k2 * x3;
                let x = (b - b2) / (k2 - k);
                if (ln.isInRange(x)) return new Shoot(t, "bl", null, {cr, ln});
                {
                    const time1 = this.findSmallestCircleSpotTime(cr, {x: ln.x1, y: ln.y1});
                    const time2 = this.findSmallestCircleSpotTime(cr, {x: ln.x2, y: ln.y2});

                    return time1.t < time2.t ? time1 : time2;
                }
            } else {
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

        countF(ball, time) {
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
                ball.vector = [ball.vector[0] + gr[0] / ball.mass * time, ball.vector[1] + gr[1] / ball.mass * time];

            }

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

    const pitchIn = document.getElementById("pitchIn");
    pitchIn.addEventListener("pointerdown", (event) => {
        if (!pitch) return;
        const x1 = event.pageX - pitch.elem.getBoundingClientRect().left;
        const y1 = event.pageY - pitch.elem.getBoundingClientRect().top;
        for (const i of pitch.clickable) {
            if (Math.sqrt(Math.pow(i.x - x1, 2) + Math.pow(i.y - y1, 2)) <= i.radius) {
                if (i.touchRemove) i.remove();
                else if (i.fixedBeforeTouch) {
                    i.fixed = false;
                    i.fixedBeforeTouch = false;
                    pitch.clickable.delete(i);
                } else if (i.boombastick) i.explodeStart();
            }
        }
    });

    function removeDark() {
        document.querySelector(".dark").style.animationName = "removeCan";
        setTimeout(() => document.querySelector(".dark").remove(), 500);
    }

    const switchFns = {
        level(lvl) {
            if (!levels[lvl]) return;
            actualLevel = lvl;
            pages.lvls.close(true);
            pages.openLevel(levels[lvl]);
            removeDark();
        },
        menu(el) {
            pages.lvlCleared.close();
            pages.canvasClose();
            setTimeout(() => pages.lvls.open(), 500);
        },
        retry(el) {
            el.firstElementChild.style.transform = "rotate(0deg)";
            el.firstElementChild.style.transition = "transform 0.4s ease 0s";
            el.firstElementChild.style.transform = "rotate(360deg)";
            pages.lvlCleared.close();
            pages.canvasClose(true);
            pages.openLevel(levels[actualLevel]);
            removeDark();

        },
        next(el) {
            pages.lvlCleared.close();
            pages.canvasClose(true);
            pages.openLevel(levels[String(Number(actualLevel) + 1)]);
            actualLevel = String(Number(actualLevel) + 1);
            removeDark();
        },
        start(el) {
            if (document.getElementById("secretStyle")) document.getElementById("secretStyle").remove();
            pages.home.close();

            setTimeout(() => {
                pages.lvls.open();
            }, 500);
        },
        info(el) {
            if (document.getElementById("secretStyle")) document.getElementById("secretStyle").remove();
            pages.info.open();
        },
        closeInfo() {
            pages.info.close();
        },
        closeLvls() {
            pages.lvls.close()
            setTimeout(() => {
                pages.home.open();
            }, 500);
        },
        pause() {
            if (pitch?.cleared) return;
            stop();
            pages.lvlPause.open(String(actualLevel));
        },
        continue() {
            setTimeout(() => start(), 500);
            pages.lvlPause.close();
        }
    }


    const pages = {
        openLevel(json) {
            const obj = JSON.parse(json);
            const pt = new Physics(obj);
            document.getElementById("pitchIn").append(pt.elem);
            start();
            pitch = pt;
            const pause = `<div class="closeBar" data-link="pause"></div>`;
            const can = document.createElement("canvas");
            can.resize = () => {
                can.width = pitchIn.getBoundingClientRect().width * 0.07;
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
                document.querySelector(".dark").style.animationName = "canRemove";
                setTimeout(() => document.querySelector(".dark").remove(), 500);
            }
        },
        lvlCleared: {
            open(name = "1", pause) {
                const canvasMenu = document.createElement("canvas");
                canvasMenu.resize = () => {
                    canvasMenu.width = pitchIn.getBoundingClientRect().width * 0.16 - 10;
                    canvasMenu.height = canvasMenu.width;
                    const con = canvasMenu.getContext("2d");
                    con.beginPath();
                    con.strokeStyle = lineColor;
                    con.lineWidth = lineWidth * 1.4;
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
                    canvasRetry.width = pitchIn.getBoundingClientRect().width * 0.16 - 10;
                    canvasRetry.height = canvasRetry.width;
                    const con = canvasRetry.getContext("2d");
                    con.beginPath();
                    con.strokeStyle = con.fillStyle = lineColor;
                    con.lineWidth = lineWidth * 1.4;
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
                    canvasNext.width = pitchIn.getBoundingClientRect().width * 0.20 - 10;
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
    <div class="lvlCleared">
        <div class="levelText">
            <div class="levelName">Уровень ${name}</div>
            <div class="levelDoneText">${pause ? "Пауза" : "Пройдено"}</div>
        </div>
        <div class="subMenu">
            <div data-link="menu"></div>
            ${pause ? `<div data-link="continue"></div>` : Number(name) < 30 ? `<div data-link="next"></div>` : `<div data-link="next" style="opacity: 0.5;"></div>`}
            <div data-link="retry"></div>
        </div>
    </div>
    `;
                pitchIn.insertAdjacentHTML("beforeend", lvl);
                document.querySelector(`[data-link="menu"]`).append(canvasMenu);
                document.querySelector(`[data-link="retry"]`).append(canvasRetry);
                document.querySelector(`[data-link=${pause ? "continue" : "next"}]`).append(canvasNext);
                document.querySelector(".subMenu").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link="menu"], [data-link="retry"] ${pause ? `,[data-link="continue"]` : Number(name) < 30 ? `,[data-link="next"]` : ""}`)
                    if (el) makeButton(el);
                })
            },
            close() {
                this.canvases.forEach(i => canvases.delete(i));
                document.querySelector(".lvlCleared").style.animationName = "remove";
                setTimeout(() => document.querySelector(".lvlCleared").remove(), 500);
            }
        },
        home: {
            open() {
                const ph = new Physics(JSON.parse(levels.home));
                const fr = document.createElement("div");
                const startCanvas = document.createElement("canvas");

                startCanvas.resize = () => {
                    startCanvas.width = pitchIn.getBoundingClientRect().width * 0.25 - 10;
                    startCanvas.height = startCanvas.width;

                    const con = startCanvas.getContext("2d");
                    con.beginPath();
                    con.fillStyle = "rgb(252, 243, 211)";
                    con.lineWidth = 5 * 1.4;
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
                ph.elem.style.zIndex = "1";
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
                pitch = null;
                start = null;
                stop = null;
                const can = document.querySelector(".canvasHolder");
                can.style.animationName = "removeCan";
                setTimeout(() => {
                    can.remove();
                }, 500);
            } else setTimeout(() => {
                stop();
                document.querySelector(".canvasHolder").remove();
                canvases.delete(pitch);
                pitch = null;
                start = null;
                stop = null;
            }, 500);
        },
        lvls: {
            open() {
                document.body.insertAdjacentHTML("beforeend", lvlsBack);
                const can = document.createElement("canvas");
                can.resize = () => {
                    const con = can.getContext("2d");
                    can.width = pitchIn.getBoundingClientRect().width * 0.07;
                    can.height = can.width;
                    con.beginPath();
                    con.lineCap = "round";
                    con.strokeStyle = lineColor;
                    con.shadowColor = lineShadowColor;
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
                canvases.add(can);
                this.canvases = new Set([can]);


                let levelsIn = "";
                for (let i = 1; i < 31; i++) {
                    levelsIn += `<div class="levelBt" data-link="level.${i}">${i}</div>`
                }
                const levels = `
            <div class="levels">
                <div class="closeBar" data-link="closeLvls"></div>
                <div class="levelsTxt">Уровни</div>
                <div class="levelsHolder">${levelsIn}</div>
            </div>
            `;
                pitchIn.insertAdjacentHTML("beforeend", levels);
                document.querySelector(`[data-link="closeLvls"]`).append(can);
                document.querySelector(".levels").addEventListener("pointerdown", (event) => {
                    const el = event.target.closest(`[data-link]`);
                    if (el) makeButton(el);
                });
            },
            close(bol) {
                canvases.forEach(i => canvases.delete(i));
                document.querySelector(".levels").style.animationName = "remove";
                if (bol) {
                    document.querySelector(".video").style.animationName = "removeCan";
                    setTimeout(() => document.querySelector(".video").remove(), 500)
                } else setTimeout(() => {
                    document.querySelector(".video").style.animationName = "removeCan";
                    setTimeout(() => document.querySelector(".video").remove(), 500)
                }, 500);
                setTimeout(() => {
                    document.querySelector(".levels").remove();
                }, 500);
            }
        },
        info: {
            open() {
                document.getElementById("home").style.animationName = "remove";
                setTimeout(() => {
                    this.home = document.getElementById("home");
                    this.home.remove();
                    const el = `
            <div class="infoText">
                <div class="closeBar" data-link="closeInfo"></div>
                <div class="infoTextIn">Автор и разработчик - Горовиков Николай Константинович</div>
                <div class="infoTextIn">Версия - ${version}</div>
                <div class="infoTextIn">Отдельная благодарность Кате, //спасибо катя</div>
                <div class="infoTextIn mail" >Контактные данные - gorovikov.work@gmail.com</div>
                <div class="infoTextIn">&copy Горовиков Николай Константинович, 2021-2022 | Все права защищены</div>
            </div>
            `;

                    pitchIn.insertAdjacentHTML("beforeend", el);
                    {
                        const can = document.createElement("canvas");
                        can.resize = () => {
                            can.width = pitchIn.getBoundingClientRect().width * 0.07;
                            can.height = can.width;
                            const con = can.getContext("2d");
                            con.beginPath();
                            con.lineCap = "round";
                            con.strokeStyle = lineColor;
                            con.shadowColor = lineShadowColor;
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
                        const el = event.target.closest(`[data-link="closeInfo"]`);
                        if (el) makeButton(el);
                    });
                }, 500);
            },
            close() {
                this.canvases.forEach(i => canvases.delete(i));
                document.querySelector(".infoText").style.animationName = "remove";
                setTimeout(() => {
                    document.querySelector(".infoText").remove();
                    this.home.style.animationName = "";
                    pitchIn.append(this.home);
                }, 500)
            }
        }
    }

    function makeButton(el) {
        el.style.transform = "scale(0.8)";
        let time = Date.now();
        const fn = () => {
            el.style.transform = "scale(1)";
            el.removeEventListener("pointerout", fn);
            el.removeEventListener("pointerup", fn2);
        }
        const fn2 = () => {
            setTimeout(() => {
                el.style.transform = "scale(1.13)";
                setTimeout(() => el.style.transform = 'scale(1)', 200);
            }, Date.now() - time > 200 ? 0 : 200 - (Date.now() - time));
            el.removeEventListener("pointerout", fn);
            el.removeEventListener("pointerup", fn2);
            if (el.dataset.link.indexOf(".") !== -1) {
                switchFns[el.dataset.link.split(".")[0]](el.dataset.link.split(".")[1]);
            } else switchFns[el.dataset.link](el);
            clearInterval(pitch?.specialInterval);
        }
        el.addEventListener("pointerout", fn);
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
        for (let j = 0; j < 5; j++) {
            inner += "<div class='rollingInner'></div>"
        }
        result = result + `<div class="rolling${i % 2}">${inner}</div>`;
    }

    const lvlsBack = `
    <div class="video">${result}
</div>
`;

    const canvases = new Set();

    window.onresize = () => {
        canvases.forEach(i => i.resize(pitchIn.getBoundingClientRect().width));
    }

    pages.home.open();
}