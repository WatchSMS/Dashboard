 d3.slider = function module(id) {
  "use strict";
  
  var div, min = 0, max = 100, svg, svgGroup, value, value2, classPrefix, axis, 
  height=40, rect,
  rectHeight = 12,
  tickSize = 6,
  margin = {top: 25, right: 25, bottom: 15, left: 25}, 
  ticks = 0, tickValues, scale, tickFormat, dragger, width, dragger2, scale2,
  range = false,
  range2 = false,
  range3 = false,
  callbackFn, stepValues, focus,
  active = null;

  function slider(selection) {
    selection.each(function() {
      div = d3.select(this).classed('d3slider', true);
      width = parseInt(div.style("width"), 10)-(margin.left 
                                                + margin.right);
      value = value || min; 
      value2 = value2 || min;
      scale = d3.scale.linear().domain([min, max]).range([0, width]).clamp(true);
      scale2 = d3.scale.linear().domain([min, max]).range([0, width]).clamp(true);

      // SVG 
      svg = div.append("svg")
      .attr("class", "d3slider-axis")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + 
            "," + margin.top + ")");

      // Range rect
      svg.append("rect")
      .attr("class", "d3slider-rect-range")
      .attr("width", width)
      .attr("height", rectHeight);
     
      // Range rect 
      if (range) {
        svg.append("rect")
        .attr("class", "d3slider-rect-value")
        .attr("width", scale(value))
        .attr("height", rectHeight);
      }
      
      if (range2) {
          svg.append("rect")
          .attr("class", "d3slider-rect-value2")
          .attr("x", scale(value2))
          .attr("width", width-scale(value2))
          .attr("height", rectHeight);
        }
      
      if (range3) {
          svg.append("rect")
          .attr("class", "d3slider-rect-value3")
          .attr("x", scale(value))
          .attr("width", scale(value2)-scale(value))
          .attr("height", rectHeight);
        }
      
      // Axis      
      var axis = d3.svg.axis()
      .scale(scale)
      .orient("bottom");
      
      if (ticks != 0) {
        axis.ticks(ticks);
        axis.tickSize(tickSize);
      } else if (tickValues) {
        axis.tickValues(tickValues);
        axis.tickSize(tickSize);
      } else {
        axis.ticks(0);
        axis.tickSize(0);
      }
      if (tickFormat) {
        axis.tickFormat(tickFormat);
      }
      
      svg.append("g")
      .attr("transform", "translate(0," + rectHeight + ")")
      .call(axis)
      //.selectAll(".tick")
      //.data(tickValues, function(d) { return d; })
      //.exit()
      //.classed("minor", true);
   
      var values = [value];
      var values2 = [value2];
      dragger = svg.selectAll(".dragger")
      .data(values)
      .enter()
      .append("g")
      .attr("class", "dragger")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      }) 
     
      dragger2 = svg.selectAll(".dragger2")
      .data(values2)
      .enter()
      .append("g")
      .attr("class", "dragger2")
      .attr("transform", function(d) {
        return "translate(" + scale(d) + ")";
      }) 
      
      var displayValue = null;
      if (tickFormat) { 
        displayValue = tickFormat(value);
      } else {
        displayValue = d3.format(",.0f")(value);
      }
      
      var displayValue2 = null;
      if (tickFormat) { 
        displayValue2 = tickFormat(value2);
      } else {
        displayValue2 = d3.format(",.0f")(value2);
      }
      
       dragger.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(displayValue);
       
      dragger.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 10)
      .attr("transform", function(d) {
        return "translate(0,6)";
      }).on("mousedown",function(){
    	  active = 1;
      });
      
      dragger.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function(d) {
        return "translate(0,6)";
      }).on("mousedown",function(){
    	  active = 1;
      });
      
      dragger2.append("text")
      .attr("x", 0)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("class", "draggertext")
      .text(displayValue2);

      dragger2.append("circle")
      .attr("class", "dragger-outer")
      .attr("r", 10)
      .attr("transform", function(d) {
        return "translate(0,6)";
      }).on("mousedown",function(){
    	  active = 2;
      });
      
      dragger2.append("circle")
      .attr("class", "dragger-inner")
      .attr("r", 4)
      .attr("transform", function(d) {
        return "translate(0,6)";
      }).on("mousedown",function(){
    	  active = 2;
      });


      // Enable dragger drag 
      var dragBehaviour = d3.behavior.drag();
      dragBehaviour.on("drag", slider.drag);
      dragger.call(dragBehaviour);
      dragger2.call(dragBehaviour);
      
      // Move dragger on click 
      svg.on("click", slider.click);

    });
    
  }

  slider.draggerTranslateFn = function() {
    return function(d) {
      return "translate(" + scale(d) + ")";
    }
  }

  slider.click = function() {
	 
    var pos = d3.event.offsetX || d3.event.layerX;
    console.log("----------------------------");
    console.log(d3.event.offsetX);
    console.log(d3.event.layerX);
    console.log(pos);
    console.log("----------------------------");
    slider.move(pos);
  }

  slider.drag = function() {
    var pos = d3.event.x;
    slider.move(pos+margin.left);
  }

  slider.move = function(pos) {
    var l,u;
    var newValue = scale.invert(pos - margin.left);
    var newValue2 = scale.invert(pos - margin.left);
    console.log("---------------");
    console.log(newValue);
    console.log(newValue2);
    console.log("---------------");
    // find tick values that are closest to newValue
    // lower bound
    if (stepValues != undefined) {
    	console.log("not undef");
      l = stepValues.reduce(function(p, c, i, arr){
        if (c < newValue) {
          return c;
        } else {
          return p;
        }
      });

      // upper bound
      if (stepValues.indexOf(l) < stepValues.length-1) {
        u = stepValues[stepValues.indexOf(l) + 1];
      } else {
        u = l;
      }
      // set values
      var oldValue = value;
      value = ((newValue-l) <= (u-newValue)) ? l : u;
      var oldValue2 = value2;
      value = ((newValue2-l) <= (u-newValue2)) ? l : u;
    } else {
    	console.log("undef");
      var oldValue = value;
      value = newValue;
      var oldValue2 = value2;
      value2 = newValue2;
    }
    var values = [value];
    var values2 = [value2];
    
    
    // Move dragger
    if(active == 1){
    	if(scale(value) > svg.select(".d3slider-rect-value2").attr("x")){
    		return false;
        }
    	svg.selectAll(".dragger").data(values)
        .attr("transform", function(d) {
          return "translate(" + scale(d) + ")";
        });
    	var displayValue = null;
        if (tickFormat) { 
          displayValue = tickFormat(value);
        } else {
          displayValue = d3.format(",.0f")(value);
        }
        svg.selectAll(".dragger").select("text")
        .text(displayValue);
        
        if (range) { 
    		svg.selectAll(".d3slider-rect-value")
            .attr("width", scale(value));
            
            var midRangeWidth = svg.select(".d3slider-rect-value2").attr("x") - scale(value);
            svg.selectAll(".d3slider-rect-value3")
            .attr("x", scale(value))
            .attr("width", midRangeWidth);
          }
        $("#input_" + id).children().last().children().first().val(displayValue.replace(/\%/g,''));
        $("#" + id).siblings(".warnValue").text(displayValue.replace(/\%/g,''));
        
    }else if(active == 2){
    	if(scale(value2) < svg.select(".d3slider-rect-value").attr("width")){
    		return false;
        }
    	
    	svg.selectAll(".dragger2").data(values2)
        .attr("transform", function(d) {
          return "translate(" + scale(d) + ")";
        });
    	var displayValue2 = null;
        if (tickFormat) { 
          displayValue2 = tickFormat(value2);
        } else {
          displayValue2 = d3.format(",.0f")(value2);
        }
        svg.selectAll(".dragger2").select("text")
        .text(displayValue2);
        
        if (range2) { 
        	var rightRangeWidth = width-scale(value2);
            svg.selectAll(".d3slider-rect-value2")
            .attr("x", scale(value2))
            .attr("width", rightRangeWidth);
           
            var midRangeWidth = scale(value2) - svg.select(".d3slider-rect-value").attr("width");
            svg.selectAll(".d3slider-rect-value3")
            .attr("width", midRangeWidth);
            
          }
        $("#input_" + id).children().first().children().first().val(displayValue2.replace(/\%/g,''));
        $("#" + id).siblings(".highValue").text(displayValue2.replace(/\%/g,''));
    }

    if (callbackFn) {
      callbackFn(slider);
    }
    
    
    
  }
  
  
  
  slider.move2 = function(newValue, newValue2, _active) {
	    var l,u;
	    active = _active;
	    // find tick values that are closest to newValue
	    // lower bound

	    console.log("newValue");
	    console.log(newValue);
	    console.log("newValue2");
	    console.log(newValue2);
	    if (stepValues != undefined) {
		      l = stepValues.reduce(function(p, c, i, arr){
		        if (c < newValue) {
		          return c;
		        } else {
		          return p;
		        }
		      });
	
		      // upper bound
		      if (stepValues.indexOf(l) < stepValues.length-1) {
		        u = stepValues[stepValues.indexOf(l) + 1];
		      } else {
		        u = l;
		      }
		      // set values
		      var oldValue = value;
		      value = ((newValue-l) <= (u-newValue)) ? l : u;
		      var oldValue2 = value2;
		      value = ((newValue2-l) <= (u-newValue2)) ? l : u;
	    } else {
		      var oldValue = value;
		      value = newValue;
		      var oldValue2 = newValue2;
		      value2 = newValue2;
	    }
	    var values = [value];
	    var values2 = [newValue2];
	    
	    
	    // Move dragger
	    if(active == 1){
	    	if(scale(value) > svg.select(".d3slider-rect-value2").attr("x")){
	    		return false;
	        }
	    	svg.selectAll(".dragger").data(values)
	        .attr("transform", function(d) {
	          return "translate(" + scale(d) + ")";
	        });
	    	var displayValue = null;
	        if (tickFormat) { 
	          displayValue = tickFormat(value);
	        } else {
	          displayValue = d3.format(",.0f")(value);
	        }
	        svg.selectAll(".dragger").select("text")
	        .text(displayValue);
	        
	        if (range) { 
	    		svg.selectAll(".d3slider-rect-value")
	            .attr("width", scale(value));
	            
	            var midRangeWidth = svg.select(".d3slider-rect-value2").attr("x") - scale(value);
	            svg.selectAll(".d3slider-rect-value3")
	            .attr("x", scale(value))
	            .attr("width", midRangeWidth);
	          }
	          
	        
	    }else if(active == 2){

	    	if(scale(newValue2) < svg.select(".d3slider-rect-value").attr("width")){
	    		return false;
	        }
	    	svg.selectAll(".dragger2").data(values2)
	        .attr("transform", function(d) {
	          return "translate(" + scale(d) + ")";
	        });
	    	var displayValue2 = null;
	        if (tickFormat) { 
	          displayValue2 = tickFormat(newValue2);
	        } else {
	          displayValue2 = d3.format(",.0f")(newValue2);
	        }
	        svg.selectAll(".dragger2").select("text")
	        .text(displayValue2);
	        if (range2) { 
	        	var rightRangeWidth = width-scale(newValue2);
	            svg.selectAll(".d3slider-rect-value2")
	            .attr("x", scale(newValue2))
	            .attr("width", rightRangeWidth);
	           
	            var midRangeWidth = scale(newValue2) - svg.select(".d3slider-rect-value").attr("width");
	            svg.selectAll(".d3slider-rect-value3")
	            .attr("width", midRangeWidth);
	            
	          }
	    }

	    if (callbackFn) {
	      callbackFn(slider);
	    }
	  }
  
  
  slider.setInputBox = function(setValue, boxNum) {
	  
	  if(boxNum==1){

		  $("#input_" + id).children().first().children().first().val(setValue);
	  }else{
		  $("#input_" + id).children().last().children().first().val(setValue);
	  }
  }
  
  
  

  // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  };

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  };

  slider.classPrefix = function(_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return slider;
  }

  slider.tickValues = function(_) {
    if (!arguments.length) return tickValues;
    tickValues = _;
    return slider;
  }
 
  slider.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return slider;
  }

  slider.stepValues = function(_) {
    if (!arguments.length) return stepValues;
    stepValues = _;
    return slider;
  }
  
  slider.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return slider;
  } 

  slider.value = function(_,__) {
	  console.log("function slider.value");
    if (!arguments.length) return value;
    value = _;
    value2 = __;
    console.log("value");
    console.log(value);
    console.log("value2");
    console.log(value2);
    
    return slider;
  } 
  
  slider.showRange = function(_) {
    if (!arguments.length) return range;
    range = _;
    range2 = _;
    range3 = _;
    return slider;
  } 

  slider.callback = function(_) {
    if (!arguments.length) return callbackFn;
    callbackFn = _;
    return slider;
  }

  slider.setValue = function(newValue) {
    var pos = scale(newValue) + margin.left;
    slider.move(pos);
  }

  slider.mousemove = function() {
    var pos = d3.mouse(this)[0];
    var val = slider.getNearest(scale.invert(pos), stepValues);
    focus.attr("transform", "translate(" + scale(val) + ",0)");
    focus.selectAll("text").text(val);
  }
  
  slider.getNearest = function(val, arr) {
    var l = arr.reduce(function(p, c, i, a){
      if (c < val) {
        return c;
      } else {
        return p;
      }
    });
    var u = arr[arr.indexOf(l)+1];
    var nearest = ((value-l) <= (u-value)) ? l : u;
    return nearest;
  }

  slider.destroy = function() {
    div.selectAll('svg').remove();
    return slider;
  }

  return slider;

};



