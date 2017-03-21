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
    var dashboard_Event = '';
    zbxApi.dashboardEventList.get().then(function(data) {
        dashboard_Event = zbxApi.dashboardEventList.success(data);
        dashboardEventList(dashboard_Event);
    });

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

    var totalEvent = '';
    var unacknowEvent = '';
    var todayEvent = '';

    zbxApi.alertTrigger.get().then(function(data) {
        totalEvent = zbxApi.alertTrigger.success(data);
        $("#infobox_alertTrigger").text(totalEvent);
    });

    zbxApi.unAckknowledgeEvent.get().then(function(data) {
        unacknowEvent = zbxApi.unAckknowledgeEvent.success(data);
        $("#unAcknowledgedEvents").text(unacknowEvent);
    });

    zbxApi.todayEvent.get().then(function(data) {
        todayEvent = zbxApi.todayEvent.success(data);
        $("#todayEvents").text(todayEvent);
    });
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
        //console.log(" " + v.name + " 아이우에오 " + v.hostid);
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
                //console.log(" i : " + i + " / RESULT = start_clock : " + start_clock + " / end_clock : " + end_clock + " / event_count : " + event_count);

                dataArr[i] = [start_clock,event_count];

                //console.log(JSON.stringify(dataArr[i]));
            }
        } catch (e) {
            console.log(e);
        }

        var hostDataObj = new Object();
        hostDataObj.name = "hostEvent";
        hostDataObj.data = dataArr;
        hostDataSet.push(hostDataObj);

        dashboardHostEventHTML += "<tr class='p1'>";
        dashboardHostEventHTML += "<td width='48px' height='70px' class='line-td'>" + hostNum + "</td>";
        dashboardHostEventHTML += "<td width='165px' height='70px' class='line-td align_left'>" + hostName + "</td>";
        dashboardHostEventHTML += "<td width='73px' height='70px' class='line-td'>" + hostEventCnt + "</td>";
        dashboardHostEventHTML += "<td width='auto' height='70px' id='hostChart"+hostNum+"'></td>";
        dashboardHostEventHTML += "</tr>";

    });
    dashboardHostEventHTML += "</tbody>";

    $("#hostEventList").empty();
    $("#hostEventList").append(dashboardHostEventHTML);
    $.each(hostDataSet, function(k,v){
        var tempArr = [];
        tempArr.push(v);
        showLineChart('hostChart'+(k+1), "hostEvent", tempArr, "", ['deepskyblue']);
    });
}

