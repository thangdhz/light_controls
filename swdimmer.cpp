#include "esp32-hal-ledc.h"
#include "appconfig.h"
#include "log.h"
#include "utils.h"
#include "swdimmer.h"

#define LED_PWM_FREQ                               5000
#define LED_PWM_RESOLUTION                         8

int swdimmer_level[LED_MAX_CHANNEL];

void swdimmer_init() {
    record_init();
    record_get(swdimmer_level);

    // configure LED PWM functionalitites
    ledcSetup(LED_WW_PINOUT, LED_PWM_FREQ, LED_PWM_RESOLUTION);
    ledcSetup(LED_CW_PINOUT, LED_PWM_FREQ, LED_PWM_RESOLUTION);
  
    // attach the channel to the GPIO to be controlled
    ledcAttachPin(LED_WW_PINOUT, LED_WW);
    ledcAttachPin(LED_CW_PINOUT, LED_CW);
}

void swdimmer_set_level(int channel, int level) {
    int pwmlevel;

    if (channel >= LED_MAX_CHANNEL) {
        return;
    }

    swdimmer_level[channel] = level;
    pwmlevel =  (int)(level * 2.55);
    if (pwmlevel > 255) {
        pwmlevel = 255;
    }

    record_set(swdimmer_level);

    // ledcWrite(channel, pwmlevel);
}

int swdimmer_get_level(int channel) {
    if (channel >= LED_MAX_CHANNEL) {
        return 0;
    }

    return swdimmer_level[channel];
}
