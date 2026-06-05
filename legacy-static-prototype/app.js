const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATA = [
  { shipments: 3820, onTimeRate: 90.8, regionalScore: 76.4, exceptions: 142, regions: { West: 980, Midwest: 870, South: 1080, East: 890 } },
  { shipments: 4015, onTimeRate: 91.2, regionalScore: 77.0, exceptions: 138, regions: { West: 1010, Midwest: 915, South: 1120, East: 970 } },
  { shipments: 4190, onTimeRate: 92.1, regionalScore: 77.7, exceptions: 129, regions: { West: 1085, Midwest: 955, South: 1165, East: 985 } },
  { shipments: 4360, onTimeRate: 92.7, regionalScore: 78.1, exceptions: 124, regions: { West: 1120, Midwest: 1010, South: 1205, East: 1025 } },
  { shipments: 4510, onTimeRate: 93.1, regionalScore: 78.8, exceptions: 118, regions: { West: 1180, Midwest: 1035, South: 1240, East: 1055 } },
  { shipments: 4685, onTimeRate: 93.5, regionalScore: 79.2, exceptions: 114, regions: { West: 1215, Midwest: 1080, South: 1290, East: 1100 } },
  { shipments: 4750, onTimeRate: 93.2, regionalScore: 79.0, exceptions: 121, regions: { West: 1230, Midwest: 1095, South: 1310, East: 1115 } },
  { shipments: 4860, onTimeRate: 92.9, regionalScore: 78.6, exceptions: 128, regions: { West: 1255, Midwest: 1115, South: 1345, East: 1145 } },
  { shipments: 4975, onTimeRate: 93.8, regionalScore: 79.5, exceptions: 117, regions: { West: 1290, Midwest: 1140, South: 1370, East: 1175 } },
  { shipments: 5105, onTimeRate: 94.0, regionalScore: 79.9, exceptions: 110, regions: { West: 1320, Midwest: 1175, South: 1410, East: 1200 } },
  { shipments: 5280, onTimeRate: 94.2, regionalScore: 80.3, exceptions: 104, regions: { West: 1360, Midwest: 1210, South: 1465, East: 1245 } },
  { shipments: 5410, onTimeRate: 94.7, regionalScore: 81.1, exceptions: 99, regions: { West: 1410, Midwest: 1245, South: 1510, East: 1245 } },
];

const monthToggle = document.getElementById("monthToggle");
const monthMenu = document.getElementById("monthMenu");

const cardShipments = document.getElementById("cardShipments");
const cardOnTime = document.getElementById("cardOnTime");
const cardRegional = document.getElementById("cardRegional");
const cardExceptions = document.getElementById("cardExceptions");

const currentMonth = new Date().getMonth();
let selectedMonths = new Set([currentMonth]);
let barChart;
let lineChart;

function buildMonthMenu() {
  monthMenu.innerHTML = "";

  const allOption = createOption("All months", "all", false);
  monthMenu.appendChild(allOption);

  MONTHS.forEach((month, index) => {
    const option = createOption(month, String(index), index === currentMonth);
    monthMenu.appendChild(option);
  });
}

function createOption(labelText, value, checked) {
  const label = document.createElement("label");
  label.className = "month-option";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = value;
  checkbox.checked = checked;

  checkbox.addEventListener("change", handleMonthChange);

  const text = document.createElement("span");
  text.textContent = labelText;

  label.append(checkbox, text);
  return label;
}

function handleMonthChange(event) {
  const { value, checked } = event.target;
  const allCheckbox = monthMenu.querySelector('input[value="all"]');
  const monthCheckboxes = [...monthMenu.querySelectorAll('input:not([value="all"])')];

  if (value === "all") {
    if (checked) {
      selectedMonths = new Set(MONTHS.map((_, i) => i));
      monthCheckboxes.forEach((cb) => {
        cb.checked = true;
      });
    } else {
      event.target.checked = true;
      return;
    }
  } else {
    const monthIndex = Number(value);
    if (checked) {
      selectedMonths.add(monthIndex);
    } else {
      selectedMonths.delete(monthIndex);
    }

    if (selectedMonths.size === 0) {
      selectedMonths.add(currentMonth);
      event.target.checked = true;
    }

    const allSelected = selectedMonths.size === MONTHS.length;
    allCheckbox.checked = allSelected;

    if (!allSelected) {
      monthCheckboxes.forEach((cb) => {
        cb.checked = selectedMonths.has(Number(cb.value));
      });
    }
  }

  if (selectedMonths.size !== MONTHS.length) {
    allCheckbox.checked = false;
  }

  render();
}

function getSelectedMonthIndexes() {
  return [...selectedMonths].sort((a, b) => a - b);
}

function aggregate(indexes) {
  const totalShipments = indexes.reduce((sum, i) => sum + DATA[i].shipments, 0);
  const weightedOnTime =
    totalShipments === 0
      ? 0
      : indexes.reduce((sum, i) => sum + DATA[i].onTimeRate * DATA[i].shipments, 0) / totalShipments;

  const avgRegional = indexes.reduce((sum, i) => sum + DATA[i].regionalScore, 0) / indexes.length;
  const totalExceptions = indexes.reduce((sum, i) => sum + DATA[i].exceptions, 0);

  return {
    shipments: totalShipments,
    onTimeRate: weightedOnTime,
    regionalScore: avgRegional,
    exceptions: totalExceptions,
  };
}

