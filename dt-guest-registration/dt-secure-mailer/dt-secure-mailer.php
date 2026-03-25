<?php
/**
 * Plugin Name: Desert Tracks Secure Mailer
 * Description: Custom REST API endpoint for sending luxury HTML booking emails safely via wp_mail.
 * Version: 1.0
 * Author: Antigravity
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('dt/v1', '/send-registration', array(
        'methods' => 'POST',
        'callback' => 'dt_send_luxury_registration_email',
        'permission_callback' => function () {
            return current_user_can('edit_posts'); // Uses existing Basic Auth credentials
        }
    ));
});

function dt_send_luxury_registration_email($request) {
    $params = $request->get_json_params();
    
    $to = 'bookings@desert-tracks.com';
    $subject = 'New Guest Registration: ' . sanitize_text_field($params['groupName']);
    
    // Decode the HTML payload sent from the Next.js app
    $html = base64_decode($params['html_content']);
    
    $headers = array('Content-Type: text/html; charset=UTF-8');
    $headers[] = 'From: Desert Tracks Secure Portal <bookings@desert-tracks.com>';
    
    $sent = wp_mail($to, $subject, $html, $headers);
    
    if ($sent) {
        return new WP_REST_Response(array('success' => true, 'message' => 'Email dispatched'), 200);
    } else {
        return new WP_REST_Response(array('success' => false, 'message' => 'wp_mail failed'), 500);
    }
}
