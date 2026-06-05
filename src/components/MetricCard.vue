<script setup lang="ts">
type TrendDirection = 'up' | 'down' | 'flat'
type TrendTone = 'success' | 'error' | 'secondary'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    trendText: string
    trendDirection: TrendDirection
    trendTone?: TrendTone
  }>(),
  {
    trendTone: undefined,
  },
)

const iconByDirection: Record<TrendDirection, string> = {
  up: 'mdi-arrow-up',
  down: 'mdi-arrow-down',
  flat: 'mdi-minus',
}

const toneByDirection: Record<TrendDirection, TrendTone> = {
  up: 'success',
  down: 'error',
  flat: 'secondary',
}
</script>

<template>
  <v-card rounded="lg" elevation="0" class="h-100 metric-card">
    <v-card-item>
      <v-card-subtitle class="metric-label">{{ props.label }}</v-card-subtitle>
      <v-card-title class="metric-value">{{ props.value }}</v-card-title>
    </v-card-item>
    <v-card-text class="pt-0 pb-4">
      <v-chip :color="props.trendTone ?? toneByDirection[props.trendDirection]" size="small" variant="tonal">
        <v-icon start size="16">{{ iconByDirection[props.trendDirection] }}</v-icon>
        {{ props.trendText }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.metric-card {
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.metric-label {
  color: #6b7280;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.metric-value {
  color: #1f2937;
  font-size: 1.65rem;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
}
</style>
