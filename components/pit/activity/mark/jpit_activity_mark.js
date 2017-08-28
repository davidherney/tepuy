var JPIT_ACTIVITY_MARK_NAMESPACE = 'jpit.activities.mark';

/**
 * Namespace jpit.activities.mark
 *
 * This namespace contain all related to mark activity
 */
jpit.activities.mark = jpit.activities.registerType(JPIT_ACTIVITY_MARK_NAMESPACE);


/**
 * Namespace jpit.activities.mark.instances
 *
 * This array store all mark instances
 */
jpit.activities.mark.instances = [];

/**
 * Class globals
 * Namespace jpit.activities.mark
 *
 * This class persists globally some variables used in the activity
 */
jpit.activities.mark.globals = {
    "actualMark" : 0,
    "uniqueIdAnswer" : 0
};

jpit.activities.mark.toString = function(){
    return JPIT_ACTIVITY_MARK_NAMESPACE;
}; 

/**
 * Class utility
 * Namespace jpit.activities.mark
 *
 * This class contain some utility methods to encapsulate logic
 */
jpit.activities.mark.utility = {};

/**
 * Class activity
 * Namespace jpit.activities.mark
 *
 * This class have control to the questions list
 */
jpit.activities.mark.activity = function (container, type) {

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
        "correct_size" : 0,
        "type" : type, // rectangle or map.
        "getLocalId" : function () {
            return "jpit_activities_mark_" + this.id;
        },

        "processBoard" : function () {
            $container.addClass('jpit_activities_mark_board').attr('id', this.getLocalId() + '_board');

            var $img = $container.find('>img');
            $img.addClass('jpit_activities_mark_img');

            var x_init = $img.position().left;
            var y_init = $img.position().top;

            obj.correct_size = 0;

            if (this.type == 'map') {
                    $container.find('area').each(function() {
                    var $area = $(this);

                    $area.addClass("jpit_activities_mark_map");
                    $area.data('correct', ($area.attr('correct') && $area.attr('correct') == "true" ? true : false));

                    if ($area.data('correct')) {
                        obj.correct_size++;
                    }

                    $area.on('click', function (e) {
                        e.preventDefault();
                        $this_area = $(this);
                        $this_area.toggleClass('jpit_activities_mark_selected');
                        var data = $this_area.mouseout().data('maphilight') || {};
                        data.alwaysOn = !data.alwaysOn;

                        $this_area.data('maphilight', data).trigger('alwaysOn.maphilight');
                    });

                });
            }
            else {
                $container.find('area').each(function() {
                    var $area = $(this);

                    var $zone = $('<div class="jpit_activities_mark_zone"></div>');
                    $zone.css('left', x_init + parseInt($area.attr('x')) + 'px');
                    $zone.css('top', y_init + parseInt($area.attr('y')) + 'px');
                    $zone.width($area.attr('w'));
                    $zone.height($area.attr('h'));
                    $zone.data('correct', ($area.attr('correct') && $area.attr('correct') == "true" ? true : false));
                    $container.append($zone);

                    if ($zone.data('correct')) {
                        obj.correct_size++;
                    }

                    $zone.on('mouseover', function () { $(this).addClass('jpit_activities_mark_active'); });
                    $zone.on('mouseout', function () { $(this).removeClass('jpit_activities_mark_active'); });
                    $zone.on('click', function () { $(this).toggleClass('jpit_activities_mark_selected'); });

                });
            }

        },

        "disable" : function(){
            obj.container.find(".jpit_activities_mark_zone").off();
        },

        "enable" : function(){
            obj.container.find(".jpit_activities_mark_zone").each(function() {
                var $zone = $(this);

                $zone.on('mouseover', function () { $(this).addClass('jpit_activities_mark_active'); });
                $zone.on('mouseout', function () { $(this).removeClass('jpit_activities_mark_active'); });
                $zone.on('click', function () { $(this).toggleClass('jpit_activities_mark_selected'); });
            });
        },

        "restart" : function(){
            obj.container.find(".jpit_activities_mark_zone").removeClass('jpit_activities_mark_active');
        },

        "weight" : function () {
            var corrects = 0;
            var total = obj.correct_size;

            obj.container.find(".jpit_activities_mark_selected").each(function() {
                var $zone = $(this);
                if ($zone.data('correct')) {
                    corrects++;
                }
                else {
                    total++;
                }
            });

            return corrects * 100 / total;
        },

        "fullAnswered" : function () {
            return true;
        },

        "highlight" : function (classCorrect, classWrong) {
            obj.container.find(".jpit_activities_mark_zone").each(function() {
                var $zone = $(this);

                if ($zone.data('correct')) {
                    if ($zone.hasClass('jpit_activities_mark_selected')) {
                        $zone.addClass(classCorrect);
                    }
                    else {
                        $zone.addClass(classWrong);
                    }
                }
                else {
                    if ($zone.hasClass('jpit_activities_mark_selected')) {
                        $zone.addClass(classWrong);
                    }
                    else {
                        $zone.addClass(classCorrect);
                    }
                }
            });
        }
    };

    jpit.activities.mark.globals.actualMark++;
    obj.id = jpit.activities.mark.globals.actualMark;

    obj.processBoard();
    jpit.activities.mark.instances.push(obj);

    return obj;

};
