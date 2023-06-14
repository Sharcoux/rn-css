/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react'
import { Text, View, Dimensions, StyleSheet } from 'react-native'
import TestRenderer, { act } from 'react-test-renderer'
import styled from '../src/index'

function getStyle (node) {
  return StyleSheet.flatten(node.props.style)
}

it('should update when props change', async () => {
  const Comp = styled.View`
      padding-top: 5px;
      opacity: ${p => p.opacity || 0};
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp opacity={0.5} />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({ paddingTop: 5, opacity: 0.5 })

  await act(async () => {
    wrapper.update(<Comp opacity={0.9} />)
  })// We wait for the useEffect to happen

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({ paddingTop: 5, opacity: 0.9 })
})
it('calls an attr-function with context', async () => {
  const Comp = styled.View.attrs(p => ({
    copy: p.test
  }))``

  const test = 'Put that cookie down!'
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp test={test} />)
  })
  const view = wrapper.root.findByType('View')

  expect(view.props).toMatchObject({
    style: {},
    copy: test,
    test
  })
})
it('merges attrs when inheriting SC', () => {
  const Parent = styled.View.attrs(() => ({
    first: 'first'
  }))``

  const Child = styled(Parent).attrs(() => ({
    second: 'second'
  }))``

  const wrapper = TestRenderer.create(<Child />)
  const view = wrapper.root.findByType('View')

  expect(view.props).toMatchObject({
    style: {},
    first: 'first',
    second: 'second'
  })
})

describe('extended CSS support', () => {
  it('should handle vh, vw, vmin, vmax and rem units', () => {
    const Comp = styled(View)`
        width: 10vmin;
        height: 10vmax;
        padding: 10vw 10vh;
        flex: 1 1 10vh;
        outline: 1rem solid black;
      `

    const { width, height } = Dimensions.get('window')
    const vw = width / 10
    const vh = height / 10
    const vmin = Math.min(vw, vh)
    const vmax = Math.max(vw, vh)

    const wrapper = TestRenderer.create(<Comp />)
    const view = wrapper.root.findByType('View')
    expect(getStyle(view)).toEqual({
      width: vmin,
      height: vmax,
      paddingTop: vw,
      paddingBottom: vw,
      paddingLeft: vh,
      paddingRight: vh,
      outlineColor: 'black',
      outlineStyle: 'solid',
      outlineWidth: 16,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: vh
    })
  })
  it('should handle em units', async () => {
    const Comp = styled(View)`
        width: 10em;
        font-size: 2em;
      `
    const Child = styled(Text)`
        height: 20em;
        font-size: 3em;
      `

    let wrapper
    await act(async () => {
      wrapper = TestRenderer.create(<Comp><Child>test</Child></Comp>)
    })
    const view = wrapper.root.findByType('View')
    const text = wrapper.root.findByType('Text')
    expect(getStyle(view)).toEqual({ fontSize: 16 * 2, width: 16 * 2 * 10 })
    expect(getStyle(text)).toEqual({ fontSize: 16 * 6, height: 16 * 6 * 20 })
  })
  it('should handle em units with more nodes', async () => {
    const Parent = styled.View`
        width: 10em;
        font-size: 10px;
      `
    const Wrapper = styled(View)``
    const Child = styled(Text)`
        height: 20em;
        font-size: 3em;
      `

    let wrapper
    await act(async () => {
      wrapper = TestRenderer.create(<Parent><Wrapper><Child>test</Child></Wrapper></Parent>)
    })
    const [parent] = wrapper.root.findAllByType('View')
    const text = wrapper.root.findByType('Text')
    expect(getStyle(parent)).toEqual({ fontSize: 10, width: 100 })
    expect(getStyle(text)).toEqual({ fontSize: 30, height: 3 * 20 * 10 })
  })
  it('should support overwriting style', async () => {
    const Comp = styled.View`
        width: 10em;
        font-size: 2em;
      `
    const Extent = styled(Comp)`
        width: 10px;
      `

    let wrapper
    await act(async () => {
      wrapper = TestRenderer.create(<Extent>test</Extent>)
    })
    const view = wrapper.root.findByType('View')
    expect(getStyle(view)).toEqual({ width: 10, fontSize: 32 })
  })
  it('should cache the value correctly', async () => {
    const Comp = styled(View)`
        width: 10em;
        font-size: 2em;
      `
    const Child = styled(Text)`
        width: 10em;
        font-size: 2em;
      `

    let wrapper
    await act(async () => {
      wrapper = TestRenderer.create(<Comp><Child>test</Child></Comp>)
    })
    const view = wrapper.root.findByType('View')
    const text = wrapper.root.findByType('Text')
    expect(getStyle(view)).toEqual({ fontSize: 16 * 2, width: 16 * 2 * 10 })
    expect(getStyle(text)).toEqual({ fontSize: 16 * 4, width: 16 * 4 * 10 })
  })
  it('should handle window resizing', async () => {
    const Comp = styled(View)`
        width: 10vw;
        padding: 10vw 10vw;
        outline: 10vw solid black;
      `

    const { width, height } = Dimensions.get('window')
    const vw = width / 10

    // Mock Dimensions object to emulate a resize
    const listeners = []
    const oldDimensions = { ...Dimensions }
    Dimensions.addEventListener = (type, listener) => {
      type === 'change' && listeners.push(listener)
      return { remove: () => listeners.splice(listeners.indexOf(listener), 1) }
    }
    Dimensions.get = () => ({ width, height })

    // Check that the new Dimension object is working as expected
    let wrapper
    await act(async () => {
      wrapper = TestRenderer.create(<Comp />)
    })
    const view = wrapper.root.findByType('View')
    expect(getStyle(view)).toEqual({
      width: vw,
      paddingTop: vw,
      paddingBottom: vw,
      paddingLeft: vw,
      paddingRight: vw,
      outlineColor: 'black',
      outlineStyle: 'solid',
      outlineWidth: vw
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
    expect(getStyle(updatedView)).toEqual({
      width: 20,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      outlineColor: 'black',
      outlineStyle: 'solid',
      outlineWidth: 20
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
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({ transform: [{ rotate: '10rad' }, { rotate: '10deg' }] })
})
it('should not convert % for supported values', async () => {
  const Comp = styled.View`
    width: 10%;
    height: 10%;
    min-width: 10%;
    min-height: 10%;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    flex-basis: 10%;
  `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    width: '10%',
    height: '10%',
    minWidth: '10%',
    minHeight: '10%',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    flexBasis: '10%'
  })
})
it('should handle maths values', async () => {
  const Comp = styled.View`
      transform: translate(2em, 3em) rotate(36deg);
      marginLeft: calc(10em - 20px);
      width: min(10em, 20px);
      height: max(10em, 20px);
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    marginLeft: 140,
    transform: [{ translateX: 32 }, { translateY: 48 }, { rotate: '36deg' }],
    height: 160,
    width: 20
  })
})
it('should handle font family names', async () => {
  const Comp = styled.View`
    font-family: 'Rounded Mplus 1c';
  `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    fontFamily: "'Rounded Mplus 1c'"
  })
})
it('should handle border radius values', async () => {
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      border-radius: 50%;
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onLayout({
      nativeEvent: { layout: { width: 100, height: 100 } }
    })
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: 100,
    width: 100
  })
})
it('should handle hover', async () => {
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      &:hover {
        width: 200px;
        height: 200px;
      }
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onMouseEnter()
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    height: 200,
    width: 200
  })
})
it('should handle active on Touchable', async () => {
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      &:active {
        width: 200px;
        height: 200px;
      }
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp/>)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onTouchStart()
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    height: 200,
    width: 200
  })
})
it('should handle active on View', async () => {
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      &:active {
        width: 200px;
        height: 200px;
      }
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onResponderStart()
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    height: 200,
    width: 200
  })
})
it('should handle focus', async () => {
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      &:focus {
        width: 200px;
        height: 200px;
      }
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onFocus()
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    height: 200,
    width: 200
  })
})
// eslint-disable-next-line jest/no-focused-tests
it('should handle media queries', async () => {
  const { width, height } = Dimensions.get('window')
  const Comp = styled.View`
      width: 100px;
      height: 100px;
      @media screen and (max-width: ${width * 2}px) {
        width: 200px;
        height: 200px;
      }
      @media screen and (min-width: ${width * 2}px) {
        color: red;
      }
      @media screen and (orientation: ${width > height ? 'landscape' : 'portrait'}) {
        background: blue;
      }
    `

  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })

  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    height: 200,
    width: 200,
    backgroundColor: 'blue'
  })
})
it('Should merge the inline css within rnCSS prop', async () => {
  const Comp = styled.View`
    width: 100px;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp rnCSS="color:#236AFF;width:200px;"/>)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    color: '#236AFF',
    width: 200
  })
})
it('Should merge the inline css within rnCSS prop and respect priority', async () => {
  const Comp = styled.View`
    border-width: 2px;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp rnCSS="border:none;"/>)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    borderBottomColor: 'black',
    borderBottomStyle: 'solid',
    borderBottomWidth: 0,
    borderLeftColor: 'black',
    borderLeftStyle: 'solid',
    borderLeftWidth: 0,
    borderRightColor: 'black',
    borderRightStyle: 'solid',
    borderRightWidth: 0,
    borderTopColor: 'black',
    borderTopStyle: 'solid',
    borderTopWidth: 0
  })
})
it('Should handle text-overflow', async () => {
  const Comp = styled.Text`
    text-overflow: ellipsis;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  expect(wrapper.root.findByType('Text').props.numberOfLines).toBe(1)
})
it('Should handle transition', async () => {
  const Comp = styled.View`
    transition: all 0.5s;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({ transition: 'all 0.5s' })
})
it('Should overwrite properties when extending', async () => {
  const Comp = styled.View`
    width: 10px;
  `
  const Extend = styled(Comp)`
    width: 20px;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Extend />)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({ width: 20 })
})
it('Should accept % in transform', async () => {
  const Comp = styled.View`
    transform: translate(2%, 3%) scale(2);
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  await act(async () => {
    wrapper.root.findByType('View').props.onLayout({
      nativeEvent: { layout: { width: 1000, height: 100 } }
    })
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    transform: [
      {
        translateX: 20
      },
      {
        translateY: 3
      },
      {
        scaleX: 2
      }, {
        scaleY: 2
      }
    ]
  })
})
it('Should merge style props', async () => {
  const Comp = styled.View`
    height: 2em;
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp style={{
      transform: [{
        translateX: 50
      }]
    }} />)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual(
    {
      height: 32,
      transform: [
        {
          translateX: 50
        }
      ]
    }
  )
})
it('Should accept RN Style in the tagged template', async () => {
  const Comp = styled.View`
    ${{ height: 20, color: 'red' }}
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp />)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    color: 'red',
    height: 20
  })
})
it('Should accept functions returning RN Style in the tagged template', async () => {
  const Comp = styled.View`
    ${props => ({ height: props.value, width: props.value })}
  `
  let wrapper
  await act(async () => {
    wrapper = TestRenderer.create(<Comp value={20} />)
  })
  expect(getStyle(wrapper.root.findByType('View'))).toEqual({
    width: 20,
    height: 20
  })
})
