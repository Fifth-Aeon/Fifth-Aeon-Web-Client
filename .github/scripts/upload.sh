account="william-ritson"
game="fifth-aeon"
sourceFolder="standalone"
sources=( "fifth-aeon-win32-x64" "fifth-aeon-linux-x64"  )
channels=( "fifth-aeon-win64" "fifth-aeon-linux")

# Download butler
curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default
unzip butler.zip

# Move packages into subfolders within themselves then upload to itch. 
for i in {0..1}
do
    echo "Upload '$sourceFolder/${sources[i]}' to '$account/$game:${channels[i]}'"
    mkdir $sourceFolder/${sources[i]}/app
    mv $sourceFolder/${sources[i]}/* $sourceFolder/${sources[i]}/app
    ./butler push ./$sourceFolder/${sources[i]} $account/$game:${channels[i]}
done
