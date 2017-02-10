var generateProcessResource = function(hostid, processName, startTime) {

    var itemId = null;
    var dataObj = new Object();
    var cpuArr = [];
    var memArr = [];
    var dataSet = [];
    var itemKey = "system.run[\"ps -eo user,pid,ppid,pmem,pcpu,time,cmd --sort=-pcpu\"]";
    $("#chart_processCpu").block(blockUI_opt_all_custom);
    $("#chart_processMem").block(blockUI_opt_all_custom);

    zbxApi.getItem.get(hostid, itemKey).then(function(data) {
        var item = zbxApi.getItem.success(data);
        itemId = item.result[0].itemid;

    }).then(function() {
        return zbxApi.getProcHistory.get(itemId, startTime, HISTORY_TYPE.LOG);

    }).then(function(data) {
        var hisData = zbxApi.getProcHistory.success(data);
        var hisDataCount = hisData.result.length;
        var showDataCount = 180;
        var hisDataInterval = 1;
        if (hisDataCount >= 180) {
            hisDataInterval = Math.round(hisDataCount / showDataCount);
        }
        for (var i = 0, j = 0; i < hisDataCount; i += hisDataInterval, j++) { // 전체 히스토리 데이터에서 일부만 추출

            var cpuDataObj = null;
            var cpuDataSet = [];
            var cpuSumVal = 0;
            var memDataObj = null;
            var memDataSet = [];
            var memSumVal = 0.0;
            var ProcRowArr = data.result[i].value.split("\n");

            $.each(ProcRowArr, function(k, v) { // 각 행별,프로세스 명을 비교하여 cpu, mem 값을 sum.
                if (ProcRowArr[k].indexOf(processName) != -1) {

                    while (ProcRowArr[k].indexOf("  ") != -1) {
                        ProcRowArr[k] = ProcRowArr[k].replace('  ', ' ');
                    }
                    var ProcColArr = ProcRowArr[k].split(" ");
                    var tempProcName = null;
                    var procNameArr = [];

                    if (ProcColArr[6].indexOf("/0") != -1) {
                        tempProcName = ProcColArr[6];
                    } else {
                        procNameArr = ProcColArr[6].split("/");
                        tempProcName = procNameArr[procNameArr.length - 1];
                    }
                    tempProcName = tempProcName.replace(/\:/g, '');
                    if (tempProcName == processName) {
                        cpuSumVal += parseFloat(ProcColArr[4]);
                        memSumVal += parseFloat(ProcColArr[3]);
                    }
                }
            });
            // 각 히스토리 데이터 cpu, mem의 sum값을 data 배열에 담는다.
            cpuArr[j] = new Array();
            cpuArr[j][0] = parseInt(data.result[i].clock) * 1000;
            cpuArr[j][1] = parseFloat(cpuSumVal.toFixed(1));
            memArr[j] = new Array();
            memArr[j][0] = parseInt(data.result[i].clock) * 1000;
            memArr[j][1] = parseFloat(memSumVal.toFixed(1));
        }

        //차트에 전달할 데이터셋 생성
        // cpuDataObj = new Object();
        // cpuDataObj.name = processName;
        // cpuDataObj.data = cpuArr;
        // cpuDataSet.push(cpuDataObj);

        cpuDataSet.push(new DataObject(processName, cpuArr));



        // memDataObj = new Object();
        // memDataObj.name = processName;
        // memDataObj.data = memArr;
        // memDataSet.push(memDataObj);

        memDataSet.push(new DataObject(processName, memArr));


        showBasicLineChart('chart_processCpu', 'CPU', cpuDataSet, Label.percent, ['#00B700', '#DB9700', '#E3C4FF', '#8F8AFF']);
        showBasicAreaChart('chart_processMem', 'Memory', memDataSet, Label.MB, ['#E3C4FF', '#8F8AFF', '#00B700', '#DB9700']);
    });
}


