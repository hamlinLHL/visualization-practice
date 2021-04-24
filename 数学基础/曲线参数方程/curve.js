import {Vector2D} from "../../lib/Vector.js";

const canvas = document.querySelector('canvas');
canvas.width = 800;
canvas.height = 800;
canvas.style.backgroundColor = 'rgba(0,0,0,.1)'
const ctx = canvas.getContext('2d');
// 坐标系平移到中心位置
ctx.translate(canvas.width / 2 , canvas.height / 2);
ctx.scale(1 , -1);

// 抛物线参数方程
const para = parametric(
    t => 25 * t,
    t => 25 * t ** 2,
);
// 绘制抛物线
para(-5.5, 5.5).draw(ctx);

// 阿基米德螺旋线
const helical = parametric(
    (t, l) => l * t * Math.cos(t),
    (t, l) => l * t * Math.sin(t),
);

helical(0, 50, 500, 5).draw(ctx, {strokeStyle: 'blue'});

// 星形线
const star = parametric(
    (t, l) => l * Math.cos(t) ** 3,
    (t, l) => l * Math.sin(t) ** 3,
);

star(0, Math.PI * 2, 50, 150).draw(ctx, {strokeStyle: 'red'});

// 圆
const arc = parametric(
    (t, r, {x, y}) => x + r * Math.cos(t),
    (t, r, {x, y}) => y + r * Math.sin(t)
)
arc(0, Math.PI * 2, 100, 100, {x: 0, y: 0}).draw(ctx, {strokeStyle: 'orange'});

// 椭圆
const ellipse = parametric(
    (t, {a, b}, {x, y}) => x + a * Math.cos(t),
    (t, {a, b}, {x, y}) => y + b * Math.sin(t)
)
ellipse(0, Math.PI * 2, 100, {a: 200, b: 50}, {x: 0, y: 0}).draw(ctx, {strokeStyle: 'green'});

// 二阶贝塞尔曲线

// const quadricBezier = parametric(
//     (t, [{x: x0}, {x: x1}, {x: x2}]) => (1 - t) ** 2 * x0 + 2 * t * (1 - t) * x1 + t ** 2 * x2,
//     (t, [{y: y0}, {y: y1}, {y: y2}]) => (1 - t) ** 2 * y0 + 2 * t * (1 - t) * y1 + t ** 2 * y2,
// );
//
// const p0 = new Vector2D(0, 0);
// const p1 = new Vector2D(100, 0);
// p1.rotate(0.75);
// const p2 = new Vector2D(200, 0);
// const count = 30;
// for(let i = 0; i < count; i++) {
//     // 绘制30条从圆心出发，旋转不同角度的二阶贝塞尔曲线
//     p1.rotate(2 / count * Math.PI);
//     p2.rotate(2 / count * Math.PI);
//     quadricBezier(0, 1, 100, [
//         p0,
//         p1,
//         p2,
//     ]).draw(ctx);
// }


// 三阶贝塞尔曲线
const cubicBezier = parametric(
    (t, [{x: x0}, {x: x1}, {x: x2}, {x: x3}]) => (1 - t) ** 3 * x0 + 3 * t * (1 - t) ** 2 * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3 * x3,
    (t, [{y: y0}, {y: y1}, {y: y2}, {y: y3}]) => (1 - t) ** 3 * y0 + 3 * t * (1 - t) ** 2 * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3,
);

const p0 = new Vector2D(0, 0);
const p1 = new Vector2D(100, 0);
p1.rotate(0.75);
const p2 = new Vector2D(150, 0);
p2.rotate(-0.75);
const p3 = new Vector2D(200, 0);
const count = 30;
for(let i = 0; i < count; i++) {
    p1.rotate(2 / count * Math.PI);
    p2.rotate(2 / count * Math.PI);
    p3.rotate(2 / count * Math.PI);
    cubicBezier(0, 1, 100, [
        p0,
        p1,
        p2,
        p3,
    ]).draw(ctx);
}
// 根据点来绘制图形
function draw(points, context, {
    strokeStyle = 'black',
    fillStyle = null,
    close = false,
} = {}) {
    context.strokeStyle = strokeStyle;
    context.beginPath();
    context.moveTo(...points[0]);
    for(let i = 1; i < points.length; i++) {
        context.lineTo(...points[i]);
    }
    if(close) context.closePath();
    if(fillStyle) {
        context.fillStyle = fillStyle;
        context.fill();
    }
    context.stroke();
}

/**
 * 绘制曲线
 * @param xFunc x的参数方程
 * @param yFunc y的参数方程
 * @return {function(*, *, *=, ...[*]): {draw: any, points: []}}
 */
export function parametric(xFunc, yFunc) {
    /**
     * @param start 开始的弧度
     * @param end 结束的弧度
     * @param seg 采样点
     * @param args其他参数
     */
    return function (start, end, seg = 100, ...args) {
        // 顶点
        const points = [];
        for(let i = 0; i <= seg; i++) {
            const p = i / seg;
            const t = (end - start) * p + start;
            const x = xFunc(t, ...args); // 计算参数方程组的x
            const y = yFunc(t, ...args);  // 计算参数方程组的y
            points.push([x, y]);
        }
        return {
            draw: draw.bind(null, points),
            points,
        };
    };
}
