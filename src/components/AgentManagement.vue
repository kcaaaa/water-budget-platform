<template>
  <div class="agent-management-container">
    <div class="agent-management-header">
      <h2>智能体管理</h2>
      <el-button type="primary" @click="handleCreateAgent">
        <i class="fas fa-plus"></i> 创建智能体
      </el-button>
    </div>

    <!-- 智能体列表 -->
    <el-card class="agent-list-card">
      <template #header>
        <div class="agent-list-header">
          <span>智能体列表</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索智能体"
            style="width: 200px"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="filteredAgents" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="智能体名称" min-width="180">
          <template #default="scope">
            <div class="agent-name-wrapper">
              <el-avatar :size="32" :src="scope.row.avatar || ''" :icon="scope.row.avatar ? '' : 'el-icon-user'" />
              <span>{{ scope.row.name }}</span>
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'" size="small">
                {{ scope.row.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.type === 'water_budget' ? '水预算专家' : '通用智能体' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="template" label="模板" width="120" />
        <el-table-column prop="skillCount" label="技能数" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewAgent(scope.row)">
              <i class="fas fa-eye"></i> 查看
            </el-button>
            <el-button size="small" @click="handleConfigParams(scope.row)">
              <i class="fas fa-cog"></i> 参数配置
            </el-button>
            <el-button size="small" @click="handleBindSkills(scope.row)">
              <i class="fas fa-puzzle-piece"></i> 技能绑定
            </el-button>
            <el-button size="small" :type="scope.row.status === 'active' ? 'warning' : 'success'" @click="handleToggleStatus(scope.row)">
              <i class="fas fa-toggle-on"></i> {{ scope.row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteAgent(scope.row)">
              <i class="fas fa-trash"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 智能体统计 -->
    <el-card class="agent-stats-card">
      <template #header>
        <div class="agent-stats-header">
          <span>智能体统计</span>
        </div>
      </template>

      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-value">{{ totalAgents }}</div>
          <div class="stat-label">智能体总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ activeAgents }}</div>
          <div class="stat-label">活跃智能体</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalSkills }}</div>
          <div class="stat-label">已绑定技能数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ testCount }}</div>
          <div class="stat-label">今日测试次数</div>
        </div>
      </div>
    </el-card>

    <!-- 创建智能体对话框 -->
    <el-dialog
      v-model="createAgentDialogVisible"
      title="创建智能体"
      width="600px"
    >
      <el-form :model="newAgent" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="newAgent.name" placeholder="请输入智能体名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newAgent.description"
            type="textarea"
            rows="3"
            placeholder="请输入智能体描述"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newAgent.type" placeholder="请选择智能体类型">
            <el-option label="水预算专家" value="water_budget" />
            <el-option label="通用智能体" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板">
          <el-select v-model="newAgent.template" placeholder="请选择智能体模板">
            <el-option label="默认模板" value="default" />
            <el-option label="水预算分析模板" value="water_budget_analysis" />
            <el-option label="水资源规划模板" value="water_resource_planning" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            action="#"
            :auto-upload="false"
            :file-list="agentAvatarList"
            :on-change="handleAvatarChange"
            accept="image/*"
            :limit="1"
          >
            <el-button size="small" type="primary">上传头像</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG、PNG格式，文件不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createAgentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAgent">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 参数配置对话框 -->
    <el-dialog
      v-model="configParamsDialogVisible"
      :title="`参数配置 - ${selectedAgent?.name || ''}`"
      width="500px"
    >
      <el-form :model="agentParams" label-width="120px">
        <el-form-item label="温度参数">
          <el-slider
            v-model="agentParams.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item label="上下文长度">
          <el-input-number
            v-model="agentParams.contextLength"
            :min="100"
            :max="10000"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="响应速度">
          <el-select v-model="agentParams.responseSpeed" placeholder="请选择响应速度">
            <el-option label="快速" value="fast" />
            <el-option label="均衡" value="balanced" />
            <el-option label="详细" value="detailed" />
          </el-select>
        </el-form-item>
        <el-form-item label="预设模板">
          <el-select v-model="agentParams.presetTemplate" placeholder="请选择预设模板">
            <el-option label="精确型" value="precise" />
            <el-option label="创意型" value="creative" />
            <el-option label="平衡型" value="balanced" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configParamsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveParams">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 技能绑定对话框 -->
    <el-dialog
      v-model="bindSkillsDialogVisible"
      :title="`技能绑定 - ${selectedAgent?.name || ''}`"
      width="700px"
    >
      <div class="skills-container">
        <el-tree
          :data="skillsData"
          show-checkbox
          node-key="id"
          check-strictly
          :default-checked-keys="selectedAgentSkills"
          @check="handleSkillCheck"
          style="max-height: 500px; overflow-y: auto"
        >
          <template #default="{ node, data }">
            <div class="skill-node">
              <span>{{ node.label }}</span>
              <el-tag size="small" :type="data.type === 'analysis' ? 'primary' : data.type === 'calculation' ? 'success' : data.type === 'prediction' ? 'warning' : 'info'">
                {{ data.type === 'analysis' ? '分析' : data.type === 'calculation' ? '计算' : data.type === 'prediction' ? '预测' : '可视化' }}
              </el-tag>
            </div>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindSkillsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveAgentSkills">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 智能体详情对话框 -->
    <el-dialog
      v-model="agentDetailDialogVisible"
      :title="`智能体详情 - ${selectedAgent?.name || ''}`"
      width="800px"
    >
      <div class="agent-detail">
        <div class="agent-basic-info">
          <div class="agent-avatar">
            <el-avatar :size="80" :src="selectedAgent?.avatar || ''" :icon="selectedAgent?.avatar ? '' : 'el-icon-user'" />
          </div>
          <div class="agent-info">
            <h3>{{ selectedAgent?.name }}</h3>
            <p class="agent-description">{{ selectedAgent?.description }}</p>
            <div class="agent-meta">
              <el-tag size="small">{{ selectedAgent?.type === 'water_budget' ? '水预算专家' : '通用智能体' }}</el-tag>
              <el-tag size="small">模板：{{ selectedAgent?.template }}</el-tag>
              <el-tag size="small" :type="selectedAgent?.status === 'active' ? 'success' : 'warning'">
                {{ selectedAgent?.status === 'active' ? '活跃' : '停用' }}
              </el-tag>
              <el-tag size="small">创建时间：{{ selectedAgent?.createTime }}</el-tag>
              <el-tag size="small">更新时间：{{ selectedAgent?.updateTime }}</el-tag>
            </div>
          </div>
        </div>

        <div class="agent-skills">
          <h4>已绑定技能</h4>
          <el-table
            :data="agentBoundSkills"
            style="width: 100%"
            v-if="agentBoundSkills.length > 0"
          >
            <el-table-column prop="name" label="技能名称" min-width="150" />
            <el-table-column prop="description" label="描述" min-width="250" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-tag size="small" :type="scope.row.type === 'analysis' ? 'primary' : scope.row.type === 'calculation' ? 'success' : scope.row.type === 'prediction' ? 'warning' : 'info'">
                  {{ scope.row.type === 'analysis' ? '分析' : scope.row.type === 'calculation' ? '计算' : scope.row.type === 'prediction' ? '预测' : '可视化' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120" />
          </el-table>
          <el-empty description="暂无绑定技能" v-else></el-empty>
        </div>

        <div class="agent-params">
          <h4>智能体参数</h4>
          <el-form :model="agentParams" label-width="120px" inline>
            <el-form-item label="温度参数">
              <el-tag size="small">{{ agentParams.temperature }}</el-tag>
            </el-form-item>
            <el-form-item label="上下文长度">
              <el-tag size="small">{{ agentParams.contextLength }}</el-tag>
            </el-form-item>
            <el-form-item label="响应速度">
              <el-tag size="small">{{ agentParams.responseSpeed === 'fast' ? '快速' : agentParams.responseSpeed === 'balanced' ? '均衡' : '详细' }}</el-tag>
            </el-form-item>
            <el-form-item label="预设模板">
              <el-tag size="small">{{ agentParams.presetTemplate }}</el-tag>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'

// 智能体数据结构
interface Agent {
  id: string
  name: string
  description: string
  type: 'water_budget' | 'general'
  template: string
  avatar: string | null
  status: 'active' | 'inactive'
  skillCount: number
  createTime: string
  updateTime: string
}

// 智能体参数结构
interface AgentParams {
  temperature: number
  contextLength: number
  responseSpeed: 'fast' | 'balanced' | 'detailed'
  presetTemplate: string
}

// 技能数据结构
interface Skill {
  id: string
  name: string
  description: string
  type: 'analysis' | 'calculation' | 'prediction' | 'visualization'
  category: string
  status: 'enabled' | 'disabled'
}

// 模拟智能体数据
const agents = ref<Agent[]>([
  {
    id: '1',
    name: '水预算分析专家',
    description: '专注于水资源预算分析的智能体',
    type: 'water_budget',
    template: 'water_budget_analysis',
    avatar: null,
    status: 'active',
    skillCount: 5,
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-03-20 15:45:00'
  },
  {
    id: '2',
    name: '水资源规划助手',
    description: '协助进行水资源规划的智能体',
    type: 'water_budget',
    template: 'water_resource_planning',
    avatar: null,
    status: 'active',
    skillCount: 3,
    createTime: '2024-02-01 09:15:00',
    updateTime: '2024-03-18 14:20:00'
  },
  {
    id: '3',
    name: '通用咨询助手',
    description: '提供通用咨询服务的智能体',
    type: 'general',
    template: 'default',
    avatar: null,
    status: 'inactive',
    skillCount: 2,
    createTime: '2024-02-10 11:20:00',
    updateTime: '2024-03-10 16:30:00'
  }
])

// 模拟技能数据
const skills = ref<Skill[]>([
  {
    id: 'skill_001',
    name: '水量平衡计算',
    description: '计算不同时间尺度下的水量平衡',
    type: 'calculation',
    category: '水预算',
    status: 'enabled'
  },
  {
    id: 'skill_002',
    name: '降水趋势分析',
    description: '分析历史降水数据的趋势变化',
    type: 'analysis',
    category: '水文学',
    status: 'enabled'
  },
  {
    id: 'skill_003',
    name: '径流预测',
    description: '基于历史数据预测未来径流变化',
    type: 'prediction',
    category: '水文学',
    status: 'enabled'
  },
  {
    id: 'skill_004',
    name: '水资源可视化',
    description: '生成水资源数据的可视化图表',
    type: 'visualization',
    category: '数据分析',
    status: 'enabled'
  },
  {
    id: 'skill_005',
    name: '蒸发蒸腾计算',
    description: '计算不同条件下的蒸发蒸腾量',
    type: 'calculation',
    category: '水文学',
    status: 'enabled'
  },
  {
    id: 'skill_006',
    name: '地下水模拟',
    description: '模拟地下水流动和水位变化',
    type: 'prediction',
    category: '地下水',
    status: 'enabled'
  }
])

// 智能体技能关联数据
const agentSkills = ref<{agentId: string; skillId: string}[]>([
  { agentId: '1', skillId: 'skill_001' },
  { agentId: '1', skillId: 'skill_002' },
  { agentId: '1', skillId: 'skill_003' },
  { agentId: '1', skillId: 'skill_004' },
  { agentId: '1', skillId: 'skill_005' },
  { agentId: '2', skillId: 'skill_001' },
  { agentId: '2', skillId: 'skill_003' },
  { agentId: '2', skillId: 'skill_006' },
  { agentId: '3', skillId: 'skill_004' },
  { agentId: '3', skillId: 'skill_002' }
])

// 搜索关键词
const searchKeyword = ref('')

// 创建智能体对话框
const createAgentDialogVisible = ref(false)
const newAgent = ref({
  name: '',
  description: '',
  type: 'water_budget' as const,
  template: 'default',
  avatar: null
})
const agentAvatarList = ref<UploadFile[]>([])

// 参数配置对话框
const configParamsDialogVisible = ref(false)
const selectedAgent = ref<Agent | null>(null)
const agentParams = ref<AgentParams>({
  temperature: 0.7,
  contextLength: 2000,
  responseSpeed: 'balanced',
  presetTemplate: 'balanced'
})

// 技能绑定对话框
const bindSkillsDialogVisible = ref(false)
const selectedAgentSkills = ref<string[]>([])

// 智能体详情对话框
const agentDetailDialogVisible = ref(false)

// 技能树数据
const skillsData = computed(() => {
  // 将技能按类别分组
  const categories: {[key: string]: any[]} = {}
  
  skills.value.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = []
    }
    categories[skill.category].push({
      ...skill,
      label: skill.name
    })
  })
  
  // 转换为树结构
  return Object.keys(categories).map(category => ({
    id: `category_${category}`,
    label: category,
    children: categories[category]
  }))
})

