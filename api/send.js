export default async function handler(req, res) {

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    console.log("BOT:", BOT_TOKEN ? "ADA" : "KOSONG");
    console.log("CHAT:", CHAT_ID);

    const d = req.body;

    const text = `📥 STORAN BARU

👤 Nama : ${d.nama}
🎯 Penerima : ${d.penerima}
💳 Dana : ${d.dana}
📱 WhatsApp : ${d.wa}

📦 Total Gmail : ${d.totalGmail}
💵 Total Harga : Rp${d.totalHarga}

📧 Gmail :
${d.gmailList}`;

    const telegram = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text
        })
      }
    );

    const result = await telegram.json();

    console.log("TELEGRAM:", result);

    if (!result.ok) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }
}
