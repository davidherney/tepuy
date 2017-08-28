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

jpit.resources.movi.movies = {

    'example_moveright': {
        'type': 'move',
        'options' :  { 'left': '100px' },
        'duration' : 700,
        'effect': 'linear',
        'events': {
            'start': function() {
                $('#pag-media-animation1 .btn_example_start').css('visibility', 'hidden');
            }
        },
        'selector': '#pag-media-animation1 .movi_2'
    },

    'example_movedown': {
        'type': 'move',
        'options' :  { 'top': '150px' },
        'duration' : 1000,
        'effect': 'linear',
        'events': { }
    }
};

jpit.resources.movi.movies.actions = {
    'auto_hide': function(movi) {
        movi.element.hide();
    },
    'click_cycle_init': function(movi) {
       movi.element.data('repetitions', 0);
    },
    'example_restart': function(movi) {
       $('#pag-media-animation1 .movi_2').css('left', 'initial');
       $('#pag-media-animation1 .movi_3').hide();
       $('#pag-media-animation1 .movi_4').css('top', 'initial');
       $('#pag-media-animation1 .btn_example_restart').hide();
       $('#pag-media-animation1 .btn_example_start').css('visibility', 'visible');
    },
    'show_restart': function() {
        $('#pag-media-animation1 .btn_example_restart').show();
    }
};
