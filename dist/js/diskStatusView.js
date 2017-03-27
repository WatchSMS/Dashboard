function diskUsageView(hostid, startTime){
    $("#chart_diskIo").empty();
    $("#chart_diskUse").empty();
    $("#diskInfoTable").empty();

    removeAllChart();

    var data_topDisk = callApiForDiskTable(hostid);
    console.log(" data_topDisk " + JSON.stringify(data_topDisk));

    var diskItemId = '';
    var name = '';
    var diskItemName = '';
    var diskValue = 0;
    var diskItemUsed = 0;
    var diskItemSize = 0;

    var currentDiskName = null;
    var diskTableHTML = '';

    var tableDataObj = new Object();
    var tableDataArr = [];

    diskTableHTML += "<tbody>";
    $.each(data_topDisk, function(k, v){
        diskItemId = v.itemid;
        name = v.key_;
        diskItemName = name.substring(name.indexOf("[") + 1, name.indexOf(","));
        diskValue = 0;
        diskItemUsed = 0;
        diskItemSize = 0;

        try{
            diskValue = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+diskItemName+",pfree]").lastvalue;
            diskItemSize = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+diskItemName+",used]").lastvalue;
            diskItemSize = Math.round(diskItemSize / 1024 / 1024 / 1024);

            diskItemUsed = 100-diskValue;
            if(diskItemUsed == 100){
                diskItemUsed = 0;
            }
            diskItemUsed = Math.floor(diskItemUsed * 100) / 100;

        } catch (e){
            console.log(e);
        }

        console.log("HTML : " + diskItemId + " / " + diskItemName + " / " + diskItemUsed + " / " + diskItemSize);

        tableDataObj = new Object();
        tableDataObj.networkItemId = diskItemId;
        tableDataObj.diskItemName = diskItemName;
        tableDataObj.diskItemUsed = diskItemUsed;
        tableDataObj.diskItemSize = diskItemSize;
        tableDataArr.push(tableDataObj);

        diskTableHTML += "<tr id='" + diskItemName + "' role='row' class='h51 odd'>";
        diskTableHTML += "<td width='90' class='line'><img src='dist/img/disk_icon01.png'/></td>";
        diskTableHTML += "<td width='auto'>";
        diskTableHTML += "<div class='f1 mt2 f11'>" + diskItemName + " : " + diskItemUsed + "% </div>";
        diskTableHTML += "<div class='scw br3'><div class='mt2 bg8 br3' style='height:5px; width: " + diskItemUsed + "%;'></div></div>";
        diskTableHTML += "<div class='fr mt2 mr5 f11'>"+ diskItemSize +"GB </div>";
        diskTableHTML += "</td>";
        diskTableHTML += "</tr>";
    });

    diskTableHTML += "</tbody>";

    $("#diskInfoTable").empty();
    $("#diskInfoTable").append(diskTableHTML);

    $("#chart_diskIo").empty();
    $("#chart_diskUse").empty();

    var $table = $("#diskInfoTable");
    $("#diskInfoTable > tbody > tr").eq(0).addClass("selectedDisk");
    $("#diskInfoTable > tbody > tr").eq(0).css("border","1px #FF5E00 solid");

    currentDiskName = $(".selectedDisk").attr('id');
    console.log("currentDiskName : " + currentDiskName);

    generateDiskResource(hostid, currentDiskName, startTime);

    rowDiskClickEvent($table, hostid, startTime);

    // 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
    $("#btn_disk.btn").off().on('click',function() {
        var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        var currentDiskName = $(".selectedDisk").attr('id');
        generateDiskResource(hostid, currentDiskName, startTime1);
    });

    // 시간 수동 입력 버튼 클릭시
    $("#btn_disk.btn_etc").off().on('click',function() {
        $('#selectDiskTimeInput').val("");
        $('#disk_InputTimecontent').lightbox_me({
            centered: true,
            closeSelector: ".close",
            onLoad: function() {
                $('#disk_InputTimecontent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
            },
            overlayCSS:{background: 'white', opacity: .8}
        });
    });

    TIMER_ARR.push(setInterval(function(){reloadChartForDiskInode(hostid); reloadChartForDiskTotal(hostid);}, 10000));
}

