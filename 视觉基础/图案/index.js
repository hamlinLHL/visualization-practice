import {createProgram, createShader, createDataBuffer, readVertexData, clear} from "../../lib/gl.util.js";

const canvasList = Array.from(document.querySelectorAll("canvas"));
const ctxList = canvasList.map((canvas, index) => 
    canvas.getContext("webgl")
);
const [gl1, gl2, gl3, gl4] = ctxList;
drawMesh(gl1);
drawBranch(gl2);
drawCheckered(gl3);
drawMaze(gl4);
function drawMesh(gl) {
    const p = createProgram(
        gl, 
        createShader(gl, gl.VERTEX_SHADER, `
        attribute vec2 a_vertexPosition;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() { 
            gl_PointSize = 1.0; 
            vUv = uv; 
            gl_Position = vec4(a_vertexPosition, 1, 1);
        }
        `),
        createShader(gl, gl.FRAGMENT_SHADER, `
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec2 vUv;
        uniform float rows;
        void main() { 
            vec2 st = fract(vUv * rows); 
            float d1 = step(st.x, 0.9); 
            float d2 = step(0.1, st.y); 
            gl_FragColor.rgb = mix(vec3(0.8), vec3(1.0), d1 * d2); 
            gl_FragColor.a = 1.0;
        }
        `),
    );
    // 设置变量
    gl.uniform1f(gl.getUniformLocation(p, "rows"), 4);

    createDataBuffer(gl, [ [-1, -1], [-1, 1], [1, 1], [1, -1]].flat());
    readVertexData(gl, p, "a_vertexPosition");

    createDataBuffer(gl, [ [0, 0], [0, 1], [1, 1], [1, 0]].flat());
    readVertexData(gl, p, "uv");

    const cells = new Uint16Array([[0, 1, 2], [2, 0, 3]].flat());
    const cellsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    clear(gl);
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
}
/**
 * 分形公式，Mandelbrot Set，也叫曼德勃罗特集
 * @param {*} gl 
 */
function drawBranch(gl) {
    const p = createProgram(
        gl, 
        createShader(gl, gl.VERTEX_SHADER, `
        attribute vec2 a_vertexPosition;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() { 
            gl_PointSize = 1.0; 
            vUv = uv; 
            gl_Position = vec4(a_vertexPosition, 1, 1);
        }
        `),
        createShader(gl, gl.FRAGMENT_SHADER, `
        
#ifdef GL_ES
precision mediump float;
#endif
varying vec2 vUv;
uniform vec2 center;
uniform float scale;
uniform int iterations;

vec2 f(vec2 z, vec2 c) {
  return mat2(z, -z.y, z.x) * z + c;
}

void main() {
    vec2 uv = vUv;
    vec2 c = center + 4.0 * (uv - vec2(0.5)) / scale;
    vec2 z = vec2(0.0);

    bool escaped = false;
    int j;
    for (int i = 0; i < 65536; i++) {
      if(i > iterations) break;
      j = i;
      z = f(z, c);
      if (length(z) > 2.0) {
        escaped = true;
        break;
      }
    }

    gl_FragColor.rgb = escaped ? vec3(float(j)) / float(iterations) : vec3(0.0);
    gl_FragColor.a = 1.0;
}
        `),
    );
    // 设置变量
    gl.uniform1f(gl.getUniformLocation(p, "scale"), 1);

    gl.uniform2fv(gl.getUniformLocation(p, "center"), [0, 0]);

    gl.uniform1i(gl.getUniformLocation(p, "iterations"), 256);

    createDataBuffer(gl, [ [-1, -1], [-1, 1], [1, 1], [1, -1]].flat());
    readVertexData(gl, p, "a_vertexPosition");

    createDataBuffer(gl, [ [0, 0], [0, 1], [1, 1], [1, 0]].flat());
    readVertexData(gl, p, "uv");

    const cells = new Uint16Array([[0, 1, 2], [2, 0, 3]].flat());
    const cellsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    clear(gl);
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
}
/**
 * 绘制彩色方格
 * @param {*} gl 
 */
