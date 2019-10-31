import os
from selenium import webdriver
import re
import time
from solve import solve

driver=webdriver.Chrome()
driver.get(os.path.join(os.getcwd(),'step6.html'))

cube = 'DRLUUBFBRBLURRLRUBLRDDFDLFUFUFFDBRDUBRUFLLFDDBFLUBLRBD'
#stepArr = 'DDrdFFBDRRDDrFFdFFuBBLLUUDRRU'  #给定的还原序列

'''
shuffleArr = stepArr[::-1]
shuffleArr = list(shuffleArr)
for i in range(len(shuffleArr)):
    ss = shuffleArr[i]
    if ss >='A' and ss <='Z':
        shuffleArr[i] = ss.lower()
    else:
        shuffleArr[i] = ss.upper()

shuffleArr = str(shuffleArr)
shuffleArr = re.sub('\'','',shuffleArr)
shuffleArr = re.sub('\"','',shuffleArr)
'''

stepArr, shuffleArr = solve(cube)

shuffleArr = stepArr[::-1]
shuffleArr = list(shuffleArr)
for i in range(len(shuffleArr)):
    ss = shuffleArr[i]
    if ss >='A' and ss <='Z':
        shuffleArr[i] = ss.lower()
    else:
        shuffleArr[i] = ss.upper()
shuffleArr = str(shuffleArr)
shuffleArr = re.sub('\'','',shuffleArr)
shuffleArr = re.sub('\"','',shuffleArr)

print('web opening done')
time.sleep(3)

driver.execute_script('randomRotate(' + shuffleArr + ');')
print('shuffle done')
time.sleep(3)

driver.execute_script( 'totalTime = 200;')



for i in range(len(stepArr)):
    driver.execute_script(stepArr[i] + '(0)')
    time.sleep(1)
