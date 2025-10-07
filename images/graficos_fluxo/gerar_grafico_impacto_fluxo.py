import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import FancyArrowPatch

# Dados para o gráfico
meses = ['Junho', 'Julho', 'Agosto', 'Setembro']
tempo_processamento = [7, 8, 9, 14]
processos_em_analise = [15, 20, 25, 71]
processos_concluidos = [85, 80, 75, 29]

# Configuração da figura
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10), gridspec_kw={'height_ratios': [1, 1]})
fig.suptitle('Impacto do Novo POP no Fluxo de Processos', fontsize=16, fontweight='bold')

# Gráfico 1: Tempo médio de processamento
ax1.bar(meses, tempo_processamento, color=['#1a5276', '#1a5276', '#1a5276', '#e74c3c'])
ax1.set_ylabel('Dias', fontsize=12)
ax1.set_title('Tempo Médio de Processamento', fontsize=14)
ax1.grid(axis='y', linestyle='--', alpha=0.7)

# Adicionar valores nas barras
for i, v in enumerate(tempo_processamento):
    ax1.text(i, v + 0.5, str(v), ha='center', fontweight='bold')

# Destacar o aumento percentual
ax1.annotate('+56%', xy=(3, tempo_processamento[3]), 
             xytext=(3.3, tempo_processamento[3] + 3),
             arrowprops=dict(facecolor='black', shrink=0.05, width=1.5),
             fontsize=12, fontweight='bold')

# Gráfico 2: Distribuição de status
ax2.bar(meses, processos_concluidos, label='Concluído', color='#2ecc71')
ax2.bar(meses, processos_em_analise, bottom=processos_concluidos, label='Em análise', color='#e74c3c')
ax2.set_ylabel('Percentual (%)', fontsize=12)
ax2.set_title('Distribuição de Status dos Processos', fontsize=14)
ax2.grid(axis='y', linestyle='--', alpha=0.7)
ax2.legend(loc='upper left')

# Adicionar valores nas barras
for i, (c, a) in enumerate(zip(processos_concluidos, processos_em_analise)):
    # Valor para processos concluídos
    ax2.text(i, c/2, f"{c}%", ha='center', va='center', color='white', fontweight='bold')
    # Valor para processos em análise
    ax2.text(i, c + a/2, f"{a}%", ha='center', va='center', color='white', fontweight='bold')

# Adicionar linha vertical indicando a implementação do novo POP
for ax in [ax1, ax2]:
    ax.axvline(x=2.5, color='red', linestyle='--', linewidth=2)
    ax.text(2.5, ax.get_ylim()[1]*0.95, 'Novo POP\n25/09/2025', 
            ha='center', va='top', color='red', fontweight='bold',
            bbox=dict(facecolor='white', alpha=0.8, edgecolor='red'))

# Adicionar anotações explicativas
fig.text(0.5, 0.01, 
         'Fonte: Análise da planilha de controle da Gestão Segura (Junho-Setembro 2025)\n'
         'Nota: Observa-se correlação direta entre a implementação do novo POP e as mudanças nos indicadores operacionais',
         ha='center', fontsize=10)

# Ajustar layout
plt.tight_layout()
plt.subplots_adjust(top=0.9, bottom=0.1)

# Salvar a figura
plt.savefig('/home/ubuntu/site_unificado/images/graficos_fluxo/impacto_pop_fluxo_processos.png', dpi=300, bbox_inches='tight')
plt.close()

print("Gráfico de impacto do novo POP no fluxo gerado com sucesso!")
