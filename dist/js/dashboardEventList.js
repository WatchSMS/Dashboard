function pageMove_EventListDetail(eventList) {
    console.log(" EVENT LIST ");
    console.log(eventList);

    $("#dashbord_EventPaging").empty();

    dashboard_EventList(eventList);
}

function dashboard_EventList(eventData) {
    console.log(" dashboard_EventList ");

    var dash_EventListTable, dash_FinalEventListTable = '';
    var dash_TriggerIdArr = [];
    var dash_HostIdArr = [];
    var dash_UniqueTriggerIdArr = [];
    var dash_UniqueHostIdArr = [];
    var dash_EventMergeArr = [];
    var dash_EventArrByTriggerId = [];
    var dash_DataObj = new Object();
    var dash_ObjectId, dash_EventId, dash_Severity, dash_Status, dash_Clock, dash_Duration, dash_Ack, dash_AckTime,
        dash_Host, dash_Description, dash_HostId, dash_Ip, dash_TmpHostId = '';

    $.each(eventData, function (k, v) {
        dash_TriggerIdArr.push(v.relatedObject.triggerid);
    });

    $.each(dash_TriggerIdArr, function (k, v) {
        if (dash_UniqueTriggerIdArr.indexOf(v) == -1) {
            dash_UniqueTriggerIdArr.push(v);
        }
    });

    dash_EventArrByTriggerId = new Array(dash_UniqueTriggerIdArr.size);

    $.each(dash_UniqueTriggerIdArr, function (k, v) {
        dash_EventArrByTriggerId[k] = new Array();

        $.each(eventData, function (k1, v1) {
            if (v == v1.relatedObject.triggerid) {
                dash_DataObj = new Object();
                dash_DataObj.triggerId = v1.relatedObject.triggerid;
                dash_DataObj.objectId = v1.objectid;
                dash_DataObj.eventId = v1.eventid;
                dash_DataObj.severity = convPriority(v1.relatedObject.priority);
                dash_DataObj.status = convStatusEvent(v1.value);
                dash_DataObj.ack = convAckEvent(v1.acknowledged);
                dash_TmpHostId = v1.hosts[0].hostid;
                dash_DataObj.hostid = dash_TmpHostId;

                if (hostIpMap[dash_TmpHostId] == null) {
                    hostIpMap[dash_TmpHostId] = zbxSyncApi.eventStatusHost(dash_TmpHostId).result[0].interfaces[0].ip;
                }
                dash_DataObj.ip = hostIpMap[dash_TmpHostId];
                if (v1.acknowledges[0] == undefined) {
                    dash_DataObj.ackTime = "-";
                } else {
                    dash_DataObj.ackTime = convTime(v1.acknowledges[0].clock);
                }
                dash_DataObj.host = v1.hosts[0].name;
                dash_DataObj.description = v1.relatedObject.description;
                dash_DataObj.clock = v1.clock;
                dash_DataObj.duration = 0;

                dash_EventArrByTriggerId[k].push(dash_DataObj);
            }
        })
    });

    $.each(dash_EventArrByTriggerId, function (k, v) {
        var previousClock = Math.ceil(parseInt(new Date().getTime()) / 1000);
        console.log("previousClock : " + previousClock);

        $.each(v, function (k1, v1) {
            v1.duration = convertTime(previousClock - parseInt(v1.clock));
            previousClock = parseInt(v1.clock);
            dash_EventMergeArr.push(v1);
        });
    });


    // Merge된 이벤트 배열 clock 순으로 정렬
    dash_EventMergeArr.sort(function (a, b) {
        return a.clock > b.clock ? -1 : a.clock < b.clock ? 1 : 0;
    });

    $.each(dash_EventMergeArr, function (dash_k, dash_v) {
        console.log(" dashboard_EventList Each ");

        dash_ObjectId = dash_v.objectId;
        dash_EventId = dash_v.eventId;
        dash_Severity = dash_v.severity;
        dash_Status = dash_v.status;
        console.log(" dash_Status : " + dash_Status);
        dash_Clock = convTime(dash_v.clock);
        dash_Duration = dash_v.duration;
        dash_Ack = dash_v.ack;
        dash_AckTime = dash_v.ackTime;
        dash_Host = dash_v.host;
        dash_Description = dash_v.description;
        dash_HostId = dash_v.hostid;
        dash_Ip = dash_v.ip;

        dash_FinalEventListTable += "<tr role='row' id='" + dash_EventId + "'>";
        dash_FinalEventListTable += "<td class='line td_width80'>" + dash_EventId + "</td>";
        if (dash_Status == "정상") {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:green;'>" + dash_Status + "</td>";
        } else {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:red;'>" + dash_Status + "</td>";
        }
        if (dash_Severity == "information") {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:#7499FF;'>" + dash_Severity + "</td>";
        } else if (dash_Severity == "warning") {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:#FFC859;'>" + dash_Severity + "</td>";
        } else if (dash_Severity == "average") {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:#FFA059;'>" + dash_Severity + "</td>";
        } else if (dash_Severity == "high") {
            dash_FinalEventListTable += "<td class='line td_width80' style='color:#E97659;'>" + dash_Severity + "</td>";
        } else {
            dash_FinalEventListTable += "<td class='line td_width80'>" + dash_Severity + "</td>";
        }
        dash_FinalEventListTable += "<td class='line td_width125'>" + dash_Clock + "</td>";
        dash_FinalEventListTable += "<td class='line td_width120'>" + dash_Duration + "</td>";
        if (dash_Ack == "미인지") {
            dash_FinalEventListTable += "<td class='line td_width80'>" + dash_Ack + "</td>";
        } else {
            dash_FinalEventListTable += "<td class='line td_width80'>" + dash_Ack + "</td>";
        }
        dash_FinalEventListTable += "<td class='line td_width125'>" + dash_AckTime + "</td>";
        dash_FinalEventListTable += "<td class='line td_width100'>" + dash_Ip + "</td>";
        dash_FinalEventListTable += "<td class='line td_width100'>" + dash_Host + "</a></td>";
        dash_FinalEventListTable += "<td class='line td_widthAuto' style='text-align: left;'>" + dash_Description + "</td>";
        dash_FinalEventListTable += "</tr>";
    });

    $("#dash_EventTbody").append(dash_FinalEventListTable);

    /* paging 작업 s */
    var rowsShown = 30;
    var rowTotal = $("#dash_EventTbody tr").length;
    var numPages = rowTotal / rowsShown;

    for (var i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#dashbord_EventPaging').append('<a href="#" rel="' + i + '">' + pageNum + '</a>');
        var dashboard_modulo = pageNum % 10;
        console.log(" dashboard_modulo : " + dashboard_modulo);
        if (dashboard_modulo == "0") {
            $('#dashbord_EventPaging').append('</br></br>');
            console.log(" dashbord_EventPaging br ");
        }
    }

    $("#dash_EventTbody tr").hide();
    $("#dash_EventTbody tr").slice(0, rowsShown).show();
    $('#dashbord_EventPaging a').bind('click', function () {
        $('#dashbord_EventPaging a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $("#dash_EventTbody tr").css('opacity', '0.0').hide().slice(startItem, endItem).css('display', 'table-row').animate({opacity: 1}, 300);
    });
    /* paging 작업 e */
}

function pageMove() {
    console.log(" 페이지 이동 클릭 ");

    $("[id^=base]").hide();
    $("#base_dashboard").show();

    dashboardView();
}