#include "appconfig.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "log.h"
#include "portal.h"
#include "swdimmer.h"
#include "shtc3.h"


#define IF_EXPRIED_RUN_SECTION(last, interval, section)  \
    do {                                                 \
        if (last + interval < mticks) {                  \
            last = mticks;                               \
            section                                      \
        }                                                \
    } while (0)

#define ICTRL_SIZE                                 2

const int ictrl_list[ICTRL_SIZE] = { 
    LED_CW_CTRL_PINOUT, 
    LED_WW_CTRL_PINOUT 
};

SHTC3 shtc3;
float degc = 0.0f;
float rh = 0.0f;
unsigned long last_update_swdimmer = 0;
unsigned long last_read_ictrl = 0;


void handle_ictrl() {
    static int iadc_val[ICTRL_SIZE];

    for (int i = 0; i < ICTRL_SIZE; i++) {
        iadc_val[i] = analogRead(ictrl_list[i]);
    }

    LOG_INFO("=== %d === %d", iadc_val[0], iadc_val[1]);
}

void setup() {
    Serial.begin(115200);
    swdimmer_init();
    portal_init();
    Wire.begin(SHTC3_SCL, SHTC3_SDA);
    shtc3.begin();
    delay(5000);
    pinMode(LED_WW_CTRL_PINOUT, INPUT);
    pinMode(LED_CW_CTRL_PINOUT, INPUT);
    pinMode(LED_EN_CTRL_PINOUT, OUTPUT);
    digitalWrite(LED_EN_CTRL_PINOUT, HIGH);
}

void loop() {
    unsigned long mticks = millis();

    if (Serial.available() > 0) {
        int rchar = Serial.read();
        if (rchar != -1) {
            printf("RX == %c\r\n", rchar);
            if (rchar == 'R') {
                nvs_flash_erase();
                esp_restart();
            }
        }
    }

    shtc3.update();
    if (shtc3.lastStatus == SHTC3_Status_Nominal) {
        degc = shtc3.toDegC();
        rh = shtc3.toPercent();
        // LOG_DBG("RH = %.1f%, T= %.1f degC", rh, degc);
    }

    IF_EXPRIED_RUN_SECTION(last_update_swdimmer, 1000,
        swdimmer_update();
    );

    IF_EXPRIED_RUN_SECTION(last_read_ictrl, 1000,
        handle_ictrl();
    );

    delay(100);
}