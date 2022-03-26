#ifndef __SW_DIMMER_H
#define __SW_DIMMER_H

enum {
    LED_WW = 0,           /**< warm white */
    LED_CW = 1,           /**< cold white */
    LED_MAX_CHANNEL,
};

void swdimmer_init();

void swdimmer_set_level(int channel, int level);

int swdimmer_get_level(int channel);

#endif /* __SW_DIMMER_H */
