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
      const x = Promise.resolve()

      return await x
        .then(_ => ({ stage: 'success', context: {} as string }) as const)
        .catch(_ => ({ stage: 'error', context: new Error('unexpected') }) as const)
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

const k = x.build({})