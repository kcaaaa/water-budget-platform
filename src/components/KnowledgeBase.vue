<template>
  <div class="knowledge-base-container">
    <div class="kb-header">
      <h2>知识库管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索知识库"
          style="width: 240px; margin-right: 12px"
        >
          <template #prefix>
            <i class="fas fa-search"></i>
          </template>
        </el-input>
        <el-button
          type="primary"
          @click="showCreateKBDialog"
        >
          <i class="fas fa-plus"></i>
          创建知识库
        </el-button>
      </div>
    </div>

    <!-- 知识库列表 -->
    <div class="kb-list">
      <el-table
        :data="filteredKnowledgeBases"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="知识库名称" min-width="150">
          <template #default="scope">
            <span class="kb-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="domain" label="领域" width="120"></el-table-column>
        <el-table-column prop="documentCount" label="文档数量" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'enabled' ? 'success' : 'info'"
            >
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewKnowledgeBase(scope.row)">
              <i class="fas fa-eye"></i>
              查看
            </el-button>
            <el-button size="small" @click="uploadDocument(scope.row)">
              <i class="fas fa-upload"></i>
              上传文档
            </el-button>
            <el-button type="warning" size="small" @click="toggleKBStatus(scope.row)">
              {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteKnowledgeBase(scope.row)">
              <i class="fas fa-trash"></i>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建知识库对话框 -->
    <el-dialog
      v-model="createKBDialogVisible"
      title="创建知识库"
      width="500px"
    >
      <el-form :model="newKB" label-width="100px">
        <el-form-item label="知识库名称">
          <el-input v-model="newKB.name" placeholder="请输入知识库名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newKB.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="领域">
          <el-select v-model="newKB.domain" placeholder="请选择领域">
            <el-option label="水文学" value="hydrology"></el-option>
            <el-option label="水资源管理" value="water_resources"></el-option>
            <el-option label="水环境" value="water_environment"></el-option>
            <el-option label="水利工程" value="hydraulic_engineering"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createKBDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveKB">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文档上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="`上传文档 - ${selectedKB?.name}`"
      width="500px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="文档名称">
          <el-input v-model="uploadForm.documentName" placeholder="请输入文档名称"></el-input>
        </el-form-item>
        <el-form-item label="文档文件">
          <el-upload
            action=""
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt,.md"
            :limit="1"
            :on-exceed="handleExceed"
          >
            <template #trigger>
              <el-button type="primary">
                <i class="fas fa-folder-open"></i>
                选择文件
              </el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                支持上传PDF、Word、TXT、Markdown格式文件，大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="文档描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入文档描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeUploadDialog">取消</el-button>
          <el-button type="primary" @click="submitUpload">上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 知识库详情对话框 -->
    <el-dialog
      v-model="kbDetailDialogVisible"
      :title="`知识库详情 - ${selectedKB?.name}`"
      width="800px"
    >
      <div class="kb-detail-content">
        <div class="kb-info">
          <h3>{{ selectedKB?.name }}</h3>
          <p class="kb-description">{{ selectedKB?.description }}</p>
          <div class="kb-meta">
            <el-tag size="small">领域：{{ selectedKB?.domain }}</el-tag>
            <el-tag size="small">文档数：{{ selectedKB?.documentCount }}</el-tag>
            <el-tag size="small">{{ selectedKB?.status === 'enabled' ? '启用' : '禁用' }}</el-tag>
            <el-tag size="small">创建时间：{{ selectedKB?.createTime }}</el-tag>
            <el-tag size="small">更新时间：{{ selectedKB?.updateTime }}</el-tag>
          </div>
        </div>

        <!-- 文档列表 -->
        <div class="documents-list">
          <h4>文档列表</h4>
          <el-table
            :data="selectedKBDocuments"
            border
            stripe
            style="width: 100%"
            v-if="selectedKBDocuments.length > 0"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="文档名称" min-width="180"></el-table-column>
            <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
            <el-table-column prop="fileType" label="文件类型" width="100"></el-table-column>
            <el-table-column prop="size" label="文件大小" width="100">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="160"></el-table-column>
            <el-table-column prop="version" label="版本" width="80"></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" @click="downloadDocument(scope.row)">
                  <i class="fas fa-download"></i>
                  下载
                </el-button>
                <el-button type="danger" size="small" @click="deleteDocument(scope.row)">
                  <i class="fas fa-trash"></i>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty description="暂无文档" v-else></el-empty>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 知识库数据结构
interface KnowledgeBase {
  id: string
  name: string
  description: string
  domain: string
  documentCount: number
  status: 'enabled' | 'disabled'
  createTime: string
  updateTime: string
}

// 文档数据结构
interface Document {
  id: string
  name: string
  description: string
  fileType: string
  size: number
  uploadTime: string
  version: number
  knowledgeBaseId: string
}

// 模拟知识库数据
const knowledgeBases = ref<KnowledgeBase[]>([
  {
    id: 'kb_001',
    name: '水预算基础理论',
    description: '包含水预算的基本概念、计算方法和应用案例',
    domain: 'hydrology',
    documentCount: 5,
    status: 'enabled',
    createTime: '2026-01-08 10:30:00',
    updateTime: '2026-01-08 14:20:00'
  },
  {
    id: 'kb_002',
    name: '水资源管理技术',
    description: '水资源规划、配置和管理的技术方法和实践经验',
    domain: 'water_resources',
    documentCount: 8,
    status: 'enabled',
    createTime: '2026-01-07 09:15:00',
    updateTime: '2026-01-07 16:45:00'
  },
  {
    id: 'kb_003',
    name: '水环境监测标准',
    description: '水环境监测的标准规范和技术要求',
    domain: 'water_environment',
    documentCount: 3,
    status: 'disabled',
    createTime: '2026-01-06 11:20:00',
    updateTime: '2026-01-06 11:20:00'
  }
])

// 模拟文档数据
const documents = ref<Document[]>([
  {
    id: 'doc_001',
    name: '水预算计算手册.pdf',
    description: '水预算计算的详细方法和示例',
    fileType: 'pdf',
    size: 2048576,
    uploadTime: '2026-01-08 10:45:00',
    version: 1.0,
    knowledgeBaseId: 'kb_001'
  },
  {
    id: 'doc_002',
    name: '水资源规划案例.docx',
    description: '某地区水资源规划的实际案例分析',
    fileType: 'docx',
    size: 1536000,
    uploadTime: '2026-01-08 14:20:00',
    version: 1.0,
    knowledgeBaseId: 'kb_001'
  },
  {
    id: 'doc_003',
    name: '水资源配置模型.xlsx',
    description: '水资源配置的数学模型和计算工具',
    fileType: 'xlsx',
    size: 3072000,
    uploadTime: '2026-01-07 10:30:00',
    version: 1.0,
    knowledgeBaseId: 'kb_002'
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 创建知识库对话框
const createKBDialogVisible = ref(false)
const newKB = reactive({
  name: '',
  description: '',
  domain: 'hydrology'
})

// 文档上传对话框
const uploadDialogVisible = ref(false)
const selectedKB = ref<KnowledgeBase | null>(null)
const uploadForm = reactive({
  documentName: '',
  description: ''
})
const fileList = ref<any[]>([])

// 知识库详情对话框
const kbDetailDialogVisible = ref(false)
const selectedKBDocuments = computed(() => {
  return documents.value.filter(doc => doc.knowledgeBaseId === selectedKB.value?.id)
})

// 过滤后的知识库列表
const filteredKnowledgeBases = computed(() => {
  if (!searchKeyword.value) return knowledgeBases.value
  return knowledgeBases.value.filter(kb => 
    kb.name.includes(searchKeyword.value) || 
    kb.description.includes(searchKeyword.value) ||
    kb.domain.includes(searchKeyword.value)
  )
})

// 显示创建知识库对话框
const showCreateKBDialog = () => {
  createKBDialogVisible.value = true
}

// 保存知识库
const handleSaveKB = () => {
  if (!newKB.name.trim()) {
    ElMessage.warning('请输入知识库名称')
    return
  }

  // 创建新的知识库
  const newKnowledgeBase: KnowledgeBase = {
    id: `kb_${Date.now()}`,
    name: newKB.name.trim(),
    description: newKB.description.trim(),
    domain: newKB.domain,
    documentCount: 0,
    status: 'enabled',
    createTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString()
  }

  knowledgeBases.value.push(newKnowledgeBase)
  createKBDialogVisible.value = false
  ElMessage.success('知识库创建成功')

  // 重置表单
  newKB.name = ''
  newKB.description = ''
  newKB.domain = 'hydrology'
}

// 查看知识库详情
const viewKnowledgeBase = (kb: KnowledgeBase) => {
  selectedKB.value = kb
  kbDetailDialogVisible.value = true
}

// 上传文档
const uploadDocument = (kb: KnowledgeBase) => {
  selectedKB.value = kb
  uploadDialogVisible.value = true
}

// 文件选择变化
const handleFileChange = (file: any) => {
  fileList.value = [file]
}

// 文件大小超过限制
const handleExceed = () => {
  ElMessage.error('文件大小不能超过10MB')
}

// 提交上传
const submitUpload = () => {
  if (!selectedKB.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }
  if (!uploadForm.documentName.trim()) {
    ElMessage.warning('请输入文档名称')
    return
  }

  // 模拟上传
  const file = fileList.value[0]
  const newDocument: Document = {
    id: `doc_${Date.now()}`,
    name: uploadForm.documentName.trim(),
    description: uploadForm.description.trim(),
    fileType: file.raw.type.split('/')[1],
    size: file.raw.size,
    uploadTime: new Date().toLocaleString(),
    version: 1.0,
    knowledgeBaseId: selectedKB.value.id
  }

  documents.value.push(newDocument)

  // 更新知识库文档数量
  const kbIndex = knowledgeBases.value.findIndex(kb => kb.id === selectedKB.value!.id)
  if (kbIndex !== -1) {
    knowledgeBases.value[kbIndex].documentCount++
    knowledgeBases.value[kbIndex].updateTime = new Date().toLocaleString()
  }

  ElMessage.success('文档上传成功')
  closeUploadDialog()
}

// 关闭上传对话框
const closeUploadDialog = () => {
  uploadDialogVisible.value = false
  fileList.value = []
  uploadForm.documentName = ''
  uploadForm.description = ''
}

// 下载文档
const downloadDocument = (_doc: Document) => {
  ElMessage.info('文档下载功能开发中...')
}

// 删除文档
const deleteDocument = (doc: Document) => {
  ElMessageBox.confirm(`确定要删除文档"${doc.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const docIndex = documents.value.findIndex(item => item.id === doc.id)
    if (docIndex !== -1) {
      documents.value.splice(docIndex, 1)
      
      // 更新知识库文档数量
      const kbIndex = knowledgeBases.value.findIndex(kb => kb.id === doc.knowledgeBaseId)
      if (kbIndex !== -1) {
        knowledgeBases.value[kbIndex].documentCount--
        knowledgeBases.value[kbIndex].updateTime = new Date().toLocaleString()
      }
      
      ElMessage.success('文档删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 切换知识库状态
const toggleKBStatus = (kb: KnowledgeBase) => {
  const action = kb.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}知识库"${kb.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: action === '禁用' ? 'warning' : 'success'
  }).then(() => {
    const kbIndex = knowledgeBases.value.findIndex(item => item.id === kb.id)
    if (kbIndex !== -1) {
      knowledgeBases.value[kbIndex].status = kb.status === 'enabled' ? 'disabled' : 'enabled'
      knowledgeBases.value[kbIndex].updateTime = new Date().toLocaleString()
      ElMessage.success(`知识库已${action}成功`)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除知识库
const deleteKnowledgeBase = (kb: KnowledgeBase) => {
  ElMessageBox.confirm(`确定要删除知识库"${kb.name}"吗？此操作将同时删除库中的所有文档。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const kbIndex = knowledgeBases.value.findIndex(item => item.id === kb.id)
    if (kbIndex !== -1) {
      knowledgeBases.value.splice(kbIndex, 1)
      
      // 删除关联的文档
      documents.value = documents.value.filter(doc => doc.knowledgeBaseId !== kb.id)
      
      ElMessage.success('知识库删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.knowledge-base-container {
  padding: 20px;
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.kb-header h2 {
  font-size: 20px;
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.kb-list {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.kb-name {
  font-weight: 500;
  color: #409EFF;
}

/* 知识库详情 */
.kb-detail-content {
  padding: 16px 0;
}

.kb-info {
  margin-bottom: 24px;
}

.kb-info h3 {
  font-size: 18px;
  margin: 0 0 12px 0;
  color: #303133;
}

.kb-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.kb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.documents-list {
  margin-top: 24px;
}

.documents-list h4 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #303133;
}
</style>