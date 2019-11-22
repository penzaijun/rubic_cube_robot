import cv2
import numpy as np
from copy import deepcopy
import math
import time
import matplotlib.pyplot as plt

info_map = {0:'U', 1:'R', 2:'F', 3:'D', 4:'L', 5:'B'}
colour_map = {0:'Y', 1:'R', 2:'B', 3:'W', 4:'O', 5:'G'}


def photograph(img_dir):
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    ret, frame = cap.read()
    
#     b, g, r = cv2.split(frame)
#     frame_new = cv2.merge([r, g, b])
#     plt.imshow(frame_new)
#     plt.show()
    
    cv2.imwrite(img_dir, frame)
    cap.release()
    return

def colour_id(colour_info):
    r = [220, 35, 35]
    b = [35, 35, 220]
    g = [40, 160, 90]
    o = [220, 110, 0]
    y = [220, 220, 35]
    w = [250, 250, 250]
    colour_list = np.array([y, r, b, w, o, g])
#     print(colour_info)
    d = np.sum(np.square(colour_list - colour_info), 1)
    return np.argmin(d)

def colour_fetch(img_dir):
    #global colour_map
    #global info_map
    info_map = {0:'U', 1:'R', 2:'F', 3:'D', 4:'L', 5:'B'}
    colour_map = {0:'Y', 1:'R', 2:'B', 3:'W', 4:'O', 5:'G'}
    
    img = cv2.imread(img_dir)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    canny = cv2.Canny(blurred, 20, 40)
    kernel = np.ones((5,5), np.uint8)
    dilated = cv2.dilate(canny, kernel, iterations=4)
    
    contours, hierarchy = cv2.findContours(dilated.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    candidates = []
    hierarchy = hierarchy[0]

    index = 0
    pre_cX = 0
    pre_cY = 0
    center = []
    for component in zip(contours, hierarchy):
        contour = component[0]
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.1 * peri, True)
        area = cv2.contourArea(contour)
        corners = len(approx)

        # compute the center of the contour
        M = cv2.moments(contour)

        if M["m00"]:
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
        else:
            cX = None
            cY = None

        if 1000 < area < 20000 and cX is not None:
            tmp = {'index': index, 'cx': cX, 'cy': cY, 'contour': contour}
            center.append(tmp)
            index += 1

    center.sort(key=lambda k: (k.get('cy', 0)))
    row1 = center[0:3]
    row1.sort(key=lambda k: (k.get('cx', 0)))
    row2 = center[3:6]
    row2.sort(key=lambda k: (k.get('cx', 0)))
    row3 = center[6:9]
    row3.sort(key=lambda k: (k.get('cx', 0)))

    center.clear()
    center = row1 + row2 + row3

    for component in center:
        candidates.append(component.get('contour'))

    cv2.drawContours(img, candidates, -1, (0, 0, 255), 3)
    
    b, g, r = cv2.split(img)
    img_new = cv2.merge([r, g, b])
    
#     plt.imshow(img_new)
#     plt.show()
    
    colour_list = np.zeros(9)
    for idx, item in enumerate(center):
        info = img_new[item['cy'], item['cx']]
        colour_list[idx] = colour_id(info)
    
#     print(colour_list)
    
    info_str = ''
    for i in range(9):
        info_str = info_str + info_map[colour_list[i]]
        
    colour_str = ''
    for i in range(9):
        colour_str = colour_str + colour_map[colour_list[i]]
    
    return info_str, colour_str

def getcolor(driver):
    info_map = {0:'U', 1:'R', 2:'F', 3:'D', 4:'L', 5:'B'}
    colour_map = {0:'Y', 1:'R', 2:'B', 3:'W', 4:'O', 5:'G'}
    info_all = ''
    for i in range(6):
        print('prepare: ' + info_map[i])
        t = driver.execute_script('return iscamera;')
        while(t==0):
            t = driver.execute_script('return iscamera;')
        driver.execute_script('iscamera = 0;')
        img_dir = './frame.jpg'
        photograph(img_dir)
        info_single, colour_single = colour_fetch(img_dir)
        info_all = info_all + info_single
        print(colour_single)
        print(info_map[i] + ' is completed')
    return info_all
        


if __name__ == '__main__':
    info_map = {0:'U', 1:'R', 2:'F', 3:'D', 4:'L', 5:'B'}
    colour_map = {0:'Y', 1:'R', 2:'B', 3:'W', 4:'O', 5:'G'}
    
    info_all = ''
    for i in range(6):
        print('prepare: ' + info_map[i])
        time.sleep(15)
        print('photograph: ' + info_map[i])
        img_dir = './frame.jpg'
        photograph(img_dir)
        info_single, colour_single = colour_fetch(img_dir)
        info_all = info_all + info_single
        print(colour_single)
        print(info_map[i] + ' is completed')
        #break
        
#     img_dir = './frame.jpg'
#     photograph(img_dir)
#     info_single, colour_single = colour_fetch(img_dir)
#     print(colour_single)
    
        
        
        