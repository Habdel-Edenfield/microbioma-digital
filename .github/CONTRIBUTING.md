# Guia de Contribuição

Obrigado por considerar contribuir para o Microbioma Digital! Este documento fornece diretrizes para contribuições.

## Como Contribuir

### 1. Fork e Clone
1. Faça um fork do repositório
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/seu-usuario/microbioma-digital.git
   cd microbioma-digital
   ```

### 2. Configuração do Ambiente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o ambiente de desenvolvimento:
   ```bash
   npm run setup
   ```

### 3. Desenvolvimento
1. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
2. Faça suas alterações seguindo os padrões do projeto
3. Execute os testes:
   ```bash
   npm test
   npm run test:mary
   ```

### 4. Commit e Push
1. Adicione suas alterações:
   ```bash
   git add .
   ```
2. Faça o commit seguindo as convenções:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
3. Faça o push para sua branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```

### 5. Pull Request
1. Crie um Pull Request para a branch `master`
2. Descreva suas alterações detalhadamente
3. Aguarde a revisão e feedback

## Padrões de Código

### Estrutura do Projeto
- Mantenha a arquitetura event-driven
- Use Stream Processing para operações pesadas
- Implemente Memory Pool para otimização
- Siga os padrões de performance estabelecidos

### Convenções de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### Testes
- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes alta
- Execute `npm run test:mary` para validar o sistema neural

## Sistema Neural - Mary

### Integração com Mary's Intelligence
- Use o `MaryIntelligenceHub` para análises estratégicas
- Implemente `CrossProjectLearning` para padrões entre projetos
- Utilize `AdaptiveFeedbackLoop` para adaptação neural

### Exemplo de Integração
```javascript
import MaryIntelligenceHub from './src/metabolism/MaryIntelligenceHub.js';

const mary = new MaryIntelligenceHub({
    enableStrategicAnalysis: true,
    enableCrossProjectLearning: true,
    enableAdaptiveFeedback: true
});

const analysis = await mary.analyzeMary({
    type: 'conversation',
    messages: [...],
    context: { project: 'your-project' }
});
```

## Performance

### Benchmarks Atuais
- **Throughput**: 17,525 eventos/segundo
- **Latência**: <1ms processamento
- **Memory**: 75% redução footprint
- **Database**: 95% connection pool hit rate

### Otimizações
- Mantenha o Event-Driven Architecture
- Use Stream Processing com worker threads
- Implemente Memory Pool para reuso de objetos
- Otimize Database com connection pooling

## Comunicação

### Issues
- Use templates apropriados para bugs e features
- Forneça contexto detalhado
- Inclua logs e screenshots quando relevante

### Discussões
- Participe das discussões no GitHub
- Compartilhe ideias e feedback
- Ajude outros contribuidores

## Recursos

- [Documentação Técnica](docs/TECHNICAL-ARCHITECTURE.md)
- [Guia de Performance](docs/PERFORMANCE-GUIDE.md)
- [README Principal](README.md)
- [Sistema Neural](src/metabolism/README.md)

## Agradecimentos

Obrigado por contribuir para o Microbioma Digital! Suas contribuições ajudam a evoluir este organismo simbiótico de alta performance.
