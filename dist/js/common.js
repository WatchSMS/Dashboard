function DataObject(name, data){
  this.name=name;
  this.data=data;
}

var resultToArray = new function(data) {
    var array = [];
    $.each(data, function(k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var convStatus = function(status) {
    if (status === "0") {
        return "OK";
    } else {
        return "problem";
    }
};

var convAck = function(ack) {
    if (ack === "0") {
        return "Unacked";
    } else {
        return "Acked";
    }
};

var convPriority = function(priority) {
    switch (priority) {
        case "0":
            return "not classified";
        case "1":
            return "information";
        case "2":
            return "warning";
        case "3":
            return "average";
        case "4":
            return "high";
        case "5":
            return "disaster";
    }
};

/*
var convAckServer = function(ack) {
    if (ack === "0") {
        return "아니오";
    } else {
        return "예";
    }
};

var convPriorityServer = function(priority) {
    switch (priority) {
        case "0":
            return "미분류";
        case "1":
            return "정보";
        case "2":
            return "경고";
        case "3":
            return "가벼운 장애";
        case "4":
            return "중증 장애";
        case "5":
            return "심각한 장애";
    }
};

var convStatusServer = function(status) {
    if (status === "0") {
        return "장애 없음";
    } else {
        return "장애 있음";
    }
};
*/

var resultToArray = function(data) {
    var array = [];
    $.each(data, function(k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var Label = new function() {
    this.default = function(val) {
        return val;
    };
    this.percent = function(val) {
        return val + '%';
    };
    this.MB = function(val) {
        return Math.round(val / (1024 * 1024)) + 'MB';
    };
};

function chartCall(chartId, title, series, label, colorArr) {
    if (label == null) {
        label = Label.default;
    }

    if (colorArr == null) {
        colorArr = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 'f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
    }

    $(function() {
        Highcharts.chart(chartId, {
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                zoomType: 'x',
                height: 200,
                spacingTop: 10,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0
            },
            title: {
                //text: title
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                gridLineColor: '#707073',
                lineColor: '#707073',
                minorGridLineColor: '#505053',
                tickColor: '#707073',
                labels: {
                    formatter: function() {
                        var d2 = new Date(this.value);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if (hours.length == 1) {
                            hours = "0" + hours;
                        }
                        if (minutes.length == 1) {
                            minutes = "0" + minutes;
                        }
                        if (seconds.length == 1) {
                            seconds = "0" + seconds;
                        }
                        return hours + ":" + minutes + ":" + seconds;
                    }
                }
            },
            yAxis: {
                gridLineColor: '#707073',
                lineColor: '#707073',
                minorGridLineColor: '#505053',
                tickColor: '#707073',
                title: {
                    text: ''
                },
                min: 0,
                max: 100,
                labels: {
                    formatter: function() {
                        return label(this.value);
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    var d2 = new Date(this.x);
                    var hours = "" + d2.getHours();
                    var minutes = "" + d2.getMinutes();
                    var seconds = "" + d2.getSeconds();
                    if (hours.length == 1) {
                        hours = "0" + hours;
                    }
                    if (minutes.length == 1) {
                        minutes = "0" + minutes;
                    }
                    if (seconds.length == 1) {
                        seconds = "0" + seconds;
                    }
                    return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false //false
                    }
                }
            },
            series: series
        });

    })
}


var chart1, chart2 = null;

function showBasicLineChart(chartId, chartTitle, dataSet, unit, colorArr){
	
    $(function () {

        chart2 = new Highcharts.Chart({
        	
        	exporting: { 
	       		 buttons: {
	                    contextButton: {
	                        enabled: true
	                    },
	                    exportButton: {
	                        text: '새로고침',
	                        symbol: 'url(dist/img/ico_refresh.gif)',
	                        symbolX:20,
	                        symbolY:20,
	                        _titleKey: '새로고침',
	                        onclick: function () {
		                       	 var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
		                       	 if(chartId == "chart_loadAverage"){
		                       		var hostid = $("#cpu_hostid").html();
		                       		//showCpuLoadAvg(hostId, startTime);
		                       		updateCpuLoadAvg(hostid);
		                       		//updateCpuLoadAvg(hostId);
		                       	 }else if(chartId == "chart_memTotal"){
		                       		var hostid = $("#mem_hostid").html();
		                       	 }
	         	             }
	                        // Use only the download related menu items from the default context button
	                        //menuItems: Highcharts.getOptions().exporting.buttons.contextButton.menuItems.splice(2)
	                    }
	                }
	       	},
            colors: colorArr,
            chart: {
                //type: 'area'
            	renderTo: chartId,
                zoomType: 'x',
                events: {
                    load: function(event) {
                        $("#"+chartId).unblock(blockUI_opt_el);
                    }
                }
            },
            title: {
                text: chartTitle
            },
            subtitle: {
                text: ''
            },
            xAxis: {
            	crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    formatter: function () {
                    	
                		var d2 = new Date(this.value);
                		var hours = "" + d2.getHours();
                		var minutes = "" + d2.getMinutes();
                		var seconds = "" + d2.getSeconds();
                		if(hours.length==1){
                			hours = "0" + hours;
                		}
                		if(minutes.length==1){
                			minutes = "0" + minutes;
                		}
                		if(seconds.length==1){
                			seconds = "0" + seconds;
                		}
                		return hours + ":" + minutes + ":" + seconds;
                    	
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                	formatter: function () {
	                	if(unit == "MB"){
	                		return Math.round(this.value / (1024 * 1024)) + 'MB';
	                	}else{
		                    return this.value + unit;
	                	}
                	}
                }
            },
            tooltip: {
                formatter: function () {
                    var d2 = new Date(this.x);
                    var hours = "" + d2.getHours();
                    var minutes = "" + d2.getMinutes();
                    var seconds = "" + d2.getSeconds();

                    if(hours.length==1){
                        hours = "0" + hours;
                    }
                    if(minutes.length==1){
                        minutes = "0" + minutes;
                    }
                    if(seconds.length==1){
                        seconds = "0" + seconds;
                    }
                    if(unit == "MB"){
                    	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    }else{
                    	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }
                    
                }
            },
            plotOptions: {

                series: {
                	 events: {
                		 mouseOver: function(e){
                			
                			GLOBAL_INDEX = this.index;
                			/*
                			if(index == 1){
                				 var event = this.chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                	             var point = this.chart.series[0].searchPoint(event, true); // Get the hovered point
                	                
            	            	if (point) {
            	                    point.highlight(e);
            	                }
                			}*/
                			//var chart_1, event_1, point_1, i;
                			
                			/**
                			for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                				chart_1 = Highcharts.charts[i];
                				console.log("bada2222");
                				console.log(chart_1);
                				event_1 = chart_1.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                				point_1 = chart_1.series[0].searchPoint(event_1, true); 
                				if (point_1) {
                					point_1.highlight(event_1);
                				}
                			}
                			**/
                		 }
//                         legendItemClick: function (e) {
//                             var visibility = this.visible ? 'visible' : 'hidden';
//                             if(this.visible){
//                             }else{
//                             }
//                         }
                     },
                	 marker: {
                         enabled: false
                     }
                }
            },
            series: dataSet
        });
       
        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };
        
        		
        
        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
        
       /*
        $('#chart_loadAverage').off().bind('mousemove touchmove touchstart', function (e) {
            
        	var chart,
              	point,
                i,
                j,
                event;
        	console.log("aaaaaa");
        	console.log(Highcharts.charts[1]);
        	console.log(chart2);
            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                point = chart.series[0].searchPoint(event, true); // Get the hovered point
                
                
            	if (point) {
                    point.highlight(e);
                }
            }
            
        });
        */
        
    });
    
        
//        $('#chart_loadAverage').off().bind('mousemove touchmove touchstart', function (e, data) {
//            
//        	console.log("rooney");
//        	//console.log(data.somedata);
//        	var index;
//        	if(data == null){
//        		console.log("data is null");
//        		index = 0;
//        	}else{
//        		console.log("data is not null");
//        		index = data.somedata;
//        	}
//        	console.log("index : " + index);
//        	console.log(typeof index);
//        	console.log(e);
//        	var chart,
//                point,
//                i,
//                event;
//            
//        	console.log("Highcharts.charts.length : " + Highcharts.charts.length);
//            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
//                chart = Highcharts.charts[i];
//                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
//                point = chart.series[1].searchPoint(event, true);
//                //point = chart.series[index].searchPoint(event, true); // Get the hovered point
//                if (point) {
//                   point.highlight(e);
//                }
//                
//                /*
//                for(var j=0; j<chart.series.length; ++j){
//                	point = chart.series[j].searchPoint(event, true);
//                    if (point) {
//                        //point.highlight(e);
//
//                    	//point.onMouseOver();
//                        chart.tooltip.refresh(point); // Show the tooltip
//                        chart.xAxis[0].drawCrosshair(e, point); // Show the crosshair
//                    }
//                }
//                */
//                
//            }
//            
//        	/*
//            var chart,
//            points,
//            i,
//            secSeriesIndex = 1;
//
//            for (i = 0; i < Highcharts.charts.length; i++) {
//                chart = Highcharts.charts[i];
//                e = chart.pointer.normalize(e); // Find coordinates within the chart
//                points = [chart.series[0].searchPoint(e, true), chart.series[1].searchPoint(e, true)]; // Get the hovered point
//
//                if (points[0] && points[1]) {
//                    if (!points[0].series.visible) {
//                        points.shift();
//                        secSeriesIndex = 0;
//                    }
//                    if (!points[secSeriesIndex].series.visible) {
//                        points.splice(secSeriesIndex,1);
//                    }
//                    if (points.length) {
//                        chart.tooltip.refresh(points); // Show the tooltip
//                        chart.xAxis[0].drawCrosshair(e, points[0]); // Show the crosshair
//                    }
//                }
//            }
//            */
//        });
        
//    });
}

function showBasicAreaChart(chartId, chartTitle, dataSet, unit, colorArr){
	
    Highcharts.Pointer.prototype.reset = function () {
        return undefined;
    };

    Highcharts.Point.prototype.highlight = function (event) {
        //this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };
    
    $(function () {
        /*
        if(chart1 != null){
        	console.log("destroy!!");
        	//chart1.destroy();
        	chart1 = null;
	         console.log("pogba");
	   	     console.log(Highcharts.charts.length);
	   	     for(var i=0; i<Highcharts.charts.length; ++i){
	   	    	 console.log("i : " + i);
	   	    	 console.log(Highcharts.charts[i]);
	   	     }
	   	     Highcharts.charts = $.grep(Highcharts.charts, function(value){
	       		 return typeof value != "undefined";
	       	 })
	       	 
	   	     console.log("==========================");
	   	     for(var i=0; i<Highcharts.charts.length; ++i){
	   	    	 console.log("i : " + i);
	   	    	 console.log(Highcharts.charts[i]);
	   	     }
        }*/
    	
        
        chart1 = new Highcharts.chart(chartId, {
        	exporting: { 
        		 buttons: {
                     contextButton: {
                         enabled: true
                     },
                     exportButton: {
                         text: '<b class="glyphicon glyphicon-refresh">새로고침</b>',
                         symbol: 'url(dist/img/ico_refresh.gif)',
                         symbolX:20,
                         symbolY:20,
                         _titleKey: '새로고침',
                         onclick: function () {
                        	 var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                        	 if(chartId == "chart_cpuUsage"){
                        		 var hostId = $("#cpu_hostid").html();
                        		 //showCpuUsage(hostId, startTime);
                        		 loadBasicAreaChart(hostId);
                        	 }else if(chartId =="chart_memUsage"){
                        		 var hostId = $("#mem_hostid").html();
                        	 }
          	             }
                     }
                 }
        	},
            colors: colorArr,
            chart: {
                type: 'area',
                zoomType: 'x',
                events: {
                    load: function(event) {
                        $("#"+chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                }
            },
            title: {
                text: chartTitle
            },
            subtitle: {
                text: ''
            },
            xAxis: {
            	crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    formatter: function () {
                        var d2 = new Date(this.value);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return hours + ":" + minutes + ":" + seconds;
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    formatter: function () {
                        return this.value + unit;
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    var d2 = new Date(this.x);
                    var hours = "" + d2.getHours();
                    var minutes = "" + d2.getMinutes();
                    var seconds = "" + d2.getSeconds();
                    if(hours.length==1){
                        hours = "0" + hours;
                    }
                    if(minutes.length==1){
                        minutes = "0" + minutes;
                    }
                    if(seconds.length==1){
                        seconds = "0" + seconds;
                    }
                    return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;

                }
            },
            plotOptions: {
            	series: {
            		
                    events: {
                    	mouseOver: function(e){
                    		
                			GLOBAL_INDEX = this.index;
                			
                			/*
                			if(index == 1){
                				 var event = this.chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                	             var point = this.chart.series[0].searchPoint(event, true); // Get the hovered point
                	                
            	            	if (point) {
            	                    point.highlight(e);
            	                }
                			}*/
                    		
                			//var chart_1, event_1, point_1, i;
                			
                			/**
                			for (var i = 0; i < Highcharts.charts.length; i = i + 1) {
                				chart_1 = Highcharts.charts[i];
                				console.log("bada1111111111");
                				console.log(chart_1);
                				event_1 = chart_1.pointer.normalize(e.originalEvent); // Find coordinates within the chart originalEvent
                				point_1 = chart_1.series[0].searchPoint(event_1, true); 
                				if (point_1) {
                					point_1.highlight(event_1);
                				}
                			}
                			**/
                			
                		 }
                        /*legendItemClick: function (e) {
                            var visibility = this.visible ? 'visible' : 'hidden';
                            var event, point;
                            event = this.chart.pointer.normalize(e.originalEvent); 
                            
                            for(var i=0; i<this.chart.series.length; i=i+1){
                            	this.chart.series[this.index].searchPoint(event, false); 
                            }
                            point = this.chart.series[this.index].searchPoint(event, true); 
                    		if (point) {
                                point.highlight(e);
                            }
                           
                        }*/
                    }//end events
                }, //end series
                area: {
                    //pointStart: startTimeForChart,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        //radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: dataSet
        });
        
        

        /*
        $('#chart_cpuUsage').off().bind('mousemove touchmove touchstart', function (e) {
        	var chart,
              	point,
                i,
                j,
                event;
        	
            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                point = chart.series[0].searchPoint(event, true); // Get the hovered point
                
//                for(j=0; j<chart.series.length; j=j+1){
//                	point = chart.series[j].searchPoint(event, true); 
                	if (point) {
                        point.highlight(e);
                    }
//                }
            }
            
        });
        */
    });
}

function syncExtremes(e) {
    var thisChart = this.chart;
    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                }
            }
        });
    }
}


var offTimer = function(){
	$.each(TIMER_ARR, function(k,v){
		clearInterval(v);
	});
	TIMER_ARR = [];
}



var removeAllChart = function(){

	for(var i=0; i<Highcharts.charts.length; ++i){
		Highcharts.charts[i].destroy();
	}
	Highcharts.charts.splice(0);
}


var callApiForProcessTable = function(hostid){
    return zbxSyncApi.getItem(hostid,"system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
}


var sortProcess = function(data_topProcess, sortField){

    var topProcRowArr = data_topProcess.lastvalue.split("\n"); //각 행들의 집합
    var procUniqueName = [];
    var procNameOrderByCpu = [];
    var dataObj = null;
    var dataSet = [];

    //모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
    $.each(topProcRowArr, function(k,v) {
        while(topProcRowArr[k].indexOf("  ") != -1){
            topProcRowArr[k] = topProcRowArr[k].replace('  ',' ');
        }

        var topProcColArr = topProcRowArr[k].split(" ");
        var orgName='';
        var procNameArr = [];
        var procName = '';
        for(var i=9; i<topProcColArr.length; i++){
        	orgName += topProcColArr[i];
        }
        if(topProcColArr[9].indexOf("/0") != -1){
            procName = topProcColArr[9];
        }else{
            procNameArr = topProcColArr[9].split("/");
            procName = procNameArr[procNameArr.length-1];
        }
        procName = procName.replace(/\:/g, '');

        procNameOrderByCpu[k] = procName;

        dataObj = new Object();
        dataObj.procName = procName;
        dataObj.orgName = orgName;
        dataObj.procCpu = parseFloat(topProcColArr[7]);
        dataObj.procMem = parseFloat(topProcColArr[6]);
        //dataObj.pid = topProcColArr[1];
        dataSet.push(dataObj);
    });

    // 프로세스명 중복 제거 후, 프로세스 별 cpu 합 초기화
    procUniqueName = $.unique(procNameOrderByCpu);
    var procUniqueObj = null;
    var procTotalArr = [];
    $.each(procUniqueName, function(k,v){
        procUniqueObj = new Object();
        procUniqueObj.procName = v;
        procUniqueObj.totalCpuVal = 0;
        procUniqueObj.totalMemVal = 0;
        procUniqueObj.procCnt = 0;
        procTotalArr.push(procUniqueObj);
    });

    // 같은 프로세스 명끼리 cpu값 더함
    procTotalArr.splice(0,1);
    $.each(procTotalArr, function(k1,v1){
    	var childProcessArr = [];
    	var childCpuArr = [];
    	var childMemArr = [];
        $.each(dataSet, function(k2,v2){
            if(v1.procName == v2.procName){
                v1.totalCpuVal += v2.procCpu;
                v1.totalMemVal += v2.procMem;
                v1.procCnt += 1;
                childProcessArr.push(v2.orgName + "\\n");
                childCpuArr.push(v2.procCpu);
                childMemArr.push(v2.procMem);
            }
        });
        v1.childName = childProcessArr;
        v1.childCpu = childCpuArr;
        v1.childMem = childMemArr;
    });
    
    // cpu값을 기준으로 객체배열 내림차순 정렬
    procTotalArr.sort(function (a, b) {
        if(sortField == "CPU"){
        	return a.totalCpuVal > b.totalCpuVal ? -1 : a.totalCpuVal < b.totalCpuVal ? 1 : 0;
        }else if(sortField == "MEM"){
        	return a.totalMemVal > b.totalMemVal ? -1 : a.totalMemVal < b.totalMemVal ? 1 : 0;
        }
    });
    
    return procTotalArr;
}


var viewMoreProcess = function(){
	$('tr#lastrow').off().on('click',function(){
		
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
}