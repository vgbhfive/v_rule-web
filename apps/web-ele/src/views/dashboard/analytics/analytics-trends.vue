<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2%',
    },
    series: [
      {
        areaStyle: {},
        data: [
          111, 2000, 6000, 16_000, 33_333, 55_555, 64_000, 78_333, 92_000,
          86_000, 70_000, 42_444, 23_222, 13_000, 8000, 4000, 1200, 333, 222,
          111,
        ],
        itemStyle: {
          color: '#5ab1ef',
        },
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: {},
        data: [
          33, 66, 88, 333, 3333, 6200, 20_000, 33_000, 45_000, 43_000, 18_000,
          11_000, 2451, 1201, 390, 198, 60, 30, 22, 11,
        ],
        itemStyle: {
          color: '#019680',
        },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    // xAxis: {
    //   axisTick: {
    //     show: false,
    //   },
    //   boundaryGap: false,
    //   data: Array.from({ length: 18 }).map((_item, index) => `${index + 6}:00`),
    //   type: 'category',
    // },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: Array.from({ length: 18 }).map((_item, index) => `${index + 6}:00`),
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        max: 120_000,
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
