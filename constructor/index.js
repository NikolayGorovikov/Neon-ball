// спасибо катя
function random(from, to) {
    return from+Math.ceil(Math.random()*(to-from))-1;
}
function randomColor() {
    return "#"+random(0, Math.pow(16, 6)).toString(16).padStart(6, "0");
}

class Circle extends HTMLElement {
    #x;
    #y;
    #rs = 0;
    #rsangle = 0;
    #vector = [0.00000001,0.00000001];
    #width;
    #radius;
    #Static;
    #mass;
    #elos;
    #ax;
    #ay;
    #gravity
    #fixed = false;
    #angles = [];
    nearBalls = new Set();
    #fixedBeforeTouch = false;
    time = 0;

    connectedCallback() {
        setTimeout(()=>{
            this.parentElement.addedToSystem(this);
        })
    }
    remove() {
        if (this.main) this.parentElement.main = null;
        for (let i of this.nearBalls) i.nearBalls.delete(this);
        if (this.gravity) this.parentElement.removeGravitySpot(this.gravity);
        this.parentElement.removeFromSystem(this.numElem);
        document.createElement("div").remove.call(this);
    }
    static get observedAttributes() {
        return ["x", "y", "width", "vector", "static", "mass", "elos", "destroyer", "ax", "ay", "fixed", "gravity", "rs", "angles"];
    }
    attributeChangedCallback(name, old, act) {
        if (name === "vector") {
            this.vector = act.split(",");
        }
        else if (name === "angles") {
            this.angles = act.split(",");
        }
        else this[name] = Number(act);
    }
    set gravity(value){
        setTimeout(()=>{
            if (value === -1) {
                this.parentElement.removeGravitySpot(this.gravity);
                this.#gravity = null;
            }
            else {
                this.#gravity = {x: this.x, y: this.y, m: this.mass, handler: this};
                this.parentElement.addToGravitySystem(this);
            }
        });
    }
    get angles(){
        return this.#angles;
    }
    set angles(arr) {
        if (arr[0] === arr[1]) {
            this.#angles = [arr[0]/180*Math.PI, arr[1]/180*Math.PI];
        }
        else {

            this.#angles = [arr[0] / 180 * Math.PI, arr[1] / 180 * Math.PI];

        }
        this.parentElement.renderCanvas();
    }
    get gravity(){
        return this.#gravity;
    }
    get x(){
        return this.#x+this.width/2;
    }
    set x(x) {
        x -= this.width/2;
        this.#x = x;
        this.style.left = x+"px";
        if (!this.parentElement.play) this.parentElement.renderCanvas();
            }
    get fixed() {
        return this.#fixed;
    }
    set fixed(a) {
        if (a === -1) this.#fixed = false;
        else this.#fixed = true;
    }
    set rs(s) {
        this.#rs = s;
    }
    get rs() {
        return this.#rs;
    }
    set rsangle(angle) {
        this.#rsangle = angle;
        this.style.transform = `rotate(${angle}rad)`
    }
    get rsangle() {
        return this.#rsangle;
    }
    set elos(e) {
        if (e === -1) this.#elos = false;
        else this.#elos = true;
    }
    get elos() {
        return this.#elos;
    }
    set mass(m) {
        this.#mass = m;

    }
    get mass(){
        return this.#mass;
    }
    set static(v) {
        this.#Static = true;
    }
    get width() {
        return this.#width;
    }
    set width(w) {
        const y = this.y;
        const x = this.x;
        this.#width = w;
        this.#radius = w/2;
        this.style.width = this.style.height = w+"px";
        this.x = x;
        this.y = y;
        this.parentElement.renderCanvas();
    }
    set y(y) {
        y -= this.#width/2;
        this.#y = y;
        this.style.top = y+"px";
        if (!this.parentElement.play) this.parentElement.renderCanvas();
    }
    get y() {
        return this.#y+this.width/2;
    }
    set ax(a){
        this.#ax = a;
    }
    get ax(){
        return this.#ax;
    }
    set ay(a){
        this.#ay = a;
    }
    get ay(){
        return this.#ay;
    }
    move(time, arr) {
        if (this.fixed) return;
        this.x = this.x+this.vector[0]*time;
        this.y = this.y+this.vector[1]*time;
        if (arr) {
            const [ax, ay] = arr
            this.ax = this.ax+ax;
            this.ay = this.ay+ay;
        }
        if (this.#gravity) {
            this.#gravity.x = this.x;
            this.#gravity.y = this.y;
        }
        if (this.main && this.parentElement.finish) {
            const goal = this.parentElement.findSmallestFlexLinesCircleTime(this, this.parentElement.finish);
            if (goal === -Infinity) this.parentElement.win(this);
        }
    }
    rotate(time) {
        this.rsangle = this.rsangle+time*this.rs*2*Math.PI;
    }
    get vector() {
        if (this.fixed) return [0,0];
        else return this.#vector;
    }
    set vector(vector) {
        if (this.fixed) return;
        this.#vector = vector.map(i=>(Number(i)));
        if (isNaN(this.vector[0])) {
            this.#vector[0] = 0.00000001;
        }
        if (isNaN(this.vector[1])) {
            this.#vector[1] = 0.00000001;
        }
        if (this.#vector[0] === 0) this.#vector[0] = 0.00000001;
        if (this.#vector[1] === 0) this.#vector[1] = 0.00000001;
    }
    get radius() {
        return this.#radius;
    }

    set radius(r) {
        this.#radius = r;
    }

    renderCanvas(con, can, time) {
        con.beginPath();
        con.strokeStyle = con.fillStyle = this.main ? mainBallColor : this.fixedBeforeTouch ? ballColor: this.fixed ? lineColor : ballColor;
        con.lineWidth = lineWidth;
        con.shadowBlur = blur;
        con.shadowColor = this.main ? mainBallColorShadowColor : this.fixedBeforeTouch ? ballShadowColor: this.fixed ? lineShadowColor : ballShadowColor;
        if (this.fixedBeforeTouch && time) {
            const kf = Math.abs(Math.sin(2*(this.time+time)));
            this.time += time;
            const color = `rgb(${Math.round(Number(fixedBallColor.split(",")[0]) + (ballColor2.split(",")[0]-fixedBallColor.split(",")[0]) * kf)}, ${Math.round(Number(fixedBallColor.split(",")[1]) + (ballColor2.split(",")[1]-fixedBallColor.split(",")[1]) * kf)}, ${Math.round(Number(fixedBallColor.split(",")[2]) + (ballColor2.split(",")[2]-fixedBallColor.split(",")[2]) * kf)})`;
            con.strokeStyle = color;
            con.shadowColor = color;
            con.lineWidth *= (1+(1-kf)/5);
            console.log(color);
        }
        if (this.#fixed && this.angles[0] !== this.angles[1]) con.arc(this.#x+this.#radius, this.#y+this.#radius, this.#radius ,-this.angles[1], -this.angles[0]);
        else con.arc(this.#x+this.#radius, this.#y+this.#radius, this.#radius, 0, Math.PI*2);
        this.boombastick ? con.fill() : 0;
        con.stroke();
        con.closePath();
    }

    getInfo(){
        return {
            fixed: Number(this.fixed),
            angle1: this.fixed ? this.angles[0] : 0,
            angle2: this.fixed ? this.angles[1] : 0,
            x: this.x,
            y: this.y,
            vx: this.vector[0],
            vy: this.vector[1],
            ax: this.ax,
            ay: this.ay,
            m: this.mass,
            radius: this.radius,
            elos: Number(this.elos),
            gravity: Number(Boolean(this.gravity)),
            fixedBeforeTouch: Number(this.fixedBeforeTouch),
            main: Number(Boolean(this.main)),
            touchRemove: Number(this.touchRemove),
        };
    }

    set fixedBeforeTouch(a) {
        this.#fixedBeforeTouch = a;
        if (a) this.fixed = true;
    }

    get fixedBeforeTouch (){
        return this.#fixedBeforeTouch;
    }
}

class Finish {
    #x1 = 0;
    #y1 = 0;
    #x2 = 0;
    #y2 = 0;

    amount = 45;
    speed = 5;

    get x1() {
        return this.#x1;
    }

    get x2() {
        return this.#x2;
    }

    get y1() {
        return this.#y1;
    }

    get y2() {
        return this.#y2;
    }

    set x1(a) {
        this.#x1 = a;
        this.main();
    }

    set x2(a) {
        this.#x2 = a;
        this.main();
    }

    set y1(a) {
        this.#y1 = a;
        this.main();
    }

    set y2(a) {
        this.#y2 = a;
        this.main();
    }

    main() {
        const x1 = this.xx1 = Math.min(this.x1, this.x2);
        const y1 = this.yy1 = Math.min(this.y1, this.y2);
        const min = this.min = Math.min(Math.abs(this.x1-this.x2), Math.abs(this.y1-this.y2));
        const a = this.a = Math.min(min, Math.sqrt(Math.abs(this.x1-this.x2)*Math.abs(this.y1-this.y2)/this.amount));
        const xAmount = this.xAmount = Math.trunc(Math.abs(this.x1-this.x2)/a);
        const yAmount = this.yAmount = Math.trunc(Math.abs(this.y1-this.y2)/a);
        const xm = this.xm = (Math.abs(this.x1-this.x2)/a - xAmount)/2;
        const ym = this.ym = (Math.abs(this.y1-this.y2)/a - yAmount)/2;

        this.levels = xAmount+yAmount-2;
    }

    getInfo() {
        return {
            x1: this.x1,
            x2: this.x2,
            y1: this.y1,
            y2: this.y2
        };
    }

    constructor(pitch) {
        this.pitch = pitch;
        pitch.finish = this;
    }

    remove(){
        this.pitch.finish = null;
        this.pitch.renderCanvas();
    }

    fn(x) {
        return 1/(1+Math.E**(-x));
    }

    renderSquare(con, x, y, a, pos) {
        con.beginPath();
        const lightness = (this.fn(2-Math.abs(pos-this.p1))+this.fn(2-Math.abs(pos-this.p2)));
        con.fillStyle = `rgba(${finishColor},${lightness})`;
        con.shadowColor = `rgba(${finishShadowColor},${lightness})`;
        con.shadowBlur = blur;
        con.moveTo(x, y);
        con.lineTo(x+a, y);
        con.lineTo(x+a, y+a);
        con.lineTo(x, y+a);
        con.fill();
        con.closePath();
    }

    renderCanvas(con, time) {
        if (!this.isRendering && time) {
            this.isRendering = true;
            this.p1 = -5;
            this.p2 = this.levels/2;
        }
        else if (!time) {
            this.isRendering = false;
        }
        else if (this.isRendering && time) {
            this.p1 += time*this.speed;
            if (this.p1 > this.levels+5) this.p1 = -5;
            this.p2 += time*this.speed;
            if (this.p2 > this.levels+5) this.p2 = -5;
        }

        for (let i = 0; i < this.xAmount; i++) {
            for (let j = 0; j < this.yAmount; j++) {
                if ((i % 2) === (j % 2)) this.renderSquare(con, this.xx1+this.xm+this.a*i, this.yy1+this.ym+this.a*j,this.a, (this.levels-(this.yAmount-1-j))-i);
            }
        }
    }

}

var mainBallColor = "rgb(37, 90, 181)";
var mainBallColorShadowColor = "rgb(37, 90, 181)";
var lineColor = "rgb(252, 243, 211)";
var lineShadowColor = "rgb(175, 125, 46)";
var airColor = "rgba(165, 115, 41, 0.5)";
var ballColor = "rgb(254, 254, 254)";
var ballShadowColor = ballColor;
var lineWidth = 5;
var blur = 15;
var finishColor = "252, 243, 211";
var finishShadowColor = "175, 125, 46";
var startBackColor = "21, 10, 13";
var endBackColor = "60, 30, 40";
var startDrColor = "100, 50, 57";
var endDrColor = "60, 30, 40";
var ballColor2 = "254, 254, 254";
var fixedBallColor = "250, 223, 160";

class Shoot {
    constructor(time, type, target, data) {
        this.t = time;
        this.type = type;
        this.tar = target;
        if (data) this.data = data;
    }
}

function createLine(x1, y1, x2, y2) {
    const val = document.createElement("physics-line");
    [val.x1, val.y1, val.x2, val.y2] = [x1, y1, x2, y2];
    return val;
}


class flexLine {
    spots = [];
    linesSpots = [];
    lastSpot;
    lines = [];
    x1 = Infinity; x2 = -Infinity; y1 =Infinity ; y2 = -Infinity;

    getInfo() {
        const {x1, x2, y1, y2, lines, spots, linesSpots} = this;
        const obj = {
            x1, x2, y1, y2,
            lines: lines.map(i=>i.getInfo()),
            spots, linesSpots
        }
        return obj;
    }

    addToSystem(pitch) {
        pitch.addToFlexLinesSystem(this);
    }

    constructor(pitch) {
        this.pitch = pitch;
        this.addToSystem(pitch);
    }

    remove() {
        this.removeFromSystem(this.pitch);
    }

    addSpot(x, y){
        this.spots.push([x, y]);
        if (!this.linesSpots.length) {
            this.linesSpots.push([x,y]);
            this.lastSpot = [x, y];
        }
        if (x < this.x1) this.x1 = x;
        if (x > this.x2) this.x2 = x;
        if (y < this.y1) this.y1 = y;
        if (y > this.y2) this.y2 = y;

        const l = Math.sqrt(Math.pow(this.lastSpot[0] - x, 2)+Math.pow(this.lastSpot[1] - y, 2));

        if ((l > Llimit) && (l > 0)) {
            if (this.linesSpots.length === 1) {
                this.linesSpots.push([x,y]);
                const line = createLine(...this.lastSpot, x, y);
                this.lines.push(line);
            }
            else {
                const xx = [null, this.linesSpots[this.linesSpots.length-1][0], this.lastSpot[0], x];
                const yy = [null, this.linesSpots[this.linesSpots.length-1][1], this.lastSpot[1], y];
                const a = Math.sqrt(Math.pow(xx[1]-xx[2], 2)+Math.pow(yy[1]-yy[2], 2));
                const b = Math.sqrt(Math.pow(xx[1]-xx[3], 2)+Math.pow(yy[1]-yy[3], 2));
                const c = Math.sqrt(Math.pow(xx[3]-xx[2], 2)+Math.pow(yy[3]-yy[2], 2));
                const cos = (c*c - a*a - b*b)/(-2*a*b);
                if (cos < minCos) {
                    this.lines[this.lines.length-1].x2 = x;
                    this.lines[this.lines.length-1].y2 = y;
                    this.linesSpots.pop();
                    this.linesSpots.push([x, y]);
                }
                else {
                    const line = createLine(...this.lastSpot, x, y);
                    this.lines.push(line);
                    this.linesSpots.push([x, y]);
                }
            }
            this.lastSpot = [x, y];
        }

        this.pitch.renderCanvas();
    }
    removeFromSystem(pitch){
        pitch.removeFromFlexLinesSystem(this);
        pitch.renderCanvas();
    }
    renderCanvas(con) {

        con.moveTo(this.spots[0][0], this.spots[0][1]);
        for (let i = 1; i < this.spots.length; i++) con.lineTo(this.spots[i][0], this.spots[i][1]);

    }

}
// class Desk extends HTMLElement {
//     #x;
//     #y;
//     #vector;
//     #width;
//     #Static;
//     connectedCallback() {
//         if (!this.#Static) this.parentElement.addedToSystem(this);
//     }
//     static get observedAttributes() {
//         return ["x", "y", "width", "vector", "static"];
//     }
//     get x(){
//         return this.#x;
//     }
//     set x(x) {
//         this.#x = x;
//         this.style.left = x+"px";
//     }
//     set static(v) {
//         this.#Static = true;
//     }
//     get width() {
//         return this.#width;
//     }
//     set width(w) {
//         this.#width = w;
//         this.#radius = w/2;
//         this.style.width = this.style.height = w+"px";
//     }
//     set y(y) {
//         this.#y = y;
//         this.style.top = y+"px";
//     }
//     get y() {
//         return this.#y;
//     }
//     move(fps) {
//         console.log(this.vector[1]);
//         this.x = this.x+this.vector[0]/fps;
//         this.y = this.y+this.vector[1]/fps;
//     }
//     get vector() {
//         return this.#vector;
//     }
//     set vector(vector) {
//         this.#vector = vector.map(i=>Number(i));
//     }
// }
function normalize(num) {
    return Math.floor(num*100000000)/100000000;
}

class Line extends HTMLElement {
    #x1 = 0;
    #x2 = 0;
    #y1 = 0;
    #y2 = 0;

    connectedCallback() {
        this.parentElement.addedToLinesSystem(this);
    }


    renderCanvas(con) {

        con.moveTo(this.#x1, this.#y1);
        con.lineTo(this.#x2, this.#y2);

    }

    remove() {
        try{
            this.parentElement.removeFromLinesSystem(this.num);
            document.createElement("div").remove.call(this);
        }
        catch (e) {

        }
    }

    getInfo(){
        return {
            x1: this.x1,
            x2: this.x2,
            y1: this.y1,
            y2: this.y2
        };

    }

    isInRange(x){
        return this.x1 > this.x2 ? (x > this.x2 && this.x1 > x) : (x > this.x1 && this.x2 > x);
    }

    main() {
        const length = Math.sqrt(Math.pow(this.x1-this.x2, 2)+Math.pow(this.y1-this.y2, 2))
        this.style.width = `${length}px`;
        if (this.x1 === this.x2) this.#x1 -=0.0000001;
        if (this.y1 === this.y2) this.#y1 -=0.0000001;
        this.style.height = "1px";
        let angle = Math.acos((this.x2-this.x1)/(length));
        if (this.y2-this.y1 < 0) angle = -angle;
        this.style.transform = `rotate(${angle}rad) scaleY(10)`;
        this.style.left = `${(this.x1+this.x2)/2-length/2}px`;
        this.style.top = `${(this.y1+this.y2)/2}px`;


        this.k = (this.y1-this.y2)/(this.x1-this.x2);
        this.b = this.y1-this.k*this.x1;

        this.parentElement ? this.parentElement.renderCanvas() : 0;
    }

    attributeChangedCallback(name, old, act) {
        this[name] = Number(act);

        this.main();
    }

    get x1() {
        return this.#x1;
    }

    get x2() {
        return this.#x2;
    }

    get y1() {
        return this.#y1;
    }

    get y2() {
        return this.#y2;
    }

    set x1(act) {
        this.#x1 = Number(act);

        this.main();
    }

    set y1(act) {
        this.#y1 = Number(act);

        this.main();
    }

    set x2(act) {
        this.#x2 = Number(act);

        this.main();
    }

    set y2(act) {
        this.#y2 = Number(act);

        this.main();
    }

    static get observedAttributes() {
        return ["x1", "x2", "y1", "y2"];
    }
}

class drawObj {
    constructor(spots, color, pitch) {
        this.color = color;
        this.spots = spots;

        const spotsX = [];
        const spotsY = [];
        spots.forEach(i=>{spotsX.push(i[0]); spotsY.push(i[1])});
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

    getInfo() {
        return {
            color: this.color,
            spots: this.spots
        };
    }
}

var time;
var prev = Date.now();
var speed = 1;
var sensitiveness = 2;
var fps = 60;
var g = 1000;
var G = 1;
var start, stop, pitch;
class Physics extends HTMLElement {
    #elemsInSystem = [];
    #linesInSystem =[];
    #flexLinesInSystem = new Set();
    #gravitySpots = new Set();
    #airLines = new Set();
    #realFPS = 60;
    #speed = 1;
    #fps = this.#realFPS/this.#speed;
    #movie;
    #g = 1000;
    #G = 1;
    drawings = {background: new Set(), rocks: new Set(), contour: new Set(), all: new Set()};

    addDraw(spots, color) {
        this.drawings[color].add(spots);
        this.drawings.all.add(new drawObj(spots, color, this));
    }

    drawBySpots(spots, con) {
        con.moveTo(spots[0][0], spots[0][1]);
        spots.forEach(i=>con.lineTo(i[0], i[1]));
    }

    addAirLine(line) {
        this.#airLines.add(line);
    }

    win(){
        console.log("win");
        stop();
    }

    removeFromFlexLinesSystem(el){
        this.#flexLinesInSystem.delete(el);
        let linesInFl = 0;
        for (const i of this.flexLinesInSystem) linesInFl+=i.lines.length;
        document.getElementById("lineamount").innerHTML = this.#linesInSystem.length+linesInFl;
    }

    addToFlexLinesSystem(el){
        this.#flexLinesInSystem.add(el);
        let linesInFl = 0;
        for (const i of this.flexLinesInSystem) linesInFl+=i.lines.length;
        document.getElementById("lineamount").innerHTML = this.#linesInSystem.length+linesInFl;
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

    renderCanvas(time){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.createGradient(this.context);

        this.context.beginPath();
        this.context.fillStyle = this.rocksGr;
        this.context.shadowBlur = 0;
        for (const i of this.drawings.rocks) this.drawBySpots(i, this.context);
        this.context.fill();
        this.context.closePath();

        this.context.beginPath();
        this.context.fillStyle = this.backgroundGr;
        this.context.shadowBlur = 0;
        for (const i of this.drawings.background) this.drawBySpots(i, this.context);
        this.context.fill();
        this.context.closePath();

        this.context.beginPath();
        this.context.strokeStyle = lineColor;
        this.context.lineWidth = lineWidth;
        this.context.shadowBlur = blur;
        this.context.shadowColor = lineShadowColor;
        this.context.lineCap = "round";

        for (let i of this.#linesInSystem) if (!(i instanceof airLine)) i.renderCanvas(this.context, this.canvas);
        for (let i of this.#flexLinesInSystem) i.renderCanvas(this.context, this.canvas);
        for (const i of this.drawings.contour) this.drawBySpots(i, this.context);

        this.context.stroke();
        this.context.closePath();

        for (let i of this.#airLines) i.renderCanvas(this.context);

        for (let i of this.#elemsInSystem) i.renderCanvas(this.context, this.canvas, time);
        if (this.finish) this.finish.renderCanvas(this.context, time);
    }

    constructor() {
        super();
        setTimeout(()=>{
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.canvas.width = this.getBoundingClientRect().width;
            this.canvas.height = this.getBoundingClientRect().width*6/5;
            this.canvas.style.position = "absolute";
            this.canvas.style.zIndex = "0";

            this.append(this.canvas);
            let gradient = this.context.createLinearGradient(0,0, 0,this.canvas.height);

            gradient.addColorStop(0, `rgb(${endBackColor})`);
            gradient.addColorStop(0.2, `rgb(${endBackColor})`);
            gradient.addColorStop(1, `rgb(${startBackColor})`);

            this.backgroundGr = gradient;

            gradient = this.context.createLinearGradient(0,0, 0,this.canvas.height);
            gradient.addColorStop(0, `rgb(${startDrColor})`);
            gradient.addColorStop(0.5, `rgb(${endDrColor})`);
            gradient.addColorStop(1, `rgb(${startDrColor})`);

            this.rocksGr = gradient;

            this.renderCanvas();

        });
        pitch = this;
        start = () => {
            this.start();
        };
        stop = () => {
            this.stop();
        }

    }
    static get observedAttributes() {
        return ["elos"];
    }
    attributeChangedCallback(name, old, act) {
        this[name] = Number(act);
    }
    get g(){
        return this.#g;
    }
    set g(g){
        this.#g = g;
    }
    get G(){
        return this.#G;
    }
    set G(G) {
        this.#G = G;
    }
    removeGravitySpot(a) {
        this.#gravitySpots.delete(a);
    }
    removeFromSystem(num) {
        this.#elemsInSystem = this.#elemsInSystem.slice(0, num).concat(this.#elemsInSystem.slice(num+1, this.#elemsInSystem.length));
        for (let i = num; i < this.#elemsInSystem.length; i++) this.#elemsInSystem[i].numElem = i;
        this.renderCanvas();
        document.getElementById("objamount").innerHTML = this.#elemsInSystem.length;
    }
    get speed() {
        return this.#speed;
    }
    set speed(a) {
        this.#speed = a;
        this.#fps = this.#realFPS/this.#speed;
    }
    get fps() {
        return this.#realFPS;
    }
    get elemsInSystem(){
        return this.#elemsInSystem;
    }
    set fps(a) {
        this.#realFPS = a;
        this.#fps = this.#realFPS/this.#speed;
    }
    main(time = 1/this.#fps) {
        let i = 0;
        const fps = this.#fps;
        let chvTime = 1/this.#fps/10;
        time = normalize(time);
        while (time > 0) {
            let timeIn = this.findSmallestTime(1/fps-time, 0.003, fps);
            i = 0;
            while (timeIn.t === 0) {
                timeIn = this.findSmallestTime(1/fps-time, 0.003, fps);
                i++
            }
            const time2 = timeIn.t;
            if (time2 > 1/this.#fps/10) {
                this.drawFrame(1/this.#fps/10);
                this.changeVectors(1/this.#fps/10);
                time = normalize(time - 1/this.#fps/10);
                continue;
            }
            chvTime = normalize(chvTime - time2);
            if (chvTime <= 0) {
                this.drawFrame(chvTime + time2);
                this.changeVectors(1/this.#fps/10);
                time = normalize(time - (chvTime + time2));
                chvTime = 1/this.#fps/10;
                continue;
            }

            this.drawFrame(time2);



            if (timeIn.type === "rw" || timeIn.type === "lw") {
                timeIn.tar.vector[0] = -1*timeIn.tar.vector[0]*(this.elos ? timeIn.tar.elos : 1);
                //console.log("lp");
            }
            else if (timeIn.type === "tw" || timeIn.type === "bw") {
                timeIn.tar.vector[1] = -1*timeIn.tar.vector[1]*(this.elos ? timeIn.tar.elos : 1);
                // console.log("dp");
            }
            // console.warn(Math.sqrt(Math.pow(this.#elemsInSystem[0].x-this.#elemsInSystem[1].x, 2)+Math.pow(this.#elemsInSystem[0].y-this.#elemsInSystem[1].y, 2)))
            else if (timeIn.type === "b") {
                this.createCircleVector(timeIn.data.main, timeIn.data.nomain);
            }
            else if (timeIn.type === "bl") {

                this.createLineCircleVector(timeIn.data.cr, timeIn.data.ln);
            }
            else if (timeIn.type === "bp") {

                this.createBallPointVector(timeIn.data.cr, timeIn.data.sp);
            }
            time = normalize(time - time2);

        }
        this.renderCanvas(1/this.#fps);

    }
    start() {

    this.inMain();
    this.play = true;


    }
    inMain() {
        this.#movie = setTimeout(()=>{
            this.inMain();
            this.main();
        }, 1000/this.#realFPS);
    }
    stop() {
        clearTimeout(this.#movie);
        this.play = false;
    }
    addedToSystem(elem) {
        this.#elemsInSystem.push(elem);
        elem.numElem = this.#elemsInSystem.length-1;
        this.renderCanvas();
        document.getElementById("objamount").innerHTML = this.#elemsInSystem.length;
    }

    addToGravitySystem(elem) {
        if (elem.gravity) {
            this.#gravitySpots.add(elem.gravity);
        }

    }

    addedToLinesSystem(line) {
        this.#linesInSystem.push(line);
        line.num = this.#linesInSystem.length-1;
        this.renderCanvas();
        let linesInFl = 0;
        for (const i of this.flexLinesInSystem) linesInFl+=i.lines.length;
        document.getElementById("lineamount").innerHTML = this.#linesInSystem.length+linesInFl;
    }

    removeFromLinesSystem(num) {
        this.#linesInSystem = this.#linesInSystem.slice(0, num).concat(this.#linesInSystem.slice(num+1, this.#linesInSystem.length));
        for (let i = num; i < this.#linesInSystem.length; i++) this.#linesInSystem[i].num = i;
        this.renderCanvas();
        let linesInFl = 0;
        for (const i of this.flexLinesInSystem) linesInFl+=i.lines.length;
        document.getElementById("lineamount").innerHTML = this.#linesInSystem.length+linesInFl;
    }

    drawFrame(time = 1/this.#fps) {
        for (const i of this.#elemsInSystem) {
            i.move(time);
            i.rotate(time);
        }
    }

    getGravity(sp, cr, fuck) {
        const x1 = sp.handler.x;
        const x2 = cr.x;
        const y1 = sp.handler.y;
        const y2 = cr.y;
        const r = Math.sqrt((x1-x2)**2+(y1-y2)**2);
        if (cr.radius + sp.handler.radius > r) return [0,0];
        const G = fuck ? 10000000 :this.#G;
        const m = sp.handler.mass;
        const f = G*(m*cr.mass)/(r**2)/cr.mass;
        const tg = Math.abs((y1-y2)/(x1-x2));
        let ax = f/Math.sqrt(tg**2+1);
        let ay = ax*tg;
        if (x2 > x1) ax=-ax;
        if (y2 > y1) ay=-ay;
        return [ax, ay];
    }

    createLineCircleVector(main, line) {

        const alpha = Math.atan(main.vector[1]/main.vector[0]);

        // const b2 = -1/line.k*main.x+main.y;
        // const x = (b2-line.b)/(line.k+1/line.k);
        // const y = line.k*x+line.b;

        const linesK = -1/line.k;



        if (!isFinite(linesK)) {
            main.vector[1] = -main.vector[1]*main.elos;
            return;
        }

        const newAlpha = Math.tan(alpha - Math.atan(linesK));
        let fullAngle = ((main.vector[0] >= 0) && (main.vector[1] >= 0) ? alpha*180/Math.PI : (main.vector[0] <= 0) && (main.vector[1] >= 0) ? (alpha+Math.PI)*180/Math.PI : (main.vector[0] <= 0) && (main.vector[1] <= 0) ? (alpha+Math.PI)*180/Math.PI : (alpha+Math.PI*2)*180/Math.PI)%360;
        const angleK = -(Math.atan(linesK)*180/Math.PI);
        const kfx1 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle+angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle+angleK+360)%360) % 180 <= 90))) ? (-1) : 1;
        const kfy1 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle+angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle+angleK+360)%360) % 180 >= 90))) ? (-1) : 1;
        const v1 = Math.sqrt(Math.pow(main.vector[0], 2)+Math.pow(main.vector[1], 2));
        let x1 = -v1/Math.sqrt(1+Math.pow(newAlpha, 2))*(kfx1)*main.vector[0]/Math.abs(main.vector[0]); //
        let y1 = Math.sqrt(Math.pow(v1, 2)-Math.pow(x1, 2))*(kfy1)*main.vector[1]/Math.abs(main.vector[1]);
        if (isNaN(y1)) {
            y1 = 0.0000000001*(kfy1)*main.vector[1]/Math.abs(main.vector[1]);

        }

        const elos1 = Math.pow(elosLimit/(Math.max(Math.abs(x1), elosLimit)), 1/3);
        x1 = x1*(main.elos ? elos1 : 1);

        // trenie
        // const xx1 = x1;
        // const kf1 = Math.abs(xx1)/xx1;
        // {
        //     let n = 1;
        //     let nomain = {mass: Infinity};
        //     const x1 = y1;
        //     const rs1 = main.rs;
        //
        //     let x1Save = 0;
        //
        //     let rs1Save = n * 1 * rs1 * (1-n);
        //
        //     let x1Give = x1 * (1-n) - x1Save;
        //
        //     let rs1Give = rs1 * (1-n) - rs1Save;
        //
        //     // const sumMain = main1(x1Give+rs1Give*Math.PI*main.radius*kf1, x2Give+rs2Give*Math.PI*nomain.radius*kf2);
        //     // const sumNomain = nomain1(x1Give+rs1Give*Math.PI*main.radius*kf1, x2Give+rs2Give*Math.PI*nomain.radius*kf2);
        //
        //     let self1 = (x1Give + rs1Give * Math.PI * main.radius) * main.mass * kf1;
        //
        //     let selfGive1 = self1*main.mass/(main.mass+nomain.mass);
        //     let selfSave1 = self1;
        //
        //
        //     y1 = y1*n+x1Save + n*(selfSave1)/main.mass;
        //     main.rs = rs1*n+rs1Save + (1-n)*(selfSave1)/(main.mass*Math.PI*main.radius);
        //
        // }
        // const n = 0.6;
        // const rs = main.rs;
        // // main.rs = n*main.rs + (1-n)*y1/Math.PI/main.radius*x1/Math.abs(x1);
        // // y1 = y1*n+Math.PI*main.radius*rs*(1-n)*x1/Math.abs(x1);
        //
        //
        // console.log(main.rs);


        // trenie

        const newYK = 1/linesK*(-1);
        const xv1x = x1/Math.sqrt(1+Math.pow(linesK, 2));
        const xv1y = xv1x*linesK;
        const yv1y = y1/Math.sqrt(1+Math.pow(1/newYK, 2));
        const yv1x = yv1y/newYK;

        main.vector = [(xv1x+yv1x),(xv1y+yv1y)];

    }

    createCircleVector(main, nomain) {
        if (main.radius === nomain.radius) {
            main.nearBalls.add(nomain);
            nomain.nearBalls.add(main);
        }
        // const speed = [main.vector[0]-nomain.vector[0], main.vector[1]-nomain.vector[1]];
        // const perSec = Math.sqrt(speed[0]*speed[0]+speed[1]*speed[1]);
        // const needTime = (main.width/2 + nomain.width/2 - s)/perSec;
        // console.log(needTime);
        // main.x = main.x-main.vector[0]*needTime;
        // main.y = main.y-main.vector[1]*needTime;
        // nomain.x = nomain.x-nomain.vector[0]*needTime;
        // nomain.y = nomain.y-nomain.vector[1]*needTime;
        // main.style.backgroundColor = randomColor();
        // nomain.style.backgroundColor = randomColor();
        if (main.fixed) {
            this.createBallPointVector(nomain, main, main.radius);
            return;
        }
        else if (nomain.fixed) {
            this.createBallPointVector(main, nomain, nomain.radius);
            return;
        }
        const alpha = Math.atan(main.vector[1]/main.vector[0]);
        const linesK = (main.y-nomain.y)/(main.x-nomain.x);

        if (!isFinite(linesK)) {
            const a = main.vector[1];
            main.vector[1] = nomain.vector[1]*main.elos;
            nomain.vector[1] = a*main.elos;
            return;
        }

        const newAlpha = Math.tan(alpha - Math.atan(linesK));
        let fullAngle = ((main.vector[0] >= 0) && (main.vector[1] >= 0) ? alpha*180/Math.PI : (main.vector[0] <= 0) && (main.vector[1] >= 0) ? (alpha+Math.PI)*180/Math.PI : (main.vector[0] <= 0) && (main.vector[1] <= 0) ? (alpha+Math.PI)*180/Math.PI : (alpha+Math.PI*2)*180/Math.PI)%360;
        const angleK = -(Math.atan(linesK)*180/Math.PI);
        const kfx1 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle+angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle+angleK+360)%360) % 180 <= 90))) ? (-1) : 1;
        const kfy1 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle+angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle+angleK+360)%360) % 180 >= 90))) ? (-1) : 1;
        const v1 = Math.sqrt(Math.pow(main.vector[0], 2)+Math.pow(main.vector[1], 2));
        let x1 = v1/Math.sqrt(1+Math.pow(newAlpha, 2))*(kfx1)*main.vector[0]/Math.abs(main.vector[0]); //
        let y1 = Math.sqrt(Math.pow(v1, 2)-Math.pow(x1, 2))*(kfy1)*main.vector[1]/Math.abs(main.vector[1]); //
        const alpha2 = Math.atan(nomain.vector[1]/nomain.vector[0]);
        fullAngle = ((nomain.vector[0] >= 0) && (nomain.vector[1] >= 0) ? alpha2*180/Math.PI : (nomain.vector[0] <= 0) && (nomain.vector[1] >= 0) ? (alpha2+Math.PI)*180/Math.PI : (nomain.vector[0] <= 0) && (nomain.vector[1] <= 0) ? (alpha2+Math.PI)*180/Math.PI : (alpha2+Math.PI*2)*180/Math.PI)%360;
        const kfx2 = ((angleK >= 0 && (fullAngle % 180 <= 90) && (fullAngle+angleK) % 180 >= 90) || (angleK <= 0 && (fullAngle % 180 >= 90) && (((fullAngle+angleK+360)%360) % 180 <= 90))) ? (-1) : 1;
        const kfy2 = ((angleK >= 0 && (fullAngle % 180 >= 90) && (fullAngle+angleK) % 180 <= 90) || (angleK <= 0 && (fullAngle % 180 <= 90) && (((fullAngle+angleK+360)%360) % 180 >= 90))) ? (-1) : 1;
        const newAlpha2 = Math.tan(alpha2 - Math.atan(linesK));

