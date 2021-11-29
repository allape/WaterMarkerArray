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
export interface RawImage {
  bitmap: ImageBitmap
}

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
  image?: RawImage
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
  {value: 1200, label: '1200ppi'},
]

// 1in = 25.4mm
export const INCH2MM = 25.4

// 浏览器所有的字体
// export const FONT_FAMILIES: LV<string>[] = [
//   {label: '-default-', value: 'serif'},
//   {label: '微软雅黑', value: '微软雅黑'},
//   // ...Array.from(new Set(Array.from(document?.fonts || []).map(font => font.family)))
//   //   .map(font => ({label: font, value: font})),
// ]

export const global = self || window

/**
 * 转换blob为data url
 * @param blob Blob
 */
export function blob2dataURL (blob: Blob): Promise<string> {
  const fileReader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    fileReader.onload = e => {
      const result = e.target?.result
      if (!result) reject('null value')
      else resolve(result as string)
    }
    fileReader.onerror = e => reject(e)
    fileReader.onabort = e => reject(e)
    fileReader.readAsDataURL(blob)
  })
}

/**
 * 主要方法
 * @param cvs 绘制的canvas对象
 * @param data 绘制内容
 */
export function draw (cvs: HTMLCanvasElement | OffscreenCanvas | null, data: RenderingData): HTMLCanvasElement | OffscreenCanvas {
  // 根据打印精度和纸张大小确定画布大小
  const paper = PAPER_TYPE_MAP[data.paperSize]
  const precision = data.precision

  // 毫米数除以这个值就是对应的像素值. 推算方式: mm / INCH2MM * precision
  const ppmRatio = INCH2MM / precision

  // 实际画布大小
  const cvsWidth = paper.width / ppmRatio
  const cvsHeight = paper.height / ppmRatio

  if (cvs == null) {
    if ('OffscreenCanvas' in global) {
      cvs = new OffscreenCanvas(cvsWidth, cvsHeight)
    } else {
      throw new Error('Current browser does NOT support OffscreenCanvas, you have to provide a Canvas Object to render.')
    }
  } else {
    cvs.width = cvsWidth
    cvs.height = cvsHeight
  }

  const ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D = cvs.getContext('2d')!

  // 转换数据, 因为有的是毫米单位, 应转为px
  const fontSize = data.fontSize / ppmRatio
  const rowSpace = data.rowSpace / ppmRatio
  const colSpace = data.colSpace / ppmRatio
  const rowShift = data.rowShift / ppmRatio

  // 获取最长的那个边, 然后以那个长度的两倍值作为实际的文本绘制区域, 这样在旋转的时候就不会出现空白的地方了
  const textBoxWidth = Math.max(cvsWidth, cvsHeight) * 2

  // 画布高宽一半的值
  const cvsHalfWidth = cvsWidth / 2, cvsHalfHeight = cvsHeight / 2
  // 新的原点
  const originX = -textBoxWidth / 2, originY = -textBoxWidth / 2

  // 清空内容
  ctx.fillStyle = '#ffffff'
  ctx.clearRect(originX + cvsHalfWidth, originY + cvsHalfHeight, textBoxWidth, textBoxWidth)

  // 添加图片
  if (data.image) {
    ctx.drawImage(data.image.bitmap, 0, 0, cvsWidth, cvsHeight)
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

  return cvs
}
