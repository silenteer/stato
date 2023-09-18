import { ComponentType, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react"
import { useSnapshot } from "valtio"
import { Stager, StageDef, TransitionInstance, StageBuilder } from "./index"

export type ReactStager<
  S extends StageDef,
  T extends TransitionInstance<S, any>
> = Stager<S, T> & {
  withStager: <T extends { key?: string | number | null | undefined }>(Component: ComponentType<T>, initialContext: S) => ComponentType<T>
  Stager: (props: {
    children: ReactNode | ((props: S & { transition: Readonly<Stager<S, T>['transition']>, dispatch: Stager<S, T>['dispatch'] }) => ReactNode),
    initialContext: S
  }) => React.JSX.Element | null
  
  useStage: () => ReturnType<typeof useSnapshot<S>>
  useTransition: () => ReturnType<typeof useSnapshot<Stager<S, T>['transition']>>
  useListen: Stager<S, T>['on']
  
  Stage: <N extends S['stage']>(props: {
    stage: N
    children: ReactNode | ((props: Readonly<Extract<S, { stage: N }>> & {
      transition: Readonly<Stager<S, T>['transition']>,
      dispatch: Stager<S, T>['dispatch']
    }) => ReactNode)
  }) => React.JSX.Element | null
}

export const createStager = <
  S extends StageDef, 
  T extends TransitionInstance<S, any>
>(input: Stager<S, T> | StageBuilder<S, T>): ReactStager<S, T> => {
  const reactContext = createContext<Stager<S, T> | undefined>(undefined)
  
  const stager = input instanceof StageBuilder
    ? input.clone().build()
    : input

  const reactStager: ReactStager<S, T> = {
    ...stager,
    withStager(Component, is) {
      return (props) => {
        return (
          <reactStager.Stager initialContext={is}>
            <Component {...props} />
          </reactStager.Stager>
        )
      }
    },
    useStage() {
      const stager = useContext(reactContext)

      if (!stager) {
        throw new Error('stage context must be used within `withStager`')
      }

      if (!stager.isRunning) {
        throw new Error('invalid running state')
      }

      return useSnapshot(stager.currentStage)
    },
    useListen(stage, cb) {
      const names = typeof stage === 'string' ? [stage] : stage

      useEffect(() => {
        return stager.on(names, cb as any)
      }, [])
    },
    useTransition() {
      const stager = useContext(reactContext)

      if (!stager) {
        throw new Error('stage context must be used within `withStager`')
      }

      return useSnapshot(stager.transition)
    },
    Stage: ({ stage: name, children }) => {
      const stager = useContext(reactContext)

      if (!stager) {
        throw new Error('stage context must be used within `withStager`')
      }

      if (!stager.isRunning) {
        throw new Error('invalid running state')
      }

      const transition = useSnapshot(stager.transition)
      const { context, stage } = useSnapshot(stager.currentStage)

      if (stager.currentStage.stage !== name) return null
      else {
        return <>
          {
            typeof children === 'function'
              ? children({ transition, context, stage, dispatch: stager.dispatch } as any)
              : children
          }
        </>
      }
    },
    Stager: ({ children, initialContext }) => {
      const instance = useMemo(() => {
        stager.start(initialContext)

        if (!stager.isRunning) {
          throw new Error('type assertions')
        }

        return stager
      }, [initialContext])

      useEffect(() => {
        return () => {
          stager.stop()
        }
      }, [initialContext])

      const transition = useSnapshot(instance.transition)
      const { context, stage } = useSnapshot(instance.currentStage)

      return (
        <reactContext.Provider value={stager}>
          {
            typeof children === 'function'
              ? children({ transition, context, stage, dispatch: stager.dispatch } as any)
              : children
          }
        </reactContext.Provider>
      )
    }
  }

  return reactStager
}

export { create, type Stage, type StageDef } from "./index"