for fn in *.svg; do
    inkscape --export-png=../png/${fn%.*}.png ${fn%.*}.svg
done
