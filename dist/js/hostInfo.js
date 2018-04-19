//host 정보 호출
function hostInfoView() {
    console.log(">>>>> IN function hostInfoView <<<<<");
    zbxApi.host.get().done(function (data, status, jqXHR) {
        var host_data = zbxApi.host.success(data);
        var tagId = '';
        var tagText = '';
        var tagText2 = '';

        $.each(host_data.result, function (k, v) {
            var hostid = v.hostid;
            tagText = '';
            tagText2 = '';
            tagId = "host_" + v.hostid;
            tagText = '<li><a class="b2" href="#" id="' + tagId + '">';
            tagText += v.host;
            tagText += '</a><ul class="treeview-menu" id="' + tagId + '_performlist"></ul></li>';
            $("#serverlist").append(tagText);

            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="info_' + v.hostid + '">요약</a></li>';
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="cpu_' + v.hostid + '">CPU</a></li>';
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="memory_' + v.hostid + '">Memory</a></li>';
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="process_' + v.hostid + '">Process</a></li>';
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="disk_' + v.hostid + '">Disk</a></li>';
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="traffic_' + v.hostid + '">Traffic</a></li>';
            //tagText2 += '<li><a class="b3 treeview-menu" href="#" id="configure_' + v.hostid + '">임계치 설정</a></li>';
            /* 2017.12.08 메뉴명추가 */
            tagText2 += '<li><a class="b3 treeview-menu" href="#" id="serverItem_' + v.hostid + '">아이템 설정</a></li>';
            /*tagText2 += '<li><a class="b3 treeview-menu" href="#" id="serverItemNew">아이템 설정(NEW)</a></li>';*/
            /*tagText2 += '<li><a class="b3 treeview-menu" href="#" id="serverItemUpdate">아이템 설정(UPDATE)</a></li>';*/

            $("#" + tagId + "_performlist").append(tagText2);

            $("#info_" + hostid).click(function () { /* 서버 정보 요약 */
                console.log(">>>>> info_ reload_serverOverInfo <<<<<");
                $("[id^=base]").hide();
                $("#base_serverInfo").show();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);

                var serverCpuSystem = null;
                var serverCpuUser = null;
                var serverCpuIoWait = null;
                var serverCpuSteal = null;
                var serverDiskUseRoot = null;
                var serverMemoryUse = null;
                var serverTraInEth0 = null;
                var serverTraOutEth0 = null;
                var serverTraTotalEth0 = null;

                zbxApi.getItem.get(hostid, "system.cpu.util[,system]").then(function (data) {
                    serverCpuSystem = zbxApi.getItem.success(data);
                }).then(function () {
                    return zbxApi.getItem.get(hostid, "system.cpu.util[,user]");
                }).then(function (data) {
                    serverCpuUser = zbxApi.getItem.success(data);
                }).then(function () {
                    return zbxApi.getItem.get(hostid, "system.cpu.util[,iowait]");
                }).then(function (data) {
                    serverCpuIoWait = zbxApi.getItem.success(data);
                }).then(function () {
                    return zbxApi.getItem.get(hostid, "system.cpu.util[,steal]");
                }).then(function (data) {
                    serverCpuSteal = zbxApi.getItem.success(data);
                }).then(function () {
                    return zbxApi.getItem.get(hostid, "vm.memory.size[100-pavailable]");
                }).then(function (data) {
                    serverMemoryUse = zbxApi.serverViewGraphName.success(data);
                }).then(function () {
                    return zbxApi.serverViewGraph.get(hostid, "vfs.fs.size[/,pused]");
                }).then(function (data) {
                    serverDiskUseRoot = zbxApi.serverViewGraph.success(data);
                }).then(function () {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.in[eth0]");
                }).then(function (data) {
//                    showServerDisk(serverDiskUseRoot, startTime);
                    serverTraInEth0 = zbxApi.serverViewGraph.success(data);
                }).then(function () {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.out[eth0]");
                }).then(function (data) {
                    serverTraOutEth0 = zbxApi.serverViewGraph.success(data);
                }).then(function () {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.total[eth0]");
                }).then(function (data) {
                    serverTraTotalEth0 = zbxApi.serverViewGraph.success(data);
                    showDetailInfo(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime, hostid, serverDiskUseRoot);

                    //page reloag
                    $("#reload_serverDetail").click(function () {
                        console.log(">>>>> reload_serverDetail <<<<<");
                        $(showDetailInfo(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime, hostid, serverDiskUseRoot)).click();
                    });
                });

                //processView(hostid, startTime);

                //EventListView(hostid);

                //page reloag
                $("#reload_serverOverView").click(function () {
                    console.log(">>>>> reload_serverOverView <<<<<");
                    $(allServerViewHost()).click();
                });

                $(function ($) {
                    $('#reload_serverOverView_selecter').change(function () {
                        var selectVal = $(this).val();
                        if (selectVal != 0) {
                            $("#reload_serverOverView").attr({
                                "disabled": "disabled"
                            });
                        } else {
                            $("#reload_serverOverView").removeAttr("disabled");
                        }
                    });
                });

                //page reloag
                $("#reload_serverOverInfo").click(function () {
                    console.log(">>>>> reload_serverOverInfo <<<<<");
                    $("#info_" + hostid).click();
                });

                $(function ($) {
                    $('#reload_serverOverInfo_selecter').change(function () {
                        var selectVal = $(this).val();
                        if (selectVal != 0) {
                            $("#reload_serverOverInfo").attr({
                                "disabled": "disabled"
                            });
                        } else {
                            $("#reload_serverOverInfo").removeAttr("disabled");
                        }
                    });
                });

            });

            $("#cpu_" + hostid).click(function () { //CPU
                currentHostId = v.hostid;
                $("#btn_cpu.btn").off().on('click', function () {
                    offTimer();
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                    cpuStatsView(v.hostid, startTime);
                });

                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                $("[id^=base]").hide();
                $("#base_cpuinfo").show();
                $("#cpu_hostid").html(v.hostid);
                cpuStatsView(v.hostid, startTime);
            });

            $("#memory_" + hostid).click(function () { //Memory
                currentHostId = v.hostid;
                $("#btn_mem.btn").off().on('click', function () {
                    offTimer();
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                    callApiForMem(v.hostid, startTime);
                });

                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                $("[id^=base]").hide();
                $("#base_memoryInfo").show();
                $("#mem_hostid").html(v.hostid);
                callApiForMem(v.hostid, startTime);
            });

            $("#process_" + hostid).click(function () { //Process
                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                currentHostId = v.hostid;
                $.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_processInfo").show();
                procUsageView(v.hostid, startTime);
            });

            $("#disk_" + hostid).click(function () { //Disk
                console.log(">>>>> IN clickDiskView <<<<<");
                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                currentHostId = v.hostid;
                //$.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_diskInfo").show();
                diskUsageView(v.hostid, startTime);
            });

            $("#traffic_" + hostid).click(function () {
                console.log(">>>>> IN clickNetworkView <<<<<");
                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                currentHostId = v.hostid;
                // $.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_networkInfo").show();
                networkUsageView(v.hostid, startTime);
            });

            $("#" + tagId).click(function () {
                $("[id^=base]").hide();
                //$("#base_hostinfo").show();
                //hostinfoView();
            });

            $("#configure_" + v.hostid).click(function () { //임계치 설정
                offTimer();
                if (slider != null) {
                    $("#slider").empty();
                    $("#slider22").empty();
                    slider = null;
                    slider22 = null;
                }

                $("[id^=base]").hide();
                $("#base_configure").show();
                currentHostId = v.hostid;

                $("input:checkbox").unbind("click").bind('click', function () {
                    var targetId = $(this).parent().nextAll("div")[0].id;
                    console.log(targetId);
                    if ($(this).prop('checked')) {
                        $("#" + targetId).css("pointer-events", "auto");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value_disable").attr("class", "d3slider-rect-value");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value2_disable").attr("class", "d3slider-rect-value2");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value3_disable").attr("class", "d3slider-rect-value3");

                    } else {
                        $("#" + targetId).css("pointer-events", "none");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value").attr("class", "d3slider-rect-value_disable");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value2").attr("class", "d3slider-rect-value2_disable");
                        $("#" + targetId + " rect").filter(".d3slider-rect-value3").attr("class", "d3slider-rect-value3_disable");
                    }
                });

                $("#btnCancelTrigger").unbind("click").bind("click", function () {
                    $("#configure_" + currentHostId).trigger('click');
                });

                $("#btnSaveTrigger").unbind("click").bind("click", function () {
                    $.blockUI(blockUI_opt_all);
                    var warnTriggerId = null;
                    var warnExpression = null;
                    var highTriggerId = null;
                    var highExpression = null;
                    var hostName = new Array;
                    var itemKey = new Array;
                    var warnValue = new Array;
                    var highValue = new Array;
                    var highTriggerId = new Array;
                    var warnTriggerId = new Array;
                    var enableCheckBox = new Array;

                    $(".hostName").each(function () {
                        hostName.push($(this).text());
                    });

                    $(".itemKey").each(function () {
                        itemKey.push($(this).text());
                    });

                    $(".warnValue").each(function () {
                        warnValue.push($(this).text());
                    });

                    $(".highValue").each(function () {
                        highValue.push($(this).text());
                    });

                    $(".warnTriggerId").each(function () {
                        warnTriggerId.push($(this).text());
                    });

                    $(".highTriggerId").each(function () {
                        highTriggerId.push($(this).text());
                    });

                    $(".alertCheck:checked").each(function () {
                        console.log($(this).val());
                        enableCheckBox.push($(this).val());
                    });

                    var apiCallCnt = 0;
                    for (var i = 0; i < $(".warnValue").length; ++i) {

                        if ((itemKey[i].indexOf("cpu") != -1 && $("input[name=cpuAlert]").prop('checked') == true) || (itemKey[i].indexOf("memory") != -1 && $("input[name=memAlert]").prop('checked') == true)) {
                            warnExpression = "{" + hostName[i] + ":" + itemKey[i] + ".last()}>=" + warnValue[i] + " and {" + hostName[i] + ":" + itemKey[i] + ".last()}<" + highValue[i];
                            highExpression = "{" + hostName[i] + ":" + itemKey[i] + ".last()}>=" + highValue[i];
                            zbxApi.updateTrigger.update(warnTriggerId[i], warnExpression).then(function (data) {
                                console.log(zbxApi.updateTrigger.success(data));
                            });

                            zbxApi.updateTrigger.update(highTriggerId[i], highExpression).then(function (data) {
                                console.log(zbxApi.updateTrigger.success(data));
                            });

                            zbxApi.enableTrigger.enable(warnTriggerId[i], "0").then(function (data) {
                                console.log(zbxApi.enableTrigger.success(data));
                            });

                            zbxApi.enableTrigger.enable(highTriggerId[i], "0").then(function (data) {
                                console.log(zbxApi.enableTrigger.success(data));
                                apiCallCnt++;
                                if (apiCallCnt == $(".warnValue").length) {
                                    $.unblockUI(blockUI_opt_all);
                                }
                            });
                        } else if ((itemKey[i].indexOf("cpu") != -1 && $("input[name=cpuAlert]").prop('checked') != true) || (itemKey[i].indexOf("memory") != -1 && $("input[name=memAlert]").prop('checked') != true)) {
                            zbxApi.enableTrigger.enable(warnTriggerId[i], "1").then(function (data) {
                                console.log(zbxApi.enableTrigger.success(data));
                            });

                            zbxApi.enableTrigger.enable(highTriggerId[i], "1").then(function (data) {
                                console.log(zbxApi.enableTrigger.success(data));
                                apiCallCnt++;
                                if (apiCallCnt == $(".warnValue").length) {
                                    $.unblockUI(blockUI_opt_all);
                                }
                            });
                        }
                    }
                });

                /* 2017-12-08 아이템, 트리거 설정 */
                $("#serverItem_" + v.hostid).click(function () {
                    $.blockUI(blockUI_opt_all);

                    $("[id^=base]").hide();
                    $("#base_serverItem").show();

                    offTimer();
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                    list_ItemList(v.hostid);
                });

                /*$("#serverItemNew").click(function () {
                    $("[id^=base]").hide();
                    $("#base_itemNew").show();
                });

                $("#serverItemUpdate").click(function () {
                    $("[id^=base]").hide();
                    $("#base_itemUpdate").show();
                });*/
            });

        })
    }).fail(function () {
        console.log("dashboardView : Network Error");
        alertDiag("Network Error");
    }).always(function () {
        $(".info-box-content").unblock(blockUI_opt_el);
    });
}
