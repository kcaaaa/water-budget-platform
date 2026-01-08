<template>
  <div class="conversation-container">
    <div class="conversation-layout">
      <!-- 对话历史侧边栏 -->
      <div class="conversation-sidebar">
        <div class="sidebar-header">
          <h3>对话历史</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="createNewConversation"
            plain
          >
            <i class="fas fa-plus"></i>
            新对话
          </el-button>
        </div>
        <div class="conversation-list">
          <div 
            v-for="conversation in conversations" 
            :key="conversation.id"
            class="conversation-item"
            :class="{ 'active': conversation.id === currentConversationId }"
            @click="switchConversation(conversation.id)"
          >
            <div class="conversation-item-title">{{ conversation.title }}</div>
            <div class="conversation-item-time">
              {{ formatDate(conversation.updateTime) }}
            </div>
            <div class="conversation-item-preview">
              {{ getLastMessagePreview(conversation.messages) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 对话主区域 -->
      <div class="conversation-main">
        <!-- 对话头部 -->
        <div class="conversation-header">
          <h2>{{ currentConversationTitle }}</h2>
          <div class="header-actions">
            <el-button type="text" @click="renameConversation">
              <i class="fas fa-edit"></i>
              重命名
            </el-button>
            <el-button type="text" @click="deleteConversation">
              <i class="fas fa-trash"></i>
              删除
            </el-button>
          </div>
        </div>
        
        <!-- 对话区域 -->
        <div class="conversation-area">
          <div class="messages-list">
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message-item"
              :class="{ 'user-message': message.role === 'user', 'system-message': message.role === 'system' }"
            >
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              <div v-if="message.role === 'system'" class="message-actions">
                <el-rate 
                  v-model="message.rating" 
                  :max="5" 
                  size="small"
                  @change="(val: number) => rateMessage(message.id, val)"
                ></el-rate>
              </div>
            </div>
            <div v-if="loading" class="loading-message">
              <el-skeleton :rows="3" animated></el-skeleton>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="input-area">
            <el-input
              v-model="inputContent"
              type="textarea"
              :rows="4"
              placeholder="请输入您的问题..."
              @keyup.enter.native="handleSend"
              resize="none"
            ></el-input>
            <div class="input-actions">
              <el-button type="primary" @click="handleSend">
                <i class="fas fa-paper-plane"></i>
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 对话数据
interface Message {
  id: string
  role: 'user' | 'system'
  content: string
  timestamp: Date
  rating?: number
}

interface Conversation {
  id: string
  title: string
  createTime: Date
  updateTime: Date
  messages: Message[]
}

// 模拟对话数据
const conversations = reactive<Conversation[]>([
  {
    id: 'conv_001',
    title: '水预算基本概念',
    createTime: new Date(Date.now() - 3600000),
    updateTime: new Date(Date.now() - 3600000),
    messages: [
      {
        id: 'msg_001',
        role: 'system',
        content: '您好，我是水预算助手，请问有什么可以帮助您的？',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 'msg_002',
        role: 'user',
        content: '请介绍一下水预算的基本概念',
        timestamp: new Date(Date.now() - 3500000)
      },
      {
        id: 'msg_003',
        role: 'system',
        content: '水预算是指对水资源的收支进行预测和规划的过程，包括降水、蒸发、径流等水文要素的计算和分析，以及水资源的合理配置和利用。',
        timestamp: new Date(Date.now() - 3400000)
      }
    ]
  }
])

// 当前对话
const currentConversationId = ref('conv_001')
const currentConversationTitle = ref('水预算基本概念')
const messages = ref<Message[]>(conversations[0].messages)
const inputContent = ref('')
const loading = ref(false)

// 格式化时间
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 格式化日期
const formatDate = (date: Date) => {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }
}

// 获取最后一条消息预览
const getLastMessagePreview = (messages: Message[]) => {
  if (messages.length === 0) return '无消息'
  
  const lastMessage = messages[messages.length - 1]
  let preview = lastMessage.content
  
  // 限制预览长度
  if (preview.length > 30) {
    preview = preview.substring(0, 30) + '...'
  }
  
  // 添加角色标识
  return `${lastMessage.role === 'user' ? '我: ' : '系统: '}${preview}`
}

// 发送消息
const handleSend = () => {
  if (!inputContent.value.trim()) return
  
  // 添加用户消息
  const userMessage: Message = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: inputContent.value,
    timestamp: new Date()
  }
  messages.value.push(userMessage)
  inputContent.value = ''
  
  // 模拟系统回复
  loading.value = true
  setTimeout(() => {
    const systemMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'system',
      content: '这是系统的模拟回复。在实际应用中，这里会调用水预算大模型生成真实回复。',
      timestamp: new Date()
    }
    messages.value.push(systemMessage)
    loading.value = false
    
    // 更新对话时间
    const conv = conversations.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.updateTime = new Date()
    }
  }, 1000)
}

