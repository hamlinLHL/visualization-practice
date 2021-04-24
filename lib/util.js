import {Vector2D} from "../lib/Vector.js";

/**
 * 计算正多边形顶点
 * @param {*} param1 起始坐标
 * @param {*} n 边数
 * @returns 顶点的扁平化数组
 */
export function calcRegularShapePoints({x, y}, n) {
    const points = [new Vector2D(x, y)];
    // 正多边形一个外角的度数
    const angle = Math.PI - (n - 2) * Math.PI / n;
    for(let i = 1; i <= (n - 1); i++) {
        points.push(points[0].copy().rotate(i * angle));
    }
    return points.flat();
}