import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentType } from './component';

import { h } from 'vue';

import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';

import { ElButton, ElImage } from 'element-plus';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'dataList',
            total: 'totalCount',
            list: 'dataList',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, { src, previewSrcList: [src], ...props });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          ElButton,
          { size: 'small', link: true },
          { default: () => props?.text },
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add

    vxeUI.renderer.add('CellOperation', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { row } = params;

        const buttons = [];

        if (props?.onEdit) {
          buttons.push(
            h(
              ElButton,
              {
                type: 'primary',
                size: 'small',
                onClick: () => props?.onEdit?.(row),
              },
              { default: () => '编辑' },
            ),
          );
        }

        if (props?.onInfo) {
          buttons.push(
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                onClick: () => props?.onInfo?.(row),
              },
              { default: () => '详情' },
            ),
          );
        }

        if (props?.onValid) {
          buttons.push(
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                onClick: () => props?.onValid?.(row),
              },
              { default: () => '生效' },
            ),
          );
        }

        if (props?.onInvalid) {
          buttons.push(
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                onClick: () => props?.onInvalid?.(row),
              },
              { default: () => '失效' },
            ),
          );
        }

        return h('div', { class: 'flex gap-2' }, buttons);
      },
    });
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType>>
) => useGrid<T, ComponentType>(...rest);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
