/**
 * Custom library to add custom functionality to activities in this learning object.
 *
 * @author: David Herney
 */
(function(app) {

    /**
     * To handle when an activity has been completed.
     * @param {event} event
     * @param {JQuery object} $el
     * @param {object} args
     */
    function onActivityCompleted(event, $el, args) {
        if (/idact/.test(args.id) && args.weight > 99) {
            $($el.attr('data-relation')).show();
            return;
        }
    }

    // Register application event handlers.
    $(app).on('jpit:activity:completed', onActivityCompleted);
})(dhbgApp);
