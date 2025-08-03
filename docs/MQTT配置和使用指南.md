# MQTT 配置和使用指南

## 概述

Serial-Studio VSCode 插件的 MQTT 功能提供了高性能的串口数据到 MQTT 消息的转发能力，支持多线程处理、智能重连和灵活的数据格式配置。本指南将详细介绍如何配置和使用 MQTT 功能。

## 1. 基本配置

### 1.1 启用 MQTT 功能

在项目配置文件中启用 MQTT：

```json
{
  "mqtt": {
    "enabled": true,
    "config": {
      "host": "localhost",
      "port": 1883,
      "clientId": "serial-studio-vscode",
      "keepAlive": 60,
      "clean": true,
      "reconnectPeriod": 3000,
      "connectTimeout": 5000
    }
  }
}
```

### 1.2 连接参数配置

#### 基本连接参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `host` | string | "localhost" | MQTT 服务器地址 |
| `port` | number | 1883 | MQTT 服务器端口 |
| `clientId` | string | 自动生成 | 客户端标识符 |
| `username` | string | - | 用户名（可选） |
| `password` | string | - | 密码（可选） |
| `keepAlive` | number | 60 | 心跳间隔（秒） |
| `clean` | boolean | true | 清除会话 |
| `reconnectPeriod` | number | 3000 | 重连间隔（毫秒） |
| `connectTimeout` | number | 5000 | 连接超时（毫秒） |

#### 安全配置

```json
{
  "mqtt": {
    "config": {
      "host": "mqtt.example.com",
      "port": 8883,
      "protocol": "mqtts",
      "username": "your_username",
      "password": "your_password",
      "ca": "/path/to/ca.crt",
      "cert": "/path/to/client.crt",
      "key": "/path/to/client.key"
    }
  }
}
```

## 2. 多线程性能配置

### 2.1 线程池设置

```json
{
  "mqtt": {
    "performance": {
      "maxWorkers": 4,
      "queueSize": 1000,
      "batchSize": 10,
      "batchTimeout": 100,
      "enableCompression": false,
      "messageBuffer": 512,
      "highWaterMark": 1024
    }
  }
}
```

#### 性能参数说明

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| `maxWorkers` | CPU核心数 | 工作线程数量 |
| `queueSize` | 1000-5000 | 消息队列大小 |
| `batchSize` | 10-50 | 批处理消息数量 |
| `batchTimeout` | 50-200ms | 批处理超时时间 |
| `enableCompression` | false | 是否启用消息压缩 |
| `messageBuffer` | 512-2048 | 单个消息缓冲区大小 |
| `highWaterMark` | 1024-4096 | 高水位标记 |

### 2.2 根据数据量调整配置

#### 低数据量场景（< 100 msg/s）
```json
{
  "performance": {
    "maxWorkers": 1,
    "queueSize": 500,
    "batchSize": 5,
    "batchTimeout": 200
  }
}
```

#### 中等数据量场景（100-1000 msg/s）
```json
{
  "performance": {
    "maxWorkers": 2,
    "queueSize": 1000,
    "batchSize": 10,
    "batchTimeout": 100
  }
}
```

#### 高数据量场景（> 1000 msg/s）
```json
{
  "performance": {
    "maxWorkers": 4,
    "queueSize": 2000,
    "batchSize": 20,
    "batchTimeout": 50
  }
}
```

## 3. 数据发布配置

### 3.1 基本发布设置

```json
{
  "mqtt": {
    "publish": {
      "baseTopic": "serial-studio",
      "deviceId": "device001",
      "qos": 1,
      "retain": false,
      "format": "json",
      "includeTimestamp": true,
      "includeMetadata": true
    }
  }
}
```

### 3.2 主题结构配置

#### 自动主题生成
插件会自动生成分层主题结构：

```
serial-studio/
├── device001/
│   ├── raw/              # 原始串口数据
│   ├── parsed/           # 解析后的数据
│   │   ├── group1/       # 数据组
│   │   │   ├── dataset1  # 具体数据集
│   │   │   └── dataset2
│   │   └── group2/
│   ├── status/           # 设备状态
│   └── control/          # 控制命令
```

