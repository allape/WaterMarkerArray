import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './lang/en.json'
import zhCN from './lang/zhCN.json'
import zhTW from './lang/zhTW.json'

export interface Language {
  name: string
  language: string
  resource: Record<string, any>
}

export const Languages: Record<string, Language> = {
  en: {
    name: 'English',
    language: 'en',
    resource: en,
  },
  zh: {
    name: '中文',
    language: 'zh',
    resource: zhCN,
  },
  'zh-CN': {
    name: '简体中文',
    language: 'zh-CN',
    resource: zhCN,
  },
  'zh-TW': {
    name: '繁體中文(台灣)',
    language: 'zh-TW',
    resource: zhTW,
  },
  'zh-HK': {
    name: '繁體中文(香港)',
    language: 'zh-HK',
    resource: zhTW,
  },
}

export const BrowserLanguage = window.navigator?.language
export const CurrentLanguage: string = BrowserLanguage && Object.keys(Languages).includes(BrowserLanguage) ?
  BrowserLanguage : Languages.en.language

export const LANGUAGES: Language[] = Object.values(Languages)

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: Languages.en.language,
    // lng: window.navigator?.language,
    interpolation: {
      escapeValue: false,
    },
    resources: Object.values(Languages).reduce((p, c) => ({
      ...p,
      [c.language]: {
        translation: c.resource,
      },
    }), {}),
  })
  .then(async () => {
    await i18n.changeLanguage(CurrentLanguage)
    console.log('i18n:', i18n)
  })

export default i18n
