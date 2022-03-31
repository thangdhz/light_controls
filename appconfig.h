#ifndef __APP_CONFIG_H
#define __APP_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif


#define ENABLE_DEBUG                               1               /**< Debug mode */


#define LOG_MODULE                                 "lamp"
#define LOG_LEVEL                                  4               /**< Log level */

#define HOST_NAME                                  "Lamp"
#define SOFT_AP_SSID                               "Lamp"          /**< Default SoftAP ssid */
#define SOFT_AP_PASSWD                             "12345678"      /**< Default SoftAP password */
#define SOFT_AP_IP_ADDR                            "10.10.0.1"     /**< Default SoftAP ip addr */
#define SOFT_AP_GATEWAY_IP_ADDR                    "10.10.0.1"     /**< Default SoftAP gateway ip addr */

#define LED_WW_PINOUT                              0
#define LED_CW_PINOUT                              2

#define LED_WW_CTRL_PINOUT                         15
#define LED_CW_CTRL_PINOUT                         13
#define LED_EN_CTRL_PINOUT                         4

#define SHTC3_SCL                                  23
#define SHTC3_SDA                                  22

#ifdef __cplusplus
}
#endif

#endif /* __APP_CONFIG_H */
