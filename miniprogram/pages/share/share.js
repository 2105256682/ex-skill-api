Page({
  data: {
    userName: 'Vexill',
    showToast: false,
    toastText: ''
  },

  onLoad() {
    const character = wx.getStorageSync('currentCharacter') || {};
    if (character.name) {
      this.setData({ userName: character.name });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  showToast(text) {
    this.setData({
      showToast: true,
      toastText: text
    });
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  },

  shareTo(e) {
    const platform = e.currentTarget.dataset.platform;
    this.showToast('已分享至 ' + platform);
  },

  copyLink() {
    wx.setClipboardData({
      data: 'vexill.app/u/' + this.data.userName,
      success: () => {
        this.showToast('链接已复制');
      }
    });
  },

  saveImage() {
    this.showToast('保存成功');
  },

  report() {
    this.showToast('举报功能即将上线');
  }
});
