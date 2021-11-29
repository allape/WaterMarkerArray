import React, {ChangeEvent, useCallback, useEffect, useState} from 'react'
import './App.scss'
import {
  Button,
  FormControl,
  InputLabel, LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
} from '@material-ui/core'
import useStateless, {useStateProxy} from 'react-use-stateless'
import printJS from 'print-js'
import {useTranslation} from 'react-i18next'
import {StackProps} from '@material-ui/core/Stack/Stack'
import {CurrentLanguage, LANGUAGES} from './i18n/config'
import {
  Color,
  ColSpace,
  ContextMenuPosition,
  draw,
  FontFamily,
  FontSize,
  FontWeight,
  PAPER_TYPES,
  PaperSize,
  Precision,
  PRINTING_QUALITIES,
  RawImage,
  RenderingData,
  Rotate,
  RowShift,
  RowSpace,
  Text,
} from './core/core'
import useLoading from 'react-loading-state'
import {WorkerData, WorkerResponse} from './core/worker'

const CanvasContainerID = 'CanvasContainer'

const CommonStackProps: Partial<StackProps> = {
  className: 'form-item-wrapper',
  spacing: 2,
  direction: 'row',
  alignItems: 'center',
}

export default function App() {
  const { t, i18n } = useTranslation()

  const { loading, load, loaded, isLoading } = useLoading()

  // 语言
  const [language, setLanguage] = useState<string>(CurrentLanguage)
  const changeLanguage = useCallback(async (language: string) => {
    await i18n.changeLanguage(language)
    setLanguage(language)
  }, [i18n])

  useEffect(() => {
    window.document.title = t('title')
  }, [t, i18n.language])

  // 纸张大小
  const [paperSize, , paperSizeProxy, setPaperSizeProxy] = useStateProxy<PaperSize>(PAPER_TYPES[1].value)
  // 打印精度
  const [precision, , precisionProxy, setPrecisionProxy] = useStateProxy<Precision>(PRINTING_QUALITIES[1].value)
  // 水印内容
  const [text, , textProxy, setTextProxy] = useStateProxy<Text>(new Date().toLocaleDateString())
  // 字体颜色
  const [color, , colorProxy, setColorProxy] = useStateProxy<Color>('rgba(0, 0, 0, 0.1)')
  // 字体类型
  const [fontFamily, , fontFamilyProxy, setFontFamilyProxy] = useStateProxy<FontFamily>('serif')
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
  const [image, , imageProxy, setImageProxy] = useStateProxy<RawImage>()

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
  const compareRenderingData = useCallback((overrideRenderingData?: Partial<RenderingData>) => {
    const value = lastRenderingData.value
    const renderingData = {...getRenderingData(), ...overrideRenderingData}
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
      console.log('render at', new Date().toLocaleTimeString())
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

        const overrideData = {
          precision: 100,
        }
        const data = {
          ...getRenderingData(),
          ...overrideData,
        }

        draw(cvs, data)

        lastRenderingData.value = data

        if (compareRenderingData(overrideData)) {
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
    renderCanvas().then()
    return () => {
      destroyed.value = true
    }
  }, [renderCanvas, destroyed])

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

  const onFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const lk = load()
      try {
        setImageProxy({
          bitmap: await createImageBitmap(new Blob([await e.target.files[0].arrayBuffer()])),
        })
      } finally {
        loaded(lk)
      }
    }
  }, [setImageProxy, load, loaded])

  const getCanvasImageDataURL = useCallback(async (type: string = 'image/png', usingWorker = true): Promise<string> => {
    const data = getRenderingData()
    if (window.Worker && usingWorker) {
      return new Promise(resolve => {
        const lk = load()
        const resolveWithMainThread = async () => resolve(await getCanvasImageDataURL(type, false))
        try {
          const workerDrawData: WorkerData = {
            type: 'draw',
            data,
          }
          const worker = new Worker(`${process.env.PUBLIC_URL}/core.worker.js`)
          worker.postMessage(workerDrawData)
          worker.onmessage = (ev: MessageEvent<WorkerResponse<string>>) => {
            switch (ev.data.type) {
              case 'then':
                resolve(ev.data.data)
                break
              case 'catch':
                console.error('error in worker response:', ev.data.data)
                resolveWithMainThread()
                break
              case 'finally':
                loaded(lk)
                break
            }
          }
        } catch (e) {
          console.error('error on creating worker:', e)
          resolveWithMainThread()
        }
      })
    } else {
      const cvs = draw(document.createElement('canvas'), data) as HTMLCanvasElement
      return cvs.toDataURL(type, 1)!
    }
  }, [getRenderingData, load, loaded])

  const print = useCallback(async () => {
    printJS({
      printable: await getCanvasImageDataURL(),
      type: 'image',
      style: '@media print { body { margin: 0; padding: 0; } }',
    })
  }, [getCanvasImageDataURL])

  // region 右键

  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | undefined>()
  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    if (isLoading()) return
    setContextMenu(old => old ? undefined : {
      left: event.clientX - 2,
      top: event.clientY - 4,
    })
  }, [isLoading])
  const onContextMenuCancel = useCallback(() => {
    setContextMenu(undefined)
  }, [])

  const onContextMenuPrint = useCallback(() => {
    print().then()
    onContextMenuCancel()
  }, [print, onContextMenuCancel])

  const onContextMenuDownload = useCallback(async () => {
    const a = document.createElement('a')
    a.target = '_blank'
    a.download = `${textProxy.value || 'image'}.png`
    a.href = await getCanvasImageDataURL('image/octet-stream')
    a.click()
    onContextMenuCancel()
  }, [textProxy, getCanvasImageDataURL, onContextMenuCancel])

  // endregion

  useEffect(() => {
    onContextMenuCancel()
  }, [loading, onContextMenuCancel])

  return <div className="app-wrapper">
    <Paper className={`paper form-wrapper ${t('form.style.i18nClass')}`}>
      <Stack {...CommonStackProps}>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="LanguageLabel">{t('form.languageLabel')}</InputLabel>
          <Select labelId="LanguageLabel" disabled={loading}
                  value={language} onChange={e => changeLanguage(e.target.value)}>
            {LANGUAGES.map(lan =>
              <MenuItem key={lan.language} value={lan.language}>{lan.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Stack {...CommonStackProps}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="PaperSizeLabel">{t('form.paperSizeLabel')}</InputLabel>
            <Select labelId="PaperSizeLabel" disabled={loading}
                    value={paperSize} onChange={e => setPaperSizeProxy(e.target.value)}>
              {PAPER_TYPES.map(paper =>
                <MenuItem key={paper.value} value={paper.value}>{paper.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl variant="standard" fullWidth>
          <InputLabel id="PrecisionLabel">{t('form.printQuality')}</InputLabel>
          <Select<Precision> labelId="PrecisionLabel" disabled={loading}
                  value={precision} onChange={e => setPrecisionProxy(e.target.value as number)}>
            {PRINTING_QUALITIES.map(pre =>
              <MenuItem key={pre.value} value={pre.value}>{pre.label}</MenuItem>)}
          </Select>
        </FormControl>
        </Stack>
      </Stack>
      <Stack {...CommonStackProps}>
        <TextField fullWidth label={t('form.waterMarkerText')} variant="standard"
                   disabled={loading}
                   value={text} onChange={e => setTextProxy(e.target.value)} />
      </Stack>
      <Stack {...CommonStackProps}>
        {/*<FormControl variant="standard" fullWidth>*/}
        {/*  <InputLabel id="FontFamilyLabel">{t('form.font.familyLabel')}:</InputLabel>*/}
        {/*  <Select<FontFamily> labelId="FontFamilyLabel" disabled={loading}*/}
        {/*                     value={fontFamily} onChange={e => setFontFamilyProxy(e.target.value)}>*/}
        {/*    {FONT_FAMILIES.map(font =>*/}
        {/*      <MenuItem key={font.label} value={font.value}>{font.label}</MenuItem>)}*/}
        {/*  </Select>*/}
        {/*</FormControl>*/}
        <TextField fullWidth
                   label={t('form.font.familyLabel')} variant="standard"
                   value={fontFamily} disabled={loading} onChange={e => setFontFamilyProxy(e.target.value)} />
        <TextField fullWidth type="number"
                   label={t('form.font.weightLabel')} variant="standard"
                   value={fontWeight} disabled={loading} onChange={e => setFontWeightProxy(e.target.value)} />
      </Stack>
      <Stack {...CommonStackProps}>
        <TextField fullWidth label={t('form.font.colorLabel')} variant="standard"
                   value={color} disabled={loading} onChange={e => setColorProxy(e.target.value)} />
        <Stack {...CommonStackProps}>
          <div className="form-item-name">{t('form.font.sizeLabel')} (mm):</div>
          <Slider aria-label={t('form.font.sizeLabel')} valueLabelDisplay="auto"
                  min={2} disabled={loading}
                  value={fontSize} onChange={(_, value) => setFontSizeProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack {...CommonStackProps}>
        <Stack {...CommonStackProps}>
          <div className="form-item-name">{t('form.layout.rowSpaceLabel')} (mm):</div>
          <Slider aria-label={t('form.layout.rowSpaceLabel')} valueLabelDisplay="auto"
                  min={1} disabled={loading}
                  value={rowSpace} onChange={(_, value) => setRowSpaceProxy(value as number)} />
        </Stack>
        <Stack {...CommonStackProps}>
          <div className="form-item-name">{t('form.layout.colSpaceLabel')} (mm):</div>
          <Slider aria-label={t('form.layout.colSpaceLabel')} valueLabelDisplay="auto"
                  min={1} disabled={loading}
                  value={colSpace} onChange={(_, value) => setColSpaceProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack {...CommonStackProps}>
        <Stack {...CommonStackProps}>
          <div className="form-item-name">{t('form.layout.rotateLabel')} (°):</div>
          <Slider aria-label={t('form.layout.rotateLabel')} valueLabelDisplay="auto"
                  min={0} max={360} disabled={loading}
                  value={rotate} onChange={(_, value) => setRotateProxy(value as number)} />
        </Stack>
        <Stack {...CommonStackProps}>
          <div className="form-item-name">{t('form.layout.rowShiftLabel')} (mm):</div>
          <Slider aria-label={t('form.layout.rowShiftLabel')} valueLabelDisplay="auto"
                  min={0} disabled={loading}
                  value={rowShift} onChange={(_, value) => setRowShiftProxy(value as number)} />
        </Stack>
      </Stack>
      <Stack {...CommonStackProps}>
        <Stack {...CommonStackProps}>
          <TextField fullWidth label={t('form.backgroundImage')} variant="standard"
                     InputLabelProps={{
                       shrink: true,
                     }}
                     type="file" disabled={loading} onChange={onFileChange} />
          <Button disabled={loading} onClick={print}>{t('form.print')}</Button>
        </Stack>
      </Stack>
      <LinearProgress className="progress-indicator" style={{ opacity: loading ? 1 : 0 }} />
    </Paper>
    <Paper className="canvas-container" id={CanvasContainerID} onContextMenu={onContextMenu} />
    <Menu open={!!contextMenu} onClose={onContextMenuCancel}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu}>
      <MenuItem onClick={onContextMenuPrint}>{t('form.print')}</MenuItem>
      <MenuItem onClick={onContextMenuDownload}>{t('form.download')}</MenuItem>
    </Menu>
  </div>
}
