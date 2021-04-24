/**
 * 二元向量
 */
export class Vector2D extends Array {
    // 初始化一个单位向量
    constructor(x = 1, y = 0) {
        super(x, y);
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get length() {
        // 向量的长度是(x平方 + y平方) 开根号
        return Math.hypot(this.x, this.y);
    }

    get dir() {
        // 向量的方向（和x轴的夹角）
        return Math.atan2(this.y, this.x);
    }

    /**
     * 复制向量
     * @return {Vector2D}
     */
    copy() {
        return new Vector2D(this.x, this.y);
    }

    reverse() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * 向量相加
     * @param v
     * @return {Vector2D}
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * 向量相减
     * @param v
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * 向量叉乘
     * @param v
     * @return {number}
     */
    cross(v) {
        return this.x * v.y - v.x * this.y;
    }

    /**
     * 点乘
     * 结果是一个数字
     * 对应分量相乘
     * @param v
     * @return {number}
     */
    dot(v) {
        return this.x * v.x + v.y * this.y;
    }

    /**
     * 归一化
     * 变成单位向量
     * 单位向量的长度为1
     * @return {Vector2D}
     */
    normalize() {
        return this.scale(1 / this._length);
    }
    get _length() {
        return Math.hypot(this.x, this.y);
    }

    /**
     * 旋转向量
     * @param rad 弧度
     */
    rotate(rad) {
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const [x, y] = this;
        // 左乘一个旋转矩阵
        // [cos  -sin  [x
        // sin cos]     y]
        this.x = cos * x - sin * y;
        this.y = sin * x + cos * y;
        return this;
    }

    /**
     * 缩放
     * @param n
     */
    scale(n) {
        const [x, y] = this;
        // 左乘一个缩放矩阵
        // [n  0  [x
        // 0 n]    y]
        this.x = n * x;
        this.y = n * y;
        return this;
    }
}
