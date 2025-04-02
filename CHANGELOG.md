# Changelog

## Version 1.11.8

 * Improve background support for web
 * Fix support for outlines
 * Add support for dvh, dvw, lvw, lvh, svw, svh units

## Version 1.10

 * Add support for percentage units on border in web and native (useful for making responsive triangles)

## Version 1.9

 * Add support for `&:active` pseudo selector
 * Add support for `&:focus` pseudo selector

## Version 1.8

 * Accept returning an RN Style object in the tagged template string
 * Fix a type issue in the style prop of the components

## Version 1.7

 * Improve type support for the Theming system

## Version 1.6

 * Creation of RemContext to control rem units value
 * Important performance fix (500% faster!)

## Version 1.5

 * Add Theming features with the same [API](https://styled-components.com/docs/advanced) as `styled-components` lib.
 * Remove support for deprecated components: *ListView*, *SwipeableListView*, *TabBarIOS*, *ToolbarAndroid* and *ViewPagerAndroid*
 * Fix font-weight to accept numeric values

## Version 1.4

 * Change the type of `rnCSS` from `string` to `${string};` to ensure that it will end with a semicolon
