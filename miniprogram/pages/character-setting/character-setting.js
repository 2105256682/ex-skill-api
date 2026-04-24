// pages/character-setting/character-setting.js
Page({
  data: {
    avatarUrl: '',
    name: 'Vexill',
    inputText: '',
  },

  onLoad(options) {
    // 获取已保存的角色信息
    const character = wx.getStorageSync('currentCharacter') || {};
    if (character.avatarUrl) {
      this.setData({ avatarUrl: character.avatarUrl });
    }
    if (character.name) {
      this.setData({ name: character.name });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 关闭页面
  closePage() {
    wx.navigateBack();
  },

  // 选择头像
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({ avatarUrl: tempFilePath });
        // 保存到本地
        const character = wx.getStorageSync('currentCharacter') || {};
        character.avatarUrl = tempFilePath;
        wx.setStorageSync('currentCharacter', character);
      }
    });
  },

  // 编辑人设
  editCharacter() {
    console.log('点击了编辑人设');
    wx.navigateTo({
      url: '/pages/character-edit/character-edit'
    });
  },

  // 跳转记忆页面
  goMemory() {
    wx.navigateTo({
      url: '/pages/memory/memory'
    });
  },

  // 跳转语音页面
  goVoice() {
    wx.navigateTo({
      url: '/pages/voice/voice'
    });
  },

  // 跳转动态页面
  goDynamic() {
    wx.navigateTo({
      url: '/pages/mood/mood'
    });
  },

  // 输入处理
  onInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送消息
  handleSend() {
    const text = this.data.inputText.trim();
    if (!text) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    // TODO: 发送消息给AI
    wx.showToast({
      title: '发送: ' + text,
      icon: 'none'
    });
    
    this.setData({
      inputText: ''
    });
  },

  // 保存设置
  saveSettings() {
    const character = wx.getStorageSync('currentCharacter') || {};
    character.name = this.data.name;
    character.avatarUrl = this.data.avatarUrl;
    wx.setStorageSync('currentCharacter', character);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
});
