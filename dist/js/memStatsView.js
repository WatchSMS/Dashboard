function callApiForMem(hostid,startTime){

    $.blockUI(blockUI_opt_all);
    $("#chart_memUsage").empty();
    $("#chart_memTotal").empty();
    $("#memProcess").empty();

    removeAllChart();

    showMemUsage(hostid, startTime);
    showMemTotal(hostid, startTime);
    showMemProcessList(hostid);

    $.unblockUI(blockUI_opt_all);

    TIMER_ARR.push(setInterval(function(){reloadChartForMemUsage(hostid); reloadChartForMemTotal(hostid);}, 10000));
    TIMER_ARR.push(setInterval(function(){showMemProcessList(hostid)}, 500000));

}

var resetMemChartTime = function(){

    var inputTime = $('#mem_time_content').find('input:first').val();
    if(inputTime == ""){
        inputTime = "1";
    }
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);

    removeAllChart();
    showMemUsage(currentHostId, startTime);
    showMemTotal(currentHostId, startTime);

}

function showMemUsage(hostid, startTime){

    var data_MemPused, data_SwapMemPused = null;

    var history_MemPused = null;
    var history_SwapMemPused = null;

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_memUsage").block(blockUI_opt_all_custom);

    zbxApi.getItem.get(hostid,"vm.memory.size[100-pavailable]").then(function(data) {
        data_MemPused = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.swap.size[,pused]");

    }).then(function(data) {
        data_SwapMemPused = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_MemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_MemPused = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_SwapMemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_SwapMemPused = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = '메모리 사용률';
        dataObj.data = history_MemPused;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = 'swap 메모리 사용률';
        dataObj.data = history_SwapMemPused;
        dataSet.push(dataObj);

        showBasicAreaChart('chart_memUsage', '메모리 사용률', dataSet, "%", ['#fa7796', '#8F8AFF', '#E3C4FF']);

        $('#chart_memUsage').off().on('mousemove touchmove touchstart', function (e) {
            var chart,
                point,
                event;

            for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                if( typeof chart.series[GLOBAL_INDEX] == "undefined"){
                	point = chart.series[0].searchPoint(event, true);
                }else{
                	point = chart.series[GLOBAL_INDEX].searchPoint(event, true); // Get the hovered point                	                	
                }

                if (point) {
                    point.highlight(e);
                }
            }
        });

    });
}




function showMemTotal(hostid, startTime){

    var data_MemBuffers, data_MemCached, data_MemUsed = null;

    var history_MemBuffers = null;
    var history_MemCached = null;
    var history_MemUsed = null;

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_memTotal").block(blockUI_opt_all_custom);

    zbxApi.getItem.get(hostid,"vm.memory.size[buffers]").then(function(data) {
        data_MemBuffers = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"vm.memory.size[cached]");

    }).then(function(data) {
        data_MemCached = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"vm.memory.size[used]");

    }).then(function(data) {
        data_MemUsed = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_MemBuffers.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemBuffers = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_MemCached.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemCached = zbxApi.getHistory.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_MemUsed.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemUsed = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = '버퍼 메모리 사용량';
        dataObj.data = history_MemBuffers;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '캐시 메모리 사용량';
        dataObj.data = history_MemCached;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '메모리 사용량';
        dataObj.data = history_MemUsed;
        dataSet.push(dataObj);

        showBasicLineChart('chart_memTotal', '전체 메모리 사용량', dataSet, "MB", ['#fa7796', '#8bb1d8', '#88e64a', '#00B700','#DB9700','#E3C4FF']);

        $('#chart_memTotal').off().on('mousemove touchmove touchstart', function (e) {
            var chart,
                point,
                event;

            for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart

                if( typeof chart.series[GLOBAL_INDEX] == "undefined"){
                	point = chart.series[0].searchPoint(event, true);
                }else{
                	point = chart.series[GLOBAL_INDEX].searchPoint(event, true); // Get the hovered point                	                	
                }

                if (point) {
                    point.highlight(e);
                }
            }
        });

    });

}

