/**
 * Namespace jpit.activities.wordpuzzle
 *
 * This namespace contain all related to word puzzle game*/
jpit.activities.wordpuzzle = jpit.activities.registerType('jpit.activities.wordpuzzle');


/**
 * Namespace jpit.activities.quiz.instances
 *
 * This array store all quiz instances
 */
jpit.activities.wordpuzzle.instances = [];


jpit.activities.wordpuzzle.toString = function(){    
    return 'jpit.activities.wordpuzzle';
}; 

/**
 * Class globals
 * Namespace jpit.activities.wordpuzzle
 *
 * This class persists globally some variables used in the game
 */
jpit.activities.wordpuzzle.globals = { 
    "actualPuzzle" : 0, 
    "activeSelection" : false, 
    "activeCSSClass" : '', 
    "actualLine" : null,
    "overSelection" : false
};

/**
 * Class directions
 * Namespace jpit.activities.wordpuzzle
 *
 * List of posible directions of the word in the board
 */
jpit.activities.wordpuzzle.directions = { 
    "tb" : 1, //top - bottom
    "bt" : 2, //bottom - top
    "lr" : 3, //left - right
    "rl" : 4, //right - left
    "tblr" : 5, //diagonal: top - bottom, left - right
    "tbrl" : 6, //diagonal: top - bottom, right - left
    "btlr" : 7, //diagonal: bottom - top, left - right
    "btrl" : 8 //diagonal: bottom - top, right - left
};

/**
 * Class game
 * Namespace jpit.activities.wordpuzzle
 *
 * This class have control to the board
 */
