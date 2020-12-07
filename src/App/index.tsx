import React, { useState, useMemo, useEffect } from 'react'
import Editor, { EditorDidMount } from '@monaco-editor/react'
import pako from 'pako'

import {
  InitialValueFunction,
  TestFunction,
  BenchmarkInput,
  Results,
  measureExecutionTime
} from '../benchmark'

import './index.scss'

const defaultTitle = 'What Code Is Faster?'

let defaultCode = `benchmark('${defaultTitle}', function initialValue() {
  return Math.random()
}, {
  hypot(prev) {
    const a = (prev + 1) % 1
    const b = (prev - 1) % 1
    return Math.hypot(a, b);
  },
  sqrt(prev) {
    const a = (prev + 1) % 1
    const b = (prev - 1) % 1
    return Math.sqrt(a*a + b*b);
  }
})
`

function bytesToStr(bytes: Uint8Array): string {
  return bytes.reduce((s, n) => s + String.fromCharCode(n), '')
}

function compress(str: string): string {
  const bytes = pako.deflate(str, { level: 9 })
  return btoa(bytesToStr(bytes))
}

function decompress(base64: string): string {
  const arr = new Uint8Array([...atob(base64)].map(c => c.charCodeAt(0)))
  return bytesToStr(pako.inflate(arr))
}

const codeParam = new URL(document.location.toString()).searchParams.get('code')
if (codeParam) {
  try {
    defaultCode = decompress(codeParam) || defaultCode
  } catch (e) {
    defaultCode = `// Failed to decode URL: ${e.toString()}`
  }
}

export function App() {
  const [error, setError] = useState<Error>()
  const [state, setState] = useState({
    title: defaultTitle,
    benchmarkInput: null as BenchmarkInput | null
  })

  const [progress, setProgress] = useState<{
    text: string
    time: number
  }>()

  const [results, setResults] = useState<Results>()

  function updateWithCode(code: string) {
    try {
      const urlParam = `?code=${encodeURIComponent(compress(code))}`
      const url = window.location.href.replace(/\?code=.*$/, '')

      if ((url + urlParam).length > 2048) {
        setError(new Error("Code is too long, won't be able to save it in the URL"))
      } else {
        history.replaceState({}, '', urlParam)
      }

      const fn = new Function('benchmark', code)
      fn(function benchmark(
        name: string,
        initialValue: InitialValueFunction,
        tests: { [key: string]: TestFunction }
      ) {
        document.title = name
        setState({
          title: name,
          benchmarkInput: { initialValue, tests: Object.values(tests) }
        })
      })
      setError(undefined)
    } catch (e) {
      console.error(e)
      setError(e)
    }
  }

  const handleEditorDidMount: EditorDidMount = (getCode, editor) => {
    // @ts-ignore
    window.editor = editor
    editor.onDidChangeModelContent(() => {
      updateWithCode(getCode())
    })
  }

  useEffect(() => {
    updateWithCode(defaultCode)
  }, [])

  async function run() {
    try {
      if (state.benchmarkInput) {
        setResults(
          await measureExecutionTime(state.benchmarkInput, (text: string, time: number) => {
            setProgress({ text, time })
          })
        )
        setProgress(undefined)
      }
    } catch (e) {
      setError(e)
    }
  }

  useEffect(() => {
    results?.forEach(r => console.log(r.name + ' outputs:', r.outputs))
  }, [results])

  const longestMinExecutionTime = useMemo<number>(() => {
    return results ? Math.max(...results.map(x => x.minExecutionTime)) : 0
  }, [results])

  return (
    <div className="app">
      <h1>{state.title}</h1>
      <div className="editor">
        <Editor
          language="javascript"
          editorDidMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
            minimap: {
              enabled: false
            }
          }}
          value={defaultCode}
        />
      </div>
      {progress && progress.time > 0 && (
        <div
          className="progress"
          style={{ '--length': progress.time } as React.CSSProperties}
        ></div>
      )}
      {error && (
        <div className="error">
          {error.constructor.name}: {error.message}
        </div>
      )}
      {results && (
        <table className="results">
          <tbody>
            {results.map((result, i) => (
              <tr className="result">
                <td className="name">{result.name}</td>
                <td className="time">{result.minExecutionTime.toFixed(4)} µs</td>
                <td
                  className="bar"
                  style={
                    {
                      '--color': i / (results.length - 1),
                      '--length': result.minExecutionTime / longestMinExecutionTime
                    } as React.CSSProperties
                  }
                />
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="run-me" disabled={Boolean(progress || error)} onClick={run}>
        {progress ? progress.text : "Let's find out!"}
      </button>
    </div>
  )
}
