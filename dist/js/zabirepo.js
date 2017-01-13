$(document).ready(function () {
    if (typeof localStorage == "undefined") {
        window.alert("This browser does not support.");
        return;
    }

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

    $("#submit_login").click(function () {
        int.ready();
    });

    $("#base_dashboard").load("base_dashboard.html");
    $("#base_event").load("base_event.html");
    $("#base_graph").load("base_graph.html");
    $("#base_setting").load("base_setting.html");
    $("#base_hostinfo").load("base_hostinfo.html");

    $("#base_server").load("base_server.html"); // 전체 서버 상태 2017-01-02
    $("#base_serverInfo").load("base_serverInfo.html"); //서버 정보 요약 2017-01-11
});
/* 2017.01.11 zbxSyncApi 추가*/
var zbxSyncApi = {
    authid: "",

    auth: function () {
        var authInfo = {
            "jsonrpc": "2.0",
            "method": "user.login",
            "params": {
                "user": "Admin",
                "password": "P@ssw0rd"
            },
            "id": 1,
            "auth": null
        }
        var result = zbxSyncApi.callAjax(authInfo);
        authid = result.result;
    },

    /* 전체 서버 상태 2017-01-05 */
    allServerViewItem: function (hostId, key_) {
        var param = {
            "jsonrpc": "2.0",
            "method": "item.get",
            "params": {
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostId,
                "search": {"key_": key_}
            },
            "id": 1,
            "auth": authid
        }
        console.log(JSON.stringify(param));


        //console.log("param 123 : " + JSON.stringify(param));
        var result = zbxSyncApi.callAjax(param);
        console.log(JSON.stringify(result));
        return result.result[0];
    },

    /* 전체 서버 상태 2017-01-05 */
    allServerViewItemByName: function (hostId, name) {
        var param = {
            "jsonrpc": "2.0",
            "method": "item.get",
            "params": {
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostId,
                "search": {"name": name}
            },
            "id": 1,
            "auth": authid
        }
        console.log(JSON.stringify(param));

        //console.log("param 123 : " + JSON.stringify(param));
        var result = zbxSyncApi.callAjax(param);
        console.log(JSON.stringify(result));
        return result.result[0];
    },

    callAjax: function (param) {
        var result = "";
        $.ajax({
            async: false,
            type: 'POST',
            url: 'http://zabbix.oplab.co.kr/api_jsonrpc.php',
            dataType: 'json',
            contentType: "application/json-rpc; charset=UTF-8",
            data: JSON.stringify(param),
            success: function (data) {
                result = data;
            },
            error: function (request, textStatus, errorThrown) {
                alert("request : " + JSON.stringify(errorThrown));
                alert("error : " + textStatus);
            },
        })
        //console.log("callAjax :" + JSON.stringify(result));
        return result;
    }
}

zbxSyncApi.auth();

