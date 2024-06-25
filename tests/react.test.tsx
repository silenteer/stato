import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setTimeout as sleep } from "timers/promises";
import { describe, expect, it, afterEach } from 'vitest';
import { createMachine } from "../src/use-stato";
import { State, create } from '../src/stato';

type TrafficLightStates =
  | State<{ name: 'red', context: { duration: number } }>
  | State<{ name: 'yellow', context: { duration: number, next: 'red' | 'green' } }>
  | State<{ name: 'green', context: { duration: number } }>

const trafficLightTemplate = create<TrafficLightStates>()
  .params<{ based: number }>()
  .transition({
    name: 'next',
    from: ['red', 'green', 'yellow'],
    to: ['red', 'green', 'yellow'],
    async execution({ context, name }) {
      await sleep(context.duration)
      switch (name) {
        case 'red':
          return { name: 'yellow', context: { ...context, next: 'green' } }
        case 'green':
          return { name: 'yellow', context: { ...context, next: 'red' } }
        case 'yellow':
          return { name: context.next, context: { duration: context.duration } }
      }
    }
  })
  .build()

const machine = createMachine(trafficLightTemplate)

const Child = () => {
  const currentState = machine.useCurrentState()
  const dispatch = machine.useDispatch()

  return <>
    <div><button onClick={() => {
      dispatch('next')
    }}>Next</button></div>
    <div id="name">
      {currentState.name}
    </div>
  </>
}

describe('operational', () => {

  afterEach(() => {
    cleanup()
  })

  it('manual work should work', async () => {
    render(<machine.Provider
      initialState={{ name: 'red', context: { duration: 1000 } }}
      params={{ based: 1000 }}
    >
      <Child />
    </machine.Provider>)

    await userEvent.click(screen.getByText('Next'))
    await sleep(1000)

    expect(screen.getByText('yellow')).not.toBeNull()

    await sleep(1000)
    await userEvent.click(screen.getByText('Next'))

    await sleep(1000)
    expect(screen.getByText('green')).not.toBeNull()
  })

  it('test using ref', async () => {
    const ref = machine.createRef()

    render(<machine.Provider
      initialState={{ name: 'yellow', context: { duration: 1000, next: 'red' } }}
      params={{ based: 1000 }}
      ref={ref}
    >
      <Child />
    </machine.Provider>
    )

    expect(ref.current).not.toBeNull()

    let dispatched = ref.current?.machine.dispatch('next')
    expect(ref.current?.machine.isTransitioning).not.toBeNull()

    await dispatched
    expect(screen.getByText('red')).not.toBeNull()

    ref.current?.reset()
    await sleep(0)
    expect(screen.getByText('yellow')).not.toBeNull()
  })

});