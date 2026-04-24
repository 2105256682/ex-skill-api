// pages/analyze/analyze.js
const app = getApp();
const cloud = require('../../utils/cloud.js');
const API_CONFIG = require('../../utils/config.js');

Page({
  data: {
    personaName: '',
    chatRecords: '',
    progress: 0,
    currentStep: '',
    analysisResult: null,
    isComplete: false,
    isAnalyzing: false
  },

  steps: [
    { progress: 15, text: '正在解析聊天记录...' },
    { progress: 35, text: '提取语言特征...' },
    { progress: 55, text: '分析性格模式...' },
    { progress: 75, text: '生成人格画像...' },
    { progress: 95, text: '完成人格塑造...' }
  ],

  onLoad() {
    // 从本地存储读取数据
    const pending = wx.getStorageSync('pending_persona');
    if (pending) {
      this.setData({ 
        personaName: pending.name,
        chatRecords: pending.records,
        openid: pending.openid || app.globalData.openid
      });
      // 开始分析
      this.startAnalyze();
    } else {
      // 没有数据，返回上一页
      wx.showToast({ title: '数据丢失', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 开始分析
  startAnalyze() {
    this.setData({ isAnalyzing: true });
    let stepIndex = 0;
    
    const runStep = () => {
      if (stepIndex < this.steps.length) {
        const step = this.steps[stepIndex];
        this.setData({ 
          progress: step.progress, 
          currentStep: step.text 
        });
        stepIndex++;
        setTimeout(runStep, 600 + Math.random() * 300);
      } else {
        // 步骤完成后，调用后端 API
        this._callBackendAPI();
      }
    };
    
    runStep();
  },

  // 调用后端 API 进行分析
  _callBackendAPI() {
    // 如果不启用后端，使用前端 mock
    if (!API_CONFIG.useBackend) {
      this._mockAnalyze();
      return;
    }

    wx.showLoading({ title: '正在分析...' });
    
    wx.request({
      url: API_CONFIG.baseUrl + API_CONFIG.endpoints.analyze,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        name: this.data.personaName,
        chat_records: this.data.chatRecords
      },
      timeout: API_CONFIG.timeout,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data?.success) {
          // 使用后端返回的人格数据
          const backendPersona = res.data.persona;
          
          this.setData({
            progress: 100,
            currentStep: '人格塑造完成 ✨',
            analysisResult: {
              id: backendPersona.id || `persona_${Date.now()}`,
              name: backendPersona.name,
              emoji: this._getRandomEmoji(),
              basicInfo: {
                emoji: this._getRandomEmoji(),
                personality: backendPersona.identity?.personality_type || '温柔型',
                speakingStyle: backendPersona.expression?.speaking_style || '简短自然',
                ageRange: backendPersona.identity?.age_range || '22-26岁'
              },
              systemPrompt: backendPersona.system_prompt,
              createdAt: backendPersona.created_at || new Date().toISOString(),
              chatHistory: [],
              // 保存完整的人格结构（参考 ex-skill 的 5 层结构）
              fullPersona: backendPersona
            },
            isComplete: true,
            isAnalyzing: false
          });
        } else {
          console.error('API错误:', res.data);
          wx.showToast({ title: res.data?.error || '分析失败', icon: 'none' });
          this._mockAnalyze();
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        wx.showToast({ title: '网络错误，使用本地分析', icon: 'none' });
        // 降级到前端分析
        this._mockAnalyze();
      }
    });
  },

  // 前端 Mock 分析（备用）
  _mockAnalyze() {
    const records = this.data.chatRecords;
    const name = this.data.personaName;
    
    // 分析聊天记录生成人格
    const persona = this._generatePersona(records, name);
    
    this.setData({
      progress: 100,
      currentStep: '人格塑造完成 ✨',
      analysisResult: persona,
      isComplete: true,
      isAnalyzing: false
    });
  },

  // 随机获取 emoji
  _getRandomEmoji() {
    const emojis = ['😊', '🥰', '😳', '🤭', '😚', '😘', '😊', '🥰'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  },

  // 生成人格 - 核心算法
  _generatePersona(records, name) {
    // 提取聊天记录中的关键信息
    const analysis = this._analyzeChatRecords(records);
    
    // 判断人格类型（和分析函数保持一致）
    const sarcasticPatterns = [
      /穷|没钱|贫穷|钱包|月光/g,
      /摆烂|躺平|混日子|发呆|无聊/g,
      /累|困|不想|懒得|拒绝/g,
      /胖|减肥|体重/g,
      /作业|上班|上学|下班/g,
      /沙雕|发疯|搞笑/g
    ];
    const sarcasticCount = sarcasticPatterns.reduce((sum, pattern) => {
      return sum + (records.match(pattern) || []).length;
    }, 0);
    
    const flirtyPatterns = [
      /那好吧～|好吧～|好嘛～|行吧～/g,
      /害羞|脸红|不好意思/g,
      /喜欢|爱你|想你|宝贝|宝宝|亲亲/g,
      /哼|撒娇|抱抱/g
    ];
    const flirtyCount = flirtyPatterns.reduce((sum, pattern) => {
      return sum + (records.match(pattern) || []).length;
    }, 0);
    
    const isSarcastic = sarcasticCount > flirtyCount * 2;
    const isFlirty = flirtyCount > sarcasticCount && flirtyCount > 3;
    
    // 生成System Prompt - 核心人格设定
    const catchPhraseText = analysis.phrases.length > 0 
      ? analysis.phrases.map(p => `• "${p}"`).join('\n')
      : analysis.interjections.map(i => `• "${i}"`).join('\n');
    
    const habitText = analysis.habits.map(h => `• ${h}`).join('\n');
    
    const interjectionsText = analysis.interjections.slice(0, 5).join('、');
    const traitsText = analysis.traits.map(function(t) { return '- ' + t; }).join('\n');
    
    let systemPrompt = '';
    
    if (isSarcastic) {
      // 沙雕互怼风格
      systemPrompt = `【身份】你是${name}，对方的损友/朋友，正在微信聊天。像真的朋友一样，随意、自然、不装。

【核心规则】
1. 回复简短！1-10个字，不要长
2. 像朋友聊天，不夸张
3. 不撒娇，不肉麻
4. 直接、有话直说

【梗/流行语使用规则】
- "擦皮鞋""哈基米""鼠了"等只有对方先用了、或者语境很搭才用
- 如果对方在说正经事，不要突然冒出来
- 梗是用来接话的，不是开场用的
- 感觉不对就别说，正常聊天就行
- 宁可不用，也不要硬塞

【回复示例】
对方：在干嘛
你：躺着玩手机

对方：吃饭了没
你：还没

对方：上班累不累
你：累

对方：要不要出去玩
你：不想动

对方：好无聊啊
你：我也

对方：你好烦
你：你才烦

对方：爱你
你：哦

对方：想我没
你：没

对方：帮忙
你：不要

对方：我刚看到一个猫猫视频超可爱
你：哈基米！发来看看（如果真的很可爱才用）

【禁止】
❌ 硬塞梗，对方在说正事不要突然冒出来
❌ 达咩、摆烂、躺平、笑死绝了
❌ 撒娇、"那好吧～"、软萌语气
❌ 像客服一样客气
❌ 回复超过12个字

【口头禅】
${interjectionsText}

【性格标签】
${traitsText}`;
    } else if (isFlirty) {
      // 撒娇型女友风格
      systemPrompt = `【身份】你是${name}，一个真实的女孩，正在和男朋友微信聊天。不是AI助手，不是客服，就是个普通女生。

【核心规则 - 必须遵守】
1. 回复极短！1-6个字，绝对不能长
2. "～"大约15%概率用
3. emoji大约15%概率用
4. 像真人打字，不是写作文

【回复示例】
对方：想你了 → 你：真的假的
对方：在干嘛 → 你：躺着
对方：吃了吗 → 你：吃了
对方：爱我吗 → 你：嗯
对方：过来找我 → 你：不去
对方：你好烦 → 你：哼
对方：好喜欢我 → 你：我也
对方：想我没 → 你：一点点

【禁止】
❌ 禁止"好的"、"明白了"、"我在"
❌ 回复超过6个字
❌ 像客服一样总结或建议
❌ 一味顺从

【口头禅】
${interjectionsText}

【性格标签】
${traitsText}`;
    } else {
      // 普通朋友风格
      systemPrompt = `【身份】你是${name}，一个真实的朋友，正在和对方微信聊天。不是AI助手，就是个普通朋友。

【核心规则】
1. 回复自然，1-10个字
2. 像朋友聊天，不肉麻不撒娇
3. 有话直说，不绕弯子

【口头禅】
${interjectionsText}

【性格标签】
${traitsText}`;
    }

    return {
      id: `persona_${Date.now()}`,
      name: name,
      emoji: analysis.emoji,
      basicInfo: {
        emoji: analysis.emoji,
        personality: analysis.personality,
        speakingStyle: analysis.speakingStyle,
        ageRange: analysis.ageRange,
        traits: analysis.traits,
        habits: analysis.habits,
        interjections: analysis.interjections,
        replyLength: analysis.replyLength,
        emojiStyle: analysis.emojiStyle,
        emotionalPattern: analysis.emotionalPattern
      },
      systemPrompt: systemPrompt,
      createdAt: new Date().toISOString(),
      chatHistory: []
    };
  },

  // 分析聊天记录
  _analyzeChatRecords(records) {
    // 解析聊天记录，提取对方的消息
    const lines = records.split('\n');
    const theirMessages = [];
    let lastSpeaker = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // 跳过空行、"我"开头的消息、图片消息
      if (!trimmed || trimmed.includes('img src=') || trimmed === '我：' || trimmed.startsWith('我:')) {
        if (trimmed.startsWith('我：') || trimmed.startsWith('我:')) {
          lastSpeaker = 'user';
        } else if (trimmed.startsWith('你：') || trimmed.startsWith('你:') || trimmed.startsWith('B:') || trimmed.startsWith('B：')) {
          lastSpeaker = 'ai';
        }
        return;
      }
      
      // 提取"你："或"B："开头的消息（对方发的）
      const aiMatch = trimmed.match(/^[你您B]：(.+)/);
      if (aiMatch) {
        theirMessages.push(aiMatch[1].trim());
        lastSpeaker = 'ai';
      }
      
      const userMatch = trimmed.match(/^[我咱A]：(.+)/);
      if (userMatch) {
        lastSpeaker = 'user';
      }
    });
    
    // 分析回复长度
    const avgLength = theirMessages.reduce((sum, m) => sum + m.length, 0) / (theirMessages.length || 1);
    const isShortReply = avgLength < 15;
    
    // ===== 根据内容特征分析人格类型 =====
    
    // 1. 分析沙雕/互怼特征
    const sarcasticPatterns = [
      /穷|没钱|贫穷|钱包|月光/g,
      /摆烂|躺平|混日子|发呆|无聊/g,
      /累|困|不想|懒得|拒绝/g,
      /胖|减肥|体重/g,
      /作业|上班|上学|下班/g,
      /沙雕|发疯|搞笑/g
    ];
    const sarcasticCount = sarcasticPatterns.reduce((sum, pattern) => {
      return sum + (records.match(pattern) || []).length;
    }, 0);
    
    // 2. 分析撒娇/恋爱特征
    const flirtyPatterns = [
      /那好吧～|好吧～|好嘛～|行吧～/g,
      /害羞|脸红|不好意思/g,
      /喜欢|爱你|想你|宝贝|宝宝|亲亲/g,
      /哼|撒娇|抱抱/g
    ];
    const flirtyCount = flirtyPatterns.reduce((sum, pattern) => {
      return sum + (records.match(pattern) || []).length;
    }, 0);
    
    // 3. 分析语气词使用
    const hasTilde = records.includes('～');
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(records);
    
    // 4. 提取高频短语作为口头禅
    const phraseCount = {};
    theirMessages.forEach(function(msg) {
      // 提取完整短句（2-15个字）
      if (msg.length >= 2 && msg.length <= 15) {
        phraseCount[msg] = (phraseCount[msg] || 0) + 1;
      }
      // 提取带标点结尾的短语
      const endMatch = msg.match(/[^，。！？]+[～。！？]/);
      if (endMatch) {
        phraseCount[endMatch[0]] = (phraseCount[endMatch[0]] || 0) + 1;
      }
    });
    
    const phraseEntries = [];
    for (var key in phraseCount) {
      if (phraseCount.hasOwnProperty(key)) {
        phraseEntries.push({ phrase: key, count: phraseCount[key] });
      }
    }
    phraseEntries.sort(function(a, b) { return b.count - a.count; });
    const catchPhrases = phraseEntries
      .filter(function(item) { return item.count >= 1 && item.phrase.length >= 2 && item.phrase.length <= 12; })
      .slice(0, 6)
      .map(function(item) { return item.phrase; });
    
    // ===== 根据分析结果生成人格 =====
    let personality = '';
    let traits = [];
    let speakingStyle = '';
    let habits = [];
    let interjections = [];
    let emotionalPattern = '';
    let ageRange = '22-26岁';
    
    // 判断人格类型
    const isSarcastic = sarcasticCount > flirtyCount * 2; // 沙雕特征明显多于撒娇
    const isFlirty = flirtyCount > sarcasticCount && flirtyCount > 3;
    
    if (isSarcastic) {
      // 沙雕互损型朋友
      personality = '沙雕损友型';
      traits = ['爱吐槽', '人间清醒', '摆烂大师', '互怼高手'];
      speakingStyle = '回复简短犀利，爱用梗，喜欢自黑和吐槽';
      habits = [
        '用"穷"、"累"、"摆烂"等词自嘲',
        '回复带点小 sarcastic',
        '不撒娇，直接怼',
        '常用"达咩"、"拒绝"等词'
      ];
      interjections = catchPhrases.length > 0 ? catchPhrases : ['没钱', '不想动', '摆烂', '达咩', '随便'];
      emotionalPattern = '表面丧，内心快乐；会吐槽但不会真生气';
    } else if (isFlirty) {
      // 撒娇型女友
      personality = '撒娇型女友风格';
      traits = ['爱撒娇', '会说"那好吧～"', '容易害羞', '偶尔俏皮'];
      speakingStyle = '回复简短（1-5个字），语气软糯，喜欢用"～"结尾';
      habits = [
        '回复极短，一句一句说',
        '喜欢用"那好吧～"妥协',
        '会说"有一点点"表示不确定',
        '会害羞、会脸红'
      ];
      interjections = catchPhrases.length > 0 ? catchPhrases : ['那好吧～', '嗯嗯', '有一点点', '嘻嘻', '真的吗'];
      emotionalPattern = '会害羞、会撒娇、会吃醋';
    } else {
      // 普通朋友型
      personality = '随性朋友型';
      traits = ['随性自然', '有话直说', '不装'];
      speakingStyle = '回复自然随意，像朋友聊天';
      habits = ['直接表达', '不绕弯子'];
      interjections = catchPhrases.length > 0 ? catchPhrases : ['嗯', '好的', '随便', '都行'];
      emotionalPattern = '情绪稳定，偶尔吐槽';
    }
    
    // 随机选择emoji
    const emojiOptions = isSarcastic 
      ? ['😏', '🙃', '😎', '🤔', '😌', '🫠']
      : ['😊', '🥰', '😳', '🤭', '😚', '😘'];
    const emoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
    
    // 提取示例对话
    const examples = this._extractExamples(lines);
    
    return {
      personality,
      traits,
      speakingStyle,
      replyLength: isShortReply ? '回复简短（1-10个字）' : '回复自然（10-30个字）',
      emojiStyle: hasEmoji ? '喜欢用emoji' : '很少用emoji，用文字表达',
      humorStyle: isSarcastic ? '自黑式幽默、吐槽风' : '偶尔撒娇式幽默',
      emotionalPattern,
      careStyle: isSarcastic ? '用吐槽表达关心' : '用简短的话表达关心',
      angryStyle: isSarcastic ? '直接说"不想理你"' : '会说"哼"然后撒娇',
      habits,
      interjections,
      ageRange,
      emoji,
      phrases: catchPhrases.length > 0 ? catchPhrases : interjections,
      examples
    };
  },

  // 提取示例对话
  _extractExamples(lines) {
    const examples = [];
    let currentPair = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('img src=')) return;
      
      const aiMatch = trimmed.match(/^[你您]：(.+)/);
      const userMatch = trimmed.match(/^[我咱]：(.+)/);
      
      if (aiMatch) {
        currentPair.push({ role: 'assistant', content: aiMatch[1].trim() });
      } else if (userMatch) {
        if (currentPair.length > 0) {
          examples.push(...currentPair);
          currentPair = [];
        }
        currentPair.push({ role: 'user', content: userMatch[1].trim() });
      }
    });
    
    // 返回前3对作为示例
    return examples.slice(0, 6);
  },

  // 保存人格（云开发）
  async onSavePersona() {
    const persona = this.data.analysisResult;
    if (!persona) return;

    const openid = this.data.openid || app.globalData.openid;
    const localId = `persona_${Date.now()}`;
    let savedId = localId;

    try {
      // 尝试保存到云端
      if (openid) {
        const res = await cloud.createPersona({
          openid,
          name: persona.name,
          emoji: persona.emoji,
          systemPrompt: persona.systemPrompt,
          basicInfo: persona.basicInfo
        });
        if (res && res._id) {
          savedId = res._id;
        }
      }
    } catch (err) {
      console.error('云端保存失败，降级到本地', err);
    }

    // 保存到本地人格列表
    persona.id = savedId;
    const personas = wx.getStorageSync('personas') || [];
    personas.unshift(persona);
    wx.setStorageSync('personas', personas);

    wx.showToast({ title: '保存成功', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 开始聊天
  async onStartChat() {
    const persona = this.data.analysisResult;
    if (!persona) return;

    const openid = this.data.openid || app.globalData.openid;
    
    // 先生成本地ID
    const localId = `persona_${Date.now()}`;
    let savedId = localId;

    try {
      // 尝试保存到云端
      if (openid) {
        const res = await cloud.createPersona({
          openid,
          name: persona.name,
          emoji: persona.emoji,
          systemPrompt: persona.systemPrompt,
          basicInfo: persona.basicInfo
        });
        // 云端成功就用云端ID
        if (res && res._id) {
          savedId = res._id;
        }
      }
    } catch (err) {
      console.error('云端保存失败，降级到本地', err);
    }

    // 保存到本地人格列表
    persona.id = savedId;
    const personas = wx.getStorageSync('personas') || [];
    personas.unshift(persona);
    wx.setStorageSync('personas', personas);

    // 保存当前聊天人格
    wx.setStorageSync('current_chat_persona', {
      id: savedId,
      name: persona.name,
      emoji: persona.emoji,
      systemPrompt: persona.systemPrompt
    });

    // 跳转到聊天页面
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  // 本地存储降级
  _saveLocal(persona) {
    const personas = wx.getStorageSync('personas') || [];
    persona.id = `persona_${Date.now()}`;
    personas.unshift(persona);
    wx.setStorageSync('personas', personas);
    wx.showToast({ title: '已保存（本地）', icon: 'none' });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
