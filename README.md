# RN-CSS

This lib brings CSS units to react-native with the same API as [styled-components](https://github.com/styled-components/styled-components). You can check there for more documentation

## Supported units:

calc, px, pc, em, vh, vw, vmin, vmax

### percentage support:

There is only partial support for % units as I didn't find a way to retrieve the parent's size without a reference to the parent...

## Supported features:

### inner functions:

```javascript
const View = styled.View`
  color: ${props => props.color || 'black'}
`
```


### calc:

You can write things like `calc(2em - 1px)`. Keep in mind that the support for % is limited right now.

```javascript
const View = styled.View`
  width: calc(200px - 10em);
`
```

### attrs:

You can inject props with attrs: `styled(MyComp).attrs({ ...props })` or `styled(MyComp).attrs(props => ({ ...newProps }))`

```javascript
const View = styled.View.attrs({ color: 'blue' })`
  width: calc(200px - 10em);
  background: ${props => props.color};
`
```

### hover:

You can add hover with `&:hover { <instructions> }`

```javascript
const Hoverable = styled.View`
  background: red;
  &:hover {
    background: blue;
  }
`
```

### inline css with rnCSS

You can inject direct css string with rnCSS props:

```javascript
const View = styled.View``
return <View rnCSS="width=2em;height=3em;"/>
```

### Coming soon:

media-queries, linear-gradient
