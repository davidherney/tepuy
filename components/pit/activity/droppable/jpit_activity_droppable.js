
(function(jpit){
    var transformProp;
    var DROPPEDCLASS = "jpit_activities_jpitdroppable_dropped";
    var CONTAINERSELECTOR = ".jpit-activities-droppable";
    /**
    * dragStartListener
    */
    function dragStartListener(event) {
        var $dragEl = $(event.target);
        $dragEl.addClass('jpit_activities_jpitdroppable_dragstart');
        if ($dragEl.data('_useInner')) {
            $dragEl.css({
                opacity: ''
            });
        }
    }

    /**
    * dragEndListener
    */
    function dragEndListener(event) {
        var $target = $(event.target);
        $target.removeClass('jpit_activities_jpitdroppable_dragstart');
        if (!event.relatedTarget) {
            resetPosition($target);
        }
    }

    /**
    * dragMoveListener
    */
    function dragMoveListener(event) {
        var $target = $(event.target),
            pos = $target.data('_dragpos') || { x: 0, y: 0 };

        pos.x += event.dx;
        pos.y += event.dy;
        $target.css(transformProp, `translate(${pos.x}px, ${pos.y}px)`);
        $target.data('_dragpos', pos);
    }
    /**
    * resetPosition
    */
    function resetPosition($el, hard=false) {
        var position = $el.data('_iposition');
        $el.css({
            position: position.position,
            top: position.top,
            left: position.left
        })
        .css(transformProp, 'translate(0px, 0px)')
        .removeData('_dragpos');
        if (hard) {
            var $parent = $el.parent();
            $el.appendTo($el.data('_parent'));
            if ($el.data('_useInner')) {
                $el.removeData('_useInner');
                $el.css({ width: '', height: '', opacity: '' });
                var phtml = $parent.data('_html');
                if (phtml) {
                    $parent.empty().html(phtml);
                }
            }
        }
        return $el;
    }
    /**
    * resetPositions
    */
    function resetPositions(elements){
        $.each(elements, function(key, el){
            resetPosition($(el).removeClass(DROPPEDCLASS), true);
        });
    }
    /**
    * setDroppableEnabled
    */
    function setDroppableEnabled(droppable, state) {
        droppable.data('_interact').dropzone(state);
    }

    /**
    * setDraggableEnabled
    */
    function setDraggableEnabled(draggable, state){
        draggable.data('_interact').draggable(state);
    }

    /**
    * destroyDraggable
    */
    function destroyDraggable($element) {
        $element.data('_interact').unset();
        $element.removeData('_interact');
    }

    /**
    * destroyDroppable
    */
    function destroyDroppable($element) {
        $element.data('_interact').unset();
        $element.removeData('_interact');
    }

    /**
    * createDraggables
    */
    function createDraggables(elements) {
        //console.log(obj.properties.draggableContainer);
        ////zIndex: 3,
        $.each(elements, function(index, $el) {
            $el.data('_interact', interact($el[0]).draggable({
                origin: '',
                intertia: true,
                restrict: {
                    restriction: CONTAINERSELECTOR,
                    endOnly: false,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },
                modifiers: [],
                autoScroll: true,
                onstart: dragStartListener,
                onmove: dragMoveListener,
                onend: dragEndListener,
            }));
            $el.data('_parent', $el.parent());
        });
    }

    /**
    * moveDraggableTo
    */
    function moveDraggableTo($dragEl, $dropzone, useInnerContent) {
        var dropzoneSize = {};
        if (useInnerContent) {
            $dropzone.data('_html', $dropzone.html());
            $dropzone.empty();
            $dropzone.html($dragEl.html());
            dropzoneSize.width = $dropzone.width();
            dropzoneSize.height = $dropzone.height();
        }
        $dragEl.appendTo($dropzone);
        $dragEl.css(transformProp, 'translate(0, 0)');
        $dragEl.removeData('_dragpos');
        if (useInnerContent) {
            $dragEl.data('_useInner', true);
            $dragEl.css({
                position: 'absolute',
                top: 0,
                left: 0,
                width: dropzoneSize.width,
                height: dropzoneSize.height,
                opacity: 0
            });
        }
    }

    /**
    * moveDraggableOut
    */
    function moveDraggableOut($dragEl, $dropzone, useInnerContent) {
        $parent = $dragEl.data('_parent');
        var epos = $dragEl.position();
        var pos = $dragEl.data('_dragpos');
        $dragEl.appendTo($parent);
        var newpos = $dragEl.position();
        pos.x += epos.left - newpos.left;
        pos.y += epos.top - newpos.top;
        $dragEl.css(transformProp, `translate(${pos.x}, ${pos.y})`);
        $dragEl.data('_dragpos', pos);
        if ($dragEl.data('_useInner')) {
            $dropzone.empty().html($dropzone.data('_html'));
        }
    }

    /**
    * onDropListener
    */
    function onDropListener(event, options) {
        var $dropzone = $(event.target),
            $dragEl = $(event.relatedTarget),
            dropzoneId = $dropzone.attr('id'),
            dragId = event.relatedTarget.id;

        if (options.autoResolve){
            var matched = false;

            $.each(options.pairs, function(idx, pair) {
                return !(matched = (pair.target.attr('id') == dropzoneId && pair.origin.attr('id') == dragId)); //if a match is found stop the loop
            });

            if (!matched) {
                resetPosition($dragEl);
                return;
            }
        }

        //Move object into dropzone
        moveDraggableTo($dragEl, $dropzone, options.dropInnerContent);

        if(options.multiTarget == 0 || $dropzone.data('droppedElements').length < options.multiTarget){
            if($.inArray(dragId ,$dropzone.data('droppedElements'))>-1) {
                if(options.autoAlignNodes){
                    $dragEl.position({ of: $dropzone });
                }
                return;
            }
            // Some dropp in ? -> check pairs and update match value
            $.each(options.pairs, function (idx, pair) {
                if (dragId == pair.origin.attr('id')) {
                    pair.match = ($dropzone.attr('id') == pair.target.attr('id'));
                    return false; //stop loop
                }
            });
            if(options.autoAlignNodes){
                $dragEl.position({ of: $dropzone });
            }
            $dragEl.addClass(DROPPEDCLASS);
            $dropzone.data('droppedElements').push(dragId);
        }
        else{
            if($.inArray(dragId ,$dropzone.data('droppedElements'))>-1) {
                if(options.autoAlignNodes){
                    $dragEl.position({ of: $dropzone });
                }
                return;
            }
            resetPosition($dragEl);
        }
        if (options.dropCallback) {
            options.dropCallback.call($dropzone, $dragEl);
        }
    }

    /**
    * onDragLeaveListener
    */
    function onDragLeaveListener(event, options) {
        // Some dropp out? -> check pairs and update match value
        var $dropzone = $(event.target),
            $dragEl = $(event.relatedTarget),
            dragId = $dragEl.attr('id');

        if (!$dragEl.hasClass(DROPPEDCLASS)) return;

        moveDraggableOut($dragEl, $dropzone);

        $.each(options.pairs, function (idx, pair) {
            if (dragId == pair.origin.attr('id') && $dropzone.attr('id') == pair.target.attr('id')) {
                pair.match = false;
                return false; //Stop the loop
            }
        });
        $dragEl.removeClass(DROPPEDCLASS);
        $dropzone.data('droppedElements', $.grep($dropzone.data('droppedElements'), function(val) {
            return val != dragId;
        }));

        if (options.dropCallback) {
            options.dropCallback.call($dropzone, $dragEl);
        }
    }

    function validateOverlap(overlap, defaultValue) {
        if (overlap != 'pointer' && overlap != 'center') {
            overlap = parseFloat(overlap);
            if (isNaN(overlap) || overlap < 0 || overlap > 1) overlap = defaultValue;
        }
        return overlap;
    }

    /**
    * createDropZones
    */
    function createDropZones(droppable) {
        var targets = droppable.targets,
            options = {
                autoResolve: droppable.properties.autoResolve,
                pairs: droppable.pairs,
                multiTarget: droppable.properties.multiTarget,
                autoAlignNodes: droppable.properties.autoAlignNodes,
                dropCallback: droppable.properties.onDrop,
                overlap: validateOverlap(droppable.properties.overlap, 0.25),
                dropInnerContent: droppable.properties.dropInnerContent,
                innerContentHelper: droppable.properties.innerContentHelper
            };

        $.each(targets, function(index, $target) {
            $target.data('droppedElements', new Array());
            $target.data('_interact', interact($target[0]).dropzone({
                overlap: validateOverlap($target.attr('data-dragoverlap'), options.overlap),
                ondrop: function(event) {
                    onDropListener(event, options);
                },
                ondragleave: function(event) {
                    onDragLeaveListener(event, options);
                }
            }));

            if (options.dropInnerContent && options.innerContentHelper) {
                $target.html(options.innerContentHelper);
            }
        });
    }

    function Droppable(properties, origins, targets, pairs) {
        var obj = {
            "properties" : null,
            "origins" : null,
            "targets" : null,
            "pairs" : null,
            "getLocalId" : function () {
                return "jpit_activities_jpitdroppable_" + this.id;
            },
            "printBoard" : function (id_container) {
                var node = this.getNodeBoard();
            },
            "getNodeBoard" : function () {
                var parent = this;
                var continueResolve = false;
                var holdCorrects = false;
                var container = null;
                var overlap;
                /*Properties*/
                continueResolve = obj.properties.continueResolve;
                holdCorrects = obj.properties.holdCorrects;
                /*Initialice Pair Matched*/
                $.each(obj.pairs, function (ind,val) {
                    pairs[ind].match = false;
                });
                /*Save Original Origins Position Coords*/
                $.each(obj.origins, function (ind,val) {
                    var $val = $(this);
                    $val.data('_iposition', {
                        left : $val.css("left"),
                        top : $val.css("top"),
                        position:$val.css("position")
                    });
                    container = container || $val.closest(CONTAINERSELECTOR);
                });
                /* Origins Draggables*/
                createDraggables(obj.origins);
                /* Targets Droppables */
                obj.properties.overlap = container && container.attr('data-dragoverlap');
                obj.properties.dropInnerContent = container && container.attr('data-droppable-content-inner');
                obj.properties.innerContentHelper = container && container.attr('data-droppable-content-helper');
                createDropZones(obj);
                return this;
            },
            /*Getters & Counts Methods*/
            "countAnswered" : function () {
                var response = 0;
                $.each(this.targets, function (index, $val) {
                    if ($val.data('droppedElements').length > 0) {
                        response++;
                    }
                });
                return response;
            },
            "countRealTargets" : function () {
                var response = [];
                $.each(obj.pairs, function (index, pair) {
                    if($.inArray( pair.target.attr('id'), response) < 0) {
                        response.push(pair.target.attr('id'));
                    }
                });

                return response.length;
            },
            "countFullAnswered" : function () {
                var response = 0;
                $.each(this.targets, function (index, $val) {
                    response += $val.data('droppedElements').length;
                });
                return response;
            },
            "countObjects" : function(isCorrect){
                var response = 0;
                $.each( obj.pairs, function (ind,val) {
                    if( obj.pairs[ind].match == isCorrect) response++;
                });
                return response;
            },
            "countCorrect": function(){
                return obj.countObjects(true);
            },
            "getObjects" : function (isCorrect){
                var response = new Array();
                var index = 0;
                $.each( obj.pairs, function (ind,val) {
                    if( obj.pairs[ind].match == isCorrect) {
                        response[index] = {
                            o: obj.pairs[ind].origin,
                            t: obj.pairs[ind].target
                        };
                        index++;
                    }
                });
                return response; // return array with jSon Objects
            },
            "disable" : function (){
                $.each( obj.origins, function (ind, $val) {
                    setDraggableEnabled($val, false);
                    $val.addClass('disabled');
                });
            },
            "enable" : function (){
                $.each( obj.origins, function (ind, $val) {
                    setDraggableEnabled($val, true);
                    $val.removeClass('disabled');
                });
            },
            "getCorrects" : function (){
                return obj.getObjects(true);
            },
            "countMistakes" : function (){
                //return ( obj.pairs.length - obj.countObjects(true));
                if (obj.properties.multiTarget == 0) {
                    return obj.pairs.length - obj.countObjects(true);
                }
                else {
                    return ((obj.targets.length * obj.properties.multiTarget) - obj.countObjects(true));
                }
            },
            "getMistakes" : function (){
                return obj.getObjects(false);
            },
            "countTargets" : function (){
                return obj.targets.length;
            },
            /*Solve Stage*/
            "solveStage" : function(){
                this.countMistakes();
                /* Hold Corrects */
                if(properties.holdCorrects){
                    $.each(obj.pairs, function (ind, pair) {
                        if(obj.pairs[ind].match) {
                            setDraggableEnabled(obj.pairs[ind].origin, false); // hold correct matched
                        }
                    });
                }
                /* Continue Solving*/
                if(!properties.continueResolve){
                    $.each(obj.origins, function (ind, $val) {
                        setDraggableEnabled($val, false);
                    });
                    if (!properties.autoResolve) {
                        $.each(obj.targets, function (index, $val) {
                            setDroppableEnabled($val, false); // disable targets droppable property
                        });
                    }
                    else{
                        $.each(obj.pairs, function (index, val) {
                            setDroppableEnabled(val.target, false); // disable targets droppable property
                        });
                    }
                }
                return true;
            },
            /*Stage Methods*/
            "resetStage" : function() {
                //Reset Positions
                resetPositions(obj.origins);

                /*Destroy the dragable elements*/
                $.each(obj.origins, function (index, $val) {
                    destroyDraggable($val);
                    $val.removeClass('disabled');
                });

                /*Destroy the dropppable elements*/
                if (!properties.autoResolve) {
                    $.each(obj.targets, function (index, $val) {
                        destroyDroppable($val);
                    });
                }else{
                    $.each(obj.pairs, function (index, val) {
                        destroyDroppable(val.target);
                    });
                }
                obj.printBoard();
                return true;
            },
            "isComplete" : function () {
                if (this.countAnswered() < obj.targets.length) {
                    return false;
                }
                return true;
            },
            "isFullComplete" : function () {
                if (this.countFullAnswered() < obj.pairs.length) {
                    return false;
                }
                return true;
            },
            "getAnonymousFunction" : function(name) {
                switch (name) {
                    default:
                        break;
                }
            },
            "getSolvedDroppableDetails" : function(){
                var response = {
                    "final_html":escape($("#"+this.draggableContainer).html())
                    };
                return response;
            },
            "countRealOrigins" : function(){
                var origins = [];
                $.each(obj.pairs, function(index, val){
                    if($.inArray(val.origin.attr('id'), origins) < 0 ){
                        origins.push(val.origin.attr('id'));
                    }
                });
                return origins.length;
            },
            "getDroppableTargetNodes" : function(){
                var targets = [];
                $.each(obj.pairs,function(index, pair){
                    if($.inArray(pair.target.attr('id'), targets) < 0){
                        targets.push(pair.target.attr('id'));
                    }
                });
                return targets;
            },
            "existAllSolvedPairs" : function(){
                var response = true;
                $.each( obj.targets, function (index, $val) {
                    $.each($val.data('droppedElements'), function(ind, val){
                        var existMatch = false;
                        $.each(obj.pairs, function(i, v){
                            if( ( val == v.origin.attr('id') ) && ($val.attr('id') = v.target.attr('id'))){
                                existMatch = true;
                            }
                        });
                        if(!existMatch){
                            response = false;
                        }
                    });
                });
                return response;
            },
            "checkPairs" : function(check_all){
                var  response = false;
                if(check_all){ // All
                    var count = 0;
                    $.each(obj.pairs,function(index, pair){
                        if($.inArray(pair.origin.attr('id'), pair.target.data('droppedElements'))>=0){
                            count++;
                        }
                    });
                    if(count ==  this.countRealOrigins()){
                        response = true;
                    }
                }
                else{ // At least one
                    response = true;
                    var targets = this.getDroppableTargetNodes();
                    var atLeastOne = {};
                    $.each(targets,function(index, $val){
                        atLeastOne[$val.attr('id')] = false;
                        $.each($val.data('droppedElements'),function(ind,val){
                            var exist = false;
                            $.each(obj.pairs,function(i,v){
                                if(v.origin.attr('id') == val && v.target.attr('id') == $val.attr('id') ){
                                    exist = true;
                                }
                            });
                            if(exist){
                                atLeastOne[$val.attr('id')]  = true;
                            }
                        });
                    });
                    $.each(atLeastOne, function(key, lo) {
                        if(!lo) response = false;
                    });
                }
                return response;
            },
            "isCorrectAnswered":function(){
                if(!this.existAllSolvedPairs()) return false;
                var response = false;
                if(obj.properties.required_all_pairs){
                    if(this.checkPairs(true)) response = true;
                }else{
                    if(this.checkPairs(false)) response = true;
                }
                return response;
            }
        };
        properties = $.extend({
            autoResolve : false,
            continueResolve : false,
            holdCorrects : false,
            originDroppedClass: null,
            targetDroppedClass: null,
            autoAlignNodes: false,
            multiTarget: 1,
            requiredAll: true,
            required_all_pairs : false,
            draggableContainer: 'parent'
        }, properties);
        /* Placing into the 'Object' instance the board arguments */
        obj.properties = properties;
        obj.origins = origins;
        obj.targets = targets;
        obj.pairs = pairs;
        obj.parentNodes = null;
        obj.printBoard();

        jpit.activities.droppable.instances.push(obj);
        return obj;
    }

    /**
    * Namespace jpit.activities.droppable
    *
    */
    jpit.activities.droppable = jpit.activities.registerType('jpit.activities.droppable');
    $.extend(jpit.activities.droppable, {
        toString: function () {
            return 'jpit.activities.droppable';
        },
        board: Droppable
    });

    /**
     * Namespace jpit.activities.droppable.instances
     *
     * This array store all droppable instances
     */
    jpit.activities.droppable.instances = [];
    interact.maxInteractions(Infinity);
    $(document).ready(function () {
        transformProp =
            'transform' in document.body.style ? 'transform' :
            'webkitTransform' in document.body.style ? 'webkitTransform' :
            'mozTransform' in document.body.style ? 'mozTransform' :
            'oTransform' in document.body.style ? 'oTransform' :
            'msTransform' in document.body.style ? 'msTransform' : null;
    });
})(jpit, interact);


