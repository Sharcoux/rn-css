/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react'
import { Text, View, Dimensions } from 'react-native'
import TestRenderer, { act } from 'react-test-renderer'
import styled from '../src/index'

it('should update when props change', async () => {
  const Comp = styled.View`
      padding-top: 5px;
      opacity: ${p => p.opacity || 0};
    `

  const wrapper = TestRenderer.create(<Comp opacity={0.5} />)

  expect(wrapper.root.findByType('View').props.style).toEqual({ paddingTop: 5, opacity: 0.5 })

  await act(async () => {
    wrapper.update(<Comp opacity={0.9} />)
  })// We wait for the useEffect to happen

  expect(wrapper.root.findByType('View').props.style).toEqual({ paddingTop: 5, opacity: 0.9 })
})
// it('calls an attr-function with context', () => {
//   const Comp = styled.View.attrs(p => ({
//     copy: p.test
//   }))``

//   const test = 'Put that cookie down!'
//   const wrapper = TestRenderer.create(<Comp test={test} />)
//   const view = wrapper.root.findByType('View')

//   expect(view.props).toEqual({
//     style: [{}],
//     copy: test,
//     test
//   })
// })
// it('merges attrs when inheriting SC', () => {
//   const Parent = styled.View.attrs(() => ({
//     first: 'first'
//   }))``

//   const Child = styled(Parent).attrs(() => ({
//     second: 'second'
//   }))``

//   const wrapper = TestRenderer.create(<Child />)
//   const view = wrapper.root.findByType('View')

//   expect(view.props).toMatchObject({
//     style: [{}],
//     first: 'first',
//     second: 'second'
//   })
// })

describe('extended CSS support', () => {
  it('should handle vh, vw, vmin, vmax and rem units', () => {
    const Comp = styled(View)`
        width: 10vmin;
        height: 10vmax;
        padding: 10vw 10vh;
        border: 1rem solid black;
      `

    const { width, height } = Dimensions.get('window')
    const vw = width / 10
    const vh = height / 10
    const vmin = Math.min(vw, vh)
    const vmax = Math.max(vw, vh)

    const wrapper = TestRenderer.create(<Comp />)
    const view = wrapper.root.findByType('View')
    expect(view.props.style).toEqual({
      width: vmin,
      height: vmax,
      paddingTop: vw,
      paddingBottom: vw,
      paddingLeft: vh,
      paddingRight: vh,
      borderColor: 'black',
      borderStyle: 'solid',
      borderWidth: 16
    })
  })
  it('should handle em units', () => {
    const Comp = styled(View)`
        width: 10em;
        font-size: 2em;
      `
    const Child = styled(Text)`
        height: 20em;
        font-size: 3em;
      `

    const wrapper = TestRenderer.create(<Comp><Child>test</Child></Comp>)
    const view = wrapper.root.findByType('View')
    const text = wrapper.root.findByType('Text')
    expect(view.props.style).toEqual({ fontSize: 16 * 2, width: 16 * 2 * 10 })
    expect(text.props.style).toEqual({ fontSize: 16 * 6, height: 16 * 6 * 20 })
  })
  it('should cache the value correctly', () => {
    const Comp = styled(View)`
        width: 10em;
        font-size: 2em;
      `
    const Child = styled(Text)`
        width: 10em;
        font-size: 2em;
      `

    const wrapper = TestRenderer.create(<Comp><Child>test</Child></Comp>)
    const view = wrapper.root.findByType('View')
    const text = wrapper.root.findByType('Text')
    expect(view.props.style).toEqual({ fontSize: 16 * 2, width: 16 * 2 * 10 })
    expect(text.props.style).toEqual({ fontSize: 16 * 4, width: 16 * 4 * 10 })
  })
  it('should handle window resizing', async () => {
    const Comp = styled(View)`
        width: 10vw;
        padding: 10vw 10vw;
        border: 10vw solid black;
      `

    const { width, height } = Dimensions.get('window')
    const vw = width / 10

    // Mock Dimensions object to emulate a resize
    const listeners = []
    const oldDimensions = { ...Dimensions }
    Dimensions.addEventListener = (type, listener) => type === 'change' && listeners.push(listener)
    Dimensions.removeEventListener = (type, listener) => type === 'change' && listeners.splice(listeners.indexOf(listener), 1)
    Dimensions.get = () => ({ width, height })

    // Check that the new Dimension object is working as expected
    const wrapper = TestRenderer.create(<Comp />)
    const view = wrapper.root.findByType('View')
    expect(view.props.style).toEqual({
      width: vw,
      paddingTop: vw,
      paddingBottom: vw,
      paddingLeft: vw,
      paddingRight: vw,
      borderColor: 'black',
      borderStyle: 'solid',
      borderWidth: vw
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await act(async () => {})// We wait for the useEffect to happen
    expect(listeners.length).toBe(1)// Ensure that the resizeListener got added

    // Emulate a resize
    Dimensions.get = () => ({ width: 200, height })
    await act(async () => {
      listeners.forEach(listener => listener({ window: Dimensions.get() }))
    })// We wait for the useEffect to happen
    // Check that resizing the component works as espected
    const updatedView = wrapper.root.findByType('View')
    expect(updatedView.props.style).toEqual({
      width: 20,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      borderColor: 'black',
      borderStyle: 'solid',
      borderWidth: 20
    })

    // Ensure that the listener has been removed
    await act(async () => {
      wrapper.unmount()
    })// We wait for the useEffect to happen
    expect(listeners.length).toBe(0)

    // restore original Dimensions object
    Object.assign(Dimensions, oldDimensions)
  })
})
it('should not convert deg and rad', async () => {
  const Comp = styled.View`
      transform: rotate(10rad) rotate(10deg);
    `

  const wrapper = TestRenderer.create(<Comp />)

  expect(wrapper.root.findByType('View').props.style).toEqual({ transform: [{ rotate: '10rad' }, { rotate: '10deg' }] })
})
it('should handle calc values', async () => {
  const Comp = styled.View`
      transform: translate(2em, 3em) rotate(36deg);
      marginLeft: calc(10em - 20px);
    `

  const wrapper = TestRenderer.create(<Comp />)

  expect(wrapper.root.findByType('View').props.style).toEqual({ marginLeft: 140, transform: [{ translateX: 32, translateY: 48 }, { rotate: '36deg' }] })
})
