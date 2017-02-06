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
    $("#base_cpuinfo").load("base_cpuinfo.html");

    $("#base_server").load("base_server.html"); // 전체 서버 상태 2017-01-02
    $("#base_serverInfo").load("base_serverInfo.html"); //서버 정보 요약 2017-01-11
    $("#base_memoryInfo").load("base_memoryInfo.html"); // 메모리 통계 2017-01-18
    $("#base_processInfo").load("base_processInfo.html"); // 메모리 통계 2017-01-18

    $("#base_diskInfo").load("base_diskInfo.html"); //디스크 통계
    $("#base_networkInfo").load("base_networkInfo.html"); //네트워크통계
});

var LONGTIME_ONEHOUR = 3600000;
var HISTORY_TYPE = {"FLOAT" : 0, "CHARACTER" : 1, "LOG" : 2, "UNSIGNEDINT" : 3, "TEXT" : 4};

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

    getItem: function (hostId, key_) {
        var param = {
            "jsonrpc": "2.0",
            "method": "item.get",
            "params": {
                "output": ["key_", "name", "lastvalue", "lastclock"],
                "hostids": hostId,
                "search": {"key_": key_}
            },
            "id": 1,
            "auth": authid
        }
        console.log(JSON.stringify(param));

        //console.log("param 123 : " + JSON.stringify(param));
        var result = zbxSyncApi.callAjax(param);
        //console.log(JSON.stringify(result));
        console.log(JSON.stringify(result.result[0]));
        return result.result[0];
    },

    getHistory: function (itemId, startTime) {
        var param = {
            "jsonrpc": "2.0",
            "method": "history.get",
            "params": {
                "output": "extend",
                "history": 0,
                "sortfield": "clock",
                "sortorder": "ASC",
                "itemids": itemId,
                "time_from": startTime
                //"limit" : 72
            },
            "id": 1,
            "auth": authid
        }
        var result = zbxSyncApi.callAjax(param);
        return result.result;
    },

    /* 서버 정보 요약 - 이벤트 Table*/
    serverViewTrigger: function (hostid) {
        var param = {
            "jsonrpc": "2.0",
            "method": "trigger.get",
            "params": {
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
            },
            "id": 1,
            "auth": authid
        }
        var result = zbxSyncApi.callAjax(param);
        return result.result;
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
    
    getTest1: {
        get: function (hostid,startTime) {

            return function aa(){
                var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;
                var dataSet = [];

                var CpuSystemArr = [];
                var CpuUserArr = [];
                var CpuIOwaitArr = [];
                var CpuStealArr = [];

                var history_CpuSystem = null;
                var history_CpuUser = null;
                var history_CpuIOwait = null;
                var history_CpuSteal = null;

                zbxApi.getItem.get(hostid,"system.cpu.util[,system]").then(function(data) {
                    data_CpuSystem = zbxApi.getItem.success(data);
                    //console.log("dataItem : " + JSON.stringify(dataItem));
                }).then(function() {
                    // for suggest
                    return zbxApi.getItem.get(hostid,"system.cpu.util[,user]");
                }).then(function(data) {
                    data_CpuUser = zbxApi.getItem.success(data);
                }).then(function() {
                    // for suggest
                    return zbxApi.getItem.get(hostid,"system.cpu.util[,iowait]");
                }).then(function(data) {
                    data_CpuIOwait = zbxApi.getItem.success(data);
                }).then(function() {
                    // for suggest
                    return zbxApi.getItem.get(hostid,"system.cpu.util[,steal]");
                }).then(function(data) {
                    data_CpuSteal = zbxApi.getItem.success(data);
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuSystem.result[0].itemid, startTime, "0");
                }).then(function(data) {
                    history_CpuSystem = zbxApi.getHistory.success(data);
                    $.each(history_CpuSystem.result, function(k,v) {
                        CpuSystemArr[k] = new Array();
                        CpuSystemArr[k][0]=parseInt(v.clock) * 1000;
                        CpuSystemArr[k][1]=parseFloat(v.value);
                    });
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime, "0");
                }).then(function(data) {
                    history_CpuUser = zbxApi.getHistory.success(data);
                    $.each(history_CpuUser.result, function(k,v) {
                        CpuUserArr[k] = new Array();
                        CpuUserArr[k][0]=parseInt(v.clock) * 1000;
                        CpuUserArr[k][1]=parseFloat(v.value);
                    });
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime, "0");
                }).then(function(data) {
                    history_CpuIOwait = zbxApi.getHistory.success(data);
                    $.each(history_CpuIOwait.result, function(k,v) {
                        CpuIOwaitArr[k] = new Array();
                        CpuIOwaitArr[k][0]=parseInt(v.clock) * 1000;
                        CpuIOwaitArr[k][1]=parseFloat(v.value);
                    });
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime, "0");
                }).then(function(data) {
                    history_CpuSteal = zbxApi.getHistory.success(data);
                    $.each(history_CpuSteal.result, function(k,v) {
                        CpuStealArr[k] = new Array();
                        CpuStealArr[k][0]=parseInt(v.clock) * 1000;
                        CpuStealArr[k][1]=parseFloat(v.value);
                    });

                    var dataObj = new Object();

                    dataObj.name = 'CPU System';
                    dataObj.data = CpuSystemArr;
                    dataSet.push(dataObj);

                    dataObj = new Object();
                    dataObj.name = 'CPU User';
                    dataObj.data = CpuUserArr;
                    dataSet.push(dataObj);

                    dataObj = new Object();
                    dataObj.name = 'CPU IO Wait';
                    dataObj.data = CpuIOwaitArr;
                    dataSet.push(dataObj);

                    dataObj = new Object();
                    dataObj.name = 'CPU Steal';
                    dataObj.data = CpuStealArr;
                    dataSet.push(dataObj);
                    return dataSet;
                });
            };
        },
        success: function (data) {
            return data;
        }
    },

    getHistory: {
        get: function (itemId, startTime, type) {
            var method = "history.get";
            var params = {
                "output": "extend",
                "history": type,
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

    checkItem: {
        get: function (hostId, key_) {
            var method = "item.get";
            var params = {
                "host": hostId,
                "search": {"key_": key_}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("getHistory data : " + data);
            //console.log(data);
            return data;
        }
    },
    
    getProcHistory: {
        get: function (itemId, startTime, type) {
            var method = "history.get";
            var params = {
                "output": "extend",
                "history": type,
                "sortfield": "clock",
                "sortorder": "ASC",
                "itemids": itemId,
                "time_from": startTime,
                //"time_till": till_time,
                "limit" : 2000
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            return data;
        }
    },
    
    getItem: {
        get: function (hostId, key_) {
            var method = "item.get";
            var params = {
                // "output" : "extend",
                "output": ["key_", "name", "lastvalue", "lastclock", "interfaceid","hostid"],
                "hostids": hostId,
                "search": {"key_": key_}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $.each(data.result, function (k, v) {
                console.log(JSON.stringify(v));
                console.log(v.name + ", " + v.key_ + ", " + v.lastvalue);
                //("#infobox_alertTrigger").text(data.result);
            })
            return data;
        }
    },

    getDiskItem: {
        get: function (hostid) {
            var method = "item.get";
            var params = {
                "output": ["key_", "itemid", "lastclock"],
                "hostids": hostid,
                "search": {"key_": "vfs.fs.size", "name" : "Total disk"}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("start222");
            console.log("getItem data : " + data);

            $.each(data.result, function (k, v) {
                console.log(JSON.stringify(v));
                console.log(v.name + ", " + v.key_ + ", " + v.lastvalue);
            })
            return data;
        }
    },

    getNetworkItem: {
        get: function (hostid) {
            var method = "item.get";
            var params = {
                "output": ["key_", "itemid", "lastclock"],
                "hostids": hostid,
                "search": {"key_": "net.if.in"}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            console.log("getNetworkItem");
            console.log("getItem data : " + JSON.stringify(data));

            $.each(data.result, function (k, v) {
                console.log(JSON.stringify(v));
                console.log(v.name + ", " + v.key_ + ", " + v.lastvalue);
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
    serverViewHost: {
        get: function (hostid) {
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
                //console.log("서버아이디 : " + v.hostid + " , 서버명 : " + v.host + " , 호스트명 : " + v.name + " , IP주소 : " + v.interfaces[0].ip + " , OS : " + v.inventory.os);
            });
            return data;
        }
    },

    serverViewGraph : {
        get: function(hostid, key_){
            console.log("IN serOvewViewGraph");
            console.log("hostid : " + hostid + " / key : " + key_);
            var method = "item.get";
            var params = {
                //"output" : "extend",
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostid,
                "search": {"key_": key_}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $.each(data.result, function (k, v) {
                console.log("serverViewGraph : " + JSON.stringify(v));
                console.log(" serverViewGraph >> 키 값 : " + v.key_ + ", 마지막 값 : " + v.lastvalue);
            })
            return data;
        }
    },

    serverViewGraphName : {
        get: function(hostid, name){
            console.log("IN serOvewViewGraph");
            console.log("hostid : " + hostid + " / name : " + name);
            var method = "item.get";
            var params = {
                //"output" : "extend",
                "output": ["key_", "name", "lastvalue"],
                "hostids": hostid,
                "search": {"name": name}
            };
            return server.sendAjaxRequest(method, params);
        },
        success: function (data) {
            $.each(data.result, function (k, v) {
            })
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
        zbxApi.allServerViewHost.get().done(function (data, status, jqXHR) {
            var server_data = zbxApi.allServerViewHost.success(data);
            var serverName = '';
            var serverIP = '';
            var serverPerCPU = 0;
            var serverPerMemory = 0;
            var serverPerDisk = 0;
            var serverOS = '-';
            var serverCPU = '-';
            var serverRAM = '-';

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

            })
        });
    },

    //host 정보 호출
    hostInfoView: function () {
        console.log("IN function hostInfoView");
        zbxApi.host.get().done(function (data, status, jqXHR) {
            var host_data = zbxApi.host.success(data);
            var tagId = '';
            var tagText = '';
            var tagText2 = '';

            $.each(host_data.result, function (k, v) {
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

                $("#" + tagId + "_performlist").append(tagText2);

                $("#info_" + v.hostid).click(function () { /* 서버 정보 요약 */
                    $("[id^=base]").hide();
                    $("#base_serverInfo").show();
                    var hostid = v.hostid;
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);

                    var serverCpuSystem = null;
                    var serverCpuUser = null;
                    var serverCpuIoWait = null;
                    var serverCpuSteal = null;
                    var serverDiskUseRoot = null;
                    var serverMemoryUse = null;
                    var serverTraInEth0 = null;
                    var serverTraOutEth0 = null;
                    var serverTraTotalEth0 = null;

                    zbxApi.serverViewGraph.get(v.hostid, "system.cpu.util[,system]").then(function (data){
                        serverCpuSystem = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "system.cpu.util[,user]");
                    }).then(function (data){
                        serverCpuUser = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "system.cpu.util[,iowait]");
                    }).then(function (data){
                        serverCpuIoWait = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "system.cpu.util[,steal]");
                    }).then(function (data){
                        serverCpuSteal = zbxApi.serverViewGraph.success(data);
                    }).then(function(){
                        return zbxApi.serverViewGraphName.get(v.hostid, "Used memory(%)");
                    }).then(function (data){
                        serverMemoryUse = zbxApi.serverViewGraphName.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "vfs.fs.size[/,pused]");
                    }).then(function (data){
                        serverDiskUseRoot = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "net.if.in[eth0]");
                    }).then(function (data){
                        serverTraInEth0 = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "net.if.out[eth0]");
                    }).then(function (data){
                        serverTraOutEth0 = zbxApi.serverViewGraph.success(data);
                    }).then(function (){
                        return zbxApi.serverViewGraph.get(v.hostid, "net.if.total[eth0]");
                    }).then(function (data){
                        serverTraTotalEth0 = zbxApi.serverViewGraph.success(data);
                        serverOverGraphView(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverDiskUseRoot, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime);
                    });

                    processView(hostid, startTime);

                    zbxApi.serverViewHost.get(v.hostid).done(function(data, status, jqXHR){
                        var server_host = zbxApi.serverViewHost.success(data);
                        var serverTitle = '';
                        var serverIP = '';
                        var serverOS = '';
                        var serverName = '';
                        var serverAgentVersion = '';

                        $.each(server_host.result, function (k, v){
                            serverTitle = v.host;
                            serverIP = v.interfaces[0].ip;
                            serverOS = v.inventory.os;
                            serverName = v.name;
                            serverAgentVersion = zbxSyncApi.allServerViewItem(v.hostid, "agent.version").lastvalue; //agent.version

                            serverOverViewInfo(serverTitle, serverIP, serverOS, serverName, serverAgentVersion);
                        })
                    });

                    EventListView(hostid);
                });

                $("#cpu_" + v.hostid).click(function () { //CPU
                	$("#btn_cpu.btn").click(function() {
                		var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);         		
                		cpuStatsView(v.hostid,startTime);
                	});
                	
                	var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);
                	$("[id^=base]").hide();
                	$("#base_cpuinfo").show();
                	//1 callApiForCpu(v.hostid,startTime);
                	cpuStatsView(v.hostid,startTime);
                });

                $("#memory_" + v.hostid).click(function () { //Memory
                    //var oneDayLongTime = 3600000;

                    $("#btn_mem.btn").click(function() {
                        var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
                        callApiForMem(v.hostid,startTime);
                    });
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);
                    callApiForMem(v.hostid,startTime);
                });

                $("#process_" + v.hostid).click(function () { //Process
                	var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);
                	$.blockUI(blockUI_opt_all);
                	$("[id^=base]").hide();
                	$("#base_processInfo").show();
                	procUsageView(v.hostid, startTime);
                });

                $("#disk_" + v.hostid).click(function () { //Disk
                    $("[id^=base]").hide();
                    $("#base_diskInfo").show();

                    var hostid = v.hostid;
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);
                    var disk_data = '';

                    zbxApi.getDiskItem.get(hostid).done(function(data, status, jqXHR){
                        disk_data = zbxApi.getDiskItem.success(data);
                        diskView(hostid, disk_data, startTime);
                    });
                });

                $("#traffic_" + v.hostid).click(function () {
                    $("[id^=base]").hide();
                    $("#base_networkInfo").show();

                    var hostid = v.hostid;
                    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * 12) / 1000);
                    var network_data = '';

                    zbxApi.getNetworkItem.get(hostid).done(function(data, status, jqXHR){
                        network_data = zbxApi.getNetworkItem.success(data);
                        networkView(hostid, network_data, startTime);
                    });
                });

                $("#" + tagId).click(function () {
                    $("[id^=base]").hide();
                    //$("#base_hostinfo").show();
                    //hostinfoView();
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

var serverOverGraphView = function(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, serverMemoryUse, serverDiskUseRoot, serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime){
    showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime);
    showServerMemory(serverMemoryUse, startTime);
    showServerDisk(serverDiskUseRoot, startTime);
    showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime);
    //$.unblockUI(blockUI_opt_all);
};

function showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime){
    var serverCpuSystemArr = [];
    var serverCpuUserArr = [];
    var serverCpuIoWaitArr = [];
    var serverCpuStealArr = [];

    var history_cpuSytem = null;
    var history_cpuUser = null;
    var history_cpuIoWait = null;
    var history_cpuSteal = null;

    zbxApi.getHistory.get(serverCpuSystem.result[0].itemid, startTime, 0).then(function(data){
        history_cpuSytem = zbxApi.getHistory.success(data);
        $.each(history_cpuSytem.result, function(k, v){
            serverCpuSystemArr[k] = new Array();
            serverCpuSystemArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuSystemArr[k][1] = parseFloat(v.value);
        });
    }).then(function(){
        return zbxApi.getHistory.get(serverCpuUser.result[0].itemid, startTime, 0);
    }).then(function(data){
        history_cpuUser = zbxApi.getHistory.success(data);
        $.each(history_cpuUser.result, function(k, v){
            serverCpuUserArr[k] = new Array();
            serverCpuUserArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuUserArr[k][1] = parseFloat(v.value);
        });
    }).then(function(){
        return zbxApi.getHistory.get(serverCpuIoWait.result[0].itemid, startTime, 0);
    }).then(function(data){
        history_cpuIoWait = zbxApi.getHistory.success(data);
        $.each(history_cpuIoWait.result, function(k, v){
            serverCpuIoWaitArr[k] = new Array();
            serverCpuIoWaitArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuIoWaitArr[k][1] = parseFloat(v.value);
        });
    }).then(function(){
        return zbxApi.getHistory.get(serverCpuSteal.result[0].itemid, startTime, 0);
    }).then(function(data){
        history_cpuSteal = zbxApi.getHistory.success(data);
        $.each(history_cpuSteal.result, function(k, v){
            serverCpuStealArr[k] = new Array();
            serverCpuStealArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuStealArr[k][1] = parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('cpuUse', {
                chart: {
                    type: 'area',
                    zoomType: 'x',
                    height: 250,
                    spacingTop: 10,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: 'CPU 사용량'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    min: 0,
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function(){
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                    }
                },
                plotOptions: {
                    area: {
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
                    name: 'CPU System',
                    data: serverCpuSystemArr
                }, {
                    name: 'CPU User',
                    data: serverCpuUserArr
                }, {
                    name: 'CPU IoWait',
                    data: serverCpuIoWaitArr
                }, {
                    name: 'CPU Steal',
                    data: serverCpuStealArr
                }]
            });
        });
    });
}

