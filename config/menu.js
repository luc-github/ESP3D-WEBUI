/*
 * Interactive launcher: npm run menu
 *
 *   1 Build all   -> builds every target, no other question
 *   2 Build one   -> asks system, then target
 *   3 Dev         -> asks system, target, then the test server options
 *
 * The last choice is remembered (config/.menu-last.json, not tracked by
 * git) and offered again at start: [Enter] relaunches it. In every question
 * the last answer is the default, "b" goes back to the previous question,
 * "q" quits. The menu only builds and runs the usual commands: the npm
 * scripts and `node config/dev.js ...` options keep working without it
 * (see config/README.md).
 *
 * The engine below is generic; only MENU changes from one project to
 * another (the embedded page has its own copy in embedded/config/menu.js).
 */
const readline = require("readline")
const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")

//---------------------------------------------------------------------------
// Project configuration
//---------------------------------------------------------------------------
const MENU = {
    title: "ESP3D-WebUI",
    cwd: path.join(__dirname, ".."),
    //system -> targets; each target gives its build script and dev args
    systems: {
        CNC: {
            GRBL: { build: "cnc-grbl", dev: "CNC GRBL" },
            grblHAL: { build: "cnc-grblhal", dev: "CNC grblHAL" },
        },
        Printer3D: {
            Marlin: { build: "printer-marlin", dev: "Printer3D Marlin" },
            "Marlin-embedded": {
                build: "printer-marlin-embedded",
                dev: "Printer3D Marlin-embedded",
            },
            Repetier: { build: "printer-repetier", dev: "Printer3D Repetier" },
            Smoothieware: {
                build: "printer-smoothieware",
                dev: "Printer3D Smoothieware",
            },
        },
        SandTable: {
            GRBL: { build: "sand-grbl", dev: "SandTable GRBL" },
        },
    },
    buildAll: () => "npm run buildall",
    buildOne: (t) => `npm run ${t.build}`,
    dev: (t, args) => ["node config/dev.js", t.dev, ...args].join(" "),
    //dev options, asked in this order: yes/no (arg added when the answer
    //differs from the default meaning) or text (arg=<value> when not empty)
    devOptions: [
        {
            id: "flash",
            label: "Flash FS",
            type: "yesno",
            def: true,
            argWhenNo: "noflash",
        },
        {
            id: "sd",
            label: "SD card",
            type: "yesno",
            def: true,
            argWhenNo: "nosd",
        },
        {
            id: "secure",
            label: "Secure (HTTPS, needs Caddy)",
            type: "yesno",
            def: false,
            argWhenYes: "secure",
        },
        {
            id: "auth",
            label: "Authentication (admin/admin)",
            type: "yesno",
            def: false,
            argWhenYes: "auth",
        },
        {
            id: "root",
            label: "HostPath (root=, empty = target default)",
            type: "text",
            def: "",
            arg: "root",
        },
    ],
}

//---------------------------------------------------------------------------
// Engine
//---------------------------------------------------------------------------
const lastFile = path.join(__dirname, ".menu-last.json")
const BACK = Symbol("back")

function loadLast() {
    try {
        return JSON.parse(fs.readFileSync(lastFile, "utf8"))
    } catch (e) {
        return null
    }
}

function saveLast(state) {
    try {
        fs.writeFileSync(lastFile, JSON.stringify(state, null, 2))
    } catch (e) {
        console.log("(could not save the last choice: " + e.message + ")")
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
const ask = (q) =>
    new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())))

function quit() {
    rl.close()
    process.exit(0)
}

//numbered choice; returns the chosen value, BACK, or null to re-ask
async function choose(title, items, def, canGoBack) {
    console.log("\n" + title)
    items.forEach((it, i) =>
        console.log(`  ${i + 1} ${it}${it === def ? "  (last)" : ""}`)
    )
    const hint = [
        def ? "Enter = last" : null,
        canGoBack ? "b = back" : null,
        "q = quit",
    ]
        .filter(Boolean)
        .join(", ")
    const a = (await ask(`Choice (${hint}): `)).toLowerCase()
    if (a === "q") quit()
    if (a === "b" && canGoBack) return BACK
    if (a === "" && def && items.includes(def)) return def
    const n = parseInt(a, 10)
    if (n >= 1 && n <= items.length) return items[n - 1]
    console.log("Invalid choice")
    return null
}