#### 自定义主题映射
```json
{
  "mqtt": {
    "publish": {
      "topicMapping": {
        "raw": "raw-data",
        "parsed": "processed-data", 
        "status": "device-status",
        "control": "device-control"
      }
    }
  }
}
```

### 3.3 消息格式配置

#### JSON 格式（默认）
```json
{
  "timestamp": "2023-12-01T10:30:00.000Z",
  "deviceId": "device001",
  "data": {
    "temperature": 25.6,
    "humidity": 60.2
  },
  "metadata": {
    "frameId": 12345,
    "groupId": "sensors",
    "datasetId": "temperature"
  }
}
```

#### 简化格式
```json
{
  "mqtt": {
    "publish": {
      "format": "simple",
      "includeTimestamp": false,
      "includeMetadata": false
    }
  }
}
```

简化格式输出：
```json
{
  "temperature": 25.6,
  "humidity": 60.2
}
```

#### 原始格式
```json
{
  "mqtt": {
    "publish": {
      "format": "raw",
      "encoding": "base64"
    }
  }
}
```

## 4. 使用示例

### 4.1 在代码中使用 MQTT

```typescript
import { MQTTClient } from '../shared/MQTTClient';

// 初始化 MQTT 客户端
const mqttClient = new MQTTClient({
  host: 'localhost',
  port: 1883,
  clientId: 'my-device'
});

// 连接到 MQTT 服务器
await mqttClient.connect();

// 发布数据
await mqttClient.publish('sensor/temperature', {
  value: 25.6,
  unit: 'celsius',
  timestamp: new Date().toISOString()
});

// 订阅控制命令
mqttClient.subscribe('control/+', (topic, message) => {
  console.log(`收到控制命令: ${topic}`, message);
});
```

### 4.2 与项目数据集成合

```typescript
import { globalMQTTPublisher } from '../shared/MQTTPublisher';

// 在数据解析完成后自动发布
export class DataParser {
  async parseFrame(frame: DataFrame): Promise<ParsedData> {
    const parsedData = await this.processFrame(frame);
    
    // 自动发布到 MQTT
    if (globalMQTTPublisher.isEnabled()) {
      await globalMQTTPublisher.publishParsedData(parsedData);
    }
    
    return parsedData;
  }
}
```

### 4.3 批量数据处理

```typescript
// 启用批量处理提高性能
const batchProcessor = mqttClient.createBatchProcessor({
  batchSize: 20,
  flushInterval: 100, // ms
  enableCompression: true
});

// 批量添加数据
for (const dataPoint of sensorData) {
  batchProcessor.add(`sensor/${dataPoint.type}`, dataPoint);
}

// 手动刷新缓存
await batchProcessor.flush();
```

## 5. 高级配置

### 5.1 消息路由配置

```json
{
  "mqtt": {
    "routing": {
      "enabled": true,
      "rules": [
        {
          "condition": "data.temperature > 30",
          "topic": "alerts/high-temperature",
          "transform": "alert-format"
        },
        {
          "condition": "data.groupId === 'sensors'",
          "topic": "sensors/{{data.datasetId}}",
          "qos": 2
        }
      ]
    }
  }
}
```

### 5.2 数据过滤配置

```json
{
  "mqtt": {
    "filters": {
      "minInterval": 1000,      // 最小发布间隔（毫秒）
      "maxRate": 100,           // 最大发布速率（msg/s）
      "deduplicate": true,      // 去重复数据
      "valueThreshold": 0.1     // 数值变化阈值
    }
  }
}
```

### 5.3 故障转移配置

```json
{
  "mqtt": {
    "failover": {
      "enabled": true,
      "servers": [
        {
          "host": "mqtt1.example.com",
          "port": 1883,
          "priority": 1
        },
        {
          "host": "mqtt2.example.com", 
          "port": 1883,
          "priority": 2
        }
      ],
      "switchTimeout": 5000,
      "healthCheckInterval": 30000
    }
  }
}
```

