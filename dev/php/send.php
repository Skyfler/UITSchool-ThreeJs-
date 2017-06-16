<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	//to prevent Empty Mails on GET Requests
	http_response_code(405);
	exit();
}

require($_SERVER['DOCUMENT_ROOT'].'/php/lib/PHPMailer/PHPMailerAutoload.php');

$toMail = isset($_POST['admin-email']) ? $_POST['admin-email'] : "skyflerr@gmail.com";
$toMame = isset($_POST['admin-name']) ? $_POST['admin-name'] : "";
$fromMail = isset($_POST['email']) ? $_POST['email'] : $toMail;
$fromName = isset($_POST['name']) ? $_POST['name'] : $toMame;
$subject = isset($_POST['subject']) ? $_POST['subject'] : 'New Message from your Contact Form';

$mailer = new PHPMailer;

//$mailer->setLanguage('ru', $_SERVER['DOCUMENT_ROOT'].'/php/lib/PHPMailer/language/');
$mailer->CharSet = 'UTF-8';

//$mailer->IsSMTP();                              // telling the class to use SMTP
//$mailer->SMTPAuth   = true;                     // enable SMTP authentication
//$mailer->Host       = "";                       // SMTP server
//$mailer->SMTPDebug  = 0;                        // enables SMTP debug information (for testing)
//                                                // 1 = errors and messages
//                                                // 2 = messages only
//$mailer->Port       = 587;                      // set the SMTP port for the GMAIL server
//$mailer->Username   = "";                       // SMTP account username
//$mailer->Password   = "";                       // SMTP account password

$mailer->setFrom($fromMail, $fromName);

$mailer->addAddress($toMail, $toMame);

$mailer->Subject = $subject;

// sumbission data
		$postcontent = $_POST["dataString"];
		$ipaddress = $_SERVER['REMOTE_ADDR'];
		$date = date('d/m/Y');
		$time = date('H:i:s');

		$messageBody = "<p>You have received a new message from the contact form on your website.</p>
						{$postcontent}
						<p>This message was sent from the IP Address: {$ipaddress} on {$date} at {$time}</p>";

$contents = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/php/template.html');
$contents = str_replace('{%message%}', $messageBody, $contents);

$mailer->msgHTML($contents);

$img = isset($_POST['file']) ? $_POST['file'] : [];

if(!empty($img))
{
	$img_desc = reArrayFiles($img);

	foreach($img_desc as $val)
	{
		$mailer->addAttachment($val['tmp_name'], $val['name']);
	}
}

function reArrayFiles($file)
{
	$file_ary = array();
	$file_count = count($file['name']);
	$file_key = array_keys($file);

	for($i=0;$i<$file_count;$i++)
	{
		foreach($file_key as $val)
		{
			$file_ary[$i][$val] = $file[$val][$i];
		}
	}
	return $file_ary;
}

if (!$mailer->send()) {
	$res['success'] = 0;
	$res['msg'] = "Mailer Error: " . $mailer->ErrorInfo;

} else {;
	$res['success'] = 1;
	$res['msg'] = "Message sent!";

}

echo json_encode($res);

$mailer->clearAddresses();
$mailer->clearAttachments();
