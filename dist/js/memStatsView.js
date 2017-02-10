function callApiForMem(hostid, startTime) {

    $.blockUI(blockUI_opt_all);
    $("[id^=base]").hide();
    $("#base_memoryInfo").show();
    var data_MemPused, data_SwapMemPused = null;
    var data_MemBuffers, data_MemCached, data_MemUsed = null;
    var data_topProcess = null;

    zbxApi.getItem.get(hostid, "vm.memory.size[pused]").then(function(data) {
        data_MemPused = zbxApi.getItem.success(data);
        //console.log("dataItem : " + JSON.stringify(dataItem));
    }).then(function() {
        // for suggest
        return zbxApi.getItem.get(hostid, "system.swap.size[,pused]");
    }).then(function(data) {
        data_SwapMemPused = zbxApi.getItem.success(data);
    }).then(function() {
        // for suggest
        return zbxApi.getItem.get(hostid, "vm.memory.size[buffers]");
    }).then(function(data) {
        data_MemBuffers = zbxApi.getItem.success(data);
    }).then(function() {
        // for suggest
        return zbxApi.getItem.get(hostid, "vm.memory.size[cached]");
    }).then(function(data) {
        data_MemCached = zbxApi.getItem.success(data);
    }).then(function() {
        // for suggest
        return zbxApi.getItem.get(hostid, "vm.memory.size[used]");
    }).then(function(data) {
        data_MemUsed = zbxApi.getItem.success(data);
    }).then(function() {
        // for suggest
        return zbxApi.getItem.get(hostid, "system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
    }).then(function(data) {
        data_topProcess = zbxApi.getItem.success(data);
        $.unblockUI(blockUI_opt_all);

        memoryinfoView(data_MemPused, data_SwapMemPused, data_MemBuffers, data_MemCached, data_MemUsed, data_topProcess, startTime);
    });
}

var memoryinfoView = function(data_MemPused, data_SwapMemPused, data_MemBuffers, data_MemCached, data_MemUsed, data_topProcess, startTime) {

    showMemUsage(data_MemPused, data_SwapMemPused, startTime);
    showMemTotal(data_MemBuffers, data_MemCached, data_MemUsed, startTime);
    showMemUsedProcess(data_topProcess);
    $.unblockUI(blockUI_opt_all);

};

function showMemUsage(data_MemPused, data_SwapMemPused, startTime) {

    var memPusedArr = [];
    var swapMemPuesdArr = [];

    var keyName_MemPused = '';
    var keyName_SwapMemPused = '';

    var history_MemPused = null;
    var history_SwapMemPused = null;

    zbxApi.getHistory.get(data_MemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        keyName_MemPused = data_MemPused.result[0].key_;

        memPusedArr= zbxApi.getHistory.success(data);

        // history_MemPused = data;
        // $.each(history_MemPused.result, function(k, v) {
        //     memPusedArr[k] = new Array();
        //     memPusedArr[k][0] = parseInt(v.clock) * 1000;
        //     memPusedArr[k][1] = parseFloat(v.value);
        // });

    }).then(function() {
        return zbxApi.getHistory.get(data_SwapMemPused.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);

    }).then(function(data) {
        keyName_SwapMemPused = data_SwapMemPused.result[0].key_;

        swapMemPuesdArr =  zbxApi.getHistory.success(data);
        // history_SwapMemPused = data;
        // $.each(history_SwapMemPused.result, function(k, v) {
        //     swapMemPuesdArr[k] = new Array();
        //     swapMemPuesdArr[k][0] = parseInt(v.clock) * 1000;
        //     swapMemPuesdArr[k][1] = parseFloat(v.value);
        //
        //     //			loadAvg5Arr[k]=parseFloat(v.value);
        // });

        $(function() {
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
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                            //return this.value / 1000 + 'k';
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
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

function showMemTotal(data_MemBuffers, data_MemCached, data_MemUsed, startTime) {


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
      keyName_MemBuffers = data_MemBuffers.result[0].key_;

      memBufferArr =  zbxApi.getHistory.success(data);
        // history_MemBuffers = zbxApi.getHistory.success(data);
        // $.each(history_MemBuffers.result, function(k, v) {
        //     memBufferArr[k] = new Array();
        //     memBufferArr[k][0] = parseInt(v.clock) * 1000;
        //     memBufferArr[k][1] = parseFloat(v.value);
        // });
    }).then(function() {
        return zbxApi.getHistory.get(data_MemCached.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
        keyName_MemCached = data_MemCached.result[0].key_;

        memCachedArr  = zbxApi.getHistory.success(data);
        // history_MemCached = zbxApi.getHistory.success(data);
        // $.each(history_MemCached.result, function(k, v) {
        //     memCachedArr[k] = new Array();
        //     memCachedArr[k][0] = parseInt(v.clock) * 1000;
        //     memCachedArr[k][1] = parseFloat(v.value);
        // });

    }).then(function() {
        return zbxApi.getHistory.get(data_MemUsed.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);

    }).then(function(data) {
      keyName_MemUsed = data_MemUsed.result[0].key_;
      memUsedArr = zbxApi.getHistory.success(data);
        // history_MemUsed = zbxApi.getHistory.success(data);
        // $.each(history_MemUsed.result, function(k, v) {
        //     memUsedArr[k] = new Array();
        //     memUsedArr[k][0] = parseInt(v.clock) * 1000;
        //     memUsedArr[k][1] = parseFloat(v.value);
        // });

        $(function() {
            Highcharts.setOptions({
                colors: ['#E3C4FF', '#8F8AFF', '#00B700', '#DB9700']
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
                        formatter: function() {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
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

function showMemUsedProcess(data_topProcess) {

    var memValueOrderByDesc = [];
    var orgProcArrOrderByMem = [];
    var finalProcArr = [];
    var topProcRowArr = data_topProcess.result[0].lastvalue.split("\n");
    var topProcessLastClock = parseInt(data_topProcess.result[0].lastclock) * 1000;
    var d2 = new Date(topProcessLastClock);
    var topProcessLastTime = d2.getFullYear() + "-" + (parseInt(d2.getMonth()) + 1) + "-" + d2.getDate() + " " + d2.getHours() + ":" + d2.getMinutes();
    var memProcessTbl = '';
    var maxRefValue;
    var processGaugeValue;
    var MAX_PROCCOUNT = 13;

    //모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
    $.each(topProcRowArr, function(k, v) {
        while (topProcRowArr[k].indexOf("  ") != -1) {
            topProcRowArr[k] = topProcRowArr[k].replace('  ', ' ');
        }
        var topProcColArr = topProcRowArr[k].split(" ");
        memValueOrderByDesc[k] = parseFloat(topProcColArr[6]);
        orgProcArrOrderByMem[k] = parseFloat(topProcColArr[6]);
    });

    memValueOrderByDesc.splice(0, 1);
    memValueOrderByDesc.sort(function(a, b) {
        return b - a;
    });

    for (var i = 0; i < memValueOrderByDesc.length; i++) {
        for (var j = 0; j < orgProcArrOrderByMem.length; ++j) {
            if (memValueOrderByDesc[i] == orgProcArrOrderByMem[j]) {
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

    $.each(finalProcArr, function(k, v) {
        if (k > 0 && k < MAX_PROCCOUNT) {
            var temp = finalProcArr[k].split(" ");
            var procName = '';
            var processPercentValue = parseFloat(temp[6]);
            if (k == 1) {
                maxRefValue = processPercentValue;
                processGaugeValue = 100;
            } else {
                processGaugeValue = (processPercentValue * 100) / maxRefValue;
            }
            for (var i = 9; i <= temp.length; ++i) {
                if (temp[i] != null) {
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
