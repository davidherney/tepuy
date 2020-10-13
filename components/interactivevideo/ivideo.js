(function(){
    "use strict";
    const TRIGGER_AT_ATTR = 'data-ivideo-show';
    const HIDE_AT_ATTR = 'data-ivideo-hide';
    const WAIT_ATTR = 'data-wait';

    // ==============================================================================================
    // tepuyInteractiveVideo helpers
    // ==============================================================================================
    function delayExec(action, delay = 0) {
        setTimeout(action, delay);
    }

    function enterFullscreen(el) {
        const method = el.requestFullscreen ||
            el.mozRequestFullScreen ||
            el.webkitRequestFullscreen ||
            el.msRequestFullscreen;

        let result = method && method.call(el);
        if (result && result.then) return result;
        return Promise.resolve(result || false);
    }

    function exitFullscreen() {
        const method = document.exitFullscreen ||
            document.mozCancelFullScreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen;

        let result = method && method.call(document);
        if (result && result.then) return result;
        return Promise.resolve(result || false);
    }

    function randomize(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getVideoSrc($host, data) {
        if (data.src) return data.src;
        const html5player = $host.find('video').get(0);
        if (html5player) {
            return html5player.currentSrc || html5player.src;
        }
        return '';
    }

    function formatDuration(time) {
        if (isNaN(time) || time < 1) return '00:00';
        const sec = Math.floor(time % 60);
        time = Math.floor(time / 60);
        let min = time % 60;
        time = Math.floor(time / 60);
        let result = '';
        if (time > 0) {
            result += time + ':';
        }

        if (min < 10) result += '0';
        result += min + ':';
        if (sec < 10) result += '0';
        result += sec;
        return result;
    }

    function durationToNumber(duration) { //duration in seconds
        const [days, hours, min, sec] = /^(?:(\d)+\.)?(?:(\d{1,2})\:)?(?:(\d{1,2})\:)(\d{1,2})$/.exec(duration).slice(1).map(g => isNaN(Number(g)) ? 0 : Number(g));
        const onemin = 60, onehour = onemin * 60, oneday = onehour * 24;
        return sec + min * onemin + hours * onehour + days * oneday;
    }

    function isValidUrl(url) {
        return true;
    }

    function isYoutube(url) {
        return false;
    }

    function isEnterOrSpace(key) {
        return key.which == 13 || key.which == 32;
    }

    function raiseEvent(eventName, target, params) {
        return function() {
            $(target).trigger(eventName, Array.prototype.slice.call(arguments).concat(params||[]));
        };
    }

    ///This class is just a wrapper of the HTML5 video player element
    class HTML5Player {
        constructor(options) {
            const $parent = $(options.parent);
            let $player = $parent.find('video');
            if (!$player.length) {
                $player = $('<video>', {
                    src: options.src
                });
                $parent.append($player);
            }
            const player = $player.get(0);

            //Validate a src is provided
            if (!player.src && !player.currentSrc) {
                throw 'Interactive video requires a source video url';
            }

            //Show player controls
            player.controls = options.controls && options.controls === true;

            if ($parent.is('[data-autoplay]')) {
                player.autoplay = true;
            }

            this.$parent = $parent;
            this.player = player;
            this.$player = $player;

            this._registerEvents();
        }

        get $el() {
            return this.$player;
        }

        get autoplay() {
            return this.player.autoplay;
        }

        get paused() {
            return this.player.paused;
        }

        get muted() {
            return this.player.muted;
        }

        get currentTime() {
            return this.player.currentTime;
        }

        get controls() {
            return this.player.controls;        
        }

        set controls(value) {
            this.player.controls = value;
        }

        get duration() {
            return this.player.duration;
        }

        get buffered() {
            const duration = this.player.duration;
            if (duration <= 0) return 0;

            const ranges = this.player.buffered;
            const currentTime = this.player.currentTime;
            let i = ranges.length;
            let buffered = 0;
            while(i) {
                if (ranges.start(--i) <= currentTime) {
                    buffered = ranges.end(i);
                    break;
                }
            }
            return buffered ? buffered / duration * 100 : 0;
        }

        get dimensions() {
            return {
                width: this.player.videoWidth,
                height: this.player.videoHeight
            };
        }

        pause() {
            this.player.pause();
        }

        play() {
            this.player.play();
        }

        seek(time) {
            console.log('Seeking at ' + time);
            console.log(time);
            this.player.currentTime = time;
        }

        toggleVolume() {
            this.player.muted = !this.player.muted;
        }

        playAndPause() {
            this.playPromise = true;
            const muted = this.player.muted;
            this.player.muted = true;
            let promise = this.player.play();
            if (promise && promise.then) {
                promise.then(() => {
                    delayExec(() => {
                        this.player.pause();
                        this.player.muted = muted;
                        this.playPromise = false;
                    });
                });
            }
            else {
                this.player.pause();
                this.player.muted = muted;
                this.playPromise = false;
            }
        }

        enterFullscreen() {
            return enterFullscreen(this.player);
        }

        _registerEvents() {
            const player = this.player;

            player.addEventListener('timeupdate', raiseEvent('timeupdate', this));
            player.addEventListener('play', raiseEvent('play', this));
            player.addEventListener('pause', raiseEvent('pause', this));
            player.addEventListener('loadedmetadata', raiseEvent('loaded', this));
            player.addEventListener('progress', raiseEvent('progress', this));
            player.addEventListener('ended', raiseEvent('ended', this));
        }
    }

    function createYTPlayer(options) {
    }

    class IVideoAction {

        constructor(host, ivideo) {
            this.ivideo = ivideo;
            this.host = host;
            $(this.host).hide();
        }
        
        get triggerAt() {
            if (this.host.hasAttribute(TRIGGER_AT_ATTR)) {
                return durationToNumber(this.host.getAttribute(TRIGGER_AT_ATTR));
            }
            return -1;
        }

        set triggerAt(value) {
            this.host.setAttribute(TRIGGER_AT_ATTR, value);
        }

        get hideAt() {
            if (this.host.hasAttribute(HIDE_AT_ATTR)) {
                return durationToNumber(this.host.getAttribute(HIDE_AT_ATTR));
            }
            return -1;
        }

        set hideAt(value) {
            this.host.setAttribute(HIDE_AT_ATTR, value);
        }

        get wait() {
            return this.host.hasAttribute(WAIT_ATTR) && this.host.getAttribute(WAIT_ATTR).toLowerCase() !== 'false';
        }

        set wait(value) {
            this.host.setAttribute(WAIT_ATTR, value);
        }

        run(editMode) {
            this.editMode = editMode;
            return new Promise((resolve, reject) => {
                const $actionEl = $(this.host);
                const me = this;
                if (this.wait) {
                    $actionEl.one('tpy:component-completed', function(data) {
                        me.stop();
                        resolve(data);
                    });
                    //$actionEl.show(); //ToDo:Is this the right start action?
                    this._display($actionEl);
                }
                else {
                    //$actionEl.show();
                    this._display($actionEl);
                    resolve();
                }
            });
        }

        _display($el) {
            if (this.$viewer) {
                this.$viewer.show();
                return;
            }

            //Get appropiate values for the position from the element $el
            const $container = $el.parent();
            const width = $container.width();
            const height = $container.height();

            let css = {
                position: 'absolute',
                top: height * 0.1,
                left: width * 0.1,
                width: 'auto', //width * 0.5,
                height: 'auto', //height * 0.8
            };

            const data = $el.data();
            const ivideoId = this.ivideo.host.id;
            const elCss = {
                top: data.posTop,
                left: data.posLeft,
                width: data.sizeWidth,
                height: data.sizeHeight
            };
            css = $.extend(css, elCss);

            this.$viewer = $('<div/>', {
                'class': 'tpy-action-viewer ' + ivideoId,
                css: css,
                appendTo: $container
            });
            const $wrapper = $('<div/>', {
                'class': 'tpy-action-viewer-content ' + ivideoId,
                appendTo: this.$viewer,
                css: {
                    width: '100%',
                    height: '100%',
                    overflow: 'auto'
                }
            });
            $el.appendTo($wrapper).show();
            this.$viewer.show();
            if (this.editMode) {
                this.$viewer
                    .draggable({
                        containment: 'parent',
                        cursor: 'move',
                        handle: '.tpy-action-viewer-content',
                        stop: function(e, ui) {
                            const data = {
                                posTop: ui.position.top,
                                posLeft: ui.position.left
                            };
                            $el.data(data);
                            $el.trigger('tpy:drag-completed', [ui]);
                        }
                    })
                    .resizable({ 
                        containment: $container,
                        handles: 'all',
                        classes: {
                            'ui-resizable-se': ''
                        },
                        stop: function(e, ui) {
                            const data = {
                                posTop: ui.position.top,
                                posLeft: ui.position.left,
                                sizeWidth: ui.size.width,
                                sizeHeight: ui.size.height
                            };

                            $el.data(data);
                            $el.trigger('tpy:resize-completed', [ui]);
                        }
                    })
                    ;
                this.host.addEventListener('DOMNodeRemoved', (e) => {
                    if (this.ivideo.refreshing) return;
                    setTimeout(() => {
                        $(this.ivideo).trigger('tpy:ivideo-action-removed', [this]);
                    }, 10);
                }, { once: true });
            }
        }

        stop() {
            this.$viewer.hide();
            //$(this.host).hide(); //ToDo:Is this the righ stop action?
        }

        createMarker() {
            const me = this;
            const $marker = $('<div/>', {
                "class" : "tpy-action-mark",
                title: me.title,
                css: {
                    left: me.triggerAt * me.ivideo.oneSecStep + '%'
                },
                on: {
                    click: me.selectMarker.bind(me)
                }
            });
            me.$marker = $marker;
            return $marker;
        }

        selectMarker() {
            console.log('Marker selected');
            const me = this;
            me.ivideo.seek(me.triggerAt);
        }
    }

    class IVideo {

        constructor(host) {
            this.host = host;
            this.$host = $(host);
            this._pendingActions = [];
            this._runningActions = [];
            this._actions = [];
            const data = this.$host.data();
            const src = getVideoSrc(this.$host, data);

            //Validate the src is valid
            if (!isValidUrl(src)) {
                throw 'Interactive video src attribute is not a valid url';
            }

            //Bind callbacks
            this._onTimeUpdate = this._onTimeUpdate.bind(this);
            this._onPlay = this._onPlay.bind(this);
            this._onPause = this._onPause.bind(this);
            this._onLoaded = this._onLoaded.bind(this);
            this._onProgress = this._onProgress.bind(this);
            this._onEnded = this._onEnded.bind(this);
            this._onResize = this._onResize.bind(this);
            this._onFullScreenChanged = this._onFullScreenChanged.bind(this);

            this._initializeLayout(host, src);
        }

        _initializeLayout(host, src) {
            const me = this;
            //Create video wrapper
            me.$videoWrapper = $('<div/>', {
                "class":'tpy-ivideo-wrapper'
            });
            //Create toolbar (For controls, bookmarks and other staff)
            me._createVideoToolbar();
            me.$host.append(me.$videoWrapper);
            me.$host.append(me.$toolbar);

            //Create player
            const playerOptions = {
                parent: host,
                src: src,
                controls: false
            };

            const videoPlayer = isYoutube(src) ? createYTPlayer(playerOptions) : new HTML5Player(playerOptions);
            videoPlayer.$el.appendTo(me.$videoWrapper);
            
            me.videoPlayer = videoPlayer;
            $(videoPlayer)
                .on('loaded', me._onLoaded)
                .on('play', me._onPlay)
                .on('pause', me._onPause)
                .on('timeupdate', me._onTimeUpdate)
                .on('progress', me._onProgress)
                .on('ended', me._onEnded)
                ;

            $(this).on('tpy:ivideo-action-removed', (action) => {
                this.refreshInteractions();
            });

            $(window).on('resize', me._onResize);

            me.$host.on('fullscreenchange', me._onFullScreenChanged);
            me._updateBufferBar();
        }

        _processInteractions() {
            const me = this;
            const ivideoId = this.host.id;
            //Read the interactive actions
            let $children = me.$host.find(`.tpy-action-viewer.${ivideoId} > .tpy-action-viewer-content > [data-cmpt-type]`);
            $children = $children.add(me.$videoWrapper.children('[data-cmpt-type]'));
            $children = $children.add(me.$host.children('[data-cmpt-type]'));
            me._actions = $children.map((i, el) => {
                $(el).appendTo(me.$videoWrapper).hide();
                return new IVideoAction(el, me);
            }).get();
            //Clear any previous viewer
            me.$videoWrapper.find('.tpy-action-viewer').remove();

            const $wrapper = me.$host.find('.tpy-ivideo-toolbar-slider');
            me.controls.$actionBar = me._createActionsBar($wrapper);
        }

        _onTimeUpdate(e) {
            const me = this;
            const videoPlayer = me.videoPlayer;
            const isEditing = this.$host.is('.tpy-edit');
            if (!isEditing && videoPlayer.paused) return; //Do not run any action if the video is not playing;

            const currentTime = videoPlayer.currentTime;
            me.updateTime(currentTime);
            
            //Stop running actions that needs to be stopped
            const tostop = me._runningActions.filter(a => a.hideAt < currentTime);
            me._stopActions(tostop);
            //Get action to run
            const action = me._pendingActions.find(a => currentTime >= a.triggerAt);
            if (!action) return; //No action found to execute;
            me._pendingActions = me._pendingActions.slice(1);
            if (action.wait) {
                videoPlayer.pause();
            }

            //Run new action found
            if (action.hideAt > 0) {
                me._runningActions.push(action);
            }

            action.run(isEditing).then(() => {
                if (action.wait && videoPlayer.paused) {
                    videoPlayer.play(); //Resume playing
                }
            });
        }

        _onPlay(e) {
            const me = this;
            const videoPlayer = me.videoPlayer;
            //Update controls toolbar
            me._updateControls({playing: true});
            //clear running actions if any.
            me._stopActions(me._runningActions);
            const currentTime = videoPlayer.currentTime;
            const sortedActions = me._actions.sort((a1, a2) => a1.triggerAt - a2.triggerAt);
            const index = sortedActions.findIndex(a => a.triggerAt >= currentTime);
            me._pendingActions = index < 0 ? [] : sortedActions.slice(index); //sort actions by trigger at ascending
        }

        _onPause(e) {
            this._updateControls({playing: false});
        }

        _onLoaded(e) {
            this.oneSecStep = 100 / this.videoPlayer.duration;
            this.resize();
            this._updateTimeView();
            this._processInteractions();
        }

        _onProgress() {
            this._updateBufferBar();            
        }

        _onEnded() {
            this._updateTimeView();
            this.controls.$slider.slider('option', 'value', this.videoPlayer.currentTime);
        }


        _onFullScreenChanged() {
            const fullscreen = document.fullscreenElement == this.host;

            this.$host.toggleClass('tpy-fullscreen');

            this.controls.$expand.find('i')
                .removeClass('ion-android-expand ion-android-contract')
                .addClass(fullscreen ? 'ion-android-contract' : 'ion-android-expand');

            this._onResize();
        }

        _onResize() {
            this.resize();
        }

        _stopActions(tostop) {
            const me = this;
            for(let i = 0; i < tostop.length; i++) {
                let action = me._runningActions.splice(me._runningActions.indexOf(tostop[i]), 1)[0];
                action.stop();
            }
        }

        _createVideoToolbar() {
            const me = this;
            const $toolbar = $('<div/>', { role: 'toolbar', "class": "tpy-ivideo-toolbar" });
            const $left = $('<div/>', { "class": 'tpy-ivideo-toolbar-left', appendTo: $toolbar });
            const $slider = $('<div/>', { "class": 'tpy-ivideo-toolbar-slider', appendTo: $toolbar });
            const $right = $('<div/>', { "class": 'tpy-ivideo-toolbar-right', appendTo: $toolbar });

            me.controls = {};
            me.controls.$play = me._createToolbarButton('play', 'ion-play', $left, me.togglePlayPause);

            me._createTimeViewer($right);
            me.controls.$volume = me._createToolbarButton('volume', 'ion-volume-mute', $right, me.toggleVolume);
            me.controls.$expand = me._createToolbarButton('expand', 'ion-android-expand', $right, me.toggleFullscreen);

            me.controls.$slider = me._createSlider($slider);
            me.$toolbar = $toolbar;
        }

        _createToolbarButton(command, iconName, $target, callback, text) {
            const me = this;
            var options = {
                role: 'button',
                tabindex: 0,
                'class': 'tpy-control tpy-' + command,
                on: {
                    click: function () {
                        callback.call(me);
                    },
                    keydown: function (event) {
                        if (isEnterOrSpace(event)) {
                            callback.call(me);
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                },
                appendTo: $target
            };
            const $button = $('<div/>', options);
            if (iconName) $('<i class="icon ' + iconName + '"></i>').appendTo($button);
            return $button;
        }

        _createTimeViewer($container) {
            const me = this;
            const template = 
                `<div class="tpy-control tpy-timeviewer">
                    <span class="tpy-current"></span>
                    <span class="tpy-sep"> / </span>
                    <span class="tpy-total"></span>
                </div>`;
            const $time = $(template).appendTo($container);
            me.controls.$curtime = $time.find(".tpy-current");
            me.controls.$totalTime = $time.find(".tpy-total");            
        }

        _updateTimeView() {
            const me = this;
            me._updateCurrentTime(me.videoPlayer.currentTime);
            me._updateTotalTime(me.videoPlayer.duration);
        }

        _updateCurrentTime(time) {
            this.controls.$curtime.text(formatDuration(time));
        }

        _updateTotalTime(time) {
            const me = this;
            me.controls.$totalTime.text(formatDuration(time));
            me.controls.$slider.slider('option', 'max', time);
        }

        _updateBufferBar() {
            const me = this;
            if (!me.videoPlayer) return;
            const buffered = me.videoPlayer.buffered;
            if (buffered) {
                me.controls.$buffer.css('width', buffered + '%');
            }
        }

        updateTime(time) {
            if (isNaN(time) || time < 0) return;
            const me = this;
            //Update slider
            me.controls.$slider.slider('option', 'value', time);
            me._updateCurrentTime(time);
        }

        _createSlider($wrapper) {
            const me = this;
            const slide = function(event, ui) {
                // Update elapsed time
                me.resumePlay = !me.videoPlayer.paused;
                me.seeking = true;
                me.videoPlayer.seek(ui.value);
                me._updateCurrentTime(ui.value);
                return true;
            };

            const stop = function(event, ui) {
//                me.videoPlayer.seek(ui.value);
//                me.updateTime(ui.value);
//                me.seeking = false;
//                if (me.resumePlay) {
//                    me.resumePlay = false;
//                    me.videoPlayer.play();
//                }
            };

            const $slider = $('<div/>', { appendTo: $wrapper }).slider({
                value: 0,
                step: 0.000001,
                orientation: 'horizontal',
                range: 'min',
                max: 0,
                slide: slide,
                stop: stop
            });
            //Add buffering bar
            me.controls.$buffer = $('<div/>', { "class": "tpy-buffer-bar", prependTo: $slider});
            return $slider;
        }

        _createActionsBar($wrapper) {
            const me = this;
            $wrapper.find('.tpy-action-bar').remove(); //Clear if any
            const $bar = $('<div/>', { "class": "tpy-action-bar"});
            const sortedActions = me._actions.sort((a1, a2) => a1.triggerAt - a2.triggerAt);

            for(let i = 0; i < sortedActions.length; i++) {
                const action = sortedActions[i];
                let $marker = action.createMarker();
                $marker.appendTo($bar);
            }
            $bar.appendTo($wrapper);
        }

        _updateControls(options) {
            const me = this;
            if ('playing' in options) {
                me.controls.$play
                    //.toggleClass()
                    .find('i')
                    .toggleClass('ion-play', !options.playing)
                    .toggleClass('ion-pause', options.playing);
            }
        }

        refreshInteractions() {
            this.refreshing = true;
            this._processInteractions();
            this.refreshing = false;
        }

        seek(time) {
            console.log(time);
            if (typeof time === 'string') {
                time = durationToNumber(time);           
            }
            //this.videoPlayer.seek(time);
            console.log(time);
            const player = this.videoPlayer;
            if (Math.floor(player.currentTime * 10) == Math.floor(time * 10)) { //Already in the marker time
                return;
            }

            player.seek(time);
            player.playAndPause();
        }

        togglePlayPause() {
            if (this.videoPlayer.paused) 
                this.videoPlayer.play();
            else 
                this.videoPlayer.pause();
        }

        toggleVolume() {
            this.videoPlayer.toggleVolume();
            this.controls.$volume.find('i')
                .removeClass('ion-volume-mute ion-volume-high')
                .addClass(this.videoPlayer.muted ? 'ion-volume-high' : 'ion-volume-mute');
        }

        toggleFullscreen() {
            if (document.fullscreenElement || document.fullscreen) {
                exitFullscreen();
            }
            else {
                enterFullscreen(this.host);
            }
        }

        resize() {

            const fullscreen = this.$host.is('.tpy-fullscreen');
            const dimensions = this.videoPlayer.dimensions;

            if (fullscreen) {
                const maxWidth = this.$host.width();
                const maxHeight = this.$host.height();
                const toolbarH = this.$toolbar.height();
                const ratio = dimensions.width / dimensions.height;
//                ratio = w / h;
//                w = ratio * h;
//                h = w / ratio;
                //Calculate video dimensions
                let nHeight = maxHeight - toolbarH; //
                let nWidth = nHeight * ratio;

                if (nWidth > maxWidth) {
                    nWidth = maxWidth;
                    nHeight = nWidth / ratio;
                }

                this.$videoWrapper.css({
                    width: nWidth +'px',
                    height: nHeight + 'px'
                });
            }
            else {
                this.$videoWrapper.css({
                    width: '',
                    height: ''
                });
            }
            this.$toolbar.width(this.$videoWrapper.width());
        }

        get currentTime() {
            return this.videoPlayer.currentTime;
        }

        get currentTimeStr() {
            return formatDuration(this.videoPlayer.currentTime);
        }

        get duration() {
            return this.videoPlayer.duration;
        }
    }

    window.IVideoAction = IVideoAction;
    window.IVideo = IVideo;
})();