import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const btn = document.createElement('button')
btn.innerText = 'test'

app.appendChild(btn)
