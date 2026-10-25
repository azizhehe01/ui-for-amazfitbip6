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

// Hard-edged block: offset black shadow + black border + flat fill
function block(x, y, w, h, color) {
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: x + SHADOW, y: y + SHADOW, w, h, color: C.BLACK
  })
  hmUI.createWidget(hmUI.widget.FILL_RECT, { x, y, w, h, color: C.BLACK })
  hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: x + BORDER,
    y: y + BORDER,
    w: w - BORDER * 2,
    h: h - BORDER * 2,
    color
  })
}

function label(x, y, w, h, size, color, text, align) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x, y, w, h,
    color,
    text_size: size,
    align_h: align || hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    text
  })
}

WatchFace({
  onInit() {
    console.log("Brutalism JJK initialized")
  },

  build() {
    // Background
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0, y: 0, w: 390, h: 450, color: C.YELLOW
    })

    // Manga panel strip (Nobara)
    block(16, 16, 358, 170, C.WHITE)
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 20, y: 20, src: "manga.png"
    })

    // Time
    block(16, 204, 358, 112, C.WHITE)
    const clock = label(20, 208, 350, 104, 92, C.BLACK, "--:--")

    // Date
    block(16, 332, 226, 40, C.RED)
    const date = label(20, 336, 218, 32, 22, C.WHITE, "---")

    block(256, 332, 118, 40, C.VIOLET)
    const year = label(260, 336, 110, 32, 22, C.WHITE, "----")

    // Battery + steps
    block(16, 388, 170, 40, C.GREEN)
    const batt = label(20, 392, 162, 32, 20, C.BLACK, "BAT --%")

    block(204, 388, 170, 40, C.ORANGE)
    const steps = label(208, 392, 162, 32, 20, C.BLACK, "STEP -")

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

    const updateTime = () => {
      clock.setProperty(hmUI.prop.MORE, {
        text: pad(time.hour) + ":" + pad(time.minute)
      })
      date.setProperty(hmUI.prop.MORE, {
        text: days[time.week - 1] + " " + pad(time.day) + " " +
          months[time.month - 1]
      })
      year.setProperty(hmUI.prop.MORE, { text: "" + time.year })
    }

    const updateStats = () => {
      batt.setProperty(hmUI.prop.MORE, { text: "BAT " + battery.current + "%" })
      steps.setProperty(hmUI.prop.MORE, { text: "STEP " + step.current })
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
