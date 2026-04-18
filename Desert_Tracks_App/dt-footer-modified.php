<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after
 */
?>
		</div><!-- #content -->

<?php 
$language = isset($_GET['lang']) ? $_GET['lang'] : '';
global $hideFooter; 

if (!$hideFooter) {
    $translations = '';
    if ($language) {
        if (file_exists(get_template_directory() . '/' . 'template-parts/' . '/translations/' . $language .'/footer-content' . '.php')) {
            $translations = '/translations/' . $language;
        }
    }
?>
    
    <!-- ✅ Desert Tracks Custom Mega Footer -->
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600&family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      .dt-mega-footer {
        background: #1F4F4B; /* ✅ Dark green background */
        color:#fff;
        font-family:"Open Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        padding:50px 40px 40px;
        width:100%;
        position:relative;
        z-index:1; /* footer stays below header */
        pointer-events:auto;
      }

      /* Links */
      .dt-mega-footer a {
        color:#fff;
        text-decoration:none;
        font-weight:300;
        font-size:14px;
        letter-spacing:.3px;
      }
      .dt-mega-footer a:hover { color:#8CB5A3; text-decoration:underline; }

      /* 3-column grid */
      .dt-mf-grid {
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap:40px 28px;
        margin:0 auto;
        text-align:center;
      }
      @media (max-width:900px){ .dt-mf-grid{ grid-template-columns:1fr 1fr; } }
      @media (max-width:520px){ .dt-mf-grid{ grid-template-columns:1fr; } }

      /* Headings */
      .dt-mf-col h4 {
        margin:0 0 18px;
        font-size:18px;
        font-weight:400;
        color:#9B6A35;
        letter-spacing:.5px;
      }
      .dt-mf-col ul { list-style:none; margin:0; padding:0; }
      .dt-mf-col li { margin:8px 0; }

      /* Social icons */
      .dt-social{
        display:flex; justify-content:center; gap:16px;
        margin:42px 0 0;
      }
      .dt-social a{
        width:40px; height:40px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        background:#9B6A35;
        opacity:.9;
        position:relative;
        transition:all .3s ease;
      }
      .dt-social a:hover{ background:#8CB5A3; }
      .dt-social svg{ width:20px; height:20px; fill:#fff; }

      .dt-social a::after {
        content: attr(data-label);
        position:absolute;
        bottom:50px;
        background:#000;
        color:#fff;
        font-size:12px;
        padding:4px 8px;
        border-radius:4px;
        opacity:0;
        pointer-events:none;
        transition:opacity .3s ease;
        white-space:nowrap;
      }
      .dt-social a:hover::after { opacity:1; }

      .dt-mf-hr{
        height:1px; background:rgba(255,255,255,.15);
        margin:113px 0 20px;
        width:100%;
      }

      .dt-mf-bottom{
        color:rgba(255,255,255,.75);
        font-size:13px; font-weight:300; text-align:center;
      }
      .dt-mf-bottom a{ color:rgba(255,255,255,.75); }
      .dt-mf-bottom a:hover{ color:#8CB5A3; }

      /* Ensure header dropdowns stay above footer */
      header, .site-header, nav, .menu, .dropdown, ul.sub-menu {
        position: relative;
        z-index: 9999;
      }

      /* Premium Cinzel Logo Styling for Footer */
      .dt-emblem-wrap-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none !important;
        transition: opacity 0.3s ease;
        margin-bottom: 20px;
      }
      .dt-emblem-wrap-footer:hover {
        opacity: 0.85;
      }
      .dt-emblem-text-footer {
        font-family: 'Cinzel', serif !important;
        font-size: 36px !important;
        font-weight: 400 !important;
        font-style: normal !important;
        text-transform: uppercase;
        letter-spacing: 3px;
        color: #9B6A35; /* Same beautiful bronze-gold from the header */
        line-height: 1;
      }
      .dt-emblem-sub-footer {
        font-family: 'Open Sans', sans-serif !important;
        font-size: 11px !important;
        font-weight: 300 !important;
        letter-spacing: 5px;
        color: #fff; /* White subtitle contrasts nicely against dark footer */
        text-transform: uppercase;
        margin-top: 6px;
      }
      
      @media (max-width:768px) {
        .dt-emblem-text-footer { font-size: 24px !important; }
        .dt-emblem-sub-footer { font-size: 8px !important; letter-spacing: 4px; margin-top: 4px; }
      }
    </style>

    <div class="dt-mega-footer">

      <!-- 3 columns -->
      <div class="dt-mf-grid">

        <!-- About -->
        <div class="dt-mf-col">
          <h4>About Desert Tracks</h4>
          <ul>
            <li><a href="/namibia-weather/">Best Time to Visit Namibia</a></li>
            <li><a href="/about/">About Us</a></li>
            <li><a href="/desert-tracks-contact/">Contact</a></li>
            <li><a href="https://desert-tracks.com/namibia-east-africa-travel-guide/">Safari Blog</a></li>
            <li><a href="/">Home</a></li>
          </ul>
        </div>

        <!-- Destinations -->
        <div class="dt-mf-col">
          <h4>Destinations</h4>
          <ul>
            <li><a href="https://desert-tracks.com/namibia-safaris/">Namibia</a></li>
            <li><a href="https://desert-tracks.com/botswana-safaris-and-tours/">Botswana</a></li>
            <li><a href="https://desert-tracks.com/tanzania-kenya-zanzibar-safaris/">East Africa</a></li>
          </ul>
        </div>

        <!-- Safari Types -->
        <div class="dt-mf-col">
          <h4>Safari Types</h4>
          <ul>
            <li><a href="/namibia-self-drive-safaris/">Self-drive Safaris</a></li>
            <li><a href="/namibia-luxury-safaris/">Luxury Safaris</a></li>
            <li><a href="/namibia-fly-in-safaris/">Fly-in Safaris</a></li>
            <li><a href="/namibia-guided-safaris/">Guided Safaris</a></li>
          </ul>
        </div>
      </div>

      <!-- ✅ Social icons (Accessibility-fixed) -->
      <div class="dt-social">
        <!-- Instagram -->
        <a href="https://instagram.com/deserttracksnamibia"
           target="_blank"
           rel="noopener"
           aria-label="Instagram - Desert Tracks Namibia"
           data-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224,202.66A53.34,53.34,0,1,0,277.34,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.17-30.17C296.41,123.87,224,123.2,224,123.2s-72.41.67-94.54,8.25a54,54,0,0,0-30.17,30.17c-7.58,22.13-8.25,94.54-8.25,94.54s.67,72.41,8.25,94.54a54,54,0,0,0,30.17,30.17c22.13,7.58,94.54,8.25,94.54,8.25s72.41-.67,94.54-8.25a54,54,0,0,0,30.17-30.17c7.58-22.13,8.25-94.54,8.25-94.54S356.29,183.79,348.71,161.66ZM224,338.67A82.67,82.67,0,1,1,306.67,256,82.71,82.71,0,0,1,224,338.67ZM342.46,150.2a19.2,19.2,0,1,1,19.2-19.2A19.22,19.22,0,0,1,342.46,150.2Z"/></svg>
        </a>

        <!-- Facebook -->
        <a href="https://facebook.com/deserttracksnamibia"
           target="_blank"
           rel="noopener"
           aria-label="Facebook - Desert Tracks Namibia"
           data-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91V127.41c0-25.35 12.42-50.06 52.24-50.06H293V6.26S273.48 0 252.36 0c-73.16 0-121.36 44.38-121.36 124.72v70.62H64v92.66h67v224h100.2v-224h78.34z"/></svg>
        </a>

        <!-- TripAdvisor -->
        <a href="https://www.tripadvisor.com/Attraction_Review-g298357-d8748479-Reviews-Desert_Tracks_Bookings_Safaris-Swakopmund_Erongo_Region.html"
           target="_blank"
           rel="noopener"
           aria-label="TripAdvisor - Desert Tracks Bookings & Safaris"
           data-label="TripAdvisor">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M529.6 144.6l47.3-50.1H413.9C379.6 74.5 338.4 64 288 64s-91.6 10.5-125.9 30.5H-.1l47.3 50.1C17.1 168.5 0 207.3 0 249.9c0 88.4 71.6 160 160 160 52.6 0 99-25.5 128-64.9 29 39.4 75.4 64.9 128 64.9 88.4 0 160-71.6 160-160 0-42.6-17.1-81.4-46.4-105.3zM160 354.9c-57.8 0-104.9-47.1-104.9-104.9S102.2 145.1 160 145.1s104.9 47.1 104.9 104.9-47.1 104.9-104.9 104.9zm256 0c-57.8 0-104.9-47.1-104.9-104.9s47.1-104.9 104.9-104.9S520.9 192.2 520.9 250s-47.1 104.9-104.9 104.9z"/></svg>
        </a>

        <!-- Google Reviews -->
        <a href="https://www.google.com/search?q=Desert+Tracks+Bookings+%26+Safaris+Reviews"
           target="_blank"
           rel="noopener"
           aria-label="Google Reviews - Desert Tracks Bookings & Safaris"
           data-label="Google Reviews">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path d="M488 261.8c0-17.8-1.5-35.3-4.7-52.2H249v98.8h135c-5.9 31.6-23.7 58.4-50.4 76.3l81.5 63.2c47.6-43.9 73.9-108.7 73.9-186.1zM249 492c66.6 0 122.4-21.9 163.2-59.4l-81.5-63.2c-22.6 15.2-51.4 24.3-81.7 24.3-62.9 0-116.2-42.4-135.2-99.1H31.8v62.3C72.5 453.5 155.1 492 249 492zM113.8 294.6c-5.2-15.2-8.1-31.4-8.1-48.6s2.9-33.4 8.1-48.6v-62.3H31.8C11.6 169.9 0 209.6 0 250s11.6 80.1 31.8 115.4l82-62.4zm135.2-219.7c35.5 0 67.5 12.2 92.6 32.5l69.6-69.6C360.6 12.6 306 0 249 0 155.1 0 72.5 38.5 31.8 104.6l82 62.4c19-56.7 72.3-99.1 135.2-99.1z"/></svg>
        </a>
      </div>

      <div class="dt-mf-hr"></div>

      <div style="text-align:center; margin:20px 0;">
        <!-- NEW TEXT LOGO WITH SUBTITLE -->
        <a href="https://desert-tracks.com/" class="dt-emblem-wrap-footer">
          <span class="dt-emblem-text-footer">Desert Tracks</span>
          <span class="dt-emblem-sub-footer">AFRICAN SAFARIS</span>
        </a>
      </div>

      <div class="dt-mf-bottom">
        © <span id="dt-year"></span> Desert Tracks Bookings & Safaris. All rights reserved.
        | Powered by <a href="https://upmarketcreativehub.com/" target="_blank" rel="noopener">Upmarket Creative Hub</a>
        | <a href="/privacy-policy/">Privacy Policy</a>
      </div>
    </div>

    <script>
      document.getElementById('dt-year').textContent = new Date().getFullYear();
    </script>

<?php 
} // end if !$hideFooter 
?>

<?php $showBackLink = get_option('np_hide_backlink') ? false : true; ?>
<?php if ($showBackLink) : $GLOBALS['theme_backlink'] = true; ?>
<section class="u-backlink u-clearfix u-grey-80">
  <p class="u-text">
    <span>This site was created with the </span>
    <a class="u-link" href="https://nicepage.com/" target="_blank" rel="nofollow">
      <span>Nicepage</span>
    </a>
  </p>
</section>
<?php endif; ?>

	</div><!-- .site-inner -->
</div><!-- #page -->

<?php wp_footer(); ?>
<?php back_to_top(); ?>
</body>
</html>
<?php 
$footer = ob_get_clean();
if (function_exists('renderTemplate')) {
    renderTemplate($footer, '', 'echo', 'footer');
} else {
    echo $footer;
}
?>
