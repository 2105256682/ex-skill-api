Page({
  data: {},

  onLoad() {},

  onShow() {
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.updateSelected();
      }
    }
  }
});
