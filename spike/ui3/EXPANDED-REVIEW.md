# UI3 扩展 Spike：五种组合、真实 preview 与 core 建议

2026-10-29。本文件取代首轮 REPORT.md 的选型建议；正式路线仍待 项目负责人 确认。

## 当前建议

优先 **保留 Preact + FigUI3 Core + Hive 自有业务组件**，保留现有 build/utilities、绘图端与计算逻辑。旧 UI 库可以在尚未迁移的页面继续使用，但需隔离全局 CSS。不是基于“哪个更现代”，而是当前 Core 外观更接近目标、无需 UI runtime 迁移，新增场景也已跑通。

Core 的 MIT 许可证不是排除理由。首轮把 Figma Kit React 组合的接入便利看得过重，也未把原项目的 Preact 迁移成本充分计入。继续实测发现 Figma Kit + Preact compat 在本轮覆盖的场景也能工作，因此不能说选 Figma Kit 就必须迁 React。

## 可运行组合

打开 http://127.0.0.1:4173/。各方案都有 Data/JSON 与 Design panels 两个入口。

| 组合 | 改动成本判断 | 收益 | 代价 / 限制 | 当前定位 |
|---|---|---|---|---|
| 现有 Preact + @create-figma-plugin/ui 4.0.3，补布局与样式 | 最低起步成本 | 原栈可沿用，组件体积小 | 原默认视觉仍需调；深改内部样式会增加耦合 | 可渐进改造的保守路线 |
| Preact + FigUI3 Core + 自有组合组件 | 中等 | 更接近目标外观，Core 基础控件够用 | custom event/attribute 适配，全局 CSS 隔离 | 当前首选 |
| Native HTML controls + UI3 theme + Preact | 简单控件低，完整交互高 | 样式控制、依赖最少 | 本样例用原生 select/radio/range；title 提示不等价于完整 Tooltip | 可用于局部，不建议完整从零造库 |
| React + Figma Kit | 中高 | 直接使用 React 组件生态 | runtime、入口、hooks/context、旧 UI 组件迁移；beta 适配 | 无必要仅为 UI3 迁移 |
| Preact compat + Figma Kit | 中等且兼容性待扩展 | 保留 Preact，使用 React 风格组件 | 本轮通过不代表所有 React 库兼容 | 次选实验路线 |
| Preact + 自有 UI3 外观 + 部分 headless/原生交互 | 中等到高 | 精确贴稿，可分组件选工具 | 仍要维护键盘、焦点、ARIA 和弹层；headless 包兼容要逐个测 | 架构上可与 Core 路线组合，未另做完整 headless 套件 |

没有尝试“从零写所有控件的交互机制”。native 样例代表基于浏览器原生控件自写外观，不能据此估算全自研自定义菜单成本。

## 真实 preview

`real-preview.tsx` 直接引用仓库 `src/components/VerticalBarChartPreview.tsx`，以及原 Color / Number / Typography token providers。所有方案共用这份 Preact preview，React 候选通过独立 Preact mount 隔离，未把预览重写为 React。

原 `src/`、root package.json 和绘图代码没有修改。浏览器及当前测试 main 都没有完成真实 token 解析桥接，使用原代码的 fallback 值；不得称已验证真实跨文件变量解析。原源码内有 token key，整个本地 spike 不是可直接公开发布的样例包。

支持的联动实测：数据值、单/双系列、selectedIndex、图表标题、轴标题、轴位置、轴线、网格与分段数。以下区别在测试页面明确提示：

- 原 Bar mode 只有 single/dual，没有 stacked。Segmented control 已交互，但不伪造原 preview 的堆叠支持。
- Auto divisions 传 undefined 后，原 normalizeYAxisDivisions 默认 3；没有根据高度/数据自动选择数量。
- Prefix/suffix/separator 只更新格式样本，原 chart 的数字格式仍未迁移。
- Tooltip 没有独立 visible 字段；测试适配器通过 selectedIndex=-1 隐藏，也会取消高亮。UI 保留选点状态，但正式 core 应分开两者。
- Details 是代表性组件测试页，不是对 wireframe 全功能的实现；Import 在 Design fixture 出现仅为测试捷径，不是修改产品信息架构。
- 浏览器/宿主的 fixture 导航会重建页面，不能当作正式 Data/Design 会话状态架构。

## 本轮验证

五种组合均通过同一组浏览器检查：

- 连续输入 `-123.4567`、2→1→2 保留 B；输入 `-` 禁用确认；修改 `12.34567` 传入真实 preview config。
- Design 总览的 Grouped/Stacked 控件状态、slider End 到 6、眼睛隐藏 tooltip 后配置保留。
- Axes：轴标题编辑驱动真实 preview、隐藏后输入值保留；分段 Custom=7 → Auto。
- Number format：prefix `$`、suffix ` AUD`，格式样本更新。
- JSON：错误没有 Apply；有效单行含 `12.34567` / `-99.87654` 应用到真实 preview。
- 五套均构建成功。预览截图在 output/ 下，design/axes 状态已检查。

Figma Desktop 本轮实际运行 **FigUI3 Core / Design panels**：原 preview 显示，tooltip 眼睛隐藏，进入 Axes & grid，输入 Sales 后图表及原摘要更新。其他新增组合本轮只做浏览器验证；前一轮 Kit/Core Desktop 证据属于旧简化样例，不外推。