// 技能选择处理
const handleSkillCheck = (data: any, node: any) => {
  console.log('技能选择变化:', data, node)
}

// 智能体详情中显示已绑定技能
const agentBoundSkills = computed(() => {
  if (!selectedAgent.value) return []
  
  return agentSkills.value
    .filter(rel => rel.agentId === selectedAgent.value?.id)
    .map(rel => {
      const skill = skills.value.find(s => s.id === rel.skillId)
      return skill || {
        id: rel.skillId,
        name: '未知技能',
        description: '',
        type: 'analysis',
        category: '',
        status: 'enabled'
      }
    })
})

// 保存智能体技能绑定
const handleSaveAgentSkills = () => {
  if (!selectedAgent.value) return
  
  // 移除当前智能体的所有技能绑定
  agentSkills.value = agentSkills.value.filter(rel => rel.agentId !== selectedAgent.value?.id)
  
  // 添加新的技能绑定
  selectedAgentSkills.value.forEach(skillId => {
    agentSkills.value.push({
      agentId: selectedAgent.value!.id,
      skillId: skillId
    })
  })
  
  // 更新智能体的技能数量
  const agentIndex = agents.value.findIndex(agent => agent.id === selectedAgent.value?.id)
  if (agentIndex !== -1) {
    agents.value[agentIndex].skillCount = selectedAgentSkills.value.length
    agents.value[agentIndex].updateTime = new Date().toLocaleString()
  }
  
  // 关闭对话框
  bindSkillsDialogVisible.value = false
  
  // 提示成功
  ElMessage.success('技能绑定保存成功')
}

