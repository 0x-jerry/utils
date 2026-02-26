import { type ChildProcess, type CommonSpawnOptions, spawn } from 'node:child_process'
import os from 'node:os'
import pc from 'picocolors'
import { createPromise } from '../core'

export interface ExecOptions extends Omit<CommonSpawnOptions, 'env' | 'stdio'> {
  /**
   * default is false
   */
  collectOutput?: boolean
  /**
   * if collectOutput is true, then this is true, otherwise, this is false
   */
  silent?: boolean
  /**
   * default is `process.env`
   */
  env?: NodeJS.ProcessEnv
}

/**
 *
 * @example
 *
 * ```ts
 * await run('echo "hello world" && echo cool things') // will print `hello world\ncool\nthings\n`
 * ```
 */
export async function exec(cmd: string, opt: ExecOptions = {}) {
  const { env = process.env, collectOutput = false, silent = collectOutput, ...other } = opt

  if (!silent) {
    console.log(pc.dim('$'), pc.dim(cmd))
  }

  const commands = cmd
    .split('&&')
    .map((n) => n.trim())
    .filter(Boolean)

  let output = ''

  for (const cmd of commands) {
    const [_cmd, ...args] = _parseArgs(cmd)
    const p = await _exec(_cmd, args, {
      ...other,
      stdio: collectOutput ? 'pipe' : 'inherit',
      env: env,
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
    return `__$${idx}`
  })

  const normalized = _cmd.split(/\s+/).map((_part) => {
    const part = _part.trim()

    if (part.startsWith('__$')) {
      return args[+part.slice(3)]
    }
    return part
  })

  return normalized
}

export interface ExecResult {
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
    ? spawn('cmd', ['/c', cmd, ...args], { ...opt })
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

  return p.promise
}
