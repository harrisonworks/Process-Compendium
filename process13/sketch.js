// FROM PROCESS COMPENDIUM

// Process 13

// Bisect a rectangular surface and define the dividing line as the origin
// for a large group of Element 1. When each Element moves beyond the surface,
// move its position back to the origin. Draw a line from the centers of Elements
// that are touching. Set the value of the shortest possible line to black and the
// longest to white, with varying grays representing values in between.

let circleNum = 20;
let radiusMin = 30;
let radiusMax = 50;

let globalAlpha = 50;

let bug, main;
let currentAngle;

let circles = [];
let DEBUG = false;

let capturer = new CCapture({
	format: 'png',
});

function setup() {
	createCanvas(1000, 1000);

	background(250);

	currentAngle = (PI * 2) / 36;
	strokeWeight(0.5);

	// debug canvas
	bug = createGraphics(1000, 1000);
	// main canvas
	main = createGraphics(1000, 1000);

	CircleInit();
}

function draw() {
	background(250);
	bug.background(250);

	for (let i = 0; i < circles.length; i++) {
		circles[i].update();
	}

	// click to see the debug mode
	if (mouseIsPressed || DEBUG) {
		image(bug, 0, 0, 1000, 1000);
	} else {
		image(main, 0, 0, 1000, 1000);
	}

	capturer.capture(document.getElementById('defaultCanvas0'));
}

function keyPressed() {
	// r key
	// start recording
	if (keyCode === 82) {
		capturer.start();
	}

	// s key
	if (keyCode === 83) {
		capturer.save();
	}

	// e key
	// EXPORT
	if (keyCode === 69) {
		capturer.stop();
	}
}

function CircleInit() {
	// clear array
	circles = [];

	// fill array with new circle instances
	// spawn circles in the center of the origins
	for (let i = 0; i < circleNum; i++) {
		circles[i] = new Elements(
			random(width),
			height / 2,
			random(1, 3),
			random(radiusMin, radiusMax)
		);
	}
}

class Elements {
	constructor(x, y, speed, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;

		this.heading = random(PI * 2);
		this.speed = speed;

		this.grey = random(20, 200);

		this.linePoints = {
			x1: -this.radius + this.x,
			y1: 0 + this.y,
			x2: this.radius + this.x,
			y2: 0 + this.y,
		};
	}

	update() {
		this.behaviour1();
		this.behaviour2();
		this.behaviour3();
		this.behaviour4();
		// this.behaviour5();
		// this.behaviour6();
		// this.behaviour7();

		// this.originDetect();
		this.debug();
		this.renderLines();
		// this.renderCircles();
		// this.renderQuads();
	}

	debug() {
		// all renderable functions are on the bug canvas
		bug.stroke(0);
		bug.ellipseMode(RADIUS);

		bug.push();

		bug.translate(this.x, this.y);
		bug.rotate(this.heading);
		bug.noFill();

		// represents draw line radius
		bug.ellipse(0, 0, this.radius, this.radius);

		// arrow representation
		bug.line(-this.radius, 0, this.radius, 0);
		bug.ellipse(this.radius, 0, 6);
		bug.pop();

		bug.stroke(192, 0, 0, 255);
		bug.noFill();
		for (let i = 0; i < circles.length; i++) {
			// console.log(localLine, otherLine);
			if (this.touching(circles[i])) {
				// bug.quad(
				// 	this.linePoints.x1,
				// 	this.linePoints.y1,
				// 	circles[i].linePoints.x1,
				// 	circles[i].linePoints.y1,
				// 	this.linePoints.x2,
				// 	this.linePoints.y2,
				// 	circles[i].linePoints.x2,
				// 	circles[i].linePoints.y2
				// );
				bug.line(this.x, this.y, circles[i].x, circles[i].y);
			}
		}
	}

	// this is detects the intersection of lines
	intersects(other) {
		let localLine = this.linePoints;
		let otherLine = other.linePoints;

		let det, gamma, lambda;
		det =
			(localLine.x2 - localLine.x1) * (otherLine.y2 - otherLine.y1) -
			(otherLine.x2 - otherLine.x1) * (localLine.y2 - localLine.y1);
		if (det === 0) {
			return false;
		} else {
			lambda =
				((otherLine.y2 - otherLine.y1) * (otherLine.x2 - localLine.x1) +
					(otherLine.x1 - otherLine.x2) * (otherLine.y2 - localLine.y1)) /
				det;
			gamma =
				((localLine.y1 - localLine.y2) * (otherLine.x2 - localLine.x1) +
					(localLine.x2 - localLine.x1) * (otherLine.y2 - localLine.y1)) /
				det;
			return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
		}
	}

	// check if object has left origin
	originDetect() {
		// origin circle
		bug.noFill();
		bug.ellipse(this.origin.x, this.origin.y, this.origin.radius);

		if (!this.touching(this.origin)) {
			this.x = this.origin.x;
			this.y = this.origin.y;
			this.heading = random(PI * 2);
		}
	}

	behaviour1() {
		// Constant linear motion
		let dx = this.speed * cos(this.heading);
		let dy = this.speed * sin(this.heading);
		this.x += dx;
		this.y += dy;

		this.linePoints = {
			x1: this.radius * cos(this.heading) + this.x,
			y1: this.radius * sin(this.heading) + this.y,
			x2: -this.radius * cos(this.heading) + this.x,
			y2: -this.radius * sin(this.heading) + this.y,
		};
	}

