function Player(initConfig) {
	this.name = initConfig.name;
	this.scoreSheet = [];
	this.frameScores = []; // for each individual frame
	this.runningTotal = []; // will be adjusted and eventually showed to the users
	this.currentScore; // mostly will be the same as the last bit of runningTotal
	this.firstThrow;
	this.secondThrow;
	this.bonusThrow;
	this.finalScore;
	this.lastMark;
	this.lastFrame = false;
}

Player.prototype.shoot = function(firstThrow, secondThrow, bonus) {
	this.scoreSheet.push(firstThrow, secondThrow);
	this.firstThrow = firstThrow;
	this.secondThrow = secondThrow;

	if(this.runningTotal.length >= 9) {
		this.lastFrame = true;
	} else if(this.runningTotal.length == 10) {
		console.log("*****************GAME*****************OVER*****************");
		return;
	}

	if(this.lastFrame == true) {
		if(bonus) {
			this.bonusThrow = bonus;
			this.scoreSheet.push(this.bonusThrow);
		}
		this.prepScoreSheet(this.scoreSheet);
		this.calculateScore(this.firstThrow, this.secondThrow, this.bonusThrow);
		console.log(firstThrow, secondThrow, bonus);
		return;
	} else {
		this.prepScoreSheet(this.scoreSheet);
		this.calculateScore(this.firstThrow, this.secondThrow);
		console.log(firstThrow, secondThrow, bonus);
	}
};

Player.prototype.prepScoreSheet = function(scoreSheet) {
	var temp_scoresheet = [],
		that = this;
	for(var i = 0; i < scoreSheet.length; i += 1) {
		if(scoreSheet[i] == '-' || scoreSheet[i] == '') {
			// console.log('dash or empty');
			temp_scoresheet.push(0);
		} else if(scoreSheet[i] == 'X') {
			// console.log('strik');
			temp_scoresheet.push(10);
		} else if(scoreSheet[i] == '/') {
			// console.log('spare');
			if(scoreSheet[i - 1] == '-') {
				temp_scoresheet.push(10);
			} else {
				temp_scoresheet.push(10 - parseInt(scoreSheet[i - 1], 10));
			}
		} else {
			// console.log('just numbers');
			temp_scoresheet.push(parseInt(scoreSheet[i]));
		}
		console.log(temp_scoresheet, this.scoreSheet, this.runningTotal, this.frameScores);
		setThrowsOfThisFrame(temp_scoresheet);
	}
	// ENSURE EVERYTHING THAT PASSED TO
	// calculateScore() WILL BE A NUMBER

	function setThrowsOfThisFrame(arr) {
		console.log(arr);
		if(that.scoreSheet.length == 21) { // && (that.scoreSheet[20] == "/" || that.scoreSheet[19] == "X")) {
			console.log(that.scoreSheet.length, '*****************THIS IS THE LAST FRAME WITH BONUS*****************');
			that.firstThrow = arr[arr.length - 3];
			that.secondThrow = arr[arr.length - 2];
			that.bonusThrow = arr[arr.length - 1];
		} else {
			console.log(that.scoreSheet.length);
			that.firstThrow = arr[arr.length - 2];
			that.secondThrow = arr[arr.length - 1];
		}
	}
};

Player.prototype.calculateScore = function(firstThrowOfThisFrame, secondThrowOfThisFrame, bonusThrow) {
	var scoreOfThisFrame = 0;
	if(bonusThrow) {
		scoreOfThisFrame = firstThrowOfThisFrame + secondThrowOfThisFrame + bonusThrow;
	} else {
		scoreOfThisFrame = firstThrowOfThisFrame + secondThrowOfThisFrame;
	}
	// first frame
	if(this.lastMark == null) {
		this.frameScores.push(scoreOfThisFrame);
		this.runningTotal.push(scoreOfThisFrame);
	}
	// 2-9 frames or the 10th with NO BONUS
	else if(this.lastMark && this.runningTotal.length < 9 || this.runningTotal.length == 9 && this.bonusThrow == null) {
		this.frameScores.push(scoreOfThisFrame);
		this.runningTotal.push(0);
		this.adjustFrameScores(firstThrowOfThisFrame, secondThrowOfThisFrame, scoreOfThisFrame);
	}
	// 10th frame with bonus
	// if this is a strike or spare, player gets a bonus shot
	else if(this.lastFrame == true) {
		// do something for bonus here 
		console.log("*****************THE 10TH FRAME*****************");
		this.frameScores.push(scoreOfThisFrame);
		this.runningTotal.push(0);
		this.adjustFrameScores(firstThrowOfThisFrame, secondThrowOfThisFrame, scoreOfThisFrame, bonusThrow);
	}
	console.log("lastMark: " + this.lastMark + ", frameScores: " + this.frameScores + ", runningTotal: " + this.runningTotal + ", currentScore: " + this.currentScore, this.firstThrow, this.secondThrow);
	if(this.lastFrame == true) {
		console.log("*****************THIS IS THE LAST FRAME, NO SETMARK*****************");
		return;
	} else {
		this.setLastMark(this.scoreSheet[this.scoreSheet.length - 2], scoreOfThisFrame);
	}
};

