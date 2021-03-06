function eventListView(){
    $.blockUI(blockUI_opt_all);
    offTimer();
    removeAllChart();
    console.log(" IN eventListView ");

    var data_event = '';
    zbxApi.eventStatusView.get().done(function(data, status, jqXHR) {
        data_event = zbxApi.eventStatusView.success(data);
        eventList(data_event);
    });

    showEventChartView();

    TIMER_ARR.push(setInterval(function(){appendEventChart()}, 10000));
}

var hostIpMap=[];
function eventList(data){
    var eventListTable = '';

    eventListTable += '<tbody id="eventListTable">';
    eventListTable += '</tbody>';
    $("#eventStatusTable").empty();
    $("#eventStatusTable").append(eventListTable);

    var triggerIdArr = [];
    var hostIdArr = [];
    var uniqueTriggerIdArr = [];
    var uniqueHostIdArr = [];
    var eventMergeArr = [];

    // 모든 트리거 아이디를 배열에 담는다.
    $.each(data.result, function (k, v) {
        triggerIdArr.push(v.relatedObject.triggerid);
    });

//	// 모든 호스트아이디를 배열에 담는다.
//	$.each(data.result, function (k, v) {
//		hostIdArr.push(v.relatedObject.hostid);
//	});

    // 트리거 아이디 배열의 중복 제거
    $.each(triggerIdArr, function(k1,v1){
        if(uniqueTriggerIdArr.indexOf(v1) == -1){
            uniqueTriggerIdArr.push(v1);
        }
    });

//	// 호스트 아이디 배열의 중복 제거
//	$.each(hostIdArr, function(k1,v1){
//        if(uniqueHostIdArr.indexOf(v1) == -1){
//        	uniqueHostIdArr.push(v1);
//        }
//    });

//
//	 if(hostIpMap[hostid]==null) {
//         hostIpMap[hostid]=zbxSyncApi.eventStatusHost(hostid).result[0].interfaces[0].ip;
//     }


    // 트리거 아이디 별 이벤트 분리
    var eventArrByTriggerId = new Array(uniqueTriggerIdArr.size);

    $.each(uniqueTriggerIdArr, function(k, v){ //유니크 트리거 아이디 배열
        eventArrByTriggerId[k] = new Array();
        $.each(data.result, function (k1, v1) { //이벤트 배열
            if(v == v1.relatedObject.triggerid){

                dataObj = new Object();
                dataObj.triggerId = v1.relatedObject.triggerid;
                dataObj.objectId = v1.objectid;
                dataObj.eventId = v1.eventid;
                dataObj.severity = convPriority(v1.relatedObject.priority);
                dataObj.status = convStatusEvent(v1.value);
                dataObj.ack = convAckEvent(v1.acknowledged);

                var tmpHostId = v1.hosts[0].hostid;
                dataObj.hostid = tmpHostId;

                if(hostIpMap[tmpHostId] == null) {
                    hostIpMap[tmpHostId]=zbxSyncApi.eventStatusHost(tmpHostId).result[0].interfaces[0].ip;
                }
                dataObj.ip = hostIpMap[tmpHostId];
                if(v1.acknowledges[0] == undefined){
                    dataObj.ackTime = "-";
                } else {
                    dataObj.ackTime = convTime(v1.acknowledges[0].clock);
                }
                dataObj.host = v1.hosts[0].name;
                dataObj.description = v1.relatedObject.description;
                dataObj.clock = v1.clock;
                dataObj.duration = 0;

                eventArrByTriggerId[k].push(dataObj);
            }
        });
    });
//	console.log(eventArrByTriggerId);

    // 이벤트 별 지속시간 계산 후, 트리거 아이디로 분리된 이벤트 배열 merge
    $.each(eventArrByTriggerId, function(k,v){
        var previousClock = Math.ceil(parseInt(new Date().getTime())/1000);
        console.log("previousClock : " + previousClock);

        $.each(v, function(k1, v1){
            v1.duration= convertTime(previousClock - parseInt(v1.clock));
            previousClock = parseInt(v1.clock);
            eventMergeArr.push(v1);

        });
    });
    //console.log(eventMergeArr);

    // Merge된 이벤트 배열 clock 순으로 정렬
    eventMergeArr.sort(function (a, b) {
        return a.clock > b.clock ? -1 : a.clock < b.clock ? 1 : 0;
    });
    //console.log(eventMergeArr);

    var eventListTable = '';
    var fromView = "eventView";

    $.each(eventMergeArr, function (k, v) {
        var objectId = v.objectId;
        var eventId = v.eventId;
        var severity = v.severity;
        var status = v.status;
        var clock = convTime(v.clock);
        var duration = v.duration;
        var ack = v.ack;
        var ackTime = v.ackTime;
        var host = v.host;
        var description = v.description;
        var hostid = v.hostid;
        var ip = v.ip;

        eventListTable += "<tr role='row' id='" + eventId + "'>";
        eventListTable += "<td width='80'   class='line'>" + eventId + "</td>";
        if(status == "정상"){
            eventListTable += "<td width='80'   class='line' style='color:green;'>" + status + "</td>";
        } else {
            eventListTable += "<td width='80'   class='line' style='color:red;'>" + status + "</td>";
        }
        if(severity == "information"){
            eventListTable += "<td width='80'   class='line' style='color:#7499FF;'>" + severity + "</td>";
        } else if(severity == "warning"){
            eventListTable += "<td width='80'   class='line' style='color:#FFC859;'>" + severity + "</td>";
        } else if(severity == "average"){
            eventListTable += "<td width='80'   class='line' style='color:#FFA059;'>" + severity + "</td>";
        } else if(severity == "high"){
            eventListTable += "<td width='80'   class='line' style='color:#E97659;'>" + severity + "</td>";
        } else {
            eventListTable += "<td width='80'   class='line'>" + severity + "</td>";
        }
        eventListTable += "<td width='125'  class='line'>" + clock + "</td>";
        eventListTable += "<td width='120'  class='line'>" + duration + "</td>";
        if(ack == "미인지"){
            eventListTable += "<td width='80'   class='line'><a class='eventListPage' style='color:#c45959' onclick='eventAckDetailView(" + eventId + ", " + objectId + ", this);' href='#none'>" + ack + "</a></td>";
        } else {
            eventListTable += "<td width='80' class='line'><a style='color:#529238' onclick='eventAckDetailView("+ eventId +", "+ objectId + ");' href='#none'>" + ack + "</a></td>";
        }
        eventListTable += "<td width='125'  class='line'>" + ackTime + "</td>";
        eventListTable += "<td width='100'  class='line'>" + ip + "</td>";
        eventListTable += "<td width='100'  class='line'><a href='#none' onclick='moveHostPage("+ hostid + ");'>" + host + "</a></td>";
        eventListTable += "<td width='auto' class='line'  style='text-align: left;'>" + description + "</td>";
        eventListTable += "</tr>";

    });
    $("#eventListTable").append(eventListTable);
    $("#serverInfo").empty();
    $("#serverProcessList").empty();
    $("#serverEventList").empty();

}