var procUsageView = function(hostid, startTime) {
    $.blockUI(blockUI_opt_all);

    var topProcessLastClock = null;
    var ProcessTableHTML = '';
    var MAX_PROCCOUNT = 13;
    var currentProcessName = null;
    var tableDataObj = new Object();
    var tableDataArr = [];
    var lastProcessData = callApiForProcessTable(hostid);
    var lastClockLongType = parseInt(lastProcessData.lastclock) * 1000;
    var date = new Date(lastClockLongType);
    var lastClockForProcessTable = date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    var sortProcessForTable = sortProcInCpuOrder(lastProcessData);

    ProcessTableHTML += "<thead>";
    ProcessTableHTML += "<tr role='row'>";
    ProcessTableHTML += "<th class='percent-text sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='CPU: 오름차순 정렬' aria-sort='descending'>이름</th>";
    ProcessTableHTML += "<th width='15%' class='text-left sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='이름: 오름차순 정렬'>cpu</th>";
    ProcessTableHTML += "<th class='pr-none sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='메모리: 오름차순 정렬'>메모리</th>";
    ProcessTableHTML += "<th class='text-center pr-none sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='수: 오름차순 정렬'>수</th>";
    ProcessTableHTML += "</tr>";
    ProcessTableHTML += "</thead>";
    ProcessTableHTML += "<tbody>";

    //ps 데이터의  마지막  값을 테이블에 삽입
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

            ProcessTableHTML += "<tr id='" + v.procName + "' role='row' class='odd'>";
            ProcessTableHTML += "<td class='text-left sorting_1'><span class='ellipsis' title='" + v.procName + "'>" + v.procName + "</span></td>";
            ProcessTableHTML += "<td class='percent-text sorting_3'>" + procCpuValue + "</td>";
            ProcessTableHTML += "<td class='pr-none sorting_2'>" + procMemValue + "<span class='smaller'>MB</span></td>";
            ProcessTableHTML += "<td class='text-center pr-none'>" + v.procCnt + "</td>";
            ProcessTableHTML += "</tr>";
        }
    });

    ProcessTableHTML += "</tbody>";

    $("#detailedProcTime").text(lastClockForProcessTable);
    $("#detailedCpuProc").empty();
    $("#detailedCpuProc").append(ProcessTableHTML);
    $("#chart_processCpu").empty();
    $("#chart_processMem").empty();
    var $table = $("#detailedCpuProc");
    $("#detailedCpuProc > tbody > tr").eq(0).addClass("selectedProcess");
    currentProcessName = $(".selectedProcess").attr('id');
    generateProcessResource(hostid, currentProcessName, startTime);


    // table의 row에 클릭시 하이라이트 처리 및 해당 프로세스 차트를 만드는 클릭 이벤트 생성
    rowClickEvent($table, hostid, startTime);

    // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
    $("#btn_proc.btn").click(function() {
        var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        var currentProcessName = $(".selectedProcess").attr('id');
        generateProcessResource(hostid, currentProcessName, startTime1);
    });

    // 테이블의 th col 클릭시, 정렬 된 테이블 내용 생성 및 각 행의 클릭이벤트(하이라이트, 차트) 생성
    $('th', $table).each(function(column) {
        $(this).click(function() {
            var procTableRow = '';
            var currentThObj = $(this);
            var MAX_PROCCOUNT = 13;
            var tmpProcessName = $(".selectedProcess").attr('id');

            if ($(this).is('.sorting_desc')) {
                tableDataArr.sort(function(a, b) {
                    if (column == 0) {
                        return a.procName < b.procName ? -1 : a.procName > b.procName ? 1 : 0;
                    } else if (column == 1) {
                        return a.cpuValue < b.cpuValue ? -1 : a.cpuValue > b.cpuValue ? 1 : 0;
                    } else if (column == 2) {
                        return a.memValue < b.memValue ? -1 : a.memValue > b.memValue ? 1 : 0;
                    } else if (column == 3) {
                        return a.procCnt < b.procCnt ? -1 : a.procCnt > b.procCnt ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            } else {
                tableDataArr.sort(function(a, b) {
                    if (column == 0) {
                        return a.procName > b.procName ? -1 : a.procName < b.procName ? 1 : 0;
                    } else if (column == 1) {
                        return a.cpuValue > b.cpuValue ? -1 : a.cpuValue < b.cpuValue ? 1 : 0;
                    } else if (column == 2) {
                        return a.memValue > b.memValue ? -1 : a.memValue < b.memValue ? 1 : 0;
                    } else if (column == 3) {
                        return a.procCnt > b.procCnt ? -1 : a.procCnt < b.procCnt ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
            }
            $('tbody', $table).empty();

            for (var i = 0; i < MAX_PROCCOUNT; i++) {
                procTableRow += "<tr id='" + tableDataArr[i].procName + "' role='row' class='odd'>";
                procTableRow += "<td class='text-left sorting_1'><span class='ellipsis' title='" + tableDataArr[i].procName + "'>" + tableDataArr[i].procName + "</span></td>";
                procTableRow += "<td class='percent-text sorting_3'>" + tableDataArr[i].cpuValue + "</td>";
                procTableRow += "<td class='pr-none sorting_2'>" + tableDataArr[i].memValue + "<span class='smaller'>MB</span></td>";
                procTableRow += "<td class='text-center pr-none'>" + tableDataArr[i].procCnt + "</td>";
                procTableRow += "</tr>";
            }
            $('tbody', $table).append(procTableRow);
            $("#" + tmpProcessName).addClass("selectedProcess");
            rowClickEvent($table, hostid, startTime);
        }); // end click
    }); // end th col

    $.unblockUI(blockUI_opt_all);
}
