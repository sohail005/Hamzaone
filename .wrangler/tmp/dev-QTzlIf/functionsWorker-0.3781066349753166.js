var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-RDbccO/functionsWorker-0.3781066349753166.mjs
import { Writable } from "node:stream";
import { EventEmitter } from "node:events";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
__name2(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
__name2(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");
__name2(notImplementedClass, "notImplementedClass");
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  static {
    __name2(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark2");
  }
  static {
    __name2(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  static {
    __name2(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  static {
    __name2(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  static {
    __name2(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  static {
    __name2(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  static {
    __name2(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var noop_default = Object.assign(() => {
}, { __unenv__: true });
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;
globalThis.console = console_default;
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint"), "bigint") });
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  static {
    __name2(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  static {
    __name2(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};
var NODE_VERSION = "22.14.0";
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "_Process");
  }
  static {
    __name2(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;
globalThis.process = process_default;
var COLORS = {
  Terracotta: { name: "Terracotta", hex: "#C2693C" },
  Charcoal: { name: "Charcoal", hex: "#3B3D42" },
  Sand: { name: "Sand", hex: "#D9C8A9" },
  Sage: { name: "Sage", hex: "#8A9A7E" }
};
var allColors = [COLORS.Terracotta, COLORS.Charcoal, COLORS.Sand, COLORS.Sage];
var products = [
  { slug: "spiral-decor-vase", name: "Spiral Decor Vase", category: "home-decor", price: 699, largePrice: 999, availability: "available", material: "PLA", colors: allColors, unavailableCombo: { color: "Sage", size: "Large" }, description: "A ribbed spiral vase with a smooth matte finish, printed in-house layer by layer.", shape: "vase", isNew: true },
  { slug: "ribbed-bud-vase", name: "Ribbed Bud Vase", category: "home-decor", price: 549, availability: "available", material: "PLA", colors: allColors, description: "A slim bud vase with fine vertical ribbing, perfect for single stems.", shape: "vase" },
  { slug: "geometric-planter", name: "Geometric Planter", category: "home-decor", price: 449, availability: "available", material: "PETG", colors: allColors, description: "A faceted low-poly planter with a drainage-ready base.", shape: "planter" },
  { slug: "hex-wall-planter", name: "Hex Wall Planter", category: "home-decor", price: 599, availability: "made-to-order", material: "PLA", colors: allColors, description: "A hexagonal wall-mounted planter, printed to order.", shape: "planter" },
  { slug: "lattice-lamp-shade", name: "Lattice Lamp Shade", category: "home-decor", price: 1299, availability: "made-to-order", material: "PETG", colors: allColors, description: "An intricate lattice shade that casts soft dappled light.", shape: "lamp" },
  { slug: "wave-coaster-set", name: "Wave Coaster Set", category: "home-decor", price: 349, availability: "available", material: "PLA", colors: allColors, description: "A set of four wave-textured coasters.", shape: "coaster" },
  { slug: "minimal-phone-stand", name: "Minimal Phone Stand", category: "desk", price: 249, availability: "available", material: "PLA", colors: allColors, description: "A minimal angled stand for phones and small tablets.", shape: "stand", isNew: true },
  { slug: "headphone-stand", name: "Headphone Stand", category: "desk", price: 799, availability: "available", material: "PETG", colors: allColors, description: "A sturdy headphone stand with a weighted base.", shape: "stand" },
  { slug: "cable-organizer", name: "Cable Organizer", category: "desk", price: 149, availability: "available", material: "TPU", colors: allColors, description: "A flexible clip-on cable organizer for your desk edge.", shape: "organizer" },
  { slug: "desk-organizer-tray", name: "Desk Organizer Tray", category: "desk", price: 599, availability: "available", material: "PLA", colors: allColors, description: "A compartmentalised tray for pens, clips and small tools.", shape: "organizer" },
  { slug: "hex-pen-cup", name: "Hex Pen Cup", category: "desk", price: 299, availability: "out-of-stock", material: "PLA", colors: allColors, description: "A hexagonal pen cup with a honeycomb wall pattern.", shape: "cup" },
  { slug: "laptop-riser", name: "Laptop Riser", category: "desk", price: 1199, availability: "made-to-order", material: "PETG", colors: allColors, description: "An ergonomic laptop riser that keeps airflow clear underneath.", shape: "riser" },
  { slug: "custom-name-plate", name: "Custom Name Plate", category: "personalised", price: 399, availability: "available", material: "PLA", colors: allColors, description: "A personalised name plate for desks or doors.", shape: "plate" },
  { slug: "personalized-keychain", name: "Personalized Keychain", category: "personalised", price: 149, availability: "available", material: "PETG", colors: allColors, description: "A compact keychain engraved with your text.", shape: "keychain" },
  { slug: "initial-bookmark", name: "Initial Bookmark", category: "personalised", price: 199, availability: "available", material: "PLA", colors: allColors, description: "A slim bookmark featuring a single engraved initial.", shape: "bookmark" },
  { slug: "pet-name-tag", name: "Pet Name Tag", category: "personalised", price: 249, availability: "available", material: "PETG", colors: allColors, description: "A durable name tag for collars, engraved with pet name and contact.", shape: "tag", isNew: true },
  { slug: "articulated-dragon", name: "Articulated Dragon", category: "figurines", price: 499, availability: "available", material: "PLA", colors: allColors, description: "A fully articulated dragon figure that flexes at every joint.", shape: "dragon" },
  { slug: "low-poly-elephant", name: "Low-poly Elephant", category: "figurines", price: 449, availability: "available", material: "PLA", colors: allColors, description: "A faceted low-poly elephant display figure.", shape: "elephant" },
  { slug: "mini-ganesha", name: "Mini Ganesha", category: "figurines", price: 599, availability: "available", material: "PLA", colors: allColors, description: "A compact Ganesha idol with a smooth matte finish.", shape: "ganesha" },
  { slug: "flexi-octopus", name: "Flexi Octopus", category: "figurines", price: 299, availability: "out-of-stock", material: "TPU", colors: allColors, description: "A flexible fidget octopus with articulated tentacles.", shape: "octopus" },
  { slug: "wall-hook-pack", name: "Wall Hook Pack", category: "functional", price: 199, availability: "available", material: "PETG", colors: allColors, description: "A pack of four minimal wall hooks.", shape: "hook" },
  { slug: "spice-jar-lids", name: "Spice Jar Lids (Set of 4)", category: "functional", price: 349, availability: "available", material: "PETG", colors: allColors, description: "Replacement pour-spout lids for standard spice jars.", shape: "lid" },
  { slug: "gear-fidget", name: "Gear Fidget", category: "functional", price: 249, availability: "available", material: "PETG", colors: allColors, description: "An interlocking gear fidget toy that spins smoothly.", shape: "gear" },
  { slug: "drawer-pull-set", name: "Drawer Pull Set", category: "functional", price: 399, availability: "low-stock", material: "PLA", colors: allColors, description: "A set of six minimal drawer pulls.", shape: "pull" }
];
function getProduct(slug) {
  return products.find((p) => p.slug === slug);
}
__name(getProduct, "getProduct");
__name2(getProduct, "getProduct");
function getRazorpayCredentials(env2) {
  const keyId = typeof env2.RAZORPAY_KEY_ID === "string" ? env2.RAZORPAY_KEY_ID.trim() : "";
  const keySecret = typeof env2.RAZORPAY_KEY_SECRET === "string" ? env2.RAZORPAY_KEY_SECRET.trim() : "";
  if (!keyId || !keySecret) {
    return { ok: false, error: "Razorpay test credentials are not configured." };
  }
  if (!keyId.startsWith("rzp_test_")) {
    return { ok: false, error: "Only Razorpay test-mode keys are accepted." };
  }
  return {
    ok: true,
    keyId,
    keySecret,
    authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`
  };
}
__name(getRazorpayCredentials, "getRazorpayCredentials");
__name2(getRazorpayCredentials, "getRazorpayCredentials");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
__name2(isRecord, "isRecord");
function jsonError(error3, status) {
  return Response.json({ error: error3 }, { status });
}
__name(jsonError, "jsonError");
__name2(jsonError, "jsonError");
async function readJson(response) {
  const value = await response.json().catch(() => null);
  return isRecord(value) ? value : null;
}
__name(readJson, "readJson");
__name2(readJson, "readJson");
function parseCheckoutLines(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) return null;
  const lines = [];
  for (const rawLine of value) {
    if (!isRecord(rawLine)) return null;
    const { productSlug, qty, color, size, engraving } = rawLine;
    if (typeof productSlug !== "string" || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 100 || typeof color !== "string" || typeof size !== "string" || engraving !== void 0 && typeof engraving !== "string") {
      return null;
    }
    lines.push({ productSlug, qty, color, size, engraving });
  }
  return lines;
}
__name(parseCheckoutLines, "parseCheckoutLines");
__name2(parseCheckoutLines, "parseCheckoutLines");
var onRequestPost = /* @__PURE__ */ __name2(async (context2) => {
  const credentials = getRazorpayCredentials(context2.env);
  if (!credentials.ok) return jsonError(credentials.error, 503);
  let body;
  try {
    body = await context2.request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  if (!isRecord(body)) return jsonError("Invalid checkout details.", 400);
  const lines = parseCheckoutLines(body.items);
  if (!lines || body.shippingMethod !== "standard" && body.shippingMethod !== "express") {
    return jsonError("Invalid checkout items or shipping method.", 400);
  }
  let subtotal = 0;
  const itemSummary = [];
  for (const line of lines) {
    const product = getProduct(line.productSlug);
    if (!product || product.availability === "out-of-stock") {
      return jsonError("One or more products are unavailable.", 400);
    }
    if (!product.colors.some((option) => option.name === line.color)) {
      return jsonError("A selected product color is unavailable.", 400);
    }
    if (product.largePrice) {
      if (line.size !== "Small" && line.size !== "Large") {
        return jsonError("A selected product size is invalid.", 400);
      }
    } else if (line.size !== "Small" && line.size !== "Standard") {
      return jsonError("A selected product size is invalid.", 400);
    }
    if (product.unavailableCombo?.color === line.color && product.unavailableCombo.size === line.size) {
      return jsonError("A selected product variant is unavailable.", 400);
    }
    if (line.engraving !== void 0 && !/^[a-zA-Z0-9 &.-]{1,12}$/.test(line.engraving)) {
      return jsonError("Engraving must be 1\u201312 supported characters.", 400);
    }
    const unitPrice = line.size === "Large" && product.largePrice ? product.largePrice : product.price;
    subtotal += (unitPrice + (line.engraving ? 99 : 0)) * line.qty;
    itemSummary.push(`${product.name} x${line.qty}`);
  }
  const shipping = body.shippingMethod === "express" ? 149 : subtotal >= 1499 ? 0 : 79;
  const totalPaise = (subtotal + shipping) * 100;
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100 || totalPaise > 5e7) {
    return jsonError("The checkout total is outside the supported range.", 400);
  }
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: credentials.authorization,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: `h1_${crypto.randomUUID().replace(/-/g, "")}`,
        notes: {
          items: itemSummary.join(", ").slice(0, 240),
          shipping: body.shippingMethod
        }
      })
    });
    const result = await readJson(response);
    if (response.status === 401 || response.status === 403) {
      console.error("Razorpay rejected the configured credentials.", response.status);
      return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
    }
    if (!response.ok || typeof result?.id !== "string") {
      console.error("Razorpay order creation failed.", response.status);
      return jsonError("Razorpay could not create the payment order.", 502);
    }
    return Response.json({
      keyId: credentials.keyId,
      orderId: result.id,
      amount: totalPaise,
      currency: "INR"
    });
  } catch (error3) {
    console.error("Razorpay order request failed.", error3);
    return jsonError("Could not reach Razorpay. Please try again.", 502);
  }
}, "onRequestPost");
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}
__name(hexToBytes, "hexToBytes");
__name2(hexToBytes, "hexToBytes");
async function verifySignature(secret, orderId, paymentId, signature) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(signature),
    new TextEncoder().encode(`${orderId}|${paymentId}`)
  );
}
__name(verifySignature, "verifySignature");
__name2(verifySignature, "verifySignature");
var onRequestPost2 = /* @__PURE__ */ __name2(async (context2) => {
  const credentials = getRazorpayCredentials(context2.env);
  if (!credentials.ok) return jsonError(credentials.error, 503);
  let body;
  try {
    body = await context2.request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  if (!isRecord(body)) return jsonError("Invalid payment details.", 400);
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (typeof orderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(orderId) || typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || typeof signature !== "string" || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    return jsonError("Invalid payment verification details.", 400);
  }
  try {
    if (!await verifySignature(credentials.keySecret, orderId, paymentId, signature)) {
      return jsonError("Razorpay payment signature is invalid.", 400);
    }
    const headers = { Authorization: credentials.authorization };
    const [paymentResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers }),
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers })
    ]);
    const [payment, order] = await Promise.all([
      readJson(paymentResponse),
      readJson(orderResponse)
    ]);
    if (paymentResponse.status === 401 || paymentResponse.status === 403 || orderResponse.status === 401 || orderResponse.status === 403) {
      console.error("Razorpay rejected the configured credentials.", paymentResponse.status, orderResponse.status);
      return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
    }
    if (!paymentResponse.ok || !orderResponse.ok || !payment || !order || payment.order_id !== orderId || order.id !== orderId || payment.currency !== "INR" || order.currency !== "INR" || payment.amount !== order.amount) {
      console.error("Razorpay payment details did not match the order.", paymentResponse.status, orderResponse.status);
      return jsonError("Razorpay could not confirm this payment.", 502);
    }
    if (payment.status === "authorized") {
      const captureResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ amount: payment.amount, currency: "INR" })
        }
      );
      const capturedPayment = await readJson(captureResponse);
      if (captureResponse.status === 401 || captureResponse.status === 403) {
        console.error("Razorpay rejected the configured credentials during capture.", captureResponse.status);
        return jsonError("Razorpay credentials were rejected. Check the server configuration.", 401);
      }
      if (capturedPayment?.status === "captured") {
        return Response.json({ status: "success" });
      }
      if (capturedPayment?.status !== "authorized") {
        console.error("Razorpay payment capture did not complete.", captureResponse.status);
        return jsonError("Razorpay could not capture this payment. Contact the store before retrying.", 502);
      }
      return Response.json({ status: "pending" }, { status: 202 });
    }
    if (payment.status === "captured") {
      return Response.json({ status: "success" });
    }
    return jsonError("Razorpay has not captured this payment.", 402);
  } catch (error3) {
    console.error("Razorpay payment verification failed.", error3);
    return jsonError("Could not verify the Razorpay payment. Please contact the store.", 502);
  }
}, "onRequestPost");
var demoOrder = {
  id: "HO-2026-10482",
  customer: "Riya Sharma",
  address: {
    line1: "4th Cross, Sector 2",
    line2: "HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560102"
  },
  items: [
    { productSlug: "spiral-decor-vase", name: "Spiral Decor Vase", color: "Terracotta", size: "Small", qty: 1, price: 699 },
    { productSlug: "minimal-phone-stand", name: "Minimal Phone Stand", color: "Charcoal", size: "Standard", qty: 2, price: 249 }
  ],
  subtotal: 1197,
  discount: 100,
  couponCode: "FIRST100",
  shipping: 79,
  total: 1176,
  paymentStatus: "paid",
  status: "printing",
  placedAt: "2026-11-02"
};
var orders = [
  demoOrder,
  {
    id: "HO-2026-10479",
    customer: "Arjun Mehta",
    address: { line1: "12 MG Road", city: "Pune", state: "Maharashtra", pin: "411001" },
    items: [{ productSlug: "headphone-stand", name: "Headphone Stand", color: "Sand", size: "Standard", qty: 1, price: 799 }],
    subtotal: 799,
    discount: 0,
    shipping: 79,
    total: 878,
    paymentStatus: "pending",
    status: "printing",
    placedAt: "2026-11-04"
  },
  {
    id: "HO-2026-10471",
    customer: "Priya Nair",
    address: { line1: "9 Lake View", city: "Kochi", state: "Kerala", pin: "682001" },
    items: [{ productSlug: "custom-name-plate", name: "Custom Name Plate", color: "Sage", size: "Standard", qty: 1, price: 399 }],
    subtotal: 399,
    discount: 0,
    shipping: 79,
    total: 478,
    paymentStatus: "paid",
    status: "delivered",
    placedAt: "2026-10-20"
  }
];
function findOrder(id) {
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
}
__name(findOrder, "findOrder");
__name2(findOrder, "findOrder");
var onRequestGet = /* @__PURE__ */ __name2(async (context2) => {
  const id = context2.params.id;
  const order = findOrder(id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ order }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var onRequestGet2 = /* @__PURE__ */ __name2(async (context2) => {
  const slug = context2.params.slug;
  const product = getProduct(slug);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ product }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var customRequests = [
  { id: "CPR-2611-0738", customer: "Riya Sharma", email: "riya@example.com", fileName: "bracket_v2.stl", material: "PETG", status: "new", submittedAt: "2026-11-05" },
  { id: "CPR-2611-0712", customer: "Arjun Mehta", email: "arjun@example.com", fileName: "stand.step", material: "PLA", status: "quoted", submittedAt: "2026-11-03" },
  { id: "CPR-2610-0690", customer: "Priya Nair", email: "priya@example.com", fileName: "gear_mount.3mf", material: "TPU", status: "completed", submittedAt: "2026-10-28" }
];
var customers = [
  { id: "cust-1", name: "Riya Sharma", email: "riya@example.com", phone: "9876543210", orders: ["HO-2026-10482"], totalSpend: 1176, joined: "2026-08-14" },
  { id: "cust-2", name: "Arjun Mehta", email: "arjun@example.com", phone: "9876500011", orders: ["HO-2026-10479"], totalSpend: 878, joined: "2026-09-02" },
  { id: "cust-3", name: "Priya Nair", email: "priya@example.com", phone: "9876500022", orders: ["HO-2026-10471"], totalSpend: 478, joined: "2026-10-20" }
];
var coupons = [
  { code: "FIRST100", type: "flat", value: 100, minOrder: 999, enabled: true, expires: "2026-12-31" },
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 500, enabled: false, expires: "2026-11-30" }
];
var payments = [
  { id: "pay-1", orderId: "HO-2026-10482", method: "UPI", amount: 1176, status: "paid", maskedId: "pay_\u2022\u2022\u2022\u2022 4821", date: "2026-11-02" },
  { id: "pay-2", orderId: "HO-2026-10479", method: "Card", amount: 878, status: "pending", maskedId: "pay_\u2022\u2022\u2022\u2022 9912", date: "2026-11-04" },
  { id: "pay-3", orderId: "HO-2026-10471", method: "Netbanking", amount: 478, status: "paid", maskedId: "pay_\u2022\u2022\u2022\u2022 2290", date: "2026-10-20" }
];
var productionCards = [
  { id: "p1", label: "HO-2026-10482 \xB7 Spiral Decor Vase", stage: "printing", priority: "high" },
  { id: "p2", label: "HO-2026-10482 \xB7 Minimal Phone Stand \xD72", stage: "printing", priority: "normal" },
  { id: "p3", label: "HO-2026-10479 \xB7 Headphone Stand", stage: "queued", priority: "normal" },
  { id: "p4", label: "CPR-2611-0738 \xB7 Custom bracket", stage: "post-processing", priority: "high" },
  { id: "p5", label: "HO-2026-10471 \xB7 Custom Name Plate", stage: "completed", priority: "normal" }
];
var inventory = [
  { slug: "spiral-decor-vase", variant: "Terracotta / Small", stock: 24, reserved: 3, low: false },
  { slug: "spiral-decor-vase", variant: "Charcoal / Large", stock: 6, reserved: 1, low: true },
  { slug: "hex-pen-cup", variant: "Sand / Standard", stock: 0, reserved: 0, low: true },
  { slug: "flexi-octopus", variant: "Black / Standard", stock: 0, reserved: 0, low: true },
  { slug: "drawer-pull-set", variant: "Charcoal / Standard", stock: 4, reserved: 2, low: true },
  { slug: "minimal-phone-stand", variant: "Charcoal / Standard", stock: 40, reserved: 4, low: false }
];
var onRequestGet3 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const resource = searchParams.get("resource") ?? "all";
  if (resource === "all") {
    return Response.json({
      customers,
      coupons,
      payments,
      production: productionCards,
      inventory,
      customRequests
    }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  const map = {
    customers,
    coupons,
    payments,
    production: productionCards,
    inventory,
    "custom-requests": customRequests
  };
  const key = Object.keys(map).find((k) => k.toLowerCase() === resource.toLowerCase());
  if (!key) {
    return Response.json({ error: "Unknown resource" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ [key]: map[key] }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var categories = [
  { slug: "home-decor", name: "Home Decor", description: "Vases, planters and lamp shades" },
  { slug: "desk", name: "Desk & Workspace", description: "Organizers, stands and riser accessories" },
  { slug: "personalised", name: "Personalised", description: "Name plates, keychains and tags" },
  { slug: "figurines", name: "Figurines", description: "Articulated and display figures" },
  { slug: "functional", name: "Functional Parts", description: "Everyday useful prints" }
];
function getCategory(slug) {
  return categories.find((c) => c.slug === slug);
}
__name(getCategory, "getCategory");
__name2(getCategory, "getCategory");
var onRequestGet4 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const slug = searchParams.get("slug");
  if (slug) {
    const category = getCategory(slug);
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    return Response.json({ category }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ categories, count: categories.length }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var quote = {
  id: "CPR-2611-0738",
  printingCost: 1560,
  materialCost: 280,
  shipping: 79,
  total: 1919,
  validUntil: "2026-11-13",
  dimensions: { x: 82, y: 46, z: 30 },
  material: "PETG",
  color: "Charcoal",
  finish: "Matte"
};
var materials = {
  PLA: {
    colors: ["Terracotta", "Charcoal", "Sand", "Sage", "White", "Black"],
    finishes: ["Matte", "Glossy"]
  },
  PETG: {
    colors: ["Charcoal", "Sand", "Clear", "Black"],
    finishes: ["Matte", "Translucent"]
  },
  TPU: {
    colors: ["Black", "Charcoal", "Sand"],
    finishes: ["Matte", "Flexible-soft"]
  }
};
var faqs = [
  { category: "Orders", q: "How long does production take?", a: "Most in-stock items print and ship within 3\u20136 business days of dispatch (Estimated)." },
  { category: "Orders", q: "Can I change my order after placing it?", a: "Contact support within 2 hours of placing your order and we'll try to adjust it before production starts." },
  { category: "Custom print", q: "How does the quoting process work?", a: "Upload your 3D model, choose material and color, and we'll send a quote within 24 hours based on print time and material use." },
  { category: "Custom print", q: "What file formats are supported?", a: "STL, STEP and 3MF files up to 100 MB. OBJ files are not currently supported." },
  { category: "Shipping", q: "What are the shipping charges?", a: "Standard shipping is \u20B979, and free on orders above \u20B91,499. Express shipping is \u20B9149." },
  { category: "Returns", q: "Can I return a custom print?", a: "Custom and personalised prints are made to order and are not eligible for return unless defective." }
];
var testimonials = [
  { name: "Demo customer \u2014 Ananya R.", quote: "The vase arrived exactly as shown, and the finish was better than I expected.", rating: 5 },
  { name: "Demo customer \u2014 Karthik S.", quote: "Uploaded a model for a custom bracket and had a quote the next day.", rating: 5 },
  { name: "Demo customer \u2014 Fatima I.", quote: "Packaging was careful and the print quality on the lamp shade was great.", rating: 4 }
];
var onRequestGet5 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const section = searchParams.get("section");
  const sections = {
    quote,
    materials,
    faqs,
    testimonials
  };
  if (section) {
    const key = Object.keys(sections).find((k) => k === section);
    if (!key) {
      return Response.json({ error: "Unknown section" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    return Response.json({ [key]: sections[key] }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({ quote, materials, faqs, testimonials }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var BASE_URL = "https://api.nimbuspost.com/v1/";
var AUTH_URL = `${BASE_URL}users/login`;
var SERVICEABILITY_URL = `${BASE_URL}courier/serviceability`;
var NimbusPostNotConfiguredError = class extends Error {
  static {
    __name(this, "NimbusPostNotConfiguredError");
  }
  static {
    __name2(this, "NimbusPostNotConfiguredError");
  }
  constructor() {
    super("NimbusPost credentials are not configured.");
    this.name = "NimbusPostNotConfiguredError";
  }
};
var NimbusPostApiError = class extends Error {
  static {
    __name(this, "NimbusPostApiError");
  }
  static {
    __name2(this, "NimbusPostApiError");
  }
  constructor(message) {
    super(message);
    this.name = "NimbusPostApiError";
  }
};
var cachedToken = null;
var loginPromise = null;
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new NimbusPostNotConfiguredError();
  return value;
}
__name(requireEnv, "requireEnv");
__name2(requireEnv, "requireEnv");
function jwtExpiryMs(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp * 1e3 : null;
  } catch {
    return null;
  }
}
__name(jwtExpiryMs, "jwtExpiryMs");
__name2(jwtExpiryMs, "jwtExpiryMs");
function login() {
  if (!loginPromise) {
    loginPromise = performLogin().finally(() => {
      loginPromise = null;
    });
  }
  return loginPromise;
}
__name(login, "login");
__name2(login, "login");
async function performLogin() {
  const email = requireEnv("NIMBUSPOST_EMAIL");
  const password = requireEnv("NIMBUSPOST_PASSWORD");
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new NimbusPostApiError(`NimbusPost login failed (${res.status}).`);
  }
  const data = await res.json();
  const token = typeof data.data === "string" ? data.data : data.data?.token ?? data.token;
  if (!token) {
    throw new NimbusPostApiError("NimbusPost login response did not include a token.");
  }
  const expMs = jwtExpiryMs(token);
  const expiresAt = expMs ? expMs - 5 * 60 * 1e3 : Date.now() + 60 * 60 * 1e3;
  cachedToken = { token, expiresAt };
  return token;
}
__name(performLogin, "performLogin");
__name2(performLogin, "performLogin");
async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  return login();
}
__name(getToken, "getToken");
__name2(getToken, "getToken");
function parseEddDays(edd) {
  const match2 = edd.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match2) return null;
  const [, day, month, year] = match2;
  const eddDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(eddDate.getTime())) return null;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = eddDate.getTime() - today.getTime();
  return Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1e3)));
}
__name(parseEddDays, "parseEddDays");
__name2(parseEddDays, "parseEddDays");
function courierDays(courier) {
  return courier.edd ? parseEddDays(courier.edd) : null;
}
__name(courierDays, "courierDays");
__name2(courierDays, "courierDays");
async function callServiceability(pickupPincode, deliveryPincode, weightKg, token) {
  return fetch(SERVICEABILITY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      origin: pickupPincode,
      destination: deliveryPincode,
      payment_type: "prepaid",
      weight: weightKg,
      order_amount: 0
    })
  });
}
__name(callServiceability, "callServiceability");
__name2(callServiceability, "callServiceability");
async function checkServiceability(deliveryPincode, weightKg = 0.5) {
  const pickupPincode = requireEnv("NIMBUSPOST_PICKUP_PINCODE");
  let token = await getToken();
  let res = await callServiceability(pickupPincode, deliveryPincode, weightKg, token);
  if (res.status === 401) {
    cachedToken = null;
    token = await login();
    res = await callServiceability(pickupPincode, deliveryPincode, weightKg, token);
  }
  if (!res.ok) {
    throw new NimbusPostApiError(`NimbusPost serviceability check failed (${res.status}).`);
  }
  const data = await res.json();
  const couriers = data.data ?? [];
  if (couriers.length === 0) {
    return { serviceable: false, cod: false };
  }
  const days = couriers.map(courierDays).filter((d) => d !== null);
  const cod = couriers.some((c) => (c.cod_charges ?? 0) > 0);
  return {
    serviceable: true,
    minDays: days.length ? Math.min(...days) : void 0,
    maxDays: days.length ? Math.max(...days) : void 0,
    cod
  };
}
__name(checkServiceability, "checkServiceability");
__name2(checkServiceability, "checkServiceability");
function formatMessage(result) {
  if (!result.serviceable) return "Delivery isn't currently available to this PIN code.";
  if (result.minDays && result.maxDays) {
    const range = result.minDays === result.maxDays ? `${result.minDays}` : `${result.minDays}-${result.maxDays}`;
    return `Delivery in ${range} business days after dispatch (Estimated).`;
  }
  return "Delivery available to this PIN code.";
}
__name(formatMessage, "formatMessage");
__name2(formatMessage, "formatMessage");
var onRequestGet6 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const pincode = searchParams.get("pincode") ?? "";
  if (!/^\d{6}$/.test(pincode)) {
    return new Response(JSON.stringify({ error: "Enter a valid 6-digit PIN code." }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  try {
    const result = await checkServiceability(pincode);
    return new Response(JSON.stringify({ ...result, message: formatMessage(result) }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    if (err instanceof NimbusPostNotConfiguredError) {
      return new Response(
        JSON.stringify({ error: "Delivery estimation isn't configured yet. Add NimbusPost credentials to enable it." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        }
      );
    }
    if (err instanceof NimbusPostApiError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    return new Response(JSON.stringify({ error: "Couldn't check delivery estimate." }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}, "onRequestGet");
var categoryShapes = {
  "home-decor": { shape: "vase", color: "#C96F4A" },
  desk: { shape: "stand", color: "#2B2E33" },
  personalised: { shape: "plate", color: "#D9C6A5" },
  figurines: { shape: "dragon", color: "#5E7A6A" },
  functional: { shape: "part", color: "#3C5A80" }
};
var featuredProducts = [
  { id: 1, slug: "spiral-decor-vase", name: "Spiral Decor Vase", meta: "PLA \xB7 3 colours", price: 699, shape: "vase", color: "#C96F4A", badge: "available", availability: "available" },
  { id: 2, slug: "minimal-phone-stand", name: "Minimal Phone Stand", meta: "PETG \xB7 4 colours", price: 249, shape: "stand", color: "#2B2E33", badge: "available", availability: "available" },
  { id: 3, slug: "articulated-dragon", name: "Articulated Dragon", meta: "Silk PLA \xB7 2 colours", price: 499, shape: "dragon", color: "#5E7A6A", badge: "made-to-order", availability: "made-to-order" },
  { id: 4, slug: "custom-name-plate", name: "Custom Name Plate", meta: "Personalised \xB7 3 to 5 days", price: 399, shape: "plate", color: "#D9C6A5", badge: "made-to-order", availability: "made-to-order" }
];
var newArrivals = [
  { id: 5, slug: "geometric-planter", name: "Geometric Planter", meta: "PLA \xB7 3 sizes", price: 449, shape: "planter", color: "#5E7A6A", badge: "new", availability: "available" },
  { id: 6, slug: "headphone-stand", name: "Headphone Stand", meta: "PETG \xB7 weighted base", price: 799, shape: "stand", color: "#8C8F96", badge: "low-stock", availability: "low-stock" },
  { id: 7, slug: "personalized-keychain", name: "Personalized Keychain", meta: "Up to 12 characters", price: 149, shape: "keychain", color: "#F97316", badge: "made-to-order", availability: "made-to-order" },
  { id: 8, slug: "cable-organizer", name: "Cable Organizer", meta: "TPU \xB7 set of 3", price: 149, shape: "organizer", color: "#3C5A80", badge: "available", availability: "available" }
];
var customSteps = [
  { n: "01", t: "Upload", d: "STL or 3MF, preview it in 3D." },
  { n: "02", t: "Configure", d: "Material, colour, finish, quantity." },
  { n: "03", t: "Get a quote", d: "Reviewed by a person, usually within 1 business day." },
  { n: "04", t: "Pay and track", d: "Accept, pay, follow every production step." }
];
var howItWorks = [
  { t: "Choose", d: "Pick a ready-made design or personalise one with your text." },
  { t: "We print", d: "Printed after you order or picked from ready stock. You see which before paying." },
  { t: "We check", d: "Every piece is cleaned, finished and quality checked by hand." },
  { t: "Delivered", d: "Packed for safe transit and shipped with live tracking." }
];
var valueProps = [
  { n: "01", t: "Precision you can feel", d: "Tuned printers and hand finishing for clean layers and tight tolerances." },
  { n: "02", t: "Honest timelines", d: "Production and delivery estimates shown separately, every time." },
  { n: "03", t: "Made for you", d: "Personalise text, colour and size without paying for a full custom job." },
  { n: "04", t: "Real support", d: "Talk to the people who print your order on WhatsApp or email." }
];
var homeReviews = [
  { q: "The vase looks far more premium than I expected. Layer lines are barely visible.", who: "Demo customer A.", what: "Spiral Decor Vase" },
  { q: "Uploaded my drone part on Monday, got a clear quote the next day.", who: "Demo customer B.", what: "Custom print" },
  { q: "Nameplate was printed exactly as previewed and arrived well packed.", who: "Demo customer C.", what: "Custom Name Plate" }
];
var homeFaqs = [
  { q: "What is the difference between production time and shipping time?", a: "Production time is how long we take to print, finish and quality check your item. Shipping time starts after dispatch. Both are shown separately on every product and at checkout, and shipping times are estimates from our courier partners." },
  { q: "Which files can I upload for a custom print?", a: "STL and 3MF files up to 100 MB. If your model needs repair, our team will tell you in the quote before you pay anything." },
  { q: "When do I pay for a custom print?", a: "Only after you review and accept the quote. Quotes stay valid for 7 days." },
  { q: "Can I return a personalised item?", a: "Personalised and custom items are made for you, so they can be returned only if they arrive damaged or defective. See the Return and Refund Policy." }
];
var heroChecklist = [
  "Production time shown before you pay",
  "Secure payments by Razorpay",
  "Quality checked before packing"
];
var onRequestGet7 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const section = searchParams.get("section");
  const sections = {
    featured: featuredProducts,
    "new-arrivals": newArrivals,
    "custom-steps": customSteps,
    "how-it-works": howItWorks,
    "value-props": valueProps,
    "home-reviews": homeReviews,
    "home-faqs": homeFaqs,
    "hero-checklist": heroChecklist,
    "category-shapes": categoryShapes
  };
  if (section) {
    const key = Object.keys(sections).find((k) => k === section);
    if (!key) {
      return Response.json({ error: "Unknown section" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    return Response.json({ [key]: sections[key] }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  return Response.json({
    featured: featuredProducts,
    newArrivals,
    customSteps,
    howItWorks,
    valueProps,
    homeReviews,
    homeFaqs,
    heroChecklist,
    categoryShapes
  }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var onRequestGet8 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");
  let result = orders;
  if (id) {
    const order = findOrder(id);
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    return Response.json({ order });
  }
  if (status) result = result.filter((o) => o.status === status);
  if (paymentStatus) result = result.filter((o) => o.paymentStatus === paymentStatus);
  return Response.json({ orders: result, count: result.length });
}, "onRequestGet");
var onRequestPost3 = /* @__PURE__ */ __name2(async (context2) => {
  try {
    const body = await context2.request.json();
    if (!body.id || !body.customer || !body.items) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    return Response.json({ message: "Order received", order: body }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}, "onRequestPost");
var onRequestGet9 = /* @__PURE__ */ __name2(async (context2) => {
  const { searchParams } = new URL(context2.request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  let result = products;
  if (category) result = result.filter((p) => p.category === category);
  if (featured === "true") result = result.filter((p) => p.isNew === true || p.availability === "low-stock");
  return Response.json({ products: result, count: result.length }, { headers: { "Access-Control-Allow-Origin": "*" } });
}, "onRequestGet");
var routes = [
  {
    routePath: "/api/payments/create-order",
    mountPath: "/api/payments",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/payments/verify-payment",
    mountPath: "/api/payments",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/orders/:id",
    mountPath: "/api/orders",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/products/:slug",
    mountPath: "/api/products",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/admin",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/categories",
    mountPath: "/api/categories",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/custom-print",
    mountPath: "/api/custom-print",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/delivery-estimate",
    mountPath: "/api/delivery-estimate",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/home",
    mountPath: "/api/home",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/orders",
    mountPath: "/api/orders",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/orders",
    mountPath: "/api/orders",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/products",
    mountPath: "/api/products",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
__name2(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError2 = /* @__PURE__ */ __name2(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError2;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// C:/Users/ADMIN/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// C:/Users/ADMIN/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError3 = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError2(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError3;

// .wrangler/tmp/bundle-FqKXey/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// C:/Users/ADMIN/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env2, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-FqKXey/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.3781066349753166.js.map
