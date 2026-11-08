// Client reviews shown on the site. Only real reviews from real clients, with their permission.
// Two ways to publish one:
//  1. Tick "Approve" on its row in the "Reviews" tab of the leads sheet (once lead-sheet.php is set up).
//  2. Or paste it here by hand, newest first, e.g.
//     { name: 'Jordan P.', role: 'Wholesaler, Houston', deal: 'Double Close', rating: 5, text: '…', date: '2026-11-08' },
export type Review = { name: string; role?: string; deal?: string; rating: number; text: string; date: string };

export const reviews: Review[] = [];