jpit.activities.wordpuzzle.game = function (letters, container, words, containerWord, keysensitive) {

    var $container, $container_word;

    if (typeof container == 'object') {
        $container = container;
    }
    else {
        $container = $(container);
    }
    
    if (typeof containerWord == 'object') {
        $container_word = containerWord;
    }
    else if (typeof containerWord == 'string') {
        $container_word = $(containerWord);
    }
    else {
        $container_word = containerWord;
    }

    var obj = {
        "lines" : [],
        "id" : 0,
        "container" : $container,
        "words" : words,
        "containerWord" : $container_word,
        "keysensitive" : keysensitive,
        "getLocalId" : function () {
            return "jpit_activities_wordpuzzle_" + this.id;
        },

        //letters are separate with comma ",", lines are separate with pipeline "|"
        "loadData" : function (letters) {

            var lines = letters.split('|');
            var fields;
            
            for (var i = 0; i < lines.length; i++) {
                this.lines[i] = new Array();

                fields = lines[i].split(',');
                for (var j = 0; j < fields.length; j++) {
                    this.lines[i][j] = fields[j];
                }
            }
        },
        
        "printBoard" : function () {
            var node = this.getNodeBoard();

            $container.append(node);
        },
        
        "getNodeBoard" : function () {
            var node = $('<div></div>').addClass('jpit_activity_wordpuzzle_board').attr('id', this.getLocalId() + '_board');
            node.mouseup(this.getAnonymousFunction('endSelection'));

            var line, letter;
            for(var i = 0; i < this.lines.length; i++) {
                line = $('<div></div>').addClass('jpit_activity_wordpuzzle_line').attr('id', this.getLocalId() + "_line_" + i);
                node.append(line);

                for (var j = 0; j < this.lines[i].length; j++) {
                    cell = $('<button class="jpit_activity_wordpuzzle_cell" ></button>').attr('id', this.getLocalId() + "_line_" + i + "_cell_" + j);
                    cell.attr('axisx', j);
                    cell.attr('axisy', i);
                    cell.attr('letter', this.lines[i][j]);
                    cell.html(this.lines[i][j]);
                    line.append(cell);
                }
            }
            
            return node;
        },

        "run" : function () {
            var cells = $('#' + "jpit_activities_wordpuzzle_" + this.id + '_board .jpit_activity_wordpuzzle_cell');
            cells.mousedown(this.getAnonymousFunction('initSelection'));
            cells.mouseup(this.getAnonymousFunction('endSelection'));
            cells.mouseover(this.getAnonymousFunction('addSelection'));
        },
        
        "stop" : function () {
            jpit.activities.wordpuzzle.globals.actualLine = null;
            var cells = $('#' + "jpit_activities_wordpuzzle_" + this.id + '_board .jpit_activity_wordpuzzle_cell');
            cells.unbind('mousedown');
            cells.unbind('mouseup');
            cells.unbind('mouseover');
        },
        
        "initTerm" : function (cssClass, indexWord, successFunction) {
            if (this.words.length <= indexWord) {
                alert('This word isn\'t in the words list');
                return false;
            }
            
            var word = this.words[indexWord];
            if (word.selected) {
                this.stop();
                return;
            }
            
            if (!jpit.activities.wordpuzzle.globals.actualLine) {
                this.run();
            }

            var word = this.words.length > indexWord ? this.words[indexWord] : new jpit.activities.wordpuzzle.word('');

            jpit.activities.wordpuzzle.globals.actualLine = {
                "puzzle" : this, 
                "cssClass" : cssClass, 
                "word" : word, 
                "initX" : null, 
                "initY" : null, 
                "endX" : null, 
                "endY" : null, 
                "diagonal" : false, 
                "indexWord" : indexWord, 
                "successFunction" : successFunction
            };

            //Clear cell with background
            this.getAnonymousFunction('clearSelection')();
        },
        
        "getTotalResult" : function() {
            var count = 0;
            for (var i = 0; i < this.words.length; i++) {
                if (this.words[i].selected) {
                    count++;
                }
            }
            
            return count;
        },
        
        "getAnonymousFunction" : function(name) {
            switch (name) {
                case 'endSelection':
                    return (function() {
                        jpit.activities.wordpuzzle.globals.activeSelection = false;
                        jpit.activities.wordpuzzle.globals.overSelection = false;

                        if (!jpit.activities.wordpuzzle.globals.actualLine) {
                            return;
                        }

                        var selected_cells = jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('countSelectedCells')();

                        if (selected_cells == 1) {
                            jpit.activities.wordpuzzle.globals.activeSelection = true;
                            return;
                        }
                        else {

                            var word = jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('getSelectedWord')();

                            if (word != '') {

                                if(!obj.keysensitive){
                                    if (jpit.activities.wordpuzzle.globals.actualLine.word.term.toLowerCase() !== word.toLowerCase()) {
                                        //Reverse the word
                                        if (jpit.activities.wordpuzzle.globals.actualLine.word.reverse().toLowerCase() !== word.toLowerCase()) {
                                            return;
                                        }
                                    }
                                }
                                else{
                                    if (jpit.activities.wordpuzzle.globals.actualLine.word.term !== word) {
                                        //Reverse the word
                                        if (jpit.activities.wordpuzzle.globals.actualLine.word.reverse() !== word) {
                                            return;
                                        }
                                    }
                                }


                                jpit.activities.wordpuzzle.globals.actualLine.word.selected = true;
                                $('.jpit_activity_wordpuzzle_cell_selected').addClass(jpit.activities.wordpuzzle.globals.actualLine.cssClass);
                                $('.jpit_activity_wordpuzzle_cell_selected').removeClass('jpit_activity_wordpuzzle_cell_selected');
                                jpit.activities.wordpuzzle.globals.actualLine.successFunction();
                                jpit.activities.wordpuzzle.globals.actualLine.puzzle.stop();
                            }
                        }
                    });
                    break;
                case 'initSelection':
                    return (function() {
                        var it = $(this);
                        var asNew = true;
                        jpit.activities.wordpuzzle.globals.overSelection = true;
                        jpit.activities.wordpuzzle.globals.actualLine.diagonal = false;
                        if (jpit.activities.wordpuzzle.globals.activeSelection) {
                            asNew = jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('addSelection')(null, it);
                        }

                        if (!asNew) {
                            return;
                        }
                        else {
                            jpit.activities.wordpuzzle.globals.actualLine.initX = parseInt(it.attr('axisx'));
                            jpit.activities.wordpuzzle.globals.actualLine.initY = parseInt(it.attr('axisy'));
                            jpit.activities.wordpuzzle.globals.actualLine.endX = parseInt(it.attr('axisx'));
                            jpit.activities.wordpuzzle.globals.actualLine.endY = parseInt(it.attr('axisy'));
                            jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('clearSelection')();
                            jpit.activities.wordpuzzle.globals.activeSelection = true;
                            it.addClass('jpit_activity_wordpuzzle_cell_selected');
                            jpit.activities.wordpuzzle.globals.actualLine.diagonal = false;
                            jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('printContainerWord')();
                        }
                    });
                    break;
                case 'addSelection':
                    return (function(obj, fromOther) {
                        if (jpit.activities.wordpuzzle.globals.activeSelection && jpit.activities.wordpuzzle.globals.overSelection) {
                            var it = obj ? $(this) : fromOther;
                            var movx = it.attr('axisx') - jpit.activities.wordpuzzle.globals.actualLine.initX;
                            var movy = it.attr('axisy') - jpit.activities.wordpuzzle.globals.actualLine.initY;

                            /*if ((movx == 0 && Math.abs(movy) >= 1 || Math.abs(movx) >= 1 && movy == 0) && !jpit.activities.wordpuzzle.globals.actualLine.diagonal) {
                                jpit.activities.wordpuzzle.globals.actualLine.endX = parseInt(it.attr('axisx'));
                                jpit.activities.wordpuzzle.globals.actualLine.endY = parseInt(it.attr('axisy'));

                                var x, y, signx, signy, inX, to;
                                signx = movx > 0 ? 1 : -1;
                                signy = movy > 0 ? 1 : -1;
                                inX = movx == 0 ? false : true;
                                to = inX ? Math.abs(movx) : Math.abs(movy);

                                for (var i = 0; i <= to; i++) {
                                    x = inX ? jpit.activities.wordpuzzle.globals.actualLine.initX + (i * signx) : jpit.activities.wordpuzzle.globals.actualLine.initX;
                                    y = inX ? jpit.activities.wordpuzzle.globals.actualLine.initY : jpit.activities.wordpuzzle.globals.actualLine.initY + (i * signy);

                                    $('#' + jpit.activities.wordpuzzle.globals.actualLine.puzzle.getLocalId() + '_line_' + y + '_cell_' + x).addClass('jpit_activity_wordpuzzle_cell_selected');
                                }
                            }
                            else if (Math.abs(movx) == Math.abs(movy) && (movx !== 0 || movy !== 0)) {
                                jpit.activities.wordpuzzle.globals.actualLine.endX = parseInt(it.attr('axisx'));
                                jpit.activities.wordpuzzle.globals.actualLine.endY = parseInt(it.attr('axisy'));
                                jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('clearSelection')();
                                var x, y, signx, signy;
                                signx = movx > 0 ? 1 : -1;
                                signy = movy > 0 ? 1 : -1;
                                for (var i = 0; i <= Math.abs(movx); i++) {
                                    x = jpit.activities.wordpuzzle.globals.actualLine.initX + (i * signx);
                                    y = jpit.activities.wordpuzzle.globals.actualLine.initY + (i * signy);
                                    $('#' + jpit.activities.wordpuzzle.globals.actualLine.puzzle.getLocalId() + '_line_' + y + '_cell_' + x).addClass('jpit_activity_wordpuzzle_cell_selected');
                                }
                                jpit.activities.wordpuzzle.globals.actualLine.diagonal = true;
                            }*/
                            if (((movx == 0 && Math.abs(movy) >= 1 || Math.abs(movx) >= 1 && movy == 0)) ||
                                    (Math.abs(movx) == Math.abs(movy) && (movx !== 0 || movy !== 0))) {
                                jpit.activities.wordpuzzle.globals.actualLine.endX = parseInt(it.attr('axisx'));
                                jpit.activities.wordpuzzle.globals.actualLine.endY = parseInt(it.attr('axisy'));
                                jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('clearSelection')();
                                var x, y, signx, signy;
                                signx = movx > 0 ? 1 : -1;
                                signy = movy > 0 ? 1 : -1;
                                var mov = movx == 0 ? movy : movx;
                                for (var i = 0; i <= Math.abs(mov); i++) {
                                    if (movx == 0) {
                                        x = jpit.activities.wordpuzzle.globals.actualLine.initX;
                                        y = jpit.activities.wordpuzzle.globals.actualLine.initY + (i * signy);
                                    }
                                    else if (movy == 0) {
                                        x = jpit.activities.wordpuzzle.globals.actualLine.initX + (i * signx);
                                        y = jpit.activities.wordpuzzle.globals.actualLine.initY;
                                    }
                                    else {
                                        x = jpit.activities.wordpuzzle.globals.actualLine.initX + (i * signx);
                                        y = jpit.activities.wordpuzzle.globals.actualLine.initY + (i * signy);
                                    }

                                    $('#' + jpit.activities.wordpuzzle.globals.actualLine.puzzle.getLocalId() + '_line_' + y + '_cell_' + x).addClass('jpit_activity_wordpuzzle_cell_selected');
                                }
                                jpit.activities.wordpuzzle.globals.actualLine.diagonal = true;
                            }
                            else if (jpit.activities.wordpuzzle.globals.actualLine.diagonal) {
                            //continue
                            }
                            else {
                                jpit.activities.wordpuzzle.globals.activeSelection = false;
                                jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('clearSelection')();
                                return true;
                            }
                            
                            jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('printContainerWord')();
                            
                        }
                    });
                    break;
                case 'clearSelection':
                    return (function() {
                        $('#' + jpit.activities.wordpuzzle.globals.actualLine.puzzle.getLocalId() + '_board .jpit_activity_wordpuzzle_cell').removeClass('jpit_activity_wordpuzzle_cell_selected');
                    });
                    break;
                case 'printContainerWord':
                    if (this.containerWord != null) {
                        return (function() {
                            
                            var word = jpit.activities.wordpuzzle.globals.actualLine.puzzle.getAnonymousFunction('getSelectedWord')();
                            
                            jpit.activities.wordpuzzle.globals.actualLine.puzzle.containerWord.html(word);
                        });
                    }
                    else {
                        return (function () {});
                    }
                    break;
                case 'getSelectedWord':
                    return (function () {
                        var x1, x2, y1, y2;
                        x1 = jpit.activities.wordpuzzle.globals.actualLine.initX;
                        y1 = jpit.activities.wordpuzzle.globals.actualLine.initY;
                        x2 = jpit.activities.wordpuzzle.globals.actualLine.endX;
                        y2 = jpit.activities.wordpuzzle.globals.actualLine.endY;
                        
                        var word = '';
                        var x, y, signx, signy;
                        signx = x1 - x2 < 0 ? 1 : -1;
                        signy = y1 - y2 < 0 ? 1 : -1;

                        if (x1 == x2) {
                            for (var j = 0; j <= Math.abs(y1 - y2); j++) {
                                word += jpit.activities.wordpuzzle.globals.actualLine.puzzle.lines[y1 + (j * signy)][x1];
                            }
                        }
                        else if (y1 == y2) {
                            for (var j = 0; j <= Math.abs(x1 - x2); j++) {
                                word += jpit.activities.wordpuzzle.globals.actualLine.puzzle.lines[y1][x1 + (j * signx)];
                            }
                        }
                        else {
                            for (var j = 0; j <= Math.abs(x1 - x2); j++) {
                                word += jpit.activities.wordpuzzle.globals.actualLine.puzzle.lines[y1 + (j * signy)][x1 + (j * signx)];
                            }
                        }
                        
                        return word;
                    });
                case 'countSelectedCells':
                    return (function () {
                        return $('#' + jpit.activities.wordpuzzle.globals.actualLine.puzzle.getLocalId() + '_board .jpit_activity_wordpuzzle_cell_selected').length;
                    });
            }
        }
    };
    
    jpit.activities.wordpuzzle.globals.actualPuzzle++;
    
    obj.id = jpit.activities.wordpuzzle.globals.actualPuzzle;
    
    if (keysensitive != null && typeof(keysensitive) != 'undefined') {
        obj.keysensitive = keysensitive;
    }
    
    obj.loadData(letters);
    obj.printBoard();
    
    jpit.activities.wordpuzzle.instances.push(obj);
    
    return obj;

};


/**
 * Class word
 * Namespace jpit.activities.wordpuzzle
 * 
 * This class is used to manage a word in the board
 */
jpit.activities.wordpuzzle.word = function (word, direction) {
    
    if (direction == null || typeof(direction) == 'undefined') {
        direction = jpit.activities.wordpuzzle.directions.lr;
    }

    var obj = {
        "term" : word,
        "direction" : direction,
        "selected" : false,
        
        "reverse" : function () {
            var splitText = this.term.split("");
            var reverseText = splitText.reverse();
            return reverseText.join("");
        }
    };
    
    return obj;
};