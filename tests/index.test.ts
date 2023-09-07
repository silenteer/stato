import { beforeEach, describe, expect, test, vi } from "vitest"
import { Stage, create } from "../src"

describe("basic machine function", () => {

  type Stages =
    | Stage<{ stage: 'idle', context: { promise: () => Promise<string> }}>
    | Stage<{ stage: 'success', context: { result: string, promise: () => Promise<string> }}>
    | Stage<{ stage: 'error', context: { error: Error, promise: () => Promise<string> }}>

  const mockContextFn = vi.fn(async () => '1234')
  const mockEventListener = vi.fn()

  const builder = create<Stages>()
    .transition({
      name: 'init',
      from: ['idle', 'error', 'success'],
      to: ['error', 'success'],
      async execution({ context }) {
        try {
          const result = await context.promise()
          return { stage: 'success', context: {...context, result }}
        } catch(e) {
          return {stage: 'error', context: { ...context, error: e}}
        }
      }
    })
    .transition({
      name: 'reset',
      from: ['error', 'success'],
      to: 'idle',
      async execution({ context }) {
        return { stage: 'idle', context: { promise: context.promise }}
      }
    })
    .on(['idle', 'success', 'error'], mockEventListener)

  let machine = builder.build({
    initialStage: { stage: 'idle', context: { promise: mockContextFn } }
  })

  beforeEach(() => { 
    vi.resetAllMocks()
    machine.reset()
    builder.build({
      initialStage: { stage: 'idle', context: { promise: mockContextFn } }
    })
  })

  test('expect machine to function', async () => {
    expect(machine.currentStage.stage).toBe('idle')
    let transition = machine.dispatch('init')
    expect(machine.transitioning?.[0]).toContain('idle')
    expect(machine.transitioning?.[1]).toContain('error')
    expect(machine.transitioning?.[1]).toContain('success')

    expect(machine.transitioningFrom('idle')).toBeTruthy()
    expect(machine.transitioningFrom(['idle', 'error'])).toBeTruthy()
    expect(machine.transitioningTo('error')).toBeTruthy()
    expect(machine.transitioningTo('success')).toBeTruthy()
    expect(machine.transitioningTo(['success', 'error'])).toBeTruthy()

    await transition
    expect(machine.currentStage.stage).toBe('success')
    expect(machine.transitioning).toBeUndefined()

    expect(machine.currentStage.stage === 'success' && machine.currentStage.context.result === '1234')

    expect(mockEventListener).toBeCalledTimes(2)
    mockContextFn.mockRejectedValueOnce(new Error('hello'))

    transition = machine.dispatch('init')
    await transition

    expect(machine.currentStage.stage).toBe('error')
  })

  test('maybe no side effect', async () => {
    const sideEffectListener = vi.fn()

    builder.on('success', sideEffectListener)
    await machine.dispatch('init')

    expect(sideEffectListener).toBeCalledTimes(0)

    const machine2 = builder.build({ initialStage: { stage: 'idle', context: { promise: async () => '123'}}})
    await machine2.dispatch('init')
    expect(sideEffectListener).toBeCalledTimes(1)
  })

  test('we can reset machine', async () => {
    await machine.dispatch('init')
    machine.reset()
    expect(machine.currentStage.stage).toBe('idle')
  })

  test('can self transition', async () => {
    const machine = create<Stages>()
      .transition({ 
        name: 'startup',
        from: 'idle',
        to: 'success',
        async execution({ context }) {
          return { stage: 'success', context: { ...context, result: await context.promise() }}
        }
      })
      .on('idle', (_, dispatch) => {
        console.log('calling', dispatch)
        dispatch('startup')
      })
      .build({ initialStage: { stage: 'idle', context: { promise: async () => '123'}}});
    await new Promise((r) => setTimeout(() => r(null), 100))
    console.log(machine.currentStage.stage)
  })

})