function showServerMemory(serverMemoryUse, startTime){
    var serverMemoryUseArr = [];

    var history_memoryUse = null;

    zbxApi.getHistory.get(serverMemoryUse.result[0].itemid, startTime, 0).then(function(data){
        history_memoryUse = zbxApi.getHistory.success(data);
        $.each(history_memoryUse.result, function(k, v){
            serverMemoryUseArr[k] = new Array();
            serverMemoryUseArr[k][0]=parseInt(v.clock) * 1000;
            serverMemoryUseArr[k][1]=parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('memoryAll', {
                chart: {
                    type: 'area',
                    zoomType: 'x',
                    height: 250,
                    spacingTop: 10,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: '전체메모리'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    min: 0,
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function(){
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                    }
                },
                plotOptions: {
                    area: {
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
                    name: 'Memory Use',
                    data: serverMemoryUseArr
                }]
            });
        });

    })
}

function showServerDisk(serverDiskUseRoot, startTime){
    var serverDiskUseRootArr = [];

    var history_diskUseRoot = null;

    zbxApi.getHistory.get(serverDiskUseRoot.result[0].itemid, startTime, 0).then(function(data){
        history_diskUseRoot = zbxApi.getHistory.success(data);
        $.each(history_diskUseRoot.result, function(k, v){
            serverDiskUseRootArr[k] = new Array();
            serverDiskUseRootArr[k][0] = parseInt(v.clock) * 1000;
            serverDiskUseRootArr[k][1] = parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('diskUse', {
                chart: {
                    zoomType: 'x',
                    height: 250,
                    spacingTop: 10,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: '디스크 사용량'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    min: 0,
                    max: 100,
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function(){
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Disk Use : /',
                    data: serverDiskUseRootArr
                }]
            });
        });

    })
}

function showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime){
    var serverTraInEth0Arr = [];
    var serverTraOutEth0Arr = [];
    var serverTraTotEth0Arr = [];

    var history_traInEth0 = null;
    var history_traOutEth0 = null;
    var history_traTotEth0 = null;

    zbxApi.getHistory.get(serverTraInEth0.result[0].itemid, startTime, 3).then(function(data) {
        history_traInEth0 = zbxApi.getHistory.success(data);
        $.each(history_traInEth0.result, function (k, v) {
            serverTraInEth0Arr[k] = new Array();
            serverTraInEth0Arr[k][0] = parseInt(v.clock) * 1000;
            serverTraInEth0Arr[k][1] = parseInt(v.value) / 1000;
        });
    }).then(function(){
        return zbxApi.getHistory.get(serverTraOutEth0.result[0].itemid, startTime, 3);
    }).then(function(data){
        history_traOutEth0 = zbxApi.getHistory.success(data);
        $.each(history_traOutEth0.result, function(k, v){
            serverTraOutEth0Arr[k] = new Array();
            serverTraOutEth0Arr[k][0] = parseInt(v.clock) * 1000;
            serverTraOutEth0Arr[k][1] = parseInt(v.value) / 1000;
        });
    }).then(function(){
        return zbxApi.getHistory.get(serverTraTotalEth0.result[0].itemid, startTime, 3);
    }).then(function(data){
        history_traTotEth0 = zbxApi.getHistory.success(data);
        $.each(history_traTotEth0.result, function(k, v){
            serverTraTotEth0Arr[k] = new Array();
            serverTraTotEth0Arr[k][0] = parseInt(v.clock) * 1000;
            serverTraTotEth0Arr[k][1] = parseInt(v.value) / 1000;
        });

        $(function () {
            Highcharts.chart('trafficUse', {
                chart: {
                    zoomType: 'x',
                    height: 250,
                    spacingTop: 10,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: '트래픽 사용량'
                },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value / 1000 + 'kbps';
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "Kbps </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Traffic In Eth0',
                    data: serverTraInEth0Arr
                }, {
                    name: 'Traffic Out Eth0',
                    data: serverTraOutEth0Arr
                }, {
                    name: 'Traffic Total Eth0',
                    data: serverTraTotEth0Arr
                }]
            });
        });
    })
}

var processView = function(hostid, startTime){
    var data_topProcess = null;

    new $.jqzabbix(options).getApiVersion().then(function(data){
        data_topProcess = callApiForCpuUsedProcess(hostid);
        var topProcessLastClock = parseInt(data_topProcess.lastclock) * 1000;
        var d2 = new Date(topProcessLastClock);
        var topProcessLastTime = d2.getFullYear() + "-" + d2.getMonth()+1 + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();

        data_topProcess = sortProcInCpuOrder(data_topProcess, topProcessLastTime);
        showServerProcess(hostid, data_topProcess, topProcessLastTime);
    });
}

var showServerProcess = function(hostid, finalProcArr, topProcessLastTime){
    var processTbl = '';
    var MAX_PROCCOUNT = 7;

    processTbl += "<thead>";
    processTbl += "<tr role='row'>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>이름</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>cpu</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>메모리</th>";
    processTbl += "<th tabindex='0' aria-controls='processList' rowspan='1' colspan='1'>수</th>";
    processTbl += "</tr>";
    processTbl += "</thead>";

    processTbl += "<tbody>";

    $.each(finalProcArr, function(k, v){
        if(k<MAX_PROCCOUNT){
            var procNameArr = '';
            var procName = '';
            var procCpuValue = v.procCpu.toFixed(1);

            if(v.procName.indexOf("/0") != -1){
                procName = v.procName;
            }else{
                procNameArr = v.procName.split("/");
                procName = procNameArr[procNameArr.length-1];
            }

            processTbl += "<tr id='" + procName + "' role='row' class='odd'>";
            processTbl += "<td><span class='ellipsis' title='" + procName + "'>" + procName + "</span></td>";
            processTbl += "<td>" + procCpuValue + "</td>";
            processTbl += "<td>" + procCpuValue + "<span class='smaller'>MB</span></td>";
            processTbl += "<td>" + v.procCnt + "</td>";
            processTbl += "</tr>";
        }
    });

    processTbl += "</tbody>";

    $("#processTime").text(topProcessLastTime);
    $("#serverProcessList").empty();
    $("#serverProcessList").append(processTbl);
}

