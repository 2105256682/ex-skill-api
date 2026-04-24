/**
 * AI Skill 系统 - 简化版（人格聊天模式）
 */

// ============================================================
// 技能注册表
// ============================================================
const Skills = {
  // 技能ID: { name, keywords, handler }
};

// 注册技能装饰器
function registerSkill(skillId, config) {
  Skills[skillId] = {
    id: skillId,
    name: config.name,
    keywords: config.keywords || [],
    handler: config.handler,
    description: config.description || ''
  };
}

// ============================================================
// 内置技能 1: 计算器（保留）
// ============================================================
registerSkill('calc', {
  name: '计算器',
  description: '数学计算',
  keywords: ['计算', '等于', '加', '减', '乘', '除', '+', '-', '*', '/', '多少', '算'],
  
  handler: async (query, context) => {
    // 提取数学表达式
    let expr = query
      .replace(/等于|是多少|帮我算|计算|等于/g, '')
      .replace(/乘/g, '*')
      .replace(/除以/g, '/')
      .replace(/加上/g, '+')
      .replace(/减去/g, '-')
      .trim();
    
    // 安全检查：只允许数字和运算符
    if (!/^[\d\s+\-*/().]+$/.test(expr)) {
      return null; // 返回null表示未匹配
    }
    
    try {
      // 安全计算
      const result = Function('"use strict"; return (' + expr + ')')();
      
      return {
        type: 'calc',
        expression: expr,
        result: Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '')
      };
    } catch (e) {
      return null;
    }
  }
});

// ============================================================
// 内置技能 2: 智能对话（兜底）
// ============================================================
registerSkill('chat', {
  name: '智能对话',
  description: '通用对话',
  keywords: [], // 空数组表示兜底
  
  handler: async (query, context) => {
    // 这里会调用AI大模型
    return {
      type: 'text',
      content: null // 返回null表示需要AI生成
    };
  }
});

// ============================================================
// 意图识别器
// ============================================================
function recognizeIntent(query) {
  query = query.toLowerCase();
  
  // 按优先级匹配
  const skillOrder = ['calc', 'chat'];
  
  for (const skillId of skillOrder) {
    const skill = Skills[skillId];
    if (!skill || !skill.keywords.length) continue;
    
    for (const keyword of skill.keywords) {
      if (query.includes(keyword)) {
        return skillId;
      }
    }
  }
  
  return 'chat'; // 默认走AI对话
}

// ============================================================
// 技能执行器
// ============================================================
async function executeSkill(skillId, query, context) {
  const skill = Skills[skillId];
  if (!skill) return null;
  
  try {
    return await skill.handler(query, context);
  } catch (e) {
    console.error(`Skill ${skillId} error:`, e);
    return { type: 'error', message: '技能执行失败' };
  }
}

// ============================================================
// 导出
// ============================================================
module.exports = {
  Skills,
  recognizeIntent,
  executeSkill
};
