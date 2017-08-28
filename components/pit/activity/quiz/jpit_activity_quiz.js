var JPIT_ACTIVITY_QUIZ_NAMESPACE = 'jpit.activities.quiz';

/**
 * Namespace jpit.activities.quiz
 *
 * This namespace contain all related to quiz activity
 */
jpit.activities.quiz = jpit.activities.registerType(JPIT_ACTIVITY_QUIZ_NAMESPACE);


/**
 * Namespace jpit.activities.quiz.instances
 *
 * This array store all quiz instances
 */
jpit.activities.quiz.instances = [];

/**
 * Class globals
 * Namespace jpit.activities.quiz
 *
 * This class persists globally some variables used in the activity
 */
jpit.activities.quiz.globals = {
    "actualQuiz" : 0,
    "uniqueIdAnswer" : 0
};

jpit.activities.quiz.toString = function(){
    return JPIT_ACTIVITY_QUIZ_NAMESPACE;
}; 

/**
 * Class prefixes
 * Namespace jpit.activities.quiz
 *
 * This class persists globally some variables used in the activity
 */
jpit.activities.quiz.prefixes = {
    "none" : 0,
    "numeric" : 1,
    "letter" : 2,
    "capital" : 3,
    "roman" : 4,
    "getText" : function (type, position) {
        switch (type) {
            case this.numeric:
            case "numeric":
                return position;
            case this.letter:
            case "letter":
                return jpit.activities.quiz.utility.n2l(position);
            case this.capital:
            case "capital":
                return jpit.activities.quiz.utility.n2l(position).toUpperCase();
            case this.roman:
            case "roman":
                return jpit.activities.quiz.utility.rome(position);
            default:
                return '';
        }
    }
};


jpit.activities.quiz.inputypes = {
    "mono" : 0,
    "multi" : 1
};

/**
 * Class utility
 * Namespace jpit.activities.quiz
 *
 * This class contain some utility methods to encapsulate logic
 */
jpit.activities.quiz.utility = {};

/**
 * Class rome
 * Namespace jpit.activities.quiz.utility
 *
 * Convert a number in roman representation
 *
 * taken from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 */
jpit.activities.quiz.utility.rome = function (N){
    var s,b,a,o,t;
    t=N/1e3|0;
    N%=1e3;
    for(s=b='',a=5;N;b++,a^=7)
        for(o=N%a,N=N/a^0;o--;)
            s='IVXLCDM'.charAt(o>2?b+N-(N&=~1)+(o=1):b)+s;
    return Array(t+1).join('M')+s;
};

/**
 * Class n2l
 * Namespace jpit.activities.quiz.utility
 *
 * Convert a number in secuence of letters
 *
 */
jpit.activities.quiz.utility.n2l = function (N){
    //Decrece one to N because the first position is 0 but the first number to recibe is 1
    N--;
    var res = '';
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var strN = N.toString();
    var pos;

    while (N >= 0) {
        if (N >= alphabet.length) {
            pos = parseInt(N / alphabet.length) - 1;
        }
        else {
            pos = N;
        }

        res += alphabet.substr(pos, 1);
        N = N - (alphabet.length * (pos + 1));
    }

    return res;
};

jpit.activities.quiz.utility.randOrder = function(){
    return (Math.round(Math.random())-0.5);
};

/**
 * Class game
 * Namespace jpit.activities.quiz
 *
 * This class have control to the questions list
 */
