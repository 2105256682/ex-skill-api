const app = getApp();
const cloud = require('../../utils/cloud.js');

Page({
  data: {
    personas: [],
    loading: true
  },

  onLoad() {
    this.loadPersonas();
  },

  onShow() {
    // 同步 tabBar 选中状态
    if (this.getTabBar) {
      this.getTabBar().setData({ selected: 2 });
    }
    // 刷新列表
    this.loadPersonas();
  },

  // 加载人格列表（云开发）
  async loadPersonas() {
    const openid = app.globalData.openid;

    try {
      this.setData({ loading: true });
      
      // 尝试从云端加载
      if (openid) {
        const personas = await cloud.getUserPersonas(openid);
        this.setData({ personas, loading: false });
        return;
      }
    } catch (err) {
      console.error('云端加载失败，降级到本地', err);
    }

    // 降级到本地存储
    const personas = wx.getStorageSync('personas') || [];
    this.setData({ personas, loading: false });
  },

  // 创建新人格
  onCreatePersona() {
    // 检查金币
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.coinBalance <= 0) {
      wx.showModal({
        title: '金币不足',
        content: '创建人格需要消耗金币，是否前往充值？',
        confirmText: '去充值',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/vip/vip' });
          }
        }
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  // 开始聊天
  onChat(e) {
    const personaId = e.currentTarget.dataset.id;
    if (!personaId) {
      console.error('personaId is undefined');
      return;
    }

    // 保存当前聊天人格
    const persona = this.data.personas.find(p => p._id === personaId);
    if (!persona) {
      wx.showToast({ title: '人格不存在', icon: 'none' });
      return;
    }

    // 保存当前聊天人格到本地存储
    wx.setStorageSync('current_chat_persona', {
      id: persona._id,
      name: persona.name,
      emoji: persona.emoji,
      systemPrompt: persona.systemPrompt
    });

    // 跳转到聊天页面
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  // 删除人格
  onDeletePersona(e) {
    const personaId = e.currentTarget.dataset.id;
    const persona = this.data.personas.find(p => p._id === personaId);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${persona?.name || '这个人格'}"吗？聊天记录也会一并删除`,
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this._doDeletePersona(personaId);
        }
      }
    });
  },

  // 执行删除
  async _doDeletePersona(personaId) {
    try {
      // 检查云是否可用
      if (cloud.getCollection && app.globalData.openid) {
        await cloud.deletePersona(personaId);
      }
    } catch (err) {
      console.error('云端删除失败，使用本地删除', err);
    }

    // 无论云是否成功，都删除本地存储
    const personas = wx.getStorageSync('personas') || [];
    const filtered = personas.filter(p => p.id !== personaId && p._id !== personaId);
    wx.setStorageSync('personas', filtered);

    // 更新当前列表
    const currentList = this.data.personas.filter(p => p._id !== personaId);
    this.setData({ personas: currentList });

    wx.showToast({ title: '已删除', icon: 'success' });
  },

  onBack() {
    wx.navigateBack();
  }
});
