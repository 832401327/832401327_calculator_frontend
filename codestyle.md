# JavaScript 代码规范（codestyle.md）

> 本规范来源：**Google JavaScript Style Guide**（Google 官方 JS 风格指南），
> 参考链接：<https://google.github.io/styleguide/jsguide.html>，
> 并参考 Airbnb JavaScript Style Guide 的可读性建议。
> 本项目前端代码遵循以下具体规则。

## 1. 变量声明

- 使用 `const` 声明常量与 DOM 引用，仅在需要重新赋值时使用 `let`，**禁止 `var`**。

```js
// 正确
const API_BASE_URL = 'http://127.0.0.1:5000/api';
let currentExpression = '';

// 错误
var currentExpression = '';
```

## 2. 缩进与格式

- 统一 **2 个空格** 缩进，不使用 Tab。
- 语句结尾必须加分号；字符串统一使用单引号（模板字符串除外）。
- 模板字符串拼接 HTML/URL 时使用反引号 + `${}`。

```js
const query = search ? `?search=${encodeURIComponent(search)}` : '';
```

## 3. 命名规范

| 对象 | 风格 | 示例 |
|---|---|---|
| 变量 / 函数 | 小驼峰 | `loadHistory`、`searchTimer` |
| 常量（全大写） | 大写蛇形 | `API_BASE_URL` |
| CSS 类名（DOM 操作用） | 小写连字符 | `.history-item` |
| 事件处理函数 | 动词开头 | `removeRecord`、`appendToken` |

## 4. 函数与注释

- 函数必须先声明后调用（依赖 `'use strict'` + 顺序执行）。
- 每个函数用 JSDoc 注明用途、参数与返回值；复杂逻辑用行内注释说明"为什么"。

```js
/**
 * 发送 HTTP 请求并返回解析后的 JSON。
 * @param {string} path - 接口路径，例如 '/calculate'
 * @param {Object} [options] - 传给 fetch 的额外配置
 * @returns {Promise<Object|null>} 后端返回的 JSON；204 时返回 null
 */
async function request(path, options = {}) { ... }
```

## 5. DOM 操作规范

- **禁止用 innerHTML 插入任何含用户/后端数据的内容**（防 XSS），
  动态数据一律通过 `createElement` + `textContent` 添加。
- 同类事件使用事件委托绑定到容器，而不是给每个按钮单独绑定。
- DOM 引用集中在模块顶部获取，不在循环中反复查询。

```js
// 正确：textContent 安全插入
expr.textContent = `${record.expression} = ${record.result}`;

// 禁止：innerHTML 拼接数据
historyListEl.innerHTML = `<li>${record.expression}</li>`;
```

## 6. 异步与错误处理

- 网络请求统一使用 `async/await`，必须 `try/catch` 处理错误，
  错误信息展示给用户而不是静默失败。
- 网络请求封装集中在 `api.js`，页面逻辑不得直接调用 `fetch`。
- 输入型事件需要高频触发时（如搜索框）使用防抖（debounce，300ms）。

## 7. 职责边界（项目约定）

- `calculator.js` / `history.js` 只做**交互与展示**，
  任何表达式求值必须调用后端 API，前端不得自行计算结果。
- 业务数据（计算历史）只从后端获取；
  localStorage 仅允许保存界面偏好（如主题），不得保存业务数据。

## 8. 工具建议

- 提交前可用 ESLint 自查（推荐配置 `google` 规则集）：
  `npx eslint --env browser src/js`
