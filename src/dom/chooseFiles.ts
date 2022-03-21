let input: HTMLInputElement | null = null

interface ChooseFilesOption {
  /**
   * @default ''
   */
  accept?: string

  /**
   * @default false
   */
  multiple?: boolean
}

export function chooseFiles(opt: ChooseFilesOption = {}): Promise<File[]> {
  return new Promise((resolve, reject) => {
    input ||= createInputElement()

    input.accept = opt.accept ?? ''
    input.multiple = opt.multiple ?? false

    input.onchange = () => {
      const files = [...(input?.files || [])]

      input!.value = ''
      resolve(files)
    }

    input.onerror = (e) => reject(e)

    input.click()
  })
}

// for test
export const getInputEl = () => input

function createInputElement() {
  input ||= document.createElement('input')

  input.type = 'file'
  input.style.display = 'none'
  document.body.appendChild(input)

  return input
}
