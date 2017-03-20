function dashboardView(){
    $.blockUI(blockUI_opt_all);
    offTimer();
    removeAllChart();

    $(".info-box-content").block(blockUI_opt_el);

    //이벤트 현황
    dashboardEventStatus();

    //호스트별 장애현황
    var hostEvent = '';
    zbxApi.dashboardHostInfo.get().then(function(data){
        hostEvent = zbxApi.dashboardHostInfo.success(data);
        dashboardHostEvent(hostEvent);
    });

    //이벤트 목록
    dashboardEventList();

    //요일별이벤트발생빈도
    dashboardDayEvent();

    //이벤트 인지 차트
    dashboardEventAckChart();

    //요일별 Top 이벤트
    dashboardWeekTopEvent();

    $.unblockUI(blockUI_opt_all);

    TIMER_ARR.push(setInterval(function(){addEventAckChart();}, 10000));
}

function dashboardEventStatus(){
    var DAYTOMILLS = 1000*60*60*24;

    var today_select = new Date();
    today_select = today_select-(today_select % DAYTOMILLS);
    today_select = Math.round(today_select / 1000);

    zbxSyncApi.alertTrigger();
    zbxSyncApi.unAckknowledgeEvent();
    zbxSyncApi.todayEvent(today_select);
    console.log("dashboardEventStatus today_select : " + today_select);
}

function dashboardHostEvent(hostEvent){
    //24시간 전 시간 구하기
    var DAYTOMILLS = 1000*60*60*24;
    var date = new Date();
    var beforeTime = date.getTime() - DAYTOMILLS;
    console.log(" beforeTime : " + new Date(beforeTime));
    beforeTime = Math.round(beforeTime / 1000);
    var endTime = date.getTime();
    console.log(" endTime : " + new Date(endTime));
    endTime = Math.round(endTime / 1000);

    console.log(" DAYTOMILLS : " + DAYTOMILLS);
    console.log(" date : " + new Date(date));
    console.log(" round beforeTime : " + beforeTime);
    console.log(" round endTime : " + endTime);

    var hostNum = 0;
    var hostid = '';
    var hostName = '';
    var hostEventCnt = 0;
    var event_clock = 0;

    var eventList = '';
    var start_clock = '';
    var end_clock = '';
    var event_count = 1;

    var hostDataSet=[];
    var dashboardHostEventHTML = '';

    dashboardHostEventHTML += "<tbody>";

    $.each(hostEvent.result, function(k, v){
        console.log(" " + v.name + " 아이우에오 " + v.hostid);
        hostNum += 1;
        hostName = v.name;
        hostid = v.hostid;
        hostEventCnt = zbxSyncApi.alerthostTrigger(v.hostid);
        eventList = zbxSyncApi.dashboardHostEvent(beforeTime, endTime, v.hostid);
        var dataArr = [];
        try {
            event_clock = eventList[0].clock;
            event_clock = event_clock * 1000;
            //console.log(" 1000 event_clock " + event_clock);
            //console.log(" 1000 date : " + new Date(event_clock));
            var d = new Date();
            var date = d.getDate();
            //var day = d.getDay();
            var startday = date - 1;
            //var start_clock = new Date(d.getFullYear(), d.getMonth(), startday, 0, 0, 0);
            //console.log(" start_clock : " + start_clock.getTime());

            for(var i=0; i<24; i++){
                start_clock = new Date(d.getFullYear(), d.getMonth(), startday, i, 0, 0);
                start_clock = start_clock.getTime();
                end_clock = new Date(d.getFullYear(), d.getMonth(), startday, i+1, 0, 0);
                end_clock = end_clock.getTime();
                //console.log("start_clock : " + start_clock + " / end_clock : " + end_clock);

                if(event_clock > start_clock && event_clock < end_clock){
                    event_count += 1;
                }
                console.log(" i : " + i + " / RESULT = start_clock : " + start_clock + " / end_clock : " + end_clock + " / event_count : " + event_count);

                dataArr[i] = [start_clock,event_count];

                console.log(JSON.stringify(dataArr[i]));
            }
        } catch (e) {
            console.log(e);
        }

        var hostDataObj = new Object();
        hostDataObj.name = "hostEvent";
        hostDataObj.data = dataArr;
        hostDataSet.push(hostDataObj);

        dashboardHostEventHTML += "<tr class='p1'>";
        dashboardHostEventHTML += "<td width='48px' height='80px' class='line-td'>" + hostNum + "</td>";
        dashboardHostEventHTML += "<td width='165px' height='80px' class='line-td align_left'>" + hostName + "</td>";
        dashboardHostEventHTML += "<td width='73px' height='80px' class='line-td'>" + hostEventCnt + "</td>";
        dashboardHostEventHTML += "<td width='auto' height='80px' id='hostChart"+hostNum+"'></td>";
        dashboardHostEventHTML += "</tr>";

    });
    dashboardHostEventHTML += "</tbody>";

    $("#hostEventList").empty();
    $("#hostEventList").append(dashboardHostEventHTML);
    $.each(hostDataSet, function(k,v){
        var tempArr = [];
        tempArr.push(v);
        showLineChart('hostChart'+(k+1), "hostEvent", tempArr, "", ['#00B700']);
    });
}