## 实测适配与排错

- FigUI3 Web event bridge 改为 useLayoutEffect，避免新挂载控件在 effect 注册之前接到第一笔输入。disabled 仍需显式 attribute 同步。
- Kit / compat 下拉在 Custom → Auto 场景弹层落到 viewport 下方，设置 `alignItemWithTrigger={false}` 后通过。保留首轮 controlled-open 卸载适配；不把本地组合问题直接归责为上游 bug。
- 旧 RangeSlider 要求 minimum < maximum；1 行数据会抛异常。包装为最大值至少 2 且单行 disabled 后通过。
- 实验 HTML 最初缺少 doctype，导致 quirks mode 下 CSS class 大小写碰撞，旧组件的 minified class 尤其明显。补标准 doctype 后修复。这是 spike 构建问题，不是旧 UI 库问题。
- legacy Tabs 的 children 是内容而不是标签；去掉重复内容。各库 API 用法差异不能当作库缺陷。
- native 测试用真实 radio 操作，而非点击被透明 input 覆盖的 span，避免测试定位误报。

本轮没有完整屏幕阅读器、IME、触屏、跨 OS、宿主字体/主题、真实 token 解析或长时性能测试，也没有全项目 TypeScript 类型检查。

React + Preact island 截图复查发现更新后部分数值样式丢失；重新挂载未能解决，已撤回该尝试。数据联动通过不等于视觉更新通过：React 候选仍有这一未解决的集成缺陷；后续需检查依赖解析和双 runtime 更新路径。其他四套当前截图未见该现象。

## 许可证边界

依据安装的 11.6.9 LICENSE 与上游 main LICENSE：Core 明列的文件适用 MIT，允许使用、修改、派生、分发与商业使用，需在分发的软件中保留版权和许可声明。可以在 Core 上写 Hive 的属性行、表格、趋势选择器、路由、数据状态；自行写扩展不自动变成 Editor 许可证。

Editor/Lab 是 PolyForm Shield，不是“不能商用”的同义词，但限制和 MIT 不同。不能把 Editor 的 fig-select 实现复制到自己的文件后声称变为 MIT。本轮 bundle metafile 无 fig-editor/fig-lab 输入。

2026-10-29 进一步核实并更正：安装版 11.6.9 和上游 main 的 fig-color.js 文件头明确标注 PolyForm Shield 1.0.0，不只是 MIT 文件清单漏列。fig.js 直接导入它，当前 figui bundle metafile 记录其贡献 3857 字节。因此当前 Core 接入产物不能称纯 MIT。Shield 允许符合许可用途的使用、修改和分发，但含非竞争限制；Hive 图表插件是否符合该边界是用途判断，不能仅凭 Core 名称保证。优先向作者取得该 Core 依赖的许可澄清或额外授权；若要求全 MIT，需要另行验证移除、独立替换或选用已审计版本的可行性，不能直接删除版权声明或假设不使用颜色 UI 就不会打包。

来源：[FigUI3 LICENSE](https://github.com/rogie/figui3/blob/main/LICENSE)、[上游说明](https://github.com/rogie/figui3)、[Preact compat 文档](https://preactjs.com/guide/v11/differences-to-react/)、[现有 UI 文档](https://yuanqing.github.io/create-figma-plugin/ui/)。

## React 迁移到底影响什么

可保留：main 里的事件协议与 Figma API 调用、drawVerticalBarChart 等绘图函数、types/config、数据与 scale 计算（审查后按模块复用）。

需要适配：ui.tsx 的 render、页面与 hooks 的 Preact imports、context/provider、旧 @create-figma-plugin/ui 组件、JSX/build 配置。Preview 是 Preact 组件；可以如 spike 暂时隔离运行，也可以迁移，但并非零成本。React 对本项目目前的明显收益是直接接入 React-only 生态；没有证据说明它能自动提高图表效果或速度。

## Core / preview 改进建议（仅讨论，未实施）

建议先保留现有渲染，逐步抽共享布局结果，而非整体换成另一套图表库：

`dataset + chart config + resolved tokens → normalize → scale / format / layout → DOM preview / editable Figma nodes`

已有基础：resolveBarScale / valueToY / measureYAxisLabelGutter、key info、tooltip 内容计算已经部分共用，应继续利用。

优先补：

1. ChartConfig 明确区分 yAxisTitle、prefix、suffix、tooltip.visible、tooltip.selectedIndex，避免改标题顺带改单位、隐藏 tooltip 顺带丢高亮。
2. 自动分段根据可用绘图区高度和标签测量选择合理数量，并保持 nice ticks；Custom 约束与自动范围统一处理。
3. Tooltip 与标签布局用统一 geometry。当前 previewScale=0.9、chartTop 固定偏移、部分文本宽度 length×7 是可定位的脆弱点；截图中 tooltip 会覆盖标题/摘要，应先测边界和留白策略。
4. Browser 文本测量与 Figma TextNode 测量不同；共享布局应接受测量接口和误差处理，不能承诺天然像素完全一致。
5. 生成数据与精确数据共用一个模型；preview 快速更新，最终插入走同一份规范化配置。对正在输入的 `-` 等中间状态，保留最后有效预览比瞬间替成 0 更自然（当前 spike 尚未改）。

没有证据需要整个插件重写，也不需要为了 UI3 换 chart rendering library。正式开始前先确定最小 Bar 流程及需要迁移的行为。
