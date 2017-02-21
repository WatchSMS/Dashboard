function DataObject(name, data){
  this.name=name;
  this.data=data;
}

var resultToArray = new function(data) {
    var array = [];
    $.each(data, function(k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var convStatus = function(status) {
    if (status === "0") {
        return "OK";
    } else {
        return "problem";
    }
};

var convAck = function(ack) {
    if (ack === "0") {
        return "Unacked";
    } else {
        return "Acked";
    }
};

var convPriority = function(priority) {
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

/*
var convAckServer = function(ack) {
    if (ack === "0") {
        return "아니오";
    } else {
        return "예";
    }
};

var convPriorityServer = function(priority) {
    switch (priority) {
        case "0":
            return "미분류";
        case "1":
            return "정보";
        case "2":
            return "경고";
        case "3":
            return "가벼운 장애";
        case "4":
            return "중증 장애";
        case "5":
            return "심각한 장애";
    }
};

var convStatusServer = function(status) {
    if (status === "0") {
        return "장애 없음";
    } else {
        return "장애 있음";
    }
};
*/

var resultToArray = function(data) {
    var array = [];
    $.each(data, function(k, v) {
        array[k] = new Array();
        array[k][0] = parseInt(v.clock) * 1000;
        array[k][1] = parseFloat(v.value);
    });
    return array;
}

var Label = new function() {
    this.default = function(val) {
        return val;
    };
    this.percent = function(val) {
        return val + '%';
    };
    this.MB = function(val) {
        return Math.round(val / (1024 * 1024)) + 'MB';
    };
};

function chartCall(chartId, title, series, label, colorArr) {
    if (label == null) {
        label = Label.default;
    }

    if (colorArr == null) {
        colorArr = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 'f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'];
    }

    $(function() {
        Highcharts.chart(chartId, {
            colors: colorArr,
            chart: {
                zoomType: 'x',
                height: 250,
                spacingTop: 10,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0
            },
            title: {
                text: title
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
                min: 0,
                max: 100,
                labels: {
                    formatter: function() {
                        return label(this.value);
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
