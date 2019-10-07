cd %~dp0
cmd.exe /c npm install
rmdir /Q /S languages
mkdir languages\en
cmd.exe /c gulp package --lang en
copy index.html.gz languages\en
mkdir languages\fr
cmd.exe /c gulp package --lang fr
copy index.html.gz languages\fr
mkdir languages\es
cmd.exe /c gulp package --lang es
copy index.html.gz languages\es
mkdir languages\it
cmd.exe /c gulp package --lang it
copy index.html.gz languages\it
mkdir languages\de
cmd.exe /c gulp package --lang de
copy index.html.gz languages\de
mkdir languages\pl
cmd.exe /c gulp package --lang pl
copy index.html.gz languages\pl
mkdir languages\ptbr
cmd.exe /c gulp package --lang ptbr
copy index.html.gz languages\ptbr
mkdir languages\ru
cmd.exe /c gulp package --lang ru
copy index.html.gz languages\ru
mkdir languages\uk
cmd.exe /c gulp package --lang uk
copy index.html.gz languages\uk
cmd.exe /c gulp package
mkdir languages\multi
copy index.html.gz languages\multi
pause
