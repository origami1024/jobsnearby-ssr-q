echo f | xcopy /s /f /y dist\ssr\.gitignore .\dist\.gitignore
;
xcopy /s/e /i /y dist\ssr\.git .\dist\.git
;
quasar build -m ssr
;
