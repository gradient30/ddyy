/**
 * 科大讯飞语音合成 API 代理示例
 * 
 * 说明：
 * 1. 此文件是后端代理示例，需要部署在服务器上
 * 2. 前端不能直接调用科大讯飞API，否则会暴露 API Key
 * 3. 建议使用 Node.js + Express 部署此代理
 * 
 * 安装依赖：
 * npm install express crypto-js axios
 * 
 * 运行：
 * node xunfei-proxy.js
 */

const express = require('express');
const crypto = require('crypto-js');
const axios = require('axios');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

// 配置（实际使用时从环境变量读取）
const XUNFEI_CONFIG = {
  appId: process.env.XUNFEI_APP_ID || 'your-app-id',
  apiKey: process.env.XUNFEI_API_KEY || 'your-api-key',
  apiSecret: process.env.XUNFEI_API_SECRET || 'your-api-secret',
  host: 'tts-api.xfyun.cn',
  uri: '/v2/tts',
};

/**
 * 生成鉴权URL
 */
function generateAuthUrl() {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${XUNFEI_CONFIG.host}\ndate: ${date}\nGET ${XUNFEI_CONFIG.uri} HTTP/1.1`;
  const signatureSha = crypto.HmacSHA256(signatureOrigin, XUNFEI_CONFIG.apiSecret);
  const signature = crypto.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${XUNFEI_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  return `wss://${XUNFEI_CONFIG.host}${XUNFEI_CONFIG.uri}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${XUNFEI_CONFIG.host}`;
}

/**
 * 语音合成 API
 * POST /api/voice/xunfei
 */
app.post('/api/voice/xunfei', async (req, res) => {
  try {
    const { text, voice = 'xiaoyan', speed = 50, pitch = 50, volume = 50 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 构建请求参数
    const params = {
      common: {
        app_id: XUNFEI_CONFIG.appId,
      },
      business: {
        aue: 'lame',        // 音频编码：mp3
        sfl: 1,             // 开启流式返回
        auf: 'audio/L16;rate=16000',
        vcn: voice,         // 发音人
        speed: speed,       // 语速
        pitch: pitch,       // 音调
        volume: volume,     // 音量
        bgs: 0,             // 背景音
        tte: 'UTF8',
      },
      data: {
        status: 2,          // 数据状态：最后一帧
        text: Buffer.from(text).toString('base64'),
      },
    };

    // 使用 WebSocket 连接
    const authUrl = generateAuthUrl();
    const ws = new WebSocket(authUrl);
    
    const audioChunks = [];

    ws.on('open', () => {
      ws.send(JSON.stringify(params));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);
      
      if (response.code !== 0) {
        ws.close();
        return res.status(500).json({ error: response.message });
      }

      // 收集音频数据
      if (response.data && response.data.audio) {
        const audio = Buffer.from(response.data.audio, 'base64');
        audioChunks.push(audio);
      }

      // 接收完成
      if (response.data && response.data.status === 2) {
        ws.close();
        const audioBuffer = Buffer.concat(audioChunks);
        
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      res.status(500).json({ error: 'Voice synthesis failed' });
    });

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 获取可用音色列表
 * GET /api/voice/voices
 */
app.get('/api/voice/voices', (req, res) => {
  const voices = [
    { id: 'xiaoyan', name: '小燕', gender: 'female', language: 'zh', description: '温柔女声' },
    { id: 'xiaoyu', name: '小宇', gender: 'male', language: 'zh', description: '标准男声' },
    { id: 'catherine', name: 'Catherine', gender: 'female', language: 'en', description: '英文女声' },
    { id: 'henry', name: 'Henry', gender: 'male', language: 'en', description: '英文男声' },
    { id: 'vixy', name: '小桃丸', gender: 'female', language: 'zh', description: '东北话' },
    { id: 'xiaoqi', name: '小琪', gender: 'female', language: 'zh', description: '台湾话' },
    { id: 'vils', name: '小蓉', gender: 'female', language: 'zh', description: '四川话' },
  ];
  
  res.json(voices);
});

/**
 * 健康检查
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Voice proxy server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/voice/xunfei`);
});

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