var zbxApi = {
    // for Test
    getHistory: {
        get: function (itemId, startTime) {
            var method = "history.get";
            var params = {
                "output": "extend",
                "history": 0,
                "sortfield": "clock",
                "sortorder": "ASC",
                "itemids": itemId,
                "time_from": startTime
                //"limit" : 72
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("getHistory data : " + data);
            //console.log(data);
            return data;
        }
    },

    getItem: {
        get: function (hostId, key_) {
            var method = "item.get";
            var params = {
                // "output" : "extend",
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostId,
                "search": {"key_": key_}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("getItem data : " + data);
            //console.log(data.result);
            //console.log(Object.keys(data.result).length);
            //console.log(data.result[0]);
            //console.log(data.result[0].hostid);

            $.each(data.result, function (k, v) {
                console.log(JSON.stringify(v));
                console.log(v.name + ", " + v.key_ + ", " + v.lastvalue);
                //("#infobox_alertTrigger").text(data.result);
            })
            return data;
        }
    },

    host: {
        get: function () {
            var method = "host.get";
            var params = {
                // "output" : "extend",
                "output": ["host"],
                "selectInterfaces": ["ip"],
                "selectInventory": ["name"]
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("host data : " + data);
            //console.log(data.result);
            //console.log(Object.keys(data.result).length);
            //console.log(data.result[0]);
            //console.log(data.result[0].hostid);

            $.each(data.result, function (k, v) {
                console.log("host JSON > " + JSON.stringify(v));
                console.log("host > " + v.hostid + ", " + v.host + ", " + v.interfaces[0].ip);
            })
            return data;
        }
    },

    /* 서버 정보 요약 - 이벤트 Table*/
    serOverviewTrigger: {
        get: function (hostid) {
            var method = "trigger.get";
            var params = {
                "output": ["description", "priority", "value", "lastchange"],
                "monitored": true,
                "skipDependent": true,
                "expandDescription": true,
                "selectGroups": ["name"],
                "selectHosts": ["host", "maintenance_status"],
                "sortfield": "description",
                "only_true": true,
                "selectLastEvent": "true",
                "hostids": hostid
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("AAA");
            $.each(data.result, function (k, v) {
                console.log("AAA : " + v.hosts[0].hostid + " / " + JSON.stringify(v))
            });
            return data;
        }
    },

    /* 서버 정보 요약 - 서버 정보 Table*/
    serOverviewHost: {
        get: function (hostid) {
            console.log("call Host hostid : " + hostid);
            var method = "host.get";
            var params = {
                "output": "extend",
                "selectInterfaces": ["ip", "disk"],
                "selectInventory": ["os", "hardware", "name"],
                "hostids": hostid
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $.each(data.result, function (k, v) {
                //console.log(" 전체 서버 상태 >> 서버아이디 : " + v.hostid + " , 서버명 : " + v.host + " , IP주소 : " + v.interfaces[0].ip + " , OS : " + v.inventory.os + " , 하드웨어 : " + v.inventory.hardware); //ok
                console.log("서버아이디 : " + v.hostid + " , 서버명 : " + v.host + " , 호스트명 : " + v.name + " , IP주소 : " + v.interfaces[0].ip + " , OS : " + v.inventory.os);
            });
            return data;
        }
    },

    /* 전체 서버 상태 2017-01-05 */
    allServerViewItem: {
        get: function (hostId, key_) {
            var method = "item.get";
            var params = {
                //"output" : "extend",
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostId,
                "search": {"key_": key_}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            //console.log(" 전체 서버 상태 2 / : " + JSON.stringify(data));
            $.each(data.result, function (k, v) {
                //console.log(" 전체 서버 상태 2 >> 키 값 : " + v.key_ + ", 마지막 값 : " + v.lastvalue);
            })
            return data;
        }
    },

    /* 전체 서버 상태 2017-01-02 */
    allServerViewHost: {
        get: function () {
            var method = "host.get";
            var params = {
                "output": "extend",
                "selectInterfaces": ["ip", "disk"],
                "selectInventory": ["os", "hardware"],
                "sortfield": "name"
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $.each(data.result, function (k, v) {
                //console.log(" 전체 서버 상태 >> 서버아이디 : " + v.hostid + " , 서버명 : " + v.host + " , IP주소 : " + v.interfaces[0].ip + " , OS : " + v.inventory.os + " , 하드웨어 : " + v.inventory.hardware); //ok
            })
            return data;
        }
    },

    apiTest: {
        get: function () {
            var method = "item.get";
            var params = {
                // "output" : "extend",
                "output": ["name", "lastvalue"],
                "selectHosts": ["host"],
                "filter": {
                    "value_type": [0, 3]
                },
                "sortfield": "name",
                "monitored": true,
                "limit": "50000"
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            //console.log("item.get success");
            console.log("apiTest : " + data);

            $.each(data.result, function (result_index, result_value) {
                $.each(result_value.hosts, function (host_index, host_value) {
                    console.log(host_value.host + " / " + result_value.name + " / " + result_value.lastvalue);
                });
            });
        }
    },

    auth: {
        get: function () {
            return server.userLogin();
        },
        success: function (data) {
            Cookies.set('zbx_sessionid', data.result, {
                expires: 7,
                path: '/zabbix',
                domain: (baseURL.split('/')[2]).split(':')[0]
            });
            // db.set("zbxsession", data.result)
            return data;
        }
    },

    itemNames: {
        get_all: function () {
            var method = "item.get";
            var params = {
                "output": ["key_"],
                "monitored": true,
                "sortfield": "key_",
                "filter": {
                    "value_type": [0, 3]
                },
                "limit": "50000"
            };
            return server.sendAjaxRequest(method, params);
        },
        success_all: function (data) {
            itemKeyNamesUniqArray = db.get("itemKeyNamesUniqArray");

            if (itemKeyNamesUniqArray === null) {
                setTimeout(function () {
                    var itemKeyNamesArray = [];
                    $.each(data.result, function (key, value) {
                        itemKeyNamesArray.push(value.key_);
                    });
                    itemKeyNamesUniqArray = itemKeyNamesArray.filter(function (x, i, self) {
                        return self.indexOf(x) === i;
                    });
                    db.set("itemKeyNamesUniqArray", itemKeyNamesUniqArray);
                }, 0);
            }
        }
    },

    itemIDs: {
        get: function (groupName, itemfilterName) {
            var method = "item.get";
            var params = {
                "output": ["itemid", "name", "key_"],
                "group": groupName,
                "searchWildcardsEnabled": true,
                "search": {
                    "key_": [itemfilterName]
                },
                "limit": "50000"
            };
            return server.sendAjaxRequest(method, params);
        }
    },

    multiSelectHostGroupNames: {
        get: function () {
            var method = "hostgroup.get";
            var params = {
                "output": ["groupid", "name"],
                "sortfield": "name",
                "with_monitored_items": "true"
            };
            return server.sendAjaxRequest(method, params);
        }
    },

    alertTrigger: {
        get: function () {
            var method = "trigger.get";
            var params = {
                "output": "",
                "monitored": true,
                "skipDependent": true,
                "filter": {
                    "value": "1"
                },
                "countOutput": true,
                "limit": "10000"
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $("#infobox_alertTrigger").text(data.result);
        }
    },

    unAckknowledgeEvent: {
        get: function () {
            var method = "trigger.get";
            var params = {
                "output": "",
                "monitored": true,
                "skipDependent": true,
                "withUnacknowledgedEvents": true,
                "countOutput": true,
                "limit": "10000"
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $("#unAcknowledgedEvents").text(data.result);
        }
    },

    event: {
        get: function () {
            var beforeMinites = db.get("beforeDay") * 60 * 60 * 24;
            var nowUtime = Math.floor($.now() / 1000);

            var method = "event.get";
            var params = {
                "output": "extend",
                "selectHosts": ["host"],
                "selectRelatedObject": ["description", "priority"],
                "sortfield": "clock",
                "time_from": nowUtime - beforeMinites,
                "limit": "10000"
            };
            return server.sendAjaxRequest(method, params);
        },

        success: function (data) {
            var resultArray = [];
            resultArray.push(["Date", "Host", "Description", "Status", "Severity"]);
            $.each(data.result, function (top_index, top_value) {
                if (top_value.hosts.length !== 0) {
                    var innerArray = [convTime(top_value.clock), top_value.hosts[0].host, top_value.relatedObject.description, convStatus(top_value.value), convPriority(top_value.relatedObject.priority)];
                    resultArray.push(innerArray);
                }
            });
            return resultArray;
        }
    },

    triggerInfo: {
        get: function () {
            var method = "trigger.get";
            var params = {
                "output": ["description", "priority", "value", "lastchange"],
                "monitored": true,
                "skipDependent": true,
                "expandDescription": true,
                "selectGroups": ["name"],
                "selectHosts": ["host", "maintenance_status"],
                "selectItems": ["itemid"],
                "sortfield": "description",
                // TODO アラート状態のトリガーだけでなく、直近ステータス変更があったトリガーに変更
                "only_true": true,
                // "filter" : {
                // "value" : [ 1 ]
                // },
                "selectLastEvent": "true",
                "limit": "10000"
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            var resultArray = [];
            if (data.result.length === 0) {
                var innerArray = {
                    "host": "No Problem host",
                    "group": "No Problem group",
                    "status": "OK",
                    "severity": "information",
                    "description": "No Problem trigger",
                    "lastchange": convTime(),
                    "age": "00d 00h 00m"
                };
                resultArray.push(innerArray);
            } else {
                // console.log(data);
                $.each(data.result, function (top_index, top_value) {
                    if (top_value.hosts.length !== 0 && top_value.groups.length !== 0) {

                        // TODO アイテムのシンプルグラフへのリンクを表示する
                        var itemArray = [];
                        $.each(top_value.items, function (second_index, second_value) {
                            itemArray.push(second_value);
                        });

                        var innerArray = {
                            "host": top_value.hosts[0].host,
                            "group": top_value.groups[0].name,
                            "status": convStatus(top_value.value),
                            "severity": convPriority(top_value.priority),
                            "description": top_value.description,
                            "lastchange": convTime(top_value.lastchange),
                            "age": convDeltaTime(top_value.lastchange),
                            "ack": convAck(top_value.lastEvent.acknowledged),
                            "mainte_status": top_value.hosts[0].maintenance_status,
                            // "triggerid" : triggerid,
                            "itemids": top_value.items
                        };
                        resultArray.push(innerArray);
                    }
                });
            }
            // console.log(resultArray);
            return resultArray;
        }
    }
};

var int = {
    ready: function () {
        lastPeriod = 3600;
        options.username = $("#inputUser").val();
        options.password = $("#inputPasswd").val();

        // for API Login
        server = new $.jqzabbix(options);
        server.getApiVersion().then(function () {
            return zbxApi.auth.get();
        }, function () {
            $.unblockUI(blockUI_opt_all);
            alertDiag(server.isError);
        }).then(function (data) {
            return zbxApi.auth.success(data);
        }, function (data) {
            alertDiag(data.error.data);
            // end API Login
        }).then(function () {
            // for Dashboard
            $.blockUI(blockUI_opt_all);
            $("#top_login").hide();
            $(".body").removeClass("login-page");
            $("#top_contents").show();
            // for dashboard
            int.dashboardView();
        }).then(function () {
            // for multiSelectHostGroup in setting
            int.createMultiSelectHostGroupNames();
        }).then(function () {
            // for suggest
            return zbxApi.itemNames.get_all();
        }).then(function (data, status, jqXHR) {
            zbxApi.itemNames.success_all(data);
        }).then(function () {
            // DOM event attach
            int.createEvents();
            $.unblockUI(blockUI_opt_all);
        }).then(function () {
            // for suggest
            //return zbxApi.getHost.get();
            //return zbxApi.getItem.get();
        }).then(function (data) {
            //zbxApi.getHost.success(data);
            //zbxApi.getItem.success(data);
        }).then(function (data) {
            int.hostInfoView(); //host 정보 호출
        }).then(function (data) {
            int.allServerViewHost(); //전체 서버 상태 호출
        }).then(function (data){
            int.serOverviewHost(); //서버 요약 정보
        });
    },

    createEvents: function () {
        // ##### Window resize #####
        var timer = false;
        $(window).resize(function () {
            if (timer !== false) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
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

        $("#menu_dashboard").click(function () {
            $("[id^=base]").hide();
            $("#base_dashboard").show();
            int.dashboardView();
        });

        $("#menu_histogram").click(function () {
            $("[id^=base]").hide();
            pivotDisplay();
            $("#base_event").show();
            $("#base_histogram").show();
        });

        $("#menu_pivottable").click(function () {
            $("[id^=base]").hide();
            pivotDisplay();
            $("#base_event").show();
            $("#base_pivottable").show();
        });

        $("#menu_treemap").click(function () {
            $("[id^=base]").hide();
            pivotDisplay();
            $("#base_event").show();
            $("#base_treemap").show();
        });

        $("#menu_free").click(function () {
            $("[id^=base]").hide();
            pivotDisplay();
            $("#base_event").show();
            $("#base_free").show();
        });

        $("#menu_setting").click(function () {
            $("[id^=base]").hide();
            $("#base_setting").show();
        });

        $("#groupSelect_li").click(function () {
            $("#contents_top > div").hide();
            $("#graph").show();
        });

        $("#groupSelect li a").click(function () {
            $("#contents_top > div").hide();
            $("#graph").show();

            var targetPeriod = eval(db.get("lastPeriod"));
            var menuGroup = $(this).attr("id");
            createGraphTable(targetPeriod, menuGroup);
        });

        $("#menu_setting").click(function () {
            $("#contents_top > div").hide();
            $("#form_beforeDay").val(db.get("beforeDay"));
            $("#setting").show();
        });

        $("#menu_serverlist").click(function () {
            console.log("Click Menu ServerList");
            //int.serverInfoOverView();
        });

        /* 전체 서버 상태 2017-01-02 */
        $("#menu_overview").click(function () {
            $("[id^=base]").hide();
            $("#base_server").show();
            //int.allServerViewHost();
        });

        // ##### dashboard #####
        $("#reload_dashboard").click(function () {
            int.dashboardView();
        });

        $(function ($) {
            $('#reload_dashboard_selecter').change(function () {
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
            on: function (labelName) {
                $("#label_" + labelName).removeClass("label-info").addClass("label-warning").text("Filter ON");
                alertFade("#alert_" + labelName);
            },

            off: function (labelName) {
                $("#label_" + labelName).removeClass("label-warning").addClass("label-info").text("Filter OFF");
                alertFade("#alert_" + labelName);

            }
        };

        $("#save_event_histogram").click(function () {
            db.set("event_histogram", db.get("event_histogram_tmp"));
            filterDisp.on("event_histogram");
        });

        $("#clear_event_histogram").click(function () {
            db.remove("event_histogram");
            filterDisp.off("event_histogram");
            pivotDisplay();
        });

        $("#save_event_pivot").click(function () {
            db.set("event_pivot", db.get("event_pivot_tmp"));
            filterDisp.on("event_pivot");
        });

        $("#clear_event_pivot").click(function () {
            db.remove("event_pivot");
            filterDisp.off("event_pivot");
            pivotDisplay();
        });

        $("#save_event_treemap").click(function () {
            db.set("event_treemap", db.get("event_treemap_tmp"));
            filterDisp.on("event_treemap");
        });

        $("#clear_event_treemap").click(function () {
            db.remove("event_treemap");
            filterDisp.off("event_treemap");
            pivotDisplay();
        });

        $("#save_event_free").click(function () {
            db.set("event_free", db.get("event_free_tmp"));
            filterDisp.on("event_free");
        });

        $("#clear_event_free").click(function () {
            db.remove("event_free");
            filterDisp.off("event_free");
            pivotDisplay();
        });

        // ##### graphs #####
        $("#reflesh_graph").click(function () {
            int.createGraphTable();
        });

        $("#periodSelect button").click(function () {
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
        $("#submit_form_beforeDay").click(function () {

            if ($("#form_beforeDay").val() === "") {
                alertDiag("Setting Save Error");
                return;
            }

            db.set("beforeDay", $("#form_beforeDay").val());
            alertFade("#alert_form_beforeDay");
        });

        $("#cancel_form_beforeDay").click(function () {
            $("#form_beforeDay").val(db.get("beforeDay"));
            alertFade("#alert_form_beforeDay");
        });

        // ##### Setting => graphs
        $('a[href="#tab_graph_setting"]').click(function () {
            int.settingTabGraph();
        });

        $(document).on("click", ".addList", function () {
            $("#graph_setting-tbody > tr").eq(0).clone().insertAfter($(this).parent().parent());
            setting.graphAutocomp();
            setting.graphCheckRowCount();
        });

        $(document).on("click", ".removeList", function () {
            $(this).parent().parent().remove();
            setting.graphAutocomp();
            setting.graphCheckRowCount();

        });

        $("#submit_graph_setting").click(function () {
            // keySetting
            var itemKeys = [];
            $("#graph_setting-tbody > tr").each(function () {
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

        $("#cancel_graph_setting").click(function () {
            var ret_settingCheck = int.settingCheck();
            if (ret_settingCheck === true) {
                int.createGraphMenu();
            }
            int.settingTabGraph();
            alertFade("#alert_graph_setting");
        });

        // ##### Setting => etc
        $("#allClear").click(function () {
            localStorage.clear();
            infoDiag("Success:Setting All Clear");
        });

        $("#export").click(function () {
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

        $("#import").click(function () {
            infoDiag("Success:Setting Import");
        });

        // Logout
        $("#log-out").click(function () {
            $.blockUI(blockUI_opt_all);
            db.remove("zbxsession");
            jQuery.getScript("js/zabirepo-param.js");

            $(".body").addClass("login-page");
            $("#top_contents").hide('fade', '', 500, function () {
                $("#top_login").show('fade', '', 500, function () {
                    location.reload($.unblockUI(blockUI_opt_all));
                });
            });
        });
    },

    createGraphMenu: function () {
        $("#menu_group_top").empty();
        $("#menu_item_top").empty();

        var groupNames = db.get("groupNamesArray");
        var keyNames = db.get("keyNamesArray");

        var groupNames_array = [];
        $.each(groupNames, function (index, elem) {
            groupNames_array.push(elem.groupName);
        });
        groupNames_array.sort();

        $.each(groupNames_array, function (index, elem) {
            $('<li><p><a class="menu_group"><i class="fa"></i><font size="2">' + elem + '</font></a></p></li>').appendTo("#menu_group_top");
        });

        $.each(keyNames, function (index, elem) {
            $('<li><p><a class="menu_item" data-splitFlag="' + elem.split_flag + '"><i class="fa"></i><font size="2">' + elem.search_key + '</font></a></li>').appendTo("#menu_item_top");

            $("#menu_item_top li:last-child").data("split_flag2", elem.split_flag);
        });

        $(document).off("click", ".menu_group");
        $(document).on("click", ".menu_group", function () {
            var i = 0;
            if (i === 0) {
                int.createGraphArray(this.text, "group");
                i++;
            }
        });

        $(document).off("click", ".menu_item");
        $(document).on("click", ".menu_item", function () {
            var i = 0;
            if (i === 0) {
                int.createGraphArray(this.text, "item");
                i++;
            }
        });
    },

    createGraphArray: function (clickText, type) {
        var kickCount = 0;
        var endCount = 0;
        resultObj = [];
        graphLabel = clickText;

        if (type === "group") {
            var keyNames = db.get("keyNamesArray");
            $.each(keyNames, function (k_key, k_value) {

                var jqXHR = zbxApi.itemIDs.get(clickText, k_value.search_key);
                jqXHR.done(function (data, status, jqXHR) {
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

            $.each(groupNames, function (g_key, g_value) {
                var jqXHR = zbxApi.itemIDs.get(g_value.groupName, clickText);
                jqXHR.done(function (data, status, jqXHR) {
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
    createGraphTable: function () {
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
        $.each(resultObj, function (top_index, top_value) {
            $.each(top_value.data, function (second_index, second_value) {
                itemKeyTmp.push(second_value.key_);
            });
        });

        var itemKeyUniqArray = itemKeyTmp.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        // end create uniq key

        // split option check
        var itemKeys = [];
        $.each(resultObj, function (top_index, top_value) {
            if (top_value.split === 1) {
                $.each(itemKeyUniqArray, function (itemKeyUniq_index, itemKeyUniq_value) {
                    var itemKeysTmp = [];
                    $.each(top_value.data, function (second_index, second_value) {

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
                $.each(top_value.data, function (second_index, second_value) {
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

        $.each(itemKeys, function (top_index, top_value) {
            var first = 0;
            var itemUrl = "";

            if (top_value.length <= zabirepo.GRAPH_ITEM_LIMIT) {

                $.each(top_value, function (second_index, second_value) {
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

    dashboardView: function () {
        $(".info-box-content").block(blockUI_opt_el);

        $.when(zbxApi.alertTrigger.get(), zbxApi.unAckknowledgeEvent.get()).done(function (data_a, data_b) {
            zbxApi.alertTrigger.success(data_a[0]);
            zbxApi.unAckknowledgeEvent.success(data_b[0]);
            $("#lastUpdateDashboard").text(convTime());

        }).fail(function () {
            console.log("dashboardView : Network Error");
            alertDiag("Network Error");
        });
        int.dcCreate();
    },

    /* 전체 서버 상태 2017-01-02 */
    allServerViewHost: function () {
        console.log("allServerViewHost");

        zbxApi.allServerViewHost.get().done(function (data, status, jqXHR) {
            var server_data = zbxApi.allServerViewHost.success(data);
            var serverName, serverIP = ''; //서버명, IP주소
            var serverPerCPU = 0; //PerCPU
            var serverPerMemory = 0; //Per메모리
            var serverPerDisk = 0; //Per디스크
            var serverOS = '-'; //운영체제
            var serverCPU = '-'; //CPU
            var serverRAM = '-'; //RAM

            $.each(server_data.result, function (k, v) {
                serverName = v.name;
                serverIP = v.interfaces[0].ip;

                var osInfo = v.inventory.os;    //serverOS = v.inventory.os;
                if (osInfo === undefined) { serverOS = '-'; }
                else {
                    if (osInfo.match('Linux')) { serverOS = 'Linux'; }
                    else if (osInfo.match('Window')) { serverOS = 'Windows'; }
                    else { serverOS = '-'; }
                }

                try {
                    serverPerCPU = zbxSyncApi.allServerViewItemByName(v.hostid, "CPU idle time").lastvalue;
                    serverPerCPU = Math.floor(serverPerCPU * 100) / 100;

                    if (serverPerCPU == 100)
                        serverPerCPU = 0;
                } catch (e) {
                    console.log(e);
                }

                try {
                    serverPerMemory = zbxSyncApi.allServerViewItem(v.hostid, "vm.memory.size[pused]").lastvalue;
                    serverPerMemory = Math.floor(serverPerMemory * 100) / 100;
                } catch (e) {
                    console.log(e);
                }

                var value;
                try {
                    // TODO pfree to pused.
                    value = zbxSyncApi.allServerViewItem(v.hostid, "vfs.fs.size[/,pfree]").lastvalue;
                } catch (e) {
                    console.log(e);
                    value = zbxSyncApi.allServerViewItem(v.hostid, "vfs.fs.size[C:,pfree]").lastvalue;
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

                var serverTbl = ''; //전체 서버 상태 Table
                serverTbl += "<tr>";
                serverTbl += "<td>" + serverName + "</td>";
                serverTbl += "<td>" + serverIP + "</td>";
                serverTbl += "<td class='progress-background'><div class='progress-bar' style='width:" + serverPerCPU + "%'>" + serverPerCPU + "%</div></td>";
                serverTbl += "<td class='progress-background'><div class='progress-bar' style='width:" + serverPerMemory + "%'>" + serverPerMemory + "%</div></td>";
                serverTbl += "<td class='progress-background'><div class='progress-bar' style='width:" + serverPerDisk + "%'>" + serverPerDisk + "%</div></td>";
                serverTbl += "<td>" + serverOS + "</td>";
                serverTbl += "<td>" + serverCPU + "</td>";
                serverTbl += "<td>" + serverRAM + "</td>";
                serverTbl += "</tr>";
                $("#serverList").append(serverTbl);

                //serverPerCPU = 0;
                //serverPerMemory = 0;
                //serverPerDisk = 0;

                //console.log("호스트 아이디 : " + v.hostid + " , serverName : " + serverName + " , serverIP : " + serverIP + " ,  serverPerCPU : " + serverPerCPU + " , serverPerMemory : " + serverPerMemory + " , serverPerDisk : " + serverPerDisk + " , serverOS : " + serverOS + " , serverCPU : " + serverCPU + " , serverRAM : " + serverRAM);
            })
        });
    },

    //host 정보 호출
    hostInfoView: function () {
        console.log("IN function hostInfoView");
        if ($("#serverlist > li").size() > 0) {
            return;
        }

        zbxApi.host.get().done(function (data, status, jqXHR) {
            var host_data = zbxApi.host.success(data);
            var tagId = '';
            var tagText = '';
            var tagText2 = '';

            $.each(host_data.result, function (k, v) {
                tagText = '';
                tagText2 = '';
                //console.log(v.hostid + ", " + v.host + ", " + v.interfaces[0].ip);
                tagId = "host_" + v.hostid;
                tagText = '<li><a href="#" id="' + tagId + '"><i class="fa fa-bar-chart"></i>';
                tagText += v.host;
                tagText += '</a><ul class="treeview-menu" id="' + tagId + '_performlist"></ul></li>';
                //console.log("tagText : " + tagText);
                $("#serverlist").append(tagText);

                tagText2 += '<li><a class="treeview-menu" href="#" id="info_' + v.hostid + '"><i class="fa fa-bar-chart"></i>요약</a></li>';
                tagText2 += '<li><a class="treeview-menu" href="#" id="cpu_' + v.hostid + '"><i class="fa fa-bar-chart"></i>CPU</a></li>';
                tagText2 += '<li><a class="treeview-menu" href="#" id="memory_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Memory</a></li>';
                tagText2 += '<li><a class="treeview-menu" href="#" id="process_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Process</a></li>';
                tagText2 += '<li><a class="treeview-menu" href="#" id="disk_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Disk</a></li>';
                tagText2 += '<li><a class="treeview-menu" href="#" id="traffic_' + v.hostid + '"><i class="fa fa-bar-chart"></i>Traffic</a></li>';

                $("#" + tagId + "_performlist").append(tagText2);

                /* 2017.01.11 서버 정보 요약 */
                $("#info_" + v.hostid).click(function () { //요약
                    console.log("IN IN IN 호스트 아이디 : " + v.hostid + ", 호스트명 : " + v.host);
                    $("[id^=base]").hide();
                    $("#base_serverInfo").show();

                    //CPU 사용량 그래프
                    //전체 메모리 그래프
                    //디스크 사용량 그래프
                    //트래픽 사용량 그래프
                    zbxApi.serOverviewHost.get(v.hostid).done(function(data, status, jqXHR){ //서버 정보 Table
                        console.log("IN serOverviewHost : " + v.hostid);
                        var server_host = zbxApi.serOverviewHost.success(data);
                        var serverTitle, serverIP, serverOS, serverName = '';

                        $.each(server_host.result, function (k, v){
                            serverTitle = v.host;
                            serverIP = v.interfaces[0].ip;
                            serverOS = v.inventory.os;
                            serverName = v.name;

                            console.log("TEST : " + serverTitle + " , " + serverIP + " , " + serverOS + " , " + serverName);

                            var serverInfoTbl = '';
                            serverInfoTbl += "<tr><td>운영체제</td><td>"+serverOS+"</td></tr>";
                            serverInfoTbl += "<tr><td>서버명</td><td>"+serverTitle+"</td></tr>";
                            serverInfoTbl += "<tr><td>IP주소</td><td>"+serverIP+"</td></tr>";
                            serverInfoTbl += "<tr><td>호스트명</td><td>"+serverName+"</td></tr>";
                            serverInfoTbl += "<tr><td>데이터 보관 일</td><td></td></tr>";
                            serverInfoTbl += "<tr><td>에이전트 아이디</td><td></td></tr>";
                            serverInfoTbl += "<tr><td>에이전트</td><td></td></tr>";
                            $("#serverInfo").append(serverInfoTbl);
                        })
                    })
                    //프로세스 Table
                    //이벤트 목록 Table
                    zbxApi.serOverviewTrigger.get(v.hostid).done(function(data, status, jqXHR){
                        console.log("IN serOverviewHost : " + v.hostid);
                        var server_event = zbxApi.serOverviewTrigger.success(data);

                        var host, group, status, severity, description, lastchange, age, ack, minte_status, itemids ='';

                        $.each(server_event.result, function(k, v){
                            host = v.hosts[0].host;
                            group = v.groups[0].name;
                            status = convStatus(v.value);
                            severity = convPriority(v.priority);
                            description = v.description;
                            lastchange = convTime(v.lastchange);
                            age = convDeltaTime(v.lastchange);
                            ack = convAck(v.lastEvent.acknowledged);
                            minte_status = v.hosts[0].maintenance_status;
                            itemids = v.items;

                            console.log("1111111111");
                            //console.log(host + "/ " + group + "/ " +  status + "/ " + severity + "/ " + description + "/ " + lastchange + "/ " + age + "/ " + ack + "/ " + minte_status + "/ " + itemids);

                            var serverEventTbl = '';
                            serverEventTbl += "<tr>";
                            serverEventTbl += "<td>" + severity + "</td>";
                            serverEventTbl += "<td>" + status + "</td>";
                            serverEventTbl += "<td>" + lastchange + "</td>";
                            serverEventTbl += "<td>" + age + "</td>";
                            serverEventTbl += "<td>" + ack + "</td>";
                            serverEventTbl += "<td>" + group + "</td>";
                            serverEventTbl += "<td>" + description + "</td>";
                            serverEventTbl += "</tr>";
                            $("#serverEventList").append(serverEventTbl);

                        })
                    })
                });

                $("#cpu_" + v.hostid).click(function () { //CPU
                    $("[id^=base]").hide();
                    $("#base_hostinfo").show();
                    var dataItem = null;
                    var data_loadavg1 = null;

                    zbxApi.getItem.get(v.hostid, "system.cpu.util[,system]").then(function (data) {
                        dataItem = zbxApi.getItem.success(data);
                        console.log("dataItem : " + JSON.stringify(dataItem));
                    }).then(function () {
                        // for suggest
                        return zbxApi.getItem.get(v.hostid, "system.cpu.load[percpu,avg1]");
                    }).then(function (data) {
                        data_loadavg1 = zbxApi.getItem.success(data);
                        console.log(data_loadavg1);
                        hostinfoView(dataItem, data_loadavg1);
                    });
                });

                $("#memory_" + v.hostid).click(function () { //Memory
                    alert("IN Memory");
                });

                $("#process_" + v.hostid).click(function () { //Process
                    alert("IN Process");
                });

                $("#disk_" + v.hostid).click(function () { //Disk
                    alert("IN Disk");
                });

                $("#traffic_" + v.hostid).click(function () { //Traffic
                    alert("IN Traffic");
                });

                $("#" + tagId).click(function () {
                    $("[id^=base]").hide();
                    $("#base_hostinfo").show();
                    hostinfoView();
                });
            })
        }).fail(function () {
            console.log("dashboardView : Network Error");
            alertDiag("Network Error");
        }).always(function () {
            $(".info-box-content").unblock(blockUI_opt_el);
        });
    },

    dcCreate: function () {
        // for SystemStatus
        zbxApi.triggerInfo.get().done(function (data, status, jqXHR) {

            var cf = crossfilter(zbxApi.triggerInfo.success(data));
            // Severity
            var dimSeverity = cf.dimension(function (d) {
                return d.severity;
            });
            var gpSeverity = dimSeverity.group().reduceCount();
            var chartSeverity = dc.pieChart('#chart_severity');
            chartSeverity.width(250).height(200).cx(160).radius(90).innerRadius(35).slicesCap(Infinity) // すべて表示
                .dimension(dimSeverity).group(gpSeverity).ordering(function (t) {
                return -t.value;
            }).legend(dc.legend())
            chartSeverity.label(function (d) {
                return d.key + ' : ' + d.value;
            });
            chartSeverity.render();

            // hostgroup
            var dimGroup = cf.dimension(function (d) {
                return d.group;
            });
            var gpGroup = dimGroup.group().reduceCount();
            var chartGroup = dc.rowChart('#chart_hostGroup');
            chartGroup.width(300).height(220).dimension(dimGroup).group(gpGroup).ordering(function (t) {
                return -t.value;
            }).legend(dc.legend());

            chartGroup.elasticX(1);
            // chartGroup.xAxis().ticks(1);
            chartGroup.label(function (d) {
                return d.key + ' : ' + d.value;
            });
            chartGroup.render();

            // host
            var dimHost = cf.dimension(function (d) {
                return d.host;
            });
            var gpHost = dimHost.group().reduceCount();
            var chartHost = dc.rowChart('#chart_host');
            chartHost.width(300).height(220).dimension(dimHost).group(gpHost).ordering(function (t) {
                return -t.value;
            }).legend(dc.legend());
            chartHost.elasticX(1);
            // chartHost.xAxis().ticks(10);
            chartHost.label(function (d) {
                return d.key + ' : ' + d.value;
            });
            chartHost.render();

            // event list
            var dimEventList = cf.dimension(function (d) {
                return d.description;
            });

            var tbl = dc.dataTable('#eventList');
            tbl.dimension(dimEventList).size(30).group(function (d) {
                return d.severity;
            }).columns([function (d) {
                return d.severity;
            }, function (d) {
                return d.status;
            }, function (d) {
                return d.lastchange;
            }, function (d) {
                return d.age;
            }, function (d) {
                return d.ack;
            }, function (d) {
                return d.host;
            }, function (d) {
                return d.description;
            }, function (d) {
            }]).render();

            tbl.on("postRedraw", function (tbl) {
                addDcTableColor();
            });
            addDcTableColor();

        });
    },

    createMultiSelectHostGroupNames: function () {
        zbxApi.multiSelectHostGroupNames.get().done(function (data, status, jqXHR) {
            $('#zbxGroup').empty();
            $.each(data.result, function (key, value) {
                $('#zbxGroup').append("<option value='" + value.groupid + "," + value.name + "'>" + value.name + "</option>");
            });

            $('#zbxGroup').multiSelect({
                selectableHeader: "<div class='custom-header'>Selectable Groups</div>",
                selectionHeader: "<div class='custom-header'>Selection Groups</div>",
                afterSelect: function (values) {
                    $.each(values, function (key, value) {
                        var add_value = value.split(",");
                        var addObj = {
                            groupid: add_value[0],
                            groupName: add_value[1]
                        };
                        groupNames.push(addObj);
                    });
                },
                afterDeselect: function (values) {
                    $.each(values, function (key, value) {
                        var del_value = value.split(",");
                        var del_target = del_value[0];
                        groupNames.some(function (v, i) {
                            if (v.groupid == del_target)
                                groupNames.splice(i, 1);
                        });
                    });
                }
            });

            $('#select-all-zbxGroup').click(function () {
                $('#zbxGroup').multiSelect('select_all');
                return false;
            });

            $('#deselect-all-zbxGroup').click(function () {
                $('#zbxGroup').multiSelect('deselect_all');
                return false;
            });

        }).fail(function () {
            console.log("createMultiSelectHostGroupNames : Network Error");
            alertDiag("Network Error");
        });
    },

    settingTabGraph: function () {
        // groupSetting
        $('#zbxGroup').multiSelect('refresh');

        if (db.get('groupNamesArray') == null) {
            groupNames = [];
        } else {
            groupNames = [];
            var groupNames_tmp = db.get('groupNamesArray');
            $.each(groupNames_tmp, function (index, value) {
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
            $.each(keyNames, function (index, value) {
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

        $("#graph_setting-tbody").bind('click.sortable mousedown.sortable', function (ev) {
            ev.target.focus();
        });

        $("#graph_setting-tbody").disableSelection();

    },
    settingCheck: function () {
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


var hostinfoView = function (dataItem, data_loadavg1) {
    var systemCpuArr = [];
    var loadAvg1Arr = [];
    var keyName = '';
    var keyName2 = '';
    console.log("hostinfoView");
    var d = new Date();
    var startTime = d.getTime();
    startTime = String(Math.round((startTime - 43200000) / 1000));

    var dataHistory = null;
    var history_loadavg1 = null;

    zbxApi.getHistory.get(dataItem.result[0].itemid, startTime).then(function (data) {
        dataHistory = zbxApi.getHistory.success(data);
        keyName = dataItem.result[0].key_;
        $.each(dataHistory.result, function (k, v) {
            systemCpuArr[k] = parseFloat(v.value);
        });
    }).then(function () {
        // for suggest
        return zbxApi.getHistory.get(data_loadavg1.result[0].itemid, startTime);
        //return zbxApi.getItem.get();
    }).then(function (data) {
        history_loadavg1 = zbxApi.getHistory.success(data);
        keyName2 = data_loadavg1.result[0].key_;
        $.each(history_loadavg1.result, function (k, v) {
            loadAvg1Arr[k] = parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('hostinfo_cpuusage', {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'CPU 사용량'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    allowDecimals: false,
                    labels: {
                        formatter: function () {
                            return this.value; // clean, unformatted number for year
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Nuclear weapon states'
                    },
                    labels: {
                        formatter: function () {
                            //return this.value / 1000 + 'k';
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} produced <b>{point.y}</b><br/>warheads in {point.x}'
                },
                plotOptions: {
                    area: {
                        pointStart: 1940,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: keyName,
                    data: systemCpuArr
//		            	[null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
//		                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
//		                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
//		                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
//		                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
//		                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
//		                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
                }, {
                    name: keyName,
                    data: systemCpuArr
//		            	[null, null, null, null, null, null, null, null, null, null,
//		                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
//		                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
//		                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
//		                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
//		                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
//		                21000, 20000, 19000, 18000, 18000, 17000, 16000]
                }]
            });
        });

        $(function () {
            Highcharts.chart('serverinfo_memusage', {
                chart: {
                    //type: 'area'
                },
                title: {
                    text: 'Load Average'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    allowDecimals: false,
                    labels: {
                        formatter: function () {
                            return this.value; // clean, unformatted number for year
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Nuclear weapon states'
                    },
                    labels: {
                        formatter: function () {
                            return this.value / 1000 + 'k';
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
                },
                plotOptions: {
                    area: {
                        pointStart: 1940,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: keyName2,
                    data: loadAvg1Arr
                }, {
                    name: keyName2,
                    data: loadAvg1Arr
                }]
            });
        });

        $(function () {

            Highcharts.chart('hostinfo_cpuusage1', {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'CPU 사용량'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    allowDecimals: false,
                    labels: {
                        formatter: function () {
                            return this.value; // clean, unformatted number for year
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Nuclear weapon states'
                    },
                    labels: {
                        formatter: function () {
                            //return this.value / 1000 + 'k';
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} produced <b>{point.y}</b><br/>warheads in {point.x}'
                },
                plotOptions: {
                    area: {
                        pointStart: 1940,
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: keyName,
                    data: systemCpuArr
//		            	[null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
//		                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
//		                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
//		                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
//		                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
//		                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
//		                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
                }, {
                    name: keyName,
                    data: systemCpuArr
//		            	[null, null, null, null, null, null, null, null, null, null,
//		                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
//		                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
//		                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
//		                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
//		                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
//		                21000, 20000, 19000, 18000, 18000, 17000, 16000]
                }]
            });
        });
    });

//	$.blockUI(blockUI_opt_all);
//	var beforeDay = db.get("beforeDay");
//
//	zbxApi.event.get().done(function(data, statusText, jqXHR) {
//
//		var Latest_events = zbxApi.event.success(data);
//		pivotMain(Latest_events, "event_histogram");
//		pivotMain(Latest_events, "event_pivot");
//		pivotMain(Latest_events, "event_treemap");
//		pivotMain(Latest_events, "event_free");
//		$.unblockUI(blockUI_opt_all);
//	}).fail(function(jqXHR, statusText, errorThrown) {
//		$.unblockUI(blockUI_opt_all);
//		console.log("pivotDisplay : Network Error");
//		alertDiag("Network Error");
//	});
};


function type(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
}

var pivotDisplay = function () {
    $.blockUI(blockUI_opt_all);
    var beforeDay = db.get("beforeDay");

    zbxApi.event.get().done(function (data, statusText, jqXHR) {
        var Latest_events = zbxApi.event.success(data);
        pivotMain(Latest_events, "event_histogram");
        pivotMain(Latest_events, "event_pivot");
        pivotMain(Latest_events, "event_treemap");
        pivotMain(Latest_events, "event_free");
        $.unblockUI(blockUI_opt_all);
    }).fail(function (jqXHR, statusText, errorThrown) {
        $.unblockUI(blockUI_opt_all);
        console.log("pivotDisplay : Network Error");
        alertDiag("Network Error");
    });

};

var pivotMain = function (Latest_events, event_type) {
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
        sorters: function (attr) {
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
        onRefresh: function (config) {
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

var alertDiag = function (data) {
    $("#modal-alert-text").text(data);
    $('#modal-alert').modal('show');
};

var infoDiag = function (data) {
    $("#modal-info-text").text(data);
    $('#modal-info').modal('show');
};

var alertFade = function (target) {
    $(target).fadeIn(1000).delay(2000).fadeOut(1000);
};

var sortObject = function (object, key) {
    var sorted = [];
    var array = [];

    $.each(object, function (object_index, object_data) {
        array.push(object_data[key]);
    });

    array.sort(function (a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    });

    $.each(array, function (array_index, array_data) {
        $.each(object, function (object_index, object_data) {
            if (array_data === object_data[key]) {
                sorted.push(object_data);
            }
        });
    });

    return sorted;
}

var sortObjectStr = function (object, key) {
    var sorted = [];
    var array = [];

    $.each(object, function (object_index, object_data) {
        array.push(object_data[key]);
    });

    array.sort();

    $.each(array, function (array_index, array_data) {
        $.each(object, function (object_index, object_data) {
            if (array_data === object_data[key]) {
                sorted.push(object_data);
            }
        });
    });
    return sorted;
}

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
    set: function (key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
    },
    get: function (key) {
        return JSON.parse(localStorage.getItem(key));
    },
    remove: function (key) {
        localStorage.removeItem(key);
    }
};

var setting = {
    graphAutocomp: function () {
        $(".input_zbx_key").autocomplete({
            source: itemKeyNamesUniqArray,
            autoFocus: false,
            delay: 100,
            minLength: 0
        });
    },
    graphCheckRowCount: function () {
        if ($(".removeList").length == 2) {
            $(".removeList").prop("disabled", true);
        } else {
            $(".removeList").prop("disabled", false);
        }
    }
};

var convTime = function (date) {
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

var convDeltaTime = function (lastchange) {
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

var convStatus = function (status) {
    if (status === "0") {
        return "OK";
    } else {
        return "problem";
    }

};

var convAck = function (ack) {
    if (ack === "0") {
        return "Unacked";
    } else {
        return "Acked";
    }

};

var convPriority = function (priority) {
    switch (priority) {
        case "0":
            return "not classified";
        case "1":
            return "information";
        case "2":
            return "warning";
        case "3":
            return "average";
        case "4":
            return "high";
        case "5":
            return "disaster";
    }
}

var reloadTimer = function (flag, interval) {
    if (flag === true) {
        clearInterval(zabirepo.reloadId);
        var counter = interval;
        $("#countDownTimer").text(interval);

        zabirepo.reloadId = setInterval(function () {
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

var addDcTableColor = function () {
    $.each($(".dc-table-column._1"), function (index, value) {
        if (this.textContent === "problem") {
            $(this).css('color', 'Red');
            $(this).addClass('flash');
        } else {
            $(this).css('color', 'blue');
            $(this).addClass('flash');
        }
    });

    $.each($(".dc-table-column._4"), function (index, value) {
        if (this.textContent === "Unacked") {
            $(this).css('color', 'Red');
            $(this).addClass('flash');
        } else {
            $(this).css('color', 'green');
            $(this).addClass('flash');
        }
    });

    $.each($(".dc-table-column._0"), function (index, value) {
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
