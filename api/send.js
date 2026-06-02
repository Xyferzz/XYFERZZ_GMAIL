import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    const {
      username,
      nama,
      wa,
      gmailList,
      totalGmail
    } = req.body;

    const { data, error } = await supabase
      .from('requests')
      .insert([
        {
          username,
          nama,
          wa,
          gmail_list: gmailList,
          status: 'pending',
          approved_count: 0
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const text = `📥 STORAN BARU

ID: ${data.id}

User: ${username}
Total Gmail: ${totalGmail}

All Gmail:

${gmailList}`;

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

    if (!result.ok) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      id: data.id
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
