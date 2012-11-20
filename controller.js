function Bowler(target) {
	this.allPlayers = [];
	this.target = target;
	that = this;
	// this.editMode = false;
}

Bowler.prototype.bowlerInit = function() {
	// change enter key default action
	$(document).keypress(function(e) {
		if(e.which == '13') {
			e.preventDefault();
			$("input").blur();
		}
	});

	var $optList = $('<div>').addClass('options'),
		$prompt = $('<div>').attr('id', 'getNumOfPlayer').text('How Many Players?'),
		$wrapper = $('<div>').addClass('msgWrapper').append($prompt).append($optList).appendTo(this.target),
		$form = $('<form>').attr('id', 'nameForms').appendTo(this.target),
		$field = $('<input>').attr('type', 'text').addClass('nameFields').attr("maxlength", "20");

	for(var i = 1; i <= 6; ++i) {
		$('<span>').text(i).appendTo($optList);
	}

	var $opt = $('.options span');

	this.startBtn = $('<input>').attr({
		'value': 'PLAY',
		'type': 'button',
		'id': "startBtn"
	});

	$msg = $('<div>').addClass('msg').text('Please Enter Your Names');

	$opt.click(function() {
		var n = $(this).text();
		$(this).addClass('selected').siblings().removeClass('selected');

		$('input').remove();
		// for users altering the number of players
		// remove all the input fields including the PLAY button
		for(var i = 0; i < parseInt(n, 10); i++) {
			$field.clone().appendTo($form);
		}

		$msg.insertAfter($optList).fadeIn('fast');

		var $allFields = $(".nameFields");

		$allFields.fadeIn('fast').addClass('visible').each(function(i) {
			$(this).val("Player " + parseInt(i + 1, 10));
		});

		$allFields.focus(function() {
			var $this = $(this);

			$this.val('').removeClass('error valid focus').addClass('focus').blur(function() {
				$(this).removeClass('focus');
				if($this.val() != "") {
					$this.addClass('valid');
				} else {
					$this.addClass('error');
				}
				that.validateNames($allFields);
			});
		});
	});


	//resume previous game
	$('#getNumOfPlayer').live("dblclick", function() {
		that.resumeGame();
	});

	$("#startBtn").live("click", function() {
		that.collectNames($(".valid"));
		// remove all unnecessary elements
		$wrapper.remove();
		$msg.remove();
		$form.remove();
		$(this).remove();

		// remove old cookies
		var cookies = get_cookies_array();
		for(var name in cookies) {
			eraseCookie(name);
		}

		// show the frame sets
		$('div.frameSets').fadeIn();

		var divs = $('div.frameSets').eq(0).clone(),
			promptHTML = $('<div>').append(divs.find(".msg")).html() + $('<div>').append(divs.find(".selections")).html(),
			frmHTML = divs.find(".msg").remove().end().find(".selections").remove().end().find(".displayNames").text("").end().find(".active").removeClass("active").end().html();

		//
		// create cookies for static elements
		//
		$('.displayNames').each(function(i) {
			var n = i + 1;
			createCookie("bowler" + n + "_name", $(this).text(), 7);
		});

		createCookie("currentPrompt", promptHTML, 7);
		createCookie("frameStructure", frmHTML, 7);
		// console.log("currentPrompt: " + readCookie("currentPrompt"), "frameStructure: " + readCookie("frameStructure"));
	});


};

Bowler.prototype.validateNames = function($elems) {
	// validates inputs
	if($(".valid").length == $elems.length) {
		that.startBtn.insertAfter($elems.last()).fadeIn('fast');
	} else {
		that.startBtn.hide();
	}
};

Bowler.prototype.collectNames = function($elemArray) {
	var names = [],
		validCount = $elemArray.length;

	console.log($elemArray, validCount);

	$elemArray.each(function() {
		names.push($(this).val());
	});
	that.createPlayers(validCount, names);
};

