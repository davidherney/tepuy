/**
* Namespace jpit.activities.droppable
*
*/
jpit.activities.droppable = jpit.activities.registerType('jpit.activities.droppable');


/**
 * Namespace jpit.activities.droppable.instances
 *
 * This array store all droppable instances
 */
jpit.activities.droppable.instances = [];


jpit.activities.droppable.toString = function(){
    return 'jpit.activities.droppable';
}; 


jpit.activities.droppable.board = function (properties, origins, targets, pairs) {
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
            var initialPositions = new Array();
            /*Properties*/
            continueResolve = obj.properties.continueResolve;
            holdCorrects = obj.properties.holdCorrects;
            /*Initialice Pair Matched*/
            $.each( obj.pairs, function (ind,val) {
                pairs[ind].match = false;
            });
            /*Save Original Origins Position Coords*/
            var auxIndex = 0;
            $.each( obj.origins, function (ind,val) {
                var $val = $(this);
                initialPositions[auxIndex] = {
                    _id : $val.attr('id'),
                    _left : $val.css("left"),
                    _top : $val.css("top"),
                    _position:$val.css("position")
                }
                auxIndex++;
            });
            obj.properties.initialPositions = initialPositions;

            /* Origins Draggables*/
            $.each(obj.origins, function (index, $val) {

                $val.draggable({
                    containment: obj.properties.draggableContainer,
                    zIndex: 3,
                    start: function(event, ui) {
                        $(this).addClass('jpit_activities_jpitdroppable_dragstart');
                    },
                    stop: function(event, ui) {
                        $(this).removeClass('jpit_activities_jpitdroppable_dragstart');
                    }
                });
                obj.parentNodes = $val.parent()
            });
            /* Targets Droppables */
            $.each(obj.targets, function (index, $val) {
                $val.data('droppedElements', new Array());
                $val.droppable({
                    drop: function( event, ui ) {
                        var target = $(this);
                        var target_id = target.attr("id");

                        if(obj.properties.autoResolve){
                            var matched = false;

                            $.each( obj.pairs, function (ind, val) {
                                if( (val.target.attr('id') == target_id) && (val.origin.attr('id') == $(ui.draggable).attr("id"))) {
                                    matched=true;
                                }
                            });
                            if(!matched) {
                                $.each(obj.properties.initialPositions, function(key,val){
                                    if( $(ui.draggable).attr("id") == val._id)
                                        $(ui.draggable).css({
                                            position: val._position,
                                            top: val._top,
                                            left: val._left
                                        });
                                });
                                return;
                            };
                        }

                        if(obj.properties.multiTarget == 0 || $(this).data('droppedElements').length < obj.properties.multiTarget){
                            if($.inArray($(ui.draggable).attr("id") ,$(this).data('droppedElements'))>-1) {
                                if(obj.properties.autoAlignNodes){
                                    $(ui.draggable).position({
                                        of: $( target )
                                    });
                                }
                                return;
                            }
                            /* Some dropp in ? -> check pairs and update match value */
                            $.each( obj.pairs, function (ind, pair) {
                                if( ui.draggable.attr("id") == pair.origin.attr('id')) {
                                    obj.pairs[ind].match = ($val.attr('id') == pair.target.attr('id'));
                                }
                            });
                            if(obj.properties.autoAlignNodes){
                                $(ui.draggable).position({
                                    of: $( target )
                                });
                            }
                            $(ui.draggable).addClass("jpit_activities_jpitdroppable_dropped");
                            $(this).data('droppedElements').push($(ui.draggable).attr("id"));
                        }
                        else{
                            if($.inArray($(ui.draggable).attr("id") ,$(this).data('droppedElements'))>-1) {
                                if(obj.properties.autoAlignNodes){
                                    $(ui.draggable).position({
                                        of: $( target )
                                    });
                                }
                                return;
                            }
                            $.each(obj.properties.initialPositions,function(key, ip){
                                if($(ui.draggable).attr("id") == ip._id)
                                    $(ui.draggable).css({
                                        position: ip._position,
                                        top: ip._top,
                                        left: ip._left
                                    });
                            });
                        }
                    },
                    out: function(event, ui) {
                        /* Some dropp out? -> check pairs and update match value */
                        $.each( obj.pairs, function (ind, pair) {
                            if( ui.draggable.attr("id") == pair.origin.attr('id') && $val.attr('id') == pair.target.attr('id')) obj.pairs[ind].match = false;
                        });
                        $(ui.draggable).removeClass("jpit_activities_jpitdroppable_dropped");
                        $(this).data('droppedElements', $.grep($(this).data('droppedElements'), function(val) {
                            return val != $(ui.draggable).attr("id");
                        }));
                    }
                });
            });
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
                 $val.draggable( "disable" );
                 $val.addClass('disabled');
            });
        },
        "enable" : function (){
            $.each( obj.origins, function (ind, $val) {
                 $val.draggable( "enable" );
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
                    if(obj.pairs[ind].match) obj.pairs[ind].origin.draggable( "disable" ); // hold correct matched
                });
            }
            /* Continue Solving*/
            if(!properties.continueResolve){
                $.each(obj.origins, function (index, $val) {
                    $val.draggable( "disable" ); // if not, disable origiins draggable property
                });
                if (!properties.autoResolve) {
                    $.each(obj.targets, function (index, $val) {
                        $val.droppable("disable"); // disable targets droppable property
                    });
                }
                else{
                    $.each(obj.pairs, function (index, val) {
                        val.target.droppable("disable"); // disable targets droppable property
                    });
                }
            }
            return true;
        },
        /*Stage Methods*/
        "resetStage" : function() {
            //Reset Positions
            $.each(obj.properties.initialPositions, function(key, ip){
                $("#"+ip._id).css({
                    position: ip._position,
                    top: ip._top,
                    left: ip._left
                }).removeClass("jpit_activities_jpitdroppable_dropped");
            });
            /*Destroy the dragable elements*/
            $.each(obj.origins, function (index, $val) {
                $val.draggable("enable").draggable( "destroy" );
                $val.removeClass('disabled');
            });
            /*Destroy the dropppable elements*/
            if (!properties.autoResolve) {
                $.each(obj.targets, function (index, $val) {
                    $val.droppable("enable").droppable("destroy");
                });
            }else{
                $.each(obj.pairs, function (index, val) {
                    val.target.droppable("enable").droppable("destroy");
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
        initialPositions: null,
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
};
