Page({
  data: {
    avatarUrl: '',
    name: '',
    gender: '',
    genderText: '',
    personalityTags: [],
    tagInput: '',
    speakingStyle: '',
    styleLength: 0,
    styleFocused: false,
    background: '',
    bgLength: 0,
    bgFocused: false,
    habitPhrases: '',
    habitLength: 0,
    habitFocused: false,
    genders: [
      { value: 'male', text: '男' },
      { value: 'female', text: '女' },
      { value: 'other', text: '其他' },
      { value: 'secret', text: '保密' }
    ]
  },

  onLoad() {
    // 获取已保存的角色信息
    const character = wx.getStorageSync('currentCharacter') || {};
    this.setData({
      avatarUrl: character.avatarUrl || '',
      name: character.name || '',
      gender: character.gender || '',
      genderText: this.getGenderText(character.gender),
      personalityTags: character.personality || [],
      speakingStyle: character.speakingStyle || '',
      styleLength: (character.speakingStyle || '').length,
      background: character.background || '',
      bgLength: (character.background || '').length,
      habitPhrases: character.habitPhrases || '',
      habitLength: (character.habitPhrases || '').length
    });
  },

  getGenderText(gender) {
    const map = {
      'male': '男',
      'female': '女',
      'other': '其他',
      'secret': '保密'
    };
    return map[gender] || '';
  },

  goBack() {
    wx.navigateBack();
  },

  closePage() {
    wx.navigateBack();
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({ avatarUrl: tempFilePath });
      }
    });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  showGenderPicker() {
    const genders = this.data.genders;
    const items = genders.map(g => g.text);
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const selected = genders[res.tapIndex];
        this.setData({
          gender: selected.value,
          genderText: selected.text
        });
      }
    });
  },

  onTagInput(e) {
    this.setData({ tagInput: e.detail.value });
  },

  addTag() {
    const value = this.data.tagInput.trim();
    if (value && !this.data.personalityTags.includes(value)) {
      this.setData({
        personalityTags: [...this.data.personalityTags, value],
        tagInput: ''
      });
    }
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.personalityTags];
    tags.splice(index, 1);
    this.setData({ personalityTags: tags });
  },

  onStyleInput(e) {
    this.setData({
      speakingStyle: e.detail.value,
      styleLength: e.detail.value.length
    });
  },

  onStyleFocus() {
    this.setData({ styleFocused: true });
  },

  onStyleBlur() {
    this.setData({ styleFocused: false });
  },

  onBgInput(e) {
    this.setData({
      background: e.detail.value,
      bgLength: e.detail.value.length
    });
  },

  onBgFocus() {
    this.setData({ bgFocused: true });
  },

  onBgBlur() {
    this.setData({ bgFocused: false });
  },

  onHabitInput(e) {
    this.setData({
      habitPhrases: e.detail.value,
      habitLength: e.detail.value.length
    });
  },

  onHabitFocus() {
    this.setData({ habitFocused: true });
  },

  onHabitBlur() {
    this.setData({ habitFocused: false });
  },

  submitForm() {
    const { name } = this.data;
    
    if (!name) {
      wx.showToast({
        title: '请输入角色姓名',
        icon: 'none'
      });
      return;
    }

    const character = {
      avatarUrl: this.data.avatarUrl,
      name: this.data.name,
      gender: this.data.gender,
      personality: this.data.personalityTags,
      speakingStyle: this.data.speakingStyle,
      background: this.data.background,
      habitPhrases: this.data.habitPhrases
    };

    wx.setStorageSync('currentCharacter', character);
    
    wx.showToast({
      title: '角色创建成功！',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});
