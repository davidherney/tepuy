// This file is part of Tepuy template.
//
// Tepuy is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Tepuy is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Tepuy.  If not, see <http://www.gnu.org/licenses/>.

(function($){
    "use strict";

    var M = null;
    var siteurl = null;
    var defaultsource = '';
    var globalstyles = [];
    var cyclelearning = {
        'grassping': [],
        'transforming': []
    };

    cyclelearning.grassping['input'] = false;
    cyclelearning.grassping['perception'] = false;
    cyclelearning.transforming['processing'] = false;
    cyclelearning.transforming['understanding'] = false;

    if (parent && parent.window.M) {
        M = parent.window.M;

        if (parent.window.scormplayerdata) {
            siteurl = M.cfg.wwwroot;
            defaultsource = siteurl + '/user/profile/field/learningstyles/get.php';
        }
    }

    $.learningstyles = {
        'options': {
            'source': defaultsource,
        },

        'get': function(callback, newoptions) {
            var options = this.options = $.extend(this.options, newoptions);

            if (options.source == '') {
                return null;
            }

            if (globalstyles[options.source]) {
                return globalstyles[options.source];
            }

            $.get(options.source, function(data) {
                var response = null;

                if (data) {

                    if (typeof data == 'object'
                        && data.input
                        && data.perception
                        && data.processing
                        && data.understanding
                    ) {

                        if (data.input < 0) {
                            cyclelearning.grassping['input'] = 'visual';
                        } else {
                            cyclelearning.grassping['input'] = 'verbal';
                        }

                        if (data.perception < 0) {
                            cyclelearning.grassping['perception'] = 'sensing';
                        } else {
                            cyclelearning.grassping['perception'] = 'intuitive';
                        }

                        if (data.processing < 0) {
                            cyclelearning.transforming['processing'] = 'active';
                        } else {
                            cyclelearning.transforming['processing'] = 'reflective';
                        }

                        if (data.understanding < 0) {
                            cyclelearning.transforming['understanding'] = 'sequential';
                        } else {
                            cyclelearning.transforming['understanding'] = 'global';
                        }

                        globalstyles[options.source] = {
                            'styles': data,
                            'cycles': cyclelearning
                        };

                        response = globalstyles[options.source];
                    }
                }

                if (callback && typeof callback == 'function') {
                    callback(response);
                }
            });
        },

    };

})(jQuery);
