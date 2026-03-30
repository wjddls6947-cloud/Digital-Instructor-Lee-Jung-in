<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dir = "./photos/";
$result = array();

// 폴더가 없으면 생성
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

$files = scandir($dir);

foreach($files as $file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $allowed = array('jpg', 'jpeg', 'png', 'gif', 'webp');
    
    if(in_array($ext, $allowed)) {
        $fileName = pathinfo($file, PATHINFO_FILENAME);
        $yearNum = 0;
        
        // 파일명에서 숫자 4자리(연도) 추출 (시작 부분이 아니더라도 찾음)
        if (preg_match('/(\d{4})/', $file, $matches)) {
            $yearNum = (int)$matches[1];
            // 추출된 숫자가 현실적인 연도 범위(2000~2099)인지 확인
            if ($yearNum < 2000 || $yearNum > 2099) {
                $yearNum = (int)date("Y", filemtime($dir . $file));
            }
        } else {
            // 파일명에 연도가 없으면 파일 수정 날짜의 연도 사용
            $yearNum = (int)date("Y", filemtime($dir . $file));
        }

        // UI 필터와 일치하도록 2022년 이하는 '2022년 이전'으로 분류
        if ($yearNum <= 2022) {
            $year = "2022년 이전";
        } else {
            $year = $yearNum . "년";
        }

        // 제목에서 앞부분의 모든 숫자 및 구분자 제거 (예: "202603152 방과후학교" -> "방과후학교")
        $displayTitle = preg_replace('/^[\d\s_\-]+/', '', $fileName);
        
        // 만약 숫자를 지웠는데 제목이 비어버리면 원래 파일명 사용
        if (trim($displayTitle) === '') {
            $displayTitle = $fileName;
        }

        // 파일 정보를 배열에 담기
        $result[] = array(
            "id" => $file,
            "title" => $displayTitle,
            "image" => "photos/" . $file,
            "year" => $year,
            "year_num" => $yearNum, // 디버깅용
            "created_at" => filemtime($dir . $file)
        );
    }
}

// 최신순 정렬
usort($result, function($a, $b) {
    return $b['created_at'] - $a['created_at'];
});

echo json_encode($result);
?>