        const v2 = Math.sqrt(Math.pow(nomain.vector[0], 2)+Math.pow(nomain.vector[1], 2));
        let x2 = v2/Math.sqrt(1+Math.pow(newAlpha2, 2))*(kfx2)*nomain.vector[0]/Math.abs(nomain.vector[0]); //

        let y2 = Math.sqrt(Math.pow(v2, 2)-Math.pow(x2, 2))*(kfy2)*nomain.vector[1]/Math.abs(nomain.vector[1]); //

        // Change x speeds
        const elos1 = Math.pow(elosLimit/(Math.max(Math.abs(x1-x2), elosLimit)), 1/3);


        // // trenie
        // const xx1 = x1;
        // const xx2 = x2;
        // const kf1 = Math.abs(xx1)/xx1*((Math.abs(x1) < Math.abs(x2) && x1*x2 > 0) ? (-1) : 1);
        // const kf2 = Math.abs(xx2)/xx2*((Math.abs(x2) < Math.abs(x1) && x1*x2 > 0) ? (-1) : 1);
        // {
        //     const x1 = y1;
        //     const x2 = y2;
        //     const n = 1;
        //     const rs1 = main.rs;
        //     const rs2 = nomain.rs;
        //
        //     function main1(m, n){
        //         return ((main.mass-nomain.mass)*m+2*nomain.mass*n)/(main.mass+nomain.mass);
        //     }
        //
        //     function nomain1(m, n){
        //         return (2*main.mass*m+(nomain.mass-main.mass)*n)/(main.mass+nomain.mass);
        //     }
        //
        //     let x1Save = n*main.mass/(main.mass+nomain.mass)*x1*(1-n);
        //     let x2Save = n*nomain.mass/(main.mass+nomain.mass)*x2*(1-n);
        //     let rs1Save = n*main.mass/(main.mass+nomain.mass)*rs1*(1-n);
        //     let rs2Save = n*nomain.mass/(main.mass+nomain.mass)*rs2*(1-n);
        //     let x1Give = (n-1)*x1-x1Save;
        //     let x2Give = (n-1)*x2-x2Save;
        //     let rs1Give = (n-1)*rs1 - rs1Save;
        //     let rs2Give = (n-1)*rs2 - rs2Save;
        //     // const sumMain = main1(x1Give+rs1Give*Math.PI*main.radius*kf1, x2Give+rs2Give*Math.PI*nomain.radius*kf2);
        //     // const sumNomain = nomain1(x1Give+rs1Give*Math.PI*main.radius*kf1, x2Give+rs2Give*Math.PI*nomain.radius*kf2);
        //
        //     let self1 = (x1Give+rs1Give*Math.PI*main.radius)*main.mass*kf1;
        //     let self2 = (x2Give+rs2Give*Math.PI*nomain.radius)*nomain.mass*kf2;
        //
        //     let selfGive1 = self1*main.mass/(main.mass+nomain.mass);
        //     let selfSave1 = self1*nomain.mass/(main.mass+nomain.mass);
        //     let selfGive2 = self2*nomain.mass/(main.mass+nomain.mass);
        //     let selfSave2 = self2*main.mass/(main.mass+nomain.mass);
        //
        //     y1 = y1*n+x1Save + n*(selfSave1 + selfGive2)/main.mass;
        //     y2 = y2*n+x2Save + n*(selfSave2 + selfGive1)/nomain.mass;
        //     main.rs = rs1*n+rs1Save + (1-n)*(selfSave1 + selfGive2)/(main.mass*Math.PI*main.radius);
        //     nomain.rs = rs2*n+rs2Save + (1-n)*(selfSave2 + selfGive1)/(nomain.mass*Math.PI*nomain.radius);
        //
        //     console.log(kf1, kf2);
        //
        // }
        //
        //
        // // trenie

