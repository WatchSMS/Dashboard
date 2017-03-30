var cpuStatsView = function(hostid, startTime) {

    $.blockUI(blockUI_opt_all);
    $("#chart_cpuUsage").empty();
    $("#chart_loadAverage").empty();
    $("#cpuProcess").empty();

    removeAllChart();

    showCpuUsage(hostid, startTime);
    showCpuLoadAvg(hostid, startTime);
    showCpuProcessList(hostid);

    $.unblockUI(blockUI_opt_all);

    //TIMER_ARR.push(setInterval(function(){showCpuUsage(hostid, startTime)}, 500000));
    TIMER_ARR.push(setInterval(function(){loadBasicAreaChart(hostid);updateCpuLoadAvg(hostid);}, 10000));
    //TIMER_ARR.push(setInterval(function(){updateCpuLoadAvg(hostid)}, 10000));
    TIMER_ARR.push(setInterval(function(){showCpuProcessList(hostid)}, 500000));
};

function showCpuUsage(hostid, startTime){

    var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;

    var history_CpuSystem = null;
    var history_CpuUser = null;
    var history_CpuIOwait = null;
    var history_CpuSteal = null;

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_cpuUsage").block(blockUI_opt_all_custom);

    zbxApi.getItem.get(hostid,"system.cpu.util[,system]").then(function(data) {
        data_CpuSystem = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,user]");

    }).then(function(data) {
        data_CpuUser = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,iowait]");

    }).then(function(data) {
        data_CpuIOwait = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,steal]");

    }).then(function(data) {
        data_CpuSteal = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuSystem.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuSystem = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuUser = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuIOwait = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuSteal = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = 'CPU System';
        dataObj.data = history_CpuSystem;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = 'CPU User';
        dataObj.data = history_CpuUser;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = 'CPU IO Wait';
        dataObj.data = history_CpuIOwait;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = 'CPU Steal';
        dataObj.data = history_CpuSteal;
        dataSet.push(dataObj);
        
        console.log("***********************************");
        console.log(dataSet);
        showBasicAreaChart('chart_cpuUsage', 'CPU 사용량', dataSet, "%", ['#e85c2a', '#e574ff', '#37d5f2', '#ccaa65', '#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);

        $('#chart_cpuUsage').off().on('mousemove touchmove touchstart', function (e) {
            var chart,
                point,
                event;

            for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                point = chart.series[GLOBAL_INDEX].searchPoint(event, true); // Get the hovered point

                if (point) {
                    point.highlight(e);
                }
            }
        });
    });
}

function showCpuLoadAvg(hostid, startTime){

    var data_loadavg1, data_loadavg5, data_loadavg15 = null;

    var loadAvg1Arr = [];
    var loadAvg5Arr = [];
    var loadAvg15Arr = [];

    var history_loadavg1 = null;
    var history_loadavg5 = null;
    var history_loadavg15 = null;

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_loadAverage").block(blockUI_opt_all_custom);

    zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg1]").then(function(data) {
        data_loadavg1 = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg5]");

    }).then(function(data) {
        data_loadavg5 = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg15]");

    }).then(function(data) {
        data_loadavg15 = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg1.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg1 = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg5.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg5 = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg15.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg15 = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = '1분 평균';
        dataObj.data = history_loadavg1;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '5분 평균';
        dataObj.data = history_loadavg5;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '15분 평균';
        dataObj.data = history_loadavg15;
        dataSet.push(dataObj);

        showBasicLineChart('chart_loadAverage', '평균 부하량', dataSet, "", ['#fa7796', '#8bb1d8', '#a58eda', '#00B700','#DB9700', '#1266FF', '#E3C4FF', '#8F8AFF']);

        $('#chart_loadAverage').off().on('mousemove touchmove touchstart', function (e) {
            var chart,
                point,
                event;

            for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                point = chart.series[GLOBAL_INDEX].searchPoint(event, true); // Get the hovered point
                if (point) {
                    point.highlight(e);
                }
            }
        });

    });
}

function showCpuProcessList(hostid){

    $("#cpuProcess_wrapper").block(blockUI_opt_all_custom);

    var topProcessData = callApiForProcessTable(hostid);
    var topProcessLastClock = parseInt(topProcessData.lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth())+1) + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();
    topProcessData = sortProcess(topProcessData, "CPU");
    showProcessTable(topProcessData, topProcessLastTime);
}

