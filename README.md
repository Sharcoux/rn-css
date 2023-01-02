# RN-CSS

This is basically [styled-components](https://github.com/styled-components/styled-components) with a much better support for React-Native, and some awesome additional features. You can check the docs of [styled-components](https://github.com/styled-components/styled-components) for more details about the basic API. I'll focus here on the differences.

**Current version: 1.5** [See the Changelog](./CHANGELOG.md)

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

---

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

---

### <ins>inline css with rnCSS:</ins>

This is very handy! You can inject any css string with the rnCSS props:

```javascript
const View = styled.View``
return <View rnCSS="width=2em;height=3em;"/>
```

**Do not forget to close the string with a semicolon**

---

### <ins>Extends components:</ins>

You can extend components this way:

```javascript
const MyComponent = styled.View`
  background-color: red;
`
const Extended = styled(MyComponent)`
  background-color: blue;
`
```

** IMPORTANT:** To extend custom components, you need to propagate the style prop:

```javascript
const MyComponent = ({ style, ...props }) => {
  return <View style={style}>
    ...
  </View>
}
const Extended = styled(MyComponent)`
  background-color: blue;
`
```

---

## Access current font size value

If, somewhere within your app, you need to access the current font size value in px to be able to manually convert em into px, you can use the `FontSizeContext`. This can be helpful if you want to change some behaviour within your app depending on the font size.


```javascript
import { FontSizeContext } from 'rn-css'

...
const [width, setWidth] = React.useState(0)
const em = React.useContext(FontSizeContext)
if(width < 70 * em) { /* Do something when width is lesser than 70em */ }
return <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>...</View>
```

Default value for `rem` units is 16. If you want to declare another value, you can use `RemContext`:

```javascript
import { RemContext } from 'rn-css'
...
return <RemContext.Provider value={10}>{children}</RemContext.Provider>
```

---

## Convert a CSS string to React-Native Style

If, for some reason, you just want to convert a css string to a ReactNative Style object, you can use this feature:

```javascript
import { cssToRNStyle } from 'rn-css'

...
const style = cssToRNStyle('width: 2em; border-width: 12px; background: blue;')
const { width = 32, borderLeftWidth = 12, backgroundColor = 'blue' } = style
```

The second parameter lets you provide:
  * **em** : *(Default: 16)* the current value of em unit for font size. You can retrieve the current context value with the `FontSizeContext`.
  * **width** *(Default: 100)* the reference width that will be used to calculate percentages for the following properties: `marginLeft`, `marginRight`, `translateX` and `borderRadius`
  * **height** *(Default: 100)* the reference width that will be used to calculate percentages for the following properties: `marginTop`, `marginBottom`, `translateY` and `borderRadius`

```javascript
import { cssToRNStyle, FontSizeContext } from 'rn-css'

...
const style = cssToRNStyle('width: 2em; margin: 10%;', { em: React.useContext(FontSizeContext), width: 100, height: 100 })
const { width: 32, marginTop: 10, marginLeft: 10, marginRight: 10, marginBottom: 10 } = style
```

---

## Extended CSS support

We support some cool CSS feature that React-Native doesn't normally handle

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

### <ins>media queries:</ins>

You can add media queries with `@media <constraints> { <instructions> }`

```javascript
const ResponsiveView = styled.View`
  background: red;
  @media (min-width: 600px) {
    background: blue;
  }
`
```

You can use all supported units in the media query.


### <ins>text-overflow:</ins>

If **rn-css** encounters `text-overflow: ellipsis;`, it will be transform into `numberOfLines: 1`, which should give the desired effect.

```javascript
const Text = styled.Text`
  text-overflow: ellipsis;
`
```

### <ins>z-index:</ins>

**rn-css** will try to handle z-index as best as possible so that components from different trees can be correctly compared and positioned. In **iOS**, when a z-index is set, each parent will automatically receive this z-index, unless another value is set. This generally ensure that the behaviour matches the one from web. If you encounter an issue, please report. We might probably fix this.

```javascript
const View = styled.View`
  z-index: 10;
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

---

## Shared value:

If you want to share some data with all of your components, like a theme, you can use the `SharedValues` context. Use it this way:


### Set the value:

```javascript
return <SharedValue.Provider value={{ green: '#00FF00', red: '#FF0000' }}>{children}</SharedValue.Provider>
```

### Use the value:

```javascript
const View = styled.View`
  border-color: ${props => props.shared.green};
`
```

### <ins>Typescript:</ins>

For Typescript, `shared` will always be typed with `unknown`. You need to manually declare the type of your shared object. Be careful: you won't have typecheck this way. We don't have any better way for now.

```typescript
// Create your theme
const theme = { green: '#00FF00', red: '#FF0000' } as const
type Theme = typeof theme

// Somewhere in your React tree:
// <SharedValue.Provider value={theme}>{children}</SharedValue.Provider>

// Use your shared theme
const View = styled.View`
  border-color: ${props => (props.shared as Theme).green;
`
```

---

## Theming:

To match the API of styled-components, we offer the same abilities for theming [See the documentation](https://styled-components.com/docs/advanced).

This relies on the [SharedValue](#shared-value) context. This means that you cannot use the Shared Value system **and** this theming système. Pick the one that best suits your needs.

### Custom theme type for typescript

When you use the theme prop in your components, it is initially typed as `unknown`. But you can make it follow your custom type by extending the type declaration of **rn-css**. You will need to create a file `rncss.d.ts` in the `src` of your project root and add the following lines:

```ts
import 'rn-css';

declare module 'rn-css' {
  type MyTheme = {
    // Describe your theme here.
    // Alternatively, you can use: `type MyTheme = typeof theme` if you have a fixed `theme` object.
  }
  export interface DefaultTheme extends MyTheme {}
}
```

---

## Coming later:

linear-gradient, background-repeat, transitions, animations
