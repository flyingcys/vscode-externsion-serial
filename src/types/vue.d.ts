/**
 * Vue 3 Type Declarations for VSCode Extension Environment
 * 为 VSCode 扩展环境提供 Vue 3 类型声明
 */

declare module 'vue' {
  import { ComponentInternalInstance } from '@vue/runtime-core';
  
  export interface Ref<T = any> {
    value: T;
  }
  
  export interface ComputedRef<T = any> extends WritableComputedRef<T> {
    readonly value: T;
  }
  
  export interface WritableComputedRef<T> extends Ref<T> {
    readonly effect: any;
  }
  
  export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);
  
  export type WatchCallback<V = any, OV = any> = (
    value: V,
    oldValue: OV,
    onInvalidate: (fn: () => void) => void
  ) => any;
  
  export interface WatchOptions {
    immediate?: boolean;
    deep?: boolean;
    flush?: 'pre' | 'post' | 'sync';
  }
  
  // Core composition functions
  export function ref<T>(value: T): Ref<T>;
  export function ref<T = any>(): Ref<T | undefined>;
  
  export function computed<T>(getter: () => T): ComputedRef<T>;
  export function computed<T>(options: {
    get: () => T;
    set: (value: T) => void;
  }): WritableComputedRef<T>;
  
  export function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
  ): () => void;
  
  export function watch<T extends readonly WatchSource[]>(
    sources: T,
    callback: WatchCallback<
      { [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never }
    >,
    options?: WatchOptions
  ): () => void;
  
  export function watchEffect(
    effect: (onInvalidate: (fn: () => void) => void) => void,
    options?: {
      flush?: 'pre' | 'post' | 'sync';
    }
  ): () => void;
  
  // Lifecycle hooks
  export function onMounted(hook: () => void): void;
  export function onUnmounted(hook: () => void): void;
  export function onUpdated(hook: () => void): void;
  export function onBeforeMount(hook: () => void): void;
  export function onBeforeUnmount(hook: () => void): void;
  export function onBeforeUpdate(hook: () => void): void;
  
  // Utility functions
  export function reactive<T extends object>(target: T): T;
  export function readonly<T>(target: T): Readonly<T>;
  export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>;
  export function unref<T>(ref: T | Ref<T>): T;
  export function toRef<T extends object, K extends keyof T>(
    object: T,
    key: K
  ): Ref<T[K]>;
  export function toRefs<T extends object>(
    object: T
  ): { [K in keyof T]: Ref<T[K]> };
  
  // Component related
  export function getCurrentInstance(): ComponentInternalInstance | null;
  export function nextTick(fn?: () => void): Promise<void>;
  
  // App creation
  export interface App<HostElement = any> {
    version: string;
    config: any;
    use(plugin: any, ...options: any[]): this;
    mixin(mixin: any): this;
    component(name: string): any;
    component(name: string, component: any): this;
    directive(name: string): any;
    directive(name: string, directive: any): this;
    mount(rootContainer: HostElement | string): any;
    unmount(): void;
    provide<T>(key: string | symbol, value: T): this;
  }
  
  export function createApp(rootComponent: any, rootProps?: any): App;
  
  // Other exports that might be needed
  export function provide<T>(key: string | symbol, value: T): void;
  export function inject<T>(key: string | symbol): T | undefined;
  export function inject<T>(key: string | symbol, defaultValue: T): T;
}

// Pinia store definitions
declare module 'pinia' {
  export interface StoreDefinition<
    Id extends string = string,
    S = any,
    G = any,
    A = any
  > {
    (pinia?: any, hot?: any): any;
    $id: Id;
  }
  
  export function defineStore<Id extends string>(
    id: Id,
    setup: () => any
  ): StoreDefinition<Id>;
  
  export function defineStore<Id extends string, S, G, A>(
    id: Id,
    options: {
      state?: () => S;
      getters?: G;
      actions?: A;
    }
  ): StoreDefinition<Id, S, G, A>;
  
  export function createPinia(): any;
  export function setActivePinia(pinia: any): void;
}

// Vue 单文件组件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}