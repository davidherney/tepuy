'use strict';

/**
 * Namespace jpit.resources.zoom
 *
 * This namespace contain all related to Zoom resource*/
jpit.resources.zoom = jpit.resources.registerType('jpit.resources.zoom');


/**
 * Namespace jpit.resources.zoom.instances
 *
 * This array store all zoom instances
 */
jpit.resources.zoom.instances = [];

/**
 * Class globals
 * Namespace jpit.resources.zoom
 *
 * This class persists globally some variables used in the resource
 */
jpit.resources.zoom.globals = {
    "actualZoom" : 0
};

jpit.resources.zoom.toString = function(){    
    return 'jpit.resources.zoom';
}; 


/**
 * Based on: http://www.jsclasses.org/package/419-JavaScript-Create-a-magnifying-glass-look-over-an-image.html
 * Code by: Jackson Knowlton
 *
 */
jpit.resources.zoom.createZoom = function(element, magnification, magnifier_size){

    var $container;
    var $magnify;

    if (typeof element == 'object') {
        $container = element;
    }
    else {
        $container = $(element);
    }

    if(!($container.is('img'))) {
      console.log('Object must be image.');
    }
    
    if (!magnification) {
        magnification = 2;
    }

    if (!magnifier_size) {
        magnifier_size = "100px";
    }

    var obj = {
        "id" : 0,
        "container" : $container,
        "correct_size" : 0,
        "magnification": magnification,
        "magnifier_size": magnifier_size,
        "getLocalId" : function () {
            return "jpit_resources_zoom_" + this.id;
        },
        "init": function() {
            
            $container.hover(function() {
                var $this = $(this);
                $this.css('cursor', 'none');
                $magnify.show();
                //Setting some variables for later use
                var width = $this.width();
                var height = $this.height();
                var src = $this.attr('src');
                var imagePos = $this.offset();
                var image = $this;

                if (obj.magnifier_size == undefined) {
                    obj.magnifier_size = '150px';
                }

                $magnify.css({
                    'background-size': width * obj.magnification + 'px ' + height * obj.magnification + "px",
                    'background-image': 'url("' + src + '")',
                    'width': obj.magnifier_size,
                    'height': obj.magnifier_size
                });

                //Setting a few more...
                var magnifyOffset = +($magnify.width() / 2);
                var rightSide = +(imagePos.left + $this.width());
                var bottomSide = +(imagePos.top + $this.height());

                $(document).mousemove(function(e) {
                    if (e.pageX < +(imagePos.left - magnifyOffset / 6) || e.pageX > +(rightSide + magnifyOffset / 6) || e.pageY < +(imagePos.top - magnifyOffset / 6) || e.pageY > +(bottomSide + magnifyOffset / 6)) {
                        $magnify.hide();
                        $(document).unbind('mousemove');
                    }
                    var backgroundPos = "" - ((e.pageX - imagePos.left) * obj.magnification - magnifyOffset) + "px " + -((e.pageY - imagePos.top) * obj.magnification - magnifyOffset) + "px";
                    $magnify.css({
                        'left': e.pageX - magnifyOffset,
                        'top': e.pageY - magnifyOffset,
                        'background-position': backgroundPos
                    });
                });
                }, function() {
            });
        }

    };

    jpit.resources.zoom.globals.actualZoom++;
    obj.id = jpit.resources.zoom.globals.actualZoom;

    obj.init();
    jpit.resources.zoom.instances.push(obj);
    
    if ($('#jpit_resources_zoom_magnify').length == 0) {
        $magnify = $('<div id="jpit_resources_zoom_magnify"></div>');
        $('body').prepend($magnify);
    }
    else {
        $magnify = $('#jpit_resources_zoom_magnify');
    }
    
    return obj;

};

