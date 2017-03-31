var createArrow = function(context) {
    // endType - which end of path to attach arrowhead
    // 0=begin, 1=end of path, 2=both ends
    
    // shapeType - what shape arrowhead should be
    // 0=filled triangle

    // TBD pass in scale, allow for different ends for arrowhead
    
    var doc = context.document;
    var selectedLayers = context.selection;
    var selectedCount = selectedLayers.count();
    
    var layer;
    var bezier;


    if (selectedCount == 0) {
	doc.showMessage('Oops, no selection.');
    } else {
	for (var i = 0; i < selectedCount; i++) {
    	    layer = selectedLayers[i];
	    
	    //check that this layer is a shape
	    if( layer && layer.isKindOfClass(MSShapeGroup) ){
	
		//split line depending on how curvy it is, with at least 2 points
    		var path = layer.bezierPathWithTransforms();
		var count = path.elementCount()*2;

		//hacky way of avoiding weirdly angled arrowheads for tight curves
		//handle spirals by choosing the greater number
		if (count<50) {
		    count=50;
		}
		var length = path.length();
		var step = length/count;
		
		//but also make sure a step is at minimum the arrowhead size
		var lineThickness = layer.style().border().thickness();
		var scale = 1+(lineThickness/5);
		if (step < (scale*7)) {
		    step = scale*7;
		}
	    
		//choose which endpoint, 0 or length.
		//defaults to end right now, TBD: allow choice
		var endPoint = path.pointOnPathAtLength(length);
		var linePoint = path.pointOnPathAtLength(length-step);
		var angle = 360/(2*Math.PI) * (Math.atan2(linePoint.y - endPoint.y, linePoint.x - endPoint.x));
		
		//0 - triangle as arrowhead
		//TBD: different shapes
		var headPath = NSBezierPath.bezierPath();
		headPath.moveToPoint(NSMakePoint(0,7));
		headPath.lineToPoint(NSMakePoint(-14,0));
		headPath.lineToPoint(NSMakePoint(0,-7));
		headPath.closePath();
	    
		var headShape = MSShapeGroup.shapeWithBezierPath(headPath);
	    
		//scale to lineweight
		//TBD: user input
		var lineThickness = layer.style().border().thickness();
		var scale = 1+(lineThickness/5);
		headShape.frame().setWidth(Math.floor(headShape.frame().width()*scale));
		headShape.frame().setHeight(Math.floor(headShape.frame().height()*scale));
		
		//rotate
		headShape.setRotation(-1*angle);

		//move center to endpoint of line
		headShape.frame().setX(endPoint.x - headShape.frame().width()/2);
		headShape.frame().setY(endPoint.y - headShape.frame().height()/2);
		
		//color same as line	    
		var fill = headShape.style().fills().addNewStylePart();
		fill.color = layer.style().borders().firstObject().color();
		
		//add to layer and group it with path
		headShape.setName('Arrowhead');
		var gr = layer.parentGroup();
		gr.addLayers([headShape]);	
		headShape.select_byExpandingSelection(true, true);

		var groupAction = doc.actionsController().actionWithName("MSGroupAction");
		groupAction.group(nil);
		gr = layer.parentGroup();
		if ((layer.name() == 'Line') || (layer.name() == 'Path')) {
		    gr.setName('Arrow');
		} else {
		    gr.setName(layer.name());
		}
		
	    } else {
		doc.showMessage('Oops, not a path.');
	    }
	    
	}
    }
}

