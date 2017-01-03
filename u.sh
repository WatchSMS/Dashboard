	echo "updated"
	d=`date`
	sed -i "s/#lastupdate/'$d'/" index.html