jpit.activities.quiz.activity = function (container, questions, options) {

    var $container;

    if (typeof container == 'object') {
        $container = container;
    }
    else {
        $container = $(container);
    }

    var obj = {
        "id" : 0,
        "container" : $container,
        "questions" : questions,
        "shuffleQuestions" : false,
        "prefixType" : jpit.activities.quiz.prefixes.none,
        "requiredAll" : false, // If all responses are required before displaying feedbacks.
        "paginationNumber": 0,
        "currentPagination" : 1,
        "textPrevious" : '',
        "textNext" : '',
        "currentPage" : 1,
        "allowBackPagination" : true,
        "finalQuestionList" : null ,
        "paginationTopSolved" : 0,
        "getLocalId" : function () {
            return "jpit_activities_quiz_" + this.id;
        },

        "printBoard" : function () {
            var node = this.getNodeBoard();

            $container.append(node);
            if (obj.paginationNumber > 0) {
                obj.paginateTo(1);
            }
        },

        "getNodeBoard" : function () {
            var node = $('<div></div>').addClass('jpit_activities_quiz_board').attr('id', this.getLocalId() + '_board');
            var quest = $.extend(true, [], this.questions);

            if(this.shuffleQuestions){
                quest.sort(jpit.activities.quiz.utility.randOrder);
            }
            obj.finalQuestionList = quest;
            var prefix;
            for(var i = 0; i < quest.length; i++) {
                prefix = jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1);
                prefix = prefix != null && prefix != '' ? '<label>' + prefix + '</label> ' : '';
                node.append(quest[i].getHtml(prefix).addClass('jpit_activities_quiz_quest'));
            }

            // Paginator section code.
            if (obj.paginationNumber > 0) {

                var pages_length = Math.ceil(this.questions.length / obj.paginationNumber);

                var backPaginator = $('<a class="jpit_activities_quiz_paginator_previous"> '+ obj.textPrevious +'</a>').attr('id',this.getLocalId()+'_previous_paginator').click( function() {
                    if(obj.currentPagination > 1){
                        if(obj.currentPagination == 1) {
                            return false;
                        }
                        obj.currentPagination--;
                        obj.paginateTo(obj.currentPagination);
                        $container.find('.jpit_activities_quiz_paginator_current').text(obj.currentPagination + '/' + pages_length);
                    }
                });

                var nextPaginator = $('<a class="jpit_activities_quiz_paginator_next" > '+ obj.textNext +'</a>').attr('id',this.getLocalId()+'_next_paginator').click( function() {

                    if(obj.currentPagination < pages_length ){
                        var next = pages_length;
                        if(obj.currentPagination == next) {
                            return false;
                        }
                        obj.currentPagination++;
                        obj.paginateTo(obj.currentPagination);
                        $container.find('.jpit_activities_quiz_paginator_current').text(obj.currentPagination + '/' + pages_length);
                    }
                });

                var currentPagination = $('<span class="jpit_activities_quiz_paginator_current">' + obj.currentPagination + '/' + pages_length + '</span>');

                if (pages_length > 1) {
                    var paginatorContainer = $('<div class="jpit_activities_quiz_paginator_container"> </div>');
                    paginatorContainer.append( (!obj.allowBackPagination ? '' : backPaginator) ).append(currentPagination).append(nextPaginator);
                    $container.append(paginatorContainer);
                }

            }
            return node;
        },

        "paginateTo":function(index){

            $container.find('.jpit_activities_quiz_quest').hide().each(function(ind,val){
                var lower = (index * obj.paginationNumber) - obj.paginationNumber;
                var top =  (index * obj.paginationNumber);
                if((ind+1)> lower && (ind+1)<= top) {
                    $(val).show();
                }
            });

            if(index==1){
                $container.find('.jpit_activities_quiz_paginator_previous').addClass('jpit_activities_quiz_paginator_first');
            }
            else {
                $container.find('.jpit_activities_quiz_paginator_first').removeClass('jpit_activities_quiz_paginator_first');
            }
            if(index == Math.ceil( questions.length / obj.paginationNumber) ){
                $container.find('.next_paginator').addClass('jpit_activities_quiz_paginator_last');
            }
            else {
                $container.find('.jpit_activities_quiz_paginator_last').removeClass('jpit_activities_quiz_paginator_last');
            }

            this.currentPage = index;
            return true;
        }
        /*End paginator Code*/
        ,

        "showFeedback" : function () {
            if (this.requiredAll) {
                if (this.countAnswered() < this.countQualifiables()) {
                    return false;
                }
            }

            for(var i = 0; i < this.questions.length; i++) {
                if( this.questions[i].isQualifiable()){
                    this.questions[i].showFeedback();
                }
            }

            return true;
        },
        "getNumberPages" : function(){
            return  Math.ceil( obj.questions.length / obj.paginationNumber);
        },
        "showPartialFeedback" : function (index) {
            var lower = (index * obj.paginationNumber) - obj.paginationNumber;
            var top =  (index * obj.paginationNumber);

            if (this.requiredAll) {
                for(var k = lower; k < top; k++) {
                    if(obj.finalQuestionList[k] && obj.finalQuestionList[k].isQualifiable()){
                        if( !obj.finalQuestionList[k].answered()){
                            return false;
                        }
                    }
                }
            }
            for(var i = lower; i < top; i++) {
                if(obj.finalQuestionList[i] && obj.finalQuestionList[i].isQualifiable()){
                    obj.finalQuestionList[i].showFeedback();
                }
            }

            obj.paginationTopSolved = index;

            return true;

        },

        "getTotalResult" : function() {
            var count = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if(this.questions[i].isQualifiable()){
                    if (this.questions[i].correct()) {
                        count++;
                    }
                }
            }
            return count;
        },
        "getSolvedWeight" : function(){
            var solved_weight = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if(this.questions[i].isQualifiable()){
                    if (this.questions[i].correct()) {
                        solved_weight += this.questions[i].getWeight()
                    }
                }
            }
            return solved_weight;
        },
        "getTotalWeight": function(){
            var total_weight = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if(this.questions[i].isQualifiable()){
                    total_weight+=this.questions[i].getWeight();
                }
            }
            return total_weight;
        },
        "countQualifiables" : function(){
            var count = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if(this.questions[i].isQualifiable()){
                    count++;
                }
            }
            return count;
        },
        "countAnswered" : function() {
            var count = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if(this.questions[i].isQualifiable()){
                    if (this.questions[i].answered()) {
                        count++;
                    }
                }
            }
            return count;
        },
        "isFullAnswered" : function(){
            return obj.countAnswered() == obj.countQualifiables();
        },

        "getAnonymousFunction" : function(name) {
            switch (name) {
                case '':
                    return (function() {
                        });
                    break;
            }
        },

        "getSolvedQuizDetails" : function(){
            var jSonArray = [];
            for (var i = 0; i < this.questions.length; i++) {
                var jsonDetail = {};
                jsonDetail= this.questions[i].getQuestionData();
                jSonArray.push(jsonDetail);
            }
            return jSonArray;
        },

        "getQuestions" :function(){
            return this.questions;

        },
        "getQuestion" : function(index){
            return this.questions[index];

        },
        "getQuestionById" : function(id){
            for (var i = 0; i < this.questions.length; i++) {
                if( this.questions[i].getUniqueId() == id){
                    return this.questions[i];
                }
            }
            return undefined;
        },
        "getQuestionByKey" : function(key){
            for (var i = 0; i < this.questions.length; i++) {
                if( (this.questions[i].getKey() != null) && (this.questions[i].getKey() == key)){
                    return this.questions[i];
                }
            }
            return undefined;
        }
    };

    jpit.activities.quiz.globals.actualQuiz++;
    obj.id = jpit.activities.quiz.globals.actualQuiz;

    if(typeof(options) == 'object') {
        if (options.shuffleQuestions != 'undefined' && options.shuffleQuestions != undefined) {
            obj.shuffleQuestions = options.shuffleQuestions;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.requiredAll != 'undefined' && options.requiredAll != undefined) {
            obj.requiredAll = options.requiredAll;
        }
        if (options.paginationNumber != 'undefined' && options.paginationNumber != undefined) {
            obj.paginationNumber = options.paginationNumber;
        }
        if (options.textPrevious != 'undefined' && options.textPrevious != undefined) {
            obj.textPrevious = options.textPrevious;
        }
        if (options.textNext != 'undefined' && options.textNext != undefined) {
            obj.textNext = options.textNext;
        }
        if (options.allowBackPagination != 'undefined' && options.allowBackPagination != undefined) {
            obj.allowBackPagination = options.allowBackPagination;
        }
    }
    obj.printBoard();
    jpit.activities.quiz.instances.push(obj);

    return obj;

};

