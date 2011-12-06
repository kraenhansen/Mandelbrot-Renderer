function MandelbrotRenderer(canvasElement, informationElement) {
	this.element = canvasElement;
	this.informationElement = informationElement;
	this.context = this.element.getContext("2d");
	this.reset();

	this.workersSquareSize = 100;
	var numberOfWorkers = 4;
	var renderer = this;
	this.workers = [];
	for(var w = 0; w < numberOfWorkers; w++) {
		this.workers[w] = new Worker("mandelbrot.js");
		this.workers[w].onmessage = function(event) {
			if(event.data.success == true) {
				renderer.context.putImageData(event.data.imageData, event.data.x, event.data.y);
			}
		};
	}
	this.nextWorker = -1;
}

MandelbrotRenderer.prototype.reset = function() {
	this.center = new Complex(-0.5, 0);
	this.scale = 200;
	this.generatePalette(256);
};

MandelbrotRenderer.prototype.getNextWorker = function() {
	this.nextWorker = (this.nextWorker+1) % this.workers.length;
	return this.workers[this.nextWorker];
};

MandelbrotRenderer.prototype.redraw = function(onlyInformation) {
	$(this.informationElement).html("Center = "+this.center.toString()+"<br />Scale = "+this.scale.toString()+"<br /># Colors = "+this.palette.length.toString());

	if(typeof(onlyInformation) != "boolean" || !onlyInformation) {
		for(var y = 0; y < this.height; y+=this.workersSquareSize) {
			for(var x = 0; x < this.width; x+=this.workersSquareSize) {
				var imageData = this.context.getImageData(x, y, Math.min(this.width-x, this.workersSquareSize), Math.min(this.height-y, this.workersSquareSize));
				this.getNextWorker().postMessage({
					action: "draw",
					x: x,
					y: y,
					center: this.center,
					scale: this.scale,
					fullWidth: this.width,
					fullHeight: this.height,
					palette: this.palette,
					imageData: imageData
				});
			}
		}
	}
};

MandelbrotRenderer.prototype.updated = function() {
	this.element.width = $(document.body).width();
	this.element.height = $(document.body).height();
	this.width = $(this.element).width();
	this.height = $(this.element).height();
	this.redraw();
};

MandelbrotRenderer.prototype.generatePalette = function(numberOfColors) {
	this.palette = [{
		red: 0,
		blue: 0,
		green: 0,
		alpha: 255
	}];
	for(var c = 1; c < numberOfColors; c++) {
		var color = new one.color.HSV(c/numberOfColors, 0.8, 0.8, 1).rgb();
		this.palette[c] = {
			red: Math.round(color._red*255),
			green: Math.round(color._green*255),
			blue: Math.round(color._blue*255),
			alpha: Math.round(color._alpha*255)
		};
	}
};

MandelbrotRenderer.prototype.viewToWorld = function(x, y) {
	return MandelbrotRenderer.viewToWorldHelper(this.center, this.scale, this.width, this.height, x, y); 
};

MandelbrotRenderer.prototype.worldToView = function(x, y) {
	return MandelbrotRenderer.worldToViewHelper(this.center, this.scale, this.width, this.height, x, y); 
};

MandelbrotRenderer.viewToWorldHelper = function(center, scale, width, height, x, y) {
	var result = {x: x-width/2, y: y-height/2};
	result.x /= scale;
	result.y /= scale;
	result.y *= -1;
	return Complex.add(new Complex(result.x, result.y), center);
};

MandelbrotRenderer.worldToViewHelper = function(center, scale, width, height, c) {
	var temp = Complex.add(center, c);
	var result = {x: temp.x, y: temp.y};
	result.x *= scale;
	result.y *= scale;
	result.y *= -1;
	result.x += width/2;
	result.y += height/2;
	return result;
};

if(typeof(importScripts) != "undefined") {
	// Running as a worker!
	importScripts("complex.js");
	
	self.onmessage = function (event) {
		if(event.data.action == "draw") {
			for(var x = 0; x < event.data.imageData.width; x++) {
				for(var y = 0; y < event.data.imageData.height; y++) {
					var offset = (x + y*event.data.imageData.width)*4;
					var c = MandelbrotRenderer.viewToWorldHelper(
						event.data.center,
						event.data.scale,
						event.data.fullWidth,
						event.data.fullHeight,
						x+event.data.x,
						y+event.data.y
					);
					Zn = Complex.zero;
					
					if(c.magnitude() >= 2) {
						color = event.data.palette[1];
					} else {
						color = event.data.palette[0];
						for(var n = 1; n < event.data.palette.length; n++) {
							var Zn2 = Complex.multiply(Zn, Zn);
							Zn = Complex.add(Zn2, c);
							if(Zn.magnitude() >= 2) {
								color = event.data.palette[n];
								break;
							}
						}
					}
					
					event.data.imageData.data[offset+0] = color.red;
					event.data.imageData.data[offset+1] = color.green;
					event.data.imageData.data[offset+2] = color.blue;
					event.data.imageData.data[offset+3] = color.alpha;
				}
			}
			
			postMessage({
				success: true,
				imageData: event.data.imageData,
				x: event.data.x,
				y: event.data.y
			});
		} else {
			postMessage({
				success: false,
				error: "Unimplemented action!"
			});
		}
	};
}

