# RN-CSS

This is basically [styled-components](https://github.com/styled-components/styled-components) with a much better support for React-Native, and some awesome additional features. You can check the docs of [styled-components](https://github.com/styled-components/styled-components) for more details about the basic API. I'll focus here on the differences.

---

## Purpose

The goal here is to be able to write a common code for React-Native-Web and React-Native without having to worry about the limitations of React-Native. React-Native supports only a subset of CSS but with `rn-css` you will be able to style your components as if you were using React. See:

```javascript
const MyComponent = styled.View`
  width: 2em;
  height: 2em;
  border-radius: 50%;
  &:hover {
    background: red;
  }
  @media (min-width: 600px) {
    border: 1px solid rgb(128, 128, 128);
  }
`
```

---

## Supported units:

Here is a list of the units supported by `rn-css`. You can use them as you wish within your components:

  * px
  * pc
  * em
  * rem
  * cm
  * mm
  * vh
  * vw
  * vmin
  * vmax

### percentage support:

There is only partial support for `%` units as I didn't find a way to retrieve the parent's size without a reference to the parent... I'll detail here what you can do and what you probably can't.

**`%` without `calc`, `min`, `max`**: You should be able to use `%` for the following CSS properties, as long as you don't use `calc`, `min` or `max`:

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

**`%` with `calc`, `min`, `max`**: You can try using `%` inside `calc`, `min` or `max` with the following CSS props, it should work as expected:

 * font-size
 * margin-left
 * margin-right
 * margin-top
 * margin-bottom

---

## Supported features:

Here is a bunch of cool feature that you can use with this lib!

### <ins>inner functions:</ins>

Just like `styled-components`, you can access your props with a function:

```javascript
const View = styled.View`
  color: ${props => props.color || 'black'}
`
```

Here is for usage with **typescript**:

```typescript
const View = styled.View<{ color: string }>`
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

Here is the **typescript** version:

```typescript
const View = styled.View.attrs<{ color: string }>({ color: 'blue' })`
  width: calc(200px - 10em);
  background: ${props => props.color};
`
```

Here is the version with a function:

```javascript
const View = styled.View.attrs(props => ({ fontSize: props.fontSize * 2 }))`
  fontSize: ${props => props.fontSize};
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

This is very handy! You can inject any css string with rnCSS props:

```javascript
const View = styled.View``
return <View rnCSS="width=2em;height=3em;"/>
```

---

### <ins>media queries:</ins>

You can add media queries with `@media <constraints> { <instructions> }`

```javascript
const Hoverable = styled.View`
  background: red;
  &:hover {
    background: blue;
  }
`
```

This is a new feature. Don't hesitate to report any bug you might encounter.

---

## Access current font size value

You should not needed it, but in case, somewhere within your app, you need to access the current font size value in px to be able to manually convert em into px, you can do the following:

```javascript
import { FontSizeContext } from 'rn-css'

...
const em = React.useContext(FontSizeContext)
const tenEmInPixels = 10 * em
```

---

## Coming later:

linear-gradient, background-repeat, transitions, animations
