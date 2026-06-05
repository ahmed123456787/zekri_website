/* ═══════════════════════════════════════════════
   DOCTORS DIRECTORY — data + render
   To add a photo: set `photo: 'photoname.jpg'` on a doctor
   (file goes in the project root). Otherwise an initials
   avatar is shown.  `f: true` marks a female doctor.
═══════════════════════════════════════════════ */

const DEPARTMENTS = [
  ['team',  'dept.team'],
  ['ortho', 'dept.ortho'],
];

const DOCTORS = [
  // Founder
  { dept: 'team', name: 'Dr. Zekri Abdennacer', specKey: 'team.d1.r', photo: 'founder.jpg', initials: 'ZA' },

  // Medical team
  { dept: 'team', name: 'Dr. Charaf El Din', specKey: 'spec.dentist', photo: 'team/charaf-el-din.jpg', initials: 'CD' },
  { dept: 'team', name: 'Dr. Tarek',         specKey: 'spec.dentist', initials: 'TA' },
  { dept: 'team', name: 'Dr. Bouzourine',    specKey: 'spec.dentist', initials: 'BO', f: true },
  { dept: 'team', name: 'Dr. Meriem',        specKey: 'spec.dentist', initials: 'ME', f: true },
  { dept: 'team', name: 'Dr. Fairouze',      specKey: 'spec.dentist', initials: 'FA', f: true },
  { dept: 'team', name: 'Dr. Maroua',        specKey: 'spec.dentist', initials: 'MA', f: true },
  { dept: 'team', name: 'Dr. Maroua',        specKey: 'spec.dentist', initials: 'MA', f: true },
  { dept: 'team', name: 'Dr. Karima',        specKey: 'spec.dentist', initials: 'KA', f: true },
  { dept: 'team', name: 'Dr. Souhil',        specKey: 'spec.dentist', photo: 'team/souhil.jpg', initials: 'SO' },
  { dept: 'team', name: 'Dr. Bilal',         specKey: 'spec.dentist', initials: 'BI' },
  { dept: 'team', name: 'Dr. Oussama',       specKey: 'spec.dentist', photo: 'team/oussama.jpg', initials: 'OU' },
  { dept: 'team', name: 'Dr. Yahia',         specKey: 'spec.dentist', initials: 'YA' },
  { dept: 'team', name: 'Dr. Cherif',        specKey: 'spec.dentist', photo: 'team/cherif.jpg', initials: 'CH' },
  { dept: 'team', name: 'Dr. Lahcen',        specKey: 'spec.dentist', initials: 'LA' },
  { dept: 'team', name: 'Dr. Hamouda',       specKey: 'spec.dentist', initials: 'HA' },
  { dept: 'team', name: 'Dr. Omar',          specKey: 'spec.dentist', photo: 'team/omar.jpg', initials: 'OM' },
  { dept: 'team', name: 'Dr. Abdessalam',    specKey: 'spec.dentist', initials: 'AB' },

  // Orthodontics
  { dept: 'ortho', name: 'Dr. Hamid Taibi',   specKey: 'spec.ortho', initials: 'HT' },
  { dept: 'ortho', name: 'Dr. Nour El Houda', specKey: 'spec.ortho', initials: 'NH', f: true },
  { dept: 'ortho', name: 'Dr. Aymen',         specKey: 'spec.ortho', initials: 'AY' },
];

const TOOTH_SVG =
  '<svg viewBox="0 0 24 24"><path d="M12 5.5C10.5 3.8 8 3.3 6.3 4.6 5 5.6 4.5 7.8 5 10.5c.4 2.3 1 4.8 1.5 6.8.3 1.3 1.8 1.3 2.1-.1.3-1.4.6-3.1 1-3.6.2-.3.6-.3.8 0 .4.5.7 2.2 1 3.6.3 1.4 1.8 1.4 2.1.1.5-2 1.1-4.5 1.5-6.8.5-2.7 0-4.9-1.3-5.9C16 3.3 13.5 3.8 12 5.5Z"/></svg>';

(function renderDoctors() {
  const root = document.getElementById('doctorsRoot');
  if (!root) return;

  DEPARTMENTS.forEach(([id, titleKey]) => {
    const docs = DOCTORS.filter(d => d.dept === id);
    if (!docs.length) return;

    const cards = docs.map(d => {
      const photo = d.photo
        ? `<img src="${d.photo}" alt="" class="team-card__img" onerror="this.style.display='none'" />`
        : '';
      const avatarInner = d.initials || TOOTH_SVG;
      const avatarClass = 'team-card__avatar' + (d.f ? ' team-card__avatar--f' : '');

      return `
        <div class="team-card reveal">
          <div class="team-card__photo">${photo}<div class="${avatarClass}">${avatarInner}</div></div>
          <div class="team-card__info">
            <h3>${d.name}</h3>
            <span class="team-card__role" data-i18n="${d.specKey}"></span>
          </div>
        </div>`;
    }).join('');

    const section = document.createElement('div');
    section.className = 'dept';
    section.innerHTML = `
      <div class="dept__title">
        <span data-i18n="${titleKey}"></span>
        <span class="dept__count">${docs.length}</span>
      </div>
      <div class="team__grid">${cards}</div>`;

    root.appendChild(section);
  });
})();
