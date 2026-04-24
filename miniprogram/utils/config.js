/**
 * 后端 API 配置
 */

// 前端本地分析配置
const API_CONFIG = {
  // 使用前端本地分析（不依赖后端）
  baseUrl: '',
  
  // API 端点
  endpoints: {
    analyze: '/api/analyze',
    persona: '/api/persona',
    memories: '/api/memories'
  },
  
  // 请求超时时间（毫秒）
  timeout: 30000,
  
  // 使用前端本地分析（不依赖后端）
  useBackend: false
};

module.exports = API_CONFIG;
