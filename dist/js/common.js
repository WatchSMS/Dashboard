function DataObject(name, data) {
    this.name = name;
    this.data = data;
}

var resultToArray = new function (data) {
    var array = [];
    $.each(data, function (k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var convStatus = function (status) {
    if (status === "0") {
        return "OK";
    } else {
        return "problem";
    }
};

var convAck = function (ack) {
    if (ack === "0") {
        return "Unacked";
    } else {
        return "Acked";
    }
};

var convPriority = function (priority) {
    switch (priority) {
        case "0":
            return "not classified";
        case "1":
            return "information";
        case "2":
            return "warning";
        case "3":
            return "average";
        case "4":
            return "high";
        case "5":
            return "disaster";
    }
};

var convStatusEvent = function (status) {
    if (status === "0") {
        return "정상"; //해소
    } else {
        return "이상"; //발생
    }
};

var convHostEvent = function (status) {
    if (status === "0") {
        return "정상";
    } else {
        return "이상";
    }
};

var convAckEvent = function (ack) {
    if (ack === "0") {
        return "미인지";
    } else {
        return "인지";
    }
};

/* 2018-01-29 */
/*var convStatusEvent = function (status) {
    if (status === "0") {
        return "활성"; //해소
    } else {
        return "비활성"; //발생
    }
};*/

var convStatusEventNum = function (status) {
    if (status === "활성") {
        return "0"; //해소
    } else {
        return "1"; //발생
    }
};

var convStatusTrigger = function (status) {
    switch (status) {
        case "":
            return "";
        case "0":
            return "활성";
        case "1":
            return "비활성";
    }
};

var convStatusTriggerNum = function (status) {
    if (status === "활성") {
        return "0"; //해소
    } else {
        return "1"; //발생
    }
};

var convPriorityKor = function (priority) {
    switch (priority) {
        case "":
            return "";
        case "0":
            return "미분류";
        case "1":
            return "정보";
        case "2":
            return "경고";
        case "3":
            return "가벼운장애";
        case "4":
            return "중증장애";
        case "5":
            return "심각한장애";
    }
};

var convTriggerInquality = function (Inquality) {
    switch (Inquality) {
        case "equal":
            return "=";
        case "greater":
            return ">";
        case "less":
            return "<";
        case "lessEqual":
            return ">=";
        case "greaterEqual":
            return "<=";
    }
}

var convPriorityNum = function (priority) {
    switch (priority) {
        case "미분류":
            return "0";
        case "정보":
            return "1";
        case "경고":
            return "2";
        case "가벼운장애":
            return "3";
        case "중증장애":
            return "4";
        case "심각한장애":
            return "5";
    }
};

var convStandard = function (Standard) {
    switch (Standard) {
        case "평균":
            return "avg";
        case "최대값":
            return "max";
        case "최소값":
            return "min";
        case "최신값":
            return "last";
    }
};

var convStandardKor = function (Standard) {
    switch (Standard) {
        case "avg":
            return "평균";
        case "max":
            return "최대값";
        case "min":
            return "최소값";
        case "last":
            return "최신값";
    }
};
/* 2018-01-29 */

var resultToArray = function (data) {
    var array = [];
    $.each(data, function (k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var Label = new function () {
    this.default = function (val) {
        return val;
    };
    this.percent = function (val) {
        return val + '%';
    };
    this.MB = function (val) {
        return Math.round(val / (1024 * 1024)) + 'MB';
    };
    this.bps = function (val) {
        return Math.round(val / 1000) + 'Kbps';
    };
};

function chartCall(chartId, title, series, label, enable, colorArr) {
    if (label == null) {
        label = Label.default;
    }

    if (colorArr == null) {
        colorArr = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 'f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
    }

    $(function () {
        Highcharts.chart(chartId, {
            colors: colorArr,
            chart: {
                renderTo: chartId,
                backgroundColor: '#424973',
                zoomType: 'x',
                height: 200,
                spacingTop: 10,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0
            },
            credits: {
                enabled: false
            },
            title: {
                //text: title
                text: ''
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
                title: {
                    text: ''
                },
                min: 0,
                max: 100,
                labels: {
                    style: {
                        color: '#E0E0E3'
                    },
                    formatter: function () {
                        return label(this.value);
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                style: {
                    color: '#F0F0F0'
                },
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
                    return "<b>" + hours + ":" + minutes + ":" + seconds + "<br/>" + this.y + "% </b>";
                }
            },
            legend: {
                enabled: enable
            },
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: enable
                    }
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false //false
                    }
                }
            },
            series: series
        });

    })
}


var chart1, chart2 = null;
var chart3 = null;
var chartArr = [];

function showBasicLineChart(chartId, chartTitle, dataSet, unit, colorArr) {

    $(function () {

        chart2 = new Highcharts.Chart({

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
            },
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                //type: 'area'
                renderTo: chartId,
                zoomType: 'x',
                height: 247,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "MB") {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        } else if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'Kbps';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else if (unit == "kbps") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + (this.y / 1024).toFixed(2) + 'Kbps';
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }

                }
            },
            plotOptions: {
                series: {
                    events: {
                        mouseOver: function (e) {
                            GLOBAL_INDEX = this.index;
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        Highcharts.Point.prototype.highlight = function (event) {
            this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };


        Highcharts.Pointer.prototype.reset = function () {
//            return undefined;
        };
    });
}


function showBasicAreaChart(chartId, chartTitle, dataSet, unit, colorArr) {

    Highcharts.Pointer.prototype.reset = function () {
        //return undefined;
    };

    Highcharts.Point.prototype.highlight = function (event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    $(function () {

        chart1 = new Highcharts.chart(chartId, {
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: false,
                        symbolStroke: '#1e282c',
                        theme: {
                            fill: '#626992'
                        }
                    }
                }
            },
            colors: colorArr,
            chart: {
                renderTo: chartId,
                backgroundColor: 'transparent',
                type: 'area',
                zoomType: 'x',
                height: 247,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'Kbps';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "kbps") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + (this.y / 1024).toFixed(2) + "Kbps";
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }
                }
            },
            plotOptions: {
                series: {

                    events: {
                        mouseOver: function (e) {

                            GLOBAL_INDEX = this.index;
                        },
                        legendItemClick: function (e) {
                            var visibility = this.visible ? 'visible' : 'hidden';
                            console.log("visibility?");
                            console.log(visibility);
//                            var event, point;
//                            event = this.chart.pointer.normalize(e.originalEvent); 
//                            
//                            for(var i=0; i<this.chart.series.length; i=i+1){
//                            	this.chart.series[this.index].searchPoint(event, false); 
//                            }
//                            point = this.chart.series[this.index].searchPoint(event, true); 
//                    		if (point) {
//                                point.highlight(e);
//                            }

                        }
                    }//end events
                }, //end series
                area: {
                    //pointStart: startTimeForChart,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        //radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: dataSet
        });
    });
}


function hostDetailChartMemory(chartId, chartTitle, dataSet, unit, colorArr) {
    $(function () {
        memoryAll = new Highcharts.Chart({

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
            },
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                //type: 'area'
                renderTo: chartId,
                zoomType: 'x',
                height: 200,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "MB") {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        } else if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'MB';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }

                }
            },
            plotOptions: {
                series: {
                	stickyTracking: false,
                    events: {
                        mouseOver: function (e) {
                            GLOBAL_INDEX = this.index;
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
    });
}

function hostDetailChartCPU(chartId, chartTitle, dataSet, unit, colorArr) {
    $(function () {
        cpuUse = new Highcharts.Chart({

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
            },
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                //type: 'area'
                renderTo: chartId,
                zoomType: 'x',
                height: 200,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "MB") {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        } else if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'Kbps';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }

                }
            },
            plotOptions: {
                series: {
                	stickyTracking: false,
                    events: {
                        mouseOver: function (e) {
                            GLOBAL_INDEX = this.index;
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
    });
}

function hostDetailChartDisk(chartId, chartTitle, dataSet, unit, colorArr) {
    $(function () {
        diskUse = new Highcharts.Chart({

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
            },
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                //type: 'area'
                renderTo: chartId,
                zoomType: 'x',
                height: 200,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "MB") {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        } else if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'Kbps';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }

                }
            },
            plotOptions: {
                series: {
                	stickyTracking: false,
                    events: {
                        mouseOver: function (e) {
                            GLOBAL_INDEX = this.index;
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
    });
}

function hostDetailChartNetwork(chartId, chartTitle, dataSet, unit, colorArr) {
    $(function () {
        trafficUse = new Highcharts.Chart({

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
            },
            colors: colorArr,
            chart: {
                backgroundColor: '#424973',
                //type: 'area'
                renderTo: chartId,
                zoomType: 'x',
                height: 200,
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
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
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        if (unit == "MB") {
                            return Math.round(this.value / (1024 * 1024)) + 'MB';
                        } else if (unit == "kbps") {
                            return Math.round(this.value / 1024) + 'Kbps';
                        } else {
                            return this.value + unit;
                        }
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
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else if (unit == "kbps") {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + (this.y / 1024).toFixed(2) + 'Kbps';
                    } else {
                        return "<b>시간 : </b>" + hours + ":" + minutes + ":" + seconds + "<br/><b>값 : </b>" + this.y + unit;
                    }

                }
            },
            plotOptions: {
                series: {
                	stickyTracking: false,
                    events: {
                        mouseOver: function (e) {
                            GLOBAL_INDEX = this.index;
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
    });
}

function showLineChart(chartId, chartTitle, dataSet, unit, colorArr) {
    $(function () {
        var tmp_chart = new Highcharts.Chart(chartId, {
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
            },
            colors: colorArr,
            chart: {
                animation: false,
                backgroundColor: 'transparent',//'#424973',
                height: 70,
                renderTo: chartId,
                //type: 'area'
                zoomType: 'x',
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
//                        console.log("loaded");
//                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {
                showFirstLabel: true,
                showLastLabel: true,
                gridLineWidth: 1,
                gridLineColor: 'gray',
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#EDEDED'
                    },
                    formatter: function () {
                        var d2 = new Date(this.value);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        if (hours.length == 1) {
                            hours = "0" + hours;
                        }
                        if (minutes.length == 1) {
                            minutes = "0" + minutes;
                        }
                        return hours + ":" + minutes;
                    }
                }
            },
            yAxis: {
                showFirstLabel: true,
                showLastLabel: true,
                gridLineWidth: 1,
                gridLineColor: 'gray',
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#EDEDED'
                    },
                    formatter: function () {
                    }
                },
                min: 0
            },
            tooltip: {
                useHTML: true,
                hideDelay: 10,
                formatter: function () {
                    var d2 = new Date(this.x);
                    var hours = "" + d2.getHours();
                    var beforeHour = "" + (d2.getHours() - 1);
                    var minutes = "" + d2.getMinutes();
                    var seconds = "" + d2.getSeconds();

                    if (hours.length == 1) {
                        hours = "0" + hours;
                    }
                    if (beforeHour.length == 1) {
                        beforeHour = "0" + beforeHour;
                    }
                    if (minutes.length == 1) {
                        minutes = "0" + minutes;
                    }
                    if (seconds.length == 1) {
                        seconds = "0" + seconds;
                    }
                    if (unit == "MB") {
                        return "<b>시간 : </b>" + beforeHour + ":" + minutes + " ~ " + hours + ":" + minutes + "<br/><b>값 : </b>" + Math.round(this.y / (1024 * 1024)) + 'MB';
                    } else {
                        return "<b>구간 : </b>" + beforeHour + ":" + minutes + " ~ " + hours + ":" + minutes + " <br/><b>이벤트 수 : </b>" + this.y + unit;
                    }
                }
            },
            plotOptions: {
                series: {
                	
                    stickyTracking: false,
                    //cursor: 'default'
                    
//                    events: {
//                        mouseOver: function(e){
//                            GLOBAL_INDEX = this.index;
//                        }
//                    },
                    marker: {
                        enabled: false
                    },
                    lineWidth: 1
                }
            },
            series: dataSet
        });

        chartArr.push[tmp_chart];
        console.log(chartArr.length);
        Highcharts.Point.prototype.highlight = function (event) {
            //this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };
    });
}

function syncExtremes(e) {
    var thisChart = this.chart;
    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart.renderTo.id == "chart_dayEvent") {
                return;
            }
            if (chart.renderTo.id == "chart_eventAck") {
                return;
            }
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {trigger: 'syncExtremes'});
                }
            }
        });
    }
}

