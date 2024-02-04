import deepEqual from 'deep-equal'

export type InitialValuesFunction = () => any
export type TestFunction = (input: any) => any
export type EqualFunction = (a: any, b: any) => any
export type BenchmarkInput = { initialValues: InitialValuesFunction; equal?: EqualFunction, tests: TestFunction[] }

export type Microseconds = number

export type ProgressCallback = (status: string, progress: number) => void
export type Results = Array<{
  name: string
  minExecutionTime: Microseconds
  executionTimes: Microseconds[]
  outputs: any[]
}>

function defaultEqual(a: any, b: any) {
  // TODO: provide custom comparator to deepEqual
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.00000001
  } else {
    return deepEqual(a, b)
  }
}

export function checkSoundness({ initialValues, equal = defaultEqual, tests }: BenchmarkInput) {
  if (deepEqual(initialValues(), initialValues())) {
    throw new Error('initialValue() must return random values!')
  }
  if (!tests.length) {
    throw new Error('Define at least one test function')
  }
  for (const test of tests) {
    if (typeof test !== 'function') {
      throw new Error(`All tests must be functions!`)
    }
    if (!test.name) {
      throw new Error('All test functions must have names')
    }
    const seed = initialValues()
    if (!equal(test(seed[test.name]), test(seed[test.name]))) {
      throw new Error(
        `${test.name}() must depend only on its input (seems that it returns random results...)`
      )
    }
    if (equal(test(initialValues()[test.name]), test(initialValues()[test.name]))) {
      throw new Error(
        `${test.name}() must depend on its input (seems that it returns the same result regardless of that...)`
      )
    }
  }
  const seed = initialValues()
  const result0 = tests[0](seed[tests[0].name])
  for (const test of tests) {
    const result = test(seed[test.name])
    if (!equal(result, result0)) {
      throw new Error(`The output of ${test.name}() must be the same as of ${tests[0].name}()`)
    }
  }
}

const microsecondsPerSample = 100 * 1000

async function quicklyDetermineRoughAverageExecutionTime(
  test: TestFunction,
  theInitialValue: any
): Promise<Microseconds> {
  let numCycles = 32
  let input = theInitialValue
  while (true) {
    let t0 = performance.now()
    input = theInitialValue
    for (let i = 0; i < numCycles; i++) {
      input = test(input)
    }
    // Increase numCycles two-fold until execution time is more than 50ms
    const execTimeMs = performance.now() - t0
    if (execTimeMs > 50) {
      return (execTimeMs * 1000) / numCycles // to µs
    }
    numCycles *= 2
    produceSideEffect(input)
    await sleep(1)
  }
}

export async function measureExecutionTime(
  input: BenchmarkInput,
  onProgress: ProgressCallback = (status: string, progress: number) => { }
) {
  checkSoundness(input)

  const warmupRuns = 3
  const warmupSamples = 5
  const measureSamples = 50
  const totalNumSamples = input.tests.length * (warmupSamples * warmupRuns + measureSamples)
  let samplesCollected = 0

  const cyclesPerSample: { [key: string]: Microseconds } = {}
  const initialValues = input.initialValues()

  for (const test of input.tests) {
    onProgress(`Preparing ${test.name}()...`, 0)
    const avgTime = await quicklyDetermineRoughAverageExecutionTime(test, initialValues[test.name]) // µs
    cyclesPerSample[test.name] = Math.ceil(microsecondsPerSample / avgTime)
  }

  for (let i = 0; i < warmupRuns; i++) {
    const results = await runSampling(
      input.tests,
      warmupSamples,
      cyclesPerSample,
      initialValues,
      (name, i) => {
        onProgress(`Warming up ${name}(), sample #${i}...`, ++samplesCollected / totalNumSamples)
      }
    )
    for (const result of results) {
      cyclesPerSample[result.name] = microsecondsPerSample / result.minExecutionTime
    }
  }

  return runSampling(input.tests, measureSamples, cyclesPerSample, initialValues, (name, i) => {
    onProgress(`Measuring ${name}(), sample #${i}...`, ++samplesCollected / totalNumSamples)
  })
}

async function runSampling(
  tests: BenchmarkInput['tests'],
  numSamples: number,
  cyclesPerSample: { [key: string]: Microseconds },
  initialValues: Record<string, any>,
  onProgress = (name: string, sample: number) => { }
) {
  let samplesCollected = 0
  let input: any = null
  const results: Results = []

  for (const test of tests) {
    const numCycles = cyclesPerSample[test.name]
    const executionTimes: Microseconds[] = []
    const outputs: any[] = []
    input = initialValues[test.name]

    for (let i = 0; i < numSamples; i++) {
      let t0 = performance.now()

      for (let j = 0; j < numCycles; j++) {
        input = test(input)
      }

      onProgress(test.name, i)

      executionTimes.push(((performance.now() - t0) * 1000) / numCycles)
      outputs.push(input)
      await sleep(50)
    }

    results.push({
      name: test.name,
      minExecutionTime: Math.min(...executionTimes),
      executionTimes,
      outputs
    })
  }

  return results.sort((a, b) => a.minExecutionTime - b.minExecutionTime)
}

function produceSideEffect(value: any) {
  // @ts-ignore
  const array = globalThis.__benchmarkSideEffect || (globalThis.__benchmarkSideEffect = [])
  array.push(value)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
