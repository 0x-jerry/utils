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
    const input = createInputElement()

    input.accept = opt.accept ?? ''
    input.multiple = opt.multiple ?? false

    input.onchange = () => {
      const files = [...(input?.files || [])]

      resolve(files)
      input.remove()
    }

    input.onerror = (e) => {
      reject(e)
      input.remove()
    }

    input.click()
  })
}

function createInputElement() {
  const input = document.createElement('input')

  input.type = 'file'
  input.style.display = 'none'
  input.setAttribute('data-choose-file', '')

  document.body.appendChild(input)

  return input
}
