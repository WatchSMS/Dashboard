function showsServerCpu(serverCpuSystem, serverCpuUser, serverCpuIoWait, serverCpuSteal, startTime) {
    var serverCpuSystemArr = [];
    var serverCpuUserArr = [];
    var serverCpuIoWaitArr = [];
    var serverCpuStealArr = [];

    var history_cpuUser = null;

    zbxApi.getHistory.get(serverCpuSystem.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverCpuSystemArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuUser.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        history_cpuUser = zbxApi.getHistory.success(data);
        $.each(history_cpuUser.result, function(k, v) {
            serverCpuUserArr[k] = [];
            serverCpuUserArr[k][0] = parseInt(v.clock) * 1000;
            serverCpuUserArr[k][1] = parseFloat(v.value);
        });
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuIoWait.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        serverCpuIoWaitArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverCpuSteal.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        serverCpuStealArr = zbxApi.getHistory.success(data);

        var chartId = "cpuUse";
        var title = 'CPU 사용량';
        var series = [{
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
        }];
        var enable = false;
        chartCall(chartId, title, series, Label.percent, enable);
    });

    /*exporting: {
     buttons: {
     contextButton: {
     enabled: false
     },
     exportButton: {
     text: 'Download',
     // Use only the download related menu items from the default context button
     menuItems: Highcharts.getOptions().exporting.buttons.contextButton.menuItems.splice(2)
     },
     printButton: {
     text: 'Print',
     onclick: function () {
     this.print();
     }
     }
     }
     }*/
    /*$("#exporting").click(function () {
     console.log("Click exporting Button");
     Highcharts.getOptions().exporting.buttons.contextButton.menuItems
     })*/
}

function showServerMemory(serverMemoryUse, startTime) {
    var serverMemoryUseArr = [];

    zbxApi.getHistory.get(serverMemoryUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverMemoryUseArr = zbxApi.getHistory.success(data);

        var chartId = "memoryAll";
        var title = '전체메모리';
        var series = [{
            name: 'Memory Use',
            data: serverMemoryUseArr
        }];
        var enable = false;
        chartCall(chartId, title, series, Label.percent, enable);
    })
}

function showServerTraffic(serverTraInEth0, serverTraOutEth0, serverTraTotalEth0, startTime) {
    var serverTraInEth0Arr = [];
    var serverTraOutEth0Arr = [];
    var serverTraTotEth0Arr = [];

    zbxApi.getHistory.get(serverTraInEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        serverTraInEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraOutEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        serverTraOutEth0Arr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(serverTraTotalEth0.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        serverTraTotEth0Arr = zbxApi.getHistory.success(data);

        $(function() {
            Highcharts.chart('trafficUse', {
                chart: {
                    backgroundColor: '#424973',
                    zoomType: 'x',
                    height: 200,
                    spacingTop: 10,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: {
                    text: '',
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    gridLineColor: '#707073',
                    lineColor: '#707073',
                    minorGridLineColor: '#505053',
                    tickColor: '#707073',
                    labels: {
                        style:{
                            color: '#E0E0E3'
                        },
                        formatter: function() {
                            var d2 = new Date(this.value);
                            var hours = "" + d2.getHours();
                            var minutes = "" + d2.getMinutes();
                            var seconds = "" + d2.getSeconds();
                            if (hours.length == 1) {
                                hours = "0" + hours;
                            }
                            if (minutes.length == 1) {
                                minutes = "0" + minutes;
                            }
                            if (seconds.length == 1) {
                                seconds = "0" + seconds;
                            }
                            return hours + ":" + minutes + ":" + seconds;
                        }
                    }
                },
                yAxis: {
                    gridLineColor: '#707073',
                    lineColor: '#707073',
                    minorGridLineColor: '#505053',
                    tickColor: '#707073',
                    labels: {
                        style:{
                            color: '#E0E0E3'
                        },
                        formatter: function() {
                            return Math.floor(this.value / 1000) +'Kbps';
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    style: {
                        color: '#F0F0F0'
                    },
                    shared: true,
                    formatter: function () {
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();
                        if (hours.length == 1) {
                            hours = "0" + hours;
                        }
                        if (minutes.length == 1) {
                            minutes = "0" + minutes;
                        }
                        if (seconds.length == 1) {
                            seconds = "0" + seconds;
                        }

                        var s = [];
                        $.each(this.points, function (i, point) {
                            s += '<br/>' + '<b>' + point.series.name + '</b>' + '<br/>' + hours + ':' + minutes + ':' + seconds + '  ' + (point.y / 1000) + 'kbps';
                        });
                        return s;
                    }
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        marker: {
                            enabled: false //false
                        }
                    }
                },
                series: [{
                    name: 'Traffic In Eth0',
                    data: serverTraInEth0Arr,
                    color: '#FC4747'
                }, {
                    name: 'Traffic Out Eth0',
                    data: serverTraOutEth0Arr,
                    color: '#F2F234'
                }, {
                    name: 'Traffic Total Eth0',
                    data: serverTraTotEth0Arr,
                    color: '#FA60CE'
                }],
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false,
                            symbolStroke: 'transparent',
                            theme: {
                                fill:'#626992'
                            }
                        }
                    }
                }
            });
        });
    })
}

