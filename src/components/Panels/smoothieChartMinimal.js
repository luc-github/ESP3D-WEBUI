/*
 * Minimal replacement for smoothie (TimeSeries + SmoothieChart).
 * API compatible with what Charts.js uses: no lazy load, ~3 KB vs ~48 KB.
 */

function extend(dest, src) {
    if (!src) return dest
    for (const k in src) if (Object.prototype.hasOwnProperty.call(src, k)) dest[k] = src[k]
    return dest
}

function pixelSnap(pos, lineWidth) {
    return lineWidth % 2 === 0 ? Math.round(pos) : Math.floor(pos) + 0.5
}

/** TimeSeries: append(timestamp, value), clear(). */
export function TimeSeries() {
    this.data = []
    this.maxValue = NaN
    this.minValue = NaN
}

TimeSeries.prototype.clear = function () {
    this.data = []
    this.maxValue = NaN
    this.minValue = NaN
}

TimeSeries.prototype.append = function (timestamp, value) {
    if (isNaN(timestamp) || isNaN(value)) return
    const d = this.data
    const last = d.length - 1
    if (last >= 0 && timestamp < d[last][0]) {
        let i = last
        while (i >= 0 && d[i][0] > timestamp) i--
        d.splice(i + 1, 0, [timestamp, value])
    } else {
        d.push([timestamp, value])
    }
    this.maxValue = isNaN(this.maxValue) ? value : Math.max(this.maxValue, value)
    this.minValue = isNaN(this.minValue) ? value : Math.min(this.minValue, value)
}

TimeSeries.prototype.dropOldData = function (oldestValidTime, maxLen) {
    const d = this.data
    let remove = 0
    while (d.length - remove >= maxLen && d[remove + 1] && d[remove + 1][0] < oldestValidTime) remove++
    if (remove) d.splice(0, remove)
}

/** Recompute min/max from current data (so scale shrinks after cooling). */
TimeSeries.prototype.resetBounds = function () {
    const d = this.data
    if (d.length === 0) {
        this.minValue = NaN
        this.maxValue = NaN
        return
    }
    let min = d[0][1]
    let max = d[0][1]
    for (let i = 1; i < d.length; i++) {
        const v = d[i][1]
        if (v < min) min = v
        if (v > max) max = v
    }
    this.minValue = min
    this.maxValue = max
}

const DEFAULT_GRID = {
    fillStyle: "#000000",
    strokeStyle: "rgba(128,128,128,0.5)",
    lineWidth: 1,
    millisPerLine: 0,
    verticalSections: 5,
    borderVisible: true,
}

const DEFAULT_LABELS = {
    fillStyle: "#000000",
    disabled: false,
    fontSize: 10,
    fontFamily: "monospace",
    precision: 1,
    showIntermediateLabels: true,
    enableTopYLabel: false,
}

/** SmoothieChart: addTimeSeries(series, { lineWidth, strokeStyle }), streamTo(canvas, delay). */
export function SmoothieChart(options) {
    this.options = extend(
        {
            millisPerPixel: 200,
            maxValueScale: 1.1,
            minValueScale: 1.1,
            enableDpiScaling: false,
            responsive: true,
            interpolation: "linear",
            scaleSmoothing: 0.125,
            maxDataSetLength: 1000,
            grid: extend({}, DEFAULT_GRID),
            labels: extend({}, DEFAULT_LABELS),
        },
        options
    )
    if (options && options.grid) extend(this.options.grid, options.grid)
    if (options && options.labels) extend(this.options.labels, options.labels)
    this.seriesSet = []
    this.currentValueRange = 1
    this.currentVisMinValue = 0
    this.lastRenderTimeMillis = 0
    this.lastChartTimestamp = 0
    this.valueRange = { min: NaN, max: NaN }
    this.frame = null
}

SmoothieChart.prototype.addTimeSeries = function (timeSeries, opts) {
    this.seriesSet.push({
        timeSeries,
        options: extend({ lineWidth: 1, strokeStyle: "#ffffff" }, opts),
    })
}

SmoothieChart.prototype.streamTo = function (canvas, delayMillis) {
    this.canvas = canvas
    this.clientWidth = parseInt(canvas.getAttribute("width"), 10) || canvas.offsetWidth
    this.clientHeight = parseInt(canvas.getAttribute("height"), 10) || canvas.offsetHeight
    this.delay = delayMillis || 0
    this.start()
}

const rAF =
    typeof requestAnimationFrame !== "undefined"
        ? requestAnimationFrame
        : (cb) => setTimeout(() => cb(Date.now()), 16)
const cAF = typeof cancelAnimationFrame !== "undefined" ? cancelAnimationFrame : clearTimeout

SmoothieChart.prototype.start = function () {
    if (this.frame) return
    const self = this
    function tick() {
        self.frame = rAF(function () {
            self.render()
            tick()
        })
    }
    tick()
}

SmoothieChart.prototype.stop = function () {
    if (this.frame) {
        cAF(this.frame)
        this.frame = null
    }
}

