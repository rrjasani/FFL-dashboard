<script setup lang="ts">
import { ref } from 'vue'

const monthItems = [
  'All',
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

const selectedMonths = ref(['All'])

const metrics = [
  {
    title: 'Shipment Volume',
    value: '48,610',
    trendText: '4.1% vs previous month',
    trendUp: true,
  },
  {
    title: 'On-Time Delivery Rate',
    value: '93.8%',
    trendText: '1.3% vs previous month',
    trendUp: true,
  },
  {
    title: 'Regional Performance',
    value: '79.5',
    trendText: '0.8% vs previous month',
    trendUp: true,
  },
  {
    title: 'Open Exceptions',
    value: '117',
    trendText: '2.0% vs previous month',
    trendUp: false,
  },
]
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
              <v-chip :color="metric.trendUp ? 'success' : 'error'" size="small" variant="tonal">
                <v-icon start size="16">{{ metric.trendUp ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                {{ metric.trendText }}
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
