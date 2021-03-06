$(document).ready(function() {
    if (typeof localStorage == "undefined") {
        window.alert("This browser does not support.");
        return;
    }

    var select = $("select#color");
    select.change(function(){
        var select_name = $(this).children("option:selected").text();
        $(this).siblings("label").text(select_name);
    })

    $("#zabirepoVersion").text(zabirepo.VERSION);

    // TODO 保存されたセッションIDでログインする
    // var zbxsession = db.get("zbxsession");
    // if (zbxsession !== null) {
    // server.authid = zbxsession;
    //
    // $("#top_login").hide();
    // $(".body").removeClass("login-page");
    // $("#top_contents").show();
    // int.ready();
    // }

    $("#submit_login").click(function() {
        $("#login_box").hide();
        int.ready();
    });

    $("#base_dashboard").load("base_dashboard.html");
    $("#base_eventList").load("base_eventList.html");
    $("#base_graph").load("base_graph.html");
    $("#base_setting").load("base_setting.html");
    $("#base_cpuinfo").load("base_cpuinfo.html");

    $("#base_server").load("base_server.html"); // 전체 서버 상태 2017-01-02
    $("#base_serverInfo").load("base_serverInfo.html"); //서버 정보 요약 2017-01-11
    $("#base_memoryInfo").load("base_memoryInfo.html"); // 메모리 통계 2017-01-18
    $("#base_processInfo").load("base_processInfo.html"); // 메모리 통계 2017-01-18

    $("#base_diskInfo").load("base_diskInfo.html"); //디스크 통계
    $("#base_networkInfo").load("base_networkInfo.html"); //네트워크통계
    $("#base_configure").load("base_configure.html"); //네트워크통계

    //2017.12.08 아이템, 트리거 설정
    $("#base_serverItem").load("base_itemList.html");
    $("#base_itemNew").load("base_itemNew.html");
    $("#base_itemUpdate").load("base_itemUpdate.html");

    //2018.04.01
    $("#base_dashboardEventList").load("base_dashboardEventList.html");

});

var LONGTIME_ONEHOUR = 3600000;
var LONGTIME_ONEDAY = 86400000;
var HISTORY_TYPE = {
    "FLOAT": 0,
    "CHARACTER": 1,
    "LOG": 2,
    "UNSIGNEDINT": 3,
    "TEXT": 4
};
var PAGE_RELOAD_TIME = 60000;
var TIMER_CPU_USAGE = null;
var TIMER_CPU_LOADAVG = null;
var TIMER_CPU_PROCTBL = null;
var TIMER_ARR = [];
var slider, slider22 = null;
var currentHostId = null;
var chart_1, event_1, point_1, GLOBAL_INDEX;