function dashboardEventList(dashboard_Event) {
    //console.log(dashboard_Event);
    //console.log(JSON.stringify(dashboard_Event));
    var severity = '';
    var status = '';
    var lastchange = '';
    var age = '';
    var ack = '';
    var ackTime = '';
    var host = '';
    var description = '';

    var eventTable = '';

    eventTable += '<tbody>';

    $.each(dashboard_Event.result, function (k, v) {
        severity = convPriority(v.relatedObject.priority);
        status = convStatus(v.value);
        lastchange = convTime(v.relatedObject.lastchange);
        age = convDeltaTime(v.relatedObject.lastchange);
        ack = convAck(v.acknowledged);
        if(v.acknowledges[0] == undefined){
            ackTime = "-";
        } else {
            ackTime = convTime(v.acknowledges[0].clock);
        }
        host = v.hosts[0].host;
        description = v.relatedObject.description;

        eventTable += "<tr>";
        if(severity == "information") {
            eventTable += "<td width='80' class='line c_b1' style='color:deepskyblue'>" + severity + "</td>";
        } else if(severity == "warning") {
            eventTable += "<td width='80' class='line c_b1' style='color:yellow'>" + severity + "</td>";
        } else if(severity == "average") {
            eventTable += "<td width='80' class='line c_b1' style='color:greenyellow'>" + severity + "</td>";
        } else if(severity == "high") {
            eventTable += "<td width='80' class='line c_b1' style='color:red'>" + severity + "</td>";
        } else {
            eventTable += "<td width='80' class='line c_b1'>" + severity + "</td>";
        }
        eventTable += "<td width='60' class='line'>" + status + "</td>";
        eventTable += "<td width='75' class='line'>" + lastchange + "</td>";
        eventTable += "<td width='75' class='line'>" + age + "</td>";
        if(ack == "Unacked"){
            eventTable += "<td width='69' class='line' style='color:red'>" + ack + "</td>";
        } else if(ack = "Acked"){
            eventTable += "<td width='69' class='line'>" + ack + "</td>";
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
}

function dashboardDayEvent(){
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
    for(var i=0; i < 8; i++){
        lastDaysTimeArr[i] = lastWeekStartTime + (86400 * i);
    }

    zbxApi.getEvent.getByBeforeTime(lastWeekStartTime).then(function(data) {
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

        $.each(eventArr, function(k, v) {
            priority = v.relatedObject.priority;
            if(v.clock >= lastDaysTimeArr[DAYS.MONDAY] && v.clock < lastDaysTimeArr[DAYS.TUESDAY]){
                if(priority == 1){
                    mon_info_event_count += 1;
                } else if(priority == 2){
                    mon_warn_event_count += 1;
                } else if(priority == 3){
                    mon_aver_event_count += 1;
                } else if(priority == 4){
                    mon_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            }
            else if(v.clock >= lastDaysTimeArr[DAYS.TUESDAY] && v.clock < lastDaysTimeArr[DAYS.WEDNESDAY]){
                if(priority == 1){
                    tus_info_event_count += 1;
                } else if(priority == 2){
                    tus_warn_event_count += 1;
                } else if(priority == 3){
                    tus_aver_event_count += 1;
                } else if(priority == 4){
                    tus_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if(v.clock >= lastDaysTimeArr[DAYS.WEDNESDAY] && v.clock < lastDaysTimeArr[DAYS.THURSDAY]){
                if(priority == 1){
                    wed_info_event_count += 1;
                } else if(priority == 2){
                    wed_warn_event_count += 1;
                } else if(priority == 3){
                    wed_aver_event_count += 1;
                } else if(priority == 4){
                    wed_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if(v.clock >= lastDaysTimeArr[DAYS.THURSDAY] && v.clock < lastDaysTimeArr[DAYS.FRIDAY]){
                if(priority == 1){
                    thu_info_event_count += 1;
                } else if(priority == 2){
                    thu_warn_event_count += 1;
                } else if(priority == 3){
                    thu_aver_event_count += 1;
                } else if(priority == 4){
                    thu_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if(v.clock >= lastDaysTimeArr[DAYS.FRIDAY] && v.clock < lastDaysTimeArr[DAYS.SATURDAY]){
                if(priority == 1){
                    fri_info_event_count += 1;
                } else if(priority == 2){
                    fri_warn_event_count += 1;
                } else if(priority == 3){
                    fri_aver_event_count += 1;
                } else if(priority == 4){
                    fri_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if(v.clock >= lastDaysTimeArr[DAYS.SATURDAY] && v.clock < lastDaysTimeArr[DAYS.SUNDAY]){
                if(priority == 1){
                    sat_info_event_count += 1;
                } else if(priority == 2){
                    sat_warn_event_count += 1;
                } else if(priority == 3){
                    sat_aver_event_count += 1;
                } else if(priority == 4){
                    sat_high_event_count += 1;
                } else {
                    console.log(" priority ");
                }
            } else if(v.clock >= lastDaysTimeArr[DAYS.SUNDAY] && v.clock < lastDaysTimeArr[DAYS.NEXTMONDAY]){
                if(priority == 1){
                    sun_info_event_count += 1;
                } else if(priority == 2){
                    sun_warn_event_count += 1;
                } else if(priority == 3){
                    sun_aver_event_count += 1;
                } else if(priority == 4){
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
        $(function() {
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
                    data: infoEventArr,
                    color: '#E8B1F1'
                }, {
                    name: 'high',
                    data: highEventArr,
                    color: '#607FFA'
                }, {
                    name: 'average',
                    data: averEventArr,
                    color: '#94F2F2'
                }, {
                    name: 'warring',
                    data: warnEventArr,
                    color: '#B1BEF1'
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