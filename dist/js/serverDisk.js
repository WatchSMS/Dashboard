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

var rowClickDiskEvent = function(table, hostid, startTime) {
    $('tr', table).each(function(row) {
        if (row > 0) {
            $(this).click(function() {
                var currentDiskItemId = $(this).attr('id');
                console.log("currentDiskItemId : " + currentDiskItemId);

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

var showDiskView = function(diskInode, diskFree, diskUse, startTime) {
    showInFrDisk(diskInode, diskFree, startTime);
    showUseDisk(diskUse, startTime);
};

function showInFrDisk(diskInode, diskFree, startTime) {
    var diskInodeArr = [];
    var diskFreeArr = [];

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, HISTORY_TYPE.FLOAT);
    }).then(function(data) {
        diskFreeArr= zbxApi.getHistory.success(data);

        Highcharts.chart('chart_diskIo', {
            chart: {
                type: 'spline',
                zoomType: 'x',
                spacingTop: 2,
                spacingBottom: 0
            },
            title: {
                text: '디스크 I/O',
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
                        return this.value + '%';
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
                    return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                }
            },
            plotOptions: {
                lineWidth: 1.5,
                marker: {
                    radius: 2
                }
            },
            series: [{
                name: 'Disk Inode',
                data: diskInodeArr
            }, {
                name: 'Disk Free',
                data: diskFreeArr
            }]
        })
    })
}

function showUseDisk(diskUse, startTime) {
    var diskUseArr = [];

    zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, HISTORY_TYPE.FLOAT).then(function(data) {
        diskUseArr  = zbxApi.getHistory.success(data);

        Highcharts.chart('chart_diskUse', {
            chart: {
                type: 'area',
                zoomType: 'x',
                spacingTop: 2,
                spacingBottom: 0
            },
            title: {
                text: '디스크 Total',
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
                        return this.value + '%';
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
                    return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
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
                name: 'Disk Use',
                data: diskUseArr
            }]
        })
    })
}