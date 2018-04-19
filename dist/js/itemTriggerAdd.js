/**
 * Created by ktds on 2017-12-12.
 */

function create_ItemCreate(hostid, paraHostName) {
    console.log("아이템 생성 호스트 아이디 : " + hostid);

    $("#itemInfoTable").empty();
    $("#thesholdTableAdd_tbody").empty();
    $("#aleTrigger_tbody").empty();

    $("#hostIdInfo").val(hostid);
    $("#hostNameInfo_A").val(paraHostName);

    create_ItemNew();
    create_TriggerNew();
}

function create_ItemNew() {
    $("#itemInfoTable").empty();

    console.log("아이템 추가 New");

    var itemTable = '';
    var para_hostId = $("#hostIdInfo").val();

    var applicationList, applicationTable = '';

    var applicationId, applicationName, applicationValue = '';

    itemTable += "<tr>";
    itemTable += "<td>";
    itemTable += "<label id='itemName_A' class='td_textRight'>이름&nbsp&nbsp</label>";
    itemTable += "</td>";
    itemTable += "<td>";
    itemTable += "<input id='inItemNam_A' type='text' class='input_itemNameText'>";
    itemTable += "</td>";
    itemTable += "</tr>";

    itemTable += "<tr id='collectionA'>" +
        "<td><label id='collectionItem_A' class='td_textRight'>수집항목&nbsp&nbsp</label></td>" +
        "<td><input id='inCollItem_A' type='text' class='input_itemCollText' readonly>" +
        "<label id='collItemBtn_A' class='button_short' onclick='change_CollectionBtnA()'>선택</label></td>" +
        "</tr>";

    itemTable += "<tr id='processInput1_A'>" +
        "<td><label id='processName_Alab' class='td_textRight'>프로세스명&nbsp&nbsp</label></td>" +
        "<td><input id='processName_A' type='text' class='input_processNameText'></td>" +
        "</tr>";
    itemTable += "<tr id='processInput2_A'>" +
        "<td><label id='processCmdLine_Alab' class='td_textRight'>실행문자열&nbsp&nbsp</label></td>" +
        "<td><input id='processCmdLine_A' type='text' class='input_processCmdText'></td>" +
        "</tr>";

    itemTable += "<tr id='portInput1_A'>" +
        "<td><label id='portNumber_Alab' class='td_textRight'>포트번호&nbsp&nbsp</label></td>" +
        "<td><input id='portNumber_A' type='text' class='input_portNumText'></td>" +
        "</tr>";

    itemTable += "<tr id='shellInput1_A'>" +
        "<td><label id='shellCommand_Alab' class='td_textRight'>명령어&nbsp&nbsp</label></td>" +
        "<td><input id='shellCommand_A' type='text' class='input_shellCommandText'></td>" +
        "</tr>";

    itemTable += "<tr id='logInput1_A'>" +
        "<td><label id='logFile_Alab' class='td_textRight'>파일&nbsp&nbsp</label></td>" +
        "<td><input id='logFile_A' type='text' class='input_logFileText'></td>" +
        "</tr>";
    itemTable += "<tr id='logInput2_A'>" +
        "<td><label id='logRegexp_Alab' class='td_textRight'>패턴&nbsp&nbsp</label></td>" +
        "<td><input id='logRegexp_A' type='text' class='input_logRegeText'></td>" +
        "</tr>";
    itemTable += "<tr id='logInput3_A'>" +
        "<td><label id='logEncoding_Alab' class='td_textRight'>인코딩&nbsp&nbsp</label></td>" +
        "<td><input id='logEncoding_A' type='text' class='input_logEncodText'></td>" +
        "</tr>";

    itemTable += "<tr>";
    itemTable += "<td>";
    itemTable += "<label id='itemUpdate_A' class='td_textRight'>갱신간격&nbsp&nbsp</label>";
    itemTable += "</td>";
    itemTable += "<td>" +
        "<select id='inItemUpd_A' class='select_itemDealyTime' onchange='change_ItemUpdateType()'> " +
        "<option id='10' value='10'> 10s </option>" +
        "<option id='30' value='30'> 30s </option>" +
        "<option id='60' value='60'> 1m </option>" +
        "<option id='600' value='600'> 10m </option>" +
        "<option id='3600' value='3600'> 1h </option>" +
        "<option id='43200' value='43200'> 12h </option>" +
        "<option id='86400' value='86400'> 24h </option>" +
        "</select>" +
        "</td>";
    itemTable += "</tr>";

    itemTable += "<tr>";
    itemTable += "<td>";
    itemTable += "<label id='itemApp_A' class='td_textRight'>어플리케이션&nbsp&nbsp</label>";
    itemTable += "</td>";
    itemTable += "<td id='applicationList_A'>";

    zbxApi.ItemDetailInfo.getApplication(para_hostId).then(function (data) {
        applicationList = zbxApi.ItemDetailInfo.success(data);

        var applicationLength = applicationList.result.length;
        console.log("어플리케이션 길이 : " + applicationLength);

        for (var i = 0; i < applicationLength; i++) {
            if (i === 5 || i === 10 || i === 15 || i === 20 || i === 25 || i === 30) {
                applicationTable += "<br>";
            }
            applicationTable += "<input type='checkbox' id='applicationAdd_" + i + "'>&nbsp;";
            applicationTable += "<label id='labelAdd_" + i + "'>";
            applicationTable += "</label>&nbsp;&nbsp;&nbsp;";
        }
        $("#applicationList_A").append(applicationTable);

        $.each(applicationList.result, function (k, v) {
            applicationId = v.applicationid;
            applicationName = v.name;
            applicationValue = v.name;

            $("#applicationAdd_" + k).attr("name", applicationId);
            $("#applicationAdd_" + k).attr("value", applicationValue);
            if (applicationName == "none") {
                applicationName = "없음";
            }
            $("#labelAdd_" + k).text(applicationName);

        })
    });

    itemTable += "</td>";
    itemTable += "</tr>";

    itemTable += "<tr>";
    itemTable += "<td>";
    itemTable += "<label id='itemActive_A' class='text_right'>아이템 활성 여부&nbsp&nbsp</label>";
    itemTable += "</td>";
    itemTable += "<td>" +
        "<select id='inAct_A' class='select_itemActive'>" +
        "<option id='status_0' value='0'> 활성 </option>" +
        "<option id='status_1' value='1'> 비활성 </option>" +
        "</select>" +
        "</td>";
    itemTable += "</tr>";

    $("#itemInfoTable").append(itemTable);

    $("#processInput1_A").hide();
    $("#processInput2_A").hide();
    $("#portInput1_A").hide();
    $("#shellInput1_A").hide();
    $("#logInput1_A").hide();
    $("#logInput2_A").hide();
    $("#logInput3_A").hide();

    $('#inItemUpd_A').keyup(function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

function create_TriggerNew() {
    console.log(" 새로운 트리거 추가 ");

    var triggerNewRow, thresholdRowN = '';
    var itemCollection = '';

    triggerNewRow = $("#thesholdTableAdd_tbody tr").length;
    console.log(" 새로운 트리거 추가 row : " + triggerNewRow);

    thresholdRowN += "<tr id='triggerList_" + triggerNewRow + "'>";

    thresholdRowN += "<td style='display: none;'>" +
        "<input type='text' id='triggerIdUpdate_" + triggerNewRow + "' class='input_triggerId' readonly>" +
        "</tdstyle>";

    thresholdRowN += "<td>" +
        "<input type='text' id='description_" + triggerNewRow + "' class='input_triggerName'>" +
        "</td>";

    thresholdRowN +=
        "<td>" +
        "<input type='text' id='triggerTimeValue_" + triggerNewRow + "' class='input_triggerTime'>" +
        "</td>" +
        "<td>" +
        "<select id='triggerStandard_" + triggerNewRow + "' class='select_triggerStandard' onchange='change_TriggerStandardCreate(" + triggerNewRow + ")'>" +
        "<option id='last' value='last'> 최신값 </option>" +
        "<option id='max' value='max'> 최대값 </option>" +
        "<option id='min' value='min'> 최소값 </option>" +
        "<option id='avg' value='avg'> 평균 </option>" +
        /*"<option id='nodata' value='nodata'> 데이터 미 존재 </option>" +*/
        "</select>" +
        "</td>" +
        "<td>" +
        "<select id='triggerInequality_" + triggerNewRow + "' class='select_triggerInequality'>" +
        "<option id='equal' value='equal'> = </option>" +
        "<option id='greater' value='greater'> > </option>" +
        "<option id='less' value='less'> < </option>" +
        "<option id='lessEqual' value='lessEqual'> >= </option>" +
        "<option id='greaterEqual' value='greaterEqual'> <= </option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<input type='text' id='triggerValue_" + triggerNewRow + "' class='input_triggerValue'>" +
        "</td>";

    thresholdRowN += "<td>" +
        "<select id='severity_update_" + triggerNewRow + "' class='select_triggerSeverity'>" +
        "<option id='severity_01'> 미분류 </option>" +
        "<option id='severity_02'> 정보 </option>" +
        "<option id='severity_03'> 경고 </option>" +
        "<option id='severity_04'> 가벼운장애 </option>" +
        "<option id='severity_05'> 중증장애 </option>" +
        "<option id='severity_06'> 심각한장애 </option>" +
        "</select>" +
        "</td>&nbsp&nbsp";

    thresholdRowN += "<td>" +
        "<select id='triggerStatus_" + triggerNewRow + "' class='select_triggerActive'>" +
        "<option id='triggerStatus_0' value='0'> 활성 </option>" +
        "<option id='triggerStatus_1' value='1'> 비활성 </option>" +
        "</select>" +
        "</td>";

    /*
    thresholdRowN += "<td><input type='checkbox' id='triggerSMS_" + triggerNewRow + "' class='line' onchange='change_TriggerUpdateType(" + triggerNewRow + ")'></td>";
    thresholdRowN += "<td><input type='checkbox' id='triggerEmail_" + triggerNewRow + "' class='line' onchange='change_TriggerUpdateType(" + triggerNewRow + ")'></td>";
    */

    thresholdRowN += "<td><a onclick='create_TriggerNew()'>추가</a> / <a id='removeTheshold_" + triggerNewRow + "' onclick='remove_CreateTrigger(this)'>삭제</a>" +
        "<input type='text' id='triggerRowType_" + triggerNewRow + "' size='1' class='input_triggerChangeType' readonly style='display: none;'></td>";

    thresholdRowN += "</tr>";

    itemCollection = $("#inCollItem_A").val();

    $("#thesholdTableAdd_tbody").append(thresholdRowN);


    $("#triggerTimeValue_" + triggerNewRow).val("0");
    $("#triggerTimeValue_" + triggerNewRow).attr("disabled", true);
    $("#triggerInequality_" + triggerNewRow).attr("disabled", true);

    $("#triggerTimeValue_" + triggerNewRow).keyup(function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $("#triggerValue_" + triggerNewRow).keyup(function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $("#triggerStatus_" + triggerNewRow).val("0");
    $("#triggerRowType_" + triggerNewRow).val("A");
}

function remove_CreateTrigger(obj) {
    console.log("임계치 삭제 New");
    $(obj).parent().parent().remove();
}

function create_ItemSubmitBtn() {
    console.log(" create_ItemSubmitBtn ");

    var para_hostId = $("#hostIdInfo").val();
    console.log(" create_ItemSubmitBtn para_hostId : " + para_hostId);

    create_ItemSubmit(para_hostId);
    create_TriggerSubmit(para_hostId);

    $("[id^=base]").hide();
    $("#base_serverItem").show();

    list_ItemList(para_hostId);
}

function create_ItemSubmit(para_hostId) {
    console.log(" create_ItemSubmit ");

    var applicationLengthAdd, checkWhetherAdd, checkApplicationAdd, checkApplicationIdAdd = '';
    var applicationListAdd = [];
    var keyTitle_create, keyString_create = '';
    var paraItemName, paraItemKey, paraItemCollection, paraItemType, paraItemValueType, paraItemInterfaceId,
        paraItemApplication, paraItemDelay, paraItemStatus = '';
    var paraProcName_A, paraProcCmd_A, paraPortNum_A, paraShellComm_A, paraLogFile_A, paraLogRege_A,
        paraLogEncod_A = '';
    var create_hostId, create_itemName, create_itemKey, create_itemType, create_itemValueType, create_itemInterfaceId,
        create_itemApplication, create_itemDelay, create_itemStatus = '';

    paraItemName = $("#inItemNam_A").val();
    //paraItemKey = $("#inCollInfo_A").val();

    paraItemCollection = $("#inCollItem_A").val();
    if (paraItemCollection == "프로세스 수") {

        console.log("");
        console.log(" ITEM COLLECTION PROCESS ");
        //proc.num[<name>,<user>,<state>,<cmdline>] -> proc.num[<cmdline>] = proc.num[<name>,,,<cmdline>]
        paraProcName_A = $("#processName_A").val();
        paraProcCmd_A = $("#processCmdLine_A").val();

        console.log(" paraProcName_A : " + paraProcName_A);
        console.log(" paraProcCmd_A : " + paraProcCmd_A);

        keyTitle_create = "proc.num[";
        console.log(" PROCESS keyTitle_create : " + keyTitle_create);
        keyString_create = keyTitle_create + paraProcName_A + ",,," + paraProcCmd_A + "]";
        console.log(" PROCESS keyString_create : " + keyString_create);

        paraItemKey = keyString_create;

    } else if (paraItemCollection == "포트") {

        console.log("");
        console.log(" ITEM COLLECTION PORT ");
        //net.tcp.port[<ip>,port] -> net.tcp.port[port] = net.tcp.port[,port]
        paraPortNum_A = $("#portNumber_A").val();

        console.log(" paraPortNum_A : " + paraPortNum_A);

        keyTitle_create = "net.tcp.port[";
        console.log(" PORT keyTitle_create : " + keyTitle_create);
        keyString_create = keyTitle_create + "," + paraPortNum_A + "]";
        console.log(" PORT keyString_create : " + keyString_create);

        paraItemKey = keyString_create;

    } else if (paraItemCollection == "Shell") {

        console.log("");
        console.log(" ITEM COLLECTION SHELL ");
        //system.run[command,<mode>] -> system.run[command] = system.run[command]
        paraShellComm_A = $("#shellCommand_A").val();

        console.log(" paraShellComm_A : " + paraShellComm_A);

        keyTitle_create = "system.run[";
        console.log(" SHELL keyTitle_create : " + keyTitle_create);
        keyString_create = keyTitle_create + paraShellComm_A + ",]";
        console.log(" SHELL keyString_create : " + keyString_create);

        paraItemKey = keyString_create;

    } else if (paraItemCollection == "로그") {

        console.log("");
        console.log(" ITEM COLLECTION LOG ");
        //log[file,<regexp>,<encoding>,<maxlines>,<mode>,<output>] -> log[file,<regexp>,<encoding>] = log["file",<regexp>,<encoding>,,,]
        paraLogFile_A = $("#logFile_A").val();
        paraLogRege_A = $("#logRegexp_A").val();
        paraLogEncod_A = $("#logEncoding_A").val();

        console.log(" paraLogFile_A : " + paraLogFile_A);
        console.log(" paraLogRege_A : " + paraLogRege_A);
        console.log(" paraLogEncod_A : " + paraLogEncod_A);

        keyTitle_create = "log[";
        console.log(" LOG keyTitle_create : " + keyTitle_create);
        keyString_create = keyTitle_create + "\"" + paraLogFile_A + "\"," + paraLogRege_A + "," + paraLogEncod_A + ",,,]";
        console.log(" LOG keyString_create : " + keyString_create);

        paraItemKey = keyString_create;

    } else {
    }

    paraItemDelay = $("#inItemUpd_A").val();

    paraItemApplication = $("#applicationList_A").val();
    applicationLengthAdd = $("#applicationList_A input").length;
    console.log(" applicationLengthAdd : " + applicationLengthAdd);
    for (var addAppLength = 0; addAppLength < applicationLengthAdd; addAppLength++) {
        console.log(" addAppLength : " + addAppLength);
        checkApplicationAdd = $("#applicationAdd_" + addAppLength);

        checkWhetherAdd = $("#applicationAdd_" + addAppLength).prop('checked');
        console.log(" APPLICATION LENGTH : " + addAppLength + " / APPLICATION CHECK : " + checkWhetherAdd + " / VALUE : " + checkApplicationAdd.val());

        if (checkWhetherAdd == true) {
            console.log(" CHECKED APPLICATION LENGTH : " + addAppLength + " / APPLICATION CHECK : " + checkWhetherAdd + " / VALUE : " + checkApplicationAdd.val());
            checkApplicationIdAdd = $("#applicationAdd_" + addAppLength).attr("name");
            console.log(" CHECK APPLICATION INFO VALUE : " + checkApplicationAdd.val() + " / ID : " + checkApplicationIdAdd);
            applicationListAdd.push(checkApplicationIdAdd);
        }
    }

    paraItemType = "0"; //Zabbix agent

    if (paraItemKey.indexOf("log") != -1) {
        paraItemValueType = "2"; //2-log ,3 - numeric unsigned
    } else {
        paraItemValueType = "3";
    }

    paraItemInterfaceId = "5";

    paraItemStatus = $("#inAct_A").val();

    console.log(" paraHostId : " + para_hostId);
    console.log(" paraItemName : " + paraItemName);
    console.log(" paraItemKey : " + paraItemKey);
    console.log(" paraItemType : " + paraItemType);
    console.log(" paraItemValueType : " + paraItemValueType);
    console.log(" paraItemInterfaceId : " + paraItemInterfaceId);
    console.log(" paraItemApplication : " + JSON.stringify(applicationListAdd));
    console.log(" paraItemDelay : " + paraItemDelay);
    console.log(" paraItemStatus : " + paraItemStatus);

    create_hostId = para_hostId;
    create_itemName = paraItemName;
    create_itemKey = paraItemKey;
    create_itemType = paraItemType;
    create_itemValueType = paraItemValueType;
    create_itemInterfaceId = paraItemInterfaceId;
    create_itemApplication = applicationListAdd;
    create_itemDelay = paraItemDelay;
    create_itemStatus = paraItemStatus;

    if (create_itemName == "") {
        $("#alertPopUp").empty();
        var alertMessage = "<strong class='popup_titleStrong'> 아이템 명을 입력해 주세요. </strong><br><br>";
        $("#alertPopUp").append(alertMessage);

        $("#alertPopUp").lightbox_me({
            centered: true,
            closeSelector: ".close",
            overlayCSS: {background: '#474f79', opacity: .8}
        });
    } else {
        zbxApi.createItemInfo.itemCreate(create_hostId, create_itemName, create_itemKey, create_itemType, create_itemValueType, create_itemInterfaceId, create_itemApplication, create_itemDelay, create_itemStatus).then(function (data) {
            zbxApi.itemInfoUpdate.success(data);
        });
    }
}

function create_TriggerSubmit(para_hostId) {
    var create_triggerLength, triggerCreateString = '';
    var create_triggerName, create_triggerThreshold, create_triggerStatus, create_triggerSeverity = '';
    var paraHostNameCreate, paraItemKeyCreate, paraItemColleKey = '';
    var triggerNameCreate, triggerSeverityCreate, triggerTimeValueCreate, triggerStandardCreate,
        triggerInequalityCreate, triggerValueCreate, triggerStatusCreate = '';
    var paraProcName_AT, paraProcCmd_AT, paraPortNum_AT, paraShellComm_AT, paraLogFile_AT, paraLogRege_AT,
        paraLogEncod_AT = '';
    var triggerStringCreate, triggerTitleCreate = '';

    paraHostNameCreate = $("#hostNameInfo_A").val();

    create_triggerLength = $("#thesholdTableAdd_tbody tr").length;
    console.log(" create_triggerLength : " + create_triggerLength);

    for (var creSubmitRow = 0; creSubmitRow < create_triggerLength; creSubmitRow++) {
        console.log(" creSubmitRow : " + creSubmitRow);

        triggerNameCreate = $("#description_" + creSubmitRow).val();
        triggerTimeValueCreate = $("#triggerTimeValue_" + creSubmitRow).val();
        triggerStandardCreate = $("#triggerStandard_" + creSubmitRow).val();
        triggerInequalityCreate = $("#triggerInequality_" + creSubmitRow).val();
        triggerInequalityCreate = convTriggerInquality(triggerInequalityCreate);
        triggerValueCreate = $("#triggerValue_" + creSubmitRow).val();
        triggerSeverityCreate = $("#severity_update_" + creSubmitRow).val();
        triggerStatusCreate = $("#triggerStatus_" + creSubmitRow).val();

        console.log(" create_TriggerSubmit ");
        console.log(" paraHostNameCreate : " + paraHostNameCreate);
        console.log(" triggerNameCreate : " + triggerNameCreate);
        console.log(" triggerTimeValueCreate : " + triggerTimeValueCreate);
        console.log(" triggerStandardCreate : " + triggerStandardCreate);
        console.log(" triggerInequalityCreate : " + triggerInequalityCreate);
        console.log(" triggerValueCreate : " + triggerValueCreate);
        console.log(" triggerSeverityCreate : " + triggerSeverityCreate);
        console.log(" triggerStatusCreate : " + triggerStatusCreate);
        console.log(" ");

        //paraItemKeyCreate = $("#inCollInfo_A").val();

        paraItemColleKey = $("#inCollItem_A").val();
        if (paraItemColleKey == "프로세스 수") {

            paraProcName_AT = $("#processName_A").val();
            paraProcCmd_AT = $("#processCmdLine_A").val();

            console.log(" paraProcName_AT : " + paraProcName_AT);
            console.log(" paraProcCmd_AT : " + paraProcCmd_AT);

            triggerTitleCreate = "proc.num[";
            console.log(" PROCESS keyTitle_create : " + triggerTitleCreate);
            triggerStringCreate = triggerTitleCreate + paraProcName_AT + ",,," + paraProcCmd_AT + "]";
            console.log(" PROCESS triggerStringCreate : " + triggerStringCreate);

            paraItemKeyCreate = triggerStringCreate;

        } else if (paraItemColleKey == "포트") {

            paraPortNum_AT = $("#portNumber_A").val();

            console.log(" paraPortNum_AT : " + paraPortNum_AT);

            triggerTitleCreate = "net.tcp.port[";
            console.log(" PORT keyTitle_create : " + triggerTitleCreate);
            triggerStringCreate = triggerTitleCreate + "," + paraPortNum_AT + "]";
            console.log(" PORT triggerStringCreate : " + triggerStringCreate);

            paraItemKeyCreate = triggerStringCreate;

        } else if (paraItemColleKey == "Shell") {

            paraShellComm_AT = $("#shellCommand_A").val();

            console.log(" paraShellComm_AT : " + paraShellComm_AT);

            triggerTitleCreate = "system.run[";
            console.log(" SHELL keyTitle_create : " + triggerTitleCreate);
            triggerStringCreate = triggerTitleCreate + paraShellComm_AT + ",]";
            console.log(" SHELL triggerStringCreate : " + triggerStringCreate);

            paraItemKeyCreate = triggerStringCreate;

        } else if (paraItemColleKey == "로그") {

            paraLogFile_AT = $("#logFile_A").val();
            paraLogRege_AT = $("#logRegexp_A").val();
            paraLogEncod_AT = $("#logEncoding_A").val();

            console.log(" paraLogFile_AT : " + paraLogFile_AT);
            console.log(" paraLogRege_AT : " + paraLogRege_AT);
            console.log(" paraLogEncod_AT : " + paraLogEncod_AT);

            triggerTitleCreate = "log[";
            console.log(" LOG keyTitle_create : " + triggerTitleCreate);
            triggerStringCreate = triggerTitleCreate + "\"" + paraLogFile_AT + "\"," + paraLogRege_AT + "," + paraLogEncod_AT + ",,,]";
            console.log(" LOG triggerStringCreate : " + triggerStringCreate);

            paraItemKeyCreate = triggerStringCreate;

        } else {
        }

        triggerCreateString = "{" + paraHostNameCreate + ":" + paraItemKeyCreate + "." + triggerStandardCreate + "(" + triggerTimeValueCreate + ")}" + triggerInequalityCreate + triggerValueCreate;
        console.log(" FINAL triggerString CREATE : " + triggerCreateString);

        create_triggerName = triggerNameCreate;
        create_triggerThreshold = triggerCreateString;
        create_triggerSeverity = convPriorityNum(triggerSeverityCreate);
        create_triggerStatus = triggerStatusCreate;

        console.log(" API CALL TRIGGER INFO < CREATE > ");
        console.log(" create_triggerName : " + create_triggerName);
        console.log(" create_triggerThreshold : " + create_triggerThreshold);
        console.log(" create_triggerSeverity : " + create_triggerSeverity);
        console.log(" create_triggerStatus : " + create_triggerStatus);
        console.log(" ");

        zbxApi.triggerInfoUpdate.triggerCreate(create_triggerName, create_triggerThreshold, create_triggerSeverity, create_triggerStatus).then(function (data) {
            zbxApi.triggerInfoUpdate.success(data);
        });
    }
}

function create_PagebackBtn() {
    console.log(" 취소 버튼 클릭 ");

    var para_hostId = $("#hostIdInfo_U").val();

    $("[id^=base]").hide();
    $("#base_serverItem").show();

    list_ItemList(para_hostId);
}

function change_CollectionBtnA() {
    console.log(" change_CollectionBtnA ");
    var colleTable = '';

    $("#collectionItemAdd").empty();

    colleTable += "<tr><td id='proc.num'>프로세스 수</td></tr>";
    colleTable += "<tr><td id='net.tcp.port'>포트</td></tr>";
    colleTable += "<tr><td id='system.run'>Shell</td></tr>";
    colleTable += "<tr><td id='log'>로그</td></tr>";

    $("#collectionItemAdd").append(colleTable);

    $("#collectionTableAdd tbody tr td").click(function () {
        var collectionName = $(this).text();
        var collectionId = $(this).attr("id");

        $("#inCollItem_A").val(collectionName);

        if (collectionId.indexOf("proc") != -1) {

            $("#processInput1_A").show();
            $("#processInput2_A").show();

            $("#triggerStandard_0").val("last");
            $("#triggerStandard_0").attr("disabled", false);
            $("#triggerInequality__0").val("equal");

            $("#portInput1_A").hide();
            $("#shellInput1_A").hide();
            $("#logInput1_A").hide();
            $("#logInput2_A").hide();
            $("#logInput3_A").hide();

        } else if (collectionId.indexOf("port") != -1) {

            $("#portInput1_A").show();

            $("#triggerStandard_0").val("last");
            $("#triggerStandard_0").attr("disabled", false);
            $("#triggerInequality__0").val("equal");

            $("#processInput1_A").hide();
            $("#processInput2_A").hide();
            $("#shellInput1_A").hide();
            $("#logInput1_A").hide();
            $("#logInput2_A").hide();
            $("#logInput3_A").hide();

        } else if (collectionId.indexOf("system") != -1) {

            $("#shellInput1_A").show();
            $("#triggerStandard_0").val("last");
            $("#triggerStandard_0").attr("disabled", false);
            $("#triggerInequality__0").val("equal");

            $("#processInput1_A").hide();
            $("#processInput2_A").hide();
            $("#portInput1_A").hide();
            $("#logInput1_A").hide();
            $("#logInput2_A").hide();
            $("#logInput3_A").hide();

        } else if (collectionId.indexOf("log") != -1) {

            $("#logInput1_A").show();
            $("#logInput2_A").show();
            $("#logInput3_A").show();

            console.log(" 로그 로그 로그");
            $("#triggerStandard_0").val("last");
            $("#triggerStandard_0").attr("disabled", true);
            $("#triggerInequality__0").val("equal");

            $("#processInput1_A").hide();
            $("#processInput2_A").hide();
            $("#portInput1_A").hide();
            $("#shellInput1_A").hide();

        } else {

        }
        $('#collectionPopUpAdd').trigger('close');

        var paraItemValue = $("#inCollInfo_A").val();
        $("#triggerExpression_0").val(paraItemValue);
    });

    $("#collectionPopUpAdd").lightbox_me({
        centered: true,
        closeSelector: ".close",
        overlayCSS: {background: '#474f79', opacity: .8}
    });
}

function change_TriggerStandardCreate(triggerNewRow) {
    console.log(" change_TriggerStandardCreate : " + triggerNewRow);

    var selectValue = '';

    console.log(" selectRow : " + triggerNewRow);

    selectValue = $("#triggerStandard_" + triggerNewRow).val();
    console.log(" select Value : " + selectValue);

    if (selectValue == "last") {
        $("#triggerTimeValue_" + triggerNewRow).val("0");
        $("#triggerTimeValue_" + triggerNewRow).attr("disabled", true);
        $("#triggerInequality_" + triggerNewRow).attr("disabled", true);
    } else {
        $("#triggerTimeValue_" + triggerNewRow).val("");
        $("#triggerTimeValue_" + triggerNewRow).attr("disabled", false);
        $("#triggerInequality_" + triggerNewRow).attr("disabled", false);
    }
}