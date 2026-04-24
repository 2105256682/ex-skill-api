// pages/wallet/wallet.js
Page({
  data: {
    balance: 0,
    balanceStr: '0.00',
    selectedVip: 'monthly',
    currentPrice: 30,
    currentPlanName: '月卡会员',
    selectedPay: 'wechat',
    showRechargeModal: false,
    showSuccessModal: false,
    isPaying: false,
    currentFilter: 'all',
    transactions: [],
    filteredTransactions: []
  },

  onLoad() {
    // 从本地存储读取用户数据
    const userData = wx.getStorageSync('userData') || {};
    this.setData({
      balance: userData.balance || 0,
      balanceStr: (userData.balance || 0).toFixed(2),
      transactions: userData.transactions || [],
      filteredTransactions: userData.transactions || []
    });
  },

  goBack() {
    wx.navigateBack();
  },

  selectVip(e) {
    const plan = e.currentTarget.dataset.plan;
    const plans = {
      weekly: { name: '周卡会员', price: 6 },
      monthly: { name: '月卡会员', price: 30 },
      yearly: { name: '年卡会员', price: 166 }
    };

    this.setData({
      selectedVip: plan,
      currentPrice: plans[plan].price,
      currentPlanName: plans[plan].name
    });
  },

  filterTx(e) {
    const type = e.currentTarget.dataset.type;
    let filtered = this.data.transactions;

    if (type !== 'all') {
      filtered = this.data.transactions.filter(t => t.type === type);
    }

    this.setData({
      currentFilter: type,
      filteredTransactions: filtered
    });
  },

  openRechargeModal() {
    this.setData({
      showRechargeModal: true
    });
  },

  closeRechargeModal() {
    this.setData({
      showRechargeModal: false
    });
  },

  selectPay(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      selectedPay: method
    });
  },

  stopProp() {},

  confirmRecharge() {
    if (this.data.isPaying) return;

    this.setData({ isPaying: true });

    setTimeout(() => {
      const newBalance = this.data.balance + this.data.currentPrice;
      const newTx = {
        id: Date.now(),
        type: 'income',
        title: '充值',
        desc: this.data.currentPlanName,
        amount: this.data.currentPrice,
        date: '刚刚'
      };

      const newTransactions = [newTx, ...this.data.transactions];
      const newFilteredTransactions = this.data.currentFilter === 'all' 
        ? newTransactions 
        : this.data.transactions;

      this.setData({
        balance: newBalance,
        balanceStr: newBalance.toFixed(2),
        transactions: newTransactions,
        filteredTransactions: newFilteredTransactions,
        showRechargeModal: false,
        showSuccessModal: true,
        isPaying: false
      });

      // 保存到本地存储
      const userData = wx.getStorageSync('userData') || {};
      userData.balance = newBalance;
      userData.transactions = newTransactions;
      wx.setStorageSync('userData', userData);
    }, 1500);
  },

  closeSuccessModal() {
    this.setData({
      showSuccessModal: false
    });
  }
});