var int = {
    ready: function() {
        lastPeriod = 3600;
        options.username = $("#inputUser").val();
        options.password = $("#inputPasswd").val();

        // for API Login
        server = new $.jqzabbix(options);
        server.getApiVersion().then(function() {
            return zbxApi.auth.get();
        }, function() {
            $.unblockUI(blockUI_opt_all);
            alertDiag(server.isError);
        }).then(function(data) {
            return zbxApi.auth.success(data);
        }, function(data) {
            alertDiag(data.error.data);
            // end API Login
        }).then(function() {
            // for Dashboard
            $.blockUI(blockUI_opt_all);
            $("#top_login").hide();
            $(".body").removeClass("login-page");
            $("#top_contents").show();
            // for dashboard
            dashboardView();
            //int.dashboardView();
        }).then(function() {
            // for multiSelectHostGroup in setting
            int.createMultiSelectHostGroupNames();
        }).then(function() {
            // for suggest
            return zbxApi.itemNames.get_all();
        }).then(function(data, status, jqXHR) {
            zbxApi.itemNames.success_all(data);
        }).then(function() {
            // DOM event attach
            int.createEvents();
            $.unblockUI(blockUI_opt_all);
        }).then(function() {
            // for suggest
            //return zbxApi.getHost.get();
            //return zbxApi.getItem.get();
        }).then(function(data) {
            //zbxApi.getHost.success(data);
            //zbxApi.getItem.success(data);
        }).then(function(data) {
            $("#content-0, #content-1").mCustomScrollbar({
                theme:"light-3",
                scrollButtons:{enable:true}
            });

            $("#event_content-0").mCustomScrollbar({
                theme:"light-3",
                scrollButtons:{enable:true},
                callbacks: {
                    onTotalScroll: function(){
                        console.log(" onTotalScroll ");
                        eventListAppend();
                    }
                }
            });
            
            $("#summary_event_content-0").mCustomScrollbar({
                theme:"light-3",
                scrollButtons:{enable:true},
                callbacks: {
                    onTotalScroll: function(){
                        console.log(" onTotalScroll ");
                        hostSummaryEventListAppend();
                    }
                }
            });

            $("#dash-event-content-0").mCustomScrollbar({
                theme:"light-3",
                scrollButtons:{enable:true},
                callbacks: {
                    onTotalScroll: function(){
                        console.log(" onTotalScroll ");
                        dashEventListAppend();
                    }
                }
            });

            $("body").mCustomScrollbar({
                theme:"minimal"
            });
            hostInfoView(); //host 정보 호출
        });
    },

    createEvents: function() {
        // ##### Window resize #####
        var timer = false;
        $(window).resize(function() {
            if (timer !== false) {
                clearTimeout(timer);
            }
            timer = setTimeout(function() {
                // TODO スマホだとウインドウを動かす度にリロードしてしまうので保留
                // if ($("#base_graph").css("display") === "block")
                // {
                // int.createGraphTable();
                // }
            }, 200);
        });

        // ##### Menu Link #####
        var ret_settingCheck = int.settingCheck();
        if (ret_settingCheck === true) {
            int.createGraphMenu();
        }

        $("#menu_dashboard").click(function() {
            $("[id^=base]").hide();
            $("#base_dashboard").show();
            //int.dashboardView();
            dashboardView();
        });

        $("#menu_eventList").click(function() {
            $("[id^=base]").hide();
            $("#base_eventList").show();
            eventListView();
        });
        /*
         $("#menu_pivottable").click(function() {
         $("[id^=base]").hide();
         pivotDisplay();
         $("#base_event").show();
         $("#base_pivottable").show();
         });

         $("#menu_treemap").click(function() {
         $("[id^=base]").hide();
         pivotDisplay();
         $("#base_event").show();
         $("#base_treemap").show();
         });

         $("#menu_free").click(function() {
         $("[id^=base]").hide();
         pivotDisplay();
         $("#base_event").show();
         $("#base_free").show();
         });
         */

        $("#menu_setting").click(function() {
            $("[id^=base]").hide();
            $("#base_setting").show();
        });

        $("#groupSelect_li").click(function() {
            $("#contents_top > div").hide();
            $("#graph").show();
        });

        $("#groupSelect li a").click(function() {
            $("#contents_top > div").hide();
            $("#graph").show();

            var targetPeriod = eval(db.get("lastPeriod"));
            var menuGroup = $(this).attr("id");
            createGraphTable(targetPeriod, menuGroup);
        });

        $("#menu_setting").click(function() {
            $("#contents_top > div").hide();
            $("#form_beforeDay").val(db.get("beforeDay"));
            $("#setting").show();
        });

        $("#menu_serverlist").click(function() {
            //int.serverInfoOverView();
        });

        /* 전체 서버 상태 2017-01-02 */
        $("#menu_overview").click(function() {
            allServerViewHost();
        });

        // ##### dashboard #####
        $("#reload_dashboard").click(function() {
            int.dashboardView();
        });

        $(function($) {
            $('#reload_dashboard_selecter').change(function() {
                var selectVal = $(this).val();
                if (selectVal != 0) {
                    $("#reload_dashboard").attr({
                        "disabled": "disabled"
                    });
                    reloadTimer(true, selectVal);
                } else {
                    $("#reload_dashboard").removeAttr("disabled");

                    reloadTimer(false);
                }
            });
        });

        // ##### events #####
        var filterDisp = {
            on: function(labelName) {
                $("#label_" + labelName).removeClass("label-info").addClass("label-warning").text("Filter ON");
                alertFade("#alert_" + labelName);
            },

            off: function(labelName) {
                $("#label_" + labelName).removeClass("label-warning").addClass("label-info").text("Filter OFF");
                alertFade("#alert_" + labelName);

            }
        };

        $("#save_event_histogram").click(function() {
            db.set("event_histogram", db.get("event_histogram_tmp"));
            filterDisp.on("event_histogram");
        });

        $("#clear_event_histogram").click(function() {
            db.remove("event_histogram");
            filterDisp.off("event_histogram");
            pivotDisplay();
        });

        $("#save_event_pivot").click(function() {
            db.set("event_pivot", db.get("event_pivot_tmp"));
            filterDisp.on("event_pivot");
        });

        $("#clear_event_pivot").click(function() {
            db.remove("event_pivot");
            filterDisp.off("event_pivot");
            pivotDisplay();
        });

        $("#save_event_treemap").click(function() {
            db.set("event_treemap", db.get("event_treemap_tmp"));
            filterDisp.on("event_treemap");
        });

        $("#clear_event_treemap").click(function() {
            db.remove("event_treemap");
            filterDisp.off("event_treemap");
            pivotDisplay();
        });

        $("#save_event_free").click(function() {
            db.set("event_free", db.get("event_free_tmp"));
            filterDisp.on("event_free");
        });

        $("#clear_event_free").click(function() {
            db.remove("event_free");
            filterDisp.off("event_free");
            pivotDisplay();
        });

        // ##### graphs #####
        $("#reflesh_graph").click(function() {
            int.createGraphTable();
        });

        $("#periodSelect button").click(function() {
            $(this).addClass("active").siblings().removeClass("active");
            switch ($("#periodSelect button").index(this)) {
                case 0:
                    lastPeriod = 3600;
                    int.createGraphTable();
                    break;
                case 1:
                    lastPeriod = 3600 * 2;
                    int.createGraphTable();
                    break;
                case 2:
                    lastPeriod = 3600 * 3;
                    int.createGraphTable();
                    break;
                case 3:
                    lastPeriod = 3600 * 6;
                    int.createGraphTable();
                    break;
                case 4:
                    lastPeriod = 3600 * 12;
                    int.createGraphTable();
                    break;
                case 5:
                    lastPeriod = 3600 * 24;
                    int.createGraphTable();
                    break;
                case 6:
                    lastPeriod = 3600 * 24 * 3;
                    int.createGraphTable();
                    break;
                case 7:
                    lastPeriod = 3600 * 24 * 7;
                    int.createGraphTable();
                    break;
                case 8:
                    lastPeriod = 3600 * 24 * 14;
                    int.createGraphTable();
                    break;
                case 9:
                    lastPeriod = 3600 * 24 * 30;
                    int.createGraphTable();
                    break;
                case 10:
                    lastPeriod = 3600 * 24 * 90;
                    int.createGraphTable();
                    break;
                case 11:
                    lastPeriod = 3600 * 24 * 180;
                    int.createGraphTable();
                    break;
                case 12:
                    lastPeriod = 3600 * 24 * 365;
                    int.createGraphTable();
                    break;
            }
        });

        // ##### Setting #####
        // ##### Setting => events
        $("#submit_form_beforeDay").click(function() {

            if ($("#form_beforeDay").val() === "") {
                alertDiag("Setting Save Error");
                return;
            }

            db.set("beforeDay", $("#form_beforeDay").val());
            alertFade("#alert_form_beforeDay");
        });

        $("#cancel_form_beforeDay").click(function() {
            $("#form_beforeDay").val(db.get("beforeDay"));
            alertFade("#alert_form_beforeDay");
        });

        // ##### Setting => graphs
        $('a[href="#tab_graph_setting"]').click(function() {
            int.settingTabGraph();
        });

        $(document).on("click", ".addList", function() {
            $("#graph_setting-tbody > tr").eq(0).clone().insertAfter($(this).parent().parent());
            setting.graphAutocomp();
            setting.graphCheckRowCount();
        });

        $(document).on("click", ".removeList", function() {
            $(this).parent().parent().remove();
            setting.graphAutocomp();
            setting.graphCheckRowCount();

        });

        $("#submit_graph_setting").click(function() {
            // keySetting
            var itemKeys = [];
            $("#graph_setting-tbody > tr").each(function() {
                var input_key = $(this).find(".input_zbx_key").val();

                if ($(this).find(".input_zbx_split").prop("checked")) {
                    var input_split = 1;
                } else {
                    var input_split = 0;
                }

                if (input_key !== "") {
                    itemKeys.push({
                        "search_key": input_key,
                        "split_flag": input_split
                    });
                }
            });

            if (Object.keys(groupNames).length === 0 || itemKeys == null || itemKeys.length === 0) {
                alertDiag("Setting Save Error");
                return;
            }

            db.set("groupNamesArray", sortObjectStr(groupNames, "groupName"));
            db.set("keyNamesArray", itemKeys);

            int.createGraphMenu();
            int.settingTabGraph();
            alertFade("#alert_graph_setting");
        });

        $("#cancel_graph_setting").click(function() {
            var ret_settingCheck = int.settingCheck();
            if (ret_settingCheck === true) {
                int.createGraphMenu();
            }
            int.settingTabGraph();
            alertFade("#alert_graph_setting");
        });

        // ##### Setting => etc
        $("#allClear").click(function() {
            localStorage.clear();
            infoDiag("Success:Setting All Clear");
        });

        $("#export").click(function() {
            var blob = new Blob([content], {
                "type": "application/x-msdownload"
            });

            window.URL = window.URL || window.webkitURL;
            $("#" + id).attr("href", window.URL.createObjectURL(blob));
            $("#" + id).attr("download", "tmp.txt");

            var data = JSON.stringify(tasks);
            var a = document.createElement('a');
            a.textContent = 'export';
            a.download = 'tasks.json';
            a.href = window.URL.createObjectURL(new Blob([data], {
                type: 'text/plain'
            }));
            a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

            var exportLink = document.getElementById('export-link');
            exportLink.appendChild(a);
        });

        $("#import").click(function() {
            infoDiag("Success:Setting Import");
        });

        // Logout
        $("#log-out").click(function() {
            $.blockUI(blockUI_opt_all);
            db.remove("zbxsession");
            jQuery.getScript("js/zabirepo-param.js");

            $(".body").addClass("login-page");
            $("#top_contents").hide('fade', '', 500, function() {
                $("#top_login").show('fade', '', 500, function() {
                    location.reload($.unblockUI(blockUI_opt_all));
                });
            });
        });

        // 2017.03.08 - CUSTOM Chart Event 
        $(".btn_ExportChart").off().on('click',function(){
            var chartId = $(this).val();
            $('#selectChartOutOption').lightbox_me({
                centered: true,
                closeSelector: ".close",
                onLoad: function() {
                    $('#selectChartOutOption').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
                    console.log(chartId);
                    $('#selectedChartId').text(chartId);
                },
                overlayCSS:{background: 'white', opacity: .8}
            });
        });

        $(".btn_printChart").off().on('click',function(){
            var chartId = $(this).val();

            for(var i=0; i<Highcharts.charts.length; ++i){
                if(typeof Highcharts.charts[i] != "undefined" && Highcharts.charts[i].renderTo.id == chartId){
                    Highcharts.charts[i].print();
                }
            }
        });

        // 2017.03.13 - CUSTOM Chart Event
        $(".btn_reloadChart").off().on('click',function(){
            var chartId = $(this).val();
            console.log("다시 불러오기 : " + chartId);

            for(var i=0; i<Highcharts.charts.length; ++i){
                if(typeof Highcharts.charts[i] != "undefined" && Highcharts.charts[i].renderTo.id == chartId){
                    Highcharts.charts[i].reloadId();
                }
            }
        });

    },

    createGraphMenu: function() {
        $("#menu_group_top").empty();
        $("#menu_item_top").empty();

        var groupNames = db.get("groupNamesArray");
        var keyNames = db.get("keyNamesArray");

        var groupNames_array = [];
        $.each(groupNames, function(index, elem) {
            groupNames_array.push(elem.groupName);
        });
        groupNames_array.sort();

        $.each(groupNames_array, function(index, elem) {
            $('<li><p><a class="menu_group"><i class="fa"></i><font size="2">' + elem + '</font></a></p></li>').appendTo("#menu_group_top");
        });

        $.each(keyNames, function(index, elem) {
            $('<li><p><a class="menu_item" data-splitFlag="' + elem.split_flag + '"><i class="fa"></i><font size="2">' + elem.search_key + '</font></a></li>').appendTo("#menu_item_top");

            $("#menu_item_top li:last-child").data("split_flag2", elem.split_flag);
        });

        $(document).off("click", ".menu_group");
        $(document).on("click", ".menu_group", function() {
            var i = 0;
            if (i === 0) {
                int.createGraphArray(this.text, "group");
                i++;
            }
        });

        $(document).off("click", ".menu_item");
        $(document).on("click", ".menu_item", function() {
            var i = 0;
            if (i === 0) {
                int.createGraphArray(this.text, "item");
                i++;
            }
        });
    },

    createGraphArray: function(clickText, type) {
        var kickCount = 0;
        var endCount = 0;
        resultObj = [];
        graphLabel = clickText;

        if (type === "group") {
            var keyNames = db.get("keyNamesArray");
            $.each(keyNames, function(k_key, k_value) {

                var jqXHR = zbxApi.itemIDs.get(clickText, k_value.search_key);
                jqXHR.done(function(data, status, jqXHR) {
                    endCount++;
                    if (data.result.length !== 0) {
                        var resultMap = {
                            rpcid: data.id,
                            data: data.result,
                            split: k_value.split_flag,
                        };
                        resultObj.push(resultMap);
                    }

                    if (kickCount == endCount) {
                        resultObj = sortObject(resultObj, "rpcid");
                        int.createGraphTable();
                    }
                });
                kickCount++;
            });

        } else { // for item click
            var groupNames = db.get("groupNamesArray");

            $.each(groupNames, function(g_key, g_value) {
                var jqXHR = zbxApi.itemIDs.get(g_value.groupName, clickText);
                jqXHR.done(function(data, status, jqXHR) {
                    endCount++;
                    if (data.result.length !== 0) {
                        var resultMap = {
                            rpcid: data.id,
                            data: data.result,
                            split: 1,

                        };
                        resultObj.push(resultMap);
                    }

                    if (kickCount == endCount) {
                        resultObj = sortObject(resultObj, "rpcid");
                        int.createGraphTable();
                    }
                });
                kickCount++;
            });
        }
    },
    createGraphTable: function() {
        // TODO ホスト別に選択可能にする
        // $("#multiSelectSample1").multiselect({
        // enableFiltering : true,
        // onSelectAll : true,
        // maxHeight : 250
        // });
        //
        // $('#multiSelectSample1').multiselect('selectAll', true);
        // $('#multiSelectSample1').multiselect('updateButtonText');

        // TODO タイムピッカーを付ける

        // var graphtype = '0';
        // var graphWidth = '700';

        $("[id^=base]").hide();
        $('#base_graph').show();

        $('#table').empty();
        $("#reportName").text("Display Report ： 【 " + graphLabel + " 】");

        if (resultObj.length === 0) {
            $('<div class="center-block"><strong>Item is not found.</strong></div>').appendTo("#table");
            return;
        }

        // create uniq key
        var itemKeyTmp = [];
        $.each(resultObj, function(top_index, top_value) {
            $.each(top_value.data, function(second_index, second_value) {
                itemKeyTmp.push(second_value.key_);
            });
        });

        var itemKeyUniqArray = itemKeyTmp.filter(function(x, i, self) {
            return self.indexOf(x) === i;
        });
        // end create uniq key

        // split option check
        var itemKeys = [];
        $.each(resultObj, function(top_index, top_value) {
            if (top_value.split === 1) {
                $.each(itemKeyUniqArray, function(itemKeyUniq_index, itemKeyUniq_value) {
                    var itemKeysTmp = [];
                    $.each(top_value.data, function(second_index, second_value) {

                        if (itemKeyUniq_value === second_value.key_) {
                            itemKeysTmp.push(second_value.itemid);
                        }
                    });
                    if (itemKeysTmp.length !== 0) {
                        itemKeys.push(itemKeysTmp);
                    }
                });
            } else {
                var itemKeysTmp = [];
                $.each(top_value.data, function(second_index, second_value) {
                    itemKeysTmp.push(second_value.itemid);
                });
                if (itemKeysTmp.length !== 0) {
                    itemKeys.push(itemKeysTmp);
                }
            }
        });

        var i = 0;
        var addUrl = "";
        var trUrl = "";
        var blockCount;
        var width_val;

        var windowWidth = $(window).width();
        if (windowWidth > 1280) {
            blockCount = 2;
            width_val = "33%";
        } else if (windowWidth > 768) {
            blockCount = 1;
            width_val = "50%";
        } else {
            blockCount = 0;
            width_val = "100%";
        }

        if (itemKeys.length >= zabirepo.GRAPH_CELL_LIMIT) {
            $('<div class="text-center center-block graphCell graphLimit">The number of graphs has exceeded the limit. (graphs : ' + itemKeys.length + ' / limit : ' + zabirepo.GRAPH_CELL_LIMIT + ')</div>').appendTo("#table");
            return;
        }

        $("#graphCount").text("Display " + itemKeys.length + " of graph");

        $.each(itemKeys, function(top_index, top_value) {
            var first = 0;
            var itemUrl = "";

            if (top_value.length <= zabirepo.GRAPH_ITEM_LIMIT) {

                $.each(top_value, function(second_index, second_value) {
                    if (first !== 0) {
                        itemUrl = itemUrl + '&';
                    }

                    itemUrl = itemUrl + 'itemids%5B' + second_value + '%5D=' + second_value;
                    first = 1;
                });

                var srcUrl = "";
                var addUrl = "";
                var timestamp = new Date().getTime();
                var srcUrl = graphURL + '?period=' + lastPeriod + '&height=' + zabirepo.GRAPH_HEIGHT + '&width=' + zabirepo.GRAPH_WIDTH + '&type=' + zabirepo.GRAPH_TYPE + '&batch=1' + '&' + itemUrl + '&' + timestamp;

                var addUrl = '<div><img class="img-thumbnail img-responsive graphCell" data-action="zoom" src=' + srcUrl + '>';
                $(addUrl).appendTo("#table");

            } else {
                $('<div class="text-center center-block graphCell graphLimit">The number of items has exceeded the limit. (Items : ' + top_value.length + ' / limit : ' + zabirepo.GRAPH_ITEM_LIMIT + ')</div>').appendTo("#table");
            }

            if (i == blockCount) {
                $('<div class="graphSparater"></div>').appendTo("#table");
                i = 0;
            } else {
                i = i + 1;
            }
        });
        $(".graphCell").css('width', width_val);
    },

    dashboardView: function() {
        $(".info-box-content").block(blockUI_opt_el);

        $.when(zbxApi.alertTrigger.get(), zbxApi.unAckknowledgeEvent.get()).done(function(data_a, data_b) {
            zbxApi.alertTrigger.success(data_a[0]);
            zbxApi.unAckknowledgeEvent.success(data_b[0]);
            $("#lastUpdateDashboard").text(convTime());

        }).fail(function() {
            console.log("dashboardView : Network Error");
            alertDiag("Network Error");
        });
        int.dcCreate();
    },

    dcCreate: function() {
        // for SystemStatus
        zbxApi.triggerInfo.get().done(function(data, status, jqXHR) {

            var cf = crossfilter(zbxApi.triggerInfo.success(data));
            // Severity
            var dimSeverity = cf.dimension(function(d) {
                return d.severity;
            });
            var gpSeverity = dimSeverity.group().reduceCount();
            var chartSeverity = dc.pieChart('#chart_severity');
            chartSeverity.width(250).height(200).cx(160).radius(90).innerRadius(35).slicesCap(Infinity) // すべて表示
                .dimension(dimSeverity).group(gpSeverity).ordering(function(t) {
                return -t.value;
            }).legend(dc.legend());
            chartSeverity.label(function(d) {
                return d.key + ' : ' + d.value;
            });
            chartSeverity.render();

            // hostgroup
            var dimGroup = cf.dimension(function(d) {
                return d.group;
            });
            var gpGroup = dimGroup.group().reduceCount();
            var chartGroup = dc.rowChart('#chart_hostGroup');
            chartGroup.width(300).height(220).dimension(dimGroup).group(gpGroup).ordering(function(t) {
                return -t.value;
            }).legend(dc.legend());

            chartGroup.elasticX(1);
            // chartGroup.xAxis().ticks(1);
            chartGroup.label(function(d) {
                return d.key + ' : ' + d.value;
            });
            chartGroup.render();

            // host
            var dimHost = cf.dimension(function(d) {
                return d.host;
            });
            var gpHost = dimHost.group().reduceCount();
            var chartHost = dc.rowChart('#chart_host');
            chartHost.width(300).height(220).dimension(dimHost).group(gpHost).ordering(function(t) {
                return -t.value;
            }).legend(dc.legend());
            chartHost.elasticX(1);
            // chartHost.xAxis().ticks(10);
            chartHost.label(function(d) {
                return d.key + ' : ' + d.value;
            });
            chartHost.render();

            // event list
            var dimEventList = cf.dimension(function(d) {
                return d.description;
            });

            var tbl = dc.dataTable('#eventList');
            tbl.dimension(dimEventList).size(30).group(function(d) {
                return d.severity;
            }).columns([function(d) {
                return d.severity;
            }, function(d) {
                return d.status;
            }, function(d) {
                return d.lastchange;
            }, function(d) {
                return d.age;
            }, function(d) {
                return d.ack;
            }, function(d) {
                return d.host;
            }, function(d) {
                return d.description;
            }, function(d) {}]).render();

            tbl.on("postRedraw", function(tbl) {
                addDcTableColor();
            });
            addDcTableColor();

        });
    },

    createMultiSelectHostGroupNames: function() {
        zbxApi.multiSelectHostGroupNames.get().done(function(data, status, jqXHR) {
            $('#zbxGroup').empty();
            $.each(data.result, function(key, value) {
                $('#zbxGroup').append("<option value='" + value.groupid + "," + value.name + "'>" + value.name + "</option>");
            });

            $('#zbxGroup').multiSelect({
                selectableHeader: "<div class='custom-header'>Selectable Groups</div>",
                selectionHeader: "<div class='custom-header'>Selection Groups</div>",
                afterSelect: function(values) {
                    $.each(values, function(key, value) {
                        var add_value = value.split(",");
                        var addObj = {
                            groupid: add_value[0],
                            groupName: add_value[1]
                        };
                        groupNames.push(addObj);
                    });
                },
                afterDeselect: function(values) {
                    $.each(values, function(key, value) {
                        var del_value = value.split(",");
                        var del_target = del_value[0];
                        groupNames.some(function(v, i) {
                            if (v.groupid == del_target)
                                groupNames.splice(i, 1);
                        });
                    });
                }
            });

            $('#select-all-zbxGroup').click(function() {
                $('#zbxGroup').multiSelect('select_all');
                return false;
            });

            $('#deselect-all-zbxGroup').click(function() {
                $('#zbxGroup').multiSelect('deselect_all');
                return false;
            });

        }).fail(function() {
            console.log("createMultiSelectHostGroupNames : Network Error");
            alertDiag("Network Error");
        });
    },

    settingTabGraph: function() {
        // groupSetting
        $('#zbxGroup').multiSelect('refresh');

        if (db.get('groupNamesArray') == null) {
            groupNames = [];
        } else {
            groupNames = [];
            var groupNames_tmp = db.get('groupNamesArray');
            $.each(groupNames_tmp, function(index, value) {
                $('#zbxGroup').multiSelect('select', value.groupid + "," + value.groupName);
            });
        }

        var blockWidth;
        var windowWidth = $(window).width();
        if (windowWidth >= 1366) {
            blockWidth = 900;
        } else if (windowWidth >= 640) {
            blockWidth = 600;
        } else if (windowWidth < 640) {
            blockWidth = 280;
        }
        $(".ms-container").css("width", blockWidth);

        // itemSetting
        $("#graph_setting-tbody > tr").not(":first").remove();
        if (db.get("keyNamesArray") == null) {
            $("#graph_setting-tbody > tr").eq(0).clone().insertAfter($("#graph_setting-tbody > tr:last-child"));
        } else {
            var keyNames = db.get("keyNamesArray");
            $.each(keyNames, function(index, value) {
                $("#graph_setting-tbody > tr").eq(0).clone().insertAfter($("#graph_setting-tbody > tr:last-child"));
                $("#graph_setting-tbody .input_zbx_key:last").val(value.search_key);

                if (value.split_flag == 0) {
                    $(".input_zbx_split:last").prop("checked", false);
                }
            });
        }

        setting.graphAutocomp();
        setting.graphCheckRowCount();

        $("#graph_setting-tbody").sortable({
            tolerance: "pointer",
            distance: 1,
            cursor: "move",
            revert: true,
            handle: ".graph_setting-icon",
            scroll: true,
            helper: "original"
        });

        $("#graph_setting-tbody").bind('click.sortable mousedown.sortable', function(ev) {
            ev.target.focus();
        });

        $("#graph_setting-tbody").disableSelection();

    },
    settingCheck: function() {
        if (db.get("beforeDay") === null || db.get("beforeDay").length === 0) {
            db.set("beforeDay", "7");
            $("#form_beforeDay").val("7");

        }

        var groupNames = db.get("groupNamesArray");
        var keyNames = db.get("keyNamesArray");
        // if (groupNames === null || $.isEmptyObject(groupNames) === true || keyNames === null || $.isEmptyObject(keyNames) === true) {
        //     $("#form_beforeDay").val(db.get("beforeDay"));
        //     $("[id^=base]").hide();
        //     $("#base_setting").show();
        //     infoDiag("Please First Setting");
        //     return false;
        // }
        return true;
    }
};

