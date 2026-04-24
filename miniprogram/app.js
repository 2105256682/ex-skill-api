App({
  globalData: {
    userInfo: null,
    openid: '',
    isCloudReady: false
  },

  onLaunch() {
    // 初始化云开发
    this.initCloud();
  },

  async initCloud() {
    // 检查是否支持云开发
    if (!wx.cloud) {
      console.log('当前环境不支持云开发');
      return;
    }

    try {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      });
      this.globalData.isCloudReady = true;
      console.log('云开发初始化成功');

      // 静默登录
      await this.silentLogin();
    } catch (e) {
      console.error('云开发初始化失败', e);
    }
  },

  async silentLogin() {
    // 小程序静默登录：获取openid
    try {
      const loginRes = await wx.cloud.callFunction({
        name: 'login',
        data: {}
      });

      if (loginRes && loginRes.result && loginRes.result.openid) {
        this.globalData.openid = loginRes.result.openid;
        console.log('获取到openid:', loginRes.result.openid);
      }
    } catch (e) {
      console.error('获取openid失败', e);
    }
  }
})
