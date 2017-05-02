# let's get last version of csv
wget -O raw/tmp ${URL}
if cmp raw/tmp raw/conso.csv; then
 rm raw/tmp
 exit 0
else
 cp raw/tmp raw/conso.csv
fi

# let's run make
make

# let's build the bundle
npm run build

# let's copy dist directory to destination
cp -f dist/* ${DEST}
