const maxCount = 10

const signatures = []

for (let count = 0; count < maxCount; count++) {
  const midTypes = Array(count + 1)
    .fill(0)
    .map((_, idx) => `M${idx + 1}`)

  const fnTypes = Array(count + 2)
    .fill(0)
    .map((_, idx) => {
      const ii = idx + 1
      return `fn${ii}: Fn<${ii === count + 2 ? 'O' : 'M' + ii}, [${ii === 1 ? 'I' : 'M' + idx}]>`
    })

  let signature = `<I, ${midTypes.join(', ')},O>(${fnTypes.join(
    ', '
  )}): IComposeResult<(i: I) => O>;`

  signatures.push(signature)
}

console.log(signatures.join('\n'))