function serverOverViewInfo(serverTitle, serverIP, serverOS, serverName, serverAgentVersion) {
    $("#serverInfo").empty();

    var serverInfoTbl = '';
    serverInfoTbl += "<tr><td class='line-td' width='170'>운영체제</td><td class='line-td br7_rt'>" + serverOS + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>서버명</td><td class='line-td br7_rt'>" + serverTitle + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>IP주소</td><td class='line-td br7_rt'>" + serverIP + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>호스트명</td><td class='line-td br7_rt'>" + serverName + "</td></tr>";
    serverInfoTbl += "<tr><td class='line-td' width='170'>에이전트</td><td class='line-td br7_rt'>" + serverAgentVersion + "</td></tr>";
    $("#serverInfo").append(serverInfoTbl);
}

function processView(hostid, startTime) {
    var lastProcessData = callApiForProcessTable(hostid);
    var processTbl = '';
    var MAX_PROCCOUNT = 7;
    var tableDataObj = {};
    var tableDataArr = [];

    var topProcessLastClock = parseInt(lastProcessData.lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + d2.getMonth() + 1 + "-" + d2.getDate() + " " + d2.getHours() + ":" + d2.getMinutes();
    var sortProcessForTable = sortProcess(lastProcessData, "CPU");

    processTbl += "<tbody>";

    $.each(sortProcessForTable, function(k, v) {
        tableDataObj = {};

        tableDataObj.procName = v.procName;
        tableDataObj.cpuValue = parseFloat(v.totalCpuVal.toFixed(1));
        tableDataObj.memValue = parseFloat(v.totalMemVal.toFixed(1));
        tableDataObj.procCnt = parseInt(v.procCnt);
        tableDataArr.push(tableDataObj);
        if (k < MAX_PROCCOUNT) {
            var procCpuValue = v.totalCpuVal.toFixed(1);
            var procMemValue = v.totalMemVal.toFixed(1);

            processTbl += "<tr id='" + v.procName + "' role='row' class='odd h34'>";
            processTbl += "<td width='170' class='align_left line p115' title='" + v.procName + "'>" + v.procName + "</td>";
            processTbl += "<td width='90' class='line'>" + v.procCnt + "</td>";
            processTbl += "<td width='120' class='line'>" + procCpuValue + "</td>";
            processTbl += "<td width='auton'>" + procMemValue + "<span class='smaller'>MB</span></td>";
            processTbl += "</tr>";
        }
    });

    processTbl += "</tbody>";

    $("#processTime").text(topProcessLastTime);
    $("#serverProcessList").empty();
    $("#serverProcessList").append(processTbl);

    //화면 이동
    $("#processDetail_").click(function () {
        console.log("IN function processDetail_");
        console.log(hostid + " / " + startTime);
        $("#process_" + hostid).click();
    });
}

function showServerDisk(serverDiskUseRoot, startTime) {
    var serverDiskUseRootArr = [];

    zbxApi.getHistory.get(serverDiskUseRoot.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        serverDiskUseRootArr = zbxApi.getHistory.success(data);

        var chartId = "diskUse";
        var title = '디스크 사용량';
        var series = [{
            name: 'Disk Use : /',
            data: serverDiskUseRootArr
        }];
        var enable = false;
        chartCall(chartId, title, series, Label.percent, enable);
    })
}

function EventListView(hostid) { //서버정보요약 - 이벤트목록
    var data_EventList = callApiForServerEvent(hostid);
    var eventTbl = '';

    eventTbl += "<tbody>";

    $.each(data_EventList, function(k, v) {
        var severity = convPriority(v.priority);
        var status = convStatus(v.value);
        var lastchange = convTime(v.lastchange);
        var age = convDeltaTime(v.lastchange);
        var ack = convAck(v.lastEvent.acknowledged);
        var host = v.hosts[0].host;
        var description = v.description;

        eventTbl += "<tr role='row'>";
        if(severity == "information") {
            eventTbl += "<td width='110' class='line' style='color:deepskyblue'>" + severity + "</td>";
        } else if(severity == "warning") {
            eventTbl += "<td width='110' class='line' style='color:yellow'>" + severity + "</td>";
        } else if(severity == "average") {
            eventTbl += "<td width='110' class='line' style='color:greenyellow'>" + severity + "</td>";
        } else if(severity == "high") {
            eventTbl += "<td width='110' class='line' style='color:red'>" + severity + "</td>";
        }

        if(status == "problem"){
            eventTbl += "<td width='120' class='line' style='color:red'>" + status + "</td>";
        } else if(status == "OK"){
            eventTbl += "<td width='120' class='line' style='color:deepskyblue'>" + status + "</td>";
        }
        eventTbl += "<td width='180' class='line'>" + lastchange + "</td>";
        eventTbl += "<td width='120' class='line'>" + age + "</td>";
        if(ack == "Unacked"){
            eventTbl += "<td width='120' class='line' style='color:red'>" + ack + "</td>";
        } else if(ack = "Acked"){
            eventTbl += "<td width='120' class='line' style='color:deepskyblue'>" + ack + "</td>";
        }
        eventTbl += "<td width='140' class='line'>" + host + "</td>";
        eventTbl += "<td width='auto' class='align_left ponter'>" +
            "<a style='width:100%; height:18px; display:inline-block;' title='" + description + "'>" +
            "<span class='smd'>" + description + "</span></a></td>";
        eventTbl += "</tr>";
    });
    eventTbl += "</tbody>";
    $("#serverEventList").empty();
    $("#serverEventList").append(eventTbl);
}
