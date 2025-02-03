const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRACE_PERIOD = 0.2;

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

const MIN_NOTE_DISPLAY = -0.3;
const MAX_NOTE_DISPLAY = 1.5;
const LANE_LEFT = 100;
const LANE_WIDTH = 50;
const lanes = [[new Note(1)], [], [], [], []];

function draw(lanes) {
    for (let i = 0; i < lanes.length; i++) {
        const notes = lanes[i];
        const x = LANE_LEFT + LANE_WIDTH * i;
        for (const note of notes.filter(x => x.countdown >= MIN_NOTE_DISPLAY && x.countdown <= MAX_NOTE_DISPLAY)) {
            const y = 1 - (note.countdown - MIN_NOTE_DISPLAY) / (MAX_NOTE_DISPLAY - MIN_NOTE_DISPLAY);
            ctx.fillRect(x, y * canvas.height, LANE_WIDTH, -20);
        }
    }
}

let last_frame_time = new Date().getTime() / 1000;
function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const current_frame_time = new Date().getTime() / 1000;
    const delta_time = current_frame_time - last_frame_time;
    last_frame_time = current_frame_time;
    for (let notes of lanes) {
        for (let note of notes) {
            note.update(delta_time);
        } 
    }
    draw(lanes);
    window.requestAnimationFrame(tick);
}

tick();
