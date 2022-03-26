#include "nvs_flash.h"
#include "nvs.h"
#include "log.h"
#include "portal.h"
#include "swdimmer.h"

void setup() {
    Serial.begin(115200);
    swdimmer_init();
    portal_init();
}

void loop() {
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
    delay(10);
}