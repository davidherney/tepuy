// This file is part of CDI Tool
//
// CDI is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// CDI is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with CDI.  If not, see <http://www.gnu.org/licenses/>.

dhbgApp.scorm = {};
dhbgApp.scorm.lms = null;
dhbgApp.scorm.visited = [];
dhbgApp.scorm.currentSco = 0;
dhbgApp.scorm.scoList = [];
dhbgApp.scorm.indexPages = [];
dhbgApp.scorm.activities = [];
dhbgApp.scorm.activitiesValues = [];
dhbgApp.scorm.activitiesCurrent = 0;

dhbgApp.scorm.options = {
    activities_percentage: 60
}

//=======================================================================
//SCORM Initialization
//=======================================================================
dhbgApp.scorm.initialization = function (options) {

    if(typeof(options) == 'object') {
        if (options.activities_percentage != 'undefined' && options.activities_percentage != undefined && !isNaN(options.activities_percentage)) {
            dhbgApp.scorm.options.activities_percentage = options.activities_percentage;
        }
    }

    dhbgApp.scorm.change_sco = false;

    try {
        doLMSInitialize();
        dhbgApp.scorm.lms = getAPI();
    }
    catch(e) {
        // The content is not into a LMS, the progress will not be recorded
    }

    if (!dhbgApp.scorm.lms) {
        return false;
    }

    dhbgApp.scorm.startSessionTimer();

    var suspend_data = "";
    try {
        suspend_data = doLMSGetValue('cmi.suspend_data');
    }
    catch (e) {}

    if (suspend_data && suspend_data != '') {
        var data_scorm = suspend_data.split('#');
        if (data_scorm.length > 0) {
            if(!isNaN(data_scorm[0])) {
                dhbgApp.scorm.currentSco = data_scorm[0];
            }
        }

        if (data_scorm.length > 1) {
            var scos = data_scorm[1].split('|');

            if (scos) {
                for (var i = 0; i < scos.length; i++) {
                    dhbgApp.scorm.visited[scos[i]] = true;
                }
            }
        }

        if (data_scorm.length > 2) {
            var activities = data_scorm[2].split('|');
            if (activities) {
                for (var i = 0; i < activities.length; i++) {
                    var parts = activities[i].split(':');
                    if (parts.length == 2 && parts[1] != '') {
                        dhbgApp.scorm.activities[parts[0]] = parts[1].split(',');
                    }
                }
            }
        }

        if (data_scorm.length > 3) {
            var activities_values = data_scorm[3].split('|');
            if (activities_values) {
                for (var i = 0; i < activities_values.length; i++) {
                    var parts = activities_values[i].split(':');
                    if (parts.length == 2) {
                        dhbgApp.scorm.activitiesValues[parts[0]] = parts[1];
                    }
                }
            }
        }
    }

    dhbgApp.scorm.activitiesCurrent = doLMSGetValue('cmi.interactions._count');
    var status = doLMSGetValue('cmi.core.lesson_status');

    if (status == 'incomplete') {
        dhbgApp.scorm.change_sco = true;
    }
    else if (status == 'complete') {
        dhbgApp.scorm.lms = null;
    }
    else {
        doLMSSetValue('cmi.core.lesson_status', 'incomplete');
        doLMSCommit();
    }

    var close_function = function() {

        if (!dhbgApp.scorm.closed) {
            dhbgApp.scorm.saveProgress();

            dhbgApp.scorm.recordSessionTime();
            doLMSSetValue('cmi.core.exit',  'suspend');
            doLMSCommit();
            doLMSFinish();
            dhbgApp.scorm.closed = true;
        }

    };

    window.onbeforeunload = close_function;
    window.onunload = close_function;


};
//=======================================================================
// END SCORM Initialization
//=======================================================================

dhbgApp.scorm.saveVisit = function(index) {

    dhbgApp.scorm.currentSco = index;

    var sco = dhbgApp.scorm.scoList[index];
    if (!sco.visited) {
        sco.visited = true;
    }

    //dhbgApp.scorm.saveProgress();
};

