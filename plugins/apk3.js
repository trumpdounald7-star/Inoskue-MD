import axios from 'axios'

let handler = async (m, { conn, text, command }) => {

    if (!text) {
        return m.reply(`╔══════════════════╗\n║  📲 *APK Downloader*  ║\n╚══════════════════╝\n\n*الاستخدام:*\n.${command} اسم التطبيق\n\n*مثال:*\n.${command} Instagram\n.${command} WhatsApp\n.${command} TikTok`)
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

        const response = await axios.get(`https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`, { timeout: 15000 })
        const data = response.data

        if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply(`❌ *لم يتم العثور على تطبيق بهذا الاسم*\n\n🔍 جرب اسمًا آخر مثل:\n.${command} Instagram`)
        }

        const app = data.datalist.list[0]
        const sizeMB = (app.size / (1024 * 1024)).toFixed(2)
        const apkUrl = app.file?.path_alt || app.file?.path

        if (!apkUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply(`❌ *رابط التنزيل غير متاح لهذا التطبيق*`)
        }

        const caption = `╔══════════════════╗\n║  📲 *APK Downloader*  ║\n╚══════════════════╝\n\n📛 *الاسم:* ${app.name}\n📦 *الباقة:* ${app.package}\n🔢 *الإصدار:* ${app.file?.vername || 'غير معروف'}\n📅 *آخر تحديث:* ${app.updated || 'غير معروف'}\n📁 *الحجم:* ${sizeMB} MB\n⭐ *التقييم:* ${app.stats?.rating?.avg?.toFixed(1) || 'غير متاح'}/5\n\n> _تم التنزيل عبر Inoskue Bot_ 🤖`

        await conn.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } })

        await conn.sendMessage(m.chat, {
            document: { url: apkUrl },
            fileName: `${app.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: `📲 ${app.name}`,
                    body: `الحجم: ${sizeMB} MB | الإصدار: ${app.file?.vername || ''}`,
                    mediaType: 1,
                    sourceUrl: apkUrl,
                    thumbnailUrl: app.icon,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply(`❌ *حدث خطأ أثناء التنزيل*\n\n_${e.message}_\n\nجرب مرة أخرى لاحقًا.`)
    }
}

handler.help = ['apk3 <اسم التطبيق>']
handler.tags = ['downloader']
handler.command = /^(apk|3تطبيق)$/i
handler.limit = true
handler.args = true

export default handler
  
