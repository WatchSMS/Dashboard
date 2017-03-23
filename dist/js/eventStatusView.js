function eventListView(){
	
    $.blockUI(blockUI_opt_all);
    offTimer();
    removeAllChart();

    $("#eventListDiv").scroll(function() {
        var div = $("#eventListDiv");
        if(div[0].scrollHeight - div.scrollTop() == div.outerHeight()){
            console.log(" END SCROLL ");
        }
    });
    
    console.log(" IN eventListView ");

    var data_event = '';
    zbxApi.eventStatusView.get().done(function(data, status, jqXHR) {
        data_event = zbxApi.eventStatusView.success(data);
        eventList(data_event);
    });
    
    showEventChartView();
}

var hostIpMap=[];

function eventList(data_event){
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

    var eventListTable = '';

    eventListTable += '<tbody>';

    $.each(data_event.result, function(k, v) {
        try {
            eventId = v.eventid;
            eventStatus = convStatusEvent(v.value);
            eventPriority = convPriority(v.relatedObject.priority);
            eventStartTime = convTime(v.relatedObject.lastchange);
            if(v.acknowledges[0] == undefined){
                eventAckTime = "-";
            } else {
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

        eventListTable += "<tr>";
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
        eventListTable += "<td width='100'  id='hostNm_'" + hostid + " class='line'>" + eventHostGroup + "</td>";
        eventListTable += "<td width='auto' class='line'  style='text-align: left;'>" + eventDescription + "</td>";
        eventListTable += "</tr>";

    });

    eventListTable += '</tbody>';
    $("#eventStatusTable").empty();
    $("#eventStatusTable").append(eventListTable);

    $.each(data_event.result, function(k, v) {
        hostid = v.hosts[0].hostid;

        //화면 이동
        $("#hostNm_" + hostid).dblclick(function () {
            console.log("화면 이동");
        });
    });
}


function showEventChartView(){
	
    $(".info-box-content").block(blockUI_opt_el);

    console.log("cccccccccccccccccccccccc");

	var d = new Date();
    var nowHours = d.getHours();
    console.log("시간 : " + nowHours);
	d.setDate(d.getDate()-1);
	console.log(d);
	var startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), nowHours, 0, 0);
	console.log("startDate");
	console.log(startDate);
	var startTime = startDate.getTime() / 1000;
	var timeClass = [];
	var chartDataSet = [];
	var dataSet = [];
	
	var ackDataSet = [];
	var problemDataSet = [];
	var okDataSet = [];
	
	var eventArrayByTime = [];
	var keyArr = [];
	var j=0;
	for(var i=startTime; i<(new Date().getTime()/1000); i=i+300){ // 5분 단위로 시간 구하기
		
		timeClass[j]=i;
		
		var obj = new Object();
		obj.startTime = i;
		obj.endTime = i+300;
		obj.ackCount = 0;
		obj.problemCount = 0;
		obj.okCount = 0;
		chartDataSet.push(obj);
		j++;
	}
	for(var i=0; i<timeClass.length; ++i){
		//console.log(timeClass[i]);
	}
	
	zbxApi.getEvent.getByTime(startTime).then(function(data) { // 24시간 전 ~ 현재 이벤트 추출
		var eventArr = data.result;
		$.each(eventArr, function(k,v){
			
			var thisEventClock = parseInt(v.clock);
			$.each(chartDataSet, function(k2,v2){
				if(v2.startTime <= thisEventClock && v2.endTime > thisEventClock){
					if(v.acknowledged == "1"){
						v2.ackCount += 1;
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
	    showEventStatChart("chart_eventList", "", dataSet, "", ['#FF8C00', 'red', '#00BFFF', '#ccaa65', '#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
	    $.unblockUI(blockUI_opt_all);
	});
	
    
}