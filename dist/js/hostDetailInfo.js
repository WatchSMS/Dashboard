function showDetailInfo(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime, hostid){
    showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime);
    showServerMemory(serverMemoryUse, startTime);
    showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime);

    // $("#reload_serverDetail").click(function () {
    //     console.log("reload_serverDetail");
    // });

    $("#hostEventDiv").scroll(function() {
        var div = $("#hostEventDiv");
        if(div[0].scrollHeight - div.scrollTop() == div.outerHeight()) {
            console.log(" END SCROLL ");
            var lastRowIdFrom = $("#hostEventDiv tr:last").attr('id');
            lastRowIdFrom = lastRowIdFrom - 1;
            var appendData = '';
            console.log(" last Row From : " + lastRowIdFrom);

            zbxApi.hostEventViewAppend.get(lastRowIdFrom, hostid).done(function (data, status, jqXHR) {
                appendData = zbxApi.eventStatusView.success(data);
                console.log(JSON.stringify(appendData));
                var eventId = '';
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

                $.each(appendData.result, function (k, v) {
                    eventId = v.eventid;
                    severity = convPriority(v.relatedObject.priority);
                    status = convStatusEvent(v.value);
                    lastchange = convTime(v.relatedObject.lastchange);
                    age = convDeltaTime(v.relatedObject.lastchange);
                    ack = convAckEvent(v.acknowledged);
                    if(v.acknowledges[0] == undefined){
                        ackTime = "-";
                    } else {
                        ackTime = convTime(v.acknowledges[0].clock);
                    }
                    host = v.hosts[0].name;
                    description = v.relatedObject.description;

                    eventTable += "<tr id='" + eventId + "'>";
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
                    eventTable += "<td width='60' class='line'>" + status + "</td>";
                    eventTable += "<td width='75' class='line'>" + lastchange + "</td>";
                    eventTable += "<td width='75' class='line'>" + age + "</td>";
                    if(ack == "미인지"){
                        eventTable += "<td width='69' class='line' style='color:red'>" + ack + "</td>";
                    } else if(ack = "인지"){
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

                $("#serverEventList").append(eventTable);
            });
        }
    })

}

function showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime) {
    var serverCpuSystemArr = [];
    var serverCpuUserArr = [];
    var serverCpuIoWaitArr = [];
    var serverCpuStealArr = [];

    var history_cpuUser = null;

    var DataSet = [];
    var DataObj = new Object();

    zbxApi.getHistory.get(serverCpuSystem.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverCpuSystemArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuUser.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_cpuUser = zbxApi.getHistory.success(data);
        console.log("history_cpuUser : " + JSON.stringify(history_cpuUser));
        $.each(history_cpuUser.result, function(k, v) {
            serverCpuUserArr[k] = [];
            serverCpuUserArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuUserArr[k][1] = parseFloat(v.value);
        });
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuIoWait.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        serverCpuIoWaitArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuSteal.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        serverCpuStealArr = zbxApi.getHistory.success(data);

        //차트에 전달할 데이터셋 생성
        DataObj = new Object();
        DataObj.name = "CPU 사용량";
        DataObj.data = serverCpuSystemArr;
        DataSet.push(DataObj);

        DataObj = new Object();
        DataObj.name = "CPU 사용량";
        DataObj.data = serverCpuUserArr;
        DataSet.push(DataObj);

        DataObj = new Object();
        DataObj.name = "CPU 사용량";
        DataObj.data = serverCpuIoWaitArr;
        DataSet.push(DataObj);

        DataObj = new Object();
        DataObj.name = "CPU 사용량";
        DataObj.data = serverCpuStealArr;
        DataSet.push(DataObj);

        hostDetailChartCPU('cpuUse', 'CPU 사용량', DataSet, "%", ['#e85c2a', '#e574ff', '#37d5f2', '#ccaa65']);
    });

    TIMER_ARR.push(setInterval(function(){ reloadChartForCPU(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal); }, 10000));
}

function showServerMemory(serverMemoryUse, startTime) {
    var serverMemoryUseArr = [];

    var DataSet = [];
    var DataObj = new Object();

    zbxApi.getHistory.get(serverMemoryUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverMemoryUseArr = zbxApi.getHistory.success(data);

        //차트에 전달할 데이터셋 생성
        DataObj = new Object();
        DataObj.name = "전체메모리";
        DataObj.data = serverMemoryUseArr;
        DataSet.push(DataObj);

        hostDetailChartMemory('memoryAll', '전체메모리', DataSet, "%", ['#bebebe']);
    });

    TIMER_ARR.push(setInterval(function(){ reloadChartForMEMORY(serverMemoryUse); }, 10000));
}

function showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime) {
    var serverTraInEth0Arr = [];
    var serverTraOutEth0Arr = [];
    var serverTraTotEth0Arr = [];

    var DataSet = [];
    var DataObj = new Object();

    zbxApi.getHistory.get(serverTraInEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        serverTraInEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraOutEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        serverTraOutEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraTotalEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        serverTraTotEth0Arr = zbxApi.getHistory.success(data);

        //차트에 전달할 데이터셋 생성
        DataObj = new Object();
        DataObj.name = "트래픽 사용량";
        DataObj.data = serverTraInEth0Arr;
        DataSet.push(DataObj);

        DataObj = new Object();
        DataObj.name = "트래픽 사용량";
        DataObj.data = serverTraOutEth0Arr;
        DataSet.push(DataObj);

        DataObj = new Object();
        DataObj.name = "트래픽 사용량";
        DataObj.data = serverTraTotEth0Arr;
        DataSet.push(DataObj);

        hostDetailChartNetwork('trafficUse', '트래픽 사용량', DataSet, "kbps", ['#e85c2a', '#e574ff', '#37d5f2']);
    });

    TIMER_ARR.push(setInterval(function(){ reloadChartForNETWORK(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0); }, 10000));
}

function serverOverViewInfo(serverTitle, serverIP, serverOS, serverName, serverAgentVersion) {
    $("#serverInfo").empty();

    var serverInfoTbl = '';
    serverInfoTbl += "<tr><td class='line-td' width='170'>운영체제</td><td class='line-td br7_rt'>" + serverOS + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>서버명</td><td class='line-td br7_rt'>" + serverTitle + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>IP주소</td><td class='line-td br7_rt'>" + serverIP + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>호스트명</td><td class='line-td br7_rt'>" + serverName + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>에이전트</td><td class='line-td br7_rt'>" + serverAgentVersion + "</td></tr>";
    $("#serverInfo").append(serverInfoTbl);
}

function processView(hostid, startTime) {
    var lastProcessData = callApiForProcessTable(hostid);
    var processTbl = '';
    var MAX_PROCCOUNT = 7;
    var tableDataObj = {};
    var tableDataArr = [];

    var topProcessLastClock = parseInt(lastProcessData.lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + d2.getMonth() + 1 + "-" + d2.getDate() + " " + d2.getHours() + ":" + d2.getMinutes();
    var sortProcessForTable = sortProcess(lastProcessData, "CPU");

    processTbl += "<tbody>";

    $.each(sortProcessForTable, function(k, v) {
        tableDataObj = {};

        tableDataObj.procName = v.procName;
        tableDataObj.cpuValue = parseFloat(v.totalCpuVal.toFixed(1));
        tableDataObj.memValue = parseFloat(v.totalMemVal.toFixed(1));
        tableDataObj.procCnt = parseInt(v.procCnt);
        tableDataArr.push(tableDataObj);
        if (k < MAX_PROCCOUNT) {
            var procCpuValue = v.totalCpuVal.toFixed(1);
            var procMemValue = v.totalMemVal.toFixed(1);

            processTbl += "<tr id='" + v.procName + "' role='row' class='odd h34'>";
            processTbl += "<td width='170' class='align_left line p115' title='" + v.procName + "'>" + v.procName + "</td>";
            processTbl += "<td width='90' class='line'>" + v.procCnt + "</td>";
            processTbl += "<td width='120' class='line'>" + procCpuValue + "</td>";
            processTbl += "<td width='auton'>" + procMemValue + "<span class='smaller'>MB</span></td>";
            processTbl += "</tr>";
        }
    });

    processTbl += "</tbody>";

    $("#processTime").text(topProcessLastTime);
    $("#serverProcessList").empty();
    $("#serverProcessList").append(processTbl);

    //화면 이동
    $("#processDetail_").click(function () {
        console.log("IN function processDetail_");
        console.log(hostid + " / " + startTime);
        $("#process_" + hostid).click();
    });
}

function showServerDisk(serverDiskUseRoot, startTime) {
    var serverDiskUseRootArr = [];

    var DataSet = [];
    var DataObj = new Object();

    zbxApi.getHistory.get(serverDiskUseRoot.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverDiskUseRootArr = zbxApi.getHistory.success(data);

        //차트에 전달할 데이터셋 생성
        DataObj = new Object();
        DataObj.name = "디스크 사용량";
        DataObj.data = serverDiskUseRootArr;
        DataSet.push(DataObj);

        hostDetailChartDisk('diskUse', '디스크 사용량', DataSet, "%", ['#fa7796']);
    });

    TIMER_ARR.push(setInterval(function(){ reloadChartForDISK(serverDiskUseRoot); }, 10000));
}