Bowler.prototype.resumeGame = function() {
	var CookieNames = getCookiesNames(),
		_current, _active, _frameStructure, _currentPrompt;

	that.allPlayers = [];
	for(var i = 0; i < CookieNames.length; i += 1) {
		// check how many frames they played
		if(CookieNames[i].match("activeFrame")) {
			_active = CookieNames[i];
		} else if(CookieNames[i].match("currentBowler")) {
			_current = CookieNames[i];
		}
		// get the codes
		else if(CookieNames[i].match("frameStructure")) {
			_frameStructure = CookieNames[i];
		} else if(CookieNames[i].match("currentPrompt")) {
			_currentPrompt = CookieNames[i];
		}
		// get the names, and recreate players objects
		else if(CookieNames[i].match("_name")) {
			that.allPlayers.push("window.bowler" + parseInt(i + 1, 10) + " = new Player({ name: \"" + readCookie(CookieNames[i]) + "\"})");
		}
	}

	// recreate the Player objects and push the scores back to each of them
	if(document.cookie.match("_scoreSheet")) {
		$(that.target).empty();
		for(i = 0; i < that.allPlayers.length; i++) {
			var thisPlayer = that.allPlayers[i],
				n = i + 1,
				thisScores = readCookie("bowler" + n + "_scoreSheet").split(",");
			console.log(that.allPlayers, n, thisScores);

			thisPlayer.updateScores(thisScores);
			thisPlayer.scoreSheet = thisScores;
			console.log(thisPlayer.name, thisPlayer.scoreSheet, thisPlayer.frameScores, thisPlayer.runningTotal[thisPlayer.runningTotal.length - 1]);
			reassembleFrames(i, thisPlayer);
		}
		// that.flowControl(readCookie("currentBowler"));
	} else {
		alert("no score cookies");
	}

	function reassembleFrames(i, player) {
		console.log(player);
		var _fm = readCookie(_frameStructure),
			_int = parseInt(i, 10) + 1,
			t = $('<div>').attr("class", "frameSets").attr("id", "bowler" + _int).append(_fm);

		// put back scores, names etc
		t.find(".displayNames").text(player.name).end().find(".throws>div").each(function(i) {
			$(this).text(player.scoreSheet[i]);
		}).end().find(".frameScore").each(function(i) {
			$(this).text(player.frameScores[i]);
		}).end().find(".finalScore").text(player.runningTotal[player.runningTotal.length - 1]);

		// append to the container
		$(that.target).append(t);
		if(t.is(":hidden")) {
			t.show();
		}

		// reset current
		if(_int == readCookie(_current)) {
			var bowler_id = "#bowler" + _int;
			console.log($(bowler_id));
			$(bowler_id).addClass("current").prepend(readCookie(_currentPrompt));

		}

		console.log(t, $(that.target));
	}
};

Bowler.prototype.createPlayers = function(i, names) {
	// var that = this;
	// create corresponding player objects
	// var this.allPlayers = [];
	// $(that.target).empty()
	for(var n = 0; n < i; n++) {
		var temp = new Player({
			name: names[parseInt(n, 10)]
		});
		this.allPlayers.push(temp);
		eval('window.bowler' + (n + 1) + '= temp');
	}

	console.log(this.allPlayers);



	for(var j = 0; j < this.allPlayers.length; j++) {
		var id = "bowler" + parseInt(j + 1, 10);
		$("<div>").addClass('frameSets').attr('id', id).appendTo(this.target);
		that.assembleFrames(j);
	}

	var	currentPrompt = $('<span>').attr("id", "currentFramePrompt").append($('<span>').addClass('msg').text("How Many Pins Did You Get?")).append($('<ul>').addClass('selections')),
	lis = "";

	for(var i = 0; i <= 10; i++) {
		tmp = $('<p>').append($('<li>').text(i));
		lis += tmp.html();
	}

	currentPrompt.find(".selections").html(lis).prepend($('<li>').attr('id', 'gutter').text('Gutter'));


	createCookie("currentPrompt", $('<span>').append(currentPrompt).html(), 7)

	console.log(currentPrompt, readCookie("currentPrompt"));

	this.flowControl();
};

Bowler.prototype.assembleFrames = function(index) {
	var nameSpan = $('<span>').addClass('displayNames'),
	fnlScr = $('<div>').addClass('finalScore'),
	thrw = $('<div>').addClass('throws').append($('<div>').addClass('fThrow')).append($('<div>').addClass('sThrow')),
	frmTpl = $('<div>').addClass('frames').append($('<p>')).append(thrw).append($('<div>').addClass('frameScore'));

	// assemble the html code of 10 frames
	for(var n = 0; n < 10; ++n) {
		frmTpl.clone().appendTo('.frameSets:last');
	}
	// appending name spans and final score div
	$('.frameSets:last .frames').first().before(nameSpan).end().last().after(fnlScr).end().each(function(i) {
		var fn = 'f' + parseInt(i + 1, 10);
		$(this).addClass(fn);
	});

	// insert corresponding frame numbers in the p tags
	var p = $(".frameSets:last").find('p');

	p.each(function(i) {
		$(this).text(++i);
	});

	$('.sThrow:last').after($('<div>').addClass('bonusThrw'));
	$('.displayNames:last').text(that.allPlayers[index].name);
	console.log($('div.editIcons'), nameSpan);
};

