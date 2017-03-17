var alertSettingView = function(hostId) {
	
	$.blockUI(blockUI_opt_all);
	
	showCpuAlertSettingView(hostId);
	showMemAlertSettingView(hostId);
	
    $.unblockUI(blockUI_opt_all);
}


function showCpuAlertSettingView(hostId){
	
	var warnExpression, highExpression = null;
    var warnExprArr = [];
    var highExprArr = [];
    var oldWarnValue = 30;
    var oldHighValue = null;
    var highTriggerId,warnTriggerId = null;
    var newHighVal,newWarnVal = null;
    var hostName = null;
    var itemKey = null;
    var status = null;
    
    var formatter = d3.format(",.1f");
    var tickFormatter = function(d) {
      return formatter(d) + " %";
    }
    
    
    // 위험
    $('#input_slider').children().first().children().first().keypress(function(e){
      	if(e.keyCode==13){
      		var newValue = $('#input_slider').children().last().children().first().val(); // 경고
      		var newValue2 = $('#input_slider').children().first().children().first().val(); // 위험
      		
      		slider.move2(newValue,newValue2,2);
      		newHighVal = parseFloat(newValue2).toFixed(1);
      		
        	$("#input_slider").siblings(".highValue").text(newHighVal);
      	}
    });
    // 경고
    $('#input_slider').children().last().children().first().keypress(function(e){
      	if(e.keyCode==13){
      		var newValue = $('#input_slider').children().last().children().first().val(); // 경고
      		var newValue2 = $('#input_slider').children().first().children().first().val(); // 위험
      		
      		slider.move2(newValue,newValue2,1);
      		newWarnVal = parseFloat(newValue).toFixed(1);
      		
        	$("#input_slider").siblings(".warnValue").text(newWarnVal);
      	}
    });
    
    //slider = d3.slider("slider").min(0).max(100).tickValues([10,20,30,40,50,60,70,80,90,100]).showRange(true).tickFormat(tickFormatter).value(10,90);

    //d3.select('#slider').call(slider);
    
    
    zbxApi.getTrigger.get(hostId, "", "Total Used CPU").then(function(data){
        var resultData = zbxApi.getTrigger.success(data);
        if(resultData.result[0].description.indexOf("Warning") != -1){
        	
        	highTriggerId = resultData.result[1].triggerid;
        	warnTriggerId = resultData.result[0].triggerid;
        	highExprArr = resultData.result[1].expression.split(">=");
        	warnExprArr = resultData.result[0].expression.split(">=");
        	itemKey = resultData.result[0].items[0].key_;
        	hostName = resultData.result[0].hosts[0].host;
        	status = resultData.result[0].status;
        	
        	oldHighValue = parseFloat(highExprArr[1]).toFixed(1);
            oldWarnValue = parseFloat(warnExprArr[1]).toFixed(1);
            
        	 var warnExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldWarnValue + " and {" + hostName + ":" + itemKey + ".last()}<" + oldHighValue;
             var highExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldHighValue;
             
        	$("#input_slider").siblings(".warnTriggerInfo").text(warnTriggerId + "\n" + warnExpression);
        	$("#input_slider").siblings(".highTriggerInfo").text(highTriggerId + "\n" + highExpression);
        	$("#input_slider").siblings(".hostName").text(hostName);
        	$("#input_slider").siblings(".itemKey").text(itemKey);
        	$("#input_slider").siblings(".warnValue").text(oldWarnValue);
        	$("#input_slider").siblings(".highValue").text(oldHighValue);
        	$("#input_slider").siblings(".warnTriggerId").text(warnTriggerId);
        	$("#input_slider").siblings(".highTriggerId").text(highTriggerId);
        }else{
        	highTriggerId = resultData.result[0].triggerid;
            warnTriggerId = resultData.result[1].triggerid;
            highExprArr = resultData.result[0].expression.split(">=");
            warnExprArr = resultData.result[1].expression.split(">=");
            itemKey = resultData.result[0].items[0].key_;
            hostName = resultData.result[0].hosts[0].host;
            status = resultData.result[0].status;
            oldHighValue = parseFloat(highExprArr[1]).toFixed(1);
            oldWarnValue = parseFloat(warnExprArr[1]).toFixed(1);
            
            
            var warnExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldWarnValue + " and {" + hostName + ":" + itemKey + ".last()}<" + oldHighValue;
            var highExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldHighValue;
           
        	$("#input_slider").siblings(".warnTriggerInfo").text(warnTriggerId + "\n" + warnExpression);
        	$("#input_slider").siblings(".highTriggerInfo").text(highTriggerId + "\n" + highExpression);
        	$("#input_slider").siblings(".hostName").text(hostName);
        	$("#input_slider").siblings(".itemKey").text(itemKey);
        	$("#input_slider").siblings(".warnValue").text(oldWarnValue);
        	$("#input_slider").siblings(".highValue").text(oldHighValue);
        	$("#input_slider").siblings(".warnTriggerId").text(warnTriggerId);
        	$("#input_slider").siblings(".highTriggerId").text(highTriggerId);
        	
        	
        }
        slider = d3.slider("slider").min(0).max(100).tickValues([10,20,30,40,50,60,70,80,90,100]).showRange(true).tickFormat(tickFormatter).value(oldWarnValue,oldHighValue);
        d3.select('#slider').call(slider);
        
        if(status == "1"){
        	$("#slider").siblings("h3").children().first().attr('checked', false);

        	$("#slider").css("pointer-events","none");
        	$("#slider rect").filter(".d3slider-rect-value").attr("class","d3slider-rect-value_disable");
        	$("#slider rect").filter(".d3slider-rect-value2").attr("class","d3slider-rect-value2_disable");
        	$("#slider rect").filter(".d3slider-rect-value3").attr("class","d3slider-rect-value3_disable");
        }
        
        slider.setInputBox(oldHighValue,1);
        slider.setInputBox(oldWarnValue,2);
        
        if(oldHighValue > oldWarnValue){
        	slider.move2(oldWarnValue,oldHighValue,2);
            slider.move2(oldWarnValue,oldHighValue,1);
        }else{
        	slider.move2(oldWarnValue,oldHighValue,1);
        	slider.move2(oldWarnValue,oldHighValue,2);
        }
    });
}