var offTimer = function () {
    $.each(TIMER_ARR, function (k, v) {
        clearInterval(v);
    });
    TIMER_ARR = [];
}

var removeAllChart = function () {

    for (var i = 0; i < Highcharts.charts.length; ++i) {
        if (typeof Highcharts.charts[i] != "undefined") {
            Highcharts.charts[i].destroy();
        }
    }
    Highcharts.charts.splice(0);
}


var callApiForProcessTable = function (hostid) {
    return zbxSyncApi.getItem(hostid, "system.run[\"ps -eo user,pid,ppid,rss,size,vsize,pmem,pcpu,time,cmd --sort=-pcpu\"]");
}


var sortProcess = function (data_topProcess, sortField) {

    if (data_topProcess.lastclock == "0") {
        return;
    }
    var topProcRowArr = data_topProcess.lastvalue.split("\n"); //각 행들의 집합
    var procUniqueName = [];
    var procNameOrderByCpu = [];
    var dataObj = null;
    var dataSet = [];

    //모든 행의 데이터 사이의 구분자를 한칸 띄어쓰기로 변경
    $.each(topProcRowArr, function (k, v) {
        while (topProcRowArr[k].indexOf("  ") != -1) {
            topProcRowArr[k] = topProcRowArr[k].replace('  ', ' ');
        }

        var topProcColArr = topProcRowArr[k].split(" ");
        var orgName = '';
        var procNameArr = [];
        var procName = '';
        for (var i = 9; i < topProcColArr.length; i++) {
            orgName += topProcColArr[i];
        }
        if (topProcColArr[9].indexOf("/0") != -1) {
            procName = topProcColArr[9];
        } else {
            procNameArr = topProcColArr[9].split("/");
            procName = procNameArr[procNameArr.length - 1];
        }
        procName = procName.replace(/\:/g, '');
        if(procName == "postgres" && (sortField == "MEM" || sortField == "PROCESS")){
        	return true;
        }

        procNameOrderByCpu[k] = procName;

        dataObj = new Object();
        dataObj.procName = procName;
        dataObj.orgName = orgName;
        dataObj.procCpu = parseFloat(topProcColArr[7]);
        dataObj.procMem = parseFloat(topProcColArr[6]);
        //dataObj.pid = topProcColArr[1];
        dataSet.push(dataObj);
    });

    // 프로세스명 중복 제거 후, 프로세스 별 cpu 합 초기화
    $.each(procNameOrderByCpu, function (k, v) {
        if (procUniqueName.indexOf(v) == -1) {
            procUniqueName.push(v);
        }
    });

    var procUniqueObj = null;
    var procTotalArr = [];
    $.each(procUniqueName, function (k, v) {
        procUniqueObj = new Object();
        procUniqueObj.procName = v;
        procUniqueObj.totalCpuVal = 0;
        procUniqueObj.totalMemVal = 0;
        procUniqueObj.procCnt = 0;
        procTotalArr.push(procUniqueObj);
    });

    // 같은 프로세스 명끼리 cpu값 더함
    procTotalArr.splice(0, 1);
    $.each(procTotalArr, function (k1, v1) {
        var childProcessArr = [];
        var childCpuArr = [];
        var childMemArr = [];
        $.each(dataSet, function (k2, v2) {
            if (v1.procName == v2.procName) {
                v1.totalCpuVal += v2.procCpu;
                v1.totalMemVal += v2.procMem;
                v1.procCnt += 1;
                childProcessArr.push(v2.orgName + "\\n");
                childCpuArr.push(v2.procCpu);
                childMemArr.push(v2.procMem);
            }
        });
        v1.childName = childProcessArr;
        v1.childCpu = childCpuArr;
        v1.childMem = childMemArr;
    });

    // cpu값을 기준으로 객체배열 내림차순 정렬
    procTotalArr.sort(function (a, b) {
        if(sortField == "CPU" || sortField == "PROCESS"){
            return a.totalCpuVal > b.totalCpuVal ? -1 : a.totalCpuVal < b.totalCpuVal ? 1 : 0;
        } else if (sortField == "MEM") {
            return a.totalMemVal > b.totalMemVal ? -1 : a.totalMemVal < b.totalMemVal ? 1 : 0;
        }
    });

    return procTotalArr;
}

