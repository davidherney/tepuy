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

var M = null;
var courseurl = null;
if (parent && parent.window.M) {
    M = parent.window.M;

    if (parent.window.scormplayerdata) {
        courseurl = M.cfg.wwwroot + '/course/view.php?id=' + parent.window.scormplayerdata.courseid
    }
}

var num = 1000 * Math.random();
var unique_id = 'window_scorm_' + Math.round(num);
var w_options = 'location=0, menubar=0, resizable=1, scrollbars=1, status=0, titlebar=0, toolbar=0';

var $css_to_fullpage = $("<style type='text/css'> .scorm_full_page { overflow: hidden; } .scorm_full_page #scorm_object { position: fixed; top: 10px; left: 10px; right: 10px; bottom: 0; z-index: 4030; width: calc(100% - 20px) !important; height: calc(100% - 10px) !important; border: 3px solid #333; } </style>");

dhbgApp.start = function() {

    var autoload = $('body').attr('data-autoload') && $('body').attr('data-autoload') == 'true' ? true : false;
    var width = $('body').attr('data-window-width') ? Number($('body').attr('data-window-width')) : 970;
    var height = $('body').attr('data-window-height') ? Number($('body').attr('data-window-height')) : 630;

    if (width == 100 && height == 100) {
        width = window.screen.availWidth;
        height = window.screen.availHeight;
    }
    w_options = "width=" + width + ", height=" + height + ", " + w_options;

    if (autoload) {
        if (dhbgApp.WINDOWS_MODE == 'popup') {
            var window_scorm = window.open('content.html', unique_id, w_options);
            scormredirect(window_scorm);
        }
        else if (dhbgApp.WINDOWS_MODE == 'modal') {
            var $scorm_frame = $('body', window.parent.document);

            $scorm_frame.prepend($css_to_fullpage);

            $scorm_frame.addClass('scorm_full_page');
            location.href = 'content.html';
        }
        else {
            location.href = 'content.html';
        }
    }
    else {
        add_load_button (unique_id);
    }
};

var scormredirect = function (window_scorm) {

    $(window_scorm).on('load', function() {

        // Display a message to the user if the window is closed.
        if (courseurl) {
            $('#play_scorm').html('<p class="ui-state-highlight "><a href="' + courseurl + '" target="_top">' + dhbgApp.s('opened_return') + '</a></p>');
        }
        else {
            $('#play_scorm').html('<p class="ui-state-highlight ">' + dhbgApp.s('opened') + '</p>');
        }
    });

    $(window_scorm).on('unload', function() {
        // Onunload is called multiple times in the SCORM window - we only want to handle when it is actually closed.
        setTimeout(function() {
            if (window_scorm.closed) {
                // Redirect the parent window to the course homepage.
                if (courseurl) {
                    parent.window.location = courseurl;
                }
                else {
                    $('#play_scorm').html('<p class="ui-state-highlight ">' + dhbgApp.s('ended_not_close') + '</p>');
                    add_load_button();
                }
            }
        }, 800);
    });

    // Check to make sure pop-up has been launched - if not display a warning,
    // this shouldn't happen as the pop-up here is launched on user action but good to make sure.
    setTimeout(function() {
        if (!window_scorm) {
            $('#play_scorm').html('<p class="ui-state-error">' + dhbgApp.s('popups') + '</p>');
            add_load_button (unique_id);
        }
    }, 800);
}

function add_load_button (unique_id) {
    var $button = $('<button class="general">' + dhbgApp.s('click_to_open') + '</button>');

    if (dhbgApp.WINDOWS_MODE == 'popup') {
        $button.on('click', function() {
            var new_window_scorm = window.open('content.html', unique_id, w_options);
            scormredirect(new_window_scorm);
        });
    }
    else if (dhbgApp.WINDOWS_MODE == 'modal') {
        $button.on('click', function() {
            $('#play_scorm').html('<p class="ui-state-highlight"><img src="img/loading.gif" alt="' + dhbgApp.s('loading') + '" /> ' + dhbgApp.s('loading') + '</p>');
            var $scorm_frame = $('body', window.parent.document);

            $scorm_frame.prepend($css_to_fullpage);

            $scorm_frame.addClass('scorm_full_page');
            location.href = 'content.html';
        });
    }
    else {
        $button.on('click', function() {
            location.href = 'content.html';
        });
    }

    $('#play_scorm').append($button);

}
