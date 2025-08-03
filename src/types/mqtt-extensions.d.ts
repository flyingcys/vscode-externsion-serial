/**
 * MQTT 库扩展类型定义
 * 为 mqtt.js 库添加额外的类型支持
 */

declare module 'mqtt' {
  // 直接扩展现有的接口
  interface IClientPublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
    dup?: boolean;
    messageId?: number;
  }

  interface IClientOptions {
    hostname?: string;
    port?: number;
    clientId?: string;
    username?: string;
    password?: string;
    clean?: boolean;
    keepalive?: number;
    connectTimeout?: number;
    protocolVersion?: number;
    [key: string]: any;
  }

  // 扩展MqttClient接口
  interface MqttClient {
    pubrel(packet: { messageId: number }, callback?: (error?: Error) => void): void;
    
    // 扩展事件监听器以支持QoS相关事件
    on(event: 'puback', callback: (packet: { messageId: number }) => void): MqttClient;
    on(event: 'pubrec', callback: (packet: { messageId: number }) => void): MqttClient;
    on(event: 'pubcomp', callback: (packet: { messageId: number }) => void): MqttClient;
  }

  // 为了向后兼容，保留我们自己的接口定义
  export interface IClientOptions {
    hostname?: string;
    port?: number;
    clientId?: string;
    username?: string;
    password?: string;
    clean?: boolean;
    keepalive?: number;
    connectTimeout?: number;
    protocolVersion?: number;
    [key: string]: any;
  }

  export interface IClientPublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
    dup?: boolean;
    messageId?: number;
  }

  export interface MqttClient extends mqtt.Client {
    connected: boolean;
    
    connect(): MqttClient;
    end(force?: boolean, options?: any, callback?: (() => void)): MqttClient;
    
    publish(topic: string, message: string | Buffer, callback?: (error?: Error, packet?: any) => void): MqttClient;
    publish(topic: string, message: string | Buffer, options: IClientPublishOptions, callback?: (error?: Error, packet?: any) => void): MqttClient;
    
    subscribe(topic: string | string[], callback?: (error?: Error, granted?: any) => void): MqttClient;
    subscribe(topic: string | string[], options: any, callback?: (error?: Error, granted?: any) => void): MqttClient;
    
    unsubscribe(topic: string | string[], callback?: (error?: Error) => void): MqttClient;
    
    on(event: 'connect', callback: () => void): MqttClient;
    on(event: 'message', callback: (topic: string, payload: Buffer, packet: any) => void): MqttClient;
    on(event: 'error', callback: (error: Error) => void): MqttClient;
    on(event: 'close', callback: () => void): MqttClient;
    on(event: 'disconnect', callback: () => void): MqttClient;
    on(event: 'puback', callback: (packet: { messageId: number }) => void): MqttClient;
    on(event: 'pubrec', callback: (packet: { messageId: number }) => void): MqttClient;
    on(event: 'pubcomp', callback: (packet: { messageId: number }) => void): MqttClient;
    on(event: string, callback: (...args: any[]) => void): MqttClient;
    
    once(event: 'connect', callback: () => void): MqttClient;
    once(event: 'error', callback: (error: Error) => void): MqttClient;
    once(event: string, callback: (...args: any[]) => void): MqttClient;
    
    pubrel(packet: { messageId: number }, callback?: (error?: Error) => void): void;
  }

  export function connect(brokerUrl?: string, options?: IClientOptions): MqttClient;
  export function connect(options: IClientOptions): MqttClient;
}

// 全局声明
declare global {
  namespace NodeJS {
    interface Global {
      WeakRef: typeof WeakRef;
    }
  }
}