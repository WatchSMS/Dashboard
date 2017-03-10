function callApiForTraffic(hostid, startTime){
    /*$("[id^=base]").hide();
    $("#base_networkInfo").show();*/

    var data_topDisk = '';
    zbxApi.getNetworkItem.get(hostid, "net.if.total").then(function(data) {
        data_topDisk = zbxApi.getNetworkItem.success(data);
        networkInfoView(hostid, startTime, data_topDisk);
    })
}

function networkInfoView(hostid, startTime, data_topDisk){
    console.log("IN networkInfoView");

    var networkTableHTML = '';
    var MAX_NETWORKCOUNT = 10;
    var tableDataObj = {};
    var tableDataArr = [];
    var networkItemId = '';
    var networkItemName = '';
    var networkItemUsed = 0;
    var networkItemSize = 0;

    var currentNetworkName = null;

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

        tableDataObj = {};
        tableDataObj.networkItemId = networkItemId;
        tableDataObj.networkItemName = networkItemName;
        tableDataObj.networkItemUsed = networkItemUsed;
        tableDataObj.networkItemSize = networkItemSize;
        tableDataArr.push(tableDataObj);

        if(k < MAX_NETWORKCOUNT){
            networkTableHTML += "<tr id='" + networkItemName + "' role='row' class='h51 odd'>";
            networkTableHTML += "<td width='90' class='line'><img src='dist/img/card_icon01.png'/></td>";
            networkTableHTML += "<td width='auto' class='align_left p113'>";
            networkTableHTML += "<div class='mt2 f11'>" + networkItemName + "</div>";
            networkTableHTML += "<div class='mt2 f11'> TX : " + networkItemUsed + " b/s / RX : " + networkItemSize + " b/z</div>";
            networkTableHTML += "</tr>";
        }
    });

    networkTableHTML += "</tbody>";

    $("#networkInfoTable").empty();
    $("#networkInfoTable").append(networkTableHTML);
    $("#chart_trafficIo").empty();
    $("#chart_trafficTotal").empty();
    var $table = $("#networkInfoTable");
    $("#networkInfoTable > tbody > tr").eq(0).addClass("selectedNetwork");
    $("#networkInfoTable > tbody > tr").eq(0).css("background", "#62A6EF");

    currentNetworkName = $(".selectedNetwork").attr('id');

    generateNetworkResource(hostid, currentNetworkName, startTime);

    rowClickNetworkEvent($table, hostid, startTime);

    $("#btn_network.btn").off().on('click', function () {
        var startTime_select = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        var currentDiskName = $(".selectedNetwork").attr('id');
        generateNetworkResource(hostid, currentDiskName, startTime_select);
    });

    $("#btn_network.btn_etc").off().on('click', function(){
        console.log(" 기타 시간 버튼 클릭 ");
        $('#selectNetworkTimeInput').val("");
        $('#network_InputTimecontent').lightbox_me({
            centered: true,
            closeSelector: ".close",
            onLoad: function() {
                $('#network_InputTimecontent').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
            },
            overlayCSS:{background: 'white', opacity: .8}
        });
    });
}

function generateNetworkResource(hostid, currentNetworkName, startTime){
    var networkIn = '';
    var networkOut = '';
    var networkTotal = '';

    var networkItemKeyIn = "net.if.in[" + currentNetworkName + "]";
    var networkItemKeyOut = "net.if.out[" + currentNetworkName + "]";
    var networkItemKeyTotal = "net.if.total[" + currentNetworkName + "]";

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
        showTraffic(networkIn, networkOut, networkTotal, startTime);
    });
}

function clickInputTimeNetwork(){
    console.log(" IN clickInputTimeNetwork ");
    var inputTime = $('#network_InputTimecontent').find('input:first').val();
    var currentNetworkName = $(".selectedNetwork").attr('id');
    var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(inputTime)) / 1000);
    console.log(" 시간 입력 확인 버튼 클릭 ");
    generateNetworkResource(currentHostId, currentNetworkName, startTime);
}

function rowClickNetworkEvent(table, hostid, startTime){
    $('tr', table).each(function(row) {
        $(this).click(function() {
            var currentNetworkItemId = $(this).attr('id');
            $(".selectedNetwork").removeClass("selectedNetwork");
            $(this).addClass("selectedNetwork");
            $(this).children().css("background", "#62A6EF");
            $(this).prevAll().children().removeAttr('style');
            $(this).nextAll().children().removeAttr('style');

            generateNetworkResource(hostid, currentNetworkItemId, startTime);
        });
    });
}

function showTraffic(networkIn, networkOut, networkTotal, startTime){
    showTrafficIo(networkIn, networkOut, startTime);
    showTrafficTotal(networkTotal, startTime);
}

function showTrafficIo(networkIn, networkOut, startTime){
    var networkInArr = [];
    var networkOutArr = [];

    zbxApi.getHistory.get(networkIn.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        networkInArr = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(networkOut.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT);
    }).then(function(data) {
        networkOutArr = zbxApi.getHistory.success(data);

        $(function() {
            Highcharts.chart('chart_trafficIo', {
                chart: {
                    backgroundColor: '#424973',
                    zoomType: 'x',
                    spacingTop: 2,
                    spacingBottom: 0
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
                    tickInterval : 300000,
                    gridLineWidth: 1,
                    showFirstLabel: true,
                    showLastLabel: true,
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
                    title: { text: '' },
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
                    name: 'Traffic In',
                    data: networkInArr,
                    color: '#FC4747'
                }, {
                    name: 'Traffic Out',
                    data: networkOutArr,
                    color: '#F2F234'
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

function showTrafficTotal(networkTotal, startTime){
    var networkTotalArr = [];

    zbxApi.getHistory.get(networkTotal.result[0].itemid, startTime, HISTORY_TYPE.UNSIGNEDINT).then(function(data) {
        networkTotalArr = zbxApi.getHistory.success(data);

        $(function () {
            Highcharts.chart('chart_trafficTotal', {
                chart: {
                    backgroundColor: '#424973',
                    zoomType: 'x',
                    spacingTop: 2,
                    spacingBottom: 0
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
                    tickInterval: 300000,
                    gridLineWidth: 1,
                    showFirstLabel: true,
                    showLastLabel: true,
                    labels: {
                        style: {
                            color: '#E0E0E3'
                        },
                        formatter: function () {
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
                    title: {text: ''},
                    labels: {
                        style: {
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
                    name: 'Traffic Total',
                    data: networkTotalArr,
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
                                fill: '#626992'
                            }
                        }
                    }
                }
            });
        });
    })
}