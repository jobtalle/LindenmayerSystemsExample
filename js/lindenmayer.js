function PathShape() {
	this.x = [];
	this.y = [];
	this.xMin = 0;
	this.yMin = 0;
	this.xMax = 0;
	this.yMax = 0;
}

PathShape.prototype = {
	add(x, y) {
		if(x < this.xMin)
			this.xMin = x;
		else if(x > this.xMax)
			this.xMax = x;
		
		if(y < this.yMin)
			this.yMin = y;
		else if(y > this.yMax)
			this.yMax = y;
		
		this.x.push(x);
		this.y.push(y);
	},
	
	render(canvas) {
		var context = canvas.getContext("2d");
		var xShift = 0;
		var yShift = 0;
		var width = this.xMax - this.xMin;
		var height = this.yMax - this.yMin;
		var xScale = canvas.width / width;
		var yScale = canvas.height / height;
		var aspect = canvas.width / canvas.height;
		var scale = Math.min(xScale, yScale);
		
		if(xScale < yScale)
			yShift = (height * aspect - width) / 2;
		else
			xShift = (width - height * aspect) / 2;
		
		context.strokeStyle = "black";
		context.lineWidth = 1 / scale;
		
		context.setTransform(
			scale, 0, 0,
			scale, scale * -(this.xMin + xShift), scale * -(this.yMin + yShift));
		context.beginPath();
		context.moveTo(0, 0);
		
		for(var i = 0; i < this.x.length; ++i)
			context.lineTo(this.x[i], this.y[i]);
		
		context.stroke();
	}
}

function Lindenmayer(axiom) {
	this.getAxiom();
	this.getAngle();
	this.getIterations();
	this.getRules();
}

Lindenmayer.prototype = {
	DEG_TO_RAD: 0.017453292519943,
	ITERATIONS_MIN: 0,
	ITERATIONS_MAX: 8,
	RULE_COUNT: 4,
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
			var components = rule.split("=");
			
			this.rules[components[0]] = components[1];
		}
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
		var angle = 0;
		var x = 0;
		var y = 0;
		
		for(var i = 0; i < this.axiom.length; ++i) {
			switch(this.axiom[i]) {
				case "+":
					angle -= this.angle;
					break;
				case "-":
					angle += this.angle;
					break;
				default:
					var rads = angle * this.DEG_TO_RAD;
				
					x += Math.cos(rads);
					y += Math.sin(rads);
					
					path.add(x, y);
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
		
		this.getPath().render(canvas);
	}
}

function renderAxiom() {
	var lindenmayer = new Lindenmayer();
	
	lindenmayer.applyRules(1);
	lindenmayer.render();
}

function renderAll() {
	var lindenmayer = new Lindenmayer();
	
	lindenmayer.applyRules();
	lindenmayer.render();
}