// 过滤后的智能体列表
const filteredAgents = computed(() => {
  if (!searchKeyword.value) return agents.value
  return agents.value.filter(agent => 
    agent.name.includes(searchKeyword.value) ||
    agent.description.includes(searchKeyword.value) ||
    agent.type.includes(searchKeyword.value) ||
    agent.template.includes(searchKeyword.value)
  )
})

// 统计数据
const totalAgents = computed(() => agents.value.length)
const activeAgents = computed(() => agents.value.filter(agent => agent.status === 'active').length)
const totalSkills = computed(() => agents.value.reduce((sum, agent) => sum + agent.skillCount, 0))
const testCount = computed(() => 85) // 模拟数据

// 创建智能体
const handleCreateAgent = () => {
  createAgentDialogVisible.value = true
  newAgent.value = {
    name: '',
    description: '',
    type: 'water_budget',
    template: 'default',
    avatar: null
  }
  agentAvatarList.value = []
}

// 头像变化处理
const handleAvatarChange = (_file: UploadFile, fileList: UploadFile[]) => {
  agentAvatarList.value = fileList
}

// 保存智能体
const handleSaveAgent = () => {
  // 验证表单
  if (!newAgent.value.name.trim()) {
    ElMessage.warning('请输入智能体名称')
    return
  }

  // 创建新的智能体
  const newAgentData: Agent = {
    id: (agents.value.length + 1).toString(),
    name: newAgent.value.name.trim(),
    description: newAgent.value.description.trim(),
    type: newAgent.value.type,
    template: newAgent.value.template,
    avatar: agentAvatarList.value.length > 0 ? agentAvatarList.value[0].url || null : null,
    status: 'active',
    skillCount: 0,
    createTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString()
  }

  // 添加到智能体列表
  agents.value.push(newAgentData)

  // 关闭对话框
  createAgentDialogVisible.value = false

  // 提示成功
  ElMessage.success('智能体创建成功')
}