function generateDiskResource(hostid, diskName, startTime){
    console.log(" IN generateDiskResource currentDiskName  : " + diskName + " startTime  : " + startTime + " hostid  : " + hostid);

    var diskInode = '';
    var diskFree = '';
    var diskInodeArr = [];
    var diskFreeArr = [];

    var diskUse = '';
    var diskTotalArr = [];

    var diskItemKeyInode = "vfs.fs.inode[" + diskName + ",pfree]";
    var diskItemKeyFree = "vfs.fs.size[" + diskName + ",pfree]";
    var diskItemKeyUse = "vfs.fs.size[" + diskName + ",pused]";

    var ioDataSet  = [];
    var ioDataObj = new Object();
    var totalDataSet  = [];
    var totalDataObj = new Object();

    zbxApi.serverViewGraph.get(hostid, diskItemKeyInode).then(function(data) {
        diskInode = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.serverViewGraph.get(hostid, diskItemKeyFree);
    }).then(function(data) {
        diskFree = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.serverViewGraph.get(hostid, diskItemKeyUse);
    }).then(function(data) {
        diskUse = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskFreeArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskTotalArr  = zbxApi.getHistory.success(data);

        //차트에 전달할 데이터셋 생성
        ioDataObj = new Object();
        ioDataObj.name = "INODE";
        ioDataObj.data = diskInodeArr;
        ioDataSet.push(ioDataObj);

        ioDataObj = new Object();
        ioDataObj.name = "FREE";
        ioDataObj.data = diskFreeArr;
        ioDataSet.push(ioDataObj);

        totalDataObj = new Object();
        totalDataObj.name = "TOTAL";
        totalDataObj.data = diskTotalArr;
        totalDataSet.push(totalDataObj);

        showBasicLineChart('chart_diskIo', "INODE", ioDataSet, "%", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
        showBasicLineChart('chart_diskUse',"TOTAL", totalDataSet, "%", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);

        $('#chart_diskIo').off().on('mousemove touchmove touchstart', function (e) {
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
        $('#chart_diskUse').off().on('mousemove touchmove touchstart', function (e) {
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

    })
}

function clickInputTimeDisk(){
    var inputTime = $('#disk_InputTimecontent').find('input:first').val();
    var currentDiskName = $(".selectedDisk").attr('id');
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);

    generateDiskResource(currentHostId, currentDiskName, startTime);
}

function callApiForDiskTable(hostid){
    return zbxSyncApi.getDisktItem(hostid);
}

function rowDiskClickEvent(table, hostid, startTime){
    $('tr', table).each(function (row){
        $(this).click(function(){

            var currentDiskName = $(this).attr('id');
            console.log(" currentDiskName : " + currentDiskName + " hostid : " + hostid);
            $(".selectedDisk").removeClass("selectedDisk");
            $(this).addClass("selectedDisk");
            $(this).css("border","1px #FF5E00 solid");
            $(this).prevAll().css("border","");
            $(this).nextAll().css("border","");

            generateDiskResource(hostid, currentDiskName, startTime);
        });
    });
}

function reloadChartForDiskInode(hostid){
    console.log(" reloadChartForDiskInode ");

    var data_In, data_Out = null;

    var history_DiskIn = null;
    var history_DiskOut = null;

    var diskName = $(".selectedDisk").attr('id');

    var item = null;
    var startTime = Math.round((chart1.series[0].xData[(chart1.series[0].xData.length)-1]) / 1000) + 1;
    console.log("startTime : " + startTime);

    var diskItemKeyInode = "vfs.fs.inode[" + diskName + ",pfree]";
    var diskItemKeyFree = "vfs.fs.size[" + diskName + ",pfree]";

    console.log("diskItemKeyInode : " + diskItemKeyInode);
    console.log("diskItemKeyFree : " + diskItemKeyFree);

    zbxApi.serverViewGraph.get(hostid, diskItemKeyInode).then(function(data) {
        data_In = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.serverViewGraph.get(hostid, diskItemKeyFree);
    }).then(function(data) {
        data_Out = zbxApi.serverViewGraph.success(data);

    }).then(function() {
        return zbxApi.getHistory.get(data_In.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_DiskIn  = zbxApi.getHistory.success(data);
        $.each(history_DiskIn, function(k,v) {
            chart1.series[0].addPoint([v[0], v[1]]);
        });

    }).then(function() {
        return zbxApi.getHistory.get(data_Out.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_DiskOut  = zbxApi.getHistory.success(data);
        $.each(history_DiskOut, function(k,v) {
            chart1.series[0].addPoint([v[0], v[1]]);
        });
    })
}

function reloadChartForDiskTotal(hostid){
    console.log(" reloadChartForDiskTotal ");

    var data_Total = null;

    var history_DiskTotal = null;

    var diskName = $(".selectedDisk").attr('id');

    var item = null;
    var startTime = Math.round((chart2.series[0].xData[(chart2.series[0].xData.length)-1]) / 1000) + 1;
    console.log("startTime : " + startTime);

    var diskItemKeyUse = "vfs.fs.size[" + diskName + ",pused]";

    console.log("diskItemKeyUse : " + diskItemKeyUse);

    zbxApi.serverViewGraph.get(hostid, diskItemKeyUse).then(function(data) {
        data_Total = zbxApi.serverViewGraph.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(data_Total.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_DiskTotal  = zbxApi.getHistory.success(data);
        $.each(history_DiskTotal, function(k,v) {
            chart2.series[0].addPoint([v[0], v[1]]);
        });

    })
}