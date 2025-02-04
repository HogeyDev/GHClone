#!/usr/bin/node

import { readFileSync, writeFileSync } from "node:fs";

const contents = readFileSync("ttfaf_notes.raw", "utf8");
const RESOLUTION = 480;

const moras = [[], [], [], [], []];

for (let line of contents.split("\n")) {
    line = line.trimStart();
    if (line.length == 0) continue;
    const [tick, data] = line.split(" = ");
    const [type, lane, duration] = data.split(" ");
    if (lane > 4) continue;
    if (type != "N") continue;
    moras[parseInt(lane)].push(parseInt(tick) / RESOLUTION);
}

writeFileSync("ttfaf_notes.mora", JSON.stringify(moras), "utf8");
