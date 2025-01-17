// ==UserScript==
// @name        Empire`s battle bot
// @namespace   DaveDev Scripts
// @match       *://*.empiresbattle.com/*
// @grant       none
// @version     0.3.9
// @author      davedev
// @icon        https://raw.githubusercontent.com/DaveDev13/Empires-battle-bot/refs/heads/main/logo.jpg
// @downloadURL https://github.com/DaveDev13/Empires-battle-bot/raw/main/empires-battle-autoclicker.user.js
// @updateURL   https://github.com/DaveDev13/Empires-battle-bot/raw/main/empires-battle-autoclicker.user.js
// @homepage    https://github.com/DaveDev13/Empires-battle-bot
// ==/UserScript==

let GAME_SETTINGS = {
  minClickDelay: 30, // Минимальная задержка клика в миллисекундах
  maxClickDelay: 130, // Максимальная задержка клика в миллисекундах
  energyThreshold: 25,  // Пороговое значение энергии
  checkModalInterval: 999,  // Интервал проверки существования элемента кнопки проверки
  minPause: 66,  // Минимальная пауза в миллисекундах
  maxPause: 666,  // Максимальная пауза в миллисекундах
  isGamePaused: false,
}

const divForEnergy = '._card__energy_descr_mlp4m_583'
const divForClick = '#root > main > div._card_mlp4m_440 > img'
const divForCheck = '._slider_4emqn_120'

// Функция для расчета задержки между кликами
function getClickDelay() {
  const minDelay = GAME_SETTINGS.minClickDelay || 500
  const maxDelay = GAME_SETTINGS.maxClickDelay || 1000
  return Math.random() * (maxDelay - minDelay) + minDelay
}
// Функция для генерации случайной задержки
function getRandomDelay(min, max) {
  return Math.random() * (max - min) + min
}
const styles = {
  success: 'background: #28a745; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  starting: 'background: #8640ff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  error: 'background: #dc3545; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  info: 'background: #007bff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  turbo: 'background: #6c757d; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
}
const logPrefix = '%c[EmpireBot] '

const originalLog = console.log
console.log = function () {
  if (typeof arguments[0] === 'string' && arguments[0].includes('[EmpireBot]')) {
    originalLog.apply(console, arguments)
  }
}

console.error = console.warn = console.info = console.debug = () => { }

console.clear()
console.log(`${logPrefix}Starting`, styles.starting)
console.log(`${logPrefix}Created by https://t.me/mudachyo`, styles.starting)
console.log(`${logPrefix}Github https://github.com/mudachyo/Empire-Coin`, styles.starting)


