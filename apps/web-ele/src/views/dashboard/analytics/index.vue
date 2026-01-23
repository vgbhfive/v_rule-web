<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { AnalysisChartsTabs, AnalysisOverview } from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 120_000,
    value: 35_000,
  },
  {
    icon: SvgCakeIcon,
    title: '进件量',
    totalTitle: '总进件量',
    totalValue: 73_000,
    value: 20_000,
  },
  {
    icon: SvgDownloadIcon,
    title: '通过量',
    totalTitle: '总通过量',
    totalValue: 70_000,
    value: 8000,
  },
  {
    icon: SvgBellIcon,
    title: '放款量',
    totalTitle: '总房款量',
    totalValue: 68_000,
    value: 7800,
  },
];

const chartTabs: TabOption[] = [
  {
    label: '进件趋势',
    value: 'trends',
  },
  {
    label: '月单量',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>
  </div>
</template>
