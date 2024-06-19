import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setTimeout as sleep } from "timers/promises";
import { describe, expect, it } from 'vitest';
import { createMachine } from "../src/use-stato";
import { State, create } from '../src/stato';

type TrafficLightStates =
  | State<{ name: 'red', context: { duration: number } }>
  | State<{ name: 'yellow', context: { duration: number, next: 'red' | 'green' } }>
  | State<{ name: 'green', context: { duration: number } }>

const trafficLightTemplate = create<TrafficLightStates>()
  .params<{ based: number }>()
  .transition({
    name: 'to-yellow',
    from: ['red', 'green'],
    to: 'yellow',
    async execution({ context, name }, next: 'red' | 'green') {
      console.log('transitioning', name, '->', 'yellow')
      await sleep(context.duration)
      console.log('transitioned', name, '->', 'yellow')
      return { name: 'yellow', context: { ...context, next } }
    }
  })
  .transition({
    name: 'to-green-or-red',
    from: 'yellow',
    to: ['green', 'red'],
    async execution({ context, params }) {
      await new Promise(resolve => setTimeout(resolve, context.duration))
      return { name: context.next, context }
    }
  })
  .build()

const manualMachine = createMachine(trafficLightTemplate)

const Home = () => {
  return <manualMachine.Provider
    initialState={{ name: 'red', context: { duration: 1000 } }}
    params={{ based: 1000 }}
  >
    <Child />
  </manualMachine.Provider>
}

const Child = () => {
  const currentState = manualMachine.useCurrentState()
  const dispatch = manualMachine.useDispatch()

  return <>
    <div><button onClick={() => {
      switch (currentState.name) {
        case 'red':
          dispatch('to-yellow', 'green')
          break
        case 'green':
          dispatch('to-yellow', 'red')
          break
        case 'yellow':
          dispatch('to-green-or-red')
          break
      }
    }}>Next</button></div>
    <div id="name">
      {currentState.name}
    </div>
  </>
}

describe('operational', () => {

  it('manual work should work', async () => {
    render(<Home />)

    await userEvent.click(screen.getByText('Next'))
    await sleep(1000)

    expect(screen.getByText('yellow')).not.toBeNull()

    await sleep(1000)
    await userEvent.click(screen.getByText('Next'))

    await sleep(1000)
    expect(screen.getByText('green')).not.toBeNull()
  })


});