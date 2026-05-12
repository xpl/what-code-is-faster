import {
  BenchmarkInput,
  BenchmarkSoundnessError,
  EqualFunction,
  InitialValuesFunction,
  Results,
  TestFunction,
  measureExecutionTime
} from '../benchmark'

export type BenchmarkOptions = {
  initialValues: InitialValuesFunction
  equal?: EqualFunction
}

export type BenchmarkTests = Record<string, TestFunction>

function formatResultsForConsole(results: Results) {
  return results.map((result, index) => ({
    rank: index + 1,
    name: result.name,
    'min (us)': Number(result.minExecutionTime.toFixed(4))
  }))
}

export async function benchmark(
  name: string,
  opts: BenchmarkOptions,
  tests: BenchmarkTests
): Promise<Results | null> {
  console.log(`Benchmark: ${name}`)

  const input: BenchmarkInput = { tests: Object.values(tests), ...opts }
  let results: Results
  try {
    results = await measureExecutionTime(input, (status, progress) => {
      const percent = progress > 0 ? `${Math.round(progress * 100)}% ` : ''
      console.log(`${percent}${status}`)
    })
  } catch (error) {
    if (error instanceof BenchmarkSoundnessError) {
      console.error(`${error.name}: ${error.message}`)
      return null
    }
    throw error
  }

  console.table(formatResultsForConsole(results))
  return results
}
