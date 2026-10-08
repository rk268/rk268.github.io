(function(){
  var root=document.documentElement;
  var stored=localStorage.getItem('rk-theme');
  if(stored){root.setAttribute('data-theme',stored)}
  else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){root.setAttribute('data-theme','dark')}

  var themeToggle=document.getElementById('themeToggle');
  themeToggle.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    localStorage.setItem('rk-theme',next);
  });

  var menuToggle=document.getElementById('menuToggle');
  var nav=document.getElementById('nav');
  menuToggle.addEventListener('click',function(){
    var open=nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')})});

  document.getElementById('year').textContent=new Date().getFullYear();

  var form=document.getElementById('contactForm');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var data=new FormData(form);
    var name=data.get('name')||'';
    var email=data.get('email')||'';
    var company=data.get('company')||'';
    var topic=data.get('topic')||'Professional connection';
    var message=data.get('message')||'';
    var subject='Portfolio connection: '+topic+' — '+name;
    var body=[
      'Hi Rupak,','',
      message,'',
      'Name: '+name,
      'Email: '+email,
      company?'Company / organization: '+company:'',
      'Topic: '+topic
    ].filter(Boolean).join('\n');
    window.location.href='mailto:rupakkul97@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });

  var feed='https://data-to-decisions-tech.hashnode.dev/rss.xml';
  var grid=document.getElementById('articleGrid');
  var status=document.getElementById('articleStatus');

  function plain(html){
    var doc=new DOMParser().parseFromString(String(html||''),'text/html');
    return (doc.body.textContent||'').replace(/\s+/g,' ').trim();
  }
  function render(items){
    grid.innerHTML='';
    if(!items||!items.length){throw new Error('No articles found')}
    items.forEach(function(item){
      var card=document.createElement('article');card.className='article-card';
      var date=document.createElement('p');date.className='article-date';
      date.textContent=item.date?new Date(item.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Published article';
      var h=document.createElement('h3');h.textContent=item.title||'Article';
      var p=document.createElement('p');p.textContent=(plain(item.description)||'Read this article on Data to Decisions.').slice(0,240);
      var a=document.createElement('a');a.href=item.link||'https://data-to-decisions-tech.hashnode.dev';a.target='_blank';a.rel='noopener';a.textContent='Read article ↗';
      card.append(date,h,p,a);grid.appendChild(card);
    });
    status.textContent='Published articles from Data to Decisions';
  }
  async function directRSS(){
    var r=await fetch(feed);
    if(!r.ok)throw new Error('RSS unavailable');
    var xml=await r.text();
    var doc=new DOMParser().parseFromString(xml,'application/xml');
    return Array.from(doc.querySelectorAll('item')).map(function(i){return{
      title:(i.querySelector('title')||{}).textContent,
      link:(i.querySelector('link')||{}).textContent,
      date:(i.querySelector('pubDate')||{}).textContent,
      description:(i.querySelector('description')||{}).textContent
    }});
  }
  async function rss2json(){
    var u='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(feed);
    var r=await fetch(u);if(!r.ok)throw new Error('Feed proxy unavailable');
    var j=await r.json();if(j.status!=='ok')throw new Error('Feed proxy error');
    return (j.items||[]).map(function(i){return{title:i.title,link:i.link,date:i.pubDate,description:i.description}});
  }
  directRSS().then(render).catch(function(){
    return rss2json().then(render).catch(function(){
      status.textContent='Article feed could not be loaded here. The full publication archive is available on Hashnode.';
      var card=document.createElement('article');card.className='article-card';
      var h=document.createElement('h3');h.textContent='Browse all Data to Decisions articles';
      var p=document.createElement('p');p.textContent='Open the publication archive for every published article and future post.';
      var a=document.createElement('a');a.href='https://data-to-decisions-tech.hashnode.dev';a.target='_blank';a.rel='noopener';a.textContent='Open article archive ↗';
      card.append(h,p,a);grid.appendChild(card);
    });
  });
})();