// 查看智能体
const handleViewAgent = (agent: Agent) => {
  selectedAgent.value = agent
  
  // 加载智能体参数
  agentParams.value = {
    temperature: 0.7,
    contextLength: 2000,
    responseSpeed: 'balanced',
    presetTemplate: 'balanced'
  }
  
  // 打开智能体详情对话框
  agentDetailDialogVisible.value = true
}

// 配置参数
const handleConfigParams = (agent: Agent) => {
  selectedAgent.value = agent
  configParamsDialogVisible.value = true
  // 这里可以加载智能体的实际参数
  agentParams.value = {
    temperature: 0.7,
    contextLength: 2000,
    responseSpeed: 'balanced',
    presetTemplate: 'balanced'
  }
}

// 保存参数
const handleSaveParams = () => {
  // 保存参数配置
  console.log('保存智能体参数:', selectedAgent.value, agentParams.value)

  // 关闭对话框
  configParamsDialogVisible.value = false

  // 提示成功
  ElMessage.success('参数配置保存成功')
}

// 绑定技能
const handleBindSkills = (agent: Agent) => {
  selectedAgent.value = agent
  
  // 获取当前智能体已绑定的技能ID
  selectedAgentSkills.value = agentSkills.value
    .filter(rel => rel.agentId === agent.id)
    .map(rel => rel.skillId)
  
  // 打开技能绑定对话框
  bindSkillsDialogVisible.value = true
}

// 切换智能体状态
const handleToggleStatus = (agent: Agent) => {
  const action = agent.status === 'active' ? '停用' : '启用'
  
  ElMessageBox.confirm(`确定要${action}智能体"${agent.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: action === '停用' ? 'warning' : 'success'
  }).then(() => {
    const agentIndex = agents.value.findIndex(item => item.id === agent.id)
    if (agentIndex !== -1) {
      agents.value[agentIndex].status = agent.status === 'active' ? 'inactive' : 'active'
      agents.value[agentIndex].updateTime = new Date().toLocaleString()
      ElMessage.success(`智能体已${action}成功`)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除智能体
const handleDeleteAgent = (agent: Agent) => {
  ElMessageBox.confirm(`确定要删除智能体"${agent.name}"吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const agentIndex = agents.value.findIndex(item => item.id === agent.id)
    if (agentIndex !== -1) {
      agents.value.splice(agentIndex, 1)
      ElMessage.success('智能体删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
.agent-management-container {
  padding: 20px;
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
}

.agent-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.agent-management-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.agent-list-card,
.agent-stats-card {
  margin-bottom: 20px;
}

.agent-list-header,
.agent-stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agent-name-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}
</style>