dhbgApp.scorm.saveProgress = function() {

    if (dhbgApp.scorm.lms != null) {
        var scale_sco = 0;
        var progress = '';
        var max_sco_value = 0;
        var max_activities_value = 0;
        var scale_activities = 0;

        var index;
        for(index in dhbgApp.scorm.scoList) {
            if (dhbgApp.scorm.scoList[index]) {
                var sco = dhbgApp.scorm.scoList[index];
                if (sco.visited) {
                    scale_sco += dhbgApp.scorm.scoList[index].value;
                    progress += index + '|';
                }
                max_sco_value += sco.value;
            }
        }

        // Build the activity data.
        var data_activity = "";
        var activities_length = 0;
        var weighted_progress = 0;
        var use_weighted_progress = ('getActivityWeight' in dhbgApp.scorm && dhbgApp.scorm.isFunction(dhbgApp.scorm.getActivityWeight));
        for (var activity_key in dhbgApp.scorm.activities) {
            if (dhbgApp.scorm.activities[activity_key]) {
                if (typeof dhbgApp.scorm.activities[activity_key] == 'string') {
                    data_activity += activity_key + ":" + dhbgApp.scorm.activities[activity_key] + "|";
                }
                else {
                    data_activity += activity_key + ":" + dhbgApp.scorm.activities[activity_key].join(',') + "|";

                    var intents_value = 0;
                    var intent_val = 0;
                    for(activity_intent in dhbgApp.scorm.activities[activity_key]) {
                        if (!isNaN(dhbgApp.scorm.activities[activity_key][activity_intent])) {
                            intent_val = parseFloat(dhbgApp.scorm.activities[activity_key][activity_intent]);
                            if (intent_val > intents_value) {
                                intents_value = intent_val;
                            }
                        }
                    }

                    if (use_weighted_progress) {
                        weighted_progress += dhbgApp.scorm.getActivityWeight(activity_key) * intents_value / 100;
                    }
                    scale_activities += intents_value;
                    activities_length++;
                }
            }
        }

        var progress_value;
        if (activities_length > 0) {
            progress_value = Math.round((scale_sco / max_sco_value)*(100 - dhbgApp.scorm.options.activities_percentage));
            // Activities scale is in percentage.
            if (use_weighted_progress) {
                progress_value = Math.round(weighted_progress);
            }
            else {
                progress_value += Math.round((scale_activities / activities_length)*(dhbgApp.scorm.options.activities_percentage/100));
            }
        }
        else {
            progress_value = Math.round((scale_sco / max_sco_value)*100);
        }

        // Build the activity values.
        var activities_values = "";
        for (var activity_val_key in dhbgApp.scorm.activitiesValues) {
            if (dhbgApp.scorm.activitiesValues[activity_val_key] && typeof dhbgApp.scorm.activitiesValues[activity_val_key] == 'string') {
                activities_values += activity_val_key + ":" + dhbgApp.scorm.activitiesValues[activity_val_key] + "|";
            }
        }

        doLMSSetValue('cmi.suspend_data', dhbgApp.scorm.currentSco + '#' + progress + '#' + data_activity + '#' + activities_values);
        doLMSSetValue('cmi.core.score.raw', progress_value);

        if (progress_value >= 100) {
            doLMSSetValue('cmi.core.lesson_status', 'completed');
        }
        else {
            doLMSSetValue('cmi.core.lesson_status', 'incomplete');
        }
    }
};


dhbgApp.scorm.getProgress = function() {

    var scale_sco = 0;
    var max_sco_value = 0;
    var max_activities_value = 0;
    var scale_activities = 0;

    var index;
    for(index in dhbgApp.scorm.scoList) {
        if (dhbgApp.scorm.scoList[index]) {
            var sco = dhbgApp.scorm.scoList[index];
            if (sco.visited) {
                scale_sco += dhbgApp.scorm.scoList[index].value;
            }
            max_sco_value += sco.value;
        }
    }

    var activities_length = 0;
    var weighted_progress = 0;
    var use_weighted_progress = ('getActivityWeight' in dhbgApp.scorm && dhbgApp.scorm.isFunction(dhbgApp.scorm.getActivityWeight));

    for (var activity_key in dhbgApp.scorm.activities) {
        if (dhbgApp.scorm.activities[activity_key]) {
            if (typeof dhbgApp.scorm.activities[activity_key] == 'string') {
                // Nothing.
            }
            else {

                var intents_value = 0;
                var intent_val = 0;
                for(activity_intent in dhbgApp.scorm.activities[activity_key]) {
                    if (!isNaN(dhbgApp.scorm.activities[activity_key][activity_intent])) {
                        intent_val = parseFloat(dhbgApp.scorm.activities[activity_key][activity_intent]);
                        if (intent_val > intents_value) {
                            intents_value = intent_val;
                        }
                    }
                }
                if (use_weighted_progress) {
                    weighted_progress += dhbgApp.scorm.getActivityWeight(activity_key) * intents_value / 100;
                }

                scale_activities += intents_value;
                activities_length++;
            }
        }
    }

    var progress_value;

    if (activities_length > 0) {
        progress_value = Math.round((scale_sco / max_sco_value)*(100 - dhbgApp.scorm.options.activities_percentage));

        // Activities scale is in percentage.
        if (use_weighted_progress) {
            progress_value = Math.round(weighted_progress);
        }
        else {
            progress_value += Math.round((scale_activities / activities_length)*(dhbgApp.scorm.options.activities_percentage/100));
        }
    }
    else {
        progress_value = Math.round((scale_sco / max_sco_value)*100);
    }

    return progress_value;
};