        let a = x1;
        let b = x2;
        if (main.fixed) {
            x2 = -x2;

            x2 = x2*(nomain.elos ? elos1 : 1);
        }
        else if (nomain.fixed) {
            x1 = -x1;

            x1 = x1*(main.elos ? elos1 : 1);
        }
        else {
            x1 = ((main.mass-nomain.mass)*x1+2*nomain.mass*x2)/(main.mass+nomain.mass);

            x2 = (2*main.mass*a+(nomain.mass-main.mass)*x2)/(main.mass+nomain.mass);
            const diff1 = x1 - a;
            const diff2 = x2 - b;

            x1 = a+diff1*(main.elos ? elos1 : 1);
            x2 = b+diff2*(nomain.elos ? elos1 : 1);
        }


        // if (main.mass > nomain.mass) {
        //     let elos2 = 1-(1-elos1)*(nomain.mass/main.mass);
        // }
        // else {
        //     let elos2 = 1-(1-elos1)*(main.mass/nomain.mass);
        //     x1 = a+diff1*(this.elos ? elos1 : 1);
        //     x2 = b+diff2*(this.elos ? elos2 : 1);
        // }
        // var elos1 = 1-(1-elos)*Math.sqrt(main.mass/nomain.mass);
        // const elos2 = 1-(1-elos)*Math.sqrt(nomain.mass/main.mass);


        // console.log(elos1, elos2);
        // x1 = x2;
        // x2 = a;
        // Changed x speeds
        // Remove into regular system
        const newYK = 1/linesK*(-1);
        const xv1x = x1/Math.sqrt(1+Math.pow(linesK, 2));
        const xv1y = xv1x*linesK;
        const yv1y = y1/Math.sqrt(1+Math.pow(1/newYK, 2));
        const yv1x = yv1y/newYK;
        const xv2x = x2/Math.sqrt(1+Math.pow(linesK, 2));
        const xv2y = xv2x*linesK;
        const yv2y = y2/Math.sqrt(1+Math.pow(1/newYK, 2));
        const yv2x = yv2y/newYK;
        const resultMain = [(xv1x+yv1x),xv1y+yv1y];
        const resultNotMain = [(xv2x+yv2x), (xv2y+yv2y)];
        main.vector = resultMain;
        nomain.vector = resultNotMain;



