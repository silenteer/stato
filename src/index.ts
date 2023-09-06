import { createRouter } from "radix3"
import { proxy, useSnapshot } from "valtio"
import structuredClone from "@ungap/structured-clone"

export type StagesDef<Stage, Event, Context> = {
  stage: Stage
  context: Context
  event?: Event
  nextEvents: Event[]
}

export type StageDef = {
  stage: string
  context: any
}

export type Stage<S extends StageDef> = S

type NoTransition = {
  name: never
  from: never
  to: never
  execution: never
}

type inferValueOrArrayValue<T> = T extends Array<infer V> ? V : T
type valueOrPromiseValue<V> = V | Promise<V>
type valueOrArrayValue<V> = V | Array<V>
type ignoreFirstValue<T> = T extends [any, ...infer R] ? R : T

type Stager<
  S extends StageDef,
  T extends TransitionInstance<S, any>
> = {
  currentStage: S
  transitioning: [from: S['stage'], to: Array<S['stage']>] | undefined
  transitioningTo: (to: valueOrArrayValue<S['stage']>) => boolean
  transitioningFrom: (from: valueOrArrayValue<S['stage']>) => boolean
  on: <X extends valueOrArrayValue<S['stage']>>(stage: X, cb: (stage: Extract<S, { stage: inferValueOrArrayValue<X> }>) => (void | Promise<void>)) => void
  dispatch: <N extends T['name'] | [S['stage'], S['stage']]>(
    ...params: [
      N,
      ...N extends T['name']
      ? ignoreFirstValue<Parameters<Extract<T, { name: N }>['execution']>>
      : any
    ]
  ) => Promise<void>
  reset: () => void
  useStage: (filter?: (stage: S) => any) => ReturnType<typeof useSnapshot>
}

type TransitionInstance<
  Stages extends StageDef,
  S extends Stager<any, any>,
  Event extends string = any,
  From extends valueOrArrayValue<string> = any,
  To extends valueOrArrayValue<string> = any,
  Params extends Array<any> = any
> = {
  name: Event
  from: From
  to: To
  execution: (
    executionCtx: {
      stage: Extract<Stages, { stage: inferValueOrArrayValue<From> }>,
      dispatch: S['dispatch']
    },
    ...params: Params
  ) => valueOrPromiseValue<Extract<Stages, { stage: To extends Array<infer T> ? T : To }>> | valueOrPromiseValue<undefined> | valueOrPromiseValue<void>
}

type StageListener<
  Stages extends StageDef
> = {
  stage: valueOrArrayValue<Stages['stage']>
  listener: (stage: Stages) => (void | Promise<void>)
}

function isPromise(value: any): value is Promise<any> {
  return Boolean(value && typeof value.then === 'function');
}

class StageBuilder<
  S extends StageDef,
  T extends TransitionInstance<S, Stager<any, any>> = NoTransition
