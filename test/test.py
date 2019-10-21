import os
import unittest
import time
import random
from appium import webdriver
from password_generator import PasswordGenerator

pwo = PasswordGenerator()
pwo.minlen = 15


class AppiumTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Remote(
            command_executor='http://127.0.0.1:4723/wd/hub',
            desired_capabilities={
                'platformName': 'Android'
            })

    def tearDown(self):
        self.driver.quit()

    def test_registration_flow(self):
        time.sleep(10)

        nxt = self.driver.find_element_by_xpath('//*[@text="NEXT"]')
        nxt.click()
        nxt.click()
        nxt.click()

        time.sleep(2)

        start_saving = self.driver.find_element_by_xpath('//*[@text="START SAVING"]')
        start_saving.click()

        time.sleep(2)

        cont = self.driver.find_element_by_xpath('//*[@text="CONTINUE"]')
        cont.click()

        time.sleep(3)

        #############################################################################################
        ################################### Fill in email field #####################################
        #############################################################################################

        email_field = self.driver.find_element_by_xpath('/hierarchy/android.widget.FrameLayout/' + 
            'android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/' + 
            'android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/' + 
            'android.widget.EditText'
        )
        email_field.click()
        for char in range(25):
            self.driver.press_keycode(67)
        time.sleep(1)
        email_field.send_keys('testemail%s@test.tst' % random.randint(1000, 100000))

        #############################################################################################
        ##################################### Fill in national id ###################################
        #############################################################################################

        national_id_field = self.driver.find_element_by_xpath('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup[2]/android.widget.ScrollView/android.view.ViewGroup/' + 
            'android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText'
        )
        print('Got id field: %s' % national_id_field)
        national_id_field.click()
        print('Got id field: %s' % national_id_field)

        for char in range(15):
            self.driver.press_keycode(67)
        time.sleep(1)
        national_id_field.send_keys(str(random.randint(1000000000000, 10000000000000)))

        self.driver.press_keycode(4)

        time.sleep(2)

        cont = self.driver.find_element_by_xpath('//*[@text="CONTINUE"]')
        cont.click()

        time.sleep(2)

        #############################################################################################
        ##################################### Choose a password #####################################
        #############################################################################################

        test_password = pwo.generate()

        confirm_password_field = self.driver.find_element_by_xpath('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.ScrollView/' + 
            'android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.EditText'
        )
        confirm_password_field.click()
        confirm_password_field.send_keys(test_password)

        self.driver.press_keycode(4)

        password_field = self.driver.find_element_by_xpath('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
            'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
            'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
            'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/' + 
            'android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/' + 
            'android.view.ViewGroup/android.widget.EditText'
        )
        password_field.click()
        password_field.send_keys(test_password)

        cont = self.driver.find_element_by_xpath('//*[@text="CONTINUE"]')
        cont.click()

        time.sleep(6)

        #############################################################################################
        ################################### Enter deposit amount ####################################
        #############################################################################################

        # test_amount = str(round(random.uniform(1000, 10000), 2))

        # amount_field = self.driver.find_element_by_xpath('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/' + 
        #     'android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/' + 
        #     'android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/' + 
        #     'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/' + 
        #     'android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.EditText'
        # )
        # amount_field.click()
        # for char in range(6):
        #     self.driver.press_keycode(67)
        # print('Created test deposit amount: %s' % test_amount)
        # amount_field.send_keys(test_amount)

        # self.driver.press_keycode(4)

        next_payment = self.driver.find_element_by_xpath('//*[@text="NEXT: PAYMENT"]')
        next_payment.click()
        next_payment.click()
        time.sleep(7)

        #############################################################################################
        ################################### Handle payment page #####################################
        #############################################################################################

        paid_button = self.driver.find_element_by_xpath('//*[@text="I\'VE ALREADY PAID"]')
        paid_button.click()

        time.sleep(4)

        done_button = self.driver.find_element_by_xpath('//*[@text="DONE"]')
        done_button.click()

        #############################################################################################
        ################################### Handle payment page #####################################
        #############################################################################################

        time.sleep(6)