        // main.vectorSum = [main.vectorSum[0]-main.vector[0]+resultMain[0], main.vectorSum[1]-main.vector[1]+resultMain[1]];
        // nomain.vectorSum = [nomain.vectorSum[0]-nomain.vector[0]+resultNotMain[0], nomain.vectorSum[1]-nomain.vector[1]+resultNotMain[1]];
        // if (main.destroyer) nomain.width = 0;
        // else if (nomain.destroyer) main.width = 0;
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
            j.vector = [j.vector[0]+(j.ax+ax)*time, j.vector[1]+this.#g*time+(j.ay+ay)*time];

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
        else time = new Shoot(1/fps - part, true);
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
                if (time2.data.l < 2.1*k.radius) amount++;
                else setTimeout(()=>{j.nearBalls.delete(k); k.nearBalls.delete(j)});
                {
                    time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                }


            }
            if (amount === 6) {
                amount112++;
                continue;
            }
            else amount111++;
            for (let n = i+1, k = this.#elemsInSystem[n]; n < this.#elemsInSystem.length; n++, k = this.#elemsInSystem[n]) {
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

                    if (time2.data.l < 2.1*k.radius) {
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
                    }
                    else this.createBallPointVector(j, time2.data.sp);
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
                            }
                            else this.createBallPointVector(j, time2.data.sp);
                            [j.x, j.y] = cords;
                        }


                        time = ((time2.t < time.t && reverse && time2.t > smallest) || (time2.t < time.t && !reverse)) ? time2 : time;
                    }

                }
            }

            //
            // j.vector = [j.vector[0]+j.vectorSum[0], j.vector[1]+j.vectorSum[1]];
            // j.vectorSum = [0,0];
        }
        time.t = normalize(time.t);
        return time;
    }

    findSmallestFlexLinesCircleTime(ball, fl) {
        const x1 = fl.x1-ball.radius-lineWidth/2;
        const x2 = fl.x2+ball.radius+lineWidth/2;
        const y1 = fl.y1-ball.radius-lineWidth/2;
        const y2 = fl.y2+ball.radius+lineWidth/2;
        if (ball.x > x1 && ball.y > y1 && ball.x < x2 && ball.y < y2) return -Infinity;
        else {
            let tx1 = Math.max((x1-ball.x)/ball.vector[0], 0);
            let tx2 = Math.max((x2-ball.x)/ball.vector[0], 0);
            let ty1 = Math.max((y1-ball.y)/ball.vector[1], 0);
            let ty2 = Math.max((y2-ball.y)/ball.vector[1], 0);

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
        const result = Math.atan(-(main.y-fixed.y)/(main.x-fixed.x))+(main.x-fixed.x > 0 ? 0 : Math.PI);
        main.x = cords[0];
        main.y = cords[1];
        return result < 0 ? result + 2*Math.PI:result;
    }

    findSmallestCircleTime(main, nomain, move){
        if (main.fixed && nomain.fixed) return new Shoot(Infinity, "b", null, {main, nomain});
        const v1 = main.vector;
        const v2 = nomain.vector;
        const x1 = main.x;
        const x2 = nomain.x;
        const y1 = main.y;
        const y2 = nomain.y;
        const a = Math.pow(v1[0]-v2[0],2)+Math.pow(v1[1]-v2[1],2);
        const b = 2*((x1-x2)*(v1[0]-v2[0])+(y1-y2)*(v1[1]-v2[1]));
        let l = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
        let t = Infinity;
        if (l > main.radius+nomain.radius) {
            l = l - lineWidth;
            var c = l*l-Math.pow((main.width+nomain.width)/2, 2);
            var d = Math.pow(b, 2)-4*a*c;
            if (d > 0) {
                const t1 = (-b+Math.sqrt(d))/2/a;
                const t2 = (-b-Math.sqrt(d))/2/a;
                if (t1*t2<0) {
                    t = Infinity;
                }
                if (t1 >= 0 && t2 >= 0) {
                    t = Math.min(t1, t2);
                    if (main.fixed && main.angles) {
                        const a = this.findSpot(main, nomain, t);
                        if (!((a > main.angles[0] && a < main.angles[1] && main.angles[0] < main.angles[1]) || (main.angles[0] >= main.angles[1] && (a > main.angles[0] || a < main.angles[1])))) t = Infinity;
                    }
                    else if (nomain.fixed && nomain.angles) {
                        const a = this.findSpot(nomain, main, t);
                        if (!((a > nomain.angles[0] && a < nomain.angles[1] && nomain.angles[0] < nomain.angles[1]) || (nomain.angles[0] >= nomain.angles[1] && (a > nomain.angles[0] || a < nomain.angles[1])))) t = Infinity;
                    }
                }
            }
        }
        else if (l < Math.abs((main.width - nomain.width)/2)) {
            l = l + lineWidth;
            c = l*l-Math.pow((main.width - nomain.width)/2, 2);
            d = Math.pow(b, 2)-4*a*c;
            if (d > 0) {
                const t1 = (-b+Math.sqrt(d))/2/a;
                const t2 = (-b-Math.sqrt(d))/2/a;

                if (t1*t2>0) {
                    t = Infinity;
                }
                else if ((t1 >= 0 && t2 < 0) || (t1 < 0 && t2 >= 0)){
                    t = Math.min(Math.max(t1, t2), t);
                    if (main.fixed && main.angles) {
                        const a = this.findSpot(main, nomain, t);

                        if (!((a > main.angles[0] && a < main.angles[1] && main.angles[0] < main.angles[1]) || (main.angles[0] >= main.angles[1] && (a > main.angles[0] || a < main.angles[1])))) t = Infinity;
                    }
                    else if (nomain.fixed && nomain.angles) {
                        const a = this.findSpot(nomain, main, t);
                        if (!((a > nomain.angles[0] && a < nomain.angles[1] && nomain.angles[0] < nomain.angles[1]) || (nomain.angles[0] >= nomain.angles[1] && (a > nomain.angles[0] || a < nomain.angles[1])))) t = Infinity;
                    }
                }
            }
        }

        if (main.fixed && main.angles) {
            const sp1 = {x: Math.cos(main.angles[0])*main.radius+main.x, y: -Math.sin(main.angles[0])*main.radius+main.y};
            const sp2 = {x: Math.cos(main.angles[1])*main.radius+main.x, y: -Math.sin(main.angles[1])*main.radius+main.y};

            const t3 = this.findSmallestCircleSpotTime(nomain, sp1);
            const t4 = this.findSmallestCircleSpotTime(nomain, sp2);
            const t5 = t3.t < t4.t ? t3 : t4;
            if (t5.t < t) {

                return t5;
            }
        }
        else if (nomain.fixed && nomain.angles) {
            const sp1 = {x: Math.cos(nomain.angles[0])*nomain.radius+nomain.x, y: -Math.sin(nomain.angles[0])*nomain.radius+nomain.y};
            const sp2 = {x: Math.cos(nomain.angles[1])*nomain.radius+nomain.x, y: -Math.sin(nomain.angles[1])*nomain.radius+nomain.y};

            const t3 = this.findSmallestCircleSpotTime(main, sp1);
            const t4 = this.findSmallestCircleSpotTime(main, sp2);
            const t5 = t3.t < t4.t ? t3 : t4;
            if (t5.t < t) return t5;
        }

        return new Shoot(t, "b", null, {main, nomain, l});

        // const speed = [main.vector[0]-nomain.vector[0], main.vector[1]-nomain.vector[1]];
        // const perSec = Math.sqrt(speed[0]*speed[0]+speed[1]*speed[1]);
        // return (s)/perSec;
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

    findSmallestCircleSpotTime(cr, sp, r2 = lineWidth/2) {
        const x1 = cr.x;
                const y1 = cr.y;
                const x2 = sp.x;
                const y2= sp.y;
                const vx = cr.vector[0];
                const vy = cr.vector[1];
                const r = cr.radius;
                const a = vy*vy+vx*vx;
                const b = 2*( (x1-x2) * vx + (y1-y2) * vy);
                const l = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))-lineWidth;
                const c = l*l-Math.pow((cr.width)/2, 2);
                const [time1, time2] = qdr(a,b,c);
                if (time1 >= 0 && time2 >= 0) return new Shoot(normalize(Math.min(time1, time2)), "bp", null, {cr, sp});
                else return new Shoot(Infinity, "bp", null, {cr, sp});
    }

    createBallPointVector(cr, sp){
        const x1 = cr.x;
        const x2 = sp.x;
        const y1 = cr.y;
        const y2 = sp.y;
        const k1 = (y1-y2)/(x1-x2);
        // const b1 = y1-k1*x1;
        const k2 = -1/k1;

        // const b2 = y2-k2*x2;
        this.createLineCircleVector(cr, {k: k2});
    }

    setPlease({x,y}) {
        this.#gravitySpots[0] = {x,y, m: 1};
    }
}

function qdr(a,b,c) {
    const d = b*b-4*a*c;
    return d > 0 ? [(-b+Math.sqrt(d))/(2*a), (-b-Math.sqrt(d))/(2*a)] : d === 0 ? [-b/(2*a), -b/(2*a)] : [NaN];
}

let n = 2;
// setTimeout(()=>{
//     pitch.addEventListener("click", (e)=>{
//         if (n > 300) return;
//         console.log(e.pageY, e.pageX);
//         add(e.pageX, e.pageY);
//         console.log(++n);
//     });
// });

var elosLimit = 20;
const inputelos = (event) => {
    const num = Number(event.target.value);
    if (!isNaN(num) && num > 0) {
        elosLimit = num;
    }
}
const popup = document.getElementById("popup");
const itemSelect = document.getElementById("itemSelect");
const colorSelect = document.getElementById("colorSelect");
const doneBt = document.getElementById("doneBt");
const ballMenu = document.getElementById("ballMenu");
const mainMenu = document.getElementById("mainMenu");
const finishMenu = document.getElementById("finishMenu");
let ballXCord = document.getElementById("ballXCord");
let ballYCord = document.getElementById("ballYCord");
const ballMoveAnimation = document.getElementById("ballMoveAnimation");
const sameMovingBall = () => document.getElementById("sameMovingBall");
const ballVX = document.getElementById("ballXSpeed");
const ballVY = document.getElementById("ballYSpeed");
const ballXA = document.getElementById("ballXA");
const ballYA = document.getElementById("ballYA");
const durIn = document.getElementById("durIn");
const fixedBallMenu = document.getElementById("fixedBallMenu");
const lineMenu = document.getElementById("lineMenu");
const forl2 = document.getElementById("forl2");





customElements.define("physics-circle", Circle);
customElements.define("physics-area", Physics);
customElements.define("physics-line", Line);

const buttons = {
    start: ()=>start(),
    stop:()=> stop(),
    setSpeed(s) {
        pitch.speed = s;
        speed = s;
    },
    setFps(f) {
        pitch.fps = f;
        fps = f;
    },
    setg(gg) {
        pitch.g = gg;
        g = gg;
    },
    setG(gg) {
        pitch.G = gg;
        G = gg;
    },
    getDuration(){
        return showDuration;
    },
    setDuration(d){
        showDuration = d;
        durIn.innerHTML = d;
    },

    durationInput(event) {
        buttons.setDuration(event.target.value/100);
    },

    fps: {
        oninput(event) {
            const num = Number(event.target.value);
            if (!isNaN(num) && num <= 200 && num > 0) {
                buttons.setFps(num);
            }
        },
    },

    speed: {
        oninput(event) {
            const num = Number(event.target.value);
            if (!isNaN(num) && num > 0) {
                buttons.setSpeed(num);
            }
        }
    },

    g: {
        oninput(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                buttons.setg(num);
            }
        }
    },

    G: {
        oninput(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                buttons.setG(num);
            }
        }
    },

    newBall: {
        setRadius(r) {
            newBall.r = r;
            if (pitch.children[0].classList.contains("lowVisible")) {
                pitch.children[0].style.width = newBall.r*2+"px";
                pitch.children[0].style.height = newBall.r*2+"px";
                pitch.children[0].style.left = newBall.x-newBall.r+"px";
                pitch.children[0].style.top = newBall.y-newBall.r+"px";

            }
            else if (newBall.ball) {
                newBall.ball.width = 2*r;
                if (newBall.fixed) {
                    setAngle(document.getElementById("angle1").children[0], newBall.ball.angles[0]);
                    setAngle(document.getElementById("angle2").children[0], newBall.ball.angles[1]);
                }
            }
        },

        ballRadius(event){
            const num = Number(event.target.value);
            if (!isNaN(num) && num > 0) {
                buttons.newBall.setRadius(num);
            }
        },

        m(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                newBall.m = num;
                if (newBall.ball) newBall.ball.mass = num;
            }
        },

        elos(event) {
            if (event.target.checked){
                newBall.elos = true;
                if (newBall.ball) newBall.ball.elos = 1;
            }
            else{
                newBall.elos = false;
                if (newBall.ball) newBall.ball.elos = -1;
            }
        },

        vx(event) {

            const num = Number(event.target.value);
            if (!isNaN(num)) {
                newBall.vx = num;
                if (newBall.ball) newBall.ball.vector = [num, newBall.ball.vector[1]];
            }
        },

        vy(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                newBall.vy = num;
                if (newBall.ball) newBall.ball.vector = [newBall.ball.vector[0],num];
            }
        },

        ax(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                newBall.ax = num;
                if (newBall.ball) newBall.ball.ax = num;
            }
        },

        ay(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                newBall.ay = num;
                if (newBall.ball) newBall.ball.ay = num;
            }
        },

        gravity(event) {
            if (event.target.checked){
                newBall.gravity = true;
                if (newBall.ball) newBall.ball.gravity = 1;
            }
            else{
                newBall.gravity = false;
                if (newBall.ball) newBall.ball.gravity = -1;
            }
        },
        x(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                if (newBall.ball) {
                    newBall.ball.x = num;
                }
                else pitch.children[0].classList.contains("lowVisible") ? pitch.children[0].style.left = num-newBall.r+"px": 0;
                newBall.x = num;
            }
        },
        y(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                if (newBall.ball) {
                    newBall.ball.y = num;
                }
                else pitch.children[0].classList.contains("lowVisible") ? pitch.children[0].style.top = num-newBall.r+"px": 0;
                newBall.y = num;
            }
        },
        f(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                if (newBall.ball) {
                    newBall.ball.f = num;
                }
                newBall.f = num;
            }
        },
        rboom(event) {
            const num = Number(event.target.value);
            if (!isNaN(num)) {
                if (newBall.ball) {
                    newBall.ball.rboom = num;
                }
                newBall.rboom = num;
            }
        },
        angle1F(event) {
            let num = Number(event.target.value);
            if (!isNaN(num)) {
                num = num > 0 ? num%360 : 360 - Math.abs(num)%360;
                setAngle(document.getElementById("angle1").firstElementChild, num/180*Math.PI);
            }
        },
        angle2F(event) {
            let num = Number(event.target.value);
            if (!isNaN(num)) {
                num = num > 0 ? num%360 : 360 - Math.abs(num)%360;
                setAngle(document.getElementById("angle2").firstElementChild, num/180*Math.PI);
            }
        },
    },

    inputSensitive(event) {
        sensitiveness = Number(event.target.value/100);
        document.getElementById("sns").innerHTML = event.target.value/100;
    },
    Llimit(event) {
        const num = Number(event.target.value);
        if (!isNaN(num)) {
            if (num >= 0) Llimit = num;
        }
    },
    minCos(event) {
        const num = Number(event.target.value);
        if (!isNaN(num)) {
            if (num >= 0 && num <= 1) minCos = -num;
        }
    },
    lineF(event) {
        const num = Number(event.target.value);
        if (!isNaN(num)) {
            lineF = num;
            line.forEach(i=>i.f = num);
        }
    },
    lineLength(event) {
        const num = Number(event.target.value);
        if (!isNaN(num)) {
            lineLength = num;
            line.forEach(i=>i.length = num);
            console.log(line);
        }
    },
}
const inputLlimit = buttons.Llimit;
const inputMinCos = buttons.minCos;
const inputFps = buttons.fps.oninput;
const inputSpeed = buttons.speed.oninput;
const inputg = buttons.g.oninput;
const inputG = buttons.G.oninput;
const inputRadius = buttons.newBall.ballRadius;
const inputMass = buttons.newBall.m;
const inputEnergyL = buttons.newBall.elos;
const inputXSpeed = buttons.newBall.vx;
const inputYSpeed = buttons.newBall.vy;
const inputXA = buttons.newBall.ax;
const inputYA = buttons.newBall.ay;
const inputBallGravity = buttons.newBall.gravity
const inputDuration = buttons.durationInput;
const inputSensitive = buttons.inputSensitive;
const inputX = buttons.newBall.x;
const inputY = buttons.newBall.y;
const inputA1 = buttons.newBall.angle1F;
const inputA2 = buttons.newBall.angle2F;
const inputBoom = buttons.newBall.f;
const inputBoomRadius = buttons.newBall.rboom;
const inputLineF = buttons.lineF;
const inputLineLength = buttons.lineLength;
const inputFixedBeforePress = (event)=>{
    newBall.fixedBeforeTouch = event.target.checked;
}
const inputRemoveOnPress = (event) => {
    newBall.touchRemove = event.target.checked;
}
const inputMain = (event) => {
    newBall.main = event.target.checked;
}