var viewMoreProcess = function () {
    $('tr#lastrow').off().on('click', function () {
        var optionRows = $("tr.optionrow");
        if ($(this).attr('isopen') == 'false') {
            $.each(optionRows, function (k, v) {
                $(this).css('display', '');
                $('tr#lastrow').attr("isopen", "true");
                $('tr#lastrow').children().children().html("[ 닫기 ]");
            });
        } else {
            $.each(optionRows, function (k, v) {
                $(this).css('display', 'none');
                $('tr#lastrow').attr("isopen", "false");
                $('tr#lastrow').children().children().html("[ 더 보기 ]");
            });
        }

    });
}

var chartLegendItemClick = function (legendIndex, chartId, self) {

    for (var i = 0; i < Highcharts.charts.length; ++i) {
        if (Highcharts.charts[i].renderTo.id == chartId) {
            if (Highcharts.charts[i].series[legendIndex].visible) {
                $(self).css("color", "#8189c0").css("text-decoration", "none");
                Highcharts.charts[i].series[legendIndex].hide();
            } else {
                Highcharts.charts[i].series[legendIndex].show();
                $(self).css("color", "#c5d0ec");
            }
        }
    }
}

var downloadChart = function () {

    $('#selectChartOutOption').lightbox_me({
        centered: true,
        closeSelector: ".close",
        onLoad: function () {
            $('#selectChartOutOption').find('input:first').focus();    //-- 첫번째 Input Box 에 포커스 주기
            console.log($(this).val());
        },
        overlayCSS: {background: 'white', opacity: .8}
    });
}

