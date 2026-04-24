const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    loading: false
  },

  onLoad() {
    // 检查是否已登录（云开发模式）
    this.checkLogin();
  },

  async checkLogin() {
    // 如果 globalData 已有用户信息，直接跳转
    if (app.globalData.userInfo) {
      wx.switchTab({ url: '/pages/plaza/plaza' });
    }
  },

  // 微信一键登录
  async onWxLogin() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      // 1. 获取微信用户信息
      const setting = await wx.getSetting();
      let userInfo = {};

      if (!setting.authSetting['scope.userInfo']) {
        // 需要授权
        const authorize = await wx.authorize({ scope: 'scope.userInfo' });
      }

      // 获取用户信息
      const getUserInfoRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: resolve,
          fail: reject
        });
      });

      userInfo = getUserInfoRes.userInfo;

      // 2. 获取 openid（通过云开发）
      const loginRes = await wx.cloud.callFunction({
        name: 'login'
      });

      const openid = loginRes.result.openid;

      // 3. 云开发登录/注册
      const user = await cloud.loginOrRegister({
        openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl
      });

      // 4. 保存到全局
      app.globalData.userInfo = user;
      app.globalData.openid = openid;

      // 5. 跳转到首页
      wx.switchTab({ url: '/pages/plaza/plaza' });

    } catch (err) {
      console.error('登录失败', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳过登录（游客模式）
  onSkip() {
    // 生成一个临时openid
    app.globalData.openid = 'tourist_' + Date.now();
    app.globalData.userInfo = {
      nickname: '游客',
      avatar: '',
      coinBalance: 10
    };
    wx.switchTab({ url: '/pages/plaza/plaza' });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});
