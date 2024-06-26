import React, { forwardRef, createContext, useContext, useEffect, useMemo, useSyncExternalStore, useImperativeHandle, useState } from 'react'
import { FactoryFn, Stato, StatoDef, TransitionInstance } from './stato'
import { PrettyPrint } from './utils'

function buildHashedKeys(obj: any): string | undefined {
  if (obj === undefined) {
    return undefined
  }

  const keys = Object.keys(obj)
  const sortedKeys = keys.sort()
  return sortedKeys.map(key => JSON.stringify(obj[key])).join('')
}

export function createMachine<
  S extends StatoDef,
  T extends TransitionInstance<S>,
  AP = never,
>(
  template: FactoryFn<S, T, AP>,
) {
  type Controller = { machine: Stato<S, T, AP>, reset: () => void }
  type Transitions = PrettyPrint<Stato<S, T, AP>['transitioning']>

  const Context = createContext<Controller | undefined>(undefined)

  const useController = () => {
    const context = useContext(Context)
    if (!context) {
      throw new Error('useController must be used within a StatoProvider')
    }

    return context
  }

  const useStato = () => {
    const controller = useController()
    return controller.machine
  }

  const useReset = () => {
    const controller = useController()
    return controller.reset
  }

  const useStart = () => {
    const controller = useController()
    return controller.machine.start.bind(controller.machine) as Stato<S, T, AP>['start']
  }

  const useFinish = () => {
    const controller = useController()
    return controller.machine.finish.bind(controller.machine) as Stato<S, T, AP>['finish']
  }

  const useIsStarted = () => {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToLifecycle.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => stato.started,
      () => stato.started,
    )
  }

  function useCurrentState(): S
  function useCurrentState<T>(selector: (state: S) => T): T
  function useCurrentState<T>(selector?: (state: S) => T): T | S {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToStateChange.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => selector ? selector(stato.currentState) : stato.currentState,
      () => selector ? selector(stato.currentState) : stato.currentState,
    )
  }

  const useDispatch = () => {
    const stato = useStato()
    return stato.dispatch.bind(stato) as Stato<S, T, AP>['dispatch']
  }

  function useTransitioning(): T
  function useTransitioning<X>(selector: (transition: Transitions) => X): X
  function useTransitioning<X>(selector?: (transition: Transitions) => X): X | Transitions {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToTransitioning.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => selector ? selector(stato.transitioning) : stato.transitioning,
      () => selector ? selector(stato.transitioning) : stato.transitioning,
    )
  }

  const useRef = () => React.useRef<Controller>(null)
  const createRef = () => React.createRef<Controller>()

  type PropType = AP extends undefined ? {} : { params: AP }

  const Provider = forwardRef<
    Controller,
    PropType & React.PropsWithChildren & { initialState: S } & { autoStart?: boolean }
  >(function StatoController(
    { children, initialState, ...rest },
    ref
  ) {
    const [version, setVersion] = useState(0)

    const controller = useMemo(() => {
      const machine = template({
        initialState,
        params: rest['params'],
        autoStart: rest['autoStart']
      })
      return {
        machine,
        reset: () => setVersion(version + 1)
      }
    }, [buildHashedKeys(initialState), buildHashedKeys(rest['params']), version])

    useImperativeHandle(ref, () => controller, [controller])

    useEffect(() => {
      return () => {
        controller.machine.dispose()
      }
    }, [buildHashedKeys(initialState), buildHashedKeys(rest['params'])])

    return <Context.Provider value={controller}>
      {children}
    </Context.Provider>
  })

  return {
    Provider,
    useStato,
    useCurrentState,
    useTransitioning,
    useDispatch,
    useRef,
    createRef,
    useReset,
    useStart,
    useFinish,
    useIsStarted
  }
}

export type ReactMachine = ReturnType<typeof createMachine>