/**
 * Class question
 * Namespace jpit.activities.quiz
 *
 * This class is used to group types of question for a quiz activity
 */
jpit.activities.quiz.question = {};

/**
 * Class simplechoice
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a simple choice question
 */
jpit.activities.quiz.question.simplechoice = function (statement, possibles, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "possibleAnswers" : possibles,
        "correctAnswer" : correct,
        "shuffleAnswer" : false,
        "userAnswer" : 0,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "control": null,
        "weight":10,
        "key" : null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"></ul>')

            var option;
            var prefix;

            var positions = new Array();
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                positions[i] = i;
            }

            if (this.shuffleAnswers) {
                positions.sort(jpit.activities.quiz.utility.randOrder);
            }

            var position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                prefix = '';
                if (this.prefixType != jpit.activities.quiz.prefixes.none) {
                    prefix = jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1);
                }

                prefix = prefix != null && prefix != '' ? '<label>' + prefix + '</label> ' : '';

                option = $('<li class="'+this.getUniqueId()+'_list jpit_activities_quiz_question_option"></li>');
                option.append($('<input type="radio" class="' + this.getUniqueId() + ' jpit_activities_quiz_question_option_control" name="' + this.getUniqueId() + '[]" value="' + position + '" />').click(function() {
                    $('#' + this.className + '_true').hide();
                    $('#' + this.className + '_false').hide();
                } ));
                option.append($('<div class="jpit_activities_quiz_question_option_answer"></div>').html(prefix + this.possibleAnswers[position]));

                option.find('input').bind('change',function(){
                    var $ul = $(this).parent().parent();
                    $ul.find('>li').removeClass("jpit_activities_quiz_question_option_answer_selected");

                    var checked = $(this).is(":checked");
                    if(checked)  {
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }

                });

                option.find('div.jpit_activities_quiz_question_option_answer').click(function(e){
                    e.preventDefault();
                    var $this = $(this);
                    var $input = $this.parent("li").find('input');
                    var $parent = $this.parent("li");

                    $parent.find('input').prop("checked", false);

                    var isEnabled  = $input.is(":enabled");
                    if(!isEnabled) return;

                    var isChecked = $input.is(":checked");
                    $input.prop("checked", !isChecked);

                    $input.trigger('change');
                });

                control.append(option);
            }
            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "disableQuestion" : function(){
            obj.control.find("input").attr('disabled', 'disabled');
        },

        "correct" : function () {
            var userAnswer;
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    userAnswer = options[i].value;
                    break;
                }
            }
            return this.correctAnswer == userAnswer;
        },

        "answered" : function () {
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    return true;
                }
            }
            return false;
        },
        "getQuestionData" : function () {
            var response = {};
            response.type = "simplechoise";
            response.statement = this.statement;
            response.weight = obj.weight;
            response.answer = "";
            response.id = obj.getUniqueId();
            response.is_correct = obj.correct();
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    response.answer = this.possibleAnswers[ options[i].value ];
                }
            }
            return response;
        },
        "isQualifiable" : function(){
            return true;
        },
        "getWeight" : function(){
            return obj.weight ;
        },
        "getHtml" : function (prefix) {
            var control = $('<div class="' + ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) + ' jpit_activities_quiz_question_simplechoice"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_simplechoice_question_' + this.id;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key ;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};


/**
 * Class multichoice
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a multiple choice question
 */
