# 832401327_calculator_frontend — 计算器前端

前后端分离计算器系统的前端（Web 页面）：负责计算器界面展示、按键交互、
表达式输入、发送计算请求、展示后端返回的结果/错误信息，以及计算历史的
查询、搜索与删除。

> 本项目**不含任何计算逻辑**：表达式一律通过 HTTP API 发给后端计算，
> 结果与历史数据全部来自后端数据库。

## 技术栈

- 原生 HTML5 / CSS3 / JavaScript（ES2020，无框架、无构建步骤）
- Fetch API（与后端通信）

## 运行环境

- 任意现代浏览器（Chrome / Edge / Firefox）
- 后端服务已启动（见后端仓库 README）

## 启动方法

方式一：用任意静态服务器托管 `src/` 目录（推荐）：

```bash
cd 832401327_calculator_frontend/src
python -m http.server 8080
# 打开 http://localhost:8080
```

方式二：直接双击 `src/index.html` 用浏览器打开（API 地址配置正确即可联调）。

## 配置说明

后端地址在 `src/js/api.js` 顶部集中配置：

```js
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```

- 本地联调：保持默认即可（后端默认监听 `127.0.0.1:5000`）。
- 部署联调：改成后端部署后的公网地址，例如
  `https://your-backend.onrender.com/api`。

## 数据库初始化

前端不连接数据库。计算历史全部存储在后端 SQLite 数据库中，
由后端负责初始化（见后端仓库 README 的「数据库初始化」一节）。

## 前后端联调步骤

1. 启动后端：在后端项目根目录执行 `python src/app.py`。
2. 启动前端：`python -m http.server 8080`，访问 `http://localhost:8080`。
3. 确认 `API_BASE_URL` 与后端地址一致。
4. 验证分离性（作业要求）：**停止后端服务**后，前端界面仍可输入，
   但点 `=` 只会提示"无法连接服务器"，无法得到任何计算结果。

## 功能清单

基础功能：

- 四则运算（界面显示 × ÷，实际发送 * /）
- 复合表达式：运算优先级、括号、一元正负号、小数
- 计算历史展示（来自后端数据库，刷新/重启不丢失）
- 单条历史删除（走后端 API，删除后重新拉取）

扩展功能：

- 科学计算：`√`（sqrt）、`x²`、`^`（幂）、`%`（取模）
- 键盘输入：数字/运算符/`.` 直接输入，`Enter` 计算，`Backspace` 退格，`Esc` 清空
- 明暗主题切换（仅界面偏好保存在 localStorage，不涉及业务数据）
- 历史关键字搜索（输入经 `?search=` 由后端过滤）
- 一键清空全部历史（带二次确认）

## 项目结构

```
832401327_calculator_frontend/
├── src/
│   ├── index.html          # 页面结构：计算器 + 历史面板
│   ├── css/
│   │   └── style.css       # 样式（CSS 变量实现明暗主题）
│   └── js/
│       ├── api.js          # 后端 API 封装（API_BASE_URL 集中配置）
│       ├── calculator.js   # 按键交互、表达式输入、结果展示、主题切换
│       └── history.js      # 历史查询/渲染/删除/搜索（防抖）
├── README.md
└── codestyle.md
```

## 代码规范

见 [codestyle.md](codestyle.md)，基于 Google JavaScript Style Guide 制定。