// Функция для генерации случайных координат в пределах элемента
function getRandomCoordinates(element) {
  const rect = element.getBoundingClientRect()
  const randomX = rect.left + Math.random() * rect.width
  const randomY = rect.top + Math.random() * rect.height
  return { x: randomX, y: randomY }
}
function triggerClick(element) {
  const coords = getRandomCoordinates(element)

  const events = [
    new MouseEvent('pointerover', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('pointerenter', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('pointerdown', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y }),
    new MouseEvent('pointerup', { view: window, bubbles: true, cancelable: true, clientX: coords.x, clientY: coords.y })
  ]

  events.forEach(event => element.dispatchEvent(event))
}

// Функция для проверки уровня энергии
function checkEnergy() {
  const energyElement = document.querySelector(divForEnergy)
  if (energyElement) {
    const energyText = energyElement.textContent.replace(',', '')
    const currentEnergy = parseFloat(energyText)

    return currentEnergy
  }
  return 100
}

// Функция для выполнения клика с рандомными координатами и задержкой
function findAndClick() {
  if (GAME_SETTINGS.isGamePaused) {
    setTimeout(findAndClick, 1000)
    return
  }
  const currentEnergy = checkEnergy()

  if (currentEnergy < GAME_SETTINGS.energyThreshold) {
    if (!GAME_SETTINGS.isGamePaused) {
      GAME_SETTINGS.isGamePaused = true
      const pauseDuration = getRandomDelay(GAME_SETTINGS.minPause, GAME_SETTINGS.maxPause)
      console.log(`${logPrefix}Энергия низкая (${currentEnergy}), пауза на ${pauseDuration / 1000} секунд.`, styles.info)
      setTimeout(() => {
        GAME_SETTINGS.isGamePaused = false
        findAndClick()
      }, pauseDuration)
    }
  } else {
    const firstElement = document.querySelector(divForClick)

    if (firstElement) {
      function clickWithRandomInterval() {
        if (GAME_SETTINGS.isGamePaused) {
          setTimeout(findAndClick, 1000)
          return
        }
        triggerClick(firstElement)

        setTimeout(clickWithRandomInterval, getClickDelay())
      }

      console.log(`${logPrefix}Element found. Starting auto-clicker...`, styles.success)
      clickWithRandomInterval()
    } else {
      if (attempts < 5) {
        attempts++
        console.log(`${logPrefix}Attempt ${attempts} to find the element failed. Retrying in 3 seconds...`, styles.info)
        setTimeout(findAndClick, 3000)
      } else {
        console.log(`${logPrefix}Element not found after 5 attempts. Restarting search...`, styles.error)
        attempts = 0
        setTimeout(findAndClick, 3000)
      }
    }
  }
}

// Функция для проверки и клика по элементу с заданным классом
function checkAndClickSliderText() {
  const sliderElement = document.querySelector(divForCheck)
  console.log(sliderElement)
  if (sliderElement) {
    toggleGamePause()

    setTimeout(() => {
      sliderElement.click()
      toggleGamePause()
    }, getRandomDelay(GAME_SETTINGS.minPause, GAME_SETTINGS.maxPause))
    console.clear()
  } else {
    console.log('Элемент кнопки проверки не найден.')
  }
}

// Устанавливаем интервал для проверки
setInterval(checkAndClickSliderText, GAME_SETTINGS.checkModalInterval)

const settingsMenu = document.createElement('div')
settingsMenu.className = 'settings-menu'
settingsMenu.style.display = 'none'

const menuTitle = document.createElement('h3')
menuTitle.className = 'settings-title'
menuTitle.textContent = 'Empire Autoclicker'

const closeButton = document.createElement('button')
closeButton.className = 'settings-close-button'
closeButton.textContent = '×'
closeButton.onclick = () => {
  settingsMenu.style.display = 'none'
}

menuTitle.appendChild(closeButton)
settingsMenu.appendChild(menuTitle)

function toggleGamePause() {
  GAME_SETTINGS.isGamePaused = !GAME_SETTINGS.isGamePaused
  pauseResumeButton.textContent = GAME_SETTINGS.isGamePaused ? 'Resume' : 'Pause'
  pauseResumeButton.style.backgroundColor = GAME_SETTINGS.isGamePaused ? '#e5c07b' : '#98c379'
}

function updateSettingsMenu() {
  document.getElementById('minClickDelay').value = GAME_SETTINGS.minClickDelay
  document.getElementById('minClickDelayDisplay').textContent = GAME_SETTINGS.minClickDelay
  document.getElementById('maxClickDelay').value = GAME_SETTINGS.maxClickDelay
  document.getElementById('maxClickDelayDisplay').textContent = GAME_SETTINGS.maxClickDelay
  document.getElementById('energyThreshold').value = GAME_SETTINGS.energyThreshold
  document.getElementById('checkModalInterval').value = GAME_SETTINGS.checkModalInterval
}

settingsMenu.appendChild(createSettingElement('Min Click Delay (ms)', 'minClickDelay', 'range', 10, 4000, 10,
  'EN: Minimum delay between clicks.<br>' +
  'RU: Минимальная задержка между кликами.'))
settingsMenu.appendChild(createSettingElement('Max Click Delay (ms)', 'maxClickDelay', 'range', 10, 5000, 10,
  'EN: Maximum delay between clicks.<br>' +
  'RU: Максимальная задержка между кликами.'))
settingsMenu.appendChild(createSettingElement('Threshold value of energy (ms)', 'energyThreshold', 'range', 0, 1000, 10,
  'EN: The threshold value of the energy before the clicks stop.<br>' +
  'RU: Пороговое значение энергии до остановки кликов.'))
settingsMenu.appendChild(createSettingElement('Delay check modal (ms)', 'checkModalInterval', 'range', 1000, 10000, 10,
  'EN: The delay between checking for the appearance of a modal window and checking for an autoclicker.<br>' +
  'RU: Задержка между проверкой на появление модального окна с проверкой на автокликера.'))

const messageBox = document.createElement('div')
messageBox.className = 'message-box'
messageBox.style.display = 'none'
document.body.appendChild(messageBox)

const pauseResumeButton = document.createElement('button')
pauseResumeButton.textContent = 'Pause'
pauseResumeButton.className = 'pause-resume-btn'
pauseResumeButton.onclick = toggleGamePause
settingsMenu.appendChild(pauseResumeButton)

const socialButtons = document.createElement('div')
socialButtons.className = 'social-buttons'

const githubButton = document.createElement('a')
githubButton.href = 'https://github.com/mudachyo/Empire-Coin'
githubButton.target = '_blank'
githubButton.className = 'social-button'
githubButton.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADtklEQVR4nO2ZSWgVQRCGP2OCS3CJYoy7uCtiDi6o8aAIikvQi4oGvCiiRo2E6FXJQdxQg4LgUTx4cyPuHhVRD0bcsyDu4IJrTNTnSEMNPOfNm1czb2YSJD8UDNNT1fV3V1dX90AH/l8UAEuBfUAt8Bj4CLSKmOdH0ma+WQL0pp2gC1AGXAJ+A5ZPMToXgFViK3Z0AyqBVwGcTycvga1A17hILAAaQiTglHpgfpQEzNTXREjAKcdl5kNFf+BOjCQskVtAYVgkhst0W20kT8WHrNBP0qjVxtIAFAUl0bWNwsnyCLNAKfpoO3DecsjhICnWy+B2CbspwA7gWRbOmd1+G1As1cGBDN/P05LoptgnBruEoSH0A7gKVACzgNFAvsgYebcROAN8BTYDnR22ihWLXxVilYpRTLf75mlHy+PbAYr+zUB5oouy7Ah9o0pCkaL/F5lmpUwZ1+MiJFKi9GGll5FLSiPLIyRSrvThfDoDBT5K8eoIiRxT+vAL6OlmYKnSwGdZkFFhPPBT6Uupm4H9SmWT56PGSaUve92Ua5XK02Igskzpy1k35afKuMyNgchYJRFT0KbgvULRfBMHhiiJvHNTblUomm86xUBkoiMKPor8cfjT4qZsZ4rZUu+MAPoAA+XZljiIJCNXtoYC6dtUFYOSBjYFn6TxJnAXaJRQeiPPtqwgehz2iIrvScvAzFIKnkjjNUmxWyRPm4p1khw37VGJGjnS11BggmTKRVI575a7MPsIkIKL0rhLqsuDwCngOlAns/FBpnN1xLPRIqPdBDwAbgPngCNyFtrvVaZUKzOFkW8yU2FjncuC9pKdbkbm+jBgpBlYE1KomZJ8j08SRua4GeuuTMFOuSFryXnS0yBfBqMxQL8tXucie504xZxT1soGlM7wW+AEsEFGaiTQK8l2XznHmOvQKikvvgYgYImYkiotSj1SXomcwd8qw65KbihtFMq75iyct5JkYaa015RGsU7apwJfMpAwpNOhJAQy9eKLJyo8DJhcbpcQFyU07J84z4ErwOJMHQDrsyRSrr3duBckLn0gx6MPK4Pc9VOBzwQSLkYSIe4fGwKQSADT/XZ0JI2xT3KxNlgTpx4YFYBITZCO8qTu8tNRZ5/2/di+7PMC8B/09BnLfqG1+yCMP8DDgIdtSOS+nBhDQQ+pNOMmciWKf/F5UmInYiCSAA5FfdExWc4HURGpA2YQE3IlBTc4fvj7xeskfWNrU0zXTSnIkbLldFL54gelorswyz2pAx0gIvwFLXDNiM6zHVAAAAAASUVORK5CYII=">GitHub'
socialButtons.appendChild(githubButton)

const telegramButton = document.createElement('a')
telegramButton.href = 'https://t.me/shopalenka'
telegramButton.target = '_blank'
telegramButton.className = 'social-button'
telegramButton.innerHTML = '<img src="data:image/png;base64,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">Telegram Channel'
socialButtons.appendChild(telegramButton)

settingsMenu.appendChild(socialButtons)

document.body.appendChild(settingsMenu)

const settingsButton = document.createElement('button')
settingsButton.className = 'settings-button'
settingsButton.textContent = '⚙️'
settingsButton.onclick = () => {
  settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block'
}
document.body.appendChild(settingsButton)

const style = document.createElement('style')
style.textContent = `
  .settings-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(40, 44, 52, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    color: #abb2bf;
    font-family: 'Arial', sans-serif;
    z-index: 10000;
    padding: 20px;
    width: 300px;
  }
  .settings-title {
    color: #61afef;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .settings-close-button {
    background: none;
    border: none;
    color: #e06c75;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
  }
  .setting-item {
    margin-bottom: 12px;
  }
  .setting-label {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }
  .setting-label-text {
    color: #e5c07b;
    margin-right: 5px;
  }
  .help-icon {
    cursor: help;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #61afef;
    color: #282c34;
    font-size: 10px;
    font-weight: bold;
  }
  .setting-input {
    display: flex;
    align-items: center;
  }
  .setting-slider {
    flex-grow: 1;
    margin-right: 8px;
  }
  .setting-value {
    min-width: 30px;
    text-align: right;
    font-size: 11px;
  }
  .tooltip {
    position: relative;
  }
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: #4b5263;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 11px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
  }
  .pause-resume-btn {
    display: block;
    width: calc(100% - 10px);
    padding: 8px;
    margin: 15px 5px;
    background-color: #98c379;
    color: #282c34;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    transition: background-color 0.3s;
  }
  .pause-resume-btn:hover {
    background-color: #7cb668;
  }
  .social-buttons {
    margin-top: 15px;
    display: flex;
    justify-content: space-around;
    white-space: nowrap;
  }
  .social-button {
    display: inline-flex;
    align-items: center;
    padding: 5px 8px;
    border-radius: 4px;
    background-color: #282c34;
    color: #abb2bf;
    text-decoration: none;
    font-size: 12px;
    transition: background-color 0.3s;
  }
  .social-button:hover {
    background-color: #4b5263;
  }
  .social-button img {
    width: 16px;
    height: 16px;
    margin-right: 5px;
  }
  .settings-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(36, 146, 255, 0.8);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 9999;
  }
.auto-spin-btn {
  display: block;
  width: calc(100% - 10px);
  padding: 8px;
  margin: 15px 5px;
  background-color: #e06c75;
  color: #282c34;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.3s;
}
.auto-spin-btn:hover {
  opacity: 0.9;
}
.message-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(40, 44, 52, 0.9);
  color: #e06c75;
  padding: 10px 20px;
  border-radius: 5px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  z-index: 10001;
  text-align: center;
}
.auto-turbo-btn {
  display: block;
  width: calc(100% - 10px);
  padding: 8px;
  margin: 15px 5px;
  background-color: #e06c75;
  color: #282c34;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.3s;
}
.auto-turbo-btn:hover {
  opacity: 0.9;
}
.hide-ui-btn {
  display: block;
  width: calc(100% - 10px);
  padding: 8px;
  margin: 15px 5px;
  background-color: #e06c75;
  color: #282c34;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.3s;
}
.hide-ui-btn:hover {
  opacity: 0.9;
}
.hidden-ui-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(40, 44, 52, 0.95);
  color: #abb2bf;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  text-align: center;
  z-index: 9998; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  max-width: 80%;
  word-wrap: break-word;
  pointer-events: none;
}
`
document.head.appendChild(style)

function createSettingElement(label, id, type, min, max, step, tooltipText) {
  const container = document.createElement('div')
  container.className = 'setting-item'

  const labelContainer = document.createElement('div')
  labelContainer.className = 'setting-label'

  const labelElement = document.createElement('span')
  labelElement.className = 'setting-label-text'
  labelElement.textContent = label

  const helpIcon = document.createElement('span')
  helpIcon.textContent = '?'
  helpIcon.className = 'help-icon tooltip'

  const tooltipSpan = document.createElement('span')
  tooltipSpan.className = 'tooltiptext'
  tooltipSpan.innerHTML = tooltipText
  helpIcon.appendChild(tooltipSpan)

  labelContainer.appendChild(labelElement)
  labelContainer.appendChild(helpIcon)

  const inputContainer = document.createElement('div')
  inputContainer.className = 'setting-input'

  let input
  if (type === 'checkbox') {
    input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.checked = GAME_SETTINGS[id]
    input.addEventListener('change', (e) => {
      GAME_SETTINGS[id] = e.target.checked
      saveSettings()
    })
    inputContainer.appendChild(input)
  } else {
    input = document.createElement('input')
    input.type = type
    input.id = id
    input.min = min
    input.max = max
    input.step = step
    input.value = GAME_SETTINGS[id]
    input.className = 'setting-slider'

    const valueDisplay = document.createElement('span')
    valueDisplay.id = `${id}Display`
    valueDisplay.textContent = GAME_SETTINGS[id]
    valueDisplay.className = 'setting-value'

    input.addEventListener('input', (e) => {
      GAME_SETTINGS[id] = parseFloat(e.target.value)
      valueDisplay.textContent = e.target.value
      saveSettings()
    })

    inputContainer.appendChild(input)
    inputContainer.appendChild(valueDisplay)
  }

  container.appendChild(labelContainer)
  container.appendChild(inputContainer)
  return container
}

function saveSettings() {
  localStorage.setItem('EmpireAutoclickerSettings', JSON.stringify(GAME_SETTINGS))
}

function loadSettings() {
  const savedSettings = localStorage.getItem('EmpireAutoclickerSettings')
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings)
    GAME_SETTINGS = {
      ...GAME_SETTINGS,
      ...parsedSettings
    }
  }
}

loadSettings()
updateSettingsMenu()

let attempts = 0
findAndClick()

// setInterval(() => {
//   if (!document.querySelector('div[aria-disabled="false"].css-79elbk')) {
//     attempts = 0
//     findAndClick()
//   }
// }, 1000)

// Раз в N времени (2 минуты) записываем в куки значение для обновления, обновляем страницу
// Через 2 секунды начинаем проверять на наличие элемента _card__top_mlp4m_494
// Если есть, то убираем из куки и делаем
// Сначала клик по _card__link__anim_enter_done_mlp14m_478
// Проверить что width > 0 у _autobot__water_line_19uhh_378
// Если да, то ждем дальше
// Если меньше или равно 0, то клик по _autobot__recharge_19uhh_404
// Потом клик по _info__btn_19uhh_298
// Клик по _close_j1cxg_54
// И запускаем новый цикл
