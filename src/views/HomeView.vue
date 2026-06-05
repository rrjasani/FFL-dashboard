<script setup lang="ts">
import Chart from 'chart.js/auto'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MetricCard from '../components/MetricCard.vue'
import metricsJson from '../data/metrics.json'

type RegionalShipments = {
  west: number
  midwest: number
  south: number
  northeast: number
}

type RegionKey = keyof RegionalShipments

type RegionMetrics = {
  shipments: number
  onTimeRate: number
  regionalScore: number
  exceptions: number
}

type MonthlyKpi = {
  month: string
  regions: Record<RegionKey, RegionMetrics>
}

type RegionDefinition = {
  key: RegionKey
  label: string
  states: string[]
}

type MetricsShape = {
  months: string[]
  regions: RegionDefinition[]
  monthlyData: MonthlyKpi[]
}

const typedMetrics = metricsJson as MetricsShape
const MONTHS = typedMetrics.months
const REGIONS = typedMetrics.regions
const DATA = typedMetrics.monthlyData

const monthItems = ['All', ...MONTHS]
const regionItems = ['All', ...REGIONS.map((region) => region.label)]

const currentMonthIndex = new Date().getMonth()
const selectedMonths = ref<string[]>([MONTHS[currentMonthIndex]])
const selectedRegions = ref<string[]>(['South'])
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

const activeRegionKeys = computed<RegionKey[]>(() => {
  const selected = selectedRegions.value
  if (selected.length === 0 || selected.includes('All') || selected.length === REGIONS.length) {
    return REGIONS.map((region) => region.key)
  }

  return REGIONS.filter((region) => selected.includes(region.label)).map((region) => region.key)
})

const numberFormatter = new Intl.NumberFormat('en-US')

function aggregate(indexes: number[], regionKeys: RegionKey[]) {
  const cells = indexes.flatMap((index) => regionKeys.map((regionKey) => DATA[index].regions[regionKey]))
  const shipments = cells.reduce((sum, cell) => sum + cell.shipments, 0)
  const exceptions = cells.reduce((sum, cell) => sum + cell.exceptions, 0)
  const onTimeRate =
    shipments === 0
      ? 0
      : cells.reduce((sum, cell) => sum + cell.onTimeRate * cell.shipments, 0) / shipments
  const regionalScore =
    shipments === 0 ? 0 : cells.reduce((sum, cell) => sum + cell.regionalScore * cell.shipments, 0) / shipments

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
  const monthIndexes = activeMonthIndexes.value
  const regionKeys = activeRegionKeys.value
  const current = aggregate(monthIndexes, regionKeys)
  const previous = previousIndexes(monthIndexes)
  const baseline = previous ? aggregate(previous, regionKeys) : null

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

function selectedShipments(indexes: number[], regionKeys: RegionKey[]) {
  return indexes.map((index) =>
    regionKeys.reduce((sum, regionKey) => sum + DATA[index].regions[regionKey].shipments, 0),
  )
}

function selectedOnTimeRates(indexes: number[], regionKeys: RegionKey[]) {
  return indexes.map((index) => {
    const cells = regionKeys.map((regionKey) => DATA[index].regions[regionKey])
    const shipments = cells.reduce((sum, cell) => sum + cell.shipments, 0)
    if (shipments === 0) {
      return 0
    }

    return cells.reduce((sum, cell) => sum + cell.onTimeRate * cell.shipments, 0) / shipments
  })
}

function selectedRegionLabels(regionKeys: RegionKey[]) {
  return regionKeys.map((regionKey) => REGIONS.find((region) => region.key === regionKey)?.label ?? regionKey)
}

function selectedRegionShipments(indexes: number[], regionKeys: RegionKey[]) {
  return regionKeys.map((regionKey) =>
    indexes.reduce((sum, index) => sum + DATA[index].regions[regionKey].shipments, 0),
  )
}

function renderCharts() {
  const monthIndexes = activeMonthIndexes.value
  const regionKeys = activeRegionKeys.value
  const monthLabels = selectedMonthLabels(monthIndexes)
  const shipmentSeries = selectedShipments(monthIndexes, regionKeys)
  const onTimeSeries = selectedOnTimeRates(monthIndexes, regionKeys)
  const regionLabels = selectedRegionLabels(regionKeys)
  const regionShipments = selectedRegionShipments(monthIndexes, regionKeys)

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
      labels: regionLabels,
      datasets: [
        {
          label: 'Shipment Volume',
          data: regionShipments,
          borderRadius: 8,
          backgroundColor: ['#2e6ea6', '#89b5dc', '#f7931e', '#f4c542'],
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
      labels: monthLabels,
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

watch(activeRegionKeys, () => {
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
        <v-col cols="12" md="5">
          <h1 class="text-h4 text-md-h3 font-weight-bold text-primary-darken-2">FastForward Logistics Dashboard</h1>
        </v-col>

        <v-col cols="12" md="7" class="d-flex justify-md-end">
          <div class="top-filters">
            <v-select
              v-model="selectedMonths"
              :items="monthItems"
              label="Months"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="comfortable"
              hide-details
            />

            <v-select
              v-model="selectedRegions"
              :items="regionItems"
              label="Regions"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
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

.top-filters {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 700px;
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
  .top-filters {
    grid-template-columns: 1fr;
  }

  .chart-surface {
    height: clamp(200px, 34vh, 320px);
  }
}
</style>
