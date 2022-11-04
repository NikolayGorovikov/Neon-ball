{
    window.added = 0;
    window.requestedLength = 41;
    const canvas = document.querySelector("canvas");
    const con = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    con.strokeStyle = "rgb(252, 243, 211)";
    con.lineCap = "round";
    let isDrawing = false;
    const fn1 = (e) => {
        if (isDrawing && e.isPrimary) {
            con.lineTo(e.pageX, e.pageY);
            con.stroke();
            con.closePath();
            con.beginPath();
            con.moveTo(e.pageX, e.pageY);
            arr.push([e.pageX/window.innerWidth, e.pageY/window.innerHeight]);
        }
    };

    const fn2 = (e) => {
        if (e.isPrimary) {
            isDrawing = true;
            con.beginPath();
            con.moveTo(e.pageX, e.pageY);
            arr.push([e.pageX/window.innerWidth, e.pageY/window.innerHeight]);
        }
    };

    const fn3 = (e) => {
        if (e.isPrimary) {
            isDrawing = false;
            con.closePath();
            arr.push(null);
        }
    };

    const arr = [[-0.02, 0.54], [-0.01, 0.54], [0, 0.54], [0.01, 0.54], [0.02, 0.53], [0.03, 0.53], [0.04, 0.53], [0.05, 0.53], [0.06, 0.53], [0.08, 0.53], [0.09, 0.53], [0.11, 0.53], [0.12, 0.53], [0.13, 0.54], [0.15, 0.54], [0.16, 0.55], [0.18, 0.56], [0.19, 0.56], [0.21, 0.57], [0.22, 0.58], [0.24, 0.58], [0.26, 0.59], [0.27, 0.6], [0.29, 0.6], [0.31, 0.6], [0.32, 0.61], [0.34, 0.61], [0.36, 0.61], [0.38, 0.61], [0.39, 0.62], [0.41, 0.62], [0.42, 0.62], [0.44, 0.62], [0.45, 0.62], [0.47, 0.62], [0.49, 0.62], [0.51, 0.62], [0.52, 0.62], [0.54, 0.6], [0.57, 0.59], [0.59, 0.57], [0.61, 0.56], [0.62, 0.56], [0.64, 0.55], [0.65, 0.55], [0.67, 0.55], [0.69, 0.55], [0.71, 0.55], [0.72, 0.55], [0.74, 0.56], [0.75, 0.57], [0.77, 0.58], [0.79, 0.58], [0.81, 0.59], [0.82, 0.59], [0.84, 0.59], [0.86, 0.59], [0.88, 0.59], [0.89, 0.59], [0.91, 0.6], [0.92, 0.6], [0.93, 0.61], [0.94, 0.61], [0.95, 0.62], [0.96, 0.62], [0.97, 0.63]]

    let width = document.querySelector("div div").getBoundingClientRect().width;
    let height = document.querySelector("div div").getBoundingClientRect().height;
    let x1 = document.querySelector("div div").getBoundingClientRect().left;
    let y1 = document.querySelector("div div").getBoundingClientRect().top;


    con.lineWidth = height * 0.9;
    let prev = 0;
    con.moveTo(arr[0][0] * width + x1, arr[0][1] * height + y1);
    let newSpots = 1;
    for (let i = 1; i < arr.length; i++) {
        setTimeout(() => {
            draw(i);
            newSpots++;
        }, prev + Math.sqrt(i * 4 + 30));
        prev = prev + Math.sqrt(i * 4 + 30);
    }
    function draw(i) {
        con.lineTo(arr[i][0] * width + x1, arr[i][1] * height + y1);
        con.stroke();
        con.closePath();
        con.beginPath();
        con.moveTo(arr[i][0] * width + x1, arr[i][1] * height + y1);
    }
    setTimeout(() => {
        con.closePath();
        con.beginPath();
        con.lineWidth = Math.sqrt(canvas.width * canvas.height) / 50;
        arr.push(null);
        document.addEventListener("pointermove", fn1);
        document.addEventListener("pointerdown", fn2);
        document.addEventListener("pointerup", fn3);
        document.querySelector(".downloading").style.opacity = "1";
        setTimeout(() => loadStart(), 0);
    }, 802);

    function allLoaded() {
        setTimeout(() => {
            document.body.innerHTML = "";
            document.body.style.cssText = "";
            document.body.insertAdjacentHTML("beforeend", ` <div id="pitchIn"></div>`);
            window.onresize = null;
            mainStart();
            window.scrollTo(0,0);
        }, 1000);
        document.querySelector(".downloading").innerHTML = "Done!";
        document.removeEventListener("pointermove", fn1);
        document.removeEventListener("pointerdown", fn2);
        document.removeEventListener("pointerup", fn3);

    }

    function loadStart() {
        const script = document.createElement("script");
        script.src = "Neon%20ball.js";
        script.onload = a;
        document.head.append(script);
        document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="Neon%20ball.css" id="link1">`);
        document.getElementById("link1").addEventListener("load", ()=>{a(); window.cssLoaded = true;
            document.body.insertAdjacentHTML("afterbegin", "<div style='visibility: hidden; position: absolute;'><p style='font-family: logo'>text</p><p style='font-family: Neon'>text</p><p style='font-family: \"Ubuntu Condensed\"'>text</p></div>");
        });
        setTimeout(()=>{
            if (window.added === 3 && !window.cssLoaded) allLoaded();
        }, 3000);
        const img = document.createElement("img");
        img.src = "rolling.png";
        img.style.display = "none";
        document.body.append(img);
        img.onload = a;
        for (let i = 1; i < 38; i++) {
            const img = document.createElement("img");
            img.src = "fish/00"+String(i).padStart(2, "0")+".jpg";
            img.style.visibility = "hidden";
            img.style.position = "absolute";
            document.body.append(img);
            img.onload = a;
        }
        function readTextFile(file, callback) {
            var rawFile = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    callback(rawFile.responseText);
                }
            }
            rawFile.send(null);
        }
        window.actualLevel = 1;
        getPlayerInfo();


        readTextFile("main.json", function (text) {
            const all = JSON.parse(text);
            window.levels = all.levels;
            window.seasons = all.seasons;
            window.alwaysAvailable = all.alwaysAvailable;
            window.passedLevels = all.passedLevels;
            window.gameSettings = all.gameSettings;
            if (!playerInfo.availableLevels) playerInfo.availableLevels = [...window.alwaysAvailable];
            window.availableLevels = window.playerInfo.availableLevels;
            if (!playerInfo.passedLevels) playerInfo.passedLevels = [...window.passedLevels];
            window.passedLevels = playerInfo.passedLevels;
            const l = navigator.language.split("-")[0];
            if (!playerInfo.gameSettings) {
                playerInfo.gameSettings = Object.assign({}, window.gameSettings);
                playerInfo.gameSettings.language = (new Set(all.languages)).has(l) ? l : "en";
            }
            else window.playerInfo.gameSettings.language = window.playerInfo.gameSettings.language ? window.playerInfo.gameSettings.language : (new Set(all.languages)).has(l) ? l : "en";
            window.gameSettings = playerInfo.gameSettings;

            for (const i in all.gameSettings) {
                if (!window.gameSettings.hasOwnProperty(i)) window.gameSettings[i] = all.gameSettings[i];
            }

            window._all = all;

            document.cookie = "max-age=2592000";
            for (let i in levels) levels[i] = JSON.stringify(levels[i]);
            window.version = all.version;
            a();
        });

    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function a(){
        added++;
        if (added === requestedLength) allLoaded();
    }

    function getPlayerInfo() {
        //
        window.playerInfo = {
            availableLevels: getCookie("availableLevels") ? getCookie("availableLevels").split(","): undefined,
            passedLevels: getCookie("passedLevels") ? getCookie("passedLevels").split(",") : undefined,
            gameSettings: getCookie("gameSettings") ? JSON.parse(getCookie("gameSettings")) : undefined
        };
        //
    }

    window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = document.querySelector("div div").getBoundingClientRect().width;
        height = document.querySelector("div div").getBoundingClientRect().height;
        x1 = document.querySelector("div div").getBoundingClientRect().left;
        y1 = document.querySelector("div div").getBoundingClientRect().top;
        con.lineWidth = height * 0.9;
        con.strokeStyle = "rgb(252, 243, 211)";
        con.lineCap = "round";
        con.moveTo(arr[0][0] * width + x1, arr[0][1] * height + y1);
        for (let i = 1; i < Math.min(newSpots, arr.length); i++) draw(i);
        if (newSpots <= arr.length) {
            con.lineWidth = Math.sqrt(canvas.width * canvas.height) / 50;
            for (let j = newSpots+1; j < arr.length; j++) {
                if (!arr[j]) {
                    con.closePath();
                    continue;
                }
                if (j > 0 && !arr[j-1]) {
                    con.beginPath();
                    con.moveTo(arr[j][0] * window.innerWidth, arr[j][1] * window.innerHeight);
                    continue;
                }
                con.lineTo(arr[j][0] * window.innerWidth, arr[j][1] * window.innerHeight);
                con.stroke();
                con.closePath();
                con.beginPath();
                con.moveTo(arr[j][0] * window.innerWidth, arr[j][1] * window.innerHeight);
            }
        }
    }
}