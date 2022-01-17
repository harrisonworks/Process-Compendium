let circles = [];

function setup() {
	createCanvas(windowWidth, windowHeight);

	angleMode(DEGREES);

	for (let i = 0; i < 20; i++) {
		circles.push(new Circle());
	}
}

function draw() {
	circle(mouseX, mouseY, 20);

	for (let i = 0; i < circles.length; i++) {
		circles[i].update(mouseX);

		circles[i].display();
	}
}

class Circle {
	constructor() {
		this.position = createVector(
			random(width / 4, (width / 4) * 3),
			random(height / 4, (height / 4) * 3)
		);

		this.lineFront = this.position.copy();

		this.lineFront.add(50, 0);

		this.velocity = createVector(random(-1, 1), random(-1, 0));

		console.log(this.position.heading());
	}

	update(mx) {
		// this.position.add(this.velocity);
	}

	display() {
		// ellipse(this.position.x, this.position.y, 50);
		// push();
		// this.position.rotate(1);

		line(this.position.x, this.position.y, this.lineFront.x, this.lineFront.y);
		// pop();
	}
}
