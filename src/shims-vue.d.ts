/**
 * Vue Single File Component type declarations
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue?vue&type=style&index=0&scoped=true&lang=css' {
  const css: any
  export default css
}

declare module '*.vue?vue&type=template&id=*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue?vue&type=script&lang=ts' {
  import type { DefineComponent } from 'vue'  
  const component: DefineComponent<{}, {}, any>
  export default component
}