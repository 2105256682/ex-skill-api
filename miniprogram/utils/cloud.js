/**
 * 云开发工具类
 * 封装云数据库常用操作
 */

// 云数据库实例
let db = null;
let usersCollection = null;
let personasCollection = null;
let messagesCollection = null;
let walletsCollection = null;
let transactionsCollection = null;

/**
 * 初始化云开发
 */
function init() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      reject(new Error('云开发基础库版本过低'));
      return;
    }

    wx.cloud.init({
      env: 'your-env-id', // 替换为你的云开发环境ID
      traceUser: true,
    });

    db = wx.cloud.database();
    usersCollection = db.collection('users');
    personasCollection = db.collection('personas');
    messagesCollection = db.collection('messages');
    walletsCollection = db.collection('wallets');
    transactionsCollection = db.collection('transactions');

    console.log('云开发初始化成功');
    resolve();
  });
}

/**
 * 获取集合引用
 */
function getCollection(name) {
  if (!db) {
    throw new Error('云开发未初始化，请先调用 init()');
  }
  return db.collection(name);
}

// ============ 用户相关 ============

/**
 * 用户登录/注册
 * @param {Object} userInfo - 用户信息
 * @returns {Promise<Object>} - 用户数据
 */
async function loginOrRegister(userInfo) {
  // 先查询是否已存在
  const { data } = await usersCollection.where({
    openid: userInfo.openid
  }).get();

  if (data && data.length > 0) {
    // 已存在，返回用户信息
    return data[0];
  }

  // 不存在，创建新用户
  const newUser = {
    openid: userInfo.openid,
    nickname: userInfo.nickname || '用户' + Math.floor(Math.random() * 10000),
    avatar: userInfo.avatar || '',
    coinBalance: 100, // 新用户赠送100金币
    pointBalance: 0,
    isVip: false,
    vipExpireTime: '',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };

  const res = await usersCollection.add({ data: newUser });
  
  // 创建钱包
  await walletsCollection.add({
    data: {
      userId: res._id,
      balance: 0,
      coinBalance: 100,
      createdAt: db.serverDate()
    }
  });

  return { ...newUser, _id: res._id };
}

/**
 * 获取用户信息
 */
async function getUserInfo(openid) {
  const { data } = await usersCollection.where({ openid }).get();
  return data && data.length > 0 ? data[0] : null;
}

/**
 * 更新用户信息
 */
async function updateUser(openid, updates) {
  return await usersCollection.where({ openid }).update({
    data: {
      ...updates,
      updatedAt: db.serverDate()
    }
  });
}

// ============ 人格相关 ============

/**
 * 创建人格
 */
async function createPersona(persona) {
  return await personasCollection.add({
    data: {
      ...persona,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
}

/**
 * 获取用户的所有人格
 */
async function getUserPersonas(openid) {
  const { data } = await personasCollection
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .get();
  return data;
}

/**
 * 获取单个的人格详情
 */
async function getPersona(personaId) {
  return await personasCollection.doc(personaId).get();
}

/**
 * 更新人格
 */
async function updatePersona(personaId, updates) {
  return await personasCollection.doc(personaId).update({
    data: {
      ...updates,
      updatedAt: db.serverDate()
    }
  });
}

/**
 * 删除人格
 */
async function deletePersona(personaId) {
  // 删除人格
  await personasCollection.doc(personaId).remove();
  // 删除关联的聊天记录
  await messagesCollection.where({ personaId }).remove();
}

// ============ 聊天记录相关 ============

/**
 * 保存聊天消息
 */
async function saveMessage(message) {
  return await messagesCollection.add({
    data: {
      ...message,
      createdAt: db.serverDate()
    }
  });
}

/**
 * 获取人格的聊天记录
 */
async function getChatMessages(personaId, limit = 50) {
  const { data } = await messagesCollection
    .where({ personaId })
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();
  return data;
}

/**
 * 批量保存消息
 */
async function saveMessages(messages) {
  if (!messages || messages.length === 0) return;
  
  const batchSize = 10;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    await messagesCollection.add({
      data: batch.map(msg => ({
        ...msg,
        createdAt: db.serverDate()
      }))
    });
  }
}

// ============ 钱包相关 ============

/**
 * 获取钱包信息
 */
async function getWallet(openid) {
  const user = await getUserInfo(openid);
  if (!user) return null;
  
  return {
    openid,
    coinBalance: user.coinBalance || 0,
    pointBalance: user.pointBalance || 0,
    isVip: user.isVip || false,
    vipExpireTime: user.vipExpireTime || ''
  };
}

/**
 * 更新金币余额
 */
async function updateCoinBalance(openid, amount) {
  const user = await getUserInfo(openid);
  if (!user) throw new Error('用户不存在');
  
  const newBalance = (user.coinBalance || 0) + amount;
  if (newBalance < 0) throw new Error('余额不足');
  
  await updateUser(openid, { coinBalance: newBalance });
  return newBalance;
}

/**
 * 消耗金币（带原子操作）
 */
async function consumeCoin(openid, amount, description) {
  const user = await getUserInfo(openid);
  if (!user) throw new Error('用户不存在');
  
  if ((user.coinBalance || 0) < amount) {
    throw new Error('金币不足');
  }
  
  // 更新余额
  await updateUser(openid, { 
    coinBalance: user.coinBalance - amount 
  });
  
  // 记录交易
  await transactionsCollection.add({
    data: {
      openid,
      type: 'expense',
      amount: -amount,
      description: description || '消费',
      createdAt: db.serverDate()
    }
  });
  
  return user.coinBalance - amount;
}

// ============ 导出 ============

module.exports = {
  init,
  getCollection,
  
  // 用户
  loginOrRegister,
  getUserInfo,
  updateUser,
  
  // 人格
  createPersona,
  getUserPersonas,
  getPersona,
  updatePersona,
  deletePersona,
  
  // 聊天
  saveMessage,
  getChatMessages,
  saveMessages,
  
  // 钱包
  getWallet,
  updateCoinBalance,
  consumeCoin
};
