import { h } from 'preact';
export const Activity = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" })));
};
//# sourceMappingURL=activity.js.map
import { h } from 'preact';
export const AlertCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
        h("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })));
};
//# sourceMappingURL=alert-circle.js.map
import { h } from 'preact';
export const Aperture = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "14.31", y1: "8", x2: "20.05", y2: "17.94" }),
        h("line", { x1: "9.69", y1: "8", x2: "21.17", y2: "8" }),
        h("line", { x1: "7.38", y1: "12", x2: "13.12", y2: "2.06" }),
        h("line", { x1: "9.69", y1: "16", x2: "3.95", y2: "6.06" }),
        h("line", { x1: "14.31", y1: "16", x2: "2.83", y2: "16" }),
        h("line", { x1: "16.62", y1: "12", x2: "10.88", y2: "21.94" })));
};
//# sourceMappingURL=aperture.js.map
import { h } from 'preact';
export const Cast = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" }),
        h("line", { x1: "2", y1: "20", x2: "2.01", y2: "20" })));
};
//# sourceMappingURL=cast.js.map
import { h } from 'preact';
export const CheckCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
        h("polyline", { points: "22 4 12 14.01 9 11.01" })));
};
//# sourceMappingURL=check-circle.js.map
import { h } from 'preact';
export const ChevronDown = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "6 9 12 15 18 9" })));
};
//# sourceMappingURL=chevron-down.js.map
import { h } from 'preact';
export const ChevronLeft = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "15 18 9 12 15 6" })));
};
//# sourceMappingURL=chevron-left.js.map
import { h } from 'preact';
export const ChevronRight = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "9 18 15 12 9 6" })));
};
//# sourceMappingURL=chevron-right.js.map
import { h } from 'preact';
export const Circle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" })));
};
//# sourceMappingURL=circle.js.map
import { h } from 'preact';
export const Crosshair = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
        h("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
        h("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
        h("line", { x1: "12", y1: "22", x2: "12", y2: "18" })));
};
//# sourceMappingURL=crosshair.js.map
import { h } from 'preact';
export const Download = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        h("polyline", { points: "7 10 12 15 17 10" }),
        h("line", { x1: "12", y1: "15", x2: "12", y2: "3" })));
};
//# sourceMappingURL=download.js.map
import { h } from 'preact';
export const EyeOff = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }),
        h("line", { x1: "1", y1: "1", x2: "23", y2: "23" })));
};
//# sourceMappingURL=eye-off.js.map
import { h } from 'preact';
export const Eye = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
        h("circle", { cx: "12", cy: "12", r: "3" })));
};
//# sourceMappingURL=eye.js.map
import { h } from 'preact';
export const File = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }),
        h("polyline", { points: "13 2 13 9 20 9" })));
};
//# sourceMappingURL=file.js.map
import { h } from 'preact';
export const Flag = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" }),
        h("line", { x1: "4", y1: "22", x2: "4", y2: "15" })));
};
//# sourceMappingURL=flag.js.map
import { h } from 'preact';
export const Frown = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("path", { d: "M16 16s-1.5-2-4-2-4 2-4 2" }),
        h("line", { x1: "9", y1: "9", x2: "9.01", y2: "9" }),
        h("line", { x1: "15", y1: "9", x2: "15.01", y2: "9" })));
};
//# sourceMappingURL=frown.js.map
import { h } from 'preact';
export const HardDrive = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "22", y1: "12", x2: "2", y2: "12" }),
        h("path", { d: "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }),
        h("line", { x1: "6", y1: "16", x2: "6.01", y2: "16" }),
        h("line", { x1: "10", y1: "16", x2: "10.01", y2: "16" })));
};
//# sourceMappingURL=hard-drive.js.map
import { h } from 'preact';
export const HelpCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
        h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })));
};
//# sourceMappingURL=help-circle.js.map
import { h } from 'preact';
export const Home = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
        h("polyline", { points: "9 22 9 12 15 12 15 22" })));
};
//# sourceMappingURL=home.js.map
import { h } from 'preact';
export const Image = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
        h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
        h("polyline", { points: "21 15 16 10 5 21" })));
};
//# sourceMappingURL=image.js.map
import { h } from 'preact';
export const Info = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
        h("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })));
};
//# sourceMappingURL=info.js.map
import { h } from 'preact';
export const Layers = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }),
        h("polyline", { points: "2 17 12 22 22 17" }),
        h("polyline", { points: "2 12 12 17 22 12" })));
};
//# sourceMappingURL=layers.js.map
import { h } from 'preact';
export const LifeBuoy = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("circle", { cx: "12", cy: "12", r: "4" }),
        h("line", { x1: "4.93", y1: "4.93", x2: "9.17", y2: "9.17" }),
        h("line", { x1: "14.83", y1: "14.83", x2: "19.07", y2: "19.07" }),
        h("line", { x1: "14.83", y1: "9.17", x2: "19.07", y2: "4.93" }),
        h("line", { x1: "14.83", y1: "9.17", x2: "18.36", y2: "5.64" }),
        h("line", { x1: "4.93", y1: "19.07", x2: "9.17", y2: "14.83" })));
};
//# sourceMappingURL=life-buoy.js.map
import { h } from 'preact';
export const List = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
        h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
        h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
        h("line", { x1: "3", y1: "6", x2: "3.01", y2: "6" }),
        h("line", { x1: "3", y1: "12", x2: "3.01", y2: "12" }),
        h("line", { x1: "3", y1: "18", x2: "3.01", y2: "18" })));
};
//# sourceMappingURL=list.js.map
import { h } from 'preact';
export const Lock = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        h("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })));
};
//# sourceMappingURL=lock.js.map
import { h } from 'preact';
export const LogOut = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
        h("polyline", { points: "16 17 21 12 16 7" }),
        h("line", { x1: "21", y1: "12", x2: "9", y2: "12" })));
};
//# sourceMappingURL=log-out.js.map
import { h } from 'preact';
export const Maximize = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" })));
};
//# sourceMappingURL=maximize.js.map
import { h } from 'preact';
export const MessageSquare = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })));
};
//# sourceMappingURL=message-square.js.map
import { h } from 'preact';
export const Minimize = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" })));
};
//# sourceMappingURL=minimize.js.map
import { h } from 'preact';
export const Minus = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "5", y1: "12", x2: "19", y2: "12" })));
};
//# sourceMappingURL=minus.js.map
import { h } from 'preact';
export const Move = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "5 9 2 12 5 15" }),
        h("polyline", { points: "9 5 12 2 15 5" }),
        h("polyline", { points: "15 19 12 22 9 19" }),
        h("polyline", { points: "19 9 22 12 19 15" }),
        h("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
        h("line", { x1: "12", y1: "2", x2: "12", y2: "22" })));
};
//# sourceMappingURL=move.js.map
import { h } from 'preact';
export const PauseCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "10", y1: "15", x2: "10", y2: "9" }),
        h("line", { x1: "14", y1: "15", x2: "14", y2: "9" })));
};
//# sourceMappingURL=pause-circle.js.map
import { h } from 'preact';
export const PlayCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("polygon", { points: "10 8 16 12 10 16 10 8" })));
};
//# sourceMappingURL=play-circle.js.map
import { h } from 'preact';
export const Play = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polygon", { points: "5 3 19 12 5 21 5 3" })));
};
//# sourceMappingURL=play.js.map
import { h } from 'preact';
export const PlusCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "12", y1: "8", x2: "12", y2: "16" }),
        h("line", { x1: "8", y1: "12", x2: "16", y2: "12" })));
};
//# sourceMappingURL=plus-circle.js.map
import { h } from 'preact';
export const Plus = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
        h("line", { x1: "5", y1: "12", x2: "19", y2: "12" })));
};
//# sourceMappingURL=plus.js.map
import { h } from 'preact';
export const Power = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }),
        h("line", { x1: "12", y1: "2", x2: "12", y2: "12" })));
};
//# sourceMappingURL=power.js.map
import { h } from 'preact';
export const RefreshCcw = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "1 4 1 10 7 10" }),
        h("polyline", { points: "23 20 23 14 17 14" }),
        h("path", { d: "M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" })));
};
//# sourceMappingURL=refresh-ccw.js.map
import { h } from 'preact';
export const RotateCcw = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "1 4 1 10 7 10" }),
        h("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })));
};
//# sourceMappingURL=rotate-ccw.js.map
import { h } from 'preact';
export const Save = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
        h("polyline", { points: "17 21 17 13 7 13 7 21" }),
        h("polyline", { points: "7 3 7 8 15 8" })));
};
//# sourceMappingURL=save.js.map
import { h } from 'preact';
export const Search = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "11", cy: "11", r: "8" }),
        h("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })));
};
//# sourceMappingURL=search.js.map
import { h } from 'preact';
export const Send = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
        h("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })));
};
//# sourceMappingURL=send.js.map
import { h } from 'preact';
export const Server = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "2", y: "2", width: "20", height: "8", rx: "2", ry: "2" }),
        h("rect", { x: "2", y: "14", width: "20", height: "8", rx: "2", ry: "2" }),
        h("line", { x1: "6", y1: "6", x2: "6.01", y2: "6" }),
        h("line", { x1: "6", y1: "18", x2: "6.01", y2: "18" })));
};
//# sourceMappingURL=server.js.map
import { h } from 'preact';
export const Settings = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "3" }),
        h("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })));
};
//# sourceMappingURL=settings.js.map
import { h } from 'preact';
export const Slash = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "4.93", y1: "4.93", x2: "19.07", y2: "19.07" })));
};
//# sourceMappingURL=slash.js.map
import { h } from 'preact';
export const Sliders = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "4", y1: "21", x2: "4", y2: "14" }),
        h("line", { x1: "4", y1: "10", x2: "4", y2: "3" }),
        h("line", { x1: "12", y1: "21", x2: "12", y2: "12" }),
        h("line", { x1: "12", y1: "8", x2: "12", y2: "3" }),
        h("line", { x1: "20", y1: "21", x2: "20", y2: "16" }),
        h("line", { x1: "20", y1: "12", x2: "20", y2: "3" }),
        h("line", { x1: "1", y1: "14", x2: "7", y2: "14" }),
        h("line", { x1: "9", y1: "8", x2: "15", y2: "8" }),
        h("line", { x1: "17", y1: "16", x2: "23", y2: "16" })));
};
//# sourceMappingURL=sliders.js.map
import { h } from 'preact';
export const StopCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("rect", { x: "9", y: "9", width: "6", height: "6" })));
};
//# sourceMappingURL=stop-circle.js.map
import { h } from 'preact';
export const Terminal = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "4 17 10 11 4 5" }),
        h("line", { x1: "12", y1: "19", x2: "20", y2: "19" })));
};
//# sourceMappingURL=terminal.js.map
import { h } from 'preact';
export const Thermometer = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" })));
};
//# sourceMappingURL=thermometer.js.map
import { h } from 'preact';
export const Tool = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" })));
};
//# sourceMappingURL=tool.js.map
import { h } from 'preact';
export const Trash2 = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "3 6 5 6 21 6" }),
        h("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
        h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
        h("line", { x1: "14", y1: "11", x2: "14", y2: "17" })));
};
//# sourceMappingURL=trash-2.js.map
import { h } from 'preact';
export const Upload = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        h("polyline", { points: "17 8 12 3 7 8" }),
        h("line", { x1: "12", y1: "3", x2: "12", y2: "15" })));
};
//# sourceMappingURL=upload.js.map
import { h } from 'preact';
export const XCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "15", y1: "9", x2: "9", y2: "15" }),
        h("line", { x1: "9", y1: "9", x2: "15", y2: "15" })));
};
//# sourceMappingURL=x-circle.js.map
import { h } from 'preact';
export const ZapOff = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "12.41 6.75 13 2 10.57 4.92" }),
        h("polyline", { points: "18.57 12.91 21 10 15.66 10" }),
        h("polyline", { points: "8 8 3 14 12 14 11 22 16 16" }),
        h("line", { x1: "1", y1: "1", x2: "23", y2: "23" })));
};
//# sourceMappingURL=zap-off.js.map
import { h } from 'preact';
export const ArrowDown = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
        h("polyline", { points: "19 12 12 19 5 12" })));
};
//# sourceMappingURL=arrow-down.js.map
import { h } from 'preact';
export const ArrowUp = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
        h("polyline", { points: "5 12 12 5 19 12" })));
};
//# sourceMappingURL=arrow-up.js.map
import { h } from 'preact';
export const Minimize2 = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "4 14 10 14 10 20" }),
        h("polyline", { points: "20 10 14 10 14 4" }),
        h("line", { x1: "14", y1: "10", x2: "21", y2: "3" }),
        h("line", { x1: "3", y1: "21", x2: "10", y2: "14" })));
};
//# sourceMappingURL=minimize-2.js.map
import { h } from 'preact';
export const Pause = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "6", y: "4", width: "4", height: "16" }),
        h("rect", { x: "14", y: "4", width: "4", height: "16" })));
};
//# sourceMappingURL=pause.js.map
import { h } from 'preact';
export const Delete = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" }),
        h("line", { x1: "18", y1: "9", x2: "12", y2: "15" }),
        h("line", { x1: "12", y1: "9", x2: "18", y2: "15" })));
};
//# sourceMappingURL=delete.js.map
import { h } from 'preact';
export const Edit = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
        h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
};
//# sourceMappingURL=edit.js.map
import { h } from 'preact';
export const Filter = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" })));
};
//# sourceMappingURL=filter.js.map
import { h } from 'preact';
export const GitCommit = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "4" }),
        h("line", { x1: "1.05", y1: "12", x2: "7", y2: "12" }),
        h("line", { x1: "17.01", y1: "12", x2: "22.96", y2: "12" })));
};
//# sourceMappingURL=git-commit.js.map
import { h } from 'preact';
export const Grid = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "3", width: "7", height: "7" }),
        h("rect", { x: "14", y: "3", width: "7", height: "7" }),
        h("rect", { x: "14", y: "14", width: "7", height: "7" }),
        h("rect", { x: "3", y: "14", width: "7", height: "7" })));
};
//# sourceMappingURL=grid.js.map
import { h } from 'preact';
export const Heart = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })));
};
//# sourceMappingURL=heart.js.map
import { h } from 'preact';
export const Loader = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "12", y1: "2", x2: "12", y2: "6" }),
        h("line", { x1: "12", y1: "18", x2: "12", y2: "22" }),
        h("line", { x1: "4.93", y1: "4.93", x2: "7.76", y2: "7.76" }),
        h("line", { x1: "16.24", y1: "16.24", x2: "19.07", y2: "19.07" }),
        h("line", { x1: "2", y1: "12", x2: "6", y2: "12" }),
        h("line", { x1: "18", y1: "12", x2: "22", y2: "12" }),
        h("line", { x1: "4.93", y1: "19.07", x2: "7.76", y2: "16.24" }),
        h("line", { x1: "16.24", y1: "7.76", x2: "19.07", y2: "4.93" })));
};
//# sourceMappingURL=loader.js.map
import { h } from 'preact';
export const MapPin = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
        h("circle", { cx: "12", cy: "10", r: "3" })));
};
//# sourceMappingURL=map-pin.js.map
import { h } from 'preact';
export const Meh = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "8", y1: "15", x2: "16", y2: "15" }),
        h("line", { x1: "9", y1: "9", x2: "9.01", y2: "9" }),
        h("line", { x1: "15", y1: "9", x2: "15.01", y2: "9" })));
};
//# sourceMappingURL=meh.js.map
import { h } from 'preact';
export const Menu = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
        h("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        h("line", { x1: "3", y1: "18", x2: "21", y2: "18" })));
};
//# sourceMappingURL=menu.js.map
import { h } from 'preact';
export const MinusCircle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "8", y1: "12", x2: "16", y2: "12" })));
};
//# sourceMappingURL=minus-circle.js.map
import { h } from 'preact';
export const Moon = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })));
};
//# sourceMappingURL=moon.js.map
import { h } from 'preact';
export const MoreHorizontal = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "1" }),
        h("circle", { cx: "19", cy: "12", r: "1" }),
        h("circle", { cx: "5", cy: "12", r: "1" })));
};
//# sourceMappingURL=more-horizontal.js.map
import { h } from 'preact';
export const MoreVertical = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "1" }),
        h("circle", { cx: "12", cy: "5", r: "1" }),
        h("circle", { cx: "12", cy: "19", r: "1" })));
};
//# sourceMappingURL=more-vertical.js.map
import { h } from 'preact';
export const Percent = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("line", { x1: "19", y1: "5", x2: "5", y2: "19" }),
        h("circle", { cx: "6.5", cy: "6.5", r: "2.5" }),
        h("circle", { cx: "17.5", cy: "17.5", r: "2.5" })));
};
//# sourceMappingURL=percent.js.map
import { h } from 'preact';
export const RefreshCw = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "23 4 23 10 17 10" }),
        h("polyline", { points: "1 20 1 14 7 14" }),
        h("path", { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" })));
};
//# sourceMappingURL=refresh-cw.js.map
import { h } from 'preact';
export const Repeat = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "17 1 21 5 17 9" }),
        h("path", { d: "M3 11V9a4 4 0 0 1 4-4h14" }),
        h("polyline", { points: "7 23 3 19 7 15" }),
        h("path", { d: "M21 13v2a4 4 0 0 1-4 4H3" })));
};
//# sourceMappingURL=repeat.js.map
import { h } from 'preact';
export const Scissors = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "6", cy: "6", r: "3" }),
        h("circle", { cx: "6", cy: "18", r: "3" }),
        h("line", { x1: "20", y1: "4", x2: "8.12", y2: "15.88" }),
        h("line", { x1: "14.47", y1: "14.48", x2: "20", y2: "20" }),
        h("line", { x1: "8.12", y1: "8.12", x2: "12", y2: "12" })));
};
//# sourceMappingURL=scissors.js.map
import { h } from 'preact';
export const Star = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" })));
};
//# sourceMappingURL=star.js.map
import { h } from 'preact';
export const Sun = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "5" }),
        h("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
        h("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
        h("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
        h("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
        h("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
        h("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
        h("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
        h("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })));
};
//# sourceMappingURL=sun.js.map
import { h } from 'preact';
export const Sunrise = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M17 18a5 5 0 0 0-10 0" }),
        h("line", { x1: "12", y1: "2", x2: "12", y2: "9" }),
        h("line", { x1: "4.22", y1: "10.22", x2: "5.64", y2: "11.64" }),
        h("line", { x1: "1", y1: "18", x2: "3", y2: "18" }),
        h("line", { x1: "21", y1: "18", x2: "23", y2: "18" }),
        h("line", { x1: "18.36", y1: "11.64", x2: "19.78", y2: "10.22" }),
        h("line", { x1: "23", y1: "22", x2: "1", y2: "22" }),
        h("polyline", { points: "8 6 12 2 16 6" })));
};
//# sourceMappingURL=sunrise.js.map
import { h } from 'preact';
export const Sunset = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M17 18a5 5 0 0 0-10 0" }),
        h("line", { x1: "12", y1: "9", x2: "12", y2: "2" }),
        h("line", { x1: "4.22", y1: "10.22", x2: "5.64", y2: "11.64" }),
        h("line", { x1: "1", y1: "18", x2: "3", y2: "18" }),
        h("line", { x1: "21", y1: "18", x2: "23", y2: "18" }),
        h("line", { x1: "18.36", y1: "11.64", x2: "19.78", y2: "10.22" }),
        h("line", { x1: "23", y1: "22", x2: "1", y2: "22" }),
        h("polyline", { points: "16 5 12 9 8 5" })));
};
//# sourceMappingURL=sunset.js.map
import { h } from 'preact';
export const Tag = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" }),
        h("line", { x1: "7", y1: "7", x2: "7.01", y2: "7" })));
};
//# sourceMappingURL=tag.js.map
import { h } from 'preact';
export const Target = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("circle", { cx: "12", cy: "12", r: "6" }),
        h("circle", { cx: "12", cy: "12", r: "2" })));
};
//# sourceMappingURL=target.js.map
import { h } from 'preact';
export const Underline = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" }),
        h("line", { x1: "4", y1: "21", x2: "20", y2: "21" })));
};
//# sourceMappingURL=underline.js.map
import { h } from 'preact';
export const Wind = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" })));
};
//# sourceMappingURL=wind.js.map
import { h } from 'preact';
export const Zap = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" })));
};
//# sourceMappingURL=zap.js.map
import { h } from 'preact';
export const Layout = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
        h("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
        h("line", { x1: "9", y1: "21", x2: "9", y2: "9" })));
};
//# sourceMappingURL=layout.js.map
import { h } from 'preact';
export const Trello = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
        h("rect", { x: "7", y: "7", width: "3", height: "9" }),
        h("rect", { x: "14", y: "7", width: "3", height: "5" })));
};
//# sourceMappingURL=trello.js.map
import { h } from 'preact';
export const AlertTriangle = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
        h("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
        h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })));
};
//# sourceMappingURL=alert-triangle.js.map
import { h } from 'preact';
export const BookOpen = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
        h("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })));
};
//# sourceMappingURL=book-open.js.map
import { h } from 'preact';
export const Github = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" })));
};
//# sourceMappingURL=github.js.map
import { h } from 'preact';
export const UploadCloud = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "16 16 12 12 8 16" }),
        h("line", { x1: "12", y1: "12", x2: "12", y2: "21" }),
        h("path", { d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" }),
        h("polyline", { points: "16 16 12 12 8 16" })));
};
//# sourceMappingURL=upload-cloud.js.map
import { h } from 'preact';
export const Anchor = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("circle", { cx: "12", cy: "5", r: "3" }),
        h("line", { x1: "12", y1: "22", x2: "12", y2: "8" }),
        h("path", { d: "M5 12H2a10 10 0 0 0 20 0h-3" })));
};
//# sourceMappingURL=anchor.js.map
import { h } from 'preact';
export const ChevronsDown = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "7 13 12 18 17 13" }),
        h("polyline", { points: "7 6 12 11 17 6" })));
};
//# sourceMappingURL=chevrons-down.js.map
import { h } from 'preact';
export const ChevronsUp = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "17 11 12 6 7 11" }),
        h("polyline", { points: "17 18 12 13 7 18" })));
};
//# sourceMappingURL=chevrons-up.js.map
import { h } from 'preact';
export const Square = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" })));
};
//# sourceMappingURL=square.js.map
import { h } from 'preact';
export const ExternalLink = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
        h("polyline", { points: "15 3 21 3 21 9" }),
        h("line", { x1: "10", y1: "14", x2: "21", y2: "3" })));
};
//# sourceMappingURL=external-link.js.map
import { h } from 'preact';
export const CornerRightUp = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("polyline", { points: "10 9 15 4 20 9" }),
        h("path", { d: "M4 20h7a4 4 0 0 0 4-4V4" })));
};
//# sourceMappingURL=corner-right-up.js.map
import { h } from 'preact';
export const Edit3 = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M12 20h9" }),
        h("path", { d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" })));
};
//# sourceMappingURL=edit-3.js.map
import { h } from 'preact';
export const FolderPlus = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" }),
        h("line", { x1: "12", y1: "11", x2: "12", y2: "17" }),
        h("line", { x1: "9", y1: "14", x2: "15", y2: "14" })));
};
//# sourceMappingURL=folder-plus.js.map
import { h } from 'preact';
export const Folder = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" })));
};
//# sourceMappingURL=folder.js.map
import { h } from 'preact';
export const Unlock = (props) => {
    const color = props.color || 'currentColor';
    const size = props.size || 24;
    delete props.color;
    delete props.size;
    return (h("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, props),
        h("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
        h("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })));
};
//# sourceMappingURL=unlock.js.map