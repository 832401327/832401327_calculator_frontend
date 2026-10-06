/**
 * 计算历史模块：从后端数据库查询、渲染、删除历史记录。
 * 历史数据一律来自后端 API，不使用前端本地存储保存业务数据。
 */
'use strict';

const historyListEl = document.getElementById('historyList');
const historySearchEl = document.getElementById('historySearch');

let searchTimer = null;

/** 在历史列表中显示一条提示（空列表或错误信息）。 */
function showHistoryNotice(message) {
  historyListEl.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'history-empty';
  li.textContent = message;
  historyListEl.appendChild(li);
}

/** 从后端加载历史并渲染；search 为可选关键字。 */
async function loadHistory(search = '') {
  try {
    const data = await fetchHistoryApi(search);
    renderHistory(data.history);
  } catch (error) {
    showHistoryNotice(error.message);
  }
}

/** 渲染历史记录列表。 */
function renderHistory(history) {
  if (history.length === 0) {
    showHistoryNotice('暂无计算记录');
    return;
  }
  historyListEl.innerHTML = '';
  history.forEach((record) => {
    const item = document.createElement('li');
    item.className = 'history-item';

    const info = document.createElement('div');
    info.className = 'history-info';
    const expr = document.createElement('div');
    expr.className = 'history-expression';
    expr.textContent = `${record.expression} = ${record.result}`;
    const time = document.createElement('div');
    time.className = 'history-time';
    time.textContent = record.created_at;
    info.appendChild(expr);
    info.appendChild(time);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', () => removeRecord(record.id));

    item.appendChild(info);
    item.appendChild(deleteBtn);
    historyListEl.appendChild(item);
  });
}

/** 删除单条记录：DELETE /api/history/{id}，成功后重新拉取最新列表。 */
async function removeRecord(id) {
  try {
    await deleteHistoryApi(id);
    await loadHistory(historySearchEl.value.trim());
  } catch (error) {
    showHistoryNotice(error.message);
  }
}

/** 自定义确认弹窗：返回 Promise<boolean>，替代阻塞式 window.confirm。 */
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    messageEl.textContent = message;
    modal.hidden = false;

    function cleanup(result) {
      modal.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onOverlay);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(event) {
      if (event.target === modal) cleanup(false);
    }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onOverlay);
  });
}

/** 清空全部历史：DELETE /api/history，经自定义弹窗二次确认。 */
document.getElementById('clearAll').addEventListener('click', async () => {
  const confirmed = await showConfirm('确定要清空全部计算历史吗？此操作不可恢复。');
  if (!confirmed) return;
  try {
    await clearHistoryApi();
    historySearchEl.value = '';
    await loadHistory();
  } catch (error) {
    showHistoryNotice(error.message);
  }
});

// 搜索框防抖：输入停止 300ms 后把关键字发给后端过滤
historySearchEl.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadHistory(historySearchEl.value.trim());
  }, 300);
});

// 首次进入页面即从后端加载历史
loadHistory();
