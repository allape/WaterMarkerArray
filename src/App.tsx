import React, {ChangeEvent, useCallback, useEffect} from 'react'
import './App.scss'
import {Button, FormControl, InputLabel, MenuItem, Paper, Select, Slider, Stack, TextField} from '@material-ui/core'
import useStateless, {useStateProxy} from 'react-use-stateless'
import printJS from 'print-js'
import {FONT_FAMILIES, INCH2MM, PAPER_TYPE_MAP, PAPER_TYPES, PRINTING_QUALITIES} from './model/printer'

const CanvasContainerID = 'CanvasContainer'

type PaperSize = string
type Precision = number
type Text = string
type Color = string
type FontFamily = string
type FontSize = number
type FontWeight = string
type RowSpace = number
type ColSpace = number
type Rotate = number
type RowShift = number
interface RenderingData {
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

const draw = (cvs: HTMLCanvasElement, data: RenderingData) => {
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

  // 添加图片
  if (data.image) {
    ctx.drawImage(data.image, 0, 0, cvs.width, cvs.height)
  }
  // 设置旋转
  ctx.translate(cvs.width / 2, cvs.height / 2)
  ctx.rotate(data.rotate * Math.PI / 180)
  // 设置当前画笔到实际文本绘制区域的左上角
  ctx.translate(- textBoxWidth / 2, - textBoxWidth / 2)
  // 清空内容
  ctx.fillStyle = '#ffffff'
  ctx.clearRect(0, 0, textBoxWidth, textBoxWidth)

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
      rowCount ++
    }

    ctx.fillText(text, currentX, 0)

    currentX += textWidth + rowSpace
  }
}

