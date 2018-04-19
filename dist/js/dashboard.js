function dashboardView() {
    $.blockUI(blockUI_opt_all);
    offTimer();
    removeAllChart();

//    $(".info-box-content").block(blockUI_opt_el);

    $.datepicker.setDefaults($.datepicker.regional['ko']);

    $(".datepicker").datepicker({
        showButtonPanel: true,
        dateFormat: "yy-mm-dd",
        maxDate: 0,
        duration: "fast",
        onClose: function (selectedDate) {

            var eleId = $(this).attr("id");
            var optionName = "";

            if (eleId.indexOf("StartDate") > 0) {
                eleId = eleId.replace("StartDate", "EndDate");
                optionName = "minDate";
            } else {
                eleId = eleId.replace("EndDate", "StartDate");
                optionName = "maxDate";
            }

            $("#" + eleId).datepicker("option", optionName, selectedDate);
            $(".searchDate").find(".chkbox2").removeClass("on");
        }
    });

    //이벤트 현황
    console.log("dashboardEventStatus");
    dashboardEventStatus();

    //호스트별 장애현황
    console.log("dashboardHostEvent");
    dashboardHostEvent();

    //이벤트 발생 목록
    console.log("dashboardEventList");
    dashboardEventList();

    //요일별 이벤트 발생빈도 dashboardEventList
    console.log("dashboardDayEvent");
    dashboardDayEvent();

    //이벤트 인지 차트
    console.log("dashboardEventAckChart");
    dashboardEventAckChart();

    //요일별 Top 이벤트
    console.log("dashboardWeekTopEvent");
    dashboardWeekTopEvent();

    $.unblockUI(blockUI_opt_all);

    TIMER_ARR.push(setInterval(function () {
        addEventAckChart();
        //dashboardEventStatus();
    }, 10000));
}

function dashboardEventStatus() {
    console.log(" dashboardEventStatus ");
    var DAYTOMILLS = 1000 * 60 * 60 * 24;

    /*
     var today_select = new Date();
     today_select = today_select-(today_select % DAYTOMILLS);
     today_select = Math.round(today_select / 1000);
     */

    var d = new Date();
    var date = d.getDate();
    var today_select = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    var beforeWeekTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, 0, 0, 0);
    //console.log(" today_select : " + today_select);
    today_select = parseInt(today_select / 1000);
    beforeWeekTime = parseInt(beforeWeekTime / 1000);

    console.log(" today_select : " + today_select);
    console.log(" beforeWeekTime : " + beforeWeekTime);

    var totalEvent = '';
    var unacknowEvent = '';
    var todayEvent = '';

    /*
    zbxApi.alertTrigger.get().then(function(data) {
        totalEvent = zbxApi.alertTrigger.success(data);
        $("#infobox_alertTrigger").text(totalEvent);
    });
    */
    zbxApi.todayEvent.get(beforeWeekTime).then(function (data) {
        var weekEvent = zbxApi.todayEvent.success(data);
        $("#infobox_alertTrigger").text(weekEvent);
    });

    zbxApi.unAckknowledgeEvent.get(today_select).then(function (data) {
        unacknowEvent = zbxApi.unAckknowledgeEvent.success(data);
        $("#unAcknowledgedEvents").text(unacknowEvent);
    });

    zbxApi.todayEvent.get(today_select).then(function (data) {
        todayEvent = zbxApi.todayEvent.success(data);
        $("#todayEvents").text(todayEvent);
    });
    //console.log("dashboardEventStatus today_select : " + today_select);
    //console.log("dashboardEventStatus today_select : " + new Date(today_select));
}

function dashboardHostEvent() {
    var DAYTOMILLS = 1000 * 60 * 60 * 24;
    var date = new Date();
    var beforeTime = date.getTime() - DAYTOMILLS;
    var endTime = date.getTime();
    beforeTime = parseInt(beforeTime / 1000);
    endTime = parseInt(endTime / 1000);
    var hostList = [];

    zbxApi.dashboardHostInfo.get().then(function (data) { //호스트 정보 get

        $.each(data.result, function (k, v) {

            var dataObj = new Object();
            dataObj.hostId = v.hostid;
            dataObj.hostName = v.host;
            dataObj.evtCount = 0;
            dataObj.clock = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            dataObj.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


            hostList.push(dataObj);
        });
    }).then(function () {

        return zbxApi.dashboardHostEvent.hostGet(beforeTime, endTime);
    }).then(function (data1) {

        var nowTime = Math.round(new Date().getTime() / 1000);
        var shortTimeOneHour = LONGTIME_ONEHOUR / 1000;
        var dashboardHostEventHTML = '';
        $("#dashboardHostEventTbody").empty();

        $.each(data1.result, function (k, v) {
            $.each(hostList, function (k1, v1) {
                try {
                    if (v1.hostId == v.hosts[0].hostid) {
                        v1.evtCount += 1;

                        for (var i = 0; i < 24; i++) {
                            var startTime = 24 - i;
                            var endTime = startTime - 1;
                            v1.clock[i] = (nowTime - (endTime * shortTimeOneHour));
                            if ((nowTime - (startTime * shortTimeOneHour) < parseInt(v.clock)) && (nowTime - (endTime * shortTimeOneHour) >= parseInt(v.clock))) {
                                v1.value[i] += 1;
                            }
                        }
                    }
                } catch (e) {

                }
            });
        });

        $.each(hostList, function (k, v) {

            dashboardHostEventHTML += "<tr class='p1'>";
            dashboardHostEventHTML += "<td width='40px' height='70px' class='br7_lt line-td'>" + (k + 1) + "</td>";
            dashboardHostEventHTML += "<td width='160px' height='70px' class='line-td align_left'>" + v.hostName + "</td>";
            dashboardHostEventHTML += "<td width='50px' id='eventCnt_" + v.hostId + "' height='70px' class='line-td'>" + v.evtCount + "</td>";
            dashboardHostEventHTML += "<td width='auto' height='70px' class='br7_rt'><div id='hostChart" + v.hostId + "' style='width: 90%; height:70px; padding: 0 0 0 0;'></div></td>";
            dashboardHostEventHTML += "</tr>";

        });

        $("#dashboardHostEventTbody").append(dashboardHostEventHTML);
        var array = new Array(24);

        $.each(hostList, function (k, v) {

            var hostDataObj = new Object();
            var hostDataSet = [];

            for (var i = 0; i < 24; i++) {
                array[i] = new Array(2);
                array[i][0] = v.clock[i] * 1000;
                array[i][1] = v.value[i];
            }

            hostDataObj.name = "hostEvent";
            hostDataObj.data = array;
            hostDataSet.push(hostDataObj);

            var chartLineColor;

            if (k % 3 == 0) {
                chartLineColor = ['#ccaa65'];
            } else if (k % 3 == 1) {
                chartLineColor = ['#88e64a'];
            } else if (k % 3 == 2) {
                chartLineColor = ['#fa7796'];
            }
            showLineChart('hostChart' + v.hostId, "hostEvent", hostDataSet, "", chartLineColor);
        });

    });
}

