/**
 * Script para melhorar visualização de gráficos e imagens
 */

(function() {
  'use strict';
  
  /**
   * Adicionar zoom em imagens ao clicar
   */
  function setupImageZoom() {
    // Criar modal para zoom
    const modal = document.createElement('div');
    modal.id = 'image-zoom-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.95);
      cursor: zoom-out;
    `;
    
    const modalImg = document.createElement('img');
    modalImg.style.cssText = `
      margin: auto;
      display: block;
      max-width: 95%;
      max-height: 95%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 8px;
    `;
    
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 40px;
      color: #fff;
      font-size: 50px;
      font-weight: bold;
      cursor: pointer;
      z-index: 10001;
    `;
    
    modal.appendChild(modalImg);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Adicionar evento de clique nas imagens
    const chartImages = document.querySelectorAll('.chart-image');
    chartImages.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.title = 'Clique para ampliar';
      
      img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        modalImg.alt = this.alt;
        document.body.style.overflow = 'hidden';
      });
    });
    
    // Fechar modal ao clicar
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    
    modal.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
      }
    });
  }
  
  /**
   * Melhorar configuração padrão dos gráficos Chart.js
   */
  function improveChartDefaults() {
    if (typeof Chart === 'undefined') return;
    
    // Configurações globais para melhor legibilidade
    Chart.defaults.font.size = 14;
    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.color = '#2c3e50';
    
    // Melhorar tooltips
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.titleFont = { size: 15, weight: 'bold' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 14 };
    
    // Melhorar legendas
    Chart.defaults.plugins.legend.labels.padding = 15;
    Chart.defaults.plugins.legend.labels.font = { size: 14, weight: '500' };
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
  }
  
  /**
   * Ajustar responsividade dos gráficos
   */
  function makeChartsResponsive() {
    const canvases = document.querySelectorAll('.chart-container canvas');
    
    canvases.forEach(canvas => {
      // Garantir que o canvas seja responsivo
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      
      // Adicionar classe para melhor controle
      canvas.parentElement.classList.add('chart-wrapper');
    });
  }
  
  /**
   * Adicionar indicador de carregamento nos gráficos
   */
  function addLoadingIndicators() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
      const canvas = container.querySelector('canvas');
      if (!canvas) return;
      
      // Verificar se o gráfico já foi renderizado
      if (!canvas.chart) {
        // Adicionar spinner de carregamento
        const loader = document.createElement('div');
        loader.className = 'chart-loader';
        loader.style.cssText = `
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        `;
        loader.innerHTML = '<i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top: 15px;">Carregando gráfico...</p>';
        
        canvas.style.display = 'none';
        container.insertBefore(loader, canvas);
        
        // Remover loader quando o gráfico carregar
        const checkInterval = setInterval(() => {
          if (canvas.chart || canvas.style.display !== 'none') {
            loader.remove();
            canvas.style.display = 'block';
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Timeout de segurança
        setTimeout(() => {
          if (loader.parentElement) {
            loader.remove();
            canvas.style.display = 'block';
          }
          clearInterval(checkInterval);
        }, 5000);
      }
    });
  }
  
  /**
   * Inicializar melhorias
   */
  function init() {
    // Melhorar configurações padrão do Chart.js
    improveChartDefaults();
    
    // Configurar zoom nas imagens
    setupImageZoom();
    
    // Tornar gráficos responsivos
    makeChartsResponsive();
    
    // Adicionar indicadores de carregamento
    addLoadingIndicators();
  }
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Executar também após o carregamento completo
  window.addEventListener('load', () => {
    setTimeout(init, 100);
  });
  
})();
