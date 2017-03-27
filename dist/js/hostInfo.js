//host 정보 호출
var hostInfoView = function() {
    console.log(">>>>> IN function hostInfoView <<<<<");
    zbxApi.host.get().done(function(data, status, jqXHR) {
        var host_data = zbxApi.host.success(data);
        var tagId = '';
        var tagText = '';
        var tagText2 = '';

        $.each(host_data.result, function(k, v) {
            var hostid = v.hostid;
            tagText = '';
            tagText2 = '';
            tagId = "host_" + v.hostid;
            tagText = '<li><a href="#" id="' + tagId + '"><i class="fa fa-bar-chart"></i>';
            tagText += v.host;
            tagText += '</a><ul class="treeview-menu" id="' + tagId + '_performlist"></ul></li>';
            $("#serverlist").append(tagText);

            tagText2 += '<li><a class="treeview-menu" href="#" id="info_' + v.hostid + '"><i class="fa fa-bar-chart"></i>요약</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="cpu_' + v.hostid + '"><i class="fa fa-bar-chart"></i>CPU</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="memory_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Memory</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="process_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Process</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="disk_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Disk</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="traffic_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Traffic</a></li>';
            tagText2 += '<li><a class="treeview-menu" href="#" id="configure_' + v.hostid + '"><i class="fa fa-bar-chart"></i>임계치 설정</a></li>';

            $("#" + tagId + "_performlist").append(tagText2);

            $("#info_" + hostid).click(function() { /* 서버 정보 요약 */
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

                zbxApi.serverViewGraph.get(hostid, "system.cpu.util[,system]").then(function(data) {
                    serverCpuSystem = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "system.cpu.util[,user]");
                }).then(function(data) {
                    serverCpuUser = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "system.cpu.util[,iowait]");
                }).then(function(data) {
                    serverCpuIoWait = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "system.cpu.util[,steal]");
                }).then(function(data) {
                    serverCpuSteal = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraphName.get(hostid, "Used memory(%)");
                }).then(function(data) {
                    serverMemoryUse = zbxApi.serverViewGraphName.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "vfs.fs.size[/,pused]");
                }).then(function(data) {
                    serverDiskUseRoot = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.in[eth0]");
                }).then(function(data) {
                    showServerDisk(serverDiskUseRoot, startTime);
                    serverTraInEth0 = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.out[eth0]");
                }).then(function(data) {
                    serverTraOutEth0 = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, "net.if.total[eth0]");
                }).then(function(data) {
                    serverTraTotalEth0 = zbxApi.serverViewGraph.success(data);
                    showDetailInfo(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime);

                    //page reloag
                    $("#reload_serverDetail").click(function() {
                        console.log(">>>>> reload_serverDetail <<<<<");
                        $(showDetailInfo(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime)).click();
                    });
                });

                processView(hostid, startTime);

                zbxApi.serverViewHost.get(hostid).done(function(data, status, jqXHR) {
                    var server_host = zbxApi.serverViewHost.success(data);
                    var serverTitle = '';
                    var serverIP = '';
                    var serverOS = '';
                    var serverName = '';
                    var serverAgentVersion = '';

                    $.each(server_host.result, function(k, v) {
                        serverTitle = v.host;
                        serverIP = v.interfaces[0].ip;
                        serverOS = v.inventory.os;
                        serverName = v.name;
                        serverAgentVersion = zbxSyncApi.allServerViewItem(hostid, "agent.version").lastvalue; //agent.version

                        serverOverViewInfo(serverTitle, serverIP, serverOS, serverName, serverAgentVersion);
                    })
                });

                EventListView(hostid);

                //page reloag
                $("#reload_serverOverView").click(function() {
                    console.log(">>>>> reload_serverOverView <<<<<");
                    $(allServerViewHost()).click();
                });

                $(function($) {
                    $('#reload_serverOverView_selecter').change(function() {
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
                $("#reload_serverOverInfo").click(function() {
                    console.log(">>>>> reload_serverOverInfo <<<<<");
                    $("#info_" + hostid).click();
                });

                $(function($) {
                    $('#reload_serverOverInfo_selecter').change(function() {
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

            $("#cpu_" + hostid).click(function() { //CPU
            	currentHostId = v.hostid;
                $("#btn_cpu.btn").off().on('click', function() {
                	offTimer();
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                    cpuStatsView(v.hostid,startTime);
                });

                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                $("[id^=base]").hide();
                $("#base_cpuinfo").show();
                $("#cpu_hostid").html(v.hostid);
                cpuStatsView(v.hostid,startTime);
            });

            $("#memory_" + hostid).click(function() { //Memory
            	currentHostId = v.hostid;
                $("#btn_mem.btn").off().on('click',function() {
                	offTimer();
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                    callApiForMem(v.hostid,startTime);
                });

                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                $("[id^=base]").hide();
                $("#base_memoryInfo").show();
                $("#mem_hostid").html(v.hostid);
                callApiForMem(v.hostid,startTime);
            });

            $("#process_" + hostid).click(function() { //Process
            	offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                currentHostId = v.hostid;
                $.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_processInfo").show();
                procUsageView(v.hostid, startTime);
            });

            $("#disk_" + hostid).click(function() { //Disk
                console.log(">>>>> IN clickDiskView <<<<<");
                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR) / 1000);
                currentHostId = v.hostid;
                $.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_processInfo").show();
                diskUsageView(v.hostid, startTime);
            });

            $("#traffic_" + hostid).click(function() {
                console.log(">>>>> IN clickNetworkView <<<<<");
                offTimer();
                var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR / 1000));
                currentHostId = v.hostid;
               // $.blockUI(blockUI_opt_all);
                $("[id^=base]").hide();
                $("#base_networkInfo").show();
                networkUsageView(v.hostid, startTime);
            });

            $("#" + tagId).click(function() {
                $("[id^=base]").hide();
                //$("#base_hostinfo").show();
                //hostinfoView();
            });

            $("#configure_" + v.hostid).click(function () { //임계치 설정
            	offTimer();
            	if(slider != null){
            		$("#slider").empty();
            		$("#slider22").empty();
            		slider = null;
            		slider22 = null;
            	}

                $("[id^=base]").hide();
                $("#base_configure").show();
                currentHostId = v.hostid;
                
                $("input:checkbox").unbind("click").bind('click', function() {
                	var targetId = $(this).parent().nextAll("div")[0].id;
                    console.log(targetId);
                    if( $(this).prop('checked') ) {
                    	$("#" + targetId).css("pointer-events","auto");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value_disable").attr("class","d3slider-rect-value");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value2_disable").attr("class","d3slider-rect-value2");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value3_disable").attr("class","d3slider-rect-value3");

                    }else {
                    	$("#" + targetId).css("pointer-events","none");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value").attr("class","d3slider-rect-value_disable");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value2").attr("class","d3slider-rect-value2_disable");
                    	$("#" + targetId + " rect").filter(".d3slider-rect-value3").attr("class","d3slider-rect-value3_disable");
                    }
                });

                $("#btnCancelTrigger").unbind("click").bind("click",function(){
                	$("#configure_" + currentHostId).trigger('click');
                });

                $("#btnSaveTrigger").unbind("click").bind("click",function() {
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

                	$(".hostName").each(function(){
                		hostName.push($(this).text());
                	});

                	$(".itemKey").each(function(){
                		itemKey.push($(this).text());
                	});

                	$(".warnValue").each(function(){
                		warnValue.push($(this).text());
                	});

                	$(".highValue").each(function(){
                		highValue.push($(this).text());
                	});

                	$(".warnTriggerId").each(function(){
                		warnTriggerId.push($(this).text());
                	});

            		$(".highTriggerId").each(function(){
            			highTriggerId.push($(this).text());
            		});


            		 $(".alertCheck:checked").each(function(){
            			console.log($(this).val());
            			enableCheckBox.push($(this).val());
            		 });

            		var apiCallCnt = 0;
            		for(var i=0; i<$(".warnValue").length; ++i){

            			if((itemKey[i].indexOf("cpu") != -1 && $("input[name=cpuAlert]").prop('checked') == true) || (itemKey[i].indexOf("memory") != -1 && $("input[name=memAlert]").prop('checked') == true)){
            				warnExpression = "{" + hostName[i] + ":" + itemKey[i] + ".last()}>=" + warnValue[i] + " and {" + hostName[i] + ":" + itemKey[i] + ".last()}<" + highValue[i];
            	            highExpression = "{" + hostName[i] + ":" + itemKey[i] + ".last()}>=" + highValue[i];
            	             zbxApi.updateTrigger.update(warnTriggerId[i], warnExpression).then(function(data){
            	            	 console.log(zbxApi.updateTrigger.success(data));
            	             });

            	             zbxApi.updateTrigger.update(highTriggerId[i], highExpression).then(function(data){
            	            	 console.log(zbxApi.updateTrigger.success(data));
            	             });

            	             zbxApi.enableTrigger.enable(warnTriggerId[i], "0").then(function(data){
            	            	 console.log(zbxApi.enableTrigger.success(data));
            	             });

            	             zbxApi.enableTrigger.enable(highTriggerId[i], "0").then(function(data){
            	            	 console.log(zbxApi.enableTrigger.success(data));
            	            	 apiCallCnt++;
            	            	 if(apiCallCnt==$(".warnValue").length){
            	            		 $.unblockUI(blockUI_opt_all);
            	            	 }
            	             });
            			}else if((itemKey[i].indexOf("cpu") != -1 && $("input[name=cpuAlert]").prop('checked') != true) || (itemKey[i].indexOf("memory") != -1 && $("input[name=memAlert]").prop('checked') != true)){
            				zbxApi.enableTrigger.enable(warnTriggerId[i], "1").then(function(data){
            	            	 console.log(zbxApi.enableTrigger.success(data));
            	            });

            				zbxApi.enableTrigger.enable(highTriggerId[i], "1").then(function(data){
            	            	 console.log(zbxApi.enableTrigger.success(data));
            	            	 apiCallCnt++;
            	            	 if(apiCallCnt==$(".warnValue").length){
            	            		 $.unblockUI(blockUI_opt_all);
            	            	 }
            	            });
            			}

                	}
                });


                alertSettingView(v.hostid);

            });

        })
    }).fail(function() {
        console.log("dashboardView : Network Error");
        alertDiag("Network Error");
    }).always(function() {
        $(".info-box-content").unblock(blockUI_opt_el);
    });
};
