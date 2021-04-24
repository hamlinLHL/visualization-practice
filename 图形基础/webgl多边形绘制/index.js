import {calcRegularShapePoints} from "../../lib/util.js";
import {createShader, createDataBuffer, createProgram, resize, clear, readVertexData} from "../../lib/gl.util.js";

const canvas = document.querySelector('canvas');
// webgl画笔
// WebGL API 是 OpenGL ES 的 JavaScript 绑定版本
const gl = canvas.getContext('webgl');
draw(gl, calcRegularShapePoints({x: 0, y: 1}, 6));
// drawPolygon(gl, 0, 0, 1, 3);
// drawMultiPointedStar(gl, 0, 0, 0.5, 0.7, n, true);


function draw(gl, points, drawMode = gl.TRIANGLE_FAN) {
    // 创建webgl程序
    const program = createProgram(gl,
        createShader(gl, gl.VERTEX_SHADER, document.querySelector('#vertexSource').textContent),
        createShader(gl, gl.FRAGMENT_SHADER, document.querySelector('#fragmentSource').textContent));
    // 属性值从缓冲区读取数据，所以我们要创建一个数据缓冲区
    createDataBuffer(gl, points);
    // 在此之上的代码是 初始化代码。
    // 这些代码在页面加载时只会运行一次。
    // 接下来的代码是渲染代码，
    // 而这些代码将在我们每次要渲染或者绘制时执行。

    resize(gl.canvas);
    // 我们需要告诉WebGL怎样把提供的gl_Position裁剪空间坐标对应到画布像素坐标，
    // 通常我们也把画布像素坐标叫做屏幕空间。
    // 为了实现这个目的，我们只需要调用gl.viewport 方法并传递画布的当前尺寸。
    // 这样就告诉WebGL裁剪空间的 -1 -> +1 分别对应到x轴的 0 -> gl.canvas.width 和y轴的 0 -> gl.canvas.height。
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布
    clear(gl);

    readVertexData(gl, program, 'a_position');

    const offset = 0;
    gl.drawArrays(drawMode, offset, points.length / 2);
}

/**
 * 绘制正多边形
 * @param gl
 * @param x 中心点的x坐标
 * @param y 中心点的y坐标
 * @param r 中心点和顶点的距离
 * @param side 边数
 * @param hollow 是否空心
 */
function drawPolygon(gl, x, y, r, side, hollow = false) {
    const point = [];
    const sin = Math.sin;
    const cos = Math.cos;
    // 正多边形的内角度数（弧度）
    const perAngel = (2 * Math.PI) / side;
    for (let i = 0; i < side; i ++) {
        const angel = i * perAngel;
        const nx = x + r * cos(angel);
        const ny = y + r * sin(angel);
        point.push(nx, ny);
    }
    draw(gl, point, hollow ? gl.LINE_LOOP : gl.TRIANGLE_FAN);
}



/**
 * 绘制正多角星
 * @param gl
 * @param x
 * @param y
 * @param r
 * @param R
 * @param n
 * @param hollow
 */
function drawMultiPointedStar(gl, x, y, r, R, n, hollow = false) {
    const sin = Math.sin;
    const cos = Math.cos;
    const perAngel = Math.PI / n;
    const positionArray = [];
    for (let i = 0; i < 2 * n; i++) {
        const angel = i * perAngel;
        if (i % 2 !== 0) {
            const Rx = x + R * cos(angel);
            const Ry = y + R * sin(angel);
            positionArray.push(Rx, Ry);
        } else {
            const rx = x + r * cos(angel);
            const ry = y + r * sin(angel);
            positionArray.push(rx, ry);
        }
    }
    draw(gl, positionArray, hollow ? gl.LINE_LOOP : gl.TRIANGLE_FAN);
}


