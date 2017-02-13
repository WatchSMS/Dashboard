/* 전체 서버 상태 2017-01-02 */
var allServerViewHost = function() {
    $.blockUI(blockUI_opt_all);
    $("[id^=base]").hide();
    $("#base_server").show();

    var server_data = '';
    zbxApi.allServerViewHost.get().done(function(data, status, jqXHR) {
        server_data = zbxApi.getDiskItem.success(data);
        serverOverView(server_data);
    });
}

var serverOverView = function(server_data) {
    $.blockUI(blockUI_opt_all);
    var serverName = '';
    var serverIP = '';
    var serverPerCPU = 0;
    var serverPerMemory = 0;
    var serverPerDisk = 0;
    var serverOS = '-';
    var serverCPU = '-';
    var serverRAM = '-';
    var hostid = '';

    var tableDataObj = new Object();
    var tableDataArr = [];

    var serverOverViewHTML = '';
    serverOverViewHTML += '<thead>';
    serverOverViewHTML += '<tr role="row">';
    serverOverViewHTML += '<th id="serverName" style="width: 10%;" class="sorting" aria-sort="descending">서버명</th>';
    serverOverViewHTML += '<th id="serverIpAddr" style="width: 10%;">IP주소</th>';
    serverOverViewHTML += '<th id="serverPerCpu" style="width: 17%;">CPU(%)</th>';
    serverOverViewHTML += '<th id="serverMemory" style="width: 17%;">메모리(%)</th>';
    serverOverViewHTML += '<th id="serverDisk" style="width: 17%;">디스크(%)</th>';
    serverOverViewHTML += '<th id="serverOS" style="width: 10%;">운영체제</th>';
    serverOverViewHTML += '<th id="serverCPU" style="width: 10%;">CPU</th>';
    serverOverViewHTML += '<th id="serverRAM" style="width: 10%;">RAM</th>';
    serverOverViewHTML += '</tr>';
    serverOverViewHTML += '</thead>';
    serverOverViewHTML += '<tbody>';

    $.each(server_data.result, function(k, v) {
        serverName = v.name;
        serverIP = v.interfaces[0].ip;
        hostid = v.hostid;
        console.log("호스트 정보 : " + hostid);
        var osInfo = v.inventory.os;    //serverOS = v.inventory.os;
        if (osInfo === undefined) {
            serverOS = '-';
        }
        else {
            if (osInfo.match('Linux')) {
                serverOS = 'Linux';
            }
            else if (osInfo.match('Window')) {
                serverOS = 'Windows';
            }
            else {
                serverOS = '-';
            }
        }

        try {
            serverPerCPU = zbxSyncApi.allServerViewItemByName(hostid, "CPU idle time").lastvalue;
            serverPerCPU = Math.floor(serverPerCPU * 100) / 100;

            if (serverPerCPU == 100)
                serverPerCPU = 0;
        } catch (e) {
            console.log(e);
        }

        try {
            serverPerMemory = zbxSyncApi.allServerViewItem(hostid, "vm.memory.size[pused]").lastvalue;
            serverPerMemory = Math.floor(serverPerMemory * 100) / 100;
        } catch (e) {
            console.log(e);
        }

        var value;
        try {
            // TODO pfree to pused.
            value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[/,pfree]").lastvalue;
        } catch (e) {
            console.log(e);
            value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[C:,pfree]").lastvalue;
        }
        serverPerDisk = 100 - value;

        if (serverPerDisk == 100)
            serverPerDisk = 0;
        serverPerDisk = Math.floor(serverPerDisk * 100) / 100;

        var infoArr = v.inventory.hardware;     //serverCPU + serverRAM = v.inventory.hardware
        if (infoArr === undefined || infoArr == '') {
            serverCPU = '-';
            serverRAM = '-';
        } else {
            var splitInfo = infoArr.split(",");
            serverCPU = splitInfo[0].slice(4);
            serverRAM = splitInfo[1].slice(5);
        }

        var tableDataObj = new Object();
        tableDataObj.hostid = hostid;
        tableDataObj.name = serverName;
        tableDataObj.ip = serverIP;
        tableDataObj.perCPU = serverPerCPU;
        tableDataObj.perMemory = serverPerMemory;
        tableDataObj.perDisk = serverPerDisk;
        tableDataObj.OS = serverOS;
        tableDataObj.CPU = serverCPU;
        tableDataObj.RAM = serverRAM;
        tableDataArr.push(tableDataObj);

        serverOverViewHTML += '<tr role="row" class="odd">';
        serverOverViewHTML += '<td id="Name_' + hostid + '">' + serverName + '</td>';
        serverOverViewHTML += '<td id="IP_' + hostid + '">' + serverIP + '</td>';
        serverOverViewHTML += '<td class="progress-background" id="PerCPU_' + hostid + '"><div id="perCPU_'+hostid+'" class="progress-bar" style="width:' + serverPerCPU + '%">' + serverPerCPU + '%</div></td>';
        serverOverViewHTML += '<td class="progress-background" id="PerMemory_' + hostid + '"><div id="perMemory_'+hostid+'" class="progress-bar" style="width:' + serverPerMemory + '%">' + serverPerMemory + '%</div></td>';
        serverOverViewHTML += '<td class="progress-background" id="PerDisk_' + hostid + '"><div id="perDisk_'+hostid+'" class="progress-bar" style="width:' + serverPerDisk + '%">' + serverPerDisk + '%</div></td>';
        serverOverViewHTML += '<td>' + serverOS + '</td>';
        serverOverViewHTML += '<td>' + serverCPU + '</td>';
        serverOverViewHTML += '<td>' + serverRAM + '</td>';
        serverOverViewHTML += '</tr>';
    });

    serverOverViewHTML += '</tbody>';
    $("#serverList").empty();
    $("#serverList").append(serverOverViewHTML);

    $.each(server_data.result, function(k, v) {
        hostid = v.hostid;
        var item_id = '';
        console.log("123 456 hostid : " + hostid);

        //화면 이동
        $("#Name_" + hostid).dblclick(function () {
            //console.log(">>>>> 서버명 클릭 <<<<< : " + this.id);
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_")+1);
            $("#info_" + hostid).click();
        });

        $("#PerCPU_" + hostid).dblclick(function () {
            //console.log(">>>>> CPU(%) 클릭 <<<<< : " + this.id);
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#cpu_" + hostid).click();
        });

        $("#PerMemory_" + hostid).dblclick(function () {
            //console.log(">>>>> Memory(%) 클릭 <<<<< : " + this.id);
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#memory_" + hostid).click();
        });

        $("#PerDisk_" + hostid).dblclick(function () {
            //console.log(">>>>> Disk(%) 클릭 <<<<< : " + + this.id);
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#disk_" + hostid).click();
        });
    });

    //테이블의 th col 클릭시 정렬된 테이블 내용 생성
    var $table = $("#serverList");
    $('th', $table).each(function (column) {
        $(this).click(function() {
            var sortTable = '';
            var currentThObj = $(this);
            var MAX_COUNT = tableDataArr.length;

            if($(this).is('.sorting_desc')){
                console.log(" >>>>> sorting_desc <<<<<");
                tableDataArr.sort(function (a, b) {
                    if(column == 0) {
                        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            }else{
                tableDataArr.sort(function (a, b) {
                    console.log(" >>>>> sorting_asc <<<<<");
                    if(column == 0){
                        return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
            }//end else
            $('tbody', $table).empty();

            for(var i=0; i<MAX_COUNT; i++){
                var hostid = tableDataArr[i].hostid;
                sortTable += '<tr id="overView_' + hostid + '" role="row" class="odd">';
                sortTable += '<td class="sorting_1" id="Name_' + hostid + '">' + tableDataArr[i].name + '</td>';
                sortTable += '<td id = "IP_' + hostid + '">' + tableDataArr[i].ip + '</td>';
                sortTable += '<td class="progress-background" id="PerCPU_' + hostid + '"><div class="progress-bar" style="width:' + tableDataArr[i].perCPU + '%">' + tableDataArr[i].perCPU + '%</div></td>';
                sortTable += '<td class="progress-background" id="PerMemory_' + hostid + '"><div class="progress-bar" style="width:' + tableDataArr[i].perMemory + '%">' + tableDataArr[i].perMemory + '%</div></td>';
                sortTable += '<td class="progress-background" id="PerDisk_' + hostid + '"><div class="progress-bar" style="width:' + tableDataArr[i].perDisk + '%">' + tableDataArr[i].perDisk + '%</div></td>';
                sortTable += '<td>' + tableDataArr[i].OS + '</td>';
                sortTable += '<td>' + tableDataArr[i].CPU + '</td>';
                sortTable += '<td>' + tableDataArr[i].RAM + '</td>';
                sortTable += '</tr>';
            }//end for
            $('tbody', $table).append(sortTable);

        })//end click function
    }) //end each

    //page reloag
    $("#reload_serverOverview").click(function(){
        //int.allServerViewHost();
        console.log("reload_serverOverview");
        //http://div.or.kr/js-studying/%ED%83%9C%EA%B7%B8%20%EA%B0%9D%EC%B2%B4%20innerHTML%20%EC%86%8D%EC%84%B1
        /*
         console.log($("#perCPU_10110").width());
         console.log($("#perCPU_10110").html());
         $("#perCPU_10110").width("80%");
         $("#perCPU_10110").html("80%");
         */

        var cpu = '';
        var memory = '';
        var disk = '';
        var ROW_COUNT = tableDataArr.length;
        //alert("ROW_COUNT : " + ROW_COUNT);

        for(var i=0; i<ROW_COUNT; i++){
            var hostid = tableDataArr[i].hostid;
            //alert("hostid : " + hostid);
            try {
                cpu = zbxSyncApi.allServerViewItemByName(hostid, "CPU idle time").lastvalue;
                cpu = Math.floor(cpu * 100) / 100;

                if (cpu == 100)
                    cpu = 0;
            } catch (e) {
                console.log(e);
            }
            console.log("perCPU_"+hostid + " >> " + $("#perCPU_"+hostid).width() +" / " + $("#perCPU_"+hostid).html());
            $("#perCPU_"+hostid).width(cpu+"%");
            $("#perCPU_"+hostid).html(cpu+"%");

            try {
                memory = zbxSyncApi.allServerViewItem(hostid, "vm.memory.size[pused]").lastvalue;
                memory = Math.floor(memory * 100) / 100;
            } catch (e) {
                console.log(e);
            }
            if(memory == 0)
                memory = 0;
            console.log("perMemory_"+hostid + " >> " + $("#perMemory_"+hostid).width() +" / " + $("#perMemory_"+hostid).html());
            $("#perMemory_"+hostid).width(memory+"%");
            $("#perMemory_"+hostid).html(memory+"%");

            var value;
            try {
                // TODO pfree to pused.
                value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[/,pfree]").lastvalue;
            } catch (e) {
                console.log(e);
                value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[C:,pfree]").lastvalue;
            }
            disk = 100 - value;

            if (disk == 100)
                disk = 0;
            disk = Math.floor(disk * 100) / 100;
            console.log("perDisk_"+hostid + " >> " + $("#perDisk_"+hostid).width() +" / " + $("#perDisk_"+hostid).html());
            $("#perDisk_"+hostid).width(disk+"%");
            $("#perDisk_"+hostid).html(disk+"%");
            console.log("================================");
        }
    });

    $(function ($) {
        $('#reload_serverOverview_selecter').change(function () {
            var selectVal = $(this).val();
            if (selectVal != 0) {
                $("#reload_serverOverview").attr({
                    "disabled": "disabled"
                });
            } else {
                $("#reload_serverOverview").removeAttr("disabled");
            }
        });
    });

    //자동 새로고침
    setInterval('$("#reload_serverOverview").click()', PAGE_RELOAD_TIME);

    $.unblockUI(blockUI_opt_all);
};