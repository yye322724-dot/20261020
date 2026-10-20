// ============================== 天氣動畫連連看 ============================== // 程式名稱說明
// 本檔案可直接貼到 p5.js Editor 的 sketch.js，不需要額外 HTML、CSS 或 import。 // 使用方式說明
// 每一行可執行程式都附有中文行尾註解，方便閱讀、修改與教學。 // 註解說明

const CORRECT_COLOR = `#d8e2dc`; // 設定正確答案的背景色。
const WRONG_COLOR = `#f4acb7`; // 設定錯誤答案的背景色。
const PANEL_COLOR = `rgba(255, 255, 255, 0.88)`; // 設定主要半透明面板的顏色。
const WEATHER_DURATION = 9000; // 設定背景場景每隔九秒自動切換一次。
const MAX_QUESTIONS = 6; // 設定每次測驗抽出的題目數量。
// 若希望完全離線，請把圖片下載到專案的 assets 資料夾，並將 imageUrl 改為 `assets/檔名.jpg`。

const WEATHER_CATALOG = [ // 建立完整的十二種天氣資料清單。
  { id: `sunny`, name: `晴天`, scene: `sunny`, imageUrl: `https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80` }, // 設定晴天資料與 Unsplash 靜態圖片網址。
  { id: `partlyCloudy`, name: `多雲`, scene: `cloudy`, imageUrl: `https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=900&q=80` }, // 設定多雲資料與 Unsplash 靜態圖片網址。
  { id: `overcast`, name: `陰天`, scene: `overcast`, imageUrl: `https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=900&q=80` }, // 設定陰天資料與 Unsplash 靜態圖片網址。
  { id: `rain`, name: `下雨`, scene: `rain`, imageUrl: `https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=900&q=80` }, // 設定下雨資料與 Unsplash 靜態圖片網址。
  { id: `thunder`, name: `雷雨`, scene: `thunder`, imageUrl: `https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=900&q=80` }, // 設定雷雨資料與 Unsplash 靜態圖片網址。
  { id: `snow`, name: `下雪`, scene: `snow`, imageUrl: `https://images.unsplash.com/photo-1516431883659-655d41c3981c?auto=format&fit=crop&w=900&q=80` }, // 設定下雪資料與 Unsplash 靜態圖片網址。
  { id: `fog`, name: `霧`, scene: `fog`, imageUrl: `https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=900&q=80` }, // 設定霧資料與 Unsplash 靜態圖片網址。
  { id: `rainbow`, name: `彩虹`, scene: `rainbow`, imageUrl: `https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80` }, // 設定彩虹資料與 Unsplash 靜態圖片網址。
  { id: `dust`, name: `沙塵`, scene: `dust`, imageUrl: `https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80` }, // 設定沙塵資料與 Unsplash 靜態圖片網址。
  { id: `typhoon`, name: `颱風`, scene: `typhoon`, imageUrl: `https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=900&q=80` }, // 設定颱風資料與 Unsplash 靜態圖片網址。
  { id: `hail`, name: `冰雹`, scene: `hail`, imageUrl: `https://images.unsplash.com/photo-1590055531615-f16d36ffe7e5?auto=format&fit=crop&w=900&q=80` }, // 設定冰雹資料與 Unsplash 靜態圖片網址。
  { id: `moon`, name: `月夜`, scene: `moon`, imageUrl: `https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80` } // 設定月夜資料與 Unsplash 靜態圖片網址。
]; // 結束天氣資料清單。

let canvasElement; // 儲存 p5.js 畫布物件。
let selectedWeather = []; // 儲存本回合抽出的六種天氣。
let labels = []; // 儲存本回合可拖曳的名稱標籤。
let slots = []; // 儲存上方六個答案格的佔用狀態。
let draggingLabel = -1; // 儲存目前正在拖曳的標籤編號，沒有拖曳時為負一。
let dragOrigin = null; // 儲存拖曳開始時的位置，放錯時使用。
let dragPointerX = 0; // 儲存拖曳中的游標或觸控 X 座標。
let dragPointerY = 0; // 儲存拖曳中的游標或觸控 Y 座標。
let answerVisible = false; // 記錄是否已按下點我看答案。
let submitted = false; // 記錄是否已按下交卷看成績。
let score = 0; // 儲存答對題數。
let percentage = 0; // 儲存答對百分比。
let elapsedSeconds = 0; // 儲存本回合經過的秒數。
let startTime = 0; // 儲存本回合開始時間。
let finishTime = 0; // 儲存交卷時的時間。
let confetti = []; // 儲存交卷後的彩帶粒子。
let currentSceneIndex = 0; // 儲存目前背景場景的索引。
let sceneStartedAt = 0; // 儲存背景場景開始時間。
let revealButton; // 儲存查看答案按鈕。
let submitButton; // 儲存交卷看成績按鈕。
let newQuizButton; // 儲存重新出題按鈕。

function setup() { // 建立畫布並初始化測驗。
  canvasElement = createCanvas(windowWidth, windowHeight); // 建立全螢幕響應式畫布。
  canvasElement.style(`display`, `block`); // 移除畫布下方可能出現的行內元素空白。
  canvasElement.style(`touch-action`, `none`); // 禁止畫布觸控時觸發瀏覽器捲動。
  document.body.style.margin = `0`; // 移除網頁預設外距。
  document.body.style.overflow = `hidden`; // 防止整個網頁產生捲軸影響操作。
  document.body.style.touchAction = `none`; // 防止手機瀏覽器把拖曳手勢當成頁面捲動。
  textFont(`Noto Sans TC, Microsoft JhengHei, sans-serif`); // 優先使用適合繁體中文的字型。
  textLeading(1.35); // 設定多行文字的行距。
  createControlButtons(); // 透過 p5.js DOM API 建立三個互動按鈕。
  startNewQuiz(); // 產生第一回合題目並啟動計時器。
  sceneStartedAt = millis(); // 設定背景場景的起始時間。
  noStroke(); // 預設不繪製圖形外框。
} // 結束 setup。

function draw() { // 每一幀繪製背景、介面、圖片與拖曳物件。
  updateScene(); // 依時間更新背景天氣場景。
  drawAnimatedBackground(); // 繪製全螢幕天氣動畫背景。
  updateTimer(); // 更新尚未交卷時的計時器。
  drawInterface(); // 繪製標題、說明、卡片、答案格與狀態。
  drawDraggingLabel(); // 在最上層繪製正在拖曳的名稱標籤。
  if (submitted && percentage > 60) drawConfetti(); // 交卷且嚴格高於百分之六十時顯示彩帶。
} // 結束 draw。

