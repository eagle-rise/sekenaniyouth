const menuToggle=document.querySelector('.menu-toggle');
const navLinks=document.querySelector('.nav-links');
menuToggle?.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open)});
navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));

const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.14});
reveals.forEach(el=>observer.observe(el));

const layers=document.querySelectorAll('.hero-parallax');
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  layers.forEach((layer,i)=>layer.style.transform=`translate3d(0,${Math.min(y*.12*(i+1),100)}px,0)`);
  document.querySelector('.to-top')?.classList.toggle('show',y>700);
},{passive:true});

document.querySelector('.to-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
document.getElementById('year').textContent=new Date().getFullYear();

const form=document.getElementById('contactForm');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(form);
  const subject=encodeURIComponent(`Website enquiry from ${data.get('name')}`);
  const body=encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\nMessage:\n${data.get('message')}`);
  window.location.href=`mailto:sekenaniyouthshg@gmail.com?subject=${subject}&body=${body}`;
  document.getElementById('formNote').textContent='Opening your email app…';
});
