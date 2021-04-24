/**
 * 不能很方便的获取画布中的元素
 */

const canvas = document.querySelector('canvas');
canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;
const context = canvas.getContext('2d');

const dataSource = 'https://s5.ssl.qhres.com/static/b0695e2dd30daa64.json';
(async function () {
    // 获取数据
    const data = await (await fetch(dataSource)).json();
    // 数据分层
    // class Node {
    // children: Node[]
    // data: {name: "中国", children: Array(12)} 传进去的数据
    // depth: 0
    // height: 2
    // parent: null}
    const regions = d3.hierarchy(data)
        /**
         * 求子节点的个数
         */
        .sum(d => 1)
        /**
         * 按子节点的个数排序
         */
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
        .size([1000,700])
        .padding(3);
    /**
     * 添加位置信息
     */
    const root = pack(regions);
    const TAU = 2 * Math.PI;
    let point;
    let lastIn = null;
    let isIn = null;
    canvas.addEventListener('mousemove', (event) => {
        isIn = null;
        point= {x: event.offsetX, y: event.offsetY};
        redraw(context, root);
        if ((isIn && isIn !== lastIn) || (!isIn && lastIn)) {
            lastIn = isIn;
            context.clearRect(0, 0, canvas.width, canvas.height);
            draw(context, root);
        }
    });
    function redraw(ctx, node) {
        if (node.children) {
            for(let i = 0; i < node.children.length; i++) {
                redraw(ctx, node.children[i]);
            }
        } else {
            if (isInCircle(node, point)) {
                // 标志鼠标在节点内
                isIn = node;
            }
        }
    }
    function isInCircle(node, point) {
        // 忽略父级圆
        if (!!node.children || !point) {
            return false;
        }
        const {x, y, r} = node;
        // 判断鼠标落点是否在圆内
        // 鼠标落点和圆心的距离小于半径
        return Math.sqrt(
            Math.abs(point.y - y) ** 2 + Math.abs(point.x - x) ** 2) < r;
    }
    function drawArc(ctx, node, fillStyle = 'rgba(0, 0, 0, 0.2)') {
        const {x, y, r} = node;
        ctx.beginPath();
        ctx.fillStyle = isInCircle(node, point) ? 'rgba(0, 255, 0, 0.2)': fillStyle;
        // 画圆 0 - 180
        ctx.arc(x, y, r, 0, TAU);
        // 填充颜色
        ctx.fill();
    }
    function drawText(ctx, node, textColor = 'white') {
        const {x, y} = node;
        const name = node.data.name;
        ctx.fillStyle = textColor;
        ctx.font = '0.8rem Arial';
        // 水平居中
        ctx.textAlign = 'center';
        // 填充文字
        ctx.fillText(name, x, y);
    }
    function draw(ctx, node) {
        const children = node.children;
        drawArc(ctx, node);
        if(children) {
            // 递归渲染子节点
            for(let i = 0; i < children.length; i++) {
                draw(ctx, children[i]);
            }
        } else {
            // 渲染叶子节点的文字
            drawText(ctx, node);
        }
    }

    draw(context, root);
}())

