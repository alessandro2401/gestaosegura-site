// Variável global para armazenar a instância da integração
let sheetsIntegration;
let chartsInstances = {};

// ID da planilha do Google Sheets
const SPREADSHEET_ID = '1X0zBNRqsqUSh1roe2svI5JrkY-AeKCM941JRDKWsizw';

document.addEventListener('DOMContentLoaded', async function() {
  // Inicializar integração com Google Sheets
  sheetsIntegration = new SheetsIntegration(SPREADSHEET_ID);
  
  // Mostrar indicador de carregamento
  showLoadingIndicator();
  
  try {
    // Carregar dados da planilha
    await sheetsIntegration.loadData();
    
    // Atualizar gráficos com dados reais
    updateChartsWithRealData();
    
    // Atualizar informações de última atualização
    updateLastUpdateInfo();
    
    hideLoadingIndicator();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    hideLoadingIndicator();
    showErrorMessage('Erro ao carregar dados da planilha. Usando dados de exemplo.');
    
    // Usar dados estáticos como fallback
    initializeStaticCharts();
  }
  
  // Inicializar funcionalidades da página
  initializePageFeatures();
});

/**
 * Atualiza os gráficos com dados reais da planilha
 */
function updateChartsWithRealData() {
  const statusData = sheetsIntegration.getStatusChartData();
  const temporalData = sheetsIntegration.getTemporalChartData();
  
  if (statusData) {
    updateStatusChart(statusData);
    updateStatusEvolutionChart(temporalData);
  }
  
  if (temporalData) {
    updateImpactChart(temporalData);
  }
  
  // Manter gráficos estáticos que não dependem da planilha
  initializeStaticCharts();
}

/**
 * Atualiza o gráfico de status (pizza)
 */
function updateStatusChart(statusData) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  
  // Cores para diferentes status
  const colors = {
    'Concluído': 'rgba(46, 204, 113, 0.7)',
    'Em análise': 'rgba(231, 76, 60, 0.7)',
    'Cancelado': 'rgba(241, 196, 15, 0.7)',
    'default': 'rgba(149, 165, 166, 0.7)'
  };
  
  const borderColors = {
    'Concluído': 'rgba(46, 204, 113, 1)',
    'Em análise': 'rgba(231, 76, 60, 1)',
    'Cancelado': 'rgba(241, 196, 15, 1)',
    'default': 'rgba(149, 165, 166, 1)'
  };
  
  const backgroundColors = statusData.labels.map(label => colors[label] || colors.default);
  const borderColorsList = statusData.labels.map(label => borderColors[label] || borderColors.default);
  
  if (chartsInstances.statusChart) {
    chartsInstances.statusChart.destroy();
  }
  
  chartsInstances.statusChart = new Chart(ctx.getContext('2d'), {
    type: 'pie',
    data: {
      labels: statusData.labels,
      datasets: [{
        data: statusData.data,
        backgroundColor: backgroundColors,
        borderColor: borderColorsList,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = statusData.percentages[context.dataIndex];
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Atualiza o gráfico de evolução de status por mês
 */
function updateStatusEvolutionChart(temporalData) {
  const ctx = document.getElementById('statusEvolutionChart');
  if (!ctx || !temporalData) return;
  
  if (chartsInstances.statusEvolutionChart) {
    chartsInstances.statusEvolutionChart.destroy();
  }
  
  const datasets = [];
  
  // Adicionar dataset para "Concluído"
  if (temporalData.statusData['Concluído']) {
    datasets.push({
      label: 'Concluído (%)',
      data: temporalData.statusData['Concluído'],
      backgroundColor: 'rgba(46, 204, 113, 0.7)',
      borderColor: 'rgba(46, 204, 113, 1)',
      borderWidth: 1
    });
  }
  
  // Adicionar dataset para "Em análise"
  if (temporalData.statusData['Em análise']) {
    datasets.push({
      label: 'Em análise (%)',
      data: temporalData.statusData['Em análise'],
      backgroundColor: 'rgba(231, 76, 60, 0.7)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 1
    });
  }
  
  // Adicionar dataset para "Cancelado"
  if (temporalData.statusData['Cancelado']) {
    datasets.push({
      label: 'Cancelado (%)',
      data: temporalData.statusData['Cancelado'],
      backgroundColor: 'rgba(241, 196, 15, 0.7)',
      borderColor: 'rgba(241, 196, 15, 1)',
      borderWidth: 1
    });
  }
  
  chartsInstances.statusEvolutionChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: temporalData.meses,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Percentual (%)'
          }
        }
      }
    }
  });
}

/**
 * Atualiza o gráfico de impacto (tempo médio)
 */
function updateImpactChart(temporalData) {
  const ctx = document.getElementById('impactChart');
  if (!ctx || !temporalData) return;
  
  if (chartsInstances.impactChart) {
    chartsInstances.impactChart.destroy();
  }
  
  // Destacar o último mês em vermelho
  const colors = temporalData.tempoMedio.map((val, idx) => {
    return idx === temporalData.tempoMedio.length - 1 
      ? 'rgba(231, 76, 60, 0.7)' 
      : 'rgba(26, 82, 118, 0.7)';
  });
  
  const borderColors = temporalData.tempoMedio.map((val, idx) => {
    return idx === temporalData.tempoMedio.length - 1 
      ? 'rgba(231, 76, 60, 1)' 
      : 'rgba(26, 82, 118, 1)';
  });
  
  chartsInstances.impactChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: temporalData.meses,
      datasets: [{
        label: 'Tempo Médio de Processamento (dias)',
        data: temporalData.tempoMedio,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Dias'
          }
        }
      }
    }
  });
}

