const canvas = document.querySelector("canvas");
const con = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
con.strokeStyle = "rgb(252, 243, 211)";
con.lineCap = "round";

const arr = [[-0.02,0.54],[-0.01,0.54],[0,0.54],[0.01,0.54],[0.02,0.53],[0.03,0.53],[0.04,0.53],[0.05,0.53],[0.06,0.53],[0.08,0.53],[0.09,0.53],[0.11,0.53],[0.12,0.53],[0.13,0.54],[0.15,0.54],[0.16,0.55],[0.18,0.56],[0.19,0.56],[0.21,0.57],[0.22,0.58],[0.24,0.58],[0.26,0.59],[0.27,0.6],[0.29,0.6],[0.31,0.6],[0.32,0.61],[0.34,0.61],[0.36,0.61],[0.38,0.61],[0.39,0.62],[0.41,0.62],[0.42,0.62],[0.44,0.62],[0.45,0.62],[0.47,0.62],[0.49,0.62],[0.51,0.62],[0.52,0.62],[0.54,0.6],[0.57,0.59],[0.59,0.57],[0.61,0.56],[0.62,0.56],[0.64,0.55],[0.65,0.55],[0.67,0.55],[0.69,0.55],[0.71,0.55],[0.72,0.55],[0.74,0.56],[0.75,0.57],[0.77,0.58],[0.79,0.58],[0.81,0.59],[0.82,0.59],[0.84,0.59],[0.86,0.59],[0.88,0.59],[0.89,0.59],[0.91,0.6],[0.92,0.6],[0.93,0.61],[0.94,0.61],[0.95,0.62],[0.96,0.62],[0.97,0.63]]

let width = document.querySelector("div div").getBoundingClientRect().width;
let height= document.querySelector("div div").getBoundingClientRect().height;
x1 = document.querySelector("div div").getBoundingClientRect().left;
y1 = document.querySelector("div div").getBoundingClientRect().top;


con.lineWidth = height*0.9;
let prev = 0;
con.moveTo(arr[0][0]*width+x1, arr[0][1]*height+y1);
for (let i = 1; i < arr.length; i++) {setTimeout(()=> {
    con.lineTo(arr[i][0] * width + x1, arr[i][1] * height + y1);
    con.stroke();
    con.closePath();
    con.beginPath();
    con.moveTo(arr[i][0] * width + x1, arr[i][1] * height + y1);
}, prev+Math.sqrt(i*4+30));
prev = prev+Math.sqrt(i*4+30);
}
setTimeout(()=>{
    con.closePath();
    con.beginPath();
    con.lineWidth = Math.sqrt(canvas.width*canvas.height)/50;
    let isDrawing = false;
    document.addEventListener("pointermove", (e)=>{if (isDrawing && e.isPrimary) {con.lineTo(e.pageX, e.pageY); con.stroke(); con.closePath(); con.beginPath(); con.moveTo(e.pageX, e.pageY); arr.push([e.pageX, e.pageY]);}});
    document.addEventListener("pointerdown", (e)=> {
        if (e.isPrimary) {
            isDrawing = true;
            con.beginPath();
            con.moveTo(e.pageX, e.pageY);
            arr.push([e.pageX, e.pageY]);
        }
    });
    document.addEventListener("pointerup", (e)=> {
        if (e.isPrimary) {
            isDrawing = false;
            con.closePath();
        }
    });
    document.querySelector(".downloading").style.opacity = "1";
    loadStart();
}, 802);

function allLoaded() {
    setTimeout(()=>{
        document.body.innerHTML = "";
        document.body.style.cssText = "";
        document.body.insertAdjacentHTML("beforeend",` <div id="pitchIn"></div>`);
        mainStart();
    }, 1000);
    document.querySelector(".downloading").innerHTML =  "Done!";
}

function loadStart() {
    const script = document.createElement("script");
    script.src = "Neon%20ball.js";
    script.onload = allLoaded();
    document.head.append(script);
    document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="Neon%20ball.css">`);

}