function createControlButtons() { // 建立並設定所有 p5.js DOM 按鈕。
  revealButton = createButton(`點我看答案`); // 建立查看答案按鈕。
  revealButton.mousePressed(showAnswers); // 綁定查看答案按鈕事件。
  revealButton.attribute(`aria-label`, `顯示每個答案格的正確或錯誤狀態`); // 增加按鈕的無障礙說明。
  submitButton = createButton(`交卷看成績`); // 建立交卷看成績按鈕。
  submitButton.mousePressed(submitQuiz); // 綁定交卷按鈕事件。
  submitButton.attribute(`aria-label`, `交卷並顯示分數百分比用時與每題結果`); // 增加按鈕的無障礙說明。
  newQuizButton = createButton(`重新出題`); // 建立重新出題按鈕。
  newQuizButton.mousePressed(startNewQuiz); // 綁定重新出題按鈕事件。
  styleButton(revealButton, `#496a81`); // 設定查看答案按鈕樣式。
  styleButton(submitButton, `#bf5b5b`); // 設定交卷按鈕樣式。
  styleButton(newQuizButton, `#5b8068`); // 設定重新出題按鈕樣式。
  layoutControls(); // 依目前螢幕尺寸排列按鈕。
} // 結束 createControlButtons。

function styleButton(button, color) { // 統一設定 p5.js 按鈕外觀。
  button.style(`font-family`, `Noto Sans TC, Microsoft JhengHei, sans-serif`); // 設定按鈕中文字型。
  button.style(`font-size`, `clamp(14px, 1.7vw, 18px)`); // 讓按鈕文字隨螢幕大小調整。
  button.style(`font-weight`, `700`); // 讓按鈕文字清楚易讀。
  button.style(`color`, `#ffffff`); // 設定按鈕文字為白色。
  button.style(`background-color`, color); // 設定按鈕主色。
  button.style(`border`, `2px solid rgba(255,255,255,0.8)`); // 設定按鈕邊框。
  button.style(`border-radius`, `999px`); // 將按鈕做成圓角膠囊形狀。
  button.style(`padding`, `10px 16px`); // 設定按鈕內距。
  button.style(`cursor`, `pointer`); // 讓桌機使用者知道按鈕可以點擊。
  button.style(`box-shadow`, `0 4px 12px rgba(0,0,0,0.18)`); // 增加按鈕立體感。
  button.style(`touch-action`, `manipulation`); // 讓手機點擊按鈕不觸發捲動。
} // 結束 styleButton。

function layoutControls() { // 依視窗大小更新按鈕位置與尺寸。
  if (!revealButton || !submitButton || !newQuizButton) return; // 若按鈕尚未建立就先離開。
  const padding = constrain(width * 0.035, 12, 42); // 計算左右邊界內距。
  const gap = 10; // 設定按鈕之間的間距。
  const buttonWidth = constrain((width - padding * 2 - gap * 2) / 3, 94, 190); // 計算三個按鈕的寬度。
  const y = height - 58; // 將按鈕放在畫布底部附近。
  revealButton.position(padding, y); // 設定查看答案按鈕位置。
  submitButton.position(padding + buttonWidth + gap, y); // 設定交卷按鈕位置。
  newQuizButton.position(padding + (buttonWidth + gap) * 2, y); // 設定重新出題按鈕位置。
  revealButton.size(buttonWidth, 40); // 設定查看答案按鈕尺寸。
  submitButton.size(buttonWidth, 40); // 設定交卷按鈕尺寸。
  newQuizButton.size(buttonWidth, 40); // 設定重新出題按鈕尺寸。
} // 結束 layoutControls。

function preload() { // 在 p5.js 建立畫面前集中準備靜態天氣圖片。
  loadWeatherImages(); // 由集中流程啟動十二張圖片的載入。
} // 結束 preload。

function loadWeatherImages() { // 集中載入十二張靜態圖片並記錄載入結果。
  for (const weather of WEATHER_CATALOG) { // 逐一處理每種天氣資料。
    weather.image = null; // 預先清除圖片物件，讓自繪 fallback 可以先顯示。
    weather.imageStatus = `loading`; // 設定圖片目前正在載入的狀態。
    loadImage(weather.imageUrl, image => { // 使用 p5.js loadImage 載入靜態圖片檔。
      weather.image = image; // 圖片成功後保存圖片物件。
      weather.imageStatus = `loaded`; // 將圖片狀態標記為成功並允許覆蓋 fallback。
    }, () => { // 當圖片失敗、被阻擋或網址失效時執行。
      weather.image = null; // 清除可能不完整的圖片物件。
      weather.imageStatus = `failed`; // 保留自繪 fallback 並標記圖片載入失敗。
    }); // 結束單張靜態圖片載入呼叫。
  } // 結束逐一載入天氣圖片。
} // 結束 loadWeatherImages。

function startNewQuiz() { // 重新抽題、清除配對並重設狀態。
  selectedWeather = shuffle([...WEATHER_CATALOG]).slice(0, MAX_QUESTIONS); // 從十二種天氣隨機抽出六種。
  labels = shuffle(selectedWeather.map((weather, index) => ({ id: index, weatherId: weather.id, name: weather.name, poolIndex: index, location: { type: `pool`, index } }))); // 將六個名稱洗牌並放到底部。
  slots = selectedWeather.map((weather, index) => ({ weatherId: weather.id, occupant: -1, index })); // 建立六個空白答案格。
  draggingLabel = -1; // 清除目前拖曳中的標籤。
  dragOrigin = null; // 清除上一次拖曳起點。
  answerVisible = false; // 重新出題後不顯示答案色彩。
  submitted = false; // 重新出題後回到尚未交卷狀態。
  score = 0; // 清除上一回合分數。
  percentage = 0; // 清除上一回合百分比。
  elapsedSeconds = 0; // 清除上一回合用時。
  startTime = millis(); // 重新設定計時器起點。
  finishTime = 0; // 清除上一回合交卷時間。
  confetti = []; // 清除上一回合彩帶粒子。
  sceneStartedAt = millis(); // 讓背景場景循環重新計時。
  revealButton.html(`點我看答案`); // 將查看答案按鈕文字重設。
  submitButton.html(`交卷看成績`); // 將交卷按鈕文字重設。
} // 結束 startNewQuiz。

function updateTimer() { // 計算目前回合經過的秒數。
  if (!submitted) elapsedSeconds = floor((millis() - startTime) / 1000); // 尚未交卷時持續更新用時。
} // 結束 updateTimer。

function updateScene() { // 讓背景依時間自動切換不同天氣。
  const passed = millis() - sceneStartedAt; // 計算本場景已經持續的毫秒數。
  if (passed >= WEATHER_DURATION) { // 當場景時間超過設定值時切換。
    currentSceneIndex = (currentSceneIndex + 1) % WEATHER_CATALOG.length; // 循環切換十二種天氣場景。
    sceneStartedAt = millis(); // 重設下一個場景的起始時間。
  } // 結束場景切換判斷。
} // 結束 updateScene。