var EventListView = function(hostid){//서버정보요약 - 이벤트목록
    var data_EventList = null;

    new $.jqzabbix(options).getApiVersion().then(function(data){
        data_EventList = callApiForServerEvent(hostid);
        showServerEventList(hostid, data_EventList);
    });
}

var showServerEventList = function(hostid, data_EventList){ //서버정보요약 - 이벤트목록
    var eventTbl = '';

    eventTbl += "<thead>";
    eventTbl += "<tr role='row'>";
    eventTbl += "<th>이벤트 등급</th>";
    eventTbl += "<th>상태</th>";
    eventTbl += "<th>발생시간</th>";
    eventTbl += "<th>지속시간</th>";
    eventTbl += "<th>인지</th>";
    eventTbl += "<th>호스트명</th>";
    eventTbl += "<th>비고</th>";
    eventTbl += "</tr>";
    eventTbl += "</thead>";

    eventTbl += "<tbody>";

    $.each(data_EventList, function(k, v){
        var severity = convPriorityServer(v.priority);
        var status = convStatusServer(v.value);
        var lastchange = convTime(v.lastchange);
        var age = convDeltaTime(v.lastchange);
        var ack = convAckServer(v.lastEvent.acknowledged);
        var host = v.hosts[0].host;
        var description = v.description;

        eventTbl += "<tr role='row'>";
        eventTbl += "<td>" + severity + "</td>";
        eventTbl += "<td>" + status + "</td>";
        eventTbl += "<td>" + lastchange + "</td>";
        eventTbl += "<td>" + age + "</td>";
        eventTbl += "<td>" + ack + "</td>";
        eventTbl += "<td>" + host + "</td>";
        eventTbl += "<td>" + description + "</td>";
        eventTbl += "</tr>";
    });

    eventTbl += "</tbody>";
    $("#serverEventList").empty();
    $("#serverEventList").append(eventTbl);
}

var serverOverViewInfo = function(serverTitle, serverIP, serverOS, serverName, serverAgentVersion){
    $("#serverInfo").empty();

    var serverInfoTbl = '';
    serverInfoTbl += "<tr><td>운영체제</td><td>"+serverOS+"</td></tr>";
    serverInfoTbl += "<tr><td>서버명</td><td>"+serverTitle+"</td></tr>";
    serverInfoTbl += "<tr><td>IP주소</td><td>"+serverIP+"</td></tr>";
    serverInfoTbl += "<tr><td>호스트명</td><td>"+serverName+"</td></tr>";
    serverInfoTbl += "<tr><td>에이전트</td><td>"+serverAgentVersion+"</td></tr>";
    $("#serverInfo").append(serverInfoTbl);
};

var procUsageView = function(hostid, startTime) {

	$.blockUI(blockUI_opt_all);
	
	var topProcessLastClock = null;
	var ProcessTableHTML = '';
	var MAX_PROCCOUNT = 13;
	var currentProcessName = null;
	var tableDataObj = new Object();
	var tableDataArr = [];
	var lastProcessData = callApiForProcessTable(hostid);
	var lastClockLongType = parseInt(lastProcessData.lastclock) * 1000;
	var date = new Date(lastClockLongType);
	var lastClockForProcessTable = date.getFullYear() + "-" + (parseInt(date.getMonth())+1) + "-" + date.getDate()  + " " + date.getHours() + ":" + date.getMinutes();
	var sortProcessForTable = sortProcInCpuOrder(lastProcessData);
	
	ProcessTableHTML += "<thead>";
	ProcessTableHTML += "<tr role='row'>";
	ProcessTableHTML += "<th class='percent-text sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='CPU: 오름차순 정렬' aria-sort='descending'>이름</th>";
	ProcessTableHTML += "<th width='15%' class='text-left sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='이름: 오름차순 정렬'>cpu</th>";
	ProcessTableHTML += "<th class='pr-none sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='메모리: 오름차순 정렬'>메모리</th>";
	ProcessTableHTML += "<th class='text-center pr-none sorting' tabindex='0' aria-controls='processList' rowspan='1' colspan='1' aria-label='수: 오름차순 정렬'>수</th>";
	ProcessTableHTML += "</tr>";
	ProcessTableHTML += "</thead>";
	ProcessTableHTML += "<tbody>";
	 
	//ps 데이터의  마지막  값을 테이블에 삽입 
	$.each(sortProcessForTable, function(k,v) {
		
		tableDataObj = new Object();
		
		tableDataObj.procName = v.procName;
		tableDataObj.cpuValue = parseFloat(v.totalCpuVal.toFixed(1));
		tableDataObj.memValue = parseFloat(v.totalMemVal.toFixed(1));
		tableDataObj.procCnt = parseInt(v.procCnt);
		tableDataArr.push(tableDataObj);
		
		if(k<MAX_PROCCOUNT){
		
			var procCpuValue = v.totalCpuVal.toFixed(1);
			var procMemValue = v.totalMemVal.toFixed(1);

			ProcessTableHTML += "<tr id='" + v.procName + "' role='row' class='odd'>";
			ProcessTableHTML += "<td class='text-left sorting_1'><span class='ellipsis' title='" + v.procName + "'>" + v.procName + "</span></td>";
			ProcessTableHTML += "<td class='percent-text sorting_3'>" + procCpuValue + "</td>";
			ProcessTableHTML += "<td class='pr-none sorting_2'>" + procMemValue + "<span class='smaller'>MB</span></td>";
			ProcessTableHTML += "<td class='text-center pr-none'>" + v.procCnt + "</td>";
			ProcessTableHTML += "</tr>";
		} 
	});
	
	ProcessTableHTML += "</tbody>";
	 
    $("#detailedProcTime").text(lastClockForProcessTable);
	$("#detailedCpuProc").empty();
    $("#detailedCpuProc").append(ProcessTableHTML);
    $("#chart_processCpu").empty();
	$("#chart_processMem").empty();
	var $table = $("#detailedCpuProc");
	$("#detailedCpuProc > tbody > tr").eq(0).addClass("selectedProcess");
	currentProcessName = $(".selectedProcess").attr('id');
	generateProcessResource(hostid, currentProcessName, startTime);
	
    
    // table의 row에 클릭시 하이라이트 처리 및 해당 프로세스 차트를 만드는 클릭 이벤트 생성 
	rowClickEvent($table, hostid, startTime);
	
	// 시간 버튼 클릭시, 현재 프로세스의 차트를 생성하는 클릭 이벤트 생성
    $("#btn_proc.btn").click(function() {
		var startTime1 = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
		var currentProcessName = $(".selectedProcess").attr('id');
		generateProcessResource(hostid, currentProcessName, startTime1);
	});
    
    // 테이블의 th col 클릭시, 정렬 된 테이블 내용 생성 및 각 행의 클릭이벤트(하이라이트, 차트) 생성
    $('th', $table).each(function (column){
		$(this).click(function(){
			var procTableRow = '';
			var currentThObj = $(this);
			var MAX_PROCCOUNT = 13;
			var tmpProcessName = $(".selectedProcess").attr('id');
			
			if($(this).is('.sorting_desc')){
				tableDataArr.sort(function (a, b) { 
					if(column == 0){
						return a.procName < b.procName ? -1 : a.procName > b.procName ? 1 : 0;
					}else if(column == 1){
						return a.cpuValue < b.cpuValue ? -1 : a.cpuValue > b.cpuValue ? 1 : 0;
					}else if(column == 2){
						return a.memValue < b.memValue ? -1 : a.memValue > b.memValue ? 1 : 0;
					}else if(column == 3){
						return a.procCnt < b.procCnt ? -1 : a.procCnt > b.procCnt ? 1 : 0;
					}
				});
				currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
			}else{
				tableDataArr.sort(function (a, b) { 
					if(column == 0){
						return a.procName > b.procName ? -1 : a.procName < b.procName ? 1 : 0; 
					}else if(column == 1){
						return a.cpuValue > b.cpuValue ? -1 : a.cpuValue < b.cpuValue ? 1 : 0;
					}else if(column == 2){
						return a.memValue > b.memValue ? -1 : a.memValue < b.memValue ? 1 : 0;
					}else if(column == 3){
						return a.procCnt > b.procCnt ? -1 : a.procCnt < b.procCnt ? 1 : 0;
					}
				});
				currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
			}
			$('tbody', $table).empty();
			
			for(var i=0; i<MAX_PROCCOUNT; i++){
				procTableRow += "<tr id='" + tableDataArr[i].procName + "' role='row' class='odd'>";
				procTableRow += "<td class='text-left sorting_1'><span class='ellipsis' title='" + tableDataArr[i].procName + "'>" + tableDataArr[i].procName + "</span></td>";
				procTableRow += "<td class='percent-text sorting_3'>" + tableDataArr[i].cpuValue + "</td>";
				procTableRow += "<td class='pr-none sorting_2'>" + tableDataArr[i].memValue + "<span class='smaller'>MB</span></td>";
				procTableRow += "<td class='text-center pr-none'>" + tableDataArr[i].procCnt + "</td>";
				procTableRow += "</tr>";
			}
			$('tbody', $table).append(procTableRow);
			$("#"+tmpProcessName).addClass("selectedProcess");
			rowClickEvent($table, hostid, startTime);
		});// end click
    });// end th col
		
	$.unblockUI(blockUI_opt_all);
}

var rowClickEvent = function(table, hostid, startTime){
	$('tr', table).each(function (row){
    	if(row>0){
	    	$(this).click(function(){
	    		var currentProcessName = $(this).attr('id');
	    		$(".selectedProcess").removeClass("selectedProcess");
	    		$(this).addClass("selectedProcess");
	    		$(this).children().css("border-top", "1px #FF5E00 solid").css("border-bottom", "1px #FF5E00 solid");
	    		$(this).children().eq(0).css("border-left", "1px #FF5E00 solid");
	    		$(this).children().eq(3).css("border-right", "1px #FF5E00 solid");
	    		$(this).prevAll().children().removeAttr('style');
	    		$(this).nextAll().children().removeAttr('style');
	    		generateProcessResource(hostid, currentProcessName, startTime);
	    	});
    	}
    });
}

