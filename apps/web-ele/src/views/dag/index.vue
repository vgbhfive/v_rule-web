<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { useVueFlow, VueFlow } from '@vue-flow/core';
import dagre from 'dagre';
import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { getSceneDagInfo } from '#/api/dag';
import { getLineDropdownList, getSceneDropdownList } from '#/api/system';

// 样式引入
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const { hasAccessByCodes } = useAccess();

const loading = ref(false);
const nodes = ref([]);
const edges = ref([]);
const { fitView } = useVueFlow();
const lineOptions = ref<{ label: string; value: string }[]>([]); // 业务线下拉
const sceneNoOptions = ref<{ label: string; value: string }[]>([]); // 场景下拉
const preLineNo = ref('');

onMounted(async () => {
  const list = await getLineDropdownList();
  lineOptions.value = list.map((item) => ({
    label: item.key,
    value: item.value,
  }));
});

// 查询表单配置
const [QueryForm] = useVbenForm({
  collapsed: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleValuesChange: onValueChange,
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        options: lineOptions,
        placeholder: '业务线名称',
        clearable: true,
      },
      fieldName: 'lineNo',
      label: '业务线',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        options: sceneNoOptions,
        placeholder: '场景名称',
        clearable: true,
      },
      fieldName: 'sceneNo',
      label: '场景',
    },
  ],
  submitButtonOptions: {
    content: '查询',
    show: hasAccessByCodes(['dag_info']),
  },
  wrapperClass: 'grid-cols-3 grid-cols-4',
});

// 查询提交
async function onSubmit(values: any) {
  if (!values.lineNo || !values.sceneNo) {
    ElMessage.error('请选择业务线和场景');
    return;
  }
  const data = await getSceneDagInfo({
    lineNo: values.lineNo,
    sceneNo: values.sceneNo,
  });
  const { nodes: rawNodes, edges: rawEdges } = transformApiData(data);

  // 3. 使用 Dagre 覆盖掉 position 值
  const layoutedNodes = getLayoutedElements(rawNodes, rawEdges);

  // 4. 赋值渲染
  nodes.value = layoutedNodes;
  edges.value = rawEdges;

  // 5. 稍微延迟一下，让画布自动对齐到中心
  setTimeout(() => {
    fitView();
  }, 50);
}

// 查询框值变化
async function onValueChange(values: any) {
  if (values.lineNo && values.lineNo !== preLineNo.value) {
    const sceneList = await getSceneDropdownList({ lineNo: values.lineNo });
    sceneNoOptions.value = sceneList.map((item) => ({
      label: item.key,
      value: item.value,
    }));
    preLineNo.value = values.lineNo;
  }
}

/**
 * 将业务配置 JSON 转换为 Vue Flow 所需的 nodes 和 edges
 * @param {object} data 接口返回的原始 JSON 数据
 * @returns {object} { nodes: [], edges: [] }
 */
