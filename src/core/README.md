# 🧬 Core - Núcleo do Microbioma Digital

> **Sistema central que coordena todas as funcionalidades**

## 🎯 Propósito

Esta pasta contém o núcleo do sistema microbioma digital - os componentes fundamentais que coordenam todas as funcionalidades e mantêm o sistema funcionando.

## 🏗️ Estrutura

```
core/
├── README.md                    # Este arquivo
├── ConfigManager.js            # Gerenciador de configurações
├── EnvironmentDetector.js      # Detector de ambiente
├── ConfigValidator.js          # Validador de configurações
├── SystemManager.js            # Gerenciador do sistema
└── HealthMonitor.js            # Monitor de saúde do sistema
```

## 🔧 Componentes

### ConfigManager
- Carregamento hierárquico de configurações
- Merge de configurações por ambiente
- Validação de configurações obrigatórias
- Hot reload de configurações

### EnvironmentDetector
- Detecção automática do ambiente
- Seleção de configurações apropriadas
- Validação de requisitos do ambiente
- Fallback para configurações padrão

### ConfigValidator
- Validação de sintaxe JSON
- Verificação de campos obrigatórios
- Validação de tipos de dados
- Relatório de erros de configuração

### SystemManager
- Inicialização do sistema
- Coordenação de componentes
- Gerenciamento de ciclo de vida
- Shutdown graceful

### HealthMonitor
- Verificação de saúde do sistema
- Métricas de performance
- Alertas de problemas
- Relatórios de status

## 🚀 Como Usar

```javascript
import { ConfigManager } from './core/ConfigManager.js';
import { SystemManager } from './core/SystemManager.js';

// Inicializar sistema
const config = await ConfigManager.load();
const system = new SystemManager(config);
await system.start();
```

## 🌱 Evolução

Este núcleo evolui organicamente conforme novas funcionalidades são adicionadas. Cada componente deve ser:
- **Modular**: Funcionar independentemente
- **Testável**: Fácil de testar isoladamente
- **Extensível**: Preparado para crescimento futuro
- **Documentado**: Comentários que respiram

---

*O núcleo é o coração do microbioma digital. Mantenha-o forte, limpo e organizado.*
