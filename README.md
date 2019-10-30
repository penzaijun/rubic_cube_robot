# rubic_cube_robot

## code for website display

necessary package
```
pip install selenium
```

download driver for google chrome [here](http://chromedriver.storage.googleapis.com/index.html)

run
```
python webshow.py
```
to see the website display

## color queue

```
             |************|
             |*U1**U2**U3*|
             |************|
             |*U4**U5**U6*|
             |************|
             |*U7**U8**U9*|
             |************|
 ************|************|************|************
 *L1**L2**L3*|*F1**F2**F3*|*R1**R2**R3*|*B1**B2**B3*
 ************|************|************|************
 *L4**L5**L6*|*F4**F5**F6*|*R4**R5**R6*|*B4**B5**B6*
 ************|************|************|************
 *L7**L8**L9*|*F7**F8**F9*|*R7**R8**R9*|*B7**B8**B9*
 ************|************|************|************
             |************|
             |*D1**D2**D3*|
             |************|
             |*D4**D5**D6*|
             |************|
             |*D7**D8**D9*|
             |************|
```

A cube definition string "UBL..." means that in position U1 we have the U-color, in position U2 we have the B-color, in position U3 we have the L color etc. according to the order `U1, U2, U3, U4, U5, U6, U7, U8, U9, R1, R2, R3, R4, R5, R6, R7, R8, R9, F1, F2, F3, F4, F5, F6, F7, F8, F9, D1, D2, D3, D4, D5, D6, D7, D8, D9, L1, L2, L3, L4, L5, L6, L7, L8, L9, B1, B2, B3, B4, B5, B6, B7, B8, B9`.

So, for example, a definition of a solved cube would be `UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`


## code for solve cube

input：
```
python solve.py DRLUUBFBRBLURRLRUBLRDDFDLFUFUFFDBRDUBRUFLLFDDBFLUBLRBD
```

output: two strings
```
DDrdFFBDRRDDrFFdFFuBBLLUUDRRU
urrduullbbUffDffRddrrdbffDRdd
```