function transformApiData(data: any) {
  const nodes = [];
  const edges = [];

  // 1. 解析场景层 (Scene) - 它是图的根节点
  if (data.sceneList && data.sceneList.length > 0) {
    data.sceneList.forEach((scene: any) => {
      const sceneId = `scene-${scene.no}`;

      nodes.push({
        id: sceneId,
        label: `场景: ${scene.name}`,
        type: 'input', // Vue Flow 入口节点类型
        class: 'node-scene',
        position: { x: 0, y: 0 }, // 初始坐标设为0，后续由布局引擎计算
      });

      // 2. 解析分流器层 (Divide) - 通过 sceneNo 关联
      // 过滤出属于当前场景的所有分流器
      const relatedDivides = data.divideList.filter(
        (d: any) => d.sceneNo === scene.no,
      );

      relatedDivides.forEach((divide: any) => {
        const divideId = `divide-${divide.no}`;

        nodes.push({
          id: divideId,
          label: `分流器: ${divide.name}\n优先级: ${divide.priority}`,
          class: 'node-divide',
          position: { x: 0, y: 0 },
        });

        // 建立 场景 -> 分流器 的连线
        edges.push({
          id: `e-${sceneId}-${divideId}`,
          source: sceneId,
          target: divideId,
          label: '分流',
          animated: true,
        });

        // 3. 解析策略层 (Strategy) - 接入策略与风险策略
        // 一个分流器通常关联两个策略：accessStrategyNo 和 riskStrategyNo
        const strategyNos = [
          { no: divide.accessStrategyNo, type: '准入' },
          { no: divide.riskStrategyNo, type: '风控' },
        ].filter((item) => item.no); // 过滤掉空的策略编号

        strategyNos.forEach((stratItem) => {
          const strategy = data.strategyList.find(
            (s: any) => s.no === stratItem.no,
          );
          if (!strategy) return;

          // 注意：ID 需要包含分流器 ID，防止同一个策略被多个分流器引用时 ID 重复
          const startId = `start-${divide.no}-${strategy.no}`;

          nodes.push({
            id: startId,
            label: `${stratItem.type}: ${strategy.name}`,
            class: 'node-start',
            position: { x: 0, y: 0 },
          });

          // 建立 分流器 -> 策略 的连线
          edges.push({
            id: `e-${divideId}-${startId}`,
            source: divideId,
            target: startId,
          });

          // 4. 解析规则层 (Rule) - 策略内的 ruleNoList, ruleSetNoList, ruleTreeNoList
          if (
            strategy.strategyDetailList &&
            strategy.strategyDetailList.length > 0
          ) {
            strategy.strategyDetailList.forEach(
              (detail: any, index: number) => {
                const ruleTypeName = ref('');
                const rule = ref<any>(null);
                switch (detail.ruleType) {
                  case 'rule': {
                    rule.value = data.ruleList.find(
                      (r: any) => r.no === detail.detailNo,
                    );
                    ruleTypeName.value = '规则';
                    break;
                  }
                  case 'rule_set': {
                    rule.value = data.ruleSetList.find(
                      (e: any) => e.no === detail.detailNo,
                    );
                    ruleTypeName.value = '规则集';
                    break;
                  }
                  case 'rule_tree': {
                    rule.value = data.ruleTreeList.find(
                      (e: any) => e.no === detail.detailNo,
                    );
                    ruleTypeName.value = '规则树';
                    break;
                  }
                  // No default
                }
                if (!rule.value) return;

                const ruleId = `rule-${startId}-${rule.value.no}`;

                nodes.push({
                  id: ruleId,
                  label: `${ruleTypeName.value}: ${rule.value.name}\n结果: ${rule.value.result}`,
                  class: 'node-rule',
                  position: { x: 0, y: 0 },
                  // 关键数据：记录它是第几个规则，属于哪个策略
                  data: { order: index, parentId: startId },
                });

                // 建立 策略 -> 规则 的连线
                edges.push({
                  id: `e-${startId}-${ruleId}`,
                  source: startId,
                  target: ruleId,
                  type: 'step',
                  style: { stroke: '#b1b1b7', strokeWidth: 1 },
                });

                // --- 数据源层 (新增) ---
                // 根据规则中的 dataSourceNo 查找对应的数据源详情
                if (rule.value.dataSourceNo) {
                  const dataSource = data.dataSourceList?.find(
                    (ds: any) => ds.no === rule.value.dataSourceNo,
                  );
                  if (dataSource) {
                    const dsId = `ds-${ruleId}-${dataSource.no}`;
                    nodes.push({
                      id: dsId,
                      label: `${dataSource.name}\n编码: ${dataSource.no}}`,
                      type: 'output', // 最终末端
                      class: 'node-datasource',
                      position: { x: 0, y: 0 },
                      data: {
                        isHorizontal: true,
                        type: 'datasource',
                        ownerRuleId: ruleId,
                      }, // 标记为横向挂载
                    });

                    // 建立 规则 -> 数据源 的连线
                    edges.push({
                      id: `e-${ruleId}-${dsId}`,
                      source: ruleId,
                      target: dsId,
                      label: '读取',
                      type: 'smoothstep',
                      style: { stroke: '#94a3b8', strokeDasharray: '5 5' }, // 虚线表示数据引用
                    });
                  }
                }
              },
            );
          }
        });
      });
    });
  }

  return { nodes, edges };
}

