function eventListView(){
    console.log(" IN eventListView ");

    var data_event = '';
    zbxApi.eventStatusView.get().done(function(data, status, jqXHR) {
        data_event = zbxApi.eventStatusView.success(data);
        console.log("data_event : " + data_event);
        console.log("data_event : " + JSON.stringify(data_event));
        eventList(data_event);
    })
}

function eventList(data_event){
    var eventId = '-';           //이벤트ID
    var eventStatus = '-';       //상태
    var eventPriority = '-';     //등급
    var eventStartTime = '-';    //발생시간
    var eventAckTime = '-';      //인지시간
    var eventAge = '-';          //지속시간
    var eventAcknowledge = '-';  //인지여부
    var eventIp = '-';           //IP
    var eventHostGroup = '-';    //호스트그룹

    var hostid = '';

    var eventListTable = '';

    eventListTable += '<tbody>';

    $.each(data_event.result, function(k, v) {
        console.log(" data_event ");
        try {
            eventId = v.eventid;
            eventStatus = convStatus(v.value);
            eventPriority = convPriority(v.relatedObject.priority);
            eventStartTime = convTime(v.relatedObject.lastchange);
            eventAckTime = convTime(v.acknowledges.clock);
            eventAge = convDeltaTime(v.relatedObject.lastchange);
            eventAcknowledge = convAck(v.acknowledged);
            hostid = v.hosts[0].hostid;
            eventIp = zbxSyncApi.eventStatusHost(hostid).result[0].interfaces[0].ip;
            eventHostGroup = v.hosts[0].host;
        } catch (e) {
            console.log(e);
        }

        eventListTable += "<tr>";
        eventListTable += "<td width='80' class='line'>" + eventId + "</td>";
        eventListTable += "<td width='80' class='line'>" + eventStatus + "</td>";
        eventListTable += "<td width='80' class='line'>" + eventPriority + "</td>";
        eventListTable += "<td width='125' class='line'>" + eventStartTime + "</td>";
        eventListTable += "<td width='120' class='line'>" + eventAge + "</td>";
        eventListTable += "<td width='80' class='line'>" + eventAcknowledge + "</td>";
        eventListTable += "<td width='125' class='line'>" + eventAckTime + "</td>";
        eventListTable += "<td width='100' class='line'>" + eventIp + "</td>";
        eventListTable += "<td width='auto' class='line'>" + eventHostGroup + "</td>";
        eventListTable += "</tr>";

    });

    eventListTable += '</tbody>';
    $("#eventStatusTable").empty();
    $("#eventStatusTable").append(eventListTable);

}