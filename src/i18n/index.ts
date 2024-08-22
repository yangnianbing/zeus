import { createI18n } from 'vue-i18n'

const languageFiles = import.meta.glob('@/i18n/locales/**.ts', {
  eager: true,
  import: 'default'
}) as Record<string, unknown>

export const languages = Object.keys(languageFiles).reduce(
  (modules, modulePath) => {
    const moduleName = modulePath.replace(/^.+\/([^/]+)\.[^.]+$/, '$1')
    const value = languageFiles[modulePath]
    modules[moduleName] = value
    return modules
  },
  {} as Record<string, unknown>
)

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: languages as any
})

export const t = (i18n.global as any).t
