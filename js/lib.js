// This file is part of CDI Tool
//
// CDI is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// CDI is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with CDI.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

dhbgApp.standard = {};

dhbgApp.standard.start = function() {
    dhbgApp.transition = 'fade';
    dhbgApp.transitionDuration = 400;
    dhbgApp.transitionOptions = {};

    $('main > section').hide();
    $('main').show();
    $('body').removeClass('loading');

    if (dhbgApp.scorm) {
        dhbgApp.scorm.initialization({activities_percentage: dhbgApp.evaluation.activities_percentage});
    }

    // ==============================================================================================
    // Build menus.
    // ==============================================================================================
    $('nav > menu').tepuyMenu();
    // ==============================================================================================
    // Progress control
    // ==============================================================================================
    $('.measuring-progress').tepuyProgressIndicator();
    // ==============================================================================================
    // Actions on buttons
    // ==============================================================================================
    $('.button').on('mouseover', dhbgApp.defaultValues.buttonover);

    $('.button').on('mouseout', dhbgApp.defaultValues.buttonout);

    // ==============================================================================================
    // Images preload.
    // ==============================================================================================
    var imgs = [];
    $('img').each(function() {
        var img_src = $(this).attr('src');
        if (!imgs[img_src]) {
            var img = new Image();

            img.onload = function(){
                // Image has been loaded.
            };

            img.src = img_src;

            imgs[img_src] = true;
        }
    });

    // ==============================================================================================
    // Buttons to load page
    // ==============================================================================================
    dhbgApp.DB.dataPage = null;

    $('[data-page]').on('click', function () {
        var $this = $(this);
        dhbgApp.loadPageN($this.attr('data-page'));

        if ($this.attr('data-section')) {
            dhbgApp.DB.dataPage = $this.attr('data-section');
        }
    });

    dhbgApp.actions.afterChangePage[dhbgApp.actions.afterChangePage.length] = function($current_subpage) {
        if (dhbgApp.DB.dataPage) {
            $("html, body").animate({ scrollTop: $(dhbgApp.DB.dataPage).offset().top }, 500);
            dhbgApp.DB.dataPage = null;
        }
    };

    $('[next-page]').on('click', function () {
        if ($(this).hasClass('disabled')) {
            return;
        }

        var next = dhbgApp.DB.currentSubPage + 1;

        if (!dhbgApp.FULL_PAGES && dhbgApp.pages[dhbgApp.DB.currentPage].subpages > next) {
            dhbgApp.loadSubPage(dhbgApp.DB.currentPage, next);
        }
        else {
            dhbgApp.loadPage(dhbgApp.DB.currentPage + 1);
        }
    });

    $('[previous-page]').on('click', function () {
        if ($(this).hasClass('disabled')) {
            return;
        }

        var next = dhbgApp.DB.currentSubPage - 1;

        if (!dhbgApp.FULL_PAGES && next >= 0) {
            dhbgApp.loadSubPage(dhbgApp.DB.currentPage, next);
        }
        else if (dhbgApp.DB.currentPage > 0){
            dhbgApp.loadPage(dhbgApp.DB.currentPage - 1, dhbgApp.pages[dhbgApp.DB.currentPage - 1].subpages - 1);
        }
    });

    // ==============================================================================================
    // Special box text
    // ==============================================================================================
    $('.box-text').tepuyBoxText();
    // ==============================================================================================
    // Modal Windows
    // ==============================================================================================
    $('.w-content').tepuyModalWindowContent();
    // ==============================================================================================
    // Float Window
    // ==============================================================================================
    $('.wf-content').tepuyFloatingWindowContent();

    // ==============================================================================================
    // "Mouse over" with one visible
    // ==============================================================================================
    $('.mouse-over-one').tepuyMouseOverOne();

    // Event Listeners
    // ==============================================================================================
    // Watch Modal Window controlers
    // ==============================================================================================
    $(document).on('click', '.w-content-controler', function(){
        var $this = $(this);
        var w = $this.attr('data-property-width');
        var h = $this.attr('data-property-height');

        if (w) {
            if (w.indexOf('%') >= 0) {
                var window_w = $(window).width();
                var tmp_w = Number(w.replace('%', ''));
                if (!isNaN(tmp_w) && tmp_w > 0) {
                    w = tmp_w * window_w / 100;
                }
            }

            $($this.attr('data-content')).dialog('option', 'width', w);
        }

        if (h) {
            if (h.indexOf('%') >= 0) {
                var window_h = $(window).height();
                var tmp_h = Number(h.replace('%', ''));
                if (!isNaN(tmp_h) && tmp_h > 0) {
                    h = tmp_h * window_h / 100;
                }
            }

            $($this.attr('data-content')).dialog('option', 'height', h);
        }

        $($this.attr('data-content')).dialog('open');
        $('body').addClass('dhbgapp_fullview');
    })
    // ==============================================================================================
    // Watch Float Window controllers
    // ==============================================================================================
    .on('click', '.wf-content-controler', function(){
        var $this = $(this);
        var w = $this.attr('data-property-width');
        var h = $this.attr('data-property-height');

        var $float_window = $($this.attr('data-content'));

        if (w) {
            $float_window.css('width', w);
        }

        if (h) {
            $float_window.css('height', h);
        }

        $float_window.show({ effect: 'slide', direction: 'down' });
    })
    // ==============================================================================================
    // Watch "Mouse over"
    // ==============================================================================================
    .on('mouseover', '.mouse-over', function(e) {
        e.stopImmediatePropagation();
        var selector = $(this).attr('data-ref');
        $(selector).show();
    })
    .on('mouseout', '.mouse-over', function() {
        var selector = $(this).attr('data-ref');
        $(selector).hide();
    })
    // ==============================================================================================
    // Watch "More - Less"
    // ==============================================================================================
    .on('click', '.more-less', function() {
        var $this = $(this);
        var selector = $this.attr('data-ref');
        var effect = $this.attr('data-effect');

        if (!effect) {
            effect = 'blind';
        }

        if ($this.hasClass('viewmore')) {
            $(selector).hide(effect, {}, 500);
            $this.removeClass('viewmore');
            $this.addClass('viewless');
        }
        else {
            $(selector).show(effect, {}, 500);
            $this.removeClass('viewless');
            $this.addClass('viewmore');
        }
    })
    // ==============================================================================================
    // Watch open url links
    // ==============================================================================================
    .on('click', '.open-url', function(){
        window.open($(this).attr('data-url'));
    });

    // ==============================================================================================
    // Image animations
    // ==============================================================================================
    $('img.animation,img.play-animation').tepuyAnimation();
    // ==============================================================================================
    // CSS animation
    // ==============================================================================================
    var index_animation = 0;
    $(".css-animation").each(function() {
        var $old_animation = $(this);

        var  id_old_animation;
        if(!$old_animation.attr('id')){
            $old_animation.attr('id', 'css_animation_' + index_animation);
            index_animation++;
        }
        id_old_animation = $old_animation.attr('id');

        $('#' + id_old_animation).on('click', function() {
            var $this = $(this);
            var $new_animaton = $this.clone(true);
            $new_animaton.attr("id", 'css_animation_' + index_animation);
            index_animation++;
            $this.before($new_animaton);
            $("#" + $this.attr("id")).remove();

        });
    });

    // ==============================================================================================
    // Global Controls
    // ==============================================================================================

    // Return and "close all" control.
    if (window.parent.dhbgApp && window.parent.document != window.document) { //Executes only if parent window is a tepuy window (it has a dhbgApp defined)
        var $scorm_frame = $('body', window.parent.document);
        $('[data-global="return"]').on('click', function () {
            var $this = $(this);
            if ($this.hasClass('minimized')) {
                $scorm_frame.addClass('scorm_full_page');
                $this.removeClass('minimized');
            }
            else {
                $scorm_frame.removeClass('scorm_full_page');
                $this.addClass('minimized');
            }
        });

        $('[data-global="close_all"]').on('click', function () {
            if (dhbgApp.scorm) {
                dhbgApp.scorm.close(function() {
                    window.parent.document.location.href = dhbgApp.scorm.getReturnUrl();
                });
            }
        });
    }
    else {
        $('[data-global="return"]').hide();
        $('[data-global="close_all"]').hide();
    }

    // Results control.
    var $results_modal = $('#results_page').dialog({
        modal: true,
        autoOpen: false,
        width: dhbgApp.documentWidth - 50,
        height: dhbgApp.documentHeight - 50,
        classes: {
            "ui-dialog": "results_page_dialog"
        },
        close: function() {
            $('body').removeClass('dhbgapp_fullview');
        }
    });

    $('[data-global="results"]').on('click', function () {

        var $dialog = $('#results_page');
        var $visited = $dialog.find('#results_page_visited');
        $visited.empty();

        var index, $current_page;
        var position = 1;
        for(index in dhbgApp.scorm.scoList) {
            if (dhbgApp.scorm.scoList[index]) {
                var sco = dhbgApp.scorm.scoList[index];
                $current_page = $('<button class="result_sco general">' + (position) + '</button>');
                if (sco.visited) {
                    $current_page.addClass('visited');
                }

                $current_page.addClass('button');
                $current_page.on('mouseover', dhbgApp.defaultValues.buttonover);
                $current_page.on('mouseout', dhbgApp.defaultValues.buttonout);

                $current_page.data('index-page', sco.page);
                $current_page.on('click', function() {

                    $results_modal.dialog( "close" );
                    dhbgApp.loadPage($(this).data('index-page'));
                });

                $visited.append($current_page);
                position++;
            }
        }

        var $activities = $dialog.find('#results_page_activities');
        var $ulactivities = $('<ul class="data_list"></ul>')
        $activities.empty();
        $activities.append($ulactivities);

        for (var activity_key in dhbgApp.scorm.activities) {
            if (dhbgApp.scorm.activities[activity_key]) {

                var $data_act = $('[data-act-id="' + activity_key + '"]');
                var title = $data_act.attr('data-act-title') ? $data_act.attr('data-act-title') : activity_key;
                var $act = $('<li class="result_activity"></li>');

                var $parent_page = $data_act.parents('.page');

                if ($parent_page.length > 0) {
                    var title = $('<a href="javascript:;"><strong>' + title + ': </strong></a>');

                    title.data('index-page', $parent_page.data('index-page'));

                    title.on('click', function() {

                        $results_modal.dialog( "close" );
                        dhbgApp.loadPage($(this).data('index-page'));
                    });
                }
                else {
                    title = '<strong>' + title + ': </strong>';
                }

                $act.append(title);


                if (typeof dhbgApp.scorm.activities[activity_key] == 'string') {
                    $act.append(dhbgApp.scorm.activities[activity_key] + '%');
                }
                else if (typeof dhbgApp.scorm.activities[activity_key] == 'object' && dhbgApp.scorm.activities[activity_key].length > 0) {
                    var list_intents = [];
                    for(var intent = 0; intent < dhbgApp.scorm.activities[activity_key].length; intent++) {
                        if (dhbgApp.scorm.activities[activity_key][intent]) {
                            list_intents[list_intents.length] = dhbgApp.scorm.activities[activity_key][intent] + '%';
                        }
                        else {
                            list_intents[list_intents.length] = '0%';
                        }
                    }
                    $act.append(list_intents.join(', '));
                }
                else {
                    $act.append(dhbgApp.s('activities_attempts'));
                }
                $ulactivities.append($act);
            }
        }

        $('body').addClass('dhbgapp_fullview');
        $results_modal.dialog('open');
    });

    var w_global_modal = dhbgApp.documentWidth > 900 ? 900 : dhbgApp.documentWidth - 50;

    // Credits control.
    var $credits_modal = $('#credits-page').dialog({
        modal: true,
        autoOpen: false,
        width: w_global_modal,
        height: dhbgApp.documentHeight - 50,
        classes: {
            "ui-dialog": "results_page_dialog"
        },
        close: function() {
            $('body').removeClass('dhbgapp_fullview');
        }
    });

    $('[data-global="credits"]').on('click', function () {
        $('body').addClass('dhbgapp_fullview');
        $credits_modal.dialog('open');
    });

    // Library control.
    var $library_modal = $('#library-page').dialog({
        modal: true,
        autoOpen: false,
        width: w_global_modal,
        height: dhbgApp.documentHeight - 50,
        classes: {
            "ui-dialog": "library_page_dialog"
        },
        close: function() {
            $('body').removeClass('dhbgapp_fullview');
        }
    });

    $('[data-global="library"]').on('click', function () {
        $('body').addClass('dhbgapp_fullview');
        $library_modal.dialog('open');
    });

    // ==============================================================================================
    // Special control: Accordion
    // ==============================================================================================
    $('.accordion').accordion({ autoHeight: false, heightStyle: "content"});
    // ==============================================================================================
    // Special control: View first
    // ==============================================================================================
    $('.view-first').tepuyViewFirst();
    // ==============================================================================================
    // Horizontal menu
    // ==============================================================================================
    $('.horizontal-menu').tepuyInnerMenu();
    // ==============================================================================================
    // Vertical menu
    // ==============================================================================================
    $('.vertical-menu').tepuyInnerMenu();
    // ==============================================================================================
    // Vertical menu both sides
    // ==============================================================================================
    $('.vertical-menu-both-sides').tepuyInnerMenu();
    // ==============================================================================================
    // Pagination
    // ==============================================================================================
    $('.ctrl-pagination').tepuyPagination();

    // ==============================================================================================
    // Image Zoom
    // ==============================================================================================
    $('.jpit-resources-zoom').each(function(){
        var $this = $(this);

        var zoom = $this.attr('data-magnification') ? parseInt($this.attr('data-magnification')) : 2;
        var size = $this.attr('data-magnifier-size') ? $this.attr('data-magnifier-size') : '100px';

        jpit.resources.zoom.createZoom($this, zoom, size);
    });

    // ==============================================================================================
    // Programing animations
    // ==============================================================================================
    if (jpit.resources && jpit.resources.movi) {
        var index_movi = 1;
        $('.movi').each(function(){
            var $this = $(this);

            if (!$this.attr('data-name')) {
                $this.attr('data-name', 'movi_' + index_movi);
            }

            var index_layer = 1;
            $this.find('[data-movi-type]').each(function() {
                var $layer = $(this);
                $layer.addClass('movi-layer');

                if (!$layer.attr('data-name')) {
                    $layer.attr('data-name', 'movi_' + index_movi + '_' + index_layer);
                }

                jpit.resources.movi.processMoviLayer($layer);
                index_layer++;
            });

            index_movi++;

        });

        $('[data-movi-play]').each(function(){
            var $this = $(this);
            var event_name = $this.attr('data-movi-event') ? $this.attr('data-movi-event') : 'click';

            $this.on(event_name, function(){
                var movi;

                if(movi = jpit.resources.movi.movies[$this.attr('data-movi-play')]) {

                    if (!movi.tail) {
                        movi.tail = [];
                    }

                    movi.element = $(movi.selector);

                    if (!movi.main_movi) {
                        movi.main_movi = movi.element;
                    }

                    jpit.resources.movi.processMovi(movi);
                }
            });
        });

        $('[data-event-action]').each(function(){
            var $this = $(this);
            var event_name = $this.attr('data-event-name') ? $this.attr('data-event-name') : 'click';

            $this.on(event_name, function(){

                switch($this.attr('data-event-action')) {
                    case 'play_movi':
                        jpit.resources.movi.readMoviSequence($($this.attr('data-event-action-selector')), null);
                        break;
                    case 'auto_hide':
                        $this.hide();
                        break;
                    default:
                        if (jpit.resources.movi.movies.actions[$this.attr('data-event-action')]) {
                            var f = jpit.resources.movi.movies.actions[$this.attr('data-event-action')];
                            f();
                        }
                }
            });
        });

        dhbgApp.actions.beforeChangePage[dhbgApp.actions.beforeChangePage.length] = function($current_subpage) {

            jpit.resources.movi.currentMovi = null;
            $current_subpage.find('[data-movi-type]').each(function(){
                $(this).stop(true, false);
            });
        };

        dhbgApp.actions.afterChangePage[dhbgApp.actions.afterChangePage.length] = function($current_subpage) {

            $current_subpage.find('.movi').each(function(){
                var $this = $(this);
                jpit.resources.movi.readMoviSequence($this, null);
            });
        };
    }

    //Activities
    dhbgApp.standard.load_operations();
    dhbgApp.actions.startTimer = function($container, seconds) {
        var format = function (s) {
            var h = Math.floor(s / 3600);
            s = s % 3600;
            var m = Math.floor(s / 60);
            s = s % 60;
            return h > 0 ? ('0'+h).slice(-2) + ':' : '' +
                ('0'+m).slice(-2) + ':' +
                ('0'+s).slice(-2);
        };

        var $timer = $('<span class="jpit-timer">');
        var interval;
        var start = function () {
            $timer.html(format(seconds)).appendTo($container)
            var sec = seconds;
            interval = setInterval(function () {
                sec--;
                $timer.html(format(sec));
                if (sec == 0) {
                    clearInterval(interval);
                    interval = undefined;
                    $container.trigger('jpit:timer:elapsed', clock);
                }
            }, 1000);
        }
        var clock = {
            stop: function () { interval && clearInterval(interval); },
            restart: function () { start(); },
            hide: function() { $timer.hide() },
            show: function() { $timer.show() }
        };
        start();
        $container.data('clock', clock);
    };

    dhbgApp.actions.loadActivity = function($container, type, loader) {
        var scorm_id = $container.attr('data-act-id') ? $container.attr('data-act-id') : type;

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var el = $container.get(0);
        var ondemand = false;
        var timer = 0;
        var options = { scorm_id: scorm_id };

        if (el.hasAttribute('data-timer')) {
            timer = parseInt(el.getAttribute('data-timer'));
            timer = isNaN(timer) ? 0 : timer;
            el.removeAttribute('data-timer');
        }

        if (el.hasAttribute('data-reveal-response')) {
            options.allow_reveal = el.getAttribute('data-reveal-response') == 'true';
            el.removeAttribute('data-reveal-response');
        }

        if (el.hasAttribute('data-on-demand')) {
            ondemand = /^(any|standard)$/.test(el.getAttribute('data-on-demand'));
        }

        if (!ondemand && timer == 0) {
            loader.call(loader, $container, options);
            return;
        }

        var $start = $('<button class="button general">' + dhbgApp.s('start_activity') + '</button>');
        $container.before($start);
        var parent_class = $container.parent().attr('id');
        $container.addClass(parent_class);
        $container.hide();
        $start.on('click', function() {
            $container.show();
            loader.call(loader, $container, options);
            if (timer > 0) {
                dhbgApp.actions.startTimer($container, timer);
            }
            $start.hide();
        });

    };

    $('.jpit-activities-quiz').jpitActivityQuiz();

    $('.jpit-activities-wordpuzzle').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityWordpuzzle($this);
    });

    $('.jpit-activities-crossword').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityCrossword($this);
    });

    $('.jpit-activities-droppable').each(function(){
        var $this = $(this);
        dhbgApp.actions.loadActivity($this, 'droppable', dhbgApp.actions.activityDroppable);
    });

    $('.jpit-activities-multidroppable').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityMultidroppable($this);
    });

    $('.jpit-activities-cloze').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityCloze($this);
    });

    $('.jpit-activities-sortable').each(function(){
        var $this = $(this);
        dhbgApp.actions.activitySortable($this);
    });

    $('.jpit-activities-check').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityCheck($this);
    });

    $('.jpit-activities-mark').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityMark($this);
    });

    $('.jpit-activities-selection').each(function(){
        var $this = $(this);
        dhbgApp.actions.activitySelection($this);
    });

    $('.jpit-activities-form').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityForm($this);
    });

    $('.jpit-activities-view').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityView($this);
    });

    $('.tpy-ivideo').tepuyInteractiveVideo();
    // ==============================================================================================
    // Open URL
    // This is processed on the end in order to not be disabled for another dynamic html and include
    // "open urls" generated by other controls.
    // ==============================================================================================
    $('.open-url').on('click', function(){
        window.open($(this).attr('data-url'));
    });

    // ==============================================================================================
    // Tooltip
    // This is processed on the end in order to not be disabled for another dynamic html and include
    // "tooltips" generated by other controls.
    // ==============================================================================================
    $('.tooltip').tepuyTooltip();

    // ==============================================================================================
    // Instructions
    // This is processed on the end in order to include "instructions" generated by other controls.
    // ==============================================================================================
    $('.instruction').tepuyInstructionBox();
    // ==============================================================================================
    // After - Before content
    // ==============================================================================================
    $('.after-before').each(function() {
        var $this = $(this);
        var orientation = $this.attr('data-orientation') && $this.attr('data-orientation') == 'vertical' ? 'vertical' : 'horizontal';
        var offset = $this.attr('data-offset') ? $this.attr('data-offset') : 0.5;
        var before_img = $this.find("img:first");
        var s_before = $this.attr('data-before-label') ? $this.attr('data-before-label') : dhbgApp.s('before');
        var s_after = $this.attr('data-after-label') ? $this.attr('data-after-label') : dhbgApp.s('after');

        if (before_img.length > 0) {
            before_img = before_img[0];
            $this.css('width', before_img.width);
            $this.css('height', before_img.height);

            $this.addClass('twentytwenty-container');
            $this.twentytwenty({
                "orientation": orientation,
                "default_offset_pct": offset,
                "before_label": s_before,
                "after_label": s_after
            });
        }
    });

    // ==============================================================================================
    // Expand image
    // ==============================================================================================
    var $expand_image_modal = $('<div><div id="expand_image_content"></div></div>').dialog({
        modal: true,
        autoOpen: false,
        width: dhbgApp.documentWidth,
        height: dhbgApp.documentHeight,
        classes: {
            "ui-dialog": "expand_image_dialog"
        },
        close: function() {
            $('body').removeClass('dhbgapp_fullview');
        }
    });

    dhbgApp.checkexpandeimage = function() {
        var $this = $(this);
        var src = $this.attr('data-src');
        var title = $this.attr('title') ? $this.attr('title') : false;

        var $img = $('<img src="' + src + '" />');
        if (title) {
            $img.attr('title', title);
        }

        var f_show = function () {
            $('body').addClass('dhbgapp_fullview');
            $expand_image_modal.find('#expand_image_content').empty();
            $expand_image_modal.find('#expand_image_content').append($img);
            if (title) {
                $expand_image_modal.dialog('option', 'title', title);
            }
            $expand_image_modal.dialog('open');
        };

        $this.on('click', f_show);

        $this.css('background-image', 'url(' + src + ')');

        var $icon = $('<i class="ion-arrow-expand"></i>');
        $icon.on('click', f_show);
        $this.append($icon);
    };

    $('.expand-image').each(dhbgApp.checkexpandeimage);

    // ==============================================================================================
    // Print page
    // ==============================================================================================
    $('#printent_back').on('click', function(){
        $('#printent_content').hide();
        $('body').removeClass('print_mode');
        $('#printent_content div.content').empty();

        var offset_return;
        if (offset_return = $('#printent_back').data('offset_return')) {
            $("body, html").animate({
                scrollTop: offset_return
            }, 100);
        }
    });

    // ==============================================================================================
    // Form element value in a target control
    // ==============================================================================================
    dhbgApp.actions.afterChangePage[dhbgApp.actions.afterChangePage.length] = function($current_subpage){
        $current_subpage.find('.form-value-display').each(function(){
            var $this = $(this);
            var text = $($this.attr('data-element')).val();
            text = text.replace(/\n/g, '<br />');
            text = text.replace(/\t/g, '    ');
            $this.html(text);
        });
    };

    // ==============================================================================================
    // Sounds
    // ==============================================================================================
    dhbgApp.actions.autoLoadSounds($('body'));

    dhbgApp.actions.beforeChangePage[dhbgApp.actions.beforeChangePage.length] = function($current_subpage){
        if (dhbgApp.DB.loadSound) {
            dhbgApp.DB.loadSound.pause();
        }

        $current_subpage.find('video,audio').each(function() {
            $(this)[0].pause();
        });
    };


    $('main > section').each(function(index_page, value_page) {
        var $page = $(this);
        $page.addClass('page_' + index_page);
        $page.data('index-page', index_page)

        $page.find('.subpage').each(function(i, v) {
            $(this).addClass('subpage_' + i);
        });

        dhbgApp.pages[index_page] = {'id': $page.attr('id'), 'title': $page.attr('ptitle') || ''};
        dhbgApp.pages[index_page].subpages = dhbgApp.FULL_PAGES ? 1 : $('.page_' + index_page + ' .subpage').length;
        dhbgApp.DB.totalPages += dhbgApp.pages[index_page].subpages;
    });

    dhbgApp.pagesNames = [];


    $.each(dhbgApp.pages, function(i, v) {

        dhbgApp.pagesNames[v.id] = i;

        if (dhbgApp.scorm) {
            dhbgApp.scorm.indexPages[i] = [];

            for (var k = 0; k < v.subpages; k++) {
                var sco = {
                    "page": i,
                    "subpage": k,
                    "visited": false,
                    "value": 1,
                    "index" : dhbgApp.scorm.scoList.length
                };

                if (dhbgApp.scorm.visited[sco.index]) {
                    sco.visited = true;
                }

                dhbgApp.scorm.indexPages[i][k] = sco.index;
                dhbgApp.scorm.scoList[sco.index] = sco;
            }
        }
    });


    if (dhbgApp.MODEL == 'scorm' && (!dhbgApp.scorm || !dhbgApp.scorm.lms)) {
        $('#not_scorm_msg').html(dhbgApp.s('scorm_not'));
        $('#not_scorm_msg').dialog( { modal: true } );
    }

    if (dhbgApp.scorm && dhbgApp.scorm.activities) {
        dhbgApp.scorm.activities = dhbgApp.sortObjectByProperty(dhbgApp.scorm.activities);
    }

    if (dhbgApp.MODEL == 'scorm' && dhbgApp.scorm && dhbgApp.scorm.change_sco) {
        dhbgApp.changeSco(dhbgApp.scorm.currentSco);
    }
    else {
        dhbgApp.loadPage(0, 0);
    }

    $(dhbgApp).trigger('tpy:app-started', []);
};


