<?php
/**
 * Plugin Name: DT Enquiry Wizard
 * Description: A production-ready, multi-step enquiry wizard replica for Wilderness Destinations.
 * Version: 1.0.0
 * Author: Antigravity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register and enqueue assets
 */
function dt_enquiry_wizard_enqueue_assets() {
    // Only enqueue if the shortcode is present on the page or we are in the wizard context
    // For simplicity in this drop-in version, we'll enqueue it globally or check for the shortcode
    
    wp_enqueue_style(
        'dt-enquiry-wizard-styles',
        plugins_url( '../assets/styles.css', __FILE__ ),
        array(),
        '1.0.0'
    );

    wp_enqueue_script(
        'dt-enquiry-wizard-logic',
        plugins_url( '../assets/wizard.js', __FILE__ ),
        array(),
        '1.0.0',
        true // Enqueue in footer
    );

    // Pass data to JS if needed (e.g., localized strings or API endpoints)
    wp_localize_script( 'dt-enquiry-wizard-logic', 'dtWizardSettings', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'dt_enquiry_nonce' ),
        'plugin_url' => plugins_url( '../', __FILE__ )
    ));
}
add_action( 'wp_enqueue_scripts', 'dt_enquiry_wizard_enqueue_assets' );

/**
 * Shortcode to render the wizard root
 */
function dt_enquiry_wizard_shortcode( $atts ) {
    return '<div id="enquiry-wizard-root"></div>';
}
add_shortcode( 'dt_enquiry_wizard', 'dt_enquiry_wizard_shortcode' );
