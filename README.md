# Stato

Stato meant "state" in Italian. Stato is built to be a simple state machine for a common usecases

Stato has only one dependency, [radix3](https://github.com/radix-ui/radix3), which is a simple router to handle events and state changes.

## Get started

state machine is a set of states and transitions between states. To get started with stato, you'll need to define 
states and those shapes

```typescript
import { State, create } from "@silenteer/stato"
import { setTimeout as sleep } from "timers/promises"

type TrafficLightState =
  | State<{ name: 'red', context: { duration: number } }>
  | State<{ name: 'yellow', context: { duration: number, next: 'red' | 'green' } }>
  | State<{ name: 'green', context: { duration: number } }>
```

The above states are defined as a union of `State` objects.

To define transitions, library provides a builder to define the transitions

```typescript
const blueprint = create<TrafficLightState>()
  .transition({
    name: 'to-yellow',
    from: ['red', 'green'],
    to: 'yellow',
    async execution({ name, context }) {
      await sleep(context.duration)
      return { name: 'yellow', context: { ...context, next: name === 'red' ? 'green' : 'red' } }
    }
  })
  .transition({
    name: 'to-red-or-green',
    from: 'yellow',
    to: ['red', 'green'],
    async execution({ name, context }) {
      await sleep(context.duration)
      return { name: context.next, context: { ...context } }
    }
  }
  .build()
```

The above transitions are defined as a builder, which is a function that takes a `State` object and returns a new `State` object.

To create an instance from the machine blueprint, you can use the `createMachine` function

Then we'll enter React world

```typescript
const trafficLight = createMachine(blueprint)


function TrafficLightContainer() {
  return <trafficLight.Provider initialState={{ name: 'red', context: { duration: 1000 } }}>
    <TrafficLight />
  </trafficLight.Provider>
}

function TrafficLight() {
  const state = trafficLight.useCurrentState()
  const dispatch = trafficLight.useDispatch()

  return <div>
    <div>{state.name}</div>
    <button onClick={() => dispatch('to-yellow')}>to yellow</button>
    <button onClick={() => dispatch('to-red-or-green')}>to red or green</button>
  </div>
```