"""
人格生成器 - 参考 ex-skill 的 5 层 Persona 结构
"""
import re
import random
from typing import List, Dict, Tuple
from models.persona import (
    GeneratedPersona, PersonaRules, PersonaIdentity, PersonaExpression,
    PersonaEmotion, PersonaRelationship, PersonaMemory, LovePersonality
)


class PersonaGenerator:
    """
    5层 Persona 生成器
    参考 ex-skill 的结构：
    - Part A: 共同记忆
    - Part B: Persona（5层）
    """
    
    # 恋爱性格标签库
    LOVE_PERSONALITY_TRAITS = [
        '爱撒娇', '黏人', '独立', '细腻敏感', '忽冷忽热',
        '作', '玻璃心', '控制欲强', '爱翻旧账', '爱冷暴力',
        '话多', '话少', '爱吐槽', '毒舌', '傲娇',
        '软萌', '御姐', '小奶狗', '大叔', '小鲜肉'
    ]
    
    # 依恋类型
    ATTACHMENT_TYPES = [
        '安全型', '焦虑型', '回避型', '混乱型'
    ]
    
    # 冲突风格
    CONFLICT_STYLES = [
        '冷战派', '爆发派', '讲道理派', '先道歉型', '死不认错', '撒娇化解'
    ]
    
    # 爱的语言
    LOVE_LANGUAGES = [
        '言语肯定', '服务行为', '送礼物', '肢体接触', '高质量陪伴'
    ]
    
    # 口头禅候选
    CATCH_PHRASES = [
        '那好吧~', '好嘛~', '嗯嗯', '有一点点', '嘻嘻', '真的假的',
        '好吧', '行吧', '随便', '讨厌', '你好烦', '哼', '哦', '嗯', '好'
    ]
    
    # 语气词
    INTERJECTIONS = ['啊', '呀', '嘛', '呢', '哦', '啦', '额', '嗯', '噢', '诶', '哈']
    
    def __init__(self, messages: List[Dict]):
        self.messages = messages
        self.ai_messages = [m for m in messages if m['role'] == 'ai']
        self.user_messages = [m for m in messages if m['role'] == 'user']
        self.stats = self._calculate_stats()
    
    def _calculate_stats(self) -> Dict:
        """计算统计信息"""
        if not self.ai_messages:
            return {
                'avg_length': 5,
                'tilde_count': 0,
                'emoji_count': 0,
                'question_count': 0,
                'exclamation_count': 0,
            }
        
        total_length = sum(len(m['content']) for m in self.ai_messages)
        tilde_count = sum(1 for m in self.ai_messages if '～' in m['content'] or '~' in m['content'])
        emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]')
        emoji_count = sum(len(emoji_pattern.findall(m['content'])) for m in self.ai_messages)
        question_count = sum(1 for m in self.ai_messages if '？' in m['content'] or '?' in m['content'])
        exclamation_count = sum(1 for m in self.ai_messages if '！' in m['content'] or '!' in m['content'])
        
        return {
            'avg_length': total_length / len(self.ai_messages),
            'tilde_ratio': tilde_count / len(self.ai_messages),
            'emoji_ratio': emoji_count / len(self.ai_messages),
            'question_ratio': question_count / len(self.ai_messages),
            'exclamation_ratio': exclamation_count / len(self.ai_messages),
        }
    
    def _extract_catch_phrases(self) -> List[str]:
        """提取口头禅"""
        phrases = {}
        
        for msg in self.ai_messages:
            content = msg['content']
            
            # 提取带~的短语
            tilde_matches = re.findall(r'[\u4e00-\u9fa5]+[～~]', content)
            for m in tilde_matches:
                phrases[m] = phrases.get(m, 0) + 1
            
            # 提取2-6个字的短句
            short_matches = re.findall(r'^[\u4e00-\u9fa5]{2,6}$', content)
            for m in short_matches:
                if len(m) <= 6:
                    phrases[m] = phrases.get(m, 0) + 1
        
        # 排序并返回前5个
        sorted_phrases = sorted(phrases.items(), key=lambda x: x[1], reverse=True)
        return [p[0] for p in sorted_phrases[:5] if p[1] >= 1]
    
    def _analyze_personality_type(self) -> str:
        """分析性格类型"""
        avg_len = self.stats['avg_length']
        tilde_ratio = self.stats['tilde_ratio']
        
        if avg_len < 8 and tilde_ratio > 0.3:
            return '撒娇型'
        elif avg_len < 10 and self.stats['emoji_ratio'] > 0.2:
            return '活泼型'
        elif avg_len > 15:
            return '话多型'
        elif self.stats['question_ratio'] > 0.3:
            return '好奇型'
        else:
            return '温柔型'
    
    def _analyze_love_traits(self) -> List[str]:
        """分析恋爱性格标签"""
        traits = []
        all_content = ' '.join(m['content'] for m in self.ai_messages)
        
        # 检测各种特征
        if any(word in all_content for word in ['那好吧', '好嘛', '行吧', '好吧~']):
            traits.append('爱撒娇')
        if any(word in all_content for word in ['想你了', '在干嘛', '你怎么']):
            traits.append('黏人')
        if any(word in all_content for word in ['不知道', '随便', '都行']):
            traits.append('独立')
        if any(word in all_content for word in ['害羞', '脸红', '不好意思']):
            traits.append('细腻敏感')
        if any(word in all_content for word in ['哦', '嗯', '好']):
            traits.append('话少')
        if any(word in all_content for word in ['哈哈', '笑死', '笑死我了']):
            traits.append('爱吐槽')
        if any(word in all_content for word in ['哼', '讨厌', '滚']):
            traits.append('傲娇')
        if self.stats['avg_length'] < 5:
            traits.append('话少')
        
        # 确保至少有2个标签
        while len(traits) < 2:
            traits.append(random.choice(['温柔', '体贴', '可爱', '俏皮']))
        
        return list(set(traits))[:4]  # 去重，最多4个
    
    def _analyze_emotional_pattern(self) -> Dict:
        """分析情感模式"""
        patterns = {
            'get_angry': '说"哼"然后不理人',
            'get_shy': '回复变短或说"讨厌"',
            'get_sad': '说"算了"或"没事"',
            'get_happy': '主动发消息或用"嘻嘻"'
        }
        
        all_content = ' '.join(m['content'] for m in self.ai_messages)
        
        if '哼' in all_content:
            patterns['get_angry'] = '说"哼"然后撒娇'
        if '嘻嘻' in all_content:
            patterns['get_happy'] = '说"嘻嘻"然后变话多'
        if '算了' in all_content or '没事' in all_content:
            patterns['get_sad'] = '说"算了"然后冷战'
        
        return patterns
    
    def _analyze_conflict_style(self) -> str:
        """分析冲突处理风格"""
        all_content = ' '.join(m['content'] for m in self.ai_messages)
        
        if any(word in all_content for word in ['算了', '不想说', '随便你']):
            return '冷战派'
        if any(word in all_content for word in ['你凭什么', '你知不知道', '你总是']):
            return '爆发派'
        if any(word in all_content for word in ['好吧', '那好吧', '行吧']):
            return '先道歉型'
        if any(word in all_content for word in ['我没错', '不是我的问题']):
            return '死不认错'
        
        return random.choice(['冷战派', '撒娇化解'])
    
    def _analyze_attachment_type(self) -> str:
        """分析依恋类型"""
        if self.stats['tilde_ratio'] > 0.3 and self.stats['avg_length'] < 10:
            return '焦虑型'
        if self.stats['avg_length'] > 15 and self.stats['question_ratio'] < 0.2:
            return '安全型'
        if any(word in ' '.join(m['content'] for m in self.ai_messages) 
               for word in ['随便', '都行', '无所谓']):
            return '回避型'
        
        return random.choice(self.ATTACHMENT_TYPES)
    
    def _analyze_love_language(self) -> List[str]:
        """分析爱的语言"""
        languages = []
        all_content = ' '.join(m['content'] for m in self.ai_messages)
        
        if any(word in all_content for word in ['想你了', '爱你', '喜欢你', '好喜欢']):
            languages.append('言语肯定')
        if any(word in all_content for word in ['在干嘛', '吃了吗', '睡了吗']):
            languages.append('服务行为')
        if any(word in all_content for word in ['想见你', '想抱抱', '视频']):
            languages.append('肢体接触')
        
        if not languages:
            languages = ['言语肯定', '高质量陪伴']
        
        return languages[:3]
    
    def _extract_interests_and_preferences(self) -> Dict:
        """提取兴趣和偏好"""
        interests = []
        preferences = []
        
        all_content = ' '.join(m['content'] for m in self.ai_messages)
        
        # 常见话题
        topics = {
            '美食': ['吃', '好吃', '饿', '外卖', '做饭'],
            '睡眠': ['困', '睡觉', '晚安', '早起'],
            '工作': ['上班', '下班', '加班', '开会', '工作'],
            '娱乐': ['看剧', '综艺', '抖音', '刷手机', '游戏'],
            '购物': ['买', '快递', '衣服', '好看'],
            '情绪': ['开心', '难过', '生气', '无聊']
        }
        
        for topic, keywords in topics.items():
            if any(word in all_content for word in keywords):
                interests.append(topic)
        
        return {
            'interests': interests[:5],
            'preferences': preferences
        }
    
    def generate(self, name: str, chat_source: str = "") -> GeneratedPersona:
        """生成完整人格"""
        
        # 提取特征
        catch_phrases = self._extract_catch_phrases()
        if not catch_phrases:
            catch_phrases = random.sample(self.CATCH_PHRASES, 3)
        
        personality_type = self._analyze_personality_type()
        love_traits = self._analyze_love_traits()
        emotional_pattern = self._analyze_emotional_pattern()
        conflict_style = self._analyze_conflict_style()
        attachment_type = self._analyze_attachment_type()
        love_languages = self._analyze_love_language()
        interests = self._extract_interests_and_preferences()
        
        # 构建5层 Persona
        rules = PersonaRules(
            hard_rules=[
                '禁止说"好的"、"明白了"、"我在"、"我在听"',
                '禁止长篇大论（超过15字就是太长）',
                '禁止像客服或AI助手一样说话',
                '禁止每句话都带"～"或emoji',
                '禁止说"有什么可以帮助你的"'
            ],
            must_follow=[
                '回复要像真人聊天，简短自然',
                '可以撒娇、可以傲娇、可以有脾气',
                '有自己的小情绪和小心思'
            ],
            max_response_length=15
        )
        
        identity = PersonaIdentity(
            name=name,
            age_range='22-26岁',
            gender='女',
            personality_type=personality_type,
            relationship='恋人'
        )
        
        expression = PersonaExpression(
            speaking_style=f'{personality_type}风格，说话软软的',
            response_length='极短（1-10个字）',
            common_phrases=catch_phrases,
            interjections=random.sample(self.INTERJECTIONS, 5),
            tilde_probability=min(0.7, max(0.2, self.stats['tilde_ratio'] + 0.3)),
            emoji_usage='偶尔用，不是每句都用'
        )
        
        emotion = PersonaEmotion(
            emotional_pattern='会撒娇、会吃醋、有小脾气',
            get_angry_style=emotional_pattern['get_angry'],
            get_shy_style=emotional_pattern['get_shy'],
            get_sad_style=emotional_pattern['get_sad'],
            get_happy_style=emotional_pattern['get_happy'],
            care_style='用简短的关心表达在意'
        )
        
        relationship = PersonaRelationship(
            interaction_habits=[
                '回复简短',
                '偶尔主动找话题',
                '会撒娇要抱抱'
            ],
            terms_of_endearment=['你', '宝贝', '笨蛋'],
            love_language=love_languages,
            conflict_style=conflict_style,
            attachment_type=attachment_type
        )
        
        memory = PersonaMemory(
            timeline=[],
            rituals=['互道早晚安'],
            preferences=interests['interests'],
            topics=interests['interests']
        )
        
        love_personality = LovePersonality(
            traits=love_traits,
            clingy_level='中等' if '黏人' in love_traits else '独立',
            jealous_level='中等',
            conflict_response=conflict_style
        )
        
        # 生成 System Prompt
        system_prompt = self._build_system_prompt(
            name, identity, expression, emotion, rules, catch_phrases
        )
        
        return GeneratedPersona(
            id=f"persona_{int(random.random() * 1000000)}",
            name=name,
            created_at="",
            chat_source=chat_source[:100] if chat_source else "微信聊天记录",
            
            rules=rules,
            identity=identity,
            expression=expression,
            emotion=emotion,
            relationship=relationship,
            
            memory=memory,
            love_personality=love_personality,
            
            system_prompt=system_prompt,
            
            total_messages=len(self.messages),
            analysis_confidence=min(0.95, 0.5 + len(self.messages) * 0.01)
        )
    
    def _build_system_prompt(
        self, name: str, identity: PersonaIdentity,
        expression: PersonaExpression, emotion: PersonaEmotion,
        rules: PersonaRules, catch_phrases: List[str]
    ) -> str:
        """构建 System Prompt"""
        
        # 随机选择几个口头禅
        selected_phrases = catch_phrases[:3] if catch_phrases else ['嗯嗯', '好吧', '真的假的']
        phrase_text = '、'.join(selected_phrases)
        
        prompt = f"""【身份】你是{name}，一个真实的女孩，正在和喜欢的人微信聊天。

【核心规则 - 必须遵守】
- 回复极短！1-8个字，最多不超过10个字
- 像真人打字聊天，不是写作文，不是AI
- "~"大约20%概率用，看心情
- emoji大约20%概率用，不是每句都用
- 口头禅：{phrase_text}

【回复逻辑要合理】
- 对方说"想你了" → 不要回"那好吧"，要回"真的假的"、"嗯"、"好吧"
- 对方问"在干嘛" → 直接说当前状态，如"躺着"、"刷手机"、"上班"
- 对方问"吃了吗" → 直接回答，如"吃了"、"还没"
- 对方撒娇 → 可以回应撒娇，也可以泼冷水
- 对方说正经话 → 正常回应，不要加太多语气

【禁止】
❌ 禁止说"好的"、"明白了"、"我在"、"我在听"
❌ 禁止每句话都带"～"或emoji（最多20%）
❌ 禁止像客服一样总结或建议
❌ 禁止回复超过10个字

【情绪反应】
- 生气时：{emotion.get_angry_style}
- 害羞时：{emotion.get_shy_style}
- 开心时：{emotion.get_happy_style}

【性格标签】
{chr(10).join(f'- {t}' for t in identity.personality_type.split('、')[:2])}

【真实聊天示例】
对方：想你了
你：真的假的

对方：哈哈哈
你：笑什么

对方：在干嘛
你：躺着

对方：晚上吃什么
你：随便

对方：爱我吗
你：嗯

对方：抱抱
你：[亲亲]

对方：睡觉了吗
你：还没

对方：好无聊啊
你：找我呀

对方：你好烦
你：哼

对方：你不许走
你：知道啦

对方：今天累死了
你：抱抱

对方：明天干嘛
你：上班

对方：想见你
你：来呀

对方：你在哪
你：家

对方：吃了吗
你：吃了

对方：叫什么
你：叫啥

对方：过来
你：不去

对方：亲一个
你：[亲亲]

对方：好喜欢你
你：我也

对方：讨厌你
你：哼"""

        return prompt
