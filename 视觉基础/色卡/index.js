// WebGL 采用归一化的浮点数值，
// 也就是说，WebGL 的颜色分量 r、g、b、a 的数值都是 0 到 1 之间的浮点数。
import {Vec3} from "../../lib/math/Vec3.js";
import {createProgram, createShader, createDataBuffer, readVertexData, clear} from "../../lib/gl.util.js";
import {calcRegularShapePoints} from "../../lib/util.js";

const canvasList = Array.from(document.querySelectorAll("canvas"));
const ctxList = canvasList.map((canvas, index) => 
    index < 2 ? canvas.getContext("2d") : canvas.getContext("webgl")
);
const row = 5, column = 5;
ctxList.forEach((ctx, i) => {
    if (i < 2) {
        ctx.translate(canvasList[i].width / 2, canvasList[i].height / 2);
        ctx.scale(1, -1);
    }
});
const [ctx1, ctx2, gl1, gl2] = ctxList;
drawColorCard1(ctx1, {row, column});
drawColorCard1(ctx2, {row, column});
Array.from(document.querySelectorAll('button')).forEach((btn, i) => {
    btn.addEventListener("click", () => {
        if (i === 0) {
            ctx1.clearRect(0, 0, 300, 300);
            drawColorCard1(ctx1, {row, column});
        } else {
            ctx2.clearRect(0, 0, 300, 300);
            drawColorCard1(ctx2, {row, column});
        }
    })
})

function randomRgb() {
    return new Vec3(
        0.5 * Math.random(),
        0.5 * Math.random(),
        0.5 * Math.random()
    )
}

/**
 * 绘制随机颜色色卡
 * @param {} param0 
 */
function drawColorCard1(ctx, {row, column}) {
    const left = 20, top = 20, radius = 20;
    for(let i = 0; i < row; i ++) {
        const color = randomRgb();
        for(let j = 0; j < column; j ++) {
            const c = color.clone().scale(0.5 + 0.25 * j);
            ctx.fillStyle = `rgb(${Math.floor(c[0] * 256)},${Math.floor(c[1] * 256)},${Math.floor(c[2] * 256)})`;
            ctx.beginPath();
            ctx.arc((j - (column >> 1)) * (left + 2 * radius), (i - (row >> 1)) * (top + 2 * radius), radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}


function randomHsl() {
    return new Vec3(
        0.5 * Math.random(), // 初始色相随机取0~0.5之间的值
        0.7, // 初始饱和度0.7
        0.45, // 初始亮度0.45
    )
}

/**
 * 绘制随机颜色色卡
 * @param {} param0 
 */
function drawColorCard2(ctx, {row, column}) {
    const left = 20, top = 20, radius = 20;
    const [h, s, l] = randomHsl();
    for(let i = 0; i < row; i ++) {
        const p = (i * 0.25 + h) % 1;
        for(let j = 0; j < column; j ++) {
            const d = j >> 1;
            ctx.fillStyle = `hsl(${Math.floor(p * 360)}, ${Math.floor((0.15 * d + s) * 100)}%, ${Math.floor((0.12 * d + l) * 100)}%)`;
            ctx.beginPath();
            ctx.arc((j - (column >> 1)) * (left + 2 * radius), (i - (row >> 1)) * (top + 2 * radius), radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

[gl1, gl2].forEach((gl, i) => {
    const p = createProgram(
        gl, 
        createShader(gl, gl.VERTEX_SHADER, `
        #define PI 3.1415926535897932384626433832795
        attribute vec2 position;
        varying vec3 color;
        vec3 hsv2rgb(vec3 c){ 
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0); 
            rgb = rgb * rgb * (3.0 - 2.0 * rgb); 
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        void main() {
            // h表示色相 0 到 360
            // 反正切的值是-PI/2到PI/2
            float h = atan(position.y / position.x);
            if (h < 0.0) {
                h += position.x < 0.0 ? PI : 2.0 * PI;
            } else {
                h += position.x < 0.0 ? PI : 0.0;
            }
            // 归一化
            h /= 2.0 * PI;
            float r = sqrt(pow(position.x, 2.0) + pow(position.y, 2.0));
            vec2 sv = ${i === 0 ? 'vec2(r, 0.5)' : 'vec2(0.5, r)'};
            color = hsv2rgb(vec3(h, sv));
            gl_Position = vec4(position, 1.0, 1.0);
        }
        `),
        createShader(gl, gl.FRAGMENT_SHADER, `
        precision mediump float;
        varying vec3 color;
        void main() {
            gl_FragColor = vec4(color, 1.0);
        }
        `),
    );
    const point = calcRegularShapePoints({x: 1, y: 0}, 360);
    createDataBuffer(gl, point);
    readVertexData(gl, p);
    // 三角剖分
    const triangles = earcut(point);
    const cells = new Uint16Array(triangles);
    const cellsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    clear(gl);
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, point.length / 2);
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
})
