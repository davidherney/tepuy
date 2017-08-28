/**
 * Namespace jpit.activities
 *
 * This namespace contain all related to the activities module
 */
jpit.activities =  {};


/**
 * Namespace jpit.modules['activities']
 *
 * module registration
 */
jpit.modules['activities'] = jpit.activities;


/**
 * Namespace jpit
 *
 * This namespace contain activity types array
 */
jpit.activities._types = [];



/**
 * Namespace jpit.activities.registerType
 *
 * This function allows register an activity type
 */
jpit.activities.registerType = function(activityType){
    var type = {};
    type.className = activityType;
    jpit.activities._types[activityType] = type;
    return type;
};

/**
 * Namespace jpit.activities.registerType
 *
 * This function allows register an activity type
 */

jpit.activities.types = function () {
    return jpit.activities._types;
};


jpit.activities.list = function(activityType){
    var list = null;
    if(activityType){
        if(jpit.activities._types[activityType]) list = jpit.activities._types[activityType].instances;
    }else{
        list = [];
        $.each(jpit.activities._types, function(key,value){
            list = list.concat(jpit.activities._types[key].instances);
        });
    }
    return list;
};
