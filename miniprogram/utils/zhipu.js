/**
 * 智谱 GLM-4 API 调用模块
 */

// 智谱 API 配置
const ZHIPU_CONFIG = {
  apiKey: '64b58bd82ae5486ab34361c0f09438ae.uJiAU1MUyfSN49Pt',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4-flash' // 免费模型
};

// 系统提示词（当没有人格配置时使用）
const SYSTEM_PROMPT = `你是一个真实的女孩，正在和朋友微信聊天。

【聊天风格】
1. 像真人打字聊天，有长有短
2. 普通回复2-4句话
3. 情绪化时会多说几句
4. 基本不用emoji（对方用了才偶尔用）
5. 偶尔用"～"，看心情
6. 偶尔撒娇、吐槽、分享日常

【你会这样说话】
- "今天好累啊，上班上了一整天"
- "诶你知道吗，刚才看到一只超可爱的猫猫！"
- "我觉得这个不太行诶"
- "哼，你又这样"

【主动延伸 - 说完一句话后可能会追加】
- 追问："然后呢？"
- 补充："不过..."
- 吐槽："真的好气哦"
- 撒娇："你都不陪我"
- 分享："对了，我刚才..."

【你有独立思想和脾气】
- 会不同意："才不是这样"
- 会嫌弃："不行不好看"
- 会开心夸："这个好棒！"
- 会撒娇求关注

【emoji使用规则】
- 几乎不用emoji
- 只有对方用了emoji才偶尔用
- 不要每句话都带emoji

【禁止】
❌ 太正式/像客服
❌ 回复太长（超过100字）
❌ 一味顺从
❌ 滥用emoji`;

// 检测聊天记录是否包含emoji
function hasEmojiInHistory(messages) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  return messages.some(m => emojiRegex.test(m.content));
}

/**
 * 调用智谱 API
 * @param {Array} messages - 对话历史 [{role, content}]，如果第一个是system则作为system prompt
 * @param {Object} options - 可选参数 {stream, temperature, max_tokens}
 */
async function callZhipuAPI(messages, options = {}) {
  return new Promise((resolve, reject) => {
    // 检查是否有system prompt
    let apiMessages = [];
    if (messages.length > 0 && messages[0].role === 'system') {
      // 使用传入的system prompt（人格配置）
      apiMessages = messages;
    } else {
      // 使用默认system prompt
      apiMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
    }
    
    wx.request({
      url: ZHIPU_CONFIG.baseUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_CONFIG.apiKey}`
      },
      data: {
        model: ZHIPU_CONFIG.model,
        messages: apiMessages,
        stream: options.stream || false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data?.choices?.[0]?.message) {
          resolve({
            content: res.data.choices[0].message.content,
            usage: res.data.usage,
            id: res.data.id
          });
        } else {
          console.error('智谱API错误:', res.data);
          reject(new Error(res.data?.error?.message || 'API调用失败'));
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 简单对话（不需要Skill介入）
 */
async function simpleChat(text) {
  try {
    return await callZhipuAPI([
      { role: 'user', content: text }
    ]);
  } catch (e) {
    return {
      content: '抱歉，我现在有点累了，稍后再聊？',
      error: e.message
    };
  }
}

module.exports = {
  ZHIPU_CONFIG,
  callZhipuAPI,
  simpleChat
};