/**
 * Inicializa gráficos estáticos (que não dependem da planilha)
 */
function initializeStaticCharts() {
  // Gráfico de responsabilidade
  if (document.getElementById('responsibilityChart') && !chartsInstances.responsibilityChart) {
    const responsibilityCtx = document.getElementById('responsibilityChart').getContext('2d');
    chartsInstances.responsibilityChart = new Chart(responsibilityCtx, {
      type: 'radar',
      data: {
        labels: ['Gestão Segura', 'Associação', 'Oficina', 'Sistemas Automatizados', 'Fornecedores'],
        datasets: [
          {
            label: 'POP Original',
            data: [80, 40, 60, 10, 30],
            backgroundColor: 'rgba(26, 82, 118, 0.2)',
            borderColor: 'rgba(26, 82, 118, 1)',
            pointBackgroundColor: 'rgba(26, 82, 118, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(26, 82, 118, 1)'
          },
          {
            label: 'POP Atualizado',
            data: [60, 70, 40, 50, 60],
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderColor: 'rgba(46, 204, 113, 1)',
            pointBackgroundColor: 'rgba(46, 204, 113, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
  
  // Gráfico de complexidade
  if (document.getElementById('complexityChart') && !chartsInstances.complexityChart) {
    const complexityCtx = document.getElementById('complexityChart').getContext('2d');
    chartsInstances.complexityChart = new Chart(complexityCtx, {
      type: 'radar',
      data: {
        labels: ['Documentação', 'Comunicação', 'Sistemas', 'Validação', 'Responsabilidades'],
        datasets: [
          {
            label: 'POP Original',
            data: [40, 50, 30, 60, 45],
            backgroundColor: 'rgba(26, 82, 118, 0.2)',
            borderColor: 'rgba(26, 82, 118, 1)',
            pointBackgroundColor: 'rgba(26, 82, 118, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(26, 82, 118, 1)'
          },
          {
            label: 'POP Atualizado',
            data: [85, 75, 80, 90, 70],
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderColor: 'rgba(46, 204, 113, 1)',
            pointBackgroundColor: 'rgba(46, 204, 113, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
  
  // Gráfico de eficiência
  if (document.getElementById('efficiencyChart') && !chartsInstances.efficiencyChart) {
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
    chartsInstances.efficiencyChart = new Chart(efficiencyCtx, {
      type: 'line',
      data: {
        labels: ['Implementação', '1 mês', '3 meses', '6 meses', '12 meses'],
        datasets: [
          {
            label: 'Eficiência Projetada (%)',
            data: [70, 75, 85, 100, 110],
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: 'rgba(46, 204, 113, 1)',
            pointBorderColor: '#fff',
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Eficiência Original (100%)',
            data: [100, 100, 100, 100, 100],
            backgroundColor: 'rgba(26, 82, 118, 0.1)',
            borderColor: 'rgba(26, 82, 118, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 120,
            title: {
              display: true,
              text: 'Eficiência (%)'
            }
          }
        }
      }
    });
  }
}

/**
 * Inicializa funcionalidades da página
 */
function initializePageFeatures() {
  // Tabs functionality
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Show the selected tab content
      document.getElementById(target).classList.add('active');
      
      // Add active class to the clicked tab
      tab.classList.add('active');
    });
  });
  
  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
    
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Active navigation based on scroll position
  const sections = document.querySelectorAll('section[id]');
  
  function highlightNavigation() {
    const scrollPosition = window.pageYOffset + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelector('nav ul li a[href="#' + sectionId + '"]')?.classList.add('active');
      } else {
        document.querySelector('nav ul li a[href="#' + sectionId + '"]')?.classList.remove('active');
      }
    });
  }
  
  window.addEventListener('scroll', highlightNavigation);
  
  // Animation on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in:not(.animated)');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('animated');
        element.style.opacity = 1;
      }
    });
  }
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Run once on page load
}

/**
 * Atualiza informação de última atualização
 */
function updateLastUpdateInfo() {
  const lastUpdate = sheetsIntegration.getLastUpdate();
  if (!lastUpdate) return;
  
  const updateBadge = document.querySelector('.update-badge');
  if (updateBadge) {
    const dateStr = lastUpdate.toLocaleDateString('pt-BR');
    const timeStr = lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    updateBadge.textContent = `Atualizado em ${dateStr} às ${timeStr}`;
  }
}

/**
 * Mostra indicador de carregamento
 */
function showLoadingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'loading-indicator';
  indicator.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: rgba(26, 82, 118, 0.95); color: white; padding: 15px; text-align: center; z-index: 9999; font-size: 14px;">
      <i class="fas fa-sync fa-spin"></i> Carregando dados da planilha...
    </div>
  `;
  document.body.appendChild(indicator);
}

/**
 * Esconde indicador de carregamento
 */
function hideLoadingIndicator() {
  const indicator = document.getElementById('loading-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Mostra mensagem de erro
 */
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: rgba(231, 76, 60, 0.95); color: white; padding: 15px; text-align: center; z-index: 9999; font-size: 14px;">
      <i class="fas fa-exclamation-triangle"></i> ${message}
    </div>
  `;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Função para recarregar dados (pode ser chamada manualmente)
async function reloadSheetData() {
  if (!sheetsIntegration) return;
  
  showLoadingIndicator();
  
  try {
    await sheetsIntegration.loadData();
    updateChartsWithRealData();
    updateLastUpdateInfo();
    hideLoadingIndicator();
  } catch (error) {
    console.error('Erro ao recarregar dados:', error);
    hideLoadingIndicator();
    showErrorMessage('Erro ao recarregar dados da planilha.');
  }
}

// Exportar função de reload para uso global
window.reloadSheetData = reloadSheetData;
