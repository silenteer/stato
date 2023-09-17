import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useMemo, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Stage, create } from "../src";

describe('App', () => {

  type Stages =
    | Stage<{ stage: 'idle', context: { promise: () => Promise<string> } }>
    | Stage<{ stage: 'success', context: { result: string, promise: () => Promise<string> } }>
    | Stage<{ stage: 'error', context: { error: Error, promise: () => Promise<string> } }>

  const mockContextFn = vi.fn(async () => '1234')
  const mockEventListener = vi.fn()

  afterEach(cleanup)

  const builder = create<Stages>()
    .transition({
      name: 'init',
      from: ['idle', 'error', 'success'],
      to: ['error', 'success'],
      async execution({ context }) {
        try {
          const result = await context.promise()
          return { stage: 'success', context: { ...context, result } }
        } catch (e) {
          return { stage: 'error', context: { ...context, error: e } }
        }
      }
    })
    .transition({
      name: 'reset',
      from: ['error', 'success'],
      to: 'idle',
      async execution({ context }) {
        return { stage: 'idle', context: { promise: context.promise } }
      }
    })
    .on(['idle', 'success', 'error'], mockEventListener)

  it('transition the machine should reflect on screen', async () => {
    let machine = builder.build({
      initialStage: { stage: 'idle', context: { promise: mockContextFn } }
    })
    expect(machine.isRunning).not.toBeTruthy()

    const { unmount, getByTestId } = render(
      <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    expect(machine.isRunning).toBeTruthy()
    expect(getByTestId('stage').innerHTML).toBe('idle')

    await machine.dispatch('init')
    expect(getByTestId('stage').innerHTML).toBe('success')

    unmount()
    expect(machine.isRunning).not.toBeTruthy()
  });

  it('transition using self interactions', async () => {
    let machine = builder
      .clone()
      .on('idle', async (_, dispatch) => {
        await dispatch('init')
      })
      .build({
        initialStage: { stage: 'idle', context: { promise: mockContextFn } }
      })

    const { getByTestId } = render(
      <machine.Stager>
        {({ stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    await waitFor(() => expect(getByTestId('stage').innerHTML).toBe('success'))
  });

  it('transition using react interactions', async () => {
    let machine = builder
      .build({
        initialStage: { stage: 'idle', context: { promise: mockContextFn } }
      })

    const { getByTestId, queryAllByTestId } = render(
      <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          {stage === 'success' && <div data-testid="context">{context.result}</div>}
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    expect(getByTestId('stage').innerHTML).toBe('idle')
    expect(queryAllByTestId('context').length).toBe(0)

    getByTestId('dispatcher').click()
    await waitFor(() => expect(getByTestId('stage').innerHTML).toBe('success'))
    expect(getByTestId('context').innerHTML).toBe('1234')

  });

  it('unmount should reset state', async () => {
    let machine = builder.build({
      initialStage: { stage: 'idle', context: { promise: mockContextFn } }
    })
    expect(machine.isRunning).not.toBeTruthy()

    let { unmount, getByTestId } = render(
      <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    await machine.dispatch('init')
    expect(getByTestId('stage').innerHTML).toBe('success')

    unmount()
    expect(machine.isRunning).not.toBeTruthy()

    render(
      <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    expect(getByTestId('stage').innerHTML).toBe('idle')
  });

  it('can set initial state to any', async () => {
    let machine = builder.build({
      initialStage: { stage: 'success', context: { promise: mockContextFn, result: '12345' } }
    })
    expect(machine.isRunning).not.toBeTruthy()

    let { unmount, getByTestId } = render(
      <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          {stage === 'success' && <div data-testid="context">{context.result}</div>}
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    );

    expect(getByTestId('stage').innerHTML).toBe('success')
    expect(getByTestId('context').innerHTML).toBe('12345')
  });

  it('inline state', async () => {
    const Component = ({ input }: { input: string }) => {
      const machine = useMemo(() => {
        return builder.build({
          initialStage: { stage: 'idle', context: { promise: mockContextFn } }
        })
      }, [input])

      return <machine.Stager>
        {({ context, stage, dispatch }) => <>
          <div data-testid="stage">{stage}</div>
          {stage === 'success' && <div data-testid="context">{context.result}</div>}
          <button onClick={() => dispatch('init')} data-testid="dispatcher">
            Transition
          </button>
        </>}
      </machine.Stager>
    }

    const TestComponent = () => {
      const [value, setValue] = useState('')

      return <>
        <Component input={value} />
        <input data-testid='input' value={value} onChange={(e) => setValue(e.target.value)}></input>
      </>
    }

    let { getByTestId } = render(<TestComponent />)

    fireEvent.change(getByTestId('input'), { target: { value: '1234' } })
    getByTestId('dispatcher').click()
    await waitFor(() => expect(getByTestId('stage').innerHTML).toBe('success'))

    fireEvent.change(getByTestId('input'), { target: { value: '1235' } })
    getByTestId('dispatcher').click()
    await waitFor(() => expect(getByTestId('stage').innerHTML).toBe('success'))
  });

  it('show case', async () => {
    let machine = builder.build({
      initialStage: { stage: 'idle', context: { promise: mockContextFn } }
    })

    const Component = () => {
      return <machine.Stager>
        <TransitionStatus />
        <ContextContent />
        <Dispatcher />
      </machine.Stager>
    }

    const TransitionStatus = () => {
      const transition = machine.useTransition()
      return <>
        <div data-testid='transitioning'>Transitioning {transition.transitioning}</div>
      </>
    }

    const ContextContent = () => {
      const { stage, context } = machine.useStage()
      return <>
        <div data-testid="stage">{stage}</div>
        {stage === 'success' && <div data-testid="context">{context.result}</div>}
        {stage !== 'success' && <div data-testid="context">{context['result']}</div>}
      </>
    }

    const Dispatcher = () => {
      return <button onClick={() => machine.dispatch('init')} data-testid="dispatcher">
        Transition
      </button>
    }

    let { getByTestId, debug } = render(<Component />)
    expect(getByTestId('stage').innerHTML).toBe('idle')
    expect(getByTestId('context').innerHTML).toBe('')
    // await waitFor(() =>
    //   expect(getByTestId('transitioning').innerHTML).toBe('Transitioning true')
    // )

    machine.dispatch('init')
    await waitFor(() => expect(getByTestId('stage').innerHTML).toBe('success'))
    expect(getByTestId('context').innerHTML).toBe('1234')
  });
});