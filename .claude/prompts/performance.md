# Performance Analysis - Prompt Template

## Sistema de Performance v0.2.0

### Métricas Core
Execute análise completa dos sistemas otimizados:

```bash
# Análise de performance completa
node scripts/final-analysis.js --comprehensive
```

### Componentes para Análise

#### 1. EventBus Performance
```javascript
// Analise métricas do EventBus
const metrics = {
  throughput: await eventBus.getThroughput(),
  buffer_efficiency: await eventBus.getBufferStats(),
  circuit_breaker: await eventBus.getCircuitBreakerStatus(),
  retry_success: await eventBus.getRetryMetrics()
};
```

#### 2. Stream Processing Health
```javascript
// Verificar worker threads
const streamStats = {
  worker_balance: await streamProcessor.getWorkerBalance(),
  backpressure: await streamProcessor.getBackpressureStatus(),
  queue_health: await streamProcessor.getQueueMetrics(),
  processing_latency: await streamProcessor.getLatencyStats()
};
```

#### 3. Memory Pool Efficiency
```javascript
// Análise memory pool
const memoryStats = {
  reuse_rate: await memoryPool.getReuseRate(),
  allocation_patterns: await memoryPool.getAllocationStats(),
  gc_pressure: await memoryPool.getGCMetrics(),
  pool_health: await memoryPool.getPoolHealth()
};
```

#### 4. Database Connection Pool
```javascript
// Verificar connection pooling
const dbStats = {
  hit_rate: await dbManager.getHitRate(),
  active_connections: await dbManager.getActiveConnections(),
  query_performance: await dbManager.getQueryMetrics(),
  prepared_statements: await dbManager.getPreparedStatsEfficiency()
};
```

### Análise de Gargalos

#### Identificação
- **CPU bottlenecks**: Worker thread utilization
- **Memory pressure**: GC frequency, allocation patterns  
- **I/O constraints**: Database connection saturation
- **Network latency**: Event propagation delays

#### Otimizações Sugeridas
1. **Horizontal scaling**: Aumentar worker threads
2. **Memory tuning**: Ajustar pool sizes
3. **Database tuning**: Connection pool sizing
4. **Buffer optimization**: Ajustar buffer sizes

### Performance Targets

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| Throughput | >15,000 events/s | 17,525 | ✅ |
| Latency | <1ms | <1ms | ✅ |
| Memory Reuse | >85% | 90% | ✅ |
| DB Hit Rate | >90% | 95% | ✅ |
| GC Pressure | <10% CPU | ~5% | ✅ |

### Report Template
```markdown
# Performance Analysis - [Timestamp]

## 📊 System Health Overview
- Overall Status: [Healthy/Warning/Critical]
- Performance Score: [0-100]
- Optimization Opportunities: [Count]

## ⚡ Core Metrics
- **Throughput**: [events/second]
- **Latency P95**: [milliseconds]
- **Memory Efficiency**: [percentage]
- **Connection Pool**: [hit rate]

## 🔍 Bottleneck Analysis
[Detailed analysis of performance bottlenecks]

## 🚀 Optimization Recommendations
1. [Specific recommendation]
2. [Specific recommendation]
3. [Specific recommendation]

## 📈 Performance Trends
[Analysis of performance over time]
```