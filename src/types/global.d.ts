declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhLocale: any;
  export default zhLocale;
}

declare module 'element-plus/dist/locale/en.mjs' {
  const enLocale: any;
  export default enLocale;
}
type Nullable<T> = T | null

/** layout */
type SizeInfo = {
  height?: number | string
  minHeight?: number | string
  width?: number | string
  minWidth?: number | string
  foldable?: boolean
  isFold?: boolean
  fixed?: boolean // 固定大小，计算的时候不会进行缩放
}