jpit.activities.quiz.question.multichoice = function (statement, possibles, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "possibleAnswers" : possibles,
        "correctAnswer" : correct,
        "shuffleAnswer" : false,
        "userAnswerArray" : null,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "control":null,
        "weight":10,
        "key": null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"></ul>')

            var option;
            var prefix;

            var positions = new Array();
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                positions[i] = i;
            }

            if (this.shuffleAnswers) {
                positions.sort(jpit.activities.quiz.utility.randOrder);
            }

            var position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                prefix = '';
                if (this.prefixType != jpit.activities.quiz.prefixes.none) {
                    prefix = '<label>' + jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1) + '</label> ';
                }

                option = $('<li class="jpit_activities_quiz_question_option"></li>');

                option.append($('<input type="checkbox" class="' + this.getUniqueId() + ' jpit_activities_quiz_question_option_control" name="' + this.getUniqueId() + '[]" value="' + position + '" />').click(function() {
                    $('#' + this.className + '_true').hide();
                    $('#' + this.className + '_false').hide();
                } ));
                option.append($('<div class="jpit_activities_quiz_question_option_answer"></div>').html(prefix + this.possibleAnswers[position]));

                option.find('input').bind('change',function(){
                    $(this).parent('li').removeClass("jpit_activities_quiz_question_option_answer_selected");
                    var checked = $(this).is(":checked");
                    if(checked)  {
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }
                });


                option.find('div.jpit_activities_quiz_question_option_answer').click(function(e){
                    e.preventDefault();

                    var isEnabled  = $(this).parent("li").find('input').is(":enabled");
                    if(!isEnabled) return;

                    var isChecked = $(this).parent("li").find('input').is(":checked");
                    $(this).parent("li").find('input').attr("checked",!isChecked);

                    if(isChecked){
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }else {
                        $(this).parent("li").removeClass("jpit_activities_quiz_question_option_answer_selected");
                    }

                    $(this).parent("li").find('input').trigger('change');

                });

                control.append(option);
            }

            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },
        "disableQuestion" : function(){
            obj.control.find("input").attr('disabled', 'disabled');
        },

        "correct" : function () {
            var options = $('.' + this.getUniqueId());
            this.userAnswerArray = new Array();
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    this.userAnswerArray.push(parseInt(options[i].value));
                }
            }
            return $.compare(this.userAnswerArray,this.correctAnswer);
        },

        "answered" : function () {
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    return true;
                }
            }

            return false;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "multichoice";
            response.statement = this.statement;
            response.weight = obj.weight;
            response.is_correct = obj.correct();
            response.answers = [];
            response.id = obj.getUniqueId();
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    response.answers.push( this.possibleAnswers[ options[i].value ]);
                }
            }
            return response;

        },

        "isQualifiable" : function(){
            return true;
        },
        "getWeight" : function(){
            return obj.weight ;
        },
        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_multichoice"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_multichoice_question_' + this.id;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key ;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};


/**
 * Class true or false
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a true or false choice question
 */
