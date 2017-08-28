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
    else {
        $('[data-global-id="results"]').remove();
    }

    // ==============================================================================================
    // Build menus.
    // ==============================================================================================
    $('nav > menu').each(function(){
        var $this = $(this);
        var $nav = $this.parent();

        var $more_class = $this.attr('type') ? $this.attr('type') : 'horizontal';
        var $menu = $('<ul class="menu ' + $more_class + '" role="menu"></ul>');

        var f_builditem;

        var f_buildsubmenu = function($sub) {
            var $submenu = $('<ul class="submenu" role="menu"></ul>');
            $sub.find('> menuitem').each(function(){
                var $item = f_builditem($(this));
                $submenu.append($item);
            });

            $submenu.find('> li').first().addClass('first-child');
            $submenu.find('> li:last-child').first().addClass('last-child');
            return $submenu;
        };

        f_builditem = function($li) {
            var $item = $('<li class="button"></li>');

            if ($li.attr('label')) {
                $item.html($li.attr('label'));
            }
            else {
                var $children = $li.children();
                if ($children.length > 0) {
                    $item.append($children);
                }
                else {
                    $item.html($li.html());
                }
            }

            var $withsub = false;
            $li.find('> menu').each(function(){
                $item.append(f_buildsubmenu($(this)));
                $withsub = true;
            });

            if ($withsub) {
                $item.addClass('withsubitems');
            }

            if ($li.attr('data-page')) {
                $item.attr('data-page', $li.attr('data-page'));
            }

            if ($li.attr('data-global-id')) {
                $item.attr('data-global', $li.attr('data-global-id'));
            }

            return $item;
        };

        $this.find('> menuitem').each(function(){
            var $item = f_builditem($(this));
            $menu.append($item);
        });

        $menu.find('> li').first().addClass('first-child');
        $menu.find('> li:last-child').first().addClass('last-child');

        $nav.empty();
        $nav.append($menu);
    });

    // ==============================================================================================
    // Progress control
    // ==============================================================================================
    $('.measuring-progress').each(function() {
        if (typeof dhbgApp.scorm == 'object') {
            var $this = $(this);
            var type = $this.attr('data-type') ? $this.attr('data-type') : 'default';
            $this.addClass(type);
            var progress_text = dhbgApp.s('progress');

            switch (type) {
                case 'horizontal':
                    var $box_label = $('<div class="results_value"><label>0</label><br />%</div>');
                    var $label = $box_label.find('label');
                    var $box_bar = $('<div class="results_level"><div></div></div>');
                    var $bar = $box_bar.find('div');
                    $this.append($box_label);
                    $this.append($box_bar);
                    $this.append('<div class="progress_text">' + progress_text + '</div>')
                    dhbgApp.loadProgress = function(progress) {
                        $bar.css('width', progress + '%');
                        $label.text(progress);
                    };
                    break;
                case 'vertical':
                    var $box_label = $('<div class="results_value"><label>0</label><br />%</div>');
                    var $label = $box_label.find('label');
                    var $box_bar = $('<div class="results_level"><div></div></div>');
                    var $bar = $box_bar.find('div');
                    $this.append($box_label);
                    $this.append($box_bar);
                    $this.append('<div class="progress_text">' + progress_text + '</div>')
                    dhbgApp.loadProgress = function(progress) {
                        $bar.css('height', (100 - progress) + '%');
                        $label.text(progress);
                    };
                    break;
                case 'circle':
                    $this.addClass('c100 small');
                    var $label = $('<span></span>');
                    var $bar = $('<div class="slice"><div class="bar"></div><div class="fill"></div></div>');
                    $this.append($label);
                    $this.append($bar);
                    dhbgApp.loadProgress = function(progress) {
                        $this.addClass('p' + progress);
                        $label.text(progress + '%');
                    };
                    break;
                default:
                    var $label = $('<label></label)');
                    var $bar = $('<progress value="0" max="100"></progress>');
                    $this.append('<div class="progress_text">' + progress_text + '</div>')
                    $this.append($bar);
                    $this.append($label);
                    dhbgApp.loadProgress = function(progress) {
                        $label.html(progress + '%');
                        $bar.attr('value', progress);
                    };
            }
        }
    });

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
    $('[data-page]').on('click', function () {
        var $this = $(this);
        dhbgApp.loadPageN($this.attr('data-page'));
    });

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
    $('.box-text').each(function(){
        var $this = $(this);
        var $children = $this.children();
        var $box_body = $('<div class="box_body"></div>');

        var $object = ($children.length > 0) ? $children : $this.html();

        $box_body.append($object);

        $this.empty();

        if ($this.attr('label')) {
            var $box_title = $('<div class="title">' + $this.attr('label') + '</div>');
            $this.append($box_title);
        }

        $this.append($box_body);
    });

    // ==============================================================================================
    // Modal Windows
    // ==============================================================================================
    $('.w-content').each(function() {
        var $this = $(this);
        var properties = {
            modal: true,
            autoOpen: false,
            close: function( event, ui ) {
                $('body').removeClass('dhbgapp_fullview');
            }
        };

        if ($this.attr('data-property-width')) {
            properties.width = $this.attr('data-property-width');
        }

        if ($this.attr('data-property-height')) {
            properties.height = $this.attr('data-property-height');
        }

        if ($this.attr('data-cssclass')) {
            properties.dialogClass = $this.attr('data-cssclass');
        }

        $this.dialog(properties);
    });

    $('.w-content-controler').on('click', function(){
        var $this = $(this);
        var w = $this.attr('data-property-width');
        var h = $this.attr('data-property-height');

        if (w) {
            $($this.attr('data-content')).dialog('option', 'width', w);
        }

        if (h) {
            $($this.attr('data-content')).dialog('option', 'height', h);
        }

        $($this.attr('data-content')).dialog('open');
        $('body').addClass('dhbgapp_fullview');
    });

    // ==============================================================================================
    // Float Window
    // ==============================================================================================
    $('.wf-content').each(function() {
        var $this = $(this);

        var style = '';
        if ($this.attr('data-property-width')) {
            style += 'width:' + $this.attr('data-property-width') + ';';
        }

        if ($this.attr('data-property-height')) {
            style += 'height:' + $this.attr('data-property-height') + ';';
        }

        var $close = $('<div class="close button">X</div>');
        $close.on('click', function() {
            $this.hide({ effect: 'slide', direction: 'down' });
        });

        if (style != '') {
            $this.attr('style', style);
        }

        $this.append($close);
        $this.hide();
    });

    $('.wf-content-controler').on('click', function(){
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
    });

    // ==============================================================================================
    // "Mouse over" with one visible
    // ==============================================================================================
    $('.mouse-over-one').each(function(){
        var $this = $(this);

        $this.find('[data-ref]').on('mouseover', function() {
            $this.find('[data-ref]').each(function() {
                $($(this).attr('data-ref')).hide();
            });

            $this.parent().find('.button').removeClass('current');

            var selector = $(this).attr('data-ref');
            $(selector).show();
            $(this).addClass('current');
        });
    });

    // ==============================================================================================
    // "Mouse over"
    // ==============================================================================================
    $('.mouse-over').on('mouseover', function() {
        var selector = $(this).attr('data-ref');
        $(selector).show();
    });

    $('.mouse-over').on('mouseout', function() {
        var selector = $(this).attr('data-ref');
        $(selector).hide();
    });

    // ==============================================================================================
    // Image animations
    // ==============================================================================================
    var f_reloadanimation = function ($this) {
        var img_src = $this.data('original_src');
        $this.css('width', $this.width());
        $this.css('height', $this.height());
        $this.attr('src', 'img/transparent.png');
        $this.addClass('loading');

        var img = new Image();
        var new_img_src = img_src + '?' + (new Date().getTime());

        img.onload = function(){
            $this.attr('src', new_img_src);
            $this.removeClass('loading');
        };

        img.src = new_img_src;
    };

    $('img.animation').each(function () {
        var $this = $(this);
        $this.data('original_src', $this.attr('src'));
        var $label = $('<div class="label instruction">' + dhbgApp.s('repeat_animation') + '</div>');
        $this.wrapAll('<div class="animation_image"></div>');
        $this.parent().append($label);

        $label.on('click', function () {
            f_reloadanimation($this);
        });

        $this.on('click', function () {
            f_reloadanimation($this);
        });

    });

    $('img.play-animation').each(function () {
        var $this = $(this);
        $this.data('original_src', $this.attr('data-animation'));
        var $label = $('<div class="label instruction">' + dhbgApp.s('play_animation') + '</div>');
        $this.wrapAll('<div class="animation_image play_animation"></div>');
        $this.parent().append($label);

        $label.on('click', function () {
            f_reloadanimation($this);
        });

        $this.on('click', function () {
            f_reloadanimation($this);
        });

    });

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
    if (window.parent.document != window.document) {
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
        width: dhbgApp.documentWidth,
        height: dhbgApp.documentHeight,
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

    // ==============================================================================================
    // Special control: Accordion
    // ==============================================================================================
    $('.accordion').accordion({ autoHeight: false, heightStyle: "content"});

    // ==============================================================================================
    // Special control: View first
    // ==============================================================================================
    $('.view-first').each(function () {
        var $this = $(this);

        var $mask = $('<div class="mask"></div>');
        $mask.append($this.find('.view-content'));

        $this.append($mask);
    });

    // ==============================================================================================
    // Horizontal menu
    // ==============================================================================================
    $('.horizontal-menu').each(function(){

        var $this = $(this);
        var $chalkboard_items = $('<div class="chalkboard_items board"></div>');
        var $chalkboard_content = $('<div class="chalkboard_content elements"></div>');

        $this.find('>dl').each(function() {
            var $dl = $(this);

            var $dd= $('<div class="element rule_1 tab_content"></div>');
            $dd.append($dl.find('>dd').children());
            var $dt = $('<div class="chalkboard_item button">' + $dl.find('dt').html() + '</div>').on('click', function(){

                var $item_dt = $(this);

                if (dhbgApp.DB.loadSound) {
                    dhbgApp.DB.loadSound.pause();
                    $chalkboard_content.find('audio').each(function(){
                        this.pause();
                    });
                }

                $chalkboard_content.find('.element').hide();

                $chalkboard_items.find('.current').removeClass('current');
                $item_dt.addClass('current');
                $dd.show();
            });

            $dt.on('mouseover', dhbgApp.defaultValues.buttonover);

            $dt.on('mouseout', dhbgApp.defaultValues.buttonout);

            $chalkboard_items.append($dt);

            $chalkboard_content.append($dd);
        });

        $chalkboard_content.find('.element').hide();
        $chalkboard_items.find(':first-child').addClass('current');
        $chalkboard_items.find(':last-child').addClass('last-item');
        $chalkboard_content.find('.element:first-child').show();
        $this.empty();

        $this.append($chalkboard_items);
        $this.append('<div class="clear"></div>');
        $this.append($chalkboard_content);
        $this.append('<div class="clear"></div>');

    });

    // ==============================================================================================
    // Vertical menu
    // ==============================================================================================
    $('.vertical-menu').each(function(){

        var $this = $(this);
        var $chalkboard_items = $('<div class="chalkboard_vertical_items board"></div>');
        var $chalkboard_content = $('<div class="chalkboard_vertical_content elements"></div>');

        $this.find('dl').each(function() {
            var $dl = $(this);

            var $dd= $('<div class="element rule_1 tab_content"></div>');
            $dd.append($dl.find('>dd').children());
            var $dt = $('<div class="chalkboard_vertical_item button">' + $dl.find('dt').html() + '</div>').on('click', function(){

                    var $item_dt = $(this);

                $chalkboard_content.find('> .element').hide();

                $chalkboard_items.find('.current').removeClass('current');
                $item_dt.addClass('current');
                $dd.show();
            });

            $dt.on('mouseover', dhbgApp.defaultValues.buttonover);

            $dt.on('mouseout', dhbgApp.defaultValues.buttonout);

            $chalkboard_items.append($dt);

            $chalkboard_content.append($dd);
        });

        $chalkboard_content.find('> .element').hide();
        $chalkboard_items.find(':first-child').addClass('current');
        $chalkboard_items.find(':last-child').addClass('last-item');
        $chalkboard_content.find('> .element:first-child').show();
        $this.empty();

        $this.append($chalkboard_items);
        $this.append($chalkboard_content);
        $this.append('<div class="clear"></div>');

    });

    // ==============================================================================================
    // Vertical menu both sides
    // ==============================================================================================
    $('.vertical-menu-both-sides').each(function(){

        var $this = $(this);
        var $chalkboard_items_left = $('<div class="chalkboard_both_items_left board"></div>');
        var $chalkboard_items_right = $('<div class="chalkboard_both_items_right board"></div>');
        var $chalkboard_content = $('<div class="chalkboard_both_content elements"></div>');

        $this.find('left').each(function(){
            var $left = $(this);
            $left.find('dl').each(function() {
                var $dl = $(this);

                var $dd= $('<div class="element rule_1 tab_content"></div>');
                $dd.append($dl.find('dd').children());

                var $dt = $('<div class="chalkboard_both_item button">' + $dl.find('dt').html() + '</div>').on('click', function(){

                        var $item_dt = $(this);

                    $chalkboard_content.find('> .element').hide();

                    $this.find('.chalkboard_both_current').removeClass('chalkboard_both_current');
                    $item_dt.addClass('chalkboard_both_current');
                    $dd.show();
                });

                $dt.on('mouseover', dhbgApp.defaultValues.buttonover);

                $dt.on('mouseout', dhbgApp.defaultValues.buttonout);

                $chalkboard_items_left.append($dt);

                $chalkboard_content.append($dd);
            });
        });

        $this.find('right').each(function(){

            var $right = $(this);
            $right.find('dl').each(function() {
                var $dl = $(this);

                var $dd= $('<div class="element rule_1 tab_content"> ' + $dl.find('dd').html() + ' </div>');

                var $dt = $('<div class="chalkboard_both_item button">' + $dl.find('dt').html() + '</div>').on('click', function(){
                    var $item_dt = $(this);

                    $chalkboard_content.find('> .element').hide();

                    $this.find('.chalkboard_both_current').removeClass('chalkboard_both_current');
                    $item_dt.addClass('chalkboard_both_current');
                    $dd.show();
                });

                $dt.on('mouseover', dhbgApp.defaultValues.buttonover);

                $dt.on('mouseout', dhbgApp.defaultValues.buttonout);

                $chalkboard_content.append($dd);
                $chalkboard_items_right.append($dt);
            });
        });

        $chalkboard_content.find('> .element').hide();
        $chalkboard_items_left.find(':first-child').addClass('chalkboard_both_current');
        $chalkboard_items_left.find(':last-child').addClass('last-item');
        $chalkboard_items_right.find(':last-child').addClass('last-item');
        $chalkboard_content.find(':first-child').show();
        $this.empty();

        $this.append($chalkboard_items_left);
        $this.append($chalkboard_items_right);
        $this.append($chalkboard_content);
        $this.append('<div class="clear"></div>');

    });

    // ==============================================================================================
    // Pagination
    // ==============================================================================================
    $('.ctrl-pagination').each(function() {
        var $this = $(this);
        var $items = $this.find('>li');
        var $list = $('<ul class="layers"></ul>');

        if ($this.attr('data-layer-height')) {
            $list.height($this.attr('data-layer-height'));
        }

        var numeric_pagination  = ($this.attr('data-numeric-pagination') && $this.attr('data-numeric-pagination') == 'true');
        var data_labelcurrent   = ($this.attr('data-labelcurrent') && $this.attr('data-labelcurrent') == 'true');
        var orientation         = $this.attr('data-orientation') ? $this.attr('data-orientation') : 'horizontal';

        $this.addClass(orientation);

        //var buttons = [];
        var $list_buttons = $('<ul class="pagination ' + (numeric_pagination ? 'numeric' : 'arrows') + '"></ul>');

        var i = 1;

        $items.each(function(){
            var $item = $(this);
            $item.addClass('layer');
            $list.append($item);

            var label = i;
            if ($this.attr('data-type') == 'a') {
                label = String.fromCharCode(96 + i);
            }
            else if ($this.attr('data-type') == 'A') {
                label = String.fromCharCode(96 + i).toUpperCase(); ;
            }

            if (data_labelcurrent) {
                $item.append('<div class="label_current">' + label + '</div>');
            }

            if (numeric_pagination) {
                var $new_button = $('<li class="button"><div>' + label + '</div></li>');
                $new_button.on('mouseover', dhbgApp.defaultValues.buttonover);
                $new_button.on('mouseout', dhbgApp.defaultValues.buttonout);

                $new_button.on('click', function() {
                    $items.hide();
                    $item.show();
                    $list_buttons.find('.current').removeClass('current');
                    $(this).addClass('current');
                });

                $list_buttons.append($new_button);

                if (i == 1) {
                    $new_button.addClass('current');
                }
            }

            if (i > 1) {
                $item.hide();
            }

            i++;
        });

        if (!numeric_pagination) {
            $items.data('current', 0);

            // Next button.
            var $next_button = $('<li><div class="button next"></div></li>');
            $next_button.on('mouseover', dhbgApp.defaultValues.buttonover);
            $next_button.on('mouseout', dhbgApp.defaultValues.buttonout);

            // Back button.
            var $back_button = $('<li><div class="button previous"></div></li>');
            $back_button.on('mouseover', dhbgApp.defaultValues.buttonover);
            $back_button.on('mouseout', dhbgApp.defaultValues.buttonout);

            // It in first page is hidden.
            $back_button.css('visibility', 'hidden');

            var $position_index_label;

            // Back button event.
            $back_button.on('click', function() {

                if (dhbgApp.DB.loadSound) {
                    dhbgApp.DB.loadSound.pause();
                    dhbgApp.DB.loadSound.currentTime = 0;
                }
                var new_item_index = $items.data('current') - 1;

                if (new_item_index < 0) {
                    return;
                }

                $items.hide();
                $($items.get(new_item_index)).show();
                $items.data('current', new_item_index);
                $position_index_label.text(dhbgApp.s('pagination_label', { 'a': (new_item_index + 1), 'b': $items.length } ));

                if (new_item_index < $items.length) {
                    $next_button.css('visibility', 'visible');
                }

                if (new_item_index == 0) {
                    $back_button.css('visibility', 'hidden');
                }
            });

            $list_buttons.append($back_button);
            // End Back button.

            if (orientation == 'vertical') {
                $position_index_label = $('<div class="position">' + dhbgApp.s('pagination_label', { 'a': 1, 'b': $items.length } )  + '</div>');
                $this.append($position_index_label);
            }
            else {
                $position_index_label = $('<li class="position">' + dhbgApp.s('pagination_label', { 'a': 1, 'b': $items.length } )  + '</li>');
                $list_buttons.append($position_index_label);
            }

            // Next button event.
            $next_button.on('click', function() {
                if (dhbgApp.DB.loadSound) {
                    dhbgApp.DB.loadSound.pause();
                    dhbgApp.DB.loadSound.currentTime = 0;
                }
                var new_item_index = $items.data('current') + 1;

                if (new_item_index >= $items.length) {
                    return;
                }

                $items.hide();
                $($items.get(new_item_index)).show();
                $items.data('current', new_item_index);
                $position_index_label.text(dhbgApp.s('pagination_label', { 'a': (new_item_index + 1), 'b': $items.length } ));

                if (new_item_index == $items.length - 1) {
                    $next_button.css('visibility', 'hidden');
                }

                if (new_item_index > 0) {
                    $back_button.css('visibility', 'visible');
                }
            });

            $list_buttons.append($next_button);
            // End Next button.

        }

        $this.append($list);
        $this.append($list_buttons);
        $this.append('<div class="clear"></div>');
    });

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

    $('.jpit-activities-quiz').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityQuiz($this);
    });

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
        dhbgApp.actions.activityDroppable($this);
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

    $('.jpit-activities-form').each(function(){
        var $this = $(this);
        dhbgApp.actions.activityForm($this);
    });

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
    $('.tooltip').each(function() {

        var $this = $(this);

        var position = {};

        if ($this.attr('data-position-my')) {
            position.my =  $this.attr('data-position-my');
        }

        if ($this.attr('data-position-at')) {
            position.at =  $this.attr('data-position-at');
        }

        if ($this.attr('data-position-flipfit')) {
            position.collision =  $this.attr('data-position-flipfit');
        }

        $this.tooltip({
            content: function() {
                return '<div class="text_tooltip">' + $( this ).attr( "title" ) + '</div>';
            },
            show: null, // Show immediately.
            position: position,
            hide: { effect: "" },
            close: function(event, ui){
                ui.tooltip.hover(
                    function () {
                        $(this).stop(true).fadeTo(400, 1);
                    },
                    function () {
                        $(this).fadeOut("400", function(){
                            $(this).remove();
                        });
                    }
                );
            }
        });
    });

    // ==============================================================================================
    // Instructions
    // This is processed on the end in order to include "instructions" generated by other controls.
    // ==============================================================================================
    $('.instruction').each(function(){
        var $this = $(this);
        var cssclass = 'ion-help-circled';
        if ($this.attr('type')) {
            switch($this.attr('type')) {
                case 'info':
                    cssclass = 'ion-information-circled';
                    break;
                case 'danger':
                    cssclass = 'ion-nuclear';
                    break;
                case 'alert':
                    cssclass = 'ion-alert-circled';
                    break;
                case 'none':
                    // Not add icon.
                    return;
            }
        }
        $this.prepend('<i class="' + cssclass + '"></i>');
    });

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

    $('.expand-image').each(function() {
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
    });

    // ==============================================================================================
    // Print page
    // ==============================================================================================
    $('#printent_back').on('click', function(){
        $('#printent_content').hide();
        $('body').removeClass('print_mode');
        $('#printent_content div.content').empty();
    });

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


    if (!dhbgApp.scorm || !dhbgApp.scorm.lms) {
        $('#not_scorm_msg').html(dhbgApp.s('scorm_not'));
        $('#not_scorm_msg').dialog( { modal: true } );
    }

    if (dhbgApp.scorm && dhbgApp.scorm.activities) {
        dhbgApp.scorm.activities = dhbgApp.sortObjectByProperty(dhbgApp.scorm.activities);
    }

    if (dhbgApp.scorm && dhbgApp.scorm.change_sco) {
        dhbgApp.changeSco(dhbgApp.scorm.currentSco);
    }
    else {
        dhbgApp.loadPage(0, 0);
    }
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

            dhbgApp.DB.currentSubPage = nsubpage;

            //Actions in change page
            $.each(dhbgApp.actions.afterChangePage, function(i, v){
                v($new_page);
            });
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

    dhbgApp.actions.activityQuiz = function ($this) {
        var questions = [], activityOptions = {};
        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'quiz';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

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

        var count_questions = $this.find('question[type!="label"]').length;
        var question_weight = 100 / count_questions;

        $this.find('question').each(function(){
            var $question = $(this);
            var q;
            var question_options = {};
            var q_feedbacktrue = feedbacktrue, q_feedbackfalse = feedbackfalse;

            if ($question.find('feedback correct').text() != '') {
                q_feedbacktrue = $question.find('feedback correct').html();
            }

            if ($question.find('feedback wrong').text() != '') {
                q_feedbackfalse = $question.find('feedback wrong').html();
            }

            question_options.shuffleAnswers = $question.attr('data-shuffle') && $question.attr('data-shuffle') != 'true' ? false : true;
            question_options.prefixType = $question.attr('data-prefixtype') ? $question.attr('data-prefixtype') : jpit.activities.quiz.prefixes.capital;
            question_options.displayFeedback = true;
            question_options.feedbackIfTrue = q_feedbacktrue;
            question_options.feedbackIfFalse = q_feedbackfalse;
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

                // If all questions was answered.
                if(activity.isFullAnswered()){

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
                        var $button_again = $('<button class="button general">' + dhbgApp.s('restart_activity') + '</button>');
                        $button_again.on('click', function(){
                            $this.empty();
                            $this.html(html_body);
                            dhbgApp.actions.activityQuiz($this);
                            dhbgApp.actions.autoLoadSounds($this);
                        });

                        $box_end.append($button_again);
                    }
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

        $this.empty();
        $this.append($box_questions);
        $this.append($box_end);
        verify_display_function();
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

                    var weight = ((activity.getTotalResult()*100) / words.length);

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

        var html_body = $this.html();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

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
                msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
            }
            $this.find('.box_end').append(msg).show();

            activity.stop();
            activity.highlight('correct', 'wrong');

            if (weight < 100) {
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
        $this.append($box_end);
        $this.append('<br class="clear" />');

        activity.run();

        $box_content.find('input:first').focus(); // Focus in first field.

    };

    dhbgApp.actions.activityDroppable = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'droppable';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_droppable_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('all_correct'), feedbackfalse = dhbgApp.s('all_wrong');
        var html_body = $this.html();

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
            'autoAlignNodes': true,
            'requiredAll': false,
            'required_all_pairs': true,
            'draggableContainer': $('#middle')
        };

        var type_verification = $this.attr('data-verify-type') ? $this.attr('data-verify-type') : 'source';

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

        activity = new jpit.activities.droppable.board(activityOptions, origins, targets, pairs);

        $.each(origins, function(index, origin){
            origin.on('dragstop', function(event, ui){

                var end = type_verification == 'target' ? activity.isComplete() : activity.isFullComplete();

                if (end) {
                    var weight = Math.round(activity.countCorrect() * 100 / pairs.length);
                    activity.disable();

                    if (dhbgApp.scorm) {
                        dhbgApp.scorm.activityAttempt(scorm_id, weight)
                    }
                    dhbgApp.printProgress();

                    var msg;
                    if (weight >= 99) {
                        msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
                    }
                    else {
                        msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
                    }

                    $box_end.append(msg).show();

                    if (weight < 99) {
                        var $button_again = $('<button class="button general">' + dhbgApp.s('restart_activity') + '</button>');
                        $button_again.on('click', function(){
                            $box_end.empty().hide();
                            $this.find('.draggable').removeClass('wrong');
                            $this.find('.draggable').removeClass('correct');
                            $this.find('.droppable').removeClass('wrong');
                            $this.find('.droppable').removeClass('correct');

                            if ($this.attr('data-droppable-content-inner')) {
                                $this.find('.draggable').show();
                                $this.find('.droppable').html(helper);
                            }

                            activity.resetStage();
                        });

                        $box_end.append($button_again);
                    }

                    $this.find('.draggable').addClass('wrong');
                    $this.find('.droppable').addClass('wrong');
                    var corrects = activity.getCorrects();

                    if (corrects.length > 0) {
                        $.each(corrects, function(index, correct){
                            correct.o.removeClass('wrong');
                            correct.o.addClass('correct');
                            correct.t.removeClass('wrong');
                            correct.t.addClass('correct');
                        });
                    }
                }
            });
        });

        if ($this.attr('data-droppable-content-inner')) {
            $.each(targets, function(index, target){
                target.on('drop', function(event, ui){
                    ui.draggable.hide();
                    target.html(ui.draggable.html());
                });
            });
        }
    };

    dhbgApp.actions.activityMultidroppable = function ($this) {

        var scorm_id = $this.attr('data-act-id') ? $this.attr('data-act-id') : 'multidroppable';

        if (dhbgApp.scorm) {
            if (!dhbgApp.scorm.activities[scorm_id]) { dhbgApp.scorm.activities[scorm_id] = []; }
        }

        var activity;
        var unique_id = 'activity_multidroppable_' + dhbgApp.rangerand(0, 1000, true);

        var $box_end = $this.find('.box_end');
        $box_end.hide();

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

                var msg;
                if (weight >= dhbgApp.evaluation.approve_limit) {
                    msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
                }
                else {
                    msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
                }

                $box_end.append(msg).show();

                if (weight < 100) {
                    $continue.show();
                }
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

        var mark_parent = $this.attr('data-parent-mark-selector') ? $this.attr('data-parent-mark-selector') : false;

        var activity;
        var unique_id = 'activity_cloze_' + dhbgApp.rangerand(0, 1000, true);
        var feedbacktrue = dhbgApp.s('all_correct'), feedbackfalse = dhbgApp.s('all_correct');

        var html_body = $this.html();
        var $box_end = $this.find('.box_end');
        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

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
                    msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
                }
                else {
                    msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
                }
                $box_end.append(msg).show();

                activity.disable();
                activity.highlight('correct', 'wrong');

                if (mark_parent) {
                    $this.find('.wrong').parents(mark_parent).addClass('wrong');
                    $this.find('.correct').parents(mark_parent).addClass('correct');
                }

                if (weight < 100) {
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
        $box_end.hide();

        if ($this.find('feedback correct').text() != '') {
            feedbacktrue = $this.find('feedback correct').html();
        }

        if ($this.find('feedback wrong').text() != '') {
            feedbackfalse = $this.find('feedback wrong').html();
        }

        var set_position = $this.attr('data-set-position') ? $this.attr('data-set-position') : false;

        // Build the board.
        activity = new jpit.activities.sortable.activity($this);

        $this.find('.ui-sortable').on('sortstop', function() {
            $this.find(set_position).each(function(i, o) { $(this).html(i + 1); });
        });

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
                msg = '<div class="correct">' + dhbgApp.s('all_correct_percent', weight) + '</div>';
            }
            else {
                msg = '<div class="wrong">' + dhbgApp.s('wrong_percent', (100 - weight)) + '</div>';
            }
            $box_end.append(msg).show();

            activity.disable();
            activity.highlight('correct', 'wrong');

            if (weight < 100) {
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

                if (weight < 100) {
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
                if (!activity.fullAnswered()){
                    $dialog_answer_required.dialog('open');
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
                        $this.removeClass('saving');
                    }
                    else {
                        $dialog_save_error.dialog('open');
                        $this.removeClass('saving');
                    }
                }
            });
        }

        if($this.find('.see_more').length > 0){
            var $button_feedback = $this.find('.see_more');
            $buttons.append($button_feedback);
        }

        $this.append($buttons);

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

