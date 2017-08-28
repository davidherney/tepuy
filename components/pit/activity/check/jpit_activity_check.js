/**
 * Namespace jpit.activities.check
 *
 * This namespace contain all related to check activity
 */
jpit.activities.check = jpit.activities.registerType( 'jpit.activities.check');

/**
 * Namespace jpit.activities.check.instances
 *
 * This array store all check instances
 */
jpit.activities.check.instances = [];



jpit.activities.check.toString = function(){    
    return  'jpit.activities.check';
}; 

/**
 * Class activity
 * Namespace jpit.activities.check
 *
 * This class have control to the board
 */
jpit.activities.check.init = function (container, words, properties) {

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
        "box_word": null,
        "randomString": '',
        "box_word": null,
        "current_word": null,
        "properties": {},
        "noneString": '0',

        "getLocalId" : function () {
            return "jpit_activity_check_" + this.id;
        },

        init: function() {

            this.box_word = obj.container.find('.word_content');

            obj.container.find('.yes').on('click', function(){
                obj.current_word.correct = obj.current_word.res;

                obj.newIteration();
            });

            obj.container.find('.not').on('click', function(){
                obj.current_word.correct = !obj.current_word.res;

                obj.newIteration();
            });

            obj.container.find('.reload').on('click', function(){
                obj.start();
            });

            this.start();

        },

        start: function() {

            if (this.finished()) {
                this.resetWrongs();
            }

            obj.container.find('.box_conclution').hide();
            obj.container.find('.play').show();

            this.newIteration();
        },

        newIteration: function () {

            this.printResults();

            if (this.finished()) {
                obj.container.find('.play').hide();
                obj.container.find('.box_conclution').show();
                obj.container.find('.box_conclution .correct_words').text(this.correctString());
                obj.container.find('.box_conclution .wrong_words').text(this.wrongString());

                if (this.finishedAll()){
                    obj.container.find('.reload').hide();
                }

                if (this.properties.onfinished) {
                    this.properties.onfinished(this);
                }

                return;
            }

            this.current_word = this.getRandomWord();
            this.box_word.text(this.current_word.text);
            this.current_word.used = true;
        },

        getRandomWord : function() {
            var index, control = 0;
            this.randomString = '';
            while(1 && control < 1000) {
                index = dhbgApp.rangerand(0, this.words.length - 1, true);
                if (this.randomString.indexOf('_' + index + '_') == -1 && !this.words[index].used) {
                    this.randomString += '_' + index + '_';
                    return this.words[index];
                }
                control++;
            }
        },

        finished: function() {
            var res = true;
            $.each(this.words, function(i, v){
                if (!v.used) {
                    res = false;
                }
            });

            return res;
        },

        finishedAll: function() {
            var res = true;
            $.each(this.words, function(i, v){
                if (!v.correct) {
                    res = false;
                }
            });

            return res;
        },

        resetWrongs: function() {
            $.each(this.words, function(i, v){
                if (!v.correct) {
                    v.used = false;
                }
            });
        },

        correctString: function() {
            var res = [];
            $.each(this.words, function(i, v){
                if (v.correct) {
                    res[res.length] = v.text;
                }
            });

            if (res.length == 0) {
                return obj.noneString;
            }

            return res.join(', ');
        },

        wrongString: function() {
            var res = [];
            $.each(this.words, function(i, v){
                if (!v.correct) {
                    res[res.length] = v.text;
                }
            });

            if (res.length == 0) {
                return obj.noneString;
            }

            return res.join(', ');
        },

        countCorrect: function() {
            var res = 0;
            $.each(this.words, function(i, v){
                if (v.correct) {
                    res++;
                }
            });

            return res;
        },

        countWrong: function() {
            var res = 0;
            $.each(this.words, function(i, v){
                if (!v.correct) {
                    res++;
                }
            });

            return res;
        },

        printResults: function() {
            var correct = 0, wrong = 0;
            $.each(this.words, function(i, v){
                if (v.used) {
                    if (v.correct) {
                        correct++;
                    }
                    else {
                        wrong++;
                    }
                }
            });

            obj.container.find('.hits').text(correct);
            obj.container.find('.miss').text(wrong);
        }
    };

    if (properties != null && typeof(properties) != 'undefined') {
        obj.properties = properties;
    }

    obj.init();

    jpit.activities.check.instances.push(obj);
    return obj;

};

/**
 * Class word
 * Namespace jpit.activities.check
 * 
 * This class is used to manage a word in the board
 */
jpit.activities.check.word = function (text, res) {

    var obj = {
        "text" : text,
        "res" : res,
        "correct" : false,
        "used" : false
    };

    return obj;
};