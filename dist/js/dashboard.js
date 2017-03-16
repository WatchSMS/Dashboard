function dashboardView(){
    $(".info-box-content").block(blockUI_opt_el);

    //이벤트 현황
    dashboardEventStatus();

    //호스트별 장애현황
    var hostEvent = zbxSyncApi.dashboardHostInfo();
    dashboardHostEvent(hostEvent);

    //이벤트 목록
    dashboardEventList();

    //요일별이벤트발생빈도
    dashboardDayEvent();
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
    var hostNum = 0;
    var hostName = '';
    var hostEventCnt = 0;

    var tableDataArr = [];

    var dashboardHostEventHTML = '';

    dashboardHostEventHTML += "<tbody>";

    $.each(hostEvent.result, function(k, v){
        hostNum += 1;
        hostName = v.name;
        hostEventCnt = zbxSyncApi.alerthostTrigger(v.hostid);

        var tableDataObj = {};
        tableDataObj.hostNum = hostNum;
        tableDataObj.hostName = hostName;
        tableDataObj.hostEventCnt = hostEventCnt;
        tableDataArr.push(tableDataObj);

        dashboardHostEventHTML += "<tr class='p1'>";
        dashboardHostEventHTML += "<td width='48px' class='line-td'>" + hostNum + "</td>";
        dashboardHostEventHTML += "<td width='165px' class='line-td align_left'>" + hostName + "</td>";
        dashboardHostEventHTML += "<td width='73px' class='line-td'>" + hostEventCnt + "</td>";
        dashboardHostEventHTML += "<td width='auto'>" + hostNum + "</td>";
        dashboardHostEventHTML += "</tr>";
    });
    dashboardHostEventHTML += "</tbody>";
    $("#hostEventList").empty();
    $("#hostEventList").append(dashboardHostEventHTML);
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
        var ackTime = zbxSyncApi.dashboardEvent(eventId);
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

function dashboardDayEvent(){ //selectRelatedObject
    //DAY-7
    var DAYTOMILLS = 1000*60*60*24;
    var date = new Date();
    var date2 = date.setDate(date.getDate(new Date(day_select)) - 7);
    var day_select = date2 - (date2 % DAYTOMILLS);
        console.log(" today_select - 7 : " + new Date(day_select));
        console.log(" today_select - 7 : " + day_select);
        day_select = day_select / 1000;

    var curTime = new Date();
        curTime = curTime-(curTime % DAYTOMILLS);
        console.log("13 curTime : " + new Date(curTime));
        console.log("13 curTime : " + curTime);

    var event_data = zbxSyncApi.dashboardDayEvent(day_select);
    var event_id = '';
    var event_clock = '';
    var event_triggerId = '';
    var event_priority = 0;

    $.each(event_data, function(k, v){
        event_id = v.eventid;
        event_clock = v.clock * 1000;
        event_triggerId = v.relatedObject.triggerid;
        event_priority = v.relatedObject.priority;
        console.log(" EVENT ID : " + event_id + " / CLOCK : " + event_clock + " / TRIGGER ID : " + event_triggerId + " / PRIORITY : " + event_priority);

        for(var i=0; i<7; i++){
            if(event_clock > (i+1)*(curTime-(i*DAYTOMILLS)) && event_clock < (i+1)*(curTime-((i+1)*DAYTOMILLS))){ //DAY-1
                console.log(" curTime EVENT ID : " + event_id + " / CLOCK : " + event_clock + " / TRIGGER ID : " + event_triggerId + " / PRIORITY : " + event_priority);
            }
        }
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