function moveHostPage(hostid){
	$("#info_" + hostid).click();
}

function eventList_org(data_event){
    var eventListTable = '';

    eventListTable += '<tbody id="eventListTable">';
    eventListTable += '</tbody>';
    $("#eventStatusTable").empty();
    $("#eventStatusTable").append(eventListTable);
    var eventCnt = 0;

    $.each(data_event.result, function(k, v) {
        var eventId = '-';           //이벤트ID
        var eventStatus = '-';       //상태
        var eventPriority = '-';     //등급
        var eventStartTime = '-';    //발생시간
        var eventAckTime = '-';      //인지시간
        var eventAge = '-';          //지속시간
        var eventAcknowledge = '-';  //인지여부
        var eventIp = '-';           //IP
        var eventHostGroup = '-';    //호스트그룹
        var eventDescription = '-';  //비고

        var hostid = '';

        try {
            eventCnt += 1;
            eventId = v.eventid;
            eventStatus = convStatusEvent(v.value);
            eventPriority = convPriority(v.relatedObject.priority);
            eventStartTime = convTime(v.relatedObject.lastchange);
            if(v.acknowledges[0] != undefined){
                eventAckTime = convTime(v.acknowledges[0].clock);
            }
            eventAge = convDeltaTime(v.relatedObject.lastchange);
            eventAcknowledge = convAckEvent(v.acknowledged);
            hostid = v.hosts[0].hostid;

            if(hostIpMap[hostid]==null) {
                hostIpMap[hostid]=zbxSyncApi.eventStatusHost(hostid).result[0].interfaces[0].ip;
            }

            eventIp = hostIpMap[hostid];

            eventHostGroup = v.hosts[0].name;
            eventDescription = v.relatedObject.description;
        } catch (e) {
            console.log(e);
        }

        var eventListTable = '';

        eventListTable += "<tr role='row' id='" + eventId + "'>";
        eventListTable += "<td width='80'   class='line'>" + eventId + "</td>";
        if(eventStatus == "problem"){
            eventListTable += "<td width='80'   class='line' style='color:red;'>" + eventStatus + "</td>";
        } else {
            eventListTable += "<td width='80'   class='line'>" + eventStatus + "</td>";
        }
        if(eventPriority == "information"){
            eventListTable += "<td width='80'   class='line' style='color:#7499FF;'>" + eventPriority + "</td>";
        } else if(eventPriority == "warning"){
            eventListTable += "<td width='80'   class='line' style='color:#FFC859;'>" + eventPriority + "</td>";
        } else if(eventPriority == "average"){
            eventListTable += "<td width='80'   class='line' style='color:#FFA059;'>" + eventPriority + "</td>";
        } else if(eventPriority == "high"){
            eventListTable += "<td width='80'   class='line' style='color:#E97659;'>" + eventPriority + "</td>";
        } else {
            eventListTable += "<td width='80'   class='line'>" + eventPriority + "</td>";
        }
        eventListTable += "<td width='125'  class='line'>" + eventStartTime + "</td>";
        eventListTable += "<td width='120'  class='line'>" + eventAge + "</td>";
        if(eventAcknowledge == "Unacked"){
            eventListTable += "<td width='80'   class='line' style='color:red;'>" + eventAcknowledge + "</td>";
        } else {
            eventListTable += "<td width='80'   class='line'>" + eventAcknowledge + "</td>";
        }
        eventListTable += "<td width='125'  class='line'>" + eventAckTime + "</td>";
        eventListTable += "<td width='100'  class='line'>" + eventIp + "</td>";
        eventListTable += "<td width='100'  id='hostNm_" + eventCnt + "_" + hostid + "' class='line'>" + eventHostGroup + "</td>";
        eventListTable += "<td width='auto' class='line'  style='text-align: left;'>" + eventDescription + "</td>";
        eventListTable += "</tr>";

        $("#eventListTable").append(eventListTable);
        $("#serverInfo").empty();
        $("#serverProcessList").empty();
        $("#serverEventList").empty();

        var item_id = '';

        $("#hostNm_" + eventCnt + "_" + hostid).click(function (){
            $("#info_" + hostid).click();
        })
    });
}

