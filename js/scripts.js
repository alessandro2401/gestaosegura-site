document.addEventListener('DOMContentLoaded', function() {
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
  
  // Charts
  if (document.getElementById('responsibilityChart')) {
    const responsibilityCtx = document.getElementById('responsibilityChart').getContext('2d');
    new Chart(responsibilityCtx, {
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
  
  if (document.getElementById('impactChart')) {
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    new Chart(impactCtx, {
      type: 'bar',
      data: {
        labels: ['Junho', 'Julho', 'Agosto', 'Setembro (Novo POP)'],
        datasets: [
          {
            label: 'Tempo Médio de Processamento (dias)',
            data: [7, 8, 9, 14],
            backgroundColor: [
              'rgba(26, 82, 118, 0.7)',
              'rgba(26, 82, 118, 0.7)',
              'rgba(26, 82, 118, 0.7)',
              'rgba(231, 76, 60, 0.7)'
            ],
            borderColor: [
              'rgba(26, 82, 118, 1)',
              'rgba(26, 82, 118, 1)',
              'rgba(26, 82, 118, 1)',
              'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 1
          }
        ]
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
  
  if (document.getElementById('complexityChart')) {
    const complexityCtx = document.getElementById('complexityChart').getContext('2d');
    new Chart(complexityCtx, {
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
  
  if (document.getElementById('efficiencyChart')) {
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
    new Chart(efficiencyCtx, {
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
  
  if (document.getElementById('statusChart')) {
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: ['Concluído', 'Em análise'],
        datasets: [
          {
            data: [73, 27],
            backgroundColor: [
              'rgba(46, 204, 113, 0.7)',
              'rgba(231, 76, 60, 0.7)'
            ],
            borderColor: [
              'rgba(46, 204, 113, 1)',
              'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  if (document.getElementById('statusEvolutionChart')) {
    const statusEvolutionCtx = document.getElementById('statusEvolutionChart').getContext('2d');
    new Chart(statusEvolutionCtx, {
      type: 'bar',
      data: {
        labels: ['Junho', 'Julho', 'Agosto', 'Setembro'],
        datasets: [
          {
            label: 'Concluído (%)',
            data: [85, 80, 75, 29],
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          },
          {
            label: 'Em análise (%)',
            data: [15, 20, 25, 71],
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 1
          }
        ]
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
});
