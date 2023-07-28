!function () {
    class WebAudioEngine {
        constructor() {
            this.beEnabled = false;
            this.isMuted = false;
            this.bePauseSound = false;
            this.bePauseMusic = false;
            this.tryToResumeIntervalId = -1;
            this.isVisibilityMuted = false;
            this.adShowing = false;
        }
        init() {
            return new Promise((resolve, reject) => {
                try {
                    this.musicAudio = new WebAudioContext();
                    this.soundAudio = new WebAudioContext();
                    window.document.addEventListener("mousedown", () => {

                        setTimeout(() => {
                            if (this.adShowing) {

                            } else {
                                this.tryToResumeAudioContext();
                            }
                        }, 0.1e3);
                    }, true);
                    window.document.addEventListener("touchstart", () => {
                        setTimeout(() => {
                            if (this.adShowing) {

                            } else {
                                this.tryToResumeAudioContext();
                            }
                        }, 0.1e3);
                    },
                        true);
                    window.document.addEventListener("visibilitychange", this.onVisibilitychange.bind(
                        this));
                    this.musicAudio.getContext().onstatechange = this.onMusicStatechange.bind(this);
                    this.soundAudio.getContext().onstatechange = this.onSoundStatechange.bind(this);
                    this.beEnabled = true;
                    this.musicVolume = 60;
                    this.isFocusOn = false;
                    this.tryToResumeAudioContext();
                    resolve(true);
                } catch (e) {
                    console.log("Web Audio API", e);
                    alert("Web Audio API is not supported in this browser");
                    resolve(false);
                }
            });
        }
        onVisibilitychange() {
            if (this.adShowing) {
                return;
            }
            if (document.visibilityState == "hidden") {
                if (!this.isMuted) {
                    this.isVisibilityMuted = this.muted = true;
                }
                Laya.timer.scale = 0;
                Laya.stage.renderingEnabled = false //停止渲染
                Laya.updateTimer && Laya.updateTimer.pause() //停止onUpdate
                Laya.physicsTimer && Laya.physicsTimer.pause() //停止物理
            } else if (document.visibilityState == "visible") {
                if (this.isVisibilityMuted) {
                    this.isVisibilityMuted = this.muted = false;
                }
                Laya.timer.scale = 1;
                Laya.stage.renderingEnabled = true //恢复渲染
                Laya.updateTimer && Laya.updateTimer.resume() //恢复onUpdate
                Laya.physicsTimer && Laya.physicsTimer.resume() //恢复物理
            }
        }
        onDBInstanceMuted() {
            // this.pauseMusic = DBInstance$1.musicMuted.value;
            // this.pauseSound = DBInstance$1.soundMuted.value;
        }
        tryToResumeAudioContext() {


            if (this.adShowing) {
                return;
            }
            if (this.isMuted) {
                return;
            }


            if (this.musicAudio.isSuspend() && !this.bePauseMusic) {
                this.musicAudio.resume();
                if (this.musicAudio._music) {
                    this.musicAudio.playMusic(this.musicAudio._music.url);
                }


            }
            if (this.soundAudio.isSuspend() && !this.bePauseSound) {
                this.soundAudio.resume();

            }
            if (!this.musicAudio.isSuspend() || !this.soundAudio.isSuspend()) {
                window.document.removeEventListener("mousedown", this.tryToResumeAudioContext.bind(this), true);
                window.document.removeEventListener("touchstart", this.tryToResumeAudioContext.bind(this), true);
                clearInterval(this.tryToResumeIntervalId);
                this.tryToResumeIntervalId = -1;
            }
        }
        onMusicStatechange() {
            if (this.musicAudio.isSuspend() && !this.isMuted && !this.bePauseMusic && this.tryToResumeIntervalId ===
                -1) {

                window.document.addEventListener("mousedown", this.tryToResumeAudioContext.bind(this), true);
                window.document.addEventListener("touchstart", this.tryToResumeAudioContext.bind(this), true);
                this.tryToResumeIntervalId = setInterval(this.tryToResumeAudioContext.bind(this), 0.2e3);
            }
        }
        onSoundStatechange() {
            if (this.soundAudio.isSuspend() && !this.isMuted && !this.bePauseSound && this.tryToResumeIntervalId ===
                -1) {
                window.document.addEventListener("mousedown", this.tryToResumeAudioContext.bind(this), true);
                window.document.addEventListener("touchstart", this.tryToResumeAudioContext.bind(this), true);
                this.tryToResumeIntervalId = setInterval(this.tryToResumeAudioContext.bind(this), 0.2e3);
            }
        }
        set muted(b) {
            this.isMuted = b;
            if (this.isMuted) {
                this.musicAudio.suspend();
                this.soundAudio.suspend();
            } else {
                if (this.tryToResumeIntervalId == -1) {
                    this.tryToResumeIntervalId = setInterval(this.tryToResumeAudioContext.bind(this), 0.2e3);
                }

            }
        }

        get muted() {
            return this.isMuted;
        }

        set pause(b) {
            this.pauseSound = b;
            this.pauseMusic = b;
            if (!b) {
                this.soundAudio.stopAllNoLoop();
            }
        }
        get pause() {
            return this.pauseSound || this.pauseMusic;
        }

        set pauseSound(b) {
            this.bePauseSound = b;
            if (this.bePauseSound) {
                this.soundAudio.suspend();
            } else {
                if (this.isMuted)
                    return;
                this.soundAudio.resume();
            }
        }
        get pauseSound() {
            return this.bePauseSound;
        }
        get pauseMusic() {
            return this.bePauseMusic;
        }
        set pauseMusic(b) {
            this.bePauseMusic = b;
            if (this.bePauseMusic) {
                this.musicAudio.suspend();
            } else {
                if (this.isMuted)
                    return;
                this.musicAudio.resume();
            }
        }
        stopAll() {
            this.musicAudio.stopAll();
            this.soundAudio.stopAll();
        }
        stopAllSound() {
            this.soundAudio.stopAll();
        }
        parse(url, data, onComplete) {
            this.soundAudio.parse(url, data);
        }
        playMusic(url) {
            this.musicAudio.stopAll();
            this.musicAudio.playMusic(url);
        }
        stopMusic() {
            this.musicAudio.stopAll();
        }
        stopSound(url) {
            this.soundAudio.stop(url);
        }
        set musicVolume(vlaue) {
            this.musicAudio.musicVolume = vlaue;
        }
        get musicVolume() {
            return this.musicAudio.musicVolume;
        }
        set soundVolume(vlaue) {
            this.soundAudio.volume = vlaue;
        }
        get soundVolume() {
            return this.soundAudio.volume;
        }
        playSound(url, loop = false, singleton = false) {
            if (!this.beEnabled)
                return;
            this.soundAudio.play(url, loop, singleton);
        }
    }
    class WebAudioSource { }
    class WebAudioContext {
        constructor() {
            this.volume = 100;
            this._audioInstances = new Map();
            this._musicVolume = 100;

            window.AudioContext = window.AudioContext || window["webkitAudioContext"];
            this.context = new AudioContext();
        }
        getContext() {
            return this.context;
        }
        isSuspend() {
            return this.context.state === "suspended";
        }
        suspend() {
            return this.context.suspend();
        }
        resume() {
            return this.context.resume();
        }

        stopAllNoLoop() {
            const values = this._audioInstances.values();
            for (const sound of values) {
                const instance = sound.instance;
                if (instance.source.buffer && !instance.source.loop) {
                    try {
                        instance.source.stop(this.context.currentTime);
                    } catch (e) {
                        instance.source.disconnect();
                    }
                    instance.source.onended = (function () { });
                    instance.setup();
                }
            }
        }
        stopAll() {
            const values = this._audioInstances.values();
            for (const sound of values) {
                const instance = sound.instance;
                if (instance.source.buffer) {
                    try {
                        instance.source.stop(this.context.currentTime);
                    } catch (e) {
                        instance.source.disconnect();
                    }
                    instance.source.onended = (function () { });
                    instance.setup();
                }
            }
        }
        stop(url) {
            if (this._audioInstances.has(url)) {
                const sound = this._audioInstances.get(url);
                this._stopSound(sound);
            }
        }
        _stopSound(sound) {
            const instance = sound.instance;
            if (instance.source.buffer) {
                try {
                    instance.source.stop(this.context.currentTime);
                } catch (e) {
                    instance.source.disconnect();
                }
                instance.source.onended = (function () { });
                instance.setup();
            }
        }
        playMusic(url) {

            if (this._music) {
                this._stopSound(this._music);
            }
            if (this._audioInstances.has(url)) {

                this._music = this._audioInstances.get(url);
                this.musicVolume = this._musicVolume;
                this.play(url, true);
            } else {
                this.downloadArrayBuffer(url, () => {
                    this.playMusic(url);
                });
            }
        }
        stopMusic() {
            if (this._music) {
                this._stopSound(this._music);
            }
        }
        set musicVolume(vlaue) {
            this._musicVolume = vlaue;
            if (this._music) {
                this._music.instance.gain.gain.value = this._musicVolume / 100;
            }
        }
        get musicVolume() {
            return this._musicVolume;
        }
        set soundVolume(vlaue) {
            this.volume = vlaue;
        }
        get soundVolume() {
            return this.volume;
        }
        play(url, loop = false, singleton = false) {
            if (this._audioInstances.has(url)) {
                const sound = this._audioInstances.get(url);
                const instance = sound.instance;
                if (singleton && !instance.ended)
                    return;
                this.stop(url);
                if (sound.buffer) {
                    try {
                        if (window.WebAudioEngine.pause && !loop) {
                            return;
                        }
                        sound.volume = this.volume;
                        instance.playBuffer(this.context.currentTime, sound.buffer);
                        instance.source.loop = loop;
                    } catch (e) {
                        console.error("playBuffer error. Exception: " + e);
                    }
                }
            } else {
                this.downloadArrayBuffer(url, () => {
                    this.play(url, loop);
                });
            }
        }
        load(urls, onComplete) {
            let t = urls.length;
            let d = 0;
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                this.downloadArrayBuffer(url, () => {
                    d++;
                    if (d >= t) {
                        onComplete && onComplete();
                    }
                });
            }
        }
        setThreeD(url) {
            if (this._audioInstances.has(url)) {
                const sound = this._audioInstances.get(url);
                sound.instance.threeD = true;
            }
        }
        createSoundInstance() {
            let audioContext = this.context;
            const instance = {
                gain: audioContext.createGain(),
                panner: audioContext.createPanner(),
                threeD: false,
                ended: false,
                playBuffer: (function (delay, buffer, offset) {
                    this.source.buffer = buffer;
                    var chan = this;
                    this.ended = false;
                    this.source.onended = (function () {
                        chan.setup();
                        chan.ended = true;
                    });
                    this.source.start(delay, offset);
                }),
                setup: (function () {
                    this.source = audioContext.createBufferSource();
                    this.setupPanning();
                }),
                setupPanning: (function () {
                    if (this.threeD) {
                        this.source.disconnect();
                        this.source.connect(this.panner);
                        this.panner.connect(this.gain);
                    } else {
                        this.panner.disconnect();
                        this.source.connect(this.gain);
                    }
                })
            };
            instance.panner.rolloffFactor = 0;
            instance.gain.connect(this.context.destination);
            instance.setup();
            return instance;
        }
        parse(url, data, onComplete) {
            const sound = new WebAudioSource();
            sound.url = url;
            sound.instance = this.createSoundInstance();
            this._audioInstances.set(url, sound);
            this.context.decodeAudioData(data, function (buffer) {
                sound.buffer = buffer;
                onComplete && onComplete();
            }, function (e) {
                sound.error = true;
                onComplete && onComplete();
                console.log("Decode error." + sound.url);
            });
        }
        downloadArrayBuffer(url, onComplete) {
            if (this._audioInstances.has(url)) {
                onComplete && onComplete();
                return;
            }
            const t = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 0) {
                    t.parse(url, xhr.response, onComplete);
                } else {
                    throw "no response";
                }
            };
            xhr.onerror = function () {
                onComplete && onComplete();
                throw "no response";
            };
            xhr.ontimeout = function () {
                onComplete && onComplete();
            };
            xhr.onabort = function () {
                onComplete && onComplete();
            };
            xhr.send(null);
        }
    }
    class NullWebAudioEngine {
        constructor() {
            this.beEnabled = false;
            this.isMuted = false;
            this.bePauseSound = false;
            this.bePauseMusic = false;
            this.tryToResumeIntervalId = -1;
            this.isVisibilityMuted = false;
            this.adShowing = false;
        }
        init() {
            return new Promise((resolve, reject) => {
                try {
                    this.beEnabled = true;
                    this.musicVolume = 60;
                    resolve(true);
                }
                catch (e) {
                    console.log("Web Audio API", e);
                    resolve(false);
                }
            });
        }
        onVisibilitychange() {
        }
        onDBInstanceMuted() {
            // this.pauseMusic = DBInstance$1.musicMuted.value;
            // this.pauseSound = DBInstance$1.soundMuted.value;
        }
        tryToResumeAudioContext() {
            if (this.isMuted)
                return;

        }
        onMusicStatechange() {
        }
        onSoundStatechange() {
        }
        set muted(b) {
            this.isMuted = b;
        }

        get muted() {
            return this.isMuted;
        }

        set pause(b) {
            this.pauseSound = b;
            this.pauseMusic = b;
        }
        get pause() {
            return this.pauseSound || this.pauseMusic;
        }

        set pauseSound(b) {
            this.bePauseSound = b;
        }
        get pauseSound() {
            return this.bePauseSound;
        }
        get pauseMusic() {
            return this.bePauseMusic;
        }
        set pauseMusic(b) {
            this.bePauseMusic = b;
        }
        stopAll() {
        }
        parse(url, data, onComplete) {
        }
        playMusic(url) {
        }
        stopMusic() {
        }
        stopSound(url) {
        }
        set musicVolume(vlaue) {
        }
        get musicVolume() {
            return 60;
        }
        playSound(url, loop = false, singleton = false) {
            if (!this.beEnabled)
                return;
        }
    }
    //const audioEngine = window.WebAudioEngine = new NullWebAudioEngine();
    const audioEngine = window.WebAudioEngine = new WebAudioEngine();

    // var WebAudioEngine$1 = 



    class platform {
        constructor() {
            this.canNavigateActive_ = false;
            this.screen_ = "";
            this.action_ = "";
            this.to_ = "";
            this.prompt_ = null;
            this.initialized_ = false;
			this.lastShowVedioTime = 0;
            this.lastTableAdShowTime = new Date().getTime();  
            this.initData();
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new platform();
            }
            return this._instance;
        }
        initData() {
        }
        onNavigate_() {
        }

        getStorageSync(key) {
            let value = null;
            try {
                let v = Laya.LocalStorage.getItem(key);
                value = JSON.parse(v);
            } catch (error) {

            }

            return value
        }
        setStorageSync(key, value) {
            return Laya.LocalStorage.setItem(key, JSON.stringify(value));
        }

        navigate(screen_, action_, to_) {
            // if (this.canNavigateActive_ === false) {
                // this.screen_ = screen_;
                // this.action_ = action_;
                // this.to_ = to_;
                // this.canNavigateActive_ = true;
            // }
        }

        onblur() {
            setTimeout(() => {
                audioEngine.muted = true;
            }, 0.1e3)
        }

        onfocus() {
            setTimeout(() => {
                audioEngine.muted = false;
            }, 0.1e3)
        }
		showTableAd()
		{
			this.showInterstitial();
		}
		showBanner()
		{
            
		}
		hideBanner()
		{
            
		}        
        //插屏广告
        showInterstitial(complete) {
            console.log("插屏广告")
            window.HUHU_showInterstitialAd();
            complete&&complete();

        }
        //复活
        showReward(success, failure) {
            console.log("激励广告");
			console.log("3333333333333333333333");
			let curTime = new Date().getTime();
			if (curTime - this.lastShowVedioTime <= 500)
			{
				if (failure) {
					failure();
					failure = null;
				}
				this.prompt('Frequent requests, please try again later');
				return;
			}
			this.lastShowVedioTime = curTime;
            window.HUHU_showRewardedVideoAd(success,failure);
        }

        initList(appList) {
            // if (YYGSDK.isGamedistribution) {
                // appList.visible = false;
                // return;
            // }
            // appList.renderHandler = new Laya.Handler(appList, function (e) {
                // e.offAll(Laya.Event.MOUSE_DOWN);
                // e.on(Laya.Event.MOUSE_DOWN, e, () => { platform.getInstance().navigate("GAME", "MORE", e.dataSource.id) });
            // })
            // appList.array = platform.getInstance().getForgames();
        }
        getForgames() {
            // let sforgames = YYGSDK.forgames || []
            // // {
            // //     thumb:"adsfafa.png"
            // // }
            // let forgames = sforgames.slice();
            // for (let i = 0, length = forgames.length; i < length; i++) {
                // const random = Math.floor(Math.random() * (i + 1));
                // const item = forgames[random];
                // forgames[random] = forgames[i];
                // forgames[i] = item;
            // }
            // return forgames;
			return null;
        }

        createLogo() {
            const yad = new Laya.Image();
            yad.skin = "yad.png";
            yad.zOrder = 2e5;
            Laya.stage.addChild(yad);
            return yad;
        }
        // yad.on(Laya.Event.MOUSE_DOWN, yad, () => { platform.getInstance().navigate("GAME", "LOGO"); });
		showSplash(data) {

		}
		hideSplash() {
			
		}
        /**
         * 启动YAD——SDK
         * @param {*} name 
         * @param {*} complete 
         */
        yadstartup(name, complete) {
            if (this.initialized_)
            {
                complete && complete(); complete = null;
                return;
            }

			// this.createNoVideo();
			// this.createLoading();
			Laya.SoundManager.autoReleaseSound = false;
			if (window.WebAudioEngine instanceof WebAudioEngine)
			{
				console.log("有效的 WebAudioEngine");
                window.WebAudioEngine.init().then(() => {
                    Laya.SoundManager.playMusic = function (url) {
                        if (url ==null || url.length <= 0)
                        {
                            return;
                        }
                        window.WebAudioEngine && window.WebAudioEngine.playMusic(Laya.URL.customFormat(url));
                    }
                    Laya.SoundManager.playSound = function (url,num = 1) {
                        if (url ==null || url.length <= 0)
                        {
                            return;
                        }
                        window.WebAudioEngine && window.WebAudioEngine.playSound(Laya.URL.customFormat(url),num == 0);
                    }
                    Laya.SoundManager.stopMusic = function () {
                        window.WebAudioEngine && window.WebAudioEngine.stopMusic();
                    }
                    Laya.SoundManager.stopAll = function () {
                        window.WebAudioEngine && window.WebAudioEngine.stopAll()
                    }
                    Laya.SoundManager.stopAllSound = function () {
                        window.WebAudioEngine && window.WebAudioEngine.stopAllSound()
                    }
                    Laya.SoundManager.stopSound = function (url) {
                        if (url ==null || url.length <= 0)
                        {
                            return;
                        }
                        window.WebAudioEngine && window.WebAudioEngine.stopSound(Laya.URL.customFormat(url));
                    }
                    Laya.SoundManager.setMusicVolume = function(val) {
                        window.WebAudioEngine && (window.WebAudioEngine.musicVolume = val * 100);
                    }
                    Laya.SoundManager.setSoundVolume = function(val) {
                        window.WebAudioEngine && (window.WebAudioEngine.soundVolume = val * 100);
                    }
                    Object.defineProperty(Laya.SoundManager,"soundVolume", {
                        set: function(value) {
                            window.WebAudioEngine.soundVolume = value * 100;
                        },
                        get: function() {
                            return window.WebAudioEngine && (window.WebAudioEngine.soundVolume / 100)
                        }
                    });
                    Object.defineProperty(Laya.SoundManager,"musicVolume", {
                        set: function(value) {
                            window.WebAudioEngine.musicVolume = value * 100;
                        },
                        get: function() {
                            return window.WebAudioEngine && (window.WebAudioEngine.musicVolume / 100)
                        }
                    });
                    Object.defineProperty(Laya.SoundManager,"muted", {
                        set: function(value) {
                            window.WebAudioEngine && (window.WebAudioEngine.muted = value);
                        },
                        get: function() {
                            return window.WebAudioEngine && window.WebAudioEngine.muted;
                        }
                    });
                    Object.defineProperty(Laya.SoundManager,"soundMuted", {
                        set: function(value) {
                            window.WebAudioEngine.pauseSound = value;
                        },
                        get: function() {
                            return window.WebAudioEngine && window.WebAudioEngine.pauseSound
                        }
                    });
                    Object.defineProperty(Laya.SoundManager,"musicMuted", {
                        set: function(value) {
                            window.WebAudioEngine.pauseMusic = value;
                        },
                        get: function() {
                            return window.WebAudioEngine && window.WebAudioEngine.pauseMusic
                        }
                    });
                })			
			}
            //临时锁死
            complete && complete(); complete = null; this.initialized_ = true;
			setTimeout(()=>{
				this.tipMsg = this.tip();
			},500);
        }
		tip() {
			/**LMsg 消息提示*/
			function ShowTip(text) {
                let UI_Tips = new Laya.Box();
                UI_Tips.name = "UI_Tips";
                UI_Tips.zOrder =3999999;
                Laya.stage.addChild(UI_Tips);
				let gh = Laya.stage.height;
				let gw = Laya.stage.width;
                let tsLayer = new Laya.Sprite();
                tsLayer.width = gw;
                UI_Tips.addChild(tsLayer);

                let tsText = new Laya.Label();
                textScaleFun(tsText, gh * 0.023, "#ffffff");
                tsText.text = text;
                tsText.stroke = 2;
                tsText.bold = true;
                tsText.strokeColor = "#111111";
                tsText.align = "center";
                tsLayer.addChild(tsText);
                tsText.anchorX = tsText.anchorY = 0.5;
                tsText.x = (gw) / 2;
                tsLayer["tsText"] = tsText;
                let width = tsLayer.getBounds().width;

                tsLayer.x = 0;
                tsLayer.y = gh * 0.38;
                let tsLayery = tsLayer.y;
                tsLayer.alpha = 0;

                Laya.Tween.clearTween(tsLayer);
                Laya.Tween.to(tsLayer, { y: tsLayery - gh * 0.05 }, 2000, Laya.Ease.quadOut, null, 280);
                Laya.Tween.to(tsLayer, { alpha: 1 }, 280, Laya.Ease.quadOut, Laya.Handler.create(this, ()=>
                {
                    Laya.timer.once(1700, this, ()=>{
                        Laya.Tween.clearTween(tsLayer);
                        Laya.Tween.to(tsLayer, { alpha: 0 }, 300, Laya.Ease.quadOut, Laya.Handler.create(this, ()=>{
                            removeFromParent(tsLayer)
                        }))
                    });
                }));
			}	
			function removeFromParent(obj) {
				obj && obj.parent && obj.parent.removeChild(obj);
			}			
			function textScaleFun(obj, height, textColor, fontFamily){
				let result = new Laya.Label();
				result.fontSize = 24;
				if (textColor || textColor == "#000000") obj.color = textColor;
				fontFamily ? obj.font = fontFamily : obj.font = "Arial";
				result.font = obj.font;
				result.text = "Mrz默认值Mrz";
				if (result.text && result.height != 0) {
					while (result.height < height) {
						result.fontSize++;
					}
					while (result.height > height && result.fontSize > 40) {
						result.fontSize--;
					}
				}
				obj.fontSize = result.fontSize;
			}	
			return ShowTip;
		}
        prompt(msg, duration) {
			if (window.WebAudioEngine instanceof NullWebAudioEngine)
			{
				this.tipMsg(msg);
				return 
			}
            if (!this.prompt_) {
                this.prompt_ = document.createElement('div');
                this.prompt_.style.cssText = "font-family:siyuan;max-width:80%;min-width:320px;padding:10px 10px 10px 10px;min-height:40px;color: rgb(255, 255, 255);line-height: 20px;text-align:center;border-radius: 4px;position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
                document.body.appendChild(this.prompt_);
            }
            this.prompt_.innerHTML = msg;
            duration = isNaN(duration) ? 2000 : duration;
            this.prompt_.style.display = "inline";
            this.prompt_.style.opacity = '1';
            setTimeout(function () {
                var d = 0.5;
                this.prompt_.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
                this.prompt_.style.opacity = '0';
                this.prompt_.style.display = "none";
            }.bind(this), duration);
        }
		//只能在Laya引擎使用
		createNoVideo() {
			if (!Laya.Prefab || !Laya.Script) {
				return;
			}
			let noVideoJson = {
				"x": 0,
				"type": "Box",
				"selectedBox": 3,
				"selecteID": 4,
				"searchKey": "Box",
				"props": {
					"y": 0,
					"x": 0,
					"top": 0,
					"right": 0,
					"presetID": 1,
					"preset": "laya/pages/Prefab/NoVideo.prefab",
					"mouseEnabled": true,
					"left": 0,
					"isPresetRoot": true,
					"bottom": 0
				},
				"nodeParent": -1,
				"maxID": 10,
				"label": "Box(NoVideo)",
				"isOpen": true,
				"isDirectory": true,
				"isAniNode": true,
				"hasChild": true,
				"compId": 3,
				"child": [{
					"x": 15,
					"type": "Sprite",
					"searchKey": "Sprite,spr_tip,spr_tip",
					"props": {
						"y": 300,
						"x": 400,
						"width": 740,
						"var": "spr_tip",
						"presetID": 2,
						"preset": "laya/pages/Prefab/NoVideo.prefab",
						"pivotY": 270,
						"pivotX": 370,
						"name": "spr_tip",
						"height": 540
					},
					"nodeParent": 3,
					"label": "spr_tip",
					"isOpen": true,
					"isDirectory": true,
					"isAniNode": true,
					"hasChild": true,
					"compId": 4,
					"child": [{
							"x": 30,
							"type": "Rect",
							"searchKey": "Rect",
							"props": {
								"y": 0,
								"x": 0,
								"width": 740,
								"presetID": 3,
								"preset": "laya/pages/Prefab/NoVideo.prefab",
								"height": 540,
								"fillColor": "#000000"
							},
							"nodeParent": 4,
							"label": "Rect(NoVideo)",
							"isDirectory": false,
							"isAniNode": true,
							"hasChild": false,
							"compId": 6,
							"child": []
						},
						{
							"x": 30,
							"type": "Label",
							"searchKey": "Label",
							"props": {
								"y": 30,
								"x": 0,
								"width": 740,
								"valign": "middle",
								"text": "VIDEO",
								"presetID": 4,
								"preset": "laya/pages/Prefab/NoVideo.prefab",
								"height": 76,
								"fontSize": 80,
								"color": "#ffffff",
								"align": "center"
							},
							"nodeParent": 4,
							"label": "Label(NoVideo)",
							"isDirectory": false,
							"isAniNode": true,
							"hasChild": false,
							"compId": 7,
							"child": []
						},
						{
							"x": 30,
							"type": "Label",
							"searchKey": "Label",
							"props": {
								"y": 163,
								"x": 0,
								"width": 740,
								"valign": "middle",
								"text": "No Video Available",
								"presetID": 5,
								"preset": "laya/pages/Prefab/NoVideo.prefab",
								"height": 170,
								"fontSize": 40,
								"color": "#ffffff",
								"align": "center"
							},
							"nodeParent": 4,
							"label": "Label(NoVideo)",
							"isDirectory": false,
							"isAniNode": true,
							"hasChild": false,
							"compId": 8,
							"child": []
						},
						{
							"x": 30,
							"type": "Label",
							"searchKey": "Label",
							"props": {
								"y": 356,
								"x": 0,
								"width": 740,
								"valign": "middle",
								"text": "Click anywhere to close",
								"presetID": 6,
								"preset": "laya/pages/Prefab/NoVideo.prefab",
								"height": 170,
								"fontSize": 35,
								"color": "#ffffff",
								"align": "center"
							},
							"nodeParent": 4,
							"label": "Label(NoVideo)",
							"isDirectory": false,
							"isAniNode": true,
							"hasChild": false,
							"compId": 9,
							"child": []
						}
					]
				}],
				"animations": [{
					"nodes": [],
					"name": "ani1",
					"id": 1,
					"frameRate": 24,
					"action": 0
				}]
			}
			class noVideoScript extends Laya.Script {
				constructor() {
					super();
				}

				onEnable() {
					this.owner.top = 0;
					this.owner.bottom = 0;
					this.owner.left = 0;
					this.owner.right = 0;

					this.spr_tip = this.owner.getChildByName("spr_tip");

					if (this.owner.width > this.owner.height) {
						this.spr_tip.scale(this.owner.height / 1920, this.owner.height / 1920);
					} else {
						this.spr_tip.scale(this.owner.width / 1080, this.owner.width / 1080);
					}

					this.spr_tip.pos(this.owner.width / 2, this.owner.height / 2);
					this.owner.on(Laya.Event.CLICK, this, this.closePer);
				}

				closePer() {
					platform.getInstance().closeNoVideo();
				}
			}
			let noVideoPer = new Laya.Prefab();
			// Laya.loader.load(noVideoJson, Laya.Handler.create(this, (obj) => {
			noVideoPer.json = noVideoJson;
			this.noVideoPer = noVideoPer.create();
			this.noVideoPer.zOrder = 199999;
			this.noVideoPer.addComponent(noVideoScript);
			// this.showNoVideo();
			// }))
		}


		showNoVideo() {
			this.noVideoPer && Laya.stage.addChild(this.noVideoPer);
		}

		closeNoVideo() {
			this.noVideoPer && this.noVideoPer.removeSelf();
		}


		createLoading() {
			if (!Laya.Prefab || !Laya.Script) {
				return;
			}
			let noVideoJson = {
				"x": 15,
				"type": "Box",
				"searchKey": "Box,box_clickLayer",
				"props": {
					"var": "box_clickLayer",
					"top": 0,
					"right": 0,
					"mouseEnabled": true,
					"left": 0,
					"bottom": 0
				},
				"nodeParent": 2,
				"label": "box_clickLayer",
				"isOpen": true,
				"isDirectory": true,
				"isAniNode": true,
				"hasChild": true,
				"compId": 131,
				"child": [{
						"x": 30,
						"type": "Box",
						"searchKey": "Box",
						"props": {
							"top": 0,
							"right": 0,
							"left": 0,
							"bottom": 0,
							"bgColor": "#000000",
							"alpha": 0.5
						},
						"nodeParent": 131,
						"label": "Box",
						"isOpen": true,
						"isDirectory": false,
						"isAniNode": true,
						"hasChild": false,
						"compId": 132,
						"child": []
					},
					{
						"x": 30,
						"type": "Label",
						"searchKey": "Label",
						"props": {
							"y": 0,
							"x": 0,
							"valign": "middle",
							"text": "LOADING\\nPLEASE WAIT…",
							"right": 0,
							"left": 0,
							"fontSize": 50,
							"color": "#ffffff",
							"centerY": 0,
							"align": "center"
						},
						"nodeParent": 131,
						"label": "Label",
						"isDirectory": false,
						"isAniNode": true,
						"hasChild": false,
						"compId": 133,
						"child": []
					}
				]
			}
			class noVideoScript extends Laya.Script {
				constructor() {
					super();
				}

				onEnable() {

				}

				closePer() {
					platform.getInstance().closeNoVideo();
				}
			}
			let noVideoPer = new Laya.Prefab();
			// Laya.loader.load(noVideoJson, Laya.Handler.create(this, (obj) => {
			noVideoPer.json = noVideoJson;
			this.loadingPer = noVideoPer.create();
			this.loadingPer.zOrder = 199999;
			this.loadingPer.addComponent(noVideoScript);
			// this.showNoVideo();
			// }))
		}


		showLoading() {
			this.loadingPer && Laya.stage.addChild(this.loadingPer);
		}

		closeLoading() {
			this.loadingPer && this.loadingPer.removeSelf();
		}
		GetCorners (camera, distance)
		{
			let halfFOV = (camera.fieldOfView * 0.5 ) * Math.PI * 2 / 360;
			let aspect = camera.aspectRatio;
			let height = distance * Math.tan(halfFOV);
			let width = height * aspect;
			return [width, height];
		}
		SetModelOffset (camera, scale=1, model=null, x=NaN, y=NaN)
		{
			if(camera)
			{
				camera.orthographic = !0,
				camera.orthographicVerticalSize = Laya.stage.height*0.5*0.01 * scale;
			}
			let width  = Laya.stage.width *0.5*0.01 * scale;
			let height = Laya.stage.height*0.5*0.01 * scale;
			if(model)
			{
				let xx = model.transform.position.x;
				let yy = model.transform.position.y;
				model.transform.position = new Laya.Vector3(isNaN(x)?xx:width*x, isNaN(y)?yy:height*y, model.transform.position.z);
			}
			return [width, height]
		}
    }
    platform._instance = null;
    window["platform"] = platform;
}()
