/* 전체 서버 상태 2017-01-02 */
function allServerViewHost(hostid) {
    $.blockUI(blockUI_opt_all);

    
    $("[id^=base]").hide();
    $("#base_server").show();

    $("#searchText").val("");
    $("#reload_serverOverview").hide();
    $("#serverList").empty();

    var server_data = '';
    zbxApi.allServerViewHost.get().done(function (data, status, jqXHR) {
        server_data = zbxApi.allServerViewHost.success(data);
        console.log("-----------------------");
        console.log(server_data);

        var serverLength = server_data.result.length;
        var serverTable, serverHostId = '';
        console.log(" serverLength : " + serverLength);

        $.each(server_data.result, function (k, v) {
            serverHostId = v.hostid;

            serverTable += "<tr id='serverHost_" + serverHostId + "'>";
            serverTable += "<td id='serverStatus_" + serverHostId + "' width='45' class='line-td'></td>";
            serverTable += "<td id='serverHostName_" + serverHostId + "' width='188' class='line-td'></td>";
            serverTable += "<td id='serverIp_" + serverHostId + "' width='122' class='line-td'></td>";

            serverTable += "<td id='serverPerCPU_" + serverHostId + "' width='131' class='line-td' style='cursor:pointer'>" +
                "<div class='scw'>" +
                "<div class='mt2 bg8 br3' id='serverPerCPU1_" + serverHostId + "'></div>" +
                "</div>" +
                "<div class='fr mt2 mr5 f11' id='serverPerCPU2_" + serverHostId + "'></div></td>";

            serverTable += "<td id='serverPerMEMORY_" + serverHostId + "' width='131' class='line-td' style='cursor:pointer'>" +
                "<div class='scw'>" +
                "<div class='mt2 bg8 br3' id='serverPerMEMORY1_" + serverHostId + "'></div>" +
                "</div>" +
                "<div class='fr mt2 mr5 f11' id='serverPerMEMORY2_" + serverHostId + "'></div></td>";

            serverTable += "<td id='serverPerDISK_" + serverHostId + "' width='131' class='line-td' style='cursor:pointer'>" +
                "<div class='scw'>" +
                "<div class='mt2 bg8 br3' id='serverPerDISK1_" + serverHostId + "'>" +
                "</div>" +
                "</div>" +
                "<div class='fr mt2 mr5 f11' id='serverPerDISK2_" + serverHostId + "'>" +
                "</div>" +
                "</td>";

            serverTable += "<td id='serverOS_" + serverHostId + "' width='150' class='line-td'></td>";
            serverTable += "<td id='serverCPU_" + serverHostId + "' width='117' class='line-td'></td>";
            serverTable += "<td id='serverRAM_" + serverHostId + "' width='97' class='line-td'></td>";

        });
        $("#serverList").append(serverTable);
        serverOverView(server_data);
    });

}

