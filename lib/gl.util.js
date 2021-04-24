import {Vector2D} from "./Vector.js";

/**
 * 创建着色器
 * @param gl webgl上下文
 * @param type shader类型
 * @param source 着色器代码glsl
 * @return {WebGLShader}
 */
export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    // 把我们自定义的着色器代码传入shader中
    gl.shaderSource(shader, source);
    // 编译着色器
    gl.compileShader(shader);
    // 判断 shader是否创建成功
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    // 没有创建成功 就删除该shader
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

/**
 * 创建WebGL缓冲区
 * @param gl webgl上下文
 * @param points 缓冲区数据
 */
export function createDataBuffer(gl, points) {
    // WebGL需要强类型数据
    // 所以new Float32Array(points)创建了32位浮点型数据序列，
    // 并从positions中复制数据到序列中，
    // 然后gl.bufferData复制这些数据到GPU的positionBuffer对象上。
    // 它最终传递到positionBuffer上是因为在前一步中我们我们将它绑定到了ARRAY_BUFFER（也就是绑定点）上。
    // 最后一个参数gl.STATIC_DRAW是提示WebGL我们将怎么使用这些数据
    // WebGL会根据提示做出一些优化
    // gl.STATIC_DRAW提示WebGL我们不会经常改变这些数据。
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
}

/**
 * 创建webgl程序
 * @param gl
 * @param vertexShader
 * @param fragmentShader
 * @return {WebGLProgram}
 */
export function createProgram(gl, vertexShader, fragmentShader) {
    // 创建webgl程序
    const program = gl.createProgram();
    // 关联program和着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 关联 program
    gl.linkProgram(program);
    gl.useProgram(program);
    // 判断program是否关联成功
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/**
 * 根据设备像素比缩放画布尺寸
 * @param canvas
 */
export function resize(canvas) {
    // 1个CSS像素对应多少个实际像素
    const realToCSSPixels = window.devicePixelRatio;

    // 获取浏览器显示的画布的CSS像素值
    // 然后计算出设备像素设置drawingbuffer
    const displayWidth  = Math.floor(canvas.clientWidth  * realToCSSPixels);
    const displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

    // 检查画布尺寸是否相同
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {

        // 设置为相同的尺寸
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

/**
 * 我们用0, 0, 0, 0清空画布，
 * 分别对应 r, g, b, alpha （红，绿，蓝，阿尔法）值，
 * 所以在这个例子中我们让画布变透明了。
 * @param gl
 */
export function clear(gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
} 

/**
 * 从缓冲区中读取顶点数据
 * @param {*} gl
 * @param {*} program 
 * @param {*} key 
 */
export function readVertexData(gl, program, key = 'position') {
    // 从刚才创建的 GLSL 着色程序中找到这个属性值所在的位置
    const vPosition = gl.getAttribLocation(program, key);
    // 接下来我们需要告诉WebGL怎么从我们之前准备的缓冲中获取数据给着色器中的属性。
    // 首先我们需要启用对应属性
    gl.enableVertexAttribArray(vPosition);

    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    const size = 2;          // 每次迭代运行提取两个单位数据
    const type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
    const normalize = false; // 不需要归一化数据
    const stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                           // 每次迭代运行运动多少内存到下一个数据开始点
    let offset = 0;        // 从缓冲起始位置开始读取
    gl.vertexAttribPointer(
        vPosition, size, type, normalize, stride, offset)
}

export function transformX(x) {
    
}
