// अथ योगानुशासनम्॥१॥
/*
	class Desk
	manages the Desk area of the screen
	subscribes to 'question', publishes 'answer'
*/
Desk = function() {
	this.container = null;
	this.observer = null;
	this.card = null;
	this.reverse = false;  // dir 'qa' is normal, dir 'aq' is reverse
	this.answer = false;
	this.isSketchEnabled = false;
	this.isStacksShowing = false;
	this.isAutoPlay = false;  // for development testing
	this.minimal = null;
	this.translitEnabled = false;
}

Desk.strings = {
	'qa': 'Normal',  // 'Reading/Listening',
	'aq': 'Reverse',  // 'Writing/Speaking',
	'show-stacks': 'Show Stacks',
	'program-name': 'Flash',
}

Desk.html = ""+
	"<div id='desk' class='box ylo'>"+
		"<div class='dr'>"+
			"<table>"+
				"<tr>"+
					"<td id='program-name' class='title tleft'>$4</td>"+
					"<td class='tcenter'>"+
						"<div id='dirbuttons'>"+
							"<input hidden id='dir-qa-btn' type='button' class='anchor' value='$1' />"+
							"<input hidden id='dir-aq-btn' type='button' class='anchor' value='$2' />"+
						"</div>"+
					"</td>"+
					"<td class='tright'>"+
						"<icon class=big name='gear' show='settings'></icon>"+
					"</td>"+
				"</tr>"+
			"</table>"+
		"</div>"+
		"<div class='dr'>"+
			"<div class='bigfield' id='question'>&nbsp;</div>"+
		"</div>"+
		"<div class='dr'>"+
			"<table>"+
				"<tr>"+
					"<td class='wid20p'>"+
					"</td>"+
					"<td class='wid60p'>"+
						"<div id='translit' class='tcenter'>&nbsp;</div>"+
					"</td>"+
					"<td class='tright wid20p'>"+
						"<icon class=big name='audio'    id='audio-btn' ></icon>"+
						"<icon class=big name='pencildn' id='sketch-btn'></icon>"+
					"</td>"+
				"</tr>"+
			"</table>"+
		"</div>"+
		"<div class='dr'>"+
			"<div id='answer-container'>"+
				"<div class='bigfield' id='answer'>&nbsp;</div>"+
				"<canvas hidden id='sketchcanvas' class='accent'></canvas>"+
			"</div>"+
		"</div>"+
		"<div class='dr'>"+
			"<div class='tcenter'>"+
				"<div id='show-answer-btns'>"+
					"<input id='show-answer-btn' type='button' value='Show answer' />"+
				"</div>"+
				"<div hidden id='right-wrong-btns'>"+
					"<input id='wrong-btn' type='button' value='Wrong' />"+
					"<input id='right-btn' type='button' value='Right' />"+
				"</div>"+
			"</div>"+
		"</div>"+
		"<h5 id=stackexpander expand='stacks' class='tleft expander'>Stacks</h5>"+
		"<div id='stacks'>"+
			"<div draglist droplist class='stack panel grn' id='stacku'><h3>Untried</h3></div>"+
			"<div draglist droplist class='stack panel grn' id='stackw'><h3>Work</h3></div>"+
			"<div draglist droplist class='stack panel grn' id='stackr'><h3>Review</h3></div>"+
			"<div draglist droplist class='stack panel grn' id='stackm'><h3>Mastered</h3></div>"+
		"</div>"+
		"<form hidden id='settings' class='panel popup'>"+
			"<icon name='xding' class='fright' hide='settings'></icon>"+
			"<h3>Algorithm Factors</h3>"+
			"<table>"+
				"<tr><td colspan='2'><input type='checkbox' id='isAutoDir' checked /><label for='isAutoDir'>isAutoDir</label></td></tr>"+
				"<tr><td>autoDirNth</td><td class='tright'><input type='number' id='autoDirNth'   value='0' /></td></tr>"+
				"<tr><td colspan='2'><input type='checkbox' id='isAutoChoose' checked /><label for='isAutoChoose'>isAutoChoose</label></td></tr>"+
				"<tr><td>choosePctReview</td><td class='tright'><input type='number' id='choosePctReview' value='0' /></td></tr>"+
				"<tr><td colspan='2'><input type='checkbox' id='isAutoPull' checked /><label for='isAutoPull'>isAutoPull</label></td></tr>"+
				"<tr><td>minAvgPctWork</td><td class='tright'><input type='number' id='minAvgPctWork' value='0' /></td></tr>"+
				"<tr><td>minSizeWork</td><td class='tright'><input type='number' id='minSizeWork' value='0' /></td></tr>"+
				"<tr><td>maxSizeWork</td><td class='tright'><input type='number' id='maxSizeWork' value='0' /></td></tr>"+
				"<tr><td>maxSizeReview</td><td class='tright'><input type='number' id='maxSizeReview' value='0' /></td></tr>"+
				"<tr><td colspan='2'><input type='checkbox' id='isAutoPromote' checked /><label for='isAutoPromote'>isAutoPromote</label></td></tr>"+
				"<tr><td>promotePctWork  </td><td class='tright'><input type='number' id='promotePctWork' value='0' /></td></tr>"+
				"<tr><td>promoteCntWork  </td><td class='tright'><input type='number' id='promoteCntWork' value='0' /></td></tr>"+
				"<tr><td>promotePctReview</td><td class='tright'><input type='number' id='promotePctReview' value='0' /></td></tr>"+
				"<tr><td>promoteCntReview</td><td class='tright'><input type='number' id='promoteCntReview' value='0' /></td></tr>"+
			"</table>"+
		"</form>"+
	"</div>";

