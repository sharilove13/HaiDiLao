/*------------------------------------------------------------------
   	Preloader_预加载动画
-------------------------------------------------------------------*/
// var _LoadingHtml='<div id="loader"><div id="status"></div></div>';

// window.onload=function() {
//     $status.fadeOut("slow");
//     $loader.delay(200).fadeOut();
// }

// //加载完成时移除加载动画
// function completedLoading() {
//     if(document.readyState==="complete"){
//         setTimeout(function () {
//             var loadingMask=document.getElementById('loader');
//             loadingMask.parentNode.removeChild(loadingMask);
//             console.log(this);
//         },3000);
//     }
// }
// // 监听
// document.onreadystatechange=completedLoading;
// document.write(_LoadingHtml);

// $(function () {
//     var find = new Find();
//
//     $.ajaxSetup({
//         cache:false,
//         async:true,
//         global:false,
//         type:"POST"
//     });
//     window.onload=function (ev) {
//
//     }
// })


/* ================================================
    COLOR PANEL OPEN/CLOSE
================================================ */
var segAll=document.body.querySelector("#color-panel");
var segBtn=segAll.children[0];
segBtn.onclick=function () {
    if(segAll.classList.contains("open_color_panel")){
        segAll.className="close_color_panel";
    }else{
        segAll.className="open_color_panel";
    }
}

/* ================================================
    COLOR CHANGE
================================================ */
var segShow=document.body.querySelector(".segment");
var colorSrc=document.getElementById("changeable-colors");
var colorLogo=document.getElementById("color-logo");
var titleText=document.getElementById("title-text");
segShow.onclick=function (e) {
    if(e.target.nodeName==="A"){
        var btn=e.target;
        colorSrc.href="css/color/"+btn.title+".css";
        colorLogo.src="./img/logo_"+btn.title+".png";
        switch(btn.title){
            case "orange":
                titleText.style.color="#e75b1e";
                break;
            case "vivid_yellow":
                titleText.style.color="#fdcb03";
                break;
            case "strong_blue":
                titleText.style.color="#1e69b8";
                break;
            case "moderate_green":
                titleText.style.color="#8dc63f";
                break;
            default:
                titleText.style.color="#ffffff";
        }
    }
}

/* ================================================
    TITLE CHANGE——TYPER打字特效
================================================ */

//创建Typer对象,设置各监听属性
var Typer =function (element) {
    this.element=element;
    //获取字符延迟和循环
    var delay=element.dataset.delay || 200;
    var loop=element.dataset.loop || "true";
    this.delay=delay;

    //获取断点判断字符
    var delim=element.dataset.delim || ",";

    //获取字符
    var words=element.dataset.words || "朋友们,亲爱的,爸爸们";

    //过滤掉空字符,得到字符串数组，设置对象各属性
    this.words=words.split(delim).filter(function (v) { return v; }); //["a","b"]
    this.deleteDelay = element.dataset.deletedelay || 1600; //1.6s
    this.progress = { word:0, char:0, building:true, atWordEnd:false, looped: 0 }; //显示哪个字符串，字符串的哪个位置，是否到顶了，是否在末尾，是否要重播
    this.typing=true;   //是否在执行动画
    this.doTyping();
}

Typer.prototype.start=function () {
    if(!this.typing){
        this.typing=true;
        this.doTyping();
    }
}

Typer.prototype.stop = function() {
    this.typing = false;
};

Typer.prototype.doTyping=function () {
    var e=this.element;
    var p=this.progress;
    var w=p.word;   //显示哪个字符串
    var c=p.char;   //当前需打字的位置
    var currentDisplay = [...this.words[w]].slice(0,c).join("");//得到需要显示的字符串数组，并转为字符串
    p.atWordEnd=false;
    //如果光标不透明了，则清除计时器，开始下个字符
    if(this.cursor){
        this.cursor.element.style.opacity=1;
        this.cursor.on=true;
        clearInterval(this.cursor.interval);
        var itself=this.cursor;
        this.cursor.interval = setInterval(function() {itself.updateBlinkState();}, 400);
    }
    e.innerHTML = currentDisplay;

    //监控是否到顶了
    if (p.building) {
        //如果当前的字符位置=字符串长度，设置字符状态
        if (p.char == [...this.words[w]].length) {
            p.building = false; //不进行打字
            p.atWordEnd = true; //已在末尾
        }else {
            p.char += 1;    //位置+1
        }
    } else {
        //如果到顶了，则监控是换字符串打字还是删除字符操作
        if (p.char == 0) {
            p.building = true;
            //字符串轮流
            p.word = (p.word + 1) % this.words.length;
        } else {
            p.char -= 1;
        }
    }

    //如果到末尾，重复次数+1
    if(p.atWordEnd) p.looped += 1;

    //如果为空字符串数组，则停止打印
    if(!p.building && (this.loop == "false" || this.loop <= p.looped) ){
        this.typing = false;
    }

    //如果在打印中，则周期执行doTyping()函数；通过判断是否在尾端，则选择不同的延时时间
    var myself = this;
    setTimeout(function() {
        if (myself.typing) { myself.doTyping(); };
    }, p.atWordEnd ? this.deleteDelay : this.delay);
};

//创建光标对象
var Cursor = function(element) {
    this.element = element;
    //获取光标样式
    this.cursorDisplay = element.dataset.cursordisplay || "_";
    element.innerHTML = this.cursorDisplay;
    this.on = true;
    //0.1s光标样式变化时间
    element.style.transition = "all .1s";
    //.4s周期变化
    var myself = this;
    this.interval = setInterval(function() {
        myself.updateBlinkState();
    }, 400);
}
//光标对象共有函数——updateBlinkState
Cursor.prototype.updateBlinkState = function() {
    //如果on为true，则样式为透明度为0，否则为1；即从透明到显示，时间为0.1s；不停转换
    if (this.on) {
        this.element.style.opacity = "0";
        this.on = false;
    } else {
        this.element.style.opacity = "1";
        this.on = true;
    }
}

//根据.typer对象，创建打字机对象
function TyperSetup() {
    var typers = {};
    var elements = document.getElementsByClassName("typer");
    //直到符合.typer的对象都创建了Typer对象
    for (var i = 0, e=elements[0]; e = elements[i++];) {
        typers[e.id] = new Typer(e);
    }

    //直到符合.typer-stop的对象都创建了Typer.stop()方法
    var elements = document.getElementsByClassName("typer-stop");
    for (var i = 0, e=elements[0]; e = elements[i++];) {
        let owner = typers[e.dataset.owner];
        e.onclick = function(){owner.stop();};
    }

    //直到符合.typer-start的对象都创建了Typer.start()方法
    var elements = document.getElementsByClassName("typer-start");
    for (var i = 0, e=elements[0]; e = elements[i++];) {
        let owner = typers[e.dataset.owner];
        e.onclick = function(){owner.start();};
    }

    //直到符合.cursor的对象都创建了Cursor对象
    var elements2 = document.getElementsByClassName("cursor");
    for (var i = 0, e=elements[0]; e = elements2[i++];) {
        let t = new Cursor(e);
        t.owner = typers[e.dataset.owner];
        t.owner.cursor = t;
    }
}

TyperSetup();


/* ================================================
    BTN-NEXT_下一页
================================================ */
// var btnNext=document.getElementById("btn-next");
// btnNext.onclick=function () {
//     var scrollTop=document.getElementById("d1").scrollTop;
//
// }

$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
        || location.hostname == this.hostname) {

        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top
            }, 1000);
            return false;
        }
    }
});

