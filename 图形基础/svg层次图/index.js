
const svg = document.querySelector('svg');
const h1 = document.querySelector('h1');
let preActive;
function getTitle(node) {
    let text = '';
    let temp = node;
    // 如果是叶子节点
    if (node instanceof SVGTextElement) {
        text += node.textContent || '';
    } else {
        text += node.dataset.name || '';
    }
    temp = temp.parentNode;
    // 不是叶子节点
    while (temp instanceof SVGGElement && temp.parentNode) {
        if (temp.dataset.name) {
            text = temp.dataset.name + '-' + text;
        }
        temp = temp.parentNode;
    }
    return text;
}
svg.addEventListener('mousemove', (event) => {
    let target = event.target;
    if (preActive === target) {
        // 在同一个target内移动
        return;
    }
    h1.textContent = getTitle(target);
    if (preActive instanceof SVGCircleElement) {
        preActive.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
    }
    if (target instanceof SVGTextElement) {
        target = target.previousSibling;
    }
    if (target instanceof SVGCircleElement) {
        // target高亮
        target.setAttribute('fill', 'rgba(0, 255, 0, 0.2)');
    }

    preActive = target;
})
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
        .size([1000,800])
        .padding(3);
    /**
     * 添加位置信息
     */
    const root = pack(regions);
    draw(svg, root);
    function draw(parent, node, {fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white'} = {}) {
        const {x, y, r} = node;
        // 绘制圆
        const circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fillStyle);
        circle.setAttribute('data-name', node.data.name);
        parent.appendChild(circle);
        const children = node.children;
        if (children) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('data-name', node.data.name);
            for(let item of children) {
                draw(g, item, {fillStyle, textColor});
            }
            parent.appendChild(g);
        } else {
            // 绘制文本
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('fill', textColor);
            text.setAttribute('font-family', 'Arial');
            text.setAttribute('font-size', '1rem');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.textContent = node.data.name;
            parent.appendChild(text);
        }
    }
}())

