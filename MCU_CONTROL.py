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
            self.index = 0
            self.Motor_A_seq = (ms.forward, ms.forward, ms.stop, ms.backward, ms.backward, ms.backward, ms.stop, ms.forward)
            self.Motor_B_seq = (ms.stop, ms.forward, ms.forward, ms.forward, ms.stop, ms.backward, ms.backward, ms.backward)

        def step(self,step_num):
             self.index = (self.index + step_num) % 8

        def get_A_status(self):
            return self.Motor_A_seq[self.index]

        def get_B_status(self):
            return self.Motor_B_seq[self.index]

    def __init__(self):
        self.board = Arduino("COM3")
        self.Motor_Sequence=Rubic_MCU.Motor_Sequence()
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
        if degree>0:step_num=1
        else:step_num=7
        #open port
        self.board.digital[port_num].write(1)
        for i in range(step_count):
            self.board.digital[Rubic_MCU.Motor_Port.L298N_IN1] = self.Motor_Sequence.get_A_status()[0]
            self.board.digital[Rubic_MCU.Motor_Port.L298N_IN2] = self.Motor_Sequence.get_A_status()[1]
            self.board.digital[Rubic_MCU.Motor_Port.L298N_IN3] = self.Motor_Sequence.get_B_status()[0]
            self.board.digital[Rubic_MCU.Motor_Port.L298N_IN4] = self.Motor_Sequence.get_B_status()[1]
            self.Motor_Sequence.step(step_num)
            time.sleep(0.04)
        # close port
        self.board.digital[port_num].write(0)

    def rubic_instruction(self,instruction):
        if isinstance(instruction,str) and instruction in self.rubic_dict.keys():
            self.turn(self.rubic_dict[instruction][0],self.rubic_dict[instruction][1])
        else: print("INVALID INSTRUCTION\n")






