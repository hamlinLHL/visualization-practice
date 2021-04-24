import {Vector2D} from "../../lib/Vector.js";

const canvas = document.querySelector('canvas');
/**
 * 手绘风格的绘图api
 */
const rc = rough.canvas(canvas);
const ctx = rc.ctx;
// 绘制一棵树
// 坐标变换，原点变换到左下角，Y轴向上
ctx.translate(0, canvas.height);
ctx.scale(1, -1);
ctx.lineCap = 'round';

drawBranch(rc, new Vector2D(canvas.width / 2, 0), 70, 12, Math.PI / 2, 4);
setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBranch(rc, new Vector2D(canvas.width / 2, 0), 70, 12, Math.PI / 2, 4);
}, 1000);
/**
 * 绘制树枝
 * @param context 绘图上下文
 * @param v0 起始向量
 * @param length 树枝的长度
 * @param thickness 树枝的宽度
 * @param dir 方向，树枝和x轴的夹脚（弧度）
 * @param bias 随机偏向因子
 */
function drawBranch(context, v0, length, thickness, dir, bias) {
    const v = new Vector2D().rotate(dir).scale(length);
    const v1 = v0.copy().add(v);
    context.line(...v0, ...v1, {strokeWidth: thickness});
    if (thickness > 2) {
        // 随机角度开衩
        // 左子树角度
        const left = Math.PI / 4 + 0.5 * (dir + 0.2) + bias * (Math.random() - 0.5);
        drawBranch(context, v1, length * 0.9, thickness * 0.8, left, bias * 0.9);
        // 左子树角度
        const right = Math.PI / 4 + 0.5 * (dir - 0.2) + bias * (Math.random() - 0.5);
        drawBranch(context, v1, length * 0.9, thickness * 0.8, right, bias * 0.9);
    }
    if (thickness < 5 && Math.random() < 0.3) {
        context.circle(v1.x, v1.y - 2, 5, {
            stroke: 'red',
            strokeWidth: 1,
            fill: 'rgba(255, 255, 0, 0.4)',
            fillStyle: 'solid',
        });
    }
}