var outChart = function () {

    var chartId = $('#selectedChartId').text();
    var selectedType = $(':radio[name="fileType"]:checked').val();
    var fileType = 'image/png';

    if (selectedType == "PNG") {
        fileType = 'image/png';
    } else if (selectedType == "JPEG") {
        fileType = 'image/jpeg';
    } else if (selectedType == "PDF") {
        fileType = 'application/pdf';
    } else if (selectedType == "SVG") {
        fileType = 'image/svg+xml';
    }

    for (var i = 0; i < Highcharts.charts.length; ++i) {
        if (typeof Highcharts.charts[i] != "undefined" && Highcharts.charts[i].renderTo.id == chartId) {
            Highcharts.charts[i].legend.options.enabled = true;
            Highcharts.charts[i].exportChart({
                type: fileType,
                filename: 'chart'
            });
            Highcharts.charts[i].legend.options.enabled = false;

        }
    }
    for (var i = 0; i < Highcharts.charts.length; ++i) {
        if (typeof Highcharts.charts[i] == "undefined") {
            Highcharts.charts.splice(i);
        }
    }

}


function showScatterPlotChart(chartId, xAxisMin, dataSet, colorArr) {

    $(function () {

        dash_eventAckChart = new Highcharts.chart(chartId, {

            colors: colorArr,
            chart: {
                renderTo: chartId,
                backgroundColor: 'transparent',
                type: 'scatter',
                zoomType: 'xy',
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: ""
            },
            subtitle: {
                text: ''
            },
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: false
                    }
                }
            },
            legend: {
                enabled: false
            },
            xAxis: {
                //min: xAxisMin,
                //categories:[1489028400000,1489114800000,1489201200000,1489287600000],
                gridLineWidth: 1,
                gridLineColor: 'grey',
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        var d2 = new Date(this.value);
                        var month = d2.getMonth() + 1;
                        var date = d2.getDate();
                        return month + "/" + date;
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                gridLineWidth: 1,
                gridLineColor: 'grey',
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
//                    	console.log("aaaaaaaaaaaaaaaaaaaaaaa");
//                    	console.log(this);
//                    	console.log(this.value);
//                    	return Highcharts.dateFormat('%H:%M:%S', this.value);

//                    	var d =  new Date(this.value);
//                    	var month = d.getMonth()+1;
//                        var date = d.getDate();
//                    	var hours = d.getHours();
//                    	var minutes = d.getMinutes();
//                    	var seconds = d.getSeconds();
//
//                    	return month + "/" + date + "  " + hours + ":" + minutes + ":" + seconds;

//                    	return this.value;
                        console.log("aaaaaaaaaaaaaaaaaaaaaaa");
                        console.log(this);
                        console.log(this.value);

                        var d = new Date(this.value);
                                                console.log(d);
                                                console.log("일 : " + (d.getDate()));
                                                console.log("시 : " + (d.getHours()-9));
                                                console.log("분  : " + d.getMinutes());
                        console.log("초 : " + d.getSeconds());

                        var duration = "";

                        if ((d.getHours() - 9) + ((d.getDate() - 1) * 24) < 10) {
                            duration += "0";
                        }
                        duration += (d.getHours() - 9) + ((d.getDate() - 1) * 24);
                        duration += ":";
                        if ((d.getMinutes()) < 10) {
                            duration += "0";
                        }
                        duration += d.getMinutes();
                        duration += ":";
                        if ((d.getSeconds()) < 10) {
                            duration += "0";
                        }
                        duration += d.getSeconds();

                        return duration;
                    }
                }
            },
            tooltip: {
                borderColor: '#51597e',
                borderWidth: 1,
                backgroundColor: '#3d476b',
                useHTML: true,
                formatter: function () {

                    var d2 = new Date(this.x);
                    var month = d2.getMonth() + 1;
                    var date = d2.getDate();
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

                    var d = new Date(this.y);
                    var duration = "";
                    if ((d.getHours() - 9) + ((d.getDate() - 1) * 24) < 10) {
                        duration += "0";
                    }
                    duration += (d.getHours() - 9) + ((d.getDate() - 1) * 24);
                    duration += ":";
                    if ((d.getMinutes()) < 10) {
                        duration += "0";
                    }
                    duration += d.getMinutes();
                    duration += ":";
                    if ((d.getSeconds()) < 10) {
                        duration += "0";
                    }
                    duration += d.getSeconds();

                    var s = "<span style='font-family: Helvetica,Arial,sans-serif; color: #c5d0ec;'><b>- 서버 :     </b>" + this.point.host + "<br/>";
                    if (this.point.type == "ack") {
                        s += "<b>- 인지시간 : </b>" + month + "/" + date + " (" + hours + ":" + minutes + ":" + seconds + ")<br/>";
                    } else if (this.point.type == "resolve") {
                        s += "<b>- 해소시간 : </b>" + month + "/" + date + " (" + hours + ":" + minutes + ":" + seconds + ")<br/>";
                    }
                    s += "<b>- Duration : </b>" + duration + "<br/>";
                    s += "<b>- 이벤트명 : </b>" + this.point.description + "<br/>";
                    if (this.point.priority == "Warning") {
                        s += "<b>- 이벤트 등급 : </b><span style='color:#FFC859'>" + this.point.priority + "</span></span>";
                    } else if (this.point.priority == "High") {
                        s += "<b>- 이벤트 등급 : </b><span style='color:#E97659'>" + this.point.priority + "</span></span>";
                    }else if(this.point.priority=="Information"){
                        s += "<b>- 이벤트 등급 : </b><span style='color:#7499FF'>" + this.point.priority + "</span></span>";
                    }else if(this.point.priority=="Disaster"){
                        s += "<b>- 이벤트 등급 : </b><span style='color:red'>" + this.point.priority + "</span></span>";
                    }else if(this.point.priority=="Average"){
                        s += "<b>- 이벤트 등급 : </b><span style='color:#FFA059'>" + this.point.priority + "</span></span>";
                    }
                    return s;
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 3,
//                        lineWidth: 1,
//                        lineColor: 'grey',
                        symbol: 'circle',
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: true
                            }
                        }
                    }
