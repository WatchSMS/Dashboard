function dashboardView(){
    $(".info-box-content").block(blockUI_opt_el);

    //이벤트 현황
    dashboardEventStatus();

    //호스트별 장애현황
    var hostEvent = '';
    zbxApi.allServerViewHost.get().done(function(data, status, jqxHR){
        hostEvent = zbxApi.allServerViewHost.success(data);
        dashboardHostEvent(hostEvent);
    });

    //이벤트 목록
    dashboardEventList();

    //요일별이벤트발생빈도
    dashboardDayEvent();
}

function dashboardEventStatus(){
    $.when(zbxApi.alertTrigger.get(), zbxApi.unAckknowledgeEvent.get(), zbxApi.todayEvent.get()).done(function(data_a, data_b, data_c) {
        zbxApi.alertTrigger.success(data_a[0]);
        zbxApi.unAckknowledgeEvent.success(data_b[0]);
        zbxApi.todayEvent.success(data_c[0]);
        $("#lastUpdateDashboard").text(convTime());

    }).fail(function() {
        console.log("dashboardView : Network Error");
        alertDiag("Network Error");
    });
}

function dashboardHostEvent(hostEvent){
    var hostNum = 0;
    var hostName = '';
    var hostEventCnt = 0;

    var tableDataObj = {};
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
    var dashboard_Event = callApiForDashboardEvent();
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
        var ackTime = convTime(v.lastEvent.clock);
        var host = v.hosts[0].host;
        var description = v.description;

        eventTable += "<tr>";
        eventTable += "<td width='80' class='line c_b1'>" + severity + "</td>";
        eventTable += "<td width='70' class='line'>" + status + "</td>";
        eventTable += "<td width='120' class='line'>" + lastchange + "</td>";
        eventTable += "<td width='120' class='line'>" + age + "</td>";
        eventTable += "<td width='69' class='line'>" + ack + "</td>";
        eventTable += "<td width='120' class='line'>" + ackTime + "</td>";
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
                text: '',
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
                    '일요일',
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
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6],
                color: '#FC4747'
            }, {
                name: 'High',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6],
                color: '#F2F234'
            }, {
                name: 'average',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6],
                color: '#FA60CE'
            }, {
                name: 'warring',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6],
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
    });
}

function callApiForDashboardEvent() {
    return zbxSyncApi.dashboardTrigger();
}