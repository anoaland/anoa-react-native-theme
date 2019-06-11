import React from 'react'
import { StyleSheet } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Theme } from './builder'
import { createThemeProvider, ThemeProviderProps } from './provider'

export interface ThemeContextProps<
  TTheme extends Theme<any, any>,
  TThemes = any
> {
  theme: Pick<TTheme, 'styles' | 'vars'> & {
    change: (key: keyof TThemes | 'default') => void
  }
}

type CreateStyleFn<T extends StyleSheet.NamedStyles<T>, TVars> = (
  vars: TVars
) => StyleSheet.NamedStyles<T>

export class ThemeContext<
  T,
  TProps,
  TNamedStyles,
  TTheme extends Theme<TProps, TNamedStyles>,
  TThemes extends { default: TTheme } & { [P in keyof T]: TTheme }
> {
  private _Context!: React.Context<ThemeContextProps<TTheme, TThemes>>
  private _themes: TThemes
  private _key: keyof TThemes | 'default'
  private _theme!: TTheme
  private _defaultTheme!: Theme<TProps, TNamedStyles>

  constructor(
    defaultTheme: Theme<TProps, TNamedStyles>,
    themes?: { [P in keyof T]: TTheme }
  ) {
    this._key = 'default'
    this._defaultTheme = defaultTheme
    this._activateTheme = this._activateTheme.bind(this)
    this._buildContext = this._buildContext.bind(this)
    this.withTheme = this.withTheme.bind(this)

    this._themes = { ...{ default: defaultTheme }, ...(themes as any) }
    this._themes.default.build()
  }

  /**
   * Theme context provider.
   */
  get Provider(): React.ComponentType<ThemeProviderProps<TTheme, TThemes>> {
    return createThemeProvider(this as any)
  }

  /**
   * Theme context consumer.
   */
  get Consumer() {
    return this._Context.Consumer
  }

  /**
   * Theme context consumer HOC.
   * @param Component component to consume theme
   */
  withTheme<P>(
    Component: React.ComponentType<P & ThemeContextProps<TTheme, TThemes>>
  ): React.ComponentType<P> {
    return (vars: P) => {
      return (
        <this.Consumer>
          {theme => <Component {...vars} theme={theme.theme} />}
        </this.Consumer>
      )
    }
  }

  /**
   * Theme context consumer class decorator.
   */
  withThemeClass(): ClassDecorator {
    return (Component: any) => this.withTheme(Component) as any
  }

  /**
   * Create stylesheet using theme variables.
   * @param styles function that returns named stylesheet.
   */
  createStyleSheet<TS>(
    styles: CreateStyleFn<TS, TProps>
  ): StyleSheet.NamedStyles<TS> {
    // @ts-ignore
    return EStyleSheet.create(styles(this._defaultTheme.esVars))
  }

  private _activateTheme(key: keyof TThemes | 'default') {
    this._key = key
    this._theme = this._themes[this._key] as TTheme
    this._theme.build()
    return this._theme
  }

  private _buildContext(key: keyof TThemes) {
    this._activateTheme(key)

    this._Context = React.createContext<ThemeContextProps<TTheme, TThemes>>({
      theme: {
        vars: this._theme.vars as TTheme['vars'],
        styles: this._theme.styles as TTheme['styles'],
        change: this._activateTheme
      }
    }) as any
  }
}