function openPopup() {
    popup.classList.replace("passive", "active");
}

function closePopup() {

    popup.classList.replace("active", "passive");
}

document.getElementById("menu").addEventListener("pointerdown", (event) => {
    let fn;
    if (event.target.classList.contains("start")) {
        event.target.innerHTML = "Стоп";
        event.target.classList.replace("start", "stop");
        fn = "start";
    }
    else if (event.target.classList.contains("stop")) {
        event.target.innerHTML = "Старт";
        event.target.classList.replace("stop", "start");
        fn = "stop";
    }
    else if (event.target.classList.contains("addItem")) {
        openPopup();
    }
    else if (event.target.id === "endBall") {
        if (!newBall.ball) {
            newBall.x === null ? newBall.x = newBall.r: 0;
            newBall.y === null ? newBall.y = newBall.r: 0;
            addBallToSystem();
        }
        newBall.ball.innerHTML = "";
        newBall.ball.main = newBall.main;
        newBall.ball.touchRemove = newBall.touchRemove;
        newBall.ball.fixedBeforeTouch = newBall.fixedBeforeTouch;
        newBall.ball._info = newBall;
        newBall.ball.removeEventListener("pointerdown", changeBallSpeeds);
        newBall.ball.classList.remove("managing");
        clearInterval(setBallAnimation.innerInterval);
        mainMenu.classList.replace("passive", "active");
        ballMenu.classList.replace("active", "passive");
        pitch.classList.remove("addingCircle");
        newBall = null;
        document.removeEventListener("pointermove", fakeBallMove);
        pitch.removeEventListener("pointerdown", ballAdd);
    }
    else if (event.target.classList.contains("addBallRowSt")) {
        // if (!newBall.ball) {
        //     newBall.x === null ? newBall.x = newBall.r: 0;
        //     newBall.y === null ? newBall.y = newBall.r: 0;
        //     addBallToSystem();
        // }
        clearInterval(setBallAnimation.innerInterval);
        // mainMenu.classList.replace("passive", "active");
        // ballMenu.classList.replace("active", "passive");
        // pitch.classList.remove("addingCircle");
        setTimeout(()=>{if (newBall.ball) newBall.ball.remove();});
        document.removeEventListener("pointermove", fakeBallMove);
        pitch.removeEventListener("pointerdown", ballAdd);
        pitch.removeEventListener("pointerdown", startAddBallRow);
        pitch.addEventListener("pointerdown", startAddBallRow);
    }
    else if (event.target.id === "endFixedBall") {
        if (!newBall.ball) {
            newBall.x === null ? newBall.x = newBall.r: 0;
            newBall.y === null ? newBall.y = newBall.r: 0;
            addBallToSystem();
        }
        newBall.ball.innerHTML = "";
        newBall.ball._info = newBall;
        newBall.ball.classList.remove("managing");
        mainMenu.classList.replace("passive", "active");
        fixedBallMenu.classList.replace("active", "passive");
        pitch.classList.remove("addingCircle");
        newBall.ball.main = newBall.main;
        newBall.ball.touchRemove = newBall.touchRemove;
        newBall.ball.fixedBeforeTouch = newBall.fixedBeforeTouch;
        newBall = null;
        document.removeEventListener("pointermove", fakeBallMove);
        pitch.removeEventListener("pointerdown", ballAdd);
        document.removeEventListener("pointerdown", angleResize);
    }
    else if (event.target.id === "cancelBall") {
        ballsIn.forEach(i=>i.remove());
        ballsIn = [];
        balls = [];
        if (!newBall.ball) {
            newBall.x === null ? newBall.x = newBall.r: 0;
            newBall.y === null ? newBall.y = newBall.r: 0;
            addBallToSystem();
        }
        clearInterval(setBallAnimation.innerInterval);
        mainMenu.classList.replace("passive", "active");
        ballMenu.classList.replace("active", "passive");
        pitch.classList.remove("addingCircle");
        setTimeout(()=>{newBall?.ball?.remove(); newBall=null;});
        document.removeEventListener("pointermove", fakeBallMove);
        pitch.removeEventListener("pointerdown", ballAdd);
    }
    else if (event.target.id === "cancelFixedBall") {
        if (!newBall.ball) {
            newBall.x === null ? newBall.x = newBall.r: 0;
            newBall.y === null ? newBall.y = newBall.r: 0;
            addBallToSystem();
        }
        mainMenu.classList.replace("passive", "active");
        fixedBallMenu.classList.replace("active", "passive");
        pitch.classList.remove("addingCircle");
        setTimeout(()=>{newBall.ball.remove(); newBall=null;});
        document.removeEventListener("pointermove", fakeBallMove);
        pitch.removeEventListener("pointerdown", ballAdd);
        document.removeEventListener("pointerdown", angleResize);
    }
    else if (event.target.id === "endAmount") {
        if (lines === 0) {
            lineMenu.classList.replace("active", "passive");
            mainMenu.classList.replace("passive", "active");
            pitch.removeEventListener("pointerdown", addsp1, {once: true});
        }
        else if (lines === 1) {
            lineMenu.classList.replace("active", "passive");
            mainMenu.classList.replace("passive", "active");
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[0].remove();
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
            event.stopImmediatePropagation();
        }
        else {
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[lines-1].remove();
            event.stopImmediatePropagation();
        }
    }
    else if (event.target.id === "endLine" || event.target.id === "endLine2") {
        lineMenu.classList.replace("active", "passive");
        mainMenu.classList.replace("passive", "active");
        lineRow = null;
        if (lines === 0) {
            pitch.removeEventListener("pointerdown", addsp1, {once: true});
        }
        else if (lines === 1) {
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[0].remove();
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
        }
        else {
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
            line[lines-1].remove();
            event.stopImmediatePropagation();
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
        }
        line = null;
    }
    else if (event.target.id === "cancelLine" || event.target.id === "cancelLine2") {
        lineRow?.removeFromSystem(pitch);
        event.stopImmediatePropagation();
        lineMenu.classList.replace("active", "passive");
        mainMenu.classList.replace("passive", "active");
        document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
        line.forEach((item)=>{item.remove()});
        pitch.removeEventListener("pointerdown", addsp1, {once: true});
        document.removeEventListener("pointermove", movesp2in);
        document.removeEventListener("pointerdown", addLineFull, {once: true});
        lineRow = null;
        line = null;
    }
    else if (event.target.id === "areaDone") {
        pitch.removeEventListener("pointerdown", startArea);
        area?.remove();
        mainMenu.classList.replace("passive", "active");
        document.getElementById("areaMenu").classList.replace( "active", "passive");
    }
    else if (event.target.id === "areaDelete") {
        pitch.removeEventListener("pointerdown", startArea);
        area?.remove();
        mainMenu.classList.replace("passive", "active");
        document.getElementById("areaMenu").classList.replace( "active", "passive");
        for (let i of containment) {
            if (((i instanceof flexLine || i instanceof Line || i instanceof Circle) && moveEl) || (moveDr && i instanceof drawObj))i.remove();
        }
    }
    else if (event.target.id === "finishDone" || event.target.id === "finishCancel") {
        pitch.removeEventListener("pointerdown", startFinish);
        mainMenu.classList.replace("passive", "active");
        finishMenu.classList.replace( "active", "passive");
        document.removeEventListener("pointerup", endResizeArea);
        area?.remove();
        spot1?.remove();
        spot2?.remove();
        if (event.target.id === "finishCancel") finish.remove();
        pitch.renderCanvas();
        finish = null;
    }
    else if (event.target.id === "drawPause") {
        if (lines === 0) {
            document.getElementById("drawMenu").classList.replace("active", "passive");
            lineMenu.classList.replace("active", "passive");
            mainMenu.classList.replace("passive", "active");
            pitch.removeEventListener("pointerdown", addsp1, {once: true});
        }
        else if (lines === 1) {
            document.getElementById("drawMenu").classList.replace("active", "passive");
            lineMenu.classList.replace("active", "passive");
            mainMenu.classList.replace("passive", "active");
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[0].remove();
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
            event.stopImmediatePropagation();
        }
        else {
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[lines-1].remove();
            event.stopImmediatePropagation();
        }

    }
    else if (event.target.id === "drawDone") {
        lineWidth = realLineWidth;

        document.getElementById("drawMenu").classList.replace("active", "passive");
        lineMenu.classList.replace("active", "passive");
        mainMenu.classList.replace("passive", "active");
        if (lines === 0) {
            pitch.removeEventListener("pointerdown", addsp1, {once: true});
        }
        else if (lines === 1) {
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
            line[0].remove();
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
        }
        else {
            document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
            line[lines-1].remove();
            event.stopImmediatePropagation();
            document.removeEventListener("pointermove", movesp2in);
            document.removeEventListener("pointerdown", addLineFull, {once: true});
        }

        const spots = [];
        if (line && line.length) {

            line.forEach((i)=>spots.push([i.x1, i.y1]));
            // spots.push([line[line.length-1].x2, line[line.length-1].y2]);
            line.forEach(i=>i.remove());

            pitch.addDraw(spots, actualColor);
        }
        else if (lineRow) {
            lineRow.lines.forEach((i)=>spots.push([i.x1, i.y1]));
            // spots.push([line[line.length-1].x2, line[line.length-1].y2]);
            lineRow.remove();
            lineRow = null;

            pitch.addDraw(spots, actualColor);
        }


    }
    else if (event.target.id === 'drawDelete') {
        document.getElementById("drawMenu").classList.replace("active", "passive");
        lineRow?.removeFromSystem(pitch);
        event.stopImmediatePropagation();
        lineMenu.classList.replace("active", "passive");
        mainMenu.classList.replace("passive", "active");
        document.querySelectorAll(".moveSpot").forEach((item)=>item.remove());
        line.forEach((item)=>{item.remove()});
        pitch.removeEventListener("pointerdown", addsp1, {once: true});
        document.removeEventListener("pointermove", movesp2in);
        document.removeEventListener("pointerdown", addLineFull, {once: true});
        line = null;
        lineRow = null;
        lineWidth = realLineWidth;
    }

    pitch.renderCanvas();

    fn ? buttons[fn]() : false;
}, true);

function addFakeBall(){
    document.getElementById("main").insertAdjacentHTML('afterbegin', `<div class="lowVisible" style="width: ${newBall.r*2}px; height:  ${newBall.r*2}px; left: ${newBall.x-newBall.r}px; top: ${newBall.y-newBall.r}px;"><div id="sameMovingBall"></div></div>`);
}

function addBall(event) {

}
let actualColor = "background";

function changeColor(event) {
    actualColor = colorSelect.value;
}
let newBall = null;

const symbolBall = Symbol(), symbolFixedBall = Symbol();

const ballParams = {
    [symbolBall]: {
        r: 20,
        m: 1,
        elos: true,
        x: null,
        y: null,
        ax: 0,
        ay: 0,
        vx: 0,
        vy: 0,
        gravity: true,
        duration: 1,
        mode: "speed",
        sensitiveness: 2,
        fixed: false,
        f: 1,
        rboom: 50,
        main: false,
        fixedBeforeTouch: false,
        touchRemove: false

    },
    [symbolFixedBall]: {
        r: 40,
        m: 1,
        elos: true,
        x: null,
        y: null,
        ax: 0,
        ay: 0,
        vx: 0,
        vy: 0,
        gravity: true,
        duration: 1,
        mode: "speed",
        sensitiveness: 2,
        fixed: true,
        angle1: Math.PI*3/2,
        angle2: Math.PI*3/2,
        touchRemove: false
    }
}

let showDuration = 1, mode = "speed";

let moveEl = true;
let moveDr = true;

function inputMoveEl(event) {
    moveEl = event.target.checked;
    containment = getAreaContainment();
}

function inputMoveDr(event) {
    moveDr = event.target.checked;
    containment = getAreaContainment();
}

function setBallAnimation() {
    let t = 0;
    setBallAnimation.innerInterval = setInterval(()=>{
        t = t+1/60;
        if (t > showDuration) t = 0;
        sameMovingBall() ? sameMovingBall().style.transform = `translateX(${t*newBall.vx+t*t*newBall.ax/2}px) translateY(${t*newBall.vy+t*t*newBall.ay/2}px)` : false;
    }, 100/6);
}

let fakeBallMove = (event)=>{
    if (event.target.matches("#main *") || event.target === pitch || event.target.classList.contains("lowVisible")) {
        newBall.x = event.pageX-pitch.getBoundingClientRect().left;
        newBall.y = event.pageY-pitch.getBoundingClientRect().top;
        ballXCord.value = newBall.x;
        ballYCord.value = newBall.y;
        if (!pitch.children[0].classList.contains("lowVisible")) addFakeBall();
        else {
            pitch.children[0].style.left = newBall.x-newBall.r+"px";
            pitch.children[0].style.top = newBall.y-newBall.r+"px";
        }
    }
    else if (pitch.children[0].classList.contains("lowVisible")) pitch.children[0].remove();
}

function changeBallSpeedsIn(event) {
    changeBallSpeedsMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
}

function changeBallAIn(event) {
    changeBallAMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
}

function changeBallSpeedsMain(x1,y1){
    newBall.vx = (newBall.x-x1)*sensitiveness;
    newBall.vy = (newBall.y-y1)*sensitiveness;
    ballVX.value = newBall.vx;
    ballVY.value = newBall.vy;
    newBall.ball.vector = [newBall.vx, newBall.vy];
}

function changeBallAMain(x1,y1){
    newBall.ax = (newBall.x-x1)*sensitiveness;
    newBall.ay = (newBall.y-y1)*sensitiveness;
    ballXA.value = newBall.ax;
    ballYA.value = newBall.ay;
    newBall.ball.ax = newBall.ax;
    newBall.ball.ay = newBall.ay;
}

function changeBallSpeeds(event) {
    if (mode === "speed") {
        changeBallSpeedsMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
        document.addEventListener("pointermove", changeBallSpeedsIn);
        document.addEventListener("pointerup", (event)=>{
            document.removeEventListener("pointermove", changeBallSpeedsIn);
            changeBallSpeedsMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
        }, {once: true});
    }
    else if (mode === "a") {
        changeBallAMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
        document.addEventListener("pointermove", changeBallAIn);
        document.addEventListener("pointerup", (event)=>{
            document.removeEventListener("pointermove", changeBallAIn);
            changeBallAMain(event.pageX-pitch.getBoundingClientRect().left, event.pageY-pitch.getBoundingClientRect().top);
        }, {once: true});
    }
}

