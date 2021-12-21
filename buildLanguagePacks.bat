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
mkdir languages\ja
cmd.exe /c gulp package --lang ja
copy index.html.gz languages\ja
mkdir languages\hu
cmd.exe /c gulp package --lang hu
copy index.html.gz languages\hu
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
mkdir languages\tr
cmd.exe /c gulp package --lang tr
copy index.html.gz languages\tr
mkdir languages\zh_CN 
cmd.exe /c gulp package --lang zh_CN 
copy index.html.gz languages\zh_CN 
mkdir languages\zh_TW
cmd.exe /c gulp package --lang zh_TW 
copy index.html.gz languages\zh_TW 
mkdir languages\uk
cmd.exe /c gulp package --lang uk
copy index.html.gz languages\uk
mkdir languages\grbl
cmd.exe /c gulp package --lang uk
copy index.html.gz languages\grbl
cmd.exe /c gulp package
mkdir languages\multi
copy index.html.gz languages\multi
pause
