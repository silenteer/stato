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
  _transitions: Array<T>
  isLoading: boolean
  on: <N extends S['stage']>(name: N, context: Extract<S, { stage: N }>['context']) => (void | Promise<void>)
  dispatch: <N extends T['name'] | [S['stage'], S['stage']]>(
    ...params: [
      N, 
      ...N extends T['name'] 
        ? ignoreFirstValue<Parameters<Extract<T, { name: N }>['execution']>>
        : any
      ]
  ) => void
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
      context: Extract<Stages, { stage: From }>['context'],
      dispatch: S['dispatch']
    }, 
    ...params: Params
  ) => valueOrPromiseValue<Extract<Stages, { stage: To extends Array<infer T> ? T : To }>> | undefined
}

class StageBuilder<
  S extends StageDef, 
  T extends TransitionInstance<S, Stager<any, any>> = NoTransition
> {
  transitions: Array<TransitionInstance<S, any>> = []
  stager: Stager<S, T>

  transition<
    Event extends string, 
    From extends valueOrArrayValue<S['stage']>, 
    To extends valueOrArrayValue<S['stage']>, 
    P extends unknown[]
  >(
    option: TransitionInstance<S, Stager<S, T>, Event, From, To, P>
  ): StageBuilder<S, T | TransitionInstance<S, Stager<S, T>, Event, From, To, P>> {
    return this as any
  }

  on<N extends valueOrArrayValue<S['stage']>>(
    name: N, 
    listener: (stage: Extract<S, { stage: inferValueOrArrayValue<N> }>) => (void | Promise<void>)
  ): StageBuilder<S, T> {
    return this as any
  }

  build(stagerOptions: StagerOptions): Stager<S, T> {
    return {} as any
  }
}

type StagerOptions = {

}

export const create = <S extends StageDef>() => new StageBuilder<S>()