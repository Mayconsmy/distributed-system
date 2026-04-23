# Avaliação 3 - Tipos de Sistemas Distribuídos (WordPress com EC2 + RDS)

## Instalação WordPress com EC2 e RDS

### Arquitetura Distribuída WordPress

- **Camada Aplicação**: EC2 com Apache2 + PHP (instância Ubuntu)
- **Camada Persistência**: RDS MySQL (banco de dados gerenciado)
- **Benefícios**: Escalabilidade, separação de responsabilidades, alta disponibilidade
- **Exemplo**: Múltiplas instâncias EC2 podem compartilhar um mesmo RDS

---

### Criar Instância EC2 Ubuntu

1. Acessar AWS EC2 Dashboard → "Launch instances"
2. Selecionar **Ubuntu Server 22.04 LTS** (free tier)
3. Tipo: **t2.micro**
4. **Security Group**: Abrir portas:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
5. Gerar/selecionar **key pair** (.pem)
6. Lançar instância

---

### Conectar à Instância via SSH

```bash
# Conectar via SSH
ssh -i seu-arquivo.pem ubuntu@seu-ipv4-publico

# Atualizar sistema
sudo apt update && sudo apt upgrade -y
```

---

### Instalar Dependências (Sem mysql-server)

```bash
sudo apt install apache2 \
                 ghostscript \
                 libapache2-mod-php \
                 php \
                 php-bcmath \
                 php-curl \
                 php-imagick \
                 php-intl \
                 php-json \
                 php-mbstring \
                 php-mysql \
                 php-xml \
                 php-zip
```

**Observação**: NÃO instalar `mysql-server` (usaremos RDS no lugar)

---

### Criar Banco de Dados RDS MySQL

1. Acessar AWS RDS Dashboard → "Create database"
2. **Engine**: MySQL
3. **Version**: 8.0 (recomendado)
4. **DB instance class**: db.t3.micro (free tier)
5. **DB instance identifier**: wordpress-db
6. **Master username**: admin
7. **Master password**: Criar senha forte
8. **VPC**: Mesma VPC da EC2 (importante!)
9. **Security Group**: Abrir porta 3306 (MySQL)
10. Criar banco de dados

---

### Configurar Security Group RDS

- **Inbound Rules** do RDS Security Group:
  - Type: MySQL/Aurora
  - Protocol: TCP
  - Port: 3306
  - Source: Security Group da EC2 (ou IP da EC2)
- Isso permite que EC2 acesse RDS

---

### Obter Detalhes de Conexão RDS

Na página de detalhes do RDS, copiar:
- **Endpoint**: wordpress-db.xxxxx.rds.amazonaws.com
- **Port**: 3306
- **DB Name**: wordpress
- **Username**: admin
- **Password**: (a que você criou)

---

### Testar Conexão MySQL

```bash
# Instalar client MySQL
sudo apt install mysql-client -y

# Testar conexão
mysql -h seu-endpoint-rds -u admin -p

# Digite a senha do RDS
# Se conectar com sucesso, criar banco de dados:
CREATE DATABASE wordpress;
EXIT;
```

---

### Baixar e Configurar WordPress

```bash
# Navegar para raiz do Apache
cd /srv/www

# Baixar WordPress
sudo wget https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz

# Criar arquivo de configuração
cd wordpress
sudo cp wp-config-sample.php wp-config.php
sudo nano wp-config.php
```

---

### Configurar wp-config.php

Editar as seguintes linhas:
```php
define('DB_NAME', 'wordpress');
define('DB_USER', 'admin');
define('DB_PASSWORD', 'sua-senha-rds');
define('DB_HOST', 'seu-endpoint-rds:3306');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');
```

---

### Configurar Permissões e Apache2
 
```bash
# Mudar proprietário dos arquivos
sudo chown -R www-data: /srv/www/wordpress

# Criar virtual host Apache
sudo nano /etc/apache2/sites-available/wordpress.conf
```

**Conteúdo do arquivo (wordpress.conf)**:
```apache
<VirtualHost *:80>
    ServerName seu-ipv4-publico
    DocumentRoot /srv/www/wordpress

    <Directory /srv/www/wordpress>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

### Ativar Virtual Host e Módulos
 
```bash
# Ativar virtual host
sudo a2ensite wordpress.conf

# Ativar módulo rewrite
sudo a2enmod rewrite

# Desativar virtual host padrão
sudo a2dissite 000-default.conf

# Testar configuração
sudo apache2ctl configtest
# Deve retornar: "Syntax OK"

# Reiniciar Apache
sudo systemctl restart apache2
```

---

###  Acessar WordPress Wizard
 
1. Abrir navegador
2. Acessar: `http://seu-ipv4-publico`
3. Será redirecionado para setup wizard
4. Selecionar idioma (Português - Brasil)
5. Inserir informações do site:
   - Título do site
   - Usuário admin
   - Senha admin
   - Email
6. Instalar WordPress

---

###  Verificar Instalação Completa
 
- Acessar: `http://seu-ipv4-publico` (frontend)
- Acessar: `http://seu-ipv4-publico/wp-admin` (painel administrativo)
- Fazer login com credenciais criadas
- Verificar dashboard do WordPress

---

###  Solucionar Erros Comuns
 
| Erro | Solução |
|------|---------|
| Conexão RDS falha | Verificar Security Group e endpoint |
| Página em branco | Verificar logs Apache: `/var/log/apache2/error.log` |
| Erro de permissão | Rodar: `sudo chown -R www-data: /srv/www/wordpress` |
| Módulo PHP não encontrado | Reinstalar dependências de PHP |

---

## 🔗 Links Importantes

- Tutorial Oficial: https://ubuntu.com/tutorials/install-and-configure-wordpress#1-overview
- WordPress Docs: https://wordpress.org/support/
- AWS EC2: https://aws.amazon.com/ec2/
- AWS RDS: https://aws.amazon.com/rds/

---


