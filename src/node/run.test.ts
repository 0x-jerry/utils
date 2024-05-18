import { platform } from 'node:os'
import { _exec, _parseArgs, run } from './run.js'

const isWin = platform() === 'win32'

function replaceTerminalChar(s: string) {
  return isWin ? s.replace(/\r\n/g, '\n') : s
}

describe('run command', () => {
  it('should parse quotes', () => {
    let result = _parseArgs('echo hello')
    expect(result).eqls(['echo', 'hello'])

    result = _parseArgs('echo "hello \'"')
    expect(result).eqls(['echo', "hello '"])

    result = _parseArgs("echo 'hello \"'")
    expect(result).eqls(['echo', 'hello "'])
  })
})

describe('exec', () => {
  it('should work', async () => {
    const result = await _exec('echo', ['hello'], { stdio: 'pipe' })

    expect(replaceTerminalChar(result.stdio.stdout)).toBe('hello\n')
  })
})

describe('run', () => {
  it('should work with &&', async () => {
    const output = await run('echo hello && echo world', undefined, {
      collectOutput: true,
      silent: true,
    })

    expect(replaceTerminalChar(output)).toBe('hello\nworld\n')
  })

  it('should work with quotes', async () => {
    const output = await run('echo "hello  \'world"', undefined, { collectOutput: true })

    expect(replaceTerminalChar(output)).toBe('"hello  \'world"\n')
  })
})
