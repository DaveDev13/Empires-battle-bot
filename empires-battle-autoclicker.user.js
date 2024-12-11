// ==UserScript==
// @name        Empire`s battle bot
// @namespace   DaveDev Scripts
// @match       *://*.empiresbattle.com/*
// @grant       none
// @version     0.2.1
// @author      davedev
// @icon        https://raw.githubusercontent.com/DaveDev13/Empires-battle-bot/refs/heads/main/logo.jpg
// @downloadURL https://github.com/DaveDev13/Empires-battle-bot/raw/main/empires-battle-autoclicker.user.js
// @updateURL   https://github.com/DaveDev13/Empires-battle-bot/raw/main/empires-battle-autoclicker.user.js
// @homepage    https://github.com/DaveDev13/Empires-battle-bot
// ==/UserScript==

// Настройки
let GAME_SETTINGS = {
    energyThreshold: 25,  // Пороговое значение энергии
    checkModalInterval: 5999,  // Интервал проверки существования элемента кнопки проверки
    minDelayMs: 500, // Минимальная задержка клика в миллисекундах
    maxDelayMs: 999, // Максимальная задержка клика в миллисекундах
    minPause: 66,  // Минимальная пауза в миллисекундах
    maxPause: 666,  // Максимальная пауза в миллисекундах
    autoClickPlay: true,
}
// При загрузке страницы
let isPaused = JSON.parse(localStorage.getItem('isPaused')) || false // Флаг паузы
let clickTimeout  // Переменная для хранения таймера клика
let pauseResumeButton

// Функция для генерации случайной задержки
function getRandomDelay(min, max) {
    return Math.random() * (max - min) + min
}

// Функция для расчета задержки между кликами
function getClickDelay() {
    const minDelay = GAME_SETTINGS.minDelayMs || 500
    const maxDelay = GAME_SETTINGS.maxDelayMs || 1000
    return Math.random() * (maxDelay - minDelay) + minDelay
}

// Функция для генерации случайных координат в пределах элемента
function getRandomCoordinates(element) {
    const rect = element.getBoundingClientRect()
    const randomX = rect.left + Math.random() * rect.width
    const randomY = rect.top + Math.random() * rect.height
    return { x: randomX, y: randomY }
}

// Функция для симуляции PointerEvent с случайными координатами
function simulatePointerEvent(element, type, options = {}) {
    const event = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: options.pointerId || 1,
        width: options.width || 1,
        height: options.height || 1,
        pressure: options.pressure || 0.5,
        pointerType: options.pointerType || 'touch',
        isPrimary: options.isPrimary || true,
        clientX: options.clientX,
        clientY: options.clientY,
        ...options
    })
    element.dispatchEvent(event)
}

// Функция для симуляции TouchEvent с случайными координатами
function simulateTouchEvent(element, type, options = {}) {
    const touch = new Touch({
        identifier: options.pointerId || 1,
        target: element,
        clientX: options.clientX,
        clientY: options.clientY,
        radiusX: options.width || 1,
        radiusY: options.height || 1,
        force: options.pressure || 0.5
    })

    const event = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
        ...options
    })
    element.dispatchEvent(event)
}
function simulatePointerAndTouch(element, coords, type) {
    simulatePointerEvent(element, type, { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 })
    simulateTouchEvent(element, type, { clientX: coords.x, clientY: coords.y, pressure: 1, pointerId: 5 })
}
// Функция для проверки уровня энергии
function checkEnergy() {
    const energyElement = document.querySelector('._card__energy_descr_m47z2_490')
    if (energyElement) {
        const energyText = energyElement.textContent.replace(',', '')
        const currentEnergy = parseFloat(energyText)

        return currentEnergy
    }
    return 100
}

