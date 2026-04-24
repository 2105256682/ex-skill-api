# Ex-Skill API 微信小程序前后端开源项目
[![Public](https://img.shields.io/badge/开源-Public-green)]()
[![Vercel](https://img.shields.io/badge/部署-Vercel-blue)]()

完整前后端分离微信小程序实战项目，原生小程序前端 + Python后端API接口，可直接运行、可二次开发、可写进简历！

## 🔍 项目简介
本项目是一套完整可落地的微信小程序开发demo，采用前后端分离架构：
- 前端：原生微信小程序 WXML / WXSS / JavaScript
- 后端：Python Flask 接口服务
- 部署：后端API已上线Vercel云服务器，可在线直接调用

## 📂 项目目录结构
ex-skill-api/
├─ miniprogram/ # 微信小程序前端完整源码
├─ miniprogram-backend/ # Python Flask 后端 API 接口源码
├─ project.config.json # 小程序公共配置（无私有密钥）
└─ README.md # 项目说明文档


## ✨ 项目特点
- 完全开源公开，无私密密钥、无隐藏代码
- 前后端分离，结构清晰易懂，新手可直接学习
- 后端已完成线上部署，开箱即用
- 适合课程设计、毕业设计、简历作品集、学习练手

## 🚀 本地运行教程
### 1. 运行小程序前端
1. 下载本项目代码到本地
2. 打开微信开发者工具
3. 导入项目，选择 `miniprogram` 文件夹即可运行

### 2. 运行Python后端
1. 进入 `miniprogram-backend` 文件夹
2. 安装依赖：`pip install -r requirements.txt`
3. 启动服务：`python main.py`
4. 线上接口地址：https://ex-skill-api.vercel.app

## 🛠️ 技术栈
| 端 | 技术 |
| ---- | ---- |
| 小程序前端 | 原生微信小程序、WXML、WXSS、JS |
| 服务端后端 | Python、Flask框架 |
| 云部署 | Vercel |

## 📌 开源协议
MIT License，可自由学习、修改、商用、二次开发
