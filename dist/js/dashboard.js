function dashboardView(){
    $(".info-box-content").block(blockUI_opt_el);

    //이벤트 목록
    dashboardEventList();
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
        var host = v.hosts[0].host;
        var description = v.description;

        eventTable += "<tr>";
        eventTable += "<td width='87' class='line c_b1'>" + severity + "</td>";
        eventTable += "<td width='79' class='line'>" + status + "</td>";
        eventTable += "<td width='128' class='line'>" + lastchange + "</td>";
        eventTable += "<td width='95' class='line'>" + age + "</td>";
        eventTable += "<td width='69' class='line'>" + ack + "</td>";
        eventTable += "<td width='110' class='line'>" + host + "</td>";
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