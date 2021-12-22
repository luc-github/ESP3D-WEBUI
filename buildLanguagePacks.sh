cd "$(dirname "$0")"
npm install
rm -fr languages
mkdir -p languages/en
gulp package --lang en
cp index.html.gz languages/en
mkdir -p languages/fr
gulp package --lang fr
cp index.html.gz languages/fr
mkdir -p languages/es
gulp package --lang es
cp index.html.gz languages/es
mkdir -p languages/it
gulp package --lang it
cp index.html.gz languages/it
mkdir -p languages/ja
gulp package --lang ja
cp index.html.gz languages/ja
mkdir -p languages/hu
gulp package --lang hu
cp index.html.gz languages/hu
mkdir -p languages/de
gulp package --lang de
cp index.html.gz languages/de
mkdir -p languages/pl
gulp package --lang pl
cp index.html.gz languages/pl
mkdir -p languages/ptbr
gulp package --lang ptbr
cp index.html.gz languages/ptbr
mkdir -p languages/ru
gulp package --lang ru
cp index.html.gz languages/ru
mkdir -p languages/tr
gulp package --lang tr
cp index.html.gz languages/tr
mkdir -p languages/zh_CN 
gulp package --lang zh_CN 
cp index.html.gz languages/zh_CN 
mkdir -p languages/zh_TW 
gulp package --lang zh_TW 
cp index.html.gz languages/zh_TW 
mkdir -p languages/uk
gulp package --lang uk
cp index.html.gz languages/uk
mkdir -p languages/grbl
gulp package --lang uk
cp index.html.gz languages/grbl
gulp package
mkdir -p languages/multi
cp index.html.gz languages/multi
read -p "Press any key to close ..."
