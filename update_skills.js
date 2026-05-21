const fs = require('fs');
const file = 'src/app/pages/home/home.html';
let content = fs.readFileSync(file, 'utf8');

const newSkills = `    <div class="skills-grid">
      <!-- ── Frontend ── -->
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-cat-info">
            <span class="skill-cat-name">Frontend</span>
          </div>
        </div>
        <ul class="skill-list">
          <li class="skill-row"><span class="skill-name">Angular 13–20</span></li>
          <li class="skill-row"><span class="skill-name">TypeScript</span></li>
          <li class="skill-row"><span class="skill-name">JavaScript ES6+</span></li>
          <li class="skill-row"><span class="skill-name">HTML5</span></li>
          <li class="skill-row"><span class="skill-name">SCSS</span></li>
          <li class="skill-row"><span class="skill-name">Tailwind CSS</span></li>
          <li class="skill-row"><span class="skill-name">Angular Material</span></li>
          <li class="skill-row"><span class="skill-name">PrimeNG</span></li>
        </ul>
      </div>

      <!-- ── State & Performance ── -->
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-cat-info">
            <span class="skill-cat-name">State &amp; Performance</span>
          </div>
        </div>
        <ul class="skill-list">
          <li class="skill-row"><span class="skill-name">RxJS</span></li>
          <li class="skill-row"><span class="skill-name">Angular Signals</span></li>
          <li class="skill-row"><span class="skill-name">OnPush Change Detection</span></li>
          <li class="skill-row"><span class="skill-name">Lazy Loading</span></li>
          <li class="skill-row"><span class="skill-name">Code Splitting</span></li>
          <li class="skill-row"><span class="skill-name">SPA Architecture</span></li>
        </ul>
      </div>

      <!-- ── Backend & APIs ── -->
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-cat-info">
            <span class="skill-cat-name">Backend &amp; APIs</span>
          </div>
        </div>
        <ul class="skill-list">
          <li class="skill-row"><span class="skill-name">Node.js</span></li>
          <li class="skill-row"><span class="skill-name">Express.js</span></li>
          <li class="skill-row"><span class="skill-name">REST APIs</span></li>
          <li class="skill-row"><span class="skill-name">JWT Authentication</span></li>
          <li class="skill-row"><span class="skill-name">RBAC Authorization</span></li>
        </ul>
      </div>

      <!-- ── Mobile Development ── -->
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-cat-info">
            <span class="skill-cat-name">Mobile Development</span>
          </div>
        </div>
        <ul class="skill-list">
          <li class="skill-row"><span class="skill-name">Ionic Angular</span></li>
          <li class="skill-row"><span class="skill-name">Capacitor</span></li>
        </ul>
      </div>

      <!-- ── Tools ── -->
      <div class="skill-card">
        <div class="skill-card-header">
          <div class="skill-cat-info">
            <span class="skill-cat-name">Tools</span>
          </div>
        </div>
        <ul class="skill-list">
          <li class="skill-row"><span class="skill-name">Git</span></li>
          <li class="skill-row"><span class="skill-name">GitHub</span></li>
          <li class="skill-row"><span class="skill-name">GitLab</span></li>
          <li class="skill-row"><span class="skill-name">Postman</span></li>
          <li class="skill-row"><span class="skill-name">VS Code</span></li>
          <li class="skill-row"><span class="skill-name">Chrome DevTools</span></li>
        </ul>
      </div>
    </div>`;

content = content.replace(/<div class="skills-grid">[\s\S]*?<!-- \/skills-grid -->/, newSkills + '\n    <!-- /skills-grid -->');
fs.writeFileSync(file, content);
console.log('Skills grid updated successfully!');