function dashboardEventList() {
    var dataObj = new Object();

    /*
     * 1. 모든 이벤트 호출
     * 2. 트리거 아이디 별로 이벤트 분리 후, 이벤트 간 시간차이(지속시간 duration) 계산
     * 3. 분리된 이벤트 merge
     * 4. merge 된 이벤트를 clock 순으로 정렬 후 화면 표시
     */
    zbxApi.dashboardEventList.get().then(function (data) {

        var triggerIdArr = [];
        var uniqueTriggerIdArr = [];
        var eventMergeArr = [];

        // 모든 트리거 아이디를 배열에 담는다.
        $.each(data.result, function (k, v) {
            triggerIdArr.push(v.relatedObject.triggerid);
        });

        // 트리거 아이디 배열의 중복 제거
        $.each(triggerIdArr, function (k1, v1) {
            if (uniqueTriggerIdArr.indexOf(v1) == -1) {
                uniqueTriggerIdArr.push(v1);
            }
        });

        // 트리거 아이디 별 이벤트 분리
        var eventArrByTriggerId = new Array(uniqueTriggerIdArr.size);

        $.each(uniqueTriggerIdArr, function (k, v) { //유니크 트리거 아이디 배열
            eventArrByTriggerId[k] = new Array();
            $.each(data.result, function (k1, v1) { //이벤트 배열
                try {
                    if (v == v1.relatedObject.triggerid) {
                        dataObj = new Object();
                        dataObj.triggerId = v1.relatedObject.triggerid;
                        dataObj.objectId = v1.objectid;
                        dataObj.eventId = v1.eventid;
                        dataObj.severity = convPriority(v1.relatedObject.priority);
                        dataObj.status = convStatusEvent(v1.value);
                        dataObj.ack = convAckEvent(v1.acknowledged);
                        if (v1.acknowledges[0] == undefined) {
                            dataObj.ackTime = "-";
                        } else {
                            dataObj.ackTime = convTime(v1.acknowledges[0].clock);
                        }
                        dataObj.host = v1.hosts[0].name;
                        dataObj.description = v1.relatedObject.description;
                        dataObj.clock = v1.clock;
                        dataObj.duration = 0;

                        eventArrByTriggerId[k].push(dataObj);
                    }
                } catch (e) {

                }
            });
        });
        //console.log(eventArrByTriggerId);

        // 이벤트 별 지속시간 계산 후, 트리거 아이디로 분리된 이벤트 배열 merge
        $.each(eventArrByTriggerId, function (k, v) {
            var previousClock = Math.ceil(parseInt(new Date().getTime()) / 1000);
            console.log("previousClock : " + previousClock);

            $.each(v, function (k1, v1) {
                v1.duration = convertTime(previousClock - parseInt(v1.clock));
                previousClock = parseInt(v1.clock);
                eventMergeArr.push(v1);

            });
        });
        //console.log(eventMergeArr);

        // Merge된 이벤트 배열 clock 순으로 정렬
        eventMergeArr.sort(function (a, b) {
            return a.clock > b.clock ? -1 : a.clock < b.clock ? 1 : 0;
        });
        //console.log(eventMergeArr);

        var eventTable = '';

        eventTable += '<tbody>';

        $.each(eventMergeArr, function (k, v) {
            var objectId = v.objectId;
            var eventId = v.eventId;
            var severity = v.severity;
            var status = v.status;
            var clock = convTime(v.clock);
            var duration = v.duration;
            var ack = v.ack;
            var ackTime = v.ackTime;
            var host = v.host;
            var description = v.description;

            eventTable += "<tr id='" + eventId + "'>";
            if (severity == "information") {
                eventTable += "<td width='80' class='line c_b1' style='color:#7499FF'>" + severity + "</td>";
            } else if (severity == "warning") {
                eventTable += "<td width='80' class='line c_b1' style='color:#FFC859'>" + severity + "</td>";
            } else if (severity == "average") {
                eventTable += "<td width='80' class='line c_b1' style='color:#FFA059'>" + severity + "</td>";
            } else if (severity == "high") {
                eventTable += "<td width='80' class='line c_b1' style='color:#E97659'>" + severity + "</td>";
            } else {
                eventTable += "<td width='80' class='line c_b1' style='color:red'>" + severity + "</td>";
            }
            if (status == "정상") {
                eventTable += "<td width='60' class='line' style='color:green'>" + status + "</td>";
            } else {
                eventTable += "<td width='60' class='line' style='color:red'>" + status + "</td>";
            }
            eventTable += "<td width='75' class='line'>" + clock + "</td>";
            eventTable += "<td width='75' class='line'>" + duration + "</td>";
            if (ack == "미인지") {
                eventTable += "<td width='69' class='line'><a style='color:#c45959' onclick='eventAckDetailView(" + eventId + ", " + objectId + ", this);' href='#none'>" + ack + "</a></td>";
            } else if (ack == "인지") {
                eventTable += "<td width='69' class='line'><a style='color:#529238' onclick='eventAckDetailView(" + eventId + ", " + objectId + ");' href='#none'>" + ack + "</a></td>";
            }
            eventTable += "<td width='75' class='line'>" + ackTime + "</td>";
            eventTable += "<td width='100' class='line'>" + host + "</td>";
            eventTable += "<td width='auto' class='align_left ponter'>" +
                "<a style='width:100%; height:18px; display:inline-block;' title='" + description + "'>" +
                "<span class='smd'>" + description + "</span></a></td>";
            eventTable += "</tr>";
        });
        eventTable += "</tbody>";
        $("#dashboardEventList").empty();
        $("#dashboardEventList").append(eventTable);

    });

}

function dashboardEventList_org() {
    var eventId = '';
    var severity = '';
    var status = '';
    var lastchange = '';
    var age = '';
    var ack = '';
    var ackTime = '';
    var host = '';
    var description = '';
    var objectId = '';
    var clock = '';

    var eventTable = '';

    eventTable += '<tbody>';

    zbxApi.dashboardEventList.get().then(function (data) {

        $.each(data.result, function (k, v) {
            objectId = v.objectid;
            eventId = v.eventid;
            severity = convPriority(v.relatedObject.priority);
            status = convStatusEvent(v.value);
            clock = convTime(v.clock);
            //lastchange = convTime(v.relatedObject.lastchange);
            age = convDeltaTime(v.relatedObject.lastchange);
            ack = convAckEvent(v.acknowledged);
            if (v.acknowledges[0] == undefined) {
                ackTime = "-";
            } else {
                ackTime = convTime(v.acknowledges[0].clock);
            }
            host = v.hosts[0].name;
            description = v.relatedObject.description;

            eventTable += "<tr id='" + eventId + "'>";
            if (severity == "information") {
                eventTable += "<td width='80' class='line c_b1' style='color:#7499FF'>" + severity + "</td>";
            } else if (severity == "warning") {
                eventTable += "<td width='80' class='line c_b1' style='color:#FFC859'>" + severity + "</td>";
            } else if (severity == "average") {
                eventTable += "<td width='80' class='line c_b1' style='color:#FFA059'>" + severity + "</td>";
            } else if (severity == "high") {
                eventTable += "<td width='80' class='line c_b1' style='color:#E97659'>" + severity + "</td>";
            } else {
                eventTable += "<td width='80' class='line c_b1' style='color:red'>" + severity + "</td>";
            }
            if (status == "정상") {
                eventTable += "<td width='60' class='line' style='color:green'>" + status + "</td>";
            } else {
                eventTable += "<td width='60' class='line' style='color:red'>" + status + "</td>";
            }
            eventTable += "<td width='75' class='line'>" + clock + "</td>";
            eventTable += "<td width='75' class='line'>" + age + "</td>";
            if (ack == "미인지") {
                eventTable += "<td width='69' class='line'><a style='color:#c45959' onclick='eventAckDetailView(" + eventId + ", " + objectId + ", this);' href='#none'>" + ack + "</a></td>";
            } else if (ack == "인지") {
                eventTable += "<td width='69' class='line'><a style='color:#529238' onclick='eventAckDetailView(" + eventId + ", " + objectId + ");' href='#none'>" + ack + "</a></td>";
            }
            eventTable += "<td width='75' class='line'>" + ackTime + "</td>";
            eventTable += "<td width='100' class='line'>" + host + "</td>";
            eventTable += "<td width='auto' class='align_left ponter'>" +
                "<a style='width:100%; height:18px; display:inline-block;' title='" + description + "'>" +
                "<span class='smd'>" + description + "</span></a></td>";
            eventTable += "</tr>";
        });
        eventTable += "</tbody>";
        $("#dashboardEventList").empty();
        $("#dashboardEventList").append(eventTable);
    });
}

function eventAckDetailView(eventId, objectId, thisTag) {

    var fromPage = $(thisTag).attr("class");

    $("#ackHistory").empty();
    $("#ackMsg").val('');
    $("#ackTagId").val(thisTag);
    $("#fromView").val(fromPage);

    zbxApi.Acknowledge.get(eventId, objectId).then(function (data) {
        var eventdata = zbxApi.Acknowledge.success(data);
        $.each(eventdata.result, function (k, v) {

            $.each(v.acknowledges, function (k1, v1) {
                var $tr = $("<tr><td>" + convTime(v1.clock) + "</td><td>" + v1.alias + "</td><td>" + v1.message + "</td></tr>");
                $("#ackHistory").append($tr);
            });
        });
    });


    $("#ackEventId").val(eventId);
    $('#ackDetailForm').lightbox_me({
        centered: true,
        closeSelector: ".close",
        onLoad: function () {
            $('#ackDetailForm').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
        },
        overlayCSS: {background: '#474f79', opacity: .8}
    });


}

