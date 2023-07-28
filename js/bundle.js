(function () {
    'use strict';

    /**
     * Created by Administrator on 2019/12/3.
     * UI 基类
     */
    class UIBase extends Laya.View {
        constructor() {
            super();
            //默认移除界面资源
            this.autoDestroyAtClosed=true;
            //场景名
            this.name = this.constructor.name;
            //事件
            this._event = {};
            //ui动画管理
            this._aniArr = [];
            this.$updateArr = [];
        }

        onOpened(arg){
            super.onOpened();
            this.argObj = arg;
            this.initData();
            this.initUI();
            this.initEvent();
        }

        initUI(){

        }

        initData(){

        }

        initEvent(){

        }

        //注册监听事件
        addEvent(EventName, callback){
            this._event[EventName] = callback.bind(this);
            eventDispatcher.addEventListen(EventName, this, this._event[EventName]);
        };

        //移除监听
        removeEvent(EventName){
            eventDispatcher.removeEventListen(EventName, this, this._event[EventName]);
        };

        removeAllEvent(){
            for(var key in this._event){
                this.removeEvent(key);
            }
        };

        /**派发自定义事件*/
        dispatchEvent (eventTag, event) {
            eventDispatcher.dispatchEvent(eventTag, event);
        };

        /**
         * 播放动画， 方便统一管理
         * @param ani
         * @param isLoop
         */
        playAni(ani, isLoop){
            if(ani._aniID){
                this._aniArr.push(ani);
            }
            ani.play(0, isLoop);
            ani.$isPlaying = true;
        };
        stopAllAni(){
            for(var i = 0; i < this._aniArr.length; i++){
                var ani = this._aniArr[i];
                if(ani.$isPlaying){
                    ani.stop();
                }
            }
        };
        resumeAllAni(){
            for(var i = 0; i < this._aniArr.length; i++){
                var ani = this._aniArr[i];
                if(ani.$isPlaying){
                    ani.play(0, ani.loop);
                }
            }
        };

        //移除计时器
        removeTimer(){
            if(this.$updateArr){
                for(var i = 0; i < this.$updateArr.length; i++){
                    updateManager.clear(this.$updateArr[i]);
                }
            }
        };

        doClose(){
            uiManager.closeUI(this.url);
        }

        //界面关闭监听
        onClosed(){
            this.removeTimer();
            this.stopAllAni();
            this.removeAllEvent();
        }
    }

    /**
     * Created by Administrator on 2020/2/25.
     * 工具类
     */
    class Tools {
        static copyForm(_a, _b) {
            for (let key in _b) {
                _a[key] = _b[key];
            }
        }

        static copyForm2(_a, _b) {
            for (let key in _b) {
                if (typeof _b[key] == "string" || typeof _b[key] == "number" || typeof _b[key] == "boolean")
                    _a[key] = _b[key];
            }
        }

        static isEqualDateTime(_time1, _time2) {
            if (!_time1 || !_time2 || _time1 == 0 || _time2 == 0)
                return false;
            let tdate1 = new Date(_time1);
            let tdate2 = new Date(_time2);
            if (tdate1.getFullYear() == tdate2.getFullYear() && tdate1.getMonth() == tdate2.getMonth() && tdate1.getDate() == tdate2.getDate())
                return true;
            return false;
        }

        static getAngleByTwoPoint(p1, p2) {
            let tx = p2.x - p1.x;
            let ty = p2.y - p1.y;
            let ta = Math.atan2(ty, tx);
            let tangle = ta * 180 / Math.PI;
            return tangle;
        }

        static norTime(_value) {
            let th = Math.floor(_value / 3600);
            let tmin = th % 60;
            let ts = _value % 60;
            let ts2 = ts > 9 ? "" + ts : "0" + ts;
            return th + ":" + tmin + ":" + ts2;
        }

        static norSecondTime(_value) {
            let tmin = Math.floor(_value / 60);
            let ts = _value % 60;
            let ts2 = ts > 9 ? "" + ts : "0" + ts;
            return tmin + ":" + ts2;
        }

        //3D坐标转2D坐标
        static get3D22Dpos(_pos, _camera) {
            let tout = new Laya.Vector3();
            _camera.viewport.project(_pos, _camera.projectionViewMatrix, tout);
            return tout;
        }

        //判断模型坐标是否在屏幕内
        static in3DPosInScene(_pos, _camera) {
            let tscepos = this.get3D22Dpos(_pos, _camera);
            return tscepos.x >= 0 && tscepos.x <= Laya.stage.width && tscepos.y >= 0 && tscepos.y <= Laya.stage.height;
        }

        //计算坐标是否在rect内
        static pointInRect(x, y, rect) {
            let a = (rect.b.x - rect.a.x) * (y - rect.a.y) - (rect.b.y - rect.a.y) * (x - rect.a.x);
            let b = (rect.c.x - rect.b.x) * (y - rect.b.y) - (rect.c.y - rect.b.y) * (x - rect.b.x);
            let c = (rect.d.x - rect.c.x) * (y - rect.c.y) - (rect.d.y - rect.c.y) * (x - rect.c.x);
            let d = (rect.a.x - rect.d.x) * (y - rect.d.y) - (rect.a.y - rect.d.y) * (x - rect.d.x);
            if ((a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)) {
                return true;
            }
            return false;
        }

        //两点计算直线 参数
        static getLineMethodParam(x1, y1, x2, y2) {
            let k = 0;
            if (x2 != x1)
                k = (y2 - y1) / (x2 - x1);
            let b = y2 - k * x2;
            return {k: k, b: b};
        }

        //点到先距离
        static getPointDistLine(x1, y1, k, b) {
            let tdis = Math.abs(k * x1 - y1 + b) / Math.sqrt(k * k + 1);
            return tdis;
        }

        static getTwoPointDist(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        }

        static isIn(_value, a, b) {
            return _value >= a && _value <= b;
        }

        static getBerizPoint(t, p1, p2, p3) {
            let lineX = Math.pow((1 - t), 2) * p1.x + 2 * t * (1 - t) * p2.x + Math.pow(t, 2) * p3.x;
            let lineY = Math.pow((1 - t), 2) * p1.y + 2 * t * (1 - t) * p2.y + Math.pow(t, 2) * p3.y;
            return [lineX, lineY];
        }

        static getStrColorToRbg(_color) {
            let tarr = [];
            for (let i = 1; i < _color.length; i += 2) {
                if (parseInt("0x" + _color.slice(i, i + 2)) == 255) {
                    tarr.push(255);
                } else {
                    tarr.push(parseInt("0x" + _color.slice(i, i + 2)) / 255);
                }
            }
            return tarr;
        }

        static flyImg(_img, _parent, num = 6, fromx, fromy, tox, toY, func) {
            let tp = _parent ? _parent : Laya.stage;
            let timg;
            for (let i = 0; i < num; i++) {
                timg = new Laya.Image(_img);
                timg.x = fromx;
                timg.y = fromy;
                tp.addChild(timg);
                Laya.Tween.to(timg, {x: tox, y: toY}, 500, null, new Laya.Handler(this, function (_img, _index) {
                    _img.removeSelf();
                    _img = null;
                    if (i == num - 1)
                        func();
                }, [timg, i]), i * 60);
            }
        }

        //图片比对，返回相似度
        static imgComarse(_img, _img2, tmplw, tmplh, func) {
            if (!_img2)
                return 0;
            let ttimg = new Laya.Image();
            ttimg.loadImage(_img);
            let ttt1 = ttimg.drawToCanvas(tmplw, tmplh, 0, 0);
            if (Laya.Browser.onQGMiniGame) ;
            let my_canvas = ttimg.drawToCanvas(tmplw, tmplh, 0, 0);
            Laya.SubmitCanvas;
            let my_canvas2 = _img2.drawToCanvas(tmplw, tmplh, 0, 0);
            let tresult = this.pixelsContrast(my_canvas.getTexture().getPixels(0, 0, 500, 375), my_canvas2.getTexture().getPixels(0, 0, tmplw, tmplh), tmplw, tmplh);
            func(tresult);
        }

        //图片信息像素比对
        static pixelsContrast(pixels, pixels2, tmplw, tmplh) {
            var tw = tmplw || 8, th = tmplh || 8;
            pixels = this.pixelsToBinary(pixels, 1);
            pixels2 = this.pixelsToBinary(pixels2, 1);
            var similar = 0, total = 0, more = 0;
            let tlen = tw * th / 2;
            for (var i = 0; i < tlen; i++) {
                if (pixels[i] != 1 && pixels[i] != 0) {
                    console.log(pixels[i]);
                }
                if (pixels[i] == 0 && pixels2[i] == 0)
                    continue;
                if (pixels[i] == 0 && pixels2[i] == 1)
                    more++;
                else if (pixels[i] == 1) {
                    total++;
                    if (pixels2[i] == 1)
                        similar++;
                }
            }
            var result = ((similar - more) / total) * 100;
            if (result < 0)
                result = 0;
            result = Math.floor(result);
            if (result > 97)
                result = 100;
            return result;
        }

        //像素比对
        static pixelsToBinary(pixels, value) {
            let tount = 8;
            var r, g, b, g, avg = 0, len = pixels.length, saLength = len / tount, saIndex = 0;
            var sa = new Uint8Array(saLength);
            if (!value) {
                for (var i = 0; i < len; i += tount) {
                    avg += (.299 * pixels[i] + .587 * pixels[i + 1] + .114 * pixels[i + 2]);
                }
                avg /= (len / 4);
                value = avg;
            }
            let tcount = 0;
            for (var i = 0; i < len; i += tount) {
                r = .299 * pixels[i],
                    g = .587 * pixels[i + 1],
                    b = .114 * pixels[i + 2];
                if ((r + g + b) >= value) {
                    sa[saIndex++] = 1;
                    tcount++;
                }
                else {
                    sa[saIndex++] = 0;
                }
            }
            console.log("tcount:" + tcount);
            return sa;
        }

        static getSpPixels(imgUrl, _w, _h) {
            let img = new Laya.Image();
            img.loadImage(imgUrl);
            let canvas = img.drawToCanvas(tmplw, tmplh, 0, 0);
            return canvas.getTexture().getPixels(0, 0, _w, _h)
        }

        static createColorFilter(_r = 0, _g = 0, _b = 0) {
            let redMat = [
                _r, 0, 0, 0, 0,
                0, _g, 0, 0, 0,
                0, 0, _b, 0, 0,
                0, 0, 0, 1, 0,
            ];
            let filter = new Laya.ColorFilter(redMat);
            return [filter];
        }

        static twMoveList(list) {
            let tlist = list;
            tlist.scrollTo(0);
            tlist.tweenTo(9, 20000);
        }

        static stopMove(list) {
            let tlist = list;
            Laya.Tween.clearTween(tlist);
        }

        //随机 [min, max]
        static random(min, max) {
            var value = Math.floor(Math.random() * (max + 1 - min) + min);
            return value;
        };

        // 从数组中随机一个
        static arrayRandom(array) {
            var idx = this.random(0, array.length - 1);
            return array[idx];
        };

        // 从数组中随机一个并从数组中删除
        static shiftRandom(array) {
            var idx = this.random(0, array.length - 1);
            var value = array[idx];
            array.removeAt(idx);
            return value;
        };

        /** 在权重数组中随机一个index
         * total : 权重总数
         */
        static randomIndexByWeight(array, total) {
            if (!total) {
                total = 0;
                for (var i = 0; i < array.length; i++)
                    total += array[i];
            }
            var ran = this.random(0, total + 1);
            var index = 0;
            for (; index < array.length; index++) {
                ran -= array[index];
                if (ran <= 0)
                    return index;
            }
            return 0;
        };

        static CreateBezierPoints(anchorpoints, pointsAmount) {
            var points = [];
            for (var i = 0; i < pointsAmount; i++) {
                var point = this.MultiPointBezier(anchorpoints, i / pointsAmount);
                points.push(point);
            }
            return points;
        }

        static MultiPointBezier(points, t) {
            let len = points.length;
            let x = 0;
            let y = 0;
            for (let i = 0; i < len; i++) {
                let point = points[i];
                x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (Tools.erxiangshi(len - 1, i));
                y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (Tools.erxiangshi(len - 1, i));
            }
            return {x: x, y: y};
        }

        static erxiangshi(start, end) {
            let cs = 1, bcs = 1;
            while (end > 0) {
                cs *= start;
                bcs *= end;
                start--;
                end--;
            }
            return (cs / bcs);
        };
    }
    window.tools = Tools;
    //修改底层，部分机型无法绘制图形的BUG
    Laya.Sprite.drawToCanvas = function (sprite, _renderType, canvasWidth, canvasHeight, offsetX, offsetY) {
        offsetX -= sprite.x;
        offsetY -= sprite.y;
        offsetX |= 0;
        offsetY |= 0;
        canvasWidth |= 0;
        canvasHeight |= 0;
        var ctx = new Context();
        ctx.size(canvasWidth, canvasHeight);
        ctx.asBitmap = true;
        ctx._targets.start();
        ctx._targets.clear(0, 0, 0, 0);
        RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
        ctx.flush();
        ctx._targets.end();
        ctx._targets.restore();
        var dt = ctx._targets.getData(0, 0, canvasWidth, canvasHeight);
        ctx.destroy();
        //    var imgdata = new ImageData(canvasWidth, canvasHeight);
        var canvx = new HTMLCanvas(true); //创建一个canvas
        canvx.size(canvasWidth, canvasHeight); //设置宽高，这个和ImageData保持一致
        var ctx2dx = canvx.getContext('2d'); //获取上下文
        var imgdata = ctx2dx.getImageData(0, 0, canvasWidth, canvasHeight); //获取imageData，来替代ImageData
        var lineLen = canvasWidth * 4;
        var dst = imgdata.data;
        var y = canvasHeight - 1;
        var off = y * lineLen;
        var srcoff = 0;
        for (; y >= 0; y--) {
            dst.set(dt.subarray(srcoff, srcoff + lineLen), off);
            off -= lineLen;
            srcoff += lineLen;
        }
        var canv = new HTMLCanvas(true);
        canv.size(canvasWidth, canvasHeight);
        var ctx2d = canv.getContext('2d');
        ctx2d.putImageData(imgdata, 0, 0);
        return canv;
    };

    /**
     * Created by Administrator on 2020/2/25.
     */
    class PlayerDataBase {
        constructor() {
            this.level = 0;
            this.name = "";
            this.id = 0;
            this.gold = 0;
            this.level = 1;
            this.diamond = 0;
            this.firstLoginDate = new Date().getTime();
            this.isSound = true;
            this.isVibrate = true;
            this.tongguan = false;
        }
        addAtt(_key, _value, _isRevoer = false) {
            if (_isRevoer)
                this[_key] = _value;
            else {
                if (!this[_key])
                    this[_key] = _value;
                else
                    this[_key] += _value;
            }
        }
        addGold(_value) {
            this.gold += _value;
            console.log("当前金币", this.gold);
            this.save();
        }
        addDiamond(_value) {
            this.diamond += _value;
            console.log("当前钻石", this.diamond);
            this.save();
        }
        levelup(_value = 1) {
            if (this.level == G.MAXLV) {
                this.tongguan = true;
            }
            if (this.level >= G.MAXLV && this.tongguan) {
                this.level = utils.random(2, G.MAXLV);
            } else {
                this.level += _value;
            }
            this.save();
            return this.level;
        }
        setSound(play) {
            this.isSound = play;
            this.save();
        }
        setVibrate(isVibrate) {
            this.isVibrate = isVibrate;
            this.save();
        }
        copyFrom(_data) {
            Tools.copyForm(this, _data);
        }
        save() {
            let tdata = {};
            Tools.copyForm2(tdata, this);
            dataManager.setStorage(tdata);
        }
    }

    /**
     * Created by Administrator on 2020/2/25.
     */
    class PlayerData extends PlayerDataBase {
        constructor() {
            super();
            this.gates = "";

            // 进入游戏时间
            this.inGameTime = 0;

            // 通关
            this.tongGuan = false;
            // 关卡
            this.curLv = 1;

            // 签到
            this.sgin = true;
            // 天数
            this.sginDay = 0;
            // 签到时间
            this.sginTime = 0;

            // 任务配置
            this.taskConfig = "";
            // 是否刷新过任务
            this.isUpdateTask = false;
            // 任务是否全部完成
            this.taskAllComplete = false;
            // 领取全部任务完成奖励
            this.taskCompleteGetNum = 0;
            // 是否已领取
            this.isGetTask = false;

            // 拥有的背饰
            this.ownBackDecorationArr = "";
            // 当前背饰
            this.curBackDecoration = 0;

            // 拥有的头饰
            this.ownHeadDecorationArr = "";
            // 当前头饰
            this.curHeadDecoration = 0;

            // 试用皮肤
            this.tryoutSkin = 0;
        }
        //设置关卡完成度
        setGatePorss(_gate, _value) {
            if (!this.gates)
                this.gates = _gate + "_" + _value;
            else {
                let ttar = "";
                let tgates = this.gates.split("|");
                let tinfo;
                let temp;
                let tfind;
                for (let i = 0; i < tgates.length; i++) {
                    tinfo = tgates[i].split("_");
                    if (parseInt(tinfo[0]) == _gate && _value > parseInt(tinfo[1])) {
                        temp = _gate + "_" + _value;
                        tfind = true;
                    }
                    else
                        temp = tinfo[0] + "_" + tinfo[1];
                    if (temp) {
                        if (!ttar)
                            ttar = temp;
                        else
                            ttar += "|" + temp;
                    }
                }
                if (!tfind)
                    this.gates += ("|" + _gate + "_" + _value);
                else
                    this.gates = ttar;
            }
            this.save();
        }
        //获取关卡完成度
        getGatePross(_gate) {
            if (this.gates) {
                let tsources = this.gates.split("|");
                for (let i = 0; i < tsources.length; i++) {
                    if (tsources[i].split("_")[0] == _gate + "")
                        return parseInt(tsources[i].split("_")[1]);
                }
            }
            return 0;
        }
        //判断是否解锁关卡
        isUnlock(_gate) {
            let tgates = this.gates.split("|");
            for (let i = 0; i < tgates.length; i++) {
                if (parseInt(tgates[i].split("_")[0]) == _gate)
                    return true;
            }
            return false;
        }
        copyFrom(_data) {
            super.copyFrom(_data);
            let tdate = new Date();
            let tstr = tdate.getFullYear() + "_" + tdate.getMonth() + "_" + tdate.getDate();
            if (tstr != this.day) {
                this.nativeAdClickTimes = 0;
                this.day = tstr;
                this.save();
            }
        }
        static getIns() {
            if (!this._ins)
                this._ins = new PlayerData();
            return this._ins;
        }

        /**
         * 设置 进入游戏时间
         */
        setInGameTime() {
            if (this.inGameTime) return;
            this.inGameTime = new Date().getTime();
            this.save();
        }
        /** 初始 */
        initInGameTime() {
            this.inGameTime = 0;
            this.save();
        }

        /**
         * 设置 是否通关
         */
        setTongGuan(val) {
            this.tongGuan = val;
            this.save();
        }
        /**
         * 增加 当前关卡(只有显示作用)
         */
        addCurLv() {
            this.curLv++;
            if (this.curLv >= 999) {
                this.curLv = 999;
                this.setTongGuan(true);
            }
            this.save();
        }

        /**
         * 设置 签到
         */
        setSgin(val) {
            this.sgin = val;
            this.save();
        }

        /**
         * 增加 签到天数
         */
        addSginDay() {
            this.sginDay++;
            this.save();
        }
        /** 初始 */
        initSginDay() {
            this.sginDay = 0;
            this.save();
        }

        /**
         * 设置 签到时间
         */
        setSginTime() {
            this.sginTime = new Date().getTime();
            this.save();
        }
        /** 初始 */
        initSginTime() {
            this.sginTime = 0;
            this.save();
        }

        /**
        * 初始 任务配置
        */
        initTaskConfig() {
            if (!this.taskConfig) {
                var arr = [];
                var taskConfig = Object.values(D.taskConfig);
                while (true) {
                    var data = taskConfig[parseInt(Math.random() * taskConfig.length)];
                    for (var i = 0; i < arr.length; i++) {
                        if (data && JSON.parse(arr[i]).id == data.id) {
                            // 过滤已经全部升级技能任务(技能全满级)
                            if (data.id == 2006) {
                                if (this.iceLv >= 10 || this.offLineLv >= 10) {
                                    data = null;
                                }
                            }
                            data = null;
                            break;
                        }
                    }
                    if (data) {
                        arr.push(JSON.stringify({ id: data.id, num: 0, isGet: false }));

                    }
                    if (arr.length > 2) {
                        break;
                    }
                }
                this.taskConfig = arr.join("#");
                this.save();
            }
        }
        /** 设置 id任务id  /  val完成值  */
        setTaskConfig(id, val, isGet) {
            var arr = this.taskConfig.split("#");
            for (var i = 0; i < arr.length; i++) {
                var data = JSON.parse(arr[i]);
                if (id == data.id) {
                    data.num += val;
                    if (isGet) {
                        data.isGet = isGet;
                        data.num = val;
                    }
                    arr[i] = JSON.stringify(data);
                }
            }
            this.taskConfig = arr.join("#");
            this.save();
        }
        /** 更新 */
        updateTaskConfig() {
            this.taskConfig = "";
            this.initTaskConfig();
            this.save();
        }
        /** 获取 */
        getTaskConfig() {
            var arr = this.taskConfig.split("#");
            for (var i = 0; i < arr.length; i++) {
                arr[i] = JSON.parse(arr[i]);
            }
            return arr;
        }

        /**
         * 设置 是否刷新过任务
         */
        setIsUpdateTask(val) {
            this.isUpdateTask = val;
            this.save();
        }

        /**
         * 设置 完成全部任务
         */
        setTaskAllComplete(val) {
            this.taskAllComplete = val;
            this.save();
        }

        /**
         * 设置 领取全部任务完成奖励
         */
        setTaskCompleteGetNum() {
            this.taskCompleteGetNum += 1;
            this.save();
        }
        /** 初始 */
        initTaskCompleteNum() {
            this.taskCompleteGetNum = 0;
            this.save();
        }

        /**
         *  是否已领取 
         */
        setIsGetTask(val) {
            this.isGetTask = val;
            this.save();
        }

        /**
         * 增加拥有的背饰
         */
        addOwnBackDecoration(val) {
            var arr = [];
            if (this.ownBackDecorationArr.length != 0) {
                arr = this.ownBackDecorationArr.split(",");
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == val) {
                        return;
                    }
                }
            }
            arr.push(val);
            this.ownBackDecorationArr = arr.join(",");
            this.save();
        }

        /**
         * 设置当前背饰
         */
        setCurBackDecoration(val) {
            this.curBackDecoration = val;
            this.save();
        }

        /**
         * 增加拥有的头饰
         */
        addOwnHeadDecoration(val) {
            var arr = [];
            if (this.ownHeadDecorationArr.length != 0) {
                arr = this.ownHeadDecorationArr.split(",");
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == val) {
                        return;
                    }
                }
            }
            arr.push(val);
            this.ownHeadDecorationArr = arr.join(",");
            this.save();
        }

        /**
         * 设置当前头饰
         */
        setCurHeadDecoration(val) {
            this.curHeadDecoration = val;
            this.save();
        }

        /**
         * 试用皮肤
         */
        setTryoutSkin(val) {
            this.tryoutSkin = val;
            this.save();
        }

    }
    window.playerData = PlayerData;

    class DefeatUI extends UIBase {

        constructor() {
            super();
        }

        initUI() {

        }

        initData() {

        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_rest, this, function () {
                battleMgr.startGame();
                G.Main.updateUI();
                this.doClose();
            });
        }

        doClose() {
            PlayerData.getIns().setTryoutSkin(0);
            if (this.argObj && this.argObj.callback) {
                this.argObj.callback();
            }
            if (uleeSDK) {
                uleeSDK.getIns.showInterstitial();
            }
            super.doClose();
        }

    }

    /**
     * Created by Administrator on 2019/12/6.
     */
    class LoadingBase extends UIBase {
        constructor() {
            super();
            // 需要加载的项
            this.loadItems = [];
            // 当前加载的项
            this.currItem = null;
            // 当前进度值
            this.value = 0;
            this.count = 0;
            // 当前进度。由至当前加载项的所有count值累计而来。
            this.currCount = 0;
            // 分配给所有项的进度总和
            this.countMax = 0;
        }

        initUI(){
            super.initUI.call(this);
            this.updateKey = updateManager.frameLoop(1,this, this.update);
        }

        addItem (item) {
            this.countMax += item.count;
            this.loadItems.push(item);
            item.loading = this;
        };

        //需要继承重写
        updateProgress () {
            this.value = this.count / this.countMax;// 更新进度条
            if(this.value >= 1){
                this.onLoaded();
            }
        };

        update () {
            // 逐项取出执行
            if (this.currItem == null) {
                if (this.loadItems.length == 0) {
                    if (this.count >= this.countMax) {
                        return;
                    }
                } else if(this.count >= this.currCount){
                    this.currItem = this.loadItems.shift();
                    this.currItem.start();
                }
            } else {
                if (this.currItem.loaded) {
                    // 如果要显示具体进度内容的时候要把注释取消
                    this.currCount += this.currItem.count;
                    this.currItem = null;
                } else {
                    this.currItem.checkFn && this.currItem.checkFn();
                }
            }

            if (this.count < this.currCount) this.count++;
            this.updateProgress();
        };

        /**
         * 所有加载项都已完毕
         */
        onLoaded () {
            updateManager.clear(this.updateKey, this);

        };
    }

    /**
     * Created by Administrator on 2020/1/9.
     * 加载界面
     */
    class GameLoading extends LoadingBase {
        constructor() {
            super();
            //默认移除界面资源
            this.autoDestroyAtClosed = true;
        }

        initUI() {
            super.initUI.call(this);
            this.bar_loading.value = this.value;

            this.addItem(new ulee.LoadItem(function () {
                let self = this;
                self.onComplete();
            }, 10));

            this.addItem(new ulee.LoadItem(function () {
                G.VIEWERCOMPLETELOAD = true;
                this.onComplete();
            }, 10));

            this.addItem(new ulee.LoadItem(function () {
                G.EFFECTCOMPLETELOAD = true;
                this.onComplete();
            }, 10));

            this.addItem(new ulee.LoadItem(function () {
                console.log("加载界面");
                var self = this;
                uiManager.openUI("game/MainView.scene", null, {
                    callback: function () {
                        if (PlayerData.getIns().sgin) {
                            // 签到
                            uiManager.openUI("game/SginView.scene", null, {
                                startFun: function () {
                                    G.Sgin.visible = false;
                                },
                                callback: function () {
                                    if (dataManager.checkTask()) {
                                        // 任务
                                        uiManager.openUI("game/TaskView.scene");
                                    }
                                }
                            });
                        } else if (dataManager.checkTask()) {
                            // 任务
                            uiManager.openUI("game/TaskView.scene", null, {
                                startFun: function () {
                                    G.Task.visible = false;
                                }
                            });
                        }
                        if (G.BattleScript) {
                            G.BattleScript.initScene();
                            G.BattleScript.createRole();
                        }
                        self.onComplete();
                    }
                });
            }, 10));

            this.addItem(new ulee.LoadItem(function () {
                this.onComplete();
            }, 10));

        }

        updateProgress() {
            //this.value 进度0-1
            super.updateProgress.call(this);
            this.bar_loading.width = 734 * this.value;
        };

        onLoaded() {
            super.onLoaded.call(this);
            G.Main && (G.Main.visible = true);
            G.Sgin && (G.Sgin.visible = true);
            G.Task && (G.Task.visible = true);
            G.LOADMUSIC = true;
            audioManager.playMusic(2);
            this.doClose();
        };
    }

    /**
     * Created by Administrator on 2019/12/9.
     */
    class MainUI extends UIBase {
        constructor() {
            super();
            G.Main = this;
        }

        initData() {
        }

        initUI() {
            this.visible = false;
            this.argObj.callback();
            G.COINMOVEENDPOS.x = this.box_coin.x;
            G.COINMOVEENDPOS.y = this.box_coin.y;
            this.btn_sound.alpha = PlayerData.getIns().isSound ? 1 : 0.5;
            this.btn_vibrate.alpha = PlayerData.getIns().isVibrate ? 1 : 0.5;
            this.updateLv();
            this.updateDiam();
            this.ani1.play(0, true);
            Laya.MouseManager.multiTouchEnabled = false;

            uleeSDK && uleeSDK.getIns.showAD();
        }

        initEvent() {
            var self = this;
            // 音效
            utils.onBtnScaleEvent(this.btn_sound, this, function () {
                if (PlayerData.getIns().isSound) {
                    G.ISSOUND = false;
                    PlayerData.getIns().setSound(false);
                    audioManager.setMusicMuted(false);
                    this.btn_sound.alpha = 0.5;
                } else {
                    G.ISSOUND = true;
                    PlayerData.getIns().setSound(true);
                    audioManager.setMusicMuted(true);
                    this.btn_sound.alpha = 1;
                }


                // FBAdManager.addRewardedVideo("4864743603539728_5324944030853014", 1);
                // FBAdManager.addInterstitial("4864743603539728_5324943400853077", 1);
                // FBAdManager.addBanner("4864743603539728_5324942390853178");
                // FBAdManager.loadAll();
            });
            // 震动
            utils.onBtnScaleEvent(this.btn_vibrate, this, function () {
                if (PlayerData.getIns().isVibrate) {
                    // 关闭 
                    PlayerData.getIns().setVibrate(false);
                    this.btn_vibrate.alpha = 0.5;
                } else {
                    // 开启 
                    PlayerData.getIns().setVibrate(true);
                    this.btn_vibrate.alpha = 1;
                }
            });
            // 任务
            utils.onBtnScaleEvent(this.btn_task, this, function () {
                uiManager.openUI("game/TaskView.scene");
            });
            // 签到
            utils.onBtnScaleEvent(this.btn_sgin, this, function () {
                uiManager.openUI("game/SginView.scene");
            });
            // 商店
            utils.onBtnScaleEvent(this.btn_shop, this, function () {
                uiManager.openUI("game/ShopView.scene");
            });
            eventDispatcher.addEventListen(ulee.Event.ON_CHANGE_DIAMOND, this, this.updateDiam);
            eventDispatcher.addEventListen(ulee.Event.ON_TASK, this, this.taskRedPoint);
        }

        /**
         * 更新按钮
         */
        updateUI() {
            this.box_mune.visible = !battleMgr.isGameStart;
            this.box_battleUI.visible = battleMgr.isGameStart;
        }

        /**
         * 更新金币
         */
        updateDiam() {
            if (this.box_coin && this.box_coin._children) {
                utils.getChildDeep(this.box_coin, "label_num").text = PlayerData.getIns().diamond;
            }
        }

        /**
         * 任务红点
         */
        taskRedPoint() {
            var point = utils.getChildDeep(this.btn_task, "img_point");
            point.visible = dataManager.checkTask();
        }

        /**
         * 更新关卡
         */
        updateLv() {
            var lv = PlayerData.getIns().curLv;
            var lv1 = utils.getChildDeep(this.img_lv1, "label_lv");
            var lv2 = utils.getChildDeep(this.img_lv2, "label_lv");
            var lv3 = utils.getChildDeep(this.img_lv3, "label_lv");
            if (lv == 1) {
                this.img_arrow1.visible = false;
                this.img_lv2.visible = false;
                lv1.text = lv;
                lv2.text = lv - 1;
                lv3.text = lv + 1;
            } else {
                this.img_arrow1.visible = true;
                this.img_lv2.visible = true;
                lv1.text = lv;
                lv2.text = lv - 1;
                lv3.text = lv + 1;
            }
            if (PlayerData.getIns().tongGuan) {
                this.img_arrow2.visible = false;
                this.img_lv3.visible = false;
            } else {
                this.img_arrow2.visible = true;
                this.img_lv3.visible = true;
            }
        }

        /**
         * 更新关卡进度
         */
        updateRound(val) {
            var bar = utils.getChildDeep(this.box_bar, "img_bar");
            bar.width = val / G.TOTALLENGTH * 305;
            utils.getChildDeep(this.box_bar, "label_lv").text = PlayerData.getIns().curLv;
        }

    }

    /**
     * Created by Administrator on 2019/12/10.
     */
    class AnimatorStateScript extends Laya.AnimatorStateScript {
        constructor() {
            super();
            this._onAniComplete = null;
            this._onAniStart = null;
        }
        /**
         * 动画状态开始时执行。
         */
        onStateEnter() {
            this._onAniStart && this._onAniStart();
        }
        /**
         * 动画状态更新时执行。
         */
        onStateUpdate() {
            //console.log("动画状态更新了");
        }
        /**
         * 动画状态退出时执行。
         */
        onStateExit() {
            this._onAniComplete && this._onAniComplete();
            if(this.loop && this.animator && this.animator.curAnim == this.animName){
                this.animator.play(this.animName,0,0);
            }
        }

        setComplete(func){
            this._onAniComplete = func;
        }

        setStart(func){
            this._onAniStart = func;
        }
    }

    /**
     * Created by Administrator on 2020/2/25.
     */
    class ModelCfg {
        constructor() {
            this.filePath = "res/";
            //预加载ID列表
            this.initModelId =[10001];
            this.scale = {};
            this.pos = {};
            this.models = {};
        }
        getModelUrlByName(_name) {
            return this.filePath + _name + ".lh";
        }
        getInitModelNames() {
            let tarr = [];
            let modelIds = this.initModelId;
            for (let i = 0; i < modelIds.length; i++) {
                let tname = D.PrefabsPath[modelIds[i]].chs;
                this.scale[tname] = D.PrefabsPath[modelIds[i]].scale;
                this.pos[tname] = D.PrefabsPath[modelIds[i]].pos;
                tarr.push(tname);
            }
            return tarr;
        }
        getInitModelUrls() {
            let tarr = [];
            let modelIds = this.initModelId;
            for (let i = 0; i < modelIds.length; i++) {
                let tname = D.PrefabsPath[modelIds[i]].chs;
                this.scale[tname] = D.PrefabsPath[modelIds[i]].scale;
                this.pos[tname] = D.PrefabsPath[modelIds[i]].pos;
                tarr.push(this.getModelUrlByName(tname));
            }
            return tarr;
        }

        initModels(func = null) {
            let modelsUrls = this.getInitModelUrls();
            Laya.loader.create(modelsUrls, new Laya.Handler(this, function() {
                let tnames = this.getInitModelNames();
                for (let i = 0; i < tnames.length; i++) {
                    this.models[tnames[i]] = Laya.loader.getRes(modelsUrls[i].url);
                }
                if (func)
                    func();
            }));
        }
        loadModel(tname, func){
            let modelUrl = this.getModelUrlByName(tname);
            Laya.loader.create([modelUrl], new Laya.Handler(this, function() {
                this.models[tname] = Laya.loader.getRes(modelUrl);
                let model = this.models[tname].clone();
                this.setLocalScale(model, this.scale[tname]);
                if(this.pos[tname].length > 1){
                    this.setLocalPosition(model, parseFloat(this.pos[tname][0]),parseFloat(this.pos[tname][1]),parseFloat(this.pos[tname][2]));
                }
                if (func)
                    func(model);
            }));
        }
        getModelByName(_name, callback) {
            let tmodel = this.models[_name];
            if (tmodel){
                let model = tmodel.clone();
                this.setLocalScale(model, this.scale[_name]);
                if(this.pos[_name].length > 1){
                    this.setLocalPosition(model, parseFloat(this.pos[_name][0]),parseFloat(this.pos[_name][1]),parseFloat(this.pos[_name][2]));
                }
                callback(model);
            }else{
                return this.loadModel(_name, callback);
            }
        }
        //通过模型ID获取模型
        getModelById(modelId, callback){
            let tname = D.PrefabsPath[modelId].chs;
            this.scale[tname] = D.PrefabsPath[modelId].scale;
            this.pos[tname] = D.PrefabsPath[modelId].pos;
            return this.getModelByName(tname, callback);
        }

        getPosition(sprite3D){
            return sprite3D.transform._localPosition;
        }

        setLocalPosition(sprite3D,x, y, z) {
            let v3 = sprite3D.transform._localPosition;
            v3.x = x, v3.y = y, v3.z = z;
            sprite3D.transform.localPosition = sprite3D.transform._localPosition;
        };

        setLocalScale(sprite3D,x, y, z) {
            (x === void 0) && (x = 1);
            (y === void 0) && (y = x);
            (z === void 0) && (z = x);
            let v3 = sprite3D.transform._localScale;
            v3.x = x, v3.y = y, v3.z = z;
            sprite3D.transform.localScale = sprite3D.transform._localScale;
        };

        //设置模型角度
        setLocalRotation(sprite3d,xr, yr, zr) {
            if (!sprite3d) {
                return;
            }
            if(!sprite3d.angleV3){
                sprite3d.angleV3 = new Laya.Vector3();
                sprite3d.radV3 = new Laya.Vector3();
            }
            sprite3d.angleV3.x = yr;
            sprite3d.angleV3.y = xr;
            sprite3d.angleV3.z = zr;
            let v3 = sprite3d.radV3;
            v3.x = yr * Math.RAD_1_ANGLE, v3.y = xr * Math.RAD_1_ANGLE, v3.z = zr * Math.RAD_1_ANGLE;
            var transform = sprite3d.transform;
            Laya.Quaternion.createFromYawPitchRoll(v3.x, v3.y, v3.z, transform._localRotation);
            transform.localRotation = transform._localRotation;
        };

        /**
         * 设置半透明
         * @param 透明值
         */
        setAlpha (sprite3d, alpha) {
            if (!sprite3d) return;
            if (sprite3d._alpha == alpha) {
                return;
            }
            this.setAlalbedo(sprite3d, alpha);
            this._alpha = alpha;
        };

        /**
         * 设置颜色叠加
         * @param node
         * @param w
         * @param x
         * @param y
         * @param z
         */
        setAlalbedo(sprite3d, w, x, y, z) {
            if (!sprite3d) return;
            var meshRender = sprite3d.meshRenderer || sprite3d.skinnedMeshRenderer;
            if (meshRender) {
                var materials = meshRender.materials;
                for (var n = materials.length - 1; n >= 0; n--) {
                    var material = materials[n];
                    if (material.cull == 0 && material.blend == 1 && material.srcBlend == 0x0302 && material.dstBlend == 1) {
                        continue;
                    }
                    if (w < 1) {
                        material.renderMode = Laya[material.constructor.name].RENDERMODE_TRANSPARENT;
                    }
                    (x === void 0) && (x = material.albedoColorR);
                    (y === void 0) && (y = material.albedoColorG);
                    (z === void 0) && (z = material.albedoColorB);
                    material.albedoColorA = w;
                    material.albedoColorR = x;
                    material.albedoColorG = y;
                    material.albedoColorB = z;
                }
            } else {
                for (var i = 0; i < sprite3d.numChildren; i++) {
                    var child = sprite3d.getChildAt(i);
                    this.setAlalbedo(child, w, x, y, z);
                }
            }
        };

        /**
         * 设置接收阴影
         */
        receiveShadow (sprite3d) {
            for (var i = 0; i < sprite3d.numChildren; i++) {
                var child = sprite3d.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    child.meshRender.receiveShadow = true;
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    child.skinnedMeshRender.receiveShadow = true;
                }
            }
        }

        /**
         * 设置阴影
         */
        showShashow (sprite3d, visible) {
            visible = visible == undefined ? true : visible;
            for (var i = 0; i < sprite3d.numChildren; i++) {
                var child = sprite3d.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    child.meshRender.castShadow = visible;
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    child.skinnedMeshRender.castShadow = visible;
                }
                if (child.numChildren > 0) {
                    this.showShashow(child, visible);
                }
            }
        }

        /**
         * 播放模型动作
         * @param animName
         * @param caller
         * @param callback
         * @param playbackRate  播放动作速率
         * @param crossTime  切换动作过度时间
         */
        playAnim (sprite3d, animName, caller, callback, playbackRate, crossTime, layer) {
            let avater = sprite3d.getChildAt(0);
            let animator = avater.getComponent(Laya.Animator);
            if(!layer){
                layer = 0;
            }
            if (animator) {
                if(crossTime){
                    animator.crossFade(animName, crossTime, layer);
                }else{
                    animator.play(animName, layer);
                }
                var ani = animator._controllerLayers[0]._statesMap[animName];
                if (!ani.script) {
                    ani.addScript(AnimatorStateScript);
                    ani.script = ani._scripts[0];
                }
                if (!playbackRate) {
                    playbackRate = 1;
                }
                ani.speed = playbackRate;
                if (callback) {
                    callback = callback.bind(caller);
                }
                ani.script.setComplete(callback);
                sprite3d.curAnim = animName;
                sprite3d.curAnimSpeed = playbackRate;
            } else {
                console.error(sprite3d,"动作控制器未加载！");
                if (callback)
                    callback.call(caller);
            }
        };

        /**
         * 停止动画
         */
        stopAnim (sprite3d, animName) {
            let avater = sprite3d.getChildAt(0);
            let animator = avater.getComponent(Laya.Animator);
            if(animator){
                if(!animName){
                    animName = sprite3d.curAnim;
                }
                if(animName){
                    var ani = animator._controllerLayers[0]._statesMap[animName];
                    ani.speed = 0;
                }
            }
        };

        /**
         * 清除动画
         */
        clearAnim (sprite3d){
            let avater = sprite3d.getChildAt(0);
            let animator = avater.getComponent(Laya.Animator);
            animator._controllerLayers[0]._statesMap = [];
        }

        //设置模型贴图
        setMaterialPic (sprite3D, picName) {
            if (!sprite3D || !picName) {
                return;
            }
            //为模型更换贴图
            if (sprite3D instanceof Laya.MeshSprite3D) {
                var render = sprite3D.meshRenderer;
            } else if (sprite3D instanceof Laya.SkinnedMeshSprite3D) {
                var render = sprite3D.skinnedMeshRenderer;
            }
            if (render) {
                if(!render.material){
                    //创建标准材质
                    var material = new Laya.BlinnPhongMaterial();
                    Laya.Texture2D.load(picName, Laya.Handler.create(this, function (texture) {
                        //设置反照率贴图
                        material.albedoTexture = texture;
                        //设置反照率强度
                        material.albedoIntensity = 1;
                    }));
                    render.material = material;
                }else{
                    Laya.Texture2D.load(picName, Laya.Handler.create(this, function (texture) {
                        if(render._owner != null)render.material.albedoTexture = texture;
                    }));
                }
            }

            for (var i = 0; i < sprite3D.numChildren; i++) {
                this.setMaterialPic(sprite3D._children[i], picName);
            }
        }

        /**
         * 添加网格碰撞器
         */
        addMeshCollider (sprite, colliders) {
            if(!colliders){
                sprite.colliders = [];
                colliders = sprite.colliders;
            }
            if (sprite.meshFilter) {
                var meshCollider = sprite.addComponent(Laya.PhysicsCollider);
                //创建网格碰撞器
                let meshShape = new Laya.MeshColliderShape();
                //获取模型的mesh
                meshShape.mesh = sprite.meshFilter.sharedMesh;
                //设置模型的碰撞形状
                meshCollider.colliderShape = meshShape;
                colliders.push(meshCollider);
            }
            var num = sprite.numChildren;
            for (var i = 0; i < num; i++) {
                this.addMeshCollider(sprite._children[i], colliders);
            }
        }

        static getIns() {
            if (!this._ins)
                this._ins = new ModelCfg();
            return this._ins;
        }
    }
    window.ModelCfg = ModelCfg;

    //障碍物脚本
    class ObstacleScript extends Laya.Script3D {

        constructor() {
            super();
            // 计时器
            this.count = 0;
            // 父节点
            this.parent = null;
            this.cd = 2;
        }

        onAwake() {
            this.up = false;
            this.down = false;
            this.left = false;
            this.right = false;
            this.speed = 1.6;

            this.initData();
        }

        initData() {
            if (this.owner.name == "shenSuoGan") {
                this.oldPosY1 = utils.getChildDeep(this.owner, "polySurface1").transform.localPositionY;
                this.oldPosY2 = utils.getChildDeep(this.owner, "polySurface2").transform.localPositionY;
                this.down = false;
            } else if (this.owner.name == "shengJiangMen") {
                this.oldPosY1 = utils.getChildDeep(this.owner, "pCube9").transform.localPositionY;
                this.oldPosY2 = utils.getChildDeep(this.owner, "pCube10").transform.localPositionY;
                this.down = true;
                this.left = true;
                this.cd = 0;
            } else if (this.owner.name == "fuFeiMen") {
                this.openIndex = 0;
            }
        }

        onUpdate() {
            var delta = G.FRAME_INTERVAL;
            if (this.owner.name == "shenSuoGan") {
                // 伸缩杆
                this.cd -= delta;
                if (this.cd <= 0) {
                    var polySurface1 = utils.getChildDeep(this.owner, "polySurface1");
                    var polySurface2 = utils.getChildDeep(this.owner, "polySurface2");
                    if (this.down) {
                        if (polySurface1.transform.localPositionY >= this.oldPosY1) {
                            polySurface1.transform.localPositionY -= delta * 0.5;
                            polySurface2.transform.localPositionY -= delta * 0.5;
                        } else {
                            polySurface1.transform.localPositionY = this.oldPosY1;
                            polySurface2.transform.localPositionY = this.oldPosY2;
                            this.cd = 1;
                            this.up = true;
                            this.down = false;
                        }
                    } else {
                        if (polySurface1.transform.localPositionY <= 0.30) {
                            polySurface1.transform.localPositionY += delta * 0.5;
                            polySurface2.transform.localPositionY += delta * 0.5;
                        } else {
                            this.cd = 1;
                            this.up = false;
                            this.down = true;
                        }
                    }
                }
            } else if (this.owner.name == "shengJiangMen") {
                // 升降门
                this.cd -= delta;
                if (this.cd <= 0) {
                    var pCube9 = utils.getChildDeep(this.owner, "pCube9");
                    var pCube10 = utils.getChildDeep(this.owner, "pCube10");
                    if (this.left) {
                        // 左
                        if (pCube9.transform.localPositionY >= 0.3 && this.down) {
                            pCube9.transform.localPositionY -= delta * 2;
                        } else {
                            this.down = false;
                            if (pCube9.transform.localPositionY < this.oldPosY1) {
                                pCube9.transform.localPositionY += delta * 2;
                            } else {
                                pCube9.transform.localPositionY = this.oldPosY1;
                                this.cd = 0.5;
                                this.left = false;
                                this.right = true;
                                this.down = true;
                            }
                        }
                    } else {
                        // 右
                        if (pCube10.transform.localPositionY >= 0.3 && this.down) {
                            pCube10.transform.localPositionY -= delta * 2;
                        } else {
                            this.down = false;
                            if (pCube10.transform.localPositionY < this.oldPosY2) {
                                pCube10.transform.localPositionY += delta * 2;
                            } else {
                                pCube10.transform.localPositionY = this.oldPosY2;
                                this.cd = 0.5;
                                this.left = true;
                                this.right = false;
                                this.down = true;
                            }
                        }
                    }
                }
            } else if (this.owner.name == "fuFeiMen") {
                if (this.openIndex != 0) {
                    if (this.openIndex == 1) {
                        var polySurface1 = utils.getChildDeep(this.owner, "polySurface3");
                        if (polySurface1.transform.localPositionY < 2)
                            polySurface1.transform.localPositionY -= delta * 10;
                    } else if (this.openIndex == 2) {
                        var polySurface1 = utils.getChildDeep(this.owner, "polySurface4");
                        if (polySurface1.transform.localPositionY < 2)
                            polySurface1.transform.localPositionY -= delta * 10;
                    } else if (this.openIndex == 3) {
                        var polySurface1 = utils.getChildDeep(this.owner, "polySurface1");
                        if (polySurface1.transform.localPositionY < 2)
                            polySurface1.transform.localPositionY -= delta * 10;
                    }
                }
                if (!utils.getChildDeep(this.owner, "Deceleration_30003").getComponent(Laya.PhysicsCollider).stop) {
                    var Deceleration = utils.getChildDeep(this.owner, "polySurface2225");
                    var material = Deceleration.meshRenderer.material;
                    if (this.count > 1) {
                        this.count = 0;
                    } else {
                        this.count += 0.01;
                    }
                    material.tilingOffsetW = this.count;
                }
            } else if (this.owner.name == "xuanZhuanGan") {
                // 旋转杆
                this.owner.transform.localRotationEulerY += delta * 50;
            } else if (this.owner.name == "xuanZhuanDuo") {
                // 旋转舵
                this.owner.transform.localRotationEulerY += delta * 50;
            } else if (this.owner.name == "baiQiu") {
                // 摆球
                this.owner.transform.localRotationEulerZ = Math.cos(Math.RAD_1_ANGLE * this.count) * 30;
                this.count -= delta * 100;
            } else if (this.owner.name == "pingYiGan") {
                // 平移杆  
                this.cd -= delta;
                if (this.cd <= 0) {
                    if (this.speed < 0.3) {
                        this.speed = 0.3;
                    } else {
                        this.speed -= delta;
                    }
                    var column = utils.getChildDeep(this.owner, "column_30002");
                    if (this.left) {
                        if (column.transform.localPositionX <= 0.6) {
                            column.transform.localPositionX += delta * this.speed;
                        } else {
                            this.cd = 3;
                            this.speed = 1.6;
                            this.right = true;
                            this.left = false;
                        }
                    } else {
                        if (column.transform.localPositionX >= -0.6) {
                            column.transform.localPositionX -= delta * this.speed;
                        } else {
                            this.cd = 3;
                            this.speed = 1.6;
                            this.right = false;
                            this.left = true;
                        }
                    }
                }
            } else if (this.owner.name == "jianSuDai") { }
        }

        onEnable() {
        }

        onDisable() {
        }

    }

    //宠物普通脚本（非战斗） 
    class RoleScript extends Laya.Script3D {
        constructor() {
            super();

            // 速度
            this.speed = 2.5;

            // 跑
            this.run = false;
            // 跑音效cd
            this.runSoundCD = 0;

            // 行走速度
            this.runSpeed = 1.5;
            // 跳跃固定距离Z
            this.jumpLength = 3;

            // 跳
            this.jump = false;
            // 跳跃中
            this.jumping = false;
            // 结束跳跃
            this.jumpEnd = false;
            // 跳跃延迟
            this.jumpCD = 0;
            // 角色跳跃起始位置
            this.roleInitPos = new Vector3();

            // 减速
            this.shiftDown = false;
            // 减速cd
            this.shiftDownCD = 0;
            // 减速值
            this.shiftDownVal = 0.7;

            // 加速
            this.shiftUp = false;
            // 加速值
            this.shiftUpVal = 0.75;

            // 死亡
            this.die = false;

            // 播放摔倒
            this.playerTumnle = false;
            // 摔倒cd
            this.tumnleCD = 0;

            // 开门
            this.openMen = false;

            // 减速带
            this.jianSuDai = false;
            // 减速左右偏移值
            this.jianSuMoveVal = null;

            // 弧度模型集合
            this.ballModelArr = null;
            // 弧度坐标集合
            this.huduPosArr = [];
            // 弧度最高点
            this.huduMaxHeight = 0;
            // 弧度的终点
            this.huduEndPos = new Laya.Vector3();
            // 跳跃X轴偏移量
            this.huduX = 0;

            // 呼啦圈
            this.hulaArr = [];
            // 移动的呼啦圈
            this.moveHulaArr = [];
            // 呼啦cd
            this.hulaCD = false;
            // 当前呼啦圈颜色
            this.curHulaColor = "red";
            // 呼啦圈模型位置
            this.hulaModelPos = [];
            // 掉落呼啦圈
            this.downHulaArr = [];
            // 扣除呼啦圈
            this.del = false;
            // 扣除呼啦圈cd
            this.delCD = 0;
            this.delCount = 1;
        }

        /*
         * 创建后只执行,只会执行一次，此时所有节点和组件以及创建完毕
         */
        onAwake() {
            this.initData();
            this.owner.script = this;
            this.battle_js = G.Main.box_scene.script;
            this.loadRole();
            G.test = this;

            ModelCfg.getIns().getModelById(30007, function (model) {
                this.hulaBK = model;
            }.bind(this));

            this.parcloseEffect();

            // 拾取cd
            this.gatherCD = 1;
            // 拾取序号
            this.gatherIndex = 7;
        }

        loadRole() {
            this.updateRoleModel();
            this.updateDanceModel();
        }

        /**
         * 更新模型
         */
        updateRoleModel() {
            if (this.walkModel) {
                this.walkModel.destroy();
                this.walkModel = null;
            }
            ModelCfg.getIns().getModelById(10001, function (model) {
                this.owner.addChild(model);
                for (let i = 1; i <= 30; i++) {
                    let num = i < 10 ? "00" + i : "0" + i;
                    let hulaNode = utils.getChildDeep(model, "hulaquan_" + num);
                    hulaNode.active = i == 1;
                    // 呼啦圈
                    ModelCfg.getIns().getModelById(10000, function (hulaModel) {
                        hulaNode.addChild(hulaModel);
                        ModelCfg.getIns().setMaterialPic(hulaModel, "res/texture/" + this.curHulaColor + ".png");
                    }.bind(this));
                }
                // 背饰
                var tryoutData = D.roleConfig[PlayerData.getIns().tryoutSkin];
                var backNode = utils.getChildDeep(model, "Bip001 Spine2");
                if (tryoutData && tryoutData.type == 1) {
                    ModelCfg.getIns().getModelById(tryoutData.modelid, function (m) {
                        backNode.addChild(m);
                    });
                } else {
                    if (PlayerData.getIns().curBackDecoration) {
                        ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curBackDecoration].modelid, function (m) {
                            backNode.addChild(m);
                        });
                    }
                }
                // 头饰
                var headNode = utils.getChildDeep(model, "Bip001 Head");
                if (tryoutData && tryoutData.type == 2) {
                    ModelCfg.getIns().getModelById(tryoutData.modelid, function (m) {
                        headNode.addChild(m);
                    });
                } else {
                    if (PlayerData.getIns().curHeadDecoration) {
                        ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curHeadDecoration].modelid, function (m) {
                            headNode.addChild(m);
                        });
                    }
                }
                this.walkModel = model;
                this.curModel = this.walkModel;
                this.playAni("idle", null, true);
            }.bind(this));
        }

        /**
         * 更新跳舞模型
         */
        updateDanceModel() {
            if (this.danceModel) {
                this.danceModel.destroy();
                this.danceModel = null;
            }
            ModelCfg.getIns().getModelById(10002, function (model) {
                this.owner.addChild(model);
                this.danceModel = model;
                this.danceModel.active = false;
                // 呼啦圈
                let hulaNode = utils.getChildDeep(model, "hulaquan_001");
                ModelCfg.getIns().setMaterialPic(hulaNode, "res/texture/" + this.curHulaColor + ".png");
                // 背饰
                var tryoutData = D.roleConfig[PlayerData.getIns().tryoutSkin];
                var backNode = utils.getChildDeep(model, "Bip001 Spine2");
                if (tryoutData && tryoutData.type == 1) {
                    ModelCfg.getIns().getModelById(tryoutData.modelid, function (m) {
                        backNode.addChild(m);
                    });
                } else {
                    if (PlayerData.getIns().curBackDecoration) {
                        ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curBackDecoration].modelid, function (m) {
                            backNode.addChild(m);
                        });
                    }
                }
                // 头饰
                var headNode = utils.getChildDeep(model, "Bip001 Head");
                if (tryoutData && tryoutData.type == 2) {
                    ModelCfg.getIns().getModelById(tryoutData.modelid, function (m) {
                        headNode.addChild(m);
                    });
                } else {
                    if (PlayerData.getIns().curHeadDecoration) {
                        ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curHeadDecoration].modelid, function (m) {
                            headNode.addChild(m);
                        });
                    }
                }
                G.COMPLETELOAD = true;
            }.bind(this));
        }


        //增加呼啦圈
        addHula(num) {
            console.log(1);
            this.addHulaHint();
            audioManager.playSound(this.hulaCnt >= 20 ? 9 : this.hulaCnt >= 10 ? 8 : 7, null, true);
            // 反馈身上呼啦圈数量 
            if (this.hulaCnt == 10) {
                audioManager.playSound(10);
                this.bestirHint(10);
            } else if (this.hulaCnt == 20) {
                audioManager.playSound(11);
                this.bestirHint(20);
            } else if (this.hulaCnt == 30) {
                audioManager.playSound(12);
                this.bestirHint(30);
            }
            if (this.hulaCnt > 30) return;
            this.shiftUp = true;
            num = num || 1;
            this.hulaCnt += num;
            for (let i = 1; i <= 30; i++) {
                let num = i < 10 ? "00" + i : "0" + i;
                if (i <= this.hulaCnt) {
                    var node = utils.getChildDeep(this.walkModel, "hulaquan_" + num);
                    node.active = true;
                    ModelCfg.getIns().setMaterialPic(node, "res/texture/" + this.curHulaColor + ".png");
                } else {
                    utils.getChildDeep(this.walkModel, "hulaquan_" + num).active = false;
                }
            }
            this.playRun();
            PlayerData.getIns().setTaskConfig(2006, 1, false);
        }

        //扣掉呼啦圈
        delHula(num) {
            if (!this.shiftDown) {
                this.shiftUp = false;
            }
            if (this.hulaCnt <= 0) return;
            this.hulaCnt -= num;
            for (let i = 1; i <= 30; i++) {
                let num = i < 10 ? "00" + i : "0" + i;
                if (i <= this.hulaCnt) {
                    utils.getChildDeep(this.walkModel, "hulaquan_" + num).active = true;
                } else {
                    utils.getChildDeep(this.walkModel, "hulaquan_" + num).active = false;
                }
            }
            this.playRun();
        }

        //开始跑
        startRun() {
            this.run = true;
            this.jump = false;
            this.curModel = this.walkModel;
            if (this.hulaCnt) {
                var colorArr = ["res/texture/red.png", "res/texture/yellow.png", "res/texture/blue.png", "res/texture/green.png"];
                for (let i = 1; i <= 30; i++) {
                    let num = i < 10 ? "00" + i : "0" + i;
                    if (this.walkModel) {
                        if (i <= this.hulaCnt) {
                            var node = utils.getChildDeep(this.walkModel, "hulaquan_" + num);
                            node.active = true;
                            if (this.curHulaColor == "colour") {
                                ModelCfg.getIns().setMaterialPic(node, colorArr[i % 4]);
                            } else {
                                ModelCfg.getIns().setMaterialPic(node, "res/texture/" + this.curHulaColor + ".png");
                            }
                        } else {
                            utils.getChildDeep(this.walkModel, "hulaquan_" + num).active = false;
                        }
                    }
                }
            }
            this.playRun();
        }

        playRun() {
            if (this.hulaCnt > 11) {
                if (this.curAnim != "walk02") {
                    this.playAni("walk02", null, true, 1.3, 0.1);
                }
            } else {
                if (this.curAnim != "walk01") {
                    this.playAni("walk01", null, true, 1.3, 0.1);
                }
            }
        }

        //摔倒
        doTumble() {
            this.curModel = this.walkModel;
            this.playAni("tumble", function () {
                this.delHula(0);
            }.bind(this), false, 0.9, 0.2);
        }

        //切换跳跃模式
        startJump() {
            this.run = false;
            this.jump = true;
            this.jumpCD = 0.7;
            this.showBallLine(true);
            this.curModel = this.walkModel;
            this.playAni("jump", null, true, 1, 0.1);
            for (let i = 1; i <= 30; i++) {
                let num = i < 10 ? "00" + i : "0" + i;
                utils.getChildDeep(this.walkModel, "hulaquan_" + num).active = false;
            }
            for (let i = this.hulaArr.length - 1; i >= 0; i--) {
                this.moveHulaArr.push(this.hulaArr[i]);
            }
        }

        //切换舞蹈模式
        startDance() {
            this.walkModel.active = false;
            this.danceModel.active = true;
            this.curModel = this.danceModel;
            this.playAni("dance001", function () {
                this.playAni("dance002", function () {
                    this.playAni("dance003", null, true, 1, 0.1);
                }.bind(this), false, 1, 0.1);
            }.bind(this), false, 1, 0.1);
        }

        /**
         * 切换摔倒
         */
        startTumble(num) {
            // if (this.playerTumnle) return;
            var self = this;
            this.playerTumnle = true;
            this.shiftDownCD = 0.8;
            this.shiftDown = true;
            this.tumnleCD = 0.8;
            this.runSoundCD = 0.8;
            for (var i = 0; i < num; i++) {
                updateManager.timeOnce(i * 0.1, this, this.createDownHula);
            }
            this.playAni("tumble", function () {
                if (!self.jump) {
                    self.startRun();
                }
            }, false, 0.7, 0.1);
        }

        initData() {
            this.hulaCnt = 1;
        }

        /**
         * 开始碰撞时执行
         */
        onCollisionEnter(collision) { }

        /**
         * 持续碰撞时执行
         */
        onCollisionStay(collision) { }

        /**
         * 结束碰撞时执行
         */
        onCollisionExit(collision) { }

        onTriggerEnter(other) {
            if (other.owner.name == "floor_10003" || !battleMgr.isGameStart) return;
            // console.log("RoleScript_____触发器__开始", other);
            if (other.modelName && other.modelName.indexOf("fuFeiMen") != -1) {
                audioManager.playSound(13);
                this.die = true;
            } else if (other.owner.name && other.owner.name.indexOf("men") != -1) {
                var index = other.owner.name.split("_")[1];
                var parentNode = other.owner.parent.parent.parent;
                // 序号开门
                if (parentNode.name == "fuFeiMen") {
                    this.openMen = true;
                    var price = utils.getChildDeep(parentNode, "price_" + index);
                    var num = price.num;
                    var count = 0;
                    // 减速带门
                    if (index == 1) {
                        this.jianSuMoveVal = -0.65;
                        if (this.owner.transform.localPositionX > this.jianSuMoveVal) {
                            this.direction = "left";
                        } else {
                            this.direction = "right";
                        }
                    } else if (index == 2) {
                        this.jianSuMoveVal = 0;
                        if (this.owner.transform.localPositionX > this.jianSuMoveVal) {
                            this.direction = "left";
                        } else {
                            this.direction = "right";
                        }
                    } else if (index == 3) {
                        this.jianSuMoveVal = 0.65;
                        if (this.owner.transform.localPositionX > this.jianSuMoveVal) {
                            this.direction = "left";
                        } else {
                            this.direction = "right";
                        }
                    }
                    // 判断呼啦圈是否充足
                    for (let i = 0; i < num; i++) {
                        updateManager.timeOnce(i / num, this, function () {
                            if (this.hulaCnt > 0) {
                                this.delHula(1);
                                this.fuFeiMenDelHula();
                                ModelCfg.getIns().setMaterialPic(price, "res/texture/shuz_" + (num - (i + 1)) + ".png");
                                count++;
                            }
                            if (count == num) {
                                // 开门
                                parentNode._scripts[0].openIndex = index;
                                other.owner.parent.getComponent(Laya.PhysicsCollider).stop = true;
                                this.shiftDown = false;
                                this.jianSuDai = false;
                                this.startRun();
                            }
                        });
                    }
                }
            } else if (other.modelName == "zhongDian") {
                audioManager.stopMusic(G.BGMUSICINDEX);
                audioManager.stopSound(21);
                audioManager.playSound(15);
                // 不让滑动屏幕 
                var index = 0;
                this.shiftUpVal = 0;
                this.runSpeed = (this.hulaCnt < 10 ? 1 : this.hulaCnt < 15 ? 0.9 : this.hulaCnt < 20 ? 0.8 : this.hulaCnt < 25 ? 0.7 : this.hulaCnt < 30 ? 0.6 : this.hulaCnt < 35 ? 0.5 : this.hulaCnt < 40 ? 0.4 : this.hulaCnt < 45 ? 0.3 : this.hulaCnt < 50 ? 0.2 : 0.2);
                if (this.hulaCnt > 1) {
                    this.del = true;
                } else {
                    battleMgr.todoEnd = true;
                    this.startDance();
                    this.walkModel.active = false;
                    G.BattleScript && (G.BattleScript.role_character.getComponent(Laya.CharacterController).fallSpeed = 0);
                    ModelCfg.getIns().setMaterialPic(utils.getChildDeep(this.danceModel, "hulaquan_001"), "res/texture/" + this.curHulaColor + ".png");
                }
                this.colourBarEffect();
            } else if (other.modelName == "huLaQuan_red") {
                // 呼啦圈 红
                if (this.curHulaColor == "red") {
                    this.shiftDown = false;
                    this.addHula(1);
                } else if (this.hulaCnt > 1) {
                    audioManager.playSound(20, null, true);
                    this.delHula(1);
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                    this.runSoundCD = 0.5;
                } else {
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                }
                other.owner.active = false;
            } else if (other.modelName == "huLaQuan_yellow") {
                // 呼啦圈 黄
                if (this.curHulaColor == "yellow") {
                    this.shiftDown = false;
                    this.addHula(1);
                } else if (this.hulaCnt > 1) {
                    audioManager.playSound(20, null, true);
                    this.delHula(1);
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                    this.runSoundCD = 0.5;
                } else {
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                }
                other.owner.active = false;
            } else if (other.modelName == "huLaQuan_green") {
                // 呼啦圈 蓝
                if (this.curHulaColor == "green") {
                    this.shiftDown = false;
                    this.addHula(1);
                } else if (this.hulaCnt > 1) {
                    audioManager.playSound(20, null, true);
                    this.delHula(1);
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                    this.runSoundCD = 0.5;
                } else {
                    this.shiftDownCD = 1.5;
                    this.shiftDown = true;
                }
                other.owner.active = false;
            } else if (other.modelName == "bianSePingZhang_red") {
                // 红色屏障
                audioManager.playSound(17);
                this.curHulaColor = "red";
                this.parcloseEffect();
                this.updateHulaColor();
                other.owner.active = false;
            } else if (other.modelName == "bianSePingZhang_yellow") {
                // 黄色屏障
                audioManager.playSound(17);
                this.curHulaColor = "yellow";
                this.parcloseEffect();
                this.updateHulaColor();
                other.owner.active = false;
            } else if (other.modelName == "bianSePingZhang_green") {
                // 蓝色屏障
                audioManager.playSound(17);
                this.curHulaColor = "green";
                this.parcloseEffect();
                this.updateHulaColor();
                other.owner.active = false;
            } else if (other.modelName == "bianSePingZhang_colour") {
                // 彩色屏障 
                audioManager.playSound(17);
                this.curHulaColor = "colour";
                this.parcloseEffect();
                this.jumpEnd = false;
                this.upJump = true;
                G.BattleScript && G.BattleScript.setGravity(0);
                this.crateHula(this.hulaCnt);
                this.startJump();
                this.crateJumpRadian();
                this.updateHulaColor();
                this.roleInitPos.x = this.owner.transform.position.x;
                this.roleInitPos.y = this.owner.transform.position.y;
                this.roleInitPos.z = this.owner.transform.position.z;
                other.owner.active = false;
            } else if (other.modelName == "yaunXingPingTai") {
                // console.log("圆形平台");
            } else if (other.modelName == "jianSuDai") {
                this.shiftDownVal = 0.45;
                this.shiftDown = true;
                this.jianSuDai = true;
            } else if (other.modelName == "shenSuoGan" || other.modelName == "ganZi" || other.modelName == "xuanZhuanGan" || other.modelName == "xuanZhuanDuo" || other.modelName == "pingYiGan" || other.modelName == "shengJiangMen") {
                // 伸缩杆  /  杆子  /  旋转杆  /  旋转舵  /  升降门 
                if (this.playerTumnle) return;
                audioManager.playSound(13, null, true);
                if (this.hulaCnt - 3 <= 0) {
                    var num = this.hulaCnt;
                    this.delHula(num);
                    this.startTumble(num);
                    this.die = true;
                } else {
                    this.delHula(3);
                    this.startTumble(3);
                }
            } else if (other.modelName == "baiQiu") {
                // 摆球 
                if (this.playerTumnle) return;
                audioManager.playSound(13, null, true);
                if (this.hulaCnt - 5 <= 0) {
                    var num = this.hulaCnt;
                    this.delHula(num);
                    this.startTumble(num);
                    this.die = true;
                } else {
                    this.delHula(3);
                    this.startTumble(3);
                }
            } else if (other.modelName == "zuanShi") {
                audioManager.playSound(16, null, true);
                PlayerData.getIns().addDiamond(1);
                other.owner.active = false;
                eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_DIAMOND);
                PlayerData.getIns().setTaskConfig(2001, 1, false);
                // 钻石特效
                this.diamEffect();
            } else if (other.modelName == "zuanShis") {
                audioManager.playSound(16, null, true);
                PlayerData.getIns().addDiamond(3);
                other.owner.active = false;
                eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_DIAMOND);
                // 钻石特效
                PlayerData.getIns().setTaskConfig(2001, 3, false);
                this.diamEffect();
            }
        }

        onTriggerStay(other) {
            if (other.owner.name == "floor_10003" || !battleMgr.isGameStart) return;
            if (other.owner.name == "jump_end") {
                // 结束跳跃
                this.jumpEnd = true;
                this.walkModel.transform.localRotationEulerX = 0;
            }
        }

        onTriggerExit(other) {
            if (other.owner.name == "floor_10003" || !battleMgr.isGameStart) return;
            var self = this;
            if (other.modelName == "jianSuDai") {
                this.openMen = false;
                this.shiftDownVal = 0.7;
            }
        }

        /**
         * 脚本每次启动后执行，例如被添加到一个激活的对象上或者设置脚本的enabled = true
         */
        onEnable() {
        }

        /**
         * 第一次执行update之前执行，只会执行一次
         */
        onStart() {

        }

        /**
         * 每帧更新时执行
         */
        onUpdate() {
            let delta = G.FRAME_INTERVAL;
            // 音乐cd
            this.gatherCD -= delta;
            // 减速cd
            if (!this.jianSuDai) {
                this.shiftDownCD -= delta;
                if (this.shiftDownCD <= 0) {
                    if (this.shiftDown) {
                        this.shiftDown = false;
                    }
                }
            }
            // 摔倒
            if (this.playerTumnle) {
                this.tumnleCD -= delta;
                if (this.tumnleCD <= 0) {
                    this.playerTumnle = false;
                }
            }
            // 呼啦CD
            this.hulaCD -= delta;
            // 扣除呼啦圈cd
            this.delCD -= delta;
            // 跑音效cd
            this.runSoundCD -= delta;
            // 角色死亡
            if (this.die || this.owner.transform.localPositionY < -1) {
                battleMgr.endGame(false);
            }
            // 终点移动
            if (!battleMgr.isGameStart || this.die) return;
            G.Main.updateRound(this.owner.transform.localPositionZ);
            if (this.jump) {
                this.jumpStep(delta);
                this.battle_js.camera.transform.localPositionZ = this.owner.transform.localPositionZ + 3;
            } else if (this.run) {
                // 跑 
                if (this.runSoundCD <= 0 && !battleMgr.todoEnd) {
                    this.runSoundCD = 0.1;
                    audioManager.playSound(21);
                }
                // 到达扣除呼啦圈
                if (this.del) {
                    if (this.delCD <= 0) {
                        // this.delCD = (this.hulaCnt < 20 ? 0.05 : 0.01);
                        this.delCD = 0.025;
                        this.delCount++;
                        if (this.delCount <= this.hulaCnt) {
                            this.createUpHula(this.delCount, function () {
                                battleMgr.todoEnd = true;
                                this.startDance();
                                this.walkModel.active = false;
                                G.BattleScript && (G.BattleScript.role_character.getComponent(Laya.CharacterController).fallSpeed = 0);
                                ModelCfg.getIns().setMaterialPic(utils.getChildDeep(this.danceModel, "hulaquan_001"), "res/texture/" + this.curHulaColor + ".png");
                            }.bind(this));
                        }
                    }
                }
                // 到达终点
                if (battleMgr.todoEnd) {
                    // 矫正x轴到0点
                    if (this.owner.transform.localPositionX.toFixed(1) != "0.0") {
                        if (this.owner.transform.localPositionX > 0) {
                            this.owner.transform.localPositionX -= delta;
                        } else if (this.owner.transform.localPositionX < 0) {
                            this.owner.transform.localPositionX += delta;
                        }
                    }
                    if (this.owner.transform.localPositionZ > battleMgr.endColumnPos.z) {
                        // this.owner.transform.localPositionZ -= (delta * 0.55);
                        // this.owner.transform.localPositionZ -= delta * (this.hulaCnt < 15 ? 0.6 : 0.55);
                        this.owner.transform.localPositionZ -= delta * 0.55;
                        // this.battle_js.camera.transform.localPositionZ = this.owner.transform.localPositionZ + 3;
                    } else {
                        // 到达圆柱中心点
                        if (battleMgr.endColumnModel) {
                            if (battleMgr.endColumnModel.transform.localPositionY < 0.5) {
                                // 升起圆柱  移动视角
                                battleMgr.endColumnModel.transform.localPositionY += delta;
                                this.owner.transform.localPositionY += delta;
                                // this.battle_js.camera.transform.localPositionY = this.owner.transform.localPositionY + 2;
                            } else {
                                if (this.battle_js.camera.transform.localPositionZ >= battleMgr.endColumnPos.z + 2) {
                                    this.battle_js.camera.transform.localPositionZ -= delta;
                                } else {
                                    battleMgr.endGame(true);
                                }
                            }
                        }
                    }
                } else if (this.shiftDown) {
                    // 减速
                    this.owner.transform.localPositionZ -= delta * this.shiftDownVal;
                    this.battle_js.camera.transform.localPositionZ = this.owner.transform.localPositionZ + 3;
                    if (this.jianSuMoveVal != null) {
                        if (this.direction == "left") {
                            if ((this.owner.transform.localPositionX - this.jianSuMoveVal).toFixed(2) >= 0.00) {
                                this.owner.transform.localPositionX -= delta;
                            } else {
                                this.jianSuMoveVal = null;
                            }
                        } else if (this.direction == "right") {
                            if ((this.owner.transform.localPositionX - this.jianSuMoveVal).toFixed(2) <= 0.00) {
                                this.owner.transform.localPositionX += delta;
                            } else {
                                this.jianSuMoveVal = null;
                            }
                        }
                    }
                } else if (this.shiftUp) {
                    // 加速
                    this.owner.transform.localPositionZ -= delta * (this.runSpeed + this.shiftUpVal);
                    this.battle_js.camera.transform.localPositionZ = this.owner.transform.localPositionZ + 3;
                } else {
                    this.owner.transform.localPositionZ -= delta * this.runSpeed;
                    this.battle_js.camera.transform.localPositionZ = this.owner.transform.localPositionZ + 3;
                }
            }
        }

        jumpStep(delta) {
            if (this.jumpCD > 0) {
                this.jumpCD -= delta;
            } else if (this.jumpCD < 0) {
                //起跳准备
                this.jumping = true;
                this.jumpTime = 0;
                this.jumpSpeedZ = 6;
                this.jumpCD = 0;
                this.curRot = this.curModel.transform.localRotationEulerX;
                this.owner.transform.lookAt(this.huduEndPos, new Laya.Vector3(0, 1, 0));
                this.showBallLine(false);
                this.owner.transform.position = this.roleInitPos;
                G.BattleScript && G.BattleScript.setGravity(0);
                this.roleJumpComplete = false;
                //移动呼啦圈
                this.jumpHula();
            }
            if (this.jumping) {
                //进行跳跃
                let complete = true;
                if (!this.roleJumpComplete) {
                    complete = false;
                    this.jumpTime += delta;
                    var z = this.roleInitPos.z - this.jumpTime * this.jumpSpeedZ;
                    var y = this.linea * z * z + this.lineb * z + this.linec;
                    let x = this.roleInitPos.x + this.huduX * (this.jumpTime * this.jumpSpeedZ / this.jumpLength);
                    var r = this.curRot - 180 * (this.jumpTime * this.jumpSpeedZ / this.jumpLength);
                    if (z < this.roleInitPos.z - this.jumpLength) {
                        //跳跃结束
                        z = this.roleInitPos.z - this.jumpLength;
                        r = this.curRot - 180;
                        this.roleJumpComplete = true;
                        this.roleInitPos.x = this.owner.transform.position.x;
                        this.roleInitPos.y = this.owner.transform.position.y;
                        this.roleInitPos.z = z;
                        G.BattleScript && G.BattleScript.setGravity(55);
                        this.owner.transform.localRotationEulerX = 0;
                    }
                    if (y < this.roleInitPos.y) {
                        y = this.roleInitPos.y;
                    }
                    if (r < this.curRot - 180) {
                        r = this.curRot - 180;
                    }
                    var pos = this.owner.transform.position;
                    pos.z = z;
                    pos.y = y;
                    pos.x = x;
                    if (this.roleJumpComplete) {
                        this.roleInitPos.x = x;
                        this.roleInitPos.y = y;
                        this.roleInitPos.z = z;
                    }
                    this.owner.transform.position = pos;
                    this.curModel.transform.localRotationEulerX = r;
                }
                for (let i = 0; i < this.moveHulaArr.length; i++) {
                    let hula = this.moveHulaArr[i];
                    if (!hula.jumpComplete) {
                        complete = false;
                        hula.jumpTime += delta;
                        if (hula.jumpTime > 0) {
                            let hz = hula.initPos.z - hula.jumpTime * hula.jumpSpeedZ;
                            let hx = hula.initPos.x + this.huduX * (hula.jumpTime * hula.jumpSpeedZ / this.jumpLength);
                            let hr = hula.curRot - 180 * (hula.jumpTime * hula.jumpSpeedZ / this.jumpLength);
                            if (hz < hula.initPos.z - this.jumpLength) {
                                //跳跃结束
                                hz = hula.initPos.z - this.jumpLength;
                                hx = hula.initPos.x + this.huduX;
                                hr = hula.curRot - 180;
                                hula.jumpComplete = true;
                            }
                            let hy = hula.linea * hz * hz + hula.lineb * hz + hula.linec;
                            if (hr < hula.curRot - 180) {
                                hr = hula.curRot - 180;
                            }
                            let hpos = hula.transform.position;
                            hpos.z = hz;
                            hpos.y = hy;
                            hpos.x = hx;
                            hula.transform.position = hpos;
                            hula.transform.localRotationEulerX = hr;
                        }
                    }
                }
                if (complete) {
                    this.jumping = false;
                    if (this.jumpEnd) {
                        this.clearHudu();
                        this.startRun();
                        this.clearAllHula();
                    } else {
                        this.jumpCD = 0.7;
                        this.huduX = 0;
                        this.showBallLine(true);
                    }
                }
            }
        }

        //跳跃呼啦圈移动
        jumpHula() {
            if (this.moveHulaArr.length > 5) {
                var temp = 0.5 / this.moveHulaArr.length;
            } else {
                var temp = 0.1;
            }
            for (let i = 0; i < this.moveHulaArr.length; i++) {
                let hula = this.moveHulaArr[i];
                hula.jumpComplete = false;
                hula.jumpTime = -i * temp;
                hula.jumpSpeedZ = 6;
                hula.curRot = hula.transform.localRotationEulerX;
                hula.initPos = new Laya.Vector3();
                hula.initPos.x = hula.transform.position.x;
                hula.initPos.y = hula.transform.position.y;
                hula.initPos.z = hula.transform.position.z;
                let x1 = hula.transform.localPositionZ;//start z
                let y1 = 0;//start y
                let x2 = x1 - this.jumpLength; //end z
                let y2 = i * 0.01;
                let x3 = x1 - this.jumpLength / 2;
                let y3 = y1 + 1.4;

                hula.lineb = (y3 - y1 + y1 * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1) - y2 * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1)) / ((x3 - x1) - ((x2 - x1) * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1)));
                hula.linea = (y2 - (x2 - x1) * hula.lineb - y1) / (x2 * x2 - x1 * x1);
                hula.linec = y1 - hula.linea * x1 * x1 - hula.lineb * x1;
            }
        }

        /**
         * 每帧更新时执行，在update之后执行
         */
        onLateUpdate() {

        }

        /**
         * 禁用时执行
         */
        onDisable() {
        }

        //播放动画
        playAni(animName, callback, loop, playbackRate, crossTime) {
            if (!this.curModel) return;
            let sprite3d = this.curModel.getChildAt(0);
            let animator = sprite3d.getComponent(Laya.Animator);
            if (animator) {
                if (crossTime) {
                    animator.crossFade(animName, crossTime, 0, 0);
                } else {
                    animator.play(animName, 0, 0);
                }
                var ani = animator._controllerLayers[0]._statesMap[animName];
                if (!ani.script) {
                    ani.addScript(AnimatorStateScript);
                    ani.script = ani._scripts[0];
                    ani.script.loop = loop || ani._clip.islooping;
                    ani.script.animator = animator;
                    ani.script.animName = animName;
                }
                if (!playbackRate) {
                    playbackRate = 1;
                }
                ani.speed = playbackRate;
                ani.script.setComplete(callback);
                this.curAnim = animator.curAnim = animName;
            } else {
                console.error(this.owner, "动作控制器未加载！");
            }
        }

        /**
         * 停止动画
         */
        stopAnim(animName) {
            let avater = this.owner.getChildAt(0);
            let animator = avater.getComponent(Laya.Animator);
            if (animator) {
                if (!animName) {
                    animName = this.owner.curAnim;
                }
                if (animName) {
                    var ani = animator._controllerLayers[0]._statesMap[animName];
                    ani.speed = 0;
                }
            }
        };

        /**
         * 创建跳跃弧度
         */
        crateJumpRadian(rest) {
            var x1 = this.owner.transform.localPositionZ;//start z
            var y1 = 0;//start y
            var x2 = x1 - this.jumpLength; //end z
            var y2 = 0;
            var x3 = x1 - 1.5;
            var y3 = y1 + 1.4;
            this.sdd(x1, x2, x3, y1, y2, y3);
            var cnt = parseInt((x1 - x2) / 0.1);
            var x, y, z;
            if (!this.ballModelArr) {
                this.ballModelArr = [];
                for (let i = 0; i < cnt; i++) {
                    x = this.owner.transform.localPositionX + i * this.huduX / cnt;
                    z = x1 - i * 0.1 - 0.2;
                    y = this.linea * z * z + this.lineb * z + this.linec;
                    let sphere = G.BattleScript.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.03, 20, 20)));
                    sphere.transform.localPositionX = x;
                    sphere.transform.localPositionY = y;
                    sphere.transform.localPositionZ = z;
                    this.ballModelArr.push(sphere);
                }
            } else {
                for (let i = 0; i < this.ballModelArr.length; i++) {
                    let sphere = this.ballModelArr[i];
                    x = this.owner.transform.localPositionX + i * this.huduX / cnt;
                    z = x1 - i * 0.1 - 0.2;
                    y = this.linea * z * z + this.lineb * z + this.linec;
                    sphere.transform.localPositionX = x;
                    sphere.transform.localPositionY = y;
                    sphere.transform.localPositionZ = z;
                }
            }
            this.huduEndPos.x = x;
            this.huduEndPos.y = y;
            this.huduEndPos.z = z;
        }

        //设置弧度模型显隐
        showBallLine(isShow) {
            if (this.ballModelArr) {
                for (var i = 0; i < this.ballModelArr.length; i++) {
                    let sphere = this.ballModelArr[i];
                    sphere.active = isShow;
                }
            }
            if (isShow) {
                this.crateJumpRadian();
            }
        }

        /**
         * 清除弧度
         */
        clearHudu() {
            for (var i = 0; i < this.ballModelArr.length; i++) {
                this.ballModelArr[i].destroy();
            }
            this.ballModelArr = [];
            this.huduPosArr = [];
            this.huduMaxHeight = 0;
        }

        /**
         *  获取弧度最高点
         */
        getHuduHeight() {
            var max = 0;
            for (var i = 0; i < this.huduPosArr.length; i++) {
                if (this.huduPosArr[i].y > max) {
                    max = this.huduPosArr[i].y;
                }
            }
            return max;
        }

        //计算抛物线
        sdd(x1, x2, x3, y1, y2, y3) {
            this.lineb = (y3 - y1 + y1 * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1) - y2 * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1)) / ((x3 - x1) - ((x2 - x1) * (x3 * x3 - x1 * x1) / (x2 * x2 - x1 * x1)));
            this.linea = (y2 - (x2 - x1) * this.lineb - y1) / (x2 * x2 - x1 * x1);
            this.linec = y1 - this.linea * x1 * x1 - this.lineb * x1;
        };

        /**
         * 创建呼啦圈
         */
        crateHula(num) {
            var self = this;
            if (this.hulaArr.length > 0) {
                this.clearAllHula();
            }
            for (let i = 0; i < num; i++) {
                let model = this.hulaBK.clone();
                G.BattleScript.newScene.addChild(model);
                model.modelName = "hula_" + i;
                model.timeDelay = 0.8;
                ModelCfg.getIns().setLocalPosition(model, self.owner.transform.localPositionX, i * 0.02, self.owner.transform.localPositionZ);
                self.hulaModelPos.push({
                    x: self.owner.transform.localPositionX,
                    y: i * 0.02,
                    z: self.owner.transform.localPositionZ
                });
                self.hulaArr.push(model);
            }
        }

        /**
         *清除呼啦圈
         */
        clearAllHula() {
            for (var i = 0; i < this.hulaArr.length; i++) {
                this.hulaArr[i].active = false;
            }
            this.hulaArr = [];
            this.hulaModelPos = [];
        }

        /**
         * 更新呼啦圈颜色
         */
        updateHulaColor() {
            if (this.curHulaColor == "red") {
                // console.log("变红");
                for (var i = 1; i <= 30; i++) {
                    var num = i < 10 ? "00" + i : "0" + i;
                    var node = utils.getChildDeep(this.walkModel, "hulaquan_" + num);
                    if (node.active) {
                        ModelCfg.getIns().setMaterialPic(node, "res/texture/red.png");
                    }
                }
            } else if (this.curHulaColor == "yellow") {
                // console.log("变黄");
                for (var i = 1; i <= 30; i++) {
                    var num = i < 10 ? "00" + i : "0" + i;
                    var node = utils.getChildDeep(this.walkModel, "hulaquan_" + num);
                    if (node.active) {
                        ModelCfg.getIns().setMaterialPic(node, "res/texture/yellow.png");
                    }
                }
            } else if (this.curHulaColor == "green") {
                // console.log("变蓝");
                for (var i = 1; i <= 30; i++) {
                    var num = i < 10 ? "00" + i : "0" + i;
                    var node = utils.getChildDeep(this.walkModel, "hulaquan_" + num);
                    if (node.active) {
                        ModelCfg.getIns().setMaterialPic(node, "res/texture/green.png");
                    }
                }
            } else if (this.curHulaColor == "colour") {
                // console.log("彩色");
                var colorArr = ["res/texture/red.png", "res/texture/yellow.png", "res/texture/blue.png", "res/texture/green.png"];
                for (var i = 0; i < this.hulaArr.length; i++) {
                    ModelCfg.getIns().setMaterialPic(this.hulaArr[i], colorArr[i % 4]);
                }
            }
        }

        /**
         * 呼啦圈掉落
         */
        createDownHula() {
            var self = this;
            ModelCfg.getIns().getModelById(30007, function (model) {
                G.BattleScript.newScene.addChild(model);
                ModelCfg.getIns().setLocalPosition(model, self.owner.transform.localPositionX, self.owner.transform.localPositionY, self.owner.transform.localPositionZ);
                ModelCfg.getIns().setMaterialPic(model, "res/texture/" + self.curHulaColor + ".png");
                self.downHulaArr.push(model);
                var timeLine = new Laya.TimeLine();
                timeLine.to(model.transform, { localPositionY: 0.1 }, 200).play(0, false);
                timeLine.on(Laya.Event.COMPLETE, self, function () {
                    timeLine.pause();
                    timeLine.destroy();
                });
            });
        }

        /**
         * 创建终点呼啦圈
         */
        createUpHula(index, callback) {
            var self = this;
            ModelCfg.getIns().getModelById(30007, function (model) {
                G.BattleScript.newScene.addChild(model);
                ModelCfg.getIns().setLocalPosition(model, self.owner.transform.localPositionX + (Math.random() - 0.5) * 0.1, self.owner.transform.localPositionY, self.owner.transform.localPositionZ);
                ModelCfg.getIns().setMaterialPic(model, "res/texture/" + self.curHulaColor + ".png");
                for (let i = 30; i > 1; i--) {
                    let num = i < 10 ? "00" + i : "0" + i;
                    if (i <= self.hulaCnt - index) {
                        utils.getChildDeep(self.walkModel, "hulaquan_" + num).active = true;
                    } else {
                        utils.getChildDeep(self.walkModel, "hulaquan_" + num).active = false;
                    }
                }
                // 数字
                var pos = Tools.get3D22Dpos(self.owner.transform.position, G.BattleScript.camera);

                var imgDiamNode = new Laya.Image();
                G.Main.addChild(imgDiamNode);
                imgDiamNode.skin = "common/img_icon.png";
                imgDiamNode.x = pos.x;
                imgDiamNode.y = pos.y - 150;
                imgDiamNode.scaleX = 0;
                imgDiamNode.scaleY = 0;
                imgDiamNode.anchorX = 1;
                imgDiamNode.anchorY = 0.5;

                var plusImgNode = new Laya.Image();
                imgDiamNode.addChild(plusImgNode);
                plusImgNode.skin = "common/img_1.png";
                plusImgNode.left = 100;

                var timeLine2 = new Laya.TimeLine();
                timeLine2.to(imgDiamNode, {}, 100)
                    .to(imgDiamNode, { y: imgDiamNode.y - utils.random(200, 400), x: imgDiamNode.x - utils.random(-50, 50), scaleX: 0.6, scaleY: 0.6 }, 300)
                    .to(imgDiamNode, { alpha: 0 }, 500)
                    .play(0, false);
                timeLine2.on(Laya.Event.COMPLETE, self, function () {
                    timeLine2.pause();
                    timeLine2.destroy();
                    imgDiamNode.destroy();
                });

                var timeLine = new Laya.TimeLine();
                timeLine.to(model.transform, { localPositionY: 1.5 }, 300).play(0, false);
                timeLine.on(Laya.Event.COMPLETE, self, function () {
                    timeLine.pause();
                    timeLine.destroy();
                    model.destroy();
                    if (index == self.hulaCnt) {
                        callback && callback();
                    }
                });
            });
        }

        /**
         * 付费门扣除呼啦圈
         */
        fuFeiMenDelHula() {
            var self = this;
            ModelCfg.getIns().getModelById(30007, function (model) {
                G.BattleScript.newScene.addChild(model);
                ModelCfg.getIns().setLocalPosition(model, self.owner.transform.localPositionX + (Math.random() - 0.5) * 0.1, self.owner.transform.localPositionY, self.owner.transform.localPositionZ);
                ModelCfg.getIns().setMaterialPic(model, "res/texture/" + self.curHulaColor + ".png");
                var timeLine = new Laya.TimeLine();
                timeLine.to(model.transform, { localPositionY: 1.5, localScaleX: 0.7, localScaleY: 0.7 }, 200).play(0, false);
                timeLine.on(Laya.Event.COMPLETE, self, function () {
                    timeLine.pause();
                    timeLine.destroy();
                    model.destroy();
                });
            });
        }

        /**
         * 增加呼啦圈提示
         */
        addHulaHint() {
            var pos = Tools.get3D22Dpos(this.owner.transform.position, G.BattleScript.camera);

            var bgImg = new Laya.Image("common/img_1.png");
            G.Main.addChild(bgImg);
            bgImg.x = pos.x + 50;
            bgImg.y = pos.y - 150;
            bgImg.anchorX = 0.5;
            bgImg.anchorY = 0.5;
            var timeLine = new Laya.TimeLine();
            timeLine.to(bgImg, { scaleX: 1.2, scaleY: 1.2 }, 100)
                .to(bgImg, { scaleX: 0.3, scaleY: 0.3 }, 300)
                .to(bgImg, { alpha: 0 }, 200)
                .play(0, false);
            timeLine.on(Laya.Event.COMPLETE, this, function () {
                timeLine.pause();
                timeLine.destroy();
                bgImg.destroy();
            });
        }

        /**
         * 激励提示
         */
        bestirHint(num) {
            var imgNode = new Laya.Image();
            G.Main.addChild(imgNode);
            if (num == 10) {
                imgNode.skin = "common/img_txt1.png";
            } else if (num == 20) {
                imgNode.skin = "common/img_txt2.png";
            } else if (num == 30) {
                imgNode.skin = "common/img_txt3.png";
            }
            imgNode.anchorX = 0.5;
            imgNode.anchorY = 0.5;
            imgNode.x = Laya.stage.width - 210 + utils.random(15, -15);
            imgNode.y = 460 + utils.random(5, -5);
            imgNode.scaleX = 5;
            imgNode.scaleY = 5;
            imgNode.alpha = 0;
            var timeLine = new Laya.TimeLine();
            timeLine.to(imgNode, { scaleX: 1.5, scaleY: 1.5, alpha: 1, rotation: utils.random(30, 10) }, 200)
                .to(imgNode, {}, 600)
                .to(imgNode, { alpha: 0 }, 100)
                .play(0, false);
            timeLine.on(Laya.Event.COMPLETE, this, function () {
                timeLine.pause();
                timeLine.destroy();
                imgNode.destroy();
            });
        }

        /**
         * 钻石特效
         */
        diamEffect() {
            if (!G.EFFECTCOMPLETELOAD) return;
            ModelCfg.getIns().getModelById(50003, function (model) {
                G.BattleScript.newScene.addChild(model);
                ModelCfg.getIns().setLocalPosition(model, this.owner.transform.localPositionX, 0.5, this.owner.transform.localPositionZ);
            }.bind(this));
        }

        /**
         * 屏障特效
         */
        parcloseEffect() {
            if (!G.EFFECTCOMPLETELOAD) return;
            if (!this.parcloseModel) {
                ModelCfg.getIns().getModelById(50001, function (model) {
                    this.owner.addChild(model);
                    this.parcloseModel = model;
                    ModelCfg.getIns().setLocalPosition(model, 0, -5, 0);
                }.bind(this));
            } else {
                var model = this.parcloseModel;
                ModelCfg.getIns().setLocalPosition(model, 0, -0.3, 0);
                var arr = model._children;
                for (var i = 0; i < arr.length; i++) {
                    var node = arr[i];
                    node.active = false;
                    if (this.curHulaColor == "red" && node.name == "RedBuff") {
                        node.active = true;
                    } else if (this.curHulaColor == "yellow" && node.name == "YellowBuff") {
                        node.active = true;
                    } else if (this.curHulaColor == "green" && node.name == "GreenBuff") {
                        node.active = true;
                    } else if (this.curHulaColor == "colour" && node.name == "WhiteBuff") {
                        node.active = true;
                    }
                }
            }
        }

        /**
         * 彩带特效
         */
        colourBarEffect() {
            if (!G.EFFECTCOMPLETELOAD) return;
            if (!this.colorBarModel) {
                ModelCfg.getIns().getModelById(50002, function (model) {
                    G.BattleScript.newScene.addChild(model);
                    this.colorBarModel = model;
                    ModelCfg.getIns().setLocalPosition(model, battleMgr.endColumnPos.x, 0.5, battleMgr.endColumnPos.z);
                }.bind(this));
            } else {
                ModelCfg.getIns().setLocalPosition(this.colorBarModel, battleMgr.endColumnPos.x, 0.5, battleMgr.endColumnPos.z);
                this.colorBarModel.active = false;
                this.colorBarModel.active = true;
            }
        }

        onDestroy() {
            for (var i = 0; i < this.moveHulaArr.length; i++) {
                this.moveHulaArr[i].destroy();
            }
            for (var i = 0; i < this.downHulaArr.length; i++) {
                this.downHulaArr[i].destroy();
            }
            if (this.ballModelArr) {
                for (var i = 0; i < this.ballModelArr.length; i++) {
                    this.ballModelArr[i].destroy();
                }
                this.ballModelArr = [];
            }
            this.downHulaArr = [];
            this.moveHulaArr = [];
            if (this.colorBarModel) {
                this.colorBarModel.destroy();
                this.colorBarModel = null;
            }
        }

    }

    class SceneScript extends Laya.Script {

        constructor() {
            super();
            // npc创建完成
            this.npcCreateComplete = false;
            // npc数组
            this.npcArr = [];
            // npc动画播放
            this.npcPlayer = false;
            // 灯柱
            this.dengArr = [];
            this.count = 0;
        }

        onAwake() {
            var arr = this.owner._children;
            var length = arr.length;
            for (var i = 0; i < length; i++) {
                var nameArr = arr[i].name.split("_");
                this.createModel(nameArr[0], nameArr[1], arr[i]);
            }
        }

        createModel(name, modelID, node) {
            var self = this;
            // console.log(name, modelID, node);
            if (name != "jump") {
                node.active = false;
            }
            if (modelID == 10003) {
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    ModelCfg.getIns().setLocalScale(model, 1, 1, node.transform.localScaleY);
                    model._children[0].meshRenderer.material.tilingOffsetY = node.transform.localScaleY;
                    // 碰撞体
                    var planeStaticCollider = model._children[0].getComponent(Laya.PhysicsCollider);
                    var planeShape = new Laya.BoxColliderShape(
                        node.transform.localScaleX * node.getComponent(Laya.PhysicsCollider)._colliderShape._sizeX,
                        node.transform.localScaleY * node.getComponent(Laya.PhysicsCollider)._colliderShape._sizeY,
                        node.transform.localScaleZ * node.getComponent(Laya.PhysicsCollider)._colliderShape._sizeZ - 0.3
                    );
                    planeStaticCollider.colliderShape = planeShape;
                });
            } else if (modelID == 30001) {
                // 伸缩杆
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "shenSuoGan";
                    model.addComponent(ObstacleScript);
                    // 触发器
                    utils.getChildDeep(model, "polySurface1").getComponent(Laya.PhysicsCollider).modelName = "shenSuoGan";
                    utils.getChildDeep(model, "polySurface2").getComponent(Laya.PhysicsCollider).modelName = "shenSuoGan";
                });
            } else if (modelID == 30002) {
                // 杆子
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "ganZi";
                    model.addComponent(ObstacleScript);
                    // 触发器
                    utils.getChildDeep(model, "polySurface1").getComponent(Laya.PhysicsCollider).modelName = "ganZi";
                    utils.getChildDeep(model, "polySurface2").getComponent(Laya.PhysicsCollider).modelName = "ganZi";
                });
            } else if (modelID == 30003) {
                // 减速带
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    console.log(model);
                    model.name = "jianSuDai";
                    model.addComponent(ObstacleScript);
                    // 触发器
                    utils.getChildDeep(model, "Deceleration_30003").getComponent(Laya.PhysicsCollider).modelName = "jianSuDai";
                    // 隔断
                    utils.getChildDeep(model, "partition1").getComponent(Laya.PhysicsCollider).modelName = "geDuan1";
                    utils.getChildDeep(model, "partition2").getComponent(Laya.PhysicsCollider).modelName = "geDuan2";
                });
            } else if (modelID == 30004) {
                // 升降门
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "shengJiangMen";
                    model.addComponent(ObstacleScript);
                    // 触发器
                    utils.getChildDeep(model, "pCube9").getComponent(Laya.PhysicsCollider).modelName = "ganZi";
                    utils.getChildDeep(model, "pCube10").getComponent(Laya.PhysicsCollider).modelName = "ganZi";
                });
            } else if (modelID == 30005) {
                // 付费门
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    var arr = name.split("-")[1].split("#");
                    var indexArr = arr;
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "fuFeiMen";
                    model.addComponent(ObstacleScript);
                    // 触发器
                    // 减速带 
                    var phy = utils.getChildDeep(model, "Deceleration_30003").getComponent(Laya.PhysicsCollider);
                    phy.modelName = "jianSuDai";
                    phy.stop = false;
                    // 门
                    utils.getChildDeep(model, "polySurface3").getComponent(Laya.PhysicsCollider).modelName = "fuFeiMen1";
                    utils.getChildDeep(model, "polySurface4").getComponent(Laya.PhysicsCollider).modelName = "fuFeiMen2";
                    utils.getChildDeep(model, "polySurface1").getComponent(Laya.PhysicsCollider).modelName = "fuFeiMen3";
                    // 数字 
                    for (var i = 0; i < 3; i++) {
                        var price = utils.getChildDeep(model, "price_" + (i + 1));
                        price.num = indexArr[i];
                        ModelCfg.getIns().setMaterialPic(price, "res/texture/shuz_" + price.num + ".png");
                    }
                });
            } else if (modelID == 30006) {
                // 终点
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    self.endModel = model;
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "zhongDian";
                    model.addComponent(ObstacleScript);
                    // 触发器  
                    utils.getChildDeep(model, "pPlane1").getComponent(Laya.PhysicsCollider).modelName = "zhongDian";
                    // 终点位置 模型
                    battleMgr.endColumnModel = utils.getChildDeep(model, "polySurface2");
                    battleMgr.endColumnPos = battleMgr.endColumnModel.transform.position;
                    // 终点
                    G.TOTALLENGTH = model.transform.localPositionZ + 2.6854;
                    // 背景
                    G.BattleScript.updateBG();
                    var arr = utils.getChildDeep(model, "end_30006")._children;
                    for (let i = 0; i < arr.length; i++) {
                        let node = arr[i];
                        if (node.name == "light") {
                            // 灯 
                            node.count = 0;
                            self.dengArr.push(node);
                        }
                    }
                    // 设置灯色
                    var skinArr = ["res/texture/pz_03.png", "res/texture/pz_04.png", "res/texture/pz_05.png", "res/texture/pz_06.png"];
                    var index = 0;
                    while (true) {
                        var random = parseInt(Math.random() * skinArr.length);
                        if (skinArr[random]) {
                            ModelCfg.getIns().setMaterialPic(self.dengArr[index], skinArr[random]);
                            skinArr.splice(random, 1);
                            index++;
                        } else {
                            break;
                        }
                    }
                });
            } else if (modelID == 30007) {
                // 呼啦圈
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "huLaQuan";
                    if (name.split("-")[1] == "red") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "huLaQuan_red";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/red.png");
                    } else if (name.split("-")[1] == "yellow") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "huLaQuan_yellow";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/yellow.png");
                    } else if (name.split("-")[1] == "green") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "huLaQuan_green";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/green.png");
                    }
                });
            } else if (modelID == 30009) {
                // 旋转杆
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "xuanZhuanGan";
                    model.addComponent(ObstacleScript);
                    // 触发器 
                    utils.getChildDeep(model, "rotate_30009").getComponent(Laya.PhysicsCollider).modelName = "xuanZhuanGan";
                    utils.getChildDeep(model, "pCylinder4").getComponent(Laya.PhysicsCollider).modelName = "xuanZhuanGan";
                });
            } else if (modelID == 30010) {
                // 旋转舵
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "xuanZhuanDuo";
                    model.addComponent(ObstacleScript);
                    // 触发器 
                    utils.getChildDeep(model, "polySurface1").getComponent(Laya.PhysicsCollider).modelName = "xuanZhuanDuo";
                    utils.getChildDeep(model, "polySurface4").getComponent(Laya.PhysicsCollider).modelName = "xuanZhuanDuo";
                });
            } else if (modelID == 30011) {
                // 摆球
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "baiQiu";
                    model.addComponent(ObstacleScript);
                    // 触发器 
                    utils.getChildDeep(model, "ball").getComponent(Laya.PhysicsCollider).modelName = "baiQiu";
                });
            } else if (modelID == 30012) {
                // 平移杆
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    ModelCfg.getIns().setLocalRotation(model, node.transform.localRotationEulerX, node.transform.localRotationEulerY, node.transform.localRotationEulerZ);
                    model.name = "pingYiGan";
                    model.addComponent(ObstacleScript);
                    // 触发器 
                    utils.getChildDeep(model, "polySurface1").getComponent(Laya.PhysicsCollider).modelName = "pingYiGan";
                    utils.getChildDeep(model, "polySurface2").getComponent(Laya.PhysicsCollider).modelName = "pingYiGan";
                });
            } else if (modelID == 30013) {
                // 圆形平台
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "yaunXingPingTai";
                    // 触发器 
                    model._children[0].getComponent(Laya.PhysicsCollider).modelName = "yaunXingPingTai";
                });
            } else if (modelID == 30014) {
                // 变色屏障
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "bianSePingZhang";
                    // 触发器  
                    model._children[0].getComponent(Laya.PhysicsCollider).modelName = "bianSePingZhang_colour";
                    ModelCfg.getIns().setMaterialPic(model, "res/texture/pz_02.png");
                });
            } else if (modelID == 30015) {
                // 红 / 黄 / 绿屏障
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "bianSePingZhang";
                    // 触发器 
                    if (name.split("-")[1] == "red") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "bianSePingZhang_red";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/pz_03.png");
                    } else if (name.split("-")[1] == "yellow") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "bianSePingZhang_yellow";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/pz_05.png");
                    } else if (name.split("-")[1] == "green") {
                        model._children[0].getComponent(Laya.PhysicsCollider).modelName = "bianSePingZhang_green";
                        ModelCfg.getIns().setMaterialPic(model, "res/texture/pz_04.png");
                    }
                });
            } else if (modelID == 0) {
                // 钻石
                // ModelCfg.getIns().getModelById(modelID, function (model) {
                //     self.owner.addChild(model);
                //     ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                //     model.name = "zuanShi";
                //     model._children[0].getComponent(Laya.PhysicsCollider).modelName = "zuanShi";
                // })
            } else if (modelID == 30018) {
                // 钻石(组合)
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    model.name = "zuanShis";
                    model._children[0].getComponent(Laya.PhysicsCollider).modelName = "zuanShis";
                });
            } else if (
                modelID == 30019 || modelID == 30020 || modelID == 30021 || modelID == 30023 || modelID == 30024 ||
                modelID == 30027 || modelID == 30028 || modelID == 30029 || modelID == 30030 || modelID == 30031 ||
                modelID == 30032 || modelID == 30033 || modelID == 30034 || modelID == 30035
            ) {
                // 5呼啦圈 / 4呼啦圈 / 5呼啦圈 -- 梯形 
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    ModelCfg.getIns().setLocalRotation(model, node.transform.localRotationEulerX, node.transform.localRotationEulerY, node.transform.localRotationEulerZ);
                    var color = "";
                    if (name.split("-")[1] == "red") {
                        color = "red";
                    } else if (name.split("-")[1] == "yellow") {
                        color = "yellow";
                    } else if (name.split("-")[1] == "green") {
                        color = "green";
                    }
                    if (color != "") {
                        var arr = model._children[0]._children;
                        for (var i = 0; i < arr.length; i++) {
                            arr[i].getComponent(Laya.PhysicsCollider).modelName = "huLaQuan_" + color;
                            ModelCfg.getIns().setMaterialPic(model, "res/texture/" + color + ".png");
                        }
                    }
                });
            } else if (modelID == 30017 || modelID == 30022 || modelID == 30025 || modelID == 30026) {
                ModelCfg.getIns().getModelById(modelID, function (model) {
                    self.owner.addChild(model);
                    model.addComponent(ObstacleScript);
                    ModelCfg.getIns().setLocalPosition(model, node.transform.localPositionX, node.transform.localPositionY, node.transform.localPositionZ);
                    ModelCfg.getIns().setLocalRotation(model, node.transform.localRotationEulerX, node.transform.localRotationEulerY, node.transform.localRotationEulerZ);
                    var arr = model._children[0]._children;
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].getComponent(Laya.PhysicsCollider).modelName = "zuanShi";
                    }
                });
            }
        }

        onUpdate() {
            let delta = G.FRAME_INTERVAL;
            // npc动作
            if (battleMgr.todoEnd && !this.npcPlayer) {
                for (var i = 0; i < this.npcArr.length; i++) {
                    var npc = this.npcArr[i];
                    ModelCfg.getIns().playAnim(npc, Math.random() > 0.5 ? "paishou" : "dance");
                    ModelCfg.getIns().setLocalPosition(npc, 0, -0.1, -0.12);
                    if (i == this.npcArr.length - 1) {
                        audioManager.playSound(3);
                        this.npcPlayer = true;
                    }
                }
            }
            // 光柱摆动
            if (this.dengArr.length > 0) {
                for (var i = 0; i < this.dengArr.length; i++) {
                    var num = Math.cos(Math.RAD_1_ANGLE * this.dengArr[i].count) * 0.45;
                    this.dengArr[i].transform.localRotationEulerX -= num;
                    this.dengArr[i].count -= delta * 50;
                }
            }
            G.BattleScript.moveCamera();
            // 加载观众模型
            if (this.endModel && !this.npcCreateComplete && G.VIEWERCOMPLETELOAD) {
                this.npcCreateComplete = true;
                // npc
                var arr = utils.getChildDeep(this.endModel, "end_30006")._children;
                for (let i = 0; i < arr.length; i++) {
                    let node = arr[i];
                    if (node.name == "npc") {
                        ModelCfg.getIns().getModelById(10004, function (npcModel) {
                            node.addChild(npcModel);
                            var random = parseInt(Math.random() * 6 + 1);
                            for (var j = 1; j <= 6; j++) {
                                let role = utils.getChildDeep(npcModel, "role" + j);
                                role.active = false;
                                if (j == random) {
                                    role.active = true;
                                }
                            }
                            this.npcArr.push(npcModel);
                            ModelCfg.getIns().setLocalRotation(npcModel, 90, 0, 0);
                            ModelCfg.getIns().setLocalPosition(npcModel, 0, -0.05, -0.12);
                        }.bind(this));
                    }
                }
            }
        }

        onEnable() {

        }

        onDisable() {
        }

        onDestroy() {
        }
    }

    class BattleScript extends Laya.Script {

        constructor() {
            super();
            G.BattleScript = this;
        }

        onAwake() {
            this.initData();
            battleMgr.isGameStart = false;

            //冰块间距
            this.iceLength = 0.5;
            var self = this;
            // 是否可以点击
            this.isClick = false;
            this.owner.script = this;
            this.initEvent();
            this.cameraBasePos = { x: 0, y: 2, z: 3 };

            this.nullMat = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/texture/null.png", Laya.Handler.create(null, function (tex) {
                this.nullMat.albedoTexture = tex;
                this.nullMat.renderMode = Laya["BlinnPhongMaterial"].RENDERMODE_TRANSPARENT;
            }.bind(this)));
        }

        initData() {
            // 点击
            this.isTouch = false;

            // 角色控制器
            this.role_character = null;
            // 角色脚本
            this.role_js = null;
            // 场景脚本
            this.scene_js = null;

            // 左右边界值(+-)
            this.maxRange = 1;

            // 点击的坐标位置
            this.clickPoint = new Laya.Vector2();

            this.count = 180;
            this.r = 0;
            this.cd = 0;
            this.isRotate = false;

            // 背景贴图
            this.colorArr = [];
            // 建筑模型
            this.buildmdeolArr = [];

            this.curMusicNum = [];
        }

        initEvent() {
            this.owner.on(Laya.Event.MOUSE_DOWN, this, this.onDown);
            this.owner.on(Laya.Event.MOUSE_MOVE, this, this.onMove);
            this.owner.on(Laya.Event.MOUSE_UP, this, this.onUp);
            this.owner.on(Laya.Event.MOUSE_OUT, this, this.onUp);
        }

        onUpdate() {
            if (!battleMgr.isGameStart) return;
            let delta = G.FRAME_INTERVAL;
        }

        onEnable() {
            this.newScene = this.owner.addChild(new Laya.Scene3D());

            var directionLight = new Laya.DirectionLight();
            this.newScene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            //设置平行光的方向
            var mat = directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-0.5, -1.0, -0.5));
            directionLight.transform.worldMatrix = mat;

            //开启雾化效果
            this.newScene.enableFog = true;
            //设置雾化的颜色176,224,230
            this.newScene.fogColor = new Vector3(147 / 255, 120 / 255, 249 / 255);
            //设置雾化的起始位置，相对于相机的距离
            this.newScene.fogStart = 10;
            //设置雾化最浓处的距离。
            this.newScene.fogRange = 30;

            this.camera = cameraUtils.createCamera(this.cameraBasePos, new Laya.Vector3(-20, 0, 0));
            this.camera.transform.lookAt(new Laya.Vector3(0, 0, 0), cameraUtils.upPos);
            this.newScene.addChild(this.camera);
            this.camera.fieldOfView = 60;
            // cameraUtils.controlCamera(this.camera);

            // this.initScene();
        }

        initScene() {
            var self = this;
            ModelCfg.getIns().getModelById(40000 + PlayerData.getIns().level, function (model) {
                // self.createRole();
                self.newScene.addChild(model);
                self.sceneModel = model;
                model.addComponent(SceneScript);
                ModelCfg.getIns().setLocalPosition(model, 0, 0, 0);
            });
        }

        //生成角色
        createRole() {
            var capsule = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.1, 0.9, 10, 20)));
            capsule.meshRenderer.material = this.nullMat;
            capsule.addComponent(RoleScript);

            // 角色碰撞器
            var character = capsule.addComponent(Laya.CharacterController);
            var sphereShape = new Laya.CapsuleColliderShape(0.1, 0.9);
            character.isTrigger = true;
            character.fallSpeed = 0;
            character.jumpSpeed = 0;

            capsule.transform.localPositionY = 0.5;

            sphereShape.localOffset = new Laya.Vector3(0, 0, 0);
            character.colliderShape = sphereShape;

            this.role_character = capsule;
            this.role_js = capsule.script;
            // 碰撞器绑定角色脚本
            character.role_js = this.role_js;

            this.camera.transform.localPositionZ = this.role_character.transform.localPositionZ + 3;
            this.camera.transform.localPositionY = this.role_character.transform.localPositionY + 2;

            this.camera.transform.lookAt({ x: 0, y: 0, z: -2 }, cameraUtils.upPos);

            G.aaa = this.test;
        }

        test() {
            ModelCfg.getIns().getModelById(50001, function (model) {
                this.newScene.addChild(model);
            }.bind(this));
        }

        onDown(e) {
            if (battleMgr.todoEnd) return;
            if (!this.isTouch) {
                this.isTouch = true;
                var self = this;
                var arr = dataManager.getTryout();
                if (arr.length > 0) {
                    uiManager.openUI("game/TryoutView.scene", null, {
                        dataArr: [arr[utils.random(0, arr.length - 1)]],
                        callback: function () {
                            G.BGMUSICINDEX = self.randomBgMusicNum();
                            audioManager.stopMusic(2);
                            audioManager.playMusic(G.BGMUSICINDEX);
                            battleMgr.isGameStart = true;
                            if (self.role_js) {
                                updateManager.frameOnce(5, self, function () {
                                    self.role_js.startRun();
                                    self.setGravity(55);
                                });
                            }
                            G.Main.updateUI();
                        }
                    });
                } else {
                    G.BGMUSICINDEX = this.randomBgMusicNum();
                    audioManager.stopMusic(2);
                    audioManager.playMusic(G.BGMUSICINDEX);
                    battleMgr.isGameStart = true;
                    if (this.role_js) {
                        this.role_js.startRun();
                        this.setGravity(55);
                    }
                    G.Main.updateUI();
                }
            }
            this.clickPointX = Laya.MouseManager.instance.mouseX;
        }

        onUp(e) {
            this.clickPointX = null;
        }

        onMove(e) {
            if (this.role_js.openMen) return;
            if (this.role_js.jumping) return;
            if (battleMgr.todoEnd) return;
            if (!battleMgr.isGameStart) return;
            if (!this.role_character) return;
            if (!this.clickPointX) return;
            // var x = e.stageX;
            var x = Laya.MouseManager.instance.mouseX;
            // if (this.clickPoint.x > x) {
            //     if (this.role_js.jump) {
            //         this.role_js.huduX += (x - this.clickPoint.x) / 100;
            //         this.role_js.crateJumpRadian();
            //     } else if (this.role_character.transform.localPositionX > -this.maxRange) {
            //         this.role_character.transform.localPositionX += (x - this.clickPoint.x) / 300;
            //     }
            // } else if (this.clickPoint.x < x) {
            //     if (this.role_js.jump) {
            //         this.role_js.huduX += (x - this.clickPoint.x) / 100;
            //         this.role_js.crateJumpRadian();
            //     } else if (this.role_character.transform.localPositionX < this.maxRange) {
            //         this.role_character.transform.localPositionX += (x - this.clickPoint.x) / 300;
            //     }
            // }
            if (this.role_js.jump) {
                this.role_js.huduX += (x - this.clickPointX) / 100;
                this.role_js.crateJumpRadian();
            } else {
                this.role_character.transform.localPositionX += (x - this.clickPointX) / 300;
            }
            if (Math.abs(this.role_character.transform.localPositionX) > this.maxRange) {
                if (this.role_character.transform.localPositionX > 0) {
                    this.role_character.transform.localPositionX = this.maxRange;
                } else {
                    this.role_character.transform.localPositionX = -this.maxRange;
                }
            }
            this.clickPointX = x;
        }

        onDisable() {

        }

        setGravity(val) {
            this.role_character.getComponent(Laya.CharacterController).fallSpeed = val;
            this.role_character.getComponent(Laya.CharacterController).jumpSpeed = val;
        }

        /**
         * 清除模型
         */
        clearModel() {
            for (var i = 0; i < this.sceneModel._children.length; i++) {
                this.sceneModel._children[i].destroy();
            }
            for (var i = 0; i < this.role_character._children.length; i++) {
                this.role_character._children[i].destroy();
            }
            for (var i = 0; i < this.buildmdeolArr.length; i++) {
                this.buildmdeolArr[i].destroy();
            }
            this.buildmdeolArr = [];
            this.sceneModel.destroy();
            this.role_character.destroy();
            this.sceneModel = null;
            this.role_character = null;
            this.initData();
            this.initScene();
            this.createRole();
        }

        /**
         * 移动相机
         */
        moveCamera() {
            if (this.isRotate) return;
            if (!battleMgr.todoEnd) return;
            if (!this.cd) {
                this.cd = 2;
            } else {
                this.cd -= 0.03;
                this.camera.transform.localPositionZ = this.role_character.transform.localPositionZ + 3;
                this.r = this.camera.transform.localPositionZ - battleMgr.endColumnPos.z;
            }
            if (this.cd > 0) return;
            var hudu = (2 * Math.PI / 360) * this.count;
            var x = 0 + Math.sin(hudu) * this.r;
            var z = 0 - Math.cos(hudu) * this.r;
            var pos = new Laya.Vector3();
            pos.x = battleMgr.endColumnPos.x + x;
            pos.y = 2.5;
            pos.z = battleMgr.endColumnPos.z + z;
            this.camera.transform.position = pos;
            this.count += 1.5;
            if (this.count % 540 == 0) {
                this.isRotate = true;
                // battleMgr.endGame(true);
            }
            this.camera.transform.lookAt(battleMgr.endColumnPos, cameraUtils.upPos);
        }

        // 背景
        updateBG() {
            // 侧边
            var self = this;
            var sideY = utils.random(-60, -70); // 所有侧面建筑 y轴
            var sideX_left = utils.random(-6, -12); // 左边建筑X
            var sideX_right = utils.random(6, 12); // 右边建筑X
            var sideZStart = 0; // 起始位置
            var sideZEnd = -120; // 终点位置
            var angle = Math.random() > 0.5 ? 0 : 90; // 角度

            var left = false;
            var right = false;
            var end = false;

            var skinPath = "res/texture/Storey" + self.bgMaterialPic() + ".png";
            ModelCfg.getIns().getModelById(30036, function (model) {
                self.newScene.addChild(model);
                ModelCfg.getIns().setLocalPosition(model, sideX_right, sideY, sideZStart);
                ModelCfg.getIns().setLocalRotation(model, 0, angle, 0);
                ModelCfg.getIns().setMaterialPic(model, skinPath);
                self.buildmdeolArr.push(model);
                while (true) {
                    var cloneModel = model.clone();
                    self.buildmdeolArr.push(cloneModel);
                    self.newScene.addChild(cloneModel);
                    angle = Math.random() > 0.5 ? 0 : 90;
                    if (!end) {
                        if (!right) {
                            sideX_right = utils.random(6, 12);
                            sideY = utils.random(-60, -70);
                            sideZStart += utils.random(-15, -35);
                            ModelCfg.getIns().setLocalPosition(cloneModel, sideX_right, sideY, sideZStart);
                        } else if (!left) {
                            ModelCfg.getIns().setLocalPosition(cloneModel, sideX_left, sideY, sideZStart);
                            sideX_left = utils.random(-6, -12);
                            sideY = utils.random(-60, -70);
                            sideZStart += utils.random(-15, -35);
                        }
                        if (sideZStart <= sideZEnd) {
                            if (!right) {
                                right = true;
                                sideZStart = -15;
                            } else if (!left) {
                                left = true;
                            }
                            if (right && left) {
                                end = true;
                            }
                        }
                    } else {
                        // 终点
                        var endX = utils.random(-0.5, 0.5);
                        var endY = utils.random(-45, -65);
                        var endZ = battleMgr.endColumnPos.z + utils.random(-20, -30);
                        ModelCfg.getIns().setLocalPosition(cloneModel, endX, endY, endZ);
                        return;
                    }
                    ModelCfg.getIns().setLocalRotation(cloneModel, 0, angle, 0);
                    ModelCfg.getIns().setMaterialPic(cloneModel, skinPath);
                }
            });
        }

        /**
         * 背景贴图
         */
        bgMaterialPic() {
            if (this.colorArr.length == 3) {
                this.colorArr = [];
            }
            var random = utils.random(1, 3);
            if (this.colorArr.length == 0) {
                this.colorArr.push(random);
                return random;
            } else {
                while (true) {
                    for (var i = 0; i < this.colorArr.length; i++) {
                        if (this.colorArr[i] != random) {
                            this.colorArr.push(random);
                            return random;
                        } else {
                            random = utils.random(1, 3);
                        }
                    }
                }
            }
        }


        /**
         * 随机背景音乐
         */
        randomBgMusicNum() {
            var arr = [1, 18, 19];
            while (true) {
                var own = false;
                var random = utils.random(0, 2);
                if (this.curMusicNum.length >= 3) {
                    this.curMusicNum = [];
                }
                if (this.curMusicNum.length == 0 && G.BGMUSICINDEX == arr[random]) {
                    own = true;
                }
                for (var i = 0; i < this.curMusicNum.length; i++) {
                    if (this.curMusicNum[i] == arr[random]) {
                        own = true;
                    }
                }
                if (!own) {
                    this.curMusicNum.push(arr[random]);
                    return arr[random];
                }
            }

        }

    }

    class RewardUI extends UIBase {

        constructor() {
            super();
        }

        initData() {
            this.title = this.argObj.title;
            this.id = this.argObj.id;
            this.num = this.argObj.num;
            this.data = D.roleConfig[this.id];
        }

        initUI() {
            this.label_title.text = this.title;
            // this.label_num.text = this.data.name;
            this.img_icon.skin = this.data.head;
            this.ani1.play(0, true);
        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_close, this, this.doClose);
        }

    }

    class SginUI extends UIBase {

        constructor() {
            super();
            G.Sgin = this;
        }

        initData() {
        }

        initUI() {
            this.updateTime();
            this.updateGetInfo();
            this.updateCoin();
            if (!PlayerData.getIns().sgin) {
                updateManager.timeLoop(1, this, this.updateTime);
            }
            if (this.argObj && this.argObj.startFun) {
                this.argObj.startFun();
            }
        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_close, this, this.doClose);
            // 第1天
            utils.onBtnScaleEvent(this.btn_item1, this, function (e) {
                if (PlayerData.getIns().sgin && (PlayerData.getIns().sginDay + 1) == 1) {
                    utils.prompt("Sign in successfully");
                    PlayerData.getIns().addDiamond(this.data[0].num);
                    utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                        self.updateCoin();
                    });
                    this.onSgin();
                } else {
                    if (PlayerData.getIns().sginDay >= 1) {
                        utils.prompt("Has signed in");
                    }
                }
            });
            // 第2天
            utils.onBtnScaleEvent(this.btn_item2, this, function (e) {
                if (PlayerData.getIns().sgin && (PlayerData.getIns().sginDay + 1) == 2) {
                    utils.prompt("Sign in successfully");
                    PlayerData.getIns().addDiamond(this.data[1].num);
                    utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                        self.updateCoin();
                    });
                    this.onSgin();
                } else {
                    if (PlayerData.getIns().sginDay >= 2) {
                        utils.prompt("Has signed in");
                    }
                }
            });
            // 第3天
            utils.onBtnScaleEvent(this.btn_item3, this, function (e) {
                if (PlayerData.getIns().sgin && (PlayerData.getIns().sginDay + 1) == 3) {
                    utils.prompt("Sign in successfully");
                    if (this.data[2].reward) {
                        if (this.data[2].reward.type == 1) {
                            PlayerData.getIns().addOwnBackDecoration(this.data[2].reward.id);
                            PlayerData.getIns().setCurBackDecoration(this.data[2].reward.id);
                        } else if (this.data[2].reward.type == 2) {
                            PlayerData.getIns().addOwnHeadDecoration(this.data[2].reward.id);
                            PlayerData.getIns().setCurHeadDecoration(this.data[2].reward.id);
                        }
                        uiManager.openUI("game/RewardView.scene", null, { title: "Reward", num: 0, id: this.data[2].reward.id });
                        G.BattleScript.role_js.updateRoleModel();
                        G.BattleScript.role_js.updateDanceModel();
                    } else {
                        PlayerData.getIns().addDiamond(this.data[2].num);
                        utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                            self.updateCoin();
                        });
                    }
                    this.onSgin();
                } else {
                    if (PlayerData.getIns().sginDay >= 3) {
                        utils.prompt("Has signed in");
                    }
                }
            });
        }

        /**
         * 更新金币
         */
        updateCoin() {
            if (this.box_coin && this.box_coin._children) {
                utils.getChildDeep(this.box_coin, "label_num").text = PlayerData.getIns().diamond;
            }
        }

        /**
         * 更新时间
         */
        updateTime() {
            // 提示
            var labelTag = utils.getChildDeep(this.img_time, "label_tag");
            labelTag.visible = PlayerData.getIns().sgin;
            // 时间
            var boxTag = utils.getChildDeep(this.img_time, "box_tag");
            boxTag.visible = !PlayerData.getIns().sgin;
            // 计算剩余时间
            // 设置零点时间
            var time1 = new Date();
            time1.setHours(0, 0, 0, 0);
            var time2 = new Date();
            var remainingTime = (24 * 3600 * 1000 - (time2.getTime() - time1.getTime())) / 1000;
            var value = utils.formatSeconds(remainingTime);
            if (value) {
                utils.getChildDeep(boxTag, "label_num").text = value;
            } else {
                utils.getChildDeep(boxTag, "label_num").text = "00:00:00";
                // 重置
                PlayerData.getIns().setSgin(true);
                boxTag.visible = !PlayerData.getIns().sgin;
                labelTag.visible = PlayerData.getIns().sgin;
                if (PlayerData.getIns().sginDay >= 3) {
                    PlayerData.getIns().initSginDay();
                    this.updateGetInfo();
                }
            }
        }

        /**
         * 更新领取信息
         */
        updateGetInfo() {
            var rewardData = "";
            var getArr = [];
            for (var key in D.roleConfig) {
                if (D.roleConfig[key].source == 4) {
                    if (D.roleConfig[key].type == 1) {
                        if (!dataManager.queryOwnBackDecoration(key)) {
                            getArr.push(D.roleConfig[key]);
                        }
                    } else if (D.roleConfig[key].type == 2) {
                        if (!dataManager.queryOwnHeadDecoration(key)) {
                            getArr.push(D.roleConfig[key]);
                        }
                    }
                }
            }
            if (getArr.length > 0) {
                rewardData = getArr[0];
            }
            // 数据
            this.data = [
                {
                    day: 1,
                    num: 500
                },
                {
                    day: 2,
                    num: 1000
                },
                {
                    day: 3,
                    num: 2000,
                    reward: rewardData
                }
            ];
            var data = this.data;
            var arr = [this.btn_item1, this.btn_item2, this.btn_item3];
            for (var i = 0; i < arr.length; i++) {
                var day = utils.getChildDeep(arr[i], "label_day");
                var num = utils.getChildDeep(arr[i], "label_num");
                var icon = utils.getChildDeep(arr[i], "img_icon");
                var gou = utils.getChildDeep(arr[i], "img_gou");
                gou.visible = false;
                day.text = "Day " + data[i].day + "";
                if (num) {
                    num.text = data[i].num;
                }
                if (icon) {
                    if (data[i].reward) {
                        num.visible = false;
                        icon.skin = data[i].reward.head;
                    } else {
                        icon.skin = "common/img_icon.png";
                    }
                }
                if (PlayerData.getIns().sginDay >= data[i].day) {
                    arr[i].disabled = true;
                    gou.visible = true;
                } else {
                    arr[i].disabled = false;
                }
            }
        }

        /**
         * 签到
         */
        onSgin() {
            PlayerData.getIns().setSgin(false);
            PlayerData.getIns().addSginDay();
            PlayerData.getIns().setSginTime();
            this.updateGetInfo();
            updateManager.timeLoop(1, this, this.updateTime);
            // 添加任务
            PlayerData.getIns().setTaskConfig(2003, 1, false);
        }

        doClose() {
            eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_DIAMOND);
            eventDispatcher.dispatchEvent(ulee.Event.ON_TASK);
            if (this.argObj && this.argObj.callback) {
                this.argObj.callback();
            }
            super.doClose();
        }

    }

    class ShopUI extends UIBase {

        constructor() {
            super();
        }

        initData() {
            this.array1 = [];
            this.array2 = [];
            // 当前处于某抽屉   beiShi / touShi
            this.curSelectName = "beiShi";

            var arr = Object.values(D.roleConfig);
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type == 1) {
                    this.array1.push(arr[i]);
                } else if (arr[i].type == 2) {
                    this.array2.push(arr[i]);
                }
            }
            console.log(this.array1);
            console.log(this.array2);
            this.selectData = D.roleConfig[PlayerData.getIns().curBackDecoration];
            if (this.selectData) {
                this.btnType = 0;
            } else if (!this.selectData) {
                this.selectData = this.array1[0];
                this.btnType = this.selectData.source;
            }
            this.selectData2 = D.roleConfig[PlayerData.getIns().curHeadDecoration];
            if (this.selectData2) {
                this.btnType = 0;
            } else {
                this.selectData2 = this.array2[0];
            }
        }

        initUI() {
            this.newScene = this.box_scene.addChild(new Laya.Scene3D());
            this.camera = cameraUtils.createCamera(new Laya.Vector3(0, 0.9, 1.5), new Laya.Vector3(-15, 0, 0), false);
            this.camera.normalizedViewport = new Laya.Viewport(0, -0.48, 1, 1);
            var directionLight = new Laya.DirectionLight();
            this.newScene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(0.5, 0.5, 0.5);
            this.newScene.addChild(this.camera);

            //创建方向光
            this.directionLight = this.newScene.addChild(new Laya.DirectionLight());
            //设置灯光颜色
            this.directionLight.color = new Laya.Vector3(0.5, 0.5, 0.5);
            //设置灯光方向
            var mat = this.directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-3.0, -5.0, -1.0));
            this.directionLight.transform.worldMatrix = mat;

            this.updateBtnStatus();
            this.updateCoin();
            this.updateModel();
        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_close, this, this.doClose);
            // 角色
            utils.onBtnEvent(this.btn_select1, this, function () {
                audioManager.playSound(4, null, true);
                if (this.selectData) {
                    this.btnType = this.selectData.source;
                }
                this.curSelectName = "beiShi";
                this.list.array = this.array1;
                this.btn_select1.gray = false;
                this.btn_select2.gray = true;
                this.updateBtnStatus();
                this.list.selectedIndex = -1;
                this.scaleCamera(1.5, 0);
            });
            // 平台
            utils.onBtnEvent(this.btn_select2, this, function () {
                audioManager.playSound(4, null, true);
                if (this.selectData2) {
                    this.btnType = this.selectData2.source;
                }
                this.curSelectName = "touShi";
                this.list.array = this.array2;
                this.btn_select1.gray = true;
                this.btn_select2.gray = false;
                this.updateBtnStatus();
                this.list.selectedIndex = -1;
                this.scaleCamera(0.95, -180);
            });
            // 获取
            utils.onBtnScaleEvent(this.btn_get, this, function () {
                if (this.btnType == 0 || this.btnType == 3) return;
                if (this.btnType == 1) {
                    // 视频
                    if (uleeSDK) {
                        uleeSDK.getIns.showVideoAD(
                            function () {
                                // 添加任务
                                PlayerData.getIns().setTaskConfig(2005, 1, false);
                                self.getReward();
                            },
                            function () { }
                        );
                    } else {
                        this.getReward();
                    }
                } else if (this.btnType == 2) {
                    // 金币
                    if (this.curSelectName == "beiShi") {
                        if (PlayerData.getIns().diamond < this.selectData.price) {
                            utils.prompt("Diamond is insufficient");
                            return;
                        }
                        PlayerData.getIns().addDiamond(-this.selectData.price);
                    } else {
                        if (PlayerData.getIns().diamond < this.selectData2.price) {
                            utils.prompt("Diamond is insufficient");
                            return;
                        }
                        PlayerData.getIns().addDiamond(-this.selectData2.price);
                    }
                    this.getReward();
                }
            });
            // 列表
            this.list.array = this.array1;
            utils.listHandler(this.list, this,
                function (cell, index) {
                    var data = cell.dataSource;
                    var icon = utils.getChildDeep(cell, "img_icon");
                    var gou = utils.getChildDeep(cell, "img_gou");
                    var select = utils.getChildDeep(cell, "img_select");
                    if (!cell.isInit) {
                        let img = new Laya.Image;
                        img.skin = "common/img_di5.png";
                        img.width = icon.width;
                        img.height = icon.height;
                        icon.mask = img;
                        let img2 = new Laya.Image;
                        img2.width = icon.width;
                        img2.height = icon.height;
                        icon.addChild(img2);
                    }
                    icon._children[0].skin = data.head;
                    icon.gray = true;
                    gou.gray = true;
                    gou.visible = false;
                    select.skin = "common/img_di6.png";
                    if (data.type == 1) {
                        // 拥有的
                        if (dataManager.queryOwnBackDecoration(data.id)) {
                            icon.gray = false;
                            gou.gray = false;
                        }
                        // 穿戴的
                        if (PlayerData.getIns().curBackDecoration == data.id) {
                            gou.visible = true;
                        }
                    } else {
                        if (dataManager.queryOwnHeadDecoration(data.id)) {
                            icon.gray = false;
                            gou.gray = false;
                        }
                        if (PlayerData.getIns().curHeadDecoration == data.id) {
                            gou.visible = true;
                        }
                    }
                    if (this.curSelectName == "beiShi") {
                        if (self.selectData) {
                            if (self.selectData.id == data.id) {
                                select.skin = "common/img_select.png";
                            }
                        } else {
                            if (index == 0) {
                                select.skin = "common/img_select.png";
                            }
                        }
                    } else {
                        if (self.selectData2) {
                            if (self.selectData2.id == data.id) {
                                select.skin = "common/img_select.png";
                            }
                        } else {
                            if (index == 0) {
                                select.skin = "common/img_select.png";
                            }
                        }
                    }
                },
                function (index) {
                    if (index < 0) return;
                    var data = this.list.array[index];
                    if (this.curSelectName == "beiShi") {
                        this.selectData = data;
                    } else {
                        this.selectData2 = data;
                    }
                    if (data.type == 1 && !dataManager.queryOwnBackDecoration(data.id)) {
                        this.btnType = data.source;
                    } else if (data.type == 2 && !dataManager.queryOwnHeadDecoration(data.id)) {
                        this.btnType = data.source;
                    } else {
                        if (data.type == 1 && PlayerData.getIns().curBackDecoration != data.id) {
                            // 角色皮肤 
                            PlayerData.getIns().setCurBackDecoration(data.id);
                            utils.prompt("Successful use");
                        } else if (data.type == 2 && PlayerData.getIns().curHeadDecoration != data.id) {
                            // 平台皮肤 
                            PlayerData.getIns().setCurHeadDecoration(data.id);
                            utils.prompt("Successful use");
                        }
                        this.btnType = 0;
                    }
                    audioManager.playSound(4, null, true);
                    this.updateBtnStatus();
                    this.updateModel();
                }
            );
        }

        /**
         * 更新金币
         */
        updateCoin() {
            utils.getChildDeep(this.box_coin, "label_num").text = PlayerData.getIns().diamond;
        }

        /**
         * 更新模型
         */
        updateModel() {
            var self = this;
            if (self.curModel) {
                if (this.curSelectName == "beiShi") {
                    // 背饰
                    var backNode = utils.getChildDeep(self.curModel, "Bip001 Spine2");
                    var childrenArr = backNode._children;
                    for (var i = 1; i < childrenArr.length; i++) {
                        childrenArr[i].destroy();
                    }
                    ModelCfg.getIns().getModelById(this.selectData.modelid, function (m) {
                        backNode.addChild(m);
                    });
                } else if (this.curSelectName == "touShi") {
                    // 头饰
                    var headNode = utils.getChildDeep(self.curModel, "Bip001 Head");
                    var childrenArr = headNode._children;
                    for (var i = 0; i < childrenArr.length; i++) {
                        childrenArr[i].destroy();
                    }
                    ModelCfg.getIns().getModelById(this.selectData2.modelid, function (m) {
                        headNode.addChild(m);
                    });
                }
                return;
            }
            ModelCfg.getIns().getModelById(10001, function (model) {
                self.newScene.addChild(model);
                self.curModel = model;
                self.playAni("idle", null, true);
                // 呼啦圈 
                ModelCfg.getIns().getModelById(10000, function (hulaModel) {
                    var hulaNode = utils.getChildDeep(model, "hulaquan_001");
                    hulaNode.addChild(hulaModel);
                    ModelCfg.getIns().setMaterialPic(hulaModel, "res/texture/red.png");
                }.bind(this));
                // 背饰
                var backNode = utils.getChildDeep(model, "Bip001 Spine2");
                if (PlayerData.getIns().curBackDecoration) {
                    ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curBackDecoration].modelid, function (m) {
                        backNode.addChild(m);
                    });
                }
                // 头饰
                var headNode = utils.getChildDeep(model, "Bip001 Head");
                if (PlayerData.getIns().curHeadDecoration) {
                    ModelCfg.getIns().getModelById(D.roleConfig[PlayerData.getIns().curHeadDecoration].modelid, function (m) {
                        headNode.addChild(m);
                    });
                }
            });
        }

        /**
         * 更新按钮状态 // 0拥有 / 1视频 / 2金币 / 3签到获取 / 4任务获取
         */
        updateBtnStatus() {
            this.btn_get.visible = true;
            var ad = utils.getChildDeep(this.btn_get, "box_ad");
            var coin = utils.getChildDeep(this.btn_get, "box_coin");
            ad.visible = false;
            coin.visible = false;
            this.box_own.visible = false;
            this.box_sgin.visible = false;
            if (this.btnType == 0) {
                this.btn_get.visible = false;
                this.box_own.visible = true;
            } else if (this.btnType == 1) {
                ad.visible = true;
            } else if (this.btnType == 2) {
                coin.visible = true;
                if (this.curSelectName == "beiShi") {
                    utils.getChildDeep(coin, "label_num").text = this.selectData.price;
                } else {
                    utils.getChildDeep(coin, "label_num").text = this.selectData2.price;
                }
            } else if (this.btnType == 3) {
                this.btn_get.visible = false;
                this.box_sgin.visible = true;
                utils.getChildDeep(this.box_sgin, "label_name").text = "sign in get";
            } else if (this.btnType == 4) {
                this.btn_get.visible = false;
                this.box_sgin.visible = true;
                utils.getChildDeep(this.box_sgin, "label_name").text = "Daily task get";
            }
        }

        /**
         * 获得道具
         */
        getReward() {
            if (this.curSelectName == "beiShi") {
                // 角色皮肤
                PlayerData.getIns().addOwnBackDecoration(this.selectData.id);
                PlayerData.getIns().setCurBackDecoration(this.selectData.id);
            } else if (this.curSelectName == "touShi") {
                // 平台皮肤
                PlayerData.getIns().addOwnHeadDecoration(this.selectData2.id);
                PlayerData.getIns().setCurHeadDecoration(this.selectData2.id);
            }
            this.btnType = 0;
            this.updateBtnStatus();
            this.updateCoin();
            this.list.refresh();
        }

        /**
         * 伸缩相机
         */
        scaleCamera(val, angle) {
            var timeLine = new Laya.TimeLine();
            timeLine.to(this.camera.transform, { localPositionZ: val }, 200).play(0, false);
            timeLine.on(Laya.Event.COMPLETE, this, function () {
                timeLine.pause();
                timeLine.destroy();
            });
            // var timeLine2 = new Laya.TimeLine();
            // timeLine2.to(this.curModel.transform, { localRotationEulerY: angle }, 200).play(0, false);
            // timeLine2.on(Laya.Event.COMPLETE, this, function () {
            //     timeLine2.pause();
            //     timeLine2.destroy();
            // });
        }

        /**
         * 播放动画 
         */
        playAni(animName, callback, loop, playbackRate, crossTime) {
            if (!this.curModel) return;
            let sprite3d = this.curModel.getChildAt(0);
            let animator = sprite3d.getComponent(Laya.Animator);
            if (animator) {
                if (crossTime) {
                    animator.crossFade(animName, crossTime, 0, 0);
                } else {
                    animator.play(animName, 0, 0);
                }
                var ani = animator._controllerLayers[0]._statesMap[animName];
                if (!ani.script) {
                    ani.addScript(AnimatorStateScript);
                    ani.script = ani._scripts[0];
                    ani.script.loop = loop || ani._clip.islooping;
                    ani.script.animator = animator;
                    ani.script.animName = animName;
                }
                if (!playbackRate) {
                    playbackRate = 1;
                }
                ani.speed = playbackRate;
                ani.script.setComplete(callback);
                this.curAnim = animator.curAnim = animName;
            } else {
                console.error(this.owner, "动作控制器未加载！");
            }
        }

        doClose() {
            eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_COIN);
            G.BattleScript.role_js.updateRoleModel();
            G.BattleScript.role_js.updateDanceModel();
            super.doClose();
        }

    }

    class TaskUI extends UIBase {

        constructor() {
            super();
            G.Task = this;
        }

        initData() {
            this.updateAddTime();
            this.data = G.MAXTASKREWARD;
        }

        initUI() {
            this.btn_update.visible = false;
            this.updateCoin();
            this.updateEndReward();
            this.list.array = PlayerData.getIns().getTaskConfig();
            // updateManager.timeLoop(1, this, this.updateTime);
            if (this.argObj && this.argObj.startFun) {
                this.argObj.startFun();
            }
        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_close, this, this.doClose);
            // 更新任务
            utils.onBtnScaleEvent(this.btn_update, this, function () {
                if (uleeSDK) {
                    uleeSDK.getIns.showVideoAD(
                        function () {
                            PlayerData.getIns().setTaskConfig(2005, 1, false);
                            PlayerData.getIns().initInGameTime();
                            PlayerData.getIns().setInGameTime();
                            PlayerData.getIns().setTaskAllComplete(false);
                            PlayerData.getIns().setIsGetTask(false);
                            PlayerData.getIns().initTaskCompleteNum();
                            PlayerData.getIns().updateTaskConfig();
                            self.btn_update.visible = false;
                            self.img_allin.disabled = false;
                            self.list.array = PlayerData.getIns().getTaskConfig();
                            self.updateEndReward();
                        },
                        function () { }
                    );
                } else {
                    PlayerData.getIns().initInGameTime();
                    PlayerData.getIns().setInGameTime();
                    PlayerData.getIns().setTaskAllComplete(false);
                    PlayerData.getIns().setIsGetTask(false);
                    PlayerData.getIns().initTaskCompleteNum();
                    PlayerData.getIns().updateTaskConfig();
                    this.btn_update.visible = false;
                    this.img_allin.disabled = false;
                    this.list.array = PlayerData.getIns().getTaskConfig();
                    this.updateEndReward();
                }
            });
            utils.listHandler(this.list, this,
                function (cell, index) {
                    let data = cell._dataSource;
                    var taskConfig = D.taskConfig[data.id];
                    var txt = utils.getChildDeep(cell, "label_txt");
                    var bar = utils.getChildDeep(cell, "img_bar");
                    var barNum = utils.getChildDeep(cell, "label_bar_num");
                    var coinNum = utils.getChildDeep(cell, "label_coin_num");
                    var get = utils.getChildDeep(cell, "btn_get");
                    var getAd = utils.getChildDeep(cell, "btn_get_ad");
                    var gou = utils.getChildDeep(cell, "img_gou");
                    txt.text = taskConfig.content;
                    bar.width = data.num / taskConfig.maxNum * 250;
                    barNum.text = data.num + "/" + taskConfig.maxNum;
                    coinNum.text = "x" + taskConfig.gold;
                    get.visible = false;
                    getAd.visible = false;
                    gou.visible = false;
                    if (data.num >= taskConfig.maxNum && !data.isGet) {
                        bar.width = 250;
                        get.visible = true;
                    } else if (data.isGet) {
                        bar.width = 250;
                        gou.visible = true;
                    } else {
                        getAd.visible = true;
                    }
                    // 领取
                    get.offAll();
                    getAd.offAll();
                    utils.onBtnScaleEvent(get, this, function (e) {
                        PlayerData.getIns().setTaskConfig(data.id, taskConfig.maxNum, true);
                        PlayerData.getIns().addDiamond(taskConfig.gold);
                        PlayerData.getIns().setTaskCompleteGetNum();
                        this.list.array = PlayerData.getIns().getTaskConfig();
                        this.allComplete();
                        this.updateEndReward();
                        utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                            self.updateCoin();
                        });
                    });
                    // 视频领取
                    utils.onBtnScaleEvent(getAd, this, function (e) {
                        if (uleeSDK) {
                            uleeSDK.getIns.showVideoAD(
                                function () {
                                    // 添加任务
                                    PlayerData.getIns().setTaskConfig(2005, 1, false);
                                    PlayerData.getIns().setTaskConfig(data.id, taskConfig.maxNum, true);
                                    PlayerData.getIns().addDiamond(taskConfig.gold);
                                    PlayerData.getIns().setTaskCompleteGetNum();
                                    self.list.array = PlayerData.getIns().getTaskConfig();
                                    self.allComplete();
                                    self.updateEndReward();
                                    utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                                        self.updateCoin();
                                    });
                                },
                                function () { }
                            );
                        } else {
                            PlayerData.getIns().setTaskConfig(data.id, taskConfig.maxNum, true);
                            PlayerData.getIns().addDiamond(taskConfig.gold);
                            PlayerData.getIns().setTaskCompleteGetNum();
                            this.list.array = PlayerData.getIns().getTaskConfig();
                            this.allComplete();
                            this.updateEndReward();
                            utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                                self.updateCoin();
                            });
                        }
                    });
                },
                function (index) { }
            );
        }

        /**
         * 更新金币
         */
        updateCoin() {
            if (this.box_coin && this.box_coin._children) {
                utils.getChildDeep(this.box_coin, "label_num").text = PlayerData.getIns().diamond;
            }
        }

        /**
         * 刷新时间
         */
        updateTime() {
            // 计算剩余时间
            // 设置零点时间
            var time1 = new Date();
            time1.setHours(0, 0, 0, 0);
            var time2 = new Date();
            var remainingTime = (24 * 3600 * 1000 - (time2.getTime() - time1.getTime())) / 1000;
            var value = utils.formatSeconds(remainingTime);
            if (value) {
                utils.getChildDeep(this.img_time, "label_num").text = value;
            } else {
                utils.getChildDeep(this.img_time, "label_num").text = "00:00:00";
                PlayerData.getIns().setIsUpdateTask(true);
                PlayerData.getIns().setTaskAllComplete(false);
                PlayerData.getIns().setTaskCompleteGetNum();
                PlayerData.getIns().updateTaskConfig();
                this.list.array = PlayerData.getIns().getTaskConfig();
                this.updateEndReward();
            }
        }

        /**
         * 刷新最终奖励
         */
        updateEndReward() {
            var self = this;
            var bar = utils.getChildDeep(this.img_allin, "img_bar");
            var barNum = utils.getChildDeep(this.img_allin, "label_bar_num");
            var icon = utils.getChildDeep(this.img_allin, "img_icon");
            var num = utils.getChildDeep(this.img_allin, "label_num");
            bar.width = PlayerData.getIns().taskCompleteGetNum / G.MAXTASKREWARD.completeTotalNum * 175;
            barNum.text = PlayerData.getIns().taskCompleteGetNum + "/" + G.MAXTASKREWARD.completeTotalNum;
            num.visible = false;
            if (this.data.rewardId) {
                // 物品奖励
                var data = D.roleConfig[this.data.rewardId];
                icon.skin = data.head;
            } else {
                icon.skin = this.data.icon;
                num.text = "x" + this.data.num;
                num.visible = true;
            }
            if (PlayerData.getIns().taskCompleteGetNum > G.MAXTASKREWARD.completeTotalNum) {
                this.img_allin.disabled = true;
                barNum.text = PlayerData.getIns().taskCompleteGetNum + "/" + G.MAXTASKREWARD.completeTotalNum;
            }
            if (PlayerData.getIns().isGetTask) {
                this.img_allin.disabled = true;
                this.btn_update.visible = true;
            }
            this.img_allin.offAll();
            utils.onBtnScaleEvent(this.img_allin, this, function (e) {
                if (!PlayerData.getIns().taskAllComplete) {
                    utils.prompt("Unable to get");
                    return;
                }
                if (PlayerData.getIns().taskCompleteGetNum < G.MAXTASKREWARD.completeTotalNum) {
                    utils.prompt("Get it only after completing 3 times");
                    return;
                }
                if (this.data.rewardId) {
                    // 物品
                    var rewardData = D.roleConfig[this.data.rewardId];
                    if (rewardData.type == 1) {
                        PlayerData.getIns().addOwnRoleSkin(this.data.rewardId);
                        PlayerData.getIns().setRoleSkin(this.data.rewardId);
                    } else if (rewardData.type == 2) {
                        PlayerData.getIns().addOwnIceSkin(this.data.rewardId);
                        PlayerData.getIns().setIceSkin(this.data.rewardId);
                    }
                    // 奖励界面
                    uiManager.openUI("game/RewardView.scene", null, { title: "Reward", num: 0, id: rewardData.id });
                } else {
                    // 金币
                    PlayerData.getIns().addDiamond(this.data.num);
                    utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                        self.updateCoin();
                    });
                }
                PlayerData.getIns().setIsGetTask(true);
                this.img_allin.disabled = true;
                this.btn_update.visible = true;
            });
        }

        /**
         * 是否全部完成
         */
        allComplete() {
            var arr = PlayerData.getIns().getTaskConfig();
            for (var i = 0; i < arr.length; i++) {
                if (!arr[i].isGet) {
                    return;
                }
            }
            PlayerData.getIns().setTaskAllComplete(true);
        }

        doClose() {
            eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_DIAMOND);
            eventDispatcher.dispatchEvent(ulee.Event.ON_TASK);
            if (this.argObj && this.argObj.callback) {
                this.argObj.callback();
            }
            super.doClose();
        }


        /**
         * 累计在线
         */
        updateAddTime() {
            var min = 60000;
            // var min2 = 600000;
            if (!PlayerData.getIns().inGameTime) return;
            var mill = Number(new Date().getTime()) - Number(PlayerData.getIns().inGameTime);
            var num = parseInt(mill / min);
            // 每一分钟
            if (num >= 1) {
                // 添加任务
                PlayerData.getIns().setTaskConfig(2004, num, false);
                PlayerData.getIns().initInGameTime();
                PlayerData.getIns().setInGameTime();
            }
        }

    }

    class TryoutUI extends UIBase {

        constructor() {
            super();
        }

        initData() {
            this.dataArr = this.argObj.dataArr;
        }

        initUI() {
            this.newScene = this.box_scene.addChild(new Laya.Scene3D());
            this.camera = cameraUtils.createCamera(new Laya.Vector3(0, 0.5, 2.5), new Laya.Vector3(-15, 0, 0), false);
            var directionLight = new Laya.DirectionLight();
            this.newScene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            this.newScene.addChild(this.camera);

            //创建方向光
            this.directionLight = this.newScene.addChild(new Laya.DirectionLight());
            //设置灯光颜色
            this.directionLight.color = new Laya.Vector3(0.5, 0.5, 0.5);
            //设置灯光方向
            var mat = this.directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-3.0, -5.0, -1.0));
            this.directionLight.transform.worldMatrix = mat;

            this.box_item1.visible = false;
            if (this.dataArr.length == 1) {
                this.box_item1.visible = true;
                this.initItem1();
                this.createRoleModel(this.dataArr[0].id);
            }
            this.ani1.play(0, true);
        }

        initEvent() {
            var self = this;
            utils.onBtnScaleEvent(this.btn_close, this, this.doClose);
        }

        initItem1() {
            var self = this;
            var data = this.dataArr[0];
            var item = utils.getChildDeep(this.box_item1, "img_item1");
            var btn = utils.getChildDeep(this.box_item1, "btn_ad");
            utils.onBtnScaleEvent(btn, this, function () {
                if (uleeSDK) {
                    uleeSDK.getIns.showVideoAD(
                        function () {
                            // 添加任务
                            PlayerData.getIns().setTaskConfig(2005, 1, false);
                            PlayerData.getIns().setTryoutSkin(data.id);
                            self.doClose();
                        },
                        function () { }
                    );
                } else {
                    PlayerData.getIns().setTryoutSkin(data.id);
                    this.doClose();
                }
            });
        }

        /**
         * 创建角色
         */
        createRoleModel(id) {
            var self = this;
            var roleConfig = D.roleConfig[id];
            ModelCfg.getIns().getModelById(10001, function (model) {
                self.newScene.addChild(model);
                self.curModel = model;
                self.playAni("idle", null, true);
                // 呼啦圈 
                ModelCfg.getIns().getModelById(10000, function (hulaModel) {
                    var hulaNode = utils.getChildDeep(model, "hulaquan_001");
                    hulaNode.addChild(hulaModel);
                    ModelCfg.getIns().setMaterialPic(hulaModel, "res/texture/red.png");
                });
                // 背饰
                var backNode = utils.getChildDeep(model, "Bip001 Spine2");
                if (self.dataArr[0].type == 1) {
                    ModelCfg.getIns().getModelById(self.dataArr[0].modelid, function (m) {
                        backNode.addChild(m);
                    });
                }
                // 头饰
                var headNode = utils.getChildDeep(model, "Bip001 Head");
                if (self.dataArr[0].type == 2) {
                    ModelCfg.getIns().getModelById(self.dataArr[0].modelid, function (m) {
                        headNode.addChild(m);
                    });
                }
            });
        }

        /**
         * 播放动画 
         */
        playAni(animName, callback, loop, playbackRate, crossTime) {
            if (!this.curModel) return;
            let sprite3d = this.curModel.getChildAt(0);
            let animator = sprite3d.getComponent(Laya.Animator);
            if (animator) {
                if (crossTime) {
                    animator.crossFade(animName, crossTime, 0, 0);
                } else {
                    animator.play(animName, 0, 0);
                }
                var ani = animator._controllerLayers[0]._statesMap[animName];
                if (!ani.script) {
                    ani.addScript(AnimatorStateScript);
                    ani.script = ani._scripts[0];
                    ani.script.loop = loop || ani._clip.islooping;
                    ani.script.animator = animator;
                    ani.script.animName = animName;
                }
                if (!playbackRate) {
                    playbackRate = 1;
                }
                ani.speed = playbackRate;
                ani.script.setComplete(callback);
                this.curAnim = animator.curAnim = animName;
            } else {
                console.error(this.owner, "动作控制器未加载！");
            }
        }

        doClose() {
            G.BattleScript.role_js.updateRoleModel();
            G.BattleScript.role_js.updateDanceModel();
            if (this.argObj && this.argObj.callback) {
                this.argObj.callback();
            }
            super.doClose();
        }

    }

    class VictoryUI extends UIBase {

        constructor() {
            super();
        }

        initData() {
            this.times = 0;
            this.click = false;
        }

        initUI() {
            this.coin = this.argObj.num - 1;
            this.label_coin.text = "+" + this.coin;
            if (this.coin == 0) {
                this.times = 3;
                this.box_move.visible = false;
                this.btn_stop.visible = false;
            } else {
                this.box_btns.visible = false;
            }
            this.ani1.play(0, true);
        }

        initEvent() {
            var self = this;
            // 多倍
            utils.onBtnScaleEvent(this.btn_ad, this, function (e) {
                // if (this.click) return;
                // this.click = true;
                if (uleeSDK) {
                    uleeSDK.getIns.showVideoAD(
                        function () {
                            PlayerData.getIns().setTaskConfig(2005, 1, false);
                            PlayerData.getIns().addDiamond(self.coin * self.times);
                            utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                                self.nextRound();
                            });
                        },
                        function () {
                            // this.click = false;
                        }
                    );
                } else {
                    PlayerData.getIns().addDiamond(this.coin * this.times);
                    utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                        self.nextRound();
                    });
                    // this.click = false;
                }
            });
            // 下一关
            utils.onBtnScaleEvent(this.btn_next, this, function (e) {
                if (this.click) return;
                this.click = true;
                PlayerData.getIns().addDiamond(this.coin);
                utils.createCoinAnim({ x: e.stageX, y: e.stageY }, G.COINMOVEENDPOS, function () {
                    self.nextRound();
                });
            });
            // 停止
            utils.onBtnScaleEvent(this.btn_stop, this, function () {
                this.btn_stop.visible = false;
                updateManager.timeOnce(0.3, this, function () {
                    self.pauseAnim();
                    var timeLine = new Laya.TimeLine();
                    timeLine.to(this.box_move, {}, 500)
                        .to(this.box_move, { scaleX: 0, scaleY: 0 }, 200)
                        .play(0, false);
                    timeLine.on(Laya.Event.COMPLETE, this, function () {
                        var txt = new Laya.Label("x" + this.times);
                        Laya.stage.addChild(txt);
                        txt.fontSize = 150;
                        txt.font = "SimHei";
                        txt.bold = true;
                        txt.color = "#fff";
                        txt.anchorX = 0.5;
                        txt.anchorY = 0.5;
                        txt.x = this.box_move.x;
                        txt.y = this.box_move.y;
                        txt.scaleX = 0;
                        txt.scaleY = 0;
                        var timeLine = new Laya.TimeLine();
                        timeLine.to(txt, { scaleX: 2, scaleY: 2 }, 300)
                            .to(txt, { scaleX: 1, scaleY: 1 }, 200)
                            .to(txt, {}, 500)
                            .to(txt, { alpha: 0 }, 200)
                            .play(0, false);
                        timeLine.on(Laya.Event.COMPLETE, this, function () {
                            utils.getChildDeep(this.btn_ad, "label_txt").text = "Reward x" + this.times;
                            this.box_btns.visible = true;
                            this.btn_stop.visible = false;
                            this.box_move.visible = false;
                        });
                    });
                });
            });
        }

        /**
         * 下一关
         */
        nextRound() {
            eventDispatcher.dispatchEvent(ulee.Event.ON_CHANGE_DIAMOND);
            eventDispatcher.dispatchEvent(ulee.Event.ON_TASK);
            PlayerData.getIns().setTaskConfig(2002, 1, false);
            PlayerData.getIns().addCurLv();
            PlayerData.getIns().levelup();
            battleMgr.startGame();
            G.Main.updateUI();
            G.Main.updateLv();
            this.doClose();
        }

        /**
         * 暂停动画
         */
        pauseAnim() {
            this.ani1.stop();
            var x = this.img_arrow.x;
            if (x < 111) {
                this.times = 2;
            } else if (x >= 111 && x < 187) {
                this.times = 4;
            } else if (x >= 187 && x < 236) {
                this.times = 8;
            } else if (x >= 236 && x < 311) {
                this.times = 4;
            } else if (x >= 311) {
                this.times = 2;
            }
        }

        doClose() {
            PlayerData.getIns().setTryoutSkin(0);
            if (this.argObj && this.argObj.callback) {
                this.argObj.callback();
            }
            if (uleeSDK) {
                uleeSDK.getIns.showInterstitial();
            }
            super.doClose();
        }

    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

    class GameConfig {
        static init() {
            //注册Script或者Runtime引用
            let reg = Laya.ClassUtils.regClass;
    		reg("script/ui/DefeatUI.js",DefeatUI);
    		reg("script/GameLoading.js",GameLoading);
    		reg("script/MainUI.js",MainUI);
    		reg("script/battle/BattleScript.js",BattleScript);
    		reg("script/ui/RewardUI.js",RewardUI);
    		reg("script/ui/SginUI.js",SginUI);
    		reg("script/ui/ShopUI.js",ShopUI);
    		reg("script/ui/TaskUI.js",TaskUI);
    		reg("script/ui/TryoutUI.js",TryoutUI);
    		reg("script/ui/VictoryUI.js",VictoryUI);
        }
    }
    GameConfig.width = 720;
    GameConfig.height = 1559;
    GameConfig.scaleMode ="showall";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "game/LoadingView.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;

    GameConfig.init();

    /**
     * Created by Administrator on 2019/11/25.
     * 包装
     */
    window.ulee = {};
    ulee.io = {};
    //全局变量包
    window.G = {};
    window.D = {};
    window.Vector3 = Laya.Vector3;
    window.Pool = Laya.Pool;
    window.Handler = Laya.Handler;

    /**
     * Created by Administrator on 2019/11/25.
     * Describe : 配置文件
     */
    G.VERSION = 1.0;    //版本号

    G.DEBUG = false;    //是否在测试

    G.ONLINE = false;    //是否联机

    G.PRINT_CLICK = false;   //是否打印点击的控件

    G.LOAD_DATA_JS = true; //是否读取js数据文件

    G.setDebugMode = function () {
        G.PRINT_CLICK = true;
        G.DEBUG = true;
        Laya.Stat.show(0, 0);
    };

    /**
     * Created by Administrator on 2018/2/23 0023.
     * 常量 以及 一些原生方法重写或增加
     */
    (function () {
        //计时器类型
        G.ENUM_LOOP_TYPE = {
            FRAME: 0,//帧循环
            TIME: 1//时间循环
        };

        G.FRAME_INTERVAL = 0;   //帧时间

        G.NOW = Laya.Browser.now();
        G.DELAYTIME = null; //通讯延迟
        G.ADGUSTTIME = null;//服务器校准差值
        G.SERVER_FRAMETIME = null;//服务器帧时间

        //================ 数学常量 =================
        Math.RAD_1_ANGLE = Math.PI / 180;   // 1角度对应的弧度
        Math.ANGLE_1_RAD = 180 / Math.PI;   // 1弧度对应的角度

        //================ 屏幕模式 =================
        G.SCREEN_MODETYPE = { H: 0, V: 1 }; //横屏H， 竖屏V
        G.SCREEN_MODE = G.SCREEN_MODETYPE.V;//默认竖屏

        //服务器地址
        G.LOGIN_URL = "http://192.168.1.12:8080/bikeServer";
        // G.LOGIN_URL = "https://ulee.net.cn/bikeServer";

        //平台
        G.SDKTYPE = null;
        G.ShareLimitTime = 2000;

        // 路段总长度
        G.TOTALLENGTH = 0;

        //最大关卡
        G.MAXLV = 32;

        // 道具前面距离
        G.PROPFRONT_D =
        // 道具后面距离
        G.PROafter_D =

            // 最大任务奖励
            G.MAXTASKREWARD = {
                icon: "common/img_icon.png",
                num: 1000,
                completeTotalNum: 3,
                rewardId: 0
            };

        // 金币动画移动终点位置
        G.COINMOVEENDPOS = new Laya.Vector2();

        // 完成加载
        G.COMPLETELOAD = false;
        // 特效完成加载
        G.EFFECTCOMPLETELOAD = false;
        // 观众完成加载
        G.VIEWERCOMPLETELOAD = false;

        // 背景音乐序号
        G.BGMUSICINDEX = 0;

        //游戏状态枚举
        G.GAME_STEP = {
            READY: 0,
            OPENROOM: 1,
            HEROGO: 2,
            HEROSHOOT: 3,
            GAMEOVER: 4
        };
        //角色状态枚举
        G.ROLE_STEP = {
            READY: 0,
            RUN: 1,
            READYSHOT: 2,
            SHOT: 3,
            READYSHOT: 4
        };


        /**
         * 扩展增加原生数组压入数组方法
         * @param items
         */
        Array.prototype.pushAll = function (items) {
            if (!items)
                return;

            if (!(items instanceof Array))
                throw new error("参数items必须为数组类型");

            for (var i = 0; i < items.length; i++) {
                this.push(items[i]);
            }
        };

        /**
         * 扩展增加原生数组指定位置插入方法
         * @param index
         * @param item
         */
        Array.prototype.insert = function (index, item) {
            this.splice(index, 0, item);
        };

        /**
         * 扩展增加原生数组删除方法
         * @param item
         */
        Array.prototype.remove = function (item) {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this[i] == item) {
                    this.splice(i, 1);
                }
            }
        };

        /**
         * 扩展增加原生数组删除方法
         * @param index
         */
        Array.prototype.removeAt = function (index) {
            var item = this[index];
            this.splice(index, 1);
            return item;
        };

        /**
         * 扩展增加原生数组清空所有数据方法
         */
        Array.prototype.removeAll = function () {
            // this.splice(0, this.length);
            this.length = 0;
        };

        /**
         * 扩展增加原生数组是否包含某个元素
         * @param item
         */
        Array.prototype.contains = function (item) {
            return this.indexOf(item) != -1;
        };

        /**
         * 扩展增加原生数组读取最后一个元素方法
         */
        Array.prototype.last = function () {
            return this[this.length - 1];
        };
        /**
         * 销毁数组对象
         */
        Array.prototype.disposeArray = function () {
            if (!this || this.length == 0) return;
            for (var i = this.length - 1; i >= 0; i--) {
                this[i].dispose();
            }
            this.removeAll();
        };

        /**
         * 扩展增加原生数组 是否为空
         */
        Array.prototype.isEmpty = function () {
            return this.length == 0;
        };

        /**
         * 克隆对象 或者数组
         * @param obj
         * @returns {*}
         */
        G.clone = function (obj) {
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0; i < obj.length; ++i) {
                    copy[i] = G.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = G.clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        };

        /**
         * 扩展增加原生时间格式化 newDate.format('yyyy-MM-dd h:m:s')
         */
        Date.prototype.format = function (format) {
            var date = {
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S+": this.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (var k in date) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1
                        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                }
            }
            return format;
        };

        /**
         * 判断字符串是否以某个字符串开头
         * @param str
         * @returns {boolean}
         */
        String.prototype.startWith = function (str) {
            var key = "^" + str;
            var reg = Pool.getItem(key, RegExp);
            if (reg == null)
                reg = new RegExp(key);
            var result = reg.test(this);
            Pool.recover(key, reg);
            return result;
        };

        String.prototype.endWith = function (str) {
            var key = str + "$";
            var reg = Pool.getItem(key, RegExp);
            if (reg == null)
                reg = new RegExp(key);
            var result = reg.test(this);
            Pool.recover(key, reg);
            return result;
        };

        /**
         * 替换所有指定字符串
         * @param oldVal
         * @param newVal
         * @returns {string}
         */
        String.prototype.replaceAll = function (oldVal, newVal) {
            return this.split(oldVal).join(newVal);
        };

        /*********************图片资源管理***************************/
        //通用资源不管理
        G.resManager = { "img": {} };
        /**
         * 资源引用次数递减，再界面被移除时候使用
         * @param resArray 界面中的this.resArray
         */
        G.delResCount = function (resArray) {
            if (resArray) {
                var resManager = G.resManager["img"];
                for (var i = 0; i < resArray.length; i++) {
                    var url = resArray[i].url;
                    resManager[url] -= 1;
                    if (resManager[url] == 0) {
                        G.clearRes(url);
                    }
                }
            }
        };
        // 销毁资源
        G.clearRes = function (url) {
            // 两种方式都使用,防止引擎修改
            Laya.loader.clearRes(url);
            url = laya.net.URL.formatURL(url);
            Laya.loader.clearRes(url);
        };
        G.addResCount = function (type, url) {
            var resManager = G.resManager[type];
            if (resManager[url]) {
                resManager[url] += 1;
            } else {
                resManager[url] = 1;
            }
        };

        //复制对象
        G.copyProperties = function (src, dest) {
            for (var key in src) {
                dest[key] = src[key];
            }
        };

        //获取对象长度
        G.getLength = function (map) {
            var count = 0;
            for (var k in map) {
                count++;
            }
            return count;
        };

        // 设置默认字体
        // var Browser = Laya.Browser;
        // if (Browser.onIOS || Browser.onIPad || Browser.onIPhone || Browser.onSafari) {
        //     Laya.Font.defaultFamily = "黑体-简,sans-serif";
        //     Laya.Font.defaultFont = "12px 黑体-简,sans-serif";
        // } else {
        //     Laya.Font.defaultFamily = "黑体";
        //     Laya.Font.defaultFont = "12px 黑体";
        // }

        Laya.Loader.cacheRes = function (url, data) {
            url = Laya.URL.formatURL(url);
            if (!Laya.Loader.loadedMap[url] != null) {
                Laya.Loader.loadedMap[url] = data;
            }
        };
    })();

    (function () {
    D={};
    D.properties={};
    D.carConfig = {
    "1":[10001,10002,10003,"res/obj_texture/xiaohuang.jpg",1,0],
    "2":[10001,10002,10003,"res/obj_texture/red.jpg",1,500],
    "3":[10001,10002,10003,"res/obj_texture/green.jpg",1,500],
    "4":[10001,10002,10003,"res/obj_texture/blue.jpg",1,500],
    "5":[10001,10002,10003,"res/obj_texture/purple.jpg",1,500],
    "6":[10010,10002,10009,"res/obj_texture/dahuangture.jpg",1,1000],
    "7":[10012,10002,10011,"res/obj_texture/miluture.jpg",1,1000],
    "8":[10014,10002,10013,"res/obj_texture/tuzi_ture.jpg",1,1000],
    };
    D.properties["carConfig"]=["carid","headModel","bodyModel","endModel","picture","lv","prive",];
    D.lvConfig = {
    "1":["公路新秀-C证",100,"common/img_lv_1.png",0],
    "2":["马路杀手-C证",150,"common/img_lv_2.png",0],
    "3":["合格司机-B证",400,"common/img_lv_3.png",0],
    "4":["赛场老司机-B证",600,"common/img_lv_3.png",0],
    "5":["秋名山车神-A证",999999,"common/img_lv_3.png",0],
    };
    D.properties["lvConfig"]=["id","name","nextExp","icon","aicd",];
    D.randomName = {
    "1":["666"],
    "10":["18呀"],
    "100":["ikejsjxz"],
    "101":["ilmail"],
    "102":["Iloveyou"],
    "103":["Ilove薛哲"],
    "104":["IWantto"],
    "105":["i神箭手"],
    "106":["Jack"],
    "107":["j侦探"],
    "108":["karry慧"],
    "109":["Kevin"],
    "11":["1qlxy"],
    "110":["king"],
    "111":["kingcarb妮"],
    "112":["kiss-乂"],
    "113":["KUKU焱晓宝"],
    "114":["kuuga"],
    "115":["LadyMr"],
    "116":["legendos"],
    "117":["lemon"],
    "118":["LHJ"],
    "119":["lian"],
    "12":["24k纯帅吕张羿"],
    "120":["LiaNg冰"],
    "121":["lily"],
    "122":["lims龙叔"],
    "123":["miss雨霁"],
    "124":["mj墨羽"],
    "125":["MK_02"],
    "126":["ML3"],
    "127":["mmc"],
    "128":["mmmm"],
    "129":["Mr丶Liu"],
    "13":["321打打打"],
    "130":["Mr老鸨"],
    "131":["MuYu"],
    "132":["mu墨昔"],
    "133":["MVS剑圣"],
    "134":["Myste2y"],
    "135":["mzhn"],
    "136":["M记小烧肉"],
    "137":["M离颜L小仙女Y"],
    "138":["M鹿M"],
    "139":["Neku"],
    "14":["36D"],
    "140":["N爱C"],
    "141":["N大雄"],
    "142":["OK嘚吧嘚"],
    "143":["olboys"],
    "144":["Only"],
    "145":["ony丶慕春"],
    "146":["oO谷幽幽Oo"],
    "147":["Oo剑仙oO"],
    "148":["oO泡泡Oo"],
    "149":["oO小飞Oo"],
    "15":["36E"],
    "150":["O嫣然一笑O"],
    "151":["pailr"],
    "152":["Pay"],
    "153":["Prelude"],
    "154":["QAD"],
    "155":["QAQ妹纸"],
    "156":["QQ小可爱"],
    "157":["Queen"],
    "158":["Quella秋"],
    "159":["Rain沐槿"],
    "16":["4号少年是光"],
    "160":["Re赵子龙"],
    "161":["shy"],
    "162":["Sky天辰月"],
    "163":["smhfg"],
    "164":["Smile"],
    "165":["Snowman"],
    "166":["sociac社会"],
    "167":["Soga"],
    "168":["Sywen丶陌路"],
    "169":["S日天昊"],
    "17":["54青丘白浅"],
    "170":["S银河奥特曼S"],
    "171":["TF团遍凯茜茜"],
    "172":["TheLost"],
    "173":["Thienkim"],
    "174":["Time"],
    "175":["TING"],
    "176":["tjy"],
    "177":["TM666"],
    "178":["TN我最帅"],
    "179":["tony盖"],
    "18":["5ge"],
    "180":["tosp萧枭"],
    "181":["yyqx柠檬汁"],
    "182":["yzw"],
    "183":["YZZ丶太浪"],
    "184":["y大神"],
    "185":["zxd剑仙"],
    "186":["Z丶蓝颜"],
    "187":["阿阿阿阿芯"],
    "188":["爱以之恋"],
    "189":["爱亦或不爱"],
    "19":["666之神男"],
    "190":["爱翊萱"],
    "191":["爱游泳的羊"],
    "192":["爱咋滴咋地"],
    "193":["黯淡De星辰"],
    "194":["黯然销魂"],
    "195":["敖冰雪"],
    "196":["嗷嗷嗷"],
    "197":["傲娇的小伟欧巴"],
    "198":["傲游江湖"],
    "199":["奥露拉"],
    "2":["6666666"],
    "20":["7SENSES"],
    "200":["奥斯卡"],
    "201":["奥特曼"],
    "202":["八级大狂疯丶"],
    "203":["八颗牙牙"],
    "204":["八千里路云和月"],
    "205":["巴拉拉能量"],
    "206":["巴斯光年"],
    "207":["把啦啦啦"],
    "208":["爸爸在此"],
    "209":["这位老铁"],
    "21":["80後的呼唤"],
    "210":["珍珠公主"],
    "211":["真实伤害"],
    "212":["真是奇怪"],
    "213":["真馨真意怡"],
    "214":["昨夜星辰"],
    "215":["作弊专家"],
    "216":["作死抠门大嘴巴"],
    "217":["坐山观虎斗"],
    "218":["坐拥一片江山"],
    "22":["940夏曦"],
    "23":["9bark"],
    "24":["AD32"],
    "25":["Adam"],
    "26":["Ailus"],
    "27":["aimer"],
    "28":["Ai琼宝宝"],
    "29":["Angela宝贝"],
    "3":["0赫兹的鲸"],
    "30":["Angela丶唯一"],
    "31":["Angle丶妲己"],
    "32":["Anin"],
    "33":["Ann"],
    "34":["Anne"],
    "35":["Aomr心诺相依R"],
    "36":["Ares丶聖"],
    "37":["Ashelly"],
    "38":["ASYASJ"],
    "39":["axian"],
    "4":["1168i"],
    "40":["Aying"],
    "41":["A十年"],
    "42":["A小怪兽"],
    "43":["baby"],
    "44":["Baby珩"],
    "45":["Baby狼"],
    "46":["Bang灬真会玩"],
    "47":["Beautifulgoddes"],
    "48":["beloved"],
    "49":["bitter"],
    "5":["1234女"],
    "50":["BIUE蝴蝶梦"],
    "51":["Blane"],
    "52":["boom瞎嘎拉嘎"],
    "53":["Boooooooooooooos"],
    "54":["boos"],
    "55":["BOSS_Ht"],
    "56":["bqsg"],
    "57":["bye小呆"],
    "58":["b突石审豆"],
    "59":["Cannoy"],
    "6":["13丶"],
    "60":["Carey"],
    "61":["CCCC酱"],
    "62":["ccyy"],
    "63":["CC丶淚"],
    "64":["CDHLH"],
    "65":["cel飞"],
    "66":["chen123321"],
    "67":["Chengsan"],
    "68":["Chen丶阳阳"],
    "69":["China_小柒"],
    "7":["147万大军"],
    "70":["China太白"],
    "71":["chunqing"],
    "72":["CKL"],
    "73":["Claye"],
    "74":["cl书生"],
    "75":["CN制作者"],
    "76":["COCO"],
    "77":["cute"],
    "78":["Cuy深情"],
    "79":["God丶晨"],
    "8":["14丶"],
    "80":["God丶剑晓"],
    "81":["God丶慯"],
    "82":["goodBoy"],
    "83":["Gothic丶"],
    "84":["gsx20"],
    "85":["gun"],
    "86":["guohaijuan"],
    "87":["GZ丶小公主"],
    "88":["Helen"],
    "89":["HFfeng"],
    "9":["179的小情"],
    "90":["HG丶月殇"],
    "91":["hhvfdgng"],
    "92":["hjx韩"],
    "93":["hmn"],
    "94":["Honey"],
    "95":["Humanskeleton"],
    "96":["HXF"],
    "97":["H-xo"],
    "98":["H坏N男H孩"],
    "99":["idiot"],
    };
    D.properties["randomName"]=["id","name",];
    D.PrefabsPath = {
    "10000":[2,"model/Conventional/hulaquan",1,["0"]],
    "10001":[2,"model/Conventional/role1",1,["0"]],
    "10002":[2,"model/Conventional/role3",1,["0"]],
    "10003":[2,"sceneModel/Conventional/floor_10003",1,["0"]],
    "10004":[2,"model2/Conventional/viewer",1,["0"]],
    "30001":[2,"sceneModel/Conventional/circular_30001",1,["0"]],
    "30002":[2,"sceneModel/Conventional/column_30002",1,["0"]],
    "30003":[2,"sceneModel/Conventional/Deceleration_30003",1,["0"]],
    "30004":[2,"sceneModel/Conventional/door2_30004",1,["0"]],
    "30005":[2,"sceneModel/Conventional/door3_30005",1,["0"]],
    "30006":[2,"sceneModel/Conventional/end_30006",1,["0"]],
    "30007":[2,"sceneModel/Conventional/hoop_30007",1,["0"]],
    "30008":[2,"sceneModel/Conventional/parallel_30008",1,["0"]],
    "30009":[2,"sceneModel/Conventional/rotate_30009",1,["0"]],
    "30010":[2,"sceneModel/Conventional/rotation_30010",1,["0"]],
    "30011":[2,"sceneModel/Conventional/swing_30011",1,["0"]],
    "30012":[2,"sceneModel/Conventional/translation_30012",1,["0"]],
    "30013":[2,"sceneModel/Conventional/cylinder_30013",1,["0"]],
    "30014":[2,"sceneModel/Conventional/rainbow_30014",1,["0"]],
    "30015":[2,"sceneModel/Conventional/barrier_30015",1,["0"]],
    "30016":[2,"sceneModel/Conventional/light_30016",1,["0"]],
    "30017":[2,"sceneModel/Conventional/diamond_30017",1,["0"]],
    "30018":[2,"sceneModel/Conventional/diamond3_30018",1,["0"]],
    "30019":[2,"sceneModel/Conventional/hoop5i_30019",1,["0"]],
    "30020":[2,"sceneModel/Conventional/hoop4v_30020",1,["0"]],
    "30021":[2,"sceneModel/Conventional/hoop5ti_30021",1,["0"]],
    "30022":[2,"sceneModel/Conventional/diamond5i_30022",1,["0"]],
    "30023":[2,"sceneModel/Conventional/hoop5xie_30023",1,["0"]],
    "30024":[2,"sceneModel/Conventional/hoop4v2_30024",1,["0"]],
    "30025":[2,"sceneModel/Conventional/diamond4v2_30025",1,["0"]],
    "30026":[2,"sceneModel/Conventional/diamond11o_30026",1,["0"]],
    "30027":[2,"sceneModel/Conventional/hoop2i_30027",1,["0"]],
    "30028":[2,"sceneModel/Conventional/hoop7mi_30028",1,["0"]],
    "30029":[2,"sceneModel/Conventional/hoop5v_30029",1,["0"]],
    "30030":[2,"sceneModel/Conventional/hoop4ling_30030",1,["0"]],
    "30031":[2,"sceneModel/Conventional/hoop5v2_30031",1,["0"]],
    "30032":[2,"sceneModel/Conventional/hoop8ze_30032",1,["0"]],
    "30033":[2,"sceneModel/Conventional/hoop5hua_30033",1,["0"]],
    "30034":[2,"sceneModel/Conventional/hoop7hua_30034",1,["0"]],
    "30035":[2,"sceneModel/Conventional/hoop9v_30035",1,["0"]],
    "30036":[2,"sceneModel/Conventional/building_30036",1,["0"]],
    "40001":[2,"level/Conventional/level1",1,["0"]],
    "40002":[2,"level/Conventional/level2",1,["0"]],
    "40003":[2,"level/Conventional/level3",1,["0"]],
    "40004":[2,"level/Conventional/level4",1,["0"]],
    "40005":[2,"level/Conventional/level5",1,["0"]],
    "40006":[2,"level/Conventional/level6",1,["0"]],
    "40007":[2,"level/Conventional/level7",1,["0"]],
    "40008":[2,"level/Conventional/level8",1,["0"]],
    "40009":[2,"level/Conventional/level9",1,["0"]],
    "40010":[2,"level/Conventional/level10",1,["0"]],
    "40011":[2,"level/Conventional/level11",1,["0"]],
    "40012":[2,"level/Conventional/level12",1,["0"]],
    "40013":[2,"level/Conventional/level13",1,["0"]],
    "40014":[2,"level/Conventional/level14",1,["0"]],
    "40015":[2,"level/Conventional/level15",1,["0"]],
    "40016":[2,"level/Conventional/level16",1,["0"]],
    "40017":[2,"level/Conventional/level17",1,["0"]],
    "40018":[2,"level/Conventional/level18",1,["0"]],
    "40019":[2,"level/Conventional/level19",1,["0"]],
    "40020":[2,"level/Conventional/level20",1,["0"]],
    "40021":[2,"level/Conventional/level21",1,["0"]],
    "40022":[2,"level/Conventional/level22",1,["0"]],
    "40023":[2,"level/Conventional/level23",1,["0"]],
    "40024":[2,"level/Conventional/level24",1,["0"]],
    "40025":[2,"level/Conventional/level25",1,["0"]],
    "40026":[2,"level/Conventional/level26",1,["0"]],
    "40027":[2,"level/Conventional/level27",1,["0"]],
    "40028":[2,"level/Conventional/level28",1,["0"]],
    "40029":[2,"level/Conventional/level29",1,["0"]],
    "40030":[2,"level/Conventional/level30",1,["0"]],
    "40031":[2,"level/Conventional/level31",1,["0"]],
    "40032":[2,"level/Conventional/level32",1,["0"]],
    "50001":[2,"effect/Conventional/buff",1,["0"]],
    "50002":[2,"effect/Conventional/caidai",1,["0"]],
    "50003":[2,"effect/Conventional/effect_diamond",1,["0"]],
    "60001":[2,"sceneModel/Conventional/back1",1,["0"]],
    "60002":[2,"sceneModel/Conventional/back2",1,["0"]],
    "60003":[2,"sceneModel/Conventional/back3",1,["0"]],
    "60005":[2,"sceneModel/Conventional/head1",1,["0"]],
    "60006":[2,"sceneModel/Conventional/head2",1,["0"]],
    "60007":[2,"sceneModel/Conventional/head3",1,["0"]],
    "60008":[2,"sceneModel/Conventional/head4",1,["0"]],
    };
    D.properties["PrefabsPath"]=["id","type","chs","scale","pos",];
    D.roleConfig = {
    "1":[1,60001,"0",1,1,"common/shop/back1.png"],
    "2":[1,60002,"0",2,500,"common/shop/back2.png"],
    "3":[1,60003,"0",2,2000,"common/shop/back3.png"],
    "4":[2,60005,"0",1,1,"common/shop/head1.png"],
    "5":[2,60006,"0",2,500,"common/shop/head2.png"],
    "6":[2,60007,"0",2,2000,"common/shop/head3.png"],
    "7":[2,60008,"0",3,,"common/shop/head4.png"],
    };
    D.properties["roleConfig"]=["id","type","modelid","model","source","price","head",];
    D.taskConfig = {
    "2001":["Pick up the 20 diamonds",20,100],
    "2002":["Pass 3 level",3,100],
    "2003":["Get a daily reward",1,100],
    "2004":["Online 10 minutes",10,200],
    "2005":["Watch the video once",1,300],
    "2006":["Pick up 50 hula hoops",50,100],
    };
    D.properties["taskConfig"]=["id","content","maxNum","gold",];
    D.musicBasic = {
    "1":[1,"music/BGM.mp3",100],
    "10":[2,"music/encourage_10.mp3",100],
    "11":[2,"music/encourage_20.mp3",100],
    "12":[2,"music/encourage_30.mp3",100],
    "13":[2,"music/injured_thing.mp3",100],
    "14":[2,"music/lose.mp3",100],
    "15":[2,"music/win.mp3",100],
    "16":[2,"music/getdiamond.mp3",100],
    "17":[2,"music/barrier.mp3",100],
    "18":[1,"music/BGM.mp3",100],
    "19":[1,"music/BGM.mp3",100],
    "2":[1,"music/main.mp3",100],
    "20":[2,"music/miss.mp3",100],
    "21":[2,"music/pace.mp3",100],
    "3":[2,"music/cheer.mp3",100],
    "4":[2,"music/click.mp3",100],
    "5":[2,"music/diamond.mp3",100],
    "6":[2,"music/diamond2.mp3",100],
    "7":[2,"music/gethoop_10.mp3",100],
    "8":[2,"music/gethoop_20.mp3",100],
    "9":[2,"music/gethoop_30.mp3",100],
    };
    D.properties["musicBasic"]=["ID","type","file","musicPower",];
    })();
    /*
     *@crc chs CHN C-车辆表.xlsx=carConfig,e216f2cc
     *@crc chs CHN D-等级表.xlsx=lvConfig,9008f5e8
     *@crc chs CHN J-机器人名字库.xlsx=randomName,a179a666
     *@crc chs CHN M-模型特效表.xlsx=PrefabsPath,1da150d4
     *@crc chs CHN P-皮肤表.xlsx=roleConfig,4fea5396
     *@crc chs CHN R-任务表.xlsx=taskConfig,ff350540
     *@crc chs CHN Y-音乐音效表.xlsx=musicBasic,fdfc5d70
     */

    /**
     * Created by Administrator on 2018/2/23 0023.
     */
    (function () {
        ulee.Utils = function () {
            this._pool = Laya.Pool;

        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.Utils, "ulee.Utils");
        var _proto = ulee.Utils.prototype;

        _proto.getColor = function (index) {
            return this.colorConfig[index];
        };

        /**按键注册事件 */
        _proto.onBtnEvent = function (node, caller, callback) {
            if (node == undefined) {
                console.log("控件不存在");
            }
            node.offAll();
            node.on(Laya.Event.MOUSE_DOWN, caller, function (e) {
                e.stopPropagation();
            });
            node.on(Laya.Event.ROLL_OUT, caller, function (e) {
                e.stopPropagation();
            });
            node.on(Laya.Event.MOUSE_UP, caller, function (e) {
                e.stopPropagation();
            });
            node.on(Laya.Event.CLICK, caller, function (e) {
                if (callback != undefined) {
                    callback.bind(caller)(e);
                }
                if (e.stopPropagation != undefined) {
                    e.stopPropagation();
                }
            });
        };
        _proto.offBtnEvent = function (node, caller, callback) {
            if (node == undefined) {
                console.log("控件不存在");
            }
            node.off(Event.CLICK, caller, callback);
        };

        /**按键注册事件(放大) */
        _proto.onBtnScaleEvent = function (node, caller, callback, touchThrough) {
            if (node == undefined) {
                console.log("控件不存在");
            }
            var bkScaleX = node.scaleX ? node.scaleX : 1;
            var bkScaleY = node.scaleY ? node.scaleY : 1;
            node.offAll();
            node.anchorX = isNaN(node.anchorX) ? 0 : node.anchorX;
            node.anchorY = isNaN(node.anchorY) ? 0 : node.anchorY;
            var x = node.x + (node.width * 0.5 - node.width * node.anchorX);
            var y = node.y + (node.height * 0.5 - node.height * node.anchorY);
            node.anchorX = 0.5;
            node.anchorY = 0.5;
            node.x = x;
            node.y = y;

            node.on(Laya.Event.MOUSE_DOWN, caller, function (e) {
                audioManager.playSound(4);
                e.target.scale(bkScaleX * 0.9, bkScaleY * 0.9);
                (!touchThrough) && e.stopPropagation();
            });
            node.on(Laya.Event.ROLL_OUT, caller, function (e) {
                e.currentTarget.scale(bkScaleX, bkScaleY);
                (!touchThrough) && e.stopPropagation();
            });
            node.on(Laya.Event.MOUSE_UP, caller, function (e) {
                e.target.scale(bkScaleX, bkScaleY);
                (!touchThrough) && e.stopPropagation();
            });
            node.on(Laya.Event.CLICK, caller, function (e) {
                if (callback != undefined) {
                    callback.bind(caller)(e);
                }
                if (e.stopPropagation != undefined) {
                    (!touchThrough) && e.stopPropagation();
                }
            });
        };

        //获取配置表文字
        _proto.getString = function (stringId, arg) {
            if (!D.GameText[stringId]) {
                return stringId + arg;
            }
            var text = D.GameText[stringId]["chs"];
            if (!text)
                return "";
            if (!arg)
                return text;
            return _proto.stringFormat(text, arg);
        };

        /** 获取字符串位长度 */
        _proto.getLength = function (str) {
            return str.replace(/[\u0391-\uFFE5]/g, "aa").length;  //先把中文替换成两个字节的英文，再计算长度
        };

        //替换通配符
        _proto.stringFormat = function (str, arg) {
            if (!str)
                return arg;
            var text = str;
            if (arg) {
                for (var i = 0; i < arg.length; i++) {
                    text = text.replaceAll("{" + i + "}", arg[i]);
                }
            }
            return text;
        };

        //模糊滤镜(在webGl模式下可用)
        _proto.setImgBlur = function (imgNode, value) {
            if (imgNode) {
                value = value || 5;
                var blurFilter = new Laya.BlurFilter();
                blurFilter.strength = value;
                imgNode.filters = [blurFilter];
            }
        };
        //发光滤镜
        /**
         * 图片，颜色"#232628"，范围
         */
        _proto.setImgGlow = function (imgNode, color, value) {
            if (imgNode) {
                value = value || 10;
                color = "#ffff00" || color;
                //创建一个发光滤镜
                var glowFilter = new Laya.GlowFilter(color, value, 0, 0);
                //设置滤镜集合为发光滤镜
                imgNode.filters = [glowFilter];
            }
        };
        //颜色滤镜
        _proto.setImgColor = function (imgNode, Mat) {
            //创建一个颜色滤镜对象
            var Filter = new Laya.ColorFilter(Mat);
            imgNode.filters = [Filter];
        };

        _proto.clearFilters = function (imgNode) {
            imgNode.filters = [];
        };

        /**
         * 通过name搜索child
         * @param parent
         * @param childName
         * @returns {AnimationNode|Node|节点对象}
         */
        _proto.getChildDeep = function (parent, childName) {
            var child = parent.getChildByName(childName);
            if (child)
                return child;
            for (var i = 0; i < parent._children.length; i++) {
                child = utils.getChildDeep(parent._children[i], childName);
                if (child)
                    return child;
            }
        };

        // 修改list的_$set_selectedIndex方法（selectHandler多了个参数index, cell, list）
        _proto.listSelectEx = function (list) {
            Laya.getset(0, list, 'selectedIndex', function () {
                return this._selectedIndex;
            }, function (value) {
                if (this._selectedIndex != value) {
                    this._selectedIndex = value;
                    this.changeSelectStatus();
                    this.event(/*laya.events.Event.CHANGE*/"change");
                    this.selectHandler && this.selectHandler.runWith([value, this.getCell(value), this]);
                    this.startIndex = this._startIndex;
                }
            });
        };

        /**
         * 设置HTML LABEL(可变颜色)控件string
         * @param htmlLabel
         * @param str
         * @param isInit
         */
        _proto.setHtmlLabel = function (htmlLabel, str, isInit) {
            if (!isInit) {
                htmlLabel.style.fontSize = 24;
                htmlLabel.style.font = "黑体";
                htmlLabel.style.color = "#ffffff";
                htmlLabel.style.align = "center";
            }
            htmlLabel.innerHTML = utils.getString(str);
        };

        /**
         * 设置使用资源，添加引用计数
         * @param resArray
         */
        _proto.setResUsed = function (resArray) {
            for (var i = 0; i < resArray.length; i++) {
                G.addResCount("img", resArray[i].url);
            }
        };
        /**
         * 设置资源
         * @param resArray
         */
        _proto.setResUnused = function (resArray) {
            for (var i = 0; i < resArray.length; i++) {
                G.delResCount(resArray[i].url);
            }
        };

        /**
         * 从对象池里获取，时间线实例 (一次性调用时才用)
         * @param complete 动画结束时回调， 自动回收到对象池（new Handler(this, this.complete, args)）
         * @returns {*}
         */
        _proto.getTimeLine = function (complete) {
            var self = this;
            var timeLine = this._pool.getItemByClass("TimeLine", Laya.TimeLine);
            timeLine.reset();
            var onComplete = function () {
                timeLine.off(Laya.Event.COMPLETE, this, onComplete);
                self._pool.recover("TimeLine", timeLine);
                if (complete)
                    complete.run();
            };
            timeLine.on(Laya.Event.COMPLETE, this, onComplete);
            return timeLine;
        };

        /**
         * UI节点转换到目标节点下的坐标
         * @param node 节点
         * @param targetNode 目标节点
         * @returns {转换后的坐标的点|Point}
         */
        _proto.transPos = function (node, targetNode) {
            var endGlobalPos = new Laya.Point();
            node.localToGlobal(endGlobalPos);
            //图标移动动画
            var endPos = targetNode.globalToLocal(endGlobalPos, true);
            return endPos;
        };

        /** 提示 */
        _proto.prompt = function (message) {
            if (!message)
                return;
            if (!this.m_systemPrompt) {
                this.m_systemPrompt = window.promptUtils;
                this.m_systemPrompt.init();
            }
            this.m_systemPrompt.prompt(message);
        };

        /** 隐藏提示 */
        _proto.hidePrompt = function () {
            if (this.m_systemPrompt) {
                this.m_systemPrompt.onComplete();
            }
        };

        /** 提示 */
        _proto.movePrompt = function (message) {

        };


        /** 提示 (图片)*/
        _proto.promptImg = function (skin) {
            if (!skin)
                return;
            if (!this.m_systemPrompt) {
                this.m_systemPrompt = uiManager.openUI(ulee.Prompt);
            }
            this.m_systemPrompt.prompt1(skin);
        };

        /**发起HTTP请求*/
        _proto.sendParamHttp = function (url, reqObj, compeleteCallback) {
            var type = 'text';
            var httpHr = new Laya.HttpRequest();
            httpHr._loadedSize = 0;
            httpHr._totalSize = 5000000;
            httpHr.once(Laya.Event.COMPLETE, this, this.onHttpCompelete, [httpHr, compeleteCallback]);
            // httpHr.once(Laya.Event.ERROR, this, this.onHttpError, [httpHr]);
            // httpHr.on(Laya.Event.PROGRESS, this, this.onHttpSuccess, [httpHr]);
            var formatStr = "&{0}={1}";
            for (key in reqObj) {
                url += this.stringFormat(formatStr, [key, reqObj[key]]);
            }
            httpHr.send(url, null, 'get', type);
        };

        /**
         * 当http完成
         */
        _proto.onHttpCompelete = function (httpHr, compeleteCallback) {
            compeleteCallback && compeleteCallback.runWith(httpHr.data);
        };

        /**
         * 返回格式00:00样式的时间
         * @param second 秒
         * @returns {string}
         */
        _proto.formatTime = function (second, showHours) {
            var min = Math.floor(second / 60);
            second = second % 60;
            if (!showHours || min < 60)
                return utils.timeNumberFormat(min) + ":" + utils.timeNumberFormat(second);
            var hours = Math.floor(min / 60);
            min %= 60;
            return hours + ":" + utils.timeNumberFormat(min) + ":" + utils.timeNumberFormat(second);
        };

        //获取 00格式数字
        _proto.timeNumberFormat = function (value) {
            return (value < 10 ? "0" : "") + parseInt(value);
        };

        /**获得圆形头像 */
        _proto.updateCircleHead = function (node) {
            var mask = new Laya.Sprite();
            mask.graphics.drawCircle(node.width / 2, node.width / 2, node.width / 2,
                "#ffff00");
            mask.pos(0, 0);
            node.mask = mask;
        };

        // 修改list的_$set_selectedIndex方法（selectHandler多了个参数index, cell, list）
        _proto.listSelectEx = function (list) {
            Laya.getset(0, list, 'selectedIndex', function () {
                return this._selectedIndex;
            }, function (value) {
                if (this._selectedIndex != value) {
                    this._selectedIndex = value;
                    this.changeSelectStatus();
                    this.event(/*laya.events.Event.CHANGE*/"change");
                    this.selectHandler && this.selectHandler.runWith([value, this.getCell(value), this]);
                    this.startIndex = this._startIndex;
                }
            });
        };

        //列表处理renderHander(cell, index) selectHander(index , cell)
        _proto.listHandler = function (list, caller, renderHander, selectHander) {
            if (!list) return;
            renderHander && (list.renderHandler = new Handler(caller, renderHander.bind(caller)));
            selectHander && (list.selectHandler = new Handler(caller, selectHander.bind(caller)));
            list.scrollBar && (list.scrollBar.visible = false);
            list.selectEnable = true;
            //this.listSelectEx(list);
        };

        /**
         * cutDownString: 缩短字符串长度（有多余则用"..."）
         * str： 字符串
         * lenght： 保留多少
         */
        _proto.cutstr = function (str, length) {
            var newStr = "";
            for (var i = 0; i < str.length; i++) {
                newStr += str[i];
                if (i + 1 == length) {
                    newStr += "...";
                    break;
                }
            }
            return newStr;
        };

        _proto.setVector3 = function (v3, x, y, z) {
            v3.x = x, v3.y = y, v3.z = z;
        };

        /** 通过ID获取图片的地址*/
        _proto.getImgUrl = function (imgId) {
            if (!imgId)
                return;
            var tmpImgUrl = "100";
            try {
                imgUrl = D.SpritePath[imgId]["chs"];
            } catch (e) {
                console.error("找不到图片资源,id:" + imgId + "/使用临时资源替换");
                imgUrl = D.SpritePath[tmpImgUrl]["chs"];

            }
            return imgUrl;
        };

        /*射线碰撞检查
         * ray 射线
         * colliders 检测的碰撞体数组
         * distance 检测距离
         */
        _proto.rayCast = function (ray, colliders, distance) {
            var _outHitInfo = new Laya.RaycastHit();
            for (var i = 0, n = colliders.length; i < n; i++) {
                var collider = colliders[i];
                if (collider.enable) {
                    collider.raycast(ray, _outHitInfo, distance);
                    if (_outHitInfo.distance !== -1) {
                        //碰到了
                        return true;
                    }
                }
            }
        };

        //获取年的第几周
        //@param 年月日  字符串
        _proto.getYearWeek = function (a, b, c) {
            /*
            date1是当前日期
            date2是当年第一天
            d是当前日期是今年第多少天
            用d + 当前年的第一天的周差距的和在除以7就是本年第几周
            */
            var date1 = new Date(a, parseInt(b) - 1, c),
                date2 = new Date(a, 0, 1),
                d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
            return Math.ceil((d + ((date2.getDay() + 1) - 1)) / 7);
        };

        /**
        * 飘钻石、金币动画
        * value: 值
        * type: 1钻石、2金币
        * movePos: 所要移动到的位置(结束位置)
        * createPos：创建的位置(初始位置)
        * parentNode: 父节点
        * callback: 回调
        */
        _proto.gameCoinAnimation = function (value, type, movePos, createPos, parentNode, callback) {
            this.timeLineArr = [];
            var cyclesNum = 5; // 最少循环次数
            // 数量设置
            if (type == 1) {
                // 钻石
                cyclesNum = value;
                if (cyclesNum > 25) {
                    cyclesNum = 25;
                }
            } else {
                // 金币
                if (value > 1000000) {
                    cyclesNum = 30;
                } else if (value > 100000) {
                    cyclesNum = 20;
                } else if (value > 10000) {
                    cyclesNum = 10;
                }
            }
            // 创建字位图
            var moneyAni = new Laya.FontClip('fnt/number1.png', '1234567890');
            moneyAni.x = movePos.x + 50;
            moneyAni.y = movePos.y + 18;
            moneyAni.alpha = 0;
            moneyAni.value = value;
            moneyAni.scale(0, 0);
            moneyAni.anchorX = 0.5;
            moneyAni.anchorY = 0.5;
            parentNode.addChild(moneyAni);
            var moneyTimeLine = new Laya.TimeLine();
            moneyTimeLine.name = "moneyAni";
            this.timeLineArr.push(moneyTimeLine);
            moneyTimeLine.to(moneyAni, { scaleX: 0.4, scaleY: 0.4, alpha: 1 }, 300).to(moneyAni, { scaleX: 0.2, scaleY: 0.2, alpha: 0 }, 400, null, 600);
            moneyTimeLine.on(Laya.Event.COMPLETE, this, function () {
                callback && callback();
                moneyAni.destroy();
                // moneyTimeLine.destroy();
                // moneyTimeLine.pause();
            });
            // 开始创建金币
            var flag = false;
            for (var i = 0; i < cyclesNum; i++) {
                this.createCoin(type, createPos, parentNode, function (coinImg) {
                    // 移动金币
                    var timeLine3 = new Laya.TimeLine();
                    this.timeLineArr.push(timeLine3);
                    timeLine3.to(coinImg, { x: movePos.x, y: movePos.y }, this.random(100, 400), Laya.Ease.backIn, 0);
                    if (i == cyclesNum) timeLine3.play(-300, false);
                    timeLine3.on(Laya.Event.COMPLETE, this, function () {
                        coinImg.removeSelf();
                        if (!flag) {
                            flag = true;
                            moneyTimeLine.play(0, false);
                        }
                    });
                }.bind(this));
            }
        };

        /**
         * 创建金币
         * type: 1钻石、2金币
         * callback 回调
         */
        _proto.createCoin = function (type, createPos, parentNode, callback) {
            var coinImg = new Laya.Image();
            if (type == 1) {
                coinImg.skin = "common/img_diamond.png";
            } else if (type == 2) {
                coinImg.skin = "common/img_coin.png";
            }
            coinImg.x = createPos.x;
            coinImg.y = createPos.y;
            coinImg.scale(0, 0);
            parentNode.addChild(coinImg);
            var timeLine = new Laya.TimeLine();
            timeLine.name = "coin";
            this.timeLineArr.push(timeLine);
            var x = coinImg.x + this.random(0, 230);
            var y = coinImg.y + this.random(-100, 100);
            timeLine.addLabel("move", 0).to(coinImg, { scaleX: 0.8, scaleY: 0.8, x: x, y: y }, 100, Laya.Ease.backOut, 0).play(100, false);
            timeLine.on(Laya.Event.COMPLETE, this, function () {
                callback && callback(coinImg);
            });
        };

        /** 
         * 清除飘金币动画
         */
        _proto.clearGameCoinAnimation = function () {
            if (this.timeLineArr == undefined || this.timeLineArr.length <= 0) return;
            for (var index = 0; index < this.timeLineArr.length; index++) {
                var timeLine = this.timeLineArr[index];
                timeLine.name = "";
                timeLine.pause();
                timeLine.destroy();
                timeLine = null;
            }
        };

        //判断首次打开页面弹窗
        _proto.checkPrompt = function () {
            if (!G.ISSHOWSIGN && dataManager.getUserData("isCanSign")) {
                G.ISSHOWSIGN = true;
                updateManager.timeOnce(0.5, this, function () {
                    uiManager.openUI("game/SignInUI.scene");
                });
            } else if (!G.ISTURNTABLE && dataManager.getUserData("turntableFreeTimes") > 0) {
                G.ISTURNTABLE = true;
                updateManager.timeOnce(0.5, this, function () {
                    uiManager.openUI("game/LuckyTurntableView.scene");
                });
            }
        };

        /** 
         * 创建3d文字
         */
        _proto.create3DFont = function (scene, string, color) {
            // 平面
            var plane = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(1, 1));
            plane.transform.rotate(new Laya.Vector3(90, 0, 0), true, true);
            plane.transform.localPosition = new Laya.Vector3(0, 1.05, 0);
            scene.addChild(plane);

            // 材质
            var mat = new Laya.UnlitMaterial();
            plane.meshRenderer.sharedMaterial = mat;
            // 画布
            var cav = Laya.Browser.createElement("canvas");
            cav.width = 200;
            cav.height = 200;
            //cav.style.border = "3px solid red";
            // 创建字体
            var text = cav.getContext("2d");

            var image = new Image(); //创建<img>元素
            image.src = "models/obj/obj_texture/img_bubble.png"; // 设置图片源地址
            var self = this;
            image.onload = function () { //保证图片加载成功
                text.drawImage(image, 0, 0, 200, 120);
                text.fillStyle = color ? color : "rgb(255，255，255)";
                text.font = "bold 35px 微软雅黑";
                text.textAlign = "left";
                text.textBaseline = "middle";
                self.drawText(text, string, 15, 5, 150);
                var texture2D = new Laya.Texture2D(120, 75);
                texture2D.loadImageSource(cav);
                mat.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
                // 贴图
                mat.albedoTexture = texture2D;
                plane.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
            };
            return plane;
        };

        /** 
         * 口号随机
         */
        _proto.randomSlogan = function () {
            while (true) {
                var randomNum = this.random(1, 10);
                if (!this.oldArr || this.oldArr == undefined || Object.keys(this.oldArr).length >= Object.keys(this.sloganMap).length) {
                    this.sloganMap = D.sloganConfig;
                    this.oldArr = {};
                }
                if (this.oldArr[this.sloganMap[randomNum].id] == undefined) {
                    this.oldArr[this.sloganMap[randomNum].id] = this.sloganMap[randomNum];
                    var c = this.sloganMap[randomNum].content;
                    return c;
                }
            }
        };

        //创建页面
        _proto.crateView = function (url, caller, callback) {
            if (!callback) console.error("未传回调函数");
            Laya.loader.create(url, Laya.Handler.create(this, function (res) {
                let node = new Laya.View();
                node.createView(res);
                callback.bind(caller)(node);
            }));
        };

        //随机 [min, max]
        _proto.random = function (min, max) {
            var value = Math.floor(Math.random() * (max + 1 - min) + min);
            return value;
        };

        //骨骼动画更换贴图
        _proto.setSlotSkin = function (node, slot, imgUrl) {
            Laya.loader.load([imgUrl], Laya.Handler.create(this, function () {
                var t = Laya.loader.getRes(imgUrl);
                node.setSlotSkin(slot, t);
            }));
        };

        //替换骨骼动画皮肤
        _proto.changeDBSkin = function (armature, index) {
            let slots = armature._boneSlotDic;
            for (let key in slots) {
                let slot = slots[key];
                let oldIndex = slot.srcDisplayIndex;
                armature.replaceSlotSkinByIndex(key, oldIndex, index);
            }
        };

        /**
         * 时间转换(时分秒)
         * value: 秒
         */
        _proto.formatSeconds = function (value) {
            var theTime = parseInt(value);// 秒
            var middle = 0;// 分
            var hour = 0;// 小时
            if (theTime > 60) {
                middle = parseInt(theTime / 60);
                theTime = parseInt(theTime % 60);
                if (middle > 60) {
                    hour = parseInt(middle / 60);
                    middle = parseInt(middle % 60);
                }
            }
            if (theTime <= 0 && middle <= 0 && hour <= 0) {
                return false;
            }
            var result = (parseInt(theTime).toString().length == 1 ? "0" : "") + parseInt(theTime);
            if (middle > 0) {
                result = (parseInt(middle).toString().length == 1 ? "0" : "") + parseInt(middle) + ":" + result;
            } else {
                result = "00:" + result;
            }
            if (hour > 0) {
                result = (parseInt(hour).toString().length == 1 ? "0" : "") + parseInt(hour) + ":" + result;
            } else {
                result = "00:" + result;
            }
            return result;
        };

        /**
         * 金币动画
         */
        _proto.createCoinAnim = function (startPos, endPos, callback) {
            audioManager.playSound(5);
            var length = 12;
            var arr = [];
            var agle = 0;
            var cha = 60 / length;
            for (var j = 0; j < length; j++) {
                agle += cha;
                arr.push(agle);
            }
            var coinArr = [];
            for (let i = 0; i < length; i++) {
                // 中心点位置
                var x = startPos.x;
                var y = startPos.y;
                var hudu = (2 * Math.PI / 360) * 6 * arr[i];
                var moveX = x + Math.sin(hudu) * 100;
                var moveY = y - Math.cos(hudu) * 100;
                var imgCoin = new Laya.Image("common/img_icon.png");
                imgCoin.x = x;
                imgCoin.y = y - imgCoin.height / 2;
                imgCoin.width = 54;
                imgCoin.height = 56;
                Laya.stage.addChild(imgCoin);
                coinArr.push(imgCoin);
                let timeLine = new Laya.TimeLine();
                timeLine.to(imgCoin, { x: moveX, y: moveY }, 100 + i * 10).play(0, false);
                timeLine.on(Laya.Event.COMPLETE, this, function () {
                    timeLine.pause();
                    timeLine.destroy();
                    if (i == length - 1) {
                        // 移动金币动画
                        updateManager.timeOnce(0.3, this, function () {
                            for (let i = 0; i < coinArr.length; i++) {
                                let coin = coinArr[i];
                                let timeLine = new Laya.TimeLine();
                                timeLine.to(coin, { x: endPos.x, y: endPos.y }, 300 + parseInt(Math.random() * 300)).play(0, false);
                                timeLine.on(Laya.Event.COMPLETE, this, function () {
                                    timeLine.pause();
                                    timeLine.destroy();
                                    coin.destroy();
                                    audioManager.playSound(6);
                                    if (i == coinArr.length - 1) {
                                        updateManager.timeOnce(0.5, this, function () {
                                            callback && callback();
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        };
    })();
    window.utils = new ulee.Utils();

    /**
     * Created by Administrator on 2019/11/27.
     * 自定义事件
     * 拓展系统的事件类型，降低模块间的耦合.
     */
    (function (_super) {
        ulee.Event = {};
        ulee.Event.ON_DATA_LOAD = 1000;//配置数据加载完毕
        ulee.Event.ON_CHANGE_DIAMOND = 1001;//钻石更新
        ulee.Event.ON_SIGN = 1002;//签到更新
        ulee.Event.ON_CHECK_SHOP_RED = 1003;//商店红点更新
        ulee.Event.ON_TURNTABLE = 1004;//钻石红点更新
        ulee.Event.ON_GET_WEAPON = 1005;//武器领取按钮更新
        ulee.Event.ON_TASK = 1006; //任务
    })();

    /**
     * Created by Administrator on 2019/12/5.
     */
    class CameraMoveScript extends Laya.Script3D{
        constructor(){
            super();
            this._tempVector3 = new Laya.Vector3();
            this.yawPitchRoll = new Laya.Vector3();
            this.resultRotation = new Laya.Quaternion();
            this.tempRotationZ = new Laya.Quaternion();
            this.tempRotationX = new Laya.Quaternion();
            this.tempRotationY = new Laya.Quaternion();
            this.rotaionSpeed = 0.00006;
        }
        onAwake(){
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
            this.camera = this.owner;
        }
        _onDestroy() {
            //关闭监听函数
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
        }
        onUpdate(state) {
            var elapsedTime = Laya.timer.delta;
            if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
                var scene = this.owner.scene;
                Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime);//W
                Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime);//S
                Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime);//A
                Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime);//D
                Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime);//Q
                Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime);//E

                var offsetX = Laya.stage.mouseX - this.lastMouseX;
                var offsetY = Laya.stage.mouseY - this.lastMouseY;

                var yprElem = this.yawPitchRoll;
                yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
                yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
                this.updateRotation();
            }
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;


        }
        mouseDown(e) {
            //获得鼠标的旋转值
            this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            //获得鼠标的xy值
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
            //设置bool值
            this.isMouseDown = true;

        }
        mouseUp(e) {
            //设置bool值
            this.isMouseDown = false;
        }
        /**
         * 向前移动。
         */
        moveForward(distance) {
            this._tempVector3.x = 0;
            this._tempVector3.y = 0;
            this._tempVector3.z = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向右移动。
         */
        moveRight(distance) {
            this._tempVector3.y = 0;
            this._tempVector3.z = 0;
            this._tempVector3.x = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向上移动。
         */
        moveVertical(distance) {
            this._tempVector3.x = this._tempVector3.z = 0;
            this._tempVector3.y = distance;
            this.camera.transform.translate(this._tempVector3, false);
        }

        updateRotation() {
            if (Math.abs(this.yawPitchRoll.y) < 1.50) {
                Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
                this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
                this.camera.transform.localRotation = this.camera.transform.localRotation;
            }
        }
    }

    /**
     * Created by Administrator on 2019/12/4.
     * 相机类
     */
    (function () {
        ulee.CameraUtils = function () {
            this.upPos = new Laya.Vector3(0, 1, 0);
        };

        var reg = Laya.ClassUtils.regClass;
        reg("ulee.CameraUtils", ulee.CameraUtils);
        var _proto = ulee.CameraUtils.prototype;

        /**
         * 创建相机
         * @param pos 位置
         * @param rotation 角度
         * @param isCover 是否覆盖其他
         */
        _proto.createCamera = function (pos, rotation, isCover) {
            let camera = new Laya.Camera(0, 0.1, 50);
            pos && camera.transform.translate(pos);
            rotation && camera.transform.rotate(rotation, true, false);
            if (!isCover) camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY;

            return camera;
        };

        //设置控制相机
        _proto.controlCamera = function (camera) {
            camera.addComponent(CameraMoveScript);
        };

        //设置相机捕捉对象
        _proto.setTarget = function (node, camera) {
            this.camera = camera;
            this.m_Target = node;
            this.baseY = this.m_Target.transform.position.y;
            this.angleA = -10;
            this.angleB = 0;
            this.r = 15;
        };

        //跟随目标移动
        _proto.FollowTarget = function (t) {
            if (null == this.m_Target) return;
            this.m_MoveSpeed = 5;
            var e = new Laya.Vector3();
            Laya.Vector3.lerp(this.camera.transform.position, this.m_Target.transform.position, t * this.m_MoveSpeed, e);
            e.y += 2;
            e.z += 3;
            e.x = 0;
            this.camera.transform.position = e;
        };

        _proto.LookAtTarget = function () {
            this.camera.transform.lookAt(this.m_Target.transform.position, this.upPos);
        };

        //围绕目标转动
        _proto.HandleRotateMovement = function (t) {
            this.angleA -= t.x / 10;
            this.angleB += t.y / 10;
            var pos = this.camera.transform.position;
            pos.x = this.r * Math.sin(this.angleB * Math.RAD_1_ANGLE) * Math.sin(this.angleA * Math.RAD_1_ANGLE) + this.m_Target.transform.position.x;
            pos.y = this.r * Math.cos(this.angleB * Math.RAD_1_ANGLE) + this.m_Target.transform.position.y;
            pos.z = this.r * Math.sin(this.angleB * Math.RAD_1_ANGLE) * Math.cos(this.angleA * Math.RAD_1_ANGLE) + this.m_Target.transform.position.z;
            this.camera.transform.position = pos;
            this.camera.transform.lookAt(this.m_Target.transform.position, this.upPos);
        };

    })();
    window.cameraUtils = new ulee.CameraUtils();

    /**
     * Created by Administrator on 2019/11/27.
     * 自定义事件派发器
     */
    (function (_super) {
        //自定义事件类型，根据需求添加
        ulee.EventDispatcher = function () {
            this.eventDispatcher = new Laya.EventDispatcher();
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.EventDispatcher, "ulee.EventDispatcher",_super);
        var _proto = ulee.EventDispatcher.prototype;

        /**添加自定义事件监听，窗口类事件无需再手动清除*/
        _proto.addEventListen = function(eventType,caller,handler){
            this.eventDispatcher.on(eventType,caller,handler);
        };

        /**删除自定义事件,关闭UI时，会自动清除*/
        _proto.removeEventListen = function(eventType,caller,handler){
            this.eventDispatcher.off(eventType,caller,handler);
        };

        /**派发自定义事件*/
        _proto.dispatchEvent = function(eventTag,data){
            // console.log ("DispatchEvent..." + eventTag);
            var e = {msg : data, name : eventTag};
            this.eventDispatcher.event(eventTag,e);
            e = null;
        };

    })();
    window.eventDispatcher = new ulee.EventDispatcher();

    /**
     * Created by Administrator on 2019/11/27.
     * 配表数据解析类
     */

    (function () {
        ulee.io.DataInputStream = function (arrayBuffer) {
            this.arrayBuffer = arrayBuffer;
            this.index = 0;
            this.dv = new DataView(this.arrayBuffer);
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.io.DataInputStream, "ulee.io.DataInputStream");
        var _proto = ulee.io.DataInputStream.prototype;

        _proto.readByte = function () {
            return this.dv.getInt8(this.index++);
        };

        _proto.readShort = function () {
            var value = this.dv.getInt16(this.index);
            this.index += 2;
            return value;
        };

        _proto.readInt = function () {
            var value = this.dv.getInt32(this.index);
            this.index += 4;
            return value;
        };

        _proto.readUint = function () {
            var value = this.dv.getUint32(this.index);
            this.index += 4;
            return value;
        };

        _proto.readLong = function () {
            var value1 = this.readInt();
            var value2 = this.readUint();
            var value = (value1 * Math.POW_2_32) + value2;
            return value;
        };

        _proto.readFloat = function () {
            var value = this.dv.getFloat32(this.index);
            this.index += 4;
            return value;
        };

        _proto.readUTF = function () {
            var num = this.readShort();
            return this.readText(num);
        };

        _proto.readText = function (length) {
            var buffer = this.arrayBuffer.slice(this.index, this.index + length);
            var array = new Uint8Array(buffer);

            var v = "", max = length, c = 0, c2 = 0, c3 = 0, f = String.fromCharCode, idx = 0;
            var u = array, i = 0;
            while (idx < max) {
                c = u[idx++];
                if (c < 0x80) {
                    if (c != 0) {
                        v += f(c);
                    }
                } else if (c < 0xE0) {
                    v += f(((c & 0x3F) << 6) | (u[idx++] & 0x7F));
                } else if (c < 0xF0) {
                    c2 = u[idx++];
                    v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[idx++] & 0x7F));
                } else {
                    c2 = u[idx++];
                    c3 = u[idx++];
                    v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[idx++] & 0x7F));
                }
                i++;
            }
            this.index += length;
            return v;
        };

        _proto.readArrayBuffer = function (length) {
            var buffer = this.arrayBuffer.slice(this.index, this.index + length);
            this.index += length;
            return buffer;
        };

    })();

    /**
     * Created by Administrator on 2019/11/27.
     * 可变高List, 在rendhandler里改变box高度即可
     */

    (function () {
        ulee.ListHeightVariable = function () {
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.ListHeightVariable, "ulee.ListHeightVariable");
        var _proto = ulee.ListHeightVariable.prototype;

        ulee.ListHeightVariable.Convert = function (list) {
            list.$renderItems = list.renderItems;
            list._ys = [0];
            list.renderItems = function () {
                for (var i = 0, n = list._cells.length; i < n; i++) {
                    list.renderItem(list._cells[i], list._startIndex + i);
                }
                list.changeSelectStatus();
            };

            list.$renderItem = list.renderItem;
            list.renderItem = function (cell, index) {
                list.$renderItem(cell, index);
                cell.y = list._ys[index];
                if (list._ys.length === index + 1 && index < list.array.length) {
                    var newY = cell.y + cell.height;
                    list._ys.push(newY);
                    list._scrollBar.setScroll(0, newY - list._content.height, list._scrollBar.value);
                }
            };

            list.$onScrollBarChange = list.onScrollBarChange;

            list.onScrollBarChange = function (e) {
                list.runCallLater(list.changeCells);
                var scrollValue = list._scrollBar.value;
                var lineX = 1;
                var lineY = list.repeatY;
                var index = 0;
                var i;
                for (i = 0; i < list._ys.length; i++) {
                    if (list._ys[i] > scrollValue)
                        break;
                    index = i;
                }

                if (index > list._startIndex) {
                    var num = index - list._startIndex;
                    var down = true;
                    var toIndex = list._startIndex + lineX * (lineY + 1);
                    list._isMoved = true;
                } else if (index < list._startIndex) {
                    num = list._startIndex - index;
                    down = false;
                    toIndex = list._startIndex - 1;
                    list._isMoved = true;
                }

                for (i = 0; i < num; i++) {
                    if (down) {
                        var cell = list._cells.shift();
                        list._cells[list._cells.length] = cell;
                        var cellIndex = toIndex + i;
                    } else {
                        cell = list._cells.pop();
                        list._cells.unshift(cell);
                        cellIndex = toIndex - i;
                    }
                    list.renderItem(cell, cellIndex);
                }
                list._startIndex = index;

                list._content.scrollRect.y = scrollValue;
            };

            list.$posCell = list.posCell;
            list.posCell = function (cell, cellIndex) {
                if (!list._scrollBar) return;
                cell.y = list._ys[cellIndex];
            };

            list.$changeCells = list.changeCells;
            list.changeCells = function () {
                list._cellChanged = false;
                if (list._itemRender) {
                    list.scrollBar = this.getChildByName("scrollBar");
                    var cell = this._getOneCell();
                    var cellWidth = (cell.width + this._spaceX) || 1;
                    var cellHeight = (cell.height + this._spaceY) || 1;
                    if (this._width > 0) this._repeatX2 = this._isVertical ? Math.round(this._width / cellWidth) : Math.ceil(this._width / cellWidth);
                    if (this._height > 0) this._repeatY2 = this._isVertical ? Math.ceil(this._height / cellHeight) : Math.round(this._height / cellHeight);
                    var listWidth = this._width ? this._width : (cellWidth * this.repeatX - this._spaceX);
                    var listHeight = this._height ? this._height : (cellHeight * this.repeatY - this._spaceY);
                    this._cellSize = this._isVertical ? cellHeight : cellWidth;
                    this._cellOffset = this._isVertical ? (cellHeight * Math.max(this._repeatY2, this._repeatY) - listHeight - this._spaceY) : (cellWidth * Math.max(this._repeatX2, this._repeatX) - listWidth - this._spaceX);
                    if (this._isVertical && this._scrollBar) this._scrollBar.height = listHeight;
                    else if (!this._isVertical && this._scrollBar) this._scrollBar.width = listWidth;
                    this.setContentSize(listWidth, listHeight);
                    var numX = this._isVertical ? this.repeatX : this.repeatY;
                    var numY = (this._isVertical ? this.repeatY : this.repeatX) + (this._scrollBar ? 1 : 0);
                    this._createItems(0, numX, numY);
                    this._createdLine = numY;
                    if (this._array) {
                        this.array = this._array;
                        this.runCallLater(this.renderItems);
                    }
                }
            };

            /**
             *列表数据源。
             */
            Laya.getset(0, list, 'array', function () {
                return this._array;
            }, function (value) {
                this.runCallLater(this.changeCells);
                this._array = value || [];
                var length = this._array.length;
                this.totalPage = Math.ceil(length / (this.repeatX * this.repeatY));
                this._selectedIndex = this._selectedIndex < length ? this._selectedIndex : length - 1;
                this.startIndex = this._startIndex;
                if (this._scrollBar) {
                    this._scrollBar.stopScroll();
                    var numX = this._isVertical ? this.repeatX : this.repeatY;
                    var numY = this._isVertical ? this.repeatY : this.repeatX;
                    var lineCount = Math.ceil(length / numX);
                    var total = this._cellOffset > 0 ? this.totalPage + 1 : this.totalPage;
                    if (total > 1) {
                        this._scrollBar.scrollSize = this._cellSize;
                        this._scrollBar.thumbPercent = numY / lineCount;
                        this._scrollBar.setScroll(0, this._ys[this._ys.length - 1] - list._content.height, this._scrollBar.value);
                        this._scrollBar.target = this._content;
                    } else {
                        this._scrollBar.setScroll(0, 0, 0);
                        this._scrollBar.target = this._content;
                    }
                }
            });


            list.tweenTo = function (index, time, complete) {
                (time === void 0) && (time = 200);
                if (list._scrollBar) {
                    var value = list._ys[index];
                    Tween.to(list._scrollBar, { value: value }, time, null, complete, 0, true);
                } else {
                    list.startIndex = index;
                    if (complete) complete.run();
                }
            };

            if (list._scrollBar) {
                list._scrollBar.off(/*laya.events.Event.CHANGE*/"change", list, list.$onScrollBarChange);
                list._scrollBar.on(/*laya.events.Event.CHANGE*/"change", list, list.onScrollBarChange);
            }
        };
    })();

    /*
     * 模型单位基类
     */
    (function () {
        ulee.Model = function (parent, modelId, loadedHandler) {
            // 模型id
            this._modelId = 0;
            // 挂载模型
            this._sprite = null;
            // 模型对应animator
            this.animator = null;
            // 模型对应avater
            this.avater = null;
            // 所有子animator
            this._canimators = [];
            // 父节点
            this._parent = null;
            // 额外挂载模型
            this._addModels = [];
            // 骨骼点
            this._bones = {};
            // 加载结束回调
            this._loadedHandler = null;
            // 初始本地坐标
            this._localPosition = new Vector3(0, 0, 0);
            // 初始缩放
            this._localScale = new Vector3(1, 1, 1);
            // 初始本地角度（弧度）
            this._localRotation = new Vector3(0, 0, 0);
            // 模型角度
            this._localRotation2 = new Vector3(0, 0, 0);
            // 是否加载结束
            this.loaded = false;
            // 是否显示
            this._active = true;
            // 对应资源配置
            this.modelConfig = null;
            //透明度
            this._alpha = 1;

            if (modelId) {
                this.create(parent, modelId, loadedHandler);
            }
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.Model, "ulee.Model");
        var _proto = ulee.Model.prototype;

        ulee.Model.create = function (parent, modelId, loadedHandler) {
            var model = Laya.Pool.getItem("ccModel");
            if (!model) {
                model = new ulee.Model(parent, modelId, loadedHandler);
            } else {
                model.create(parent, modelId, loadedHandler);
            }
            return model;
        };

        _proto.prepareLoad = function (url) {
            Laya.loader.create(url, Laya.Handler.create(this, this.LoadResComplete));
        };

        _proto.create = function (parent, modelId, loadedHandler) {
            this._parent = parent;
            this._modelId = modelId;
            this._loadedHandler = loadedHandler;
            this._isDestroyed = false;

            this._config = D.PrefabsPath[modelId];
            var chs = this._config.chs;
            this.url = ulee.Model.fullChs(chs);
            this.name = chs.substring(chs.lastIndexOf("/") + 1);

            this.prepareLoad(this.url);
        };

        ulee.Model.fullChs = function (chs) {
            var resName = chs.substring(chs.lastIndexOf("/") + 1);
            var url = chs + "/" + resName + ".lh";
            return url;
        };

        _proto.LoadResComplete = function () {
            // 未加载完毕就已经被销毁
            if (this._isDestroyed)
                return;
            var sprite3D = Laya.Loader.getRes(this.url);
            this._sprite = Laya.Sprite3D.instantiate(sprite3D);
            this._sprite.$model = this;
            this._sprite.$name = "Model_" + this._modelId;
            this.avater = this._sprite.getChildAt(0);
            this.animator = this.avater.getComponent(Laya.Animator);//获取Animator动画组件
            for (var i = 0; i < this._config.subModel.length; i++) {
                var childName = this._config.subModel[i];
                if (childName == "0")
                    break;
                var child = this.avater.getChildByName(childName);
                if (!child)
                    continue;
                var canimator = child.getComponentByType(Laya.Animator);
                canimator && this._canimators.push(canimator);
            }

            Laya.timer.once(1, this, this._onAllCompleted);
        };

        _proto.setLocalPosition = function (x, y, z) {
            utils.setVector3(this._localPosition, x, y, z);
            this.loaded && (this._sprite.transform.localPosition = this._localPosition);
        };

        _proto.setLocalScale = function (x, y, z) {
            (x === void 0) && (x = 1);
            (y === void 0) && (y = x);
            (z === void 0) && (z = x);
            utils.setVector3(this._localScale, x, y, z);
            this.loaded && (this._sprite.transform.localScale = this._localScale);
        };

        //设置模型角度
        _proto.setLocalRotation = function (yr, xr, zr, sprite3d) {
            if (!sprite3d) {
                sprite3d = this._sprite;
            }
            this._localRotation2.x = yr;
            this._localRotation2.y = xr;
            this._localRotation2.z = zr;
            utils.setVector3(this._localRotation, yr * Math.RAD_1_ANGLE, xr * Math.RAD_1_ANGLE, zr * Math.RAD_1_ANGLE);
            var transform = sprite3d.transform;
            Laya.Quaternion.createFromYawPitchRoll(this._localRotation.x, this._localRotation.y, this._localRotation.z, transform._localRotation);
            transform.localRotation = transform._localRotation;
        };

        _proto.setActive = function (active) {
            if (this._active == active)
                return;
            this._active = active;
            this.loaded && (this._sprite.active = active);
        };

        _proto.isActive = function () {
            return this._active;
        };

        /**
         * 设置半透明
         * @param 透明值
         */
        _proto.setAlpha = function (alpha) {
            if (this._alpha == alpha) {
                return;
            }
            this.setAlalbedo(this._sprite, alpha, 1, 1, 1);
            this._alpha = alpha;
        };

        /**
         * 更新所有节点的RenderMode
         * @param sprite
         * @param renderMode
         */
        _proto._setRenderMode = function (renderMode, sprite3d) {
            if (!sprite3d) {
                sprite3d = this._sprite;
            }
            var meshRender = sprite3d.meshRenderer || sprite3d.skinnedMeshRenderer || sprite3d.particleRenderer
                || sprite3d.ShurikenParticleRenderer;
            if (meshRender) {
                meshRender.material && (meshRender.material.renderMode = renderMode);
                return;
            }
            for (var i = 0; i < sprite3d.numChildren; i++) {
                var child = sprite3d.getChildAt(i);
                this._setRenderMode(renderMode, child);
            }
            this.renderMode = renderMode;
        };

        /**
         * 设置颜色叠加
         * @param node
         * @param w
         * @param x
         * @param y
         * @param z
         */
        _proto.setAlalbedo = function (node, w, x, y, z) {
            if (!node) return;
            var meshRender = node.meshRenderer || node.skinnedMeshRenderer;
            if (meshRender) {
                var materials = meshRender.materials;
                for (var n = materials.length - 1; n >= 0; n--) {
                    var material = materials[n];
                    if (material.cull == 0 && material.blend == 1 && material.srcBlend == 0x0302 && material.dstBlend == 1) {
                        continue;
                    }
                    if (w < 1) {
                        material.renderMode = Laya[material.constructor.name].RENDERMODE_TRANSPARENT;
                    }
                    material.albedoColorA = w;
                    material.albedoColorR = x;
                    material.albedoColorG = y;
                    material.albedoColorB = z;
                }
            } else {
                for (var i = 0; i < node.numChildren; i++) {
                    var child = node.getChildAt(i);
                    this.setAlalbedo(child, w, x, y, z);
                }
            }
        };

        _proto.setIntensity = function (node, value) {
            if (!node) return;
            var meshRender = node.meshRenderer || node.skinnedMeshRenderer;
            if (meshRender) {
                var materials = meshRender.materials;
                for (var n = materials.length - 1; n >= 0; n--) {
                    var material = materials[n];
                    material.albedoIntensity = value;
                }
            } else {
                for (var i = 0; i < node.numChildren; i++) {
                    var child = node.getChildAt(i);
                    this.setIntensity(child, value);
                }
            }
        };

        /**
         * 设置接收阴影
         */
        _proto.receiveShadow = function () {
            for (var i = 0; i < this._sprite.numChildren; i++) {
                var child = this._sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    child.meshRender.receiveShadow = true;
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    child.skinnedMeshRender.receiveShadow = true;
                }
            }
        };

        /**
         * 设置阴影
         */
        _proto.showShashow = function (sprite, visible) {
            visible = visible == undefined ? true : visible;
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    child.meshRender.castShadow = visible;
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    child.skinnedMeshRender.castShadow = visible;
                }
                if (child.numChildren > 0) {
                    this.showShashow(child, visible);
                }
            }
        };

        _proto.rotate = function (rotation, isLocal, isRadian) {
            this.loaded && this._sprite.transform.rotate(rotation, isLocal, isRadian);
        };

        _proto._onLoadedModel = function (model) {
            if (this._isDestroyed)
                return;
            this._sprite = Laya.Sprite3D.instantiate(model);
            this.avater = this._sprite.getChildAt(0);
            this.animator = this.avater.getComponentByType(Laya.Animator);//获取Animator动画组件

            for (var i = 0; i < this._config.subModel.length; i++) {
                var childName = this._config.subModel[i];
                if (childName == "0")
                    break;
                var child = this.avater.getChildByName(childName);
                if (!child)
                    continue;
                var canimator = child.getComponentByType(Laya.Animator);
                canimator && this._canimators.push(canimator);
            }

            this._loadAdds();
        };

        _proto._loadAdds = function () {
            if (this._isDestroyed)
                return;
            if (this._addLoadIndex >= this._adds.length) {
                this._onAllCompleted();
                return;
            }
            this._addModels.push(ulee.Model.create(undefined, this._adds[this._addLoadIndex][0], Laya.Handler.create(this, this.onAddLoaded)));
        };

        _proto.onAddLoaded = function () {
            if (this._isDestroyed)
                return;
            var m = this._addModels.last();
            var boneName = this._adds[this._addLoadIndex][1];
            this.bindBone(boneName, m._sprite);
            this._addLoadIndex++;
            this._loadAdds();
        };

        _proto._onAllCompleted = function () {
            this.loaded = true;
            if (this._isDestroyed)
                return;
            else if (this._waitDestroy) {
                this.dispose();
                return;
            }
            this._parent && this._parent.addChild(this._sprite);
            this.setLocalPosition(0, 0, 0);
            this.setLocalRotation(0, 0, 0);
            this.setLocalScale(this._config.scale);

            this._sprite.active = this._active;
            this._loadedHandler && this._loadedHandler.run();
        };

        //获取子节点
        _proto.getChildBeep = function (childName, sprite) {
            if (sprite.name == childName) {
                return sprite;
            }
            var cnt = sprite.numChildren;
            for (var i = 0; i < cnt; i++) {
                var child = this.getChildBeep(childName, sprite._childs[i]);
                if (child) {
                    return child;
                }
            }
        };

        //绑定骨骼点
        _proto.bindBone = function (boneName, boneChild) {
            var bone = this.getBone(boneName);
            bone && bone.addChild(boneChild);
        };

        //获取骨骼点
        _proto.getBone = function (boneName) {
            var bone = this._bones[boneName];
            if (!bone) {
                if (boneName === G.ORBIT_POINT.POINT3 && !this.animator._avatarNodeMap[boneName]) {
                    bone = this.avater;
                } else {
                    if (!this.animator._avatarNodeMap[boneName]) {
                        console.log("无该模型:" + this._modelId + "的绑点:" + boneName + "!");
                        return null;
                    }
                    bone = this._sprite.addChild(new Laya.Sprite3D());
                    this.animator.linkSprite3DToAvatarNode(boneName, bone);
                }
                this._bones[boneName] = bone;
            }
            return bone;
        };

        _proto.stopAnim = function (animName) {
            this.setAnimSpeed(animName, 0);
        };

        _proto.setAnimSpeed = function(animName, speed){
            if (this.animator) {
                this.animator.play(animName);
                var ani = this.animator._controllerLayers[0]._statesMap[animName];
                ani.speed = speed;
            }
        };

        _proto.clearAnim = function(){
            this.animator._controllerLayers[0]._statesMap = [];
        };

        _proto.playAnim = function (animName, caller, callback, playbackRate, crossTime) {
            if (this.animator) {
                if(crossTime){
                    this.animator.crossFade(animName, crossTime, 0);
                }else{
                    this.animator.play(animName);
                }
                var ani = this.animator._controllerLayers[0]._statesMap[animName];
                if (!ani.script) {
                    ani.addScript(AnimatorStateScript);
                    ani.script = ani._scripts[0];
                }
                if (!playbackRate) {
                    playbackRate = 1;
                }
                ani.speed = playbackRate;
                if (callback) {
                    callback = callback.bind(caller);
                }
                ani.script.setComplete(callback);
                this.curAnim = animName;
                this.curAnimSpeed = playbackRate;
            } else {
                if (caller && callback)
                    callback.call(caller);
            }
        };

        _proto.replay = function () {
            this.setActive(false);
            this.setActive(true);
        };

        _proto.dispose = function () {
            if (this._isDestroyed || !this.loaded) {
                this._waitDestroy = true;
                return;
            }
            this._isDestroyed = true;
            this.loaded = false;
            for (var i = 0; i < this._addModels.length; i++) {
                this._addModels[i].dispose();
            }

            this._sprite.destroy(true) && (this._sprite = null);
            this.animator = null;
            this.avater = null;
            this._canimators = [];
            this._parent = null;
            this._addModels = [];
            this._bones = {};
            this._loadedHandler = null;
            this._active = true;
            this._waitDestroy = false;
            this._position = new Vector3(NaN, NaN, NaN);
            this._localPosition = new Vector3(0, 0, 0);
            this._localScale = new Vector3(1, 1, 1);
            this._localRotation = new Vector3(0, 0, 0);

            Laya.Pool.recover("ccModel", this);
        };

        /**
         * 移除模型自己
         */
        _proto.removeParent = function () {
            this._sprite.removeSelf();
        };

        /**
         * 修改ambientColor 修改光亮度
         */
        _proto.resetAmbientColor = function (sprite, value) {
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    var materials = child.meshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.ambientColor.x = value;
                        material.ambientColor.y = value;
                        material.ambientColor.z = value;
                    }
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    var materials = child.skinnedMeshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.ambientColor.x = value;
                        material.ambientColor.y = value;
                        material.ambientColor.z = value;
                    }
                }
                if (child.numChildren > 0) {
                    this.resetAmbientColor(child, value);
                }
            }
        };

        /**
         * 修改反射率
         */
        _proto.resetAlbedo = function (sprite, value) {
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    var materials = child.meshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.albedo = new Laya.Vector4(value, value, value, 1);
                    }
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    var materials = child.skinnedMeshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.albedo = new Laya.Vector4(value, value, value, 1);
                    }
                }
                if (child.numChildren > 0) {
                    this.resetAlbedo(child, value);
                }
            }
        };

        /**
         * 修改高光颜色
         */
        _proto.resetSpecularColor = function (sprite, value) {
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    var materials = child.meshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.specularColor = new Laya.Vector4(value, value, value, 1);
                    }
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    var materials = child.skinnedMeshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.specularColor = new Laya.Vector4(value, value, value, 1);
                    }
                }
                if (child.numChildren > 0) {
                    this.resetAlbedo(child, value);
                }
            }
        };

        /**
         * 设置不受光影响
         */
        _proto.setDisableLight = function (sprite) {
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    child.meshRender.sharedMaterial && child.meshRender.sharedMaterial.disableLight();
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    child.skinnedMeshRender.sharedMaterial && child.skinnedMeshRender.sharedMaterial.disableLight();
                }
                if (child.numChildren > 0) {
                    this.setDisableLight(child);
                }
            }
        };

        _proto.setMaterial2 = function(sprite3D,material){
            if (sprite3D instanceof Laya.MeshSprite3D) {
                var render = sprite3D.meshRenderer;
            } else if (sprite3D instanceof Laya.SkinnedMeshSprite3D) {
                var render = sprite3D.skinnedMeshRenderer;
            }
            render.material = material;
        };

        //设置模型贴图
        _proto.setMaterial = function (materialName, sprite3D, albedo) {
            if (!sprite3D) {
                sprite3D = this._sprite;
            }

            //为模型更换贴图
            if (sprite3D instanceof Laya.MeshSprite3D) {
                var render = sprite3D.meshRenderer;
            } else if (sprite3D instanceof Laya.SkinnedMeshSprite3D) {
                var render = sprite3D.skinnedMeshRenderer;
            }
            if (render) {
                if(!render.material){
                    //创建标准材质
                    var material = new Laya.BlinnPhongMaterial();
                    Laya.Texture2D.load(materialName, Laya.Handler.create(this, function (texture) {
                        //设置反照率贴图
                        material.albedoTexture = texture;
                        //设置反照率强度
                        if(!albedo)albedo = 1;
                        material.albedoIntensity = albedo;
                        console.log(albedo);
                        if(this.renderMode){
                            material.renderMode = this.renderMode;
                        }
                        //设置材质颜色
                        //material2.albedoColor = new Laya.Vector4(0, 0, 0.6, 1);
                    }));
                    render.material = material;
                }else{
                    Laya.Texture2D.load(materialName, Laya.Handler.create(this, function (texture) {
                        render.material.albedoTexture = texture;
                        if(!albedo)albedo = 1;
                        render.material.albedoIntensity = albedo;
                    }));
                }
            }

            for (var i = 0; i < sprite3D.numChildren; i++) {
                this.setMaterial(materialName, sprite3D._children[i], albedo);
            }
        };

        /**
         * 添加网格碰撞器
         */
        _proto.addMeshCollider = function (sprite, colliders) {
            if (sprite.meshFilter) {
                var meshCollider = sprite.addComponent(Laya.PhysicsCollider);
                //创建网格碰撞器
                let meshShape = new Laya.MeshColliderShape();
                //获取模型的mesh
                meshShape.mesh = sprite.meshFilter.sharedMesh;
                //设置模型的碰撞形状
                meshCollider.colliderShape = meshShape;
                colliders && colliders.push(meshCollider);
            }
            var num = sprite.numChildren;
            for (var i = 0; i < num; i++) {
                this.addMeshCollider(sprite._children[i], colliders);
            }
        };

        /**
         * 添加方块碰撞器
         */
        _proto.addBoxCollider = function (sprite) {
            //添加碰撞
            var num = sprite.numChildren;
            var boxColliders = [];
            for (var i = 0; i < num; i++) {
                if (sprite._childs[i].meshFilter) {
                    var boxCollider = this._sprite.addComponent(Laya.BoxCollider);
                    boxCollider.setFromBoundBox(sprite._childs[i].meshFilter.sharedMesh.boundingBox);
                    boxColliders.push(boxCollider);
                }
                var temp = this.addBoxCollider(sprite._childs[i]);
                if (temp.length > 0) {
                    for (var j = 0; j < temp.length; j++) {
                        boxColliders.push(temp[j]);
                    }
                }
            }
            return boxColliders;
        };

        /**
         * 获取碰撞器
         */
        _proto.getCollider = function () {
            return this._sprite._colliders;
        };

        /**
         * 材质阴影
         * @param sprite
         * @private
         */
        ulee.Model._setShader = function (sprite) {
            for (var i = 0; i < sprite.numChildren; i++) {
                var child = sprite.getChildAt(i);
                if (child instanceof Laya.MeshSprite3D) {
                    var materials = child.meshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.setShaderName("CustomShader");
                        material.normalTexture = ulee.shader.CartoonMaterial.matCap;
                        material._tempMatrix4x40 = new Laya.Matrix4x4();

                        // 流光
                        // material.flowingLight = this.modelTmp.flowingLight;
                        // if (material.flowingLight) {
                        //     material.specularTexture = Laya.loader.getRes("models/common/flowingLight/" + material.flowingLight);
                        //     material.reflectTexture = Laya.loader.getRes(this._getLiuguangMark(material));
                        // }

                        // material._setMaterialShaderParams = function (state, projectionView, worldMatrix, mesh, material) {
                        // // 如果设置了流光，必须逐帧更新时间
                        // if (material.flowingLight)
                        // material.alphaTestValue = G.NOW_MILLIS;
                        // };

                        // material._setMaterialShaderParams = function (state) {
                        // var material = state.renderElement._material;
                        // // 如果设置了流光，必须逐帧更新时间
                        // if (material.flowingLight)
                        // material.alphaTestValue = G.NOW_MILLIS;
                        // };
                    }
                    child.meshRender.materials = materials;
                } else if (child instanceof Laya.SkinnedMeshSprite3D) {
                    var materials = child.skinnedMeshRender.materials;
                    for (var j = 0; j < materials.length; j++) {
                        var material = materials[j];
                        material.setShaderName("CustomShader");
                        material.normalTexture = ulee.shader.CartoonMaterial.matCap;
                        material._tempMatrix4x40 = new Laya.Matrix4x4();

                        // 流光
                        // material.flowingLight = this.modelTmp.flowingLight;
                        // if (material.flowingLight) {
                        //     material.specularTexture = Laya.loader.getRes("models/common/flowingLight/" + material.flowingLight);
                        //     material.reflectTexture = Laya.loader.getRes(this._getLiuguangMark(material));
                        // }

                        // material._setMaterialShaderParams = function (state, projectionView, worldMatrix, mesh, material) {
                        // // 如果设置了流光，必须逐帧更新时间
                        // if (material.flowingLight)
                        // material.alphaTestValue = G.NOW_MILLIS;
                        // };

                        // material._setMaterialShaderParams = function (state) {
                        // var material = state.renderElement._material;
                        // // 如果设置了流光，必须逐帧更新时间
                        // if (material.flowingLight)
                        // material.alphaTestValue = G.NOW_MILLIS;
                        // };
                    }
                    child.skinnedMeshRender.materials = materials;
                } else {
                    this._setShader(child);
                }
            }
        };

        _proto.addSkinComponent = function (spirit3D, skinAniUrl) {
            if (spirit3D instanceof Laya.MeshSprite3D) {
                var meshSprite3D = spirit3D;
                var skinAni = meshSprite3D.addComponent(Laya.SkinAnimations);
                skinAni.templet = Laya.AnimationTemplet.load(skinAniUrl);
                skinAni.player.play();
            }
            for (var i = 0, n = spirit3D._childs.length; i < n; i++)
                this.addSkinComponent(spirit3D._childs[i], skinAniUrl);
        };

    })();

    /**
     * Created by Administrator on 2019/11/28.
     * 数据表读取
     */
    window.initData = function () {
            // 用脚本方式读取
            G.dataload = function () {
                for (var tableName in D) {
                    if ("properties" == tableName) continue;
                    var data = D[tableName];
                    var properties = D.properties[tableName];
                    if (!properties) continue;
                    for (var id in data) {
                        var valueArray = data[id];
                        var entry = {};
                        entry[properties[0]] = id;
                        for (var i = 1, n = properties.length; i < n; i++) {
                            var value = valueArray[i - 1];
                            if (value !== undefined) {
                                entry[properties[i]] = value;
                            }
                        }
                        data[id] = entry;
                    }
                }
                onDataCompleted();
            };
            G.dataload();


        function onDataCompleted() {
            fullScreenShow();
            fullMusicBasic();
            fullPrefabsPath();
            if (typeof (addModelConfig) != "undefined") {
                addModelConfig();
                fullModelConfig();
            }
            D._inited = true;
            eventDispatcher.dispatchEvent(ulee.Event.ON_DATA_LOAD);
        };

        function fullScreenShow() {
            var min;
            for (var key in D.ScreenShow) {
                var config = D.ScreenShow[key];
                if (key == 1) {
                    min = config.screenPixel;
                }
                if (min > 10) {
                    config.screenPixel /= min;
                }
            }
        };

        function fullMusicBasic() {
            for (var key in D.musicBasic) {
                var config = D.musicBasic[key];
                config.musicPower *= 0.01;
            }
        };

        function fullPrefabsPath() {
            var emptyArray = [];
            for (var key in D.PrefabsPath) {
                var config = D.PrefabsPath[key];
                if (!config.subModel) {
                    config.subModel = emptyArray;
                } else {
                    config.subModel = config.subModel.split("#");
                }
                if (!config.actionInShop) {
                    config.actionInShop = emptyArray;
                } else {
                    config.actionInShop = config.actionInShop.split("#");
                }
            }
        };

        function fullModelConfig() {
            function addHead(array, head) {
                if (!array) {
                    return;
                }
                for (var k = 0, len = array.length; k < len; k++) {
                    array[k] = head + array[k];
                }
            }
            var config, i, n;
            for (var key in D.ModelConfig) {
                config = D.ModelConfig[key];
                addHead(config.resource, key);
                addHead(config.zipResource, key);
            }
        };
    };

    /**
     * Created by Administrator on 2019/11/28.
     * UI管理
     */
    (function (_super) {
        ulee.UIManager = function () {
            this.scene = Laya.Scene;

            //弹窗节点
            this._dialogList = {};
            //子节点UI
            this._childList = {};
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.UIManager, "ulee.UIManager", _super);
        var _proto = ulee.UIManager.prototype;

        /**
         * 打开UI
         * @param ui场景名、参数，完成回调
         */
        _proto.openUI = function (sceneUrl, caller, arg, callback) {
            if (caller) {
                var name = caller.url;
                if (!this._childList[name]) {
                    this._childList[name] = [];
                }
                this._childList[name].push(sceneUrl);
                Laya.loader.create(sceneUrl, Laya.Handler.create(this, function (res) {
                    if (!res) return;
                    var runtime = res.props.runtime ? res.props.runtime : res.type;
                    var clas = Laya.ClassUtils.getClass(runtime);
                    let scene = new clas();
                    scene.url = sceneUrl;
                    scene.createView(res);
                    scene.onOpened(arg);
                    caller.addChild(scene);
                    callback && callback.run();
                }));
            } else {
                Laya.Scene.open(sceneUrl, false, arg, callback);
            }
        };

        /**
         * 打开弹窗
         * @param dialogName
         * @param arg
         * @param callback
         * @param caller 调用者
         */
        _proto.openDialog = function (dialogUrl, caller, arg, callback) {
            if (caller) {
                var name = caller.url;
                if (!this._dialogList[name]) {
                    this._dialogList[name] = [];
                }
                this._dialogList[name].push(dialogUrl);

                Laya.loader.create(sceneUrl, Laya.Handler.create(this, function (res) {
                    let node = new Laya.View();
                    node.createView(res);
                    caller.addChild(node);
                    callback && callback();
                }));
            } else {
                Laya.Scene.open(dialogUrl, false, arg, callback);
            }
        };

        /**
         * 关闭弹窗
         */
        _proto.closeDialog = function (dialogUrl) {
            var dialogs = Laya.stage._children[1]._children;
            for (var i = 0; i < dialogs.length; i++) {
                if (dialogs[i].url == dialogUrl) {
                    dialogs[i].close();
                    break;
                }
            }
        };

        /**
         * 关闭场景
         * @param sceneUrl
         * @returns {*} 是否移除成功
         */
        _proto.closeUI = function (sceneUrl) {
            var layer = this.getUI(sceneUrl);
            if (layer) {
                var name = layer.url;
                //移除子节点弹窗
                if (this._dialogList[name]) {
                    var list = this._dialogList[name];
                    for (var i = 0; i < list.length; i++) {
                        this.closeDialog(list[i]);
                    }
                }
                this._dialogList[name] = null;
                //移除子节点UI
                if (this._childList[name]) {
                    var list = this._childList[name];
                    for (var i = 0; i < list.length; i++) {
                        this.closeUI(list[i]);
                    }
                }
                this._childList[name] = null;
                layer.close();
            }
        };

        //获取UI
        _proto.getUI = function (sceneUrl, caller) {
            if (caller) {
                this._uiList = caller._children;
            } else {

                this._uiList = Laya.stage._children[0]._children;
            }
            if (!this._uiList) {
                console.error("未从uimanager打开任何场景");
                return;
            }
            let layer = null;
            for (let i = 0; i < this._uiList.length; i++) {
                layer = this._uiList[i];
                if (layer.destroyed) {
                    this._uiList.removeAt(i);
                    i--;
                    continue;
                }
                if (layer.url == sceneUrl) {
                    return layer;
                }
            }
            console.error("查无此UI");
            return null;
        };
    })();
    window.uiManager = new ulee.UIManager();

    /**
     * Created by Administrator on 2019/11/28.
     * 数据管理
     */
    (function () {
        ulee.DataManager = function () {
            this._data = {};
            this.init();
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.DataManager, "ulee.DataManager");
        var _proto = ulee.DataManager.prototype;

        _proto.init = function () {
            this._localData = Laya.LocalStorage;
            this._userData = {};
        };

        _proto.initData = function () {
            this.dataName = "PlayerData";
            this.getStorage(function (data) {
                PlayerData.getIns().copyFrom(data);
                if (this.compareTime(PlayerData.getIns().firstLoginDate)) {
                    //是否是老用户（登陆2天以上）
                    G.OLDUSER = true;
                }
                G.ISVIBRATE = PlayerData.getIns().isVibrate;
                G.ISSOUND = PlayerData.getIns().isSound;
                PlayerData.getIns().setTryoutSkin(0);
                PlayerData.getIns().initTaskConfig();
                PlayerData.getIns().setInGameTime();
                if (this.compareTime(PlayerData.getIns().inGameTime)) {
                    PlayerData.getIns().initInGameTime();
                    // 签到
                    PlayerData.getIns().setSgin(true);
                    PlayerData.getIns().initSginTime();
                    if (PlayerData.getIns().sginDay >= 3) {
                        PlayerData.getIns().initSginDay();
                    }
                    // 任务
                    PlayerData.getIns().initTaskCompleteNum();
                    // 判断任务是否在开启界面,时间已经过了0点,时已经更新(true更新过, false未更新过)
                    if (!PlayerData.getIns().isUpdateTask) {
                        PlayerData.getIns().updateTaskConfig();
                    } else {
                        PlayerData.getIns().setIsUpdateTask(false);
                    }
                    PlayerData.getIns().setTaskAllComplete(false);
                    PlayerData.getIns().setIsGetTask(false);
                }
            }.bind(this));
        };

        //对比时间, A是否比B早  ， B不写默认为今天的凌晨
        _proto.compareTime = function (timeA, timeB) {
            if (!timeB) {
                var currentDate = new Date();
                timeB = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime(); //今天凌晨
            } else {
                timeB = timeB.getTime();
            }
            if (timeA < timeB) {
                return true;
            }
        };

        _proto.getData = function (key) {
            return this._data[key];
        };

        /**
         * 设置数据
         * @param key
         * @param data
         * @param isReplace 是否覆盖已有数据
         */
        _proto.setData = function (key, data, isReplace) {
            if (!this._data[key]) {
                this._data[key] = data;
            } else {
                if (isReplace) {
                    this._data[key] = data;
                } else {
                    console.log("已存在数据");
                }
            }
        };

        _proto.clearData = function () {
            this._data = {};
            this.init();
        };

        _proto.setStorage = function (data, _key) {
            let tkey = _key ? _key : this.dataName;
            if (Laya.Browser.onMiniGame) {
                wx.setStorage({
                    key: tkey,
                    data: data
                });
            }
            else {
                Laya.LocalStorage.setItem(tkey, JSON.stringify(data));
            }
        };
        _proto.getStorage = function (func, _key) {
            let tkey = _key ? _key : this.dataName;
            let tdata;
            if (Laya.Browser.onMiniGame) {
                wx.getStorage({
                    key: tkey,
                    success(res) {
                        if (func)
                            func(res.data);
                    },
                    fail(res) {
                        tdata = Laya.LocalStorage.getItem(tkey);
                        if (tdata)
                            tdata = JSON.parse(tdata);
                        if (func)
                            func(tdata);
                    }
                });
            }
            else {
                tdata = Laya.LocalStorage.getItem(tkey);
                if (tdata)
                    tdata = JSON.parse(tdata);
                if (func)
                    func(tdata);
            }
        };
        _proto.removeStorage = function (func, _key) {
            let tkey = _key ? _key : this.dataName;
            if (Laya.Browser.onMiniGame) {
                wx.removeStorage({
                    key: tkey,
                    success(res) {
                        if (func)
                            func(res.data);
                    },
                    fail(res) {
                        if (func)
                            func(-1);
                    }
                });
            }
            else {
                Laya.LocalStorage.removeItem(tkey);
            }
        };

        _proto.clearStorage = function (func) {
            if (Laya.Browser.onMiniGame) {
                wx.clearStorage({
                    success(res) {
                        if (func)
                            func(res.data);
                    },
                    fail(res) {
                        if (func)
                            func(-1);
                    }
                });
            }
            else {
                Laya.LocalStorage.clear();
            }
        };

        // 检测任务
        _proto.checkTask = function () {
            var taskArr = PlayerData.getIns().getTaskConfig();
            for (var i = 0; i < taskArr.length; i++) {
                var data = taskArr[i];
                var taskConfig = D.taskConfig[data.id];
                if (data.num >= taskConfig.maxNum && !data.isGet) {
                    return true;
                }
            }
            return false;
        };


        /**
         * 查询拥有的背饰
         */
        _proto.queryOwnBackDecoration = function (val) {
            var arr = PlayerData.getIns().ownBackDecorationArr;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) return true;
            }
            return false;
        };

        /**
         * 查询拥有的头饰
         */
        _proto.queryOwnHeadDecoration = function (val) {
            var arr = PlayerData.getIns().ownHeadDecorationArr;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) return true;
            }
            return false;
        };

        /**
         * 试用皮肤
         */
        _proto.getTryout = function () {
            var arr = [], arr2 = [], arr3 = [];
            var noOwnArr = [];
            if (PlayerData.getIns().ownBackDecorationArr.length > 0) {
                arr = PlayerData.getIns().ownBackDecorationArr.split(",");
            }
            if (PlayerData.getIns().ownHeadDecorationArr.length > 0) {
                arr2 = PlayerData.getIns().ownHeadDecorationArr.split(",");
            }
            arr3 = arr.concat(arr2);
            for (var key in D.roleConfig) {
                var data = D.roleConfig[key];
                var own = false;
                for (var i = 0; i < arr3.length; i++) {
                    if (data.id == arr3[i]) {
                        own = true;
                    }
                }
                if (!own) {
                    noOwnArr.push(data);
                }
            }
            return noOwnArr;
        };

    })();

    /**
     * Created by Administrator on 2019/11/28.
     * 计时器管理
     */
    (function (_super) {
        ulee.UpdateManager = function () {
            this.id = 0;
            this.totalTime = 0;
            this.LoopArr = {};
            Laya.timer.frameLoop(1, this, this.update);
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.UpdateManager, "ulee.UpdateManager", _super);
        var _proto = ulee.UpdateManager.prototype;

        _proto.update = function(e){
            var frameInterval = Laya.timer.delta / 1000;
            this.totalTime += frameInterval;
            G.FPSAVERAGE = parseInt(1 / frameInterval);
            G.FRAME_INTERVAL = frameInterval > 0.03 ? 0.03 : frameInterval;
            G.NOW = Laya.Browser.now();
            for(var key in this.LoopArr) {
                var item = this.LoopArr[key];
                if(!item.caller){
                    console.log("warning:有方法没被移除" + item.func);
                    continue;
                }
                if(item.type == G.ENUM_LOOP_TYPE.FRAME) {
                    //帧循环
                    item.frame++;
                    if(item.frame == item.targetFrame) {
                        item.func();
                        if(item.isOnce) {
                            delete this.LoopArr[key];
                        }else{
                            item.frame = 0;
                        }
                    }
                }else if(item.type == G.ENUM_LOOP_TYPE.TIME) {
                    //时间循环
                    item.time += frameInterval;
                    if(item.time >= item.targetTime) {
                        item.func();
                        if(item.isOnce) {
                            delete this.LoopArr[key];
                        }else{
                            item.time = 0;
                        }
                    }
                }
            }
        };

        /**
         * 帧循环
         * @param delay 帧数
         * @param caller
         * @param func
         * @param args
         * @returns {string}
         */
        _proto.frameLoop = function(delay, caller, func, args){
            var funcID = this.id++;
            var key = "FL"+funcID;
            var item = {
                frame:0,
                targetFrame:delay,
                func:func.bind(caller, args),
                args:args,
                caller:caller,
                type:G.ENUM_LOOP_TYPE.FRAME,
                id:funcID
            };
            this.LoopArr[key] = item;
            //添加到父类updateArr里方便移除时一起移除
            if(caller.$updateArr){
                caller.$updateArr.push(key);
            }else{
                caller.$updateArr = [key];
            }
            return key;
        };

        /**
         * 帧循环只调用一次
         * @param delay
         * @param caller
         * @param func
         * @param args
         * @returns {string}
         */
        _proto.frameOnce = function(delay, caller, func, args){
            var funcID = this.id++;
            var key = "FO"+funcID;
            var item = {
                frame:0,
                targetFrame:delay,
                func:func.bind(caller, args),
                args:args,
                isOnce:true,
                caller:caller,
                type:G.ENUM_LOOP_TYPE.FRAME,
                id:funcID
            };
            if(caller.$updateArr){
                caller.$updateArr.push(key);
            }else{
                caller.$updateArr = [key];
            }
            this.LoopArr[key] = item;
            return key;
        };

        /**
         * 时间循环
         * @param delay 时间
         * @param caller
         * @param func
         * @param args
         * @returns {string}
         */
        _proto.timeLoop = function(delay, caller, func, args){
            var funcID = this.id++;
            var key = "TL"+funcID;
            var item = {
                time:0,
                targetTime:delay,
                func:func.bind(caller, args),
                args:args,
                caller:caller,
                type:G.ENUM_LOOP_TYPE.TIME,
                id:funcID
            };
            if(caller.$updateArr){
                caller.$updateArr.push(key);
            }else{
                caller.$updateArr = [key];
            }
            this.LoopArr[key] = item;
            return key;
        };

        /**
         * 时间循环 只调用一次
         * @param delay
         * @param caller
         * @param func
         * @param args
         * @returns {string}
         */
        _proto.timeOnce = function(delay, caller, func, args){
            var funcID = this.id++;
            var key = "TO"+funcID;
            var item = {
                time:0,
                targetTime:delay,
                func:func.bind(caller, args),
                args:args,
                isOnce:true,
                caller:caller,
                type:G.ENUM_LOOP_TYPE.TIME,
                id:funcID
            };
            if(caller.$updateArr){
                caller.$updateArr.push(key);
            }else{
                caller.$updateArr = [key];
            }
            this.LoopArr[key] = item;
            return key;
        };

        /**
         * 清除循环
         * @param key
         */
        _proto.clear = function(key, caller){
            if(this.LoopArr[key]){
                delete this.LoopArr[key];
            }
            if(caller){
                caller.$updateArr.remove(key);
            }
        };

        _proto.clearAll = function(caller){
            if(caller.$updateArr){
                for(var i = 0; i < caller.$updateArr.length; i++){
                    var key = caller.$updateArr[i];
                    this.clear(key);
                }
                caller.$updateArr = null;
            }
        };
    })();

    /**
     *Created by LRJ on 2018/5/8.
     *Describe : 音效管理
     */
    (function () {
        ulee.AudioManager = function () {
            this.soundManager = Laya.SoundManager;
            this.soundManager.autoReleaseSound = false;
            this.soundManager.autoStopMusic = false;
            this.soundManager.useAudioMusic = false;
            if (!this.isBGM) {
                this.hasChangeMusic = true;
            }
            this.setSoundVolume(0.3);
            this.curSounds = {};
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.AudioManager, "ulee.AudioManager");
        var _proto = ulee.AudioManager.prototype;

        _proto.playMusic = function (bgmId) {
            if (bgmId) {
                if (this.bgmId != bgmId) {
                    this.bgmId = bgmId;
                    this.hasChangeMusic = true;
                } else {
                    this.hasChangeMusic = false;
                }
            } else {
                return;
            }
            if (!G.LOADMUSIC) return
            if (!G.ISSOUND) return;
            this.bgmId = bgmId ? bgmId : this.bgmId;
            this.soundManager.playMusic(this.getResurl(this.bgmId), 0);
            this.isPlaying = true;
        };
        _proto.stopMusic = function () {
            this.soundManager.stopMusic();
            this.isPlaying = false;
        };

        /**背景音乐静音*/
        _proto.setMusicMuted = function (isPlay) {
            this.soundManager.musicMuted = !isPlay;
            if (this.hasChangeMusic) {
                this.playMusic(this.bgmId);
                this.hasChangeMusic = false;
            }
        };
        /**设置背景音乐音量*/
        _proto.setMusicVolume = function (value) {
            this.soundManager.musicVolume = value;
        };

        /**播放音效*/
        _proto.playSound = function (id, complete, canRepeat) {
            if (!G.LOADMUSIC) return
            if (!G.ISSOUND) return;
            if (this.curSounds[id]) {
                if (!canRepeat) {
                    if (this.curSounds[id].length > 0) {
                        return;
                    }
                }
            } else {
                this.curSounds[id] = [];
            }


            var sound = this.soundManager.playSound(this.getResurl(id), 1, new Handler(this, function () {
                this.curSounds[id].removeAt(this.curSounds[id].indexOf(id));
                if (complete) {
                    complete();
                }
            }));
            this.curSounds[id].push(sound);
        };
        /**停止音效*/
        _proto.stopSound = function (id) {
            if (this.curSounds[id] && this.curSounds[id].length > 0) {
                for (var i = 0; i < this.curSounds[id].length; i++) {
                    if (Laya.Browser.onMiniGame) {
                        this.curSounds[id][i].destroy();
                    } else {
                        this.soundManager.stopSound(this.getResurl(id));
                    }
                    this.curSounds[id].removeAt(i);
                }
            }
        };

        /**设置音效音量*/
        _proto.setSoundVolume = function (value) {
            this.soundManager.soundVolume = value;
        };

        /**停止所有音效*/
        _proto.stopAllSound = function () {
            this.soundManager.stopAllSound();
        };

        /*获取音频路径*/
        _proto.getResurl = function (soundId) {
            var config = D.musicBasic[soundId];
            var file = config.file;
            return file;
        };
    })();

    /**
     * Created by Administrator on 2019/12/6.
     */

    (function () {
        /**
         * Loading项
         * @param loadFn 加载方法
         * @param count 给该加载项分配多少进度
         * @param checkFn 检查是否完成的方法
         * @constructor
         */
        ulee.LoadItem = function (loadFn, count, checkFn) {
            this.loaded = false;
            this.loadFn = loadFn;
            this.count = count;
            this.checkFn = checkFn;
            this.loading = null;
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.LoadItem, "ulee.LoadItem");
        var _proto = ulee.LoadItem.prototype;

        _proto.onComplete = function () {
            this.loaded = true;
        };

        _proto.start = function () {
            this.loadFn();
        };
    })();

    /**
     * Created by Administrator on 2019/12/11.
     */
    (function () {
        ulee.PromptUtils = function () {

        };
        var reg = Laya.ClassUtils.regClass;
        reg(ulee.PromptUtils, "ulee.PromptUtils");
        var _proto = ulee.PromptUtils.prototype;

        _proto.init = function () {
            this.bgSprite = new Laya.Image("nine/img_infoBase.png");
            this.bgSprite.width = Laya.stage.width - 40;
            this.bgSprite.height = 50;
            this.bgSprite.anchorX = 0.5;
            this.bgSprite.anchorY = 0.5;
            this.bgSprite.x = Laya.stage.width / 2;
            this.bgSprite.y = Laya.stage.height / 9;

            this.textOffx = 30;
            this.textOffy = 15;

            this.tipText = new Laya.Label();
            this.bgSprite.addChild(this.tipText);
            this.tipText.width = this.bgSprite.width - this.textOffx * 2;
            this.tipText.fontSize = 30;
            this.tipText.align = "center";
            this.tipText.color = "#ffffff";
            this.tipText.y = this.textOffy;
            this.bgSprite.zOrder = 2000;
            Laya.stage.addChild(this.bgSprite);

            this.timeLine = new Laya.TimeLine();
            this.timeLine.addLabel("scale", 0).to(this.bgSprite, { scaleX: 1.2, scaleY: 1.2, alpha: 1 }, 100, null, 0)
                .addLabel("back", 0).to(this.bgSprite, { scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 100, null, 0)
                .addLabel("show", 0).to(this.bgSprite, { alpha: 1 }, 1000, null, 0)
                .addLabel("hide", 0).to(this.bgSprite, { alpha: 0 }, 1000, null, 0);
            this.timeLine.on(Laya.Event.COMPLETE, this, this.onComplete);

            this.mouseThrough = true;
        };

        _proto.removeRes = function () {
            this.timeLine.destroy();
        };

        _proto.onComplete = function () {
            this.visible = false;
            this.bgSprite.visible = false;
            this.mouseThrough = true;
        };


        /** 获得物品提示 */
        _proto.prompt = function (msg) {
            this.tipText.text = msg;
            this.tipText.x = this.textOffx;
            this.bgSprite.height = 30 + this.textOffx;
            this.timeLine.play(0, false);
            this.bgSprite.visible = true;
            this.visible = true;
        };

        _proto.prompt1 = function (skin) {
            this.bgSprite.skin = skin;
            this.bgSprite.height = null;
            this.bgSprite.width = null;
            this.timeLine.play(0, false);
            this.visible = true;
        };

        _proto.resize = function () {
            if (this.bgSprite) {
                this.bgSprite.width = Laya.stage.width - 40;
                this.bgSprite.height = this.tipText.contextHeight + this.textOffx;
                this.bgSprite.x = Laya.stage.width / 2;
                this.bgSprite.y = Laya.stage.height / 8;
                if (this.tipText) {
                    this.tipText.style.width = this.bgSprite.width - this.textOffx * 2;
                }
            }
        };
    }());
    window.promptUtils = new ulee.PromptUtils();

    /**
     *Created by LRJ on 2018/5/4.
     *Describe : 浮动提示
     */

    (function () {
        ulee.MovePrompt = function () {
            this.needCloseBtn = false;
            this.$updateArr = [];
        };

        var reg = Laya.ClassUtils.regClass;
        reg(ulee.MovePrompt, "ulee.MovePrompt");
        var _proto = ulee.MovePrompt.prototype;

        _proto.init = function () {
            this.frameCount = 0;
            updateManager.frameLoop(1, this, this.update);
            this.paramsArray = [];
            this.promptArray = [];

            this.mouseThrough = true;
        };

        _proto.removeRes = function () {
            this.paramsArray = [];
            Laya.timer.clear(this, this.update);
        };

        _proto.addPrompt = function (msg) {
            if (this.paramsArray.length < 20) {
                this.paramsArray.push({"msg": msg});
            }
        };

        _proto.update = function () {
            if (this.frameCount++ < 15) {
                return;
            }
            var index = 0;
            for (var i = this.promptArray.length - 1; i >= 0; i--) {
                if (this.promptArray[i - 1] != undefined && this.promptArray[i].y - 40 <= this.promptArray[i - 1].y) {
                    index = i;
                    break;
                }
            }
            if (index > 0) {
                for (var i = index; i > 0; i--) {
                    this.collFly(this.promptArray[i - 1]);
                }
            }

            this.frameCount = 0;
            if (this.paramsArray.length > 0) {
                var params = this.paramsArray.shift();
                this.prompt(params.msg);
            }
        };

        /** 获得物品提示 */
        _proto.prompt = function (msg) {
            var spr = new Laya.Image("nine/img_infoBase.png");
            spr.y = Laya.stage.height / 2;
            // spr.sizeGrid = "5,5,5,5";
            spr.zOrder = 2000;
            Laya.stage.addChild(spr);

            var text2 = new Laya.Text();
            text2.fontSize = 35;
            text2.color = "#ffffff";
            text2.text = msg;
            spr.addChild(text2);

            spr.size(text2.width + 100, text2.height + 20);
            spr.x = (Laya.stage.width - spr.width) / 2;
            text2.x = 50;
            text2.y = (spr.height - text2.height) / 2;

            this.promptArray.push(spr);

            Laya.Tween.to(spr, {
                y: Laya.stage.height / 4
            }, 1500, Laya.Ease.expoOut, new Laya.Handler(this, function () {
                this.removeSpr(spr);
            }));
        };

        _proto.collFly = function (spr) {
            if (!spr.m_delayTime) {
                spr.m_delayTime = 1;
            } else {
                spr.m_delayTime++;
            }
            if (spr.m_delayTime > 7) {
                return;
            }
            Laya.Tween.clearTween(spr);

            Laya.Tween.to(spr, {
                y: Laya.stage.height / 4 - 50 * spr.m_delayTime
            }, Math.max(100, 800 - spr.m_delayTime * 100), Laya.Ease.expoOut, new Laya.Handler(this, function () {
                this.removeSpr(spr);
            }));
        };

        _proto.removeSpr = function (spr) {
            this.promptArray.remove(spr);
            spr.removeSelf();
        };

    })();
    window.movePromptUtils = new ulee.MovePrompt();

    /**
     * Created by Administrator on 2019/12/11.
     */
    (function () {
        ulee.GuideScript = function () {
            // 父节点
            this.guideUI = null;
            // 引导容器
            this.guideContainer = null;
            // 引导遮罩
            this.maskArea = null;
            // 可交互区域
            this.interactionArea = null;
            // 点击区域
            this.hitArea = null;
            // 提示区域
            this.tipContainer = null;
            // 引导数
            this.guideStep = 0;
            // 引导位置
            this.guideSteps = [];
            // this.guideSteps = [{ x: 5, y: 1167, width: 150, height: 150 },{ x: 5, y: 1005, width: 150, height: 150 }];
        };
        var reg = Laya.ClassUtils.regClass;
        reg(ulee.GuideScript, "ulee.GuideScript");
        var _proto = ulee.GuideScript.prototype;

        _proto.init = function (guideUI, attributeArr) {
            this.guideUI = guideUI;
            for (var i = 0; i < attributeArr.length; i++) {
                this.guideSteps.push(attributeArr[i]);
            }
            this.createPage();
        };

        /**
         * 绘制遮罩
         */
        _proto.createPage = function () {
            // 引导容器
            this.guideContainer = new Laya.Sprite();
            this.guideUI.addChild(this.guideContainer);
            this.guideContainer.cacheAs = 'bitmap';
            // 绘制遮罩区域
            this.maskArea = new Laya.Sprite();
            this.guideContainer.addChild(this.maskArea);
            this.maskArea.alpha = 0.8;
            this.maskArea.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, '#000');
            // 可交互区域
            this.interactionArea = new Laya.Sprite();
            this.guideContainer.addChild(this.interactionArea);
            this.interactionArea.blendMode = 'destination-out';
            // 设置点击区域
            this.hitArea = new Laya.HitArea();
            this.hitArea.hit.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000");
            this.guideContainer.hitArea = this.hitArea;
            this.guideContainer.mouseEnabled = true;
            // 提示区域
            this.tipContainer = new Laya.Label();
            this.tipContainer.font = "SimHei";
            this.tipContainer.fontSize = 45;
            this.tipContainer.color = "#f8f6f6";
            this.tipContainer.align = "left";
            this.tipContainer.wordWrap = true;
            this.tipContainer.width = Laya.stage.width * 0.6;
            Laya.stage.addChild(this.tipContainer);

            this.nextStep();
        };

        /**
         * 下一个
         */
        _proto.nextStep = function () {
            if (this.guideStep === this.guideSteps.length) {
                Laya.stage.removeChild(this.guideContainer);
                Laya.stage.removeChild(this.tipContainer);
                return;
            } else {
                var step = this.guideSteps[this.guideStep++];

                this.hitArea.unHit.clear();
                this.hitArea.unHit.drawRect(step.x, step.y, step.width, step.height, "#000000");

                this.interactionArea.graphics.clear();
                this.interactionArea.graphics.drawRect(step.x, step.y, step.width, step.height, "#000000");

                //提示语句
                if (step.tipstr) {
                    this.tipContainer.text = step.tipstr;
                    this.tipContainer.x = step.x + step.width + 50;
                    this.tipContainer.y = step.y;
                } else {
                    this.tipContainer.text = "";
                }
            }

        };

        /**
         * 清除
         */
        _proto.clearPage = function () {
            this.guideContainer && this.guideContainer.destroy();
            this.tipContainer && this.tipContainer.destroy();
        };

    }());
    window.guideScript = new ulee.GuideScript();

    /**
     * Created by Administrator on 2020/2/15.
     * 游戏战斗脚本
     */
    (function () {
        ulee.BattleMgr = function () {
            this.$updateArr = [];

        };

        var reg = Laya.ClassUtils.regClass;
        reg("ulee.BattleMgr", ulee.BattleMgr);
        var _proto = ulee.BattleMgr.prototype;

        _proto.initData = function () {
            this.overGame = false;

            // 终点中心圆柱位置
            this.endColumnPos = new Laya.Vector3();
            // 终点中心圆柱模型
            this.endColumnModel = null;

            // 到达终点
            this.todoEnd = false;
        };

        _proto.initRound = function (roundId, callback) {
            this.initData();
        };

        _proto.startGame = function () {
            this.initRound();
            G.BattleScript.clearModel();
        };

        _proto.endGame = function (isWin) {
            if (this.overGame) return;
            this.overGame = true;
            battleMgr.isGameStart = false;
            if (isWin) {
                console.log("胜利");
                uiManager.openUI("game/VictoryView.scene", null, {
                    num: G.BattleScript.role_character.script.hulaCnt,
                    callback: function () {
                        audioManager.playMusic(2);
                    }
                });
            } else {
                console.log("失败");
                audioManager.playSound(14);
                uiManager.openUI("game/DefeatView.scene", null, {
                    callback: function () {
                        audioManager.playMusic(2);
                    }
                });
            }
        };

        // 复活
        _proto.revive = function () {

        };

        _proto.restartGame = function () {

        };

        //游戏主逻辑
        _proto.loop = function () {
            var delta = G.FRAME_INTERVAL;

        };


    })();
    window.battleMgr = new ulee.BattleMgr();

    class Main {
    	constructor() {
    		//根据IDE设置初始化引擎
    		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
    		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
    		Laya.stage.bgColor = "#000000";
    		Laya["Physics"] && Laya["Physics"].enable();
    		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
    		Laya.stage.scaleMode = GameConfig.scaleMode;
    		Laya.stage.screenMode = GameConfig.screenMode;
    		Laya.stage.alignV = GameConfig.alignV;
    		Laya.stage.alignH = GameConfig.alignH;
    		//兼容微信不支持加载scene后缀场景
    		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

    		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
    		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
    		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
    		if (GameConfig.stat) Laya.Stat.show();
    		Laya.alertGlobalError = true;

    		/*
    		 * 自适应算法
    		 */
    		function calcWH() {
    			if (G.SCREEN_MODE == G.SCREEN_MODETYPE.H) {
    				//横屏适配
    				var maxHeight = 854;
    				var minHeight = 720;
    				var data = {};
    				var clientWidth = Laya.Browser.clientWidth * Laya.Browser.pixelRatio;
    				var clientHeight = Laya.Browser.clientHeight * Laya.Browser.pixelRatio;
    				var rate = 1559 / 720;
    				var rateMin = 1559 / maxHeight;
    				var rateMax = 1559 / minHeight;
    				var clientRate;

    				// 如果玩家横屏玩，提示竖屏体验更好
    				if (!Laya.Browser.onPC) {
    					clientRate = (clientHeight > clientWidth) ? (clientHeight / clientWidth) : (clientWidth / clientHeight);
    				} else {
    					clientRate = clientHeight / clientWidth;
    				}

    				var trueRate = clientRate;
    				if (clientRate > rate) {//过细
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_AUTO;
    					data['height'] = minHeight;
    					data['width'] = 1559;
    					G.ratio = Laya.Browser.clientWidth / Laya.stage.width;
    				} else if (clientRate < rate) {//过粗
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_AUTO;
    					data['height'] = maxHeight;
    					data['width'] = 1559;
    					G.ratio = Laya.Browser.clientHeight / Laya.stage.height;
    				} else {
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_HEIGHT;
    					data['height'] = 720;
    					data['width'] = 1559;
    					G.ratio = Laya.Browser.clientWidth / Laya.stage.width;
    				}
    				data['trueRate'] = trueRate;
    			} else {
    				//竖屏适配
    				var maxWidth = 854;
    				var minWidth = 720;
    				var data = {};
    				var clientWidth = Laya.Browser.clientWidth * Laya.Browser.pixelRatio;
    				var clientHeight = Laya.Browser.clientHeight * Laya.Browser.pixelRatio;
    				var rateMin = 1559 / maxWidth;
    				var rateMax = 1559 / minWidth;
    				var clientRate;

    				// 如果玩家横屏玩，提示竖屏体验更好
    				if (!Laya.Browser.onPC) {
    					clientRate = (clientHeight > clientWidth) ? (clientHeight / clientWidth) : (clientWidth / clientHeight);
    				} else {
    					clientRate = clientHeight / clientWidth;
    				}

    				var trueRate = clientRate;
    				if (clientRate > rateMax) {//过细
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_AUTO;
    					data['height'] = 1559;
    					data['width'] = minWidth;
    					G.ratio = Laya.Browser.clientWidth / Laya.stage.width;
    				} else if (clientRate < rateMin) {//过粗
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_AUTO;
    					data['height'] = 1559;
    					data['width'] = maxWidth;
    					G.ratio = Laya.Browser.clientHeight / Laya.stage.height;
    				} else {
    					data['scaleMode'] = Laya.Stage.SCALE_FIXED_HEIGHT;
    					data['height'] = 1559;
    					data['width'] = maxWidth;
    					G.ratio = Laya.Browser.clientWidth / Laya.stage.width;
    				}
    				data['trueRate'] = trueRate;
    			}

    			return data;
    		}
    		Laya.stage._setScreenSize = Laya.stage.setScreenSize;
    		Laya.stage.setScreenSize = function (screenWidth, screenHeight, doNotCheck) {
    			if (Laya.stage._isInputting()) return;//处于输入状态不进行尺寸调整，否则容易出现异常。
    			var tem = calcWH();
    			this._scaleMode = tem.scaleMode;
    			this.designHeight = tem.height;
    			this.designWidth = tem.width;
    			this._setScreenSize(screenWidth, screenHeight);

    			if (!doNotCheck) {//间隔2秒再次校验。修正微信旋转后显示BUG。
    				Laya.timer.once(2000, null, function () {
    					Laya.stage.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio, true);
    				});
    			}
    		};
    		Laya.stage._changeCanvasSize();

    		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
    		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);

    		if (window.VConsole) {
    			new VConsole();
    		}
    	}

    	onVersionLoaded() {
    		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
    		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    	}

    	onConfigLoaded() {
    		//加载框架必要类
    		window.updateManager = new ulee.UpdateManager();
    		window.uiManager = new ulee.UIManager();
    		window.audioManager = new ulee.AudioManager();
    		eventDispatcher.addEventListen(ulee.Event.ON_DATA_LOAD, this, function () {
    			window.dataManager = new ulee.DataManager();
    			dataManager.initData();
    			//加载IDE指定的场景
    			GameConfig.startScene && uiManager.openUI(GameConfig.startScene);
    		});
    		initData();
    	}
    }
    //激活启动类
    new Main();

    //修改屏幕显示模式（横竖屏， 默认横屏）
    function setScreenMode(modeType) {
    	G.SCREEN_MODE = modeType;
    	if (modeType == G.SCREEN_MODETYPE.H) {
    		Laya.stage.screenMode = "horizontal";
    	} else {
    		Laya.stage.screenMode = Laya.Browser.onPC ? Laya.Stage.SCREEN_NONE : Laya.Stage.SCREEN_VERTICAL;
    	}
    	Laya.stage.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio, true);
    };

}());
