<script setup lang="ts">
import { computed, ref } from 'vue'

type MonthlyKpi = {
  shipments: number
  onTimeRate: number
  regionalScore: number
  exceptions: number
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const monthItems = ['All', ...MONTHS]

const DATA: MonthlyKpi[] = [
  { shipments: 3820, onTimeRate: 90.8, regionalScore: 76.4, exceptions: 142 },
  { shipments: 4015, onTimeRate: 91.2, regionalScore: 77.0, exceptions: 138 },
  { shipments: 4190, onTimeRate: 92.1, regionalScore: 77.7, exceptions: 129 },
  { shipments: 4360, onTimeRate: 92.7, regionalScore: 78.1, exceptions: 124 },
  { shipments: 4510, onTimeRate: 93.1, regionalScore: 78.8, exceptions: 118 },
  { shipments: 4685, onTimeRate: 93.5, regionalScore: 79.2, exceptions: 114 },
  { shipments: 4750, onTimeRate: 93.2, regionalScore: 79.0, exceptions: 121 },
  { shipments: 4860, onTimeRate: 92.9, regionalScore: 78.6, exceptions: 128 },
  { shipments: 4975, onTimeRate: 93.8, regionalScore: 79.5, exceptions: 117 },
  { shipments: 5105, onTimeRate: 94.0, regionalScore: 79.9, exceptions: 110 },
  { shipments: 5280, onTimeRate: 94.2, regionalScore: 80.3, exceptions: 104 },
  { shipments: 5410, onTimeRate: 94.7, regionalScore: 81.1, exceptions: 99 },
]

const currentMonthIndex = new Date().getMonth()
const selectedMonths = ref<string[]>([MONTHS[currentMonthIndex]])

const activeMonthIndexes = computed(() => {
  const selected = selectedMonths.value
  if (selected.length === 0 || selected.includes('All') || selected.length === MONTHS.length) {
    return MONTHS.map((_, index) => index)
  }

  return selected
    .map((month) => MONTHS.indexOf(month))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)
})

const numberFormatter = new Intl.NumberFormat('en-US')

function aggregate(indexes: number[]) {
  const shipments = indexes.reduce((sum, index) => sum + DATA[index].shipments, 0)
  const exceptions = indexes.reduce((sum, index) => sum + DATA[index].exceptions, 0)
  const onTimeRate =
    shipments === 0
      ? 0
      : indexes.reduce((sum, index) => sum + DATA[index].onTimeRate * DATA[index].shipments, 0) / shipments
  const regionalScore = indexes.reduce((sum, index) => sum + DATA[index].regionalScore, 0) / indexes.length

  return { shipments, onTimeRate, regionalScore, exceptions }
}

function previousIndexes(indexes: number[]) {
  if (indexes.length === MONTHS.length) {
    return null
  }

  if (indexes.length === 1) {
    const previous = indexes[0] - 1
    return previous >= 0 ? [previous] : null
  }

  const periodLength = indexes.length
  const start = indexes[0]
  const previousStart = start - periodLength
  if (previousStart < 0) {
    return null
  }

  const contiguous = indexes.every((value, idx) => value === start + idx)
  if (!contiguous) {
    return null
  }

  return Array.from({ length: periodLength }, (_, idx) => previousStart + idx)
}

function deltaPercent(current: number, previous: number) {
  if (!previous) {
    return null
  }

  return ((current - previous) / previous) * 100
}

function trend(delta: number | null, lowerIsBetter = false) {
  if (delta === null || delta === 0) {
    return {
      color: 'secondary',
      icon: 'mdi-minus',
      text: 'No prior comparison',
    }
  }

  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const movedUp = delta > 0

  return {
    color: improved ? 'success' : 'error',
    icon: movedUp ? 'mdi-arrow-up' : 'mdi-arrow-down',
    text: `${Math.abs(delta).toFixed(1)}% vs previous period`,
  }
}

const metrics = computed(() => {
  const indexes = activeMonthIndexes.value
  const current = aggregate(indexes)
  const previous = previousIndexes(indexes)
  const baseline = previous ? aggregate(previous) : null

  return [
    {
      title: 'Shipment Volume',
      value: numberFormatter.format(current.shipments),
      ...trend(baseline ? deltaPercent(current.shipments, baseline.shipments) : null),
    },
    {
      title: 'On-Time Delivery Rate',
      value: `${current.onTimeRate.toFixed(1)}%`,
      ...trend(baseline ? deltaPercent(current.onTimeRate, baseline.onTimeRate) : null),
    },
    {
      title: 'Regional Performance',
      value: current.regionalScore.toFixed(1),
      ...trend(baseline ? deltaPercent(current.regionalScore, baseline.regionalScore) : null),
    },
    {
      title: 'Open Exceptions',
      value: numberFormatter.format(current.exceptions),
      ...trend(baseline ? deltaPercent(current.exceptions, baseline.exceptions) : null, true),
    },
  ]
})
</script>

<template>
  <v-container class="py-8" fluid>
    <v-container class="ff-dashboard pa-0" max-width="1200">
      <v-row class="mb-2" align="center">
        <v-col cols="12" md="7">
          <h1 class="text-h4 text-md-h3 font-weight-bold text-primary-darken-2">FastForward Logistics Dashboard</h1>
        </v-col>

        <v-col cols="12" md="5" class="d-flex justify-md-end">
          <v-select
            v-model="selectedMonths"
            :items="monthItems"
            label="Months"
            multiple
            chips
            closable-chips
            variant="outlined"
            density="comfortable"
            max-width="360"
          />
        </v-col>
      </v-row>

      <v-row class="mb-1" dense>
        <v-col v-for="metric in metrics" :key="metric.title" cols="12" sm="6" lg="3">
          <v-card rounded="lg" elevation="2" class="h-100">
            <v-card-item>
              <v-card-subtitle class="font-weight-semibold">{{ metric.title }}</v-card-subtitle>
              <v-card-title class="text-h5 font-weight-bold text-blue-darken-2">{{ metric.value }}</v-card-title>
            </v-card-item>
            <v-card-text class="pt-0">
              <v-chip :color="metric.color" size="small" variant="tonal">
                <v-icon start size="16">{{ metric.icon }}</v-icon>
                {{ metric.text }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" lg="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title>Shipment Volume by Region</v-card-title>
            <v-card-text>
              <v-sheet class="chart-placeholder" rounded="lg" border>
                Bar chart placeholder
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title>Shipment Volume and On-Time Trend</v-card-title>
            <v-card-text>
              <v-sheet class="chart-placeholder" rounded="lg" border>
                Line chart placeholder
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<style scoped>
.ff-dashboard {
  width: 100%;
}

.chart-placeholder {
  height: clamp(220px, 36vh, 520px);
  display: grid;
  place-items: center;
  color: #35526f;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(46, 110, 166, 0.08), rgba(244, 197, 66, 0.12));
}

@media (max-width: 600px) {
  .chart-placeholder {
    height: clamp(200px, 34vh, 320px);
  }
}
</style>
