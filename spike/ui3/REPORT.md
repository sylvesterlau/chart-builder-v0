# UI3 组件库 Spike 评估

> 首轮历史结果。后续已扩为五种组合，并接入原插件 preview；当前建议改为优先保留 Preact + FigUI3 Core，见 [EXPANDED-REVIEW.md](EXPANDED-REVIEW.md)。下面的体积与推荐只对应首轮。

2026-10-29 · branch `codex/ui3-library-spike`

## 结论

建议下一步以 **Figma Kit + React** 做正式 UI 的候选基础，包一层 Hive 自有组件接口。此结论是 Codex 建议，尚未成为 项目负责人 确认的技术选型。

两套都能在真实 Figma Desktop 插件里运行；决定因素不是能不能实现 UI3，而是后续维护成本。Figma Kit 的组合式控件更适合当前已经细化的表单、菜单与详情页。FigUI3 Core 能沿用 Preact，样例体积更小，但需要显式处理 custom events、属性同步及全局 CSS。Core 下拉是原生 select；完整自定义 select 在 Editor 中，许可证也不同。

**Figma Kit 不是零风险选择。** beta.43 + Base UI 1.6.0 的本样例在浏览器中出现 Escape 后 aria-expanded=false、菜单 DOM 仍可见的问题。已用 controlled open + 关闭时卸载 Portal 的局部适配修复；根因尚未归属到具体上游包。正式采用前应锁版本并保留交互回归检查。不能因为 MIT 或 React 就称为已证明更稳定。

## 同条件样例

共享 `app.tsx`，通过 `kit.tsx` / `figui.tsx` 适配器切换；相同布局、初始数据和业务逻辑。左侧灰色 preview，右侧 Data / Design、Series、Categories、生成范围、六种趋势、表格、JSON 详情、标题眼睛、选点 slider。趋势图标为本地简单 SVG。

这不是完整 redesign 实现：仅 Bar 场景与少量 Design 控件，没有图表插入、持久化、重新编辑、正式轴计算、完整 tooltip 渲染或其他图表。JSON schema 为本 spike 专用。生成器为确定性示意算法，趋势允许噪声，不保证严格单调。100 行只是功能压力样例，不是产品上限决定。

| 比较 | Figma Kit | FigUI3 Core |
|---|---|---|
| 实测版本 | 1.0.0-beta.43 / React 19.2.0 / Base UI 1.6.0 | @rogieking/figui3 11.6.9 / Preact 11.1.0 |
| 控件模型 | React 组合组件 | Web Components + Preact 适配 |
| Dropdown | 自定义弹层，需本地关闭适配 | Core 是原生 select；非完整 Editor select |
| 精确数据 | 文本输入保留小数和中间输入状态 | 同样用文本输入，避免 Number 控件的默认精度策略 |
| 接入现有项目 | 当前项目为 Preact，需要 UI runtime 迁移评估 | 可保持 Preact，但不是直接替换旧组件 |
| 本样例 gzip JS+CSS | 207,518 bytes | 149,244 bytes |
| 本样例 JS / CSS | 629,562 / 53,216 bytes | 412,374 / 217,560 bytes |

体积是整个样例、各自 runtime 和组件依赖合计，未含浏览器模拟主题 CSS；不是纯库体积，也不是启动耗时。实际插件 code.js 包含两套，正式只选一套时不能用这个双包文件估算。

## 验证结果

| 检查 | Figma Kit | FigUI3 |
|---|---|---|
| 浏览器显示、浅/深主题 | 通过 | 通过 |
| 123.4567 精度、2→1→2 恢复 B | 通过 | 通过 |
| -100～200 生成范围 | 通过 | 通过 |
| 输入 `-` 禁用 Validate preview | 通过 | 适配后通过 |
| 错误 JSON：generic error、无 Apply | 通过 | 通过 |
| 正确 JSON：12.34567 / -99.87654 应用 | 通过 | 通过 |
| 100 行，编辑末行 123.456789 | 通过 | 通过 |
| Slider 键盘修改 | 通过 | 通过 |
| 眼睛隐藏图表标题，保留配置 | 通过 | 通过 |
| Import JSON hover 文案 | 可见，按钮已有 aria-label | 可见，按钮已有 aria-label |
| 下拉 Escape | 局部适配后通过浏览器检查；宿主也检查过关闭与切页 | 真实 Desktop 原生菜单可开关 |
| Figma Desktop 加载 / ping-pong | 通过 | 通过 |
| Figma Desktop Design / slider / 眼睛 | 通过 | 通过 |

Desktop 验证使用独立开发插件 `Hive UI3 library spike`，已导入 manifest，两个 menu 命令均运行；主进程仅 showUI 与 ping/pong，没有画布写操作。宿主验证覆盖基础交互，不代表全部浏览器用例都在宿主重复通过。

未验证：真实 Desktop 文件选择与下载、宿主主题实时切换、完整屏幕阅读器、Windows、低性能机器、原业务状态迁移、Figma Kit 在 Preact compat 下的兼容性。浏览器主题是模拟变量；不把它写作宿主主题已通过。最近页面加载/hover 检查没有 pageerror；这不是全面 console 审计。

## 实际适配成本

- FigUI3 包默认入口被 esbuild 因 sideEffects 声明裁剪，改用包公开的 `@rogieking/figui3/src/fig.js` 导出，组件才能注册。需锁版本并复查后续包发布。
- FigUI3 事件 detail 与属性变化需要显式桥接；Preact 对 fig-button 的 disabled property 赋值不会触发其 attributeChangedCallback。适配器改为 setAttribute/removeAttribute 并补事件 guard，内部按钮才真正 disabled。
- FigUI3 的全局 button 样式影响了自有趋势卡片，补了局部布局规则。两套均保持 html 16px，避免 rem token 缩小。
- Figma Kit Tooltip trigger 包装必须转发 ref 和事件 props；样例已修正。hover 实际可见，但本版本没有呈现 role=tooltip；尚未完成 a11y 审计，不宣称全库无障碍通过。
- Figma Kit 菜单关闭残留用本地 controlled open 条件挂载解决，未修改 node_modules。
- 两边都需要 Hive 自己的 DatasetTable、TrendSelection、PropertyRow、SectionHeader、VisibilityField 和 JSON 状态流程。组件库不会替我们实现数据模型或图表规则。

## 许可证和来源

- [Figma Kit 上游](https://github.com/tigranpetrossian/figma-kit)，安装包 license 为 MIT。
- [FigUI3 上游](https://github.com/rogie/figui3)，[许可证](https://github.com/rogie/figui3/blob/main/LICENSE)：Core MIT；Editor / Lab 为 PolyForm Shield 1.0.0，不是 OSI 开源。不能把整个包概括成 MIT。若引入 Editor，应先核对具体模块授权范围；本轮不做法律结论。
- [Base UI Select](https://base-ui.com/react/components/select)：组合交互依赖。

npm audit 本轮收尾为 0 vulnerabilities，只代表当时已知依赖审计结果。版本精确锁定于 package-lock.json。

## 下一步边界

先由 项目负责人 review 两套实物与上述取舍，再确定正式选型。若采用 Figma Kit，先迁移一条 Bar Data 垂直流程，保留现有图表生成端，通过明确的 UI/main 消息接口接入。不要把本 spike 或旧 JSON persistence spike 直接合并当作 redesign baseline。

当前代码保留在独立 worktree，未合并、未推送。