function serverOverView2() {

	var hostSet = [];
	var dataSet = [];
    var dataObj = new Object();

	zbxApi.allServerViewHost.get().then(function(data) {

        hostSet = data;

    }).then(function() {

    	$.each(hostSet.result, function(k,v){


            dataObj = new Object();
            dataObj.host = v.host;
            dataObj.hostId = v.hostid;
            dataObj.status = v.status;
            dataObj.ip = v.interfaces[0].ip;
            dataObj.os = v.inventory.os;
            dataObj.hardware = v.inventory.hardware;
        	
        	zbxApi.getItem.get(dataObj.hostId, "system.cpu.util[100-idle]").then(function(cpuData) {
        		console.log("cpuData");
        		console.log(cpuData);
        		dataObj.cpu = cpuData.result[0].lastvalue;
        		return zbxApi.getItem.get(dataObj.hostId,"vm.memory.size[100-pavailable]");
        	}).then(function(memData) {
        		dataObj.mem = memData.result[0].lastvalue;
        		return zbxApi.getItem.get(dataObj.hostId,"vfs.fs.size[/,pused]");
                //return zbxApi.getItem.get(dataObj.hostId,"system.cpu.load[percpu,avg5]");

            }).then(function(diskData) {
            	dataObj.disk = diskData.result[0].lastvalue;
            	dataSet.push(dataObj);
                //data_loadavg5 = zbxApi.getItem.success(data);
        });
        });
        //return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg5]");

    }).then(function() {
       // return zbxApi.getItem.get(hostid,"system.cpu.load[percpu,avg15]");
    	console.log("job finish");

    })
}

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

    $.each(server_data.result, function (k, v) {
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

        serverName = v.host;
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
            serverPerCPU = zbxSyncApi.getItem(hostid, "system.cpu.util[100-idle]").lastvalue;
            serverPerCPU = Math.floor(serverPerCPU * 100) / 100;

            if (serverPerCPU == 100)
                serverPerCPU = 0;
        } catch (e) {
            console.log(e);
        }

        try {
            serverPerMemory = zbxSyncApi.getItem(hostid, "vm.memory.size[100-pavailable]").lastvalue;
            serverPerMemory = Math.floor(serverPerMemory * 100) / 100;
        } catch (e) {
            console.log(e);
        }

        try {
            // TODO pfree to pused.
        	serverPerDisk = zbxSyncApi.getItem(hostid, "vfs.fs.size[/,pused]").lastvalue;
        } catch (e) {
            console.log(e);
            try {
            	serverPerDisk = zbxSyncApi.getItem(hostid, "vfs.fs.size[C:,pused]").lastvalue;
            } catch (e) {
                console.log(e);
            }
        }

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

        serverOverViewHTML += '<tr role="row" class="odd">';
        if(serverStatus == "정상"){
        	serverOverViewHTML += '<td id="Status_' + hostid + '" width="45" class="line-td" style="color:green;">' + serverStatus + '</td>';        	
        }else{
        	serverOverViewHTML += '<td id="Status_' + hostid + '" width="45" class="line-td" style="color:red;">' + serverStatus + '</td>';    
        }
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

    $.each(server_data.result, function (k, v) {
        console.log("IN function");
        hostid = v.hostid;
        var item_id = '';

        //화면 이동
        $("#Name_" + hostid).click(function () {
            console.log("IN function Name_");
            item_id = this.id;
            console.log(" this.id : " + item_id);
            hostid = item_id.substring(item_id.indexOf("_") + 1);
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

    //page reloag
    $("#reload_serverOverview").click(function () {
        //int.allServerViewHost();
        console.log("reload_serverOverview");

        var cpu = '';
        var memory = '';
        var disk = '';
        var ROW_COUNT = tableDataArr.length;
        //alert("ROW_COUNT : " + ROW_COUNT);

        for (var i = 0; i < ROW_COUNT; i++) {
            var hostid = tableDataArr[i].hostid;
            try {
                cpu = zbxSyncApi.allServerViewItemByName(hostid, "CPU idle time").lastvalue;
                cpu = Math.floor(cpu * 100) / 100;

                if (cpu == 100)
                    cpu = 0;
            } catch (e) {
                console.log(e);
            }
            $("#perCPU_" + hostid).width(cpu + "%");
            $("#perCPU_" + hostid).html(cpu + "%");

            try {
                memory = zbxSyncApi.allServerViewItem(hostid, "vm.memory.size[pused]").lastvalue;
                memory = Math.floor(memory * 100) / 100;
            } catch (e) {
                console.log(e);
            }
            if (memory == 0)
                memory = 0;
            $("#perMemory_" + hostid).width(memory + "%");
            $("#perMemory_" + hostid).html(memory + "%");

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
            disk = 100 - value;

            if (disk == 100)
                disk = 0;
            disk = Math.floor(disk * 100) / 100;
            $("#perDisk_" + hostid).width(disk + "%");
            $("#perDisk_" + hostid).html(disk + "%");
            console.log("================================");
        }
    });

    /* 검색 */
    $("#searchText").keyup(function () {
        console.log(" CLICK searchText ");
        searchHostBtn();
    });

    $.unblockUI(blockUI_opt_all);
}

function searchHostBtn() {
    console.log(" CLICK searchHostBtn ");
    //$("#searchText").keyup();
    /*var inputText = $("#searchText").val();
     console.log(" searchHostBtn 입력 Text : " + inputText);*/

    var input;
    var filter;
    var table;
    var tr;
    var td;

    input = $("#searchText").val();
    console.log(" input : " + input);
    filter = input.toLowerCase();
    console.log(" filter : " + filter);
    table = document.getElementById("hostInfoList");
    tr = table.getElementsByTagName("tr");
    console.log(" tr Cnt : " + tr.length);

    for (var i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            if (td.innerHTML.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
                console.log(" OK ");
            } else {
                tr[i].style.display = "none";
                console.log(" FAIL ");
            }
        }
    }
}
