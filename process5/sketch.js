// FROM PROCESS COMPENDIUM

// Process 5

// A rectangular surface filled with varying sizes of Element 1.
// Draw the perimeter of each Element as a black line and the center
// as a white dot. Draw a gray line from the centers of Elements that are touching.

let circleNum = 50;
let radiusMin = 20;
let radiusMax = 50;

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
		circles[i] = new Circle(
			random(0, width),
			random(0, height),
			random(radiusMin, radiusMax)
		);
	}
}

class Circle {
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;

		this.heading = random(PI * 2);
		this.speed = 1;
	}

	update() {
		this.behaviour1();
		this.behaviour2();
		this.behaviour3();
		this.behaviour4();

		// this.behaviour5();
		// this.behaviour6();
		// this.behaviour7();

		this.debug();
		this.form1();
		// this.form2();
	}

	debug() {
		// all renderable functions are on the bug canvas
		bug.stroke(0);
		bug.ellipseMode(RADIUS);

		bug.push();

		bug.translate(this.x, this.y);
		bug.rotate(this.heading);
		bug.noFill();

		bug.ellipse(0, 0, this.radius, this.radius);

		bug.line(0, 0, this.radius, 0);
		bug.pop();

		bug.stroke(192, 0, 0, 255);

		for (let i = 0; i < circles.length; i++) {
			if (this.touching(circles[i])) {
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
				if (this.touching(circles[i])) {
					this.heading += random(-currentAngle, currentAngle);
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
	form1() {
		main.ellipseMode(RADIUS);
		main.noFill();
		main.stroke(0, 50);
		main.ellipse(this.x, this.y, this.radius);

		main.fill(255);
		main.noStroke();
		main.ellipse(this.x, this.y, 2);

		for (let i = 0; i < circles.length; i++) {
			if (this.touching(circles[i])) {
				// Make sure that cirlces are not being draw on top of eachother
				if (this.distance(circles[i]) > 0) {
					// Calculate the grey value using the map function based on the distance between the circles
					main.stroke(120);
					// Draw a line between the centres of the circles
					main.line(this.x, this.y, circles[i].x, circles[i].y);
				}
			}
		}
	}

	form2() {
		main.noFill();
		for (let i = 0; i < circles.length; i++) {
			if (this.touching(circles[i])) {
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
						50
					);

					// find the midpoint between the circle objects that interect
					let x = lerp(this.x, circles[i].x, 0.5);
					let y = lerp(this.y, circles[i].y, 0.5);

					main.fill(
						255,
						map(
							this.distance(circles[i]),
							0,
							this.radius + circles[i].radius,
							0,
							255
						),
						map(
							this.distance(circles[i]),
							0,
							this.radius + circles[i].radius,
							0,
							255
						),
						50
					);
					// Draw an ellipse with the radius of the distance between circles
					main.ellipse(
						x,
						y,
						this.distance(circles[i]),
						this.distance(circles[i])
					);
				}
			}
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
