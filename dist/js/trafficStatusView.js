function networkUsageView(hostid, startTime){
    console.log(" IN networkUsageView ");
    removeAllChart();

    var NetworkTableHTML = '';
    var currentNetworkName = null;
    var tableDataObj = new Object();
    var tableDataArr = [];
    var lastNetworkData = callApiForNetworkTable(hostid);

    var networkItemId = '';
    var networkItemName = '';
    var networkItemUsed = '';
    var networkItemSize = '';
    var key = '';
    //var networkIn = '';
    var networkOut = '';
    console.log("lastNetworkData : " + JSON.stringify(lastNetworkData));
    var nicArr = [];
    $.each(lastNetworkData.result, function(k, v){
    	nicArr.push(v.key_.substring(v.key_.indexOf("[") + 1, v.key_.indexOf("]")));
    });

    console.log("nicArr");
    console.log(nicArr);
    NetworkTableHTML += "<tbody>";

    //좌측 network List
    $.each(lastNetworkData.result, function(k, v){
        
    	console.log("kkkkkkkkkkkkkkkk");
    	
    	console.log(k);
    	console.log(v);
        //networkItemId = v.itemId;
//        key = v.key_;
//        networkItemName = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
    	var networkIn = '';
        zbxApi.getNetworkItem.get(hostid, "net.if.in["+nicArr[k]+"]").then(function(data) {

        	networkIn = (data.result[0].lastvalue / 1024).toFixed(2);
        }).then(function() {
        	return zbxApi.getNetworkItem.get(hostid, "net.if.out["+nicArr[k]+"]");            
        }).then(function(data) {
            networkOut = (data.result[0].lastvalue / 1024).toFixed(2);
        }).then(function() {
        	
        	tableDataObj = new Object();
            tableDataObj.networkItemId = v.itemId;
            tableDataObj.networkItemName = nicArr[k];
            tableDataObj.networkItemUsed = networkItemUsed;
            tableDataObj.networkItemSize = networkItemSize;
            tableDataArr.push(tableDataObj);
            
        	NetworkTableHTML += "<tr id='" + nicArr[k] + "' role='row' class='h51 odd'>";
            NetworkTableHTML += "<td width='90' class='line'><img src='dist/img/card_icon01.png'/></td>";
            NetworkTableHTML += "<td width='auto' class='align_left p113'>";
            NetworkTableHTML += "<div class='mt2 f11'>" + nicArr[k] + "</div>";
            NetworkTableHTML += "<div class='mt2 f11'> TX : " + networkOut + " b/s / RX : " + networkIn + " b/z</div>";
            NetworkTableHTML += "</tr>";      
            
           
            if(lastNetworkData.result.length == (k+1)){
            	
            NetworkTableHTML += "</tbody>";

            $("#networkInfoTable").empty();
            $("#networkInfoTable").append(NetworkTableHTML);

            $("#chart_trafficIo").empty();
            $("#chart_trafficTotal").empty();

            var $table = $("#networkInfoTable");
            $("#networkInfoTable > tbody > tr").eq(0).addClass("selectedNetwork");
	            //$("#networkInfoTable > tbody > tr").eq(0).css("border","1px #FF5E00 solid");
	            $("#networkInfoTable > tbody > tr").eq(0).css("background","#7708e1");

            currentNetworkName = $(".selectedNetwork").attr('id');

            generateNetworkResource(hostid, currentNetworkName, startTime);

            rowClickNetworkEvent($table, hostid, startTime);

            // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
            $("#btn_network.btn").off().on('click',function() {
                var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                var currentNetworkName = $(".selectedNetwork").attr('id');
                removeAllChart();
                generateNetworkResource(hostid, currentNetworkName, startTime1);
            });

            // 시간 수동 입력 버튼 클릭시
            $("#btn_network.btn_etc").off().on('click',function() {
                $('#selectNetworkTimeInput').val("");
                $('#network_InputTimecontent').lightbox_me({
                    centered: true,
                    closeSelector: ".close",
                    onLoad: function() {
                        $('#network_InputTimecontent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
                    },
                    overlayCSS:{background: '#474f79', opacity: .8}
                });
            });
            }
        });
        
//        try{
//        	console.log("wwww");
//        	console.log(zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+networkItemName+",pfree]"));
//            networkItemUsed = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+networkItemName+",pfree]").lastvalue;
//            console.log("rrrrrrrrrrrrrrr");
//            console.log(networkItemUsed);
//            networkItemUsed = Math.floor(networkItemUsed * 100) / 100;
//
//            networkItemSize = zbxSyncApi.getDiskItem(hostid, "net.if.total["+networkItemName+",bytes]").lastvalue;
//        } catch(e){
//            console.log(e);
//        }

//        tableDataObj = new Object();
//        tableDataObj.networkItemId = networkItemId;
//        tableDataObj.networkItemName = networkItemName;
//        tableDataObj.networkItemUsed = networkItemUsed;
//        tableDataObj.networkItemSize = networkItemSize;
//        tableDataArr.push(tableDataObj);
//
//        NetworkTableHTML += "<tr id='" + networkItemName + "' role='row' class='h51 odd'>";
//        NetworkTableHTML += "<td width='90' class='line'><img src='dist/img/card_icon01.png'/></td>";
//        NetworkTableHTML += "<td width='auto' class='align_left p113'>";
//        NetworkTableHTML += "<div class='mt2 f11'>" + networkItemName + "</div>";
//        NetworkTableHTML += "<div class='mt2 f11'> TX : " + networkItemUsed + " b/s / RX : " + networkItemSize + " b/z</div>";
//        NetworkTableHTML += "</tr>";
    });

//    NetworkTableHTML += "</tbody>";
//
//    $("#networkInfoTable").empty();
//    $("#networkInfoTable").append(NetworkTableHTML);
//
//    $("#chart_trafficIo").empty();
//    $("#chart_trafficTotal").empty();
//
//    var $table = $("#networkInfoTable");
//    $("#networkInfoTable > tbody > tr").eq(0).addClass("selectedNetwork");
//    $("#networkInfoTable > tbody > tr").eq(0).css("border","1px #FF5E00 solid");
//
//    currentNetworkName = $(".selectedNetwork").attr('id');
//    console.log(" currentNetworkName : " + currentNetworkName);
//
//    generateNetworkResource(hostid, currentNetworkName, startTime);
//
//    rowClickNetworkEvent($table, hostid, startTime);
//
//    // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
//    $("#btn_network.btn").off().on('click',function() {
//        var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
//        var currentNetworkName = $(".selectedNetwork").attr('id');
//        generateNetworkResource(hostid, currentNetworkName, startTime1);
//    });
//
//    // 시간 수동 입력 버튼 클릭시
//    $("#btn_network.btn_etc").off().on('click',function() {
//        $('#selectNetworkTimeInput').val("");
//        $('#network_InputTimecontent').lightbox_me({
//            centered: true,
//            closeSelector: ".close",
//            onLoad: function() {
//                $('#network_InputTimecontent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
//            },
//            overlayCSS:{background: 'white', opacity: .8}
//        });
//    });
}

function callApiForNetworkTable(hostid){
	return zbxSyncApi.getNetworkItem(hostid, "net.if.total");
}

function generateNetworkResource(hostid, networkName, startTime){
    var networkIn = null;
    var networkOut = null;
    var networkTotal = null;

    var networkInArr = [];
    var networkOutArr = [];
    var networkTotalArr = [];

    var dataSet = [];
    var networkTotalDataSet = [];
    var dataObj = new Object();

    var networkItemKeyIn = "net.if.in[" + networkName + "]";
    var networkItemKeyOut = "net.if.out[" + networkName + "]";
    var networkItemKeyTotal = "net.if.total[" + networkName + "]";

    $("#chart_trafficIo").block(blockUI_opt_all_custom);
    $("#chart_trafficTotal").block(blockUI_opt_all_custom);

    zbxApi.serverViewGraph.get(hostid, networkItemKeyIn).then(function(data) {
        networkIn = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.serverViewGraph.get(hostid, networkItemKeyOut);
    }).then(function(data) {
        networkOut = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.serverViewGraph.get(hostid, networkItemKeyTotal);
    }).then(function(data) {
        networkTotal = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(networkIn.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data){
        networkInArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(networkOut.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        networkOutArr = zbxApi.getHistory.success(data);
    }).then(function(){
        return zbxApi.getHistory.get(networkTotal.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data){
        networkTotalArr = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = "트래픽 사용량";
        dataObj.data = networkInArr;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = "트래픽 사용량";
        dataObj.data = networkOutArr;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = "트래픽 사용량";
        dataObj.data = networkTotalArr;
        networkTotalDataSet.push(dataObj);
        
        showBasicLineChart('chart_trafficIo', "트래픽 사용량", dataSet, "kbps", ['#e85c2a','#ccaa65', '#E3C4FF', '#8F8AFF']);
//        showBasicLineChart('chart_trafficIo', "트래픽 사용량", dataSet, "kbps", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
        showBasicAreaChart('chart_trafficTotal', "트래픽 사용량", networkTotalDataSet, "kbps", ['#fa7796', '#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
    });
}

function clickInputTimeNetwork(){
    var inputTime = $('#network_InputTimecontent').find('input:first').val();
    var currentDiskName = $(".selectedNetwork").attr('id');
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);

    removeAllChart();
    generateNetworkResource(currentHostId, currentDiskName, startTime);
}

function rowClickNetworkEvent(table, hostid, startTime){
	
	
    $('tr', table).each(function (row){
        $(this).click(function(){
        	console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww1");
        	console.log($(this));
        	removeAllChart();
            var currentNetworkName = $(this).attr('id');
            console.log(" currentNetworkName : " + currentNetworkName);
            $(".selectedNetwork").removeClass("selectedNetwork");
            $(this).addClass("selectedNetwork");
            $(this).css("background","#7708e1");
            $(this).prevAll().css("background","");
            $(this).nextAll().css("background","");
            //$(this).css("border","1px #FF5E00 solid");
            //$(this).prevAll().css("border","");
            //$(this).nextAll().css("border","");
            
            generateNetworkResource(hostid, currentNetworkName, startTime);
        });
    });
}