## 6. 监控和调试

### 6.1 启用调试日志

```json
{
  "mqtt": {
    "debug": {
      "enabled": true,
      "level": "debug",
      "logFile": "mqtt-debug.log",
      "maxFileSize": "10MB",
      "maxFiles": 5
    }
  }
}
```

### 6.2 性能监控

```typescript
// 获取 MQTT 性能统计
const stats = mqttClient.getStats();

console.log('MQTT 统计信息:');
console.log(`已发送消息: ${stats.messagesSent}`);
console.log(`发送失败: ${stats.sendErrors}`);
console.log(`连接状态: ${stats.connectionState}`);
console.log(`队列长度: ${stats.queueLength}`);
console.log(`平均延迟: ${stats.averageLatency}ms`);
```

### 6.3 健康检查

```typescript
// 定期执行健康检查
setInterval(async () => {
  const health = await mqttClient.healthCheck();
  
  if (!health.connected) {
    console.warn('MQTT 连接异常，尝试重连...');
    await mqttClient.reconnect();
  }
  
  if (health.queueLength > 1000) {
    console.warn('MQTT 队列积压过多，考虑调整配置');
  }
}, 30000);
```

## 7. 常见问题排查

### 7.1 连接问题

#### 问题：无法连接到 MQTT 服务器
**解决方案：**
1. 检查网络连接和防火墙设置
2. 验证服务器地址和端口
3. 确认认证信息正确
4. 检查 SSL/TLS 配置

```bash
# 使用 mosquitto_pub 测试连接
mosquitto_pub -h localhost -p 1883 -t test -m "hello"
```

#### 问题：连接频繁断开
**解决方案：**
1. 调整 keepAlive 参数
2. 检查网络稳定性
3. 增加重连间隔
4. 启用持久会话

```json
{
  "mqtt": {
    "config": {
      "keepAlive": 120,
      "reconnectPeriod": 5000,
      "clean": false
    }
  }
}
```

### 7.2 性能问题

#### 问题：消息发送延迟高
**解决方案：**
1. 增加工作线程数量
2. 调整批处理参数
3. 优化消息大小
4. 使用适当的 QoS 级别

```json
{
  "mqtt": {
    "performance": {
      "maxWorkers": 8,
      "batchSize": 30,
      "batchTimeout": 50
    },
    "publish": {
      "qos": 0
    }
  }
}
```

#### 问题：内存使用过高
**解决方案：**
1. 减少队列大小
2. 启用消息压缩
3. 定期清理缓存
4. 监控内存使用

```json
{
  "mqtt": {
    "performance": {
      "queueSize": 500,
      "enableCompression": true,
      "messageBuffer": 256
    }
  }
}
```

### 7.3 数据问题

#### 问题：数据丢失
**解决方案：**
1. 使用 QoS 1 或 2
2. 启用消息持久化
3. 检查队列溢出
4. 实现消息确认机制

```json
{
  "mqtt": {
    "publish": {
      "qos": 1,
      "retain": true
    },
    "persistence": {
      "enabled": true,
      "path": "./mqtt-cache"
    }
  }
}
```

#### 问题：数据格式错误
**解决方案：**
1. 验证 JSON 格式
2. 检查字符编码
3. 确认数据类型
4. 使用数据验证

```typescript
// 数据验证示例
const validateMQTTMessage = (data: any): boolean => {
  return (
    typeof data === 'object' &&
    data.timestamp &&
    data.deviceId &&
    data.data
  );
};
```

## 8. 最佳实践

### 8.1 主题设计原则

1. **层次化结构**：使用清晰的主题层次结构
2. **避免深层嵌套**：限制主题层级深度（建议 ≤ 5 层）
3. **使用有意义的名称**：主题名称应该简洁明了
4. **避免空格和特殊字符**：使用下划线或连字符

```bash
# 推荐的主题结构
good/topic/structure/sensor/temperature
good/topic/structure/sensor/humidity

# 不推荐的主题结构
bad topic structure/sensor data with spaces
bad/topic/structure/very/deep/nested/topic/hierarchy/sensor/data
```

