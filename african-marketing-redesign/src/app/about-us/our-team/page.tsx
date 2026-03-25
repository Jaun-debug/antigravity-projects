const departments = [
  { name: 'Sales', members: ['Monnique Kruger (Sales Manager Retail)', 'Senoritha Geingob', 'Juandre Nels', 'Bianca Diedericks', 'Edvina Barman', 'Anné Dodds', 'Helmud Gariseb', 'Johannes Tjituka', 'Petrus Mungungu', 'Luis Rodrigues (North)', 'Marvin Sem (North)', 'Cetric Boois', 'John Engels (Regional Manager)', 'Ndangi Kaisungu (Walvis Bay)', 'Anneke De Beer (Walvis Bay)', 'Lazarus Kaitungwa (Walvis Bay)'] },
  { name: 'Customer Care', members: ['Cate-lane Coetzee (Supervisor)', 'Eva Josef', 'Hendrina Frans', 'Ndaki Haufiku'] },
  { name: 'Operations', members: ['Andrea Metzger (Operations Manager)', 'Thikus Shagandjua (Logistics Supervisor)', 'Anastasia Kaperu (Warehouse Supervisor)', 'Hansie Engels (Warehouse Manager)', 'Cazcilia Van Wyk (Procurement Supervisor)'] },
  { name: 'Accounts', members: ['Alida Reimer-Cline (Financial Manager)', 'Resty Celento (Debtors Supervisor)', 'Beverly Britz', 'Charmaine Modise', 'Victoria Kahoro'] },
  { name: 'Human Resources', members: ['Annabell Diergaardt'] },
  { name: 'Branding & Marketing', members: ['Renier van Zyl'] },
  { name: 'System Administrator', members: ['Waldamar van Wyk'] }
];

export default function OurTeamPage() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Our Team</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-16">
          We are proudly a Namibian owned company with a dynamic hardworking team ensuring excellent service.
        </p>

        <div className="flex flex-col gap-16 text-left">
          {departments.map((dept, i) => (
            <div key={i}>
              <h2 className="text-xl tracking-widest text-brand-600 font-bold uppercase mb-8 border-b border-stone-200 pb-2">{dept.name}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {dept.members.map((member, j) => (
                  <div key={j} className="bg-stone-50 p-6 rounded-xl border border-stone-100 shadow-sm">
                    <p className="font-serif font-bold text-stone-800 leading-tight">{member.split(' (')[0]}</p>
                    {member.includes('(') && <p className="text-xs text-brand-500 font-semibold mt-2 uppercase tracking-wider">{member.split('(')[1].replace(')', '')}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