Player.prototype.adjustFrameScores = function(firstThrowOfThisFrame, secondThrowOfThisFrame, scoreOfThisFrame, bonus) {
	var temp = 0,
		fsl = this.frameScores.length,
		rtl = this.runningTotal.length,
		thisMark, that = this;

	setThisMark();

	function setThisMark() {
		if(firstThrowOfThisFrame == 10) {
			thisMark = "strike";
		} else if(firstThrowOfThisFrame + secondThrowOfThisFrame == 10 && firstThrowOfThisFrame != 10) {
			thisMark = "spare";
		} else {
			thisMark = "open";
		}
		console.log("thisMark is " + thisMark); //, "p: " + p);
	}

	// if (this.frameScores.length > 9) {
	// 	debugger;
	// };
	console.log("ft " + firstThrowOfThisFrame, "st " + secondThrowOfThisFrame, "sf " + scoreOfThisFrame, "b " + bonus, "thisMark " + thisMark, "frame# " + this.frameScores.length);

	// adjust scores for previous frame(s)
	if(this.lastMark == 'spare') {
		// last frame was a spare
		console.log('*****************LAST FRAME WAS A SPARE*****************');
		this.frameScores[fsl - 2] += firstThrowOfThisFrame;
		this.runningTotal[rtl - 2] += firstThrowOfThisFrame;
	} else if(this.lastMark == 'strike') {
		//or it was a strike
		console.log("*****************LAST FRAME WAS A STRIKE*****************");
		if(this.scoreSheet[this.scoreSheet.length - 6] == "X" || this.lastFrame == true && this.scoreSheet[14] == "X") {
			// two strikes ahead
			console.log(this.scoreSheet, this.frameScores, firstThrowOfThisFrame, scoreOfThisFrame, scoreOfThisFrame);
			if(thisMark == "strike") {
				// if this frame is also a strike, then it is a "turkey"
				console.log("*******T*******U*******R*******K*******E*******Y*******");
				if(this.lastFrame == true) {
					this.frameScores[fsl - 3] += firstThrowOfThisFrame;
					this.runningTotal[rtl - 3] += firstThrowOfThisFrame;
					this.frameScores[fsl - 2] += (firstThrowOfThisFrame + secondThrowOfThisFrame);
					this.runningTotal[rtl - 2] += (firstThrowOfThisFrame + secondThrowOfThisFrame);
					updateRunningTotal();
					return;
				} else {
					this.frameScores[fsl - 3] += scoreOfThisFrame;
					this.runningTotal[rtl - 3] += scoreOfThisFrame;
				}
			} else {
				// two strikes ahead, but not this one
				console.log("*****************TWO STRIKE AHEAD, BUT NO TURKEY *****************");
				this.frameScores[fsl - 3] += firstThrowOfThisFrame;
				this.runningTotal[rtl - 3] += firstThrowOfThisFrame;
			}
		}
		// for one strike and compensating the two situations above 
		this.frameScores[fsl - 2] += firstThrowOfThisFrame + secondThrowOfThisFrame;
		this.runningTotal[rtl - 2] += firstThrowOfThisFrame + secondThrowOfThisFrame;
	} else if(this.lastMark == 'open') {
		console.log('*****************LAST FRAME WAS AN OPEN*****************');
	}

	updateRunningTotal();

	function updateRunningTotal(pauseCount) {
		if(pauseCount && pauseCount <= 2) {
			console.log("PAUSED " + pauseCount + " frames");
			for(var i = 0; i < that.frameScores.length - pauseCount; i++) {
				temp += that.frameScores[i];
				that.runningTotal[i] = temp;
			}
		} else {
			for(var i = 0; i < that.frameScores.length; i++) {
				temp += that.frameScores[i];
				that.runningTotal[i] = temp;
			}
		}

	}

	// this.runningTotal[this.runningTotal.length - 1] = temp + scoreOfThisFrame;
	console.log(this.runningTotal[rtl - 1]);
};

Player.prototype.setLastMark = function(firstThrowOfThisFrame, scoreOfThisFrame) {
	// if this frame is a spare
	if(scoreOfThisFrame == 10 && firstThrowOfThisFrame != "X") {
		this.lastMark = 'spare';
	}
	// or a strike
	else if(firstThrowOfThisFrame == "X") {
		this.lastMark = 'strike';
	}
	// or this is open
	else {
		this.lastMark = 'open';
	}
};

Player.prototype.updateScores = function(scoreArray) { //, limit) {
	var frameCount = scoreArray.length;

	// if (limit) {
	// 	frameCount = scoreArray.slice(0, parseInt(limit)*2).length;
	// }
	// else{
	// 		frameCount = scoreArray.length;
	// }
	// resetting everything for re-calculation
	this.runningTotal = [];
	this.frameScores = [];
	this.scoreSheet = [];
	this.lastFrame = false;

	console.log(this.scoreSheet.length, frameCount);

	for(var i = 0; i < frameCount; i += 2) {
		if(i == 18 && frameCount == 21) {
			this.shoot(scoreArray[i], scoreArray[i + 1], scoreArray[i + 2]);
			return;
		} else if(frameCount % 2 != 0 && frameCount != 21 && scoreArray[scoreArray.length - 1] != "X" && i == frameCount - 1) {
			// DROP the last bit of the array passed in if it has odd amount of elements
			return;
		} else {
			this.shoot(scoreArray[i], scoreArray[i + 1]);
		}
	}
};