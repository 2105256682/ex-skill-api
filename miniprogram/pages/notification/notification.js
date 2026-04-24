Page({
  data: {
    notifications: [
      {
        id: 1,
        type: 'system',
        icon: '📢',
        title: '系统通知',
        desc: '欢迎来到 Vexill！开始创建你的专属 AI 角色吧',
        time: '刚刚',
        read: false
      },
      {
        id: 2,
        type: 'like',
        icon: '❤️',
        title: 'Alice 赞了你',
        desc: '你的动态"今日份的思考"获得了 128 个赞',
        time: '2小时前',
        read: false
      },
      {
        id: 3,
        type: 'comment',
        icon: '💬',
        title: 'Bob 评论了你',
        desc: '写得很棒！期待更多分享',
        time: '昨天',
        read: true
      },
      {
        id: 4,
        type: 'follow',
        icon: '👤',
        title: 'Charlie 关注了你',
        desc: '你的粉丝数增加了 1 位',
        time: '3天前',
        read: true
      }
    ]
  },

  onLoad() {
    // 页面加载
  },

  goBack() {
    wx.navigateBack();
  },

  readNotification(e) {
    const id = e.currentTarget.dataset.id;
    const notifications = this.data.notifications.map(item => {
      if (item.id === id) {
        return { ...item, read: true };
      }
      return item;
    });
    this.setData({ notifications });
  }
});
