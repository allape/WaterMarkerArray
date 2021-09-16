import React, {useCallback, useEffect} from 'react'
import './App.scss'
import {Paper, Slider, Stack} from '@material-ui/core'
import useStateless, {useStateProxy} from 'react-use-stateless'
import printJS from 'print-js'

const CanvasContainerID = 'CanvasContainer'

type RowSpace = number
type ColSpace = number
interface RenderingData {
  rowSpace: RowSpace
  colSpace: ColSpace
}

export default function App() {
  const [rowSpace, , rowSpaceProxy, setRowSpaceProxy] = useStateProxy<RowSpace>(20)
  const [colSpace, , colSpaceProxy, setColSpaceProxy] = useStateProxy<ColSpace>(20)

  const [canvas] = useStateless<HTMLCanvasElement | undefined>(undefined)
  const [destroyed] = useStateless(false)

  // 上一次渲染的数据
  const [lastRenderingData] = useStateless<RenderingData>({
    rowSpace: -1,
    colSpace: -1,
  })
  // 返回true当数据不同时
  const compareRenderingData = useCallback(() => {
    const value = lastRenderingData.value
    return value.rowSpace !== rowSpaceProxy.value
      || value.colSpace !== colSpaceProxy.value
  }, [
    lastRenderingData,
    rowSpaceProxy, colSpaceProxy
  ])

  const renderCanvas = useCallback(async () => {
    if (!canvas.value) {
      const container = document.getElementById(CanvasContainerID)
      if (container) {
        canvas.value = document.createElement('canvas')
        container.append(canvas.value)
      } else {
        requestAnimationFrame(renderCanvas)
        return
      }
    } else {
      const ctx: CanvasRenderingContext2D = canvas.value?.getContext('2d')!
      if (compareRenderingData()) {
        requestAnimationFrame(renderCanvas)
      }
    }
  }, [
    canvas, compareRenderingData,
    rowSpaceProxy, colSpaceProxy,
  ])

  useEffect(() => {
    return () => {
      destroyed.value = true
    }
  }, [destroyed])

  useEffect(() => {
    renderCanvas().then()
  }, [
    renderCanvas,
    // 触发重新渲染的数据
    rowSpace, colSpace,
  ])

  const print = useCallback(() => {
    printJS(canvas.value?.toDataURL('image/png', 1)!, 'image')
  }, [canvas])

  return <div className="app-wrapper">
    <Paper className="paper">
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <div className="slider-name">水平间隔:</div>
        <Slider aria-label="水平间隔" value={rowSpace} onChange={(_, value) => setRowSpaceProxy(value as number)} />
      </Stack>
      <Stack className="slider-wrapper" spacing={2} direction="row" alignItems="center">
        <div className="slider-name">垂直间隔:</div>
        <Slider aria-label="垂直间隔" value={colSpace} onChange={(_, value) => setColSpaceProxy(value as number)} />
      </Stack>
    </Paper>
    <Paper id={CanvasContainerID} className="paper">

    </Paper>
  </div>
}
