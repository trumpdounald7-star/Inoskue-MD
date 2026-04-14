import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    let msg = `*🤖 Inoskue Bot - تقرير الطقس*\n\n🌍 *مثال*:\n${usedPrefix}${command} الدار البيضاء\n${usedPrefix}${command} London`
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
    return
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🌡️', key: m.key } })

    let geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=ar&format=json`
    let geoRes = await axios.get(geocodeUrl)
    let geoData = geoRes.data

    if (!geoData.results || geoData.results.length === 0) {
      await conn.sendMessage(m.chat, { text: '❌ *عذراً، لم يتم العثور على المدينة.*\n🔁 تأكد من الاسم وحاول مرة أخرى.' }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } })
      return
    }

    let location = geoData.results[0]
    let { name, country, latitude, longitude } = location

    let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
    let weatherRes = await axios.get(weatherUrl)
    let weatherData = weatherRes.data

    let current = weatherData.current_weather
    let temp = current.temperature
    let windSpeed = current.windspeed
    let weatherCode = current.weathercode
    
    let weatherCondition = getWeatherCondition(weatherCode)
    let weatherEmoji = getWeatherEmoji(weatherCode)
    
    let humidityIndex = new Date().getHours()
    let humidity = weatherData.hourly.relativehumidity_2m[humidityIndex]

    let windDirection = getWindDirection(current.winddirection)

    let report = `
╭━━━━━━━━━━━━━━━━━━━═
┃ ${weatherEmoji}✨ *Inoskue Weather* ✨${weatherEmoji}
╰━━━━━━━━━━━━━━━━━━━╌

🌍 *الموقع*: ${name}, ${country}
🌡️ *درجة الحرارة*: ${temp}°C
☁️ *الحالة*: ${weatherCondition}
💧 *الرطوبة*: ${humidity}%
💨 *الرياح*: ${windSpeed} كم/س ${windDirection}

🕒 *آخر تحديث*: ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
    `.trim()

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.sendMessage(m.chat, { text: report }, { quoted: m })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: `*🤖 عذراً، حدث خطأ:*\n${error.message}` }, { quoted: m })
  }
}

function getWeatherCondition(code) {
  const conditions = {
    0: '☀️ صافي',
    1: '🌤️ غالباً صافي', 2: '⛅ غائم جزئياً', 3: '☁️ غائم',
    45: '🌫️ ضباب', 48: '🌫️ ضباب متجمد',
    51: '🌦️ رذاذ خفيف', 53: '🌦️ رذاذ', 55: '🌧️ رذاذ كثيف',
    56: '🌨️ رذاذ متجمد', 57: '🌨️ رذاذ متجمد كثيف',
    61: '🌧️ مطر خفيف', 63: '🌧️ مطر', 65: '🌧️ مطر غزير',
    66: '🌨️ مطر متجمد', 67: '🌨️ مطر متجمد غزير',
    71: '❄️ ثلج خفيف', 73: '❄️ ثلج', 75: '❄️ ثلج كثيف',
    77: '🌨️ حبيبات ثلجية',
    80: '🌦️ زخات مطر خفيفة', 81: '🌦️ زخات مطر', 82: '🌧️ زخات مطر عنيفة',
    85: '🌨️ زخات ثلج خفيفة', 86: '🌨️ زخات ثلج عنيفة',
    95: '⛈️ عاصفة رعدية', 96: '⛈️ عاصفة رعدية مع برد', 99: '⛈️ عاصفة رعدية عنيفة مع برد'
  }
  return conditions[code] || '❓ غير معروف'
}

function getWeatherEmoji(code) {
  const emojis = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️', 56: '🌨️', 57: '🌨️',
    61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌨️', 67: '🌨️',
    71: '❄️', 73: '❄️', 75: '❄️', 77: '🌨️',
    80: '🌦️', 81: '🌦️', 82: '🌧️',
    85: '🌨️', 86: '🌨️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  }
  return emojis[code] || '🌍'
}

function getWindDirection(degrees) {
  const directions = ['⬆️ شمال', '↗️ شمال شرقي', '➡️ شرق', '↘️ جنوب شرقي', '⬇️ جنوب', '↙️ جنوب غربي', '⬅️ غرب', '↖️ شمال غربي']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

handler.help = ['طقس']
handler.command = ['طقس', 'weather']
handler.tags = ['tools']
handler.limit = 1

export default handler