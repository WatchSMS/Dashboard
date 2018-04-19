/**
 * Created by ktds on 2017-12-11.
 */

function list_ItemList(hostid) {
    $.blockUI(blockUI_opt_all);

    $("#itemInfo").empty();
    $("#itemTriggerBody").empty();
    $("#paging").empty();
    $("#value_HostId").val(hostid);
    $("#search_hostNm").val("");

    var severity_length = $("input[name=trigger_severity]").length;

    $("input[name=trigger_severity]:checked").each(function () {
        var checkSeverity = $(this).attr("value");
        for (var i = 0; i <= severity_length; i++) {
            var length_value = $(this).attr("value");
            if (checkSeverity == length_value) {
                $("label").removeClass("active");
                $("label input[type=radio]").prop("checked", false);
            }
        }
    });

    list_ItemListData(hostid);
}

function list_ItemListData(hostid) {

    $("#value_HostId").val(hostid);
    var data_ItemList = '';
    var returnHostId = hostid;

    zbxApi.hostItemTriggerList.defaultGet(hostid).then(function (data) {
        data_ItemList = zbxApi.hostItemTriggerList.success(data);
        list_CreateTable(data_ItemList, returnHostId);
    });

}

function list_CreateTable(dataList, returnHostId) {

    $("#itemTriggerBody").empty();
    $("#paging").empty();

    var List = dataList;
    var hostid = returnHostId;

    var itemListTable, templateId, itemId, itemName, itemKey, itemStatus = '';
    var copyItemName, itemNameFinal, copyItemKey, numIndex = '';

    var itemApplication = [];
    var applicationString = '';

    var triggerId = [];
    var triggerSeverity = [];
    var triggerName = [];
    var triggerStatus = [];

    var para_trigId = [];

    var triChangeStatus = [];

    var rowspan, defaultSpan = '';

    var triggerLength, applicationLength = '';

    $.each(List.result, function (k, v) {
        para_trigId.length = 0;
        triggerId.length = 0;

        applicationLength = v.applications.length;

        triggerLength = v.triggers.length;
        if (triggerLength == 0) {
            rowspan = triggerLength + 1;
        } else {
            rowspan = triggerLength;
        }
        defaultSpan = 1;

        try {
            templateId = v.templateid;
            itemId = v.itemid;
            itemName = v.name;
            itemKey = v.key_;
            itemStatus = v.status;

            itemApplication.length = 0;

            for (var j = 0; j < applicationLength; j++) {
                itemApplication[j] = v.applications[j].name;
                applicationString = itemApplication.join(', ');
            }

            for (var i = 0; i < rowspan; i++) {
                triggerId[i] = v.triggers[i].triggerid;
                triggerSeverity[i] = v.triggers[i].priority;
                triggerName[i] = v.triggers[i].description;
                triggerStatus[i] = v.triggers[i].status;
                triChangeStatus[i] = v.triggers[i].status;
            }

        } catch (e) {
            if (v.name == 0) {
                itemName = v.description;
            }
            for (var i = 0; i < rowspan; i++) {
                if (triggerLength == 0) {
                    triggerId[i] = '';
                    triggerSeverity[i] = '';
                    triggerName[i] = '';
                    triggerStatus[i] = '';
                }
            }
        }

        if (v.templateid == "0") {
            templateId = '';
        }

        copyItemName = itemName;

        if (copyItemName.indexOf("$") != -1) {
            copyItemKey = itemKey;

            var keyStart = copyItemKey.indexOf("[") + 1;
            var keyEnd = copyItemKey.indexOf("]");

            var subItemKey = copyItemKey.substring(keyStart, keyEnd);

            var keyArray = subItemKey.split(",");
            keyArray.unshift("item");
            var nameArray = copyItemName.split(" ");
            for (var name = 0; name < nameArray.length; name++) {
                if (nameArray[name].indexOf("$") != -1) {
                    numIndex = nameArray[name].replace("$", "");

                    nameArray[name] = keyArray[numIndex];
                    itemNameFinal = nameArray.join(" ");
                }
            }
        } else {
            itemNameFinal = itemName;
        }


        para_trigId = triggerId.slice(0, rowspan);
        para_trigId = para_trigId.toString();
        para_trigId = para_trigId.replace(/,/g, '_');

        itemListTable += "<tr role='row' id='itemList_" + itemId + "_" + hostid + "_" + templateId + "' ondblclick='list_ItemDetailBtn(" + itemId + ", " + hostid + ", " + '"' + para_trigId + '"' + ")'>";
        itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer01'>" +
            "<input type='checkbox' id='" + itemId + "," + hostid + "," + templateId + "' name='ItemCheckBox' class='line'></td>";
        itemListTable += "<td rowspan='" + rowspan + "' id='tableRow_" + itemId + "' name='" + para_trigId + "' class='line td_widthPer35' style='text-align: left;'>" + itemNameFinal + "</td>";
        itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer10'>" + applicationString + "</td>";
        itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer05'>" + convStatusEvent(itemStatus) + "</td>";

        for (var j = 0; j < rowspan; j++) {

            itemListTable += "<td rowspan='" + defaultSpan + "' class='line td_widthPer35' style='text-align: left;'>" + triggerName[j] + "</td>";
            itemListTable += "<td rowspan='" + defaultSpan + "' id='trigger_" + triggerId[j] + "' class='line td_widthPer10' >" + convPriorityKor(triggerSeverity[j]) + "</td>";
            itemListTable += "<td rowspan='" + defaultSpan + "' class='line td_widthPer05' " +
                "onclick='list_UpdateTriStatus(" + hostid + ", " + itemId + ", " + triChangeStatus[j] + ", " + triggerId[j] + ")'>" + convStatusTrigger(triggerStatus[j]) + "</td>";
            itemListTable += "</tr>";
        }

    });
    $("#itemTriggerBody").append(itemListTable);

    /* paging 작업 s */
    var rowsShown = 30;
    var rowTotal = $("#itemTriggerList tbody tr").length;
    var numPages = rowTotal / rowsShown;

    for (var i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#paging').append('<a href="#" rel="' + i + '">' + pageNum + '</a>');
    }

    $("#itemTriggerList tbody tr").hide();
    $("#itemTriggerList tbody tr").slice(0, rowsShown).show();
    $('#paging a').bind('click', function () {
        $('#paging a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $('#itemTriggerList tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).css('display', 'table-row').animate({opacity: 1}, 300);
    });
    /* paging 작업 e */

    $.unblockUI(blockUI_opt_all);
}

function list_CreateFilterTable(dataList, returnHostId) {

    $("#itemTriggerBody").empty();
    $("#paging").empty();

    var List = dataList;
    var hostid = returnHostId;

    var itemListTable = '';

    var templateId, itemId, itemName, itemKey, itemStatus = '';
    var filterItemName, itemNameFilter, filterItemKey, filterNumIndex = '';

    var applicationLength = '';
    var itemApplication = [];

    var triggerId = [];
    var triggerSeverity = [];
    var triggerName = [];
    var triggerStatus = [];

    var para_trigId = [];

    var triChangeStatus = [];

    var rowspan, defaultSpan = '';

    var triggerLength = '';

    var checkSeverity, para_severity, check_severity = '';
    check_severity = "";

    checkSeverity = $("input[name=trigger_severity]:checked").length;
    console.log(" checkSeverity : " + checkSeverity);

    $("input[name=trigger_severity]:checked").each(function () {
        check_severity = $(this).attr("value");
        console.log(" check_severity : " + check_severity);
        if (check_severity == "all") {
            check_severity = "";
        }
    });
    para_severity = check_severity;

    $.each(List.result, function (k, v) {
        para_trigId.length = 0;
        triggerId.length = 0;

        applicationLength = v.applications.length;

        triggerLength = v.triggers.length;
        if (triggerLength == 0) {
            rowspan = triggerLength + 1;
        } else {
            rowspan = triggerLength;
        }
        defaultSpan = 1;

        try {
            templateId = v.templateid;
            itemId = v.itemid;
            itemName = v.name;
            itemKey = v.key_;
            itemStatus = v.status;

            for (var j = 0; j < applicationLength; j++) {
                if (v.applications.length != 0) {
                    var applicationName = v.applications[j].name;
                    itemApplication[j] = v.applications[j].name;
                }
            }

            for (var i = 0; i < rowspan; i++) {
                triggerId[i] = v.triggers[i].triggerid;
                triggerSeverity[i] = v.triggers[i].priority;
                triggerName[i] = v.triggers[i].description;
                triggerStatus[i] = v.triggers[i].status;
            }
        } catch (e) {
            if (v.name == 0) {
                itemName = v.description;
            }
            for (var i = 0; i < rowspan; i++) {
                if (triggerLength == 0) {
                    triggerId[i] = '';
                    triggerSeverity[i] = '0';
                    triggerName[i] = '';
                }
            }
        }

        if (v.templateid == "0") {
            templateId = '';
        }

        filterItemName = itemName;

        if (filterItemName.indexOf("$") != -1) {
            filterItemKey = itemKey;

            var keyStart = filterItemKey.indexOf("[") + 1;
            var keyEnd = filterItemKey.indexOf("]");

            var subItemKey = filterItemKey.substring(keyStart, keyEnd);

            var keyArray = subItemKey.split(",");
            keyArray.unshift("item");
            var nameArray = filterItemName.split(" ");
            for (var name = 0; name < nameArray.length; name++) {
                if (nameArray[name].indexOf("$") != -1) {
                    filterNumIndex = nameArray[name].replace("$", "");

                    nameArray[name] = keyArray[filterNumIndex];
                    itemNameFilter = nameArray.join(" ");
                }
            }
        } else {
            itemNameFilter = itemName;
        }

        para_trigId = triggerId.slice(0, rowspan);
        para_trigId = para_trigId.toString();
        para_trigId = para_trigId.replace(/,/g, '_');

        for (var i = 0; i < triggerLength; i++) {
            if (para_severity == v.triggers[i].priority) {
                itemListTable += "<tr role='row' id='itemList_" + itemId + "_" + hostid + "_" + templateId + "' ondblclick='list_ItemDetailBtn(" + itemId + ", " + hostid + ", " + '"' + para_trigId + '"' + ")'>";
                itemListTable += "<td rowspan='" + defaultSpan + "' class='line td_widthPer01'>" +
                    "<input type='checkbox' class='line' name='ItemCheckBox' id='" + itemId + "," + hostid + "," + templateId + "'>" +
                    "</td>";
                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' id='tableRow_" + itemId + "' name='" + v.triggers[i].triggerid + "' " +
                    "class='line td_widthPer35' style='text-align: left;'>" + itemNameFilter + "</td>";
                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' class='line td_widthPer10'>" + itemApplication[i] + "</td>";
                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' class='line td_widthPer05'>" + convStatusEvent(itemStatus) + "</td>";

                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' class='line td_widthPer35' style='text-align: left;'>" + v.triggers[i].description + "</td>";
                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' id='trigger_" + v.triggers[i].triggerid + "' class='line td_widthPer10'>" + convPriorityKor(v.triggers[i].priority) + "</td>";
                itemListTable +=
                    "<td rowspan='" + defaultSpan + "' class='line td_widthPer05'>" + convStatusTrigger(v.triggers[i].status) + "</td>";
                itemListTable += "</tr>";

            } else if (para_severity == "") {
                itemListTable += "<tr role='row' id='itemList_" + itemId + "_" + hostid + "_" + templateId + "' ondblclick='list_ItemDetailBtn(" + itemId + ", " + hostid + ", " + '"' + para_trigId + '"' + ")'>";
                itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer01'>" +
                    "<input type='checkbox' name='ItemCheckBox' id='" + itemId + "," + hostid + "," + templateId + "' class='line td_widthPer01'></td>";
                itemListTable += "<td  rowspan='" + rowspan + "' id='tableRow_" + itemId + "' name='" + para_trigId + "' class='line td_widthPer35' style='text-align: left;'>" + itemNameFilter + "</td>";
                itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer10'>" + itemApplication + "</td>";
                itemListTable += "<td rowspan='" + rowspan + "' class='line td_widthPer05'>" + convStatusEvent(itemStatus) + "</td>";

                for (var j = 0; j < rowspan; j++) {
                    itemListTable += "<td rowspan='" + defaultSpan + "' class='line td_widthPer35' style='text-align: left;'>" + triggerName[j] + "</td>";
                    itemListTable += "<td rowspan='" + defaultSpan + "' id='trigger_" + triggerId[j] + "' class='line td_widthPer10'>" + convPriorityKor(triggerSeverity[j]) + "</td>";
                    itemListTable += "<td rowspan='" + defaultSpan + "' class='line td_widthPer05'>" + convStatusTrigger(triggerStatus[j]) + "</td>";
                    itemListTable += "</tr>";
                }
            } else {

            }
        }
    });
    $("#itemTriggerBody").append(itemListTable);

    /* paging 작업 s */
    var rowsShown = 30;
    var rowTotal = $("#itemTriggerList tbody tr").length;
    var numPages = rowTotal / rowsShown;

    for (var i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#paging').append('<a href="#" rel="' + i + '">' + pageNum + '</a>');
    }

    $("#itemTriggerList tbody tr").hide();
    $("#itemTriggerList tbody tr").slice(0, rowsShown).show();
    $('#paging a').bind('click', function () {
        $('#paging a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $('#itemTriggerList tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).css('display', 'table-row').animate({opacity: 1}, 300);
    });
    /* paging 작업 e */

    $.unblockUI(blockUI_opt_all);
}

function list_UpdateTriStatus(hostid, itemId, triChangeStatus, triggerId) {
    var changeHostid = hostid;
    var changeItemId = itemId;
    var changeTriId = triggerId;
    var triStatus = '';

    var template = $("#tableRow_" + itemId).val();

    if (triChangeStatus == 0 || triChangeStatus == "undefined") {
        triStatus = 1;
    } else {
        triStatus = 0;
    }

    if (template == "") {
        zbxApi.triggerInfoUpdate.statusUpdate(changeTriId, triStatus).then(function (data) {
            zbxApi.triggerInfoUpdate.success(data);
            list_ItemList(hostid);
        });
    } else {
        $("#alertPopUp").empty();
        var alertMessage = "<strong style='font-size: 18px'> 수정이 불가능합니다. </strong><br><br>";
        $("#alertPopUp").append(alertMessage);

        $("#alertPopUp").lightbox_me({
            centered: true,
            closeSelector: ".close",
            overlayCSS: {background: '#474f79', opacity: .8}
        });
    }
}

function list_CheckBoxAll() {
    if ($("#allCheckBox").prop("checked")) {
        $("input[type=checkbox]").prop("checked", true);
    } else {
        $("input[type=checkbox]").prop("checked", false);
    }
}

function filter_HostNameBtn() {
    var hostNameList, hostNameId, hostName, hostNameTable = '';

    $("#hostNameTbody").empty();

    zbxApi.searchDiv.hostNameGet().then(function (data) {
        hostNameList = zbxApi.searchDiv.success(data);

        $.each(hostNameList.result, function (k, v) {
            hostNameId = v.hostid;
            hostName = v.host;

            hostNameTable += "<tr id='" + hostNameId + "'>";
            hostNameTable += "<td id='" + hostNameId + "'>" + hostName + "</td>";
            hostNameTable += "<tr>";
        });
        $("#hostNameTbody").append(hostNameTable);

        $("#hostName tbody tr td").click(function () {
            var hostId = $(this).attr("id");
            var hostName = $(this).text();

            $("#search_hostNm").val(hostName);
            $("#search_hostNm").attr("name", hostId);

            $('#hostNamePopUp').trigger('close');
        });
    });

    $("#hostNamePopUp").lightbox_me({
        centered: true,
        closeSelector: ".close",
        overlayCSS: {background: '#474f79', opacity: .8}
    });
}

function filter_ListSearchBtn() {
    var filterList = '';
    var para_hostId = $("#search_hostNm").attr("name");

    if (para_hostId == undefined) {
        $("#alertPopUp").empty();
        var alertMessage = "<strong class='popup_textStrong'> 호스트명을 선택해 주세요. </strong><br><br>";
        $("#alertPopUp").append(alertMessage);

        $("#alertPopUp").lightbox_me({
            centered: true,
            closeSelector: ".close",
            overlayCSS: {background: '#474f79', opacity: .8}
        });
        return false;
    }

    zbxApi.hostItemTriggerList.filterGet(para_hostId).then(function (data) {
        filterList = zbxApi.hostItemTriggerList.success(data);

        list_CreateFilterTable(filterList, para_hostId);
    })
}

function filter_ListResetBtn() {
    $("#search_hostNm").val("");
    var severity_length = $("input[name=trigger_severity]").length;

    $("input[name=trigger_severity]:checked").each(function () {
        var checkSeverity = $(this).attr("value");
        for (var i = 0; i <= severity_length; i++) {
            var length_value = $(this).attr("value");
            if (checkSeverity == length_value) {
                $("label").removeClass("active");
                $("label input[type=radio]").prop("checked", false);
            }
        }
    });
}

function list_ItemDetailBtn(itemId, hostid, para_trigId) {
    var hostList, paraHostName = '';

    $("[id^=base]").hide();
    $("#base_itemUpdate").show();

    zbxApi.hostItemTriggerList.hostInfo(hostid).then(function (data) {
        hostList = zbxApi.hostItemTriggerList.success(data);

        $.each(hostList.result, function (k, v) {
            paraHostName = v.host;

            list_DetailPage(itemId, hostid, paraHostName, para_trigId);
        });
    });

}

function list_ItemStatusOn() {
    $("input:checkbox[name=ItemCheckBox]:checked").each(function () {

        var para_value = $(this).attr("id");
        var idArr = para_value.split(",");
        var itemId = idArr[0];
        var hostid = idArr[1];
        var itemStatus = 0;

        console.log(" para_value : " + para_value);
        console.log(" para_value itemId : " + itemId);
        console.log(" para_value itemStatus : " + itemStatus);

        zbxApi.itemInfoUpdate.statusUpdateItem(itemId, itemStatus).then(function (data) {
            zbxApi.itemInfoUpdate.success(data);
            list_ItemList(hostid);
        });
    })
}

function list_ItemStatusOff() {
    $("input:checkbox[name=ItemCheckBox]:checked").each(function () {

        var para_value = $(this).attr("id");
        var idArr = para_value.split(",");
        var itemId = idArr[0];
        var hostid = idArr[1];
        var itemStatus = 1;

        console.log(" para_value : " + para_value);
        console.log(" para_value itemId : " + itemId);
        console.log(" para_value itemStatus : " + itemStatus);

        zbxApi.itemInfoUpdate.statusUpdateItem(itemId, itemStatus).then(function (data) {
            zbxApi.itemInfoUpdate.success(data);
            list_ItemList(hostid);
        });
    })
}

function list_ItemDelete() {
    $("input:checkbox[name=ItemCheckBox]:checked").each(function () {
        var para_value = $(this).attr("id");
        var idArr = para_value.split(",");
        var para_itemId = idArr[0];
        var para_hostId = idArr[1];
        var para_templateId = idArr[2];

        if (para_templateId == "") {
            zbxApi.itemInfoUpdate.itemDelete(para_itemId).then(function (data) {
                zbxApi.itemInfoUpdate.success(data);
                var hostid = $("#value_HostId").val();
                list_ItemList(hostid);
            });
        }
    });
}

function list_CreateItemBtn() {
    $("[id^=base]").hide();
    $("#base_itemNew").show();

    var hostList, paraHostName = '';
    var hostid = $("#value_HostId").val();

    zbxApi.hostItemTriggerList.hostInfo(hostid).then(function (data) {
        hostList = zbxApi.hostItemTriggerList.success(data);

        $.each(hostList.result, function (k, v) {
            paraHostName = v.host;

            create_ItemCreate(hostid, paraHostName);
        });
    });
}