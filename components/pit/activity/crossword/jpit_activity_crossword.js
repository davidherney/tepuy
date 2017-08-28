/**
 * Namespace jpit.activities.crossword
 *
 * This namespace contain all related to cross word game
 */
jpit.activities.crossword = jpit.activities.registerType( 'jpit.activities.crossword');

/**
 * Namespace jpit.activities.crossword.instances
 *
 * This array store all crossword instances
 */
jpit.activities.crossword.instances = [];



jpit.activities.crossword.toString = function(){    
    return  'jpit.activities.crossword';
}; 

/**
 * Class directions
 * Namespace jpit.activities.crossword
 *
 * List of posible directions of the word in the board
 */
jpit.activities.crossword.directions = { 
    "tb" : 1, //top - bottom
    "bt" : 2, //bottom - top
    "lr" : 3, //left - right
    "rl" : 4, //right - left

    "isVertical" : function (direction) {
        if (direction <= 2) {
            return true;
        }
        else {
            return false;
        }
    },

    "isHorizontal" : function (direction) {
        if (direction > 2) {
            return true;
        }
        else {
            return false;
        }
    }
};

/**
 * Class globals
 * Namespace jpit.activities.crossword
 *
 * This class persists globally some variables used in the game
 */
jpit.activities.crossword.globals = { 
    "actualPuzzle" : 0,
    "keyDirection" : jpit.activities.crossword.directions.lr,
    "activeCSSClass" : '',
    "actualLine" : null
};

/**
 * Class game
 * Namespace jpit.activities.crossword
 *
 * This class have control to the board
 */