Bowler.prototype.getScores = function($frm, $li, $thisCell) {
		var lastFrm = false;
		// *****************CLICKING ANIMATIONS*****************
		$li.live('mousedown', function() {
			$(this).addClass('clicked');
		}).live('mouseup', function() {
			$(this).removeClass('clicked');
		})
		// *****************CLICKING ANIMATIONS*****************
		// $li
		.click(function() {
			if($(".current .frameScore:empty").length == 0) {
				that.disableInputs();
				return;
			}

			if($thisCell) {
				if($(this).text() == 'Gutter') {
					$thisCell.text('-');
				} else {
					// open
					$thisCell.text($(this).text());
				}

				// ***************** CHECK LAST FRAME *****************
				if($('.current .fThrow:not(:empty)').length > 9) {
					lastFrm = true;
				}
				console.log("LASTFRAME? " + lastFrm);
			}

			console.log(this, $thisCell, $thisCell.attr('class'), $(this).text(), $frm.find('.fThrow:empty').length);

			// first throw
			if($thisCell.attr('class') == 'fThrow') {
				if($thisCell.text() == '10') {
					$thisCell.text("X");
					if(lastFrm === true) {
						console.log("THIS CELL IS: " + $thisCell);
						$thisCell = $thisCell.siblings().filter(".sThrow");
					} else {
						console.log($thisCell);
						that.bowlerShoot($frm, "X", "");
						// jump to the next player when there are more than one
						// or jump to the next frame when theres only one
						that.nextPlayer($frm);
					}
					that.updateCookies();
					return;
				} else {
					// not a strike
					// keep this frame as current
					that.setCurrent($frm);
					that.removeInvalidOptions($('.selections li'), parseInt($thisCell.text(), 10));
					that.getScores($frm, $('.selections li'), $thisCell.siblings());
				}
			}

			// second throw
			else if($thisCell.attr('class') == 'sThrow') {
				var ft = $frm.find('.fThrow:not(:empty)').last().text(),
					st = $frm.find('.sThrow:not(:empty)').last().text();
					console.log(ft, st, parseInt(ft));

				// spare
				if(ft == '-' && st == '10' || parseInt(ft) + parseInt(st) == 10) {
					if(lastFrm === false) {
						that.bowlerShoot($frm, ft, '/');
						that.nextPlayer($frm);
					}else {
						console.log("LAST FRAME, SPARE");
						if(ft == "-" && st == "10" || parseInt(ft) + parseInt(st) == 10) {
							$thisCell.text("/");
							st = "/";
						} else if(ft == "X" & st == "10") {
							$thisCell.text("X");
							st = "X";
						}
						if(ft == "X" || st == "/") {
							$thisCell = $thisCell.siblings().filter('.bonusThrw');
							that.nextPlayer($frm);
						}
					}
				} else {
					// open shot
					that.bowlerShoot($frm, ft, st);
					if(lastFrm === false) {
						$frm.next() != null ? $frm.next() : $frm.siblings().eq(0)
					} else{
						that.nextPlayerOrEnd($frm);
					}
				}
			}
			// bonus throw
			else if($thisCell.attr('class') == 'bonusThrw') {
				var ft = $thisCell.siblings().eq(0).text(),
					st = $thisCell.siblings().eq(1).text(),
					bt = $thisCell.text();

				if(st == "-" && bt == "10" || parseInt(st) + parseInt(bt) == 10) {
					$thisCell.text("/");
					bt = "/";
				} else if(bt == "10") {
					$thisCell.text("X");
					bt = "X";
				}
				that.bowlerShoot($frm, ft, st, bt);
				that.nextPlayerOrEnd($frm);
				console.log("THIS IS THE BONUS THROW", ft, st, bt, $frm.index());
			}
			console.log($frm, $frm.next(), $frm.index(), $frm.find('.throws>div:empty').length, $(".current .frameScore:not(:empty)").length);
			that.updateCookies();
		});

};

Bowler.prototype.nextPlayerOrEnd = function($frm) {
		if($frm.index() != $('.frameSets').length + 1) {
			that.nextPlayer($frm);
		} else {
			that.disableInputs();
			return;
		}
};

