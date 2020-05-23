# RN-CSS

This lib brings CSS units to react-native with the same API as [styled-components](https://github.com/styled-components/styled-components). You can check there for more documentation

## Supported units:

calc, px, pc, em, vh, vw, vmin, vmax

### percentage support:

There is only partial support for % units as I didn't find a way to retrieve the parent's size without a reference to the parent...

## Supported features:

### calc:

You can write things like `calc(2em - 1px)`. Keep in mind that the support for % is limited right now.

### attrs:

You can inject props with attrs: `styled(MyComp).attrs({ ...props })` or `styled(MyComp).attrs(props => ({ ...newProps }))`

### Coming soon:

media-queries, linear-gradient, attr, inline css prop