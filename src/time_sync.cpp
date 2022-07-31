/*
 *  time_sync.c
 *
 *  Created on: Nov 15, 2021
 */

/******************************************************************************/

/******************************************************************************/
/*                              INCLUDE FILES                                 */
/******************************************************************************/

#include <time.h>
#include <sys/time.h>
#include <esp_sntp.h>
#include <esp_attr.h>

#include "appconfig.h"
#include "log.h"
#include "time_sync.h"

/******************************************************************************/
/*                     EXPORTED TYPES and DEFINITIONS                         */
/******************************************************************************/
#define EPOCH_TIME_BEGINNING         1609502400 /* 12:00:00 1/1/2021 */
/******************************************************************************/
/*                              PRIVATE DATA                                  */
/******************************************************************************/

static uint32_t current_epoch_time = EPOCH_TIME_BEGINNING;

/******************************************************************************/
/*                              EXPORTED DATA                                 */
/******************************************************************************/

/******************************************************************************/
/*                                FUNCTIONS                                   */
/******************************************************************************/

static void timesync_notification_cb(struct timeval *tv);
static void time_sync_task(void* arg);

/******************************************************************************/

/**
 * @brief  Time sync callback
 */
static void timesync_notification_cb(struct timeval *tv)
{
    time_t now;
    struct tm timeinfo;

    time(&now);
    /* Check time is syns, 1609502400 12:00:00 1/1/2021 */
    if (now > EPOCH_TIME_BEGINNING)
    {
        current_epoch_time = now;
        localtime_r(&now, &timeinfo);
    }
    LOG_DBG("Sync time, epoch %lu", current_epoch_time);
}

/**
 * @brief  Time sync task
 */
static void time_sync_task(void* arg)
{
    while (1)
    {
        vTaskDelay(1000 / portTICK_RATE_MS);
        /* Increase epoch time */
        current_epoch_time++;
    }
    vTaskDelete(NULL);
}

/******************************************************************************/

/**
 * @brief  set timezone
 */
void timesync_set_timezone(const char* tz)
{
    setenv("TZ", tz, 1);
    tzset();
    LOG_DBG("Set timezone %s", tz);
}

/**
 * @brief  get epoch time
 */
uint32_t get_epoch_time(void)
{
    return current_epoch_time;
}

const char *get_str_time() {
    const int mul_tick = 1000 / configTICK_RATE_HZ;
    time_t      now = current_epoch_time;
    struct tm   ts;
    static char buf[64];
    uint32_t msec;
    int index;

    /* Format time, "yyyy-mm-dd hh:mm:ss.xxx" */
    ts = *localtime(&now);
    msec = mul_tick * xTaskGetTickCount() % 1000;
    index = strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &ts);
    sprintf(&buf[index], ".%03d", msec);

    return buf;
}

/**
 * @brief  init sntp for sync time
 */
void timesync_init(void)
{
    sntp_setoperatingmode(SNTP_OPMODE_POLL);
    sntp_setservername(0, "pool.ntp.org");
    sntp_set_time_sync_notification_cb(timesync_notification_cb);
    sntp_init();
    sntp_set_sync_interval(SYNC_TIME_INTERVAL);

    /* Creat sync time task */
    BaseType_t result = xTaskCreate(time_sync_task, 
                                    TIME_SYNC_TASK_NAME, 
                                    TIME_SYNC_TASK_SIZE,
                                    NULL, 
                                    TIME_SYNC_TASK_PRIORITY,
                                    NULL);
    if (result != pdPASS) {
        LOG_ERR("Create time sync task fail %d", result);
    }
}