const app = getApp();

Page({
  data: {
    hasNotice: true,
    hasMessage: true,
    checkinDays: 0,
    redeemCode: ''
  },

  onLoad() {
    // 读取签到天数
    const days = wx.getStorageSync('checkinDays') || 0;
    this.setData({ checkinDays: days });
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.updateSelected();
      }
    }
  },

  // 通知
  onNotice() {
    wx.showToast({ title: '暂无新通知', icon: 'none' });
    this.setData({ hasNotice: false });
  },

  // 消息
  onMessage() {
    wx.switchTab({ url: '/pages/main/main' });
  },

  // 签到
  onCheckin() {
    const today = new Date().toDateString();
    const lastCheckin = wx.getStorageSync('lastCheckin');
    
    if (lastCheckin === today) {
      wx.showToast({ title: '今天已签到', icon: 'none' });
      return;
    }
    
    // 更新签到天数
    const days = (wx.getStorageSync('checkinDays') || 0) + 1;
    wx.setStorageSync('checkinDays', days);
    wx.setStorageSync('lastCheckin', today);
    this.setData({ checkinDays: days });
    
    // 增加金币余额
    const userData = wx.getStorageSync('userData') || { coinBalance: 0 };
    userData.coinBalance = (userData.coinBalance || 0) + 55;
    wx.setStorageSync('userData', userData);
    
    wx.showToast({ title: '签到成功 +55金币', icon: 'success' });
  },

  // 兑换码输入
  onRedeemInput(e) {
    this.setData({ redeemCode: e.detail.value });
  },

  // 兑换
  onRedeem() {
    const { redeemCode } = this.data;
    if (!redeemCode.trim()) {
      wx.showToast({ title: '请输入兑换码', icon: 'none' });
      return;
    }
    wx.showToast({ title: '兑换成功', icon: 'success' });
    this.setData({ redeemCode: '' });
  }
});