// Функция для выполнения клика с рандомными координатами и задержкой
function clickElement() {
    const currentEnergy = checkEnergy()

    if (currentEnergy < GAME_SETTINGS.energyThreshold) {
        if (!isPaused) {
            isPaused = true
            const pauseDuration = getRandomDelay(GAME_SETTINGS.minPause, GAME_SETTINGS.maxPause)
            console.log(`Энергия низкая (${currentEnergy}), пауза на ${pauseDuration / 1000} секунд.`)
            setTimeout(() => {
                isPaused = false
                startAutoClicker()
            }, pauseDuration)
        }
    } else {
        const firstElement = document.querySelector("#root > main > div._card_m47z2_353 > img")

        if (firstElement) {
            const coords = getRandomCoordinates(firstElement)
            simulatePointerAndTouch(firstElement, coords, 'pointerover')
            simulatePointerAndTouch(firstElement, coords, 'pointerdown')
            firstElement.click()
            console.clear()
        }
    }
}

// Функция для запуска автокликера с рандомной задержкой из настроек
let autoClickerInterval

function startAutoClicker() {
    if (autoClickerInterval) return // Если интервал уже существует, выходим из функции

    function tryClick() {
        if (!isPaused) {
            clickElement()
            autoClickerInterval = setTimeout(tryClick, getClickDelay()) // Планируем следующий клик через getClickDelay
        } else {
            clearTimeout(autoClickerInterval) // Останавливаем цепочку вызовов, если на паузе
            autoClickerInterval = null
        }
    }

    tryClick()
}

function stopAutoClicker() {
    if (autoClickerInterval) {
        clearTimeout(autoClickerInterval)
        autoClickerInterval = null
    }
}

startAutoClicker()

// Функция для проверки и клика по элементу с заданным классом
function checkAndClickSliderText() {
    const sliderElement = document.querySelector('._slider_qgtcs_120')
    if (sliderElement) {
        toggleGamePause()

        const coords = getRandomCoordinates(sliderElement)

        simulatePointerAndTouch(sliderElement, coords, 'pointerover')
        simulatePointerAndTouch(sliderElement, coords, 'pointerdown')

        setTimeout(() => {
            sliderElement.click()
            startAutoClicker()
        }, getRandomDelay(GAME_SETTINGS.minPause, GAME_SETTINGS.maxPause))
        console.clear()
    } else {
        console.log('Элемент кнопки проверки не найден.')
    }
}

// Устанавливаем интервал для проверки
setInterval(checkAndClickSliderText, GAME_SETTINGS.checkModalInterval)

