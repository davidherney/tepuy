function multiDimensionalArray(iRows,iCols){
    var i;
    var j;
    var a = new Array(iRows);
    for (i=0; i < iRows; i++){
        a[i] = new Array(iCols);
    }
    return(a);
} 

jQuery.extend({
    compare: function (arrayA, arrayB) {
        if (arrayA.length != arrayB.length) {
            return false;
        }
		
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        a.sort(); 
        b.sort();
        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) { 
                return false;
            }
        }
        return true;
    }
});

jQuery.extend({
    equals: function (string1, string2) {
        if (string1.length != string2.length) {
            return false;
        }
       
        for(var x=0; x<string1.length; x++){
            if( string1.charAt(x) != string2.charAt(x) ) return false;	
        }		
        return true;
    }
});

jQuery.extend({
    reverseString :function(string){
        return string.split("").reverse().join("");
    }
});


jQuery.extend({
    walkRoute : function(arr){ 
        var rl = arr.length;
        var cl = arr[0].length;
        var response = '';
        var i;
        var j;
        
        for( i = 0 ; i<rl; i++){
            for( j=0;j<cl;j++){
                response+=arr[i][j];
            }
            response+=' ';
        }       
        for( j = 0 ; j<cl; j++){
            for( i=0;i<rl;i++){
                response+=arr[i][j];
            }
            response+=' ';
        }       
        
        var r;
        var c;
        for( j = 0 ; j<cl; j++){
            r = 0;
            c = j;
            while(c >= 0 && r <= (rl-1)){
                response+=arr[r][c];
                c--;
                r++;
            }
            response+=' ';
        }        
       
        for( i = 1 ; i<rl; i++){
            r = i;
            c = (cl-1);
            while(r <= (rl-1) && c >= 0){
                response+=arr[r][c];
                c--;
                r++;
            }
            response+=' ';
        }
        
        //
        for( j = 0 ; j<cl; j++){
            r = 0;
            c = j;
            while(c <= (cl-1) && r <= (rl-1)){
                response+=arr[r][c];
                c++;
                r++;
            }
            response+=' ';
        }        
       
        for( i = 1 ; i<rl; i++){
            r = i;
            c = 0;
            while(r <= (rl-1) && c <= (cl-1)){
                response+=arr[r][c];
                c++;
                r++;
            }
            response+=' ';
        }
        
        return response;
    } 
});