SmoothieChart.prototype.resize = function () {
    const canvas = this.canvas
    const opts = this.options
    const dpr = opts.enableDpiScaling && typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    if (opts.responsive) {
        const w = canvas.offsetWidth
        const h = canvas.offsetHeight
        if (w !== this.clientWidth || h !== this.clientHeight) {
            canvas.setAttribute("width", String(Math.floor(w * dpr)))
            canvas.setAttribute("height", String(Math.floor(h * dpr)))
            if (dpr !== 1) canvas.getContext("2d").scale(dpr, dpr)
            this.clientWidth = w
            this.clientHeight = h
        }
    } else {
        this.clientWidth = parseInt(canvas.getAttribute("width"), 10)
        this.clientHeight = parseInt(canvas.getAttribute("height"), 10)
    }
}

SmoothieChart.prototype.updateValueRange = function () {
    const opts = this.options
    let chartMax = NaN
    let chartMin = NaN
    for (let i = 0; i < this.seriesSet.length; i++) {
        const ts = this.seriesSet[i].timeSeries
        if (!isNaN(ts.maxValue)) chartMax = !isNaN(chartMax) ? Math.max(chartMax, ts.maxValue) : ts.maxValue
        if (!isNaN(ts.minValue)) chartMin = !isNaN(chartMin) ? Math.min(chartMin, ts.minValue) : ts.minValue
    }
    chartMax *= opts.maxValueScale
    chartMin -= Math.abs(chartMin * opts.minValueScale - chartMin)
    if (!isNaN(chartMax) && !isNaN(chartMin)) {
        const targetRange = chartMax - chartMin
        this.currentValueRange += opts.scaleSmoothing * (targetRange - this.currentValueRange)
        this.currentVisMinValue += opts.scaleSmoothing * (chartMin - this.currentVisMinValue)
    }
    this.valueRange = { min: this.currentVisMinValue, max: this.currentVisMinValue + this.currentValueRange }
}

SmoothieChart.prototype.render = function () {
    const now = Date.now()
    const opts = this.options
    let time = now - (this.delay || 0)
    time -= time % opts.millisPerPixel
    this.lastRenderTimeMillis = now
    this.lastChartTimestamp = time
    this.resize()
    const canvas = this.canvas
    const ctx = canvas.getContext("2d")
    const w = this.clientWidth
    const h = this.clientHeight
    const oldestValidTime = time - w * opts.millisPerPixel
    const grid = opts.grid
    const labels = opts.labels

    const valueToY = (value) => {
        const range = this.currentValueRange
        const off = value - this.currentVisMinValue
        return range === 0 ? h : pixelSnap(h * (1 - off / range), 1)
    }
    const timeToX = (t) => pixelSnap(w - (time - t) / opts.millisPerPixel, 1)

    for (let i = 0; i < this.seriesSet.length; i++) {
        this.seriesSet[i].timeSeries.dropOldData(oldestValidTime, opts.maxDataSetLength)
        this.seriesSet[i].timeSeries.resetBounds()
    }
    this.updateValueRange()

    ctx.save()
    ctx.font = labels.fontSize + "px " + labels.fontFamily
    ctx.beginPath()
    ctx.rect(0, 0, w, h)
    ctx.clip()
    ctx.fillStyle = grid.fillStyle
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = grid.strokeStyle
    ctx.lineWidth = grid.lineWidth || 1
    for (let v = 1; v < grid.verticalSections; v++) {
        const gy = pixelSnap((v * h) / grid.verticalSections, grid.lineWidth)
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(w, gy)
        ctx.stroke()
    }
    if (grid.borderVisible) {
        ctx.strokeRect(0, 0, w, h)
    }

    for (let d = 0; d < this.seriesSet.length; d++) {
        const { timeSeries, options: seriesOpts } = this.seriesSet[d]
        const data = timeSeries.data
        if (data.length <= 1 || !seriesOpts.strokeStyle) continue
        ctx.save()
        ctx.strokeStyle = seriesOpts.strokeStyle
        ctx.lineWidth = seriesOpts.lineWidth || 1
        ctx.beginPath()
        let x0 = timeToX(data[0][0])
        let y0 = valueToY(data[0][1])
        ctx.moveTo(x0, y0)
        for (let i = 1; i < data.length; i++) {
            const x = timeToX(data[i][0])
            const y = valueToY(data[i][1])
            ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
    }

    const range = this.valueRange
    if (!labels.disabled && !isNaN(range.min) && !isNaN(range.max)) {
        const maxStr = parseFloat(range.max).toFixed(labels.precision)
        const minStr = parseFloat(range.min).toFixed(labels.precision)
        ctx.fillStyle = labels.fillStyle
        ctx.textBaseline = "top"
        ctx.fillText(maxStr, w - ctx.measureText(maxStr).width - 2, 2)
        ctx.textBaseline = "bottom"
        ctx.fillText(minStr, w - ctx.measureText(minStr).width - 2, h - 2)
    }
    ctx.restore()
}
