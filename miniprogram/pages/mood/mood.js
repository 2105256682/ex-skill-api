// pages/mood/mood.js
Page({
  data: {
    currentTime: '9:41',
    selectedMood: '平静',
    selectedMoodEmoji: '😌',
    selectedMoodColor: '#B8E0D2',
    noteText: '',
    showMyMood: false,
    myMoodTime: '',
    feedTab: 'all',
    showToast: false,
    toastText: '',
    moods: [
      { name: '开心', emoji: '😊', gradient: 'linear-gradient(135deg, #FFE066, #FFD93D)', shadow: '0 4px 15px rgba(255, 224, 102, 0.4)' },
      { name: '幸福', emoji: '🥰', gradient: 'linear-gradient(135deg, #FFB3D1, #FF8FA3)', shadow: '0 4px 15px rgba(255, 179, 209, 0.4)' },
      { name: '平静', emoji: '😌', gradient: 'linear-gradient(135deg, #B8E0D2, #9ED2C6)', shadow: '0 4px 15px rgba(184, 224, 210, 0.4)' },
      { name: '思考', emoji: '🤔', gradient: 'linear-gradient(135deg, #C9D6DF, #B0C4DE)', shadow: '0 4px 15px rgba(201, 214, 223, 0.4)' },
      { name: '烦躁', emoji: '😤', gradient: 'linear-gradient(135deg, #FFD6A5, #FFB347)', shadow: '0 4px 15px rgba(255, 214, 165, 0.4)' },
      { name: '难过', emoji: '😢', gradient: 'linear-gradient(135deg, #A8D8EA, #87CEEB)', shadow: '0 4px 15px rgba(168, 216, 234, 0.4)' },
      { name: '疲惫', emoji: '😴', gradient: 'linear-gradient(135deg, #D4C5E2, #C5B4D6)', shadow: '0 4px 15px rgba(212, 197, 226, 0.4)' },
      { name: '兴奋', emoji: '🤩', gradient: 'linear-gradient(135deg, #FFD93D, #FFC107)', shadow: '0 4px 15px rgba(255, 217, 61, 0.4)' },
      { name: '焦虑', emoji: '😰', gradient: 'linear-gradient(135deg, #FFEAA7, #F9E79F)', shadow: '0 4px 15px rgba(255, 234, 167, 0.4)' },
      { name: '推荐', emoji: '🙋', gradient: 'linear-gradient(135deg, #FFAAA5, #FF8B94)', shadow: '0 4px 15px rgba(255, 170, 165, 0.4)' }
    ],
    feeds: [
      {
        avatar: '🤖',
        avatarBg: 'linear-gradient(135deg, #667eea, #764ba2)',
        text: '今天工作效率很高，心情很平和，想和你分享这份宁静 ✨',
        moodEmoji: '😌',
        moodName: '平静',
        time: '2小时前',
        isRecent: true,
        accentColor: '#B8E0D2',
        tagBg: '#E8F6F3',
        tagColor: '#1ABC9C',
        replyText: '收到你的平静了，我也觉得很安心～'
      },
      {
        avatar: '🤖',
        avatarBg: 'linear-gradient(135deg, #f093fb, #f5576c)',
        text: '和朋友吃了好吃的火锅！要是你也在就好了 🍲',
        moodEmoji: '😊',
        moodName: '开心',
        time: '昨天',
        isRecent: true,
        accentColor: '#FFE066',
        tagBg: '#FEF9E7',
        tagColor: '#F4D03F',
        replyText: '下次一起去吃！'
      },
      {
        avatar: '🤖',
        avatarBg: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        text: '下雨天有点emo，想听听你的声音 ☔',
        moodEmoji: '😢',
        moodName: '难过',
        time: '3天前',
        isRecent: false,
        accentColor: '#A8D8EA',
        tagBg: '#EBF5FB',
        tagColor: '#5DADE2',
        replyText: '我在呢，随时陪你'
      }
    ]
  },

  onLoad() {
    this.updateTime();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  goBack() {
    wx.navigateBack();
  },

  selectMood(e) {
    const mood = e.currentTarget.dataset.mood;
    const emoji = e.currentTarget.dataset.emoji;
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedMood: mood,
      selectedMoodEmoji: emoji,
      selectedMoodColor: color
    });
  },

  onNoteInput(e) {
    this.setData({
      noteText: e.detail.value
    });
  },

  sendMood() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    this.setData({
      showMyMood: true,
      myMoodTime: `今天 ${hours}:${minutes}`
    });

    this.showToast('已发送给TA！');
  },

  switchFeedTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      feedTab: tab
    });
  },

  quickReply(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({
      noteText: text
    });
    wx.pageScrollTo({
      selector: '.note-section',
      duration: 300
    });
  },

  showToast(message) {
    this.setData({
      showToast: true,
      toastText: message
    });
    setTimeout(() => {
      this.setData({
        showToast: false
      });
    }, 2000);
  }
});
