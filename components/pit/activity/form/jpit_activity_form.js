var JPIT_ACTIVITY_FORM_NAMESPACE = 'jpit.activities.form';

/**
 * Namespace jpit.activities.form
 *
 * This namespace contain all related to form activity
 */
jpit.activities.form = jpit.activities.registerType(JPIT_ACTIVITY_FORM_NAMESPACE);


/**
 * Namespace jpit.activities.form.instances
 *
 * This array store all form instances
 */
jpit.activities.form.instances = [];

/**
 * Class globals
 * Namespace jpit.activities.form
 *
 * This class persists globally some variables used in the activity
 */
jpit.activities.form.globals = {
    "actualForm" : 0,
    "uniqueIdAnswer" : 0
};

jpit.activities.form.toString = function(){
    return JPIT_ACTIVITY_FORM_NAMESPACE;
}; 

/**
 * Class init
 * Namespace jpit.activities.form
 *
 * This class have control to the questions list
 */
jpit.activities.form.init = function (container) {

    var $container;
    var $form;

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
            return "jpit_activities_form_" + this.id;
        },

        "processBoard" : function () {
            $container.addClass('jpit_activities_form_board').attr('id', this.getLocalId() + '_board');
            $form = $('<form></form>');
            $form.append($container.children('div'));
            $container.append($form);
        },

        "disable" : function(){
            $container.find('input, textarea, button, select').attr('disabled','disabled');
        },

        "enable" : function(){
            $container.find('input, textarea, button, select').attr('disabled','false');
        },

        "restart" : function(){
            $container.find('input, textarea, button, select').val('');
        },

        "weight" : function () {
            var size = $form.find('input, textarea, button, select').length;
            var completed = 0;
            $form.find('input, textarea, button, select').each(function(){
                var val = $(this).val();
                if (val) {
                    completed++;
                }
            });

            if (size > 0) {
                return completed / size;
            }
            else {
                return 0;
            }
        },

        "fullAnswered" : function () {
            var size = $form.find('input, textarea, button, select').length;
            var completed = 0;
            $form.find('input, textarea, button, select').each(function(){
                var val = $(this).val();
                if (val) {
                    completed++;
                }
            });

            return completed == size;
        },

        "printableContent" : function () {
            var $html = $('<dl/>');
            $container.find('input, textarea, button, select').each(function(){
                var $control = $(this);
                var $dt = $('<dt/>');
                var $dd = $('<dd/>');
                if ($control.attr('ftitle')) {
                    $dt.html($control.attr('ftitle'));
                }
                else if ($control.attr('name')) {
                    $dt.html($control.attr('name'));
                }

                $dd.html($control.val().replace(/\n/g, "<br />"));
                $html.append($dt);
                $html.append($dd);
            });

            return $html;
        },

        "txtContent" : function () {
            var $html = '';
            $container.find('input, textarea, select').each(function(){
                var $control = $(this);
                $html += '►';
                if ($control.attr('ftitle')) {
                    $html += $control.attr('ftitle') + ": ";
                }
                else if ($control.attr('name')) {
                    $html += $control.attr('name') + ": ";
                }

                $html += $control.val() + "|\n";
            });

            return $html;
        },

        "serialize" : function () {
            return JSON.stringify($form.serializeArray());
        },

        "load_serialized" : function (serialized_value) {
            try {
               var values = JSON.parse(serialized_value);
            }
            catch(e) {
               return;
            }
            if (values) {
                $.each(values, function(i, field_value){
                    if (typeof field_value == 'object' && field_value.value) {
                        $form.find('[name="' + field_value.name + '"]').val(field_value.value)
                    }
                });
            }
        }

    };

    jpit.activities.form.globals.actualForm++;
    obj.id = jpit.activities.form.globals.actualForm;

    obj.processBoard();
    jpit.activities.form.instances.push(obj);

    return obj;

};
