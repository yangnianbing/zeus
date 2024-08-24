<template>
	<div class="resize-box">
		<div :class="['sash-container', sashDirection]">
			<div
				v-for="(item, index) in sashPosition"
				:key="index"
				:class="{
					'sash-control': true
				}"
				:style="`top:${sashPosition[index]?.top}px;left:${sashPosition[index]?.left}px`"
				@mousedown="(e) => onMoveStart(index, e)"></div>
		</div>
		<div
			:class="['box-content', direction]"
			ref="viewContainer">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'

const props = defineProps<{
  direction: string
  sashStyle?: object
}>()

// 容器内容水平排列，分割线方向为垂直。容器垂直排列，分割线方向为水平
const sashDirection = computed(() => {
  return props.direction === 'horizon' ? 'vertical' : 'horizon'
})

// 根据布局方式，获取元素的宽高属性
const propKey = computed(() => {
  return props.direction === 'horizon' ? 'width' : 'height'
})

const minPropKey = computed(() => {
  return props.direction === 'horizon' ? 'minWidth' : 'minHeight'
})

const viewContainer = ref()
const containerHeigth = ref(0)
const containerWidth = ref(0)
const containerInited = ref(false)
const totalWidth = computed(() => {
  console.log(props.direction, containerHeigth.value, containerWidth.value)
  return props.direction === 'horizon' ? containerWidth.value : containerHeigth.value
})

// 监听容器变化，重新计算布局
const resizeObserver = new ResizeObserver((entries) => {
  const ele = entries[0].contentRect
  containerHeigth.value = ele.height
  containerWidth.value = ele.width
  containerInited.value = true
})

onMounted(() => {
  resizeObserver.observe(viewContainer.value!)
})

type ResizeItem = {
  el: HTMLElement
  props: SizeInfo
}
const resizeItemList = ref<Array<ResizeItem>>([])
provide('resizeItemList', resizeItemList)
provide('propKey', propKey)

function computedPercent(value: number | string, total: number): number {
  let result = value
  if (typeof result === 'string' && result.trim().endsWith('%')) {
    result = (parseFloat(result) / 100) * total
  }
  return result as number
}

const unSizeDefaultWidth = 100
// 归一化size属性，百分比转成具体的px值，总长度超大小的按照比例进行缩放，
watch(
  [resizeItemList, totalWidth],
  () => {
    // 避免容器还没有初始化，就根据总高度进行计算
    if (!containerInited.value) {
      return
    }
    let unSizeChild = [] as Array<ResizeItem>
    let sizeChild = [] as Array<ResizeItem>
    let fixedChild = [] as Array<ResizeItem>

    let sizeElementWidth = 0
    let fixedElementWidth = 0
    // 没有指定size的元素且有剩余的控件，平摊剩余的空间
    let unsizeElementWidth = 0
    // 格式化长度值，百分比格式化成具体的数值
    resizeItemList.value.forEach((item) => {
      let propValue = item.props[propKey.value]
      if (item.props.fixed && (propValue || propValue === 0)) {
        item.props[propKey.value] = computedPercent(propValue, totalWidth.value)
        fixedElementWidth += Number(item.props[propKey.value])
        fixedChild.push(item as ResizeItem)
      } else if (propValue || propValue === 0) {
        item.props[propKey.value] = computedPercent(propValue, totalWidth.value)
        sizeElementWidth += Number(item.props[propKey.value])
        sizeChild.push(item as ResizeItem)
      } else {
        unSizeChild.push(item as ResizeItem)
      }
      let minPropValue = item.props[minPropKey.value]
      if (minPropValue || minPropValue === 0) {
        item.props[minPropKey.value] = computedPercent(minPropValue, totalWidth.value)
      }
    })

    if (unSizeChild.length > 0) {
      let unSizeAverageWidth =
        totalWidth.value - sizeElementWidth - fixedElementWidth > 0
          ? (totalWidth.value - sizeElementWidth) / unSizeChild.length
          : unSizeDefaultWidth
      unsizeElementWidth += unSizeAverageWidth * unSizeChild.length
      unSizeChild.forEach((item) => {
        item.props[propKey.value] = unSizeAverageWidth
      })
    }

    // 如果总长度不足或者超长，所有元素等比例去缩放
    let scale = (unsizeElementWidth + sizeElementWidth) / (totalWidth.value - fixedElementWidth)
      ;[...unSizeChild, ...sizeChild].forEach((item) => {
        item.props[propKey.value] = Number(item.props[propKey.value]) / scale
        item.el.style[propKey.value] = item.props[propKey.value] + 'px'
      })

    fixedChild.forEach((item) => {
      item.el.style[propKey.value] = item.props[propKey.value] + 'px'
    })
  },
  {
    immediate: true,
    deep: true
  }
)

