import { } from "react"

type StagesDef<Stage, Event, Context> = {
  stage: Stage
  context: Context
  event?: Event
  nextEvents: Event[]
}

type StageDef = {
  stage: string
  context: any
}

type Stage<S extends StageDef> = S

type Transtion = {
  from: string
  to: string
  params: any[]
}

type NoTransition = {
  from: never
  to: never
  params: unknown[]
}

type ExtractExp<T extends Transtion, Expr extends `${T['from']} -> ${T['to']}` = `${T['from']} -> ${T['to']}`> = Expr extends `${infer From} -> ${infer To}`
  ? Extract<T, { from: From, to: To }>
  : never

type Dispatcher<
  T extends Transtion,
  Exp extends `${T['from']} -> ${T['to']}` = `${T['from']} -> ${T['to']}`> = (
    string: Exp,
    ...params: ExtractExp<T, Exp>['params']
  ) => void

type TransitionExp<From extends string, To extends string> = `${From} -> ${To}`

class StageBuilder<S extends StageDef, T extends Transtion = NoTransition> {
  declare s: S
  declare t: T

  transition<From extends S['stage'], To extends S['stage'], P extends unknown[]>(
    exp: TransitionExp<From, To>,
    execution: (executionCtx: { context: Extract<S, { stage: From }>['context'], dispatch: Dispatcher<T> }, ...params: P) => Extract<S, { stage: To }>
  ): StageBuilder<S, T | { from: From, to: To, params: P }> {
    return this as any
  }

  build(): { dispatch: Dispatcher<T> } {
    return {
      dispatch(event, ...params) { }
    }
  }
}



const create = <S extends StageDef>() => new StageBuilder<S>()

type Stages =
  | Stage<{ stage: 'idle', context: undefined }>
  | Stage<{ stage: 'requesting', context: () => Promise<Response> }>
  | Stage<{ stage: 'success', context: any }>
  | Stage<{ stage: 'error', context: Error }>

const { dispatch } = create<Stages>()
  .transition('requesting -> success', ({ }, data: any) => {
    return { stage: 'success', context: data }
  })
  .transition('requesting -> error', ({ }, error: Error) => {
    return { stage: 'error', context: error }
  })
  .transition('idle -> requesting', ({ context, dispatch }, request: () => Promise<Response>) => {
    request()
      .then(r => r.json())
      .then(data => dispatch('requesting -> success', data))
      .catch(error => dispatch('requesting -> error', error))

    return { stage: 'requesting', context: request }
  })
  .build()

dispatch('idle -> requesting', false)

/**
* type Stage = 
*   | { stage: 'red', context: { timeout: number }}
*   | { stage: 'yellow', context: { timeout: number }}
*   | { stage: 'blue', context: { timeout: number }}
* 
* const stages = create<Stage>()
*  .transition({ from: 'red', to: 'yellow'})
* 
* 
* 
*/