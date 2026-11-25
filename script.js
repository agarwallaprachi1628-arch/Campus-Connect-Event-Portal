// Initial sample events
const defaultEvents=[
{id:1,name:"AI & Machine Learning Workshop",category:"Workshop",date:"2026-11-25",venue:"University Auditorium",capacity:100,registered:25},
{id:2,name:"Coding Competition",category:"Technical",date:"2026-11-27",venue:"Computer Lab",capacity:80,registered:30},
{id:3,name:"Annual Cultural Fest",category:"Cultural",date:"2026-11-29",venue:"Open Air Theatre",capacity:200,registered:150},
{id:4,name:"Photography Contest",category:"Competition",date:"2026-12-02",venue:"Main Campus",capacity:50,registered:20},
{id:5,name:"Web Development Workshop",category:"Workshop",date:"2026-12-05",venue:"Innovation Lab",capacity:60,registered:15},
{id:6,name:"Hackathon 2026",category:"Technical",date:"2026-12-10",venue:"Block 34",capacity:100,registered:100}
];
let events=JSON.parse(localStorage.getItem("ccEvents"))||defaultEvents;
let registrations=JSON.parse(localStorage.getItem("ccRegistrations"))||[];
let selectedId=null;
const el=id=>document.getElementById(id);
function save(){localStorage.setItem("ccEvents",JSON.stringify(events));localStorage.setItem("ccRegistrations",JSON.stringify(registrations));}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const q=el("search").value.toLowerCase(),cat=el("category").value,list=el("eventList");list.innerHTML="";
 const filtered=events.filter(e=>e.name.toLowerCase().includes(q)&&(cat==="All"||e.category===cat));
 el("empty").classList.toggle("hidden",filtered.length>0);
 filtered.forEach(e=>{
  const seats=e.capacity-e.registered,card=document.createElement("article");card.className="event-card";
  card.innerHTML=`<span class="tag">${safe(e.category)}</span><h3>${safe(e.name)}</h3><p class="meta">▦ ${e.date}<br>⌖ ${safe(e.venue)}</p><p class="seats ${seats<=0?"full-seats":""}">${seats>0?seats+" seats available":"Fully booked"}</p><button class="btn" data-register="${e.id}" ${seats<=0?"disabled":""}>${seats>0?"Register now ↗":"Registration closed"}</button>`;
  list.appendChild(card);
 });
 el("eventCount").textContent=String(events.length).padStart(2,"0");
 el("seatCount").textContent=events.reduce((s,e)=>s+e.capacity-e.registered,0)+"+";
}
el("eventList").addEventListener("click",e=>{const b=e.target.closest("[data-register]");if(b)openRegistration(Number(b.dataset.register));});
el("search").addEventListener("input",render);el("category").addEventListener("change",render);
function openRegistration(id){const event=events.find(e=>e.id===id);if(!event||event.registered>=event.capacity){notify("This event is fully booked.");return;}selectedId=id;el("eventName").textContent=event.name+" · "+event.date;el("registerModal").classList.remove("hidden");}
el("registerForm").addEventListener("submit",e=>{
 e.preventDefault();const event=events.find(x=>x.id===selectedId);
 if(!event||event.registered>=event.capacity){notify("Registration is closed.");return;}
 const student={name:el("name").value.trim(),studentId:el("studentId").value.trim(),email:el("email").value.trim(),course:el("course").value.trim()};
 if(registrations.some(r=>r.eventId===selectedId&&r.studentId.toLowerCase()===student.studentId.toLowerCase())){notify("This student ID is already registered for this event.");return;}
 event.registered++;const code="CC"+Date.now().toString().slice(-8);registrations.push({...student,eventId:selectedId,code});save();
 el("ticket").innerHTML=`<b>CONFIRMATION ID:</b> ${code}<br><b>NAME:</b> ${safe(student.name)}<br><b>STUDENT ID:</b> ${safe(student.studentId)}<br><b>EVENT:</b> ${safe(event.name)}<br><b>DATE:</b> ${event.date}<br><b>VENUE:</b> ${safe(event.venue)}`;
 el("registerForm").reset();close("registerModal");el("confirmModal").classList.remove("hidden");render();
});
el("print").addEventListener("click",()=>window.print());
function adminRender(){
 const total=events.reduce((s,e)=>s+e.registered,0);
 el("adminStats").innerHTML=`<div><b>${events.length}</b>Total events</div><div><b>${total}</b>Registrations</div><div><b>${events.filter(e=>e.registered<e.capacity).length}</b>Open events</div>`;
 el("adminList").innerHTML=events.map(e=>`<div class="admin-row"><span><b>${safe(e.name)}</b><br>${e.registered}/${e.capacity} registered</span><button data-delete="${e.id}">Delete</button></div>`).join("");
}
function showAdmin(){adminRender();el("adminModal").classList.remove("hidden");}
el("adminBtn").addEventListener("click",showAdmin);el("dashboardBtn").addEventListener("click",showAdmin);
el("adminList").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;const id=Number(b.dataset.delete);events=events.filter(x=>x.id!==id);registrations=registrations.filter(x=>x.eventId!==id);save();adminRender();render();notify("Event deleted.");});
el("eventForm").addEventListener("submit",e=>{
 e.preventDefault();const capacity=Number(el("newCapacity").value);if(capacity<1)return;
 events.push({id:Date.now(),name:el("newName").value.trim(),category:el("newCategory").value,date:el("newDate").value,venue:el("newVenue").value.trim(),capacity,registered:0});
 save();el("eventForm").reset();adminRender();render();notify("Event added successfully.");
});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>close(b.dataset.close)));
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)o.classList.add("hidden");}));
function close(id){el(id).classList.add("hidden");}
let timer;function notify(message){const t=el("toast");t.textContent=message;t.classList.remove("hidden");clearTimeout(timer);timer=setTimeout(()=>t.classList.add("hidden"),2600);}
render();