dhbgApp.scorm.startSessionTimer = function(){
    dhbgApp.scorm.startTime = new Date();
};

dhbgApp.scorm.recordSessionTime = function(){
    // Read the current time on the computer clock when the page is opened.
    var startTime = dhbgApp.scorm.startTime;
    var startHour = startTime.getHours();
    var startMinutes = startTime.getMinutes();
    var startSeconds = startTime.getSeconds();

    // Now get the current date and time on the computer clock.
    var nowTime = new Date();
    var nowHour = nowTime.getHours();
    var nowMinutes = nowTime.getMinutes();
    var nowSeconds = nowTime.getSeconds();

    // Now calculate the total elapsed time.
    var elapsedHours = nowHour - startHour;

    if (nowMinutes >= startMinutes) {
        var elapsedMinutes = nowMinutes - startMinutes;
    }
    else {
        var elapsedMinutes = (nowMinutes + 60) - startMinutes;
        elapsedHours--;
    }

    if (nowSeconds >= startSeconds) {
        var elapsedSeconds = nowSeconds - startSeconds;
    }
    else {
        var elapsedSeconds = (nowSeconds + 60) - startSeconds;
        elapsedMinutes--;
    }

    if (elapsedHours < 10) { elapsedHours = "0" + elapsedHours };
    if (elapsedMinutes < 10) { elapsedMinutes = "0" + elapsedMinutes };
    if (elapsedSeconds < 10) { elapsedSeconds = "0" + elapsedSeconds };

    // Prepare the CMITimespan string.
    var timeSpan = elapsedHours + ":" + elapsedMinutes + ":" + elapsedSeconds;
    doLMSSetValue("cmi.core.session_time", timeSpan);
};

dhbgApp.scorm.activityAttempt = function(activity_key, value, index, txt){
    if (!dhbgApp.scorm.activities[activity_key]) {
        dhbgApp.scorm.activities[activity_key] = [];
    }

    var position = dhbgApp.scorm.activities[activity_key].length;
    if (index != 'undefined' && index != null) {
        position = index;
    }

    var sub_key = 'cmi.interactions.' + dhbgApp.scorm.activitiesCurrent;
    dhbgApp.scorm.activitiesCurrent++;

    dhbgApp.scorm.activities[activity_key][position] = value;
    doLMSSetValue(sub_key + '.result', value);

    dhbgApp.scorm.saveProgress();
    doLMSSetValue(sub_key + '.id', activity_key);

    if (txt) {
        doLMSSetValue(sub_key + '.student_response', txt);
    }
    doLMSCommit();

};

dhbgApp.scorm.setActivityValue = function(key, value){
    try {
        dhbgApp.scorm.activitiesValues[key] = value;
        dhbgApp.scorm.saveProgress();
        doLMSCommit();
        return true;
    }
    catch (e) {
        return false;
    }
};

dhbgApp.scorm.getActivityValue = function(key){
    if (dhbgApp.scorm.activitiesValues[key]) {
        return dhbgApp.scorm.activitiesValues[key];
    }

    return null;
};

dhbgApp.scorm.getReturnUrl = function() {
    var courseurl = '';
    if (parent && parent.window.M) {
        M = parent.window.M;

        // Hack for Moodle.
        if (parent.window.scormplayerdata) {
            courseurl = M.cfg.wwwroot + '/course/view.php?id=' + parent.window.scormplayerdata.courseid
        }
    }

    return courseurl;
};

dhbgApp.scorm.isFunction = function (functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

dhbgApp.scorm.close = function(f) {
    dhbgApp.scorm.saveProgress();
    f();
};