import { platform } from 'node:os'
import { _exec, _parseArgs, exec } from './exec'

const isWin = platform() === 'win32'

function replaceTerminalChar(s: string) {
  return isWin ? s.replace(/\r\n/g, '\n') : s
}

describe('execute command', () => {
  it('should parse quotes', () => {
    let result = _parseArgs('echo hello')
    expect(result).eqls(['echo', 'hello'])

    result = _parseArgs('echo "hello \'"')
    expect(result).eqls(['echo', "hello '"])

    result = _parseArgs("echo 'hello \"'")
    expect(result).eqls(['echo', 'hello "'])
  })
})

describe('_exec', () => {
  it('should work', async () => {
    const result = await _exec('echo', ['hello'], { stdio: 'pipe' })

    expect(replaceTerminalChar(result.stdio.stdout)).toBe('hello\n')
  })
})

describe('exec', () => {
  it('should work with &&', async () => {
    const output = await exec('echo hello && echo world', {
      collectOutput: true,
    })

    expect(replaceTerminalChar(output)).toBe('hello\nworld\n')
  })

  it('should work with quotes', async () => {
    const output = await exec('echo "hello  \'world"', { collectOutput: true })

    if (isWin) {
      expect(replaceTerminalChar(output)).toBe('"hello  \'world"\n')
    } else {
      expect(output).toBe("hello  'world\n")
    }
  })

  it.skipIf(isWin)('should work with cwd option', async () => {
    const output = await exec('pwd', { collectOutput: true, cwd: import.meta.dirname })

    const expectPath = import.meta.dirname

    expect(output.trim()).toBe(expectPath)
  })
})
