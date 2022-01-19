// FROM PROCESS COMPENDIUM

let circleNum = 10;
let radiusMin, radiusMax;

let globalAlpha = 20;

let mainB = [249, 249, 252];

let bug;
let currentAngle;

// Ellipses touching (form 1)
// Lines intersecting (form 2)
let form = 1;

let circles = [];

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight);
	cnv.parent('myContainer');

	background(mainB);
	currentAngle = (PI * 2) / 36;

	radiusMin = width / 50;
	radiusMax = width / 20;
	strokeWeight(0.5);

	// debug canvas
	bug = createGraphics(windowWidth, windowHeight);
	// main canvas

	CircleInit();
}

function windowResized() {
	bug.remove();

	let cnv = createCanvas(windowWidth, windowHeight);
	cnv.parent('myContainer');

	bug = createGraphics(windowWidth, windowHeight);
}

function draw() {
	bug.background(mainB);

	for (let i = 0; i < circles.length; i++) {
		circles[i].update();
	}

	// click to see the debug mode
	image(bug, 0, 0, bug.width, bug.height);
}

function CircleInit() {
	// clear array
	circles = [];

	// fill array with new circle instances
	// spawn circles in the center of the origins
	for (let i = 0; i < circleNum; i++) {
		circles[i] = new Elements(
			random(radiusMax, width - radiusMax),
			random(radiusMax, height - radiusMax),
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

		// this.angle = random(currentAngle, currentAngle)

		this.linePoints = {
			x1: -this.radius + this.x,
			y1: 0 + this.y,
			x2: this.radius + this.x,
			y2: 0 + this.y,
		};
	}

	update() {
		this.behaviour1();
		// this.behaviour2();
		// this.behaviour3();
		// this.behaviour4();
		this.behaviour5();
		this.behaviour6();
		// this.behaviour7();

		this.debug();
	}

	debug() {
		// all renderable functions are on the bug canvas
		bug.stroke(255 - mainB[0], 255 - mainB[1], 255 - mainB[2]);
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
			if (this.formTest(circles[i])) {
				bug.line(this.x, this.y, circles[i].x, circles[i].y);
			}
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
		if (this.x < this.radius) this.x = this.radius;
		if (this.y < this.radius) this.y = this.radius;
		if (this.x > width - this.radius) this.x = width - this.radius;
		if (this.y > height - this.radius) this.y = height - this.radius;
	}

	behaviour3() {
		// While touching another, change direction
		for (let i = 0; i < circles.length; i++) {
			if (circles[i] != this) {
				if (this.formTest(circles[i])) {
					this.heading += currentAngle / 50;
				}
			}
		}
	}

	behaviour4() {
		// While touching another, move away from its centre
		for (let i = 0; i < circles; i++) {
			if (circles[i] != this) {
				if (this.formTest(circles[i])) {
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
				if (this.formTest(circles[i])) {
					let other = circles[i];
					// Calculate the direction towards the other circle using the `atan2()` function
					let direction = atan2(other.y - this.y, other.x - this.x);
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
			this.heading += random(-currentAngle / 5, currentAngle / 5);
		}
	}

	formTest(other) {
		if (form === 1) return this.touching(other);
		else return this.intersects(other);
	}

	touching(other) {
		// 	Detect if circles are touching
		return this.distance(other) < this.radius + other.radius;
	}

	distance(other) {
		// 	calculate the distance between circles
		return dist(this.x, this.y, other.x, other.y);
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
}

// makes p5.js better for mobile
function touchStarted() {
	return false;
}

function touchMoved() {
	return false;
}

function touchEnded() {
	return false;
}
