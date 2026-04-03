document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.getElementById('lodge-nav');
  const lodgesContainer = document.getElementById('lodges-container');

  // Generate Navigation
  pricelistData.lodges.forEach((lodge, index) => {
    const btn = document.createElement('button');
    btn.className = `nav-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = lodge.name.split('—')[0].trim(); // Short name
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLodge(lodge);
      // Let it reset on the full hero picture with the navigation right at the top
      window.scrollTo({
        top: document.getElementById('lodge-nav').offsetTop,
        behavior: 'smooth'
      });
    });
    navContainer.appendChild(btn);
  });

  // Create Terms and Conditions Tab
  const tncBtn = document.createElement('button');
  tncBtn.className = 'nav-btn';
  tncBtn.textContent = 'Terms & Conditions';
  tncBtn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    tncBtn.classList.add('active');
    renderTnc();
    window.scrollTo({
      top: document.getElementById('lodge-nav').offsetTop,
      behavior: 'smooth'
    });
  });
  navContainer.appendChild(tncBtn);

  // Create Map Tab
  const mapBtn = document.createElement('button');
  mapBtn.className = 'nav-btn';
  mapBtn.textContent = 'Route Map';
  mapBtn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    mapBtn.classList.add('active');
    renderMap();
    window.scrollTo({
      top: document.getElementById('lodge-nav').offsetTop,
      behavior: 'smooth'
    });
  });
  navContainer.appendChild(mapBtn);

  // Render initial lodge
  if (pricelistData.lodges.length > 0) {
    renderLodge(pricelistData.lodges[0]);
  }

  function renderLodge(lodge) {
    let seasonsHtml = lodge.seasons.map(season => `
      <div class="season-block">
        <h3 class="season-title">
          <span>${season.name}</span>
          <span class="season-date">${season.dateRange}</span>
        </h3>
        <table>
          <thead>
            <tr>
              ${season.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${season.rates.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    let extrasHtml = '';
    if (lodge.extras) {
      extrasHtml = `
        <div class="extras-section">
          <h3 class="season-title" style="color: var(--white); border-bottom: 2px solid var(--primary); padding-bottom: 10px; display: inline-block;">EXTRAS / ACTIVITIES</h3>
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  ${lodge.extras.headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${lodge.extras.items.map(row => `
                  <tr>
                    ${row.map(cell => `<td>${cell || '-'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Image placeholder block with title overlay
    const imageBlock = `
      <div class="lodge-image-container" style="position: relative; text-align: center; background: var(--dark); padding: 0;">
        <img src="${lodge.image}" alt="${lodge.name}" style="width: 100%; height: 500px; object-fit: cover; display: block; filter: brightness(0.7);" onerror="this.style.display='none'">
        
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <h2 style="font-family: var(--font-heading); font-size: 3.5rem; color: var(--white); text-shadow: 0 4px 15px rgba(0,0,0,0.5); margin: 0; padding: 0 20px;">${lodge.name}</h2>
        </div>
        
        ${lodge.logo ? `
        <div style="position: absolute; top: 30px; left: 30px; z-index: 10; padding: 10px; background: rgba(245, 240, 235, 0.95); box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 2px;">
          <img src="${lodge.logo}" alt="${lodge.name} Logo" style="width: 160px; height: auto; mix-blend-mode: multiply; border: none !important;">
        </div>
        ` : `
        <div style="position: absolute; top: 30px; left: 30px; z-index: 10; width: 160px; height: 120px; background: rgba(245, 240, 235, 0.8); border: 2px dashed var(--primary); display: flex; align-items: center; justify-content: center; border-radius: 2px;">
          <span style="color: var(--primary-dark); font-family: var(--font-body); font-size: 0.8rem; text-align: center; padding: 10px; font-weight: 500;">Add 'logo' URL<br>in data.js</span>
        </div>
        `}
        
        <div style="position: absolute; bottom: 30px; left: 50%; animation: pulseBounce 2s infinite ease-in-out; cursor: pointer; display: flex; flex-direction: column; align-items: center;" onclick="window.scrollTo({top: document.getElementById('lodge-nav').offsetTop + 550, behavior: 'smooth'})">
          <span style="color: var(--white); font-family: var(--font-body); text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 5px;">Discover our rates</span>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    `;

    lodgesContainer.innerHTML = `
      <div class="lodge-card">
        ${imageBlock}
        
        <div class="rates-table-wrap">
          ${seasonsHtml}
        </div>
        
        ${lodge.notes ? `<div class="notes"><strong>Accommodation Notes:</strong><br>${lodge.notes}</div>` : ''}
        
        ${extrasHtml}
      </div>
    `;
  }

  function renderTnc() {
    lodgesContainer.innerHTML = `
      <div class="lodge-card" style="padding: 60px; background: var(--white); border-radius: var(--radius); text-align: left;">
        <h2 style="font-family: var(--font-heading); font-size: 3rem; color: var(--primary); margin-bottom: 40px; text-align: center;">Terms & Conditions</h2>
        
        <div style="font-family: var(--font-body); font-size: 1rem; color: var(--dark); line-height: 1.8;">
          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">RESERVATION</h3>
          <p>All reservations should be confirmed in writing.</p>
          <ul style="margin-left: 25px; margin-bottom: 20px; color: #555;">
            <li>Provisional reservations will be held for 14 days from the date of receiving the provisional booking confirmation.</li>
            <li>Provisional bookings arriving within 28 days will only be held for 72 hours.</li>
            <li>Provisional bookings arriving within 14 days will only be held for 48 hours.</li>
            <li>All provisional bookings may automatically be released if no confirmation or written request for an extension has been received within the time or on the date of expiry of provisional booking.</li>
          </ul>

          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">CANCELLATION POLICY FOR INDIVIDUAL RESERVATIONS (FIT) 1 - 6 PEOPLE</h3>
          <p>A 10% non-refundable deposit (commitment) is required to secure a confirmed booking.</p>
          <ul style="margin-left: 25px; margin-bottom: 20px; color: #555;">
            <li>Cancellation from time of confirmation till 29 days before arrival: 10% of total</li>
            <li>Cancellation within 4 weeks (28 days inclusive) before arrival: 25% of total</li>
            <li>Cancellation 3 weeks (21 days inclusive) before arrival: 50% of total</li>
            <li>Cancellation 2 weeks (14 days inclusive) before arrival: 75% of total</li>
            <li>Less than 1 week (7 days inclusive) before arrival: 90% of total</li>
            <li>No show or less than 24hrs: 100% of total booking</li>
          </ul>

          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">CANCELLATION POLICY FOR GROUPS WITH 7 PEOPLE AND MORE</h3>
          <ul style="margin-left: 25px; margin-bottom: 20px; color: #555;">
            <li>Cancellation 56 &ndash; 29 days before arrival: 10% of total</li>
            <li>Cancellation within 4 weeks (28 days inclusive) before arrival: 25% of total</li>
            <li>Cancellation 3 weeks (21 days inclusive) before arrival: 50% of total</li>
            <li>Cancellation 2 weeks (14 days inclusive) before arrival: 75% of total</li>
            <li>Less than 1 week (7 days inclusive) before arrival: 90% of total</li>
            <li>No show or less than 24hrs: 100% of total booking</li>
          </ul>
          <p style="margin-bottom: 15px; color: #555;">We do reserve the right to contact you should we require the rooms of the contingent blocked for a confirmed booking request and would request you release any unconfirmed rooms within one working day.</p>
          <p style="margin-bottom: 20px; color: #555;">Confirmed reservations made and cancelled within the cancellation period will be charged according to the cancellation policy. Should you cancel a booking we will acknowledge it in writing. Please ensure that your cancellation has been processed and that you have received written confirmation that it is cancelled.</p>

          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">PAYMENT</h3>
          <p style="margin-bottom: 20px; color: #555;">All individual bookings are provisional until the requested 10% deposit is received. Payment on confirmed bookings can be done by EFT or a Payment Link can be sent within 48 hours of making the reservation. Outstanding balances must be submitted per EFT latest 30 days prior to arrival or a payment link can be provided at 45&ndash;60 days prior to check-in. You will be required to present your card on check-in for verification of filed credentials.</p>

          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">BLOCK BOOKINGS</h3>
          <p>A limited number of block bookings will be considered on special requests, however the following terms and conditions apply:</p>
          <ul style="margin-left: 25px; margin-bottom: 20px; color: #555;">
            <li>Provisional rooming list and room allocation to be supplied 180 days prior to arrival</li>
            <li>Preliminary rooming list and room allocation to be supplied 90 days prior to arrival</li>
            <li>Final numbers and room lists must be supplied 60 days prior to arrival &ndash; from 56 days (8 weeks) prior to arrival this cancellation policy will apply</li>
            <li>The best policy for both parties involved is to keep Ondili Lodges updated at all times to avoid unnecessary follow-ups and room release requests</li>
          </ul>

          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">CHILDREN'S POLICY</h3>
          <p style="margin-bottom: 20px; color: #555;">Adults accompanied by children take full responsibility for the conduct and safety of their children. Children under the age of 12 might not be allowed to take part in all activities offered.</p>
          
          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">CHECK IN / OUT TIMES</h3>
          <p style="margin-bottom: 20px; color: #555;">Check-in at 14h00 and check-out at 10h00. These times can be flexible with prior arrangement.</p>
          
          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">TRANSFERS</h3>
          <p style="margin-bottom: 20px; color: #555;">Airport transfers from Ondili airstrips are complimentary, while transfers from non-Ondili airstrips are available on request at an additional charge.</p>
          
          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">ACTIVITIES & WILDLIFE DISCLAIMER</h3>
          <p style="margin-bottom: 20px; color: #555;">Ondili Lodges operate in natural environments where wildlife moves freely. Animals are unpredictable, and sightings cannot be guaranteed. All activities, including game drives, guided walks, horse riding, and excursions, are undertaken at the guest’s own risk. Participation is voluntary and subject to guest fitness and safety considerations.</p>
          
          <h3 style="color: var(--primary-dark); font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px;">GENERAL INDEMNITY</h3>
          <p style="margin-bottom: 20px; color: #555;">Guests enter and make use of Ondili Lodges and its facilities entirely at their own risk. Ondili Lodges, its employees, and representatives shall not be held liable for any loss, damage, injury, or death arising from any cause whatsoever.</p>
        </div>
      </div>
    `;
  }

  function renderMap() {
    lodgesContainer.innerHTML = `
      <div class="lodge-card" style="padding: 40px; background: var(--white); border-radius: var(--radius); text-align: center;">
        <h2 style="font-family: var(--font-heading); font-size: 3rem; color: var(--primary); margin-bottom: 30px;">Route Map</h2>
        <div style="max-width: 100%; margin: 0 auto; border: 4px solid var(--secondary); border-radius: var(--radius); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
           <img src="https://i.ibb.co/7df9BdBQ/Screenshot-2026-04-02-at-20-36-38.png" alt="Ondili Lodges Tour Route Map" style="width: 100%; height: auto; display: block;">
        </div>
      </div>
    `;
  }
});
