<?php
//--->get app url > start

if (isset($_SERVER['HTTPS']) &&
    ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) ||
    isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
    $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
  $ssl = 'https';
}
else {
  $ssl = 'http';
}
 
$app_url = ($ssl  )
          . "://".$_SERVER['HTTP_HOST']
          //. $_SERVER["SERVER_NAME"]
          . (dirname($_SERVER["SCRIPT_NAME"]) == DIRECTORY_SEPARATOR ? "" : "/")
          . trim(str_replace("\\", "/", dirname($_SERVER["SCRIPT_NAME"])), "/");

//--->get app url > end

header("Access-Control-Allow-Origin: *");

?>


<!DOCTYPE html>
<html>
<head>
	 
	<title> Template </title>

	<meta name="viewport" content="width=device-width, initial-scale=1">

	<meta name="description" content="This ">

	<meta name="author" content="Code With Mark">
	<meta name="authorUrl" content="http://codewithmark.com">

	<!--[CSS/JS Files - Start]-->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> 
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/css/bootstrap.min.css">


	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.0/js/bootstrap.min.js"></script> 


	<script src="<?php echo $app_url?>/af.min.js"></script> 
  
 	
 	<style>
	.invoice-box {
		max-width: 800px;
		margin: auto;
		padding: 30px;
		border: 1px solid #eee;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		font-size: 16px;
		line-height: 24px;
		font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
		color: #555;
	}

	.invoice-box table {
		width: 100%;
		line-height: inherit;
		text-align: left;
	}

	.invoice-box table td {
		padding: 5px;
		vertical-align: top;
	}

	.invoice-box table tr td:nth-child(2) {
		text-align: right;
	}

	.invoice-box table tr.top table td {
		padding-bottom: 20px;
	}

	.invoice-box table tr.top table td.title {
		font-size: 45px;
		line-height: 45px;
		color: #333;
	}

	.invoice-box table tr.information table td {
		padding-bottom: 40px;
	}

	.invoice-box table tr.heading td {
		background: #eee;
		border-bottom: 1px solid #ddd;
		font-weight: bold;
	}

	.invoice-box table tr.details td {
		padding-bottom: 20px;
	}

	.invoice-box table tr.item td {
		border-bottom: 1px solid #eee;
	}

	.invoice-box table tr.item.last td {
		border-bottom: none;
	}

	.invoice-box table tr.total td:nth-child(2) {
		border-top: 2px solid #eee;
		font-weight: bold;
	}

	@media only screen and (max-width: 600px) {
		.invoice-box table tr.top table td {
			width: 100%;
			display: block;
			text-align: center;
		}

		.invoice-box table tr.information table td {
			width: 100%;
			display: block;
			text-align: center;
		}
	}

	/** RTL **/
	.invoice-box.rtl {
		direction: rtl;
		font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
	}

	.invoice-box.rtl table {
		text-align: right;
	}

	.invoice-box.rtl table tr td:nth-child(2) {
		text-align: left;
	}
	</style>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js" ></script>

 

	<script type="text/javascript">
	$(document).ready(function($) 
	{ 

		$(document).on('click', '.btn_print', function(event) 
		{
			event.preventDefault();

			//credit : https://ekoopmans.github.io/html2pdf.js
			
			var element = document.getElementById('container_content'); 

			//easy
			//html2pdf().from(element).save();

			//custom file name
			//html2pdf().set({filename: 'code_with_mark_'+js.AutoCode()+'.pdf'}).from(element).save();


			//more custom settings
			var opt = 
			{
			  margin:       1,
			  filename:     'pageContent_'+js.AutoCode()+'.pdf',
			  image:        { type: 'jpeg', quality: 0.98 },
			  html2canvas:  { scale: 2 },
			  jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
			};

			// New Promise-based usage:
			html2pdf().set(opt).from(element).save();

			 
		});

 
 
	});
	</script>

	 

</head>
<body>

<div class="text-center" style="padding:20px;">
	<input type="button" id="rep" value="Print" class="btn btn-info btn_print">
</div>


<div class="container_content" id="container_content" >
		

		<div class="invoice-box">

	

			<table cellpadding="0" cellspacing="0" >
				<tr class="top">
					<td colspan="2">
						<table>
							<tr>
								<td class="title">
									<img src="<?php echo $app_url?>/any.png" style="width: 100%; max-width: 300px" />
								</td>

								<td>
									Invoice #: 123<br />
									Created: January 1, 2015<br />
									Due: February 1, 2015
								</td>
							</tr>
						</table>
					</td>
				</tr>

				<tr class="information">
					<td colspan="2">
						<table>
							<tr>
								<td>
									Sparksuite, Inc.<br />
									12345 Sunny Road<br />
									Sunnyville, CA 12345
								</td>

								<td>
									Acme Corp.<br />
									John Doe<br />
									john@example.com
								</td>
							</tr>
						</table>
					</td>
				</tr>

				<tr class="heading">
					<td>Payment Method</td>

					<td>Check #</td>
				</tr>

				<tr class="details">
					<td>Check</td>

					<td>1000</td>
				</tr>

				<tr class="heading">
					<td>Item</td>

					<td>Price</td>
				</tr>

				<tr class="item">
					<td>Website design</td>

					<td>$300.00</td>
				</tr>

				<tr class="item">
					<td>Hosting (3 months)</td>

					<td>$75.00</td>
				</tr>

				<tr class="item last">
					<td>Domain name (1 year)</td>

					<td>$10.00</td>
				</tr>

				<tr class="total">
					<td></td>

					<td>Total: $385.00</td>
				</tr>
			</table>
		</div>
</div>



</body>
</html>