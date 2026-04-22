# AI人格生成后端服务

基于 ex-skill 项目结构的人格外析后端服务。

## 功能

- 聊天记录解析（支持微信格式）
- 5层 Persona 生成（参考 ex-skill）
- 共同记忆提取
- System Prompt 自动生成

## 快速开始

### 1. 安装依赖

```bash
cd miniprogram-backend
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python main.py
```

服务将在 `http://localhost:8000` 启动

### 3. 测试 API

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "name": "小明",
    "chat_records": "你：你好\n我：在干嘛\n你：想你啦\n我：真的吗\n你：真的呀～"
  }'
```

## API 接口

### POST /api/analyze

分析聊天记录，生成AI人格

**请求体：**
```json
{
  "name": "人格名称",
  "chat_records": "聊天记录文本"
}
```

**响应：**
```json
{
  "success": true,
  "persona": {
    "id": "persona_123456",
    "name": "人格名称",
    "identity": {
      "personality_type": "撒娇型",
      "age_range": "22-26岁"
    },
    "expression": {
      "speaking_style": "撒娇型风格，说话软软的",
      "common_phrases": ["那好吧", "嗯嗯", "有一点点"]
    },
    "love_personality": {
      "traits": ["爱撒娇", "黏人"]
    },
    "system_prompt": "生成的System Prompt..."
  }
}
```

## 5层 Persona 结构

参考 ex-skill 项目：

1. **硬规则 (Rules)** - 必须遵守的行为规范
2. **身份 (Identity)** - 名字、年龄、性格类型
3. **表达 (Expression)** - 说话风格、口头禅、语气词
4. **情感 (Emotion)** - 情绪反应模式
5. **关系 (Relationship)** - 互动习惯、爱的语言

## 对接小程序

1. 修改 `miniprogram/utils/config.js`：
```javascript
const API_CONFIG = {
  baseUrl: 'http://你的服务器IP:8000',
  useBackend: true  // 启用后端
};
```

2. 启动后端服务
3. 在小程序中创建人格即可使用

## 项目结构

```
miniprogram-backend/
├── main.py                 # FastAPI 入口
├── requirements.txt        # 依赖
├── models/
│   └── persona.py          # 数据模型
├── services/
│   ├── chat_parser.py      # 聊天记录解析
│   ├── persona_generator.py # 人格生成器
│   └── memory_extractor.py  # 记忆提取
└── README.md
```
