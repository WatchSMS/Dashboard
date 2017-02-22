function callApiForDisk(hostid, startTime){
    $("[id^=base]").hide();
    $("#base_diskInfo").show();

    var data_topDisk = '';
    zbxApi.getDiskItem.get(hostid).done(function(data, status, jqXHR) {
        data_topDisk = zbxApi.getDiskItem.success(data);
        diskInfoView(hostid, data_topDisk, startTime);
    })
}

function diskInfoView(hostid, data_topDisk, startTime){
    console.log(" =========== diskInfoView =========== ");
    var diskTableHTML = '';
    var MAX_DISKCOUNT = 10;
    var tableDataObj = new Object();
    var tableDataArr = [];

    var diskItemId = '';
    var diskItemName = '';
    var diskItemUsed = 0;
    var diskItemSize = 0;

    diskTableHTML += "<thead>";
    diskTableHTML += "<tr role='row'>";
    diskTableHTML += "<th class='percent-text sorting' aria-sort='descending'>DISK</th>";
    diskTableHTML += "<th width='15%' class='text-left'>USED<span class='smaller'>(%)</span></th>";
    diskTableHTML += "<th width='15%' class='text-left'>SIZE<span class='smaller'>(GB)</span></th>";
    diskTableHTML += "</tr>";
    diskTableHTML += "</thead>";

    diskTableHTML += "<tbody>";

    $.each(data_topDisk.result, function(k, v) {
        /*var test = zbxSyncApi.getDiskDuRule(hostid, "Mounted filesystem device discovery");
         console.log(" <<<<< getDiskDuRule test >>>>> ");
         console.log(test);*/
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

        tableDataObj = new Object();
        tableDataObj.diskItemId = diskItemId;
        tableDataObj.diskItemName = diskItemName;
        tableDataObj.diskItemUsed = diskItemUsed;
        tableDataObj.diskItemSize = diskItemSize;
        tableDataArr.push(tableDataObj);

        if (k < MAX_DISKCOUNT) {
            diskTableHTML += "<tr id='" + diskItemName + "' role='row' class='odd'>";
            diskTableHTML += "<td class='text-left'><span class='ellipsis' title='" + diskItemName + "'>" + diskItemName + "</span></td>";
            diskTableHTML += "<td class='text-right'>" + diskItemUsed + "<span class='smaller'>%</span></td>";
            diskTableHTML += "<td class='text-right'>" + diskItemSize + "<span class='smaller'>GB</span></td>";
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
    })

    rowClickDiskEvent($table, hostid, startTime);

    //테이블의 th col 클릭시 정렬
    $('th', $table).each(function(column) {
        $(this).click(function() {
            var sortTable = '';
            var currentThObj = $(this);
            var MAX_COUNT = tableDataArr.length;
            var tmpDiskName = $(".selectedDisk").attr('id');

            if ($(this).is('.sorting_desc')) {
                console.log(" >>>>> sorting_desc <<<<< ");
                tableDataArr.sort(function(a, b) {
                    if (column == 0) {
                        return a.diskItemName < b.diskItemName ? -1 : a.diskItemName > b.diskItemName ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            } else {
                tableDataArr.sort(function(a, b) {
                    console.log(" >>>>> sorting_asc <<<<< ");
                    if (column == 0) {
                        return a.diskItemName > b.diskItemName ? -1 : a.diskItemName < b.diskItemName ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_asc").addClass("sorting_desc");
            }
            $('tbody', $table).empty();

            for (var i = 0; i < MAX_COUNT; i++) {
                sortTable += "<tr id='" + tableDataArr[i].diskItemName + "' role='row' class='odd'>";
                sortTable += "<td class='text-left'><span class='ellipsis' title='" + tableDataArr[i].diskItemName + "'>" + tableDataArr[i].diskItemName + "</span></td>";
                sortTable += "<td class='text-right'>" + tableDataArr[i].diskItemUsed + "<span class='smaller'>%</span></td>";
                sortTable += "<td class='text-right'>" + tableDataArr[i].diskItemSize + "<span class='smaller'>GB</span></td>";
                sortTable += "</tr>";
            }
            $('tbody', $table).append(sortTable);
            $("#" + tmpDiskName).addClass("selectedDisk");
        })
    });

    //page reloag
    $("#reload_diskInfo").click(function() {
        console.log(">>>>> reload_diskInfo <<<<<");
        $("#disk_" + hostid).click();
    });

    $(function($) {
        $('#reload_diskInfo_selecter').change(function() {
            var selectVal = $(this).val();
            if (selectVal != 0) {
                $("#reload_diskInfo").attr({
                    "disabled": "disabled"
                });
            } else {
                $("#reload_diskInfo").removeAttr("disabled");
            }
        });
    });

    //자동 새로고침
    //setInterval('$("#reload_diskInfo").click()', PAGE_RELOAD_TIME);
};

function rowClickDiskEvent(table, hostid, startTime) {
    $('tr', table).each(function(row) {
        if (row > 0) {
            $(this).click(function() {
                var currentDiskItemId = $(this).attr('id');
                $(".selectedDisk").removeClass("selectedDisk");
                $(this).addClass("selectedDisk");
                $(this).children().css("background", "#A2F0F1");
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
                    showDiskView(diskInode, diskFree, diskUse, startTime);
                });
            });
        }
    });
};

function showDiskView(diskInode, diskFree, diskUse, startTime) {
    var diskInodeArr = [];
    var diskFreeArr = [];

    var diskUseArr = [];

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskFreeArr= zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskUseArr  = zbxApi.getHistory.success(data);

        $(function () {
            var chart_IO;
            var chart_Total;

            var defaultTickInterval = 5;
            var currentTickInterval = defaultTickInterval;

            $(document).ready(function () {
                function unzoom() {
                    chart_IO.options.chart.isZoomed = false;
                    chart_Total.options.chart.isZoomed = false;

                    chart_IO.xAxis[0].setExtremes(null, null);
                    chart_Total.xAxis[0].setExtremes(null, null);
                }

                function syncronizeCrossHairs(chart) {
                    var container = $(chart.container);
                    var offset = container.offset();
                    var x;
                    var y;

                    container.mousemove(function (evt) {
                        x = evt.clientX - chart.plotLeft - offset.left;
                        y = evt.clientY - chart.plotTop - offset.top;
                        var xAxis = chart.xAxis[0];
                        var chart_IO_xAxis1 = chart_IO.xAxis[0];
                        chart_IO_xAxis1.removePlotLine("myPlotLineId");
                        chart_IO_xAxis1.addPlotLine({
                            value: chart.xAxis[0].translate(x, true),
                            width: 2,
                            color: 'red',
                            id: "myPlotLineId"
                        });
                        //remove old crosshair and draw new crosshair on chart2
                        var chart_Total_xAxis2 = chart_Total.xAxis[0];
                        chart_Total_xAxis2.removePlotLine("myPlotLineId");
                        chart_Total_xAxis2.addPlotLine({
                            value: chart.xAxis[0].translate(x, true),
                            width: 2,
                            color: 'red',
                            id: "myPlotLineId"
                        });
                    });
                }

                function computeTickInterval(xMin, xMax) {
                    var zoomRange = xMax - xMin;

                    if (zoomRange <= 2)
                        currentTickInterval = 0.5;
                    if (zoomRange < 20)
                        currentTickInterval = 1;
                    else if (zoomRange < 100)
                        currentTickInterval = 5;
                }

                function setTickInterval(event) {
                    var xMin = event.xAxis[0].min;
                    var xMax = event.xAxis[0].max;
                    computeTickInterval(xMin, xMax);

                    chart_IO.xAxis[0].options.tickInterval = currentTickInterval;
                    chart_IO.xAxis[0].isDirty = true;
                    chart_Total.xAxis[0].options.tickInterval = currentTickInterval;
                    chart_Total.xAxis[0].isDirty = true;
                }

                $(document).ready(function () {
                    var myPlotLineId = "myPlotLine";

                    chart_IO = new Highcharts.Chart({
                        chart: {
                            renderTo: 'chart_diskIo',
                            zoomType: 'x'
                        },
                        title: {
                            text: '디스크 I/O',
                            align: 'left'
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            tickInterval : 300000,
                            tickmarkPlacement: 'on',
                            startOnTick: true,
                            endOnTick: true,
                            showLastLabel: true,
                            events: {
                                afterSetExtremes: function() {
                                    if (!this.chart.options.chart.isZoomed) {
                                        var xMin = this.chart.xAxis[0].min;
                                        var xMax = this.chart.xAxis[0].max;
                                        var zmRange = computeTickInterval(xMin, xMax);
                                        chart_IO.xAxis[0].options.tickInterval = zmRange;
                                        chart_IO.xAxis[0].isDirty = true;
                                        chart_Total.xAxis[0].options.tickInterval = zmRange;
                                        chart_Total.xAxis[0].isDirty = true;

                                        chart_Total.options.chart.isZoomed = true;
                                        chart_Total.xAxis[0].setExtremes(xMin, xMax, true);

                                        chart_Total.options.chart.isZoomed = false;
                                    }
                                }
                            },
                            labels: {
                                formatter: function() {
                                    console.log("this.value : " + this.value);
                                    var d2 = new Date(this.value);
                                    var hours = "" + d2.getHours();
                                    var minutes = "" + d2.getMinutes();
                                    var seconds = "" + d2.getSeconds();
                                    console.log("d2.time : " + hours + " : " + minutes + " : " + seconds);
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
                                    return Math.floor(this.value * 100)/100 +'%';
                                }
                            }
                        },
                        tooltip: {
                            formatter: function() {
                                console.log("this.x : " + this.x);
                                var d2 = new Date(this.x);
                                console.log("d2 : " + d2);
                                var hours = "" + d2.getHours();
                                var minutes = "" + d2.getMinutes();
                                var seconds = "" + d2.getSeconds();
                                console.log("d2.time : " + hours + " : " + minutes + " : " + seconds);

                                if (hours.length == 1) {
                                    hours = "0" + hours;
                                }
                                if (minutes.length == 1) {
                                    minutes = "0" + minutes;
                                }
                                if (seconds.length == 1) {
                                    seconds = "0" + seconds;
                                }
                                return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + Math.floor(this.y * 100)/100 + "% </b>";
                            }
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: false //false
                                }
                            }
                        },
                        series: [{
                            name: 'Disk Inode',
                            data: diskInodeArr
                        }, {
                            name: 'Disk Free',
                            data: diskFreeArr
                        }]
                    }, function(chart) { //add this function to the chart definition to get synchronized crosshairs
                        syncronizeCrossHairs(chart);
                    });

                    chart_Total = new Highcharts.Chart({
                        chart: {
                            renderTo: 'chart_diskUse',
                            zoomType: 'x'
                        },
                        title: {
                            text: '디스크 Total',
                            align: 'left'
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            tickInterval : 300000,
                            tickmarkPlacement: 'on',
                            startOnTick: true,
                            endOnTick: true,
                            showLastLabel: true,
                            events: {
                                afterSetExtremes: function() {
                                    if (!this.chart.options.chart.isZoomed) {
                                        var xMin = this.chart.xAxis[0].min;
                                        var xMax = this.chart.xAxis[0].max;
                                        var zmRange = computeTickInterval(xMin, xMax);
                                        chart_IO.xAxis[0].options.tickInterval = zmRange;
                                        chart_IO.xAxis[0].isDirty = true;
                                        chart_Total.xAxis[0].options.tickInterval = zmRange;
                                        chart_Total.xAxis[0].isDirty = true;

                                        chart_IO.options.chart.isZoomed = true;
                                        chart_IO.xAxis[0].setExtremes(xMin, xMax, true);

                                        chart_IO.options.chart.isZoomed = false;
                                    }
                                }
                            },
                            labels: {
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
                            title: {
                                text: ''
                            },
                            labels: {
                                formatter: function () {
                                    return Math.floor(this.value * 100)/100 +'%';
                                }
                            }
                        },
                        tooltip: {
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
                                return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + Math.floor(this.y * 100)/100 + "% </b>";
                            }
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: false //false
                                }
                            }
                        },
                        series: [{
                            name: 'Disk Use',
                            data: diskUseArr
                        }]
                    }, function(chart) {
                        syncronizeCrossHairs(chart);
                    });
                });
            });
        });
    })
};