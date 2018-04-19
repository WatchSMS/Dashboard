/**
 * Created by ktds on 2017-12-12.
 */

function list_DetailPage(itemId, hostid, hostName, para_trigId) {
    console.log(" list_DetailPage ");
    $("#itemInfo").empty();

    $("#aleTriggerU_tbody").empty();

    $("#inItemNam_U").empty();
    $("#inItemUpd_U").empty();
    $("#applicationList_U").empty();
    $("#inAct_U").attr('checked', false);

    //$("#thesholdUpdate_tbody").empty();
    $("#thesholdUpdate_tbody tr").remove();
    $("#thesholdUpdate_tbody td").remove();
    $("#aleTriggerU_tbody tr").remove();
    $("#aleTriggerU_tbody td").remove();

    $("#hostIdInfo_U").val(hostid);
    $("#hostNameInfo_U").val(hostName);

    update_ItemDetail(itemId, hostid);
}

function update_ItemDetail(itemId, hostid) {
    console.log(" update_ItemDetail START 123456789 ");
    console.log(" update_ItemDetail itemId : " + itemId + " / hostId : " + hostid);

    $("#itemInfo").empty();
    $("#applicationList_U").empty();

    var ItemDetailList = "";

    var list_itemId, templateId, itemName, itemKey, itemDelay, itemStatus = '';
    var copyItemName, itemNameFinal, copyItemKey, numIndex = '';

    var applicationName = [];
    var applicationId = [];
    var applicationValue = [];

    var check_applId = [];
    var check_applName = [];
    var check_applValue = [];

    var allApplLength, hostApplLength = '';
    var itemTable, applicationList = '';

    var collectionIndexStart, collectionIndexEnd, collectionTitle = '';

    itemTable += "<tr class='tr_displayNone'>" +
        "<td><label id='templateId_U' class='td_textRight'>템플릿 아이디&nbsp&nbsp</label></td>" +
        "<td><input id='inTemplateId_U' type='text' class='input_itemNameText' readonly></td>" +
        "</tr>";

    itemTable += "<tr class='tr_displayNone'>" +
        "<td><label id='itemId_U' class='td_textRight'>아이템 아이디&nbsp&nbsp</label></td>" +
        "<td><input id='inItemId_U' type='text' class='input_itemNameText' readonly></td>" +
        "</tr>";

    itemTable += "<tr>" +
        "<td><label id='itemName_U' class='td_textRight'>이름&nbsp&nbsp</label></td>" +
        "<td><input id='inItemNam_U' type='text' class='input_itemNameText' readonly></td>" +
        "</tr>";

    itemTable += "<tr class='tr_displayNone'>" +
        "<td><label id='itemKey_U' class='td_textRight'>아이템 키&nbsp&nbsp</label></td>" +
        "<td><input id='inItemKey_U' type='text' class='input_itemNameText' readonly></td>" +
        "</tr>";

    itemTable += "<tr id='collection'>" +
        "<td><label id='collectionItem_U' class='td_textRight'>수집항목&nbsp&nbsp</label></td>" +
        "<td>" +
        "<input id='inCollItem_U' type='text' class='input_itemCollText' readonly>" +
        "<button id='collItemBtn_U' class='button_short' onclick='change_CollectionBtn()'>선택</button>" +
        "</td>" +
        "</tr>";

    itemTable += "<tr id='processInput1_U'>" +
        "<td><label id='processName_Ulab' class='td_textRight'>프로세스명&nbsp&nbsp</label></td>" +
        "<td><input id='processName_U' type='text' class='input_processNameText'></td>" +
        "</tr>";
    itemTable += "<tr id='processInput2_U'>" +
        "<td><label id='processCmdLine_Ulab' class='td_textRight'>실행문자열&nbsp&nbsp</label></td>" +
        "<td><input id='processCmdLine_U' type='text' class='input_processCmdText'></td>" +
        "</tr>";

    itemTable += "<tr id='portInput1_U'>" +
        "<td><label id='portNumber_Ulab' class='td_textRight'>포트번호&nbsp&nbsp</label></td>" +
        "<td><input id='portNumber_U' type='text' class='input_portNumText'></td>" +
        "</tr>";

    itemTable += "<tr id='shellInput1_U'>" +
        "<td><label id='shellCommand_Ulab' class='td_textRight'>명령어&nbsp&nbsp</label></td>" +
        "<td><input id='shellCommand_U' type='text' class='input_shellCommandText'></td>" +
        "</tr>";

    itemTable += "<tr id='logInput1_U'>" +
        "<td><label id='logFile_Ulab' class='td_textRight'>파일&nbsp&nbsp</label></td>" +
        "<td><input id='logFile_U' type='text' class='input_logFileText'></td>" +
        "</tr>";
    itemTable += "<tr id='logInput2_U'>" +
        "<td><label id='logRegexp_Ulab' class='td_textRight'>패턴&nbsp&nbsp</label></td>" +
        "<td><input id='logRegexp_U' type='text' class='input_logRegeText'></td>" +
        "</tr>";
    itemTable += "<tr id='logInput3_U'>" +
        "<td><label id='logEncoding_Ulab' class='td_textRight'>인코딩&nbsp&nbsp</label></td>" +
        "<td><input id='logEncoding_U' type='text' class='input_logEncodText'></td>" +
        "</tr>";

    itemTable += "<tr id='updateDate' >" +
        "<td><label id='itemUpdate_U' class='td_textRight'>갱신간격&nbsp&nbsp</label></td>" +
        "<td><select id='inItemUpd_U' class='select_itemDealyTime' onchange='change_ItemUpdateType()'>" +
        "<option id='10' value='10'> 10s </option>" +
        "<option id='30' value='30'> 30s </option>" +
        "<option id='60' value='60'> 1m </option>" +
        "<option id='600' value='600'> 10m </option>" +
        "<option id='3600' value='3600'> 1h </option>" +
        "<option id='43200' value='43200'> 12h </option>" +
        "<option id='86400' value='86400'> 24h </option>" +
        "</select></td>" +
        "</tr>";

    itemTable += "<tr>" +
        "<td><label id='itemApp_U' class='td_textRight'>어플리케이션&nbsp&nbsp</label></td>" +
        "<td id='applicationList_U' onchange='change_ItemUpdateType()'>";

    zbxApi.ItemDetailInfo.getApplication(hostid).then(function (data) {
        applicationList = zbxApi.ItemDetailInfo.success(data);

        allApplLength = applicationList.result.length;
        console.log(" update_ItemDetail allApplLength : " + allApplLength);

        var applicationTableU = '';

        for (var i = 0; i < allApplLength; i++) {
            if (i === 5 || i === 10 || i === 15 || i === 20 || i === 25 || i === 30) {
                applicationTableU += "<br>";
            }
            applicationTableU += "<input type='checkbox' id='applicationUpdate_" + i + "' onchange='change_ItemUpdateType()'>&nbsp;" +
                "<label id='labelUpdate_" + i + "'></label>&nbsp;&nbsp;&nbsp;";
        }
        $("#applicationList_U").append(applicationTableU);

        $.each(applicationList.result, function (k, v) {
            check_applId = v.applicationid;
            check_applName = v.name;
            check_applValue = v.name;

            $("#applicationUpdate_" + k).attr("name", check_applId);
            $("#applicationUpdate_" + k).attr("value", check_applValue);

            if (check_applName == "none") {
                check_applName = "없음";
            }
            $("#labelUpdate_" + k).text(check_applName);
        })
    });

    itemTable += "</td>" +
        "</tr>";

    itemTable += "<tr>" +
        "<td><label id='itemActive_U' class='td_textRight'>아이템 활성 여부&nbsp&nbsp</label></td>" +
        "<td>" +
        "<select id='inAct_U' class='select_itemActive' onchange='change_ItemUpdateType()'>" +
        "<option id='status_0' value='0'> 활성 </option>" +
        "<option id='status_1' value='1'> 비활성 </option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<input id='itemUpdateType' type='text' class='input_itemChangeType' readonly></td>" +
        "</tr>";

    $("#itemInfo").append(itemTable);

    zbxApi.ItemDetailInfo.itemInfoGet(itemId, hostid).then(function (data) {
        ItemDetailList = zbxApi.ItemDetailInfo.success(data);

        $.each(ItemDetailList.result, function (k, v) {
            try {
                templateId = v.templateid;
                list_itemId = v.itemid;
                itemName = v.name; //아이템-이름
                itemKey = v.key_;
                itemDelay = v.delay; //아이템-갱신간격

                hostApplLength = v.applications.length;

                for (var i = 0; i < hostApplLength; i++) {
                    applicationId[i] = v.applications[i].applicationid;
                    applicationName[i] = v.applications[i].name;
                    applicationValue[i] = v.applications[i].name;
                }

                itemStatus = v.status;
            } catch (e) {
                if (v.applications.length == 0) {
                    applicationName = "none";
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


            if (itemKey.indexOf("[") != -1) {
                collectionIndexStart = itemKey.indexOf("[");
                collectionIndexEnd = itemKey.indexOf("]");

                console.log(" collectionIndexStart : " + collectionIndexStart);
                console.log(" collectionIndexEnd : " + collectionIndexEnd);
                collectionTitle = itemKey.substring(0, collectionIndexStart);

                if (collectionTitle.indexOf("run") != -1) {

                    var shellKeyValue1 = '';
                    var shellKey = '';
                    var shellKeyArray = [];

                    shellKey = itemKey.substring(collectionIndexStart + 1, collectionIndexEnd);
                    shellKeyArray = shellKey.split(",");

                    console.log(" 아이템 KEY 출력 : shell SubString : " + shellKey);
                    console.log(" 아이템 KEY ARRAY 출력 : " + JSON.stringify(shellKeyArray));
                    shellKeyValue1 = shellKeyArray[0];
                    console.log(" shellKeyValue1 : " + shellKeyValue1);

                    console.log(" collectionTitle : " + collectionTitle);

                    $("#inCollItem_U").val("Shell");

                    $("#processInput1_U").hide();
                    $("#processInput2_U").hide();
                    $("#portInput1_U").hide();
                    $("#logInput1_U").hide();
                    $("#logInput2_U").hide();
                    $("#logInput3_U").hide();

                    $("#shellInput1_U").show();
                    $("#shellCommand_U").val(shellKeyValue1);

                } else if (collectionTitle.indexOf("proc") != -1) {

                    var procKeyValue1, procKeyValue2 = '';
                    var procKey = '';
                    var procKeyArray = [];

                    procKey = itemKey.substring(collectionIndexStart + 1, collectionIndexEnd);
                    procKeyArray = procKey.split(",");

                    console.log(" 아이템 KEY 출력 : process SubString : " + procKey);
                    console.log(" 아이템 KEY ARRAY 출력 : " + JSON.stringify(procKeyArray));
                    procKeyValue1 = procKeyArray[0];
                    procKeyValue2 = procKeyArray[3];
                    console.log(" procKeyValue1 : " + procKeyValue1);
                    console.log(" procKeyValue2 : " + procKeyValue2);

                    console.log(" collectionTitle : " + collectionTitle);

                    $("#inCollItem_U").val("프로세스 수");

                    $("#portInput1_U").hide();
                    $("#shellInput1_U").hide();
                    $("#logInput1_U").hide();
                    $("#logInput2_U").hide();
                    $("#logInput3_U").hide();

                    $("#processInput1_U").show();
                    $("#processInput2_U").show();
                    $("#processName_U").val(procKeyValue1);
                    $("#processCmdLine_U").val(procKeyValue2);


                } else if (collectionTitle.indexOf("port") != -1) {

                    var portKeyValue1 = '';
                    var portKey = '';
                    var portKeyArray = [];

                    portKey = itemKey.substring(collectionIndexStart + 1, collectionIndexEnd);
                    portKeyArray = portKey.split(",");

                    console.log(" 아이템 KEY 출력 : port SubString : " + portKey);
                    console.log(" 아이템 KEY ARRAY 출력 : " + JSON.stringify(portKeyArray));
                    portKeyValue1 = portKeyArray[1];
                    console.log(" portKeyValue1 : " + portKeyValue1);

                    console.log(" collectionTitle : " + collectionTitle);

                    $("#inCollItem_U").val("포트");

                    $("#processInput1_U").hide();
                    $("#processInput2_U").hide();
                    $("#shellInput1_U").hide();
                    $("#logInput1_U").hide();
                    $("#logInput2_U").hide();
                    $("#logInput3_U").hide();

                    $("#portInput1_U").show();
                    $("#portNumber_U").val(portKeyValue1);

                } else if (collectionTitle.indexOf("log") != -1) {

                    var logKeyValue1, logKeyValue2, logKeyValue3 = '';
                    var logKey = '';
                    var logKeyArray = [];
                    var logKeyStart1, logKeyEnd1 = '';

                    logKey = itemKey.substring(collectionIndexStart + 1, collectionIndexEnd);
                    logKeyArray = logKey.split(",");

                    console.log(" 아이템 KEY 출력 : log SubString : " + logKey);
                    console.log(" 아이템 KEY ARRAY 출력 : " + JSON.stringify(logKeyArray));

                    logKeyStart1 = logKeyArray[0].indexOf("\"");
                    logKeyEnd1 = logKeyArray[0].lastIndexOf("\"");
                    console.log(" logKeyStart1 : " + logKeyStart1);
                    console.log(" logKeyEnd1 : " + logKeyEnd1);
                    logKeyValue1 = logKeyArray[0].substring(logKeyStart1 + 1, logKeyEnd1);

                    logKeyValue2 = logKeyArray[1];
                    logKeyValue3 = logKeyArray[2];
                    console.log(" logKeyValue1 : " + logKeyValue1);
                    console.log(" logKeyValue2 : " + logKeyValue2);
                    console.log(" logKeyValue3 : " + logKeyValue3);

                    console.log(" collectionTitle : " + collectionTitle);

                    $("#inCollItem_U").val("로그");

                    $("#processInput1_U").hide();
                    $("#processInput2_U").hide();
                    $("#portInput1_U").hide();
                    $("#shellInput1_U").hide();

                    $("#logInput1_U").show();
                    $("#logInput2_U").show();
                    $("#logInput3_U").show();
                    $("#logFile_U").val(logKeyValue1);
                    $("#logRegexp_U").val(logKeyValue2);
                    $("#logEncoding_U").val(logKeyValue3);

                } else {

                    $("#processInput1_U").hide();
                    $("#processInput2_U").hide();
                    $("#portInput1_U").hide();
                    $("#shellInput1_U").hide();
                    $("#logInput1_U").hide();
                    $("#logInput2_U").hide();
                    $("#logInput3_U").hide();
                }
            }

            $("#inTemplateId_U").val(templateId);
            $("#inItemId_U").val(list_itemId);
            $("#inItemNam_U").val(itemNameFinal);
            $("#inItemKey_U").val(itemKey);
            $("#inCollInfo_U").val(itemKey);
            $("#inItemUpd_U").val(itemDelay);

            for (var j = 0; j < allApplLength; j++) {
                var applicationCheck = [];
                var applCheckValue = [];

                applCheckValue[j] = $("#applicationUpdate_" + j).attr("name");

                for (var b = 0; b < hostApplLength; b++) {
                    applicationCheck[b] = applicationId[b];

                    if (applCheckValue[j] == applicationCheck[b]) {
                        $("#applicationUpdate_" + j).prop('checked', true);
                        console.log(" update_ItemDetail ApplicationName : " + $("#applicationUpdate_" + j).attr("name"))
                    }
                }
            }

            $("#inAct_U").val(itemStatus);
            $("#itemUpdateType").val("N");

            $("#inTemplateId_U").attr("readonly", true);
            $("#inItemId_U").attr("readonly", true);

            if ($("#inTemplateId_U").val() != "") {
                $("#hostid").attr("readonly", true);
                $("#inItemNam_U").attr("readonly", true);

                $("#inItemUpd_U").attr("readonly", true);

                $("#collItemBtn_U").attr("disabled", true);

                $("#processName_U").attr("readonly", true);
                $("#processCmdLine_U").attr("readonly", true);
                $("#portNumber_U").attr("readonly", true);
                $("#shellCommand_U").attr("readonly", true);
                $("#logFile_U").attr("readonly", true);
                $("#logRegexp_U").attr("readonly", true);
                $("#logEncoding_U").attr("readonly", true);
            }

            $('#inItemUpd_U').keyup(function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        });
    });

    update_TriggerDetail(itemId, hostid);
}

function update_TriggerDetail(itemId, hostid) {
    console.log(" update_TriggerDetail ");

    var triggerStatus, triDescription, triExpression, triPriority, triValue, triggerId = '';
    var triggerTime, triggerStandard, triggerInequality, triggerValue = '';
    var copyTriggerValue = '';
    var triggerInfoArr = [];

    var triggerList, triggerTable = '';

    zbxApi.ItemDetailInfo.triggerInfoGet(hostid, itemId).then(function (data) {
        triggerList = zbxApi.ItemDetailInfo.success(data);
        var triggerLength = triggerList.result.length;

        // triggerLength 가 0보다 큰 경우
        if ($("#thesholdUpdate_tbody tr").length == 0) {
            if (triggerLength > 0) {
                console.log(" update_TriggerDetail triggerLength : " + triggerLength);

                for (var length = 0; length < triggerLength; length++) {
                    triggerTable += "<tr id='triggerList_" + length + "'>";

                    triggerTable += "<td style='display: none;'>" +
                        "<input type='text' id='triggerIdUpdate_" + length + "' class='input_triggerId' readonly>" +
                        "</td>";

                    triggerTable += "<td>" +
                        "<input type='text' id='description_" + length + "' class='input_triggerName' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "</td>";

                    triggerTable +=
                        "<td>" +
                        "<input type='text' id='triggerTimeValue_" + length + "' class='input_triggerTime' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "</td>" +
                        "<td>" +
                        "<select id='triggerStandard_" + length + "' class='select_triggerStandard' onchange='change_TriggerStandardU(" + length + ")'>" +
                        "<option id='last' value='last'> 최신값 </option>" +
                        "<option id='max' value='max'> 최대값 </option>" +
                        "<option id='min' value='min'> 최소값 </option>" +
                        "<option id='avg' value='avg'> 평균 </option>" +
                        /*"<option id='nodata' value='nodata'> 데이터 미 존재 </option>" +*/
                        "</select>" +
                        "</td>" +
                        "<td>" +
                        "<select id='triggerInequality_" + length + "' class='select_triggerInequality' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "<option id='equal'> = </option>" +
                        "<option id='greater'> > </option>" +
                        "<option id='less'> < </option>" +
                        "<option id='lessEqual'> >= </option>" +
                        "<option id='greaterEqual'> <= </option>" +
                        "</select>" +
                        "</td>" +
                        "<td>" +
                        "<input type='text' id='triggerValue_" + length + "' class='input_triggerValue' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "</td>";

                    triggerTable += "<td>" +
                        "<select id='severity_update_" + length + "' class='select_triggerSeverity' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "<option id='severity_01'> 미분류 </option>" +
                        "<option id='severity_02'> 정보 </option>" +
                        "<option id='severity_03'> 경고 </option>" +
                        "<option id='severity_04'> 가벼운장애 </option>" +
                        "<option id='severity_05'> 중증장애 </option>" +
                        "<option id='severity_06'> 심각한장애 </option>" +
                        "</select>" +
                        "</td>&nbsp&nbsp";

                    triggerTable += "<td>" +
                        "<select id='triggerStatus_" + length + "' class='select_triggerActive' onchange='change_TriggerUpdateType(" + length + ")'>" +
                        "<option id='status_0'> 활성 </option>" +
                        "<option id='status_1'> 비활성 </option>" +
                        "</select>" +
                        "</td>";

                    triggerTable += "<td><a onclick='update_TriggerNew()'>추가</a> / <a id='removeTheshold_" + length + "' onclick='remove_UpdateTrigger(this)'>삭제</a>" +
                        "<input type='text' id='triggerRowType_" + length + "' size='1' class='input_triggerChangeType' readonly></td>";

                    triggerTable += "</tr>";
                }

            } else {
                //update_TriggerNew();
            }
            $("#thesholdUpdate_tbody").append(triggerTable);


            $.each(triggerList.result, function (k, v) {
                triggerId = v.triggerid;
                triggerStatus = v.status;
                triDescription = v.description;
                triExpression = $("#inItemKey_U").val();
                triValue = v.expression;
                triPriority = v.priority;

                console.log(" triggerList triPriority : " + triPriority);

                console.log("");
                console.log(" 트리거 정보 : " + triValue);
                /* 트리거 정보 */
                /* triggerTime 시간, triggerStandard 기준, triggerInequality 부등호, triggerValue 값 */
                var subTriggerTitle, startTitle, endTitle, subTriggerValue, standardInfo, standardKey, beforeStandard,
                    subTriggerTime = '';
                var subTime, subStandard, subTriggerStandard, subInequality, subValue = '';

                copyTriggerValue = triValue;
                startTitle = copyTriggerValue.indexOf("{") + 1;
                endTitle = copyTriggerValue.indexOf("}");
                console.log(" 1. startScript : " + startTitle + " / endScript : " + endTitle);

                subTriggerTitle = copyTriggerValue.substring(startTitle, endTitle);
                console.log(" 2. subTriggerTitle : " + subTriggerTitle);

                standardKey = subTriggerTitle.lastIndexOf(".");
                console.log(" 3. standardKey : " + standardKey);

                standardInfo = subTriggerTitle.substring((standardKey + 1));
                console.log(" 4. standardInfo : " + standardInfo);

                subTriggerTime = standardInfo.match('[0-9]+');
                console.log(" 5. subTriggerTime : " + subTriggerTime);

                beforeStandard = standardInfo.indexOf("(");
                console.log(" 6. beforeStandard : " + beforeStandard);

                subTriggerStandard = standardInfo.substring(0, beforeStandard);
                console.log(" 7. subTriggerStandard : " + subTriggerStandard);

                subTriggerValue = copyTriggerValue.substring((endTitle + 1));
                console.log(" 8. subTriggerValue : " + subTriggerValue);

                triggerTime = subTriggerTime;
                triggerStandard = subTriggerStandard;
                triggerInequality = subTriggerValue.match('[<>=]+');
                triggerValue = subTriggerValue.match('[0-9]+');

                console.log(" ====================== TRIGGER INFO ====================== ");
                console.log(" triggerTime : " + triggerTime);
                console.log(" triggerStandard : " + triggerStandard);
                console.log(" triggerInequality : " + triggerInequality);
                console.log(" triggerValue : " + triggerValue);
                console.log(" convStandardKor : " + triggerStandard);
                console.log(" ====================== TRIGGER INFO ====================== ");

                if (triggerStandard == "last") {
                    $("#triggerTimeValue_" + k).attr("disabled", true);
                    $("#triggerInequality_" + k).attr("disabled", true);
                }

                $("#triggerIdUpdate_" + k).val(triggerId);
                $("#description_" + k).val(triDescription);
                $("#triggerExpression_" + k).val(triExpression);

                $("#triggerTimeValue_" + k).val(triggerTime);
                $("#triggerStandard_" + k).val(triggerStandard);
                $("#triggerInequality_" + k).val(triggerInequality);
                $("#triggerValue_" + k).val(triggerValue);

                $("#severity_update_" + k).val(convPriorityKor(triPriority));
                $("#triggerStatus_" + k).val(convStatusTrigger(triggerStatus));
                $("#removeTheshold_" + k).attr("name", triggerId);
                $("#triggerRowType_" + k).val("N");

                $("#triggerValue_" + k).keyup(function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });

                $("#triggerTimeValue_" + k).keyup(function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });

            });
        }
    });
}

function change_ItemUpdateType() {
    console.log(" change_ItemUpdateType ");
    $("#itemUpdateType").val("U");
}

function change_TriggerUpdateType(row) {
    console.log(" change_TriggerUpdateType row : " + row);
    $("#triggerRowType_" + row).val("U");
}

function update_TriggerNew() {
    console.log(" update_TriggerNew ");

    var newTriggerRow, newTriggerTable = '';
    var paraItemName, paraItemCollection = '';

    newTriggerRow = $('#thesholdUpdate_tbody tr').length;
    console.log(" 새로 추가하는 트리거 ROW : " + newTriggerRow);

    newTriggerTable += "<tr id='triggerList_" + newTriggerRow + "'>";

    newTriggerTable += "<td style='display: none;'>" +
        "<input type='text' id='triggerIdUpdate_" + newTriggerRow + "' class='input_triggerId' readonly>" +
        "</td>";

    newTriggerTable += "<td>" +
        "<input type='text' id='description_" + newTriggerRow + "' class='input_triggerName'>" +
        "</td>";

    newTriggerTable +=
        "<td>" +
        "<input type='text' id='triggerTimeValue_" + newTriggerRow + "' class='input_triggerTime'>" +
        "</td>" +
        "<td>" +
        "<select id='triggerStandard_" + newTriggerRow + "' class='select_triggerStandard' onchange='change_TriggerStandardU(" + newTriggerRow + ")'>" +
        "<option id='last' value='last'> 최신값 </option>" +
        "<option id='max' value='max'> 최대값 </option>" +
        "<option id='min' value='min'> 최소값 </option>" +
        "<option id='avg' value='avg'> 평균 </option>" +
        /*"<option id='nodata' value='nodata'> 데이터 미 존재 </option>" +*/
        "</select>" +
        "</td>" +
        "<td>" +
        "<select id='triggerInequality_" + newTriggerRow + "' class='select_triggerInequality'>" +
        "<option id='equal' value='equal'> = </option>" +
        "<option id='greater' value='greater'> > </option>" +
        "<option id='less' value='less'> < </option>" +
        "<option id='lessEqual' value='lessEqual'> >= </option>" +
        "<option id='greaterEqual' value='greaterEqual'> <= </option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<input type='text' id='triggerValue_" + newTriggerRow + "' class='input_triggerValue'>" +
        "</td>";

    newTriggerTable += "<td>" +
        "<select id='severity_update_" + newTriggerRow + "' class='select_triggerSeverity'>" +
        "<option id='severity_01'> 미분류 </option>" +
        "<option id='severity_02'> 정보 </option>" +
        "<option id='severity_03'> 경고 </option>" +
        "<option id='severity_04'> 가벼운장애 </option>" +
        "<option id='severity_05'> 중증장애 </option>" +
        "<option id='severity_06'> 심각한장애 </option>" +
        "</select>" +
        "</td>&nbsp&nbsp";

    newTriggerTable += "<td>" +
        "<select id='triggerStatus_" + newTriggerRow + "' class='select_triggerActive'>" +
        "<option id='status_0'> 활성 </option>" +
        "<option id='status_1'> 비활성 </option>" +
        "</select>" +
        "</td>";

    newTriggerTable += "<td><a onclick='update_TriggerNew()'>추가</a> / <a id='removeTheshold_" + newTriggerRow + "' onclick='remove_UpdateTrigger(this)'>삭제</a>" +
        "<input type='text' id='triggerRowType_" + newTriggerRow + "' size='1' class='input_triggerChangeType' readonly style='display: none;'></td>";

    newTriggerTable += "</tr>";

    paraItemName = $("#inCollInfo_U").val();
    paraItemCollection = $("#inCollItem_U").val();

    $("#thesholdUpdate_tbody").append(newTriggerTable);

    $("#triggerTimeValue_" + newTriggerRow).val("0");
    $("#triggerTimeValue_" + newTriggerRow).attr("disabled", true);
    $("#triggerInequality_" + newTriggerRow).attr("disabled", true);

    if(paraItemCollection == "로그"){
        console.log(" 로그 로그 로그");
        $("#triggerStandard_" + newTriggerRow).attr("disabled", true);
        $("#triggerInequality_" + newTriggerRow).val("equal");
    }

    $("#triggerExpression_" + newTriggerRow).val(paraItemName);
    $("#triggerStatus_" + newTriggerRow).val(convStatusTrigger("0"));
    $("#triggerValue_" + newTriggerRow).keyup(function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    $("#triggerTimeValue_" + newTriggerRow).keyup(function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    $("#triggerRowType_" + newTriggerRow).val("A");
}

function remove_UpdateTrigger(obj) {
    console.log(" remove_UpdateTrigger ");

    var triggerLength = $("#thesholdUpdate_tbody tr").length;
    console.log(" remove_UpdateTrigger triggerLength : " + triggerLength);

    var triName = $(obj).attr("name");
    console.log(" remove_UpdateTrigger TRIGGER ID : " + triName);

    var rowId = $(obj).attr("id").split("_");
    console.log(" remove_UpdateTrigger rowId : " + rowId);

    var deleteRow = rowId[1];
    console.log(" remove_UpdateTrigger deleteRow : " + deleteRow);

    var deleteRowType = $("#triggerRowType_" + deleteRow).val();
    console.log(" remove_UpdateTrigger deleteRowType : " + deleteRowType);
    if (deleteRowType == "A") {
        $(obj).parent().parent().remove();
    } else {
        $("#triggerRowType_" + deleteRow).val("D");
        $(obj).parent().parent().hide();
    }
}

function update_ItemSubmitBtn() {
    console.log("update_ItemSubmitBtn");

    var paraHostId = $("#hostIdInfo_U").val(); //호스트아이디
    var paraHostName = $("#hostNameInfo_U").val();
    console.log(" update_ItemSubmitBtn paraHostId : " + paraHostId);
    console.log(" update_ItemSubmitBtn paraHostName : " + paraHostName);

    update_ItemSubmit(paraHostId, paraHostName);
    update_TriggerSubmit(paraHostId, paraHostName);

    $("[id^=base]").hide();
    $("#base_serverItem").show();

    list_ItemList(paraHostId);
}

function update_ItemSubmit(paraHostId, paraHostName) {
    console.log(" update_ItemSubmit ");

    var para_itemId, para_itemName, para_collection, para_log, para_shell, para_updateTime, itemStatus,
        para_status = '';
    var applicationLength, checkApplication, checkWhether, checkApplicationId = '';
    var applicationList = [];
    var paraProcName_U, paraProcCmd_U, paraPortNum_U, paraShellComm_U, paraLogFile_U, paraLogRege_U,
        paraLogEncod_U = '';

    var itemChange = $("#itemUpdateType").val();
    console.log(" itemChange : " + itemChange);

    if (itemChange == "U") {

        para_itemId = $("#inItemId_U").val();
        para_itemName = $("#inItemNam_U").val();
        para_updateTime = $("#inItemUpd_U").val();

        para_status = $("#inAct_U").val();
        console.log("para_status : " + para_status);

        applicationLength = $("#applicationList_U input").length;
        console.log(" applicationLength : " + applicationLength);

        for (var appLength = 0; appLength < applicationLength; appLength++) {
            console.log(" appLength : " + appLength);
            checkApplication = $("#applicationUpdate_" + appLength);

            checkWhether = $("#applicationUpdate_" + appLength).prop('checked');
            console.log(" APPLICATION LENGTH : " + appLength + " / APPLICATION CHECK : " + checkWhether + " / VALUE : " + checkApplication.val());

            if (checkWhether == true) {
                console.log(" CHECKED APPLICATION LENGTH : " + appLength + " / APPLICATION CHECK : " + checkWhether + " / VALUE : " + checkApplication.val());
                checkApplicationId = $("#applicationUpdate_" + appLength).attr("name");
                console.log(" CHECK APPLICATION INFO VALUE : " + checkApplication.val() + " / ID : " + checkApplicationId);
                applicationList.push(checkApplicationId);
            }
        }

        console.log(" applicationList : " + JSON.stringify(applicationList));
        console.log(" 아이템 수정 시작 ");
        console.log(" update_ItemSubmit 아이템아이디 : " + para_itemId);
        console.log(" update_ItemSubmit 이름 : " + para_itemName);
        console.log(" update_ItemSubmit 갱신간격 : " + para_updateTime);
        console.log(" update_ItemSubmit 아이템활성여부 : " + para_status);

        zbxApi.itemInfoUpdate.itemUpdate(para_itemId, para_itemName, para_updateTime, para_status, applicationList).then(function (data) {
            zbxApi.itemInfoUpdate.success(data);
        });
    }
}

function update_TriggerSubmit(paraHostId, paraHostName) {
    console.log(" update_TriggerSubmit ");

    var triggerRowType, triFinalLength = '';

    triFinalLength = $("#thesholdUpdate_tbody tr").length;
    console.log(" triFinalLength :" + triFinalLength);
    console.log(" ");

    for (var submitRow = 0; submitRow < triFinalLength; submitRow++) {
        triggerRowType = $("#triggerRowType_" + submitRow).val();

        if (triggerRowType == "A") {

            var triggerStringAdd = '';

            var add_triggerName, add_triggerThreshold, add_triggerStatus, add_triggerSeverity = '';
            var triggerNameAdd, triggerStatusAdd,
                triggerSeverityAdd, triggerTimeValueAdd, triggerStandardAdd, triggerInequalityAdd, triggerValueAdd = '';
            var updateA_collKeyTitle = '';
            var triggerTitleUpdate_A, triggerStringUpdate_A = '';
            var triggerKeyUpdate_A = '';
            var paraProcName_UAT, paraProcCmd_UAT, paraPortNum_UTA, paraShellComm_UAT, paraLogFile_UAT, paraLogRege_UAT,
                paraLogEncod_UAT = '';

            triggerNameAdd = $("#description_" + submitRow).val();
            triggerTimeValueAdd = $("#triggerTimeValue_" + submitRow).val();
            triggerStandardAdd = $("#triggerStandard_" + submitRow).val();
            triggerInequalityAdd = $("#triggerInequality_" + submitRow).val();
            triggerInequalityAdd = convTriggerInquality(triggerInequalityAdd);
            triggerValueAdd = $("#triggerValue_" + submitRow).val();
            triggerSeverityAdd = $("#severity_update_" + submitRow).val();
            triggerStatusAdd = $("#triggerStatus_" + submitRow).val();

            //paraItemKeyAdd = $("#inItemKey_U").val();
            updateA_collKeyTitle = $("#inCollItem_U").val();
            if (updateA_collKeyTitle == "프로세스 수") {

                paraProcName_UAT = $("#processName_U").val();
                paraProcCmd_UAT = $("#processCmdLine_U").val();

                console.log(" paraProcName_UAT : " + paraProcName_UAT);
                console.log(" paraProcCmd_UAT : " + paraProcCmd_UAT);

                triggerTitleUpdate_A = "proc.num[";
                console.log(" PROCESS triggerTitleUpdate_A : " + triggerTitleUpdate_A);
                triggerStringUpdate_A = triggerTitleUpdate_A + paraProcName_UAT + ",,," + paraProcCmd_UAT + "]";
                console.log(" PROCESS triggerStringUpdate_A : " + triggerStringUpdate_A);

                triggerKeyUpdate_A = triggerStringUpdate_A;

            } else if (updateA_collKeyTitle == "포트") {

                paraPortNum_UTA = $("#portNumber_U").val();

                console.log(" paraPortNum_UTA : " + paraPortNum_UTA);

                triggerTitleUpdate_A = "net.tcp.port[";
                console.log(" PORT triggerTitleUpdate_A : " + triggerTitleUpdate_A);
                triggerStringUpdate_A = triggerTitleUpdate_A + "," + paraPortNum_UTA + "]";
                console.log(" PORT triggerStringUpdate_A : " + triggerStringUpdate_A);

                triggerKeyUpdate_A = triggerStringUpdate_A;

            } else if (updateA_collKeyTitle == "Shell") {

                paraShellComm_UAT = $("#shellCommand_U").val();

                console.log(" paraShellComm_UAT : " + paraShellComm_UAT);

                triggerTitleUpdate_A = "system.run[";
                console.log(" SHELL triggerTitleUpdate_A : " + triggerTitleUpdate_A);
                triggerStringUpdate_A = triggerTitleUpdate_A + paraShellComm_UAT + ",]";
                console.log(" SHELL triggerStringUpdate_A : " + triggerStringUpdate_A);

                triggerKeyUpdate_A = triggerStringUpdate_A;

            } else if (updateA_collKeyTitle == "로그") {

                paraLogFile_UAT = $("#logFile_U").val();
                paraLogRege_UAT = $("#logRegexp_U").val();
                paraLogEncod_UAT = $("#logEncoding_U").val();

                console.log(" paraLogFile_UAT : " + paraLogFile_UAT);
                console.log(" paraLogRege_UAT : " + paraLogRege_UAT);
                console.log(" paraLogEncod_UAT : " + paraLogEncod_UAT);

                triggerTitleUpdate_A = "log[";
                console.log(" LOG triggerTitleUpdate_A : " + triggerTitleUpdate_A);
                triggerStringUpdate_A = triggerTitleUpdate_A + "\"" + paraLogFile_UAT + "\"," + paraLogRege_UAT + "," + paraLogEncod_UAT + ",,,]";
                console.log(" LOG triggerStringUpdate_A : " + triggerStringUpdate_A);

                triggerKeyUpdate_A = triggerStringUpdate_A;

            } else {
            }

            console.log(" add_TriggerSubmit ");
            console.log(" triggerRowType : " + triggerRowType);
            console.log(" triggerName : " + triggerNameAdd);
            console.log(" triggerSeverity : " + triggerSeverityAdd);
            console.log(" triggerTimeValue : " + triggerTimeValueAdd);
            console.log(" triggerStandard : " + triggerStandardAdd);
            console.log(" triggerInequality : " + triggerInequalityAdd);
            console.log(" triggerValue : " + triggerValueAdd);
            console.log(" triggerStatus : " + triggerStatusAdd);
            console.log(" ");

            triggerStringAdd =
                "{" + paraHostName + ":" + triggerKeyUpdate_A + "." + triggerStandardAdd + "(" + triggerTimeValueAdd + ")}" + triggerInequalityAdd + triggerValueAdd;
            console.log(" FINAL triggerString ADD : " + triggerStringAdd);

            add_triggerName = triggerNameAdd;
            add_triggerThreshold = triggerStringAdd;
            add_triggerStatus = convStatusTriggerNum(triggerStatusAdd);
            add_triggerSeverity = convPriorityNum(triggerSeverityAdd);

            console.log(" API CALL TRIGGER INFO < UPDATE > ");
            console.log(" add_triggerName : " + add_triggerName);
            console.log(" add_triggerThreshold : " + add_triggerThreshold);
            console.log(" add_triggerStatus : " + add_triggerStatus);
            console.log(" add_triggerSeverity : " + add_triggerSeverity);
            console.log(" ");

            zbxApi.triggerInfoUpdate.triggerAdd(add_triggerName, add_triggerThreshold, add_triggerSeverity, add_triggerStatus).then(function (data) {
                zbxApi.triggerInfoUpdate.success(data);
            });

        }
        else if (triggerRowType == "U") {

            var triggerStringUpd = '';

            var update_triggerId, update_triggerName, update_triggerThreshold, update_triggerStatus,
                update_triggerSeverity = '';
            var triggerIdUpd, triggerNameUpd, triggerStatusUpd,
                triggerSeverityUpd, triggerTimeValueUpd, triggerStandardUpd, triggerInequalityUpd, triggerValueUpd = '';
            var updateU_collKeyTitle = '';
            var paraProcName_UUT, paraProcCmd_UUT, paraPortNum_UUT, paraShellComm_UUT, paraLogFile_UUT, paraLogRege_UUT,
                paraLogEncod_UUT = '';
            var triggerTitleUpdate_U, triggerStringUpdate_U, triggerKeyUpdate_U = '';

            triggerIdUpd = $("#triggerIdUpdate_" + submitRow).val();
            triggerNameUpd = $("#description_" + submitRow).val();
            triggerTimeValueUpd = $("#triggerTimeValue_" + submitRow).val();
            triggerStandardUpd = $("#triggerStandard_" + submitRow).val();
            triggerInequalityUpd = $("#triggerInequality_" + submitRow).val();
            triggerValueUpd = $("#triggerValue_" + submitRow).val();
            triggerSeverityUpd = $("#severity_update_" + submitRow).val();
            triggerStatusUpd = $("#triggerStatus_" + submitRow).val();


            updateU_collKeyTitle = $("#inCollItem_U").val();
            if (updateU_collKeyTitle == "프로세스 수") {

                paraProcName_UUT = $("#processName_U").val();
                paraProcCmd_UUT = $("#processCmdLine_U").val();

                console.log(" paraProcName_UUT : " + paraProcName_UUT);
                console.log(" paraProcCmd_UUT : " + paraProcCmd_UUT);

                triggerTitleUpdate_U = "proc.num[";
                console.log(" PROCESS triggerTitleUpdate_U : " + triggerTitleUpdate_U);
                triggerStringUpdate_U = triggerTitleUpdate_U + paraProcName_UUT + ",,," + paraProcCmd_UUT + "]";
                console.log(" PROCESS triggerStringUpdate_U : " + triggerStringUpdate_U);

                triggerKeyUpdate_U = triggerStringUpdate_U;

            } else if (updateU_collKeyTitle == "포트") {

                paraPortNum_UUT = $("#portNumber_U").val();

                console.log(" paraPortNum_UUA : " + paraPortNum_UUT);

                triggerTitleUpdate_U = "net.tcp.port[";
                console.log(" PORT triggerTitleUpdate_U : " + triggerTitleUpdate_U);
                triggerStringUpdate_U = triggerTitleUpdate_U + "," + paraPortNum_UUT + "]";
                console.log(" PORT triggerStringUpdate_U : " + triggerStringUpdate_U);

                triggerKeyUpdate_U = triggerStringUpdate_U;

            } else if (updateU_collKeyTitle == "Shell") {

                paraShellComm_UUT = $("#shellCommand_U").val();

                console.log(" paraShellComm_UUT : " + paraShellComm_UUT);

                triggerTitleUpdate_U = "system.run[";
                console.log(" SHELL triggerTitleUpdate_U : " + triggerTitleUpdate_U);
                triggerStringUpdate_U = triggerTitleUpdate_U + paraShellComm_UUT + ",]";
                console.log(" SHELL triggerTitleUpdate_U : " + triggerTitleUpdate_U);

                triggerKeyUpdate_U = triggerStringUpdate_U;

            } else if (updateU_collKeyTitle == "로그") {

                paraLogFile_UUT = $("#logFile_U").val();
                paraLogRege_UUT = $("#logRegexp_U").val();
                paraLogEncod_UUT = $("#logEncoding_U").val();

                console.log(" paraLogFile_UUT : " + paraLogFile_UUT);
                console.log(" paraLogRege_UUT : " + paraLogRege_UUT);
                console.log(" paraLogEncod_UUT : " + paraLogEncod_UUT);

                triggerTitleUpdate_U = "log[";
                console.log(" LOG triggerTitleUpdate_U : " + triggerTitleUpdate_U);
                triggerStringUpdate_U = triggerTitleUpdate_U + "\"" + paraLogFile_UUT + "\"," + paraLogRege_UUT + "," + paraLogEncod_UUT + ",,,]";
                console.log(" LOG triggerStringUpdate_U : " + triggerStringUpdate_U);

                triggerKeyUpdate_U = triggerStringUpdate_U;

            } else {
            }

            console.log(" update_TriggerSubmit ");
            console.log(" triggerRowType : " + triggerRowType);
            console.log(" triggerId : " + triggerIdUpd);
            console.log(" triggerName : " + triggerNameUpd);
            console.log(" triggerSeverity : " + triggerSeverityUpd);
            console.log(" triggerTimeValue : " + triggerTimeValueUpd);
            console.log(" triggerStandard : " + triggerStandardUpd);
            console.log(" triggerInequality : " + triggerInequalityUpd);
            console.log(" triggerValue : " + triggerValueUpd);
            console.log(" triggerStatus : " + triggerStatusUpd);
            console.log(" ");

            triggerStringUpd =
                "{" + paraHostName + ":" + triggerKeyUpdate_U + "." + triggerStandardUpd + "(" + triggerTimeValueUpd + ")}" + triggerInequalityUpd + triggerValueUpd;
            console.log(" FINAL triggerString UPDATE : " + triggerStringUpd);

            update_triggerId = triggerIdUpd;
            update_triggerName = triggerNameUpd;
            update_triggerThreshold = triggerStringUpd;
            update_triggerStatus = convStatusTriggerNum(triggerStatusUpd);
            update_triggerSeverity = convPriorityNum(triggerSeverityUpd);

            console.log(" API CALL TRIGGER INFO < UPDATE > ");
            console.log(" update_triggerId : " + update_triggerId);
            console.log(" update_triggerName : " + update_triggerName);
            console.log(" update_triggerThreshold : " + update_triggerThreshold);
            console.log(" update_triggerStatus : " + update_triggerStatus);
            console.log(" update_triggerSeverity : " + update_triggerSeverity);
            console.log(" ");

            zbxApi.triggerInfoUpdate.triggerUpdate(update_triggerId, update_triggerName, update_triggerThreshold, update_triggerStatus, update_triggerSeverity).then(function (data) {
                zbxApi.triggerInfoUpdate.success(data);
            });

        }
        else if (triggerRowType == "D") {

            var delete_triggerId = '';

            delete_triggerId = $("#triggerIdUpdate_" + submitRow).val();

            console.log(" update_TriggerSubmit delete_row : " + submitRow);
            console.log(" update_TriggerSubmit delete_triggerId : " + delete_triggerId);

            zbxApi.triggerInfoUpdate.triggerDelete(delete_triggerId).then(function (data) {
                zbxApi.triggerInfoUpdate.success(data);
            });

        } else {
        }
    }
}

function update_ItemDeleteBtn() {
    console.log(" update_ItemDeleteBtn ");

    var templateId = $("#inTemplateId_U").val();
    var para_itemId = $("#inItemId_U").val();
    var para_hostId = $("#hostIdInfo").val();

    console.log(" update_ItemDeleteBtn templateId : " + templateId);
    console.log(" update_ItemDeleteBtn para_itemId : " + para_itemId);

    if (templateId != "" || templateId == "0") {
        $("#alertPopUp").empty();
        var alertMessage = "<strong style='font-size: 18px'> 아이템 삭제가 불가능합니다. </strong><br><br>";
        $("#alertPopUp").append(alertMessage);

        $("#alertPopUp").lightbox_me({
            centered: true,
            closeSelector: ".close",
            overlayCSS: {background: '#474f79', opacity: .8}
        });
    } else {
        zbxApi.itemInfoUpdate.itemDelete(para_itemId).then(function (data) {
            zbxApi.itemInfoUpdate.success(data);
        });

        $("[id^=base]").hide();
        $("#base_serverItem").show();

        list_ItemList(para_hostId);
    }
}

function update_Pageback() {
    console.log(" update_Pageback ");

    var para_hostId = $("#hostIdInfo_U").val();

    $("[id^=base]").hide();
    $("#base_serverItem").show();

    list_ItemList(para_hostId);
}

function change_TriggerStandardU(triggerRow) {
    console.log(" change_TriggerStandardU : " + triggerRow);

    var selectRow, selectValue = '';
    var selectRowType = $("#triggerRowType_" + triggerRow).val();

    selectRow = document.getElementById("triggerStandard_" + triggerRow);

    console.log(" selectRowType : " + selectRowType + " / selectRow : " + triggerRow);

    selectValue = $("#triggerStandard_" + triggerRow).val();
    console.log(" select Value : " + selectValue);

    if (selectRowType == "N") {
        $("#triggerRowType_" + triggerRow).val("U");
    } else {
        $("#triggerRowType_" + triggerRow).val("A");

    }

    if (selectValue == "last") {
        $("#triggerTimeValue_" + triggerRow).val("0");
        $("#triggerTimeValue_" + triggerRow).attr("disabled", true);
        $("#triggerInequality_" + triggerRow).attr("disabled", true);
    } else {
        $("#triggerTimeValue_" + triggerRow).val("");
        $("#triggerTimeValue_" + triggerRow).attr("disabled", false);
        $("#triggerInequality_" + triggerRow).attr("disabled", false);
    }
}

function change_CollectionBtn() {
    console.log(" change_CollectionBtn ");
    var colleTable = '';

    $("#collectionItem").empty();

    colleTable += "<tr><td id='proc.num'>프로세스 수</td></tr>";
    colleTable += "<tr><td id='net.tcp.port'>포트</td></tr>";
    colleTable += "<tr><td id='system.run'>Shell</td></tr>";
    colleTable += "<tr><td id='log'>로그</td></tr>";

    $("#collectionItem").append(colleTable);

    $("#collectionTable tbody tr td").click(function () {
        var collectionName = $(this).text();
        var collectionId = $(this).attr("id");

        $("#inCollItem_U").val(collectionName);

        if (collectionId.indexOf("proc") != -1) {
            $("#inCollInfo_U").val("proc.num[<name>,<user>,<state>,<cmdline>]");

            $("#processInput1_U").show();
            $("#processInput2_U").show();

            $("#portInput1_U").hide();
            $("#shellInput1_U").hide();
            $("#logInput1_U").hide();
            $("#logInput2_U").hide();
            $("#logInput3_U").hide();

        } else if (collectionId.indexOf("port") != -1) {
            $("#inCollInfo_U").val("net.tcp.port[<ip>,port]");

            $("#portInput1_U").show();

            $("#processInput1_U").hide();
            $("#processInput2_U").hide();
            $("#shellInput1_U").hide();
            $("#logInput1_U").hide();
            $("#logInput2_U").hide();
            $("#logInput3_U").hide();

        } else if (collectionId.indexOf("system") != -1) {
            $("#inCollInfo_U").val("system.run[command,<mode>]");

            $("#shellInput1_U").show();

            $("#processInput1_U").hide();
            $("#processInput2_U").hide();
            $("#portInput1_U").hide();
            $("#logInput1_U").hide();
            $("#logInput2_U").hide();
            $("#logInput3_U").hide();

        } else if (collectionId.indexOf("log") != -1) {
            $("#inCollInfo_U").val("log[file,<regexp>,<encoding>,<maxlines>,<mode>,<output>]");

            $("#logInput1_U").show();
            $("#logInput2_U").show();
            $("#logInput3_U").show();

            $("#processInput1_U").hide();
            $("#processInput2_U").hide();
            $("#portInput1_U").hide();
            $("#shellInput1_U").hide();

        } else {

        }

        $('#collectionPopUp').trigger('close');
    });

    $("#collectionPopUp").lightbox_me({
        centered: true,
        closeSelector: ".close",
        overlayCSS: {background: '#474f79', opacity: .8}
    });
}