function EventListView(hostid) { //서버정보요약 - 이벤트목록
    var data_EventList = '';
    zbxApi.hostEventList.get(hostid).then(function(data) {
        data_EventList = zbxApi.hostEventList.success(data);

        var eventId = '';
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

        $.each(data_EventList.result, function (k, v) {
            eventId = v.eventid;
            severity = convPriority(v.relatedObject.priority);
            status = convStatusEvent(v.value);
            lastchange = convTime(v.relatedObject.lastchange);
            age = convDeltaTime(v.relatedObject.lastchange);
            ack = convAckEvent(v.acknowledged);
            if(v.acknowledges[0] == undefined){
                ackTime = "-";
            } else {
                ackTime = convTime(v.acknowledges[0].clock);
            }
            host = v.hosts[0].name;
            description = v.relatedObject.description;

            eventTable += "<tr id='" + eventId + "'>";
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
            eventTable += "<td width='60' class='line'>" + status + "</td>";
            eventTable += "<td width='75' class='line'>" + lastchange + "</td>";
            eventTable += "<td width='75' class='line'>" + age + "</td>";
            if(ack == "미인지"){
                eventTable += "<td width='69' class='line' style='color:red'>" + ack + "</td>";
            } else if(ack = "인지"){
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

        $("#serverEventList").empty();
        $("#serverEventList").append(eventTable);
    });
}

function reloadChartForCPU(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal){
    console.log(" reloadChartForCPU ");

    var history_system = null;
    var history_user = null;
    var history_iowait = null;
    var history_steal = null;

    var hist_user = null;

    var startTime = Math.round((cpuUse.series[0].xData[(cpuUse.series[0].xData.length)-1]) / 1000) + 1;
    console.log("reloadChartForCPU startTime : " + startTime);

    zbxApi.getHistory.get(serverCpuSystem.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        history_system = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuUser.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        hist_user = zbxApi.getHistory.success(data);
        console.log("hist_user : " + JSON.stringify(hist_user));
        $.each(hist_user.result, function(k, v) {
            history_user[k] = [];
            history_user[k][0] = parseInt(v.clock) * 1000;
            history_user[k][1] = parseFloat(v.value);
        });
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuIoWait.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_iowait = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuSteal.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_steal = zbxApi.getHistory.success(data);

        $.each(history_system, function(k,v) {
            cpuUse.series[0].addPoint([v[0], v[1]]);
        });
        $.each(history_user, function(k,v) {
            cpuUse.series[1].addPoint([v[0], v[1]]);
        });
        $.each(history_iowait, function(k,v) {
            cpuUse.series[2].addPoint([v[0], v[1]]);
        });
        $.each(history_steal, function(k,v) {
            cpuUse.series[3].addPoint([v[0], v[1]]);
        });
    });
}

function reloadChartForMEMORY(serverMemoryUse){
    console.log(" reloadChartForMEMORY ");
    var history_memory = null;

    var startTime = Math.round((memoryAll.series[0].xData[(memoryAll.series[0].xData.length)-1]) / 1000) + 1;
    console.log("reloadChartForMEMORY startTime : " + startTime);

    zbxApi.getHistory.get(serverMemoryUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        history_memory = zbxApi.getHistory.success(data);

        $.each(history_memory, function(k,v) {
            memoryAll.series[0].addPoint([v[0], v[1]]);
        });
    });
}

function reloadChartForNETWORK(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0){
    console.log(" reloadChartForNETWORK ");

    var history_in = null;
    var history_out = null;
    var history_total = null;

    var startTime = Math.round((trafficUse.series[0].xData[(trafficUse.series[0].xData.length)-1]) / 1000) + 1;
    console.log("reloadChartForNETWORK startTime : " + startTime);

    zbxApi.getHistory.get(serverTraInEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        history_in = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraOutEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        history_out = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraTotalEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        history_total = zbxApi.getHistory.success(data);

        $.each(history_in, function(k,v) {
            trafficUse.series[0].addPoint([v[0], v[1]]);
        });

        $.each(history_out, function(k,v) {
            trafficUse.series[1].addPoint([v[0], v[1]]);
        });

        $.each(history_total, function(k,v) {
            trafficUse.series[2].addPoint([v[0], v[1]]);
        });
    });
}

function reloadChartForDISK(serverDiskUseRoot){
    console.log(" reloadChartForDISK ");
    var history_disk = null;

    var startTime = Math.round((diskUse.series[0].xData[(diskUse.series[0].xData.length)-1]) / 1000) + 1;
    console.log("reloadChartForDISK startTime : " + startTime);

    zbxApi.getHistory.get(serverDiskUseRoot.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        history_disk = zbxApi.getHistory.success(data);

        $.each(history_disk, function(k,v) {
            diskUse.series[0].addPoint([v[0], v[1]]);
        });
    });
}