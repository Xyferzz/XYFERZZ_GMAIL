import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res){

  try{

    const { username } = req.query;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if(error){
      return res.status(404).json({
        error:error.message
      });
    }

    return res.status(200).json(data);

  }catch(err){

    return res.status(500).json({
      error:err.message
    });

  }

}