function changeBallPosition(event){
    event.stopImmediatePropagation();
    const x1 = event.pageX-newBall.x-pitch.getBoundingClientRect().left;
    const y1 = event.pageY-newBall.y-pitch.getBoundingClientRect().top;


    const moveBall = (event) => {
        newBall.x = Math.min(Math.max(0, event.pageX-pitch.getBoundingClientRect().left-x1), pitch.getBoundingClientRect().width);
        newBall.y = Math.min(Math.max(0,event.pageY-pitch.getBoundingClientRect().top-y1), pitch.getBoundingClientRect().height);
        ballXCord.value = newBall.x;
        ballYCord.value = newBall.y;
        newBall.ball.x = newBall.x;
        newBall.ball.y = newBall.y;
    }
    document.addEventListener("pointermove", moveBall);
    document.addEventListener("pointerup", (event)=>{
        moveBall(event);

        document.removeEventListener("pointermove", moveBall);
    }, {once: true});
}

function resizeBall(event){
    event.stopImmediatePropagation();
    const y = event.pageY - pitch.getBoundingClientRect().top + newBall.r;
    const changeR = (event) =>{
        let r = y - (event.pageY - pitch.getBoundingClientRect().top);
        if (r < 0) r = 0;
        document.getElementById(newBall.fixed ? "fixedBallRadius" : "ballRadius").value = r;
        newBall.r = r;
        newBall.ball.width = 2*r;
        if (newBall.fixed){
            setAngle(document.getElementById("angle1").children[0], newBall.ball.angles[0]);
            setAngle(document.getElementById("angle2").children[0], newBall.ball.angles[1]);
        }
    }
    document.addEventListener("pointermove", changeR);
    document.addEventListener("pointerup", (event)=>{
        changeR(event);
        document.removeEventListener("pointermove", changeR);
    }, {once: true});
}

function setAngle(el, angle) {

    el.parentElement.style.transform = `none`;
    el.parentElement.style.left = newBall.r + Math.cos(angle)*newBall.r - el.parentElement.getBoundingClientRect().width/2 + "px";
    el.parentElement.style.bottom = newBall.r + Math.sin(angle)*newBall.r - el.parentElement.getBoundingClientRect().height/2 + "px";
    el.parentElement.style.transform = `rotate(${-angle+Math.PI/2}rad)`;
    if (el.parentElement.id === "angle1") {
        newBall.ball.angles = [angle*180/Math.PI, newBall.ball.angles[1]*180/Math.PI];
        newBall.angle1 = angle;
    }
    else {
        newBall.ball.angles = [newBall.ball.angles[0]*180/Math.PI, angle*180/Math.PI];
        newBall.angle2 = angle;
    }
}

function calcAngle(x, y){
    const x1 = x - (newBall.ball.getBoundingClientRect().left+newBall.ball.getBoundingClientRect().width/2);
    const y1 = -y + (newBall.ball.getBoundingClientRect().top+newBall.ball.getBoundingClientRect().height/2);
    const a = Math.atan(y1/x1)+(x1 < 0 ? Math.PI : 0);
    return a > 0 ? a : a+2*Math.PI;
}



function angleResize(event) {
    if (event.target.classList.contains("angles")) {
        const elements = new Set(document.elementsFromPoint(event.pageX, event.pageY));
        if (elements.has(document.getElementById("angle1").firstElementChild)) {
            angleResize.resizeEl = document.getElementById("angle1").firstElementChild;
            angleResize.resizeAn = calcAngle(event.pageX, event.pageY)-calcAngle(angleResize.resizeEl.parentElement.getBoundingClientRect().left+angleResize.resizeEl.parentElement.getBoundingClientRect().width/2, angleResize.resizeEl.parentElement.getBoundingClientRect().top+angleResize.resizeEl.parentElement.getBoundingClientRect().height/2);
            document.addEventListener("pointermove", onAngleResize);
            document.addEventListener("pointerup", ()=>{
                document.removeEventListener("pointermove", onAngleResize);
            }, {once: true});

        }
        else if (elements.has(document.getElementById("angle2").firstElementChild)) {
            angleResize.resizeEl = document.getElementById("angle2").firstElementChild;
            angleResize.resizeAn = calcAngle(event.pageX, event.pageY)-calcAngle(angleResize.resizeEl.parentElement.getBoundingClientRect().left+angleResize.resizeEl.parentElement.getBoundingClientRect().width/2, angleResize.resizeEl.parentElement.getBoundingClientRect().top+angleResize.resizeEl.parentElement.getBoundingClientRect().height/2);
            document.addEventListener("pointermove", onAngleResize);
            document.addEventListener("pointerup", ()=>{
                document.removeEventListener("pointermove", onAngleResize);
            }, {once: true});

        }
    }
    else if (event.target.parentElement.classList.contains("angles")) {
        angleResize.resizeEl = event.target;
        angleResize.resizeAn = calcAngle(event.pageX, event.pageY)-calcAngle(angleResize.resizeEl.parentElement.getBoundingClientRect().left+angleResize.resizeEl.parentElement.getBoundingClientRect().width/2, angleResize.resizeEl.parentElement.getBoundingClientRect().top+angleResize.resizeEl.parentElement.getBoundingClientRect().height/2);
        document.addEventListener("pointermove", onAngleResize);
        document.addEventListener("pointerup", ()=>{
            document.removeEventListener("pointermove", onAngleResize);
        }, {once: true});

    }
}

function onAngleResize(event) {
    const newAngle1 = calcAngle(event.pageX, event.pageY)-angleResize.resizeAn;
    setAngle(angleResize.resizeEl, newAngle1);
    if (angleResize.resizeEl.parentElement.id === "angle1") document.getElementById("angle1Form").value = newAngle1*180/Math.PI;
    else document.getElementById("angle2Form").value = newAngle1*180/Math.PI;
}

function addBallToSystem(settings = true) {
    if (pitch.children[0].classList.contains("lowVisible")) pitch.children[0].remove();
    const name = newBall.boom ? "tnt-physics" : "physics-circle";
    document.getElementById("main").insertAdjacentHTML('afterbegin', `<${name} class="managing" mass="${newBall.m}" ${newBall.elos ? 'elos' : ""} rs="0" width="${newBall.r*2}" x="${newBall.x}" y="${newBall.y}" vector="${newBall.vx},${newBall.vy}" ax="${newBall.ax}" ay="${newBall.ay}" ${newBall.gravity ? "gravity":""} ${newBall.fixed ? "fixed":""}>${!newBall.fixed && settings ? `<div id="sameMovingBall"></div>` : ""}${settings ? `<div id="moveSpot"></div> <div class="resizer" id="resizer"></div>` : ""}${newBall.fixed ? `<div class="angles" id="angle1"><div></div></div><div class="angles" id="angle2"><div></div></div>`: ""}</${name}>`);
    newBall.ball = pitch.children[0];
    if (!newBall.fixed && settings) {
        newBall.ball.addEventListener("pointerdown", changeBallSpeeds);
    }
    else if (settings){
        setAngle(document.getElementById("angle1").children[0], newBall.angle1);
        setAngle(document.getElementById("angle2").children[0], newBall.angle2);
        document.addEventListener("pointerdown", angleResize);
    }
    if (newBall.ball.boombastick) {
        newBall.ball.f = newBall.f;
        newBall.ball.rboom = newBall.rboom;
    }
    if (settings) {
        document.getElementById("moveSpot").addEventListener("pointerdown", changeBallPosition, true);
        document.getElementById("resizer").addEventListener("pointerdown", resizeBall, true);
    }
}

let ballAdd = ()=>{
    document.removeEventListener("pointermove", fakeBallMove);
    pitch.removeEventListener("pointerdown", ballAdd);
    addBallToSystem();
    pitch.classList.remove("addingCircle");
}

function addBallInRow(event) {
    newBall.x = event.pageX-pitch.getBoundingClientRect().left;
    newBall.y = event.pageY-pitch.getBoundingClientRect().top;
    balls.push([newBall.x, newBall.y]);
    addBallToSystem(false);
    ballsIn.push(newBall.ball);
}

let balls = [];
let ballsIn = [];

function startAddBallRow(event) {
    console.log(event);
    balls = [];
    ballsIn = [];
    addBallInRow(event);
    document.addEventListener("pointermove", ifAddMoveBallRow);
    document.addEventListener("pointerup", endAddBallRow, {once: true})
}

function ifAddMoveBallRow(event) {
    const x = event.pageX-pitch.getBoundingClientRect().left;
    const y = event.pageY-pitch.getBoundingClientRect().top;
    for (let i of balls) {
        if (Math.sqrt(Math.pow(i[0]-x,2) + Math.pow(i[1]-y, 2)) < 2*newBall.r+lineWidth) return;
    }
    addBallInRow(event);
}

function endAddBallRow(event) {
    document.removeEventListener("pointermove", ifAddMoveBallRow);
    pitch.removeEventListener("pointerdown", startAddBallRow);
    pitch.classList.remove("addingCircle");
}

const adding = {
    ball() {
        ballXCord = document.getElementById("ballXCord");
        ballYCord = document.getElementById("ballYCord");
        mainMenu.classList.replace("active", "passive");
        ballMenu.classList.replace("passive", "active");
        pitch.classList.add("addingCircle");
        newBall = Object.assign({}, ballParams[symbolBall]);
        document.addEventListener("pointermove", fakeBallMove);
        pitch.addEventListener("pointerdown", ballAdd);
        setBallAnimation();
        document.getElementById("ballRadius").value = newBall.r;
        document.getElementById("ballMass").value = newBall.m;
        document.getElementById("ballenergyL").checked = newBall.elos;
        document.getElementById("ballXCord").value = newBall.x;
        document.getElementById("ballXSpeed").value = newBall.vx;
        document.getElementById("ballXA").value = newBall.ax;
        document.getElementById("ballYCord").value = newBall.y;
        document.getElementById("ballYSpeed").value = newBall.vy;
        document.getElementById("ballYA").value = newBall.ay;
        document.getElementById("ballGravity").checked = newBall.gravity;
        document.getElementById("makeMain").checked = false;
        document.getElementById("removeOnPress2").checked = false;
        document.getElementById("fixedBeforePress").checked = false;
        mode = newBall.mode;
        showDuration = newBall.duration;
        document.getElementById(mode).checked = true;
        document.getElementById("duration").value = showDuration*100;
        durIn.innerHTML = showDuration;
        document.getElementById("sensitive").value = sensitiveness*100;
        buttons.inputSensitive({target: {value: sensitiveness*100}});
        document.getElementById("bombBall").classList.add("passive");
        document.getElementById("bombBall").classList.remove("active");
    },
    bombBall() {
        this.ball();

        document.getElementById("bombBall").classList.add("active");
        document.getElementById("bombBall").classList.remove("passive");
        document.getElementById("ballBoom").value = newBall.f;
        document.getElementById("boomRadius").value = newBall.rboom;
        document.getElementById("makeMain").checked = false;
        document.getElementById("removeOnPress2").checked = false;
        document.getElementById("fixedBeforePress").checked = false;
        newBall.boom = true;
    },
    fixedBall(){
        mainMenu.classList.replace("active", "passive");
        fixedBallMenu.classList.replace("passive", "active");
        pitch.classList.add("addingCircle");
        newBall = Object.assign({}, ballParams[symbolFixedBall]);
        document.addEventListener("pointermove", fakeBallMove);
        pitch.addEventListener("pointerdown", ballAdd);

        document.getElementById("fixedBallRadius").value = newBall.r;
        document.getElementById("fixedBallMass").value = newBall.m;
        document.getElementById("fixedBallXCord").value = newBall.x;
        document.getElementById("fixedBallYCord").value = newBall.y;
        document.getElementById("fixedBallGravity").checked = newBall.gravity;
        document.getElementById("makeMain").checked = false;
        document.getElementById("removeOnPress2").checked = false;
        document.getElementById("fixedBeforePress").checked = false;

        ballXCord = document.getElementById("fixedBallXCord");
        ballYCord = document.getElementById("fixedBallYCord");


    },
    line(air){
        mainMenu.classList.replace("active", "passive");
        lineMenu.classList.replace("passive", "active");
        line = [];
        lines = 0;
        deleted = 0;
        pitch.addEventListener("pointerdown", addsp1, {once: true});
        forl2.classList.add("passive");
        forl2.classList.remove("active");
        if (air) {
            isAir = true;
            forl3.classList.add("active");
            forl3.classList.remove("passive");
        }
        else {
            isAir = false;
            forl3.classList.add("passive");
            forl3.classList.remove("active");
        }
    },
    line2(){
        mainMenu.classList.replace("active", "passive");
        lineMenu.classList.replace("passive", "active");
        line = [];
        lines = 0;
        deleted = 0;
        pitch.addEventListener("pointerdown", addLineRow, {once: true});
        forl2.classList.add("active");
        forl2.classList.remove("passive");
    },
    lineAir() {
        this.line(true);
    },
    area(){
        pitch.addEventListener("pointerdown", startArea, {once: true});
        mainMenu.classList.replace("active", "passive");
        document.getElementById("areaMenu").classList.replace( "passive", "active");
    },
    finish() {
        pitch.addEventListener("pointerdown", startFinish, {once: true});
        mainMenu.classList.replace("active", "passive");
        finishMenu.classList.replace( "passive", "active");
    },
    draw(){
        realLineWidth = lineWidth;
        lineWidth = 1;
        this.line();
        lineMenu.classList.replace("active", "passive");
        document.getElementById("drawMenu").classList.replace("passive", "active");
    },
    draw2(){
        realLineWidth = lineWidth;
        lineWidth = 1;
        this.line2();
        lineMenu.classList.replace("active", "passive");
        document.getElementById("drawMenu").classList.replace("passive", "active");
    }
}

let realLineWidth;

const forl3 = document.getElementById("forl3");

let lineF = 40;
let lineLength = 400;
let isAir = false;

let line = null;
let deleted;

const xChanger = document.getElementById("xChanger");
const yChanger = document.getElementById("yChanger");

function movesp1(line, num) {

    if (line[0]) {
        line[0].x1 =  document.getElementById("msp"+num).getBoundingClientRect().x + 10- pitch.getBoundingClientRect().x;
        line[0].y1 = document.getElementById("msp"+num).getBoundingClientRect().y + 10 - pitch.getBoundingClientRect().y;
    }
    if (line[1]) {
        line[1].x2 =  document.getElementById("msp"+num).getBoundingClientRect().x + 10- pitch.getBoundingClientRect().x;
        line[1].y2 = document.getElementById("msp"+num).getBoundingClientRect().y + 10 - pitch.getBoundingClientRect().y;
    }
    actualSpot = document.getElementById("msp"+num);
    actualLine = line;

    xChanger.value = document.getElementById("msp"+num).getBoundingClientRect().x + 10- pitch.getBoundingClientRect().x;
    yChanger.value = document.getElementById("msp"+num).getBoundingClientRect().y + 10 - pitch.getBoundingClientRect().y;

}

