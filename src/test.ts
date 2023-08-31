import { create, Stage } from "./index"

type Stages =
  | Stage<{ stage: 'idle', context: undefined }>
  | Stage<{ stage: 'success', context: string }>
  | Stage<{ stage: 'error', context: Error }>

const x = create<Stages>()
  .transition({
    name: 'init',
    from: 'idle',
    to: ['error', 'success'],
    async execution(ctx, param: () => {}) {
      if (true) {
        return { stage: 'success', context: {} as string }
      } else {
        return { stage: 'error', context: new Error('unexpected')}
      }
    }
  })
  .transition({
    name: 'reset',
    from: ['error', 'success'],
    to: 'idle',
    execution(ctx) {
      return { stage: 'idle', context: undefined }
    }
  })
  .transition({
    name: 'retry',
    from: ['error', 'success'],
    to: ['error', 'success'],
    execution(ctx) {
      return { stage: 'success', context: '1' }
    }
  })
  .on(['success', 'error'], ({ stage, context }) => {
    if (stage === 'success') {
      context
    }
  })
  
x.build({})
