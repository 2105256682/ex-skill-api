Page({
  data: {
    currentTab: 'coin',
    isVip: false,
    coinBalance: 0,
    pointBalance: 0,
    usageList: [],
    vipExpireTime: '',
    hasVipRecord: false
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    // 每次显示时刷新数据（确保签到后金币余额更新）
    this.loadUserData();
  },

  loadUserData() {
    // 从本地存储读取用户数据
    const userData = wx.getStorageSync('userData') || {};
    const usageList = userData.usageList || [];
    const hasVipRecord = usageList.some(item => item.type === 'vip');
    this.setData({
      isVip: userData.isVip || false,
      coinBalance: userData.coinBalance || 0,
      pointBalance: userData.pointBalance || 0,
      usageList: usageList,
      vipExpireTime: userData.vipExpireTime || '',
      hasVipRecord: hasVipRecord
    });
  },

  goBack() {
    wx.navigateBack();
  },

  renewVip() {
    wx.navigateTo({ url: '/pages/wallet/wallet' });
  },

  goRecharge() {
    wx.navigateTo({ url: '/pages/wallet/wallet' });
  },

  goWish() {
    wx.navigateTo({ url: '/pages/wish-feedback/wish-feedback' });
  },

  goWallet() {
    wx.navigateTo({ url: '/pages/wallet/wallet' });
  },

  showCoinUsage() {
    this.setData({ currentTab: 'coin' });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  }
});