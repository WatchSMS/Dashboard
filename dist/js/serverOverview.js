/* 전체 서버 상태 2017-01-02 */
var allServerViewHost = function() {
    $.blockUI(blockUI_opt_all);
    $("[id^=base]").hide();
    $("#base_server").show();

    var server_data = '';
    zbxApi.allServerViewHost.get().done(function(data, status, jqXHR) {
        server_data = zbxApi.allServerViewHost.success(data);
        serverOverView(server_data);
    });
};

function serverOverView(server_data) {
    $.blockUI(blockUI_opt_all);
    var tableDataObj = {};
    var tableDataArr = [];

    var serverOverViewHTML = '';
    serverOverViewHTML += '<thead>';
    serverOverViewHTML += '<tr role="row">';
    serverOverViewHTML += '<td id="serverStatus" width="45" class="line-th">상태</td>';
    //serverOverViewHTML += '<td id="serverNameTd" width="188" class="sorting line-td" aria-sort="descending">서버명</td>';
    serverOverViewHTML += '<td id="serverNameTd" width="188" class="line-td">서버명</td>';
    serverOverViewHTML += '<td id="serverIpAddr" width="122" class="line-td">IP주소</td>';
    serverOverViewHTML += '<td id="serverPerCpu" width="131" class="line-td">CPU(%)</td>';
    serverOverViewHTML += '<td id="serverMemory" width="131" class="line-td">메모리(%)</td>';
    serverOverViewHTML += '<td id="serverDisk" width="131" class="line-td">디스크(%)</td>';
    serverOverViewHTML += '<td id="serverOS" width="150" class="line-td">운영체제</td>';
    serverOverViewHTML += '<td id="serverCPU" width="117" class="line-td">CPU</td>';
    serverOverViewHTML += '<td id="serverRAM" width="97" class="line-td">RAM</td>';
    serverOverViewHTML += '</tr>';
    serverOverViewHTML += '</thead>';
    serverOverViewHTML += '<tbody id="hostInfoList">';

    $.each(server_data.result, function(k, v) {
        var serverStatus = '';
        var hostid = '';
        var serverName = '';
        var serverIP = '';
        var serverPerCPU = 0;
        var serverPerMemory = 0;
        var serverPerDisk = 0;
        var serverOS = '-';
        var serverCPU = '-';
        var serverRAM = '-';

        serverName = v.name;
        hostid = v.hostid;
        serverStatus = zbxSyncApi.serverOverView().result[0].status;
        serverStatus = convHostEvent(serverStatus);
        serverIP = v.interfaces[0].ip;
        console.log("호스트 정보 : " + hostid + " / serverName : " + serverName + " / serverStatus : " + serverStatus);
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
            try {
                value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[C:,pfree]").lastvalue;
            } catch (e) {
                console.log(e);
            }
        }
        console.log("value : " + value);
        serverPerDisk = 100 - value;

        if(value === undefined){
            serverPerDisk = 0;
        }

        if (serverPerDisk == 100)
            serverPerDisk = 0;
        serverPerDisk = Math.floor(serverPerDisk * 100) / 100;

        var infoArr = v.inventory.hardware;     //serverCPU + serverRAM = v.inventory.hardware
        if (infoArr === undefined || infoArr == '') {
            serverCPU = '-';
            serverRAM = '-';
        } else {
            var splitInfo = infoArr.split(",");
            try {
                serverCPU = splitInfo[0].slice(4);
                serverRAM = splitInfo[1].slice(5);
            } catch (e) {
                console.log(e);
            }
        }

        var tableDataObj = {};
        tableDataObj.hostid = hostid;
        tableDataObj.status = serverStatus;
        tableDataObj.name = serverName;
        tableDataObj.ip = serverIP;
        tableDataObj.perCPU = serverPerCPU;
        tableDataObj.perMemory = serverPerMemory;
        tableDataObj.perDisk = serverPerDisk;
        tableDataObj.OS = serverOS;
        tableDataObj.CPU = serverCPU;
        tableDataObj.RAM = serverRAM;
        tableDataArr.push(tableDataObj);

        serverOverViewHTML += '<tr role="row" class="odd" id="serverInfoList">';
        serverOverViewHTML += '<td id="Status_' + hostid + '" width="45" class="line-td">' + serverStatus + '</td>';
        serverOverViewHTML += '<td id="Name_' + hostid + '" width="188" class="line-td" style="cursor:pointer">' + serverName + '</td>';
        serverOverViewHTML += '<td id="IP_' + hostid + '" width="122" class="line-td">' + serverIP + '</td>';
        serverOverViewHTML += '<td id="PerCPU_' + hostid + '" width="131" class="line-td" style="cursor:pointer"><div class="scw">' +
            '<div class="mt2 bg8 br3" style="width:' + serverPerCPU + '%; height:5px;"></div>' +
            '</div><div class="fr mt2 mr5 f11">' + serverPerCPU + '%</div></td>';
        serverOverViewHTML += '<td id="PerMemory_' + hostid + '" width="131" class="line-td" style="cursor:pointer"><div class="scw">' +
            '<div class="mt2 bg8 br3" style="width:' + serverPerMemory + '%; height:5px;"></div>' +
            '</div><div class="fr mt2 mr5 f11">' + serverPerMemory + '%</div></td>';
        serverOverViewHTML += '<td id="PerDisk_' + hostid + '" width="131" class="line-td" style="cursor:pointer"><div class="scw">' +
            '<div class="mt2 bg8 br3" style="width:' + serverPerDisk + '%; height:5px;"></div>' +
            '</div><div class="fr mt2 mr5 f11">' + serverPerDisk + '%</div></td>';
        serverOverViewHTML += '<td width="150" class="line-td">' + serverOS + '</td>';
        serverOverViewHTML += '<td width="117" class="line-td">' + serverCPU + '</td>';
        serverOverViewHTML += '<td width="97" class="line-td">' + serverRAM + '</td>';
        serverOverViewHTML += '</tr>';
    });

    serverOverViewHTML += '</tbody>';
    $("#serverList").empty();
    $("#serverList").append(serverOverViewHTML);

    $.each(server_data.result, function(k, v) {
        console.log("IN function");
        hostid = v.hostid;
        var item_id = '';

        //화면 이동
        $("#Name_" + hostid).click(function () {
            console.log("IN function Name_");
            item_id = this.id;
            console.log(" this.id : " + item_id);
            hostid = item_id.substring(item_id.indexOf("_")+1);
            $("#serverInfo").empty();
            $("#serverProcessList").empty();
            $("#serverEventList").empty();
            $("#info_" + hostid).click();
        });

        $("#PerCPU_" + hostid).click(function () {
            console.log("IN function PerCPU_");
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#cpu_" + hostid).click();
        });

        $("#PerMemory_" + hostid).click(function () {
            console.log("IN function PerMemory_");
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#memory_" + hostid).click();
        });

        $("#PerDisk_" + hostid).click(function () {
            console.log("IN function PerDisk_");
            item_id = this.id;
            hostid = item_id.substring(item_id.indexOf("_") + 1);
            $("#disk_" + hostid).click();
        });
    });
    /*
     //테이블의 td col 클릭시 정렬된 테이블 내용 생성
     var $table = $("#serverList");
     $("#serverNameTd", $table).each(function (column) {
     $(this).click(function() {
     var sortTable = '';
     var currentThObj = $(this);
     var MAX_COUNT = tableDataArr.length;

     if($(this).is('.sorting_desc')){
     console.log(" >>>>> sorting_desc <<<<<");
     tableDataArr.sort(function (a, b) {
     if(column == 1) {
     return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
     }
     });
     currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
     }else{
     tableDataArr.sort(function (a, b) {
     console.log(" >>>>> sorting_asc <<<<<");
     if(column == 1){
     return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
     }
     });
     currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
     }//end else
     $('tbody', $table).empty();

     for(var i=0; i<MAX_COUNT; i++){
     var hostid = tableDataArr[i].hostid;
     sortTable += '<tr role="row" class="odd">';
     sortTable += '<td id = "Status_' + hostid + '" width="45" class="line-td">' + tableDataArr[i].status + '</td>';
     sortTable += '<td id = "Name_' + hostid + '" width="188" class="sorting_1 line-td">' + tableDataArr[i].name + '</td>';
     sortTable += '<td id = "IP_' + hostid + '" width="122" class="line-td">' + tableDataArr[i].ip + '</td>';
     sortTable += '<td id = "PerCPU_' + hostid + '" width="131" class="line-td"><div class="scw">' +
     '<div class="mt2 bg8 br3" style="width: ' + tableDataArr[i].perCPU + '%; height:5px;"></div>' +
     '</div><div class="fr mt2 mr5 f11">' + tableDataArr[i].perCPU + '%</div></td>';
     sortTable += '<td id = "PerMemory_' + hostid + '" width="131" class="line-td"><div class="scw">' +
     '<div class="mt2 bg8 br3" style="width: ' + tableDataArr[i].perMemory + '%; height:5px;"></div>' +
     '</div><div class="fr mt2 mr5 f11">' + tableDataArr[i].perMemory + '%</div></td>';
     sortTable += '<td id = "PerDisk_' + hostid + '" width="131" class="line-td"><div class="scw">' +
     '<div class="mt2 bg8 br3" style="width: ' + tableDataArr[i].perDisk + '%; height:5px;"></div>' +
     '</div><div class="fr mt2 mr5 f11">' + tableDataArr[i].perDisk + '%</div></td>';
     sortTable += '<td width="150" class="line-td">' + tableDataArr[i].OS + '</td>';
     sortTable += '<td width="117" class="line-td">' + tableDataArr[i].CPU + '</td>';
     sortTable += '<td width="97" class="line-td">' + tableDataArr[i].RAM + '</td>';
     sortTable += '</tr>';
     }//end for
     $('tbody', $table).append(sortTable);

     })//end click function
     }); //end each
     */

    //page reloag
    $("#reload_serverOverview").click(function(){
        //int.allServerViewHost();
        console.log("reload_serverOverview");

        var cpu = '';
        var memory = '';
        var disk = '';
        var ROW_COUNT = tableDataArr.length;
        //alert("ROW_COUNT : " + ROW_COUNT);

        for(var i=0; i<ROW_COUNT; i++){
            var hostid = tableDataArr[i].hostid;
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
                try {
                    value = zbxSyncApi.allServerViewItem(hostid, "vfs.fs.size[C:,pfree]").lastvalue;
                }catch (e) {
                    console.log(e);
                }
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

    $("#searchText").keyup(function() {
        console.log(" keyup CLICK searchText ");
        var inputText = $("#searchText").val();
        console.log(" 입력 Text : " + inputText);
        console.log(inputText.toLowerCase());
        /*
            var tbody_rowCount = $("#hostInfoList >tr").length;
            console.log(" 길이 : " + tbody_rowCount);
        */

        var convText = new RegExp("(\\b" + inputText + "\\b)", "gim");
        var divList = document.getElementById("infoTable").innerHTML;
        var convList = divList.replace(/(<span>|<\/span>)/igm, "");
        document.getElementById("infoTable").innerHTML = convList;
        var resultList = convList.replace(convText, "<span>$1</span>");
        document.getElementById("infoTable").innerHTML = resultList;

        /*for(var cnt=0; cnt<tbody_rowCount; cnt++){
        }*/
    });

    $.unblockUI(blockUI_opt_all);
}

function searchHostBtn(){
    console.log(" CLICK searchHostBtn ");
    $("#searchText").keyup();
    /*var inputText = $("#searchText").val();
    console.log(" searchHostBtn 입력 Text : " + inputText);*/
}