// Sign-in panel for /canvas.
//
// Deliberately not shown to visitors: the canvas is public to read, and a
// login form on a public page is just an invitation to burn the project's
// magic-link quota. It appears only at /canvas?edit — a bookmark for the
// owner, not a feature of the page.
import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/canvas-store';

type Props = {
  email: string | null;
  canEdit: boolean;
};

export default function CanvasSignIn({ email, canEdit }: Props) {
  const [address, setAddress] = useState('');
  const [state, setState] = useState<
    { status: 'idle' } | { status: 'sending' } | { status: 'sent' } | { status: 'error'; message: string }
  >({ status: 'idle' });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !address) return;

    setState({ status: 'sending' });
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: `${window.location.origin}/canvas?edit`,
        // Don't create accounts from this form. This is a courtesy, not the
        // control: the auth endpoint is public and anyone can post to it with
        // this flag flipped back on. The gate that actually holds is the
        // trigger on auth.users in 0003_restrict_signups.sql.
        shouldCreateUser: false,
      },
    });

    // Rate limiting is worth showing — the owner needs to know why no mail
    // arrived. Everything else collapses into one neutral message, because a
    // distinct error for a rejected address would turn this form into a way
    // to ask "who is allowed to edit this canvas?" and get an answer.
    if (error && error.status !== 429) {
      console.warn('[canvas] sign-in failed:', error.message);
    }
    setState(
      error && error.status === 429
        ? { status: 'error', message: error.message }
        : { status: 'sent' },
    );
  }

  if (email) {
    return (
      <div className="canvas-auth">
        <span>
          {canEdit
            ? `Editing as ${email}`
            : `${email} isn't on the editor allowlist`}
        </span>
        <button type="button" onClick={() => supabase?.auth.signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  if (state.status === 'sent') {
    return (
      <div className="canvas-auth">
        <span>If that address can edit this canvas, a link is on its way.</span>
      </div>
    );
  }

  return (
    <form className="canvas-auth" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <button type="submit" disabled={state.status === 'sending'}>
        {state.status === 'sending' ? 'Sending…' : 'Send link'}
      </button>
      {state.status === 'error' && <span>{state.message}</span>}
    </form>
  );
}
