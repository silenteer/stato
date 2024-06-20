import { createRouter } from "radix3"
import type { PrettyPrint } from "./utils"

export type StatosDef<Stage, Event, Context> = {
  name: Stage
  context: Context
  event?: Event
  nextEvents: Event[]
}
export type StatoDef = { name: string, context: any }
export type State<S extends StatoDef> = S

export type TransitionInstance<
  States extends StatoDef,
  Event extends string = any,
  From extends valueOrArrayValue<string> = any,
  To extends valueOrArrayValue<string> = any,
  Params extends Array<any> = any,
  AP = unknown
> = {
  name: Event
  from: From
  to: To
  execution: (
    executionCtx: PrettyPrint<Extract<States, { name: inferValueOrArrayValue<From> }>> & {
      dispatch: (target: string, ...params: any[]) => void
      params: AP
    },
    ...params: Params
  ) => valueOrPromiseValue<PrettyPrint<Extract<States, { name: To extends Array<infer T> ? T : To }>>> | valueOrPromiseValue<undefined> | valueOrPromiseValue<void>
}

export type NoTransition = {
  name: never
  from: never
  to: never
  execution: never
}

export type StageListener<
  Stages extends StatoDef,
  T extends TransitionInstance<Stages>,
  AP
> = {
  name: valueOrArrayValue<Stages['name']> | "*"
  listener: (stage: Stages, dispatch: Stato<Stages, T, AP>['dispatch']) => valueOrPromiseValue<void | (() => void)>
}

type inferValueOrArrayValue<T> = T extends Array<infer V> ? V : T
type valueOrPromiseValue<V> = V | Promise<V>
type valueOrArrayValue<V> = V | Array<V>
type ignoreFirstValue<T> = T extends [any, ...infer R] ? R : T

export type StateListener<S extends StatoDef> = ((name: S['name'] | '*', cb: (name: S) => valueOrPromiseValue<void | (() => void)>) => void)[]

export type FactoryFn<
  S extends StatoDef,
  T extends TransitionInstance<S> = NoTransition,
  AP = unknown
> = (param: {
  initialState: S,
  params: AP
}) => Stato<S, T, AP>

export class StatoBuilder<
  S extends StatoDef,
  T extends TransitionInstance<S> = NoTransition,
  AP = unknown
> {
  constructor(
    private transitions: Array<TransitionInstance<S, any>> = [],
    private stateListeners: Array<StageListener<S, T, AP>> = [],
  ) { }

  params<AA extends AP>(): StatoBuilder<S, T, AA> {
    return this as any
  }

  transition<
    Event extends string,
    From extends valueOrArrayValue<S['name']>,
    To extends valueOrArrayValue<S['name']>,
    P extends unknown[]
  >(
    option: TransitionInstance<S, Event, From, To, P, AP>
  ) {
    this.transitions.push(option)
    return this as StatoBuilder<S, T | TransitionInstance<S, Event, From, To, P>, AP>
  }

  on<N extends valueOrArrayValue<S['name']>>(
    name: N | '*',
    listener: (
      stage: PrettyPrint<Extract<S, { name: inferValueOrArrayValue<N> }> & { params: AP }>,
      dispatch: Stato<S, T, AP>['dispatch']
    ) => (void | Promise<void>)
  ) {
    const names = typeof name === 'string' ? [name] : [...name]
    this.stateListeners.push({ name: names, listener })
    return this
  }

  clone(): StatoBuilder<S, T, AP> {
    return new StatoBuilder<S, T, AP>([...this.transitions], [...this.stateListeners])
  }

  build(): FactoryFn<S, T, AP> {
    let transitions = [...this.transitions]

    return (param) => {
      let enterListeners = [...this.stateListeners]
      return new Stato(
        param.initialState,
        param.params,
        transitions,
        enterListeners
      )
    }
  }
}

export class Stato<
  S extends StatoDef,
  T extends TransitionInstance<S>,
  AP
