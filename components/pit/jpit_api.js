/**
 * Namespace jpit
 *
 * This namespace contain all related to the jpit api & modules
 */
var jpit = {};

/**
 * Namespace jpit.modules
 *
 * This namespace contain modules array
 */

jpit.modules = [];

/**
 * Namespace hasModule
 *
 * This function provides information about whether jpit contains a especific module
 */
jpit.hasModule = function(moduleName){
    var hasModule = false;
    if(jpit.modules[moduleName]) hasModule = true;
    return hasModule;
};