async function askOption(opt, def, canGoBack) {
    const back = canGoBack ? ", b = back" : ""
    if (opt.type === "yesno") {
        const d = def === undefined ? opt.def : def
        const a = (
            await ask(`${opt.label} (y/n) [${d ? "y" : "n"}${back}]: `)
        ).toLowerCase()
        if (a === "q") quit()
        if (a === "b" && canGoBack) return BACK
        if (a === "") return d
        if (a === "y" || a === "yes" || a === "o" || a === "oui") return true
        if (a === "n" || a === "no" || a === "non") return false
        console.log("Answer y or n")
        return null
    }
    const d = def === undefined ? opt.def : def
    const a = await ask(`${opt.label} [${d || "-"}${back}, "-" = empty]: `)
    if (a.toLowerCase() === "q") quit()
    if (a.toLowerCase() === "b" && canGoBack) return BACK
    if (a === "") return d
    if (a === "-") return ""
    return a
}

function devArgs(options) {
    const args = []
    MENU.devOptions.forEach((opt) => {
        const v = options[opt.id] === undefined ? opt.def : options[opt.id]
        if (opt.type === "yesno") {
            if (v && opt.argWhenYes) args.push(opt.argWhenYes)
            if (!v && opt.argWhenNo) args.push(opt.argWhenNo)
        } else if (v) args.push(`${opt.arg}=${v}`)
    })
    return args
}

function commandFor(state) {
    if (state.action === "Build all") return MENU.buildAll()
    const t = MENU.systems[state.system][state.target]
    if (state.action === "Build one") return MENU.buildOne(t)
    return MENU.dev(t, devArgs(state.options || {}))
}

//the questions, as a list of steps so that "b" can go back one step;
//a step with a single possible answer is answered automatically and
//skipped when going back
function buildSteps(state) {
    const steps = [
        {
            run: (back) =>
                choose(
                    "Action",
                    ["Build all", "Build one", "Dev"],
                    state.action,
                    back
                ),
            set: (v) => (state.action = v),
        },
        {
            when: () => state.action !== "Build all",
            items: () => Object.keys(MENU.systems),
            run: (back, items) => choose("System", items, state.system, back),
            set: (v) => {
                if (v !== state.system) state.target = undefined
                state.system = v
            },
        },
        {
            when: () => state.action !== "Build all",
            items: () => Object.keys(MENU.systems[state.system]),
            run: (back, items) =>
                choose(`Target (${state.system})`, items, state.target, back),
            set: (v) => (state.target = v),
        },
    ]
    MENU.devOptions.forEach((opt) =>
        steps.push({
            when: () => state.action === "Dev",
            run: (back) => askOption(opt, (state.options || {})[opt.id], back),
            set: (v) =>
                (state.options = { ...(state.options || {}), [opt.id]: v }),
        })
    )
    return steps
}

async function runMenu(state) {
    const steps = buildSteps(state)
    const auto = new Set()
    let i = 0
    while (i < steps.length) {
        const step = steps[i]
        if (step.when && !step.when()) {
            i++
            continue
        }
        const items = step.items ? step.items() : null
        if (items && items.length === 1) {
            //single possible answer: no question
            step.set(items[0])
            auto.add(i)
            i++
            continue
        }
        auto.delete(i)
        const v = await step.run(i > 0, items)
        if (v === null) continue
        if (v === BACK) {
            //previous asked step (skip the hidden and automatic ones)
            do i--
            while (
                i > 0 &&
                ((steps[i].when && !steps[i].when()) || auto.has(i))
            )
            continue
        }
        step.set(v)
        i++
    }
    return state
}

function launch(state) {
    const cmd = commandFor(state)
    saveLast({ ...state, command: cmd })
    rl.close()
    console.log(`\n> ${cmd}\n`)
    const child = spawn(cmd, { stdio: "inherit", shell: true, cwd: MENU.cwd })
    child.on("exit", (code) => process.exit(code ?? 0))
}

async function main() {
    if (!process.stdin.isTTY) {
        console.log(
            "npm run menu needs an interactive terminal (see config/README.md for the direct commands)"
        )
        process.exit(1)
    }
    console.log(`${MENU.title} - interactive launcher`)
    const last = loadLast()
    let state = last ? { ...last } : {}
    delete state.command
    if (last && last.command) {
        console.log(`\nLast: ${last.command}`)
        const a = (
            await ask("[Enter] relaunch, m = menu, q = quit: ")
        ).toLowerCase()
        if (a === "q") quit()
        if (a === "") {
            try {
                return launch(state)
            } catch (e) {
                console.log("Last choice no longer valid, opening the menu")
            }
        }
    }
    for (;;) {
        await runMenu(state)
        console.log(`\n> ${commandFor(state)}`)
        const a = (
            await ask("[Enter] launch, b = change, q = quit: ")
        ).toLowerCase()
        if (a === "q") quit()
        if (a === "") return launch(state)
    }
}

main()
