Page({
  data: {
    nickname: '',
    account: '',
    password: '',
    password2: '',
    showPwd: false,
    showPwd2: false,
    loading: false,
    errorMsg: ''
  },

  onNicknameInput(e) { this.setData({ nickname: e.detail.value }); },
  onAccountInput(e)  { this.setData({ account: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onPassword2Input(e){ this.setData({ password2: e.detail.value }); },
  togglePwd()  { this.setData({ showPwd:  !this.data.showPwd  }); },
  togglePwd2() { this.setData({ showPwd2: !this.data.showPwd2 }); },

  showError(msg) {
    this.setData({ errorMsg: msg });
    setTimeout(() => this.setData({ errorMsg: '' }), 2500);
  },

  async onRegister() {
    const { nickname, account, password, password2, loading } = this.data;
    if (loading) return;
    if (!nickname.trim())  return this.showError('请输入昵称');
    if (!account.trim())   return this.showError('请输入账号');
    if (password.length < 6) return this.showError('密码至少6位');
    if (password !== password2) return this.showError('两次密码不一致');

    this.setData({ loading: true });
    try {
      await this._apiRegister(nickname, account, password);
      wx.showToast({ title: '注册成功，请登录', icon: 'success' });
      // 注册成功跳转到登录页
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/login/login' });
      }, 1000);
    } catch (err) {
      this.showError(err.message || '注册失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  _apiRegister(nickname, account, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 检查账号是否已存在
        const users = wx.getStorageSync('registeredUsers') || {};
        if (users[account]) {
          reject(new Error('该账号已被注册'));
          return;
        }
        // 保存新用户
        users[account] = { nickname, password, id: Date.now() };
        wx.setStorageSync('registeredUsers', users);
        resolve({
          token: 'mock_token_' + Date.now(),
          user: { id: Date.now(), nickname, avatar: '' }
        });
      }, 800);
    });
  },

  goLogin() {
    wx.navigateBack();
  }
});
