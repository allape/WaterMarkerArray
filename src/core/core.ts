export type PaperSize = string
export type Precision = number
export type Text = string
export type Color = string
export type FontFamily = string
export type FontSize = number
export type FontWeight = string
export type RowSpace = number
export type ColSpace = number
export type Rotate = number
export type RowShift = number

export interface RenderingData {
  paperSize: PaperSize
  precision: Precision
  text: Text
  color: Color
  fontFamily: FontFamily
  fontSize: FontSize
  fontWeight: FontWeight
  rowSpace: RowSpace
  colSpace: ColSpace
  rotate: Rotate
  rowShift: RowShift
  image?: HTMLImageElement
}

export interface ContextMenuPosition {
  left: number;
  top: number;
}

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
export const PAPER_TYPE_MAP: { [key: string]: Paper } = {
  A3: {width: 297, height: 420},
  A4: {width: 210, height: 297},
  A5: {width: 148, height: 210},
  B4: {width: 250, height: 353},
  B5: {width: 176, height: 250},
}
export const PAPER_TYPES: LV<string>[] = Object.keys(PAPER_TYPE_MAP).map(i => ({value: i, label: i}))

// 精度(ppi)
export const PRINTING_QUALITIES: LV<number>[] = [
  {value: 200, label: '200ppi'},
  {value: 300, label: '300ppi'},
  {value: 600, label: '600ppi'},
]

// 1in = 25.4mm
export const INCH2MM = 25.4

// 浏览器所有的字体
export const FONT_FAMILIES: LV<string>[] = [
  {label: '-default-', value: 'serif'},
  ...Array.from(new Set(Array.from(document.fonts).map(font => font.family)))
    .map(font => ({label: font, value: font})),
]

/**
 * 主要方法
 * @param cvs 绘制的canvas对象
 * @param data 绘制内容
 */
export const draw = (cvs: HTMLCanvasElement, data: RenderingData) => {
  const ctx: CanvasRenderingContext2D = cvs.getContext('2d')!

  // 根据打印精度和纸张大小确定画布大小
  const paper = PAPER_TYPE_MAP[data.paperSize]
  const precision = data.precision
  cvs.width = paper.width / INCH2MM * precision
  cvs.height = paper.height / INCH2MM * precision

  // 转换数据, 因为有的是毫米单位, 应转为px
  const fontSize = data.fontSize / INCH2MM * precision
  const rowSpace = data.rowSpace / INCH2MM * precision
  const colSpace = data.colSpace / INCH2MM * precision
  const rowShift = data.rowShift / INCH2MM * precision

  // 获取最长的那个边, 然后以那个长度的两倍值作为实际的文本绘制区域, 这样在旋转的时候就不会出现空白的地方了
  const textBoxWidth = Math.max(cvs.width, cvs.height) * 2

  // 画布高宽一半的值
  const cvsHalfWidth = cvs.width / 2, cvsHalfHeight = cvs.height / 2
  // 新的原点
  const originX = -textBoxWidth / 2, originY = -textBoxWidth / 2

  // 清空内容
  ctx.fillStyle = '#ffffff'
  ctx.clearRect(originX + cvsHalfWidth, originY + cvsHalfHeight, textBoxWidth, textBoxWidth)

  // 添加图片
  if (data.image) {
    ctx.drawImage(data.image, 0, 0, cvs.width, cvs.height)
  }
  // 设置当前光标到画布的中心
  ctx.translate(cvsHalfWidth, cvsHalfHeight)
  // 设置旋转
  ctx.rotate(data.rotate * Math.PI / 180)
  // 设置当前画笔到实际文本绘制区域的左上角
  ctx.translate(originX, originY)

  // 绘制的内容
  const text = data.text

  // 设置字体并获取字体高度和宽度, 用于计算下一次的偏移量
  ctx.font = `${data.fontWeight || 'normal'} ${fontSize}px ${data.fontFamily || 'serif'}`
  ctx.textBaseline = 'middle'
  const mat = ctx.measureText(text)
  const textWidth = mat.width
  const textHeight = mat.fontBoundingBoxAscent + mat.fontBoundingBoxDescent

  // 开始绘制
  ctx.fillStyle = data.color
  let currentX = 0, currentY = 0, rowCount = 0
  while (currentY <= textBoxWidth) {
    if (currentX > textBoxWidth + rowShift * rowCount) {
      const colShift = textHeight + colSpace
      ctx.translate(-rowShift, colShift)
      currentX = -rowShift * rowCount
      currentY += colShift
      rowCount++
    }

    ctx.fillText(text, currentX, 0)

    currentX += textWidth + rowSpace
  }
}
