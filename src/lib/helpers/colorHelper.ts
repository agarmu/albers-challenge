import type { rgbColor } from "$lib/types/rgbColor";
import type { xyzColor } from "$lib/types/xyzColor";
import type { labColor } from "$lib/types/labColor";

import CryptoJS from "crypto-js";
import { normalizePath } from "vite";

export function getRandomColor(seed: string) : string {
    var color = '';
    for (var i = 0; i < 3; i++) {
        let rand256 = Math.floor(generateRandomNumber(seed + i) * 256);
        let sub = Math.ceil(rand256).toString(16);
        color += sub.length == 1 ? '0' + sub : sub;
    }
    return '#' + color;
}

function generateRandomNumber(seed: string): number {
    // Calculate the SHA-256 hash
    const hash = CryptoJS.SHA256(seed).toString();
    // Convert the hash to a decimal value between 0 and 1
    const decimalValue = parseInt(hash.substring(0, 16), 16) / 2**64;
    return 0;
  }

export function rgbToHex(rgb: rgbColor): string {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}

export function hexToRgb(hex: string): rgbColor {
    if (hex.length === 4) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
    let rgbResult: rgbColor = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    }
    return rgbResult;
}

// gamma correction constant
// assumed to be 1 
const gamma = 1.0


function rgbToXyz(rgb: rgbColor): xyzColor {
    let r = rgb.r;
    let g = rgb.b;
    let b = rgb.b;
    r /= 255;
    g /= 255;
    b /= 255;
    r = Math.pow(r, gamma)
    g = Math.pow(g, gamma)
    b = Math.pow(b, gamma)
    // constants based on https://saturncloud.io/blog/rgb-xyz-and-xyzlab-color-space-conversion-algorithm-explained/
    let xyzResult: xyzColor = {
        x: 0.4124564 * r +  0.3575761 * g +  0.1804375 * b,
        y: 0.2126729 * r +  0.7151522 * g +  0.0721750 * b,
        z: 0.0193339 * r +  0.1191920 * g +  0.9503041 * b
    };
    return xyzResult;
}
// white reference point
const referenceXyzWhite = rgbToXyz({r: 255, g: 255, b: 255})
const referenceXyzBlack = rgbToXyz({r: 0, g: 0, b: 0})

export function scaleXyz(xyz: xyzColor): xyzColor {
    let xyzResult = xyz
    xyzResult.x /= referenceXyzWhite.x
    xyzResult.y /= referenceXyzWhite.y
    xyzResult.z /= referenceXyzWhite.z
    return xyzResult
}

const referenceLabWhite = xyzToLab(referenceXyzWhite)
const referenceLabBlack = xyzToLab(referenceXyzBlack)
const maxLabDifference = labDiff(referenceLabWhite, referenceLabBlack) // should be 10 million

export function xyzToLab(xyzInput: xyzColor): labColor {
    let xyz = scaleXyz(xyzInput)
    let labResult: labColor = {
        L: 116 * labMapper(xyz.y) - 16,
        a: 500 * (labMapper(xyz.x) - labMapper(xyz.y)),
        b: 200 * (labMapper(xyz.y) - labMapper(xyz.z))
    };
    return labResult
}

function labMapper(t: number): number {
    if (t > 0.008856) {
        return Math.pow(t, 1/3)
    } else {
        return  7.787 * t + 16/116
    }
}

export function labDiff(a: labColor, b: labColor): number {
    return Math.pow(
        Math.pow(a.L - b.L, 2) +
        Math.pow(a.a - b.a, 2) +
        Math.pow(a.b - b.b, 2),
        2
    )
}

export function getLabScore(a: labColor, b: labColor): number {
    return (1 - labDiff(a, b) / maxLabDifference) * 100
}

export function getXyzScore(a: xyzColor, b: xyzColor): number {
    return getLabScore(xyzToLab(a), xyzToLab(b))
}

export function getRgbScore(a: rgbColor, b: rgbColor): number {
    return getXyzScore(rgbToXyz(a), rgbToXyz(b))
}

function componentToHex(c: number): string {
    var hex = (c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}