> {

  public transitioning: [S['name'][], S['name'][]] | undefined
  public isTransitioning: boolean

  private unlisteners = new Set<() => void | Promise<void>>()
  private transitionRouter = createRouter<TransitionInstance<S>>()
  private listenerRouters = createRouter<Set<StageListener<S, T, AP>>>()

  private transitioningListeners = new Set<() => void>()
  private stateChangeListeners = new Set<() => void>()

  constructor(
    public currentState: PrettyPrint<S>,
    private params: AP,
    transitions: Array<TransitionInstance<S, any>>,
    enterListeners: Array<StageListener<S, T, AP>>,
  ) {

    for (const transition of transitions) {
      this.registerTransitionInstance(transition)
    }

    for (const listenerRegister of enterListeners) {
      this.registerStateListener(listenerRegister)
    }

    this.triggerEventListeners(this.currentState.name)
  }

  private registerTransitionInstance(transition: TransitionInstance<S>) {
    const froms = Array.isArray(transition.from) ? transition.from : [transition.from]
    const tos = Array.isArray(transition.to) ? transition.to : [transition.to]
    this.transitionRouter.insert(`/event/${transition.name}`, transition)

    for (const from of froms) {
      for (const to of tos) {
        this.transitionRouter.insert(`/route/${from}/${to}`, transition)
      }
    }
  }

  private registerStateListener(listener: StageListener<S, T, AP>) {
    const unlisteners: Array<() => void> = []
    for (const stage of listener.name) {
      if (stage === '*') {
        let container = this.listenerRouters.lookup(`/enter/**`)
        if (!container) {
          container = new Set()
          this.listenerRouters.insert(`/enter/**`, container)
        }

        container.add(listener)
        unlisteners.push(() => { container.delete(listener) })
        continue
      }

      let container = this.listenerRouters.lookup(`/enter/${stage}`)
      if (!container) {
        container = new Set()
        this.listenerRouters.insert(`/enter/${stage}`, container)
      }

      container.add(listener)
      unlisteners.push(() => { container.delete(listener) })
    }

    return () => unlisteners.forEach(unlistener => unlistener())
  }

  onStateChanged(listener: StageListener<S, T, AP>) {
    return this.registerStateListener(listener)
  }

  subscribeToStateChange(onChange: () => void): () => void {
    const unlisten = this.stateChangeListeners.add(onChange)
    return () => unlisten.delete(onChange)
  }

  subscribeToTransitioning(onChange: () => void): () => void {
    const unlisten = this.transitioningListeners.add(onChange)
    return () => unlisten.delete(onChange)
  }

  transitioningFrom(from: S['name'] | S['name'][]) {
    return Array.isArray(from)
      ? from.find(t => this.transitioning?.[0].includes(t))
      : this.transitioning?.[0].includes(from)
  }

  transitioningTo(to: S['name'] | S['name'][]) {
    return Array.isArray(to)
      ? to.find(t => this.transitioning?.[1].includes(t))
      : this.transitioning?.[1].includes(to)
  }

  dispatch: <N extends T['name'] | [S['name'], S['name']]>(
    ...params: [
      N,
      ...N extends T['name']
      ? PrettyPrint<ignoreFirstValue<Parameters<Extract<T, { name: N }>['execution']>>>
      : any
    ]
  ) => Promise<void> = async (name, ...params) => {
    if (this.transitioning) {
      console.log('transitioning, skipping dispatch')
      return
    }

    let transition: TransitionInstance<S> | null

    if (typeof name === 'string') {
      transition = this.transitionRouter.lookup(`/event/${name}`)
    } else {
      const [from, to] = name as [string, string]
      transition = this.transitionRouter.lookup(`/route/${from}/${to}`)
    }

    if (!transition) {
      console.log(`cannot find transition for, ${name}`)
      return
    }

    await this.triggerTransition(transition, params)
  }

  dispose() {
    this.unlisteners.forEach(unlistener => unlistener())
    this.unlisteners.clear()
  }

  private async triggerTransition(transition: TransitionInstance<S>, params: any[]) {
    const targetFrom: string[] = Array.isArray(transition.from)
      ? transition.from
      : [transition.from]

    const targetTo: string[] = Array.isArray(transition.to)
      ? transition.to
      : [transition.to]

    if (!targetFrom.includes(this.currentState.name)) {
      console.log(`from condition doesn't match`, transition.from, this.currentState.name)
      return
    }

    if (!targetTo.find(to => this.transitionRouter.lookup(`/route/${this.currentState.name}/${to}`))) {
      console.log(`to condition doesn't match`, transition.to)
      return
    }

    this.transitioning = [[this.currentState.name], targetTo]
    this.isTransitioning = true

    await Promise.all(Array.from(this.transitioningListeners).map(listener => listener()))

    const nextStage: S | undefined = await transition.execution.apply(undefined, [{
      ...this.currentState,
      dispatch: this.dispatch,
      params: this.params
    }, ...params])

    if (nextStage) {
      if (nextStage.name !== this.currentState.name) {
        this.currentState = {
          ...nextStage,
        }
        await this.triggerUnlisteners()

        this.transitioning = undefined
        this.isTransitioning = false

        await this.triggerStateChangeListeners()
        await this.triggerEventListeners(nextStage.name)
      } else {
        this.currentState.context = nextStage.context
      }
    } else {
      this.transitioning = undefined
      this.isTransitioning = false
    }
  }

  private async triggerEventListeners(to: S['name']) {
    const matches = this.listenerRouters.lookup(`/enter/${to}`)
    if (matches) {
      for (const { listener } of matches) {
        const unlistener = await listener(this.currentState, this.dispatch)
        if (typeof unlistener === 'function') {
          this.unlisteners.add(unlistener)
        }
      }
    }
  }

  private async triggerStateChangeListeners() {
    for (const listener of this.stateChangeListeners) {
      listener()
    }
  }

  private async triggerUnlisteners() {
    for (const unlistener of this.unlisteners) {
      try {
        await unlistener()
      } catch (e) {
        console.error("error while proceeding unregistering listener", e)
      }
    }
    this.unlisteners.clear()
  }
}

export const create = <S extends StatoDef>() => new StatoBuilder<S>()