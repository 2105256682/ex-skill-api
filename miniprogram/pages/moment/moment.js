Page({
  data: {
    selectedMood: '平静',
    selectedColor: '#B8E0D2',
    selectedEmoji: '😌',
    noteText: '',
    showMyMood: false,
    myMoodTime: '',
    myMoodEmoji: '😌',
    myMoodText: '',
    feedTab: 'all',
    messages: [
      {
        id: 1,
        text: '今天工作效率很高，心情很平和，想和你分享这份宁静 ✨',
        mood: '平静',
        emoji: '😌',
        color: '#B8E0D2',
        tagBg: '#E8F6F3',
        tagColor: '#1ABC9C',
        time: '2小时前',
        recent: true,
        avatarColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        avatarText: '🤖',
        quickReply: '收到你的平静了，我也觉得很安心～'
      },
      {
        id: 2,
        text: '和朋友吃了好吃的火锅！要是你也在就好了 🍲',
        mood: '开心',
        emoji: '😊',
        color: '#FFE066',
        tagBg: '#FEF9E7',
        tagColor: '#F4D03F',
        time: '昨天',
        recent: true,
        avatarColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        avatarText: '🤖',
        quickReply: '下次一起去吃！'
      },
      {
        id: 3,
        text: '下雨天有点emo，想听听你的声音 ☔',
        mood: '难过',
        emoji: '😢',
        color: '#A8D8EA',
        tagBg: '#EBF5FB',
        tagColor: '#5DADE2',
        time: '3天前',
        recent: false,
        avatarColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        avatarText: '🤖',
        quickReply: '我在呢，随时陪你'
      }
    ]
  },

  onLoad() {
    // 获取当前人格信息
    const personas = wx.getStorageSync('personas') || [];
    if (personas.length > 0) {
      const currentPersona = personas[personas.length - 1];
      if (currentPersona.basicInfo?.name) {
        const messages = this.data.messages.map(m => ({
          ...m,
          avatarText: currentPersona.basicInfo.name.charAt(0)
        }));
        this.setData({ messages });
      }
    }
  },

  goBack() {
    wx.navigateBack();
  },

  selectMood(e) {
    const { mood, color, emoji } = e.currentTarget.dataset;
    this.setData({
      selectedMood: mood,
      selectedColor: color,
      selectedEmoji: emoji
    });
  },

  onNoteInput(e) {
    this.setData({ noteText: e.detail.value });
  },

  sendMood() {
    const note = this.data.noteText.trim() || '今天的心情...';
    const now = new Date();
    const timeStr = `今天 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.setData({
      showMyMood: true,
      myMoodTime: timeStr,
      myMoodEmoji: this.data.selectedEmoji,
      myMoodText: note
    });

    wx.showToast({ title: '已发送给TA！', icon: 'success' });
    this.setData({ noteText: '' });
  },

  switchFeedTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ feedTab: tab });
  },

  quickReply(e) {
    const text = e.currentTarget.dataset.text;
    // 跳转到聊天页面
    wx.navigateBack();
    // 通知聊天页面设置输入内容
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const chatPage = pages[pages.length - 1];
      if (chatPage && chatPage.setInputText) {
        chatPage.setInputText(text);
      }
    }
  }
});