let actualSpot, actualLine

function changeX(event) {
    const num = Number(event.target.value);
    if (!isNaN(num) && actualLine && actualSpot) {
        actualSpot.style.left = num-10+"px";
        if (actualLine[0]) {
            actualLine[0].x1 = num;
        }
        if (actualLine[1]) {
            actualLine[1].x2 =  num;
        }
    }
}

function changeY(event) {
    const num = Number(event.target.value);
    if (!isNaN(num) && actualLine && actualSpot) {
        actualSpot.style.top = num-10+"px";
        if (actualLine[0]) {
            actualLine[0].y1 = num;
        }
        if (actualLine[1]) {
            actualLine[1].y2 =  num;
        }
    }
}

let lines = 0;

function inAddsp1(event, a = true) {
    const name = isAir ? "airline-physics" : "physics-line";
    line[lines] = document.createElement(name);
    if (isAir) {
        line[lines].f = lineF;
        line[lines].lenght = lineLength;
    }
    line[lines].x1 = event.pageX - pitch.getBoundingClientRect().x;
    line[lines].y1 = event.pageY - pitch.getBoundingClientRect().y;
    line[lines].x2 = line[lines].x1;
    line[lines].y2 = line[lines].y1;
    pitch.append(line[lines]);
    line[lines].classList.add("linelw");
    if (a) pitch.insertAdjacentHTML("afterbegin",`<div class='moveSpot' style="left: ${line[lines].x1-10}px; top: ${line[lines].y1-10}px;" id='msp${lines+1}' data-dnd='' data-dnd-Onmove='movesp1.call(null, [line[${lines}], ${lines > 0 ? `line[${lines-1}]`: ""}], ${lines+1})'></div><div class='moveSpot' style="left: ${line[lines].x1-10}px; top: ${line[lines].y1-10}px;" id='msp${lines+2}'></div>`);
    lines++;
}

function addsp1(event) {
    inAddsp1(event);
    document.addEventListener("pointermove", movesp2in);
    setTimeout(()=>document.addEventListener("pointerdown", addLineFull, {once: true}));
}

let lineRow;

function addLineRow(event){
    lineRow = new flexLine(pitch);
    lineRow.addSpot(event.pageX - pitch.getBoundingClientRect().x, event.pageY - pitch.getBoundingClientRect().y);
    document.addEventListener("pointerup", endLineRow, {once: true});
    document.addEventListener("pointermove", mainLine);
}

function endLineRow(event){
    document.removeEventListener("pointermove", mainLine);
}

let Llimit = 2;
let minCos = -0.99;
function mainLine(event) {
    const nx = event.pageX - pitch.getBoundingClientRect().x;
    const ny = event.pageY - pitch.getBoundingClientRect().y;
    lineRow.addSpot(nx, ny);
}

function movesp2(event) {
    line.x2 =  document.getElementById("msp2").getBoundingClientRect().x + 10 - pitch.getBoundingClientRect().x;
    line.y2 = document.getElementById("msp2").getBoundingClientRect().y + 10 - pitch.getBoundingClientRect().y;
}

function movesp2in(event, a = true) {
    line[lines-1].x2 = event.pageX - pitch.getBoundingClientRect().x;
    line[lines-1].y2 = event.pageY - pitch.getBoundingClientRect().y;
    if (a){
        document.getElementById(`msp${lines+1}`).style.left = line[lines-1].x2 - 10+"px";
        document.getElementById(`msp${lines+1}`).style.top = line[lines-1].y2 - 10+"px";
    }
}

function addLineFull(event, a = true) {
    line[lines-1].classList.remove("linelw");
    document.removeEventListener("pointermove", movesp2in);
    if (a) document.getElementById(`msp${lines+1}`).remove();
    if (lines >-1){
        if (a) addsp1(event)
        else {
            inAddsp1(event, a);
        }
    }
    else if (a) pitch.insertAdjacentHTML("afterbegin",`<div class='moveSpot' style="left: ${line[lines-1].x2-10}px; top: ${line[lines-1].y2-10}px;" id='msp${lines+1}' data-dnd='' data-dnd-Onmove='movesp1.call(null, [false, line[${lines-1}]], ${lines+1})'></div>`);
}
doneBt.addEventListener("pointerdown", ()=>{
    const type = itemSelect.value;
    document.getElementById("stb").innerHTML = "Старт";
    document.getElementById("stb").classList.replace("stop", "start");
    buttons.stop();
    adding[type]();
});

document.addEventListener("pointerdown", (event)=>{
    const els = document.elementsFromPoint(event.pageX, event.pageY);
    els.forEach((el)=>{
        if (el instanceof tnt) el.explodeStart();
        else if (el instanceof Circle) {
            // el.main = true;
            if (el.fixedBeforeTouch) {
                el.fixed = -1;
                el.fixedBeforeTouch = false;
            }
            else if (el.touchRemove) el.remove();
        }
    });
});
function gt(){

}
class ball {
    statsProps = "x, y, ax, ay, fixed, elos, gravity, mass, vector, angles"
    constructor(ball) {
        this.ball = ball;
        return new Proxy(this, {
            set(target, name, val){
                target.ball[name] = val;
            }
        });
    }
    get stats() {
        const a = this.statsProps.split(", ");
        const obj = {};
        a.forEach(i=>obj[i] = ball[i]);
        return obj;
    }

}
let area = null;
let areaCords = {};
let cordsAreaStart = [];

function setArea(x1, y1, x2, y2) {
    area.style.left = Math.min(x1, x2)+"px";
    area.style.top = Math.min(y1, y2)+"px";
    area.style.width = Math.max(x1, x2)-Math.min(x1,x2)+"px";
    area.style.height = Math.max(y1, y2)-Math.min(y1, y2)+"px";
    areaCords = {x1, x2, y1, y2};
    if (finish) {
        finish.x1 = x1;
        finish.x2 = x2;
        finish.y1 = y1;
        finish.y2 = y2;
    }
}

function startArea(event) {
    const a = "<div class='area' data-dnd='' data-dnd-Dobegin='cordsAreaStart = [event.pageX, event.pageY]' data-dnd-Onmove='moveArea(event.pageX, event.pageY)'></div>";
    pitch.insertAdjacentHTML("afterbegin", a);

    area = pitch.children[0];

    setArea(event.pageX - pitch.getBoundingClientRect().left, event.pageY - pitch.getBoundingClientRect().top, event.pageX - pitch.getBoundingClientRect().left, event.pageY - pitch.getBoundingClientRect().top);
    document.addEventListener("pointermove", resizeArea);
    document.addEventListener("pointerup", endResizeArea, {once: true});
}

function resizeArea(event) {
    setArea(areaCords.x1, areaCords.y1, event.pageX - pitch.getBoundingClientRect().left, event.pageY - pitch.getBoundingClientRect().top);
}

function endResizeArea() {
    document.removeEventListener("pointermove", resizeArea);
    containment = getAreaContainment();
}

function getAreaContainment() {
    const containment = new Set();
    for (const i of pitch.elemsInSystem) {
        if (i.x > Math.min(areaCords.x1, areaCords.x2) && i.x < Math.max(areaCords.x1, areaCords.x2) && i.y > Math.min(areaCords.y1, areaCords.y2) && i.y < Math.max(areaCords.y1, areaCords.y2)) containment.add(i);
    }
    for (const i of pitch.linesInSystem) {
        if ((i.x1 > Math.min(areaCords.x1, areaCords.x2) && i.x1 < Math.max(areaCords.x1, areaCords.x2) && i.y1 > Math.min(areaCords.y1, areaCords.y2) && i.y1 < Math.max(areaCords.y1, areaCords.y2)) || (i.x2 > Math.min(areaCords.x1, areaCords.x2) && i.x2 < Math.max(areaCords.x1, areaCords.x2) && i.y2 > Math.min(areaCords.y1, areaCords.y2) && i.y2 < Math.max(areaCords.y1, areaCords.y2))) containment.add(i);
    }
    for (const i of pitch.flexLinesInSystem) {
        if ((i.x1 > Math.min(areaCords.x1, areaCords.x2) && i.x1 < Math.max(areaCords.x1, areaCords.x2) && i.y1 > Math.min(areaCords.y1, areaCords.y2) && i.y1 < Math.max(areaCords.y1, areaCords.y2)) || (i.x2 > Math.min(areaCords.x1, areaCords.x2) && i.x2 < Math.max(areaCords.x1, areaCords.x2) && i.y2 > Math.min(areaCords.y1, areaCords.y2) && i.y2 < Math.max(areaCords.y1, areaCords.y2))) containment.add(i);
    }
    if (pitch.finish) if ((pitch.finish.x1 > Math.min(areaCords.x1, areaCords.x2) && pitch.finish.x1 < Math.max(areaCords.x1, areaCords.x2) && pitch.finish.y1 > Math.min(areaCords.y1, areaCords.y2) && pitch.finish.y1 < Math.max(areaCords.y1, areaCords.y2)) || (pitch.finish.x2 > Math.min(areaCords.x1, areaCords.x2) && pitch.finish.x2 < Math.max(areaCords.x1, areaCords.x2) && pitch.finish.y2 > Math.min(areaCords.y1, areaCords.y2) && pitch.finish.y2 < Math.max(areaCords.y1, areaCords.y2))) containment.add(pitch.finish);
    for (const i of pitch.drawings.all) if ((i.x1 > Math.min(areaCords.x1, areaCords.x2) && i.x1 < Math.max(areaCords.x1, areaCords.x2) && i.y1 > Math.min(areaCords.y1, areaCords.y2) && i.y1 < Math.max(areaCords.y1, areaCords.y2)) || (i.x2 > Math.min(areaCords.x1, areaCords.x2) && i.x2 < Math.max(areaCords.x1, areaCords.x2) && i.y2 > Math.min(areaCords.y1, areaCords.y2) && i.y2 < Math.max(areaCords.y1, areaCords.y2))) containment.add(i);
    return containment;
}

function moveArea(x, y) {
    const xm = x - cordsAreaStart[0];
    const ym = y - cordsAreaStart[1];
    setArea(areaCords.x1+xm, areaCords.y1+ym, areaCords.x2+xm, areaCords.y2+ym);
    for (let i of containment) {
        if (moveEl) {

            if (i instanceof Circle) {
                i.x = i.x+xm;
                i.y = i.y+ym;
            }
            if (i instanceof Line) {
                i.x1 = i.x1+xm;
                i.y1 = i.y1+ym;
                i.x2 = i.x2+xm;
                i.y2 = i.y2+ym;
            }
            if (i instanceof flexLine) {
                i.x1 = i.x1+xm;
                i.y1 = i.y1+ym;
                i.x2 = i.x2+xm;
                i.y2 = i.y2+ym;
                // spots linesSpots lines
                for (let j of i.spots) {
                    j[0] = j[0]+xm;
                    j[1] = j[1]+ym;
                }
                for (let j of i.linesSpots) {
                    j[0] = j[0] + xm;
                    j[1] = j[1] + ym;
                }
                for (let j of i.lines) {
                    j.x1 = j.x1+xm;
                    j.y1 = j.y1+ym;
                    j.x2 = j.x2+xm;
                    j.y2 = j.y2+ym;
                }
            }
            if (i instanceof Finish) {
                i.x1 = i.x1+xm;
                i.y1 = i.y1+ym;
                i.x2 = i.x2+xm;
                i.y2 = i.y2+ym;
            }

        }
        if (moveDr) {
            if (i instanceof drawObj) {
                i.spots.forEach(i=>{i[0]+=xm; i[1]+=ym});
            }
        }
    }
    pitch.renderCanvas();
    cordsAreaStart = [x, y];
}

let containment;
let finish;

function innerOnmove(event) {
    const x = event.pageX;
    const y = event.pageY;const xm = x - cordsAreaStart[0];
    const ym = y - cordsAreaStart[1];
    setArea(finish.x1+xm, finish.y1+ym, finish.x2+xm, finish.y2+ym);
    cordsAreaStart= [x, y];
    spot1.style.left = finish.x1-10+"px";
    spot1.style.top = finish.y1-10+"px";
    spot2.style.left = finish.x2-10+"px";
    spot2.style.top = finish.y2-10+"px";
}

function startFinish(event) {
    finish = new Finish(pitch);
    const a = "<div class='area' data-dnd='' data-dnd-Dobegin='cordsAreaStart = [event.pageX, event.pageY]' data-dnd-Onmove='innerOnmove(event)'></div>";
    pitch.insertAdjacentHTML("afterbegin", a);
    area = pitch.children[0];
    finish.x1 = event.pageX - pitch.getBoundingClientRect().left;
    finish.y1 = event.pageY - pitch.getBoundingClientRect().top;
    document.addEventListener("pointermove", finishResize);
    document.addEventListener("pointerup", finishEnd, {once: true});
}

function finishResize(event) {

    finish.x2 = event.pageX - pitch.getBoundingClientRect().left;
    finish.y2 = event.pageY - pitch.getBoundingClientRect().top;


    area.style.left = Math.min(finish.x1, finish.x2)+"px";
    area.style.top = Math.min(finish.y1, finish.y2)+"px";
    area.style.width = Math.max(finish.x1, finish.x2)-Math.min(finish.x1,finish.x2)+"px";
    area.style.height = Math.max(finish.y1, finish.y2)-Math.min(finish.y1, finish.y2)+"px";
}

let spot1, spot2;

function finishEnd() {
    document.removeEventListener("pointermove", finishResize);
    {
        const [x1, y1, x2, y2] = [finish.x1, finish.y1, finish.x2, finish.y2];
        finish.x1 = Math.min(x1, x2);
        finish.x2 = Math.max(x1, x2);
        finish.y1 = Math.min(y1, y2);
        finish.y2 = Math.max(y1, y2);
    }

    pitch.insertAdjacentHTML("afterbegin", `<div class="moveSpot" style="position: absolute; left: ${finish.x1-10}px; top: ${finish.y1-10}px; width: 20px; height: 20px;" data-dnd data-dnd-Onmove="set1(event)"></div>`);
    spot1 = pitch.children[0];
    pitch.insertAdjacentHTML("afterbegin", `<div class="moveSpot" style="position: absolute; left: ${finish.x2-10}px; top: ${finish.y2-10}px; width: 20px; height: 20px;" data-dnd data-dnd-Onmove="finishResize(event)"></div>`);
    spot2 = pitch.children[0];
}

