import {blob2dataURL, draw, global, RenderingData} from './core'

export interface WorkerData {
  type: 'draw'
  data: RenderingData & {
    type?: string,
    quality?: number
  }
}

export interface WorkerResponse<T = any> {
  type: 'then' | 'catch' | 'finally'
  data: T
}

onmessage = async (e: MessageEvent<WorkerData>) => {
  try {
    if (!('OffscreenCanvas' in global)) {
      postMessage({
        type: 'catch',
        data: 'OffscreenCanvas is not available',
      })
      return
    }
    switch (e.data?.type) {
      case 'draw':
        const cvs = draw(null, e.data.data) as OffscreenCanvas
        // 🤫
        // await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
        postMessage({
          type: 'then',
          data: await blob2dataURL(await cvs.convertToBlob({
            type: e.data.data?.type || 'image/png',
            quality: e.data.data?.quality || 1,
          })),
        })
        break
    }
  } catch (e) {
    postMessage({
      type: 'catch',
      data: e,
    })
  } finally {
    postMessage({
      type: 'finally',
    })
  }
}