function drawAnimatedBackground() { // 繪製不影響閱讀的全螢幕天氣背景。
  const weather = WEATHER_CATALOG[currentSceneIndex]; // 取得目前背景天氣。
  drawSkyGradient(weather.scene); // 先繪製符合天氣的天空漸層。
  drawSceneObjects(weather.scene); // 再繪製雲、雨、雪、閃電等動畫元素。
  fill(255, 255, 255, 30); // 設定整體柔和的白色霧面覆蓋層。
  rect(0, 0, width, height); // 讓背景降低對前景文字的干擾。
} // 結束 drawAnimatedBackground。

function drawSkyGradient(scene) { // 依天氣繪製天空的上下漸層。
  const topColor = scene === `moon` ? color(`#101b46`) : scene === `rainbow` ? color(`#9ed3ee`) : scene === `dust` ? color(`#c99062`) : color(`#73bfe5`); // 選擇天空上方顏色。
  const bottomColor = scene === `moon` ? color(`#445b84`) : scene === `dust` ? color(`#e3bd84`) : color(`#d9f2fa`); // 選擇天空下方顏色。
  for (let y = 0; y < height; y += 4) { // 以水平條帶建立平滑漸層。
    const amount = y / max(height, 1); // 計算目前條帶在畫布中的比例。
    stroke(lerpColor(topColor, bottomColor, amount)); // 設定目前條帶的混合色。
    line(0, y, width, y); // 繪製目前的天空條帶。
  } // 結束漸層條帶迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawSkyGradient。

function drawSceneObjects(scene) { // 根據場景名稱繪製對應動畫。
  const time = millis() / 1000; // 取得連續動畫時間。
  if (scene === `sunny`) drawSun(width * 0.82, height * 0.22, 55 + sin(time) * 4); // 繪製晴天太陽。
  if (scene === `cloudy` || scene === `overcast` || scene === `rain`) drawClouds(time, scene === `overcast`); // 繪製多雲、陰天或下雨雲層。
  if (scene === `rain` || scene === `thunder`) drawRain(time, scene === `thunder`); // 繪製雨絲與雷雨效果。
  if (scene === `thunder` && floor(time * 2.2) % 9 === 0) drawLightning(width * 0.72, height * 0.18); // 間歇繪製閃電。
  if (scene === `snow`) drawSnow(time); // 繪製飄落雪花。
  if (scene === `fog`) drawFog(time); // 繪製緩慢流動的霧。
  if (scene === `rainbow`) drawRainbow(width * 0.5, height * 0.65); // 繪製彩虹。
  if (scene === `dust`) drawDust(time); // 繪製沙塵粒子。
  if (scene === `typhoon`) drawTyphoon(width * 0.76, height * 0.32, time); // 繪製旋轉颱風雲帶。
  if (scene === `hail`) drawHail(time); // 繪製冰雹。
  if (scene === `moon`) drawMoon(width * 0.8, height * 0.2, time); // 繪製月夜與星星。
} // 結束 drawSceneObjects。

function drawSun(x, y, radius) { // 繪製帶有呼吸感的太陽。
  noStroke(); // 不繪製太陽外框。
  fill(255, 225, 117, 35); // 設定太陽外圍光暈顏色。
  ellipse(x, y, radius * 3, radius * 3); // 繪製太陽光暈。
  fill(255, 205, 72, 230); // 設定太陽本體顏色。
  ellipse(x, y, radius * 2, radius * 2); // 繪製太陽本體。
  stroke(255, 225, 117, 180); // 設定太陽光線顏色。
  strokeWeight(4); // 設定太陽光線寬度。
  for (let i = 0; i < 12; i += 1) { // 逐一繪製十二條光線。
    const angle = TWO_PI * i / 12; // 計算目前光線角度。
    line(x + cos(angle) * radius * 1.35, y + sin(angle) * radius * 1.35, x + cos(angle) * radius * 1.75, y + sin(angle) * radius * 1.75); // 繪製放射狀光線。
  } // 結束光線迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawSun。

function drawClouds(time, dark) { // 繪製有水平移動效果的雲。
  const cloudColor = dark ? color(116, 132, 150, 190) : color(255, 255, 255, 170); // 依陰天選擇雲朵顏色。
  fill(cloudColor); // 套用雲朵顏色。
  noStroke(); // 不繪製雲朵外框。
  for (let i = 0; i < 5; i += 1) { // 繪製五朵大小不同的雲。
    const x = (i * width * 0.27 + time * (8 + i * 3)) % (width + 260) - 130; // 計算雲的水平移動位置。
    const y = height * (0.16 + (i % 3) * 0.11); // 計算雲的垂直位置。
    drawCloud(x, y, 0.7 + (i % 2) * 0.25, cloudColor); // 繪製單朵雲。
  } // 結束雲朵迴圈。
} // 結束 drawClouds。

function drawCloud(x, y, scaleValue, cloudColor) { // 繪製一朵由圓形組成的雲。
  push(); // 保存目前繪圖狀態。
  translate(x, y); // 移動到雲的中心位置。
  scale(scaleValue); // 套用雲的縮放比例。
  noStroke(); // 不繪製雲朵外框。
  fill(cloudColor); // 套用傳入的雲朵顏色。
  ellipse(0, 22, 170, 55); // 繪製雲朵底部。
  ellipse(-50, 12, 75, 62); // 繪製左側雲團。
  ellipse(0, -5, 100, 88); // 繪製中央雲團。
  ellipse(55, 12, 80, 65); // 繪製右側雲團。
  pop(); // 還原繪圖狀態。
} // 結束 drawCloud。

function drawRain(time, heavy) { // 繪製斜向落下的雨絲。
  stroke(195, 232, 255, heavy ? 170 : 120); // 設定雨絲顏色。
  strokeWeight(2); // 設定雨絲寬度。
  const count = heavy ? 90 : 55; // 依雷雨強度決定雨絲數量。
  for (let i = 0; i < count; i += 1) { // 逐一繪製雨絲。
    const x = (i * 97 + time * 80) % (width + 80) - 40; // 計算雨絲水平位置。
    const y = (i * 53 + time * 260) % (height + 100) - 100; // 計算雨絲垂直位置。
    line(x, y, x - 12, y + 34); // 繪製傾斜雨絲。
  } // 結束雨絲迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawRain。

function drawLightning(x, y) { // 繪製短暫的閃電形狀。
  fill(255, 245, 172, 220); // 設定閃電填色。
  beginShape(); // 開始繪製閃電多邊形。
  vertex(x, y); // 設定閃電第一個頂點。
  vertex(x - 28, y + 65); // 設定閃電第二個頂點。
  vertex(x - 4, y + 58); // 設定閃電第三個頂點。
  vertex(x - 35, y + 130); // 設定閃電第四個頂點。
  vertex(x + 25, y + 45); // 設定閃電第五個頂點。
  vertex(x + 2, y + 52); // 設定閃電第六個頂點。
  endShape(CLOSE); // 關閉閃電多邊形。
} // 結束 drawLightning。

function drawSnow(time) { // 繪製大小不同的飄落雪花。
  noStroke(); // 不繪製雪花外框。
  fill(255, 255, 255, 205); // 設定雪花顏色。
  for (let i = 0; i < 75; i += 1) { // 逐一繪製雪花。
    const x = (i * 71 + sin(time + i) * 28) % width; // 計算雪花水平位置。
    const y = (i * 43 + time * (18 + i % 5 * 5)) % height; // 計算雪花垂直位置。
    ellipse(x, y, 4 + i % 4, 4 + i % 4); // 繪製雪花圓點。
  } // 結束雪花迴圈。
} // 結束 drawSnow。

function drawFog(time) { // 繪製來回流動的半透明霧層。
  noStroke(); // 不繪製霧層外框。
  for (let i = 0; i < 6; i += 1) { // 逐一繪製六層霧。
    fill(235, 245, 245, 38); // 設定霧的半透明白色。
    const x = sin(time * 0.25 + i) * width * 0.18; // 計算霧層左右移動位置。
    ellipse(width * 0.5 + x, height * (0.28 + i * 0.12), width * 1.2, height * 0.15); // 繪製橢圓霧層。
  } // 結束霧層迴圈。
} // 結束 drawFog。

function drawRainbow(x, y) { // 繪製柔和的彩虹拱橋。
  noFill(); // 彩虹只顯示色彩弧線。
  strokeWeight(18); // 設定彩虹弧線寬度。
  const colors = [`#ef767a`, `#f9c74f`, `#90be6d`, `#43aa8b`, `#577590`]; // 設定彩虹顏色順序。
  for (let i = 0; i < colors.length; i += 1) { // 逐一繪製彩虹色帶。
    stroke(colors[i] + `bb`); // 套用帶有透明度的彩虹顏色。
    arc(x, y, 360 - i * 28, 360 - i * 28, PI, TWO_PI); // 繪製半圓形彩虹色帶。
  } // 結束彩虹色帶迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawRainbow。

function drawDust(time) { // 繪製緩慢漂移的沙塵粒子。
  noStroke(); // 不繪製沙塵外框。
  fill(133, 82, 45, 95); // 設定沙塵顏色。
  for (let i = 0; i < 100; i += 1) { // 逐一繪製沙塵粒子。
    const x = (i * 91 + time * (18 + i % 6 * 4)) % width; // 計算沙塵水平位置。
    const y = height * 0.3 + (i * 37) % (height * 0.55) + sin(time + i) * 10; // 計算沙塵垂直位置。
    ellipse(x, y, 2 + i % 5, 2 + i % 5); // 繪製沙塵圓點。
  } // 結束沙塵迴圈。
} // 結束 drawDust。

function drawTyphoon(x, y, time) { // 繪製旋轉的颱風雲帶。
  noFill(); // 颱風雲帶使用線條表現。
  stroke(225, 243, 250, 100); // 設定颱風雲帶顏色。
  strokeWeight(12); // 設定颱風雲帶寬度。
  for (let i = 0; i < 5; i += 1) { // 繪製五層旋轉雲帶。
    const radius = 40 + i * 28 + sin(time + i) * 6; // 計算雲帶半徑。
    arc(x, y, radius * 2, radius * 2, time + i, time + i + PI * 1.45); // 繪製旋轉弧線。
  } // 結束颱風雲帶迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawTyphoon。

function drawHail(time) { // 繪製從天空落下的冰雹。
  noStroke(); // 不繪製冰雹外框。
  fill(220, 244, 255, 205); // 設定冰雹顏色。
  for (let i = 0; i < 45; i += 1) { // 逐一繪製冰雹。
    const x = (i * 83) % width; // 計算冰雹水平位置。
    const y = (i * 47 + time * 290) % height; // 計算冰雹垂直位置。
    ellipse(x, y, 8 + i % 5, 8 + i % 5); // 繪製冰雹圓形。
  } // 結束冰雹迴圈。
} // 結束 drawHail。

function drawMoon(x, y, time) { // 繪製月亮與閃爍星星。
  noStroke(); // 不繪製月亮外框。
  fill(255, 247, 190, 45); // 設定月亮光暈顏色。
  ellipse(x, y, 180, 180); // 繪製月亮光暈。
  fill(255, 244, 183, 235); // 設定月亮本體顏色。
  ellipse(x, y, 104, 104); // 繪製月亮本體。
  fill(16, 27, 70, 230); // 設定遮住月亮的陰影顏色。
  ellipse(x + 24, y - 18, 100, 100); // 繪製月牙陰影。
  fill(255, 255, 235, 190); // 設定星星顏色。
  for (let i = 0; i < 40; i += 1) { // 逐一繪製星星。
    const sx = (i * 137) % width; // 計算星星水平位置。
    const sy = (i * 73) % (height * 0.55); // 計算星星垂直位置。
    const size = 2 + (sin(time * 2 + i) + 1) * 1.5; // 計算星星閃爍大小。
    ellipse(sx, sy, size, size); // 繪製星星。
  } // 結束星星迴圈。
} // 結束 drawMoon。

function drawInterface() { // 繪製前景半透明面板與所有測驗內容。
  const layout = getLayout(); // 取得適合目前螢幕的版面座標。
  drawHeader(layout); // 繪製標題與玩法說明。
  drawQuestionCards(layout); // 繪製上方六張天氣圖片卡片。
  drawNamePool(layout); // 繪製下方六個名稱標籤。
  drawStatus(layout); // 繪製查看答案或交卷後的狀態訊息。
} // 結束 drawInterface。

function getLayout() { // 計算響應式版面各區域的座標。
  const mobile = width < 720; // 判斷是否使用手機窄版配置。
  const columns = mobile ? 2 : width < 1120 ? 3 : 6; // 依寬度決定每列卡片數量。
  const gap = constrain(width * 0.018, 8, 22); // 計算卡片之間的間距。
  const side = constrain(width * 0.035, 12, 42); // 計算左右內距。
  const cardWidth = (width - side * 2 - gap * (columns - 1)) / columns; // 計算卡片寬度。
  const cardHeight = mobile ? 116 : width < 1120 ? 142 : 178; // 設定卡片高度。
  const headerHeight = mobile ? 142 : 132; // 設定標題說明區高度。
  const cardStartY = headerHeight + (mobile ? 12 : 18); // 設定卡片區起點。
  const rows = ceil(MAX_QUESTIONS / columns); // 計算卡片需要的列數。
  const cardAreaHeight = rows * cardHeight + (rows - 1) * gap; // 計算卡片區總高度。
  const labelStartY = cardStartY + cardAreaHeight + (mobile ? 24 : 34); // 設定名稱區起點。
  const labelHeight = mobile ? 48 : 54; // 設定名稱標籤高度。
  return { mobile, columns, gap, side, cardWidth, cardHeight, cardStartY, rows, labelStartY, labelHeight }; // 回傳完整版面資料。
} // 結束 getLayout。

function drawHeader(layout) { // 繪製左上角大標題與玩法說明。
  const side = layout.side; // 取得左右內距。
  fill(PANEL_COLOR); // 設定標題面板為半透明白色。
  rect(side * 0.55, 14, width - side * 1.1, layout.mobile ? 116 : 102, 22); // 繪製標題面板。
  fill(`#244052`); // 設定標題文字顏色。
  textAlign(LEFT, TOP); // 設定文字靠左靠上對齊。
  textStyle(BOLD); // 設定標題使用粗體。
  textSize(layout.mobile ? 25 : 38); // 依裝置設定標題字級。
  text(`天氣動畫連連看`, side, 25); // 繪製主標題。
  textStyle(NORMAL); // 恢復一般字體樣式。
  fill(`#35596b`); // 設定玩法文字顏色。
  textSize(layout.mobile ? 13 : 16); // 依裝置設定說明字級。
  const instruction = `玩法：按住下方名稱，拖曳到上方對應的天氣圖片下方格子；放錯可拖回下方；拖到已有名稱的格子時兩者互換；按「交卷看成績」查看分數。`; // 建立完整玩法說明。
  text(instruction, side, layout.mobile ? 62 : 70, width - side * 2.2, layout.mobile ? 55 : 40); // 繪製可換行的玩法說明。
} // 結束 drawHeader。

function drawQuestionCards(layout) { // 繪製上方六張天氣圖片卡片。
  for (let i = 0; i < selectedWeather.length; i += 1) { // 逐一繪製六張卡片。
    const position = getGridPosition(i, layout, layout.cardStartY, layout.cardHeight); // 計算卡片位置。
    drawWeatherCard(selectedWeather[i], i, position.x, position.y, layout.cardWidth, layout.cardHeight); // 繪製單張天氣卡片。
  } // 結束卡片迴圈。
} // 結束 drawQuestionCards。

function drawWeatherCard(weather, index, x, y, cardWidth, cardHeight) { // 繪製含靜態圖片或 fallback 的天氣卡片。
  fill(PANEL_COLOR); // 設定卡片背景色。
  rect(x, y, cardWidth, cardHeight, 18); // 繪製卡片圓角面板。
  fill(`#33586a`); // 設定卡片編號顏色。
  textAlign(LEFT, TOP); // 設定卡片編號靠左對齊。
  textStyle(BOLD); // 設定卡片編號使用粗體。
  textSize(13); // 設定卡片編號字級。
  text(`第 ${index + 1} 題`, x + 10, y + 8); // 繪製題號。
  const imageX = x + 8; // 計算動畫區域左側位置。
  const imageY = y + 30; // 計算動畫區域上方位置。
  const imageW = cardWidth - 16; // 計算動畫區域寬度。
  const imageH = cardHeight - 74; // 計算動畫區域高度。
  drawWeatherImage(weather, imageX, imageY, imageW, imageH); // 繪製先自繪再覆蓋靜態圖片的天氣內容。
  fill(`#ffffff`); // 設定答案格底色。
  stroke(`#7d9bab`); // 設定答案格外框顏色。
  strokeWeight(2); // 設定答案格外框寬度。
  rect(x + 8, y + cardHeight - 35, cardWidth - 16, 26, 9); // 繪製天氣圖片下方的放置格。
  noStroke(); // 回復不繪製外框的設定。
  const occupant = slots[index].occupant; // 取得目前答案格中的標籤編號。
  if (occupant >= 0) drawPlacedLabel(labels[occupant], x + 8, y + cardHeight - 35, cardWidth - 16, 26, index); // 繪製已放入答案格的名稱。
} // 結束 drawWeatherCard。

function drawWeatherImage(weather, x, y, imageW, imageH) { // 先顯示自繪 fallback，再以成功的靜態圖片覆蓋。
  push(); // 保存圖片區域的繪圖狀態。
  drawingContext.save(); // 保存 Canvas 原生繪圖狀態。
  drawingContext.beginPath(); // 開始建立圖片區域裁切路徑。
  drawingContext.roundRect(x, y, imageW, imageH, 12); // 建立圓角裁切區域。
  drawingContext.clip(); // 將 fallback 與圖片限制在卡片內。
  drawFallbackWeather(weather.scene, x, y, imageW, imageH); // 每一幀先繪製可見的自繪 fallback。
  if (weather.imageStatus === `loaded` && weather.image) { // 只有圖片成功載入後才覆蓋 fallback。
    imageMode(CORNER); // 將圖片模式設定為左上角對齊。
    image(weather.image, x, y, imageW, imageH); // 繪製成功載入的靜態圖片檔。
  } // 結束成功圖片覆蓋判斷。
  drawingContext.restore(); // 還原 Canvas 原生繪圖狀態。
  pop(); // 還原 p5.js 繪圖狀態。
} // 結束 drawWeatherImage。

function drawFallbackWeather(scene, x, y, w, h) { // 使用 p5.js 自行繪製各種天氣圖示。
  const time = millis() / 1000; // 取得 fallback 動畫時間。
  fill(scene === `moon` ? `#192752` : scene === `dust` ? `#d8aa72` : `#b9e3f2`); // 設定 fallback 天空底色。
  rect(x, y, w, h); // 繪製 fallback 天空背景。
  if (scene === `sunny`) drawSun(x + w * 0.5, y + h * 0.48, min(w, h) * 0.22); // 自繪晴天 fallback。
  if (scene === `cloudy` || scene === `overcast`) drawCloud(x + w * 0.5 + sin(time) * 10, y + h * 0.5, 0.55, scene === `overcast` ? color(105, 125, 145) : color(255, 255, 255, 210)); // 自繪雲朵 fallback。
  if (scene === `rain` || scene === `thunder`) { drawCloud(x + w * 0.5, y + h * 0.34, 0.5, color(100, 130, 150)); drawRain(time, scene === `thunder`); } // 自繪雨天 fallback。
  if (scene === `snow`) { drawCloud(x + w * 0.5, y + h * 0.28, 0.5, color(180, 200, 215)); drawSmallSnow(x, y, w, h, time); } // 自繪雪天 fallback。
  if (scene === `fog`) { fill(220, 240, 240, 125); ellipse(x + w * 0.5, y + h * 0.5, w * 0.95, h * 0.45); } // 自繪霧天 fallback。
  if (scene === `rainbow`) drawMiniRainbow(x + w * 0.5, y + h * 0.7, min(w, h)); // 自繪彩虹 fallback。
  if (scene === `dust`) { fill(120, 75, 45, 120); ellipse(x + w * 0.5, y + h * 0.55, w * 0.85, h * 0.4); } // 自繪沙塵 fallback。
  if (scene === `typhoon`) drawMiniTyphoon(x + w * 0.5, y + h * 0.5, time); // 自繪颱風 fallback。
  if (scene === `hail`) { drawCloud(x + w * 0.5, y + h * 0.28, 0.5, color(135, 150, 170)); drawMiniHail(x, y, w, h, time); } // 自繪冰雹 fallback。
  if (scene === `moon`) drawMiniMoon(x + w * 0.5, y + h * 0.42, min(w, h)); // 自繪月夜 fallback。
} // 結束 drawFallbackWeather。

function drawSmallSnow(x, y, w, h, time) { // 繪製卡片尺寸的雪花。
  fill(255, 255, 255, 220); // 設定雪花顏色。
  noStroke(); // 不繪製雪花外框。
  for (let i = 0; i < 18; i += 1) { // 繪製十八個卡片雪花。
    ellipse(x + (i * 29) % w, y + (i * 17 + time * 25) % h, 4, 4); // 繪製移動中的雪花。
  } // 結束卡片雪花迴圈。
} // 結束 drawSmallSnow。

function drawMiniRainbow(x, y, size) { // 繪製卡片尺寸的彩虹。
  noFill(); // 彩虹使用弧線。
  strokeWeight(8); // 設定彩虹弧線寬度。
  const colors = [`#ef767a`, `#f9c74f`, `#90be6d`, `#577590`]; // 設定彩虹色彩。
  for (let i = 0; i < colors.length; i += 1) { // 逐一繪製彩虹弧線。
    stroke(colors[i]); // 套用目前彩虹顏色。
    arc(x, y, size * 1.4 - i * 14, size * 1.4 - i * 14, PI, TWO_PI); // 繪製彩虹弧線。
  } // 結束彩虹迴圈。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawMiniRainbow。

function drawMiniTyphoon(x, y, time) { // 繪製卡片尺寸的颱風。
  noFill(); // 使用弧線表示旋轉氣流。
  stroke(240, 250, 255, 190); // 設定氣流顏色。
  strokeWeight(7); // 設定氣流寬度。
  for (let i = 0; i < 3; i += 1) arc(x, y, 28 + i * 22, 28 + i * 22, time + i, time + i + PI * 1.4); // 繪製旋轉氣流。
  noStroke(); // 回復不繪製外框的設定。
} // 結束 drawMiniTyphoon。

function drawMiniHail(x, y, w, h, time) { // 繪製卡片尺寸的冰雹。
  fill(235, 250, 255, 230); // 設定冰雹顏色。
  noStroke(); // 不繪製冰雹外框。
  for (let i = 0; i < 12; i += 1) ellipse(x + (i * 31) % w, y + (i * 23 + time * 80) % h, 7, 7); // 繪製移動冰雹。
} // 結束 drawMiniHail。

function drawMiniMoon(x, y, size) { // 繪製卡片尺寸的月夜。
  noStroke(); // 不繪製月亮外框。
  fill(255, 244, 183); // 設定月亮顏色。
  ellipse(x, y, size * 0.45, size * 0.45); // 繪製月亮本體。
  fill(25, 39, 82); // 設定月牙陰影顏色。
  ellipse(x + size * 0.1, y - size * 0.06, size * 0.43, size * 0.43); // 繪製月牙陰影。
} // 結束 drawMiniMoon。

function drawNamePool(layout) { // 繪製下方六個名稱標籤與提示文字。
  const labelTitleY = layout.labelStartY - 22; // 計算名稱區標題位置。
  fill(PANEL_COLOR); // 設定名稱區半透明面板顏色。
  const poolHeight = layout.labelHeight + 42; // 計算名稱區面板高度。
  rect(layout.side * 0.55, labelTitleY - 9, width - layout.side * 1.1, poolHeight, 18); // 繪製名稱區面板。
  fill(`#35596b`); // 設定名稱提示文字顏色。
  textAlign(LEFT, TOP); // 設定文字靠左靠上。
  textStyle(BOLD); // 設定名稱提示文字粗體。
  textSize(layout.mobile ? 14 : 17); // 設定名稱提示文字大小。
  text(`請拖曳名稱到上方對應格子：`, layout.side, labelTitleY); // 繪製名稱區提示。
  textStyle(NORMAL); // 恢復一般文字樣式。
  for (let i = 0; i < MAX_QUESTIONS; i += 1) { // 逐一繪製底部六個名稱位置。
    const position = getGridPosition(i, layout, layout.labelStartY, layout.labelHeight); // 計算名稱位置。
    const label = labels.find(item => item.location.type === `pool` && item.location.index === i); // 找出目前在該底部位置的標籤。
    if (label) drawPoolLabel(label, position.x, position.y, layout.cardWidth, layout.labelHeight); // 只繪製尚未放入答案格的標籤。
  } // 結束名稱標籤迴圈。
} // 結束 drawNamePool。

function drawPoolLabel(label, x, y, w, h) { // 繪製可以拖曳的底部名稱標籤。
  fill(`#fffdf7`); // 設定標籤背景色。
  stroke(`#668798`); // 設定標籤外框顏色。
  strokeWeight(2); // 設定標籤外框寬度。
  rect(x, y, w, h, 12); // 繪製標籤圓角外框。
  noStroke(); // 回復不繪製外框的設定。
  fill(`#294653`); // 設定標籤文字顏色。
  textAlign(CENTER, CENTER); // 設定標籤文字置中。
  textStyle(BOLD); // 設定標籤文字粗體。
  textSize(constrain(w * 0.16, 15, 23)); // 依標籤寬度調整文字大小。
  text(label.name, x + w / 2, y + h / 2); // 繪製天氣名稱。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束 drawPoolLabel。

function drawPlacedLabel(label, x, y, w, h, slotIndex) { // 繪製答案格裡的名稱並依狀態上色。
  let background = `#ffffff`; // 預設答案格名稱背景色。
  if (submitted || answerVisible) background = isCorrect(slotIndex) ? CORRECT_COLOR : WRONG_COLOR; // 只有查看答案或交卷後才顯示對錯色。
  fill(background); // 套用答案格名稱背景色。
  rect(x, y, w, h, 8); // 繪製答案格內的名稱背景。
  fill(`#294653`); // 設定答案格文字顏色。
  textAlign(CENTER, CENTER); // 設定答案格文字置中。
  textStyle(BOLD); // 設定答案格文字粗體。
  textSize(constrain(w * 0.15, 13, 21)); // 依答案格寬度調整文字大小。
  text(label.name, x + w / 2, y + h / 2); // 繪製答案格名稱。
  if (submitted || answerVisible) { // 查看答案或交卷後才繪製狀態符號。
    textAlign(RIGHT, CENTER); // 將狀態符號靠右對齊。
    textSize(16); // 設定狀態符號大小。
    text(isCorrect(slotIndex) ? `✓` : `✗`, x + w - 7, y + h / 2); // 繪製正確或錯誤符號。
  } // 結束狀態符號判斷。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束 drawPlacedLabel。

function drawStatus(layout) { // 繪製查看答案與交卷後的狀態文字。
  const y = height - 91; // 設定狀態訊息位於按鈕上方。
  textAlign(CENTER, CENTER); // 設定狀態文字置中。
  if (submitted) { // 交卷後顯示成績結果。
    fill(PANEL_COLOR); // 設定成績面板顏色。
    rect(width * 0.17, y - 22, width * 0.66, 42, 16); // 繪製成績訊息面板。
    fill(`#284b5c`); // 設定成績文字顏色。
    textStyle(BOLD); // 設定成績文字粗體。
    textSize(layout.mobile ? 13 : 18); // 依裝置設定成績字級。
    const result = `成績：${score} / ${MAX_QUESTIONS} 題　${percentage}%　用時：${formatTime(elapsedSeconds)}　${percentage > 60 ? `太棒了！` : `繼續努力！再挑戰一次就會更進步！`}`; // 建立成績與鼓勵文字。
    text(result, width / 2, y - 1, width * 0.62, 36); // 繪製成績結果文字。
    textStyle(NORMAL); // 恢復一般文字樣式。
  } else { // 尚未交卷時顯示計時與保密提示。
    fill(PANEL_COLOR); // 設定計時面板顏色。
    rect(width * 0.32, y - 20, width * 0.36, 36, 16); // 繪製計時面板。
    fill(`#35596b`); // 設定計時文字顏色。
    textStyle(BOLD); // 設定計時文字粗體。
    textSize(layout.mobile ? 12 : 16); // 依裝置設定計時字級。
    text(`用時：${formatTime(elapsedSeconds)}　拖曳完成後不會自動公布對錯`, width / 2, y - 1); // 繪製計時與保密提示。
    textStyle(NORMAL); // 恢復一般文字樣式。
  } // 結束狀態判斷。
} // 結束 drawStatus。

function drawDraggingLabel() { // 將正在拖曳的標籤繪製在所有內容最上層。
  if (draggingLabel < 0) return; // 沒有拖曳標籤時直接離開。
  const label = labels[draggingLabel]; // 取得正在拖曳的標籤。
  const layout = getLayout(); // 取得目前版面資料。
  const w = min(layout.cardWidth, 180); // 設定拖曳標籤寬度上限。
  const h = layout.labelHeight; // 取得拖曳標籤高度。
  push(); // 保存拖曳物件繪圖狀態。
  drawingContext.shadowColor = `rgba(0,0,0,0.3)`; // 設定拖曳物件陰影顏色。
  drawingContext.shadowBlur = 15; // 設定拖曳物件陰影模糊。
  fill(`#fffdf7`); // 設定拖曳標籤背景色。
  rect(dragPointerX - w / 2, dragPointerY - h / 2, w, h, 12); // 繪製跟隨指標的標籤。
  drawingContext.shadowBlur = 0; // 清除拖曳物件陰影設定。
  fill(`#294653`); // 設定拖曳標籤文字顏色。
  textAlign(CENTER, CENTER); // 設定拖曳標籤文字置中。
  textStyle(BOLD); // 設定拖曳標籤文字粗體。
  textSize(constrain(w * 0.15, 14, 22)); // 設定拖曳標籤文字大小。
  text(label.name, dragPointerX, dragPointerY); // 繪製拖曳中的名稱。
  textStyle(NORMAL); // 恢復一般文字樣式。
  pop(); // 還原拖曳物件繪圖狀態。
} // 結束 drawDraggingLabel。

function getGridPosition(index, layout, startY, itemHeight) { // 計算指定索引的網格座標。
  const column = index % layout.columns; // 計算目前項目所在欄位。
  const row = floor(index / layout.columns); // 計算目前項目所在列數。
  const x = layout.side + column * (layout.cardWidth + layout.gap); // 計算目前項目的 X 座標。
  const y = startY + row * (itemHeight + layout.gap); // 計算目前項目的 Y 座標。
  return { x, y }; // 回傳網格座標。
} // 結束 getGridPosition。

function findSlotAt(x, y) { // 找出游標目前是否位於某一個答案格。
  const layout = getLayout(); // 取得目前版面資料。
  for (let i = 0; i < MAX_QUESTIONS; i += 1) { // 逐一檢查六個答案格。
    const position = getGridPosition(i, layout, layout.cardStartY, layout.cardHeight); // 取得卡片位置。
    const slotY = position.y + layout.cardHeight - 35; // 計算答案格 Y 座標。
    if (x >= position.x && x <= position.x + layout.cardWidth && y >= slotY && y <= slotY + 26) return i; // 若游標在答案格內就回傳索引。
  } // 結束答案格檢查。
  return -1; // 沒有命中答案格時回傳負一。
} // 結束 findSlotAt。

function findLabelAt(x, y) { // 找出游標目前碰到的名稱標籤。
  const layout = getLayout(); // 取得目前版面資料。
  for (const label of labels) { // 逐一檢查所有名稱標籤。
    let position; // 宣告標籤位置變數。
    let itemHeight; // 宣告標籤高度變數。
    if (label.location.type === `pool`) { // 若標籤目前在下方名稱區。
      position = getGridPosition(label.location.index, layout, layout.labelStartY, layout.labelHeight); // 取得下方名稱位置。
      itemHeight = layout.labelHeight; // 設定下方名稱高度。
    } else { // 若標籤目前在上方答案格。
      const cardPosition = getGridPosition(label.location.index, layout, layout.cardStartY, layout.cardHeight); // 取得答案卡片位置。
      position = { x: cardPosition.x + 8, y: cardPosition.y + layout.cardHeight - 35 }; // 取得答案格內名稱位置。
      itemHeight = 26; // 設定答案格名稱高度。
    } // 結束位置判斷。
    if (x >= position.x && x <= position.x + layout.cardWidth && y >= position.y && y <= position.y + itemHeight) return label.id; // 若游標命中就回傳標籤編號。
  } // 結束標籤檢查。
  return -1; // 沒有命中名稱標籤時回傳負一。
} // 結束 findLabelAt。

function beginDrag(x, y) { // 開始處理滑鼠或觸控拖曳。
  if (submitted) return false; // 交卷後禁止再修改答案。
  const labelId = findLabelAt(x, y); // 找出被按住的名稱標籤。
  if (labelId < 0) return false; // 沒有按到名稱標籤時不開始拖曳。
  draggingLabel = labelId; // 記錄目前拖曳的標籤編號。
  const label = labels[draggingLabel]; // 取得被拖曳標籤資料。
  dragOrigin = { type: label.location.type, index: label.location.index }; // 保存拖曳起點。
  if (label.location.type === `slot`) slots[label.location.index].occupant = -1; // 從原答案格移除被拖曳標籤。
  label.location = { type: `dragging`, index: -1 }; // 將標籤標記為正在拖曳。
  dragPointerX = x; // 設定拖曳物件初始 X 座標。
  dragPointerY = y; // 設定拖曳物件初始 Y 座標。
  return false; // 阻止瀏覽器預設觸控行為。
} // 結束 beginDrag。

function continueDrag(x, y) { // 更新滑鼠或觸控拖曳中的名稱位置。
  if (draggingLabel < 0) return false; // 沒有拖曳時直接離開。
  dragPointerX = x; // 更新拖曳物件 X 座標。
  dragPointerY = y; // 更新拖曳物件 Y 座標。
  return false; // 阻止瀏覽器預設觸控行為。
} // 結束 continueDrag。

function finishDrag(x, y) { // 放開名稱後執行放置、交換或放回原處。
  if (draggingLabel < 0) return false; // 沒有拖曳時直接離開。
  const targetSlot = findSlotAt(x, y); // 找出放開位置是否為答案格。
  const label = labels[draggingLabel]; // 取得被放開的標籤。
  if (targetSlot >= 0) { // 若放開位置在有效答案格內。
    const oldOccupant = slots[targetSlot].occupant; // 保存目標格原本的標籤。
    slots[targetSlot].occupant = draggingLabel; // 將拖曳中的標籤放入目標格。
    label.location = { type: `slot`, index: targetSlot }; // 記錄拖曳標籤的新位置。
    if (oldOccupant >= 0 && oldOccupant !== draggingLabel) { // 若目標格原本已有另一個名稱。
      labels[oldOccupant].location = { type: dragOrigin.type, index: dragOrigin.index }; // 將原名稱放回拖曳起點，完成互換。
      if (dragOrigin.type === `slot`) slots[dragOrigin.index].occupant = oldOccupant; // 若起點是答案格就放入原名稱。
    } // 結束交換判斷。
  } else { // 若放開位置不是答案格就放回原處。
    label.location = { type: dragOrigin.type, index: dragOrigin.index }; // 將名稱恢復到拖曳起點。
    if (dragOrigin.type === `slot`) slots[dragOrigin.index].occupant = draggingLabel; // 若起點是答案格就恢復佔用狀態。
  } // 結束放置判斷。
  draggingLabel = -1; // 清除目前拖曳中的標籤。
  dragOrigin = null; // 清除拖曳起點。
  return false; // 阻止瀏覽器預設觸控行為。
} // 結束 finishDrag。

function mousePressed() { // 接收滑鼠按下事件。
  return beginDrag(mouseX, mouseY); // 將滑鼠座標交給共用拖曳函式。
} // 結束 mousePressed。

function mouseDragged() { // 接收滑鼠拖曳事件。
  return continueDrag(mouseX, mouseY); // 將滑鼠座標交給共用拖曳函式。
} // 結束 mouseDragged。

function mouseReleased() { // 接收滑鼠放開事件。
  return finishDrag(mouseX, mouseY); // 將滑鼠座標交給共用放置函式。
} // 結束 mouseReleased。

function touchStarted() { // 接收手機觸控開始事件。
  if (touches.length === 0) return false; // 沒有觸控點時直接離開。
  return beginDrag(touches[0].x, touches[0].y); // 使用第一個觸控點開始拖曳。
} // 結束 touchStarted。

function touchMoved() { // 接收手機觸控移動事件。
  if (touches.length === 0) return false; // 沒有觸控點時直接離開。
  return continueDrag(touches[0].x, touches[0].y); // 使用第一個觸控點更新拖曳。
} // 結束 touchMoved。

function touchEnded() { // 接收手機觸控結束事件。
  return finishDrag(dragPointerX, dragPointerY); // 使用最後記錄位置完成放置。
} // 結束 touchEnded。

function isCorrect(slotIndex) { // 判斷指定答案格是否正確。
  const occupant = slots[slotIndex].occupant; // 取得答案格中的名稱編號。
  return occupant >= 0 && labels[occupant].weatherId === slots[slotIndex].weatherId; // 比對名稱天氣編號與卡片天氣編號。
} // 結束 isCorrect。

function showAnswers() { // 顯示每個答案格的正確或錯誤狀態。
  if (submitted) return; // 交卷後已經保留結果，不重複處理。
  answerVisible = true; // 開啟答案格的正確或錯誤顏色。
  revealButton.html(`已顯示答案`); // 更新查看答案按鈕文字。
} // 結束 showAnswers。

function submitQuiz() { // 交卷並計算分數、百分比與用時。
  if (submitted) return; // 已交卷時不重複計算。
  submitted = true; // 鎖定答案避免交卷後修改。
  finishTime = millis(); // 記錄交卷時間。
  elapsedSeconds = floor((finishTime - startTime) / 1000); // 計算最後用時。
  score = slots.reduce((total, slot, index) => total + (isCorrect(index) ? 1 : 0), 0); // 統計答對題數。
  percentage = round(score / MAX_QUESTIONS * 100); // 計算四捨五入後的答對百分比。
  answerVisible = true; // 交卷後保留每題正確或錯誤顏色。
  submitButton.html(`已交卷`); // 更新交卷按鈕文字。
  if (percentage > 60) createConfetti(); // 嚴格高於百分之六十才建立彩帶。
} // 結束 submitQuiz。

function formatTime(seconds) { // 將秒數格式化成分鐘與秒數。
  const minutes = floor(seconds / 60); // 計算完整分鐘數。
  const remainder = seconds % 60; // 計算剩餘秒數。
  return `${nf(minutes, 2)}:${nf(remainder, 2)}`; // 回傳兩位數的時間字串。
} // 結束 formatTime。

function createConfetti() { // 建立交卷成功時的彩帶粒子。
  confetti = []; // 清空舊彩帶資料。
  for (let i = 0; i < 100; i += 1) { // 建立一百個彩帶粒子。
    confetti.push({ x: random(width), y: random(-height, 0), speed: random(1.5, 4.5), drift: random(-1.2, 1.2), size: random(5, 12), angle: random(TWO_PI), spin: random(-0.12, 0.12), color: random([`#ef767a`, `#f9c74f`, `#43aa8b`, `#577590`, `#9b5de5`]) }); // 儲存彩帶初始資料。
  } // 結束彩帶建立迴圈。
} // 結束 createConfetti。

function drawConfetti() { // 自行繪製並更新彩帶效果。
  push(); // 保存彩帶繪圖狀態。
  for (const piece of confetti) { // 逐一更新與繪製彩帶。
    piece.y += piece.speed; // 更新彩帶下落位置。
    piece.x += piece.drift + sin(piece.y * 0.02) * 0.5; // 更新彩帶左右飄動位置。
    piece.angle += piece.spin; // 更新彩帶旋轉角度。
    if (piece.y > height + 20) { piece.y = -20; piece.x = random(width); } // 超出畫面後從上方重新出現。
    translate(piece.x, piece.y); // 移動到目前彩帶位置。
    rotate(piece.angle); // 套用彩帶旋轉角度。
    fill(piece.color); // 套用彩帶個別顏色。
    rect(0, 0, piece.size, piece.size * 0.45, 2); // 繪製矩形彩帶。
    resetMatrix(); // 重設矩陣避免影響下一個彩帶。
  } // 結束彩帶迴圈。
  pop(); // 還原彩帶繪圖狀態。
} // 結束 drawConfetti。

function windowResized() { // 接收瀏覽器尺寸改變事件。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為最新全螢幕尺寸。
  layoutControls(); // 重新排列 p5.js DOM 按鈕。
} // 結束 windowResized。
