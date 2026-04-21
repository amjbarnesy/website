<?php
// Suppress PHP warnings/notices — any output before the JSON header breaks the JS fetch
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Honeypot check — bots fill this in, real users don't
if (!empty($_POST['website'])) {
    ob_end_clean();
    echo json_encode(['success' => true]);
    exit;
}

// Sanitise inputs
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');

// Validate required fields
$errors = [];
if (empty($name))                            $errors[] = 'Name is required.';
if (empty($email) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL))
                                             $errors[] = 'A valid email address is required.';
if (empty($subject))                         $errors[] = "Please tell me what type of work you're after.";
if (empty($message))                         $errors[] = 'Message is required.';

if (!empty($errors)) {
    ob_end_clean();
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Build email
$to           = 'hello@adambarnes.biz';
$subject_line = 'New enquiry from ' . $name . ' — ' . $subject;

$body  = "You have a new enquiry from adambarnes.biz\n";
$body .= "==========================================\n\n";
$body .= "Name:    " . $name    . "\n";
$body .= "Email:   " . $email   . "\n";
if (!empty($phone))
$body .= "Phone:   " . $phone   . "\n";
$body .= "Subject: " . $subject . "\n\n";
$body .= "Message:\n" . $message . "\n\n";
$body .= "==========================================\n";
$body .= "Sent from the contact form at adambarnes.biz\n";

// Use the recipient domain as the From address — avoids SPF rejection on shared hosting
$headers  = "From: website@adambarnes.biz\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Discard any buffered output (e.g. PHP startup warnings) before sending JSON
ob_end_clean();

$sent = mail($to, $subject_line, $body, $headers);

// Debug: log the result so you can check what happened
$log_entry = date('Y-m-d H:i:s') . ' | sent=' . ($sent ? 'true' : 'false') . ' | error=' . error_get_last()['message'] . "\n";
file_put_contents(__DIR__ . '/contact_debug.log', $log_entry, FILE_APPEND);

if ($sent) {
    echo json_encode(['success' => true, 'message' => "Message sent. I'll be in touch soon."]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sorry, something went wrong sending the email. Please email me directly at hello@adambarnes.biz']);
}
