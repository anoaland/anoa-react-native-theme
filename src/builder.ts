import merge from 'deepmerge'
import { StyleSheet } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

type DeepPartial<T> = { [P in keyof T]?: Partial<T[P]> }
type NamedStyles<T> = StyleSheet.NamedStyles<T>

export type ExtendThemeFunction<T, R, TC> = (
  esProps: DeepPartial<T>,
  styles?: (vars: T) => DeepPartial<NamedStyles<R>>
) => Theme<T, R, TC>

export interface Theme<T, R, TC = Partial<T>> {
  /**
   * Extended stylesheet props.
   */
  esProps: TC

  /**
   * Named styles.
   */
  styles: R

  /**
   * Theme props values.
   */
  props: T

  /**
   * Create new theme from this theme.
   */
  extend: ExtendThemeFunction<T, R, TC>

  /**
   * Build and activate this theme.
   */
  build: () => void
}

/**
 * Create new theme.
 * @param props Styles variables
 * @param styles Named styles
 * @param parentStyles Named styles parent
 */
export function createTheme<T, R>(
  props: T,
  styles?: (vars: T) => Partial<NamedStyles<R>>,
  parentStyles?: {}
): Theme<T, R, Partial<T>> {
  const esObjectRecord: Record<any, any> = {}

  const buildEsStyleObject = (c: any, parent?: string) => {
    const res: any = {}
    Object.keys(c).forEach(k => {
      const val = (c as any)[k]
      const p = (parent ? parent + '_' : '') + k
      const key = '$' + p
      if (typeof val === 'object') {
        res[k] = buildEsStyleObject(val, p)
      } else {
        res[k] = key
        esObjectRecord[key] = val
      }
    })

    return res
  }

  const esProps = buildEsStyleObject(props)

  const mergedStyle = merge(
    parentStyles || {},
    styles ? (styles(esProps) as T & R) : ({} as any)
  )

  const createdStyles = EStyleSheet.create(mergedStyle) as any

  return {
    esProps,
    styles: createdStyles,
    extend: (newProps, newStyles) => {
      const mergedProps = merge(props, newProps as Partial<T>) as T
      return createTheme(
        mergedProps,
        newStyles
          ? newMergedProps => newStyles(newMergedProps) as any
          : undefined,
        mergedStyle
      )
    },
    build: () => {
      EStyleSheet.clearCache()
      EStyleSheet.build(esObjectRecord)
    },
    props
  }
}
