function callApiForTraffic(hostid, startTime){
    $("[id^=base]").hide();
    $("#base_networkInfo").show();

    var data_topDisk = '';

    zbxApi.getNetworkItem.get(hostid, "net.if.total").then(function(data) {
        data_topDisk = zbxApi.getNetworkItem.success(data);
        console.log("dataItem : " + JSON.stringify(data_topDisk));
        networkInfoView(hostid, startTime, data_topDisk);
    })
}

function networkInfoView(hostid, startTime, data_topDisk){
    console.log("networkInfoView");
    var networkTableHTML = '';
    var MAX_NETWORKCOUNT = 10;
    var tableDataObj = new Object();
    var tableDataArr = [];

    var networkItemId = '';
    var networkItemName = '';
    var networkItemUsed = 0;
    var networkItemSize = 0;

    networkTableHTML += "<thead>";
    networkTableHTML += "<tr role='row'>";
    networkTableHTML += "<th class='percent-text sorting' aria-sort='descending'>NETWORK</th>";
    networkTableHTML += "<th width='15%' class='text-right'>USED<span class='smaller'>(%)</span></th>";
    networkTableHTML += "<th width='15%' class='text-right'>SIZE<span class='smaller'>(MB)</span></th>";
    networkTableHTML += "</tr>";
    networkTableHTML += "</thead>";

    networkTableHTML += "<tbody>";

    $.each(data_topDisk.result, function(k, v){
        networkItemId = v.itemId;
        var key = v.key_;
        networkItemName = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
        try{
            networkItemUsed = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+networkItemName+",pfree]").lastvalue;
            networkItemUsed = Math.floor(networkItemUsed * 100) / 100;
        } catch(e){
            console.log(e);
        }
        try {
            networkItemSize = zbxSyncApi.getDiskItem(hostid, "net.if.total["+networkItemName+",bytes]").lastvalue;
        }
        catch(e){
            console.log(e);
        }

        tableDataObj = new Object();
        tableDataObj.networkItemId = networkItemId;
        tableDataObj.networkItemName = networkItemName;
        tableDataObj.networkItemUsed = networkItemUsed;
        tableDataObj.networkItemSize = networkItemSize;
        tableDataArr.push(tableDataObj);

        if(k < MAX_NETWORKCOUNT){
            networkTableHTML += "<tr id='" + networkItemName + "' role='row' class='odd'>";
            networkTableHTML += "<td class='text-left'><span class='ellipsis' title='" + networkItemName + "'>" + networkItemName + "</span></td>";
            networkTableHTML += "<td class='text-right'>" + networkItemUsed + "<span class='smaller'>%</span></td>";
            networkTableHTML += "<td class='text-right'>" + networkItemSize + "<span class='smaller'>MB</span></td>";
            networkTableHTML += "</tr>";
        }
    });

    networkTableHTML += "</tbody>";

    $("#networkInfoTable").empty();
    $("#networkInfoTable").append(networkTableHTML);
    var $table = $("#networkInfoTable");

    //table의 row 클릭시 해당 그래프 만드는 이벤트
    $("#btn_network.btn").click(function() {
        var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        rowClickNetworkEvent($table, hostid, startTime);
    })

    rowClickNetworkEvent($table, hostid, startTime);

    //테이블의 th col 클릭시 정렬
    $('th', $table).each(function(column) {
        $(this).click(function() {
            var sortTable = '';
            var currentThObj = $(this);
            var MAX_COUNT = tableDataArr.length;

            if($(this).is('.sorting_desc')) {
                console.log(" >>>>> sorting_desc <<<<<");
                tableDataArr.sort(function(a, b) {
                    if (column == 0) {
                        return a.networkItemName < b.networkItemName ? -1 : a.networkItemName > b.networkItemName ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            } else {
                tableDataArr.sort(function(a, b){
                    console.log(" >>>>> sorting_asc <<<<<");
                    if (column == 0) {
                        return a.networkItemName > b.networkItemName ? -1 : a.networkItemName < b.networkItemName ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
            }
            $('tbody', $table).empty();

            for (var i = 0; i < MAX_COUNT; i++) {
                sortTable += "<tr id='" + tableDataArr[i].networkItemName + "' role='row' class='odd'>";
                sortTable += "<td class='text-left'><span class='ellipsis' title='" + tableDataArr[i].networkItemName + "'>" + tableDataArr[i].networkItemName + "</span></td>";
                sortTable += "<td class='text-right'>" + tableDataArr[i].networkItemUsed + "<span class='smaller'>%</span></td>";
                sortTable += "<td class='text-right'>" + tableDataArr[i].networkItemSize + "<span class='smaller'>MB</span></td>";
                sortTable += "</tr>";
            }
            $('tbody', $table).append(sortTable);
        })
    });

    //page reloag
    $("#reload_networkInfo").click(function() {
        console.log(">>>>> reload_networkInfo <<<<<");
        $("#traffic_" + hostid).click();
    });

    $(function($) {
        $('#reload_networkInfo_selecter').change(function() {
            var selectVal = $(this).val();
            if (selectVal != 0) {
                $("#reload_networkInfo").attr({
                    "disabled": "disabled"
                });
            } else {
                $("#reload_networkInfo").removeAttr("disabled");
            }
        });
    });

    //자동 새로고침
    //setInterval('$("#reload_networkInfo").click()', PAGE_RELOAD_TIME);
}

var rowClickNetworkEvent = function(table, hostid, startTime) {
    $('tr', table).each(function(row) {
        if (row > 0) {
            $(this).click(function() {
                var currentNetworkItemId = $(this).attr('id');
                console.log("currentNetworkItemId : " + currentNetworkItemId);

                var networkIn = '';
                var networkOut = '';
                var networkTotal = '';

                var networkItemKeyIn = "net.if.in[" + currentNetworkItemId + "]";
                var networkItemKeyOut = "net.if.out[" + currentNetworkItemId + "]";
                var networkItemKeyTotal = "net.if.total[" + currentNetworkItemId + "]";

                console.log(">>>>> hostid <<<<< : " + hostid);
                console.log("networkItemKeyIn : " + networkItemKeyIn);
                console.log("networkItemKeyOut : " + networkItemKeyOut);
                console.log("networkItemKeyTotal : " + networkItemKeyTotal);

                zbxApi.serverViewGraph.get(hostid, networkItemKeyIn).then(function(data) {
                    networkIn = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, networkItemKeyOut);
                }).then(function(data) {
                    networkOut = zbxApi.serverViewGraph.success(data);
                }).then(function() {
                    return zbxApi.serverViewGraph.get(hostid, networkItemKeyTotal);
                }).then(function(data) {
                    networkTotal = zbxApi.serverViewGraph.success(data);
                    trafficView(networkIn, networkOut, networkTotal, startTime);
                });
            });
        }
    });
};

var trafficView = function(networkIn, networkOut, networkTotal, startTime) {
    showInOutNetwork(networkIn, networkOut, startTime);
    showTotalNetwork(networkTotal, startTime);
};

function showInOutNetwork(networkIn, networkOut, startTime) {
    var networkInArr = [];
    var networkOutArr = [];

    zbxApi.getHistory.get(networkIn.result[0].itemid, startTime, 3).then(function(data) {
        networkInArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(networkOut.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        networkOutArr = zbxApi.getHistory.success(data);

        $(function() {
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
                            return this.value / 1000 + 'k';
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

function showTotalNetwork(networkTotal, startTime) {
    var networkTotalArr = [];

    zbxApi.getHistory.get(networkTotal.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        networkTotalArr  = zbxApi.getHistory.success(data);

        $(function() {
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
                            return this.value / 1000 + 'k';
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