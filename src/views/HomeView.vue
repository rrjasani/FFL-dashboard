<template>
  <main class="dashboard">
    <header class="top-bar">
      <h1 class="dashboard-title">FastForward Logistics Dashboard</h1>

      <label class="month-filter" for="monthSelect">
        <span>Months</span>
        <select id="monthSelect" multiple aria-label="Filter months">
          <option selected>All</option>
          <option>January</option>
          <option>February</option>
          <option>March</option>
          <option>April</option>
          <option>May</option>
          <option>June</option>
          <option>July</option>
          <option>August</option>
          <option>September</option>
          <option>October</option>
          <option>November</option>
          <option>December</option>
        </select>
      </label>
    </header>

    <section class="cards" aria-label="KPI cards">
      <article class="metric-card">
        <p class="metric-title">Shipment Volume</p>
        <p class="metric-value">48,610</p>
        <p class="metric-change positive">▲ 4.1% vs previous month</p>
      </article>

      <article class="metric-card">
        <p class="metric-title">On-Time Delivery Rate</p>
        <p class="metric-value">93.8%</p>
        <p class="metric-change positive">▲ 1.3% vs previous month</p>
      </article>

      <article class="metric-card">
        <p class="metric-title">Regional Performance</p>
        <p class="metric-value">79.5</p>
        <p class="metric-change positive">▲ 0.8% vs previous month</p>
      </article>

      <article class="metric-card">
        <p class="metric-title">Open Exceptions</p>
        <p class="metric-value">117</p>
        <p class="metric-change negative">▲ 2.0% vs previous month</p>
      </article>
    </section>

    <section class="charts" aria-label="Chart panels">
      <article class="chart-card">
        <h2>Shipment Volume by Region</h2>
        <div class="chart-placeholder">Bar chart placeholder</div>
      </article>

      <article class="chart-card">
        <h2>Shipment Volume and On-Time Trend</h2>
        <div class="chart-placeholder">Line chart placeholder</div>
      </article>
    </section>
  </main>
</template>
