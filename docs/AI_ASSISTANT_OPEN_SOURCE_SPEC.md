# FanStudio AI 助手开源技术规格（V1）

## 1. 目标与范围

### 1.1 目标
- 为前台提供一个可复用的 AI 助手（文字 + 语音可扩展）。
- 助手基于站点已发布内容回答，支持图片与来源引用。
- 项目开源后，站长可自行配置大模型供应商与模型参数。

### 1.2 非目标（V1 不做）
- 不做后台人工标注工作台。
- 不做复杂多代理（multi-agent）流程。
- 不做私有内容授权分层（仅公开站点内容）。

## 2. 产品原则
- 只基于证据回答：先检索，后生成。
- 无证据不强答：明确告知“暂无足够依据”。
- 输出结构化：回答、引用、图片分离返回。
- 可替换供应商：模型层通过 Provider 抽象，避免写死。

## 3. 系统架构

### 3.1 架构分层
1. 前台交互层：聊天窗口、消息渲染、语音交互入口。
2. 对话服务层：`/api/ai/chat`，负责编排检索与生成。
3. 知识层（RAG）：内容入库、切块、向量检索、重排。
4. 模型适配层：LLM/Embedding/ASR/TTS Provider。

### 3.2 现有内容源映射（来自当前项目）
- `Post`（仅 `PUBLISHED`）
- `Work`（仅 `PUBLISHED`，排除私密交付字段）
- `VideoTutorial`（建议补 `status` 后仅公开状态入库）
- `Settings`（about/nav/pageCopy/socialLinks 等公开文案）
- `Media` 与内容中的图片 URL（封面、详情图、缩略图、正文图）

## 4. 数据模型（建议新增）

### 4.1 `KnowledgeSource`
- `id`
- `sourceType`：`POST | WORK | TUTORIAL | SETTINGS`
- `sourceId`
- `slug`
- `title`
- `url`
- `status`：`ACTIVE | DELETED`
- `updatedAt`
- `hash`（用于判定是否需要重建）

### 4.2 `KnowledgeChunk`
- `id`
- `sourceId`（关联 KnowledgeSource）
- `chunkIndex`
- `contentText`
- `contentTokens`
- `embedding`（向量，或外置向量库 ID）
- `meta`（分类、标签、发布时间、权重）

### 4.3 `KnowledgeAsset`
- `id`
- `sourceId`
- `assetType`：`IMAGE`
- `url`
- `caption`
- `ocrText`
- `embedding`（图/文向量）
- `width`
- `height`
- `hash`

### 4.4 `KnowledgeSyncJob`
- `id`
- `jobType`：`UPSERT_SOURCE | DELETE_SOURCE | FULL_REBUILD`
- `payload`
- `status`：`PENDING | RUNNING | SUCCESS | FAILED`
- `error`
- `createdAt`
- `updatedAt`

## 5. 入库（Ingest）设计

### 5.1 触发策略
- 在内容变更 API 成功后入队：
  - `/api/posts`、`/api/posts/[id]`、`/api/posts/batch`
  - `/api/works`、`/api/works/[id]`、`/api/works/batch`
  - `/api/tutorials`、`/api/tutorials/[id]`、`/api/settings`
- 每日一次 `FULL_REBUILD` 兜底，避免漏同步。

### 5.2 处理流程
1. 读取源数据（仅公开字段）。
2. 提取文本（含 BlockNote/Tiptap 纯文本）。
3. 提取图片资产（封面、正文图、详情图、缩略图）。
4. 文本切块（建议 400-800 tokens + overlap）。
5. 生成 embedding。
6. 写入 chunk / asset，更新 source hash。

### 5.3 删除策略
- 内容删除或下线时，将 `KnowledgeSource.status = DELETED`，并移除相关 chunk/asset。

## 6. 检索与回答

### 6.1 查询流水线
1. Query 预处理：语言、意图、是否需要图像。
2. 混合召回：关键词检索 + 向量检索。
3. 图文关联：召回 chunk 后补拉同源图片资产。
4. 重排：按相关度、时效、内容类型加权。
5. 组装上下文，调用 LLM 生成答案。

### 6.2 回答约束
- 只允许引用提供的上下文事实。
- 证据不足时输出拒答模板。
- 输出要短句、可扫描，避免大段营销语。

## 7. API 协议

### 7.1 `POST /api/ai/chat`
请求：
```json
{
  "sessionId": "optional-session-id",
  "message": "你擅长做什么？",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "options": {
    "locale": "zh-CN",
    "includeImages": true
  }
}
```

响应：
```json
{
  "sessionId": "session-id",
  "answer": "主回答（支持 markdown）",
  "citations": [
    {
      "title": "来源标题",
      "url": "/works/design/xxx",
      "snippet": "证据片段",
      "sourceType": "WORK"
    }
  ],
  "images": [
    {
      "url": "/uploads/WORK_DESIGN/xxx/cover.webp",
      "caption": "图片说明",
      "sourceUrl": "/works/design/xxx"
    }
  ],
  "relatedQuestions": ["你通常如何合作？", "有哪些代表项目？"],
  "confidence": 0.82
}
```

## 8. Provider 抽象（开源可配置）

### 8.1 接口建议
```ts
interface AIProvider {
  chat(input: ChatInput): Promise<ChatOutput>
  embed(input: EmbedInput): Promise<EmbedOutput>
  transcribe?(input: TranscribeInput): Promise<TranscribeOutput>
  speak?(input: SpeakInput): Promise<SpeakOutput>
}
```

### 8.2 环境变量
- `AI_ENABLED=true`
- `AI_PROVIDER=openai`（可扩展）
- `AI_BASE_URL=...`（兼容自部署网关）
- `AI_API_KEY=...`
- `AI_CHAT_MODEL=...`
- `AI_EMBEDDING_MODEL=...`
- `AI_ENABLE_VOICE=false`
- `AI_MAX_CITATIONS=3`
- `AI_MAX_IMAGES=3`

### 8.3 运行时策略
- 未配置 key：前台显示“助手未启用”提示，不报错。
- Provider 失败：返回可恢复错误（不影响页面主流程）。

## 9. 安全与合规
- 仅索引前台公开内容，不入库草稿与私密字段。
- `Work.deliveryUrl/fileUrl` 等私密交付信息默认排除。
- 记录问答日志时脱敏（邮箱、电话、URL query）。
- 设置简单限流：IP + session 双限流。

## 10. 可观测性
- 指标：
  - 首字延迟（TTFT）
  - 回答耗时
  - 检索命中率
  - 拒答率
  - 引用覆盖率（带 citations 的回答占比）
- 日志分层：
  - `chat_request`
  - `retrieval_result`
  - `provider_error`

## 11. 里程碑
1. M1（1-2 周）：文本问答 + 引用 + 基础埋点。
2. M2（1 周）：图片资产入库 + 图文回答。
3. M3（1 周）：语音输入/播报。
4. M4（持续）：后台可视化优化与社区文档。

## 12. 开源发布要求
- README 新增「AI 助手快速开始」章节。
- 提供 `.env.example` 的 AI 配置项。
- 提供迁移脚本（新增知识库表）。
- 提供故障排查文档（常见错误与自检命令）。

