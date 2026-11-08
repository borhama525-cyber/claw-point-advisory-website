/**
 * Sends a website form to `/send.php` (public/send.php), which emails it to the team.
 * Throws on failure so `useFormSubmission` shows its error message.
 */
export async function sendForm(form: 'deal' | 'enquiry' | 'newsletter' | 'network', data: FormData) {
	data.set('form', form);
	const res = await fetch('/send.php', { method: 'POST', body: data });
	const result = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
	if (!res.ok || !result?.ok) throw new Error(result?.error ?? 'The form could not be sent.');
	return result;
}
