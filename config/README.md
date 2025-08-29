# ⚙️ Configurações - Microbioma Digital

> **Configurações que moldam o comportamento do organismo digital**

## 📁 Estrutura de Configurações

```
config/
├── README.md                    # Este arquivo
├── agent.json                   # Configuração do agente simbiótico
├── patterns.json                # Padrões emergentes e regras
├── environment.json             # Configurações gerais do ambiente
├── development.json             # Configurações específicas para desenvolvimento
├── production.json              # Configurações específicas para produção
├── test.json                    # Configurações específicas para testes
├── local.json                   # Configurações específicas para desenvolvimento local
└── secrets.example.json         # Exemplo de configurações sensíveis
```

## 🔧 Como Funciona

### 1. **Carregamento Hierárquico**
As configurações são carregadas em ordem de prioridade:
1. `environment.json` - Base geral
2. `{mode}.json` - Configurações específicas do modo
3. `local.json` - Configurações específicas do usuário
4. `secrets.json` - Configurações sensíveis (não versionado)

### 2. **Modos de Operação**
- **development**: Desenvolvimento com recursos completos
- **production**: Produção otimizada e segura
- **test**: Testes isolados e controlados
- **local**: Desenvolvimento local personalizado

### 3. **Configurações Dinâmicas**
- Configurações podem ser alteradas em tempo real
- Hot reload para mudanças de configuração
- Validação automática de configurações

## 📋 Configurações Principais

### Agent Configuration (`agent.json`)
- **Identidade**: Nome, personalidade, características
- **Comportamento**: Taxa de aprendizado, janela de contexto
- **Modos**: Flow, exploração, bloqueado
- **Integração**: IDE, Git, serviços externos

### Pattern Configuration (`patterns.json`)
- **Categorias**: Desenvolvimento, arquitetura, workflow
- **Detecção**: Thresholds, janelas de contexto
- **Síntese**: Geração automática, categorização
- **Feedback**: Validação, confirmação, refinamento

### Environment Configuration (`environment.json`)
- **Paths**: Caminhos para dados, docs, logs
- **Database**: Tipo, caminho, backup
- **Logging**: Arquivo, tamanho máximo, formato
- **Capture**: Conversas, eventos IDE, padrões

## 🚀 Configuração Rápida

### Para Desenvolvimento Local
```bash
# Copie o arquivo de exemplo
cp config/secrets.example.json config/secrets.json

# Edite as configurações necessárias
nano config/secrets.json

# Configure o ambiente local
nano config/local.json
```

### Para Produção
```bash
# Configure o ambiente de produção
nano config/production.json

# Configure os segredos
nano config/secrets.json

# Valide as configurações
npm run validate-config
```

## 🔒 Segurança

### Arquivos Sensíveis
- **NÃO versionar** `secrets.json`
- **SEMPRE** usar `secrets.example.json` como template
- **VALIDAR** configurações antes de fazer commit
- **CRIPTOGRAFAR** dados sensíveis em produção

### Boas Práticas
1. **Nunca** commitar chaves API
2. **Sempre** usar variáveis de ambiente para produção
3. **Validar** configurações antes de usar
4. **Auditar** configurações regularmente

## 📊 Monitoramento

### Health Checks
- Validação de configurações
- Verificação de conectividade
- Monitoramento de performance
- Alertas de configuração

### Métricas
- Tempo de carregamento de configuração
- Frequência de mudanças
- Erros de configuração
- Uso de recursos

## 🔄 Atualizações

### Como Atualizar
1. **Edite** o arquivo de configuração
2. **Valide** a sintaxe JSON
3. **Teste** a configuração
4. **Reinicie** o serviço se necessário

### Versionamento
- Configurações são versionadas com Git
- Histórico de mudanças é mantido
- Rollback para versões anteriores
- Branches para experimentos

---

*As configurações são o DNA do microbioma digital. Configure com cuidado, teste com atenção e evolua com sabedoria.*
