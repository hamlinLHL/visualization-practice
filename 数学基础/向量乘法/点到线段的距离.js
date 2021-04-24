import {Vector2D} from "../../lib/Vector.js";

const canvas = document.querySelector('canvas');
canvas.width = 800;
canvas.height = 800;
canvas.style.backgroundColor = 'rgba(0,0,0,.1)'
const ctx = canvas.getContext('2d');
// 坐标系平移到中心位置
ctx.translate(canvas.width / 2 , canvas.height / 2);
// 求点p到 线段q, r的距离 以及直线q,r的距离
let p = new Vector2D(0, -100);
const q = new Vector2D(100, -100);
const r = new Vector2D(-100, 0);
draw();
canvas.addEventListener('mousemove', function (event) {
    const {clientX, clientY} = event;
    // 坐标转化
    const x = clientX - canvas.width / 2;
    const y = clientY - canvas.height / 2;
    p = new Vector2D(x, y);
    draw();
})
function draw() {
    ctx.clearRect(-canvas.width / 2, -canvas.width / 2, canvas.width, canvas.height);
    // 绘制RQ直线
    // 直线的参数方程
    const a = (r.y - q.y) / (r.x - q.x);
    const b = r.y - a * r.x;
    const y1 = a * (canvas.width / 2) + b;
    drawSeg(q, new Vector2D(canvas.width / 2, y1), {strokeStyle: 'gray'});
    const y2 = a * (-canvas.width / 2) + b;
    drawSeg(q, new Vector2D(-canvas.width / 2, y2), {strokeStyle: 'gray'});
    // 绘制RQ线段/直线
    drawSeg(r, q, {strokeStyle: 'blue'});
    drawPoint(r);
    drawPoint(q);
    drawText('R', r);
    drawText('Q', q);
    // 绘制P点
    drawPoint(p);
    drawText('P', p);
    // 绘制P点在RQ上的垂线
    // 表示 r 指向 q 的向量
    const RQ = q.copy().sub(r);
    const QP = p.copy().sub(q);
    const RP = p.copy().sub(r);
    const minDis1 = Math.abs(p.cross(RQ.normalize()));
    let minDis2;
    // RP在RQ上的投影长度
    let temp = RQ.copy().scale(Math.abs(RP.dot(RQ.normalize())) / RQ._length);
    if (QP.dot(RQ) > 0) {
        minDis2 = QP._length;
        drawSeg(p, q, {strokeStyle: 'red'});
        temp = temp.add(r);
    } else if (RP.dot(RQ) < 0) {
        minDis2 = RP._length;
        drawSeg(p, r, {strokeStyle: 'red'});
        temp = r.copy().sub(temp);
    } else {
        minDis2 = minDis1;
        temp = temp.add(r);
    }
    drawText(
        'N',
        temp
    );
    drawSeg(temp, p, {strokeStyle: 'green', ifDash: true})
    drawText(
        'P到直线RQ的距离：' + minDis1,
            new Vector2D(-400, -300),
        {color: 'green', textAlign: 'left'}
        );
    drawText(
        'P到线段RQ的距离：' + minDis2,
        new Vector2D(-400, -150),
        {color: 'red', textAlign: 'left'}
    );
}


/**
 * 绘制线段
 * @param from
 * @param to
 * @param strokeStyle
 * @param ifDash
 */
function drawSeg(from, to, {strokeStyle = 'black', ifDash = false} = {}) {
    ctx.beginPath();
    ctx.save();
    if (ifDash) {
        ctx.setLineDash([4, 1]);
    }
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(...from);
    ctx.lineTo(...to);
    ctx.stroke();
    ctx.restore();
    ctx.closePath();
}
function drawPoint(point, {fillStyle= 'black', r= 3} = {}) {
    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.arc(...point, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    ctx.closePath();
}
function drawText(text, point, {color= 'black', textAlign = 'center'} = {}) {
    ctx.beginPath();
    ctx.save();
    ctx.font = '16px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.fillText(text, point.x, point.y - 16);
    ctx.fill();
    ctx.restore();
    ctx.closePath();
}
