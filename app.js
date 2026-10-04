const leads = [
  {id:'sample-1',name:'Paciente Demo 01',phone:'••• 418',time:'Hace 18 min',wait:18,need:'Terapia individual',status:'Sin responder',owner:'Sin asignar'},
  {id:'sample-2',name:'Paciente Demo 02',phone:'••• 207',time:'Hace 11 min',wait:11,need:'Terapia de pareja',status:'Sin responder',owner:'Sin asignar'},
  {id:'sample-3',name:'Paciente Demo 03',phone:'••• 635',time:'Hace 7 min',wait:7,need:'Terapia individual',status:'Sin responder',owner:'Equipo ATC'},
  {id:'sample-4',name:'Paciente Demo 04',phone:'••• 944',time:'Hace 23 min',need:'Orientación psicológica',status:'En conversación',owner:'Equipo ATC'},
  {id:'sample-5',name:'Paciente Demo 05',phone:'••• 572',time:'Hoy 12:08',need:'Terapia individual',status:'Pendiente de pago',owner:'Equipo ATC'},
  {id:'sample-6',name:'Paciente Demo 06',phone:'••• 319',time:'Hoy 11:42',need:'Terapia de pareja',status:'Agendado',owner:'Sistema'},
  {id:'sample-7',name:'Paciente Demo 07',phone:'••• 804',time:'Hoy 10:51',need:'Terapia individual',status:'Agendado',owner:'Sistema'},
  {id:'sample-8',name:'Paciente Demo 08',phone:'••• 126',time:'Hoy 09:36',need:'Orientación psicológica',status:'En conversación',owner:'Equipo ATC'}
];
const sessions = [
  {id:'DEMO-001',time:'14:00',psychologist:'Profesional 01',status:'Meet listo'},
  {id:'DEMO-002',time:'15:00',psychologist:'Profesional 02',status:'Confirmada'},
  {id:'DEMO-003',time:'16:00',psychologist:'Profesional 03',status:'Falta pago'},
  {id:'DEMO-004',time:'17:00',psychologist:'Profesional 04',status:'Meet listo'}
];
const $ = selector => document.querySelector(selector);
const table=$('#lead-table'), search=$('#search-input'), statusFilter=$('#status-filter');
const patientDialog=$('#patient-dialog'), form=$('#patient-form'), toast=$('#toast');
const chatDialog=$('#chat-dialog'), chatLog=$('#chat-log'), chatComposer=$('#chat-composer');
const detailDialog=$('#detail-dialog');
const statuses=['Sin responder','En conversación','Pendiente de pago','Agendado'];
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const statusClass = status => ({'Sin responder':'unanswered','En conversación':'chatting','Pendiente de pago':'payment','Agendado':'booked'}[status] || 'chatting');
const initials = name => name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const validPhone = value => /^(?:9\d{8}|519\d{8}|\d{10,15})$/.test(value.replace(/\D/g,''));
let toastTimer;
function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);}
function renderLeads(){
  const term=normalize(search.value.trim());
  const visible=leads.filter(lead=>(statusFilter.value==='all'||lead.status===statusFilter.value)&&normalize(`${lead.name} ${lead.need} ${lead.owner} ${lead.channel||'WhatsApp'}`).includes(term));
  table.innerHTML=visible.map(lead=>`<tr><td><div class="patient-cell"><span class="initials">${escapeHTML(initials(lead.name))}</span><span><strong>${escapeHTML(lead.name)}</strong><small>${escapeHTML(lead.phone)}</small></span></div></td><td><strong>${escapeHTML(lead.time)}</strong><small>${escapeHTML(lead.channel||'WhatsApp')}</small></td><td>${escapeHTML(lead.need)}</td><td><span class="status ${statusClass(lead.status)}">${escapeHTML(lead.status)}</span></td><td>${escapeHTML(lead.owner)}</td><td><button class="row-action ${lead.status==='Sin responder'?'':'secondary-action'}" data-action="${lead.status==='Sin responder'?'answer':'view'}" data-id="${escapeHTML(lead.id)}">${lead.status==='Sin responder'?'Atender':'Ver ficha'}</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">No hay prospectos con estos filtros. Prueba otra búsqueda.</td></tr>';
  const pending=leads.filter(lead=>lead.status==='Sin responder');
  $('#results-count').textContent=`${visible.length} de ${leads.length} prospectos`;
  $('#lead-count-badge').textContent=pending.length;
  $('#pending-count').textContent=pending.length;
  $('#all-count').textContent=leads.length;
  $('#total-leads').textContent=leads.length;
  $('#attention-summary').textContent=pending.length?`${pending.length} ${pending.length===1?'conversación espera':'conversaciones esperan'} una respuesta`:'Tu bandeja está al día';
  const longest=pending.length?Math.max(...pending.map(lead=>lead.wait||0)):0;
  $('#attention-detail').textContent=pending.length?(longest?`La más antigua lleva ${longest} minutos en espera.`:'Hay una nueva solicitud lista para atender.'):'Todas las solicitudes tienen seguimiento.';
  $('.alert-strip').classList.toggle('clear',!pending.length);
  $('#review-pending').hidden=!pending.length;
  document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===statusFilter.value;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
function resetFilters(){search.value='';statusFilter.value='all';renderLeads();}
function addLead(data){const digits=data.phone.replace(/\D/g,'');leads.unshift({id:crypto.randomUUID(),name:data.name,phone:`••• ${digits.slice(-3)}`,need:data.need,channel:data.channel,schedule:data.schedule||'Por definir',time:'Ahora',wait:0,status:'Sin responder',owner:'Sin asignar'});resetFilters();}
search.addEventListener('input',renderLeads);
statusFilter.addEventListener('change',renderLeads);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{statusFilter.value=button.dataset.filter;renderLeads();}));
$('#reset-filters').addEventListener('click',resetFilters);
$('#review-pending').addEventListener('click',()=>{search.value='';statusFilter.value='Sin responder';renderLeads();});
function openDetail(title,eyebrow,content){$('#detail-title').textContent=title;$('#detail-eyebrow').textContent=eyebrow;$('#detail-content').innerHTML=content;detailDialog.showModal();}
const field=(label,value)=>`<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`;
function showLead(lead){
  openDetail(lead.name,'FICHA DEL PROSPECTO',`<dl class="detail-grid">${field('WhatsApp',lead.phone)}${field('Canal',lead.channel||'WhatsApp')}${field('Tipo de atención',lead.need)}${field('Horario preferido',lead.schedule||'Por definir')}${field('Estado',lead.status)}${field('Responsable',lead.owner)}</dl><p class="detail-note">Información de demostración. El contacto con el paciente estará disponible al conectar WhatsApp.</p><form id="lead-update-form" data-id="${escapeHTML(lead.id)}"><div class="form-grid"><label>Estado<select name="status">${statuses.map(status=>`<option${lead.status===status?' selected':''}>${escapeHTML(status)}</option>`).join('')}</select></label><label>Responsable<select name="owner">${['Sin asignar','Equipo ATC','Sistema'].map(owner=>`<option${lead.owner===owner?' selected':''}>${escapeHTML(owner)}</option>`).join('')}</select></label></div><button class="btn primary" type="submit">Guardar cambios</button></form>`);
}
table.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;const lead=leads.find(item=>item.id===button.dataset.id);if(!lead)return;if(button.dataset.action==='answer'){lead.status='En conversación';lead.owner='Equipo ATC';renderLeads();showToast('Prospecto asignado a Equipo ATC');}showLead(lead);});
$('#detail-content').addEventListener('submit',event=>{if(event.target.id!=='lead-update-form')return;event.preventDefault();const lead=leads.find(item=>item.id===event.target.dataset.id);if(!lead)return;const data=new FormData(event.target);if(!statuses.includes(data.get('status')))return;lead.status=data.get('status');lead.owner=data.get('owner');renderLeads();detailDialog.close();showToast('Ficha actualizada en esta demostración');});
document.querySelectorAll('[data-open-modal]').forEach(button=>button.addEventListener('click',()=>patientDialog.showModal()));
document.querySelectorAll('[data-close-patient]').forEach(button=>button.addEventListener('click',()=>patientDialog.close()));
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const name=String(data.get('name')).trim();const phone=String(data.get('phone'));if(!name){showToast('Ingresa el nombre del paciente');return;}if(!validPhone(phone)){showToast('Ingresa un WhatsApp válido, con código de país si corresponde');return;}addLead({name,phone,need:data.get('need'),channel:data.get('channel')});form.reset();patientDialog.close();showToast('Prospecto añadido a la bandeja');});
$('#copy-link-btn').addEventListener('click',async()=>{const link=`${location.origin}${location.pathname}#registro`;try{await navigator.clipboard.writeText(link);showToast('Enlace al chatbot copiado');}catch{openDetail('Enlace de autorregistro','ASISTENTE RENACER',`<p class="detail-note">Copia este enlace para abrir el chatbot en esta demostración. La demo es pública: utiliza únicamente datos ficticios.</p><div class="form-grid"><label class="full">Enlace<input readonly value="${escapeHTML(link)}" aria-label="Enlace de autorregistro"></label></div>`);}});
document.querySelectorAll('[data-session]').forEach(button=>button.addEventListener('click',()=>{const session=sessions.find(item=>item.id===button.dataset.session);openDetail(session.id,'SESIÓN DE EJEMPLO',`<dl class="detail-grid">${field('Fecha','3 de octubre de 2026')}${field('Hora',`${session.time} · Lima`)}${field('Psicólogo',`Ps. ${session.psychologist}`)}${field('Estado',session.status)}${field('Duración de ejemplo','50 minutos')}${field('Atención','Consulta individual')}</dl><p class="detail-note">Esta es una sesión ilustrativa. Google Calendar y los enlaces reales de Meet están pendientes de conexión.</p>`);}));
$('#agenda-btn').addEventListener('click',()=>openDetail('Agenda del día','SÁBADO, 3 DE OCTUBRE',`<p class="detail-note">Vista de las cuatro próximas sesiones de ejemplo. La agenda completa se mostrará al conectar los datos reales.</p><ol class="agenda-list">${sessions.map(session=>`<li><strong>${session.time} · Ps. ${escapeHTML(session.psychologist)}</strong><small>${session.id} · ${session.status}</small></li>`).join('')}</ol>`));
document.querySelector('[data-close-detail]').addEventListener('click',()=>detailDialog.close());
for(const modal of [patientDialog,chatDialog,detailDialog])modal.addEventListener('click',event=>{const r=modal.getBoundingClientRect();if(event.target===modal&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))modal.close();});
const intake={step:0,service:'',schedule:'',name:'',phone:'',complete:false,started:false};
function updateProgress(){const current=intake.step===3?2:intake.step;document.querySelectorAll('[data-chat-step]').forEach(step=>{const value=Number(step.dataset.chatStep);step.classList.toggle('current',value===current&&!intake.complete);step.classList.toggle('done',value<current||intake.complete);});}
function addMessage(text,sender='bot'){const message=document.createElement('div');message.className=`chat-message ${sender}`;message.textContent=text;chatLog.appendChild(message);chatLog.scrollTop=chatLog.scrollHeight;}
function quickReplies(options){chatComposer.innerHTML=`<div class="quick-replies">${options.map(option=>`<button class="quick-reply" type="button" data-chat-value="${escapeHTML(option.value)}">${escapeHTML(option.label)}</button>`).join('')}</div>`;}
function textInput(label,type='text'){chatComposer.innerHTML=`<form class="chat-input-row" id="chat-input-form"><input aria-label="${escapeHTML(label)}" type="${type}" ${type==='tel'?'inputmode="tel" maxlength="24"':'maxlength="60"'} autocomplete="off" required placeholder="${escapeHTML(label)}"><button type="submit">Enviar</button></form>`;chatComposer.querySelector('input').focus();}
function showConsent(){chatComposer.innerHTML=`<div class="consent-box"><div class="consent-summary"><strong>${escapeHTML(intake.name)}</strong><span>${escapeHTML(intake.service)} · ${escapeHTML(intake.schedule)}</span><span>WhatsApp terminado en ${intake.phone.replace(/\D/g,'').slice(-3)}</span></div><label><input id="chat-consent" type="checkbox"><span>Acepto que Renacer use estos datos para contactarme y coordinar una atención.</span></label><button class="btn primary" id="confirm-intake" type="button" disabled>Enviar solicitud</button></div>`;}
function startChat(){Object.assign(intake,{step:0,service:'',schedule:'',name:'',phone:'',complete:false,started:true});chatLog.innerHTML='';addMessage('Hola, soy el asistente de Renacer. Te ayudo a coordinar una consulta virtual.');addMessage('¿Qué tipo de atención buscas?');quickReplies([{label:'Terapia individual · S/ 30',value:'Terapia individual'},{label:'Terapia de pareja',value:'Terapia de pareja'},{label:'Orientación psicológica',value:'Orientación psicológica'}]);updateProgress();}
function continueChat(value){if(intake.step===0){intake.service=value;addMessage(value,'user');intake.step=1;addMessage('¿En qué horario sueles tener disponibilidad?');quickReplies([{label:'Mañana',value:'Mañana'},{label:'Tarde',value:'Tarde'},{label:'Noche',value:'Noche'},{label:'Horario flexible',value:'Flexible'}]);}else if(intake.step===1){intake.schedule=value;addMessage(value,'user');intake.step=2;addMessage('¿Cómo te llamas? Puedes indicar solo tu primer nombre.');textInput('Tu nombre');}updateProgress();}
chatComposer.addEventListener('change',event=>{if(event.target.id==='chat-consent')$('#confirm-intake').disabled=!event.target.checked;});
chatComposer.addEventListener('click',event=>{const reply=event.target.closest('[data-chat-value]');if(reply){continueChat(reply.dataset.chatValue);return;}if(event.target.closest('[data-view-leads]')){chatDialog.close();resetFilters();$('#prospectos').scrollIntoView({behavior:'smooth',block:'start'});return;}if(event.target.id==='confirm-intake'){if(!$('#chat-consent')?.checked||intake.complete)return;intake.complete=true;addLead({name:intake.name,phone:intake.phone,need:intake.service,schedule:intake.schedule,channel:'Chatbot web'});intake.phone='';addMessage('Autorizo el contacto para coordinar la atención.','user');addMessage(`Gracias, ${intake.name}. Tu solicitud de ${intake.service.toLowerCase()} en horario ${intake.schedule.toLowerCase()} ya aparece en la bandeja del equipo.`);chatComposer.innerHTML='<div class="chat-success"><strong>Solicitud registrada</strong><br>Registro de prueba creado. Al recargar se reiniciará.<button class="btn secondary" type="button" data-view-leads>Ver en la bandeja</button></div>';updateProgress();showToast('Nueva solicitud recibida desde el chatbot');}});
chatComposer.addEventListener('submit',event=>{if(event.target.id!=='chat-input-form')return;event.preventDefault();const value=event.target.querySelector('input').value.trim();if(!value)return;if(intake.step===2){intake.name=value;addMessage(value,'user');intake.step=3;addMessage('¿A qué número podemos escribirte por WhatsApp?');textInput('Número de WhatsApp','tel');}else if(intake.step===3){if(!validPhone(value)){showToast('Ingresa un WhatsApp válido, con código de país si corresponde');return;}intake.phone=value;addMessage(`Número terminado en ${value.replace(/\D/g,'').slice(-3)}`,'user');intake.step=4;addMessage('Confirma tus datos y autoriza al equipo a contactarte.');showConsent();}updateProgress();});
document.querySelectorAll('[data-open-chat]').forEach(button=>button.addEventListener('click',()=>{chatDialog.showModal();if(!intake.started||intake.complete||button.dataset.initialService)startChat();if(button.dataset.initialService)continueChat(button.dataset.initialService);}));
document.querySelector('[data-close-chat]').addEventListener('click',()=>chatDialog.close());
function syncNavigation(){const hash=location.hash==='#registro'?'#chatbot':location.hash||'#inicio';document.querySelectorAll('.nav-item').forEach(link=>{link.setAttribute('aria-label',link.querySelector('span').textContent);const active=link.getAttribute('href')===hash;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
window.addEventListener('hashchange',syncNavigation);
const weeklyActivity=[['Dom 27',23,9],['Lun 28',27,13],['Mar 29',25,12],['Mié 30',30,15],['Jue 01',34,18],['Vie 02',38,21],['Hoy 03',27,9]];
$('.chart-summary>strong').innerHTML=`${weeklyActivity.reduce((total,day)=>total+day[1],0)} <span>conversaciones</span>`;
$('.chart').innerHTML=weeklyActivity.map(([day,conversations,bookings],index)=>`<div class="bar-group${index===6?' current':''}"><div><i class="bar leads" style="--height:${conversations/40*100}%" title="${conversations} conversaciones"></i><i class="bar bookings" style="--height:${bookings/40*100}%" title="${bookings} citas"></i></div><span>${day}</span></div>`).join('');
$('.chart').setAttribute('aria-label','Datos ilustrativos: '+weeklyActivity.map(([day,conversations,bookings])=>`${day}: ${conversations} conversaciones y ${bookings} citas`).join('; '));
renderLeads();syncNavigation();
if(location.hash==='#registro'){chatDialog.showModal();startChat();}