//                    ,
//                    tooltip: {
//                        headerFormat: '<b>{series.name}</b><br>',
//                        pointFormat: '{point.x} cm, {point.y} kg'
//                    }
                },
                series: {
                    stickyTracking: false
                    //cursor: 'default'
                }
            },
            series: dataSet
        });
    });
}


function showEventStatChart(chartId, chartTitle, dataSet, unit, colorArr) {

    $(function () {

        chart1 = new Highcharts.chart(chartId, {
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: false,
                        symbolStroke: '#1e282c',
                        theme: {
                            fill: '#626992'
                        }
                    }
                }
            },
            colors: colorArr,
            chart: {
                renderTo: chartId,
                backgroundColor: 'transparent',
                type: 'area',
                zoomType: 'x',
                events: {
                    load: function (event) {
                        $("#" + chartId).unblock(blockUI_opt_el);
                        console.log("loaded");
                        console.log(Highcharts.charts.length);
                    }
                },
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: "",
                style: {
                    color: '#EDEDED'
                }
            },
            subtitle: {
                text: ''
            },
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#a2adcc'
                }
            },
            xAxis: {

                crosshair: true,
                events: {
                    setExtremes: syncExtremes
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        var d2 = new Date(this.value);
                        var hours = "" + d2.getHours();
                        var minutes = "" + d2.getMinutes();
                        if (hours.length == 1) {
                            hours = "0" + hours;
                        }
                        if (minutes.length == 1) {
                            minutes = "0" + minutes;
                        }
                        return hours + ":" + minutes;
                    }
                }
            },
            yAxis: {
                gridLineWidth: 1,
                gridLineColor: 'grey',
                title: {
                    text: ''
                },
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        return this.value + unit;
                    }
                }
            },
            tooltip: {
                borderColor: '#51597e',
                borderWidth: 1,
                backgroundColor: '#3d476b',
                useHTML: true,
                shared: true,
                formatter: function () {
                    var valueStr = "";
                    var hours = "";
                    var minutes = "";
                    var totalCount = 0;

                    $.each(this.points, function (k, v) {
                        if (v.series.visible) {
                            var d2 = new Date(this.x);
                            hours = "" + d2.getHours();
                            minutes = "" + d2.getMinutes();
                            if (hours.length < 2) {
                                hours = "0" + hours;
                            }
                            if (minutes.length < 2) {
                                minutes = "0" + minutes;
                            }
                            var backgroundColor;
                            if (v.series.name == "인지") {
                                backgroundColor = "#FF8C00";
                            } else if (v.series.name == "신규") {
                                backgroundColor = "#ee6866";
                            } else if (v.series.name == "완료") {
                                backgroundColor = "#00BFFF";
                            }
                            totalCount += v.y;
                            valueStr += "<li class='p1'><span style='background:" + backgroundColor + "; width:9px; height:9px; margin:0 3px 1px 0; vertical-align:middle; display:inline-block;'></span><span style='font-family: Helvetica,Arial,sans-serif; color: #c5d0ec;'>" + v.series.name + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>" + v.y + "</b></li>";
                        }
                    });
                    valueStr += "<li class='p1'><span style='background:black; width:9px; height:9px; margin:0 3px 1px 0; vertical-align:middle; display:inline-block;'></span><span style='font-family: Helvetica,Arial,sans-serif; color: #c5d0ec;'>전체&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>" + totalCount + "</b></style></li>";

                    return "<span style='font-family: Helvetica,Arial,sans-serif; color: #c5d0ec;'>" + hours + ":" + minutes + "</span><br/>" + valueStr;

                }
            },
            plotOptions: {
                series: {
                    events: {
//                    	mouseOver: function(e){
//                			GLOBAL_INDEX = this.index;
//                		 },
                        legendItemClick: function (e) {
                            var visibility = this.visible ? 'visible' : 'hidden';
                            console.log("visibility?");
                            console.log(visibility);
                        }
                    }//end events
                }, //end series
                area: {
                    stacking: 'normal',
                    //lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 1,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: dataSet
        });
    });
}

