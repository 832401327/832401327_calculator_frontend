/**
 * 计算器交互模块：只负责输入采集与结果展示。
 * 前端不做任何表达式求值，所有计算都通过 API 交给后端完成。
 */
'use strict';

const expressionEl = document.getElementById('expression');
const feedbackEl = document.getElementById('feedback');

let currentExpression = '';

/** 渲染当前表达式。 */
function render() {
  expressionEl.textContent = currentExpression === '' ? '0' : currentExpression;
}

/** 把按钮/键盘输入的记号追加到表达式末尾。 */
function appendToken(token) {
  currentExpression += token;
  render();
  clearFeedback();
}

/** 清空表达式与提示信息。 */
function clearAll() {
  currentExpression = '';
  render();
  clearFeedback();
}

/** 退格：删除表达式最后一个字符。 */
function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  render();
}

/** 清除提示区。 */
function clearFeedback() {
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('error');
}

/** 在提示区显示错误信息（来自后端或网络层）。 */
function showError(message) {
  feedbackEl.textContent = message;
  feedbackEl.classList.add('error');
}

/** 提交表达式：POST /api/calculate，由后端计算并写入历史。 */
async function submitExpression() {
  if (currentExpression.trim() === '') {
    showError('请先输入表达式');
    return;
  }
  feedbackEl.textContent = '计算中...';
  feedbackEl.classList.remove('error');
  try {
    const data = await calculateApi(currentExpression);
    // 结果完全来自后端响应，前端不参与任何计算
    feedbackEl.textContent = `= ${data.result}`;
    // 计算成功后刷新历史列表，保持与数据库同步
    loadHistory(historySearchEl.value.trim());
  } catch (error) {
    showError(error.message);
  }
}

// ---- 按键事件：统一委托到 keypad 容器 ----
document.getElementById('keypad').addEventListener('click', (event) => {
  const button = event.target.closest('button.key');
  if (!button) return;
  if (button.dataset.insert !== undefined) {
    appendToken(button.dataset.insert);
  } else if (button.dataset.action === 'equals') {
    submitExpression();
  } else if (button.dataset.action === 'clear') {
    clearAll();
  } else if (button.dataset.action === 'backspace') {
    backspace();
  } else if (button.dataset.action === 'square') {
    appendToken('^2');
  }
});

// ---- 键盘快捷键（扩展功能）----
// 注意：光标位于搜索框时不拦截按键，避免干扰输入
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT') return;
  const key = event.key;
  if (/^[0-9]$/.test(key) || '+-*/().^%'.includes(key)) {
    appendToken(key);
    event.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    submitExpression();
    event.preventDefault();
  } else if (key === 'Backspace') {
    backspace();
    event.preventDefault();
  } else if (key === 'Escape') {
    clearAll();
  }
});

// ---- 明暗主题切换（扩展功能，仅保存界面偏好）----
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀' : '◐';
}

themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem('calculator-theme', next);
  applyTheme(next);
});

applyTheme(localStorage.getItem('calculator-theme') || 'light');

render();
