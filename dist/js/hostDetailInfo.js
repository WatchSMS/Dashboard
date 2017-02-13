var serverOverGraphView = function(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverDiskUseRoot, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime) {
    // showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime);
    // showServerMemory(serverMemoryUse, startTime);
    // showServerDisk(serverDiskUseRoot, startTime);
    // showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime);
    //$.unblockUI(blockUI_opt_all);
};


var processView = function(hostid, startTime) {
    var lastProcessData = callApiForProcessTable(hostid);
    var processTbl = '';
    var MAX_PROCCOUNT = 7;
    var tableDataObj = new Object();
    var tableDataArr = [];

    var topProcessLastClock = parseInt(lastProcessData.lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + d2.getMonth() + 1 + "-" + d2.getDate() + " " + d2.getHours() + ":" + d2.getMinutes();
    var sortProcessForTable = sortProcInCpuOrder(lastProcessData);
    lastProcessData = sortProcInCpuOrder(lastProcessData, topProcessLastTime);

    processTbl += "<thead>";
    processTbl += "<tr role='row'>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>이름</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>cpu</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>메모리</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>수</th>";
    processTbl += "</tr>";
    processTbl += "</thead>";

    processTbl += "<tbody>";

    $.each(sortProcessForTable, function(k, v) {
        tableDataObj = new Object();

        tableDataObj.procName = v.procName;
        tableDataObj.cpuValue = parseFloat(v.totalCpuVal.toFixed(1));
        tableDataObj.memValue = parseFloat(v.totalMemVal.toFixed(1));
        tableDataObj.procCnt = parseInt(v.procCnt);
        tableDataArr.push(tableDataObj);
        if (k < MAX_PROCCOUNT) {
            var procCpuValue = v.totalCpuVal.toFixed(1);
            var procMemValue = v.totalMemVal.toFixed(1);

            processTbl += "<tr id='" + v.procName + "' role='row' class='odd'>";
            processTbl += "<td><span class='ellipsis' title='" + v.procName + "'>" + v.procName + "</span></td>";
            processTbl += "<td>" + procCpuValue + "</td>";
            processTbl += "<td>" + procMemValue + "<span class='smaller'>MB</span></td>";
            processTbl += "<td>" + v.procCnt + "</td>";
            processTbl += "</tr>";
        }
    });

    processTbl += "</tbody>";

    $("#processTime").text(topProcessLastTime);
    $("#serverProcessList").empty();
    $("#serverProcessList").append(processTbl);
}


var EventListView = function(hostid) { //서버정보요약 - 이벤트목록
    var data_EventList = callApiForServerEvent(hostid);
    var eventTbl = '';

    eventTbl += "<thead>";
    eventTbl += "<tr role='row'>";
    eventTbl += "<th>이벤트 등급</th>";
    eventTbl += "<th>상태</th>";
    eventTbl += "<th>발생시간</th>";
    eventTbl += "<th>지속시간</th>";
    eventTbl += "<th>인지</th>";
    eventTbl += "<th>호스트명</th>";
    eventTbl += "<th>비고</th>";
    eventTbl += "</tr>";
    eventTbl += "</thead>";

    eventTbl += "<tbody>";

    $.each(data_EventList, function(k, v) {
        var severity = convPriorityServer(v.priority);
        var status = convStatusServer(v.value);
        var lastchange = convTime(v.lastchange);
        var age = convDeltaTime(v.lastchange);
        var ack = convAckServer(v.lastEvent.acknowledged);
        var host = v.hosts[0].host;
        var description = v.description;

        eventTbl += "<tr role='row'>";
        eventTbl += "<td>" + severity + "</td>";
        eventTbl += "<td>" + status + "</td>";
        eventTbl += "<td>" + lastchange + "</td>";
        eventTbl += "<td>" + age + "</td>";
        eventTbl += "<td>" + ack + "</td>";
        eventTbl += "<td>" + host + "</td>";
        eventTbl += "<td>" + description + "</td>";
        eventTbl += "</tr>";
    });

    eventTbl += "</tbody>";
    $("#serverEventList").empty();
    $("#serverEventList").append(eventTbl);
}

var serverOverViewInfo = function(serverTitle, serverIP, serverOS, serverName, serverAgentVersion) {
    $("#serverInfo").empty();

    var serverInfoTbl = '';
    serverInfoTbl += "<tr><td>운영체제</td><td>" + serverOS + "</td></tr>";
    serverInfoTbl += "<tr><td>서버명</td><td>" + serverTitle + "</td></tr>";
    serverInfoTbl += "<tr><td>IP주소</td><td>" + serverIP + "</td></tr>";
    serverInfoTbl += "<tr><td>호스트명</td><td>" + serverName + "</td></tr>";
    serverInfoTbl += "<tr><td>에이전트</td><td>" + serverAgentVersion + "</td></tr>";
    $("#serverInfo").append(serverInfoTbl);
};



function showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime) {
    var serverTraInEth0Arr = [];
    var serverTraOutEth0Arr = [];
    var serverTraTotEth0Arr = [];

    var history_traInEth0 = null;
    var history_traOutEth0 = null;
    var history_traTotEth0 = null;

    zbxApi.getHistory.get(serverTraInEth0.result[0].itemid, startTime, 3).then(function(data) {
        serverTraInEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraOutEth0.result[0].itemid, startTime, 3);
    }).then(function(data) {
        serverTraOutEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraTotalEth0.result[0].itemid, startTime, 3);
    }).then(function(data) {
        serverTraTotEth0Arr = zbxApi.getHistory.success(data);
        var chartId = "trafficUse";
        var title = '트래픽 사용량';

        var series = [{
            name: 'Traffic In Eth0',
            data: serverTraInEth0Arr
        }, {
            name: 'Traffic Out Eth0',
            data: serverTraOutEth0Arr
        }, {
            name: 'Traffic Total Eth0',
            data: serverTraTotEth0Arr
        }];

        chartCall(chartId, title, series, Label.percent);

    })
}


function showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime) {
    var serverCpuSystemArr = [];
    var serverCpuUserArr = [];
    var serverCpuIoWaitArr = [];
    var serverCpuStealArr = [];

    var history_cpuSytem = null;
    var history_cpuUser = null;
    var history_cpuIoWait = null;
    var history_cpuSteal = null;

    zbxApi.getHistory.get(serverCpuSystem.result[0].itemid, startTime, 0).then(function(data) {
        serverCpuSystemArr = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(serverCpuUser.result[0].itemid, startTime, 0);
    }).then(function(data) {
        history_cpuUser = zbxApi.getHistory.success(data);
        $.each(history_cpuUser.result, function(k, v) {
            serverCpuUserArr[k] = new Array();
            serverCpuUserArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuUserArr[k][1] = parseFloat(v.value);
        });
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuIoWait.result[0].itemid, startTime, 0);
    }).then(function(data) {
        serverCpuIoWaitArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuSteal.result[0].itemid, startTime, 0);
    }).then(function(data) {
        serverCpuStealArr = zbxApi.getHistory.success(data);

        var chartId = "cpuUse";
        var title = 'CPU 사용량';
        var name = 'Memory Use';


        var series = [{
            name: 'CPU System',
            data: serverCpuSystemArr
        }, {
            name: 'CPU User',
            data: serverCpuUserArr
        }, {
            name: 'CPU IoWait',
            data: serverCpuIoWaitArr
        }, {
            name: 'CPU Steal',
            data: serverCpuStealArr
        }];

        chartCall(chartId, title, series, Label.percent);
    });

}

function showServerMemory(serverMemoryUse, startTime) {
    var serverMemoryUseArr = [];

    var history_memoryUse = null;

    zbxApi.getHistory.get(serverMemoryUse.result[0].itemid, startTime, 0).then(function(data) {
        serverMemoryUseArr = zbxApi.getHistory.success(data);

        var chartId = "memoryAll";
        var title = '전체메모리';

        var series = [{
            name: 'Memory Use',
            data: serverMemoryUseArr
        }];

        chartCall(chartId, title, series, Label.percent);
    })
}


function showServerDisk(serverDiskUseRoot, startTime) {
    var serverDiskUseRootArr = [];

    var history_diskUseRoot = null;

    zbxApi.getHistory.get(serverDiskUseRoot.result[0].itemid, startTime, 0).then(function(data) {

        serverDiskUseRootArr = zbxApi.getHistory.success(data);

        var chartId = "diskUse";
        var title = '디스크 사용량';
        var series = [{
            name: 'Disk Use : /',
            data: serverDiskUseRootArr
        }]


        chartCall(chartId, title, series, Label.percent);

    })
}