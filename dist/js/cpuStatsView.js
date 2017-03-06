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
	
    var CpuSystemArr = [];
    var CpuUserArr = [];
    var CpuIOwaitArr = [];
    var CpuStealArr = [];

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

        showBasicAreaChart('chart_cpuUsage', 'CPU 사용량', dataSet, "%", ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
        
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
	    
	    showBasicLineChart('chart_loadAverage', '평균 부하량', dataSet, "", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
	    
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
    cpuProcessTbl += "<thead>";
    cpuProcessTbl += "<tr class='display-none' role='row'>";
    cpuProcessTbl += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
    cpuProcessTbl += "<th class='sorting_disabled display-none' rowspan='1' colspan='1'></th>";
    cpuProcessTbl += "</tr>";
    cpuProcessTbl += "</thead>";
    cpuProcessTbl += "<tbody>";

    $.each(finalProcArr, function(k,v) {
        if(k<MAX_PROCCOUNT){
            var procName = v.procName;
            var processPercentValue = v.totalCpuVal.toFixed(1);
            
            if(k==0){
                maxRefValue = processPercentValue;
                processGaugeValue = 100;
            }else{
                processGaugeValue = (processPercentValue * 100) / maxRefValue;
            }
            
            if(k< (MAX_PROCCOUNT-10)){
            	cpuProcessTbl += "<tr role='row' class='odd'>";
            }else{
            	cpuProcessTbl += "<tr role='row' class='odd optionrow' style='display:none;'>";
            }
            cpuProcessTbl += "<td class=' pt-xs pb-xs'><span class='name ellipsis' title='" + procName + "'>" + procName + "</span>";
            cpuProcessTbl += "<span class='bold value percent-text'>" + processPercentValue + "</span>";
            cpuProcessTbl += "<div class='progress-wrapper'><div class='progress' style='width:" + processGaugeValue + "%;'>";
            cpuProcessTbl += "<div class='progress-bar' role='progressbar' aria=valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width:100%;'></div>";
            cpuProcessTbl += "</div></div>";
            cpuProcessTbl += "</td>";
            cpuProcessTbl += "<td style='display:none' title='" + v.childName + "'></td>";
            cpuProcessTbl += "<td style='display:none' title='" + v.childCpu + "'></td>";
            cpuProcessTbl += "</tr>";
        }
    });
    cpuProcessTbl += "<tr id='lastrow' isopen='false' role='row'><td><span class='ellipsis'>[ 더 보기 ]</span></td></tr>";
    cpuProcessTbl += "</tbody>";
  
    
    $("#processTime").text(topProcessLastTime);
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
	             procDetailHTML += "<table class='table table-bordered simple-list dataTable no-footer table-striped table-hover' role='grid'>";
	             procDetailHTML += "<thead>";
	             procDetailHTML += "<tr class='display-none' role='row'>";
	             procDetailHTML += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
	             procDetailHTML += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
	             procDetailHTML += "<th class='sorting_disabled display-none' rowspan='1' colspan='1'></th>";
	             procDetailHTML += "</tr>";
	             procDetailHTML += "</thead>";
	             procDetailHTML += "<tbody>";
	             $.each(childNameArr, function(k,v){
	            	 procDetailHTML += "<tr>";
	            	 procDetailHTML += "<td>" + (k+1) + "</td>";
	                 procDetailHTML += "<td style='word-break:break-all;'>" + childNameArr[k] + "</td>";
	                 procDetailHTML += "<td>" + childCpuArr[k] + "%</td>";
	                 procDetailHTML += "</tr>";
	             });
	             procDetailHTML += "</tbody>";
	             $("#childProcTbl").empty();
	             $("#detailProcessTitle").html($(this).children(":first").children(":first").attr('title'));
	        	 $("#childProcTbl").append(procDetailHTML);
	        	 $('#sign_up').lightbox_me({
	   			   centered: true, 
	   			   closeSelector: ".close",
	   			   onLoad: function() { 
	   			       $('#sign_up').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
	   			   },
	   			   overlayCSS:{background: 'white', opacity: .8} 
	          	});
        	 }
         });
    });

    $('tr#lastrow').click(function(){

    	var optionRows = $("tr.optionrow");
    	if($(this).attr('isopen') == 'false'){
	    	$.each(optionRows, function(k,v) {
	    		$(this).css('display','');
	    		$('tr#lastrow').attr("isopen","true");
	    		$('tr#lastrow').children().children().html("[ 닫기 ]");
	    	});
    	}else{
    		$.each(optionRows, function(k,v) {
	    		$(this).css('display','none');
	    		$('tr#lastrow').attr("isopen","false");
	    		$('tr#lastrow').children().children().html("[ 더 보기 ]");
	    	});
    	}
    });
    
    $("#btn_cpu_charttime").click(function(){
    	$("#cpu_timeInput").val("");
    	$("#cpu_time_content").lightbox_me({
 		   centered: true, 
 		   closeSelector: ".close",
 		   onLoad: function() { 
 		       $('#sign_up').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
 		   },
 		   overlayCSS:{background: 'white', opacity: .8} 
      });
    });
    
    $("#reload_cpuProcTable").click(function(){
    	var hostId = $("#cpu_hostid").html();
    	showCpuProcessList(hostId);
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
    
    var startTime = Math.round((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000) + 1;
    
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
    	$.each(history_CpuSystem, function(k,v) {
    		chart1.series[0].addPoint([v[0], v[1]]);
        });    	
    	
    }).then(function() {
        return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuUser = zbxApi.getHistory.success(data);
        $.each(history_CpuUser, function(k,v) {
    		chart1.series[1].addPoint([v[0], v[1]]);
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuIOwait = zbxApi.getHistory.success(data);
        $.each(history_CpuIOwait, function(k,v) {
    		chart1.series[2].addPoint([v[0], v[1]]);
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        history_CpuSteal = zbxApi.getHistory.success(data);
        $.each(history_CpuSteal, function(k,v) {
    		chart1.series[3].addPoint([v[0], v[1]]);
        });
  
        console.log("data adding..");
    });
}

function updateCpuLoadAvg(hostid){
	
	var data_loadavg1, data_loadavg5, data_loadavg15 = null;
	
    var history_loadavg1 = null;
    var history_loadavg5 = null;
    var history_loadavg15 = null;
    
    var startTime = Math.round((chart2.series[0].xData[(chart2.series[0].xData.length)-1]) / 1000) + 1;
    
    
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
    	$.each(history_loadavg1, function(k,v) {
    		chart2.series[0].addPoint([v[0], v[1]]);
        });
    	
    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg5.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
    	history_loadavg5 = zbxApi.getHistory.success(data);
    	$.each(history_loadavg5, function(k,v) {
    		chart2.series[1].addPoint([v[0], v[1]]);
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_loadavg15.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
    	history_loadavg15 = zbxApi.getHistory.success(data);
    	$.each(history_loadavg15, function(k,v) {
    		chart2.series[2].addPoint([v[0], v[1]]);
        });
    	
    });
}

