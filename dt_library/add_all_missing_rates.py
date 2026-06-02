import os

path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/individual_rates.html"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

missing_entries = """
        "littlesossus": {
                "name": "Little Sossus Lodge",
                "location": "Sossusvlei Region",
                "cover": "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Little Sossus Lodge is situated at the junction of the roads to Sossusvlei, Namib Naukluft Park and Maltahöhe, making it the perfect base to explore the Sossusvlei area. The lodge has been designed to blend into the surrounding environment with standard chalet units built from local stone, offering high quality eco-friendly comforts and personal service.",
                "tab1": "\\n            <div class=\\\"content-block\\\">\\n                <h3>STO RATES 2026 (Bed & Breakfast)</h3>\\n                <p class=\\\"raw-text\\\">Rates are in NAD (N$) per room per night (prpn) and include Bed & Breakfast, 15% VAT and 1% Tourism Levy.</p>\\n                <div class=\\\"table-responsive\\\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td><strong>Single Room - B&B</strong></td><td>4500.00</td><td>3600.00</td></tr>\\n                            <tr><td><strong>Double / Twin Room - B&B</strong></td><td>6800.00</td><td>5440.00</td></tr>\\n                            <tr><td><strong>3-Bed Room (Max 2 Adults) - B&B</strong></td><td>7950.00</td><td>6360.00</td></tr>\\n                            <tr><td><strong>4-Bed Room (Max 2 Adults) - B&B</strong></td><td>9100.00</td><td>7280.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\\\"content-block\\\">\\n                <h3>FACILITIES & EXCURSIONS</h3>\\n                <p class=\\\"raw-text\\\">Little Sossus Lodge is an ideal gateway to the famous Sossusvlei dunes, Sesriem Canyon, and Naukluft Mountains hiking trails.</p>\\n                <ul class=\\\"text-list\\\">\\n                    <li><strong>Activities:</strong> Guided Sossusvlei excursions, desert sundowner drives, and scenic hiking trails can be booked directly.</li>\\n                    <li><strong>Facilities:</strong> Main lodge building with dining area, cozy lounge, refreshing outdoor pool, free central Wi-Fi, and a small library.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\\\"content-block\\\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\\\"text-list\\\">\\n                    <li><strong>Rates Basis:</strong> All rates are per room per night on a Bed & Breakfast (B&B) basis. Includes 15% VAT and 1% Bed Levy.</li>\\n                    <li><strong>Child Policy:</strong> Children rates are available upon request and depend on room category.</li>\\n                    <li><strong>Cancellation Policy:</strong> Standard cancellation terms apply: 30-15 days: 50%; less than 14 days: 100%.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 3400,
                                "sto": 2720
                        },
                        "single": {
                                "rack": 4500,
                                "sto": 3600
                        }
                }
        },
        "ohorongo": {
                "name": "Ohorongo Game & Safari Lodge",
                "location": "Outjo / Damaraland Region",
                "cover": "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Ohorongo Game & Safari Lodge is located in a private game reserve in north-western Namibia, between Outjo and Kamanjab. Surrounded by granite hills and expansive mopane woodlands, the lodge offers outstanding wildlife encounters, exceptional hospitality, and an exclusive safari experience in one of Namibia's oldest conservation areas.",
                "tab1": "\\n            <div class=\\\"content-block\\\">\\n                <h3>STO RATES 2026 (Dinner, Bed & Breakfast)</h3>\\n                <p class=\\\"raw-text\\\">Rates are in NAD (N$) per person per night (pppn) on Dinner, Bed & Breakfast (DBB) basis, including 15% VAT and 2% Tourism Levy.</p>\\n                <div class=\\\"table-responsive\\\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO NET RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Low Season (Jan-Mar, May-Jun, Dec)</td></tr>\\n                            <tr><td><strong>Luxury Chalet (Sharing) - DBB</strong></td><td>5500.00</td><td>4400.00</td></tr>\\n                            <tr><td><strong>Luxury Chalet (Single) - DBB</strong></td><td>6500.00</td><td>5200.00</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">High Season (Apr, Jul-Nov)</td></tr>\\n                            <tr><td><strong>Luxury Chalet (Sharing) - DBB</strong></td><td>6900.00</td><td>5520.00</td></tr>\\n                            <tr><td><strong>Luxury Chalet (Single) - DBB</strong></td><td>7900.00</td><td>6320.00</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Extras & Guides</td></tr>\\n                            <tr><td><strong>Tour Guide - DBB</strong></td><td>700.00</td><td>700.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\\\"content-block\\\">\\n                <h3>ACTIVITIES & EXCURSIONS</h3>\\n                <ul class=\\\"text-list\\\">\\n                    <li><strong>Game Drives:</strong> Guided morning and afternoon game drives in open 4x4 vehicles to track black rhino, elephant, lion, leopard, and cheetah.</li>\\n                    <li><strong>Rhino Tracking:</strong> Immersive walking or vehicle tracking of free-roaming black rhinos with expert game rangers (complimentary for stays of 3+ nights).</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\\\"content-block\\\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\\\"text-list\\\">\\n                    <li><strong>Rate Includes:</strong> Luxury en-suite accommodation, breakfast, afternoon tea/coffee & cakes, 3-course dinner, and laundry service for stays of 2+ nights.</li>\\n                    <li><strong>Cancellation Policy:</strong> 45-22 days: 25% fee; 21-14 days: 50% fee; less than 14 days or no-show: 100% cancellation fee.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 5500,
                                "sto": 4400
                        },
                        "single": {
                                "rack": 6500,
                                "sto": 5200
                        },
                        "guide": {
                                "rack": 700,
                                "sto": 700
                        }
                }
        },
        "kaokomopane": {
                "name": "Kaoko Mopane Lodge",
                "location": "Kunene River / Kaokoland",
                "cover": "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Kaoko Mopane Lodge is situated in the rugged, magnificent Kaokoland region of north-western Namibia. Offering comfort and style in standard and luxury rooms, the lodge is surrounded by beautiful ancient mopane forests and provides a cool oasis from the heat of the Kaokoveld wilderness.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person or per room per night as indicated, including 15% VAT and NTB Tourism levies.</p>\\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Dinner, Bed & Breakfast (DBB)</td></tr>\\n                            <tr><td><strong>Luxury Room (Sharing) - DBB</strong></td><td>2260.00</td><td>1921.00</td></tr>\\n                            <tr><td><strong>Luxury Room (Single) - DBB</strong></td><td>2650.00</td><td>2252.50</td></tr>\\n                            <tr><td><strong>Child (4-12 Years) - DBB</strong></td><td>950.00</td><td>807.50</td></tr>\\n                            <tr><td><strong>Tour Guide - DBB</strong></td><td>1150.00</td><td>1150.00</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Bed & Breakfast (BB)</td></tr>\\n                            <tr><td><strong>Luxury Room (Sharing) - BB</strong></td><td>1780.00</td><td>1513.00</td></tr>\\n                            <tr><td><strong>Luxury Room (Single) - BB</strong></td><td>2200.00</td><td>1870.00</td></tr>\\n                            <tr><td><strong>Child (4-12 Years) - BB</strong></td><td>600.00</td><td>510.00</td></tr>\\n                            <tr><td><strong>Tour Guide - BB</strong></td><td>900.00</td><td>900.00</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Camping (Room Only)</td></tr>\\n                            <tr><td><strong>Standard Campsite (Per Person)</strong></td><td>300.00</td><td>255.00</td></tr>\\n                            <tr><td><strong>Overlander Campsite (Group 10+ Pax)</strong></td><td>250.00</td><td>212.50</td></tr>\\n                            <tr><td><strong>Child Campsite (4-12 Years)</strong></td><td>150.00</td><td>127.50</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>ACTIVITIES & EXCURSIONS</h3>\\n                <p class=\"raw-text\">Explore Kaokoland with our daily excursions led by professional local guides.</p>\\n                <ul class=\"text-list\">\\n                    <li><strong>Himba Village Excursion:</strong> Respectful guided cultural visits to local authentic Himba settlements.</li>\\n                    <li><strong>Full Day Epupa Falls Tour:</strong> Excursions up to the Kunene River border to view the waterfalls.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Rates Basis:</strong> Room rates are BB or DBB as indicated. Includes 15% VAT and bed levy.</li>\\n                    <li><strong>Child Policy:</strong>\n                        <br>- Children 0-3 years sharing with adults stay FREE.\n                        <br>- Children 4-12 years pay child rates as listed.\n                    </li>\\n                    <li><strong>Cancellation Policy:</strong> Standard industry cancellation rules apply. Detailed terms provided at booking confirmation.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 1780,
                                "sto": 1513
                        },
                        "single": {
                                "rack": 2200,
                                "sto": 1870
                        },
                        "guide": {
                                "rack": 900,
                                "sto": 900
                        },
                        "camping": {
                                "rack": 300,
                                "sto": 255
                        }
                }
        },
        "moonmountain": {
                "name": "Moon Mountain Lodge",
                "location": "Sossusvlei Region",
                "cover": "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Moon Mountain Lodge is an ultra-luxury tented lodge situated in the Naukluft Mountains, offering magnificent views of the Namib Desert dunes below. Each luxury tented unit features its own private splash pool, and is built on wood decks high up on the mountain slope. An exceptional desert getaway.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Dinner, Bed & Breakfast)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person per night (pppn) on a Dinner, Bed & Breakfast (DBB) basis, including 15% VAT and bed levy.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td><strong>Luxury Room (Sharing) - DBB</strong></td><td>3800.00</td><td>3040.00</td></tr>\\n                            <tr><td><strong>Luxury Room (Single) - DBB</strong></td><td>4900.00</td><td>3920.00</td></tr>\\n                            <tr><td><strong>Executive Suite (Sharing) - DBB</strong></td><td>4600.00</td><td>3680.00</td></tr>\\n                            <tr><td><strong>Executive Suite (Single) - DBB</strong></td><td>5900.00</td><td>4720.00</td></tr>\\n                            <tr><td><strong>Tour Guide Room - DBB</strong></td><td>900.00</td><td>900.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>FACILITIES & EXCURSIONS</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Splash Pools:</strong> Every unit features a private plunge pool overlooking the vast desert plains.</li>\\n                    <li><strong>Activities:</strong> Desert drives, hot air ballooning over Sossusvlei, and stargazing can be arranged directly.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Included:</strong> Luxury en-suite accommodation, breakfast, 3-course dinner, afternoon tea/coffee & cakes, VAT, and Tourism Levy.</li>\\n                    <li><strong>Child Policy:</strong> Children under 6 years stay FOC when sharing with 2 paying adults. Children 7-12 pay 50% rate.</li>\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 3800,
                                "sto": 3040
                        },
                        "single": {
                                "rack": 4900,
                                "sto": 3920
                        },
                        "guide": {
                                "rack": 900,
                                "sto": 900
                        }
                }
        },
        "nooishof": {
                "name": "Nooishof Guesthouse",
                "location": "Southern Namibia Region",
                "cover": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Nooishof is an exclusive, luxury guesthouse located in Southern Namibia, offering a highly personalized and secluded retreat. Accommodations consist of just four magnificent suites, ensuring absolute privacy. The rate is fully inclusive of gourmet meals, premier beverages, and premium nature drives.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Fully Inclusive)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person per night (pppn) on a Fully Inclusive (FI) basis, including VAT and Tourism Levies.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>SUITE CATEGORY & PLAN</th><th>RACK RATE</th><th>STO NET RATE (25%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td><strong>Luxury Suite (Sharing) - Fully Inclusive</strong></td><td>8100.00</td><td>6075.00</td></tr>\\n                            <tr><td><strong>Luxury Suite (Single) - Fully Inclusive</strong></td><td>4050.00</td><td>3037.50</td></tr>\\n                            <tr><td><strong>Family Suite (Adult Sharing) - Fully Inclusive</strong></td><td>8100.00</td><td>6075.00</td></tr>\\n                            <tr><td><strong>Tour Guide - Fully Inclusive</strong></td><td>1100.00</td><td>1100.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>FULLY INCLUSIVE SPECIFICATIONS</h3>\\n                <p class=\"raw-text\">Your fully inclusive rate covers a comprehensive premium package of meals, drinks, and activities.</p>\n                <ul class=\"text-list\">\\n                    <li><strong>All Meals Included:</strong> Full breakfasts, gourmet lunches, afternoon cakes, and spectacular 4-course dinners.</li>\\n                    <li><strong>Beverages:</strong> Selection of soft drinks, local brand beers, house wines, local spirits, and teas/coffees.</li>\\n                    <li><strong>Premium Activities:</strong> Daily scenic nature drives, guided wilderness walks, and e-biking.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Child Policy:</strong> Children up to 3 years stay free of charge. Children 4-15 years sharing family suite receive special rates.</li>\\n                    <li><strong>Cancellation Terms:</strong> 10% fee from final confirmation to 31 days before arrival; 50% between 15-30 days; 100% within 14 days of arrival.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 8100,
                                "sto": 6075
                        },
                        "single": {
                                "rack": 4050,
                                "sto": 3037
                        }
                }
        },
        "luderitznest": {
                "name": "Lüderitz Nest Hotel",
                "location": "Lüderitz / Coast Region",
                "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Lüderitz Nest Hotel is one of Namibia's premier coastal resort hotels, built directly on the rocks at the edge of the Atlantic Ocean. Overlooking its own private tidal beach, the hotel features luxury air-conditioned comfort and deluxe rooms with uninterrupted ocean views. The perfect base to explore Lüderitz and the ghost town of Kolmanskop.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Bed & Breakfast)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per ROOM per night on a Bed & Breakfast (B&B) basis, including 15% VAT and 2% Tourism Levy.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ROOM TYPE & PLAN</th><th>RACK RATE</th><th>STO NET RATE (15%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td><strong>Comfort Room (Single) - B&B</strong></td><td>2960.00</td><td>2529.91</td></tr>\\n                            <tr><td><strong>Comfort Room (Double/Twin) - B&B</strong></td><td>4760.00</td><td>4068.38</td></tr>\\n                            <tr><td><strong>Comfort Family Room - B&B</strong></td><td>7720.00</td><td>6598.29</td></tr>\\n                            <tr><td><strong>Deluxe Room (Single) - B&B</strong></td><td>3630.00</td><td>3102.56</td></tr>\\n                            <tr><td><strong>Deluxe Room (Double/Twin) - B&B</strong></td><td>5540.00</td><td>4710.26</td></tr>\\n                            <tr><td><strong>Tour Guide Room - B&B</strong></td><td>850.00</td><td>850.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>FACILITIES & RESTAURANT</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Penguin Restaurant:</strong> Renowned coastal restaurant serving fresh Lüderitz oysters, seafood platters, and international cuisine.</li>\\n                    <li><strong>Facilities:</strong> Outdoor sparkling pool, private tidal beach, free high-speed Wi-Fi throughout, sauna, and fully equipped conference facilities.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Child Policy:</strong> Children up to 3 years sharing stay free of charge. Children 4-12 years pay special rates on accommodation.</li>\\n                    <li><strong>Cancellation Terms:</strong> 30-22 days: 25%; 21-14 days: 50%; less than 14 days or no-show: 100% cancellation fee.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 4760,
                                "sto": 4068
                        },
                        "single": {
                                "rack": 2960,
                                "sto": 2529
                        },
                        "guide": {
                                "rack": 850,
                                "sto": 850
                        }
                }
        },
        "okonjima": {
                "name": "Okonjima Plains Camp & Bush Camp",
                "location": "Otjiwarongo / Central North Region",
                "cover": "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Okonjima is the home of the AfriCat Foundation, a world-famous conservation project dedicated to protecting Namibia's large carnivores. The reserve offers outstanding opportunities to track leopards and cheetahs, and offers luxury accommodations at Plains Camp and Bush Camp.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Half Board / DBB)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person per night (pppn) on half-board (Dinner, Bed & Breakfast) basis. Includes 15% VAT and bed levies.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO NET RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Low Season (01 Jan 2026 - 30 Jun 2026)</td></tr>\\n                            <tr><td><strong>Plains Camp Classic (Sharing) - DBB</strong></td><td>4830.00</td><td>3864.00</td></tr>\\n                            <tr><td><strong>Plains Camp Classic (Single) - DBB</strong></td><td>5830.00</td><td>4664.00</td></tr>\\n                            <tr><td><strong>Plains Camp View (Sharing) - DBB</strong></td><td>7000.00</td><td>5600.00</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">High Season (01 Jul 2026 - 31 Dec 2026)</td></tr>\\n                            <tr><td><strong>Plains Camp Classic (Sharing) - DBB</strong></td><td>5320.00</td><td>4256.00</td></tr>\\n                            <tr><td><strong>Plains Camp Classic (Single) - DBB</strong></td><td>6420.00</td><td>5136.00</td></tr>\\n                            <tr><td><strong>Plains Camp View (Sharing) - DBB</strong></td><td>7700.00</td><td>6160.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>ACTIVITIES & EXCURSIONS</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Leopard Tracking:</strong> Radio-tracking of free-roaming leopards in the private Okonjima Nature Reserve.</li>\\n                    <li><strong>AfriCat Centre:</strong> Immersive educational tours of the AfriCat Foundation carnivore care centre.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Rates Basis:</strong> Room rates include half-board accommodation, VAT, and Tourism Levies.</li>\\n                    <li><strong>Cancellation Policy:</strong> Standard Okonjima group/individual policies apply. 45 days prior: 25% fee; less than 15 days: 100% fee.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 4830,
                                "sto": 3864
                        },
                        "single": {
                                "rack": 5830,
                                "sto": 4664
                        }
                }
        },
        "lianshulu": {
                "name": "Lianshulu Lodge",
                "location": "Zambezi & Caprivi Region",
                "cover": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Lianshulu Lodge is nestled in a lush riverine forest on the banks of the Kwando River in the Mudumu National Park, Caprivi strip. The lodge is renowned for its outstanding birdlife, wilderness safaris, and tranquil atmosphere, providing an authentic river wilderness experience in the north-east of Namibia.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Dinner, Bed & Breakfast)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person per night (pppn) on a Dinner, Bed & Breakfast (DBB) basis, including 15% VAT and bed levy.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO NET RATE (15%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">Low Season (Dec-Jun)</td></tr>\\n                            <tr><td><strong>Luxury Twin Chalet (Sharing) - DBB</strong></td><td>5397.00</td><td>4587.45</td></tr>\\n                            <tr><td><strong>Luxury Twin Chalet (Single) - DBB</strong></td><td>7015.00</td><td>5962.75</td></tr>\\n                            <tr><td colspan=\"3\" style=\"background: rgba(164, 130, 86, 0.1); font-weight: bold; text-align: left; padding: 10px 15px;\">High Season (Jul-Nov)</td></tr>\\n                            <tr><td><strong>Luxury Twin Chalet (Sharing) - DBB</strong></td><td>6450.00</td><td>5482.50</td></tr>\\n                            <tr><td><strong>Luxury Twin Chalet (Single) - DBB</strong></td><td>8300.00</td><td>7055.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>ACTIVITIES & EXCURSIONS</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>River Boat Cruises:</strong> Scenic morning and sunset boat cruises along the Kwando River to spot hippos, crocodiles, and birds.</li>\\n                    <li><strong>Game Drives:</strong> Guided game drives in the Mudumu National Park to view elephants, buffalo, and antelope.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Rates Basis:</strong> Room rates are Dinner, Bed & Breakfast (DBB) and include 15% VAT and bed levies.</li>\\n                    <li><strong>Cancellation Terms:</strong> Standard cancellation terms apply: 30-15 days: 50%; less than 14 days: 100%.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 5397,
                                "sto": 4587
                        },
                        "single": {
                                "rack": 7015,
                                "sto": 5962
                        }
                }
        },
        "norotshama": {
                "name": "Norotshama River Resort",
                "location": "Orange River / Southern Namibia",
                "cover": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
                "images": [
                        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
                ],
                "intro": "Norotshama River Resort is a shallow oasis situated on the banks of the Orange River in the south of Namibia, close to Noordoewer. Surrounded by Namibia's wild grape vineyards and dramatic desert mountains, the resort is a magnificent getaway for canoe trips and pure rest.",
                "tab1": "\\n            <div class=\"content-block\">\\n                <h3>STO RATES 2026 (Dinner, Bed & Breakfast)</h3>\\n                <p class=\"raw-text\">Rates are in NAD (N$) per person per night (pppn), including Dinner, Bed & Breakfast, VAT, and Tourism Levies.</p>\n                <div class=\"table-responsive\">\\n                    <table>\\n                        <thead><tr><th>ACCOMMODATION TYPE & PLAN</th><th>RACK RATE</th><th>STO NET RATE (20%)</th></tr></thead>\\n                        <tbody>\\n                            <tr><td><strong>Luxury Chalet (Sharing) - DBB</strong></td><td>1780.00</td><td>1513.00</td></tr>\\n                            <tr><td><strong>Luxury Chalet (Single) - DBB</strong></td><td>2200.00</td><td>1870.00</td></tr>\\n                            <tr><td><strong>Guide Room - DBB</strong></td><td>900.00</td><td>900.00</td></tr>\\n                        </tbody>\\n                    </table>\\n                </div>\\n            </div>\\n        ",
                "tab2": "\\n            <div class=\"content-block\">\\n                <h3>ACTIVITIES & EXCURSIONS</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>River Canoeing:</strong> Half-day and full-day guided canoe trips down the peaceful Orange River.</li>\\n                    <li><strong>Vineyard Excursions:</strong> Scenic walking tours of the surrounding grape vineyards.</li>\\n                </ul>\\n            </div>\\n        ",
                "tab3": "\\n            <div class=\"content-block\">\\n                <h3>POLICIES & GENERAL INFORMATION</h3>\\n                <ul class=\"text-list\">\\n                    <li><strong>Rates Basis:</strong> Dinner, Bed & Breakfast (DBB) basis. Includes 15% VAT and bed levy.</li>\\n                    <li><strong>Cancellation Terms:</strong> Standard cancellation terms apply: 30-15 days: 50%; less than 14 days: 100%.</li>\\n                </ul>\\n            </div>\\n        ",
                "rates": {
                        "sharing": {
                                "rack": 1780,
                                "sto": 1513
                        },
                        "single": {
                                "rack": 2200,
                                "sto": 1870
                        }
                }
        },
"""

target_str = '"ababis": {'
if target_str in content:
    new_content = content.replace(target_str, missing_entries + '\\n        "ababis": {')
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully injected all 8 missing hotels into individual_rates.html DB!")
else:
    print("Error: Target anchor not found!")
