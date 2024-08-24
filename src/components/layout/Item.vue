<template>
	<div
		ref="resizeItem"
		class="resize-item"
		:style="transitionStyle">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { inject, ref, watch, Ref, onBeforeUnmount, reactive, provide, computed } from 'vue'

const resizeItemList = inject<
  Ref<
    {
      el: HTMLElement
      props: SizeInfo
    }[]
  >
>('resizeItemList')!
const propKey = inject<Ref<'width' | 'height'>>('propKey')
const resizeItem = ref<HTMLElement>()
const props = defineProps<{
  height?: number | string
  minHeight?: number | string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean
}>()

const sizeInfo = reactive({
  height: props.height,
  minHeight: props.minHeight,
  width: props.width,
  minWidth: props.minWidth,
  fixed: props.fixed
})

provide('sizeInfo', sizeInfo)

const curDuration = ref(0)
const hasTransition = ref(false)
const transitionStyle = computed(() => {
  return hasTransition.value ? `transition: ${propKey?.value} ${curDuration.value}ms ease 0s;` : ''
})
// 使用toggleSize进行size切换的，添加transition动画。setTimeout中去掉动画是因为拖动改变大小的时候如果有动画，拖动响应太慢
provide('toggleSize', function (size: number, duration = 220) {
  hasTransition.value = true
  curDuration.value = duration
  sizeInfo[propKey!.value] = size
  setTimeout(() => {
    hasTransition.value = false
  }, duration)
})

watch(resizeItem, (newVal) => {
  newVal &&
    resizeItemList.value.push({
      el: newVal,
      props: sizeInfo
    })
})

onBeforeUnmount(() => {
  const index = resizeItemList.value.findIndex((item) => item.el === resizeItem.value)
  if (index !== -1) {
    resizeItemList.value.splice(index, 1)
  }
})
</script>

<style lang="scss" scoped></style>