function dashboardEventList() {
    var dashboard_Event = zbxSyncApi.dashboardTrigger();
    //console.log(dashboard_Event);
    //console.log(JSON.stringify(dashboard_Event));

    var eventTable = '';

    eventTable += '<tbody>';

    $.each(dashboard_Event, function (k, v) {
        var severity = convPriority(v.priority);
        var status = convStatus(v.value);
        var lastchange = convTime(v.lastchange);
        var age = convDeltaTime(v.lastchange);
        var ack = convAck(v.lastEvent.acknowledged);
        var eventId = v.lastEvent.eventid;
        var ackTime = '';
        zbxApi.dashboardEvent.get(eventId).then(function(data){
            ackTime = zbxApi.dashboardHostInfo.success(data);
        })
        //console.log("ackTime : " + ackTime);
        ackTime = convTime(ackTime);
        var host = v.hosts[0].host;
        var description = v.description;

        eventTable += "<tr>";
        eventTable += "<td width='80' class='line c_b1'>" + severity + "</td>";
        eventTable += "<td width='60' class='line'>" + status + "</td>";
        eventTable += "<td width='75' class='line'>" + lastchange + "</td>";
        eventTable += "<td width='75' class='line'>" + age + "</td>";
        eventTable += "<td width='69' class='line'>" + ack + "</td>";
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
}

function dashboardDayEvent(){
    var DAYTOMILLS = 1000*60*60*24;
    var date2 = new Date();
    var date = date2.setDate(date2.getDate(new Date(day_select)) - 7);
    console.log(" 기존 시간 : " + date);
    var day_select = date - (date % DAYTOMILLS);
    var today_select = date - (date % DAYTOMILLS);
    //console.log(" today_select - 7 : " + new Date(today_select));
    //console.log(" today_select - 7 : " + today_select);
    today_select = today_select / 1000;

    var curTime = new Date();
    curTime = curTime-(curTime % DAYTOMILLS);
    //console.log("13 curTime : " + new Date(curTime));
    //console.log("13 curTime : " + curTime);

    var event_data = '';
    var event_id = '';
    var event_clock = '';
    var event_triggerId = '';
    var event_priority = 0;

    var event_List = '';

    zbxApi.dashboardDayEvent.get(today_select).then(function(data){
        event_data = zbxApi.dashboardDayEvent.success(data);

        $.each(event_data, function(k, v){
            event_id = v.eventid;
            event_clock = v.clock * 1000;
            try {
                event_triggerId = v.relatedObject.triggerid;
                event_priority = v.relatedObject.priority;
            } catch (e) {
                console.log(e);
            }
            //console.log(" EVENT ID : " + event_id + " / CLOCK : " + event_clock + " / TRIGGER ID : " + event_triggerId + " / PRIORITY : " + event_priority);
        });
    });

    /*$(function() {
     Highcharts.chart('chart_dayEvent', {
     chart: {
     type: 'column',
     height: 300,
     backgroundColor: '#424973',
     spacingTop: 10,
     spacingBottom: 0,
     spacingLeft: 0,
     spacingRight: 0
     },
     title: {
     text: ''
     },
     subtitle: {
     text: ''
     },
     xAxis: {
     gridLineColor: '#FBFBFB',
     lineColor: '#FBFBFB',
     minorGridLineColor: '#505053',
     tickColor: '#FBFBFB',
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
     style: {
     color: '#FBFBFB'
     }
     },
     yAxis: {
     gridLineColor: '#FBFBFB',
     lineColor: '#FBFBFB',
     minorGridLineColor: '#505053',
     tickColor: '#FBFBFB',
     min: 0,
     title: {
     text: ''
     },
     style: {
     color: '#FBFBFB'
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
     name: 'level',
     data: level_Event,
     color: '#FC4747'
     }, {
     name: 'High',
     data: high_Event,
     color: '#F2F234'
     }, {
     name: 'average',
     data: average_Event,
     color: '#FA60CE'
     }, {
     name: 'warring',
     data: warring_Event,
     color: '#F2F234'
     }],
     legend: {
     enabled: false
     },
     exporting: {
     buttons: {
     contextButton: {
     enabled: false,
     symbolStroke: 'transparent',
     theme: {
     fill:'#626992'
     }
     }
     }
     }
     });
     });*/
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

    zbxApi.getEvent.getByTime(startTime).then(function(data) {
        eventArr = data.result;


        $.each(eventArr, function(k,v){
            if(v.value == 0){ //상태가 OK인 event 에서

                var triggerId = v.relatedObject.triggerid;

                for(var i=1; i< k; i++){ // 같은 triggerId인 가장 최근 Problem 찾기

                    if(eventArr[k-i].relatedObject.triggerid == triggerId && eventArr[k-i].value == 1){

                        var okEventTime = new Date(parseInt(v.clock) * 1000);
                        var problemEventTime = new Date(parseInt(eventArr[k-i].clock) * 1000);

                        var resolveObj = new Object();
                        resolveObj.x = parseInt(v.clock) * 1000;
                        resolveObj.y = okEventTime - problemEventTime;
                        resolveObj.host = v.hosts[0].host;
                        resolveObj.description = v.relatedObject.description;
                        resolveObj.type = "resolve";

                        if(v.relatedObject.priority == 2){
                            resolveObj.priority = "Warning";
                        }else if(v.relatedObject.priority == 4){
                            resolveObj.priority = "High";
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

            if(v.acknowledged == "1"){

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

        showScatterPlotChart("chart_eventAck", (LONGTIME_ONEDAY * 7 * 1000), dataSet, ['red','blue']);

    });
}

function addEventAckChart(){

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
}

function dashboardWeekTopEvent(){

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
    var startDay = date - (day+7) + 1;
    var startDate = new Date(d.getFullYear(), d.getMonth(), startDay, 0, 0, 0);

    var lastWeekStartTime = startDate.getTime() / 1000;
    var lastDaysTimeArr = [];

    var mondayEventArr = [];
    var tuesdayEventArr = [];
    var wednesdayEventArr = [];
    var thursdayEventArr = [];
    var fridayEventArr = [];
    var saturdayEventArr = [];
    var sundayEventArr = [];
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

    var daysEventTotCount = [0,0,0,0,0,0,0];
    var TOP_COUNT = 5;

    // 지난주 요일별 시작시간 세팅
    for(var i=0; i < 8; i++){
        lastDaysTimeArr[i] = lastWeekStartTime + (86400 * i);
    }

    zbxApi.getEvent.getByTime(lastWeekStartTime).then(function(data) {

        var eventArr = data.result;

        $.each(eventArr, function(k,v){

            if(v.clock >= lastDaysTimeArr[DAYS.MONDAY] && v.clock < lastDaysTimeArr[DAYS.TUESDAY]){ //월요일

//     			console.log("============= 월요일 =================");
//
//				console.log(v.hosts[0].host);
//				var d =  new Date(parseInt(v.clock)*1000);
//            	console.log(d);
//            	console.log("일 : " + (d.getDate()));
//            	console.log("시 : " + d.getHours());
//            	console.log("분  : " + d.getMinutes());
//            	console.log("초 : " + d.getSeconds());
//				console.log(v.relatedObject.description);
//				console.log(v.relatedObject.priority);

                if(v.value == 0){
                    daysEventTotCount[DAYS.MONDAY] += 1;
                    if(mondayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        mondayUniqueTrigger.push(v.relatedObject.triggerid);
                        var mondayEventStatObj = new Object();
                        mondayEventStatObj.triggerid = v.relatedObject.triggerid;
                        mondayEventStatObj.count = 1;
                        mondayEventStatObj.host = v.hosts[0].host;
                        mondayEventStatObj.description = v.relatedObject.description;
                        mondayEventStatArr.push(mondayEventStatObj);
                    }else{
                        $.each(mondayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }

            }else if(v.clock >= lastDaysTimeArr[DAYS.TUESDAY] && v.clock < lastDaysTimeArr[DAYS.WEDNESDAY]){ // 화요일

                if(v.value == 0){
                    daysEventTotCount[DAYS.TUESDAY] += 1;
                    if(tuesdayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        tuesdayUniqueTrigger.push(v.relatedObject.triggerid);
                        var tuesdayEventStatObj = new Object();
                        tuesdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        tuesdayEventStatObj.count = 1;
                        tuesdayEventStatObj.host = v.hosts[0].host;
                        tuesdayEventStatObj.description = v.relatedObject.description;
                        tuesdayEventStatArr.push(tuesdayEventStatObj);
                    }else{
                        $.each(tuesdayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }

            }else if(v.clock >= lastDaysTimeArr[DAYS.WEDNESDAY] && v.clock < lastDaysTimeArr[DAYS.THURSDAY]){ //수요일

                if(v.value == 0){
                    daysEventTotCount[DAYS.WEDNESDAY] += 1;
                    if(wednesdayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        wednesdayUniqueTrigger.push(v.relatedObject.triggerid);
                        var wednesdayEventStatObj = new Object();
                        wednesdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        wednesdayEventStatObj.count = 1;
                        wednesdayEventStatObj.host = v.hosts[0].host;
                        wednesdayEventStatObj.description = v.relatedObject.description;
                        wednesdayEventStatArr.push(wednesdayEventStatObj);
                    }else{
                        $.each(wednesdayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }

            }else if(v.clock >= lastDaysTimeArr[DAYS.THURSDAY] && v.clock < lastDaysTimeArr[DAYS.FRIDAY]){ //목요일

                if(v.value == 0){
                    daysEventTotCount[DAYS.THURSDAY] += 1;
                    if(thursdayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        thursdayUniqueTrigger.push(v.relatedObject.triggerid);
                        var thurdayEventStatObj = new Object();
                        thurdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        thurdayEventStatObj.count = 1;
                        thurdayEventStatObj.host = v.hosts[0].host;
                        thurdayEventStatObj.description = v.relatedObject.description;
                        thursdayEventStatArr.push(thurdayEventStatObj);
                    }else{
                        $.each(thursdayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }

            }else if(v.clock >= lastDaysTimeArr[DAYS.FRIDAY] && v.clock < lastDaysTimeArr[DAYS.SATURDAY]){ // 금요일

                if(v.value == 0){
                    //fridayEventArr.push(v);
                    daysEventTotCount[DAYS.FRIDAY] += 1;
                    if(fridayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        fridayUniqueTrigger.push(v.relatedObject.triggerid);
                        var fridayEventStatObj = new Object();
                        fridayEventStatObj.triggerid = v.relatedObject.triggerid;
                        fridayEventStatObj.count = 1;
                        fridayEventStatObj.host = v.hosts[0].host;
                        fridayEventStatObj.description = v.relatedObject.description;
                        fridayEventStatArr.push(fridayEventStatObj);
                    }else{
                        $.each(fridayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }


            }else if(v.clock >= lastDaysTimeArr[DAYS.SATURDAY] && v.clock < lastDaysTimeArr[DAYS.SUNDAY]){ // 토요일

                if(v.value == 0){
                    daysEventTotCount[DAYS.SATURDAY] += 1;
                    if(saturdayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        saturdayUniqueTrigger.push(v.relatedObject.triggerid);
                        var saturdayEventStatObj = new Object();
                        saturdayEventStatObj.triggerid = v.relatedObject.triggerid;
                        saturdayEventStatObj.count = 1;
                        saturdayEventStatObj.host = v.hosts[0].host;
                        saturdayEventStatObj.description = v.relatedObject.description;
                        saturdayEventStatArr.push(saturdayEventStatObj);
                    }else{
                        $.each(saturdayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
                                v2.count += 1;
                                return false;
                            }
                        });
                    }
                }


            }else if(v.clock >= lastDaysTimeArr[DAYS.SUNDAY] && v.clock < lastDaysTimeArr[DAYS.NEXTMONDAY]){ // 일요일

                if(v.value == 0){
                    daysEventTotCount[DAYS.SUNDAY] += 1;
                    if(sundayUniqueTrigger.indexOf(v.relatedObject.triggerid)== -1){
                        sundayUniqueTrigger.push(v.relatedObject.triggerid);
                        var sundayEventStatObj = new Object();
                        sundayEventStatObj.triggerid = v.relatedObject.triggerid;
                        sundayEventStatObj.count = 1;
                        sundayEventStatObj.host = v.hosts[0].host;
                        sundayEventStatObj.description = v.relatedObject.description;
                        sundayEventStatArr.push(sundayEventStatObj);
                    }else{
                        $.each(sundayEventStatArr, function(k2,v2){
                            if( v2.triggerid == v.relatedObject.triggerid ){
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

        $.each(alldayEventArr, function(k,v){
            v.sort(function (a,b){
                return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
            });
        });

        var tblHTML = "";
        for(var k=0; k<alldayEventArr.length; ++k){

            tblHTML += "<td width='14.29%' class='br_b line valignt align_center'>";
            tblHTML += "<div class='s1'>" + daysEventTotCount[k] + "</div>";

            for(var i=0; i<TOP_COUNT; ++i){
                if(typeof alldayEventArr[k][i] == "undefined"){
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
                tblHTML += "<a style='width:100%; height:18px; display:inline-block;' title='"+ triggerName + "(" + host + ")'>";
                tblHTML += "<span class='smd'>" + triggerName + "</span></a>";
                tblHTML += "</div>";
            }
            tblHTML += "</td>";
        }

        $("#topDayEvent").empty();
        $("#topDayEvent").append(tblHTML);

    });

}