Desk.prototype = {
	setup: function(container, observer) {
		this.container = container;
		this.observer = observer;

		var s = prepString(Desk.html, ['qa','aq','show-stacks','program-name'], Desk.strings);
		this.container.innerHTML = s;
		
		this.minimal = new Minimal();
		this.minimal.attachAll(this.container);

		this.sketchMarks = new Sketch($('sketchcanvas'), {hasGrid:true, gridSize:20});
		this.attachDomEventHandlers();
		this.attachFlashNoteHandlers();
	},

	attachDomEventHandlers: function() {
		var self = this;
		$('settings').addEventListener('show', function(e) {
			self.populateSettingsForm();
		}, false);

		$('dir-qa-btn').addEventListener('click',function(event) {
			self.toggleDir('aq');
		});
		$('dir-aq-btn').addEventListener('click',function(event) {
			self.toggleDir('qa');
		});

		$('show-answer-btn').addEventListener('click',function(event) {
			self.showAnswer();
		});

		$('right-btn').addEventListener('click',function(event) {
			self.onAnswer(true);
		});
		$('wrong-btn').addEventListener('click',function(event) {
			self.onAnswer(false);
		});

		$('sketch-btn').addEventListener('click', function(event) {
			self.toggleSketch();
		}, false);

		$('audio-btn').addEventListener('click', function(event) {
			var afile = self.card.audiourl;
			var audio = new Audio(afile);
			audio.play();
		}, false);

		// attach handlers for the settings form
		this.cbfields = $('settings').querySelectorAll('input[type=checkbox]');
		for (var i=0; i<this.cbfields.length; i++) {
			this.cbfields[i].addEventListener('change', function(e) {
				flash.coach.setting[e.target.id] = e.target.checked;
			});
		}
		this.numfields = $('settings').querySelectorAll('input[type=number]');
		for (var i=0; i<this.numfields.length; i++) {
			this.numfields[i].addEventListener('change', function(e) {
				flash.coach.setting[e.target.id] = e.target.value;
			});
		}
	},

	attachFlashNoteHandlers: function() {
		var self = this;
		this.observer.subscribe('question', 'desk', function(note) {
			self.showQuestion(note);
		});
		this.observer.subscribe('autoplay-request', 'desk', function(note) {
			self.setAutoPlay(true);
		});
		this.observer.subscribe('autoplay-cancelled', 'desk', function(note) {
			self.setAutoPlay(false);
		});
		this.observer.subscribe('program-ready', 'desk', function(note) {
			self.onProgramReady(note);
		});
		this.observer.subscribe('changedirection-complete', 'desk', function(note) {
			self.onDirectionChange(note);
		});
		this.observer.subscribe('stackchange-complete', 'desk', function(note) {
			self.refreshStacks(note);
		});
	},

	toggleDir: function(dir) {
		this.observer.publish(new Note('changedirection-request', 'desk', {dir:dir}));
	},

	onDirectionChange: function(note) {
		this.reverse = (note.payload.dir == 'aq');
		toggleAttribute($('dir-qa-btn'), 'hidden', '', this.reverse);
		toggleAttribute($('dir-aq-btn'), 'hidden', '', !this.reverse);
	},
	
	clear: function(headertoo) {
		if (headertoo) {
			$('program-name').innerHTML = '&nbsp;';
//			$('program-dir').innerHTML = '&nbsp;';
		}
		$('question').innerHTML = '&nbsp;';
		$('answer').innerHTML = '&nbsp;';
		$('translit').innerHTML = '&nbsp;';
		$('show-answer-btns').removeAttribute('hidden');
		$('right-wrong-btns').setAttribute('hidden', '');
		this.sketchMarks.clear();
	},
	showQuestion: function(note) {
		this.card = note.payload.card;
		$('question').innerHTML = (this.reverse) ? this.card.native : this.card.foreign;
		$('answer').innerHTML = '&nbsp;';
		$('translit').innerHTML = '&nbsp;';
		$('right-wrong-btns').setAttribute('hidden', '');
		$('show-answer-btns').removeAttribute('hidden');

//		this.playSound(this.card.audio);
// implement fx/playsound.html Sound object
// implement Sound.loadbuffer to load all sounds up front
// name instead of url to play the sound
// for thai, audio files are on omniglot.com
// for sanskrit, audio files are on sanskrit-sanscrito.com
// save files to local, to avoid issues when files are lost and to simplify url composition

// what event is published on load data
// add a sound object and let it listen to that event
// let it also listen to the next question event

// change the audio button to an option: sound yes or no

// in bahasa.html, no, in desk.js
// create two sound objects, one for content, one for fx
// let each of these objets listen to events
// on question, play the card
// on answer, play klunk or explosionshort
// the fx buffer must be loaded only once

// add the sound name to the card id=

// add the thai digit files to the lang/th folder and rename

// 1. create sound.js and sound.html in jslib
// 2. implement thai sounds: vocab and alphabet (digits)
// 3. implement sanskrit vowels

		this.refreshStacks(note);

		var self = this;
		if (this.isAutoPlay && this.card) {
			setTimeout(function() {
				self.showAnswer()
			}, 250);
		}
	},

	showAnswer: function() {
		if (!this.card)
			return;

		if (this.translitEnabled) {
			$('translit').innerHTML = this.card.translit;
		}
		$('answer').innerHTML = (this.reverse) ? this.card.foreign : this.card.native;
		$('show-answer-btns').setAttribute('hidden', '');
		$('right-wrong-btns').removeAttribute('hidden');

		if (this.isAutoPlay) {
			var self = this;
			setTimeout(function() {self.autoScore()}, 250);
		}
	},

	onAnswer: function(answer) {
		this.answer = answer; // true/false, right/wrong
		this.clear();
		this.observer.publish(new Note('answer', 'desk', {
			card:this.card,
			answer:answer
		}));
	},

	onPromote: function(promote) {
		this.observer.publish(new Note('promote-request', 'desk', {
			card:this.card,
			promote:promote,
		}));
	},

	/* autoplay, for development testing */
	setAutoPlay: function(bool) {
		this.isAutoPlay = bool;
		if (this.isAutoPlay) {
			var self = this;
			setTimeout(function() {
				self.showAnswer()
			}, 250);
		}
	},
	autoScore: function() {
		// simulated probability of answering correctly increases with every asking of the question
		var probability = [.30, .40, .50, .60, .70, .80, .90];
		var probIndex = Math.min(this.card.getAcnt(), probability.length-1);
		var probabilityTrue = probability[probIndex];
		var r = Math.random()
		var answer = (r < probabilityTrue);
		this.onAnswer(answer);
	},

	resizeAnswer: function(big) {
		// resize the answer font
		$('answer').classList.toggle('sketchfont', big);

		// get the new size
		var s = getComputedStyle($('answer'));
		var w = parseInt(s.paddingLeft) + parseInt(s.paddingRight) + parseInt(s.width);
		var h = parseInt(s.paddingTop) + parseInt(s.paddingBottom) + parseInt(s.height);

		// size the canvas to match
		var c = $('sketchcanvas');
		c.style.width = w + 'px';
		c.style.height = h + 'px';
		c.style.top = (0-h) + 'px';

		// shrink the container to match
		$('answer-container').style.height = h + 'px';
	},

	toggleSketch: function(enable) {
		this.isSketchEnabled = (enable) ? enable : !this.isSketchEnabled;
		if (this.isSketchEnabled) {
			this.resizeAnswer(true);
			$('sketchcanvas').removeAttribute('hidden');
			this.sketchMarks.draw();
		}
		else {
			this.resizeAnswer(false);
			$('sketchcanvas').setAttribute('hidden', '');
			this.sketchMarks.clear();
		}
	},

	toggleStacks: function(show) {
		this.isStacksShowing = (show) ? show : !this.isStacksShowing;
		toggleAttribute($('stacks'), 'hidden', '', !this.isStacksShowing);
	},

	onProgramReady: function(note) {
		$('program-name').innerHTML = note.payload.features.name;
		if (!note.payload.features.reversible) {
			hide('dirbuttons');
		}
		this.onDirectionChange(note);
	},

	// Program is handling stacks. Desk is displaying stacks.  Correct?
	refreshStacks: function(note) {
		// insert the html into each stack
		var state;
		for (var i=0; i<Card.allStates.length; i++) {
			state = Card.allStates[i];
			if (state == 'p') 
				continue;
			if (note.payload['stacks']) {
				$('stack'+state).innerHTML = note.payload.stacks[state];
			}
		}

		// setup select and drag-and-drop of cards the stacks
		this.minimal.attachAll($('stacks'));
	},

	populateSettingsForm: function() {
		var setting;
		for (var i=0; i<this.cbfields.length; i++) {
			setting = this.cbfields[i].id;
			$(setting).checked = flash.coach.setting[setting];
		}
		for (var i=0; i<this.numfields.length; i++) {
			setting = this.numfields[i].id;
			$(setting).value = flash.coach.setting[setting];
		}
		var p = getAbsolutePosition($('desk'));
		var w = $('desk').offsetWidth;
		$('settings').style.top = p.y + 'px';
		$('settings').style.right = (p.x) + 'px';
	}
}