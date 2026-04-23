# Avaliação 2 - Arquitetura Distribuída (AWS Amplify)

## Deployment com AWS Amplify

### O que é AWS Amplify?

- Plataforma da AWS para build, deploy e hosting de aplicações web
- Integra-se com repositórios Git (GitHub, GitLab, Bitbucket)
- CI/CD automático a cada commit
- Hospedagem escalável de sites estáticos e dinâmicos
- Ideal para arquiteturas distribuídas

---

### Preparar o Projeto Localmente

- Criar repositório Git com o projeto (React, Vue, Angular, HTML, etc)
- Arquivo `package.json` (se aplicável)
- Script de build funcional (ex: `npm run build`)
- Pasta de saída definida (ex: `build/`, `dist/`, `public/`)
- Commit e push no repositório remoto (GitHub, GitLab, etc)

---

### Conectar Repositório ao Amplify

1. Acessar Console AWS → AWS Amplify
2. Clicar em "Create app"
3. Selecionar "Deploy an app"
4. Escolher provedor de repositório (GitHub, GitLab, Bitbucket)
5. Autorizar acesso à conta
6. Selecionar repositório e branch
7. Clicar em "Connect branch"

---

### Configurar Build e Deploy

- **Build settings:**
  - Framework: Selecionar framework (React, Vue, Next, Static, etc)
  - Build command: `npm run build` (ou equivalente)
  - Build output directory: `build/` ou `dist/`
  
- **Deploy settings:**
  - Revisão de imagem: ativar
  - Proteção por senha (opcional)
  - Variáveis de ambiente (se necessário)

---

### Monitorar Deploy

- Acessar "Deployments" no Amplify Console
- Visualizar status em tempo real (In Progress → Success/Failed)
- Logs disponíveis em caso de erro
- Histórico de deploys com datas e commits
- Rollback automático para versão anterior se necessário

---

### Acessar Aplicação Deployada

- URL padrão: `https://[branch-name].[app-id].amplifyapp.com`
- Ou domínio customizado (se configurado)
- Verificar em "Domain management"
- HTTPS ativado automaticamente
- Certificado SSL gerenciado pela AWS

---

### Solucionar Erros Comuns

| Erro | Solução |
|------|---------|
| Build failed | Verificar logs; validar `package.json` e scripts |
| Deploy lento | Verificar tamanho dos arquivos; otimizar build |
| Página em branco | Validar caminhos de assets; verificar base URL |
| CORS errors | Configurar headers no `amplify.yml` |

---

### Amplify.yml (Configuração Avançada)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 🔗 Comandos Úteis

| Ação | Comando |
|------|---------|
| Build local | `npm run build` ou equivalente |
| Testar build | `serve build/` (ou pasta de output) |
| Git push | `git add . && git commit -m "msg" && git push` |
| Verificar status | Acessar AWS Amplify Console |
