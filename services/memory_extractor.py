"""
共同记忆提取模块
从聊天记录中提取关系时间线、日常仪式、偏好习惯等
"""
import re
from typing import List, Dict, Tuple
from datetime import datetime, timedelta


class MemoryExtractor:
    """记忆提取器"""
    
    # 日常仪式关键词
    RITUAL_KEYWORDS = [
        '早安', '晚安', '早呀', '晚安~', '早上好', 
        '出门了', '下班了', '到家了', '吃饭了吗',
        '在干嘛', '睡了吗', '起来了吗'
    ]
    
    # 偏好习惯关键词
    PREFERENCE_KEYWORDS = {
        'food': ['好吃', '想吃', '饿', '外卖', '做饭', '餐厅', '火锅', '烧烤', '奶茶', '咖啡'],
        'hobby': ['看剧', '综艺', '抖音', '刷手机', '游戏', '逛街', '旅游', '健身'],
        'sleep': ['困', '睡觉', '早起', '熬夜', '失眠'],
        'work': ['上班', '加班', '开会', '下班', '工作'],
        'shopping': ['买', '快递', '好看', '衣服', '包包']
    }
    
    # 情感关键词
    EMOTION_KEYWORDS = {
        'love': ['爱你', '想你', '喜欢', '好喜欢', '超喜欢', '心动了', '想你了'],
        'happy': ['开心', '高兴', '棒', '厉害', '优秀', '嘻嘻', '哈哈'],
        'sad': ['难过', '伤心', '委屈', '不开心', '算了', '心塞'],
        'angry': ['生气', '烦', '讨厌', '哼', '滚', '你烦', '气死了'],
        'shy': ['害羞', '脸红', '不好意思', '哎呀', '羞']
    }
    
    # 时间相关
    TIME_KEYWORDS = ['认识', '在一起', '纪念日', '第一次', '那天', '之前', '后来']
    
    def __init__(self, messages: List[Dict]):
        self.messages = messages
        self.all_content = ' '.join(m['content'] for m in messages)
        self.ai_messages = [m for m in messages if m['role'] == 'ai']
        self.user_messages = [m for m in messages if m['role'] == 'user']
    
    def extract_rituals(self) -> List[str]:
        """提取日常仪式"""
        rituals = set()
        
        for msg in self.messages:
            content = msg['content']
            for keyword in self.RITUAL_KEYWORDS:
                if keyword in content:
                    rituals.add(keyword)
        
        # 补充常见的
        if len(rituals) < 2:
            rituals.add('互道早晚安')
            rituals.add('有事没事聊几句')
        
        return list(rituals)[:5]
    
    def extract_preferences(self) -> Dict[str, List[str]]:
        """提取偏好习惯"""
        preferences = {
            'food': [],
            'hobby': [],
            'sleep': [],
            'work': [],
            'shopping': []
        }
        
        for category, keywords in self.PREFERENCE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in self.all_content:
                    if keyword not in preferences[category]:
                        preferences[category].append(keyword)
        
        return {k: v[:3] for k, v in preferences.items() if v}
    
    def extract_emotional_patterns(self) -> Dict[str, int]:
        """提取情感模式频率"""
        patterns = {}
        
        for category, keywords in self.EMOTION_KEYWORDS.items():
            count = sum(1 for keyword in keywords if keyword in self.all_content)
            patterns[category] = count
        
        return patterns
    
    def extract_dominant_emotion(self) -> str:
        """提取主导情感"""
        patterns = self.extract_emotional_patterns()
        
        max_category = max(patterns.items(), key=lambda x: x[1])
        
        emotion_map = {
            'love': '甜蜜型',
            'happy': '开心型',
            'sad': '敏感型',
            'angry': '小作型',
            'shy': '害羞型'
        }
        
        return emotion_map.get(max_category[0], '综合型')
    
    def extract_commonly_used_words(self, top_n: int = 20) -> List[Tuple[str, int]]:
        """提取高频用词"""
        from collections import Counter
        
        # 分词（简单按字符）
        words = []
        for msg in self.messages:
            content = re.sub(r'[^\u4e00-\u9fa5]', '', msg['content'])
            if len(content) >= 2:
                # 提取2-4字的词组
                for i in range(len(content) - 1):
                    word = content[i:i+2]
                    if word not in ['的', '了', '是', '在', '我', '你', '他', '她', '都', '就', '啊', '呢', '呀', '吗']:
                        words.append(word)
        
        counter = Counter(words)
        return counter.most_common(top_n)
    
    def extract_topics(self) -> List[str]:
        """提取话题"""
        topics = []
        
        topic_keywords = {
            '工作日常': ['上班', '下班', '加班', '开会', '老板', '同事'],
            '生活琐事': ['吃饭', '睡觉', '出门', '回家', '做饭', '外卖'],
            '感情互动': ['想你', '爱你', '喜欢', '想见', '抱抱'],
            '娱乐八卦': ['看剧', '综艺', '抖音', '电影', '游戏'],
            '未来计划': ['周末', '假期', '旅游', '下次', '以后'],
            '日常吐槽': ['累', '烦', '困', '无聊', '热', '冷']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in self.all_content for keyword in keywords):
                topics.append(topic)
        
        return topics[:5]
    
    def extract_call_patterns(self) -> Dict:
        """提取称呼模式"""
        call_patterns = {
            'terms_of_endearment': [],  # 昵称
            'self_references': [],  # 自称
            'question_words': []  # 疑问词使用
        }
        
        # 昵称
        endearments = ['宝贝', '宝宝', '猪猪', '傻瓜', '笨蛋', '亲爱的', '老公', '老婆']
        for word in endearments:
            if word in self.all_content:
                call_patterns['terms_of_endearment'].append(word)
        
        # 自称
        self_refs = ['我', '人家', '人家~', '我啦']
        for ref in self_refs:
            if ref in self.all_content:
                call_patterns['self_references'].append(ref)
        
        return call_patterns
    
    def extract_interaction_metrics(self) -> Dict:
        """提取互动指标"""
        total = len(self.messages)
        ai_count = len(self.ai_messages)
        user_count = len(self.user_messages)
        
        # 计算主动发起对话的比例
        initiations = 0
        for i in range(1, len(self.messages)):
            if self.messages[i]['role'] == 'ai' and self.messages[i-1]['role'] == 'user':
                initiations += 1
        
        return {
            'total_messages': total,
            'ai_message_ratio': ai_count / total if total > 0 else 0.5,
            'initiation_ratio': initiations / ai_count if ai_count > 0 else 0.5,
            'avg_conversation_length': total / 10,  # 估算
        }
    
    def build_memory_summary(self) -> str:
        """构建记忆摘要"""
        rituals = self.extract_rituals()
        preferences = self.extract_preferences()
        emotion = self.extract_dominant_emotion()
        topics = self.extract_topics()
        metrics = self.extract_interaction_metrics()
        
        summary_parts = []
        
        if rituals:
            summary_parts.append(f"日常习惯：{'、'.join(rituals[:3])}")
        
        if emotion:
            summary_parts.append(f"情感基调：{emotion}")
        
        if topics:
            summary_parts.append(f"常见话题：{'、'.join(topics[:3])}")
        
        food_prefs = preferences.get('food', [])
        if food_prefs:
            summary_parts.append(f"饮食偏好：{'、'.join(food_prefs[:2])}")
        
        return '；'.join(summary_parts) if summary_parts else '日常互动'
    
    def get_full_analysis(self) -> Dict:
        """获取完整分析"""
        return {
            'rituals': self.extract_rituals(),
            'preferences': self.extract_preferences(),
            'emotional_pattern': self.extract_emotional_patterns(),
            'dominant_emotion': self.extract_dominant_emotion(),
            'commonly_used_words': self.extract_commonly_used_words(),
            'topics': self.extract_topics(),
            'call_patterns': self.extract_call_patterns(),
            'interaction_metrics': self.extract_interaction_metrics(),
            'summary': self.build_memory_summary()
        }
