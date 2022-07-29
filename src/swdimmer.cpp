#include "esp32-hal-ledc.h"
#include "appconfig.h"
#include "log.h"
#include "utils.h"
#include "swdimmer.h"

#define RATIO                                      0.8f
#define LED_PWM_FREQ                               1000
#define LED_PWM_RESOLUTION                         12
#define LED_PWM_MAX_LEVEL                          100

int swdimmer_level[LED_MAX_CHANNEL];

void swdimmer_init() {
    record_init();
    record_get(swdimmer_level);
    LOG_INFO("> OUT channel 0 = %d, channel 1 = %d", swdimmer_level[0], swdimmer_level[1]);

    // configure LED PWM functionalitites
    ledcSetup(LED_WW, LED_PWM_FREQ, LED_PWM_RESOLUTION);
    ledcSetup(LED_CW, LED_PWM_FREQ, LED_PWM_RESOLUTION);
  
    // attach the channel to the GPIO to be controlled
    ledcAttachPin(LED_WW_PINOUT, LED_WW);
    ledcAttachPin(LED_CW_PINOUT, LED_CW);

    swdimmer_update();
}

void swdimmer_set_level(int channel, int level) {
    if (channel >= LED_MAX_CHANNEL) {
        return;
    }

    if (level > LED_PWM_MAX_LEVEL) {
        level = LED_PWM_MAX_LEVEL;
    }

    swdimmer_level[channel] = level;
}

void swdimmer_update() {
    static int swlevel[LED_MAX_CHANNEL];
    int pwmlevel;
    bool is_change = false;

    for (int i = 0; i < LED_MAX_CHANNEL; i++) {
        if (swlevel[i] != swdimmer_level[i]) {
            swlevel[i] = swdimmer_level[i];

            pwmlevel = (int)(swlevel[i] * 2.55f * RATIO);
            if (pwmlevel > 255) {
                pwmlevel = 255;
            }

            ledcWrite(i, pwmlevel * 8191 / 255);
            LOG_INFO("> OUT channel = %d, level = %d", i, swlevel[i]);
            is_change = true;
        }
    }

    if (is_change) {
        record_set(swdimmer_level);
    }
}

int swdimmer_get_level(int channel) {
    if (channel >= LED_MAX_CHANNEL) {
        return 0;
    }

    return swdimmer_level[channel];
}
