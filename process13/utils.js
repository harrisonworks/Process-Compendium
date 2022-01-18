function circlePacking(radiusTarget, numberTarget) {
	// create three circles that do not overlap
	let originList = [];
	let protection = 0;
	while (originList.length < numberTarget) {
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

	return originList;
}