function callApiForServerEvent(hostid) {
    return zbxSyncApi.serverViewTrigger(hostid);
}

function showProcessTable(finalProcArr, topProcessLastTime) {
    var maxRefValue;
    var processGaugeValue;
    var cpuProcessTbl = '';
    var MAX_PROCCOUNT = 13;

    cpuProcessTbl += "<thead>";
    cpuProcessTbl += "<tr class='display-none' role='row'>";
    cpuProcessTbl += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
    cpuProcessTbl += "<th class='sorting_disabled display-none' rowspan='1' colspan='1'></th>";
    cpuProcessTbl += "</tr>";
    cpuProcessTbl += "</thead>";
    cpuProcessTbl += "<tbody>";

    $.each(finalProcArr, function(k, v) {

        if (k < MAX_PROCCOUNT) {
            var procNameArr = '';
            var procName = v.procName;
            var processPercentValue = v.totalCpuVal.toFixed(1);

            if (k == 0) {
                maxRefValue = processPercentValue;
                processGaugeValue = 100;
            } else {
                processGaugeValue = (processPercentValue * 100) / maxRefValue;
            }

            cpuProcessTbl += "<tr role='row' class='odd'>";
            cpuProcessTbl += "<td class=' pt-xs pb-xs'><span class='name ellipsis' title='" + procName + "'>" + procName + "</span>";
            cpuProcessTbl += "<span class='bold value percent-text'>" + processPercentValue + "</span>";
            cpuProcessTbl += "<div class='progress-wrapper'><div class='progress' style='width:" + processGaugeValue + "%;'>";
            cpuProcessTbl += "<div class='progress-bar' role='progressbar' aria=valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width:100%;'></div>";
            cpuProcessTbl += "</div></div>";
            cpuProcessTbl += "</td>";
            cpuProcessTbl += "<td class=' display-none'>httpd</td>";
            cpuProcessTbl += "</tr>";
        }
    });
    cpuProcessTbl += "</tbody>";

    $("#processTime").text(topProcessLastTime);
    $("#cpuProcess").empty();
    $("#cpuProcess").append(cpuProcessTbl);
}

