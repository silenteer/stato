import { afterEach, describe, expect, test, vi } from "vitest"
import { State, create } from "../src/stato"

describe("basic machine function", () => {

  type States =
    | State<{ name: 'idle', context: { promise: () => Promise<string> } }>
    | State<{ name: 'success', context: { result: string, promise: () => Promise<string> } }>
    | State<{ name: 'error', context: { error: Error, promise: () => Promise<string> } }>

  const mockContextFn = vi.fn(async () => '1234')
  const mockEventListener = vi.fn()

  afterEach(() => {
    mockContextFn.mockReset()
    mockEventListener.mockReset()
  })

  const builder = create<States>()
    .params<{ value: string }>()
    .transition({
      name: 'init',
      from: ['idle', 'error', 'success'],
      to: ['error', 'success'],
      async execution({ context }) {
        try {
          const result = await context.promise()
          return { name: 'success', context: { ...context, result } }
        } catch (e) {
          return { name: 'error', context: { ...context, error: e } }
        }
      }
    })
    .transition({
      name: 'reset',
      from: ['error', 'success'],
      to: 'idle',
      async execution({ context, dispatch }) {
        return { name: 'idle', context: { promise: context.promise } }
      }
    })
    .on(['error', 'success', 'idle'], mockEventListener)

  let template = builder.build()

  test('basic machine function', async () => {
    const machine = template({
      initialState: { name: 'idle', context: { promise: mockContextFn } },
      params: { value: '1234' }
    })

    expect(machine.currentState.name).toBe('idle')
    await machine.dispatch('init')
    expect(machine.currentState.name).toBe('success')
    await machine.dispatch('reset')
    expect(machine.currentState.name).toBe('idle')

    mockContextFn.mockRejectedValueOnce(new Error('hello'))
    await machine.dispatch('init')
    expect(machine.currentState.name).toBe('error')
  })

  test('test transitioning', async () => {
    const machine = template({
      initialState: { name: 'idle', context: { promise: mockContextFn } },
      params: { value: '1234' }
    })

    expect(machine.currentState.name).toBe('idle')
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
    expect(machine.currentState.name).toBe('success')
    expect(machine.transitioning).toBeUndefined()

    expect(machine.currentState.name === 'success' && machine.currentState.context.result === '1234')

    expect(mockEventListener).toBeCalledTimes(2)
    expect(mockEventListener.mock.lastCall[0].params.value).toBe('1234')

    mockContextFn.mockRejectedValueOnce(new Error('hello'))

    transition = machine.dispatch('init')
    await transition

    expect(machine.currentState.name).toBe('error')
  })

  test('yet started machine cannot dispatch', async () => {
    const machine = template({
      initialState: { name: 'idle', context: { promise: mockContextFn } },
      params: { value: '1234' },
      autoStart: false
    })

    expect(machine.started).toBeFalsy()
    expect(machine.currentState.name).toBe('idle')
    await machine.dispatch('init')
    expect(machine.currentState.name).toBe('idle')
    expect(mockEventListener).toBeCalledTimes(0)

    machine.start()
    expect(machine.started).toBeTruthy()
    expect(mockEventListener).toBeCalledTimes(1)
    await machine.dispatch('init')
    expect(machine.currentState.name).toBe('success')
  })

})

