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
function copy(text) {
    navigator.clipboard.writeText(text);
}
function getNewJSON(){
    const translations = {};
    const languages = new Set();
    const elems = document.querySelectorAll(".translation");
    for (const i of elems) {
        const name = i.parentElement.id;
        const lang = i.querySelector(".langName").innerHTML;
        const value = i.querySelector(".innerTranslation").value;
        if (name in translations) translations[name][lang] = value;
        else {
            translations[name] = {};
            translations[name][lang] = value;
        }
        languages.add(lang);
    }
    const languagesNames = Object.assign({}, translations.languages);
    delete translations.languages;
    const a = JSON.stringify(translations);
    const b = JSON.stringify([...languages]);
    const c = JSON.stringify(languagesNames);
    copy("\"translations\":"+a+",\"languages\":"+b+",\"languagesNames\":"+c);
}
function addLang(lang) {
    if (!lang) return;
    const elems = document.querySelectorAll("#languages .translation");
    for (const i of elems) {
        if (i.firstElementChild.innerHTML === lang) return;
    }
    const elems2 = document.querySelectorAll(".holder");
    for (const i of elems2) {
        i.insertAdjacentHTML("beforeend", `
        <div class="translation">
            <div class="langName">${lang}</div>
            <textarea onblur="this.innerHTML = this.value" rows="${2}" cols="40" class="innerTranslation"></textarea>
        </div>
        `);
    }
}
function removeLang(lang) {
    if (!lang) return;
    const elems = document.querySelectorAll(".translation");
    for (const i of elems) {
        if (i.firstElementChild.innerHTML === lang) i.remove();
    }
}
function renameLang(from, to) {
    if (!from || !to) return;
    const elems = document.querySelectorAll(".translation");
    for (const i of elems) {
        if (i.firstElementChild.innerHTML === from) i.firstElementChild.innerHTML = to;
    }
}
function createHolder(name, obj) {
    let inner = "";
    for (const i in obj) {
        const text = obj[i];
        const rows = Math.ceil(text.length/40*1.05)+1;
        inner += `
        <div class="translation">
            <div class="langName">${i}</div>
            <textarea rows="${rows}" onblur="this.innerHTML = this.value" cols="40" class="innerTranslation">${obj[i]}</textarea>
        </div>
        `;
    }
    return `
    <div class="holder" id="${name}">
        <div class="header">${name}</div>
        ${inner}
    </div>
    `;
}
readTextFile("../main.json", function (text) {
    if (localStorage.getItem("data")) {
        document.body.innerHTML = localStorage.getItem("data");
    }
    else {
        const json = JSON.parse(text);
        const translations = json.translations;
        const languages = json.languages;
        const languagesNames = json.languagesNames;
        for (const i in translations) {
            document.body.insertAdjacentHTML("beforeend",createHolder(i, translations[i]));
        }
        document.body.insertAdjacentHTML("beforeend",createHolder("languages", languagesNames));
    }
});

function back() {
    readTextFile("../main.json", function (text) {
            document.body.innerHTML = `
            <button onclick="getNewJSON()">Скопировать JSON</button>
<div style="background-color: white;">
    <h3 style="text-align: center">Добавить язык</h3>
    <input type="text">
    <button onclick="addLang(this.parentElement.querySelector(\`input\`).value)">Добавить</button>
</div>
<div style="background-color: white;">
    <h3 style="text-align: center">Удалить язык</h3>
    <input type="text">
    <button onclick="removeLang(this.parentElement.querySelector(\`input\`).value)">Удалить</button>
</div>
<div style="background-color: white;">
    <h3 style="text-align: center">Поменять название языка</h3>
    Было <input type="text" id="inputMain1"> <br> Станет <input type="text" id="inputMain2"> <br>
    <button onclick="renameLang(document.getElementById(\`inputMain1\`).value, document.getElementById(\`inputMain2\`).value)">Поменять</button>
</div>
<button ondblclick="back()">Откатить изменения (нажать два раза)</button>
            `;
            localStorage.setItem("data", "");
            const json = JSON.parse(text);
            const translations = json.translations;
            const languages = json.languages;
            const languagesNames = json.languagesNames;
            for (const i in translations) {
                document.body.insertAdjacentHTML("beforeend",createHolder(i, translations[i]));
            }
            document.body.insertAdjacentHTML("beforeend",createHolder("languages", languagesNames));
    });
}

window.onclick = function (){
    localStorage.setItem("data", document.body.innerHTML);
}