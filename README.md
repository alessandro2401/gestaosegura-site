# Site da Gestão Segura - Instruções de Implantação

Este pacote contém todos os arquivos necessários para implantar o site da Gestão Segura no subdomínio `www.gestaosegura.administradoramutual.com.br` utilizando o Vercel.

## Conteúdo do Pacote

- `index.html` - Página principal do site
- `pop_integrado.html` - Página do POP Integrado MMB-GS
- `css/` - Diretório contendo os estilos do site
- `js/` - Diretório contendo os scripts do site
- `images/` - Diretório contendo imagens, gráficos e diagramas

## Instruções para Implantação no Vercel

### 1. Preparação do Projeto

1. Faça login na sua conta do Vercel
2. Clique em "New Project" (Novo Projeto)
3. Importe este repositório ou faça upload dos arquivos deste pacote
4. Configure o nome do projeto como "gestaosegura"

### 2. Configuração da Implantação

1. Framework Preset: Selecione "Other" (Outro)
2. Build Command: Deixe em branco (não é necessário)
3. Output Directory: Deixe em branco (use o padrão)
4. Clique em "Deploy" (Implantar)

### 3. Configuração do Domínio Personalizado

1. Após a implantação, vá para a aba "Settings" (Configurações) do projeto
2. Navegue até "Domains" (Domínios)
3. Adicione o domínio: `www.gestaosegura.administradoramutual.com.br`
4. Siga as instruções para verificar a propriedade do domínio:
   - Adicione um registro CNAME no seu provedor de DNS apontando para `cname.vercel-dns.com`
   - Ou use os nameservers fornecidos pelo Vercel

### 4. Verificação da Implantação

1. Após a configuração do DNS, aguarde a propagação (pode levar até 48 horas)
2. Acesse `www.gestaosegura.administradoramutual.com.br` para verificar se o site está funcionando corretamente
3. Teste a navegação entre as diferentes seções e a visualização dos gráficos e diagramas

## Estrutura do Site

- **Página Inicial**: Análise completa dos POPs da Gestão Segura
  - Análise da Planilha de Controle
  - Fluxo de Processos
  - POP Original × Planilha Google
  - POP Novo × Planilha Google
  - Comparativo entre POPs
  - Evidências de Impacto
  - Recomendações Estratégicas
  - Conclusão

- **Página do POP Integrado**: Detalhes sobre o novo POP Integrado MMB-GS
  - Visão Geral
  - Sistema Integrado Tripartite (SIT)
  - Protocolo Unificado
  - Bifurcação de Fluxo
  - Gestão Baseada em KPIs
  - Plano de Implementação

## Requisitos Técnicos

- O site é estático e não requer backend
- Utiliza HTML5, CSS3 e JavaScript
- Compatível com todos os navegadores modernos
- Responsivo para visualização em dispositivos móveis

## Suporte

Para qualquer dúvida ou problema durante a implantação, entre em contato com a equipe de suporte técnico.

---

© 2025 Gestão Segura | Todos os direitos reservados



---

## 6. Visualização de Dados da Planilha (dados-planilha.html)

Esta seção detalha a nova página `dados-planilha.html`, que foi criada para exibir dados específicos da planilha do Google Sheets de forma interativa.

### 6.1. Visão Geral

A página oferece uma interface moderna para visualizar 8 colunas selecionadas da planilha de controle, com funcionalidades avançadas para facilitar a análise dos dados.

### 6.2. Funcionalidades Implementadas

| Funcionalidade | Descrição |
| :--- | :--- |
| **Visualização Específica** | Exibe apenas as 8 colunas solicitadas: `Data Sincronismo`, `Protocolo GS`, `Placa`, `Status`, `Data de retorno - GS`, `Dias de retorno`, `Vl Aprovado inicial` e `Valor Final Pago`. |
| **Busca Dinâmica** | Campo de busca que filtra os resultados em tempo real. |
| **Filtro por Status** | Dropdown para filtrar processos por status. |
| **Ordenação de Colunas** | Permite ordenar os dados clicando no cabeçalho de qualquer coluna. |
| **Paginação Completa** | Navegação entre páginas de resultados (50 itens por página). |
| **Painel de Estatísticas** | Cards com dados agregados (total de processos, finalizados, cancelados, etc.). |
| **Atualização em Tempo Real** | Exibe a data e hora da última sincronização. |

### 6.3. Estrutura e Sincronização

- **Página**: `/dados-planilha.html`
- **Script de Sincronização**: `/scripts/sync_sheets_data.py`
- **Arquivo de Dados**: `/data/processos.json`

O script Python busca os dados da planilha, filtra as colunas e gera o arquivo JSON que alimenta a página web.

