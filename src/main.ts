import { createApp } from "vue"
import App from "./App.vue"
import { createPinia } from "pinia"
import ElementPlus from 'element-plus'
import { i18n } from '@/i18n/index'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(ElementPlus, {size: 'small'})
app.use(i18n)

app.mount("#app")
