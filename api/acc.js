import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const HARGA = 3500;

export default async function handler(req, res) {

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    console.log('BODY:', req.body);

    const {
      password,
      requestId,
      approvedCount
    } = req.body;

    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({
        error: 'ADMIN_PASSWORD belum ada di Vercel'
      });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        error: 'Password admin salah'
      });
    }

    const { data: requestData, error: reqError } =
      await supabase
        .from('requests')
        .select('*')
        .eq('id', Number(requestId))
        .single();

    if (reqError) {
      return res.status(500).json({
        error: reqError.message
      });
    }

    if (!requestData) {
      return res.status(404).json({
        error: 'Request tidak ditemukan'
      });
    }

    const tambahanSaldo =
      Number(approvedCount) * HARGA;

    const { data: userData, error: userError } =
      await supabase
        .from('users')
        .select('*')
        .eq('username', requestData.username)
        .single();

    if (userError) {
      return res.status(500).json({
        error: userError.message
      });
    }

    const saldoBaru =
      Number(userData.saldo || 0) +
      tambahanSaldo;

    const { error: saldoError } =
      await supabase
        .from('users')
        .update({
          saldo: saldoBaru
        })
        .eq('username', requestData.username);

    if (saldoError) {
      return res.status(500).json({
        error: saldoError.message
      });
    }

    const { error: updateError } =
      await supabase
        .from('requests')
        .update({
          status: 'approved',
          approved_count: Number(approvedCount)
        })
        .eq('id', Number(requestId));

    if (updateError) {
      return res.status(500).json({
        error: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      username: requestData.username,
      saldoTambah: tambahanSaldo,
      saldoBaru
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