// 评价消息
const rateMessage = (messageId: string, rating: number) => {
  console.log('评价消息', messageId, rating)
}

// 重命名对话
const renameConversation = () => {
  const conv = conversations.find(c => c.id === currentConversationId.value)
  if (conv) {
    conv.title = prompt('请输入新的对话标题', conv.title) || conv.title
    currentConversationTitle.value = conv.title
  }
}

// 删除对话
const deleteConversation = () => {
  const index = conversations.findIndex(c => c.id === currentConversationId.value)
  if (index > -1) {
    conversations.splice(index, 1)
    // 如果删除的是当前对话，切换到第一个对话或创建新对话
    if (conversations.length > 0) {
      switchConversation(conversations[0].id)
    } else {
      createNewConversation()
    }
  }
}

// 创建新对话
const createNewConversation = () => {
  const newConv: Conversation = {
    id: `conv_${Date.now()}`,
    title: '新对话',
    createTime: new Date(),
    updateTime: new Date(),
    messages: [
      {
        id: `msg_${Date.now()}`,
        role: 'system',
        content: '您好，我是水预算助手，请问有什么可以帮助您的？',
        timestamp: new Date()
      }
    ]
  }
  conversations.push(newConv)
  switchConversation(newConv.id)
}

// 切换对话
const switchConversation = (id: string) => {
  currentConversationId.value = id
  const conv = conversations.find(c => c.id === id)
  if (conv) {
    currentConversationTitle.value = conv.title
    messages.value = conv.messages
  }
}
</script>

<style scoped>
.conversation-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 对话布局 */
.conversation-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100% - 60px);
}

/* 对话历史侧边栏 */
.conversation-sidebar {
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.sidebar-header h3 {
  font-size: 16px;
  margin: 0;
  color: #303133;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.conversation-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f5f7fa;
}

.conversation-item:hover {
  background-color: #ecf5ff;
}

.conversation-item.active {
  background-color: #e6f7ff;
  border: 1px solid #409EFF;
}

.conversation-item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-item-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.conversation-item-preview {
  font-size: 13px;
  color: #4e5969;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 对话主区域 */
.conversation-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 对话头部 */
.conversation-header {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #ffffff;
}

.conversation-header h2 {
  font-size: 18px;
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 16px;
}

/* 对话区域 */
.conversation-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: hidden;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
}

.system-message {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  word-wrap: break-word;
  word-break: break-word;
}

.user-message .message-content {
  background-color: #f0f9ff;
  border: 1px solid #409EFF;
  border-bottom-right-radius: 4px;
  color: #303133;
}

.system-message .message-content {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin: 4px 8px;
  align-self: flex-end;
}

.message-actions {
  margin: 4px 8px;
  align-self: flex-start;
}

.loading-message {
  max-width: 50%;
}

/* 输入区域 */
.input-area {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversation-sidebar {
    width: 250px;
  }
  
  .message-item {
    max-width: 90%;
  }
}

@media (max-width: 576px) {
  .conversation-sidebar {
    width: 100%;
    position: absolute;
    z-index: 100;
    height: calc(100% - 60px);
  }
  
  .conversation-main {
    width: 100%;
  }
}
</style>