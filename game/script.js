const volume_slider = document.querySelector(".volume-slider");
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
const SPEED_HACK = 1.0;
const SPEED_MULTIPLIER = 1.0;
const START_OFFSET = 0;

class Note {
    constructor(offset) {
        this.countdown = offset / SPEED_HACK;
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
let combo = 0;

let keyboard = {
	"d": [false, false, false],
	"f": [false, false, false],
	"j": [false, false, false],
	"k": [false, false, false],
	"l": [false, false, false],

	"h": [false, false, false],
    "Enter": [false, false, false],
    " ": [false, false, false],
}
window.onkeydown = (e) => {
	keyboard[e.key] = [true, true, false];
}
window.onkeyup = (e) => {
	keyboard[e.key] = [false, false, true];
}

volume_slider.addEventListener("input", () => {
    song.volume = volume_slider.value / 100;
});

const BPM = 192;
const M = 60 / BPM; // this has basically no use, but it is used to get notes delays in terms of seconds instead of beats

function import_song(notes) {
    console.log(`${notes.reduce((acc, lane) => acc + lane.length, 0)} notes`);
	for (let i = 0; i < notes.length; i++) {
		for (let j = 0; j < notes[i].length; j++) {
			lanes[i].push(new Note(SPEED_MULTIPLIER * (notes[i][j] + INTRO_TIME + SONG_INTRO_TIME - START_OFFSET)));
		}
	}
}
function import_song_mora(notes) {
    const new_notes = notes.map(lane => lane.map(note => note * M));
    import_song(new_notes);
}
function import_song_chord(notes) {
    let new_notes = [[], [], [], [], []];
    let time = 0;
    for (const note of notes) {
        console.log(note);
        time += note[1];
        for (let i = 0; i < 5; i++) {
            if (note[0] >> i & 1) {
                new_notes[i].push(time);
            }
        }
    }
    import_song_mora(new_notes);
}
function mora_to_chord(lanes) {
    const pairs = [];
    for (let i = 0; i < lanes.length; i++) {
        for (const note of lanes[i]) {
            pairs.push([i, note]);
        }
    }
    pairs.sort((a, b) => a[1] - b[1]);

    const compressed = [];
    for (let i = 0; i < pairs.length;) {
        const chord = [];
        const offset = pairs[i][1];
        while (pairs[i] !== undefined && pairs[i][1] == offset) {
            chord.push(pairs[i][0]);
            i++;
        }
        const encoded = chord.sort().map((x) => Math.pow(2, x)).reduce((arr, val) => arr + val, 0);
        compressed.push([encoded, offset]);
    }

    const delta_compressed = [JSON.parse(JSON.stringify(compressed[0]))];
    for (let i = 1; i < compressed.length; i++) {
        const delta = compressed[i][1] - compressed[i - 1][1];
        delta_compressed.push([compressed[i][0], delta]);
    }

    return delta_compressed;
}

const spam_3_2 = (lead_delta) => [
    [4, lead_delta], [1, 0.25],
    [8, 0.25], [2, 0.25],
    [16, 0.25], [2, 0.25],
    [8, 0.25], [1, 0.25],
    [4, 0.25], [1, 0.25],
    [8, 0.25], [2, 0.25],
    [16, 0.25], [2, 0.25],
    [8, 0.25], [1, 0.25],
    [4, 0.25]
];
import_song_chord([
    [16, 0],
    [2, 1],
    [16, 1],
    [4, 1],
    [2, 0.5],
    [8, 0.5],
    [2, 0.5],
    [4, 1],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    [4, 1],
    [8, 0.5],
    [2, 0.5],
    [16, 0.5],
    [8, 0.5],
    [2, 0.5],
    [8, 0.5],
    [4, 1],
    [2, 0.5],
    [4, 0.5],
    [16, 0.5],
    [2, 1],
    [16, 1],
    [4, 1],
    [2, 0.5],
    [8, 0.5],
    [2, 0.5],
    [4, 1],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    [2, 0.5],
    [8, 0.5],
    [2, 0.5],
    [4, 0.5],
    [0b00101, 0.5],
    [0b01001, 0.5],
    [0b00110, 1],
    [0b01010, 1],
    [0b00110, 1],
    [16, 0.5],
    [2, 1],
    [16, 1],
    [4, 1],
    [2, 0.5],
    [8, 0.5],
    [2, 0.5],
    [4, 1],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    [1, 1],
    [2, 0.5],
    [4, 0.5],
    ...spam_3_2(4),
]);

function draw_note(x, y, color, is_peg=false) {
	if (is_peg) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y - 5, LANE_WIDTH, 10);
	} else {
		ctx.fillStyle = color;
		ctx.fillRect(x, y - TILE_HEIGHT / 2, LANE_WIDTH, TILE_HEIGHT);
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
    ctx.fillStyle = "#f8f8f240";
    ctx.font = "400px sans";
    ctx.fillText(combo, (canvas.width - ctx.measureText(combo).width) / 2, 600);
	for (let i = 0; i < lanes.length; i++) {
        const notes = lanes[i];
		const note_color = [
			"#50fa7b",
			"#ff5555",
			"#f1fa8c",
			"#6272a4",
			"#ffb86c",
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
        if (hit_note) {
            combo++;
        }
        if (missed_note) {
            combo = 0;
        }
		const lane_color = lane_activation(i, 0) ? "#8be9fd" : "#f8f8f2";
		draw_note(x, lane_y, lane_color, true);
    }
}

let current_state = state.Menu;

const song = new Audio("magical_cure.mp3");
song.currentTime = START_OFFSET;
song.playbackRate = SPEED_HACK;
song.volume = volume_slider.value / 100;
let last_frame_time = -1;
function menu_tick() {
    const button_width = canvas.width * 0.15;
    const button_height = canvas.height * 0.1;
    const button_x = (canvas.width - button_width) / 2;
    const button_y = (canvas.height - button_height) / 2;

    ctx.fillStyle = "#282a36";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#44475a";
    ctx.strokeStyle = "#f8f8f2";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(button_x, button_y, button_width, button_height, [20, 20]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (keyboard[" "][1]) {
        current_state = state.Playing;
        setTimeout(() => {
            song.play();
        }, (INTRO_TIME - START_OFFSET) * 1000 / SPEED_HACK);
    }
}
function playing_tick() {
    if (keyboard["h"][1]) {
		game_running = !game_running;
        if (game_running) {
            song.play();
        } else {
            song.pause();
        }
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#282a36"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
