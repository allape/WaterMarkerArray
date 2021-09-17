export interface LV<T = any> {
  label: string
  value?: T
  color?: string
  [key: string]: any
}

export interface Paper {
  // 宽(mm)
  width: number
  // 高(mm)
  height: number
}

// 纸张
export const PAPER_TYPE_MAP: {[key: string]: Paper} = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
}
export const PAPER_TYPES: LV<string>[] = Object.keys(PAPER_TYPE_MAP).map(i => ({ value: i, label: i }))

// 精度(ppi)
export const PRINTING_QUALITIES: LV<number>[] = [
  { value: 200, label: '200ppi' },
  { value: 300, label: '300ppi' },
  { value: 600, label: '600ppi' },
]

// 1in = 25.4mm
export const INCH2MM = 25.4

// 浏览器所有的字体
export const FONT_FAMILIES: LV<string>[] = [
  { label: '-default-', value: 'serif' },
  ...Array.from(new Set(Array.from(document.fonts).map(font => font.family)))
    .map(font => ({ label: font, value: font })),
]
