# RN-CSS

This lib brings CSS to react-native with the same API as [styled-components](https://github.com/styled-components/styled-components). You can check there for more documentation

---

## Supported units:

calc, max, min, px, pc, cm, mm, em, vh, vw, vmin, vmax

### percentage support:

There is only partial support for % units as I didn't find a way to retrieve the parent's size without a reference to the parent...

**Without calc, min, max**: The value should still work as expected for the following CSS properties, as long as you don't use calc, min or max:

 * width
 * height
 * min-width
 * min-height
 * max-width
 * max-height
 * top
 * bottom
 * left
 * right
 * flex-basis

**With calc, min, max**: You can try using calc, min, max with the following CSS props:

 * font-size
 * margin-left
 * margin-right
 * margin-top
 * margin-bottom

---

## Supported features:

### <ins>inner functions:</ins>

```javascript
const View = styled.View`
  color: ${props => props.color || 'black'}
`
```

### <ins>calc:</ins>

You can write things like `calc(2em - 1px)`. Keep in mind that the support for % is limited right now.

```javascript
const View = styled.View`
  width: calc(200px - 10em);
`
```

### <ins>min:</ins>

You can write things like `min(2em, 10px)`. Keep in mind that the support for % is limited right now.

```javascript
const View = styled.View`
  width: min(2em, 10px);
`
```

### <ins>max:</ins>

You can write things like `max(2em, 10px)`. Keep in mind that the support for % is limited right now.

```javascript
const View = styled.View`
  width: max(2em, 10px);
`
```

### <ins>attrs:</ins>

You can inject props with attrs: `styled(MyComp).attrs({ ...props })` or `styled(MyComp).attrs(props => ({ ...newProps }))`

```javascript
const View = styled.View.attrs({ color: 'blue' })`
  width: calc(200px - 10em);
  background: ${props => props.color};
`
```

### <ins>hover:</ins>

You can add hover with `&:hover { <instructions> }`

```javascript
const Hoverable = styled.View`
  background: red;
  &:hover {
    background: blue;
  }
`
```

### <ins>inline css with rnCSS:</ins>

You can inject direct css string with rnCSS props:

```javascript
const View = styled.View``
return <View rnCSS="width=2em;height=3em;"/>
```

---


### Coming soon:

media-queries

### Coming later:

linear-gradient, background-repeat, transitions, animations

## Access current font size value

If somewhere within your app, you need to know the current font size value in px to be able to manually convert em in px, you can do the following:

```javascript
import { FontSizeContext } from 'rn-css'

...
const em = React.useContext(FontSizeContext)
const tenEmInPixels = 10 * em
```
