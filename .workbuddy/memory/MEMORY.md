# 长期记忆

## 项目信息
- 微信小程序路径：`d:\新建文件夹 (2)\miniprogram`
- 产品定位：**多用户AI人格平台**（类似ex-skill）
- 核心功能：用户上传聊天记录 → AI分析生成人格 → 和人格聊天

## 页面结构
- tabBar（4项）：首页 → 广场 → 消息 → 我
- 消息页面(main)：人格列表页
- 聊天页面(chat)：对话详情页（加载人格配置）
- 创建页面(create)：上传聊天记录、填写人格名称
- 分析页面(analyze)：进度展示、结果预览

## 用户偏好
- 页面过渡：下滑叠化，自然流畅
- 背景：白色（#ffffff / #faf9f8）
- UI 风格参考：loveo.love，精致细腻
- 沟通风格：直接简练，不需要寒暄

## 技术栈
- 前端：微信小程序原生（WXML/WXSS/JS）
- AI 集成：智谱 GLM-4（免费模型）
- 数据存储：**云开发（改造中）**
- 云函数：`cloudfunctions/login`

## 云开发改造（2026-04-22）
### 已创建文件
- `utils/cloud.js` - 云数据库工具类
- `cloudfunctions/login/` - 登录云函数

### 已改造页面
- `app.js` - 云开发初始化
- `pages/login/login.js/wxml/wxss` - 微信一键登录
- `pages/main/main.js` - 人格列表云端化
- `pages/create/create.js` - 创建人格云端化
- `pages/analyze/analyze.js` - 保存人格云端化
- `pages/chat/chat.js` - 聊天记录云端化

### 云数据库集合
- `users` - 用户信息
- `personas` - 人格列表
- `messages` - 聊天记录
- `wallets` - 钱包
- `transactions` - 交易记录

## AI Skill 系统
- 路径：`d:\新建文件夹 (2)\miniprogram\utils\skills.js`
- 智谱 API：https://open.bigmodel.cn/api/paas/v4/chat/completions
- API Key：64b58bd82ae5486ab34361c0f09438ae.uJiAU1MUyfSN49Pt
- 支持技能：天气查询、股票行情、计算器

## 人格生成流程
1. 用户填写AI名字
2. 导入聊天记录（粘贴/文件）
3. AI分析聊天记录（mock生成自然人格）
4. 生成人格配置（System Prompt）
5. 保存到云数据库（personas集合）
6. 和人格聊天（聊天记录保存到messages集合）

## 已完成功能
- 人格创建（create页面）
- 人格分析进度（analyze页面）
- 聊天界面（chat页面，微信风格）
- 聊天记录保存（云端化）
- 人格删除（main页面）
- 微信一键登录

## 待完成
- 在微信开发者工具中开通云开发
- 部署 login 云函数
- 创建数据库集合（users, personas, messages等）
- 改造钱包/VIP页面云端化
- 微信支付接入