export default function App() {
  // 纸张大小
  const [paperSize, , paperSizeProxy, setPaperSizeProxy] = useStateProxy<PaperSize>(PAPER_TYPES[1].value)
  // 打印精度
  const [precision, , precisionProxy, setPrecisionProxy] = useStateProxy<Precision>(PRINTING_QUALITIES[1].value)
  // 水印内容
  const [text, , textProxy, setTextProxy] = useStateProxy<Text>(new Date().toLocaleDateString())
  // 字体颜色
  const [color, , colorProxy, setColorProxy] = useStateProxy<Color>('rgba(0, 0, 0, 0.1)')
  // 字体类型
  const [fontFamily, , fontFamilyProxy, setFontFamilyProxy] = useStateProxy<FontFamily>(FONT_FAMILIES[0].value)
  // 字体大小
  const [fontSize, , fontSizeProxy, setFontSizeProxy] = useStateProxy<FontSize>(6)
  // 字重
  const [fontWeight, , fontWeightProxy, setFontWeightProxy] = useStateProxy<FontWeight>('400')
  // 水平间距
  const [rowSpace, , rowSpaceProxy, setRowSpaceProxy] = useStateProxy<RowSpace>(10)
  // 垂直间距
  const [colSpace, , colSpaceProxy, setColSpaceProxy] = useStateProxy<ColSpace>(10)
  // 旋转角度
  const [rotate, , rotateProxy, setRotateProxy] = useStateProxy<Rotate>(315)
  // 每一行文字的偏移量
  const [rowShift, , rowShiftProxy, setRowShiftProxy] = useStateProxy<RowShift>(10)

  // 上传的图片
  const [image, , imageProxy, setImageProxy] = useStateProxy<HTMLImageElement | undefined>()

  const [canvas] = useStateless<HTMLCanvasElement | undefined>(undefined)
  const [rendering] = useStateless(false)
  const [destroyed] = useStateless(false)

  const getRenderingData = useCallback((): RenderingData => ({
    paperSize: paperSizeProxy.value,
    precision: precisionProxy.value,
    text: textProxy.value,
    color: colorProxy.value,
    fontFamily: fontFamilyProxy.value,
    fontSize: fontSizeProxy.value,
    fontWeight: fontWeightProxy.value,
    rowSpace: rowSpaceProxy.value,
    colSpace: colSpaceProxy.value,
    rotate: rotateProxy.value,
    rowShift: rowShiftProxy.value,
    image: imageProxy.value,
  }), [
    paperSizeProxy, precisionProxy,
    textProxy, colorProxy,
    fontFamilyProxy, fontSizeProxy, fontWeightProxy,
    rowSpaceProxy, colSpaceProxy,
    rotateProxy, rowShiftProxy,
    imageProxy,
  ])

  // 上一次渲染的数据
  const [lastRenderingData] = useStateless<RenderingData>({
    paperSize: '',
    precision: -1,
    text: '',
    color: '',
    fontFamily: '',
    fontSize: -1,
    fontWeight: '',
    rowSpace: -1,
    colSpace: -1,
    rotate: -1,
    rowShift: -1,
  })
  // 返回true当数据不同时
  const compareRenderingData = useCallback(() => {
    const value = lastRenderingData.value
    const renderingData = getRenderingData()
    return value.paperSize !== renderingData.paperSize
      || value.precision !== renderingData.precision
      || value.text !== renderingData.text
      || value.color !== renderingData.color
      || value.fontFamily !== renderingData.fontFamily
      || value.fontSize !== renderingData.fontSize
      || value.fontWeight !== renderingData.fontWeight
      || value.rowSpace !== renderingData.rowSpace
      || value.colSpace !== renderingData.colSpace
      || value.rotate !== renderingData.rotate
      || value.rowShift !== renderingData.rowShift
  }, [
    lastRenderingData, getRenderingData,
  ])

  const renderCanvas = useCallback(async () => {
    if (destroyed.value) return

    let requestedNextFrame = false
    try {
      rendering.value = true
      if (!canvas.value) {
        const container = document.getElementById(CanvasContainerID)
        if (container) {
          canvas.value = document.createElement('canvas')
          canvas.value!.style.width = '100%'
          container.append(canvas.value)
        } else {
          requestedNextFrame = true
          requestAnimationFrame(renderCanvas)
          return
        }
      } else {
        const cvs: HTMLCanvasElement = canvas.value!

        const data = {
          ...getRenderingData(),
          precision: 100,
        }

        draw(cvs, data)

        lastRenderingData.value = data

        if (compareRenderingData()) {
          requestedNextFrame = true
          requestAnimationFrame(renderCanvas)
        }
      }
    } finally {
      rendering.value = requestedNextFrame
    }
  }, [
    destroyed, rendering,

    canvas, lastRenderingData, compareRenderingData,

    getRenderingData,
  ])

  useEffect(() => {
    return () => {
      destroyed.value = true
    }
  }, [destroyed])

  useEffect(() => {
    if (!rendering.value) {
      renderCanvas().then()
    }
  }, [
    renderCanvas, rendering,
    // 触发重新渲染的数据
    paperSize, precision,
    text, color,
    fontFamily, fontSize, fontWeight,
    rowSpace, colSpace,
    rotate, rowShift,
    image,
  ])

  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const img = new Image()
      img.onload = () => {
        setImageProxy(img)
      }
      img.src = URL.createObjectURL(e.target.files[0])
    }
  }, [setImageProxy])

  const print = useCallback(() => {
    const cvs: HTMLCanvasElement = document.createElement('canvas')
    const renderingData = getRenderingData()

    const paper = PAPER_TYPE_MAP[renderingData.paperSize]
    cvs.width = paper.width / INCH2MM * renderingData.precision
    cvs.height = paper.height / INCH2MM * renderingData.precision

    draw(cvs, renderingData)

    printJS(cvs.toDataURL('image/png', 1)!, 'image')
  }, [getRenderingData])

  return <div className="app-wrapper">
    <Paper className="paper">
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <FormControl variant="standard" fullWidth>
          <InputLabel id="PaperSizeLabel">纸张大小</InputLabel>
          <Select labelId="PaperSizeLabel"
                  value={paperSize} onChange={e => setPaperSizeProxy(e.target.value)}>
            {PAPER_TYPES.map(paper =>
              <MenuItem key={paper.value} value={paper.value}>{paper.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="PrecisionLabel">打印精度</InputLabel>
          <Select<Precision> labelId="PrecisionLabel"
                  value={precision} onChange={e => setPrecisionProxy(e.target.value as number)}>
            {PRINTING_QUALITIES.map(pre =>
              <MenuItem key={pre.value} value={pre.value}>{pre.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <TextField className="full-width" label="水印内容" variant="standard" value={text} onChange={e => setTextProxy(e.target.value)} />
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <FormControl variant="standard" fullWidth>
          <InputLabel id="FontFamilyLabel">字体类型:</InputLabel>
          <Select<FontFamily> labelId="FontFamilyLabel"
                             value={fontFamily} onChange={e => setFontFamilyProxy(e.target.value)}>
            {FONT_FAMILIES.map(font =>
              <MenuItem key={font.label} value={font.value}>{font.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField className="full-width" label="字重" variant="standard"
                   value={fontWeight} onChange={e => setFontWeightProxy(e.target.value)} />
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <TextField className="full-width" label="字体颜色" variant="standard"
                   value={color} onChange={e => setColorProxy(e.target.value)} />
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <div className="slider-name">字体大小(mm):</div>
          <Slider aria-label="字体大小" valueLabelDisplay="auto"
                  min={2}
                  value={fontSize} onChange={(_, value) => setFontSizeProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <div className="slider-name">水平间隔(mm):</div>
          <Slider aria-label="水平间隔" valueLabelDisplay="auto"
                  min={1}
                  value={rowSpace} onChange={(_, value) => setRowSpaceProxy(value as number)} />
        </Stack>
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <div className="slider-name">垂直间隔(mm):</div>
          <Slider aria-label="垂直间隔" valueLabelDisplay="auto"
                  min={1}
                  value={colSpace} onChange={(_, value) => setColSpaceProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <div className="slider-name">旋转角度(°):</div>
          <Slider aria-label="旋转角度" valueLabelDisplay="auto"
                  min={0} max={360}
                  value={rotate} onChange={(_, value) => setRotateProxy(value as number)} />
        </Stack>
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <div className="slider-name">水平偏移(mm):</div>
          <Slider aria-label="水平偏移" valueLabelDisplay="auto"
                  min={1}
                  value={rowShift} onChange={(_, value) => setRowShiftProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
          <Button onClick={print}>打印</Button>
          <TextField className="full-width" label="背景图片" variant="standard"
                     type="file" onChange={onFileChange} />
        </Stack>
      </Stack>
    </Paper>
    <Paper id={CanvasContainerID}>

    </Paper>
  </div>
}
