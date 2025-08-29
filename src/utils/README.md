# 🛠️ Utils - Utilitários do Microbioma Digital

> **Ferramentas e funções auxiliares para todo o sistema**

## 🎯 Propósito

Esta pasta contém utilitários e funções auxiliares do microbioma digital - código reutilizável que suporta todas as funcionalidades do sistema.

## 🏗️ Estrutura

```
utils/
├── README.md                    # Este arquivo
├── Logger.js                    # Sistema de logging
├── Validator.js                 # Validação de dados
├── Formatter.js                 # Formatação de dados
├── FileUtils.js                 # Utilitários de arquivo
├── DateUtils.js                 # Utilitários de data
└── StringUtils.js               # Utilitários de string
```

## 🔧 Componentes

### Logger
- Sistema de logging estruturado
- Níveis de log configuráveis
- Rotação automática de logs
- Formatação JSON para análise

### Validator
- Validação de tipos de dados
- Verificação de esquemas
- Validação de campos obrigatórios
- Relatórios de erro detalhados

### Formatter
- Formatação de dados para exibição
- Conversão entre formatos
- Normalização de dados
- Pretty printing

### FileUtils
- Operações de arquivo seguras
- Criação de diretórios
- Cópia e movimentação
- Verificação de permissões

### DateUtils
- Manipulação de datas
- Formatação de timestamps
- Cálculos de duração
- Conversão de timezones

### StringUtils
- Manipulação de strings
- Sanitização de dados
- Geração de IDs únicos
- Normalização de texto

## 🚀 Como Usar

```javascript
import { Logger } from './utils/Logger.js';
import { Validator } from './utils/Validator.js';
import { Formatter } from './utils/Formatter.js';

// Logging
Logger.info('Sistema iniciado com sucesso');

// Validação
const isValid = Validator.validateSchema(data, schema);

// Formatação
const formatted = Formatter.prettyPrint(data);
```

## 🌱 Evolução

Os utilitários evoluem organicamente:
- **Novas funções** são adicionadas conforme necessário
- **Performance** é otimizada continuamente
- **Compatibilidade** é mantida entre versões
- **Documentação** é sempre atualizada

---

*Os utilitários são as ferramentas do microbioma digital. Mantenha-os limpos, eficientes e bem documentados.*