jQuery.extend({
    keycontrols: function(fields_array){
        var direction="lr";
        /*"tb" : 1, //top - bottom
            "bt" : 2, //bottom - top
            "lr" : 3, //left - right
            "rl" : 4, //right - left*/
        
        function calculateNextField(jSon){              
            switch(jSon.direction){
                case 'lr':
                    jSon.column++;
                    if(jSon.column > (fields_array[0].length - 1) ){
                        jSon.column=0;
                        jSon.row++;
                        if(jSon.row > (fields_array.length - 1))jSon.row=0; 
                    }                      
                    break;
                case 'rl':
                    jSon.column--;
                    if(jSon.column <  0){
                        jSon.column=(fields_array[0].length - 1);
                        jSon.row--;
                        if(jSon.row < 0)jSon.row = (fields_array.length - 1);
                    }
                    break;
                case 'td':
                    jSon.row++;
                    if(jSon.row > (fields_array.length - 1) )jSon.row=0;
                    break;
                case 'dt':
                    jSon.row--;
                    if(jSon.row <  0)jSon.row=(fields_array.length - 1);
                    break;
            }            
            return jSon;
        }
    
        for(var i=0;i<fields_array.length;i++){
            for(var j=0;j<fields_array[0].length;j++){
                $("#"+fields_array[i][j]).attr("coord_row",i).attr("coord_column",j);
                
                $("#"+fields_array[i][j]).unbind("keyup").bind("keyup",function(event){
                    
                    
                    event.which = (document.all) ? event.keyCode : event.which;
    
                    var json = {};
                    json.row = parseInt($(this).attr("coord_row"));
                    json.column = parseInt($(this).attr("coord_column"));
                    
                    if (event.altKey || event.ctrlKey) {
                        return;
                    }
                    if (event.keyCode == '13') {
                        event.preventDefault();
                    }
                       
                    if ((event.which >= 48 && event.which <= 57) || //numbers
                        (event.which >= 97 && event.which <= 122) || //letters - lowercase
                        (event.which >= 65 && event.which <= 90 || event.which == 192) //letters - uppercase
                        ) {
                        json.direction = direction;        
                        this.value = (event.shiftKey || event.which == 20)? String.fromCharCode(event.which):String.fromCharCode(event.which).toLowerCase();
                        //this.value = keyPressed;
                        json = calculateNextField(json);
                    }                    
                    else if (event.which == 39) {  // rigth arrow
                        json.direction = 'lr';
                        json = calculateNextField(json);                       
                    }
                    else if (event.which == 40) {  // down arrow
                        json.direction = 'td';
                        json = calculateNextField(json);  
                    }
                    else if (event.shiftKey && (event.which == 9)) {  // shift+tab
                        
                    }
                    else if (event.which == 37) {  // left arrow
                        json.direction = 'rl';
                        json = calculateNextField(json);
                    }
                    else if (event.which == 38) {  // up arrow
                        json.direction = 'dt';
                        json = calculateNextField(json);
                    }
                    else if (event.which == 8) { // backspace
                        $("#"+fields_array[json.row][json.column]).val('');
                        json.direction = $.reverseString(direction);
                        json = calculateNextField(json);
                    }
                    else {
                        this.value = '';
                        return false;
                    }
                    direction = event.which == 8 ? direction : json.direction;
                    $("#"+fields_array[json.row][json.column]).focus();
                    return true;
                });
            }
        }
       
        return true;
    }
});


jQuery.extend({
 /* 
 * autor: Andres Vergara  - Pit UdeA 2011
 */

    validateFields : function(jQuery, required, type,  jContainer, error_class){
        var response = true;
        jContainer = jContainer != null ? jContainer : jQuery.parent();
        
        jContainer.removeClass(error_class);
        
        if(required && !$.trim(jQuery.val())){                    
            response =  false;
        }
        var template = "";

        if(type) switch(type){

            case "mail":
                template = /(^[0-9a-zA-Z]+(?:[._][0-9a-zA-Z]+)*)@([0-9a-zA-Z]+(?:[._-][0-9a-zA-Z]+)*\.[0-9a-zA-Z]{2,3})$/i;
                if( !template.test(jQuery.val())){                                  
                    response = false;
                }            
                break;
            case "id":
                template = /(^[0-9]+)$/i;
                if( !template.test(jQuery.val())){                                 
                    response = false;
                } 
                break;

            case "alphanumeric":
                template = /(\s)*(\w)(\s)*$/i;
                if( !template.test(jQuery.val())){                              
                    response = false;
                }
                break;

            case "date":
                template = /(^[0-9]{4}\-[0-9]{2}\-[0-9]{2})$/i;
                if( !template.test(jQuery.val())){                   
                    response = false;
                }
                break;
            case "html":
                
                break;
        }
        
        if(!response){
            jQuery.effect("highlight");
            jContainer.addClass(error_class);
        }
        return response;


    }
});


/*
 * getStyleObject Plugin for jQuery JavaScript Library
 * From: http://upshots.org/?p=112
 */
(function($){
    $.fn.getStyleObject = function(){
        var dom = this.get(0);
        var style;
        var returns = {};
        if(window.getComputedStyle){
            var camelize = function(a,b){
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for(var i = 0, l = style.length; i < l; i++){
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                returns[camel] = val;
            };
            return returns;
        };
        if(style = dom.currentStyle){
            for(var prop in style){
                returns[prop] = style[prop];
            };
            return returns;
        };
        return this.css();
    }
})(jQuery);

