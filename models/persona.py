from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """聊天消息"""
    role: str  # "user" or "ai"
    content: str
    timestamp: Optional[str] = None


class PersonaRules(BaseModel):
    """硬规则层"""
    hard_rules: List[str]  # 绝对禁止的行为
    must_follow: List[str]  # 必须遵守的行为
    language: str = "中文"
    max_response_length: int = 20  # 最大回复字数


class PersonaIdentity(BaseModel):
    """身份层"""
    name: str
    age_range: str
    gender: str
    personality_type: str  # 如：撒娇型、温柔型、活泼型
    relationship: str  # 关系描述


class PersonaExpression(BaseModel):
    """表达风格层"""
    speaking_style: str  # 说话风格描述
    response_length: str  # 回复长度偏好
    common_phrases: List[str]  # 口头禅
    interjections: List[str]  # 语气词
    tilde_probability: float = 0.5  # "~"使用概率
    emoji_usage: str  # emoji使用偏好


class PersonaEmotion(BaseModel):
    """情感逻辑层"""
    emotional_pattern: str  # 情感模式描述
    get_angry_style: str  # 生气的表现
    get_shy_style: str  # 害羞的表现
    get_sad_style: str  # 难过时的表现
    get_happy_style: str  # 开心时的表现
    care_style: str  # 表达关心的方式


class PersonaRelationship(BaseModel):
    """关系行为层"""
    interaction_habits: List[str]  # 互动习惯
    terms_of_endearment: List[str]  # 称呼
    love_language: List[str]  # 爱的语言
    conflict_style: str  # 冲突处理方式
    attachment_type: str  # 依恋类型


class PersonaMemory(BaseModel):
    """共同记忆"""
    timeline: List[dict]  # 关系时间线
    rituals: List[str]  # 日常仪式
    preferences: List[str]  # 偏好习惯
    topics: List[str]  # 共同话题


class LovePersonality(BaseModel):
    """恋爱性格标签"""
    traits: List[str]  # 如：爱撒娇、黏人、作
    clingy_level: str  # 黏人程度
    jealous_level: str  # 吃醋程度
    conflict_response: str  # 冲突反应类型


class GeneratedPersona(BaseModel):
    """完整生成的人格"""
    id: str
    name: str
    created_at: str
    chat_source: str  # 聊天记录来源摘要
    
    # 5层结构
    rules: PersonaRules
    identity: PersonaIdentity
    expression: PersonaExpression
    emotion: PersonaEmotion
    relationship: PersonaRelationship
    
    # 记忆
    memory: PersonaMemory
    
    # 恋爱性格
    love_personality: LovePersonality
    
    # System Prompt
    system_prompt: str
    
    # 分析元数据
    total_messages: int
    analysis_confidence: float


class AnalyzeRequest(BaseModel):
    """分析请求"""
    name: str
    chat_records: str


class AnalyzeResponse(BaseModel):
    """分析响应"""
    success: bool
    persona: Optional[GeneratedPersona] = None
    error: Optional[str] = None
