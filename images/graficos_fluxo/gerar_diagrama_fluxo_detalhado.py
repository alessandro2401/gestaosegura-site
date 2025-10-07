import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch
import matplotlib.path as mpath
import matplotlib.patches as mpatches

# Configuração da figura
plt.figure(figsize=(14, 10))
plt.axis('off')

# Cores
cor_abertura = '#1a5276'  # Azul escuro
cor_processamento = '#2ecc71'  # Verde
cor_conclusao = '#e74c3c'  # Vermelho
cor_seta = '#7f8c8d'  # Cinza
cor_texto = '#2c3e50'  # Azul muito escuro
cor_fundo = '#f0f2f5'  # Cinza claro

# Configurar fundo
plt.gca().set_facecolor(cor_fundo)

# Função para criar caixas de processo
def criar_caixa(x, y, largura, altura, cor, texto, texto_secundario=None):
    rect = plt.Rectangle((x, y), largura, altura, facecolor=cor, alpha=0.8, edgecolor='black', linewidth=1, zorder=1)
    plt.gca().add_patch(rect)
    
    # Texto principal
    plt.text(x + largura/2, y + altura*0.6, texto, 
             ha='center', va='center', color='white', 
             fontsize=12, fontweight='bold', zorder=2)
    
    # Texto secundário (opcional)
    if texto_secundario:
        plt.text(x + largura/2, y + altura*0.3, texto_secundario, 
                 ha='center', va='center', color='white', 
                 fontsize=9, zorder=2)

# Função para criar setas
def criar_seta(x1, y1, x2, y2, estilo='arco', texto=None):
    if estilo == 'arco':
        # Seta em arco
        arrow = FancyArrowPatch((x1, y1), (x2, y2), 
                                connectionstyle="arc3,rad=0.3", 
                                arrowstyle="simple", 
                                color=cor_seta, 
                                linewidth=2, 
                                zorder=0)
        plt.gca().add_patch(arrow)
        
        # Ponto médio do arco para posicionar o texto
        meio_x = (x1 + x2) / 2 + 0.3 * (y2 - y1)  # Ajuste para o arco
        meio_y = (y1 + y2) / 2 + 0.3 * (x1 - x2)  # Ajuste para o arco
    else:
        # Seta reta
        plt.arrow(x1, y1, x2-x1, y2-y1, 
                  head_width=0.1, head_length=0.1, 
                  fc=cor_seta, ec=cor_seta, 
                  linewidth=2, 
                  length_includes_head=True, 
                  zorder=0)
        
        # Ponto médio da linha reta
        meio_x = (x1 + x2) / 2
        meio_y = (y1 + y2) / 2
    
    # Adicionar texto à seta
    if texto:
        plt.text(meio_x, meio_y, texto, 
                 ha='center', va='center', 
                 color=cor_texto, 
                 fontsize=9, 
                 bbox=dict(facecolor='white', alpha=0.7, edgecolor='none', boxstyle='round,pad=0.3'),
                 zorder=3)

# Criar caixas de processo principal
criar_caixa(2, 7, 2, 1, cor_abertura, "ABERTURA", "Registro inicial")
criar_caixa(6, 7, 2, 1, cor_processamento, "ANÁLISE", "Processamento")
criar_caixa(10, 7, 2, 1, cor_conclusao, "CONCLUSÃO", "Finalização")

# Criar setas principais
criar_seta(4, 7.5, 6, 7.5, 'reta', "7-14 dias")
criar_seta(8, 7.5, 10, 7.5, 'reta', "1-2 dias")

# Criar subprocessos de abertura
criar_caixa(1, 5.5, 1.2, 0.8, cor_abertura, "Registro", "SGA")
criar_caixa(2.4, 5.5, 1.2, 0.8, cor_abertura, "Protocolo", "A2025...")
criar_caixa(3.8, 5.5, 1.2, 0.8, cor_abertura, "Prazo", "Definição")