Bowler.prototype.nextPlayer = function(thisFrame) {
		var i = thisFrame.index() - 1,
			_frms = $('div.frameSets'),
			frameCount = _frms.length;

		if(i == frameCount) {
			that.setCurrent(_frms.first());
		} else if(i < frameCount) {
			that.setCurrent(thisFrame.next());
		}
};

Bowler.prototype.disableInputs = function() {
		var lis = $('ul.selections');
		console.log(lis);
		lis.on("click", "li", function() {
			console.log("CLICK DISABLED");
			alert("Game Over, Do You Want to Play Again?");
			$(this).unbind("click").siblings().unbind("click");
		})
		// dimming the selections
		.css("opacity", "0.3");
};


Bowler.prototype.setCurrent = function($thisFrm) {
		// general switching, NOT for edit mode
		console.log($thisFrm);
		var promptHTML = readCookie("currentPrompt");

		$thisFrm.siblings().removeClass('current').find('span.msg, ul.selections').remove().end().find(".active").removeClass("active");

		if($thisFrm.attr('class') != 'current') {
			$thisFrm.find('span.msg, ul.selections').remove().end()
			.addClass('current');
		}

		$(promptHTML).prependTo($thisFrm).show();

		var lis = $('ul.selections li'),
			thisCell = $('.current .throws>div:empty:first');

		thisCell.parent().parent().addClass("active").siblings().removeClass("active");
		if($thisFrm === null) {
			that.setCurrent(divs.first());
		}
		that.getScores($thisFrm, lis, thisCell);
};


Bowler.prototype.removeInvalidOptions = function($li, num) {
	var j = -num;
	console.log($li);
	for(var i = -1; i >= j; --i) {
		$li.eq(i).unbind("click").hide();
	}
};

Bowler.prototype.flowControl = function(lastCurrent) {
	var divs = $('div.frameSets'),
		promptHTML = $('#currentFramePrompt').html();
	// that = this;
	// console.log(divs.not(".current").eq(0).html(), promptHTML, $('.displayNames').text());
	//
	// create cookies for statics elements
	//
	$('.displayNames').each(function(i) {
		createCookie("bowler" + i + "_name", $(this).text(), 7);
	});

	if(lastCurrent) {
		// *****************FOR EDIT MODE*****************
		console.log(lastCurrent);
		that.setCurrent(divs.eq(parseInt(lastCurrent, 10) + 1));
	} else {
		this.setCurrent(divs.first());
	}
};

Bowler.prototype.hideUnconfirmedScores = function(thisFrame, lastMark, $lastBit) {
		var lastFrmScr = $lastBit.parent().parent().find(".frameScore"),
			thisFrm = $lastBit.parent().parent(),
			prevFrm = thisFrm.prev(".frames"),
			thisIndex = thisFrm.index() - 3,
			$activeIndex = $('.active').index();

		console.log(lastFrmScr, lastMark, $lastBit, thisFrm, prevFrm, thisIndex);

		if(lastMark == "spare" || lastMark == "strike") {
			if($lastBit.text() == "/" || ($lastBit.text() == "" && prevFrm.find(".sThrow").text() != "")) {
				thisFrm.prevAll(".frames").find(".frameScore").show();
			} else if(prevFrm.find(".sThrow").text() == "" && thisFrm.find(".fThrow").text() == "X") {
				console.log(thisFrm.siblings(".frames").slice(0, thisIndex - 1));
				thisFrm.siblings(".frames").slice(0, thisIndex - 1).find(".frameScore").show();
				prevFrm.find(".frameScore").hide();
			}
			lastFrmScr.hide();
		} else {
			thisFrm.parent().find(".frameScore:hidden").show();
		}
};

Bowler.prototype.syncFramescores = function($bowler, $target) {
		var fs = $bowler.runningTotal;

		$target.each(function(i) {
			$(this).text(fs[i]);
		});

};

Bowler.prototype.syncScoreSheet = function($bowler, $target) {
		var ss = $bowler.scoreSheet;

		$target.each(function(i) {
			$(this).text(ss[i]);
		});

};

