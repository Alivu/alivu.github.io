
// api/telegram.js
export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Получаем токены из переменных окружения Vercel
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        // Форматируем сообщение
        const telegramMessage = `
📊 <b>Новый расчет освещения</b>

${message}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
📱 <b>Телефон:</b> +7 (963) 598-48-46
        `.trim();
        
        // Отправляем в Telegram
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: telegramMessage,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
        
        const data = await response.json();
        
        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ 
                error: 'Failed to send to Telegram',
                details: data.description 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            message: 'Notification sent successfully',
            message_id: data.result.message_id
        });
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
