let DND = {
    end(element){
        document.removeEventListener(`mousedown`,element._info?.preventCopy);
        document.removeEventListener(`dblclick`,element._info?.preventCopy);
        element._system.nonCopyStyle.remove();
        document.removeEventListener("contextmenu", menu);
        if (element.dataset.hasOwnProperty("dndCloneend") || !document.contains(element._system.clone)){
            element.dispatchEvent(new CustomEvent(`clone`, {detail:{target: element}}));
        }
        element.onCanceling = false;
        element.allMovePrevented = false;
        element._info = undefined;
        element.hoverItem = undefined;
    },
    clone:function (event) {
        event.detail.target._system.clone.remove();
        event.detail.target._system.clone = undefined;
    }
}
{
    beginStyles.cache = new Map();
    function beginStyles(styles, elem, type) {
        if (!styles && styles !== undefined) return;
        if (styles === undefined) {
            if (type === null) return;
            beginStyles(elem.parentElement.dataset[type], elem, null);
            return;
        }
        if (styles.includes(`(change)`)) {
            elem.style.cssText = styles.split(`(change)`).join(``);
        }
        else {
            elem.style.cssText = elem.style.cssText + ";"+styles;
        }
    }
    let hoverBehavior = {
        mouse(event) {
            return [[event.clientX, event.clientY]];
        },
        center(event, elem) {
            return [[(elem.getBoundingClientRect().left + elem.getBoundingClientRect().right) / 2, (elem.getBoundingClientRect().top + elem.getBoundingClientRect().bottom) / 2]];
        },
        "undefined": function (event, elem) {
            if (elem.parentElement.dataset.dndHoverbehavior) return this[elem.parentElement.dataset.dndHoverbehavior](event, elem);
            else return this.center(event, elem);
        },
        __proto__: null
    }
    DND.addHoverBehaviour = function(func, name){
        if (hoverBehavior[name] && String(name) !== "undefined") throw new Error("Name you have chosen ("+name+") is already taken. Remember that names 'center', 'mouse' and 'undefined' are reserved. The list of names you cant use: "+Object.getOwnPropertyNames(hoverBehavior).toString().split(",undefined").join(""));
        hoverBehavior[name]=(event, elem)=>[func(event, elem)];
    }
    doBegin.cache = new Map();
    function doBegin(text, target, holder, type, owner) {
        if (text === undefined && type !== null) {
            doBegin(owner.parentElement.dataset[type], target, holder, null, null);
            return;
        }
        let cacheIn = doBegin.cache.get(text);
        if (cacheIn) cacheIn(target, holder);
        else {
            try {
                let F = new Function(`dragElem`, `target`, text);
                doBegin.cache.set(text, F);
                F(target, holder);
            } catch (e) {
                console.log(`Its error in function, here is your func text, your function havent been cached and runned`, text, e);
            }
        }
    }
    function atLeastOne(target, func, tracker, i){
        try{
            for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e))) {
                if ((func(`#${holder?.id}`) !== target.hoverItem) && func(`#${holder?.id}`) !== null) {
                    target.hoverItem = holder;
                    return tracker[i](true);
                }
                if (func(`#${holder?.id}`) === target.hoverItem) return true;
            }
        }
        catch (e){}
    }
    function menu(){
        this.dispatchEvent(new PointerEvent(`pointerup`, {isPrimary: true}))
    }
    document.body.addEventListener(`pointerdown`, function (event) {
        if (!event.isPrimary) return;
        let target = event.target.closest(`[data-dnd]`);
        if (!target || target.allMovePrevented || target.onCanceling) return;
        target.ondragstart = () => false;
        document.addEventListener("contextmenu", menu.bind(target), {once: true});
        target.style.touchAction = `none`;
        target.setPointerCapture(event.pointerId);
        let isEverMoved = false;
        target._info ={
            preventCopy(event){
                event.preventDefault();
            }
        };
        if (target._system === undefined) target._system = {};
        if (target.dataset.dndCopy === undefined || Boolean(target.dataset.dndCopy)) {
            document.addEventListener(`mousedown`, target._info.preventCopy);
            document.addEventListener(`dblclick`, target._info.preventCopy);
            document.head.insertAdjacentHTML("beforeend", "<style>*{-webkit-touch-callout: none;\n" +
                "            -webkit-user-select: none;\n" +
                "            -khtml-user-select: none;\n" +
                "            -moz-user-select: none;\n" +
                "            -ms-user-select: none;\n" +
                "            user-select: none;}</style>");
            target._system.nonCopyStyle = document.head.lastElementChild;
        }
        let move = function (elem, event) {
            if (!event.isPrimary) return;
            if (!target.dataset.dndPreventxdirection) elem.style.left = event.pageX - xDifference + xPosOffset + `px`;
            if (!target.dataset.dndPreventydirection)elem.style.top = event.pageY - yDifference + yPosOffset + `px`;
            doBegin(target.dataset.dndOnmove, target, target.hoverItem, `dndOnmove`, target);
            try{
                for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget).split(" ").map(e=>document.getElementById(e))) doBegin(holder.dataset.dndOnmove, target, holder, `dndOnmove`, holder);
            }
            catch (e){}
        }.bind(null, target);
        let mouseCordsStart;
        beginStyles(target.dataset.dndStylebegin, target, `dndStylebegin`);
        try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e))) beginStyles(holder.dataset.dndStylebegin, holder, `dndStylebegin`);}catch (e){}
        doBegin(target.dataset.dndDobegin, target, (target.dataset.dndHolder || target.parentElement.dataset.dndHolder)?.split(" ").map(e=>document.getElementById(e)), `dndDobegin`, target);
        try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e))) doBegin(holder.dataset.dndDobegin, target, holder, `dndDobegin`, holder);}catch (e){}
        let yDifference = event.pageY;
        let xDifference = event.pageX;
        let yPosOffset = target.getBoundingClientRect().y - target.offsetParent.getBoundingClientRect().y;
        let xPosOffset = target.getBoundingClientRect().x - target.offsetParent.getBoundingClientRect().x;
        if (getComputedStyle(target.offsetParent).position === `static`) {
            yPosOffset = target.getBoundingClientRect().y - document.documentElement.getBoundingClientRect().y - (parseFloat(getComputedStyle(document.documentElement).borderTopWidth) + parseFloat(getComputedStyle(document.documentElement).paddingTop));
            xPosOffset = target.getBoundingClientRect().x - document.documentElement.getBoundingClientRect().x - (parseFloat(getComputedStyle(document.documentElement).borderLeftWidth) + parseFloat(getComputedStyle(document.documentElement).paddingLeft));
        }
        else {
            yPosOffset -= (parseFloat(getComputedStyle(target.offsetParent).borderTopWidth) + parseFloat(getComputedStyle(target.offsetParent).paddingTop));
            xPosOffset -= (parseFloat(getComputedStyle(target.offsetParent).borderLeftWidth) + parseFloat(getComputedStyle(target.offsetParent).paddingLeft));
        }
        target._info.cordsStart = [target.offsetLeft, target.offsetTop];
        let width = target.getBoundingClientRect().width;
        let height = target.getBoundingClientRect().height;
        let tracker, colorsHolder, colorsTarget, hoverFuncTarget, hoverFuncHolder;
        (function setPosition() {
            if (target.allMovePrevented || !event.isPrimary) return;
            isEverMoved = true;
            if (target.dataset.hasOwnProperty(`dndClone`) && !target._system.clone) {
                console.log("clone");
                target._system.clone = target.cloneNode(true);
                target._system.clone.style.visibility = `hidden`;
                Object.defineProperty(target, `clone`, {writable: false});
                target._system.clone.removeAttribute(`data-dnd`);
                target.before(target._system.clone);
                beginStyles(target.dataset.dndClonebegin, target._system.clone, null);
                target.addEventListener(`clone`, DND.clone, {once: true});
            }
            mouseCordsStart = [event.pageX, event.pageY];
            target.stylebottom = "";
            target.style.right = "";
            target.style.position = `absolute`;
            target.style.boxSizing = `border-box`;
            target.style.width = String(width) + `px`;
            target.style.height = String(height) + `px`;
            doBegin(target.dataset.dndDosetabsolute, target, (target.dataset.dndTarget || target.parentElement.dataset.dndtarget)?.split(" ").map(e=>document.getElementById(e)), `dndDosetabsolute`, target);
            colorsHolder = {
                get "1"() {
                    return "dndHoverinstyle";
                },
                get "-1"() {
                    return "dndHoveroutstyle";
                }
            }
            colorsTarget = {
                get "1"() {
                    return target?.dataset?.dndHoverinstyle;
                },
                get "-1"() {
                    return target?.dataset.dndHoveroutstyle;
                }
            }
            hoverFuncHolder = {
                get "1"() {
                    return "dndDohoverin";
                },
                get "-1"() {
                    return "dndDohoverout";
                }
            }
            hoverFuncTarget = {
                get "1"() {
                    return target?.dataset?.dndDohoverin;
                },
                get "-1"() {
                    return target?.dataset.dndDohoverout;
                }
            }
        })();
        let i = 1;
        tracker = {
            "-1": (a) => !a,
            "1": (a) => a
        }
        let abilityToChange = false;
        insideCheck(event);
        target.addEventListener(`pointermove`, move);
        function insideCheck(event) {
            if (!event.isPrimary || !(target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e)).length) return;
            let symbol = Symbol();
            try {
                let cords = hoverBehavior[String(target.dataset.dndHoverbehavior)](event, target);
                target[symbol] = target.style.display;
                target.style.display = `none`;
                let hover= target.hoverItem;
                for (let n of cords) {
                    let elem = document.elementFromPoint(...n);
                    if (!elem) {
                        if (target.dataset.dndOutthewindow) doBegin(target.dataset.dndOutthewindow, target, (target.dataset.dndTarget || target.parentElement.dataset.dndtarget)?.split(" ").map(e=>document.getElementById(e)), "dndOutthewindow", target);
                        else target.dispatchEvent(new PointerEvent(`pointerup`, {isPrimary: true}));
                        break;
                    }
                    else if (tracker[i](atLeastOne(target, elem.closest.bind(elem), tracker, i))) {
                        if (i==1 || (target.hoverItem === hover)) beginStyles(colorsTarget[i], target, i == 1? "dndHoverinstyle":"dndHoveroutstyle");
                        if (i === 1) {
                            beginStyles(target.hoverItem.dataset.dndHoverinstyle, target.hoverItem, 'dndHoverinstyle');
                            doBegin(target.dataset.dndDohoverin, target, target.hoverItem, 'dndDohoverin', target);
                            doBegin(target.hoverItem.dataset.dndDohoverin, target, target.hoverItem, 'dndDohoverin', target.hoverItem);
                        }
                        else if (target.hoverItem !== hover && i == -1){
                            beginStyles(hover?.dataset?.dndHoveroutstyle, hover, 'dndHoveroutstyle');
                            doBegin(target.dataset.dndDohoverout, target, hover, 'dndDohoverout', target);
                            doBegin(hover?.dataset?.dndDohoverout, target, hover, 'dndDohoverout', hover);
                            beginStyles(target.hoverItem.dataset.dndHoverinstyle, target.hoverItem, 'dndHoverinstyle');
                            doBegin(target.dataset.dndDohoverin, target, target.hoverItem, 'dndDohoverin', target);
                            doBegin(target.hoverItem.dataset.dndDohoverin, target, target.hoverItem, 'dndDohoverin', target.hoverItem);
                        }
                        else {
                            beginStyles(hover?.dataset?.dndHoveroutstyle, hover, 'dndHoveroutstyle');
                            doBegin(target.dataset?.dndDohoverout, target, hover, 'dndDohoverout', target);
                            doBegin(hover?.dataset?.dndDohoverout, target, hover, 'dndDohoverout', hover);
                        }
                        target.style.display = target[symbol];
                        if (target.hoverItem === hover && i == -1 || i == 1){
                            if (i == -1) target.hoverItem = undefined;
                            i = -i;
                        }
                        abilityToChange = Boolean(i - 1);
                        break;
                    }
                }
                target.style.display = target[symbol];
            }
            catch (e) {
                target.style.display = target[symbol];
                target.dispatchEvent(new PointerEvent(`pointerup`, {isPrimary: true}));
            }
        }
        target.addEventListener(`pointermove`, insideCheck);
        target.addEventListener(`pointerup`, function (event) {
            if (!event.isPrimary) return;
            target.allMovePrevented = true;
            target.onCanceling = true;
            target.removeEventListener(`pointermove`, move);
            target.removeEventListener(`pointermove`, insideCheck);
            doBegin(target.dataset.Doanywaybefore, target, (target.dataset.dndTarget || target.parentElement.dataset.dndtarget)?.split(" ").map(e=>document.getElementById(e)), `Doanywaybefore`, target);
            try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e))) doBegin(holder.dataset.Doanywaybefore, target, holder, `Doanywaybefore`, holder);}catch (e){}
            let holder = target.hoverItem
            if (abilityToChange) {
                let notSuccessList = new Set((target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e)));
                notSuccessList.delete(holder);
                beginStyles(target.dataset.dndSuccessstyle, target, `dndSuccessstyle`);
                beginStyles(holder.dataset.dndSuccessstyle, holder, `dndSuccessstyle`);
                try{for (let holderi of notSuccessList) {beginStyles(holderi.dataset.dndNotsuccessstyle, holderi, `dndNotsuccessstyle`);}}catch (e){}
                doBegin(target.dataset.dndDosuccess, target, holder, `dndDosuccess`, target);
                doBegin(holder.dataset.dndDosuccess, target, holder, `dndDosuccess`, holder);
                try{for (let holderi of notSuccessList) doBegin(holderi.dataset.dndDonotsuccess, target, holderi, `dndDonotsuccess`, holderi);}catch (e){}
            }
            else {
                beginStyles(target.dataset.dndNotsuccessstyle, target, `dndNotsuccessstyle`);
                try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndtarget)?.split(" ").map(e=>{return document.getElementById(e);})) beginStyles(holder.dataset.dndNotsuccessstyle, holder, `dndNotsuccessstyle`);}catch (e){}
                doBegin(target.dataset.dndDonotsuccess, target, (target.dataset.dndHolder || target.parentElement.dataset.dndHolder)?.split(" ").map(e=>{return document.getElementById(e);}), `dndDonotsuccess`, target);
                try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>{return document.getElementById(e);})) doBegin(holder.dataset.dndDonotsuccess, target, holder, `dndDonotsuccess`, holder);}catch (e){}
            }
            doBegin(target.dataset.dndDoanywayafter, target, (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e)), `dndDoanywayafter`, target);
            try{for (let holder of (target.dataset.dndTarget || target.parentElement.dataset.dndTarget)?.split(" ").map(e=>document.getElementById(e))) doBegin(holder.dataset.Doanywayafter, target, holder, `Doanywayafter`, holder);}catch (e){}
            if (!target.dataset.hasOwnProperty("dndEndprevention")) DND.end(target);
        }, {once: true});
    }, true);
}