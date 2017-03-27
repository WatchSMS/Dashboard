function networkUsageView(hostid, startTime){
    console.log(" IN networkUsageView ");

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
    console.log("lastNetworkData : " + JSON.stringify(lastNetworkData));

    NetworkTableHTML += "<tbody>";

    //좌측 network List
    $.each(lastNetworkData.result, function(k, v){
        networkItemId = v.itemId;
        key = v.key_;
        networkItemName = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
        try{
            networkItemUsed = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+networkItemName+",pfree]").lastvalue;
            networkItemUsed = Math.floor(networkItemUsed * 100) / 100;

            networkItemSize = zbxSyncApi.getDiskItem(hostid, "net.if.total["+networkItemName+",bytes]").lastvalue;
        } catch(e){
            console.log(e);
        }

        tableDataObj = new Object();
        tableDataObj.networkItemId = networkItemId;
        tableDataObj.networkItemName = networkItemName;
        tableDataObj.networkItemUsed = networkItemUsed;
        tableDataObj.networkItemSize = networkItemSize;
        tableDataArr.push(tableDataObj);

        NetworkTableHTML += "<tr id='" + networkItemName + "' role='row' class='h51 odd'>";
        NetworkTableHTML += "<td width='90' class='line'><img src='dist/img/card_icon01.png'/></td>";
        NetworkTableHTML += "<td width='auto' class='align_left p113'>";
        NetworkTableHTML += "<div class='mt2 f11'>" + networkItemName + "</div>";
        NetworkTableHTML += "<div class='mt2 f11'> TX : " + networkItemUsed + " b/s / RX : " + networkItemSize + " b/z</div>";
        NetworkTableHTML += "</tr>";
    });

    NetworkTableHTML += "</tbody>";

    $("#networkInfoTable").empty();
    $("#networkInfoTable").append(NetworkTableHTML);

    $("#chart_trafficIo").empty();
    $("#chart_trafficTotal").empty();

    var $table = $("#networkInfoTable");
    $("#networkInfoTable > tbody > tr").eq(0).addClass("selectedNetwork");
    $("#networkInfoTable > tbody > tr").eq(0).css("border","1px #FF5E00 solid");

    currentNetworkName = $(".selectedNetwork").attr('id');

    console.log(" currentNetworkName : " + currentNetworkName);

    generateNetworkResource(hostid, currentNetworkName, startTime);

    rowClickNetworkEvent($table, hostid, startTime);

    // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
    $("#btn_network.btn").off().on('click',function() {
        var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        var currentNetworkName = $(".selectedNetwork").attr('id');
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
            overlayCSS:{background: 'white', opacity: .8}
        });
    });
}

function callApiForNetworkTable(hostid){
    return zbxSyncApi.getNetworkItem(hostid, "net.if.total");
}

function generateNetworkResource(hostid, networkName, startTime){
    var networkItemKeyIn = "net.if.in[" + networkName + "]";
    var networkItemKeyOut = "net.if.out[" + networkName + "]";
    var networkItemKeyTotal = "net.if.total[" + networkName + "]";

    var networkIn = null;
    var networkOut = null;
    var networkTotal = null;

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
        console.log(" networkGraph ");

        removeAllChart();

        networkGraphIo(networkIn, networkOut, startTime);
        networkGraphTotal(networkTotal, startTime);
    });
}

function networkGraphIo(networkIn, networkOut, startTime){
    var networkInArr = null;
    var networkOutArr = null;

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_trafficIo").block(blockUI_opt_all_custom);

    zbxApi.getNetworkHistory.get(networkIn.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        networkInArr = zbxApi.getNetworkHistory.success(data);
    }).then(function() {
        return zbxApi.getNetworkHistory.get(networkOut.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        networkOutArr = zbxApi.getNetworkHistory.success(data);
        console.log(" networkGraphIo ");

        dataObj = new Object();
        dataObj.name = "RECEVIED";
        dataObj.data = networkInArr;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = "TRANSMITED";
        dataObj.data = networkOutArr;
        dataSet.push(dataObj);

        console.log("dataSet : " + dataSet[0].name);
        console.log("dataSet : " + dataSet[0].data);
        console.log("dataSet : " + dataSet[1].name);
        console.log("dataSet : " + dataSet[1].data);

        showBasicLineChart('chart_trafficIo', '트래픽I/O', dataSet, "%", ['#00B700','#DB9700']);

        console.log(" end traffic Io ");
    });
}

function networkGraphTotal(networkTotal, startTime){
    var networkTotalArr = [];

    var dataSet = [];
    var dataObj = new Object();

    $("#chart_trafficTotal").block(blockUI_opt_all_custom);

    zbxApi.getNetworkHistory.get(networkTotal.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        networkTotalArr = zbxApi.getNetworkHistory.success(data);
        console.log(" networkGraphTotal ");

        dataObj = new Object();
        dataObj.name = "TOTAL";
        dataObj.data = networkTotalArr;
        dataSet.push(dataObj);

        console.log("dataSet : " + dataSet[0].name);

        showBasicLineChart('chart_trafficTotal', '트래픽TOTAL', dataSet, "%", ['#00B700']);
    })
}

function rowClickNetworkEvent(table, hostid, startTime){
    $('tr', table).each(function (row){
        $(this).click(function(){

            var currentNetworkName = $(this).attr('id');
            console.log(" currentNetworkName : " + currentNetworkName);
            $(".selectedNetwork").removeClass("selectedNetwork");
            $(this).addClass("selectedProcess");
            $(this).css("border","1px #FF5E00 solid");
            $(this).prevAll().css("border","");
            $(this).nextAll().css("border","");

            generateNetworkResource(hostid, currentNetworkName, startTime);
        });
    });
}