# Criar subprocessos de análise
criar_caixa(5.2, 5.5, 1.2, 0.8, cor_processamento, "Validação", "Documentos")
criar_caixa(6.6, 5.5, 1.2, 0.8, cor_processamento, "Cotação", "Fornecedores")
criar_caixa(8.0, 5.5, 1.2, 0.8, cor_processamento, "Aprovação", "Técnica")

# Criar subprocessos de conclusão
criar_caixa(9.4, 5.5, 1.2, 0.8, cor_conclusao, "Retorno", "Data efetiva")
criar_caixa(10.8, 5.5, 1.2, 0.8, cor_conclusao, "Status", "Concluído")
criar_caixa(12.2, 5.5, 1.2, 0.8, cor_conclusao, "Arquivo", "Documentação")

# Conectar processos principais aos subprocessos
criar_seta(3, 7, 3, 6.3, 'reta')
criar_seta(7, 7, 7, 6.3, 'reta')
criar_seta(11, 7, 11, 6.3, 'reta')

# Conectar subprocessos entre si
criar_seta(2.2, 5.9, 2.4, 5.9, 'reta')
criar_seta(3.6, 5.9, 3.8, 5.9, 'reta')
criar_seta(6.4, 5.9, 6.6, 5.9, 'reta')
criar_seta(7.8, 5.9, 8.0, 5.9, 'reta')
criar_seta(10.6, 5.9, 10.8, 5.9, 'reta')
criar_seta(12.0, 5.9, 12.2, 5.9, 'reta')

# Adicionar pontos de gargalo
plt.scatter([5.2, 8.0, 9.4], [5.1, 5.1, 5.1], color='#f39c12', s=300, marker='*', zorder=4)

# Adicionar legenda para gargalos
plt.text(5.2, 4.7, "Gargalo:\nValidação de\nDocumentos", ha='center', va='top', fontsize=8, color=cor_texto)
plt.text(8.0, 4.7, "Gargalo:\nAprovação\nTécnica", ha='center', va='top', fontsize=8, color=cor_texto)
plt.text(9.4, 4.7, "Gargalo:\nRegistro de\nRetorno", ha='center', va='top', fontsize=8, color=cor_texto)

# Adicionar indicadores de tempo
plt.text(3, 8.2, "Tempo médio antes do novo POP: 7-10 dias", ha='center', va='center', fontsize=10, 
         bbox=dict(facecolor='white', alpha=0.9, edgecolor=cor_abertura, boxstyle='round,pad=0.3'))
plt.text(10, 8.2, "Tempo médio após o novo POP: 14+ dias", ha='center', va='center', fontsize=10, 
         bbox=dict(facecolor='white', alpha=0.9, edgecolor=cor_conclusao, boxstyle='round,pad=0.3'))

# Adicionar título
plt.text(7, 9.5, "FLUXO DETALHADO DE PROCESSOS - GESTÃO SEGURA", 
         ha='center', va='center', fontsize=14, fontweight='bold', color=cor_texto)
plt.text(7, 9.0, "Baseado na análise da planilha de controle (Junho-Setembro 2025)", 
         ha='center', va='center', fontsize=10, color=cor_texto)

# Adicionar legenda
legend_elements = [
    mpatches.Patch(facecolor=cor_abertura, edgecolor='black', label='Fase de Abertura'),
    mpatches.Patch(facecolor=cor_processamento, edgecolor='black', label='Fase de Análise'),
    mpatches.Patch(facecolor=cor_conclusao, edgecolor='black', label='Fase de Conclusão'),
    plt.Line2D([0], [0], marker='*', color='w', markerfacecolor='#f39c12', markersize=15, label='Pontos de Gargalo')
]
plt.legend(handles=legend_elements, loc='lower center', bbox_to_anchor=(0.5, 0.02), ncol=4)

# Salvar a figura
plt.tight_layout()
plt.savefig('/home/ubuntu/site_unificado/images/graficos_fluxo/fluxo_detalhado_processos.png', dpi=300, bbox_inches='tight')
plt.close()

print("Diagrama de fluxo detalhado gerado com sucesso!")
