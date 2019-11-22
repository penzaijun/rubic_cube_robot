from pyfirmata import Arduino
import time

'''
Rubic_MCU control 
Usage:
first connect Arduino to COM3
r=Rubic_MCU()
r.rubic_instruction("U2")
r.rubic_instruction("F'")
'''

class Rubic_MCU(object):
    # motor port
    class Motor_Port(object):
        L298N_IN1 = 2
        L298N_IN2 = 3
        L298N_IN3 = 4
        L298N_IN4 = 5
        motor_L = 6
        motor_R = 7
        motor_U = 8
        motor_D = 9
        motor_F = 10
        motor_B = 11

    # step motor motivate sequence
    class Motor_Sequence(object):
        # L298N logic status
        class Motor_Status(object):
            forward = (1, 0)
            backward = (0, 1)
            brake = (1, 1)
            stop = (0, 0)

        def __init__(self):
            ms=Rubic_MCU.Motor_Sequence.Motor_Status
            self.first_flag=True
            self.index = 0
            #self.Motor_A_seq = (ms.forward, ms.forward, ms.stop, ms.backward, ms.backward, ms.backward, ms.stop, ms.forward)
            #self.Motor_B_seq = (ms.stop, ms.forward, ms.forward, ms.forward, ms.stop, ms.backward, ms.backward, ms.backward)
            #self.Motor_A_seq = (ms.forward, ms.stop, ms.stop,    ms.stop, ms.backward, ms.stop, ms.stop    ,ms.stop)
            #self.Motor_B_seq = (ms.stop,    ms.stop, ms.forward, ms.stop, ms.stop,     ms.stop, ms.backward,ms.stop)
            self.Motor_A_seq = (ms.forward,  ms.stop,     ms.backward,  ms.stop    )
            self.Motor_B_seq = (ms.stop,     ms.forward,  ms.stop,      ms.backward)

        def step(self,step_num):
            #self.index = (self.index + step_num) % 8
            self.index = (self.index + step_num) % 4

        def get_A_status(self):
            return self.Motor_A_seq[self.index]

        def get_B_status(self):
            return self.Motor_B_seq[self.index]

    def __init__(self):
        self.board = Arduino("COM3")
        self.Motor_Sequence=[Rubic_MCU.Motor_Sequence() for i in range(6)]
        self.Motor_Port_dict=dict([(Rubic_MCU.Motor_Port.motor_L, 0),
                                   (Rubic_MCU.Motor_Port.motor_R, 1),
                                   (Rubic_MCU.Motor_Port.motor_U, 2),
                                   (Rubic_MCU.Motor_Port.motor_D, 3),
                                   (Rubic_MCU.Motor_Port.motor_F, 4),
                                   (Rubic_MCU.Motor_Port.motor_B, 5)])
        data = [('F2', (Rubic_MCU.Motor_Port.motor_F, 180)),
                ('F',  (Rubic_MCU.Motor_Port.motor_F, 90)),
                ('F\'',(Rubic_MCU.Motor_Port.motor_F, -90)),
                ('B2', (Rubic_MCU.Motor_Port.motor_B, 180)),
                ('B',  (Rubic_MCU.Motor_Port.motor_B, 90)),
                ('B\'',(Rubic_MCU.Motor_Port.motor_B, -90)),
                ('L2', (Rubic_MCU.Motor_Port.motor_L, 180)),
                ('L',  (Rubic_MCU.Motor_Port.motor_L, 90)),
                ('L\'',(Rubic_MCU.Motor_Port.motor_L, -90)),
                ('R2', (Rubic_MCU.Motor_Port.motor_R, 180)),
                ('R',  (Rubic_MCU.Motor_Port.motor_R, 90)),
                ('R\'',(Rubic_MCU.Motor_Port.motor_R, -90)),
                ('U2', (Rubic_MCU.Motor_Port.motor_U, 180)),
                ('U',  (Rubic_MCU.Motor_Port.motor_U, 90)),
                ('U\'',(Rubic_MCU.Motor_Port.motor_U, -90)),
                ('D2', (Rubic_MCU.Motor_Port.motor_D, 180)),
                ('D',  (Rubic_MCU.Motor_Port.motor_D, 90)),
                ('D\'',(Rubic_MCU.Motor_Port.motor_D, -90))]
        self.rubic_dict=dict(data)

    def turn(self,port_num,degree):
        step_count=round(abs(degree)/1.8)
        seq_num=self.Motor_Port_dict[port_num]
        if degree>0:
            step_num=1
            #self.Motor_Sequence[seq_num].index=0
        else:
            step_num=1
            #self.Motor_Sequence[seq_num].index=0
        #open port
        self.board.digital[port_num].write(1)
        #step_count=6
        for i in range(step_count):
            if degree>0:
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN1].write(self.Motor_Sequence[seq_num].get_A_status()[0])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN2].write(self.Motor_Sequence[seq_num].get_A_status()[1])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN3].write(self.Motor_Sequence[seq_num].get_B_status()[0])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN4].write(self.Motor_Sequence[seq_num].get_B_status()[1])
            else:
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN1].write(1-self.Motor_Sequence[seq_num].get_A_status()[0])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN2].write(1-self.Motor_Sequence[seq_num].get_A_status()[1])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN3].write(self.Motor_Sequence[seq_num].get_B_status()[0])
                self.board.digital[Rubic_MCU.Motor_Port.L298N_IN4].write(self.Motor_Sequence[seq_num].get_B_status()[1])
            self.Motor_Sequence[seq_num].step(step_num)
            time.sleep(0.01)
            


        # close port
        self.board.digital[port_num].write(0)

    def rubic_instruction(self,instruction):
        if isinstance(instruction,str) and instruction in self.rubic_dict.keys():
            self.turn(self.rubic_dict[instruction][0],self.rubic_dict[instruction][1])
        else: print("INVALID INSTRUCTION\n")

solution=""
solution="L L'  L2  R R' R2  F F' F2  B B' B2  U' U  U2  U' U  U2 D D' D2"
#solution = "L' L F R F' L' R' F L F R  L' F' R' "
#solution = "L' B' U R' L U2 D2 F' R' B' D R2 U2 F2 L2 F2 U2 L2 U"
instruction=solution.split(' ')
r=Rubic_MCU()



for ins in instruction:
    print(ins)
    r.rubic_instruction(ins)
    time.sleep(1)

while 1:
    a=input()
    if a=='f':
        break

#solution = "B L B L' B' B' B B2 L2 B' "
instruction=solution.split(' ')
#r=Rubic_MCU()



for ins in instruction:
    print(ins)
    r.rubic_instruction(ins)
    time.sleep(1)

'''
while 1:
    r.rubic_instruction("R")
    time.sleep(2)
'''



