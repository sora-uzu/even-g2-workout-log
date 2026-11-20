import {
  waitForEvenAppBridge,
  TextContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'

// 筋トレ記録（Day1：背中）。操作：
//   タップ＝回数 +1 ／ 下スクロール＝セット確定 ／ 上スクロール＝やり直し・1つ戻す ／ ダブルタップ＝終了
type Exercise = { name: string; target: number }
const MENU: Exercise[] = [
  { name: 'ラットプルダウン', target: 8 },
  { name: 'ロングプル', target: 8 },
  { name: 'ストレートアーム', target: 10 },
]
const SETS = 3
const KEY = 'workout-log-v1'

const today = new Date().toISOString().slice(0, 10)
type Store = { date: string; sets: Record<string, number[]> }
function load(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Store | null
    if (raw && raw.date === today) return raw
  } catch {
    // 読めない時は、新しく始める
  }
  return { date: today, sets: {} }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // 保存できない時は、画面の記録だけ
  }
}

const store = load()
let exIndex = 0
let reps = 0
let finished = false

function currentSets(): number[] {
  const name = MENU[exIndex].name
  if (!store.sets[name]) store.sets[name] = []
  return store.sets[name]
}

function render(): string {
  if (finished) {
    const lines = MENU.map(e => `${e.name}：${(store.sets[e.name] ?? []).join('・') || '-'}`)
    return `おつかれさま！（${today}）\n${lines.join('\n')}\nダブルタップで終了`
  }
  const ex = MENU[exIndex]
  const sets = currentSets()
  return [
    `Day1 背中（${exIndex + 1}/${MENU.length}）`,
    `${ex.name}　目標${ex.target}回`,
    `セット${sets.length + 1}/${SETS}：${reps}回`,
    `記録：${sets.join('・') || '-'}`,
    'タップ＋1／下＝確定／上＝戻す',
  ].join('\n')
}

const bridge = await waitForEvenAppBridge()

const mainText = new TextContainerProperty({
  xPosition: 0,
  yPosition: 0,
  width: 576,
  height: 288,
  borderWidth: 0,
  borderColor: 5,
  paddingLength: 4,
  containerID: 1,
  containerName: 'main',
  content: render(),
  isEventCapture: 1,
})

const result = await bridge.createStartUpPageContainer(
  new CreateStartUpPageContainer({
    containerTotalNum: 1,
    textObject: [mainText],
  }),
)
console.log('Page created:', result === 0 ? 'success' : `failed (${result})`)

function redraw() {
  bridge.textContainerUpgrade(
    new TextContainerUpgrade({ containerID: 1, containerName: 'main', content: render() }),
  )
}

// イベントの種類を、封筒ごとに読む（テンプレートの注意：タップは eventType が undefined で届く）
function eventTypeOf(envelope?: { eventType?: OsEventTypeList }): OsEventTypeList | null {
  if (!envelope) return null
  return envelope.eventType ?? OsEventTypeList.CLICK_EVENT
}

function confirmSet() {
  if (reps <= 0) return
  const sets = currentSets()
  sets.push(reps)
  reps = 0
  save()
  if (sets.length >= SETS) {
    if (exIndex < MENU.length - 1) {
      exIndex += 1
    } else {
      finished = true
    }
  }
}

function undo() {
  if (finished) {
    finished = false
    return
  }
  if (reps > 0) {
    reps = 0
    return
  }
  const sets = currentSets()
  if (sets.length > 0) {
    reps = sets.pop() ?? 0
    save()
  } else if (exIndex > 0) {
    exIndex -= 1
  }
}

const unsubscribe = bridge.onEvenHubEvent(event => {
  const sysType = eventTypeOf(event.sysEvent)
  const textType = eventTypeOf(event.textEvent)

  if (sysType === OsEventTypeList.DOUBLE_CLICK_EVENT || textType === OsEventTypeList.DOUBLE_CLICK_EVENT) {
    save()
    bridge.shutDownPageContainer(1)
    return
  }

  if (textType === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
    confirmSet()
    redraw()
    return
  }

  if (textType === OsEventTypeList.SCROLL_TOP_EVENT) {
    undo()
    redraw()
    return
  }

  if (sysType === OsEventTypeList.CLICK_EVENT || textType === OsEventTypeList.CLICK_EVENT) {
    if (!finished) reps += 1
    redraw()
    return
  }

  if (sysType === OsEventTypeList.SYSTEM_EXIT_EVENT || sysType === OsEventTypeList.ABNORMAL_EXIT_EVENT) {
    save()
    unsubscribe()
  }
})