//=========================================================================
// Init functions
//=========================================================================
dhbgApp.standard.load_operations = function() {

    dhbgApp.changeSco = function(index) {
        var sco = dhbgApp.scorm.scoList[index];

        dhbgApp.scorm.currentSco = index;

        dhbgApp.loadPage(sco.page, sco.subpage);
    };

    dhbgApp.printProgress = function() {
        if (typeof dhbgApp.scorm == 'object') {
            var progress = dhbgApp.scorm.getProgress();

            if (!isNaN(progress)) {
                if (dhbgApp.loadProgress) {
                    dhbgApp.loadProgress(progress);
                }
            }
            else {
                $('.measuring-progress').hide();
            }
        }
    };

    dhbgApp.loadPageN = function(name) {
        dhbgApp.loadPage(dhbgApp.pagesNames[name]);
    };

    dhbgApp.loadPage = function(npage, nsubpage) {

        if (!nsubpage) {
            nsubpage = 0;
        }

        $('html,body').scrollTop(0);

        if(npage == 0){
            $('[previous-page]').css('visibility', 'hidden');
        }
        else{
            $('[previous-page]').css('visibility', 'visible');
        }

        if(npage == dhbgApp.pages.length -1){
            $('[next-page]').css('visibility', 'hidden');
        }
        else{
            $('[next-page]').css('visibility', 'visible');
        }

        if (npage != dhbgApp.DB.currentPage) {

            var page = dhbgApp.pages[npage];
            $('nav [data-page]').removeClass('current').parents().removeClass('current');

            $('nav [data-page="' + page.id + '"]').addClass('current').parents().addClass('current');

            // If subpages mode is enabled.
            if (!dhbgApp.FULL_PAGES) {
                var $nav = $('[subpages-menu]');
                var $node;

                $nav.empty();

                if (page.subpages > 1) {

                    var sco;
                    for(var i = 0; i < page.subpages; i++) {

                        $node = $('<li class="button">' + (i+1) + '</li>');
                        if (i == 0) {
                            $node.addClass('current visited');
                        }

                        if (dhbgApp.scorm) {
                            sco = dhbgApp.scorm.scoList[dhbgApp.scorm.indexPages[npage][i]];

                            if (sco.visited) {
                                $node.addClass('visited');
                            }
                        }

                        $node.attr('spage', i);
                        $node.on('mouseover', dhbgApp.defaultValues.buttonover);
                        $node.on('mouseout', dhbgApp.defaultValues.buttonout);

                        $node.on('click', function() { dhbgApp.loadSubPage(npage, parseInt($(this).attr('spage'))); });

                        $nav.append($node);
                    }
                }
            }

            // Only print the title page if exists a container with CSS class ".page-title"
            var $pagetitle_box = $('.page-title');
            if ($pagetitle_box.length > 0) {
                $pagetitle_box.html(page.title);
            }

        }

        if (dhbgApp.FULL_PAGES) {
            dhbgApp.loadFullPage(npage, nsubpage);
        }
        else {
            dhbgApp.loadSubPage(npage, nsubpage);
        }

        dhbgApp.DB.currentPage = npage;
        dhbgApp.printNumberPage(npage, nsubpage);

    };

    dhbgApp.loadSubPage = function (npage, nsubpage) {

        if (dhbgApp.DB.currentSubPage != nsubpage || dhbgApp.DB.currentPage != npage) {

            var $nav = $('[subpages-menu]');
            var $current_subpage = $nav.find('.current');

            // Actions before change page.
            $.each(dhbgApp.actions.beforeChangePage, function(i, v){
                v($current_subpage);
            });

            if (nsubpage == 0 && npage == 0) {
                $('[previous-page]').css('visibility', 'hidden');
            }
            else {
                $('[previous-page]').css('visibility', 'visible');
            }

            if ((nsubpage + 1) >= dhbgApp.pages[npage].subpages && (npage + 1) == dhbgApp.pages.length) {
                $('[next-page]').css('visibility', 'hidden');
            }
            else {
                $('[next-page]').css('visibility', 'visible');
            }

            $current_subpage.removeClass('current');

            $nav.find('li[spage=' + nsubpage + ']').addClass('current');

            var $current = $('main > section .subpage.current');

            var $new_subpage = $('main > section.page_' + npage + ' .subpage_' + nsubpage);

            if ($current.length > 0) {
                $('[previous-page], [next-page]').addClass('disabled');
                $current.hide(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function() {
                    $('main .subpage').removeClass('current');

                    $('main > section').hide();
                    $('main > section.page_' + npage).show();

                    // Hack by multiple subpages selecteds in fast clicks.
                    $('main .subpage').hide();

                    $new_subpage.addClass('current');
                    $new_subpage.show(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function(){
                        dhbgApp.eachLoadPage($new_subpage);
                        $('[previous-page], [next-page]').removeClass('disabled');
                    });
                });
            }
            else {
                $('main .subpage').hide();
                $('main > section').hide();
                $('main > section.page_' + npage).show();

                $new_subpage.show(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function(){
                    dhbgApp.eachLoadPage($new_subpage);
                });
                $new_subpage.addClass('current');
            }

            if (dhbgApp.scorm) {
                dhbgApp.scorm.saveVisit(dhbgApp.scorm.indexPages[npage][nsubpage]);
            }

            dhbgApp.DB.currentSubPage = nsubpage;

            // Actions in change page.
            $.each(dhbgApp.actions.afterChangePage, function(i, v){
                v($new_subpage);
            });
        }

        dhbgApp.printNumberPage(npage, nsubpage);
    };

    dhbgApp.loadFullPage = function (npage, nsubpage) {

        if (dhbgApp.DB.currentPage != npage) {

            var $current_page = $('main > section.current');

            if ($current_page.length > 0) {
                // Actions before change page.
                $.each(dhbgApp.actions.beforeChangePage, function(i, v){
                    v($current_page);
                });
            }

            if (npage == 0) {
                $('[previous-page]').css('visibility', 'hidden');
            }
            else {
                $('[previous-page]').css('visibility', 'visible');
            }

            if ((npage + 1) == dhbgApp.pages.length) {
                $('[next-page]').css('visibility', 'hidden');
            }
            else {
                $('[next-page]').css('visibility', 'visible');
            }

            var $new_page = $('main > section.page_' + npage);

            dhbgApp.DB.currentSubPage = nsubpage;

            if ($current_page.length > 0) {
                $('[previous-page], [next-page]').addClass('disabled');
                $current_page.hide(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function() {
                    $current_page.removeClass('current');

                    $new_page.addClass('current');
                    $new_page.show(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function(){
                        dhbgApp.eachLoadPage($new_page);
                        $('[previous-page], [next-page]').removeClass('disabled');
                    });
                });
            }
            else {
                $new_page.show(dhbgApp.transition, dhbgApp.transitionOptions, dhbgApp.transitionDuration, function(){
                    dhbgApp.eachLoadPage($new_page);
                });
                $new_page.addClass('current');
            }

            if (dhbgApp.scorm) {
                dhbgApp.scorm.saveVisit(dhbgApp.scorm.indexPages[npage][nsubpage]);
            }

        }
        dhbgApp.printNumberPage(npage, nsubpage);
    };

    dhbgApp.printNumberPage = function (page, subpage) {

        dhbgApp.printProgress();

        if (dhbgApp.scorm && dhbgApp.scorm.indexPages.length > page && dhbgApp.scorm.indexPages[page].length > subpage) {
            var current = dhbgApp.FULL_PAGES ? page : dhbgApp.scorm.indexPages[page][subpage];
            $('#page_number').text((current + 1) + '/' + dhbgApp.DB.totalPages);
        }
    };

    dhbgApp.eachLoadPage = function($new_subpage) {
        $new_subpage.find('img.animation').each(function () {
            var $this = $(this);
            var img_src = $this.attr('src');
            $this.attr('src', '');
            $this.attr('src', img_src + '?' + (new Date().getTime()));
        });

        //Actions in change page
        $.each(dhbgApp.actions.afterChangePage, function(i, v){
            v($new_subpage);
        });
    };

    dhbgApp.actions.autoLoadSounds = function ($parent) {

        $parent.find('[data-sound]').each(function(){
            var $this = $(this);

            $this.on('click', function() {
                dhbgApp.DB.loadSound.setAttribute('src', 'content/sounds/' + $this.attr('data-sound'));
                dhbgApp.DB.loadSound.load();
                dhbgApp.DB.loadSound.play();

                $this.addClass('sound_loading');
                dhbgApp.DB.loadSound.onloadeddata = function(){ $this.removeClass('sound_loading'); };

            });
        });
    };

    dhbgApp.actions.activityQuiz = function ($this, options) {
        var scorm_id = options.scorm_id;
        var questions = [], activityOptions = {};
        var feedbacktrue = dhbgApp.s('answer_corrent'), feedbackfalse = dhbgApp.s('answer_wrong');
        var html_body = $this.html();

        if ($this.find('> feedback correct').text() != '') {
            feedbacktrue = $this.find('> feedback correct').html();
        }

        if ($this.find('> feedback wrong').text() != '') {
            feedbackfalse = $this.find('> feedback wrong').html();
        }

        activityOptions.shuffleQuestions = $this.attr('data-shuffle') && $this.attr('data-shuffle') != 'true' ? false : true;
        activityOptions.prefixType       = $this.attr('data-prefixtype') ? $this.attr('data-prefixtype') : jpit.activities.quiz.prefixes.none;
        activityOptions.requiredAll      = $this.attr('data-requiredall') && $this.attr('data-requiredall') != 'true' ? false : true;
        activityOptions.paginationNumber = $this.attr('data-paginationnumber') ? parseInt($this.attr('data-paginationnumber')) : 1;
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        var count_questions = $this.find('question[type!="label"]').length;
        var question_weight = 100 / count_questions;

        $this.find('question').each(function(){
            var $question = $(this);
            var q;
            var question_options = {};
            var q_feedbacktrue = feedbacktrue, q_feedbackfalse = feedbackfalse, q_feedbackall = '';

            if ($question.find('feedback correct').text() != '') {
                q_feedbacktrue = $question.find('feedback correct').html();
            }

            if ($question.find('feedback wrong').text() != '') {
                q_feedbackfalse = $question.find('feedback wrong').html();
            }

            if ($question.find('feedback all').text() != '') {
                q_feedbackall = $question.find('feedback all').html();
            }

            question_options.shuffleAnswers = $question.attr('data-shuffle') && $question.attr('data-shuffle') != 'true' ? false : true;
            question_options.prefixType = $question.attr('data-prefixtype') ? $question.attr('data-prefixtype') : jpit.activities.quiz.prefixes.capital;
            question_options.displayFeedback = true;
            question_options.feedbackIfTrue = q_feedbacktrue;
            question_options.feedbackIfFalse = q_feedbackfalse;
            question_options.feedbackAll = q_feedbackall;
            question_options.weight = question_weight;

            switch($question.attr('type')) {
                case 'simplechoice':
                    var answers = [];
                    var $optionlist = $question.find('ul');
                    var correct = 0;

                    $optionlist.find('li').each(function(i, v){
                        var $opt = $(this);
                        answers[answers.length] = $opt.html();

                        if ($opt.attr('data-response') && $opt.attr('data-response') == 'true') {
                            correct = i;
                        }
                    });

                    q = new jpit.activities.quiz.question.simplechoice($question.find('description').html(), answers, correct, question_options);

                    break;
                case 'complete':
                    var $paragraph = $question.find('p.item');
                    var correct = 0;

                    $paragraph.find('.answers li').each(function(i, v){
                        var $opt = $(this);

                        if ($opt.attr('data-response') && $opt.attr('data-response') == 'true') {
                            correct = i;
                        }
                    });

                    q = new jpit.activities.quiz.question.complete($question.find('description').html(), $paragraph, correct, question_options);

                    break;
                case 'label':
                    var text = $question.find('text').html();
                    q = new jpit.activities.quiz.question.label($question.find('description').html(), text, question_options);

                    break;
                case 'multichoice':
                    var answers = [];
                    var $optionlist = $question.find('ul');
                    var correct = [];

                    $optionlist.find('li').each(function(i, v){
                        var $opt = $(this);
                        answers[answers.length] = $opt.html();

                        if ($opt.attr('data-response') && $opt.attr('data-response') == 'true') {
                            correct[correct.length] = i;
                        }
                    });

                    q = new jpit.activities.quiz.question.multichoice($question.find('description').html(), answers, correct, question_options);

                    break;
                case 'defineterm':
                    var terms = [];
                    var $optionlist = $question.find('ul');
                    var correct = [];

                    $optionlist.find('li').each(function(i, v){
                        var $opt = $(this);
                        terms[terms.length] = $opt.html();
                        correct[correct.length] = $opt.attr('data-response');
                    });

                    question_options.caseSensitive = $question.attr('data-casesensitive') ? $question.attr('data-casesensitive') : false;
                    question_options.keySensitive = $question.attr('data-keysensitive') ? $question.attr('data-keysensitive') : false;
                    question_options.caseSensitive = $question.attr('data-casesensitive') ? $question.attr('data-casesensitive') : false;
                    q = new jpit.activities.quiz.question.defineterm($question.find('description').html(), terms, correct, question_options);

                    break;
                case 'multisetchoice':
                    var answers = [];
                    var $optionlist = $question.find('ul');
                    var correctkeys = [], correct = [];

                    $optionlist.find('li').each(function(i, v){
                        var $opt = $(this);
                        answers[answers.length] = $opt.html();

                        if (!correctkeys[$opt.attr('data-response')]) {
                            correctkeys[$opt.attr('data-response')] = [];
                        }
                        correctkeys[$opt.attr('data-response')].push(i);

                    });

                    for (var key in correctkeys) {
                        if (correctkeys.hasOwnProperty(key)) {
                            correct.push(correctkeys[key]);
                        }
                    }

                    q = new jpit.activities.quiz.question.multisetchoice($question.find('description').html(), answers, correct, question_options);

                    break;
            }

            questions[questions.length] = q;
        });

        var d_answer_buttons = {};
        var ok = dhbgApp.s('accept');
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + dhbgApp.s('answer_required') + '</div>').dialog({ modal: true, autoOpen: false, buttons: d_answer_buttons });

        var $box_questions = $('<div class="box_content"></div>');
        var $box_end = $('<div class="box_end" style="display:none"></div>');

        var add_restart_button = function () {
            if (!allowRetry) return;
            var $button_again = $('<button class="button general">' + dhbgApp.s('restart_activity') + '</button>');
            $button_again.on('click', function(){
                $this.empty();
                $this.html(html_body);
                dhbgApp.actions.activityQuiz($this, options);
                dhbgApp.actions.autoLoadSounds($this);
                $this.data('clock') && $this.data('clock').restart();
            });
            $box_end.append($button_again);
        }

        var add_end_button = function () {
            var $button_end = $('<button class="button general">' + dhbgApp.s('end_activity') + '</button>');
            $button_end.on('click', function(){
                $box_end.empty().hide();
                $.each(questions, function(idx, q) {
                    q.resolve && q.resolve();
                });
                $this.data('clock') && $this.data('clock').hide();
            });
            $box_end.append($button_end);
        }

        var activity = new jpit.activities.quiz.activity($box_questions, questions, activityOptions);
        activity.verified = [];

        var $verify = $('<button class="button general">' + dhbgApp.s('verify') + '</button>');
        $verify.on('mouseover', dhbgApp.defaultValues.buttonover);
        $verify.on('mouseout', dhbgApp.defaultValues.buttonout);
        $verify.on('click', function() {
            // If it is not answered.
            if(!activity.showPartialFeedback(activity.currentPagination)){
                $dialog_answer_required.dialog('open');
            }
            else {
                activity.verified[activity.currentPagination] = true;
                var lower = (activity.currentPagination * activity.paginationNumber) - activity.paginationNumber; // Before question index.
                var top = (activity.currentPagination * activity.paginationNumber); // Next question index.
                for(var i = lower; i < top; i++){
                    if(activity.finalQuestionList[i] != undefined) {
                        activity.finalQuestionList[i].showFeedback();
                        activity.finalQuestionList[i].disableQuestion(); // Disable questions in current page.
                    }
                }

                $(this).hide();

                // If all questions were answered.
                if(activity.isFullAnswered()){
                    $this.data('clock') && $this.data('clock').stop(); //Stop timer if any

                    for(var i = 0; i < activity.finalQuestionList.length; i++){
                        if(activity.finalQuestionList[i] != undefined && activity.finalQuestionList[i].isQualifiable()) {
                            activity.finalQuestionList[i].showFeedback();
                            activity.finalQuestionList[i].disableQuestion(); // Disable questions in current page.
                            activity.verified[i + 1] = true;
                        }
                    }

                    var weight = Math.round(activity.getSolvedWeight());

                    if (dhbgApp.scorm) {
                        dhbgApp.scorm.activityAttempt(scorm_id, weight);
                    }

                    dhbgApp.printProgress();

                    if (count_questions > 1) {
                        var msg;
                        if (weight >= dhbgApp.evaluation.approve_limit) {
                            msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
                        }
                        else {
                            msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
                        }
                        $box_end.empty();
                        $box_end.append(msg).show();
                    }
                    else {
                        $box_end.show();
                    }

                    if (weight < 100) {
                        add_restart_button();
                    }
                    $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                        id: scorm_id,
                        weight: weight
                    }]);
                }
            }

        });

        var verify_display_function = function() {
            if (activity.verified[activity.currentPagination]) {
                $verify.hide();
            }
            else {
                $verify.show();
            };

            var lower = (activity.currentPagination * activity.paginationNumber) - activity.paginationNumber; // Before question index.
            var top = (activity.currentPagination*activity.paginationNumber); // Next question index.
            for(var i = lower; i < top; i++){
                if(activity.finalQuestionList[i] != undefined  && !activity.finalQuestionList[i].isQualifiable()) {
                    $verify.hide();
                }
            }

        };

        activity.container.find('.jpit_activities_quiz_paginator_previous').on('click', verify_display_function);
        activity.container.find('.jpit_activities_quiz_paginator_next').on('click', verify_display_function);

        var $verify_box = $('<div class="verify_box"></div>');
        $verify_box.append($verify);
        $box_questions.find('.jpit_activities_quiz_board').after($verify_box);

        var $editToolbars = $this.find('.tpy-edit-toolbar').remove(); //clear the edit toolbars, if they exists
        $this.empty();
        $this.append($box_questions);
        $this.append($box_end);
        verify_display_function();
        $this.append($editToolbars); //Put the edit toolbars back in

        $this.on('jpit:timer:elapsed', function(){
            $.each(questions, function(idx, q) { q.disableQuestion(); });
            $verify_box.hide();
            add_restart_button();
            options.allow_reveal && add_end_button();
            $box_end.show();
            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: 0
            }]);
        });
    };

    dhbgApp.actions.activityWordpuzzle = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'wordpuzzle';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_wordpuzzle_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('all_correct'), feedbackfalse = dhbgApp.s('all_wrong');
        var html_body = $this.html();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        var d_answer_buttons = {};
        var ok = dhbgApp.s('accept');
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + dhbgApp.s('selected_required') + '</div>').dialog({ modal: true, autoOpen: false, buttons: d_answer_buttons });

        // Build the board.
        var letters = '', letterslist = [], words = [], words_definition = [];
        $this.find('letters row').each(function(){
            letterslist[letterslist.length] = $(this).text();
        });

        letters = letterslist.join('|');

        var $box_words   = $('<div class="box_words"></div>');
        var $box_score   = $('<div class="box_score"><strong>' + dhbgApp.s('score') + ' </strong><span class="result"></span></div>');
        var $box_end     = $('<div class="box_end" style="display:none"></div>');

        var k = 0;
        // Build the word list, verify answers and show finalization dialog.
        $this.find('.words li').each(function(){
            var $item = $(this);
            var term = $item.attr('data-term');
            $item.removeAttr('data-term');
            var definition = $item.text();

            $item.empty();
            $item.append('<label for="' + unique_id + '_control_' + k + '">' + definition + '</label>')

            if (!term) {
                term = definition;
            }

            words[words.length] = new jpit.activities.wordpuzzle.word(term);
            words_definition[words_definition.length] = definition;

            var $control = $('<input type="radio" id="' + unique_id + '_control_' + k + '" name="' + unique_id + '_control[]" value="' + (words.length - 1) + '" />');
            $item.prepend($control);

            $control.on('click', function() {

                // Init verification.
                activity.initTerm("jpit_activity_wordpuzzle_correct", $(this).val(), function(){
                    $item.addClass('selected');
                    $control.attr('disabled', 'disabled');

                    $box_score.find('.result').text(dhbgApp.s('result_to', { 'a': activity.getTotalResult(), 'b': words.length }));

                    var weight = Math.round((activity.getTotalResult()*100) / words.length);

                    if (weight == 100) {
                        var msg = '<div class="correct">' + feedbacktrue + '</div>';
                        $box_end.append(msg).show();
                    }

                    if (weight >= dhbgApp.evaluation.approve_limit) {
                        if (dhbgApp.scorm) {
                            dhbgApp.scorm.activityAttempt(scorm_id, weight);
                        }
                        dhbgApp.printProgress();
                    }
                });
            });

            k++;
        });

        $box_score.find('.result').text(dhbgApp.s('result_to', { 'a': 0, 'b': words.length }));

        $box_words.append($this.find('.words'));

        var $box_content = $('<div class="box_content"></div>');
        activity = new jpit.activities.wordpuzzle.game(letters, $box_content, words, null, false);


        // Clean the container.
        $this.empty();

        var $layout = $('<table class="layout"></table>');
        var $r1 = $('<tr></tr>'), $r2 = $('<tr></tr>');
        var $f1 = $('<td rowspan="2" class="board_content"></td>'), $f2 = $('<td class="word_content"></td>'), $f3 = $('<td class="score_content"></td>');

        $f1.append($box_content);

        $f2.append($box_words);
        $f3.append($box_score);

        $r1.append($f1);
        $r1.append($f2);

        $r2.append($f3);

        $layout.append($r1);
        $layout.append($r2);

        $this.append($layout);
        $this.append($box_end);

        $this.append('<br class="clear" />');
    };

    dhbgApp.actions.activityCrossword = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'crossword';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_crossword_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('all_correct'), feedbackfalse = dhbgApp.s('all_wrong');
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        var html_body = $this.html();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();

        // Build the board.
        var words = [];
        var i = 1;

        var $box_content = $('<div class="box_content"></div>');
        var $box_horizontal   = $('<ol class="box_words"></ol>');
        var $box_vertical   = $('<ol class="box_words"></ol>');
        var $box_end = $('<div class="box_end" style="display:none"></div>');

        $this.find('horizontal li').each(function(){
            var $word = $(this);
            var label = $word.attr('data-label') ? $word.attr('data-label') : i;

            words[words.length] = new jpit.activities.crossword.word($word.attr('data-term'), parseInt($word.attr('data-col')), parseInt($word.attr('data-row')), label, jpit.activities.crossword.directions.lr);

            $box_horizontal.append('<li>' + $word.text() + '</li>');
            i++;
        });

        $box_vertical.attr('start', i);

        $this.find('vertical li').each(function(){
            var $word = $(this);
            var label = $word.attr('data-label') ? $word.attr('data-label') : i;

            words[words.length] = new jpit.activities.crossword.word($word.attr('data-term'), parseInt($word.attr('data-col')), parseInt($word.attr('data-row')), label, jpit.activities.crossword.directions.tb);

            $box_vertical.append('<li>' + $word.text() + '</li>');

            i++;
        });

        var properties = { 'caseSensitive': false };

        activity = new jpit.activities.crossword.game($box_content, words, properties);

        var $verify = $('<button class="button general">' + dhbgApp.s('verify') + '</button>');
        $verify.on('mouseover', dhbgApp.defaultValues.buttonover);
        $verify.on('mouseout', dhbgApp.defaultValues.buttonout);

        $verify.on('click', function() {
            $verify.hide();

            var words_size = i - 1;
            var weight = Math.round(activity.getTotalResult() * 100 / words_size);

            if (dhbgApp.scorm) {
                dhbgApp.scorm.activityAttempt(scorm_id, weight)
            }
            dhbgApp.printProgress();

            var msg;
            if (weight >= dhbgApp.evaluation.approve_limit) {
                msg = '<div class="correct">' + (feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight)) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + (feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight))) + '</div>';
            }

            var $msg = $(msg);
            $this.find('.box_end').append($msg).show();

            activity.stop();
            activity.highlight('correct', 'wrong');

            if (weight < 100 && allowRetry) {
                var $button_again = $('<button class="button general">' + dhbgApp.s('restart_activity') + '</button>');
                $button_again.on('click', function(){
                    $box_end.empty();
                    $box_end.hide();
                    activity.unHighlight('correct');
                    activity.unHighlight('wrong');
                    activity.run();
                    $verify.show();
                });

                $this.find('.box_end').append($button_again)
            }
            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: weight
            }]);
        });

        var $box_verify = $('<div class="verify_container"></div>');
        $box_verify.append($verify);
        $box_content.append($box_verify);

        // Clean the container and print layout.
        $this.empty();

        var $layout = $('<table class="layout"></table>');
        var $r1 = $('<tr></tr>'), $r2 = $('<tr></tr>');
        var $f1 = $('<td rowspan="2" class="board_content"></td>'), $f2 = $('<td class="word_content"></td>'), $f3 = $('<td class="word_content"></td>');

        $f1.append($box_content);

        $f2.append('<h5>' + dhbgApp.s('horizontal') + '</h5>');
        $f3.append('<h5>' + dhbgApp.s('vertical') + '</h5>');

        $f2.append($box_horizontal);
        $f3.append($box_vertical);

        $r1.append($f1);
        $r1.append($f2);

        $r2.append($f3);

        $layout.append($r1);
        $layout.append($r2);

        $this.append($layout);
        $box_content.append($box_end);
        $this.append('<br class="clear" />');

        activity.run();

        $box_content.find('input:first').focus(); // Focus in first field.

    };

    dhbgApp.actions.activityDroppable = function ($this, options) {
        var activity;
        var unique_id = 'activity_droppable_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = '', feedbackfalse = '';
        var html_body = $this.html();
        var scorm_id = options.scorm_id;

        var helper = '';
        if ($this.attr('data-droppable-content-inner') && $this.attr('data-droppable-content-helper')) {
            helper = $this.attr('data-droppable-content-helper');
        }

        var $box_end = $this.find('.box_end');
        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();

        var activityOptions = {
            'autoResolve': false,
            'continueResolve': false,
            'holdCorrects': false,
            'multiTarget': 1,
            'autoAlignNodes': false,
            'requiredAll': false,
            'required_all_pairs': true,
            'draggableContainer': $('#middle')
        };
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        var type_verification = $this.attr('data-verify-type') ? $this.attr('data-verify-type') : 'source';

        var multi;
        if (multi = $this.attr('data-target-multi')) {
            activityOptions.multiTarget = multi;
        }

        var autoalign;
        if (autoalign = $this.attr('data-autoalign')) {
            activityOptions.autoAlignNodes = autoalign === 'true';
        }
        // Build the board.
        var origins = [], targets = [], pairs = [],  pair_indexs = [];

        var i = 0;
        $this.find('[data-group]').each(function(){
            var $item = $(this);
            $item.attr('id', unique_id + '_origin_' + i);
            $item.addClass('draggable');
            origins[origins.length] = $item;

            $this.find('[data-target-group="' + $item.attr('data-group') + '"]').each(function(){
                pairs[pairs.length] = {'origin': $item, 'target': $(this)};
            });

            $item.removeAttr('data-group');
            i++;
        });

        $this.find('[data-target-group]').each(function(){
            var $item = $(this);
            $item.attr('id', unique_id + '_target_' + $item.attr('data-target-group'));
            $item.addClass('droppable');
            targets[targets.length] = $item;
            $item.removeAttr('data-target-group');
        });

        var add_restart_button = function() {
            if (!allowRetry) return;
            var $button_again = $('<button class="button general">' + dhbgApp.s('restart_activity') + '</button>');
            $button_again.on('click', function(){
                $(dhbgApp).trigger('jpit:activity:restart', [$this, {
                    id: scorm_id
                }]);
                $box_end.empty().hide();
                $this.find('.draggable,.droppable').removeClass('wrong correct');
                $this.removeClass('completed');
                activity.resetStage();
                $this.data('clock') && $this.data('clock').restart();
            });
            $box_end.append($button_again);
        };

        var add_end_button = function () {
            var $button_end = $('<button class="button general">' + dhbgApp.s('end_activity') + '</button>');
            $button_end.on('click', function(){
                $box_end.empty().hide();
                $this.find('.draggable,.droppable').removeClass('wrong correct');
                $.each(pairs, function(idx, pair) {
                    pair.origin.addClass('dropped').appendTo(pair.target);
                });
                $this.data('clock') && $this.data('clock').hide();
            });
            $box_end.append($button_end);
        }

        activityOptions.onDrop = function($dragEl) {
            $dragEl.trigger('click');

            var end = type_verification == 'target' ? activity.isComplete() : activity.isFullComplete();

            $(dhbgApp).trigger('jpit:activity:drop', [$this, {
                id: scorm_id,
                dragEl: $dragEl
            }]);

            if (!end) return;

            var timer = $this.data('clock');
            if (timer) {
                timer.stop();
            }

            var weight;

            if (type_verification == 'target') {
                weight = Math.round(activity.countCorrect() * 100 / targets.length);
            }
            else {
                weight = Math.round(activity.countCorrect() * 100 / pairs.length);
            }
            activity.disable();

            if (dhbgApp.scorm) {
                dhbgApp.scorm.activityAttempt(scorm_id, weight)
            }
            dhbgApp.printProgress();

            var msg;
            if (weight >= dhbgApp.evaluation.approve_limit) {
                msg = '<div class="correct">' + (feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight)) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + (feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight))) + '</div>';
            }

            var $msg = $(msg);
            var $close;
            if ($box_end.attr('data-enable-close-button')) {
                $close = $('<span class="icon_more button"></span>').on('click', function() {
                    $box_end.empty().hide();
                });
                $msg.append($close);
            }

            var continueWith = $this.attr('data-continue-with');
            if (continueWith) {
                var $continue = $('<button class="general">Continuar</button>').on('click', function() {
                    $(continueWith).show(200);
                    $("html, body").animate({ scrollTop: $(continueWith).offset().top }, 500);
                    $box_end.empty().hide();
                });
                $close && $close.remove();
                $msg.append($continue);
            }

            $box_end.append($msg).show();
            $this.addClass('completed');

            if (weight < 99) {
                add_restart_button();
            }

            $this.find('.draggable,.droppable').addClass('wrong');

            var corrects = activity.getCorrects();

            if (corrects.length > 0) {
                $.each(corrects, function(index, correct){
                    correct.o.removeClass('wrong').addClass('correct');
                    correct.t.removeClass('wrong').addClass('correct');
                });
            }

            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: weight
            }]);
        };

        $this.on('jpit:timer:elapsed', function(){
            activity.disable();
            add_restart_button();
            options.allow_reveal && add_end_button();
            $box_end.show();
            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: 0
            }]);
        });

        activity = new jpit.activities.droppable.board(activityOptions, origins, targets, pairs);
    };

    dhbgApp.actions.activityMultidroppable = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'multidroppable';
        var feedbacktrue = '', feedbackfalse = '';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_multidroppable_' + dhbgApp.rangerand(0, 1000, true);

        var $box_end = $this.find('.box_end');
        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct');
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong');
        }

        $this.find('feedback').empty();

        var $targets = $this.find( ".target" );
        $targets.sortable({
            revert: true
        });

        // Build the board.
        var origins = [], targets = [], pairs = [],  pair_indexs = [];

        var i = 0;
        $this.find('[data-group]').each(function(){
            var $item = $(this);
            $item.attr('id', unique_id + '_origin_' + i);
            $item.addClass('draggable');
            origins[origins.length] = $item;

            $this.find('[data-target-group="' + $item.attr('data-group') + '"]').each(function() {
                pairs[pairs.length] = {'origin': $item, 'target': $(this)};
            });

            i++;
        }).draggable({
            containment: $this,
            zIndex: 3,
            connectToSortable: $targets,
            revert: "invalid",
            start: function(event, ui) {
                $(this).addClass('jpit_activities_jpitdroppable_dragstart');
            },
            stop: function(event, ui) {
                $(this).removeClass('jpit_activities_jpitdroppable_dragstart');
            }
        });

        $this.find('[data-target-group]').each(function(){
            var $item = $(this);
            $item.attr('id', unique_id + '_target_' + $item.attr('data-target-group'));
            $item.addClass('droppable');
            targets[targets.length] = $item;
        }).droppable({
            drop: function( event, ui ) {
            },
            out: function(event, ui) {
            }
        });

        var $verify = $this.find('button.verify');
        var $continue = $this.find('button.continue');

        $verify.on('click', function () {
            var dropped = $this.find('.box_targets .draggable');

            if (dropped.length >= origins.length) {

                $this.find('[data-group]').draggable( "disable" );
                $targets.sortable( "disable" );

                var corrects = 0;
                $.each(targets, function(i, $k){
                    corrects += $k.find('[data-group="' + $k.attr('data-target-group') + '"]').addClass('correct disabled').length;
                    $k.find('[data-group!="' + $k.attr('data-target-group') + '"]').addClass('wrong disabled');
                });

                $(this).hide();

                var weight = Math.round(corrects * 100 / origins.length);

                if (dhbgApp.scorm) {
                    dhbgApp.scorm.activityAttempt(scorm_id, weight)
                }
                dhbgApp.printProgress();

                var $msg;
                if (weight >= dhbgApp.evaluation.approve_limit) {
                    $msg = $('<div class="correct"></div>');
                    $msg.append(feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight));
                }
                else {
                    $msg = $('<div class="wrong"></div>');
                    $msg.append(feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight)));
                }

                $box_end.append($msg).show();

                if (weight < 100) {
                    $continue.show();
                }
                $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                    id: scorm_id,
                    weight: weight
                }]);
            }
            else {
                var d_drop_buttons = {};
                var ok = dhbgApp.s('accept');
                d_drop_buttons[ok] = function() { $(this).dialog('close'); };
                $('<div>' + dhbgApp.s('drop_required') + '</div>').dialog({ modal: true, autoOpen: true, buttons: d_drop_buttons });
            }
        });

        $continue.on('click', function () {

            $box_end.empty().hide();
            $this.find('.draggable').removeClass('wrong').removeClass('correct').removeClass('disabled');

            $this.find('[data-group]').draggable( "enable" );
            $targets.sortable( "enable" );

            $continue.hide();
            $verify.show();
        });


        $this.find( ".draggable" ).disableSelection();
    };

    dhbgApp.actions.activityCloze = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'cloze';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        $(dhbgApp).trigger('jpit:activity:rendered', [$this, {
            id: scorm_id
        }]);

        var mark_parent = $this.attr('data-parent-mark-selector') ? $this.attr('data-parent-mark-selector') : false;

        var activity;
        var unique_id = 'activity_cloze_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = '', feedbackfalse = '';
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        var html_body = $this.html();
        var $box_end = $this.find('.box_end');
        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }
        $this.find('feedback').empty();

        var d_answer_buttons = {};
        var ok = dhbgApp.s('accept');
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + dhbgApp.s('cloze_required') + '</div>').dialog({ modal: true, autoOpen: false, buttons: d_answer_buttons });

        // Build the board.
        var words = [];
        var i = 1;

        activity = new jpit.activities.cloze.activity($this);

        var $verify = $('<button class="button general">' + dhbgApp.s('verify') + '</button>');
        $verify.on('mouseover', dhbgApp.defaultValues.buttonover);
        $verify.on('mouseout', dhbgApp.defaultValues.buttonout);

        $verify.on('click', function() {
            $(dhbgApp).trigger('jpit:activity:verify', [$this, {
                id: scorm_id
            }]);

            if (!activity.fullAnswered()){
                $dialog_answer_required.dialog('open');
            }
            else {
                $verify.hide();

                var weight = Math.round(activity.weight());

                if (dhbgApp.scorm) {
                    dhbgApp.scorm.activityAttempt(scorm_id, weight)
                }
                dhbgApp.printProgress();

                var msg;
                if (weight >= dhbgApp.evaluation.approve_limit) {
                    msg = '<div class="correct">' + (feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight)) + '</div>';
                }
                else {
                    msg = '<div class="wrong">' + (feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight))) + '</div>';
                }

                $box_end.append(msg).show();

                activity.disable();
                activity.highlight('correct', 'wrong');

                if (mark_parent) {
                    $this.find('.wrong').parents(mark_parent).addClass('wrong');
                    $this.find('.correct').parents(mark_parent).addClass('correct');
                }

                if (weight < 100 && allowRetry) {
                    var $button_again = $('<button class="button general">' + dhbgApp.s('continue_activity') + '</button>');
                    $button_again.on('click', function(){

                        $(dhbgApp).trigger('jpit:activity:again', [$this, {
                            id: scorm_id
                        }]);

                        $box_end.empty();
                        $box_end.hide();
                        $this.find('.correct').removeClass('correct');
                        $this.find('.wrong').removeClass('wrong');
                        activity.enable();
                        $verify.show();
                    });

                    $box_end.append($button_again);
                }

                $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                    id: scorm_id,
                    weight: weight
                }]);
            }
        });

        var $box_verify = $('<div class="verify_container"></div>');
        $box_verify.append($verify);
        $box_verify.insertAfter($box_end);

    };

    dhbgApp.actions.activitySortable = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'sortable';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_sortable_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('all_correct'), feedbackfalse = dhbgApp.s('all_wrong');
        var html_body = $this.html();
        var $box_end = $this.find('.box_end');
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();

        var set_position = $this.attr('data-set-position') ? $this.attr('data-set-position') : false;

        // Build the board.
        activity = new jpit.activities.sortable.activity($this);

        if (set_position) {
            $this.find('.ui-sortable').on('sortstop', function() {
                $this.find(set_position).each(function(i, o) {
                    var $item = $(this);
                    var group = Number($item.parent().attr('data-group'));
                    var minus = 0;

                    if (group) {
                        for (var j = group - 1; j > 0; j--) {
                            minus += $this.find('[data-group=' + j + ']').length;
                        }
                    }

                    $item.html(i + 1 - minus);
                });
            });
        }

        var $verify = $('<button class="button general">' + dhbgApp.s('verify') + '</button>');
        $verify.on('mouseover', dhbgApp.defaultValues.buttonover);
        $verify.on('mouseout', dhbgApp.defaultValues.buttonout);

        $verify.on('click', function() {
            $verify.hide();

            var weight = Math.round(activity.weight());

            if (dhbgApp.scorm) {
                dhbgApp.scorm.activityAttempt(scorm_id, weight)
            }
            dhbgApp.printProgress();

            var msg;
            if (weight >= dhbgApp.evaluation.approve_limit) {
                msg = '<div class="correct">' + (feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight)) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + (feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight))) + '</div>';
            }

            var $msg = $(msg);
            $box_end.append($msg).show();

            activity.disable();
            activity.highlight('correct', 'wrong');

            if (weight < 100 && allowRetry) {
                var $button_again = $('<button class="button general">' + dhbgApp.s('continue_activity') + '</button>');
                $button_again.on('click', function(){
                    $box_end.empty();
                    $box_end.hide();
                    $this.find('.correct').removeClass('correct');
                    $this.find('.wrong').removeClass('wrong');
                    activity.enable();
                    $verify.show();
                });

                $box_end.append($button_again);
            }
            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: weight
            }]);
        });

        var $box_verify = $('<div class="verify_container"></div>');
        $box_verify.append($verify);
        $box_verify.insertAfter($box_end);

    };

    dhbgApp.actions.activityCheck = function ($this) {
        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'check';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var words = [];
        $this.find('words li').each(function (k, word) {
            var $word = $(word);
            var value = $word.attr('data-val') && $word.attr('data-val') == 'true';
            words[words.length] = new jpit.activities.check.word($word.html(), value);
        });

        $this.find('words').empty();

        var properties = {
            "onfinished": function (a) {
                var weight = Math.round(a.countCorrect() * 100 / a.words.length);

                if (a.finishedAll()) {
                    weight = 100;
                }

                if (dhbgApp.scorm) {
                    dhbgApp.scorm.activityAttempt(scorm_id, weight);
                }
                dhbgApp.printProgress();
                $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                    id: scorm_id,
                    weight: weight
                }]);
            },
        };

        // Build the board.
        var activity = new jpit.activities.check.init($this, words, properties);
        activity.noneString = dhbgApp.s('none');

    };

    dhbgApp.actions.activityMark = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'mark';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_mark_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = null, feedbackfalse = null;
        var html_body = $this.html();
        var $box_verify = $('<div class="verify_container"></div>');
        var $box_end = $('<div class="box_end"></div>');
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        $box_end.hide();
        $box_verify.append($box_end);

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();

        var d_answer_buttons = {};
        var ok = dhbgApp.s('accept');
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + dhbgApp.s('mark_required') + '</div>').dialog({ modal: true, autoOpen: false, buttons: d_answer_buttons });

        // Build the board.
        var words = [];
        var i = 1;

        var mark_type = $this.attr('data-mark-type') ? $this.attr('data-mark-type') : 'rectangle';

        activity = new jpit.activities.mark.activity($this, mark_type);

        var $verify = $('<button class="button general">' + dhbgApp.s('verify') + '</button>');
        $verify.on('mouseover', dhbgApp.defaultValues.buttonover);
        $verify.on('mouseout', dhbgApp.defaultValues.buttonout);

        $verify.on('click', function() {
            if (!activity.fullAnswered()){
                $dialog_answer_required.dialog('open');
            }
            else {
                $verify.hide();

                var weight = Math.round(activity.weight());

                if (dhbgApp.scorm) {
                    dhbgApp.scorm.activityAttempt(scorm_id, weight)
                }
                dhbgApp.printProgress();

                var msg, feedback;
                if (weight >= 100) {
                    if (feedbacktrue == null) {
                        feedback = dhbgApp.s('all_correct_percent', weight);
                    }
                    else {
                        feedback = feedbacktrue;
                    }

                    msg = '<div class="correct">' + feedback + '</div>';

                    $this.data('finished', true);
                }
                else {
                    if (feedbackfalse == null) {
                        feedback = dhbgApp.s('wrong_continue', (100 - weight));
                    }
                    else {
                        feedback = feedbackfalse;
                    }

                    msg = '<div class="wrong">' + feedback + '</div>';

                    $this.data('finished', false);
                }
                $box_end.append(msg).show();

                activity.disable();
                activity.highlight('correct', 'wrong');

                if (weight < 100 && allowRetry) {
                    var $button_again = $('<button class="button general">' + dhbgApp.s('continue_activity') + '</button>');
                    $button_again.on('click', function(){
                        $box_end.empty();
                        $box_end.hide();
                        $this.find('.correct').removeClass('correct');
                        $this.find('.wrong').removeClass('wrong');
                        activity.enable();
                        $verify.show();
                    });

                    $box_end.append($button_again);
                }
                $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                    id: scorm_id,
                    weight: weight
                }]);
            }
        });

        $box_verify.append($verify);
        $this.append($box_verify);

        if (mark_type == 'map') {
            var fill_color = $this.attr('data-mark-fill-color') ? $this.attr('data-mark-fill-color') : 'ffffff';
            var stroke_color = $this.attr('data-mark-stroke-color') ? $this.attr('data-mark-stroke-color') : 'ffffff';
            var opacity = $this.attr('data-mark-opacity') ? parseFloat($this.attr('data-mark-opacity')) : 0.4;

            $this.find('img').maphilight( { fill : true, fillColor: fill_color, fillOpacity: opacity, strokeColor: stroke_color } );
        }
    };

    dhbgApp.actions.activitySelection = function ($this) {
        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'selection';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var d_answer_buttons = {};
        var ok = dhbgApp.s('accept');
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + dhbgApp.s('answer_required') + '</div>').dialog({modal: true, autoOpen: false, buttons: d_answer_buttons });
        var allowRetry = !($this.attr('data-allow-retry') === 'false');
        var modalFeedback = true && $this.attr('data-modal-feedback');

        // Load custom feedback, if exists.
        var feedbacktrue = null, feedbackfalse = null;

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();
        // End feedback.

        var mark_parent = $this.attr('data-parent-mark-selector') ? $this.attr('data-parent-mark-selector') : false;

        // It can be: single or multi.
        var mode = $this.attr('data-mode') ? $this.attr('data-mode') : 'multi';

        var $paginator = $this.find('.ctrl-pagination');
        var hasPagination = $paginator.length > 0;
        var pagination = $paginator.data('pagination');
        var nextPageSelectionRequired = $this.attr('data-next-page-selection-required') == 'true';

        var groups = [];
        var groups_by_index = [];
        $this.find('[data-group]').each(function (k, element) {
            var $element = $(element);

            var group_index = $element.attr('data-group');
            var correct = $element.attr('data-correct') && $element.attr('data-correct') == 'true';

            var node = {
                element: $element,
                index: group_index
            };

            var position;
            if (typeof groups_by_index[group_index] == 'undefined') {
                position = groups.length;
                groups_by_index[group_index] = position;
                groups[position] = {correct: [], wrong: [] };
            }
            else {
                position = groups_by_index[group_index];
            }

            if (correct) {
                groups[position].correct[groups[position].correct.length] = node;
            }
            else {
                groups[position].wrong[groups[position].wrong.length] = node;
            }

            $element.on('click', function(){
                var $e = $(this);
                if ($this.hasClass('answered')) {
                    return;
                }

                if (mode == 'single') {
                    $this.find('[data-group="' + $e.attr('data-group') + '"]').removeClass('selected');
                    $e.addClass('selected');
                }
                else {
                    $e.toggleClass('selected');
                }

                if (hasPagination && $e.is('.selected') && $this.attr('data-next-page-on-selection') == 'true') {

                    if (nextPageSelectionRequired && pagination.isLastPage()) {
                        $button_check.trigger('click');
                    }
                    else {
                        pagination.moveNext();
                    }
                }
            });
        });

        if (hasPagination && nextPageSelectionRequired) {
            $paginator.on('jpit:pagination:changed', function(event, page) {
                if ($(page).find('[data-group].selected').length > 0) {
                    pagination.setButtonEnable('next', true);
                }
                else {
                    pagination.setButtonEnable('next', false);
                }
            });
            pagination.setButtonEnable('next', false);
        }

        var definition_error = false;
        $.each(groups, function(i, g) {
            if (g.correct.length == 0 && g.wrong.length == 0) {
                definition_error = true;
                console.log('Error on group definition: ');
                console.log(g);
            }
        });

        if (definition_error) {
            $(dhbgApp).trigger('jpit:activity:definitionerror', [$this, { id: scorm_id }]);
            return;
        }


        // Shuffle elements.
        var if_shuffle = function() {
            var shuffle = 1 && $this.attr('data-shuffle-selector');

            if (shuffle) {
                $this.find($this.attr('data-shuffle-selector')).randomize();
                if ($this.attr('data-shuffle-index')) {
                    $this.find($this.attr('data-shuffle-selector')).children().each(function(i, element) {
                        $(element).find($this.attr('data-shuffle-index')).html(i + 1);
                    });
                }
            }
        };

        if_shuffle();

        var $box_end = $this.find('.box_end');

        var $msg_end = $('<div class="msg"></div>');
        $box_end.append($msg_end);

        var $button_check = $('<button class="general btn-check">' + dhbgApp.s('verify') + '</button>');
        $box_end.append($button_check);

        var $button_again = $('<button class="general btn-again">' + dhbgApp.s('restart_activity') + '</button>');
        $box_end.append($button_again);
        $button_again.hide();


        $button_check.on('click', function() {
            var full = true;
            $.each(groups, function(i, g) {

                var answer_one = false;
                $.each(g.correct, function(j, item) {
                    if (item.element.hasClass('selected')) {
                        answer_one = true;
                    }
                });

                $.each(g.wrong, function(j, item) {
                    if (item.element.hasClass('selected')) {
                        answer_one = true;
                    }
                });

                if (!answer_one) {
                    full = false;
                }
            });

            if (!full) {
                $dialog_answer_required.dialog('open');
                return;
            }

            var count_corrects = 0;
            $.each(groups, function(i, g) {

                var sub_correct = 0;
                $.each(g.correct, function(j, item) {
                    if (item.element.hasClass('selected')) {
                        if (mode != 'multi') {
                            item.element.addClass('correct');
                        }

                        if (mark_parent) {
                            item.element.parents(mark_parent).addClass('correct');
                        }
                        sub_correct++;
                    }
                    else {
                        if (mode == 'multi') {
                            sub_correct--;
                        }
                    }
                });

                $.each(g.wrong, function(j, item) {
                    if (item.element.hasClass('selected')) {
                        if (mode != 'multi') {
                            item.element.addClass('wrong');
                        }

                        if (mark_parent) {
                            item.element.parents(mark_parent).addClass('wrong');
                        }

                        if (mode == 'multi') {
                            sub_correct--;
                        }
                    }
                    else {
                        if (mode == 'multi') {
                            sub_correct++;
                        }
                    }
                });

                if (mode == 'multi') {
                    if (sub_correct > 0) {
                        count_corrects += sub_correct / (g.correct.length + g.wrong.length);
                    }
                }
                else {
                    count_corrects += sub_correct;
                }
            });

            var weight = Math.round(count_corrects * 100 / groups.length);

            if (dhbgApp.scorm) {
                var student_response = [];
                $this.find('[data-group].selected').each(function(idx, el) {
                    student_response[student_response.length] = $(el).attr('data-group-value');
                });

                student_response = student_response.join('|');

                dhbgApp.scorm.activityAttempt(scorm_id, weight, null, student_response);
            }
            dhbgApp.printProgress();

            var msg;
            if (weight >= dhbgApp.evaluation.approve_limit) {
                msg = '<div class="correct">' + (feedbacktrue ? feedbacktrue : dhbgApp.s('all_correct_percent', weight)) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + (feedbackfalse ? feedbackfalse : dhbgApp.s('wrong_percent', (100 - weight))) + '</div>';
            }

            $msg_end.empty();
            $msg_end.append(msg);

            $this.addClass('answered');

            $button_check.hide();

            if (weight < 100 && allowRetry) {
                $button_again.show();
            }

            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: weight
            }]);
        });

        $button_again.on('click', function() {
            $(dhbgApp).trigger('jpit:activity:again', [$this, { id: scorm_id }]);
            $this.find('.correct').removeClass('correct');
            $this.find('.wrong').removeClass('wrong');
            $this.find('.selected').removeClass('selected');
            $this.removeClass('answered');
            $msg_end.empty();
            if_shuffle();
            $button_again.hide();
            $button_check.show();
        });
        $(dhbgApp).trigger('jpit:activity:rendered', [$this, { id: scorm_id }]);
    };

    dhbgApp.actions.activityForm = function ($this) {

        var printable = $this.attr('data-print');
        var can_save = $this.attr('data-save');

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'form';

        if (dhbgApp.scorm && can_save) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_form_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('form_full'), feedbackfalse = dhbgApp.s('form_required');
        var data_require_all = $this.attr('data-require-all') == 'true';

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        $this.find('feedback').empty();

        var ok = dhbgApp.s('accept');
        var d_answer_buttons = {};
        d_answer_buttons[ok] = function() { $(this).dialog('close'); };
        var $dialog_answer_required = $('<div>' + feedbackfalse + '</div>').dialog({ modal: true, autoOpen: false, buttons: d_answer_buttons });

        var $dialog_save_error = $('<div>' + dhbgApp.s('save_wrong') + '</div>').dialog({modal: true, autoOpen: false, buttons: d_answer_buttons });

        var $dialog_saved = $('<div>' + dhbgApp.s('save_correct') + '</div>').dialog({modal: true, autoOpen: false, buttons: d_answer_buttons });

        // Build the board.
        activity = new jpit.activities.form.init($this);

        var $buttons = $('<div class="button_container"></div>');

        if (printable) {
            var $print = $('<button class="button general">' + dhbgApp.s('print_version') + '</button>');
            $print.on('mouseover', dhbgApp.defaultValues.buttonover);
            $print.on('mouseout', dhbgApp.defaultValues.buttonout);
            $buttons.append($print);

            $print.on('click', function() {
                if (!activity.fullAnswered()){
                    $dialog_answer_required.dialog('open');
                }
                else {
                    $('#printent_back').data('offset_return', $this.offset().top);
                    $('body').addClass('print_mode');
                    $('#printent_content').show();
                    $('#printent_content div.content').append(activity.printableContent());
                }
            });
        }

        if (can_save && typeof dhbgApp.scorm == 'object' && dhbgApp.scorm.lms) {
            $this.append('<div class="activity_modal"></div>');
            var $save = $('<button class="button general">' + dhbgApp.s('save') + '</button>');
            $save.on('mouseover', dhbgApp.defaultValues.buttonover);
            $save.on('mouseout', dhbgApp.defaultValues.buttonout);
            $buttons.append($save);

            // Load current values, if exists.
            var scorm_value = dhbgApp.scorm.getActivityValue(scorm_id);

            if (typeof scorm_value == 'string') {
                var unserialize_data = window.atob(scorm_value);
                activity.load_serialized(unserialize_data);
            }

            $save.on('click', function() {
                $this.addClass('saving');
                if (data_require_all && !activity.fullAnswered()){
                    $dialog_answer_required.dialog('open');
                    $this.removeClass('saving');
                }
                else {
                    var serialize_data = activity.serialize();
                    var encode_serialize_data = window.btoa(serialize_data);
                    var txt_response = activity.txtContent();
                    if (txt_response.length > 256) {
                        txt_response = txt_response.substring(0, 250);
                        txt_response += '[...]';
                    }

                    dhbgApp.scorm.activityAttempt(scorm_id, 100, 0, txt_response);
                    dhbgApp.printProgress();

                    if (dhbgApp.scorm.setActivityValue(scorm_id, encode_serialize_data)) {
                        $dialog_saved.dialog('open');
                    }
                    else {
                        $dialog_save_error.dialog('open');
                    }
                    $this.removeClass('saving');
                }
            });
        }

        if($this.find('.see_more').length > 0){
            var $button_feedback = $this.find('.see_more');
            $buttons.append($button_feedback);
        }

        $this.append($buttons);

    };

    dhbgApp.actions.activityView = function ($this) {
        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'view';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        if (dhbgApp.scorm.activities[scorm_id].length > 0) {
            $this.addClass('visited');
            return;
        }

        $this.on('click', function() {
            var weight = 100;

            if (dhbgApp.scorm) {
                dhbgApp.scorm.activityAttempt(scorm_id, weight);
            }

            dhbgApp.printProgress();

            $this.addClass('visited');

            $(dhbgApp).trigger('jpit:activity:completed', [$this, {
                id: scorm_id,
                weight: weight
            }]);
        });

        $(dhbgApp).trigger('jpit:activity:rendered', [$this, { id: scorm_id }]);
    };

    $('[data-offset="true"]').each(function(){
        var $this = $(this);
        var menu_offset = $this.offset().top + $this.height();

        $( window ).bind("scroll", function() {
            var offset = $(this).scrollTop();

            if (offset >= menu_offset) {
                $this.addClass('scroll_top');
            }
            else if (offset < menu_offset) {
                $this.removeClass('scroll_top');
            }
        });

    });

};

