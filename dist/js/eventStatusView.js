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

    $("#eventList").scroll(function() {
        var div = $("#eventList");
        if(div[0].scrollHeight - div.scrollTop() == div.outerHeight()) {
            console.log(" END SCROLL ");
            var lastRowIdFrom = $("#eventList tr:last").attr('id');
            lastRowIdFrom = lastRowIdFrom - 1;
            var appendData = '';
            console.log(" last Row From : " + lastRowIdFrom);
            //eventStatusViewAppend

            zbxApi.eventStatusViewAppend.get(lastRowIdFrom).done(function (data, status, jqXHR) {
                appendData = zbxApi.eventStatusView.success(data);
                console.log(JSON.stringify(appendData));
                var eventCnt = 0;

                $.each(appendData.result, function(k, v) {
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
            });
        }
    })

    showEventChartView();

    TIMER_ARR.push(setInterval(function(){appendEventChart()}, 10000));
}

var hostIpMap=[];

function eventList(data_event){
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

    console.log("cccccccccccccccccccccccc");

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
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaachakchak ahahahah chak chak ahahahah ahahahah chakchakchak");
    console.log(chartDataSet);
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
        showEventStatChart("chart_eventList", "", dataSet, "", ['#FF8C00', 'red', '#00BFFF', '#ccaa65', '#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);

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