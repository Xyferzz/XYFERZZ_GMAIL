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

    const {
      password,
      requestId,
      approvedCount
    } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        error: 'Password admin salah'
      });
    }

    const { data: requestData, error: reqError } =
      await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (reqError || !requestData) {
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

    if (userError || !userData) {
      return res.status(404).json({
        error: 'User tidak ditemukan'
      });
    }

    await supabase
      .from('users')
      .update({
        saldo:
          Number(userData.saldo) +
          tambahanSaldo
      })
      .eq('username', requestData.username);

    await supabase
      .from('requests')
      .update({
        status: 'approved',
        approved_count: approvedCount
      })
      .eq('id', requestId);

    return res.status(200).json({
      success: true,
      username: requestData.username,
      saldoTambah: tambahanSaldo
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
