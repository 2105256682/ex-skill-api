"""
聊天记录解析模块
支持多种格式的聊天记录解析
"""
import re
from typing import List, Dict, Tuple
from datetime import datetime


class ChatParser:
    """聊天记录解析器"""
    
    @staticmethod
    def parse_wechat(text: str) -> List[Dict]:
        """
        解析微信聊天记录格式
        格式1: 2024/1/1 12:00:00 你好
        格式2: 对方(微信号): 你好
        格式3: 你好  # 用户发送
        """
        messages = []
        lines = text.strip().split('\n')
        
        current_speaker = None
        current_time = None
        
        for line in lines:
            line = line.strip()
            if not line or 'img src=' in line or '[图片]' in line or '[表情]' in line:
                continue
            
            # 尝试匹配时间戳格式
            time_match = re.match(r'(\d{4}[/\-]\d{1,2}[/\-]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)', line)
            if time_match:
                current_time = time_match.group(1)
                line = line[len(time_match.group(0)):].strip()
            
            # 匹配发送者
            if line.startswith('你：') or line.startswith('你:'):
                current_speaker = 'user'
                content = line[2:].strip() if line.startswith('你：') else line[2:].strip()
            elif line.startswith('我：') or line.startswith('我:'):
                current_speaker = 'ai'
                content = line[2:].strip() if line.startswith('我：') else line[2:].strip()
            elif ':' in line[:20]:
                # 可能是 名字: 格式
                parts = line.split(':', 1)
                if len(parts[0]) < 10:
                    current_speaker = 'unknown'
                    content = parts[1].strip()
                else:
                    content = line
            else:
                content = line
            
            if content and current_speaker:
                messages.append({
                    'role': current_speaker,
                    'content': content,
                    'timestamp': current_time
                })
        
        return messages
    
    @staticmethod
    def parse_imessage(text: str) -> List[Dict]:
        """解析 iMessage 导出格式"""
        messages = []
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # iMessage 格式: [时间] 发送者: 内容
            match = re.match(r'\[([^\]]+)\]\s*([^\:]+):\s*(.+)', line)
            if match:
                timestamp, sender, content = match.groups()
                role = 'user' if 'me' in sender.lower() else 'ai'
                messages.append({
                    'role': role,
                    'content': content.strip(),
                    'timestamp': timestamp
                })
        
        return messages
    
    @staticmethod
    def parse_generic(text: str) -> List[Dict]:
        """
        通用格式解析
        尝试自动识别格式
        """
        # 如果有明确的分隔符，使用通用解析
        messages = []
        lines = text.strip().split('\n')
        
        # 统计各行特征
        user_indicators = ['我：', '我:', 'My:', 'Me:']
        ai_indicators = ['你：', '你:', '对方:', 'Her:', 'She:']
        
        current_role = None
        
        for line in lines:
            line = line.strip()
            if not line or 'img' in line.lower():
                continue
            
            # 检测发送者
            found = False
            for indicator in user_indicators:
                if line.startswith(indicator):
                    current_role = 'user'
                    content = line[len(indicator):].strip()
                    if content:
                        messages.append({'role': current_role, 'content': content})
                    found = True
                    break
            
            if not found:
                for indicator in ai_indicators:
                    if line.startswith(indicator):
                        current_role = 'ai'
                        content = line[len(indicator):].strip()
                        if content:
                            messages.append({'role': current_role, 'content': content})
                        found = True
                        break
            
            if not found and current_role:
                # 可能是没有前缀的连续消息
                messages.append({'role': current_role, 'content': line})
        
        return messages
    
    @classmethod
    def parse(cls, text: str, format_type: str = 'auto') -> List[Dict]:
        """统一解析入口"""
        if format_type == 'wechat':
            return cls.parse_wechat(text)
        elif format_type == 'imessage':
            return cls.parse_imessage(text)
        else:
            # 尝试自动识别
            if '微信' in text[:100] or '你：' in text or '我：' in text:
                return cls.parse_wechat(text)
            return cls.parse_generic(text)
    
    @staticmethod
    def extract_conversation_pairs(messages: List[Dict]) -> List[Dict]:
        """
        提取对话对
        AI回复 -> 用户下一句
        """
        pairs = []
        for i in range(len(messages) - 1):
            current = messages[i]
            next_msg = messages[i + 1]
            
            if current['role'] == 'ai' and next_msg['role'] == 'user':
                pairs.append({
                    'ai_message': current['content'],
                    'user_message': next_msg['content']
                })
        
        return pairs
    
    @staticmethod
    def get_statistics(messages: List[Dict]) -> Dict:
        """获取聊天统计"""
        user_msgs = [m for m in messages if m['role'] == 'user']
        ai_msgs = [m for m in messages if m['role'] == 'ai']
        
        user_lengths = [len(m['content']) for m in user_msgs]
        ai_lengths = [len(m['content']) for m in ai_msgs]
        
        return {
            'total': len(messages),
            'user_count': len(user_msgs),
            'ai_count': len(ai_msgs),
            'user_avg_length': sum(user_lengths) / len(user_lengths) if user_lengths else 0,
            'ai_avg_length': sum(ai_lengths) / len(ai_lengths) if ai_lengths else 0,
        }
