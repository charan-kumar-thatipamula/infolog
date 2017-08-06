<?php
$method = $_REQUEST["method"];
if (strcmp($method, "moveFiles") == 0) {
	$fList        = $_REQUEST["fList"];
    $s            = $_REQUEST["sourcePath"];
    $d            = $_REQUEST["destinationPath"];
	
	$fss = "";
	$failedToMove = "";
	$movedFiles = "";
	$files = explode(",", $fList);
	foreach ($files as $file) {
        $status = rename($s.'/'.$file, $d . '/'.$file);
        if (!$status) {
			$failedToMove = $failedToMove.' | '.$file;
        } else {
			$movedFiles = $movedFiles.' | '.$file;
		}
    }
	echo 'movedFiles: ['.$movedFiles.'] && failedToMove: ['.$failedToMove.']';
} else {
    $dirPath   = $_REQUEST["dirPath"];
    $fileNames = '';
    foreach (glob($dirPath . '/*.*') as $file) {
        $s         = strrpos($file, "/");
        $e         = strlen($file);
        $sStr      = substr($file, $s + 1, $e);
        $fileNames = $fileNames . $sStr . '|';
    }
    echo $fileNames;
}
?>