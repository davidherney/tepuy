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
            $dragEl.css({ opacity: '' });
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
            $el.removeClass(DROPPEDCLASS).appendTo($el.data('_parent'));
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
    * shuffle jquery elements (possibly not in the same parent)
    */
    function shuffleElements(elements) {
        var shuffled = [], pos = [], i = elements.length, k1, k2;
        //Start in current positions
        while(i--) shuffled[i] = pos[i] = i;
        i = shuffled.length;
        //Shuffled positions
        while(i--) {
            k1 = Math.floor(Math.random() * i);
            k2 = shuffled[k1];
            shuffled[k1] = shuffled[i];
            shuffled[i] = k2;
            elements[i].data('pos', i);
        }
        
        //Shift elements position
        var $tmp = $('<i/>');
        i = shuffled.length;
        while(i--) {
            k1 = pos[shuffled[i]];
            $tmp.insertBefore(elements[i]);
            elements[i].insertBefore(elements[k1]);
            elements[k1].insertBefore($tmp);
            k2 = elements[i].data('pos');
            pos[k2] = k1;
            pos[shuffled[i]] = i;
            elements[k1].data('pos', k2);
            elements[i].data('pos', i);
        }
        //Clear helper element
        $tmp.remove();
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
    * moveDraggableTo
    */
    function moveDraggableOut($dragEl, $dropzone, event) {
        $parent = $dragEl.data('_parent');
        var epos = $dragEl.position();
        var pos = $dragEl.data('_dragpos') || { x: 0, y: 0 };
        var rect = $dragEl[0].getBoundingClientRect();
        $dragEl.appendTo($parent);
        setTimeout(function() {
            var rect1 = $dragEl[0].getBoundingClientRect();
            pos.x += rect.x - rect1.x;
            pos.y += rect.y - rect1.y;
            $dragEl.css(transformProp, `translate(${pos.x}, ${pos.y})`);
            $dragEl.data('_dragpos', pos);
            if ($dragEl.data('_useInner')) {
                $dropzone.empty().html($dropzone.data('_html'));
            }
        }, 10);
    }

    /**
    * onDropListener
    */
    function onDropListener(event, options) {
        var $dropzone = $(event.target),
            $dragEl = $(event.relatedTarget),
            dropzoneId = $dropzone.attr('id'),
            dragId = event.relatedTarget.id;

        //Check if the dropzone can accept more elements
        if(options.multiTarget > 0 && !($dropzone.data('droppedElements').length < options.multiTarget)) {
            resetPosition($dragEl);
            return; //Do not allow more elements
        }

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

        moveDraggableOut($dragEl, $dropzone, event);

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
            })
            .on('hold', function(event){
                droppable.$container.data('selectable').show(event);
            }));

            if (options.dropInnerContent && options.innerContentHelper) {
                $target.html(options.innerContentHelper);
            }
        });
    }
    /**
    * createSelectable
    */
    function createSelectable(droppable) {
        var template = [
            '<div class="jpitdroppable_select">',
            '<div class="jpitdroppable_select_list"></div>',
            '<div class="jpitdroppable_select_buttons"></div>',
            '</div>'
        ].join('');
        $list = $(template);
        var $list_options = $list.find('.jpitdroppable_select_list');
        $.each(droppable.origins, function(idx, $origin){
            var $item = $('<div class="jpitdroppable_select_list_item"></div>');
            $item.append($origin.clone()).appendTo($list_options);
            $item.data('origin', $origin);
        });
        var multiTarget = droppable.properties.multiTarget;
        $list_options.on('click', '.jpitdroppable_select_list_item', function () {
            var $item = $(this);
            var is_selected = $item.is('.selected');
            var selected = $list_options.children('.selected');
            if (!is_selected && multiTarget > 1 && selected >= multiTarget) return; //Cannot be selected
            if (!is_selected && multiTarget == 1) {
                $list_options.children().removeClass('selected');
            }
            $item.toggleClass('selected');
        })
        var selectable = Selectable($list_options, droppable);
        droppable.$container.data('selectable', selectable);
    }

    /**
    * Selectable
    */
    function Selectable($list, droppable) {
        var $dropzone;
        var options = {
                autoResolve: droppable.properties.autoResolve,
                pairs: droppable.pairs,
                multiTarget: droppable.properties.multiTarget,
                autoAlignNodes: droppable.properties.autoAlignNodes,
                dropCallback: droppable.properties.onDrop,
                overlap: validateOverlap(droppable.properties.overlap, 0.25),
                dropInnerContent: droppable.properties.dropInnerContent,
                innerContentHelper: droppable.properties.innerContentHelper
            };
        $list.appendTo(droppable.$container).dialog({
            modal: true,
            autoOpen: false,
            dialogClass: 'jpitdroppable_select_dialog ' + (droppable.$container.attr('id') || ''),
            resizable: false,
            buttons: [{
                    text: 'Cancelar',
                    click: function() {
                        $(this).dialog('close');
                    }
                }, {
                    text: 'Aceptar',
                    click: function() {
                        acceptChanges();
                        $(this).dialog('close');
                    }
                }
            ]
        });

        var dialog = $list.dialog('instance');
        var show = function(event){
            if (droppable.disabled) return; //Activity is disabled

            $dropzone = $(event.target);
            //Mark the selected items
            $list.children('.jpitdroppable_select_list_item').removeClass('selected dropped').each(function(idx, it) {
                var $item = $(it);
                var $origin = $item.data('origin');
                if ($dropzone.has($origin.get(0)).length) $item.addClass('selected');
                else if ($origin.is('.'+DROPPEDCLASS)) $item.addClass('dropped');
            });
            //Open the dialog
            dialog.open();
        };

        var acceptChanges = function () {
            //Remove current items in the $dropzone
            $dropzone.find('.'+DROPPEDCLASS).each(function(idx, it) {
                onDragLeaveListener({
                    target: $dropzone.get(0),
                    relatedTarget: it
                }, options);
                //resetPosition($(it), true);
            })
            //Get Items selected
            $list.children('.jpitdroppable_select_list_item.selected').each(function(idx, it) {
                var $item = $(it);
                var $origin = $item.data('origin');
                if ($item.is('.dropped')) {
                    onDragLeaveListener({
                        target: $origin.closest('.droppable').get(0),
                        relatedTarget: $origin.get(0)
                    }, options);
                }
                onDropListener({
                    target: $dropzone.get(0),
                    relatedTarget: $origin.get(0)
                }, options);
            });
        }
        
        return {
            show: show
        };
    }

    function Droppable(properties, origins, targets, pairs) {
        var obj = {
            "properties" : null,
            "origins" : null,
            "targets" : null,
            "pairs" : null,
            "$container": null,
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
                var $container = null;
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
                    $container = $container || $val.closest(CONTAINERSELECTOR);
                });
                obj.properties.shuffle = $container && !($container.attr('data-shuffle') === 'false');
                obj.properties.overlap = $container && $container.attr('data-dragoverlap');
                obj.properties.dropInnerContent = $container && $container.attr('data-droppable-content-inner');
                obj.properties.innerContentHelper = $container && $container.attr('data-droppable-content-helper');
                obj.$container = $container;
                /* Origins Draggables*/
                if (obj.properties.shuffle) shuffleElements(obj.origins);
                createDraggables(obj.origins);
                /* Targets Droppables */
                createDropZones(obj);
                createSelectable(obj);
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
                obj.disabled = true;
            },
            "enable" : function (){
                $.each( obj.origins, function (ind, $val) {
                    setDraggableEnabled($val, true);
                    $val.removeClass('disabled');
                });
                delete obj.disabled;
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


