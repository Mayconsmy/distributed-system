# Sistemas Distribuídos - Tarefa EC2 AWS

### Criação da Instância EC2
- Acessar Console AWS → EC2 Dashboard
- Clicar em "Launch instances"
- Selecionar AMI Ubuntu (ex: Ubuntu Server 22.04 LTS)
- Escolher tipo de instância (ex: t2.micro - free tier)
- Configurar segurança: abrir portas 80 (HTTP) e 22 (SSH)
- Gerar/selecionar key pair (.pem)
- Revisar e lançar

---

### Geração da Página HTML

- Usar ChatGPT, Gemini ou outra IA
- Solicitar: página HTML divertida com nome completo e matrícula
- Especificar elementos visuais (cores, animações, layout)
- Copiar o código gerado
- Salvar em arquivo local para posterior upload

---

### Instalação e Configuração do Apache2

```bash
# Conectar à instância via SSH
ssh -i seu-arquivo.pem ubuntu@seu-ipv4-publico

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache2
sudo apt install apache2 -y

# Iniciar serviço
sudo systemctl start apache2
sudo systemctl enable apache2

# Verificar status
sudo systemctl status apache2
```

---

### Flashcard 4: Deploy da Página HTML

- Caminho padrão: `/var/www/html/`
- Opção 1 (via SCP):
  ```bash
  scp -i seu-arquivo.pem seu-arquivo.html ubuntu@seu-ipv4:/home/ubuntu/
  ssh -i seu-arquivo.pem ubuntu@seu-ipv4
  sudo mv seu-arquivo.html /var/www/html/index.html
  ```
- Opção 2 (via terminal):
  ```bash
  sudo nano /var/www/html/index.html
  # Colar conteúdo HTML
  ```
- Reiniciar Apache: `sudo systemctl restart apache2`

---

### Verificação de Acesso

- Abrir navegador
- Acessar: `http://seu-ipv4-publico`
- Verificar se página HTML aparece corretamente
- Confirmar que nome completo e matrícula estão visíveis

---

## 🔗 Resumo de Comandos

| Ação | Comando |
|------|---------|
| Conectar SSH | `ssh -i arquivo.pem ubuntu@IPv4` |
| Atualizar sistema | `sudo apt update && sudo apt upgrade -y` |
| Instalar Apache | `sudo apt install apache2 -y` |
| Iniciar Apache | `sudo systemctl start apache2` |
| Status Apache | `sudo systemctl status apache2` |
| Acessar página | `http://seu-ipv4-publico` |
