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

function dashboardHostEvent(){

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

function callApiForDashboardEvent() {
    return zbxSyncApi.dashboardTrigger();
}