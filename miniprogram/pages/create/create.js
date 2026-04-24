// 聊天记录上传页面
const app = getApp();

Page({
  data: {
    personaName: '',
    chatRecords: '',
    uploading: false,
    step: 1 // 1:填写信息 2:上传记录
  },

  onLoad() {
    // 获取页面参数
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel && eventChannel.onData) {
      eventChannel.onData((data) => {
        this.setData({ personaName: data.name || '' });
      });
    }
  },

  // 输入人格名称
  onNameInput(e) {
    this.setData({ personaName: e.detail.value });
  },

  // 输入聊天记录
  onRecordsInput(e) {
    this.setData({ chatRecords: e.detail.value });
  },

  // 下一步
  onNextStep() {
    const { personaName } = this.data;
    if (!personaName.trim()) {
      wx.showToast({ title: '请输入AI名字', icon: 'none' });
      return;
    }
    this.setData({ step: 2 });
  },

  // 返回上一步
  onPrevStep() {
    this.setData({ step: 1 });
  },

  // 选择导入方式
  onSelectImport(e) {
    const type = e.currentTarget.dataset.type;
    
    if (type === 'text') {
      // 手动粘贴
      wx.showModal({
        title: '粘贴聊天记录',
        content: '请将聊天记录粘贴到输入框中',
        confirmText: '我知道了',
        showCancel: false
      });
      this.setData({ step: 2 });
    } else if (type === 'file') {
      // 从文件选择
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success: (res) => {
          const filePath = res.tempFiles[0].path;
          wx.showLoading({ title: '读取中...' });
          
          // 读取文件内容
          wx.getFileSystemManager().readFile({
            filePath: filePath,
            encoding: 'utf-8',
            success: (readRes) => {
              wx.hideLoading();
              this.setData({ 
                chatRecords: readRes.data,
                step: 2 
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '读取失败', icon: 'none' });
            }
          });
        }
      });
    }
  },

  // 开始分析
  onStartAnalyze() {
    const { personaName, chatRecords } = this.data;
    
    if (!chatRecords.trim()) {
      wx.showToast({ title: '请先导入聊天记录', icon: 'none' });
      return;
    }

    if (chatRecords.length < 50) {
      wx.showToast({ title: '聊天记录太少了', icon: 'none' });
      return;
    }

    // 检查登录状态
    if (!app.globalData.openid) {
      wx.showModal({
        title: '请先登录',
        content: '创建人格需要登录账号',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }

    // 先存储到本地，分析页面直接读取
    wx.setStorageSync('pending_persona', {
      name: personaName,
      records: chatRecords,
      openid: app.globalData.openid
    });

    // 跳转到分析页面
    wx.navigateTo({
      url: '/pages/analyze/analyze'
    });
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
