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

dhbgApp.STARTED = false;

dhbgApp.DB = {};
dhbgApp.DB.currentPage = -1;
dhbgApp.DB.currentSubPage = -1;
dhbgApp.DB.changePostPageActions = [];
dhbgApp.DB.loadSound = null;
dhbgApp.DB.loadSound = document.createElement('audio');
dhbgApp.DB.loadSound.setAttribute('autoplay', 'autoplay');
dhbgApp.DB.totalPages = 0;

dhbgApp.actions = {};
dhbgApp.actions.beforeChangePage = [];
dhbgApp.actions.afterChangePage = [];

dhbgApp.defaultValues = {};
dhbgApp.defaultValues.buttonover = function () { $(this).addClass('active'); };
dhbgApp.defaultValues.buttonout = function () { $(this).removeClass('active'); };

dhbgApp.pages = [];

dhbgApp.start = function() {

    var style_path = "css/styles.css";
    var custom_path = "css/custom.css";

    dhbgApp.documentHeight = $(document).height();
    dhbgApp.documentWidth = $(document).width();

    if ($(window).width() <= dhbgApp.MOBILE_WIDTH) {

        dhbgApp.MODE = 'mobile';

        if (dhbgApp.DEBUG_MODE) {
            style_path = "css/mobile.css";
            custom_path = "css/custommobile.css";
        }
        else {
            style_path = "css/mobile.min.css";
        }
    }
    else {

        if (dhbgApp.DEBUG_MODE) {
            style_path = "css/styles.css";
            custom_path = "css/custom.css";
        }
        else {
            style_path = "css/styles.min.css";
        }
    }

    if (dhbgApp.DEBUG_MODE) {
        var styles = document.createElement("link");
        styles.href = style_path;
        styles.rel = "stylesheet";
        styles.type = "text/css";
        document.body.appendChild(styles);

        var custom = document.createElement("link");
        custom.href = custom_path;
        custom.rel = "stylesheet";
        custom.type = "text/css";
        document.body.appendChild(custom);

        var start_app = function () {
            if (dhbgApp.MODE == 'mobile') {
                dhbgApp.mobile.start();
            }
            else {
                dhbgApp.standard.start();
            }
        };

        var styles_loaded = false;
        var custom_loaded = false;

        styles.onload = function () {
            styles_loaded = true;

            if (custom_loaded && !dhbgApp.STARTED) {
                start_app();
            }
        }

        custom.onload = function () {
            custom_loaded = true;

            if (styles_loaded && !dhbgApp.STARTED) {
                start_app();
            }
        }

    }
    else {
        var style_min = document.createElement("link");
        style_min.href = style_path;
        style_min.rel = "stylesheet";
        style_min.type = "text/css";
        document.body.appendChild(style_min);

        style_min.onload = function () {
            if (dhbgApp.MODE == 'mobile') {
                dhbgApp.mobile.start();
            }
            else {
                dhbgApp.standard.start();
            }
        }
    }

};
