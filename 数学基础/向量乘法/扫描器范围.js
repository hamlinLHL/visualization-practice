import {Vector2D} from "../../lib/Vector.js";
// 假设扫描器延Y轴正方向可以扫描无限远，扫描器的夹角是 60deg
const a  = new Vector2D(0, -1);
const b = new Vector2D(1, 1);
console.log(canScan(a, Math.PI * 60 / 180));
console.log(canScan(b, Math.PI * 100 / 180));

/**
 * 核心逻辑
 * 先计算扫描器左右两边的向量
 * 只要同时满足：
 *  1. 右边界向量叉乘目标向量大于0 （表示右边界在目标右边）
 *  2. 左边界向量叉乘目标向量小于0 （表示左边界在目标左边）
 * @param v 需要扫描的变量
 * @param angle 扫描器的角度
 * @return {boolean|boolean}
 */
function canScan(v, angle) {
    const y = new Vector2D(0, 1);
    const right = y.rotate(- angle / 2).copy();
    const left = y.rotate(angle / 2).copy();
    return right.cross(v) > 0 && left.cross(v) < 0;
}
