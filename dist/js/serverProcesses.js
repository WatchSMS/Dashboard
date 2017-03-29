var procUsageView = function(hostid, startTime) {

    $.blockUI(blockUI_opt_all);
    
    var topProcessLastClock = null;
    var ProcessTableHTML = '';
    var INIT_PROCCOUNT = 17;
    var MAX_PROCCOUNT = 30;
    var currentProcessName = null;
    var tableDataObj = new Object();
    var tableDataArr = [];
    var lastProcessData = callApiForProcessTable(hostid);
    var lastClockLongType = parseInt(lastProcessData.lastclock) * 1000;
    var date = new Date(lastClockLongType);
    var lastClockForProcessTable = date.getFullYear() + "-" + (parseInt(date.getMonth())+1) + "-" + date.getDate()  + " " + date.getHours() + ":" + date.getMinutes();
    var sortProcessForTable = sortProcess(lastProcessData, "CPU");
		
    ProcessTableHTML += "<tbody>";

    //ps 데이터의  마지막  값을 테이블에 삽입
    $.each(sortProcessForTable, function(k,v) {

        tableDataObj = new Object();

        tableDataObj.procName = v.procName;
        tableDataObj.cpuValue = parseFloat(v.totalCpuVal.toFixed(1));
        tableDataObj.memValue = parseFloat(v.totalMemVal.toFixed(1));
        tableDataObj.procCnt = parseInt(v.procCnt);
        tableDataArr.push(tableDataObj);
        
        var procCpuValue = v.totalCpuVal.toFixed(1);
        var procMemValue = v.totalMemVal.toFixed(1);
        
        if(k < MAX_PROCCOUNT){
        	if(k < INIT_PROCCOUNT){
                ProcessTableHTML += "<tr id='" + v.procName + "' class='h34'>";
            }else{
            	ProcessTableHTML += "<tr id='" + v.procName + "' class='h34 optionrow' style='display:none;'>";
            }
            ProcessTableHTML += "<td width='30%' class='align_left line sorting_1'><span class='ellipsis' title='" + v.procName + "'>" + v.procName + "</span></td>";
            ProcessTableHTML += "<td width='25%' class='line percent-text sorting_3'>" + procCpuValue + "</td>";
            ProcessTableHTML += "<td width='25%' class='line percent-text pr-none sorting_2'>" + procMemValue + "<span class='smaller'></span></td>";
            ProcessTableHTML += "<td width='20%' class='br7_rt pr-none text-center'><span class='line'>" + v.procCnt + "</span></td>";
            ProcessTableHTML += "</tr>";
        }
    });

    ProcessTableHTML += "<tr id='lastrow' class='h34' width='100%' isopen='false' role='row'><td colspan='4' style='text-align: center;'><span class='ellipsis'>[ 더 보기 ]</span></td></tr>";
    ProcessTableHTML += "</tbody>";
    
    $("#detailedProcTime").text(lastClockForProcessTable);
    $("#detailedCpuProc").empty();
    $("#detailedCpuProc").append(ProcessTableHTML);
    $("#chart_processCpu").empty();
    $("#chart_processMem").empty();
    var $table1 = $("#processUsageTable1");
    var $table = $("#detailedCpuProc");
    $("#detailedCpuProc > tbody > tr").eq(0).addClass("selectedProcess");
    $("#detailedCpuProc > tbody > tr").eq(0).css("border","1px #FF5E00 solid");
              
    currentProcessName = $(".selectedProcess").attr('id');
    
    generateProcessResource(hostid, currentProcessName, startTime);
    

    // table의 row에 클릭시 하이라이트 처리 및 해당 프로세스 차트를 만드는 클릭 이벤트 생성 
    rowClickEvent($table, hostid, startTime);
    viewMoreProcess();

    // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
    $("#btn_proc.btn").off().on('click',function() {
        var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        var currentProcessName = $(".selectedProcess").attr('id');
        generateProcessResource(hostid, currentProcessName, startTime1);
    });
    // 시간 수동 입력 버튼 클릭시
    $("#btn_proc.btn_etc").off().on('click',function() {
    	$('#selectProcTimeInput').val("");
        $('#proc_InputTimecontent').lightbox_me({
 		   centered: true, 
 		   closeSelector: ".close",
 		   onLoad: function() { 
 		       $('#proc_InputTimecontent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
 		   },
 		   overlayCSS:{background: '#51597E', opacity: .8} 
        });
    });

    // 테이블의 th col 클릭시, 정렬 된 테이블 내용 생성 및 각 행의 클릭이벤트(하이라이트, 차트) 생성
    $('td', $table1).each(function (column){
        $(this).click(function(){
            var procTableRow = '';
            var currentThObj = $(this);
            var tmpProcessName = $(".selectedProcess").attr('id');

            if($(this).is('.sorting_desc')){
                tableDataArr.sort(function (a, b) {
                    if(column == 0){
                        return a.procName < b.procName ? -1 : a.procName > b.procName ? 1 : 0;
                    }else if(column == 1){
                        return a.cpuValue < b.cpuValue ? -1 : a.cpuValue > b.cpuValue ? 1 : 0;
                    }else if(column == 2){
                        return a.memValue < b.memValue ? -1 : a.memValue > b.memValue ? 1 : 0;
                    }else if(column == 3){
                        return a.procCnt < b.procCnt ? -1 : a.procCnt > b.procCnt ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            }else{
                tableDataArr.sort(function (a, b) {
                    if(column == 0){
                        return a.procName > b.procName ? -1 : a.procName < b.procName ? 1 : 0;
                    }else if(column == 1){
                        return a.cpuValue > b.cpuValue ? -1 : a.cpuValue < b.cpuValue ? 1 : 0;
                    }else if(column == 2){
                        return a.memValue > b.memValue ? -1 : a.memValue < b.memValue ? 1 : 0;
                    }else if(column == 3){
                        return a.procCnt > b.procCnt ? -1 : a.procCnt < b.procCnt ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
            }
            console.log("MAX_PROCCOUNT : " + MAX_PROCCOUNT);
            console.log("INIT_PROCCOUNT : " + INIT_PROCCOUNT);
            for(var i=0; i<MAX_PROCCOUNT; i++){
            	
            	 if($('tr#lastrow').attr('isopen') == 'false'){
            		 if( i < INIT_PROCCOUNT){
                 		procTableRow += "<tr id='" + tableDataArr[i].procName + "' class='h34'>";
                 	}else{
                 		procTableRow += "<tr id='" + tableDataArr[i].procName + "' class='h34 optionrow' style='display:none;'>";
                 	}
            	 }else{
            		 if( i < INIT_PROCCOUNT){
            			 procTableRow += "<tr id='" + tableDataArr[i].procName + "' class='h34'>";
            		 }else{
            			 procTableRow += "<tr id='" + tableDataArr[i].procName + "' class='h34 optionrow'>";
            		 }
            	 }
                procTableRow += "<td width='245' class='text-left align_left line sorting_1'><span class='ellipsis' title='" + tableDataArr[i].procName + "'>" + tableDataArr[i].procName + "</span></td>";
                procTableRow += "<td width='200' class='line percent-text sorting_3'>" + tableDataArr[i].cpuValue + "</td>";
                procTableRow += "<td width='200' class='line percent-text pr-none sorting_2'>" + tableDataArr[i].memValue + "<span class='smaller'></span></td>";
                procTableRow += "<td width='auto' class='br7_rt pr-none text-center pr-none'>" + tableDataArr[i].procCnt + "</td>";
                procTableRow += "</tr>";
            }
            if($('tr#lastrow').attr('isopen') == 'false'){
            	procTableRow += "<tr id='lastrow' isopen='false' role='row'><td colspan='4' style='text-align: center;'><span class='ellipsis'>[ 더 보기 ]</span></td></tr>";
            }else{
            	procTableRow += "<tr id='lastrow' isopen='true' role='row'><td colspan='4' style='text-align: center;'><span class='ellipsis'>[ 닫 기 ]</span></td></tr>";
            }
            
            $('tbody', $table).empty();
            $('tbody', $table).append(procTableRow);
            $("#"+tmpProcessName).addClass("selectedProcess").css("border","1px #FF5E00 solid");
            rowClickEvent($table, hostid, startTime);
            viewMoreProcess();
            
        });// end click
    });// end th col
    
    
    $("#reload_procTableList").off().on('click', function(){
    	console.log("click!");
    	var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
        $.blockUI(blockUI_opt_all);
        procUsageView(currentHostId, startTime);
    });
    
    $.unblockUI(blockUI_opt_all);

    TIMER_ARR.push(setInterval(function(){reloadChartForProcess(hostid);}, 10000));
}

var generateProcessResource = function(hostid, processName, startTime) {

    var itemId = null;
    var dataObj = new Object();
    var cpuArr = [];
    var memArr = [];
    var dataSet = [];
    var cpuDataObj = null;
    var memDataObj = null;
    var cpuDataSet = [];
    var memDataSet = [];
    
    
    var itemKey = "system.run[\"ps -eo user,pid,ppid,pmem,pcpu,time,cmd --sort=-pcpu\"]";
    $("#chart_processCpu").block(blockUI_opt_all_custom);
    $("#chart_processMem").block(blockUI_opt_all_custom);
    
    removeAllChart();

    zbxApi.getItem.get(hostid,itemKey).then(function(data) {
        var item = zbxApi.getItem.success(data);
        itemId = item.result[0].itemid;

    }).then(function() {
        return zbxApi.getProcHistory.get(itemId, startTime, HISTORY_TYPE.LOG);

    }).then(function(data) {
        var hisData = zbxApi.getProcHistory.success(data);
        var hisDataCount = hisData.result.length;
        var showDataCount = 180;
        var hisDataInterval = 1;
        if(hisDataCount >= 180){
            hisDataInterval = Math.round(hisDataCount / showDataCount);
        }
        for(var i=0,j=0; i<hisDataCount; i+=hisDataInterval,j++){ // 전체 히스토리 데이터에서 일부만 추출

            var cpuSumVal = 0;
            var memSumVal = 0.0;
            var ProcRowArr = data.result[i].value.split("\n");

            $.each(ProcRowArr, function(k,v) { // 각 행별,프로세스 명을 비교하여 cpu, mem 값을 sum.
                if(ProcRowArr[k].indexOf(processName) != -1){

                    while(ProcRowArr[k].indexOf("  ") != -1){
                        ProcRowArr[k] = ProcRowArr[k].replace('  ',' ');
                    }
                    var ProcColArr = ProcRowArr[k].split(" ");
                    var tempProcName = null;
                    var procNameArr = [];

                    if(ProcColArr[6].indexOf("/0") != -1){
                        tempProcName = ProcColArr[6];
                    }else{
                        procNameArr = ProcColArr[6].split("/");
                        tempProcName = procNameArr[procNameArr.length-1];
                    }
                    tempProcName = tempProcName.replace(/\:/g, '');
                    if(tempProcName == processName){
                        cpuSumVal += parseFloat(ProcColArr[4]);
                        memSumVal += parseFloat(ProcColArr[3]);
                    }
                }
            });
            // 각 히스토리 데이터 cpu, mem의 sum값을 data 배열에 담는다.
            cpuArr[j] = new Array();
            cpuArr[j][0]=parseInt(data.result[i].clock) * 1000;
            cpuArr[j][1]=parseFloat(cpuSumVal.toFixed(1));
            memArr[j] = new Array();
            memArr[j][0]=parseInt(data.result[i].clock) * 1000;
            memArr[j][1]=parseFloat(memSumVal.toFixed(1));
        }

        //차트에 전달할 데이터셋 생성
        cpuDataObj = new Object();
        cpuDataObj.name = processName;
        cpuDataObj.data = cpuArr;
        cpuDataSet.push(cpuDataObj);

        memDataObj = new Object();
        memDataObj.name = processName;
        memDataObj.data = memArr;
        memDataSet.push(memDataObj);
        
        var cpuChartTitle = "CPU (" + $(".selectedProcess").children().eq(0).text() + ")";
        var memChartTitle = "Memory (" + $(".selectedProcess").children().eq(0).text() + ")";
        
        $("#processCpuSeries").text($(".selectedProcess").children().eq(0).text());
        $("#processMemSeries").text($(".selectedProcess").children().eq(0).text());
        
        showBasicLineChart('chart_processCpu', cpuChartTitle, cpuDataSet, "%", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
        showBasicAreaChart('chart_processMem', memChartTitle, memDataSet, "%", ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
        $('#chart_processCpu').off().on('mousemove touchmove touchstart', function (e) {
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
        $('#chart_processMem').off().on('mousemove touchmove touchstart', function (e) {
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

var clickBtnInputTime = function(){
	var inputTime = $('#proc_InputTimecontent').find('input:first').val();
	var currentProcessName = $(".selectedProcess").attr('id');
	var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);
    
	generateProcessResource(currentHostId, currentProcessName, startTime);
    
}

function reloadChartForProcess(hostId){
	
    var cpuArr = [];
    var memArr = [];
    
	var item = null;	
	var startTime = Math.round((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000) + 1;
	var itemKey = "system.run[\"ps -eo user,pid,ppid,pmem,pcpu,time,cmd --sort=-pcpu\"]";
	var selectProcess = $(".selectedProcess").children().eq(0).text();
	
	zbxApi.getItem.get(hostId,itemKey).then(function(data) {
        item = zbxApi.getItem.success(data);

    }).then(function() {
        return zbxApi.getProcHistory.get(item.result[0].itemid, startTime, HISTORY_TYPE.LOG);

    }).then(function(data) {
        var hisData = zbxApi.getProcHistory.success(data);
        for(var i=0; i<hisData.result.length; ++i){
            var cpuSumVal = 0;
            var memSumVal = 0.0;
            var ProcRowArr = hisData.result[i].value.split("\n");
            
            $.each(ProcRowArr, function(k,v) { // 각 행별,프로세스 명을 비교하여 cpu, mem 값을 sum.
                if(ProcRowArr[k].indexOf(selectProcess) != -1){

                    while(ProcRowArr[k].indexOf("  ") != -1){
                        ProcRowArr[k] = ProcRowArr[k].replace('  ',' ');
                    }
                    var ProcColArr = ProcRowArr[k].split(" ");
                    var tempProcName = null;
                    var procNameArr = [];

                    if(ProcColArr[6].indexOf("/0") != -1){
                        tempProcName = ProcColArr[6];
                    }else{
                        procNameArr = ProcColArr[6].split("/");
                        tempProcName = procNameArr[procNameArr.length-1];
                    }
                    tempProcName = tempProcName.replace(/\:/g, '');
                    if(tempProcName == selectProcess){
                        cpuSumVal += parseFloat(ProcColArr[4]);
                        memSumVal += parseFloat(ProcColArr[3]);
                    }
                }
            });
            
            cpuArr[i] = new Array();
            cpuArr[i][0]=parseInt(hisData.result[i].clock) * 1000;
            cpuArr[i][1]=parseFloat(cpuSumVal.toFixed(1));
            memArr[i] = new Array();
            memArr[i][0]=parseInt(hisData.result[i].clock) * 1000;
            memArr[i][1]=parseFloat(memSumVal.toFixed(1));
        }
        
        $.each(cpuArr, function(k,v){
        	chart2.series[0].addPoint([v[0], v[1]]);
        });
        $.each(memArr, function(k,v){
        	chart1.series[0].addPoint([v[0], v[1]]);
        });
    });
}


var rowClickEvent = function(table, hostid, startTime){
    $('tr', table).each(function (row){
        if(row < ($('tr', table).size()-1)){
            $(this).click(function(){
            	
                var currentProcessName = $(this).attr('id');
                $(".selectedProcess").removeClass("selectedProcess");
                $(this).addClass("selectedProcess");
                $(this).css("border","1px #FF5E00 solid");
                $(this).prevAll().css("border","");
                $(this).nextAll().css("border","");
               
                generateProcessResource(hostid, currentProcessName, startTime);
            });
        }
    });
}

