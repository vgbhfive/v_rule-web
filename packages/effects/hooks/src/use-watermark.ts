import type { Watermark, WatermarkOptions } from 'watermark-js-plus';

import { nextTick, onUnmounted, readonly, ref } from 'vue';

const watermark = ref<Watermark>();
const unmountedHooked = ref<boolean>(false);
const cachedOptions = ref<Partial<WatermarkOptions>>({
  // fontSize: '20px',
  fontColor: '#C0C0C0', // D3D3D3
  content: '',
  contentType: 'multi-line-text',
  globalAlpha: 0.25,
  gridLayoutOptions: {
    cols: 2,
    gap: [20, 20],
    matrix: [
      [1, 0],
      [0, 1],
    ],
    rows: 2,
  },
  height: 200,
  layout: 'grid',
  rotate: 30,
  width: 160,
});

export function useWatermark() {
  async function initWatermark(options: Partial<WatermarkOptions>) {
    const { Watermark } = await import('watermark-js-plus');

    cachedOptions.value = {
      ...cachedOptions.value,
      ...options,
    };
    watermark.value = new Watermark(cachedOptions.value);
    await watermark.value?.create();
  }

  async function updateWatermark(options: Partial<WatermarkOptions>) {
    if (watermark.value) {
      await nextTick();
      await watermark.value?.changeOptions({
        ...cachedOptions.value,
        ...options,
      });
    } else {
      await initWatermark(options);
    }
  }

  function destroyWatermark() {
    if (watermark.value) {
      watermark.value.destroy();
      watermark.value = undefined;
    }
  }

  // 只在第一次调用时注册卸载钩子，防止重复注册以致于在路由切换时销毁了水印
  if (!unmountedHooked.value) {
    unmountedHooked.value = true;
    onUnmounted(() => {
      destroyWatermark();
    });
  }

  return {
    destroyWatermark,
    updateWatermark,
    watermark: readonly(watermark),
  };
}