jpit.activities.crossword.game = function (container, words, properties) {

    var $container;

    if (typeof container == 'object') {
        $container = container;
    }
    else {
        $container = $(container);
    }

    var obj = {
        "id" : 0,
        "words" : words,
        "container" : $container,
        "sizeX" : 0,
        "sizeY" : 0,
        "caseSensitive" : false,
        
        "getLocalId" : function () {
            return "jpit_activity_crossword_" + this.id;
        },

        "printBoard" : function () {
            var node = this.getNodeBoard();

            $container.append(node);
        },
        
        "getNodeBoard" : function () {
            var node = $('<div></div>').addClass('jpit_activity_crossword_board').attr('id', this.getLocalId() + '_board');

            var line;
            var cells = new Array();
            var cell;

            for(var i = 0; i < this.sizeY; i++) {
                line = $('<div></div>').addClass('jpit_activity_crossword_line').attr('id', this.getLocalId() + "_line_" + i);
                node.append(line);
                cells[i] = new Array();
                for (var j = 0; j < this.sizeX; j++) {
                    cell = $('<div class="jpit_activity_crossword_cell" ></div>').attr('id', this.getLocalId() + "_line_" + i + "_cell_" + j);
                    cell.attr('axisx', j);
                    cell.attr('axisy', i);
                    line.append(cell);
                    cells[i][j] = cell;
                }
            }

            var control;
            var tabIndex = 1;
            var tabIndexH = 1;
            var tabIndexV = 1;
            var letter;
            
            for (var k = 0; k < this.words.length; k++) {
                cell = cells[this.words[k].y][this.words[k].x];
                cell.html(this.words[k].label);
                cell.addClass('jpit_activity_crossword_label');
                for(var m = 1; m <= this.words[k].term.length; m++) {
                    if (jpit.activities.crossword.directions.isHorizontal(this.words[k].direction)) {
                        cell = cells[this.words[k].y][this.words[k].x + m];
                    }
                    else {
                        cell = cells[this.words[k].y + m][this.words[k].x];
                    }
                    
                    if (cell.html() == '') {
                        control = $('<input disabled="true" type="text" maxlength="1" />');
                        control.attr('tabindex', tabIndex);
                        control.attr('tabindex_h', 0);
                        control.attr('tabindex_v', 0);
                        control.attr('init_word_h', false);
                        control.attr('init_word_v', false);
                    }
                    else {
                        control = $(cell.html());
                    }
                    control.attr('letter', this.words[k].term.substring(m - 1, m));
                    
                    control.keydown(this.getAnonymousFunction('textControlKeyDown'));
                    control.keypress(this.getAnonymousFunction('textControlKeyPress'));
                    control.keyup(this.getAnonymousFunction('textControlKeyUp'));
                    control.focusin(this.getAnonymousFunction('textControlFocusIn'));
                    control.focusout(this.getAnonymousFunction('textControlFocusOut'));
                    control.click(this.getAnonymousFunction('initWriting'));
                    
                    if(this.words[k].term.substring(m - 1, m) == " ") {
                        control.addClass('empty_cell');
                    }
                    else {
                        if (jpit.activities.crossword.directions.isHorizontal(this.words[k].direction)) {
                            control.attr('tabindex_h', tabIndexH);
                            tabIndexH++;
                            if (m == 1) {
                                control.attr('init_word_h', true);
                            }
                        }
                        else {
                            control.attr('tabindex_v', tabIndexV);
                            tabIndexV++;
                            if (m == 1) {
                                control.attr('init_word_v', true);
                            }
                        }
                        tabIndex++;
                    }
                    cell.html(control);
                }
            }
            
            return node;
        },

        "run" : function () {
            $('.jpit_activity_crossword_cell input').attr('disabled', false);
        },
        
        "stop" : function () {
            $('.jpit_activity_crossword_cell input').attr('disabled', "disabled");
        },
        
        "cleanMistakes" : function () {
            var controls = $('.jpit_activity_crossword_cell input');

            var it;
            for (var i = 0; i < controls.length; i++) {
                it = $(controls[i]);
                if (!(
                        (it.attr('letter') == it.val()) || 
                        (!this.caseSensitive && it.attr('letter').toUpperCase() == it.val().toUpperCase())
                     )) {
                    it.val('');
                }
            }
        },

        "highlight" : function (correctCss, mistakeCss) {
            
            $('.jpit_activity_crossword_cell input').each(function() {
                var it = $(this);
                
                if (!it.attr('letter')) {
                    return;
                }
                    
                if ((it.attr('letter') == it.val()) || 
                    (!this.caseSensitive && it.attr('letter').toUpperCase() == it.val().toUpperCase()) ||
                    (it.attr('letter') == ' ' && it.val() == '')
                ) {
                    it.addClass(correctCss);
                }
                else {
                    it.addClass(mistakeCss);
                }
            });
            
            
            /*var controls = $('.jpit_activity_crossword_cell input');
            
            var it;
            for (var i = 0; i < controls.length; i++) {
                it = $(controls[i]);
                
                console.log(it.attr('id') + '---' + it.attr('letter'));
                if ((it.attr('letter') == it.val()) || 
                    (!this.caseSensitive && it.attr('letter') && it.attr('letter').toUpperCase() == it.val().toUpperCase()) ||
                    (it.attr('letter') == ' ' && it.val() == '')
                ) {
                    it.addClass(correctCss);
                }
                else {
                    it.addClass(mistakeCss);
                }
            }*/
        },

        "unHighlight" : function (cssName) {
            $('.jpit_activity_crossword_cell input').removeClass(cssName);
        },

        "getTotalResult" : function() {
            var count = 0;
            var newWord, letter;
            for (var i = 0; i < this.words.length; i++) {
                newWord = '';
                for(var j = 1; j <= this.words[i].term.length; j++) {
                    if (jpit.activities.crossword.directions.isHorizontal(this.words[i].direction)) {
                        letter = $('#' + this.getLocalId() + "_line_" + this.words[i].y + "_cell_" + (this.words[i].x + j) + ' input').val();
                    }
                    else {
                        letter = $('#' + this.getLocalId() + "_line_" + (this.words[i].y + j) + "_cell_" + this.words[i].x + ' input').val();
                    }
                    
                    letter = letter == '' ? ' ' : letter;
                    
                    newWord += letter;
                }

                if (this.words[i].equal(newWord, this.caseSensitive)) {
                    count++;
                }
            }
            
            return count;
        },
        
        "getAnonymousFunction" : function(name) {
            switch (name) {
                case 'textControlKeyDown':
                    return (function(event) {
                        if (event.which == 9) {  // tab
                            return false;
                        }
                    });
                    break;
                case 'textControlKeyPress':
                    return (function(event) {
                    });
                case 'textControlKeyUp':
                    return (function(event) { 
                    
                        if (event.altKey || event.ctrlKey) {
                            return;
                        }
                        if (event.keyCode == '13') {
                            event.preventDefault();
                        }
                       
                        if ((event.which >= 48 && event.which <= 57) || //numbers
                            (event.which >= 97 && event.which <= 122) || //letters - lowercase
                            (event.which >= 65 && event.which <= 90) || //letters - uppercase
                            (event.which == 32)
                            ) {

                            this.value = String.fromCharCode(event.which);
                            
                            jpit.activities.crossword.globalFunctions.nextTextControlFocus(this);
                        }
                        else if (event.key == 'Ñ' || event.key == 'ñ') {

                            this.value = event.key;
                            
                            jpit.activities.crossword.globalFunctions.nextTextControlFocus(this);
                        }
                        else if (!event.shiftKey && (event.which == 9)) {  // tab
                            jpit.activities.crossword.globalFunctions.nextTextControlFocus(this);
                        }
                        else if (event.which == 39) {  // rigth arrow
                            jpit.activities.crossword.globalFunctions.nextTextControlFocus(this, jpit.activities.crossword.directions.lr);
                        }
                        else if (event.which == 40) {  // down arrow
                            jpit.activities.crossword.globalFunctions.nextTextControlFocus(this, jpit.activities.crossword.directions.tb);
                        }
                        else if (event.shiftKey && (event.which == 9)) {  // shift+tab
                            jpit.activities.crossword.globalFunctions.previousTextControlFocus(this);
                        }
                        else if (event.which == 37) {  // left arrow
                            jpit.activities.crossword.globalFunctions.previousTextControlFocus(this, jpit.activities.crossword.directions.lr);
                        }
                        else if (event.which == 38) {  // up arrow
                            jpit.activities.crossword.globalFunctions.previousTextControlFocus(this, jpit.activities.crossword.directions.tb);
                        }
                        else if (event.which == 8) { // backspace
                            var nextCell = jpit.activities.crossword.globalFunctions.previousTextControlFocus(this);
                            if (nextCell) {
                                nextCell.val('');
                            }
                        }
                        else {
                            this.value = '';
                            return false;
                        }
                    });
                    break;
                case 'textControlFocusIn':
                    return (function(event) {
                        $(this).addClass('jpit_selected');
                    });
                    break;
                case 'textControlFocusOut':
                    return (function(event) { 
                        $(this).removeClass('jpit_selected');
                    });
                    break;
                case 'initWriting':
                    return (function () {
                        it = $(this);

                        if (it.attr('tabindex_h') == 0 || it.attr('init_word_v') == 'true') {
                            jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.tb;
                        }
                        else {
                            jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.lr;
                        }
                    });
            }
        }
    };
    
    if (properties != null && typeof(properties) != 'undefined') {
        if (typeof(properties.caseSensitive) != 'undefined' && properties.caseSensitive != null) {
            obj.caseSensitive = properties.caseSensitive;
        }
    }

    //Determine size verticaly and horizontaly
    var inX = 0, inY = 0;

    for (var i = 0; i < words.length; i++) {

        if (jpit.activities.crossword.directions.isHorizontal(words[i].direction)) {
            if (inX <= parseInt(words[i].x) + words[i].term.length) {
                inX = parseInt(words[i].x) + words[i].term.length + 1;
            }
            
            if (inY <= parseInt(words[i].y)) {
                inY = parseInt(words[i].y) + 1;
            }
        }
        else {
            if (inY <= parseInt(words[i].y) + words[i].term.length) {
                inY = parseInt(words[i].y) + words[i].term.length + 1;
            }
            if (inX <= parseInt(words[i].x)) {
                inX = parseInt(words[i].x) + 1;
            }
        }
    }
    
    obj.sizeX = inX;
    obj.sizeY = inY;

    jpit.activities.crossword.globals.actualPuzzle++;
    
    obj.id = jpit.activities.crossword.globals.actualPuzzle;
  
    obj.printBoard();
//    obj.run();
    
    
    jpit.activities.crossword.instances.push(obj);
    return obj;

};

