var cpuStatsView = function(hostid, startTime) {

    var dataSet = [];
    var data_topProcess = null;

    $.blockUI(blockUI_opt_all);

    new $.jqzabbix(options).getApiVersion().then(function(data) {

        dataSet = callApiForCpuUsage(hostid, startTime);
        showBasicAreaChart('chart_cpuUsage', 'CPU 사용량', dataSet, Label.percent, ['#E3C4FF', '#8F8AFF', '#00B700', '#DB9700']);

        dataSet = callApiForCpuLoadAvg(hostid, startTime);
        showBasicLineChart('chart_loadAverage', 'Load Average', dataSet, null, ['#00B700', '#DB9700', '#E3C4FF', '#8F8AFF']);

        data_topProcess = callApiForProcessTable(hostid);
        var topProcessLastClock = parseInt(data_topProcess.lastclock) * 1000;
        var d2 = new Date(topProcessLastClock);
        var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth()) + 1) + "-" + d2.getDate() + " " + d2.getHours() + ":" + d2.getMinutes();

        data_topProcess = sortProcInCpuOrder(data_topProcess);
        showProcessTable(data_topProcess, topProcessLastTime);

        $.unblockUI(blockUI_opt_all);
    });
}

//** 함수이름 cpu 통계 화면 관리 명으로 변경(역할 : 화면 열고, 데이터 채우고 --> 각각 function으로분리), cpu data manager 객체 : api 호출해서 dataset 만들어서 넘김

var callApiForCpuUsage = function(hostid, startTime) {

    var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;
    var dataSet = [];

    var CpuSystemArr = [];
    var CpuUserArr = [];
    var CpuIOwaitArr = [];
    var CpuStealArr = [];

    var history_CpuSystem = null;
    var history_CpuUser = null;
    var history_CpuIOwait = null;
    var history_CpuSteal = null;

    data_CpuSystem = zbxSyncApi.getItem(hostid, "system.cpu.util[,system]");
    data_CpuUser = zbxSyncApi.getItem(hostid, "system.cpu.util[,user]");
    data_CpuIOwait = zbxSyncApi.getItem(hostid, "system.cpu.util[,iowait]");
    data_CpuSteal = zbxSyncApi.getItem(hostid, "system.cpu.util[,steal]");

    history_CpuSystem = zbxSyncApi.getHistory(data_CpuSystem.itemid, startTime, HISTORY_TYPE.FLOAT);
    CpuSystemArr = resultToArray(history_CpuSystem);

    history_CpuUser = zbxSyncApi.getHistory(data_CpuUser.itemid, startTime, HISTORY_TYPE.FLOAT);
    CpuUserArr = resultToArray(history_CpuUser);

    history_CpuIOwait = zbxSyncApi.getHistory(data_CpuIOwait.itemid, startTime, HISTORY_TYPE.FLOAT);
    CpuIOwaitArr = resultToArray(history_CpuIOwait);

    history_CpuSteal = zbxSyncApi.getHistory(data_CpuSteal.itemid, startTime, HISTORY_TYPE.FLOAT);
    CpuStealArr = resultToArray(history_CpuSteal);

    dataSet.push(new DataObject('CPU System', CpuSystemArr));
    dataSet.push(new DataObject('CPU User', CpuUserArr));
    dataSet.push(new DataObject('CPU IO Wait', CpuIOwaitArr));
    dataSet.push(new DataObject('CPU Steal', CpuStealArr));

    return dataSet;
}


var callApiForCpuLoadAvg = function(hostid, startTime) {

    var data_loadavg1, data_loadavg5, data_loadavg15 = null;
    var data_topProcess = null;
    var dataSet = [];

    var loadAvg1Arr = [];
    var loadAvg5Arr = [];
    var loadAvg15Arr = [];

    var history_loadavg1 = null;
    var history_loadavg5 = null;
    var history_loadavg15 = null;

    data_loadavg1 = zbxSyncApi.getItem(hostid, "system.cpu.load[percpu,avg1]");
    data_loadavg5 = zbxSyncApi.getItem(hostid, "system.cpu.load[percpu,avg5]");
    data_loadavg15 = zbxSyncApi.getItem(hostid, "system.cpu.load[percpu,avg15]");


    loadAvg1Arr = resultToArray(zbxSyncApi.getHistory(data_loadavg1.itemid, startTime, HISTORY_TYPE.FLOAT));
    loadAvg5Arr = resultToArray(zbxSyncApi.getHistory(data_loadavg5.itemid, startTime, HISTORY_TYPE.FLOAT));
    loadAvg15Arr = resultToArray(zbxSyncApi.getHistory(data_loadavg15.itemid, startTime, HISTORY_TYPE.FLOAT));


    var dataObj = new Object();


    dataSet.push(new DataObject('1분 평균', loadAvg1Arr));
    dataSet.push(new DataObject('5분 평균', loadAvg5Arr));
    dataSet.push(new DataObject('15분 평균', loadAvg15Arr));

    return dataSet;
}

function showBasicAreaChart(chartId, chartTitle, dataSet, label, colorArr) {
    chartCall(chartId, chartTitle, dataSet, label, colorArr);

}

var callApiForProcessTable = function(hostid) {
    return zbxSyncApi.getItem(hostid, "system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
}

var sortProcInCpuOrder = function(data_topProcess) {

    var topProcRowArr = data_topProcess.lastvalue.split("\n"); //각 행들의 집합
    var procUniqueName = [];
    var procNameOrderByCpu = [];
    var dataObj = null;
    var dataSet = [];

    //모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
    $.each(topProcRowArr, function(k, v) {
        while (topProcRowArr[k].indexOf("  ") != -1) {
            topProcRowArr[k] = topProcRowArr[k].replace('  ', ' ');
        }
        var topProcColArr = topProcRowArr[k].split(" ");
        var procNameArr = [];
        var procName = '';
        if (topProcColArr[9].indexOf("/0") != -1) {
            procName = topProcColArr[9];
        } else {
            procNameArr = topProcColArr[9].split("/");
            procName = procNameArr[procNameArr.length - 1];
        }
        procName = procName.replace(/\:/g, '');

        procNameOrderByCpu[k] = procName;

        dataObj = new Object();
        dataObj.procName = procName;
        dataObj.procCpu = parseFloat(topProcColArr[7]);
        dataObj.procMem = parseFloat(topProcColArr[6]);
        dataSet.push(dataObj);
    });

    // 프로세스명 중복 제거 후, 프로세스 별 cpu 합 초기화
    procUniqueName = $.unique(procNameOrderByCpu);
    var procUniqueObj = null;
    var procTotalArr = [];
    $.each(procUniqueName, function(k, v) {
        procUniqueObj = new Object();
        procUniqueObj.procName = v;
        procUniqueObj.totalCpuVal = 0;
        procUniqueObj.totalMemVal = 0;
        procUniqueObj.procCnt = 0;
        procTotalArr.push(procUniqueObj);
    });

    // 같은 프로세스 명끼리 cpu값 더함
    procTotalArr.splice(0, 1);
    $.each(procTotalArr, function(k1, v1) {
        $.each(dataSet, function(k2, v2) {
            if (v1.procName == v2.procName) {
                v1.totalCpuVal += v2.procCpu;
                v1.totalMemVal += v2.procMem;
                v1.procCnt += 1;
            }
        });
    });

    // cpu값을 기준으로 객체배열 내림차순 정렬
    procTotalArr.sort(function(a, b) {
        return a.totalCpuVal > b.totalCpuVal ? -1 : a.totalCpuVal < b.totalCpuVal ? 1 : 0;
    });
    return procTotalArr;
}
