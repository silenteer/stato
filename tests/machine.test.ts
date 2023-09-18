import { beforeEach, describe, expect, test, vi } from "vitest"
import { Stage, create } from "../src"

describe("basic machine function", () => {

  type Stages =
    | Stage<{ stage: 'idle', context: { promise: () => Promise<string> } }>
    | Stage<{ stage: 'success', context: { result: string, promise: () => Promise<string> } }>
    | Stage<{ stage: 'error', context: { error: Error, promise: () => Promise<string> } }>

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
          return { stage: 'success', context: { ...context, result } }
        } catch (e) {
          return { stage: 'error', context: { ...context, error: e } }
        }
      }
    })
    .transition({
      name: 'reset',
      from: ['error', 'success'],
      to: 'idle',
      async execution({ context }) {
        return { stage: 'idle', context: { promise: context.promise } }
      }
    })
    .on(['idle', 'success', 'error'], mockEventListener)

  let machine = builder.build()

  beforeEach(() => {
    vi.resetAllMocks()
    machine.stop()
  })

  test('expect machine to be able to start and stop', async () => {
    expect(machine.isRunning).not.toBeTruthy()
    await machine.dispatch('init')

    machine.start({ stage: 'idle', context: { promise: mockContextFn } })
    expect(machine.isRunning).toBeTruthy()
    await machine.dispatch('init')
    expect(machine.currentStage?.stage).toBe('success')
  })

  test('expect machine to function', async () => {
    machine.start({ stage: 'idle', context: { promise: mockContextFn } })

    expect(machine.currentStage?.stage).toBe('idle')
    let transition = machine.dispatch('init')
    expect(machine.transition.transitioning?.[0]).toContain('idle')
    expect(machine.transition.transitioning?.[1]).toContain('error')
    expect(machine.transition.transitioning?.[1]).toContain('success')

    expect(machine.transition.transitioningFrom('idle')).toBeTruthy()
    expect(machine.transition.transitioningFrom(['idle', 'error'])).toBeTruthy()
    expect(machine.transition.transitioningTo('error')).toBeTruthy()
    expect(machine.transition.transitioningTo('success')).toBeTruthy()
    expect(machine.transition.transitioningTo(['success', 'error'])).toBeTruthy()

    await transition
    expect(machine.currentStage?.stage).toBe('success')
    expect(machine.transition.transitioning).toBeUndefined()

    expect(machine.currentStage?.stage === 'success' && machine.currentStage.context.result === '1234')

    expect(mockEventListener).toBeCalledTimes(2)
    mockContextFn.mockRejectedValueOnce(new Error('hello'))

    transition = machine.dispatch('init')
    await transition

    expect(machine.currentStage?.stage).toBe('error')
  })

  test('maybe no side effect', async () => {
    machine.start({ stage: 'idle', context: { promise: mockContextFn } })
    const sideEffectListener = vi.fn()

    builder.on('success', sideEffectListener)
    await machine.dispatch('init')

    expect(sideEffectListener).toBeCalledTimes(0)

    const machine2 = builder.build({ initialStage: { stage: 'idle', context: { promise: async () => '123' } } })
    machine2.start({ stage: 'idle', context: { promise: mockContextFn } })

    await machine2.dispatch('init')
    expect(sideEffectListener).toBeCalledTimes(1)
  })

  test('can self transition', async () => {
    const machine = create<Stages>()
      .transition({
        name: 'startup',
        from: 'idle',
        to: 'success',
        async execution({ context }) {
          return { stage: 'success', context: { ...context, result: await context.promise() } }
        }
      })
      .on('idle', (_, dispatch) => {
        dispatch('startup')
      })
      .build({ initialStage: { stage: 'idle', context: { promise: async () => '123' } } });

    machine.start({ stage: 'idle', context: { promise: mockContextFn } })
    await machine.transition.transitioned

    expect(machine.currentStage?.stage).toBe('success')
  })

})

