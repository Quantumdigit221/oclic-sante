/**
 * Simplifie le modal d'impression ticket dans le bundle React compilé.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(__dirname, '../public/assets/index-DP7UrmF2.js');

const OLD_START = 'children:[h.jsxs("div",{className:"text-center border-b-2 border-dashed border-black pb-4 mb-4"';
const OLD_END = 'Conservez ce ticket pour votre dossier."})]})]})]})}),h.jsxs("div",{className:"p-4 bg-white border-t border-slate-100 flex gap-3 no-print"';

const NEW_BODY = `children:[h.jsxs("div",{className:"text-center border-b-2 border-black pb-4 mb-4",children:[h.jsx("div",{className:"font-black text-xl uppercase leading-tight text-black",children:null==m?void 0:m.name}),h.jsxs("div",{className:"text-xs font-medium text-black mt-2",children:["DATE: ",Kr(v.createdAt,"dd/MM/yyyy HH:mm")]})]}),h.jsxs("div",{className:"mb-4",children:[h.jsx("div",{className:"text-[10px] font-bold uppercase text-black",children:"Patient :"}),h.jsx("div",{className:"text-lg font-black uppercase text-black",children:v.patientName})]}),h.jsxs("div",{className:"border-t border-b-2 border-black py-4 mb-4",children:[h.jsx("div",{className:"font-black text-xs mb-3 underline uppercase",children:"Prestations :"}),h.jsx("div",{className:"space-y-3",children:Array.isArray(v.services)&&v.services.length>0?v.services.map((e,t)=>h.jsxs("div",{className:"flex justify-between items-start gap-4",children:[h.jsx("span",{className:"flex-1 font-bold leading-tight",children:e.name}),h.jsx("span",{className:"font-black whitespace-nowrap",children:q(parseFloat(String(e.price||e.amount||0)))})]},t)):h.jsxs("div",{className:"flex justify-between items-start gap-4",children:[h.jsx("span",{className:"flex-1 font-bold leading-tight",children:v.serviceName}),h.jsx("span",{className:"font-black",children:q(v.amount||0)})]})})]}),h.jsxs("div",{className:"space-y-3",children:[h.jsxs("div",{className:"flex justify-between items-center text-black",children:[h.jsx("span",{className:"font-black text-xs",children:"TOTAL À PAYER :"}),h.jsx("span",{className:"text-xl font-black",children:q(v.amount||0)})]}),h.jsxs("div",{className:"flex justify-between items-center border-t-4 border-double border-black pt-3 text-black",children:[h.jsx("span",{className:"font-black text-xs",children:"MONTANT PAYÉ :"}),h.jsx("span",{className:"text-xl font-black",children:q(v.amount||0)})]})]})]})}),h.jsxs("div",{className:"p-4 bg-white border-t border-slate-100 flex gap-3 no-print"`;

let content = fs.readFileSync(bundlePath, 'utf8');
const startIdx = content.indexOf(OLD_START);
const endIdx = content.indexOf(OLD_END);

if (startIdx < 0 || endIdx < 0) {
  console.error('Patch markers not found. Bundle may already be patched or changed.');
  process.exit(1);
}

const before = content.slice(0, startIdx);
const after = content.slice(endIdx + OLD_END.length);
content = before + NEW_BODY + after;

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Ticket print template patched successfully in index-DP7UrmF2.js');
