import React from 'react'

// interface ThemeContextProps<TTheme, TThemes> {
//   theme: TTheme
//   change: (key: keyof TThemes) => void
// }

export interface ThemeProviderProps<TTheme, TThemes> {
  getDefault?: () => Promise<keyof TThemes>
  onChange?: (key: keyof TThemes, theme: TTheme) => void
}

interface ThemeProviderState<TTheme, TThemes> {
  key: keyof TThemes | 'default'
  theme: TTheme
  ready: boolean
}

interface ThemeContext<TTheme, TThemes> {
  _buildContext: (key: keyof TThemes | 'default') => void
  _activateTheme: (key: keyof TThemes | 'default') => TTheme
  _Context: any // React.Context<ThemeContextProps<TTheme, TThemes>>
  _themes: TThemes
  _key: keyof TThemes | 'default'
  _theme: TTheme
}

export const createThemeProvider = <TTheme, TThemes>(
  context: ThemeContext<TTheme, TThemes>
) => {
  return class ThemeProvider extends React.PureComponent<
    ThemeProviderProps<TTheme, TThemes>,
    ThemeProviderState<TTheme, TThemes>
  > {
    constructor(props: ThemeProviderProps<TTheme, TThemes>) {
      const { _key, _theme } = context
      super(props)
      this.state = {
        key: _key,
        theme: _theme,
        ready: false
      }
    }

    componentDidMount() {
      const { _buildContext } = context
      const { getDefault } = this.props

      if (!getDefault) {
        _buildContext('default')
        this.setState({ ready: true })
        return
      }

      getDefault().then(key => {
        _buildContext(key)
        this.setState({ ready: true })
      })
    }

    render() {
      const { _activateTheme, _Context, _key, _theme } = context
      const { ready } = this.state
      const { onChange } = this.props

      if (!ready) {
        return null
      }

      return (
        <_Context.Provider
          value={{
            theme: {
              // @ts-ignore
              vars: _theme.vars,
              // @ts-ignore
              styles: _theme.styles,
              // @ts-ignore
              change: key => {
                if (_key === key) {
                  return
                }

                const theme = _activateTheme(key)
                this.setState({ key, theme }, () => {
                  if (onChange) {
                    onChange(key, theme)
                  }
                })
              }
            }
          }}
        >
          {this.props.children}
        </_Context.Provider>
      )
    }
  }
}
