@echo off
chcp 65001 > nul
echo ==============================================
echo  GitHub 저장소 연동 - Vercel 자동 배포 스크립트
echo ==============================================
echo.
echo [1/2] 수정된 파일들을 하나로 포장합니다...
git add .
git commit -m "Auto update: UI layout and features"
echo.
echo [2/2] 안전한 클라우드 인터넷망(GitHub)으로 전송합니다...
git push
echo.
echo ==============================================
echo 전송(Push)이 완료되었습니다! 
echo Vercel(버셀)에 계정이 연동되어 있다면, 1~2분 뒤 자동으로 인터넷상에 반영됩니다.
echo ==============================================
pause
