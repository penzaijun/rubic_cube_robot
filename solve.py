import kociemba
import sys

# input：python solve.py DRLUUBFBRBLURRLRUBLRDDFDLFUFUFFDBRDUBRUFLLFDDBFLUBLRBD


cube = sys.argv[1]
solution = kociemba.solve(cube.replace(' ',''))
# solution = "L' B' U R' L U2 D2 F' R' B' D R2 U2 F2 L2 F2 U2 L2 U"
lists = solution.split(' ')
i = 0
while i<=len(lists)-1:
    if len(lists[i])==2:
        if lists[i][1]=="'":
            lists[i] = lists[i][0].lower()
        else:
            lists[i] = lists[i][0]
            lists.insert(i,lists[i])
    i+=1
str1 = ''.join(lists)
# str1 = str(lists).replace("'","")
print(str1)

lists.reverse()
for i in range(len(lists)):
    item = lists[i]
    if item>='A' and item <= 'Z':
        lists[i] = item.lower()
    else:
        lists[i] = item.upper()
str2 = ''.join(lists)
# str2 = str(lists).replace("'","")
print(str2)