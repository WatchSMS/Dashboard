while true
do
git checkout --force
result=`git pull |grep "up-to-date." |wc -l `

if [ "$result" = 1 ]; then
	echo "already up-to-date"
else
	echo "updated"
	sleep 2
	d=`date`
	sed -i "s/#lastupdate/$d/" index.html
fi

#git pull >> pull.log
sleep 2
done