const positionKey = props.direction === 'horizon' ? 'left' : 'top'
const sashPosition = computed(() => {
  let result = [] as Array<{ top?: number; left?: number }>

  for (let i = 0; i < resizeItemList.value.length - 1; i++) {
    result[i] = {
      [positionKey]:
        (result[i - 1]?.[positionKey] || 0) +
        (Number(resizeItemList.value[i]?.props?.[propKey.value]) || 0)
    }
  }
  return result
})

const record = {
  startPageX: 0,
  startPageY: 0,
  elementStartTop: 0,
  elementStartLeft: 0,
  moving: false,
  index: -1
}

function on<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Window,
  event: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options: boolean | EventListenerOptions = false
) {
  element.addEventListener(event, handler as EventListenerOrEventListenerObject, options)
}

function off<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Window,
  event: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options: boolean | EventListenerOptions = false
) {
  element.removeEventListener(event, handler as EventListenerOrEventListenerObject, options)
}

function onMoveStart(index: number, e: MouseEvent) {
  record.moving = true
  record.index = index
  record.startPageX = e.pageX
  record.startPageY = e.pageY
  record.elementStartTop = sashPosition.value[index].top || 0
  record.elementStartLeft = sashPosition.value[index].left || 0

  on(window, 'mousemove', onMoving)
  on(window, 'mouseup', onMoveEnd)
}

function onMoving(e: MouseEvent) {
  if (!record.moving) {
    return
  }

  const { startPageX, startPageY, elementStartTop, elementStartLeft } = record

  const offsetX = e.pageX - startPageX
  // 往下移动的距离
  const offsetY = e.pageY - startPageY

  if (props.direction === 'horizon') {
    updateSize(record.index, elementStartLeft + offsetX)
  } else {
    updateSize(record.index, elementStartTop + offsetY)
  }
}

function onMoveEnd() {
  record.moving = false
  record.index = -1
  off(window, 'mousemove', onMoving)
  off(window, 'mouseup', onMoveEnd)
}

function updateSize(index: number, offset: number) {
  const prevElementTotalWidth = resizeItemList.value
    .slice(0, index)
    .reduce((a, b) => a + Number(b.props[propKey.value] || 0), 0)
  const afterElementTotalWidth = resizeItemList.value
    .slice(0, index + 2)
    .reduce((a, b) => a + Number(b.props[propKey.value] || 0), 0)

  let currentWithInfo = resizeItemList.value[index].props
  let currentMinWidth = currentWithInfo[minPropKey.value]
  let currentWidth = offset - prevElementTotalWidth
  let nextWithInfo = resizeItemList.value[index + 1].props
  let nextMinWidth = nextWithInfo[minPropKey.value]
  let nextWidth = afterElementTotalWidth - offset

  if (
    (!currentMinWidth || Number(currentMinWidth) <= Number(currentWidth)) &&
    (!nextMinWidth || Number(nextMinWidth) <= Number(nextWidth))
  ) {
    resizeItemList.value[index].props[propKey.value] = currentWidth
    resizeItemList.value[index + 1].props[propKey.value] = nextWidth
  }
}
</script>

<style lang="scss" scoped>
.resize-box {
  position: relative;
  width: 100%;
  height: 100%;

  .sash-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 99;
    pointer-events: none;

    .sash-control {
      position: absolute;
      pointer-events: auto;

      &.disabled {
        pointer-events: none;
      }
    }

    &.vertical {
      .sash-control {
        cursor: col-resize;
        height: 100%;
        width: 4px;
        background: #aaa;
        transform: translateX(-50%);
        opacity: 0;

        &:hover {
          opacity: 1;
        }
      }
    }

    &.horizon {
      .sash-control {
        cursor: row-resize;
        width: 100%;
        height: 4px;
        background: #aaa;
        opacity: 0;
        transform: translateY(-50%);

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .box-content {
    display: flex;
    height: 100%;
    width: 100%;

    &.vertical {
      flex-direction: column;
    }

    &.horizon {
      flex-direction: row;
    }
  }
}
</style>
