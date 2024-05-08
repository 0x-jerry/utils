import { _exec, _parseArgs, run } from './run'

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

    expect(result.stdio.stdout).toBe('hello\n')
  })
})

describe('run', () => {
  it('should work with &&', async () => {
    const output = await run('echo hello && echo world', undefined, { collectOutput: true })
    expect(output).toBe('hello\nworld\n')
  })

  it('should work with quotes', async () => {
    const output = await run('echo "hello \'world"', undefined, { collectOutput: true })
    expect(output).toBe("hello 'world\n")
  })
})
