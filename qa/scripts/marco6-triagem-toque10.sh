#!/bin/sh
# 10 execuções do smoke:toque-menus; log por execução e resumo de código de saída. Só observa.
cd /Users/italozen/Documents/Projects/vila-do-natal/.claude/worktrees/marco-1-orchestration-c3b37a || exit 1
mkdir -p qa/evidencias/triagem-r2/toque
i=1
while [ $i -le 10 ]; do
  s=$(date +%s)
  npm run smoke:toque-menus > qa/evidencias/triagem-r2/toque/run-$i.txt 2>&1
  c=$?
  echo "run $i exit $c tempo $(( $(date +%s) - s ))s" >> qa/evidencias/triagem-r2/toque/resumo.txt
  i=$((i+1))
done
echo FIM >> qa/evidencias/triagem-r2/toque/resumo.txt
