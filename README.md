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
