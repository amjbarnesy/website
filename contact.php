<?php
header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Honeypot check — bots fill this in, real users don't
if (!empty($_POST['website'])) {
    // Silent success to fool bots
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
if (empty($subject))                         $errors[] = 'Please tell me what type of work you\'re after.';
if (empty($message))                         $errors[] = 'Message is required.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Build email
$to      = 'hello@adambarnes.biz';
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

$headers  = "From: no-reply@adambarnes.biz\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = mail($to, $subject_line, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Message sent. I\'ll be in touch soon.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sorry, something went wrong. Please email me directly at hello@adambarnes.biz']);
}
