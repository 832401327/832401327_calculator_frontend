/**
 * 后端 API 封装模块：所有网络请求集中在此，便于统一配置与错误处理。
 */
'use strict';

// 后端服务地址：部署时只需修改这一行（末尾保留 /api）
// 本地联调用 http://127.0.0.1:5000/api；线上为 PythonAnywhere 部署地址
const API_BASE_URL = 'https://832401327.pythonanywhere.com/api';

/**
 * 发送 HTTP 请求并返回解析后的 JSON。
 * @param {string} path - 接口路径，例如 '/calculate'
 * @param {Object} [options] - 传给 fetch 的额外配置
 * @returns {Promise<Object|null>} 后端返回的 JSON；204 时返回 null
 * @throws {Error} 网络不通或后端返回业务错误时抛出，message 可直接展示
 */
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    // 网络层失败：后端未启动或地址不可达（此时前端无法得到任何计算结果）
    throw new Error('无法连接服务器，请确认后端服务已启动');
  }

  // 204 No Content：删除成功，没有响应体
  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`响应格式异常（HTTP ${response.status}）`);
  }

  if (!response.ok) {
    // 后端返回的业务错误（400 / 404 / 500 等）
    throw new Error(data.message || `请求失败（HTTP ${response.status}）`);
  }
  return data;
}

/** 请求后端计算表达式，返回 {success, expression, result, record_id}。 */
function calculateApi(expression) {
  return request('/calculate', {
    method: 'POST',
    body: JSON.stringify({ expression }),
  });
}

/** 查询计算历史，search 为可选关键字（走后端过滤）。 */
function fetchHistoryApi(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/history${query}`);
}

/** 删除单条历史记录。 */
function deleteHistoryApi(id) {
  return request(`/history/${id}`, { method: 'DELETE' });
}

/** 清空全部历史记录。 */
function clearHistoryApi() {
  return request('/history', { method: 'DELETE' });
}