function type(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}
/*
 var pivotDisplay = function() {
 $.blockUI(blockUI_opt_all);
 var beforeDay = db.get("beforeDay");

 zbxApi.event.get().done(function(data, statusText, jqXHR) {
 var Latest_events = zbxApi.event.success(data);
 pivotMain(Latest_events, "event_histogram");
 pivotMain(Latest_events, "event_pivot");
 pivotMain(Latest_events, "event_treemap");
 pivotMain(Latest_events, "event_free");
 $.unblockUI(blockUI_opt_all);
 }).fail(function(jqXHR, statusText, errorThrown) {
 $.unblockUI(blockUI_opt_all);
 console.log("pivotDisplay : Network Error");
 alertDiag("Network Error");
 });

 };
 */
/*
 var pivotMain = function(Latest_events, event_type) {
 var derivers = $.pivotUtilities.derivers;
 var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers, $.pivotUtilities.d3_renderers);
 var dateFormat = $.pivotUtilities.derivers.dateFormat;
 var sortAs = $.pivotUtilities.sortAs;
 var event_conf = {
 renderers: renderers,
 menuLimit: 3000,
 rows: [""],
 cols: [""],
 vals: [""],
 exclusions: {
 "Status": ["OK"]
 },
 aggregatorName: "Count",
 rendererName: "",
 derivedAttributes: {
 "Year": dateFormat("Date", "%y"),
 "Month": dateFormat("Date", "%m"),
 "Day": dateFormat("Date", "%d"),
 "Hour": dateFormat("Date", "%H"),
 "Minute": dateFormat("Date", "%M"),
 "Second": dateFormat("Date", "%S"),
 "Day name": dateFormat("Date", "%w")
 },
 utcOutput: false,
 sorters: function(attr) {
 if (attr == "Day name") {
 return sortAs(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
 }
 if (attr == "Severity") {
 return sortAs(["Disaster", "High", "Average", "Warning", "Information", "Not Classfied"]);
 }
 if (attr == "Status") {
 return sortAs(["PROBLEM", "OK"]);
 }
 },
 hiddenAttributes: ["Date"],
 onRefresh: function(config) {
 db.set(event_type + "_tmp", config);
 $("#base_event").find(".pvtVal[data-value='null']").css("background-color", "palegreen");
 }
 };

 var event_obj = db.get(event_type);
 if (event_obj != null) {
 event_conf["rows"] = event_obj["rows"];
 event_conf["cols"] = event_obj["cols"];
 event_conf["vals"] = event_obj["vals"];
 event_conf["exclusions"] = event_obj["exclusions"];
 event_conf["aggregatorName"] = event_obj["aggregatorName"];
 event_conf["rendererName"] = event_obj["rendererName"];
 $("#label_" + event_type).removeClass("label-info").addClass("label-warning").text("Filter ON");
 } else {

 if (event_type == "event_histogram") {
 event_conf["rows"] = ["Severity"];
 event_conf["cols"] = ["Year", "Month", "Day"];
 event_conf["rendererName"] = ["Stacked Bar Chart"];
 } else if (event_type == "event_pivot") {
 event_conf["rows"] = ["Host", "Description"];
 event_conf["cols"] = ["Year", "Month", "Day"];
 event_conf["rendererName"] = ["Heatmap"];
 } else if (event_type == "event_treemap") {
 event_conf["rows"] = ["Description"];
 event_conf["rendererName"] = ["Treemap"];
 } else {
 // free
 }
 $("#label_" + event_type).removeClass("label-warning").addClass("label-info").text("Filter OFF");
 }

 $("#" + event_type).pivotUI(Latest_events, event_conf, {
 overwrite: "true"
 });

 $("#base_event").find(".pvtAggregator").css("visibility", "hidden");

 };
 */
