import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline'

/**
 * Prompt for a password without echoing it to the terminal, so it never
 * appears on screen, in shell history, or in the process list.
 */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = process.stdin
    const output = process.stdout

    if (!input.isTTY) {
      reject(new Error('No terminal available to read a password from.'))
      return
    }

    const rl = createInterface({ input, output, terminal: true })

    // Suppress echo: swallow everything readline would normally write back
    // after the prompt itself has been printed.
    let promptWritten = false
    const originalWrite = output.write.bind(output)
    ;(output as NodeJS.WriteStream).write = ((chunk: string | Uint8Array, ...rest: unknown[]) => {
      if (!promptWritten) {
        promptWritten = true
        return originalWrite(chunk, ...(rest as []))
      }
      return true
    }) as typeof output.write

    rl.question(question, (answer) => {
      ;(output as NodeJS.WriteStream).write = originalWrite
      output.write('\n')
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  // Accept an argument for scripted use, but prefer the hidden prompt.
  const password = process.argv[2] ?? (await promptHidden('Admin password: '))

  if (!password) {
    console.error('No password provided.')
    process.exit(1)
  }

  const hashedPassword = createHash('sha256').update(password).digest('hex')

  console.log('\nHashed password (this is the value to store as ADMIN_PASSWORD):\n')
  console.log(hashedPassword)
  console.log('\nStore the plaintext password in your password manager — it')
  console.log('cannot be recovered from this hash.\n')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
