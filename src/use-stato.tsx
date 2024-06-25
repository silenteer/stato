import React, { forwardRef, createContext, useContext, useEffect, useMemo, useSyncExternalStore, useImperativeHandle, useState } from 'react'
import { FactoryFn, Stato, StatoDef, TransitionInstance } from './stato'

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
  AP = never
>(
  template: FactoryFn<S, T, AP>,
) {
  type Controller = { machine: Stato<S, T, AP>, reset: () => void }
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

  function useCurrentState<T = S>(selector?: (state: S) => T) {
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

  const useTransitioning = (selector?: (state: S) => boolean) => {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToTransitioning.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => selector ? selector(stato.currentState) : stato.transitioning,
      () => selector ? selector(stato.currentState) : stato.transitioning,
    )
  }

  const useRef = () => React.useRef<Controller>(null)
  const createRef = () => React.createRef<Controller>()

  type PropType = AP extends undefined ? {} : { params: AP }

  const Provider = forwardRef<
    Controller,
    PropType & React.PropsWithChildren & { initialState: S }
  >(function StatoController(
    { children, initialState, ...rest },
    ref
  ) {
    const [version, setVersion] = useState(0)

    const controller = useMemo(() => {
      console.log(`version-${version}`, 'building machine')
      const machine = template({
        initialState,
        params: rest['params']
      })
      return {
        machine,
        reset: () => setVersion(version + 1)
      }
    }, [buildHashedKeys(initialState), buildHashedKeys(rest['params']), version])

    useImperativeHandle(ref, () => controller, [controller])

    useEffect(() => {
      return () => {
        console.log(`version-${version}`, 'building machine')
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
  }
}

export type ReactMachine = ReturnType<typeof createMachine>