var showProcessTable = function(finalProcArr, topProcessLastTime){

    var maxRefValue;
    var processGaugeValue;
    var cpuProcessTbl = '';
    var MAX_PROCCOUNT = 24;
    if(typeof finalProcArr == "undefined"){
        cpuProcessTbl += "수집된 데이터가 없습니다.";
    }else {
        cpuProcessTbl += "<tbody>";

        $.each(finalProcArr, function (k, v) {
            if (k < MAX_PROCCOUNT) {
                var procName = v.procName;
                var processPercentValue = v.totalCpuVal.toFixed(1);

                if (k == 0) {
                    maxRefValue = processPercentValue;
                    processGaugeValue = 100;
                } else {
                    processGaugeValue = (processPercentValue * 100) / maxRefValue;
                }

                if (k < (MAX_PROCCOUNT - 10)) {
                    cpuProcessTbl += "<tr class='h35'>";
                } else {
                    cpuProcessTbl += "<tr class='h35 optionrow' style='display:none;'>";
                }
                cpuProcessTbl += "<td width='170' class='align_left pl10 pr10'>";
                cpuProcessTbl += "<div class='fl mt2 mr5 f11' title='" + procName + "'>" + procName + " " + processPercentValue + "%</div>";
                cpuProcessTbl += "<div class='scw br3'><div class='mt2 bg8 br3' style='width: " + processGaugeValue + "%; height:5px;'></div></div>";
                cpuProcessTbl += "</td>";
                cpuProcessTbl += "<td style='display:none' title='" + v.childName + "'></td>";
                cpuProcessTbl += "<td style='display:none' title='" + v.childCpu + "'></td>";
                cpuProcessTbl += "</tr>";
            }
        });
        cpuProcessTbl += "<tr id='lastrow' isopen='false' class='h35'><td><span class='ellipsis'>[ 더 보기 ]</span></td></tr>";
        cpuProcessTbl += "</tbody>";

    }
    $("#cpuProcessTime").children().eq(0).text(topProcessLastTime);
    $("#cpuProcess").empty();
    $("#cpuProcess").append(cpuProcessTbl);


    var $table = $("#cpuProcess");

    $('tr', $table).each(function (row){

        $(this).click(function(){
            if($(this).is('#lastrow') == false){
                var childName = $(this).children(":last").prev().attr('title');
                childName = childName.slice(0,-2);
                var childCpu = $(this).children(":last").attr('title');
                var childNameArr = [];
                var childCpuArr = childCpu.split(",");
                var procDetailHTML = '';

                if(childCpuArr.length == 1){
                    childNameArr.push(childName);
                }else{
                    childNameArr = childName.split("\\n,");
                }

                procDetailHTML += "<table class='table1' style='width:100%;'><tbody>";

                $.each(childNameArr, function(k,v){
                    procDetailHTML += "<tr class='h35'>";
                    procDetailHTML += "<td width='50' class='align_left pl10 pr10'>" + (k+1) + "</td>";
                    procDetailHTML += "<td width='200' class='align_left pl10 pr10'>" + childNameArr[k] + "</td>";
                    procDetailHTML += "<td width='170' class='align_left pl10 pr10'>" + childCpuArr[k] + "%</td>";
                    procDetailHTML += "</tr>";
                });
                procDetailHTML += "</tbody></table>";
                $("#childProcTbl").empty();
                $("#detailProcessTitle").html($(this).children(":first").children(":first").attr('title'));
                $("#childProcTbl").append(procDetailHTML);
                $('#cpuChildProcessForm').lightbox_me({
                    centered: true,
                    closeSelector: ".close",
                    onLoad: function() {
                        $('#cpuChildProcessForm').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
                    },
                    overlayCSS:{background: '#474f79', opacity: .8}
                });
            }
        });
    });

    viewMoreProcess();

    $("#btn_cpu_charttime").off().on('click', function() {
        $("#cpu_timeInput").val("");
        $("#cpu_time_content").lightbox_me({
            centered: true,
            closeSelector: ".close",
            onLoad: function() {
                $('#cpuChildProcessForm').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
            },
            overlayCSS:{background: '#474f79', opacity: .8}
        });
    });

    $("#reload_cpuProcTable").off().on('click', function() {
        showCpuProcessList(currentHostId);
    });
    $("#cpuProcess_wrapper").unblock(blockUI_opt_all_custom);
}

