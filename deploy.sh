#!/bin/bash
#rm -rf dist
#npm run build
NOW=`date "+%Y%m%d%H%M%S"`
rsync -avz dist/* root@121.43.63.167:/www/wwwroot/wallet.ctblock.cn