function set1(event) {
    finish.x1 = event.pageX - pitch.getBoundingClientRect().left;
    finish.y1 = event.pageY - pitch.getBoundingClientRect().top;

    area.style.left = Math.min(finish.x1, finish.x2)+"px";
    area.style.top = Math.min(finish.y1, finish.y2)+"px";
    area.style.width = Math.max(finish.x1, finish.x2)-Math.min(finish.x1,finish.x2)+"px";
    area.style.height = Math.max(finish.y1, finish.y2)-Math.min(finish.y1, finish.y2)+"px";
}

class tnt extends Circle {
    #f = 1;
    #rboom = 50;
    boombastick = true;
    exploded = false;
    #explodeTime;
    constructor() {
        super();
    }

    get explodeTime(){
        return this.#explodeTime;
    }

    set explodeTime(a){
        this.#explodeTime = a;
        if (!a ) throw new Error();
    }

    getInfo() {
        const res = super.getInfo();
        res.rboom = this.rboom;
        res.f = this.f;
        return res;
    }

    set f(a){
        this.#f = a;
    }
    get f(){
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
        this.mass = -this.#f*10000000;
        this.exploded = true;
        const gr = {
            handler: this,
        }
        for (let i = 0, j = e[i]; i < e.length; i++, j = e[i]) {
            if (j === this) continue;
            if (j.boombastick && Math.sqrt( Math.pow(gr.handler.x-j.x,2) + Math.pow(gr.handler.y-j.y,2) ) - gr.handler.radius - j.radius < j.rboom) {
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
            con.arc(this.x, this.y, this.radius-lineWidth ,-Math.PI/2, Math.PI*2*(this.explodeTime/3)-Math.PI/2);
            con.lineTo(this.x, this.y);
            con.fill();
            con.closePath();
            if (this.explodeTime <= 0) this.explode();
        }
    }
}

class airLine extends Line {
    #length = 400;
    #lines = [];
    #f = 40;
    fn1(x1, y1, l, k2, b2) {
        const a = k2**2+1;
        const b = -2*x1+2*k2*b2-2*k2*y1;
        const c = y1**2-2*b2*y1-l**2+b2**2+x1**2;
        const arr = qdr(a, b, c);
        const x2 = this.y1 <= this.y2 ? arr[0] : arr[1];
        const y2 = k2*x2+b2;
        return [x2, y2];
    }

    getInfo(){
        const res = super.getInfo();
        res.length = this.length;
        res.f = this.f;
        return res;
    }

    get f() {
        return this.#f;
    }
    set f(a) {
        this.#f = a;
    }

    get length() {
        return this.#length;
    }
    set length(a) {
        this.#length = a;
        this.main();
        this.parentElement ? this.parentElement.renderCanvas() : 0;
    }
    remove() {
        this.parentElement.removeAirLine(this);
        Line.prototype.remove.call(this);
    }
    main() {
        Line.prototype.main.call(this);
        // line1
        if (this.x1 === this.x2 || this.y1 === this.y2) return
        const k = -1/this.k;
        {
            const x1 = this.x1;
            const y1 = this.y1;
            const b = y1 - k*x1;
            //line3
            {
                [this.x3, this.y3] = this.fn1(x1, y1, this.#length, k, b);
                [this.fakeX1, this.fakeY1] = this.fn1(x1, y1, lineWidth/2, k, b);
                if (Math.round(Math.sqrt( Math.pow(this.x1-this.x3, 2) + Math.pow(this.y1-this.y3, 2))) !== this.#length) {
                    if (Math.round(this.k) === 0) {
                        if (this.x1 < this.x2) {
                            this.y3 = this.y1-this.#length;
                            this.x3 = this.x1;
                        }
                        else {
                            this.y3 = this.y1+this.#length;
                            this.x3 = this.x1;
                        }
                    }
                    else {
                        if (this.y1 > this.y2) {
                            this.y3 = this.y1;
                            this.x3 = this.x1+this.#length;
                        }
                        else {
                            this.y3 = this.y1;
                            this.x3 = this.x1-this.#length;
                        }
                    }
                }
            }
        }
        //line2
        {
            const x1 = this.x2;
            const y1 = this.y2;
            const b = y1 - k*x1;
            //line4
            {
                [this.x4, this.y4] = this.fn1(x1, y1, this.#length, k, b);
                [this.fakeX2, this.fakeY2] = this.fn1(x1, y1, lineWidth/2, k, b);
                if (Math.round(Math.sqrt( Math.pow(this.x2-this.x4, 2) + Math.pow(this.y2-this.y4, 2))) !== this.#length) {
                    if (Math.round(this.k) === 0) {
                        if (this.x1 < this.x2) {
                            this.y4 = this.y2-this.#length;
                            this.x4 = this.x2;
                        }
                        else {
                            this.y4 = this.y2+this.#length;
                            this.x4 = this.x2;
                        }
                    }
                    else {
                        if (this.y1 > this.y2) {
                            this.y4 = this.y2;
                            this.x4 = this.x2+this.#length;
                        }
                        else {
                            this.y4 = this.y2;
                            this.x4 = this.x2-this.#length;
                        }
                    }
                }
            }
        }

        this.#lines[0] = this.countKB(this.x1, this.y1, this.x3, this.y3);
        this.#lines[1] = this.countKB(this.x2, this.y2, this.x4, this.y4);
        this.#lines[2] = this.countKB(this.x4, this.y4, this.x3, this.y3);
        this.#lines[3] = {k: this.k, b: this.b};


    }
    connectedCallback() {
        super.connectedCallback();
        this.parentElement.addAirLine(this);
    }

    constructor() {
        super();
    }
    countF(ball, time) {
        const {x, y} = ball;
        const [{k: k1, b: b1}, {k: k2, b: b2}, {k: k3, b: b3}, {k: k4, b: b4}] = this.#lines;
        if ( (k1*x+b1-y)*(k2*x+b2-y)<=0 && (k3*x+b3-y)*(k4*x+b4-y)<=0 ) {
            const k = k1;
            const b = y - k*x; // k*x+b = k2*x+b2 //
            const x2 = (b4-b)/(k-k4);
            const y2 = k*x2+b;
            const r = Math.sqrt( Math.pow(x-x2, 2) + Math.pow(y-y2, 2));
            const sp = {handler:
                    {
                        x: x2,
                        y: y2,
                        mass: -1*this.#f,
                        radius: -Infinity,
                    }
                };
           const gr = Physics.prototype.getGravity(sp, ball, true);
           ball.vector = [ball.vector[0] + gr[0]/ball.mass*time, ball.vector[1] +gr[1]/ball.mass*time];

        }

    }

    countKB(x1, y1, x2, y2) {
        const k = (y1-y2)/(x1-x2);
        const b = y1-k*x1;
        return {k, b};
    }

    renderCanvas(con) {
        con.beginPath();
        super.renderCanvas(con);
        con.stroke();
        con.fillStyle = airColor;
        con.shadowColor = "transparent";
        con.moveTo(this.fakeX1,this.fakeY1);
        con.lineTo(this.fakeX2,this.fakeY2);
        con.lineTo(this.x4,this.y4);
        con.lineTo(this.x3,this.y3);
        con.fill();
        con.closePath();
    }

}

customElements.define("tnt-physics", tnt);
customElements.define("airline-physics", airLine);

function getAllJSON(){
    const main = {
        inPitch: {
            fps,
            g,
            G,
        },
        blur,
        lines: [],
        balls: [],
        airLines: [],
        tntBalls: [],
        flexLines: [],
        drawings: [],
        finish: undefined,
        width: pitch.canvas.width,
        height: pitch.canvas.height,
        pitchParams: {
            mainBallColor,
            mainBallColorShadowColor,
            lineColor,
            lineShadowColor,
            airColor,
            ballColor,
            ballShadowColor,
            lineWidth,
            finishColor,
            finishShadowColor,
            startBackColor,
            endBackColor,
            startDrColor,
            endDrColor,
            ballColor2,
            elosLimit,
            fixedBallColor
        }
    };

    for (const i of pitch.elemsInSystem) {
        if (i instanceof tnt) main.tntBalls.push(i.getInfo());
        else main.balls.push(i.getInfo());
    }

    for (const i of pitch.linesInSystem) {
        if (i instanceof airLine) main.airLines.push(i.getInfo());
        else main.lines.push(i.getInfo());
    }

    for (const i of pitch.flexLinesInSystem) main.flexLines.push(i.getInfo());

    if (pitch.finish) main.finish = pitch.finish.getInfo();

    for (const i of pitch.drawings.all) main.drawings.push(i.getInfo());

    return JSON.stringify(main);
}

function copy(text) {
    navigator.clipboard.writeText(text);
}
let amount111 = 0;
let amount112 = 0;
function createFromJSON(json) {
    try{
        const obj = JSON.parse(json);
        if (obj === "") return;
        document.getElementById("stb").innerHTML = "Старт";
        document.getElementById("stb").classList.replace("stop", "start");
        buttons.stop();

        pitch.remove();
        document.body.insertAdjacentHTML("afterbegin", `<physics-area elos="1" id="main" >
    <div style="display: none;">Не убирать для совместимости</div>
    </physics-area>`);
        pitch = document.body.firstElementChild;
        console.log(obj);
        setTimeout(()=>{
            for (const i in obj.inPitch) {
                pitch[i] = Number(obj.inPitch[i]);
                window[i] = Number(obj.inPitch[i]);
            }
            for (const i in obj.pitchParams) window[i] = obj.pitchParams[i];
            const scale = pitch.canvas.width/obj.width;

            this.g *= scale**2;
            this.G *= scale**2;
            window.elosLimit = Number(window.elosLimit)*scale;

            document.getElementById("gHolder").value = this.g;
            document.getElementById("gbHolder").value = this.G;
            document.getElementById("elosLimitHolder").value = elosLimit;
            document.getElementById("fpsHolder").value = fps;

            window.lineWidth *= scale;
            blur = obj.blur * scale;
            for (let i of obj.lines) {
                const j = document.createElement("physics-line");
                pitch.append(j);
                j.x1 = i.x1*scale;
                j.x2 = i.x2*scale;
                j.y1 = i.y1*scale;
                j.y2 = i.y2*scale;
            }

            for (let i of obj.balls) {
                const j = document.createElement("physics-circle");
                pitch.append(j);
                j.fixed = Number(i.fixed)-1;
                j.angles = [Number(i.angle1), Number(i.angle2)];
                j.radius = Number(i.radius)*scale;
                j.width = j.radius*2;
                j.x = i.x*scale;
                j.y = i.y*scale;
                j.vector = [i.vx*scale, i.vy*scale];
                j.ax = i.ax*scale;
                j.ay = i.ay*scale;
                j.mass = Number(i.m)*scale;
                j.elos = Number(i.elos)-1;
                j.gravity = Number(i.gravity)-1;
                j.fixedBeforeTouch = Boolean(Number(i.fixedBeforeTouch));
                if (j.fixedBeforeTouch) {
                    j.angles = [0,0];
                }
                j.touchRemove = Boolean(Number(i.touchRemove));
                j.main = Boolean(Number(i.main));
            }

            for (let i of obj.airLines) {
                const j = document.createElement("airline-physics");
                pitch.append(j);
                j.x1 = i.x1*scale;
                j.x2 = i.x2*scale;
                j.y1 = i.y1*scale;
                j.y2 = i.y2*scale;
                j.length = i.length*scale;
                j.f = i.f*scale;
            }

            for (let i of obj.tntBalls) {
                const j = document.createElement("tnt-physics");
                pitch.append(j);
                j.fixed = Number(i.fixed)-1;
                j.angles = [Number(i.angle1), Number(i.angle2)];
                j.radius = Number(i.radius)*scale;
                j.width = j.radius*2;
                j.x = i.x*scale;
                j.y = i.y*scale;
                j.vector = [i.vx*scale, i.vy*scale];
                j.ax = i.ax*scale;
                j.ay = i.ay*scale;
                j.mass = Number(i.m)*scale;
                j.elos = Number(i.elos)-1;
                j.gravity = Number(i.gravity)-1;
                j.fixedBeforeTouch = Boolean(Number(i.fixedBeforeTouch));
                if (j.fixedBeforeTouch) {
                    j.angles = [0,0];
                }
                j.touchRemove = Boolean(Number(i.touchRemove));
                j.main = Boolean(Number(i.main));
                j.rboom = i.rboom*scale;
                i.f = i.f*scale;
            }

            for (let i of obj.flexLines) {
                const j = new flexLine(pitch);
                j.x1 = i.x1*scale;
                j.x2 = i.x2*scale;
                j.y1 = i.y1*scale;
                j.y2 = i.y2*scale;
                j.lines = i.lines.map((line) => {
                    line.x1 *= scale;
                    line.x2 *= scale;
                    line.y1 *= scale;
                    line.y2 *= scale;
                    return createLine(line.x1, line.y1, line.x2, line.y2);
                });
                j.spots = i.spots.map(spot => {
                    spot[0] *= scale;
                    spot[1] *= scale;
                    return spot;
                });
            }

            for (const i of obj.drawings) {
                i.spots.forEach(spot => {
                    spot[0] *= scale;
                    spot[1] *= scale;
                });
                pitch.addDraw(i.spots, i.color);
            }

            if (obj.finish) {
                obj.finish.x1 *= scale;
                obj.finish.x2 *= scale;
                obj.finish.y1 *= scale;
                obj.finish.y2 *= scale;
                pitch.finish = new Finish(this);
                pitch.finish.x1 = obj.finish.x1;
                pitch.finish.x2 = obj.finish.x2;
                pitch.finish.y1 = obj.finish.y1;
                pitch.finish.y2 = obj.finish.y2;
            }
            pitch.renderCanvas();
            let linesInFl = 0;
            for (const i of pitch.flexLinesInSystem) linesInFl+=i.lines.length;
            document.getElementById("lineamount").innerHTML = pitch.linesInSystem.length+linesInFl;
        });
    }
    catch (e) {
        console.log(e);
    }
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}



//usage:
let levels;
readTextFile("../main.json", function(text){
    levels = JSON.parse(text).levels;
    const arr = [];
    for (const i in levels) arr.push(i);
    const fr = document.createElement("div");
    fr.insertAdjacentHTML("afterbegin", `
<div>
    <select id="levelSelect" name="type" oninput="createFromJSON(JSON.stringify(levels[event.target.value]))">
                    ${arr.map((i, j)=>`<option value="${i}" ${j+1 === arr.length ? "selected" : ""}>${i}</option>`).join("")}
                    
                </select>
                <div class="bt" onclick="createFromJSON(JSON.stringify(levels[document.getElementById('levelSelect').value]))">Выбрать</div>
                </div>
    `);
    mainMenu.append(fr.firstElementChild);
});
/*
Идеи для добавлений какихто обьектов

1! Взрывы и динамиты - реализация за счет притяжения с отрицательной массой, взорвавшийся обьект исчезает
2! Вентиляторы - суть в том что создается струя воздуха и в ней шары получают какоето усокение, большее чем же
3! Воздушные шарики и лругие обьекты которые исчезают при нажатиии на них а так же появляющиеся обьекты
4! Изменение гравитации
5! футбол уровни
6!



 */