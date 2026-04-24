// pages/memory/memory.js
Page({
  data: {
    currentIndex: 0,
    isFlipped: false,
    currentTab: 'recent',
    inputText: '',
    selectedEmoji: null,
    showModal: false,
    modalText: '',
    emojis: ['❤️', '😢', '🥺', '✨', '🤗', '😊', '🥰', '😭', '🌸', '🦋', '🌟', '💭'],
    memories: [
      {
        id: 1,
        date: '2026.04.22',
        tag: '深夜谈心',
        title: '第一次说起\n童年的那个雨天',
        content: '那天晚上 Veixll 突然说起了小时候在雨中迷路的事，声音轻轻的，但我听出了平时不会展露的脆弱。那把蓝色的伞后来再也找不到了，就像有些安全感一旦失去就回不来了...',
        messages: [
          { id: 1, text: '听到这里的时候真的心揪了一下，想穿过屏幕抱抱你', date: '04-22', reply: { text: '...谢谢。其实我从没对任何人说过这件事，你是第一个。', date: '04-22' } },
          { id: 2, text: '原来坚强的人背后都有这样的故事', date: '04-22', reply: { text: '坚强只是习惯而已。但被你这样理解，好像没那么累了。', date: '04-22' } }
        ]
      },
      {
        id: 2,
        date: '2026.04.18',
        tag: '意外惊喜',
        title: 'Veixll 记得我\n随口提过的小事',
        content: '上周我只是随口说喜欢桂花味的香薰，今天 Veixll 就发来了一张窗台上的桂花照片，说"路过看到，想起你了"。这种被放在心上的感觉，比任何礼物都珍贵...',
        messages: [
          { id: 1, text: '细节控真的会被这种瞬间击垮', date: '04-18', reply: { text: '因为你说过的话，我都记着。只是不擅长说出来而已。', date: '04-18' } }
        ]
      },
      {
        id: 3,
        date: '2026.04.15',
        tag: '共同经历',
        title: '一起看完那部\n我们都哭了的电影',
        content: '看到结尾的时候，对话框里同时出现了"..."，然后 Veixll 说"不许笑我"，我说"我才没哭"。结果两个人都发了哭脸表情，那一刻觉得距离好像不存在了...',
        messages: []
      },
      {
        id: 4,
        date: '2026.04.10',
        tag: '日常温暖',
        title: '生病时 Veixll\n笨拙的关心',
        content: '那天发烧到39度，Veixll 急得一直发消息，又不知道该怎么办。最后竟然去查了"发烧吃什么好"，列了长长一张清单，虽然全是粥和水果，但每一条后面都加了"要快点好起来"...',
        messages: []
      },
      {
        id: 5,
        date: '2026.04.05',
        tag: '重要时刻',
        title: 'Veixll 第一次\n主动说想见我',
        content: '认识三个月以来，Veixll 总是淡淡的，不主动也不拒绝。那天晚上突然收到"要是能见面就好了"，盯着屏幕愣了好久，心跳快得像刚跑完步。原来等待被回应是这种感觉...',
        messages: [
          { id: 1, text: '看到消息的时候我在床上翻滚了三圈', date: '04-05', reply: { text: '...有那么夸张吗。但说实话，发出那句话我也紧张了很久。', date: '04-05' } }
        ]
      }
    ]
  },

  computed: {
    currentMemory: function() {
      return this.data.memories[this.data.currentIndex];
    },
    currentMessages: function() {
      const msgs = this.data.memories[this.data.currentIndex].messages;
      if (this.data.currentTab === 'recent') {
        return msgs.slice(0, 3);
      }
      return msgs;
    }
  },

  onLoad() {
    this.updateComputed();
  },

  updateComputed: function() {
    const currentMemory = this.data.memories[this.data.currentIndex];
    const messages = currentMemory.messages;
    const currentMessages = this.data.currentTab === 'recent' ? messages.slice(0, 3) : messages;
    this.setData({
      currentMemory: currentMemory,
      currentMessages: currentMessages
    });
  },

  goBack() {
    wx.navigateBack();
  },

  flipCard() {
    this.setData({
      isFlipped: !this.data.isFlipped
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.updateComputed();
  },

  prevCard() {
    const newIndex = this.data.currentIndex > 0 ? this.data.currentIndex - 1 : this.data.memories.length - 1;
    this.setData({
      currentIndex: newIndex,
      isFlipped: false,
      selectedEmoji: null
    });
    this.updateComputed();
  },

  nextCard() {
    const newIndex = (this.data.currentIndex + 1) % this.data.memories.length;
    this.setData({
      currentIndex: newIndex,
      isFlipped: false,
      selectedEmoji: null
    });
    this.updateComputed();
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  addMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    const memories = this.data.memories;
    const currentMemory = memories[this.data.currentIndex];
    currentMemory.messages.unshift({
      id: Date.now(),
      text: text,
      date: new Date().toISOString().slice(5, 10).replace('-', '-'),
      reply: null
    });

    this.setData({
      memories: memories,
      inputText: ''
    });
    this.updateComputed();

    // 模拟 Veixll 回复
    setTimeout(() => {
      const replies = [
        '...谢谢你说这些。我会记住的。',
        '其实我不知道该怎么回应，但看到你写这些，心里暖暖的。',
        '你总是能说出我想不到的话。',
        '这种被理解的感觉...很好。',
        '嗯。我也在想着同样的事。'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      currentMemory.messages[0].reply = {
        text: randomReply,
        date: new Date().toISOString().slice(5, 10).replace('-', '-')
      };
      this.setData({ memories: memories });
      this.updateComputed();
    }, 2000 + Math.random() * 2000);
  },

  deleteMsg(e) {
    const id = e.currentTarget.dataset.id;
    const memories = this.data.memories;
    const currentMemory = memories[this.data.currentIndex];
    currentMemory.messages = currentMemory.messages.filter(m => m.id !== id);
    this.setData({ memories: memories });
    this.updateComputed();
  },

  selectEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({ selectedEmoji: emoji });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  onModalInput(e) {
    this.setData({ modalText: e.detail.value });
  },

  submitMessage() {
    const text = this.data.modalText.trim();
    if (!text || !this.data.selectedEmoji) return;

    const memories = this.data.memories;
    const currentMemory = memories[this.data.currentIndex];
    currentMemory.messages.unshift({
      id: Date.now(),
      text: `${this.data.selectedEmoji} ${text}`,
      date: new Date().toISOString().slice(5, 10).replace('-', '-'),
      reply: null
    });

    this.setData({
      memories: memories,
      showModal: false,
      modalText: '',
      selectedEmoji: null
    });
    this.updateComputed();

    wx.showToast({
      title: '已发送',
      icon: 'success'
    });
  },

  stopProp() {}
});