function showMemAlertSettingView(hostId){
	
	var warnExpression, highExpression = null;
    var warnExprArr = [];
    var highExprArr = [];
    var oldWarnValue = 30;
    var oldHighValue = null;
    var highTriggerId,warnTriggerId = null;
    var newHighVal,newWarnVal = null;
    var hostName = null;
    var highItemKey,warnItemKey = null;
    var itemKey = null;
    var status = null;
    
    var formatter = d3.format(",.1f");
    var tickFormatter = function(d) {
      return formatter(d) + " %";
    }
    
    
    
    // 위험
    $('#input_slider22').children().first().children().first().keypress(function(e){
      	if(e.keyCode==13){
      		var newValue = $('#input_slider22').children().last().children().first().val(); // 경고
      		var newValue2 = $('#input_slider22').children().first().children().first().val(); // 위험
      		slider22.move2(newValue,newValue2,2);
      		newHighVal = parseFloat(newValue2).toFixed(1);
      		$("#input_slider22").siblings(".highValue").text(newHighVal);
      	}
      	
    });
    // 경고
    $('#input_slider22').children().last().children().first().keypress(function(e){
      	if(e.keyCode==13){
      		var newValue = $('#input_slider22').children().last().children().first().val(); // 경고
      		var newValue2 = $('#input_slider22').children().first().children().first().val(); // 위험
      		
      		slider22.move2(newValue,newValue2,1);
      		newWarnVal = parseFloat(newValue).toFixed(1);
      		$("#input_slider22").siblings(".warnValue").text(newWarnVal);
      	}
    });  
    

    
    zbxApi.getTrigger.get(hostId, "", "Total Used Memory").then(function(data){
        var resultData = zbxApi.getTrigger.success(data);

        hostName = resultData.result[0].hosts[0].host;
        
        if(resultData.result[0].description.indexOf("Warning") != -1){
        	highTriggerId = resultData.result[1].triggerid;
        	warnTriggerId = resultData.result[0].triggerid;
        	highExprArr = resultData.result[1].expression.split(">=");
        	warnExprArr = resultData.result[0].expression.split(">=");
        	itemKey = resultData.result[0].items[0].key_;
        	status = resultData.result[0].status;
        	
        	oldHighValue = parseFloat(highExprArr[1]).toFixed(1);
        	oldWarnValue = parseFloat(warnExprArr[1]).toFixed(1);
              
        	var warnExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldWarnValue + " and {" + hostName + ":" + itemKey + ".last()}<" + oldHighValue;
            var highExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldHighValue;
            
        	$("#input_slider22").siblings(".warnTriggerInfo").text(warnTriggerId + "\n" + warnExpression);
        	$("#input_slider22").siblings(".highTriggerInfo").text(highTriggerId + "\n" + highExpression);
        	$("#input_slider22").siblings(".hostName").text(hostName);
        	$("#input_slider22").siblings(".itemKey").text(itemKey);
        	$("#input_slider22").siblings(".warnValue").text(oldWarnValue);
        	$("#input_slider22").siblings(".highValue").text(oldHighValue);
        	$("#input_slider22").siblings(".warnTriggerId").text(warnTriggerId);
        	$("#input_slider22").siblings(".highTriggerId").text(highTriggerId);
        	
        }else{
        	highTriggerId = resultData.result[0].triggerid;
            warnTriggerId = resultData.result[1].triggerid;
            highExprArr = resultData.result[0].expression.split(">=");
            warnExprArr = resultData.result[1].expression.split(">=");
            itemKey = resultData.result[0].items[0].key_;
            status = resultData.result[0].status;
            
            oldHighValue = parseFloat(highExprArr[1]).toFixed(1);
            oldWarnValue = parseFloat(warnExprArr[1]).toFixed(1);
            
            var warnExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldWarnValue + " and {" + hostName + ":" + itemKey + ".last()}<" + oldHighValue;
            var highExpression = "{" + hostName + ":" + itemKey + ".last()}>=" + oldHighValue;
            
        	$("#input_slider22").siblings(".warnTriggerInfo").text(warnTriggerId + "\n" + warnExpression);
        	$("#input_slider22").siblings(".highTriggerInfo").text(highTriggerId + "\n" + highExpression);
        	$("#input_slider22").siblings(".hostName").text(hostName);
        	$("#input_slider22").siblings(".itemKey").text(itemKey);
        	$("#input_slider22").siblings(".warnValue").text(oldWarnValue);
        	$("#input_slider22").siblings(".highValue").text(oldHighValue);
        	$("#input_slider22").siblings(".warnTriggerId").text(warnTriggerId);
        	$("#input_slider22").siblings(".highTriggerId").text(highTriggerId);
        }
        

        slider22 = d3.slider("slider22").min(0).max(100).tickValues([10,20,30,40,50,60,70,80,90,100]).showRange(true).tickFormat(tickFormatter).value(oldWarnValue,oldHighValue);
        d3.select('#slider22').call(slider22);
        
        if(status == "1"){
        	$("#slider22").siblings("h3").children().first().attr('checked', false);
        	$("#slider22").css("pointer-events","none");
        	$("#slider22 rect").filter(".d3slider-rect-value").attr("class","d3slider-rect-value_disable");
        	$("#slider22 rect").filter(".d3slider-rect-value2").attr("class","d3slider-rect-value2_disable");
        	$("#slider22 rect").filter(".d3slider-rect-value3").attr("class","d3slider-rect-value3_disable");
        }
        
        slider22.setInputBox(oldHighValue,1);
        slider22.setInputBox(oldWarnValue,2);
        
        if(oldHighValue > oldWarnValue){
        	 slider22.move2(oldWarnValue,oldHighValue,2);
             slider22.move2(oldWarnValue,oldHighValue,1);
        }else{
        	slider22.move2(oldWarnValue,oldHighValue,1);
        	slider22.move2(oldWarnValue,oldHighValue,2);
        }
        
        
    });
  
    
}