/**
 * 自动计算节点位置
 * @param {Array} nodes 原始节点数组 (position 为 {x:0, y:0})
 * @param {Array} edges 连线数组
 * @returns {Array} 带有计算后坐标的新节点数组
 */
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  // rankdir: 'LR' 代表从左往右布局；'TB' 代表从上往下
  // nodesep: 节点之间的垂直间距；ranksep: 层级之间的水平间距
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 100 });

  nodes.forEach((node) => {
    // 根据节点类型设置不同的宽高
    const width = 200;
    const height = 60;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    let finalX = pos.x;
    let finalY = pos.y;

    // 1. 规则节点：强制与策略集中心对齐，并垂直堆叠
    if (node.class.includes('node-rule')) {
      const parentPos = g.node(node.data.parentId);
      finalX = parentPos.x; // X轴与父节点对齐
      finalY = parentPos.y + 120 + node.data.order * 140; // Y轴根据索引下移
    }

    // 2. 数据源节点：强制放在所属规则节点的右侧
    if (node.data?.isHorizontal) {
      const ruleNode = nodes.find((n) => n.id === node.data.ownerRuleId);
      // 注意：此时 ruleNode 的位置可能还没更新，我们需要递归或在 map 后二次处理
      // 这里简单处理：根据计算出的 rule 位置进行偏移
      const rulePos = g.node(node.data.ownerRuleId);
      // 如果规则被干预了，我们在这里同步干预数据源
      const ruleActualX = g.node(
        nodes.find((n) => n.id === ruleNode.data.parentId).id,
      ).x;
      finalX = ruleActualX + 250; // 在规则右侧 250px 处
      finalY = rulePos.y + ruleNode.data.order * 140; // 与规则 Y 轴对齐
    }

    return {
      ...node,
      position: { x: finalX - 110, y: finalY - 40 },
    };
  });
};
</script>

<template>
  <Page description="DAG">
    <div class="container">
      <div>
        <QueryForm />
      </div>

      <div class="dag-wrapper">
        <VueFlow
          v-if="nodes.length > 0"
          :nodes="nodes"
          :edges="edges"
          :fit-view-on-init="true"
        >
          <Background />
          <Controls />
        </VueFlow>
        <div v-else class="empty-state">
          <p v-if="!loading">请选择参数并点击查询</p>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
}

.search-bar {
  z-index: 10;
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-item select {
  min-width: 150px;
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.btn-primary {
  padding: 8px 24px;
  color: white;
  cursor: pointer;
  background: #409eff;
  border: none;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.btn-primary:disabled {
  cursor: not-allowed;
  background: #a0cfff;
}

.dag-wrapper {
  position: relative;
  flex: 1;
  background: #f5f7fa;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #909399;
  text-align: center;
  transform: translate(-50%, -50%);
}

/* 节点美化 */
:deep(.vue-flow__node) {
  width: 180px;
  padding: 12px;
  font-size: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 5%);
}

:deep(.node-scene) {
  font-weight: bold;
  color: #409eff;
  background: #ecf5ff;
  border: 1.5px solid #409eff;
}

:deep(.node-divide) {
  color: #e6a23c;
  background: #fdf6ec;
  border: 1.5px solid #e6a23c;
}

:deep(.node-start) {
  color: #67c23a;
  background: #f0f9eb;
  border: 1.5px solid #67c23a;
}

:deep(.node-rule) {
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
}
</style>
