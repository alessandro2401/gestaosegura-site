import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Dados para o gráfico
etapas = ['Abertura', 'Validação\nDocumental', 'Análise\nTécnica', 'Cotação', 'Aprovação', 'Conclusão']
tempo_antes = [0.5, 1.5, 2.5, 1.5, 1.0, 0.5]  # Tempo médio em dias antes do novo POP
tempo_depois = [0.5, 3.0, 4.0, 3.0, 2.5, 1.0]  # Tempo médio em dias após o novo POP

# Configuração da figura
plt.figure(figsize=(12, 8))
plt.title('Identificação de Gargalos no Fluxo de Processos', fontsize=16, fontweight='bold')

# Criar barras
x = np.arange(len(etapas))
width = 0.35

# Barras para antes e depois do novo POP
bars1 = plt.bar(x - width/2, tempo_antes, width, label='Antes do Novo POP', color='#1a5276')
bars2 = plt.bar(x + width/2, tempo_depois, width, label='Após o Novo POP', color='#e74c3c')

# Adicionar rótulos e legendas
plt.xlabel('Etapas do Processo', fontsize=12)
plt.ylabel('Tempo Médio (dias)', fontsize=12)
plt.xticks(x, etapas)
plt.legend()

# Adicionar grid
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Adicionar valores nas barras
def add_labels(bars):
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                f'{height:.1f}',
                ha='center', va='bottom')

add_labels(bars1)
add_labels(bars2)

# Destacar os gargalos
plt.annotate('Gargalo Principal', xy=(1.2, tempo_depois[1]), 
             xytext=(1.5, tempo_depois[1] + 1.5),
             arrowprops=dict(facecolor='black', shrink=0.05),
             fontsize=10, fontweight='bold')

plt.annotate('Gargalo Secundário', xy=(2.2, tempo_depois[2]), 
             xytext=(2.5, tempo_depois[2] + 1.5),
             arrowprops=dict(facecolor='black', shrink=0.05),
             fontsize=10, fontweight='bold')

plt.annotate('Gargalo Terciário', xy=(3.2, tempo_depois[3]), 
             xytext=(3.5, tempo_depois[3] + 1.5),
             arrowprops=dict(facecolor='black', shrink=0.05),
             fontsize=10, fontweight='bold')

# Adicionar anotações explicativas
plt.figtext(0.5, 0.01, 
         'Fonte: Análise da planilha de controle da Gestão Segura (Junho-Setembro 2025)\n'
         'Nota: Os gargalos representam pontos de acúmulo no fluxo de processos, onde o tempo de processamento aumentou significativamente',
         ha='center', fontsize=10)

# Adicionar área sombreada para destacar os principais gargalos
plt.axvspan(0.5, 3.5, alpha=0.1, color='red')

# Ajustar layout
plt.tight_layout()
plt.subplots_adjust(bottom=0.15)

# Salvar a figura
plt.savefig('/home/ubuntu/site_unificado/images/graficos_fluxo/gargalos_fluxo_processos.png', dpi=300, bbox_inches='tight')
plt.close()

print("Gráfico de gargalos no fluxo gerado com sucesso!")
