# Avaliação 4 - Contêiner (Docker com Apache2 em EC2)

## Execução de Docker Apache2 em EC2

### O que é Docker e Contêiner?
 
- **Docker**: Plataforma de containerização que empacota aplicações e dependências
- **Contêiner**: Unidade leve e isolada que executa aplicações
- **Vantagens sobre VMs**: Menor overhead, inicialização mais rápida, portabilidade
- **Casos de uso**: Microserviços, deploy rápido, escalabilidade
- **Imagem Docker**: Template (read-only) para criar contêineres

---

### Criar Instância EC2 Ubuntu
 
1. Acessar AWS EC2 Dashboard → "Launch instances"
2. Selecionar **Ubuntu Server 22.04 LTS** (free tier)
3. Tipo: **t2.micro**
4. **Security Group**: Abrir portas:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3000-8000 (portas de aplicações - opcional)
5. Gerar/selecionar **key pair** (.pem)
6. Lançar instância

---

### Conectar à EC2 e Atualizar Sistema
 
```bash
# Conectar via SSH
ssh -i seu-arquivo.pem ubuntu@seu-ipv4-publico

# Atualizar repositórios e pacotes
sudo apt update
sudo apt upgrade -y
```

---

### Instalar Docker Engine
 
```bash
# Opção 1: Instalação rápida (recomendado)
sudo apt install docker.io -y

# Opção 2: Instalação oficial (mais recente)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ubuntu ao grupo docker (sem sudo)
sudo usermod -aG docker ubuntu

# Verificar instalação
docker --version
```

**Nota**: Após adicionar ao grupo, fazer logout e login novamente

---

### Iniciar Serviço Docker
 
```bash
# Iniciar daemon Docker
sudo systemctl start docker

# Ativar para iniciar automaticamente
sudo systemctl enable docker

# Verificar status
sudo systemctl status docker

# Testar instalação
docker run hello-world
```

---

### Entender Imagem Oficial Apache2
 
- **Imagem**: httpd (Apache HTTP Server)
- **Localização**: https://hub.docker.com/_/httpd
- **Versão recomendada**: latest ou 2.4
- **Porta padrão**: 80 (HTTP)
- **Diretório de conteúdo**: `/usr/local/apache2/htdocs/`
- **Arquivo config**: `/usr/local/apache2/conf/httpd.conf`

---

### Executar Contêiner Apache2 Básico
 
```bash
# Comando básico
docker run -d -p 80:80 --name meu-apache httpd:latest

# Parâmetros:
# -d: detach (executa em background)
# -p 80:80: mapeia porta host:container
# --name: nomeia o contêiner
# httpd:latest: imagem e tag

# Verificar se está rodando
docker ps

# Ver logs
docker logs meu-apache
```

---

### Verificar Contêiner em Execução
 
```bash
# Listar contêineres em execução
docker ps

# Ver todos os contêineres (inclusive parados)
docker ps -a

# Ver detalhes do contêiner
docker inspect meu-apache

# Acessar logs
docker logs -f meu-apache

# Testar localmente
curl http://localhost
```

---

### Criar Página HTML Customizada
 
**Opção 1: Cópia para contêiner existente**
```bash
# Criar arquivo HTML local
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Meu Apache em Docker</title>
</head>
<body>
    <h1>Apache rodando em Docker!</h1>
    <p>Nome: [Seu Nome Completo]</p>
    <p>Matrícula: [Sua Matrícula]</p>
    <p>IP: seu-ipv4-publico</p>
</body>
</html>
EOF

# Copiar para contêiner
docker cp index.html meu-apache:/usr/local/apache2/htdocs/
```

**Opção 2: Usar volume**
```bash
# Criar diretório local
mkdir ~/apache-content
cat > ~/apache-content/index.html << 'EOF'
[HTML aqui]
EOF

# Executar com volume (-v caminho-local:caminho-container)
docker run -d -p 80:80 -v ~/apache-content:/usr/local/apache2/htdocs --name meu-apache httpd:latest
```

---

### Acessar Apache2 via Navegador
 
1. Obter IP público da EC2:
   ```bash
   curl http://checkip.amazonaws.com
   ```

2. Abrir navegador:
   - URL: `http://seu-ipv4-publico`
   - Ou: `http://seu-ipv4-publico/index.html`

3. Verificações:
   - Página carrega corretamente
   - Nome e matrícula visíveis
   - IP aparece na página

---

### Gerenciar Contêiner
 
```bash
# Parar contêiner
docker stop meu-apache

# Iniciar contêiner parado
docker start meu-apache

# Reiniciar contêiner
docker restart meu-apache

# Remover contêiner (se parado)
docker rm meu-apache

# Ver histórico de mudanças
docker diff meu-apache

# Acessar terminal do contêiner
docker exec -it meu-apache /bin/bash
```

---

### Solucionar Problemas Comuns
 
| Erro | Solução |
|------|---------|
| "docker: permission denied" | `sudo usermod -aG docker ubuntu` + logout/login |
| Porta 80 já em uso | `docker stop meu-apache` ou mudar porta |
| Contêiner não inicia | `docker logs meu-apache` para ver erro |
| Página não carrega | Verificar `docker ps`, URL, Security Group |
| Arquivo não encontrado | Verificar caminho com `docker exec -it meu-apache ls` |

---

### Visualizar Logs e Estatísticas
 
```bash
# Ver logs em tempo real
docker logs -f meu-apache

# Ver uso de CPU e memória
docker stats meu-apache

# Ver últimas 50 linhas
docker logs --tail 50 meu-apache

# Ver logs com timestamp
docker logs -t meu-apache
```

---

### Criar Dockerfile para Automatizar
 
```dockerfile
# Arquivo: Dockerfile
FROM httpd:latest

# Copiar página HTML
COPY index.html /usr/local/apache2/htdocs/

# Expor porta
EXPOSE 80

# Comando padrão (já vem na imagem httpd)
CMD ["httpd-foreground"]
```

**Build e executar**:
```bash
# Build da imagem customizada
docker build -t meu-apache-customizado .

# Rodar imagem customizada
docker run -d -p 80:80 --name meu-apache meu-apache-customizado
```

---

### Arquitetura de Contêiner em EC2
 
```
┌─────────────────────────────────────┐
│     AWS EC2 (Ubuntu 22.04)          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Docker Engine             │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ Contêiner Apache2   │   │   │
│  │  │ - httpd             │   │   │
│  │  │ - Porta 80          │   │   │
│  │  │ - /usr/local/...    │   │   │
│  │  └─────────────────────┘   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
       ↓ (IPv4 Público)
    Navegador do usuário
```

---
 
## 🔗 Links Importantes

- Imagem Oficial Apache2: https://hub.docker.com/_/httpd
- Docker Documentation: https://docs.docker.com/
- Docker Hub: https://hub.docker.com/
- AWS EC2: https://aws.amazon.com/ec2/

---

## 💡 Dicas Úteis

- **Sem sudo**: Após `usermod -aG docker ubuntu`, fazer logout completo
- **Debug rápido**: `docker logs meu-apache` para erros
- **Testar localmente antes**: Use `curl http://localhost` antes de acessar via IPv4
- **Volumes são melhores**: Use `-v` para atualizar conteúdo sem parar contêiner
- **Sempre usar tags**: `httpd:2.4` é mais seguro que `httpd:latest`

