import { ChildProcess, spawn, type CommonSpawnOptions } from 'child_process'
import pc from 'picocolors'
import { createPromise } from '../core/index.js'
import os from 'node:os'

/**
 *
 * @example
 *
 * ```ts
 * await run('echo "hello world" && echo cool things') // will print `hello world\ncool\nthings\n`
 * ```
 *
 * @param cmd
 * @param env
 * @param opt
 * @returns
 */
export async function run(
  cmd: string,
  env?: Record<string, string | undefined>,
  opt: { collectOutput?: boolean } = {}
) {
  const { collectOutput } = opt

  console.log(pc.dim('$'), pc.dim(cmd))

  const commands = cmd
    .split('&&')
    .map((n) => n.trim())
    .filter(Boolean)

  let output = ''

  for (const cmd of commands) {
    const [_cmd, ...args] = _parseArgs(cmd)
    const p = await _exec(_cmd, args, {
      stdio: collectOutput ? 'pipe' : 'inherit',
      env: env || process.env,
    })

    if (collectOutput) {
      output += p.stdio.stdout
    }
  }

  return output
}

export function _parseArgs(cmd: string) {
  const args: string[] = []

  const _cmd = cmd.replace(/(['"]).+?\1/g, (n) => {
    const idx = args.length
    args.push(n.slice(1, -1))
    return '__$' + idx
  })

  const normalized = _cmd.split(/\s+/).map((part) => {
    part = part.trim()

    if (part.startsWith('__$')) {
      return args[+part.slice(3)]
    } else {
      return part
    }
  })

  return normalized
}

interface ExecResult {
  process: ChildProcess
  stdio: {
    stdout: string
    stderr: string
  }
}

export async function _exec(cmd: string, args: readonly string[], opt?: CommonSpawnOptions) {
  const p = createPromise<ExecResult>()

  const win = os.platform() === 'win32'

  const childProcess = win
    ? spawn('cmd', ['/s', '/c', [cmd, ...args].join(' ')], { ...opt })
    : spawn(cmd, args, { ...opt })

  const stdio = {
    stdout: '',
    stderr: '',
  }

  childProcess.stdout?.on('data', (chunk) => {
    if (chunk instanceof Buffer) {
      stdio.stdout += chunk.toString()
    } else {
      stdio.stdout += String(chunk)
    }
    console.log('123', stdio.stdout)
  })

  childProcess.stderr?.on('data', (chunk) => {
    if (chunk instanceof Buffer) {
      stdio.stderr += chunk.toString()
    } else {
      stdio.stderr += String(chunk)
    }
  })

  childProcess.on('close', (code) => {
    const result = {
      process: childProcess,
      stdio,
    }

    if (code !== 0) {
      p.reject(result)
    } else {
      p.resolve(result)
    }
  })

  return p.instance
}
