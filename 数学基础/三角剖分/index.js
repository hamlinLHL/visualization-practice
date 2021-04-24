import {
  createShader,
  createDataBuffer,
  createProgram,
  resize,
  clear,
  readVertexData,
} from "../../lib/gl.util.js";
import {Vector2D} from "../../lib/Vector.js"

const canvas = document.querySelector("canvas");
// webgl画笔
// WebGL API 是 OpenGL ES 的 JavaScript 绑定版本
const gl = canvas.getContext("webgl");
const vertices = [
    [-0.7, 0.5],
    [-0.4, 0.3],
    [-0.25, 0.71],
    [-0.1, 0.56],
    [-0.1, 0.13],
    [0.4, 0.21],
    [0, -0.6],
    [-0.3, -0.3],
    [-0.6, -0.3],
    [-0.45, 0.0],
  ]
// 扁平化数据
// 每三个值构成一个三角形
// 每个值代表vertices中顶点的索引
const triangles = earcut(vertices.flat());


const program = createProgram(
    gl,
    createShader(
      gl,
      gl.VERTEX_SHADER,
      document.querySelector("#vertexSource").textContent
    ),
    createShader(
      gl,
      gl.FRAGMENT_SHADER,
      document.querySelector("#fragmentSource").textContent
    )
  );

  createDataBuffer(gl, vertices.flat());
  // 顶点从缓冲区中取顶点数据
  readVertexData(gl, program);

  const cells = new Uint16Array(triangles);
  const cellsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);

  const colorLoc = gl.getUniformLocation(program, 'u_color');
  gl.uniform4fv(colorLoc, [1, 0, 0, 1]);

  clear(gl);
  gl.drawElements(gl.LINE_STRIP, cells.length, gl.UNSIGNED_SHORT, 0);
/**
 * 判断坐标是否在多边形内部
 * canvas中使用下面的方法
 * ctx.isPointInPath(offsetX, offsetY)
 * isPointInPath 仅能判断鼠标是否在最后一次绘制的图形内
 * 改进方法是 使用克隆的画笔再画一次多边形
 */

function isPointInPath({ vertices, cells }, point) {
let ret = false;
for (let i = 0; i < cells.length; i += 3) {
    const p1 = new Vector2D(...vertices[cells[i]]);
    const p2 = new Vector2D(...vertices[cells[i + 1]]);
    const p3 = new Vector2D(...vertices[cells[i + 2]]);
    if (inTriangle(p1, p2, p3, point)) {
    ret = true;
    break;
    }
}
return ret;
}

function inTriangle(p1, p2, p3, point) {
    const a = p2.copy().sub(p1);
    const b = p3.copy().sub(p2);
    const c = p1.copy().sub(p3);
    const u1 = point.copy().sub(p1);
    const u2 = point.copy().sub(p2);
    const u3 = point.copy().sub(p3);
    const s1 = Math.sign(a.cross(u1));
    const s2 = Math.sign(b.cross(u2));
    const s3 = Math.sign(c.cross(u3));
    return s1 === s2 && s2 === s3;
}



const {left, top} = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", (evt) => {
    const {x, y} = evt;
    // 坐标转换
    const offsetX = 2 * (x - left) / canvas.width - 1.0;
    const offsetY = 1.0 - 2 * (y - top) / canvas.height;

    gl.clear(gl.COLOR_BUFFER_BIT);
    const colorLoc = gl.getUniformLocation(program, 'u_color');
    if (isPointInPath({vertices, cells}, new Vector2D(offsetX, offsetY))) {
        console.log(1111)
        gl.uniform4fv(colorLoc, [0, 0.5, 0, 1]);
    } else {
        gl.uniform4fv(colorLoc, [1, 0, 0, 1]);
    }
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
});
