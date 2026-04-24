// pages/wish-feedback/wish-feedback.js
Page({
  data: {
    currentMode: 'wish',
    wishText: '',
    feedbackText: '',
    selectedTags: [],
    feedbackType: 'bug',
    starRating: 0,
    ratingText: '点击星星评分',
    showSuccess: false,
    successTitle: '',
    successDesc: '',
    wishList: []
  },

  onLoad() {
    // 加载本地存储的愿望列表
    const wishList = wx.getStorageSync('wishList') || [
      { id: 1, text: '希望增加夜间模式，晚上聊天眼睛会舒服很多', tag: '界面优化', date: '04-20', status: 'done' },
      { id: 2, text: '想要更多 Veixll 的表情包和互动动作', tag: '角色相关', date: '04-18', status: 'pending' },
      { id: 3, text: '希望能导出聊天记录，保存美好回忆', tag: '新功能', date: '04-15', status: 'pending' }
    ];
    this.setData({ wishList });
  },

  goBack() {
    wx.navigateBack();
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ currentMode: mode });
  },

  updateCharCount(e) {
    this.setData({ wishText: e.detail.value });
  },

  updateFeedbackCharCount(e) {
    this.setData({ feedbackText: e.detail.value });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = this.data.selectedTags;
    const index = selectedTags.indexOf(tag);
    
    if (index === -1) {
      selectedTags.push(tag);
    } else {
      selectedTags.splice(index, 1);
    }
    
    this.setData({ selectedTags });
  },

  selectFeedbackType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ feedbackType: type });
  },

  setStar(e) {
    const n = parseInt(e.currentTarget.dataset.n);
    const texts = ['', '需要改进', '一般', '不错', '很好', '非常满意'];
    this.setData({
      starRating: n,
      ratingText: texts[n] || '点击星星评分'
    });
  },

  submitWish() {
    const text = this.data.wishText.trim();
    if (!text) {
      wx.showToast({ title: '请输入愿望', icon: 'none' });
      return;
    }

    const newWish = {
      id: Date.now(),
      text: text,
      tag: this.data.selectedTags[0] || '其他',
      date: this._formatDate(),
      status: 'pending'
    };

    const wishList = [newWish, ...this.data.wishList];
    wx.setStorageSync('wishList', wishList);
    
    this.setData({
      wishList,
      wishText: '',
      selectedTags: []
    });

    this.showSuccessModal('愿望已投递', '我们会认真考虑每一个愿望');
  },

  submitFeedback() {
    const text = this.data.feedbackText.trim();
    if (!text) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }

    // 这里可以调用后端API提交反馈
    // 目前只是模拟提交
    this.setData({
      feedbackText: '',
      starRating: 0,
      ratingText: '点击星星评分'
    });

    this.showSuccessModal('反馈已收到', '感谢你的建议，我们会持续改进');
  },

  showSuccessModal(title, desc) {
    this.setData({
      showSuccess: true,
      successTitle: title,
      successDesc: desc
    });
  },

  closeSuccessModal() {
    this.setData({ showSuccess: false });
  },

  _formatDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }
});
