import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const { username, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({
        error: 'Username atau password salah'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: data[0].id,
        username: data[0].username,
        saldo: data[0].saldo
      }
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
