"use strict";
cc._RF.push(module, 'cf336cEAD1Nr4xwRdns1EnF', 'game');
// script/game.js

'use strict';

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        ground: {
            default: null,
            type: cc.Node
        },

        bird: {
            default: null,
            type: cc.Node
        },

        background: {
            default: null,
            type: cc.Node
        },

        pillar1: {
            default: null,
            type: cc.Node
        },

        pillar2: {
            default: null,
            type: cc.Node
        },

        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        button: {
            default: null,
            type: cc.Node
        },

        title: {
            default: null,
            type: cc.Node
        },

        backGroundAudio: {
            default: null,
            type: cc.AudioClip
        },

        jumpAudio: {
            default: null,
            type: cc.AudioClip
        },

        lastScore: {
            default: null,
            type: cc.Label
        },

        bestScore: {
            default: null,
            type: cc.Label
        }

    },

    initData: function initData() {
        // 隐藏重新开始、记分板，显示标题
        this.button.active = false;
        this.scoreDisplay.node.active = false;
        this.title.active = true;

        // 初始化帧数
        this.fpscount = 0;

        // 判断是否处于未开始游戏状态
        this.bird.isprepared = false;

        // 判断是否游戏结束
        this.isGameOver = false;

        // 判断第一次结束的flag
        this.firstTimeEnd = true;

        // 初始化游戏的分数
        this.score = 0;

        // 地面以及柱子移动的速度
        this.groundSpeed = 4;

        // 小鸟在未开始游戏时，上下浮动的速度
        this.birdFloatSpeed = 0.5;

        //播放背景音乐
        this.current = cc.audioEngine.play(this.backGroundAudio, true, 1);

        //设置柱子的初始位置
        this.pillar1.y = Math.random() * 700 - 280;
        this.pillar2.y = Math.random() * 700 - 280;
    },

    onLoad: function onLoad() {
        //初始化游戏数据
        this.initData();

        //当屏幕被点击的时候
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchFunction, this);

        //当 重新开始 按钮被点击时
        this.button.on("click", this.buttonClick, this);
    },

    touchFunction: function touchFunction() {
        //停止所有动作
        this.bird.stopAllActions();

        this.jumpAction = this.setJumpAction();
        //游戏开始
        this.bird.isprepared = true;
        this.bird.runAction(this.jumpAction);
    },

    buttonClick: function buttonClick() {
        cc.director.loadScene('game');
    },

    setJumpAction: function setJumpAction() {
        this.bird.jumpHeight = 120;
        this.bird.jumpDuraction = 0.3;
        this.bird.jumpRotation = -15;
        this.bird.dropTurnDuration = 0.2;
        this.bird.dropDownDuration = 1.3;
        this.bird.dropRotation = 90;

        var dropDuration = (this.bird.y + this.node.height / 2) / (this.node.height - this.ground.height) * this.bird.dropDownDuration;

        //动作列表，函数有待优化
        var jumpUp = cc.moveBy(this.bird.jumpDuraction, cc.v2(0, this.bird.jumpHeight));
        var turnUp = cc.rotateTo(0, this.bird.jumpRotation);
        var jumpDown = cc.moveBy(this.bird.jumpDuraction, cc.v2(0, -this.bird.jumpHeight));
        var turnDown = cc.rotateTo(this.bird.dropTurnDuration, this.bird.dropRotation);
        var dropDown = cc.moveTo(dropDuration, this.bird.x, this.ground.height - this.node.height / 2);

        //动作的回执函数，即执行动作后播放音效，参考上手第一个小游戏的音效添加
        var callback = cc.callFunc(this.playJumpSound, this);

        // spawn 同时执行多个动作
        this.bird.spawn = cc.spawn(turnDown, dropDown);

        // sequence 按顺序执行多个动作
        return cc.sequence(turnUp, callback, jumpUp, jumpDown, this.bird.spawn);
    },

    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    groundMove: function groundMove() {
        this.ground.x -= this.groundSpeed;
        if (this.ground.x <= -420) {
            this.ground.x = -360;
        }
    },

    birdFloat: function birdFloat() {
        if (this.fpscount % 40 < 20) {
            this.bird.y += this.birdFloatSpeed;
        } else {
            this.bird.y -= this.birdFloatSpeed;
        }
        this.fpscount += 1;
    },

    pillarMove: function pillarMove() {
        this.pillar1.x -= this.groundSpeed;
        this.pillar2.x -= this.groundSpeed;

        if (this.pillar1.x <= -(this.node.width / 2 + this.pillar1.width / 2)) {
            this.pillar1.x = this.node.width / 2 + this.pillar1.width / 2;
            this.pillar1.y = Math.random() * 700 - 280;
        }

        if (this.pillar2.x <= -(this.node.width / 2 + this.pillar1.width / 2)) {
            this.pillar2.x = this.node.width / 2 + this.pillar1.width / 2;
            this.pillar2.y = Math.random() * 700 - 280;
        }

        if (this.getScore()) {
            this.score += 1;
            //更新 score 的文字
            this.scoreDisplay.string = 'Score: ' + this.score;
        }
    },

    getScore: function getScore() {
        var scoreLine = this.bird.x - (this.pillar1.width + this.bird.width) / 2;

        //判断是否得分
        if (this.pillar1.x <= scoreLine && this.pillar1.x > scoreLine - this.groundSpeed) {
            return true;
        }
        if (this.pillar2.x <= scoreLine && this.pillar2.x > scoreLine - this.groundSpeed) {
            return true;
        }
    },

    isGameOverFun: function isGameOverFun() {
        //判断是否碰到上下边界
        var touchLine = this.bird.y <= -470 || this.bird.y >= 1000;

        //判断是否撞到柱子
        var touchPillarTop1 = Math.abs(this.bird.y - this.pillar1.y) > this.pillar1.height / 2 - this.bird.height / 2;
        var closePillar1 = Math.abs(this.pillar1.x - this.bird.x) < this.bird.width / 2 + this.pillar1.width / 2;
        var crushPillar1 = touchPillarTop1 && closePillar1;

        var touchPillarTop2 = Math.abs(this.bird.y - this.pillar2.y) > this.pillar1.height / 2 - this.bird.height / 2;
        var closePillar2 = Math.abs(this.pillar2.x - this.bird.x) < this.bird.width / 2 + this.pillar2.width / 2;
        var crushPillar2 = touchPillarTop2 && closePillar2;

        if (touchLine || crushPillar1 || crushPillar2) {
            return true;
        }
    },
    gameOver: function gameOver() {
        //获取小鸟的动画组件，并停止动画
        var animBird = this.bird.getComponent(cc.Animation);
        animBird.stop();

        // 把当前分数与最大分数比较
        this.setScore();

        //关闭监听事件
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchFunction, this);

        //停止所有动作，并重新加载界面
        this.bird.stopAllActions();
        cc.audioEngine.stop(this.current);

        var callback = cc.callFunc(function () {
            //显示重新开始
            this.button.active = true;
        }, this);

        var sequence = cc.sequence(this.bird.spawn, callback);
        this.bird.runAction(sequence);
    },

    setScore: function setScore() {
        this.scoreDisplay.node.active = false;
        this.lastScore.string = this.score;
        console.log(cc.sys.localStorage.getItem("bestScore"));
        if (this.score > cc.sys.localStorage.getItem("bestScore")) {
            cc.sys.localStorage.setItem("bestScore", this.score);
        }
        if (cc.sys.localStorage.getItem("bestScore")) {
            this.bestScore.string = cc.sys.localStorage.getItem("bestScore");
        }
    },

    update: function update(dt) {
        //未开始时小鸟的浮动
        if (this.bird.isprepared == false) {
            this.birdFloat();
        }

        //隐藏标题，显示记分板
        if (this.bird.isprepared == true) {
            this.title.active = false;
        }

        //在游戏开始之后、结束之前，移动游戏中的柱子
        if (this.bird.isprepared == true && this.isGameOver == false) {
            this.scoreDisplay.node.active = true;
            this.groundMove();
            this.pillarMove();
        }

        //游戏结束
        if (this.isGameOverFun()) {
            this.isGameOver = true;

            if (this.firstTimeEnd == true) {
                this.gameOver();
                this.firstTimeEnd = false;
            }
        }
    }
});

cc._RF.pop();