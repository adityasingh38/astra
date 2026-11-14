// Supabase's project URL and publishable key are public client configuration.
const SUPABASE_URL = 'https://wdyeoeblzxcttxfelutg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HPxkmyojihfQhjJKgG7GWA_NcneLClJ';

document.getElementById('delete-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('status');
  const button = document.getElementById('submit');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  status.textContent = 'Checking your account…';
  button.disabled = true;
  try {
    const signIn = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }), cache: 'no-store'
    });
    const session = await signIn.json();
    if (!signIn.ok || !session.access_token) throw new Error('Sign-in failed. Check your email and password, or contact support.');
    const deletion = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_my_account`, {
      method: 'POST', headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: '{}', cache: 'no-store'
    });
    if (!deletion.ok) throw new Error('We could not delete the account. Please contact support.');
    document.getElementById('delete-form').reset();
    status.textContent = 'Your ASTRA account and saved data have been deleted.';
  } catch (error) {
    status.textContent = error.message || 'Something went wrong. Please contact support.';
  } finally {
    button.disabled = false;
    document.getElementById('password').value = '';
  }
});
