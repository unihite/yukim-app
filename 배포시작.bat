@echo off
echo ==============================================
echo   소담 육임 암자 - 전 세계 클라우드 고속 배포망 (Vercel)
echo ==============================================
echo.
echo [1/3] Vercel 원격 접속 모듈을 다운 받습니다...
call npx vercel login
echo.
echo [2/3] 인증이 완료되었습니다. 서버 업로드를 시작합니다.
echo.
echo ==============================================
echo * 알림: 지금부터 나오는 모든 영어 질문에는 그냥 [Enter] 엔터키를 쭉 달아 치시면 됩니다! (기본값 설정)
echo 마지막에 "Want to modify these settings?" 질문에는 "N" 엔터 또는 그냥 엔터.
echo ==============================================
echo.
call npx vercel --prod
echo.
echo ==============================================
echo 모든 클라우드 서버 배포 작업이 끝났습니다!
echo 터미널 창(까만 화면)에 나오는 "Production: https://yukim-app.......vercel.app" 주소가 
echo 이제 회원님의 새로운 영구 점술 앱 호스팅 인터넷 주소입니다.
echo.
pause
