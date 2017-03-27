function diskUsageView(hostid, startTime){
    alert(hostid);
    $("#chart_diskIo").empty();
    $("#chart_diskUse").empty();
    $("#diskInfoTable").empty();

    removeAllChart();

    showDiskList(hostid, startTime);
}

function showDiskList(hostid, startTime){
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
}

function generateDiskResource(hostid, diskName, startTime){
    console.log(" IN generateDiskResource currentDiskName  : " + diskName + " startTime  : " + startTime + " hostid  : " + hostid);

    var diskInode = '';
    var diskFree = '';
    var diskUse = '';

    var diskItemKeyInode = "vfs.fs.inode[" + diskName + ",pfree]";
    var diskItemKeyFree = "vfs.fs.size[" + diskName + ",pfree]";
    var diskItemKeyUse = "vfs.fs.size[" + diskName + ",pused]";

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

        console.log(" serverViewGraph diskInode Data : " + JSON.stringify(diskInode));
        console.log(" serverViewGraph diskFree Data : " + JSON.stringify(diskFree));
        console.log(" serverViewGraph diskUse Data : " + JSON.stringify(diskUse));
        showDiskInode(diskInode, diskFree, startTime);
        showDiskTotal(diskUse,  startTime);
    });
}

function clickInputTimeDisk(){
    var inputTime = $('#disk_InputTimecontent').find('input:first').val();
    var currentDiskName = $(".selectedDisk").attr('id');
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);

    generateDiskResource(currentHostId, currentDiskName, startTime);
}


function showDiskInode(diskInode, diskFree, startTime){
    console.log(" IN showDiskInode ");
    removeAllChart();

    var diskInodeArr = [];
    var diskFreeArr = [];

    var dataSet  = [];
    var dataObj = new Object();

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskFreeArr = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = "INODE";
        dataObj.data = diskInodeArr;
        dataSet.push(dataObj);

        dataObj = new Object();
        dataObj.name = "FREE";
        dataObj.data = diskFreeArr;
        dataSet.push(dataObj);

        showBasicLineChart('chart_diskIo', '디스크I/O', dataSet, "%", ['#00B700','#DB9700']);
    });
}

function showDiskTotal(diskUse, startTime){
    console.log(" IN showDiskTotal ");
    removeAllChart();

    var diskTotlaArr = [];

    var dataSet  = [];
    var dataObj = new Object();

    zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        diskTotlaArr  = zbxApi.getHistory.success(data);

        dataObj = new Object();
        dataObj.name = "TOTAL";
        dataObj.data = diskTotlaArr;
        dataSet.push(dataObj);

        showBasicLineChart('chart_diskUse', '디스크 TOTAL', dataSet, "%", ['#00B700','#DB9700']);
    });
}

function callApiForDiskTable(hostid){
    return zbxSyncApi.getDisktItem(hostid);
}

function rowDiskClickEvent(table, hostid, startTime){
    $('tr', table).each(function (row){
        $(this).click(function(){

            var currentDiskName = $(this).attr('id');
            console.log(" currentDiskName : " + currentDiskName);
            console.log(" hostid : " + hostid);
            $(".selectedDisk").removeClass("selectedDisk");
            $(this).addClass("selectedDisk");
            $(this).css("border","1px #FF5E00 solid");
            $(this).prevAll().css("border","");
            $(this).nextAll().css("border","");

            generateNetworkResource(hostid, currentDiskName, startTime);
        });
    });
}