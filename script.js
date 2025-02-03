const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRACE_PERIOD = 0.1;

class Note {
    constructor(offset) {
        this.countdown = offset;
        this.is_clickable = false;
    }
    update(delta_time) {
        this.countdown -= delta_time;
        this.is_clickable = Math.abs(this.countdown) <= GRACE_PERIOD;
    }
}

function get_y_coord(y) {
	return canvas.height * (1 - (y - MIN_NOTE_DISPLAY) / (MAX_NOTE_DISPLAY - MIN_NOTE_DISPLAY));
}

const MIN_NOTE_DISPLAY = -0.3;
const MAX_NOTE_DISPLAY = 1.5;
const TILE_HEIGHT = get_y_coord(GRACE_PERIOD) - get_y_coord(0.0);
const LANE_WIDTH = 50;
const LANE_PADDING = 10;
const LANE_LEFT = (canvas.width - LANE_WIDTH * 5 - LANE_PADDING * 4) / 2;
const lanes = [[], [], [], [], []];
let game_running = true;

let keyboard = {
	"d": [false, false, false],
	"f": [false, false, false],
	"j": [false, false, false],
	"k": [false, false, false],
	"l": [false, false, false],

	"g": [false, false, false],
}
window.onkeydown = (e) => {
	keyboard[e.key] = [true, true, false];
}
window.onkeyup = (e) => {
	keyboard[e.key] = [false, false, true];
}

function import_song(notes) {
	for (let i = 0; i < notes.length; i++) {
		for (let j = 0; j < notes[i].length; j++) {
			lanes[i].push(new Note(notes[i][j]));
		}
	}
}

import_song([
	[1.0, 1.45, 1.6],
	[1.15, 1.3, 1.75, 1.9],
	[1.0, 1.6],
	[1.15, 1.45, 1.75],
	[1.3, 1.9],
]);

function draw_note(x, y, color, stroked=false) {
	if (stroked) {
		ctx.strokeStyle = color;
		ctx.lineWidth = "5.0px";
		ctx.strokeRect(x, y - 10, LANE_WIDTH, TILE_HEIGHT);
	} else {
		ctx.fillStyle = color;
		ctx.fillRect(x, y - 10, LANE_WIDTH, TILE_HEIGHT);
	}
}

function lane_activation(i) {
	return (i == 0 && keyboard["d"][1])
		|| (i == 1 && keyboard["f"][1])
		|| (i == 2 && keyboard["j"][1])
		|| (i == 3 && keyboard["k"][1])
		|| (i == 4 && keyboard["l"][1]);
}

function draw(lanes) {
	for (let i = 0; i < lanes.length; i++) {
        const notes = lanes[i];
		const note_color = [
			"#00ff00",
			"#ff0000",
			"#ffff00",
			"#0000ff",
			"#ffa500",
		][i];
        const x = LANE_LEFT + (LANE_WIDTH + LANE_PADDING) * i;
		const lane_y = get_y_coord(0.0);
        const lane_activated = lane_activation(i);
		//let chord = new Array(5);
		//for (let c = 0; c < 5; c++) {
		//	chord[c] = lane_activation(c);
		//}
		for (let j = 0; j < notes.length; j++) {
			const note = notes[j];
			if (note.countdown < MIN_NOTE_DISPLAY) {
				notes.shift();
				j--;
				continue;
			}
			if (note.countdown > MAX_NOTE_DISPLAY) {
				continue;
			}
			if (lane_activated && Math.abs(note.countdown) < GRACE_PERIOD) {
				//chord[i] = false;
				notes.shift();
				j--;
				continue;
			}
            const y = get_y_coord(note.countdown);
			draw_note(x, y, note_color);
        }
		//if (chord.any(x => x)) {
		//	alert("You played extra notes");
		//}
		const lane_color = lane_activated ? "#00ffff" : "#000000";
		draw_note(x, lane_y, lane_color, true);
    }
}

let last_frame_time = new Date().getTime() / 1000;
function tick() {
    if (keyboard["g"][1]) {
		game_running = !game_running;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    const current_frame_time = new Date().getTime() / 1000;
    const delta_time = current_frame_time - last_frame_time;
    last_frame_time = current_frame_time;
    for (let notes of lanes) {
        for (let note of notes) {
            note.update(game_running ? delta_time : 0);
        }
    }
    draw(lanes);
	for (const key in keyboard) {
		keyboard[key][1] = false;
		keyboard[key][2] = false;
	}
    window.requestAnimationFrame(tick);
}

tick();
