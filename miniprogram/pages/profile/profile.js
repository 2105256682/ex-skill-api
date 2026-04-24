const app = getApp();

Page({
  data: {
    currentTab: 'featured',
    fortuneOn: true,
    tabNames: {
      featured: '精选',
      all: '全部帖子',
      replies: '回复记录',
      likes: '点赞记录'
    },
    followingCount: 0,
    followersCount: 0,
    likesCount: 0
  },

  onLoad() {
    this.loadUserData();
  },

  loadUserData() {
    const userData = wx.getStorageSync('userData') || {};
    this.setData({
      followingCount: userData.followingCount || 0,
      followersCount: userData.followersCount || 0,
      likesCount: userData.likesCount || 0
    });
  },

  editAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: () => {
        wx.showToast({ title: '更换头像', icon: 'success' });
      }
    });
  },

  editProfile() {
    wx.showToast({ title: '编辑资料', icon: 'none' });
  },

  shareProfile() {
    wx.navigateTo({ url: '/pages/share/share' });
  },

  showFollowing() {
    wx.showToast({ title: '关注列表', icon: 'none' });
  },

  showFollowers() {
    wx.showToast({ title: '粉丝列表', icon: 'none' });
  },

  showLikes() {
    wx.showToast({ title: '点赞记录', icon: 'none' });
  },

  openNotification() {
    wx.navigateTo({ url: '/pages/notification/notification' });
  },

  goToVip() {
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  goToWallet() {
    wx.navigateTo({ url: '/pages/wallet/wallet' });
  },

  goToCharacter() {
    wx.navigateTo({ url: '/pages/character-setting/character-setting' });
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/wish-feedback/wish-feedback' });
  },

  openFortune() {
    if (!this.data.fortuneOn) {
      wx.showToast({ title: '请先开启运势测试', icon: 'none' });
      return;
    }
    wx.showToast({ title: '今日运势：大吉 ⭐⭐⭐⭐⭐', icon: 'none' });
  },

  toggleFortune() {
    const newVal = !this.data.fortuneOn;
    this.setData({ fortuneOn: newVal });
    wx.showToast({ 
      title: newVal ? '运势测试已开启' : '运势测试已关闭', 
      icon: 'none' 
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  showPostDetail() {
    wx.showToast({ title: '查看帖子详情', icon: 'none' });
  },

  likePost() {
    wx.showToast({ title: '点赞成功', icon: 'none' });
  },

  commentPost() {
    wx.showToast({ title: '评论功能', icon: 'none' });
  },

  sharePost() {
    wx.showToast({ title: '分享帖子', icon: 'none' });
  }
});