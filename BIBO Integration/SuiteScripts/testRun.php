<?php
$dirPath=$_REQUEST["dirPath"];
$fileNames = '';
foreach(glob($dirPath.'/*.*') as $file) {
	$s = strrpos($file, "/");
	$e = strlen($file);
	$sStr = substr($file, $s+1, $e);
    $fileNames = $fileNames . $sStr . '|';
}
echo $fileNames
?>