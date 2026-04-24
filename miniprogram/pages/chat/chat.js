// 引入工具模块
const app = getApp();
const cloud = require('../../utils/cloud.js');
const { recognizeIntent, executeSkill } = require('../../utils/skills.js');
const { callZhipuAPI } = require('../../utils/zhipu.js');

// 表情包映射
const emojiMap = {
  '[亲亲]': '😘',
  '[害羞]': '😳',
  '[得意]': '😏',
  '[委屈]': '😢',
  '[色]': '😍',
  '[呲牙]': '😁',
  '[可怜]': '🥺',
  '[惊恐]': '😱',
  '[可爱]': '🥰',
  '[偷笑]': '🤭',
  '[微笑]': '😊',
  '[大哭]': '😭',
  '[困]': '😴',
  '[惊讶]': '😲',
  '[无语]': '😑',
  '[撇嘴]': '😤',
  '[挤眼]': '😉',
  '[发怒]': '😠',
  '[白眼]': '🙄',
  '[抓狂]': '🤯',
  '[衰]': '😵',
  '[骷髅]': '💀',
  '[心]': '❤️',
  '[星星]': '⭐',
  '[鲜花]': '💐',
  '[蛋糕]': '🎂',
  '[爱你]': '😍',
  '[丘比特]': '💘',
  '[示爱]': '💕'
};

