/// Deal funding requests submitted from the calculator pages. Anyone can create one; only admins can read them.
migrate((app) => {
 const docs = ['application/pdf', 'image/png', 'image/jpeg'];
 app.save(new Collection({
  name: 'deal_requests', type: 'base', listRule: null, viewRule: null, createRule: '', updateRule: null, deleteRule: null,
  fields: [
   { name: 'method', type: 'select', values: ['stack', 'echo', 'double-close', 'emd', 'hard-money', 'dscr'], required: true, maxSelect: 1 },
   { name: 'first_name', type: 'text', required: true, max: 100 },
   { name: 'last_name', type: 'text', required: true, max: 100 },
   { name: 'email', type: 'email', required: true },
   { name: 'phone', type: 'text', required: true, max: 40 },
   { name: 'address', type: 'text', required: true, max: 300 },
   { name: 'city', type: 'text', required: true, max: 120 },
   { name: 'state', type: 'text', required: true, max: 2, pattern: '^[A-Z]{2}$' },
   { name: 'zip', type: 'text', required: true, max: 10, pattern: '^\\d{5}(-\\d{4})?$' },
   { name: 'close_date', type: 'date', required: true },
   { name: 'purchase_price', type: 'number', required: true, min: 1 },
   { name: 'seller_finance', type: 'number', min: 0 },
   { name: 'resale_price', type: 'number', min: 0 },
   { name: 'primary_loan', type: 'number', min: 0 },
   { name: 'requested_funding', type: 'number', required: true, min: 1 },
   { name: 'purchase_agreement', type: 'file', required: true, maxSelect: 1, maxSize: 5242880, mimeTypes: docs },
   { name: 'documents', type: 'file', maxSelect: 10, maxSize: 5242880, mimeTypes: docs },
   { name: 'description', type: 'text', max: 5000 },
   { name: 'referrer_first_name', type: 'text', max: 100 },
   { name: 'referrer_last_name', type: 'text', max: 100 },
   { name: 'referrer_email', type: 'email' },
   { name: 'referrer_phone', type: 'text', max: 40 },
   { name: 'consent', type: 'bool', required: true },
   { name: 'calculator', type: 'json', maxSize: 20000 },
   { name: 'created', type: 'autodate', onCreate: true },
   { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
  ],
 }));
}, (app) => { app.delete(app.findCollectionByNameOrId('deal_requests')); });
