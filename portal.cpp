
/*
 *  @file: Portal.cpp
 *
 *  Created on:
 */

/******************************************************************************/

/******************************************************************************/
/*                              INCLUDE FILES                                 */
/******************************************************************************/
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "appconfig.h"
#include "log.h"
#include "WebServer.h"
#include "uri/UriBraces.h"
#include "uri/UriRegex.h"
#include "AutoConnect.h"
#include "AutoConnectCredential.h"
#include "webpage.h"
#include "portal.h"
#include "swdimmer.h"
/******************************************************************************/
/*                              TYPES and DEFINITIONS                         */
/******************************************************************************/
#define MSG_LEVEL_REPORT                           \
    "[{\"channel\": 0, \"level\": %d},{\"channel\": 1, \"level\": %d}]"

const char ROOT_PAGE[] PROGMEM =
    "<html>"
    "<head>"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
    "</head>"
    "<script type=\"text/javascript\">"
    "setTimeout(\"location.reload()\", 3000);"
    "</script>"
    "<body>"
    "<h2 align=\"center\" style=\"color:blue;margin:20px;\">~~~ Lamp ~~~</h2>"
    "<p></p><p style=\"padding-top:5px;text-align:center\">" AUTOCONNECT_LINK(COG_24) "</p>"
    "</body>"
    "</html>";
/******************************************************************************/
/*                              PRIVATE DATA                                  */
/******************************************************************************/
static WebServer server;
static AutoConnect portal(server);
static TaskHandle_t portal_task;
/******************************************************************************/
/*                              EXPORTED DATA                                 */
/******************************************************************************/

/******************************************************************************/
/*                                FUNCTIONS                                   */
/******************************************************************************/

void ota_start() {
    LOG_INFO("OTA Start updating");
}

void ota_end() {
    LOG_INFO("OTA End");
}

void ota_progress(unsigned int amount, unsigned int size) {
//    LOG_INFO("OTA Progress: %u(%u)\r", amount, size);
}

void ota_error(uint8_t error) {
    LOG_INFO("OTA Error[%u]: ", error);
}

void portal_rootpage() {
    server.send(200, "text/html", PAGE_INDEX);
}

void portal_swdimmerpage() {
    server.send(200, "text/plain", PAGE_SWDIMMER);
}

void portal_swdimmer_setlevel() {
    String strs[2];
    int count = 0;
    int channel = 0;
    int level = 0;
    String command = server.pathArg(0);
    server.send(200, "text/plain", "OK");

    while (command.length() > 0 && count < 2) {
        int index = command.indexOf('&');
        if (index == -1) {
            strs[count++] = command;
            break;
        }
        else {
            strs[count++] = command.substring(0, index);
            command = command.substring(index + 1);
        }
    }

    strs[0].replace("channel=", "");
    strs[1].replace("level=", "");

    channel = atoi(strs[0].c_str());
    level = atoi(strs[1].c_str());
    LOG_INFO(">> SET channel = %d, level = %d", channel, level);
    swdimmer_set_level(channel, level);
}

void portal_swdimmer_getlevel() {
    char swdimmer_level[64];

    sprintf(swdimmer_level, MSG_LEVEL_REPORT, swdimmer_get_level(LED_WW), swdimmer_get_level(LED_CW));
    server.send(200, "application/json", swdimmer_level);
}

void portal_handle(void *arg) {
    while (1) {
        portal.handleClient();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

void portal_init() {
    AutoConnectConfig config;

    String ext_ssid =  WiFi.macAddress();
    ext_ssid.replace(":", "");
    config.autoReconnect = true;
    config.apid = String(SOFT_AP_SSID) + String("_") + ext_ssid.substring(8);
    config.psk = "";
    config.apip.fromString(String(SOFT_AP_IP_ADDR));
    config.gateway.fromString(String(SOFT_AP_GATEWAY_IP_ADDR));
    config.hostName = String(HOST_NAME) + String("-") + ext_ssid.substring(8);
    config.ota = AC_OTA_BUILTIN;
    portal.config(config);
    portal.onOTAStart(ota_start);
    portal.onOTAEnd(ota_end);
    portal.onOTAProgress(ota_progress);
    portal.onOTAError(ota_error);
    server.on("/", portal_rootpage);
    server.on("/swdimmer.js", portal_swdimmerpage);
    server.on(UriBraces("/set/{}"), portal_swdimmer_setlevel);
    server.on("/getlevel", portal_swdimmer_getlevel);

    LOG_INFO("Creating portal and trying to connect...");
    // Establish a connection with an autoReconnect option.
    if (portal.begin()) {
        LOG_INFO("WiFi connected: %s", WiFi.localIP().toString().c_str());
    } 
    else {
        LOG_INFO("Connection failed: %s", WiFi.SSID().c_str());
    }

    xTaskCreatePinnedToCore(portal_handle,                /* Task function. */
                                "Portal",                /* name of task. */
                                8192,                    /* Stack size of task */
                                NULL,                    /* parameter of the task */
                                1,                       /* priority of the task */
                                &portal_task,            /* Task handle to keep track of created task */
                                1);                      /* pin task to core 0 */
}