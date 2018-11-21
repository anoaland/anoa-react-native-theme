# Anoa React Native Theme

Theme and stylesheet manager for ReactNative

# Installation

`npm i anoa-react-native-theme`

# Usage

## Create Theme(s)

### Default Theme

```ts
import { createTheme } from 'anoa-react-native-theme'

export const BlueTheme = createTheme(
  // define all theme props here
  // like color, thickness, radius, etc.
  {
    color: {
      primary: 'blue',
      secondary: 'yellow'
    },
    border: {
      thick: 1,
      bold: 10
    }
  },

  // define named styles using defined theme props
  props => ({
    container: {
      padding: 40,
      backgroundColor: props.color.primary
    },
    button: {
      borderWidth: props.border.thick,
      backgroundColor: props.color.secondary
    }
  })
)
```

### Create another theme from Default Theme / child theme (optional)

```ts
export const RedTheme = BlueTheme.extend(
  // override default theme props value
  {
    color: {
      primary: 'red',
      secondary: 'green'
    }
  },

  // override default theme style
  props => ({
    container: {
      padding: 80
    },
    button: {
      borderWidth: props.border.bold
    }
  })
)
```

## Create Theme Context

```ts
import { ThemeContext } from 'anoa-react-native-theme'

export const AppTheme = new ThemeContext(BlueTheme, {
  red: RedTheme

  // define the rest themes you have, eg:
  // green: GreenTheme,
  // yellow: YellowTheme
  // etc ...

  // Notice: all themes defined here must created/extended
  // from default theme or child of default theme.
})
```

## Theme Provider

We are using [React Context](https://reactjs.org/docs/context.html) to provide themes accessibility.

The `AppTheme` you've created above contains `Provider` and `Consumer` property.
You have to wrap your root component with `Provider` to make themes
available in every component inside.

```tsx
export default class App extends Component {
  // ...
  render() {
    return (
      <AppTheme.Provider
        // optional props to get default theme
        getDefault={async () => {
          // do async operation to get selected theme
          // should returns 'default' or the object key of themes
          // you've defined in the context (eg: 'red' for RedTheme)
          return await MyFancyStorage.getTheme()
        }}
        // optional props, the event that listen when theme get changed
        onChange={async key => {
          // key returns the 'default' or the object key of themes
          await MyFancyStorage.setTheme(key)
        }}
      >
        <View style={styles.container}>
          <AwesomeComponent />
        </View>
      </AppTheme.Provider>
    )
  }
  // ...
}
```

## Consuming Theme

To consume theme you need to wrap the component with `Consumer`. Wrapping with `Consumer` can also be done by using `withTheme` HOC or `withThemeClass` class decorator.

### Consume theme using AppTheme.Consumer

The `Consumer` resulting `function component` with one parameter called `theme` consists of:

- **`props`** -- represents current theme variables.

- **`styles`** -- represents current theme named stylesheets.

- **`change`** - a function to change theme.

For more detail, have a look this example:

```tsx
export class AwesomeComponent extends React.Component {
  // ...

  public render() {
    return (
      <AppTheme.Consumer>
        {({ theme: { props, styles, change } }) => (
          <View style={styles.container}>
            <Button
              style={styles.button}
              color={props.color.primary}
              title="Switch to Red Theme"
              onPress={async () => {
                change('red')
              }}
            />

            <Button
              style={theme.styles.button}
              title="Switch to Default Theme"
              onPress={async () => {
                change('default')
              }}
            />
          </View>
        )}
      </AppTheme.Consumer>
    )
  }

  // ...
}
```

### Using withTheme HOC

Use `AppTheme.withTheme` as HOC (Higher Order Component) that injects `theme` into your component.

```tsx
export interface ProfileProps {
  firstName: string
  lastName: string
}

export const Profile = AppTheme.withTheme<ProfileProps>(
  ({ theme, firstName, lastName }) => (
    <View style={theme.styles.container}>
      <Text>{firstName}</Text>
      <Text>{lastName}</Text>
    </View>
  )
)
```

### Using withThemeClass Decorator

If you are fans of class decorator, you can use `AppTheme.withThemeClass` class decorator to inject `theme` into your component class.

```tsx
// Theme props injected into AppThemeProps (see explanation bellow).
// We make it Partial as we don't wont this props to be required when
// using this component.
export interface LoginProps extends Partial<AppThemeProps> {
  // some props
}

@AppTheme.withThemeClass()
export class Login extends React.Component<LoginProps> {
  constructor(props: LoginProps) {
    super(props)
  }

  public render() {
    // consume theme props, cast it as Required props
    // as it always injected here.
    const { theme } = this.props as Required<LoginProps>

    return (
      <View style={theme.styles.button}>
        <Text style={{ color: theme.props.color.primary }}>Login</Text>
      </View>
    )
  }
}
```

**AppThemeProps**

For typing convenience we need `AppThemeProps` interface that provide app theme props accessibility. Creating this interface is easily done by:

```ts
import { ThemeContextProps } from 'anoa-react-native-theme'

// Use the default theme type (BlueTheme) to presents props values.
export type AppThemeProps = ThemeContextProps<typeof BlueTheme>
```

## Create local stylesheet

The `AppTheme` also comes with `createStyleSheet` function that let you create custom local styles for your component using theme props values.

```tsx
@AppTheme.withThemeClass()
export class About extends React.Component<AboutProps> {
  constructor(props: AboutProps) {
    super(props)
  }

  public render() {
    return (
      <View style={styles.container}>
        <Text>About</Text>
      </View>
    )
  }
}

// create stylesheet based on theme props value
const styles = AppTheme.createStyleSheet(props => ({
  container: {
    backgroundColor: props.color.primary,
    padding: 25
  }
}))
```

# License

MIT
