function diskView(hostid, disk_data, startTime) {
    console.log("diskView");
    var diskTableHTML = '';
    var MAX_DISKCOUNT = 10;
    var currentDiskName = null;
    var tableDataObj = new Object();
    var tableDataArr = [];

    var diskItemId = '';
    var diskItemName = '';
    var diskItemUsed = '';
    var diskItemSize = '';

    diskTableHTML += "<thead>";
    diskTableHTML += "<tr role='row'>";
    diskTableHTML += "<th class='percent-text sorting' aria-sort='descending'>DISK</th>";
    diskTableHTML += "<th width='15%' class='text-left'>USED<span class='smaller'>(%)</span></th>";
    diskTableHTML += "<th width='15%' class='text-left'>SIZE<span class='smaller'>(MB)</span></th>";
    diskTableHTML += "</tr>";
    diskTableHTML += "</thead>";

    diskTableHTML += "<tbody>";

    $.each(disk_data.result, function(k, v) {
        diskItemId = v.itemId;
        var name = v.key_;
        diskItemName = name.substring(name.indexOf("[") + 1, name.indexOf(","));
        diskItemUsed = 0;
        diskItemSize = 0;

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
            diskTableHTML += "<td class='text-right'>" + diskItemSize + "<span class='smaller'>MB</span></td>";
            diskTableHTML += "</tr>";
        }
    });

    diskTableHTML += "</tbody>";

    $("#diskInfoTable").empty();
    $("#diskInfoTable").append(diskTableHTML);
    var $table = $("#diskInfoTable");
    $("#diskInfoTable > tbody > tr").eq(0).addClass("selectedDisk");
    currentDiskName = $(".selectedDisk").attr('id');

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
                console.log(" >>>>> sorting_desc <<<<<");
                tableDataArr.sort(function(a, b) {
                    if (column == 0) {
                        return a.diskItemName < b.diskItemName ? -1 : a.diskItemName > b.diskItemName ? 1 : 0;
                    }
                });
                currentThObj.removeClass("sorting_desc").addClass("sorting_asc");
            } else {
                tableDataArr.sort(function(a, b) {
                    console.log(" >>>>> sorting_asc <<<<<");
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
                sortTable += "<td class='text-right'>" + tableDataArr[i].diskItemSize + "<span class='smaller'>MB</span></td>";
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
                var diskItemKeyUse = "vfs.fs.size[" + currentDiskItemId + ",pfree]";

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

    var history_diskInode = null;
    var history_diskFree = null;

    zbxApi.getHistory.get(diskInode.result[0].itemid, startTime, 0).then(function(data) {
        diskInodeArr  = zbxApi.getHistory.success(data);
        // history_diskInode = zbxApi.getHistory.success(data);
        // $.each(history_diskInode.result, function(k, v) {
        //     diskInodeArr[k] = new Array();
        //     diskInodeArr[k][0] = parseInt(v.clock) * 1000;
        //     diskInodeArr[k][1] = parseFloat(v.value);
        // });
    }).then(function() {
        return zbxApi.getHistory.get(diskFree.result[0].itemid, startTime, 0);
    }).then(function(data) {
        diskFreeArr= zbxApi.getHistory.success(data);
        //
        // history_diskFree = zbxApi.getHistory.success(data);
        // $.each(history_diskFree.result, function(k, v) {
        //     diskFreeArr[k] = new Array();
        //     diskFreeArr[k][0] = parseInt(v.clock) * 1000;
        //     diskFreeArr[k][1] = parseFloat(v.value);
        // });

        $(function() {
            Highcharts.chart('chart_diskIo', {
                chart: {
                    type: 'area',
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
                    name: 'Disk Inode',
                    data: diskInodeArr
                }, {
                    name: 'Disk Free',
                    data: diskFreeArr
                }]
            });
        });
    })
}

function showUseDisk(diskUse, startTime) {
    var diskUseArr = [];

    var history_diskUse = null;

    zbxApi.getHistory.get(diskUse.result[0].itemid, startTime, 0).then(function(data) {
        diskUseArr  = zbxApi.getHistory.success(data);
        // history_diskUse = zbxApi.getHistory.success(data);
        // $.each(history_diskUse.result, function(k, v) {
        //     diskUseArr[k] = new Array();
        //     diskUseArr[k][0] = parseInt(v.clock) * 1000;
        //     diskUseArr[k][1] = 100 - parseFloat(v.value);
        // });

        $(function() {
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
            });
        });
    })
}