jpit.activities.quiz.question.trueorfalse = function (statement, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "possibleAnswers" : ['false', 'true'],
        "correctAnswer" : 0,
        "shuffleAnswer" : false,
        "userAnswer" : 0,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "textTrue" : 'true',
        "textFalse" : 'false',
        "control":null,
        "weight": 10,
        "key":null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"></ul>')

            var option;
            var prefix;

            var positions = new Array();
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                positions[i] = i;
            }

            if (this.shuffleAnswers) {
                positions.sort(jpit.activities.quiz.utility.randOrder);
            }

            var position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                prefix = '';
                if (this.prefixType != jpit.activities.quiz.prefixes.none) {
                    prefix = jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1) + '. ';
                }

                option = $('<li class="jpit_activities_quiz_question_option"></li>');

                option.append($('<input type="radio" class="' + this.getUniqueId() + ' jpit_activities_quiz_question_option_control" name="' + this.getUniqueId() + '[]" value="' + position + '" />').click(function() {
                    $('#' + this.className + '_true').hide();
                    $('#' + this.className + '_false').hide();
                } ));

                option.find('input').bind('change',function(){
                    var $ul = $(this).parent().parent();
                    $ul.find('>li').removeClass("jpit_activities_quiz_question_option_answer_selected");

                    var checked = $(this).is(":checked");
                    if(checked)  {
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }

                });

                option.append($('<div class="jpit_activities_quiz_question_option_answer"></div>').html(prefix + this.possibleAnswers[position]));


                option.find('div.jpit_activities_quiz_question_option_answer').click(function(e){
                    e.preventDefault();
                    var isEnabled  = $(this).parent("li").find('input').is(":enabled");
                    if(!isEnabled) return;

                    var isChecked = $(this).parent("li").find('input').is(":checked");
                    if(!isChecked) {
                        $(this).parent("li").find('input').attr("checked",!isChecked);
                    }
                    $(this).parent("li").find('input').trigger('change');
                });

                control.append(option);
            }

            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },
        "disableQuestion" : function(){
            obj.control.find("input").attr('disabled', 'disabled');
        },

        "correct" : function () {
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    this.userAnswer = options[i].value;
                    break;
                }
            }

            return this.correctAnswer == this.userAnswer;
        },

        "answered" : function () {
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    return true;
                }
            }

            return false;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_trueorfalse"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "trueorfalse";
            response.statement = this.statement;
            response.weight = obj.weight;
            response.is_correct = obj.correct();
            response.answer = [];
            response.id = obj.getUniqueId();
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    response.answer = this.possibleAnswers[ options[i].value ];
                }
            }

            return response;

        },
        "isQualifiable" : function(){
            return true;
        },
        "getWeight" : function(){
            return obj.weight ;
        },
        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_trueorfalse_question_' + this.id;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key;   
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.textFalse != 'undefined' && options.textFalse != undefined) {
            obj.possibleAnswers[0] = options.textFalse;
        }
        if (options.textTrue != 'undefined' && options.textTrue != undefined) {
            obj.possibleAnswers[1] = options.textTrue;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    if (correct) {
        obj.correctAnswer = 1;
    }
    else {
        obj.correctAnswer = 0;
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};

/**
 * Class define term
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a defineterm question
 */
jpit.activities.quiz.question.defineterm = function (statement, statements, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "statements" : statements,
        "correctAnswer" : correct,
        "shuffleAnswer" : false,
        "userAnswerArray" : null,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "caseSensitive": false,
        "keySensitive": false,
        "positionsAux": null,
        "control":null,
        "weight":10,
        "key":null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"></ul>')

            var option;
            var prefix;

            var positions = new Array();
            for (var i = 0; i < this.statements.length; i++) {
                positions[i] = i;
            }

            if (this.shuffleAnswers) {
                positions.sort(jpit.activities.quiz.utility.randOrder);
            }

            this.positionsAux = positions;

            var position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                prefix = '';
                if (this.prefixType != jpit.activities.quiz.prefixes.none) {
                    prefix = jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1) + '. ';
                }

                option = $('<li class="jpit_activities_quiz_option"></li>');

                option.append($('<div class="jpit_activities_quiz_question_option_answer"></div>').html(this.statements[position]));
                option.children('.jpit_activities_quiz_question_option_answer').prepend($('<input id="'+ this.getUniqueId()+"_field_"+position+'" type="text" class="' + this.getUniqueId() + ' jpit_activities_quiz_question_option_control jpit_activities_quiz_defineterm_control" name="' + position + '" value="' + '" />').on("keyup",function(){
                    $('#' + this.className + '_true').hide();
                    $('#' + this.className + '_false').hide();
                })).prepend(prefix);

                if(this.keySensitive) $("#"+this.getUniqueId()+"_field_"+position).on("keyup",function(){
                    $(this).removeClass('jpit_activities_defineterm_correct');
                    $(this).removeClass('jpit_activities_defineterm_mistake');
                    obj.checkCorrect($(this).attr('id'));
                });

                control.append(option);
            }

            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },
        "checkCorrect": function(fieldId){
            var response = false;
            var correctAnswer = $.trim(obj.correctAnswer[ parseInt($("#"+fieldId).attr("name")) ]);
            var userAnswer = $.trim($("#"+fieldId).val());

            if(!this.caseSensitive){
                correctAnswer = correctAnswer.toLowerCase();
                userAnswer = userAnswer.toLowerCase()
            }

            if ( $.equals(correctAnswer,userAnswer) ){
                $("#"+fieldId).addClass('jpit_activities_defineterm_correct').parents('div.jpit_activities_quiz_quest').addClass('jpit_activities_defineterm_statement_correct');
                response = true;
            }
            else{
                $("#"+fieldId).addClass('jpit_activities_defineterm_mistake').parents('div.jpit_activities_quiz_quest').removeClass('jpit_activities_defineterm_statement_correct');
            }

            if(userAnswer.length == 0) {
                $("#"+fieldId).removeClass('jpit_activities_defineterm_mistake').removeClass('jpit_activities_defineterm_correct').parents('div.jpit_activities_quiz_quest').removeClass('jpit_activities_defineterm_statement_correct');
            }

            return response;
        },

        "correct" : function () {
            var response = true;
            $('.' + this.getUniqueId()).each(function(ind,val){
                if(!obj.checkCorrect($(this).attr('id'))) {
                    response = false;
                }
            });
            return response;
        },
        "disableQuestion" : function(){
            obj.control.find("input").attr('disabled', 'disabled');
        },

        "answered" : function () {
            var questions = $('.' + this.getUniqueId());
            for (var i = 0; i < questions.length; i++) {
                if($.trim( questions[i].value ).length == 0) {
                    return false;
                }
            }
            return true;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_defineterm"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "defineterm";
            response.weight = obj.weight;
            response.solutions = [];
            response.is_correct = obj.correct();
            response.id = obj.getUniqueId();
            $('.' + this.getUniqueId()).each(function(ind,val){
                var item = {};
                var id = $(this).attr('id');
                item.userterm = $.trim($("#"+id).val());
                item.definition = obj.statements[ parseInt($("#"+id).attr("name")) ];
                response.solutions.push(item);
            });
            return response;

        },
        "isQualifiable" : function(){
            return true;
        },

        "getWeight" : function(){
            return obj.weight ;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_defineterm_question_' + this.id;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.caseSensitive != 'undefined' && options.caseSensitive != undefined) {
            obj.caseSensitive = options.caseSensitive;
        }

        if (options.keySensitive != 'undefined' && options.keySensitive != undefined) {
            obj.keySensitive = options.keySensitive;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }

    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};


/**
 * Class multisetchoice
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a multisetchoice question
 */
