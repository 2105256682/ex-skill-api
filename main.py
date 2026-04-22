"""
FastAPI 主入口
Render 部署版本
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

from models.persona import AnalyzeRequest, AnalyzeResponse, GeneratedPersona
from services.chat_parser import ChatParser
from services.persona_generator import PersonaGenerator
from services.memory_extractor import MemoryExtractor

app = FastAPI(
    title="AI人格生成服务",
    version="1.0.0",
    description="基于 ex-skill 的人格外析 API"
)

# CORS 配置 - 允许所有来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "AI人格生成服务",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_chat(request: AnalyzeRequest):
    """
    分析聊天记录，生成AI人格
    """
    try:
        # 1. 解析聊天记录
        messages = ChatParser.parse(request.chat_records, format_type='wechat')
        
        if len(messages) < 5:
            return AnalyzeResponse(
                success=False,
                error="聊天记录太少了，至少需要5条消息进行分析"
            )
        
        # 2. 生成人格
        generator = PersonaGenerator(messages)
        persona = generator.generate(
            name=request.name,
            chat_source=f"共{len(messages)}条消息"
        )
        
        persona.created_at = datetime.now().isoformat()
        
        # 3. 提取记忆
        memory_extractor = MemoryExtractor(messages)
        memory_analysis = memory_extractor.get_full_analysis()
        
        persona.memory.rituals = memory_analysis.get('rituals', [])
        persona.memory.topics = memory_analysis.get('topics', [])
        
        return AnalyzeResponse(
            success=True,
            persona=persona
        )
        
    except Exception as e:
        return AnalyzeResponse(
            success=False,
            error=f"分析失败: {str(e)}"
        )


@app.get("/api/persona/{persona_id}")
async def get_persona(persona_id: str):
    raise HTTPException(status_code=404, detail="人格不存在")


@app.get("/api/memories/{persona_id}")
async def get_memories(persona_id: str):
    raise HTTPException(status_code=404, detail="人格不存在")


# Render 需要的入口点
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