Bowler.prototype.bowlerShoot = function($thisFrm, ft, st, bt) {
		var frmSrc = $thisFrm.find('.frameScore: empty').first(),
			i = $thisFrm.index() - 1,
			thisBowler = eval($thisFrm.attr("id")),
			thisScoreSheet = $thisFrm.find('.throws>div'),
			thisFrameScores = $thisFrm.find('.frameScore'),
			thisRunningTotal = $thisFrm.find('.finalScore'),
			thisFrameIndex = $('.active').index() - 3;

		console.log(ft, st, bt);

		if(thisBowler.runningTotal.length == 10) {
			console.log('DO YOU WANT TO START ANOTHER GAME?');
			return;
		} else {
			thisBowler.shoot(ft, st, bt);
		}

		that.syncScoreSheet(thisBowler, thisScoreSheet);
		that.syncFramescores(thisBowler, thisFrameScores);

		frmSrc.text(thisBowler.runningTotal[thisBowler.runningTotal.length - 1]);

		console.log(thisFrameScores.eq(thisFrameIndex).parent().find(".sThrow"));

		// show all hidden scores or hide when needed
		if(thisBowler.runningTotal.length > 9) {
			$thisFrm.find('.frameScore:hidden').show();
		} else {
			that.hideUnconfirmedScores($thisFrm,thisBowler.lastMark, thisFrameScores.eq(thisFrameIndex).parent().find(".sThrow"));
		}

		thisRunningTotal.text($thisFrm.find(".frameScore:not(:hidden):not(:empty)").last().text());

};

Bowler.prototype.updateCookies = function() {
		var _frms = $('.frameSets'),
			_bowlers = [];

		_frms.each(function(i) {
			var _scores = [];
			_bowlers.push($(this).attr("id"));
			$(this).find(".throws>div:not(:empty)").each(function() {
				_scores.push($(this).text());
				if($(this).text() == "X") {
					_scores.push("");
				}
			});
			createCookie(_bowlers[_bowlers.length - 1] + "_scoreSheet", _scores, 7);
			console.log(readCookie(_bowlers[_bowlers.length - 1] + "_scoreSheet"));
		});
		createCookie("currentBowler", $(".current").index() - 1, 7);
		createCookie("activeFrame", $('.active').index() - 2, 7);

		//
		//used for re-assembling the code
		//
		for(var i = 0; i < _bowlers.length; i += 1) {
			var name = _bowlers[i];
		}
};

//
// Bowler.prototype.editScore = function() {
// 	// *****************ADDING ICONS NEXT TO NAMES*****************
// 	var $nameBadges = $('span.displayNames'),
// 	$editIcons = $('.editIcons '),
// 	currentPlayer = $(".current"),
// 	that = this;
//
// 	$nameBadges.dblclick(function() {
// 		console.log($(this), $(this).parent(), currentPlayer, $editIcons);
//
// 		var $frameToEdit = $(this).parent(),
// 		// this variable will be replaced with the actual icon later
// 		editIcons = $('<div>').addClass('editIcons').appendTo($nameBadges).css({
// 			'height': "20px",
// 			'width': "20px",
// 			"float": "left",
// 			"display": "inline-block",
// 			"background-color": "red",
// 			"margin-right": "15px"
// 		});
//
// 		// * * * * * * * * * * * * * * * * * ENTERING EDIT MODE * * * * * * * * * * * * * * * * *
// 		console.log(currentPlayer, $frameToEdit, that.editMode);
//
// 		$frameToEdit.removeClass('current').find('span.msg, ul.selections').remove();
//
// 		// *****************MAKE A FRAMESET EDITABLE*****************
// 		$('.editIcons').live("click", function() {
// 			$(this).css('background-color', 'lightgreen').addClass("editing").parents().siblings().find(".editIcons").hide();
// 			this.editMode = true;
// 			that.flowControl($(this).parent().parent());
// 			// listen for user inputs
// 		});
//
// 		// *****************DONE EDITING A FRAMESET*****************
// 		$('.editing').live("click", function() {
// 			$(this).parent().parent().removeClass('current').find('span.msg, ul.selections').remove().end().end().end().css('background-color', 'red').removeClass('editing');
// 			$('.editIcons').show();
// 		});
// 	});
//
// 	if (this.editModem == true) {
// 		// *****************EXIT EDIT MODE*****************
// 		$nameBadges.dblclick(function() {
// 			console.log(currentPlayer);
// 			$('.editIcons').hide();
// 			that.flowControl(currentPlayer);
// 			// set the previous active player to active after editing
// 			this.editMode = false;
// 		})
// 		// grab the new score sheet and calculate score of each frame again
// 	}
// 	else {
// 		return true;
// 	};
// };