function addAck() {

    var message = $('#ackMsg')[0].value;
    var user = $("#inputUser")[0].value;
    var eventId = $("#ackEventId")[0].value;


//	console.log("zzzzzzz");
//	console.log($("#ackTagId")[0].value);
//	$($("#ackTagId")[0].value).css("color","#529238");

    zbxApi.Acknowledge.update(eventId, message).then(function (data) {

        var ackTag = $("#ackTagId")[0].value;
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var dates = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }


        $(ackTag).css("color", "#529238");
        $(ackTag).text("인지");
        $(ackTag).parent().next().text(year + "/" + month + "/" + dates + " " + hour + ":" + minute + ":" + second);

        /*
         *
        var fromPage = $("#fromView")[0].value;

        if(fromPage == "eventListPage"){
            //eventListView();
            var ackTag = $("#ackTagId")[0].value;
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var dates = date.getDate();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            if(hour < 10){
                hour = "0" + hour;
            }
            if(minute < 10){
                minute = "0" + minute;
            }
            if(second < 10){
                second = "0" + second;
            }


            $(ackTag).css("color","#529238");
            $(ackTag).text("인지");
            $(ackTag).parent().next().text(year + "/" + month + "/" + dates + " " + hour + ":" + minute + ":" + second);
        }else{
            dashboardEventList();
            dashboardEventStatus();
        }
        */

    });


}