function generateSettings() {
    const settingsMenu = document.createElement('div')
    settingsMenu.className = 'settings-menu'
    settingsMenu.style.display = 'none'

    const menuTitle = document.createElement('h3')
    menuTitle.className = 'settings-title'
    menuTitle.textContent = 'Empire`s battle Autoclicker'

    const closeButton = document.createElement('button')
    closeButton.className = 'settings-close-button'
    closeButton.textContent = '×'
    closeButton.onclick = () => {
        settingsMenu.style.display = 'none'
    }

    menuTitle.appendChild(closeButton)
    settingsMenu.appendChild(menuTitle)

    function updateSettingsMenu() {
        document.getElementById('minDelayMs').value = GAME_SETTINGS.minDelayMs
        document.getElementById('minDelayMsDisplay').textContent = GAME_SETTINGS.minDelayMs
        document.getElementById('maxDelayMs').value = GAME_SETTINGS.maxDelayMs
        document.getElementById('maxDelayMsDisplay').textContent = GAME_SETTINGS.maxDelayMs
        document.getElementById('maxDelayMsDisplay').textContent = GAME_SETTINGS.maxDelayMs
        document.getElementById('autoClickPlay').checked = GAME_SETTINGS.autoClickPlay
    }

    settingsMenu.appendChild(createSettingElement('Min Delay (ms)', 'minDelayMs', 'range', 10, 2000, 10,
        'EN: Minimum delay between clicks.<br>' +
        'RU: Минимальная задержка между кликами.'))
    settingsMenu.appendChild(createSettingElement('Max Delay (ms)', 'maxDelayMs', 'range', 10, 3000, 10,
        'EN: Maximum delay between clicks.<br>' +
        'RU: Максимальная задержка между кликами.'))
    settingsMenu.appendChild(createSettingElement('Threshold value of energy (ms)', 'energyThreshold', 'range', 0, 1000, 10,
        'EN: The threshold value of the energy before the clicks stop.<br>' +
        'RU: Пороговое значение энергии до остановки кликов.'))
    settingsMenu.appendChild(createSettingElement('Delay check modal (ms)', 'checkModalInterval', 'range', 1000, 10000, 10,
        'EN: The delay between checking for the appearance of a modal window and checking for an autoclicker.<br>' +
        'RU: Задержка между проверкой на появление модального окна с проверкой на автокликера.'))
    settingsMenu.appendChild(createSettingElement('Auto Click Play', 'autoClickPlay', 'checkbox', null, null, null,
        'EN: Automatically start the next game at the end of.<br>' +
        'RU: Автоматически начинать следующую игру по окончании.'))

    pauseResumeButton = document.createElement('button')
    pauseResumeButton.textContent = 'Pause'
    pauseResumeButton.className = 'pause-resume-btn'
    pauseResumeButton.onclick = toggleGamePause

    settingsMenu.appendChild(pauseResumeButton)

    /* 
      const socialButtons = document.createElement('div');
      socialButtons.className = 'social-buttons';
      
      const githubButton = document.createElement('a');
      githubButton.href = 'https://github.com/mudachyo/Empire`s';
      githubButton.target = '_blank';
      githubButton.className = 'social-button';
      githubButton.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADv0lEQVR4nO2ZW4iNURTHP4YMcs+4X3In8eASxgMpcosXhPJCcifhlTzILZdGKY/y4M0tdx5JeDAyDDMkxqUwjfu4HD8t1qnjtM/37X3Ot8+ZNP/adTrft9Ze/73XXpf9BUEj/lMAHYC5wB7gLFAJ1ALfdMjvB/pM3pkDtA8aAoAWwGLgIvATd4jMeWCR6AoKQKAlsBF4QXyoATYAxfkiMR2oxh+qgGm+3egg+cNR2fm4SXQBbpN/3ARK4iLRV7e7UHgkNuRKorOG0UKjGuiaLYniArlTmJu5h2jgMA0PZdmE2DBsUbcbDWwFnuZgnGT7zcBIrQ72Rbw/1SXZReWJngY3FEJfgSvAemAiMBBorWOQ/rcKOAV8BNYCRWm6Rloc/mgX04wdBWP2BZpbrVbIu0A3i/nX2yQ9m7Ij3kT1rw1dLeZ/HrorWgDaYIhHIqWWNiwMUyJVrA3meySy2tKGc5kUdHAoxbd7JHLE0oYfQFuTAmmKbPBeDqRHIkOB75a2zDYp2GspvM8XiSSA45a27DYJSwtqg7GBZwDzLG05bRKWRGPjl83yQGSwJZFKk/BbC8G3vkkIgF6WRN4E6dCbjijIO00CzwCGp3lBrY5fafbUm4STkWKS1jv9gI5Ad/2dHN6JpEJcWVODjCZaC/ZILqxJoE4f3gDuAI/V3V7p7+RYEHgGUBbiFZ9TjkGtSfihPryqpfQ6idNasY7QlvfPquSBSFOdqzcwTCIlMFMr5516FyZ4YBK+oA93aBm+HzgBXAPKdTfe6TlZ4nk36vVMPAEqgFvAGeCQ9kJ7M5YpUnZgj0+yUx5ILDcc6DBsMymZghu+AEvjcDVtH3Y5khBMNilrZRmC03Fdz1JRFgRa62KI27qiPmNflHJO0iF9yjJJQCGKXwPHgJWyUkB/oF2K7k7Sx8h1KLBJygttd7PF2bAVkpXNFPJKtQcXg23cToztkqK7RP+TZ3FgRlTYk0hhQrk+HwN8iCBRGjJHaQxkqsSWKL+V0JsJM1NKiAvqGsmPOM+Ay8Cs0An+yq/Ikchqq9sN4K6zXzpAdzbTHFG4Y12BAxOAhEFJIq78oUHBFQlgnOtEkkVNqNOLtZ6Rfhquf0AWRA5mM1FzrbtcUOSo3wWXXC4A0ydr6+LLWei3RUXOX4CBPsD9AhK5Jx1jTiRSJmwjlWYBiFyO/Vu8+nRZhmgWN5EEcMDrRQcwSvsDX0TKgfF+rDf30WvTvqPUZKHnZYq86FqTj+umTBlaWtCTyfLFUX62ys7IJSc1ohGBP/wGjidhuRxqAwcAAAAASUVORK5CYII=" alt="github">';
      socialButtons.appendChild(githubButton);
      
      const telegramButton = document.createElement('a');
      telegramButton.href = 'https://t.me/shopalenka';
      telegramButton.target = '_blank';
      telegramButton.className = 'social-button';
      telegramButton.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADKElEQVR4nO2a34tNURTHD+HOGGGIOxSFPHhSkj9AlIkRHjQxnsSTh+vH5EGKN3MpKUkevXmQuDQX4YEnEZIMd4YXFHORB7+Zj1a2nE77/Nj77nPPofnWrds9Z3/X+t6999prrXM8bxT/KYBpwDrgCHAJGADeAV/VR74/VtcOq3vbvTwAaAG2AFeBn5jjB3AZ6BEuLwMBrcAe4BXuIFy7hbtZItYAz0gPQ8DqtJfRMZqH08BE1yJmAfdoPu4AHa5EzFfTnRUGxYdGRcwEnpI9hqxnRkWmLJZTGO5ahWjgFPnDCZsQm1d0miypLDd3ks0fv8SAXvKPnUkOPZdpR1J8Bz4Z3P8yclZUAtgsjABVYAMwGRgHXDQYvzlKiGSxaeM9cBRYqLG/y4CnGlVPSFqdFh4A24G2iD+ybMAnvk7VkaxPwXkxVgFWAGNCl8JfH84Z8q/VkUhl5woSMA4As+OcD/jw0NBOWUciJWijuAl0A+NDHJ2rKsJuzbWxhpFLUNEZsU0OP6p0ZnHMv70V+CAzH3J9joXtAR3RW4sTdi8wPUZAB3BejemLuG+5hZA3OiLpdCTBFcl3ZClECVCcPap7IjgYc+82CyFfbIRIBFoZ57ziKgYi0L4EY0xCb6SQesygz8CiBA5tBIZ943oTijcNvYJh280us3JdkjZggWYvnAmkIKUkItT4mqvNbpLn/MEj4CxwQ5MV7DAQ0WbZ4KukfSDeSipC2V5maaesI5NerCs8ByYZCJEzxgZdOrJ2x0mjpBtLEgqRbNgUUsNMCSOUM8IlxNghYEKMkGsW3P1xB1gauB+VwgCvLTg3ZVXqyoG7P5hQqk6mKV4AhahZ9lRrP+1+7lKfvT4LjlKkiCa2g0bU2SMd92+GY2uJO47yfIL8YlUiET4xJ8kfjhuJ8G18Wc95we3YDR4hZgbwJGsF/C7iilYiAuFxMGMR8xoSEUjR5flEFsup6ESET0whg4ehrU5FBAR1przUasYhtgExLapKlK64KwhXKas3IAoq0axalgAypl8669ah1TWkoSy9WNUNqagXaOq+l2rq6rcL6p6u0HpiFN6/j19y2btcBwDRQQAAAABJRU5ErkJggg==" alt="telegram">';
      socialButtons.appendChild(telegramButton);
      
      const donateButton = document.createElement('a');
      donateButton.href = 'https://mudachyo.codes/donate/';
      donateButton.target = '_blank';
      donateButton.className = 'social-button';
      donateButton.innerHTML = '<img src="data:image/png;base64,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" alt="hand-holding-heart--v1">';
      socialButtons.appendChild(donateButton);
      
      settingsMenu.appendChild(socialButtons); */

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
        background-color: rgba(17, 17, 17, 0.95);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        z-index: 10000;
        padding: 16px;
        width: 340px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .settings-title {
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .settings-close-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #ffffff;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }

      .setting-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 10px;
        border-radius: 12px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .setting-label {
        display: flex;
        align-items: center;
        width: 110px;
      }

      .setting-label-text {
        color: #ffffff;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .help-icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 6px;
        margin-left: auto;
        font-size: 10px;
        cursor: help;
        z-index: 1;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .help-icon .tooltiptext {
        visibility: hidden;
        width: 200px;
        background-color: #000000;
        color: #ffffff;
        text-align: left;
        border-radius: 8px;
        padding: 8px;
        position: absolute;
        z-index: 99999;
        left: 24px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 11px;
        line-height: 1.4;
        white-space: normal;
        pointer-events: none;
      }

      .help-icon .tooltiptext::after {
        content: "";
        position: absolute;
        top: 50%;
        left: -10px;
        margin-top: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent #000000 transparent transparent;
      }

      .help-icon:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
      }

      .setting-input {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 166px;
        flex-shrink: 0;
        justify-content: flex-end;
      }

      .setting-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        outline: none;
      }

      .setting-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: #ffffff;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
      }

      .setting-value {
        min-width: 30px;
        text-align: right;
        font-size: 12px;
      }

      .pause-resume-btn {
        width: 100%;
        padding: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 12px;
        color: #ffffff;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 12px;
      }

      .social-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 12px;
      }

      .social-button {
        background: rgba(255, 255, 255, 0.05);
        padding: 8px;
        border-radius: 12px;
        color: #ffffff;
        text-decoration: none;
        font-size: 10px;
        transition: all 0.2s;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .social-button img {
        width: 23px;
        height: 23px;
      }

      .settings-button {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #227725e6;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        width: 50px;
        height: 50px;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transition: all 0.3s;
        z-index: 999999;
      }

      .settings-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
        margin-left: auto;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.1);
        transition: .4s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #227725;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
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
        helpIcon.className = 'help-icon'

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
            const switchLabel = document.createElement('label')
            switchLabel.className = 'switch'

            input = document.createElement('input')
            input.type = 'checkbox'
            input.id = id
            input.checked = GAME_SETTINGS[id]
            input.addEventListener('change', (e) => {
                GAME_SETTINGS[id] = e.target.checked
                saveSettings()
            })

            const slider = document.createElement('span')
            slider.className = 'slider'

            switchLabel.appendChild(input)
            switchLabel.appendChild(slider)
            inputContainer.appendChild(switchLabel)
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
        localStorage.setItem('Empire`sAutoclickerSettings', JSON.stringify(GAME_SETTINGS))
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('Empire`sAutoclickerSettings')
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
}

generateSettings()

function toggleGamePause() {
    if (isPaused) {
        startAutoClicker()
    } else {
        stopAutoClicker()
    }
    isPaused = !isPaused
    localStorage.setItem('isPaused', isPaused)
    pauseResumeButton.textContent = isPaused ? 'Resume' : 'Pause'
}

// сделать переход на бур и нажатие кнопки _btn_avxs8_497 + возвращение назад
// <button class="_slider_qgtcs_120" data-direction="2"><div class="_slider__padding_qgtcs_134"><div class="_slider__range_bg_qgtcs_160"></div><p class="_slider__text_qgtcs_185">НАЖАТЬ</p></div></button>