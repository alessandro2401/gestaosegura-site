# Configuração de DNS para o Subdomínio www.gestaosegura.administradoramutual.com.br

Este documento fornece instruções detalhadas para configurar o DNS do subdomínio `www.gestaosegura.administradoramutual.com.br` para apontar para o site hospedado no Vercel.

## Opção 1: Configuração com Registro CNAME (Recomendado)

1. Acesse o painel de controle DNS do seu provedor de domínio para `administradoramutual.com.br`
2. Adicione um novo registro CNAME com as seguintes configurações:

```
Tipo: CNAME
Nome/Host: www.gestaosegura
Valor/Destino: cname.vercel-dns.com
TTL: 3600 (ou Auto)
```

3. Salve as alterações e aguarde a propagação do DNS (pode levar até 48 horas)

## Opção 2: Configuração com Registro A

Se não for possível usar um registro CNAME, você pode configurar registros A:

1. Acesse o painel de controle DNS do seu provedor de domínio
2. Adicione os seguintes registros A:

```
Tipo: A
Nome/Host: www.gestaosegura
Valor/Destino: 76.76.21.21
TTL: 3600 (ou Auto)
```

## Verificação da Configuração de DNS

Após configurar o DNS, você pode verificar se a configuração está correta usando os seguintes comandos:

```bash
# Verificar registro CNAME
dig CNAME www.gestaosegura.administradoramutual.com.br

# Verificar registro A
dig A www.gestaosegura.administradoramutual.com.br
```

Ou use ferramentas online como:
- https://dnschecker.org
- https://mxtoolbox.com/DNSLookup.aspx

## Configuração no Vercel

1. No painel do Vercel, acesse o projeto "gestaosegura"
2. Vá para "Settings" > "Domains"
3. Adicione o domínio: `www.gestaosegura.administradoramutual.com.br`
4. O Vercel verificará automaticamente a configuração do DNS
5. Se a verificação falhar, siga as instruções fornecidas pelo Vercel

## Solução de Problemas Comuns

### O domínio não está verificando no Vercel

- Verifique se os registros DNS foram configurados corretamente
- Aguarde mais tempo para a propagação do DNS (até 48 horas)
- Verifique se não há conflitos com outros registros DNS

### Erro de SSL/TLS

- O Vercel provisiona certificados SSL automaticamente
- Certifique-se de que não há redirecionamentos conflitantes
- Verifique se o domínio está corretamente configurado no Vercel

### Página não encontrada (404)

- Verifique se o site foi implantado corretamente no Vercel
- Confirme se o domínio está apontando para o projeto correto
- Verifique se há regras de redirecionamento conflitantes

## Suporte

Para qualquer dúvida ou problema durante a configuração do DNS, entre em contato com a equipe de suporte técnico.