var alertDiag = function(data) {
    $("#modal-alert-text").text(data);
    $('#modal-alert').modal('show');
};

var infoDiag = function(data) {
    $("#modal-info-text").text(data);
    $('#modal-info').modal('show');
};

var alertFade = function(target) {
    $(target).fadeIn(1000).delay(2000).fadeOut(1000);
};

var sortObject = function(object, key) {
    var sorted = [];
    var array = [];

    $.each(object, function(object_index, object_data) {
        array.push(object_data[key]);
    });

    array.sort(function(a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    });

    $.each(array, function(array_index, array_data) {
        $.each(object, function(object_index, object_data) {
            if (array_data === object_data[key]) {
                sorted.push(object_data);
            }
        });
    });

    return sorted;
};

var sortObjectStr = function(object, key) {
    var sorted = [];
    var array = [];

    $.each(object, function(object_index, object_data) {
        array.push(object_data[key]);
    });

    array.sort();

    $.each(array, function(array_index, array_data) {
        $.each(object, function(object_index, object_data) {
            if (array_data === object_data[key]) {
                sorted.push(object_data);
            }
        });
    });
    return sorted;
};

var blockUI_opt_all_custom = {
    message: '<h4><img src="./dist/img/loading.gif" />　Please Wait...</h4>',
    fadeIn: 200,
    fadeOut: 200,
    css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: .5,
        color: '#fff'
    },
    overlayCSS: {
        backgroundColor: '#000',
        opacity: 0.1,
        cursor: 'wait'
    }
};