var generateProcessResource = function(hostid, processName, startTime) {

	var itemId = null;
	var dataObj = new Object();
	var cpuArr = [];
	var memArr = [];
	var dataSet = [];
	var itemKey = "system.run[\"ps -eo user,pid,ppid,pmem,pcpu,time,cmd --sort=-pcpu\"]";
	$("#chart_processCpu").block(blockUI_opt_all_custom);
	$("#chart_processMem").block(blockUI_opt_all_custom);

	zbxApi.getItem.get(hostid,itemKey).then(function(data) {
		var item = zbxApi.getItem.success(data);
		itemId = item.result[0].itemid;
		
	}).then(function() {
		return zbxApi.getProcHistory.get(itemId, startTime, HISTORY_TYPE.LOG);
		 
	}).then(function(data) {
		var hisData = zbxApi.getProcHistory.success(data);
		var hisDataCount = hisData.result.length;
		var showDataCount = 180;
		var hisDataInterval = 1;		
		if(hisDataCount >= 180){			
			hisDataInterval = Math.round(hisDataCount / showDataCount);
		}
		for(var i=0,j=0; i<hisDataCount; i+=hisDataInterval,j++){ // 전체 히스토리 데이터에서 일부만 추출

			var cpuDataObj = null;
			var cpuDataSet = [];
			var cpuSumVal = 0;
			var memDataObj = null;
			var memDataSet = [];
			var memSumVal = 0.0;
			var ProcRowArr = data.result[i].value.split("\n");
			
			$.each(ProcRowArr, function(k,v) { // 각 행별,프로세스 명을 비교하여 cpu, mem 값을 sum.
				if(ProcRowArr[k].indexOf(processName) != -1){

					while(ProcRowArr[k].indexOf("  ") != -1){
						ProcRowArr[k] = ProcRowArr[k].replace('  ',' ');
					}
					var ProcColArr = ProcRowArr[k].split(" ");	
					var tempProcName = null;
					var procNameArr = [];
					
					if(ProcColArr[6].indexOf("/0") != -1){
						tempProcName = ProcColArr[6];
					}else{
						procNameArr = ProcColArr[6].split("/");
						tempProcName = procNameArr[procNameArr.length-1];
					}
					tempProcName = tempProcName.replace(/\:/g, '');
					if(tempProcName == processName){
						cpuSumVal += parseFloat(ProcColArr[4]);
						memSumVal += parseFloat(ProcColArr[3]);
					}	
				}
			});
			// 각 히스토리 데이터 cpu, mem의 sum값을 data 배열에 담는다.
			cpuArr[j] = new Array();
			cpuArr[j][0]=parseInt(data.result[i].clock) * 1000;
			cpuArr[j][1]=parseFloat(cpuSumVal.toFixed(1));
			memArr[j] = new Array();
			memArr[j][0]=parseInt(data.result[i].clock) * 1000;
			memArr[j][1]=parseFloat(memSumVal.toFixed(1));
		}

		//차트에 전달할 데이터셋 생성
		cpuDataObj = new Object();
		cpuDataObj.name = processName;
		cpuDataObj.data = cpuArr;
		cpuDataSet.push(cpuDataObj);
		
		memDataObj = new Object();
		memDataObj.name = processName;
		memDataObj.data = memArr;
		memDataSet.push(memDataObj);

		showBasicLineChart('chart_processCpu', 'CPU', cpuDataSet, "%", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
		showBasicAreaChart('chart_processMem', 'Memory', memDataSet, "MB", ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
	});
}


var diskView = function(hostid, disk_data, startTime){
    var disk_itemid = '';
    var disk_itemKey = '';
    var diskTbl = '';

    $.each(disk_data.result, function(disk_k, disk_v) {
        disk_itemid = disk_v.itemid;
        disk_itemKey = disk_v.key_;
        console.log("disk_itemid : " + disk_itemid);
        console.log("disk_itemKey : " + disk_itemKey);

        var itemKey = disk_itemKey.substring(disk_itemKey.indexOf("[")+1,disk_itemKey.indexOf(","));
        console.log("itemKey : " + itemKey);

        diskTbl += "<h4 id='" + itemKey + "'>" + itemKey + "</h4>";

        $("#diskList").empty();
        $("#diskList").append(diskTbl);

        var $table = $("#diskList");
        $('h4', $table).each(function(table_k, table_v) {
            $(this).click(function() {
                console.log(">>>>>> " + $(this).attr('id'));

                var tmpDiskName = $(this).attr('id');

                var diskInode = '';
                var diskFree = '';
                var diskUse = '';

                var diskItemKeyInode = "vfs.fs.inode[" + tmpDiskName + ",pfree]";
                var diskItemKeyFree = "vfs.fs.size[" + tmpDiskName + ",pfree]";
                var diskItemKeyUse = "vfs.fs.size[" + tmpDiskName + ",pfree]";

                console.log(">>>>> hostid <<<<< : " + hostid);
                console.log("diskItemKeyInode " + diskItemKeyInode);
                console.log("diskItemKeyFree : " + diskItemKeyFree);
                console.log("diskItemKeyTotal : " + diskItemKeyUse);

                zbxApi.serverViewGraph.get(hostid, diskItemKeyInode).then(function(data) {
                    diskInode = zbxApi.serverViewGraph.success(data);
                }).then(function (){
                    return zbxApi.serverViewGraph.get(hostid, diskItemKeyFree);
                }).then(function (data){
                    diskFree = zbxApi.serverViewGraph.success(data);
                }).then(function (){
                    return zbxApi.serverViewGraph.get(hostid, diskItemKeyUse);
                }).then(function (data){
                    diskUse = zbxApi.serverViewGraph.success(data);
                    showDiskView(diskInode, diskFree, diskUse, startTime);
                });
            })
        });
    });
}

var showDiskView = function(diskInode, diskFree, diskUse, startTime){
    showInFrDisk(diskInode, diskFree, startTime);
    showUseDisk(diskUse, startTime);
};

function showInFrDisk(diskInode, diskFree, startTime){
    var diskInodeArr = [];
    var diskFreeArr = [];

    var history_diskInode = null;
    var history_diskFree = null;

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, 0).then(function(data){
        history_diskInode = zbxApi.getHistory.success(data);
        $.each(history_diskInode.result, function(k, v){
            diskInodeArr[k] = new Array();
            diskInodeArr[k][0] = parseInt(v.clock) * 1000;
            diskInodeArr[k][1] = parseFloat(v.value);
        });
    }).then(function (){
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, 0);
    }).then(function(data){
        history_diskFree = zbxApi.getHistory.success(data);
        $.each(history_diskFree.result, function(k, v){
            diskFreeArr[k] = new Array();
            diskFreeArr[k][0] = parseInt(v.clock) * 1000;
            diskFreeArr[k][1] = parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('chart_diskIo', {
                chart: {
                    zoomType: 'x',
                    type: 'area',
                    spacingTop: 2,
                    spacingBottom: 0
                },
                title: {
                    text: '디스크 I/O',
                    align: 'left'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Disk Inode',
                    data: diskInodeArr
                }, {
                    name: 'Disk Free',
                    data: diskFreeArr
                }]
            });
        });
    })
}

function showUseDisk(diskUse, startTime){
    var diskUseArr = [];

    var history_diskUse = null;

    zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, 0).then(function(data){
        history_diskUse = zbxApi.getHistory.success(data);
        $.each(history_diskUse.result, function (k, v) {
            diskUseArr[k] = new Array();
            diskUseArr[k][0] = parseInt(v.clock) * 1000;
            diskUseArr[k][1] = 100 - parseFloat(v.value);
        });

        $(function () {
            Highcharts.chart('chart_diskUse', {
                chart: {
                    zoomType: 'x',
                    type: 'area',
                    spacingTop: 2,
                    spacingBottom: 0
                },
                title: {
                    text: '디스크 Total',
                    align: 'left'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Disk Use',
                    data: diskUseArr
                }]
            });
        });
    })
}

var networkView = function(hostid, network_data, startTime){
    var network_itemid = '';
    var network_itemKey = '';
    var networkTbl = '';

    $.each(network_data.result, function(network_k, network_v){
        network_itemid = network_v.itemid;
        network_itemKey = network_v.key_;

        console.log("network_itemid : " + network_itemid);
        console.log("network_itemKey : " + network_itemKey);

        var networkKey = network_itemKey.substring(network_itemKey.indexOf("[")+1,network_itemKey.indexOf("]"));
        console.log("networkKey : " + networkKey);
        networkTbl += "<h4 id='" + networkKey + "'>" + networkKey + "</h4>";

        $("#networkList").empty();
        $("#networkList").append(networkTbl);

        var $table = $("#networkList");
        $('h4', $table).each(function(table_k, table_v) {
            $(this).click(function() {
                console.log(">>>>>> " + $(this).attr('id'));

                var tmpNetworkName = $(this).attr('id');

                var networkIn = '';
                var networkOut = '';
                var networkTotal = '';

                var networkItemKeyIn = "net.if.in[" + tmpNetworkName + "]";
                var networkItemKeyOut = "net.if.out[" + tmpNetworkName + "]";
                var networkItemKeyTotal = "net.if.total[" + tmpNetworkName + "]";

                console.log(">>>>> hostid <<<<< : " + hostid);
                console.log("networkItemKeyIn : " + networkItemKeyIn);
                console.log("networkItemKeyOut : " + networkItemKeyOut);
                console.log("networkItemKeyTotal : " + networkItemKeyTotal);

                zbxApi.serverViewGraph.get(hostid, networkItemKeyIn).then(function(data) {
                    networkIn = zbxApi.serverViewGraph.success(data);
                }).then(function (){
                    return zbxApi.serverViewGraph.get(hostid, networkItemKeyOut);
                }).then(function (data){
                    networkOut = zbxApi.serverViewGraph.success(data);
                }).then(function (){
                    return zbxApi.serverViewGraph.get(hostid, networkItemKeyTotal);
                }).then(function (data){
                    networkTotal = zbxApi.serverViewGraph.success(data);
                    trafficView(networkIn, networkOut, networkTotal, startTime);
                });
            })
        })
    });
}

var trafficView = function(networkIn, networkOut, networkTotal, startTime){
    showInOutNetwork(networkIn, networkOut, startTime);
    showTotalNetwork(networkTotal, startTime);
};

function showInOutNetwork(networkIn, networkOut, startTime){
    var networkInArr = [];
    var networkOutArr = [];

    var history_networkIn = null;
    var history_networkOut = null;

    zbxApi.getHistory.get(networkIn.result[0].itemid, startTime, 3).then(function(data){
        history_networkIn = zbxApi.getHistory.success(data);
        $.each(history_networkIn.result, function(k, v){
            networkInArr[k] = new Array();
            networkInArr[k][0] = parseInt(v.clock) * 1000;
            networkInArr[k][1] = parseInt(v.value) / 1000;
        });
    }).then(function (){
        return zbxApi.getHistory.get(networkOut.result[0].itemid, startTime, 3);
    }).then(function(data){
        history_networkOut = zbxApi.getHistory.success(data);
        $.each(history_networkOut.result, function(k, v){
            networkOutArr[k] = new Array();
            networkOutArr[k][0] = parseInt(v.clock) * 1000;
            networkOutArr[k][1] = parseInt(v.value) / 1000;
        });

        $(function () {
            Highcharts.chart('chart_trafficIo', {
                chart: {
                    zoomType: 'x',
                    type: 'area',
                    spacingTop: 2,
                    spacingBottom: 0
                },
                title: {
                    text: '트래픽 I/O',
                    align: 'left'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value / 1000 + 'k';
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "Kbps </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Traffic In',
                    data: networkInArr
                }, {
                    name: 'Traffic Out',
                    data: networkOutArr
                }]
            });
        });
    })
}

