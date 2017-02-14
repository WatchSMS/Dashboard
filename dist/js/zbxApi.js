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
                  CpuSystemArr = zbxApi.getHistory.success(data);
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuUser.result[0].itemid, startTime, "0");
                }).then(function(data) {

                  CpuUserArr= zbxApi.getHistory.success(data);

                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuIOwait.result[0].itemid, startTime, "0");
                }).then(function(data) {

                  CpuIOwaitArr = zbxApi.getHistory.success(data);
                }).then(function() {
                    return zbxApi.getHistory.get(data_CpuSteal.result[0].itemid, startTime, "0");
                }).then(function(data) {

                  CpuStealArr  = zbxApi.getHistory.success(data);

                    dataSet.push(new DataObject('CPU System', CpuSystemArr));
                    dataSet.push(new DataObject('CPU User', CpuUserArr));
                    dataSet.push(new DataObject('CPU IO Wait', CpuIOwaitArr));
                    dataSet.push(new DataObject('CPU Steal', CpuStealArr));


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

            return resultToArray(data.result);
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
                "search": {"key_": "vfs.fs.size", "name": "Total disk space"}
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
        get: function (hostid, key_) {
            var method = "item.get";
            var params = {
                "output": ["key_", "itemid", "lastclock"],
                "hostids": hostid,
                "search": {"key_": key_}
                //"search": {"key_": "net.if.in["}
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