function showScatterPlotChart_selectDate(chartId, xAxisMin, xAxisMax, dataSet, colorArr) {
    $(function () {
        dash_eventAckChart = new Highcharts.chart(chartId, {
            colors: colorArr,
            chart: {
                renderTo: chartId,
                backgroundColor: 'transparent',
                type: 'scatter',
                zoomType: 'xy',
                resetZoomButton: {
                    theme: {
                        fill: '#323c60', //'#3d476b',
                        r: 5,
                        style: {
                            color: '#c5d0ec'
                        },
                        states: {
                            hover: {
                                fill: '#1e282c',
                                style: {
                                    color: '#c5d0ec'
                                }
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            title: {
                text: ""
            },
            subtitle: {
                text: ''
            },
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: false
                    }
                }
            },
            legend: {
                enabled: false
            },
            xAxis: {
                min: xAxisMin,
                max: xAxisMax,
                gridLineWidth: 1,
                gridLineColor: 'grey',
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        var d2 = new Date(this.value);
                        var year = d2.getFullYear();
                        var month = d2.getMonth() + 1;
                        var date = d2.getDate();

                        if(month < 10){
                            month = "0" + month;
                        }
                        if(date < 10){
                            date = "0" + date;
                        }

                        return year + " / " + month + "/" + date;
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                gridLineWidth: 1,
                gridLineColor: 'grey',
                labels: {
                    style: {
                        color: '#a2adcc'
                    },
                    formatter: function () {
                        var d = new Date(this.value);
                        var duration = "";

                        if ((d.getHours() - 9) + ((d.getDate() - 1) * 24) < 10) {
                            duration += "0";
                        }
                        duration += (d.getHours() - 9) + ((d.getDate() - 1) * 24);
                        duration += ":";
                        if ((d.getMinutes()) < 10) {
                            duration += "0";
                        }
                        duration += d.getMinutes();
                        duration += ":";
                        if ((d.getSeconds()) < 10) {
                            duration += "0";
                        }
                        duration += d.getSeconds();

                        return duration;
                    }
                }
            },
            tooltip: {
                borderColor: '#51597e',
                borderWidth: 1,
                backgroundColor: '#3d476b',
                useHTML: true,
                hideDelay: 10,
                formatter: function () {

                    var d2 = new Date(this.x);
                    var year = d2.getFullYear();
                    var month = d2.getMonth() + 1;
                    var date = d2.getDate();
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

                    var d = new Date(this.y);
                    var duration = "";
                    if ((d.getHours() - 9) + ((d.getDate() - 1) * 24) < 10) {
                        duration += "0";
                    }
                    duration += (d.getHours() - 9) + ((d.getDate() - 1) * 24);
                    duration += ":";
                    if ((d.getMinutes()) < 10) {
                        duration += "0";
                    }
                    duration += d.getMinutes();
                    duration += ":";
                    if ((d.getSeconds()) < 10) {
                        duration += "0";
                    }
                    duration += d.getSeconds();

                    var s = "<span style='font-family: Helvetica,Arial,sans-serif; color: #c5d0ec;'><b>- 서버 :     </b>" + this.point.host + "<br/>";
                    if (this.point.type == "ack") {
                        s += "<b>- 인지시간 : </b>" + year + "/" + month + "/" + date + " (" + hours + ":" + minutes + ":" + seconds + ")<br/>";
                    } else if (this.point.type == "resolve") {
                        s += "<b>- 해소시간 : </b>" + year + "/" + month + "/" + date + " (" + hours + ":" + minutes + ":" + seconds + ")<br/>";
                    }
                    s += "<b>- Duration : </b>" + duration + "<br/>";
                    s += "<b>- 이벤트명 : </b>" + this.point.description + "<br/>";
                    if (this.point.priority == "Warning") {
                        s += "<b>- 이벤트 등급 : </b><span style='color:yellow'>" + this.point.priority + "</span></span>";
                    } else if (this.point.priority == "High") {
                        s += "<b>- 이벤트 등급 : </b><span style='color:red'>" + this.point.priority + "</span></span>";
                    }
                    return s;
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 3,
                        symbol: 'circle',
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: true
                            }
                        }
                    }
                },
                series: {
                    stickyTracking: false,
                    cursor: 'default'
                }
            },
            series: dataSet
        });
    });
}
