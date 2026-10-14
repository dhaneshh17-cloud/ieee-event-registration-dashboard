/**
 * Google Developer Groups (GDG) On Campus • MITS Gwalior - DevSummit 2026
 * Analytics & Interactive Charts (Chart.js)
 */

let trackChartInstance = null;
let yearChartInstance = null;

function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js library not loaded yet.');
    return;
  }

  const trackCanvas = document.getElementById('trackDistributionChart');
  const yearCanvas = document.getElementById('yearDistributionChart');

  if (!trackCanvas || !yearCanvas) return;

  const analytics = window.participantStore.getAnalytics();

  // Destroy previous instances if re-rendering
  if (trackChartInstance) trackChartInstance.destroy();
  if (yearChartInstance) yearChartInstance.destroy();

  // 1. Track Distribution Doughnut Chart
  const trackLabels = Object.keys(analytics.trackCounts);
  const trackData = Object.values(analytics.trackCounts);

  trackChartInstance = new Chart(trackCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Cloud & DevOps', 'Applied AI & ML', 'Android & Flutter', 'Web Systems'],
      datasets: [
        {
          data: trackData,
          backgroundColor: [
            '#4285F4', // Google Blue
            '#EA4335', // Google Red
            '#FBBC04', // Google Yellow
            '#34A853'  // Google Green
          ],
          borderColor: '#1E293B',
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94A3B8',
            font: { family: "'Inter', sans-serif", size: 11 },
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: '#0F172A',
          titleColor: '#F8FAFC',
          bodyColor: '#E2E8F0',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const val = context.raw || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${val} (${pct}%)`;
            }
          }
        }
      },
      cutout: '68%'
    }
  });

  // 2. Year of Study Bar Chart
  const yearLabels = Object.keys(analytics.yearCounts);
  const yearData = Object.values(analytics.yearCounts);

  yearChartInstance = new Chart(yearCanvas, {
    type: 'bar',
    data: {
      labels: yearLabels,
      datasets: [
        {
          label: 'Students Registered',
          data: yearData,
          backgroundColor: '#4285F4',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#94A3B8', font: { family: "'Inter', sans-serif", size: 11 } }
        },
        y: {
          beginAtZero: true,
          ticks: { 
            stepSize: 1,
            color: '#94A3B8', 
            font: { family: "'Space Grotesk', monospace", size: 11 } 
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F172A',
          titleColor: '#F8FAFC',
          bodyColor: '#E2E8F0',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10
        }
      }
    }
  });
}

function updateCharts() {
  if (!trackChartInstance || !yearChartInstance) {
    initCharts();
    return;
  }

  const analytics = window.participantStore.getAnalytics();
  trackChartInstance.data.datasets[0].data = Object.values(analytics.trackCounts);
  trackChartInstance.update();

  yearChartInstance.data.datasets[0].data = Object.values(analytics.yearCounts);
  yearChartInstance.update();
}

window.initCharts = initCharts;
window.updateCharts = updateCharts;