function showTotalNetwork(networkTotal, startTime){
    var networkTotalArr = [];

    var history_networkTotal = null;

    zbxApi.getHistory.get(networkTotal.result[0].itemid, startTime, 3).then(function(data){
        history_networkTotal = zbxApi.getHistory.success(data);
        $.each(history_networkTotal.result, function (k, v) {
            networkTotalArr[k] = new Array();
            networkTotalArr[k][0] = parseInt(v.clock) * 1000;
            networkTotalArr[k][1] = parseInt(v.value) / 1000;
        });

        $(function () {
            Highcharts.chart('chart_trafficTotal', {
                chart: {
                    zoomType: 'x',
                    type: 'area',
                    spacingTop: 2,
                    spacingBottom: 0
                },
                title: {
                    text: '트래픽 Total',
                    align: 'left'
                },
                subtitle: { text:  '' },
                xAxis: {
                    labels: {
                        formatter: function () {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if(hours.length==1){
                                hours = "0" + hours;
                            }
                            if(minutes.length==1){
                                minutes = "0" + minutes;
                            }
                            if(seconds.length==1){
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value / 1000 + 'k';
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if(hours.length==1){
                            hours = "0" + hours;
                        }
                        if(minutes.length==1){
                            minutes = "0" + minutes;
                        }
                        if(seconds.length==1){
                            seconds = "0" + seconds;
                        }
                        return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "Kbps </b>";
                    }
                },
                plotOptions: {
                    marker: {
                        enabled: false,
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                series: [{
                    name: 'Traffic Total',
                    data: networkTotalArr
                }]
            });
        });
    })
}

var cpuStatsView = function(hostid, startTime) {
	
	var dataSet = [];
	var data_topProcess = null;
	
	$.blockUI(blockUI_opt_all);

	new $.jqzabbix(options).getApiVersion().then(function(data){
	
		dataSet = callApiForCpuUsage(hostid,startTime);
		showBasicAreaChart('chart_cpuUsage', 'CPU 사용량', dataSet, "%", ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']);
		
		dataSet = callApiForCpuLoadAvg(hostid,startTime);
		showBasicLineChart('chart_loadAverage', 'Load Average', dataSet, "", ['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']);
		
		data_topProcess = callApiForProcessTable(hostid);
		var topProcessLastClock = parseInt(data_topProcess.lastclock) * 1000;
		var d2 = new Date(topProcessLastClock);
		var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth())+1) + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();
		
		data_topProcess = sortProcInCpuOrder(data_topProcess);
		showProcessTable(data_topProcess,topProcessLastTime);
		
	    $.unblockUI(blockUI_opt_all);
    });
}
/*

 function callApiForCpuUsage(hostid,startTime) {
 var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;
 var dataSet = [];

 var CpuSystemArr = [];
 var CpuUserArr = [];
 var CpuIOwaitArr = [];
 var CpuStealArr = [];

 var history_CpuSystem = null;
 var history_CpuUser = null;
 var history_CpuIOwait = null;
 var history_CpuSteal = null;


 zbxApi.getItem.get(hostid,"system.cpu.util[,system]").then(function(data) {
 data_CpuSystem = zbxApi.getItem.success(data);
 //console.log("dataItem : " + JSON.stringify(dataItem));
 }).then(function() {
 // for suggest
 return zbxApi.getItem.get(hostid,"system.cpu.util[,user]");
 }).then(function(data) {
 data_CpuUser = zbxApi.getItem.success(data);
 }).then(function() {
 // for suggest
 return zbxApi.getItem.get(hostid,"system.cpu.util[,iowait]");
 }).then(function(data) {
 data_CpuIOwait = zbxApi.getItem.success(data);
 }).then(function() {
 // for suggest
 return zbxApi.getItem.get(hostid,"system.cpu.util[,steal]");
 }).then(function(data) {
 data_CpuSteal = zbxApi.getItem.success(data);
 }).then(function() {
 // for suggest
 var dataObj = new Object();

 dataObj.name = 'CPU System';
 dataObj.data = CpuSystemArr;
 dataSet.push(dataObj);

 dataObj = new Object();
 dataObj.name = 'CPU User';
 dataObj.data = CpuUserArr;
 dataSet.push(dataObj);

 dataObj = new Object();
 dataObj.name = 'CPU IO Wait';
 dataObj.data = CpuIOwaitArr;
 dataSet.push(dataObj);

 dataObj = new Object();
 dataObj.name = 'CPU Steal';
 dataObj.data = CpuStealArr;
 dataSet.push(dataObj);
 return dataSet;
 });
 }
 */

//** 함수이름 cpu 통계 화면 관리 명으로 변경(역할 : 화면 열고, 데이터 채우고 --> 각각 function으로분리), cpu data manager 객체 : api 호출해서 dataset 만들어서 넘김

var callApiForCpuUsage = function (hostid,startTime){ 
	
	var data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal = null;
	var dataSet = [];
	
	var CpuSystemArr = [];
	var CpuUserArr = [];
	var CpuIOwaitArr = [];
	var CpuStealArr = [];
	
	var history_CpuSystem = null;
	var history_CpuUser = null;
	var history_CpuIOwait = null;
	var history_CpuSteal = null;
	
	data_CpuSystem = zbxSyncApi.getItem(hostid,"system.cpu.util[,system]");
	data_CpuUser = zbxSyncApi.getItem(hostid,"system.cpu.util[,user]");
	data_CpuIOwait = zbxSyncApi.getItem(hostid,"system.cpu.util[,iowait]");
	data_CpuSteal = zbxSyncApi.getItem(hostid,"system.cpu.util[,steal]");
	

//	zbxApi.getItem.get(hostid,"system.cpu.util[,system]").then(function(data) {
//		data_CpuSystem = zbxApi.getItem.success(data);
//		//console.log("dataItem : " + JSON.stringify(dataItem));
//	}).then(function() {
//		// for suggest
//		return zbxApi.getItem.get(hostid,"system.cpu.util[,user]");
//	}).then(function(data) {
//		data_CpuUser = zbxApi.getItem.success(data);
//	}).then(function() {
//		// for suggest
//		return zbxApi.getItem.get(hostid,"system.cpu.util[,iowait]");
//	}).then(function(data) {
//		data_CpuIOwait = zbxApi.getItem.success(data);
//	}).then(function() {
//		// for suggest
//		return zbxApi.getItem.get(hostid,"system.cpu.util[,steal]");
//	}).then(function(data) {
//		data_CpuSteal = zbxApi.getItem.success(data);
//	}).then(function() {
//		// for suggest
//		var dataObj = new Object();
//		
//		dataObj.name = 'CPU System';
//		dataObj.data = CpuSystemArr;
//		dataSet.push(dataObj);
//		
//		dataObj = new Object();
//		dataObj.name = 'CPU User';
//		dataObj.data = CpuUserArr;
//		dataSet.push(dataObj);
//		
//		dataObj = new Object();
//		dataObj.name = 'CPU IO Wait';
//		dataObj.data = CpuIOwaitArr;
//		dataSet.push(dataObj);
//		
//		dataObj = new Object();
//		dataObj.name = 'CPU Steal';
//		dataObj.data = CpuStealArr;
//		dataSet.push(dataObj);
//		return dataSet;
//	});
//	
         
    history_CpuSystem = zbxSyncApi.getHistory(data_CpuSystem.itemid, startTime, HISTORY_TYPE.FLOAT);
    $.each(history_CpuSystem, function(k,v) {
    	CpuSystemArr[k] = new Array();
    	CpuSystemArr[k][0]=parseInt(v.clock) * 1000;
    	CpuSystemArr[k][1]=parseFloat(v.value);
	});	
    
    history_CpuUser = zbxSyncApi.getHistory(data_CpuUser.itemid, startTime, HISTORY_TYPE.FLOAT);
    $.each(history_CpuUser, function(k,v) {
    	CpuUserArr[k] = new Array();
    	CpuUserArr[k][0]=parseInt(v.clock) * 1000;
    	CpuUserArr[k][1]=parseFloat(v.value);
	});	
    
    history_CpuIOwait = zbxSyncApi.getHistory(data_CpuIOwait.itemid, startTime, HISTORY_TYPE.FLOAT);
    $.each(history_CpuIOwait, function(k,v) {
    	CpuIOwaitArr[k] = new Array();
    	CpuIOwaitArr[k][0]=parseInt(v.clock) * 1000;
    	CpuIOwaitArr[k][1]=parseFloat(v.value);
	});	
    
    history_CpuSteal = zbxSyncApi.getHistory(data_CpuSteal.itemid, startTime, HISTORY_TYPE.FLOAT);
    $.each(history_CpuSteal, function(k,v) {
    	CpuStealArr[k] = new Array();
    	CpuStealArr[k][0]=parseInt(v.clock) * 1000;
    	CpuStealArr[k][1]=parseFloat(v.value);
	});	

	var dataObj = new Object();
	dataObj.name = 'CPU System';
	dataObj.data = CpuSystemArr;
	dataSet.push(dataObj);
	
	dataObj = new Object();
	dataObj.name = 'CPU User';
	dataObj.data = CpuUserArr;
	dataSet.push(dataObj);
	
	dataObj = new Object();
	dataObj.name = 'CPU IO Wait';
	dataObj.data = CpuIOwaitArr;
	dataSet.push(dataObj);
	
	dataObj = new Object();
	dataObj.name = 'CPU Steal';
	dataObj.data = CpuStealArr;
	dataSet.push(dataObj);
	
	return dataSet;
}

var callApiForCpuLoadAvg = function (hostid,startTime){ 

	var data_loadavg1, data_loadavg5, data_loadavg15 = null;
	var data_topProcess = null;
	var dataSet = [];

	var loadAvg1Arr = [];
	var loadAvg5Arr = [];
	var loadAvg15Arr = [];
	
	var history_loadavg1 = null;
	var history_loadavg5 = null;
	var history_loadavg15 = null;
	
	data_loadavg1 = zbxSyncApi.getItem(hostid,"system.cpu.load[percpu,avg1]");
    data_loadavg5 = zbxSyncApi.getItem(hostid,"system.cpu.load[percpu,avg5]");
    data_loadavg15 = zbxSyncApi.getItem(hostid,"system.cpu.load[percpu,avg15]");
     
    
     history_loadavg1 = zbxSyncApi.getHistory(data_loadavg1.itemid, startTime, HISTORY_TYPE.FLOAT);
     $.each(history_loadavg1, function(k,v) {
    	 loadAvg1Arr[k] = new Array();
    	 loadAvg1Arr[k][0]=parseInt(v.clock) * 1000;
    	 loadAvg1Arr[k][1]=parseFloat(v.value);
	});		
     
     history_loadavg5 = zbxSyncApi.getHistory(data_loadavg5.itemid, startTime, HISTORY_TYPE.FLOAT);
     $.each(history_loadavg5, function(k,v) {
    	 loadAvg5Arr[k] = new Array();
    	 loadAvg5Arr[k][0]=parseInt(v.clock) * 1000;
    	 loadAvg5Arr[k][1]=parseFloat(v.value);	
     });
     
     history_loadavg15 = zbxSyncApi.getHistory(data_loadavg15.itemid, startTime, HISTORY_TYPE.FLOAT);
     $.each(history_loadavg15, function(k,v) {
    	 loadAvg15Arr[k] = new Array();
    	 loadAvg15Arr[k][0]=parseInt(v.clock) * 1000;
    	 loadAvg15Arr[k][1]=parseFloat(v.value);
	});	

	var dataObj = new Object();
	
	dataObj.name = '1분 평균';
	dataObj.data = loadAvg1Arr;
	dataSet.push(dataObj);
	
	dataObj = new Object();
	dataObj.name = '5분 평균';
	dataObj.data = loadAvg5Arr;
	dataSet.push(dataObj);
	
	dataObj = new Object();
	dataObj.name = '15분 평균';
	dataObj.data = loadAvg15Arr;
	dataSet.push(dataObj);

	return dataSet;
}

var callApiForProcessTable = function(hostid){
	return zbxSyncApi.getItem(hostid,"system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
}

var callApiForServerEvent = function(hostid){
    return zbxSyncApi.serverViewTrigger(hostid);
}

var callApiForNetwork = function(hostid){
    return zbxSyncApi.getItem(hostid, "system.run[\"ifconfig\"]");
}

var sortProcInCpuOrder = function(data_topProcess){
	
	var topProcRowArr = data_topProcess.lastvalue.split("\n"); //각 행들의 집합
	var procUniqueName = [];
	var procNameOrderByCpu = [];
	var dataObj = null;
	var dataSet = [];
	
	//모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
	$.each(topProcRowArr, function(k,v) {
		while(topProcRowArr[k].indexOf("  ") != -1){
			topProcRowArr[k] = topProcRowArr[k].replace('  ',' ');
		}
		var topProcColArr = topProcRowArr[k].split(" ");	
		var procNameArr = [];
		var procName = '';
		if(topProcColArr[9].indexOf("/0") != -1){
			procName = topProcColArr[9];
		}else{
			procNameArr = topProcColArr[9].split("/");
			procName = procNameArr[procNameArr.length-1];
		}
		procName = procName.replace(/\:/g, '');
		
		procNameOrderByCpu[k] = procName;
		
		dataObj = new Object();
		dataObj.procName = procName;
		dataObj.procCpu = parseFloat(topProcColArr[7]);
		dataObj.procMem = parseFloat(topProcColArr[6]);
		dataSet.push(dataObj);
	});
	
	// 프로세스명 중복 제거 후, 프로세스 별 cpu 합 초기화
	procUniqueName = $.unique(procNameOrderByCpu);
	var procUniqueObj = null;
	var procTotalArr = [];
	$.each(procUniqueName, function(k,v){
		procUniqueObj = new Object();
		procUniqueObj.procName = v;
		procUniqueObj.totalCpuVal = 0;
		procUniqueObj.totalMemVal = 0;
		procUniqueObj.procCnt = 0;
		procTotalArr.push(procUniqueObj);
	});
	
	// 같은 프로세스 명끼리 cpu값 더함
	procTotalArr.splice(0,1);
	$.each(procTotalArr, function(k1,v1){
		$.each(dataSet, function(k2,v2){
			if(v1.procName == v2.procName){
				v1.totalCpuVal += v2.procCpu;
				v1.totalMemVal += v2.procMem;
				v1.procCnt += 1;
			}
		});
	});
	
	// cpu값을 기준으로 객체배열 내림차순 정렬
	procTotalArr.sort(function (a, b) { 
			return a.totalCpuVal > b.totalCpuVal ? -1 : a.totalCpuVal < b.totalCpuVal ? 1 : 0;
	});
	return procTotalArr;
}

var showProcessTable = function(finalProcArr, topProcessLastTime){
	
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
	 
	$.each(finalProcArr, function(k,v) {
		
		if(k<MAX_PROCCOUNT){
			var procNameArr = '';
			var procName = v.procName;
			var processPercentValue = v.totalCpuVal.toFixed(1);

			if(k==0){
				maxRefValue = processPercentValue;
				processGaugeValue = 100;
			}else{
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

/*
 var sortProcInCpuOrder = function(data_topProcess){

 var cpuValueOrderByDesc = []; // 내림차순으로 정렬된 cpu 사용량 필드 배열
 var orgProcArrOrderByCpu = []; // 정렬되기전 process 행 배열
 var finalProcArr = []; // 최종 Cpu 사용량 순으로 정렬된 process 행 배열
 var topProcRowArr = data_topProcess.lastvalue.split("\n"); //각 행들의 집합

 var procUniqueName = [];
 var procNameOrderByCpu = [];
 var dataObj = null;
 var dataSet = [];

 //모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
 $.each(topProcRowArr, function(k,v) {
 while(topProcRowArr[k].indexOf("  ") != -1){
 topProcRowArr[k] = topProcRowArr[k].replace('  ',' ');
 }
 //행의
 var topProcColArr = topProcRowArr[k].split(" ");
 cpuValueOrderByDesc[k] = parseFloat(topProcColArr[7]);
 orgProcArrOrderByCpu[k] = parseFloat(topProcColArr[7]);

 procNameOrderByCpu[k] = topProcColArr[9];

 dataObj = new Object();
 dataObj.procName = topProcColArr[9];
 dataObj.procCpu = parseFloat(topProcColArr[7]);
 dataSet.push(dataObj);
 });

 console.log("cpuValueOrderByDesc");
 console.log(cpuValueOrderByDesc);

 console.log("orgProcArrOrderByCpu");
 console.log(orgProcArrOrderByCpu);
 console.log("procNameOrderByCpu");
 console.log(procNameOrderByCpu);
 console.log("unique");
 var procUniqueName = $.unique(procNameOrderByCpu);
 var procUniqueSet = [];
 var procUniqueObj = null;
 console.log(procUniqueName);
 console.log("dataSet");
 console.log(dataSet);

 $.each(procUniqueName, function(k,v){
 procUniqueObj = new Object();
 procUniqueObj.procName = v;
 procUniqueObj.totalCpuVal = 0;
 procUniqueSet.push(procUniqueObj);
 });
 procUniqueSet.splice(0,1);
 $.each(procUniqueSet, function(k1,v1){
 $.each(dataSet, function(k2,v2){
 if(v1.procName == v2.procName){
 //console.log(k1 + " / "+ k2);
 //console.log(v2.procName + " : " + v2.procCpu);
 v1.totalCpuVal += v2.procCpu;
 }
 });
 });
 console.log("procUniqueSet");
 console.log(procUniqueSet);
 var sortedCpuValueArr = [];
 var cpuValueArr = [];
 $.each(procUniqueSet, function(k,v){
 console.log(v.procName + " : "+ v.totalCpuVal);
 sortedCpuValueArr[k] = v.totalCpuVal;
 });
 sortedCpuValueArr.sort(function(a, b){ return b-a; });
 console.log("sortedCpuValueArr");
 console.log(sortedCpuValueArr);

 var finalProcArr2  = [];
 var finalObj = null;
 $.each(sortedCpuValueArr, function(k1,v1){
 $.each(procUniqueSet, function(k2,v2){
 if(v1 == v2.totalCpuVal){
 finalObj = new Object();
 finalObj.procName = v2.procName;
 finalObj.procCpu = v2.totalCpuVal;
 finalProcArr2.push(finalObj);
 v2.totalCpuVal = -1;
 }
 });
 });

 console.log("finalProcArr2");
 console.log(finalProcArr2);


 cpuValueOrderByDesc.splice(0,1);
 cpuValueOrderByDesc.sort(function(a, b){ return b-a; });

 for(var i=0; i<cpuValueOrderByDesc.length; i++){
 for(var j=0; j<orgProcArrOrderByCpu.length; ++j){
 if(cpuValueOrderByDesc[i] == orgProcArrOrderByCpu[j]){
 finalProcArr[i] = topProcRowArr[j];
 orgProcArrOrderByCpu[j] = -1;
 break;
 }
 }
 }

 console.log("finalProcArr");
 console.log(finalProcArr);
 return finalProcArr;
 }


 var showProcessTable = function(finalProcArr, topProcessLastTime){

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

 $.each(finalProcArr, function(k,v) {

 if(k>0 && k<MAX_PROCCOUNT){
 var temp = finalProcArr[k].split(" ");
 var procNameArr = '';
 var procName = '';
 var processPercentValue = parseFloat(temp[7]);

 if(k==1){
 maxRefValue = processPercentValue;
 processGaugeValue = 100;
 }else{
 processGaugeValue = (processPercentValue * 100) / maxRefValue;
 }
 //			for(var i=9; i<=temp.length; ++i){
 //				if(temp[i] != null){
 //					procName += " " + temp[i];
 //				}
 //			}
 procNameArr = temp[9].split("/");
 procName = procNameArr[procNameArr.length-1];

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
 */

function showBasicAreaChart(chartId, chartTitle, dataSet, unit, colorArr){
	
	$(function () {
		/*
		Highcharts.setOptions({
	        //colors: colorArr//['#00B700','#DB9700', '#E3C4FF', '#8F8AFF']
			plotOptions: {
				series: {
	            	point: {
		                events: {
		                    mouseOver: function () {
		                        console.log('Moused over');
		                        console.log(this.x);
		                        console.log(this.y);
		                        console.log(this.series);
		                        console.log(this.series.chart);
		                    },
		                    mouseOut: function () {
		                        console.log('Moused out');
		                        console.log(this.x);
		                        console.log(this.y);
		                    }
		                }
	            	}
	            }
			}
	    });
	    */
		
		var chart1 = Highcharts.chart(chartId, {
			colors: colorArr,
	        chart: {
	            type: 'area',
	            zoomType: 'x',
	        	events: {
	        		load: function(event) {
	        			$("#"+chartId).unblock(blockUI_opt_el);
	                }
	        	}
	        },
	        title: {
	            text: chartTitle
	        },
	        subtitle: {
	            text: ''
	        },
	        xAxis: {
	            labels: {
	                formatter: function () {
	                	var d2 = new Date(this.value);
	                	var hours = "" + d2.getHours();
	                	var minutes = "" + d2.getMinutes();
	                	var seconds = "" + d2.getSeconds();
	                	if(hours.length==1){
	                		hours = "0" + hours;
	                	}
	                	if(minutes.length==1){
	                		minutes = "0" + minutes;
	                	}
	                	if(seconds.length==1){
	                		seconds = "0" + seconds;
	                	}
	                    return hours + ":" + minutes + ":" + seconds; 
	                }
	            }
	        	//categories: ['100', '300', '500', '700', '900', '1100']
	        	//tickInterval: 200
	        	//minorTickInterval: 'auto',
	            //startOnTick: true,
	            //endOnTick: true
	        },
	        yAxis: {
	            title: {
	                text: ''
	            },
	            labels: {
	                formatter: function () {
	                	return this.value + unit;
	                }
	            }
	        },
	        tooltip: {
	        	formatter: function () {
	        	  	var d2 = new Date(this.x);
                	var hours = "" + d2.getHours();
                	var minutes = "" + d2.getMinutes();
                	var seconds = "" + d2.getSeconds();
                	if(hours.length==1){
                		hours = "0" + hours;
                	}
                	if(minutes.length==1){
                		minutes = "0" + minutes;
                	}
                	if(seconds.length==1){
                		seconds = "0" + seconds;
                	}
                	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                   
                }
	        },
	        plotOptions: {
//	        	series: {
//	        		pointStart: startTimeForChart,
//	        		pointInterval: 24 * 3600 * 2
//	        	},
	        	area: {
	                //pointStart: startTimeForChart,
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
	        series: dataSet
	    });
	});
}

//** 차트에 callback 확인해볼 것.
function showBasicLineChart(chartId, chartTitle, dataSet, unit, colorArr){
	
	$(function () {
	    var chart2 = Highcharts.chart(chartId, {
	    	colors: colorArr,
	        chart: {
	            //type: 'area'
	        	zoomType: 'x',
	        	events: {
	        		load: function(event) {
	        			$("#"+chartId).unblock(blockUI_opt_el);
	                }
	        	}
	        },
	        title: {
	            text: chartTitle
	        },
	        subtitle: {
	            text: ''
	        },
	        xAxis: {
	        	labels: {
	                formatter: function () {
	                	var d2 = new Date(this.value);
	                	var hours = "" + d2.getHours();
	                	var minutes = "" + d2.getMinutes();
	                	var seconds = "" + d2.getSeconds();
	                	if(hours.length==1){
	                		hours = "0" + hours;
	                	}
	                	if(minutes.length==1){
	                		minutes = "0" + minutes;
	                	}
	                	if(seconds.length==1){
	                		seconds = "0" + seconds;
	                	}
	                    return hours + ":" + minutes + ":" + seconds; 
	                }
	        	}
	        },
	        yAxis: {
	            title: {
	                text: ''
	            },
	            labels: {
	                formatter: function () {
	                	return this.value + unit;
	                }
	            }
	        },
	        tooltip: {
	        	formatter: function () {
	        	  	var d2 = new Date(this.x);
                	var hours = "" + d2.getHours();
                	var minutes = "" + d2.getMinutes();
                	var seconds = "" + d2.getSeconds();
                	var retrunValue = null;
                	
                	if(hours.length==1){
                		hours = "0" + hours;
                	}
                	if(minutes.length==1){
                		minutes = "0" + minutes;
                	}
                	if(seconds.length==1){
                		seconds = "0" + seconds;
                	}
                	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;    
                }
	        },
	        plotOptions: {
	            area: {
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
	            },
	            series: {
	            	point: {
		                events: {
//		                    mouseOver: function () {
//		                        console.log('Moused over');
//		                        console.log(this.x);
//		                        console.log(this.y);
//		                        console.log(this.series);
//		                        console.log(this.series.chart);
//		                    },
//		                    mouseOut: function () {
//		                        console.log('Moused out');
//		                        console.log(this.x);
//		                        console.log(this.y);
//		                    }
		                }
	            	}
	            }
	        },
	        series: dataSet
	    });
	});
}

function callApiForMem(hostid,startTime){
	
	$.blockUI(blockUI_opt_all);
	$("[id^=base]").hide();
	$("#base_memoryInfo").show();
	var data_MemPused, data_SwapMemPused = null;
	var data_MemBuffers, data_MemCached, data_MemUsed = null;
	var data_topProcess = null;
	
	zbxApi.getItem.get(hostid,"vm.memory.size[pused]").then(function(data) {
		data_MemPused = zbxApi.getItem.success(data);
		//console.log("dataItem : " + JSON.stringify(dataItem));
	}).then(function() {
		// for suggest
		return zbxApi.getItem.get(hostid,"system.swap.size[,pused]");
	}).then(function(data) {
		data_SwapMemPused = zbxApi.getItem.success(data);
	}).then(function() {
		// for suggest
		return zbxApi.getItem.get(hostid,"vm.memory.size[buffers]");
	}).then(function(data) {
		data_MemBuffers = zbxApi.getItem.success(data);
	}).then(function() {
		// for suggest
		return zbxApi.getItem.get(hostid,"vm.memory.size[cached]");
	}).then(function(data) {
		data_MemCached = zbxApi.getItem.success(data);
	}).then(function() {
		// for suggest
		return zbxApi.getItem.get(hostid,"vm.memory.size[used]");
	}).then(function(data) {
		data_MemUsed = zbxApi.getItem.success(data);
	}).then(function() {
		// for suggest
		return zbxApi.getItem.get(hostid,"system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
	}).then(function(data) {
		data_topProcess = zbxApi.getItem.success(data);
		
		memoryinfoView(data_MemPused, data_SwapMemPused, data_MemBuffers, data_MemCached, data_MemUsed, data_topProcess, startTime);
	});
}

var memoryinfoView = function(data_MemPused, data_SwapMemPused, data_MemBuffers, data_MemCached, data_MemUsed, data_topProcess, startTime) {

    showMemUsage(data_MemPused, data_SwapMemPused, startTime);
    showMemTotal(data_MemBuffers, data_MemCached, data_MemUsed, startTime);
    showMemUsedProcess(data_topProcess);
    $.unblockUI(blockUI_opt_all);

};

function showMemUsage(data_MemPused, data_SwapMemPused, startTime){
	
	var memPusedArr = [];
	var swapMemPuesdArr = [];
	
	var keyName_MemPused = '';
	var keyName_SwapMemPused = '';
	
	var history_MemPused = null;
	var history_SwapMemPused = null;
	
    zbxApi.getHistory.get(data_MemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
    	history_MemPused = zbxApi.getHistory.success(data);
    	keyName_MemPused = data_MemPused.result[0].key_;
		$.each(history_MemPused.result, function(k,v) {
			memPusedArr[k] = new Array();
			memPusedArr[k][0]=parseInt(v.clock) * 1000;
			memPusedArr[k][1]=parseFloat(v.value);
			
//			loadAvg1Arr[k]=parseFloat(v.value);
		});
		
	}).then(function() {
		return zbxApi.getHistory.get(data_SwapMemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
		
	}).then(function(data) {
		history_SwapMemPused = zbxApi.getHistory.success(data);
		keyName_SwapMemPused = data_SwapMemPused.result[0].key_;
		$.each(history_SwapMemPused.result, function(k,v) {
			swapMemPuesdArr[k] = new Array();
			swapMemPuesdArr[k][0]=parseInt(v.clock) * 1000;
			swapMemPuesdArr[k][1]=parseFloat(v.value);
			
//			loadAvg5Arr[k]=parseFloat(v.value);
		});
		
		$(function () {
		    Highcharts.chart('chart_memUsage', {
		        chart: {
		            type: 'area',
		        	zoomType: 'x'
		        },
		        title: {
		            text: '메모리 사용량'
		        },
		        subtitle: {
		            text: ''
		        },
		        xAxis: {
		        	labels: {
		                formatter: function () {
		                	var d2 = new Date(this.value);
		                	var hours = "" + d2.getHours();
		                	var minutes = "" + d2.getMinutes();
		                	var seconds = "" + d2.getSeconds();
		                	if(hours.length==1){
		                		hours = "0" + hours;
		                	}
		                	if(minutes.length==1){
		                		minutes = "0" + minutes;
		                	}
		                	if(seconds.length==1){
		                		seconds = "0" + seconds;
		                	}
		                    return hours + ":" + minutes + ":" + seconds; 
		                }
		        	}
		        },
		        yAxis: {
		            title: {
		                text: ''
		            },
		            labels: {
		                formatter: function () {
		                	return this.value + '%';
		                	//return this.value / 1000 + 'k';
		                }
		            }
		        },
		        tooltip: {
		        	formatter: function () {
		        	  	var d2 = new Date(this.x);
	                	var hours = "" + d2.getHours();
	                	var minutes = "" + d2.getMinutes();
	                	var seconds = "" + d2.getSeconds();
	                	if(hours.length==1){
	                		hours = "0" + hours;
	                	}
	                	if(minutes.length==1){
	                		minutes = "0" + minutes;
	                	}
	                	if(seconds.length==1){
	                		seconds = "0" + seconds;
	                	}
	                	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + "%";
	                   
	                }
		        },
		        plotOptions: {
		            area: {
		                //pointStart: 1940,
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
		        	name: keyName_MemPused,
		            data: memPusedArr
		        }, {
		        	name: keyName_SwapMemPused,
		            data: swapMemPuesdArr
		        }]
		    });
		});
		
	});
		
}

function showMemTotal(data_MemBuffers, data_MemCached, data_MemUsed, startTime){
	
	
	var memBufferArr = [];
	var memCachedArr = [];
	var memUsedArr = [];
	
	var keyName_MemBuffers = '';
	var keyName_MemCached = '';
	var keyName_MemUsed = '';
	
	var history_MemBuffers = null;
	var history_MemCached = null;
	var history_MemUsed = null;
	
	zbxApi.getHistory.get(data_MemBuffers.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
		history_MemBuffers = zbxApi.getHistory.success(data);
		keyName_MemBuffers = data_MemBuffers.result[0].key_;
		$.each(history_MemBuffers.result, function(k,v) {
			memBufferArr[k] = new Array();
			memBufferArr[k][0]=parseInt(v.clock) * 1000;
			memBufferArr[k][1]=parseFloat(v.value);
		});
	}).then(function() {
		return zbxApi.getHistory.get(data_MemCached.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
		
	}).then(function(data) { 
		history_MemCached = zbxApi.getHistory.success(data);
		keyName_MemCached = data_MemCached.result[0].key_;
		$.each(history_MemCached.result, function(k,v) {
			memCachedArr[k] = new Array();
			memCachedArr[k][0]=parseInt(v.clock) * 1000;
			memCachedArr[k][1]=parseFloat(v.value);
		});
		
	}).then(function() {
		return zbxApi.getHistory.get(data_MemUsed.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
		
	}).then(function(data) {
		history_MemUsed = zbxApi.getHistory.success(data);
		keyName_MemUsed = data_MemUsed.result[0].key_;
		$.each(history_MemUsed.result, function(k,v) {
			memUsedArr[k] = new Array();
			memUsedArr[k][0]=parseInt(v.clock) * 1000;
			memUsedArr[k][1]=parseFloat(v.value);
		});
		
		$(function () {
			Highcharts.setOptions({
		        colors: ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']
		    });
			
			Highcharts.chart('chart_memTotal', {
		        chart: {
		            type: 'area',
		            zoomType: 'x'
		        },
		        title: {
		            text: '전체 메모리'
		        },
		        subtitle: {
		            text: ''
		        },
		        xAxis: {
		            labels: {
		                formatter: function () {
		                	var d2 = new Date(this.value);
		                	var hours = "" + d2.getHours();
		                	var minutes = "" + d2.getMinutes();
		                	var seconds = "" + d2.getSeconds();
		                	if(hours.length==1){
		                		hours = "0" + hours;
		                	}
		                	if(minutes.length==1){
		                		minutes = "0" + minutes;
		                	}
		                	if(seconds.length==1){
		                		seconds = "0" + seconds;
		                	}
		                    return hours + ":" + minutes + ":" + seconds; 
		                }
		            }
		        	//categories: ['100', '300', '500', '700', '900', '1100']
		        	//tickInterval: 200
		        	//minorTickInterval: 'auto',
		            //startOnTick: true,
		            //endOnTick: true
		        },
		        yAxis: {
		            title: {
		                text: ''
		            },
		            labels: {
		                formatter: function () {
		                	return Math.round(this.value / (1024 * 1024)) + 'MB';
		                }
		            }
		        },
		        tooltip: {
		        	formatter: function () {
		        	  	var d2 = new Date(this.x);
	                	var hours = "" + d2.getHours();
	                	var minutes = "" + d2.getMinutes();
	                	var seconds = "" + d2.getSeconds();
	                	if(hours.length==1){
	                		hours = "0" + hours;
	                	}
	                	if(minutes.length==1){
	                		minutes = "0" + minutes;
	                	}
	                	if(seconds.length==1){
	                		seconds = "0" + seconds;
	                	}
	                	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
	                   
	                }
		        },
		        plotOptions: {
//		        	series: {
//		        		pointStart: startTimeForChart,
//		        		pointInterval: 24 * 3600 * 2
//		        	},
		        	area: {
		                //pointStart: startTimeForChart,
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
		            name: keyName_MemBuffers,
		            data: memBufferArr
		        }, {
		            name: keyName_MemCached,
		            data: memCachedArr
		        }, {
		            name: keyName_MemUsed,
		            data: memUsedArr
		        }]
		    });
		});
	});
}

function showMemUsedProcess(data_topProcess){
	
	var memValueOrderByDesc = [];
	var orgProcArrOrderByMem = [];
	var finalProcArr = [];
	var topProcRowArr = data_topProcess.result[0].lastvalue.split("\n");
	var topProcessLastClock = parseInt(data_topProcess.result[0].lastclock) * 1000;
	var d2 = new Date(topProcessLastClock);
	var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth())+1) + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();
	var memProcessTbl = '';
	var maxRefValue; 
	var processGaugeValue;
	var MAX_PROCCOUNT = 13;
	
	//모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
	$.each(topProcRowArr, function(k,v) {
		while(topProcRowArr[k].indexOf("  ") != -1){
			topProcRowArr[k] = topProcRowArr[k].replace('  ',' ');
		}
		var topProcColArr = topProcRowArr[k].split(" ");
		memValueOrderByDesc[k] = parseFloat(topProcColArr[6]);
		orgProcArrOrderByMem[k] = parseFloat(topProcColArr[6]);
	});

	memValueOrderByDesc.splice(0,1);
	memValueOrderByDesc.sort(function(a, b){ return b-a; });
	
	for(var i=0; i<memValueOrderByDesc.length; i++){
		for(var j=0; j<orgProcArrOrderByMem.length; ++j){
			if(memValueOrderByDesc[i] == orgProcArrOrderByMem[j]){
				finalProcArr[i] = topProcRowArr[j];
				orgProcArrOrderByMem[j] = -1;
				break;
			}
		}
	}
	
	memProcessTbl += "<thead>";
	memProcessTbl += "<tr class='display-none' role='row'>";
	memProcessTbl += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
	memProcessTbl += "<th class='sorting_disabled display-none' rowspan='1' colspan='1'></th>";
	memProcessTbl += "</tr>";
	memProcessTbl += "</thead>";
	memProcessTbl += "<tbody>";
	
	$.each(finalProcArr, function(k,v) {
		if(k>0 && k<MAX_PROCCOUNT){
			var temp = finalProcArr[k].split(" ");
			var procName = '';
			var processPercentValue = parseFloat(temp[6]);
			if(k==1){
				maxRefValue = processPercentValue;
				processGaugeValue = 100;
			}else{
				processGaugeValue = (processPercentValue * 100) / maxRefValue;				
			}
			for(var i=9; i<=temp.length; ++i){
				if(temp[i] != null){
					procName += " " + temp[i];
				}
			}
			memProcessTbl += "<tr role='row' class='odd'>";
			memProcessTbl += "<td class=' pt-xs pb-xs'><span class='name ellipsis' title='" + procName + "'>" + procName + "</span>";
			memProcessTbl += "<span class='bold value percent-text'>" + processPercentValue + "</span>";
			memProcessTbl += "<div class='progress-wrapper'><div class='progress' style='width:" + processGaugeValue + "%;'>";
			memProcessTbl += "<div class='progress-bar' role='progressbar' aria=valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width:100%;'></div>";
			memProcessTbl += "</div></div>";
			memProcessTbl += "</td>";
			memProcessTbl += "<td class=' display-none'>httpd</td>";	 
			memProcessTbl += "</tr>";
		} 
	});
	memProcessTbl += "</tbody>";
    
    $("#memProcessTime").text(topProcessLastTime);
	$("#memProcess").empty();
    $("#memProcess").append(memProcessTbl);
}

function showCpuUsage(data_CpuSystem, data_CpuUser, data_CpuIOwait, data_CpuSteal, startTime){
	
	
	var CpuUserArr = [];
	var CpuIOwaitArr = [];
	var CpuStealArr = [];
	
	var keyName_CpuSystem = '';
	var keyName_CpuUser = '';
	var keyName_CpuIOwait = '';
	var keyName_CpuSteal = '';
	
	var history_CpuSystem = null;
	var history_CpuUser = null;
	var history_CpuIOwait = null;
	var history_CpuSteal = null;
	
	zbxApi.getHistory.get(data_CpuSystem.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
		history_CpuSystem = zbxApi.getHistory.success(data);
		keyName_CpuSystem = data_CpuSystem.result[0].key_;
		$.each(history_CpuSystem.result, function(k,v) {
			CpuSystemArr[k] = new Array();
			CpuSystemArr[k][0]=parseInt(v.clock) * 1000;
			CpuSystemArr[k][1]=parseFloat(v.value);
		});
		
	}).then(function() {
		return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
		
	}).then(function(data) { 
		history_CpuUser = zbxApi.getHistory.success(data);
		keyName_CpuUser = data_CpuUser.result[0].key_;
		$.each(history_CpuUser.result, function(k,v) {
			CpuUserArr[k] = new Array();
        	CpuUserArr[k][0]=parseInt(v.clock) * 1000;
			CpuUserArr[k][1]=parseFloat(v.value);
		});
		
	}).then(function() {
		return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
		
	}).then(function(data) {
		history_CpuIOwait = zbxApi.getHistory.success(data);
		keyName_CpuIOwait = data_CpuIOwait.result[0].key_;
		$.each(history_CpuIOwait.result, function(k,v) {
			CpuIOwaitArr[k] = new Array();
			CpuIOwaitArr[k][0]=parseInt(v.clock) * 1000;
			CpuIOwaitArr[k][1]=parseFloat(v.value);
		});
		
	}).then(function() {
		return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
		
	}).then(function(data) {
		history_CpuSteal = zbxApi.getHistory.success(data);
		keyName_CpuSteal = data_CpuSteal.result[0].key_;
		$.each(history_CpuSteal.result, function(k,v) {
			CpuStealArr[k] = new Array();
			CpuStealArr[k][0]=parseInt(v.clock) * 1000;
			CpuStealArr[k][1]=parseFloat(v.value);
		});
		
		$(function () {
			Highcharts.setOptions({
		        colors: ['#E3C4FF', '#8F8AFF', '#00B700','#DB9700']
		    });
			
			Highcharts.chart('chart_cpuUsage', {
		        chart: {
		            type: 'area',
		            zoomType: 'x'
		        },
		        title: {
		            text: 'CPU 사용량'
		        },
		        subtitle: {
		            text: ''
		        },
		        xAxis: {
		            labels: {
		                formatter: function () {
		                	var d2 = new Date(this.value);
		                	var hours = "" + d2.getHours();
		                	var minutes = "" + d2.getMinutes();
		                	var seconds = "" + d2.getSeconds();
		                	if(hours.length==1){
		                		hours = "0" + hours;
		                	}
		                	if(minutes.length==1){
		                		minutes = "0" + minutes;
		                	}
		                	if(seconds.length==1){
		                		seconds = "0" + seconds;
		                	}
		                    return hours + ":" + minutes + ":" + seconds; 
		                }
		            }
		        	//categories: ['100', '300', '500', '700', '900', '1100']
		        	//tickInterval: 200
		        	//minorTickInterval: 'auto',
		            //startOnTick: true,
		            //endOnTick: true
		        },
		        yAxis: {
		            title: {
		                text: ''
		            },
		            labels: {
		                formatter: function () {
		                	return this.value + '%';
		                }
		            }
		        },
		        tooltip: {
		        	formatter: function () {
		        	  	var d2 = new Date(this.x);
	                	var hours = "" + d2.getHours();
	                	var minutes = "" + d2.getMinutes();
	                	var seconds = "" + d2.getSeconds();
	                	if(hours.length==1){
	                		hours = "0" + hours;
	                	}
	                	if(minutes.length==1){
	                		minutes = "0" + minutes;
	                	}
	                	if(seconds.length==1){
	                		seconds = "0" + seconds;
	                	}
	                	return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + "%";
	                   
	                }
		        },
		        plotOptions: {
//		        	series: {
//		        		pointStart: startTimeForChart,
//		        		pointInterval: 24 * 3600 * 2
//		        	},
		        	area: {
		                //pointStart: startTimeForChart,
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
		            name: keyName_CpuSystem,
		            data: CpuSystemArr
		        }, {
		            name: keyName_CpuUser,
		            data: CpuUserArr
		        }, {
		            name: keyName_CpuIOwait,
		            data: CpuIOwaitArr
		        }, {
		            name: keyName_CpuSteal,
		            data: CpuStealArr
		        }]
		    });
		});
	});
}


function showCpuUsedProcess(data_topProcess){
	
	$("#cpuProcess").empty();
	var procArrOrderByCpu = [];
	var orgProcArrOrderByCpu = [];
	var finalProcArr = [];
	var topProcRowArr = data_topProcess.result[0].lastvalue.split("\n");
	var topProcessLastClock = parseInt(data_topProcess.result[0].lastclock) * 1000;
	var d2 = new Date(topProcessLastClock);
	var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth())+1) + "-" + d2.getDate()  + " " + d2.getHours() + ":" + d2.getMinutes();
	$("#processTime").text(topProcessLastTime);
	var cpuProcessTbl = '';
	var maxRefValue; 
	var processGaugeValue;
	var MAX_PROCCOUNT = 13;
	
	//** 프로세스 객체로 만들어도 좋을 것. 객체에 대해서 utility한 function 만드는것 추천
	//모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
	$.each(topProcRowArr, function(k,v) {
		while(topProcRowArr[k].indexOf("  ") != -1){
			topProcRowArr[k] = topProcRowArr[k].replace('  ',' ');
		}
		var topProcColArr = topProcRowArr[k].split(" ");
		procArrOrderByCpu[k] = parseFloat(topProcColArr[7]);
		orgProcArrOrderByCpu[k] = parseFloat(topProcColArr[7]);
	});
	orgProcArrOrderByCpu = procArrOrderByCpu;
	procArrOrderByCpu.splice(0,1);
	procArrOrderByCpu.sort(function(a, b){ return b-a; });

	for(var i=0; i<procArrOrderByCpu.length; i++){
		for(var j=0; j<orgProcArrOrderByCpu.length; ++j){
			if(procArrOrderByCpu[i]==orgProcArrOrderByCpu[j]){
				finalProcArr[i]=topProcRowArr[j];
				orgProcArrOrderByCpu[j]=-1;
				break;
			}
		}
	}
	
	//** 트리맵 : 키가 정렬되서들어감. 키를 cpu 사용률로 하고 value를 항목으로. 
	
	cpuProcessTbl += "<thead>";
	cpuProcessTbl += "<tr class='display-none' role='row'>";
	cpuProcessTbl += "<th class='sorting_disabled pt-xs pb-xs' rowspan='1' colspan='1'></th>";
	cpuProcessTbl += "<th class='sorting_disabled display-none' rowspan='1' colspan='1'></th>";
	cpuProcessTbl += "</tr>";
	cpuProcessTbl += "</thead>";
	cpuProcessTbl += "<tbody>";
	 
	$.each(finalProcArr, function(k,v) {
		if(k>0 && k<MAX_PROCCOUNT){
			var temp = finalProcArr[k].split(" ");
			var procName = '';
			var processPercentValue = parseFloat(temp[7]);
			if(k==1){
				maxRefValue = processPercentValue;
				processGaugeValue = 100;
			}else{
				processGaugeValue = (processPercentValue * 100) / maxRefValue;				
			}
			for(var i=9; i<=temp.length; ++i){
				if(temp[i] != null){
					procName += " " + temp[i];
				}
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
    $("#cpuProcess").append(cpuProcessTbl);
    
}

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
	    overlayCSS:  {
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

var convAckServer = function (ack) {
    if (ack === "0") {
        return "아니오";
    } else {
        return "예";
    }
};

var convPriorityServer = function (priority) {
    switch (priority) {
        case "0":
            return "미분류";
        case "1":
            return "정보";
        case "2":
            return "경고";
        case "3":
            return "가벼운 장애";
        case "4":
            return "중증 장애";
        case "5":
            return "심각한 장애";
    }
};

var convStatusServer = function (status) {
    if (status === "0") {
        return "장애 없음";
    } else {
        return "장애 있음";
    }
};

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
