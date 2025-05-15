class DataVisualizer {
    constructor() {
      this.canvas = document.getElementById('chart-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.dataInput = document.getElementById('data-input');
      this.loadSampleBtn = document.getElementById('load-sample-btn');
      this.chartType = document.getElementById('chart-type');
      this.generateBtn = document.getElementById('generate-btn');
      this.exportBtn = document.getElementById('export-btn');
      this.importCsvBtn = document.getElementById('import-csv-btn');
      this.csvUpload = document.getElementById('csv-upload');
      this.colorScheme = document.getElementById('color-scheme');
      this.showLabels = document.getElementById('show-labels');
      this.showGrid = document.getElementById('show-grid');
      this.animate = document.getElementById('animate');
      this.fontSize = document.getElementById('font-size');
      
      this.chart = null;
      this.sampleData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sales 2023',
          data: [65, 59, 80, 81, 56]
        }]
      };
  
      this.initEventListeners();
      this.loadSampleData();
    }
  
    initEventListeners() {
      this.loadSampleBtn.addEventListener('click', () => this.loadSampleData());
      this.generateBtn.addEventListener('click', () => this.generateChart());
      this.exportBtn.addEventListener('click', () => this.exportChart());
      this.importCsvBtn.addEventListener('click', () => this.csvUpload.click());
      this.csvUpload.addEventListener('change', (e) => this.handleCsvUpload(e));
      this.colorScheme.addEventListener('change', () => this.updateColors());
      this.fontSize.addEventListener('input', () => this.updateFontSize());
    }
  
    loadSampleData() {
      this.dataInput.value = JSON.stringify(this.sampleData, null, 2);
      this.generateChart();
    }
  
    generateChart() {
      if (this.chart) {
        this.chart.destroy();
      }
  
      let config;
      try {
        const data = JSON.parse(this.dataInput.value);
        config = this.getChartConfig(data);
      } catch (e) {
        console.error("Invalid data format", e);
        return;
      }
  
      this.chart = new Chart(this.ctx, config);
      this.updateColors();
      this.updateFontSize();
    }
  
    handleCsvUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const parsedData = this.parseCSV(csvData);
        this.dataInput.value = JSON.stringify(parsedData, null, 2);
        this.generateChart();
      };
      reader.readAsText(file);
    }
  
    parseCSV(csvString) {
      const lines = csvString.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] ? values[index].trim() : '';
        });
        
        data.push(entry);
      }
      
      return this.convertToChartJSFormat(data);
    }
  
    convertToChartJSFormat(csvData) {
      if (!csvData.length) return { labels: [], datasets: [] };
      
      const numericFields = Object.keys(csvData[0]).filter(key => {
        return !isNaN(parseFloat(csvData[0][key])) && key.toLowerCase() !== 'month';
      });
      
      const labelField = Object.keys(csvData[0]).find(key => 
        key.toLowerCase().includes('month') || 
        key.toLowerCase().includes('date') || 
        key.toLowerCase().includes('label')
      );
      
      const labels = csvData.map(entry => entry[labelField] || '');
      
      const datasets = numericFields.map(field => ({
        label: field,
        data: csvData.map(entry => parseFloat(entry[field])),
        backgroundColor: this.getColorScheme('accent')[0]
      }));
      
      return { labels, datasets };
    }
  
    exportChart() {
      if (!this.chart) return;
      
      const link = document.createElement('a');
      link.download = `chart-${new Date().toISOString().slice(0,10)}.png`;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    }
  
    getChartConfig(data) {
      const type = this.chartType.value;
      return {
        type: type,
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: this.showLabels.checked,
              position: 'top',
              labels: {
                color: '#e0e0e0'
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: this.showGrid.checked ? 'rgba(255,255,255,0.1)' : 'transparent'
              },
              ticks: {
                color: '#e0e0e0'
              }
            },
            y: {
              grid: {
                color: this.showGrid.checked ? 'rgba(255,255,255,0.1)' : 'transparent'
              },
              ticks: {
                color: '#e0e0e0'
              }
            }
          },
          animation: {
            duration: this.animate.checked ? 1000 : 0
          }
        }
      };
    }
  
    updateColors() {
      if (!this.chart) return;
      const scheme = this.colorScheme.value;
      const colors = this.getColorScheme(scheme);
      this.chart.data.datasets.forEach((dataset, i) => {
        dataset.backgroundColor = colors[i % colors.length];
        dataset.borderColor = dataset.backgroundColor;
      });
      this.chart.update();
    }
  
    updateFontSize() {
      if (!this.chart) return;
      const size = parseInt(this.fontSize.value);
      const options = this.chart.options;
      options.plugins.legend.labels.font.size = size;
      options.scales.x.ticks.font.size = size;
      options.scales.y.ticks.font.size = size;
      this.chart.update();
    }
  
    getColorScheme(scheme) {
      switch(scheme) {
        case 'rainbow': return [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ];
        case 'mono': return [
          'rgba(200, 200, 200, 0.7)',
          'rgba(150, 150, 150, 0.7)',
          'rgba(100, 100, 100, 0.7)'
        ];
        default: return [
          'rgba(122, 90, 245, 0.7)',
          'rgba(74, 20, 140, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ];
      }
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new DataVisualizer();
  });