> {
  transitions: Array<TransitionInstance<S, any>> = []
  listeners: Array<StageListener<S>> = []
  stager: Stager<S, T>

  transition<
    Event extends string,
    From extends valueOrArrayValue<S['stage']>,
    To extends valueOrArrayValue<S['stage']>,
    P extends unknown[]
  >(
    option: TransitionInstance<S, Stager<S, T>, Event, From, To, P>
  ): StageBuilder<S, T | TransitionInstance<S, Stager<S, T>, Event, From, To, P>> {
    this.transitions.push(option)

    return this as any
  }

  on<N extends valueOrArrayValue<S['stage']>>(
    name: N,
    listener: (stage: Extract<S, { stage: inferValueOrArrayValue<N> }>) => (void | Promise<void>)
  ): StageBuilder<S, T> {
    const names = typeof name === 'string' ? [name] : [...name]
    this.listeners.push({ stage: names, listener })
    return this as any
  }

  build({
    initialStage
  }: StagerOptions & {
    initialStage: S
  }): Stager<S, T> {
    const startPoint = proxy(initialStage)
    let transitionRouter = createRouter<TransitionInstance<S, Stager<S, T>>>()
    const registerTransitions = () => {
      for (const transition of this.transitions) {
        const froms = Array.isArray(transition.from) ? transition.from : [transition.from]
        const tos = Array.isArray(transition.to) ? transition.to : [transition.to]
        transitionRouter.insert(`/event/${transition.name}`, transition)
  
        for (const from of froms) {
          for (const to of tos) {
            transitionRouter.insert(`/route/${from}/${to}`, transition)
          }
        }
      }
    }

    registerTransitions()

    const registerListener = (register: StageListener<S>) => {
      for (const stage of register.stage) {
        let container = listenerRouters.lookup(`/listen/${stage}`)
        if (!container) {
          container = new Set()
          listenerRouters.insert(`/listen/${stage}`, container)
        }

        container.add(register)
      }
    }

    let listenerRouters = createRouter<Set<StageListener<S>>>()
    const registerListeners = () => {
      for (const listenerRegister of this.listeners) {
        registerListener(listenerRegister)
      }
    }

    registerListeners()

    const triggerStageChanges = (nextStage: S) => {
      if (nextStage.stage !== stager.currentStage.stage) {
        stager.currentStage.context = nextStage.context
        stager.currentStage.stage = nextStage.stage

        const matches = listenerRouters.lookup(`/listen/${nextStage.stage}`)
        
        if (matches) {
          matches.forEach(({ listener }) => {
            listener(stager.currentStage)
          })
        }

      } else {
        stager.currentStage.context = nextStage.context
      }
    }

    const stager: Stager<S, T> = {
      currentStage: startPoint,
      transitioning: undefined,
      transitioningTo(to) {
        if (stager.transitioning === undefined) return false
        
        const targetTo: string[] = Array.isArray(to)
          ? to
          : [to]
        return !!targetTo.find(to => stager.transitioning?.[1].includes(to))
      },
      transitioningFrom(from) {
        if (stager.transitioning === undefined) return false
        const targetFrom: string[] = Array.isArray(from)
          ? from
          : [from]

          return targetFrom.includes(stager.currentStage.stage)
      },
      reset: () => {
        stager.currentStage = proxy(initialStage)
        transitionRouter = createRouter<TransitionInstance<S, Stager<S, T>>>()
        registerTransitions()

        listenerRouters = createRouter<Set<StageListener<S>>>()
        registerListeners()
      },
      async dispatch(name, ...params) {
        let transition: TransitionInstance<S, Stager<S, T>> | null

        if (typeof name === 'string') {
          transition = transitionRouter.lookup(`/event/${name}`)
        } else {
          const [from, to] = name as [string, string]
          transition = transitionRouter.lookup(`/route/${from}/${to}`)
        }

        if (!transition) {
          console.log(`cannot find transition for, ${name}`)
          return
        }

        const targetFrom: string[] = Array.isArray(transition.from)
          ? transition.from
          : [transition.from]

        const targetTo: string[] = Array.isArray(transition.to)
          ? transition.to
          : [transition.to]

        if (!targetFrom.includes(stager.currentStage.stage)) {
          console.log(`from condition doesn't match`, transition.from, stager.currentStage.stage)
          return
        }

        if (!targetTo.find(to => transitionRouter.lookup(`/route/${stager.currentStage.stage}/${to}`))) {
          console.log(`to condition doesn't match`, transition.to)
          return
        }

        stager.transitioning = [stager.currentStage.stage, targetTo]
        const transitionResult: S | undefined | Promise<S | undefined> = transition.execution.apply(undefined, [{
          stage: stager.currentStage,
          dispatch: stager.dispatch
        }, ...params])

        if (isPromise(transitionResult)) {
          await transitionResult
            .then((result: S | undefined) => {
              if (result) {
                stager.transitioning = undefined
                triggerStageChanges(result)
              }
            })
            .finally(() => {
              stager.transitioning = undefined
            })
        } else {
          stager.transitioning = undefined
          if (transitionResult) {
            triggerStageChanges(transitionResult)
          }
        }
      },
      on(stage, cb) {
        const names = typeof stage === 'string' ? [stage] : [...stage]
        registerListener({ stage, listener: cb})
      },
      useStage(filter) {
        let target = stager.currentStage
        if (filter) {
          target = filter(target)
        }

        return useSnapshot(target)
      },
    }

    return stager
  }
}

type StagerOptions = {

}

export const create = <S extends StageDef>() => new StageBuilder<S>()