function dashboardDayEvent() {
    var DAYS = {
        "MONDAY": 0,
        "TUESDAY": 1,
        "WEDNESDAY": 2,
        "THURSDAY": 3,
        "FRIDAY": 4,
        "SATURDAY": 5,
        "SUNDAY": 6,
        "NEXTMONDAY": 7
    };

    var d = new Date();
    var date = d.getDate();
    var day = d.getDay();
    var startDay = date - (day + 7) + 1;
    var startDate = new Date(d.getFullYear(), d.getMonth(), startDay, 0, 0, 0);

    var lastWeekStartTime = startDate.getTime() / 1000;
    var lastDaysTimeArr = [];

    var infoEventArr = [];
    var highEventArr = [];
    var averEventArr = [];
    var warnEventArr = [];

    var mon_info_event_count = 0;
    var mon_warn_event_count = 0;
    var mon_aver_event_count = 0;
    var mon_high_event_count = 0;

    var tus_info_event_count = 0;
    var tus_warn_event_count = 0;
    var tus_aver_event_count = 0;
    var tus_high_event_count = 0;

    var wed_info_event_count = 0;
    var wed_warn_event_count = 0;
    var wed_aver_event_count = 0;
    var wed_high_event_count = 0;

    var thu_info_event_count = 0;
    var thu_warn_event_count = 0;
    var thu_aver_event_count = 0;
    var thu_high_event_count = 0;

    var fri_info_event_count = 0;
    var fri_warn_event_count = 0;
    var fri_aver_event_count = 0;
    var fri_high_event_count = 0;

    var sat_info_event_count = 0;
    var sat_warn_event_count = 0;
    var sat_aver_event_count = 0;
    var sat_high_event_count = 0;

    var sun_info_event_count = 0;
    var sun_warn_event_count = 0;
    var sun_aver_event_count = 0;
    var sun_high_event_count = 0;

    var priority = '';

    // 지난주 요일별 시작시간 세팅
    for (var i = 0; i < 8; i++) {
        lastDaysTimeArr[i] = lastWeekStartTime + (86400 * i);
    }

    zbxApi.getEvent.getByBeforeTime(lastWeekStartTime).then(function (data) {
        var eventArr = data.result;
        /*console.log(" 일주일 전 이벤트 : " );
         console.log(JSON.stringify(eventArr));
         console.log(" MONDAY : " + lastDaysTimeArr[DAYS.MONDAY]);
         console.log(" TUESDAY : " + lastDaysTimeArr[DAYS.TUESDAY]);
         console.log(" WEDNESDAY : " + lastDaysTimeArr[DAYS.WEDNESDAY]);
         console.log(" THURSDAY : " + lastDaysTimeArr[DAYS.THURSDAY]);
         console.log(" FRIDAY : " + lastDaysTimeArr[DAYS.FRIDAY]);
         console.log(" SATURDAY : " + lastDaysTimeArr[DAYS.SATURDAY]);
         console.log(" SUNDAY : " + lastDaysTimeArr[DAYS.SUNDAY]);
         console.log(" NEXT MONDAY : " + lastDaysTimeArr[DAYS.NEXTMONDAY]);*/

        $.each(eventArr, function (k, v) {
            priority = v.relatedObject.priority;
            if (v.clock >= lastDaysTimeArr[DAYS.MONDAY] && v.clock < lastDaysTimeArr[DAYS.TUESDAY]) {
                if (priority == 1) {
                    mon_info_event_count += 1;
                } else if (priority == 2) {
                    mon_warn_event_count += 1;
                } else if (priority == 3) {
                    mon_aver_event_count += 1;
                } else if (priority == 4) {
                    mon_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            }
            else if (v.clock >= lastDaysTimeArr[DAYS.TUESDAY] && v.clock < lastDaysTimeArr[DAYS.WEDNESDAY]) {
                if (priority == 1) {
                    tus_info_event_count += 1;
                } else if (priority == 2) {
                    tus_warn_event_count += 1;
                } else if (priority == 3) {
                    tus_aver_event_count += 1;
                } else if (priority == 4) {
                    tus_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if (v.clock >= lastDaysTimeArr[DAYS.WEDNESDAY] && v.clock < lastDaysTimeArr[DAYS.THURSDAY]) {
                if (priority == 1) {
                    wed_info_event_count += 1;
                } else if (priority == 2) {
                    wed_warn_event_count += 1;
                } else if (priority == 3) {
                    wed_aver_event_count += 1;
                } else if (priority == 4) {
                    wed_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if (v.clock >= lastDaysTimeArr[DAYS.THURSDAY] && v.clock < lastDaysTimeArr[DAYS.FRIDAY]) {
                if (priority == 1) {
                    thu_info_event_count += 1;
                } else if (priority == 2) {
                    thu_warn_event_count += 1;
                } else if (priority == 3) {
                    thu_aver_event_count += 1;
                } else if (priority == 4) {
                    thu_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if (v.clock >= lastDaysTimeArr[DAYS.FRIDAY] && v.clock < lastDaysTimeArr[DAYS.SATURDAY]) {
                if (priority == 1) {
                    fri_info_event_count += 1;
                } else if (priority == 2) {
                    fri_warn_event_count += 1;
                } else if (priority == 3) {
                    fri_aver_event_count += 1;
                } else if (priority == 4) {
                    fri_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if (v.clock >= lastDaysTimeArr[DAYS.SATURDAY] && v.clock < lastDaysTimeArr[DAYS.SUNDAY]) {
                if (priority == 1) {
                    sat_info_event_count += 1;
                } else if (priority == 2) {
                    sat_warn_event_count += 1;
                } else if (priority == 3) {
                    sat_aver_event_count += 1;
                } else if (priority == 4) {
                    sat_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if (v.clock >= lastDaysTimeArr[DAYS.SUNDAY] && v.clock < lastDaysTimeArr[DAYS.NEXTMONDAY]) {
                if (priority == 1) {
                    sun_info_event_count += 1;
                } else if (priority == 2) {
                    sun_warn_event_count += 1;
                } else if (priority == 3) {
                    sun_aver_event_count += 1;
                } else if (priority == 4) {
                    sun_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            }
        });

        infoEventArr.push(mon_info_event_count);
        infoEventArr.push(tus_info_event_count);
        infoEventArr.push(wed_info_event_count);
        infoEventArr.push(thu_info_event_count);
        infoEventArr.push(fri_info_event_count);
        infoEventArr.push(sat_info_event_count);
        infoEventArr.push(sun_info_event_count);

        warnEventArr.push(mon_warn_event_count);
        warnEventArr.push(tus_warn_event_count);
        warnEventArr.push(wed_warn_event_count);
        warnEventArr.push(thu_warn_event_count);
        warnEventArr.push(fri_warn_event_count);
        warnEventArr.push(sat_warn_event_count);
        warnEventArr.push(sun_warn_event_count);

        highEventArr.push(mon_high_event_count);
        highEventArr.push(tus_high_event_count);
        highEventArr.push(wed_high_event_count);
        highEventArr.push(thu_high_event_count);
        highEventArr.push(fri_high_event_count);
        highEventArr.push(sat_high_event_count);
        highEventArr.push(sun_high_event_count);

        averEventArr.push(mon_aver_event_count);
        averEventArr.push(tus_aver_event_count);
        averEventArr.push(wed_aver_event_count);
        averEventArr.push(thu_aver_event_count);
        averEventArr.push(fri_aver_event_count);
        averEventArr.push(sat_aver_event_count);
        averEventArr.push(sun_aver_event_count);

        /*console.log(" MONDAY    high : " + mon_high_event_count + " warn : " + mon_warn_event_count + " aver : " + mon_aver_event_count + " info : " + mon_info_event_count);
         console.log(" WEDNESDAY high : " + tus_high_event_count + " warn : " + tus_warn_event_count + " aver : " + tus_aver_event_count + " info : " + tus_info_event_count);
         console.log(" MONDAY    high : " + wed_high_event_count + " warn : " + wed_warn_event_count + " aver : " + wed_aver_event_count + " info : " + wed_info_event_count);
         console.log(" THURSDAY  high : " + thu_high_event_count + " warn : " + thu_warn_event_count  + " aver : " + thu_aver_event_count + " info : " + thu_info_event_count);
         console.log(" FRIDAY    high : " + fri_high_event_count + " warn : " + fri_warn_event_count  + " aver : " + fri_aver_event_count + " info : " + fri_info_event_count);
         console.log(" SATURDAY  high : " + sat_high_event_count + " warn : " + sat_warn_event_count  + " aver : " + sat_aver_event_count + " info : " + sat_info_event_count);
         console.log(" SUNDAY    high : " + sun_high_event_count + " warn : " + sun_warn_event_count  + " aver : " + sun_aver_event_count + " info : " + sun_info_event_count);
         console.log(JSON.stringify(infoEventArr));
         console.log(JSON.stringify(warnEventArr));
         console.log(JSON.stringify(highEventArr));
         console.log(JSON.stringify(averEventArr));
         */
        $(function () {
            Highcharts.chart('chart_dayEvent', {
                chart: {
                    type: 'column',
                    renderTo: 'chart_dayEvent',
                    height: 280,
                    backgroundColor: '#424973',
                    spacingTop: 10
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                legend: {
                    enabled: false,
                    itemStyle: {
                        color: '#a2adcc'
                    }
                },
                xAxis: {
                    gridLineWidth: 1,
                    gridLineColor: 'gray',
                    categories: [
                        '월요일',
                        '화요일',
                        '수요일',
                        '목요일',
                        '금요일',
                        '토요일',
                        '일요일'
                    ],
                    title: {
                        text: ''
                    },
                    labels: {
                        style: {
                            color: '#a2adcc'
                        }
                    }
                },
                yAxis: {
                    gridLineWidth: 1,
                    gridLineColor: 'gray',
                    min: 0,
                    title: {
                        text: ''
                    },
                    labels: {
                        style: {
                            color: '#a2adcc'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    style: {
                        color: '#FBFBFB'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    style: {
                        color: '#FBFBFB'
                    }
                },
                series: [{
                    name: 'high',
                    data: highEventArr,
                    color: '#E97659'
                }, {
                    name: 'average',
                    data: averEventArr,
                    color: '#FFA059'
                }, {
                    name: 'warring',
                    data: warnEventArr,
                    color: '#FFC859'
                }, {
                    name: 'information',
                    data: infoEventArr,
                    color: '#7499FF'
                }],
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false,
                            symbolStroke: 'transparent',
                            theme: {
                                fill: '#626992'
                            }
                        }
                    }
                }
            });
        });
    });
}

function dashboardEventAckChart() {
    var dataObj = new Object();
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEDAY * 7) / 1000);
    var markerObj = new Object();
    var hoverObj = new Object();
    var eventArr = [];
    var ackArr = [];
    var dataSet = [];

    var resolveEventArr = [];

    zbxApi.getEvent.getByTime(startTime).then(function (data) {
        eventArr = data.result;
        console.log("1212121212");
        console.log(eventArr);

        $.each(eventArr, function (k, v) {
            if (v.hosts.length == 0) {
                console.log("ppp");
                console.log(v);
                return true;
            }

            if (v.value == 0) { //상태가 OK인 event 에서

                var triggerId = v.relatedObject.triggerid;

                for (var i = 1; i < k; i++) { // 같은 triggerId인 가장 최근 Problem 찾기

                    if (eventArr[k - i].relatedObject.triggerid == triggerId && eventArr[k - i].value == 1) {

                        var okEventTime = new Date(parseInt(v.clock) * 1000);
                        var problemEventTime = new Date(parseInt(eventArr[k - i].clock) * 1000);
                        var resolveObj = new Object();
                        resolveObj.x = parseInt(v.clock) * 1000;
                        resolveObj.y = okEventTime - problemEventTime;
                        resolveObj.host = v.hosts[0].host;
                        resolveObj.description = v.relatedObject.description;
                        resolveObj.type = "resolve";

                        if (v.relatedObject.priority == 2) {
                            resolveObj.priority = "Warning";
                        } else if (v.relatedObject.priority == 4) {
                            resolveObj.priority = "High";
                        } else if (v.relatedObject.priority == 0) {
                            resolveObj.priority = "Not classfied";
                        } else if (v.relatedObject.priority == 1) {
                            resolveObj.priority = "Information";
                        } else if (v.relatedObject.priority == 3) {
                            resolveObj.priority = "Average";
                        }
                        else if (v.relatedObject.priority == 5) {
                            resolveObj.priority = "Disaster";
                        }


                        resolveEventArr.push(resolveObj);
                        break;
                    }
                }
//        		for(var i=1; i< eventArr.length-k; i++){ // 같은 triggerId인 가장 최근 Problem 찾기
//
//        			if(eventArr[k+i].relatedObject.triggerid == triggerId && eventArr[k+i].value == 1){
//
//        				var okEventTime = new Date(parseInt(v.clock) * 1000);
//        				var problemEventTime = new Date(parseInt(eventArr[k+i].clock) * 1000);
//
//        				var resolveObj = new Object();
//        				resolveObj.x = parseInt(v.clock) * 1000;
//        				resolveObj.y = okEventTime - problemEventTime;
//        				resolveObj.host = v.hosts[0].host;
//        				resolveObj.description = v.relatedObject.description;
//        				resolveObj.type = "resolve";
//
//                		if(v.relatedObject.priority == 2){
//                			resolveObj.priority = "Warning";
//                		}else if(v.relatedObject.priority == 4){
//                			resolveObj.priority = "High";
//                		}
//                		resolveEventArr.push(resolveObj);
//        				break;
//        			}
//        		}
            }

            if (v.acknowledged == "1" && v.acknowledges.length != 0) {

                var eventAckTime = new Date(parseInt(v.acknowledges[0].clock) * 1000);
                var eventCreateTime = new Date(parseInt(v.clock) * 1000);

                var ackObj = new Object();
                ackObj.x = parseInt(v.acknowledges[0].clock) * 1000;
                ackObj.y = eventAckTime - eventCreateTime;
                ackObj.host = v.hosts[0].host;
                ackObj.description = v.relatedObject.description;
                ackObj.type = "ack";

                if (v.relatedObject.priority == 2) {
                    ackObj.priority = "Warning";
                } else if (v.relatedObject.priority == 4) {
                    ackObj.priority = "High";
                }
                lastAckEventId = v.eventid;
                console.log("lastAckEventId : " + lastAckEventId);
                ackArr.push(ackObj);
            }
        });

        dataObj = new Object();
        dataObj.name = '이벤트 인지';
        dataObj.color = 'rgba(255, 165, 0, 0.5)';//'#ee6866';
        dataObj.data = ackArr;
        markerObj = new Object();
        markerObj.lineColor = 'rgba(255, 140, 0, 0.7)';//'red';
        markerObj.lineWidth = 1;

//		hoverObj = new Object();
//		hoverObj.enabled = true;
//		hoverObj.lineColor = 'red';
//		markerObj.states = hoverObj;

        dataObj.marker = markerObj;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '이벤트 해소';
        dataObj.color = 'rgba(0, 191, 255, 0.5)';//'#0088CE';
        dataObj.data = resolveEventArr;
        markerObj = new Object();
        markerObj.lineColor = 'rgba(135, 206, 235, 0.7)';//'#91b3d8';
        markerObj.lineWidth = 1;
        dataObj.marker = markerObj;
        dataSet.push(dataObj);

        showScatterPlotChart("chart_eventAck", (LONGTIME_ONEDAY * 7 * 1000), dataSet, ['red', 'blue']);

    });
}


function addEventAckChart() {
    /*
     zbxApi.getEvent.getById(lastAckEventId).then(function(data) {
     console.log("lastAckEventId : " + lastAckEventId);
     console.log("ack Data Adding ..");
     console.log(data);
     eventArr = data.result;
     $.each(eventArr, function(k,v){
     if(v.acknowledged == "1"){
     //dash_eventAckChart.series[0].addPoint([v[0], v[1]]);
     var eventAckTime =  new Date(parseInt(v.acknowledges[0].clock) * 1000);
     var eventCreateTime =  new Date(parseInt(v.clock) * 1000);
     var ackObj = new Object();
     ackObj.x = parseInt(v.acknowledges[0].clock) * 1000;
     ackObj.y = eventAckTime-eventCreateTime;
     ackObj.host = v.hosts[0].host;
     ackObj.description = v.relatedObject.description;
     ackObj.type = "ack";
     if(v.relatedObject.priority == 2){
     ackObj.priority = "Warning";
     }else if(v.relatedObject.priority == 4){
     ackObj.priority = "High";
     }
     lastAckEventId = v.eventid;
     console.log("lastAckEventId : " + lastAckEventId);
     //ackArr.push(ackObj);
     dash_eventAckChart.series[0].addPoint(ackObj);
     }
     });
     });
     */
}

function dashboardWeekTopEvent() {

    var DAYS = {
        "MONDAY": 0,
        "TUESDAY": 1,
        "WEDNESDAY": 2,
        "THURSDAY": 3,
        "FRIDAY": 4,
        "SATURDAY": 5,
        "SUNDAY": 6,
        "NEXTMONDAY": 7
    };
    var d = new Date();
    var date = d.getDate();
    var day = d.getDay();
    var startDay = date - (day + 7) + 1;
    var startDate = new Date(d.getFullYear(), d.getMonth(), startDay, 0, 0, 0);

    var lastWeekStartTime = startDate.getTime() / 1000;
    var lastDaysTimeArr = [];

    var alldayEventArr = [];

    var mondayUniqueTrigger = [];
    var tuesdayUniqueTrigger = [];
    var wednesdayUniqueTrigger = [];
    var thursdayUniqueTrigger = [];
    var fridayUniqueTrigger = [];
    var saturdayUniqueTrigger = [];
    var sundayUniqueTrigger = [];

    var mondayEventStatArr = [];
    var tuesdayEventStatArr = [];
    var wednesdayEventStatArr = [];
    var thursdayEventStatArr = [];
    var fridayEventStatArr = [];
    var saturdayEventStatArr = [];
    var sundayEventStatArr = [];

    var daysEventTotCount = [0, 0, 0, 0, 0, 0, 0];
    var TOP_COUNT = 5;

    // 지난주 요일별 시작시간 세팅
    for (var i = 0; i < 8; i++) {
        lastDaysTimeArr[i] = lastWeekStartTime + (86400 * i);
    }

    zbxApi.getEvent.getByTime(lastWeekStartTime).then(function (data) {

        var eventArr = data.result;

        $.each(eventArr, function (k, v) {
            if (v.hosts.length == 0) {
                return;
            }

            if (v.value == 1) {
                if (v.clock >= lastDaysTimeArr[DAYS.MONDAY] && v.clock < lastDaysTimeArr[DAYS.TUESDAY]) { //월요일

                    daysEventTotCount[DAYS.MONDAY] += 1;
                    if (mondayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        mondayUniqueTrigger.push(v.relatedObject.description);
                        var mondayEventStatObj = new Object();
                        mondayEventStatObj.triggerid = v.relatedObject.triggerid;
                        mondayEventStatObj.count = 1;
                        mondayEventStatObj.host = v.hosts[0].host;
                        mondayEventStatObj.description = v.relatedObject.description;
                        mondayEventStatArr.push(mondayEventStatObj);
                    } else {
                        $.each(mondayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.TUESDAY] && v.clock < lastDaysTimeArr[DAYS.WEDNESDAY]) { // 화요일

                    daysEventTotCount[DAYS.TUESDAY] += 1;
                    if (tuesdayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        tuesdayUniqueTrigger.push(v.relatedObject.description);
                        var tuesdayEventStatObj = new Object();
                        tuesdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        tuesdayEventStatObj.count = 1;
                        tuesdayEventStatObj.host = v.hosts[0].host;
                        tuesdayEventStatObj.description = v.relatedObject.description;
                        tuesdayEventStatArr.push(tuesdayEventStatObj);
                    } else {
                        $.each(tuesdayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.WEDNESDAY] && v.clock < lastDaysTimeArr[DAYS.THURSDAY]) { //수요일

                    daysEventTotCount[DAYS.WEDNESDAY] += 1;
                    if (wednesdayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        wednesdayUniqueTrigger.push(v.relatedObject.description);
                        var wednesdayEventStatObj = new Object();
                        wednesdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        wednesdayEventStatObj.count = 1;
                        wednesdayEventStatObj.host = v.hosts[0].host;
                        wednesdayEventStatObj.description = v.relatedObject.description;
                        wednesdayEventStatArr.push(wednesdayEventStatObj);
                    } else {
                        $.each(wednesdayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.THURSDAY] && v.clock < lastDaysTimeArr[DAYS.FRIDAY]) { //목요일

                    daysEventTotCount[DAYS.THURSDAY] += 1;
                    if (thursdayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        thursdayUniqueTrigger.push(v.relatedObject.description);
                        var thurdayEventStatObj = new Object();
                        thurdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        thurdayEventStatObj.count = 1;
                        thurdayEventStatObj.host = v.hosts[0].host;
                        thurdayEventStatObj.description = v.relatedObject.description;
                        thursdayEventStatArr.push(thurdayEventStatObj);
                    } else {
                        $.each(thursdayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.FRIDAY] && v.clock < lastDaysTimeArr[DAYS.SATURDAY]) { // 금요일

                    daysEventTotCount[DAYS.FRIDAY] += 1;
                    if (fridayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        fridayUniqueTrigger.push(v.relatedObject.description);
                        var fridayEventStatObj = new Object();
                        fridayEventStatObj.triggerid = v.relatedObject.triggerid;
                        fridayEventStatObj.count = 1;
                        fridayEventStatObj.host = v.hosts[0].host;
                        fridayEventStatObj.description = v.relatedObject.description;
                        fridayEventStatArr.push(fridayEventStatObj);
                    } else {
                        $.each(fridayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.SATURDAY] && v.clock < lastDaysTimeArr[DAYS.SUNDAY]) { // 토요일

                    daysEventTotCount[DAYS.SATURDAY] += 1;
                    if (saturdayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        saturdayUniqueTrigger.push(v.relatedObject.description);
                        var saturdayEventStatObj = new Object();
                        saturdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        saturdayEventStatObj.count = 1;
                        saturdayEventStatObj.host = v.hosts[0].host;
                        saturdayEventStatObj.description = v.relatedObject.description;
                        saturdayEventStatArr.push(saturdayEventStatObj);
                    } else {
                        $.each(saturdayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }

                } else if (v.clock >= lastDaysTimeArr[DAYS.SUNDAY] && v.clock < lastDaysTimeArr[DAYS.NEXTMONDAY]) { // 일요일

                    daysEventTotCount[DAYS.SUNDAY] += 1;
                    if (sundayUniqueTrigger.indexOf(v.relatedObject.description) == -1) {
                        sundayUniqueTrigger.push(v.relatedObject.description);
                        var sundayEventStatObj = new Object();
                        sundayEventStatObj.triggerid = v.relatedObject.triggerid;
                        sundayEventStatObj.count = 1;
                        sundayEventStatObj.host = v.hosts[0].host;
                        sundayEventStatObj.description = v.relatedObject.description;
                        sundayEventStatArr.push(sundayEventStatObj);
                    } else {
                        $.each(sundayEventStatArr, function (k2, v2) {
                            if (v2.description == v.relatedObject.description) {
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }
            }
        });

        alldayEventArr.push(mondayEventStatArr);
        alldayEventArr.push(tuesdayEventStatArr);
        alldayEventArr.push(wednesdayEventStatArr);
        alldayEventArr.push(thursdayEventStatArr);
        alldayEventArr.push(fridayEventStatArr);
        alldayEventArr.push(saturdayEventStatArr);
        alldayEventArr.push(sundayEventStatArr);

        $.each(alldayEventArr, function (k, v) {
            v.sort(function (a, b) {
                return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
            });
        });


        var tblHTML = "";
        for (var k = 0; k < alldayEventArr.length; ++k) {

            tblHTML += "<td width='14.29%' class='br_b line valignt align_center'>";
            tblHTML += "<div class='s1'>" + daysEventTotCount[k] + "</div>";

            for (var i = 0; i < TOP_COUNT; ++i) {
                if (typeof alldayEventArr[k][i] == "undefined") {
                    break;
                }
                var count = alldayEventArr[k][i].count;
                var percentage = (alldayEventArr[k][i].count / daysEventTotCount[k]) * 100;
                var triggerName = alldayEventArr[k][i].description;
                var host = alldayEventArr[k][i].host;

                tblHTML += "<div class='s2 align_center valignt'>";
                tblHTML += "<li class='line p1'>";
                tblHTML += "<div class='o1'>" + percentage.toFixed(1) + "%</div>";
                tblHTML += "<div class='scw br3'><div class='mt2 bg7 br3' style='width:" + percentage.toFixed(1) + "%; height:5px;'></div></div>";
                tblHTML += "</li>";
                tblHTML += "<li class='p2'>" + count + "건</li>";
                tblHTML += "</div>";
                tblHTML += "<div class='s3 align_left'>";
                tblHTML += "<a style='width:100%; height:18px; display:inline-block;' title='" + triggerName + "(" + host + ")'>";
                tblHTML += "<span class='smd'>" + triggerName + "</span></a>";
                tblHTML += "</div>";
            }
            tblHTML += "</td>";
        }

        $("#topDayEvent").empty();
        $("#topDayEvent").append(tblHTML);

    });

}

function addHostEventList(hostEvent) {

    var DAYTOMILLS = 1000 * 60 * 60 * 24;
    var date = new Date();
    var addStartTime = date.getTime() - DAYTOMILLS;
    var addEndTime = date.getTime();
    addStartTime = parseInt(addStartTime / 1000);
    addEndTime = parseInt(addEndTime / 1000);
    console.log(" addStartTime : " + addStartTime + " addEndTime : " + addEndTime);

    var addHostNum = 0;
    var addHostid = '';
    var addHostCnt = 0;
    var addEventList = '';

    $.each(hostEvent.result, function (k, v) {
        var addDataSet = [];
        var addDataObj = new Object();

        zbxApi.alerthostTrigger.hostGet(v.hostid, addStartTime, addEndTime).then(function (data) {
            addHostid = v.hostid;
            addHostCnt = data.result;

            zbxApi.dashboardHostEvent.hostGet(addStartTime, addEndTime, addHostid).then(function (data) {
                addEventList = data.result;

                var addDataArr = new Array(24);
                try {
                    if (addEventList[0] == undefined) {
                        return true;
                    }

                    for (var i = 0; i < 24; i++) {
                        var HOUR = 60 * 60;//시간
                        var NOW = parseInt(new Date().getTime() / 1000);
                        var event_count = 0;

                        for (var j = 0; j < addEventList.length; j++) {
                            if (addEventList[j].clock < NOW - (24 - i) * HOUR && addEventList[j].clock > NOW - (24 - i + 1) * HOUR) {
                                event_count += 1;
                            }
                        }
                        addDataArr[i] = [(NOW - (i + 1) * HOUR) * 1000, event_count];
                    }
                } catch (e) {
                    console.log(e);
                }

                var addDataObj = new Object();
                addDataObj.name = "hostEvent";
                addDataObj.data = addDataArr;
                addDataSet.push(addDataObj);

                showLineChart('hostChart' + (k + 1), "hostEvent", addDataSet, "", ['#fa7796']);

                $("#eventCnt_" + addHostid).html(addHostCnt);
            });
        });
        //console.log(" addHostid : " + addHostid + " addHostCnt : " + addHostCnt);
//        addEventList = zbxSyncApi.dashboardHostEvent(addStartTime, addEndTime, addHostid);
//        addEventList = zbxApi.dashboardHostEvent.hostGet(addStartTime, addEndTime, addHostid);

//        var addDataArr = new Array(24);
//        try {
//            if(addEventList[0] == undefined){
//                return true;
//            }
//
//            for(var i=0; i<24; i++){
//                var HOUR = 60*60;//시간
//                var NOW = parseInt(new Date().getTime()/1000);
//                var event_count= 0 ;
//
//                for(var j=0;j<addEventList.length;j++) {
//                    if(addEventList[j].clock <NOW-(24-i)*HOUR && addEventList[j].clock >NOW-(24-i+1)*HOUR ){
//                        event_count += 1;
//                    }
//                }
//                addDataArr[i] = [(NOW-(i+1)*HOUR)*1000, event_count];
//            }
//        } catch (e) {
//            console.log(e);
//        }
//
//        var addDataObj = new Object();
//        addDataObj.name = "hostEvent";
//        addDataObj.data = addDataArr;
//        addDataSet.push(addDataObj);

//        showLineChart('hostChart'+(k+1), "hostEvent", addDataSet, "", ['#a2adcc']);
//        $("#eventCnt_" + addHostid).html(addHostCnt);
    });
}

function dashEventListAppend() {
    console.log(" dashEventListAppend ");
    var div = $("#eventListDiv");
    if (div[0].scrollHeight - div.scrollTop() == div.outerHeight()) {
        console.log(" END SCROLL ");
        var lastRowIdFrom = $("#eventListDiv tr:last").attr('id');
        lastRowIdFrom = lastRowIdFrom - 1;
        var appendData = '';
        console.log(" last Row From : " + lastRowIdFrom);

        zbxApi.eventStatusViewAppend.get(lastRowIdFrom).done(function (data, status, jqXHR) {

            var triggerIdArr = [];
            var uniqueTriggerIdArr = [];
            var eventMergeArr = [];

            // 모든 트리거 아이디를 배열에 담는다.
            $.each(data.result, function (k, v) {
                triggerIdArr.push(v.relatedObject.triggerid);
            });

            // 트리거 아이디 배열의 중복 제거
            $.each(triggerIdArr, function (k1, v1) {
                if (uniqueTriggerIdArr.indexOf(v1) == -1) {
                    uniqueTriggerIdArr.push(v1);
                }
            });

            // 트리거 아이디 별 이벤트 분리
            var eventArrByTriggerId = new Array(uniqueTriggerIdArr.size);

            $.each(uniqueTriggerIdArr, function (k, v) { //유니크 트리거 아이디 배열
                eventArrByTriggerId[k] = new Array();
                $.each(data.result, function (k1, v1) { //이벤트 배열
                    if (v == v1.relatedObject.triggerid) {

                        dataObj = new Object();
                        dataObj.triggerId = v1.relatedObject.triggerid;
                        dataObj.objectId = v1.objectid;
                        dataObj.eventId = v1.eventid;
                        dataObj.severity = convPriority(v1.relatedObject.priority);
                        dataObj.status = convStatusEvent(v1.value);
                        dataObj.ack = convAckEvent(v1.acknowledged);
                        if (v1.acknowledges[0] == undefined) {
                            dataObj.ackTime = "-";
                        } else {
                            dataObj.ackTime = convTime(v1.acknowledges[0].clock);
                        }
                        dataObj.host = v1.hosts[0].name;
                        ;
                        dataObj.description = v1.relatedObject.description;
                        dataObj.clock = v1.clock;
                        dataObj.duration = 0;

                        eventArrByTriggerId[k].push(dataObj);
                    }
                });
            });
            //console.log(eventArrByTriggerId);

            // 이벤트 별 지속시간 계산 후, 트리거 아이디로 분리된 이벤트 배열 merge
            $.each(eventArrByTriggerId, function (k, v) {
                var previousClock = Math.ceil(parseInt(new Date().getTime()) / 1000);
                console.log("previousClock : " + previousClock);

                $.each(v, function (k1, v1) {
                    v1.duration = convertTime(previousClock - parseInt(v1.clock));
                    previousClock = parseInt(v1.clock);
                    eventMergeArr.push(v1);

                });
            });
            //console.log(eventMergeArr);

            // Merge된 이벤트 배열 clock 순으로 정렬
            eventMergeArr.sort(function (a, b) {
                return a.clock > b.clock ? -1 : a.clock < b.clock ? 1 : 0;
            });
            //console.log(eventMergeArr);

            var eventTable = '';
            //eventTable += "<tr role='row' id='" + eventMergeArr[0].eventId + "'>";

            $.each(eventMergeArr, function (k, v) {
                var objectId = v.objectId;
                var eventId = v.eventId;
                var severity = v.severity;
                var status = v.status;
                var clock = convTime(v.clock);
                var duration = v.duration;
                var ack = v.ack;
                var ackTime = v.ackTime;
                var host = v.host;
                var description = v.description;

                eventTable += "<tr role='row' id='" + eventId + "'>";
                if (severity == "information") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#7499FF'>" + severity + "</td>";
                } else if (severity == "warning") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFC859'>" + severity + "</td>";
                } else if (severity == "average") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFA059'>" + severity + "</td>";
                } else if (severity == "high") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#E97659'>" + severity + "</td>";
                } else {
                    eventTable += "<td width='80' class='line c_b1' style='color:red'>" + severity + "</td>";
                }
                if (status == "정상") {
                    eventTable += "<td width='60' class='line' style='color:#00AA00'>" + status + "</td>";
                } else {
                    eventTable += "<td width='60' class='line' style='color:#DC0000'>" + status + "</td>";
                }
                eventTable += "<td width='75' class='line'>" + clock + "</td>";
                eventTable += "<td width='75' class='line'>" + duration + "</td>";
                if (ack == "미인지") {
                    eventTable += "<td width='69' class='line'><a style='color:#c45959' onclick='eventAckDetailView(" + eventId + ", " + objectId + ", this);' href='#none'>" + ack + "</a></td>";
                } else if (ack == "인지") {
                    eventTable += "<td width='69' class='line'><a style='color:#529238' onclick='eventAckDetailView(" + eventId + ", " + objectId + ");' href='#none'>" + ack + "</a></td>";
                }
                eventTable += "<td width='75' class='line'>" + ackTime + "</td>";
                eventTable += "<td width='100' class='line'>" + host + "</td>";
                eventTable += "<td width='auto' class='align_left ponter'>" +
                    "<a style='width:100%; height:18px; display:inline-block;' title='" + description + "'>" +
                    "<span class='smd'>" + description + "</span></a></td>";
                eventTable += "</tr>";
            });

            $("#dashboardEventList").append(eventTable);

            /*
            appendData = zbxApi.eventStatusViewAppend.success(data);
            var eventId = '';
            var severity = '';
            var status = '';
            var lastchange = '';
            var age = '';
            var ack = '';
            var ackTime = '';
            var host = '';
            var description = '';
            var objectId = '';
            var clock = '';
            $.each(appendData.result, function (k, v) {
                objectId = v.objectid;
                eventId = v.eventid;
                severity = convPriority(v.relatedObject.priority);
                status = convStatusEvent(v.value);
                lastchange = convTime(v.relatedObject.lastchange);
                clock = convTime(v.clock);
                age = convDeltaTime(v.relatedObject.lastchange);
                ack = convAckEvent(v.acknowledged);
                if(v.acknowledges[0] == undefined){
                    ackTime = "-";
                } else {
                    ackTime = convTime(v.acknowledges[0].clock);
                }
                host = v.hosts[0].name;
                description = v.relatedObject.description;
                var eventTable = '';
                eventTable += "<tr role='row' id='" + eventId + "'>";
                if(severity == "information") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#7499FF'>" + severity + "</td>";
                } else if(severity == "warning") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFC859'>" + severity + "</td>";
                } else if(severity == "average") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFA059'>" + severity + "</td>";
                } else if(severity == "high") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#E97659'>" + severity + "</td>";
                } else {
                    eventTable += "<td width='80' class='line c_b1'>" + severity + "</td>";
                }
                if(status == "정상"){
                    eventTable += "<td width='60' class='line' style='color:green'>" + status + "</td>";
                }else{
                    eventTable += "<td width='60' class='line' style='color:red'>" + status + "</td>";
                }
                eventTable += "<td width='75' class='line'>" + clock + "</td>";
                eventTable += "<td width='75' class='line'>" + age + "</td>";
                if(ack == "미인지"){
                    eventTable += "<td width='69' class='line'><a style='color:#c45959' onclick='eventAckDetailView("+ eventId +", "+ objectId + ");' href='#none'>" + ack + "</a></td>";
                } else if(ack == "인지"){
                    eventTable += "<td width='69' class='line'><a style='color:#529238' onclick='eventAckDetailView("+ eventId +", "+ objectId + ");' href='#none'>" + ack + "</a></td>";
                }
                eventTable += "<td width='75' class='line'>" + ackTime + "</td>";
                eventTable += "<td width='100' class='line'>" + host + "</td>";
                eventTable += "<td width='auto' class='align_left ponter'>" +
                    "<a style='width:100%; height:25px; display:inline-block;' title='" + description + "'>" +
                    "<span class='smd'>" + description + "</span></a></td>";
                eventTable += "</tr>";
                $("#dashboardEventList").append(eventTable);
                */
        });
    }
}

function dashEventListAppend_org() {
    console.log(" dashEventListAppend ");
    var div = $("#eventListDiv");
    if (div[0].scrollHeight - div.scrollTop() == div.outerHeight()) {
        console.log(" END SCROLL ");
        var lastRowIdFrom = $("#eventListDiv tr:last").attr('id');
        lastRowIdFrom = lastRowIdFrom - 1;
        var appendData = '';
        console.log(" last Row From : " + lastRowIdFrom);

        zbxApi.eventStatusViewAppend.get(lastRowIdFrom).done(function (data, status, jqXHR) {
            appendData = zbxApi.eventStatusViewAppend.success(data);

            var eventId = '';
            var severity = '';
            var status = '';
            var lastchange = '';
            var age = '';
            var ack = '';
            var ackTime = '';
            var host = '';
            var description = '';
            var objectId = '';
            var clock = '';

            $.each(appendData.result, function (k, v) {
                objectId = v.objectid;
                eventId = v.eventid;
                severity = convPriority(v.relatedObject.priority);
                status = convStatusEvent(v.value);
                lastchange = convTime(v.relatedObject.lastchange);
                clock = convTime(v.clock);
                age = convDeltaTime(v.relatedObject.lastchange);
                ack = convAckEvent(v.acknowledged);
                if (v.acknowledges[0] == undefined) {
                    ackTime = "-";
                } else {
                    ackTime = convTime(v.acknowledges[0].clock);
                }
                host = v.hosts[0].name;
                description = v.relatedObject.description;

                var eventTable = '';
                eventTable += "<tr role='row' id='" + eventId + "'>";
                if (severity == "information") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#7499FF'>" + severity + "</td>";
                } else if (severity == "warning") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFC859'>" + severity + "</td>";
                } else if (severity == "average") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#FFA059'>" + severity + "</td>";
                } else if (severity == "high") {
                    eventTable += "<td width='80' class='line c_b1' style='color:#E97659'>" + severity + "</td>";
                } else {
                    eventTable += "<td width='80' class='line c_b1' style='color:red'>" + severity + "</td>";
                }
                if (status == "정상") {
                    eventTable += "<td width='60' class='line' style='color:green'>" + status + "</td>";
                } else {
                    eventTable += "<td width='60' class='line' style='color:red'>" + status + "</td>";
                }
                eventTable += "<td width='75' class='line'>" + clock + "</td>";
                eventTable += "<td width='75' class='line'>" + age + "</td>";
                if (ack == "미인지") {
                    eventTable += "<td width='69' class='line'><a style='color:#c45959' onclick='eventAckDetailView(" + eventId + ", " + objectId + ");' href='#none'>" + ack + "</a></td>";
                } else if (ack == "인지") {
                    eventTable += "<td width='69' class='line'><a style='color:#529238' onclick='eventAckDetailView(" + eventId + ", " + objectId + ");' href='#none'>" + ack + "</a></td>";
                }
                eventTable += "<td width='75' class='line'>" + ackTime + "</td>";
                eventTable += "<td width='100' class='line'>" + host + "</td>";
                eventTable += "<td width='auto' class='align_left ponter'>" +
                    "<a style='width:100%; height:25px; display:inline-block;' title='" + description + "'>" +
                    "<span class='smd'>" + description + "</span></a></td>";
                eventTable += "</tr>";

                $("#dashboardEventList").append(eventTable);
            });
        });
    }
}

function eventStatus_all() {
    console.log(" 이벤트 현황 전체 발생 클릭 ");

    var eventList_All = '';

    var d = new Date();
    var date = d.getDate();
    var beforeWeekTime = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, 0, 0, 0);
    beforeWeekTime = parseInt(beforeWeekTime / 1000);
    console.log(" beforeWeekTime : " + beforeWeekTime);

    zbxApi.dashboardEventDetailList.weekOccurrenceEventList(beforeWeekTime).then(function (data) {
        eventList_All = zbxApi.dashboardEventDetailList.success(data);
        console.log(" eventStatus_all > eventList_All ");
        console.log(eventList_All);

        $("[id^=base]").hide();
        $("#base_dashboardEventList").show();

        pageMove_EventListDetail(eventList_All);
    });
}

function eventStatus_unAcknow() {
    console.log(" 이벤트 현황 1선 처리 전(미인지) 클릭 ");

    var eventList_unKnow = '';

    var d = new Date();
    var date = d.getDate();
    var today_select = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    today_select = parseInt(today_select / 1000);
    console.log(" today_select : " + today_select);

    zbxApi.dashboardEventDetailList.unknowOccurrenceEventList(today_select).then(function (data) {
        eventList_unKnow = zbxApi.dashboardEventDetailList.success(data);
        console.log(" eventStatus_unAcknow > eventList_unKnow ");
        console.log(eventList_unKnow);

        $("[id^=base]").hide();
        $("#base_dashboardEventList").show();

        pageMove_EventListDetail(eventList_unKnow);
    });
}

function eventStatus_today() {
    console.log(" 이벤트 현황 금일 발생 누적 건수 클릭 ");

    var eventList_Today = '';

    var d = new Date();
    var date = d.getDate();
    var today_select = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    today_select = parseInt(today_select / 1000);
    console.log(" today_select : " + today_select);

    zbxApi.dashboardEventDetailList.todayOccurrenceEventList(today_select).then(function (data) {
        eventList_Today = zbxApi.dashboardEventDetailList.success(data);
        console.log(" eventStatus_today > eventList_Today ");
        console.log(eventList_Today);

        $("[id^=base]").hide();
        $("#base_dashboardEventList").show();

        pageMove_EventListDetail(eventList_Today);
    });
}

function choice_Data(day) {
    console.log(" choice_Data ");

    var date, date2 = "";
    var beforeDate, beforeYear, beforeMonth, beforeDay = "";
    var nowDate, nowYear, nowMonth, nowDay = "";
    var finalStartDate, finalEndDate = "";

    date = new Date();
    nowYear = date.getFullYear();
    nowMonth = date.getMonth() + 1;
    nowDay = date.getDate();

    if (nowMonth < 10) {
        nowMonth = "0" + nowMonth;
    }
    if (nowDay < 10) {
        nowDay = "0" + nowDay;
    }

    nowDate = nowYear + "-" + nowMonth + "-" + nowDay;

    date2 = new Date(nowDate);
    date2.setDate(date2.getDate() - day);
    beforeYear = date2.getFullYear();
    beforeMonth = date2.getMonth() + 1;
    beforeDay = date2.getDate();

    if (beforeMonth < 10) {
        beforeMonth = "0" + beforeMonth;
    }
    if (beforeDay < 10) {
        beforeDay = "0" + beforeDay;
    }

    beforeDate = beforeYear + "-" + beforeMonth + "-" + beforeDay;

    finalStartDate = beforeDate;
    finalEndDate = nowDate;

    $("#searchStartDate").val(finalStartDate);
    $("#searchEndDate").val(finalEndDate);

}

function searchDate() {
    console.log(" searchDate ");

    var startDate, endDate, convertStartDate, convertEndDate = '';
    startDate = $("#searchStartDate").val();
    endDate = $("#searchEndDate").val();
    console.log("< 사용자 선택 기간 >");
    console.log(" 시작일 : " + startDate + " , 종료일 : " + endDate);

    console.log(" 입력받은 날짜 시간으로 변경하기 ");
    convertStartDate = new Date(Date.parse(startDate));
    convertStartDate = new Date(convertStartDate.getFullYear(), convertStartDate.getMonth(), convertStartDate.getDate(), 0, 0, 0);
    convertStartDate = convertStartDate.getTime();

    convertEndDate = new Date(Date.parse(endDate));
    convertEndDate = new Date(convertEndDate.getFullYear(), convertEndDate.getMonth(), convertEndDate.getDate(), 0, 0, 0);
    convertEndDate = convertEndDate.getTime();

    convertStartDate = parseInt(convertStartDate / 1000);
    convertEndDate = parseInt(convertEndDate / 1000);

    console.log(" parseInt StartDate : " + convertStartDate);
    console.log(" parseInt EndDate : " + convertEndDate);

    selectDate_DashboardEventStatus(convertStartDate, convertEndDate);
    selectDate_DashboardEventAckChart(convertStartDate, convertEndDate);
}

function selectDate_DashboardEventStatus(convertStartDate, convertEndDate) {
    console.log(" dashboardEventStatus ");

    var totalEvent = '';
    var unacknowEvent = '';
    var todayEvent = '';

    zbxApi.selectDateDashboard.eventStatusAll(convertStartDate, convertEndDate).then(function (data) {
        totalEvent = zbxApi.selectDateDashboard.success(data);
        $("#infobox_alertTrigger").text(totalEvent);
    });

    zbxApi.selectDateDashboard.eventStatusUnAckknowledge(convertStartDate, convertEndDate).then(function (data) {
        unacknowEvent = zbxApi.selectDateDashboard.success(data);
        $("#unAcknowledgedEvents").text(unacknowEvent);
    });

    zbxApi.selectDateDashboard.eventStatusToday(convertEndDate).then(function (data) {
        todayEvent = zbxApi.selectDateDashboard.success(data);
        $("#todayEvents").text(todayEvent);
    });
}

function selectDate_DashboardEventAckChart(convertStartDate, convertEndDate) {
    var dataObj = new Object();
    var markerObj = new Object();
    var hoverObj = new Object();
    var eventArr = [];
    var ackArr = [];
    var dataSet = [];
    var lastAckEventId = '';

    var resolveEventArr = [];

    zbxApi.selectDateDashboard.eventAckStatus(convertStartDate, convertEndDate).then(function (data) {
        eventArr = data.result;

        console.log(" selectDate_DashboardEventAckChart eventArr ");
        console.log(eventArr);

        $.each(eventArr, function (k, v) {
            if (v.hosts.length == 0) {
                return true;
            }

            if (v.value == 0) { //상태가 OK인 event 에서
                var triggerId = v.relatedObject.triggerid;
                for (var i = 1; i < k; i++) { // 같은 triggerId인 가장 최근 Problem 찾기
                    if (eventArr[k - i].relatedObject.triggerid == triggerId && eventArr[k - i].value == 1) {
                        var okEventTime = new Date(parseInt(v.clock) * 1000);
                        var problemEventTime = new Date(parseInt(eventArr[k - i].clock) * 1000);
                        var resolveObj = new Object();
                        resolveObj.x = parseInt(v.clock) * 1000;
                        resolveObj.y = okEventTime - problemEventTime;
                        resolveObj.host = v.hosts[0].host;
                        resolveObj.description = v.relatedObject.description;
                        resolveObj.type = "resolve";

                        if (v.relatedObject.priority == 2) {
                            resolveObj.priority = "Warning";
                        } else if (v.relatedObject.priority == 4) {
                            resolveObj.priority = "High";
                        } else if (v.relatedObject.priority == 0) {
                            resolveObj.priority = "Not classfied";
                        } else if (v.relatedObject.priority == 1) {
                            resolveObj.priority = "Information";
                        } else if (v.relatedObject.priority == 3) {
                            resolveObj.priority = "Average";
                        }
                        else if (v.relatedObject.priority == 5) {
                            resolveObj.priority = "Disaster";
                        }

                        resolveEventArr.push(resolveObj);
                        break;
                    }
                }
            }

            if (v.acknowledged == "1" && v.acknowledges.length != 0) {
                var eventAckTime = new Date(parseInt(v.acknowledges[0].clock) * 1000);
                var eventCreateTime = new Date(parseInt(v.clock) * 1000);

                var ackObj = new Object();
                ackObj.x = parseInt(v.acknowledges[0].clock) * 1000;
                ackObj.y = eventAckTime - eventCreateTime;
                ackObj.host = v.hosts[0].host;
                ackObj.description = v.relatedObject.description;
                ackObj.type = "ack";

                if (v.relatedObject.priority == 2) {
                    ackObj.priority = "Warning";
                } else if (v.relatedObject.priority == 4) {
                    ackObj.priority = "High";
                }
                lastAckEventId = v.eventid;
                console.log("lastAckEventId : " + lastAckEventId);
                ackArr.push(ackObj);
            }
        });

        dataObj = new Object();
        dataObj.name = '이벤트 인지';
        dataObj.color = 'rgba(255, 165, 0, 0.5)';//'#ee6866';
        dataObj.data = ackArr;
        markerObj = new Object();
        markerObj.lineColor = 'rgba(255, 140, 0, 0.7)';//'red';
        markerObj.lineWidth = 1;

        dataObj.marker = markerObj;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '이벤트 해소';
        dataObj.color = 'rgba(0, 191, 255, 0.5)';//'#0088CE';
        dataObj.data = resolveEventArr;
        markerObj = new Object();
        markerObj.lineColor = 'rgba(135, 206, 235, 0.7)';//'#91b3d8';
        markerObj.lineWidth = 1;
        dataObj.marker = markerObj;
        dataSet.push(dataObj);

        showScatterPlotChart_selectDate("chart_eventAck", (convertStartDate * 1000), (convertEndDate * 1000), dataSet, ['red', 'blue']);

    });
}
