
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkColumns() {
  try {
    const { data, error } = await supabase.from('sales').select('*').limit(1)
    if (error) {
      console.error('Error fetching sales:', error.message)
      return
    }
    const cols = Object.keys(data[0] || {})
    console.log('Columns in sales table:', cols)
    console.log('Has gst_percent?', cols.includes('gst_percent'))
  } catch (err) {
    console.error('Unexpected error:', err.message)
  }
}

checkColumns()
