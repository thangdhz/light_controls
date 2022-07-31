#include "appconfig.h"
#include "log.h"
#include "sched.h"
#include <time.h>

#define SCHED_SIZE                               32

#define LIST_DAY_OF_WEEK                         \
XTABLE_ITEM(SU) \
XTABLE_ITEM(MO) \
XTABLE_ITEM(TU) \
XTABLE_ITEM(WE) \
XTABLE_ITEM(TH) \
XTABLE_ITEM(FR) \
XTABLE_ITEM(SA) \

typedef struct {
    uint8_t id;
    uint8_t led_state;
    uint8_t hour;
    uint8_t min;
    uint8_t repeat;
    uint8_t active;
    uint8_t is_run;
} sched_t;

sched_t sched_list[SCHED_SIZE];

void vsched_init()
{
    
}

void vsched_add(sched_t *sched)
{

}

void vsched_remove(uint8_t id)
{

}

void vsched_run()
{
    struct tm now;
    sched_t *sched;
    uint8_t day_mask;

    // if (!getLocalTime(&now)){
    //     LOG_INFO("%s", "Failed to obtain time");
    //     return;
    // }

    for (int i = 0; i < SCHED_SIZE; i++) {
        sched = &sched_list[i];
        if (!sched->is_run) {
            continue;
        }
        
        if (!(sched->repeat & day_mask)) {
            continue;
        }
        
        if (sched->hour >= now.tm_hour && sched->min >= now.tm_min) {
            sched->is_run = 1;
            
        }
    }
}