function drawCheckered(gl) {
    const p = createProgram(
        gl, 
        createShader(gl, gl.VERTEX_SHADER, `
        attribute vec2 a_vertexPosition;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() { 
            gl_PointSize = 1.0; 
            vUv = uv; 
            gl_Position = vec4(a_vertexPosition, 1, 1);
        }
        `),
        createShader(gl, gl.FRAGMENT_SHADER, `

        #ifdef GL_ES
        precision highp float;
        #endif
      
        varying vec2 vUv;

        vec3 hsv2rgb(vec3 c){ 
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0); 
            rgb = rgb * rgb * (3.0 - 2.0 * rgb); 
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        float random (vec2 st) {
            return fract(sin(dot(st.xy,
                                vec2(12.9898,78.233)))*
                43758.5453123);
        }
      
        void main() {
            vec2 st = vUv * 10.0;
            float h = random(floor(st));
            gl_FragColor.rgb = hsv2rgb(vec3(h, 1.0, 1.0));
            gl_FragColor.a = 1.0;
        }
        `),
    );

    createDataBuffer(gl, [ [-1, -1], [-1, 1], [1, 1], [1, -1]].flat());
    readVertexData(gl, p, "a_vertexPosition");

    createDataBuffer(gl, [ [0, 0], [0, 1], [1, 1], [1, 0]].flat());
    readVertexData(gl, p, "uv");

    const cells = new Uint16Array([[0, 1, 2], [2, 0, 3]].flat());
    const cellsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    clear(gl);
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
}

/**
 * 绘制随机迷宫
 * @param {*} gl 
 */
function drawMaze(gl) {
    const p = createProgram(
        gl, 
        createShader(gl, gl.VERTEX_SHADER, `
        attribute vec2 a_vertexPosition;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() { 
            gl_PointSize = 1.0; 
            vUv = uv; 
            gl_Position = vec4(a_vertexPosition, 1, 1);
        }
        `),
        createShader(gl, gl.FRAGMENT_SHADER, `
        #ifdef GL_ES
        precision mediump float;
        #endif
        
        #define PI 3.14159265358979323846
        
        varying vec2 vUv;
        uniform float randomIdx;
        uniform int rows;
        
        float random (in vec2 _st) {
            return fract(sin(dot(_st.xy,
                                vec2(12.9898,78.233)))*
                43758.5453123);
        }
        
        vec2 truchetPattern(in vec2 _st, in float _index){
            _index = fract(((_index-0.5)*2.0));
            if (_index > 0.75) {
                _st = vec2(1.0) - _st;
            } else if (_index > 0.5) {
                _st = vec2(1.0-_st.x,_st.y);
            } else if (_index > 0.25) {
                _st = 1.0-vec2(1.0-_st.x,_st.y);
            }
            return _st;
        }
        
        void main() {
            vec2 st = vUv * float(rows);
            vec2 ipos = floor(st);  // integer
            vec2 fpos = fract(st);  // fraction
        
            vec2 tile = truchetPattern(fpos, random( ipos ) * randomIdx);
            float color = 0.0;
        
            color = smoothstep(tile.x-0.3,tile.x,tile.y)-
                    smoothstep(tile.x,tile.x+0.3,tile.y);
        
            gl_FragColor = vec4(vec3(color),1.0);
        }
        `),
    );
    gl.uniform1i(gl.getUniformLocation(p, "rows"), 10);
    gl.uniform1f(gl.getUniformLocation(p, "randomIdx"), Math.random());

    createDataBuffer(gl, [ [-1, -1], [-1, 1], [1, 1], [1, -1]].flat());
    readVertexData(gl, p, "a_vertexPosition");

    createDataBuffer(gl, [ [0, 0], [0, 1], [1, 1], [1, 0]].flat());
    readVertexData(gl, p, "uv");

    const cells = new Uint16Array([[0, 1, 2], [2, 0, 3]].flat());
    const cellsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    clear(gl);
    gl.drawElements(gl.TRIANGLES, cells.length, gl.UNSIGNED_SHORT, 0);
}
