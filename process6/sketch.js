// FROM PROCESS COMPENDIUM

// These are interpretations of the behaviours and forms shown in process compendium
// Ported to P5.js

// Position three large circles on a rectangular surface.
// Set the center of each circle as the origin for a large group of Element 1.
// When an Element moves beyond the edge of its circle, return to the origin.
// Draw a line from the centers of Elements that are touching.
// Set the value of the shortest possible line to black and the longest to white,
// with varying grays representing values in between.

let circleNum = 20;
let radiusMin = 20;
let radiusMax = 50;
let originNumber = 3;

let bug, main;
let currentAngle;

let circles = [];

let DEBUG = true;

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
	if (mouseIsPressed) {
		image(bug, 0, 0, 1000, 1000);
	}
	image(main, 0, 0, 1000, 1000);

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

	// create three circles that do not overlap
	let originList = [];
	let radiusTarget = width / 4;
	let protection = 0;
	while (originList.length < originNumber) {
		// Pick a random circle

		// use the proposed raduis to create boundaries for the origin
		let randRaduis = random(radiusTarget / 2, radiusTarget);
		let circle = {
			x: random(randRaduis, width - randRaduis),
			y: random(randRaduis, height - randRaduis),
			radius: randRaduis,
		};

		// Does it overlap any previous circles?
		let overlapping = false;
		for (let j = 0; j < originList.length; j++) {
			let other = originList[j];
			let d = dist(circle.x, circle.y, other.x, other.y);
			if (d < circle.radius + other.radius) {
				overlapping = true;
			}
		}

		// If not keep it!
		if (!overlapping) {
			originList.push(circle);
		}

		// Are we stuck?
		protection++;
		if (protection > 10000) {
			break;
		}
	}

	if (DEBUG) console.log(originList);
	// fill array with new circle instances
	// spawn circles in the center of the origins
	for (let i = 0; i < circleNum; i++) {
		let originIndex = floor(random(originList.length));
		circles[i] = new Circle(
			originList[originIndex].x,
			originList[originIndex].y,
			random(radiusMin, radiusMax),
			originList[originIndex]
		);
	}
}

class Circle {
	constructor(x, y, radius, origin) {
		this.x = x;
		this.y = y;
		this.radius = radius;

		this.heading = random(PI * 2);
		this.speed = 1;

		this.origin = origin;
	}

	update() {
		this.behaviour1();
		this.behaviour2();
		this.behaviour3();
		this.behaviour4();

		// this.behaviour5();
		// this.behaviour6();
		// this.behaviour7();

		this.originDetect();

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

		// origin circle
		bug.noFill();
		bug.ellipse(this.origin.x, this.origin.y, this.origin.radius);
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

	// check if object has left origin
	originDetect() {
		if (!this.touching(this.origin)) {
			this.x = this.origin.x;
			this.y = this.origin.y;
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
						50
					);
					// Draw a line between the centres of the circles
					main.line(this.x, this.y, circles[i].x, circles[i].y);
				}
			}
		}
	}

	form2() {
		noFill();
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