function showEventChartView(){

    $(".info-box-content").block(blockUI_opt_el);


    var d = new Date();
    var nowHours = d.getHours();
    d.setDate(d.getDate()-1);
    var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), nowHours, 0, 0);
    var startTime = startDate.getTime() / 1000;
    var chartDataSet = [];
    var dataSet = [];

    var ackDataSet = [];
    var problemDataSet = [];
    var okDataSet = [];

    var j=0;
    for(var i=startTime; i<(new Date().getTime()/1000)-300; i=i+300){ // 5분 단위로 시간 구하기

        var obj = new Object();
        obj.startTime = i;
        obj.endTime = i+300;
        obj.ackCount = 0;
        obj.problemCount = 0;
        obj.okCount = 0;
        chartDataSet.push(obj);
        j++;
    }
    
    zbxApi.getEvent.getByTime(startTime).then(function(data) { // 24시간 전 ~ 현재 이벤트 추출
        var eventArr = data.result;

        $.each(eventArr, function(k,v){
            var thisEventClock = parseInt(v.clock);

            if(v.acknowledged == "1"){

                $.each(v.acknowledges, function(ackNum,ackValue){
                    var ackTime = parseInt(ackValue.clock);

                    $.each(chartDataSet, function(k3,v3){
                        if(v3.startTime <= ackTime && ackTime < v3.endTime){
                            v3.ackCount += 1;
                        }
                    });
                });
            }

            $.each(chartDataSet, function(k2,v2){
                if(v2.startTime <= thisEventClock && v2.endTime > thisEventClock){

                    if(v.value == "1"){
                        v2.problemCount += 1;
                    }
                    if(v.value == "0"){
                        v2.okCount += 1;
                    }
                    return false;
                }
            });

        });

        $.each(chartDataSet, function(k,v){
            var ackArr = [];
            ackArr[0] = parseInt(v.startTime)*1000;
            ackArr[1] = v.ackCount;
            ackDataSet.push(ackArr);

            var problemArr = [];
            problemArr[0] = parseInt(v.startTime)*1000;
            problemArr[1] = v.problemCount;
            problemDataSet.push(problemArr);

            var okArr = [];
            okArr[0] = parseInt(v.startTime)*1000;
            okArr[1] = v.okCount;
            okDataSet.push(okArr);
        });

        dataObj = new Object();
        dataObj.name = '인지';
        dataObj.data = ackDataSet;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '신규';
        dataObj.data = problemDataSet;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = '완료';
        dataObj.data = okDataSet;
        dataSet.push(dataObj);

        // 신규 #ee6866
        showEventStatChart("chart_eventList", "", dataSet, "", ['#FF8C00', '#ee6866', '#00BFFF', '#ccaa65', '#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);

        /////

        $.unblockUI(blockUI_opt_all);
    });

}

function appendEventChart(){

    console.log("ccccccccccccccccccccccccwwww");

    //$(".info-box-content").block(blockUI_opt_el);

    var nowTime = Math.round(new Date().getTime() / 1000);
    var chartLastTime = parseInt((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000);
    var chartDataSet = [];

    if(chartLastTime + 600 <= nowTime){ //현재 시간이 차트 마지막 시간보다 10분 뒤면, 차트 시간은 5분뒤의 데이터까지 구한 값이므로.

        var calculatedChartTime = chartLastTime+300;

        // 구간 Create
        for(var i=calculatedChartTime; i<nowTime-300; i=i+300){ // 5분 단위로 시간 구하기

            var obj = new Object();
            obj.startTime = i;
            obj.endTime = i+300;
            obj.ackCount = 0;
            obj.problemCount = 0;
            obj.okCount = 0;
            chartDataSet.push(obj);
        }//end for

        zbxApi.getEvent.getByTime(calculatedChartTime).then(function(data) {
            var eventArr = data.result;

            // 구간 별 이벤트 카운트
            $.each(eventArr, function(k,v){ //마지막~현재 이벤트

                var thisEventClock = parseInt(v.clock);
                $.each(chartDataSet, function(k2,v2){ // 5분 구간 별 데이터 값 세팅
                    if(v2.startTime <= thisEventClock && thisEventClock < v2.endTime){
                        if(v.acknowledged == "1"){
                            //v2.ackCount += 1;
                        }
                        if(v.value == "1"){
                            v2.problemCount += 1;
                        }
                        if(v.value == "0"){
                            v2.okCount += 1;
                        }
                        return false;
                    }
                });

            });

            // 구간 값 차트에 add
            $.each(chartDataSet, function(k,v){

                chart1.series[0].addPoint([parseInt(v.startTime)*1000, v.ackCount], false);
                chart1.series[1].addPoint([parseInt(v.startTime)*1000, v.problemCount], false);
                chart1.series[2].addPoint([parseInt(v.startTime)*1000, v.okCount], true);

            });


        }).then(function() {
            var startTime = parseInt(chart1.series[0].data[0].x) / 1000;
            return zbxApi.getEvent.getByTime(startTime);

        }).then(function(data) {

            var eventArr = zbxApi.getEvent.success(data);

            var ackArr = [];
            for(var i=0; i<chart1.series[0].data.length; i++){ // 5분 단위로 시간 구하기
                ackArr[i]=0;
            }

            $.each(eventArr.result, function(k,v){
                if(v.acknowledged == "1"){
                    $.each(v.acknowledges, function(k2,v2){
                        var ackTime = parseInt(v2.clock) * 1000;
                        for(var i=0; i<chart1.series[0].data.length; i++){
                            if((i == (chart1.series[0].data.length-1)) || (chart1.series[0].data[i].x <= ackTime && ackTime <= chart1.series[0].data[i+1].x)){
                                ackArr[i] += 1;
                                break;
                            }
//        					else if(chart1.series[0].data[i].x <= ackTime && ackTime <= chart1.series[0].data[i+1].x){
//        						ackArr[i] += 1;
//        						break;
//        					}
                        }
                    });
                }

            });

            $.each(ackArr, function(k,v){
                if(chart1.series[0].data[k].y != v){
                    chart1.series[0].data[k].update(y = v);
                }
            });

            //var ackDataLastTime = chart1.series[0].data[(chart1.series[0].data.length)-1].x;
            var problemDataLastTime = chart1.series[1].data[(chart1.series[1].data.length)-1].x;
            var problemDataFirstTime = chart1.series[1].data[0].x;
            //var okDataLastTime = chart1.series[2].data[(chart1.series[2].data.length)-1].x;

            //var ackLastTimeMinutes = new Date(ackDataLastTime).getMinutes();
            //var problemLastTimeMinutes = new Date(problemDataLastTime).getMinutes();
            var problemFirstTimeHours = new Date(problemDataFirstTime).getHours();
            var problemLastTimeHours = new Date(problemDataLastTime).getHours();
            //var okLastTimeMinutes = new Date(okDataLastTime).getMinutes();

            if(problemFirstTimeHours != problemLastTimeHours){
                for(var i=0; i<12; i++){
                    $.each(chart1.series, function(k,v){
                        v.data[0].remove();
                    });
                }
            }
//        	if(okLastTimeMinutes == 0 && ackLastTimeMinutes == 0 && problemLastTimeMinutes == 0){
//        		console.log("true");
//        		for(var i=0; i<12; i++){
//        			$.each(chart1.series, function(k,v){
//        				v.data[0].remove();
//        			});
//        		}
//        	}

        }); //end apicall
    }//end if
}

function eventListAppend(){
    console.log(" IN eventListAppend ");
    var div = $("#eventList");
    if(div[0].scrollHeight - div.scrollTop() == div.outerHeight()) {
        console.log(" END SCROLL ");
        var lastRowIdFrom = $("#eventList tr:last").attr('id');
        lastRowIdFrom = lastRowIdFrom - 1;
        var appendData = '';
        console.log(" last Row From : " + lastRowIdFrom);
        //eventStatusViewAppend
        
        var triggerIdArr = [];
        var hostIdArr = [];
    	var uniqueTriggerIdArr = [];
    	var uniqueHostIdArr = [];
    	var eventMergeArr = [];
    	

        zbxApi.eventStatusViewAppend.get(lastRowIdFrom).then(function (data) {
            
        	// 모든 트리거 아이디를 배열에 담는다.
        	$.each(data.result, function (k, v) {
        		triggerIdArr.push(v.relatedObject.triggerid);
        	});
        	
        	// 트리거 아이디 배열의 중복 제거
        	$.each(triggerIdArr, function(k1,v1){
                if(uniqueTriggerIdArr.indexOf(v1) == -1){
                	uniqueTriggerIdArr.push(v1);
                }
        	 });
        	
        	// 트리거 아이디 별 이벤트 분리
        	var eventArrByTriggerId = new Array(uniqueTriggerIdArr.size);
        	
        	$.each(uniqueTriggerIdArr, function(k, v){ //유니크 트리거 아이디 배열
        		eventArrByTriggerId[k] = new Array();
        		$.each(data.result, function (k1, v1) { //이벤트 배열
        			if(v == v1.relatedObject.triggerid){
        				
        				dataObj = new Object();
        				dataObj.triggerId = v1.relatedObject.triggerid;
        				dataObj.objectId = v1.objectid;
        				dataObj.eventId = v1.eventid;
        				dataObj.severity = convPriority(v1.relatedObject.priority);
        				dataObj.status = convStatusEvent(v1.value);
        				dataObj.ack = convAckEvent(v1.acknowledged);
        				
        				var tmpHostId = v1.hosts[0].hostid;
        				dataObj.hostid = tmpHostId;
        				
        				if(hostIpMap[tmpHostId] == null) {
        			        hostIpMap[tmpHostId]=zbxSyncApi.eventStatusHost(tmpHostId).result[0].interfaces[0].ip;
        			    }
        				dataObj.ip = hostIpMap[tmpHostId];
        				if(v1.acknowledges[0] == undefined){
        					dataObj.ackTime = "-";
        				} else {
        					dataObj.ackTime = convTime(v1.acknowledges[0].clock);
        		        }
        				dataObj.host = v1.hosts[0].name;
        				dataObj.description = v1.relatedObject.description;
        				dataObj.clock = v1.clock;
        				dataObj.duration = 0;
        				
        				eventArrByTriggerId[k].push(dataObj);
        			}
        		});
        	});
        	
        	// 이벤트 별 지속시간 계산 후, 트리거 아이디로 분리된 이벤트 배열 merge
        	$.each(eventArrByTriggerId, function(k,v){
        		var previousClock = Math.ceil(parseInt(new Date().getTime())/1000);
        		console.log("previousClock : " + previousClock);
        		
        		$.each(v, function(k1, v1){
        			v1.duration= convertTime(previousClock - parseInt(v1.clock));
        			previousClock = parseInt(v1.clock);
        			eventMergeArr.push(v1);
        			
        		});
        	});
        	//console.log(eventMergeArr);
        	
        	// Merge된 이벤트 배열 clock 순으로 정렬
        	eventMergeArr.sort(function (a, b) {
                   return a.clock > b.clock ? -1 : a.clock < b.clock ? 1 : 0;
            });
        	//console.log(eventMergeArr);
        	

    		var eventAppendTable = '';
    		
        	$.each(eventMergeArr, function (k, v) {
        		var objectId = v.objectId;
        		var eventId = v.eventId;
        		var severity = v.severity;
        		var status = v.status;
        		var clock = convTime(v.clock);
        		var duration = v.duration;
        		var ack = v.ack;
        		var ackTime = v.ackTime;
        		var host = v.host;
        		var description = v.description;
        		var hostid = v.hostid;
        		var ip = v.ip;
        		
        		
        		eventAppendTable += "<tr role='row' id='" + eventId + "'>";
        		eventAppendTable += "<td width='80'   class='line'>" + eventId + "</td>";
        		if(status == "정상"){
        			eventAppendTable += "<td width='80'   class='line' style='color:green;'>" + status + "</td>";
        		} else {
        			eventAppendTable += "<td width='80'   class='line' style='color:red;'>" + status + "</td>";
        		}
        		if(severity == "information"){
        			eventAppendTable += "<td width='80'   class='line' style='color:#7499FF;'>" + severity + "</td>";
        		} else if(severity == "warning"){
        			eventAppendTable += "<td width='80'   class='line' style='color:#FFC859;'>" + severity + "</td>";
        		} else if(severity == "average"){
        			eventAppendTable += "<td width='80'   class='line' style='color:#FFA059;'>" + severity + "</td>";
        		} else if(severity == "high"){
        			eventAppendTable += "<td width='80'   class='line' style='color:#E97659;'>" + severity + "</td>";
        		} else {
        			eventAppendTable += "<td width='80'   class='line'>" + severity + "</td>";
        		}
        		eventAppendTable += "<td width='125'  class='line'>" + clock + "</td>";
        		eventAppendTable += "<td width='120'  class='line'>" + duration + "</td>";
        		if(ack == "미인지"){
        			eventAppendTable += "<td width='80'   class='line' style='color:red;'><a class='eventListPage' style='color:#c45959' onclick='eventAckDetailView("+ eventId +", "+ objectId + ", this);' href='#none'>" + ack + "</a></td>";
        		} else {
        			eventAppendTable += "<td width='80' class='line'><a style='color:#529238' onclick='eventAckDetailView("+ eventId +", "+ objectId + ");' href='#none'>" + ack + "</a></td>";
        		}
        		eventAppendTable += "<td width='125'  class='line'>" + ackTime + "</td>";
        		eventAppendTable += "<td width='100'  class='line'>" + ip + "</td>";
        		eventAppendTable += "<td width='100'  class='line'><a href='#none' onclick='moveHostPage("+ hostid + ");'>" + host + "</a></td>";
        		eventAppendTable += "<td width='auto' class='line'  style='text-align: left;'>" + description + "</td>";
        		eventAppendTable += "</tr>";
        		
        		
        	});
        	
        	$("#eventListTable").append(eventAppendTable);
        	
        	/*
            $.each(data.result, function(k, v) {
            	
                console.log(" eventStatusViewAppend ");
                var eventId = '-';           //이벤트ID
                var eventStatus = '-';       //상태
                var eventPriority = '-';     //등급
                var eventStartTime = '-';    //발생시간
                var eventAckTime = '-';      //인지시간
                var eventAge = '-';          //지속시간
                var eventAcknowledge = '-';  //인지여부
                var eventIp = '-';           //IP
                var eventHostGroup = '-';    //호스트그룹
                var eventDescription = '-';  //비고

                var hostid = '';

                try {
                    eventCnt += 1;
                    eventId = v.eventid;
                    eventStatus = convStatusEvent(v.value);
                    eventPriority = convPriority(v.relatedObject.priority);
                    eventStartTime = convTime(v.relatedObject.lastchange);
                    if(v.acknowledges[0] != undefined){
                        eventAckTime = convTime(v.acknowledges[0].clock);
                    }
                    eventAge = convDeltaTime(v.relatedObject.lastchange);
                    eventAcknowledge = convAckEvent(v.acknowledged);
                    hostid = v.hosts[0].hostid;
                    if(hostIpMap[hostid]==null) {
                        hostIpMap[hostid]=zbxSyncApi.eventStatusHost(hostid).result[0].interfaces[0].ip;
                    }
                    eventIp = hostIpMap[hostid];
                    eventHostGroup = v.hosts[0].name;
                    eventDescription = v.relatedObject.description;
                } catch (e) {
                    console.log(e);
                }

                var eventAppendTable = '';
                eventAppendTable += "<tr role='row' id='" + eventId + "'>";
                eventAppendTable += "<td width='80'   class='line'>" + eventId + "</td>";
                if(eventStatus == "problem"){
                    eventAppendTable += "<td width='80'   class='line' style='color:red;'>" + eventStatus + "</td>";
                } else {
                    eventAppendTable += "<td width='80'   class='line'>" + eventStatus + "</td>";
                }
                if(eventPriority == "information"){
                    eventAppendTable += "<td width='80'   class='line' style='color:#7499FF;'>" + eventPriority + "</td>";
                } else if(eventPriority == "warning"){
                    eventAppendTable += "<td width='80'   class='line' style='color:#FFC859;'>" + eventPriority + "</td>";
                } else if(eventPriority == "average"){
                    eventAppendTable += "<td width='80'   class='line' style='color:#FFA059;'>" + eventPriority + "</td>";
                } else if(eventPriority == "high"){
                    eventAppendTable += "<td width='80'   class='line' style='color:#E97659;'>" + eventPriority + "</td>";
                } else {
                    eventAppendTable += "<td width='80'   class='line'>" + eventPriority + "</td>";
                }
                eventAppendTable += "<td width='125'  class='line'>" + eventStartTime + "</td>";
                eventAppendTable += "<td width='120'  class='line'>" + eventAge + "</td>";
                if(eventAcknowledge == "Unacked"){
                    eventAppendTable += "<td width='80'   class='line' style='color:red;'>" + eventAcknowledge + "</td>";
                } else {
                    eventAppendTable += "<td width='80'   class='line'>" + eventAcknowledge + "</td>";
                }
                eventAppendTable += "<td width='125'  class='line'>" + eventAckTime + "</td>";
                eventAppendTable += "<td width='100'  class='line'>" + eventIp + "</td>";
                eventAppendTable += "<td width='100'  id='hostNm_" + eventCnt + "_" + hostid + "' class='line'>" + eventHostGroup + "</td>";
                eventAppendTable += "<td width='auto' class='line'  style='text-align: left;'>" + eventDescription + "</td>";
                eventAppendTable += "</tr>";

                $("#eventListTable").append(eventAppendTable);

                $("#hostNm_" + eventCnt + "_" + hostid).click(function (){
                    $("#info_" + hostid).click();
                })
            })
            */
        });
    }
}
