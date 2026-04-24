Page({
  data: {
    // 第一页
    titleActive: false,
    page1Leaving: false,
    // 第二页
    page2Entering: false,
    page2Leaving: false,
    bgVShow: false,
    charAnimating: false,
    footerActive: false,
    // 第三页
    page3Entering: false
  },

  onLoad() {
    // 每次刷新都从开屏动画开始，不自动跳转
    this.startAnimation();
  },

  startAnimation() {
    // ── 第一页文字淡入
    this.setData({ titleActive: true });

    // ── 2s 后：第一页滑出，第二页滑入
    setTimeout(() => {
      this.setData({
        page1Leaving: true,
        page2Entering: true
      });

      // 过渡进行中：背景 V 淡入
      setTimeout(() => {
        this.setData({ bgVShow: true });

        // V 出现后：字母果冻弹跳 + 底部文字
        setTimeout(() => {
          this.setData({
            charAnimating: true,
            footerActive: true
          });

          // ── 再停留 2.2s 后：第二页滑出，第三页滑入
          setTimeout(() => {
            this.setData({
              page2Leaving: true,
              page3Entering: true
            });
          }, 2200);

        }, 800);
      }, 700);

    }, 2000);
  },

  onStart() {
    // 点击箭头后必须登录才能进入，不管之前有没有登录过
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