jpit.activities.quiz.question.multisetchoice = function (statement, possibles, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "possibleAnswers" : possibles,
        "correctAnswer" : correct,
        "shuffleAnswer" : false,
        "userAnswerArray" : null,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "control":null,
        "weight": 10,
        "key" : null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"></ul>')

            var option;
            var prefix;

            var positions = new Array();
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                positions[i] = i;
            }

            if (this.shuffleAnswers) {
                positions.sort(jpit.activities.quiz.utility.randOrder);
            }

            var position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                prefix = '';
                if (this.prefixType != jpit.activities.quiz.prefixes.none) {
                    prefix = jpit.activities.quiz.prefixes.getText(this.prefixType, i + 1);
                }

                prefix = prefix != null && prefix != '' ? '<label>' + prefix + '</label> ' : '';

                option = $('<li class="jpit_activities_quiz_question_option"></li>');

                option.append($('<input type="checkbox" class="' + this.getUniqueId() + ' jpit_activities_quiz_question_option_control" name="' + this.getUniqueId() + '[]" value="' + position + '" />').click(function() {
                    $('#' + this.className + '_true').hide();
                    $('#' + this.className + '_false').hide();
                } ));
                option.append($('<div class="jpit_activities_quiz_question_option_answer"></div>').html(prefix + this.possibleAnswers[position]));

                option.find('input').bind('change',function(){
                    $(this).parent('li').removeClass("jpit_activities_quiz_question_option_answer_selected");
                    var checked = $(this).is(":checked");
                    if(checked)  {
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }
                });

                option.find('div.jpit_activities_quiz_question_option_answer').click(function(e){
                    e.preventDefault();
                    var isEnabled  = $(this).parent("li").find('input').is(":enabled");
                    if(!isEnabled) return;

                    var isChecked = $(this).parent("li").find('input').is(":checked");
                    $(this).parent("li").find('input').attr("checked",!isChecked);

                    if(isChecked){
                        $(this).parent("li").addClass("jpit_activities_quiz_question_option_answer_selected");
                    }else{
                        $(this).parent("li").removeClass("jpit_activities_quiz_question_option_answer_selected");
                    }

                    $(this).parent("li").find('input').trigger('change');
                });
                control.append(option);
            }

            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "correct" : function () {
            var response = false;
            var options = $('.' + this.getUniqueId());
            var userAnswerArray = new Array();
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    userAnswerArray.push(parseInt(options[i].value));
                }
            }
            $.each(this.correctAnswer,function(index,value){
                if($.compare(userAnswerArray,value)) {
                    response =  true;
                }
            });
            return response;
        },

        "answered" : function () {
            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    return true;
                }
            }
            return false;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_multisetchoice"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "multisetchoice";
            response.weight = obj.weight;
            response.statement = this.statement;
            response.is_correct = obj.correct();
            response.answer = [];
            response.id = obj.getUniqueId();

            var options = $('.' + this.getUniqueId());
            for (var i = 0; i < options.length; i++) {
                if (options[i].checked) {
                    response.answer.push( this.possibleAnswers[ options[i].value ]);
                }
            }
            return response;

        },
        "isQualifiable" : function(){
            return true;
        },

        "getWeight" : function(){
            return obj.weight ;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_multisetchoice_question_' + this.id;
        },

        "disableQuestion" : function(){
            obj.control.find("input").attr('disabled', 'disabled');
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};

/**
 * Class Statement
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a multisetchoice question
 */