### 8.2 消息设计原则

1. **保持消息小巧**：单个消息大小建议 ≤ 1KB
2. **使用标准时间格式**：推荐 ISO 8601 格式
3. **包含版本信息**：便于协议升级
4. **添加设备标识**：便于数据追踪

```json
{
  "version": "1.0",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "deviceId": "device001",
  "messageId": "msg_12345",
  "data": {
    "temperature": 25.6
  }
}
```

### 8.3 性能优化建议

1. **合理设置 QoS**：
   - QoS 0：传感器数据（允许丢失）
   - QoS 1：控制命令（需要确认）
   - QoS 2：关键告警（严格一次）

2. **使用连接池**：复用 MQTT 连接

3. **批量处理**：合并多个小消息

4. **数据压缩**：对大消息启用压缩

5. **定期清理**：清理过期数据和连接

### 8.4 安全建议

1. **使用加密连接**：生产环境必须使用 SSL/TLS
2. **身份认证**：配置用户名和密码
3. **访问控制**：限制主题访问权限
4. **定期更新证书**：及时更新 SSL 证书
5. **监控异常活动**：记录和分析连接日志

## 9. 配置模板

### 9.1 开发环境配置

```json
{
  "mqtt": {
    "enabled": true,
    "config": {
      "host": "localhost",
      "port": 1883,
      "clientId": "serial-studio-dev",
      "keepAlive": 60,
      "clean": true
    },
    "publish": {
      "baseTopic": "dev/serial-studio",
      "qos": 0,
      "retain": false,
      "format": "json"
    },
    "performance": {
      "maxWorkers": 1,
      "queueSize": 100,
      "batchSize": 5
    },
    "debug": {
      "enabled": true,
      "level": "debug"
    }
  }
}
```

### 9.2 生产环境配置

```json
{
  "mqtt": {
    "enabled": true,
    "config": {
      "host": "mqtt.example.com",
      "port": 8883,
      "protocol": "mqtts",
      "username": "${MQTT_USERNAME}",
      "password": "${MQTT_PASSWORD}",
      "clientId": "serial-studio-prod-${HOSTNAME}",
      "keepAlive": 120,
      "clean": false,
      "reconnectPeriod": 5000,
      "ca": "/etc/ssl/certs/ca.crt"
    },
    "publish": {
      "baseTopic": "prod/serial-studio",
      "qos": 1,
      "retain": true,
      "format": "json",
      "includeTimestamp": true
    },
    "performance": {
      "maxWorkers": 4,
      "queueSize": 2000,
      "batchSize": 20,
      "batchTimeout": 100,
      "enableCompression": true
    },
    "failover": {
      "enabled": true,
      "servers": [
        {
          "host": "mqtt1.example.com",
          "port": 8883,
          "priority": 1
        },
        {
          "host": "mqtt2.example.com", 
          "port": 8883,
          "priority": 2
        }
      ]
    },
    "debug": {
      "enabled": false,
      "level": "warn"
    }
  }
}
```

### 9.3 高性能配置

```json
{
  "mqtt": {
    "enabled": true,
    "config": {
      "host": "high-perf-mqtt.example.com",
      "port": 1883,
      "clientId": "serial-studio-hp",
      "keepAlive": 300,
      "clean": true,
      "reconnectPeriod": 1000
    },
    "publish": {
      "qos": 0,
      "retain": false,
      "format": "simple"
    },
    "performance": {
      "maxWorkers": 8,
      "queueSize": 5000,
      "batchSize": 50,
      "batchTimeout": 25,
      "enableCompression": false,
      "messageBuffer": 1024,
      "highWaterMark": 2048
    },
    "filters": {
      "minInterval": 10,
      "maxRate": 1000,
      "deduplicate": true
    }
  }
}
```

---

通过以上配置和使用指南，您可以充分利用 Serial-Studio VSCode 插件的 MQTT 功能，实现高效、稳定的串口数据到 MQTT 消息的转发。根据您的具体需求选择合适的配置模板，并根据实际使用情况进行调优。