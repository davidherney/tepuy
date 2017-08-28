var JPIT_ACTIVITY_CLOZE_NAMESPACE = 'jpit.activities.cloze';

/**
 * Namespace jpit.activities.cloze
 *
 * This namespace contain all related to cloze activity
 */
jpit.activities.cloze = jpit.activities.registerType(JPIT_ACTIVITY_CLOZE_NAMESPACE);


/**
 * Namespace jpit.activities.cloze.instances
 *
 * This array store all cloze instances
 */
jpit.activities.cloze.instances = [];

/**
 * Class globals
 * Namespace jpit.activities.cloze
 *
 * This class persists globally some variables used in the activity
 */
jpit.activities.cloze.globals = {
    "actualCloze" : 0,
    "uniqueIdAnswer" : 0
};

jpit.activities.cloze.toString = function(){    
    return JPIT_ACTIVITY_CLOZE_NAMESPACE;
}; 

jpit.activities.cloze.inputypes = {
    "mono" : 0,
    "multi" : 1
};

/**
 * Class utility
 * Namespace jpit.activities.cloze
 *
 * This class contain some utility methods to encapsulate logic
 */
jpit.activities.cloze.utility = {};

jpit.activities.cloze.utility.randOrder = function(){
    return (Math.round(Math.random())-0.5);
};

/**
 * Class game
 * Namespace jpit.activities.cloze
 *
 * This class have control to the questions list
 */
jpit.activities.cloze.activity = function (container) {

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
        "getLocalId" : function () {
            return "jpit_activities_cloze_" + this.id;
        },

        "processBoard" : function () {
            $container.addClass('jpit_activities_cloze_board').attr('id', this.getLocalId() + '_board');

            $container.find('select').each(function() {
                var $list = $(this);
                $list.prop('disabled', false);
                $list.prop('name', 'select_' + obj.getLocalId());

                var $empty = $('<option class="no-chosen" selected="selected" value="1"></option>');
                $list.prepend($empty);

                //Hack by IE
                $list.val(1);
            });

            $container.find('input[type="text"]').each(function() {
                var $this = $(this);
                $this.prop('disabled', false);
                $this.val('');
            });

            $container.find('[data-response]').each(function() {
                $(this).data('data-response', $(this).attr('data-response'));
                $(this).removeAttr('data-response');
            });
        },

        "disable" : function(){
            obj.container.find("select").attr('disabled', 'disabled');
            obj.container.find('input[type="text"]').attr('disabled', 'disabled');
        },

        "enable" : function(){
            obj.container.find("select").attr('disabled', false);
            obj.container.find('input[type="text"]').attr('disabled', false);
        },

        "restart" : function(){
            obj.container.find("select").attr('disabled', false).val(1);
            obj.container.find('input[type="text"]').attr('disabled', false);
        },

        "weight" : function () {
            var corrects = 0;
            var total = this.container.find('select').length;
            this.container.find('select').each(function() {
                var $this = $(this);
                $this.find('option:selected').each(function(){
                    var $option = $(this);
                    if ($option.data('data-response') == 'true' || $option.data('data-response') == true) {
                        corrects++;
                    }
                });
            });

            total += this.container.find('input[type="text"]').length;
            this.container.find('input[type="text"]').each(function() {
                var $this = $(this);
                var val = $this.val().trim().toUpperCase();

                if ($this.data('data-response').toUpperCase() == val) {
                    corrects++;
                }
            });

            return corrects * 100 / total;
        },

        "fullAnswered" : function () {
            var answered = 0;
            var total = this.container.find('select').length;
            this.container.find('select').each(function() {
                var $this = $(this);
                $this.find('option:selected').each(function(){
                    var $option = $(this);
                    if (!$option.hasClass('no-chosen')) {
                        answered++;
                    }
                });
            });

            total += this.container.find('input[type="text"]').length;
            this.container.find('input[type="text"]').each(function() {
                var $this = $(this);
                var val = $this.val().trim();

                if (val != '') {
                    answered++;
                }
            });

            return total == answered;
        },

        "highlight" : function (classCorrect, classWrong) {
            var corrects = 0;

            this.container.find('select').each(function() {
                var $this = $(this);
                $this.find('option:selected').each(function(){
                    var $option = $(this);
                    if ($option.data('data-response') == 'true' || $option.data('data-response') == true) {
                        $this.addClass(classCorrect);
                    }
                    else {
                        $this.addClass(classWrong);
                    }
                });
            });

            this.container.find('input[type="text"]').each(function() {
                var $this = $(this);
                var val = $this.val().trim().toUpperCase();

                if ($this.data('data-response').toUpperCase() == val) {
                    $this.addClass(classCorrect);
                }
                else {
                    $this.addClass(classWrong);
                }
            });
        }
    };

    jpit.activities.cloze.globals.actualCloze++;
    obj.id = jpit.activities.cloze.globals.actualCloze;

    obj.processBoard();    
    jpit.activities.cloze.instances.push(obj);
    
    return obj;

};
