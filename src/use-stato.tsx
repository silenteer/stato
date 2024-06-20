import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
import { FactoryFn, Stato, StatoDef, TransitionInstance } from './stato'

function buildHashedKeys(obj: any): string {
  const keys = Object.keys(obj)
  const sortedKeys = keys.sort()
  return sortedKeys.map(key => JSON.stringify(obj[key])).join('')
}

export function createMachine<
  S extends StatoDef,
  T extends TransitionInstance<S>,
  AP
>(
  template: FactoryFn<S, T, AP>,
) {
  const Context = createContext<Stato<S, T, AP> | undefined>(undefined)

  const useStato = () => {
    const context = useContext(Context)
    if (!context) {
      throw new Error('useStato must be used within a StatoProvider')
    }

    return context
  }

  const useCurrentState = () => {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToStateChange.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => stato.currentState,
      () => stato.currentState,
    )
  }

  const useDispatch = () => {
    const stato = useStato()
    return stato.dispatch.bind(stato) as Stato<S, T, AP>['dispatch']
  }

  const useTransitioning = () => {
    const stato = useStato()
    const subscribe = useMemo(() => stato.subscribeToTransitioning.bind(stato), [stato])

    return useSyncExternalStore(
      subscribe,
      () => stato.transitioning,
      () => stato.transitioning,
    )
  }

  const Provider = ({ children, initialState, params }: React.PropsWithChildren & { initialState: S, params: AP }) => {
    const machine = useMemo(() => {
      console.log('building machine')
      const machine = template({
        initialState,
        params
      })
      return machine
    }, [buildHashedKeys(initialState), buildHashedKeys(params)])

    useEffect(() => {
      return () => {
        console.log('disposing machine')
        machine.dispose()
      }
    }, [buildHashedKeys(initialState), buildHashedKeys(params)])

    return <Context.Provider value={machine}>
      {children}
    </Context.Provider>
  }

  return {
    Provider,
    useStato,
    useCurrentState,
    useTransitioning,
    useDispatch
  }
}

export type ReactMachine = ReturnType<typeof createMachine>