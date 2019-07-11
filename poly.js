class audio {
	constructor() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();

		this.bufferLoader = new BufferLoader(
			this.context,
			[
			  'hihat.wav',
			  'snare.wav',
			  'kick.wav',
			],
			this.finishedLoading
		);

		this.bufferLoader.load();

	}

	finishedLoading(bufferList) {
		this.hihat = bufferList[0];
		this.snare = bufferList[1];
		this.kick = bufferList[2];
	}

	playSound(buffer, time) {
		let source = this.context.createBufferSource();

		switch (buffer) {
			case("kick"):
				source.buffer = this.bufferLoader.kick;
				break;
			case("snare"):
				source.buffer = this.bufferLoader.snare;
				break;
			case("hihat"):
				source.buffer = this.bufferLoader.hihat;
				break;
				
		}
		source.connect(this.context.destination);
		source.start(time);
	}

	play(time) {
		this.playSound(this.buffers[0], time)	
	}
}

class bar {
	constructor(bar, length, sample, tempo) {
		this.bar = bar;
		this.length = length;
		this.sample = sample;
		this.tempo = tempo;
		this.time = 0;
		this.count = 0;
		this.audio = new audio();
		this.delay = this.tempo/this.length;
		this.pos = 0

		for (let i = 0; i < this.length; i++) {
			let new_note = document.createElement("div");
			new_note.classList.add("note")
			this.bar.appendChild(new_note)
		}
	}

	add_note() {
		let new_note = document.createElement("div");
		new_note.classList.add("note")
		this.bar.appendChild(new_note)

		this.length++;
		this.delay = this.tempo/this.length;
	}

	remove_note() {
		this.bar.removeChild(this.bar.children[this.length-1])

		this.length--;
		this.delay = this.tempo/this.length;
	}

	set_sample(sample) {
		
		for (let i = 0; i < this.length; i++) {
			this.bar.children[i].classList.remove(this.sample);
		}

		this.sample = sample;
	}

	toggle_sample() {
		switch (this.sample) {
			case("hihat"):
				this.set_sample("kick");
				break;
			case("kick"):
				this.set_sample("snare");
				break;
			case("snare"):
				this.set_sample("hihat");
				break;
		}
	}
	
	reset() {
		this.count = 0;
		this.time = 0;
		this.pos = 0
	}

	update(tick) {
		if (tick > this.time + this.delay && this.count < this.length) {
			this.count++;
			this.time = tick;
			this.bar.children[this.pos].classList.remove(this.sample)
	
			this.audio.playSound(this.sample, 0);
	
			this.pos++;
			this.pos = this.pos % this.length;
	
			this.bar.children[this.pos].classList.add(this.sample)
		}
	}
}

function add_bar() {
	let new_bar = document.createElement("div");
	new_bar.classList.add("bar");
	new_bar.addEventListener("click", function(){bar_array[length-1].toggle_sample()});
	bars.appendChild(new_bar);

	let new_plus = document.createElement("div");
	new_plus.classList.add("plus_control");
	plus_controls.appendChild(new_plus);

	let new_minus = document.createElement("div");
	new_minus.classList.add("minus_control");
	minus_controls.appendChild(new_minus);

	let length = bars.children.length
	new_plus.addEventListener("click", function(){bar_array[length-1].add_note()});
	new_minus.addEventListener("click", function(){bar_array[length-1].remove_note()});

	bar_array.push(new bar(new_bar, 2, "hihat", tempo));
}

var tempo = 2000;
let bars = document.getElementById("bars");
let plus_controls = document.getElementById("plus_controls");
let minus_controls = document.getElementById("minus_controls");
let bar_array = [];

for (let i = 0; i < bars.children.length; i++) {
	bar_array.push(new bar(bars.children[i], 2, "hihat", tempo));
	bars.children[i].addEventListener("click", function(){bar_array[i].toggle_sample()});
	plus_controls.children[i].addEventListener("click", function(){bar_array[i].add_note()});
	minus_controls.children[i].addEventListener("click", function(){bar_array[i].remove_note()});
}

let start = new Date().getTime();

function loop() {
	time = new Date().getTime() - start;	

	if (time > tempo+30) {
		start = new Date().getTime();
		for (let i = 0; i < bars.children.length; i++) {
			bar_array[i].reset();
		}
	} else {
		for (let i = 0; i < bars.children.length; i++) {
			bar_array[i].update(time);
		}
	}

}

window.setInterval(loop, 1)
bar_array[0].add_note();
bar_array[0].add_note();
bar_array[1].add_note();
bar_array[1].toggle_sample();
