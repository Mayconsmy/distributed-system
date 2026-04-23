# Avaliação 5 - Contêineres na AWS (ECR + ECS com Load Balancer)

## 📚 Flashcards - Arquitetura de Microserviços com ECR e ECS

### O que é AWS ECR?
 
- **ECR**: Elastic Container Registry
- **Propósito**: Repositório privado para armazenar imagens Docker
- **Características**: Integrado com ECS, seguro, escalável
- **Alternativa**: Docker Hub (público), Harbor (privado)
- **Vantagem**: Sem taxa por imagem, integração nativa com AWS

---

### O que é AWS ECS?
 
- **ECS**: Elastic Container Service
- **Propósito**: Orquestração de contêineres gerenciada pela AWS
- **Componentes principais**:
  - **Task Definition**: Define como contêiner executa
  - **Cluster**: Grupo de recursos para rodar tarefas
  - **Service**: Mantém tarefas rodando e escaláveis
  - **Load Balancer**: Distribui tráfego entre tarefas

---

### Criar Aplicação que "Faz Barulho"

- **Significado**: Aplicação que gera muitos logs/eventos
- **Exemplos**:
  - API REST que loga requisições/respostas
  - Aplicação que escreve em stdout constantemente
  - Processador de dados com logs verbosos
  
**Exemplo simples (Node.js)**:
```javascript
// app.js
const http = require('http');
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(`Hello from container! Request to: ${req.url}\n`);
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
  setInterval(() => {
    console.log(`[HEARTBEAT] ${new Date().toISOString()}`);
  }, 5000);
});
```

---

### ontainerizar Aplicação com Docker
 
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json (se houver)
COPY package*.json ./
RUN npm install --only=production || true

# Copiar código
COPY app.js .

# Expor porta
EXPOSE 3000

# Comando para rodar
CMD ["node", "app.js"]
```

**Compilar e testar localmente**:
```bash
# Build da imagem
docker build -t minha-app:latest .

# Rodar localmente
docker run -d -p 3000:3000 --name minha-app minha-app:latest

# Testar
curl http://localhost:3000

# Ver logs
docker logs -f minha-app
```

---

### Preparar EC2 e Instalar Docker
 
```bash
# 1. Criar/conectar à instância EC2 (Ubuntu 22.04)
ssh -i seu-arquivo.pem ubuntu@seu-ipv4

# 2. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar Docker
sudo apt install docker.io -y
sudo usermod -aG docker ubuntu

# 4. Instalar AWS CLI (para push no ECR)
sudo apt install awscli -y

# 5. Fazer logout/login para aplicar grupos docker
exit
ssh -i seu-arquivo.pem ubuntu@seu-ipv4
```

---

### Criar Repositório ECR
 
```bash
# Via CLI (na instância EC2)
aws ecr create-repository \
  --repository-name minha-app \
  --region us-east-1

# Resposta esperada:
# {
#   "repository": {
#     "repositoryArn": "arn:aws:ecr:us-east-1:xxx:repository/minha-app",
#     "repositoryUri": "xxx.dkr.ecr.us-east-1.amazonaws.com/minha-app"
#   }
# }
```

**Ou via Console AWS**:
1. AWS ECR Dashboard → "Create repository"
2. Repository name: `minha-app`
3. Create repository

---

### Autenticar Docker no ECR
 
```bash
# Obter token de autenticação
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Deve retornar: "Login Succeeded"

# Copiar o URI do repositório (você vai precisar)
# Formato: 123456789.dkr.ecr.us-east-1.amazonaws.com/minha-app
```

---

### Tag e Push da Imagem para ECR
 
```bash
# 1. Copiar arquivo da aplicação para EC2
scp -i seu-arquivo.pem app.js ubuntu@seu-ipv4:~/

# 2. Criar Dockerfile na EC2
cat > ~/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY app.js .
EXPOSE 3000
CMD ["node", "app.js"]
EOF

# 3. Build da imagem
cd ~
docker build -t minha-app:latest .

# 4. Tag com URI do ECR
docker tag minha-app:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest

# 5. Push para ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest

