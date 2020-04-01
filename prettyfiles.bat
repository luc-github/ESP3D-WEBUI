cd %~dp0
cmd.exe /c prettier --config .prettierrc --write "{src/**/,webpack/**/}*.js"
cmd.exe /c prettier --config .prettierrc --write "src/stylesheets/**/*.scss"
cmd.exe /c prettier --config .prettierrc --write "src/**/*.html"
pause