var blockUI_opt_all = {
    message: '<h4><img src="./dist/img/loading.gif" />　Please Wait...</h4>',
    fadeIn: 200,
    fadeOut: 200,
    css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: .5,
        color: '#fff'
    }
};

var blockUI_opt_el = {
    message: '<img src="./dist/img/loading.gif" />',
    fadeIn: 200,
    fadeOut: 200,

};

var db = {
    set: function(key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
    },
    get: function(key) {
        return JSON.parse(localStorage.getItem(key));
    },
    remove: function(key) {
        localStorage.removeItem(key);
    }
};

var setting = {
    graphAutocomp: function() {
        $(".input_zbx_key").autocomplete({
            source: itemKeyNamesUniqArray,
            autoFocus: false,
            delay: 100,
            minLength: 0
        });
    },
    graphCheckRowCount: function() {
        if ($(".removeList").length == 2) {
            $(".removeList").prop("disabled", true);
        } else {
            $(".removeList").prop("disabled", false);
        }
    }
};

var convTime = function(date) {
    if (date === undefined) {
        var d = new Date();
    } else {
        var d = new Date(date * 1000);
    }

    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
    var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
    var sec = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
    var date = year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;

    return date;
};

var convDeltaTime = function(lastchange) {
    var SECOND_MILLISECOND = 1000;
    var MINUTE_MILLISECOND = 60 * SECOND_MILLISECOND;
    var HOUR_MILLISECOND = 60 * MINUTE_MILLISECOND;
    var DAY_MILLISECOND = 24 * HOUR_MILLISECOND;

    var nowUtime = new Date().getTime();
    var diffTime = nowUtime - (lastchange * 1000);
    var deltaDay = Math.floor(diffTime / DAY_MILLISECOND);
    var diffDay = diffTime - (deltaDay * DAY_MILLISECOND);
    var deltaHour = Math.floor(diffDay / HOUR_MILLISECOND);
    var diffHour = diffDay - (deltaHour * HOUR_MILLISECOND);
    var deltaMin = Math.floor(diffHour / MINUTE_MILLISECOND);
    var diffMin = diffHour - (deltaMin * MINUTE_MILLISECOND);
    var deltaSec = Math.floor(diffMin / SECOND_MILLISECOND);

    var deltaDate = "";
    if (deltaDay !== 0) {
        deltaDate += deltaDay + "d ";
    }
    if (deltaHour !== 0) {
        deltaDate += deltaHour + "h ";
    }
    if (deltaMin !== 0) {
        deltaDate += deltaMin + "m ";
    }
    if (deltaSec !== 0 && deltaDay === 0) {
        deltaDate += deltaSec + "s";
    }
    return deltaDate;

};


