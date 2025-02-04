#!/usr/bin/node

import { readFileSync, writeFileSync } from "node:fs";

const contents = readFileSync("ttfaf_notes.raw", "utf8");
const RESOLUTION = 480;

const mora = [];

for (let line of contents.split("\n")) {
    line = line.trimStart();
    if (line.length == 0) continue;
    const [tick, data] = line.split(" = ");
    const [type, lane, duration] = data.split(" ");
    if (lane >= 5) continue;
    if (type != "N") continue;
    mora.push([Math.pow(2, parseInt(lane)), parseInt(tick) / RESOLUTION]);
}

writeFileSync("ttfaf_notes.mora", JSON.stringify(mora), "utf8");
