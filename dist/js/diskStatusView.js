function callApiForDisk(hostid, startTime){
    $("[id^=base]").hide();
    $("#base_diskInfo").show();

    var data_topDisk = '';
    zbxApi.getDiskItem.get(hostid).done(function(data, status, jqXHR) {
        data_topDisk = zbxApi.getDiskItem.success(data);
        diskInfoList(hostid, data_topDisk, startTime);
    })
}

function diskInfoList(hostid, data_topDisk, startTime) {
    console.log("IN diskInfoList");

    var diskTableHTML = '';
    var MAX_DISKCOUNT = 10;
    var tableDataObj = {};
    var tableDataArr = [];

    var diskItemId = '';
    var diskItemName = '';
    var diskItemUsed = 0;
    var diskItemSize = 0;

    diskTableHTML += "<tbody>";

    $.each(data_topDisk.result, function(k, v) {
        diskItemId = v.itemId;
        var name = v.key_;
        diskItemName = name.substring(name.indexOf("[") + 1, name.indexOf(","));
        var diskValue;
        try{
            diskValue = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+diskItemName+",pfree]").lastvalue;
        } catch (e) {
            console.log(e);
        }
        diskItemUsed = 100-diskValue;
        if(diskItemUsed == 100)
            diskItemUsed = 0;
        diskItemUsed = Math.floor(diskItemUsed * 100) / 100;

        try {
            diskItemSize = zbxSyncApi.getDiskItem(hostid, "vfs.fs.size["+diskItemName+",used]").lastvalue;
            diskItemSize = Math.round(diskItemSize / 1024 / 1024 / 1024);
        }
        catch(e){
            console.log(e);
        }

        tableDataObj = {};
        tableDataObj.diskItemId = diskItemId;
        tableDataObj.diskItemName = diskItemName;
        tableDataObj.diskItemUsed = diskItemUsed;
        tableDataObj.diskItemSize = diskItemSize;
        tableDataArr.push(tableDataObj);

        if (k < MAX_DISKCOUNT) {
            diskTableHTML += "<tr id='" + diskItemName + "' role='row' class='h51 odd'>";
            diskTableHTML += "<td width='90' class='line'><img src='dist/img/disk_icon01.png'/></td>";
            diskTableHTML += "<td width='auto'>";
            diskTableHTML += "<div class='f1 mt2 f11'>" + diskItemName + " : " + diskItemUsed + "% </div>";
            diskTableHTML += "<div class='scw br3'><div class='mt2 bg8 br3' style='height:5px; width: " + diskItemUsed + "%;'></div></div>";
            diskTableHTML += "<div class='fr mt2 mr5 f11'>"+ diskItemSize +"GB </div>";
            diskTableHTML += "</td>";
            diskTableHTML += "</tr>";
        }
    });

    diskTableHTML += "</tbody>";

    $("#diskInfoTable").empty();
    $("#diskInfoTable").append(diskTableHTML);
    var $table = $("#diskInfoTable");

    //table의 row 클릭시 해당 그래프 만드는 이벤트
    $("#btn_disk.btn").click(function() {
        var startTime = Math.round((new Date().getTime() - LONGTIME_ONEHOUR * parseInt(this.value)) / 1000);
        rowClickDiskEvent($table, hostid, startTime);
    });

    rowClickDiskEvent($table, hostid, startTime);
}

function rowClickDiskEvent(table, hostid, startTime) {
    $('tr', table).each(function(row) {
        $(this).click(function() {
            var currentDiskItemId = $(this).attr('id');
            $(".selectedDisk").removeClass("selectedDisk");
            $(this).addClass("selectedDisk");
            $(this).children().css("background", "#62A6EF");
            $(this).prevAll().children().removeAttr('style');
            $(this).nextAll().children().removeAttr('style');

            var diskInode = '';
            var diskFree = '';
            var diskUse = '';

            var diskItemKeyInode = "vfs.fs.inode[" + currentDiskItemId + ",pfree]";
            var diskItemKeyFree = "vfs.fs.size[" + currentDiskItemId + ",pfree]";
            var diskItemKeyUse = "vfs.fs.size[" + currentDiskItemId + ",pused]";

            zbxApi.serverViewGraph.get(hostid, diskItemKeyInode).then(function(data) {
                diskInode = zbxApi.serverViewGraph.success(data);
            }).then(function() {
                return zbxApi.serverViewGraph.get(hostid, diskItemKeyFree);
            }).then(function(data) {
                diskFree = zbxApi.serverViewGraph.success(data);
            }).then(function() {
                return zbxApi.serverViewGraph.get(hostid, diskItemKeyUse);
            }).then(function(data) {
                diskUse = zbxApi.serverViewGraph.success(data);
                showDisk(diskInode, diskFree, diskUse,  startTime);
            });
        });
    });
}

function showDisk(diskInode, diskFree, diskUse,  startTime){
    showDiskIo(diskInode, diskFree, startTime);
    showDiskUse(diskUse, startTime);
}

function showDiskIo(diskInode, diskFree, startTime){
    var diskInodeArr = [];
    var diskFreeArr = [];

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, 0).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, 0);
    }).then(function(data) {
        diskFreeArr= zbxApi.getHistory.success(data);

        $(function() {
            Highcharts.chart('chart_diskIo', {
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
                            return Math.floor(this.value * 100)/100 +'%';
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    style: {
                        color: '#F0F0F0'
                    },
                    shared: true,
                    formatter: function(){
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();

                        if (hours.length == 1) { hours = "0" + hours; }
                        if (minutes.length == 1) { minutes = "0" + minutes; }
                        if (seconds.length == 1) { seconds = "0" + seconds; }

                        var points = this.points;
                        var pointsLength = points.length;
                        var index;
                        var markUp = pointsLength ? '<span style="font-size: 10px">' + hours + ':' + minutes + ':' + seconds + '</span><br/>' : '';

                        for(index=0; index<pointsLength; index++){
                            markUp += '<br/><b>' + points[index].series.name + ' : </b>' + Math.floor(points[index].y * 100)/100 + '%';
                        }
                        return markUp;
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
                    name: 'Disk Inode',
                    data: diskInodeArr,
                    color: '#FC4747'
                }, {
                    name: 'Disk Free',
                    data: diskFreeArr,
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

function showDiskUse(diskUse, startTime){
    var diskUseArr = [];

    zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, 0).then(function(data) {
        diskUseArr  = zbxApi.getHistory.success(data);

        $(function() {
            Highcharts.chart('chart_diskUse', {
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
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    style: {
                        color: '#F0F0F0'
                    },
                    shared: true,
                    formatter: function(){
                        var d2 = new Date(this.x);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        var seconds = "" + d2.getSeconds();

                        if (hours.length == 1) { hours = "0" + hours; }
                        if (minutes.length == 1) { minutes = "0" + minutes; }
                        if (seconds.length == 1) { seconds = "0" + seconds; }

                        var points = this.points;
                        var pointsLength = points.length;
                        var index;
                        var markUp = pointsLength ? '<span style="font-size: 10px">' + hours + ':' + minutes + ':' + seconds + '</span><br/>' : '';

                        for(index=0; index<pointsLength; index++){
                            markUp += '<br/><b>' + points[index].series.name + ' : </b>' + Math.floor(points[index].y * 100)/100 + '%';
                        }
                        return markUp;
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
                    name: 'Disk Use',
                    data: diskUseArr,
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