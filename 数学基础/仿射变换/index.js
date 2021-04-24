import {
  createShader,
  createDataBuffer,
  createProgram,
  resize,
  clear,
  readVertexData,
} from "../../lib/gl.util.js";

const canvas = document.querySelector("canvas");
// webgl画笔
// WebGL API 是 OpenGL ES 的 JavaScript 绑定版本
const gl = canvas.getContext("webgl");

const vertex = `
  attribute vec2 position;
  uniform float u_rotation;
  uniform float u_time;
  uniform float u_duration;
  uniform float u_scale;
  uniform float u_skew;
  uniform vec2 u_dir;
  varying float vP;
  void main() {
    float p = min(1.0, u_time / u_duration);
    float rad = u_rotation + 3.14 * 10.0 * p;
    float scale = u_scale * p * (2.0 - p);
    float skew = u_skew * (1.0 - p);
    vec2 offset = 2.0 * u_dir * p * p;
    mat3 translateMatrix = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      offset.x, offset.y, 1.0
    );
    mat3 rotateMatrix = mat3(
      cos(rad), sin(rad), 0.0,
      -sin(rad), cos(rad), 0.0,
      0.0, 0.0, 1.0
    );
    mat3 scaleMatrix = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );
    mat3 skewMatrix = mat3(
      1, 0, 0.0,
      tan(skew), 1, 0.0,
      0.0, 0.0, 1.0
    );
    gl_PointSize = 1.0;
    vec3 pos = translateMatrix * scaleMatrix * skewMatrix * rotateMatrix * vec3(position, 1.0);
    gl_Position = vec4(pos, 1.0);
    vP = p;
  }
`
const fragment = `
precision mediump float;
uniform vec4 u_color;
varying float vP;
void main(){
  gl_FragColor.xyz = u_color.xyz;
  gl_FragColor.a = (1.0 - vP) * u_color.a;
}  
`
const program = createProgram(
  gl,
  createShader(gl, gl.VERTEX_SHADER, vertex),
  createShader(gl, gl.FRAGMENT_SHADER, fragment)
)
createDataBuffer(gl, [
  -1, -1,
  0, 1,
  1, -1,
]);
readVertexData(gl, program);


/**
 * 随机生成三角形的属性
 * @returns 颜色，旋转角度，大小，记录时间，持续时间，运动方向，创建时间
 */
function randomTriangles() {
  const u_color = [Math.random(), Math.random(), Math.random(), 1.0]; // 随机颜色
  const u_rotation = Math.random() * Math.PI; // 初始旋转角度
  const u_scale = Math.random() * 0.05 + 0.03; // 初始大小
  const u_skew = Math.random() * Math.PI / 2; // 初始扭曲
  const u_time = 0;
  const u_duration = 3.0; // 持续3秒钟

  const rad = Math.random() * Math.PI * 2;
  const u_dir = [Math.cos(rad), Math.sin(rad)]; // 运动方向
  const startTime = performance.now();

  return {u_color, u_rotation, u_scale, u_time, u_duration, u_dir, u_skew, startTime};
}

/**
 * 设置着色器参数
 * @param {*} gl 
 * @param {*} param1 
 */
function setUniforms(gl, {u_color, u_rotation, u_scale, u_time, u_duration, u_dir, u_skew}) {
  // gl.getUniformLocation 拿到uniform变量的指针
  let loc = gl.getUniformLocation(program, 'u_color');
  // 将数据传给 unfirom 变量的地址
  gl.uniform4fv(loc, u_color);

  loc = gl.getUniformLocation(program, 'u_rotation');
  gl.uniform1f(loc, u_rotation);

  loc = gl.getUniformLocation(program, 'u_scale');
  gl.uniform1f(loc, u_scale);

  loc = gl.getUniformLocation(program, 'u_skew');
  gl.uniform1f(loc, u_skew);

  loc = gl.getUniformLocation(program, 'u_time');
  gl.uniform1f(loc, u_time);

  loc = gl.getUniformLocation(program, 'u_duration');
  gl.uniform1f(loc, u_duration);

  loc = gl.getUniformLocation(program, 'u_dir');
  gl.uniform2fv(loc, u_dir);
}


let triangles = [];

function update() {
  for(let i = 0; i < 5 * Math.random(); i++) {
    triangles.push(randomTriangles());
  }
  clear(gl);
  // 对每个三角形重新设置u_time
  triangles.forEach((triangle) => {
    triangle.u_time = (performance.now() - triangle.startTime) / 1000;
    setUniforms(gl, triangle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
  // 移除已经结束动画的三角形
  triangles = triangles.filter((triangle) => {
    return triangle.u_time <= triangle.u_duration;
  });
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