var resetCpuChartTime = function(){
    var inputTime = $('#cpu_time_content').find('input:first').val();
    if(inputTime == ""){
        inputTime = "1";
    }
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);

    removeAllChart();
    showCpuUsage(currentHostId, startTime);
    showCpuLoadAvg(currentHostId, startTime);
}

function loadBasicAreaChart(hostid){

    var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;

    var history_CpuSystem = null;
    var history_CpuUser = null;
    var history_CpuIOwait = null;
    var history_CpuSteal = null;

    var startTime_cpuSystem = Math.round((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000) + 1;
    var startTime_cpuUser = Math.round((chart1.series[1].xData[(chart1.series[1].xData.length)-1]) / 1000) + 1;
    var startTime_cpuIOwait = Math.round((chart1.series[2].xData[(chart1.series[2].xData.length)-1]) / 1000) + 1;
    var startTime_cpuSteal = Math.round((chart1.series[3].xData[(chart1.series[3].xData.length)-1]) / 1000) + 1;

    zbxApi.getItem.get(hostid,"system.cpu.util[,system]").then(function(data) {
        data_CpuSystem = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,user]");

    }).then(function(data) {
        data_CpuUser = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,iowait]");

    }).then(function(data) {
        data_CpuIOwait = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.util[,steal]");

    }).then(function(data) {
        data_CpuSteal = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuSystem.result[0].itemid, startTime_cpuSystem, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuSystem = zbxApi.getHistory.success(data);
        $.each(history_CpuSystem, function(k,v) {
            chart1.series[0].addPoint([v[0], v[1]]);
            chart1.series[0].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime_cpuUser, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuUser = zbxApi.getHistory.success(data);
        $.each(history_CpuUser, function(k,v) {
            chart1.series[1].addPoint([v[0], v[1]]);
            chart1.series[1].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime_cpuIOwait, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuIOwait = zbxApi.getHistory.success(data);
        $.each(history_CpuIOwait, function(k,v) {
            chart1.series[2].addPoint([v[0], v[1]]);
            chart1.series[2].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime_cpuSteal, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuSteal = zbxApi.getHistory.success(data);
        $.each(history_CpuSteal, function(k,v) {
            chart1.series[3].addPoint([v[0], v[1]]);
            chart1.series[3].data[0].remove();
        });

        console.log("data adding..");
    });
}

function updateCpuLoadAvg(hostid){

    var data_loadavg1, data_loadavg5, data_loadavg15 = null;

    var history_loadavg1 = null;
    var history_loadavg5 = null;
    var history_loadavg15 = null;

    var startTime_loadavg1 = Math.round((chart2.series[0].xData[(chart2.series[0].xData.length)-1]) / 1000) + 1;
    var startTime_loadavg5 = Math.round((chart2.series[1].xData[(chart2.series[1].xData.length)-1]) / 1000) + 1;
    var startTime_loadavg15 = Math.round((chart2.series[2].xData[(chart2.series[2].xData.length)-1]) / 1000) + 1;


    zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg1]").then(function(data) {
        data_loadavg1 = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg5]");

    }).then(function(data) {
        data_loadavg5 = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg15]");

    }).then(function(data) {
        data_loadavg15 = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg1.result[0].itemid, startTime_loadavg1, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg1 = zbxApi.getHistory.success(data);
        $.each(history_loadavg1, function(k,v) {
            chart2.series[0].addPoint([v[0], v[1]]);
            chart2.series[0].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg5.result[0].itemid, startTime_loadavg5, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg5 = zbxApi.getHistory.success(data);
        $.each(history_loadavg5, function(k,v) {
            chart2.series[1].addPoint([v[0], v[1]]);
            chart2.series[1].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg15.result[0].itemid, startTime_loadavg15, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_loadavg15 = zbxApi.getHistory.success(data);
        $.each(history_loadavg15, function(k,v) {
            chart2.series[2].addPoint([v[0], v[1]]);
            chart2.series[2].data[0].remove();
        });

    });
}