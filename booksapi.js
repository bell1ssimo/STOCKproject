const { Chart } = require('chart.js');

async function renderChart(ctx, timestamps, openValues) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Open Value',
                data: openValues,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Timestamp'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Open Value'
                    }
                }
            }
        }
    });
}

module.exports = renderChart;