function showMemProcessList(hostid){

    $("#memProcess_wrapper").block(blockUI_opt_all_custom);

    var data_topProcess = callApiForProcessTable(hostid);
    var topProcessLastClock = parseInt(data_topProcess.lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth())+1) + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();
    data_topProcess = sortProcess(data_topProcess, "MEM");
    showMemProcessTable(data_topProcess,topProcessLastTime);
}


function reloadChartForMemUsage(hostid){

    var data_MemPused, data_SwapMemPused = null;

    var history_MemPused = null;
    var history_SwapMemPused = null;

    var startTime_memPused = Math.round((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000) + 1;
    var startTime_swapMemPused = Math.round((chart1.series[1].xData[(chart1.series[1].xData.length)-1]) / 1000) + 1;

    zbxApi.getItem.get(hostid,"vm.memory.size[100-pavailable]").then(function(data) {
        data_MemPused = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"system.swap.size[,pused]");

    }).then(function(data) {
        data_SwapMemPused = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(data_MemPused.result[0].itemid, startTime_memPused, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_MemPused = zbxApi.getHistory.success(data);
        $.each(history_MemPused, function(k,v) {
            chart1.series[0].addPoint([v[0], v[1]]);
            chart1.series[0].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_SwapMemPused.result[0].itemid, startTime_swapMemPused, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_SwapMemPused = zbxApi.getHistory.success(data);
        $.each(history_SwapMemPused, function(k,v) {
            chart1.series[1].addPoint([v[0], v[1]]);
            chart1.series[1].data[0].remove();
        });

        console.log("data adding..");
        console.log(Highcharts.charts.length);
    });
}


function reloadChartForMemTotal(hostid){

    var data_MemBuffers, data_MemCached, data_MemUsed = null;

    var history_MemBuffers = null;
    var history_MemCached = null;
    var history_MemUsed = null;

    var startTime_memBuffers = Math.round((chart2.series[0].xData[(chart2.series[0].xData.length)-1]) / 1000) + 1;
    var startTime_memCached = Math.round((chart2.series[1].xData[(chart2.series[1].xData.length)-1]) / 1000) + 1;
    var startTime_memUsed = Math.round((chart2.series[2].xData[(chart2.series[2].xData.length)-1]) / 1000) + 1;


    zbxApi.getItem.get(hostid,"vm.memory.size[buffers]").then(function(data) {
        data_MemBuffers = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getItem.get(hostid,"vm.memory.size[cached]");

    }).then(function(data) {
        data_MemCached = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getItem.get(hostid,"vm.memory.size[used]");

    }).then(function(data) {
        data_MemUsed = zbxApi.getItem.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(data_MemBuffers.result[0].itemid, startTime_memBuffers, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemBuffers = zbxApi.getHistory.success(data);
        $.each(history_MemBuffers, function(k,v) {
            chart2.series[0].addPoint([v[0], v[1]]);
            chart2.series[0].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_MemCached.result[0].itemid, startTime_memCached, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemCached = zbxApi.getHistory.success(data);
        $.each(history_MemCached, function(k,v) {
            chart2.series[1].addPoint([v[0], v[1]]);
            chart2.series[1].data[0].remove();
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_MemUsed.result[0].itemid, startTime_memUsed, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        history_MemUsed = zbxApi.getHistory.success(data);
        $.each(history_MemUsed, function(k,v) {
            chart2.series[2].addPoint([v[0], v[1]]);
            chart2.series[2].data[0].remove();
        });

    });
}

var showMemProcessTable = function(finalProcArr, topProcessLastTime){

    var maxRefValue;
    var processGaugeValue;
    var memProcessTbl = '';
    var MAX_PROCCOUNT = 24;
    if(typeof finalProcArr == "undefined"){
        memProcessTbl += "수집된 데이터가 없습니다.";
    }else{
        memProcessTbl += "<tbody>";

        $.each(finalProcArr, function(k,v) {
            if(k<MAX_PROCCOUNT){
                var procName = v.procName;
                var processPercentValue = v.totalMemVal.toFixed(1);

                if(k==0){
                    maxRefValue = processPercentValue;
                    processGaugeValue = 100;
                }else{
                    processGaugeValue = (processPercentValue * 100) / maxRefValue;
                }

                if(k< (MAX_PROCCOUNT-10)){
                    memProcessTbl += "<tr class='h35'>";
                }else{
                    memProcessTbl += "<tr class='h35 optionrow' style='display:none;'>";
                }
                memProcessTbl += "<td width='170' class='align_left pl10 pr10'>";
                memProcessTbl += "<div class='fl mt2 mr5 f11' title='" + procName + "'>" + procName +" " + processPercentValue + "%</div>";
                memProcessTbl += "<div class='scw br3'><div class='mt2 bg8 br3' style='width: " + processGaugeValue + "%; height:5px;'></div></div>";
                memProcessTbl += "</td>";
                memProcessTbl += "<td style='display:none' title='" + v.childName + "'></td>";
                memProcessTbl += "<td style='display:none' title='" + v.childMem + "'></td>";
                memProcessTbl += "</tr>";
            }
        });
        memProcessTbl += "<tr id='lastrow' isopen='false' class='h35'><td><span class='ellipsis'>[ 더 보기 ]</span></td></tr>";
        memProcessTbl += "</tbody>";
    }

    $("#memProcessTime").children().eq(0).text(topProcessLastTime);
    $("#memProcess").empty();
    $("#memProcess").append(memProcessTbl);


    var $table = $("#memProcess");

    $('tr', $table).each(function (row){

        $(this).click(function(){
            if($(this).is('#lastrow') == false){
                var childName = $(this).children(":last").prev().attr('title');
                childName = childName.slice(0,-2);
                var childMem = $(this).children(":last").attr('title');
                var childNameArr = [];
                var childMemArr = childMem.split(",");
                var procDetailHTML = '';

                if(childMemArr.length == 1){
                    childNameArr.push(childName);
                }else{
                    childNameArr = childName.split("\\n,");
                }
                procDetailHTML += "<table class='table1' style='width:100%;'><tbody>";

                $.each(childNameArr, function(k,v){
                    procDetailHTML += "<tr class='h35'>";
                    procDetailHTML += "<td width='50' class='align_left pl10 pr10'>" + (k+1) + "</td>";
                    procDetailHTML += "<td width='200' class='align_left pl10 pr10'>" + childNameArr[k] + "</td>";
                    procDetailHTML += "<td width='170' class='align_left pl10 pr10'>" + childMemArr[k] + "%</td>";
                    procDetailHTML += "</tr>";
                });
                procDetailHTML += "</tbody></table>";
                $("#memChildProcTbl").empty();
                $("#memDetailProcTitle").html($(this).children(":first").children(":first").attr('title'));
                $("#memChildProcTbl").append(procDetailHTML);
                $('#memChildProcessContent').lightbox_me({
                    centered: true,
                    closeSelector: ".close",
                    onLoad: function() {
                        $('#memChildProcessContent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
                    },
                    overlayCSS:{background: '#474f79', opacity: .8}
                });
            }
        });
    });

    viewMoreProcess();

    $("#btn_mem_charttime").off().on('click', function(){
        $("#mem_timeInput").val("");
        $("#mem_time_content").lightbox_me({
            centered: true,
            closeSelector: ".close",
            onLoad: function() {
                $('#memChildProcessContent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
            },
            overlayCSS:{background: '#474f79', opacity: .8}
        });
    });

    $("#reload_memProcTable").off().on('click', function(){
        showMemProcessTable(currentHostId);
    });

    $("#memProcess_wrapper").unblock(blockUI_opt_all_custom);
}