jpit.activities.crossword.globalFunctions = {
    "nextTextControlFocus": function(currentControl, direction) {
        var it = $(currentControl);
        var nextTab = 0, nextCell = null;

        if (typeof(direction) == 'undefined') {
            direction = jpit.activities.crossword.globals.keyDirection;
        }

        if (direction == jpit.activities.crossword.directions.lr) {
            nextTab = parseInt(it.attr('tabindex_h')) + 1;
            if (nextTab > 1) {
                nextCell = $('.jpit_activity_crossword_cell input[tabindex_h="' + nextTab + '"]');
                jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.lr;
            }
        }
        if (direction == jpit.activities.crossword.directions.tb) {
            nextTab = parseInt(it.attr('tabindex_v')) + 1;
            if (nextTab > 1) {
                nextCell = $('.jpit_activity_crossword_cell input[tabindex_v="' + nextTab + '"]');
                jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.tb;
            }
        }
        
        if (nextTab > 0 && nextCell != null && nextCell.length > 0) {
            it.removeClass('jpit_selected');
            nextCell.focus();
            nextCell.addClass('jpit_selected');
            return nextCell;
        }

        return null;
    },

    "previousTextControlFocus": function(currentControl, direction) {
        if (typeof(direction) == 'undefined') {
            direction = jpit.activities.crossword.globals.keyDirection;
        }

        var it = $(currentControl);
        var nextTab = 0, nextCell = null;
        if (direction == jpit.activities.crossword.directions.lr) {
            nextTab = parseInt(it.attr('tabindex_h')) - 1;
            if (nextTab > 0) {
                nextCell = $('.jpit_activity_crossword_cell input[tabindex_h="' + nextTab + '"]');
                jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.lr;
            }
        }
        else if (direction == jpit.activities.crossword.directions.tb) {
            nextTab = parseInt(it.attr('tabindex_v')) - 1;
            if (nextTab > 0) {
                nextCell = $('.jpit_activity_crossword_cell input[tabindex_v="' + nextTab + '"]');
                jpit.activities.crossword.globals.keyDirection = jpit.activities.crossword.directions.tb;
            }
        }
        
        if (nextTab > 0 && nextCell != null && nextCell.length > 0) {
            it.removeClass('jpit_selected');
            nextCell.focus();
            nextCell.addClass('jpit_selected');
            return nextCell;
        }
        
        return null;
    }
}

/**
 * Class word
 * Namespace jpit.activities.crossword
 * 
 * This class is used to manage a word in the board
 */
jpit.activities.crossword.word = function (term, x, y, label, direction) {
    
    if (direction == null || typeof(direction) == 'undefined') {
        direction = jpit.activities.crossword.directions.lr;
    }

    var obj = {
        "term" : term,
        "direction" : direction,
        "label" : label,
        "x" : x,
        "y" : y,
        
        "reverse" : function () {
            var splitText = this.term.split("");
            var reverseText = splitText.reverse();
            return reverseText.join("");
        },
        
        "equal" : function (val, caseSensitive) {
            if (caseSensitive == null || typeof(caseSensitive) == 'undefined') {
                caseSensitive = false;
            }
            
            if (caseSensitive) {
                if (this.term == val) {
                    return true;
                }
            }
            else { 
                if (this.term.toUpperCase() == val.toUpperCase()) {
                    return true;
                }
            }
            return false;
        }
        
    };
    
    return obj;
};