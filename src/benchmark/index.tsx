import deepEqual from 'deep-equal'

export type InitialValueFunction = () => any
export type TestFunction = (input: any) => any
export type BenchmarkInput = { initialValue: InitialValueFunction; tests: TestFunction[] }

export type Microseconds = number

export type ProgressCallback = (status: string, progress: number) => void
export type Results = Array<{
  name: string
  minExecutionTime: Microseconds
  executionTimes: Microseconds[]
  outputs: any[]
}>

function equal(a: any, b: any) {
  // TODO: provide custom comparator to deepEqual
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.00000001
  } else {
    return deepEqual(a, b)
  }
}

export function checkSoundness({ initialValue, tests }: BenchmarkInput) {
  if (equal(initialValue(), initialValue())) {
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
    const seed = initialValue()
    if (!equal(test(seed), test(seed))) {
      throw new Error(
        `${test.name}() must depend only on its input (seems that it returns random results...)`
      )
    }
    if (equal(test(initialValue()), test(initialValue()))) {
      throw new Error(
        `${test.name}() must depend on its input (seems that it returns the same result regardless of that...)`
      )
    }
  }
  const seed = initialValue()
  const val = tests[0](seed)
  for (const test of tests) {
    if (!equal(test(seed), val)) {
      throw new Error(`The output of ${test.name}() must be the same as of ${tests[0].name}()`)
    }
  }
}

async function warmupAndDetermineAverageExecutionTime(
  test: TestFunction,
  initialValue: InitialValueFunction
): Promise<Microseconds> {
  let numCycles = 32
  while (true) {
    let input = initialValue()
    let t0 = performance.now()
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
  { initialValue, tests }: BenchmarkInput,
  onProgress: ProgressCallback = (status: string, progress: number) => {}
) {
  checkSoundness({ initialValue, tests })

  const numSamples = 50
  const microsecondsPerSample = 100 * 1000
  const cyclesPerSample: { [key: string]: Microseconds } = {}
  const results: Results = []

  for (const test of tests) {
    onProgress(`Warming up ${test.name}()...`, 0)
    const avgTime = await warmupAndDetermineAverageExecutionTime(test, initialValue) // µs
    cyclesPerSample[test.name] = Math.ceil(microsecondsPerSample / avgTime)
  }

  let totalNumSamples = tests.length * numSamples
  let samplesCollected = 0

  for (const test of tests) {
    const numCycles = cyclesPerSample[test.name]
    const executionTimes: Microseconds[] = []
    const outputs: any[] = []

    for (let i = 0; i < numSamples; i++) {
      let input = initialValue()
      let t0 = performance.now()

      for (let j = 0; j < numCycles; j++) {
        input = test(input)
      }

      samplesCollected++
      const progress = samplesCollected / totalNumSamples
      onProgress(`Measuring ${test.name}(), sample #${i}...`, progress)

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
