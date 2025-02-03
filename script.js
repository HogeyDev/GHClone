const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const state = Object.freeze({
    Menu: 0,
    Playing: 1,
    Paused: 2,
});

const GRACE_PERIOD = 0.1;
const SPEED_MULTIPLIER = 1.0;

class Note {
    constructor(offset) {
        this.countdown = offset;
        this.is_clickable = false;
    }
    update(delta_time) {
        this.countdown -= SPEED_MULTIPLIER * delta_time;
        this.is_clickable = Math.abs(this.countdown) <= GRACE_PERIOD;
    }
}

function get_y_coord(y) {
	return canvas.height * (1 - (y - MIN_NOTE_DISPLAY) / (MAX_NOTE_DISPLAY - MIN_NOTE_DISPLAY));
}

const INTRO_TIME = 1.0;
const SONG_INTRO_TIME = 0.3;
const MIN_NOTE_DISPLAY = -0.3;
const MAX_NOTE_DISPLAY = 1.5;
const TILE_HEIGHT = (get_y_coord(GRACE_PERIOD) - get_y_coord(0.0)) * SPEED_MULTIPLIER;
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

	"Shift": [false, false, false],
    "Enter": [false, false, false],
}
window.onkeydown = (e) => {
	keyboard[e.key] = [true, true, false];
}
window.onkeyup = (e) => {
	keyboard[e.key] = [false, false, true];
}

const BPM = 192;
const M = 60 / BPM;

function import_song(notes) {
    console.log(`${notes.reduce((acc, lane) => acc + lane.length, 0)} notes`);
	for (let i = 0; i < notes.length; i++) {
		for (let j = 0; j < notes[i].length; j++) {
			lanes[i].push(new Note(SPEED_MULTIPLIER * (notes[i][j] + INTRO_TIME + SONG_INTRO_TIME)));
		}
	}
}
function import_song_mora(notes) {
    const new_notes = notes.map(lane => lane.map(note => note * M));
    import_song(new_notes);
}

import_song_mora([
    [6.5, 8.5],
    [1, 3.5, 4.5, 7, 9, 11.5, 13, 15, 17, 19.5, 20.5],
    [3, 5.5, 7.5, 9.5, 10.5, 14.5, 15.5, 19],
    [4, 11, 12.5, 13.5, 20],
    [0, 2, 12, 16, 18],
]);

function draw_note(x, y, color, stroked=false) {
	if (stroked) {
		ctx.strokeStyle = color;
		ctx.lineWidth = 5.0;
		ctx.strokeRect(x, y - 10, LANE_WIDTH, TILE_HEIGHT);
	} else {
		ctx.fillStyle = color;
		ctx.fillRect(x, y - 10, LANE_WIDTH, TILE_HEIGHT);
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 3.0;
		ctx.strokeRect(x, y - 10, LANE_WIDTH, TILE_HEIGHT);
	}
}

function lane_activation(i, col) {
	return (i == 0 && keyboard["d"][col])
		|| (i == 1 && keyboard["f"][col])
		|| (i == 2 && keyboard["j"][col])
		|| (i == 3 && keyboard["k"][col])
		|| (i == 4 && keyboard["l"][col]);
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
        const lane_activated = lane_activation(i, 1);
        let missed_note = false;
        let hit_note = false;
		for (let j = notes.length - 1; j >= 0; j--) {
			const note = notes[j];
			if (note.countdown < MIN_NOTE_DISPLAY) {
                missed_note |= true;
                console.debug("Went offscreen", i);
				notes.shift();
				j--;
				continue;
			}
			if (note.countdown > MAX_NOTE_DISPLAY) {
				continue;
			}
			if (lane_activated) {
                if (Math.abs(note.countdown) < GRACE_PERIOD) {
                    hit_note = true;
                    missed_note = false;
                    console.debug("Hit", i);
                    notes.shift();
                    j--;
                    continue;
                } else if (!hit_note) {
                    missed_note |= true;
                    console.debug("Extra note", i);
                }
			}
            const y = get_y_coord(notes[j].countdown);
			draw_note(x, y, note_color);
        }
		const lane_color = lane_activation(i, 0) ? "#00a5ff" : "#000000";
		draw_note(x, lane_y, lane_color, true);
    }
}

let current_state = state.Menu;

const song = new Audio("magical_cure.mp3");
song.volume = 0.01;
let last_frame_time = -1;
function menu_tick() {
    const button_width = canvas.width * 0.15;
    const button_height = canvas.height * 0.1;
    const button_x = (canvas.width - button_width) / 2;
    const button_y = (canvas.height - button_height) / 2;

    ctx.fillStyle = "#86cecb";
    ctx.strokeStyle = "#137a7f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(button_x, button_y, button_width, button_height, [20, 20]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (keyboard["Enter"][1]) {
        current_state = state.Playing;
        setTimeout(() => {
            song.play();
        }, INTRO_TIME * 1000);
    }
}
function playing_tick() {
    if (keyboard["Shift"][1]) {
		game_running = !game_running;
        if (game_running) {
            song.play();
        } else {
            song.pause();
        }
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    const current_frame_time = new Date().getTime() / 1000;
    let delta_time = current_frame_time - last_frame_time;
    if (last_frame_time < 0) {
        delta_time = 0;
    }
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
}
function tick() {
    switch (current_state) {
        case state.Menu:
            menu_tick();
            break;
        case state.Playing:
            playing_tick();
            break;
        case state.Paused:
            console.error("state.Paused is not implemented yet");
            break;
    }
    window.requestAnimationFrame(tick);
}

tick();
