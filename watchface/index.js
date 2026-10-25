import "../shared/device-polyfill"

// Neo-brutalist JJK palette (Nobara red, hat-band yellow, uniform navy)
const C = {
  BLACK: 0x000000,
  WHITE: 0xffffff,
  YELLOW: 0xffd60a,
  RED: 0xff3b4e,
  CYAN: 0x00e5ff,
  PINK: 0xff2e93,
  VIOLET: 0x7b2ff7,
  GREEN: 0x39ff14,
  ORANGE: 0xff8a00
}

const SHADOW = 6
const BORDER = 4
const AOD_BORDER = 3

// Normal mode: offset black shadow + black border + flat fill.
// AOD mode: same geometry, but only a white outline on black (few lit pixels).
function block(x, y, w, h, color, aod) {
  const lvl = aod ? hmUI.show_level.ONLY_AOD : hmUI.show_level.ONLY_NORMAL

  if (aod) {
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x, y, w, h, color: C.WHITE, show_level: lvl
    })
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: x + AOD_BORDER,
      y: y + AOD_BORDER,
      w: w - AOD_BORDER * 2,
      h: h - AOD_BORDER * 2,
      color: C.BLACK,
      show_level: lvl
    })
    return
  }

  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: x + SHADOW, y: y + SHADOW, w, h, color: C.BLACK, show_level: lvl
  })
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x, y, w, h, color: C.BLACK, show_level: lvl
  })
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: x + BORDER,
    y: y + BORDER,
    w: w - BORDER * 2,
    h: h - BORDER * 2,
    color,
    show_level: lvl
  })
}

function label(x, y, w, h, size, color, text, aod) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x, y, w, h,
    color,
    text_size: size,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text,
    show_level: aod ? hmUI.show_level.ONLY_AOD : hmUI.show_level.ONLY_NORMAL
  })
}

// Builds the whole layout once per mode. Geometry is identical in both modes,
// so the clock and every block stay put when the watch dims into AOD.
function layout(aod) {
  const lvl = aod ? hmUI.show_level.ONLY_AOD : hmUI.show_level.ONLY_NORMAL

  // Background
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: 0, y: 0, w: 390, h: 450,
    color: aod ? C.BLACK : C.YELLOW,
    show_level: lvl
  })

  // Nobara manga portrait (dimmed in AOD)
  block(16, 16, 178, 178, C.WHITE, aod)
  hmUI.createWidget(hmUI.widget.IMG, {
    x: 20, y: 20,
    src: aod ? "portrait_aod.png" : "portrait.png",
    show_level: lvl
  })

  // Date column
  block(208, 16, 166, 86, C.RED, aod)
  const day = label(212, 20, 158, 44, 40, C.WHITE, "---", aod)
  const date = label(
    212, 62, 158, 36, 26, aod ? C.WHITE : C.YELLOW, "-- ---", aod
  )

  block(208, 108, 166, 86, C.VIOLET, aod)
  const year = label(
    212, 112, 158, 78, 46, C.WHITE, "----", aod
  )

  // Time (same position + size in both modes)
  block(16, 212, 358, 150, C.CYAN, aod)
  const clock = label(
    20, 216, 350, 142, 104, aod ? C.WHITE : C.BLACK, "--:--", aod
  )

  // Battery + steps
  block(16, 378, 170, 50, C.GREEN, aod)
  const batt = label(
    20, 382, 162, 42, 22, aod ? C.WHITE : C.BLACK, "BAT --%", aod
  )

  block(204, 378, 170, 50, C.ORANGE, aod)
  const steps = label(
    208, 382, 162, 42, 22, aod ? C.WHITE : C.BLACK, "STEP -", aod
  )

  return { clock, day, date, year, batt, steps }
}

WatchFace({
  onInit() {
    console.log("Brutalism JJK initialized")
  },

  build() {
    const normal = layout(false)
    const aod = layout(true)

    // Sensors
    const time = hmSensor.createSensor(hmSensor.id.TIME)
    const battery = hmSensor.createSensor(hmSensor.id.BATTERY)
    const step = hmSensor.createSensor(hmSensor.id.STEP)

    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ]

    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

    const pad = (value) => (value < 10 ? "0" + value : "" + value)

    const set = (widget, text) => widget.setProperty(hmUI.prop.MORE, { text })

    const updateTime = () => {
      const clockText = pad(time.hour) + ":" + pad(time.minute)
      const dayText = days[time.week - 1]
      const dateText = pad(time.day) + " " + months[time.month - 1]
      const yearText = "" + time.year

      ;[normal, aod].forEach((ui) => {
        set(ui.clock, clockText)
        set(ui.day, dayText)
        set(ui.date, dateText)
        set(ui.year, yearText)
      })
    }

    const updateStats = () => {
      ;[normal, aod].forEach((ui) => {
        set(ui.batt, "BAT " + battery.current + "%")
        set(ui.steps, "STEP " + step.current)
      })
    }

    updateTime()
    updateStats()
    time.addEventListener(time.event.MINUTEEND, updateTime)
    battery.addEventListener(hmSensor.event.CHANGE, updateStats)
    step.addEventListener(hmSensor.event.CHANGE, updateStats)
  },

  onDestroy() {
    console.log("Brutalism JJK destroyed")
  }
})