jpit.activities.quiz.question.label = function (statement, text, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "key" : null,

        "getAnswerControl" : function () {
            var control = $('<ul class="jpit_activities_quiz_question_answers"><li>'+text+'</li></ul>');
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "correct" : function () {
            return true;
        },

        "answered" : function () {
            return true;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_label"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "disableQuestion" : function(){

        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_label_question_' + this.id;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "label";
            response.statement = this.statement;
            return response;
        },

        "isQualifiable" : function(){
            return false;
        },
        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey":function(){
            return obj.key;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};


/**
 * Class open
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage an open question
 */
jpit.activities.quiz.question.open = function (statement,  template, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "inputmaxlength": 25,
        "autograde": false,
        "inputtype" : jpit.activities.quiz.inputypes.mono,
        "weight": 10,
        "key": null,

        "getAnswerControl" : function () {
            var answer_template = ( '<li id="'+this.getUniqueId()+'">'+ ( template.length > 0 ? template : (obj.inputtype == 0 ? '<input class="jpit_activities_quiz_question_open_input" type="text" maxlength="'+obj.inputmaxlength+'" />': '<textarea class="jpit_activities_quiz_question_open_input" rows="3" cols="40"></textarea>') )+'</li>');
            var control = $('<ul class="jpit_activities_quiz_question_answers">'+answer_template+'</ul>');
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "correct" : function () {
            return obj.autograde;
        },

        "answered" : function () {
            return true;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_open_template"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_open_template_' + this.id;
        },

        "disableQuestion" : function(){

        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "open";
            response.statement = this.statement;
            response.values = [];
            response.weight = obj.weight;
            response.is_correct = obj.correct();
            response.id = obj.getUniqueId();
            var uniqueid = this.getUniqueId();

            if(template.length > 0){
                response.usetemplate = true;
                var aux = 0;
                $('#'+uniqueid+' input[type=text]').each(function(){
                    var item ={};
                    var id = $(this).attr("id") ? 'template_input_text_'+uniqueid+'_'+aux : $(this).attr("id");
                    var val = $(this).val();
                    item.id =id;
                    item.type ='text';
                    item.val = val;
                    aux++;
                    response.values.push(item);
                    $(this).attr('id',id);
                });

                $('#'+uniqueid+' input[type=checkbox]').each(function(){
                    var item ={};
                    var id = $(this).attr("id") ? 'template_checkbox_'+uniqueid+'_'+aux : $(this).attr("id") ;
                    var val = $(this).is(':checked');
                    item.id =id;
                    item.type ='checkbox';
                    item.val = val;
                    aux++;
                    response.values.push(item);
                    $(this).attr('id',id);
                });

                $('#'+uniqueid+' input[type=radio]').each(function(){
                    var item ={};
                    var id = $(this).attr("id") ? 'template_radio_'+uniqueid+'_'+aux : $(this).attr("id") ;
                    var val = $(this).is(':checked');
                    item.id =id;
                    item.type ='radio';
                    item.val = val;
                    aux++;
                    response.values.push(item);
                    $(this).attr('id',id);
                });

                $('#'+uniqueid+' select').each(function(){
                    var item ={};
                    var id = $(this).attr("id") ? 'template_select_'+uniqueid+'_'+aux : $(this).attr("id") ;
                    var val = $(this).val();
                    item.id =id;
                    item.type ='select';
                    item.val = val;
                    aux++;
                    response.values.push(item);
                    $(this).attr('id',id);
                });

                $('#'+uniqueid+' textarea').each(function(){
                    var item ={};
                    var id = $(this).attr("id") ? 'template_textarea_'+uniqueid+'_'+aux : $(this).attr("id") ;
                    var val = $(this).val();
                    item.id =id;
                    item.type ='textarea';
                    item.val = val;
                    aux++;
                    response.values.push(item);
                    $(this).attr('id',id);
                });
                response.html = $('#'+this.getUniqueId()).html();

            }else{
                response.answer = $('#'+this.getUniqueId()+" .jpit_activities_quiz_question_open_input").val();
            }
            return response;
        },

        "isQualifiable" : function(){
            return true;
        },

        "getWeight" : function(){
            return obj.weight ;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey":function(){
            return obj.key;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }

        if (options.inputype != 'undefined' && options.inputype  != undefined) {
            obj.inputype  = options.inputype ;
        }

        if (options.inputmaxlength!= 'undefined' && options.inputmaxlength  != undefined) {
            obj.inputmaxlength  = options.inputmaxlength ;
        }

        if (options.weight!= 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }

        if (options.key!= 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }

    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};


/**
 * Class script
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage an open question
 */
jpit.activities.quiz.question.script = function (statement, script, template, options) {

    var obj = {
        "id" : 0,
        "statement": statement,
        "script" : script,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "weight": 10,
        "key":null,
        "isCorrect":false,

        "getAnswerControl" : function () {
            var script_control = '<script type=\"text/javascript\"> \n <![CDATA[ \n'+ script +'\n//]]>\n  </script>';
            var answer_template =  '<li id="'+this.getUniqueId()+'">'+ template +'</li>';
            var control = $('<ul class="jpit_activities_quiz_question_answers">'+script_control+'<br/>'+answer_template+'</ul>');
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement"></div>').html(prefix + this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "correct" : function () {
            return obj.isCorrect;
        },

        "answered" : function () {
            return true;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="'+ ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) +' jpit_activities_quiz_question_open_template"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }
            return control;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_open_template_' + this.id;
        },

        "disableQuestion" : function(){

        },
        "setCorrect" : function(correct){
            obj.isCorrect = correct;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "script";
            response.statement = this.statement;
            response.values = [];
            response.weight = obj.weight;
            response.is_correct = obj.correct();
            response.id = obj.getUniqueId();
            var uniqueid = this.getUniqueId();
            var aux = 0;
            $('#'+uniqueid+' input[type=text]').each(function(){
                var item ={};
                var id = $(this).attr("id") ? 'template_input_text_'+uniqueid+'_'+aux : $(this).attr("id");
                var val = $(this).val();
                item.id =id;
                item.type ='text';
                item.val = val;
                aux++;
                response.values.push(item);
                $(this).attr('id',id);
            });

            $('#'+uniqueid+' input[type=checkbox]').each(function(){
                var item = {};
                var id = $(this).attr("id") ? 'template_checkbox_'+uniqueid+'_'+aux : $(this).attr("id") ;
                var val = $(this).is(':checked');
                item.id =id;
                item.type ='checkbox';
                item.val = val;
                aux++;
                response.values.push(item);
                $(this).attr('id',id);
            });

            $('#'+uniqueid+' input[type=radio]').each(function(){
                var item ={};
                var id = $(this).attr("id") ? 'template_radio_'+uniqueid+'_'+aux : $(this).attr("id") ;
                var val = $(this).is(':checked');
                item.id =id;
                item.type ='radio';
                item.val = val;
                aux++;
                response.values.push(item);
                $(this).attr('id',id);
            });

            $('#'+uniqueid+' select').each(function(){
                var item ={};
                var id = $(this).attr("id") ? 'template_select_'+uniqueid+'_'+aux : $(this).attr("id") ;
                var val = $(this).val();
                item.id =id;
                item.type ='select';
                item.val = val;
                aux++;
                response.values.push(item);
                $(this).attr('id',id);
            });

            $('#'+uniqueid+' textarea').each(function(){
                var item ={};
                var id = $(this).attr("id") ? 'template_textarea_'+uniqueid+'_'+aux : $(this).attr("id") ;
                var val = $(this).val();
                item.id =id;
                item.type ='textarea';
                item.val = val;
                aux++;
                response.values.push(item);
                $(this).attr('id',id);
            });
            response.html = $('#'+this.getUniqueId()).html();

            return response;
        },

        "isQualifiable" : function(){
            return true;
        },

        "getWeight" : function(){
            return obj.weight ;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key;
        }
    };

    if(typeof(options) == 'object') {
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }

        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }

         if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }

    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};

/**
 * Class complete
 * Namespace jpit.activities.quiz
 *
 * This class is used to manage a complete question
 */
