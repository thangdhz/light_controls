#include "appconfig.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "log.h"
#include "portal.h"
#include "swdimmer.h"
#include "shtc3.h"
#include "WiFi.h"

#define MAX(a,b)                                  ((a) > (b) ? (a) : (b))
#define MIN(a,b)                                  ((a) < (b) ? (a) : (b))

#define IF_EXPRIED_RUN_SECTION(last, interval, section)  \
    do {                                                 \
        if (last + interval < mticks) {                  \
            last = mticks;                               \
            section                                      \
        }                                                \
    } while (0)

#define ICTRL_SIZE                                 2
#define ICTRL_STEP                                 150
#define ICTRL_MUL                                  5

const int ictrl_list[ICTRL_SIZE] = { 
    LED_CW_CTRL_PINOUT, 
    LED_WW_CTRL_PINOUT 
};

SHTC3 shtc3;
float degc = 0.0f;
float rh = 0.0f;
unsigned long last_update_swdimmer = 0;
unsigned long last_read_ictrl = 0;
unsigned long last_blink = 0;
static int iadc_val[ICTRL_SIZE];

void handle_ictrl() {
    int iadc;
    int ripple;
    int level;

    for (int i = 0; i < ICTRL_SIZE; i++) {
        iadc = analogRead(ictrl_list[i]);
        ripple = MAX(iadc_val[i], iadc) - MIN(iadc_val[i], iadc);
        if (ripple > ICTRL_STEP) {
            iadc_val[i] = iadc;
            level = iadc_val[i] * ICTRL_MUL / ICTRL_STEP;
            level = 100 - level;
            if (level < 0) {
                level = 0;
            }
            LOG_INFO(">> CH %d change to %d", i, level);
            swdimmer_set_level(i, level);
        }
    }
}

void setup() {
    Serial.begin(115200);
    LOG_PRINT("%s", "\r\n\r\n");
    LOG_INFO("%s", "======================================================================");
    LOG_INFO("%s", "Light Controls");
    LOG_INFO("%s", "======================================================================");
    llog_init();
    swdimmer_init();
    portal_init();
    Wire.begin(SHTC3_SCL, SHTC3_SDA);
    shtc3.begin();

    delay(1000);
    pinMode(LED_WW_CTRL_PINOUT, INPUT);
    pinMode(LED_CW_CTRL_PINOUT, INPUT);
    pinMode(LED_EN_CTRL_PINOUT, OUTPUT);
    
    delay(1000);
    for (int i = 0; i < ICTRL_SIZE; i++) {
        iadc_val[i] = analogRead(ictrl_list[i]);
    }

    delay(3000);
    digitalWrite(LED_EN_CTRL_PINOUT, HIGH);
}

void loop() {
    unsigned long mticks = millis();
    bool is_connected = (WiFi.status() == WL_CONNECTED);

    if (Serial.available() > 0) {
        int rchar = Serial.read();
        if (rchar != -1) {
            LOG_INFO("RX == %c\r\n", rchar);
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

    IF_EXPRIED_RUN_SECTION(last_read_ictrl, 100,
        // handle_ictrl();
    );

    IF_EXPRIED_RUN_SECTION(last_blink, 10000,
        digitalWrite(LED_EN_CTRL_PINOUT, LOW);
        delay(30);
        digitalWrite(LED_EN_CTRL_PINOUT, HIGH);
        LOG_INFO("RH = %.1f%, T= %.1f degC, Wifi %s, free heap %ld, %d", rh, degc, 
                  is_connected ? "Connected" : "Disconnect",
                  xPortGetFreeHeapSize(), WiFi.getAutoConnect());
    );

    delay(100);
}