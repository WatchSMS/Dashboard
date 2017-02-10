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
