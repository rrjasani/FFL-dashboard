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
  <v-card rounded="lg" elevation="2" class="h-100">
    <v-card-item>
      <v-card-subtitle class="font-weight-semibold">{{ props.label }}</v-card-subtitle>
      <v-card-title class="text-h5 font-weight-bold text-blue-darken-2">{{ props.value }}</v-card-title>
    </v-card-item>
    <v-card-text class="pt-0">
      <v-chip :color="props.trendTone ?? toneByDirection[props.trendDirection]" size="small" variant="tonal">
        <v-icon start size="16">{{ iconByDirection[props.trendDirection] }}</v-icon>
        {{ props.trendText }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>
