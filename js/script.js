(function(){
  "use strict";

  /* ============ Router: hash-based, real deep links ============ */
  var routes = ['home','about','skills','projects','experience','contact','terminal','play'];
  var navLinks = document.querySelectorAll('[data-route]');

  function setRoute(route){
    if(routes.indexOf(route) === -1) route = 'home';
    document.querySelectorAll('section.page').forEach(function(s){
      s.classList.toggle('active', s.dataset.route === route);
    });
    navLinks.forEach(function(a){
      if(a.dataset.route === route){ a.setAttribute('aria-current','page'); }
      else { a.removeAttribute('aria-current'); }
    });
    closeDrawer();
    if(typeof closeNavMore === 'function') closeNavMore();
    document.title = 'Harsh Vishwakarma — ' + route.charAt(0).toUpperCase() + route.slice(1);
  }

  function routeFromHash(){
    return (location.hash || '#home').replace('#','');
  }

  window.addEventListener('hashchange', function(){ setRoute(routeFromHash()); });
  setRoute(routeFromHash());

  /* ============ Mobile drawer ============ */
  var navToggle = document.getElementById('navToggle');
  var drawer = document.getElementById('mobile-drawer');
  function closeDrawer(){
    if(!drawer) return;
    drawer.classList.remove('open');
    if(navToggle) navToggle.setAttribute('aria-expanded','false');
  }
  if(navToggle){
    navToggle.addEventListener('click', function(){
      var open = drawer.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true':'false');
    });
  }

  /* ============ Desktop "More" dropdown (Terminal / Play) ============ */
  var navMore = document.getElementById('navMore');
  var navMoreBtn = document.getElementById('navMoreBtn');
  function closeNavMore(){
    if(!navMore) return;
    navMore.removeAttribute('data-open');
    if(navMoreBtn) navMoreBtn.setAttribute('aria-expanded','false');
  }
  if(navMoreBtn){
    navMoreBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = navMore.getAttribute('data-open') === 'true';
      if(isOpen){ closeNavMore(); }
      else{ navMore.setAttribute('data-open','true'); navMoreBtn.setAttribute('aria-expanded','true'); }
    });
    document.addEventListener('click', function(e){
      if(navMore && !navMore.contains(e.target)) closeNavMore();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeNavMore();
    });
    navMore.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeNavMore);
    });
  }

  /* ============ Hero terminal — one orchestrated typing moment ============ */
  var heroBody = document.getElementById('heroTermBody');
  var heroScript = [
    {t:'muted', s:'$ '}, {t:'cy', s:'whoami\n'},
    {t:'plain', s:'harsh-vishwakarma — dev / security\n\n'},
    {t:'muted', s:'$ '}, {t:'cy', s:'cat focus.txt\n'},
    {t:'plain', s:'web app security · python automation\nflask · offensive security (CTF)\n\n'},
    {t:'muted', s:'$ '}, {t:'cy', s:'status\n'},
    {t:'plain', s:'full-time devops engineer – cyber security @ tcs\n\n'},
    {t:'muted', s:'$ '}, {t:'cy', s:'open terminal_'}
  ];
  function typeHero(){
    if(!heroBody) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){
      heroBody.innerHTML = heroScript.map(function(c){
        return '<span class="'+(c.t==='muted'?'muted':c.t==='cy'?'cy':'')+'">'+escapeHtml(c.s)+'</span>';
      }).join('');
      return;
    }
    var flat = [];
    heroScript.forEach(function(chunk){
      for(var i=0;i<chunk.s.length;i++){ flat.push({ch:chunk.s[i], cls:chunk.t}); }
    });
    var i=0;
    heroBody.innerHTML = '';
    var buffers = {};
    function render(){
      var html = '';
      var curCls = null, curBuf='';
      flat.slice(0,i).forEach(function(f){
        if(f.cls !== curCls){
          if(curBuf) html += wrap(curCls,curBuf);
          curCls = f.cls; curBuf='';
        }
        curBuf += f.ch;
      });
      if(curBuf) html += wrap(curCls,curBuf);
      heroBody.innerHTML = html + '<span class="caret"></span>';
    }
    function wrap(cls,str){
      var c = cls==='muted' ? 'muted' : cls==='cy' ? 'cy' : '';
      return '<span class="'+c+'">'+escapeHtml(str)+'</span>';
    }
    var timer = setInterval(function(){
      i++;
      render();
      if(i >= flat.length) clearInterval(timer);
    }, 16);
  }
  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }
  typeHero();

  /* ============ Terminal page — command shell ============ */
  var termOut = document.getElementById('termOut');
  var termInput = document.getElementById('termInput');
  var history = [], hIndex = -1;

  var commands = {
    help: function(){ return "Commands: help, whoami, about, skills, projects, experience, contact, clear\nFilesystem: ls, pwd, cd <dir>, cat <file>, mkdir <dir>, touch <file>, rm [-r] <name>, vim <file>"; },
    whoami: function(){ return "harsh-vishwakarma — cybersecurity enthusiast & developer"; },
    about: function(){ return "B.Sc. Computer Science. Full-time DevOps Engineer – Cyber Security @ TCS, focused on DAST, Veracode, and application security testing."; },
    skills: function(){ return "Security: DAST, Veracode, Burp Suite, Nmap, OWASP Top 10\nDev: Python, Bash, Selenium, Flask, SQL\nOther: Linux (Ubuntu, Kali), Git & CI/CD"; },
    projects: function(){ return "1) Virus Detection Web Application — Flask + MySQL + VirusTotal API + Llama 3\n2) HarshOS — bare-metal x86_64 OS written in Rust\n3) StudyMate — offline AI study assistant (TensorFlow Lite)\n4) Nova — custom programming language + browser REPL\n5) AI social media publishing pipeline (Gemini API + platform APIs)\n6) mini_os.py — Python OS simulator (round-robin scheduler)\nType 'open projects' to view the full section, or 'cd projects' to browse them here."; },
    experience: function(){ return "DevOps Engineer – Cyber Security @ TCS (Dec 2025–Present) · Cybersecurity Intern @ Acmegrade (Jan–Mar 2024) · B.Sc. Computer Science, Shankar Narayan College (2022–2025) · TryHackMe CTF practice · Google Cybersecurity Professional Certificate · Cisco Ethical Hacker Certification · Top 100, TCS HackQuest Season 9"; },
    contact: function(){ return "Email: harsh902888@gmail.com\nGitHub: github.com/H4R5787\nLinkedIn: linkedin.com/in/harsh-vishwakarma-2348332ab"; },
    clear: function(){ termOut.innerHTML=''; return null; }
  };

  /* ---- Tiny in-memory virtual filesystem for the terminal ---- */
  var vfs = {
    type: 'dir',
    children: {
      'about.txt': { type:'file', content:"Full-time DevOps Engineer – Cyber Security at TCS.\nFocused on DAST, Veracode, and application security for banking & financial applications." },
      'skills.txt': { type:'file', content:"DAST · Veracode · API Security Testing · MFA/SSO Testing · DevSecOps\nPython · Bash · Selenium · Git & CI/CD · Linux (Ubuntu, Kali) · Burp Suite · Nmap" },
      'experience.txt': { type:'file', content:"DevOps Engineer – Cyber Security, TCS (Dec 2025–Present)\nCybersecurity Intern, Acmegrade (Jan–Mar 2024)\nB.Sc. Computer Science, Shankar Narayan College of Arts & Commerce (2022–2025)\nTop 100, TCS HackQuest Season 9" },
      'contact.txt': { type:'file', content:"harsh902888@gmail.com\ngithub.com/H4R5787\nlinkedin.com/in/harsh-vishwakarma-2348332ab" },
      'resume.pdf': { type:'file', content:"[binary file — email me for a current copy: harsh902888@gmail.com]" },
      'projects': {
        type:'dir',
        children:{
          'virus-detection-app.txt': { type:'file', content:"Virus Detection Web Application — Flask + MySQL + VirusTotal API + Llama 3. Featured." },
          'harshos.txt': { type:'file', content:"HarshOS — bare-metal x86_64 OS written in Rust: VGA driver, IDT, memory allocator, PS/2 keyboard, virtual filesystem, shell. Featured." },
          'studymate.txt': { type:'file', content:"StudyMate — offline AI study assistant built with TensorFlow Lite." },
          'nova-lang.txt': { type:'file', content:"Nova — custom programming language, Python interpreter + browser-based React REPL." },
          'social-pipeline.txt': { type:'file', content:"AI social media publishing pipeline — one upload, AI-generated per-platform metadata, auto-published via YouTube/Instagram/Facebook APIs." },
          'mini_os.txt': { type:'file', content:"mini_os.py — Python OS simulator with process management, virtual filesystem, round-robin scheduler." }
        }
      },
      'certifications': {
        type:'dir',
        children:{
          'google-cybersecurity.txt': { type:'file', content:"Google Cybersecurity Professional Certificate." },
          'cisco-ethical-hacker.txt': { type:'file', content:"Cisco Ethical Hacker Certification." },
          'tcs-hackquest.txt': { type:'file', content:"Top 100 rank, TCS HackQuest Season 9 — India's leading cybersecurity competition." }
        }
      }
    }
  };
  var cwdPath = []; // path segments from root

  function getNode(path){
    var node = vfs;
    for(var i=0;i<path.length;i++){
      if(!node.children || !node.children[path[i]]) return null;
      node = node.children[path[i]];
    }
    return node;
  }
  function promptPath(){
    return '~' + (cwdPath.length ? '/' + cwdPath.join('/') : '');
  }
  function updatePromptDisplay(){
    var promptEl = document.getElementById('termPrompt');
    var chromeEl = document.getElementById('termChromePath');
    if(promptEl) promptEl.textContent = promptPath() + '$';
    if(chromeEl) chromeEl.textContent = 'harsh@cyber-terminal:' + promptPath();
  }

  function fsLs(){
    var node = getNode(cwdPath);
    var names = Object.keys(node.children || {});
    if(!names.length) return "(empty)";
    return names.map(function(n){ return node.children[n].type === 'dir' ? n + '/' : n; }).join('  ');
  }
  function fsCd(arg){
    if(!arg || arg === '~'){ cwdPath = []; return null; }
    if(arg === '..'){ if(cwdPath.length) cwdPath.pop(); return null; }
    var node = getNode(cwdPath);
    var target = node.children && node.children[arg];
    if(!target) return "cd: no such directory: " + arg;
    if(target.type !== 'dir') return "cd: not a directory: " + arg;
    cwdPath.push(arg);
    return null;
  }
  function fsCat(arg){
    if(!arg) return "cat: missing filename";
    var node = getNode(cwdPath);
    var target = node.children && node.children[arg];
    if(!target) return "cat: no such file: " + arg;
    if(target.type !== 'file') return "cat: " + arg + " is a directory";
    return target.content;
  }
  function fsMkdir(arg){
    if(!arg) return "mkdir: missing directory name";
    var node = getNode(cwdPath);
    if(node.children[arg]) return "mkdir: " + arg + " already exists";
    node.children[arg] = { type:'dir', children:{} };
    return "directory created: " + arg;
  }
  function fsTouch(arg){
    if(!arg) return "touch: missing filename";
    var node = getNode(cwdPath);
    if(node.children[arg]) return null; // touching an existing file is a no-op, like real touch
    node.children[arg] = { type:'file', content:'' };
    return "file created: " + arg;
  }
  function fsRm(argRaw){
    var recursive = false;
    var arg = argRaw;
    if(/^-r\s+/.test(argRaw)){ recursive = true; arg = argRaw.replace(/^-r\s+/, ''); }
    if(!arg) return "rm: missing filename";
    var node = getNode(cwdPath);
    var target = node.children && node.children[arg];
    if(!target) return "rm: no such file or directory: " + arg;
    if(target.type === 'dir' && Object.keys(target.children).length && !recursive){
      return "rm: " + arg + " is a non-empty directory (use 'rm -r " + arg + "')";
    }
    delete node.children[arg];
    return "removed: " + arg;
  }
  function fsPwd(){ return '/' + cwdPath.join('/'); }

  /* ---- Vim-style editor overlay ---- */
  var vimEditor = document.getElementById('vimEditor');
  var vimTextarea = document.getElementById('vimTextarea');
  var vimStatusTop = document.getElementById('vimStatusTop');
  var vimModeEl = document.getElementById('vimMode');
  var vimCmdWrap = document.getElementById('vimCmdWrap');
  var vimCmdInput = document.getElementById('vimCmdInput');
  var termInLine = document.getElementById('termInLine');
  var vimCurrentFile = null;
  var vimNode = null;

  function openVim(arg){
    if(!arg) return "vim: missing filename";
    var node = getNode(cwdPath);
    var target = node.children[arg];
    if(target && target.type === 'dir') return "vim: " + arg + " is a directory";
    if(!target){ target = { type:'file', content:'' }; node.children[arg] = target; }
    vimCurrentFile = arg;
    vimNode = target;
    vimTextarea.value = target.content;
    vimStatusTop.textContent = '"' + arg + '" — ' + promptPath() + '/' + arg;
    termInLine.style.display = 'none';
    vimEditor.style.display = 'flex';
    setVimMode('insert');
    vimTextarea.focus();
    return null;
  }

  function setVimMode(mode){
    if(mode === 'command'){
      vimModeEl.textContent = '-- COMMAND --';
      vimModeEl.className = 'vim-mode cmd';
      vimCmdWrap.style.display = 'inline-flex';
      vimCmdInput.value = '';
      vimCmdInput.focus();
    } else {
      vimModeEl.textContent = '-- INSERT --';
      vimModeEl.className = 'vim-mode';
      vimCmdWrap.style.display = 'none';
      vimTextarea.focus();
    }
  }

  function closeVim(){
    vimEditor.style.display = 'none';
    termInLine.style.display = 'flex';
    vimCurrentFile = null;
    vimNode = null;
    termInput.focus();
  }

  function vimRunCommand(raw){
    var c = raw.trim();
    if(c === 'w'){
      vimNode.content = vimTextarea.value;
      printLine('"' + vimCurrentFile + '" written');
      setVimMode('insert');
    } else if(c === 'q'){
      if(vimTextarea.value !== vimNode.content){
        printLine("E37: No write since last change (use :q! to discard)");
        setVimMode('insert');
      } else {
        printLine('(closed ' + vimCurrentFile + ')');
        closeVim();
      }
    } else if(c === 'q!'){
      printLine('(closed ' + vimCurrentFile + ' without saving)');
      closeVim();
    } else if(c === 'wq' || c === 'x'){
      vimNode.content = vimTextarea.value;
      printLine('"' + vimCurrentFile + '" written');
      printLine('(closed ' + vimCurrentFile + ')');
      closeVim();
    } else if(c === ''){
      setVimMode('insert');
    } else {
      printLine("E492: Not an editor command: " + c);
      setVimMode('insert');
    }
  }

  if(vimTextarea){
    vimTextarea.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ e.preventDefault(); setVimMode('command'); }
    });
  }
  if(vimCmdInput){
    vimCmdInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); vimRunCommand(vimCmdInput.value); }
      else if(e.key === 'Escape'){ e.preventDefault(); setVimMode('insert'); }
    });
  }


  function printLine(text, cls){
    var div = document.createElement('div');
    div.className = 'line' + (cls?(' '+cls):'');
    div.textContent = text;
    termOut.appendChild(div);
    termOut.scrollTop = termOut.scrollHeight;
  }

  function runCommand(raw){
    var cmd = raw.trim();
    var promptLine = document.createElement('div');
    promptLine.className = 'line';
    promptLine.innerHTML = '<span class="prompt">$</span> <span class="cmd"></span>';
    promptLine.querySelector('.cmd').textContent = cmd;
    termOut.appendChild(promptLine);
    if(!cmd){ termOut.scrollTop = termOut.scrollHeight; return; }

    var openMatch = cmd.match(/^open\s+(\w+)/i);
    var key = openMatch ? openMatch[1].toLowerCase() : cmd.toLowerCase();

    var parts = cmd.split(/\s+/);
    var verb = (parts[0] || '').toLowerCase();
    var arg = cmd.slice(verb.length).trim();

    if(verb === 'ls'){ printLine(fsLs()); }
    else if(verb === 'pwd'){ printLine(fsPwd()); }
    else if(verb === 'cd'){ var r1 = fsCd(arg); if(r1) printLine(r1); updatePromptDisplay(); }
    else if(verb === 'cat'){ printLine(fsCat(arg)); }
    else if(verb === 'mkdir'){ printLine(fsMkdir(arg)); }
    else if(verb === 'touch'){ var r2 = fsTouch(arg); if(r2) printLine(r2); }
    else if(verb === 'rm'){ printLine(fsRm(arg)); }
    else if(verb === 'vim' || verb === 'vi'){
      var r3 = openVim(arg);
      if(r3) printLine(r3);
    }
    else if(commands[key]){
      var res = commands[key]();
      if(res !== null) printLine(res);
    } else if(routes.indexOf(key) !== -1){
      location.hash = '#'+key;
      printLine("Opening " + key + "…");
    } else {
      printLine("command not found: " + cmd + " (try 'help')");
    }
    termOut.scrollTop = termOut.scrollHeight;
  }

  if(termInput){
    termInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        var val = termInput.value;
        history.push(val); hIndex = history.length;
        runCommand(val);
        termInput.value = '';
      } else if(e.key === 'ArrowUp'){
        if(hIndex > 0){ hIndex--; termInput.value = history[hIndex] || ''; }
        e.preventDefault();
      } else if(e.key === 'ArrowDown'){
        if(hIndex < history.length){ hIndex++; termInput.value = history[hIndex] || ''; }
        e.preventDefault();
      }
    });
  }

  /* ============ Games ============ */
  var modal = document.getElementById('gameModal');
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var gameTitle = document.getElementById('gameTitle');
  var gameScoreEl = document.getElementById('gameScore');
  var gameHint = document.getElementById('gameHint');
  var closeBtn = document.getElementById('closeGame');
  var restartBtn = document.getElementById('restartGame');

  var statusEl = document.getElementById('gameStatus');
  var loopId = null, keyHandler = null, clickHandler = null, ctxHandler = null, current = null;

  // Converts a mouse event into canvas-pixel coordinates, correcting for
  // the fact that the canvas is drawn at its native size (e.g. 460x360)
  // but rendered at whatever CSS width the modal box gives it. Without
  // this correction, clicks land in the wrong cell whenever the two
  // sizes differ — this was the cause of tic-tac-toe/minesweeper clicks
  // not lining up with the grid drawn on screen.
  function getCanvasPos(e){
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function setStatus(text){ if(statusEl) statusEl.textContent = text || ''; }

  function stopLoop(){
    if(loopId) cancelAnimationFrame(loopId);
    if(keyHandler) document.removeEventListener('keydown', keyHandler);
    if(clickHandler) canvas.removeEventListener('mousedown', clickHandler);
    if(ctxHandler) canvas.removeEventListener('contextmenu', ctxHandler);
    keyHandler = clickHandler = ctxHandler = null; current = null;
  }

  function openModal(title, scoreLabel){
    gameTitle.textContent = title;
    gameHint.innerHTML = (scoreLabel || 'Score') + ': <strong id="gameScore">0</strong>';
    gameScoreEl = document.getElementById('gameScore');
    setStatus('');
    modal.classList.add('open');
    closeBtn.focus();
  }
  function closeModal(){
    modal.classList.remove('open');
    stopLoop();
    setStatus('');
    // restore the default frame for the next game
    canvas.width = 460; canvas.height = 360;
  }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
  restartBtn.addEventListener('click', function(){
    if(current && current.reset){ current.reset(); current.draw(); if(current.statusText) setStatus(current.statusText()); }
  });

  function loop(update, fps){
    var interval = 1000/fps, last = 0;
    function frame(t){
      if(t - last >= interval){ update(); last = t; }
      loopId = requestAnimationFrame(frame);
    }
    loopId = requestAnimationFrame(frame);
  }

  /* ---- Snake ---- */
  function SnakeGame(){
    var size = 20, cols = canvas.width/size, rows = canvas.height/size;
    var snake, dir, food, over;
    function place(){ food = {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)}; }
    function reset(){
      snake = [{x:8,y:9}]; dir = {x:1,y:0}; over=false; this.score=0; place();
    }
    this.reset = reset.bind(this);
    this.reset();
    this.changeDir = function(nd){
      if(nd.x === -dir.x && nd.y === -dir.y) return;
      dir = nd;
    };
    this.update = function(){
      var head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
      if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(function(s){return s.x===head.x&&s.y===head.y;})){
        over = true; return;
      }
      snake.unshift(head);
      if(head.x===food.x && head.y===food.y){ this.score++; if(gameScoreEl) gameScoreEl.textContent=this.score; place(); }
      else snake.pop();
    }.bind(this);
    this.gameOver = function(){ return over; };
    this.draw = function(){
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#39FF6A';
      snake.forEach(function(s){ ctx.fillRect(s.x*size+1, s.y*size+1, size-2, size-2); });
      ctx.fillStyle = '#4FD1FF';
      ctx.fillRect(food.x*size+1, food.y*size+1, size-2, size-2);
      if(over){ ctx.fillStyle='#E7EBF3'; ctx.font='16px monospace'; ctx.textAlign='center'; ctx.fillText('Game over', canvas.width/2, canvas.height/2); }
    };
  }

  /* ---- Pong ---- */
  function PongGame(){
    var pw=10, ph=70, p1y=canvas.height/2-ph/2, p2y=canvas.height/2-ph/2, ballX,ballY,vx,vy;
    this.score = 0;
    var reset = function(){
      ballX=canvas.width/2; ballY=canvas.height/2; vx=3; vy=2; this.score=0;
    }.bind(this);
    this.reset = reset; this.reset();
    this.movePaddle = function(dir){ p1y += dir==='up'?-16:16; p1y=Math.max(0,Math.min(canvas.height-ph,p1y)); };
    this.update = function(){
      ballX+=vx; ballY+=vy;
      if(ballY<0||ballY>canvas.height) vy*=-1;
      if(ballX<20 && ballY>p1y && ballY<p1y+ph){ vx*=-1; this.score++; if(gameScoreEl) gameScoreEl.textContent=this.score; }
      p2y += (ballY-(p2y+ph/2))*0.08;
      if(ballX>canvas.width-20 && ballY>p2y && ballY<p2y+ph) vx*=-1;
      if(ballX<0 || ballX>canvas.width) this.reset();
    }.bind(this);
    this.gameOver = function(){ return false; };
    this.draw = function(){
      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#39FF6A';
      ctx.fillRect(10,p1y,pw,ph);
      ctx.fillRect(canvas.width-20,p2y,pw,ph);
      ctx.fillRect(ballX-4,ballY-4,8,8);
    };
  }

  /* ---- Breakout ---- */
  function BreakoutGame(){
    var pw=70, ph=10, px=canvas.width/2-pw/2, ballX,ballY,vx,vy, bricks;
    this.score=0;
    function makeBricks(){
      bricks=[];
      for(var r=0;r<4;r++) for(var c=0;c<8;c++) bricks.push({x:c*(canvas.width/8), y:30+r*18, w:canvas.width/8-4, h:14, alive:true});
    }
    var reset = function(){ px=canvas.width/2-pw/2; ballX=canvas.width/2; ballY=canvas.height-30; vx=3; vy=-3; this.score=0; makeBricks(); }.bind(this);
    this.reset=reset; this.reset();
    var over=false;
    this.movePaddle = function(dir){ px += dir==='left'?-18:18; px=Math.max(0,Math.min(canvas.width-pw,px)); };
    this.gameOver = function(){ return over; };
    this.update = function(){
      ballX+=vx; ballY+=vy;
      if(ballX<0||ballX>canvas.width) vx*=-1;
      if(ballY<0) vy*=-1;
      if(ballY>canvas.height-20 && ballX>px && ballX<px+pw) vy=-Math.abs(vy);
      if(ballY>canvas.height){ over=true; }
      bricks.forEach(function(b){
        if(b.alive && ballX>b.x && ballX<b.x+b.w && ballY>b.y && ballY<b.y+b.h){
          b.alive=false; vy*=-1; this.score++; if(gameScoreEl) gameScoreEl.textContent=this.score;
        }
      }.bind(this));
    }.bind(this);
    this.draw = function(){
      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#4FD1FF';
      bricks.forEach(function(b){ if(b.alive) ctx.fillRect(b.x+2,b.y,b.w,b.h); });
      ctx.fillStyle='#39FF6A';
      ctx.fillRect(px,canvas.height-16,pw,ph);
      ctx.fillRect(ballX-4,ballY-4,8,8);
      if(over){ ctx.fillStyle='#E7EBF3'; ctx.font='16px monospace'; ctx.textAlign='center'; ctx.fillText('Game over', canvas.width/2, canvas.height/2); }
    };
  }

  /* ---- Tic-Tac-Toe (vs an unbeatable minimax AI) ---- */
  var TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function tttWinLine(b, p){
    for(var i=0;i<TTT_LINES.length;i++){
      var l = TTT_LINES[i];
      if(b[l[0]]===p && b[l[1]]===p && b[l[2]]===p) return l;
    }
    return null;
  }
  function tttMinimax(b, player){
    if(tttWinLine(b,'O')) return {score:1};
    if(tttWinLine(b,'X')) return {score:-1};
    var empties = [];
    for(var i=0;i<9;i++) if(!b[i]) empties.push(i);
    if(!empties.length) return {score:0};
    var best = null;
    for(var k=0;k<empties.length;k++){
      var idx = empties[k];
      b[idx] = player;
      var res = tttMinimax(b, player==='O' ? 'X' : 'O');
      b[idx] = null;
      var better = best===null ||
        (player==='O' && res.score > best.score) ||
        (player==='X' && res.score < best.score);
      if(better) best = {score:res.score, move:idx};
    }
    return best;
  }

  function TicTacToeGame(){
    // The game is square (3x3), so the canvas frame is forced square here —
    // this is what keeps the drawn grid lines and the click hit-testing
    // in agreement (they were previously computed from mismatched
    // width/height, which is why clicks felt "off the frame").
    canvas.width = 390; canvas.height = 390;
    var size = canvas.width, cell = size/3;
    var board, over, winner, winLine, humanFirst, aiThinking;
    this.wins = 0; this.losses = 0; this.draws = 0;

    function boardFull(b){ return b.every(function(v){ return v; }); }

    this.gameOver = function(){ return over; };
    this.statusText = function(){
      if(over) return winner==='X' ? 'You win — nice.' : winner==='O' ? 'AI wins this round.' : "It's a draw.";
      return humanBoardHasMove() ? "Your move — you're X." : 'AI is thinking…';
    };
    function humanBoardHasMove(){ return board.some(function(v){ return !v; }); }

    function finish(){
      winner = tttWinLine(board,'X') ? 'X' : tttWinLine(board,'O') ? 'O' : boardFull(board) ? 'draw' : null;
      if(!winner) return false;
      over = true;
      winLine = winner==='X' ? tttWinLine(board,'X') : winner==='O' ? tttWinLine(board,'O') : null;
      if(winner==='X') this.wins++; else if(winner==='O') this.losses++; else this.draws++;
      if(gameScoreEl) gameScoreEl.textContent = this.wins + '–' + this.losses + '–' + this.draws;
      return true;
    }
    finish = finish.bind(this);

    function aiMove(){
      var copy = board.slice();
      var result = tttMinimax(copy, 'O');
      if(result && result.move !== undefined) board[result.move] = 'O';
      finish();
    }

    // Defined after finish/aiMove so the very first call has both ready —
    // avoids calling an unbound `finish` if the AI ever opens the round.
    var reset = function(){
      board = Array(9).fill(null);
      over = false; winner = null; winLine = null; aiThinking = false;
      humanFirst = (this.wins + this.losses + this.draws) % 2 === 0; // alternate who opens each round
      if(!humanFirst) aiMove();
    }.bind(this);
    this.reset = reset;
    reset();

    this.makeMove = function(col, row){
      if(over || aiThinking) return;
      var i = row*3 + col;
      if(i<0 || i>8 || board[i]) return;
      board[i] = 'X';
      if(finish()) { setStatus(this.statusText()); return; }
      aiThinking = true;
      setStatus('AI is thinking…');
      var self = this;
      setTimeout(function(){
        aiMove();
        aiThinking = false;
        self.draw();
        setStatus(self.statusText());
      }, 260); // tiny delay so the AI's move reads as a deliberate turn, not instant
      return;
    }.bind(this);

    this.draw = function(){
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = '#232A3B'; ctx.lineWidth = 2;
      for(var i=1;i<3;i++){
        ctx.beginPath(); ctx.moveTo(i*cell,10); ctx.lineTo(i*cell,canvas.height-10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10,i*cell); ctx.lineTo(canvas.width-10,i*cell); ctx.stroke();
      }
      ctx.font = (cell*0.45)+'px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      board.forEach(function(v, idx){
        if(!v) return;
        var c = idx%3, r = Math.floor(idx/3);
        ctx.fillStyle = v==='X' ? '#39FF6A' : '#4FD1FF';
        ctx.fillText(v, c*cell+cell/2, r*cell+cell/2);
      });
      if(winLine){
        var a = winLine[0], b2 = winLine[2];
        var ax = (a%3)*cell+cell/2, ay = Math.floor(a/3)*cell+cell/2;
        var bx = (b2%3)*cell+cell/2, by = Math.floor(b2/3)*cell+cell/2;
        ctx.strokeStyle = winner==='X' ? '#39FF6A' : '#FF5C7A';
        ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      }
    }.bind(this);
  }

  /* ---- Minesweeper ---- */
  function MinesweeperGame(){
    // Fixed, evenly-divisible frame (39px cells, 10x8) so the grid drawn
    // on screen always matches the click hit-testing exactly.
    var cols=10, rows=8, size=39, mines=12, grid, over, won;
    canvas.width = cols*size; canvas.height = rows*size;
    this.score=0;

    function buildGrid(){
      grid=[];
      for(var r=0;r<rows;r++){ grid.push([]); for(var c=0;c<cols;c++) grid[r].push({mine:false,revealed:false,flag:false,n:0}); }
      var placed=0;
      while(placed<mines){
        var r=Math.floor(Math.random()*rows), c=Math.floor(Math.random()*cols);
        if(!grid[r][c].mine){ grid[r][c].mine=true; placed++; }
      }
      for(r=0;r<rows;r++) for(c=0;c<cols;c++){
        if(grid[r][c].mine) continue;
        var n=0;
        for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){
          var rr=r+dr, cc=c+dc;
          if(rr>=0&&rr<rows&&cc>=0&&cc<cols&&grid[rr][cc].mine) n++;
        }
        grid[r][c].n=n;
      }
    }
    function flagsPlaced(){
      var n=0; grid.forEach(function(row){ row.forEach(function(c){ if(c.flag) n++; }); }); return n;
    }
    function checkWin(){
      return grid.every(function(row){ return row.every(function(c){ return c.mine || c.revealed; }); });
    }
    var reset = function(){ buildGrid(); over=false; won=false; this.score=0; }.bind(this);
    this.reset=reset; this.reset();
    this.gameOver=function(){return over || won;};
    this.statusText = function(){
      if(won) return 'Cleared the field — nice work.';
      if(over) return 'Hit a mine — try again.';
      return (mines - flagsPlaced()) + ' mines left to flag · ' + this.score + ' cells revealed';
    };
    function floodReveal(r,c){
      if(r<0||r>=rows||c<0||c>=cols||grid[r][c].revealed||grid[r][c].flag) return;
      grid[r][c].revealed=true;
      if(grid[r][c].n===0 && !grid[r][c].mine){
        for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++) if(dr||dc) floodReveal(r+dr,c+dc);
      }
    }
    this.reveal = function(row,col){
      if(over || won || row<0||row>=rows||col<0||col>=cols) return;
      if(grid[row][col].mine){ grid[row][col].revealed=true; over=true; setStatus(this.statusText()); return; }
      floodReveal(row,col);
      this.score = grid.reduce(function(sum,row){ return sum + row.filter(function(c){return c.revealed;}).length; },0);
      if(gameScoreEl) gameScoreEl.textContent=this.score;
      if(checkWin()){ won=true; }
      setStatus(this.statusText());
    }.bind(this);
    this.toggleFlag = function(row,col){
      if(over || won || row<0||row>=rows||col<0||col>=cols) return;
      var cell=grid[row][col]; if(!cell.revealed) cell.flag=!cell.flag;
      setStatus(this.statusText());
    }.bind(this);
    this.draw = function(){
      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
        var cell=grid[r][c], x=c*size, y=r*size;
        ctx.fillStyle = cell.revealed ? '#12161F' : '#1A2030';
        ctx.fillRect(x+1,y+1,size-2,size-2);
        if((cell.revealed && cell.mine) || (won && cell.mine)){ ctx.fillStyle='#FF5C7A'; ctx.beginPath(); ctx.arc(x+size/2,y+size/2,size/4,0,7); ctx.fill(); }
        else if(cell.revealed && cell.n>0){ ctx.fillStyle='#4FD1FF'; ctx.font=(size*0.5)+'px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(cell.n, x+size/2, y+size/2); }
        else if(!cell.revealed && cell.flag){ ctx.fillStyle='#39FF6A'; ctx.font=(size*0.5)+'px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚑', x+size/2, y+size/2); }
      }
      if(over){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#FF5C7A'; ctx.font='16px monospace'; ctx.textAlign='center'; ctx.fillText('Boom — try again', canvas.width/2, canvas.height/2); }
      if(won){ ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#39FF6A'; ctx.font='16px monospace'; ctx.textAlign='center'; ctx.fillText('Field cleared!', canvas.width/2, canvas.height/2); }
    };
  }

  /* ---- Memory Match ---- */
  function MemoryMatchGame(){
    var cols=4, rows=4, size=90;
    canvas.width = cols*size; canvas.height = rows*size;
    var symbols = ['DAST','SSO','MFA','API','SQL','SSH','TCP','XSS'];
    var cards, flipped, matchedCount, moves, over, lockInput;

    function shuffle(arr){
      for(var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
      return arr;
    }
    function build(){
      var deck = shuffle(symbols.concat(symbols));
      cards = deck.map(function(v){ return {value:v, revealed:false, matched:false}; });
      flipped=[]; matchedCount=0; moves=0; over=false; lockInput=false;
    }
    build();
    this.moves = 0;

    this.reset = function(){
      build(); this.moves = 0;
      if(gameScoreEl) gameScoreEl.textContent = '0';
    }.bind(this);

    this.statusText = function(){
      return over ? ('Solved in ' + moves + ' moves!') : ((matchedCount/2) + '/' + symbols.length + ' pairs found');
    };

    this.flip = function(idx){
      if(lockInput || over) return;
      var card = cards[idx];
      if(!card || card.revealed || card.matched) return;
      card.revealed = true;
      flipped.push(idx);
      if(flipped.length === 2){
        moves++; this.moves = moves;
        if(gameScoreEl) gameScoreEl.textContent = moves;
        var a = cards[flipped[0]], b = cards[flipped[1]];
        if(a.value === b.value){
          a.matched = true; b.matched = true; matchedCount += 2;
          flipped = [];
          if(matchedCount === cards.length) over = true;
        } else {
          lockInput = true;
          var self = this;
          setTimeout(function(){
            a.revealed = false; b.revealed = false; flipped = []; lockInput = false;
            self.draw(); setStatus(self.statusText());
          }, 650);
        }
      }
    }.bind(this);

    this.draw = function(){
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
        var idx = r*cols+c, card = cards[idx], x = c*size, y = r*size;
        ctx.fillStyle = card.revealed || card.matched ? '#1A2030' : '#12161F';
        ctx.fillRect(x+4,y+4,size-8,size-8);
        ctx.strokeStyle = card.matched ? '#39FF6A' : '#232A3B';
        ctx.lineWidth = 2; ctx.strokeRect(x+4,y+4,size-8,size-8);
        ctx.font = '14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if(card.revealed || card.matched){
          ctx.fillStyle = card.matched ? '#39FF6A' : '#4FD1FF';
          ctx.fillText(card.value, x+size/2, y+size/2);
        } else {
          ctx.fillStyle = '#232A3B'; ctx.font = '18px monospace';
          ctx.fillText('?', x+size/2, y+size/2);
        }
      }
      if(over){
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#39FF6A'; ctx.font = '16px monospace'; ctx.textAlign = 'center';
        ctx.fillText('Solved in ' + moves + ' moves!', canvas.width/2, canvas.height/2);
      }
    }.bind(this);
  }

  /* ---- Whack-a-Terminal ---- */
  function WhackAMoleGame(){
    var cols=3, rows=3, size=120, fps=30;
    canvas.width = cols*size; canvas.height = rows*size;
    var frame, timeLeft, activeIndex, activeUntilFrame, nextSpawnFrame, score, over;

    function scheduleNextSpawn(){ nextSpawnFrame = frame + Math.floor(fps*(0.4+Math.random()*0.6)); }
    function build(){
      frame = 0; timeLeft = 30; activeIndex = -1; score = 0; over = false;
      scheduleNextSpawn();
    }
    build();
    this.score = 0;

    this.gameOver = function(){ return over; };
    this.reset = function(){
      build(); this.score = 0;
      if(gameScoreEl) gameScoreEl.textContent = '0';
    }.bind(this);
    this.statusText = function(){ return over ? ("Time's up — score " + score) : ('Time left: ' + timeLeft + 's'); };

    this.update = function(){
      if(over) return;
      frame++;
      if(frame % fps === 0){ timeLeft--; if(timeLeft <= 0){ timeLeft = 0; over = true; } }
      if(activeIndex === -1 && frame >= nextSpawnFrame){
        activeIndex = Math.floor(Math.random()*cols*rows);
        activeUntilFrame = frame + Math.floor(fps*(0.6+Math.random()*0.5));
      } else if(activeIndex !== -1 && frame >= activeUntilFrame){
        activeIndex = -1;
        scheduleNextSpawn();
      }
    };
    this.whack = function(idx){
      if(over || idx !== activeIndex) return;
      score++; this.score = score;
      if(gameScoreEl) gameScoreEl.textContent = score;
      activeIndex = -1;
      scheduleNextSpawn();
    }.bind(this);

    this.draw = function(){
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
        var idx = r*cols+c, x = c*size, y = r*size;
        ctx.fillStyle = '#12161F'; ctx.fillRect(x+6,y+6,size-12,size-12);
        ctx.strokeStyle = '#232A3B'; ctx.strokeRect(x+6,y+6,size-12,size-12);
        if(idx === activeIndex){
          ctx.fillStyle = '#39FF6A';
          ctx.beginPath(); ctx.arc(x+size/2, y+size/2, size*0.28, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.fillStyle = '#8B93A7'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
      ctx.fillText('Time: ' + timeLeft + 's', 10, canvas.height-10);
      if(over){
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#39FF6A'; ctx.font = '16px monospace'; ctx.textAlign = 'center';
        ctx.fillText("Time's up — score " + score, canvas.width/2, canvas.height/2);
      }
    }.bind(this);
  }

  /* ---- Reaction Test ---- */
  function ReactionGame(){
    var self = this;
    canvas.width = 360; canvas.height = 240;
    var state = 'waiting', armTimer = null, startTime = 0, lastResult = null, best = null, tooSoon = false;

    function arm(){
      state = 'armed'; tooSoon = false; lastResult = null;
      var delay = 1000 + Math.random()*2500;
      armTimer = setTimeout(function(){ state = 'go'; startTime = performance.now(); self.draw(); }, delay);
    }
    this.score = null;

    this.reset = function(){
      if(armTimer) clearTimeout(armTimer);
      best = null; self.score = null;
      if(gameScoreEl) gameScoreEl.textContent = '—';
      arm();
      self.draw();
    };

    this.click = function(){
      if(state === 'waiting'){ arm(); self.draw(); return; }
      if(state === 'armed'){
        clearTimeout(armTimer);
        tooSoon = true; state = 'result';
        self.draw();
        setTimeout(function(){ arm(); self.draw(); }, 900);
        return;
      }
      if(state === 'go'){
        var t = Math.round(performance.now() - startTime);
        lastResult = t; tooSoon = false;
        if(best === null || t < best){
          best = t; self.score = best;
          if(gameScoreEl) gameScoreEl.textContent = best + 'ms';
        }
        state = 'result';
        self.draw();
        setTimeout(function(){ arm(); self.draw(); }, 900);
      }
    };

    this.draw = function(){
      ctx.fillStyle = state === 'go' ? '#39FF6A' : (tooSoon ? '#FF5C7A' : '#12161F');
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = state === 'go' ? '#00120a' : '#E7EBF3';
      ctx.font = '15px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var msg;
      if(state === 'waiting') msg = 'Click to start';
      else if(state === 'armed') msg = 'Wait for green…';
      else if(state === 'go') msg = 'Click now!';
      else if(tooSoon) msg = 'Too soon — wait for green';
      else msg = lastResult + 'ms — click to go again';
      ctx.fillText(msg, canvas.width/2, canvas.height/2);
      if(best !== null){
        ctx.fillStyle = '#8B93A7'; ctx.font = '12px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText('Best: ' + best + 'ms', 10, canvas.height-14);
      }
    };
  }

  /* ---- Red Ball vs Blue Ball (bumper-arena duel) ---- */
  function BallDuelGame(){
    var self = this;
    canvas.width = 420; canvas.height = 300;
    var R = 18;
    var accel = 0.6, friction = 0.965, maxSpeed = 7, maxSpeedAI = 6;
    var red, blue, over, winner;

    function build(){
      red  = { x: canvas.width*0.25, y: canvas.height/2, vx:0, vy:0, hp:100, color:'#FF5C7A' };
      blue = { x: canvas.width*0.75, y: canvas.height/2, vx:0, vy:0, hp:100, color:'#4FD1FF' };
      over = false; winner = null;
    }
    build();

    this.reset = function(){ build(); };
    this.statusText = function(){
      return over ? ('Winner: ' + winner) : ('Red HP ' + Math.max(0,Math.round(red.hp)) + '  ·  Blue HP ' + Math.max(0,Math.round(blue.hp)));
    };

    this.keyDown = function(key){
      if(over) return;
      if(key === 'ArrowUp' || key === 'w' || key === 'W') red.vy -= accel;
      if(key === 'ArrowDown' || key === 's' || key === 'S') red.vy += accel;
      if(key === 'ArrowLeft' || key === 'a' || key === 'A') red.vx -= accel;
      if(key === 'ArrowRight' || key === 'd' || key === 'D') red.vx += accel;
      var spd = Math.hypot(red.vx, red.vy);
      if(spd > maxSpeed){ red.vx = red.vx/spd*maxSpeed; red.vy = red.vy/spd*maxSpeed; }
    };

    function bounceWalls(b){
      if(b.x - R < 0){ b.x = R; b.vx *= -0.8; }
      if(b.x + R > canvas.width){ b.x = canvas.width - R; b.vx *= -0.8; }
      if(b.y - R < 0){ b.y = R; b.vy *= -0.8; }
      if(b.y + R > canvas.height){ b.y = canvas.height - R; b.vy *= -0.8; }
    }

    function stepAI(){
      var dx = red.x - blue.x, dy = red.y - blue.y;
      var d = Math.hypot(dx, dy) || 1;
      blue.vx += (dx/d) * accel * 0.85;
      blue.vy += (dy/d) * accel * 0.85;
      var spd = Math.hypot(blue.vx, blue.vy);
      if(spd > maxSpeedAI){ blue.vx = blue.vx/spd*maxSpeedAI; blue.vy = blue.vy/spd*maxSpeedAI; }
    }

    function handleCollision(){
      var dx = blue.x - red.x, dy = blue.y - red.y;
      var dist = Math.hypot(dx, dy);
      if(dist === 0 || dist > R*2) return;
      var nx = dx/dist, ny = dy/dist;
      // separate overlapping balls
      var overlap = (R*2 - dist)/2;
      red.x -= nx*overlap; red.y -= ny*overlap;
      blue.x += nx*overlap; blue.y += ny*overlap;
      // elastic swap of velocity along the normal (equal mass)
      var rv = red.vx*nx + red.vy*ny;
      var bv = blue.vx*nx + blue.vy*ny;
      red.vx += (bv-rv)*nx; red.vy += (bv-rv)*ny;
      blue.vx += (rv-bv)*nx; blue.vy += (rv-bv)*ny;
      // damage based on who was moving faster on impact
      var redSpeed = Math.hypot(rv, 0) ? Math.abs(rv) : 0;
      var blueSpeed = Math.abs(bv);
      var diff = Math.abs(redSpeed - blueSpeed);
      var dmg = Math.max(3, diff * 6);
      if(redSpeed > blueSpeed) blue.hp -= dmg;
      else if(blueSpeed > redSpeed) red.hp -= dmg;
      else { red.hp -= 3; blue.hp -= 3; }
    }

    this.update = function(){
      if(over) return;
      stepAI();
      red.vx *= friction; red.vy *= friction;
      blue.vx *= friction; blue.vy *= friction;
      red.x += red.vx; red.y += red.vy;
      blue.x += blue.vx; blue.y += blue.vy;
      bounceWalls(red); bounceWalls(blue);
      handleCollision();
      if(red.hp <= 0 || blue.hp <= 0){
        over = true;
        winner = red.hp <= 0 && blue.hp <= 0 ? 'Draw' : (red.hp <= 0 ? 'Blue' : 'Red');
      }
      setStatus(self.statusText());
    };

    function healthBar(x, y, w, h, pct, color){
      ctx.fillStyle = '#232A3B'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0,pct), h);
      ctx.strokeStyle = '#12161F'; ctx.strokeRect(x, y, w, h);
    }

    this.draw = function(){
      ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      healthBar(14, 14, 160, 10, red.hp/100, '#FF5C7A');
      healthBar(canvas.width-174, 14, 160, 10, blue.hp/100, '#4FD1FF');
      ctx.fillStyle = '#8B93A7'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
      ctx.fillText('RED', 14, 40);
      ctx.textAlign = 'right';
      ctx.fillText('BLUE', canvas.width-14, 40);

      ctx.beginPath(); ctx.arc(red.x, red.y, R, 0, Math.PI*2);
      ctx.fillStyle = red.color; ctx.fill();
      ctx.beginPath(); ctx.arc(blue.x, blue.y, R, 0, Math.PI*2);
      ctx.fillStyle = blue.color; ctx.fill();

      if(over){
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#39FF6A'; ctx.font = '18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(winner + ' wins!', canvas.width/2, canvas.height/2);
      }
    };
  }

  var starters = {
    snake: function(){
      openModal('Snake', 'Arrow keys');
      current = new SnakeGame();
      keyHandler = function(e){
        var map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
        if(map[e.key]) current.changeDir(map[e.key]);
      };
      document.addEventListener('keydown', keyHandler);
      loop(function(){ if(!current.gameOver()) current.update(); current.draw(); }, 8);
    },
    pong: function(){
      openModal('Pong','W / S to move');
      current = new PongGame();
      keyHandler = function(e){
        if(e.key==='w'||e.key==='W') current.movePaddle('up');
        if(e.key==='s'||e.key==='S') current.movePaddle('down');
      };
      document.addEventListener('keydown', keyHandler);
      loop(function(){ current.update(); current.draw(); }, 60);
    },
    breakout: function(){
      openModal('Breakout','Arrow keys');
      current = new BreakoutGame();
      keyHandler = function(e){
        if(e.key==='ArrowLeft') current.movePaddle('left');
        if(e.key==='ArrowRight') current.movePaddle('right');
      };
      document.addEventListener('keydown', keyHandler);
      loop(function(){ if(!current.gameOver()) current.update(); current.draw(); }, 60);
    },
    tictactoe: function(){
      openModal('Tic-Tac-Toe', 'W–L–D');
      current = new TicTacToeGame();
      ctxHandler = function(e){ e.preventDefault(); };
      canvas.addEventListener('contextmenu', ctxHandler);
      clickHandler = function(e){
        var pos = getCanvasPos(e);
        var cell = canvas.width/3;
        current.makeMove(Math.floor(pos.x/cell), Math.floor(pos.y/cell));
        current.draw();
      };
      canvas.addEventListener('mousedown', clickHandler);
      if(gameScoreEl) gameScoreEl.textContent = current.wins + '–' + current.losses + '–' + current.draws;
      current.draw();
      setStatus(current.statusText());
    },
    minesweeper: function(){
      openModal('Minesweeper','Revealed');
      current = new MinesweeperGame();
      ctxHandler = function(e){ e.preventDefault(); };
      canvas.addEventListener('contextmenu', ctxHandler);
      clickHandler = function(e){
        var pos = getCanvasPos(e);
        var cellSize = canvas.width/10;
        var col = Math.floor(pos.x/cellSize), row = Math.floor(pos.y/(canvas.height/8));
        if(e.button===0) current.reveal(row,col);
        else if(e.button===2) current.toggleFlag(row,col);
        current.draw();
      };
      canvas.addEventListener('mousedown', clickHandler);
      current.draw();
      setStatus(current.statusText());
    },
    memorymatch: function(){
      openModal('Memory Match', 'Moves');
      current = new MemoryMatchGame();
      clickHandler = function(e){
        var pos = getCanvasPos(e);
        var col = Math.floor(pos.x/90), row = Math.floor(pos.y/90);
        current.flip(row*4+col);
        current.draw();
        setStatus(current.statusText());
      };
      canvas.addEventListener('mousedown', clickHandler);
      current.draw();
      setStatus(current.statusText());
    },
    whackamole: function(){
      openModal('Whack-a-Terminal', 'Score');
      current = new WhackAMoleGame();
      clickHandler = function(e){
        var pos = getCanvasPos(e);
        var col = Math.floor(pos.x/120), row = Math.floor(pos.y/120);
        current.whack(row*3+col);
      };
      canvas.addEventListener('mousedown', clickHandler);
      loop(function(){
        if(!current.gameOver()) current.update();
        current.draw();
        setStatus(current.statusText());
      }, 30);
    },
    reaction: function(){
      openModal('Reaction Test', 'Best');
      current = new ReactionGame();
      clickHandler = function(){ current.click(); };
      canvas.addEventListener('mousedown', clickHandler);
      current.reset();
      setStatus('Click the panel to begin.');
    },
    balls: function(){
      openModal('Red Ball vs Blue Ball', 'Match');
      current = new BallDuelGame();
      keyHandler = function(e){ current.keyDown(e.key); };
      document.addEventListener('keydown', keyHandler);
      loop(function(){
        current.update();
        current.draw();
      }, 60);
    }
  };

  document.querySelectorAll('.play-card').forEach(function(card){
    card.addEventListener('click', function(){
      stopLoop();
      var game = card.dataset.game;
      if(starters[game]) starters[game]();
    });
  });

})();
