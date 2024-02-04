# -*- coding: utf-8 -*-
import sched, time

def schedule_update(schedule):
    schedule.enter(60, 1, schedule_update, (schedule,))
    print("Call executed")
    """function call"""
my_schedule = sched.scheduler(time.time, time.sleep)
my_schedule.enter(60, 1, schedule_update, (my_schedule,))
my_schedule.run()