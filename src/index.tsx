import { createRouter } from "radix3"
import { proxy, useSnapshot } from "valtio"
import React, { ComponentType, Key, createContext, useContext, useEffect } from "react"
import cloneDeep from "lodash.clonedeep"

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
  transition: {
    isTransitioning: boolean
    transitioning: [from: S['stage'], to: Array<S['stage']>] | undefined
    transitioningTo: (to: valueOrArrayValue<S['stage']>) => boolean
    transitioningFrom: (from: valueOrArrayValue<S['stage']>) => boolean
  }
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
  useStage: () => ReturnType<typeof useSnapshot<S>>
  useTransition: () => ReturnType<typeof useSnapshot<Stager<S, T>['transition']>>
  useListen: Stager<S, T>['on']
  withStager: <T extends { key?: string | number | null | undefined }>(Component: ComponentType<T>) => ComponentType<T>
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
    executionCtx: Extract<Stages, { stage: inferValueOrArrayValue<From> }> & {
      dispatch: S['dispatch']
    },
    ...params: Params
  ) => valueOrPromiseValue<Extract<Stages, { stage: To extends Array<infer T> ? T : To }>> | valueOrPromiseValue<undefined> | valueOrPromiseValue<void>
}

type StageListener<
  Stages extends StageDef,
  T extends TransitionInstance<Stages, Stager<any, any>>
> = {
  stage: valueOrArrayValue<Stages['stage']>
  listener: (stage: Stages, dispatch: Stager<Stages, T>['dispatch']) => (void | Promise<void>)
}

function isPromise(value: any): value is Promise<any> {
  return Boolean(value && typeof value.then === 'function');
}

class StageBuilder<
  S extends StageDef,
  T extends TransitionInstance<S, Stager<any, any>> = NoTransition
> {
  transitions: Array<TransitionInstance<S, any>> = []
  listeners: Array<StageListener<S, T>> = []
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
    listener: (
      stage: Extract<S, { stage: inferValueOrArrayValue<N> }>,
      dispatch: Stager<S, T>['dispatch']
    ) => (void | Promise<void>)
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
    const startPoint = proxy(cloneDeep(initialStage))
    let transitions = [...this.transitions]
    let listeners = [...this.listeners]

    let transitionRouter = createRouter<TransitionInstance<S, Stager<S, T>>>()
    const registerTransitions = () => {
      for (const transition of transitions) {
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

    const registerListener = (register: StageListener<S, T>) => {
      for (const stage of register.stage) {
        let container = listenerRouters.lookup(`/listen/${stage}`)
        if (!container) {
          container = new Set()
          listenerRouters.insert(`/listen/${stage}`, container)
        }

        container.add(register)
      }

      return () => unregisterListener(register)
    }

    const unregisterListener = (register: StageListener<S, T>) => {
      for (const stage of register.stage) {
        let container = listenerRouters.lookup(`/listen/${stage}`)
        if (container) {
          container.delete(register)

          if (container.size === 0) {
            listenerRouters.remove(`/listen/${stage}`)
          }
        }
      }
    }

    let listenerRouters = createRouter<Set<StageListener<S, T>>>()
    const registerListeners = () => {
      for (const listenerRegister of listeners) {
        registerListener(listenerRegister)
      }
    }

    registerListeners()

    const triggerEventListeners = async (stage: S['stage']) => {
      const matches = listenerRouters.lookup(`/listen/${stage}`)

      if (matches) {
        for (const { listener } of matches) {
          await listener(stager.currentStage, stager.dispatch)
        }
      }
    }

    const triggerStageChanges = (nextStage: S) => {
      if (nextStage.stage !== stager.currentStage.stage) {
        stager.currentStage.context = nextStage.context
        stager.currentStage.stage = nextStage.stage

        triggerEventListeners(nextStage.stage)

      } else {
        stager.currentStage.context = nextStage.context
      }
    }

    const stager: Stager<S, T> = {
      currentStage: startPoint,
      transition: proxy({
        isTransitioning: false,
        transitioning: undefined,
        transitioningTo(to) {
          if (stager.transition.transitioning === undefined) return false
  
          const targetTo: string[] = Array.isArray(to)
            ? to
            : [to]
          return !!targetTo.find(to => stager.transition.transitioning?.[1].includes(to))
        },
        transitioningFrom(from) {
          if (stager.transition.transitioning === undefined) return false
          const targetFrom: string[] = Array.isArray(from)
            ? from
            : [from]
  
          return targetFrom.includes(stager.currentStage.stage)
        },
      }),
      reset: () => {
        stager.currentStage = proxy(cloneDeep(initialStage))

        stager.transition.transitioning = undefined
        transitionRouter = createRouter<TransitionInstance<S, Stager<S, T>>>()
        registerTransitions()

        listenerRouters = createRouter<Set<StageListener<S, T>>>()
        registerListeners()

        triggerStageChanges(stager.currentStage)
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

        stager.transition.transitioning = [stager.currentStage.stage, targetTo]
        stager.transition.isTransitioning = stager.transition.transitioning !== undefined
        const transitionResult: S | undefined | Promise<S | undefined> = transition.execution.apply(undefined, [{
          ...stager.currentStage,
          dispatch: stager.dispatch
        }, ...params])

        if (isPromise(transitionResult)) {
          await transitionResult
            .then((result: S | undefined) => {
              if (result) {
                stager.transition.transitioning = undefined
                stager.transition.isTransitioning = stager.transition.transitioning !== undefined
                triggerStageChanges(result)
              }
            })
            .finally(() => {
              stager.transition.transitioning = undefined
              stager.transition.isTransitioning = stager.transition.transitioning !== undefined
            })
        } else {
          stager.transition.transitioning = undefined
          stager.transition.isTransitioning = stager.transition.transitioning !== undefined
          if (transitionResult) {
            triggerStageChanges(transitionResult)
          }
        }
      },
      on(stage, cb) {
        const names = typeof stage === 'string' ? [stage] : stage
        return registerListener({ stage: names, listener: cb })
      },
      withStager(Component) {
        return (props) => {
          useEffect(() => {
            return () => stager.reset()
          }, [])

          return (
            <reactContext.Provider value={stager}>
              <Component {...props} />
            </reactContext.Provider>
          )
        }
      },
      useStage() {
        const stager = useContext(reactContext)

        if (!stager) {
          throw new Error('stage context must be used within `withStager`')
        }

        return useSnapshot(stager.currentStage)
      },
      useListen(stage, cb) {
        const names = typeof stage === 'string' ? [stage] : stage

        useEffect(() => {
          return registerListener({ stage: names, listener: cb })
        }, [])
      },
      useTransition() {
        const stager = useContext(reactContext)

        if (!stager) {
          throw new Error('stage context must be used within `withStager`')
        }

        return useSnapshot(stager.transition)
      }
    }

    const reactContext = createContext<Stager<S, T> | undefined>(undefined)
    triggerEventListeners(stager.currentStage.stage)

    return stager
  }
}

type StagerOptions = {}

export const create = <S extends StageDef>() => new StageBuilder<S>()
