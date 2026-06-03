import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let body = req.body;

    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const {
      username,
      nominal,
      dana,
      nomor,
      atasNama
    } = body;

    // ambil user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const saldo = Number(user.saldo);
    const wd = Number(nominal);

    if (saldo < wd) {
      return res.status(400).json({ error: 'Saldo tidak cukup' });
    }

    // 🔥 POTONG SALDO DI SINI (INI YANG LU LUPA)
    const { error: updateError } = await supabase
      .from('users')
      .update({ saldo: saldo - wd })
      .eq('username', username);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // simpan request WD
    const { data, error: wdError } = await supabase
      .from('withdraws')
      .insert([{
        username,
        nominal: wd,
        dana,
        nomor,
        atas_nama: atasNama,
        status: 'pending'
      }])
      .select()
      .single();

    if (wdError) {
      return res.status(500).json({ error: wdError.message });
    }

    // kirim ke telegram
    const text = `
💸 WITHDRAW REQUEST

User: ${username}
Nominal: Rp${wd.toLocaleString('id-ID')}
Metode: ${dana}
Nomor: ${nomor}
Atas Nama: ${atasNama}
`;

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text
      })
    });

    return res.json({ success:true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
