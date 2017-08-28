/**
 * Namespace jpit.resources
 *
 * This namespace contain all related to the resources module
 */
jpit.resources =  {};


/**
 * Namespace jpit.modules['resources']
 *
 * module registration
 */
jpit.modules['resources'] = jpit.resources;


/**
 * Namespace jpit
 *
 * This namespace contain resource types array
 */
jpit.resources._types = [];



/**
 * Namespace jpit.resources.registerType
 *
 * This function allows register an resource type
 */
jpit.resources.registerType = function(resourceType){
    var type = {};
    type.className = resourceType;
    jpit.resources._types[resourceType] = type;
    return type;
};

/**
 * Namespace jpit.resources.registerType
 *
 * This function allows register an resource type
 */

jpit.resources.types = function () {
    return jpit.resources._types;
};


jpit.resources.list = function(resourceType){
    var list = null;
    if(resourceType){
        if(jpit.resources._types[resourceType]) list = jpit.resources._types[resourceType].instances;
    }else{
        list = [];
        $.each(jpit.resources._types, function(key,value){
            list = list.concat(jpit.resources._types[key].instances);
        });
    }
    return list;
};
