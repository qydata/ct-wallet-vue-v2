#!/bin/bash
#rm -rf dist
#npm run build
NOW=`date "+%Y%m%d%H%M%S"`
rsync -avz dist/* root@47.98.96.123:/www/wwwroot/wallet.ctblock.cn
#rsync -avz dist/* root@47.98.96.123:/www/wwwroot/test.ctsign.cn