function getComparisonIndexes(indexes) {
  if (indexes.length === MONTHS.length) {
    return null;
  }

  if (indexes.length === 1) {
    const prev = indexes[0] - 1;
    return prev >= 0 ? [prev] : null;
  }

  const start = indexes[0];
  const period = indexes.length;
  const prevStart = start - period;

  if (prevStart < 0) {
    return null;
  }

  const expected = Array.from({ length: period }, (_, idx) => start + idx);
  const isContiguous = indexes.every((value, idx) => value === expected[idx]);

  if (!isContiguous) {
    return null;
  }

  return Array.from({ length: period }, (_, idx) => prevStart + idx);
}

function pctDelta(current, previous) {
  if (!previous || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function getChangeClass(delta, lowerIsBetter = false) {
  if (delta === null) {
    return "neutral";
  }

  if (delta === 0) {
    return "neutral";
  }

  if (lowerIsBetter) {
    return delta < 0 ? "positive" : "negative";
  }

  return delta > 0 ? "positive" : "negative";
}

function getArrow(delta, lowerIsBetter = false) {
  if (delta === null || delta === 0) {
    return "-";
  }

  if (lowerIsBetter) {
    return delta < 0 ? "▼" : "▲";
  }

  return delta > 0 ? "▲" : "▼";
}

function renderCard(el, title, value, delta, lowerIsBetter = false) {
  const changeClass = getChangeClass(delta, lowerIsBetter);
  const deltaText =
    delta === null
      ? "No prior comparison"
      : `${getArrow(delta, lowerIsBetter)} ${Math.abs(delta).toFixed(1)}% vs previous`;

  el.innerHTML = `
    <p class="metric-title">${title}</p>
    <p class="metric-value">${value}</p>
    <p class="metric-change ${changeClass}">${deltaText}</p>
  `;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function renderCards(indexes) {
  const current = aggregate(indexes);
  const comparisonIndexes = getComparisonIndexes(indexes);
  const previous = comparisonIndexes ? aggregate(comparisonIndexes) : null;

  const shipmentDelta = previous ? pctDelta(current.shipments, previous.shipments) : null;
  const onTimeDelta = previous ? pctDelta(current.onTimeRate, previous.onTimeRate) : null;
  const regionalDelta = previous ? pctDelta(current.regionalScore, previous.regionalScore) : null;
  const exceptionsDelta = previous ? pctDelta(current.exceptions, previous.exceptions) : null;

  renderCard(cardShipments, "Shipment Volume", formatNumber(current.shipments), shipmentDelta);
  renderCard(cardOnTime, "On-Time Delivery Rate", `${current.onTimeRate.toFixed(1)}%`, onTimeDelta);
  renderCard(cardRegional, "Regional Performance Index", current.regionalScore.toFixed(1), regionalDelta);
  renderCard(cardExceptions, "Open Exceptions", formatNumber(current.exceptions), exceptionsDelta, true);
}

function buildRegionTotals(indexes) {
  const totals = { West: 0, Midwest: 0, South: 0, East: 0 };

  indexes.forEach((i) => {
    Object.keys(totals).forEach((region) => {
      totals[region] += DATA[i].regions[region];
    });
  });

  return totals;
}

function renderCharts(indexes) {
  const regionTotals = buildRegionTotals(indexes);
  const labels = indexes.map((i) => MONTHS[i]);

  if (barChart) {
    barChart.destroy();
  }

  if (lineChart) {
    lineChart.destroy();
  }

  barChart = new Chart(document.getElementById("shipmentBarChart"), {
    type: "bar",
    data: {
      labels: Object.keys(regionTotals),
      datasets: [
        {
          label: "Shipments",
          data: Object.values(regionTotals),
          borderRadius: 8,
          backgroundColor: ["#2e6ea6", "#89b5dc", "#f7931e", "#f4c542"],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#e4edf5" },
        },
      },
    },
  });

  lineChart = new Chart(document.getElementById("trendLineChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Shipment Volume",
          data: indexes.map((i) => DATA[i].shipments),
          borderColor: "#2e6ea6",
          backgroundColor: "rgba(46, 110, 166, 0.15)",
          yAxisID: "y",
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: "On-Time Delivery %",
          data: indexes.map((i) => DATA[i].onTimeRate),
          borderColor: "#f7931e",
          backgroundColor: "rgba(247, 147, 30, 0.12)",
          yAxisID: "y1",
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          position: "left",
          beginAtZero: true,
          grid: { color: "#e4edf5" },
          title: { display: true, text: "Shipments" },
        },
        y1: {
          position: "right",
          min: 88,
          max: 96,
          grid: { drawOnChartArea: false },
          title: { display: true, text: "On-Time %" },
        },
      },
    },
  });
}

function updateFilterLabel(indexes) {
  const allSelected = indexes.length === MONTHS.length;
  if (allSelected) {
    monthToggle.textContent = "All months";
    return;
  }

  if (indexes.length === 1) {
    monthToggle.textContent = MONTHS[indexes[0]];
    return;
  }

  monthToggle.textContent = `${indexes.length} months selected`;
}

function render() {
  const indexes = getSelectedMonthIndexes();
  renderCards(indexes);
  renderCharts(indexes);
  updateFilterLabel(indexes);
}

monthToggle.addEventListener("click", () => {
  const isOpen = monthMenu.classList.toggle("open");
  monthToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!monthMenu.contains(event.target) && !monthToggle.contains(event.target)) {
    monthMenu.classList.remove("open");
    monthToggle.setAttribute("aria-expanded", "false");
  }
});

buildMonthMenu();
render();
