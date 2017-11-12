function PathShape() {
	this.x = [];
	this.y = [];
	this.cuts = [];
	this.xMin = 0;
	this.yMin = 0;
	this.xMax = 0;
	this.yMax = 0;
	this.cutting = false;
}

PathShape.prototype = {
	add(state) {
		if(state.x < this.xMin)
			this.xMin = state.x;
		else if(state.x > this.xMax)
			this.xMax = state.x;
		
		if(state.y < this.yMin)
			this.yMin = state.y;
		else if(state.y > this.yMax)
			this.yMax = state.y;
		
		this.x.push(state.x);
		this.y.push(state.y);
		this.cuts.push(this.cutting);
		this.cutting = false;
	},
	
	cut() {
		this.cutting = true;
	},
	
	setPaintStyle(context, scale) {
		var color = "hsl(" + Math.random() * 360 + ", 60%, 20%)";
		
		context.lineWidth = 1.5 / scale;
		context.fillStyle = context.strokeStyle = color;
	},
	
	prepareContext(canvas, margin) {
		var context = canvas.getContext("2d");
		
		var width = this.xMax - this.xMin;
		var height = this.yMax - this.yMin;
		var xScale = (canvas.width - 2 * margin) / width;
		var yScale = (canvas.height - 2 * margin) / height;
		var aspect = canvas.width / canvas.height;
		var scale = Math.min(xScale, yScale);
		var xShift = margin * (width / canvas.width);
		var yShift = margin * (height / canvas.height);
		
		if(xScale < yScale)
			yShift -= (height * aspect - width) / 2;
		else
			xShift -= (width - height * aspect) / 2;
		
		context.setTransform(
			scale, 0, 0,
			scale, scale * -(this.xMin - xShift), scale * -(this.yMin - yShift));
			
		this.setPaintStyle(context, scale);
	},
	
	render(canvas, margin, fill) {
		var context = canvas.getContext("2d");

		this.prepareContext(canvas, margin);
		
		context.beginPath();
		context.moveTo(0, 0);
		
		for(var i = 0; i < this.x.length; ++i)
			if(this.cuts[i])
				context.moveTo(this.x[i], this.y[i]);
			else
				context.lineTo(this.x[i], this.y[i]);
		
		if(fill)
			context.fill();
		else
			context.stroke();
	}
}

function State() {
	this.x = this.y = 0;
	this.angle = -90;
	this.stack = [];
}

State.prototype = {
	DEG_TO_RAD: 0.017453292519943,
	
	rotate(angle) {
		this.angle += angle;
	},
	
	extrude() {
		var rads = this.angle * this.DEG_TO_RAD;
		
		this.x += Math.cos(rads);
		this.y += Math.sin(rads);
		
		return this;
	},
	
	push() {
		this.stack.push({
			"x": this.x,
			"y": this.y,
			"angle": this.angle});
	},
	
	pop() {
		var state = this.stack.pop();
		
		this.x = state.x;
		this.y = state.y;
		this.angle = state.angle;
	}
}

function Lindenmayer(axiom) {
	this.getAxiom();
	this.getConstants();
	this.getAngle();
	this.getIterations();
	this.getRules();
	this.getStyle();
}

Lindenmayer.prototype = {
	ITERATIONS_MIN: 0,
	ITERATIONS_MAX: 9,
	RULE_COUNT: 8,
	MARGIN: 8,
	
	getAxiom() {
		this.axiom = document.getElementById("l-axiom").value.toUpperCase();
	},
	
	getAngle() {
		this.angle = parseFloat(document.getElementById("l-angle").value);
	},
	
	getIterations() {
		this.iterations = parseInt(document.getElementById("l-iterations").value);
		
		if(this.iterations < this.ITERATIONS_MIN)
			this.iterations = this.ITERATIONS_MIN;
		
		if(this.iterations > this.ITERATIONS_MAX)
			this.iterations = this.ITERATIONS_MAX;
	},
	
	getRules() {
		this.rules = new Object();
		
		for(var rule = 1; rule <= this.RULE_COUNT; ++rule)
			this.getRule(rule);
	},
	
	getRule(index) {
		var rule = document.getElementById("l-rule-" + index).value.toUpperCase();
		
		if(rule != "") {
			var components = rule.replace("AXIOM", this.axiom).split("=");
			
			this.rules[components[0]] = components[1];
		}
	},
	
	getConstants() {
		this.constants = document.getElementById("l-constants").value;
	},
	
	getStyle() {
		this.fill = document.getElementById("l-render-fill").checked;
	},
	
	replaceAll(str, map) {
		return str.replace(new RegExp(Object.keys(map).join("|"), "gi"), function(matched) {
			return map[matched];
		});
	},
	
	applyRules(iterations = this.iterations) {
		for(var iteration = 0; iteration < iterations; ++iteration)
			this.axiom = this.replaceAll(this.axiom, this.rules);
	},
	
	getPath() {
		var path = new PathShape();
		var state = new State();
		
		for(var i = 0; i < this.axiom.length; ++i) {
			switch(this.axiom[i]) {
				case "+":
					state.rotate(-this.angle);
					break;
				case "-":
					state.rotate(this.angle);
					break;
				case "[":
					state.push();
					break;
				case "]":
					state.pop();
					
					path.cut();
					path.add(state);
					break;
				default:
					if(this.constants.indexOf(this.axiom[i]) == -1)
						path.add(state.extrude());
					break;
			}
		}
		
		return path;
	},
	
	render() {
		var canvas = document.getElementById("renderer");
		var context = canvas.getContext("2d");
		
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		this.getPath().render(canvas, this.MARGIN, this.fill);
	}
}

function render() {
	var lindenmayer = new Lindenmayer();
	
	lindenmayer.applyRules();
	lindenmayer.render();
}

function setParameters(axiom, angle, constants, iterations, rules) {
	document.getElementById("l-axiom").value = axiom;
	document.getElementById("l-angle").value = angle;
	document.getElementById("l-constants").value = constants;
	document.getElementById("l-iterations").value = iterations;
	
	for(var i = 1; i <= Lindenmayer.prototype.RULE_COUNT; ++i) {
		var ruleElement = document.getElementById("l-rule-" + i);
		
		if(i <= rules.length)
			ruleElement.value = rules[i - 1];
		else
			ruleElement.value = "";
	}
	
	render();
}