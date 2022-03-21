import { chooseFiles, getInputEl } from './chooseFiles'

describe('choose files', () => {
  it('choose', async () => {
    const blob = new Blob(['hello'])

    const p = chooseFiles()
    const el = getInputEl()!

    expect(el).toBeTruthy()

    // @ts-ignore
    el.files = [blob]

    el.dispatchEvent(new Event('change'))

    const res = await p
    expect(res).eql([blob])
  })
})