	behaviour2() {
		// Constrain to surface
		if (this.x < -this.radius) this.toOrigin();
		if (this.y < -this.radius) this.toOrigin();
		if (this.x > width + this.radius) this.toOrigin();
		if (this.y > height + this.radius) this.toOrigin();
	}

	// send back to bisection
	toOrigin() {
		this.x = random(width);
		this.y = width / 2;
	}

	behaviour3() {
		// While touching another, change direction
		for (let i = 0; i < circles.length; i++) {
			if (circles[i] != this) {
				if (this.touching(circles[i])) {
					this.heading += currentAngle / 50;
				}
			}
		}
	}

	behaviour4() {
		// While touching another, move away from its centre
		for (let i = 0; i < circles; i++) {
			if (circles[i] != this) {
				if (touching(circles[i])) {
					let d = distance(circles[i]);
					let dx = (circles[i].x - this.x) / d;
					let dy = (circles[i].y - this.y) / d;
					this.x -= this.speed * dx;
					this.y -= this.speed * dy;
				}
			}
		}
	}

	behaviour5() {
		// Enter from the opposite edge after moving off the surface
		if (this.x > width + this.radius) this.x = -this.radius; //super simple if statements dont need a new block {  }
		if (this.x < -this.radius) this.x = width + this.radius;
		if (this.y > height + this.radius) this.y = -this.radius;
		if (this.y < -this.radius) this.y = height + this.radius;
	}

	behaviour6() {
		// Orient toward the direction of an Element that is touching
		for (let i = 0; i < circles.length; i++) {
			// If a circle is not this one (not itself)
			if (circles[i] != this) {
				// If the two circles are touching
				if (this.touching(circles[i])) {
					let other = circles[i];
					// Calculate the direction towards the other circle using the `atan2()` function
					let direction = atan2(other.y - y, other.x - x);
					// Calculate the difference between the current heading and the direction towards the other element
					let delta = direction - this.heading;
					// Check to see which way would be shorter to turn
					if (delta > PI) delta -= TWO_PI;
					if (delta < -PI) delta += TWO_PI;
					// Update the heading by moving 1% of the way towards the other element
					this.heading += delta * 0.01;
				}
			}
		}
	}

	behaviour7() {
		// Deviate from the current direction
		if (random(1) < 0.5) {
			this.heading += random(-currentAngle, currentAngle);
		}
	}

	// both froms will render on the main canvas
	renderLines() {
		for (let i = 0; i < circles.length; i++) {
			if (this.touching(circles[i])) {
				// Make sure that cirlces are not being draw on top of eachother
				if (this.distance(circles[i]) > 0) {
					// Calculate the grey value using the map function based on the distance between the circles
					main.stroke(
						map(
							this.distance(circles[i]),
							0,
							this.radius + circles[i].radius,
							0,
							255
						),
						globalAlpha
					);
					// Draw a line between the centres of the circles
					main.line(this.x, this.y, circles[i].x, circles[i].y);
				}
			}
		}
	}

	renderCircles() {
		main.noFill();
		for (let i = 0; i < circles.length; i++) {
			if (this.intersects(circles[i])) {
				// this fixes the random cross canvas intersections
				let circleDistance = this.distance(circles[i]);
				if (circleDistance < width / 2) {
					// Calculate the grey value using the map function based on the distance between the circles
					main.stroke(
						map(circleDistance, 0, this.radius + circles[i].radius, 255, 0),
						globalAlpha
					);

					// find the midpoint between the circle objects that interect
					let x = lerp(this.x, circles[i].x, 0.5);
					let y = lerp(this.y, circles[i].y, 0.5);

					main.ellipse(x, y, circleDistance);

					main.stroke(
						map(circleDistance, 0, this.radius + circles[i].radius, 0, 255),
						globalAlpha
					);
					main.ellipse(x, y, 5);
				}
			}
		}
	}

	// both froms will render on the main canvas
	renderQuads() {
		main.noFill();

		for (let i = 0; i < circles.length; i++) {
			if (this.intersects(circles[i])) {
				// Make sure that cirlces are not being draw on top of eachother
				if (this.distance(circles[i]) < width / 2) {
					// Calculate the grey value using the map function based on the distance between the circles
					main.stroke(
						this.grey,
						map(
							this.distance(circles[i]),
							0,
							this.radius + circles[i].radius,
							255,
							0
						)
					);

					// Draw a line between the centres of the circles
					main.quad(
						this.linePoints.x1,
						this.linePoints.y1,
						circles[i].linePoints.x1,
						circles[i].linePoints.y1,
						this.linePoints.x2,
						this.linePoints.y2,
						circles[i].linePoints.x2,
						circles[i].linePoints.y2
					);
				}
			}

			main.fill(this.grey, globalAlpha);
			main.noStroke();
			main.ellipse(this.x, this.y, 3);
		}
	}

	touching(other) {
		// 	Detect if circles are touching
		return this.distance(other) < this.radius + other.radius;
	}

	distance(other) {
		// 	calculate the distance between circles
		return dist(this.x, this.y, other.x, other.y);
	}
}
