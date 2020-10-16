/****************************************
tepuy jQuery plugins
****************************************/
(function ($) {

    // ==============================================================================================
    // tepuyAnimation helpers
    // ==============================================================================================
    function f_reloadanimation($this) {
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

    // ==============================================================================================
    // tepuyInnerMenu helpers
    // ==============================================================================================
    function innerMenuEntryOnClick(ev) {
        var $item_dt = $(this);
        var data = $item_dt.data();
        var $menu = $item_dt.closest('.inner-menu');
        var $content = $menu.find('.inner-menu-content');
        if (dhbgApp.DB.loadSound) {
            dhbgApp.DB.loadSound.pause();
            var pauseFn = function(){this.pause()};
            $content.find('audio').each(pauseFn);
        }
        $content.find('> .element').hide();
        $menu.find('.board .'+data.current_class).removeClass(data.current_class);
        $item_dt.addClass(data.current_class);
        data.$content.show();
    }

    function processMenuEntry(dl, $chalkboard_items, $chalkboard_content, type) {
        var $dl = $(dl);
        var dt_class = {'vertical': 'chalkboard_vertical_item', 'horizontal': 'chalkboard_item', 'sidebyside': 'chalkboard_both_item' };
        var current_class = type == 'sidebyside' ? 'chalkboard_both_current' : 'current';
        var $dd= $('<div class="element rule_1 tab_content"></div>');
        $dd.append($dl.find('>dd').children());
        var $dt = $('<div class="button">' + $dl.find('>dt').html() + '</div>')
        .addClass(dt_class[type])
        .data({'$content': $dd, current_class: current_class})
        .on('click', innerMenuEntryOnClick);

        $dt.on('mouseover', dhbgApp.defaultValues.buttonover);
        $dt.on('mouseout', dhbgApp.defaultValues.buttonout);
        $chalkboard_items.append($dt);
        $chalkboard_content.append($dd);
    }

    // ==============================================================================================
    // tepuy jquery plugins
    // ==============================================================================================
    /**
     * Tepuy Menu
     * @return {[type]}
     */
    $.fn.tepuyMenu = function() {
        return this.each(function(){
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
    }

    $.fn.tepuyProgressIndicator = function() {
        return this.each(function() {
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
    }
    /**
     * Tepuy BoxText
     * @return {[type]}
     */
    $.fn.tepuyBoxText = function () {
        return this.each(function(){
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
    }

    /**
     * Tepuy ModalWindowContent
     * @return {[type]}
     */
    $.fn.tepuyModalWindowContent = function() {
        return this.each(function() {
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

                if (properties.width.indexOf('%') >= 0) {
                    var window_w = $(window).width();
                    var tmp_w = Number(properties.width.replace('%', ''));
                    if (!isNaN(tmp_w) && tmp_w > 0) {
                        properties.width = tmp_w * window_w / 100;
                    }
                }
            }

            if ($this.attr('data-property-height')) {
                properties.height = $this.attr('data-property-height');

                if (properties.height.indexOf('%') >= 0) {
                    var window_h = $(window).height();
                    var tmp_h = Number(properties.height.replace('%', ''));
                    if (!isNaN(tmp_h) && tmp_h > 0) {
                        properties.height = tmp_h * window_h / 100;
                    }
                }
            }

            if ($this.attr('data-cssclass')) {
                properties.dialogClass = $this.attr('data-cssclass');
            }

            $this.dialog(properties);
        });
    }

    /**
     * Tepuy Floating Window Content
     * @return {[type]}
     */
    $.fn.tepuyFloatingWindowContent = function() {
        return this.each(function() {
            var $this = $(this);

            var style = '';
            if ($this.attr('data-property-width')) {
                style += 'width:' + $this.attr('data-property-width') + ';';
            }

            if ($this.attr('data-property-height')) {
                style += 'height:' + $this.attr('data-property-height') + ';';
            }

            var $close = $('<div class="close button">X</div>');
            $close.on('click', function(event) {
                $this.hide({ effect: 'slide', direction: 'down' });
                event.stopPropagation();
            });

            if (style != '') {
                $this.attr('style', style);
            }

            $this.append($close);
            $this.hide();
        });
    }

    $.fn.tepuyMouseOverOne = function() {
        return this.each(function(){
            var $this = $(this);

            $this.find('[data-ref]').on('mouseover', function() {
                $this.find('[data-ref]').each(function() {
                    $($(this).attr('data-ref')).hide();
                });

                $this.parent().find('> .button').removeClass('current');

                var selector = $(this).attr('data-ref');
                $(selector).show();
                $(this).addClass('current');
            });
        });
    }

    /**
     * Tepuy InstructionBox
     * @return {[type]}
     */
    $.fn.tepuyInstructionBox = function() {
        return this.each(function(){
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
    }

    /**
     * Tepuy Image Animation
     * @return {[type]}
     */
    $.fn.tepuyAnimation = function() {
        return this.each(function () {
            var $this = $(this);
            var playAnimation = $this.is('play-animation');
            var instruction = dhbgApp.s(playAnimation ? 'play_animation' : 'repeat_animation');
            var src_attr = $this.attr(playAnimation ? 'src' : 'data-animation');
            $this.data('original_src', src_attr);
            var $label = $('<div class="label instruction">' + instruction + '</div>');
            $this.wrapAll('<div class="animation_image"></div>');
            if (playAnimation) $this.parent().addClass('play_animation');
            $this.parent().append($label);

            $label.on('click', function () {
                f_reloadanimation($this);
            });

            $this.on('click', function () {
                f_reloadanimation($this);
            });

        });
    }

    /**
     * Tepuy View First
     * @return {[type]}
     */
    $.fn.tepuyViewFirst = function() {
        return this.each(function () {
            var $this = $(this);

            var $mask = $('<div class="mask"></div>');
            $mask.append($this.find('.view-content'));

            $this.append($mask);
        });
    }

    /**
     * Tepuy Inner Menu
     * @return {[type]}
     */
    $.fn.tepuyInnerMenu = function() {
        return this.each(function(){
            var $this = $(this);
            $this.addClass('inner-menu');
            var type = 'horizontal';
            var items_class = 'chalkboard_items';
            var content_class = 'chalkboard_content';
            if ($this.is('.vertical-menu')) {
                type = 'vertical';
                items_class = 'chalkboard_vertical_items';
                content_class = 'chalkboard_vertical_content';
            }
            else if ($this.is('.vertical-menu-both-sides')) {
                type = 'sidebyside';
                items_class = 'chalkboard_both_items_left';
                content_class = 'chalkboard_both_content';
            }
            var $chalkboard_items = $('<div class="board"></div>').addClass(items_class);
            var $chalkboard_items_right = undefined;
            var $chalkboard_content = $('<div class="elements inner-menu-content"></div>').addClass(content_class);

            var $items = $this.find(type == 'sidebyside' ? 'left>dl' : '>dl');
            $items.each(function() {
                processMenuEntry(this, $chalkboard_items, $chalkboard_content, type);
            });

            if (type == 'sidebyside') {
                $chalkboard_items_right = $('<div class="board chalkboard_both_items_right"></div>');
                var $items = $this.find('right>dl');
                $items.each(function() {
                    processMenuEntry(this, $chalkboard_items_right, $chalkboard_content, type);
                });
            }

            $chalkboard_content.find('> .element').hide();
            $chalkboard_items.find(':first-child').addClass(type == 'sidebyside' ? 'chalkboard_both_current' : 'current');
            $chalkboard_items.find(':last-child').addClass('last-item');
            $chalkboard_content.find('> .element:first-child').show();
            $this.empty();

            $this.append($chalkboard_items);
            if (type == 'horizontal') $this.append('<div class="clear"></div>');
            if ($chalkboard_items_right) $this.append($chalkboard_items_right);
            $this.append($chalkboard_content);
            $this.append('<div class="clear"></div>');

        });
    }

    /**
     * Tepuy Pagination
     * @return {[type]}
     */
    $.fn.tepuyPagination = function() {
        return this.each(function() {
            var $this = $(this);
            var $items = $this.find('>li');
            var $list = $('<ul class="layers"></ul>');
            var total_pages = $items.length;

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

                    var prevpage = $items.get(new_item_index);
                    showPage(prevpage, false);
                    $items.data('current', new_item_index);
                    $position_index_label.text(dhbgApp.s('pagination_label', { 'a': (new_item_index + 1), 'b': $items.length } ));

                    if (new_item_index < $items.length) {
                        $next_button.css('visibility', 'visible');
                    }

                    if (new_item_index == 0) {
                        $back_button.css('visibility', 'hidden');
                    }
                    $this.trigger('jpit:pagination:changed', prevpage);
                });

                $list_buttons.append($back_button);
                // End Back button.

                if (orientation == 'vertical' || orientation == 'sides') {
                    $position_index_label = $('<div class="position">' + dhbgApp.s('pagination_label', { 'a': 1, 'b': $items.length } )  + '</div>');
                    $this.append($position_index_label);
                }
                else {
                    $position_index_label = $('<li class="position">' + dhbgApp.s('pagination_label', { 'a': 1, 'b': $items.length } )  + '</li>');
                    $list_buttons.append($position_index_label);
                }

                // Next button event.
                $next_button.on('click', function() {
                    var $self = $(this);
                    if ($self.has('.button.next[disabled]').length > 0) {
                        return;
                    }

                    if (dhbgApp.DB.loadSound) {
                        dhbgApp.DB.loadSound.pause();
                        dhbgApp.DB.loadSound.currentTime = 0;
                    }

                    var new_item_index = $items.data('current') + 1;
                    if (new_item_index >= $items.length) {
                        return;
                    }

                    var nextpage = $items.get(new_item_index);
                    showPage(nextpage, true);
                    $items.data('current', new_item_index);
                    $position_index_label.text(dhbgApp.s('pagination_label', { 'a': (new_item_index + 1), 'b': $items.length } ));

                    if (new_item_index == $items.length - 1) {
                        $next_button.css('visibility', 'hidden');
                    }

                    if (new_item_index > 0) {
                        $back_button.css('visibility', 'visible');
                    }
                    $this.trigger('jpit:pagination:changed', nextpage);
                });

                $list_buttons.append($next_button);
                // End Next button.
            }
            $this.data('pagination', {
                moveNext: function () {
                    $next_button.find('.button.next').removeAttr('disabled');
                    $next_button.trigger('click');
                },
                moveBack: function () { $back_button.trigger('click'); },
                setButtonEnable: function (button, enabled) {
                    if (enabled) {
                        $this.find('.button.'+button).removeAttr('disabled');
                    }
                    else {
                        $this.find('.button.'+button).attr('disabled', true);
                    }
                },
                isLastPage: function () {
                    return ($items.data('current') + 1) == total_pages;
                }
            });
            $this.append($list);
            $this.append($list_buttons);
            $this.append('<div class="clear"></div>');
            var animation = $this.attr('data-animation') || 'none';
            var duration = $this.attr('data-animation-duration') || 400;
            var ontransitionhidden = ".label_current," + $this.attr('data-pagination-transition-hidden') || '';

            function showPage(page, isnext) {
                var $page = $(page),
                    $prev = isnext ? $page.prev() : $page.next();

                if (animation == 'none') {
                    $prev.hide();
                    $page.show();
                    return;
                }

                slide($page, $prev, isnext ? 'right' : 'left');
            }

            function slide($page, $prev, dir, duration) {
                $prev.hide();
                var $hidden = $page.find(ontransitionhidden).hide();
                $page.show("slide", { direction: dir }, duration, function () {
                    //$prev.hide().css('visibility', 'hidden');
                    $hidden.show();
                });
            }
        });
    }

    /**
     * Tepuy Tooltip
     * @return {[type]}
     */
    $.fn.tepuyTooltip = function() {
        return this.each(function() {
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
    }

    /**
     * Tepuy Interactive Video
     * @return {[type]}
     */
    $.fn.tepuyInteractiveVideo = function() {
        return this.each(function() {
            $(this).data('ivideo', new IVideo(this));
        });
    }

    /**
     * jpit activity quiz
     * @return {[type]}
     */
    $.fn.jpitActivityQuiz = function() {
        return this.each(function() {
            var $this = $(this);
            dhbgApp.actions.loadActivity($this, 'quiz', dhbgApp.actions.activityQuiz);
        });
    }

})(jQuery)