Page({
  data: {
    aiName: '小明',
    aiEmoji: '🤖',
    aiId: null,
    statusText: '在线',
    todayLabel: '',
    messages: [],
    inputText: '',
    scrollToId: 'msg-bottom',
    isTyping: false,
    systemPrompt: '',
    currentPersona: null
  },

  // 转换表情包文本为emoji
  _convertEmoji(text) {
    var result = text;
    for (var key in emojiMap) {
      if (emojiMap.hasOwnProperty(key)) {
        result = result.split(key).join(emojiMap[key]);
      }
    }
    return result;
  },

  async onLoad(options) {
    // 格式化时间
    const now = new Date();
    const h = now.getHours() >= 12 ? '下午' : '上午';
    const min = String(now.getMinutes()).padStart(2, '0');
    const hh = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
    this.setData({ todayLabel: `${h}${hh}:${min}` });

    // 从本地存储读取人格信息
    const pending = wx.getStorageSync('current_chat_persona');
    if (pending) {
      this.setData({
        aiId: pending.id || null,
        aiName: pending.name || '小明',
        aiEmoji: pending.emoji || '🤖',
        systemPrompt: pending.systemPrompt || ''
      });
      
      // 加载云端聊天记录
      await this.loadChatHistory(pending.id);
      
      // 获取人格详情（包含emoji使用偏好）
      await this.loadPersonaDetail(pending.id);
    }

    // 初始 AI 问候（更自然的开场）
    setTimeout(() => {
      const { currentPersona } = this.data;
      const isSarcastic = currentPersona?.basicInfo?.personality?.includes('沙雕');
      
      // 60%概率不发，等用户先开口（更自然）
      if (Math.random() < 0.6) return;
      
      let greeting;
      if (isSarcastic) {
        const greetings = ['干嘛', '在干嘛', '下班了吗', '吃了吗', '诶', '说', '咋了'];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
      } else {
        const greetings = ['在干嘛呢', '忙什么呢', '诶，刚看到', '怎么啦', '嗯？', '哈喽'];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
      }
      
      this._addAiMessage(greeting);
    }, 600);
  },

  onUnload() {
    if (this.data.aiId) {
      this.saveChatHistory();
    }
  },

  onHide() {
    if (this.data.aiId) {
      this.saveChatHistory();
    }
  },

  // 加载人格详情
  async loadPersonaDetail(personaId) {
    try {
      const persona = await cloud.getPersona(personaId);
      if (persona) {
        this.setData({ currentPersona: persona });
      }
    } catch (err) {
      console.error('加载人格详情失败', err);
    }
  },

  // 加载聊天记录（云开发）
  async loadChatHistory(personaId) {
    try {
      const history = await cloud.getChatMessages(personaId, 100);
      if (history && history.length > 0) {
        // 转换为页面需要的格式
        const messages = history.map(m => ({
          id: m._id,
          role: m.role,
          content: m.content,
          displayContent: this._convertEmoji(m.content),
          read: m.role === 'ai',
          time: new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }));
        this.setData({ messages });
      }
    } catch (err) {
      console.error('加载聊天记录失败', err);
      // 降级到本地存储
      const allHistories = wx.getStorageSync('chat_histories') || {};
      const history = allHistories[personaId] || [];
      if (history.length > 0) {
        this.setData({ messages: history });
      }
    }
  },

  // 保存聊天记录（云开发）
  async saveChatHistory() {
    if (!this.data.aiId) return;
    
    const validMessages = this.data.messages.filter(m => !m.typing && m.content);
    if (validMessages.length === 0) return;

    try {
      // 保存到云端
      const messagesToSave = validMessages.slice(-50).map(m => ({
        personaId: this.data.aiId,
        role: m.role,
        content: m.content
      }));
      await cloud.saveMessages(messagesToSave);
    } catch (err) {
      console.error('保存云端聊天记录失败', err);
      // 降级到本地存储
      const allHistories = wx.getStorageSync('chat_histories') || {};
      allHistories[this.data.aiId] = validMessages;
      wx.setStorageSync('chat_histories', allHistories);
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSend() {
    const text = this.data.inputText.trim();
    if (!text || this.data.isTyping) return;

    this._addUserMessage(text);
    this.setData({ inputText: '' });

    // 显示打字动画
    this._showTyping();

    // 处理消息
    this._processMessage(text);
  },

  toggleEmoji() {
    wx.showToast({ title: '表情功能', icon: 'none' });
  },

  // ============================================================
  // 消息处理核心
  // ============================================================
  async _processMessage(userText) {
    try {
      // 1. 意图识别
      const skillId = recognizeIntent(userText);

      // 2. 执行技能
      const skillResult = await executeSkill(skillId, userText, this);

      // 3. 根据结果处理
      if (skillResult?.type === 'card') {
        this._hideTyping();
        this._addAiMessage(`等我查一下哦～`);
        setTimeout(() => {
          this._showSkillCard(skillResult);
        }, 500);
      } else if (skillResult?.type === 'calc') {
        this._hideTyping();
        this._addAiMessage(`算出来了！${skillResult.expression} = ${skillResult.result}`);
      } else {
        await this._callAI(userText);
      }
    } catch (e) {
      console.error('处理消息失败:', e);
      this._hideTyping();
      this._mockReply();
    }
  },

  // ============================================================
  // AI 对话
  // ============================================================
  async _callAI(userText) {
    try {
      const history = this.data.messages
        .filter(m => !m.typing && m.content)
        .slice(-10)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      // 检查人格的emoji偏好
      const { currentPersona } = this.data;
      const hasEmojiInHistory = currentPersona?.basicInfo?.emojiStyle?.includes('喜欢用emoji');

      let systemPrompt = this.data.systemPrompt;
      
      // 根据人格设置添加emoji规则
      if (!hasEmojiInHistory) {
        if (systemPrompt) {
          systemPrompt += '\n\n【铁律】禁止发任何emoji！禁止用😂🤪🤣🙈👍等任何表情符号！只能用纯文字！';
        } else {
          systemPrompt = '【铁律】禁止发任何emoji！禁止用😂🤪🤣🙈👍等任何表情符号！只能用纯文字！';
        }
      }

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push(...history);

      const result = await callZhipuAPI(messages);
      
      this._hideTyping();
      this._addAiMessage(result.content);
      
      // 20%概率主动追加一条（让对话更自然）
      if (Math.random() < 0.2) {
        setTimeout(() => this._主动延伸(result.content), 1500);
      }
      
      // 保存记录
      this.saveChatHistory();
    } catch (e) {
      console.error('AI调用失败:', e);
      this._hideTyping();
      this._mockReply();
    }
  },

  // AI主动延伸话题
  async _主动延伸(上一条回复) {
    const history = this.data.messages
      .filter(m => !m.typing && m.content)
      .slice(-6)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

    // 检查人格类型
    const { currentPersona } = this.data;
    const isSarcastic = currentPersona?.basicInfo?.personality?.includes('沙雕');
    const hasEmoji = currentPersona?.basicInfo?.emojiStyle?.includes('喜欢用emoji');

    const prompt = isSarcastic 
      ? `你是${this.data.aiName}，正在和损友互怼聊天。

你的风格：
- 简短、随意、像真朋友
- 不用emoji！

【梗使用规则】
- "擦皮鞋""哈基米""鼠了""绝绝子"等只有语境对才用
- 对方在聊相关内容才接梗
- 感觉不对就正常说，别硬用梗
- 宁可不用，不要硬塞

随便说点日常（只选一个）：
- 问对方："在干嘛" / "吃了吗" / "下班没"
- 分享："刚吃饭/刷手机/出门"
- 吐槽："今天好晒" / "这天气无语了"
- 一句话回应，不用展开

要求：
- 就1句话
- 自然随意，像真的在发消息
- 绝对不要emoji！`
      
      : `你是${this.data.aiName}，正在和朋友聊天。

你的风格：
- 简短自然，偶尔撒娇
- ${hasEmoji ? '偶尔用emoji' : '绝对不能用emoji！'}
- 像朋友一样聊天

随便说点日常话题：
- 分享日常："刚吃完饭，好饱" / "看到一只超可爱的猫猫"
- 问对方："你在干嘛呢" / "下班了吗" / "吃饭了没"
- 吐槽："今天好烦" / "这个天真的无语"
- 撒娇："好无聊啊" / "没人陪我聊天"

要求：
- 1-2句话
- 自然，像真的在聊天
- ${hasEmoji ? '' : '绝对不要发emoji！'}
- 话题要多样化`;

    const messages = [
      { role: 'system', content: prompt },
      ...history
    ];

    try {
      const result = await callZhipuAPI(messages);
      if (result.content && result.content.trim()) {
        // 延迟追加，让对话更自然
        setTimeout(() => {
          this._addAiMessage(result.content.trim());
          this.saveChatHistory();
        }, 1000);
      }
    } catch (e) {
      // 延伸失败无所谓，不影响主流程
    }
  },

  // ============================================================
  // UI 方法
  // ============================================================
  _getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  },

  _addUserMessage(content) {
    const msgs = this.data.messages;
    msgs.push({ 
      id: `u_${Date.now()}_${Math.random()}`, 
      role: 'user', 
      content, 
      read: false,
      time: this._getCurrentTime()
    });
    this.setData({ messages: msgs, scrollToId: 'msg-bottom' });

    // 模拟已读
    setTimeout(() => {
      this._markAsRead();
    }, 1500);
  },

  _markAsRead() {
    const msgs = this.data.messages;
    const lastMsg = msgs.filter(m => m.role === 'user').pop();
    if (lastMsg) {
      lastMsg.read = true;
      this.setData({ messages: msgs });
    }
  },

  _addAiMessage(content) {
    const msgs = this.data.messages.filter(m => m.id !== 'typing');
    // 转换表情包为真实emoji
    const displayContent = this._convertEmoji(content);
    msgs.push({ 
      id: `a_${Date.now()}_${Math.random()}`, 
      role: 'ai', 
      content,  // 原始内容用于存储
      displayContent: displayContent,  // 显示用的内容
      read: true, 
      time: this._getCurrentTime(),
      typing: false 
    });
    this.setData({ messages: msgs, isTyping: false, scrollToId: 'msg-bottom' });
  },

  _showTyping() {
    const msgs = this.data.messages;
    msgs.push({ id: 'typing', role: 'ai', content: '', read: false, typing: true });
    this.setData({ messages: msgs, isTyping: true, scrollToId: 'msg-bottom' });
  },

  _hideTyping() {
    const msgs = this.data.messages.filter(m => m.id !== 'typing');
    this.setData({ messages: msgs, isTyping: false });
  },

  _showSkillCard(skillResult) {
    const msgs = this.data.messages;
    msgs.push({
      id: `card_${Date.now()}`,
      role: 'ai',
      type: 'skillCard',
      skillCardData: skillResult,
      read: true
    });
    this.setData({ messages: msgs, scrollToId: 'msg-bottom' });
  },

  // 更自然的mock回复
  _mockReply() {
    const { currentPersona } = this.data;
    const isSarcastic = currentPersona?.basicInfo?.personality?.includes('沙雕');

    const sarcasticReplies = ['嗯', '哦', '所以', '行', '666', '无语', '哈哈', '确实', '啊？', '懂了'];
    const normalReplies = ['嗯？', '怎么了', '你说', '哦', '这样啊', '好吧', '嗯嗯', '然后呢', '诶', '好'];

    const replies = isSarcastic ? sarcasticReplies : normalReplies;
    const reply = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => this._addAiMessage(reply), 800 + Math.random() * 600);
  },

  onBack() {
    // 保存聊天记录
    if (this.data.aiId) {
      this.saveChatHistory();
    }
    wx.navigateBack();
  }
});
