'use strict';

/**
 * Namespace jpit.resources.movi
 *
 * This namespace contain all related to word puzzle game*/
jpit.resources.movi = jpit.resources.registerType('jpit.resources.movi');


/**
 * Namespace jpit.resources.movi.instances
 *
 * This array store all movi instances
 */
jpit.resources.movi.instances = [];


jpit.resources.movi.toString = function(){    
    return 'jpit.resources.movi';
}; 

jpit.resources.movi.currentMovi = null;

jpit.resources.movi.movies = {};

jpit.resources.movi.movies.actions = {};

jpit.resources.movi.createMovi = function(obj, main_movi, parent_movi){

    var $layers = Object.prototype.toString.call(obj) == '[object Array]' ? obj : [obj];
    var $layer = $layers[0];
    $layers.splice(0, 1);
    
    /***if (!$layer) {
        return null;
    }*/

    console.log('Running movi: ' + $layer.attr('data-name'));

    var duration = $layer.attr('data-duration') ? parseInt($layer.attr('data-duration')) : 2000;
    var effect = $layer.attr('data-effect') ? $layer.attr('data-effect') : 'fade';
    var sleep = $layer.attr('data-sleep') ? $layer.attr('data-sleep') : 0;
    
    var options = {};
    
    var movi;
    if ($layer.attr('data-movi-base')) {
        movi = jpit.resources.movi.movies[$layer.attr('data-movi-base')];
        movi.element = $layer;
        movi.tail = $layers ? $layers : [];
        movi.sleep = sleep;
        movi.main_movi = main_movi;
        movi.parent = parent_movi;
    }
    else {
        movi = {
            "element": $layer,
            "type": $layer.attr('data-movi-type'),
            "options" :  options,
            "duration" : duration,
            "effect": effect,
            "events": {},
            "tail" : $layers ? $layers : [],
            "sleep": sleep,
            "main_movi": main_movi,
            "parent": parent_movi
        };
    }

    if ($layer.attr('data-event-on-end')) {
        movi.events.end = jpit.resources.movi.movies.actions[$layer.attr('data-event-on-end')];
    }

    if ($layer.attr('data-event-on-start')) {
        movi.events.start = jpit.resources.movi.movies.actions[$layer.attr('data-event-on-start')];
    }

    if ($layer.attr('data-event-on-init')) {
        movi.events.init = jpit.resources.movi.movies.actions[$layer.attr('data-event-on-init')];
    }

    return movi;

};

jpit.resources.movi.processMovi = function(movi) {

    jpit.resources.movi.currentMovi = movi;

    if (movi.events && movi.events.start) {
        movi.events.start(movi);
    }

    switch(movi.type) {
        case "move":
            movi.element.animate(movi.options, movi.duration, movi.effect, function() {
                jpit.resources.movi.endMoviEffect(movi);
            });
            break;
        case "stop":
            break;
        case 'show':
            if (movi.duration > 0) {
                movi.element.show(movi.effect, movi.options, movi.duration, function () {
                    jpit.resources.movi.endMoviEffect(movi);
                });
            }
            else {
                movi.element.show();
                jpit.resources.movi.endMoviEffect(movi);
            }
            break;
        case 'cycle':
            var current_cycle = movi.element.data('repetitions') ? movi.element.data('repetitions') : 1;
            if (movi.options.repeat == 'infinity' || current_cycle < movi.options.repeat) {
                movi.element.data('repetitions', current_cycle + 1);

                movi.element.find('[data-movi-type]').each(function() {
                    var $layer = $(this);
                    jpit.resources.movi.processMoviLayer($layer);
                });

                movi.element.fadeOut(movi.duration, function() { 
                    var cycle_movi = jpit.resources.movi.createMovi(movi.element, movi.main_movi, movi.parent);
                    jpit.resources.movi.processMovi(cycle_movi);
                });
            }
            break;
    }
};

jpit.resources.movi.processMoviLayer = function($layer, effect, options, duration) {
    switch($layer.attr('data-movi-type')) {
        case 'show':
            $layer.hide();
            break;
    }
};

jpit.resources.movi.readMoviSequence = function($container, parent_movi) {
    var tail = [];

    $container.find('>[data-movi-type]').each(function() {
        tail[tail.length] = $(this);
    });

    if (tail.length > 0) {

        var main_movi = $container;
        if (parent_movi !== null && parent_movi.main_movi) {
            main_movi = parent_movi.main_movi;
        }

        var m = jpit.resources.movi.createMovi(tail, main_movi, parent_movi);
        m.parent = parent_movi;

        if (parent_movi == null && m.events.init) {
            m.events.init(m);
        }

        jpit.resources.movi.processMovi(m);
        return true;
    }

    return false;
};

jpit.resources.movi.endMoviEffect = function(movi) {

    var code = function () {
        if (jpit.resources.movi.currentMovi == null) {
            return;
        }

        if (movi.events && movi.events.end) {
            movi.events.end(movi);
        }

        if (movi.element.attr('data-movi-on-end')) {
            var next_movi;
            if(next_movi = jpit.resources.movi.movies[movi.element.attr('data-movi-on-end')]) {

                next_movi.element = $(next_movi.selector);
                jpit.resources.movi.processMovi(next_movi);
            }
        }
        else {

            if (!jpit.resources.movi.readMoviSequence(movi.element, movi)) {
                var m = null;
                if (movi.tail.length > 0) {
                    m = jpit.resources.movi.createMovi(movi.tail, movi.main_movi, movi.parent);
                }
                else if (movi.parent) {
                    var m_tmp = movi;
                    while(m_tmp.parent && m_tmp.parent.tail.length == 0) {

                        m_tmp = m_tmp.parent;

                        if (m_tmp.main_movi.attr('data-movi-sequence') && m_tmp.main_movi.attr('data-movi-sequence') == 'hide') {
                            m_tmp.element.hide();
                        }
                    }

                    if (m_tmp.parent) {
                        m = jpit.resources.movi.createMovi(m_tmp.parent.tail, m_tmp.parent.main_movi, m_tmp.parent.parent);

                        if (m_tmp.parent.main_movi.attr('data-movi-sequence') && m_tmp.parent.main_movi.attr('data-movi-sequence') == 'hide') {
                            m_tmp.parent.element.hide();
                        }
                    }
                }

                if (m) {
                    if (movi.main_movi.attr('data-movi-sequence') && movi.main_movi.attr('data-movi-sequence') == 'hide') {
                        movi.element.hide();
                    }

                    jpit.resources.movi.processMovi(m);
                }
            }
        }

    }

    if (movi.sleep) {
        setTimeout(code, movi.sleep);
    }
    else {
        code();
    }
};