jpit.activities.quiz.question.complete = function (statement, $paragraph, correct, options) {

    var obj = {
        "id" : 0,
        "statement" : statement,
        "correctAnswer" : correct,
        "shuffleAnswer" : false,
        "userAnswer" : 0,
        "prefixType" : 0,
        "displayFeedback" : false,
        "feedbackIfTrue" : '',
        "feedbackIfFalse" : '',
        "control": null,
        "weight":10,
        "key" : null,
        "paragraph" : $paragraph,

        "getAnswerControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_answers"></div>').append(obj.paragraph);

            obj.paragraph.find('select').each(function() {
                var $list = $(this);
                $list.prop('disabled', false);

                var $empty = $('<option class="no-chosen" selected="selected" value="1"></option>');
                $list.prepend($empty);
                $list.find('option').each(function () {
                    var $option = $(this);
                    $option.addClass(obj.getUniqueId() + '_list jpit_activities_quiz_question_option');
                });

                //Hack by IE
                $list.val(1);
            });

            obj.control = control;
            return control;
        },

        "getStatement" : function (prefix) {
            var control = $('<div class="jpit_activities_quiz_question_statement">' + prefix + '</div>').append(this.statement);
            return control;
        },

        "getFeedbackControl" : function () {
            var control = $('<div class="jpit_activities_quiz_question_feedback"></div>');
            control.append($('<div id="' + this.getUniqueId() + '_true" class="jpit_activities_quiz_question_feedback_true" style="display: none;"></div>').html(this.feedbackIfTrue));
            control.append($('<div id="' + this.getUniqueId() + '_false" class="jpit_activities_quiz_question_feedback_false" style="display: none;"></div>').html(this.feedbackIfFalse));
            return control;
        },

        "disableQuestion" : function(){
            obj.control.find("select").attr('disabled', 'disabled');
        },

        "correct" : function () {
            var corrects = 0;
            var lists = this.paragraph.find('select').length;
            this.paragraph.find('select').each(function() {
                var $this = $(this);
                $this.find('option:selected').each(function(){
                    var $option = $(this);
                    if ($option.attr('data-response') == 'true' || $option.attr('data-response') == true) {
                        corrects++;
                    }
                });
            });

            return lists == corrects;
        },

        "answered" : function () {
            var answered = 0;
            var lists = this.paragraph.find('select').length;
            this.paragraph.find('select').each(function() {
                var $this = $(this);
                $this.find('option:selected').each(function(){
                    var $option = $(this);
                    if (!$option.hasClass('no-chosen')) {
                        answered++;
                    }
                });
            });

            return lists == answered;
        },

        "getQuestionData" : function () {
            var response = {};
            response.type = "complete";
            response.statement = this.statement;
            response.weight = obj.weight;
            response.answer = "";
            response.id = obj.getUniqueId();
            response.is_correct = obj.correct();
            response.answer = [];

            this.paragraph.find('select').each(function() {
                var $this = $(this);
                var answered;
                $this.find('answered:selected').each(function(){
                    var $option = $(this);
                    if (!$option.hasClass('no-chosen')) {
                        answered = $option.val();
                    }
                });
                response.answer[response.answer.length] = answered;
            });

            return response;
        },

        "isQualifiable" : function(){
            return true;
        },

        "getWeight" : function(){
            return obj.weight ;
        },

        "getHtml" : function (prefix) {
            var control = $('<div class="' + ( options.classQuestionContainer != undefined ? options.classQuestionContainer:'' ) + ' jpit_activities_quiz_question_simplechoice"></div>');
            control.append(this.getStatement(prefix));
            control.append(this.getAnswerControl());

            if (this.displayFeedback) {
                control.append(this.getFeedbackControl());
            }

            return control;
        },

        "getUniqueId" : function () {
            return 'jpit_activities_quiz_question_complete_question_' + this.id;
        },

        "showFeedback" : function () {
            if (this.displayFeedback) {
                if (this.correct()) {
                    if (this.feedbackIfTrue != '') {
                        $('#' + this.getUniqueId() + '_true').show();
                    }
                }
                else if (this.feedbackIfFalse != '') {
                    $('#' + this.getUniqueId() + '_false').show();
                }
            }
        },

        "hideFeedback" : function () {
            $('#' + this.getUniqueId() + '_true').hide();
            $('#' + this.getUniqueId() + '_false').hide();
        },
        "getKey" : function(){
            return obj.key ;
        }
    };

    if(typeof(options) == 'object') {
        if (options.shuffleAnswers != 'undefined' && options.shuffleAnswers != undefined) {
            obj.shuffleAnswers = options.shuffleAnswers;
        }
        if (options.prefixType != 'undefined' && options.prefixType != undefined) {
            obj.prefixType = options.prefixType;
        }
        if (options.feedbackIfTrue != 'undefined' && options.feedbackIfTrue != undefined) {
            obj.feedbackIfTrue = options.feedbackIfTrue;
            obj.displayFeedback = true;
        }
        if (options.feedbackIfFalse != 'undefined' && options.feedbackIfFalse != undefined) {
            obj.feedbackIfFalse = options.feedbackIfFalse;
            obj.displayFeedback = true;
        }
        if (options.classQuestionContainer != 'undefined' && options.classQuestionContainer  != undefined) {
            obj.classQuestionContainer  = options.classQuestionContainer ;
        }
        if (options.weight != 'undefined' && options.weight  != undefined) {
            obj.weight  = options.weight ;
        }
        if (options.key != 'undefined' && options.key  != undefined) {
            obj.key  = options.key ;
        }
    }

    jpit.activities.quiz.globals.uniqueIdAnswer++;
    obj.id = jpit.activities.quiz.globals.uniqueIdAnswer;

    return obj;
};

