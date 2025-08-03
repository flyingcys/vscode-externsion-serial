/**
 * MQTT库Mock - 避免真实网络连接
 * 完整模拟MQTT客户端行为，支持测试环境下的连接、发布、订阅等功能
 */

import { EventEmitter } from 'events';
import { vi } from 'vitest';

// Mock MQTT Client类 - 完整的mqtt.MqttClient接口实现
export class MockMqttClient extends EventEmitter {
  connected = false;
  reconnecting = false;
  private _subscriptions = new Map<string, any>();
  private _messageId = 1;
  
  // 构造函数立即设置连接状态
  constructor() {
    super();
    // 在测试环境中立即模拟连接成功
    setTimeout(() => {
      this.connected = true;
      this.emit('connect', { sessionPresent: false });
    }, 5);
  }
  
  connect = vi.fn().mockReturnThis();
  on = vi.fn().mockReturnThis();
  
  publish = vi.fn().mockImplementation((topic: string, message: any, options: any = {}, callback?: Function) => {
    const messageId = this._messageId++;
    // 确保 options 包含 messageId
    if (typeof options === 'object' && options !== null) {
      options.messageId = messageId;
    }
    
    setTimeout(() => {
      // 模拟QoS 0 - 立即完成
      if (!options.qos || options.qos === 0) {
        if (callback) callback(null);
        this.emit('publish', { messageId, topic, message, options });
        return;
      }
      
      // 模拟QoS 1 - PUBACK
      if (options.qos === 1) {
        this.emit('puback', { messageId });
        if (callback) callback(null);
        this.emit('publish', { messageId, topic, message, options });
        return;
      }
      
      // 模拟QoS 2 - PUBREC -> PUBREL -> PUBCOMP
      if (options.qos === 2) {
        this.emit('pubrec', { messageId });
        // 模拟PUBREL响应
        setTimeout(() => {
          this.emit('pubcomp', { messageId });
          if (callback) callback(null);
          this.emit('publish', { messageId, topic, message, options });
        }, 5);
      }
    }, 1);
    
    return this;
  });
  
  subscribe = vi.fn().mockImplementation((topicOrObject: string | object, options: any = {}, callback?: Function) => {
    const messageId = this._messageId++;
    
    setTimeout(() => {
      let subscriptions: Array<{topic: string, qos: number}> = [];
      
      if (typeof topicOrObject === 'string') {
        const topic = topicOrObject;
        const qos = options.qos || 0;
        this._subscriptions.set(topic, { qos, options });
        subscriptions.push({ topic, qos });
      } else {
        // 处理多主题订阅
        Object.entries(topicOrObject).forEach(([topic, qos]) => {
          this._subscriptions.set(topic, { qos: qos as number, options });
          subscriptions.push({ topic, qos: qos as number });
        });
      }
      
      this.emit('suback', { messageId, granted: subscriptions.map(s => s.qos) });
      
      if (callback) {
        callback(null, subscriptions);
      }
      
      this.emit('subscribe', { messageId, subscriptions });
    }, 1);
    
    return this;
  });
  
  unsubscribe = vi.fn().mockImplementation((topics: string | string[], callback?: Function) => {
    const messageId = this._messageId++;
    const topicList = Array.isArray(topics) ? topics : [topics];
    
    setTimeout(() => {
      topicList.forEach(topic => {
        this._subscriptions.delete(topic);
      });
      
      this.emit('unsuback', { messageId });
      
      if (callback) {
        callback(null);
      }
      
      this.emit('unsubscribe', { messageId, topics: topicList });
    }, 1);
    
    return this;
  });
  
  end = vi.fn().mockImplementation((force?: boolean, opts?: any, callback?: Function) => {
    this.connected = false;
    this.reconnecting = false;
    
    setTimeout(() => {
      this.emit('close');
      if (callback) callback();
    }, 1);
    
    return this;
  });
  
  // MQTT特定方法
  pubrel = vi.fn().mockImplementation((packet: { messageId: number }, callback?: (error?: Error) => void) => {
    setTimeout(() => {
      this.emit('pubcomp', { messageId: packet.messageId });
      if (callback) {
        callback();
      }
    }, 1);
    return this;
  });
  
  getLastMessageId = vi.fn().mockReturnValue(this._messageId);
  
  // 测试辅助方法
  simulateMessage(topic: string, message: Buffer, packet: any = {}) {
    setTimeout(() => {
      this.emit('message', topic, message, { 
        topic,
        payload: message,
        qos: packet.qos || 0,
        retain: packet.retain || false,
        dup: packet.dup || false,
        messageId: packet.messageId || this._messageId++,
        ...packet
      });
    }, 1);
  }
  
  simulateError(error: Error) {
    setTimeout(() => {
      this.emit('error', error);
    }, 1);
  }
  
  simulateDisconnect(reason?: string) {
    this.connected = false;
    setTimeout(() => {
      this.emit('disconnect', reason || 'client_disconnect');
    }, 1);
  }
  
  simulateOffline() {
    setTimeout(() => {
      this.emit('offline');
    }, 1);
  }
  
  simulateReconnect() {
    this.reconnecting = true;
    setTimeout(() => {
      this.emit('reconnect');
    }, 1);
  }
  
  // 获取当前订阅
  getSubscriptions() {
    return new Map(this._subscriptions);
  }
}

// Mock connect函数 - 完全避免真实网络连接
export const connect = vi.fn().mockImplementation((brokerUrl?: string, options?: any) => {
  const client = new MockMqttClient();
  
  // 在测试环境中总是立即返回已连接的客户端
  // 不需要异步连接过程，避免超时问题
  
  return client;
});

// Mock其他MQTT导出
export const MqttClient = MockMqttClient;

// 模拟MQTT协议版本
export const MQTTVersion = {
  MQTT_3_1: 3,
  MQTT_3_1_1: 4,
  MQTT_5: 5
};

// 默认导出 - 完整的mqtt模块接口
export default {
  connect,
  MqttClient: MockMqttClient,
  MockMqttClient,
  MQTTVersion
};