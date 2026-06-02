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
      nominal,
      dana,
      nomor,
      atasNama
    } = req.body;

    const { data: user, error: userError } =
      await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (userError) {
      return res.status(500).json({
        error: userError.message
      });
    }

    if (Number(user.saldo) < Number(nominal)) {
      return res.status(400).json({
        error: 'Saldo tidak cukup'
      });
    }

    const { data, error } =
      await supabase
        .from('withdraws')
        .insert([
          {
            username,
            nominal,
            dana,
            nomor,
            atas_nama: atasNama,
            status: 'pending'
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

    const text = `💸 REQUEST WITHDRAW

ID: ${data.id}

User: ${username}

Nominal: Rp${Number(nominal).toLocaleString('id-ID')}

Metode: ${dana}

Nomor: ${nomor}

Atas Nama: ${atasNama}`;

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
      success: true
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
