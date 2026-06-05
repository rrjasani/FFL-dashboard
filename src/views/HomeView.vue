<script setup lang="ts">
import Chart from 'chart.js/auto'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MetricCard from '../components/MetricCard.vue'

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
const barCanvas = ref<HTMLCanvasElement | null>(null)
const trendCanvas = ref<HTMLCanvasElement | null>(null)
let barChart: Chart<'bar'> | null = null
let trendChart: Chart<'line'> | null = null

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
      trendTone: 'secondary' as const,
      trendDirection: 'flat' as const,
      trendText: 'No prior comparison',
    }
  }

  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const movedUp = delta > 0

  return {
    trendTone: improved ? ('success' as const) : ('error' as const),
    trendDirection: movedUp ? ('up' as const) : ('down' as const),
    trendText: `${Math.abs(delta).toFixed(1)}% vs previous period`,
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

function selectedMonthLabels(indexes: number[]) {
  return indexes.map((index) => MONTHS[index])
}

function selectedShipments(indexes: number[]) {
  return indexes.map((index) => DATA[index].shipments)
}

function selectedOnTimeRates(indexes: number[]) {
  return indexes.map((index) => DATA[index].onTimeRate)
}

function renderCharts() {
  const indexes = activeMonthIndexes.value
  const labels = selectedMonthLabels(indexes)
  const shipmentSeries = selectedShipments(indexes)
  const onTimeSeries = selectedOnTimeRates(indexes)

  if (barChart) {
    barChart.destroy()
  }
  if (trendChart) {
    trendChart.destroy()
  }

  if (!barCanvas.value || !trendCanvas.value) {
    return
  }

  barChart = new Chart(barCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Shipment Volume',
          data: shipmentSeries,
          borderRadius: 8,
          backgroundColor: '#2e6ea6',
          hoverBackgroundColor: '#1f5a8c',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#e4edf5' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  })

  trendChart = new Chart(trendCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Shipment Volume',
          data: shipmentSeries,
          borderColor: '#2e6ea6',
          backgroundColor: 'rgba(46, 110, 166, 0.15)',
          yAxisID: 'y',
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'On-Time Delivery %',
          data: onTimeSeries,
          borderColor: '#f7931e',
          backgroundColor: 'rgba(247, 147, 30, 0.12)',
          yAxisID: 'y1',
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          position: 'left',
          beginAtZero: true,
          grid: { color: '#e4edf5' },
          title: { display: true, text: 'Shipments' },
        },
        y1: {
          position: 'right',
          min: 88,
          max: 96,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'On-Time %' },
        },
      },
    },
  })
}

watch(activeMonthIndexes, () => {
  renderCharts()
})

onMounted(() => {
  renderCharts()
})

onBeforeUnmount(() => {
  if (barChart) {
    barChart.destroy()
  }
  if (trendChart) {
    trendChart.destroy()
  }
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
          <MetricCard
            :label="metric.title"
            :value="metric.value"
            :trend-text="metric.trendText"
            :trend-direction="metric.trendDirection"
            :trend-tone="metric.trendTone"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" lg="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title>Shipment Volume</v-card-title>
            <v-card-text>
              <v-sheet class="chart-surface" rounded="lg" border>
                <canvas ref="barCanvas" />
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title>Shipment Volume and On-Time Trend</v-card-title>
            <v-card-text>
              <v-sheet class="chart-surface" rounded="lg" border>
                <canvas ref="trendCanvas" />
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

.chart-surface {
  height: clamp(220px, 36vh, 520px);
  padding: 8px;
  background: linear-gradient(135deg, rgba(46, 110, 166, 0.08), rgba(244, 197, 66, 0.12));
}

.chart-surface canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 600px) {
  .chart-surface {
    height: clamp(200px, 34vh, 320px);
  }
}
</style>
