/**
 * Script para remover badges injetadas por extensões ou scripts externos
 * Executa continuamente para garantir que badges não reapareçam
 */

(function() {
  'use strict';
  
  /**
   * Remove badges e elementos indesejados dos links de navegação
   */
  function removeBadges() {
    // Selecionar todos os links do menu
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
      // Remover atributos de dados que possam estar adicionando badges
      link.removeAttribute('data-badge');
      link.removeAttribute('data-count');
      link.removeAttribute('data-label');
      
      // Remover elementos filhos que não sejam texto
      Array.from(link.children).forEach(child => {
        // Se o elemento filho não for um nó de texto, remover
        if (child.nodeType !== Node.TEXT_NODE) {
          // Verificar se é uma badge (span, div com estilos de posicionamento)
          const style = window.getComputedStyle(child);
          if (style.position === 'absolute' || 
              child.tagName === 'SPAN' && child.className.includes('badge') ||
              child.tagName === 'DIV' && child.className.includes('badge')) {
            child.remove();
          }
        }
      });
      
      // Limpar estilos inline indesejados (exceto para btn-voltar)
      if (!link.classList.contains('btn-voltar')) {
        // Preservar apenas classes, remover estilos inline
        const classes = link.className;
        if (link.hasAttribute('style')) {
          const currentStyle = link.getAttribute('style');
          // Se o estilo não for o do btn-voltar, remover
          if (!currentStyle.includes('linear-gradient')) {
            link.removeAttribute('style');
          }
        }
      }
    });
  }
  
  /**
   * Observador de mutações para detectar quando badges são injetadas
   */
  function setupMutationObserver() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      
      mutations.forEach((mutation) => {
        // Verificar se houve adição de nós
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            // Se um elemento foi adicionado dentro de um link
            if (node.parentElement && node.parentElement.tagName === 'A') {
              shouldClean = true;
            }
          });
        }
        
        // Verificar se houve mudança de atributos
        if (mutation.type === 'attributes' && 
            mutation.target.tagName === 'A' &&
            (mutation.attributeName === 'data-badge' || 
             mutation.attributeName === 'data-count' ||
             mutation.attributeName === 'style')) {
          shouldClean = true;
        }
      });
      
      if (shouldClean) {
        removeBadges();
      }
    });
    
    // Configurar observador para monitorar mudanças no nav
    observer.observe(nav, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-badge', 'data-count', 'data-label', 'style', 'class']
    });
  }
  
  /**
   * Limpar badges periodicamente como fallback
   */
  function setupPeriodicCleaning() {
    // Limpar a cada 500ms nos primeiros 5 segundos
    let count = 0;
    const interval = setInterval(() => {
      removeBadges();
      count++;
      if (count >= 10) {
        clearInterval(interval);
        // Depois, limpar apenas a cada 5 segundos
        setInterval(removeBadges, 5000);
      }
    }, 500);
  }
  
  /**
   * Inicializar limpeza
   */
  function init() {
    // Remover badges imediatamente
    removeBadges();
    
    // Configurar observador de mutações
    setupMutationObserver();
    
    // Configurar limpeza periódica
    setupPeriodicCleaning();
  }
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Executar também após o carregamento completo da página
  window.addEventListener('load', () => {
    setTimeout(removeBadges, 100);
    setTimeout(removeBadges, 500);
    setTimeout(removeBadges, 1000);
  });
  
})();