# Verificar
aws ecr describe-images --repository-name minha-app --region us-east-1
```

---

### Criar Task Definition no ECS
 
```bash
# Criar arquivo JSON da Task Definition
cat > task-definition.json << 'EOF'
{
  "family": "minha-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "minha-app",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/minha-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/minha-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Registrar Task Definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region us-east-1
```

---

### Criar Cluster ECS
 
```bash
# Via CLI
aws ecs create-cluster \
  --cluster-name meu-cluster \
  --region us-east-1

# Ou via Console AWS:
# 1. AWS ECS Dashboard → Clusters
# 2. Create cluster
# 3. Cluster name: meu-cluster
# 4. Infrastructure: AWS Fargate
# 5. Create cluster
```

---

### Criar Load Balancer (ALB)
 
```bash
# Via Console AWS (mais fácil):
# 1. EC2 Dashboard → Load Balancers
# 2. Create load balancer
# 3. Type: Application Load Balancer
# 4. Name: lb-seu-nome (ex: lb-joao)
# 5. Scheme: Internet-facing
# 6. VPC: padrão
# 7. Availability zones: múltiplas (recomendado)
# 8. Security groups: abrir porta 80 (HTTP)
# 9. Listeners: HTTP:80
# 10. Target group: criar novo
#     - Type: IP
#     - Port: 3000
#     - Health check path: /
#     - Name: minha-app-targets
# 11. Register targets: deixar vazio (ECS fará isso)
# 12. Create
```

---

### Criar Service ECS
 
```bash
# Via Console AWS:
# 1. AWS ECS → Cluster: meu-cluster
# 2. Services → Create
# 3. Launch type: FARGATE
# 4. Task definition: minha-app (latest)
# 5. Cluster: meu-cluster
# 6. Service name: minha-app-service
# 7. Desired count: 2 (para redundância)
# 8. Network configuration:
#    - VPC: padrão
#    - Subnets: múltiplas
#    - Security group: criar novo (porta 3000)
# 9. Load balancing:
#    - Type: Application Load Balancer
#    - Load balancer name: lb-seu-nome
#    - Container: minha-app:3000
#    - Listener port: 80
#    - Target group: minha-app-targets
# 10. Auto Scaling: deixar padrão ou configurar
# 11. Create service
```

---

### Verificar Service em Execução
 
```bash
# Ver serviço
aws ecs describe-services \
  --cluster meu-cluster \
  --services minha-app-service \
  --region us-east-1

# Ver tasks
aws ecs list-tasks \
  --cluster meu-cluster \
  --region us-east-1

# Ver detalhes de task
aws ecs describe-tasks \
  --cluster meu-cluster \
  --tasks <task-arn> \
  --region us-east-1

# Ver logs
aws logs tail /ecs/minha-app --follow
```

---

### Acessar Aplicação via Load Balancer
 
1. Obter DNS do Load Balancer:
   ```bash
   aws elbv2 describe-load-balancers \
     --names lb-seu-nome \
     --region us-east-1
   # Copiar "DNSName"
   ```

2. Acessar no navegador:
   - URL: `http://lb-seu-nome-123456.us-east-1.elb.amazonaws.com`
   - Deve mostrar resposta da aplicação
   - Logs devem aparecer nos CloudWatch Logs

3. Testar múltiplas vezes (diferentes tasks):
   ```bash
   for i in {1..10}; do
     curl http://lb-seu-nome-123456.us-east-1.elb.amazonaws.com
     sleep 1
   done
   ```

---

### Auto Scaling ECS
 
```bash
# Registrar Auto Scaling Service
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/meu-cluster/minha-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 4 \
  --region us-east-1

# Criar policy de scaling (baseado em CPU)
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/meu-cluster/minha-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    TargetValue=70.0,PredefinedMetricSpecification="{PredefinedMetricType=ECSServiceAverageCPUUtilization}" \
  --region us-east-1
```

---

### Solucionar Problemas Comuns

| Erro | Solução |
|------|---------|
| Tasks não iniciando | Verificar logs CloudWatch; verificar Security Groups |
| Load Balancer retorna 502 | Verificar health check; porta do container correta |
| Imagem não encontrada | Verificar URI do ECR; autenticação Docker |
| Permissão negada | Criar IAM role para ECS tasks |
| Health check falhando | Verificar endpoint da aplicação; timeout |

---

## 📋 Arquitetura Completa

```
┌─────────────────────────────────────────────────┐
│           USUÁRIO NA INTERNET                    │
└────────────────┬────────────────────────────────┘
                 │ HTTP:80
                 ↓
┌─────────────────────────────────────────────────┐
│    Application Load Balancer (lb-seu-nome)      │
│    DNS: lb-seu-nome-xxx.region.elb.amazonaws.com│
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
    ┌─────────────┐  ┌─────────────┐
    │  Task 1     │  │  Task 2     │
    │  Container  │  │  Container  │
    │  minha-app  │  │  minha-app  │
    │  Port 3000  │  │  Port 3000  │
    └────┬────────┘  └────┬────────┘
         │                │
         └────────┬───────┘
                  ↓
        ┌─────────────────────┐
        │   ECS Cluster       │
        │   meu-cluster       │
        └─────────────────────┘
```

---

## 🔗 Links Importantes

- AWS ECR: https://aws.amazon.com/ecr/
- AWS ECS: https://aws.amazon.com/ecs/
- AWS Load Balancer: https://aws.amazon.com/elasticloadbalancing/
- Docker Hub: https://hub.docker.com/
- Node.js: https://nodejs.org/

---
