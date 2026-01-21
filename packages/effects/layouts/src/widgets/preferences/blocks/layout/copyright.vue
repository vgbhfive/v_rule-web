<script setup lang="ts">
import { computed } from 'vue';

import { $t } from '@vben/locales';

import TextItem from '../text-item.vue';

const props = defineProps<{ disabled: boolean }>();

const copyrightDate = defineModel<string>('copyrightDate');
const copyrightIcp = defineModel<string>('copyrightIcp');
const copyrightIcpLink = defineModel<string>('copyrightIcpLink');
const copyrightCompanyName = defineModel<string>('copyrightCompanyName');
const copyrightCompanySiteLink = defineModel<string>(
  'copyrightCompanySiteLink',
);

const itemDisabled = computed(() => props.disabled);
</script>

<template>
  <TextItem v-model="copyrightCompanyName" :disabled="itemDisabled">
    {{ $t('preferences.copyright.companyName') }}
  </TextItem>
  <TextItem v-model="copyrightCompanySiteLink" :disabled="itemDisabled">
    {{ $t('preferences.copyright.companySiteLink') }}
  </TextItem>
  <TextItem v-model="copyrightDate" :disabled="itemDisabled">
    {{ $t('preferences.copyright.date') }}
  </TextItem>

  <TextItem v-model="copyrightIcp" :disabled="itemDisabled">
    {{ $t('preferences.copyright.icp') }}
  </TextItem>
  <TextItem v-model="copyrightIcpLink" :disabled="itemDisabled">
    {{ $t('preferences.copyright.icpLink') }}
  </TextItem>
</template>