var convertTime = function(duration){
	if(duration < 0 ){
		duration = 10;
	}
	//console.log("duration : " + duration);
	var hour = Math.floor(duration / 3600);
	var temp = duration%3600;
	var minute = Math.floor(temp / 60);
	var sec = Math.floor(temp % 60);
	var returnVal = "";
		
	if(duration >= 3600){
		returnVal = hour + "시간 " + minute + "분 " + sec + "초";
	}else if(duration >= 60){
		returnVal = minute + "분 " + sec + "초";
	}else{
		returnVal = sec + "초";
	}
	
	return returnVal;
}


var reloadTimer = function(flag, interval) {
    if (flag === true) {
        clearInterval(zabirepo.reloadId);
        var counter = interval;
        $("#countDownTimer").text(interval);

        zabirepo.reloadId = setInterval(function() {
            counter--;
            $("#countDownTimer").text(counter);

            if (counter === 0) {
                int.dashboardView();
                counter = interval;
            }

        }, 1000);
    } else {
        clearInterval(zabirepo.reloadId);
        $("#countDownTimer").text("");
    }
};

var addDcTableColor = function() {
    $.each($(".dc-table-column._1"), function(index, value) {
        if (this.textContent === "problem") {
            $(this).css('color', 'Red');
            $(this).addClass('flash');
        } else {
            $(this).css('color', 'blue');
            $(this).addClass('flash');
        }
    });

    $.each($(".dc-table-column._4"), function(index, value) {
        if (this.textContent === "Unacked") {
            $(this).css('color', 'Red');
            $(this).addClass('flash');
        } else {
            $(this).css('color', 'green');
            $(this).addClass('flash');
        }
    });

    $.each($(".dc-table-column._0"), function(index, value) {
        switch (this.textContent) {
            case "not classified":
                $(this).css('background-color', '#97AAB3');
                break;
            case "information":
                $(this).css('background-color', '#7499FF');
                break;
            case "warning":
                $(this).css('background-color', '#FFC859');
                break;
            case "average":
                $(this).css('background-color', '#FFA059');
                break;
            case "high":
                $(this).css('background-color', '#E97659');
                break;
            case "disaster":
                $(this).css('background-color', '#E45959');
                break;
        }
    });
};

var leftm_go_tab_01 = function(val, mode){
    for(var i=1; i<5; i++){
        $("#leftmtab_0"+i).hide();
    }
    $("#leftmtab_0"+val).show();
};
